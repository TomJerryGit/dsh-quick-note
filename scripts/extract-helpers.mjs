/**
 * R1 migration step 4: move every remaining top-level helper/component function
 * source block out of src/client.template.js into src/helpers.mjs, leaving one
 * injection marker per function. The build re-emits them in their original order.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const templateFile = path.join(root, 'src', 'client.template.js');
const source = fs.readFileSync(templateFile, 'utf8');

const pattern = /^    function ([A-Za-z_$][\w$]*)\(/gm;
const blocks = [];
let match;
while ((match = pattern.exec(source)) !== null) {
  const name = match[1];
  if (name === 'apply') continue;
  const start = match.index;
  const close = source.indexOf('\n    }', start);
  if (close < 0) throw new Error('missing closing brace for ' + name);
  const end = close + '\n    }'.length;
  blocks.push({ name, start, end, text: source.slice(start, end) });
}
for (let index = 1; index < blocks.length; index += 1) {
  if (blocks[index].start < blocks[index - 1].end) throw new Error('overlapping function block ' + blocks[index].name);
}

let template = source;
for (const block of blocks.slice().sort((left, right) => right.start - left.start)) {
  template = template.slice(0, block.start) + '    /*__QUICK_NOTE_HELPER__' + block.name + '__*/' + template.slice(block.end);
}

let helpers = '/** R1: standalone helper/component source blocks injected by build-client.mjs. */\nexport const helperSources = {\n';
for (const block of blocks) helpers += '  ' + JSON.stringify(block.name) + ': ' + JSON.stringify(block.text) + ',\n';
helpers += '};\n';

fs.writeFileSync(templateFile, template, 'utf8');
fs.writeFileSync(path.join(root, 'src', 'helpers.mjs'), helpers, 'utf8');
console.log('migrated=' + blocks.length + ' template bytes=' + template.length + ' helpers bytes=' + helpers.length);
