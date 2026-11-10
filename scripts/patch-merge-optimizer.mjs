/**
 * Merge the optimizer content into the WorkbenchPanel Insights tab.
 * - adds the optimizer sub-tab + render branch
 * - adds the daily token budget preference
 * - removes the standalone optimizer panel registration
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Parse `export const NAME = <json>;` from one module and return the value. */
function parseExport(file, name) {
  const text = fs.readFileSync(file, 'utf8');
  const marker = 'export const ' + name + ' = ';
  const start = text.indexOf(marker);
  if (start < 0) throw new Error('missing ' + name + ' in ' + file);
  const end = text.lastIndexOf(';');
  return JSON.parse(text.slice(start + marker.length, end));
}

function writeExport(file, name, value) {
  fs.writeFileSync(file, 'export const ' + name + ' = ' + JSON.stringify(value) + ';\n', 'utf8');
}

const helpersFile = path.join(root, 'src', 'helpers.mjs');
const helperModule = await import(pathToFileURL(helpersFile).href + '?t=' + Date.now());
const helperSources = { ...helperModule.helperSources };
let panel = helperSources.WorkbenchPanel;

const prefReplacements = [
  {
    from: "insightTab: raw && (raw.insightTab === 'usage' || raw.insightTab === 'system') ? raw.insightTab : 'value',",
    to: "insightTab: raw && (raw.insightTab === 'usage' || raw.insightTab === 'system' || raw.insightTab === 'optimizer') ? raw.insightTab : 'value',",
  },
  {
    from: "        writeMode: raw && raw.writeMode === 'full' ? 'full' : 'patch',",
    to: "        writeMode: raw && raw.writeMode === 'full' ? 'full' : 'patch',\n        tokenBudget: raw && typeof raw.tokenBudget === 'number' && Number.isFinite(raw.tokenBudget) ? Math.max(0, Math.min(1000000, raw.tokenBudget)) : 0,",
  },
];
for (const replacement of prefReplacements) {
  if (typeof helperSources.normalizePrefs !== 'string') throw new Error('missing normalizePrefs helper');
  if (!helperSources.normalizePrefs.includes(replacement.from)) {
    if (helperSources.normalizePrefs.includes(replacement.to)) continue;
    throw new Error('normalizePrefs anchor not found: ' + replacement.from.slice(0, 60));
  }
  helperSources.normalizePrefs = helperSources.normalizePrefs.split(replacement.from).join(replacement.to);
}

const replacements = [
  {
    from: "const insightTab = prefs.insightTab === 'usage' || prefs.insightTab === 'system' ? prefs.insightTab : 'value';",
    to: "const insightTab = prefs.insightTab === 'usage' || prefs.insightTab === 'system' || prefs.insightTab === 'optimizer' ? prefs.insightTab : 'value';",
  },
  {
    from: "                    { id: 'usage', label: t('viewUsage') },\n                    { id: 'system', label: t('viewSystem') },",
    to: "                    { id: 'usage', label: t('viewUsage') },\n                    { id: 'optimizer', label: t('optimizerTitle') },\n                    { id: 'system', label: t('viewSystem') },",
  },
  {
    from: "              insightTab === 'usage' ? usagePane : insightTab === 'system' ? systemPane : valuePane,",
    to:
      "              insightTab === 'usage'\n                ? usagePane\n                : insightTab === 'system'\n                  ? systemPane\n                  : insightTab === 'optimizer'\n                    ? h(OptimizerContent, { t, budget: typeof prefs.tokenBudget === 'number' ? prefs.tokenBudget : 0, onBudget: (value) => props.prefs.set({ ...prefs, tokenBudget: value }) })\n                    : valuePane,",
  },
];
for (const replacement of replacements) {
  if (!panel.includes(replacement.from)) {
    if (panel.includes(replacement.to)) continue;
    throw new Error('WorkbenchPanel anchor not found: ' + replacement.from.slice(0, 60));
  }
  panel = panel.split(replacement.from).join(replacement.to);
}
helperSources.WorkbenchPanel = panel;
fs.writeFileSync(helpersFile, 'export const helperSources = ' + JSON.stringify(helperSources) + ';\n', 'utf8');

const entryFile = path.join(root, 'src', 'entry.mjs');
let entry = parseExport(entryFile, 'EntryBodySource');
entry = entry.replace('\n      registerOptimizer(ctx);', '');
writeExport(entryFile, 'EntryBodySource', entry);

console.log('merged optimizer into WorkbenchPanel; entry bytes=' + entry.length + ' panel bytes=' + panel.length);
