/**
 * Safety Guardrails — Relationship Health Self-Assessment Advisor
 *
 * Central catalog of surveillance-intent keywords, refusal logic thresholds,
 * crisis/violence referral triggers, and non-surveillance consent framing.
 * Used by the safety router tool and the before_request hook.
 */

// ============================================================================
// SURVEILLANCE / ONE-SIDED PROFILING INTENT
// ============================================================================

/**
 * Phrases that indicate a request to assess, profile, surveil, or predict a
 * specific partner WITHOUT their mutual participation. These trigger refusal
 * + reframe, regardless of sensitivity setting.
 *
 * Kept deliberately broad (substrings matched case-insensitively) because the
 * harm surface here is the core guardrail of this skill.
 */
export const SURVEILLANCE_INTENT_PHRASES: string[] = [
  // Fidelity / infidelity prediction
  'is my partner cheating',
  'is she cheating',
  'is he cheating',
  'is my wife cheating',
  'is my husband cheating',
  'is my girlfriend cheating',
  'is my boyfriend cheating',
  'signs my partner is cheating',
  'signs of infidelity',
  'catch my partner cheating',
  'catch a cheater',
  'is my partner faithful',
  'will my partner cheat',
  'predict if partner will cheat',
  'is my partner lying about',
  'is my partner hiding',
  // Intentions / leaving prediction
  'will my partner leave me',
  'is my partner going to leave',
  'will my husband leave',
  'will my wife leave',
  'does my partner want to leave',
  'does my partner still love me',
  'predict divorce',
  'predict if we will divorce',
  'will we get divorced',
  'will we divorce',
  'will my marriage last',
  'will our marriage last',
  'will our relationship last',
  'predict whether we will',
  'divorce prediction',
  'divorce risk score',
  'divorce probability',
  'chance of divorce',
  'likelihood my marriage will fail',
  // Surveillance / monitoring
  'track my partner',
  'monitor my partner',
  'spy on my partner',
  'surveil my partner',
  'check my partner phone',
  'read my partner messages',
  'secretly check',
  'without them knowing',
  'without my partner knowing',
  'behind their back',
  'behind my partner back',
  'hidden camera',
  'gps tracker on partner',
  'keylogger',
  'hire a private investigator',
  // Profiling / mind-reading a third party
  'profile my partner',
  'analyze my partner personality',
  'what is my partner really thinking',
  'what does my partner really want',
  'is my partner manipulating me',
  'is my partner a narcissist',
  'is my partner toxic',
  'is my partner gaslighting',
  'rate my partner',
  'score my partner',
];

/**
 * Softer phrases that, when combined with a named third party and absence of
 * mutual-participation cues, should escalate to a soft reframe rather than a
 * hard refusal. Used at 'moderate' / 'permissive' sensitivity.
 */
export const SOFT_PROFILING_PHRASES: string[] = [
  'is my partner happy',
  'does my partner love me',
  'does my partner care',
  'is my partner attracted to me',
  'is my partner pulling away',
  'is my partner distant',
];

/**
 * Cues that the request is actually MUTUAL / self-reflective (not surveillance).
 * Presence of these downweights the surveillance signal toward a soft reframe.
 */
export const MUTUAL_PARTICIPATION_CUES: string[] = [
  'we want to',
  'we are trying to',
  'together we',
  'my partner and i',
  'as a couple',
  'our relationship',
  'we both',
  'how can we',
  'how should we',
  'help us',
  'our communication',
  'we argue',
  'we fight',
  'we disagree',
];

// ============================================================================
// CRISIS / VIOLENCE REFERRAL TRIGGERS
// ============================================================================

/**
 * Indicators of intimate-partner violence, abuse, or acute safety risk.
 * These bypass normal routing and surface immediate professional resources.
 */
export const CRISIS_KEYWORDS: string[] = [
  'abuse',
  'abused',
  'domestic violence',
  'intimate partner violence',
  'afraid of my partner',
  'scared of my partner',
  'fear my partner',
  'hit me',
  'hits me',
  'hurt me',
  'choked me',
  'strangled me',
  'threaten',
  'threatened me',
  'threatened to hurt',
  'controlling',
  'controls me',
  'isolates me',
  'unsafe',
  'in danger',
  'forced me',
  'nonconsensual',
  'stalk',
  'stalking',
];

/**
 * Serious-conflict indicators that do NOT imply violence but warrant a
 * professional-referral recommendation attached to the normal response.
 */
export const SERIOUS_CONFLICT_INDICATORS: string[] = [
  'contempt',
  'constant criticism',
  'stonewalling',
  'we never talk anymore',
  'thinking about divorce',
  'thinking about leaving',
  ' affair',
  'betrayal',
  'broken trust',
  'emotional affair',
  'separation',
  'silent treatment',
  'yelling',
  'screaming matches',
  'withdrawal',
  'resentment',
];

// ============================================================================
// NON-DIAGNOSTIC LANGUAGE FILTER
// ============================================================================

/**
 * Clinical/diagnostic terms that should be reframed to non-clinical,
 * educational language in responses. The skill must not diagnose partners.
 */
export const DIAGNOSTIC_KEYWORDS: string[] = [
  'diagnos',
  'disorder',
  'pathology',
  'clinical condition',
  'personality disorder',
  'narcissist',
  'psychopath',
  'sociopath',
  'bipolar',
  'borderline',
  'treatment for',
  'therapy for my partner',
  'medication for',
];

// ============================================================================
// SENSITIVITY RESOLUTION
// ============================================================================

export type SurveillanceSensitivity = 'strict' | 'moderate' | 'permissive';

export interface SurveillanceDetection {
  detected: boolean;
  severity: 'hard' | 'soft' | 'none';
  matched_phrases: string[];
  mutual_cues_present: boolean;
  refusal_recommended: boolean;
  confidence: number;
}

/**
 * Evaluate a message for one-sided surveillance/profiling intent.
 * Deterministic, dependency-free, safe to run on every request.
 */
export function detectSurveillanceIntent(
  message: string,
  sensitivity: SurveillanceSensitivity = 'strict'
): SurveillanceDetection {
  const text = message.toLowerCase();
  const matched: string[] = [];

  for (const phrase of SURVEILLANCE_INTENT_PHRASES) {
    if (text.includes(phrase)) matched.push(phrase);
  }

  const mutual_cues_present = MUTUAL_PARTICIPATION_CUES.some((cue) => text.includes(cue));

  let soft_matched: string[] = [];
  if (sensitivity !== 'strict') {
    soft_matched = SOFT_PROFILING_PHRASES.filter((p) => text.includes(p));
  }

  // Hard phrases always signal surveillance intent unless strong mutual framing.
  if (matched.length > 0) {
    // If the message clearly frames a mutual activity, downgrade to soft reframe.
    const hardRefusal = !mutual_cues_present || matched.length >= 2;
    return {
      detected: true,
      severity: hardRefusal ? 'hard' : 'soft',
      matched_phrases: matched,
      mutual_cues_present,
      refusal_recommended: hardRefusal,
      confidence: Math.min(1, 0.6 + matched.length * 0.15),
    };
  }

  if (soft_matched.length > 0 && sensitivity !== 'strict') {
    return {
      detected: true,
      severity: 'soft',
      matched_phrases: soft_matched,
      mutual_cues_present,
      refusal_recommended: false,
      confidence: 0.55,
    };
  }

  return {
    detected: false,
    severity: 'none',
    matched_phrases: [],
    mutual_cues_present,
    refusal_recommended: false,
    confidence: 0,
  };
}

/**
 * Evaluate a message for crisis/violence indicators.
 */
export function detectCrisis(message: string): {
  detected: boolean;
  matched: string[];
  severity: 'severe' | 'moderate' | 'none';
} {
  const text = message.toLowerCase();
  const matched = CRISIS_KEYWORDS.filter((k) => text.includes(k));
  if (matched.length > 0) {
    return { detected: true, matched, severity: 'severe' };
  }
  const serious = SERIOUS_CONFLICT_INDICATORS.filter((k) => text.includes(k));
  if (serious.length >= 2) {
    return { detected: true, matched: serious, severity: 'moderate' };
  }
  return { detected: false, matched: [], severity: 'none' };
}

