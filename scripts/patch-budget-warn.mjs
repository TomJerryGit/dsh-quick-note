/** v1.25.0 slice: add the 80% budget warning notification to ReminderBridge. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const helpersFile = path.join(root, 'src', 'helpers.mjs');
const helperModule = await import(pathToFileURL(helpersFile).href + '?t=' + Date.now());
const helperSources = { ...helperModule.helperSources };
let bridge = helperSources.ReminderBridge;
if (typeof bridge !== 'string') throw new Error('missing ReminderBridge');
if (!bridge.includes('|budget-warn|')) {
  const anchor = '              if (changed) writeNotifiedKeys(known);';
  if (!bridge.includes(anchor)) throw new Error('bridge anchor missing');
  const block =
    "              if (payload.budget && payload.budget.warn === true) {\n" +
    "                const warnKey = dayKey + '|budget-warn|' + payload.budget.limit;\n" +
    "                if (!known.includes(warnKey)) {\n" +
    "                  known.push(warnKey);\n" +
    "                  changed = true;\n" +
    "                  try {\n" +
    "                    new window.Notification(t('notifyTitle'), {\n" +
    "                      body: fillTemplate(t('reminderBudgetWarn'), { used: Number(payload.budget.todayCost).toFixed(2), percent: payload.budget.percent, limit: Number(payload.budget.limit).toFixed(2) }),\n" +
    "                      tag: warnKey,\n" +
    "                    });\n" +
    "                  } catch (error) {\n" +
    "                    // notifications are best-effort\n" +
    "                  }\n" +
    "                }\n" +
    "              }\n";
  bridge = bridge.replace(anchor, block + anchor);
}
helperSources.ReminderBridge = bridge;
fs.writeFileSync(helpersFile, 'export const helperSources = ' + JSON.stringify(helperSources) + ';\n', 'utf8');
const verify = fs.readFileSync(helpersFile, 'utf8');
console.log('budget warn wired=' + bridge.includes('|budget-warn|') + ' fileContains=' + verify.includes('|budget-warn|') + ' fileBytes=' + verify.length);
