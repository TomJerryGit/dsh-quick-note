/** v1.36.1: calendar meds visibility toggle, i18n grouping, narrow-screen scroll. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const helpersFile = path.join(root, 'src', 'helpers.mjs');
const module = await import(pathToFileURL(helpersFile).href + '?t=' + Date.now());
const sources = { ...module.helperSources };
let panel = sources.WorkbenchPanel;

// state
if (!panel.includes('calendarMeds')) {
  const anchor = `      const [calendarSelected, setCalendarSelected] = React.useState(() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      });`;
  if (!panel.includes(anchor)) throw new Error('calendarSelected anchor missing');
  panel = panel.replace(anchor, anchor + '\n      const [calendarMeds, setCalendarMeds] = React.useState(true);');
}

// filter meds
panel = panel.replace(
  "} else if (item.kind === 'med' && item.health.active && item.health.times.length > 0) {",
  "} else if (calendarMeds && item.kind === 'med' && item.health.active && item.health.times.length > 0) {",
);

// grouped label through i18n
panel = panel.replace(
  "label: (itemTitle(item) || t('untitled')) + (item.health.times.length > 1 ? ' ×' + item.health.times.length : ''),",
  "label: item.health.times.length > 1 ? fillTemplate(t('calendarMedGroup'), { title: itemTitle(item) || t('untitled'), count: item.health.times.length }) : itemTitle(item) || t('untitled'),",
);

// toolbar toggle
if (!panel.includes("t('calendarMedsHint')")) {
  const anchor = "                    h('button', { type: 'button', className: 'dshqn-button', onClick: goToday }, t('calendarToday')),";
  if (!panel.includes(anchor)) throw new Error('calendar today anchor missing');
  panel = panel.split(anchor).join(
    anchor +
      "\n                    h('button', { type: 'button', className: calendarMeds ? 'dshqn-filter dshqn-filter-active' : 'dshqn-filter', 'aria-pressed': calendarMeds, title: t('calendarMedsHint'), onClick: () => setCalendarMeds((value) => !value) }, t('calendarMeds')),",
  );
}

sources.WorkbenchPanel = panel;
fs.writeFileSync(helpersFile, 'export const helperSources = ' + JSON.stringify(sources) + ';\n', 'utf8');

// narrow-screen calendar scroll in UI assets
const assetsFile = path.join(root, 'src', 'ui-assets.mjs');
let assets = fs.readFileSync(assetsFile, 'utf8');
if (!assets.includes('@media (max-width: 720px)')) {
  const anchor = "      '.dshqn-calendar-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; }',";
  if (!assets.includes(anchor)) throw new Error('calendar grid css anchor missing');
  assets = assets.replace(
    anchor,
    anchor + "\n      '@media (max-width: 720px) { .dshqn-calendar-weekdays, .dshqn-calendar-grid { min-width: 680px; } }',",
  );
  fs.writeFileSync(assetsFile, assets, 'utf8');
}
console.log('toggle=' + panel.includes('calendarMedsHint') + ' group=' + panel.includes('calendarMedGroup') + ' css=' + assets.includes('@media (max-width: 720px)'));
