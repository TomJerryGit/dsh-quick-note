/** v1.32.0 slice: timezone setting + props. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const helpersFile = path.join(root, 'src', 'helpers.mjs');
const helperModule = await import(pathToFileURL(helpersFile).href + '?t=' + Date.now());
const helperSources = { ...helperModule.helperSources };

if (!helperSources.normalizeSettings.includes('cleanupScheduleTimezone')) {
  const anchor = "        cleanupScheduleCron: typeof source.cleanupScheduleCron === 'string' && /^(\\S+\\s+){4}\\S+$/.test(source.cleanupScheduleCron.trim()) ? source.cleanupScheduleCron.trim().slice(0, 100) : '',";
  if (!helperSources.normalizeSettings.includes(anchor)) throw new Error('cron anchor missing');
  helperSources.normalizeSettings = helperSources.normalizeSettings.replace(
    anchor,
    anchor + "\n        cleanupScheduleTimezone: typeof source.cleanupScheduleTimezone === 'string' && (source.cleanupScheduleTimezone === 'local' || /^UTC[+-]\\d{1,2}$/.test(source.cleanupScheduleTimezone)) ? source.cleanupScheduleTimezone : 'local',",
  );
}

let panel = helperSources.WorkbenchPanel;
if (!panel.includes('onCronTimezone:')) {
  const anchor = "cron: typeof settings.cleanupScheduleCron === 'string' ? settings.cleanupScheduleCron : '', onCron: (value) => saveSettings((current) => ({ ...current, cleanupScheduleCron: value })) }";
  if (!panel.includes(anchor)) throw new Error('cron props anchor missing');
  panel = panel.split(anchor).join(
    "cron: typeof settings.cleanupScheduleCron === 'string' ? settings.cleanupScheduleCron : '', onCron: (value) => saveSettings((current) => ({ ...current, cleanupScheduleCron: value })), cronTimezone: typeof settings.cleanupScheduleTimezone === 'string' ? settings.cleanupScheduleTimezone : 'local', onCronTimezone: (value) => saveSettings((current) => ({ ...current, cleanupScheduleTimezone: value })) }",
  );
  const pageAnchor = "cron: settings.cleanupScheduleCron || '', onCron: (value) => saveSettings((current) => ({ ...current, cleanupScheduleCron: value })) }";
  if (panel.includes(pageAnchor)) {
    panel = panel.split(pageAnchor).join(
      "cron: settings.cleanupScheduleCron || '', onCron: (value) => saveSettings((current) => ({ ...current, cleanupScheduleCron: value })), cronTimezone: settings.cleanupScheduleTimezone || 'local', onCronTimezone: (value) => saveSettings((current) => ({ ...current, cleanupScheduleTimezone: value })) }",
    );
  }
}
helperSources.WorkbenchPanel = panel;
fs.writeFileSync(helpersFile, 'export const helperSources = ' + JSON.stringify(helperSources) + ';\n', 'utf8');
console.log('timezone wired=' + panel.includes('onCronTimezone:'));
