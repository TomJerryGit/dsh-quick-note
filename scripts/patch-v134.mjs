/** v1.34.0 slice: review insights, med adherence, shortcut help, backup interval/diff. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const helpersFile = path.join(root, 'src', 'helpers.mjs');
const helperModule = await import(pathToFileURL(helpersFile).href + '?t=' + Date.now());
const helperSources = { ...helperModule.helperSources };

// 1. normalizeHealth intakes
if (!helperSources.normalizeHealth.includes('intakes')) {
  const anchor = `      return {
        value,
        value2,
        unit,
        times: [...new Set(times)].sort(),
        active: source.active !== false,
        at: typeof source.at === 'number' && Number.isFinite(source.at) ? source.at : null,
      };`;
  if (!helperSources.normalizeHealth.includes(anchor)) throw new Error('normalizeHealth anchor missing');
  helperSources.normalizeHealth = helperSources.normalizeHealth.replace(
    anchor,
    `      const intakes = Array.isArray(source.intakes)
        ? source.intakes
            .filter((entry) => entry && typeof entry.date === 'string' && /^\\\\d{4}-\\\\d{2}-\\\\d{2}$/.test(entry.date) && typeof entry.time === 'string' && /^([01]\\\\d|2[0-3]):[0-5]\\\\d$/.test(entry.time) && typeof entry.at === 'number' && Number.isFinite(entry.at))
            .slice(-180)
            .map((entry) => ({ date: entry.date, time: entry.time, at: entry.at }))
        : [];
      return {
        value,
        value2,
        unit,
        times: [...new Set(times)].sort(),
        active: source.active !== false,
        at: typeof source.at === 'number' && Number.isFinite(source.at) ? source.at : null,
        intakes,
      };`,
  );
}

// 2. normalizeSettings backup interval
if (!helperSources.normalizeSettings.includes('backupIntervalMinutes')) {
  const anchor = "        cleanupScheduleTimezone: (() => {";
  if (!helperSources.normalizeSettings.includes(anchor)) throw new Error('settings anchor missing');
  helperSources.normalizeSettings = helperSources.normalizeSettings.replace(
    anchor,
    `        backupIntervalMinutes: typeof source.backupIntervalMinutes === 'number' && Number.isFinite(source.backupIntervalMinutes) ? Math.max(1, Math.min(1440, Math.round(source.backupIntervalMinutes))) : 5,\n        ` + anchor,
  );
}

let panel = helperSources.WorkbenchPanel;

// 3. state
if (!panel.includes('shortcutsOpen')) {
  panel = panel.replace(
    "const [paletteOpen, setPaletteOpen] = React.useState(false);",
    "const [paletteOpen, setPaletteOpen] = React.useState(false);\n      const [shortcutsOpen, setShortcutsOpen] = React.useState(false);",
  );
}

// 4. key handling
if (!panel.includes("key === '?'")) {
  panel = panel.replace(
    "          if (key === 'escape') setPaletteOpen(false);",
    `          if (key === 'escape') {
            setPaletteOpen(false);
            setShortcutsOpen(false);
          }
          if (key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey) {
            const tag = event.target && event.target.tagName ? String(event.target.tagName).toUpperCase() : '';
            if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
              event.preventDefault();
              setShortcutsOpen((value) => !value);
            }
          }`,
  );
}

// 5. retention forecast + goal history computations
if (!panel.includes('retentionForecast')) {
  const anchor = "      const retention = activeView === 'card' && !modulesHidden ? retentionByInterval(reviewsRef.current) : undefined;";
  if (!panel.includes(anchor)) throw new Error('retention anchor missing');
  panel = panel.replace(
    anchor,
    anchor +
      `\n      const retentionGoal = Math.max(1, prefs.reviewGoal);
      const retentionForecast =
        retention === undefined || !retention.some((bucket) => bucket.count > 0)
          ? undefined
          : [1, 7, 30].map((days) => {
              const index = days <= 1 ? 0 : days <= 6 ? 1 : days <= 29 ? 2 : 3;
              return { days, rate: retention[index].rate === null ? 0 : retention[index].rate };
            });
      const reviewGoalHistory = (() => {
        const counts = new Map();
        for (const record of normalizeReviewLog(reviewsRef.current)) {
          const key = dayKeyOf(record.at);
          counts.set(key, (counts.get(key) || 0) + 1);
        }
        const cells = [];
        for (let offset = 6; offset >= 0; offset -= 1) {
          const date = new Date(nowMs - offset * 86400000);
          const key = dayKeyOf(date.getTime());
          cells.push({ key, label: date.getMonth() + 1 + '/' + date.getDate(), count: counts.get(key) || 0, goal: retentionGoal });
        }
        return cells;
      })();`,
  );
}

// 6. review insight JSX
if (!panel.includes("t('reviewForecastTitle')")) {
  const anchor = '        healthSummary !== undefined ? healthSummary : null,';
  if (!panel.includes(anchor)) throw new Error('healthSummary anchor missing');
  panel = panel.replace(
    anchor,
    `        activeView === 'card' && !modulesHidden && retentionForecast !== undefined
          ? h(
              'div',
              { className: 'dshqn-retention' },
              h(
                'span',
                { className: 'dshqn-stat' },
                t('reviewForecastTitle') +
                  '：' +
                  retentionForecast.map((point) => point.days + t('reviewDaysShort') + ' ' + Math.round(point.rate * 100) + '%').join(' · '),
              ),
              h('span', { className: 'dshqn-stat' }, t('reviewGoalHistory') + '：' + reviewGoalHistory.map((cell) => cell.label + ' ' + cell.count).join(' · ')),
              reviewGoalHistory.map((cell) =>
                h(
                  'span',
                  { key: cell.key, className: 'dshqn-stat', title: cell.label + ' ' + cell.count + '/' + cell.goal },
                  h('span', { style: { display: 'inline-block', width: '28px', height: '8px', background: 'var(--dsw-alias-bg-layer-2)', borderRadius: '999px', marginRight: '4px' } }, h('span', { style: { display: 'block', width: Math.min(100, Math.round((cell.count / cell.goal) * 100)) + '%', height: '100%', background: 'var(--dshqn-accent)', borderRadius: '999px' } })),
                  cell.count + '/' + cell.goal,
                ),
              ),
            )
          : null,
        ` + anchor,
  );
}

// 7. med adherence UI
if (!panel.includes("t('medAdherenceWeek')")) {
  const anchor = `                  meds.length === 0
                    ? h('span', { className: 'dshqn-stat' }, t('healthNoMeds'))
                    : h(
                        'span',
                        { className: 'dshqn-stat' },
                        meds.map((item) => item.health.times.join('/') + ' ' + (item.title || t('untitled'))).join(' · '),
                      ),`;
  if (!panel.includes(anchor)) throw new Error('med anchor missing');
  panel = panel.replace(
    anchor,
    `                  meds.length === 0
                    ? h('span', { className: 'dshqn-stat' }, t('healthNoMeds'))
                    : h(
                        'div',
                        { className: 'dshqn-stats' },
                        meds.map((item) => {
                          const nowDate = new Date(nowMs);
                          const hhmm = String(nowDate.getHours()).padStart(2, '0') + ':' + String(nowDate.getMinutes()).padStart(2, '0');
                          const weekStart = nowMs - 6 * 86400000;
                          const intakes = Array.isArray(item.health.intakes) ? item.health.intakes.filter((entry) => entry.at >= weekStart) : [];
                          const expected = Math.max(1, item.health.times.length * 7);
                          const rate = Math.min(100, Math.round((intakes.length / expected) * 100));
                          return h(
                            'div',
                            { key: item.id, className: 'dshqn-stat', style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
                            h('span', null, (item.title || t('untitled')) + ' · ' + item.health.times.join('/')),
                            h('span', null, t('medAdherenceWeek') + ' ' + rate + '% (' + intakes.length + '/' + expected + ')'),
                            h(
                              'button',
                              {
                                type: 'button',
                                className: 'dshqn-button',
                                onClick: () =>
                                  updateById(item.id, {
                                    health: {
                                      ...item.health,
                                      intakes: [...(item.health.intakes || []), { date: localDayKey(nowMs), time: hhmm, at: nowMs }].slice(-180),
                                    },
                                  }),
                              },
                              t('medLogIntake'),
                            ),
                          );
                        }),
                      ),`,
  );
}

// 8. header help button
if (!panel.includes("t('shortcutHelp')")) {
  const anchor = `              h(Icon, { name: 'search', size: 14 }),
              t('paletteShortcut'),
            ),`;
  if (!panel.includes(anchor)) throw new Error('palette header anchor missing');
  panel = panel.replace(
    anchor,
    `              h(Icon, { name: 'search', size: 14 }),
              t('paletteShortcut'),
            ),
            h(
              'button',
              { type: 'button', className: 'dshqn-button', onClick: () => setShortcutsOpen((value) => !value), title: t('shortcutHelp'), 'aria-label': t('shortcutHelp') },
              '?',
            ),`,
  );
}

// 9. shortcuts overlay before palette
if (!panel.includes("t('shortcutTitle')")) {
  const anchor = '        paletteOpen\n          ? h(';
  if (!panel.includes(anchor)) throw new Error('palette overlay anchor missing');
  panel = panel.replace(
    anchor,
    `        shortcutsOpen
          ? h(
              'div',
              { className: 'dshqn-palette-backdrop', onClick: () => setShortcutsOpen(false) },
              h(
                'div',
                { className: 'dshqn-palette', role: 'dialog', 'aria-label': t('shortcutTitle'), onClick: (event) => event.stopPropagation() },
                h('p', { className: 'dshqn-settings-label' }, t('shortcutTitle')),
                [
                  ['Ctrl/⌘ K', t('shortcutPalette')],
                  ['1 / 2 / 3', t('shortcutRate')],
                  ['Space', t('shortcutReveal')],
                  ['U', t('shortcutUndo')],
                  ['Esc', t('shortcutClose')],
                  ['?', t('shortcutHelp')],
                ].map((row) =>
                  h(
                    'div',
                    { key: row[0], style: { display: 'flex', justifyContent: 'space-between', gap: '16px', fontSize: '12px', padding: '3px 0' } },
                    h('code', null, row[0]),
                    h('span', null, row[1]),
                  ),
                ),
              ),
            )
          : null,
        ` + anchor,
  );
}

helperSources.WorkbenchPanel = panel;
fs.writeFileSync(helpersFile, 'export const helperSources = ' + JSON.stringify(helperSources) + ';\n', 'utf8');

// 10. SettingsSection backup UI (components source)
const componentsFile = path.join(root, 'src', 'components.mjs');
const components = await import(pathToFileURL(componentsFile).href + '?t=' + Date.now());
let settingsSource = components.SettingsSectionSource;
if (!settingsSource.includes('backupInterval')) {
  settingsSource = settingsSource.replace(
    "const [restoreConfirm, setRestoreConfirm] = React.useState('');",
    "const [restoreConfirm, setRestoreConfirm] = React.useState('');\n      const [backupInterval, setBackupInterval] = React.useState('5');\n      const [backupDiff, setBackupDiff] = React.useState(null);\n      const [diffBusy, setDiffBusy] = React.useState(false);",
  );
  settingsSource = settingsSource.replace(
    '            setBrief(document.settings.brief);',
    "            setBrief(document.settings.brief);\n            setBackupInterval(String(document.settings.backupIntervalMinutes || 5));",
  );
  settingsSource = settingsSource.replace(
    "      /** Create one rolling backup now. */",
    `      /** Preview differences between the current document and one rolling backup. */
      const previewBackupDiff = (name) => {
        if (diffBusy) return;
        setDiffBusy(true);
        readProtected(BACKUP_URL + '?diff=' + encodeURIComponent(name))
          .then((payload) => setBackupDiff(payload))
          .catch(() => setBackupDiff(null))
          .finally(() => setDiffBusy(false));
      };

      /** Save the automatic-backup interval (minutes). */
      const saveBackupInterval = () => {
        const minutes = Math.max(1, Math.min(1440, Math.round(Number(backupInterval) || 5)));
        writeSettings((settings) => ({ ...settings, backupIntervalMinutes: minutes }))
          .then(() => setPricingNotice(t('saved')))
          .catch(() => setPricingNotice(t('backupFailed')));
      };

      /** Create one rolling backup now. */`,
  );
  settingsSource = settingsSource.replace(
    `          backups.length === 0
            ? h('p', { className: 'dshqn-settings-hint' }, t('backupEmpty'))`,
    `          h(
            'label',
            { className: 'dshqn-settings-row' },
            h('span', null, t('backupInterval')),
            h('input', { className: 'dshqn-field', type: 'number', min: '1', max: '1440', value: backupInterval, onChange: (event) => setBackupInterval(event.target.value) }),
            h('button', { type: 'button', className: 'dshqn-button', onClick: saveBackupInterval }, t('saved')),
          ),
          backupDiff !== null
            ? h(
                'p',
                { className: 'dshqn-settings-hint' },
                fillTemplate(t('backupDiffSummary'), {
                  name: backupDiff.name || '',
                  added: backupDiff.added,
                  removed: backupDiff.removed,
                  changed: backupDiff.changed,
                }) + (backupDiff.settingsChanged ? ' · ' + t('backupDiffSettings') : ''),
              )
            : null,
          backups.length === 0
            ? h('p', { className: 'dshqn-settings-hint' }, t('backupEmpty'))`,
  );
  settingsSource = settingsSource.replace(
    `                    h(
                      'button',
                      {
                        type: 'button',
                        className: restoreConfirm === backup.name ? 'dshqn-button dshqn-button-danger' : 'dshqn-button',
                        onClick: () => restoreBackup(backup.name),
                        disabled: backupBusy,
                      },
                      restoreConfirm === backup.name ? t('backupRestoreConfirm') : t('backupRestore'),
                    ),`,
    `                    h('button', { type: 'button', className: 'dshqn-button', onClick: () => previewBackupDiff(backup.name), disabled: diffBusy }, t('backupDiff')),
                    h(
                      'button',
                      {
                        type: 'button',
                        className: restoreConfirm === backup.name ? 'dshqn-button dshqn-button-danger' : 'dshqn-button',
                        onClick: () => restoreBackup(backup.name),
                        disabled: backupBusy,
                      },
                      restoreConfirm === backup.name ? t('backupRestoreConfirm') : t('backupRestore'),
                    ),`,
  );
  const allComponents = { ...components, SettingsSectionSource: settingsSource };
  const serialized = Object.entries(allComponents)
    .map(([key, value]) => 'export const ' + key + ' = ' + JSON.stringify(value) + ';')
    .join('\n\n');
  fs.writeFileSync(componentsFile, serialized + '\n', 'utf8');
}
console.log('panel features=' + [panel.includes('shortcutsOpen'), panel.includes('reviewForecastTitle'), panel.includes('medAdherenceWeek')].join(',') + ' backups=' + settingsSource.includes('backupInterval'));
