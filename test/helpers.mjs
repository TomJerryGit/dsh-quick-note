/**
 * Shared harness helpers for the plugin regression tests.
 *
 * The tests run against the plugin sources directly (no browser, no DSH host):
 * - the Host half is imported as an ES module and applied to a fake Cordis ctx;
 * - the client half is evaluated with a tiny React/fetch/browser stub.
 *
 * Run with: ELECTRON_RUN_AS_NODE=1 "<dsh exe>" test/run.mjs
 * (or `node test/run.mjs` on machines with Node 22+).
 */
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { EventEmitter } from 'node:events';
import { pathToFileURL } from 'node:url';

/** Absolute plugin root directory (this test file lives in `<root>/test`). */
export const ROOT = path.resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));

/** Read one plugin source file. */
export function source(name) {
  return fs.readFileSync(path.join(ROOT, name), 'utf8');
}

/** Create a fresh temporary DSH home and point $DSH_HOME at it. */
export async function makeHome(prefix) {
  const home = path.join(os.tmpdir(), prefix + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8));
  await fsp.mkdir(home, { recursive: true });
  process.env.DSH_HOME = home;
  return {
    home,
    async cleanup() {
      await fsp.rm(home, { recursive: true, force: true }).catch(() => {});
    },
  };
}

/** Import the Host module with cache busting. */
export async function importHost() {
  return import(pathToFileURL(path.join(ROOT, 'index.js')).href + '?t=' + Date.now() + Math.random());
}

/** Apply the Host plugin to a fake ctx; returns its routes, tools, and commands. */
export async function applyHost(options) {
  const settings = options || {};
  const module = await importHost();
  const routes = [];
  const tools = [];
  const commands = [];
  module.apply({
    effect(callback) {
      callback();
      return () => {};
    },
    tools: {
      register(definition) {
        tools.push(definition);
        return () => {};
      },
    },
    webServer: {
      register(route) {
        routes.push(route);
        return () => {};
      },
    },
    get(name) {
      if (name === 'speechToText' && settings.speech !== undefined) return settings.speech;
      if (name === 'commands') {
        return {
          register(definition) {
            commands.push(definition);
            return () => {};
          },
        };
      }
      return undefined;
    },
  });
  return {
    module,
    routes,
    tools,
    commands,
    route: (endpointPath) => routes.find((entry) => entry.path === endpointPath),
    tool: (name) => tools.find((entry) => entry.name === name),
    command: (name) => commands.find((entry) => entry.name === name),
  };
}

/** Send one fake HTTP request to a Route handler. */
export function request(handler, method, url, body, headers) {
  return new Promise((resolve) => {
    const req = new EventEmitter();
    req.method = method;
    req.url = url;
    req.headers = headers || {};
    req.destroy = () => {};
    const chunks = [];
    let status = 0;
    let responseHeaders = {};
    const res = {
      writeHead(code, headers_) {
        status = code;
        responseHeaders = headers_ || {};
      },
      end(chunk) {
        if (chunk !== undefined) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
        const buffer = Buffer.concat(chunks);
        const text = buffer.toString('utf8');
        let json;
        try {
          json = text.length > 0 ? JSON.parse(text) : undefined;
        } catch (error) {
          json = { parseError: text };
        }
        resolve({ status, json, headers: responseHeaders, buffer, text });
      },
    };
    Promise.resolve(handler(req, res)).catch((error) => resolve({ status: -1, error }));
    process.nextTick(() => {
      if (body !== undefined) {
        req.emit('data', Buffer.isBuffer(body) ? body : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body)));
      }
      req.emit('end');
    });
  });
}

/** Create a synthetic session-projection cache document. */
export function projection(totals) {
  return { version: 4, record: { rows: { tokenUsage: { ver: 2, seq: 1, val: { totals, last: null } } } } };
}

/** Create a synthetic workspace bucket on disk (sessions + workspace.json + projcache). */
export async function makeWorkspace(home, options) {
  const { bucket, sessionId, projectPath, title, totals } = options;
  await fsp.mkdir(path.join(home, 'storages', 'session_projcache', 'sessions'), { recursive: true });
  const file = path.join(home, 'storages', 'workspace.json');
  let table = { tables: { workspaces: {} } };
  try {
    table = JSON.parse(await fsp.readFile(file, 'utf8'));
  } catch (error) {
    // first workspace creates the table
  }
  table.tables = table.tables || { workspaces: {} };
  table.tables.workspaces[title] = { path: projectPath, title, sessionIds: [sessionId] };
  await fsp.writeFile(file, JSON.stringify(table), 'utf8');
  await fsp.writeFile(
    path.join(home, 'storages', 'session_projcache', 'sessions', sessionId + '.json'),
    JSON.stringify(projection(totals)),
    'utf8',
  );
  const sessionDir = path.join(home, 'sessions', bucket, sessionId);
  await fsp.mkdir(sessionDir, { recursive: true });
  await fsp.writeFile(path.join(sessionDir, 'session.v4.jsonl.zstd'), 'x', 'utf8');
  await fsp.mkdir(projectPath, { recursive: true });
}

/** Minimal React stub with hooks backed by a per-mount slot store. */
export function createReactStub() {
  let activeMount = null;
  const withMount = (mount, callback) => {
    const previous = activeMount;
    activeMount = mount;
    try {
      return callback();
    } finally {
      activeMount = previous;
    }
  };
  const slot = (mount, factory) => {
    const index = mount.cursor;
    mount.cursor += 1;
    if (!(index in mount.store)) mount.store[index] = factory();
    return mount.store[index];
  };
  const depsChanged = (previous, next) => {
    if (previous === undefined) return true;
    if (!Array.isArray(previous) || !Array.isArray(next)) return true;
    if (previous.length !== next.length) return true;
    return previous.some((value, index) => !Object.is(value, next[index]));
  };
  const React = {
    createElement(type, props, ...children) {
      return { type, props: props || {}, children };
    },
    useState(initial) {
      const entry = slot(activeMount, () => ({ value: typeof initial === 'function' ? initial() : initial }));
      return [entry.value, (next) => {
        entry.value = typeof next === 'function' ? next(entry.value) : next;
      }];
    },
    useRef(initial) {
      return slot(activeMount, () => ({ current: initial }));
    },
    useEffect(callback, deps) {
      const mount = activeMount;
      const entry = slot(mount, () => ({ deps: undefined, cleanup: undefined }));
      if (depsChanged(entry.deps, deps)) {
        entry.deps = deps;
        mount.pending.push({ entry, callback });
      }
    },
    useCallback(callback, deps) {
      const entry = slot(activeMount, () => ({ deps: undefined, fn: callback }));
      if (depsChanged(entry.deps, deps)) {
        entry.deps = deps;
        entry.fn = callback;
      }
      return entry.fn;
    },
    useSyncExternalStore(subscribe, getSnapshot) {
      const entry = slot(activeMount, () => ({ subscribed: false }));
      if (!entry.subscribed) {
        entry.subscribed = true;
        subscribe(() => {});
      }
      return getSnapshot();
    },
    Component: class {
      constructor(props) {
        this.props = props;
      }
    },
  };
  React.__withMount = withMount;
  return React;
}

/** Build a browser stub plus a mutable fake server backing fetch. */
export function createBrowserStub(server) {
  const storage = new Map();
  const blobs = [];
  const listeners = new Map();
  const window = {
    navigator: { language: 'en-US' },
    localStorage: {
      getItem: (key) => (storage.has(key) ? storage.get(key) : null),
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: (key) => storage.delete(key),
    },
    setTimeout: (callback) => {
      queueMicrotask(callback);
      return 1;
    },
    clearTimeout: () => {},
    setInterval: () => 2,
    clearInterval: () => {},
    location: { reload: () => {} },
    Blob: class {
      constructor(parts) {
        this.parts = parts;
        blobs.push(this);
      }
    },
    URL: { createObjectURL: () => 'blob:test', revokeObjectURL: () => {} },
    document: { createElement: () => ({ href: '', download: '', click() {} }) },
    fetch: (url, options) => server.fetch(url, options),
    addEventListener: (type, handler) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(handler);
    },
    removeEventListener: (type, handler) => {
      const set = listeners.get(type);
      if (set) set.delete(handler);
    },
    emit: (type, event) => {
      for (const handler of listeners.get(type) || []) handler(event);
    },
  };
  window.__ModuleLoader__ = { load: (entry) => {
    window.loadedEntry = entry;
  } };
  return { window, blobs };
}

/** Evaluate client.js against a browser stub and register the client plugin. */
export function loadClient(window, React) {
  new Function('window', source('client.js'))(window);
  const plugin = window.loadedEntry.factory((name) => {
    if (name === 'react') return React;
    throw new Error('unexpected require: ' + name);
  });
  const registrations = new Map();
  registrations.byId = new Map();
  plugin.apply({
    effect(callback) {
      callback();
      return () => {};
    },
    locale: {
      register() {
        return () => {};
      },
      bind() {
        return (key) => 'LBL:' + key;
      },
    },
    slots: {
      inject(key, callback) {
        callback();
        return () => {};
      },
      register(options, component) {
        const registration = { options, component, injected: options.inject ? options.inject() : {} };
        registrations.set(options.name, registration);
        registrations.byId.set(options.name + '#' + (options.id !== undefined ? options.id : options.key), registration);
        return () => {};
      },
    },
    layout: { selectPanel: () => {} },
    get(name) {
      if (name === 'uiWorkspace' && window) {
        return {
          openSession: (sessionId) => {
            window.__openedSession = sessionId;
          },
        };
      }
      return undefined;
    },
  });
  return registrations;
}

/** Render one registered component with hooks effects applied. */
export function createRenderer(registration, React) {
  const root = { cursor: 0, store: [], pending: [] };
  const nested = new Map();
  const withMount = React.__withMount;
  const childPath = (path, child, index) => {
    const key = child && child.props && child.props.key !== undefined ? String(child.props.key) : String(index);
    return path + '/' + key;
  };
  const renderNode = (node, mount, path) => {
    if (node === null || node === undefined || typeof node === 'string' || typeof node === 'number') return node;
    if (Array.isArray(node)) return node.map((child, index) => renderNode(child, mount, childPath(path, child, index)));
    if (typeof node.type === 'function') {
      const component = node.type;
      if (component.prototype && typeof component.prototype.render === 'function') {
        const instance = new component(node.props || {});
        if (instance.state === undefined) instance.state = {};
        return renderNode(instance.render(), mount, path);
      }
      if (mount !== undefined) {
        mount.cursor = 0;
        return withMount(mount, () => renderNode(component(node.props || {}), undefined, path));
      }
      const key = path + ':' + (component.name || 'anonymous');
      if (!nested.has(key)) nested.set(key, { cursor: 0, store: [], pending: [] });
      const nestedMount = nested.get(key);
      nestedMount.cursor = 0;
      return withMount(nestedMount, () => renderNode(component(node.props || {}), undefined, path));
    }
    return {
      type: node.type,
      props: node.props,
      children: (node.children || []).map((child, index) => renderNode(child, mount, childPath(path, child, index))),
    };
  };
  return {
    render(props) {
      root.cursor = 0;
      const merged = { t: (key) => 'LBL:' + key, selectPanel: () => {}, ...(registration.injected || {}), ...(props || {}) };
      const tree = renderNode({ type: registration.component, props: merged, children: [] }, root, 'root');
      const mounts = [root, ...nested.values()];
      for (const mount of mounts) {
        const effects = mount.pending;
        mount.pending = [];
        for (const effect of effects) {
          if (effect.entry.cleanup) effect.entry.cleanup();
          const cleanup = effect.callback();
          effect.entry.cleanup = typeof cleanup === 'function' ? cleanup : undefined;
        }
      }
      return tree;
    },
  };
}

/** Wait one macrotask-ish turn (setImmediate) repeatedly. */
export async function settle(rounds = 16) {
  for (let index = 0; index < rounds; index += 1) {
    await new Promise((resolve) => setImmediate(resolve));
  }
}

/** Collect every element matching a class token in a rendered tree. */
export function byClass(tree, className) {
  const found = [];
  const visit = (node) => {
    if (node === null || node === undefined || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const child of node) visit(child);
      return;
    }
    const tokens = String(node.props && node.props.className ? node.props.className : '').split(' ');
    if (tokens.includes(className)) found.push(node);
    for (const child of node.children || []) visit(child);
  };
  visit(tree);
  return found;
}

/** Flattened text of one rendered element. */
export function textOf(node) {
  const texts = [];
  const visit = (element) => {
    if (element === null || element === undefined || typeof element !== 'object') return;
    if (Array.isArray(element)) {
      for (const child of element) visit(child);
      return;
    }
    for (const child of element.children || []) {
      if (typeof child === 'string' || typeof child === 'number') texts.push(String(child));
      else visit(child);
    }
  };
  visit(node);
  return texts.join(' | ');
}

/** Print the collected check lines and set the process exit code. */
export function report(label, lines) {
  const failed = lines.some((line) => line.startsWith('FAIL'));
  const passed = lines.filter((line) => line.startsWith('OK')).length;
  for (const line of lines) console.log(line);
  console.log((failed ? 'FAIL ' : 'PASS ') + label + ' (' + passed + ' checks)');
  if (failed) process.exitCode = 1;
}
