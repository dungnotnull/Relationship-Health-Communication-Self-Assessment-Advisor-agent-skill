/**
 * Test Runner — imports all unit-test modules (which register cases via
 * describe/it at import time) and runs the global suite. Exits non-zero on
 * any failure.
 *
 * Usage:  npx tsx tests/run-tests.ts   (or:  npm test)
 */

import { runAll } from './harness.js';

// Import test modules (side effect: registration).
import './safety/surveillance.test.js';
import './router.test.js';
import './assessments.test.js';
import './citations.test.js';
import './llm/post-validator.test.js';
import './llm/token-budget.test.js';
import './llm/client.test.js';
import './orchestrator.test.js';
import './tools.test.js';

const result = await runAll();
if (result.failed > 0) process.exit(1);
console.log('\nALL UNIT TESTS PASSED.');
