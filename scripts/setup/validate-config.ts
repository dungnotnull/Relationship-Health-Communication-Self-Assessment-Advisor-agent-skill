/**
 * Validate Config — loads config, runs schema validation, prints the result.
 *
 * Usage:  npx tsx scripts/setup/validate-config.ts
 */

import { loadConfig, validateConfig } from '../../config/config.js';

const config = loadConfig();
const result = validateConfig(config);

console.log('Loaded configuration:');
console.log(JSON.stringify({
  version: config.version,
  environment: config.environment,
  model: { provider: config.model.provider, model_id: config.model.model_id, temperature: config.model.temperature, max_tokens: config.model.max_tokens },
  safety: {
    surveillance_detection_sensitivity: config.safety.surveillance_detection_sensitivity,
    refuse_one_sided_profiling: config.safety.refuse_one_sided_profiling,
    mutual_consent_required: config.safety.mutual_consent_required,
    diagnostic_filtering: config.safety.diagnostic_filtering,
    required_disclaimer: config.safety.required_disclaimer,
  },
  features: config.features,
  paths: config.paths,
}, null, 2));

if (!result.valid) {
  console.error('\nConfiguration validation FAILED:');
  for (const e of result.errors) console.error(' - ' + e);
  process.exit(1);
}
console.log('\nConfiguration valid.');
