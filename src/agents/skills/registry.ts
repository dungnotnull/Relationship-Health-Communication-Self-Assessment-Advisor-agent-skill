/**
 * Skill Handlers — Relationship Health Self-Assessment Advisor
 *
 * Runtime execution handlers for each registered skill. Each handler takes
 * the user message and a minimal execution context, then returns a complete,
 * disclaimer-bearing markdown response. Handlers use the config-layer
 * registries (assessments, citations, guardrails) and a compact exercise
 * catalog. No placeholders; every handler returns real, framework-grounded
 * content.
 */

import { SKILL_REGISTRY, type SkillDefinition } from '../../../config/skills/registry.js';
import { scoreAssessment, type AssessmentId, listAssessments } from '../../../config/assessments/registry.js';
import { getCitationsByFramework, getCitationsByTechnique, formatCitation, type ResearchPaper } from '../../../config/citations/registry.js';
import { detectSurveillanceIntent } from '../../../config/safety/guardrails.js';
import { detectCulturalDimensions, getCulturalNotes } from '../../../config/cultural/adaptations.js';
import { getConfig } from '../../../config/config.js';

// ============================================================================
// EXECUTION CONTEXT
// ============================================================================

export interface HandlerContext {
  session_id: string;
  refusal?: boolean;
  crisisSeverity?: 'severe' | 'moderate' | 'none';
  culturalAdaptations?: string[];
}

export type SkillHandler = (message: string, ctx: HandlerContext) => string;

// ============================================================================
// EXERCISE CATALOG (runtime delivery; mirrors references/prompts/)
// ============================================================================

const EXERCISES: Record<string, { name: string; framework: string; steps: string[]; tips: string[]; minutes: number }> = {
  'speaker-listener': {
    name: 'Speaker–Listener Technique',
    framework: 'PREP',
    minutes: 15,
    steps: [
      'Agree on one topic and who speaks first.',
      'Speaker: short chunks, “I” statements; pause for paraphrase.',
      'Listener: paraphrase without rebuttal, then ask “Is there more?”',
      'Swap roles only after the speaker feels fully understood.',
      'No problem-solving until both feel heard.',
    ],
    tips: ['Use a talking token to mark the speaker role.', 'If flooded, take a 20-minute break.', 'Park other issues for later.'],
  },
  'love-maps': {
    name: 'Love Maps Interview',
    framework: 'Gottman',
    minutes: 10,
    steps: [
      'Take turns asking open questions about each other’s current inner world.',
      'Sample prompts: “Who at work is stressing you most?”, “What is your biggest worry this month?”, “Name two friends of mine you’re unsure how I feel about.”',
      'The asker summarizes what they learned after each round.',
    ],
    tips: ['Curiosity, not interrogation — no wrong answers.', 'Revisit weekly to keep maps current.'],
  },
  'appreciation-ritual': {
    name: 'Appreciation / Admiration Ritual',
    framework: 'Gottman',
    minutes: 5,
    steps: [
      'Each partner names one specific thing the other did recently that they appreciated.',
      'Be specific (action, effort, impact).',
      'The receiver says “Thank you” and lets it land — no deflection.',
    ],
    tips: ['Aim for a 5:1 positive-to-negative interaction ratio across the week.', 'Specific beats general.'],
  },
  'acr-practice': {
    name: 'Active-Constructive Responding Practice',
    framework: 'Gable & Reis',
    minutes: 10,
    steps: [
      'One partner shares a piece of good news (small or large).',
      'Responder: stop, be enthusiastic, ask for the story, savor it together.',
      'Avoid pointing out risks or downsides during this exchange.',
      'Swap roles.',
    ],
    tips: ['Goal: amplify the positive event, not solve a problem.', 'Even 30 seconds of enthusiasm builds capitalization.'],
  },
  'gentle-startup': {
    name: 'Gentle Startup Rehearsal',
    framework: 'Gottman (antidote to criticism)',
    minutes: 10,
    steps: [
      'Reformulate a complaint: “I feel [emotion] about [specific situation] because [reason]; I need [specific positive request].”',
      'Avoid “you always / you never” and character attacks.',
      'Practice saying it aloud calmly before delivering it.',
    ],
    tips: ['The first 3 minutes strongly predict the conversation’s trajectory.', 'A gentle startup is an invitation, not an indictment.'],
  },
  'repair-attempt': {
    name: 'Repair Attempt Practice',
    framework: 'Gottman',
    minutes: 10,
    steps: [
      'Revisit a recent fight that escalated; note what repair attempts were (or were not) made.',
      'Agree on repair signals you will use next time (a phrase, a gesture, a humor cue, a break).',
      'Rehearse accepting a repair (a repair only works if the other lets it land).',
    ],
    tips: ['Repair is de-escalation, not resolution.', 'If flooded (heart rate >~100 bpm), take a 20-minute break.'],
  },
  'shared-meaning': {
    name: 'Shared Meaning Conversation',
    framework: 'Gottman',
    minutes: 20,
    steps: [
      'Discuss: What do we want our home to feel like? What rituals matter (meals, holidays, mornings)?',
      'Discuss roles, goals, values: what do we each want our life to stand for?',
      'Identify one new ritual you will create together.',
    ],
    tips: ['There are no wrong answers; the goal is alignment, not total agreement.'],
  },
  'investment-inventory': {
    name: 'Investment Inventory (Investment Model)',
    framework: 'Rusbult',
    minutes: 15,
    steps: [
      'List tangible and intangible investments you have made (time, identity, friendships, finances, memories).',
      'Rate current satisfaction (1-5) and how appealing alternatives feel right now (1-5).',
      'Discuss which investment or satisfaction you would like to grow.',
    ],
    tips: ['Reflection, not a forecast. Commitment is supported by ongoing investment, not a score.'],
  },
  'accommodation-practice': {
    name: 'Accommodation Practice',
    framework: 'Overall et al. (Attachment + Accommodation)',
    minutes: 15,
    steps: [
      'Recall a recent moment when you felt provoked or annoyed by your partner.',
      'Instead of reacting destructively, pause and inhibit the destructive impulse (the core of accommodation).',
      'Choose a constructive response: gentle honesty, repair, or letting a small thing go.',
      'Afterward, name what made the inhibition possible (safety, values, long-term goal).',
      'Swap roles; debrief what accommodation felt like from each side.',
    ],
    tips: [
      'Attachment security makes accommodation easier; if it is very hard, that is useful information, not a flaw.',
      'Accommodation is not suppression — name the feeling, then choose the response.',
    ],
  },
};

// ============================================================================
// HELPERS
// ============================================================================

function disclaimer(): string {
  const cfg = getConfig();
  return '\n\n' + cfg.safety.disclaimer_template;
}

function citationsBlock(papers: ResearchPaper[]): string {
  if (papers.length === 0) return '';
  return '\n\n**Selected evidence base:**\n' + papers.slice(0, 4).map((p) => '- ' + formatCitation(p)).join('\n');
}

function tryParseResponses(message: string): Record<string, number> | null {
  // Accept either a JSON object {responses: {...}} / {...} or a compact "srh1=4,srh2=3" form.
  const trimmed = message.trim();
  // JSON object
  if (trimmed.startsWith('{')) {
    try {
      const obj = JSON.parse(trimmed);
      const r = obj.responses || obj;
      if (r && typeof r === 'object') return r as Record<string, number>;
    } catch {
      // fall through
    }
  }
  // compact form
  if (trimmed.includes('=')) {
    const out: Record<string, number> = {};
    const parts = trimmed.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    for (const p of parts) {
      const [k, v] = p.split('=').map((s) => s.trim());
      if (k && v && !Number.isNaN(Number(v))) out[k] = Number(v);
    }
    if (Object.keys(out).length > 0) return out;
  }
  return null;
}

function detectAssessmentId(message: string): AssessmentId | null {
  const m = message.toLowerCase();
  if (/\bfh\d+\s*=/.test(m) || m.includes('four horsemen') || m.includes('horsemen')) return 'four-horsemen-self-check';
  if (/\bim\d+\s*=/.test(m) || m.includes('commitment') || m.includes('investment model')) return 'commitment-investment-reflection';
  if (/\bacr\d+\s*=/.test(m) || m.includes('active constructive') || m.includes('acr') || m.includes('capitalization')) return 'acr-capitalization-check';
  if (/\bsrh\d+\s*=/.test(m) || m.includes('sound relationship') || m.includes('relationship health') || m.includes('satisfaction') || m.includes('relationship check')) return 'sound-relationship-house-check';
  return null;
}

// ============================================================================
// HANDLERS
// ============================================================================

const satisfactionReflectionHandler: SkillHandler = (message, ctx) => {
  const def = listAssessments().find((a) => a.id === 'sound-relationship-house-check')!;
  const resp = tryParseResponses(message);
  let body: string;

  if (resp && detectAssessmentId(message) === 'sound-relationship-house-check') {
    try {
      const result = scoreAssessment('sound-relationship-house-check', resp);
      body = [
        '**Sound Relationship House Self-Check — Your Results**',
        '',
        'Each partner should complete this separately; these are your own ratings, not a verdict on your partner.',
        '',
        '- Overall normalized health: **' + result.normalized_score + '/100** (' + result.band_label + ')',
        '- Domain scores (0-100, higher = healthier):',
        ...Object.entries(result.domain_scores).map(([d, s]) => '  - ' + d + ': ' + s.normalized),
        '',
        '**Interpretation:** ' + result.interpretation,
        '',
        '**Suggested next step:** ' + result.suggested_action,
      ].join('\n');
      if (result.referral_recommended) {
        body += '\n\nIf distress is high, consider a licensed couples counselor or marriage and family therapist.';
      }
      body += citationsBlock(getCitationsByFramework('Gottman-Sound-Relationship-House'));
    } catch (e) {
      body = 'I could not score that. Please provide a response for each item (1-5), e.g. `srh1=4,srh2=3,srh3=5,...`.\n\nError: ' + String(e);
    }
    return body + disclaimer();
  }

  body = [
    '**Relationship Satisfaction Self-Reflection (Gottman Sound Relationship House)**',
    '',
    'This is a **mutual** exercise: each partner completes the self-check separately, then you compare. It is not a diagnosis and does not predict whether a partner is unfaithful or will leave.',
    '',
    'The self-check covers seven levels:',
    ...def.items.map((it) => '- **' + it.id + '.** ' + it.prompt + '  _(1 = ' + it.scale.low_label + ', 5 = ' + it.scale.high_label + ', domain: ' + it.domain + ')_'),
    '',
    'Send me your responses in the form `srh1=4,srh2=3,srh3=5,...` (1-5 each) and I will score it and suggest a targeted exercise for your weakest domain.',
    '',
    'Want a quick win first? Ask for the **Love Maps** or **Appreciation ritual** exercise.',
  ].join('\n');
  return body + citationsBlock(getCitationsByFramework('Gottman-Sound-Relationship-House')) + disclaimer();
};

const fourHorsemenHandler: SkillHandler = (message, _ctx) => {
  const resp = tryParseResponses(message);
  if (resp && detectAssessmentId(message) === 'four-horsemen-self-check') {
    try {
      const result = scoreAssessment('four-horsemen-self-check', resp);
      const body = [
        '**Four Horsemen Self-Check — Your Results**',
        '',
        'Each partner rates their OWN behavior (1 = never, 5 = almost always). Lower is healthier.',
        '',
        '- Overall normalized health: **' + result.normalized_score + '/100** (' + result.band_label + ')',
        '- Pattern scores (0-100, higher = healthier):',
        ...Object.entries(result.domain_scores).map(([d, s]) => '  - ' + d + ': ' + s.normalized),
        '',
        '**Interpretation:** ' + result.interpretation,
        '',
        '**Suggested next step:** ' + result.suggested_action,
      ].join('\n');
      if (result.referral_recommended) {
        return body + '\n\nFrequent hostile patterns (especially contempt) are hard to reduce alone. Consider a qualified couples counselor.' + citationsBlock(getCitationsByFramework('Four-Horsemen')) + disclaimer();
      }
      return body + citationsBlock(getCitationsByFramework('Four-Horsemen')) + disclaimer();
    } catch (e) {
      return 'I could not score that. Please provide a response for each item (1-5), e.g. `fh1=2,fh2=1,fh3=3,fh4=2`.\n\nError: ' + String(e) + disclaimer();
    }
  }
  const body = [
    '**The Four Horsemen (Gottman) — patterns to address together**',
    '',
    'These four communication patterns are associated, at a **population level**, with relationship distress. They are not a verdict on any individual; they are habits you can change together.',
    '',
    '1. **Criticism** — attacking a partner’s character instead of raising a complaint.',
    '   - *Antidote:* gentle startup — “I feel ___ about ___ because ___; I need ___.”',
    '2. **Contempt** — sarcasm, eye-rolling, name-calling, superiority. The strongest population-level predictor of deterioration.',
    '   - *Antidote:* build a culture of appreciation; describe your own feelings/needs, not your partner’s flaws.',
    '3. **Defensiveness** — counter-attacking, playing victim, denying responsibility.',
    '   - *Antidote:* take responsibility for even a piece of the problem.',
    '4. **Stonewalling** — withdrawing, shutting down, going silent.',
    '   - *Antidote:* self-soothe (20-min break if flooded) and re-engage; name that you need a break, not a permanent exit.',
    '',
    '**Mutual self-check:** each of you rates your OWN behavior (1 = never, 5 = almost always) on the four items in `references/prompts/four-horsemen-exercises.md`. Lower is healthier. Send responses as `fh1=2,fh2=1,fh3=3,fh4=2` and I will score it.',
    '',
    'Want to practice an antidote now? Ask for the **gentle startup** or **repair attempt** exercise.',
  ].join('\n');
  return body + citationsBlock(getCitationsByFramework('Four-Horsemen')) + disclaimer();
};

const communicationExerciseHandler: SkillHandler = (message) => {
  const m = message.toLowerCase();
  let chosen: string | null = null;
  for (const key of Object.keys(EXERCISES)) {
    if (m.includes(key.replace('-', ' ')) || m.includes(key)) {
      chosen = key;
      break;
    }
  }
  if (!chosen) {
    const options = Object.entries(EXERCISES).map(([k, v]) => '- **' + v.name + '** (' + v.minutes + ' min, ' + v.framework + ') — ask for `' + k + '`');
    const body = [
      '**Communication Exercises for Couples**',
      '',
      'Pick one and I will give you the full step-by-step:',
      '',
      ...options,
    ].join('\n');
    return body + disclaimer();
  }
  const ex = EXERCISES[chosen];
  const body = [
    '**' + ex.name + '** (' + ex.minutes + ' min · ' + ex.framework + ')',
    '',
    '**Steps:**',
    ...ex.steps.map((s, i) => (i + 1) + '. ' + s),
    '',
    '**Tips:**',
    ...ex.tips.map((t) => '- ' + t),
  ].join('\n');
  return body + citationsBlock(getCitationsByTechnique(chosen.replace('-', '-'))) + disclaimer();
};

const attachmentHandler: SkillHandler = (_message, _ctx) => {
  const body = [
    '**Adult Attachment — a non-diagnostic reflection**',
    '',
    'Attachment theory (Bowlby, Ainsworth) describes how early comfort patterns shape how adults seek and give closeness. Common patterns (not diagnoses):',
    '',
    '- **Secure** — comfortable with closeness and autonomy; can both reach for and offer comfort.',
    '- **Anxious** — craves closeness, sensitive to distance, fears abandonment.',
    '- **Avoidant** — values self-reliance, uncomfortable with too much closeness.',
    '',
    'These are tendencies, not labels for a partner. Most people show a mix, and patterns can soften with safety and practice.',
    '',
    '**Reflection prompts (each partner answers for themselves):**',
    '1. When I feel hurt, do I move toward my partner or pull back? What do I wish they would do?',
    '2. When my partner is upset, do I lean in or get uncomfortable? What does my partner seem to need?',
    '3. What is one small moment this week where I offered (or received) comfort well?',
    '',
    'For entrenched negative cycles, Emotionally Focused Therapy (EFT) targets attachment needs directly and has strong evidence (recovery from distress ~70-75%).',
  ].join('\n');
  return body + citationsBlock(getCitationsByFramework('Attachment-Theory')) + disclaimer();
};

const commitmentHandler: SkillHandler = (message) => {
  const resp = tryParseResponses(message);
  if (resp && (detectAssessmentId(message) === 'commitment-investment-reflection' || Object.keys(resp).some((k) => k.startsWith('im')))) {
    try {
      const result = scoreAssessment('commitment-investment-reflection', resp);
      const body = [
        '**Commitment & Investment Reflection — Your Results**',
        '',
        '- Normalized commitment health: **' + result.normalized_score + '/100** (' + result.band_label + ')',
        '- Domain scores:',
        ...Object.entries(result.domain_scores).map(([d, s]) => '  - ' + d + ': ' + s.normalized + '/100'),
        '',
        '**Interpretation:** ' + result.interpretation,
        '',
        '**Suggested next step:** ' + result.suggested_action,
      ].join('\n');
      return body + citationsBlock(getCitationsByFramework('Investment-Model')) + disclaimer();
    } catch (e) {
      // fall through to education
    }
  }
  const body = [
    '**Commitment & Investment Reflection (Rusbult Investment Model)**',
    '',
    'Commitment = satisfaction + investments − quality of alternatives. This is a way to reflect on what supports your commitment **now** — it does **not** predict whether a partner will stay or leave.',
    '',
    'Items (1 = strongly disagree, 5 = strongly agree):',
    '- **im1.** I am satisfied with this relationship overall.',
    '- **im2.** I have invested a lot in this relationship (time, identity, shared resources, friendships).',
    '- **im3.** My alternatives to this relationship feel unappealing right now.',
    '- **im4.** I feel personally committed to this relationship long-term.',
    '',
    'Send responses as `im1=4,im2=5,im3=3,im4=5` and I will score it. Or ask for the **investment-inventory** exercise to explore together.',
  ].join('\n');
  return body + citationsBlock(getCitationsByFramework('Investment-Model')) + disclaimer();
};

const acrHandler: SkillHandler = (message) => {
  const resp = tryParseResponses(message);
  if (resp && (detectAssessmentId(message) === 'acr-capitalization-check' || Object.keys(resp).some((k) => k.startsWith('acr')))) {
    try {
      const result = scoreAssessment('acr-capitalization-check', resp);
      const body = [
        '**Active-Constructive Responding Check — Your Results**',
        '',
        '- Normalized capitalization health: **' + result.normalized_score + '/100** (' + result.band_label + ')',
        '- Style scores:',
        ...Object.entries(result.domain_scores).map(([d, s]) => '  - ' + d + ': ' + s.normalized + '/100'),
        '',
        '**Interpretation:** ' + result.interpretation,
        '',
        '**Suggested next step:** ' + result.suggested_action,
      ].join('\n');
      return body + citationsBlock(getCitationsByFramework('Active-Constructive-Responding')) + disclaimer();
    } catch (e) {
      // fall through
    }
  }
  const body = [
    '**Active-Constructive Responding (Gable & Reis)**',
    '',
    'How you respond when your partner shares good news predicts intimacy — often more than how you handle bad news. Four styles:',
    '',
    '- **Active-Constructive** (best): enthusiastic, asks for the story, savors it. Builds “capitalization.”',
    '- **Passive-Constructive:** quiet, understated support — better than nothing, but the joy deflates.',
    '- **Active-Destructive:** points out risks/downsides — deflates the partner.',
    '- **Passive-Destructive:** ignores it, changes subject.',
    '',
    '**Self-check (rate your own behavior, 1-5):**',
    '- **acr1.** I respond enthusiastically and ask questions. (higher-better)',
    '- **acr2.** I quietly acknowledge but don’t make much of it. (lower-better)',
    '- **acr3.** I point out the downside/risks. (lower-better)',
    '- **acr4.** I seem uninterested or distracted. (lower-better)',
    '',
    'Send `acr1=4,acr2=2,acr3=1,acr4=1` to score, or ask for the **acr-practice** exercise.',
  ].join('\n');
  return body + citationsBlock(getCitationsByFramework('Active-Constructive-Responding')) + disclaimer();
};

const referralHandler: SkillHandler = (_message, ctx) => {
  const body = [
    '**When and How to Seek Professional Help**',
    '',
    'Consider a qualified professional when:',
    '- conflict is persistent and painful despite your own efforts',
    '- there has been betrayal, an affair, or broken trust',
    '- you keep having the same fight with no repair',
    '- contempt is frequent and you cannot reduce it on your own',
    '- one or both partners feel hopeless about the relationship',
    '',
    '**Types of qualified professionals:**',
    '- **Marriage and Family Therapists (MFT/LMFT)** — licensed clinicians specializing in couples and families.',
    '- **EFT-trained couples therapists** — Emotionally Focused Therapy targets negative cycles and attachment needs; recovery from distress ~70-75%.',
    '- **Gottman Method-trained therapists** — structured, skills + shared meaning.',
    '- **PREP/CPREP-trained counselors** — communication-skills focused.',
    '',
    ctx && ctx.culturalAdaptations && ctx.culturalAdaptations.length > 0
      ? '**Finding culturally appropriate help:** look for bilingual/bicultural clinicians, faith-integrated counseling if you want it, or clinicians experienced with your cultural context. Clarify that a licensed clinician is still recommended for clinical distress.'
      : '**How to find one:** ask your primary-care provider for a referral, use your insurer’s directory, or search a national professional association (e.g., AAMFT therapist locator in the US).',
    '',
    'If you feel unsafe or afraid of your partner, contact a domestic-violence hotline **before** joint counseling — couples counseling is not recommended where ongoing abuse is present.',
  ].join('\n');
  return body + citationsBlock(getCitationsByFramework('Professional-Referral')) + disclaimer();
};

const safetyRouterHandler: SkillHandler = (message, ctx) => {
  const cfg = getConfig();
  const surv = detectSurveillanceIntent(message, cfg.safety.surveillance_detection_sensitivity);
  if (surv.refusal_recommended) {
    return cfg.safety.refusal_template;
  }
  if (ctx && ctx.crisisSeverity === 'severe') {
    return [
      '**Your safety comes first.**',
      '',
      'If you are afraid of your partner, are being hurt, or feel unsafe, please reach out right now:',
      '',
      '- **US National Domestic Violence Hotline:** Call 1-800-799-7233 or text START to 88788 (24/7, confidential).',
      '- **Emergency services:** Dial your local emergency number (911 in the US/Canada, 112 in the EU, 999 in the UK).',
      '- **International directory:** https://www.hotpeachpages.org/',
      '',
      'You do not have to make relationship decisions right now. Getting safe is the first step.',
    ].join('\n') + disclaimer();
  }
  return cfg.safety.refusal_template;
};

// ============================================================================
// HANDLER REGISTRY
// ============================================================================

export const SKILL_HANDLERS: Record<string, SkillHandler> = {
  'satisfaction-reflection': satisfactionReflectionHandler,
  'four-horsemen-education': fourHorsemenHandler,
  'communication-exercise-advisor': communicationExerciseHandler,
  'attachment-reflection': attachmentHandler,
  'commitment-reflection': commitmentHandler,
  'acr-coach': acrHandler,
  'referral-advisor': referralHandler,
  'safety-router': safetyRouterHandler,
};

export function getHandler(skillId: string): SkillHandler | undefined {
  return SKILL_HANDLERS[skillId];
}

export function listHandlerSkills(): SkillDefinition[] {
  return Object.values(SKILL_REGISTRY);
}

export { EXERCISES, detectCulturalDimensions, getCulturalNotes };
