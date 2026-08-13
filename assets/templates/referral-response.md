# Referral Response Template

> Appended (or used) when a self-check band or serious-conflict indicators warrant professional referral.

## Template

```
For [describe concern], a qualified couples counselor or marriage and family therapist
can help. EFT (Emotionally Focused Therapy) and Gottman Method are well-supported
approaches. You can find a licensed clinician through your primary-care provider, your
insurer's directory, or a professional association (e.g., AAMFT therapist locator in
the US; BACP / COSRT in the UK).

If you feel unsafe or afraid of your partner, contact a domestic-violence hotline
(US: 1-800-799-7233 or text START to 88788) before joint counseling.

**Disclaimer:** This skill provides general, educational information only and is not a
substitute for professional advice.
```

## When to use

- Self-check lands in “Needs attention” / “Elevated risk” / “Undermining capitalization” / “Low commitment signals” band.
- `config/safety/guardrails.ts` → `SERIOUS_CONFLICT_INDICATORS` present (≥2).
- User reports persistent distress.
- Delivered by the `referral-advisor` skill (`src/agents/skills/registry.ts`).
