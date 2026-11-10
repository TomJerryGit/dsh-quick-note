/** v1.36.0: calendar med grouping/cache + accessibility, and tool schema fix. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const helpersFile = path.join(root, 'src', 'helpers.mjs');
const module = await import(pathToFileURL(helpersFile).href + '?t=' + Date.now());
const sources = { ...module.helperSources };
let panel = sources.WorkbenchPanel;

// 1. cache per-day event computation (42 days × N items was recomputed repeatedly)
if (!panel.includes('eventsCache')) {
  const anchor = '              const eventsOn = (dayStart) => {';
  if (!panel.includes(anchor)) throw new Error('eventsOn anchor missing');
  panel = panel.replace(
    anchor,
    '              const eventsCache = new Map();\n              const eventsOn = (dayStart) => {\n                if (eventsCache.has(dayStart)) return eventsCache.get(dayStart);',
  );
  const returnAnchor = '                return events.sort((left, right) => left.time.localeCompare(right.time));';
  if (!panel.includes(returnAnchor)) throw new Error('events sort anchor missing');
  panel = panel.replace(
    returnAnchor,
    '                const sorted = events.sort((left, right) => left.time.localeCompare(right.time));\n                eventsCache.set(dayStart, sorted);\n                return sorted;',
  );
}

// 2. aggregate one medication plan into one calendar event per day
if (!panel.includes("key: item.id + '-med'")) {
  const anchor = `                  } else if (item.kind === 'med' && item.health.active && item.health.times.length > 0) {
                    for (const time of item.health.times) {
                      events.push({
                        key: item.id + '-med-' + time,
                        kind: 'med',
                        item,
                        time,
                        label: itemTitle(item) || t('untitled'),
                        tone: 'med',
                      });
                    }
                  }`;
  if (!panel.includes(anchor)) throw new Error('med event anchor missing');
  panel = panel.replace(
    anchor,
    `                  } else if (item.kind === 'med' && item.health.active && item.health.times.length > 0) {
                    events.push({
                      key: item.id + '-med',
                      kind: 'med',
                      item,
                      time: item.health.times[0],
                      medTimes: item.health.times,
                      label: (itemTitle(item) || t('untitled')) + (item.health.times.length > 1 ? ' ×' + item.health.times.length : ''),
                      tone: 'med',
                    });
                  }`,
  );
}

// 3. full time list in the chip tooltip
if (!panel.includes('event.medTimes.join')) {
  const anchor = "title: event.time + ' ' + event.label,";
  if (!panel.includes(anchor)) throw new Error('chip title anchor missing');
  panel = panel.replace(
    anchor,
    "title: event.medTimes !== undefined && event.medTimes.length > 1 ? event.medTimes.join('/') + ' · ' + event.label : event.time + ' ' + event.label,",
  );
}

// 4. accessible day buttons: count + selected state
if (!panel.includes("'aria-pressed': dayStartMs === calendarSelected")) {
  const anchor = "                        'aria-label': formatStamp(dayStartMs),";
  if (!panel.includes(anchor)) throw new Error('day aria anchor missing');
  panel = panel.replace(
    anchor,
    `                        'aria-label': formatStamp(dayStartMs) + (events.length > 0 ? ' · ' + fillTemplate(t('batchCount'), { count: events.length }) : ''),
                        'aria-pressed': dayStartMs === calendarSelected,`,
  );
}

sources.WorkbenchPanel = panel;
fs.writeFileSync(helpersFile, 'export const helperSources = ' + JSON.stringify(sources) + ';\n', 'utf8');
console.log('panel features=' + [panel.includes('eventsCache'), panel.includes("key: item.id + '-med'"), panel.includes('event.medTimes.join'), panel.includes('aria-pressed')].join(','));
