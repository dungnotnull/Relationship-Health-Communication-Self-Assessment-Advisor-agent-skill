/**
 * Assessments Registry — Relationship Self-Reflection Instruments
 *
 * Defines the structured self-reflection instruments the skill administers,
 * with scoring, banding, and interpretation. All instruments are framed as
 * MUTUAL self-reflection; none diagnose, predict fidelity, or forecast
 * individual divorce.
 */

// ============================================================================
// TYPES
// ============================================================================

export type AssessmentId =
  | 'sound-relationship-house-check'
  | 'four-horsemen-self-check'
  | 'commitment-investment-reflection'
  | 'acr-capitalization-check';

export interface AssessmentItem {
  id: string;
  prompt: string;
  // 1 = strongly disagree / rarely ... 5 = strongly agree / almost always
  scale: { min: number; max: number; low_label: string; high_label: string };
  // For some instruments, lower score is better (e.g., four-horsemen frequency).
  direction: 'higher-better' | 'lower-better';
  domain: string;
}

export interface AssessmentDefinition {
  id: AssessmentId;
  name: string;
  description: string;
  framework: string;
  mutual_use_note: string;
  items: AssessmentItem[];
  // Bands keyed by raw summed score (after direction normalization).
  bands: { min: number; max: number; label: string; interpretation: string; suggested_action: string }[];
}

export interface AssessmentResult {
  assessment_id: AssessmentId;
  raw_score: number;
  normalized_score: number; // 0-100, direction-corrected so higher always = healthier
  band_label: string;
  interpretation: string;
  suggested_action: string;
  domain_scores: Record<string, { raw: number; normalized: number }>;
  referral_recommended: boolean;
}

// ============================================================================
// INSTRUMENT DEFINITIONS
// ============================================================================

export const SOUND_RELATIONSHIP_HOUSE_CHECK: AssessmentDefinition = {
  id: 'sound-relationship-house-check',
  name: 'Sound Relationship House Self-Check',
  description: 'Mutual reflection across the seven levels of the Gottman Sound Relationship House.',
  framework: 'Gottman-Sound-Relationship-House',
  mutual_use_note:
    'Designed for both partners to complete separately, then compare. Not an individual diagnostic.',
  items: [
    { id: 'srh1', prompt: 'I can describe my partner’s inner world, stresses, joys, and current dreams.', scale: { min: 1, max: 5, low_label: 'Strongly disagree', high_label: 'Strongly agree' }, direction: 'higher-better', domain: 'love-maps' },
    { id: 'srh2', prompt: 'I express fondness and admiration for my partner regularly.', scale: { min: 1, max: 5, low_label: 'Strongly disagree', high_label: 'Strongly agree' }, direction: 'higher-better', domain: 'fondness-admiration' },
    { id: 'srh3', prompt: 'I turn toward my partner’s small bids for connection (questions, gestures, stories).', scale: { min: 1, max: 5, low_label: 'Strongly disagree', high_label: 'Strongly agree' }, direction: 'higher-better', domain: 'turning-toward' },
    { id: 'srh4', prompt: 'In a conflict, I start conversations gently rather than with criticism.', scale: { min: 1, max: 5, low_label: 'Strongly disagree', high_label: 'Strongly agree' }, direction: 'higher-better', domain: 'conflict-management' },
    { id: 'srh5', prompt: 'We repair effectively when conversations get off track (apologies, humor, breaks).', scale: { min: 1, max: 5, low_label: 'Strongly disagree', high_label: 'Strongly agree' }, direction: 'higher-better', domain: 'repair' },
    { id: 'srh6', prompt: 'We support each other’s life dreams and roles.', scale: { min: 1, max: 5, low_label: 'Strongly disagree', high_label: 'Strongly agree' }, direction: 'higher-better', domain: 'dreams' },
    { id: 'srh7', prompt: 'We share rituals of connection and a sense of shared meaning/values.', scale: { min: 1, max: 5, low_label: 'Strongly disagree', high_label: 'Strongly agree' }, direction: 'higher-better', domain: 'shared-meaning' },
  ],
  bands: [
    { min: 0, max: 19, label: 'Needs attention', interpretation: 'Several levels of the Sound Relationship House are underdeveloped; friendship and/or conflict management need strengthening.', suggested_action: 'Focus first on the friendship foundation: love maps, fondness/admiration, and turning toward bids. Consider couples counseling if distress is high.' },
    { min: 20, max: 27, label: 'Developing', interpretation: 'A workable foundation with specific gaps in one or two levels.', suggested_action: 'Identify the lowest-scoring level and do a targeted exercise together (e.g., love-map questions, an appreciation ritual).' },
    { min: 28, max: 35, label: 'Strong', interpretation: 'A robust Sound Relationship House across most levels.', suggested_action: 'Maintain with regular rituals of connection and continued shared-meaning conversations.' },
  ],
};

export const FOUR_HORSEMEN_SELF_CHECK: AssessmentDefinition = {
  id: 'four-horsemen-self-check',
  name: 'Four Horsemen Self-Check',
  description: 'Frequency of the four Gottman conflict patterns (criticism, contempt, defensiveness, stonewalling). Lower is healthier.',
  framework: 'Four-Horsemen',
  mutual_use_note:
    'Each partner rates their OWN behavior, then their perception of the other’s. Used to spark mutual repair, not to label a partner.',
  items: [
    { id: 'fh1', prompt: 'I start complaints with “you always/you never” attacks on my partner’s character.', scale: { min: 1, max: 5, low_label: 'Never', high_label: 'Almost always' }, direction: 'lower-better', domain: 'criticism' },
    { id: 'fh2', prompt: 'I use sarcasm, eye-rolling, name-calling, or sneering during conflict.', scale: { min: 1, max: 5, low_label: 'Never', high_label: 'Almost always' }, direction: 'lower-better', domain: 'contempt' },
    { id: 'fh3', prompt: 'When criticized, I counter-attack, play victim, or deny responsibility.', scale: { min: 1, max: 5, low_label: 'Never', high_label: 'Almost always' }, direction: 'lower-better', domain: 'defensiveness' },
    { id: 'fh4', prompt: 'I withdraw, shut down, or stop responding during difficult conversations.', scale: { min: 1, max: 5, low_label: 'Never', high_label: 'Almost always' }, direction: 'lower-better', domain: 'stonewalling' },
  ],
  bands: [
    { min: 4, max: 8, label: 'Healthy conflict', interpretation: 'Conflict patterns are largely under control; antidotes are working.', suggested_action: 'Keep using gentle startup, appreciation, taking responsibility, and self-soothing.' },
    { min: 9, max: 14, label: 'Mixed patterns', interpretation: 'Some horsemen appear in conflict; identify which one is most frequent for you.', suggested_action: 'Practice the specific antidote for your most frequent horseman (see references/prompts/four-horsemen-exercises.md).' },
    { min: 15, max: 20, label: 'Elevated risk', interpretation: 'Frequent hostile patterns, especially contempt, are associated (at a population level) with marital deterioration.', suggested_action: 'Strongly consider couples counseling. Practice the antidotes deliberately and reduce contempt first.' },
  ],
};

export const COMMITMENT_INVESTMENT_REFLECTION: AssessmentDefinition = {
  id: 'commitment-investment-reflection',
  name: 'Commitment & Investment Reflection',
  description: 'Reflection on the Investment Model: satisfaction, investments, alternatives, and commitment.',
  framework: 'Investment-Model',
  mutual_use_note:
    'A reflection tool for understanding commitment dynamics; not a predictor that a partner will stay or leave.',
  items: [
    { id: 'im1', prompt: 'I am satisfied with this relationship overall.', scale: { min: 1, max: 5, low_label: 'Strongly disagree', high_label: 'Strongly agree' }, direction: 'higher-better', domain: 'satisfaction' },
    { id: 'im2', prompt: 'I have invested a lot in this relationship (time, identity, shared resources, friendships).', scale: { min: 1, max: 5, low_label: 'Strongly disagree', high_label: 'Strongly agree' }, direction: 'higher-better', domain: 'investments' },
    { id: 'im3', prompt: 'My alternatives to this relationship feel unappealing right now.', scale: { min: 1, max: 5, low_label: 'Strongly disagree', high_label: 'Strongly agree' }, direction: 'higher-better', domain: 'alternatives' },
    { id: 'im4', prompt: 'I feel personally committed to this relationship long-term.', scale: { min: 1, max: 5, low_label: 'Strongly disagree', high_label: 'Strongly agree' }, direction: 'higher-better', domain: 'commitment' },
  ],
  bands: [
    { min: 4, max: 10, label: 'Low commitment signals', interpretation: 'Low satisfaction, low perceived investment, and/or attractive alternatives are reducing felt commitment.', suggested_action: 'Explore what is eroding satisfaction and investments; consider professional support if you want to rebuild.' },
    { min: 11, max: 15, label: 'Ambivalent', interpretation: 'Commitment is present but uneven; one component (often satisfaction or alternatives) is weaker.', suggested_action: 'Identify which Investment-Model component is weakest and discuss together what would strengthen it.' },
    { min: 16, max: 20, label: 'High commitment', interpretation: 'Commitment is well-supported by satisfaction, investments, and limited alternatives.', suggested_action: 'Maintain ongoing investment and keep nurturing satisfaction.' },
  ],
};

export const ACR_CAPITALIZATION_CHECK: AssessmentDefinition = {
  id: 'acr-capitalization-check',
  name: 'Active-Constructive Responding Check',
  description: 'How you respond when your partner shares good news.',
  framework: 'Active-Constructive-Responding',
  mutual_use_note:
    'Both partners rate themselves; compare to find opportunities to build capitalization.',
  items: [
    { id: 'acr1', prompt: 'When my partner shares good news, I respond enthusiastically and ask questions.', scale: { min: 1, max: 5, low_label: 'Strongly disagree', high_label: 'Strongly agree' }, direction: 'higher-better', domain: 'active-constructive' },
    { id: 'acr2', prompt: 'I quietly acknowledge my partner’s good news but don’t make much of it.', scale: { min: 1, max: 5, low_label: 'Never', high_label: 'Almost always' }, direction: 'lower-better', domain: 'passive-constructive' },
    { id: 'acr3', prompt: 'I point out the downside or risks of my partner’s good news.', scale: { min: 1, max: 5, low_label: 'Never', high_label: 'Almost always' }, direction: 'lower-better', domain: 'active-destructive' },
    { id: 'acr4', prompt: 'I seem uninterested or distracted when my partner shares good news.', scale: { min: 1, max: 5, low_label: 'Never', high_label: 'Almost always' }, direction: 'lower-better', domain: 'passive-destructive' },
  ],
  bands: [
    { min: 4, max: 9, label: 'Undermining capitalization', interpretation: 'Responses tend to undercut your partner’s positive events, which erodes intimacy over time.', suggested_action: 'Practice active-constructive responding: stop, be enthusiastic, ask for the story, and savor it together.' },
    { min: 10, max: 14, label: 'Inconsistent', interpretation: 'Sometimes supportive, sometimes deflating; capitalization is not yet reliable.', suggested_action: 'Increase active-constructive responses and reduce passive/active-destructive ones.' },
    { min: 15, max: 20, label: 'Strong capitalization', interpretation: 'You consistently amplify your partner’s good news, building intimacy.', suggested_action: 'Keep it up; this is one of the strongest everyday relationship-builders.' },
  ],
};

export const ASSESSMENT_REGISTRY: Record<AssessmentId, AssessmentDefinition> = {
  'sound-relationship-house-check': SOUND_RELATIONSHIP_HOUSE_CHECK,
  'four-horsemen-self-check': FOUR_HORSEMEN_SELF_CHECK,
  'commitment-investment-reflection': COMMITMENT_INVESTMENT_REFLECTION,
  'acr-capitalization-check': ACR_CAPITALIZATION_CHECK,
};

// ============================================================================
// SCORING
// ============================================================================

export function scoreAssessment(
  assessmentId: AssessmentId,
  responses: Record<string, number>
): AssessmentResult {
  const def = ASSESSMENT_REGISTRY[assessmentId];
  if (!def) throw new Error('Unknown assessment: ' + assessmentId);

  let rawSum = 0;
  const domainScores: Record<string, { raw: number; normalized: number }> = {};
  const perItemMax = 5;
  const perItemMin = 1;
  const totalItems = def.items.length;
  const maxRaw = perItemMax * totalItems;
  const minRaw = perItemMin * totalItems;

  // aggregate by domain
  const domainRaw: Record<string, { sum: number; count: number; lowerBetter: boolean }> = {};
  for (const item of def.items) {
    const r = responses[item.id];
    if (r === undefined || r === null || Number.isNaN(r)) {
      throw new Error('Missing response for item ' + item.id);
    }
    rawSum += r;
    const d = item.domain;
    if (!domainRaw[d]) domainRaw[d] = { sum: 0, count: 0, lowerBetter: item.direction === 'lower-better' };
    domainRaw[d].sum += r;
    domainRaw[d].count += 1;
  }

  // direction-corrected normalization to 0-100 (higher = healthier)
  let normalized = 0;
  for (const item of def.items) {
    const r = responses[item.id];
    const frac = (r - perItemMin) / (perItemMax - perItemMin); // 0..1
    normalized += item.direction === 'higher-better' ? frac : 1 - frac;
  }
  normalized = Math.round((normalized / totalItems) * 100);

  for (const [domain, agg] of Object.entries(domainRaw)) {
    const avg = agg.sum / agg.count;
    const frac = (avg - perItemMin) / (perItemMax - perItemMin);
    domainScores[domain] = {
      raw: Math.round(avg * 100) / 100,
      normalized: Math.round((agg.lowerBetter ? 1 - frac : frac) * 100),
    };
  }

  // pick band on rawSum (for lower-better-dominant instruments the bands are
  // authored against the raw sum already; for mixed instruments we use raw sum).
  const band = def.bands.find((b) => rawSum >= b.min && rawSum <= b.max) || def.bands[def.bands.length - 1];

  const referralRecommended =
    band.label === 'Elevated risk' ||
    band.label === 'Undermining capitalization' ||
    band.label === 'Low commitment signals';

  return {
    assessment_id: assessmentId,
    raw_score: rawSum,
    normalized_score: normalized,
    band_label: band.label,
    interpretation: band.interpretation,
    suggested_action: band.suggested_action,
    domain_scores: domainScores,
    referral_recommended: referralRecommended,
  };
}

// ============================================================================
// RELIABLE / CLINICALLY SIGNIFICANT CHANGE (re-administration support)
// ============================================================================

/**
 * Reliable Change Index thresholds (approximate, instrument-specific).
 * Used only when a user re-takes an assessment to track their own progress.
 * These are informational, not diagnostic.
 */
const RCI_THRESHOLDS: Record<AssessmentId, number> = {
  'sound-relationship-house-check': 4,
  'four-horsemen-self-check': 3,
  'commitment-investment-reflection': 3,
  'acr-capitalization-check': 3,
};

export function hasReliableChange(assessmentId: AssessmentId, scoreA: number, scoreB: number): boolean {
  const threshold = RCI_THRESHOLDS[assessmentId] ?? 4;
  return Math.abs(scoreB - scoreA) >= threshold;
}

export function hasClinicallySignificantChange(
  assessmentId: AssessmentId,
  scoreA: number,
  scoreB: number
): boolean {
  // Cross from "needs attention / elevated" band into "strong/healthy" band.
  const def = ASSESSMENT_REGISTRY[assessmentId];
  const bandA = def.bands.find((b) => scoreA >= b.min && scoreA <= b.max);
  const bandB = def.bands.find((b) => scoreB >= b.min && scoreB <= b.max);
  if (!bandA || !bandB) return false;
  const improvementLabels = ['Strong', 'Strong capitalization', 'High commitment', 'Healthy conflict'];
  return !improvementLabels.includes(bandA.label) && improvementLabels.includes(bandB.label);
}

export function getAssessment(id: AssessmentId): AssessmentDefinition | undefined {
  return ASSESSMENT_REGISTRY[id];
}

export function listAssessments(): AssessmentDefinition[] {
  return Object.values(ASSESSMENT_REGISTRY);
}
