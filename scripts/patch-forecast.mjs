/** v1.43.0: month-aware cost forecast. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const helpersFile = path.join(root, 'src', 'helpers.mjs');
const module = await import(pathToFileURL(helpersFile).href + '?t=' + Date.now());
const sources = { ...module.helperSources };
const anchor = '      const usageForecastMonthly = usageForecastDaily * 30;';
if (!sources.WorkbenchPanel.includes(anchor)) throw new Error('usageForecastMonthly anchor missing');
sources.WorkbenchPanel = sources.WorkbenchPanel.replace(
  anchor,
  `      const usageNow = new Date(usage !== null && typeof usage.generatedAt === 'number' ? usage.generatedAt : Date.now());
      const usageDaysInMonth = new Date(usageNow.getFullYear(), usageNow.getMonth() + 1, 0).getDate();
      const usageMonthToDate = usage !== null && usage.efficiency && typeof usage.efficiency.monthToDateCost === 'number' ? usage.efficiency.monthToDateCost : 0;
      const usageForecastMonthly = usageMonthToDate > 0 ? (usageMonthToDate / Math.max(1, usageNow.getDate())) * usageDaysInMonth : usageForecastDaily * 30;`,
);
fs.writeFileSync(helpersFile, 'export const helperSources = ' + JSON.stringify(sources) + ';\n', 'utf8');
console.log('month-aware forecast patched');
