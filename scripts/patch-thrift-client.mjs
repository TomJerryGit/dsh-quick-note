/** v1.41.0: preserve configurable thrift workspaces in client settings. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const helpersFile = path.join(root, 'src', 'helpers.mjs');
const module = await import(pathToFileURL(helpersFile).href + '?t=' + Date.now());
const sources = { ...module.helperSources };
const anchor = `        savingsActivationReason: typeof source.savingsActivationReason === 'string' ? source.savingsActivationReason.slice(0, 200) : '',`;
if (!sources.normalizeSettings.includes(anchor)) throw new Error('normalizeSettings savings anchor missing');
sources.normalizeSettings = sources.normalizeSettings.replace(
  anchor,
  anchor +
    `
        thriftWorkspaces: Array.isArray(source.thriftWorkspaces)
          ? source.thriftWorkspaces.filter((entry) => typeof entry === 'string' && entry.trim().length > 0).map((entry) => entry.trim().slice(0, 500)).slice(0, 30)
          : [],`,
);
fs.writeFileSync(helpersFile, 'export const helperSources = ' + JSON.stringify(sources) + ';\n', 'utf8');
console.log('client thrift settings wired');
