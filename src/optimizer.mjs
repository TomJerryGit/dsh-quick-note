/**
 * Optimizer content (R1 module source injected by build-client.mjs).
 * Rendered inside the management console's Insights tab.
 */
export const OptimizerPanelSource = String.raw`    /** Extra endpoint used by the optimizer cleanup center. */
    const CLEANUP_URL = '/api/quick-note/cleanup';
    /** Markdown optimizer report endpoint. */
    const OPTIMIZER_REPORT_URL = '/api/quick-note/optimizer-report';
    const SAVINGS_URL = '/api/quick-note/savings';
    const SAVINGS_POLICY_URL = '/api/quick-note/savings-policy';

    /** Category labels for cleanup results (Host labels are Chinese). */
    function optimizerCategoryLabel(category, t) {
      const labels = {
        pluginAttachments: t('optimizerCatPluginAttachments'),
        pluginStaging: t('optimizerCatPluginStaging'),
        pluginTemp: t('optimizerCatPluginTemp'),
        workspaceJunk: t('optimizerCatWorkspaceJunk'),
        workspaceCaches: t('optimizerCatWorkspaceCaches'),
        workspaceBuilds: t('optimizerCatWorkspaceBuilds'),
        largeStale: t('optimizerCatLargeStale'),
      };
      return labels[category.id] || category.label;
    }

    /** Small horizontal bars for cost by workspace. */
    function OptimizerWorkspaceBars({ rows }) {
      const list = (Array.isArray(rows) ? rows : []).slice(0, 6);
      if (list.length === 0) return null;
      const max = Math.max(0.000001, ...list.map((row) => Number(row.cost) || 0));
      return h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
        list.map((row) =>
          h(
            'div',
            { key: row.path || row.title, style: { display: 'flex', flexDirection: 'column', gap: '3px' } },
            h(
              'div',
              { style: { display: 'flex', alignItems: 'baseline', gap: '8px', fontSize: '12px' } },
              h('span', { style: { flex: '1 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, row.title || row.path),
              h('span', { style: { flex: 'none', fontWeight: '600' } }, '¥' + Number(row.cost || 0).toFixed(3)),
              h('span', { style: { flex: 'none', fontSize: '10px', color: 'var(--dsw-alias-label-secondary)' } }, String(row.totalTokens || 0) + ' tokens'),
            ),
            h('div', { style: { height: '8px', borderRadius: '999px', background: 'var(--dsw-alias-bg-layer-2)', overflow: 'hidden' } },
              h('div', { style: { width: Math.max(2, Math.round((Number(row.cost || 0) / max) * 100)) + '%', height: '100%', background: 'var(--dshqn-accent)', borderRadius: '999px' } })),
          ),
        ),
      );
    }

    /** Line chart with optional target marker. */
    function OptimizerLineChart({ values, secondaryValues, maxValue, target, ariaLabel }) {
      const points = Array.isArray(values) ? values.map((value) => Number(value) || 0) : [];
      if (points.length < 2) return null;
      const secondary = Array.isArray(secondaryValues) ? secondaryValues.map((value) => Number(value) || 0) : [];
      const width = 600;
      const height = 150;
      const pad = 12;
      const top = Math.max(0.000001, Number(maxValue) || 0, ...points, ...secondary);
      const xOf = (index) => pad + (index / (points.length - 1)) * (width - pad * 2);
      const yOf = (value) => pad + (1 - Math.max(0, Math.min(1, value / top))) * (height - pad * 2);
      const line = points.map((value, index) => xOf(index).toFixed(1) + ',' + yOf(value).toFixed(1)).join(' ');
      const secondaryLine =
        secondary.length === points.length ? secondary.map((value, index) => xOf(index).toFixed(1) + ',' + yOf(value).toFixed(1)).join(' ') : '';
      const area = 'M ' + pad + ',' + (height - pad) + ' L ' + line.split(' ').join(' L ') + ' L ' + (width - pad) + ',' + (height - pad) + ' Z';
      const targetY = typeof target === 'number' && target > 0 ? yOf(target) : null;
      return h(
        'svg',
        { viewBox: '0 0 ' + width + ' ' + height, preserveAspectRatio: 'none', role: 'img', 'aria-label': ariaLabel, style: { width: '100%', height: '150px', display: 'block' } },
        [0.25, 0.5, 0.75].map((fraction) =>
          h('line', {
            key: fraction,
            x1: pad,
            x2: width - pad,
            y1: pad + fraction * (height - pad * 2),
            y2: pad + fraction * (height - pad * 2),
            stroke: 'var(--dsw-alias-border-l1)',
            'stroke-width': '1',
          }),
        ),
        h('path', { d: area, fill: 'var(--dshqn-accent)', opacity: '0.10' }),
        secondaryLine.length > 0
          ? h('polyline', { points: secondaryLine, fill: 'none', stroke: 'var(--dsw-alias-state-warn-primary)', 'stroke-width': '2', 'stroke-dasharray': '5 4', 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke' })
          : null,
        targetY !== null ? h('line', { x1: pad, x2: width - pad, y1: targetY, y2: targetY, stroke: 'var(--dsw-alias-state-warn-primary)', 'stroke-width': '1.5', 'stroke-dasharray': '6 5' }) : null,
        h('polyline', { points: line, fill: 'none', stroke: 'var(--dshqn-accent)', 'stroke-width': '2.5', 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'vector-effect': 'non-scaling-stroke' }),
        h('circle', { cx: xOf(points.length - 1), cy: yOf(points[points.length - 1]), r: '3.5', fill: 'var(--dshqn-accent)' }),
      );
    }

    /** Small histogram of the last 14 days of cost. */
    function OptimizerDailyBars({ daily, t }) {
      const values = Array.isArray(daily) ? daily : [];
      const max = Math.max(0.000001, ...values.map((day) => day.cost));
      if (values.length === 0) return null;
      return h(
        'div',
        { className: 'dshqn-optimizer-bars', style: { display: 'flex', alignItems: 'flex-end', gap: '4px', height: '72px', marginTop: '10px' } },
        values.map((day, index) =>
          h('span', {
            key: day.at + '-' + index,
            title: new Date(day.at).toLocaleDateString() + ' · ¥' + Number(day.cost).toFixed(3),
            style: {
              flex: '1 1 0',
              height: Math.max(3, Math.round((day.cost / max) * 68)) + 'px',
              background: 'var(--dshqn-accent)',
              opacity: day.cost === 0 ? '0.2' : '0.85',
              borderRadius: '3px 3px 0 0',
            },
          }),
        ),
      );
    }

    /** Token-efficiency + cleanup content rendered inside the Insights tab. */
    function OptimizerContent(props) {
      const t = props.t;
      const [usage, setUsage] = React.useState(null);
      const [cleanup, setCleanup] = React.useState(null);
      const [autoSavings, setAutoSavings] = React.useState(null);
      const [savingsOpen, setSavingsOpen] = React.useState(false);
      const [busy, setBusy] = React.useState(false);
      const [notice, setNotice] = React.useState('');
      const [selected, setSelected] = React.useState({});
      const [budgetDraft, setBudgetDraft] = React.useState(String(props.budget || ''));
      const [reportBusy, setReportBusy] = React.useState(false);
      const [shareBusy, setShareBusy] = React.useState(false);
      const [activeWorkspace, setActiveWorkspace] = React.useState('');
      const [monthlyDraft, setMonthlyDraft] = React.useState(String(props.monthlyBudget || ''));
      const [scheduleDraft, setScheduleDraft] = React.useState(props.schedule || 'off');
      const [webhookDraft, setWebhookDraft] = React.useState(props.webhook || '');
      const [fromDraft, setFromDraft] = React.useState('');
      const [toDraft, setToDraft] = React.useState('');
      const [webhookTemplateDraft, setWebhookTemplateDraft] = React.useState(props.webhookTemplate || 'generic');
      const [trashQuery, setTrashQuery] = React.useState('');
      const [selectedTrash, setSelectedTrash] = React.useState({});
      const [trashPage, setTrashPage] = React.useState(0);
      const [scheduleTimeDraft, setScheduleTimeDraft] = React.useState(props.scheduleTime || '03:00');
      const [cronDraft, setCronDraft] = React.useState(props.cron || '');
      const [trashType, setTrashType] = React.useState('all');
      const [trashWorkspace, setTrashWorkspace] = React.useState('all');
      const [cronPreview, setCronPreview] = React.useState([]);
      const [multiPreview, setMultiPreview] = React.useState([]);
      const [cronTimezoneDraft, setCronTimezoneDraft] = React.useState(props.cronTimezone || 'local');
      const [selectedWebhook, setSelectedWebhook] = React.useState({});
      const [webhookBatchDraft, setWebhookBatchDraft] = React.useState('');
      const [presetNameDraft, setPresetNameDraft] = React.useState('');
      const [webhookEditAt, setWebhookEditAt] = React.useState(null);
      const [webhookEditDraft, setWebhookEditDraft] = React.useState('');
      const efficiency = usage && usage.efficiency ? usage.efficiency : null;
      const totals = usage && usage.totals ? usage.totals : null;
      const daily = efficiency && Array.isArray(efficiency.daily) ? efficiency.daily : [];
      const budget = typeof props.budget === 'number' ? props.budget : 0;
      const monthlyBudget = typeof props.monthlyBudget === 'number' ? props.monthlyBudget : 0;

      const loadUsage = () => {
        readProtected(USAGE_URL)
          .then((payload) => setUsage(payload))
          .catch(() => setUsage(null));
      };
      const loadSavings = () => {
        const suffix = typeof props.sessionId === 'string' && props.sessionId.length > 0 ? '?sessionId=' + encodeURIComponent(props.sessionId) : '';
        readProtected(SAVINGS_URL + suffix)
          .then((payload) => setAutoSavings(payload))
          .catch(() => setAutoSavings(null));
      };
      const toggleSavingsMode = () => {
        const next = !(autoSavings && autoSavings.savings && autoSavings.savings.mode);
        postProtected(SAVINGS_POLICY_URL, { savingsMode: next })
          .then(() => loadSavings())
          .catch(() => {});
      };
      const checkBudget = () => {
        postProtected(SAVINGS_POLICY_URL, { action: 'evaluate' })
          .then(() => { loadSavings(); loadUsage(); })
          .catch(() => {});
      };
      React.useEffect(() => {
        loadSavings();
      }, []);
      const scan = () => {
        setBusy(true);
        setNotice('');
        postProtected(CLEANUP_URL, { action: 'scan' })
          .then((payload) => {
            setCleanup(payload);
            setSelected({});
          })
          .catch(() => setNotice(t('optimizerFailed')))
          .finally(() => setBusy(false));
      };
      const clean = () => {
        const categories = Object.keys(selected).filter((key) => selected[key]);
        if (categories.length === 0) {
          setNotice(t('optimizerNothing'));
          return;
        }
        setBusy(true);
        setNotice('');
        postProtected(CLEANUP_URL, { action: 'clean', categories })
          .then((result) => {
            setNotice(fillTemplate(t('optimizerCleaned'), { removed: result.removed, freed: formatBytes(result.freed) }));
            return postProtected(CLEANUP_URL, { action: 'scan' });
          })
          .then((payload) => {
            if (payload) {
              setCleanup(payload);
              setSelected({});
            }
          })
          .catch(() => setNotice(t('optimizerFailed')))
          .finally(() => setBusy(false));
      };
      const saveBudget = () => {
        const value = Number(budgetDraft);
        if (typeof props.onBudget === 'function') props.onBudget(Number.isFinite(value) && value > 0 ? Math.min(1000000, value) : 0);
      };
      const saveMonthlyBudget = () => {
        const value = Number(monthlyDraft);
        if (typeof props.onMonthlyBudget === 'function') props.onMonthlyBudget(Number.isFinite(value) && value > 0 ? Math.min(10000000, value) : 0);
      };
      const changeSchedule = (value) => {
        setScheduleDraft(value);
        if (typeof props.onSchedule === 'function') props.onSchedule(value);
      };
      const changeScheduleTime = (value) => {
        setScheduleTimeDraft(value);
        if (typeof props.onScheduleTime === 'function') props.onScheduleTime(value);
      };
      const changeCron = (value) => {
        setCronDraft(value);
        setCronPreview([]);
        if (typeof props.onCron === 'function') props.onCron(value);
      };
      const previewCron = () => {
        postProtected(CLEANUP_URL, { action: 'cron-preview', cron: cronDraft, timezone: cronTimezoneDraft })
          .then((payload) => setCronPreview(Array.isArray(payload.next) ? payload.next : []))
          .catch(() => setCronPreview([]));
      };
      const previewMulti = () => {
        postProtected(CLEANUP_URL, { action: 'cron-preview-multi', cron: cronDraft, timezones: [cronTimezoneDraft, 'UTC', 'Asia/Shanghai'] })
          .then((payload) => setMultiPreview(Array.isArray(payload.results) ? payload.results : []))
          .catch(() => setMultiPreview([]));
      };
      const exportWebhookQueue = () => {
        postProtected(CLEANUP_URL, { action: 'webhook-export' })
          .then((result) => setNotice(fillTemplate(t('optimizerWebhookExportDone'), { path: result.path, count: result.count })))
          .catch(() => setNotice(t('optimizerFailed')));
      };
      const importWebhookQueue = () => {
        let items;
        try {
          items = JSON.parse(webhookBatchDraft);
        } catch (error) {
          setNotice(t('optimizerWebhookImportFailed'));
          return;
        }
        if (!Array.isArray(items)) {
          setNotice(t('optimizerWebhookImportFailed'));
          return;
        }
        postProtected(CLEANUP_URL, { action: 'webhook-import', items })
          .then((result) => {
            setNotice(fillTemplate(t('optimizerWebhookImportDone'), { imported: result.imported, remaining: result.remaining }));
            return postProtected(CLEANUP_URL, { action: 'scan' });
          })
          .then((payload) => {
            if (payload) setCleanup(payload);
          })
          .catch(() => setNotice(t('optimizerFailed')));
      };
      const movePreset = (index, delta) => {
        const presets = Array.isArray(props.trashPresets) ? props.trashPresets.slice() : [];
        const target = index + delta;
        if (target < 0 || target >= presets.length) return;
        const temp = presets[index];
        presets[index] = presets[target];
        presets[target] = temp;
        if (typeof props.onTrashPresets === 'function') props.onTrashPresets(presets);
      };
      const changeCronTimezone = (value) => {
        setCronTimezoneDraft(value);
        if (typeof props.onCronTimezone === 'function') props.onCronTimezone(value);
      };
      const selectedWebhookAts = () => Object.keys(selectedWebhook).filter((key) => selectedWebhook[key]).map(Number);
      const batchWebhook = (action) => {
        const ats = selectedWebhookAts();
        if (ats.length === 0) return;
        setBusy(true);
        const body = action === 'webhook-batch-edit' ? { action, ats, payload: webhookBatchDraft } : { action, ats };
        postProtected(CLEANUP_URL, body)
          .then(() => {
            setSelectedWebhook({});
            return postProtected(CLEANUP_URL, { action: 'scan' });
          })
          .then((payload) => {
            if (payload) setCleanup(payload);
          })
          .catch(() => setNotice(t('optimizerFailed')))
          .finally(() => setBusy(false));
      };
      const resendWebhook = (at) => {
        if (busy) return;
        setBusy(true);
        postProtected(CLEANUP_URL, { action: 'webhook-resend', at })
          .then((result) => {
            setNotice(fillTemplate(t('optimizerWebhookRetried'), { sent: result.sent, remaining: result.remaining }));
            return postProtected(CLEANUP_URL, { action: 'scan' });
          })
          .then((payload) => {
            if (payload) setCleanup(payload);
          })
          .catch(() => setNotice(t('optimizerFailed')))
          .finally(() => setBusy(false));
      };
      const saveWebhookEdit = () => {
        postProtected(CLEANUP_URL, { action: 'webhook-edit', at: webhookEditAt, payload: webhookEditDraft })
          .then(() => postProtected(CLEANUP_URL, { action: 'scan' }))
          .then((payload) => {
            setWebhookEditAt(null);
            if (payload) setCleanup(payload);
          })
          .catch(() => setNotice(t('optimizerFailed')));
      };
      const exportSharePng = () => {
        if (busy) return;
        setBusy(true);
        postProtected(CLEANUP_URL, { action: 'share-chart-png', ...reportRange() })
          .then((result) => setNotice(fillTemplate(t('optimizerSharePngDone'), { path: result.path, count: result.count })))
          .catch(() => setNotice(t('optimizerFailed')))
          .finally(() => setBusy(false));
      };
      const saveTrashPreset = () => {
        const name = presetNameDraft.trim();
        if (name.length === 0) return;
        const presets = Array.isArray(props.trashPresets) ? props.trashPresets : [];
        if (typeof props.onTrashPresets === 'function') props.onTrashPresets([...presets, { name, type: trashType, workspace: trashWorkspace, query: trashQuery }].slice(0, 10));
        setPresetNameDraft('');
      };
      const deleteTrashPreset = (index) => {
        const presets = Array.isArray(props.trashPresets) ? props.trashPresets : [];
        if (typeof props.onTrashPresets === 'function') props.onTrashPresets(presets.filter((entry, position) => position !== index));
      };
      const exportShareCsv = () => {
        if (busy) return;
        setBusy(true);
        postProtected(CLEANUP_URL, { action: 'share-csv', ...reportRange() })
          .then((result) => setNotice(fillTemplate(t('optimizerShareCsvDone'), { path: result.path, count: result.count })))
          .catch(() => setNotice(t('optimizerFailed')))
          .finally(() => setBusy(false));
      };
      const removeWebhook = (at) => {
        if (busy) return;
        setBusy(true);
        postProtected(CLEANUP_URL, { action: 'webhook-remove', at })
          .then(() => postProtected(CLEANUP_URL, { action: 'scan' }))
          .then((payload) => {
            if (payload) setCleanup(payload);
          })
          .catch(() => setNotice(t('optimizerFailed')))
          .finally(() => setBusy(false));
      };
      const retryWebhookQueue = () => {
        if (busy) return;
        setBusy(true);
        setNotice('');
        postProtected(CLEANUP_URL, { action: 'webhook-retry' })
          .then((result) => {
            setNotice(fillTemplate(t('optimizerWebhookRetried'), { sent: result.sent, remaining: result.remaining }));
            return postProtected(CLEANUP_URL, { action: 'scan' });
          })
          .then((payload) => {
            if (payload) setCleanup(payload);
          })
          .catch(() => setNotice(t('optimizerFailed')))
          .finally(() => setBusy(false));
      };
      const saveWebhook = () => {
        if (typeof props.onWebhook === 'function') props.onWebhook(webhookDraft.trim());
      };
      const changeWebhookTemplate = (value) => {
        setWebhookTemplateDraft(value);
        if (typeof props.onWebhookTemplate === 'function') props.onWebhookTemplate(value);
      };
      const testWebhook = () => {
        if (busy) return;
        setBusy(true);
        postProtected(CLEANUP_URL, { action: 'webhook-test' })
          .then((result) => setNotice(result.sent === true ? fillTemplate(t('optimizerWebhookTestOk'), { status: result.status }) : t('optimizerWebhookTestFailed')))
          .catch(() => setNotice(t('optimizerWebhookTestFailed')))
          .finally(() => setBusy(false));
      };
      const restoreTrashSelected = () => {
        const ids = Object.keys(selectedTrash).filter((key) => selectedTrash[key]);
        if (ids.length === 0) return;
        setBusy(true);
        postProtected(CLEANUP_URL, { action: 'restore', ids })
          .then((payload) => {
            setNotice(fillTemplate(t('optimizerTrashRestored'), { restored: payload.restored }));
            setSelectedTrash({});
            return postProtected(CLEANUP_URL, { action: 'scan' });
          })
          .then((payload) => {
            if (payload) setCleanup(payload);
          })
          .catch(() => setNotice(t('optimizerFailed')))
          .finally(() => setBusy(false));
      };
      const reportRange = () => {
        const range = {};
        if (fromDraft.length > 0) range.from = fromDraft;
        if (toDraft.length > 0) range.to = toDraft;
        return range;
      };
      const autoClean = () => {
        if (busy) return;
        setBusy(true);
        setNotice('');
        postProtected(CLEANUP_URL, { action: 'auto' })
          .then((result) => {
            setNotice(fillTemplate(t('optimizerAutoDone'), { removed: result.removed, freed: formatBytes(result.freed) }));
            return postProtected(CLEANUP_URL, { action: 'scan' });
          })
          .then((payload) => {
            if (payload) setCleanup(payload);
          })
          .catch(() => setNotice(t('optimizerFailed')))
          .finally(() => setBusy(false));
      };
      const emptyTrash = () => {
        if (busy) return;
        setBusy(true);
        postProtected(CLEANUP_URL, { action: 'empty' })
          .then((payload) => {
            setNotice(t('optimizerTrashCleared'));
            if (payload) setCleanup({ ...cleanup, history: payload.history, trash: payload.trash });
          })
          .catch(() => setNotice(t('optimizerFailed')))
          .finally(() => setBusy(false));
      };
      const exportReport = () => {
        if (reportBusy) return;
        setReportBusy(true);
        postProtected(OPTIMIZER_REPORT_URL, { ...reportRange() })
          .then((payload) => setNotice(fillTemplate(t('optimizerExported'), { path: payload.path })))
          .catch(() => setNotice(t('optimizerFailed')))
          .finally(() => setReportBusy(false));
      };
      const shareReport = () => {
        if (shareBusy) return;
        setShareBusy(true);
        postProtected(OPTIMIZER_REPORT_URL, { format: 'html', ...reportRange() })
          .then((payload) => setNotice(fillTemplate(t('optimizerShared'), { path: payload.path })))
          .catch(() => setNotice(t('optimizerFailed')))
          .finally(() => setShareBusy(false));
      };
      const undoCleanup = (id) => {
        if (busy) return;
        setBusy(true);
        setNotice('');
        postProtected(CLEANUP_URL, { action: 'undo', id })
          .then((payload) => {
            setNotice(fillTemplate(t('optimizerUndone'), { restored: payload.restored }));
            return postProtected(CLEANUP_URL, { action: 'scan' });
          })
          .then((payload) => {
            if (payload) {
              setCleanup(payload);
              setSelected({});
            }
          })
          .catch(() => setNotice(t('optimizerUndoFailed')))
          .finally(() => setBusy(false));
      };
      const openSession = (sessionId) => {
        if (typeof props.onOpenSession === 'function') props.onOpenSession(sessionId);
      };

      React.useEffect(() => {
        loadUsage();
        scan();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      React.useEffect(() => {
        setBudgetDraft(String(budget || ''));
      }, [budget]);

      const metric = (label, value, hint) =>
        h(
          'div',
          { className: 'dshqn-optimizer-metric', style: { border: '1px solid var(--dsw-alias-border-l1)', borderRadius: '10px', padding: '10px 12px', minWidth: '120px', flex: '1 1 120px' } },
          h('div', { style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' } }, label),
          h('div', { style: { fontSize: '18px', fontWeight: '600', marginTop: '4px' } }, value),
          hint ? h('div', { style: { fontSize: '11px', color: 'var(--dsw-alias-label-secondary)', marginTop: '2px' } }, hint) : null,
        );

      const score = efficiency ? efficiency.score : 0;
      const categories = cleanup && Array.isArray(cleanup.categories) ? cleanup.categories : [];
      const selectedCount = Object.keys(selected).filter((key) => selected[key]).length;
      const trashRecords =
        cleanup && cleanup.trash && Array.isArray(cleanup.trash.records)
          ? cleanup.trash.records.filter((record) => {
              const query = trashQuery.trim().toLowerCase();
              const matchesQuery = query.length === 0 || (record.id + ' ' + new Date(record.createdAt || 0).toLocaleString()).toLowerCase().indexOf(query) >= 0;
              if (!matchesQuery) return false;
              if (trashWorkspace !== 'all') {
                const roots = Array.isArray(record.roots) ? record.roots : [];
                if (!roots.includes(trashWorkspace)) return false;
              }
              if (trashType === 'all') return true;
              const categories = Array.isArray(record.categories) ? record.categories : [];
              if (trashType === 'attachments') return categories.includes('pluginAttachments');
              if (trashType === 'temp') return categories.includes('pluginTemp') || categories.includes('workspaceJunk');
              if (trashType === 'cache') return categories.includes('workspaceCaches');
              if (trashType === 'builds') return categories.includes('workspaceBuilds');
              return true;
            })
          : [];
      const trashPageSize = 5;
      const trashPageCount = Math.max(1, Math.ceil(trashRecords.length / trashPageSize));
      const currentTrashPage = Math.min(trashPage, trashPageCount - 1);
      const pageTrashRecords = trashRecords.slice(currentTrashPage * trashPageSize, currentTrashPage * trashPageSize + trashPageSize);
      const trashCapacityWarn =
        cleanup && cleanup.trash && ((cleanup.trash.maxRecords > 0 && cleanup.trash.count / cleanup.trash.maxRecords >= 0.8) || (cleanup.trash.maxBytes > 0 && cleanup.trash.bytes / cleanup.trash.maxBytes >= 0.8));
      const shareRangeFrom = fromDraft.length > 0 ? Date.parse(fromDraft) : NaN;
      const shareRangeTo = toDraft.length > 0 ? Date.parse(toDraft) + 86400000 : NaN;
      const filteredShareStats =
        cleanup && Array.isArray(cleanup.shareStats)
          ? cleanup.shareStats.filter((entry) => {
              const at = entry.lastAt || entry.firstAt || 0;
              return (!Number.isFinite(shareRangeFrom) || at >= shareRangeFrom) && (!Number.isFinite(shareRangeTo) || at <= shareRangeTo);
            })
          : [];
      const trashTypeOptions = [
        { id: 'all', label: t('optimizerTrashTypeAll') },
        { id: 'attachments', label: t('optimizerTrashTypeAttachments') },
        { id: 'temp', label: t('optimizerTrashTypeTemp') },
        { id: 'cache', label: t('optimizerTrashTypeCache') },
        { id: 'builds', label: t('optimizerTrashTypeBuilds') },
      ];
      const budgetUsed = budget > 0 && efficiency ? (efficiency.todayCost / budget) * 100 : 0;
      const budgetOver = budget > 0 && efficiency ? efficiency.todayCost > budget : false;
      const monthlyUsed = monthlyBudget > 0 && efficiency ? ((efficiency.monthToDateCost || 0) / monthlyBudget) * 100 : 0;
      const monthlyOver = monthlyBudget > 0 && efficiency ? (efficiency.monthToDateCost || 0) > monthlyBudget : false;
      const daily30 = efficiency && Array.isArray(efficiency.daily30) ? efficiency.daily30 : [];
      const usagePricing = usage && usage.pricing ? usage.pricing : { inputHit: 0.04, inputMiss: 2, output: 8 };
      const hitCost = totals ? (totals.inputHit * usagePricing.inputHit) / 1000000 : 0;
      const missCost = totals ? (totals.inputMiss * usagePricing.inputMiss) / 1000000 : 0;
      const outputCost = totals ? (totals.output * usagePricing.output) / 1000000 : 0;
      const costTotal = Math.max(0.000001, hitCost + missCost + outputCost);
      const cacheSaving = efficiency ? Number(efficiency.cacheSaving || 0) : 0;
      const cacheHitPct = Math.round((totals ? totals.cacheHitRate : 0) * 100);
      const targetHitPct = Math.round((efficiency ? efficiency.targetCacheHit : 0.7) * 100);
      const monthCost = efficiency ? Number(efficiency.monthToDateCost || 0) : 0;
      const projectedCost = Math.max(0, Number(efficiency ? efficiency.totalCost : 0) - cacheSaving);
      const projectionSavingPct = Number(efficiency && efficiency.totalCost) > 0 ? Math.round((cacheSaving / Number(efficiency.totalCost)) * 100) : 0;
      const inputTokens = totals ? totals.inputHit + totals.inputMiss : 0;
      const priceGap = usagePricing.inputMiss - usagePricing.inputHit;
      const currentHitRate = efficiency ? Number(efficiency.cacheHitRate || 0) : 0;
      const targetHitRate = efficiency ? Number(efficiency.targetCacheHit || 0) : 0;
      const potentialHitRate = Math.min(targetHitRate, currentHitRate + 0.2);
      const hitGain = Math.max(0, potentialHitRate - currentHitRate);
      const savingsRows = [
        [t('optimizerInputTokens'), String(inputTokens)],
        [t('optimizerCurrentCache'), Math.round(currentHitRate * 100) + '%'],
        [t('optimizerTargetCache'), Math.round(targetHitRate * 100) + '%'],
        [t('optimizerPotentialCache'), Math.round(potentialHitRate * 100) + '%'],
        [t('optimizerPriceGap'), '¥' + priceGap.toFixed(2)],
      ];
      const costSegments = [
        { key: 'hit', value: hitCost, color: 'var(--dshqn-accent)', label: t('optimizerCostHit') },
        { key: 'miss', value: missCost, color: 'var(--dshqn-danger)', label: t('optimizerCostMiss') },
        { key: 'output', value: outputCost, color: 'var(--dsw-alias-state-warn-primary)', label: t('optimizerCostOutput') },
      ];
      let costCursor = 0;
      const costGradient = costSegments
        .map((segment) => {
          const start = (costCursor / costTotal) * 100;
          costCursor += segment.value;
          return segment.color + ' ' + start.toFixed(1) + '% ' + ((costCursor / costTotal) * 100).toFixed(1) + '%';
        })
        .join(', ');
      const auto = autoSavings || {};
      const autoCompaction = Boolean(auto.compaction && auto.compaction.enabled);
      const autoPruner = Boolean(auto.pruner && auto.pruner.enabled);
      const autoCommand = Boolean(auto.commandCompact && auto.commandCompact.enabled);
      const savingsMode = Boolean(auto.savings && auto.savings.mode);
      const savingsGuard = !auto.savings || auto.savings.guard !== false;
      const savingsModel = auto.savings && typeof auto.savings.model === 'string' ? auto.savings.model : '';
      const savingsActivatedAt = Number(auto.savings && auto.savings.activatedAt) || 0;
      const savingsDaily = (usage && Array.isArray(usage.daily30) ? usage.daily30 : [])
        .map((day) => ({ at: Number(day.at) || 0, cost: Number(day.cost) || 0 }))
        .filter((day) => day.at > 0);
      let savingsBeforeAvg = null;
      let savingsAfterAvg = null;
      let savingsEffectPct = null;
      if (savingsDaily.length > 0) {
        const latest = savingsDaily[savingsDaily.length - 1].at;
        const cutoff = savingsActivatedAt > 0 ? savingsActivatedAt : latest - 6 * 86400000;
        const before = savingsDaily.filter((day) => day.at < cutoff);
        const after = savingsDaily.filter((day) => day.at >= cutoff);
        const average = (rows) => (rows.length > 0 ? rows.reduce((sum, day) => sum + day.cost, 0) / rows.length : null);
        savingsBeforeAvg = average(before);
        savingsAfterAvg = average(after);
        if (savingsBeforeAvg !== null && savingsBeforeAvg > 0 && savingsAfterAvg !== null) {
          savingsEffectPct = Math.round(((savingsAfterAvg - savingsBeforeAvg) / savingsBeforeAvg) * 100);
        }
      }
      const thriftWorkspaces = Array.isArray(auto.thriftWorkspaces) ? auto.thriftWorkspaces : [];
      const modelCandidates = Array.isArray(auto.modelCandidates) ? auto.modelCandidates : [];
      const availableModels = Array.isArray(auto.availableModels) ? auto.availableModels : [];
      const selectedModelKey = auto.savings && auto.savings.provider && auto.savings.model ? auto.savings.provider + '||' + auto.savings.model : '';
      const saveModel = (value) => {
        const parts = String(value || '').split('||');
        const provider = parts.length === 2 ? parts[0] : '';
        const model = parts.length === 2 ? parts[1] : '';
        postProtected(SAVINGS_POLICY_URL, { savingsProvider: provider, savingsModel: model })
          .then(() => loadSavings())
          .catch(() => {});
      };
      const compareDays = usage && Array.isArray(usage.daily30) ? usage.daily30 : [];
      const actual30 = compareDays.map((day) => Number(day.cost) || 0);
      const baseline30 = compareDays.map(
        (day) =>
          ((Number(day.inputMiss) || 0) + (Number(day.inputHit) || 0)) * usagePricing.inputMiss / 1000000 +
          (Number(day.output) || 0) * usagePricing.output / 1000000,
      );
      const cumulativeSaved = compareDays.reduce((sum, day, index) => sum + Math.max(0, baseline30[index] - actual30[index]), 0);
      const toggleThrift = (path) => {
        const next = thriftWorkspaces.includes(path) ? thriftWorkspaces.filter((entry) => entry !== path) : [...thriftWorkspaces, path];
        postProtected(SAVINGS_POLICY_URL, { thriftWorkspaces: next })
          .then(() => loadSavings())
          .catch(() => {});
      };
      const discoverModels = () => {
        postProtected(SAVINGS_POLICY_URL, { action: 'discover' })
          .then(() => loadSavings())
          .catch(() => {});
      };
      const contextInfo = auto.selected || null;
      const contextPct = contextInfo ? Math.round(Number(contextInfo.ratio || 0) * 100) : 0;
      const contextBarWidth = Math.max(2, Math.min(100, contextPct));
      const autoBadge = (label, on) =>
        h(
          'span',
          {
            key: label,
            style: {
              fontSize: '10px',
              lineHeight: '18px',
              padding: '0 7px',
              borderRadius: '999px',
              background: on ? 'color-mix(in srgb, var(--dshqn-accent) 14%, var(--dsw-alias-bg-layer-1))' : 'var(--dsw-alias-bg-layer-2)',
              color: on ? 'var(--dshqn-accent)' : 'var(--dsw-alias-label-secondary)',
            },
          },
          (on ? '✓ ' : '× ') + label,
        );

      return h(
        'div',
        { className: 'dshqn-optimizer', style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
        notice.length > 0 ? h('p', { className: 'dshqn-hint' }, notice) : null,
        h(
          'div',
          { key: 'autoSavings', style: { border: '1px solid var(--dsw-alias-border-l1)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' } },
          h(
            'div',
            { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
            h('strong', { style: { fontSize: '13px' } }, t('optimizerAutoSavingsTitle')),
            h('span', { style: { fontSize: '11px', color: 'var(--dsw-alias-label-secondary)', flex: '1 1 auto' } }, t('optimizerAutoSavingsHint')),
            props.onOpenPlugins ? h('button', { type: 'button', className: 'dshqn-button', onClick: props.onOpenPlugins }, t('optimizerOpenPlugins')) : null,
            h('button', { type: 'button', className: 'dshqn-button', onClick: checkBudget }, t('optimizerCheckBudget')),
            h('button', { type: 'button', className: 'dshqn-button', onClick: toggleSavingsMode }, savingsMode ? t('optimizerSavingsModeOn') : t('optimizerSavingsModeOff')),
            h('button', { type: 'button', className: 'dshqn-button', onClick: loadSavings }, t('optimizerRefresh')),
          ),
          h(
            'div',
            { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' } },
            h(
              'div',
              { style: { border: '1px solid var(--dsw-alias-border-l1)', borderRadius: '10px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '6px' } },
              h('div', { style: { fontSize: '11px', color: 'var(--dsw-alias-label-secondary)' } }, t('optimizerAutoStatus')),
              h('div', { style: { display: 'flex', gap: '5px', flexWrap: 'wrap' } },
                autoBadge(t('optimizerAutoCompaction'), autoCompaction),
                autoBadge(t('optimizerAutoPruner'), autoPruner),
                autoBadge(t('optimizerAutoCommand'), autoCommand),
                autoBadge(t('optimizerSavingsGuard'), savingsGuard),
                autoBadge(t('optimizerSavingsMode'), savingsMode)),
              savingsModel.length > 0 ? h('div', { style: { fontSize: '10px', color: 'var(--dsw-alias-label-secondary)' } }, fillTemplate(t('optimizerSavingsModel'), { model: savingsModel })) : null,
              auto.defaultModel && auto.defaultModel.provider && auto.defaultModel.model
                ? h('div', { style: { fontSize: '10px', color: 'var(--dsw-alias-label-secondary)' } }, t('optimizerCurrentModel') + '：' + auto.defaultModel.provider + ' / ' + auto.defaultModel.model)
                : null,
            ),
            h(
              'div',
              { style: { border: '1px solid var(--dsw-alias-border-l1)', borderRadius: '10px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '5px' } },
              h('div', { style: { fontSize: '11px', color: 'var(--dsw-alias-label-secondary)' } }, t('optimizerContextPressure')),
              contextInfo
                ? [
                    h('div', { key: 'value', style: { fontSize: '13px', fontWeight: '600' } }, contextPct + '% · ' + Number(contextInfo.pressureTokens || 0).toLocaleString() + ' / ' + Number(contextInfo.contextWindow || 0).toLocaleString()),
                    h('div', { key: 'bar', style: { height: '7px', borderRadius: '999px', background: 'var(--dsw-alias-bg-layer-2)', overflow: 'hidden' } },
                      h('div', { style: { width: contextBarWidth + '%', height: '100%', background: contextPct >= 80 ? 'var(--dshqn-danger)' : 'var(--dshqn-accent)' } })),
                    h('div', { key: 'hint', style: { fontSize: '11px', color: 'var(--dsw-alias-label-secondary)' } }, fillTemplate(t('optimizerCompressible'), { amount: Number(contextInfo.compressibleTokens || 0).toLocaleString() })),
                  ]
                : h('div', { style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' } }, t('optimizerContextNoData')),
            ),
            h(
              'div',
              { style: { border: '1px solid var(--dsw-alias-border-l1)', borderRadius: '10px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '5px' } },
              h('div', { style: { fontSize: '11px', color: 'var(--dsw-alias-label-secondary)' } }, t('optimizerBudgetStatus')),
              h('div', { style: { fontSize: '12px' } }, t('optimizerAutoBudgetDaily') + ' ' + (budget > 0 ? '¥' + budget.toFixed(2) + ' · ' + Math.round(budgetUsed) + '%' : '—')),
              h('div', { style: { height: '6px', borderRadius: '999px', background: 'var(--dsw-alias-bg-layer-2)', overflow: 'hidden' } },
                h('div', { style: { width: Math.min(100, Math.max(2, budget > 0 ? budgetUsed : 2)) + '%', height: '100%', background: budgetOver ? 'var(--dshqn-danger)' : 'var(--dshqn-accent)' } })),
              h('div', { style: { fontSize: '12px' } }, t('optimizerAutoBudgetMonthly') + ' ' + (monthlyBudget > 0 ? '¥' + monthlyBudget.toFixed(2) + ' · ' + Math.round(monthlyUsed) + '%' : '—')),
            ),
          ),
          h('div', { style: { fontSize: '11px', color: 'var(--dsw-alias-label-secondary)' } },
            t('optimizerThriftTitle') + '：' + (thriftWorkspaces.length > 0 ? fillTemplate(t('optimizerThriftSelected'), { count: thriftWorkspaces.length }) : '—')),
          h('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' } },
            usage && Array.isArray(usage.workspaces) && usage.workspaces.length > 0
              ? usage.workspaces.slice(0, 3).map((row) =>
                  h('button', {
                    key: row.path,
                    type: 'button',
                    className: thriftWorkspaces.includes(row.path) ? 'dshqn-filter dshqn-filter-active' : 'dshqn-filter',
                    title: row.path,
                    onClick: () => toggleThrift(row.path),
                  }, row.title + ' ¥' + Number(row.cost || 0).toFixed(3)),
                )
              : h('span', { style: { fontSize: '11px', color: 'var(--dsw-alias-label-secondary)' } }, '—'),
          ),
          h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', fontSize: '11px', color: 'var(--dsw-alias-label-secondary)' } },
            h('span', null, modelCandidates.length > 0 ? t('optimizerModelCandidates') + '：' + modelCandidates.slice(0, 3).map((candidate) => candidate.name || candidate.model).join(' · ') : t('optimizerNoCheaperModel')),
            h('button', { type: 'button', className: 'dshqn-button', onClick: discoverModels }, t('optimizerDiscoverModel')),
            h('select', { className: 'dshqn-field', value: selectedModelKey, 'aria-label': t('optimizerChooseModel'), onChange: (event) => saveModel(event.target.value) },
              h('option', { value: '' }, t('optimizerAutoModel')),
              availableModels.map((model) => h('option', { key: model.provider + '||' + model.model, value: model.provider + '||' + model.model }, model.provider + ' / ' + model.name))),
          ),
          h('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', fontSize: '11px', color: 'var(--dsw-alias-label-secondary)' } },
            h('span', null, t('optimizerSavingsEffect') + '：'),
            savingsBeforeAvg !== null ? h('span', null, t('optimizerBeforeMode') + ' ¥' + savingsBeforeAvg.toFixed(3)) : null,
            savingsAfterAvg !== null ? h('span', null, t('optimizerAfterMode') + ' ¥' + savingsAfterAvg.toFixed(3)) : null,
            savingsEffectPct !== null
              ? h('span', { style: { color: savingsEffectPct <= 0 ? 'var(--dshqn-accent)' : 'var(--dshqn-danger)', fontWeight: '600' } }, (savingsEffectPct <= 0 ? '-' : '+') + Math.abs(savingsEffectPct) + '%')
              : h('span', null, t('optimizerNoEffectData')),
          ),
        ),
        h(
          'section',
          { className: 'dshqn-card', style: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' } },
          h(
            'div',
            { className: 'dshqn-section-head' },
            h('span', { className: 'dshqn-section-mark' }),
            h('h2', { style: { fontSize: '15px', margin: 0 } }, t('optimizerEfficiencyTitle')),
            h('span', { style: { flex: '1 1 auto' } }),
            h(
              'div',
              { style: { display: 'flex', gap: '8px' } },
              h('button', { type: 'button', className: 'dshqn-button', onClick: () => { loadUsage(); scan(); loadSavings(); }, disabled: busy }, t('optimizerRefresh')),
              h('button', { type: 'button', className: 'dshqn-button', onClick: exportReport, disabled: reportBusy }, reportBusy ? t('optimizerExporting') : t('optimizerExport')),
              h('button', { type: 'button', className: 'dshqn-button', onClick: shareReport, disabled: shareBusy }, shareBusy ? t('optimizerSharing') : t('optimizerShare')),
            ),
          ),
          usage === null
            ? h('p', { className: 'dshqn-hint' }, t('optimizerNoUsage'))
            : [
                h(
                  'div',
                  { key: 'dashboard', style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px' } },
                  h(
                    'div',
                    { style: { border: '1px solid var(--dsw-alias-border-l1)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' } },
                    h('div', { style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' } }, t('optimizerSavingsPotential')),
                    h('div', { style: { fontSize: '28px', fontWeight: '700', lineHeight: '1.1', color: 'var(--dshqn-accent)' } }, '¥' + cacheSaving.toFixed(3)),
                    h('div', { style: { fontSize: '11px', color: 'var(--dsw-alias-label-secondary)' } }, t('optimizerSavingsHint')),
                    h('button', { type: 'button', className: 'dshqn-button', style: { marginTop: '4px', padding: '2px 8px', fontSize: '11px', alignSelf: 'flex-start' }, 'aria-expanded': savingsOpen, onClick: () => setSavingsOpen((value) => !value) }, savingsOpen ? t('optimizerSavingsHide') : t('optimizerSavingsDetail')),
                  ),
                  h(
                    'div',
                    { style: { border: '1px solid var(--dsw-alias-border-l1)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' } },
                    h(
                      'div',
                      { style: { width: '88px', height: '88px', borderRadius: '50%', flex: 'none', background: 'conic-gradient(var(--dshqn-accent) 0 ' + score + '%, var(--dsw-alias-bg-layer-2) ' + score + '% 100%)', display: 'grid', placeItems: 'center' } },
                      h('div', { style: { width: '68px', height: '68px', borderRadius: '50%', background: 'var(--dsw-alias-bg-layer-1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } },
                        h('strong', { style: { fontSize: '22px', lineHeight: 1 } }, String(score)),
                        h('span', { style: { fontSize: '10px', color: 'var(--dsw-alias-label-secondary)' } }, t('optimizerScore'))),
                    ),
                    h(
                      'div',
                      { style: { flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: 'var(--dsw-alias-label-secondary)' } },
                      h('div', null, t('optimizerCacheBar') + ' ' + Math.round(efficiency ? efficiency.components.cacheScore : 0)),
                      h('div', null, t('optimizerCostBar') + ' ' + Math.round(efficiency ? efficiency.components.costScore : 0)),
                      h('div', null, t('optimizerOutputBar') + ' ' + Math.round(efficiency ? efficiency.components.outputScore : 0)),
                      h('div', { style: { height: '8px', borderRadius: '999px', background: 'var(--dsw-alias-bg-layer-2)', overflow: 'hidden' } },
                        h('div', { style: { width: Math.min(100, Math.max(2, cacheHitPct)) + '%', height: '100%', background: cacheHitPct >= targetHitPct ? 'var(--dshqn-accent)' : 'var(--dsw-alias-state-warn-primary)' } })),
                      h('div', null, t('optimizerCacheHit') + ' ' + cacheHitPct + '% / ' + t('optimizerTarget') + ' ' + targetHitPct + '%'),
                    ),
                  ),
                  h(
                    'div',
                    { style: { border: '1px solid var(--dsw-alias-border-l1)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' } },
                    h('div', { style: { width: '104px', height: '104px', borderRadius: '50%', flex: 'none', background: 'conic-gradient(' + costGradient + ')', display: 'grid', placeItems: 'center' } },
                      h('div', { style: { width: '72px', height: '72px', borderRadius: '50%', background: 'var(--dsw-alias-bg-layer-1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' } },
                        h('strong', { style: { fontSize: '13px' } }, '¥' + Number(efficiency ? efficiency.totalCost : 0).toFixed(3)),
                        h('span', { style: { fontSize: '10px', color: 'var(--dsw-alias-label-secondary)' } }, t('optimizerCostBreakdown')),)),
                    h('div', { style: { width: '100%', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--dsw-alias-label-secondary)' } },
                      costSegments.map((segment) => h('div', { key: segment.key, style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                        h('span', { style: { width: '8px', height: '8px', borderRadius: '50%', background: segment.color, flex: 'none' } }),
                        h('span', { style: { flex: '1 1 auto', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, segment.label),
                        h('span', { style: { flex: 'none' } }, '¥' + segment.value.toFixed(3))))),
                  ),
                  h(
                    'div',
                    { style: { border: '1px solid var(--dsw-alias-border-l1)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' } },
                    h('div', { style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' } }, t('optimizerCostProjection')),
                    h('div', { style: { fontSize: '11px', color: 'var(--dsw-alias-label-secondary)' } }, t('optimizerCurrentCost') + ' ¥' + Number(efficiency ? efficiency.totalCost : 0).toFixed(3)),
                    h('div', { style: { height: '8px', borderRadius: '999px', background: 'var(--dsw-alias-bg-layer-2)', overflow: 'hidden' } },
                      h('div', { style: { width: '100%', height: '100%', background: 'var(--dshqn-accent)' } })),
                    h('div', { style: { fontSize: '11px', color: 'var(--dsw-alias-label-secondary)' } }, t('optimizerAfterCost') + ' ¥' + projectedCost.toFixed(3)),
                    h('div', { style: { height: '8px', borderRadius: '999px', background: 'var(--dsw-alias-bg-layer-2)', overflow: 'hidden' } },
                      h('div', { style: { width: Math.max(2, Math.round((projectedCost / Math.max(0.0001, Number(efficiency ? efficiency.totalCost : 0))) * 100)) + '%', height: '100%', background: 'var(--dshqn-accent)' } })),
                    h('div', { style: { fontSize: '11px', fontWeight: '600', color: 'var(--dshqn-accent)' } }, fillTemplate(t('optimizerProjectionSaving'), { percent: projectionSavingPct, amount: cacheSaving.toFixed(3) })),
                  ),
                ),
                h(
                  'div',
                  { key: 'workspaceBars', style: { border: '1px solid var(--dsw-alias-border-l1)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' } },
                  h('div', { style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' } }, t('optimizerWorkspaceCostBars')),
                  h(OptimizerWorkspaceBars, { rows: usage && Array.isArray(usage.workspaces) ? usage.workspaces : [] }),
                ),
                savingsOpen
                  ? h(
                      'div',
                      { key: 'savingsDetail', style: { border: '1px solid var(--dsw-alias-border-l1)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' } },
                      h('div', { style: { fontSize: '13px', fontWeight: '600' } }, t('optimizerSavingsFormulaTitle')),
                      savingsRows.map((row, index) =>
                        h('div', { key: index, style: { display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '12px' } },
                          h('span', { style: { color: 'var(--dsw-alias-label-secondary)' } }, row[0]),
                          h('strong', null, row[1])),
                      ),
                      h('div', { style: { fontSize: '11px', color: 'var(--dsw-alias-label-secondary)', wordBreak: 'break-word' } },
                        t('optimizerSavingsFormula') + '：' + inputTokens + ' × ' + hitGain.toFixed(3) + ' × ¥' + priceGap.toFixed(2) + ' ÷ 1,000,000 = ¥' + cacheSaving.toFixed(3)),
                    )
                  : null,
                h(
                  'div',
                  { key: 'metrics', style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
                  metric(t('optimizerCacheHit'), Math.round((totals ? totals.cacheHitRate : 0) * 100) + '%', t('optimizerTarget') + ' ' + Math.round((efficiency ? efficiency.targetCacheHit : 0.7) * 100) + '%'),
                  metric(t('optimizerTodayCost'), '¥' + Number(efficiency ? efficiency.todayCost : 0).toFixed(3)),
                  metric(t('optimizerWeekCost'), '¥' + Number(efficiency ? efficiency.weekCost : 0).toFixed(3)),
                  metric(t('optimizerAvgCost'), '¥' + Number(efficiency ? efficiency.avgCostPerSession : 0).toFixed(3)),
                  metric(t('optimizerOutputRatio'), Math.round((totals ? efficiency.outputRatio : 0) * 100) + '%'),
                  metric(t('optimizerTotalTokens'), totals ? String(totals.totalTokens) : '0', '¥' + Number(efficiency ? efficiency.totalCost : 0).toFixed(3)),
                ),
                h(
                  'div',
                  { key: 'budget', style: { border: '1px solid var(--dsw-alias-border-l1)', borderRadius: '10px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' } },
                  h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } }, [
                    h('strong', { key: 'label', style: { fontSize: '13px' } }, t('optimizerBudget')),
                    h('input', {
                      key: 'input',
                      className: 'dshqn-field',
                      type: 'number',
                      min: 0,
                      step: 1,
                      value: budgetDraft,
                      placeholder: '0',
                      style: { width: '110px' },
                      'aria-label': t('optimizerBudget'),
                      onChange: (event) => setBudgetDraft(event.target.value),
                    }),
                    h('button', { key: 'save', type: 'button', className: 'dshqn-button', onClick: saveBudget }, t('optimizerBudgetSave')),
                  ]),
                  budget > 0 && efficiency
                    ? [
                        h(
                          'div',
                          { key: 'bar', style: { height: '8px', borderRadius: '999px', background: 'var(--dsw-alias-bg-layer-2)', overflow: 'hidden' } },
                          h('div', { style: { width: Math.min(100, Math.max(2, budgetUsed)) + '%', height: '100%', background: budgetOver ? 'var(--dshqn-danger)' : 'var(--dshqn-accent)' } }),
                        ),
                        h(
                          'div',
                          { key: 'text', style: { fontSize: '12px', color: budgetOver ? 'var(--dshqn-danger)' : 'var(--dsw-alias-label-secondary)' } },
                          budgetOver
                            ? fillTemplate(t('optimizerBudgetOver'), { used: Number(efficiency.todayCost).toFixed(3), budget: budget.toFixed(2) })
                            : fillTemplate(t('optimizerBudgetUsage'), { used: Number(efficiency.todayCost).toFixed(3), budget: budget.toFixed(2), percent: Math.round(budgetUsed) }),
                        ),
                      ]
                    : h('span', { key: 'hint', style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' } }, t('optimizerBudgetHint')),
                ),
                h(
                  'div',
                  { key: 'monthly-budget', style: { border: '1px solid var(--dsw-alias-border-l1)', borderRadius: '10px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' } },
                  h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } }, [
                    h('strong', { key: 'label', style: { fontSize: '13px' } }, t('optimizerMonthlyBudget')),
                    h('input', {
                      key: 'input',
                      className: 'dshqn-field',
                      type: 'number',
                      min: 0,
                      step: 1,
                      value: monthlyDraft,
                      placeholder: '0',
                      style: { width: '110px' },
                      'aria-label': t('optimizerMonthlyBudget'),
                      onChange: (event) => setMonthlyDraft(event.target.value),
                    }),
                    h('button', { key: 'save', type: 'button', className: 'dshqn-button', onClick: saveMonthlyBudget }, t('optimizerBudgetSave')),
                  ]),
                  monthlyBudget > 0 && efficiency
                    ? [
                        h(
                          'div',
                          { key: 'bar', style: { height: '8px', borderRadius: '999px', background: 'var(--dsw-alias-bg-layer-2)', overflow: 'hidden' } },
                          h('div', { style: { width: Math.min(100, Math.max(2, monthlyUsed)) + '%', height: '100%', background: monthlyOver ? 'var(--dshqn-danger)' : 'var(--dshqn-accent)' } }),
                        ),
                        h(
                          'div',
                          { key: 'text', style: { fontSize: '12px', color: monthlyOver ? 'var(--dshqn-danger)' : 'var(--dsw-alias-label-secondary)' } },
                          fillTemplate(t('optimizerMonthlyUsage'), {
                            used: Number(efficiency.monthToDateCost || 0).toFixed(2),
                            budget: monthlyBudget.toFixed(2),
                            percent: Math.round(monthlyUsed),
                          }),
                        ),
                      ]
                    : null,
                  daily30.length > 0
                    ? h(
                        'div',
                        { key: 'trends', style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' } },
                        h(
                          'div',
                          { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
                          h('div', { style: { display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' } },
                            h('span', null, t('optimizerMonthlyCurve')),
                            h('span', null, t('optimizerLatest') + ' ¥' + Number(daily30[daily30.length - 1].cost || 0).toFixed(3))),
                          h(OptimizerLineChart, { values: actual30.length > 0 ? actual30 : daily30.map((day) => day.cost), secondaryValues: actual30.length > 0 ? baseline30 : [], maxValue: Math.max(...(actual30.length > 0 ? actual30 : daily30.map((day) => Number(day.cost) || 0)), ...(actual30.length > 0 ? baseline30 : [0])) * 1.1, ariaLabel: t('optimizerMonthlyCurve') }),
                          h('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '10px', color: 'var(--dsw-alias-label-secondary)' } },
                            h('span', { style: { color: 'var(--dshqn-accent)' } }, '● ' + t('optimizerActualCost')),
                            h('span', { style: { color: 'var(--dsw-alias-state-warn-primary)' } }, '┄ ' + t('optimizerBaselineCost')),
                            h('span', null, t('optimizerCumulativeSaved') + ' ¥' + cumulativeSaved.toFixed(3)),
                          ),
                          h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--dsw-alias-label-secondary)' } },
                            h('span', null, new Date(daily30[0].at).toLocaleDateString()),
                            h('span', null, new Date(daily30[daily30.length - 1].at).toLocaleDateString())),
                        ),
                        h(
                          'div',
                          { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
                          h('div', { style: { display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' } },
                            h('span', null, t('optimizerCacheTrend30')),
                            h('span', null, t('optimizerLatest') + ' ' + Math.round(Number(daily30[daily30.length - 1].cacheHitRate || 0) * 100) + '%')),
                          h(OptimizerLineChart, { values: daily30.map((day) => (typeof day.cacheHitRate === 'number' ? day.cacheHitRate : 0)), maxValue: 1, target: efficiency ? efficiency.targetCacheHit : 0.7, ariaLabel: t('optimizerCacheTrend30') }),
                          h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--dsw-alias-label-secondary)' } },
                            h('span', null, new Date(daily30[0].at).toLocaleDateString()),
                            h('span', { style: { color: 'var(--dsw-alias-state-warn-primary)' } }, t('optimizerTarget') + ' ' + Math.round((efficiency ? efficiency.targetCacheHit : 0.7) * 100) + '%')),
                        ),
                      )
                    : null,
                ),
                h(
                  'div',
                  { key: 'webhook', style: { border: '1px solid var(--dsw-alias-border-l1)', borderRadius: '10px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' } },
                  h('strong', { style: { fontSize: '13px' } }, t('optimizerWebhook')),
                  h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } }, [
                    h('input', {
                      key: 'input',
                      className: 'dshqn-field',
                      type: 'url',
                      value: webhookDraft,
                      placeholder: 'https://example.com/webhook',
                      style: { flex: '1 1 240px' },
                      'aria-label': t('optimizerWebhook'),
                      onChange: (event) => setWebhookDraft(event.target.value),
                    }),
                    h('button', { key: 'save', type: 'button', className: 'dshqn-button', onClick: saveWebhook }, t('optimizerWebhookSave')),
                    h('span', { key: 'template-label', style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' } }, t('optimizerWebhookTemplate')),
                    h(
                      'select',
                      { key: 'template', className: 'dshqn-field', value: webhookTemplateDraft, 'aria-label': t('optimizerWebhookTemplate'), onChange: (event) => changeWebhookTemplate(event.target.value) },
                      h('option', { value: 'generic' }, t('optimizerWebhookGeneric')),
                      h('option', { value: 'slack' }, t('optimizerWebhookSlack')),
                      h('option', { value: 'feishu' }, t('optimizerWebhookFeishu')),
                    ),
                    h('button', { key: 'test', type: 'button', className: 'dshqn-button', onClick: testWebhook, disabled: busy }, t('optimizerWebhookTest')),
                  ]),
                  h('span', { style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' } }, t('optimizerWebhookHint')),
                ),
                h(
                  'div',
                  { key: 'report-range', style: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', fontSize: '12px' } },
                  h('span', { style: { color: 'var(--dsw-alias-label-secondary)' } }, t('optimizerReportRange')),
                  h('input', { className: 'dshqn-field', type: 'date', value: fromDraft, 'aria-label': t('optimizerReportFrom'), onChange: (event) => setFromDraft(event.target.value) }),
                  h('span', { style: { color: 'var(--dsw-alias-label-secondary)' } }, '~'),
                  h('input', { className: 'dshqn-field', type: 'date', value: toDraft, 'aria-label': t('optimizerReportTo'), onChange: (event) => setToDraft(event.target.value) }),
                ),
                h('div', { key: 'saving', style: { fontSize: '13px' } }, t('optimizerCacheSaving') + '：¥' + Number(efficiency ? efficiency.cacheSaving : 0).toFixed(3)),
                h('div', { key: 'daily' }, h('div', { style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' } }, t('optimizerDaily')), h(OptimizerDailyBars, { daily, t })),
                h(
                  'div',
                  { key: 'sessions', style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
                  h('div', { style: { fontSize: '13px', fontWeight: '600' } }, t('optimizerTopSessions')),
                  (usage.topSessions || []).slice(0, 6).map((session) =>
                    h(
                      'button',
                      {
                        key: session.sessionId,
                        type: 'button',
                        className: 'dshqn-optimizer-session',
                        title: t('optimizerOpenSession'),
                        style: { display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', flexWrap: 'wrap', background: 'transparent', border: 0, padding: 0, color: 'inherit', cursor: 'pointer', textAlign: 'left' },
                        onClick: () => openSession(session.sessionId),
                      },
                      h('span', { style: { fontWeight: '600' } }, session.workspace),
                      h('span', { className: 'dshqn-stat' }, String(session.totalTokens) + ' tokens'),
                      h('span', { style: { color: 'var(--dsw-alias-label-secondary)' } }, '¥' + Number(session.cost).toFixed(3)),
                    ),
                  ),
                ),
                h(
                  'div',
                  { key: 'workspace-drill', style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
                  h('div', { style: { fontSize: '13px', fontWeight: '600' } }, t('optimizerWorkspaces')),
                  h('div', { style: { fontSize: '11px', color: 'var(--dsw-alias-label-secondary)' } }, t('optimizerWorkspaceHint')),
                  (usage.workspaces || []).slice(0, 8).map((workspace) =>
                    h(
                      'button',
                      {
                        key: workspace.title,
                        type: 'button',
                        className: 'dshqn-filter' + (activeWorkspace === workspace.title ? ' dshqn-filter-active' : ''),
                        style: { justifyContent: 'space-between', display: 'flex', width: '100%' },
                        onClick: () => setActiveWorkspace(activeWorkspace === workspace.title ? '' : workspace.title),
                      },
                      h('span', {}, workspace.title),
                      h('span', { style: { fontSize: '11px' } }, '¥' + Number(workspace.cost).toFixed(3) + ' · ' + workspace.totalTokens + ' tokens'),
                    ),
                  ),
                  activeWorkspace
                    ? h(
                        'div',
                        { style: { marginTop: '6px', padding: '8px 10px', background: 'var(--dsw-alias-bg-layer-2)', borderRadius: '8px' } },
                        h('div', { style: { fontSize: '12px', fontWeight: '600' } }, t('optimizerWorkspaceSessions')),
                        (usage.topSessions || [])
                          .filter((session) => session.workspace === activeWorkspace)
                          .slice(0, 6)
                          .map((session) =>
                            h(
                              'button',
                              {
                                key: session.sessionId,
                                type: 'button',
                                className: 'dshqn-optimizer-session',
                                title: t('optimizerOpenSession'),
                                style: { display: 'block', background: 'transparent', border: 0, padding: 0, color: 'inherit', cursor: 'pointer', textAlign: 'left', fontSize: '11px', color: 'var(--dsw-alias-label-secondary)' },
                                onClick: () => openSession(session.sessionId),
                              },
                              session.sessionId + ' · ' + session.totalTokens + ' tokens · ¥' + Number(session.cost).toFixed(3),
                            ),
                          ),
                      )
                    : null,
                ),
                h(
                  'div',
                  { key: 'recs', style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                  h('div', { style: { fontSize: '13px', fontWeight: '600' } }, t('optimizerRecommendations')),
                  (efficiency ? efficiency.recommendations : []).map((rec) =>
                    h(
                      'div',
                      { key: rec.id, style: { borderLeft: '3px solid ' + (rec.severity === 'high' ? 'var(--dshqn-danger)' : 'var(--dshqn-accent)'), padding: '6px 10px', background: 'var(--dsw-alias-bg-layer-2)', borderRadius: '6px' } },
                      h('div', { style: { fontSize: '13px', fontWeight: '600' } }, rec.title),
                      h('div', { style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)', marginTop: '2px', whiteSpace: 'pre-wrap' } }, rec.detail),
                      rec.saving !== undefined && Number(rec.saving) > 0
                        ? h('div', { style: { fontSize: '11px', color: 'var(--dshqn-accent)', marginTop: '2px' } }, fillTemplate(t('optimizerRecommendationSaving'), { amount: Number(rec.saving).toFixed(3) }))
                        : null,
                    ),
                  ),
                ),
              ],
        ),
        h(
          'section',
          { className: 'dshqn-card', style: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' } },
          h('div', { className: 'dshqn-section-head' }, h('span', { className: 'dshqn-section-mark' }), h('h2', { style: { fontSize: '15px', margin: 0 } }, t('optimizerCleanupTitle'))),
          h('p', { className: 'dshqn-hint' }, t('optimizerCleanupHint')),
          cleanup !== null && cleanup.schedule !== undefined
            ? h(
                'p',
                { className: 'dshqn-settings-hint' },
                fillTemplate(t('optimizerScheduleLast'), { time: cleanup.schedule.lastRunAt ? new Date(cleanup.schedule.lastRunAt).toLocaleString() : '-' }) +
                  ' · ' +
                  fillTemplate(t('optimizerScheduleNext'), { time: cleanup.schedule.nextRunAt ? new Date(cleanup.schedule.nextRunAt).toLocaleString() : '-' }),
              )
            : null,
          h(
            'div',
            { className: 'dshqn-toolbar' },
            h('button', { type: 'button', className: 'dshqn-button', onClick: scan, disabled: busy }, busy ? t('optimizerScanning') : t('optimizerScan')),
            h('button', { type: 'button', className: 'dshqn-button', onClick: clean, disabled: busy || selectedCount === 0 }, busy ? t('optimizerCleaning') : t('optimizerCleanSelected')),
            cleanup !== null
              ? h('span', { className: 'dshqn-settings-hint' }, fillTemplate(t('optimizerRoots'), { count: Array.isArray(cleanup.workspaceRoots) ? cleanup.workspaceRoots.length : 0 }) + ' · ' + fillTemplate(t('optimizerScanned'), { count: cleanup.scannedFiles }) + ' · ' + formatBytes(cleanup.totals.bytes))
              : null,
          ),
          h(
            'div',
            { className: 'dshqn-toolbar', style: { gap: '8px' } },
            h('span', { className: 'dshqn-settings-hint' }, t('optimizerSchedule')),
            h(
              'select',
              { className: 'dshqn-field', value: scheduleDraft, style: { width: '120px' }, 'aria-label': t('optimizerSchedule'), onChange: (event) => changeSchedule(event.target.value) },
              h('option', { value: 'off' }, t('optimizerScheduleOff')),
              h('option', { value: 'daily' }, t('optimizerScheduleDaily')),
              h('option', { value: 'weekly' }, t('optimizerScheduleWeekly')),
              h('option', { value: 'cron' }, t('optimizerScheduleCron')),
            ),
            scheduleDraft === 'cron'
              ? h('input', { className: 'dshqn-field', type: 'text', value: cronDraft, placeholder: '0 3 * * 1', title: t('optimizerScheduleCronHint'), 'aria-label': t('optimizerScheduleCron'), onChange: (event) => changeCron(event.target.value) })
              : null,
            scheduleDraft === 'cron' ? h('button', { type: 'button', className: 'dshqn-button', onClick: previewCron, disabled: busy }, t('optimizerCronPreview')) : null,
            scheduleDraft === 'cron' ? h('button', { type: 'button', className: 'dshqn-button', onClick: previewMulti, disabled: busy }, t('optimizerCronMulti')) : null,
            scheduleDraft === 'cron'
              ? h(
                  'select',
                  { className: 'dshqn-field', value: cronTimezoneDraft, 'aria-label': t('optimizerScheduleTimezone'), onChange: (event) => changeCronTimezone(event.target.value) },
                  h('option', { value: 'local' }, t('optimizerScheduleTimezone') + ' local'),
                  h('option', { value: 'UTC+8' }, 'UTC+8'),
                  h('option', { value: 'UTC+9' }, 'UTC+9'),
                  h('option', { value: 'UTC' }, 'UTC'),
                  h('option', { value: 'UTC-5' }, 'UTC-5'),
                  h('option', { value: 'Asia/Shanghai' }, 'Asia/Shanghai'),
                  h('option', { value: 'Asia/Tokyo' }, 'Asia/Tokyo'),
                  h('option', { value: 'Europe/London' }, 'Europe/London'),
                  h('option', { value: 'America/New_York' }, 'America/New_York'),
                )
              : null,
            scheduleDraft === 'cron' && cronPreview.length > 0
              ? h('span', { className: 'dshqn-settings-hint' }, t('optimizerCronNext') + '：' + cronPreview.map((at) => new Date(at).toLocaleString()).join(' | '))
              : null,
            scheduleDraft === 'cron' && multiPreview.length > 0
              ? h(
                  'div',
                  { className: 'dshqn-settings-hint' },
                  multiPreview.map((entry) =>
                    h('div', { key: entry.timezone }, entry.timezone + '：' + (entry.next || []).map((at) => new Date(at).toLocaleString()).join(' | ')),
                  ),
                )
              : null,
            h('span', { className: 'dshqn-settings-hint' }, t('optimizerScheduleTime')),
            h('input', { className: 'dshqn-field', type: 'time', value: scheduleTimeDraft, 'aria-label': t('optimizerScheduleTime'), onChange: (event) => changeScheduleTime(event.target.value) }),
            h('button', { type: 'button', className: 'dshqn-button', onClick: autoClean, disabled: busy }, t('optimizerAutoRun')),
            cleanup !== null && cleanup.trash !== undefined
              ? h('span', { className: 'dshqn-settings-hint' }, fillTemplate(t('optimizerTrash'), { count: cleanup.trash.maxRecords ? cleanup.trash.count + '/' + cleanup.trash.maxRecords : cleanup.trash.count, size: formatBytes(cleanup.trash.bytes) }))
              : null,
            cleanup !== null && cleanup.trash !== undefined && cleanup.trash.maxRecords > 0 && cleanup.trash.count / cleanup.trash.maxRecords >= 0.8
              ? h('span', { className: 'dshqn-settings-hint', style: { color: 'var(--dshqn-danger)' } }, t('optimizerTrashCapacityWarn'))
              : null,
            h('button', { type: 'button', className: 'dshqn-button', onClick: emptyTrash, disabled: busy || cleanup === null || !cleanup.trash || cleanup.trash.count === 0 }, t('optimizerTrashEmpty')),
          ),
          cleanup !== null && cleanup.trash && Array.isArray(cleanup.trash.records) && cleanup.trash.records.length > 0
            ? h(
                'div',
                { style: { border: '1px solid var(--dsw-alias-border-l1)', borderRadius: '10px', padding: '10px 12px' } },
                h('div', { style: { fontSize: '13px', fontWeight: '600' } }, t('optimizerTrashRecords')),
                h(
                  'div',
                  { className: 'dshqn-toolbar' },
                  h('input', {
                    className: 'dshqn-field',
                    type: 'search',
                    value: trashQuery,
                    placeholder: t('optimizerTrashSearch'),
                    'aria-label': t('optimizerTrashSearch'),
                    onChange: (event) => {
                      setTrashQuery(event.target.value);
                      setTrashPage(0);
                    },
                  }),
                  h('button', { type: 'button', className: 'dshqn-button', onClick: restoreTrashSelected, disabled: busy || Object.keys(selectedTrash).filter((key) => selectedTrash[key]).length === 0 }, t('optimizerTrashRestore')),
                ),
                h(
                  'div',
                  { className: 'dshqn-toolbar' },
                  trashTypeOptions.map((option) =>
                    h(
                      'button',
                      {
                        key: option.id,
                        type: 'button',
                        className: 'dshqn-filter' + (trashType === option.id ? ' dshqn-filter-active' : ''),
                        onClick: () => {
                          setTrashType(option.id);
                          setTrashPage(0);
                        },
                      },
                      option.label,
                    ),
                  ),
                  h(
                    'select',
                    { className: 'dshqn-field', value: trashWorkspace, 'aria-label': t('optimizerTrashWorkspace'), onChange: (event) => { setTrashWorkspace(event.target.value); setTrashPage(0); } },
                    h('option', { value: 'all' }, t('optimizerTrashWorkspaceAll')),
                    [...new Set(cleanup.trash.records.flatMap((record) => (Array.isArray(record.roots) ? record.roots : [])))].map((root) => h('option', { key: root, value: root }, root)),
                  ),
                ),
                h(
                  'div',
                  { className: 'dshqn-toolbar' },
                  h('span', { className: 'dshqn-settings-hint' }, t('optimizerPresets')),
                  h('button', { type: 'button', className: 'dshqn-button', onClick: () => { setTrashType('all'); setTrashWorkspace('all'); setTrashQuery(''); setTrashPage(0); } }, t('optimizerPresetAll')),
                  h('button', { type: 'button', className: 'dshqn-button', onClick: () => { setTrashType('attachments'); setTrashWorkspace('all'); setTrashPage(0); } }, t('optimizerPresetAttachments')),
                  h('button', { type: 'button', className: 'dshqn-button', onClick: () => { setTrashType('temp'); setTrashWorkspace('all'); setTrashPage(0); } }, t('optimizerPresetTemp')),
                  h('button', { type: 'button', className: 'dshqn-button', onClick: () => { setTrashType('builds'); setTrashWorkspace('all'); setTrashPage(0); } }, t('optimizerPresetBuilds')),
                ),
                h(
                  'div',
                  { className: 'dshqn-toolbar' },
                  h('input', { className: 'dshqn-field', type: 'text', value: presetNameDraft, placeholder: t('optimizerPresetName'), 'aria-label': t('optimizerPresetName'), onChange: (event) => setPresetNameDraft(event.target.value) }),
                  h('button', { type: 'button', className: 'dshqn-button', onClick: saveTrashPreset, disabled: busy || presetNameDraft.trim().length === 0 }, t('optimizerPresetSave')),
                  (Array.isArray(props.trashPresets) ? props.trashPresets : []).map((preset, index) =>
                    h(
                      'span',
                      { key: preset.name + '#' + index, style: { display: 'inline-flex', alignItems: 'center', gap: '2px' } },
                      h(
                        'button',
                        {
                          type: 'button',
                          className: 'dshqn-button',
                          onClick: () => {
                            setTrashType(preset.type || 'all');
                            setTrashWorkspace(preset.workspace || 'all');
                            setTrashQuery(preset.query || '');
                            setTrashPage(0);
                          },
                        },
                        preset.name,
                      ),
                      h('button', { type: 'button', className: 'dshqn-button', title: t('optimizerPresetDelete'), onClick: () => deleteTrashPreset(index) }, '×'),
                      h('button', { type: 'button', className: 'dshqn-button', title: t('optimizerPresetMoveUp'), onClick: () => movePreset(index, -1), disabled: index === 0 }, '↑'),
                      h('button', { type: 'button', className: 'dshqn-button', title: t('optimizerPresetMoveDown'), onClick: () => movePreset(index, 1), disabled: index === (Array.isArray(props.trashPresets) ? props.trashPresets.length : 0) - 1 }, '↓'),
                    ),
                  ),
                ),
                pageTrashRecords.map((record) =>
                  h(
                    'label',
                    { key: record.id, style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', flexWrap: 'wrap', marginTop: '4px' } },
                    h('input', {
                      type: 'checkbox',
                      checked: Boolean(selectedTrash[record.id]),
                      disabled: record.expiresAt !== null && record.expiresAt < Date.now(),
                      onChange: (event) => setSelectedTrash({ ...selectedTrash, [record.id]: event.target.checked }),
                    }),
                    h('span', {}, new Date(record.createdAt || 0).toLocaleString()),
                    h('span', { className: 'dshqn-settings-hint' }, formatBytes(record.bytes) + ' · ' + record.removed + ' ' + t('optimizerFiles')),
                    record.expiresAt ? h('span', { className: 'dshqn-settings-hint' }, fillTemplate(t('optimizerTrashRemaining'), { hours: Math.max(1, Math.round((record.expiresAt - Date.now()) / 3600000)) })) : null,
                  ),
                ),
                h(
                  'div',
                  { className: 'dshqn-toolbar' },
                  h('button', { type: 'button', className: 'dshqn-button', onClick: () => setTrashPage(Math.max(0, currentTrashPage - 1)), disabled: currentTrashPage <= 0 }, '‹'),
                  h('span', { className: 'dshqn-settings-hint' }, (currentTrashPage + 1) + ' / ' + trashPageCount),
                  h('button', { type: 'button', className: 'dshqn-button', onClick: () => setTrashPage(Math.min(trashPageCount - 1, currentTrashPage + 1)), disabled: currentTrashPage >= trashPageCount - 1 }, '›'),
                ),
              )
            : null,
          cleanup !== null && cleanup.webhookQueue && cleanup.webhookQueue.count > 0
            ? h(
                'div',
                { style: { border: '1px solid var(--dsw-alias-border-l1)', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
                h('strong', { style: { fontSize: '13px' } }, t('optimizerWebhookQueue') + '：' + cleanup.webhookQueue.count),
                h('span', { className: 'dshqn-settings-hint' }, cleanup.webhookQueue.items.map((item) => item.lastError || '').join(' | ')),
                h(
                  'div',
                  { style: { display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' } },
                  h('textarea', {
                    className: 'dshqn-body',
                    style: { minHeight: '40px', fontSize: '11px', flex: '1 1 240px' },
                    value: webhookBatchDraft,
                    placeholder: t('optimizerWebhookBatch'),
                    'aria-label': t('optimizerWebhookBatch'),
                    onChange: (event) => setWebhookBatchDraft(event.target.value),
                  }),
                  h('button', { type: 'button', className: 'dshqn-button', onClick: () => batchWebhook('webhook-batch-edit'), disabled: busy }, t('optimizerWebhookBatchApply')),
                  h('button', { type: 'button', className: 'dshqn-button', onClick: () => batchWebhook('webhook-batch-resend'), disabled: busy }, t('optimizerWebhookBatchResend')),
                  h('button', { type: 'button', className: 'dshqn-button', onClick: () => batchWebhook('webhook-batch-remove'), disabled: busy }, t('optimizerWebhookBatchRemove')),
                  h('button', { type: 'button', className: 'dshqn-button', onClick: exportWebhookQueue, disabled: busy }, t('optimizerWebhookExport')),
                  h('button', { type: 'button', className: 'dshqn-button', onClick: importWebhookQueue, disabled: busy }, t('optimizerWebhookImport')),
                ),
                cleanup.webhookQueue.items.map((item) =>
                  h(
                    'div',
                    { key: item.at, style: { fontSize: '11px' } },
                    h('input', { type: 'checkbox', checked: Boolean(selectedWebhook[item.at]), onChange: (event) => setSelectedWebhook({ ...selectedWebhook, [item.at]: event.target.checked }) }),
                    h('span', {}, (item.url || '') + ' · ' + (item.lastError || '') + ' '),
                    h('button', { type: 'button', className: 'dshqn-button', onClick: () => resendWebhook(item.at), disabled: busy }, t('optimizerWebhookResend')),
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'dshqn-button',
                        onClick: () => {
                          setWebhookEditAt(item.at);
                          setWebhookEditDraft(JSON.stringify(item.payload || {}, null, 2));
                        },
                        disabled: busy,
                      },
                      t('optimizerWebhookEdit'),
                    ),
                    h('button', { type: 'button', className: 'dshqn-button', onClick: () => removeWebhook(item.at), disabled: busy }, '×'),
                    webhookEditAt === item.at
                      ? h(
                          'div',
                          { style: { marginTop: '4px' } },
                          h('textarea', { className: 'dshqn-body', style: { minHeight: '60px', fontSize: '11px' }, value: webhookEditDraft, onChange: (event) => setWebhookEditDraft(event.target.value) }),
                          h('button', { type: 'button', className: 'dshqn-button', onClick: saveWebhookEdit, disabled: busy }, t('optimizerWebhookEditSave')),
                        )
                      : null,
                  ),
                ),
                h('button', { type: 'button', className: 'dshqn-button', onClick: retryWebhookQueue, disabled: busy }, t('optimizerWebhookRetry')),
              )
            : null,
          cleanup !== null && Array.isArray(cleanup.shareStats) && filteredShareStats.length > 0
            ? h(
                'div',
                { style: { border: '1px solid var(--dsw-alias-border-l1)', borderRadius: '10px', padding: '10px 12px' } },
                h('div', { style: { fontSize: '13px', fontWeight: '600' } }, t('optimizerShareStats') + '（' + filteredShareStats.length + '）'),
                h('button', { type: 'button', className: 'dshqn-button', onClick: exportShareCsv, disabled: busy }, t('optimizerShareCsv')),
                h('button', { type: 'button', className: 'dshqn-button', onClick: exportSharePng, disabled: busy }, t('optimizerSharePng')),
                filteredShareStats.slice(0, 10).map((entry) => {
                  const maxCount = Math.max(1, ...filteredShareStats.map((item) => item.count || 0));
                  const refs = entry.refs && typeof entry.refs === 'object' ? Object.entries(entry.refs) : [];
                  return h(
                    'div',
                    { key: entry.name, style: { marginTop: '2px' } },
                    h(
                      'div',
                      { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--dsw-alias-label-secondary)' } },
                      h('span', { style: { flex: '0 0 180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, entry.name),
                      h('span', { style: { flex: '1 1 120px', height: '8px', borderRadius: '999px', background: 'var(--dsw-alias-bg-layer-2)', overflow: 'hidden' } }, h('span', { style: { display: 'block', width: Math.max(4, Math.round(((entry.count || 0) / maxCount) * 100)) + '%', height: '100%', background: 'var(--dshqn-accent)' } })),
                      h('span', {}, entry.count + ' 次'),
                      refs.length > 0 ? h('span', {}, t('optimizerShareRefs') + '：' + refs.map(([key, value]) => key + ' ' + value).join(', ')) : null,
                    ),
                  );
                }),
              )
            : null,
          categories.length === 0
            ? h('p', { className: 'dshqn-hint' }, t('optimizerNothing'))
            : categories.map((category) =>
                h(
                  'div',
                  { key: category.id, style: { border: '1px solid var(--dsw-alias-border-l1)', borderRadius: '10px', padding: '10px 12px' } },
                  h(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
                    h('input', {
                      type: 'checkbox',
                      checked: Boolean(selected[category.id]),
                      disabled: category.deletable === false,
                      onChange: (event) => setSelected({ ...selected, [category.id]: event.target.checked }),
                      'aria-label': optimizerCategoryLabel(category, t),
                    }),
                    h('strong', { style: { fontSize: '13px' } }, optimizerCategoryLabel(category, t)),
                    h('span', { className: 'dshqn-stat' }, category.count + ' ' + t('optimizerFiles') + ' · ' + formatBytes(category.bytes)),
                    h('span', { className: 'dshqn-settings-hint' }, category.deletable === false ? t('optimizerReportOnly') : category.safe ? t('optimizerSafe') : t('optimizerCaution')),
                  ),
                  category.hint ? h('div', { style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)', marginTop: '4px' } }, category.hint) : null,
                  category.items.length > 0
                    ? h(
                        'div',
                        { style: { marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '2px' } },
                        category.items.slice(0, 4).map((item) =>
                          h('div', { key: item.path, style: { fontSize: '11px', color: 'var(--dsw-alias-label-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, item.rel + ' · ' + formatBytes(item.bytes)),
                        ),
                      )
                    : null,
                ),
              ),
          cleanup !== null && Array.isArray(cleanup.history) && cleanup.history.length > 0
            ? h(
                'div',
                { style: { borderTop: '1px solid var(--dsw-alias-border-l1)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' } },
                h('div', { style: { fontSize: '13px', fontWeight: '600' } }, t('optimizerHistory')),
                cleanup.history.slice(0, 5).map((entry) =>
                  h(
                    'div',
                    { key: entry.at, style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' } },
                    fillTemplate(t('optimizerHistoryLine'), {
                      time: new Date(entry.at).toLocaleString(),
                      removed: entry.removed,
                      freed: formatBytes(entry.freed),
                    }),
                    entry.recoverable === true && typeof entry.expiresAt === 'number' && entry.expiresAt > Date.now()
                      ? h('span', { style: { marginLeft: '6px', fontSize: '11px', color: 'var(--dsw-alias-label-secondary)' } }, fillTemplate(t('optimizerTrashRemaining'), { hours: Math.max(1, Math.round((entry.expiresAt - Date.now()) / 3600000)) }))
                      : null,
                    entry.recoverable === true && typeof entry.expiresAt === 'number' && entry.expiresAt > Date.now()
                      ? h('button', { type: 'button', className: 'dshqn-button dshqn-optimizer-undo', style: { marginLeft: '6px', padding: '2px 8px' }, disabled: busy, onClick: () => undoCleanup(entry.id) }, t('optimizerUndo'))
                      : h('span', { style: { marginLeft: '6px' } }, '· ' + t('optimizerHistoryNoUndo')),
                    entry.auto === true ? h('span', { style: { marginLeft: '6px', fontSize: '11px', color: 'var(--dsw-alias-label-secondary)' } }, '· ' + t('optimizerAutoTag')) : null,
                    Array.isArray(entry.hints) && entry.hints.length > 0
                      ? h('div', { style: { marginTop: '2px', color: 'var(--dsw-alias-label-secondary)', fontSize: '11px' } }, entry.hints.join(' '))
                      : null,
                  ),
                ),
              )
            : null,
        ),
      );
    }

    /** Independent schedule page: auto-clean history, next run, and retry. */
    function ScheduleLogContent(props) {
      const t = props.t;
      const [scan, setScan] = React.useState(null);
      const [busy, setBusy] = React.useState(false);
      const [notice, setNotice] = React.useState('');
      const load = () => {
        postProtected(CLEANUP_URL, { action: 'scan' })
          .then((payload) => setScan(payload))
          .catch(() => setScan(null));
      };
      React.useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      const runAuto = () => {
        if (busy) return;
        setBusy(true);
        setNotice('');
        postProtected(CLEANUP_URL, { action: 'auto' })
          .then((result) => {
            setNotice(fillTemplate(t('optimizerAutoDone'), { removed: result.removed, freed: formatBytes(result.freed) }));
            load();
          })
          .catch(() => setNotice(t('optimizerFailed')))
          .finally(() => setBusy(false));
      };
      const schedule = scan && scan.schedule ? scan.schedule : null;
      const runs = schedule && Array.isArray(schedule.runs) ? schedule.runs : [];
      const mode = (schedule && schedule.mode) || props.scheduleMode || 'off';
      const lastRun = runs.length > 0 ? runs[0] : null;
      const totalRemoved = runs.reduce((sum, run) => sum + (Number(run.removed) || 0), 0);
      const totalFreed = runs.reduce((sum, run) => sum + (Number(run.freed) || 0), 0);
      const successRuns = runs.filter((run) => run.ok !== false && !(Number(run.errors) > 0)).length;
      return h(
        'div',
        { className: 'dshqn-page' },
        h('style', { key: 'styles' }, STYLES + '\n' + STYLE_UPGRADES),
        h(
          'header',
          { className: 'dshqn-header' },
          h('span', { className: 'dshqn-header-icon', 'aria-hidden': true }, h(Icon, { name: 'spark', size: 18 })),
          h('div', { className: 'dshqn-headings' }, h('h1', { className: 'dshqn-title' }, t('scheduleLogTitle')), h('p', { className: 'dshqn-subtitle' }, t('scheduleLogHint'))),
          h('span', { style: { flex: '1 1 auto' } }),
          h('button', { type: 'button', className: 'dshqn-button', onClick: runAuto, disabled: busy }, t('optimizerAutoRun')),
        ),
        notice.length > 0 ? h('p', { className: 'dshqn-hint' }, notice) : null,
        h(
          'div',
          { className: 'dshqn-kpi-grid' },
          h(
            'div',
            { className: 'dshqn-kpi' },
            h('span', { className: 'dshqn-kpi-value' }, schedule && schedule.nextRunAt ? new Date(schedule.nextRunAt).toLocaleString() : '—'),
            h('span', { className: 'dshqn-kpi-label' }, t('scheduleNextRun')),
          ),
          h(
            'div',
            { className: 'dshqn-kpi' },
            h('span', { className: 'dshqn-kpi-value' }, lastRun ? String(lastRun.removed) + ' · ' + formatBytes(lastRun.freed) : '—'),
            h('span', { className: 'dshqn-kpi-label' }, t('scheduleLastResult')),
          ),
          h(
            'div',
            { className: 'dshqn-kpi dshqn-kpi-success' },
            h('span', { className: 'dshqn-kpi-value' }, successRuns + '/' + runs.length),
            h('span', { className: 'dshqn-kpi-label' }, t('scheduleSuccessRate')),
            h('span', { className: 'dshqn-kpi-sub' }, t('scheduleSummary') + ' ' + totalRemoved + ' · ' + formatBytes(totalFreed)),
          ),
        ),
        h(
          'section',
          { className: 'dshqn-card', style: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' } },
          h(
            'div',
            { className: 'dshqn-toolbar' },
            h('span', { style: { fontSize: '13px', fontWeight: '600' } }, t('optimizerSchedule')),
            h(
              'select',
              { className: 'dshqn-field', value: mode, style: { width: '120px' }, 'aria-label': t('optimizerSchedule'), onChange: (event) => typeof props.onSchedule === 'function' && props.onSchedule(event.target.value) },
              h('option', { value: 'off' }, t('optimizerScheduleOff')),
              h('option', { value: 'daily' }, t('optimizerScheduleDaily')),
              h('option', { value: 'weekly' }, t('optimizerScheduleWeekly')),
              h('option', { value: 'cron' }, t('optimizerScheduleCron')),
            ),
            h('span', { className: 'dshqn-settings-hint' }, t('optimizerScheduleTime')),
            h('input', { className: 'dshqn-field', type: 'time', value: props.scheduleTime || '03:00', 'aria-label': t('optimizerScheduleTime'), onChange: (event) => typeof props.onScheduleTime === 'function' && props.onScheduleTime(event.target.value) }),
            mode === 'cron'
              ? h('input', { className: 'dshqn-field', type: 'text', value: props.cron || '', placeholder: '0 3 * * 1', 'aria-label': t('optimizerScheduleCron'), onChange: (event) => typeof props.onCron === 'function' && props.onCron(event.target.value) })
              : null,
            mode === 'cron'
              ? h(
                  'select',
                  { className: 'dshqn-field', value: props.cronTimezone || 'local', 'aria-label': t('optimizerScheduleTimezone'), onChange: (event) => typeof props.onCronTimezone === 'function' && props.onCronTimezone(event.target.value) },
                  h('option', { value: 'local' }, t('optimizerScheduleTimezone') + ' local'),
                  h('option', { value: 'UTC+8' }, 'UTC+8'),
                  h('option', { value: 'UTC+9' }, 'UTC+9'),
                  h('option', { value: 'UTC' }, 'UTC'),
                  h('option', { value: 'UTC-5' }, 'UTC-5'),
                  h('option', { value: 'Asia/Shanghai' }, 'Asia/Shanghai'),
                  h('option', { value: 'Asia/Tokyo' }, 'Asia/Tokyo'),
                  h('option', { value: 'Europe/London' }, 'Europe/London'),
                  h('option', { value: 'America/New_York' }, 'America/New_York'),
                )
              : null,
            schedule
              ? h('span', { className: 'dshqn-settings-hint' }, fillTemplate(t('optimizerScheduleLast'), { time: schedule.lastRunAt ? new Date(schedule.lastRunAt).toLocaleString() : '-' }) + ' · ' + fillTemplate(t('optimizerScheduleNext'), { time: schedule.nextRunAt ? new Date(schedule.nextRunAt).toLocaleString() : '-' }))
              : null,
          ),
          runs.length === 0
            ? h('p', { className: 'dshqn-hint' }, t('scheduleLogEmpty'))
            : runs.map((run) =>
                h(
                  'div',
                  { key: run.at, style: { border: '1px solid var(--dsw-alias-border-l1)', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' } },
                  h('span', { style: { fontSize: '12px' } }, new Date(run.at).toLocaleString()),
                  h('span', { className: 'dshqn-stat' }, run.removed + ' ' + t('optimizerFiles') + ' · ' + formatBytes(run.freed)),
                  h('span', { style: { fontSize: '12px', color: run.ok === false || run.errors > 0 ? 'var(--dshqn-danger)' : 'var(--dsw-alias-label-secondary)' } }, run.ok === false || run.errors > 0 ? t('scheduleLogFailed') : t('scheduleLogOk')),
                  run.ok === false || run.errors > 0
                    ? h('button', { type: 'button', className: 'dshqn-button', onClick: runAuto, disabled: busy }, t('scheduleRetry'))
                    : null,
                ),
              ),
        ),
      );
    }
`;
