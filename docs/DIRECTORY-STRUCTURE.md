# Directory Structure — Relationship Health Self-Assessment Advisor

## Root layout

```
relationship-health-self-assessment/
+-- README.md
+-- CLAUDE.md
+-- SKILL.md                       # main skill definition + registry
+-- PROJECT-detail.md
+-- DEVELOPMENT-TASK-BY-PHASES.md
+-- SECOND-BRAIN-KNOWLEDGE-PAPER.md
+-- PROJECT-DEVELOPMENT-PHASE-TRACKING.md
+-- DEVELOPMENT-TRACKING.md
|
+-- docs/
|   +-- ARCHITECTURE.md
|   +-- DIRECTORY-STRUCTURE.md     # this file
|
+-- config/                        # type-safe configuration + registries
|   +-- config.ts
|   +-- schemas.ts
|   +-- skills/registry.ts
|   +-- hooks/chain.ts
|   +-- tools/registry.ts
|   +-- citations/registry.ts
|   +-- assessments/registry.ts
|   +-- safety/guardrails.ts
|   +-- cultural/adaptations.ts
|
+-- src/agents/                    # runtime
|   +-- orchestrator.ts
|   +-- router.ts
|   +-- skills/registry.ts         # handlers
|   +-- tools/
|       +-- surveillance-detector.ts
|       +-- crisis-detector.ts
|
+-- references/                    # domain knowledge (RAG/grounding)
|   +-- frameworks/   (5)
|   +-- safety/       (3)
|   +-- prompts/      (5)
|   +-- assessments/  (4)
|
+-- assets/                        # static resources
|   +-- templates/   (4)
|   +-- schemas/     (2 JSON)
|   +-- diagrams/    (1)
|
+-- scripts/                       # automation
|   +-- setup/       (seed-references, validate-config)
|   +-- maintenance/ (audit-safety, refresh-cache)
|   +-- utils/       (schema-validator, run-evals, simulate-router)
|
+-- evals/
    +-- evals.json
```

## Directory purposes

### `/config`
Type-safe configuration, schemas, and the four registries (skills, hooks, tools, citations, assessments) plus safety guardrails and cultural adaptations. All values validated; env-driven.

### `/src/agents`
Runtime: orchestrator, chain-of-thought router, skill handlers, and class wrappers for the two safety-critical detectors.

### `/references`
Domain knowledge loaded on demand for grounding: framework operational principles, safety references, prompt/exercise libraries, assessment templates. Markdown with structured sections.

### `/assets`
Static resources: response templates (disclaimer, refusal, referral, fallback), published JSON schemas for tool I/O, system-architecture diagram.

### `/scripts`
Executable automation: setup (reference/config validation), maintenance (safety audit, cache refresh), utils (schema validation, eval runner, router simulation).

### `/evals`
Evaluation registry with assertions for safety, framework correctness, non-diagnostic language, disclaimer presence, and mutual framing.

## Naming conventions
- `kebab-case.ts` / `kebab-case.md` / `kebab-case.json` for files.
- `PascalCase` for classes (`AgentOrchestrator`, `ChainOfThoughtRouter`).
- `camelCase` for functions and variables.

**Last Updated:** 2026-08-04
