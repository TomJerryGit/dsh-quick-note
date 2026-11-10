/**
 * One-off R1 migration step: move the zh/en dictionaries out of the monolithic
 * client.js into src/locale.mjs and leave two markers in src/client.template.js.
 * Run once, then use scripts/build-client.mjs to regenerate client.js.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'client.js'), 'utf8');

/** Find one top-level `const name = {` block and its closing `    };` line. */
function findBlock(name) {
  const marker = '    const ' + name + ' = {';
  const start = source.indexOf(marker);
  if (start < 0) throw new Error('missing ' + name + ' block');
  const close = source.indexOf('\n    };', start);
  if (close < 0) throw new Error('missing closing brace for ' + name);
  return { start, end: close + '\n    };'.length, text: source.slice(start, close + '\n    };'.length) };
}

const zh = findBlock('zh');
const en = findBlock('en');
if (zh.start > en.start) throw new Error('unexpected dictionary order');

const marker = '    /*__QUICK_NOTE_LOCALE__*/';
const template = source.slice(0, zh.start) + marker + '\n' + source.slice(zh.end, en.start) + marker + '\n' + source.slice(en.end);
const locale = zh.text.replace('    const zh =', 'export const zh =') + '\n\n' + en.text.replace('    const en =', 'export const en =');

fs.mkdirSync(path.join(root, 'src'), { recursive: true });
fs.writeFileSync(path.join(root, 'src', 'client.template.js'), template, 'utf8');
fs.writeFileSync(path.join(root, 'src', 'locale.mjs'), locale + '\n', 'utf8');
console.log('template bytes=' + template.length + ' locale bytes=' + locale.length);
