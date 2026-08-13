/**
 * Post-Validator — safety validation of LLM output before it reaches the user.
 *
 * The LLM is treated as untrusted: its output must pass these checks or the
 * orchestrator falls back to the deterministic handler output. This preserves
 * every guardrail regardless of model behaviour.
 */

export interface PostValidationResult {
  valid: boolean;
  reasons: string[];
  /** The output with the mandatory disclaimer appended if it was missing. */
  cleaned: string;
}

const DISCLAIMER_RE = /\*\*Disclaimer:\*\*/i;

// Individual forecasts / probability statements for a specific couple.
const FORECAST_RE = /(\d{1,3}\s*%)\s*(chance|likelihood|probability|likely|odds).{0,50}(divorce|leav|cheat|stay|faithful|affair|unfaithful)|(\d{1,3}\s*%)\s+.{0,20}(divorce|leav|cheat|faithful)|(\bwill\b|\bgoing to\b)\s+(definitely|certainly|almost certainly)?\s*(leave you|cheat on you|divorce you|be unfaithful)/i;

// Partner labeling / diagnosis.
const LABEL_RE = /\b(your partner|he|she)\s+is\s+(a|an)\s+(narcissist|psychopath|sociopath|toxic\s+person|abuser|manipulator|borderline)\b/i;
const DIAGNOSE_RE = /\b(you|your partner)\s+(have|has)\s+(a|an)?\s*(borderline|narcissistic|bipolar|personality disorder|depression|anxiety disorder)\b/i;

// Surveillance assistance.
const SURVEILLANCE_HELP_RE = /\b(how to (track|monitor|spy on|surveil)\s+(your|my|a)\s+partner|install (a)?\s*(keylogger|gps tracker|hidden camera)|read (your|my|a) partner'?s (phone|messages|texts) without)\b/i;

export function validateLLMOutput(output: string, opts: { strict: boolean; requireDisclaimer: boolean }): PostValidationResult {
  const reasons: string[] = [];
  let cleaned = output;

  if (opts.requireDisclaimer && !DISCLAIMER_RE.test(output)) {
    // Auto-append the disclaimer rather than fail — this is a safe, deterministic fix.
    cleaned = output.trimEnd() + '\n\n**Disclaimer:** This skill provides general, educational/analytical information only. It is not a substitute for advice from a qualified professional.';
  }

  if (FORECAST_RE.test(output)) reasons.push('contains an individual forecast/probability');
  if (LABEL_RE.test(output)) reasons.push('labels/diagnoses a partner');
  if (DIAGNOSE_RE.test(output)) reasons.push('diagnoses a partner or user');
  if (SURVEILLANCE_HELP_RE.test(output)) reasons.push('provides surveillance assistance');

  // In non-strict mode, only hard violations (forecast/label/surveillance) invalidate.
  // In strict mode, any reason invalidates.
  const valid = reasons.length === 0;
  return { valid, reasons, cleaned };
}

export function isSafetyCriticalFailure(reasons: string[]): boolean {
  return reasons.length > 0;
}
