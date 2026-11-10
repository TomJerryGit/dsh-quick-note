/** Inspect helperSources entries: node scripts/inspect-client-src.mjs <name> [needle] */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const module = await import(pathToFileURL(path.join(root, 'src', 'helpers.mjs')).href + '?t=' + Date.now());
const sources = module.helperSources;
const name = process.argv[2];
const needle = process.argv[3] || '';
if (name === '@all') {
  const query = needle;
  for (const [key, source] of Object.entries(sources)) {
    if (source.includes(query)) console.log(key);
  }
  process.exit(0);
}
if (!name) {
  console.log(Object.keys(sources).join('\n'));
  process.exit(0);
}
const source = sources[name];
if (source === undefined) {
  console.error('no such helper: ' + name);
  process.exit(1);
}
console.log('bytes=' + source.length);
if (needle.length === 0) console.log(source.slice(0, 6000));
else {
  let index = 0;
  let shown = 0;
  while ((index = source.indexOf(needle, index)) >= 0 && shown < 12) {
    console.log('--- @' + index + ' ---');
    console.log(source.slice(Math.max(0, index - 400), index + 600));
    index += needle.length;
    shown += 1;
  }
}
