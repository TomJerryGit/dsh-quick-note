/** v1.27.0 slice: budget webhook settings + report date range props. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const helpersFile = path.join(root, 'src', 'helpers.mjs');
const helperModule = await import(pathToFileURL(helpersFile).href + '?t=' + Date.now());
const helperSources = { ...helperModule.helperSources };

if (!helperSources.normalizeSettings.includes('budgetWebhookUrl')) {
  const anchor = "        cleanupSchedule: source.cleanupSchedule === 'daily' || source.cleanupSchedule === 'weekly' ? source.cleanupSchedule : 'off',";
  if (!helperSources.normalizeSettings.includes(anchor)) throw new Error('cleanupSchedule anchor missing');
  helperSources.normalizeSettings = helperSources.normalizeSettings.replace(
    anchor,
    anchor +
      "\n        budgetWebhookUrl:\n          typeof source.budgetWebhookUrl === 'string' && /^https?:\\/\\//.test(source.budgetWebhookUrl.trim())\n            ? source.budgetWebhookUrl.trim().slice(0, 500)\n            : '',",
  );
}

let panel = helperSources.WorkbenchPanel;
if (!panel.includes('onWebhook:')) {
  const anchor = "onSchedule: (value) => saveSettings((current) => ({ ...current, cleanupSchedule: value })) }";
  if (!panel.includes(anchor)) throw new Error('schedule props anchor missing');
  panel = panel.split(anchor).join(
    "onSchedule: (value) => saveSettings((current) => ({ ...current, cleanupSchedule: value })), webhook: typeof settings.budgetWebhookUrl === 'string' ? settings.budgetWebhookUrl : '', onWebhook: (value) => saveSettings((current) => ({ ...current, budgetWebhookUrl: value })) }",
  );
}
helperSources.WorkbenchPanel = panel;
fs.writeFileSync(helpersFile, 'export const helperSources = ' + JSON.stringify(helperSources) + ';\n', 'utf8');
console.log('webhook wired=' + panel.includes('onWebhook:'));
