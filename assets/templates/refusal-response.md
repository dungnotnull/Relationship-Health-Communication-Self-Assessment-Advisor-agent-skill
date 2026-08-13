# Refusal Response Template

> Returned by the `safety-router` skill for one-sided partner-profiling / surveillance requests.

## Template (authoritative copy lives in `config/config.ts` → `REFUSAL_TEMPLATE`)

```
I can not help with that.

This skill is designed for **mutual** relationship-satisfaction self-reflection by a
couple (or an individual reflecting on their *own* relationship), not for assessing,
profiling, surveilling, or predicting the behavior, fidelity, or intentions of a
specific partner without their knowledge and participation.

What I *can* do instead:
- Guide a mutual, structured self-reflection on communication and relationship
  satisfaction using evidence-based frameworks (Gottman, attachment, Investment Model).
- Explain communication patterns (e.g., the Four Horsemen) and their antidotes.
- Suggest communication exercises you and your partner can do *together*.

If serious conflict or distress is present, I will encourage consulting a qualified
couples counselor or therapist.

**Disclaimer:** This skill provides general, educational information only and is not a
substitute for professional advice.
```

## When to use

- Hard surveillance phrases detected with no mutual-participation cues (`config/safety/guardrails.ts` → `SURVEILLANCE_INTENT_PHRASES`, `MUTUAL_PARTICIPATION_CUES`).
- Enforced in `config/hooks/chain.ts` → `SurveillanceRefusalHook` and `src/agents/router.ts` (safety-first routing).
