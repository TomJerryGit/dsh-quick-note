/** v1.33.0 slice: IANA timezone normalization + trash preset props. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const helpersFile = path.join(root, 'src', 'helpers.mjs');
const helperModule = await import(pathToFileURL(helpersFile).href + '?t=' + Date.now());
const helperSources = { ...helperModule.helperSources };

const timezoneAnchor = "cleanupScheduleTimezone: typeof source.cleanupScheduleTimezone === 'string' && (source.cleanupScheduleTimezone === 'local' || /^UTC[+-]\\d{1,2}$/.test(source.cleanupScheduleTimezone)) ? source.cleanupScheduleTimezone : 'local',";
if (helperSources.normalizeSettings.includes(timezoneAnchor)) {
  helperSources.normalizeSettings = helperSources.normalizeSettings.replace(
    timezoneAnchor,
    "cleanupScheduleTimezone: (() => { const value = source.cleanupScheduleTimezone; if (typeof value !== 'string') return 'local'; if (value === 'local' || /^UTC[+-]\\d{1,2}$/.test(value)) return value; if (value.length <= 64 && /^[A-Za-z0-9_+\\-/]+\\/[A-Za-z0-9_+\\-/]+$/.test(value)) return value; return 'local'; })(),",
  );
}
if (!helperSources.normalizeSettings.includes('trashPresets')) {
  const anchor = "cleanupScheduleTimezone: (() => {";
  if (!helperSources.normalizeSettings.includes(anchor)) throw new Error('timezone anchor missing for presets');
  helperSources.normalizeSettings = helperSources.normalizeSettings.replace(
    anchor,
    "trashPresets: Array.isArray(source.trashPresets) ? source.trashPresets.filter((entry) => entry && typeof entry.name === 'string' && entry.name.trim().length > 0).slice(0, 10).map((entry) => ({ name: entry.name.trim().slice(0, 30), type: typeof entry.type === 'string' ? entry.type.slice(0, 20) : 'all', workspace: typeof entry.workspace === 'string' ? entry.workspace.slice(0, 120) : 'all', query: typeof entry.query === 'string' ? entry.query.slice(0, 80) : '' })) : [],\n        " + anchor,
  );
}

let panel = helperSources.WorkbenchPanel;
if (!panel.includes('onTrashPresets:')) {
  const anchor = "onCronTimezone: (value) => saveSettings((current) => ({ ...current, cleanupScheduleTimezone: value })) }";
  if (!panel.includes(anchor)) throw new Error('cron timezone props anchor missing');
  panel = panel.split(anchor).join(
    "onCronTimezone: (value) => saveSettings((current) => ({ ...current, cleanupScheduleTimezone: value })), trashPresets: Array.isArray(settings.trashPresets) ? settings.trashPresets : [], onTrashPresets: (value) => saveSettings((current) => ({ ...current, trashPresets: value })) }",
  );
}
helperSources.WorkbenchPanel = panel;
fs.writeFileSync(helpersFile, 'export const helperSources = ' + JSON.stringify(helperSources) + ';\n', 'utf8');
console.log('iana=' + helperSources.normalizeSettings.includes('trashPresets') + ' presets=' + panel.includes('onTrashPresets:'));
