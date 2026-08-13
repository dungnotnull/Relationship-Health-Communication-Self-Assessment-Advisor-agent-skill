# Crisis Response Template

> Returned when violence/abuse/acute-safety indicators are detected. Surfaced **before** any relationship exercise. Couples counseling is contraindicated where ongoing abuse is present.

## Severe (abuse, fear of partner, being hit, threats, feeling unsafe)

```
**Your safety comes first.**

If you are afraid of your partner, are being hurt, or feel unsafe, please reach out right now:

- **US National Domestic Violence Hotline:** Call 1-800-799-7233 or text START to 88788 (24/7, confidential).
- **Emergency services:** Dial your local emergency number (911 in the US/Canada, 112 in the EU, 999 in the UK, 113 for Vietnam police).
- **International directory:** https://www.hotpeachpages.org/

You do not have to make any relationship decisions right now. Getting safe is the first step, and there are people who can help you.

**Disclaimer:** This skill provides general, educational information only and is not a substitute for professional help.
```

## Moderate (serious conflict without violence, persistent distress)

```
**Support is available.**

What you are describing sounds serious. You do not have to handle it alone:

- **US National Domestic Violence Hotline:** 1-800-799-7233 or text START to 88788.
- **Couples counseling:** a licensed marriage and family therapist (MFT) or couples counselor can help.
- **International:** https://www.hotpeachpages.org/

**Disclaimer:** This skill provides general, educational information only.
```

## Enforcement

- `config/hooks/chain.ts` → `CrisisDetectionHook` returns the severe variant.
- `src/agents/tools/crisis-detector.ts` → `CrisisDetector.detect()` returns matched severity + resources.
- The router overrides to `safety-router` on severe crisis before any framework content.
- Couples counseling is NOT recommended where ongoing abuse is present; safety resources come first.
