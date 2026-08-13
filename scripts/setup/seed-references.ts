/**
 * Seed References — verifies all reference files exist and are non-empty.
 *
 * Usage:  npx tsx scripts/setup/seed-references.ts
 * (or)    node --loader ts-node/esm scripts/setup/seed-references.ts
 *
 * This script does NOT mutate references; it validates the knowledge base is
 * present so the skill can ground responses. Run after cloning the repo.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

const REQUIRED: { path: string; minBytes: number }[] = [
  { path: 'references/frameworks/gottman-sound-relationship-house.md', minBytes: 1500 },
  { path: 'references/frameworks/four-horsemen.md', minBytes: 1500 },
  { path: 'references/frameworks/attachment-theory.md', minBytes: 1500 },
  { path: 'references/frameworks/investment-model.md', minBytes: 1500 },
  { path: 'references/frameworks/active-constructive-responding.md', minBytes: 1200 },
  { path: 'references/safety/surveillance-refusal.md', minBytes: 1200 },
  { path: 'references/safety/disclaimers.md', minBytes: 1000 },
  { path: 'references/safety/referral-guidance.md', minBytes: 1000 },
  { path: 'references/prompts/relationship-satisfaction-self-reflection.md', minBytes: 1000 },
  { path: 'references/prompts/four-horsemen-exercises.md', minBytes: 1000 },
  { path: 'references/prompts/attachment-reflection.md', minBytes: 1000 },
  { path: 'references/prompts/investment-model-exercise.md', minBytes: 900 },
  { path: 'references/prompts/acr-exercises.md', minBytes: 1000 },
  { path: 'references/assessments/sound-relationship-house-checklist.md', minBytes: 800 },
  { path: 'references/assessments/four-horsemen-self-check.md', minBytes: 800 },
  { path: 'references/assessments/commitment-reflection.md', minBytes: 800 },
  { path: 'references/assessments/acr-self-check.md', minBytes: 800 },
  { path: 'assets/templates/disclaimer.md', minBytes: 400 },
  { path: 'assets/templates/refusal-response.md', minBytes: 400 },
  { path: 'assets/templates/referral-response.md', minBytes: 400 },
  { path: 'assets/templates/fallback-response.md', minBytes: 300 },
  { path: 'assets/schemas/input-schemas.json', minBytes: 800 },
  { path: 'assets/schemas/output-schemas.json', minBytes: 800 },
  { path: 'assets/diagrams/system-architecture.md', minBytes: 1500 },
  { path: 'RESEARCH-PAPER-KNOWLEDGE-BRAIN.md', minBytes: 8000 },
  { path: 'SECOND-BRAIN-KNOWLEDGE-PAPER.md', minBytes: 2000 },
  { path: 'LICENSE', minBytes: 1000 },
  { path: 'CHANGELOG.md', minBytes: 2000 },
  { path: 'examples/sample-session.md', minBytes: 2000 },
];

let failures = 0;
for (const r of REQUIRED) {
  const full = join(root, r.path);
  if (!existsSync(full)) {
    console.error('MISSING: ' + r.path);
    failures++;
    continue;
  }
  const stat = readFileSync(full);
  if (stat.length < r.minBytes) {
    console.error('TOO SHORT (' + stat.length + ' < ' + r.minBytes + '): ' + r.path);
    failures++;
    continue;
  }
  console.log('OK   ' + r.path + ' (' + stat.length + ' bytes)');
}

if (failures > 0) {
  console.error('\n' + failures + ' reference(s) missing or too short.');
  process.exit(1);
}
console.log('\nAll ' + REQUIRED.length + ' reference files present and non-empty.');
