/**
 * Token Budget — context window management for the LLM call path.
 *
 * Estimates tokens (rough: ~4 chars/token for English markdown) and assembles
 * a context payload that fits a configured token budget, prioritising the
 * system/safety prompt and the most relevant reference snippets.
 *
 * Estimation is intentionally conservative (no tokenizer dependency); the
 * real provider tokenizer will further enforce the limit server-side.
 */

export interface ContextSnippet {
  id: string;
  content: string;
  /** Higher priority is retained first when trimming. */
  priority: number;
}

export function estimateTokens(text: string): number {
  if (!text) return 0;
  // ~4 chars per token; round up.
  return Math.ceil(text.length / 4);
}

/**
 * Assemble a context string that fits within `budget_tokens`, keeping
 * mandatory (priority >= 100) snippets whole and trimming lower-priority
 * snippets from the end (by priority order).
 */
export function assembleContext(snippets: ContextSnippet[], budget_tokens: number): string {
  const sorted = [...snippets].sort((a, b) => b.priority - a.priority);
  const kept: string[] = [];
  let used = 0;
  for (const s of sorted) {
    const t = estimateTokens(s.content);
    if (s.priority >= 100) {
      // mandatory: always keep
      kept.push(s.content);
      used += t;
      continue;
    }
    if (used + t <= budget_tokens) {
      kept.push(s.content);
      used += t;
    } else {
      // try to fit a truncated tail
      const remaining = budget_tokens - used;
      if (remaining > 64) {
        const charBudget = remaining * 4;
        kept.push(s.content.slice(0, Math.max(0, charBudget)) + '\n…[trimmed]');
        used = budget_tokens;
      }
    }
  }
  return kept.join('\n\n');
}

/** Build a per-skill reference context from framework + prompt file contents. */
export function buildReferenceSnippets(opts: {
  frameworkRef?: string;
  promptRef?: string;
  safetyRef?: string;
}): ContextSnippet[] {
  const out: ContextSnippet[] = [];
  if (opts.safetyRef) out.push({ id: 'safety', content: opts.safetyRef, priority: 90 });
  if (opts.frameworkRef) out.push({ id: 'framework', content: opts.frameworkRef, priority: 70 });
  if (opts.promptRef) out.push({ id: 'prompts', content: opts.promptRef, priority: 50 });
  return out;
}
