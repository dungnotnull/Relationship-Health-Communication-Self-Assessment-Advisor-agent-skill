/**
 * LLM Client — provider-agnostic client with retry, exponential backoff +
 * jitter, per-request timeout, and structured logging/metrics.
 *
 * Providers:
 *  - anthropic: Anthropic Messages API (POST https://api.anthropic.com/v1/messages)
 *  - openai:    OpenAI-compatible Chat Completions (POST ${baseURL}/chat/completions)
 *  - mock:      deterministic, offline; returns the request's fallback_text
 *
 * No runtime npm dependencies. Uses global fetch (Node 18+).
 */

import type {
  LLMProvider,
  LLMProviderId,
  LLMRequest,
  LLMResponse,
  RetryPolicy,
} from './types.js';
import { LLMError, DEFAULT_RETRY_POLICY } from './types.js';
import type { Config } from '../../config/schemas.js';
import type { StructuredLogger } from '../../config/observability/logger.js';
import { getMetrics } from '../../config/observability/metrics.js';

// ============================================================================
// ANTHROPIC PROVIDER
// ============================================================================

class AnthropicProvider implements LLMProvider {
  id: LLMProviderId = 'anthropic';
  constructor(private apiKey: string, private model: string) {}

  async invoke(req: LLMRequest): Promise<LLMResponse> {
    const system = req.messages.find((m) => m.role === 'system')?.content || '';
    const userTurns = req.messages.filter((m) => m.role !== 'system').map((m) => ({ role: m.role, content: m.content }));
    const body = {
      model: this.model,
      max_tokens: req.max_tokens,
      temperature: req.temperature,
      system,
      messages: userTurns,
      stop_sequences: req.stop,
    };
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      const retriable = res.status === 429 || res.status >= 500;
      throw new LLMError('Anthropic API error ' + res.status + ': ' + text.slice(0, 300), retriable, res.status, 'anthropic');
    }
    const data = await res.json() as {
      content?: { type: string; text: string }[];
      model: string;
      stop_reason?: string;
      usage?: { input_tokens?: number; output_tokens?: number };
    };
    const content = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
    return {
      content,
      model: data.model,
      provider: 'anthropic',
      input_tokens: data.usage?.input_tokens,
      output_tokens: data.usage?.output_tokens,
      finish_reason: data.stop_reason,
      latency_ms: 0,
      attempts: 1,
    };
  }
}

// ============================================================================
// OPENAI-COMPATIBLE PROVIDER
// ============================================================================

class OpenAIProvider implements LLMProvider {
  id: LLMProviderId = 'openai';
  constructor(private apiKey: string, private model: string, private baseURL: string = 'https://api.openai.com/v1') {}

  async invoke(req: LLMRequest): Promise<LLMResponse> {
    const body = {
      model: this.model,
      max_tokens: req.max_tokens,
      temperature: req.temperature,
      stop: req.stop,
      messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
    };
    const res = await fetch(this.baseURL + '/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer ' + this.apiKey,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      const retriable = res.status === 429 || res.status >= 500;
      throw new LLMError('OpenAI API error ' + res.status + ': ' + text.slice(0, 300), retriable, res.status, 'openai');
    }
    const data = await res.json() as {
      choices?: { message?: { content?: string }; finish_reason?: string }[];
      model: string;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    const content = data.choices?.[0]?.message?.content || '';
    return {
      content,
      model: data.model,
      provider: 'openai',
      input_tokens: data.usage?.prompt_tokens,
      output_tokens: data.usage?.completion_tokens,
      finish_reason: data.choices?.[0]?.finish_reason,
      latency_ms: 0,
      attempts: 1,
    };
  }
}

// ============================================================================
// MOCK PROVIDER (deterministic, offline)
// ============================================================================

class MockProvider implements LLMProvider {
  id: LLMProviderId = 'mock';
  async invoke(req: LLMRequest): Promise<LLMResponse> {
    // Simulate small latency for realistic metrics.
    await new Promise((r) => setTimeout(r, 5));
    const content = req.fallback_text || 'Mock LLM response (no fallback provided).';
    return {
      content,
      model: 'mock-llm',
      provider: 'mock',
      input_tokens: Math.ceil((req.messages.map((m) => m.content).join(' ').length) / 4),
      output_tokens: Math.ceil(content.length / 4),
      finish_reason: 'stop',
      latency_ms: 5,
      attempts: 1,
    };
  }
}

// ============================================================================
// LLM CLIENT (retry + backoff + timeout)
// ============================================================================

export class LLMClient {
  private provider: LLMProvider;
  private policy: RetryPolicy;
  private logger?: StructuredLogger;
  private modelId: string;

  constructor(config: Config, logger?: StructuredLogger, policy?: RetryPolicy) {
    this.policy = policy || DEFAULT_RETRY_POLICY;
    this.logger = logger;
    this.modelId = config.model.model_id;

    if (config.features.llm_mock) {
      this.provider = new MockProvider();
    } else {
      const key = config.model.api_key;
      if (!key) throw new LLMError('LLM enabled but no API key (set API_KEY or LLM_MOCK=true).', false, undefined, config.model.provider as LLMProviderId);
      if (config.model.provider === 'anthropic') this.provider = new AnthropicProvider(key, config.model.model_id);
      else if (config.model.provider === 'openai') this.provider = new OpenAIProvider(key, config.model.model_id, process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1');
      else throw new LLMError('Unsupported provider: ' + config.model.provider, false, undefined, config.model.provider as LLMProviderId);
    }
  }

  get providerId(): LLMProviderId {
    return this.provider.id;
  }

  async invoke(req: LLMRequest): Promise<LLMResponse> {
    const metrics = getMetrics();
    const start = Date.now();
    let lastError: LLMError | undefined;
    const maxAttempts = this.policy.max_retries + 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timeoutMs = req.timeout_ms || this.policy.timeout_ms;
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        metrics.inc('llm.attempts');
        const res = await this.provider.invoke({ ...req });
        clearTimeout(timer);
        res.latency_ms = Date.now() - start;
        res.attempts = attempt;
        metrics.inc('llm.success');
        metrics.recordTiming('llm.latency_ms', res.latency_ms);
        if (res.input_tokens) metrics.inc('llm.input_tokens', res.input_tokens);
        if (res.output_tokens) metrics.inc('llm.output_tokens', res.output_tokens);
        this.logger?.debug('LLM invoke succeeded', { provider: res.provider, model: res.model, attempt, latency_ms: res.latency_ms, input_tokens: res.input_tokens, output_tokens: res.output_tokens });
        return res;
      } catch (e) {
        clearTimeout(timer);
        const err = e instanceof LLMError ? e : new LLMError(String(e), true, undefined, this.provider.id as LLMProviderId);
        // AbortController.timeout becomes a DOMException named 'TimeoutError' or 'AbortError'
        if (err.name === 'AbortError' || err.name === 'TimeoutError' || /abort/i.test(err.message)) {
          err.message = 'Request timed out after ' + timeoutMs + 'ms';
          err.retriable = true;
        }
        lastError = err;
        metrics.inc('llm.errors');
        metrics.inc('llm.errors.' + (err.retriable ? 'retriable' : 'fatal'));
        this.logger?.warn('LLM invoke failed', { attempt, retriable: err.retriable, status: err.status, message: err.message });

        if (!err.retriable || attempt === maxAttempts) break;
        // Exponential backoff with full jitter.
        const base = this.policy.base_delay_ms * Math.pow(2, attempt - 1);
        const capped = Math.min(base, this.policy.max_delay_ms);
        const delay = Math.round(Math.random() * capped);
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    metrics.inc('llm.failures');
    throw lastError || new LLMError('LLM invoke failed', false, undefined, this.provider.id as LLMProviderId);
  }
}

export { AnthropicProvider, OpenAIProvider, MockProvider };
