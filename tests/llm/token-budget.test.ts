import { describe, it, expect } from '../harness.js';
import { estimateTokens, assembleContext, buildReferenceSnippets } from '../../src/llm/token-budget.js';

describe('token budget', () => {
  it('estimates ~1 token per 4 chars', () => {
    expect(estimateTokens('')).toBe(0);
    expect(estimateTokens('abcd')).toBe(1);
    expect(estimateTokens('abcdefgh')).toBe(2);
  });

  it('keeps mandatory (priority >= 100) snippets whole even when over budget', () => {
    const snippets = [{ id: 'must', content: 'x'.repeat(200), priority: 100 }];
    const out = assembleContext(snippets, 50);
    expect(out).toContain('x');
  });

  it('trims lower-priority snippets to fit the budget', () => {
    const snippets = [
      { id: 'a', content: 'A'.repeat(400), priority: 80 },
      { id: 'b', content: 'B'.repeat(400), priority: 20 },
    ];
    const out = assembleContext(snippets, 100); // 100 tokens ~ 400 chars
    expect(out).toContain('A');
    expect(out.length < 900).toBeTrue();
  });

  it('builds reference snippets with safety highest priority', () => {
    const s = buildReferenceSnippets({ frameworkRef: 'f', promptRef: 'p', safetyRef: 's' });
    const safety = s.find((x) => x.id === 'safety')!;
    expect(safety.priority > 80).toBeTrue();
  });
});
