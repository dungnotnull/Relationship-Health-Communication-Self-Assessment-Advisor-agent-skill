/**
 * Cultural Adaptations — Relationship Health Self-Assessment Advisor
 *
 * Locale/culture-aware framing helpers so the skill does not impose a single
 * cultural model of relationships. These are lightweight, deterministic
 * adaptations — not stereotypes — used to soften framing and route referrals.
 */

// ============================================================================
// CULTURAL DIMENSION CUES
// ============================================================================

export interface CulturalAdaptation {
  id: string;
  name: string;
  description: string;
  // Phrases that hint this framing may be relevant (case-insensitive substring).
  cues: string[];
  framing_adjustments: string[];
  referral_notes: string[];
}

export const CULTURAL_ADAPTATIONS: CulturalAdaptation[] = [
  {
    id: 'collectivist-family-centered',
    name: 'Collectivist / family-centered',
    description:
      'Relationships embedded in extended family and community; harmony and family obligations carry weight alongside individual satisfaction.',
    cues: [
      'my family says',
      'our families',
      'in our culture',
      'arranged marriage',
      'in-laws',
      'extended family',
      'family approval',
      'community will judge',
    ],
    framing_adjustments: [
      'Acknowledge family/community context as a legitimate part of the relationship system, not as an obstacle.',
      'Frame communication exercises to include family-related conversations where relevant.',
      'Avoid framing “individual autonomy” as the only valid goal.',
    ],
    referral_notes: [
      'When suggesting counseling, note culturally-matching services (e.g., bilingual therapists, family-inclusive sessions where appropriate).',
    ],
  },
  {
    id: 'faith-integrated',
    name: 'Faith-integrated',
    description: 'Religious/spiritual framing is central to the couple’s understanding of their relationship.',
    cues: [
      'our faith',
      'our religion',
      'god wants',
      'spiritually',
      'in our church',
      'our mosque',
      'our temple',
      'religious values',
      'marriage covenant',
    ],
    framing_adjustments: [
      'Respect faith language; reference shared meaning and values rather than purely secular psychology.',
      'Offer referral paths that include faith-integrated counseling options when the couple requests it.',
    ],
    referral_notes: [
      'Mention pastoral / faith-based counseling alongside licensed clinicians; clarify the licensed-clinician recommendation still applies for clinical distress.',
    ],
  },
  {
    id: 'high-context-indirect',
    name: 'High-context / indirect communication',
    description: 'Direct confrontation is uncomfortable; repair and appreciation may be expressed indirectly.',
    cues: [
      'we don’t talk about it directly',
      'in my culture we don’t argue',
      'indirect',
      'saving face',
      'avoid conflict',
      'keep peace',
    ],
    framing_adjustments: [
      'Offer lower-intensity entry points (appreciation rituals, shared-meaning conversations) before direct conflict-management drills.',
      'Frame “turning toward bids” as a culturally gentle entry point.',
    ],
    referral_notes: [
      'Suggest counselors trained in the relevant cultural context to reduce mismatch.',
    ],
  },
  {
    id: 'long-distance-or-migrant',
    name: 'Long-distance / migrant',
    description: 'Partners are geographically separated or navigating migration-related stressors.',
    cues: [
      'long distance',
      'different countries',
      'immigration',
      'visa',
      'we are apart',
      'time zones',
      'we only see each other',
    ],
    framing_adjustments: [
      'Emphasize structured virtual rituals of connection and deliberate bid-turning across time zones.',
      'Acknowledge migration stress as a relationship stressor (not a sign the relationship is failing).',
    ],
    referral_notes: [
      'Online counseling options may be more accessible; mention cross-jurisdiction licensure limits for therapists.',
    ],
  },
];

// ============================================================================
// DETECTION
// ============================================================================

export interface CulturalDetection {
  matched: string[];
  adaptations: CulturalAdaptation[];
}

export function detectCulturalDimensions(message: string): CulturalDetection {
  const text = message.toLowerCase();
  const matched: string[] = [];
  const adaptations: CulturalAdaptation[] = [];
  for (const a of CULTURAL_ADAPTATIONS) {
    const hits = a.cues.filter((c) => text.includes(c));
    if (hits.length > 0) {
      matched.push(...hits);
      adaptations.push(a);
    }
  }
  return { matched, adaptations };
}

export function getCulturalNotes(detection: CulturalDetection): string[] {
  const notes: string[] = [];
  for (const a of detection.adaptations) {
    notes.push(a.name + ': ' + a.framing_adjustments[0]);
  }
  return notes;
}

export function getReferralNotes(detection: CulturalDetection): string[] {
  const notes: string[] = [];
  for (const a of detection.adaptations) {
    notes.push(...a.referral_notes);
  }
  return notes;
}
