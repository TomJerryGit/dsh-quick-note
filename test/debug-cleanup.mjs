import path from 'node:path';
import fs from 'node:fs';
import { applyHost, makeHome, makeWorkspace, request } from './helpers.mjs';

const home = await makeHome('debug-cleanup');
const root = path.join(home.home, 'workspaces', 'proj-a');
await makeWorkspace(home.home, { bucket: '--workspace-a--', sessionId: 's1', projectPath: root, title: 'ProjA', totals: { uncachedInputTokens: 1, outputTokens: 1, cacheReadTokens: 0, cacheWriteTokens: 0 } });
const host = await applyHost();
const cleanup = host.route('/api/quick-note/cleanup');
const readToken = (await request(host.route('/api/quick-note/auth').handler, 'GET', '/api/quick-note/auth')).json.token;
const scan = await request(cleanup.handler, 'POST', '/api/quick-note/cleanup', { action: 'scan' }, { 'x-quick-note-token': readToken });
console.log('status', scan.status);
console.log('json', JSON.stringify(scan.json).slice(0, 500));
await home.cleanup();
