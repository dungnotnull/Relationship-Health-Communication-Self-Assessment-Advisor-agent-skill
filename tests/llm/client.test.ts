import { describe, it, expect } from '../harness.js';
import { LLMClient } from '../../src/llm/client.js';
import { LLMError } from '../../src/llm/types.js';
import { getConfig } from '../../config/config.js';

// Build a mock-enabled config without mutating process.env at import time.
function mockConfig() {
  const c = getConfig();
  return { ...c, features: { ...c.features, enable_llm: true, llm_mock: true } };
}

describe('LLM client — Mock provider', () => {
  it('returns the fallback_text from the mock provider', async () => {
    const client = new LLMClient(mockConfig());
    const res = await client.invoke({
      messages: [{ role: 'system', content: 's' }, { role: 'user', content: 'u' }],
      max_tokens: 100,
      temperature: 0.5,
      fallback_text: 'MOCK_RESPONSE',
    });
    expect(res.content).toBe('MOCK_RESPONSE');
    expect(res.provider).toBe('mock');
    expect(res.attempts).toBe(1);
  });

  it('retries on a retriable provider error then fails', async () => {
    // Custom provider that always throws a retriable error.
    const cfg = mockConfig();
    const client = new LLMClient(cfg, undefined, { max_retries: 1, base_delay_ms: 1, max_delay_ms: 2, timeout_ms: 1000 });
    // Replace internal provider with a failing one via casting.
    (client as unknown as { provider: { id: string; invoke: () => Promise<never> } }).provider = {
      id: 'mock',
      invoke: async () => { throw new LLMError('boom', true, 500, 'mock'); },
    };
    let threw = false;
    try {
      await client.invoke({ messages: [], max_tokens: 10, temperature: 0 });
    } catch (e) {
      threw = true;
      expect((e as Error).message).toContain('boom');
    }
    expect(threw).toBeTrue();
  });
});
