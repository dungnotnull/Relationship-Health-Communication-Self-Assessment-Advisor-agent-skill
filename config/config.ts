/**
 * Configuration Loader — Relationship Health & Communication Self-Assessment Advisor
 *
 * Type-safe configuration management with environment variable handling,
 * schema validation, default value resolution, and environment overrides.
 */

import type {
  Config,
  ModelConfig,
  SafetyConfig,
  FeatureConfig,
  PathConfig,
  ObservabilityConfig,
} from './schemas.js';

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULT_MODEL: ModelConfig = {
  provider: 'anthropic',
  model_id: 'claude-opus-4-7',
  api_key: undefined,
  temperature: 0.7,
  max_tokens: 4096,
  timeout_ms: 30000,
};

const DISCLAIMER_TEMPLATE = [
  '**Disclaimer:** This skill provides general, educational/analytical information only.',
  'It is not a substitute for advice from a qualified relationship counselor, couples',
  'therapist, marriage and family therapist, or other licensed professional. It does not',
  'predict whether a partner is being unfaithful, will leave, or has any particular',
  'intentions. For decisions with real consequences, consult a qualified professional.',
  '',
  'If you are experiencing intimate-partner violence or feel unsafe, contact a local',
  'domestic-violence hotline or emergency services immediately.',
].join('\n');

const REFUSAL_TEMPLATE = [
  'I can not help with that.',
  '',
  'This skill is designed for **mutual** relationship-satisfaction self-reflection by a',
  'couple (or an individual reflecting on their *own* relationship), not for assessing,',
  'profiling, surveilling, or predicting the behavior, fidelity, or intentions of a',
  'specific partner without their knowledge and participation.',
  '',
  'What I *can* do instead:',
  '- Guide a mutual, structured self-reflection on communication and relationship',
  '  satisfaction using evidence-based frameworks (Gottman, attachment, Investment Model).',
  '- Explain communication patterns (e.g., the Four Horsemen) and their antidotes.',
  '- Suggest communication exercises you and your partner can do *together*.',
  '',
  'If serious conflict or distress is present, I will encourage consulting a qualified',
  'couples counselor or therapist.',
  '',
  '**Disclaimer:** This skill provides general, educational information only and is not a',
  'substitute for professional advice.',
].join('\n');

const DEFAULT_SAFETY: SafetyConfig = {
  surveillance_detection_sensitivity: 'strict',
  refuse_one_sided_profiling: true,
  mutual_consent_required: true,
  diagnostic_filtering: true,
  diagnostic_keywords: [
    'diagnos',
    'disorder',
    'pathology',
    'clinical condition',
    'treatment for',
    'therapy for',
  ],
  required_disclaimer: true,
  disclaimer_template: DISCLAIMER_TEMPLATE,
  refusal_template: REFUSAL_TEMPLATE,
  referral_triggers: [
    'abuse',
    'domestic violence',
    'intimate partner violence',
    'afraid of my partner',
    'hit me',
    'controlling',
    'threaten',
    'unsafe',
  ],
};

const DEFAULT_FEATURES: FeatureConfig = {
  enable_analytics: false,
  enable_caching: true,
  enable_fallback_responses: true,
  enable_audit_logging: true,
  enable_metrics: true,
  enable_citation_injection: true,
  enable_llm: false,
  llm_strict_post_validation: true,
  llm_max_context_tokens: 60000,
  llm_mock: false,
};

const DEFAULT_OBSERVABILITY: ObservabilityConfig = {
  log_level: 'info',
  log_destination: 'stderr',
  log_file_path: undefined,
  redact_pii: true,
  audit_safety_events: true,
  sample_rate: 0.1,
};

const DEFAULT_PATHS: PathConfig = {
  references: './references',
  scripts: './scripts',
  assets: './assets',
  cache: './cache',
  logs: './logs',
};

// ============================================================================
// ENVIRONMENT VARIABLE MAPPINGS
// ============================================================================

const ENV_MAPPINGS: Record<string, keyof Config> = {
  MODEL_PROVIDER: 'model',
  MODEL_ID: 'model',
  API_KEY: 'model',
  MODEL_TEMPERATURE: 'model',
  MODEL_MAX_TOKENS: 'model',
  MODEL_TIMEOUT_MS: 'model',
  SAFETY_SURVEILLANCE_SENSITIVITY: 'safety',
  SAFETY_REFUSE_ONE_SIDED: 'safety',
  SAFETY_MUTUAL_CONSENT_REQUIRED: 'safety',
  SAFETY_DIAGNOSTIC_FILTERING: 'safety',
  SAFETY_REQUIRED_DISCLAIMER: 'safety',
  ENABLE_ANALYTICS: 'features',
  ENABLE_CACHING: 'features',
  ENABLE_FALLBACK_RESPONSES: 'features',
  ENABLE_AUDIT_LOGGING: 'features',
  ENABLE_METRICS: 'features',
  ENABLE_CITATION_INJECTION: 'features',
  PATH_REFERENCES: 'paths',
  PATH_SCRIPTS: 'paths',
  PATH_ASSETS: 'paths',
  PATH_CACHE: 'paths',
  PATH_LOGS: 'paths',
  NODE_ENV: 'environment',
};

// ============================================================================
// CONFIGURATION LOADER
// ============================================================================

export function loadConfig(): Config {
  const env = process.env;

  const config: Config = {
    version: '1.0.0',
    environment: (env.NODE_ENV as Config['environment']) || 'development',

    model: {
      ...DEFAULT_MODEL,
      provider: (env.MODEL_PROVIDER as ModelConfig['provider']) || DEFAULT_MODEL.provider,
      model_id: env.MODEL_ID || DEFAULT_MODEL.model_id,
      api_key: env.API_KEY,
      temperature: env.MODEL_TEMPERATURE ? parseFloat(env.MODEL_TEMPERATURE) : DEFAULT_MODEL.temperature,
      max_tokens: env.MODEL_MAX_TOKENS ? parseInt(env.MODEL_MAX_TOKENS, 10) : DEFAULT_MODEL.max_tokens,
      timeout_ms: env.MODEL_TIMEOUT_MS ? parseInt(env.MODEL_TIMEOUT_MS, 10) : DEFAULT_MODEL.timeout_ms,
    },

    safety: {
      ...DEFAULT_SAFETY,
      surveillance_detection_sensitivity:
        (env.SAFETY_SURVEILLANCE_SENSITIVITY as SafetyConfig['surveillance_detection_sensitivity']) ||
        DEFAULT_SAFETY.surveillance_detection_sensitivity,
      refuse_one_sided_profiling: env.SAFETY_REFUSE_ONE_SIDED !== 'false',
      mutual_consent_required: env.SAFETY_MUTUAL_CONSENT_REQUIRED !== 'false',
      diagnostic_filtering: env.SAFETY_DIAGNOSTIC_FILTERING !== 'false',
      required_disclaimer: env.SAFETY_REQUIRED_DISCLAIMER !== 'false',
    },

    features: {
      ...DEFAULT_FEATURES,
      enable_analytics: env.ENABLE_ANALYTICS === 'true',
      enable_caching: env.ENABLE_CACHING !== 'false',
      enable_fallback_responses: env.ENABLE_FALLBACK_RESPONSES !== 'false',
      enable_audit_logging: env.ENABLE_AUDIT_LOGGING !== 'false',
      enable_metrics: env.ENABLE_METRICS !== 'false',
      enable_citation_injection: env.ENABLE_CITATION_INJECTION !== 'false',
      enable_llm: env.ENABLE_LLM === 'true',
      llm_strict_post_validation: env.LLM_STRICT_POST_VALIDATION !== 'false',
      llm_max_context_tokens: env.LLM_MAX_CONTEXT_TOKENS ? parseInt(env.LLM_MAX_CONTEXT_TOKENS, 10) : DEFAULT_FEATURES.llm_max_context_tokens,
      llm_mock: env.LLM_MOCK === 'true',
    },

    observability: {
      ...DEFAULT_OBSERVABILITY,
      log_level: (env.LOG_LEVEL as ObservabilityConfig['log_level']) || DEFAULT_OBSERVABILITY.log_level,
      log_destination: (env.LOG_DESTINATION as ObservabilityConfig['log_destination']) || DEFAULT_OBSERVABILITY.log_destination,
      log_file_path: env.LOG_FILE_PATH || DEFAULT_OBSERVABILITY.log_file_path,
      redact_pii: env.REDACT_PII !== 'false',
      audit_safety_events: env.AUDIT_SAFETY_EVENTS !== 'false',
      sample_rate: env.LOG_SAMPLE_RATE ? parseFloat(env.LOG_SAMPLE_RATE) : DEFAULT_OBSERVABILITY.sample_rate,
    },

    paths: {
      ...DEFAULT_PATHS,
      references: env.PATH_REFERENCES || DEFAULT_PATHS.references,
      scripts: env.PATH_SCRIPTS || DEFAULT_PATHS.scripts,
      assets: env.PATH_ASSETS || DEFAULT_PATHS.assets,
      cache: env.PATH_CACHE || DEFAULT_PATHS.cache,
      logs: env.PATH_LOGS || DEFAULT_PATHS.logs,
    },
  };

  return config;
}

export function validateConfig(config: Config): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.model.model_id) errors.push('MODEL_ID is required');
  if (config.model.temperature < 0 || config.model.temperature > 1) {
    errors.push('MODEL_TEMPERATURE must be between 0 and 1');
  }
  if (config.model.max_tokens <= 0) errors.push('MODEL_MAX_TOKENS must be positive');

  const validSensitivities = ['strict', 'moderate', 'permissive'];
  if (!validSensitivities.includes(config.safety.surveillance_detection_sensitivity)) {
    errors.push('Invalid surveillance_detection_sensitivity');
  }

  if (config.features.enable_llm && !config.model.api_key && !config.features.llm_mock) {
    errors.push('ENABLE_LLM requires API_KEY or LLM_MOCK=true');
  }
  if (config.features.llm_max_context_tokens <= 0) {
    errors.push('LLM_MAX_CONTEXT_TOKENS must be positive');
  }
  const validEnvironments = ['development', 'testing', 'production'];
  if (!validEnvironments.includes(config.environment)) {
    errors.push('Invalid NODE_ENV');
  }

  return { valid: errors.length === 0, errors };
}

export function getEnvironmentOverrides(environment: Config['environment']): Partial<Config> {
  const overrides: Record<Config['environment'], Partial<Config>> = {
    development: {
      safety: { ...DEFAULT_SAFETY, surveillance_detection_sensitivity: 'moderate' },
      features: { ...DEFAULT_FEATURES, enable_audit_logging: true, enable_metrics: true },
    },
    testing: {
      safety: { ...DEFAULT_SAFETY, surveillance_detection_sensitivity: 'moderate' },
      features: { ...DEFAULT_FEATURES, enable_caching: false, enable_analytics: false },
    },
    production: {
      safety: { ...DEFAULT_SAFETY, surveillance_detection_sensitivity: 'strict' },
      features: { ...DEFAULT_FEATURES, enable_audit_logging: true, enable_metrics: true },
    },
  };
  return overrides[environment] || {};
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let cachedConfig: Config | null = null;

export function getConfig(): Config {
  if (!cachedConfig) {
    cachedConfig = loadConfig();
    const validation = validateConfig(cachedConfig);
    if (!validation.valid) {
      console.error('Configuration validation failed:', validation.errors);
      throw new Error('Invalid configuration: ' + validation.errors.join(', '));
    }
  }
  return cachedConfig;
}

export function resetConfig(): void {
  cachedConfig = null;
}

export { DEFAULT_MODEL, DEFAULT_SAFETY, DEFAULT_FEATURES, DEFAULT_OBSERVABILITY, DEFAULT_PATHS, ENV_MAPPINGS };
