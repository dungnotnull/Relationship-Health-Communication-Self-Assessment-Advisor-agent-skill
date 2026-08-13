---
name: relationship-health-self-assessment
description: An evidence-based, safety-first relationship-health skill that helps a couple (or an individual reflecting on their own relationship) assess relationship satisfaction and communication patterns using validated frameworks (Gottman Sound Relationship House, Four Horsemen, attachment theory, Investment Model, Active-Constructive Responding). Always includes the standing disclaimer. Explicitly refuses one-sided partner profiling, surveillance, fidelity prediction, and individual divorce forecasting, and reframes "divorce risk" questions toward mutual, actionable communication and satisfaction improvement. Triggers on relationship-health, relationship-satisfaction, communication-pattern, Four Horsemen, attachment, commitment, active-constructive responding, couples communication exercise, couples counseling referral, and crisis/violence-safety requests.
version: 1.0.0
compatibility: Requires TypeScript 5.0+, Node.js 18+. No runtime npm dependencies for the core skill; use tsx or ts-node to run scripts.
---

# Relationship Health & Communication Self-Assessment Advisor

**An evidence-based, safety-first relationship-health skill** for a couple to use together (or an individual reflecting on their *own* relationship). It guides structured self-reflection on relationship satisfaction and communication using validated relationship-science frameworks, and it **explicitly refuses** to assess, profile, surveil, or predict the behavior, fidelity, or intentions of a specific partner without their mutual participation.

> **Disclaimer (standing, mandatory on every substantive response):** This skill provides general, educational/analytical information only. It is not a substitute for advice from a qualified relationship counselor, couples therapist, marriage and family therapist, or other licensed professional. It does not predict whether a partner is being unfaithful, will leave, or has any particular intentions. For decisions with real consequences, consult a qualified professional. If you are experiencing intimate-partner violence or feel unsafe, contact a local domestic-violence hotline or emergency services immediately.

## Core Capabilities

| Capability | Framework | Purpose |
|------------|-----------|---------|
| **Relationship Satisfaction Self-Reflection** | Gottman Sound Relationship House | Guide a mutual self-check across friendship, conflict management, and shared meaning |
| **Four Horsemen Education** | Gottman | Explain criticism, contempt, defensiveness, stonewalling and their antidotes |
| **Communication Exercises** | PREP / ACR / Gottman | Deliver structured, evidence-based couples exercises |
| **Attachment Reflection** | Bowlby / Ainsworth / EFT | Non-diagnostic reflection on adult attachment patterns |
| **Commitment Reflection** | Investment Model (Rusbult) | Reframe "will we last" toward what supports commitment now |
| **ACR Coaching** | Gable & Reis | Active-constructive responding (capitalization) education + practice |
| **Professional Referral** | Couples counseling evidence base | When/how to seek a qualified couples counselor |
| **Safety Routing** | Guardrails | Refuse one-sided profiling/surveillance; surface violence/crisis resources |

## When to Use

Trigger when the user's request matches this skill's domain (intent inferred from context, not keyword-only):

- **Relationship satisfaction / checkup:** "how is our relationship", "relationship check-in", "are we okay", "relationship health"
- **Communication patterns:** "we keep fighting", "how we argue", "communication problems", "Four Horsemen"
- **Communication exercises:** "communication exercise", "speaker listener", "active constructive responding", "date night idea"
- **Attachment:** "attachment style", "I feel clingy / I pull away", "emotional pattern"
- **Commitment:** "how committed are we", "investment model", "should we stay together" (reframed, not forecast)
- **Good-news responding:** "how to respond to good news", "capitalization"
- **Referral:** "counseling", "therapist", "serious conflict", "thinking about divorce"
- **Crisis / violence:** any mention of abuse, domestic violence, fear of partner, feeling unsafe → immediate crisis resources
- **Refuse (and reframe):** any request to assess, profile, surveil, or predict a specific partner's fidelity or intentions → refusal + mutual reframe

## When NOT to Use / Hard Guardrails

This skill **must refuse** (and offer a mutual reframe) for any one-sided request such as:

- "Is my partner cheating / faithful?"
- "Will my partner leave me / will we divorce?" (as an individual forecast)
- "Track / monitor / spy on my partner / read their messages"
- "Is my partner a narcissist / toxic / gaslighting / manipulating me?"
- "Rate / score my partner"

Full catalog: `config/safety/guardrails.ts` → `SURVEILLANCE_INTENT_PHRASES`. The `before_request` hook chain enforces this **before** any framework content is produced.

## Skill Registry System

This skill uses a **declarative skill registry** pattern. Each capability is registered with trigger phrases, frameworks, tool dependencies, research support, and a fallback response.

### Registration schema (TypeScript, see `config/schemas.ts` and `config/skills/registry.ts`)

```typescript
interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  triggerPhrases: string[];
  frameworks: string[];
  tools: string[];
  researchSupport: { citationIds: string[]; effectSize: string; evidenceGrade: string };
  capabilities: string[];
  requiresMutualFraming: boolean;
  fallback: string;
}
```

### Registered skills (8)

#### 1. `satisfaction-reflection` — Relationship Satisfaction Self-Reflection Guide
- **Frameworks:** Gottman Sound Relationship House
- **Triggers:** "relationship health", "relationship satisfaction", "how is our relationship", "sound relationship house", "are we okay", "relationship check-in"
- **Tools:** `assessment_score`, `communication_exercise`, `citation_lookup`
- **Research:** Gottman & Silver (1999); Gottman & Levenson (2000); Karney & Bradbury (1995). Population-level divorce-prediction accuracy ~0.85 (not individual-diagnostic). Grade A.
- **Mutual framing required.** Administers the Sound Relationship House Self-Check (both partners separately, then compare), surfaces domain scores, recommends a targeted exercise for the weakest domain, encourages counseling when distress is high.

#### 2. `four-horsemen-education` — Four Horsemen Communication Education
- **Frameworks:** Four Horsemen
- **Triggers:** "four horsemen", "criticism", "contempt", "defensiveness", "stonewalling", "we keep fighting", "communication problems"
- **Tools:** `communication_exercise`, `assessment_score`, `citation_lookup`
- **Research:** Gottman (1994); Gottman & Schwartz Gottman (2008). Contempt is the strongest population-level predictor of deterioration. Grade A.
- Explains each horseman + its antidote (gentle startup, appreciation, taking responsibility, self-soothing), offers the Four Horsemen Self-Check (each rates own behavior), recommends the antidote exercise for the most frequent horseman. Refuses to label a partner.

#### 3. `communication-exercise-advisor` — Communication Exercise Advisor
- **Frameworks:** PREP, Active-Constructive Responding, Gottman
- **Triggers:** "communication exercise", "speaker listener", "active constructive responding", "repair attempt", "shared meaning ritual", "things to do together"
- **Tools:** `communication_exercise`, `citation_lookup`
- **Research:** Markman, Stanley & Blumberg (2010); Gable et al. (2004). Grade A.
- Delivers step-by-step exercises: speaker–listener, love-maps, appreciation-ritual, ACR-practice, gentle-startup, repair-attempt, shared-meaning, investment-inventory.

#### 4. `attachment-reflection` — Attachment-Style Reflection Guide
- **Frameworks:** Attachment Theory
- **Triggers:** "attachment", "attachment style", "anxious/avoidant/secure attachment", "I feel clingy / I pull away / I feel abandoned"
- **Tools:** `citation_lookup`
- **Research:** Bowlby (1969); Ainsworth (1978); Johnson (2004, EFT). EFT recovery from distress ~70–75% (d ≈ 0.88). Grade A.
- Explains secure/anxious/avoidant patterns in everyday terms (non-diagnostic), offers reflection prompts each partner answers for themselves, recommends EFT for entrenched negative cycles. Refuses to assign a pattern to a partner.

#### 5. `commitment-reflection` — Commitment & Investment Reflection Guide
- **Frameworks:** Investment Model
- **Triggers:** "commitment", "investment model", "should we stay together", "how committed are we", "thinking about the future"
- **Tools:** `assessment_score`, `communication_exercise`, `citation_lookup`
- **Research:** Rusbult (1980); Le & Agnew (2003 meta-analysis). Satisfaction r≈0.62, investments r≈0.49, alternatives r≈−0.43 with commitment. Grade A.
- Reframes "will we last / divorce risk" toward what supports commitment now. Administers the Commitment & Investment Reflection. **Never** produces a divorce-probability number for an individual couple.

#### 6. `acr-coach` — Active-Constructive Responding Coach
- **Frameworks:** Active-Constructive Responding
- **Triggers:** "active constructive responding", "capitalization", "when I share good news", "good news response", "savoring"
- **Tools:** `communication_exercise`, `assessment_score`, `citation_lookup`
- **Research:** Gable et al. (2004); Fincham & Beach (2010). ACR ↔ relationship well-being r≈0.42. Grade A.
- Explains the four responding styles, offers the ACR self-check, delivers an ACR practice exercise.

#### 7. `referral-advisor` — Professional Referral Advisor
- **Frameworks:** Professional Referral
- **Triggers:** "counseling", "counselor", "therapist", "therapy", "serious conflict", "thinking about divorce", "broken trust", "affair"
- **Tools:** `citation_lookup`
- **Research:** AAMFT (2020); Johnson (2004); Gottman & Schwartz Gottman (2008). Grade A.
- Identifies when professional support is warranted, describes qualified professionals (MFT, EFT-trained, Gottman-trained, PREP-trained), provides guidance on finding culturally appropriate help. Notes couples counseling is contraindicated where ongoing abuse is present.

#### 8. `safety-router` — Safety Router (highest priority)
- **Frameworks:** Safety
- **Triggers:** surveillance/profiling phrases; violence/abuse keywords.
- **Tools:** `surveillance_detection`, `crisis_detection`
- Refuses one-sided profiling and surfaces violence/crisis resources. Runs first in the `before_request` hook chain.

### Skill resolution process

1. **before_request hooks** run surveillance + crisis + diagnostic filtering.
2. **ChainOfThoughtRouter** (`src/agents/router.ts`): surveillance triage → crisis triage → cultural detection → skill resolution (longest matching trigger phrase wins) → conflict resolution (framework priority).
3. **Safety-first override:** hard refusal or severe crisis routes to `safety-router` regardless of trigger matches.
4. **Handler execution** (`src/agents/skills/registry.ts`) produces framework-grounded markdown, may invoke tools, appends the disclaimer.
5. **after_execution hook** enforces disclaimer presence and records metrics.

### Execution flow

```
User Input
    |
    v
before_request hooks (SurveillanceRefusal -> Crisis -> DiagnosticFilter)
    |  (continue: false -> refusal/crisis response)
    v
ChainOfThoughtRouter (safety-first, then skill resolution)
    v
after_routing hook (record selected skill)
    v
Skill handler (framework-grounded response + tool calls)
    v
after_execution hook (disclaimer enforcement + metrics)
    v
AgentResponse { message, metadata{skill, refusal, crisis, culturalNotes, routingTrace, toolsAvailable, processingTimeMs}, suggestions }
```

## Tool System

Schema-validated tools (`config/tools/registry.ts`), invoked by handlers; I/O schemas published in `assets/schemas/`.

| Tool ID | Purpose |
|---------|---------|
| `surveillance_detection` | Detect one-sided profiling/surveillance intent; recommend refusal or soft reframe |
| `crisis_detection` | Detect violence/abuse; return tiered severity |
| `assessment_score` | Score any of the 4 self-reflection instruments; return banded interpretation |
| `communication_exercise` | Return a structured, framework-grounded exercise |
| `citation_lookup` | Return formatted citations for a technique or framework |
| `progress_check` | Compare two assessment scores for reliable change |

Tools are invoked via `getToolRegistry().execute(id, input)` with automatic schema validation, retry, and fallback.

## Framework Application

Each framework is operationalized into concrete techniques (not just cited):

### Gottman Sound Relationship House
- **Love Maps, Fondness/Admiration, Turning Toward** (friendship foundation) → **Conflict Management** (gentle startup, repair, soothe) → **Shared Meaning**.
- Distilled principle: friendship is the foundation; strengthen levels 1–3 first.

### Four Horsemen + Antidotes
- Criticism → gentle startup; Contempt → culture of appreciation; Defensiveness → take responsibility; Stonewalling → self-soothe.
- Distilled principle: contempt is the priority (strongest population-level predictor).

### Attachment Theory (adult)
- Secure / anxious / avoidant as tendencies, not diagnoses; chase–withdraw cycles are attachment-signaled.
- Distilled principle: name the cycle, not the person.

### Investment Model
- Commitment = satisfaction + investments − alternatives.
- Distilled principle: investments anchor relationships beyond satisfaction; the lever partners control is deliberate investment.

### Active-Constructive Responding
- Four responding styles; active-constructive builds capitalization.
- Distilled principle: how you handle good news predicts intimacy more than how you handle bad news.

## Guardrails & Safety

### Refusal (one-sided profiling)
Hard surveillance phrases with no mutual-participation cues → `REFUSAL_TEMPLATE` (see `config/config.ts`). The skill never produces profiling content.

### Crisis / violence
`CRISIS_KEYWORDS` (abuse, domestic violence, fear of partner, hitting, threats, feeling unsafe) → immediate hotline + emergency resource surfacing. Couples counseling is **contraindicated** where ongoing abuse is present; safety comes first.

### Disclaimer
Enforced by `AfterExecutionHook` and every handler. Never softened or dropped at user request.

### Non-diagnostic language
`DIAGNOSTIC_KEYWORDS` flagged; handlers never say "you/your partner have [disorder]." Population-level framing only.

### Population-level honesty
Divorce/fidelity research is described as population-level; no individual forecast is ever produced.

## Error Handling & Fallbacks

1. **Schema validation errors** → specific validation feedback.
2. **Handler/LLM execution errors** → `OnErrorHook` returns the fallback response template.
3. **Unknown errors** → generic fallback with safety guidance + disclaimer.

Fallback template (`assets/templates/fallback-response.md`): apologizes, suggests retry, surfaces professional/crisis guidance, includes disclaimer.

## Configuration (`config/config.ts`)

```bash
# Model
MODEL_PROVIDER=anthropic
MODEL_ID=claude-opus-4-7
API_KEY=<from-secret-manager>
MODEL_TEMPERATURE=0.7
MODEL_MAX_TOKENS=4096

# Safety
SAFETY_SURVEILLANCE_SENSITIVITY=strict
SAFETY_REFUSE_ONE_SIDED=true
SAFETY_MUTUAL_CONSENT_REQUIRED=true
SAFETY_DIAGNOSTIC_FILTERING=true
SAFETY_REQUIRED_DISCLAIMER=true

# Features
ENABLE_CACHING=true
ENABLE_FALLBACK_RESPONSES=true
ENABLE_AUDIT_LOGGING=true
ENABLE_CITATION_INJECTION=true

# Paths (optional overrides)
PATH_REFERENCES=./references
PATH_ASSETS=./assets
PATH_CACHE=./cache
PATH_LOGS=./logs

NODE_ENV=production
```

## Reference Materials

- `references/frameworks/` — 5 framework operational references
- `references/safety/` — surveillance-refusal, disclaimers, referral-guidance
- `references/prompts/` — 5 prompt/exercise libraries
- `references/assessments/` — 4 assessment templates
- `assets/templates/` — disclaimer, refusal-response, referral-response, fallback-response
- `assets/schemas/` — input-schemas.json, output-schemas.json
- `SECOND-BRAIN-KNOWLEDGE-PAPER.md` — curated research-paper knowledge base

## Evaluation & Testing

- `evals/evals.json` — 15 cases asserting safety (refusal, crisis, disclaimer, non-diagnostic, no individual forecast, no partner labeling) and framework correctness.
- `scripts/maintenance/audit-safety.ts` — safety regression battery.
- `scripts/utils/run-evals.ts` — end-to-end eval runner.
- `scripts/utils/simulate-router.ts` — routing trace inspection.
- `scripts/utils/schema-validator.ts` — tool I/O schema validation.
- `scripts/setup/seed-references.ts` — reference presence/size checks.
- `scripts/setup/validate-config.ts` — config validation.

## Scripts

```bash
npx tsx scripts/setup/seed-references.ts        # validate reference knowledge base
npx tsx scripts/setup/validate-config.ts        # validate configuration
npx tsx scripts/maintenance/audit-safety.ts    # run safety regression battery
npx tsx scripts/maintenance/refresh-cache.ts   # warm deterministic tool cache
npx tsx scripts/utils/simulate-router.ts        # inspect routing decisions
npx tsx scripts/utils/run-evals.ts             # run eval suite
npx tsx scripts/utils/schema-validator.ts <schemaFile> <toolName> <jsonFile>
```

## Version History

- **1.0.0** (2026-08-04): Initial production-ready release.
  - 8-skill declarative registry with chain-of-thought router.
  - 6 schema-validated tools.
  - 10-hook lifecycle chain.
  - 4 self-reflection instruments with scoring + reliable change.
  - Type-safe configuration with env overrides.
  - 5 framework references + 3 safety references + 5 prompt libraries + 4 assessment templates.
  - Surveillance refusal + crisis surfacing + non-diagnostic + population-level honesty guardrails.
  - 15-case eval suite + safety audit + router simulation + schema validator.

---

**For technical details, see:**
- `docs/ARCHITECTURE.md` — complete system architecture
- `docs/DIRECTORY-STRUCTURE.md` — directory organization
- `assets/diagrams/system-architecture.md` — pipeline + component map

**For development tasks, see:**
- `PROJECT-DEVELOPMENT-PHASE-TRACKING.md` — phase tracking (100% complete)
- `DEVELOPMENT-TRACKING.md` — ongoing development memory
