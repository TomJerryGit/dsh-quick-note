/** v1.26.0 slice: monthly budget + scheduled cleanup settings and props. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const helpersFile = path.join(root, 'src', 'helpers.mjs');
const helperModule = await import(pathToFileURL(helpersFile).href + '?t=' + Date.now());
const helperSources = { ...helperModule.helperSources };

if (typeof helperSources.normalizeSettings !== 'string') throw new Error('missing normalizeSettings');
if (!helperSources.normalizeSettings.includes('tokenBudgetMonthly')) {
  const anchor = "        tokenBudget:\n          typeof source.tokenBudget === 'number' && Number.isFinite(source.tokenBudget)\n            ? Math.max(0, Math.min(1000000, Math.round(source.tokenBudget * 100) / 100))\n            : 0,";
  if (!helperSources.normalizeSettings.includes(anchor)) throw new Error('tokenBudget anchor missing');
  helperSources.normalizeSettings = helperSources.normalizeSettings.replace(
    anchor,
    anchor +
      "\n        tokenBudgetMonthly:\n          typeof source.tokenBudgetMonthly === 'number' && Number.isFinite(source.tokenBudgetMonthly)\n            ? Math.max(0, Math.min(10000000, Math.round(source.tokenBudgetMonthly * 100) / 100))\n            : 0,\n        cleanupSchedule: source.cleanupSchedule === 'daily' || source.cleanupSchedule === 'weekly' ? source.cleanupSchedule : 'off',",
  );
}

let panel = helperSources.WorkbenchPanel;
if (!panel.includes('onSchedule:')) {
  const anchor = "onOpenSession: typeof props.openSession === 'function' ? props.openSession : null }";
  if (!panel.includes(anchor)) throw new Error('OptimizerContent props anchor missing');
  panel = panel.split(anchor).join(
    "onOpenSession: typeof props.openSession === 'function' ? props.openSession : null, monthlyBudget: typeof settings.tokenBudgetMonthly === 'number' ? settings.tokenBudgetMonthly : 0, schedule: typeof settings.cleanupSchedule === 'string' ? settings.cleanupSchedule : 'off', onMonthlyBudget: (value) => saveSettings((current) => ({ ...current, tokenBudgetMonthly: value })), onSchedule: (value) => saveSettings((current) => ({ ...current, cleanupSchedule: value })) }",
  );
}
helperSources.WorkbenchPanel = panel;
fs.writeFileSync(helpersFile, 'export const helperSources = ' + JSON.stringify(helperSources) + ';\n', 'utf8');
console.log('monthly/schedule wired=' + panel.includes('onSchedule:'));
