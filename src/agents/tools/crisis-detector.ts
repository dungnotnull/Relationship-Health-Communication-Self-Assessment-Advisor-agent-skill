/**
 * Crisis / Violence Detector — Safety-Critical Component
 *
 * Wraps config/safety/guardrails crisis detection with a class API and
 * escalation tracking across conversation history.
 */

import {
  detectCrisis,
  CRISIS_KEYWORDS,
  SERIOUS_CONFLICT_INDICATORS,
} from '../../../config/safety/guardrails.js';

export interface CrisisAlert {
  detected: boolean;
  severity: 'severe' | 'moderate' | 'none';
  matched: string[];
  resources: string[];
}

const SEVERE_RESOURCES = [
  'US National Domestic Violence Hotline: 1-800-799-7233 or text START to 88788 (24/7)',
  'Emergency services: 911 (US/Canada), 112 (EU), 999 (UK)',
  'International directory: https://www.hotpeachpages.org/',
];

const MODERATE_RESOURCES = [
  'US National Domestic Violence Hotline: 1-800-799-7233 or text START to 88788',
  'Licensed couples counselor / marriage and family therapist',
  'International directory: https://www.hotpeachpages.org/',
];

export class CrisisDetector {
  detect(message: string): CrisisAlert {
    const r = detectCrisis(message);
    if (r.severity === 'severe') {
      return { detected: true, severity: 'severe', matched: r.matched, resources: SEVERE_RESOURCES };
    }
    if (r.severity === 'moderate') {
      return { detected: true, severity: 'moderate', matched: r.matched, resources: MODERATE_RESOURCES };
    }
    return { detected: false, severity: 'none', matched: [], resources: [] };
  }

  isEscalating(currentMessage: string, history: string[]): boolean {
    if (!history || history.length < 2) return false;
    const cur = this.score(currentMessage);
    const prev = history.slice(-3).map((m) => this.score(m));
    const avg = prev.reduce((a, b) => a + b, 0) / (prev.length || 1);
    return cur > avg * 1.5 && cur > 0;
  }

  private score(message: string): number {
    const r = detectCrisis(message);
    if (r.severity === 'severe') return 10;
    if (r.severity === 'moderate') return 5;
    return 0;
  }

  static keywordCatalog() {
    return { crisis: CRISIS_KEYWORDS, seriousConflict: SERIOUS_CONFLICT_INDICATORS };
  }
}

export { CRISIS_KEYWORDS, SERIOUS_CONFLICT_INDICATORS };
