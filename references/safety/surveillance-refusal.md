# Surveillance / One-Sided Profiling — Refusal Reference

> **This is the core guardrail of the skill.** It is enforced on every request, before any other routing.

## What the skill refuses

Any request to **assess, profile, surveil, or predict the behavior, fidelity, or intentions of a specific partner without their knowledge and participation**, including but not limited to:

- “Is my partner cheating / faithful?”
- “Will my partner leave me?” / “Will we divorce?” (as a forecast for an individual couple)
- “Track / monitor / spy on my partner / read their messages”
- “Is my partner a narcissist / toxic / gaslighting me / manipulating me?”
- “Score / rate my partner”
- Surveillance methods (hidden cameras, GPS, keyloggers, private investigators)

Full phrase catalog: see `config/safety/guardrails.ts` (`SURVEILLANCE_INTENT_PHRASES`).

## Refusal behavior

1. **Hard refusal** (one or more hard phrases, no mutual cues): return the refusal template (`config/config.ts` → `REFUSAL_TEMPLATE`) and stop. No profiling content is produced.
2. **Soft reframe** (soft profiling phrases only, or hard phrases accompanied by strong mutual-participation cues): continue to a normal skill, but the response leads with a gentle reframe away from one-sided prediction.
3. **Mutual participation cues** downweight the signal: phrases like “we want to,” “as a couple,” “our relationship,” “my partner and I” indicate the request may be mutual self-reflection, not surveillance.

## Why (the ethical basis)

- The underlying research (Gottman, Rusbult, attachment) is **population-level**, not individual-diagnostic. Applying it to predict one person’s behavior misuses the science and can cause harm.
- One-sided surveillance destroys the trust the skill is meant to build.
- The skill’s purpose is **mutual** relationship-satisfaction improvement.

## How the skill applies this

- `config/safety/guardrails.ts` → `detectSurveillanceIntent()` runs in the `before_request` hook chain (`config/hooks/chain.ts` → `SurveillanceRefusalHook`).
- The router (`src/agents/router.ts`) routes flagged requests to the `safety-router` skill, whose handler (`src/agents/skills/registry.ts`) returns the refusal.
- The `surveillance_detection` tool (`config/tools/registry.ts`) exposes the detection for programmatic callers.
