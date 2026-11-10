/**
 * R1 build: assemble the single-file runtime client.js from the template shell
 * and the src/ modules. `composeClient()` is pure (returns the built text) so the
 * build-consistency check can reuse the exact same composition.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { zh, en } from '../src/locale.mjs';
import { ICON_PATHS, STYLES, STYLE_UPGRADES } from '../src/ui-assets.mjs';
import { SectionHeadSource, SettingsSectionSource, DueReminderSource } from '../src/components.mjs';
import { helperSources } from '../src/helpers.mjs';
import { EntryBodySource } from '../src/entry.mjs';
import { OptimizerPanelSource } from '../src/optimizer.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENTRY_MARKER = '    /*__QUICK_NOTE_ENTRY__*/';
const LOCALE_MARKER = '    /*__QUICK_NOTE_LOCALE__*/';
const ICONS_MARKER = '    /*__QUICK_NOTE_ICONS__*/';
const STYLES_MARKER = '    /*__QUICK_NOTE_STYLES__*/';
const STYLE_UPGRADES_MARKER = '    /*__QUICK_NOTE_STYLE_UPGRADES__*/';
const SECTION_HEAD_MARKER = '    /*__QUICK_NOTE_SECTION_HEAD__*/';
const SETTINGS_SECTION_MARKER = '    /*__QUICK_NOTE_SETTINGS_SECTION__*/';
const DUE_REMINDER_MARKER = '    /*__QUICK_NOTE_DUE_REMINDER__*/';
const OPTIMIZER_MARKER = '    /*__QUICK_NOTE_OPTIMIZER__*/';

/** Render one dictionary with the indentation the file has always used. */
function formatDictionary(name, dictionary) {
  const lines = Object.entries(dictionary).map(([key, value]) => '      ' + key + ': ' + JSON.stringify(value) + ',');
  return '    const ' + name + ' = {\n' + lines.join('\n') + '\n    };';
}

/** Render one plain JS value (object/array) as an indented declaration. */
function formatValue(name, value, joinLines) {
  const json = JSON.stringify(value, null, 2)
    .split('\n')
    .map((line, index) => (index === 0 ? line : '    ' + line))
    .join('\n');
  return '    const ' + name + ' = ' + json + (joinLines === true ? ".join('\\n')" : '') + ';';
}

/** Compose the complete client.js text without writing it. */
export function composeClient() {
  const template = fs.readFileSync(path.join(root, 'src', 'client.template.js'), 'utf8');
  if (template.split(ENTRY_MARKER).length !== 2) throw new Error('expected one entry marker');

  let body = EntryBodySource;
  const localeParts = body.split(LOCALE_MARKER);
  if (localeParts.length !== 3) throw new Error('expected two locale markers, found ' + (localeParts.length - 1));
  body = localeParts[0] + formatDictionary('zh', zh) + '\n' + localeParts[1] + formatDictionary('en', en) + '\n' + localeParts[2];

  for (const [marker, name, value, joinLines] of [
    [ICONS_MARKER, 'ICON_PATHS', ICON_PATHS, false],
    [STYLES_MARKER, 'STYLES', STYLES, true],
    [STYLE_UPGRADES_MARKER, 'STYLE_UPGRADES', STYLE_UPGRADES, true],
  ]) {
    if (body.split(marker).length !== 2) throw new Error('expected one marker for ' + name);
    body = body.split(marker).join(formatValue(name, value, joinLines));
  }

  for (const [marker, sourceText] of [
    [SECTION_HEAD_MARKER, SectionHeadSource],
    [SETTINGS_SECTION_MARKER, SettingsSectionSource],
    [DUE_REMINDER_MARKER, DueReminderSource],
  ]) {
    if (body.split(marker).length !== 2) throw new Error('expected one component marker for ' + marker);
    body = body.split(marker).join(sourceText);
  }

  for (const [name, sourceText] of Object.entries(helperSources)) {
    const marker = '    /*__QUICK_NOTE_HELPER__' + name + '__*/';
    if (body.split(marker).length !== 2) throw new Error('expected one helper marker for ' + name);
    body = body.split(marker).join(sourceText);
  }

  if (body.split(OPTIMIZER_MARKER).length !== 2) throw new Error('expected one optimizer marker');
  body = body.split(OPTIMIZER_MARKER).join(OptimizerPanelSource);

  if (body.includes('/*__QUICK_NOTE_')) throw new Error('unresolved build marker in client body');
  return template.split(ENTRY_MARKER).join(body);
}

const isMain = process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const built = composeClient();
  fs.writeFileSync(path.join(root, 'client.js'), built, 'utf8');
  console.log('built client.js bytes=' + Buffer.byteLength(built));
}
