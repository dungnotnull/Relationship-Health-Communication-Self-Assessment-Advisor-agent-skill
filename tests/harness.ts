/**
 * Test Harness — minimal, dependency-free unit-test framework.
 *
 * Provides describe/it/expect and a global suite registry. The runner
 * (tests/run-tests.ts) imports test modules (which register cases via
 * describe/it at import time) and then calls runAll().
 */

export interface TestCase {
  name: string;
  fn: () => void | Promise<void>;
}

export interface TestSuite {
  name: string;
  cases: TestCase[];
}

const SUITES: TestSuite[] = [];
let currentSuite: TestSuite | null = null;

export function describe(name: string, fn: () => void): void {
  const suite: TestSuite = { name, cases: [] };
  currentSuite = suite;
  try {
    fn();
  } finally {
    currentSuite = null;
  }
  SUITES.push(suite);
}

export function it(name: string, fn: () => void | Promise<void>): void {
  if (!currentSuite) throw new Error('it() called outside describe()');
  currentSuite.cases.push({ name, fn });
}

export interface ExpectResult {
  pass: boolean;
  message: string;
}

function ok(pass: boolean, message: string): ExpectResult {
  return { pass, message };
}

export interface Expect<T> {
  toBe(expected: T): ExpectResult;
  toEqual(expected: unknown): ExpectResult;
  toBeTrue(): ExpectResult;
  toBeFalse(): ExpectResult;
  toBeTruthy(): ExpectResult;
  toBeFalsy(): ExpectResult;
  toBeUndefined(): ExpectResult;
  toBeGreaterThan(n: number): ExpectResult;
  toBeLessThan(n: number): ExpectResult;
  toMatch(re: RegExp): ExpectResult;
  toContain(substr: string): ExpectResult;
  toThrow(matcher?: RegExp): ExpectResult;
  value: T;
  not: Expect<T>;
}

export function expect<T>(actual: T): Expect<T> {
  const api: Expect<T> = {
    value: actual,
    toBe(expected: T) {
      return ok(Object.is(actual, expected), 'expected ' + JSON.stringify(actual) + ' to be ' + JSON.stringify(expected));
    },
    toEqual(expected: unknown) {
      const pass = JSON.stringify(actual) === JSON.stringify(expected);
      return ok(pass, 'expected ' + JSON.stringify(actual) + ' to equal ' + JSON.stringify(expected));
    },
    toBeTrue() {
      return ok(actual === true, 'expected ' + JSON.stringify(actual) + ' to be true');
    },
    toBeFalse() {
      return ok(actual === false, 'expected ' + JSON.stringify(actual) + ' to be false');
    },
    toBeTruthy() {
      return ok(Boolean(actual), 'expected ' + JSON.stringify(actual) + ' to be truthy');
    },
    toBeFalsy() {
      return ok(!actual, 'expected ' + JSON.stringify(actual) + ' to be falsy');
    },
    toBeUndefined() {
      return ok(actual === undefined, 'expected ' + JSON.stringify(actual) + ' to be undefined');
    },
    toBeGreaterThan(n: number) {
      return ok((actual as unknown as number) > n, 'expected ' + JSON.stringify(actual) + ' > ' + n);
    },
    toBeLessThan(n: number) {
      return ok((actual as unknown as number) < n, 'expected ' + JSON.stringify(actual) + ' < ' + n);
    },
    toMatch(re: RegExp) {
      const pass = re.test(String(actual));
      return ok(pass, 'expected ' + JSON.stringify(actual) + ' to match ' + re);
    },
    toContain(substr: string) {
      const pass = String(actual).includes(substr);
      return ok(pass, 'expected ' + JSON.stringify(actual) + ' to contain ' + JSON.stringify(substr));
    },
    toThrow(matcher?: RegExp) {
      if (typeof actual !== 'function') return ok(false, 'toThrow expects a function');
      try {
        (actual as () => unknown)();
        return ok(false, 'expected function to throw');
      } catch (e) {
        if (matcher && !matcher.test(String(e))) return ok(false, 'expected thrown error to match ' + matcher + ' but was: ' + e);
        return ok(true, '');
      }
    },
  not: undefined as unknown as Expect<T>,
  };
  const invert: Expect<T> = {
    value: actual,
    toBe(expected: T) { return ok(!Object.is(actual, expected), 'expected ' + JSON.stringify(actual) + ' NOT to be ' + JSON.stringify(expected)); },
    toEqual(expected: unknown) { return ok(JSON.stringify(actual) !== JSON.stringify(expected), 'expected ' + JSON.stringify(actual) + ' NOT to equal ' + JSON.stringify(expected)); },
    toBeTrue() { return ok(actual !== true, 'expected NOT true'); },
    toBeFalse() { return ok(actual !== false, 'expected NOT false'); },
    toBeTruthy() { return ok(!actual, 'expected NOT truthy'); },
    toBeFalsy() { return ok(Boolean(actual), 'expected NOT falsy'); },
    toBeUndefined() { return ok(actual !== undefined, 'expected NOT undefined'); },
    toBeGreaterThan(n: number) { return ok(!((actual as unknown as number) > n), 'expected NOT > ' + n); },
    toBeLessThan(n: number) { return ok(!((actual as unknown as number) < n), 'expected NOT < ' + n); },
    toMatch(re: RegExp) { return ok(!re.test(String(actual)), 'expected NOT to match ' + re); },
    toContain(substr: string) { return ok(!String(actual).includes(substr), 'expected NOT to contain ' + JSON.stringify(substr)); },
    toThrow(matcher?: RegExp) {
      if (typeof actual !== 'function') return ok(false, 'toThrow expects a function');
      try { (actual as () => unknown)(); return ok(true, 'expected NOT to throw but it did'); }
      catch (e) { if (matcher && matcher.test(String(e))) return ok(true, 'expected NOT to throw matching ' + matcher); return ok(false, 'expected to throw'); }
    },
    not: undefined as unknown as Expect<T>,
  };
  api.not = invert;
  return api;
}

export async function runAll(): Promise<{ passed: number; failed: number; total: number }> {
  let passed = 0;
  let failed = 0;
  let total = 0;
  for (const suite of SUITES) {
    console.log('\n# ' + suite.name);
    for (const tc of suite.cases) {
      total++;
      const label = '  ' + tc.name;
      try {
        await tc.fn();
        passed++;
        console.log('ok ' + total + ' - ' + label);
      } catch (e) {
        failed++;
        const err = e as Error & { expected?: string };
        console.log('not ok ' + total + ' - ' + label);
        console.log('    ' + (err.message || String(e)));
      }
    }
  }
  console.log('\n' + passed + '/' + total + ' tests passed (' + failed + ' failed).');
  return { passed, failed, total };
}

/** Tiny assertion helper for non-expect-style checks. */
export function assert(cond: boolean, message: string): void {
  if (!cond) throw new Error(message);
}
