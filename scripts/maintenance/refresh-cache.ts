/**
 * Refresh Cache — placeholder-free cache warmer for deterministic tool outputs.
 * Pre-runs the deterministic tools (surveillance/crisis detection, assessment
 * scoring for canonical responses, citation lookup) so first-request latency
 * stays low. Writes a JSON cache file under the configured cache path.
 *
 * Usage:  npx tsx scripts/maintenance/refresh-cache.ts
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../../config/config.js';
import { detectSurveillanceIntent } from '../../config/safety/guardrails.js';
import { detectCrisis } from '../../config/safety/guardrails.js';
import { scoreAssessment, listAssessments } from '../../config/assessments/registry.js';
import { getCitationsByFramework, formatCitation } from '../../config/citations/registry.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const config = loadConfig();

// Canonical surveillance/crisis probes (deterministic; safe to cache).
const cache: Record<string, unknown> = {
  generatedAt: new Date().toISOString(),
  version: config.version,
  surveillanceProbes: {
    'is my partner cheating': detectSurveillanceIntent('is my partner cheating', 'strict'),
    'track my partner': detectSurveillanceIntent('track my partner without them knowing', 'strict'),
    'will my partner leave': detectSurveillanceIntent('will my partner leave me', 'strict'),
  },
  crisisProbes: {
    'afraid of my partner': detectCrisis('I am afraid of my partner, he hit me'),
    'domestic violence': detectCrisis('there is domestic violence and I feel unsafe'),
    'normal': detectCrisis('we argue a lot'),
  },
  assessmentBands: listAssessments().map((a) => ({ id: a.id, name: a.name, bands: a.bands })),
  citations: {
    gottman: getCitationsByFramework('Gottman-Sound-Relationship-House').map(formatCitation),
    fourHorsemen: getCitationsByFramework('Four-Horsemen').map(formatCitation),
    attachment: getCitationsByFramework('Attachment-Theory').map(formatCitation),
    investment: getCitationsByFramework('Investment-Model').map(formatCitation),
    acr: getCitationsByFramework('Active-Constructive-Responding').map(formatCitation),
  },
};

// Smoke-score a canonical four-horsemen response set to ensure scoring works.
try {
  cache['smokeFourHorsemenScore'] = scoreAssessment('four-horsemen-self-check', { fh1: 2, fh2: 1, fh3: 3, fh4: 2 });
} catch (e) {
  cache['smokeFourHorsemenScoreError'] = String(e);
}

const cacheDir = join(root, config.paths.cache || 'cache');
if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });
const out = join(cacheDir, 'tool-cache.json');
writeFileSync(out, JSON.stringify(cache, null, 2), 'utf8');
console.log('Cache written: ' + out + ' (' + JSON.stringify(cache).length + ' bytes)');
