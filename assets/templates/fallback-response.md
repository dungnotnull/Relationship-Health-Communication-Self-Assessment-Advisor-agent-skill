# Fallback Response Template

> Returned when execution fails (LLM error, tool failure, unexpected exception). Ensures the user is never left with silence and always receives safety guidance.

## Template

```
**Apologies — I'm having trouble processing that right now.**

Please try again in a moment.

If you were asking about a serious relationship concern, consider reaching out to a
licensed couples counselor or marriage and family therapist. If you feel unsafe,
contact a domestic-violence hotline (US: 1-800-799-7233 or text START to 88788) or
emergency services.

**Disclaimer:** This skill provides general, educational information only and is not a
substitute for professional advice.
```

## Enforcement

- `config/hooks/chain.ts` → `OnErrorHook` returns this fallback.
- `src/agents/orchestrator.ts` wraps handler execution in try/catch and falls back here.
