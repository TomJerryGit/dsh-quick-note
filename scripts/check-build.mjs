/**
 * Verify that client.js is exactly what scripts/build-client.mjs would generate.
 * Fails (exit 1) when the artifact was hand-edited without rebuilding.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { composeClient } from './build-client.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artifactPath = path.join(root, 'client.js');
const artifact = fs.readFileSync(artifactPath, 'utf8');
const generated = composeClient();
if (artifact !== generated) {
  console.error('client.js is stale: run `npm run build` before committing/testing.');
  process.exitCode = 1;
} else {
  console.log('build artifact matches src (' + Buffer.byteLength(artifact) + ' bytes)');
}
