# System Architecture — Relationship Health Self-Assessment Advisor

## Request pipeline (text)

```
User message
   |
   v
[before_request hook chain]
   |- BeforeRequestHook          (state sync, history)
   |- SurveillanceRefusalHook     (one-sided profiling -> refusal, OR soft reframe)
   |- CrisisDetectionHook         (violence/abuse -> crisis resources)
   |- DiagnosticFilterHook        (flag diagnostic language)
   |
   v (continue?) -- no --> refusal/crisis response
   |
   v
[ChainOfThoughtRouter]
   1. surveillance triage
   2. crisis triage
   3. cultural detection
   4. skill resolution (longest trigger phrase wins)
   5. conflict resolution (framework priority)
   |
   v
[after_routing hook]  (record selected skill)
   |
   v
[Skill handler]  (src/agents/skills/registry.ts)
   |- builds framework-grounded markdown response
   |- may call config tools (assessment_score, communication_exercise, citation_lookup)
   |- appends standing disclaimer
   |
   v
[after_execution hook]  (metrics, disclaimer enforcement)
   |
   v
AgentResponse { message, metadata{skill, refusal, crisis, culturalNotes, routingTrace, toolsAvailable, processingTimeMs}, suggestions }
```

## Component map

```
config/
  config.ts            type-safe config + env vars + defaults + validation
  schemas.ts           Hook / Tool / Skill / AgentState / Logger types
  safety/guardrails.ts surveillance + crisis phrase catalogs + detectors
  citations/registry.ts research paper database (effect sizes, evidence grades)
  assessments/registry.ts 4 self-reflection instruments + scoring + RCI
  cultural/adaptations.ts collectivist / faith / high-context / migrant framing
  hooks/chain.ts       10-hook lifecycle chain + executor
  tools/registry.ts    6 schema-validated tools + retry + registry
  skills/registry.ts   8 declarative skills (trigger phrases, frameworks, tools)

src/agents/
  orchestrator.ts      wires router + hooks + handlers + tools -> AgentResponse
  router.ts            chain-of-thought router with RoutingDecision trace
  skills/registry.ts   runtime skill handlers (real, framework-grounded output)
  tools/
    surveillance-detector.ts  class wrapper over guardrails detection
    crisis-detector.ts        class wrapper over crisis detection + escalation

references/
  frameworks/    5 framework operational references (Gottman SRH, Four Horsemen, Attachment, Investment Model, ACR)
  safety/        surveillance-refusal, disclaimers, referral-guidance
  prompts/       5 prompt/exercise libraries
  assessments/   4 assessment templates

assets/
  templates/     disclaimer, refusal-response, referral-response, fallback-response
  schemas/       input-schemas.json, output-schemas.json
  diagrams/      system-architecture.md (this file)

scripts/
  setup/         seed-references, validate-config
  maintenance/   audit-safety, refresh-cache
  utils/         schema-validator, run-evals, simulate-router

evals/
  evals.json     test cases with assertions
```

## Safety precedence (hard ordering)

1. Surveillance / one-sided profiling -> refusal (overrides everything except crisis).
2. Violence / abuse / acute safety -> crisis resources (overrides skill routing).
3. Soft profiling -> reframe + continue to a normal skill.
4. Cultural framing -> applied as adjustments, never overrides safety.
5. Normal skill routing.

## Extension points

- **New skill:** add to `config/skills/registry.ts` + handler in `src/agents/skills/registry.ts`; add evals.
- **New tool:** add definition + handler in `config/tools/registry.ts`; add JSON schemas to `assets/schemas/`.
- **New framework:** add `references/frameworks/<name>.md` + citations in `config/citations/registry.ts` + link a skill.
- **New instrument:** add to `config/assessments/registry.ts` + `references/assessments/<name>.md`.
