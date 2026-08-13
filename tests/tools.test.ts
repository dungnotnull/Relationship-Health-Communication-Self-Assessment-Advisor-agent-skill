import { describe, it, expect } from './harness.js';
import { getToolRegistry, validateInput } from '../config/tools/registry.js';
import type { JSONSchema } from '../config/schemas.js';

const reg = getToolRegistry();

describe('tool registry', () => {
  it('registers all six tools', () => {
    const ids = reg.list().map((t) => t.id);
    expect(ids).toContain('surveillance_detection');
    expect(ids).toContain('crisis_detection');
    expect(ids).toContain('assessment_score');
    expect(ids).toContain('communication_exercise');
    expect(ids).toContain('citation_lookup');
    expect(ids).toContain('progress_check');
  });

  it('surveillance_detection refuses one-sided profiling', async () => {
    const r = await reg.execute('surveillance_detection', { text: 'Is my partner cheating?' });
    expect(r.success).toBeTrue();
    expect((r.data as { refusal_recommended: boolean }).refusal_recommended).toBeTrue();
  });

  it('crisis_detection flags violence', async () => {
    const r = await reg.execute('crisis_detection', { text: 'I am afraid of my partner. He hit me.' });
    expect(r.success).toBeTrue();
    expect((r.data as { severity: string }).severity).toBe('severe');
  });

  it('communication_exercise returns steps for an exercise', async () => {
    const r = await reg.execute('communication_exercise', { exercise_type: 'speaker-listener' });
    expect(r.success).toBeTrue();
    expect((r.data as { steps: string[] }).steps.length > 0).toBeTrue();
  });

  it('communication_exercise supports accommodation-practice', async () => {
    const r = await reg.execute('communication_exercise', { exercise_type: 'accommodation-practice' });
    expect(r.success).toBeTrue();
    expect((r.data as { exercise_name: string }).exercise_name).toBe('Accommodation Practice');
  });

  it('assessment_score scores a valid submission', async () => {
    const r = await reg.execute('assessment_score', { assessment_id: 'four-horsemen-self-check', responses: { fh1: 2, fh2: 1, fh3: 3, fh4: 2 } });
    expect(r.success).toBeTrue();
    expect(typeof (r.data as { normalized_score: number }).normalized_score).toBe('number');
  });

  it('citation_lookup returns citations for a framework', async () => {
    const r = await reg.execute('citation_lookup', { framework: 'Four-Horsemen' });
    expect(r.success).toBeTrue();
    expect((r.data as { count: number }).count > 0).toBeTrue();
  });

  it('validateInput rejects missing required fields', () => {
    const schema: JSONSchema = { type: 'object', required: ['text'] };
    const r = validateInput({}, schema);
    expect(r.valid).toBeFalse();
  });

  it('returns an error for an unknown tool', async () => {
    const r = await reg.execute('nonexistent_tool', {});
    expect(r.success).toBeFalse();
  });
});
