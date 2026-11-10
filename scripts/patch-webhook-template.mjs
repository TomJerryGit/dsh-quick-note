/** v1.28.0 slice: webhook template setting + schedule page props. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const helpersFile = path.join(root, 'src', 'helpers.mjs');
const helperModule = await import(pathToFileURL(helpersFile).href + '?t=' + Date.now());
const helperSources = { ...helperModule.helperSources };

if (!helperSources.normalizeSettings.includes('budgetWebhookTemplate')) {
  const anchor = "        budgetWebhookUrl:\n          typeof source.budgetWebhookUrl === 'string' && /^https?:\\/\\//.test(source.budgetWebhookUrl.trim())\n            ? source.budgetWebhookUrl.trim().slice(0, 500)\n            : '',";
  if (!helperSources.normalizeSettings.includes(anchor)) throw new Error('webhook url anchor missing');
  helperSources.normalizeSettings = helperSources.normalizeSettings.replace(
    anchor,
    anchor + "\n        budgetWebhookTemplate: source.budgetWebhookTemplate === 'slack' || source.budgetWebhookTemplate === 'feishu' ? source.budgetWebhookTemplate : 'generic',",
  );
}

let panel = helperSources.WorkbenchPanel;
if (!panel.includes('onWebhookTemplate:')) {
  const anchor = "webhook: typeof settings.budgetWebhookUrl === 'string' ? settings.budgetWebhookUrl : '', onWebhook: (value) => saveSettings((current) => ({ ...current, budgetWebhookUrl: value })) }";
  if (!panel.includes(anchor)) throw new Error('webhook props anchor missing');
  panel = panel.split(anchor).join(
    "webhook: typeof settings.budgetWebhookUrl === 'string' ? settings.budgetWebhookUrl : '', onWebhook: (value) => saveSettings((current) => ({ ...current, budgetWebhookUrl: value })), webhookTemplate: typeof settings.budgetWebhookTemplate === 'string' ? settings.budgetWebhookTemplate : 'generic', onWebhookTemplate: (value) => saveSettings((current) => ({ ...current, budgetWebhookTemplate: value })) }",
  );
}
helperSources.WorkbenchPanel = panel;
fs.writeFileSync(helpersFile, 'export const helperSources = ' + JSON.stringify(helperSources) + ';\n', 'utf8');
console.log('webhook template wired=' + panel.includes('onWebhookTemplate:'));
