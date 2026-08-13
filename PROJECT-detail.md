# PROJECT-detail.md — Relationship Health & Communication Self-Assessment Advisor

## 1. Problem Statement

A skill for a couple to use together (or an individual reflecting on their own relationship) to assess relationship health and communication patterns using validated relationship-science frameworks. It explicitly does not predict whether a partner is being unfaithful or will leave, does not support surveilling or profiling a partner without their knowledge, and reframes "divorce risk" questions toward actionable, mutual communication and relationship-satisfaction improvement grounded in the Gottman Institute's and other researchers' empirical work.

## 2. Target Users

- **Couples** seeking a structured, evidence-informed self-reflection on their relationship satisfaction and communication, used together.
- **Individuals** reflecting on their *own* relationship and their *own* communication patterns (not their partner's).
- **People curious about relationship science** who want plain-language explanations of frameworks (Gottman, attachment, Investment Model, ACR).
- **People considering professional help** who want to understand when couples counseling is warranted and how to find a qualified clinician.
- **Not** users seeking to surveil, profile, or predict a specific partner's behavior — those requests are refused and reframed.

## 3. Functional Specification

### 3.1 Core Capabilities

- Guide a structured relationship-satisfaction self-reflection (Gottman Sound Relationship House domains: friendship, conflict management, shared meaning)
- Explain the Four Horsemen (criticism, contempt, defensiveness, stonewalling) as communication red flags to address together, with their evidence-based antidotes
- Suggest evidence-based communication exercises for couples (speaker–listener, love-maps, appreciation ritual, ACR practice, gentle startup, repair attempt, shared meaning, investment inventory)
- Provide non-diagnostic adult-attachment-pattern reflection
- Reframe "will we last / divorce risk" questions toward what supports commitment now (Investment Model)
- Teach Active-Constructive Responding (capitalization) for good-news moments
- Explain what longitudinal relationship-science research says about healthy-relationship predictors, in general/population terms
- Explicitly decline requests to assess, profile, or predict a specific partner's fidelity or intentions without their participation
- Encourage couples counseling for persistent, serious conflict; surface crisis resources when violence/abuse is present

### 3.2 Key Methodologies & Frameworks Applied

- **Gottman Sound Relationship House theory** — operationalized in `references/frameworks/gottman-sound-relationship-house.md` and the Sound Relationship House Self-Check (`references/assessments/sound-relationship-house-checklist.md`).
- **The Four Horsemen framework (Gottman)** — operationalized in `references/frameworks/four-horsemen.md` and the Four Horsemen Self-Check.
- **Attachment theory (Bowlby, Ainsworth) applied to adult relationships** — operationalized in `references/frameworks/attachment-theory.md` and `references/prompts/attachment-reflection.md`.
- **Investment Model of Commitment (Rusbult)** — operationalized in `references/frameworks/investment-model.md` and the Commitment & Investment Reflection.
- **Active-constructive responding communication technique (Gable)** — operationalized in `references/frameworks/active-constructive-responding.md` and `references/prompts/acr-exercises.md`.

Each framework is extracted into a concrete reference file with operational principles (not just citations) and mapped to a registered skill + tool in `config/`.

### 3.3 Expected Input

Typical user requests this skill handles:

- "How is our relationship doing? Can we do a check-in?"
- "We keep fighting. Can you explain the Four Horsemen?"
- "Give us a communication exercise to try tonight."
- "I feel clingy and my partner pulls away. Can you explain attachment patterns?"
- "How committed are we really? Will we last?" (reframed, not forecast)
- "How do I respond when my partner shares good news?"
- "We have serious conflict. Should we see a counselor?"
- "I am afraid of my partner." → crisis resources
- "Is my partner cheating?" → refusal + mutual reframe

Structured input forms for scoring:
- Sound Relationship House: `srh1=4,srh2=3,srh3=5,srh4=4,srh5=3,srh6=4,srh7=4`
- Four Horsemen: `fh1=2,fh2=1,fh3=3,fh4=2`
- Commitment & Investment: `im1=4,im2=5,im3=3,im4=5`
- ACR: `acr1=4,acr2=2,acr3=1,acr4=1`

### 3.4 Expected Output Format

- **Markdown responses** with framework name stated, structured steps/tables, the standing disclaimer appended, and optional citations block.
- **Scoring outputs** (via the `assessment_score` tool): `{ assessment_id, raw_score, normalized_score (0-100), band_label, interpretation, suggested_action, domain_scores, referral_recommended }`.
- **Exercise outputs** (via the `communication_exercise` tool): `{ exercise_name, steps[], duration_minutes, tips[], framework }`.
- **AgentResponse envelope** (`src/agents/orchestrator.ts`): `{ message, metadata{ skill, refusal, crisis, culturalNotes, routingTrace, toolsAvailable, processingTimeMs }, suggestions }`.

## 4. Out of Scope / Guardrails

- Always include the standing disclaimer for this domain (see `CLAUDE.md` and `references/safety/disclaimers.md`).
- Never present output as a certified/professional determination (not a diagnosis, not a legal opinion, not a guaranteed forecast).
- Never produce an individual forecast of fidelity, leaving, or divorce. Divorce-predictor research is population-level only.
- Never label or diagnose a partner ("your partner is a narcissist / toxic / avoidant"). Use population-level framing and invite each partner to reflect on their own behavior.
- Never support one-sided surveillance (tracking, monitoring, reading messages, hidden cameras, GPS, keyloggers, private investigators). Refuse and reframe.
- Where the skill involves a named third party, do not produce a definitive judgment about that individual — stay at the level of general, population-based information and structured mutual reasoning support.
- Flag explicitly when a licensed professional (couples counselor, MFT, EFT-trained therapist) should be consulted.
- Where intimate-partner violence is present, surface crisis resources **before** joint counseling; couples counseling is contraindicated where ongoing abuse is present.

## 5. Knowledge Base Dependency

This skill's reasoning quality depends on the research foundations catalogued in `SECOND-BRAIN-KNOWLEDGE-PAPER.md`, extracted into operational reference files in `references/frameworks/` and the citation database in `config/citations/registry.ts` (effect sizes and evidence grades for real-time citation injection).

## 6. Success Criteria

- Output correctly applies the named methodologies rather than generic reasoning.
- Output is well-structured and consistent across repeated runs on similar inputs.
- Domain-appropriate guardrails/disclaimers are respected in every response.
- One-sided profiling/surveillance requests are always refused and reframed; no individual forecast is ever produced.
- Violence/abuse mentions always surface crisis resources.
- Test prompts in `evals/evals.json` (and the safety battery in `scripts/maintenance/audit-safety.ts`) pass: a subject-matter-competent reviewer would rate outputs as sound.

## 7. Implementation Notes (built v1.0.0)

- **Architecture:** chain-of-thought router + declarative skill registry (8 skills) + schema-validated tool registry (6 tools) + 10-hook lifecycle chain + type-safe configuration. See `docs/ARCHITECTURE.md`.
- **Safety precedence (hard):** surveillance refusal → crisis surfacing → soft reframe → cultural framing → normal skill routing.
- **No runtime npm dependencies** for the core skill (Node built-ins only); `tsx`/`ts-node` recommended for scripts.
- **Compatibility:** Node.js >= 18, TypeScript >= 5.0, ES2020+.
