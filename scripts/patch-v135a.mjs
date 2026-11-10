/** v1.35.0 slice: exponential retention, med reminders/weekly cells, custom shortcuts, backup progress. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const helpersFile = path.join(root, 'src', 'helpers.mjs');
const helperModule = await import(pathToFileURL(helpersFile).href + '?t=' + Date.now());
const helperSources = { ...helperModule.helperSources };

// settings: med reminders + custom shortcuts
if (!helperSources.normalizeSettings.includes('medReminderEnabled')) {
  const anchor = "        backupIntervalMinutes:"; // insert before backup setting
  if (!helperSources.normalizeSettings.includes(anchor)) throw new Error('settings backup anchor missing');
  helperSources.normalizeSettings = helperSources.normalizeSettings.replace(
    anchor,
    `        medReminderEnabled: source.medReminderEnabled === false ? false : true,
        shortcuts: {
          palette: typeof (source.shortcuts && source.shortcuts.palette) === 'string' && source.shortcuts.palette.trim().length > 0 ? source.shortcuts.palette.trim().slice(0, 40) : 'ctrl+k',
          help: typeof (source.shortcuts && source.shortcuts.help) === 'string' && source.shortcuts.help.trim().length > 0 ? source.shortcuts.help.trim().slice(0, 40) : '?',
        },
` + anchor,
  );
}

let panel = helperSources.WorkbenchPanel;

// matchShortcut + custom shortcut handling
if (!panel.includes('matchShortcut')) {
  const anchor = `      React.useEffect(() => {
        if (typeof window.addEventListener !== 'function') return undefined;
        const onKeyDown = (event) => {`;
  if (!panel.includes(anchor)) throw new Error('keydown anchor missing');
  panel = panel.replace(
    anchor,
    `      const matchShortcut = (event, combo) => {
        if (typeof combo !== 'string' || combo.trim().length === 0) return false;
        const parts = combo.toLowerCase().split('+').map((part) => part.trim()).filter((part) => part.length > 0);
        if (parts.length === 0) return false;
        const keyPart = parts[parts.length - 1];
        const needsCtrl = parts.includes('ctrl');
        const needsMeta = parts.includes('meta');
        const needsShift = parts.includes('shift');
        const needsAlt = parts.includes('alt');
        if (needsCtrl !== Boolean(event.ctrlKey)) return false;
        if (needsMeta !== Boolean(event.metaKey)) return false;
        if (needsShift !== Boolean(event.shiftKey)) return false;
        if (needsAlt !== Boolean(event.altKey)) return false;
        const key = typeof event.key === 'string' ? event.key.toLowerCase() : '';
        return key === keyPart;
      };

` + anchor,
  );
  panel = panel.replace(
    `          if ((event.ctrlKey || event.metaKey) && key === 'k') {
            event.preventDefault();
            setPaletteQuery('');
            setPaletteIndex(0);
            setPaletteOpen(true);
            return;
          }`,
    `          if (matchShortcut(event, settingsRef.current.shortcuts.palette)) {
            event.preventDefault();
            setPaletteQuery('');
            setPaletteIndex(0);
            setPaletteOpen(true);
            return;
          }`,
  );
  panel = panel.replace(
    `          if (key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey) {`,
    `          if (matchShortcut(event, settingsRef.current.shortcuts.help)) {`,
  );
}

// exponential retention forecast
if (!panel.includes('retentionHalfLife')) {
  const anchor = `      const retentionForecast =
        retention === undefined || !retention.some((bucket) => bucket.count > 0)
          ? undefined
          : [1, 7, 30].map((days) => {
              const index = days <= 1 ? 0 : days <= 6 ? 1 : days <= 29 ? 2 : 3;
              return { days, rate: retention[index].rate === null ? 0 : retention[index].rate };
            });`;
  if (!panel.includes(anchor)) throw new Error('retention forecast anchor missing');
  panel = panel.replace(
    anchor,
    `      const retentionForecast = (() => {
        if (retention === undefined) return undefined;
        const days = [1, 6, 29, 30];
        const points = retention
          .map((bucket, index) => ({ days: days[index], rate: bucket.rate }))
          .filter((point) => point.rate !== null && point.rate > 0);
        if (points.length === 0) return undefined;
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumXX = 0;
        for (const point of points) {
          const x = point.days;
          const y = Math.log(point.rate);
          sumX += x;
          sumY += y;
          sumXY += x * y;
          sumXX += x * x;
        }
        const count = points.length;
        const denominator = count * sumXX - sumX * sumX;
        const slope = denominator === 0 ? 0 : (count * sumXY - sumX * sumY) / denominator;
        const intercept = (sumY - slope * sumX) / count;
        const predict = (target) => Math.max(0, Math.min(1, Math.exp(intercept + slope * target)));
        return {
          points: [1, 7, 30].map((target) => ({ days: target, rate: predict(target) })),
          halfLife: slope < 0 ? Math.round((Math.log(2) / -slope) * 10) / 10 : null,
        };
      })();`,
  );
  panel = panel.replace(
    "retentionForecast.map((point) => point.days + t('reviewDaysShort') + ' ' + Math.round(point.rate * 100) + '%').join(' · '),",
    "retentionForecast.points.map((point) => point.days + t('reviewDaysShort') + ' ' + Math.round(point.rate * 100) + '%').join(' · ') + (retentionForecast.halfLife !== null ? ' · ' + t('reviewHalfLife') + ' ' + retentionForecast.halfLife + t('reviewDaysShort') : ''),",
  );
}

// custom shortcut rows in help overlay
if (!panel.includes("settings.shortcuts.palette")) {
  panel = panel.replace("['Ctrl/⌘ K', t('shortcutPalette')]", "[settings.shortcuts.palette, t('shortcutPalette')]");
  panel = panel.replace("['?', t('shortcutHelp')]", "[settings.shortcuts.help, t('shortcutHelp')]");
}

// med reminders toggle + 7-day report cells
if (!panel.includes("t('medRemindersOn')")) {
  panel = panel.replace(
    "h('span', { className: 'dshqn-stat' }, t('healthTodayMeds')),",
    `h('span', { className: 'dshqn-stat' }, t('healthTodayMeds')),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dshqn-button',
                      onClick: () => saveSettings((current) => ({ ...current, medReminderEnabled: current.medReminderEnabled === false })),
                    },
                    settings.medReminderEnabled === false ? t('medRemindersOff') : t('medRemindersOn'),
                  ),`,
  );
  panel = panel.replace(
    "h('span', null, t('medAdherenceWeek') + ' ' + rate + '% (' + intakes.length + '/' + expected + ')'),",
    `h('span', null, t('medAdherenceWeek') + ' ' + rate + '% (' + intakes.length + '/' + expected + ')'),
                            h(
                              'span',
                              { style: { display: 'inline-flex', gap: '2px' } },
                              Array.from({ length: 7 }, (_, offset) => {
                                const day = new Date(nowMs - (6 - offset) * 86400000);
                                const key = localDayKey(day.getTime());
                                const taken = (item.health.intakes || []).filter((entry) => entry.date === key).length;
                                return h(
                                  'span',
                                  { key, title: key + ' ' + taken + '/' + item.health.times.length, style: { fontSize: '10px', padding: '0 2px', borderRadius: '3px', background: taken >= item.health.times.length ? 'var(--dshqn-accent)' : 'var(--dsw-alias-bg-layer-2)' } },
                                  taken >= item.health.times.length ? '✓' : taken + '/' + item.health.times.length,
                                );
                              }),
                            ),`,
  );
}

helperSources.WorkbenchPanel = panel;
fs.writeFileSync(helpersFile, 'export const helperSources = ' + JSON.stringify(helperSources) + ';\n', 'utf8');

// SettingsSection: shortcut inputs + backup progress visualization
const componentsFile = path.join(root, 'src', 'components.mjs');
const components = await import(pathToFileURL(componentsFile).href + '?t=' + Date.now());
let settingsSource = components.SettingsSectionSource;
if (!settingsSource.includes('shortcutPaletteDraft')) {
  settingsSource = settingsSource.replace(
    "const [backupInterval, setBackupInterval] = React.useState('5');",
    "const [backupInterval, setBackupInterval] = React.useState('5');\n      const [shortcutPaletteDraft, setShortcutPaletteDraft] = React.useState('ctrl+k');\n      const [shortcutHelpDraft, setShortcutHelpDraft] = React.useState('?');",
  );
  settingsSource = settingsSource.replace(
    'setBackupInterval(String(document.settings.backupIntervalMinutes || 5));',
    "setBackupInterval(String(document.settings.backupIntervalMinutes || 5));\n            setShortcutPaletteDraft(document.settings.shortcuts && document.settings.shortcuts.palette ? document.settings.shortcuts.palette : 'ctrl+k');\n            setShortcutHelpDraft(document.settings.shortcuts && document.settings.shortcuts.help ? document.settings.shortcuts.help : '?');",
  );
  settingsSource = settingsSource.replace(
    "      /** Preview differences between the current document and one rolling backup. */",
    `      /** Save custom top-level shortcuts. */
      const saveShortcuts = () => {
        writeSettings((settings) => ({
          ...settings,
          shortcuts: {
            palette: shortcutPaletteDraft.trim() || 'ctrl+k',
            help: shortcutHelpDraft.trim() || '?',
          },
        }))
          .then(() => setPricingNotice(t('saved')))
          .catch(() => setPricingNotice(t('backupFailed')));
      };

      /** Preview differences between the current document and one rolling backup. */`,
  );
  settingsSource = settingsSource.replace(
    `          h(
            'label',
            { className: 'dshqn-settings-row' },
            h('span', null, t('backupInterval')),`,
    `          h(
            'div',
            { className: 'dshqn-settings-group' },
            h('p', { className: 'dshqn-settings-label' }, t('shortcutCustomTitle')),
            h(
              'label',
              { className: 'dshqn-settings-row' },
              h('span', null, t('shortcutPalette')),
              h('input', { className: 'dshqn-field', type: 'text', value: shortcutPaletteDraft, onChange: (event) => setShortcutPaletteDraft(event.target.value) }),
            ),
            h(
              'label',
              { className: 'dshqn-settings-row' },
              h('span', null, t('shortcutHelp')),
              h('input', { className: 'dshqn-field', type: 'text', value: shortcutHelpDraft, onChange: (event) => setShortcutHelpDraft(event.target.value) }),
            ),
            h('button', { type: 'button', className: 'dshqn-button', onClick: saveShortcuts }, t('saved')),
          ),
          h(
            'label',
            { className: 'dshqn-settings-row' },
            h('span', null, t('backupInterval')),`,
  );
  settingsSource = settingsSource.replace(
    "h('button', { type: 'button', className: 'dshqn-button', onClick: saveBackupInterval }, t('saved')),",
    `h('button', { type: 'button', className: 'dshqn-button', onClick: saveBackupInterval }, t('saved')),
            h(
              'span',
              { className: 'dshqn-settings-hint', style: { display: 'inline-flex', alignItems: 'center', gap: '6px' } },
              t('backupProgress') + ' ' + (backups.length === 0 ? 0 : Math.min(100, Math.round(((Date.now() - backups[0].at) / (Number(backupInterval) * 60000)) * 100))) + '%',
              h('span', { style: { display: 'inline-block', width: '80px', height: '6px', borderRadius: '999px', background: 'var(--dsw-alias-bg-layer-2)', overflow: 'hidden' } }, h('span', { style: { display: 'block', width: (backups.length === 0 ? 0 : Math.min(100, Math.round(((Date.now() - backups[0].at) / (Number(backupInterval) * 60000)) * 100))) + '%', height: '100%', background: 'var(--dshqn-accent)' } })),
            ),`,
  );
  const allComponents = { ...components, SettingsSectionSource: settingsSource };
  const serialized = Object.entries(allComponents).map(([key, value]) => 'export const ' + key + ' = ' + JSON.stringify(value) + ';').join('\n\n');
  fs.writeFileSync(componentsFile, serialized + '\n', 'utf8');
}
console.log('panel=' + [panel.includes('matchShortcut'), panel.includes('retentionHalfLife'), panel.includes('medRemindersOn'), panel.includes('settings.shortcuts.palette')].join(',') + ' settings=' + settingsSource.includes('shortcutPaletteDraft'));
