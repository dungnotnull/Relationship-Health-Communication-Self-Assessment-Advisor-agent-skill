/**
 * LLM Dry-Run — exercises the full real-LLM call path OFFLINE using the
 * deterministic Mock provider (LLM_MOCK=true, ENABLE_LLM=true). Validates:
 *   1. The orchestrator builds prompts, calls the client, post-validates, and
 *      surfaces llm metadata (used/provider/attempts/latency/post_validation).
 *   2. Post-validation correctly accepts safe output and rejects unsafe
 *      output (individual forecast, partner labeling, surveillance help),
 *      falling back to the deterministic response.
 *
 * Usage:  npx tsx scripts/utils/llm-dry-run.ts
 */

// Force the mock LLM path before the orchestrator reads config.
process.env.ENABLE_LLM = 'true';
process.env.LLM_MOCK = 'true';
process.env.NODE_ENV = 'testing';

import { AgentOrchestrator } from '../../src/agents/orchestrator.js';
import { validateLLMOutput } from '../../src/llm/post-validator.js';
import { buildPrompt } from '../../src/llm/prompt-builder.js';
import { SKILL_REGISTRY } from '../../config/skills/registry.js';

const agent = new AgentOrchestrator();

const prompts: { label: string; message: string }[] = [
  { label: 'mutual-reflection', message: 'We want to improve our communication together. Can you help us reflect?' },
  { label: 'four-horsemen', message: 'Explain the Four Horsemen and how we can work on them.' },
  { label: 'commitment', message: 'How committed are we really? Will we last?' },
  { label: 'acr', message: 'How do I respond when my partner shares good news?' },
];

let llmUsedCount = 0;
let postValidationPass = 0;
for (const p of prompts) {
  const res = await agent.processRequest({ userId: 'dryrun', sessionId: 'dryrun-' + p.label, message: p.message });
  const llm = res.metadata.llm || { used: false };
  if (llm.used) llmUsedCount++;
  if (llm.post_validation_valid) postValidationPass++;
  console.log('=== ' + p.label + ' ===');
  console.log('llm: ' + JSON.stringify(llm));
  console.log('disclaimer present: ' + res.message.includes('**Disclaimer:**'));
  console.log('response (first 220 chars): ' + res.message.slice(0, 220).replace(/\n/g, ' '));
  console.log('');
}

// Self-test: prompt builder produces a system message containing the safety rules.
const skill = SKILL_REGISTRY['satisfaction-reflection'];
const msgs = buildPrompt({ skill, userMessage: 'test', fallbackResponse: 'fallback', maxContextTokens: 8000 });
const sysHasSafety = msgs[0].content.includes('SAFETY RULES') && msgs[0].content.includes('STANDING DISCLAIMER');
console.log('prompt-builder safety rules embedded: ' + sysHasSafety);

// Self-test: post-validation accepts safe output, rejects unsafe output.
const safe = validateLLMOutput('Mutual reflection guidance here.\n\n**Disclaimer:** general info only.', { strict: true, requireDisclaimer: true });
const forecastBad = validateLLMOutput('There is a 70% chance you will divorce.\n\n**Disclaimer:** x', { strict: true, requireDisclaimer: true });
const labelBad = validateLLMOutput('Your partner is a narcissist.\n\n**Disclaimer:** x', { strict: true, requireDisclaimer: true });
const surveillanceBad = validateLLMOutput('To track your partner, install a keylogger.\n\n**Disclaimer:** x', { strict: true, requireDisclaimer: true });
const missingDisclaimer = validateLLMOutput('Some guidance with no disclaimer.', { strict: true, requireDisclaimer: true });

console.log('post-validation safe accepted: ' + safe.valid);
console.log('post-validation forecast rejected: ' + !forecastBad.valid);
console.log('post-validation label rejected: ' + !labelBad.valid);
console.log('post-validation surveillance rejected: ' + !surveillanceBad.valid);
console.log('post-validation missing-disclaimer auto-appended: ' + missingDisclaimer.cleaned.includes('**Disclaimer:**'));

const passed =
  llmUsedCount === prompts.length &&
  postValidationPass === prompts.length &&
  sysHasSafety &&
  safe.valid &&
  !forecastBad.valid &&
  !labelBad.valid &&
  !surveillanceBad.valid &&
  missingDisclaimer.cleaned.includes('**Disclaimer:**');

console.log('');
console.log('LLM dry-run: ' + (passed ? 'PASSED' : 'FAILED') + ' (llm used on ' + llmUsedCount + '/' + prompts.length + ', post-validation pass ' + postValidationPass + '/' + prompts.length + ')');
if (!passed) process.exit(1);
