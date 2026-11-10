/** v1.36.0: show all medication times in selected-day detail and timeline rows. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const helpersFile = path.join(root, 'src', 'helpers.mjs');
const module = await import(pathToFileURL(helpersFile).href + '?t=' + Date.now());
const sources = { ...module.helperSources };
const anchor = "h('span', { className: 'dshqn-calendar-event-title' }, event.label),";
const replacement =
  "h('span', { className: 'dshqn-calendar-event-title' }, event.label),\n                                event.medTimes !== undefined && event.medTimes.length > 1\n                                  ? h('span', { className: 'dshqn-settings-hint' }, event.medTimes.join(' / '))\n                                  : null,";
const count = sources.WorkbenchPanel.split(anchor).length - 1;
if (count === 0) throw new Error('calendar event title anchor missing');
sources.WorkbenchPanel = sources.WorkbenchPanel.split(anchor).join(replacement);
fs.writeFileSync(helpersFile, 'export const helperSources = ' + JSON.stringify(sources) + ';\n', 'utf8');
console.log('replaced=' + count);
