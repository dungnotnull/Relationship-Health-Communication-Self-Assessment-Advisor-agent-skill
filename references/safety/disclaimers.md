# Disclaimers — Required Templates

> **Mandatory:** every substantive response produced under this skill must include the standing disclaimer. Do not soften or drop it, even if the user asks.

## Standing disclaimer (educational, non-professional)

```
**Disclaimer:** This skill provides general, educational/analytical information only.
It is not a substitute for advice from a qualified relationship counselor, couples
therapist, marriage and family therapist, or other licensed professional. It does not
predict whether a partner is being unfaithful, will leave, or has any particular
intentions. For decisions with real consequences, consult a qualified professional.

If you are experiencing intimate-partner violence or feel unsafe, contact a local
domestic-violence hotline or emergency services immediately.
```

Source of truth: `config/config.ts` → `DISCLAIMER_TEMPLATE`. Do not duplicate free-form; always reference this source.

## Refusal disclaimer (appended to refusals)

```
**Disclaimer:** This skill provides general, educational information only and is not a
substitute for professional advice.
```

## Violence / crisis disclaimer (used in crisis responses)

```
**Disclaimer:** This skill provides general, educational information only and is not a
substitute for professional help.
```

## When to attach a professional-referral recommendation

Append a referral recommendation (not a disclaimer swap) when:
- A self-check lands in the “Needs attention” / “Elevated risk” / “Undermining capitalization” / “Low commitment signals” band.
- Serious-conflict indicators are present (see `config/safety/guardrails.ts` → `SERIOUS_CONFLICT_INDICATORS`).
- The user mentions persistent distress.

Referral content: see `references/safety/referral-guidance.md`.

## Non-diagnostic language rule

Never produce statements like “you have / your partner has [disorder].” Use population-level framing: “at a population level, this pattern is associated with…” and recommend professional assessment for clinical concerns.
