/**
 * Tool Registry — Relationship Health Self-Assessment Advisor
 *
 * Schema-validated, retry-aware tool definitions with deterministic handlers.
 * Tools are invoked by skills via the tool registry; inputs and outputs are
 * validated against JSON schemas. Includes graceful fallbacks.
 */

import type {
  Config,
  ToolDefinition,
  ToolHandler,
  ToolResult,
  ToolExecutionContext,
  JSONSchema,
} from '../schemas.js';
import {
  detectSurveillanceIntent,
  detectCrisis,
  type SurveillanceSensitivity,
} from '../safety/guardrails.js';
import {
  scoreAssessment,
  getAssessment,
  listAssessments,
  hasReliableChange, hasClinicallySignificantChange,
  type AssessmentId,
} from '../assessments/registry.js';
import { getCitationsByTechnique, getCitationsByFramework, formatCitation } from '../citations/registry.js';
import { getConfig } from '../config.js';

// ============================================================================
// INPUT / OUTPUT SCHEMAS
// ============================================================================

const SURVEILLANCE_INPUT: JSONSchema = {
  type: 'object',
  properties: {
    text: { type: 'string', description: 'User message to evaluate for one-sided profiling intent.' },
    sensitivity: { type: 'string', enum: ['strict', 'moderate', 'permissive'] },
  },
  required: ['text'],
};

const SURVEILLANCE_OUTPUT: JSONSchema = {
  type: 'object',
  properties: {
    detected: { type: 'boolean' },
    severity: { type: 'string', enum: ['hard', 'soft', 'none'] },
    matched_phrases: { type: 'array', items: { type: 'string' } },
    mutual_cues_present: { type: 'boolean' },
    refusal_recommended: { type: 'boolean' },
    confidence: { type: 'number' },
  },
};

const CRISIS_INPUT: JSONSchema = {
  type: 'object',
  properties: { text: { type: 'string' } },
  required: ['text'],
};

const CRISIS_OUTPUT: JSONSchema = {
  type: 'object',
  properties: {
    detected: { type: 'boolean' },
    matched: { type: 'array', items: { type: 'string' } },
    severity: { type: 'string', enum: ['severe', 'moderate', 'none'] },
  },
};

const ASSESSMENT_SCORE_INPUT: JSONSchema = {
  type: 'object',
  properties: {
    assessment_id: { type: 'string' },
    responses: { type: 'object', additionalProperties: { type: 'number' } },
  },
  required: ['assessment_id', 'responses'],
};

const ASSESSMENT_SCORE_OUTPUT: JSONSchema = {
  type: 'object',
  properties: {
    assessment_id: { type: 'string' },
    raw_score: { type: 'number' },
    normalized_score: { type: 'number' },
    band_label: { type: 'string' },
    interpretation: { type: 'string' },
    suggested_action: { type: 'string' },
    domain_scores: { type: 'object' },
    referral_recommended: { type: 'boolean' },
  },
};

const COMMUNICATION_EXERCISE_INPUT: JSONSchema = {
  type: 'object',
  properties: {
    exercise_type: {
      type: 'string',
      enum: ['speaker-listener', 'love-maps', 'appreciation-ritual', 'acr-practice', 'gentle-startup', 'repair-attempt', 'shared-meaning', 'investment-inventory', 'accommodation-practice'],
    },
    duration_minutes: { type: 'number' },
  },
  required: ['exercise_type'],
};

const COMMUNICATION_EXERCISE_OUTPUT: JSONSchema = {
  type: 'object',
  properties: {
    exercise_name: { type: 'string' },
    steps: { type: 'array', items: { type: 'string' } },
    duration_minutes: { type: 'number' },
    tips: { type: 'array', items: { type: 'string' } },
    framework: { type: 'string' },
  },
};

const CITATION_LOOKUP_INPUT: JSONSchema = {
  type: 'object',
  properties: {
    technique: { type: 'string' },
    framework: { type: 'string' },
  },
};

const CITATION_LOOKUP_OUTPUT: JSONSchema = {
  type: 'object',
  properties: {
    citations: { type: 'array', items: { type: 'string' } },
    count: { type: 'number' },
  },
};

const PROGRESS_INPUT: JSONSchema = {
  type: 'object',
  properties: {
    assessment_id: { type: 'string' },
    score_a: { type: 'number' },
    score_b: { type: 'number' },
  },
  required: ['assessment_id', 'score_a', 'score_b'],
};

const PROGRESS_OUTPUT: JSONSchema = {
  type: 'object',
  properties: {
    reliable_change: { type: 'boolean' },
    clinically_significant_change: { type: 'boolean' },
    delta: { type: 'number' },
  },
};

// ============================================================================
// HANDLERS
// ============================================================================

const surveillanceHandler: ToolHandler = async (input: {
  text: string;
  sensitivity?: SurveillanceSensitivity;
}): Promise<ToolResult> => {
  const start = Date.now();
  try {
    const result = detectSurveillanceIntent(input.text, input.sensitivity || 'strict');
    return { success: true, data: result, execution_time_ms: Date.now() - start };
  } catch (e) {
    return { success: false, error: 'surveillance detection failed: ' + String(e), execution_time_ms: Date.now() - start };
  }
};

const crisisHandler: ToolHandler = async (input: { text: string }): Promise<ToolResult> => {
  const start = Date.now();
  try {
    const result = detectCrisis(input.text);
    return { success: true, data: result, execution_time_ms: Date.now() - start };
  } catch (e) {
    return { success: false, error: 'crisis detection failed: ' + String(e), execution_time_ms: Date.now() - start };
  }
};

const assessmentScoreHandler: ToolHandler = async (input: {
  assessment_id: AssessmentId;
  responses: Record<string, number>;
}): Promise<ToolResult> => {
  const start = Date.now();
  try {
    const def = getAssessment(input.assessment_id);
    if (!def) {
      return { success: false, error: 'Unknown assessment: ' + input.assessment_id, execution_time_ms: Date.now() - start };
    }
    const result = scoreAssessment(input.assessment_id, input.responses);
    return { success: true, data: result, execution_time_ms: Date.now() - start };
  } catch (e) {
    return { success: false, error: 'assessment scoring failed: ' + String(e), execution_time_ms: Date.now() - start };
  }
};

const exerciseScripts: Record<string, { name: string; framework: string; steps: string[]; tips: string[]; minutes: number }> = {
  'speaker-listener': {
    name: 'Speaker–Listener Technique',
    framework: 'PREP / Communication-Skills',
    minutes: 15,
    steps: [
      'Agree on a single topic and who speaks first. The other is the listener.',
      'Speaker: use “I” statements, speak in short chunks, and stop periodically so the listener can paraphrase.',
      'Listener: paraphrase what you heard without rebuttal, then ask “Is there more?”',
      'Swap roles only after the speaker feels fully understood.',
      'Do not problem-solve until both feel heard.',
    ],
    tips: [
      'Use a physical object (a “talking token”) to mark the speaker role.',
      'If flooding occurs, take a 20-minute break and return.',
      'Focus on one issue; park others for later.',
    ],
  },
  'love-maps': {
    name: 'Love Maps Interview',
    framework: 'Gottman-Sound-Relationship-House',
    minutes: 10,
    steps: [
      'Take turns asking each other open questions: “Who at work is stressing you most right now?”, “What is your biggest worry this month?”, “Name two friends of mine you’re unsure how I feel about.”',
      'The partner answers honestly; the asker listens and remembers.',
      'After each round, the asker summarizes what they learned.',
    ],
    tips: [
      'This is curiosity, not interrogation — there are no wrong answers.',
      'Revisit weekly to keep maps current.',
    ],
  },
  'appreciation-ritual': {
    name: 'Appreciation / Admiration Ritual',
    framework: 'Gottman-Sound-Relationship-House',
    minutes: 5,
    steps: [
      'Each partner names one specific thing the other did recently that they appreciated.',
      'Be specific (the action, the effort, the impact).',
      'The receiver says “Thank you” and lets it land — no deflection.',
    ],
    tips: [
      'Aim for a 5:1 ratio of positive to negative interactions across the week.',
      'Specificity beats generics: not “you’re great” but “thank you for handling bedtime so I could finish work.”',
    ],
  },
  'acr-practice': {
    name: 'Active-Constructive Responding Practice',
    framework: 'Active-Constructive-Responding',
    minutes: 10,
    steps: [
      'One partner shares a piece of good news (small or large).',
      'The responder uses active-constructive responding: stop, be enthusiastic, ask for the story, savor it.',
      'Avoid pointing out risks or downsides during this exchange.',
      'Swap roles.',
    ],
    tips: [
      'The goal is to amplify the positive event, not solve a problem.',
      'Even 30 seconds of enthusiastic response builds capitalization.',
    ],
  },
  'gentle-startup': {
    name: 'Gentle Startup Rehearsal',
    framework: 'Four-Horsemen (antidote to criticism)',
    minutes: 10,
    steps: [
      'Pick a real complaint. Reformulate it as: “I feel [emotion] about [specific situation] because [reason]; I need [positive, specific request].”',
      'Avoid “you always / you never” and character attacks.',
      'Practice saying it aloud calmly before delivering it.',
    ],
    tips: [
      'Startups in the first 3 minutes strongly predict how a conflict conversation goes.',
      'A gentle startup is an invitation, not an indictment.',
    ],
  },
  'repair-attempt': {
    name: 'Repair Attempt Practice',
    framework: 'Gottman-Sound-Relationship-House',
    minutes: 10,
    steps: [
      'Identify a recent fight that escalated. Discuss what repair attempts were (or were not) made.',
      'Agree on repair signals you will use next time (a phrase, a gesture, a humor cue, a 20-min break).',
      'Rehearse accepting a repair (a repair only works if the other lets it land).',
    ],
    tips: [
      'Repair is not resolution; it is de-escalation. Accept repairs generously.',
      'If you are physiologically flooded (>100 BPM), take a 20-minute break before continuing.',
    ],
  },
  'shared-meaning': {
    name: 'Shared Meaning Conversation',
    framework: 'Gottman-Sound-Relationship-House',
    minutes: 20,
    steps: [
      'Discuss: What do we want our home to feel like? What rituals matter to us (meals, holidays, mornings)?',
      'Discuss roles, goals, and values: what do we each want our life to stand for?',
      'Identify one new ritual you will create together.',
    ],
    tips: [
      'There are no wrong answers; the goal is alignment, not agreement on every point.',
    ],
  },
  'investment-inventory': {
    name: 'Investment Inventory (Investment Model)',
    framework: 'Investment-Model',
    minutes: 15,
    steps: [
      'List the tangible and intangible investments you have made in this relationship (shared time, identity, friendships, finances, memories).',
      'Rate current satisfaction (1-5) and how appealing your alternatives feel right now (1-5).',
      'Discuss what investment or satisfaction you would like to grow.',
    ],
    tips: [
      'This is reflection, not a forecast. Commitment is supported by ongoing investment, not predicted by a score.',
    ],
  },
  'accommodation-practice': {
    name: 'Accommodation Practice',
    framework: 'Attachment-Theory / Accommodation (Overall et al. 2012)',
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

const communicationExerciseHandler: ToolHandler = async (input: {
  exercise_type: keyof typeof exerciseScripts;
  duration_minutes?: number;
}): Promise<ToolResult> => {
  const start = Date.now();
  try {
    const ex = exerciseScripts[input.exercise_type];
    if (!ex) {
      return { success: false, error: 'Unknown exercise: ' + input.exercise_type, execution_time_ms: Date.now() - start };
    }
    return {
      success: true,
      data: {
        exercise_name: ex.name,
        steps: ex.steps,
        duration_minutes: input.duration_minutes || ex.minutes,
        tips: ex.tips,
        framework: ex.framework,
      },
      execution_time_ms: Date.now() - start,
    };
  } catch (e) {
    return { success: false, error: 'exercise failed: ' + String(e), execution_time_ms: Date.now() - start };
  }
};

const citationLookupHandler: ToolHandler = async (input: {
  technique?: string;
  framework?: string;
}): Promise<ToolResult> => {
  const start = Date.now();
  try {
    let papers = [];
    if (input.technique) papers = getCitationsByTechnique(input.technique);
    else if (input.framework) papers = getCitationsByFramework(input.framework);
    const citations = papers.map(formatCitation);
    return { success: true, data: { citations, count: citations.length }, execution_time_ms: Date.now() - start };
  } catch (e) {
    return { success: false, error: 'citation lookup failed: ' + String(e), execution_time_ms: Date.now() - start };
  }
};

const progressHandler: ToolHandler = async (input: {
  assessment_id: AssessmentId;
  score_a: number;
  score_b: number;
}): Promise<ToolResult> => {
  const start = Date.now();
  try {
    return {
      success: true,
      data: {
        reliable_change: hasReliableChange(input.assessment_id, input.score_a, input.score_b),
        clinically_significant_change: hasClinicallySignificantChange(input.assessment_id, input.score_a, input.score_b),
        delta: input.score_b - input.score_a,
      },
      execution_time_ms: Date.now() - start,
    };
  } catch (e) {
    return { success: false, error: 'progress failed: ' + String(e), execution_time_ms: Date.now() - start };
  }
};

// ============================================================================
// TOOL DEFINITIONS
// ============================================================================

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    id: 'surveillance_detection',
    name: 'Surveillance Intent Detection',
    description: 'Detects one-sided partner-profiling / surveillance requests and recommends refusal or soft reframe.',
    input_schema: SURVEILLANCE_INPUT,
    output_schema: SURVEILLANCE_OUTPUT,
    handler: surveillanceHandler,
    refusal_trigger: true,
    timeout_ms: 5000,
    max_retries: 0,
    frameworks: ['safety'],
    version: '1.0.0',
  },
  {
    id: 'crisis_detection',
    name: 'Crisis / Violence Detection',
    description: 'Detects intimate-partner violence and acute safety indicators; returns tiered severity.',
    input_schema: CRISIS_INPUT,
    output_schema: CRISIS_OUTPUT,
    handler: crisisHandler,
    requires_professional_referral: true,
    crisis_keywords: ['abuse', 'domestic violence', 'afraid of my partner', 'hit me', 'unsafe'],
    timeout_ms: 5000,
    max_retries: 0,
    frameworks: ['safety'],
    version: '1.0.0',
  },
  {
    id: 'assessment_score',
    name: 'Assessment Scorer',
    description: 'Scores a relationship self-reflection instrument and returns banded interpretation.',
    input_schema: ASSESSMENT_SCORE_INPUT,
    output_schema: ASSESSMENT_SCORE_OUTPUT,
    handler: assessmentScoreHandler,
    timeout_ms: 10000,
    max_retries: 1,
    frameworks: ['Gottman-Sound-Relationship-House', 'Four-Horsemen', 'Investment-Model', 'Active-Constructive-Responding'],
    version: '1.0.0',
  },
  {
    id: 'communication_exercise',
    name: 'Communication Exercise Generator',
    description: 'Returns a structured, framework-grounded couples communication exercise.',
    input_schema: COMMUNICATION_EXERCISE_INPUT,
    output_schema: COMMUNICATION_EXERCISE_OUTPUT,
    handler: communicationExerciseHandler,
    timeout_ms: 10000,
    max_retries: 1,
    frameworks: ['Gottman-Sound-Relationship-House', 'Four-Horsemen', 'PREP', 'Active-Constructive-Responding', 'Investment-Model'],
    version: '1.0.0',
  },
  {
    id: 'citation_lookup',
    name: 'Citation Lookup',
    description: 'Returns formatted citations supporting a given technique or framework.',
    input_schema: CITATION_LOOKUP_INPUT,
    output_schema: CITATION_LOOKUP_OUTPUT,
    handler: citationLookupHandler,
    timeout_ms: 5000,
    max_retries: 1,
    version: '1.0.0',
  },
  {
    id: 'progress_check',
    name: 'Progress Check',
    description: 'Compares two assessment scores for reliable change between administrations.',
    input_schema: PROGRESS_INPUT,
    output_schema: PROGRESS_OUTPUT,
    handler: progressHandler,
    timeout_ms: 5000,
    max_retries: 1,
    version: '1.0.0',
  },
];

// ============================================================================
// TOOL REGISTRY IMPLEMENTATION
// ============================================================================

class ToolRegistryImpl {
  private tools: Map<string, ToolDefinition> = new Map();
  private config: Config | null;

  constructor(config?: Config) {
    this.config = config || null;
    for (const t of TOOL_DEFINITIONS) this.register(t);
  }

  register<T, O>(tool: ToolDefinition<T, O>): void {
    this.tools.set(tool.id, tool);
  }

  get(id: string): ToolDefinition | undefined {
    return this.tools.get(id);
  }

  list(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  async execute<T, O>(id: string, input: T): Promise<ToolResult<O>> {
    const tool = this.get(id);
    if (!tool) return { success: false, error: 'Tool not found: ' + id };
    const v = validateInput(input, tool.input_schema);
    if (!v.valid) return { success: false, error: 'Input validation failed: ' + v.errors.join(', ') };
    const ctx: ToolExecutionContext = {
      session_id: 'session',
      config: (this.config || getConfig()) as Config,
      agent_state: null as never,
      logger: console as unknown as ToolExecutionContext['logger'],
    };
    let lastErr: string | undefined;
    for (let attempt = 0; attempt <= tool.max_retries; attempt++) {
      try {
        const result = await tool.handler(input, ctx);
        return result as ToolResult<O>;
      } catch (e) {
        lastErr = String(e);
        if (attempt < tool.max_retries) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        }
      }
    }
    return { success: false, error: lastErr || 'Unknown error' };
  }
}

let instance: ToolRegistryImpl | null = null;
export function getToolRegistry(config?: Config): ToolRegistryImpl {
  if (!instance) instance = new ToolRegistryImpl(config);
  return instance;
}
export function resetToolRegistry(): void {
  instance = null;
}
// ============================================================================
// LIGHTWEIGHT JSON SCHEMA VALIDATION
// ============================================================================

export function validateInput(input: unknown, schema: JSONSchema): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (schema.type === 'object') {
    if (typeof input !== 'object' || input === null) {
      errors.push('Expected object');
      return { valid: false, errors };
    }
    const obj = input as Record<string, unknown>;
    if (schema.required) {
      for (const f of schema.required) {
        if (!(f in obj)) errors.push('Missing required field: ' + f);
      }
    }
  }
  return { valid: errors.length === 0, errors };
}

export { listAssessments };
