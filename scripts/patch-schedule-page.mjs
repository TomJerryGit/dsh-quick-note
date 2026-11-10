/** v1.28.0 slice: add the independent schedule-log Insights tab. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const helpersFile = path.join(root, 'src', 'helpers.mjs');
const helperModule = await import(pathToFileURL(helpersFile).href + '?t=' + Date.now());
const helperSources = { ...helperModule.helperSources };

const prefAnchor = "insightTab: raw && (raw.insightTab === 'usage' || raw.insightTab === 'system' || raw.insightTab === 'optimizer') ? raw.insightTab : 'value',";
if (helperSources.normalizePrefs.includes(prefAnchor)) {
  helperSources.normalizePrefs = helperSources.normalizePrefs.replace(
    prefAnchor,
    "insightTab: raw && (raw.insightTab === 'usage' || raw.insightTab === 'system' || raw.insightTab === 'optimizer' || raw.insightTab === 'schedule') ? raw.insightTab : 'value',",
  );
}

let panel = helperSources.WorkbenchPanel;
const deriveAnchor = "const insightTab = prefs.insightTab === 'usage' || prefs.insightTab === 'system' || prefs.insightTab === 'optimizer' ? prefs.insightTab : 'value';";
if (panel.includes(deriveAnchor)) {
  panel = panel.replace(
    deriveAnchor,
    "const insightTab = prefs.insightTab === 'usage' || prefs.insightTab === 'system' || prefs.insightTab === 'optimizer' || prefs.insightTab === 'schedule' ? prefs.insightTab : 'value';",
  );
}
const segmentAnchor = "                    { id: 'optimizer', label: t('optimizerTitle') },";
if (panel.includes(segmentAnchor) && !panel.includes("id: 'schedule'")) {
  panel = panel.replace(segmentAnchor, segmentAnchor + "\n                    { id: 'schedule', label: t('scheduleLogTitle') },");
}
const renderAnchor = "                  : insightTab === 'optimizer'";
if (panel.includes(renderAnchor) && !panel.includes("insightTab === 'schedule'")) {
  panel = panel.replace(
    "                    : insightTab === 'optimizer'\n                      ? h(OptimizerContent, {",
    "                    : insightTab === 'optimizer'\n                      ? h(OptimizerContent, {",
  );
  // Insert the schedule branch after the optimizer ternary chain's valuePane fallback.
  const valueAnchor = "                    : valuePane,";
  if (!panel.includes(valueAnchor)) throw new Error('insights fallback anchor missing');
  panel = panel.replace(
    valueAnchor,
    "                    : insightTab === 'schedule'\n                      ? h(ScheduleLogContent, { t, scheduleMode: settings.cleanupSchedule || 'off', onSchedule: (value) => saveSettings((current) => ({ ...current, cleanupSchedule: value })) })\n                      : valuePane,",
  );
}
helperSources.WorkbenchPanel = panel;
fs.writeFileSync(helpersFile, 'export const helperSources = ' + JSON.stringify(helperSources) + ';\n', 'utf8');
console.log('schedule page wired=' + panel.includes("insightTab === 'schedule'"));
