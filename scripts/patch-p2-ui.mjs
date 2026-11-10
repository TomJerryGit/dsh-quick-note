/** v1.42.0: P2 UI unification for usage/system/value panes. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const helpersFile = path.join(root, 'src', 'helpers.mjs');
const module = await import(pathToFileURL(helpersFile).href + '?t=' + Date.now());
const sources = { ...module.helperSources };
let panel = sources.WorkbenchPanel;
const replace = (from, to) => {
  if (!panel.includes(from)) throw new Error('anchor missing: ' + from.slice(0, 80));
  panel = panel.replace(from, to);
};

// 1. usage forecast variables
replace(
  `      const usageCacheRate = (() => {
        if (usage === null) return 0;
        if (typeof usage.totals.cacheHitRate === 'number') return usage.totals.cacheHitRate;
        const hit = usage.totals.inputHit;
        const miss = usage.totals.inputMiss;
        return hit + miss === 0 ? 0 : hit / (hit + miss);
      })();`,
  `      const usageCacheRate = (() => {
        if (usage === null) return 0;
        if (typeof usage.totals.cacheHitRate === 'number') return usage.totals.cacheHitRate;
        const hit = usage.totals.inputHit;
        const miss = usage.totals.inputMiss;
        return hit + miss === 0 ? 0 : hit / (hit + miss);
      })();
      const usageDays30 = usage !== null && Array.isArray(usage.daily30) ? usage.daily30 : [];
      const usageForecastDaily = (() => {
        if (usage === null) return 0;
        const recent = usageDays30.slice(-7).filter((day) => Number(day.cost) > 0);
        if (recent.length > 0) return recent.reduce((sum, day) => sum + Number(day.cost), 0) / recent.length;
        return Number(usage.efficiency && usage.efficiency.todayCost ? usage.efficiency.todayCost : 0);
      })();
      const usageForecastMonthly = usageForecastDaily * 30;
      const usageMaxWorkspaceCost = usage === null ? 0 : Math.max(0.000001, ...usage.workspaces.map((row) => Number(row.cost) || 0));`,
);

// 2. usage KPI + workspace cost trend
replace(
  `                          h(
                            'div',
                            { className: 'dshqn-kpi' },
                            h('span', { className: 'dshqn-kpi-value' }, formatNumber(usage.totals.sessions)),
                            h('span', { className: 'dshqn-kpi-label' }, t('usageSessions')),
                            h(
                              'span',
                              { className: 'dshqn-kpi-sub' },
                              t('usageAvgTokens') + ' ' + formatNumber(usage.totals.avgTokens || 0),
                            ),
                          ),
                        ),`,
  `                          h(
                            'div',
                            { className: 'dshqn-kpi' },
                            h('span', { className: 'dshqn-kpi-value' }, formatNumber(usage.totals.sessions)),
                            h('span', { className: 'dshqn-kpi-label' }, t('usageSessions')),
                            h(
                              'span',
                              { className: 'dshqn-kpi-sub' },
                              t('usageAvgTokens') + ' ' + formatNumber(usage.totals.avgTokens || 0),
                            ),
                          ),
                          h(
                            'div',
                            { className: 'dshqn-kpi dshqn-kpi-success' },
                            h('span', { className: 'dshqn-kpi-value' }, formatMoney(usageForecastMonthly)),
                            h('span', { className: 'dshqn-kpi-label' }, t('usageCostForecast')),
                            h('span', { className: 'dshqn-kpi-sub' }, t('usageForecastDaily') + ' ' + formatMoney(usageForecastDaily)),
                          ),
                        ),
                        h(
                          'section',
                          { key: 'workspaceTrend', className: 'dshqn-card', style: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' } },
                          h(SectionHead, { title: t('usageWorkspaceCostTrend') }),
                          usage.workspaces.slice(0, 6).map((workspace) =>
                            h(
                              'div',
                              { key: workspace.path || workspace.title, style: { display: 'flex', flexDirection: 'column', gap: '3px' } },
                              h(
                                'div',
                                { style: { display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '12px' } },
                                h('span', null, workspace.title),
                                h('span', null, formatMoney(workspace.cost)),
                              ),
                              h(
                                'div',
                                { style: { height: '8px', borderRadius: '999px', background: 'var(--dsw-alias-bg-layer-2)', overflow: 'hidden' } },
                                h('div', { style: { width: Math.max(2, Math.round((Number(workspace.cost) || 0) / usageMaxWorkspaceCost * 100)) + '%', height: '100%', background: 'var(--dshqn-accent)' } }),
                              ),
                            ),
                          ),
                        ),`,
);

// 3. session rank
replace(
  `                          usageTop.map((session) =>
                            h(
                              'div',
                              { key: session.sessionId, className: 'dshqn-usage-session' },
                              h('span', { className: 'dshqn-usage-session-ws' }, session.workspace || '—'),`,
  `                          usageTop.map((session, index) =>
                            h(
                              'div',
                              { key: session.sessionId, className: 'dshqn-usage-session' },
                              h('span', { className: 'dshqn-usage-session-rank' }, '#' + (index + 1)),
                              h('span', { className: 'dshqn-usage-session-ws' }, session.workspace || '—'),`,
);

// 4. system savings / model strategy section
replace(
  `                  : [
                      h(
                        'section',
                        { key: 'profile', className: 'dshqn-settings-group' },`,
  `                  : [
                      h(
                        'section',
                        { key: 'savingsPolicy', className: 'dshqn-settings-group' },
                        h('p', { className: 'dshqn-settings-label' }, t('systemSavings')),
                        h('p', { className: 'dshqn-settings-hint' }, t('systemSavingsHint')),
                        h(
                          'div',
                          { className: 'dshqn-brief' },
                          h('span', { className: 'dshqn-stat' }, t('systemBudget') + ' ' + (settings.tokenBudget > 0 ? '¥' + Number(settings.tokenBudget).toFixed(2) : '—')),
                          h('span', { className: 'dshqn-stat' }, t('systemMonthlyBudget') + ' ' + (settings.tokenBudgetMonthly > 0 ? '¥' + Number(settings.tokenBudgetMonthly).toFixed(2) : '—')),
                          h('span', { className: 'dshqn-stat' }, t('optimizerSavingsMode') + ' ' + (settings.savingsMode ? t('systemOn') : t('systemOff'))),
                          settings.savingsModel ? h('span', { className: 'dshqn-stat' }, t('optimizerSavingsModel') + '：' + settings.savingsModel) : null,
                        ),
                        h('button', { type: 'button', className: 'dshqn-button', onClick: () => { setView('insights'); setInsightTab('optimizer'); } }, t('systemOpenOptimizer')),
                      ),
                      h(
                        'section',
                        { key: 'profile', className: 'dshqn-settings-group' },`,
);

// 5. value high-value vs high-cost split before workspace cards
replace(
  `                        ...valueSorted.map((workspace) => {`,
  `                        h(
                          'div',
                          { key: 'valueCostSplit', style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' } },
                          ['valueScore', 'cost'].map((metric) => {
                            const rows = value.workspaces
                              .slice()
                              .sort((left, right) => (metric === 'cost' ? Number(right.cost) - Number(left.cost) : right.valueScore - left.valueScore))
                              .slice(0, 3);
                            return h(
                              'section',
                              { key: metric, className: 'dshqn-card', style: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' } },
                              h('p', { style: { margin: 0, fontSize: '12px', fontWeight: '600' } }, metric === 'cost' ? t('valueHighCostWorkspaces') : t('valueHighValueWorkspaces')),
                              rows.map((workspace) =>
                                h(
                                  'div',
                                  { key: workspace.path || workspace.title, style: { display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '12px' } },
                                  h('span', null, workspace.title),
                                  h('span', null, metric === 'cost' ? formatMoney(workspace.cost) : String(workspace.valueScore) + ' · ' + workspace.grade),
                                ),
                              ),
                            );
                          }),
                        ),
                        ...valueSorted.map((workspace) => {`,
);

sources.WorkbenchPanel = panel;
fs.writeFileSync(helpersFile, 'export const helperSources = ' + JSON.stringify(sources) + ';\n', 'utf8');
console.log('P2 workbench UI patched');
