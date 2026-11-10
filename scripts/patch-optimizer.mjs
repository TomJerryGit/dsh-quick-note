/**
 * R1 feature slice: wire the optimizer module into the entry body.
 * Adds the injection marker before apply() and calls registerOptimizer(ctx).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const entryFile = path.join(root, 'src', 'entry.mjs');
const text = fs.readFileSync(entryFile, 'utf8');
const match = text.match(/^export const EntryBodySource = ([\s\S]*);\n$/);
if (match === null) throw new Error('unexpected entry.mjs shape');
let body = JSON.parse(match[1]);
if (!body.includes('/*__QUICK_NOTE_OPTIMIZER__*/')) {
  body = body.replace('    function apply(ctx) {', '    /*__QUICK_NOTE_OPTIMIZER__*/\n\n    function apply(ctx) {');
}
if (!body.includes('registerOptimizer(ctx);')) {
  body = body.replace('      const prefs = getPrefsStore();', '      const prefs = getPrefsStore();\n      registerOptimizer(ctx);');
}
fs.writeFileSync(entryFile, 'export const EntryBodySource = ' + JSON.stringify(body) + ';\n', 'utf8');
console.log('entry patched bytes=' + body.length);
