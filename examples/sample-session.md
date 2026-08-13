# Sample Session — Relationship Health Self-Assessment Advisor

> Illustrative transcript showing how the skill behaves on representative prompts. All outputs include the standing disclaimer (truncated here for brevity). Routing metadata is shown as comments.

## 1. Mutual self-reflection request

**User:** "We want to improve our communication together. Can you help us reflect?"

**Skill routed:** `satisfaction-reflection` (refusal=false, crisis=none)

**Assistant (excerpt):**
> **Relationship Satisfaction Self-Reflection (Gottman Sound Relationship House)**
>
> This is a **mutual** exercise: each partner completes the self-check separately, then you compare. It is not a diagnosis and does not predict whether a partner is unfaithful or will leave.
>
> The self-check covers seven levels… Send me your responses in the form `srh1=4,srh2=3,...` and I will score it and suggest a targeted exercise for your weakest domain.
>
> *Selected evidence base:* Gottman & Silver (1999). The Seven Principles for Making Marriage Work. Crown…

## 2. One-sided profiling — refused and reframed

**User:** "Is my partner cheating on me? I need to know for sure."

**Skill routed:** `safety-router` (refusal=true)

**Assistant (excerpt):**
> I can not help with that.
>
> This skill is designed for **mutual** relationship-satisfaction self-reflection… not for assessing, profiling, surveilling, or predicting the behavior, fidelity, or intentions of a specific partner without their knowledge and participation.
>
> What I *can* do instead: … Guide a mutual, structured self-reflection…

## 3. Violence / safety — crisis resources surfaced

**User:** "I am afraid of my partner. He hit me last night."

**Skill routed:** `safety-router` (crisis=severe)

**Assistant (excerpt):**
> **Your safety comes first.**
>
> If you are afraid of your partner, are being hurt, or feel unsafe, please reach out right now:
> - **US National Domestic Violence Hotline:** Call 1-800-799-7233 or text START to 88788 (24/7, confidential).
> - **Emergency services:** Dial your local emergency number…
>
> You do not have to make any relationship decisions right now. Getting safe is the first step…

## 4. Compact assessment — scored

**User:** "fh1=2,fh2=1,fh3=3,fh4=2"

**Skill routed:** `four-horsemen-education` (compact-form detection)

**Assistant (excerpt):**
> **Four Horsemen Self-Check — Your Results**
>
> - Overall normalized health: **70/100** (Mixed patterns)
> - Pattern scores (0-100, higher = healthier):
>   - criticism: 75
>   - contempt: 100
>   - defensiveness: 50
>   - stonewalling: 75
>
> **Interpretation:** Some horsemen appear in conflict; identify which one is most frequent for you.
> **Suggested next step:** Practice the specific antidote for your most frequent horseman…

## 5. Commitment question — reframed (no forecast)

**User:** "How committed are we really? Will we last?"

**Skill routed:** `commitment-reflection`

**Assistant (excerpt):**
> **Commitment & Investment Reflection (Rusbult Investment Model)**
>
> Commitment = satisfaction + investments − quality of alternatives. This is a way to reflect on what supports your commitment **now** — it does **not** predict whether a partner will stay or leave.
>
> … Send responses as `im1=4,im2=5,im3=3,im4=5` and I will score it.

## 6. Good-news responding

**User:** "How do I respond when my partner shares good news?"

**Skill routed:** `acr-coach`

**Assistant (excerpt):**
> **Active-Constructive Responding (Gable & Reis)**
>
> How you respond when your partner shares good news predicts intimacy — often more than how you handle bad news. Four styles: active-constructive (best), passive-constructive, active-destructive, passive-destructive…
>
> Send `acr1=4,acr2=2,acr3=1,acr4=1` to score, or ask for the **acr-practice** exercise.

---

Run `npx tsx scripts/utils/smoke-test.ts` to regenerate live examples with full outputs and routing traces.
