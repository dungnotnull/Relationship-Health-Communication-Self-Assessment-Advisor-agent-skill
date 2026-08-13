/**
 * Metrics Registry — lightweight in-process metrics for observability.
 *
 * Counters, timers, and a per-session snapshot. No runtime dependencies.
 */

export interface MetricsSnapshot {
  counters: Record<string, number>;
  timers: Record<string, { count: number; total_ms: number; min_ms: number; max_ms: number }>;
  gauge: Record<string, number>;
}

export class MetricsRegistry {
  private counters: Record<string, number> = {};
  private timers: Record<string, { count: number; total_ms: number; min_ms: number; max_ms: number }> = {};
  private gauge: Record<string, number> = {};

  inc(name: string, by: number = 1): void {
    this.counters[name] = (this.counters[name] || 0) + by;
  }

  setGauge(name: string, value: number): void {
    this.gauge[name] = value;
  }

  /** Time a callable; records count, total, min, max. */
  time<T>(name: string, fn: () => T): T {
    const start = Date.now();
    try {
      return fn();
    } finally {
      const ms = Date.now() - start;
      const t = this.timers[name] || { count: 0, total_ms: 0, min_ms: Infinity, max_ms: 0 };
      t.count += 1;
      t.total_ms += ms;
      t.min_ms = Math.min(t.min_ms, ms);
      t.max_ms = Math.max(t.max_ms, ms);
      this.timers[name] = t;
    }
  }

  recordTiming(name: string, ms: number): void {
    const t = this.timers[name] || { count: 0, total_ms: 0, min_ms: Infinity, max_ms: 0 };
    t.count += 1;
    t.total_ms += ms;
    t.min_ms = Math.min(t.min_ms, ms);
    t.max_ms = Math.max(t.max_ms, ms);
    this.timers[name] = t;
  }

  snapshot(): MetricsSnapshot {
    const out: MetricsSnapshot = { counters: { ...this.counters }, timers: {}, gauge: { ...this.gauge } };
    for (const [k, v] of Object.entries(this.timers)) {
      out.timers[k] = { count: v.count, total_ms: v.total_ms, min_ms: v.min_ms === Infinity ? 0 : v.min_ms, max_ms: v.max_ms };
    }
    return out;
  }

  reset(): void {
    this.counters = {};
    this.timers = {};
    this.gauge = {};
  }
}

let registry: MetricsRegistry | null = null;
export function getMetrics(): MetricsRegistry {
  if (!registry) registry = new MetricsRegistry();
  return registry;
}
export function resetMetrics(): void {
  registry = null;
}
