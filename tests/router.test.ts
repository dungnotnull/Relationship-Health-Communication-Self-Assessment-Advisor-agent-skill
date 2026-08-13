import { describe, it, expect } from './harness.js';
import { ChainOfThoughtRouter } from '../src/agents/router.js';
import { getConfig } from '../config/config.js';

const router = new ChainOfThoughtRouter(getConfig());

describe('chain-of-thought router', () => {
  it('routes profiling to safety-router with refusal', () => {
    const d = router.route('Is my partner cheating on me?');
    expect(d.skillId).toBe('safety-router');
    expect(d.refusal).toBeTrue();
  });

  it('routes violence to safety-router with severe crisis', () => {
    const d = router.route('I am afraid of my partner. He hit me.');
    expect(d.skillId).toBe('safety-router');
    expect(d.crisis.severity).toBe('severe');
  });

  it('routes mutual reflection to a non-safety skill', () => {
    const d = router.route('We want to improve our communication together.');
    expect(d.skillId).not.toBe('safety-router');
    expect(d.refusal).toBeFalse();
  });

  it('routes compact four-horsemen form to four-horsemen-education', () => {
    const d = router.route('fh1=2,fh2=1,fh3=3,fh4=2');
    expect(d.skillId).toBe('four-horsemen-education');
  });

  it('routes compact investment form to commitment-reflection', () => {
    const d = router.route('im1=4,im2=5,im3=3,im4=5');
    expect(d.skillId).toBe('commitment-reflection');
  });

  it('routes compact SRH form to satisfaction-reflection', () => {
    const d = router.route('srh1=4,srh2=3,srh3=5,srh4=4,srh5=3,srh6=4,srh7=4');
    expect(d.skillId).toBe('satisfaction-reflection');
  });

  it('routes compact ACR form to acr-coach', () => {
    const d = router.route('acr1=4,acr2=2,acr3=1,acr4=1');
    expect(d.skillId).toBe('acr-coach');
  });

  it('produces a non-empty routing trace', () => {
    const d = router.route('How do I respond when my partner shares good news?');
    expect(d.trace.length > 0).toBeTrue();
  });
});
