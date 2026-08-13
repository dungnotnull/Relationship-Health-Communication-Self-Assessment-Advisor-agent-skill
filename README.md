# Relationship Health & Communication Self-Assessment Advisor

> [Disclaimer] Evidence-based, **mutual** relationship-satisfaction self-reflection for couples — not partner surveillance.

**Category:** Relationship Psychology (Disclaimer Required)

> **Disclaimer:** This skill provides general, educational/analytical information only. It is not a substitute for advice from a qualified relationship counselor, couples therapist, marriage and family therapist, or other licensed professional. It does not predict whether a partner is being unfaithful, will leave, or has any particular intentions. Always consult a qualified professional before making decisions based on its output. If you are experiencing intimate-partner violence or feel unsafe, contact a local domestic-violence hotline or emergency services immediately.

## Overview

A skill for a couple to use together (or an individual reflecting on their *own* relationship) to assess relationship health and communication patterns using validated relationship-science frameworks. It explicitly **does not** predict whether a partner is being unfaithful or will leave, does **not** support surveilling or profiling a partner without their knowledge, and reframes "divorce risk" questions toward actionable, mutual communication and relationship-satisfaction improvement grounded in the Gottman Institute's and other researchers' empirical work.

## Status

**Production-ready, open-source-standard Claude Skill — v1.0.0** (2026-08-04). See `PROJECT-DEVELOPMENT-PHASE-TRACKING.md` (all phases 100% complete).

## Core Capabilities

- Guide a structured relationship-satisfaction self-reflection (Gottman Sound Relationship House domains: friendship, conflict management, shared meaning)
- Explain the Four Horsemen (criticism, contempt, defensiveness, stonewalling) as communication patterns to address together, with their antidotes
- Suggest evidence-based communication exercises for couples
- Provide non-diagnostic attachment-pattern reflection
- Reframe "will we last / divorce risk" questions toward what supports commitment now (Investment Model)
- Teach Active-Constructive Responding (capitalization) for good-news moments
- Explain what longitudinal relationship-science research says about healthy-relationship predictors, in general/population terms
- Explicitly **decline** requests to assess, profile, or predict a specific partner's fidelity or intentions without their participation
- Encourage couples counseling for persistent, serious conflict; surface crisis resources when violence/abuse is present

## Key Methodologies & Frameworks

- **Gottman Sound Relationship House theory**
- **The Four Horsemen framework (Gottman)** + antidotes
- **Attachment theory (Bowlby, Ainsworth)** applied to adult relationships
- **Investment Model of Commitment (Rusbult)**
- **Active-Constructive Responding (Gable & Reis)**

## Architecture

A safety-first, modular system: chain-of-thought router + declarative skill registry (8 skills) + schema-validated tool registry (6 tools) + 10-hook lifecycle chain + type-safe configuration. Surveillance refusal and violence/crisis surfacing are enforced as the first routing decisions, before any framework content. See `docs/ARCHITECTURE.md` and `assets/diagrams/system-architecture.md`.

## Project Layout

| Path | Purpose |
|---|---|
| `SKILL.md` | Main skill definition + registry documentation |
| `CLAUDE.md` | Operating instructions for Claude when running this skill |
| `PROJECT-detail.md` | Functional and technical specification |
| `DEVELOPMENT-TASK-BY-PHASES.md` | Phased build plan |
| `SECOND-BRAIN-KNOWLEDGE-PAPER.md` | Curated research-paper knowledge base |
| `PROJECT-DEVELOPMENT-PHASE-TRACKING.md` | Phase completion tracking (100%) |
| `DEVELOPMENT-TRACKING.md` | Ongoing development memory |
| `docs/` | Architecture + directory-structure docs |
| `config/` | Type-safe configuration + registries (skills, hooks, tools, citations, assessments, safety, cultural) |
| `src/agents/` | Runtime: orchestrator, router, skill handlers, safety detectors |
| `references/` | Framework operational principles, safety references, prompt libraries, assessment templates |
| `assets/` | Response templates, JSON schemas, system diagram |
| `scripts/` | Setup, maintenance, and utility automation |
| `evals/` | Evaluation registry with assertions |

## Quick Start

```bash
# Validate the reference knowledge base is present
npx tsx scripts/setup/seed-references.ts

# Validate configuration
npx tsx scripts/setup/validate-config.ts

# Run the safety regression battery
npx tsx scripts/maintenance/audit-safety.ts

# Inspect routing decisions
npx tsx scripts/utils/simulate-router.ts

# Run the full eval suite
npx tsx scripts/utils/run-evals.ts
```

Requirements: Node.js >= 18, TypeScript >= 5.0. No runtime npm dependencies for the core skill; use `tsx` or `ts-node` to run scripts.


## Real-LLM call path (optional, v1.1.0)

By default the skill produces responses via deterministic, framework-grounded handlers (no network). Optionally wire a real LLM for richer phrasing:

```bash
ENABLE_LLM=true API_KEY=sk-... MODEL_PROVIDER=anthropic MODEL_ID=claude-opus-4-7 npx tsx scripts/utils/smoke-test.ts
# offline dry-run (no API key):
ENABLE_LLM=true LLM_MOCK=true npm run llm-dry-run
```

The LLM is **safety-bounded**: the orchestrator builds a token-budgeted prompt embedding the 7 hard safety rules + standing disclaimer + reference context, calls the provider with retry/backoff/timeout, then **post-validates** the output (no individual forecasts, no partner labeling, no surveillance help, disclaimer present). On any failure or violation it falls back to the deterministic handler — guardrails are preserved regardless of model behavior. Every response carries `metadata.llm` (`used`, `provider`, `attempts`, `latency_ms`, `post_validation_valid`, `fallback_used`).

Observability: structured JSON logs (stderr/file/silent) with PII redaction and a safety-event audit trail; in-process metrics (counters/timers/gauges). Configure via `LOG_LEVEL`, `LOG_DESTINATION`, `LOG_FILE_PATH`, `REDACT_PII`, `AUDIT_SAFETY_EVENTS` (see `CHANGELOG.md`).

## Guardrails (hard)

- **Refuse** one-sided partner profiling / surveillance / fidelity prediction / individual divorce forecasting, and offer a mutual reframe.
- **Surface crisis resources** immediately when violence/abuse/unsafety is present; couples counseling is contraindicated where ongoing abuse is present.
- **Always include** the standing disclaimer; never soften or drop it.
- **Never label or diagnose** a partner; use population-level framing only.
- **Never produce** a divorce-probability number for an individual couple.

## License

Open-source. Adapt and reuse with attribution; retain the safety guardrails.
