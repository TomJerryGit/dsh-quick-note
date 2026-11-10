/** v1.29.0 slice: cron time setting + schedule page props. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const helpersFile = path.join(root, 'src', 'helpers.mjs');
const helperModule = await import(pathToFileURL(helpersFile).href + '?t=' + Date.now());
const helperSources = { ...helperModule.helperSources };

if (!helperSources.normalizeSettings.includes('cleanupScheduleTime')) {
  const anchor = "        cleanupSchedule: source.cleanupSchedule === 'daily' || source.cleanupSchedule === 'weekly' ? source.cleanupSchedule : 'off',";
  if (!helperSources.normalizeSettings.includes(anchor)) throw new Error('cleanupSchedule anchor missing');
  helperSources.normalizeSettings = helperSources.normalizeSettings.replace(
    anchor,
    anchor + "\n        cleanupScheduleTime: typeof source.cleanupScheduleTime === 'string' && /^([01]\\d|2[0-3]):[0-5]\\d$/.test(source.cleanupScheduleTime) ? source.cleanupScheduleTime : '03:00',",
  );
}

let panel = helperSources.WorkbenchPanel;
if (!panel.includes('onScheduleTime:')) {
  const anchor = "onWebhookTemplate: (value) => saveSettings((current) => ({ ...current, budgetWebhookTemplate: value })) }";
  if (!panel.includes(anchor)) throw new Error('webhook props anchor missing');
  panel = panel.split(anchor).join(
    "onWebhookTemplate: (value) => saveSettings((current) => ({ ...current, budgetWebhookTemplate: value })), scheduleTime: typeof settings.cleanupScheduleTime === 'string' ? settings.cleanupScheduleTime : '03:00', onScheduleTime: (value) => saveSettings((current) => ({ ...current, cleanupScheduleTime: value })) }",
  );
}
if (panel.includes('onOpenSession:') && !panel.includes('onScheduleTime:') === false) {
  // optimizer props are handled above; schedule page branch needs the time props too
  const scheduleAnchor = "onSchedule: (value) => saveSettings((current) => ({ ...current, cleanupSchedule: value })) })";
  if (panel.includes(scheduleAnchor)) {
    panel = panel.split(scheduleAnchor).join(
      "onSchedule: (value) => saveSettings((current) => ({ ...current, cleanupSchedule: value })), scheduleTime: settings.cleanupScheduleTime || '03:00', onScheduleTime: (value) => saveSettings((current) => ({ ...current, cleanupScheduleTime: value })) })",
    );
  }
}
helperSources.WorkbenchPanel = panel;
fs.writeFileSync(helpersFile, 'export const helperSources = ' + JSON.stringify(helperSources) + ';\n', 'utf8');
console.log('cron wired=' + panel.includes('onScheduleTime:'));
