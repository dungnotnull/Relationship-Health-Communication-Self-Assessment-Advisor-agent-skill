# Architecture — Relationship Health & Communication Self-Assessment Advisor

## 1. System Overview

This skill implements a **safety-first, mutual-use relationship-education system** built on validated relationship-science frameworks (Gottman Sound Relationship House, Four Horsemen, attachment theory, Investment Model, Active-Constructive Responding) using a chain-of-thought router, a declarative skill registry, schema-validated tools, a lifecycle hook chain, and type-safe configuration.

The single hardest guardrail — **no one-sided partner profiling, surveillance, or individual fidelity/divorce forecasting** — is enforced as the first routing decision, before any framework content is produced.

## 2. Architectural Principles

1. **Safety-first ordering.** Surveillance refusal and violence/crisis surfacing override all other routing.
2. **Mutual-use framing.** Every framework is framed for couples (or self-reflection on one's own relationship), never for diagnosing a named partner.
3. **Declarative registration.** Skills and tools are registered with explicit schemas and triggers, not imperative code.
4. **Auditability.** The router emits a full reasoning trace; every response carries metadata (skill, refusal, crisis, cultural notes, routing trace, tools available, processing time).
5. **Graceful degradation.** LLM/tool failures fall back to a deterministic safety message; the user is never left with silence.
6. **Population-level honesty.** Research findings are described at the population level and never applied as an individual forecast.

## 3. Component Architecture

```
+-----------------------------------------------------------+
|                    AgentOrchestrator                      |
|   (before_request hooks -> router -> handler ->          |
|    after_execution hooks -> AgentResponse)                |
+----------------------------+------------------------------+
                             |
   +-------------------------+-------------------------+
   |                         |                         |
+--+--------+        +--------+--------+      +---------+------+
| Hook Chain|        |  CoT Router     |      | Tool Registry |
| (lifecycle)|        | (safety-first)  |      | (schema'd)    |
+-----------+        +-----------------+      +---------------+
   |                         |                         |
   +-------------------------+-------------------------+
                             |
              +--------------+--------------+
              |              |              |
        +-----+----+   +-----+-----+   +----+-----+
        |  Skills  |   | References|   |  Config  |
        | (handlers)|  |  (ground) |   | (types)  |
        +----------+   +-----------+   +----------+
```

## 4. Request Pipeline

1. **before_request hook chain** (`config/hooks/chain.ts`):
   - `BeforeRequestHook` — state sync, history push.
   - `SurveillanceRefusalHook` — one-sided profiling → hard refusal, or soft reframe marker.
   - `CrisisDetectionHook` — violence/abuse → crisis resources.
   - `DiagnosticFilterHook` — flag diagnostic language for reframing.
2. **ChainOfThoughtRouter** (`src/agents/router.ts`):
   1. Surveillance triage; 2. Crisis triage; 3. Cultural detection; 4. Skill resolution (longest trigger phrase wins); 5. Conflict resolution.
3. **Skill handler** (`src/agents/skills/registry.ts`) — builds framework-grounded markdown, may invoke tools (`assessment_score`, `communication_exercise`, `citation_lookup`), appends the standing disclaimer.
4. **after_execution hook** — metrics + disclaimer enforcement.
5. **AgentResponse** — `{ message, metadata, suggestions }`.

## 5. Skills (8)

| ID | Framework | Purpose |
|----|-----------|---------|
| `satisfaction-reflection` | Gottman SRH | Mutual Sound Relationship House self-reflection + scoring |
| `four-horsemen-education` | Four Horsemen | Explain patterns + antidotes; self-check |
| `communication-exercise-advisor` | PREP/ACR/Gottman | Deliver structured exercises |
| `attachment-reflection` | Attachment | Non-diagnostic attachment pattern reflection |
| `commitment-reflection` | Investment Model | Reframe "will we last" → what supports commitment now |
| `acr-coach` | ACR | Active-constructive responding education + practice |
| `referral-advisor` | Professional Referral | When/how to seek a qualified couples counselor |
| `safety-router` | Safety | Refusal + crisis resource surfacing (highest priority) |

## 6. Tools (6)

`surveillance_detection`, `crisis_detection`, `assessment_score`, `communication_exercise`, `citation_lookup`, `progress_check`. All schema-validated on input/output with retry and fallback. Schemas published in `assets/schemas/`.

## 7. Hooks (10)

`before_request` (BeforeRequestHook, SurveillanceRefusalHook, CrisisDetectionHook, DiagnosticFilterHook), `after_routing` (AfterRoutingHook), `before_execution` (BeforeExecutionHook), `after_execution` (AfterExecutionHook), `on_error` (OnErrorHook), `on_refusal` (OnRefusalHook), `on_crisis_detected` (OnCrisisDetectedHook). Executed in priority order per phase.

## 8. Configuration (`config/config.ts`)

Type-safe, env-driven, validated. Covers model, safety (surveillance sensitivity, mutual-consent requirement, disclaimer), features (caching, audit logging, citation injection), paths, environment overrides for development/testing/production.

## 9. Safety Compliance

- **Refusal**: hard phrases in `config/safety/guardrails.ts` → `SURVEILLANCE_INTENT_PHRASES` trigger `REFUSAL_TEMPLATE`.
- **Crisis**: `CRISIS_KEYWORDS` (violence/abuse) trigger immediate resource surfacing; couples counseling is contraindicated where ongoing abuse is present.
- **Disclaimer**: enforced by `AfterExecutionHook` and every handler.
- **Non-diagnostic**: `DIAGNOSTIC_KEYWORDS` flagged; handlers never say "you/your partner have [disorder]".
- **Population-level honesty**: divorce/fidelity research is described as population-level; no individual forecast is produced.

## 10. Testing

- `scripts/maintenance/audit-safety.ts` — safety regression battery.
- `scripts/utils/run-evals.ts` — `evals/evals.json` end-to-end assertions.
- `scripts/utils/simulate-router.ts` — routing trace inspection.
- `scripts/utils/schema-validator.ts` — JSON-schema validation for tool I/O.
- `scripts/setup/seed-references.ts` — reference presence/size checks.
- `scripts/setup/validate-config.ts` — config validation.

## 11. Extension Points

- New skill: `config/skills/registry.ts` + `src/agents/skills/registry.ts` + evals.
- New tool: `config/tools/registry.ts` + `assets/schemas/*` + handler.
- New framework: `references/frameworks/<name>.md` + citations + skill link.
- New instrument: `config/assessments/registry.ts` + `references/assessments/<name>.md`.

## 12. Compatibility

- Node.js >= 18, TypeScript >= 5.0, ES2020+.
- No runtime npm dependencies required for the core skill (uses only Node built-ins); `tsx` or `ts-node` recommended for running scripts.

**Architecture Version:** 1.0.0
