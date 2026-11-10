/**
 * R1 migration step 2: move ICON_PATHS / STYLES / STYLE_UPGRADES out of
 * src/client.template.js into src/ui-assets.mjs and leave injection markers.
 * Run once, then scripts/build-client.mjs regenerates client.js.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const templateFile = path.join(root, 'src', 'client.template.js');
const source = fs.readFileSync(templateFile, 'utf8');

const specs = [
  { name: 'ICON_PATHS', open: '    const ICON_PATHS = {', close: '\n    };', marker: '    /*__QUICK_NOTE_ICONS__*/' },
  { name: 'STYLES', open: '    const STYLES = [', close: "\n    ].join('\\n');", marker: '    /*__QUICK_NOTE_STYLES__*/' },
  { name: 'STYLE_UPGRADES', open: '    const STYLE_UPGRADES = [', close: "\n    ].join('\\n');", marker: '    /*__QUICK_NOTE_STYLE_UPGRADES__*/' },
];

const blocks = [];
for (const spec of specs) {
  const start = source.indexOf(spec.open);
  if (start < 0) throw new Error('missing block ' + spec.name);
  const close = source.indexOf(spec.close, start);
  if (close < 0) throw new Error('missing closing token for ' + spec.name);
  const end = close + spec.close.length;
  blocks.push({ ...spec, start, end, text: source.slice(start, end) });
}
blocks.sort((left, right) => right.start - left.start);

let template = source;
for (const block of blocks) {
  template = template.slice(0, block.start) + block.marker + template.slice(block.end);
}
const assets = blocks
  .slice()
  .sort((left, right) => left.start - right.start)
  .map((block) => block.text.replace('    const ', 'export const '))
  .join('\n\n');

fs.writeFileSync(templateFile, template, 'utf8');
fs.writeFileSync(path.join(root, 'src', 'ui-assets.mjs'), assets + '\n', 'utf8');
console.log('template bytes=' + template.length + ' assets bytes=' + assets.length);
