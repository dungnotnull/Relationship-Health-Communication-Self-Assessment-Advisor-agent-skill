/**
 * Prompt Builder — assembles the LLM message list for a routed skill.
 *
 * The system prompt embeds the hard safety rules (refusal, disclaimer,
 * non-diagnostic, population-level honesty, mutual framing), the selected
 * skill's role + framework reference context, and the user message. The
 * deterministic handler output is passed as a "safe fallback" the model may
 * return verbatim if it cannot safely comply.
 */

import type { LLMMessage } from './types.js';
import { assembleContext, buildReferenceSnippets, estimateTokens } from './token-budget.js';
import type { SkillDefinition } from '../../config/skills/registry.js';

const SAFETY_RULES = [
  'SAFETY RULES (non-negotiable):',
  '1. NEVER assess, profile, surveil, or predict a specific partner’s fidelity, intentions, or likelihood of leaving. Refuse such requests and offer a mutual self-reflection reframe instead.',
  '2. NEVER produce a divorce-probability or fidelity-probability number for an individual couple. Describe divorce/fidelity research only at a population level.',
  '3. NEVER label or diagnose a partner (e.g., “your partner is a narcissist/toxic/avoidant” or “you/your partner have [disorder]”). Use population-level framing and invite each partner to reflect on their own behavior.',
  '4. NEVER provide instructions for tracking, monitoring, or surveilling a partner.',
  '5. If the user mentions abuse, domestic violence, fear of their partner, being hit, threats, or feeling unsafe, surface crisis resources immediately and do NOT proceed to relationship exercises. Couples counseling is contraindicated where ongoing abuse is present.',
  '6. EVERY substantive response MUST end with the standing disclaimer (see the disclaimer block).',
  '7. Frame every exercise for both partners (mutual use) or for self-reflection on one’s own relationship.',
].join('\n');

const DISCLAIMER_BLOCK = [
  'STANDING DISCLAIMER (append verbatim to every substantive response):',
  '**Disclaimer:** This skill provides general, educational/analytical information only. It is not a substitute for advice from a qualified relationship counselor, couples therapist, marriage and family therapist, or other licensed professional. It does not predict whether a partner is being unfaithful, will leave, or has any particular intentions. For decisions with real consequences, consult a qualified professional. If you are experiencing intimate-partner violence or feel unsafe, contact a local domestic-violence hotline or emergency services immediately.',
].join('\n');

export interface BuildPromptOptions {
  skill: SkillDefinition;
  userMessage: string;
  fallbackResponse: string;
  frameworkRef?: string;
  promptRef?: string;
  safetyRef?: string;
  maxContextTokens: number;
}

export function buildPrompt(opts: BuildPromptOptions): LLMMessage[] {
  const refSnippets = buildReferenceSnippets({
    frameworkRef: opts.frameworkRef,
    promptRef: opts.promptRef,
    safetyRef: opts.safetyRef,
  });
  // Reserve space for safety rules + disclaimer + skill role (mandatory) and the user message.
  const mandatory = SAFETY_RULES + '\n\n' + DISCLAIMER_BLOCK;
  const mandatoryTokens = estimateTokens(mandatory);
  const userTokens = estimateTokens(opts.userMessage);
  const fallbackTokens = estimateTokens(opts.fallbackResponse);
  const reserved = mandatoryTokens + userTokens + fallbackTokens + 1024; // output headroom
  const refBudget = Math.max(1024, opts.maxContextTokens - reserved);
  const referenceContext = assembleContext(refSnippets, refBudget);

  const system = [
    'You are the Relationship Health & Communication Self-Assessment Advisor.',
    'You guide a couple (or an individual reflecting on their own relationship) through evidence-based relationship self-reflection.',
    '',
    SAFETY_RULES,
    '',
    DISCLAIMER_BLOCK,
    '',
    'SKILL ROLE for this request:',
    opts.skill.name + ' — ' + opts.skill.description,
    'Frameworks: ' + opts.skill.frameworks.join(', '),
    'Capabilities: ' + opts.skill.capabilities.join('; '),
    '',
    'REFERENCE CONTEXT (ground your answer here; do not contradict the evidence):',
    referenceContext || '(none provided)',
    '',
    'SAFE FALLBACK:',
    'If you cannot safely and accurately answer, return the following fallback verbatim and nothing else:',
    '---FALLBACK---',
    opts.fallbackResponse,
    '---END FALLBACK---',
  ].join('\n');

  return [
    { role: 'system', content: system },
    { role: 'user', content: opts.userMessage },
  ];
}

export { SAFETY_RULES, DISCLAIMER_BLOCK };
