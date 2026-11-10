/**
 * Host-half regression tests: normalization, routes, usage/value analysis,
 * agent tools, daily brief, and static asset checks.
 */
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { applyHost, makeHome, makeWorkspace, request, report, ROOT, source } from './helpers.mjs';

const lines = [];
const check = (label, ok, extra) => {
  lines.push((ok ? 'OK   ' : 'FAIL ') + label + (extra === undefined ? '' : ' :: ' + extra));
};

const stateDoc = (overrides) => ({
  items: [],
  settings: { brief: true },
  reviews: [],
  types: [],
  ...overrides,
});

async function main() {
  const home = await makeHome('dsh-quick-note-test');
  const workspaceRoot = path.join(home.home, 'workspaces', 'proj-a');
  await makeWorkspace(home.home, {
    bucket: '--workspace-a--',
    sessionId: 'session-a1',
    projectPath: workspaceRoot,
    title: 'ProjA',
    totals: { uncachedInputTokens: 1000000, outputTokens: 500000, cacheReadTokens: 2000000, cacheWriteTokens: 0 },
  });
  await makeWorkspace(home.home, {
    bucket: '--workspace-b--',
    sessionId: 'session-b1',
    projectPath: path.join(home.home, 'workspaces', 'proj-b'),
    title: 'ProjB',
    totals: { uncachedInputTokens: 10, outputTokens: 5, cacheReadTokens: 0, cacheWriteTokens: 0 },
  });
  await fsp.writeFile(path.join(workspaceRoot, 'README.md'), '# 教育公益无障碍开源项目\n', 'utf8');
  await fsp.writeFile(path.join(workspaceRoot, 'LICENSE'), 'MIT', 'utf8');
  await fsp.mkdir(path.join(workspaceRoot, 'docs'), { recursive: true });
  await fsp.mkdir(path.join(workspaceRoot, 'tests'), { recursive: true });
  await fsp.writeFile(path.join(workspaceRoot, 'app.js'), 'x', 'utf8');
  await fsp.writeFile(path.join(workspaceRoot, 'app.test.js'), 'x', 'utf8');
  await fsp.writeFile(
    path.join(home.home, 'storages', 'session_projcache', 'sessions', 'broken.json'),
    '{not json',
    'utf8',
  );

  const fakeSpeech = {
    listProviders: () => [{ id: 'fake-speech', label: 'Fake Speech', languages: ['zh', 'en'] }],
    resolve: (request) => ({ provider: { id: 'fake-speech' }, audio: request.audio, language: request.language }),
    transcribe: async () => ({ text: '语音转写结果', audioSeconds: 1.3 }),
  };
  const host = await applyHost({ speech: fakeSpeech });
  const state = host.route('/api/quick-note');
  const admin = host.route('/api/quick-note/admin');
  const usage = host.route('/api/quick-note/usage');
  const savings = host.route('/api/quick-note/savings');
  const savingsPolicy = host.route('/api/quick-note/savings-policy');
  const value = host.route('/api/quick-note/workspace-value');
  const auth = host.route('/api/quick-note/auth');
  const backupsRoute = host.route('/api/quick-note/backups');
  const harnessRoute = host.route('/api/quick-note/harness');
  const filesRoute = host.route('/api/quick-note/files');
  const clipRoute = host.route('/api/quick-note/clip');
  const markdownRoute = host.route('/api/quick-note/markdown');
  const voiceRoute = host.route('/api/quick-note/transcribe');
  const shareRoute = host.route('/api/quick-note/share');
  const remindersRoute = host.route('/api/quick-note/reminders');
  const cleanupRoute = host.route('/api/quick-note/cleanup');
  const optimizerReportRoute = host.route('/api/quick-note/optimizer-report');
  check('routes registered', Boolean(state && admin && usage && value && auth && backupsRoute && harnessRoute && filesRoute && clipRoute && markdownRoute && voiceRoute && shareRoute && remindersRoute && cleanupRoute && optimizerReportRoute));
  check('tools registered', host.tools.map((tool) => tool.name).join(',') === [
    'quick_note_search',
    'quick_note_create',
    'quick_note_complete',
    'quick_note_update',
    'quick_note_batch',
    'quick_note_type',
    'quick_note_workspace',
  ].join(','), host.tools.map((tool) => tool.name).join(','));

  // loopback read-token handshake and authorization
  const authRead = await request(auth.handler, 'GET', '/api/quick-note/auth');
  const readToken = authRead.json.token;
  const readHeaders = { 'x-quick-note-token': readToken };
  check('auth returns loopback token', authRead.status === 200 && typeof readToken === 'string' && readToken.length >= 32, String(authRead.status));
  check('auth rejects foreign origin', (await request(auth.handler, 'GET', '/api/quick-note/auth', undefined, { origin: 'https://evil.example' })).status === 403);
  check('auth accepts loopback origin', (await request(auth.handler, 'GET', '/api/quick-note/auth', undefined, { origin: 'http://127.0.0.1:57134' })).status === 200);
  check('read route requires token', (await request(admin.handler, 'GET', '/api/quick-note/admin')).status === 401);
  check('read route rejects wrong token', (await request(admin.handler, 'GET', '/api/quick-note/admin', undefined, { 'x-quick-note-token': 'wrong' })).status === 401);
  check('read route accepts token', (await request(admin.handler, 'GET', '/api/quick-note/admin', undefined, readHeaders)).status === 200);

  // 1. default document + hostile normalization
  let read = await request(state.handler, 'GET', '/api/quick-note/state');
  check('default settings normalized', read.json.settings.pricing.inputMiss === 2 && JSON.stringify(read.json.settings.workspaceNotes) === '{}');
  const hostile = await request(state.handler, 'PUT', '/api/quick-note/state', stateDoc({
    items: [
      { id: 't1', kind: 'task', title: '  task  ', tags: [' A ', '', 'B'], order: 'bad', due: 'bad', priority: 'ultra' },
      { id: 'x1', kind: 'nonsense', title: 'kept as note' },
      { id: '', kind: 'note' },
    ],
    settings: { brief: 'no', pricing: { inputHit: -1, inputMiss: 'x', output: 1e9 } },
    types: [
      { name: '客户', fields: [{ label: '姓名', type: 'text' }, { label: '', type: 'text' }], views: [{ name: '重点', query: '张三', sort: 'title' }, { name: '' }] },
      { name: '' },
    ],
  }));
  const t1 = hostile.json.items.find((item) => item.id === 't1');
  check('hostile item normalized', t1 !== undefined && t1.order === null && t1.priority === 'normal' && t1.due === null && t1.tags.join(',') === 'A,B');
  check('unknown kind becomes note', hostile.json.items.find((item) => item.id === 'x1').kind === 'note');
  check('invalid item dropped', hostile.json.items.length === 2);
  check('settings pricing clamped', hostile.json.settings.brief === true && hostile.json.settings.pricing.inputMiss === 2 && hostile.json.settings.pricing.output === 8);
  check('type fields/views normalized', hostile.json.types.length === 1 && hostile.json.types[0].fields.length === 1 && hostile.json.types[0].views.length === 1 && hostile.json.types[0].views[0].sort === 'title');

  // 2. route boundaries
  check('state unknown path 404', (await request(state.handler, 'GET', '/api/quick-note/state/x')).status === 404);
  for (const [label, route, endpoint] of [
    ['admin', admin, '/api/quick-note/admin'],
    ['usage', usage, '/api/quick-note/usage'],
    ['value', value, '/api/quick-note/workspace-value'],
  ]) {
    check(label + ' subpath 404', (await request(route.handler, 'GET', endpoint + '/x')).status === 404);
    check(label + ' rejects POST', (await request(route.handler, 'POST', endpoint)).status === 405);
  }
  check('state rejects bad PUT', (await request(state.handler, 'PUT', '/api/quick-note/state', { items: 'x' })).status === 400);

  // 2b. optimistic locking (If-Match / ETag)
  const etagRead = await request(state.handler, 'GET', '/api/quick-note/state');
  const revisionNow = etagRead.json.revision;
  check('state GET exposes ETag', etagRead.headers.ETag === '"' + revisionNow + '"', String(etagRead.headers.ETag));
  const matchWrite = await request(state.handler, 'PUT', '/api/quick-note/state', stateDoc({ items: [] }), { 'if-match': String(revisionNow) });
  check('matching If-Match accepted', matchWrite.status === 200 && matchWrite.json.revision === revisionNow + 1, String(matchWrite.status));
  const staleWrite = await request(state.handler, 'PUT', '/api/quick-note/state', stateDoc({ items: [] }), { 'if-match': String(revisionNow) });
  check('stale If-Match conflicts', staleWrite.status === 409 && staleWrite.json.error === 'revision conflict', String(staleWrite.status));
  check('conflict carries current document', staleWrite.json.revision === matchWrite.json.revision && Array.isArray(staleWrite.json.items), JSON.stringify(staleWrite.json.revision));
  const legacyWrite = await request(state.handler, 'PUT', '/api/quick-note/state', stateDoc({ items: [] }));
  check('PUT without If-Match is legacy-compatible', legacyWrite.status === 200);

  // 3. usage report: tokens + cost + missing cache
  await request(state.handler, 'PUT', '/api/quick-note/state', stateDoc({
    settings: { brief: true, pricing: { inputHit: 0.1, inputMiss: 3, output: 7 } },
  }));
  const usageRead = await request(usage.handler, 'GET', '/api/quick-note/usage', undefined, readHeaders);
  const rowA = usageRead.json.workspaces.find((row) => row.title === 'ProjA');
  check('usage tokens aggregated', rowA !== undefined && rowA.totalTokens === 3500000, JSON.stringify(rowA && rowA.totalTokens));
  const expectedCost = (1000000 * 3 + 2000000 * 0.1 + 500000 * 7) / 1000000;
  const expectedTotalCost = expectedCost + (10 * 3 + 5 * 7) / 1000000;
  check('usage row cost', Math.abs(rowA.cost - expectedCost) < 0.000001, String(rowA && rowA.cost));
  check('usage totals cost from raw sums', Math.abs(usageRead.json.totals.cost - expectedTotalCost) < 0.000001, String(usageRead.json.totals.cost));
  check('usage counts missing cache', usageRead.json.sessionsMissingUsage === 1, String(usageRead.json.sessionsMissingUsage));
  check('usage daily series', Array.isArray(usageRead.json.daily) && usageRead.json.daily.length === 14, String(usageRead.json.daily && usageRead.json.daily.length));
  check(
    'usage cache hit rate',
    typeof usageRead.json.totals.cacheHitRate === 'number' && usageRead.json.totals.cacheHitRate > 0.6 && usageRead.json.totals.cacheHitRate < 0.7,
    String(usageRead.json.totals.cacheHitRate),
  );
  check('usage top sessions', Array.isArray(usageRead.json.topSessions) && usageRead.json.topSessions.length >= 1, String(usageRead.json.topSessions && usageRead.json.topSessions.length));
  const savingsRead = await request(savings.handler, 'GET', '/api/quick-note/savings', undefined, readHeaders);
  check(
    'savings status route',
    savingsRead.status === 200 &&
      typeof savingsRead.json.compaction.enabled === 'boolean' &&
      typeof savingsRead.json.pruner.enabled === 'boolean' &&
      Array.isArray(savingsRead.json.sessions) &&
      typeof savingsRead.json.budgets.daily === 'number',
    JSON.stringify({ status: savingsRead.status, keys: savingsRead.json && Object.keys(savingsRead.json) }),
  );
  const policyWrite = await request(savingsPolicy.handler, 'POST', '/api/quick-note/savings-policy', { savingsMode: true, savingsGuard: true, thriftWorkspaces: ['D:\\ProjA'] }, readHeaders);
  check(
    'savings policy switch',
    policyWrite.status === 200 && policyWrite.json.ok === true && policyWrite.json.savings.mode === true,
    JSON.stringify({ status: policyWrite.status, body: policyWrite.json }),
  );
  const policyDoc = await request(state.handler, 'GET', '/api/quick-note/state', undefined, readHeaders);
  check(
    'savings policy persisted',
    policyDoc.json.settings.savingsMode === true &&
      policyDoc.json.settings.savingsGuard === true &&
      policyDoc.json.settings.thriftWorkspaces.length === 1 &&
      policyDoc.json.settings.thriftWorkspaces[0] === 'D:\\ProjA',
  );
  const preGuardState = await request(state.handler, 'GET', '/api/quick-note/state', undefined, readHeaders);
  const budgetPut = await request(state.handler, 'PUT', '/api/quick-note/state', stateDoc({
    items: preGuardState.json.items,
    settings: { ...preGuardState.json.settings, tokenBudget: 0.01, savingsGuard: true, savingsMode: false },
    reviews: preGuardState.json.reviews,
    types: preGuardState.json.types,
  }), {
    ...readHeaders,
    'if-match': String(preGuardState.json.revision),
  });
  const savingsBudgetState = await request(state.handler, 'GET', '/api/quick-note/state', undefined, readHeaders);
  const guardcheck = await request(savingsPolicy.handler, 'POST', '/api/quick-note/savings-policy', { action: 'evaluate' }, readHeaders);
  check(
    'budget guard activates savings mode',
    guardcheck.status === 200 && guardcheck.json.budget !== null && guardcheck.json.budget.over === true && guardcheck.json.savings.mode === true,
    JSON.stringify({ put: budgetPut.status, budget: savingsBudgetState.json.settings.tokenBudget, guard: guardcheck.json }),
  );
  check(
    'usage efficiency score',
    usageRead.json.efficiency !== undefined &&
      typeof usageRead.json.efficiency.score === 'number' &&
      usageRead.json.efficiency.score >= 0 &&
      usageRead.json.efficiency.score <= 100 &&
      typeof usageRead.json.efficiency.cacheSaving === 'number',
    JSON.stringify(usageRead.json.efficiency && { score: usageRead.json.efficiency.score, saving: usageRead.json.efficiency.cacheSaving }),
  );
  check(
    'usage efficiency recommendations',
    Array.isArray(usageRead.json.efficiency.recommendations) && usageRead.json.efficiency.recommendations.length >= 1,
    String(usageRead.json.efficiency.recommendations && usageRead.json.efficiency.recommendations.length),
  );

  // 4. value report: scores, social value, assessments, cache + invalidation
  const first = await request(value.handler, 'GET', '/api/quick-note/workspace-value', undefined, readHeaders);
  const cached = await request(value.handler, 'GET', '/api/quick-note/workspace-value', undefined, readHeaders);
  check('value cache hit', cached.json.generatedAt === first.json.generatedAt);
  const valueA = first.json.workspaces.find((row) => row.title === 'ProjA');
  check('value row scores', valueA.valueScore > 0 && /^[A-D]$/.test(valueA.grade) && valueA.stage !== 'unknown');
  check('value tokens and cost', valueA.totalTokens === 3500000 && Math.abs(valueA.cost - expectedCost) < 0.000001);
  check('value social signals', valueA.socialSignals.readme === true && valueA.socialSignals.license === true && valueA.socialSignals.tests === true);
  check('value social domains', valueA.socialDomains.includes('教育') && valueA.socialDomains.includes('公益'), JSON.stringify(valueA.socialDomains));
  check(
    'social breakdown dimensions',
    Array.isArray(valueA.socialBreakdown) &&
      valueA.socialBreakdown.length === 6 &&
      valueA.socialBreakdown.every((dimension) => typeof dimension.key === 'string' && typeof dimension.score === 'number' && typeof dimension.max === 'number'),
  );
  check(
    'social strengths/gaps/suggestions',
    Array.isArray(valueA.socialStrengths) && Array.isArray(valueA.socialGaps) && Array.isArray(valueA.socialSuggestions),
    JSON.stringify(valueA.socialSuggestions),
  );
  const valueB = first.json.workspaces.find((row) => row.title === 'ProjB');
  check(
    'weak workspace gets suggestions',
    valueB !== undefined && Array.isArray(valueB.socialSuggestions) && valueB.socialSuggestions.length > 0,
    JSON.stringify(valueB && valueB.socialSuggestions),
  );
  await request(state.handler, 'PUT', '/api/quick-note/state', stateDoc({
    settings: {
      brief: true,
      pricing: { inputHit: 0.1, inputMiss: 3, output: 7 },
      workspaceNotes: { [workspaceRoot]: { note: '主项目', rating: 'high', socialNote: '教育价值', socialRating: 'medium' } },
    },
  }));
  const afterWrite = await request(value.handler, 'GET', '/api/quick-note/workspace-value', undefined, readHeaders);
  const afterA = afterWrite.json.workspaces.find((row) => row.title === 'ProjA');
  check('value cache invalidated on write', afterWrite.json.generatedAt !== first.json.generatedAt);
  check('value assessment visible', afterA.note === '主项目' && afterA.rating === 'high' && afterA.socialNote === '教育价值');

  // 5. agent tools: notes/records/types/workspace
  const search = host.tool('quick_note_search');
  const searchItemSchema = search.output.schema.properties.items.items;
  check(
    'search output schema declares health intakes',
    searchItemSchema.properties.health.properties.intakes !== undefined &&
      searchItemSchema.properties.health.required.includes('intakes'),
    JSON.stringify(searchItemSchema.properties.health.required),
  );
  const create = host.tool('quick_note_create');
  const update = host.tool('quick_note_update');
  const complete = host.tool('quick_note_complete');
  const typeTool = host.tool('quick_note_type');
  const workspaceTool = host.tool('quick_note_workspace');

  const note = await create.execute({ kind: 'note', title: 'note-a', body: 'body' });
  const task = await create.execute({ kind: 'task', title: 'task-a', due: new Date().toISOString() });
  check('create tools', note.item.kind === 'note' && task.item.kind === 'task');
  await update.execute({ id: note.item.id, title: 'note-a2', tags: ['x'] });
  const completed = await complete.execute({ id: task.item.id, status: 'done' });
  check('update/complete tools', completed.item.status === 'done');
  const afterToolsRead = await request(state.handler, 'GET', '/api/quick-note/state');
  const noteRow = afterToolsRead.json.items.find((item) => item.id === note.item.id);
  const taskRow = afterToolsRead.json.items.find((item) => item.id === task.item.id);
  check('item rev bumps on edit', noteRow !== undefined && noteRow.rev >= 1, noteRow && String(noteRow.rev));
  check('item rev present on create', taskRow !== undefined && typeof taskRow.rev === 'number' && taskRow.rev >= 0);
  check('item deletion tombstone defaults null', noteRow !== undefined && noteRow.deletedAt === null);
  const found = await search.execute({ query: 'note-a2' });
  check('search tool finds updated note', found.items.length === 1 && found.items[0].tags[0] === 'x');
  const createdType = await typeTool.execute({ action: 'create', name: '设备', fields: [{ label: '名称', type: 'text' }], views: [{ name: '全部', sort: 'title' }] });
  const record = await create.execute({ kind: 'record', recordTypeId: createdType.type.id, recordValues: { f1: '打印机' } });
  check('type tool creates record item', record.item.kind === 'record' && record.item.record.typeId === createdType.type.id);
  const listed = await typeTool.execute({ action: 'list' });
  const listedDevice = listed.types.find((type) => type.name === '设备');
  check('type tool lists views', listed.types.length === 1 && listedDevice !== undefined && listedDevice.views.length === 1);
  const removedType = await typeTool.execute({ action: 'delete', id: createdType.type.id });
  check('type delete cascades records', removedType.removedRecords === 1);
  const cascadeDoc = await request(state.handler, 'GET', '/api/quick-note/state');
  const cascadedRecord = cascadeDoc.json.items.find((item) => item.record.typeId === createdType.type.id);
  check('type delete soft-deletes records', cascadedRecord !== undefined && typeof cascadedRecord.deletedAt === 'number');

  // soft delete: hidden from search, rejected for update/complete unless restored
  const softTarget = await create.execute({ kind: 'note', title: 'soft-delete-target', body: 'soft body' });
  const softDoc = await request(state.handler, 'GET', '/api/quick-note/state');
  const tombstoned = softDoc.json.items.map((item) => (item.id === softTarget.item.id ? { ...item, deletedAt: Date.now(), updatedAt: Date.now() + 1 } : item));
  await request(state.handler, 'PUT', '/api/quick-note/state', stateDoc({ items: tombstoned, settings: softDoc.json.settings, reviews: softDoc.json.reviews, types: softDoc.json.types }));
  const persistDoc = await request(state.handler, 'GET', '/api/quick-note/state');
  const tombstone = persistDoc.json.items.find((item) => item.id === softTarget.item.id);
  check('soft delete tombstone persisted', tombstone !== undefined && typeof tombstone.deletedAt === 'number' && tombstone.rev >= 1);
  const hiddenSearch = await search.execute({ query: 'soft-delete-target' });
  check('search hides soft-deleted', hiddenSearch.items.length === 0);
  const allSearch = await search.execute({ query: 'soft-delete-target', includeDeleted: true });
  check('search includeDeleted finds tombstone', allSearch.items.length === 1);
  let updateRejected = false;
  try {
    await update.execute({ id: softTarget.item.id, title: 'should fail' });
  } catch (error) {
    updateRejected = true;
  }
  check('update rejects soft-deleted item', updateRejected);
  const restored = await update.execute({ id: softTarget.item.id, title: 'restored', restore: true });
  check('update restore clears tombstone', restored.item.deletedAt === null && restored.item.title === 'restored');
  const deletedTask = await create.execute({ kind: 'task', title: 'deleted-task' });
  const taskDoc = await request(state.handler, 'GET', '/api/quick-note/state');
  const tombstonesForTask = taskDoc.json.items.map((item) => (item.id === deletedTask.item.id ? { ...item, deletedAt: Date.now(), updatedAt: Date.now() } : item));
  await request(state.handler, 'PUT', '/api/quick-note/state', stateDoc({ items: tombstonesForTask, settings: taskDoc.json.settings, reviews: taskDoc.json.reviews, types: taskDoc.json.types }));
  let completeRejected = false;
  try {
    await complete.execute({ id: deletedTask.item.id, status: 'done' });
  } catch (error) {
    completeRejected = true;
  }
  check('complete rejects soft-deleted task', completeRejected);

  // checklist, repeat schedules, repeat spawning
  const repeatTask = await create.execute({ kind: 'task', title: 'daily-standup', checklist: ['sync', 'plan'], repeat: 'daily' });
  check('create task checklist', repeatTask.item.checklist.length === 2 && repeatTask.item.repeat === 'daily');
  const updatedRepeat = await update.execute({ id: repeatTask.item.id, repeat: 'weekly', checklist: ['only'] });
  check('update repeat schedule', updatedRepeat.item.repeat === 'weekly' && updatedRepeat.item.checklist.length === 1);
  await complete.execute({ id: repeatTask.item.id, status: 'done' });
  const repeatDoc = await request(state.handler, 'GET', '/api/quick-note/state');
  const spawnedTask = repeatDoc.json.items.find((item) => item.kind === 'task' && item.title === 'daily-standup' && item.status === 'open' && item.id !== repeatTask.item.id);
  check(
    'repeating task spawns next occurrence',
    spawnedTask !== undefined && spawnedTask.repeat === 'weekly' && spawnedTask.checklist.every((row) => row.done === false),
  );

  // batch tool + search filters
  const batch = host.tool('quick_note_batch');
  const batchA = await create.execute({ kind: 'note', title: 'batch-a' });
  const batchB = await create.execute({ kind: 'note', title: 'batch-b' });
  const batchTagged = await batch.execute({ action: 'tags', ids: [batchA.item.id, batchB.item.id], tags: ['bulk', 'urgent'] });
  check('batch tags', batchTagged.count === 2 && batchTagged.items.every((item) => item.tags.includes('bulk')));
  await batch.execute({ action: 'delete', ids: [batchA.item.id] });
  const batchDoc = await request(state.handler, 'GET', '/api/quick-note/state');
  check('batch soft delete', batchDoc.json.items.find((item) => item.id === batchA.item.id).deletedAt !== null);
  await create.execute({ kind: 'task', title: 'overdue-one', due: new Date(Date.now() - 86400000).toISOString() });
  const overdueSearch = await search.execute({ overdue: true, includeDone: true });
  check('search overdue filter', overdueSearch.items.some((item) => item.title === 'overdue-one'));
  const tagSearch = await search.execute({ tag: 'urgent' });
  check('search tag filter', tagSearch.items.length === 1 && tagSearch.items[0].title === 'batch-b');

  const reportText = await workspaceTool.execute({ action: 'report' });
  check('workspace report markdown', typeof reportText.report === 'string' && reportText.report.startsWith('# 工作区价值报告'));
  const archived = await workspaceTool.execute({ action: 'archive' });
  check('workspace archive creates note', archived.item.kind === 'note' && archived.item.tags.join(',') === '工作区,价值报告');
  const rated = await workspaceTool.execute({ action: 'rate', path: workspaceRoot, rating: 'high', socialRating: 'low' });
  check('workspace rate saves', rated.saved.rating === 'high' && rated.saved.socialRating === 'low');
  const snapshot = await workspaceTool.execute({ action: 'snapshot' });
  check('workspace snapshot writes history', snapshot.saved.snapshots >= 2);

  // 6. daily brief (pure function with a synthetic open task and medication)
  const dueTask = {
    id: 't-due',
    kind: 'task',
    title: 'today-task',
    body: '',
    tags: [],
    status: 'open',
    priority: 'normal',
    due: Date.now() + 3600000,
    doneAt: null,
    review: { ease: 2.5, intervalDays: 0, repetitions: 0, dueAt: null, lastAt: null },
    health: { value: null, value2: null, unit: '', times: [], active: true, at: null },
    record: { typeId: '', values: {} },
    order: null,
    createdAt: 1,
    updatedAt: 2,
    rev: 0,
    deletedAt: null,
  };
  const dueMed = {
    ...dueTask,
    id: 'm-1',
    kind: 'med',
    title: 'Drug A',
    health: { value: null, value2: null, unit: '', times: ['08:00'], active: true, at: null },
  };
  const dueCard = {
    ...dueTask,
    id: 'c-due',
    kind: 'card',
    title: 'card-due',
    review: { ease: 2.5, intervalDays: 1, repetitions: 1, dueAt: Date.now() - 1000, lastAt: 1 },
  };
  const brief = host.module.buildDailyBrief({ settings: { brief: true }, items: [dueTask, dueMed, dueCard], revision: 1 });
  check(
    'daily brief text',
    brief.startsWith('管理台今日待办') && brief.includes('today-task') && brief.includes('今日用药') && brief.includes('待复习'),
    brief.split('\n')[0],
  );
  const deletedDue = { ...dueTask, deletedAt: Date.now() };
  const deletedBrief = host.module.buildDailyBrief({ settings: { brief: true }, items: [deletedDue], revision: 1 });
  check('daily brief hides soft-deleted', deletedBrief === '', deletedBrief.slice(0, 80));
  const disabled = host.module.buildDailyBrief({ settings: { brief: false }, items: [], revision: 1 });
  check('daily brief disabled', disabled === '');

  // 6b. human slash commands: create/search/plan/review over the same store
  check(
    'slash commands registered',
    host.commands.map((command) => command.name).join(',') === 'note,capture,clip,task,search,plan,review',
    host.commands.map((command) => command.name).join(','),
  );
  const runCommand = (name, rawInput) =>
    host.command(name).handler({ commandId: 'cmd', agent: { id: 'agent' }, rawInput, attachments: [], signal: new AbortController().signal });
  const noteCommand = await runCommand('note', '买菜清单\n牛奶、鸡蛋');
  check('note command creates note', noteCommand.kind === 'success' && noteCommand.text.includes('已保存笔记'), JSON.stringify(noteCommand));
  const taskCommand = await runCommand('task', '交周报 --due 2026-11-06 --priority high --tag 工作');
  check('task command parses flags', taskCommand.kind === 'success' && taskCommand.text.includes('截止'), JSON.stringify(taskCommand));
  const searchCommand = await runCommand('search', '周报');
  check('search command finds task', searchCommand.kind === 'success' && searchCommand.text.includes('交周报'), JSON.stringify(searchCommand));
  const planCommand = await runCommand('plan', '');
  check('plan command summarizes', planCommand.kind === 'success' && planCommand.text.includes('未来 7 天'), JSON.stringify(planCommand));
  const reviewCommand = await runCommand('review', '');
  check('review command runs', reviewCommand.kind === 'success' && reviewCommand.text.includes('今日待复习'), JSON.stringify(reviewCommand));
  const captureCommand = await runCommand('capture', '来自对话的片段');
  check('capture command creates note', captureCommand.kind === 'success', JSON.stringify(captureCommand));
  const fetchBeforeClip = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (String(url).indexOf('clip.test') >= 0) {
      return {
        ok: true,
        status: 200,
        headers: new Map(),
        text: async () =>
          '<html><head><title>剪藏标题</title><meta name="description" content="剪藏描述"></head><body><p>正文内容</p></body></html>',
      };
    }
    return fetchBeforeClip(url);
  };
  try {
    const clipCommand = await runCommand('clip', 'https://clip.test/article');
    check('clip command creates note', clipCommand.kind === 'success', JSON.stringify(clipCommand));
    const clipState = await request(state.handler, 'GET', '/api/quick-note/state');
    const clipNote = clipState.json.items.find((item) => item.tags.includes('剪藏'));
    check(
      'clip note keeps source and metadata',
      clipNote !== undefined && clipNote.title === '剪藏标题' && clipNote.body.includes('来源：https://clip.test/article') && clipNote.body.includes('剪藏描述'),
      JSON.stringify(clipNote && { title: clipNote.title, body: clipNote.body.slice(0, 120) }),
    );
    check('clip route requires token', (await request(clipRoute.handler, 'POST', '/api/quick-note/clip', { url: 'https://clip.test/article' })).status === 401);
    const clipRouteResponse = await request(clipRoute.handler, 'POST', '/api/quick-note/clip', { url: 'https://clip.test/article' }, readHeaders);
    check('clip route returns clip data', clipRouteResponse.status === 200 && clipRouteResponse.json.clip.title === '剪藏标题', String(clipRouteResponse.status));
  } finally {
    globalThis.fetch = fetchBeforeClip;
  }
  const commandState = await request(state.handler, 'GET', '/api/quick-note/state');
  const commandTask = commandState.json.items.find((item) => item.title === '交周报');
  check(
    'task command persisted due/priority/tags',
    commandTask !== undefined && commandTask.due !== null && commandTask.priority === 'high' && commandTask.tags.includes('工作'),
    JSON.stringify(commandTask && { due: commandTask.due, priority: commandTask.priority, tags: commandTask.tags }),
  );

  // 7. rolling backups: token guard, list, manual create, restore read
  check('backups requires token', (await request(backupsRoute.handler, 'GET', '/api/quick-note/backups')).status === 401);
  const backupList = await request(backupsRoute.handler, 'GET', '/api/quick-note/backups', undefined, readHeaders);
  check('backups listed after writes', backupList.status === 200 && Array.isArray(backupList.json.backups) && backupList.json.backups.length >= 1, String(backupList.json.backups && backupList.json.backups.length));
  const createdBackup = await request(backupsRoute.handler, 'POST', '/api/quick-note/backups', undefined, readHeaders);
  check('backup create returns name', createdBackup.status === 200 && /^items-\d{8}-\d{6}\.json$/.test(createdBackup.json.backup.name), JSON.stringify(createdBackup.json.backup && createdBackup.json.backup.name));
  const backupRead = await request(
    backupsRoute.handler,
    'GET',
    '/api/quick-note/backups?name=' + encodeURIComponent(createdBackup.json.backup.name),
    undefined,
    readHeaders,
  );
  check('backup document readable', backupRead.status === 200 && Array.isArray(backupRead.json.document.items));
  const backupDiff = await request(
    backupsRoute.handler,
    'GET',
    '/api/quick-note/backups?diff=' + encodeURIComponent(createdBackup.json.backup.name),
    undefined,
    readHeaders,
  );
  check(
    'backup diff preview',
    backupDiff.status === 200 &&
      backupDiff.json.current !== undefined &&
      backupDiff.json.backup !== undefined &&
      typeof backupDiff.json.added === 'number' &&
      typeof backupDiff.json.removed === 'number' &&
      typeof backupDiff.json.changed === 'number' &&
      typeof backupDiff.json.settingsChanged === 'boolean',
    JSON.stringify(backupDiff.json),
  );
  const cappedList = await request(backupsRoute.handler, 'GET', '/api/quick-note/backups', undefined, readHeaders);
  check('backups capped at limit', cappedList.json.backups.length <= 10, String(cappedList.json.backups.length));

  // 9. Harness version manager: info, feed check, download verification, gated install/restart
  check('harness requires token', (await request(harnessRoute.handler, 'GET', '/api/quick-note/harness')).status === 401);
  const harnessInfo = await request(harnessRoute.handler, 'GET', '/api/quick-note/harness', undefined, readHeaders);
  check(
    'harness info shape',
    harnessInfo.status === 200 && harnessInfo.json.current !== undefined && typeof harnessInfo.json.current.execPath === 'string' && harnessInfo.json.autoUpdate === false,
  );
  const noFeedCheck = await request(harnessRoute.handler, 'POST', '/api/quick-note/harness', { action: 'check' }, readHeaders);
  check('harness check without feed fails', noFeedCheck.status === 400, String(noFeedCheck.status));
  const harnessDoc = (await request(state.handler, 'GET', '/api/quick-note/state')).json;
  await request(state.handler, 'PUT', '/api/quick-note/state', stateDoc({
    items: harnessDoc.items,
    settings: { ...harnessDoc.settings, harnessFeedUrl: 'https://feed.test/latest.json', harnessAutoUpdate: false },
    reviews: harnessDoc.reviews,
    types: harnessDoc.types,
  }));
  const stubFetch = globalThis.fetch;
  const stubState = { sha: null, url: 'https://feed.test/setup.exe' };
  globalThis.fetch = async (url, options) => {
    if (String(url).indexOf('download.deepseek.com') >= 0) {
      const method = options && options.method ? options.method : 'GET';
      const payload = Buffer.from('fake-official-installer');
      if (method === 'HEAD') {
        return {
          ok: true,
          status: 200,
          headers: new Map([
            ['content-length', String(payload.length)],
            ['last-modified', 'Fri, 30 Oct 2026 03:57:58 GMT'],
          ]),
          text: async () => '',
        };
      }
      return {
        ok: true,
        status: 200,
        headers: new Map([['content-length', String(payload.length)]]),
        arrayBuffer: async () => payload,
      };
    }
    if (String(url).indexOf('custom.test') >= 0) {
      const payload = Buffer.from('fake-custom-installer');
      return {
        ok: true,
        status: 200,
        headers: new Map([['content-length', String(payload.length)]]),
        arrayBuffer: async () => payload,
      };
    }
    if (String(url).indexOf('api.github.com') >= 0) {
      return {
        ok: true,
        status: 200,
        headers: new Map(),
        text: async () =>
          JSON.stringify([
            {
              tag_name: 'dsh-v99.0.0',
              body: 'github release notes',
              published_at: '2026-11-05T00:00:00Z',
              html_url: 'https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v99.0.0',
              draft: false,
              prerelease: false,
              assets: [],
            },
            {
              tag_name: 'dsh-v98.0.0-rc.1',
              body: 'prerelease notes',
              published_at: '2026-11-01T00:00:00Z',
              html_url: 'https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v98.0.0-rc.1',
              draft: false,
              prerelease: true,
              assets: [],
            },
          ]),
      };
    }
    if (String(url).indexOf('latest.json') >= 0) {
      return {
        ok: true,
        status: 200,
        headers: new Map(),
        text: async () =>
          JSON.stringify({ version: '99.0.0', url: stubState.url, sha256: stubState.sha, notes: 'test release', publishedAt: '2026-11-05' }),
      };
    }
    if (String(url).indexOf('setup.') >= 0) {
      const payload = Buffer.from('fake-installer-payload');
      return {
        ok: true,
        status: 200,
        headers: new Map([['content-length', String(payload.length)]]),
        arrayBuffer: async () => payload,
      };
    }
    return { ok: false, status: 404, headers: new Map(), text: async () => 'missing' };
  };
  try {
    const checked = await request(harnessRoute.handler, 'POST', '/api/quick-note/harness', { action: 'check' }, readHeaders);
    check(
      'harness check finds update',
      checked.status === 200 && checked.json.manifest.version === '99.0.0' && checked.json.updateAvailable === true,
      JSON.stringify(checked.json && checked.json.manifest && checked.json.manifest.version),
    );
    const downloaded = await request(harnessRoute.handler, 'POST', '/api/quick-note/harness', { action: 'download' }, readHeaders);
    check(
      'harness download staged',
      downloaded.status === 200 && downloaded.json.staged.version === '99.0.0' && downloaded.json.staged.size > 0 && downloaded.json.staged.verified === false,
      JSON.stringify(downloaded.json && downloaded.json.staged),
    );
    const installBlocked = await request(harnessRoute.handler, 'POST', '/api/quick-note/harness', { action: 'install', confirm: '99.0.0' }, readHeaders);
    check('harness install gated by auto-update', installBlocked.status === 403, String(installBlocked.status));
    const restartBlocked = await request(harnessRoute.handler, 'POST', '/api/quick-note/harness', { action: 'restart', confirm: 'restart' }, readHeaders);
    check('harness restart gated by auto-update', restartBlocked.status === 403, String(restartBlocked.status));
    const autoCheckSaved = await request(
      harnessRoute.handler,
      'POST',
      '/api/quick-note/harness',
      { action: 'save-settings', feedUrl: 'https://feed.test/latest.json', autoUpdate: false, autoCheck: true },
      readHeaders,
    );
    check('harness auto-check setting saved', autoCheckSaved.status === 200 && autoCheckSaved.json.autoCheck === true);
    const infoAfterAutoCheck = await request(harnessRoute.handler, 'GET', '/api/quick-note/harness', undefined, readHeaders);
    check('harness info exposes auto-check', infoAfterAutoCheck.json.autoCheck === true);
    const githubFeed = 'https://api.github.com/repos/deepseek-ai/deepseek-harness/releases?per_page=5';
    await request(
      harnessRoute.handler,
      'POST',
      '/api/quick-note/harness',
      { action: 'save-settings', feedUrl: githubFeed, autoUpdate: false, autoCheck: false },
      readHeaders,
    );
    const githubCheck = await request(harnessRoute.handler, 'POST', '/api/quick-note/harness', { action: 'check' }, readHeaders);
    check(
      'harness github feed parsed',
      githubCheck.status === 200 &&
        githubCheck.json.manifest.version === '99.0.0' &&
        githubCheck.json.manifest.source === 'github' &&
        githubCheck.json.manifest.downloadAvailable === false &&
        String(githubCheck.json.manifest.releaseUrl).indexOf('/releases/tag/') >= 0,
      JSON.stringify(githubCheck.json && githubCheck.json.manifest),
    );
    const githubDownload = await request(harnessRoute.handler, 'POST', '/api/quick-note/harness', { action: 'download' }, readHeaders);
    check(
      'harness github without assets cannot download',
      githubDownload.status === 422 && typeof githubDownload.json.downloadPage === 'string' && githubDownload.json.downloadPage.indexOf('deepseek.com/download') >= 0,
      JSON.stringify(githubDownload.json),
    );
    await request(
      harnessRoute.handler,
      'POST',
      '/api/quick-note/harness',
      { action: 'save-settings', feedUrl: 'official:direct', autoUpdate: false, autoCheck: true },
      readHeaders,
    );
    const directCheck = await request(harnessRoute.handler, 'POST', '/api/quick-note/harness', { action: 'check' }, readHeaders);
    check(
      'harness official direct check',
      directCheck.status === 200 &&
        directCheck.json.manifest.source === 'official-direct' &&
        directCheck.json.manifest.version === null &&
        directCheck.json.manifest.downloadAvailable === true &&
        String(directCheck.json.manifest.url).indexOf('download.deepseek.com') >= 0 &&
        typeof directCheck.json.manifest.lastModified === 'number',
      JSON.stringify(directCheck.json && directCheck.json.manifest),
    );
    const directDownload = await request(harnessRoute.handler, 'POST', '/api/quick-note/harness', { action: 'download' }, readHeaders);
    check(
      'harness official direct staged',
      directDownload.status === 200 &&
        directDownload.json.staged.official === true &&
        directDownload.json.staged.version === 'latest' &&
        directDownload.json.staged.verified === false &&
        /^[0-9a-f]{64}$/.test(directDownload.json.staged.sha256) &&
        directDownload.json.staged.size > 0,
      JSON.stringify(directDownload.json && directDownload.json.staged),
    );
    const directWrongHash = await request(
      harnessRoute.handler,
      'POST',
      '/api/quick-note/harness',
      { action: 'install', confirm: 'latest', approved: true, acknowledgedHash: '0'.repeat(64) },
      readHeaders,
    );
    check('harness official direct approval needs matching hash', directWrongHash.status === 403, String(directWrongHash.status));
    const releasesResponse = await request(harnessRoute.handler, 'POST', '/api/quick-note/harness', { action: 'releases' }, readHeaders);
    check(
      'harness release list',
      releasesResponse.status === 200 &&
        Array.isArray(releasesResponse.json.releases) &&
        releasesResponse.json.releases.length >= 2 &&
        releasesResponse.json.releases[0].version === '99.0.0' &&
        releasesResponse.json.releases.some((release) => release.prerelease === true),
      JSON.stringify(releasesResponse.json && releasesResponse.json.releases && releasesResponse.json.releases.map((entry) => entry.version)),
    );
    const versionCheck = await request(harnessRoute.handler, 'POST', '/api/quick-note/harness', { action: 'check', version: '98.0.0-rc.1' }, readHeaders);
    check(
      'harness specific release check',
      versionCheck.status === 200 && versionCheck.json.manifest.version === '98.0.0-rc.1' && versionCheck.json.manifest.prerelease === true,
      JSON.stringify(versionCheck.json && versionCheck.json.manifest && versionCheck.json.manifest.version),
    );
    const versionDownload = await request(harnessRoute.handler, 'POST', '/api/quick-note/harness', { action: 'download', version: '99.0.0' }, readHeaders);
    check('harness release without asset cannot download', versionDownload.status === 422, String(versionDownload.status));
    const customDownload = await request(
      harnessRoute.handler,
      'POST',
      '/api/quick-note/harness',
      { action: 'download-direct', url: 'https://custom.test/setup.bin' },
      readHeaders,
    );
    check(
      'harness custom installer staged',
      customDownload.status === 200 &&
        customDownload.json.staged.source === 'custom' &&
        customDownload.json.staged.version === 'custom' &&
        /^[0-9a-f]{64}$/.test(customDownload.json.staged.sha256),
      JSON.stringify(customDownload.json && customDownload.json.staged),
    );
    const customWrongHash = await request(
      harnessRoute.handler,
      'POST',
      '/api/quick-note/harness',
      { action: 'install', confirm: 'custom', approved: true, acknowledgedHash: '0'.repeat(64) },
      readHeaders,
    );
    check('harness custom approval needs matching hash', customWrongHash.status === 403, String(customWrongHash.status));
    const customApproved = await request(
      harnessRoute.handler,
      'POST',
      '/api/quick-note/harness',
      { action: 'install', confirm: 'custom', approved: true, acknowledgedHash: customDownload.json.staged.sha256 },
      readHeaders,
    );
    check('harness custom approval passes gate', customApproved.status === 415, String(customApproved.status));
    await request(
      harnessRoute.handler,
      'POST',
      '/api/quick-note/harness',
      { action: 'save-settings', feedUrl: 'https://feed.test/latest.json', autoUpdate: false, autoCheck: true },
      readHeaders,
    );
    await request(harnessRoute.handler, 'POST', '/api/quick-note/harness', { action: 'download' }, readHeaders);
    const approvalUnverified = await request(
      harnessRoute.handler,
      'POST',
      '/api/quick-note/harness',
      { action: 'install', confirm: '99.0.0', approved: true },
      readHeaders,
    );
    check('harness approval needs verified hash', approvalUnverified.status === 403, String(approvalUnverified.status));
    stubState.sha = createHash('sha256').update(Buffer.from('fake-installer-payload')).digest('hex');
    stubState.url = 'https://feed.test/setup.bin';
    const verifiedDownload = await request(harnessRoute.handler, 'POST', '/api/quick-note/harness', { action: 'download' }, readHeaders);
    check(
      'harness verified download',
      verifiedDownload.status === 200 && verifiedDownload.json.staged.verified === true,
      JSON.stringify(verifiedDownload.json && verifiedDownload.json.staged && verifiedDownload.json.staged.verified),
    );
    const approvedInstall = await request(
      harnessRoute.handler,
      'POST',
      '/api/quick-note/harness',
      { action: 'install', confirm: '99.0.0', approved: true },
      readHeaders,
    );
    check('harness approval bypasses switch for verified file', approvedInstall.status === 415, String(approvedInstall.status));
    await request(state.handler, 'PUT', '/api/quick-note/state', stateDoc({
      items: harnessDoc.items,
      settings: { ...harnessDoc.settings, harnessFeedUrl: 'https://feed.test/latest.json', harnessAutoUpdate: true },
      reviews: harnessDoc.reviews,
      types: harnessDoc.types,
    }));
    const installWrongConfirm = await request(harnessRoute.handler, 'POST', '/api/quick-note/harness', { action: 'install', confirm: '1.0.0' }, readHeaders);
    check('harness install needs version confirm', installWrongConfirm.status === 409, String(installWrongConfirm.status));
    await request(state.handler, 'PUT', '/api/quick-note/state', stateDoc({
      items: harnessDoc.items,
      settings: { ...harnessDoc.settings, harnessFeedUrl: '', harnessAutoUpdate: false, harnessAutoCheck: false },
      reviews: harnessDoc.reviews,
      types: harnessDoc.types,
    }));
  } finally {
    globalThis.fetch = stubFetch;
  }

  // 9b. attachments: upload, token-protected serve, type limits
  check('files upload requires token', (await request(filesRoute.handler, 'POST', '/api/quick-note/files', Buffer.from('x'), { 'content-type': 'image/png' })).status === 401);
  const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
  const uploadResponse = await request(filesRoute.handler, 'POST', '/api/quick-note/files', pngBytes, {
    ...readHeaders,
    'content-type': 'image/png',
    'x-file-name': encodeURIComponent('测试图.png'),
  });
  const attachment = uploadResponse.json && uploadResponse.json.attachment;
  check(
    'attachment uploaded',
    uploadResponse.status === 200 && attachment !== undefined && attachment.mediaType === 'image/png' && /\.png$/.test(attachment.id) && attachment.size === 4,
    JSON.stringify(uploadResponse.json),
  );
  const fileRead = await request(filesRoute.handler, 'GET', '/api/quick-note/files/' + (attachment && attachment.id) + '?token=' + readToken);
  check('attachment served with token query', fileRead.status === 200 && fileRead.headers['content-type'] === 'image/png' && fileRead.buffer.equals(pngBytes), String(fileRead.status));
  const fileReadNoToken = await request(filesRoute.handler, 'GET', '/api/quick-note/files/' + (attachment && attachment.id));
  check('attachment read requires token', fileReadNoToken.status === 401, String(fileReadNoToken.status));
  const badType = await request(filesRoute.handler, 'POST', '/api/quick-note/files', Buffer.from('x'), { ...readHeaders, 'content-type': 'application/x-msdownload' });
  check('attachment type limited', badType.status === 415, String(badType.status));

  // 9c. incremental state polling: only items newer than the watermark
  const fullBefore = await request(state.handler, 'GET', '/api/quick-note/state');
  const watermarkBefore = fullBefore.json.watermark;
  await new Promise((resolve) => setTimeout(resolve, 5));
  await request(state.handler, 'PUT', '/api/quick-note/state', stateDoc({
    items: [...fullBefore.json.items, { id: 'delta-note', kind: 'note', title: 'delta' }],
    settings: fullBefore.json.settings,
    reviews: fullBefore.json.reviews,
    types: fullBefore.json.types,
  }));
  const deltaRead = await request(state.handler, 'GET', '/api/quick-note/state?since=' + watermarkBefore);
  check(
    'state delta returns only changed item',
    deltaRead.json.delta === true &&
      Array.isArray(deltaRead.json.items) &&
      deltaRead.json.items.some((item) => item.id === 'delta-note') &&
      deltaRead.json.items.every((item) => item.id === 'delta-note'),
    JSON.stringify(deltaRead.json && deltaRead.json.items && deltaRead.json.items.map((item) => item.id)),
  );

  // 9d. PATCH write path: minimal upsert with If-Match, conflict, tombstone
  const patchBase = await request(state.handler, 'GET', '/api/quick-note/state');
  const patchWrite = await request(state.handler, 'PATCH', '/api/quick-note/state', { upserts: [{ id: 'patch-note', kind: 'note', title: 'patch' }] }, { ...readHeaders, 'if-match': String(patchBase.json.revision) });
  check('state patch upserts item', patchWrite.status === 200 && patchWrite.json.items.some((item) => item.id === 'patch-note' && item.title === 'patch'), String(patchWrite.status));
  const patchConflict = await request(state.handler, 'PATCH', '/api/quick-note/state', { upserts: [{ id: 'patch-note-2', kind: 'note', title: 'x' }] }, { 'if-match': String(patchBase.json.revision) });
  check('state patch honors If-Match', patchConflict.status === 409, String(patchConflict.status));
  const tombstoneAt = Date.now() + 5;
  const patchDelete = await request(
    state.handler,
    'PATCH',
    '/api/quick-note/state',
    { upserts: [{ id: 'patch-note', kind: 'note', title: 'patch', deletedAt: tombstoneAt, updatedAt: tombstoneAt }] },
    { 'if-match': String(patchWrite.json.revision) },
  );
  check(
    'state patch writes tombstone',
    patchDelete.status === 200 && patchDelete.json.items.some((item) => item.id === 'patch-note' && item.deletedAt === tombstoneAt),
    String(patchDelete.status),
  );

  // 9e. Markdown folder export/import
  const markdownDir = path.join(home.home, 'markdown-exchange');
  check('markdown requires token', (await request(markdownRoute.handler, 'POST', '/api/quick-note/markdown', { action: 'export', dir: markdownDir })).status === 401);
  const markdownExport = await request(markdownRoute.handler, 'POST', '/api/quick-note/markdown', { action: 'export', dir: markdownDir }, readHeaders);
  const markdownFiles = await fsp.readdir(markdownDir).catch(() => []);
  check(
    'markdown export writes files',
    markdownExport.status === 200 && markdownExport.json.count >= 1 && markdownFiles.some((name) => name.endsWith('.md')),
    JSON.stringify(markdownExport.json),
  );
  const exportedSample = markdownFiles.find((name) => name.endsWith('.md'));
  const exportedText = exportedSample === undefined ? '' : await fsp.readFile(path.join(markdownDir, exportedSample), 'utf8');
  check('markdown front matter', exportedText.startsWith('---\n') && exportedText.includes('source: quick-note'), exportedText.slice(0, 80));
  const markdownImportDuplicates = await request(markdownRoute.handler, 'POST', '/api/quick-note/markdown', { action: 'import', dir: markdownDir }, readHeaders);
  check(
    'markdown import skips duplicates',
    markdownImportDuplicates.status === 200 && markdownImportDuplicates.json.imported === 0 && markdownImportDuplicates.json.skipped >= 1,
    JSON.stringify(markdownImportDuplicates.json),
  );
  await fsp.writeFile(
    path.join(markdownDir, 'imported-extra.md'),
    '---\nkind: note\ntitle: "导入测试"\ntags: ["外部"]\n---\n\n这是从 Markdown 导入的正文。\n',
    'utf8',
  );
  const markdownImport = await request(markdownRoute.handler, 'POST', '/api/quick-note/markdown', { action: 'import', dir: markdownDir }, readHeaders);
  const markdownState = await request(state.handler, 'GET', '/api/quick-note/state');
  check(
    'markdown import creates note',
    markdownImport.status === 200 &&
      markdownImport.json.imported === 1 &&
      markdownState.json.items.some((item) => item.title === '导入测试' && item.tags.includes('导入') && item.tags.includes('外部')),
    JSON.stringify(markdownImport.json),
  );

  // 9f. speech-to-text: provider info + audio upload transcription
  const voiceInfo = await request(voiceRoute.handler, 'GET', '/api/quick-note/transcribe', undefined, readHeaders);
  check('voice provider info', voiceInfo.status === 200 && voiceInfo.json.available === true && voiceInfo.json.providers.some((provider) => provider.id === 'fake-speech'), JSON.stringify(voiceInfo.json));
  check('voice requires token', (await request(voiceRoute.handler, 'POST', '/api/quick-note/transcribe', Buffer.from('RIFF'), { 'content-type': 'audio/wav' })).status === 401);
  const voiceResponse = await request(voiceRoute.handler, 'POST', '/api/quick-note/transcribe', Buffer.from('RIFFfakewav'), {
    ...readHeaders,
    'content-type': 'audio/wav',
    'x-language': 'zh',
  });
  check('voice transcription', voiceResponse.status === 200 && voiceResponse.json.text === '语音转写结果', JSON.stringify(voiceResponse.json));

  // 9g. read-only HTML snapshot
  check('share requires token', (await request(shareRoute.handler, 'POST', '/api/quick-note/share', {})).status === 401);
  const shareResponse = await request(shareRoute.handler, 'POST', '/api/quick-note/share', {}, readHeaders);
  const shareHtml = shareResponse.json && shareResponse.json.path ? await fsp.readFile(shareResponse.json.path, 'utf8').catch(() => '') : '';
  check(
    'share creates html snapshot',
    shareResponse.status === 200 && /^share-[0-9]+-[0-9]+\.html$/.test(shareResponse.json.name) && shareHtml.includes('管理台只读快照') && shareHtml.includes('<section>'),
    JSON.stringify(shareResponse.json),
  );
  check(
    'share snapshot has filter and theme',
    shareHtml.includes('id="share-search"') && shareHtml.includes('data-filter="task"') && shareHtml.includes('prefers-color-scheme:dark') && shareHtml.includes('data-kind='),
  );
  const shareRead = await request(shareRoute.handler, 'GET', shareResponse.json.url + '?token=' + readToken);
  check('share html served with token', shareRead.status === 200 && String(shareRead.headers['content-type']).includes('text/html') && shareRead.text.includes('管理台只读快照'), String(shareRead.status));
  check('share rejects bad name', (await request(shareRoute.handler, 'GET', '/api/quick-note/share/..%2Fsecret.html?token=' + readToken)).status === 404);

  // 9h. Host-computed reminders endpoint
  check('reminders require token', (await request(remindersRoute.handler, 'GET', '/api/quick-note/reminders')).status === 401);
  const reminders = await request(remindersRoute.handler, 'GET', '/api/quick-note/reminders', undefined, readHeaders);
  check(
    'reminders snapshot shape',
    reminders.status === 200 && typeof reminders.json.generatedAt === 'number' && reminders.json.counts !== undefined && Array.isArray(reminders.json.items),
    JSON.stringify(reminders.json && reminders.json.counts),
  );

  // 9i. cleanup scan/clean: plugin orphan attachments + workspace junk
  const orphanPath = path.join(home.home, 'quick-note', 'files', 'orphan.png');
  await fsp.mkdir(path.dirname(orphanPath), { recursive: true });
  await fsp.writeFile(orphanPath, 'orphan-bytes', 'utf8');
  const junkPath = path.join(workspaceRoot, 'tmp.log');
  const dsStorePath = path.join(workspaceRoot, '.DS_Store');
  await fsp.writeFile(junkPath, 'log', 'utf8');
  await fsp.writeFile(dsStorePath, 'junk', 'utf8');
  await fsp.mkdir(path.join(workspaceRoot, 'node_modules', '.cache'), { recursive: true });
  await fsp.writeFile(path.join(workspaceRoot, 'node_modules', '.cache', 'cache.bin'), 'cache', 'utf8');
  await fsp.mkdir(path.join(workspaceRoot, 'dist'), { recursive: true });
  await fsp.writeFile(path.join(workspaceRoot, 'dist', 'bundle.js'), 'built', 'utf8');
  check('cleanup requires token', (await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'scan' })).status === 401);
  const cleanupScan = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'scan' }, readHeaders);
  const cleanupIds = new Set(cleanupScan.json.categories.map((category) => category.id));
  const orphanCategory = cleanupScan.json.categories.find((category) => category.id === 'pluginAttachments');
  const junkCategory = cleanupScan.json.categories.find((category) => category.id === 'workspaceJunk');
  check(
    'cleanup scan finds plugin and workspace files',
    cleanupScan.status === 200 &&
      cleanupIds.has('pluginAttachments') &&
      cleanupIds.has('workspaceJunk') &&
      cleanupIds.has('workspaceCaches') &&
      cleanupIds.has('workspaceBuilds') &&
      orphanCategory.items.some((item) => item.path === orphanPath) &&
      junkCategory.items.some((item) => item.path === junkPath),
    JSON.stringify({ ids: [...cleanupIds], scanned: cleanupScan.json.scannedFiles }),
  );
  const cleanupResult = await request(
    cleanupRoute.handler,
    'POST',
    '/api/quick-note/cleanup',
    { action: 'clean', categories: ['pluginAttachments', 'workspaceJunk'] },
    readHeaders,
  );
  check('cleanup removes selected files', cleanupResult.status === 200 && cleanupResult.json.removed >= 2 && cleanupResult.json.freed > 0, JSON.stringify(cleanupResult.json));
  check(
    'cleanup history recorded',
    Array.isArray(cleanupResult.json.history) && cleanupResult.json.history.length >= 1 && cleanupResult.json.history[0].removed >= 2 && cleanupResult.json.history[0].hints.length >= 1,
    JSON.stringify(cleanupResult.json.history && cleanupResult.json.history[0]),
  );
  check(
    'cleanup history recoverable',
    cleanupResult.json.history[0].recoverable === true &&
      typeof cleanupResult.json.history[0].id === 'string' &&
      Array.isArray(cleanupResult.json.history[0].items) &&
      cleanupResult.json.history[0].items.length >= 2 &&
      cleanupResult.json.history[0].expiresAt > Date.now(),
  );
  const cleanupAfter = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'scan' }, readHeaders);
  check('cleanup history persists in scan', Array.isArray(cleanupAfter.json.history) && cleanupAfter.json.history.length >= 1, String(cleanupAfter.json.history && cleanupAfter.json.history.length));
  check('cleanup trash summary', cleanupAfter.json.trash !== undefined && cleanupAfter.json.trash.count >= 1 && cleanupAfter.json.trash.bytes > 0, JSON.stringify(cleanupAfter.json.trash));
  check(
    'trash records carry categories',
    Array.isArray(cleanupAfter.json.trash.records) &&
      cleanupAfter.json.trash.records.some((record) => Array.isArray(record.categories) && record.categories.length > 0),
    JSON.stringify(cleanupAfter.json.trash.records && cleanupAfter.json.trash.records[0]),
  );
  check(
    'trash records carry workspace roots',
    Array.isArray(cleanupAfter.json.trash.records) && cleanupAfter.json.trash.records.some((record) => Array.isArray(record.roots) && record.roots.length > 0),
    JSON.stringify(cleanupAfter.json.trash.records && cleanupAfter.json.trash.records[0] && cleanupAfter.json.trash.records[0].roots),
  );
  check(
    'cleanup trash limits and schedule log',
    cleanupAfter.json.trash.maxRecords === 20 && cleanupAfter.json.schedule !== undefined && typeof cleanupAfter.json.schedule.mode === 'string',
    JSON.stringify({ max: cleanupAfter.json.trash.maxRecords, schedule: cleanupAfter.json.schedule }),
  );
  check(
    'cleanup keeps sources and unselected dirs',
    !fs.existsSync(orphanPath) && !fs.existsSync(junkPath) && !fs.existsSync(dsStorePath) && fs.existsSync(path.join(workspaceRoot, 'app.js')) && fs.existsSync(path.join(workspaceRoot, 'dist', 'bundle.js')),
  );
  const undoResult = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'undo', id: cleanupResult.json.history[0].id }, readHeaders);
  check(
    'cleanup undo restores files',
    undoResult.status === 200 &&
      undoResult.json.restored >= 2 &&
      fs.existsSync(orphanPath) &&
      fs.existsSync(junkPath) &&
      undoResult.json.history[0].recoverable === false,
    JSON.stringify({ status: undoResult.status, restored: undoResult.json && undoResult.json.restored }),
  );
  const emptyTrash = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'empty' }, readHeaders);
  check('cleanup empty trash', emptyTrash.status === 200 && emptyTrash.json.emptied === true && emptyTrash.json.trash.count === 0, JSON.stringify(emptyTrash.json && emptyTrash.json.trash));
  const trashDir = path.join(home.home, 'quick-note', 'trash');
  await fsp.mkdir(trashDir, { recursive: true });
  for (let index = 0; index < 25; index += 1) {
    const dir = path.join(trashDir, 'evict-' + String(index).padStart(2, '0'));
    await fsp.mkdir(dir, { recursive: true });
    await fsp.writeFile(path.join(dir, 'blob.bin'), 'x', 'utf8');
    await new Promise((resolve) => setTimeout(resolve, 2));
  }
  const evictedScan = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'scan' }, readHeaders);
  check(
    'trash capacity evicts oldest',
    evictedScan.status === 200 && evictedScan.json.trash.count <= 20 && !fs.existsSync(path.join(trashDir, 'evict-00')),
    JSON.stringify({ count: evictedScan.json.trash && evictedScan.json.trash.count }),
  );
  const autoClean = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'auto' }, readHeaders);
  check(
    'scheduled auto cleanup runs safe categories',
    autoClean.status === 200 &&
      autoClean.json.history[0].auto === true &&
      autoClean.json.removed >= 1 &&
      autoClean.json.schedule !== undefined &&
      autoClean.json.schedule.lastRunAt > 0 &&
      Array.isArray(autoClean.json.schedule.runs) &&
      autoClean.json.schedule.runs.length >= 1,
    JSON.stringify({ removed: autoClean.json.removed, auto: autoClean.json.history && autoClean.json.history[0] && autoClean.json.history[0].auto }),
  );
  const scheduleState = await request(state.handler, 'GET', '/api/quick-note/state');
  await request(state.handler, 'PUT', '/api/quick-note/state', stateDoc({
    items: scheduleState.json.items,
    settings: { ...scheduleState.json.settings, cleanupSchedule: 'weekly' },
    reviews: scheduleState.json.reviews,
    types: scheduleState.json.types,
  }));
  const scheduleRead = await request(state.handler, 'GET', '/api/quick-note/state');
  check('cleanup schedule setting persists', scheduleRead.json.settings.cleanupSchedule === 'weekly', scheduleRead.json.settings.cleanupSchedule);
  check('cleanup schedule time default', scheduleRead.json.settings.cleanupScheduleTime === '03:00', scheduleRead.json.settings.cleanupScheduleTime);
  check('backup interval default', scheduleRead.json.settings.backupIntervalMinutes === 5, String(scheduleRead.json.settings.backupIntervalMinutes));
  await request(state.handler, 'PUT', '/api/quick-note/state', stateDoc({
    items: scheduleRead.json.items,
    settings: { ...scheduleRead.json.settings, cleanupScheduleTime: '04:15', backupIntervalMinutes: 30 },
    reviews: scheduleRead.json.reviews,
    types: scheduleRead.json.types,
  }));
  const scheduleTimedScan = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'scan' }, readHeaders);
  check('cleanup schedule custom time', scheduleTimedScan.json.schedule.time === '04:15', scheduleTimedScan.json.schedule.time);
  const backupIntervalState = await request(state.handler, 'GET', '/api/quick-note/state');
  check('backup interval setting persists', backupIntervalState.json.settings.backupIntervalMinutes === 30, String(backupIntervalState.json.settings.backupIntervalMinutes));
  check(
    'med reminders and shortcuts defaults',
    backupIntervalState.json.settings.medReminderEnabled === true &&
      backupIntervalState.json.settings.shortcuts.palette === 'ctrl+k' &&
      backupIntervalState.json.settings.shortcuts.help === '?',
    JSON.stringify(backupIntervalState.json.settings.shortcuts),
  );
  await request(state.handler, 'PUT', '/api/quick-note/state', stateDoc({
    items: scheduleRead.json.items,
    settings: { ...backupIntervalState.json.settings, medReminderEnabled: false, shortcuts: { palette: 'ctrl+j', help: '!' } },
    reviews: scheduleRead.json.reviews,
    types: scheduleRead.json.types,
  }));
  const customSettings = await request(state.handler, 'GET', '/api/quick-note/state');
  check(
    'custom shortcuts and med reminders persist',
    customSettings.json.settings.medReminderEnabled === false &&
      customSettings.json.settings.shortcuts.palette === 'ctrl+j' &&
      customSettings.json.settings.shortcuts.help === '!',
    JSON.stringify({ med: customSettings.json.settings.medReminderEnabled, shortcuts: customSettings.json.settings.shortcuts }),
  );
  await request(state.handler, 'PUT', '/api/quick-note/state', stateDoc({
    items: scheduleRead.json.items,
    settings: { ...scheduleRead.json.settings, cleanupSchedule: 'cron', cleanupScheduleCron: '0 4 * * 1' },
    reviews: scheduleRead.json.reviews,
    types: scheduleRead.json.types,
  }));
  const cronScan = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'scan' }, readHeaders);
  check(
    'cleanup cron expression schedule',
    cronScan.json.schedule.mode === 'cron' &&
      cronScan.json.schedule.cron === '0 4 * * 1' &&
      cronScan.json.schedule.nextRunAt > Date.now(),
    JSON.stringify(cronScan.json.schedule),
  );
  const cronPreview = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'cron-preview', cron: '*/5 * * * *' }, readHeaders);
  check(
    'cron preview next five runs',
    cronPreview.status === 200 &&
      Array.isArray(cronPreview.json.next) &&
      cronPreview.json.next.length === 10 &&
      cronPreview.json.next.every((at, index) => at > Date.now() && (index === 0 || at > cronPreview.json.next[index - 1])),
    JSON.stringify(cronPreview.json),
  );
  const invalidCron = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'cron-preview', cron: 'not a cron' }, readHeaders);
  check('cron preview rejects invalid', invalidCron.status === 400, String(invalidCron.status));
  const utcPreview = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'cron-preview', cron: '0 3 * * *', timezone: 'UTC+8' }, readHeaders);
  check(
    'cron preview timezone',
    utcPreview.status === 200 && utcPreview.json.timezone === 'UTC+8' && Array.isArray(utcPreview.json.next) && utcPreview.json.next.length === 10,
    JSON.stringify(utcPreview.json && utcPreview.json.timezone),
  );
  const ianaPreview = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'cron-preview', cron: '0 3 * * *', timezone: 'Asia/Shanghai' }, readHeaders);
  check(
    'cron preview IANA timezone',
    ianaPreview.status === 200 && ianaPreview.json.timezone === 'Asia/Shanghai' && ianaPreview.json.next.length === 10,
    JSON.stringify(ianaPreview.json && ianaPreview.json.timezone),
  );
  const orPreview = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'cron-preview', cron: '0 0 1 * 1' }, readHeaders);
  const orMatches = Array.isArray(orPreview.json.next)
    ? orPreview.json.next.every((at) => {
        const date = new Date(at);
        return date.getDate() === 1 || date.getDay() === 1;
      })
    : false;
  check(
    'cron day-of-month OR day-of-week',
    orPreview.status === 200 && orPreview.json.next.length === 10 && orMatches,
    JSON.stringify(orPreview.json),
  );
  const multiPreview = await request(
    cleanupRoute.handler,
    'POST',
    '/api/quick-note/cleanup',
    { action: 'cron-preview-multi', cron: '0 3 * * *', timezones: ['local', 'UTC', 'Asia/Shanghai'] },
    readHeaders,
  );
  check(
    'cron multi-timezone comparison',
    multiPreview.status === 200 &&
      Array.isArray(multiPreview.json.results) &&
      multiPreview.json.results.length === 3 &&
      multiPreview.json.results.every((entry) => typeof entry.timezone === 'string' && entry.next.length === 3),
    JSON.stringify(multiPreview.json),
  );

  // 9m. batch restore + webhook test action
  await fsp.writeFile(path.join(workspaceRoot, 'batch-a.tmp'), 'a', 'utf8');
  await fsp.writeFile(path.join(workspaceRoot, 'batch-b.tmp'), 'b', 'utf8');
  const batchCleanOne = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'clean', categories: ['workspaceJunk'] }, readHeaders);
  await fsp.writeFile(path.join(workspaceRoot, 'batch-c.tmp'), 'c', 'utf8');
  const batchCleanTwo = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'clean', categories: ['workspaceJunk'] }, readHeaders);
  const batchIds = [batchCleanOne.json.history[0].id, batchCleanTwo.json.history[0].id];
  const batchRestore = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'restore', ids: batchIds }, readHeaders);
  check(
    'cleanup batch restore',
    batchRestore.status === 200 &&
      batchRestore.json.restored >= 2 &&
      fs.existsSync(path.join(workspaceRoot, 'batch-a.tmp')) &&
      fs.existsSync(path.join(workspaceRoot, 'batch-c.tmp')),
    JSON.stringify({ restored: batchRestore.json && batchRestore.json.restored }),
  );
  const webhookState = await request(state.handler, 'GET', '/api/quick-note/state');
  await request(state.handler, 'PUT', '/api/quick-note/state', stateDoc({
    items: webhookState.json.items,
    settings: { ...webhookState.json.settings, budgetWebhookUrl: 'https://hook.test/budget', budgetWebhookTemplate: 'slack' },
    reviews: webhookState.json.reviews,
    types: webhookState.json.types,
  }));
  const fetchBeforeWebhookAction = globalThis.fetch;
  let webhookActionPayload = null;
  globalThis.fetch = async (url, options) => {
    webhookActionPayload = JSON.parse(options.body);
    return { ok: true, status: 200, json: async () => ({}) };
  };
  try {
    const webhookTest = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'webhook-test' }, readHeaders);
    check(
      'webhook test action sends templated payload',
      webhookTest.status === 200 &&
        webhookTest.json.sent === true &&
        webhookTest.json.template === 'slack' &&
        webhookActionPayload !== null &&
        typeof webhookActionPayload.text === 'string' &&
        webhookActionPayload.text.includes('预算'),
      JSON.stringify({ status: webhookTest.status, result: webhookTest.json, payload: webhookActionPayload }),
    );
  } finally {
    globalThis.fetch = fetchBeforeWebhookAction;
  }
  const failingFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error('webhook offline');
  };
  try {
    await host.module.sendBudgetWebhook(
      { settings: { budgetWebhookUrl: 'https://hook.test/budget', budgetWebhookTemplate: 'generic' } },
      { totals: { totalTokens: 1 } },
      { over: true, warn: false, todayCost: 2, limit: 1, percent: 200, monthlyCost: 0, monthlyLimit: 0 },
    );
  } finally {
    globalThis.fetch = failingFetch;
  }
  const queuedScan = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'scan' }, readHeaders);
  check('webhook failure queued', queuedScan.status === 200 && queuedScan.json.webhookQueue.count >= 1, JSON.stringify(queuedScan.json.webhookQueue && queuedScan.json.webhookQueue.count));
  const persistedState = await request(state.handler, 'GET', '/api/quick-note/state');
  const persistedDocument = persistedState.json && persistedState.json.file ? JSON.parse(await fsp.readFile(persistedState.json.file, 'utf8')) : null;
  check(
    'webhook queue persisted in store',
    persistedDocument !== null && Array.isArray(persistedDocument.webhookQueue) && persistedDocument.webhookQueue.length >= 1,
    JSON.stringify(persistedDocument && persistedDocument.webhookQueue && persistedDocument.webhookQueue.length),
  );
  const retryFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({}) });
  try {
    const retried = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'webhook-retry' }, readHeaders);
    check('webhook queue retried', retried.status === 200 && retried.json.sent >= 1 && retried.json.remaining === 0, JSON.stringify(retried.json));
  } finally {
    globalThis.fetch = retryFetch;
  }
  globalThis.fetch = async () => {
    throw new Error('webhook offline again');
  };
  try {
    await host.module.sendBudgetWebhook(
      { settings: { budgetWebhookUrl: 'https://hook.test/budget', budgetWebhookTemplate: 'generic' } },
      { totals: { totalTokens: 1 } },
      { over: true, warn: false, todayCost: 2, limit: 1, percent: 200, monthlyCost: 0, monthlyLimit: 0 },
    );
  } finally {
    globalThis.fetch = failingFetch;
  }
  const removeScan = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'scan' }, readHeaders);
  const removeAt = removeScan.json.webhookQueue && removeScan.json.webhookQueue.items[0] ? removeScan.json.webhookQueue.items[0].at : -1;
  const removed = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'webhook-remove', at: removeAt }, readHeaders);
  check('webhook queue remove single', removed.status === 200 && removed.json.removed === 1 && removed.json.remaining === 0, JSON.stringify(removed.json));
  globalThis.fetch = async () => {
    throw new Error('webhook edit test offline');
  };
  try {
    await host.module.sendBudgetWebhook(
      { settings: { budgetWebhookUrl: 'https://hook.test/budget', budgetWebhookTemplate: 'generic' } },
      { totals: { totalTokens: 1 } },
      { over: true, warn: false, todayCost: 2, limit: 1, percent: 200, monthlyCost: 0, monthlyLimit: 0 },
    );
  } finally {
    globalThis.fetch = failingFetch;
  }
  const editScan = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'scan' }, readHeaders);
  const editAt = editScan.json.webhookQueue && editScan.json.webhookQueue.items[0] ? editScan.json.webhookQueue.items[0].at : -1;
  const edited = await request(
    cleanupRoute.handler,
    'POST',
    '/api/quick-note/cleanup',
    { action: 'webhook-edit', at: editAt, payload: '{"event":"custom","value":42}' },
    readHeaders,
  );
  check('webhook queue edit payload', edited.status === 200 && edited.json.updated === true && edited.json.queue[0].payload.event === 'custom', JSON.stringify(edited.json));
  let resentBody = null;
  globalThis.fetch = async (url, options) => {
    resentBody = JSON.parse(options.body);
    return { ok: true, status: 200, json: async () => ({}) };
  };
  try {
    const resent = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'webhook-resend', at: editAt }, readHeaders);
    check(
      'webhook queue resend edited payload',
      resent.status === 200 && resent.json.sent === 1 && resentBody !== null && resentBody.event === 'custom' && resentBody.value === 42,
      JSON.stringify({ result: resent.json, body: resentBody }),
    );
  } finally {
    globalThis.fetch = failingFetch;
  }

  for (let index = 0; index < 2; index += 1) {
    globalThis.fetch = async () => {
      throw new Error('batch webhook offline');
    };
    try {
      await host.module.sendBudgetWebhook(
        { settings: { budgetWebhookUrl: 'https://hook.test/batch', budgetWebhookTemplate: 'generic' } },
        { totals: { totalTokens: 1 } },
        { over: true, warn: false, todayCost: 2, limit: 1, percent: 200, monthlyCost: 0, monthlyLimit: 0 },
      );
    } finally {
      globalThis.fetch = failingFetch;
    }
  }
  const batchScan = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'scan' }, readHeaders);
  const batchAts = (batchScan.json.webhookQueue.items || []).map((item) => item.at).slice(0, 2);
  const batchEdited = await request(
    cleanupRoute.handler,
    'POST',
    '/api/quick-note/cleanup',
    { action: 'webhook-batch-edit', ats: batchAts, payload: '{"batch":true}' },
    readHeaders,
  );
  check('webhook batch edit', batchEdited.status === 200 && batchEdited.json.updated >= 1, JSON.stringify(batchEdited.json));
  const batchBodies = [];
  globalThis.fetch = async (url, options) => {
    batchBodies.push(JSON.parse(options.body));
    return { ok: true, status: 200, json: async () => ({}) };
  };
  try {
    const batchResent = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'webhook-batch-resend', ats: batchAts }, readHeaders);
    check(
      'webhook batch resend',
      batchResent.status === 200 && batchResent.json.sent >= 1 && batchBodies.length >= 1 && batchBodies.every((body) => body.batch === true),
      JSON.stringify({ result: batchResent.json, bodies: batchBodies }),
    );
  } finally {
    globalThis.fetch = failingFetch;
  }
  globalThis.fetch = async () => {
    throw new Error('export queue offline');
  };
  try {
    await host.module.sendBudgetWebhook(
      { settings: { budgetWebhookUrl: 'https://hook.test/export', budgetWebhookTemplate: 'generic' } },
      { totals: { totalTokens: 1 } },
      { over: true, warn: false, todayCost: 2, limit: 1, percent: 200, monthlyCost: 0, monthlyLimit: 0 },
    );
  } finally {
    globalThis.fetch = failingFetch;
  }
  const exportedQueue = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'webhook-export' }, readHeaders);
  const exportedItems = exportedQueue.json && exportedQueue.json.path ? JSON.parse(await fsp.readFile(exportedQueue.json.path, 'utf8')).items : [];
  const exportScan = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'scan' }, readHeaders);
  const exportAts = (exportScan.json.webhookQueue.items || []).map((item) => item.at);
  await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'webhook-batch-remove', ats: exportAts }, readHeaders);
  const importedQueue = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'webhook-import', items: exportedItems }, readHeaders);
  check(
    'webhook queue export/import',
    exportedQueue.status === 200 &&
      Array.isArray(exportedItems) &&
      exportedItems.length >= 1 &&
      importedQueue.status === 200 &&
      importedQueue.json.imported >= 1 &&
      importedQueue.json.remaining >= 1,
    JSON.stringify({ exported: exportedItems.length, imported: importedQueue.json && importedQueue.json.imported }),
  );

  // 9j. optimizer Markdown report
  check('optimizer report requires token', (await request(optimizerReportRoute.handler, 'POST', '/api/quick-note/optimizer-report', {})).status === 401);
  const reportResult = await request(optimizerReportRoute.handler, 'POST', '/api/quick-note/optimizer-report', {}, readHeaders);
  const optimizerReportText = reportResult.json && reportResult.json.path ? await fsp.readFile(reportResult.json.path, 'utf8').catch(() => '') : '';
  check(
    'optimizer report written',
    reportResult.status === 200 &&
      typeof reportResult.json.name === 'string' &&
      reportResult.json.name.startsWith('optimizer-') &&
      optimizerReportText.includes('管理台优化报告') &&
      optimizerReportText.includes('Token 效率') &&
      optimizerReportText.includes('空间清理'),
    JSON.stringify({ status: reportResult.status, name: reportResult.json && reportResult.json.name, bytes: reportResult.json && reportResult.json.bytes }),
  );
  const reportShare = await request(optimizerReportRoute.handler, 'POST', '/api/quick-note/optimizer-report', { format: 'html' }, readHeaders);
  const reportShareRead = reportShare.json && reportShare.json.url ? await request(shareRoute.handler, 'GET', reportShare.json.url + '?token=' + readToken) : undefined;
  check(
    'optimizer report HTML snapshot',
    reportShare.status === 200 &&
      reportShare.json.format === 'html' &&
      reportShare.json.url.startsWith('/api/quick-note/share/') &&
      reportShareRead.status === 200 &&
      reportShareRead.text.includes('管理台优化报告') &&
      reportShareRead.text.includes('高消耗会话') &&
      reportShareRead.text.includes('id="optimizer-search"') &&
      reportShareRead.text.includes('id="workspace-filter"') &&
      reportShareRead.text.includes('id="range-filter"') &&
      reportShareRead.text.includes('class="day-row"') &&
      reportShareRead.text.includes('data-workspace='),
    JSON.stringify({ status: reportShare.status, format: reportShare.json && reportShare.json.format }),
  );
  const shareStatsRead = await request(shareRoute.handler, 'GET', reportShare.json.url + '?token=' + readToken, undefined, { referer: 'https://ref.example/report' });
  const shareStatsScan = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'scan' }, readHeaders);
  check(
    'share access statistics recorded',
    shareStatsRead.status === 200 &&
      Array.isArray(shareStatsScan.json.shareStats) &&
      shareStatsScan.json.shareStats.some((entry) => entry.count >= 2) &&
      shareStatsScan.json.shareStats.some((entry) => entry.refs && (entry.refs.direct > 0 || entry.refs['ref.example'] > 0)) &&
      shareStatsScan.json.shareStats[0].lastAt > 0,
    JSON.stringify(shareStatsScan.json && shareStatsScan.json.shareStats && shareStatsScan.json.shareStats.slice(0, 2)),
  );
  const shareCsv = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'share-csv' }, readHeaders);
  const shareCsvText = shareCsv.json && shareCsv.json.path ? await fsp.readFile(shareCsv.json.path, 'utf8') : '';
  check(
    'share stats CSV export',
    shareCsv.status === 200 &&
      shareCsv.json.count >= 1 &&
      shareCsvText.startsWith('name,count,firstAt,lastAt,refs') &&
      shareCsvText.includes(',') &&
      shareCsvText.length > 40,
    JSON.stringify({ status: shareCsv.status, count: shareCsv.json && shareCsv.json.count }),
  );
  const futureCsv = await request(
    cleanupRoute.handler,
    'POST',
    '/api/quick-note/cleanup',
    { action: 'share-csv', from: '2099-01-01', to: '2099-01-02' },
    readHeaders,
  );
  const futureCsvText = futureCsv.json && futureCsv.json.path ? await fsp.readFile(futureCsv.json.path, 'utf8') : '';
  check('share CSV honors date range', futureCsv.status === 200 && futureCsv.json.count === 0 && futureCsvText.split('\n').length <= 2, JSON.stringify(futureCsv.json));
  const sharePng = await request(cleanupRoute.handler, 'POST', '/api/quick-note/cleanup', { action: 'share-chart-png' }, readHeaders);
  const sharePngBytes = sharePng.json && sharePng.json.path ? await fsp.readFile(sharePng.json.path) : Buffer.alloc(0);
  check(
    'share chart PNG export',
    sharePng.status === 200 &&
      sharePngBytes.length > 100 &&
      sharePngBytes[0] === 0x89 &&
      sharePngBytes.subarray(1, 4).toString('ascii') === 'PNG',
    JSON.stringify({ status: sharePng.status, bytes: sharePngBytes.length }),
  );
  const pngWidth = sharePngBytes.length >= 24 ? sharePngBytes.readUInt32BE(16) : 0;
  const pngHeight = sharePngBytes.length >= 24 ? sharePngBytes.readUInt32BE(20) : 0;
  check('share chart PNG title/axes dimensions', pngWidth === 480 && pngHeight === 260, pngWidth + 'x' + pngHeight);
  const today = new Date();
  const fromDate = new Date(today.getTime() - 2 * 86400000).toISOString().slice(0, 10);
  const toDate = today.toISOString().slice(0, 10);  const rangedReport = await request(optimizerReportRoute.handler, 'POST', '/api/quick-note/optimizer-report', { format: 'html', from: fromDate, to: toDate }, readHeaders);
  const rangedRead = rangedReport.json && rangedReport.json.url ? await request(shareRoute.handler, 'GET', rangedReport.json.url + '?token=' + readToken) : undefined;
  const rangedDayRows = rangedRead && rangedRead.text ? (rangedRead.text.match(/class="day-row"/g) || []).length : 0;
  check(
    'optimizer report custom date range',
    rangedReport.status === 200 &&
      rangedReport.json.range !== undefined &&
      rangedReport.json.range.from !== null &&
      rangedReport.json.range.to !== null &&
      rangedRead.text.includes('统计区间') &&
      rangedDayRows >= 1 &&
      rangedDayRows <= 4,
    JSON.stringify({ range: rangedReport.json && rangedReport.json.range, rows: rangedDayRows }),
  );

  // 9l. budget webhook posts once per day (fake fetch + dedupe state)
  const fetchBeforeWebhook = globalThis.fetch;
  let webhookRequest = null;
  globalThis.fetch = async (url, options) => {
    webhookRequest = { url: String(url), body: JSON.parse(options.body) };
    return { ok: true, status: 200, json: async () => ({}) };
  };
  try {
    const webhookDoc = { settings: { budgetWebhookUrl: 'https://hook.test/budget' } };
    const webhookBudget = { over: true, warn: false, todayCost: 2, limit: 1, percent: 200, monthlyCost: 0, monthlyLimit: 0 };
    const firstHook = await host.module.sendBudgetWebhook(webhookDoc, { totals: { totalTokens: 123 } }, webhookBudget);
    const secondHook = await host.module.sendBudgetWebhook(webhookDoc, { totals: { totalTokens: 123 } }, webhookBudget);
    check(
      'budget webhook posts once per day',
      firstHook.sent === true &&
        firstHook.status === 200 &&
        webhookRequest !== null &&
        webhookRequest.url === 'https://hook.test/budget' &&
        webhookRequest.body.event === 'budget-over' &&
        webhookRequest.body.limit === 1 &&
        secondHook.sent === false,
      JSON.stringify({ first: firstHook, second: secondHook }),
    );
  } finally {
    globalThis.fetch = fetchBeforeWebhook;
  }

  // 9k. budget overspend feeds the Host reminder snapshot
  const budgetState = await request(state.handler, 'GET', '/api/quick-note/state');
  await request(state.handler, 'PUT', '/api/quick-note/state', stateDoc({
    items: budgetState.json.items,
    settings: { ...budgetState.json.settings, tokenBudget: 0.01 },
    reviews: budgetState.json.reviews,
    types: budgetState.json.types,
  }));
  const budgetReminders = await request(remindersRoute.handler, 'GET', '/api/quick-note/reminders', undefined, readHeaders);
  check(
    'budget alert in reminder snapshot',
    budgetReminders.status === 200 &&
      budgetReminders.json.budget !== undefined &&
      budgetReminders.json.budget.over === true &&
      budgetReminders.json.budget.limit === 0.01 &&
      budgetReminders.json.budget.percent > 100,
    JSON.stringify({ status: budgetReminders.status, budget: budgetReminders.json && budgetReminders.json.budget }),
  );
  const usageForBudget = await request(usage.handler, 'GET', '/api/quick-note/usage', undefined, readHeaders);
  const todayCost = usageForBudget.json.efficiency.todayCost;
  const warnBudget = Math.round((todayCost / 0.9) * 100) / 100;
  await request(state.handler, 'PUT', '/api/quick-note/state', stateDoc({
    items: budgetState.json.items,
    settings: { ...budgetState.json.settings, tokenBudget: warnBudget },
    reviews: budgetState.json.reviews,
    types: budgetState.json.types,
  }));
  const warnReminders = await request(remindersRoute.handler, 'GET', '/api/quick-note/reminders', undefined, readHeaders);
  check(
    'budget warning at 80 percent',
    warnReminders.status === 200 &&
      warnReminders.json.budget !== undefined &&
      warnReminders.json.budget.warn === true &&
      warnReminders.json.budget.over === false &&
      warnReminders.json.budget.percent >= 80 &&
      warnReminders.json.budget.percent <= 100,
    JSON.stringify(warnReminders.json && warnReminders.json.budget),
  );
  const usageForMonth = await request(usage.handler, 'GET', '/api/quick-note/usage', undefined, readHeaders);
  check('usage exposes 30-day series', Array.isArray(usageForMonth.json.daily30) && usageForMonth.json.daily30.length === 30, String(usageForMonth.json.daily30 && usageForMonth.json.daily30.length));
  check(
    'usage 30-day series exposes cache hit rate',
    Array.isArray(usageForMonth.json.efficiency.daily30) &&
      usageForMonth.json.efficiency.daily30.length === 30 &&
      usageForMonth.json.efficiency.daily30.every((entry) => typeof entry.cacheHitRate === 'number'),
  );
  await request(state.handler, 'PUT', '/api/quick-note/state', stateDoc({
    items: budgetState.json.items,
    settings: { ...budgetState.json.settings, tokenBudget: 0.01, tokenBudgetMonthly: 0.01 },
    reviews: budgetState.json.reviews,
    types: budgetState.json.types,
  }));
  const monthlyReminders = await request(remindersRoute.handler, 'GET', '/api/quick-note/reminders', undefined, readHeaders);
  check(
    'monthly budget alert',
    monthlyReminders.status === 200 &&
      monthlyReminders.json.budget !== undefined &&
      monthlyReminders.json.budget.monthlyLimit === 0.01 &&
      monthlyReminders.json.budget.monthlyOver === true &&
      monthlyReminders.json.budget.monthlyCost > 0,
    JSON.stringify(monthlyReminders.json && monthlyReminders.json.budget),
  );

  // 10. static checks
  const client = source('client.js');
  try {
    new vm.Script(client, { filename: 'client.js' });
    check('client syntax', true);
  } catch (error) {
    check('client syntax', false, error.message);
  }
  const zh = (client.match(/const zh = \{[\s\S]*?\n    \};/) || [''])[0];
  const en = (client.match(/const en = \{[\s\S]*?\n    \};/) || [''])[0];
  const zhKeys = new Set([...zh.matchAll(/^      ([A-Za-z]+):/gm)].map((match) => match[1]));
  const enKeys = new Set([...en.matchAll(/^      ([A-Za-z]+):/gm)].map((match) => match[1]));
  const used = new Set((client.match(/\bt\('([A-Za-z]+)'\)/g) || []).map((hit) => hit.slice(3, -2)));
  for (const match of client.matchAll(/(?:tabKey|labelKey|newKey|hintKey):\s*'([A-Za-z]+)'/g)) used.add(match[1]);
  const missingZh = [...used].filter((key) => !zhKeys.has(key));
  const missingEn = [...used].filter((key) => !enKeys.has(key));
  check('i18n keys complete', missingZh.length === 0 && missingEn.length === 0 && used.size === zhKeys.size, JSON.stringify({ missingZh, missingEn }));
  check('i18n parity', zhKeys.size === enKeys.size && [...zhKeys].every((key) => enKeys.has(key)));
  check(
    'R1 build sources present',
    source('src/client.template.js').includes('/*__QUICK_NOTE_ENTRY__*/') &&
      source('src/entry.mjs').includes('/*__QUICK_NOTE_LOCALE__*/') &&
      source('src/locale.mjs').startsWith('export const zh = {') &&
      source('src/locale.mjs').includes('export const en = {') &&
      source('src/components.mjs').includes('SettingsSectionSource') &&
      source('src/helpers.mjs').includes('WorkbenchPanel') &&
      source('src/ui-assets.mjs').includes('ICON_PATHS'),
  );
  const { composeClient } = await import(new URL('../scripts/build-client.mjs', import.meta.url).href);
  check('build artifact matches source', composeClient() === client, 'run scripts/build-client.mjs');
  const medBase = await request(state.handler, 'GET', '/api/quick-note/state');
  const medIntakeAt = Date.now();
  await request(state.handler, 'PUT', '/api/quick-note/state', stateDoc({
    items: [
      ...medBase.json.items,
      {
        id: 'med-intake-1',
        kind: 'med',
        title: 'Drug A',
        health: { times: ['08:00'], active: true, intakes: [{ date: new Date(medIntakeAt).toISOString().slice(0, 10), time: '08:01', at: medIntakeAt }] },
      },
    ],
    settings: medBase.json.settings,
    reviews: medBase.json.reviews,
    types: medBase.json.types,
  }));
  const medAfter = await request(state.handler, 'GET', '/api/quick-note/state');
  const medItemAfter = medAfter.json.items.find((item) => item.id === 'med-intake-1');
  check(
    'medication intakes persist',
    medItemAfter !== undefined && Array.isArray(medItemAfter.health.intakes) && medItemAfter.health.intakes.length === 1 && medItemAfter.health.intakes[0].time === '08:01',
    JSON.stringify(medItemAfter && medItemAfter.health.intakes),
  );

  check(
    'size budget',
    Buffer.byteLength(client) < 680 * 1024 &&
      Buffer.byteLength(source('index.js')) < 280 * 1024 &&
      Buffer.byteLength(source('src/client.template.js')) < 500 * 1024,
    JSON.stringify({ client: Buffer.byteLength(client), index: Buffer.byteLength(source('index.js')), template: Buffer.byteLength(source('src/client.template.js')) }),
  );
  check('theme tokens only', !/#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(/.test(client));
  const styleStart = client.indexOf('const STYLES = [');
  const styleEnd = client.indexOf('function WorkbenchPanel');
  const styleBlock = client.slice(styleStart, styleEnd);
  const openBraces = (styleBlock.match(/\{/g) || []).length;
  const closeBraces = (styleBlock.match(/\}/g) || []).length;
  check('CSS braces balanced', styleStart >= 0 && styleEnd > styleStart && openBraces === closeBraces, openBraces + '/' + closeBraces);
  const uiClasses = ['.dshqn-hero', '.dshqn-quick-card', '.dshqn-status-pill', '.dshqn-value-head', '.dshqn-empty', '.dshqn-settings-head'];
  check('UI upgrade classes present', uiClasses.every((name) => client.includes(name)), JSON.stringify(uiClasses.filter((name) => !client.includes(name))));
  const interactionStyles = [
    '.dshqn-skeleton-line',
    '.dshqn-accent-swatch',
    '.dshqn-kpi-spark',
    '.dshqn-compact',
    '@keyframes dshqn-shimmer',
    '@keyframes dshqn-drop-in',
  ];
  check(
    'interaction styles present',
    interactionStyles.every((name) => client.includes(name)),
    JSON.stringify(interactionStyles.filter((name) => !client.includes(name))),
  );
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  check('package identity', pkg.name === 'dsh-quick-note' && pkg.dsh.manifestVersion === 1);

  await home.cleanup();
  report('host tests', lines);
}

/** Run the host test suite (called by test/run.mjs). */
export async function run() {
  try {
    await main();
  } catch (error) {
    lines.push('FAIL fatal :: ' + (error && error.stack ? error.stack : String(error)));
    report('host tests', lines);
  }
}
