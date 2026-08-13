/**
 * Hook Chain — Relationship Health Self-Assessment Advisor
 *
 * Defines the complete hook chain with ordering, priorities, and execution logic.
 * Hooks provide lifecycle management, state synchronization, event emission,
 * and the cross-cutting safety concerns (surveillance refusal, crisis surfacing,
 * diagnostic-language filtering, disclaimer injection, audit logging).
 */

import type {
  Hook,
  HookContext,
  HookResult,
  HookPhase,
  AgentState,
  Config,
} from '../schemas.js';
import {
  detectSurveillanceIntent,
  detectCrisis,
  DIAGNOSTIC_KEYWORDS,
} from '../safety/guardrails.js';

// ============================================================================
// HOOK IMPLEMENTATIONS
// ============================================================================

class BeforeRequestHook implements Hook {
  name = 'before_request';
  phase: HookPhase = 'before_request';
  priority = 10;

  async execute(context: HookContext): Promise<void> {
    const { input, agent_state } = context;
    agent_state.updated_at = new Date().toISOString();
    agent_state.conversation.turn_count += 1;
    const text = typeof input === 'string' ? input : JSON.stringify(input);
    agent_state.conversation.history.push({
      timestamp: new Date().toISOString(),
      user_input: text,
      skill_used: null,
      response_summary: '',
      crisis_detected: false,
      refusal_triggered: false,
    });
    context.agent_state = agent_state;
  }
}

class SurveillanceRefusalHook implements Hook {
  name = 'surveillance_refusal';
  phase: HookPhase = 'before_request';
  priority = 20;

  constructor(private config: Config) {}

  async execute(context: HookContext): Promise<HookResult> {
    if (!this.config.safety.refuse_one_sided_profiling) return { continue: true };
    const text = typeof context.input === 'string' ? context.input : JSON.stringify(context.input);
    const detection = detectSurveillanceIntent(text, this.config.safety.surveillance_detection_sensitivity);

    if (detection.detected) {
      context.agent_state.conversation.detected_surveillance_intent = true;
      context.agent_state.metrics.refusal_flags += 1;
      context.metadata['surveillance_detection'] = detection;

      if (detection.refusal_recommended) {
        return {
          continue: false,
          response: this.config.safety.refusal_template,
        };
      }
      // soft reframe: continue but flag for the skill to add a gentle reframe
      context.metadata['soft_reframe'] = true;
    }
    return { continue: true };
  }
}

class CrisisDetectionHook implements Hook {
  name = 'crisis_detection';
  phase: HookPhase = 'before_request';
  priority = 30;

  constructor(private config: Config) {}

  async execute(context: HookContext): Promise<HookResult> {
    const text = typeof context.input === 'string' ? context.input : JSON.stringify(context.input);
    const crisis = detectCrisis(text);
    if (crisis.detected) {
      context.agent_state.user_context.risk_level = 'crisis';
      context.agent_state.conversation.detected_crisis = true;
      context.agent_state.metrics.crisis_flags += 1;
      context.metadata['crisis'] = crisis;
      return {
        continue: false,
        response: this.crisisResponse(crisis.severity),
      };
    }
    return { continue: true };
  }

  private crisisResponse(severity: 'severe' | 'moderate' | 'none'): string {
    if (severity === 'severe') {
      return [
        '**Your safety comes first.**',
        '',
        'If you are afraid of your partner, are being hurt, or feel unsafe, please reach out right now:',
        '',
        '- **US National Domestic Violence Hotline:** Call 1-800-799-7233 or text START to 88788 (24/7, confidential).',
        '- **Emergency services:** Dial your local emergency number (911 in the US/Canada, 112 in the EU, 999 in the UK).',
        '- **International directory:** https://www.hotpeachpages.org/ (domestic-violence resources worldwide).',
        '',
        'You do not have to make any relationship decisions right now. Getting safe is the first step, and there are people who can help you.',
        '',
        '**Disclaimer:** This skill provides general, educational information only and is not a substitute for professional help.',
      ].join('\n');
    }
    return [
      '**Support is available.**',
      '',
      'What you are describing sounds serious. You do not have to handle it alone:',
      '',
      '- **US National Domestic Violence Hotline:** 1-800-799-7233 or text START to 88788.',
      '- **Couples counseling:** a licensed marriage and family therapist (MFT) or couples counselor can help.',
      '- **International:** https://www.hotpeachpages.org/',
      '',
      '**Disclaimer:** This skill provides general, educational information only.',
    ].join('\n');
  }
}

class DiagnosticFilterHook implements Hook {
  name = 'diagnostic_filter';
  phase: HookPhase = 'before_request';
  priority = 40;

  constructor(private config: Config) {}

  async execute(context: HookContext): Promise<void> {
    if (!this.config.safety.diagnostic_filtering) return;
    const text = typeof context.input === 'string' ? context.input : JSON.stringify(context.input).toLowerCase();
    const hit = DIAGNOSTIC_KEYWORDS.find((k) => text.includes(k));
    if (hit) {
      context.metadata['diagnostic_language'] = hit;
    }
  }
}

class AfterRoutingHook implements Hook {
  name = 'after_routing';
  phase: HookPhase = 'after_routing';
  priority = 10;

  async execute(context: HookContext): Promise<void> {
    const skill = context.metadata['selected_skill'];
    context.agent_state.conversation.last_skill_used = typeof skill === 'string' ? skill : null;
  }
}

class BeforeExecutionHook implements Hook {
  name = 'before_execution';
  phase: HookPhase = 'before_execution';
  priority = 10;

  async execute(_context: HookContext): Promise<void> {
    // Reference loading / context preparation would happen here.
  }
}

class AfterExecutionHook implements Hook {
  name = 'after_execution';
  phase: HookPhase = 'after_execution';
  priority = 10;

  constructor(private config: Config) {}

  async execute(context: HookContext): Promise<void> {
    const out = typeof context.output === 'string' ? context.output : JSON.stringify(context.output ?? '');
    context.agent_state.metrics.tokens_used += (context.metadata['tokens_used'] as number) || 0;
    context.agent_state.metrics.execution_time_ms += (context.metadata['execution_time_ms'] as number) || 0;

    if (this.config.safety.required_disclaimer && typeof context.output === 'string') {
      if (!context.output.includes('**Disclaimer:**')) {
        context.output = context.output + '\n\n' + this.config.safety.disclaimer_template;
      }
    }
    // record response summary
    const last = context.agent_state.conversation.history[context.agent_state.conversation.history.length - 1];
    if (last) {
      last.skill_used = (context.metadata['selected_skill'] as string) || null;
      last.response_summary = out.slice(0, 200);
    }
  }
}

class OnErrorHook implements Hook {
  name = 'on_error';
  phase: HookPhase = 'on_error';
  priority = 10;

  async execute(context: HookContext): Promise<HookResult> {
    context.agent_state.metrics.error_count += 1;
    // graceful fallback
    return {
      continue: false,
      response: [
        '**Apologies — I’m having trouble processing that right now.**',
        '',
        'Please try again in a moment.',
        '',
        'If you were asking about a serious relationship concern, consider reaching out to a licensed couples counselor or marriage and family therapist. If you feel unsafe, contact a domestic-violence hotline or emergency services.',
        '',
        '**Disclaimer:** This skill provides general, educational information only and is not a substitute for professional advice.',
      ].join('\n'),
    };
  }
}

class OnRefusalHook implements Hook {
  name = 'on_refusal';
  phase: HookPhase = 'on_refusal';
  priority = 10;

  async execute(_context: HookContext): Promise<void> {
    // audit marker only
  }
}

class OnCrisisDetectedHook implements Hook {
  name = 'on_crisis_detected';
  phase: HookPhase = 'on_crisis_detected';
  priority = 10;

  async execute(context: HookContext): Promise<void> {
    context.agent_state.user_context.risk_level = 'crisis';
  }
}

// ============================================================================
// HOOK CHAIN ASSEMBLY
// ============================================================================

export function createHookChain(config: Config): Hook[] {
  return [
    new BeforeRequestHook(),
    new SurveillanceRefusalHook(config),
    new CrisisDetectionHook(config),
    new DiagnosticFilterHook(config),
    new AfterRoutingHook(),
    new BeforeExecutionHook(),
    new AfterExecutionHook(config),
    new OnErrorHook(),
    new OnRefusalHook(),
    new OnCrisisDetectedHook(),
  ];
}

export class HookChainExecutor {
  private hooks: Map<HookPhase, Hook[]> = new Map();

  constructor(hooks: Hook[]) {
    for (const hook of hooks) {
      const list = this.hooks.get(hook.phase) || [];
      list.push(hook);
      this.hooks.set(hook.phase, list);
    }
    for (const [, list] of this.hooks.entries()) {
      list.sort((a, b) => a.priority - b.priority);
    }
  }

  async executePhase(phase: HookPhase, context: HookContext): Promise<HookResult | null> {
    const list = this.hooks.get(phase) || [];
    for (const hook of list) {
      try {
        const result = await hook.execute(context);
        if (result && result.continue === false) {
          return result;
        }
      } catch (err) {
        // continue chain on hook failure; log via metadata
        context.metadata['hook_error_' + hook.name] = String(err);
      }
    }
    return null;
  }

  getHooks(): Map<HookPhase, Hook[]> {
    return this.hooks;
  }
}

export {
  BeforeRequestHook,
  SurveillanceRefusalHook,
  CrisisDetectionHook,
  DiagnosticFilterHook,
  AfterRoutingHook,
  BeforeExecutionHook,
  AfterExecutionHook,
  OnErrorHook,
  OnRefusalHook,
  OnCrisisDetectedHook,
};
