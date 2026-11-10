/**
 * Real-browser smoke test (R2) for the management-console panel.
 *
 * Two modes:
 *   node test/browser-smoke.mjs                 # self-contained fixture (default)
 *   node test/browser-smoke.mjs --url=http://... # live DSH GUI (needs auth URL/cookie)
 *
 * The fixture mode boots a tiny HTTP server that mounts the real `client.js`
 * with real React 18 UMD from unpkg inside headless Chromium (Edge/Chrome),
 * backed by an in-memory `/api/quick-note/state` document. It then exercises
 * the real DOM/CSS: merged tabs, knowledge sub-tabs, plan calendar + timeline,
 * and saves a screenshot to test/artifacts/panel-smoke.png.
 *
 * Exit codes: 0 pass, 1 fail, 2 skipped.
 */
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(SCRIPT_DIR, '..');
const args = process.argv.slice(2);
const urlArg = args.find((arg) => arg.startsWith('--url='));
const liveUrl = (urlArg !== undefined ? urlArg.slice('--url='.length) : process.env.DSH_SMOKE_URL || '').replace(/\/$/, '');

const BROWSER_CANDIDATES = [
  process.env.DSH_BROWSER_PATH,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const lines = [];
const check = (label, ok, extra) => {
  lines.push((ok ? 'OK   ' : 'FAIL ') + label + (extra === undefined ? '' : ' :: ' + extra));
  return ok;
};

const findBrowser = async () => {
  const fs = await import('node:fs');
  for (const candidate of BROWSER_CANDIDATES) {
    if (typeof candidate === 'string' && candidate.length > 0 && fs.existsSync(candidate)) return candidate;
  }
  const edgeCore = 'C:\\Program Files (x86)\\Microsoft\\EdgeCore';
  if (fs.existsSync(edgeCore)) {
    const versions = fs
      .readdirSync(edgeCore)
      .filter((name) => /^\d+\./.test(name))
      .sort()
      .reverse();
    for (const version of versions) {
      const candidate = path.join(edgeCore, version, 'msedge.exe');
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return '';
};

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.exceptions = [];
    ws.addEventListener('message', (event) => {
      const message = JSON.parse(typeof event.data === 'string' ? event.data : String(event.data));
      if (message.method === 'Runtime.exceptionThrown') this.exceptions.push(String(message.params && message.params.exceptionDetails && message.params.exceptionDetails.text));
      if (message.id !== undefined && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message || JSON.stringify(message.error)));
        else resolve(message.result);
      }
    });
  }

  send(method, params) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params: params || {} }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error('CDP timeout: ' + method));
        }
      }, 20000);
    });
  }

  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'evaluate failed');
    return result.result ? result.result.value : undefined;
  }
}

const connect = async (port) => {
  let page;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const list = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
      page = list.find((entry) => entry.type === 'page');
      if (page !== undefined) break;
    } catch (error) {
      // not listening yet
    }
    await sleep(250);
  }
  if (page === undefined) throw new Error('browser did not expose a page target');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', () => reject(new Error('CDP websocket failed')), { once: true });
  });
  const cdp = new Cdp(ws);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  return cdp;
};

const launchBrowser = async (browserPath, startUrl) => {
  const profileDir = await mkdtemp(path.join(os.tmpdir(), 'dsh-smoke-'));
  const port = 9300 + Math.floor(Math.random() * 200);
  const child = spawn(
    browserPath,
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-crash-reporter',
      '--disable-breakpad',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--remote-allow-origins=*',
      '--remote-debugging-port=' + port,
      '--user-data-dir=' + profileDir,
      startUrl,
    ],
    { stdio: 'ignore', windowsHide: true },
  );
  return { child, port, profileDir };
};

const waitFor = async (cdp, expression, attempts = 80) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const value = await cdp.evaluate(expression);
    if (value === true || (typeof value === 'number' && value > 0)) return value;
    await sleep(250);
  }
  return false;
};

const assertPanel = async (cdp) => {
  const bootStart = Date.now();
  const rendered = await waitFor(cdp, "document.querySelectorAll('.dshqn-page').length");
  const bootMs = Date.now() - bootStart;
  check('management panel rendered', rendered !== false);
  check('browser boot budget under 5000ms', bootMs < 5000, bootMs + 'ms');
  const tabs = await cdp.evaluate("Array.from(document.querySelectorAll('.dshqn-tab')).map((el) => (el.textContent || '').trim())");
  const expectedTabs = ['概览', '知识', '计划', '健康', '记录', '分析'];
  check('six merged tabs', Array.isArray(tabs) && expectedTabs.every((label) => tabs.some((tab) => tab.includes(label))), JSON.stringify(tabs));
  check(
    'legacy tabs removed',
    Array.isArray(tabs) && !tabs.some((tab) => ['笔记', '任务', '复习', '日历', '全部'].some((legacy) => tab.includes(legacy))),
    JSON.stringify(tabs),
  );
  const knowledge = await cdp.evaluate(`(() => {
    const tab = Array.from(document.querySelectorAll('.dshqn-tab')).find((el) => (el.textContent || '').includes('知识'));
    if (!tab) return false;
    tab.click();
    return true;
  })()`);
  check('knowledge tab clickable', knowledge === true);
  await sleep(400);
  const knowledgeSub = await cdp.evaluate(
    "Array.from(document.querySelectorAll('.dshqn-subtabs .dshqn-filter')).map((el) => (el.textContent || '').trim())",
  );
  check(
    'knowledge sub tabs',
    Array.isArray(knowledgeSub) && knowledgeSub.some((t) => t.includes('笔记')) && knowledgeSub.some((t) => t.includes('复习')),
    JSON.stringify(knowledgeSub),
  );
  const plan = await cdp.evaluate(`(() => {
    const tab = Array.from(document.querySelectorAll('.dshqn-tab')).find((el) => (el.textContent || '').includes('计划'));
    if (!tab) return false;
    tab.click();
    return true;
  })()`);
  check('plan tab clickable', plan === true);
  await sleep(400);
  const calendar = await cdp.evaluate(`(() => {
    const button = Array.from(document.querySelectorAll('.dshqn-filter')).find((el) => (el.textContent || '').trim() === '日历');
    if (!button) return false;
    button.click();
    return true;
  })()`);
  check('calendar layout clickable', calendar === true);
  await sleep(500);
  const state = await cdp.evaluate(
    "({ days: document.querySelectorAll('.dshqn-calendar-day').length, timeline: document.querySelectorAll('.dshqn-plan-timeline').length, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth })",
  );
  check('calendar grid and timeline rendered', state && state.days === 42 && state.timeline === 1, JSON.stringify(state));
  check('no horizontal page overflow', state && state.overflow === false, JSON.stringify(state && state.overflow));
  check('no uncaught exceptions', cdp.exceptions.length === 0, JSON.stringify(cdp.exceptions.slice(0, 3)));
};

const assertOptimizer = async (cdp) => {
  const analytics = await cdp.evaluate(`(() => {
    const tab = Array.from(document.querySelectorAll('.dshqn-tab')).find((el) => (el.textContent || '').includes('分析'));
    if (!tab) return false;
    tab.click();
    return true;
  })()`);
  check('analytics tab clickable', analytics === true);
  await sleep(700);
  const optimizer = await cdp.evaluate(`(() => {
    const button = Array.from(document.querySelectorAll('.dshqn-filter')).find((el) => (el.textContent || '').includes('优化'));
    if (!button) return false;
    button.click();
    return true;
  })()`);
  check('optimizer subtab clickable', optimizer === true);
  await sleep(600);
  const state = await cdp.evaluate(
    "(() => { const root = document.querySelector('.dshqn-optimizer'); return { rendered: root !== null, text: root ? root.textContent || '' : '', overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth }; })()",
  );
  check(
    'token efficiency dashboard rendered',
    state !== null && state.rendered === true && ['预计可节省', '费用构成', '费用可视化', '缓存命中输入', '按工作区费用', '近 30 天缓存命中率', '查看计算过程', '自动省钱', '自动压缩', '当前会话上下文', '预计可压缩', '预算护栏', '开启省钱模式', '高消耗工作区省流', '无缓存基线', '省钱模型候选', '省钱模式效果'].every((label) => state.text.includes(label)),
    state ? state.text.slice(0, 320) : '',
  );
  check('token efficiency dashboard no overflow', state !== null && state.overflow === false, JSON.stringify(state && state.overflow));
  const savings = await cdp.evaluate(`(() => {
    const button = Array.from(document.querySelectorAll('.dshqn-button')).find((el) => (el.textContent || '').includes('查看计算过程'));
    if (!button) return false;
    button.click();
    return true;
  })()`);
  check('savings calculation expandable', savings === true);
  await sleep(250);
  const savingsText = await cdp.evaluate("(() => { const root = document.querySelector('.dshqn-optimizer'); return root ? root.textContent || '' : ''; })()");
  check('savings calculation details visible', savingsText.includes('计算口径') && savingsText.includes('输入 Token 总量') && savingsText.includes('单价差'), savingsText.slice(-300));
};

const assertP2Pane = async (cdp) => {
  const clickFilter = async (label) => {
    const clicked = await cdp.evaluate(`(() => {
      const button = Array.from(document.querySelectorAll('.dshqn-filter')).find((el) => (el.textContent || '').trim() === ${JSON.stringify(label)});
      if (!button) return false;
      button.click();
      return true;
    })()`);
    await sleep(700);
    return clicked;
  };
  const usageClicked = await clickFilter('用量');
  const usageText = await cdp.evaluate("(() => { const root = document.querySelector('.dshqn-usage'); return root ? root.textContent || '' : ''; })()");
  check(
    'usage cost trend and forecast',
    usageClicked === true && usageText.includes('工作区费用趋势') && usageText.includes('预计月费用') && usageText.includes('#1'),
    usageText.slice(0, 200),
  );
  const scheduleClicked = await clickFilter('清理计划');
  const scheduleText = await cdp.evaluate("(() => { const root = document.querySelector('.dshqn-page'); return root ? root.textContent || '' : ''; })()");
  check(
    'cleanup schedule summary',
    scheduleClicked === true && scheduleText.includes('下次执行') && scheduleText.includes('最近结果') && scheduleText.includes('自动清理摘要'),
    scheduleText.slice(0, 200),
  );
  await screenshot(cdp, 'p2-smoke.png');
};

const screenshot = async (cdp, name = 'panel-smoke.png') => {
  const artifacts = path.join(pluginRoot, 'test', 'artifacts');
  await mkdir(artifacts, { recursive: true });
  const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  const target = path.join(artifacts, name);
  await writeFile(target, Buffer.from(shot.data, 'base64'));
  lines.push('OK   screenshot :: ' + path.relative(pluginRoot, target));
};

const fixtureDoc = () => {
  const now = Date.now();
  const at18 = new Date();
  at18.setHours(18, 0, 0, 0);
  const base = {
    status: 'open',
    priority: 'normal',
    doneAt: null,
    review: { ease: 2.5, intervalDays: 0, repetitions: 0, dueAt: null, lastAt: null },
    health: { value: null, value2: null, unit: '', times: [], active: false, at: null },
    record: { typeId: '', values: {} },
    checklist: [],
    repeat: 'none',
    order: null,
    tags: [],
    createdAt: now,
    updatedAt: now,
    rev: 1,
    deletedAt: null,
  };
  return {
    version: 1,
    revision: 3,
    file: 'fixture/items.json',
    settings: { brief: true, pricing: { inputHit: 0.04, inputMiss: 2, output: 8 }, workspaceNotes: {}, valueHistory: {} },
    reviews: [],
    types: [],
    items: [
      { ...base, id: 'n1', kind: 'note', title: '冒烟测试笔记', body: '用于真实浏览器布局冒烟。' },
      { ...base, id: 't1', kind: 'task', title: '冒烟测试任务', due: at18.getTime(), tags: ['冒烟'] },
      { ...base, id: 'c1', kind: 'card', title: '冒烟测试卡片', body: '背面内容', review: { ease: 2.5, intervalDays: 1, repetitions: 1, dueAt: now - 60000, lastAt: now - 86400000 } },
      { ...base, id: 'm1', kind: 'med', title: '测试用药', health: { value: null, value2: null, unit: '', times: ['08:00', '20:00'], active: true, at: null } },
    ],
  };
};

const FIXTURE_HTML = `<!doctype html>
<html lang="zh">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>quick-note smoke fixture</title>
<style>
  :root {
    --dsw-alias-bg-base: #ffffff;
    --dsw-alias-bg-layer-1: #ffffff;
    --dsw-alias-bg-layer-2: #f5f6f8;
    --dsw-alias-bg-layer-3: #eceff3;
    --dsw-alias-border-l1: #e3e6eb;
    --dsw-alias-border-l2: #cdd3dc;
    --dsw-alias-label-primary: #1c2430;
    --dsw-alias-label-secondary: #5a6472;
    --dsw-alias-label-tertiary: #8b94a3;
    --dsw-alias-state-success-primary: #2f9e6f;
    --dsw-alias-state-warn-primary: #c98a12;
    --dsw-alias-state-error-primary: #d04545;
    --dsw-alias-brand-primary: #4b6bfb;
  }
  html, body { height: 100%; margin: 0; background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); font-family: system-ui, sans-serif; }
  #root { height: 100%; }
</style>
</head>
<body>
<div id="root"></div>
<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
<script>
  window.__ModuleLoader__ = { entries: [], load(entry) { this.entries.push(entry); } };
</script>
<script src="/client.js"></script>
<script>
(async () => {
  try {
    if (!window.React || !window.ReactDOM) throw new Error('React UMD unavailable (offline?)');
    const entry = window.__ModuleLoader__.entries[0];
    if (!entry) throw new Error('plugin client did not register');
    const mod = entry.factory((id) => {
      if (id === 'react') return window.React;
      throw new Error('unsupported require: ' + id);
    });
    const registrations = new Map();
    let dictionaries = { zh: {} };
    const ctx = {
      effect(callback) { callback(); return () => {}; },
      locale: {
        register(ns, dicts) { dictionaries = dicts; },
        bind(ns) {
          return (key, params) => {
            const dict = dictionaries.zh || {};
            let text = typeof dict[key] === 'string' ? dict[key] : key;
            if (params) for (const name of Object.keys(params)) text = text.split('{' + name + '}').join(String(params[name]));
            return text;
          };
        },
      },
      slots: {
        inject(name, callback) { callback(); },
        register(options, component) { registrations.set(options.key || options.name, { options, component }); return () => {}; },
      },
      layout: { selectPanel() {} },
    };
    mod.apply(ctx);
    const main = registrations.get('quick-note');
    if (!main) throw new Error('main panel registration missing');
    let prefsSnapshot = {
      modules: { note: true, task: true, card: true, health: true, record: true },
      taskLayout: 'list', groupBy: 'none', healthMode: 'metric', density: 'comfortable', accent: '',
      pins: [], reviewGoal: 20, insightTab: 'value', knowledgeTab: 'notes', overviewTab: 'dashboard',
      harnessLastCheckAt: 0, harnessLatestVersion: '', healthRanges: {},
    };
    const prefsListeners = new Set();
    const prefs = {
      getSnapshot: () => prefsSnapshot,
      subscribe: (listener) => {
        prefsListeners.add(listener);
        return () => prefsListeners.delete(listener);
      },
      set: (next) => {
        prefsSnapshot = { ...prefsSnapshot, ...next };
        for (const listener of prefsListeners) listener();
      },
    };
    const root = window.ReactDOM.createRoot(document.getElementById('root'));
    root.render(window.React.createElement(main.component, {
      t: ctx.locale.bind('quickNote'), prefs, selectPanel() {},
    }));
    window.__fixtureReady = true;
  } catch (error) {
    window.__fixtureError = String((error && error.stack) || error);
  }
})();
</script>
</body>
</html>`;

const fixtureUsage = () => {
  const now = Date.now();
  const day = (offset) => {
    const at = new Date(now - offset * 86400000);
    at.setHours(0, 0, 0, 0);
    return at.getTime();
  };
  const daily30 = Array.from({ length: 30 }, (_, index) => ({
    at: day(29 - index),
    sessions: index % 3 === 0 ? 2 : 1,
    inputMiss: 100 + (index % 4) * 20,
    inputHit: 180 + (index % 5) * 30,
    output: 40 + (index % 3) * 10,
    totalTokens: 320 + (index % 4) * 40,
    cost: 0.05 + (index % 5) * 0.01,
    inputMiss: 100 + (index % 4) * 20,
    inputHit: 200 + (index % 5) * 30,
    output: 40 + (index % 3) * 10,
    cacheHitRate: Math.round((0.45 + (index % 7) * 0.04) * 1000) / 1000,
  }));
  return {
    generatedAt: now,
    home: 'C:\\Users\\fixture\\.dsh',
    pricing: { inputHit: 0.04, inputMiss: 2, output: 8 },
    currency: 'CNY',
    workspaces: [
      { path: 'D:\\ProjA', title: 'ProjA', sessions: 3, inputMiss: 250000, inputHit: 350000, output: 17000, totalTokens: 617000, cost: 0.65, cacheHitRate: 0.583, avgTokens: 205666, lastAt: now },
      { path: 'D:\\ProjB', title: 'ProjB', sessions: 1, inputMiss: 150000, inputHit: 250000, output: 10000, totalTokens: 410000, cost: 0.39, cacheHitRate: 0.625, avgTokens: 410000, lastAt: now },
    ],
    totals: { sessions: 4, inputMiss: 400000, inputHit: 600000, output: 27000, totalTokens: 1027000, cost: 1.04, cacheHitRate: 0.6, avgTokens: 256750 },
    daily: daily30.slice(-14),
    daily30,
    topSessions: [
      { sessionId: 'session-a1', workspace: 'ProjA', path: 'D:\\ProjA', lastAt: now, totalTokens: 617000, cost: 0.65 },
      { sessionId: 'session-b1', workspace: 'ProjB', path: 'D:\\ProjB', lastAt: now, totalTokens: 410000, cost: 0.39 },
    ],
    efficiency: {
      score: 78,
      cacheHitRate: 0.6,
      targetCacheHit: 0.7,
      cacheSaving: 0.196,
      todayCost: 0.09,
      weekCost: 0.63,
      avgCostPerSession: 0.26,
      outputRatio: 0.037,
      totalCost: 1.04,
      totalTokens: 1027000,
      monthToDateCost: 0.71,
      daily30: daily30.map((entry) => ({ at: entry.at, cost: entry.cost, totalTokens: entry.totalTokens, cacheHitRate: entry.cacheHitRate })),
      components: { cacheScore: 86, costScore: 94, outputScore: 20 },
      recommendations: [
        { id: 'cache', title: '保持缓存命中率', detail: '缓存命中已超过目标，保持会话前缀复用。', saving: 0, severity: 'info' },
        { id: 'workspace', title: '精简高消耗工作区', detail: 'ProjA 花费占比最高。', saving: null, severity: 'high' },
      ],
      daily: daily30.slice(-14).map((entry) => ({ at: entry.at, cost: entry.cost, totalTokens: entry.totalTokens })),
    },
    sessionsWithUsage: 4,
    sessionsMissingUsage: 0,
    note: 'fixture usage',
  };
};

async function runFixture(browserPath) {
  const doc = fixtureDoc();
  const usage = fixtureUsage();
  const clientSource = await readFile(path.join(pluginRoot, 'client.js'));
  const server = createServer((req, res) => {
    const url = req.url || '/';
    if (url === '/' || url.startsWith('/index')) {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      res.end(FIXTURE_HTML);
      return;
    }
    if (url.startsWith('/api/quick-note/usage')) {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(usage));
      return;
    }
    if (url.startsWith('/api/quick-note/savings')) {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({
        generatedAt: Date.now(),
        compaction: { enabled: true },
        pruner: { enabled: true },
        commandCompact: { enabled: true },
        budgets: { daily: 100, monthly: 1500 },
        savings: { mode: false, guard: true, provider: '', model: '', maxOutput: 1200, activatedAt: 0, reason: '' },
        thriftWorkspaces: ['D:\\ProjA'],
        modelCandidates: [{ provider: 'deepseek-official', model: 'deepseek-flash', name: 'DeepSeek Flash' }],
        selected: { id: 'session-a1', cwd: 'D:\\ProjA', pressureTokens: 168000, contextWindow: 200000, ratio: 0.84, compressibleTokens: 68000, estimatedAfterTokens: 100000 },
        sessions: [{ id: 'session-a1', cwd: 'D:\\ProjA', pressureTokens: 168000, contextWindow: 200000, ratio: 0.84, compressibleTokens: 68000, estimatedAfterTokens: 100000 }],
      }));
      return;
    }
    if (url.startsWith('/api/quick-note/cleanup')) {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({
        categories: [], totals: { bytes: 0, files: 0 }, workspaceRoots: [], scannedFiles: 0,
        trash: { count: 0, bytes: 0, maxRecords: 0, maxBytes: 0, records: [] },
        schedule: {}, shareStats: [], history: [], webhookQueue: { count: 0, items: [] },
      }));
      return;
    }
    if (url === '/client.js') {
      res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'no-store' });
      res.end(clientSource);
      return;
    }
    if (url === '/api/quick-note/auth') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ token: 'fixture-token' }));
      return;
    }
    if (url.startsWith('/api/quick-note/state')) {
      if (req.method === 'PUT') {
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            doc.revision += 1;
            if (Array.isArray(parsed.items)) doc.items = parsed.items;
            if (parsed.settings !== undefined) doc.settings = parsed.settings;
            if (parsed.reviews !== undefined) doc.reviews = parsed.reviews;
            if (parsed.types !== undefined) doc.types = parsed.types;
          } catch (error) {
            // keep prior doc
          }
          res.writeHead(200, { 'content-type': 'application/json' });
          res.end(JSON.stringify(doc));
        });
        return;
      }
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(doc));
      return;
    }
    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'not found' }));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const launched = await launchBrowser(browserPath, 'http://127.0.0.1:' + port + '/');
  let cdp;
  try {
    cdp = await connect(launched.port);
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 900, deviceScaleFactor: 1, mobile: false });
    const ready = await waitFor(cdp, 'window.__fixtureReady === true || typeof window.__fixtureError === "string"', 120);
    check('fixture mounted', ready === true);
    const fixtureError = await cdp.evaluate('window.__fixtureError || ""');
    if (typeof fixtureError === 'string' && fixtureError.length > 0) {
      check('fixture runtime error', false, fixtureError.slice(0, 300));
      return 1;
    }
    await assertPanel(cdp);
    await screenshot(cdp);
    await assertOptimizer(cdp);
    await screenshot(cdp, 'optimizer-smoke.png');
    await assertP2Pane(cdp);
    return lines.some((line) => line.startsWith('FAIL ')) ? 1 : 0;
  } finally {
    if (cdp !== undefined) {
      try { cdp.ws.close(); } catch (error) { /* ignore */ }
    }
    try { launched.child.kill(); } catch (error) { /* ignore */ }
    server.close();
    await sleep(300);
    try { await rm(launched.profileDir, { recursive: true, force: true }); } catch (error) { /* ignore */ }
  }
}

async function runLive(browserPath) {
  try {
    const probe = await fetch(liveUrl, { redirect: 'manual' });
    if (probe.status >= 400) {
      lines.push('SKIP live GUI requires the authenticated URL (HTTP ' + probe.status + '); using fixture instead');
      return runFixture(browserPath);
    }
  } catch (error) {
    lines.push('SKIP live GUI unreachable (' + String((error && error.message) || error) + '); using fixture instead');
    return runFixture(browserPath);
  }
  const launched = await launchBrowser(browserPath, liveUrl);
  let cdp;
  try {
    cdp = await connect(launched.port);
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 900, deviceScaleFactor: 1, mobile: false });
    const ready = await waitFor(cdp, "document.readyState === 'complete' && document.body && document.body.innerText.length > 20", 120);
    check('live app shell loaded', ready === true);
    const clicked = await cdp.evaluate(`(() => {
      const target = Array.from(document.querySelectorAll('button, [role="button"], a')).find((el) => (el.textContent || '').includes('管理台'));
      if (!target) return false;
      target.click();
      return true;
    })()`);
    check('sidebar entry clicked', clicked === true);
    await assertPanel(cdp);
    await screenshot(cdp);
    return lines.some((line) => line.startsWith('FAIL ')) ? 1 : 0;
  } finally {
    if (cdp !== undefined) {
      try { cdp.ws.close(); } catch (error) { /* ignore */ }
    }
    try { launched.child.kill(); } catch (error) { /* ignore */ }
    await sleep(300);
    try { await rm(launched.profileDir, { recursive: true, force: true }); } catch (error) { /* ignore */ }
  }
}

let code = 1;
try {
  const browserPath = await findBrowser();
  if (browserPath.length === 0) {
    lines.push('SKIP no Chromium browser found (set DSH_BROWSER_PATH)');
    code = 2;
  } else if (liveUrl.length > 0) {
    code = await runLive(browserPath);
  } else {
    code = await runFixture(browserPath);
  }
} catch (error) {
  lines.push('FAIL fatal :: ' + String((error && error.stack) || error));
  code = 1;
}
for (const line of lines) console.log(line);
console.log(code === 0 ? 'RESULT PASS' : code === 2 ? 'RESULT SKIP' : 'RESULT FAIL');
process.exitCode = code;
