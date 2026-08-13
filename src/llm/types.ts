/**
 * LLM Types — Relationship Health Self-Assessment Advisor
 *
 * Provider-agnostic types for the LLM call path. Supports Anthropic (Messages
 * API) and OpenAI-compatible (Chat Completions) providers, plus a deterministic
 * Mock provider for tests/dry-runs without network access.
 */

export type LLMProviderId = 'anthropic' | 'openai' | 'mock';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  messages: LLMMessage[];
  /** Max output tokens for the response. */
  max_tokens: number;
  /** Sampling temperature. */
  temperature: number;
  /** Optional stop sequences. */
  stop?: string[];
  /** Request timeout in ms (overrides config if provided). */
  timeout_ms?: number;
  /** Metadata for logging/metrics. */
  metadata?: { session_id: string; skill: string; phase: string };
  /** Safe fallback text used by the Mock provider. */
  fallback_text?: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  provider: LLMProviderId;
  input_tokens?: number;
  output_tokens?: number;
  finish_reason?: string;
  latency_ms: number;
  attempts: number;
}

export interface LLMProvider {
  id: LLMProviderId;
  invoke(req: LLMRequest): Promise<LLMResponse>;
}

export interface RetryPolicy {
  max_retries: number;
  base_delay_ms: number;
  max_delay_ms: number;
  timeout_ms: number;
}

export class LLMError extends Error {
  constructor(
    message: string,
    public retriable: boolean,
    public readonly status?: number,
    public readonly provider?: LLMProviderId
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  max_retries: 3,
  base_delay_ms: 500,
  max_delay_ms: 8000,
  timeout_ms: 30000,
};
