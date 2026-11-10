/** Repair: allow 'cron' in the client-side cleanupSchedule normalization. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const helpersFile = path.join(root, 'src', 'helpers.mjs');
const helperModule = await import(pathToFileURL(helpersFile).href + '?t=' + Date.now());
const helperSources = { ...helperModule.helperSources };
const anchor = "source.cleanupSchedule === 'daily' || source.cleanupSchedule === 'weekly' ? source.cleanupSchedule : 'off'";
if (helperSources.normalizeSettings.includes(anchor)) {
  helperSources.normalizeSettings = helperSources.normalizeSettings.replace(
    anchor,
    "source.cleanupSchedule === 'daily' || source.cleanupSchedule === 'weekly' || source.cleanupSchedule === 'cron' ? source.cleanupSchedule : 'off'",
  );
}
fs.writeFileSync(helpersFile, 'export const helperSources = ' + JSON.stringify(helperSources) + ';\n', 'utf8');
console.log('cron schedule allowed=' + helperSources.normalizeSettings.includes("source.cleanupSchedule === 'cron'"));
