# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).



## [1.2.0] — 2026-08-04

### Added — Unit test suite
- `tests/` — a dependency-free unit-test framework (`harness.ts`: `describe`/`it`/`expect` with `not` modifiers, TAP-style output) plus `tests/run-tests.ts` runner.
- 68 unit tests across 9 suites: `tests/safety/surveillance.test.ts` (surveillance + crisis detection), `tests/router.test.ts` (chain-of-thought routing incl. compact forms + safety-first override), `tests/assessments.test.ts` (4 instruments scoring + reliable/clinically-significant change), `tests/citations.test.ts` (23-paper registry lookups + formatting), `tests/llm/post-validator.test.ts` (safe accepted; forecast/label/diagnosis/surveillance rejected; missing-disclaimer auto-appended), `tests/llm/token-budget.test.ts` (token estimation + priority trimming), `tests/llm/client.test.ts` (Mock provider + retry-on-retriable), `tests/orchestrator.test.ts` (end-to-end guardrail + routing + disclaimer behavior), `tests/tools.test.ts` (6-tool registry + schema validation).
- `npm test` script (`tsx tests/run-tests.ts`); `tsconfig.json` now includes `tests/**/*.ts`.

### Verified
- `tsc --noEmit` clean. `npm test` → **68/68 ALL UNIT TESTS PASSED**. All prior gates still green: `run-evals` 46/46, `audit-safety` 10/10, `smoke-test` 8/8, `llm-dry-run` 4/4, `seed-references` 29/29, `validate-config` valid.

## [1.1.0] — 2026-08-04

### Added — Real-LLM call path + observability
- `src/llm/` — provider-agnostic LLM client (`types.ts`, `token-budget.ts`, `prompt-builder.ts`, `post-validator.ts`, `client.ts`) supporting Anthropic (Messages API), OpenAI-compatible (Chat Completions), and a deterministic `Mock` provider for offline tests.
- **Retry with exponential backoff + full jitter**, per-request **timeout** (AbortController), and per-call structured logging + metrics.
- **Token-budgeted context window management** (`token-budget.ts`) — estimates tokens (~4 chars/token), reserves mandatory safety + disclaimer + skill-role + output headroom, and trims reference snippets by priority to fit `LLM_MAX_CONTEXT_TOKENS`.
- **Safety-first prompt builder** (`prompt-builder.ts`) — embeds the 7 hard safety rules, the standing disclaimer, the routed skill's role, the framework/prompt/safety reference context, and a safe-fallback the model may return verbatim.
- **Post-validator** (`post-validator.ts`) — the LLM is treated as untrusted: output is checked for disclaimer presence (auto-appended if missing), individual forecasts/probabilities, partner labeling/diagnosis, and surveillance assistance. On any hard violation the orchestrator falls back to the deterministic handler output. Guardrails are preserved regardless of model behavior.
- `config/observability/` — `StructuredLogger` (JSON lines to stderr/file/silent, PII redaction, session-scoped child loggers, audit trail for safety-critical events) and `MetricsRegistry` (counters, timers, gauges, snapshot).
- New config: `features.enable_llm`, `features.llm_strict_post_validation`, `features.llm_max_context_tokens`, `features.llm_mock`, and a new `observability` config block (`log_level`, `log_destination`, `log_file_path`, `redact_pii`, `audit_safety_events`, `sample_rate`).
- `AgentResponse.metadata.llm` — `{ used, provider, attempts, latency_ms, post_validation_valid, fallback_used, failure_reason }` on every response.
- `scripts/utils/llm-dry-run.ts` — exercises the full LLM path offline (Mock provider) and self-tests the post-validator (safe accepted; forecast/label/surveillance rejected; missing-disclaimer auto-appended). Verified PASS.

### Environment variables (new)
```
ENABLE_LLM=true             # enable the real-LLM call path (default: off → deterministic handlers)
LLM_MOCK=true                # use the offline Mock provider (no API key needed)
LLM_STRICT_POST_VALIDATION=true
LLM_MAX_CONTEXT_TOKENS=60000
API_KEY=...                 # required for real providers
MODEL_PROVIDER=anthropic|openai
OPENAI_BASE_URL=https://api.openai.com/v1   # optional OpenAI-compatible override
LOG_LEVEL=debug|info|warn|error
LOG_DESTINATION=stderr|file|silent
LOG_FILE_PATH=./logs/agent.log
REDACT_PII=true
AUDIT_SAFETY_EVENTS=true
LOG_SAMPLE_RATE=0.1
```

### Behavior
- With `ENABLE_LLM` unset/false (default): deterministic handlers produce all responses (identical to v1.0.0). All existing evals/safety audits pass unchanged.
- With `ENABLE_LLM=true` + `API_KEY` (or `LLM_MOCK=true`): the orchestrator builds a context-budgeted prompt, calls the provider with retry/timeout, post-validates the output, and uses it only if it passes safety checks; otherwise it falls back to the deterministic handler output. On any LLM error/timeout, it falls back.

### Verified
- `tsc --noEmit` clean (exit 0).
- `llm-dry-run` PASSED (llm used on 4/4, post-validation pass 4/4, all safety self-tests pass).
- `run-evals` 46/46 assertions, 0 cases failed.
- `audit-safety` 10/10. `smoke-test` 8/8. `seed-references` 29/29. `validate-config` valid.

## [1.0.0] — 2026-08-04

### Added
- Initial production-ready release of the Relationship Health & Communication Self-Assessment Advisor.
- Declarative skill registry with 8 skills (`satisfaction-reflection`, `four-horsemen-education`, `communication-exercise-advisor`, `attachment-reflection`, `commitment-reflection`, `acr-coach`, `referral-advisor`, `safety-router`).
- Chain-of-thought router (`src/agents/router.ts`) with safety-first ordering and compact-assessment-form detection.
- 10-hook lifecycle chain (`config/hooks/chain.ts`) across 6 phases, priority-ordered.
- 6 schema-validated tools (`surveillance_detection`, `crisis_detection`, `assessment_score`, `communication_exercise`, `citation_lookup`, `progress_check`) with retry and fallback.
- 4 self-reflection instruments (Sound Relationship House, Four Horsemen, Commitment & Investment, ACR) with direction-corrected normalization, banding, and reliable-change thresholds.
- Type-safe configuration (`config/config.ts`) with env vars, defaults, validation, and dev/test/prod overrides.
- Citation database of 23 research papers with effect sizes and evidence grades (`config/citations/registry.ts`), aligned with `RESEARCH-PAPER-KNOWLEDGE-BRAIN.md`.
- Cultural adaptation layer (collectivist, faith-integrated, high-context, long-distance/migrant).
- 5 framework operational references, 3 safety references, 5 prompt/exercise libraries, 4 assessment templates.
- 9 communication exercises including the new `accommodation-practice` (Overall et al., 2012).
- Surveillance refusal + crisis surfacing + non-diagnostic + population-level honesty guardrails, enforced in `before_request` hooks before any framework content.
- 15-case eval suite (`evals/evals.json`) + 10-case safety regression battery + router simulation + schema validator + reference/config validators + cache warmer.
- `SKILL.md`, `README.md`, `CLAUDE.md`, `PROJECT-detail.md`, `docs/ARCHITECTURE.md`, `docs/DIRECTORY-STRUCTURE.md`, `assets/diagrams/system-architecture.md`.
- `PROJECT-DEVELOPMENT-PHASE-TRACKING.md` (all phases 100% complete) and `DEVELOPMENT-TRACKING.md`.
- `RESEARCH-PAPER-KNOWLEDGE-BRAIN.md` — 23-paper applied knowledge base with paper→component coverage map.
- `package.json` (ESM, `type: module`), `tsconfig.json`, `.gitignore`, `LICENSE` (MIT), this `CHANGELOG.md`, and a programmatic entry point `src/index.ts`.

### Verified
- `tsc --noEmit` clean (exit 0).
- Safety audit: 10/10 cases pass.
- Eval suite: 46/46 assertions, 0/15 cases failed.
- Reference integrity: 24/24 reference files present and non-empty.
- Configuration validation: passes.
- Cache warmer: writes deterministic tool cache.

### Skipped (per requirements)
- Git operations/flows.
- Model pulling/training.
- Infrastructure deployment.
