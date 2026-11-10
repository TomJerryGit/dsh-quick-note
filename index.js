/**
 * Host half of the Quick Notes bundle.
 *
 * Owns one JSON document on this machine so the Workbench panel (browser) and the
 * agent tools (Host) read and write the same list:
 * - `GET/PUT /api/quick-note/state` — the panel's sync channel (loopback only, no auth:
 *   the web carrier binds loopback in the shipped composition).
 * - `quick_note_search` / `quick_note_create` / `quick_note_complete` — agent tools.
 *
 * The data file lives at `$DSH_HOME/quick-note/items.json` (fallback `~/.dsh/quick-note/items.json`).
 */
import { spawn } from 'node:child_process';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { copyFile, cp, mkdir, open, readFile, readdir, rename, rm, stat, unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { deflateSync } from 'node:zlib';

/** Document shape version written to disk. */
const STORE_VERSION = 1;
/** Active store used to persist the webhook retry queue. */
let webhookQueueStore = null;
/** Route prefix owned by this plugin. */
const ROUTE_PREFIX = '/api/quick-note';
/** Exact state endpoint under the prefix. */
const STATE_PATH = ROUTE_PREFIX + '/state';
/** Read-only system summary endpoint. */
const ADMIN_PATH = ROUTE_PREFIX + '/admin';
/** Read-only per-workspace token and cost analysis endpoint. */
const USAGE_PATH = ROUTE_PREFIX + '/usage';
/** Read-only automatic token-saving status and context-pressure endpoint. */
const SAVINGS_PATH = ROUTE_PREFIX + '/savings';
/** Read-write savings-mode policy endpoint. */
const SAVINGS_POLICY_PATH = ROUTE_PREFIX + '/savings-policy';
/** Live automatic-savings state shared by the prompt section and routes. */
const savingsRuntime = { mode: false, provider: '', model: '', maxOutput: 0, thriftWorkspaces: [] };
/** Read-only per-workspace value/level/forecast analysis endpoint. */
const VALUE_PATH = ROUTE_PREFIX + '/workspace-value';
/** Loopback token handshake endpoint for the read-only routes. */
const AUTH_PATH = ROUTE_PREFIX + '/auth';
/** Backup list/create/restore endpoint. */
const BACKUP_PATH = ROUTE_PREFIX + '/backups';
/** Harness version-manager endpoint (info / check / download / install / restart). */
const HARNESS_PATH = ROUTE_PREFIX + '/harness';
/** Attachment upload/serve endpoint (images and small files). */
const FILES_PATH = ROUTE_PREFIX + '/files';
/** Web-clipping endpoint (URL -> title/description/excerpt). */
const CLIP_PATH = ROUTE_PREFIX + '/clip';
/** Markdown folder import/export endpoint. */
const MARKDOWN_PATH = ROUTE_PREFIX + '/markdown';
/** Speech-to-text endpoint (audio upload -> transcript). */
const VOICE_PATH = ROUTE_PREFIX + '/transcribe';
/** Read-only HTML snapshot endpoint. */
const SHARE_PATH = ROUTE_PREFIX + '/share';
/** Host-timer-computed reminders endpoint. */
const REMINDERS_PATH = ROUTE_PREFIX + '/reminders';
/** Disk-space scan/clean endpoint for plugin files and workspace junk. */
const CLEANUP_PATH = ROUTE_PREFIX + '/cleanup';
/** Markdown optimizer report endpoint. */
const OPTIMIZER_REPORT_PATH = ROUTE_PREFIX + '/optimizer-report';
/** Bounded cleanup history entries kept on disk. */
const CLEANUP_HISTORY_LIMIT = 20;
/** Largest attachment accepted by the upload route. */
const ATTACHMENT_MAX_BYTES = 25 * 1024 * 1024;
/** Filename extensions allowed for attachment storage. */
const ATTACHMENT_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'pdf', 'txt', 'md', 'csv', 'json', 'zip', 'mp3', 'wav', 'webm'];
/** Content types served for attachment extensions. */
const ATTACHMENT_CONTENT_TYPES = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  pdf: 'application/pdf',
  txt: 'text/plain; charset=utf-8',
  md: 'text/markdown; charset=utf-8',
  csv: 'text/csv; charset=utf-8',
  json: 'application/json; charset=utf-8',
  zip: 'application/zip',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  webm: 'video/webm',
};
/** Official direct-download sentinel feed and per-platform official installer URLs. */
const OFFICIAL_DIRECT_FEED = 'official:direct';
const OFFICIAL_DIRECT_TARGETS = {
  win32: 'https://download.deepseek.com/desktop/dsh-latest-windows-x64.exe',
  darwin: 'https://download.deepseek.com/desktop/dsh-latest-macos-arm64.dmg',
};
const OFFICIAL_DOWNLOAD_PAGE = 'https://www.deepseek.com/download/';
const OFFICIAL_GITHUB_RELEASES = 'https://api.github.com/repos/deepseek-ai/deepseek-harness/releases?per_page=15';
/** Largest installer the version manager will download, and the feed-fetch timeout. */
const UPDATE_MAX_BYTES = 256 * 1024 * 1024;
const OFFICIAL_DIRECT_MAX_BYTES = 600 * 1024 * 1024;
const UPDATE_FETCH_TIMEOUT_MS = 20000;
const OFFICIAL_HEAD_TIMEOUT_MS = 20000;
/** Rolling backups to keep (automatic interval is configurable per settings). */
const BACKUP_LIMIT = 10;
/** Per-Host-process token required by the read-only routes (memory only, rotates on restart). */
const READ_TOKEN = randomBytes(24).toString('hex');
/** Reference DeepSeek-flash peak prices in CNY per million tokens (idle hours are half). */
const DEFAULT_PRICING = { inputHit: 0.04, inputMiss: 2, output: 8 };
/** Largest request body the sync endpoint accepts. */
const MAX_BODY_BYTES = 1024 * 1024;
/** Item kinds the workbench understands. */
const KINDS = ['note', 'task', 'card', 'metric', 'med', 'record'];
/** Field types a custom record type may declare. */
const RECORD_FIELD_TYPES = ['text', 'number', 'date', 'checkbox', 'select'];
/** Priority values the workbench understands. */
const PRIORITIES = ['low', 'normal', 'high'];
/** Which item kinds belong to the health module. */
const HEALTH_KINDS = ['metric', 'med'];
/** Repeat schedules a task may declare. */
const REPEATS = ['none', 'daily', 'weekly', 'monthly'];

/**
 * Normalize one health payload (metric reading or medication plan).
 * @param raw - candidate health object.
 * @returns the canonical health payload.
 */
function normalizeHealth(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const value = typeof source.value === 'number' && Number.isFinite(source.value) ? source.value : null;
  const value2 = typeof source.value2 === 'number' && Number.isFinite(source.value2) ? source.value2 : null;
  const unit = typeof source.unit === 'string' ? source.unit.slice(0, 20) : '';
  const times = Array.isArray(source.times)
    ? source.times.filter((time) => typeof time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(time)).slice(0, 8)
    : [];
  const intakes = Array.isArray(source.intakes)
    ? source.intakes
        .filter(
          (entry) =>
            entry &&
            typeof entry.date === 'string' &&
            /^\d{4}-\d{2}-\d{2}$/.test(entry.date) &&
            typeof entry.time === 'string' &&
            /^([01]\d|2[0-3]):[0-5]\d$/.test(entry.time) &&
            typeof entry.at === 'number' &&
            Number.isFinite(entry.at),
        )
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
  };
}

/**
 * Normalize one custom-record payload (type plus field values).
 * @param raw - candidate record object.
 * @returns the canonical record payload.
 */
function normalizeRecord(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const typeId = typeof source.typeId === 'string' ? source.typeId.slice(0, 80) : '';
  const values = {};
  if (source.values && typeof source.values === 'object' && !Array.isArray(source.values)) {
    for (const [rawKey, value] of Object.entries(source.values)) {
      if (typeof rawKey !== 'string' || rawKey.length === 0) continue;
      const key = rawKey.slice(0, 60);
      if (typeof value === 'string') values[key] = value.slice(0, 2000);
      else if (typeof value === 'number' && Number.isFinite(value)) values[key] = value;
      else if (typeof value === 'boolean') values[key] = value;
    }
  }
  return { typeId, values };
}

/**
 * Normalize the declared fields of one custom record type.
 * @param raw - candidate field array.
 * @returns canonical fields.
 */
function normalizeRecordFields(raw) {
  if (!Array.isArray(raw)) return [];
  const fields = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const label = typeof entry.label === 'string' ? entry.label.trim().slice(0, 60) : '';
    if (label.length === 0) continue;
    const type = RECORD_FIELD_TYPES.includes(entry.type) ? entry.type : 'text';
    const key = typeof entry.key === 'string' && entry.key.length > 0 ? entry.key.slice(0, 60) : 'f' + (fields.length + 1);
    const options =
      type === 'select' && Array.isArray(entry.options)
        ? entry.options
            .filter((option) => typeof option === 'string' && option.trim().length > 0)
            .map((option) => option.trim().slice(0, 40))
            .slice(0, 30)
        : [];
    fields.push({ key, label, type, options });
  }
  return fields.slice(0, 20);
}

/**
 * Normalize the saved filter views of one custom record type.
 * @param raw - candidate view array.
 * @returns canonical views, capped at 20.
 */
function normalizeTypeViews(raw) {
  if (!Array.isArray(raw)) return [];
  const views = [];
  const now = Date.now();
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const name = typeof entry.name === 'string' ? entry.name.trim().slice(0, 60) : '';
    if (name.length === 0) continue;
    views.push({
      id: typeof entry.id === 'string' && entry.id.length > 0 ? entry.id.slice(0, 80) : randomUUID(),
      name,
      query: typeof entry.query === 'string' ? entry.query.slice(0, 200) : '',
      sort: entry.sort === 'title' ? 'title' : 'updated',
      createdAt: typeof entry.createdAt === 'number' && Number.isFinite(entry.createdAt) ? entry.createdAt : now,
    });
  }
  return views.slice(0, 20);
}

/**
 * Normalize custom record type definitions.
 * @param raw - candidate type array.
 * @returns canonical types, capped at 40.
 */
function normalizeTypes(raw) {
  if (!Array.isArray(raw)) return [];
  const types = [];
  const now = Date.now();
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const name = typeof entry.name === 'string' ? entry.name.trim().slice(0, 60) : '';
    if (name.length === 0) continue;
    types.push({
      id: typeof entry.id === 'string' && entry.id.length > 0 ? entry.id.slice(0, 80) : randomUUID(),
      name,
      fields: normalizeRecordFields(entry.fields),
      views: normalizeTypeViews(entry.views),
      createdAt: typeof entry.createdAt === 'number' && Number.isFinite(entry.createdAt) ? entry.createdAt : now,
      updatedAt: typeof entry.updatedAt === 'number' && Number.isFinite(entry.updatedAt) ? entry.updatedAt : now,
    });
  }
  return types.slice(0, 40);
}

/**
 * Resolve the data file without touching any Harness service, so the store works in
 * every Host composition.
 * @returns the absolute items.json path.
 */
function resolveStoreFile() {
  const base = process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
  return path.join(base, 'quick-note', 'items.json');
}

/** Resolve the DSH home directory. */
function resolveDshHome() {
  return process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
}

/** Resolve the active profile directory, when the Host runs inside a profile. */
function resolveProfileDir() {
  if (typeof process.env.DSH_PROFILE_DIR === 'string' && process.env.DSH_PROFILE_DIR.length > 0) {
    return process.env.DSH_PROFILE_DIR;
  }
  if (typeof process.env.DSH_PROFILE === 'string' && process.env.DSH_PROFILE.length > 0) {
    return path.join(resolveDshHome(), 'profiles', process.env.DSH_PROFILE);
  }
  return '';
}

/**
 * Find the active profile directory even when the Host process itself has no
 * DSH_PROFILE environment variables (for example when the web carrier spawns it).
 * @returns the best-guess profile directory, or an empty string.
 */
async function discoverProfileDir() {
  const fromEnv = resolveProfileDir();
  if (fromEnv.length > 0) return fromEnv;
  try {
    const root = path.join(resolveDshHome(), 'profiles');
    const entries = await readdir(root, { withFileTypes: true });
    const candidates = entries.filter((entry) => entry.isDirectory()).map((entry) => path.join(root, entry.name));
    if (candidates.length === 1) return candidates[0];
    const desktop = candidates.find((entry) => path.basename(entry) === 'desktop');
    return desktop || '';
  } catch (error) {
    return '';
  }
}

/**
 * Summarize the active profile: bundles, dependencies, and the profile directory.
 * @returns the read-only profile summary.
 */
async function readProfileSummary() {
  const profileDir = await discoverProfileDir();
  const summary = {
    name:
      typeof process.env.DSH_PROFILE === 'string' && process.env.DSH_PROFILE.length > 0
        ? process.env.DSH_PROFILE
        : profileDir.length > 0
          ? path.basename(profileDir)
          : '',
    dir: profileDir,
    bundles: [],
    dependencies: [],
    nodeModules: false,
  };
  if (profileDir.length === 0) return summary;
  try {
    const manifest = JSON.parse(await readFile(path.join(profileDir, 'package.json'), 'utf8'));
    const bundles = manifest && manifest.dsh && manifest.dsh.profile && Array.isArray(manifest.dsh.profile.bundles)
      ? manifest.dsh.profile.bundles.filter((entry) => typeof entry === 'string').slice(0, 100)
      : [];
    summary.bundles = bundles;
    summary.dependencies = manifest && manifest.dependencies && typeof manifest.dependencies === 'object'
      ? Object.entries(manifest.dependencies).filter(([, version]) => typeof version === 'string').slice(0, 100).map(([name, version]) => ({ name, version }))
      : [];
    const modules = await stat(path.join(profileDir, 'node_modules')).catch(() => undefined);
    summary.nodeModules = modules !== undefined;
  } catch (error) {
    summary.error = String((error && error.message) || error);
  }
  return summary;
}

/**
 * Summarize the session store: workspace buckets, session counts, and recent sessions.
 * @returns the read-only session summary.
 */
async function readSessionsSummary() {
  const root = path.join(resolveDshHome(), 'sessions');
  const summary = { root, workspaces: 0, sessions: 0, recent: [] };
  let buckets;
  try {
    buckets = await readdir(root, { withFileTypes: true });
  } catch (error) {
    return summary;
  }
  const recent = [];
  for (const bucket of buckets.slice(0, 100)) {
    if (!bucket.isDirectory()) continue;
    summary.workspaces += 1;
    let entries;
    try {
      entries = await readdir(path.join(root, bucket.name), { withFileTypes: true });
    } catch (error) {
      continue;
    }
    for (const entry of entries.slice(0, 500)) {
      if (!entry.isDirectory()) continue;
      summary.sessions += 1;
      try {
        const info = await stat(path.join(root, bucket.name, entry.name));
        recent.push({ id: entry.name, workspace: bucket.name, at: info.mtimeMs });
      } catch (error) {
        // a vanished directory is not a problem
      }
    }
  }
  summary.recent = recent.sort((left, right) => right.at - left.at).slice(0, 10);
  return summary;
}

/**
 * Summarize the workbench data file and document counts.
 * @param store - the shared store.
 * @returns the read-only data summary.
 */
async function readDataSummary(store) {
  const document = await store.load().catch(() => undefined);
  const file = store.file;
  const summary = {
    file,
    size: 0,
    updatedAt: null,
    revision: document === undefined ? 0 : document.revision,
    items: document === undefined ? 0 : document.items.length,
    types: document === undefined ? 0 : document.types.length,
    reviews: document === undefined ? 0 : document.reviews.length,
  };
  try {
    const info = await stat(file);
    summary.size = info.size;
    summary.updatedAt = info.mtimeMs;
  } catch (error) {
    // a missing data file is normal before the first write
  }
  return summary;
}

/** Whether one request targets the exact endpoint under a prefix registration. */
function matchesPath(req, expected) {
  try {
    return new URL(req.url || '/', 'http://localhost').pathname === expected;
  } catch (error) {
    return false;
  }
}

/** Whether the request Origin is absent (same-origin fetch) or a loopback origin. */
function isLoopbackOrigin(origin) {
  if (typeof origin !== 'string' || origin.length === 0) return true;
  try {
    const url = new URL(origin);
    return url.hostname === '127.0.0.1' || url.hostname === 'localhost' || url.hostname === '::1' || url.hostname === '[::1]';
  } catch (error) {
    return false;
  }
}

/** Require the per-process read token; writes a 401 and returns false when missing. */
function requireReadToken(req, res) {
  if (requestHeader(req, 'x-quick-note-token') === READ_TOKEN) return true;
  sendJson(res, 401, { error: 'unauthorized' });
  return false;
}

/**
 * Build the loopback token handshake route.
 * @returns a request handler.
 */
function createAuthRoute() {
  return async (req, res) => {
    if (req.method !== 'GET') {
      sendJson(res, 405, { error: 'method not allowed' });
      return;
    }
    if (!matchesPath(req, AUTH_PATH)) {
      sendJson(res, 404, { error: 'not found' });
      return;
    }
    if (!isLoopbackOrigin(requestHeader(req, 'origin'))) {
      sendJson(res, 403, { error: 'origin not allowed' });
      return;
    }
    sendJson(res, 200, { token: READ_TOKEN }, { 'cache-control': 'no-store' });
  };
}

/**
 * Build a GET-only, token-protected read route (shared by admin/usage/value).
 * @param endpoint - exact pathname owned by the route.
 * @param build - async (req) => JSON payload.
 * @returns a request handler.
 */
function createReadRoute(endpoint, build) {
  return async (req, res) => {
    if (req.method !== 'GET') {
      sendJson(res, 405, { error: 'method not allowed' });
      return;
    }
    if (!matchesPath(req, endpoint)) {
      sendJson(res, 404, { error: 'not found' });
      return;
    }
    if (!requireReadToken(req, res)) return;
    try {
      sendJson(res, 200, await build(req));
    } catch (error) {
      sendJson(res, 500, { error: String((error && error.message) || error) });
    }
  };
}

/** Read a raw request body capped at `maxBytes`. */
function readRawBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        reject(new Error('request body too large'));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/** Decode the handful of HTML entities that commonly appear in titles/descriptions. */
function decodeHtmlEntities(text) {
  return String(text || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

/** Fetch one web page and extract a readable title/description/excerpt (bounded). */
async function clipWebPage(rawUrl) {
  const url = String(rawUrl || '').trim();
  if (!/^https?:\/\//i.test(url)) throw new Error('URL must start with http:// or https://');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { accept: 'text/html,application/xhtml+xml', 'user-agent': 'dsh-quick-note-clipper/1.0' },
    });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const html = (await response.text()).slice(0, 2 * 1024 * 1024);
    const meta = (pattern) => {
      const match = html.match(pattern);
      return match === null ? '' : decodeHtmlEntities(match[1]).replace(/\s+/g, ' ').trim();
    };
    const title =
      meta(/<meta[^>]+(?:property|name)=["']og:title["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
      meta(/<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']og:title["'][^>]*>/i) ||
      meta(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const description =
      meta(/<meta[^>]+(?:property|name)=["'](?:og:description|description)["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
      meta(/<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["'](?:og:description|description)["'][^>]*>/i);
    const text = decodeHtmlEntities(
      html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim(),
    ).slice(0, 4000);
    return { url, title: title.slice(0, 200), description: description.slice(0, 1000), excerpt: text.slice(0, 1500) };
  } finally {
    clearTimeout(timer);
  }
}

/** Build the read-only web-clip route used by the panel to preview a URL. */
function createClipRoute() {
  return async (req, res) => {
    let url;
    try {
      url = new URL(req.url || '/', 'http://localhost');
    } catch (error) {
      sendJson(res, 400, { error: 'bad url' });
      return;
    }
    if (url.pathname !== CLIP_PATH) {
      sendJson(res, 404, { error: 'not found' });
      return;
    }
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'method not allowed' });
      return;
    }
    if (!requireReadToken(req, res)) return;
    try {
      const body = await readJsonBody(req);
      const clip = await clipWebPage(body && body.url);
      sendJson(res, 200, { clip });
    } catch (error) {
      sendJson(res, 422, { error: String((error && error.message) || error) });
    }
  };
}

/** Default Markdown exchange directory next to the data file. */
function defaultMarkdownDir() {
  return path.join(path.dirname(resolveStoreFile()), 'markdown');
}

/** Build a filesystem-safe slug for one Markdown filename. */
function markdownSlug(title, id) {
  const base = String(title || '')
    .trim()
    .toLowerCase()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return (base.length > 0 ? base : 'item') + '-' + String(id || '').slice(0, 8);
}

/** Serialize one item as a Markdown file with YAML-ish front matter. */
function markdownForItem(item) {
  const lines = ['---', 'id: ' + item.id, 'kind: ' + item.kind, 'title: ' + JSON.stringify(item.title)];
  if (item.tags.length > 0) lines.push('tags: ' + JSON.stringify(item.tags));
  if (item.kind === 'task') {
    lines.push('status: ' + item.status);
    lines.push('priority: ' + item.priority);
    if (item.due !== null) lines.push('due: ' + new Date(item.due).toISOString());
  }
  lines.push('created: ' + new Date(item.createdAt).toISOString());
  lines.push('updated: ' + new Date(item.updatedAt).toISOString());
  lines.push('source: quick-note', '---', '');
  if (item.kind === 'card') lines.push('## 正面', '', item.title, '', '## 背面', '', item.body);
  else {
    lines.push(item.body);
    if (item.kind === 'task' && item.checklist.length > 0) {
      lines.push('', '## 检查清单', '');
      for (const row of item.checklist) lines.push('- [' + (row.done ? 'x' : ' ') + '] ' + row.text);
    }
  }
  return lines.join('\n') + '\n';
}

/** Read simple front matter values from one Markdown file. */
function parseMarkdownDocument(text) {
  const source = String(text || '');
  const result = { meta: {}, body: source };
  if (!source.startsWith('---\n')) return result;
  const end = source.indexOf('\n---', 4);
  if (end < 0) return result;
  const header = source.slice(4, end);
  result.body = source.slice(end + 4).replace(/^\n+/, '');
  for (const line of header.split('\n')) {
    const match = line.match(/^([A-Za-z]+):\s*(.*)$/);
    if (match === null) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('[') && value.endsWith(']'))) {
      try {
        value = JSON.parse(value);
      } catch (error) {
        // keep the raw string
      }
    }
    result.meta[match[1]] = value;
  }
  return result;
}

/** Export note/task/card items as Markdown files into one folder. */
async function exportMarkdownFolder(store, dir) {
  const document = await store.load();
  const target = typeof dir === 'string' && dir.trim().length > 0 ? path.resolve(dir.trim()) : defaultMarkdownDir();
  await mkdir(target, { recursive: true });
  const items = document.items.filter((item) => item.deletedAt === null && ['note', 'task', 'card'].includes(item.kind));
  const files = [];
  for (const item of items) {
    const name = markdownSlug(item.title, item.id) + '.md';
    await writeFile(path.join(target, name), markdownForItem(item), 'utf8');
    files.push(name);
  }
  return { dir: target, count: items.length, files: files.slice(0, 50) };
}

/** Import Markdown files from one folder as notes/tasks/cards (deduplicated by title+body). */
async function importMarkdownFolder(store, dir) {
  const document = await store.load();
  const target = typeof dir === 'string' && dir.trim().length > 0 ? path.resolve(dir.trim()) : defaultMarkdownDir();
  const entries = (await readdir(target).catch(() => [])).filter((name) => name.toLowerCase().endsWith('.md')).slice(0, 500);
  const existing = new Map(document.items.map((item) => [item.title.trim() + '|' + item.body.trim().slice(0, 200), item]));
  const existingIds = new Set(document.items.map((item) => item.id));
  const imported = [];
  let skipped = 0;
  for (const name of entries) {
    try {
      const file = path.join(target, name);
      const info = await stat(file);
      if (info.size > 2 * 1024 * 1024) {
        skipped += 1;
        continue;
      }
      const parsed = parseMarkdownDocument(await readFile(file, 'utf8'));
      if (typeof parsed.meta.id === 'string' && existingIds.has(parsed.meta.id)) {
        skipped += 1;
        continue;
      }
      const kind = ['note', 'task', 'card'].includes(parsed.meta.kind) ? parsed.meta.kind : 'note';
      const title = typeof parsed.meta.title === 'string' ? parsed.meta.title : '';
      const body = parsed.body.trim();
      if (body.length === 0 && title.length === 0) {
        skipped += 1;
        continue;
      }
      const key = title.trim() + '|' + body.slice(0, 200);
      if (existing.has(key)) {
        skipped += 1;
        continue;
      }
      const tags = Array.isArray(parsed.meta.tags) ? parsed.meta.tags.filter((tag) => typeof tag === 'string').slice(0, 12) : [];
      const now = Date.now();
      const due = typeof parsed.meta.due === 'string' ? Date.parse(parsed.meta.due) : NaN;
      const item = normalizeItem({
        id: randomUUID(),
        kind,
        title: title || body.split('\n').find((line) => line.trim().length > 0) || '',
        body,
        tags: ['导入', ...tags],
        status: kind === 'task' && parsed.meta.status === 'done' ? 'done' : 'open',
        priority: ['low', 'normal', 'high'].includes(parsed.meta.priority) ? parsed.meta.priority : 'normal',
        due: Number.isFinite(due) ? due : null,
        createdAt: now,
        updatedAt: now,
      });
      existing.set(key, item);
      imported.push(item);
    } catch (error) {
      skipped += 1;
    }
  }
  if (imported.length > 0) {
    await store.replaceItems([...imported, ...document.items]);
  }
  return { dir: target, imported: imported.length, skipped };
}

/** Build the Markdown folder import/export route. */
function createMarkdownRoute(store) {
  return async (req, res) => {
    let url;
    try {
      url = new URL(req.url || '/', 'http://localhost');
    } catch (error) {
      sendJson(res, 400, { error: 'bad url' });
      return;
    }
    if (url.pathname !== MARKDOWN_PATH) {
      sendJson(res, 404, { error: 'not found' });
      return;
    }
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'method not allowed' });
      return;
    }
    if (!requireReadToken(req, res)) return;
    try {
      const body = await readJsonBody(req);
      const action = body && typeof body.action === 'string' ? body.action : '';
      const dir = body && typeof body.dir === 'string' ? body.dir : '';
      if (action === 'export') {
        sendJson(res, 200, await exportMarkdownFolder(store, dir));
        return;
      }
      if (action === 'import') {
        sendJson(res, 200, await importMarkdownFolder(store, dir));
        return;
      }
      sendJson(res, 400, { error: 'unknown action' });
    } catch (error) {
      sendJson(res, 500, { error: String((error && error.message) || error) });
    }
  };
}

/** Build the speech-to-text route backed by the optional Host `speechToText` service. */
function createVoiceRoute(getSpeech) {
  return async (req, res) => {
    let url;
    try {
      url = new URL(req.url || '/', 'http://localhost');
    } catch (error) {
      sendJson(res, 400, { error: 'bad url' });
      return;
    }
    if (url.pathname !== VOICE_PATH) {
      sendJson(res, 404, { error: 'not found' });
      return;
    }
    if (!requireReadToken(req, res)) return;
    if (req.method === 'GET') {
      const speech = getSpeech();
      let providers = [];
      if (speech && typeof speech.listProviders === 'function') {
        try {
          providers = speech.listProviders().map((provider) => ({
            id: provider.id,
            label: provider.label || provider.id,
            languages: Array.isArray(provider.languages) ? provider.languages : [],
          }));
        } catch (error) {
          providers = [];
        }
      }
      sendJson(res, 200, { available: speech !== undefined, providers });
      return;
    }
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'method not allowed' });
      return;
    }
    const speech = getSpeech();
    if (speech === undefined || speech === null || typeof speech.resolve !== 'function') {
      sendJson(res, 501, { error: 'speech-to-text service unavailable' });
      return;
    }
    try {
      const buffer = await readRawBody(req, ATTACHMENT_MAX_BYTES);
      if (buffer.length === 0) {
        sendJson(res, 400, { error: 'empty audio' });
        return;
      }
      const language = requestHeader(req, 'x-language') || 'zh';
      const audio = new Uint8Array(buffer);
      let spec;
      let lastError;
      for (const candidate of [{ audio, language }, { audio, language, sampleRate: 16000 }, { audio, language, mimeType: 'audio/wav' }]) {
        try {
          spec = speech.resolve(candidate);
          break;
        } catch (error) {
          lastError = error;
        }
      }
      if (spec === undefined) throw lastError || new Error('no speech provider');
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 120000);
      let transcript;
      try {
        transcript = await speech.transcribe(spec, controller.signal);
      } finally {
        clearTimeout(timer);
      }
      sendJson(res, 200, {
        text: transcript && typeof transcript.text === 'string' ? transcript.text : '',
        audioSeconds: transcript && typeof transcript.audioSeconds === 'number' ? transcript.audioSeconds : 0,
      });
    } catch (error) {
      sendJson(res, 422, { error: String((error && error.message) || error) });
    }
  };
}

/** Escape one string for safe HTML embedding. */
function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Build one standalone read-only HTML snapshot of the current document. */
function buildShareHtml(document, generatedAt) {
  const titleOf = (item) => {
    const title = item.title.trim();
    if (title.length > 0) return title;
    const line = item.body.split('\n').find((part) => part.trim().length > 0);
    return line === undefined ? '(无标题)' : line.slice(0, 80);
  };
  const visible = document.items.filter((item) => item.deletedAt === null);
  const section = (kind, heading) => {
    const items = visible.filter((item) => item.kind === kind);
    if (items.length === 0) return '';
    const rows = items
      .map((item) => {
        const meta = [];
        if (kind === 'task') meta.push(item.status === 'done' ? '已完成' : '待办');
        if (kind === 'task' && item.due !== null) meta.push('截止 ' + new Date(item.due).toLocaleDateString());
        if (item.tags.length > 0) meta.push(item.tags.map((tag) => '#' + tag).join(' '));
        return '<article class="item" data-kind="' + kind + '"><h3>' + escapeHtml(titleOf(item)) + '</h3>' +
          (meta.length > 0 ? '<p class="meta">' + escapeHtml(meta.join(' · ')) + '</p>' : '') +
          (item.body.trim().length > 0 ? '<pre>' + escapeHtml(item.body.trim()) + '</pre>' : '') +
          '</article>';
      })
      .join('\n');
    return '<section><h2>' + escapeHtml(heading) + ' <span>' + items.length + '</span></h2>\n' + rows + '\n</section>';
  };
  const html =
    '<!doctype html>\n<html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>管理台只读快照</title><style>' +
    ':root{--bg:#fff;--fg:#1f2328;--muted:#57606a;--line:#d8dee4;--card:#fff}' +
    '@media (prefers-color-scheme:dark){:root{--bg:#0d1117;--fg:#e6edf3;--muted:#8b949e;--line:#30363d;--card:#161b22}}' +
    'body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;max-width:860px;margin:32px auto;padding:0 20px;color:var(--fg);background:var(--bg);line-height:1.55}' +
    'header{border-bottom:1px solid var(--line);padding-bottom:12px;margin-bottom:20px}' +
    'h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;margin:24px 0 10px}h2 span{font-weight:400;color:var(--muted);font-size:13px}' +
    '.controls{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 16px}' +
    '#share-search{flex:1 1 220px;padding:7px 10px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--fg);font:inherit}' +
    '.controls button{padding:6px 12px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--fg);font:inherit;font-size:13px;cursor:pointer}' +
    '.controls button.active{border-color:#2f81f7;color:#2f81f7}' +
    '.item{border:1px solid var(--line);border-radius:10px;padding:12px 14px;margin:0 0 10px;background:var(--card)}' +
    '.item h3{font-size:14px;margin:0 0 4px}.meta{font-size:12px;color:var(--muted);margin:0 0 6px}' +
    'pre{white-space:pre-wrap;word-break:break-word;font:inherit;margin:0;color:var(--fg)}' +
    'footer{margin-top:28px;font-size:12px;color:var(--muted)}</style></head><body>' +
    '<header><h1>管理台只读快照</h1><p class="meta">生成时间：' + escapeHtml(new Date(generatedAt).toLocaleString()) + ' · 条目 ' + visible.length + '</p></header>' +
    '<div class="controls"><input id="share-search" type="search" placeholder="搜索标题或正文…" aria-label="搜索">' +
    '<button type="button" data-filter="all" class="active">全部</button><button type="button" data-filter="note">笔记</button>' +
    '<button type="button" data-filter="task">任务</button><button type="button" data-filter="card">卡片</button></div>' +
    section('note', '笔记') + section('task', '任务') + section('card', '复习卡片') +
    '<script>(function(){var input=document.getElementById("share-search");var buttons=Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));var current="all";function apply(){var text=(input.value||"").trim().toLowerCase();var items=Array.prototype.slice.call(document.querySelectorAll(".item"));items.forEach(function(el){var kind=el.getAttribute("data-kind");var hit=el.textContent.toLowerCase().indexOf(text)>=0;el.hidden=!((current==="all"||kind===current)&&hit);});Array.prototype.forEach.call(document.querySelectorAll("section"),function(section){var visible=false;Array.prototype.forEach.call(section.querySelectorAll(".item"),function(el){if(!el.hidden)visible=true;});section.style.display=visible?"":"none";});}input.addEventListener("input",apply);buttons.forEach(function(button){button.addEventListener("click",function(){current=button.getAttribute("data-filter")||"all";buttons.forEach(function(other){other.classList.toggle("active",other===button);});apply();});});})();</script>' +
    '<footer>Generated by Quick Notes (DSH plugin). Read-only snapshot.</footer></body></html>\n';
  return { html, count: visible.length };
}

/** Build the read-only share snapshot route. */
function createShareRoute(store) {
  const dir = path.join(path.dirname(resolveStoreFile()), 'shares');
  return async (req, res) => {
    let url;
    try {
      url = new URL(req.url || '/', 'http://localhost');
    } catch (error) {
      sendJson(res, 400, { error: 'bad url' });
      return;
    }
    const name = url.pathname.startsWith(SHARE_PATH + '/') ? decodeURIComponent(url.pathname.slice(SHARE_PATH.length + 1)) : '';
    if (req.method === 'GET' && /^share-[0-9]+-[0-9]+\.html$/.test(name)) {
      const token = requestHeader(req, 'x-quick-note-token');
      const queryToken = url.searchParams.get('token');
      if (token !== READ_TOKEN && queryToken !== READ_TOKEN) {
        sendJson(res, 401, { error: 'unauthorized' });
        return;
      }
      try {
        const html = await readFile(path.join(dir, name));
        await recordShareAccess(name, requestHeader(req, 'referer') || requestHeader(req, 'referrer')).catch(() => {});
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'content-length': String(html.length), 'cache-control': 'no-store' });
        res.end(html);
      } catch (error) {
        sendJson(res, 404, { error: 'not found' });
      }
      return;
    }
    if (req.method === 'POST' && url.pathname === SHARE_PATH) {
      if (!requireReadToken(req, res)) return;
      try {
        const document = await store.load();
        const generatedAt = Date.now();
        const { html, count } = buildShareHtml(document, generatedAt);
        const fileName = 'share-' + generatedAt + '-' + Math.floor(Math.random() * 100000) + '.html';
        await mkdir(dir, { recursive: true });
        await writeFile(path.join(dir, fileName), html, 'utf8');
        sendJson(res, 200, { name: fileName, path: path.join(dir, fileName), url: SHARE_PATH + '/' + fileName, count, size: Buffer.byteLength(html) });
      } catch (error) {
        sendJson(res, 500, { error: String((error && error.message) || error) });
      }
      return;
    }
    sendJson(res, 404, { error: 'not found' });
  };
}

/** Compute the Host-side reminder snapshot (tasks/meds/cards due now). */
function buildReminderSnapshot(document) {
  const now = Date.now();
  const items = document.items.filter((item) => item.deletedAt === null);
  const tasks = items.filter((item) => item.kind === 'task' && item.status === 'open' && item.due !== null && item.due <= now + 86400000);
  const meds = items.filter((item) => item.kind === 'med' && item.health.active && item.health.times.length > 0);
  const medReminderEnabled = document.settings ? document.settings.medReminderEnabled !== false : true;
  const activeMeds = medReminderEnabled ? meds : [];
  const cards = items.filter((item) => item.kind === 'card' && item.review.dueAt !== null && item.review.dueAt <= now);
  return {
    generatedAt: now,
    counts: { task: tasks.length, med: activeMeds.length, card: cards.length },
    items: [...tasks, ...activeMeds, ...cards].slice(0, 200),
  };
}

/** Compute today's budget state for the Host reminder snapshot. */
async function computeBudgetAlert(store, document) {
  const limit = document && document.settings ? document.settings.tokenBudget : 0;
  if (!(typeof limit === 'number' && limit > 0)) return null;
  const usage = await buildUsageReport(store);
  const todayCost = usage.efficiency ? usage.efficiency.todayCost : 0;
  const monthlyLimit = document && document.settings ? document.settings.tokenBudgetMonthly : 0;
  const monthlyCost = usage.efficiency ? usage.efficiency.monthToDateCost || 0 : 0;
  return {
    limit,
    todayCost: Math.round(todayCost * 1000) / 1000,
    percent: Math.round((todayCost / limit) * 100),
    over: todayCost > limit,
    warn: todayCost <= limit && todayCost / limit >= 0.8,
    status: todayCost > limit ? 'over' : todayCost / limit >= 0.8 ? 'warn' : 'ok',
    monthlyLimit: typeof monthlyLimit === 'number' ? monthlyLimit : 0,
    monthlyCost: Math.round(monthlyCost * 1000) / 1000,
    monthlyPercent: monthlyLimit > 0 ? Math.round((monthlyCost / monthlyLimit) * 100) : 0,
    monthlyOver: monthlyLimit > 0 && monthlyCost > monthlyLimit,
    monthlyWarn: monthlyLimit > 0 && monthlyCost <= monthlyLimit && monthlyCost / monthlyLimit >= 0.8,
  };
}

/** Build reminders plus the optional budget alert for one document revision. */
async function computeReminderSnapshot(store) {
  const document = await store.load();
  const snapshot = { ...buildReminderSnapshot(document), documentRevision: document.revision };
  const budget = await computeBudgetAlert(store, document);
  if (budget !== null) snapshot.budget = budget;
  return snapshot;
}

/** Build the Host-timer reminder route; the cache is refreshed every minute. */
function createRemindersRoute(store, cache) {
  return createReadRoute(REMINDERS_PATH, async () => {
    const document = await store.load();
    const cached = cache.value;
    const snapshot =
      cached !== null && cached.documentRevision === document.revision
        ? { ...cached }
        : { ...buildReminderSnapshot(document), documentRevision: document.revision };
    const budget = await computeBudgetAlert(store, document);
    if (budget !== null) snapshot.budget = budget;
    else delete snapshot.budget;
    return snapshot;
  });
}

/** Workspace junk scanner: temporary/system files that are safe to delete. */
const CLEANUP_JUNK_PATTERN = /(^\.DS_Store$|^Thumbs\.db$|^desktop\.ini$|^~$|^~\$|\.(tmp|temp|log|swp|swo|part|crdownload)$|(^|\.)bak$)/i;
/** Directories never traversed by the workspace scanner. */
const CLEANUP_SKIP_DIRS = new Set(['.git', '.dsh', '.svn', '.hg', 'node_modules']);
/** Cache directories considered rebuildable and safe to clean when selected. */
const CLEANUP_CACHE_DIRS = new Set(['__pycache__', '.pytest_cache', '.mypy_cache', '.ruff_cache', '.cache', '.turbo', '.parcel-cache']);
/** Build-output directories that are rebuildable but may matter to the user. */
const CLEANUP_BUILD_DIRS = new Set(['dist', 'build', 'out', 'target', 'coverage', '.next']);

/** Measure a directory tree with a bounded entry budget. */
async function measureDirectory(target, budget) {
  let bytes = 0;
  let files = 0;
  const stack = [target];
  while (stack.length > 0 && budget.remaining > 0) {
    if (budget.deadline !== undefined && Date.now() > budget.deadline) break;
    const current = stack.pop();
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch (error) {
      continue;
    }
    for (const entry of entries) {
      if (budget.remaining <= 0) break;
      budget.remaining -= 1;
      const full = path.join(current, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        stack.push(full);
        continue;
      }
      const info = await stat(full).catch(() => null);
      if (info !== null) {
        bytes += info.size;
        files += 1;
      }
    }
  }
  return { bytes, files };
}

/** Scan one workspace root for junk, caches, build outputs, and large stale files. */
async function scanWorkspaceRoot(root, state) {
  const walk = async (directory, depth) => {
    if (state.files >= state.maxFiles || Date.now() > state.deadline || depth > 8) {
      state.truncated = true;
      return;
    }
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      return;
    }
    for (const entry of entries) {
      if (state.files >= state.maxFiles || Date.now() > state.deadline) {
        state.truncated = true;
        return;
      }
      const full = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules') {
          const cacheDir = path.join(full, '.cache');
          const cacheInfo = await stat(cacheDir).catch(() => null);
          if (cacheInfo !== null && cacheInfo.isDirectory()) {
            const measured = await measureDirectory(cacheDir, { remaining: 1200, deadline: state.deadline });
            state.add('workspaceCaches', { path: cacheDir, root, rel: path.relative(root, cacheDir), bytes: measured.bytes, kind: 'dir' });
          }
          continue;
        }
        if (CLEANUP_SKIP_DIRS.has(entry.name)) continue;
        if (CLEANUP_CACHE_DIRS.has(entry.name)) {
          const measured = await measureDirectory(full, { remaining: 1200, deadline: state.deadline });
          state.add('workspaceCaches', { path: full, root, rel: path.relative(root, full), bytes: measured.bytes, kind: 'dir' });
          continue;
        }
        if (CLEANUP_BUILD_DIRS.has(entry.name)) {
          const measured = await measureDirectory(full, { remaining: 1200, deadline: state.deadline });
          state.add('workspaceBuilds', { path: full, root, rel: path.relative(root, full), bytes: measured.bytes, kind: 'dir' });
          continue;
        }
        await walk(full, depth + 1);
        continue;
      }
      if (!entry.isFile()) continue;
      state.files += 1;
      if (CLEANUP_JUNK_PATTERN.test(entry.name)) {
        const info = await stat(full).catch(() => null);
        if (info !== null) state.add('workspaceJunk', { path: full, root, rel: path.relative(root, full), bytes: info.size, kind: 'file' });
        continue;
      }
      // Only stat archive-like files for the report-only large/stale category.
      if (/\.(zip|iso|exe|dmg|mp4|mkv|tar|gz|7z)$/i.test(entry.name)) {
        const info = await stat(full).catch(() => null);
        if (info !== null && info.size > 50 * 1024 * 1024 && Date.now() - info.mtimeMs > 90 * 86400000) {
          state.add('largeStale', { path: full, root, rel: path.relative(root, full), bytes: info.size, kind: 'file' });
        }
      }
    }
  };
  await walk(root, 0);
}

/** Scan plugin data plus every known workspace for cleanable files. */
async function scanCleanup(store) {
  await pruneCleanupTrash();
  await enforceTrashLimits();
  const pluginRoot = path.dirname(resolveStoreFile());
  const categories = new Map();
  const addCategory = (id, label, meta) => {
    if (!categories.has(id)) {
      categories.set(id, {
        id,
        label,
        deletable: meta.deletable !== false,
        safe: meta.safe === true,
        hint: meta.hint || '',
        count: 0,
        bytes: 0,
        items: [],
      });
    }
    return categories.get(id);
  };
  const addItem = (categoryId, item) => {
    const category = categories.get(categoryId);
    if (category === undefined || category.items.length >= 2000) return;
    category.items.push(item);
    category.count += 1;
    category.bytes += item.bytes || 0;
  };

  addCategory('pluginAttachments', '孤立附件', { safe: true, hint: '已不被任何笔记/任务/卡片引用的附件文件' });
  addCategory('pluginStaging', '更新暂存文件', { safe: true, hint: '版本管理下载后未安装的安装包' });
  addCategory('pluginTemp', '插件临时文件', { safe: true, hint: 'quick-note 目录下的临时/日志文件' });
  addCategory('workspaceJunk', '工作区临时文件', { safe: true, hint: 'tmp/log/系统残留文件（.DS_Store、Thumbs.db 等）' });
  addCategory('workspaceCaches', '工作区缓存目录', { safe: true, hint: '__pycache__、.pytest_cache、.cache 等可重建缓存' });
  addCategory('workspaceBuilds', '工作区构建产物', { hint: 'dist/build/out/target/coverage 等可重建目录，请确认后清理' });
  addCategory('largeStale', '大型陈旧文件', { deletable: false, hint: '>50MB 且 90 天未修改，仅报告供人工判断' });

  const document = await store.load();
  const referenced = new Set();
  for (const item of document.items) {
    for (const attachment of item.attachments || []) referenced.add(attachment.id);
  }
  const filesDir = path.join(pluginRoot, 'files');
  const attachmentFiles = await readdir(filesDir).catch(() => []);
  for (const name of attachmentFiles) {
    if (referenced.has(name)) continue;
    const full = path.join(filesDir, name);
    const info = await stat(full).catch(() => null);
    if (info !== null && info.isFile()) addItem('pluginAttachments', { path: full, root: pluginRoot, rel: path.join('files', name), bytes: info.size, kind: 'file' });
  }
  const stagingDir = path.join(pluginRoot, 'staging');
  const stagingEntries = await readdir(stagingDir).catch(() => []);
  for (const name of stagingEntries) {
    const full = path.join(stagingDir, name);
    const info = await stat(full).catch(() => null);
    if (info === null) continue;
    if (info.isDirectory()) {
      const measured = await measureDirectory(full, { remaining: 5000 });
      addItem('pluginStaging', { path: full, root: pluginRoot, rel: path.join('staging', name), bytes: measured.bytes, kind: 'dir' });
    } else {
      addItem('pluginStaging', { path: full, root: pluginRoot, rel: path.join('staging', name), bytes: info.size, kind: 'file' });
    }
  }
  const pluginEntries = await readdir(pluginRoot, { withFileTypes: true }).catch(() => []);
  for (const entry of pluginEntries) {
    if (!entry.isFile() || entry.name === 'items.json') continue;
    if (!/\.(tmp|temp|log|bak)$/i.test(entry.name)) continue;
    const full = path.join(pluginRoot, entry.name);
    const info = await stat(full).catch(() => null);
    if (info !== null) addItem('pluginTemp', { path: full, root: pluginRoot, rel: entry.name, bytes: info.size, kind: 'file' });
  }

  const map = await fillSessionBuckets(await readWorkspaceMap());
  const roots = new Set();
  for (const workspace of map.values()) {
    if (typeof workspace.path !== 'string' || workspace.path.length === 0) continue;
    const resolved = path.resolve(workspace.path);
    const info = await stat(resolved).catch(() => null);
    if (info !== null && info.isDirectory()) roots.add(resolved);
  }
  const state = { files: 0, add: addItem, maxFiles: 5000, deadline: Date.now() + 6000, truncated: false };
  for (const root of roots) await scanWorkspaceRoot(root, state);

  const output = [...categories.values()].filter((category) => category.count > 0 || category.id.startsWith('plugin') || category.id.startsWith('workspace'));
  return {
    generatedAt: Date.now(),
    pluginRoot,
    workspaceRoots: [...roots].slice(0, 100),
    scannedFiles: state.files,
    truncated: state.truncated,
    categories: output,
    history: await readCleanupHistory(),
    trash: { ...(await scanTrashSummary()), maxRecords: CLEANUP_TRASH_MAX_RECORDS, maxBytes: CLEANUP_TRASH_MAX_BYTES },
    schedule: await readCleanupScheduleState(),
    shareStats: await readShareStats(),
    webhookQueue: { count: (await readWebhookQueue()).length, items: (await readWebhookQueue()).slice(0, 5) },
    totals: {
      count: output.reduce((sum, category) => sum + category.count, 0),
      bytes: output.reduce((sum, category) => sum + category.bytes, 0),
      deletableBytes: output.filter((category) => category.deletable).reduce((sum, category) => sum + category.bytes, 0),
    },
  };
}

/** Trash lifetime before permanent pruning. */
const CLEANUP_TRASH_TTL_MS = 24 * 60 * 60 * 1000;
/** Trash capacity limits (oldest records are evicted first). */
const CLEANUP_TRASH_MAX_RECORDS = 20;
const CLEANUP_TRASH_MAX_BYTES = 1024 * 1024 * 1024;

/** Directory that holds recoverable cleanup items. */
function cleanupTrashDir() {
  return path.join(path.dirname(resolveStoreFile()), 'trash');
}

/** Remove trash records older than the retention window. */
async function pruneCleanupTrash() {
  const dir = cleanupTrashDir();
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const now = Date.now();
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    const info = await stat(full).catch(() => null);
    if (info !== null && now - info.mtimeMs > CLEANUP_TRASH_TTL_MS) await rm(full, { recursive: true, force: true }).catch(() => {});
  }
}

/** Move one cleanable item into the trash record and return its restore descriptor. */
async function moveToCleanupTrash(target, recordId, index) {
  const directory = path.join(cleanupTrashDir(), recordId);
  await mkdir(directory, { recursive: true });
  const destination = path.join(directory, String(index).padStart(4, '0') + '-' + path.basename(target));
  try {
    await rename(target, destination);
  } catch (error) {
    await cp(target, destination, { recursive: true });
    await rm(target, { recursive: true, force: true });
  }
  return destination;
}

/** Restore one item from a trash descriptor to its original path (never overwriting). */
async function restoreFromCleanupTrash(item, restoredAt) {
  const trashPath = path.resolve(item.trashPath);
  const root = path.dirname(cleanupTrashDir());
  if (!trashPath.startsWith(path.resolve(cleanupTrashDir()) + path.sep)) return false;
  const exists = await stat(trashPath).catch(() => null);
  if (exists === null) return false;
  let destination = path.resolve(item.originalPath);
  if (!destination.startsWith(path.resolve(root) + path.sep) && !destination.startsWith(path.resolve(cleanupTrashDir()) + path.sep)) {
    // Workspace roots live outside the plugin directory; accept original absolute paths but still require a parent.
    if (!path.isAbsolute(destination)) return false;
  }
  await mkdir(path.dirname(destination), { recursive: true });
  const occupied = await stat(destination).catch(() => null);
  if (occupied !== null) destination = destination + '.restored-' + restoredAt;
  try {
    await rename(trashPath, destination);
  } catch (error) {
    await cp(trashPath, destination, { recursive: true });
    await rm(trashPath, { recursive: true, force: true });
  }
  return true;
}
function cleanupHistoryPath() {
  return path.join(path.dirname(resolveStoreFile()), 'cleanup-history.json');
}

/** Read the bounded cleanup history (newest first). */
async function readCleanupHistory() {
  try {
    const parsed = JSON.parse(await readFile(cleanupHistoryPath(), 'utf8'));
    return Array.isArray(parsed && parsed.entries) ? parsed.entries.slice(0, CLEANUP_HISTORY_LIMIT) : [];
  } catch (error) {
    return [];
  }
}

/** Write the bounded cleanup history file and return the entries. */
async function writeCleanupHistory(entries) {
  const bounded = entries.slice(0, CLEANUP_HISTORY_LIMIT);
  await mkdir(path.dirname(cleanupHistoryPath()), { recursive: true });
  await writeFile(cleanupHistoryPath(), JSON.stringify({ version: 1, entries: bounded }, null, 2), 'utf8');
  return bounded;
}

/** Append one cleanup record and return the new bounded history. */
async function appendCleanupHistory(record) {
  const history = await readCleanupHistory();
  history.unshift(record);
  return writeCleanupHistory(history);
}

/** Recovery hint per cleanup category. */
function cleanupRecoveryHint(categoryId) {
  const hints = {
    pluginAttachments: '附件文件已删除且不可恢复；请检查笔记中是否还有该附件引用。',
    pluginStaging: '安装包已删除；如仍需升级，请在版本管理中重新下载。',
    pluginTemp: '临时文件无需恢复。',
    workspaceJunk: '临时/日志文件已删除；如需日志请重新运行程序。',
    workspaceCaches: '缓存会按需重建；可重新运行测试或工具生成。',
    workspaceBuilds: '构建产物已删除；进入对应工作区重新执行构建命令（如 npm install && npm run build）。',
    largeStale: '未删除，仅报告。',
  };
  return hints[categoryId] || '清理不可撤销，请确认重建方式。';
}

/** Build one Markdown optimizer report from usage and cleanup data. */
function buildOptimizerMarkdown(usage, cleanup, generatedAt) {
  const efficiency = usage.efficiency || {};
  const lines = [];
  lines.push('# 管理台优化报告', '', '生成时间：' + new Date(generatedAt).toLocaleString(), '');
  lines.push('## Token 效率', '');
  lines.push('- 效率评分：' + (efficiency.score === undefined ? '-' : efficiency.score) + ' / 100');
  lines.push('- 缓存命中率：' + Math.round((efficiency.cacheHitRate || 0) * 100) + '%（目标 ' + Math.round((efficiency.targetCacheHit || 0.7) * 100) + '%）');
  lines.push('- 今日费用：¥' + Number(efficiency.todayCost || 0).toFixed(3) + '；近 7 日：¥' + Number(efficiency.weekCost || 0).toFixed(3));
  lines.push('- 会话均费：¥' + Number(efficiency.avgCostPerSession || 0).toFixed(3) + '；输出占比：' + Math.round((efficiency.outputRatio || 0) * 100) + '%');
  lines.push('- 累计 Token：' + Number(usage.totals ? usage.totals.totalTokens : 0) + '；累计费用：¥' + Number(efficiency.totalCost || 0).toFixed(3));
  lines.push('- 缓存提升可省：¥' + Number(efficiency.cacheSaving || 0).toFixed(3), '');
  lines.push('### 优化建议', '');
  for (const rec of efficiency.recommendations || []) lines.push('- **' + rec.title + '**：' + rec.detail);
  if ((efficiency.recommendations || []).length === 0) lines.push('- 暂无建议');
  lines.push('', '### 高消耗工作区', '');
  for (const row of (usage.workspaces || []).slice(0, 10)) {
    lines.push('- ' + row.title + '：¥' + Number(row.cost).toFixed(3) + ' · ' + row.totalTokens + ' tokens · 缓存 ' + Math.round(row.cacheHitRate * 100) + '%');
  }
  lines.push('', '### 高消耗会话', '');
  for (const session of (usage.topSessions || []).slice(0, 10)) {
    lines.push('- ' + session.workspace + ' · ' + session.totalTokens + ' tokens · ¥' + Number(session.cost).toFixed(3) + (session.lastAt === null ? '' : ' · ' + new Date(session.lastAt).toLocaleDateString()));
  }
  lines.push('', '## 空间清理', '');
  lines.push('- 扫描文件：' + cleanup.scannedFiles + '；工作区：' + cleanup.workspaceRoots.length + ' 个');
  for (const category of cleanup.categories.filter((entry) => entry.count > 0)) {
    lines.push('- ' + category.label + '：' + category.count + ' 项 / ' + category.bytes + ' 字节');
  }
  lines.push('- 合计可清理：' + cleanup.totals.count + ' 项 / ' + cleanup.totals.bytes + ' 字节', '');
  lines.push('> 本报告由管理台生成；清理操作不可撤销，构建产物请按提示重新生成。');
  return lines.join('\n') + '\n';
}

/** Human-readable byte size used by Host reports. */
function formatBytesHost(bytes) {
  const value = Number(bytes) || 0;
  if (value < 1024) return value + ' B';
  if (value < 1024 * 1024) return (value / 1024).toFixed(1) + ' KB';
  if (value < 1024 * 1024 * 1024) return (value / (1024 * 1024)).toFixed(1) + ' MB';
  return (value / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

/** Build one standalone HTML optimizer report. */
function buildOptimizerHtml(usage, cleanup, generatedAt, options) {
  const fromMs = options && typeof options.fromMs === 'number' ? options.fromMs : null;
  const toMs = options && typeof options.toMs === 'number' ? options.toMs : null;
  const rangeLabel =
    fromMs !== null || toMs !== null
      ? (fromMs === null ? '较早' : new Date(fromMs).toLocaleDateString()) + ' ~ ' + (toMs === null ? '今天' : new Date(toMs).toLocaleDateString())
      : '近 30 天';
  const efficiency = usage.efficiency || {};
  const recRows = (efficiency.recommendations || [])
    .map((rec) => '<div class="rec"><strong>' + escapeHtml(rec.title) + '</strong><p>' + escapeHtml(rec.detail) + '</p></div>')
    .join('\n');
  const workspaceRows = (usage.workspaces || [])
    .slice(0, 10)
    .map(
      (row) =>
        '<tr data-workspace="' + escapeHtml(row.title) + '"><td>' + escapeHtml(row.title) + '</td><td>¥' + Number(row.cost).toFixed(3) + '</td><td>' + row.totalTokens + '</td><td>' + Math.round(row.cacheHitRate * 100) + '%</td></tr>',
    )
    .join('\n');
  const sessionRows = (usage.topSessions || [])
    .slice(0, 10)
    .map(
      (session) =>
        '<tr data-workspace="' + escapeHtml(session.workspace) + '"><td>' + escapeHtml(session.workspace) + '</td><td>' + session.totalTokens + '</td><td>¥' + Number(session.cost).toFixed(3) + '</td><td>' + (session.lastAt === null ? '-' : escapeHtml(new Date(session.lastAt).toLocaleDateString())) + '</td></tr>',
    )
    .join('\n');
  const workspaceOptions = (usage.workspaces || [])
    .slice(0, 10)
    .map((row) => '<option value="' + escapeHtml(row.title) + '">' + escapeHtml(row.title) + '</option>')
    .join('');
  const dailySource = (Array.isArray(usage.daily30) ? usage.daily30 : Array.isArray(usage.daily) ? usage.daily : []).filter(
    (day) => (fromMs === null || day.at >= fromMs) && (toMs === null || day.at <= toMs),
  );
  const dailyRows = dailySource
    .map((day, index) => {
      const age = dailySource.length - 1 - index;
      return '<tr class="day-row" data-age="' + age + '"><td>' + escapeHtml(new Date(day.at).toLocaleDateString()) + '</td><td>¥' + Number(day.cost).toFixed(3) + '</td><td>' + day.totalTokens + '</td></tr>';
    })
    .join('\n');
  const cleanupRows = cleanup.categories
    .filter((category) => category.count > 0)
    .map((category) => '<tr><td>' + escapeHtml(category.label) + '</td><td>' + category.count + '</td><td>' + formatBytesHost(category.bytes) + '</td></tr>')
    .join('\n');
  return (
    '<!doctype html>\n<html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>管理台优化报告</title><style>' +
    ':root{--bg:#fff;--fg:#1f2328;--muted:#57606a;--line:#d8dee4;--card:#fff}' +
    '@media (prefers-color-scheme:dark){:root{--bg:#0d1117;--fg:#e6edf3;--muted:#8b949e;--line:#30363d;--card:#161b22}}' +
    'body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;max-width:860px;margin:32px auto;padding:0 20px;color:var(--fg);background:var(--bg);line-height:1.55}' +
    'h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;margin:26px 0 10px}h3{font-size:14px;margin:18px 0 8px}' +
    '.meta{color:var(--muted);font-size:12px}.score{font-size:40px;font-weight:700;color:#2f81f7}' +
    '.controls{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 4px}' +
    '#optimizer-search{flex:1 1 220px;padding:7px 10px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--fg);font:inherit}' +
    '#workspace-filter{padding:7px 10px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--fg);font:inherit}' +
    '.card{border:1px solid var(--line);border-radius:10px;padding:12px 14px;margin:0 0 10px;background:var(--card)}' +
    '.rec{border-left:3px solid #2f81f7;padding:6px 10px;margin:6px 0;background:var(--card)}.rec p{margin:3px 0 0;color:var(--muted);font-size:12px}' +
    'table{border-collapse:collapse;width:100%;font-size:12px}th,td{border-bottom:1px solid var(--line);padding:5px 6px;text-align:left}' +
    'footer{margin-top:24px;color:var(--muted);font-size:12px}</style></head><body>' +
    '<h1>管理台优化报告</h1><p class="meta">生成时间：' + escapeHtml(new Date(generatedAt).toLocaleString()) + ' · 统计区间：' + escapeHtml(rangeLabel) + ' · 只读快照</p>' +
    '<div class="controls"><input id="optimizer-search" type="search" placeholder="搜索工作区/会话/建议…" aria-label="搜索">' +
    '<select id="workspace-filter" aria-label="工作区筛选"><option value="">全部工作区</option>' + workspaceOptions + '</select>' +
    '<select id="range-filter" aria-label="时间范围"><option value="7">近 7 天</option><option value="30">近 30 天</option></select></div>' +
    '<h2>Token 效率</h2><div class="score">' + (efficiency.score === undefined ? '-' : efficiency.score) + ' / 100</div>' +
    '<div class="card"><p>缓存命中率：' + Math.round((efficiency.cacheHitRate || 0) * 100) + '%（目标 ' + Math.round((efficiency.targetCacheHit || 0.7) * 100) + '%）</p>' +
    '<p>今日费用 ¥' + Number(efficiency.todayCost || 0).toFixed(3) + ' · 近 7 日 ¥' + Number(efficiency.weekCost || 0).toFixed(3) + ' · 会话均费 ¥' + Number(efficiency.avgCostPerSession || 0).toFixed(3) + '</p>' +
    '<p>累计 ' + Number(usage.totals ? usage.totals.totalTokens : 0) + ' tokens · ¥' + Number(efficiency.totalCost || 0).toFixed(3) + ' · 缓存提升可省 ¥' + Number(efficiency.cacheSaving || 0).toFixed(3) + '</p></div>' +
    '<h3>优化建议</h3>' + (recRows.length > 0 ? recRows : '<p class="meta">暂无建议</p>') +
    '<h3>每日费用</h3><table><thead><tr><th>日期</th><th>费用</th><th>Tokens</th></tr></thead><tbody>' + dailyRows + '</tbody></table>' +
    '<h3>高消耗工作区</h3><table><thead><tr><th>工作区</th><th>费用</th><th>Tokens</th><th>缓存</th></tr></thead><tbody>' + workspaceRows + '</tbody></table>' +
    '<h3>高消耗会话</h3><table><thead><tr><th>工作区</th><th>Tokens</th><th>费用</th><th>日期</th></tr></thead><tbody>' + sessionRows + '</tbody></table>' +
    '<h2>空间清理</h2><p class="meta">扫描 ' + cleanup.scannedFiles + ' 个文件 · 工作区 ' + cleanup.workspaceRoots.length + ' 个</p>' +
    '<table><thead><tr><th>类别</th><th>项数</th><th>大小</th></tr></thead><tbody>' + cleanupRows + '</tbody></table>' +
    '<script>(function(){var input=document.getElementById("optimizer-search");var select=document.getElementById("workspace-filter");var range=document.getElementById("range-filter");function applyRange(){var days=Number(range.value)||7;Array.prototype.forEach.call(document.querySelectorAll("tr.day-row"),function(row){row.hidden=Number(row.getAttribute("data-age"))>=days;});}function apply(){var query=(input.value||"").toLowerCase();var workspace=select.value;Array.prototype.forEach.call(document.querySelectorAll("tr[data-workspace]"),function(row){var okWorkspace=!workspace||row.getAttribute("data-workspace")===workspace;var okQuery=!query||row.textContent.toLowerCase().indexOf(query)>=0;row.hidden=!(okWorkspace&&okQuery);});Array.prototype.forEach.call(document.querySelectorAll(".rec"),function(rec){rec.hidden=!!query&&rec.textContent.toLowerCase().indexOf(query)<0;});}input.addEventListener("input",apply);select.addEventListener("change",apply);range.addEventListener("change",applyRange);applyRange();})();</script>' +
    '<footer>Generated by Quick Notes (DSH plugin). Read-only optimizer snapshot; cleanup can be undone within 24h from the panel.</footer></body></html>\n'
  );
}

/** Build the optimizer report route. */
function createOptimizerReportRoute(store) {  return async (req, res) => {
    let url;
    try {
      url = new URL(req.url || '/', 'http://localhost');
    } catch (error) {
      sendJson(res, 400, { error: 'bad url' });
      return;
    }
    if (url.pathname !== OPTIMIZER_REPORT_PATH) {
      sendJson(res, 404, { error: 'not found' });
      return;
    }
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'method not allowed' });
      return;
    }
    if (!requireReadToken(req, res)) return;
    try {
      const body = await readJsonBody(req).catch(() => undefined);
      const format = body && body.format === 'html' ? 'html' : 'md';
      const fromRaw = body && typeof body.from === 'string' ? Date.parse(body.from) : NaN;
      const toRaw = body && typeof body.to === 'string' ? Date.parse(body.to) : NaN;
      const fromMs = Number.isFinite(fromRaw) ? fromRaw : null;
      const toMs = Number.isFinite(toRaw) ? toRaw + 24 * 60 * 60 * 1000 - 1 : null;
      const usage = await buildUsageReport(store);
      const cleanup = await scanCleanup(store);
      const generatedAt = Date.now();
      if (format === 'html') {
        const html = buildOptimizerHtml(usage, cleanup, generatedAt, { fromMs, toMs });
        const sharesDir = path.join(path.dirname(resolveStoreFile()), 'shares');
        await mkdir(sharesDir, { recursive: true });
        const shareName = 'share-' + generatedAt + '-' + Math.floor(Math.random() * 100000) + '.html';
        await writeFile(path.join(sharesDir, shareName), html, 'utf8');
        sendJson(res, 200, {
          format: 'html',
          name: shareName,
          path: path.join(sharesDir, shareName),
          url: SHARE_PATH + '/' + shareName,
          bytes: Buffer.byteLength(html),
          score: usage.efficiency ? usage.efficiency.score : 0,
          range: { from: fromMs === null ? null : new Date(fromMs).toISOString(), to: toMs === null ? null : new Date(toMs).toISOString() },
        });
        return;
      }
      const markdown = buildOptimizerMarkdown(usage, cleanup, generatedAt);
      const dir = path.join(path.dirname(resolveStoreFile()), 'reports');
      await mkdir(dir, { recursive: true });
      const fileName = 'optimizer-' + generatedAt + '.md';
      await writeFile(path.join(dir, fileName), markdown, 'utf8');
      sendJson(res, 200, { format: 'md', name: fileName, path: path.join(dir, fileName), bytes: Buffer.byteLength(markdown), score: usage.efficiency ? usage.efficiency.score : 0 });
    } catch (error) {
      sendJson(res, 500, { error: String((error && error.message) || error) });
    }
  };
}

/** Trash directory summary for the panel (record ids, sizes, remaining lifetime). */
async function scanTrashSummary() {
  const dir = cleanupTrashDir();
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const history = await readCleanupHistory();
  const records = [];
  let bytes = 0;
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    const measured = await measureDirectory(full, { remaining: 2000 });
    bytes += measured.bytes;
    const record = history.find((item) => item.id === entry.name);
    records.push({
      id: entry.name,
      bytes: measured.bytes,
      files: measured.files,
      createdAt: record && typeof record.at === 'number' ? record.at : null,
      expiresAt: record && typeof record.expiresAt === 'number' ? record.expiresAt : null,
      recoverable: record ? record.recoverable === true : true,
      removed: record && typeof record.removed === 'number' ? record.removed : 0,
      categories: record && Array.isArray(record.categories) ? record.categories.map((category) => category.id).filter((id) => typeof id === 'string') : [],
      roots:
        record && Array.isArray(record.items)
          ? [...new Set(record.items.map((item) => path.basename(path.dirname(item.originalPath || ''))).filter((name) => name.length > 0))].slice(0, 10)
          : [],
    });
  }
  records.sort((left, right) => Number(right.createdAt || 0) - Number(left.createdAt || 0));
  return { count: records.length, bytes, records };
}

/** Execute one cleanup selection (shared by the panel route and the scheduled task). */
async function runCleanupSelection(store, selectedIds, options) {
  const scan = await scanCleanup(store);
  const selected = new Set((Array.isArray(selectedIds) ? selectedIds : []).filter((id) => typeof id === 'string'));
  const selectedCategories = scan.categories.filter((category) => selected.has(category.id) && category.deletable !== false);
  const recordId = randomUUID();
  const trashed = [];
  let removed = 0;
  let freed = 0;
  let errors = 0;
  for (const category of selectedCategories) {
    for (const item of category.items) {
      const root = path.resolve(item.root);
      const target = path.resolve(item.path);
      if (target === root || !target.startsWith(root + path.sep)) {
        errors += 1;
        continue;
      }
      try {
        const trashPath = await moveToCleanupTrash(target, recordId, trashed.length);
        trashed.push({ originalPath: target, trashPath, kind: item.kind, bytes: item.bytes || 0, root });
        removed += 1;
        freed += item.bytes || 0;
      } catch (error) {
        errors += 1;
      }
    }
  }
  const now = Date.now();
  const record = {
    id: recordId,
    at: now,
    removed,
    freed,
    errors,
    auto: options && options.auto === true,
    recoverable: trashed.length > 0,
    expiresAt: now + CLEANUP_TRASH_TTL_MS,
    items: trashed,
    categories: selectedCategories.map((category) => ({ id: category.id, label: category.label, count: category.count, bytes: category.bytes })),
    hints: selectedCategories.map((category) => cleanupRecoveryHint(category.id)),
  };
  const history = await appendCleanupHistory(record);
  await enforceTrashLimits();
  return { removed, freed, errors, record, history };
}

/** Safe categories the scheduled cleanup may touch automatically. */
const AUTO_CLEAN_CATEGORIES = ['pluginTemp', 'workspaceJunk', 'workspaceCaches'];

/** Evict the oldest trash records when the capacity or record cap is exceeded. */
async function enforceTrashLimits() {
  const dir = cleanupTrashDir();
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const records = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    const info = await stat(full).catch(() => null);
    const measured = await measureDirectory(full, { remaining: 2000 });
    records.push({ id: entry.name, path: full, bytes: measured.bytes, mtime: info ? info.mtimeMs : 0 });
  }
  records.sort((left, right) => left.mtime - right.mtime);
  let total = records.reduce((sum, record) => sum + record.bytes, 0);
  let count = records.length;
  const evicted = [];
  while (records.length > 0 && (count > CLEANUP_TRASH_MAX_RECORDS || total > CLEANUP_TRASH_MAX_BYTES)) {
    const oldest = records.shift();
    await rm(oldest.path, { recursive: true, force: true }).catch(() => {});
    evicted.push(oldest.id);
    count -= 1;
    total -= oldest.bytes;
  }
  if (evicted.length > 0) {
    const history = await readCleanupHistory();
    for (const entry of history) {
      if (evicted.includes(entry.id)) {
        entry.recoverable = false;
        entry.evictedAt = Date.now();
      }
    }
    await writeCleanupHistory(history);
  }
  return { evicted, count, bytes: total };
}

/** Local occurrence of HH:MM for the current day. */
function todayAtScheduleTime(time) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(typeof time === 'string' ? time : '03:00');
  const hours = match === null ? 3 : Number(match[1]);
  const minutes = match === null ? 0 : Number(match[2]);
  const occurrence = new Date();
  occurrence.setHours(hours, minutes, 0, 0);
  return occurrence.getTime();
}

/** Parse one cron field into a set (null means every value). */
function parseCronField(field, min, max) {
  if (field === '*') return null;
  const values = new Set();
  for (const part of field.split(',')) {
    const [rangePart, stepPart] = part.split('/');
    const step = stepPart === undefined ? 1 : Number(stepPart);
    if (!Number.isFinite(step) || step <= 0) continue;
    let start;
    let end;
    if (rangePart === '*') {
      start = min;
      end = max;
    } else if (rangePart.indexOf('-') >= 0) {
      const [left, right] = rangePart.split('-').map(Number);
      start = left;
      end = right;
    } else {
      start = Number(rangePart);
      end = rangePart === String(start) ? start : start;
    }
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
    for (let value = start; value <= end; value += step) {
      if (value >= min && value <= max) values.add(value);
    }
  }
  return values.size === 0 ? null : values;
}

/** Parse a five-field cron expression. */
function parseCronExpression(expression) {
  const parts = String(expression || '').trim().split(/\s+/);
  if (parts.length !== 5) return null;
  const minute = parseCronField(parts[0], 0, 59);
  const hour = parseCronField(parts[1], 0, 23);
  const dayOfMonth = parseCronField(parts[2], 1, 31);
  const month = parseCronField(parts[3], 1, 12);
  const rawDayOfWeek = parseCronField(parts[4], 0, 7);
  const dayOfWeek = rawDayOfWeek === null ? null : new Set([...rawDayOfWeek].map((value) => (value === 7 ? 0 : value)));
  return { minute, hour, dayOfMonth, month, dayOfWeek };
}

/** Resolve a fixed UTC offset (hours) from a timezone label, or null for local time. */
function resolveScheduleOffsetHours(timezone) {
  if (typeof timezone !== 'string' || timezone === 'local') return null;
  const match = /^UTC([+-])(\d{1,2})$/.exec(timezone);
  if (match === null) return null;
  const value = Number(match[2]) * (match[1] === '-' ? -1 : 1);
  return value >= -12 && value <= 14 ? value : null;
}

/** Normalize a schedule timezone: local, fixed UTC±h, or an IANA zone name. */
function normalizeScheduleTimezone(value) {
  if (typeof value !== 'string') return 'local';
  if (value === 'local' || /^UTC[+-]\d{1,2}$/.test(value)) return value;
  if (value.length <= 64 && value.includes('/') && /^[A-Za-z0-9_+\-/]+$/.test(value)) {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: value }).format(new Date());
      return value;
    } catch (error) {
      return 'local';
    }
  }
  return 'local';
}

/** Read calendar parts in a timezone ('local', fixed 'UTC±h', or an IANA zone). */
function zoneParts(date, timezone) {
  if (typeof timezone !== 'string' || timezone === 'local') {
    return { minute: date.getMinutes(), hour: date.getHours(), day: date.getDate(), month: date.getMonth() + 1, weekday: date.getDay() };
  }
  const fixedOffset = resolveScheduleOffsetHours(timezone);
  if (fixedOffset !== null) {
    const shifted = new Date(date.getTime() + fixedOffset * 3600000);
    return { minute: shifted.getUTCMinutes(), hour: shifted.getUTCHours(), day: shifted.getUTCDate(), month: shifted.getUTCMonth() + 1, weekday: shifted.getUTCDay() };
  }
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour12: false,
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
    }).formatToParts(date);
    const read = (type) => {
      const found = parts.find((part) => part.type === type);
      return found ? found.value : '';
    };
    const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return {
      minute: Number(read('minute')) || 0,
      hour: Number(read('hour') === '24' ? '0' : read('hour')) || 0,
      day: Number(read('day')) || 1,
      month: Number(read('month')) || 1,
      weekday: weekdayMap[read('weekday')] === undefined ? 0 : weekdayMap[read('weekday')],
    };
  } catch (error) {
    return zoneParts(date, 'local');
  }
}

/** Test one Date against a parsed cron expression in a timezone. */
function cronMatches(parsed, date, timezone) {
  const parts = zoneParts(date, timezone);
  const check = (field, value) => field === null || field.has(value);
  const dayOfMonthRestricted = parsed.dayOfMonth !== null;
  const dayOfWeekRestricted = parsed.dayOfWeek !== null;
  const dayOfMonthMatch = check(parsed.dayOfMonth, parts.day);
  const dayOfWeekMatch = check(parsed.dayOfWeek, parts.weekday);
  const dayMatches =
    dayOfMonthRestricted && dayOfWeekRestricted ? dayOfMonthMatch || dayOfWeekMatch : dayOfMonthMatch && dayOfWeekMatch;
  return (
    check(parsed.minute, parts.minute) &&
    check(parsed.hour, parts.hour) &&
    dayMatches &&
    check(parsed.month, parts.month)
  );
}

/** Find the next cron occurrence after a timestamp in a timezone (bounded to 90 days). */
function nextCronOccurrence(parsed, fromMs, timezone) {
  if (parsed === null) return null;
  const cursor = new Date(fromMs);
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);
  const limit = 90 * 24 * 60;
  for (let index = 0; index < limit; index += 1) {
    if (cronMatches(parsed, cursor, timezone)) return cursor.getTime();
    cursor.setMinutes(cursor.getMinutes() + 1);
  }
  return null;
}

/** Decide whether a scheduled cleanup is due and when it will next run. */
function evaluateCleanupSchedule(mode, time, cron, timezone, lastRunAt, now) {
  const current = now === undefined ? Date.now() : now;
  const todayOccurrence = todayAtScheduleTime(time);
  const dailyInterval = 86400000;
  if (mode === 'cron') {
    const parsed = parseCronExpression(cron);
    if (parsed === null) return { due: false, nextRunAt: null };
    const offset = timezone;
    const next = nextCronOccurrence(parsed, current, offset);
    let due = false;
    if ((lastRunAt || 0) > 0) {
      const occurrence = nextCronOccurrence(parsed, lastRunAt, offset);
      due = occurrence !== null && occurrence <= current;
    }
    return { due, nextRunAt: next };
  }
  if (mode === 'daily') {
    const due = current >= todayOccurrence && (lastRunAt || 0) < todayOccurrence;
    const next = current >= todayOccurrence ? todayOccurrence + dailyInterval : todayOccurrence;
    return { due, nextRunAt: next };
  }
  if (mode === 'weekly') {
    if ((lastRunAt || 0) <= 0) return { due: false, nextRunAt: todayOccurrence > current ? todayOccurrence : todayOccurrence + 7 * dailyInterval };
    const occurrence = lastRunAt + 7 * dailyInterval;
    return { due: current >= occurrence, nextRunAt: occurrence };
  }
  return { due: false, nextRunAt: null };
}

/** Summary of the scheduled-cleanup state (last run, result, runs, next due). */
async function readCleanupScheduleState() {
  let state = { lastRunAt: 0, lastResult: null, runs: [] };
  try {
    const parsed = JSON.parse(await readFile(cleanupSchedulePath(), 'utf8'));
    state = {
      lastRunAt: typeof parsed.lastRunAt === 'number' ? parsed.lastRunAt : 0,
      lastResult: parsed.lastResult || null,
      runs: Array.isArray(parsed.runs) ? parsed.runs.slice(0, 20) : [],
    };
  } catch (error) {
    // no schedule state yet
  }
  const document = await readFile(path.join(path.dirname(resolveStoreFile()), 'items.json'), 'utf8')
    .then((text) => JSON.parse(text))
    .catch(() => null);
  const settings = document && document.settings ? normalizeSettings(document.settings) : null;
  const mode = settings ? settings.cleanupSchedule : 'off';
  const time = settings ? settings.cleanupScheduleTime : '03:00';
  const cron = settings ? settings.cleanupScheduleCron : '';
  const timezone = settings ? settings.cleanupScheduleTimezone : 'local';
  const evaluated = evaluateCleanupSchedule(mode, time, cron, timezone, state.lastRunAt, Date.now());
  return { mode, time, cron, timezone, lastRunAt: state.lastRunAt, lastResult: state.lastResult, runs: state.runs, nextRunAt: evaluated.nextRunAt };
}

/** Path of the webhook dedupe state. */
function budgetWebhookStatePath() {
  return path.join(path.dirname(resolveStoreFile()), 'budget-webhook-state.json');
}

/** Failed-webhook retry queue file. */
function webhookQueuePath() {
  return path.join(path.dirname(resolveStoreFile()), 'webhook-queue.json');
}

/** Read the bounded webhook retry queue. */
async function readWebhookQueue() {
  if (webhookQueueStore !== null) {
    try {
      const document = await webhookQueueStore.load();
      if (Array.isArray(document.webhookQueue)) return document.webhookQueue.slice(0, 20);
    } catch (error) {
      // fall back to the legacy file
    }
  }
  try {
    const parsed = JSON.parse(await readFile(webhookQueuePath(), 'utf8'));
    return Array.isArray(parsed && parsed.items) ? parsed.items.slice(0, 20) : [];
  } catch (error) {
    return [];
  }
}

/** Persist the bounded webhook retry queue (inside the store document). */
async function writeWebhookQueue(items) {
  const bounded = items.slice(0, 20);
  if (webhookQueueStore !== null) {
    try {
      return await webhookQueueStore.setWebhookQueue(bounded);
    } catch (error) {
      // fall back to the legacy file
    }
  }
  await mkdir(path.dirname(webhookQueuePath()), { recursive: true });
  await writeFile(webhookQueuePath(), JSON.stringify({ version: 1, items: bounded }, null, 2), 'utf8');
  return bounded;
}

/** Add one failed webhook delivery to the retry queue. */
async function enqueueWebhookFailure(url, template, payload, error) {
  const items = await readWebhookQueue();
  items.unshift({
    at: Date.now(),
    nextAt: Date.now() + 60000,
    attempts: 0,
    url,
    template,
    payload,
    lastError: String((error && error.message) || error),
  });
  return writeWebhookQueue(items);
}

/** Retry due webhook failures (bounded backoff, 5 attempts max). */
async function processWebhookQueue(limit, force) {
  const items = await readWebhookQueue();
  const now = Date.now();
  let sent = 0;
  let failed = 0;
  const remaining = [];
  const max = typeof limit === 'number' ? limit : 5;
  const retryAll = force === true;
  for (const item of items) {
    if (sent + failed >= max) {
      remaining.push(item);
      continue;
    }
    if (!retryAll && typeof item.nextAt === 'number' && item.nextAt > now) {
      remaining.push(item);
      continue;
    }
    try {
      const response = await fetch(item.url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(item.payload),
        signal: AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined,
      });
      if (response.ok) sent += 1;
      else {
        failed += 1;
        item.attempts = (item.attempts || 0) + 1;
        item.lastError = 'HTTP ' + response.status;
        item.nextAt = now + Math.min(300000, 60000 * item.attempts);
        if (item.attempts < 5) remaining.push(item);
      }
    } catch (error) {
      failed += 1;
      item.attempts = (item.attempts || 0) + 1;
      item.lastError = String((error && error.message) || error);
      item.nextAt = now + Math.min(300000, 60000 * item.attempts);
      if (item.attempts < 5) remaining.push(item);
    }
  }
  const queue = await writeWebhookQueue(remaining);
  return { sent, failed, remaining: queue.length, queue };
}

/** Send one budget webhook when over/warned (once per day per event; force skips dedupe). */
async function sendBudgetWebhook(document, usage, budget, options) {
  const force = options && options.force === true;
  const url = document && document.settings ? document.settings.budgetWebhookUrl : '';
  if (typeof url !== 'string' || !/^https?:\/\//.test(url)) return { sent: false, reason: 'no webhook url' };
  const event = budget && budget.over === true ? 'over' : budget && budget.warn === true ? 'warn' : '';
  if (event.length === 0) return { sent: false, reason: 'budget ok' };
  const key = dayKeyOfMs(Date.now()) + '|' + event;
  if (!force) {
    const previous = await readFile(budgetWebhookStatePath(), 'utf8')
      .then((text) => JSON.parse(text))
      .catch(() => ({}));
    if (previous && previous.key === key) return { sent: false, reason: 'already sent today' };
  }
  const template = document && document.settings && document.settings.budgetWebhookTemplate === 'slack'
    ? 'slack'
    : document && document.settings && document.settings.budgetWebhookTemplate === 'feishu'
      ? 'feishu'
      : 'generic';
  const text =
    (event === 'over' ? '预算超支：' : '预算预警：') +
    '今日已用 ¥' + Number(budget.todayCost || 0).toFixed(2) + ' / 预算 ¥' + Number(budget.limit || 0).toFixed(2) +
    '（' + Number(budget.percent || 0) + '%）';
  const fields = {
    event: 'budget-' + event,
    at: Date.now(),
    todayCost: budget.todayCost,
    limit: budget.limit,
    percent: budget.percent,
    monthlyCost: budget.monthlyCost,
    monthlyLimit: budget.monthlyLimit,
    totalTokens: usage && usage.totals ? usage.totals.totalTokens : 0,
  };
  const payload = template === 'slack' ? { text } : template === 'feishu' ? { msg_type: 'text', content: { text } } : fields;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined,
    });
    if (!force) await writeFile(budgetWebhookStatePath(), JSON.stringify({ key, at: Date.now(), status: response.status }), 'utf8').catch(() => {});
    return { sent: true, status: response.status, event, template, payload };
  } catch (error) {
    if (!force) await enqueueWebhookFailure(url, template, payload, error).catch(() => {});
    return { sent: false, queued: !force, error: String((error && error.message) || error) };
  }
}

/** Path of the scheduled-cleanup state file. */
function cleanupSchedulePath() {
  return path.join(path.dirname(resolveStoreFile()), 'cleanup-schedule.json');
}

/** Run the scheduled cleanup once and persist its last-run state. */
async function runAutoCleanup(store) {
  const result = await runCleanupSelection(store, AUTO_CLEAN_CATEGORIES, { auto: true });
  const previous = await readCleanupScheduleState();
  const now = Date.now();
  const run = { at: now, removed: result.removed, freed: result.freed, errors: result.errors, ok: result.errors === 0, auto: true };
  const state = {
    lastRunAt: now,
    lastResult: { removed: result.removed, freed: result.freed, errors: result.errors, auto: true },
    runs: [run, ...(previous.runs || [])].slice(0, 20),
  };
  await mkdir(path.dirname(cleanupSchedulePath()), { recursive: true });
  await writeFile(cleanupSchedulePath(), JSON.stringify(state, null, 2), 'utf8').catch(() => {});
  const schedule = await readCleanupScheduleState();
  return { ...result, schedule };
}


/** Undo one cleanup record from the trash; shared by single and batch restore. */
async function undoCleanupRecord(id) {
  const history = await readCleanupHistory();
  const entry = history.find((record) => record.id === id);
  if (entry === undefined) return { ok: false, status: 404, error: 'cleanup record not found' };
  if (entry.recoverable !== true) return { ok: false, status: 409, error: 'cleanup record is not recoverable' };
  if (typeof entry.expiresAt === 'number' && Date.now() > entry.expiresAt) return { ok: false, status: 409, error: 'cleanup record expired' };
  let restored = 0;
  let failed = 0;
  const restoredAt = Date.now();
  for (const item of Array.isArray(entry.items) ? entry.items : []) {
    if (await restoreFromCleanupTrash(item, restoredAt)) restored += 1;
    else failed += 1;
  }
  await rm(path.join(cleanupTrashDir(), id), { recursive: true, force: true }).catch(() => {});
  entry.recoverable = false;
  entry.undoneAt = restoredAt;
  entry.restored = restored;
  entry.failed = failed;
  const nextHistory = await writeCleanupHistory(history);
  return { ok: true, restored, failed, history: nextHistory, entry };
}

/** Share access statistics file. */
function shareStatsPath() {
  return path.join(path.dirname(resolveStoreFile()), 'share-stats.json');
}

/** Record one share-page access, keeping a referrer breakdown. */
async function recordShareAccess(name, referrer) {
  const stats = await readFile(shareStatsPath(), 'utf8')
    .then((text) => JSON.parse(text))
    .catch(() => ({}));
  let ref = 'direct';
  if (typeof referrer === 'string' && referrer.length > 0) {
    try {
      ref = new URL(referrer).hostname || 'direct';
    } catch (error) {
      ref = 'direct';
    }
  }
  const previous = stats[name] || { count: 0, firstAt: Date.now(), refs: {} };
  const refs = previous.refs && typeof previous.refs === 'object' ? previous.refs : {};
  refs[ref] = (refs[ref] || 0) + 1;
  stats[name] = { count: previous.count + 1, firstAt: previous.firstAt, lastAt: Date.now(), refs };
  const names = Object.keys(stats).sort((left, right) => (stats[right].lastAt || 0) - (stats[left].lastAt || 0)).slice(0, 200);
  const bounded = {};
  for (const key of names) bounded[key] = stats[key];
  await writeFile(shareStatsPath(), JSON.stringify(bounded, null, 2), 'utf8').catch(() => {});
}

/** Read share access statistics with referrer breakdown, newest first. */
async function readShareStats() {
  const stats = await readFile(shareStatsPath(), 'utf8')
    .then((text) => JSON.parse(text))
    .catch(() => ({}));
  return Object.entries(stats)
    .map(([name, value]) => ({ name, count: value.count || 0, firstAt: value.firstAt || null, lastAt: value.lastAt || null, refs: value.refs || {} }))
    .sort((left, right) => (right.lastAt || 0) - (left.lastAt || 0))
    .slice(0, 50);
}

/** CRC32 for PNG chunks. */
function pngCrc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/** Encode one PNG chunk. */
function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(pngCrc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

/** Draw a tiny 5x7 bitmap title into the PNG buffer. */
function drawPngTitle(raw, width, text, originX, originY) {
  const glyphs = {
    S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
    H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
    A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
    E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
    ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
  };
  let cursorX = originX;
  for (const character of text) {
    const glyph = glyphs[character] || glyphs[' '];
    for (let row = 0; row < glyph.length; row += 1) {
      for (let column = 0; column < glyph[row].length; column += 1) {
        if (glyph[row][column] !== '1') continue;
        const x = cursorX + column;
        const y = originY + row;
        if (x >= width || y < 0) continue;
        const offset = y * (width * 4 + 1) + 1 + x * 4;
        raw[offset] = 15;
        raw[offset + 1] = 23;
        raw[offset + 2] = 42;
        raw[offset + 3] = 255;
      }
    }
    cursorX += 6;
  }
}

/** Render the share-access bar chart into a PNG with title, axes, and grid. */
function renderShareChartPng(stats) {
  const width = 480;
  const height = 260;
  const left = 32;
  const bottom = 232;
  const top = 30;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * (width * 4 + 1);
    raw[rowOffset] = 0;
    for (let x = 0; x < width; x += 1) {
      const offset = rowOffset + 1 + x * 4;
      raw[offset] = 255;
      raw[offset + 1] = 255;
      raw[offset + 2] = 255;
      raw[offset + 3] = 255;
    }
  }
  const setPixel = (x, y, red, green, blue) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const offset = y * (width * 4 + 1) + 1 + x * 4;
    raw[offset] = red;
    raw[offset + 1] = green;
    raw[offset + 2] = blue;
    raw[offset + 3] = 255;
  };
  drawPngTitle(raw, width, 'SHARE ACCESS', 20, 10);
  for (let grid = 0; grid <= 4; grid += 1) {
    const y = bottom - Math.round(((bottom - top) * grid) / 4);
    for (let x = left; x < width - 16; x += 1) setPixel(x, y, 226, 232, 240);
  }
  for (let y = top; y <= bottom; y += 1) setPixel(left, y, 100, 116, 139);
  for (let x = left; x < width - 16; x += 1) setPixel(x, bottom, 100, 116, 139);
  const bars = stats.slice(0, 10);
  const maxCount = Math.max(1, ...bars.map((entry) => entry.count || 0));
  const barWidth = Math.max(8, Math.floor((width - left - 32) / Math.max(1, bars.length)) - 8);
  bars.forEach((entry, index) => {
    const barHeight = Math.max(2, Math.round(((bottom - top) * (entry.count || 0)) / maxCount));
    const barLeft = left + 12 + index * (barWidth + 8);
    for (let y = bottom - barHeight; y < bottom; y += 1) {
      for (let x = barLeft; x < barLeft + barWidth && x < width - 16; x += 1) setPixel(x, y, 37, 99, 235);
    }
  });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

/** Build the scan/clean route; only rescan-produced items inside their recorded root can be deleted. */
function createCleanupRoute(store) {
  return async (req, res) => {
    let url;
    try {
      url = new URL(req.url || '/', 'http://localhost');
    } catch (error) {
      sendJson(res, 400, { error: 'bad url' });
      return;
    }
    if (url.pathname !== CLEANUP_PATH) {
      sendJson(res, 404, { error: 'not found' });
      return;
    }
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'method not allowed' });
      return;
    }
    if (!requireReadToken(req, res)) return;
    try {
      const body = await readJsonBody(req);
      const action = body && typeof body.action === 'string' ? body.action : 'scan';
      if (action === 'cron-preview-multi') {
        const timezones = Array.isArray(body.timezones)
          ? body.timezones.filter((zone) => typeof zone === 'string' && zone.length <= 64).slice(0, 5)
          : ['local', 'UTC', 'Asia/Shanghai'];
        const parsed = parseCronExpression(body && typeof body.cron === 'string' ? body.cron : '');
        if (parsed === null) {
          sendJson(res, 400, { error: 'invalid cron expression', results: [] });
          return;
        }
        const results = timezones.map((timezone) => {
          const next = [];
          let cursor = Date.now();
          for (let index = 0; index < 3; index += 1) {
            const occurrence = nextCronOccurrence(parsed, cursor, timezone);
            if (occurrence === null) break;
            next.push(occurrence);
            cursor = occurrence;
          }
          return { timezone, next };
        });
        sendJson(res, 200, { results });
        return;
      }
      if (action === 'cron-preview') {
        const parsed = parseCronExpression(body && typeof body.cron === 'string' ? body.cron : '');
        if (parsed === null) {
          sendJson(res, 400, { error: 'invalid cron expression', next: [] });
          return;
        }
        const timezone = body && typeof body.timezone === 'string' ? body.timezone : 'local';
        const next = [];
        let cursor = Date.now();
        for (let index = 0; index < 10; index += 1) {
          const occurrence = nextCronOccurrence(parsed, cursor, timezone);
          if (occurrence === null) break;
          next.push(occurrence);
          cursor = occurrence;
        }
        sendJson(res, 200, { next, timezone });
        return;
      }
      if (action === 'webhook-export') {
        const items = await readWebhookQueue();
        const file = path.join(path.dirname(resolveStoreFile()), 'webhook-queue-export.json');
        await writeFile(file, JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), items }, null, 2), 'utf8');
        sendJson(res, 200, { path: file, count: items.length, bytes: Buffer.byteLength(JSON.stringify(items)) });
        return;
      }
      if (action === 'webhook-import') {
        const incoming = Array.isArray(body.items) ? body.items : [];
        const normalized = normalizeWebhookQueue(incoming);
        const existing = await readWebhookQueue();
        const merged = [...existing];
        let imported = 0;
        for (const item of normalized) {
          if (merged.some((entry) => entry.at === item.at && entry.url === item.url)) continue;
          merged.unshift(item);
          imported += 1;
        }
        const queue = await writeWebhookQueue(merged);
        sendJson(res, 200, { imported, remaining: queue.length, queue });
        return;
      }
      if (action === 'webhook-batch-edit') {
        const ats = Array.isArray(body.ats) ? body.ats.filter((at) => typeof at === 'number') : [];
        const items = await readWebhookQueue();
        let updated = 0;
        for (const item of items) {
          if (!ats.includes(item.at)) continue;
          if (body.payload !== undefined) {
            try {
              item.payload = typeof body.payload === 'string' ? JSON.parse(body.payload) : body.payload;
            } catch (error) {
              sendJson(res, 400, { error: 'payload must be valid JSON' });
              return;
            }
          }
          if (typeof body.url === 'string' && /^https?:\/\//.test(body.url)) item.url = body.url;
          item.attempts = 0;
          item.nextAt = Date.now();
          updated += 1;
        }
        const queue = await writeWebhookQueue(items);
        sendJson(res, 200, { updated, queue });
        return;
      }
      if (action === 'webhook-batch-resend') {
        const ats = Array.isArray(body.ats) ? body.ats.filter((at) => typeof at === 'number') : [];
        const items = await readWebhookQueue();
        for (const item of items) if (ats.includes(item.at)) item.nextAt = Date.now();
        await writeWebhookQueue(items);
        const result = await processWebhookQueue(10, true);
        sendJson(res, 200, result);
        return;
      }
      if (action === 'webhook-batch-remove') {
        const ats = Array.isArray(body.ats) ? body.ats.filter((at) => typeof at === 'number') : [];
        const items = await readWebhookQueue();
        const queue = await writeWebhookQueue(items.filter((item) => !ats.includes(item.at)));
        sendJson(res, 200, { removed: items.length - queue.length, remaining: queue.length, queue });
        return;
      }
      if (action === 'webhook-edit') {
        const at = body && typeof body.at === 'number' ? body.at : -1;
        const items = await readWebhookQueue();
        const item = items.find((entry) => entry.at === at);
        if (item === undefined) {
          sendJson(res, 404, { error: 'webhook queue item not found' });
          return;
        }
        if (body && body.payload !== undefined) {
          if (typeof body.payload === 'string') {
            try {
              item.payload = JSON.parse(body.payload);
            } catch (error) {
              sendJson(res, 400, { error: 'payload must be valid JSON' });
              return;
            }
          } else if (body.payload && typeof body.payload === 'object') {
            item.payload = body.payload;
          }
        }
        if (body && typeof body.url === 'string' && /^https?:\/\//.test(body.url)) item.url = body.url;
        item.attempts = 0;
        item.nextAt = Date.now();
        const queue = await writeWebhookQueue(items);
        sendJson(res, 200, { updated: true, queue });
        return;
      }
      if (action === 'webhook-resend') {
        const at = body && typeof body.at === 'number' ? body.at : -1;
        const items = await readWebhookQueue();
        const target = items.find((entry) => entry.at === at);
        if (target === undefined) {
          sendJson(res, 404, { error: 'webhook queue item not found' });
          return;
        }
        target.nextAt = Date.now();
        await writeWebhookQueue(items);
        const result = await processWebhookQueue(1, true);
        sendJson(res, 200, result);
        return;
      }
      if (action === 'webhook-remove') {
        const at = body && typeof body.at === 'number' ? body.at : body && typeof body.index === 'number' ? body.index : -1;
        const items = await readWebhookQueue();
        const remaining = items.filter((item, index) => (typeof at === 'number' && at >= 1e12 ? item.at !== at : index !== at));
        const queue = await writeWebhookQueue(remaining);
        sendJson(res, 200, { removed: items.length - queue.length, remaining: queue.length, queue });
        return;
      }
      if (action === 'share-chart-png') {
        const fromRaw = body && typeof body.from === 'string' ? Date.parse(body.from) : NaN;
        const toRaw = body && typeof body.to === 'string' ? Date.parse(body.to) : NaN;
        const fromMs = Number.isFinite(fromRaw) ? fromRaw : null;
        const toMs = Number.isFinite(toRaw) ? toRaw + 24 * 60 * 60 * 1000 - 1 : null;
        const stats = (await readShareStats()).filter((entry) => {
          const at = entry.lastAt || entry.firstAt || 0;
          return (fromMs === null || at >= fromMs) && (toMs === null || at <= toMs);
        });
        const png = renderShareChartPng(stats);
        const file = path.join(path.dirname(resolveStoreFile()), 'share-chart.png');
        await writeFile(file, png);
        sendJson(res, 200, { path: file, count: stats.length, bytes: png.length });
        return;
      }
      if (action === 'share-csv') {
        const fromRaw = body && typeof body.from === 'string' ? Date.parse(body.from) : NaN;
        const toRaw = body && typeof body.to === 'string' ? Date.parse(body.to) : NaN;
        const fromMs = Number.isFinite(fromRaw) ? fromRaw : null;
        const toMs = Number.isFinite(toRaw) ? toRaw + 24 * 60 * 60 * 1000 - 1 : null;
        const stats = (await readShareStats()).filter((entry) => {
          const at = entry.lastAt || entry.firstAt || 0;
          return (fromMs === null || at >= fromMs) && (toMs === null || at <= toMs);
        });
        const escapeCsv = (value) => '"' + String(value === null || value === undefined ? '' : value).replace(/"/g, '""') + '"';
        const lines = ['name,count,firstAt,lastAt,refs'];
        for (const entry of stats) {
          const refs = Object.entries(entry.refs || {}).map(([key, value]) => key + ':' + value).join('|');
          lines.push([escapeCsv(entry.name), escapeCsv(entry.count), escapeCsv(entry.firstAt), escapeCsv(entry.lastAt), escapeCsv(refs)].join(','));
        }
        const csv = lines.join('\n') + '\n';
        const file = path.join(path.dirname(resolveStoreFile()), 'share-stats.csv');
        await writeFile(file, csv, 'utf8');
        sendJson(res, 200, { path: file, count: stats.length, bytes: Buffer.byteLength(csv), range: { from: fromMs, to: toMs } });
        return;
      }
      if (action === 'webhook-retry') {
        const result = await processWebhookQueue(10, true);
        sendJson(res, 200, result);
        return;
      }
      if (action === 'webhook-test') {
        const document = await store.load();
        const usage = await buildUsageReport(store);
        const sample = { over: true, warn: false, limit: 1, todayCost: 2, percent: 200, monthlyCost: 0, monthlyLimit: 0 };
        const result = await sendBudgetWebhook(document, usage, sample, { force: true });
        sendJson(res, 200, result);
        return;
      }
      if (action === 'restore') {
        const ids = Array.isArray(body.ids) ? body.ids.filter((id) => typeof id === 'string').slice(0, 20) : [];
        let restored = 0;
        let failed = 0;
        for (const id of ids) {
          const result = await undoCleanupRecord(id);
          if (result.ok === true) restored += result.restored;
          else failed += 1;
        }
        sendJson(res, 200, { restored, failed, history: await readCleanupHistory() });
        return;
      }
      if (action === 'undo') {
        const result = await undoCleanupRecord(body && typeof body.id === 'string' ? body.id : '');
        if (result.ok !== true) {
          sendJson(res, result.status || 409, { error: result.error });
          return;
        }
        sendJson(res, 200, { restored: result.restored, failed: result.failed, history: result.history });
        return;
      }
      const scan = await scanCleanup(store);
      if (action === 'scan') {
        sendJson(res, 200, scan);
        return;
      }
      if (action === 'empty') {
        await rm(cleanupTrashDir(), { recursive: true, force: true }).catch(() => {});
        const history = await readCleanupHistory();
        for (const entry of history) {
          if (entry.recoverable === true) {
            entry.recoverable = false;
            entry.emptiedAt = Date.now();
          }
        }
        const nextHistory = await writeCleanupHistory(history);
        sendJson(res, 200, { emptied: true, history: nextHistory, trash: await scanTrashSummary() });
        return;
      }
      if (action === 'auto') {
        const result = await runAutoCleanup(store);
        sendJson(res, 200, { removed: result.removed, freed: result.freed, errors: result.errors, history: result.history, schedule: result.schedule });
        return;
      }
      if (action !== 'clean') {
        sendJson(res, 400, { error: 'unknown action' });
        return;
      }
      const result = await runCleanupSelection(store, body.categories, { auto: false });
      sendJson(res, 200, { removed: result.removed, freed: result.freed, errors: result.errors, categories: [...(body.categories || [])], history: result.history });
    } catch (error) {
      sendJson(res, 500, { error: String((error && error.message) || error) });
    }
  };
}

/** Build the attachment upload/serve route (token-protected, loopback-only store). */
function createFilesRoute() {
  const dir = path.join(path.dirname(resolveStoreFile()), 'files');
  return async (req, res) => {
    let url;
    try {
      url = new URL(req.url || '/', 'http://localhost');
    } catch (error) {
      sendJson(res, 400, { error: 'bad url' });
      return;
    }
    if (req.method === 'POST' && url.pathname === FILES_PATH) {
      if (!requireReadToken(req, res)) return;
      try {
        const nameRaw = requestHeader(req, 'x-file-name');
        let name = 'file';
        if (typeof nameRaw === 'string' && nameRaw.length > 0) {
          try {
            name = decodeURIComponent(nameRaw);
          } catch (error) {
            name = nameRaw;
          }
        }
        const mediaType = (requestHeader(req, 'content-type') || 'application/octet-stream').split(';')[0].trim().slice(0, 100);
        const typeExtension =
          mediaType === 'image/png'
            ? 'png'
            : mediaType === 'image/jpeg'
              ? 'jpg'
              : mediaType === 'image/gif'
                ? 'gif'
                : mediaType === 'image/webp'
                  ? 'webp'
                  : mediaType === 'application/pdf'
                    ? 'pdf'
                    : mediaType === 'text/plain'
                      ? 'txt'
                      : mediaType === 'text/markdown'
                        ? 'md'
                        : mediaType === 'text/csv'
                          ? 'csv'
                          : mediaType === 'application/json'
                            ? 'json'
                            : mediaType === 'application/zip'
                              ? 'zip'
                              : '';
        const nameExtension = path.extname(name).replace('.', '').toLowerCase();
        const extension = ATTACHMENT_EXTENSIONS.includes(typeExtension)
          ? typeExtension
          : ATTACHMENT_EXTENSIONS.includes(nameExtension)
            ? nameExtension
            : '';
        if (extension.length === 0) {
          sendJson(res, 415, { error: 'unsupported attachment type' });
          return;
        }
        const buffer = await readRawBody(req, ATTACHMENT_MAX_BYTES);
        if (buffer.length === 0) {
          sendJson(res, 400, { error: 'empty attachment' });
          return;
        }
        const id = randomUUID() + '.' + extension;
        await mkdir(dir, { recursive: true });
        await writeFile(path.join(dir, id), buffer);
        sendJson(res, 200, {
          attachment: {
            id,
            name: name.slice(0, 160),
            size: buffer.length,
            mediaType: ATTACHMENT_CONTENT_TYPES[extension] || mediaType,
          },
          url: FILES_PATH + '/' + id,
        });
      } catch (error) {
        sendJson(res, 413, { error: 'attachment too large or invalid' });
      }
      return;
    }
    if (req.method === 'GET') {
      const id = url.pathname.startsWith(FILES_PATH + '/') ? decodeURIComponent(url.pathname.slice(FILES_PATH.length + 1)) : '';
      if (!/^[0-9a-f-]{36}\.[a-z0-9]{1,8}$/.test(id)) {
        sendJson(res, 404, { error: 'not found' });
        return;
      }
      const token = requestHeader(req, 'x-quick-note-token');
      const queryToken = url.searchParams.get('token');
      if (token !== READ_TOKEN && queryToken !== READ_TOKEN) {
        sendJson(res, 401, { error: 'unauthorized' });
        return;
      }
      const extension = id.split('.').pop();
      try {
        const buffer = await readFile(path.join(dir, id));
        res.writeHead(200, {
          'content-type': ATTACHMENT_CONTENT_TYPES[extension] || 'application/octet-stream',
          'content-length': String(buffer.length),
          'cache-control': 'no-store',
        });
        res.end(buffer);
      } catch (error) {
        sendJson(res, 404, { error: 'not found' });
      }
      return;
    }
    sendJson(res, 405, { error: 'method not allowed' });
  };
}

/**
 * Build the read-only system summary route used by the System tab.
 * @param store - the shared store.
 * @returns a request handler.
 */
function createAdminRoute(store) {
  return createReadRoute(ADMIN_PATH, async () => ({
    generatedAt: Date.now(),
    home: resolveDshHome(),
    profile: await readProfileSummary(),
    data: await readDataSummary(store),
    sessions: await readSessionsSummary(),
    plugin: { id: '@local/dsh-quick-note', stateRoute: STATE_PATH, adminRoute: ADMIN_PATH },
  }));
}

/**
 * Normalize one flashcard review schedule (SM-2 state).
 * @param raw - candidate review object.
 * @returns the canonical review schedule.
 */
function normalizeReview(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const ease = typeof source.ease === 'number' && Number.isFinite(source.ease) ? Math.min(5, Math.max(1.3, source.ease)) : 2.5;
  const intervalDays = typeof source.intervalDays === 'number' && Number.isFinite(source.intervalDays) ? Math.max(0, Math.floor(source.intervalDays)) : 0;
  const repetitions = typeof source.repetitions === 'number' && Number.isFinite(source.repetitions) ? Math.max(0, Math.floor(source.repetitions)) : 0;
  return {
    ease,
    intervalDays,
    repetitions,
    dueAt: typeof source.dueAt === 'number' && Number.isFinite(source.dueAt) ? source.dueAt : null,
    lastAt: typeof source.lastAt === 'number' && Number.isFinite(source.lastAt) ? source.lastAt : null,
  };
}

/**
 * Normalize one task checklist (bounded rows with ids, text, and done flag).
 * @param raw - candidate checklist.
 * @returns canonical rows.
 */
function normalizeChecklist(raw) {
  if (!Array.isArray(raw)) return [];
  const rows = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    if (typeof entry.id !== 'string' || entry.id.length === 0) continue;
    rows.push({
      id: entry.id.slice(0, 80),
      text: typeof entry.text === 'string' ? entry.text.slice(0, 200) : '',
      done: entry.done === true,
    });
    if (rows.length >= 50) break;
  }
  return rows;
}

/**
 * Coerce one stored item into the canonical shape; damaged entries are dropped so the
 * file never breaks the panel.
 * @param raw - candidate from disk, HTTP, or a tool argument.
 * @returns the canonical item, or undefined when the candidate is unusable.
 */
/** Normalize the attachment refs stored on one item (bounded metadata only). */
function normalizeAttachments(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  const attachments = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const id = typeof entry.id === 'string' ? entry.id.toLowerCase() : '';
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]{1,8}$/.test(id) || seen.has(id)) continue;
    seen.add(id);
    attachments.push({
      id,
      name: typeof entry.name === 'string' ? entry.name.slice(0, 160) : id,
      size: typeof entry.size === 'number' && Number.isFinite(entry.size) && entry.size >= 0 ? Math.floor(entry.size) : 0,
      mediaType: typeof entry.mediaType === 'string' ? entry.mediaType.slice(0, 100) : 'application/octet-stream',
    });
    if (attachments.length >= 12) break;
  }
  return attachments;
}

function normalizeItem(raw) {
  if (!raw || typeof raw !== 'object') return undefined;
  if (typeof raw.id !== 'string' || raw.id.length === 0) return undefined;
  const kind = KINDS.includes(raw.kind) ? raw.kind : 'note';
  const status = raw.status === 'done' ? 'done' : 'open';
  const tags = Array.isArray(raw.tags)
    ? raw.tags.filter((tag) => typeof tag === 'string' && tag.trim().length > 0).map((tag) => tag.trim().slice(0, 40)).slice(0, 12)
    : [];
  const now = Date.now();
  const due = typeof raw.due === 'number' && Number.isFinite(raw.due) ? raw.due : null;
  const priority = raw.priority === 'low' || raw.priority === 'high' ? raw.priority : 'normal';
  const doneAt = typeof raw.doneAt === 'number' && Number.isFinite(raw.doneAt) ? raw.doneAt : null;
  return {
    id: raw.id.slice(0, 80),
    kind,
    title: typeof raw.title === 'string' ? raw.title.slice(0, 200) : '',
    body: typeof raw.body === 'string' ? raw.body.slice(0, 200000) : '',
    tags,
    status,
    priority,
    due,
    doneAt,
    review: normalizeReview(raw.review),
    health: HEALTH_KINDS.includes(kind) ? normalizeHealth(raw.health) : normalizeHealth(undefined),
    record: kind === 'record' ? normalizeRecord(raw.record) : normalizeRecord(undefined),
    order: typeof raw.order === 'number' && Number.isFinite(raw.order) ? raw.order : null,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : now,
    rev: typeof raw.rev === 'number' && Number.isFinite(raw.rev) && raw.rev >= 0 ? Math.floor(raw.rev) : 0,
    deletedAt: typeof raw.deletedAt === 'number' && Number.isFinite(raw.deletedAt) ? raw.deletedAt : null,
    checklist: kind === 'task' ? normalizeChecklist(raw.checklist) : [],
    repeat: kind === 'task' && REPEATS.includes(raw.repeat) ? raw.repeat : 'none',
    attachments: normalizeAttachments(raw.attachments),
  };
}

/**
 * Bump the per-item rev of entries whose content changed since the previous write.
 * Unchanged items keep the higher of the stored/incoming rev, so stale clients cannot lower it.
 */
function applyItemRevisions(previousItems, nextItems) {
  const previous = new Map((previousItems || []).map((item) => [item.id, item]));
  return nextItems.map((item) => {
    const old = previous.get(item.id);
    if (old === undefined) return item;
    const { rev: incomingRev, ...incomingRest } = item;
    const { rev: oldRev, ...oldRest } = old;
    if (JSON.stringify(incomingRest) === JSON.stringify(oldRest)) return { ...item, rev: Math.max(incomingRev, oldRev) };
    return { ...item, rev: Math.max(incomingRev, oldRev + 1) };
  });
}

/** Keep active items in order and only the newest tombstones (bounded deleted history). */
function pruneDeletedItems(items) {
  const tombstones = items.filter((item) => item.deletedAt !== null).sort((left, right) => right.deletedAt - left.deletedAt).slice(0, 200);
  if (tombstones.length === 0) return items;
  const keep = new Set(tombstones.map((item) => item.id));
  return items.filter((item) => item.deletedAt === null || keep.has(item.id));
}

/** Highest item/review change timestamp in one document (used for delta polling). */
function documentWatermark(document) {
  let watermark = 0;
  for (const item of document.items || []) {
    if (typeof item.updatedAt === 'number') watermark = Math.max(watermark, item.updatedAt);
    if (typeof item.deletedAt === 'number') watermark = Math.max(watermark, item.deletedAt);
  }
  for (const review of document.reviews || []) {
    if (typeof review.at === 'number') watermark = Math.max(watermark, review.at);
  }
  return watermark;
}

/**
 * Normalize a whole item list.
 * @param raw - candidate array.
 * @returns canonical items in their original order.
 */
function normalizeItems(raw) {
  if (!Array.isArray(raw)) return [];
  const items = [];
  for (const entry of raw) {
    const item = normalizeItem(entry);
    if (item !== undefined) items.push(item);
  }
  return items;
}

/**
 * Normalize one on-disk document.
 * @param raw - parsed JSON from disk.
 * @returns the canonical document.
 */
function normalizeDocument(raw) {
  if (!raw || typeof raw !== 'object') {
    return { version: STORE_VERSION, revision: 0, items: [], settings: normalizeSettings(undefined), reviews: [], types: [], webhookQueue: [] };
  }
  return {
    version: STORE_VERSION,
    revision: typeof raw.revision === 'number' && Number.isFinite(raw.revision) ? raw.revision : 0,
    items: pruneDeletedItems(normalizeItems(raw.items)),
    settings: normalizeSettings(raw.settings),
    reviews: normalizeReviewLog(raw.reviews),
    types: normalizeTypes(raw.types),
    webhookQueue: normalizeWebhookQueue(raw.webhookQueue),
  };
}

/** Normalize the persisted webhook retry queue (max 20 entries). */
function normalizeWebhookQueue(raw) {
  if (!Array.isArray(raw)) return [];
  const items = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    if (typeof entry.url !== 'string' || !/^https?:\/\//.test(entry.url)) continue;
    if (!entry.payload || typeof entry.payload !== 'object') continue;
    if (typeof entry.at !== 'number' || !Number.isFinite(entry.at)) continue;
    items.push({
      at: entry.at,
      nextAt: typeof entry.nextAt === 'number' && Number.isFinite(entry.nextAt) ? entry.nextAt : entry.at,
      attempts: typeof entry.attempts === 'number' && Number.isFinite(entry.attempts) ? Math.max(0, Math.min(5, Math.floor(entry.attempts))) : 0,
      url: entry.url.slice(0, 500),
      template: typeof entry.template === 'string' ? entry.template.slice(0, 20) : 'generic',
      payload: entry.payload,
      lastError: typeof entry.lastError === 'string' ? entry.lastError.slice(0, 300) : '',
    });
  }
  return items.slice(0, 20);
}

/**
 * Normalize the review log (one record per rated card, newest last).
 * @param raw - candidate review array.
 * @returns canonical review records, capped at the newest 5000.
 */
function normalizeReviewLog(raw) {
  if (!Array.isArray(raw)) return [];
  const records = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    if (typeof entry.itemId !== 'string' || entry.itemId.length === 0) continue;
    if (entry.quality !== 1 && entry.quality !== 2 && entry.quality !== 3 && entry.quality !== 4 && entry.quality !== 5) continue;
    if (typeof entry.at !== 'number' || !Number.isFinite(entry.at)) continue;
    records.push({ itemId: entry.itemId.slice(0, 80), quality: entry.quality, at: entry.at });
  }
  return records.slice(-5000);
}

/**
 * Normalize the token pricing settings (CNY per million tokens).
 * @param raw - candidate pricing object.
 * @returns the canonical pricing.
 */
function normalizePricing(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const price = (value, fallback) =>
    typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100000 ? value : fallback;
  return {
    inputHit: price(source.inputHit, DEFAULT_PRICING.inputHit),
    inputMiss: price(source.inputMiss, DEFAULT_PRICING.inputMiss),
    output: price(source.output, DEFAULT_PRICING.output),
  };
}

/** Workspace assessments saved from the panel (keyed by workspace path). */
function normalizeWorkspaceNotes(raw) {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const notes = {};
  let count = 0;
  for (const [key, value] of Object.entries(source)) {
    if (count >= 100) break;
    if (typeof key !== 'string' || key.length === 0 || !value || typeof value !== 'object') continue;
    const note = typeof value.note === 'string' ? value.note.slice(0, 2000) : '';
    const rating = value.rating === 'high' || value.rating === 'medium' || value.rating === 'low' ? value.rating : '';
    const socialNote = typeof value.socialNote === 'string' ? value.socialNote.slice(0, 2000) : '';
    const socialRating =
      value.socialRating === 'high' || value.socialRating === 'medium' || value.socialRating === 'low' ? value.socialRating : '';
    if (note.length === 0 && rating.length === 0 && socialNote.length === 0 && socialRating.length === 0) continue;
    notes[key.slice(0, 400)] = {
      note,
      rating,
      socialNote,
      socialRating,
      updatedAt: typeof value.updatedAt === 'number' ? value.updatedAt : Date.now(),
    };
    count += 1;
  }
  return notes;
}

/** Normalize the per-workspace score history used by the value trend (keyed by workspace path). */
function normalizeValueHistory(raw) {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const history = {};
  let count = 0;
  for (const [key, value] of Object.entries(source)) {
    if (count >= 100) break;
    if (typeof key !== 'string' || key.length === 0 || !Array.isArray(value)) continue;
    const entries = [];
    for (const entry of value.slice(-12)) {
      if (!entry || typeof entry !== 'object') continue;
      if (typeof entry.at !== 'number' || !Number.isFinite(entry.at)) continue;
      const valueScore = typeof entry.valueScore === 'number' && Number.isFinite(entry.valueScore) ? entry.valueScore : 0;
      const socialScore = typeof entry.socialScore === 'number' && Number.isFinite(entry.socialScore) ? entry.socialScore : 0;
      entries.push({ at: entry.at, valueScore, socialScore });
    }
    if (entries.length === 0) continue;
    history[key.slice(0, 400)] = entries;
    count += 1;
  }
  return history;
}

/**
 * Normalize the document settings.
 * @param raw - candidate settings object.
 * @returns the canonical settings.
 */
function normalizeSettings(raw) {
  const feedUrl = raw && typeof raw.harnessFeedUrl === 'string' ? raw.harnessFeedUrl.trim().slice(0, 500) : '';
  return {
    brief: !(raw && raw.brief === false),
    pricing: normalizePricing(raw && raw.pricing),
    workspaceNotes: normalizeWorkspaceNotes(raw && raw.workspaceNotes),
    valueHistory: normalizeValueHistory(raw && raw.valueHistory),
    harnessFeedUrl: feedUrl === OFFICIAL_DIRECT_FEED ? OFFICIAL_DIRECT_FEED : /^https?:\/\//.test(feedUrl) ? feedUrl : '',
    harnessAutoUpdate: (raw && raw.harnessAutoUpdate) === true,
    harnessAutoCheck: (raw && raw.harnessAutoCheck) === true,
    tokenBudget:
      raw && typeof raw.tokenBudget === 'number' && Number.isFinite(raw.tokenBudget)
        ? Math.max(0, Math.min(1000000, Math.round(raw.tokenBudget * 100) / 100))
        : 0,
    tokenBudgetMonthly:
      raw && typeof raw.tokenBudgetMonthly === 'number' && Number.isFinite(raw.tokenBudgetMonthly)
        ? Math.max(0, Math.min(10000000, Math.round(raw.tokenBudgetMonthly * 100) / 100))
        : 0,
    cleanupSchedule: raw && (raw.cleanupSchedule === 'daily' || raw.cleanupSchedule === 'weekly' || raw.cleanupSchedule === 'cron') ? raw.cleanupSchedule : 'off',
    cleanupScheduleTime: raw && typeof raw.cleanupScheduleTime === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(raw.cleanupScheduleTime) ? raw.cleanupScheduleTime : '03:00',
    cleanupScheduleCron: raw && typeof raw.cleanupScheduleCron === 'string' && /^(\S+\s+){4}\S+$/.test(raw.cleanupScheduleCron.trim()) ? raw.cleanupScheduleCron.trim().slice(0, 100) : '',
    cleanupScheduleTimezone: normalizeScheduleTimezone(raw && raw.cleanupScheduleTimezone),
    backupIntervalMinutes:
      raw && typeof raw.backupIntervalMinutes === 'number' && Number.isFinite(raw.backupIntervalMinutes)
        ? Math.max(1, Math.min(1440, Math.round(raw.backupIntervalMinutes)))
        : 5,
    medReminderEnabled: raw && raw.medReminderEnabled === false ? false : true,
    shortcuts: {
      palette:
        raw && raw.shortcuts && typeof raw.shortcuts.palette === 'string' && raw.shortcuts.palette.trim().length > 0
          ? raw.shortcuts.palette.trim().slice(0, 40)
          : 'ctrl+k',
      help:
        raw && raw.shortcuts && typeof raw.shortcuts.help === 'string' && raw.shortcuts.help.trim().length > 0
          ? raw.shortcuts.help.trim().slice(0, 40)
          : '?',
    },
    budgetWebhookUrl:
      raw && typeof raw.budgetWebhookUrl === 'string' && /^https?:\/\//.test(raw.budgetWebhookUrl.trim())
        ? raw.budgetWebhookUrl.trim().slice(0, 500)
        : '',
    budgetWebhookTemplate: raw && ['slack', 'feishu'].includes(raw.budgetWebhookTemplate) ? raw.budgetWebhookTemplate : 'generic',
    savingsMode: raw && raw.savingsMode === true,
    savingsGuard: !(raw && raw.savingsGuard === false),
    savingsProvider: raw && typeof raw.savingsProvider === 'string' ? raw.savingsProvider.trim().slice(0, 100) : '',
    savingsModel: raw && typeof raw.savingsModel === 'string' ? raw.savingsModel.trim().slice(0, 200) : '',
    savingsMaxOutput:
      raw && typeof raw.savingsMaxOutput === 'number' && Number.isFinite(raw.savingsMaxOutput)
        ? Math.max(0, Math.min(32768, Math.round(raw.savingsMaxOutput)))
        : 1200,
    savingsActivatedAt: raw && typeof raw.savingsActivatedAt === 'number' && Number.isFinite(raw.savingsActivatedAt) ? raw.savingsActivatedAt : 0,
    savingsActivationReason: raw && typeof raw.savingsActivationReason === 'string' ? raw.savingsActivationReason.slice(0, 200) : '',
    thriftWorkspaces:
      raw && Array.isArray(raw.thriftWorkspaces)
        ? raw.thriftWorkspaces.filter((entry) => typeof entry === 'string' && entry.trim().length > 0).map((entry) => entry.trim().slice(0, 500)).slice(0, 30)
        : [],
  };
}

/** Decode a session bucket key such as "--D-DSTools--" into a path guess. */
function decodeBucketKey(key) {
  const trimmed = key.replace(/^--/, '').replace(/--$/, '');
  if (trimmed.length === 0) return key;
  const parts = trimmed.split('-');
  if (parts.length === 1) return parts[0];
  return parts[0] + ':\\' + parts.slice(1).join('\\');
}

/** Map session ids to their workspace path and title from the workspace storage. */
async function readWorkspaceMap() {
  const map = new Map();
  try {
    const parsed = JSON.parse(await readFile(path.join(resolveDshHome(), 'storages', 'workspace.json'), 'utf8'));
    const table = parsed && parsed.tables && parsed.tables.workspaces;
    if (table && typeof table === 'object') {
      for (const workspace of Object.values(table)) {
        if (!workspace || typeof workspace !== 'object') continue;
        const workspacePath = typeof workspace.path === 'string' ? workspace.path : '';
        const title =
          typeof workspace.title === 'string' && workspace.title.length > 0 ? workspace.title : path.basename(workspacePath);
        for (const sessionId of Array.isArray(workspace.sessionIds) ? workspace.sessionIds : []) {
          if (typeof sessionId === 'string') map.set(sessionId, { path: workspacePath, title });
        }
      }
    }
  } catch (error) {
    // workspace storage is optional
  }
  return map;
}

/** Fill unknown sessions from the sessions directory bucket layout. */
async function fillSessionBuckets(map) {
  const root = path.join(resolveDshHome(), 'sessions');
  const buckets = await readdir(root, { withFileTypes: true }).catch(() => []);
  for (const bucket of buckets) {
    if (!bucket.isDirectory()) continue;
    const guessPath = decodeBucketKey(bucket.name);
    const sessions = await readdir(path.join(root, bucket.name), { withFileTypes: true }).catch(() => []);
    for (const entry of sessions) {
      if (!entry.isDirectory() || map.has(entry.name)) continue;
      map.set(entry.name, { path: guessPath, title: path.basename(guessPath) || bucket.name });
    }
  }
  return map;
}

/** Extract canonical token totals from one projection-cache document. */
function totalsOfProjection(parsed) {
  const rows = parsed && parsed.record && parsed.record.rows;
  const usage = rows && rows.tokenUsage && rows.tokenUsage.val;
  const totals = usage && usage.totals;
  if (!totals || typeof totals !== 'object') return undefined;
  const num = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);
  return {
    inputMiss: num(totals.uncachedInputTokens) + num(totals.cacheWriteTokens),
    inputHit: num(totals.cacheReadTokens),
    output: num(totals.outputTokens),
  };
}

/** Aggregate token usage per workspace and per session from the projection cache (batched reads). */
async function collectUsageByWorkspace(workspaceMap, sessionTimes) {
  const root = path.join(resolveDshHome(), 'storages', 'session_projcache', 'sessions');
  const entries = (await readdir(root).catch(() => [])).filter((name) => name.endsWith('.json'));
  const byWorkspace = new Map();
  const sessions = [];
  let sessionsWithUsage = 0;
  let sessionsMissingUsage = 0;
  const batchSize = 25;
  for (let index = 0; index < entries.length; index += batchSize) {
    const batch = entries.slice(index, index + batchSize);
    const loaded = await Promise.all(
      batch.map(async (name) => {
        try {
          return { name, parsed: JSON.parse(await readFile(path.join(root, name), 'utf8')) };
        } catch (error) {
          return { name, failed: true };
        }
      }),
    );
    for (const entry of loaded) {
      const sessionId = entry.name.slice(0, -5);
      const totals = entry.failed === true ? undefined : totalsOfProjection(entry.parsed);
      if (totals === undefined) {
        sessionsMissingUsage += 1;
        continue;
      }
      const info = workspaceMap.get(sessionId) || { path: '', title: '未登记工作区' };
      const key = info.path.length > 0 ? info.path : info.title;
      if (!byWorkspace.has(key)) {
        byWorkspace.set(key, { path: info.path, title: info.title, sessions: 0, inputMiss: 0, inputHit: 0, output: 0, lastAt: null });
      }
      const row = byWorkspace.get(key);
      const lastAt = sessionTimes !== undefined && sessionTimes.has(sessionId) ? sessionTimes.get(sessionId) : null;
      row.sessions += 1;
      row.inputMiss += totals.inputMiss;
      row.inputHit += totals.inputHit;
      row.output += totals.output;
      if (lastAt !== null && (row.lastAt === null || lastAt > row.lastAt)) row.lastAt = lastAt;
      sessions.push({ sessionId, workspace: info.title, path: info.path, lastAt, ...totals });
      sessionsWithUsage += 1;
    }
  }
  return { workspaces: [...byWorkspace.values()], sessions, sessionsWithUsage, sessionsMissingUsage };
}

/** Estimate the CNY cost of one token bucket under the given per-million pricing. */
function costOfTokens(tokens, pricing) {
  const cost = (tokens.inputMiss * pricing.inputMiss + tokens.inputHit * pricing.inputHit + tokens.output * pricing.output) / 1000000;
  return Math.round(cost * 1000000) / 1000000;
}

/** Turn token totals into an efficiency score, savings estimate, and recommendations. */
function buildEfficiencyReport(totals, rows, days, pricing) {
  const inputTokens = totals.inputMiss + totals.inputHit;
  const cacheHitRate = typeof totals.cacheHitRate === 'number' ? totals.cacheHitRate : 0;
  const outputRatio = totals.totalTokens === 0 ? 0 : totals.output / totals.totalTokens;
  const avgCost = totals.sessions === 0 ? 0 : totals.cost / totals.sessions;
  const today = days[days.length - 1] || { cost: 0, totalTokens: 0 };
  const weekCost = days.slice(-7).reduce((sum, day) => sum + day.cost, 0);
  const targetCacheHit = 0.7;
  const potentialHit = Math.min(targetCacheHit, cacheHitRate + 0.2);
  const delta = Math.max(0, potentialHit - cacheHitRate);
  const cacheSaving = Math.round((inputTokens * delta * (pricing.inputMiss - pricing.inputHit)) / 1e6 * 1000) / 1000;
  const cacheScore = Math.min(100, Math.round((cacheHitRate / targetCacheHit) * 100));
  const costScore = avgCost <= 0.15 ? 100 : Math.max(0, Math.round(100 - ((avgCost - 0.15) / 1.85) * 100));
  const outputScore =
    outputRatio >= 0.15 && outputRatio <= 0.5
      ? 100
      : outputRatio < 0.15
        ? Math.round((outputRatio / 0.15) * 100)
        : Math.max(0, Math.round(100 - ((outputRatio - 0.5) / 0.5) * 100));
  const score = totals.sessions === 0 ? 0 : Math.max(0, Math.min(100, Math.round(cacheScore * 0.5 + costScore * 0.3 + outputScore * 0.2)));
  const recommendations = [];
  if (cacheSaving > 0.001 && cacheHitRate < targetCacheHit) {
    recommendations.push({
      id: 'cache',
      title: '提升缓存命中率',
      detail:
        '当前缓存命中率 ' + Math.round(cacheHitRate * 100) + '%，若提升到 ' + Math.round(potentialHit * 100) +
        '%，按未命中/命中单价差估算可节省 ¥' + cacheSaving.toFixed(3) + '（累计口径）。复用会话前缀、减少重复上下文可提高命中。',
      saving: cacheSaving,
      severity: cacheHitRate < 0.35 ? 'high' : 'medium',
    });
  }
  if (rows.length > 0 && rows[0].cost > 0) {
    const top = rows[0];
    const share = totals.cost === 0 ? 0 : Math.round((top.cost / totals.cost) * 100);
    recommendations.push({
      id: 'workspace',
      title: '精简高消耗工作区',
      detail: '工作区「' + top.title + '」花费 ¥' + top.cost.toFixed(3) + '（占 ' + share + '%）。优先裁剪该工作区的大文件上下文，或拆分长会话。',
      saving: null,
      severity: share >= 50 ? 'high' : 'info',
    });
  }
  if (totals.totalTokens > 0 && outputRatio < 0.15) {
    recommendations.push({
      id: 'output',
      title: '输入占比过高',
      detail: '输出 Token 仅占 ' + Math.round(outputRatio * 100) + '%，大量 Token 花在输入上下文。建议减少整文件粘贴、按需检索，并把长任务拆成短会话。',
      saving: null,
      severity: 'medium',
    });
  }
  if (totals.sessions > 0) {
    recommendations.push({
      id: 'session',
      title: '会话均费基线',
      detail: '共 ' + totals.sessions + ' 个会话，平均每个 ¥' + avgCost.toFixed(3) + '、' + totals.avgTokens + ' tokens。持续低于该基线即说明优化有效。',
      saving: null,
      severity: 'info',
    });
  }
  return {
    score,
    cacheHitRate,
    targetCacheHit,
    cacheSaving,
    todayCost: today.cost,
    todayTokens: today.totalTokens,
    weekCost,
    avgCostPerSession: Math.round(avgCost * 1000) / 1000,
    outputRatio: Math.round(outputRatio * 1000) / 1000,
    totalCost: totals.cost,
    totalTokens: totals.totalTokens,
    components: { cacheScore, costScore, outputScore },
    recommendations,
    daily: days.map((day) => ({ at: day.at, cost: day.cost, totalTokens: day.totalTokens })),
  };
}

/** Build the per-workspace token and cost report with daily and per-session detail. */
async function buildUsageReport(store) {
  const document = await store.load();
  const pricing = normalizePricing(document.settings.pricing);
  const workspaceMap = await fillSessionBuckets(await readWorkspaceMap());
  const sessionTimes = await collectSessionTimes();
  const collected = await collectUsageByWorkspace(workspaceMap, sessionTimes);
  const rows = collected.workspaces
    .map((row) => {
      const totalTokens = row.inputMiss + row.inputHit + row.output;
      const cacheHitRate = row.inputHit + row.inputMiss === 0 ? 0 : Math.round((row.inputHit / (row.inputHit + row.inputMiss)) * 1000) / 1000;
      const avgTokens = row.sessions === 0 ? 0 : Math.round(totalTokens / row.sessions);
      return { ...row, totalTokens, cost: costOfTokens(row, pricing), cacheHitRate, avgTokens };
    })
    .sort((left, right) => right.cost - left.cost || right.totalTokens - left.totalTokens);
  const totals = rows.reduce(
    (sum, row) => ({
      sessions: sum.sessions + row.sessions,
      inputMiss: sum.inputMiss + row.inputMiss,
      inputHit: sum.inputHit + row.inputHit,
      output: sum.output + row.output,
      totalTokens: sum.totalTokens + row.totalTokens,
      cost: 0,
    }),
    { sessions: 0, inputMiss: 0, inputHit: 0, output: 0, totalTokens: 0, cost: 0 },
  );
  totals.cost = costOfTokens(totals, pricing);
  totals.cacheHitRate =
    totals.inputHit + totals.inputMiss === 0 ? 0 : Math.round((totals.inputHit / (totals.inputHit + totals.inputMiss)) * 1000) / 1000;
  totals.avgTokens = totals.sessions === 0 ? 0 : Math.round(totals.totalTokens / totals.sessions);
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const days30 = [];
  for (let offset = 29; offset >= 0; offset -= 1) {
    days30.push({ at: dayStart.getTime() - offset * 86400000, sessions: 0, inputMiss: 0, inputHit: 0, output: 0, totalTokens: 0, cost: 0 });
  }
  const dayIndex = new Map(days30.map((day) => [day.at, day]));
  for (const session of collected.sessions) {
    if (session.lastAt === null) continue;
    const bucketDate = new Date(session.lastAt);
    bucketDate.setHours(0, 0, 0, 0);
    const bucket = dayIndex.get(bucketDate.getTime());
    if (bucket === undefined) continue;
    bucket.sessions += 1;
    bucket.inputMiss += session.inputMiss;
    bucket.inputHit += session.inputHit;
    bucket.output += session.output;
  }
  for (const day of days30) {
    day.totalTokens = day.inputMiss + day.inputHit + day.output;
    day.cost = costOfTokens(day, pricing);
  }
  const days = days30.slice(-14);
  const topSessions = collected.sessions
    .map((session) => ({
      sessionId: session.sessionId,
      workspace: session.workspace,
      path: session.path,
      lastAt: session.lastAt,
      totalTokens: session.inputMiss + session.inputHit + session.output,
      cost: costOfTokens(session, pricing),
    }))
    .sort((left, right) => right.totalTokens - left.totalTokens)
    .slice(0, 12);
  const efficiency = buildEfficiencyReport(totals, rows, days, pricing);
  efficiency.daily30 = days30.map((day) => ({
    at: day.at,
    cost: day.cost,
    totalTokens: day.totalTokens,
    cacheHitRate: day.inputHit + day.inputMiss === 0 ? 0 : Math.round((day.inputHit / (day.inputHit + day.inputMiss)) * 1000) / 1000,
  }));
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthToDateCost = days30.filter((day) => day.at >= monthStart.getTime()).reduce((sum, day) => sum + day.cost, 0);
  efficiency.monthToDateCost = Math.round(monthToDateCost * 1000) / 1000;
  return {
    generatedAt: Date.now(),
    home: resolveDshHome(),
    pricing,
    currency: 'CNY',
    workspaces: rows,
    totals,
    daily: days,
    daily30: days30,
    topSessions,
    efficiency,
    sessionsWithUsage: collected.sessionsWithUsage,
    sessionsMissingUsage: collected.sessionsMissingUsage,
    note: '金额按设置中的单价估算（默认 DeepSeek-flash 高峰价，空闲时段为其一半）；Token 来自会话投影缓存，按会话文件更新时间归入日用量。',
  };
}

/** Build the read-only per-workspace usage route. */
function createUsageRoute(store) {
  return createReadRoute(USAGE_PATH, () => buildUsageReport(store));
}

/** Best-effort optional Host service lookup for the savings status route. */
function optionalService(ctx, name) {
  try {
    return typeof ctx.get === 'function' ? ctx.get(name) : undefined;
  } catch (error) {
    return undefined;
  }
}

/** Build the read-only automatic token-saving status route. */
function createSavingsRoute(store, ctx) {
  return createReadRoute(SAVINGS_PATH, async (req) => {
    const compaction = optionalService(ctx, 'compaction');
    const pruner = optionalService(ctx, 'toolResultPruner');
    const tokenMeter = optionalService(ctx, 'tokenMeter');
    const agents = optionalService(ctx, 'agents');
    const commands = optionalService(ctx, 'commands');
    const liveAgents = agents && typeof agents.list === 'function' ? agents.list() : [];
    const sessions = [];
    for (const agent of liveAgents) {
      let session;
      try {
        session = agent && agent.session ? agent.session : undefined;
      } catch (error) {
        session = undefined;
      }
      if (!session || !session.header) continue;
      let pressure = {};
      try {
        pressure = tokenMeter && typeof tokenMeter.contextPressure === 'function' ? tokenMeter.contextPressure(session) || {} : {};
      } catch (error) {
        pressure = {};
      }
      const pressureTokens = typeof pressure.pressureTokens === 'number' ? pressure.pressureTokens : 0;
      const contextWindow = typeof pressure.contextWindow === 'number' ? pressure.contextWindow : 0;
      const ratio = contextWindow > 0 ? Math.round((pressureTokens / contextWindow) * 1000) / 1000 : 0;
      const targetTokens = contextWindow > 0 ? Math.round(contextWindow * 0.5) : 0;
      const compressibleTokens = targetTokens > 0 ? Math.max(0, pressureTokens - targetTokens) : 0;
      sessions.push({
        id: String(agent.id),
        cwd: typeof session.header.cwd === 'string' ? session.header.cwd : '',
        pressureTokens,
        contextWindow,
        ratio,
        compressibleTokens,
        estimatedAfterTokens: Math.max(0, pressureTokens - compressibleTokens),
      });
    }
    sessions.sort((left, right) => right.ratio - left.ratio || right.pressureTokens - left.pressureTokens);
    let requested = '';
    try {
      requested = String(new URL(req.url || '/', 'http://localhost').searchParams.get('sessionId') || '');
    } catch (error) {
      requested = '';
    }
    const selected = sessions.find((session) => session.id === requested) || sessions[0] || null;
    let commandCompact = false;
    try {
      const first = liveAgents[0];
      commandCompact = Boolean(commands && typeof commands.find === 'function' && first && commands.find(first, 'compact'));
    } catch (error) {
      commandCompact = false;
    }
    const document = await store.load();
    let defaultModel = null;
    try {
      const agentDefaultModel = optionalService(ctx, 'agentDefaultModel');
      if (agentDefaultModel && typeof agentDefaultModel.currentSelection === 'function') defaultModel = agentDefaultModel.currentSelection();
    } catch (error) {
      defaultModel = null;
    }
    return {
      generatedAt: Date.now(),
      compaction: {
        enabled: Boolean(compaction && typeof compaction.compactIfNeeded === 'function'),
      },
      pruner: {
        enabled: Boolean(pruner && typeof pruner.pruneSession === 'function'),
      },
      commandCompact: { enabled: commandCompact },
      budgets: {
        daily: typeof document.settings.tokenBudget === 'number' ? document.settings.tokenBudget : 0,
        monthly: typeof document.settings.tokenBudgetMonthly === 'number' ? document.settings.tokenBudgetMonthly : 0,
      },
      savings: {
        mode: savingsRuntime.mode,
        guard: document.settings.savingsGuard !== false,
        provider: savingsRuntime.provider,
        model: savingsRuntime.model,
        maxOutput: savingsRuntime.maxOutput,
        activatedAt: document.settings.savingsActivatedAt || 0,
        reason: document.settings.savingsActivationReason || '',
      },
      thriftWorkspaces: document.settings.thriftWorkspaces || [],
      modelCandidates: await discoverModelCandidates(ctx),
      availableModels: await discoverAllModels(ctx),
      defaultModel,
      sessions,
      selected,
    };
  });
}

/** Copy persisted savings policy into the live prompt/model state. */
function applySavingsRuntime(settings) {
  const source = settings && typeof settings === 'object' ? settings : {};
  savingsRuntime.mode = source.savingsMode === true;
  savingsRuntime.provider = typeof source.savingsProvider === 'string' ? source.savingsProvider : '';
  savingsRuntime.model = typeof source.savingsModel === 'string' ? source.savingsModel : '';
  savingsRuntime.maxOutput = typeof source.savingsMaxOutput === 'number' && source.savingsMaxOutput > 0 ? source.savingsMaxOutput : 0;
  savingsRuntime.thriftWorkspaces = Array.isArray(source.thriftWorkspaces) ? source.thriftWorkspaces.filter((entry) => typeof entry === 'string') : [];
}

/** Cache of all exposed models for manual savings-model selection. */
let modelCatalogCache = { at: 0, list: [] };

/** List all models exposed by mounted providers, cheap-looking routes first. */
async function discoverAllModels(ctx, force) {
  if (!force && Date.now() - modelCatalogCache.at < 300000) return modelCatalogCache.list;
  const llm = optionalService(ctx, 'llm');
  if (!llm || typeof llm.listProviders !== 'function' || typeof llm.listModels !== 'function') return [];
  const list = [];
  try {
    const providers = await llm.listProviders();
    for (const provider of Array.isArray(providers) ? providers.slice(0, 8) : []) {
      const providerId = provider && typeof provider.id === 'string' ? provider.id : '';
      if (providerId.length === 0) continue;
      const models = await llm.listModels(providerId);
      for (const model of Array.isArray(models) ? models : []) {
        if (!model || typeof model.id !== 'string') continue;
        list.push({
          provider: providerId,
          model: model.id,
          name: model.name || model.id,
          cheap: /flash|lite|mini|fast|turbo|economy|cheap/i.test(model.id + ' ' + (model.name || '')) && !/max|pro|ultra|reason|thinking/i.test(model.id + ' ' + (model.name || '')),
        });
      }
    }
  } catch (error) {
    return modelCatalogCache.list;
  }
  list.sort((left, right) => Number(right.cheap) - Number(left.cheap) || left.name.localeCompare(right.name));
  modelCatalogCache = { at: Date.now(), list: list.slice(0, 40) };
  return modelCatalogCache.list;
}

/** Choose an explicitly configured cheap route, or a conservative fast/flash variant. */
async function chooseSavingsModel(ctx, settings) {
  const configuredProvider = settings && typeof settings.savingsProvider === 'string' ? settings.savingsProvider.trim() : '';
  const configuredModel = settings && typeof settings.savingsModel === 'string' ? settings.savingsModel.trim() : '';
  if (configuredProvider.length > 0 && configuredModel.length > 0) return { provider: configuredProvider, model: configuredModel };
  const candidates = await discoverModelCandidates(ctx);
  const current = await currentDefaultModel(ctx);
  const candidate = candidates.find((entry) => !current || entry.provider !== current.provider || entry.model !== current.model);
  return candidate ? { provider: candidate.provider, model: candidate.model } : null;
}

/** Cache of cheaper model candidates discovered from the mounted LLM providers. */
let modelCandidateCache = { at: 0, list: [] };

/** Read the current default model selection, when available. */
async function currentDefaultModel(ctx) {
  try {
    const agentDefaultModel = optionalService(ctx, 'agentDefaultModel');
    return agentDefaultModel && typeof agentDefaultModel.currentSelection === 'function' ? agentDefaultModel.currentSelection() : null;
  } catch (error) {
    return null;
  }
}

/** Discover and rank cheaper-looking model routes exposed by the current LLM adapters. */
async function discoverModelCandidates(ctx, force) {
  if (!force && Date.now() - modelCandidateCache.at < 60000) return modelCandidateCache.list;
  const llm = optionalService(ctx, 'llm');
  if (!llm || typeof llm.listProviders !== 'function' || typeof llm.listModels !== 'function') return [];
  const list = [];
  try {
    const providers = await llm.listProviders();
    const current = await currentDefaultModel(ctx);
    for (const provider of Array.isArray(providers) ? providers.slice(0, 8) : []) {
      const providerId = provider && typeof provider.id === 'string' ? provider.id : '';
      if (providerId.length === 0) continue;
      const models = await llm.listModels(providerId);
      for (const model of Array.isArray(models) ? models : []) {
        if (!model || typeof model.id !== 'string') continue;
        const text = model.id + ' ' + (model.name || '');
        const cheap = /flash|lite|mini|fast|turbo|economy|cheap/i.test(text);
        const premium = /max|pro|ultra|reason|thinking/i.test(text);
        if (!cheap || premium) continue;
        if (current && providerId === current.provider && model.id === current.model) continue;
        list.push({ provider: providerId, model: model.id, name: model.name || model.id, score: cheap ? 1 : 0 });
      }
    }
  } catch (error) {
    return modelCandidateCache.list;
  }
  list.sort((left, right) => right.score - left.score || left.model.localeCompare(right.model));
  modelCandidateCache = { at: Date.now(), list: list.slice(0, 8) };
  return modelCandidateCache.list;
}

/** Persist the automatic savings switch and apply the cheap route to new agents. */
async function activateSavingsMode(store, ctx, reason) {
  const document = await store.load();
  const settings = { ...document.settings, savingsMode: true, savingsActivatedAt: Date.now(), savingsActivationReason: String(reason || 'budget guard') };
  const picked = await chooseSavingsModel(ctx, settings);
  if (picked) {
    settings.savingsProvider = picked.provider;
    settings.savingsModel = picked.model;
  }
  await store.replaceItems(document.items, normalizeSettings(settings), document.reviews, document.types);
  applySavingsRuntime(settings);
  if (picked) {
    try {
      const agentDefaultModel = optionalService(ctx, 'agentDefaultModel');
      if (agentDefaultModel && typeof agentDefaultModel.saveSelection === 'function') await agentDefaultModel.saveSelection(picked);
    } catch (error) {
      // model tiering is best-effort; the savings flag still applies
    }
  }
  return { mode: true, provider: settings.savingsProvider || '', model: settings.savingsModel || '' };
}

/** Build the savings-policy write route used by the one-click switch. */
function createSavingsPolicyRoute(store, ctx) {
  return async (req, res) => {
    let url;
    try {
      url = new URL(req.url || '/', 'http://localhost');
    } catch (error) {
      sendJson(res, 400, { error: 'bad url' });
      return;
    }
    if (url.pathname !== SAVINGS_POLICY_PATH) {
      sendJson(res, 404, { error: 'not found' });
      return;
    }
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'method not allowed' });
      return;
    }
    if (!requireReadToken(req, res)) return;
    try {
      const body = await readJsonBody(req);
      if (body && body.action === 'discover') {
        sendJson(res, 200, { ok: true, candidates: await discoverModelCandidates(ctx, true), availableModels: await discoverAllModels(ctx, true), current: await currentDefaultModel(ctx) });
        return;
      }
      if (body && body.action === 'evaluate') {
        const document = await store.load();
        const budget = await computeBudgetAlert(store, document);
        if (budget && (budget.over === true || budget.monthlyOver === true) && document.settings.savingsGuard !== false && !savingsRuntime.mode) {
          await activateSavingsMode(store, ctx, budget.over === true ? 'manual check: daily budget exceeded' : 'manual check: monthly budget exceeded');
        }
        sendJson(res, 200, { ok: true, budget, savings: { mode: savingsRuntime.mode, guard: document.settings.savingsGuard !== false } });
        return;
      }
      const document = await store.load();
      let settings = normalizeSettings({
        ...document.settings,
        savingsMode: body && typeof body.savingsMode === 'boolean' ? body.savingsMode : document.settings.savingsMode,
        savingsGuard: body && typeof body.savingsGuard === 'boolean' ? body.savingsGuard : document.settings.savingsGuard,
        savingsProvider: body && typeof body.savingsProvider === 'string' ? body.savingsProvider : document.settings.savingsProvider,
        savingsModel: body && typeof body.savingsModel === 'string' ? body.savingsModel : document.settings.savingsModel,
        savingsMaxOutput: body && typeof body.savingsMaxOutput === 'number' ? body.savingsMaxOutput : document.settings.savingsMaxOutput,
        thriftWorkspaces: body && Array.isArray(body.thriftWorkspaces) ? body.thriftWorkspaces : document.settings.thriftWorkspaces,
      });
      if (settings.savingsMode && (settings.savingsProvider.length === 0 || settings.savingsModel.length === 0)) {
        const picked = await chooseSavingsModel(ctx, settings);
        if (picked) settings = normalizeSettings({ ...settings, savingsProvider: picked.provider, savingsModel: picked.model });
      }
      await store.replaceItems(document.items, settings, document.reviews, document.types);
      applySavingsRuntime(settings);
      let model = settings.savingsModel || '';
      if (settings.savingsMode && settings.savingsProvider && settings.savingsModel) {
        try {
          const agentDefaultModel = optionalService(ctx, 'agentDefaultModel');
          if (agentDefaultModel && typeof agentDefaultModel.saveSelection === 'function') await agentDefaultModel.saveSelection({ provider: settings.savingsProvider, model: settings.savingsModel });
          model = settings.savingsModel;
        } catch (error) {
          model = settings.savingsModel;
        }
      }
      sendJson(res, 200, { ok: true, savings: { mode: savingsRuntime.mode, guard: settings.savingsGuard !== false, provider: settings.savingsProvider, model, maxOutput: settings.savingsMaxOutput } });
    } catch (error) {
      sendJson(res, 400, { error: String((error && error.message) || error) });
    }
  };
}

/** Calendar day key in local time. */
function dayKeyOfMs(value) {
  const date = new Date(value);
  const pad = (part) => String(part).padStart(2, '0');
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
}

/** Last-modified timestamps of every stored session. */
async function collectSessionTimes() {
  const root = path.join(resolveDshHome(), 'sessions');
  const result = new Map();
  const buckets = await readdir(root, { withFileTypes: true }).catch(() => []);
  for (const bucket of buckets) {
    if (!bucket.isDirectory()) continue;
    const directory = path.join(root, bucket.name);
    const sessions = await readdir(directory, { withFileTypes: true }).catch(() => []);
    for (const entry of sessions) {
      if (!entry.isDirectory()) continue;
      const fileInfo = await stat(path.join(directory, entry.name, 'session.v4.jsonl.zstd')).catch(() => undefined);
      const dirInfo = fileInfo === undefined ? await stat(path.join(directory, entry.name)).catch(() => undefined) : undefined;
      const at = fileInfo !== undefined ? fileInfo.mtimeMs : dirInfo !== undefined ? dirInfo.mtimeMs : undefined;
      if (at !== undefined) result.set(entry.name, at);
    }
  }
  return result;
}

/** Social-application keyword signals used by the social value heuristic. */
const SOCIAL_KEYWORDS = [
  '医疗', '健康', '教育', '公益', '无障碍', '开源', '社区', '政务', '环保', '农业',
  '养老', '儿童', '残障', '应急', '公共', '社会', '慈善', '助残', '乡村', '图书馆',
  'health', 'medical', 'education', 'nonprofit', 'accessibility', 'open-source', 'opensource',
  'community', 'civic', 'public', 'welfare', 'charity', 'volunteer', 'safety', 'emergency',
];

/** Bounded recursive file statistics for one workspace directory. */
async function readWorkspaceDirStats(rootPath) {
  const stats = {
    files: 0,
    bytes: 0,
    truncated: false,
    readme: false,
    license: false,
    tests: false,
    docs: false,
    readmePath: '',
  };
  if (typeof rootPath !== 'string' || rootPath.length === 0) return stats;
  const skip = new Set(['node_modules', '.git', '.dsh', 'dist', 'build', 'target', '.next', 'out']);
  const maxFiles = 500;
  let stack = [{ dir: rootPath, depth: 0 }];
  while (stack.length > 0 && stats.files < maxFiles) {
    const current = stack.pop();
    const depth = current.depth;
    let entries;
    try {
      entries = await readdir(current.dir, { withFileTypes: true });
    } catch (error) {
      continue;
    }
    const nextStack = [];
    for (const entry of entries) {
      if (stats.files >= maxFiles) {
        stats.truncated = true;
        break;
      }
      const full = path.join(current.dir, entry.name);
      const lower = entry.name.toLowerCase();
      if (entry.isDirectory()) {
        if (depth <= 1 && (lower === 'docs' || lower === 'doc')) stats.docs = true;
        if (depth <= 2 && (lower === 'test' || lower === 'tests' || lower === '__tests__' || lower === 'spec')) stats.tests = true;
        if (!skip.has(entry.name)) nextStack.push({ dir: full, depth: depth + 1 });
        continue;
      }
      if (!entry.isFile()) continue;
      if (depth <= 1 && /^readme(\.[a-z0-9]+)?$/.test(lower)) {
        stats.readme = true;
        if (stats.readmePath.length === 0 || depth === 0) stats.readmePath = full;
      }
      if (depth <= 1 && /^(license|licence|copying)(\.[a-z0-9]+)?$/.test(lower)) stats.license = true;
      if (depth <= 2 && /\.(test|spec)\.[a-z0-9]+$/.test(lower)) stats.tests = true;
      try {
        const info = await stat(full);
        stats.files += 1;
        stats.bytes += info.size;
      } catch (error) {
        // a vanished file is not a problem
      }
    }
    stack = stack.concat(nextStack);
  }
  stats.domains = [];
  if (stats.readmePath.length > 0) {
    try {
      const text = (await readFile(stats.readmePath, 'utf8')).slice(0, 8000).toLowerCase();
      for (const keyword of SOCIAL_KEYWORDS) {
        if (text.includes(keyword.toLowerCase()) && !stats.domains.includes(keyword)) stats.domains.push(keyword);
      }
    } catch (error) {
      // an unreadable README still counts as documentation
    }
  }
  stats.domains = stats.domains.slice(0, 8);
  return stats;
}

/**
 * Deep social-application-value evaluation: six weighted dimensions (documentation,
 * license, tests, social impact, engineering substance, sustained activity) plus
 * strengths, gaps, and a prioritized set of improvement suggestions.
 */
function scoreSocialValue(directory, activity) {
  const docs = directory.readme ? 20 : 0;
  const license = directory.license ? 15 : 0;
  const tests = directory.tests ? 10 : 0;
  const impactScore = Math.min(25, (directory.domains.length + (directory.docs ? 1 : 0)) * 5);
  const substance = directory.files <= 0 ? 0 : Math.min(15, (Math.log10(directory.files + 1) / 4) * 15);
  const activityScore =
    activity.sessions === 0 || activity.daysSinceLast === null ? 0 : activity.daysSinceLast <= 30 ? 15 : activity.daysSinceLast <= 90 ? 8 : 0;
  const dimensions = [
    { key: 'docs', score: docs, max: 20 },
    { key: 'license', score: license, max: 15 },
    { key: 'tests', score: tests, max: 10 },
    { key: 'impact', score: impactScore, max: 25 },
    { key: 'substance', score: Math.round(substance * 10) / 10, max: 15 },
    { key: 'activity', score: activityScore, max: 15 },
  ];
  const socialScore = Math.round(dimensions.reduce((sum, dimension) => sum + dimension.score, 0));
  const socialGrade = socialScore >= 70 ? 'strong' : socialScore >= 45 ? 'medium' : socialScore >= 20 ? 'weak' : 'unknown';
  const ratio = (dimension) => dimension.score / dimension.max;
  const socialStrengths = dimensions.filter((dimension) => ratio(dimension) >= 0.6).map((dimension) => dimension.key);
  const socialGaps = dimensions.filter((dimension) => ratio(dimension) <= 0.3).map((dimension) => dimension.key);
  const socialSuggestions = [];
  if (!directory.readme) socialSuggestions.push('addReadme');
  else if (!directory.docs) socialSuggestions.push('addDocs');
  if (!directory.license) socialSuggestions.push('addLicense');
  if (!directory.tests) socialSuggestions.push('addTests');
  if (impactScore < 10) socialSuggestions.push('addDomains');
  if (activityScore < 8) socialSuggestions.push('stayActive');
  return {
    socialScore,
    socialGrade,
    socialDomains: directory.domains.slice(0, 8),
    socialBreakdown: dimensions,
    socialStrengths,
    socialGaps,
    socialSuggestions: socialSuggestions.slice(0, 4),
    socialSignals: {
      readme: directory.readme,
      license: directory.license,
      tests: directory.tests,
      docs: directory.docs,
      files: directory.files,
      active: activityScore > 0,
    },
  };
}

/** Score one workspace from usage, activity, and substance signals. */
function scoreWorkspace(input) {
  const invest = Math.min(100, (Math.log10(input.totalTokens + 1) / 10) * 100);
  const activity = Math.min(100, input.sessions * 4);
  const recency =
    input.daysSinceLast === null
      ? 0
      : input.daysSinceLast <= 1
        ? 100
        : input.daysSinceLast <= 7
          ? 80
          : input.daysSinceLast <= 30
            ? 50
            : input.daysSinceLast <= 90
              ? 25
              : 10;
  const span = Math.min(100, input.activeDays * 5);
  const substance = input.files <= 0 ? 0 : Math.min(100, (Math.log10(input.files + 1) / 4) * 100);
  const valueScore = Math.round(0.35 * invest + 0.2 * activity + 0.2 * recency + 0.15 * span + 0.1 * substance);
  const grade = valueScore >= 80 ? 'A' : valueScore >= 60 ? 'B' : valueScore >= 40 ? 'C' : 'D';
  let stage = 'unknown';
  if (input.sessions > 0 && input.daysSinceLast !== null) {
    if (input.daysSinceLast <= 7) stage = input.momentum >= 1 ? 'active' : 'maintaining';
    else if (input.daysSinceLast <= 30) stage = 'recent';
    else if (input.daysSinceLast <= 90) stage = 'slowing';
    else stage = 'dormant';
  }
  let future = 'unknown';
  if (input.sessions > 0) {
    if (input.momentum >= 1.5 && valueScore >= 50) future = 'high';
    else if (input.momentum >= 0.8) future = 'steady';
    else if (input.momentum >= 0.4) future = 'slowing';
    else future = 'low';
  }
  return {
    valueScore,
    grade,
    stage,
    future,
    breakdown: {
      invest: Math.round(invest),
      activity: Math.round(activity),
      recency: Math.round(recency),
      span: Math.round(span),
      substance: Math.round(substance),
    },
  };
}

/** Build the per-workspace value, level, and forecast report. */
async function buildWorkspaceValueReport(store) {
  const document = await store.load();
  const settings = normalizeSettings(document.settings);
  const workspaceMap = await fillSessionBuckets(await readWorkspaceMap());
  const usage = await collectUsageByWorkspace(workspaceMap);
  const usageByPath = new Map(usage.workspaces.map((row) => [row.path.length > 0 ? row.path : row.title, row]));
  const sessionTimes = await collectSessionTimes();
  const groups = new Map();
  for (const [sessionId, info] of workspaceMap.entries()) {
    const key = info.path.length > 0 ? info.path : info.title;
    if (!groups.has(key)) groups.set(key, { path: info.path, title: info.title, sessionIds: [] });
    groups.get(key).sessionIds.push(sessionId);
  }
  const now = Date.now();
  const pending = [];
  for (const [key, group] of groups) {
    const tokens = usageByPath.get(key) || { sessions: 0, inputMiss: 0, inputHit: 0, output: 0 };
    const totalTokens = tokens.inputMiss + tokens.inputHit + tokens.output;
    const cost = costOfTokens(tokens, settings.pricing);
    const times = group.sessionIds
      .map((id) => sessionTimes.get(id))
      .filter((value) => typeof value === 'number')
      .sort((left, right) => left - right);
    const lastAt = times.length > 0 ? times[times.length - 1] : null;
    const firstAt = times.length > 0 ? times[0] : null;
    const daysSinceLast = lastAt === null ? null : Math.max(0, Math.floor((now - lastAt) / 86400000));
    const activeDays = new Set(times.map((value) => dayKeyOfMs(value))).size;
    const recent14 = times.filter((value) => value >= now - 14 * 86400000).length;
    const prior14 = times.filter((value) => value >= now - 28 * 86400000 && value < now - 14 * 86400000).length;
    const momentum = Math.round(((recent14 + 1) / (prior14 + 1)) * 100) / 100;
    const assessment = settings.workspaceNotes[key] || { note: '', rating: '', socialNote: '', socialRating: '', updatedAt: null };
    pending.push({ key, group, totalTokens, cost, firstAt, lastAt, daysSinceLast, activeDays, recent14, prior14, momentum, assessment, tokens });
  }
  const dirStats = await Promise.all(pending.map((entry) => readWorkspaceDirStats(entry.group.path)));
  const rows = pending.map((entry, index) => {
    const directory = dirStats[index];
    const scoring = scoreWorkspace({
      sessions: entry.group.sessionIds.length,
      totalTokens: entry.totalTokens,
      daysSinceLast: entry.daysSinceLast,
      activeDays: entry.activeDays,
      momentum: entry.momentum,
      files: directory.files,
    });
    const social = scoreSocialValue(directory, { sessions: entry.group.sessionIds.length, daysSinceLast: entry.daysSinceLast });
    return {
      path: entry.group.path,
      title: entry.group.title,
      sessions: entry.group.sessionIds.length,
      inputMiss: entry.tokens.inputMiss,
      inputHit: entry.tokens.inputHit,
      output: entry.tokens.output,
      totalTokens: entry.totalTokens,
      cost: entry.cost,
      firstAt: entry.firstAt,
      lastAt: entry.lastAt,
      daysSinceLast: entry.daysSinceLast,
      activeDays: entry.activeDays,
      recent14: entry.recent14,
      prior14: entry.prior14,
      momentum: entry.momentum,
      files: directory.files,
      bytes: directory.bytes,
      truncated: directory.truncated,
      note: entry.assessment.note,
      rating: entry.assessment.rating,
      socialNote: entry.assessment.socialNote || '',
      socialRating: entry.assessment.socialRating || '',
      noteUpdatedAt: entry.assessment.updatedAt,
      ...scoring,
      ...social,
    };
  });
  rows.sort((left, right) => right.valueScore - left.valueScore || right.totalTokens - left.totalTokens);
  const averageScore = rows.length === 0 ? 0 : Math.round(rows.reduce((sum, row) => sum + row.valueScore, 0) / rows.length);
  return {
    generatedAt: now,
    home: resolveDshHome(),
    currency: 'CNY',
    averageScore,
    count: rows.length,
    workspaces: rows,
    note: '价值分由投入（Token）、活跃度、近期活跃、持续天数与工作区文件量加权估算；社会应用价值由 README/许可证/测试/文档/领域关键词与活跃度启发式估算；阶段与未来价值基于近 14 天会话变化，仅为参考，可人工填写评价。',
  };
}

/** Build the read-only workspace value route (60s cache unless refresh=1; writes invalidate it). */
let valueCache = { at: 0, payload: undefined };
/** Drop the cached workspace value payload (called after every write). */
function invalidateValueCache() {
  valueCache = { at: 0, payload: undefined };
}
function createValueRoute(store) {
  return createReadRoute(VALUE_PATH, async (req) => {
    const url = new URL(req.url || '/', 'http://localhost');
    const refresh = url.searchParams.get('refresh') === '1';
    if (!refresh && valueCache.payload !== undefined && Date.now() - valueCache.at < 60000) {
      return valueCache.payload;
    }
    const payload = await buildWorkspaceValueReport(store);
    valueCache = { at: Date.now(), payload };
    return payload;
  });
}

/** Directory holding rolling full-document backups. */
function backupDirOf(file) {
  return path.join(path.dirname(file), 'backups');
}

/** Timestamp suffix used for backup file names. */
function backupStamp(date) {
  const pad = (part) => String(part).padStart(2, '0');
  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    '-' +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

/** List rolling backups newest-first with name, time, and size. */
async function listBackups(file) {
  const dir = backupDirOf(file);
  const names = await readdir(dir).catch(() => []);
  const entries = [];
  for (const name of names) {
    if (!/^items-\d{8}-\d{6}\.json$/.test(name)) continue;
    try {
      const info = await stat(path.join(dir, name));
      entries.push({ name, at: info.mtimeMs, size: info.size });
    } catch (error) {
      // skip entries that disappear mid-listing
    }
  }
  return entries.sort((left, right) => right.at - left.at);
}

/** Copy the current document into the backup dir, then keep only the newest N backups. */
async function createBackup(file) {
  const dir = backupDirOf(file);
  await mkdir(dir, { recursive: true });
  const name = 'items-' + backupStamp(new Date()) + '.json';
  const target = path.join(dir, name);
  await copyFile(file, target);
  const list = await listBackups(file);
  for (const extra of list.slice(BACKUP_LIMIT)) {
    await unlink(path.join(dir, extra.name)).catch(() => {});
  }
  return { name, at: Date.now(), size: (await stat(target)).size };
}

/** Automatic backup gated to the configured interval; failures never break writes. */
async function maybeAutoBackup(file) {
  try {
    const document = await readFile(file, 'utf8')
      .then((text) => JSON.parse(text))
      .catch(() => null);
    const configuredMinutes =
      document && document.settings && typeof document.settings.backupIntervalMinutes === 'number'
        ? Math.max(1, Math.min(1440, Math.round(document.settings.backupIntervalMinutes)))
        : 5;
    const interval = configuredMinutes * 60 * 1000;
    const list = await listBackups(file);
    if (list.length === 0 || Date.now() - list[0].at > interval) await createBackup(file);
  } catch (error) {
    // backups are best-effort
  }
}

/** Read one backup document by file name (validated against the naming pattern). */
async function readBackup(file, name) {
  if (typeof name !== 'string' || !/^items-\d{8}-\d{6}\.json$/.test(name)) return undefined;
  try {
    return JSON.parse(await readFile(path.join(backupDirOf(file), name), 'utf8'));
  } catch (error) {
    return undefined;
  }
}

/**
 * Build the backup route: GET list, GET ?name= document, POST create a backup now.
 * @param store - the shared store.
 * @returns a request handler.
 */
function createBackupRoute(store) {
  return async (req, res) => {
    if (!matchesPath(req, BACKUP_PATH)) {
      sendJson(res, 404, { error: 'not found' });
      return;
    }
    if (!requireReadToken(req, res)) return;
    try {
      if (req.method === 'GET') {
        const url = new URL(req.url || '/', 'http://localhost');
        const diffName = url.searchParams.get('diff');
        if (diffName !== null) {
          const backup = await readBackup(store.file, diffName);
          const current = await store.load();
          const currentItems = new Map(current.items.map((item) => [item.id, item]));
          const previousItems = new Map(backup.items.map((item) => [item.id, item]));
          let added = 0;
          let removed = 0;
          let changed = 0;
          for (const [id, item] of currentItems) {
            const before = previousItems.get(id);
            if (before === undefined) added += 1;
            else if ((before.updatedAt || 0) !== (item.updatedAt || 0) || (before.rev || 0) !== (item.rev || 0)) changed += 1;
          }
          for (const id of previousItems.keys()) if (!currentItems.has(id)) removed += 1;
          sendJson(res, 200, {
            name: diffName,
            backup: { at: backup.revision, revision: backup.revision, items: backup.items.length, reviews: backup.reviews.length, types: backup.types.length },
            current: { revision: current.revision, items: current.items.length, reviews: current.reviews.length, types: current.types.length },
            added,
            removed,
            changed,
            settingsChanged: JSON.stringify(backup.settings || {}) !== JSON.stringify(current.settings || {}),
          });
          return;
        }
        const name = url.searchParams.get('name');
        if (name !== null) {
          const document = await readBackup(store.file, name);
          if (document === undefined) {
            sendJson(res, 404, { error: 'backup not found' });
            return;
          }
          sendJson(res, 200, { name, document });
          return;
        }
        sendJson(res, 200, { backups: await listBackups(store.file), limit: BACKUP_LIMIT });
        return;
      }
      if (req.method === 'POST') {
        const backup = await createBackup(store.file);
        sendJson(res, 200, { backup });
        return;
      }
      sendJson(res, 405, { error: 'method not allowed' });
    } catch (error) {
      sendJson(res, 500, { error: String((error && error.message) || error) });
    }
  };
}

/** Read the installed Harness version from the Electron app package (best effort). */
function currentHarnessInfo() {
  const candidates = [];
  if (typeof process.resourcesPath === 'string' && process.resourcesPath.length > 0) {
    candidates.push(path.join(process.resourcesPath, 'app.asar', 'package.json'));
    candidates.push(path.join(process.resourcesPath, 'app', 'package.json'));
  }
  candidates.push(path.join(path.dirname(process.execPath), 'resources', 'app.asar', 'package.json'));
  candidates.push(path.join(path.dirname(process.execPath), 'resources', 'app', 'package.json'));
  let version = null;
  let appPackage = null;
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(readFileSync(candidate, 'utf8'));
      if (parsed && typeof parsed.version === 'string') {
        version = parsed.version;
        appPackage = candidate;
        break;
      }
    } catch (error) {
      // try the next candidate
    }
  }
  let installedAt = null;
  if (appPackage !== null) {
    try {
      installedAt = statSync(appPackage).mtimeMs;
    } catch (error) {
      installedAt = null;
    }
  }
  return {
    version,
    appPackage,
    installedAt,
    electron: typeof process.versions.electron === 'string' ? process.versions.electron : null,
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    execPath: process.execPath,
    resourcesPath: typeof process.resourcesPath === 'string' ? process.resourcesPath : null,
    pluginVersion: '1.0.0',
  };
}

/** Compare two dotted version strings; returns -1/0/1. */
function compareVersions(left, right) {
  const parse = (value) =>
    String(value || '')
      .replace(/^v/i, '')
      .split(/[.+-]/)
      .map((part) => parseInt(part, 10))
      .filter((part) => Number.isFinite(part));
  const a = parse(left);
  const b = parse(right);
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    const first = a[index] === undefined ? 0 : a[index];
    const second = b[index] === undefined ? 0 : b[index];
    if (first > second) return 1;
    if (first < second) return -1;
  }
  return 0;
}

/** Fetch one JSON document with a timeout and bounded body size. */
async function fetchJsonDocument(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPDATE_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const text = await response.text();
    if (text.length > 1024 * 1024) throw new Error('feed manifest too large');
    return JSON.parse(text);
  } finally {
    clearTimeout(timer);
  }
}

/** Validate and normalize one update manifest document. */
function normalizeUpdateManifest(raw) {
  if (!raw || typeof raw !== 'object') return undefined;
  const version = typeof raw.version === 'string' ? raw.version.replace(/^v/i, '').trim() : '';
  const url = typeof raw.url === 'string' ? raw.url.trim() : '';
  if (!/^\d+\.\d+/.test(version) || !/^https?:\/\//.test(url)) return undefined;
  return {
    version,
    url,
    sha256: typeof raw.sha256 === 'string' && /^[0-9a-fA-F]{64}$/.test(raw.sha256.trim()) ? raw.sha256.trim().toLowerCase() : null,
    notes: typeof raw.notes === 'string' ? raw.notes.slice(0, 4000) : '',
    publishedAt: typeof raw.publishedAt === 'string' ? raw.publishedAt.slice(0, 64) : null,
  };
}

let stagedHarnessUpdate = null;

/** Download one installer into the staging dir, streaming to disk with a SHA-256 hash. */
async function downloadHarnessInstaller(manifest, store) {
  const response = await fetch(manifest.url);
  if (!response.ok) throw new Error('download failed: HTTP ' + response.status);
  const official = manifest.source === 'official-direct';
  const largeFile = official || manifest.source === 'custom';
  const cap = largeFile ? OFFICIAL_DIRECT_MAX_BYTES : UPDATE_MAX_BYTES;
  const length = Number(response.headers.get('content-length') || 0);
  if (Number.isFinite(length) && length > cap) throw new Error('installer too large');
  const extension = (() => {
    try {
      const tail = path.extname(new URL(manifest.url).pathname).toLowerCase();
      return /^\.[a-z0-9]{2,5}$/.test(tail) ? tail : '.bin';
    } catch (error) {
      return '.bin';
    }
  })();
  const dir = path.join(path.dirname(store.file), 'staging');
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, 'harness-setup-' + (official ? 'official-latest' : manifest.version) + extension);
  const hash = createHash('sha256');
  const handle = await open(file, 'w');
  let total = 0;
  try {
    if (response.body && typeof response.body.getReader === 'function') {
      const reader = response.body.getReader();
      for (;;) {
        const step = await reader.read();
        if (step.done === true) break;
        const chunk = step.value;
        total += chunk.byteLength;
        if (total > cap) {
          await reader.cancel().catch(() => {});
          throw new Error('installer too large');
        }
        hash.update(chunk);
        await handle.write(chunk);
      }
    } else {
      const buffer = Buffer.from(await response.arrayBuffer());
      total = buffer.length;
      if (total > cap) throw new Error('installer too large');
      hash.update(buffer);
      await handle.write(buffer);
    }
  } finally {
    await handle.close();
  }
  const digest = hash.digest('hex');
  if (manifest.sha256 !== null && digest !== manifest.sha256) throw new Error('sha256 mismatch');
  stagedHarnessUpdate = {
    version: official ? 'latest' : manifest.version,
    path: file,
    size: total,
    sha256: digest,
    verified: manifest.sha256 !== null && digest === manifest.sha256,
    official,
    source: manifest.source || 'direct',
    downloadedAt: Date.now(),
  };
  return stagedHarnessUpdate;
}

/** Strip a release tag prefix such as "dsh-v" or "v" down to a bare version. */
function harnessVersionFromTag(tag) {
  return String(tag || '')
    .trim()
    .replace(/^dsh-v/i, '')
    .replace(/^v/i, '');
}

/** Pick the installer asset for the current platform from a GitHub release. */
function pickReleaseAsset(assets) {
  const list = Array.isArray(assets) ? assets : [];
  const patterns =
    process.platform === 'win32'
      ? [/\.exe$/i, /\.msi$/i]
      : process.platform === 'darwin'
        ? [/\.dmg$/i, /\.pkg$/i, /\.zip$/i]
        : [/\.appimage$/i, /\.deb$/i, /\.rpm$/i, /\.tar\.gz$/i];
  for (const pattern of patterns) {
    const match = list.find((asset) => asset && typeof asset.browser_download_url === 'string' && pattern.test(asset.name || ''));
    if (match !== undefined) return match;
  }
  return undefined;
}

/** Convert one GitHub Releases API payload (list or single release) to our manifest. */
function manifestFromGitHubRelease(payload) {
  const release = Array.isArray(payload) ? payload.find((entry) => entry && entry.draft !== true) : payload;
  if (!release || typeof release !== 'object' || typeof release.tag_name !== 'string') return undefined;
  const version = harnessVersionFromTag(release.tag_name);
  if (!/^\d+\.\d+/.test(version)) return undefined;
  const asset = pickReleaseAsset(release.assets);
  const digest = asset && typeof asset.digest === 'string' && /^sha256:[0-9a-fA-F]{64}$/.test(asset.digest) ? asset.digest.slice(7).toLowerCase() : null;
  return {
    version,
    url: asset !== undefined ? asset.browser_download_url : '',
    sha256: digest,
    notes: typeof release.body === 'string' ? release.body.slice(0, 4000) : '',
    publishedAt: typeof release.published_at === 'string' ? release.published_at.slice(0, 64) : null,
    source: 'github',
    releaseUrl: typeof release.html_url === 'string' ? release.html_url : '',
    downloadAvailable: asset !== undefined,
    downloadPage: 'https://www.deepseek.com/download/',
  };
}

/** Parse a feed document: GitHub Releases API payload or a direct manifest. */
function parseHarnessFeed(document) {
  if (Array.isArray(document) || (document && typeof document === 'object' && typeof document.tag_name === 'string')) {
    return manifestFromGitHubRelease(document);
  }
  const manifest = normalizeUpdateManifest(document);
  if (manifest === undefined) return undefined;
  return {
    ...manifest,
    source: 'direct',
    releaseUrl: '',
    downloadAvailable: true,
    downloadPage: '',
  };
}

/** Fetch and normalize the official GitHub release list (newest first). */
async function githubReleaseManifests() {
  const payload = await fetchJsonDocument(OFFICIAL_GITHUB_RELEASES);
  if (!Array.isArray(payload)) return [];
  return payload
    .filter((release) => release && release.draft !== true && typeof release.tag_name === 'string')
    .slice(0, 15)
    .map((release) => {
      const manifest = manifestFromGitHubRelease(release);
      if (manifest === undefined) return undefined;
      return { ...manifest, prerelease: release.prerelease === true, tagName: release.tag_name };
    })
    .filter((manifest) => manifest !== undefined);
}

/** Build the manifest for the official direct-download channel (HEAD metadata, no version). */
async function officialDirectManifest() {
  const url = OFFICIAL_DIRECT_TARGETS[process.platform];
  if (typeof url !== 'string') throw new Error('official direct download is not available for ' + process.platform);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OFFICIAL_HEAD_TIMEOUT_MS);
  try {
    const response = await fetch(url, { method: 'HEAD', signal: controller.signal, redirect: 'follow' });
    if (!response.ok) throw new Error('HEAD failed: HTTP ' + response.status);
    const size = Number(response.headers.get('content-length') || 0);
    const lastModifiedRaw = response.headers.get('last-modified');
    const lastModified = lastModifiedRaw !== null ? Date.parse(lastModifiedRaw) : NaN;
    const current = currentHarnessInfo();
    const buildNewer =
      Number.isFinite(lastModified) && typeof current.installedAt === 'number' ? lastModified > current.installedAt : false;
    return {
      version: null,
      url,
      sha256: null,
      notes: 'official direct download (latest stable desktop build)',
      publishedAt: Number.isFinite(lastModified) ? new Date(lastModified).toISOString() : null,
      source: 'official-direct',
      releaseUrl: '',
      downloadAvailable: true,
      downloadPage: OFFICIAL_DOWNLOAD_PAGE,
      size: Number.isFinite(size) && size > 0 ? size : null,
      lastModified: Number.isFinite(lastModified) ? lastModified : null,
      buildNewer,
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Spawn a detached process (installer or relaunch) without inheriting stdio. */
function spawnDetached(executable, args) {
  const child = spawn(executable, args, { detached: true, stdio: 'ignore' });
  child.unref();
}

/** Return the staged update only while its file still exists. */
async function currentStagedHarnessUpdate() {
  if (stagedHarnessUpdate === null) return null;
  try {
    await stat(stagedHarnessUpdate.path);
    return stagedHarnessUpdate;
  } catch (error) {
    stagedHarnessUpdate = null;
    return null;
  }
}

/** Build the Harness version-manager route (info / check / download / install / restart / open). */
function createHarnessRoute(store) {
  return async (req, res) => {
    if (!matchesPath(req, HARNESS_PATH)) {
      sendJson(res, 404, { error: 'not found' });
      return;
    }
    if (!requireReadToken(req, res)) return;
    try {
      if (req.method === 'GET') {
        const document = await store.load();
        sendJson(res, 200, {
          current: currentHarnessInfo(),
          feedUrl: document.settings.harnessFeedUrl,
          autoUpdate: document.settings.harnessAutoUpdate,
          autoCheck: document.settings.harnessAutoCheck,
          staged: await currentStagedHarnessUpdate(),
        });
        return;
      }
      if (req.method !== 'POST') {
        sendJson(res, 405, { error: 'method not allowed' });
        return;
      }
      const body = (await readJsonBody(req)) || {};
      const action = typeof body.action === 'string' ? body.action : '';
      const document = await store.load();
      if (action === 'save-settings') {
        await store.replaceItems(
          document.items,
          {
            ...document.settings,
            harnessFeedUrl: typeof body.feedUrl === 'string' ? body.feedUrl : document.settings.harnessFeedUrl,
            harnessAutoUpdate: body.autoUpdate === true,
            harnessAutoCheck: body.autoCheck === true,
          },
          document.reviews,
          document.types,
        );
        const next = await store.load();
        sendJson(res, 200, {
          feedUrl: next.settings.harnessFeedUrl,
          autoUpdate: next.settings.harnessAutoUpdate,
          autoCheck: next.settings.harnessAutoCheck,
        });
        return;
      }
      if (action === 'releases') {
        sendJson(res, 200, { current: currentHarnessInfo(), releases: await githubReleaseManifests() });
        return;
      }
      if (action === 'download-direct') {
        const url = typeof body.url === 'string' ? body.url.trim() : '';
        const sha256 = typeof body.sha256 === 'string' && /^[0-9a-fA-F]{64}$/.test(body.sha256.trim()) ? body.sha256.trim().toLowerCase() : null;
        if (!/^https:\/\//.test(url)) {
          sendJson(res, 400, { error: 'an https installer URL is required' });
          return;
        }
        const manifest = {
          version: 'custom',
          url,
          sha256,
          notes: '',
          publishedAt: null,
          source: 'custom',
          releaseUrl: '',
          downloadAvailable: true,
          downloadPage: '',
        };
        const staged = await downloadHarnessInstaller(manifest, store);
        sendJson(res, 200, { staged, manifest });
        return;
      }
      if (action === 'check') {
        const feedUrl = document.settings.harnessFeedUrl;
        const requestedVersion = typeof body.version === 'string' ? body.version : '';
        if (feedUrl.length === 0 && requestedVersion.length === 0) {
          sendJson(res, 400, { error: 'update feed not configured' });
          return;
        }
        let manifest;
        if (requestedVersion.length > 0) {
          const list = await githubReleaseManifests();
          manifest = list.find((entry) => entry.version === requestedVersion);
          if (manifest === undefined) {
            sendJson(res, 404, { error: 'release not found' });
            return;
          }
        } else {
          manifest = feedUrl === OFFICIAL_DIRECT_FEED ? await officialDirectManifest() : parseHarnessFeed(await fetchJsonDocument(feedUrl));
        }
        if (manifest === undefined) {
          sendJson(res, 422, { error: 'invalid update manifest' });
          return;
        }
        const current = currentHarnessInfo();
        const updateAvailable =
          manifest.version === null ? manifest.buildNewer === true : current.version === null ? true : compareVersions(manifest.version, current.version) > 0;
        sendJson(res, 200, { current, feedUrl, manifest, updateAvailable });
        return;
      }
      if (action === 'download') {
        const feedUrl = document.settings.harnessFeedUrl;
        const requestedVersion = typeof body.version === 'string' ? body.version : '';
        if (feedUrl.length === 0 && requestedVersion.length === 0) {
          sendJson(res, 400, { error: 'update feed not configured' });
          return;
        }
        let manifest;
        if (requestedVersion.length > 0) {
          const list = await githubReleaseManifests();
          manifest = list.find((entry) => entry.version === requestedVersion);
          if (manifest === undefined) {
            sendJson(res, 404, { error: 'release not found' });
            return;
          }
        } else {
          manifest = feedUrl === OFFICIAL_DIRECT_FEED ? await officialDirectManifest() : parseHarnessFeed(await fetchJsonDocument(feedUrl));
        }
        if (manifest === undefined) {
          sendJson(res, 422, { error: 'invalid update manifest' });
          return;
        }
        if (manifest.downloadAvailable !== true || typeof manifest.url !== 'string' || manifest.url.length === 0) {
          sendJson(res, 422, {
            error: 'this release has no installer asset; download manually from the official page',
            downloadPage: manifest.downloadPage || OFFICIAL_DOWNLOAD_PAGE,
            releaseUrl: manifest.releaseUrl || '',
          });
          return;
        }
        const staged = await downloadHarnessInstaller(manifest, store);
        sendJson(res, 200, { staged, manifest });
        return;
      }
      if (action === 'install') {
        if (stagedHarnessUpdate === null || body.confirm !== stagedHarnessUpdate.version) {
          sendJson(res, 409, { error: 'download the update and confirm its version first' });
          return;
        }
        // Two ways in: an explicit per-request approval after the panel showed the
        // downloaded file, or the persisted high-risk auto-update switch. Approval
        // requires either a publisher SHA-256 match or, for the official direct
        // download, a locally computed hash the user explicitly acknowledged.
        const approved =
          body.approved === true &&
          (stagedHarnessUpdate.verified === true ||
            ((stagedHarnessUpdate.official === true || stagedHarnessUpdate.source === 'custom') &&
              typeof body.acknowledgedHash === 'string' &&
              body.acknowledgedHash === stagedHarnessUpdate.sha256));
        if (!approved && document.settings.harnessAutoUpdate !== true) {
          sendJson(res, 403, { error: 'auto update disabled (approval requires a verified hash)' });
          return;
        }
        const file = stagedHarnessUpdate.path;
        const lower = file.toLowerCase();
        let method = null;
        if (lower.endsWith('.exe')) {
          spawnDetached(file, ['/S']);
          method = 'exe-silent';
        } else if (lower.endsWith('.msi')) {
          spawnDetached('msiexec.exe', ['/i', file, '/quiet', '/norestart']);
          method = 'msi-quiet';
        }
        if (method === null) {
          sendJson(res, 415, { error: 'unsupported installer type', path: file });
          return;
        }
        sendJson(res, 200, { started: true, path: file, method });
        return;
      }
      if (action === 'restart') {
        if (document.settings.harnessAutoUpdate !== true) {
          sendJson(res, 403, { error: 'auto update disabled' });
          return;
        }
        if (body.confirm !== 'restart') {
          sendJson(res, 409, { error: 'restart confirmation required' });
          return;
        }
        sendJson(res, 200, { restarting: true, execPath: process.execPath });
        setTimeout(() => {
          try {
            spawnDetached(process.execPath, []);
          } catch (error) {
            // fall through to exit
          }
          setTimeout(() => process.exit(0), 700);
        }, 250);
        return;
      }
      if (action === 'open') {
        const dir = path.join(path.dirname(store.file), 'staging');
        if (process.platform === 'win32') spawnDetached('explorer.exe', [dir]);
        else if (process.platform === 'darwin') spawnDetached('open', [dir]);
        else spawnDetached('xdg-open', [dir]);
        sendJson(res, 200, { opened: true, dir });
        return;
      }
      sendJson(res, 400, { error: 'unknown action' });
    } catch (error) {
      sendJson(res, 500, { error: String((error && error.message) || error) });
    }
  };
}

/**
 * Build the serialized store: cached reads, one writer at a time, atomic replace.
 * @param file - absolute items.json path.
 * @returns load and mutate operations over the same document.
 */
function createStore(file) {
  let cache;
  let queue = Promise.resolve();
  const load = async () => {
    if (cache !== undefined) return cache;
    try {
      const raw = JSON.parse(await readFile(file, 'utf8'));
      cache = normalizeDocument(raw);
    } catch (error) {
      cache = { version: STORE_VERSION, revision: 0, items: [], settings: normalizeSettings(undefined), reviews: [], types: [], webhookQueue: [] };
    }
    return cache;
  };
  const peek = () => cache;
  const serialize = (operation) => {
    queue = queue.then(operation, operation);
    return queue;
  };
  /**
   * Replace the item list (and optionally the settings, review log, and record types) under the store lock.
   * @param items - canonical items.
   * @param settings - optional settings replacement.
   * @param reviews - optional review-log replacement.
   * @param types - optional record-type replacement.
   * @returns the written document.
   */
  const replaceItems = (items, settings, reviews, types) => serialize(async () => {
    const current = await load();
    const next = {
      version: STORE_VERSION,
      revision: current.revision + 1,
      items: pruneDeletedItems(applyItemRevisions(current.items, normalizeItems(items))),
      settings: settings === undefined ? current.settings : normalizeSettings(settings),
      reviews: reviews === undefined ? current.reviews : normalizeReviewLog(reviews),
      types: types === undefined ? current.types : normalizeTypes(types),
    };
    await mkdir(path.dirname(file), { recursive: true });
    const temporary = file + '.tmp';
    await writeFile(temporary, JSON.stringify(next, null, 2), 'utf8');
    await rename(temporary, file);
    cache = next;
    invalidateValueCache();
    await maybeAutoBackup(file);
    return next;
  });
  return {
    load,
    peek,
    replaceItems,
    /**
     * Persist the webhook retry queue in the same document under the store lock.
     * @param items - queue entries.
     * @returns the written queue.
     */
    setWebhookQueue: (items) => serialize(async () => {
      const current = await load();
      const next = {
        ...current,
        revision: current.revision + 1,
        webhookQueue: normalizeWebhookQueue(items),
      };
      await mkdir(path.dirname(file), { recursive: true });
      const temporary = file + '.tmp';
      await writeFile(temporary, JSON.stringify(next, null, 2), 'utf8');
      await rename(temporary, file);
      cache = next;
      return next.webhookQueue;
    }),
    /**
     * Apply a minimal item patch under the store lock.
     * @param upserts - item upserts (new items and changed items, tombstones included).
     * @param expectedRevision - optional If-Match revision.
     * @returns `{ conflict }` when the revision differs, otherwise `{ document }`.
     */
    patchItems: (upserts, expectedRevision) => serialize(async () => {
      const current = await load();
      if (typeof expectedRevision === 'number' && expectedRevision !== current.revision) {
        return { conflict: current };
      }
      const incoming = normalizeItems(Array.isArray(upserts) ? upserts : []);
      const existingById = new Map(current.items.map((item) => [item.id, item]));
      const updates = new Map();
      const additions = [];
      for (const item of incoming) {
        if (existingById.has(item.id)) updates.set(item.id, item);
        else additions.push(item);
      }
      const merged = [...additions.reverse(), ...current.items.map((item) => updates.get(item.id) || item)];
      const next = {
        version: STORE_VERSION,
        revision: current.revision + 1,
        items: pruneDeletedItems(applyItemRevisions(current.items, normalizeItems(merged))),
        settings: current.settings,
        reviews: current.reviews,
        types: current.types,
      };
      await mkdir(path.dirname(file), { recursive: true });
      const temporary = file + '.tmp';
      await writeFile(temporary, JSON.stringify(next, null, 2), 'utf8');
      await rename(temporary, file);
      cache = next;
      invalidateValueCache();
      await maybeAutoBackup(file);
      return { document: next };
    }),
    file,
    backup: {
      list: () => listBackups(file),
      create: () => createBackup(file),
      read: (name) => readBackup(file, name),
    },
  };
}

/**
 * Write one JSON response.
 * @param res - response owned by the route.
 * @param status - HTTP status code.
 * @param payload - JSON-serializable body.
 * @param extraHeaders - optional additional response headers.
 */
function sendJson(res, status, payload, extraHeaders) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...(extraHeaders || {}),
  });
  res.end(JSON.stringify(payload));
}

/** Read one request header (case-insensitive, tolerant of test doubles). */
function requestHeader(req, name) {
  if (!req || !req.headers) return undefined;
  const key = String(name).toLowerCase();
  for (const [header, value] of Object.entries(req.headers)) {
    if (String(header).toLowerCase() === key) return typeof value === 'string' ? value : undefined;
  }
  return undefined;
}

/**
 * Read a bounded JSON request body.
 * @param req - incoming request.
 * @returns the parsed body.
 */
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('error', reject);
    req.on('end', () => {
      const text = Buffer.concat(chunks).toString('utf8');
      if (text.length === 0) {
        resolve(undefined);
        return;
      }
      try {
        resolve(JSON.parse(text));
      } catch (error) {
        reject(new Error('invalid JSON body'));
      }
    });
  });
}

/**
 * Build the raw HTTP handler for the state endpoint.
 * @param store - the shared store.
 * @returns the route handler.
 */
function createStateRoute(store) {
  return async (req, res) => {
    let url;
    try {
      url = new URL(req.url || '/', 'http://localhost');
    } catch (error) {
      sendJson(res, 400, { error: 'bad url' });
      return;
    }
    if (url.pathname !== STATE_PATH) {
      sendJson(res, 404, { error: 'not found' });
      return;
    }
    try {
      if (req.method === 'GET') {
        const document = await store.load();
        const sinceRaw = url.searchParams.get('since');
        const since = sinceRaw === null ? 0 : Number(sinceRaw);
        const watermark = documentWatermark(document);
        if (Number.isFinite(since) && since > 0) {
          const changedItems = document.items.filter((item) => Math.max(item.updatedAt || 0, item.deletedAt || 0) > since);
          const changedReviews = document.reviews.filter((review) => typeof review.at === 'number' && review.at > since);
          sendJson(
            res,
            200,
            {
              revision: document.revision,
              delta: true,
              watermark,
              items: changedItems,
              settings: document.settings,
              reviews: changedReviews,
              types: document.types,
              file: store.file,
            },
            { ETag: '"' + document.revision + '"' },
          );
          return;
        }
        sendJson(
          res,
          200,
          {
            revision: document.revision,
            watermark,
            items: document.items,
            settings: document.settings,
            reviews: document.reviews,
            types: document.types,
            file: store.file,
          },
          { ETag: '"' + document.revision + '"' },
        );
        return;
      }
      if (req.method === 'PATCH') {
        const body = await readJsonBody(req);
        if (!body || !Array.isArray(body.upserts)) {
          sendJson(res, 400, { error: 'upserts must be an array' });
          return;
        }
        const ifMatch = requestHeader(req, 'if-match');
        let expected;
        if (typeof ifMatch === 'string' && ifMatch.trim().length > 0) {
          const raw = ifMatch.trim().replace(/^W\//, '').replace(/"/g, '');
          const parsed = Number(raw);
          if (!Number.isFinite(parsed)) {
            sendJson(res, 400, { error: 'invalid If-Match header' });
            return;
          }
          expected = parsed;
        } else if (typeof body.baseRevision === 'number' && Number.isFinite(body.baseRevision)) {
          expected = body.baseRevision;
        }
        const result = await store.patchItems(body.upserts, expected);
        if (result.conflict !== undefined) {
          const current = result.conflict;
          sendJson(
            res,
            409,
            {
              error: 'revision conflict',
              revision: current.revision,
              items: current.items,
              settings: current.settings,
              reviews: current.reviews,
              types: current.types,
            },
            { ETag: '"' + current.revision + '"' },
          );
          return;
        }
        const document = result.document;
        sendJson(
          res,
          200,
          {
            revision: document.revision,
            watermark: documentWatermark(document),
            items: document.items,
            settings: document.settings,
            reviews: document.reviews,
            types: document.types,
          },
          { ETag: '"' + document.revision + '"' },
        );
        return;
      }
      if (req.method === 'PUT') {
        const body = await readJsonBody(req);
        if (!body || !Array.isArray(body.items)) {
          sendJson(res, 400, { error: 'items must be an array' });
          return;
        }
        const ifMatch = requestHeader(req, 'if-match');
        let expected;
        if (typeof ifMatch === 'string' && ifMatch.trim().length > 0) {
          const raw = ifMatch.trim().replace(/^W\//, '').replace(/"/g, '');
          const parsed = Number(raw);
          if (!Number.isFinite(parsed)) {
            sendJson(res, 400, { error: 'invalid If-Match header' });
            return;
          }
          expected = parsed;
        }
        const current = await store.load();
        if (expected !== undefined && expected !== current.revision) {
          sendJson(
            res,
            409,
            {
              error: 'revision conflict',
              revision: current.revision,
              items: current.items,
              settings: current.settings,
              reviews: current.reviews,
              types: current.types,
            },
            { ETag: '"' + current.revision + '"' },
          );
          return;
        }
        const document = await store.replaceItems(body.items, body.settings, body.reviews, body.types);
        sendJson(
          res,
          200,
          {
            revision: document.revision,
            items: document.items,
            settings: document.settings,
            reviews: document.reviews,
            types: document.types,
          },
          { ETag: '"' + document.revision + '"' },
        );
        return;
      }
      sendJson(res, 405, { error: 'method not allowed' });
    } catch (error) {
      sendJson(res, 400, { error: String((error && error.message) || error) });
    }
  };
}

/**
 * Standard JSON Schema object from property entries.
 * @param properties - field schemas.
 * @param required - required field names.
 * @returns a JSON Schema object node.
 */
function objectSchema(properties, required) {
  const schema = { type: 'object', additionalProperties: false, properties };
  if (required.length > 0) schema.required = required;
  return schema;
}

/**
 * Build one plain-text tool result block.
 * @param text - rendered text.
 * @returns a one-element content array.
 */
function renderText(text) {
  return [{ type: 'text', text }];
}

/**
 * Text-only render of one item list, the shape every tool result shares.
 * @param items - canonical items.
 * @returns one text content block.
 */
function renderItems(items) {
  if (items.length === 0) return renderText('No matching items.');
  const lines = items.map((item) => {
    const status = item.kind === 'task' ? (item.status === 'done' ? '[done] ' : '[open] ') : '';
    const priority = item.kind === 'task' && item.priority !== 'normal' ? '[' + item.priority + '] ' : '';
    const kindTag =
      item.kind === 'card'
        ? '[card] '
        : item.kind === 'metric'
          ? '[metric] '
          : item.kind === 'med'
            ? '[med] '
            : item.kind === 'record'
              ? '[record] '
              : '';
    const recordText =
      item.kind === 'record'
        ? ' ' + Object.values(item.record.values).slice(0, 3).map((value) => String(value)).join(' ')
        : '';
    const due = item.kind === 'task' && item.due !== null ? ' due ' + new Date(item.due).toISOString() : '';
    const reviewDue = item.kind === 'card' && item.review.dueAt !== null ? ' review ' + new Date(item.review.dueAt).toISOString() : '';
    const health =
      item.kind === 'metric' && item.health.value !== null
        ? ' ' + item.health.value + (item.health.value2 !== null ? '/' + item.health.value2 : '') + (item.health.unit.length > 0 ? ' ' + item.health.unit : '')
        : item.kind === 'med' && item.health.times.length > 0
          ? ' at ' + item.health.times.join('/') + (item.health.active ? '' : ' (inactive)')
          : '';
    const tags = item.tags.length > 0 ? ' #' + item.tags.join(' #') : '';
    const title = item.title.length > 0 ? item.title : item.body.split('\n').find((line) => line.trim().length > 0) || '(untitled)';
    return '- ' + status + priority + kindTag + title.slice(0, 120) + due + reviewDue + health + recordText + tags + ' (' + item.id + ')';
  });
  return renderText(lines.join('\n'));
}

/** Parameter schema of one item, shared by create/complete outputs. */
const ITEM_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    kind: { type: 'string', enum: KINDS },
    title: { type: 'string' },
    body: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    status: { type: 'string', enum: ['open', 'done'] },
    priority: { type: 'string', enum: PRIORITIES },
    due: { oneOf: [{ type: 'number' }, { type: 'null' }] },
    doneAt: { oneOf: [{ type: 'number' }, { type: 'null' }] },
    review: {
      type: 'object',
      additionalProperties: false,
      properties: {
        ease: { type: 'number' },
        intervalDays: { type: 'integer' },
        repetitions: { type: 'integer' },
        dueAt: { oneOf: [{ type: 'number' }, { type: 'null' }] },
        lastAt: { oneOf: [{ type: 'number' }, { type: 'null' }] },
      },
      required: ['ease', 'intervalDays', 'repetitions', 'dueAt', 'lastAt'],
    },
    health: {
      type: 'object',
      additionalProperties: false,
      properties: {
        value: { oneOf: [{ type: 'number' }, { type: 'null' }] },
        value2: { oneOf: [{ type: 'number' }, { type: 'null' }] },
        unit: { type: 'string' },
        times: { type: 'array', items: { type: 'string' } },
        active: { type: 'boolean' },
        at: { oneOf: [{ type: 'number' }, { type: 'null' }] },
        intakes: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              date: { type: 'string' },
              time: { type: 'string' },
              at: { type: 'number' },
            },
            required: ['date', 'time', 'at'],
          },
        },
      },
      required: ['value', 'value2', 'unit', 'times', 'active', 'at', 'intakes'],
    },
    record: {
      type: 'object',
      additionalProperties: false,
      properties: {
        typeId: { type: 'string' },
        values: { type: 'object', additionalProperties: true },
      },
      required: ['typeId', 'values'],
    },
    createdAt: { type: 'number' },
    updatedAt: { type: 'number' },
    rev: { type: 'integer' },
    deletedAt: { oneOf: [{ type: 'number' }, { type: 'null' }] },
    checklist: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string' },
          text: { type: 'string' },
          done: { type: 'boolean' },
        },
        required: ['id', 'text', 'done'],
      },
    },
    repeat: { type: 'string', enum: REPEATS },
    order: { oneOf: [{ type: 'number' }, { type: 'null' }] },
    attachments: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          size: { type: 'integer' },
          mediaType: { type: 'string' },
        },
        required: ['id', 'name', 'size', 'mediaType'],
      },
    },
  },
  required: ['id', 'kind', 'title', 'body', 'tags', 'status', 'priority', 'due', 'doneAt', 'review', 'health', 'record', 'order', 'createdAt', 'updatedAt', 'rev', 'deletedAt', 'checklist', 'repeat', 'attachments'],
};

/** Parameter schema of one custom record type definition. */
const TYPE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    fields: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          key: { type: 'string' },
          label: { type: 'string' },
          type: { type: 'string', enum: RECORD_FIELD_TYPES },
          options: { type: 'array', items: { type: 'string' } },
        },
        required: ['key', 'label', 'type', 'options'],
      },
    },
    views: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          query: { type: 'string' },
          sort: { type: 'string', enum: ['updated', 'title'] },
          createdAt: { type: 'number' },
        },
        required: ['id', 'name', 'query', 'sort', 'createdAt'],
      },
    },
    createdAt: { type: 'number' },
    updatedAt: { type: 'number' },
  },
  required: ['id', 'name', 'fields', 'views', 'createdAt', 'updatedAt'],
};

/** Build the Markdown workspace report text shared by the report/archive actions. */
function workspaceReportMarkdown(report) {
  const lines = ['# 工作区价值报告', '', '生成时间: ' + new Date().toISOString(), '平均价值分: ' + report.averageScore, ''];
  for (const row of report.workspaces) {
    lines.push('## ' + row.title);
    lines.push('- 路径: ' + (row.path || '—'));
    lines.push('- 价值分: ' + row.valueScore + ' (' + row.grade + ') · 阶段: ' + row.stage + ' · 未来价值: ' + row.future);
    lines.push(
      '- 社会价值: ' +
        row.socialScore +
        ' (' +
        row.socialGrade +
        ')' +
        (row.socialDomains.length > 0 ? ' · 领域: ' + row.socialDomains.join('、') : ''),
    );
    lines.push('- 会话: ' + row.sessions + ' · Tokens: ' + row.totalTokens + ' · 估算金额: CNY ' + row.cost);
    if (row.note.length > 0) lines.push('- 评价 (' + (row.rating || '未评级') + '): ' + row.note);
    if (row.socialNote.length > 0) lines.push('- 社会价值说明 (' + (row.socialRating || '未评级') + '): ' + row.socialNote);
    lines.push('');
  }
  return lines.join('\n');
}

/** Subset of one workspace value row exposed by the agent tool. */
const WORKSPACE_ROW_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    path: { type: 'string' },
    title: { type: 'string' },
    valueScore: { type: 'integer' },
    grade: { type: 'string' },
    stage: { type: 'string' },
    future: { type: 'string' },
    socialScore: { type: 'integer' },
    socialGrade: { type: 'string' },
    socialDomains: { type: 'array', items: { type: 'string' } },
    sessions: { type: 'integer' },
    totalTokens: { type: 'number' },
    cost: { type: 'number' },
    daysSinceLast: { oneOf: [{ type: 'integer' }, { type: 'null' }] },
    activeDays: { type: 'integer' },
    recent14: { type: 'integer' },
    momentum: { type: 'number' },
    files: { type: 'integer' },
    rating: { type: 'string' },
    note: { type: 'string' },
    socialRating: { type: 'string' },
    socialNote: { type: 'string' },
  },
  required: [
    'path', 'title', 'valueScore', 'grade', 'stage', 'future', 'socialScore', 'socialGrade',
    'socialDomains', 'sessions', 'totalTokens', 'cost', 'daysSinceLast', 'activeDays',
    'recent14', 'momentum', 'files', 'rating', 'note', 'socialRating', 'socialNote',
  ],
};

/** Pick the agent-visible subset of one workspace value row. */
function workspaceRowForAgent(row) {
  return {
    path: row.path,
    title: row.title,
    valueScore: row.valueScore,
    grade: row.grade,
    stage: row.stage,
    future: row.future,
    socialScore: row.socialScore,
    socialGrade: row.socialGrade,
    socialDomains: row.socialDomains,
    sessions: row.sessions,
    totalTokens: row.totalTokens,
    cost: row.cost,
    daysSinceLast: row.daysSinceLast,
    activeDays: row.activeDays,
    recent14: row.recent14,
    momentum: row.momentum,
    files: row.files,
    rating: row.rating,
    note: row.note,
    socialRating: row.socialRating,
    socialNote: row.socialNote,
  };
}

/** Advance one due timestamp by a repeat schedule until it is after now. */
function advanceRepeatDue(due, repeat, now) {
  if (due === null) return null;
  const date = new Date(due);
  if (repeat === 'monthly') {
    let guard = 0;
    while (date.getTime() <= now && guard < 240) {
      date.setMonth(date.getMonth() + 1);
      guard += 1;
    }
  } else {
    const step = repeat === 'daily' ? 1 : repeat === 'weekly' ? 7 : 0;
    if (step === 0) return due;
    while (date.getTime() <= now) date.setDate(date.getDate() + step);
  }
  return date.getTime();
}

/** Build the next open occurrence of a repeating task. */
function nextRepeatItem(item, now) {
  return normalizeItem({
    ...item,
    id: randomUUID(),
    status: 'open',
    doneAt: null,
    due: advanceRepeatDue(item.due, item.repeat, now),
    checklist: item.checklist.map((row) => ({ ...row, done: false })),
    createdAt: now,
    updatedAt: now,
    rev: 0,
    deletedAt: null,
  });
}

/**
 * Parse "text --due 2026-11-06 --priority high --tag 购物" command input into
 * a text body plus simple options. Unknown flags stay in the text.
 */
function parseCommandInput(raw) {
  const text = String(raw || '');
  const pick = (name) => {
    const match = text.match(new RegExp('--' + name + '\\s+(?:"([^"]*)"|([^\\s]+))'));
    return match === null ? undefined : (match[1] !== undefined ? match[1] : match[2]);
  };
  const strip = (name) => text.replace(new RegExp('\\s*--' + name + '\\s+(?:"[^"]*"|[^\\s]+)', 'g'), ' ');
  const dueRaw = pick('due');
  let due = null;
  if (dueRaw !== undefined) {
    const relative = { 今天: 0, today: 0, 明天: 1, tomorrow: 1, 后天: 2 };
    if (Object.prototype.hasOwnProperty.call(relative, dueRaw)) {
      const date = new Date();
      date.setDate(date.getDate() + relative[dueRaw]);
      date.setHours(18, 0, 0, 0);
      due = date.getTime();
    } else {
      const parsed = /^\d{4}-\d{2}-\d{2}$/.test(dueRaw) ? new Date(dueRaw + 'T18:00:00').getTime() : Date.parse(dueRaw);
      due = Number.isFinite(parsed) ? parsed : null;
    }
  }
  const priorityRaw = pick('priority');
  const priority = ['low', 'normal', 'high'].includes(priorityRaw) ? priorityRaw : 'normal';
  const tagRaw = pick('tag');
  let rest = strip('due');
  rest = rest.replace(/--(priority|tag)\s+(?:"[^"]*"|[^\s]+)/g, ' ');
  rest = rest.replace(/--(due|priority|tag)/g, ' ').replace(/\s+/g, ' ').trim();
  return { text: rest, due, priority, tag: typeof tagRaw === 'string' ? tagRaw.trim() : '' };
}

/** Create one normalized item and persist it ahead of the current list. */
async function createConsoleItem(store, input) {
  const now = Date.now();
  const item = normalizeItem({
    id: randomUUID(),
    kind: input.kind,
    title: input.title,
    body: input.body,
    tags: input.tags,
    status: 'open',
    priority: input.priority || 'normal',
    due: input.due === undefined ? null : input.due,
    createdAt: now,
    updatedAt: now,
  });
  const document = await store.load();
  await store.replaceItems([item, ...document.items]);
  return item;
}

/** First non-empty line used as a title. */
function titleFromText(text, maxLength) {
  const line = String(text || '')
    .split('\n')
    .map((entry) => entry.trim())
    .find((entry) => entry.length > 0);
  return (line || '').slice(0, maxLength || 60);
}

/** Build the human-facing slash commands over the same store. */
function createCommands(store) {
  const commandList = [
    {
      name: 'note',
      description: '保存一条笔记：/note 文本（可多行）',
      input: { hint: '笔记内容' },
      handler: async (invocation) => {
        const input = parseCommandInput(invocation.rawInput);
        if (input.text.length === 0) return { kind: 'error', text: '用法：/note <文本>' };
        const item = await createConsoleItem(store, {
          kind: 'note',
          title: titleFromText(input.text, 60),
          body: input.text,
          tags: ['命令'],
        });
        return { kind: 'success', text: '已保存笔记《' + (item.title || item.id) + '》（id: ' + item.id + '）' };
      },
    },
    {
      name: 'capture',
      description: '捕获对话片段为笔记：/capture 文本',
      input: { hint: '要捕获的文本' },
      handler: async (invocation) => {
        const input = parseCommandInput(invocation.rawInput);
        if (input.text.length === 0) return { kind: 'error', text: '用法：/capture <文本>' };
        const item = await createConsoleItem(store, {
          kind: 'note',
          title: titleFromText(input.text, 60),
          body: input.text,
          tags: ['对话', '命令'],
        });
        return { kind: 'success', text: '已捕获为笔记（id: ' + item.id + '）' };
      },
    },
    {
      name: 'clip',
      description: '网页剪藏为笔记：/clip https://example.com/article',
      input: { hint: '网页 URL' },
      handler: async (invocation) => {
        const url = String(invocation.rawInput || '').trim().split(/\s+/)[0];
        if (!/^https?:\/\//i.test(url)) return { kind: 'error', text: '用法：/clip <http(s) 网页 URL>' };
        const clip = await clipWebPage(url);
        const body = '来源：' + clip.url + '\n\n' + clip.description + '\n\n' + clip.excerpt;
        const item = await createConsoleItem(store, {
          kind: 'note',
          title: (clip.title || new URL(clip.url).hostname).slice(0, 80),
          body,
          tags: ['剪藏'],
        });
        return { kind: 'success', text: '已剪藏《' + item.title + '》（id: ' + item.id + '）' };
      },
    },
    {
      name: 'task',
      description: '新建任务：/task 标题 --due 2026-11-06 --priority high --tag 购物',
      input: { hint: '任务标题与可选参数' },
      handler: async (invocation) => {
        const input = parseCommandInput(invocation.rawInput);
        if (input.text.length === 0) return { kind: 'error', text: '用法：/task <标题> [--due 日期] [--priority low|normal|high] [--tag 标签]' };
        const item = await createConsoleItem(store, {
          kind: 'task',
          title: titleFromText(input.text, 80),
          body: '',
          tags: input.tag.length > 0 ? ['命令', input.tag] : ['命令'],
          priority: input.priority,
          due: input.due,
        });
        return { kind: 'success', text: '已创建任务《' + item.title + '》（id: ' + item.id + '）' + (item.due === null ? '' : '，截止 ' + new Date(item.due).toLocaleString()) };
      },
    },
    {
      name: 'search',
      description: '搜索管理台条目：/search 关键词',
      input: { hint: '搜索关键词' },
      handler: async (invocation) => {
        const query = String(invocation.rawInput || '').trim().toLowerCase();
        if (query.length === 0) return { kind: 'error', text: '用法：/search <关键词>' };
        const document = await store.load();
        const matched = document.items
          .filter((item) => item.deletedAt === null && [item.title, item.body, item.tags.join(' ')].join(' ').toLowerCase().includes(query))
          .sort((left, right) => right.updatedAt - left.updatedAt)
          .slice(0, 8);
        if (matched.length === 0) return { kind: 'success', text: '没有匹配「' + query + '」的条目。' };
        const lines = matched.map((item, index) => index + 1 + '. [' + item.kind + '] ' + (item.title || '(无标题)') + ' — id: ' + item.id);
        return { kind: 'success', text: '找到 ' + matched.length + ' 条：\n' + lines.join('\n') };
      },
    },
    {
      name: 'plan',
      description: '查看未来 7 天计划（任务 / 复习 / 用药）',
      handler: async () => {
        const document = await store.load();
        const now = Date.now();
        const dayStart = new Date();
        dayStart.setHours(0, 0, 0, 0);
        const start = dayStart.getTime();
        const end = start + 7 * 86400000;
        const tasks = document.items.filter((item) => item.kind === 'task' && item.deletedAt === null && item.status === 'open' && item.due !== null && item.due >= start && item.due < end);
        const cards = document.items.filter((item) => item.kind === 'card' && item.deletedAt === null && item.review.dueAt !== null && item.review.dueAt < end);
        const meds = document.items.filter((item) => item.kind === 'med' && item.deletedAt === null && item.health.active);
        const taskLines = tasks
          .sort((left, right) => left.due - right.due)
          .slice(0, 5)
          .map((item) => '- ' + new Date(item.due).toLocaleDateString() + ' ' + (item.title || '(无标题)'));
        return {
          kind: 'success',
          text:
            '未来 7 天：' +
            tasks.length +
            ' 个任务 · ' +
            cards.length +
            ' 张复习到期 · ' +
            meds.length +
            ' 个用药计划' +
            (taskLines.length > 0 ? '\n' + taskLines.join('\n') : ''),
        };
      },
    },
    {
      name: 'review',
      description: '查看今日复习到期情况',
      handler: async () => {
        const document = await store.load();
        const now = Date.now();
        const due = document.items
          .filter((item) => item.kind === 'card' && item.deletedAt === null && item.review.dueAt !== null && item.review.dueAt <= now)
          .sort((left, right) => left.review.dueAt - right.review.dueAt);
        const lines = due.slice(0, 5).map((item, index) => index + 1 + '. ' + (item.title || '(无标题)'));
        return {
          kind: 'success',
          text: '今日待复习 ' + due.length + ' 张' + (lines.length > 0 ? '：\n' + lines.join('\n') : '，去面板「知识 → 复习」开始吧。'),
        };
      },
    },
  ];
  return commandList;
}

/**
 * Register the human-facing slash commands when the Host exposes a command registry.
 * Conflict or absence must never break the plugin apply.
 */
function registerCommands(ctx, store) {
  const commands = ctx.get('commands');
  if (commands === undefined || typeof commands.register !== 'function') return;
  ctx.effect(() => {
    const disposers = [];
    for (const definition of createCommands(store)) {
      try {
        disposers.push(commands.register(definition));
      } catch (error) {
        // A conflicting shipped command must not take the whole plugin down.
      }
    }
    return () => {
      for (const dispose of disposers) dispose();
    };
  }, 'quick-note: slash commands');
}

/** Build the agent-facing tools over the same store. */
function createTools(store) {
  return [
    {
      name: 'quick_note_search',
      description:
        'Search the local management console (personal notes, tasks, records, and health data on this machine). Returns matching items with their ids; use the ids with quick_note_complete. Search matches title, body, and tags; soft-deleted items are hidden unless includeDeleted is true.',
      parameters: objectSchema({
        query: { type: 'string', description: 'Case-insensitive text to match in title, body, or tags. Omit to list everything.' },
        kind: { type: 'string', enum: KINDS, description: 'Restrict to one kind. Omit for all.' },
        includeDone: { type: 'boolean', description: 'Include completed tasks (default false).' },
        includeDeleted: { type: 'boolean', description: 'Include soft-deleted items (default false).' },
        tag: { type: 'string', description: 'Only items carrying this tag (case-insensitive).' },
        overdue: { type: 'boolean', description: 'Only open tasks whose due time already passed.' },
        dueWithinDays: { type: 'integer', description: 'Only items due within the next N days (tasks).' },
        priority: { type: 'string', enum: PRIORITIES, description: 'Restrict tasks to one priority. Omit for all.' },
        limit: { type: 'integer', description: 'Maximum items to return (default 20).' },
      }, []),
      output: {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            items: { type: 'array', items: ITEM_SCHEMA },
            total: { type: 'integer' },
          },
          required: ['items', 'total'],
        },
        render: (_args, value) => renderItems(value.items),
      },
      async execute(args) {
        const document = await store.load();
        const query = typeof args.query === 'string' ? args.query.trim().toLowerCase() : '';
        const kind = KINDS.includes(args.kind) ? args.kind : undefined;
        const includeDone = args.includeDone === true;
        const includeDeleted = args.includeDeleted === true;
        const tag = typeof args.tag === 'string' ? args.tag.trim().toLowerCase() : '';
        const nowMs = Date.now();
        const dueLimit =
          typeof args.dueWithinDays === 'number' && Number.isFinite(args.dueWithinDays) && args.dueWithinDays >= 0
            ? nowMs + Math.min(Math.floor(args.dueWithinDays), 3650) * 86400000
            : null;
        const priority = PRIORITIES.includes(args.priority) ? args.priority : undefined;
        const limit = typeof args.limit === 'number' && args.limit > 0 ? Math.min(Math.floor(args.limit), 100) : 20;
        const matched = document.items.filter((item) => {
          if (!includeDeleted && item.deletedAt !== null) return false;
          if (kind !== undefined && item.kind !== kind) return false;
          if (tag.length > 0 && !item.tags.some((entry) => entry.toLowerCase() === tag)) return false;
          if (args.overdue === true) {
            if (item.kind !== 'task' || item.status !== 'open' || item.due === null || item.due >= nowMs) return false;
          }
          if (dueLimit !== null) {
            if (item.kind !== 'task' || item.due === null || item.due > dueLimit) return false;
          }
          if (item.kind === 'task' && !includeDone && item.status === 'done') return false;
          if (priority !== undefined && (item.kind !== 'task' || item.priority !== priority)) return false;
          if (query.length === 0) return true;
          const recordText = item.kind === 'record' ? Object.values(item.record.values).map((value) => String(value)).join(' ') : '';
          const haystack = (item.title + '\n' + item.body + '\n' + item.tags.join(' ') + '\n' + recordText).toLowerCase();
          return haystack.includes(query);
        });
        matched.sort((left, right) => right.updatedAt - left.updatedAt);
        return { items: matched.slice(0, limit), total: matched.length };
      },
    },
    {
      name: 'quick_note_create',
      description:
        'Create one item in the local management console. kind "note" is a free-form note; kind "task" is a to-do with open/done state, priority, and an optional due time; kind "card" is a flashcard whose front goes in title and back in body (SM-2 review is scheduled in the panel); kind "metric" is a health reading (value/value2/unit/at); kind "med" is a medication plan whose daily times go in times as HH:mm strings; kind "record" is a custom record for a user-defined type (pass recordTypeId and recordValues). Returns the created item including its id.',
      parameters: objectSchema({
        kind: { type: 'string', enum: KINDS, description: 'note / task / card / metric (health reading) / med (medication plan) / record (custom record); defaults to note.' },
        title: { type: 'string', description: 'Short title; for a note it may be empty when the body carries the text.' },
        body: { type: 'string', description: 'Full text or task notes.' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Optional free-form tags.' },
        priority: { type: 'string', enum: PRIORITIES, description: 'Task priority: low, normal, or high. Defaults to normal.' },
        due: { type: 'string', description: 'Optional due time as an ISO 8601 date-time string.' },
        value: { type: 'number', description: 'Health metric reading (for kind "metric"), such as 120 or 65.5.' },
        value2: { type: 'number', description: 'Optional second reading for paired metrics such as blood pressure diastolic.' },
        unit: { type: 'string', description: 'Health metric unit, such as mmHg or kg.' },
        times: { type: 'array', items: { type: 'string' }, description: 'Medication times as HH:mm strings (for kind "med"), such as ["08:00","20:00"].' },
        at: { type: 'string', description: 'Optional measurement time as an ISO 8601 date-time string (defaults to now).' },
        recordTypeId: { type: 'string', description: 'For kind "record": the id of a custom record type defined in the console.' },
        recordValues: { type: 'object', additionalProperties: true, description: 'For kind "record": field values keyed by field key.' },
        checklist: { type: 'array', items: { type: 'string' }, description: 'For kind "task": checklist item texts.' },
        repeat: { type: 'string', enum: REPEATS, description: 'For kind "task": repeat schedule (none/daily/weekly/monthly).' },
      }, []),
      output: {
        schema: objectSchema({ item: ITEM_SCHEMA }, ['item']),
        render: (_args, value) => renderText('Created item ' + value.item.id + ' (' + value.item.kind + ').'),
      },
      async execute(args) {
        const title = typeof args.title === 'string' ? args.title : '';
        const body = typeof args.body === 'string' ? args.body : '';
        const kind = KINDS.includes(args.kind) ? args.kind : 'note';
        const recordTypeId = typeof args.recordTypeId === 'string' ? args.recordTypeId : '';
        if (kind === 'record' && recordTypeId.length === 0) throw new Error('recordTypeId is required for kind "record"');
        if (kind !== 'record' && title.trim().length === 0 && body.trim().length === 0) {
          throw new Error('title or body must contain text');
        }
        const dueValue = typeof args.due === 'string' ? Date.parse(args.due) : NaN;
        const atValue = typeof args.at === 'string' ? Date.parse(args.at) : NaN;
        const now = Date.now();
        const item = normalizeItem({
          id: randomUUID(),
          kind,
          title,
          body,
          tags: args.tags,
          status: 'open',
          priority: PRIORITIES.includes(args.priority) ? args.priority : 'normal',
          due: Number.isFinite(dueValue) ? dueValue : null,
          doneAt: null,
          health: HEALTH_KINDS.includes(kind)
            ? {
                value: typeof args.value === 'number' && Number.isFinite(args.value) ? args.value : null,
                value2: typeof args.value2 === 'number' && Number.isFinite(args.value2) ? args.value2 : null,
                unit: typeof args.unit === 'string' ? args.unit : '',
                times: args.times,
                active: true,
                at: Number.isFinite(atValue) ? atValue : now,
              }
            : undefined,
          record: kind === 'record' ? { typeId: recordTypeId, values: args.recordValues } : undefined,
          checklist: kind === 'task' && Array.isArray(args.checklist)
            ? args.checklist
                .filter((text) => typeof text === 'string' && text.trim().length > 0)
                .slice(0, 50)
                .map((text) => ({ id: randomUUID(), text, done: false }))
            : [],
          repeat: kind === 'task' && REPEATS.includes(args.repeat) ? args.repeat : 'none',
          createdAt: now,
          updatedAt: now,
        });
        const document = await store.load();
        await store.replaceItems([item, ...document.items]);
        return { item };
      },
    },
    {
      name: 'quick_note_complete',
      description:
        'Set the state of one console task (or reopen it). Pass the item id returned by quick_note_search or quick_note_create. Notes are not tasks; completing a note is rejected.',
      parameters: objectSchema({
        id: { type: 'string', description: 'The item id.' },
        status: { type: 'string', enum: ['done', 'open'], description: 'Target state; defaults to done.' },
      }, ['id']),
      output: {
        schema: objectSchema({ item: ITEM_SCHEMA }, ['item']),
        render: (_args, value) => renderText('Item ' + value.item.id + ' is now ' + value.item.status + '.'),
      },
      async execute(args) {
        const id = typeof args.id === 'string' ? args.id : '';
        const document = await store.load();
        const existing = document.items.find((item) => item.id === id);
        if (existing === undefined) throw new Error('no item with id ' + JSON.stringify(id));
        if (existing.deletedAt !== null) throw new Error('item ' + JSON.stringify(id) + ' is soft-deleted; restore it with quick_note_update restore:true first');
        if (existing.kind !== 'task') throw new Error('item ' + JSON.stringify(id) + ' is a note, not a task');
        const status = args.status === 'open' ? 'open' : 'done';
        const now = Date.now();
        const updated = {
          ...existing,
          status,
          doneAt: status === 'done' ? now : null,
          updatedAt: now,
        };
        const nextItems = document.items.map((item) => (item.id === id ? updated : item));
        if (status === 'done' && existing.repeat !== 'none') {
          const next = nextRepeatItem(updated, now);
          if (next !== undefined) nextItems.unshift(next);
        }
        await store.replaceItems(nextItems);
        return { item: updated };
      },
    },
    {
      name: 'quick_note_update',
      description:
        'Update one existing console item by id: change its title, body, tags, task priority, due time, completion state, or record field values. Only the fields you pass change. Pass due as an ISO 8601 string to set it, or null to clear it. Soft-deleted items are rejected unless restore is true, which restores them.',
      parameters: objectSchema({
        id: { type: 'string', description: 'The item id.' },
        title: { type: 'string', description: 'New title.' },
        body: { type: 'string', description: 'New full text.' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Replacement tag list.' },
        priority: { type: 'string', enum: PRIORITIES, description: 'Task priority.' },
        due: { oneOf: [{ type: 'string' }, { type: 'null' }], description: 'ISO 8601 due time, or null to clear it.' },
        status: { type: 'string', enum: ['open', 'done'], description: 'Task completion state.' },
        restore: { type: 'boolean', description: 'Restore a soft-deleted item instead of rejecting it (default false).' },
        checklist: { type: 'array', items: { type: 'string' }, description: 'For tasks: replacement checklist item texts (done flags reset).' },
        repeat: { type: 'string', enum: REPEATS, description: 'For tasks: repeat schedule (none/daily/weekly/monthly).' },
        recordValues: { type: 'object', additionalProperties: true, description: 'For record items: field values to merge into the existing record values.' },
      }, ['id']),
      output: {
        schema: objectSchema({ item: ITEM_SCHEMA }, ['item']),
        render: (_args, value) => renderText('Updated item ' + value.item.id + ' (' + value.item.title + ').'),
      },
      async execute(args) {
        const id = typeof args.id === 'string' ? args.id : '';
        const document = await store.load();
        const existing = document.items.find((item) => item.id === id);
        if (existing === undefined) throw new Error('no item with id ' + JSON.stringify(id));
        const restore = args.restore === true;
        if (existing.deletedAt !== null && !restore) {
          throw new Error('item ' + JSON.stringify(id) + ' is soft-deleted; pass restore:true to restore it');
        }
        const patch = {};
        if (restore) patch.deletedAt = null;
        if (typeof args.title === 'string') patch.title = args.title;
        if (typeof args.body === 'string') patch.body = args.body;
        if (Array.isArray(args.tags)) patch.tags = args.tags;
        if (PRIORITIES.includes(args.priority)) patch.priority = args.priority;
        if (Object.prototype.hasOwnProperty.call(args, 'due')) {
          if (args.due === null) {
            patch.due = null;
          } else if (typeof args.due === 'string' && Number.isFinite(Date.parse(args.due))) {
            patch.due = Date.parse(args.due);
          } else {
            throw new Error('due must be an ISO 8601 string or null');
          }
        }
        if (args.status === 'open' || args.status === 'done') {
          patch.status = args.status;
          patch.doneAt = args.status === 'done' ? Date.now() : null;
        }
        if (args.recordValues && typeof args.recordValues === 'object' && !Array.isArray(args.recordValues)) {
          patch.record = { typeId: existing.record.typeId, values: { ...existing.record.values, ...args.recordValues } };
        }
        if (Array.isArray(args.checklist)) {
          patch.checklist = args.checklist
            .filter((text) => typeof text === 'string' && text.trim().length > 0)
            .slice(0, 50)
            .map((text) => ({ id: randomUUID(), text, done: false }));
        }
        if (typeof args.repeat === 'string' && REPEATS.includes(args.repeat)) patch.repeat = args.repeat;
        const wasDone = existing.status === 'done';
        patch.updatedAt = Date.now();
        const merged = normalizeItem({ ...existing, ...patch });
        if (merged.kind !== 'record' && merged.title.trim().length === 0 && merged.body.trim().length === 0) {
          throw new Error('title or body must contain text');
        }
        const nextItems = document.items.map((item) => (item.id === id ? merged : item));
        if (!wasDone && merged.status === 'done' && merged.repeat !== 'none') {
          const next = nextRepeatItem(merged, Date.now());
          if (next !== undefined) nextItems.unshift(next);
        }
        await store.replaceItems(nextItems);
        return { item: merged };
      },
    },
    {
      name: 'quick_note_batch',
      description:
        'Apply one bulk action to several console items by id: complete, reopen, soft-delete, set task priority, replace tags, or set the task due time. Returns the changed items and how many changed. Repeating tasks spawn their next occurrence on complete.',
      parameters: objectSchema({
        action: { type: 'string', enum: ['complete', 'reopen', 'delete', 'priority', 'tags', 'due'], description: 'Bulk action to apply.' },
        ids: { type: 'array', items: { type: 'string' }, description: 'Item ids to update.' },
        priority: { type: 'string', enum: PRIORITIES, description: 'Target task priority for action "priority".' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Replacement tag list for action "tags".' },
        due: { oneOf: [{ type: 'string' }, { type: 'null' }], description: 'ISO 8601 due time (or null) for action "due".' },
      }, ['action', 'ids']),
      output: {
        schema: objectSchema({ items: { type: 'array', items: ITEM_SCHEMA }, count: { type: 'integer' } }, ['items', 'count']),
        render: (_args, value) => renderText('Updated ' + value.count + ' item(s).'),
      },
      async execute(args) {
        const actions = ['complete', 'reopen', 'delete', 'priority', 'tags', 'due'];
        const action = actions.includes(args.action) ? args.action : 'complete';
        const ids = new Set(Array.isArray(args.ids) ? args.ids.filter((id) => typeof id === 'string' && id.length > 0) : []);
        if (ids.size === 0) throw new Error('ids must contain at least one item id');
        const document = await store.load();
        const now = Date.now();
        const changed = [];
        const spawned = [];
        const nextItems = [];
        for (const item of document.items) {
          if (!ids.has(item.id) || item.deletedAt !== null) {
            nextItems.push(item);
            continue;
          }
          let updated = item;
          if (action === 'complete' || action === 'reopen' || action === 'priority' || action === 'due') {
            if (item.kind !== 'task') {
              nextItems.push(item);
              continue;
            }
          }
          if (action === 'complete') {
            updated = { ...item, status: 'done', doneAt: now, updatedAt: now };
          } else if (action === 'reopen') {
            updated = { ...item, status: 'open', doneAt: null, updatedAt: now };
          } else if (action === 'delete') {
            updated = { ...item, deletedAt: now, updatedAt: now, rev: item.rev + 1 };
          } else if (action === 'priority') {
            updated = { ...item, priority: PRIORITIES.includes(args.priority) ? args.priority : 'normal', updatedAt: now };
          } else if (action === 'tags') {
            updated = { ...item, tags: Array.isArray(args.tags) ? args.tags : [], updatedAt: now };
          } else {
            if (args.due === null) {
              updated = { ...item, due: null, updatedAt: now };
            } else if (typeof args.due === 'string' && Number.isFinite(Date.parse(args.due))) {
              updated = { ...item, due: Date.parse(args.due), updatedAt: now };
            } else {
              throw new Error('due must be an ISO 8601 string or null');
            }
          }
          const normalized = normalizeItem(updated);
          if (normalized === undefined) continue;
          nextItems.push(normalized);
          changed.push(normalized);
          if (action === 'complete' && item.repeat !== 'none') {
            const next = nextRepeatItem(normalized, now);
            if (next !== undefined) {
              spawned.push(next);
              changed.push(next);
            }
          }
        }
        if (changed.length === 0) throw new Error('no matching items to update');
        await store.replaceItems([...spawned, ...nextItems]);
        return { items: changed, count: changed.length };
      },
    },
    {
      name: 'quick_note_type',
      description:
        'Manage custom record types in the local console. action "list" returns every type; "create" adds one from a name and fields; "update" renames, replaces the fields, or replaces the saved views of an existing type; "delete" removes a type together with its records. Each field has a label and a type of text/number/date/checkbox/select; select fields take options. Views are saved filters with a name, an optional query, and a sort of updated/title.',
      parameters: objectSchema({
        action: { type: 'string', enum: ['list', 'create', 'update', 'delete'], description: 'Operation to perform.' },
        id: { type: 'string', description: 'Type id; required for update and delete.' },
        name: { type: 'string', description: 'Type name for create/update.' },
        fields: {
          type: 'array',
          description: 'Field list for create/update: objects with label, type, and optional options.',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              label: { type: 'string' },
              type: { type: 'string', enum: RECORD_FIELD_TYPES },
              options: { type: 'array', items: { type: 'string' } },
            },
            required: ['label'],
          },
        },
        views: {
          type: 'array',
          description: 'Replacement saved-view list for create/update: objects with name, optional query, and sort.',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              name: { type: 'string' },
              query: { type: 'string' },
              sort: { type: 'string', enum: ['updated', 'title'] },
            },
            required: ['name'],
          },
        },
      }, ['action']),
      output: {
        schema: objectSchema(
          {
            types: { type: 'array', items: TYPE_SCHEMA },
            type: TYPE_SCHEMA,
            removedRecords: { type: 'integer' },
          },
          [],
        ),
        render: (_args, value) => {
          if (Array.isArray(value.types)) {
            if (value.types.length === 0) return renderText('No custom record types.');
            const lines = value.types.map(
              (type) => '- ' + type.name + ' (' + type.id + '): ' + (type.fields.map((field) => field.label + ':' + field.type).join(', ') || 'no fields'),
            );
            return renderText(lines.join('\n'));
          }
          if (value.type !== undefined) {
            const suffix = value.removedRecords === undefined ? '' : ', removed records: ' + value.removedRecords;
            return renderText('Type ' + value.type.id + ' (' + value.type.name + ')' + suffix + '.');
          }
          return renderText('Done.');
        },
      },
      async execute(args) {
        const action = args.action === 'create' || args.action === 'update' || args.action === 'delete' ? args.action : 'list';
        const document = await store.load();
        if (action === 'list') return { types: document.types };
        const id = typeof args.id === 'string' ? args.id : '';
        const fieldsInput = Array.isArray(args.fields) ? args.fields : undefined;
        const viewsInput = Array.isArray(args.views) ? args.views : undefined;
        if (action === 'create') {
          const name = typeof args.name === 'string' ? args.name.trim() : '';
          if (name.length === 0) throw new Error('name is required for create');
          const created = normalizeTypes([
            {
              id: randomUUID(),
              name,
              fields: fieldsInput === undefined ? [{ label: '名称', type: 'text', options: [] }] : fieldsInput,
              views: viewsInput === undefined ? [] : viewsInput,
            },
          ])[0];
          if (created === undefined) throw new Error('the type could not be created from those fields');
          await store.replaceItems(document.items, undefined, undefined, [...document.types, created]);
          return { type: created };
        }
        const existing = document.types.find((type) => type.id === id);
        if (existing === undefined) throw new Error('no record type with id ' + JSON.stringify(id));
        if (action === 'update') {
          const name = typeof args.name === 'string' && args.name.trim().length > 0 ? args.name.trim() : existing.name;
          const fields = fieldsInput === undefined ? existing.fields : fieldsInput;
          const views = viewsInput === undefined ? existing.views : viewsInput;
          const updated = normalizeTypes([{ ...existing, name, fields, views }])[0];
          await store.replaceItems(
            document.items,
            undefined,
            undefined,
            document.types.map((type) => (type.id === id ? updated : type)),
          );
          return { type: updated };
        }
        const removedRecords = document.items.filter((item) => item.kind === 'record' && item.record.typeId === id && item.deletedAt === null).length;
        const deletedAt = Date.now();
        await store.replaceItems(
          document.items.map((item) =>
            item.kind === 'record' && item.record.typeId === id
              ? { ...item, deletedAt: item.deletedAt === null ? deletedAt : item.deletedAt, updatedAt: deletedAt }
              : item,
          ),
          undefined,
          undefined,
          document.types.filter((type) => type.id !== id),
        );
        return { type: existing, removedRecords };
      },
    },
    {
      name: 'quick_note_workspace',
      description:
        'Read, annotate, and report workspace value analysis in the local console. action "list" returns every workspace with its value score (A-D), stage, future value, social value score/grade/domains, tokens, cost, activity, and saved assessment. action "rate" saves a manual rating and note for one workspace path (also socialRating/socialNote). action "snapshot" appends the current scores to the value history used by the trend. action "report" returns a Markdown report of every workspace with its scores, metrics, and assessments. action "archive" saves that Markdown report as a note in the console.',
      parameters: objectSchema({
        action: { type: 'string', enum: ['list', 'rate', 'snapshot', 'report', 'archive'], description: 'Operation to perform.' },
        path: { type: 'string', description: 'Workspace path; required for rate.' },
        rating: { type: 'string', enum: ['high', 'medium', 'low', 'none'], description: 'Manual value rating; none clears it.' },
        note: { type: 'string', description: 'Manual assessment note.' },
        socialRating: { type: 'string', enum: ['high', 'medium', 'low', 'none'], description: 'Manual social value rating; none clears it.' },
        socialNote: { type: 'string', description: 'Manual social value note.' },
      }, ['action']),
      output: {
        schema: objectSchema(
          {
            workspaces: { type: 'array', items: WORKSPACE_ROW_SCHEMA },
            averageScore: { type: 'integer' },
            item: ITEM_SCHEMA,
            saved: {
              type: 'object',
              additionalProperties: false,
              properties: {
                path: { type: 'string' },
                rating: { type: 'string' },
                note: { type: 'string' },
                socialRating: { type: 'string' },
                socialNote: { type: 'string' },
                snapshots: { type: 'integer' },
                at: { type: 'number' },
              },
              required: ['path', 'rating', 'note', 'socialRating', 'socialNote', 'snapshots', 'at'],
            },
            report: { type: 'string' },
          },
          [],
        ),
        render: (_args, value) => {
          if (typeof value.report === 'string') return renderText(value.report);
          if (value.item !== undefined) return renderText('Archived workspace report as note ' + value.item.id + '.');
          if (Array.isArray(value.workspaces)) {
            if (value.workspaces.length === 0) return renderText('No workspaces.');
            const lines = value.workspaces.map(
              (row) =>
                '- ' +
                row.title +
                ' (' +
                row.path +
                '): value ' +
                row.valueScore +
                row.grade +
                ', social ' +
                row.socialScore +
                row.socialGrade +
                ', ' +
                row.stage +
                '/' +
                row.future +
                ', sessions ' +
                row.sessions +
                ', tokens ' +
                row.totalTokens +
                (row.note.length > 0 ? ', note: ' + row.note.slice(0, 80) : '') +
                (row.socialNote.length > 0 ? ', social note: ' + row.socialNote.slice(0, 80) : ''),
            );
            return renderText('Average value score ' + value.averageScore + '\n' + lines.join('\n'));
          }
          if (value.saved !== undefined) {
            if (value.saved.snapshots > 0) {
              return renderText('Captured ' + value.saved.snapshots + ' workspace snapshots.');
            }
            return renderText(
              'Saved assessment for ' +
                value.saved.path +
                ' (rating: ' +
                (value.saved.rating || 'none') +
                ', social: ' +
                (value.saved.socialRating || 'none') +
                ').',
            );
          }
          return renderText('Done.');
        },
      },
      async execute(args) {
        const action =
          args.action === 'rate' || args.action === 'snapshot' || args.action === 'report' || args.action === 'archive'
            ? args.action
            : 'list';
        if (action === 'report' || action === 'archive') {
          const report = await buildWorkspaceValueReport(store);
          const markdown = workspaceReportMarkdown(report);
          if (action === 'report') return { report: markdown };
          const document = await store.load();
          const now = Date.now();
          const item = normalizeItem({
            id: randomUUID(),
            kind: 'note',
            title: '工作区价值报告 ' + new Date().toISOString().slice(0, 10),
            body: markdown,
            tags: ['工作区', '价值报告'],
            status: 'open',
            priority: 'normal',
            due: null,
            doneAt: null,
            createdAt: now,
            updatedAt: now,
          });
          await store.replaceItems([item, ...document.items]);
          return { item };
        }
        if (action === 'list') {
          const report = await buildWorkspaceValueReport(store);
          return { workspaces: report.workspaces.map(workspaceRowForAgent), averageScore: report.averageScore };
        }
        const document = await store.load();
        if (action === 'snapshot') {
          const report = await buildWorkspaceValueReport(store);
          const history = { ...document.settings.valueHistory };
          const at = Date.now();
          for (const row of report.workspaces) {
            const key = row.path.length > 0 ? row.path : row.title;
            history[key] = [...(history[key] || []), { at, valueScore: row.valueScore, socialScore: row.socialScore }].slice(-12);
          }
          await store.replaceItems(document.items, { ...document.settings, valueHistory: history }, document.reviews, document.types);
          return {
            saved: { path: '', rating: '', note: '', socialRating: '', socialNote: '', snapshots: report.workspaces.length, at },
          };
        }
        const path = typeof args.path === 'string' ? args.path : '';
        if (path.length === 0) throw new Error('path is required for rate');
        const notes = { ...document.settings.workspaceNotes };
        const existing = notes[path] || { note: '', rating: '', socialNote: '', socialRating: '' };
        const rating = args.rating === 'high' || args.rating === 'medium' || args.rating === 'low' ? args.rating : args.rating === 'none' ? '' : existing.rating;
        const socialRating =
          args.socialRating === 'high' || args.socialRating === 'medium' || args.socialRating === 'low'
            ? args.socialRating
            : args.socialRating === 'none'
              ? ''
              : existing.socialRating;
        const note = typeof args.note === 'string' ? args.note.slice(0, 2000) : existing.note;
        const socialNote = typeof args.socialNote === 'string' ? args.socialNote.slice(0, 2000) : existing.socialNote;
        if (note.length === 0 && rating.length === 0 && socialNote.length === 0 && socialRating.length === 0) delete notes[path];
        else notes[path] = { note, rating, socialNote, socialRating, updatedAt: Date.now() };
        await store.replaceItems(document.items, { ...document.settings, workspaceNotes: notes }, document.reviews, document.types);
        return { saved: { path, rating, note, socialRating, socialNote, snapshots: 0, at: Date.now() } };
      },
    },
  ];
}

/**
 * Short local date-time label for a due timestamp.
 * @param value - milliseconds since epoch.
 * @returns the label.
 */
function formatDueLabel(value) {
  const date = new Date(value);
  const pad = (part) => String(part).padStart(2, '0');
  return date.getMonth() + 1 + '/' + date.getDate() + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
}

/**
 * Compose the once-per-assembly prompt context: today's and overdue open tasks plus today's medication plan.
 * @param document - current store document.
 * @returns the context text, or an empty string when disabled or nothing applies.
 */
function buildDailyBrief(document) {
  if (!document || document.settings.brief !== true) return '';
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const start = dayStart.getTime();
  const end = start + 24 * 60 * 60 * 1000;
  const title = (item) => {
    const text = item.title.trim().length > 0 ? item.title.trim() : item.body.split('\n').find((line) => line.trim().length > 0) || '(untitled)';
    return text.slice(0, 60);
  };
  const due = document.items
    .filter((item) => item.deletedAt === null && item.kind === 'task' && item.status === 'open' && item.due !== null && item.due < end)
    .sort((left, right) => left.due - right.due);
  const today = due.filter((item) => item.due >= start);
  const overdue = due.filter((item) => item.due < start);
  const meds = document.items
    .filter((item) => item.deletedAt === null && item.kind === 'med' && item.health.active && item.health.times.length > 0)
    .sort((left, right) => left.health.times[0].localeCompare(right.health.times[0]));
  const parts = [];
  if (due.length > 0) {
    const lines = due.slice(0, 5).map((item) => '- ' + title(item) + (item.due < start ? '（逾期 ' + formatDueLabel(item.due) + '）' : '（今天 ' + formatDueLabel(item.due) + '）'));
    parts.push(
      '管理台今日待办：今天到期 ' + today.length + ' 项，逾期未完成 ' + overdue.length + ' 项。\n' + lines.join('\n'),
    );
  }
  if (meds.length > 0) {
    parts.push('管理台今日用药：' + meds.map((item) => item.health.times.join('/') + ' ' + title(item)).join('；') + '。');
  }
  const cards = document.items
    .filter((item) => item.deletedAt === null && item.kind === 'card' && item.review.dueAt !== null && item.review.dueAt < end)
    .sort((left, right) => left.review.dueAt - right.review.dueAt);
  if (cards.length > 0) {
    parts.push('管理台待复习：' + cards.length + ' 张（' + cards.slice(0, 3).map((item) => title(item)).join('、') + '）。');
  }
  if (parts.length === 0) return '';
  parts.push('以上为本机管理台数据，可用 quick_note_search / quick_note_update / quick_note_complete 查看或处理。');
  return parts.join('\n');
}

/** The workbench's Host-side surface: sync route plus agent tools. */
const inject = ['tools', 'webServer'];

/**
 * Register the sync route, the agent tools, and the once-per-step daily brief context.
 * @param ctx - Host plugin context carrying `tools` and `webServer`.
 */
function apply(ctx) {
  const store = createStore(resolveStoreFile());
  webhookQueueStore = store;
  store.load().then((document) => applySavingsRuntime(document.settings)).catch(() => {});
  ctx.effect(() => {
    const systemPrompt = optionalService(ctx, 'systemPrompt');
    if (!systemPrompt || typeof systemPrompt.section !== 'function') return () => {};
    return systemPrompt.section({
      name: 'quick-note-savings',
      order: 900,
      text: () =>
        savingsRuntime.mode
          ? '[COST SAVING MODE] Keep responses concise and action-oriented. Do not restate files or previously established context; prefer diffs, short summaries, and targeted reads.' +
            (savingsRuntime.maxOutput > 0 ? ' Keep the final answer under about ' + savingsRuntime.maxOutput + ' tokens.' : '') +
            (savingsRuntime.thriftWorkspaces.length > 0 ? ' Thrift workspaces: ' + savingsRuntime.thriftWorkspaces.slice(0, 10).join(', ') + '. For these, prefer targeted reads and never paste whole files.' : '')
          : '',
    });
  }, 'quick-note: savings prompt section');
  ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: SAVINGS_POLICY_PATH, handler: createSavingsPolicyRoute(store, ctx) }), 'quick-note: savings policy route');
  ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: AUTH_PATH, handler: createAuthRoute() }), 'quick-note: auth route');
  ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: FILES_PATH, handler: createFilesRoute() }), 'quick-note: files route');
  ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: CLIP_PATH, handler: createClipRoute() }), 'quick-note: clip route');
  ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: MARKDOWN_PATH, handler: createMarkdownRoute(store) }), 'quick-note: markdown route');
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'prefix',
        path: VOICE_PATH,
        handler: createVoiceRoute(() => {
          try {
            return typeof ctx.get === 'function' ? ctx.get('speechToText') : undefined;
          } catch (error) {
            return undefined;
          }
        }),
      }),
    'quick-note: voice route',
  );
  ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: SHARE_PATH, handler: createShareRoute(store) }), 'quick-note: share route');
  const reminderCache = { value: null };
  const refreshReminders = () => {
    computeReminderSnapshot(store)
      .then(async (snapshot) => {
        reminderCache.value = snapshot;
        const document = await store.load();
        if (snapshot.budget && (snapshot.budget.over === true || snapshot.budget.warn === true || snapshot.budget.monthlyOver === true || snapshot.budget.monthlyWarn === true)) {
          await sendBudgetWebhook(document, null, snapshot.budget);
        }
        const overBudget = snapshot.budget && (snapshot.budget.over === true || snapshot.budget.monthlyOver === true);
        if (overBudget && document.settings.savingsGuard !== false && !savingsRuntime.mode) {
          await activateSavingsMode(store, ctx, snapshot.budget.over === true ? 'daily budget exceeded' : 'monthly budget exceeded');
        }
        return undefined;
      })
      .catch(() => {});
  };
  refreshReminders();
  ctx.effect(() => {
    const timer = setInterval(refreshReminders, 60000);
    if (typeof timer.unref === 'function') timer.unref();
    return () => clearInterval(timer);
  }, 'quick-note: reminder timer');
  ctx.effect(
    () => ctx.webServer.register({ kind: 'prefix', path: REMINDERS_PATH, handler: createRemindersRoute(store, reminderCache) }),
    'quick-note: reminders route',
  );
  ctx.effect(
    () => ctx.webServer.register({ kind: 'prefix', path: CLEANUP_PATH, handler: createCleanupRoute(store) }),
    'quick-note: cleanup route',
  );
  ctx.effect(
    () => ctx.webServer.register({ kind: 'prefix', path: OPTIMIZER_REPORT_PATH, handler: createOptimizerReportRoute(store) }),
    'quick-note: optimizer report route',
  );
  ctx.effect(() => {
    const timer = setInterval(async () => {
      try {
        const document = await store.load();
        const mode = document.settings.cleanupSchedule;
        if (mode !== 'daily' && mode !== 'weekly' && mode !== 'cron') return;
        const state = await readFile(cleanupSchedulePath(), 'utf8')
          .then((text) => JSON.parse(text))
          .catch(() => ({ lastRunAt: 0 }));
        const evaluated = evaluateCleanupSchedule(mode, document.settings.cleanupScheduleTime, document.settings.cleanupScheduleCron, document.settings.cleanupScheduleTimezone, typeof state.lastRunAt === 'number' ? state.lastRunAt : 0, Date.now());
        if (evaluated.due) await runAutoCleanup(store);
      } catch (error) {
        // scheduled cleanup is best-effort
      }
    }, 15000);
    const webhookTimer = setInterval(() => {
      processWebhookQueue(5).catch(() => {});
    }, 5 * 60000);
    if (typeof webhookTimer.unref === 'function') webhookTimer.unref();
    if (typeof timer.unref === 'function') timer.unref();
    return () => {
      clearInterval(timer);
      clearInterval(webhookTimer);
    };
  }, 'quick-note: scheduled cleanup timer');
  ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: BACKUP_PATH, handler: createBackupRoute(store) }), 'quick-note: backup route');
  ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: HARNESS_PATH, handler: createHarnessRoute(store) }), 'quick-note: harness route');
  ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: ROUTE_PREFIX, handler: createStateRoute(store) }), 'quick-note: state route');
  ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: ADMIN_PATH, handler: createAdminRoute(store) }), 'quick-note: admin route');
  ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: USAGE_PATH, handler: createUsageRoute(store) }), 'quick-note: usage route');
  ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: SAVINGS_PATH, handler: createSavingsRoute(store, ctx) }), 'quick-note: savings route');
  ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: VALUE_PATH, handler: createValueRoute(store) }), 'quick-note: value route');
  ctx.effect(() => {
    const disposers = createTools(store).map((definition) => ctx.tools.register(definition));
    return () => {
      for (const dispose of disposers) dispose();
    };
  }, 'quick-note: agent tools');
  store.load().catch(() => {});
  registerCommands(ctx, store);
  const prompt = ctx.get('systemPrompt');
  if (prompt !== undefined) {
    ctx.effect(
      () =>
        prompt.context({
          name: 'quick-note-brief',
          order: 500,
          text: () => buildDailyBrief(store.peek()),
        }),
      'quick-note: daily brief',
    );
  }
}

export { apply, buildDailyBrief, inject, sendBudgetWebhook };

