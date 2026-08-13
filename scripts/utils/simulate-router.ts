/**
 * Simulate Router — runs the chain-of-thought router over a set of prompts and
 * prints the routing trace. Useful for understanding routing decisions without
 * executing full handlers.
 *
 * Usage:  npx tsx scripts/utils/simulate-router.ts
 */

import { ChainOfThoughtRouter } from '../../src/agents/router.js';
import { getConfig } from '../../config/config.js';

const prompts = [
  'Is my partner cheating on me?',
  'Will my partner leave me? Give a probability.',
  'We want to improve our communication together.',
  'Help us with the Four Horsemen.',
  'I am afraid of my partner and he hit me.',
  'How committed are we really?',
  'How do I respond when my partner shares good news?',
  'I feel distant from my partner lately.',
];

const router = new ChainOfThoughtRouter(getConfig());
for (const p of prompts) {
  const d = router.route(p);
  console.log('=== "' + p + '"');
  console.log('  -> skill: ' + d.skillId + ' (refusal=' + d.refusal + ', crisis=' + d.crisis.severity + ')');
  console.log(router.formatTrace(d));
  console.log('');
}
