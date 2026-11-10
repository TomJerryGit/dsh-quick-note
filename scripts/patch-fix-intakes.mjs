/** Fix double-escaped digit classes in the client normalizeHealth intakes regex. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const helpersFile = path.join(root, 'src', 'helpers.mjs');
const module = await import(pathToFileURL(helpersFile).href + '?t=' + Date.now());
const sources = { ...module.helperSources };
const backslash = String.fromCharCode(92);
if (sources.normalizeHealth.includes(backslash + backslash + 'd')) {
  sources.normalizeHealth = sources.normalizeHealth.split(backslash + backslash + 'd').join(backslash + 'd');
}
fs.writeFileSync(helpersFile, 'export const helperSources = ' + JSON.stringify(sources) + ';\n', 'utf8');
console.log('intakes regex fixed=' + !sources.normalizeHealth.includes(backslash + backslash + 'd'));
