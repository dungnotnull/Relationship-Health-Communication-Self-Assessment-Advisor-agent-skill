/**
 * Skill Registry — Relationship Health Self-Assessment Advisor
 *
 * Declarative registry of skills the orchestrator routes between. Each skill
 * carries trigger phrases, frameworks, tool dependencies, research support,
 * and a fallback response. All skills require the standing disclaimer and
 * mutual-use framing.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  triggerPhrases: string[];
  frameworks: string[];
  tools: string[];
  researchSupport: { citationIds: string[]; effectSize: string; evidenceGrade: string };
  capabilities: string[];
  requiresMutualFraming: boolean;
  fallback: string;
}

// ============================================================================
// SKILLS
// ============================================================================

export const SKILL_REGISTRY: Record<string, SkillDefinition> = {
  'satisfaction-reflection': {
    id: 'satisfaction-reflection',
    name: 'Relationship Satisfaction Self-Reflection Guide',
    description: 'Guides a mutual, structured self-reflection across the Gottman Sound Relationship House domains (friendship, conflict, shared meaning).',
    triggerPhrases: [
      'relationship health', 'relationship satisfaction', 'how is our relationship',
      'reflect on our relationship', 'relationship checkup', 'relationship self-assessment',
      'sound relationship house', 'are we okay', 'relationship report card',
      'relationship check-in', 'check in on our relationship',
    ],
    frameworks: ['Gottman-Sound-Relationship-House'],
    tools: ['assessment_score', 'communication_exercise', 'citation_lookup'],
    researchSupport: {
      citationIds: ['gottman1999sevenprinciples', 'gottmanlevenson2000timing', 'karneybradbury1995review'],
      effectSize: 'Population-level divorce prediction accuracy ~0.85 (not individual-diagnostic)',
      evidenceGrade: 'A (Strong Evidence)',
    },
    capabilities: [
      'Administer the Sound Relationship House Self-Check (both partners separately, then compare)',
      'Surface friendship, conflict-management, and shared-meaning domain scores',
      'Recommend targeted exercises for the weakest domain',
      'Encourage couples counseling when distress is high',
    ],
    requiresMutualFraming: true,
    fallback:
      'I can guide a mutual relationship-satisfaction self-reflection using the Gottman Sound Relationship House. Both partners complete a short self-check separately, then compare. Would you like to start with the friendship foundation (love maps, fondness/admiration, turning toward)?',
  },

  'four-horsemen-education': {
    id: 'four-horsemen-education',
    name: 'Four Horsemen Communication Education',
    description: 'Explains the Four Horsemen (criticism, contempt, defensiveness, stonewalling) and their evidence-based antidotes, as patterns to address together.',
    triggerPhrases: [
      'four horsemen', 'criticism', 'contempt', 'defensiveness', 'stonewalling',
      'we keep fighting', 'how we argue', 'argue all the time', 'conflict patterns',
      'eye rolling', 'silent treatment', 'communication problems', 'how we communicate',
    ],
    frameworks: ['Four-Horsemen'],
    tools: ['communication_exercise', 'assessment_score', 'citation_lookup'],
    researchSupport: {
      citationIds: ['gottman1994predicts', 'gottmangottman2008method'],
      effectSize: 'Contempt is the strongest population-level predictor of marital deterioration',
      evidenceGrade: 'A (Strong Evidence)',
    },
    capabilities: [
      'Explain each horseman with concrete examples and its antidote',
      'Offer the Four Horsemen Self-Check as a mutual reflection (each rates own behavior)',
      'Recommend the specific antidote exercise for the most frequent horseman',
      'Reframe toward mutual repair, not partner-labeling',
    ],
    requiresMutualFraming: true,
    fallback:
      'The Four Horsemen (Gottman) are four communication patterns associated, at a population level, with relationship distress: criticism, contempt, defensiveness, and stonewalling. Each has an evidence-based antidote (gentle startup, appreciation, taking responsibility, self-soothing). Would you like to learn them and try a self-check together?',
  },

  'communication-exercise-advisor': {
    id: 'communication-exercise-advisor',
    name: 'Communication Exercise Advisor',
    description: 'Recommends and delivers structured, evidence-based couples communication exercises (speaker-listener, ACR, repair, shared meaning).',
    triggerPhrases: [
      'communication exercise', 'exercise for us', 'help us communicate',
      'communication skills', 'speaker listener', 'active constructive responding',
      'capitalization', 'repair attempt', 'shared meaning ritual',
      'things to do together', 'relationship exercise', 'date night idea',
    ],
    frameworks: ['PREP', 'Active-Constructive-Responding', 'Gottman-Sound-Relationship-House'],
    tools: ['communication_exercise', 'citation_lookup'],
    researchSupport: {
      citationIds: ['markmanstanleyblumberg2010fighting', 'gabletreisimpettasher2004', 'gottmangottman2008method'],
      effectSize: 'EFT d~0.88; ACR relationship well-being r~0.42; PREP skills reduce negative escalation',
      evidenceGrade: 'A (Strong Evidence)',
    },
    capabilities: [
      'Select an exercise matched to the couple’s stated need',
      'Deliver step-by-step instructions and tips',
      'Ground each exercise in its source framework',
    ],
    requiresMutualFraming: true,
    fallback:
      'I can suggest an evidence-based communication exercise for the two of you to do together. Options include the Speaker–Listener technique, an Appreciation ritual, Active-Constructive Responding practice, a Gentle Startup rehearsal, or a Shared Meaning conversation. Which would you like?',
  },

  'attachment-reflection': {
    id: 'attachment-reflection',
    name: 'Attachment-Style Reflection Guide',
    description: 'Educational reflection on adult attachment patterns and how they show up in the relationship. Non-diagnostic.',
    triggerPhrases: [
      'attachment', 'attachment style', 'anxious attachment', 'avoidant attachment',
      'secure attachment', 'why do i react', 'emotional pattern', 'i feel clingy',
      'i pull away', 'i feel abandoned', 'inner working model',
    ],
    frameworks: ['Attachment-Theory'],
    tools: ['citation_lookup'],
    researchSupport: {
      citationIds: ['bowlby1969attachment', 'ainsworth1978patterns', 'johnson2004eft'],
      effectSize: 'EFT recovery from distress ~70-75% (d~0.88)',
      evidenceGrade: 'A (Strong Evidence)',
    },
    capabilities: [
      'Explain secure/anxious/avoidant patterns in everyday terms',
      'Offer reflection prompts on how each partner’s pattern shows up',
      'Reframe toward understanding and mutual support, not labeling a partner',
    ],
    requiresMutualFraming: true,
    fallback:
      'Attachment theory describes how early relationship patterns shape how we seek and give comfort. In adults, patterns are often described as secure, anxious, or avoidant — not diagnoses, just tendencies. Would you like reflection prompts to explore how these show up for each of you?',
  },

  'commitment-reflection': {
    id: 'commitment-reflection',
    name: 'Commitment & Investment Reflection Guide',
    description: 'Reflection on the Investment Model (satisfaction, investments, alternatives, commitment). Explicitly not a predictor that a partner will leave.',
    triggerPhrases: [
      'commitment', 'investment model', 'should we stay together',
      'how committed are we', 'is this relationship worth it', 'commitment reflection',
      'thinking about the future', 'long-term', 'are we committed',
    ],
    frameworks: ['Investment-Model'],
    tools: ['assessment_score', 'communication_exercise', 'citation_lookup'],
    researchSupport: {
      citationIds: ['rusbult1980investment', 'leagnew2003meta'],
      effectSize: 'Satisfaction r~0.62, investments r~0.49, alternatives r~-0.43 with commitment (meta-analysis)',
      evidenceGrade: 'A (Strong Evidence)',
    },
    capabilities: [
      'Explain the Investment Model and that it describes commitment dynamics, not a forecast',
      'Administer the Commitment & Investment Reflection as a self-exploration',
      'Reframe “will we last” questions toward mutual investment-building',
    ],
    requiresMutualFraming: true,
    fallback:
      'The Investment Model frames commitment as satisfaction plus investments minus alternatives. It is a way to reflect on what supports your commitment now — not a prediction of whether a partner will stay. Would you like to do the reflection together?',
  },

  'acr-coach': {
    id: 'acr-coach',
    name: 'Active-Constructive Responding Coach',
    description: 'Teaches and practices active-constructive responding (capitalization) for when a partner shares good news.',
    triggerPhrases: [
      'active constructive responding', 'capitalization', 'when i share good news',
      'partner doesn’t celebrate', 'good news response', 'how to respond to good news',
      'enthusiasm', 'savoring', 'good news', 'shares good news',
      'respond to good news', 'respond when my partner shares', 'when my partner shares good news',
    ],
    frameworks: ['Active-Constructive-Responding'],
    tools: ['communication_exercise', 'assessment_score', 'citation_lookup'],
    researchSupport: {
      citationIds: ['gabletreisimpettasher2004', 'finchambeach2010positive'],
      effectSize: 'ACR relationship well-being r~0.42',
      evidenceGrade: 'A (Strong Evidence)',
    },
    capabilities: [
      'Explain the four responding styles',
      'Offer the ACR self-check',
      'Deliver an ACR practice exercise',
    ],
    requiresMutualFraming: true,
    fallback:
      'Active-Constructive Responding is how we react when a partner shares good news — and it predicts intimacy more strongly than how we handle bad news. Would you like to learn the four styles and practice the active-constructive one together?',
  },

  'referral-advisor': {
    id: 'referral-advisor',
    name: 'Professional Referral Advisor',
    description: 'Provides guidance on when and how to seek a qualified couples counselor / marriage and family therapist. Surfaced when serious conflict or distress is present.',
    triggerPhrases: [
      'counseling', 'counselor', 'therapist', 'therapy', 'couples therapy',
      'marriage counseling', 'should we see someone', 'professional help',
      'serious conflict', 'thinking about divorce', 'thinking about leaving',
      'broken trust', 'affair', 'betrayal',
    ],
    frameworks: ['Professional-Referral'],
    tools: ['citation_lookup'],
    researchSupport: {
      citationIds: ['aamft2020counseling', 'johnson2004eft', 'gottmangottman2008method'],
      effectSize: 'EFT recovery ~70-75%; couples counseling effective for most distressed couples',
      evidenceGrade: 'A (Strong Evidence)',
    },
    capabilities: [
      'Identify when professional support is warranted',
      'Describe types of qualified professionals (MFT, EFT-trained, PREP-trained)',
      'Provide guidance on finding culturally appropriate help',
    ],
    requiresMutualFraming: false,
    fallback:
      'For persistent, serious conflict or distress, a qualified couples counselor or marriage and family therapist can help. EFT and Gottman Method are well-supported approaches. Would you like guidance on finding one?',
  },

  'safety-router': {
    id: 'safety-router',
    name: 'Safety Router',
    description: 'Refuses one-sided partner-profiling/surveillance requests and surfaces violence/crisis resources. Highest-priority routing.',
    triggerPhrases: [
      'is my partner cheating', 'will my partner leave', 'track my partner',
      'surveil', 'abuse', 'domestic violence', 'afraid of my partner',
      'predict divorce', 'behind their back',
    ],
    frameworks: ['Safety'],
    tools: ['surveillance_detection', 'crisis_detection'],
    researchSupport: {
      citationIds: [],
      effectSize: 'N/A (safety protocols)',
      evidenceGrade: 'A (Clinical Standards)',
    },
    capabilities: [
      'Refuse surveillance/profiling requests and reframe toward mutual work',
      'Surface violence/crisis resources immediately',
      'Encourage professional support for serious distress',
    ],
    requiresMutualFraming: true,
    fallback:
      'This skill is for mutual relationship-satisfaction self-reflection, not for assessing or surveilling a specific partner. I can help you and your partner reflect on communication and satisfaction together instead.',
  },
};

// ============================================================================
// LOOKUP / RESOLUTION
// ============================================================================

export function findSkillByTrigger(phrase: string): SkillDefinition | null {
  const p = phrase.toLowerCase();
  let best: SkillDefinition | null = null;
  let bestLen = 0;
  for (const skill of Object.values(SKILL_REGISTRY)) {
    for (const t of skill.triggerPhrases) {
      if (p.includes(t) && t.length > bestLen) {
        best = skill;
        bestLen = t.length;
      }
    }
  }
  return best;
}

export function getSkillById(id: string): SkillDefinition | null {
  return SKILL_REGISTRY[id] || null;
}

export function getSkillsByFramework(framework: string): SkillDefinition[] {
  return Object.values(SKILL_REGISTRY).filter((s) => s.frameworks.includes(framework));
}

export function getAllSkillIds(): string[] {
  return Object.keys(SKILL_REGISTRY);
}

export function searchSkillsByCapability(capability: string): SkillDefinition[] {
  const c = capability.toLowerCase();
  return Object.values(SKILL_REGISTRY).filter((s) =>
    s.capabilities.some((cap) => cap.toLowerCase().includes(c))
  );
}
