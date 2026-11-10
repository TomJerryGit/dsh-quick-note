/** v1.40.0: preserve automatic-savings policy fields in client settings. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const helpersFile = path.join(root, 'src', 'helpers.mjs');
const module = await import(pathToFileURL(helpersFile).href + '?t=' + Date.now());
const sources = { ...module.helperSources };
const anchor = `        tokenBudgetMonthly:
          typeof source.tokenBudgetMonthly === 'number' && Number.isFinite(source.tokenBudgetMonthly)
            ? Math.max(0, Math.min(10000000, Math.round(source.tokenBudgetMonthly * 100) / 100))
            : 0,`;
if (!sources.normalizeSettings.includes(anchor)) throw new Error('normalizeSettings anchor missing');
sources.normalizeSettings = sources.normalizeSettings.replace(
  anchor,
  anchor +
    `
        savingsMode: source.savingsMode === true,
        savingsGuard: source.savingsGuard !== false,
        savingsProvider: typeof source.savingsProvider === 'string' ? source.savingsProvider.slice(0, 100) : '',
        savingsModel: typeof source.savingsModel === 'string' ? source.savingsModel.slice(0, 200) : '',
        savingsMaxOutput:
          typeof source.savingsMaxOutput === 'number' && Number.isFinite(source.savingsMaxOutput)
            ? Math.max(0, Math.min(32768, Math.round(source.savingsMaxOutput)))
            : 1200,
        savingsActivatedAt: typeof source.savingsActivatedAt === 'number' ? source.savingsActivatedAt : 0,
        savingsActivationReason: typeof source.savingsActivationReason === 'string' ? source.savingsActivationReason.slice(0, 200) : '',`,
);
fs.writeFileSync(helpersFile, 'export const helperSources = ' + JSON.stringify(sources) + ';\n', 'utf8');
console.log('client savings settings wired');
