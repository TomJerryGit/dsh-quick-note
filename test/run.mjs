/**
 * Regression test runner for the plugin.
 *
 * Usage (from the plugin root):
 *   ELECTRON_RUN_AS_NODE=1 "<path to DeepSeek Harness.exe>" test/run.mjs
 * or, with Node 22+ installed:
 *   node test/run.mjs
 *
 * Exit code 0 = all suites passed; 1 = at least one failure.
 */
import { run as runHost } from './host.test.mjs';
import { run as runClient } from './client.test.mjs';

console.log('== host tests ==');
await runHost();
console.log('== client tests ==');
await runClient();
console.log(process.exitCode === 1 ? 'RESULT FAIL' : 'RESULT PASS');
