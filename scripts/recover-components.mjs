/** Recover component source blocks from the last built client.js after an accidental source overwrite. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const client = fs.readFileSync(path.join(root, 'client.js'), 'utf8');
const lines = client.split('\n');
const specs = [
  { name: 'SectionHead', exportName: 'SectionHeadSource' },
  { name: 'SettingsSection', exportName: 'SettingsSectionSource' },
  { name: 'DueReminder', exportName: 'DueReminderSource' },
];
const blocks = specs.map((spec) => {
  const start = lines.findIndex((line) => line.startsWith('    function ' + spec.name + '('));
  if (start < 0) throw new Error('missing ' + spec.name);
  const end = lines.findIndex((line, index) => index > start && line === '    }');
  if (end < 0) throw new Error('missing closing brace for ' + spec.name);
  return { ...spec, text: lines.slice(start, end + 1).join('\n') };
});
const output = blocks.map((block) => 'export const ' + block.exportName + ' = ' + JSON.stringify(block.text) + ';').join('\n\n');
fs.writeFileSync(path.join(root, 'src', 'components.mjs'), output + '\n', 'utf8');
console.log(blocks.map((block) => block.name + '=' + block.text.length).join(' '));
