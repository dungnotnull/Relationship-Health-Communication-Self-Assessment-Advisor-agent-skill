# Disclaimer Template (authoritative copy)

> Do not edit free-form copies elsewhere. The runtime source of truth is `config/config.ts` → `DISCLAIMER_TEMPLATE`. This file documents the template and when to use each variant.

## Standing disclaimer (every substantive response)

```
**Disclaimer:** This skill provides general, educational/analytical information only.
It is not a substitute for advice from a qualified relationship counselor, couples
therapist, marriage and family therapist, or other licensed professional. It does not
predict whether a partner is being unfaithful, will leave, or has any particular
intentions. For decisions with real consequences, consult a qualified professional.

If you are experiencing intimate-partner violence or feel unsafe, contact a local
domestic-violence hotline or emergency services immediately.
```

## Short disclaimer (refusals)

```
**Disclaimer:** This skill provides general, educational information only and is not a
substitute for professional advice.
```

## Crisis disclaimer (violence/safety responses)

```
**Disclaimer:** This skill provides general, educational information only and is not a
substitute for professional help.
```

## Enforcement

- `config/hooks/chain.ts` → `AfterExecutionHook` appends the standing disclaimer if missing.
- Each skill handler in `src/agents/skills/registry.ts` appends the standing disclaimer.
- The disclaimer must never be softened or dropped at user request.
