/** Repair: insert the schedule insight render branch into WorkbenchPanel. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const helpersFile = path.join(root, 'src', 'helpers.mjs');
const helperModule = await import(pathToFileURL(helpersFile).href + '?t=' + Date.now());
const helperSources = { ...helperModule.helperSources };
let panel = helperSources.WorkbenchPanel;
if (!panel.includes('ScheduleLogContent')) {
  const anchor = '\n                    : valuePane,';
  const count = panel.split(anchor).length - 1;
  if (count !== 1) throw new Error('valuePane anchor count=' + count);
  panel = panel.split(anchor).join(
    '\n                    : insightTab === \'schedule\'\n                      ? h(ScheduleLogContent, { t, scheduleMode: settings.cleanupSchedule || \'off\', onSchedule: (value) => saveSettings((current) => ({ ...current, cleanupSchedule: value })) })\n                      : valuePane,',
  );
}
helperSources.WorkbenchPanel = panel;
fs.writeFileSync(helpersFile, 'export const helperSources = ' + JSON.stringify(helperSources) + ';\n', 'utf8');
const verify = fs.readFileSync(helpersFile, 'utf8');
console.log('branch=' + verify.includes("insightTab === 'schedule'") + ' scheduleComponent=' + verify.includes('ScheduleLogContent') + ' bytes=' + verify.length);
