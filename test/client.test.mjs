/**
 * Client-half regression tests: render smoke for the panel, value tab trend,
 * records tab, settings section, and the report archive action.
 */
import {
  byClass,
  createBrowserStub,
  createReactStub,
  createRenderer,
  loadClient,
  report,
  settle,
  textOf,
} from './helpers.mjs';

const lines = [];
const check = (label, ok, extra) => {
  lines.push((ok ? 'OK   ' : 'FAIL ') + label + (extra === undefined ? '' : ' :: ' + extra));
};

const now = Date.now();
const recordType = { id: 't1', name: '客户', fields: [{ key: 'f1', label: '姓名', type: 'text', options: [] }], views: [], createdAt: 1, updatedAt: 2 };
const recordItem = (id, title) => ({
  id,
  kind: 'record',
  title,
  body: '',
  tags: [],
  status: 'open',
  priority: 'normal',
  due: null,
  doneAt: null,
  review: { ease: 2.5, intervalDays: 0, repetitions: 0, dueAt: null, lastAt: null },
  health: { value: null, value2: null, unit: '', times: [], active: true, at: null },
  record: { typeId: 't1', values: { f1: title } },
  order: null,
  createdAt: 1,
  updatedAt: 2,
});
const metricItem = (id, title, value) => ({
  ...recordItem(id, title),
  kind: 'metric',
  record: { typeId: '', values: {} },
  health: { value, value2: null, unit: 'kg', times: [], active: true, at: now - 3600000 },
  updatedAt: 5,
});
const cardItem = (id, title) => ({
  ...recordItem(id, title),
  kind: 'card',
  record: { typeId: '', values: {} },
  review: { ease: 2.5, intervalDays: 0, repetitions: 0, dueAt: now - 86400000, lastAt: null },
  updatedAt: 3,
});
const plainNote = (id, title, updatedAt) => ({
  ...recordItem(id, title),
  kind: 'note',
  record: { typeId: '', values: {} },
  updatedAt,
});
const valuePayload = {
  generatedAt: 1,
  home: 'C:/Users/test/.dsh',
  currency: 'CNY',
  averageScore: 50,
  count: 2,
  workspaces: [
    {
      path: 'D:\\ProjA', title: 'ProjA', sessions: 5, inputMiss: 100, inputHit: 200, output: 50, totalTokens: 350, cost: 0.5,
      firstAt: 1, lastAt: 2, daysSinceLast: 2, activeDays: 3, recent14: 2, prior14: 1, momentum: 1.5,
      files: 120, bytes: 4096, truncated: false, note: '', rating: '', socialNote: '', socialRating: '', noteUpdatedAt: null,
      valueScore: 70, grade: 'B', stage: 'active', future: 'high', socialScore: 65, socialGrade: 'medium',
      socialDomains: ['教育'], socialSignals: { readme: true, license: true, tests: false, docs: false, files: 120, active: true }, breakdown: {},
      socialBreakdown: [
        { key: 'docs', score: 20, max: 20 },
        { key: 'license', score: 15, max: 15 },
        { key: 'tests', score: 0, max: 10 },
        { key: 'impact', score: 10, max: 25 },
        { key: 'substance', score: 12, max: 15 },
        { key: 'activity', score: 15, max: 15 },
      ],
      socialStrengths: ['docs', 'license', 'activity'],
      socialGaps: ['tests'],
      socialSuggestions: ['addTests', 'addDomains'],
    },
    {
      path: 'D:\\ProjB', title: 'ProjB', sessions: 2, inputMiss: 10, inputHit: 20, output: 5, totalTokens: 35, cost: 0.01,
      firstAt: 1, lastAt: 2, daysSinceLast: 30, activeDays: 2, recent14: 0, prior14: 2, momentum: 0.4,
      files: 5, bytes: 512, truncated: false, note: '', rating: '', socialNote: '', socialRating: '', noteUpdatedAt: null,
      valueScore: 40, grade: 'C', stage: 'recent', future: 'slowing', socialScore: 30, socialGrade: 'weak',
      socialDomains: [], socialSignals: { readme: false, license: false, tests: false, docs: false, files: 5, active: true }, breakdown: {},
      socialBreakdown: [{ key: 'impact', score: 0, max: 25 }],
      socialStrengths: [],
      socialGaps: ['docs', 'license', 'tests', 'impact'],
      socialSuggestions: ['addReadme', 'addLicense', 'addTests'],
    },
  ],
  note: 'heuristic',
};

const makeServer = (initial) => {
  const server = {
    token: 'test-token',
    tokenFetches: 0,
    valueHeaders: [],
    valueStatuses: [],
    harnessFeed: '',
    harnessAuto: false,
    harnessAutoCheck: false,
    doc: initial || {
      revision: 3,
      items: [recordItem('r1', '张三'), recordItem('r2', '李四'), metricItem('m1', 'Weight', 70), cardItem('c0', 'Card 0')],
      settings: {
        brief: true,
        pricing: { inputHit: 0.04, inputMiss: 2, output: 8 },
        workspaceNotes: {},
        valueHistory: {
          'D:\\ProjA': [
            { at: now - 3 * 86400000, valueScore: 60, socialScore: 50 },
            { at: now - 2 * 86400000, valueScore: 70, socialScore: 65 },
          ],
          'D:\\ProjB': [
            { at: now - 3 * 86400000, valueScore: 35, socialScore: 25 },
            { at: now - 2 * 86400000, valueScore: 40, socialScore: 30 },
          ],
        },
        harnessFeedUrl: 'https://feed.test/latest.json',
        harnessAutoCheck: true,
        harnessAutoUpdate: false,
        cleanupSchedule: 'cron',
        cleanupScheduleTime: '03:00',
        cleanupScheduleCron: '0 3 * * 1',
        trashPresets: [{ name: '我的预设', type: 'attachments', workspace: 'all', query: '' }],
        budgetWebhookUrl: '',
        budgetWebhookTemplate: 'generic',
      },
      reviews: [{ itemId: 'r2', at: now - 86400000, quality: 3 }, { itemId: 'r1', at: now - 2 * 86400000, quality: 5 }],
      types: [recordType],
      file: 'D:/fake/items.json',
    },
    putHeaders: [],
    patchHeaders: [],
    fetch(url, options) {
      const method = options && options.method ? options.method : 'GET';
      const headers = (options && options.headers) || {};
      if (String(url).indexOf('/auth') >= 0) {
        server.tokenFetches += 1;
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ token: server.token }) });
      }
      if (String(url).indexOf('/optimizer-report') >= 0) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ path: 'D:/dsh/quick-note/reports/optimizer.md', bytes: 512, score: 72 }) });
      }
      if (String(url).indexOf('/cleanup') >= 0) {
        server.cleanupCalls = (server.cleanupCalls || 0) + 1;
        if (headers['x-quick-note-token'] !== server.token) return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({ error: 'unauthorized' }) });
        const body = options && options.body ? JSON.parse(options.body) : {};
        if (body.action === 'undo') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ restored: 2, failed: 0, history: [] }) });
        }
        if (body.action === 'auto') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ removed: 1, freed: 256, errors: 0, history: [] }) });
        }
        if (body.action === 'empty') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ emptied: true, history: [], trash: { count: 0, bytes: 0, records: [] } }) });
        }
        if (body.action === 'webhook-test') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ sent: true, status: 200, event: 'over' }) });
        }
        if (body.action === 'cron-preview') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ next: [now + 3600000, now + 7200000, now + 10800000] }) });
        }
        if (body.action === 'webhook-edit') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ updated: true, queue: [] }) });
        }
        if (body.action === 'webhook-resend') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ sent: 1, failed: 0, remaining: 0 }) });
        }
        if (body.action === 'restore') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ restored: body.ids ? body.ids.length : 0, failed: 0, history: [] }) });
        }
        if (body.action === 'clean') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ removed: 1, freed: 1024, errors: 0, categories: body.categories || [] }) });
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              generatedAt: now,
              scannedFiles: 12,
              workspaceRoots: ['D:/work'],
              totals: { count: 1, bytes: 1024, deletableBytes: 1024 },
              trash: {
                count: 16,
                bytes: 5120,
                records: Array.from({ length: 6 }, (_, index) => ({
                  id: 'trash-record-' + index,
                  bytes: 512,
                  files: 1,
                  createdAt: now - index * 1000,
                  expiresAt: now + 3600000,
                  recoverable: true,
                  removed: 1,
                  categories: [['pluginAttachments'], ['pluginTemp'], ['workspaceCaches'], ['workspaceBuilds'], ['workspaceJunk'], ['pluginAttachments']][index % 6],
                  roots: ['proj-a', 'quick-note'],
                })),
                maxRecords: 20,
                maxBytes: 1073741824,
              },
              shareStats: [{ name: 'share-1.html', count: 3, firstAt: now - 5000, lastAt: now - 1000, refs: { direct: 2, 'ref.example': 1 } }],
              webhookQueue: { count: 2, items: [{ at: now - 1000, url: 'https://hook.test/budget', lastError: 'HTTP 500' }, { at: now - 2000, url: 'https://hook.test/budget', lastError: 'timeout' }] },
              schedule: {
                mode: 'weekly',
                time: '03:00',
                lastRunAt: now - 1000,
                lastResult: { removed: 1 },
                nextRunAt: now + 3600000,
                runs: [
                  { at: now - 1000, removed: 2, freed: 1024, errors: 0, ok: true, auto: true },
                  { at: now - 7200000, removed: 1, freed: 100, errors: 1, ok: false, auto: true },
                ],
              },
              history: [
                { at: now - 1000, removed: 2, freed: 2048, errors: 0, recoverable: false, hints: ['缓存会按需重建'], categories: [{ id: 'workspaceJunk', label: '工作区临时文件', count: 2, bytes: 2048 }] },
                { id: 'history-undo-1', at: now - 500, removed: 3, freed: 4096, errors: 0, recoverable: true, expiresAt: now + 3600000, items: [], hints: ['构建产物可重建'], categories: [{ id: 'workspaceBuilds', label: '工作区构建产物', count: 3, bytes: 4096 }] },
              ],
              categories: [
                {
                  id: 'workspaceJunk',
                  label: '工作区临时文件',
                  deletable: true,
                  safe: true,
                  hint: 'tmp/log',
                  count: 1,
                  bytes: 1024,
                  items: [{ path: 'D:/work/a.tmp', root: 'D:/work', rel: 'a.tmp', bytes: 1024, kind: 'file' }],
                },
              ],
            }),
        });
      }
      if (String(url).indexOf('/admin') >= 0) {
        server.adminHeaders = headers;
        if (headers['x-quick-note-token'] !== server.token) return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({ error: 'unauthorized' }) });
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ profile: { name: 'desktop', dir: '', bundles: [], dependencies: [] }, data: {}, sessions: { recent: [] } }) });
      }
      if (String(url).indexOf('/harness') >= 0) {
        if (headers['x-quick-note-token'] !== server.token) return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({ error: 'unauthorized' }) });
        if (method === 'GET') {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                current: { version: '1.5.0', electron: '31.0.0', node: 'v24.0.0', execPath: 'D:/DeepSeek Harness.exe' },
                feedUrl: server.harnessFeed || '',
                autoUpdate: server.harnessAuto === true,
                autoCheck: server.harnessAutoCheck === true,
                staged: null,
              }),
          });
        }
        const body = options && options.body ? JSON.parse(options.body) : {};
        if (body.action === 'releases') {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                current: { version: '1.5.0' },
                releases: [
                  {
                    version: '9.9.9',
                    prerelease: false,
                    publishedAt: now,
                    releaseUrl: 'https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v9.9.9',
                    downloadAvailable: false,
                  },
                  {
                    version: '9.8.0-rc.1',
                    prerelease: true,
                    publishedAt: now,
                    releaseUrl: 'https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v9.8.0-rc.1',
                    downloadAvailable: false,
                  },
                ],
              }),
          });
        }
        if (body.action === 'download-direct') {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                staged: {
                  version: 'custom',
                  path: 'D:/staging/custom-setup.exe',
                  size: 24,
                  sha256: 'b'.repeat(64),
                  verified: false,
                  official: false,
                  source: 'custom',
                  downloadedAt: now,
                },
              }),
          });
        }
        if (body.action === 'save-settings') {
          server.harnessFeed = body.feedUrl;
          server.harnessAuto = body.autoUpdate === true;
          server.harnessAutoCheck = body.autoCheck === true;
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ feedUrl: body.feedUrl, autoUpdate: server.harnessAuto, autoCheck: server.harnessAutoCheck }),
          });
        }
        if (body.action === 'check') {
          const officialDirect = String(server.harnessFeed || '') === 'official:direct';
          const github = String(server.harnessFeed || '').indexOf('api.github.com') >= 0;
          let manifest;
          if (officialDirect) {
            manifest = {
              version: null,
              url: 'https://download.deepseek.com/desktop/dsh-latest-windows-x64.exe',
              sha256: null,
              notes: 'official direct download (latest stable desktop build)',
              source: 'official-direct',
              releaseUrl: '',
              downloadAvailable: true,
              downloadPage: 'https://www.deepseek.com/download/',
              size: 289408544,
              lastModified: now,
              buildNewer: true,
            };
          } else if (github) {
            manifest = {
              version: '9.9.9',
              url: '',
              sha256: null,
              notes: 'github release notes',
              source: 'github',
              releaseUrl: 'https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v9.9.9',
              downloadAvailable: false,
              downloadPage: 'https://www.deepseek.com/download/',
            };
          } else {
            manifest = { version: '9.9.9', url: 'https://x.test/setup.exe', sha256: null, notes: 'test notes', source: 'direct', releaseUrl: '', downloadAvailable: true, downloadPage: '' };
          }
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                current: { version: '1.5.0' },
                feedUrl: server.harnessFeed,
                manifest,
                updateAvailable: true,
              }),
          });
        }
        if (body.action === 'download') {
          if (String(server.harnessFeed || '') === 'official:direct') {
            return Promise.resolve({
              ok: true,
              json: () =>
                Promise.resolve({
                  staged: {
                    version: 'latest',
                    path: 'D:/staging/harness-setup-official-latest.exe',
                    size: 289408544,
                    sha256: 'a'.repeat(64),
                    verified: false,
                    official: true,
                    source: 'official-direct',
                    downloadedAt: now,
                  },
                }),
            });
          }
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                staged: { version: '9.9.9', path: 'D:/staging/setup.bin', size: 12, verified: true, sha256: 'abc' },
              }),
          });
        }
        if (body.action === 'install') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ started: true, path: 'D:/staging/setup.bin', method: 'exe-silent' }) });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ opened: true }) });
      }
      if (String(url).indexOf('/savings') >= 0) {
        if (headers['x-quick-note-token'] !== server.token) return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({ error: 'unauthorized' }) });
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            generatedAt: 1,
            compaction: { enabled: true },
            pruner: { enabled: true },
            commandCompact: { enabled: true },
            budgets: { daily: 10, monthly: 100 },
            savings: { mode: false, guard: true, provider: '', model: '', maxOutput: 1200, activatedAt: 0, reason: '' },
            thriftWorkspaces: [],
            modelCandidates: [{ provider: 'deepseek-official', model: 'deepseek-flash', name: 'DeepSeek Flash' }],
            selected: { id: 'session-a1', cwd: 'D:\\ProjA', pressureTokens: 120000, contextWindow: 200000, ratio: 0.6, compressibleTokens: 20000, estimatedAfterTokens: 100000 },
            sessions: [{ id: 'session-a1', cwd: 'D:\\ProjA', pressureTokens: 120000, contextWindow: 200000, ratio: 0.6, compressibleTokens: 20000, estimatedAfterTokens: 100000 }],
          }),
        });
      }
      if (String(url).indexOf('/usage') >= 0) {
        server.usageCalls = (server.usageCalls || 0) + 1;
        if (headers['x-quick-note-token'] !== server.token) return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({ error: 'unauthorized' }) });
        const daily = Array.from({ length: 14 }, (_, index) => ({
          at: now - (13 - index) * 86400000,
          sessions: 1,
          inputMiss: 10,
          inputHit: 20,
          output: 5,
          totalTokens: 35,
          cost: 0.01,
        }));
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              generatedAt: 1,
              pricing: { inputHit: 0.04, inputMiss: 2, output: 8 },
              currency: 'CNY',
              workspaces: [
                {
                  path: 'D:\\ProjA', title: 'ProjA', sessions: 3, inputMiss: 100, inputHit: 200, output: 50,
                  totalTokens: 350, cost: 0.5, cacheHitRate: 0.667, avgTokens: 117, lastAt: now,
                },
              ],
              totals: { sessions: 3, inputMiss: 100, inputHit: 200, output: 50, totalTokens: 350, cost: 0.5, cacheHitRate: 0.667, avgTokens: 117 },
              daily,
              topSessions: [
                { sessionId: 'session-a1', workspace: 'ProjA', path: 'D:\\ProjA', lastAt: now, totalTokens: 350, cost: 0.5 },
              ],
              note: '',
              efficiency: {
                score: 72,
                cacheHitRate: 0.65,
                targetCacheHit: 0.7,
                cacheSaving: 0.42,
                todayCost: 0.1,
                weekCost: 0.7,
                avgCostPerSession: 0.23,
                outputRatio: 0.2,
                totalCost: 0.5,
                totalTokens: 350,
                monthToDateCost: 0.4,
                daily30: Array.from({ length: 30 }, (_, index) => ({ at: now - (29 - index) * 86400000, cost: 0.02, totalTokens: 35 })),
                components: { cacheScore: 93, costScore: 55, outputScore: 100 },
                recommendations: [{ id: 'cache', title: '提升缓存命中率', detail: '可省 ¥0.42', saving: 0.42, severity: 'medium' }],
                daily: [{ at: now - 86400000, cost: 0.1, totalTokens: 100 }, { at: now, cost: 0.2, totalTokens: 200 }],
              },
            }),
        });
      }
      if (String(url).indexOf('/workspace-value') >= 0) {
        server.valueHeaders.push(headers);
        if (headers['x-quick-note-token'] !== server.token) {
          server.valueStatuses.push(401);
          return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({ error: 'unauthorized' }) });
        }
        server.valueStatuses.push(200);
        return Promise.resolve({ ok: true, json: () => Promise.resolve(valuePayload) });
      }
      if (method === 'PATCH') {
        const headers = options.headers || {};
        server.patchHeaders.push({ ...headers });
        const ifMatch = headers['if-match'];
        const body = JSON.parse(options.body);
        if (ifMatch !== undefined && Number(ifMatch) !== server.doc.revision) {
          return Promise.resolve({ ok: false, status: 409, json: () => Promise.resolve({ ...server.doc, items: server.doc.items.map((item) => ({ ...item })) }) });
        }
        const byId = new Map(server.doc.items.map((item) => [item.id, item]));
        for (const item of Array.isArray(body.upserts) ? body.upserts : []) byId.set(item.id, item);
        server.doc.items = [...byId.values()];
        server.doc.revision += 1;
      }
      if (method === 'PUT') {
        const headers = options.headers || {};
        server.putHeaders.push({ ...headers });
        const ifMatch = headers['if-match'];
        if (ifMatch !== undefined && Number(ifMatch) !== server.doc.revision) {
          return Promise.resolve({
            ok: false,
            status: 409,
            json: () => Promise.resolve({ ...server.doc, items: server.doc.items.map((item) => ({ ...item })) }),
          });
        }
        const body = JSON.parse(options.body);
        server.doc.items = body.items;
        if (body.settings !== undefined) server.doc.settings = body.settings;
        if (body.reviews !== undefined) server.doc.reviews = body.reviews;
        if (body.types !== undefined) server.doc.types = body.types;
        server.doc.revision += 1;
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ ...server.doc }) });
    },
  };
  return server;
};

const buttonByText = (tree, text) => byClass(tree, 'dshqn-tab').concat(byClass(tree, 'dshqn-button')).find((element) => textOf(element) === text);

/** Collect every rendered node with the given intrinsic type (e.g. 'img'). */
const nodesOfType = (node, type) => {
  if (node === null || node === undefined || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node.flatMap((child) => nodesOfType(child, type));
  const out = node.type === type ? [node] : [];
  for (const child of node.children || []) out.push(...nodesOfType(child, type));
  return out;
};

/** Open the merged Knowledge tab and one of its sub-tabs (notes or review). */
const clickKnowledge = (tree, panel, which) => {
  byClass(tree, 'dshqn-tab').find((tab) => textOf(tab) === 'LBL:viewKnowledge').props.onClick();
  const next = panel.render();
  const wrapper = byClass(next, 'dshqn-subtabs')[0];
  const label = which === 'review' ? 'LBL:viewCards' : 'LBL:viewNotes';
  byClass(wrapper, 'dshqn-filter').find((button) => textOf(button) === label).props.onClick();
  return panel.render();
};

/** Open the task module with its calendar layout selected. */
const clickTaskCalendar = (tree, panel) => {
  byClass(tree, 'dshqn-tab').find((tab) => textOf(tab) === 'LBL:viewPlan').props.onClick();
  const next = panel.render();
  const wrapper = byClass(next, 'dshqn-subtabs')[0];
  byClass(wrapper, 'dshqn-filter').find((button) => textOf(button) === 'LBL:viewCalendar').props.onClick();
  return panel.render();
};

async function main() {
  const server = makeServer();
  const React = createReactStub();
  const { window } = createBrowserStub(server);
  const registrations = loadClient(window, React);
  const panel = createRenderer(registrations.get('main'), React);
  let tree = panel.render();
  check('loading skeleton', byClass(tree, 'dshqn-skeleton-card').length >= 1, String(byClass(tree, 'dshqn-skeleton-card').length));
  await settle();
  tree = panel.render();

  check('panel renders', tree !== null && byClass(tree, 'dshqn-page').length === 1);
  check('overview hero', byClass(tree, 'dshqn-hero').length === 1);
  check('overview quick cards', byClass(tree, 'dshqn-quick-card').length === 6, String(byClass(tree, 'dshqn-quick-card').length));
  check('overview KPI cards', byClass(tree, 'dshqn-kpi').length === 5, String(byClass(tree, 'dshqn-kpi').length));
  check('overview KPI icons', byClass(tree, 'dshqn-kpi-icon').length === 5, String(byClass(tree, 'dshqn-kpi-icon').length));
  check('overview KPI sparkline', byClass(tree, 'dshqn-kpi-spark').length >= 1, String(byClass(tree, 'dshqn-kpi-spark').length));
  check('header status pill', byClass(tree, 'dshqn-status-pill').length === 1);
  await settle(20);
  tree = panel.render();
  check(
    'harness auto-check update badge',
    byClass(tree, 'dshqn-update-badge').length === 1 && textOf(tree).includes('LBL:harnessUpdateBadge'),
    String(byClass(tree, 'dshqn-update-badge').length),
  );
  check('tab icons', byClass(byClass(tree, 'dshqn-tabs')[0], 'dshqn-icon').length >= 5);
  check('tabs include records/value', byClass(tree, 'dshqn-tab').length >= 6);
  check(
    'knowledge tab merges notes/cards',
    byClass(tree, 'dshqn-tab').some((tab) => textOf(tab) === 'LBL:viewKnowledge') &&
      !byClass(tree, 'dshqn-tab').some((tab) => ['LBL:viewNotes', 'LBL:viewCards'].includes(textOf(tab))),
  );
  check(
    'calendar merged into task',
    !byClass(tree, 'dshqn-tab').some((tab) => textOf(tab) === 'LBL:viewCalendar'),
  );
  check(
    'overview tab merges all table',
    !byClass(tree, 'dshqn-tab').some((tab) => textOf(tab) === 'LBL:viewAll') &&
      byClass(tree, 'dshqn-subtabs').some((wrapper) =>
        byClass(wrapper, 'dshqn-filter').some((button) => textOf(button) === 'LBL:viewAll'),
      ),
  );
  check(
    'insights tab merges system/usage/value',
    byClass(tree, 'dshqn-tab').some((tab) => textOf(tab) === 'LBL:viewInsights') &&
      !byClass(tree, 'dshqn-tab').some((tab) =>
        ['LBL:viewValue', 'LBL:viewUsage', 'LBL:viewSystem'].includes(textOf(tab)),
      ),
  );
  check('overview type shortcut', textOf(tree).includes('客户'));

  // command palette: header button, filtering, keyboard selection, Ctrl+K shortcut
  window.emit('keydown', { key: '?', target: { tagName: 'DIV' }, ctrlKey: false, metaKey: false, altKey: false, preventDefault: () => {} });
  tree = panel.render();
  check(
    'shortcut help overlay',
    textOf(tree).includes('LBL:shortcutTitle') && textOf(tree).includes('LBL:shortcutPalette') && textOf(tree).includes('LBL:shortcutRate'),
  );
  window.emit('keydown', { key: 'Escape', target: { tagName: 'DIV' }, preventDefault: () => {} });
  tree = panel.render();
  check('shortcut help closes', !textOf(tree).includes('LBL:shortcutTitle'));
  const paletteButton = byClass(tree, 'dshqn-button').find((button) => button.props['aria-label'] === 'LBL:paletteOpen');
  check('palette button present', Boolean(paletteButton));
  paletteButton.props.onClick();
  tree = panel.render();
  check('palette opens', byClass(tree, 'dshqn-palette').length === 1);
  byClass(tree, 'dshqn-palette-input')[0].props.onChange({ target: { value: '张三' } });
  tree = panel.render();
  check(
    'palette filters items',
    byClass(tree, 'dshqn-palette-item').some((item) => textOf(item).includes('张三')),
    String(byClass(tree, 'dshqn-palette-item').length),
  );
  byClass(tree, 'dshqn-palette-input')[0].props.onKeyDown({ key: 'Enter', preventDefault() {} });
  tree = panel.render();
  await settle();
  tree = panel.render();
  check('palette selection closes palette', byClass(tree, 'dshqn-palette').length === 0);
  window.emit('keydown', { key: 'k', ctrlKey: true, preventDefault() {} });
  tree = panel.render();
  check('palette shortcut opens', byClass(tree, 'dshqn-palette').length === 1);
  byClass(tree, 'dshqn-palette-input')[0].props.onKeyDown({ key: 'Escape', preventDefault() {} });
  tree = panel.render();

  // records tab
  const recordsTab = byClass(tree, 'dshqn-tab').find((tab) => textOf(tab) === 'LBL:viewRecords');
  recordsTab.props.onClick();
  tree = panel.render();
  await settle();
  tree = panel.render();
  check('records tab rows', byClass(tree, 'dshqn-all-row').length === 2, String(byClass(tree, 'dshqn-all-row').length));

  // value tab trend + archive (inside the merged Insights tab)
  byClass(tree, 'dshqn-tab').find((tab) => textOf(tab) === 'LBL:viewInsights').props.onClick();
  tree = panel.render();
  byClass(tree, 'dshqn-filter').find((button) => textOf(button) === 'LBL:viewValue').props.onClick();
  tree = panel.render();
  await settle(20);
  tree = panel.render();
  const trend = byClass(tree, 'dshqn-trend')[0];
  check('value trend rendered', Boolean(trend));
  check('value trend lines', byClass(trend, 'dshqn-trend-line').length === 2, String(byClass(trend, 'dshqn-trend-line').length));
  check('value cards', byClass(tree, 'dshqn-value-card').length === 2);
  const archiveButton = byClass(tree, 'dshqn-button').find((button) => textOf(button) === 'LBL:valueArchive');
  check('archive button present', Boolean(archiveButton));
  archiveButton.props.onClick();
  tree = panel.render();
  await settle();
  const archived = server.doc.items.find((item) => item.tags && item.tags.includes('价值报告'));
  check('report archived as note', archived !== undefined && archived.kind === 'note' && archived.body.startsWith('# LBL:valueReportTitle'));
  check('social deep evaluation rendered', byClass(tree, 'dshqn-social-deep').length === 2, String(byClass(tree, 'dshqn-social-deep').length));
  check('social dimension bars', byClass(tree, 'dshqn-social-dim').length >= 7, String(byClass(tree, 'dshqn-social-dim').length));
  check('social suggestions shown', textOf(tree).includes('LBL:socialSuggestAddTests') || textOf(tree).includes('LBL:valueSocialSuggestions'));
  check(
    'value high-value vs high-cost split',
    textOf(tree).includes('LBL:valueHighValueWorkspaces') && textOf(tree).includes('LBL:valueHighCostWorkspaces'),
    textOf(tree).slice(-200),
  );

  // merged Insights -> Usage detail
  byClass(tree, 'dshqn-filter').find((button) => textOf(button) === 'LBL:viewUsage').props.onClick();
  tree = panel.render();
  await settle(20);
  tree = panel.render();
  check('usage daily chart', byClass(tree, 'dshqn-usage-daily').length === 1);
  check('usage top sessions', byClass(tree, 'dshqn-usage-session').length === 1, String(byClass(tree, 'dshqn-usage-session').length));
  check('usage cache hit KPI', textOf(tree).includes('LBL:usageCacheHit'));
  check(
    'usage workspace trend / forecast / session rank',
    textOf(tree).includes('LBL:usageWorkspaceCostTrend') && textOf(tree).includes('LBL:usageCostForecast') && textOf(tree).includes('#1'),
    textOf(tree).slice(-220),
  );
  byClass(tree, 'dshqn-filter').find((button) => textOf(button) === 'LBL:viewValue').props.onClick();
  tree = panel.render();

  // Harness version manager (System sub-tab)
  byClass(tree, 'dshqn-filter').find((button) => textOf(button) === 'LBL:viewSystem').props.onClick();
  tree = panel.render();
  await settle(20);
  tree = panel.render();
  const harnessSection = byClass(tree, 'dshqn-harness')[0];
  check('harness manager renders', harnessSection !== undefined && textOf(harnessSection).includes('LBL:harnessTitle'));
  check(
    'system budget / savings entry',
    textOf(tree).includes('LBL:systemSavings') && textOf(tree).includes('LBL:systemOpenOptimizer'),
    textOf(tree).slice(-220),
  );
  byClass(harnessSection, 'dshqn-button').find((button) => textOf(button) === 'LBL:harnessOfficialTemplate').props.onClick();
  tree = panel.render();
  const templateSection = byClass(tree, 'dshqn-harness')[0];
  const templateUrl = byClass(templateSection, 'dshqn-field')[0].props.value;
  check('harness official template fills feed', templateUrl.indexOf('https://example.com/deepseek-harness/') === 0, String(templateUrl));
  check('harness template feed warning', textOf(tree).includes('LBL:harnessFeedTemplateWarning'));
  check('harness manifest template collapsed', byClass(tree, 'dshqn-manifest-template').length === 0);
  byClass(tree, 'dshqn-button').find((button) => textOf(button) === 'LBL:harnessShowTemplate').props.onClick();
  tree = panel.render();
  check('harness manifest template expands', byClass(tree, 'dshqn-manifest-template').length === 1);
  byClass(tree, 'dshqn-button').find((button) => textOf(button) === 'LBL:harnessHideTemplate').props.onClick();
  tree = panel.render();
  check('harness manifest template collapses', byClass(tree, 'dshqn-manifest-template').length === 0);
  const harnessFeedInput = byClass(byClass(tree, 'dshqn-harness')[0], 'dshqn-field')[0];
  check('harness feed input', Boolean(harnessFeedInput));
  harnessFeedInput.props.onChange({ target: { value: 'https://feed.test/latest.json' } });
  tree = panel.render();
  const harnessFeedAfter = byClass(tree, 'dshqn-harness')[0];
  const feedValue = harnessFeedAfter === undefined ? 'missing' : byClass(harnessFeedAfter, 'dshqn-field')[0].props.value;
  check('harness feed state persists', feedValue === 'https://feed.test/latest.json', String(feedValue));
  byClass(tree, 'dshqn-button').find((button) => textOf(button) === 'LBL:harnessSaveFeed').props.onClick();
  await settle();
  tree = panel.render();
  byClass(tree, 'dshqn-button').find((button) => textOf(button) === 'LBL:harnessCheck').props.onClick();
  await settle(20);
  tree = panel.render();
  check(
    'harness update check result',
    byClass(tree, 'dshqn-harness-manifest').length === 1 && textOf(tree).includes('LBL:harnessUpdateAvailable'),
    JSON.stringify({
      manifest: byClass(tree, 'dshqn-harness-manifest').length,
      update: textOf(tree).includes('LBL:harnessUpdateAvailable'),
      noFeed: textOf(tree).includes('LBL:harnessNoFeed'),
      failed: textOf(tree).includes('LBL:harnessCheckFailed'),
      upToDate: textOf(tree).includes('LBL:harnessUpToDate'),
      latest: textOf(tree).includes('LBL:harnessLatest'),
      section: byClass(tree, 'dshqn-harness').length > 0 ? textOf(byClass(tree, 'dshqn-harness')[0]).slice(-260) : 'no-section',
    }),
  );
  check('client fetched read token', server.tokenFetches >= 1, String(server.tokenFetches));
  byClass(tree, 'dshqn-button').find((button) => textOf(button) === 'LBL:harnessCheckAndDownload').props.onClick();
  await settle(40);
  tree = panel.render();
  const approval = byClass(tree, 'dshqn-harness-approval')[0];
  check(
    'harness auto-download offers approval',
    approval !== undefined && textOf(tree).includes('LBL:harnessAutoDownloaded'),
    String(byClass(tree, 'dshqn-harness-approval').length),
  );
  const approveCheckbox = byClass(tree, 'dshqn-harness-approve-check')[0];
  check('harness approval checkbox', Boolean(approveCheckbox));
  approveCheckbox.props.onChange({ target: { checked: true } });
  tree = panel.render();
  const approveButton = byClass(tree, 'dshqn-button').find((button) => textOf(button) === 'LBL:harnessApproveInstall');
  check('harness approve button enabled', approveButton !== undefined && approveButton.props.disabled === false, JSON.stringify(approveButton && approveButton.props.disabled));
  approveButton.props.onClick();
  await settle(20);
  tree = panel.render();
  check('harness approved install starts', textOf(tree).includes('LBL:harnessApproveSuccess'), textOf(tree).slice(-160));
  byClass(tree, 'dshqn-button').find((button) => textOf(button) === 'LBL:harnessUseOfficial').props.onClick();
  await settle(20);
  tree = panel.render();
  const officialFeedValue = byClass(byClass(tree, 'dshqn-harness')[0], 'dshqn-field')[0].props.value;
  check('harness official github feed fills', String(officialFeedValue).indexOf('api.github.com') > 0, String(officialFeedValue));
  byClass(tree, 'dshqn-button').find((button) => textOf(button) === 'LBL:harnessCheckAndDownload').props.onClick();
  await settle(40);
  tree = panel.render();
  check('harness official release without asset guided', textOf(tree).includes('LBL:harnessNoAsset'), textOf(tree).slice(-200));
  const officialPageLink = byClass(tree, 'dshqn-button').find((button) => textOf(button) === 'LBL:harnessOfficialDownload');
  check(
    'harness official download page link',
    officialPageLink !== undefined &&
      officialPageLink.props.href === 'https://www.deepseek.com/download/' &&
      officialPageLink.props.target === '_blank',
    JSON.stringify(officialPageLink && officialPageLink.props.href),
  );
  check(
    'harness official source badge',
    textOf(tree).includes('LBL:harnessOfficialSource'),
  );
  byClass(tree, 'dshqn-button').find((button) => textOf(button) === 'LBL:harnessDirectButton').props.onClick();
  await settle(60);
  tree = panel.render();
  check(
    'harness official direct installer staged',
    textOf(tree).includes('LBL:harnessDirectSource') && textOf(tree).includes('LBL:harnessDirectDownloaded'),
    textOf(tree).slice(-200),
  );
  const directApproveCheckbox = byClass(tree, 'dshqn-harness-approve-check')[0];
  check('harness official direct approval checkbox', Boolean(directApproveCheckbox));
  directApproveCheckbox.props.onChange({ target: { checked: true } });
  tree = panel.render();
  const directApproveButton = byClass(tree, 'dshqn-button').find((button) => textOf(button) === 'LBL:harnessApproveInstall');
  check(
    'harness official direct approval enabled',
    directApproveButton !== undefined && directApproveButton.props.disabled === false,
    JSON.stringify(directApproveButton && directApproveButton.props.disabled),
  );
  directApproveButton.props.onClick();
  await settle(20);
  tree = panel.render();
  check('harness official direct install starts', textOf(tree).includes('LBL:harnessApproveSuccess'), textOf(tree).slice(-160));
  byClass(tree, 'dshqn-button').find((button) => textOf(button) === 'LBL:otherVersions').props.onClick();
  await settle(20);
  tree = panel.render();
  check(
    'release list rendered',
    byClass(tree, 'dshqn-release-row').length >= 2 && textOf(tree).includes('LBL:releasePrerelease'),
    String(byClass(tree, 'dshqn-release-row').length),
  );
  const customSection = byClass(tree, 'dshqn-harness-custom')[0];
  const customFields = customSection === undefined ? [] : byClass(customSection, 'dshqn-field');
  check('custom installer inputs', customFields.length === 2, String(customFields.length));
  customFields[0].props.onChange({ target: { value: 'https://custom.test/setup.exe' } });
  tree = panel.render();
  byClass(byClass(tree, 'dshqn-harness-custom')[0], 'dshqn-button')[0].props.onClick();
  await settle(20);
  tree = panel.render();
  check(
    'custom installer staged',
    textOf(tree).includes('LBL:customSource') && textOf(tree).includes('LBL:customDownloaded'),
    textOf(tree).slice(-200),
  );
  const customApproveCheckbox = byClass(tree, 'dshqn-harness-approve-check')[0];
  customApproveCheckbox.props.onChange({ target: { checked: true } });
  tree = panel.render();
  const customApproveButton = byClass(tree, 'dshqn-button').find((button) => textOf(button) === 'LBL:harnessApproveInstall');
  check(
    'custom approval enabled',
    customApproveButton !== undefined && customApproveButton.props.disabled === false,
    JSON.stringify(customApproveButton && customApproveButton.props.disabled),
  );
  customApproveButton.props.onClick();
  await settle(20);
  tree = panel.render();
  check('custom approved install starts', textOf(tree).includes('LBL:harnessApproveSuccess'), textOf(tree).slice(-160));
  check(
    'value request carries token',
    server.valueHeaders.some((headers) => headers['x-quick-note-token'] === 'test-token'),
    JSON.stringify(server.valueHeaders.slice(-1)),
  );
  server.token = 'rotated';
  tree = clickKnowledge(tree, panel, 'notes');
  byClass(tree, 'dshqn-tab').find((tab) => textOf(tab) === 'LBL:viewInsights').props.onClick();
  tree = panel.render();
  byClass(tree, 'dshqn-tab').find((tab) => textOf(tab) === 'LBL:viewInsights').props.onClick();
  tree = panel.render();
  byClass(tree, 'dshqn-filter').find((button) => textOf(button) === 'LBL:viewValue').props.onClick();
  tree = panel.render();
  await settle(20);
  tree = panel.render();
  check(
    'token refreshed after 401',
    server.valueStatuses.includes(401) && server.valueStatuses.includes(200),
    JSON.stringify(server.valueStatuses),
  );

  // pinned items via quick add
  byClass(tree, 'dshqn-tab').find((tab) => textOf(tab) === 'LBL:viewOverview').props.onClick();
  tree = panel.render();
  const quickNoteCard = byClass(tree, 'dshqn-quick-card').find((card) => textOf(card).startsWith('LBL:newNote'));
  check('quick card new note', Boolean(quickNoteCard));
  quickNoteCard.props.onClick();
  tree = panel.render();
  byClass(tree, 'dshqn-title-input')[0].props.onChange({ target: { value: 'PinnedNote' } });
  tree = panel.render();
  const pinButton = byClass(tree, 'dshqn-pin-button')[0];
  check('pin button present', Boolean(pinButton));
  pinButton.props.onClick();
  tree = panel.render();
  byClass(tree, 'dshqn-tab').find((tab) => textOf(tab) === 'LBL:viewOverview').props.onClick();
  tree = panel.render();
  check(
    'overview pinned section',
    textOf(tree).includes('LBL:overviewPinned') && textOf(tree).includes('PinnedNote'),
    textOf(tree).slice(0, 120),
  );

  // task due presets
  byClass(tree, 'dshqn-quick-card').find((card) => textOf(card).startsWith('LBL:newTask')).props.onClick();
  tree = panel.render();
  check('due presets present', byClass(tree, 'dshqn-due-presets').length === 1);
  byClass(tree, 'dshqn-filter').find((button) => textOf(button) === 'LBL:dueTomorrow').props.onClick();
  tree = panel.render();
  await settle();
  const taskItem = server.doc.items.find((item) => item.kind === 'task');
  const tomorrow = new Date();
  tomorrow.setHours(18, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  check(
    'due preset sets tomorrow 18:00',
    taskItem !== undefined && taskItem.due !== null && Math.abs(taskItem.due - tomorrow.getTime()) < 60000,
    String(taskItem && taskItem.due),
  );

  // task checklist, repeat schedule, and completion stats
  check('task checklist panel', byClass(tree, 'dshqn-checklist').length === 1);
  byClass(tree, 'dshqn-checklist-add')[0].children.find((child) => child.type === 'input').props.onChange({ target: { value: 'step-1' } });
  tree = panel.render();
  byClass(tree, 'dshqn-button').find((button) => textOf(button) === 'LBL:addSubtask').props.onClick();
  tree = panel.render();
  check('checklist row added', byClass(tree, 'dshqn-checklist-row').length === 1);
  const repeatSelect = byClass(tree, 'dshqn-select')[0];
  check('repeat select present', Boolean(repeatSelect));
  repeatSelect.props.onChange({ target: { value: 'daily' } });
  tree = panel.render();
  await settle();
  const taskAfterEdits = server.doc.items.find((item) => item.kind === 'task');
  check('checklist and repeat saved', taskAfterEdits.checklist.length === 1 && taskAfterEdits.repeat === 'daily', JSON.stringify(taskAfterEdits && { checklist: taskAfterEdits.checklist.length, repeat: taskAfterEdits.repeat }));
  check(
    'client uses PATCH diff writes',
    server.patchHeaders.length > 0 && server.patchHeaders.some((entry) => entry['if-match'] !== undefined),
    String(server.patchHeaders.length),
  );
  check(
    'task completion stats',
    textOf(tree).includes('LBL:taskStatsToday') && textOf(tree).includes('LBL:taskStatsWeek'),
    textOf(tree).slice(0, 120),
  );

  // calendar view lives inside the task module as a layout
  tree = clickTaskCalendar(tree, panel);
  check('calendar view renders', byClass(tree, 'dshqn-calendar').length === 1);
  check('calendar grid days', byClass(tree, 'dshqn-calendar-day').length === 42, String(byClass(tree, 'dshqn-calendar-day').length));
  check('calendar event chip', byClass(tree, 'dshqn-calendar-chip').length >= 1, String(byClass(tree, 'dshqn-calendar-chip').length));
  const monthLabelBefore = textOf(byClass(tree, 'dshqn-calendar-month')[0]);
  const gridStartBefore = byClass(tree, 'dshqn-calendar-day')[0].props['aria-label'];
  byClass(tree, 'dshqn-button').find((button) => button.props['aria-label'] === '›').props.onClick();
  tree = panel.render();
  const gridStartAfter = byClass(tree, 'dshqn-calendar-day')[0].props['aria-label'];
  check('calendar month navigation', gridStartAfter !== gridStartBefore, JSON.stringify({ before: gridStartBefore, after: gridStartAfter }));
  byClass(tree, 'dshqn-button').find((button) => textOf(button) === 'LBL:calendarToday').props.onClick();
  tree = panel.render();
  check(
    'calendar today restores month',
    textOf(byClass(tree, 'dshqn-calendar-month')[0]) === monthLabelBefore &&
      byClass(tree, 'dshqn-calendar-day')[0].props['aria-label'] === gridStartBefore,
  );
  check('plan timeline rendered', byClass(tree, 'dshqn-plan-timeline').length === 1);
  byClass(tree, 'dshqn-tab').find((tab) => textOf(tab) === 'LBL:viewOverview').props.onClick();
  tree = panel.render();
  const overviewBar = byClass(tree, 'dshqn-subtabs')[0];
  byClass(overviewBar, 'dshqn-filter').find((button) => textOf(button) === 'LBL:viewAll').props.onClick();
  tree = panel.render();
  await settle(5);
  tree = panel.render();
  check('overview all subview rows', byClass(tree, 'dshqn-all-row').length >= 1, String(byClass(tree, 'dshqn-all-row').length));
  byClass(tree, 'dshqn-tab').find((tab) => textOf(tab) === 'LBL:viewOverview').props.onClick();
  tree = panel.render();

  // review session: goal bar, rating, undo
  byClass(tree, 'dshqn-tab').find((tab) => textOf(tab) === 'LBL:viewOverview').props.onClick();
  tree = panel.render();
  byClass(tree, 'dshqn-quick-card').find((card) => textOf(card).startsWith('LBL:newCard')).props.onClick();
  tree = panel.render();
  tree = clickKnowledge(tree, panel, 'review');
  check(
    'review mode chips',
    ['LBL:reviewModeDue', 'LBL:reviewModeNew', 'LBL:reviewModeAll'].every((label) =>
      byClass(tree, 'dshqn-filter').some((button) => textOf(button) === label),
    ),
  );
  const startReviewButton = byClass(tree, 'dshqn-button').find((button) => textOf(button) === 'LBL:startReview');
  check('review start button', Boolean(startReviewButton));
  startReviewButton.props.onClick();
  tree = panel.render();
  check('review goal bar', byClass(tree, 'dshqn-review-bar-fill').length === 1);
  byClass(tree, 'dshqn-button').find((button) => textOf(button) === 'LBL:focusMode').props.onClick();
  tree = panel.render();
  check('focus mode applied', String(byClass(tree, 'dshqn-page')[0].props.className).includes('dshqn-focus'));
  byClass(tree, 'dshqn-button').find((button) => textOf(button) === 'LBL:focusExit').props.onClick();
  tree = panel.render();
  check('focus mode exits', !String(byClass(tree, 'dshqn-page')[0].props.className).includes('dshqn-focus'));
  byClass(tree, 'dshqn-button').find((button) => textOf(button) === 'LBL:showAnswer').props.onClick();
  tree = panel.render();
  byClass(tree, 'dshqn-button').find((button) => textOf(button) === 'LBL:rateGood').props.onClick();
  tree = panel.render();
  const undoButton = byClass(tree, 'dshqn-button').find((button) => textOf(button) === 'LBL:reviewUndo');
  check('review undo button', Boolean(undoButton));
  undoButton.props.onClick();
  tree = panel.render();
  await settle();
  const cardAfterUndo = server.doc.items.find((item) => item.kind === 'card' && item.id !== 'c0');
  check(
    'review undo reverts review',
    cardAfterUndo !== undefined && cardAfterUndo.review.repetitions === 0,
    JSON.stringify(cardAfterUndo && cardAfterUndo.review),
  );
  check(
    'review undo keeps review log',
    Array.isArray(server.doc.reviews) && server.doc.reviews.length === 2,
    String(server.doc.reviews && server.doc.reviews.length),
  );

  // health reference range inputs and normal badge
  byClass(tree, 'dshqn-tab').find((tab) => textOf(tab) === 'LBL:viewHealth').props.onClick();
  tree = panel.render();
  check('health range inputs', byClass(tree, 'dshqn-range-group').length === 1 && byClass(tree, 'dshqn-range-input').length === 2);
  byClass(tree, 'dshqn-range-input')[0].props.onChange({ target: { value: '60' } });
  tree = panel.render();
  byClass(tree, 'dshqn-range-input')[1].props.onChange({ target: { value: '90' } });
  tree = panel.render();
  const metricCard = byClass(tree, 'dshqn-overview-card')[0];
  check('metric overview card', Boolean(metricCard));
  metricCard.props.onClick();
  tree = panel.render();
  check('metric range badge normal', textOf(tree).includes('LBL:rangeNormal'), textOf(tree).slice(0, 120));

  // settings section
  const settings = createRenderer(registrations.get('settings.section'), React);
  let settingsTree = settings.render();
  await settle();
  settingsTree = settings.render();
  check('settings renders', byClass(settingsTree, 'dshqn-settings').length === 1);
  check('settings header', byClass(settingsTree, 'dshqn-settings-head').length === 1);
  check('settings module checkboxes', byClass(settingsTree, 'dshqn-settings-row').length >= 6, String(byClass(settingsTree, 'dshqn-settings-row').length));
  check(
    'backup section present',
    textOf(settingsTree).includes('LBL:backupTitle') &&
      byClass(settingsTree, 'dshqn-button').some((button) => textOf(button) === 'LBL:backupNow') &&
      textOf(settingsTree).includes('LBL:backupInterval') &&
      textOf(settingsTree).includes('LBL:backupProgress') &&
      textOf(settingsTree).includes('LBL:shortcutCustomTitle'),
  );
  check(
    'markdown section present',
    textOf(settingsTree).includes('LBL:markdownTitle') &&
      byClass(settingsTree, 'dshqn-button').some((button) => textOf(button) === 'LBL:markdownExport') &&
      byClass(settingsTree, 'dshqn-button').some((button) => textOf(button) === 'LBL:markdownImport'),
  );
  check('write mode control present', textOf(settingsTree).includes('LBL:writeModeTitle'));
  check(
    'share snapshot section present',
    textOf(settingsTree).includes('LBL:shareTitle') &&
      byClass(settingsTree, 'dshqn-button').some((button) => textOf(button) === 'LBL:shareCreate'),
  );
  const compactButton = byClass(settingsTree, 'dshqn-filter').find((button) => textOf(button) === 'LBL:densityCompact');
  check('density control present', Boolean(compactButton));
  compactButton.props.onClick();
  settingsTree = settings.render();
  check('compact density applied to settings', byClass(settingsTree, 'dshqn-compact').length === 1);
  tree = panel.render();
  check('compact density applied to panel', byClass(tree, 'dshqn-compact').length === 1);
  const accentSwatches = byClass(settingsTree, 'dshqn-accent-swatch');
  check('accent swatches present', accentSwatches.length === 4, String(accentSwatches.length));
  const greenSwatch = accentSwatches.find((swatch) => swatch.props['aria-label'] === 'LBL:accentSuccess');
  greenSwatch.props.onClick();
  settingsTree = settings.render();
  tree = panel.render();
  const accentPage = byClass(tree, 'dshqn-page')[0];
  check(
    'accent preset applied',
    accentPage.props.style !== undefined && accentPage.props.style['--dshqn-accent'] === 'var(--dsw-alias-state-success-primary)',
    JSON.stringify(accentPage.props.style || null),
  );
  const colorInput = byClass(settingsTree, 'dshqn-accent-input')[0];
  colorInput.props.onChange({ target: { value: '#12ab34' } });
  tree = panel.render();
  const accentPage2 = byClass(tree, 'dshqn-page')[0];
  check(
    'custom accent applied',
    accentPage2.props.style !== undefined && accentPage2.props.style['--dshqn-accent'] === '#12ab34',
    JSON.stringify(accentPage2.props.style || null),
  );

  // optimistic locking conflict resolution scenario
  const conflictDoc = {
    revision: 5,
    items: [plainNote('a', 'A', 2), plainNote('b', 'B', 1), plainNote('d', 'D', 2)],
    settings: { brief: true, pricing: { inputHit: 0.04, inputMiss: 2, output: 8 }, workspaceNotes: {}, valueHistory: {} },
    reviews: [],
    types: [],
    file: 'D:/fake/items.json',
  };
  const conflictServer = makeServer(conflictDoc);
  const React2 = createReactStub();
  const { window: window2 } = createBrowserStub(conflictServer);
  const regs2 = loadClient(window2, React2);
  const panel2 = createRenderer(regs2.get('main'), React2);
  let tree2 = panel2.render();
  await settle();
  tree2 = panel2.render();
  tree2 = clickKnowledge(tree2, panel2, 'notes');
  const conflictTitleInput = byClass(tree2, 'dshqn-title-input')[0];
  check('conflict scenario editor', Boolean(conflictTitleInput));
  conflictTitleInput.props.onChange({ target: { value: 'A-local' } });
  tree2 = panel2.render();
  const rowD = byClass(tree2, 'dshqn-row').find((row) => textOf(row).includes('D'));
  rowD.props.onClick();
  tree2 = panel2.render();
  const titleInputD = byClass(tree2, 'dshqn-title-input')[0];
  titleInputD.props.onChange({ target: { value: 'D-local' } });
  tree2 = panel2.render();
  const rowB = byClass(tree2, 'dshqn-row').find((row) => textOf(row).includes('B'));
  rowB.props.onClick();
  tree2 = panel2.render();
  const deleteStart = byClass(tree2, 'dshqn-button').find((button) => textOf(button) === 'LBL:deleteItem');
  deleteStart.props.onClick();
  tree2 = panel2.render();
  const deleteConfirm = byClass(tree2, 'dshqn-button').find((button) => textOf(button) === 'LBL:deleteConfirm');
  deleteConfirm.props.onClick();
  tree2 = panel2.render();
  // simulate an agent write that happens before the debounced panel flush
  conflictServer.doc.revision = 6;
  conflictServer.doc.items = [
    plainNote('a', 'A-remote', 3),
    plainNote('b', 'B-remote', 3),
    plainNote('c', 'C-agent', 4),
    { ...plainNote('d', 'D-agent', 3), updatedAt: Date.now() + 5000 },
  ];
  await settle(40);
  const finalItems = conflictServer.doc.items;
  const localA = finalItems.find((item) => item.id === 'a');
  const agentC = finalItems.find((item) => item.id === 'c');
  const remoteD = finalItems.find((item) => item.id === 'd');
  check('conflict merge keeps local edit', localA !== undefined && localA.title === 'A-local', localA && localA.title);
  check('conflict merge keeps agent addition', agentC !== undefined);
  check('conflict merge honors newer remote edit', remoteD !== undefined && remoteD.title === 'D-agent', remoteD && remoteD.title);
  check('conflict merge honors local deletion', finalItems.find((item) => item.id === 'b') !== undefined && typeof finalItems.find((item) => item.id === 'b').deletedAt === 'number', JSON.stringify((finalItems.find((item) => item.id === 'b') || {}).deletedAt));
  check('deleted item hidden in UI', !textOf(tree2).includes('B-remote') && !textOf(tree2).includes('B-local'));
  check('conflict retry advanced revision', conflictServer.doc.revision >= 7, String(conflictServer.doc.revision));
  check(
    'client sent If-Match',
    conflictServer.putHeaders.length > 0 && conflictServer.putHeaders[0]['if-match'] !== undefined,
    JSON.stringify(conflictServer.putHeaders[0] || {}),
  );
  tree2 = panel2.render();
  await settle();
  tree2 = panel2.render();
  check('conflict merge shown in UI', textOf(tree2).includes('C-agent'), textOf(tree2).slice(0, 120));

  // capture slots: sidebar session action, composer dock, composer quick-capture button
  const sessionRowReg = registrations.get('sidebar.workspaces.session.row.action');
  check('session row action registered', Boolean(sessionRowReg));
  const sessionRowPanel = createRenderer(sessionRowReg, React);
  let rowTree = sessionRowPanel.render({ t: (key) => 'LBL:' + key, sessionId: 'session-xyz', displayTitle: '测试会话' });
  check('session row action renders', byClass(rowTree, 'dshqn-session-save').length === 1);
  byClass(rowTree, 'dshqn-session-save')[0].props.onClick();
  await settle();
  const sessionNote = server.doc.items.find((item) => typeof item.body === 'string' && item.body.includes('session-xyz'));
  check('session row action saves note', sessionNote !== undefined && sessionNote.tags.includes('会话'));
  rowTree = sessionRowPanel.render({ t: (key) => 'LBL:' + key, sessionId: 'session-xyz', displayTitle: '测试会话' });
  const dockReg = registrations.get('conversation.composer.dock');
  const dockPanel = createRenderer(dockReg, React);
  let dockTree = dockPanel.render({ t: (key) => 'LBL:' + key });
  await settle();
  dockTree = dockPanel.render({ t: (key) => 'LBL:' + key });
  check('composer dock renders counts', byClass(dockTree, 'dshqn-dock-chip').length === 1);
  const captureReg = registrations.byId.get('conversation.input.left#quick-note-capture');
  const capturePanel = createRenderer(captureReg, React);
  const captureTree = capturePanel.render({ t: (key) => 'LBL:' + key });
  check('quick capture button renders', byClass(captureTree, 'dshqn-capture-button').length === 1);
  const voiceReg = registrations.get('conversation.input.left');
  const voicePanel = createRenderer(voiceReg, React);
  const voiceTree = voicePanel.render({ t: (key) => 'LBL:' + key });
  check('voice capture button renders', byClass(voiceTree, 'dshqn-voice-button').length === 1);

  // attachments: editor renders image refs and removal persists
  const attachDoc = {
    revision: 2,
    items: [
      {
        ...plainNote('att', '附件笔记', now),
        attachments: [{ id: '11111111-1111-4111-8111-111111111111.png', name: '图.png', size: 4, mediaType: 'image/png' }],
      },
    ],
    settings: { brief: true, pricing: { inputHit: 0.04, inputMiss: 2, output: 8 }, workspaceNotes: {}, valueHistory: {} },
    reviews: [],
    types: [],
    file: 'D:/fake/items.json',
  };
  const attachServer = makeServer(attachDoc);
  const React3 = createReactStub();
  const { window: window3 } = createBrowserStub(attachServer);
  const regs3 = loadClient(window3, React3);
  const attachPanel = createRenderer(regs3.get('main'), React3);
  let attachTree = attachPanel.render();
  await settle(20);
  attachTree = clickKnowledge(attachTree, attachPanel, 'notes');
  await settle(20);
  attachTree = attachPanel.render();
  check('attachment editor renders', byClass(attachTree, 'dshqn-attachments').length === 1, String(byClass(attachTree, 'dshqn-attachments').length));
  const attachImage = byClass(attachTree, 'dshqn-attach-image')[0];
  const attachImgNodes = nodesOfType(attachTree, 'img');
  check('attachment image url carries token', Boolean(attachImage) && attachImgNodes.length === 1 && String(attachImgNodes[0].props.src).includes('token='), JSON.stringify(attachImgNodes[0] && attachImgNodes[0].props.src));
  const attachRemove = byClass(attachTree, 'dshqn-attach-remove')[0];
  check('attachment remove control', Boolean(attachRemove));
  attachRemove.props.onClick();
  await settle(20);
  const savedAttachmentDoc = attachServer.doc.items.find((item) => item.id === 'att');
  check('attachment removed and persisted', savedAttachmentDoc !== undefined && savedAttachmentDoc.attachments.length === 0, JSON.stringify(savedAttachmentDoc && savedAttachmentDoc.attachments));

  // virtualization: 300 notes render a windowed slice, not every row
  const manyItems = Array.from({ length: 300 }, (_, index) => plainNote('v' + index, '条目 ' + index, now - index));
  const manyServer = makeServer({ ...attachDoc, revision: 4, items: manyItems });
  const React4 = createReactStub();
  const { window: window4 } = createBrowserStub(manyServer);
  const regs4 = loadClient(window4, React4);
  const manyPanel = createRenderer(regs4.get('main'), React4);
  let manyTree = manyPanel.render();
  await settle(20);
  manyTree = clickKnowledge(manyTree, manyPanel, 'notes');
  await settle(20);
  manyTree = manyPanel.render();
  const rowCount = byClass(manyTree, 'dshqn-row').length;
  check('long list virtualized', byClass(manyTree, 'dshqn-virtual').length === 1 && rowCount > 0 && rowCount < 100, String(rowCount));

  // due reminder includes due review cards
  const reminderReg = registrations.get('shell.overlay');
  const reminderPanel = createRenderer(reminderReg, React);
  let reminderTree = reminderPanel.render({ t: (key) => 'LBL:' + key, selectPanel() {} });
  await settle(20);
  reminderTree = reminderPanel.render({ t: (key) => 'LBL:' + key, selectPanel() {} });
  check('reminder includes due cards', textOf(reminderTree).includes('LBL:reminderCards'), textOf(reminderTree).slice(0, 160));

  const renderStart = Date.now();
  panel.render();
  const renderMs = Date.now() - renderStart;
  check('panel render budget under 100ms', renderMs < 100, renderMs + 'ms');

  // optimizer merged into the Insights tab
  let mergedTree = panel.render();
  const insightsTab = byClass(mergedTree, 'dshqn-tab').find((element) => textOf(element) === 'LBL:viewInsights');
  check('insights tab present', Boolean(insightsTab));
  insightsTab.props.onClick();
  mergedTree = panel.render();
  const optimizerSubTab = byClass(mergedTree, 'dshqn-filter').find((element) => textOf(element) === 'LBL:optimizerTitle');
  check('optimizer subtab present', Boolean(optimizerSubTab));
  optimizerSubTab.props.onClick();
  mergedTree = panel.render();
  await settle(30);
  mergedTree = panel.render();
  check(
    'optimizer merged into insights',
    textOf(mergedTree).includes('LBL:optimizerEfficiencyTitle') &&
      textOf(mergedTree).includes('LBL:optimizerCleanupTitle') &&
      textOf(mergedTree).includes('LBL:optimizerCatWorkspaceJunk'),
    textOf(mergedTree).slice(-260),
  );
  check('optimizer budget control', textOf(mergedTree).includes('LBL:optimizerBudget'));
  check(
    'auto savings panel',
    textOf(mergedTree).includes('LBL:optimizerAutoSavingsTitle') &&
      textOf(mergedTree).includes('LBL:optimizerAutoCompaction') &&
      textOf(mergedTree).includes('LBL:optimizerContextPressure') &&
      textOf(mergedTree).includes('LBL:optimizerCompressible') &&
      textOf(mergedTree).includes('LBL:optimizerBudgetStatus'),
    textOf(mergedTree).slice(-260),
  );
  check(
    'optimizer savings visualization',
    textOf(mergedTree).includes('LBL:optimizerSavingsPotential') &&
      textOf(mergedTree).includes('LBL:optimizerCostBreakdown') &&
      textOf(mergedTree).includes('LBL:optimizerCostProjection') &&
      textOf(mergedTree).includes('LBL:optimizerProjectionSaving') &&
      textOf(mergedTree).includes('LBL:optimizerWorkspaceCostBars') &&
      textOf(mergedTree).includes('LBL:optimizerCacheTrend30') &&
      textOf(mergedTree).includes('LBL:optimizerSavingsDetail') &&
      textOf(mergedTree).includes('LBL:optimizerActualCost') &&
      textOf(mergedTree).includes('LBL:optimizerBaselineCost') &&
      textOf(mergedTree).includes('LBL:optimizerModelCandidates') &&
      textOf(mergedTree).includes('LBL:optimizerSavingsEffect') &&
      textOf(mergedTree).includes('LBL:optimizerRecommendationSaving'),
    textOf(mergedTree).slice(-300),
  );
  const savingsButton = byClass(mergedTree, 'dshqn-button').find((button) => textOf(button) === 'LBL:optimizerSavingsDetail');
  check('optimizer savings detail button', Boolean(savingsButton));
  if (savingsButton) {
    savingsButton.props.onClick();
    mergedTree = panel.render();
    check(
      'optimizer savings detail expands',
      textOf(mergedTree).includes('LBL:optimizerSavingsFormulaTitle') && textOf(mergedTree).includes('LBL:optimizerInputTokens'),
      textOf(mergedTree).slice(-240),
    );
  }
  check('optimizer top sessions', textOf(mergedTree).includes('LBL:optimizerTopSessions') && textOf(mergedTree).includes('ProjA'));
  check('optimizer workspace drilldown', textOf(mergedTree).includes('LBL:optimizerWorkspaces'));
  const workspaceButton = byClass(mergedTree, 'dshqn-filter').find((button) => textOf(button).includes('ProjA') && textOf(button).includes('tokens'));
  check('optimizer workspace row present', Boolean(workspaceButton));
  workspaceButton.props.onClick();
  mergedTree = panel.render();
  check('optimizer workspace sessions', textOf(mergedTree).includes('LBL:optimizerWorkspaceSessions') && textOf(mergedTree).includes('session-a1'));
  check('optimizer history', textOf(mergedTree).includes('LBL:optimizerHistory') && textOf(mergedTree).includes('LBL:optimizerHistoryNoUndo'));
  check('optimizer undo available', byClass(mergedTree, 'dshqn-optimizer-undo').length === 1);
  const sessionButton = byClass(mergedTree, 'dshqn-optimizer-session')[0];
  check('optimizer session jump button', Boolean(sessionButton));
  sessionButton.props.onClick();
  check('optimizer opens session', window.__openedSession === 'session-a1', String(window.__openedSession));
  check('optimizer export button', textOf(mergedTree).includes('LBL:optimizerExport'));
  check('optimizer share button', textOf(mergedTree).includes('LBL:optimizerShare'));
  check('optimizer monthly budget', textOf(mergedTree).includes('LBL:optimizerMonthlyBudget') && textOf(mergedTree).includes('LBL:optimizerMonthlyCurve'));
  check('optimizer schedule controls', textOf(mergedTree).includes('LBL:optimizerSchedule') && textOf(mergedTree).includes('LBL:optimizerAutoRun'));
  check('optimizer trash controls', textOf(mergedTree).includes('LBL:optimizerTrashEmpty') && textOf(mergedTree).includes('LBL:optimizerTrash'));
  check(
    'optimizer webhook and report range',
    textOf(mergedTree).includes('LBL:optimizerWebhook') &&
      textOf(mergedTree).includes('LBL:optimizerReportRange') &&
      textOf(mergedTree).includes('LBL:optimizerScheduleLast') &&
      textOf(mergedTree).includes('LBL:optimizerWebhookTemplate') &&
      textOf(mergedTree).includes('LBL:optimizerWebhookTest'),
    JSON.stringify({
      webhook: textOf(mergedTree).includes('LBL:optimizerWebhook'),
      range: textOf(mergedTree).includes('LBL:optimizerReportRange'),
      last: textOf(mergedTree).includes('LBL:optimizerScheduleLast'),
      template: textOf(mergedTree).includes('LBL:optimizerWebhookTemplate'),
      test: textOf(mergedTree).includes('LBL:optimizerWebhookTest'),
    }),
  );
  check(
    'optimizer trash records and share stats',
    textOf(mergedTree).includes('LBL:optimizerTrashRecords') &&
      textOf(mergedTree).includes('LBL:optimizerTrashRestore') &&
      textOf(mergedTree).includes('LBL:optimizerShareStats') &&
      textOf(mergedTree).includes('LBL:optimizerShareRefs') &&
      textOf(mergedTree).includes('LBL:optimizerTrashCapacityWarn') &&
      textOf(mergedTree).includes('LBL:optimizerTrashTypeAttachments') &&
      textOf(mergedTree).includes('LBL:optimizerShareCsv') &&
      textOf(mergedTree).includes('LBL:optimizerTrashWorkspace') &&
      textOf(mergedTree).includes('LBL:optimizerSharePng') &&
      textOf(mergedTree).includes('LBL:optimizerPresetSave') &&
      textOf(mergedTree).includes('我的预设') &&
      byClass(mergedTree, 'dshqn-button').some((button) => button.props.title === 'LBL:optimizerPresetMoveUp'),
    textOf(mergedTree).slice(-300),
  );
  check(
    'optimizer webhook queue records',
    textOf(mergedTree).includes('https://hook.test/budget') &&
      textOf(mergedTree).includes('LBL:optimizerWebhookQueue') &&
      textOf(mergedTree).includes('LBL:optimizerWebhookResend') &&
      textOf(mergedTree).includes('LBL:optimizerWebhookEdit'),
  );
  const cronPreviewButton = byClass(mergedTree, 'dshqn-button').find((button) => textOf(button) === 'LBL:optimizerCronPreview');
  check('optimizer cron preview button', Boolean(cronPreviewButton));
  cronPreviewButton.props.onClick();
  await settle(20);
  mergedTree = panel.render();
  check('optimizer cron preview list', textOf(mergedTree).includes('LBL:optimizerCronNext'));
  check(
    'optimizer trash pagination',
    byClass(mergedTree, 'dshqn-button').some((button) => textOf(button) === '‹') &&
      byClass(mergedTree, 'dshqn-button').some((button) => textOf(button) === '›') &&
      textOf(mergedTree).includes('1 / 2'),
  );
  check(
    'optimizer webhook failure queue',
    textOf(mergedTree).includes('LBL:optimizerWebhookQueue') &&
      byClass(mergedTree, 'dshqn-button').some((button) => textOf(button) === 'LBL:optimizerWebhookRetry') &&
      textOf(mergedTree).includes('LBL:optimizerWebhookExport') &&
      textOf(mergedTree).includes('LBL:optimizerWebhookImport') &&
      textOf(mergedTree).includes('LBL:optimizerCronMulti'),
  );
  const scheduleTab = byClass(mergedTree, 'dshqn-filter').find((button) => textOf(button) === 'LBL:scheduleLogTitle');
  check('cleanup schedule tab present', Boolean(scheduleTab));
  scheduleTab.props.onClick();
  mergedTree = panel.render();
  await settle(30);
  mergedTree = panel.render();
  check(
    'schedule log page renders',
    textOf(mergedTree).includes('LBL:scheduleLogHint') && textOf(mergedTree).includes('LBL:scheduleLogFailed') && textOf(mergedTree).includes('LBL:scheduleRetry'),
    textOf(mergedTree).slice(-300),
  );

  // review forecast + goal history (same card reviewed twice)
  const reviewDoc = {
    revision: 1,
    items: [cardItem('cf1', 'Forecast card')],
    settings: { brief: true, pricing: { inputHit: 0.04, inputMiss: 2, output: 8 }, workspaceNotes: {}, valueHistory: {} },
    reviews: [
      { itemId: 'cf1', at: now - 1 * 86400000, quality: 5 },
      { itemId: 'cf1', at: now - 3 * 86400000, quality: 3 },
    ],
    types: [recordType],
    file: 'D:/fake/items.json',
  };
  const reviewServer = makeServer(reviewDoc);
  const React6 = createReactStub();
  const { window: window6 } = createBrowserStub(reviewServer);
  const registrations6 = loadClient(window6, React6);
  const reviewPanel = createRenderer(registrations6.get('main'), React6);
  let reviewTree = reviewPanel.render();
  await settle(20);
  reviewTree = reviewPanel.render();
  reviewTree = clickKnowledge(reviewTree, reviewPanel, 'review');
  await settle(20);
  reviewTree = reviewPanel.render();
  check(
    'review forecast and goal history',
    textOf(reviewTree).includes('LBL:reviewForecastTitle') && textOf(reviewTree).includes('LBL:reviewGoalHistory'),
    textOf(reviewTree).slice(-300),
  );

  // medication adherence + intake logging
  const medDoc = {
    revision: 1,
    items: [
      {
        id: 'med1',
        kind: 'med',
        title: 'Drug A',
        body: '',
        tags: [],
        status: 'open',
        priority: 'normal',
        due: null,
        doneAt: null,
        review: { ease: 2.5, intervalDays: 0, repetitions: 0, dueAt: null, lastAt: null },
        health: {
          value: null,
          value2: null,
          unit: '',
          times: ['08:00', '20:00'],
          active: true,
          at: null,
          intakes: [{ date: new Date(now - 1000).toISOString().slice(0, 10), time: '08:01', at: now - 1000 }],
        },
        record: { typeId: '', values: {} },
        order: null,
        createdAt: 1,
        updatedAt: 2,
        rev: 0,
        deletedAt: null,
      },
    ],
    settings: { brief: true, pricing: { inputHit: 0.04, inputMiss: 2, output: 8 }, workspaceNotes: {}, valueHistory: {} },
    reviews: [],
    types: [recordType],
    file: 'D:/fake/items.json',
  };
  const medServer = makeServer(medDoc);
  const React7 = createReactStub();
  const { window: window7 } = createBrowserStub(medServer);
  const registrations7 = loadClient(window7, React7);
  const medPanel = createRenderer(registrations7.get('main'), React7);
  let medTree = medPanel.render();
  await settle(20);
  medTree = medPanel.render();
  byClass(medTree, 'dshqn-tab').find((tab) => textOf(tab) === 'LBL:viewHealth').props.onClick();
  medTree = medPanel.render();
  byClass(medTree, 'dshqn-tab').find((tab) => textOf(tab) === 'LBL:healthMed').props.onClick();
  medTree = medPanel.render();
  check('med adherence summary', textOf(medTree).includes('LBL:medAdherenceWeek') && textOf(medTree).includes('LBL:medLogIntake') && textOf(medTree).includes('LBL:medRemindersOn'), textOf(medTree).slice(-250));
  byClass(medTree, 'dshqn-button').find((button) => textOf(button) === 'LBL:medLogIntake').props.onClick();
  medTree = medPanel.render();
  await settle(20);
  const medAfterIntake = medServer.doc.items.find((item) => item.id === 'med1');
  check(
    'med intake logging',
    medAfterIntake !== undefined && Array.isArray(medAfterIntake.health.intakes) && medAfterIntake.health.intakes.length === 2,
    JSON.stringify(medAfterIntake && medAfterIntake.health.intakes && medAfterIntake.health.intakes.length),
  );

  // calendar aggregates a multi-time medication into one event per day
  medTree = clickTaskCalendar(medTree, medPanel);
  const medDays = byClass(medTree, 'dshqn-calendar-day');
  const medDay = medDays.find((day) => byClass(day, 'dshqn-calendar-chip').some((chip) => textOf(chip).includes('LBL:calendarMedGroup')));
  const medDayChips = medDay === undefined ? [] : byClass(medDay, 'dshqn-calendar-chip').filter((chip) => textOf(chip).includes('LBL:calendarMedGroup'));
  check(
    'calendar aggregates multi-time medication',
    medDayChips.length === 1,
    JSON.stringify(medDayChips.map((chip) => textOf(chip))),
  );
  const medsToggle = byClass(medTree, 'dshqn-filter').find((button) => textOf(button) === 'LBL:calendarMeds');
  check('calendar meds toggle present', Boolean(medsToggle));
  if (medsToggle) {
    medsToggle.props.onClick();
    medTree = medPanel.render();
    check(
      'calendar meds toggle hides medication events',
      byClass(medTree, 'dshqn-calendar-day').every((day) => !byClass(day, 'dshqn-calendar-chip').some((chip) => textOf(chip).includes('LBL:calendarMedGroup'))),
    );
  }
  check(
    'calendar day buttons expose selected state',
    byClass(medTree, 'dshqn-calendar-day').some((day) => day.props['aria-pressed'] === true),
  );

  report('client tests', lines);
}

/** Run the client test suite (called by test/run.mjs). */
export async function run() {
  try {
    await main();
  } catch (error) {
    lines.push('FAIL fatal :: ' + (error && error.stack ? error.stack : String(error)));
    report('client tests', lines);
  }
}
