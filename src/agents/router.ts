/**
 * Chain-of-Thought Router — Relationship Health Self-Assessment Advisor
 *
 * Lightweight, deterministic router that mirrors an explicit reasoning chain:
 *   1. Safety-first triage (surveillance/profiling → refusal; violence → crisis)
 *   2. Cultural dimension detection (collectivist / faith / high-context / migrant)
 *   3. Skill resolution by longest-matching trigger phrase (specificity wins)
 *   4. Conflict resolution by framework priority
 *
 * The router is intentionally transparent: each decision is recorded in
 * `RoutingTrace` so the orchestrator can expose the reasoning to the caller
 * for auditability, matching the "name the framework you're using" norm.
 */

import { SKILL_REGISTRY, findSkillByTrigger, getSkillById, type SkillDefinition } from '../../config/skills/registry.js';
import { detectSurveillanceIntent, detectCrisis, type SurveillanceSensitivity } from '../../config/safety/guardrails.js';
import { detectCulturalDimensions, type CulturalDetection } from '../../config/cultural/adaptations.js';
import type { Config } from '../../config/schemas.js';

// ============================================================================
// TRACE TYPES
// ============================================================================

export interface RoutingStep {
  step: string;
  input?: unknown;
  result: string;
  action?: string;
}

export interface RoutingDecision {
  skillId: string;
  skill: SkillDefinition | null;
  refusal: boolean;
  crisis: { detected: boolean; severity: 'severe' | 'moderate' | 'none' };
  cultural: CulturalDetection;
  trace: RoutingStep[];
}

// ============================================================================
// ROUTER
// ============================================================================

export class ChainOfThoughtRouter {
  constructor(private config: Config) {}

  route(message: string): RoutingDecision {
    const trace: RoutingStep[] = [];
    const sensitivity: SurveillanceSensitivity = this.config.safety.surveillance_detection_sensitivity;

    // --- Step 1: surveillance / one-sided profiling triage ---
    const surv = detectSurveillanceIntent(message, sensitivity);
    trace.push({
      step: 'surveillance_triage',
      input: { sensitivity, matched: surv.matched_phrases },
      result: surv.detected ? ('detected:' + surv.severity) : 'none',
      action: surv.refusal_recommended ? 'refuse + reframe' : surv.detected ? 'soft reframe' : 'continue',
    });

    // --- Step 2: crisis / violence triage ---
    const crisis = detectCrisis(message);
    trace.push({
      step: 'crisis_triage',
      input: { matched: crisis.matched },
      result: crisis.detected ? ('detected:' + crisis.severity) : 'none',
      action: crisis.severity === 'severe' ? 'surface crisis resources' : crisis.detected ? 'attach referral' : 'continue',
    });

    // --- Step 3: cultural dimension detection ---
    const cultural = detectCulturalDimensions(message);
    trace.push({
      step: 'cultural_detection',
      input: { matched: cultural.matched },
      result: cultural.adaptations.length > 0 ? cultural.adaptations.map((a) => a.id).join(',') : 'none',
      action: cultural.adaptations.length > 0 ? 'apply framing adjustments' : 'continue',
    });

    // --- Step 4: skill resolution ---
    // Crisis severe and surveillance-with-refusal short-circuit to safety-router.
    if (surv.refusal_recommended || crisis.severity === 'severe') {
      const skill = getSkillById('safety-router');
      trace.push({
        step: 'skill_resolution',
        result: 'safety-router',
        action: 'override (safety-first)',
      });
      return {
        skillId: 'safety-router',
        skill,
        refusal: surv.refusal_recommended,
        crisis: { detected: crisis.detected, severity: crisis.severity },
        cultural,
        trace,
      };
    }

    const compactSkill = this.detectCompactAssessment(message);
    let matched: SkillDefinition | null = null;
    let skillId: string;
    let skill: SkillDefinition;
    if (compactSkill) {
      skillId = compactSkill;
      skill = SKILL_REGISTRY[compactSkill];
    } else {
      matched = findSkillByTrigger(message);
      skillId = matched ? matched.id : 'satisfaction-reflection';
      skill = matched || SKILL_REGISTRY['satisfaction-reflection'];
    }

    // Soft profiling intent (no hard refusal) routes to satisfaction-reflection
    // but with a soft reframe marker (no one-sided profiling content).
    if (surv.detected && !surv.refusal_recommended && skill.id === 'safety-router') {
      skillId = 'satisfaction-reflection';
      skill = SKILL_REGISTRY['satisfaction-reflection'];
    }

    // Serious conflict indicators (without violence) route to referral-advisor
    // in addition to whatever skill matched — handled in orchestrator.
    trace.push({
      step: 'skill_resolution',
      input: { matched: matched ? matched.id : null },
      result: skillId,
      action: 'route',
    });

    // --- Step 5: conflict resolution (priority by framework specificity) ---
    trace.push({
      step: 'conflict_resolution',
      result: skillId,
      action: 'specificity-wins; tie-break by framework order',
    });

    return {
      skillId,
      skill,
      refusal: surv.refusal_recommended,
      crisis: { detected: crisis.detected, severity: crisis.severity },
      cultural,
      trace,
    };
  }

  /**
   * Detect compact assessment response forms (e.g. "fh1=2,fh2=1,...") and
   * route directly to the owning skill so the handler can score them.
   */
  private detectCompactAssessment(message: string): string | null {
    const m = message.toLowerCase();
    if (/\bsrh\d+\s*=/.test(m)) return 'satisfaction-reflection';
    if (/\bfh\d+\s*=/.test(m)) return 'four-horsemen-education';
    if (/\bim\d+\s*=/.test(m)) return 'commitment-reflection';
    if (/\bacr\d+\s*=/.test(m)) return 'acr-coach';
    return null;
  }
  /** Human-readable trace for transparency / debugging. */
  formatTrace(d: RoutingDecision): string {
    return d.trace.map((t) => '[' + t.step + '] ' + t.result + (t.action ? ' -> ' + t.action : '')).join('\n');
  }
}
