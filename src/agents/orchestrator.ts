/**
 * Agent Orchestrator — Main Request Processing
 *
 * Coordinates the chain-of-thought router, the hook chain, the skill handlers,
 * and the tool registry. Produces a complete, disclaimer-bearing response
 * with full routing trace and metadata for auditability.
 */

import { ChainOfThoughtRouter, type RoutingDecision } from './router.js';
import { getHandler, type HandlerContext, EXERCISES } from './skills/registry.js';
import { getSkillById, SKILL_REGISTRY } from '../../config/skills/registry.js';
import { SurveillanceDetector } from './tools/surveillance-detector.js';
import { CrisisDetector } from './tools/crisis-detector.js';
import { createHookChain, HookChainExecutor } from '../../config/hooks/chain.js';
import { getConfig } from '../../config/config.js';
import { LLMClient } from '../llm/client.js';
import { buildPrompt } from '../llm/prompt-builder.js';
import { validateLLMOutput } from '../llm/post-validator.js';
import { StructuredLogger } from '../../config/observability/logger.js';
import { getMetrics } from '../../config/observability/metrics.js';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { getToolRegistry } from '../../config/tools/registry.js';
import { detectCulturalDimensions, getCulturalNotes, getReferralNotes } from '../../config/cultural/adaptations.js';
import type { Config, AgentState, Hook } from '../../config/schemas.js';

// ============================================================================
// REQUEST / RESPONSE
// ============================================================================

export interface AgentRequest {
  userId: string;
  sessionId: string;
  message: string;
  conversationHistory?: ConversationMessage[];
  userContext?: { locale?: string; timezone?: string };
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AgentResponse {
  message: string;
  metadata: {
    skill: string;
    refusal: boolean;
    crisis: { detected: boolean; severity: 'severe' | 'moderate' | 'none' };
    culturalNotes: string[];
    routingTrace: string;
    toolsAvailable: string[];
    processingTimeMs: number;
    llm?: { used: boolean; provider?: string; attempts?: number; latency_ms?: number; post_validation_valid?: boolean; fallback_used?: boolean; failure_reason?: string };
  };
  suggestions?: string[];
}

// ============================================================================
// ORCHESTRATOR
// ============================================================================

export class AgentOrchestrator {
  private router: ChainOfThoughtRouter;
  private hooks: Hook[];
  private hookExecutor: HookChainExecutor;
  private surveillance: SurveillanceDetector;
  private crisis: CrisisDetector;
  private config: Config;
  private logger: StructuredLogger;
  private llmClient: LLMClient | null;

  constructor(config?: Config) {
    this.config = config || getConfig();
    this.router = new ChainOfThoughtRouter(this.config);
    this.hooks = createHookChain(this.config);
    this.hookExecutor = new HookChainExecutor(this.hooks);
    this.surveillance = new SurveillanceDetector(this.config.safety.surveillance_detection_sensitivity);
    this.crisis = new CrisisDetector();
    this.logger = new StructuredLogger(this.config.observability);
    this.llmClient = null;
    if (this.config.features.enable_llm) {
      try { this.llmClient = new LLMClient(this.config, this.logger); } catch (e) { this.logger.error('LLM client init failed', e as Error); this.llmClient = null; }
    }
  }

  async processRequest(request: AgentRequest): Promise<AgentResponse> {
    const start = Date.now();
    const agentState = this.freshState(request);

    // before_request hook chain (surveillance refusal + crisis + diagnostic filter)
    const beforeCtx = {
      phase: 'before_request' as const,
      session_id: request.sessionId,
      timestamp: new Date().toISOString(),
      input: request.message,
      metadata: {},
      agent_state: agentState,
    };
    const beforeResult = await this.hookExecutor.executePhase('before_request', beforeCtx);

    if (beforeResult && beforeResult.continue === false && beforeResult.response) {
      // Refusal or crisis response short-circuits.
      const decision = this.router.route(request.message);
      return this.buildResponse(String(beforeResult.response), decision, agentState, start, request);
    }

    // Route.
    const decision = this.router.route(request.message);

    // after_routing hook
    const routingCtx = { ...beforeCtx, phase: 'after_routing' as const, metadata: { selected_skill: decision.skillId } };
    await this.hookExecutor.executePhase('after_routing', routingCtx);

    // Execute skill handler.
    const handlerCtx: HandlerContext = {
      session_id: request.sessionId,
      refusal: decision.refusal,
      crisisSeverity: decision.crisis.severity,
      culturalAdaptations: getCulturalNotes(decision.cultural),
    };
    const handler = getHandler(decision.skillId) || getHandler('satisfaction-reflection')!;
    let message: string;
    try {
      message = handler(request.message, handlerCtx);
    } catch (err) {
      // on_error hook → fallback
      const errCtx = { ...beforeCtx, phase: 'on_error' as const, error: err as Error };
      const errResult = await this.hookExecutor.executePhase('on_error', errCtx);
      message = (errResult && errResult.response ? String(errResult.response) : handlerCtx ? getHandler('safety-router')!(request.message, handlerCtx) : '') || 'I could not process that request.';
    }

    // --- Optional real-LLM augmentation (graceful degradation) ---
    let llmMeta: AgentResponse['metadata']['llm'] = { used: false };
    if (this.llmClient) {
      const llmResult = await this.maybeInvokeLLM(decision.skillId, request, message, agentState);
      if (llmResult) {
        message = llmResult.content;
        llmMeta = llmResult.meta;
      }
    }

    // after_execution hook (disclaimer injection handled in handler; this hook
    // records metrics and validates disclaimer presence).
    const afterCtx = {
      ...beforeCtx,
      phase: 'after_execution' as const,
      output: message,
      metadata: { selected_skill: decision.skillId, execution_time_ms: Date.now() - start, tokens_used: 0, requires_disclaimer: this.config.safety.required_disclaimer },
    };
    await this.hookExecutor.executePhase('after_execution', afterCtx);
    if (typeof afterCtx.output === 'string') message = afterCtx.output;

    return this.buildResponse(message, decision, agentState, start, request, llmMeta);
  }

  private buildResponse(
    message: string,
    decision: RoutingDecision,
    _state: AgentState,
    start: number,
    _request: AgentRequest,
    llmMeta?: AgentResponse['metadata']['llm']
  ): AgentResponse {
    const toolsAvailable = getToolRegistry().list().map((t) => t.id);
    const suggestions = this.suggestionsFor(decision.skillId);
    return {
      message,
      metadata: {
        skill: decision.skillId,
        refusal: decision.refusal,
        crisis: decision.crisis,
        culturalNotes: getCulturalNotes(decision.cultural),
        routingTrace: this.router.formatTrace(decision),
        toolsAvailable,
        processingTimeMs: Date.now() - start,
        llm: llmMeta || { used: false },
      },
      suggestions,
    };
  }

  // skill -> reference file mapping for LLM context grounding
  private static SKILL_REFERENCES: Record<string, { framework?: string; prompt?: string }> = {
    'satisfaction-reflection': { framework: 'references/frameworks/gottman-sound-relationship-house.md', prompt: 'references/prompts/relationship-satisfaction-self-reflection.md' },
    'four-horsemen-education': { framework: 'references/frameworks/four-horsemen.md', prompt: 'references/prompts/four-horsemen-exercises.md' },
    'communication-exercise-advisor': { framework: 'references/frameworks/gottman-sound-relationship-house.md', prompt: 'references/prompts/relationship-satisfaction-self-reflection.md' },
    'attachment-reflection': { framework: 'references/frameworks/attachment-theory.md', prompt: 'references/prompts/attachment-reflection.md' },
    'commitment-reflection': { framework: 'references/frameworks/investment-model.md', prompt: 'references/prompts/investment-model-exercise.md' },
    'acr-coach': { framework: 'references/frameworks/active-constructive-responding.md', prompt: 'references/prompts/acr-exercises.md' },
    'referral-advisor': { framework: 'references/safety/referral-guidance.md' },
    'safety-router': { framework: 'references/safety/surveillance-refusal.md' },
  };

  private loadReferenceContext(rel: { framework?: string; prompt?: string }): { frameworkRef?: string; promptRef?: string; safetyRef?: string } {
    const root = process.cwd();
    const read = (p?: string): string | undefined => {
      if (!p) return undefined;
      const full = join(root, p);
      try { return existsSync(full) ? readFileSync(full, 'utf8') : undefined; } catch { return undefined; }
    };
    return {
      frameworkRef: read(rel.framework),
      promptRef: read(rel.prompt),
      safetyRef: read('references/safety/disclaimers.md'),
    };
  }

  /**
   * Optional real-LLM augmentation. On any failure (LLM error, timeout,
   * post-validation failure) the orchestrator keeps the deterministic handler
   * output, so guardrails are preserved regardless of model behaviour.
   * Returns null when the deterministic fallback should be used unchanged.
   */
  private async maybeInvokeLLM(
    skillId: string,
    request: AgentRequest,
    fallbackResponse: string,
    _state: AgentState
  ): Promise<{ content: string; meta: AgentResponse['metadata']['llm'] } | null> {
    if (!this.llmClient) return null;
    const metrics = getMetrics();
    const rel = AgentOrchestrator.SKILL_REFERENCES[skillId] || {};
    const refs = this.loadReferenceContext(rel);
    const skillDef = getSkillById(skillId) || SKILL_REGISTRY['satisfaction-reflection'];
    const messages = buildPrompt({
      skill: skillDef,
      userMessage: request.message,
      fallbackResponse,
      frameworkRef: refs.frameworkRef,
      promptRef: refs.promptRef,
      safetyRef: refs.safetyRef,
      maxContextTokens: this.config.features.llm_max_context_tokens,
    });
    try {
      const llmRes = await this.llmClient.invoke({
        messages,
        max_tokens: this.config.model.max_tokens,
        temperature: this.config.model.temperature,
        timeout_ms: this.config.model.timeout_ms,
        metadata: { session_id: request.sessionId, skill: skillId, phase: 'llm' },
        fallback_text: fallbackResponse,
      });
      const validation = validateLLMOutput(llmRes.content, {
        strict: this.config.features.llm_strict_post_validation,
        requireDisclaimer: this.config.safety.required_disclaimer,
      });
      metrics.inc('llm.post_validation.' + (validation.valid ? 'pass' : 'fail'));
      if (!validation.valid) {
        this.logger.audit('llm_post_validation_failed', request.sessionId, { skill: skillId, reasons: validation.reasons });
        return {
          content: fallbackResponse,
          meta: { used: true, provider: String(llmRes.provider), attempts: llmRes.attempts, latency_ms: llmRes.latency_ms, post_validation_valid: false, fallback_used: true, failure_reason: validation.reasons.join('; ') },
        };
      }
      this.logger.audit('llm_response_accepted', request.sessionId, { skill: skillId, provider: llmRes.provider, latency_ms: llmRes.latency_ms });
      return {
        content: validation.cleaned,
        meta: { used: true, provider: String(llmRes.provider), attempts: llmRes.attempts, latency_ms: llmRes.latency_ms, post_validation_valid: true, fallback_used: false },
      };
    } catch (e) {
      this.logger.error('LLM invocation failed; using deterministic fallback', e as Error, { skill: skillId, session_id: request.sessionId });
      metrics.inc('llm.fallback_on_error');
      return null;
    }
  }
  private suggestionsFor(skillId: string): string[] {
    switch (skillId) {
      case 'satisfaction-reflection':
        return ['Run the Sound Relationship House self-check', 'Try the Love Maps interview', 'Practice an Appreciation ritual'];
      case 'four-horsemen-education':
        return ['Take the Four Horsemen self-check', 'Practice a gentle startup', 'Practice a repair attempt'];
      case 'communication-exercise-advisor':
        return Object.keys(EXERCISES).map((k) => 'Try the ' + EXERCISES[k].name);
      case 'attachment-reflection':
        return ['Try the attachment reflection prompts', 'Ask about Emotionally Focused Therapy'];
      case 'commitment-reflection':
        return ['Take the Commitment & Investment reflection', 'Try the investment-inventory exercise'];
      case 'acr-coach':
        return ['Take the ACR self-check', 'Practice active-constructive responding'];
      case 'referral-advisor':
        return ['Ask how to find a culturally matched therapist', 'Learn about EFT vs Gottman Method'];
      case 'safety-router':
      default:
        return ['Ask for a mutual relationship-satisfaction self-reflection', 'Learn the Four Horsemen and their antidotes'];
    }
  }

  private freshState(request: AgentRequest): AgentState {
    return {
      session_id: request.sessionId,
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_context: {
        locale: request.userContext?.locale || 'en-US',
        timezone: request.userContext?.timezone || 'UTC',
        risk_level: 'none',
        consent_mode: 'unknown',
        serious_conflict_indicators: false,
      },
      conversation: {
        turn_count: 0,
        last_skill_used: null,
        detected_crisis: false,
        detected_surveillance_intent: false,
        history: [],
      },
      metrics: { tokens_used: 0, execution_time_ms: 0, error_count: 0, crisis_flags: 0, refusal_flags: 0 },
    };
  }
}

export { SurveillanceDetector, CrisisDetector, getReferralNotes };
