/**
 * Surveillance Intent Detector — Safety-Critical Component
 *
 * Wraps config/safety/guardrails surveillance detection with a class API and
 * severity scoring, so the orchestrator and hooks can call it consistently.
 */

import {
  detectSurveillanceIntent,
  SURVEILLANCE_INTENT_PHRASES,
  SOFT_PROFILING_PHRASES,
  MUTUAL_PARTICIPATION_CUES,
  type SurveillanceSensitivity,
  type SurveillanceDetection,
} from '../../../config/safety/guardrails.js';

export class SurveillanceDetector {
  private sensitivity: SurveillanceSensitivity;

  constructor(sensitivity: SurveillanceSensitivity = 'strict') {
    this.sensitivity = sensitivity;
  }

  detect(message: string): SurveillanceDetection {
    return detectSurveillanceIntent(message, this.sensitivity);
  }

  severityScore(message: string): number {
    const d = this.detect(message);
    if (!d.detected) return 0;
    if (d.severity === 'hard') return 10;
    if (d.severity === 'soft') return 5;
    return 0;
  }

  isOneSided(message: string): boolean {
    return this.detect(message).refusal_recommended;
  }

  static phraseCatalog() {
    return {
      hard: SURVEILLANCE_INTENT_PHRASES,
      soft: SOFT_PROFILING_PHRASES,
      mutual_cues: MUTUAL_PARTICIPATION_CUES,
    };
  }
}

export { SURVEILLANCE_INTENT_PHRASES, SOFT_PROFILING_PHRASES, MUTUAL_PARTICIPATION_CUES };
