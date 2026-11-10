/**
 * v1.24.0 slice: persist the daily token budget in document settings so Host
 * reminders can see it, and notify from ReminderBridge when over budget.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const helpersFile = path.join(root, 'src', 'helpers.mjs');
const helperModule = await import(pathToFileURL(helpersFile).href + '?t=' + Date.now());
const helperSources = { ...helperModule.helperSources };

if (typeof helperSources.normalizeSettings !== 'string') throw new Error('missing normalizeSettings helper');
if (!helperSources.normalizeSettings.includes('tokenBudget')) {
  const anchor = 'harnessAutoCheck: source.harnessAutoCheck === true,';
  if (!helperSources.normalizeSettings.includes(anchor)) throw new Error('normalizeSettings anchor missing');
  helperSources.normalizeSettings = helperSources.normalizeSettings.replace(
    anchor,
    anchor +
      "\n        tokenBudget:\n          typeof source.tokenBudget === 'number' && Number.isFinite(source.tokenBudget)\n            ? Math.max(0, Math.min(1000000, Math.round(source.tokenBudget * 100) / 100))\n            : 0,",
  );
}

let panel = helperSources.WorkbenchPanel;
const budgetAnchor = 'budget: typeof prefs.tokenBudget === \'number\' ? prefs.tokenBudget : 0, onBudget: (value) => props.prefs.set({ ...prefs, tokenBudget: value })';
if (!panel.includes('saveSettings((current) => ({ ...current, tokenBudget: value }))')) {
  if (!panel.includes(budgetAnchor)) throw new Error('WorkbenchPanel budget anchor missing');
  panel = panel.split(budgetAnchor).join(
    "budget: typeof settings.tokenBudget === 'number' ? settings.tokenBudget : 0, onBudget: (value) => saveSettings((current) => ({ ...current, tokenBudget: value }))",
  );
}
helperSources.WorkbenchPanel = panel;

// ReminderBridge lives in the helper sources; add the budget notification there.
let bridge = helperSources.ReminderBridge;
if (typeof bridge !== 'string') throw new Error('missing ReminderBridge helper');
if (!bridge.includes("|budget|")) {
  const notifyAnchor = '              if (changed) writeNotifiedKeys(known);';
  if (!bridge.includes(notifyAnchor)) throw new Error('ReminderBridge notify anchor missing');
  const insertion =
    "              if (payload.budget && payload.budget.over === true) {\n" +
    "                const budgetKey = dayKey + '|budget|' + payload.budget.limit;\n" +
    "                if (!known.includes(budgetKey)) {\n" +
    "                  known.push(budgetKey);\n" +
    "                  changed = true;\n" +
    "                  try {\n" +
    "                    new window.Notification(t('notifyTitle'), {\n" +
    "                      body: fillTemplate(t('reminderBudget'), { used: Number(payload.budget.todayCost).toFixed(2), limit: Number(payload.budget.limit).toFixed(2) }),\n" +
    "                      tag: budgetKey,\n" +
    "                    });\n" +
    "                  } catch (error) {\n" +
    "                    // notifications are best-effort\n" +
    "                  }\n" +
    "                }\n" +
    "              }\n";
  bridge = bridge.replace(notifyAnchor, insertion + notifyAnchor);
}
helperSources.ReminderBridge = bridge;
fs.writeFileSync(helpersFile, 'export const helperSources = ' + JSON.stringify(helperSources) + ';\n', 'utf8');
console.log('budget settings wired; reminder=' + (bridge.includes('|budget|') ? 'yes' : 'no'));
