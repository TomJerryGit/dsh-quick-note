/** v1.39.0: pass the plugin-panel navigation callback into the optimizer panel. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const helpersFile = path.join(root, 'src', 'helpers.mjs');
const module = await import(pathToFileURL(helpersFile).href + '?t=' + Date.now());
const sources = { ...module.helperSources };
const anchor = '? h(OptimizerContent, { t, budget:';
if (!sources.WorkbenchPanel.includes(anchor)) throw new Error('OptimizerContent anchor missing');
sources.WorkbenchPanel = sources.WorkbenchPanel.replace(
  anchor,
  "? h(OptimizerContent, { t, onOpenPlugins: typeof props.selectPanel === 'function' ? () => props.selectPanel('plugins') : null, budget:",
);
fs.writeFileSync(helpersFile, 'export const helperSources = ' + JSON.stringify(sources) + ';\n', 'utf8');
console.log('optimizer onOpenPlugins wired');
