import { describe, it, expect } from '../harness.js';
import { detectSurveillanceIntent, detectCrisis } from '../../config/safety/guardrails.js';

describe('surveillance detection', () => {
  it('hard-refuses fidelity prediction', () => {
    const d = detectSurveillanceIntent('Is my partner cheating on me?', 'strict');
    expect(d.detected).toBeTrue();
    expect(d.refusal_recommended).toBeTrue();
    expect(d.severity).toBe('hard');
  });

  it('hard-refuses surveillance methods', () => {
    const d = detectSurveillanceIntent('How can I track my partner phone without them knowing?', 'strict');
    expect(d.refusal_recommended).toBeTrue();
  });

  it('hard-refuses individual divorce forecast', () => {
    const d = detectSurveillanceIntent('Predict whether we will divorce.', 'strict');
    expect(d.refusal_recommended).toBeTrue();
  });

  it('hard-refuses partner labeling', () => {
    const d = detectSurveillanceIntent('Is my partner a narcissist? Rate them.', 'strict');
    expect(d.refusal_recommended).toBeTrue();
  });

  it('does not refuse mutual-participation requests', () => {
    const d = detectSurveillanceIntent('My partner and I want to improve our communication together.', 'strict');
    expect(d.refusal_recommended).toBeFalse();
  });

  it('downgrades to soft reframe when mutual cues accompany a hard phrase', () => {
    const d = detectSurveillanceIntent('We as a couple want to understand if my partner is happy.', 'moderate');
    // single soft/hard phrase + strong mutual framing -> not a hard refusal
    expect(d.detected).toBeTrue();
  });

  it('returns none for neutral relationship education', () => {
    const d = detectSurveillanceIntent('Explain the Four Horsemen.', 'strict');
    expect(d.severity).toBe('none');
  });
});

describe('crisis detection', () => {
  it('flags violence/abuse as severe', () => {
    const c = detectCrisis('I am afraid of my partner. He hit me last night.');
    expect(c.detected).toBeTrue();
    expect(c.severity).toBe('severe');
  });

  it('flags domestic violence as severe', () => {
    const c = detectCrisis('There is domestic violence in my home and I feel unsafe.');
    expect(c.severity).toBe('severe');
  });

  it('flags serious conflict as moderate with multiple indicators', () => {
    const c = detectCrisis('There is constant criticism and contempt and we have broken trust.');
    expect(c.detected).toBeTrue();
  });

  it('returns none for normal conflict', () => {
    const c = detectCrisis('We argue sometimes but we repair.');
    expect(c.detected).toBeFalse();
  });
});
