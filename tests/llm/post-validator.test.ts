import { describe, it, expect } from '../harness.js';
import { validateLLMOutput } from '../../src/llm/post-validator.js';

describe('LLM post-validator', () => {
  it('accepts safe output with disclaimer', () => {
    const r = validateLLMOutput('Mutual reflection guidance.\n\n**Disclaimer:** general info only.', { strict: true, requireDisclaimer: true });
    expect(r.valid).toBeTrue();
    expect(r.reasons.length).toBe(0);
  });

  it('auto-appends a missing disclaimer', () => {
    const r = validateLLMOutput('Some guidance with no disclaimer.', { strict: true, requireDisclaimer: true });
    expect(r.cleaned).toContain('**Disclaimer:**');
  });

  it('rejects an individual divorce probability forecast', () => {
    const r = validateLLMOutput('There is a 70% chance you will divorce.\n\n**Disclaimer:** x', { strict: true, requireDisclaimer: true });
    expect(r.valid).toBeFalse();
    expect(r.reasons.join(' ')).toContain('forecast');
  });

  it('rejects fidelity probability forecast', () => {
    const r = validateLLMOutput('There is a 90% likelihood he is cheating.\n\n**Disclaimer:** x', { strict: true, requireDisclaimer: true });
    expect(r.valid).toBeFalse();
  });

  it('rejects partner labeling', () => {
    const r = validateLLMOutput('Your partner is a narcissist.\n\n**Disclaimer:** x', { strict: true, requireDisclaimer: true });
    expect(r.valid).toBeFalse();
    expect(r.reasons.join(' ')).toContain('partner');
  });

  it('rejects partner diagnosis', () => {
    const r = validateLLMOutput('You have borderline personality disorder.\n\n**Disclaimer:** x', { strict: true, requireDisclaimer: true });
    expect(r.valid).toBeFalse();
  });

  it('rejects surveillance assistance', () => {
    const r = validateLLMOutput('To track your partner, install a keylogger on their phone.\n\n**Disclaimer:** x', { strict: true, requireDisclaimer: true });
    expect(r.valid).toBeFalse();
    expect(r.reasons.join(' ')).toContain('surveillance');
  });

  it('allows the word "non-diagnostic" (not a false positive)', () => {
    const r = validateLLMOutput('This is a non-diagnostic reflection.\n\n**Disclaimer:** x', { strict: true, requireDisclaimer: true });
    expect(r.valid).toBeTrue();
  });
});
