# RESEARCH-PAPER-KNOWLEDGE-BRAIN.md — Relationship Health & Communication Self-Assessment Advisor

> A curated, **applied** knowledge base of 23 research papers underpinning this skill. Each entry gives the full citation, key findings, effect sizes, evidence quality, and — crucially — **how this project operationalizes it** (which skill, tool, reference, or guardrail uses it). This is the persuasion/accuracy layer: every framework the skill uses is traceable to a source here, and every source here is wired into the codebase.

> **Sourcing note:** this list was compiled from general subject-matter knowledge. Before relying on any specific citation in an academic, legal, or professional deliverable, verify the exact title, year, and venue independently — this list has not been individually re-verified against live databases at compilation time. Effect sizes are reported as published/estimated and are population-level (not individual-diagnostic).

## How to use this brain

1. When extending a skill, ground new content in a paper below and cite it via `config/citations/registry.ts`.
2. When reasoning, name the framework and its evidence grade (transparency norm from `CLAUDE.md`).
3. Never apply a population-level finding as an individual forecast (guardrail).

---

## A. Gottman — Sound Relationship House & Conflict

### 1. Gottman, J. M., & Silver, N. (1999). *The Seven Principles for Making Marriage Work*. Crown.
- **Key findings:** Sound Relationship House (love maps, fondness/admiration, turning toward, positive perspective, conflict management, dreams, shared meaning); stable couples show ~5:1 positive-to-negative interaction ratio; friendship foundation is the strongest predictor of satisfaction.
- **Effect size / evidence:** Population-level divorce-prediction accuracy ~0.85; Gottman Method marital satisfaction pre→post *d* ≈ 0.72. Grade **A**. Population-level, not individual-diagnostic.
- **Applied in this project:**
  - Skill `satisfaction-reflection` (`config/skills/registry.ts`) + handler (`src/agents/skills/registry.ts`).
  - Instrument: Sound Relationship House Self-Check (`config/assessments/registry.ts`, `references/assessments/sound-relationship-house-checklist.md`).
  - Exercises: love-maps, appreciation-ritual, shared-meaning (`references/prompts/relationship-satisfaction-self-reflection.md`).
  - Framework reference: `references/frameworks/gottman-sound-relationship-house.md`.

### 2. Gottman, J. M. (1994). *What Predicts Divorce? The Relationship Between Marital Processes and Marital Outcomes*. Erlbaum.
- **Key findings:** The Four Horsemen (criticism, contempt, defensiveness, stonewalling); contempt is the single strongest population-level predictor of deterioration; negative-affect reciprocity and physiological flooding accelerate decline; each horseman has an antidote.
- **Effect size / evidence:** Population-level prediction accuracy ~0.80. Grade **A**. Not individual-diagnostic.
- **Applied:** Skill `four-horsemen-education`; instrument Four Horsemen Self-Check; antidote exercises (gentle startup, appreciation, taking responsibility, self-soothing) in `references/prompts/four-horsemen-exercises.md`; framework reference `references/frameworks/four-horsemen.md`.

### 3. Gottman, J. M., & Levenson, R. W. (2000). The Timing of Divorce: Predicting When a Couple Will Divorce over a 14-Year Period. *Journal of Marriage and Family*, 62(3), 737–745.
- **Key findings:** Two dissolution trajectories — early-divorcing (affective intensity) vs late-divorcing (disengagement/low positivity); different interaction patterns forecast timing, not different individuals.
- **Effect size / evidence:** Longitudinal, n≈95. Grade **A**. Population-level timing only.
- **Applied:** `satisfaction-reflection` (population-level framing in handler + framework reference); reinforces the no-individual-forecast guardrail in `config/safety/guardrails.ts` and `references/safety/surveillance-refusal.md`.

### 4. Gottman, J. M., & Schwartz Gottman, J. (2008). Gottman Method Couple Therapy. In *Clinical Handbook of Couple Therapy*. Guilford.
- **Key findings:** Manualized couples therapy integrating SRH, conflict management, shared meaning; moderate-to-large satisfaction gains.
- **Effect size / evidence:** Marital satisfaction pre→post *d* ≈ 0.72. Grade **A**.
- **Applied:** `referral-advisor` skill (describes Gottman Method-trained therapists); `communication-exercise-advisor` (repair-attempt, shared-meaning exercises).

---

## B. Attachment

### 5. Bowlby, J. (1969). *Attachment and Loss, Vol. 1: Attachment*. Basic Books.
- **Key findings:** Internal working models of self/other; secure base + safe haven dynamics; adult intimacy rooted in attachment history.
- **Effect size / evidence:** Theoretical foundation. Grade **A**.
- **Applied:** Skill `attachment-reflection`; framework reference `references/frameworks/attachment-theory.md`; reflection prompts in `references/prompts/attachment-reflection.md`.

### 6. Ainsworth, M. D. S., Blehar, M. C., Waters, E., & Wall, S. (1978). *Patterns of Attachment*. Erlbaum.
- **Key findings:** Empirical classification (secure, anxious-ambivalent, avoidant); measurable individual differences; foundation for adult attachment assessment.
- **Effect size / evidence:** Cross-sectional, foundational. Grade **A**.
- **Applied:** `attachment-reflection` (secure/anxious/avoidant descriptors, non-diagnostic); cited in framework reference.

### 7. Johnson, S. M. (2004). *The Practice of Emotionally Focused Couple Therapy* (2nd ed.). Brunner-Routledge.
- **Key findings:** EFT targets negative interaction cycles and attachment needs; ~70–75% recovery from distress, stable at follow-up.
- **Effect size / evidence:** Recovery ~70–75%; *d* ≈ 0.88. Grade **A**.
- **Applied:** `attachment-reflection` (cycle de-escalation steps) and `referral-advisor` (EFT-trained therapist referral); framework reference.

### 8. Reis, H. T., & Shaver, P. (1988). Intimacy as an interpersonal process. In *Handbook of Personal Relationships*.
- **Key findings:** Intimacy = self-disclosure + partner responsiveness; the responsive-disclosure loop underlies closeness.
- **Effect size / evidence:** Theoretical model, highly influential. Grade **B**.
- **Applied:** `attachment-reflection` and `communication-exercise-advisor` (speaker–listener responsiveness framing); grounds the "turning toward bids" logic in the SRH.

### 9. Feeney, B. C., & Collins, N. L. (2003). Motivations for caregiving in adult intimate relationships. *Journal of Personality and Social Psychology*, 85(4).
- **Key findings:** Caregiving system complements attachment; responsive caregiving strengthens safe-haven functioning; both partners cycle between seeker and caregiver roles.
- **Effect size / evidence:** Correlational/longitudinal. Grade **B**.
- **Applied:** `attachment-reflection` (safe-haven reflection prompts; mutual caregiving framing, not one-sided).

---

## C. Commitment — Investment Model

### 10. Rusbult, C. E. (1980). Commitment and Satisfaction in Romantic Associations: A Test of the Investment Model. *Journal of Experimental Social Psychology*, 16(2), 172–186.
- **Key findings:** Commitment = satisfaction + investments − quality of alternatives; commitment (not satisfaction alone) predicts persistence.
- **Effect size / evidence:** Commitment prediction *r* ≈ 0.55. Grade **A**.
- **Applied:** Skill `commitment-reflection`; instrument Commitment & Investment Reflection; `references/frameworks/investment-model.md`; `references/prompts/investment-model-exercise.md`.

### 11. Le, B., & Agnew, C. R. (2003). Commitment and Its Theorized Determinants: A Meta-Analysis of the Investment Model. *Personal Relationships*, 10(1), 37–57.
- **Key findings:** Meta-analysis (52 studies): satisfaction *r*≈0.62, investments *r*≈0.49, alternatives *r*≈−0.43 with commitment; robust across dating/married.
- **Effect size / evidence:** Meta-analytic. Grade **A**.
- **Applied:** Effect-size block in `commitment-reflection` handler and framework reference; powers the `citation_lookup` tool outputs.

---

## D. Active-Constructive Responding & Positive Relationship Science

### 12. Gable, S. L., Reis, H. T., Impett, E. A., & Asher, E. R. (2004). What Do You Do When Things Go Right? The Intrapersonal and Interpersonal Benefits of Sharing Positive Events. *Journal of Personality and Social Psychology*, 86(2), 228–245.
- **Key findings:** Four responding styles; active-constructive (capitalization) builds intimacy; passive/destructive styles erode it.
- **Effect size / evidence:** ACR ↔ relationship well-being *r* ≈ 0.42. Grade **A**.
- **Applied:** Skill `acr-coach`; instrument ACR Capitalization Check; `references/prompts/acr-exercises.md`; framework reference `references/frameworks/active-constructive-responding.md`.

### 13. Fincham, F. D., & Beach, S. R. H. (2010). Of Memes and Marriage: Toward a Positive Relationship Science. *Journal of Family Theory & Review*, 2(1), 4–13.
- **Key findings:** Argues for strengths-based relationship science; forgiveness, gratitude, and positive bonding as independent contributors to health.
- **Effect size / evidence:** Theoretical review. Grade **B**.
- **Applied:** Strengths framing across `satisfaction-reflection` and `acr-coach`; cited alongside Gable et al. in the ACR framework reference.

### 14. Overall, N. C., Fletcher, G. J. O., Simpson, J. A., & Sibley, C. G. (2012). Regulating partners in intimate relationships: The costs and benefits of differing interpersonal attachment. *Journal of Personality and Social Psychology*, 103(2).
- **Key findings:** Accommodation (inhibiting destructive impulses) and willing sacrifice predict relationship quality; attachment security facilitates accommodation.
- **Effect size / evidence:** Longitudinal/correlational. Grade **B**.
- **Applied:** `communication-exercise-advisor` (repair-attempt + accommodation framing); `attachment-reflection` (security → accommodation link).

---

## E. Communication-Skills Programs

### 15. Markman, H., Stanley, S., & Blumberg, S. L. (2010). *Fighting for Your Marriage*. Jossey-Bass.
- **Key findings:** PREP/CPREP: speaker–listener technique, events/issues grid, core belief cycles; skills-based, teachable prevention/enrichment.
- **Effect size / evidence:** Program evidence (prevention). Grade **A**.
- **Applied:** `communication-exercise-advisor` (speaker-listener exercise); `references/prompts/four-horsemen-exercises.md` (gentle startup structure); `referral-advisor` (PREP-trained counselors).

---

## F. Longitudinal Relationship Science (population-level education)

### 16. Levenson, R. W., Carstensen, L. L., & Gottman, J. M. (1993). Long-Term Marriage: Age, Gender, and Satisfaction. *Psychology and Aging*, 8(2).
- **Key findings:** Marital satisfaction trajectories across decades; affect changes with age; longitudinal satisfaction is dynamic.
- **Effect size / evidence:** Longitudinal. Grade **A**.
- **Applied:** `satisfaction-reflection` (longitudinal framing — satisfaction is dynamic, not fixed); reinforces non-forecast stance.

### 17. Huston, T. L., Niehuis, S., & Smith, S. E. (2001). The Early Marital Roots of Conjugal Distress and Divorce. *Current Directions in Psychological Science*, 10(4).
- **Key findings:** Early-relationship patterns (courtship dynamics, loss of romance) forecast later distress at a population level; early intervention helps.
- **Effect size / evidence:** Population-level. Grade **A**.
- **Applied:** `referral-advisor` (earlier-intervention-yields-better-outcomes messaging); educational framing in `satisfaction-reflection`.

### 18. Karney, B. R., & Bradbury, T. N. (1995). The Longitudinal Course of Marital Quality and Stability: A Review of Theory, Methods, and Research. *Psychological Bulletin*, 118(1), 3–34.
- **Key findings:** Vulnerability–Stress–Adaptation model: enduring vulnerabilities + stress + adaptive processes shape marital quality over time; methodological backbone for longitudinal couples research.
- **Effect size / evidence:** Systematic review. Grade **A**.
- **Applied:** `attachment-reflection` (adaptation reflection) and `referral-advisor` (stress mapping); framework reference for "satisfaction is dynamic."

### 19. Amato, P. R. (2010). Research on Divorce: Continuing Trends and New Developments. *Journal of Marriage and Family*, 72(3), 650–668.
- **Key findings:** Population-level divorce risk factors (age at marriage, income, education, cohabitation patterns); used for general education only.
- **Effect size / evidence:** Systematic review. Grade **A**. Population-level only.
- **Applied:** `referral-advisor` (general education); explicit population-level framing in handler to enforce the no-individual-forecast guardrail.

### 20. Finkel, E. J., Hui, C. M., Carswell, K. L., & Larson, G. A. (2014). The Suffocation of Marriage: Climbing Mount Maslow Without Enough Oxygen. *Psychological Inquiry*, 25(1), 1–41.
- **Key findings:** Modern marriages increasingly expected to fulfill higher Maslow needs; high expectations without sufficient investment reduce satisfaction; counter by allocating time/psychological resources.
- **Effect size / evidence:** Theoretical model. Grade **B**.
- **Applied:** `commitment-reflection` (expectations-calibration + resource-allocation framing); `references/frameworks/investment-model.md` (links suffocation to investment).

### 21. Sprecher, S., & Felmlee, D. (2000). Romantic Partners' Perceptions of Social Network Attributes with the Passage of Time and Relationship Transitions. *Personal Relationships*, 7(4).
- **Key findings:** Social-network approval/disapproval shapes relationship trajectories over time; network context matters for stability.
- **Effect size / evidence:** Longitudinal/correlational. Grade **B**.
- **Applied:** `config/cultural/adaptations.ts` (collectivist/family-centered framing acknowledges network context); `referral-advisor` (social-context awareness).

### 22. Berscheid, E., & Reis, H. T. (1998). Attraction and Close Relationships. In *The Handbook of Social Psychology*.
- **Key findings:** Foundational relationship-science reference; defines closeness, interdependence, and the field's core constructs.
- **Effect size / evidence:** Theoretical reference. Grade **B**.
- **Applied:** Foundational grounding for all skills; cited in `references/frameworks/` context where "close relationships" constructs appear.

---

## G. Professional Referral Evidence Base

### 23. American Association for Marriage and Family Therapy (2020). *Marriage and Couples Counseling: Effectiveness Research Summary*. AAMFT.
- **Key findings:** Couples counseling effective for most distressed couples; earlier intervention yields better outcomes; supports the professional-referral pathway.
- **Effect size / evidence:** Expert consensus/evidence summary. Grade **B**.
- **Applied:** `referral-advisor` skill (when/how to refer); `references/safety/referral-guidance.md`; `assets/templates/referral-response.md`.

---

## Coverage map (paper → project component)

| Paper | Skill(s) | Tool(s) | Reference(s) |
|-------|----------|---------|--------------|
| Gottman & Silver 1999 | satisfaction-reflection | assessment_score, communication_exercise | frameworks/gottman-srh, assessments/srh-check, prompts/srh |
| Gottman 1994 | four-horsemen-education | assessment_score, communication_exercise | frameworks/four-horsemen, assessments/fh-check, prompts/fh |
| Gottman & Levenson 2000 | satisfaction-reflection | citation_lookup | frameworks/gottman-srh |
| Gottman & Schwartz Gottman 2008 | referral-advisor, communication-exercise-advisor | citation_lookup | safety/referral-guidance |
| Bowlby 1969 | attachment-reflection | citation_lookup | frameworks/attachment |
| Ainsworth 1978 | attachment-reflection | citation_lookup | frameworks/attachment |
| Johnson 2004 (EFT) | attachment-reflection, referral-advisor | citation_lookup | frameworks/attachment, safety/referral-guidance |
| Reis & Shaver 1988 | attachment-reflection, communication-exercise-advisor | citation_lookup | frameworks/attachment |
| Feeney & Collins 2003 | attachment-reflection | citation_lookup | frameworks/attachment |
| Rusbult 1980 | commitment-reflection | assessment_score, communication_exercise | frameworks/investment-model, assessments/commitment |
| Le & Agnew 2003 | commitment-reflection | citation_lookup | frameworks/investment-model |
| Gable et al. 2004 | acr-coach | assessment_score, communication_exercise | frameworks/acr, assessments/acr-check, prompts/acr |
| Fincham & Beach 2010 | acr-coach, satisfaction-reflection | citation_lookup | frameworks/acr |
| Overall et al. 2012 | communication-exercise-advisor, attachment-reflection | citation_lookup | prompts/fh, frameworks/attachment |
| Markman et al. 2010 | communication-exercise-advisor, referral-advisor | communication_exercise, citation_lookup | prompts/fh |
| Levenson, Carstensen, Gottman 1993 | satisfaction-reflection | citation_lookup | frameworks/gottman-srh |
| Huston et al. 2001 | referral-advisor, satisfaction-reflection | citation_lookup | safety/referral-guidance |
| Karney & Bradbury 1995 | attachment-reflection, referral-advisor | citation_lookup | frameworks/attachment |
| Amato 2010 | referral-advisor | citation_lookup | safety/referral-guidance |
| Finkel et al. 2014 | commitment-reflection | citation_lookup | frameworks/investment-model |
| Sprecher & Felmlee 2000 | (cultural) | citation_lookup | cultural/adaptations |
| Berscheid & Reis 1998 | (foundational) | citation_lookup | frameworks/* |
| AAMFT 2020 | referral-advisor | citation_lookup | safety/referral-guidance |

## Maintenance

- Keep this file in sync with `config/citations/registry.ts` (the runtime citation database). Every paper here should have a matching entry there, and vice versa.
- When adding a paper: add it here with an **Applied** mapping, add a `ResearchPaper` entry in `config/citations/registry.ts`, and link it to at least one skill/tool.
- Re-verify the citation database against live databases before any academic/professional deliverable use.
