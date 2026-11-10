/** v1.30.0 slice: cron expression setting + props. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const helpersFile = path.join(root, 'src', 'helpers.mjs');
const helperModule = await import(pathToFileURL(helpersFile).href + '?t=' + Date.now());
const helperSources = { ...helperModule.helperSources };

if (!helperSources.normalizeSettings.includes('cleanupScheduleCron')) {
  const anchor = "        cleanupScheduleTime: typeof source.cleanupScheduleTime === 'string' && /^([01]\\d|2[0-3]):[0-5]\\d$/.test(source.cleanupScheduleTime) ? source.cleanupScheduleTime : '03:00',";
  if (!helperSources.normalizeSettings.includes(anchor)) throw new Error('schedule time anchor missing');
  helperSources.normalizeSettings = helperSources.normalizeSettings.replace(
    anchor,
    anchor + "\n        cleanupScheduleCron: typeof source.cleanupScheduleCron === 'string' && /^(\\S+\\s+){4}\\S+$/.test(source.cleanupScheduleCron.trim()) ? source.cleanupScheduleCron.trim().slice(0, 100) : '',",
  );
}

let panel = helperSources.WorkbenchPanel;
if (!panel.includes('onCron:')) {
  const anchor = "scheduleTime: typeof settings.cleanupScheduleTime === 'string' ? settings.cleanupScheduleTime : '03:00', onScheduleTime: (value) => saveSettings((current) => ({ ...current, cleanupScheduleTime: value })) }";
  if (!panel.includes(anchor)) throw new Error('schedule time props anchor missing');
  panel = panel.split(anchor).join(
    "scheduleTime: typeof settings.cleanupScheduleTime === 'string' ? settings.cleanupScheduleTime : '03:00', onScheduleTime: (value) => saveSettings((current) => ({ ...current, cleanupScheduleTime: value })), cron: typeof settings.cleanupScheduleCron === 'string' ? settings.cleanupScheduleCron : '', onCron: (value) => saveSettings((current) => ({ ...current, cleanupScheduleCron: value })) }",
  );
  const pageAnchor = "scheduleTime: settings.cleanupScheduleTime || '03:00', onScheduleTime: (value) => saveSettings((current) => ({ ...current, cleanupScheduleTime: value })) }";
  if (panel.includes(pageAnchor)) {
    panel = panel.split(pageAnchor).join(
      "scheduleTime: settings.cleanupScheduleTime || '03:00', onScheduleTime: (value) => saveSettings((current) => ({ ...current, cleanupScheduleTime: value })), cron: settings.cleanupScheduleCron || '', onCron: (value) => saveSettings((current) => ({ ...current, cleanupScheduleCron: value })) }",
    );
  }
}
helperSources.WorkbenchPanel = panel;
fs.writeFileSync(helpersFile, 'export const helperSources = ' + JSON.stringify(helperSources) + ';\n', 'utf8');
console.log('cron expr wired=' + panel.includes('onCron:'));
