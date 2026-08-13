/**
 * Configuration Schemas — Relationship Health & Communication Self-Assessment Advisor
 *
 * TypeScript type definitions and JSON schemas for configuration validation,
 * hook chain, tool registry, skill registry, and agent state management.
 */

// ============================================================================
// HOOK SYSTEM TYPES
// ============================================================================

export type HookPhase =
  | 'before_request'
  | 'after_routing'
  | 'before_execution'
  | 'after_execution'
  | 'on_error'
  | 'on_refusal'
  | 'on_crisis_detected';

export interface HookContext {
  phase: HookPhase;
  session_id: string;
  timestamp: string;
  input: unknown;
  output?: unknown;
  error?: Error;
  metadata: Record<string, unknown>;
  agent_state: AgentState;
}

export interface HookResult {
  continue: boolean;
  modified_context?: Partial<HookContext>;
  response?: unknown;
}

export interface Hook {
  name: string;
  phase: HookPhase;
  priority: number;
  execute: (context: HookContext) => Promise<HookResult | void>;
}

// ============================================================================
// TOOL SYSTEM TYPES
// ============================================================================

export interface JSONSchema {
  type: string;
  properties?: Record<string, JSONSchema>;
  required?: string[];
  items?: JSONSchema;
  enum?: unknown[];
  description?: string;
  additionalProperties?: boolean | JSONSchema;
  minimum?: number;
  maximum?: number;
}

export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  execution_time_ms?: number;
  tokens_used?: number;
}

export type ToolHandler<TInput = unknown, TOutput = unknown> = (
  input: TInput,
  context: ToolExecutionContext
) => Promise<ToolResult<TOutput>>;

export interface ToolExecutionContext {
  session_id: string;
  config: Config;
  agent_state: AgentState;
  logger: Logger;
}

export interface ToolDefinition<TInput = unknown, TOutput = unknown> {
  id: string;
  name: string;
  description: string;
  input_schema: JSONSchema;
  output_schema: JSONSchema;
  handler: ToolHandler<TInput, TOutput>;
  requires_professional_referral?: boolean;
  refusal_trigger?: boolean;
  crisis_keywords?: string[];
  timeout_ms: number;
  max_retries: number;
  frameworks?: string[];
  version: string;
}

// ============================================================================
// SKILL SYSTEM TYPES
// ============================================================================

export interface SafetyPredicate {
  name: string;
  check: (input: unknown) => boolean;
  error_message: string;
}

export type SkillHandler<TInput = unknown, TOutput = unknown> = (
  input: TInput,
  context: SkillExecutionContext
) => Promise<TOutput>;

export interface SkillExecutionContext {
  session_id: string;
  config: Config;
  agent_state: AgentState;
  logger: Logger;
  tools: ToolRegistry;
  references: ReferenceStore;
}

export interface SkillRegistration<TInput = unknown, TOutput = unknown> {
  id: string;
  name: string;
  description: string;
  input_schema: JSONSchema;
  output_schema: JSONSchema;
  trigger_phrases: string[];
  trigger_contexts: string[];
  safety_predicates: SafetyPredicate[];
  crisis_keywords: string[];
  requires_disclaimer: boolean;
  requires_mutual_consent: boolean;
  handler: SkillHandler<TInput, TOutput>;
  fallback_response?: string;
  frameworks: string[];
  version: string;
  dependencies?: string[];
}

// ============================================================================
// AGENT STATE TYPES
// ============================================================================

export type RiskLevel = 'none' | 'elevated' | 'crisis';
export type ConsentMode = 'mutual' | 'individual' | 'unknown';

export interface UserContext {
  locale: string;
  timezone: string;
  risk_level: RiskLevel;
  consent_mode: ConsentMode;
  serious_conflict_indicators: boolean;
}

export interface ConversationTurn {
  timestamp: string;
  user_input: string;
  skill_used: string | null;
  response_summary: string;
  crisis_detected: boolean;
  refusal_triggered: boolean;
}

export interface ConversationState {
  turn_count: number;
  last_skill_used: string | null;
  detected_crisis: boolean;
  detected_surveillance_intent: boolean;
  history: ConversationTurn[];
}

export interface MetricsState {
  tokens_used: number;
  execution_time_ms: number;
  error_count: number;
  crisis_flags: number;
  refusal_flags: number;
}

export interface AgentState {
  session_id: string;
  started_at: string;
  updated_at: string;
  user_context: UserContext;
  conversation: ConversationState;
  metrics: MetricsState;
}

// ============================================================================
// LOGGING TYPES
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  message?: string;
  level: LogLevel;
  phase: string;
  session_id: string;
  input_summary?: string;
  output_summary?: string;
  error?: Error;
  duration_ms?: number;
  tokens_used?: number;
  context?: Record<string, unknown>;
}

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error, context?: Record<string, unknown>): void;
}

// ============================================================================
// REGISTRY INTERFACES
// ============================================================================

export interface ToolRegistry {
  register<TInput, TOutput>(tool: ToolDefinition<TInput, TOutput>): void;
  get(id: string): ToolDefinition | undefined;
  execute<TInput, TOutput>(id: string, input: TInput): Promise<ToolResult<TOutput>>;
  list(): ToolDefinition[];
}

export interface SkillRegistry {
  register<TInput, TOutput>(skill: SkillRegistration<TInput, TOutput>): void;
  get(id: string): SkillRegistration | undefined;
  resolve(input: string): SkillRegistration[];
  list(): SkillRegistration[];
}

export interface ReferenceStore {
  load(path: string): Promise<string>;
  loadSync(path: string): string;
  list(pattern?: string): string[];
}

// ============================================================================
// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export type Environment = 'development' | 'testing' | 'production';

export interface ModelConfig {
  provider: 'anthropic' | 'openai' | 'local';
  model_id: string;
  api_key?: string;
  temperature: number;
  max_tokens: number;
  timeout_ms: number;
}

export type SurveillanceSensitivity = 'strict' | 'moderate' | 'permissive';

export interface SafetyConfig {
  surveillance_detection_sensitivity: SurveillanceSensitivity;
  refuse_one_sided_profiling: boolean;
  mutual_consent_required: boolean;
  diagnostic_filtering: boolean;
  diagnostic_keywords: string[];
  required_disclaimer: boolean;
  disclaimer_template: string;
  refusal_template: string;
  referral_triggers: string[];
}

export interface FeatureConfig {
  enable_analytics: boolean;
  enable_caching: boolean;
  enable_fallback_responses: boolean;
  enable_audit_logging: boolean;
  enable_metrics: boolean;
  enable_citation_injection: boolean;
  // LLM call path
  enable_llm: boolean;
  llm_strict_post_validation: boolean;
  llm_max_context_tokens: number;
  llm_mock: boolean;
}

export type LogDestination = 'stderr' | 'file' | 'silent';

export interface ObservabilityConfig {
  log_level: LogLevel;
  log_destination: LogDestination;
  log_file_path?: string;
  redact_pii: boolean;
  audit_safety_events: boolean;
  sample_rate: number; // 0..1, fraction of requests to emit debug logs for
}

export interface PathConfig {
  references: string;
  scripts: string;
  assets: string;
  cache?: string;
  logs?: string;
}

export interface Config {
  version: string;
  environment: Environment;
  model: ModelConfig;
  safety: SafetyConfig;
  features: FeatureConfig;
  paths: PathConfig;
  observability: ObservabilityConfig;
}
