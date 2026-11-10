/**
 * R1 migration step 3: move PanelBoundary and SettingsSection source blocks out
 * of src/client.template.js into src/components.mjs (as injectable source text).
 * Run once, then scripts/build-client.mjs regenerates client.js.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const templateFile = path.join(root, 'src', 'client.template.js');
const source = fs.readFileSync(templateFile, 'utf8');

const specs = [
  { name: 'SectionHead', exportName: 'SectionHeadSource', marker: '    /*__QUICK_NOTE_SECTION_HEAD__*/' },
  { name: 'SettingsSection', exportName: 'SettingsSectionSource', marker: '    /*__QUICK_NOTE_SETTINGS_SECTION__*/' },
  { name: 'DueReminder', exportName: 'DueReminderSource', marker: '    /*__QUICK_NOTE_DUE_REMINDER__*/' },
];

const blocks = specs.map((spec) => {
  const open = '    function ' + spec.name + '(';
  const start = source.indexOf(open);
  if (start < 0) throw new Error('missing ' + spec.name);
  const close = source.indexOf('\n    }', start);
  if (close < 0) throw new Error('missing closing brace for ' + spec.name);
  const end = close + '\n    }'.length;
  return { ...spec, start, end, text: source.slice(start, end) };
});
blocks.sort((left, right) => right.start - left.start);

let template = source;
for (const block of blocks) template = template.slice(0, block.start) + block.marker + template.slice(block.end);
const components = blocks
  .slice()
  .sort((left, right) => left.start - right.start)
  .map((block) => 'export const ' + block.exportName + ' = ' + JSON.stringify(block.text) + ';')
  .join('\n\n');

fs.writeFileSync(templateFile, template, 'utf8');
fs.writeFileSync(path.join(root, 'src', 'components.mjs'), components + '\n', 'utf8');
console.log('template bytes=' + template.length + ' components bytes=' + components.length);
