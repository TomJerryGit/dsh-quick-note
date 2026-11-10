/**
 * v1.25.0 slice: expose workspace/session opening to the optimizer and add a
 * per-session "open conversation" action inside the panel.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const helpersFile = path.join(root, 'src', 'helpers.mjs');
const helperModule = await import(pathToFileURL(helpersFile).href + '?t=' + Date.now());
const helperSources = { ...helperModule.helperSources };

let panel = helperSources.WorkbenchPanel;
if (!panel.includes('onOpenSession:')) {
  const anchor = "h(OptimizerContent, { t, budget: typeof settings.tokenBudget === 'number' ? settings.tokenBudget : 0, onBudget: (value) => saveSettings((current) => ({ ...current, tokenBudget: value })) })";
  if (!panel.includes(anchor)) throw new Error('OptimizerContent anchor missing');
  panel = panel.split(anchor).join(
    "h(OptimizerContent, { t, budget: typeof settings.tokenBudget === 'number' ? settings.tokenBudget : 0, onBudget: (value) => saveSettings((current) => ({ ...current, tokenBudget: value })), onOpenSession: typeof props.openSession === 'function' ? props.openSession : null })",
  );
}
helperSources.WorkbenchPanel = panel;
fs.writeFileSync(helpersFile, 'export const helperSources = ' + JSON.stringify(helperSources) + ';\n', 'utf8');

const entryFile = path.join(root, 'src', 'entry.mjs');
const entryText = fs.readFileSync(entryFile, 'utf8');
const match = entryText.match(/^export const EntryBodySource = ([\s\S]*);\n$/);
if (match === null) throw new Error('unexpected entry.mjs shape');
let entry = JSON.parse(match[1]);
if (!entry.includes('uiWorkspace')) {
  const anchor = '            selectPanel: (panelId) => {\n              ctx.layout.selectPanel(panelId);\n            },';
  if (!entry.includes(anchor)) throw new Error('main inject anchor missing');
  const openSession =
    '            openSession: (sessionId) => {\n' +
    "              try {\n" +
    "                const uiWorkspace = typeof ctx.get === 'function' ? ctx.get('uiWorkspace') : undefined;\n" +
    "                if (uiWorkspace && typeof uiWorkspace.openSession === 'function') uiWorkspace.openSession(sessionId);\n" +
    "              } catch (error) {\n" +
    '                // navigation is best-effort\n' +
    '              }\n' +
    '            },';
  entry = entry.replace(anchor, anchor + '\n' + openSession);
}
fs.writeFileSync(entryFile, 'export const EntryBodySource = ' + JSON.stringify(entry) + ';\n', 'utf8');
console.log('session jump wired=' + entry.includes('uiWorkspace'));
