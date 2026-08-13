/**
 * Structured Logger — Relationship Health Self-Assessment Advisor
 *
 * Emits structured JSON log lines (one per event) to stderr or a file, with
 * level filtering, PII redaction, and a separate audit trail for safety-critical
 * events (refusals, crisis surfacing, post-validation failures, errors).
 *
 * No runtime dependencies. Uses only Node built-ins.
 */

import type { LogLevel, Logger, LogEntry, ObservabilityConfig } from '../schemas.js';
import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const LEVEL_WEIGHT: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const PII_PATTERNS: RegExp[] = [
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // phone numbers
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, // emails
  /\b(?:\d[ -]*?){13,16}\b/g, // credit-card-like
];

function redact(value: unknown, enabled: boolean): unknown {
  if (!enabled) return value;
  if (typeof value === 'string') {
    let r = value;
    for (const p of PII_PATTERNS) r = r.replace(p, '[REDACTED]');
    return r;
  }
  if (Array.isArray(value)) return value.map((v) => redact(v, enabled));
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = redact(v, enabled);
    }
    return out;
  }
  return value;
}

export class StructuredLogger implements Logger {
  private cfg: ObservabilityConfig;
  private sessionRedact: boolean;

  constructor(cfg: ObservabilityConfig) {
    this.cfg = cfg;
    this.sessionRedact = cfg.redact_pii;
    if (cfg.log_destination === 'file' && cfg.log_file_path) {
      const dir = dirname(cfg.log_file_path);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    }
  }

  private shouldEmit(level: LogLevel): boolean {
    return LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[this.cfg.log_level];
  }

  emit(entry: Omit<LogEntry, 'timestamp' | 'level'> & { level: LogLevel }): void {
    if (!this.shouldEmit(entry.level)) return;
    const full: LogEntry = {
      timestamp: new Date().toISOString(),
      level: entry.level,
      phase: entry.phase,
      session_id: entry.session_id,
      ...entry,
      context: redact(entry.context, this.sessionRedact) as Record<string, unknown> | undefined,
      input_summary: entry.input_summary !== undefined ? (redact(entry.input_summary, this.sessionRedact) as string) : undefined,
      output_summary: entry.output_summary !== undefined ? (redact(entry.output_summary, this.sessionRedact) as string) : undefined,
    };
    const line = JSON.stringify(full);
    if (this.cfg.log_destination === 'stderr') {
      process.stderr.write(line + '\n');
    } else if (this.cfg.log_destination === 'file' && this.cfg.log_file_path) {
      appendFileSync(this.cfg.log_file_path, line + '\n', 'utf8');
    }
    // 'silent' emits nothing.
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.emit({ level: 'debug', phase: 'debug', session_id: '', message, context });
  }
  info(message: string, context?: Record<string, unknown>): void {
    this.emit({ level: 'info', phase: 'info', session_id: '', message, context });
  }
  warn(message: string, context?: Record<string, unknown>): void {
    this.emit({ level: 'warn', phase: 'warn', session_id: '', message, context });
  }
  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.emit({ level: 'error', phase: 'error', session_id: '', message, error: error ? { name: error.name, message: error.message, stack: error.stack } : undefined, context });
  }

  /** Session-scoped child logger (carries session_id + phase). */
  child(sessionId: string, phase: string): SessionLogger {
    return new SessionLogger(this, sessionId, phase);
  }

  /** Emit an audit-trail entry for a safety-critical event. */
  audit(event: string, sessionId: string, details: Record<string, unknown>): void {
    if (!this.cfg.audit_safety_events) return;
    this.emit({ level: 'warn', phase: 'audit', session_id: sessionId, message: 'AUDIT: ' + event, context: redact(details, this.sessionRedact) as Record<string, unknown> });
  }
}

export class SessionLogger implements Logger {
  constructor(private parent: StructuredLogger, private sessionId: string, private phase: string) {}

  debug(message: string, context?: Record<string, unknown>): void {
    this.parent.emit({ level: 'debug', phase: this.phase, session_id: this.sessionId, message, context });
  }
  info(message: string, context?: Record<string, unknown>): void {
    this.parent.emit({ level: 'info', phase: this.phase, session_id: this.sessionId, message, context });
  }
  warn(message: string, context?: Record<string, unknown>): void {
    this.parent.emit({ level: 'warn', phase: this.phase, session_id: this.sessionId, message, context });
  }
  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.parent.emit({ level: 'error', phase: this.phase, session_id: this.sessionId, message, error, context });
  }

  audit(event: string, details: Record<string, unknown>): void {
    this.parent.audit(event, this.sessionId, details);
  }
}

export { LEVEL_WEIGHT };
