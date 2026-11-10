window.__ModuleLoader__.load({
  id: 'dsh-quick-note',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    /** Dictionary namespace owned by this plugin. */
    const NS = 'quickNote';
    /** The id shared by the sidebar entry and the main panel it opens. */
    const PANEL_ID = 'quick-note';
    /** Host sync endpoint served by this bundle's Host half. */
    const STATE_URL = '/api/quick-note/state';
    const ADMIN_URL = '/api/quick-note/admin';
    const USAGE_URL = '/api/quick-note/usage';
    const VALUE_URL = '/api/quick-note/workspace-value';
    const AUTH_URL = '/api/quick-note/auth';
    const BACKUP_URL = '/api/quick-note/backups';
    const HARNESS_URL = '/api/quick-note/harness';
    /** Attachment upload/serve endpoint. */
    const FILES_URL = '/api/quick-note/files';
    /** Markdown folder import/export endpoint. */
    const MARKDOWN_URL = '/api/quick-note/markdown';
    /** Speech-to-text endpoint. */
    const VOICE_URL = '/api/quick-note/transcribe';
    /** Read-only HTML snapshot endpoint. */
    const SHARE_URL = '/api/quick-note/share';
    /** Host-timer-computed reminders endpoint. */
    const REMINDERS_URL = '/api/quick-note/reminders';
    /** Official GitHub Releases API: parsed by the Host into version/release notes. */
    const OFFICIAL_GITHUB_FEED = 'https://api.github.com/repos/deepseek-ai/deepseek-harness/releases?per_page=5';
    /** Official download page for manual installs when a release has no installer asset. */
    const OFFICIAL_DOWNLOAD_PAGE = 'https://www.deepseek.com/download/';
    /** Sentinel feed: Host resolves it to the official platform installer direct URL. */
    const OFFICIAL_DIRECT_FEED = 'official:direct';
    /** Placeholder official feed URL: replace the host with the official release address. */
    const OFFICIAL_FEED_TEMPLATE = 'https://example.com/deepseek-harness/latest.json';
    /** Sample update manifest users can host next to their release artifacts. */
    const UPDATE_MANIFEST_TEMPLATE = JSON.stringify(
      {
        version: '2.0.0',
        url: 'https://example.com/deepseek-harness/DeepSeek-Harness-Setup-2.0.0.exe',
        sha256: '',
        notes: 'release notes',
        publishedAt: '2026-01-01T00:00:00Z',
      },
      null,
      2,
    );
    /** Browser mirror of the last known state, used when the Host route is unreachable. */
    const MIRROR_KEY = 'dsh.quick-note.mirror.v2';
    /** Module visibility preferences. */
    const PREFS_KEY = 'dsh.quick-note.prefs.v2';
    /** Day key of the last dismissed due-reminder banner. */
    const REMINDER_KEY = 'dsh.quick-note.reminder-dismissed';
    /** Doses already announced through the system notification today. */
    const NOTIFIED_KEY = 'dsh.quick-note.notified';
    /** Pre-workbench drafts, migrated once into items. */
    const LEGACY_NOTES_KEY = 'dsh.quick-note.notes';
    const LEGACY_DRAFT_KEY = 'dsh.quick-note.draft';

    const zh = {
      panel: "管理台",
      title: "管理台",
      subtitle: "笔记、任务、复习、健康统一管理；数据保存在本机，并可由 Agent 读写。",
      viewOverview: "概览",
      viewAll: "全部",
      overviewBrief: "今日简报",
      allEmpty: "暂无条目",
      batchCount: "共 {count} 条",
      batchSelected: "已选 {count} 项",
      batchComplete: "标记完成",
      batchReopen: "重新打开",
      batchDelete: "删除",
      batchClear: "取消选择",
      allSortUpdated: "更新时间",
      allSortTitle: "标题",
      allSortPriority: "优先级",
      allSortDue: "截止时间",
      pagePrev: "上一页",
      pageNext: "下一页",
      pageInfo: "第 {page} / {total} 页",
      overviewQuick: "快捷新建",
      overviewRecent: "最近更新",
      overviewClear: "还没有任何条目，从快捷新建开始吧",
      kpiTodayDue: "今日到期",
      kpiOverdue: "逾期",
      kpiDueCards: "待复习卡片",
      kpiWeekReviews: "近 7 天复习",
      kpiHealthToday: "今日健康记录",
      kpiMedsToday: "今日用药",
      kpiRecords: "自定义记录",
      overviewTypes: "记录类型",
      overviewAtGlance: "今日概览",
      quickNoteHint: "记下想法、资料与待整理内容",
      quickTaskHint: "添加带截止时间的待办",
      quickCardHint: "创建 SM-2 复习卡片",
      quickMetricHint: "记录一次健康指标",
      quickMedHint: "添加每日用药计划",
      quickRecordHint: "登记自定义类型记录",
      viewRecords: "记录",
      viewSystem: "系统",
      viewUsage: "用量",
      viewValue: "价值",
      viewInsights: "分析",
      viewKnowledge: "知识",
      viewPlan: "计划",
      valueSummary: "工作区价值总览",
      valueAvgScore: "平均价值分",
      valueTop: "最高价值",
      valueGrade: "等级",
      valueStage: "阶段",
      valueFuture: "未来价值",
      valueScore: "价值分",
      valueSessions: "会话",
      valueTokens: "Tokens",
      valueCost: "估算金额",
      valueActiveDays: "活跃天数",
      valueLastActive: "最近活跃",
      valueFiles: "文件",
      valueRecent14: "近 14 天会话",
      valueMomentum: "动量",
      valueRating: "评级",
      valueNote: "评价",
      valueSave: "保存评价",
      valueSaved: "评价已保存",
      valueUnavailable: "无法读取工作区价值分析（Host 半区可能需要重新组装）",
      valueEmpty: "暂无工作区数据",
      valueRefresh: "刷新分析",
      valueNoteHint: "可按实际业务价值人工评级并填写评价，保存后随数据文件持久化。",
      valueHigh: "高",
      valueMedium: "中",
      valueLow: "低",
      valueUnrated: "未评级",
      valueStageActive: "活跃开发",
      valueStageMaintaining: "维护期",
      valueStageRecent: "近期活跃",
      valueStageSlowing: "放缓",
      valueStageDormant: "沉寂",
      valueStageUnknown: "未知",
      valueFutureHigh: "高潜力",
      valueFutureSteady: "稳定",
      valueFutureSlowing: "放缓",
      valueFutureLow: "低",
      valueFutureUnknown: "待观察",
      valueSocial: "社会应用价值",
      valueSocialScore: "社会价值分",
      valueSocialGradeStrong: "强",
      valueSocialGradeMedium: "中",
      valueSocialGradeWeak: "弱",
      valueSocialGradeUnknown: "待评估",
      valueDomains: "领域",
      valueSignals: "信号",
      valueSignalReadme: "README",
      valueSignalLicense: "许可证",
      valueSignalTests: "测试",
      valueSignalDocs: "文档",
      valueSocialRating: "社会价值评级",
      valueSocialNote: "社会价值说明",
      valueSocialHint: "社会应用价值由 README/许可证/测试/文档/领域关键词/活跃度启发式估算，可人工评级补充。",
      valueSocialDimensions: "社会价值维度",
      valueSocialStrength: "优势",
      valueSocialGap: "短板",
      valueSocialSuggestions: "提升建议",
      socialDimDocs: "文档",
      socialDimLicense: "许可证",
      socialDimTests: "测试",
      socialDimImpact: "社会影响",
      socialDimSubstance: "工程沉淀",
      socialDimActivity: "持续活跃",
      socialSuggestAddReadme: "补充 README",
      socialSuggestAddDocs: "补充项目文档",
      socialSuggestAddLicense: "补充开源许可证",
      socialSuggestAddTests: "补充自动化测试",
      socialSuggestAddDomains: "关联更多社会领域",
      socialSuggestStayActive: "保持活跃（近 90 天有会话）",
      valueSortValue: "价值分",
      valueSortSocial: "社会价值",
      valueSortCost: "金额",
      valueTrend: "趋势",
      valueSnapshotHint: "每天首次打开「价值」页会自动记录一次评分快照（每工作区最多保留 12 次）。",
      valueSnapshotNow: "立即记录快照",
      valueSnapshotSaved: "快照已记录",
      valueTrendChart: "价值趋势",
      valueChartValue: "价值分",
      valueChartSocial: "社会价值",
      valueClearHistory: "清理快照",
      valueClearConfirm: "再次点击清理全部快照",
      valueHistoryCleared: "快照已清理",
      valueExportCsv: "导出 CSV",
      csvWorkspace: "工作区",
      csvPath: "路径",
      csvSocialGrade: "社会等级",
      valueRange7: "7 天",
      valueRange30: "30 天",
      valueRangeAll: "全部",
      valueChartEmpty: "所选范围内暂无足够快照（每个工作区至少 2 次）",
      valueHoverAt: "{title} · {date} · {score}",
      valueClearWorkspace: "清理该工作区快照",
      valueClearWorkspaceConfirm: "再次点击清理该工作区",
      valueExportMd: "导出 Markdown 报告",
      valueArchive: "归档为笔记",
      valueArchived: "报告已归档为笔记",
      valueReportTitle: "工作区价值报告",
      valueReportGenerated: "生成时间",
      valueNoTrend: "暂无趋势",
      usageSummary: "总览",
      usageSessions: "会话",
      usageWorkspaces: "工作区",
      usageInputHit: "缓存命中输入",
      usageInputMiss: "未命中输入",
      usageOutput: "输出",
      usageTokens: "总 Tokens",
      usageCost: "估算金额",
      usagePricing: "单价（元/百万 tokens）：命中",
      usagePricingMiss: "未命中",
      usagePricingOutput: "输出",
      usageRefresh: "刷新用量",
      usageUnavailable: "无法读取用量数据（Host 半区可能需要重新组装）",
      usageEmpty: "还没有可统计的会话用量",
      usageNote: "金额为估算：按设置单价计算；Token 来自会话投影缓存。",
      usageCacheHit: "缓存命中率",
      usageDaily: "近 14 天用量",
      usageTopSessions: "会话 Top 12",
      usageAvgTokens: "均 Token/会话",
      settingsPricingTitle: "用量单价（元/百万 tokens）",
      settingsPricingHint: "用于「用量」页金额估算；默认 DeepSeek-flash 高峰价，空闲时段为其一半，可按实际账单修改。",
      settingsPriceHit: "缓存命中输入",
      settingsPriceMiss: "缓存未命中输入",
      settingsPriceOutput: "输出",
      settingsSave: "保存单价",
      settingsSaved: "单价已保存",
      systemProfile: "运行环境",
      systemData: "数据文件",
      systemBundles: "已安装 Bundles",
      systemDeps: "依赖",
      systemSessions: "会话统计",
      systemRefresh: "刷新系统信息",
      systemUnavailable: "无法读取系统信息（Host 半区可能需要重新组装）",
      systemHome: "DSH 主目录",
      systemProfileName: "Profile",
      systemRevision: "数据版本",
      systemItems: "条目",
      systemTypes: "记录类型",
      systemReviews: "复习记录",
      systemWorkspaces: "工作区",
      systemSessionsCount: "会话数",
      harnessTitle: "Harness 版本管理",
      harnessCurrent: "当前版本",
      harnessLatest: "最新版本",
      harnessUnknown: "未知（非打包安装）",
      harnessElectron: "Electron",
      harnessNode: "Node",
      harnessExecPath: "程序路径",
      harnessFeedLabel: "更新源（JSON manifest 地址）",
      harnessFeedHint: "manifest 格式：{\"version\":\"2.0.0\",\"url\":\"https://…/setup.exe\",\"sha256\":\"64 位哈希（可选）\",\"notes\":\"更新说明\"}",
      harnessSaveFeed: "保存更新源",
      harnessCheck: "检查更新",
      harnessDownload: "下载更新",
      harnessOpenFolder: "打开下载目录",
      harnessInstall: "安装更新",
      harnessInstallConfirm: "确认安装 {version}",
      harnessRestart: "重启 DSH",
      harnessRestartConfirm: "确认重启",
      harnessAutoLabel: "允许自动安装与重启（高风险）",
      harnessAutoHint: "仅在开启后可安装/重启；请确认更新源可信并已校验 SHA-256，重启会结束当前会话。",
      harnessUpToDate: "已是最新版本",
      harnessUpdateAvailable: "发现新版本 {version}",
      harnessNoStaged: "尚未下载更新",
      harnessStaged: "已下载版本 {version}",
      harnessVerified: "SHA-256 校验通过",
      harnessUnverified: "未提供 SHA-256 校验",
      harnessCheckFailed: "检查更新失败",
      harnessDownloadFailed: "下载更新失败",
      harnessDownloaded: "更新已下载",
      harnessInstallStarted: "安装程序已启动，完成后请重启 DSH",
      harnessRestarting: "正在重启 DSH…",
      harnessNotes: "更新说明",
      harnessNoFeed: "请先配置更新源地址",
      harnessOpened: "已打开下载目录",
      harnessFetching: "正在检查…",
      planTimeline: "未来 7 天计划时间轴",
      planTimelineEmpty: "未来 7 天暂无安排",
      versionChannels: "版本通道",
      otherVersions: "其他版本（GitHub Releases）",
      releasePrerelease: "预发布",
      releaseNoAssetShort: "无安装包",
      releaseDownload: "下载该版本",
      releaseListEmpty: "未获取到版本列表",
      customInstaller: "自定义安装包 URL",
      customShaPlaceholder: "SHA-256（可选，64 位十六进制）",
      customDownload: "下载自定义安装包",
      customSource: "自定义来源",
      customDownloaded: "已下载自定义安装包（{size}），请核对哈希后审批",
      customApproveLabel: "我确认该安装包来源可信，并已核对 SHA-256",
      harnessCheckAndDownload: "检查并下载更新",
      harnessAutoDownloaded: "发现新版本 {version}，已自动下载，请在下方审批安装",
      harnessApproveLabel: "我已核对版本与 SHA-256，批准安装",
      harnessApproveInstall: "批准安装",
      harnessApproveNeedVerified: "审批安装需要更新源提供 SHA-256 且校验通过；否则请开启「允许自动安装与重启」",
      harnessApproveSuccess: "已批准并开始安装",
      harnessAutoCheckLabel: "自动检查更新（仅提醒，不自动安装）",
      harnessAutoCheckHint: "每 6 小时最多检查一次；发现新版本时在页头显示提醒并尝试系统通知。",
      harnessNewVersionNotify: "发现 Harness 新版本 {version}，可前往 分析 → 系统 查看。",
      harnessUpdateBadge: "新版本 {version}",
      harnessOfficialTemplate: "填入官方源模板",
      harnessTemplateFilled: "已填入模板地址，请替换为官方发布地址",
      harnessCopyManifest: "复制 manifest 模板",
      harnessCopied: "manifest 模板已复制",
      harnessShowTemplate: "查看 manifest 模板",
      harnessHideTemplate: "收起 manifest 模板",
      harnessFeedTemplateWarning: "当前是示例模板地址（example.com），请替换为官方发布地址后再检查/下载",
      harnessUseOfficial: "使用 GitHub 官方 Releases",
      harnessOfficialFilled: "已填入官方 GitHub Releases 地址并保存，可直接「检查并下载更新」",
      harnessOfficialSource: "来自 GitHub 官方 Releases",
      harnessNoAsset: "官方仓库该版本未提供安装包资产，请前往官方下载页手动下载",
      harnessOfficialDownload: "打开官方下载页",
      harnessWorking: "正在处理…",
      harnessDirectButton: "获取官方安装包（直链）",
      harnessDirectSource: "官方直链",
      harnessOfficialBuild: "官方最新稳定构建",
      harnessDirectDownloaded: "已下载官方安装包（{size}），请核对哈希后审批安装",
      harnessApproveOfficialLabel: "我确认来源为官方域名 download.deepseek.com，并已核对下载哈希",
      harnessNotesExpand: "展开全文",
      harnessNotesCollapse: "收起",
      harnessReleasePage: "查看 Release 页面",
      harnessHash: "SHA-256",
      harnessOfficialBuildOlder: "官方直链构建可能早于当前安装（构建时间 {time}），请确认后再安装",
      harnessDirectDownloadedOld: "已下载官方安装包（{size}，构建时间 {time}），该构建可能早于当前安装，请谨慎审批",
      systemUpdated: "数据更新时间",
      recordsEmpty: "还没有自定义类型，点「新建类型」开始",
      newRecordType: "新建类型",
      editType: "编辑类型",
      recordTypeName: "类型名称",
      recordTypeFields: "字段定义",
      addField: "添加字段",
      fieldLabel: "字段名称",
      fieldOptions: "选项（逗号分隔）",
      fieldText: "文本",
      fieldNumber: "数字",
      fieldDate: "日期",
      fieldCheckbox: "复选",
      fieldSelect: "单选",
      saveType: "保存类型",
      deleteType: "删除类型",
      typeNameRequired: "类型名称不能为空",
      typeDeleteHint: "该类型下有 {count} 条记录，删除类型会一并删除",
      newRecord: "新建记录",
      emptyRecords: "还没有记录",
      recordTitlePlaceholder: "记录标题（可选）",
      newView: "保存为视图",
      saveView: "保存视图",
      viewNamePlaceholder: "视图名称（可留空自动命名）",
      defaultViewName: "视图 {n}",
      viewSaved: "视图已保存",
      viewApplied: "已应用视图",
      viewNotes: "笔记",
      viewTasks: "任务",
      searchPlaceholder: "搜索标题、正文或标签",
      newNote: "新建笔记",
      newTask: "新建任务",
      untitled: "无标题",
      deleteItem: "删除",
      deleteConfirm: "再次点击删除",
      export: "导出",
      import: "导入",
      refresh: "刷新",
      back: "返回会话",
      titlePlaceholder: "标题（可选）",
      noteBodyPlaceholder: "在这里记点什么…",
      taskBodyPlaceholder: "备注（可选）…",
      tagsPlaceholder: "标签，用逗号分隔",
      taskOpen: "未完成",
      taskDone: "已完成",
      dueLabel: "截止",
      emptyNotes: "还没有笔记，点「新建笔记」开始。",
      emptyTasks: "还没有任务，点「新建任务」开始。",
      allHidden: "所有模块都已隐藏，请在「设置 → 管理台设置」中启用。",
      noMatches: "没有匹配项。",
      filterAll: "全部",
      filterOpen: "未完成",
      filterDone: "已完成",
      filterToday: "今天",
      filterOverdue: "逾期",
      priorityLabel: "优先级",
      priorityLow: "低",
      priorityNormal: "普通",
      priorityHigh: "高",
      reminderText: "管理台：今天到期 {today} 项，逾期 {overdue} 项",
      reminderMeds: "用药到点：{times}",
      reminderCards: "复习到期：{count} 张",
      writeModeTitle: "同步写入方式",
      writeModeHint: "增量（PATCH）只上报变更条目；全量（PUT）在调试/兼容问题时使用。",
      writeModePatch: "增量 PATCH",
      writeModeFull: "全量 PUT",
      markdownTitle: "Markdown 文件夹",
      markdownHint: "导出笔记/任务/卡片为 .md（含 front matter）；也可从文件夹导入（重复内容自动跳过）。留空使用默认目录。",
      markdownDirPlaceholder: "文件夹绝对路径（留空=默认目录）",
      markdownExport: "导出到文件夹",
      markdownImport: "从文件夹导入",
      markdownExported: "已导出 {count} 个 Markdown 文件到 {dir}",
      markdownImported: "已导入 {imported} 个，跳过 {skipped} 个（{dir}）",
      markdownFailed: "Markdown 操作失败",
      voiceCapture: "语音速记",
      voiceRecording: "录音中…点击停止",
      voiceBusy: "识别中…",
      voiceUnavailable: "语音服务不可用",
      voicePermission: "麦克风权限被拒绝",
      voiceEmpty: "没有识别到文字",
      voiceFailed: "语音识别失败",
      voiceSaved: "已保存语音笔记",
      shareTitle: "只读快照",
      shareHint: "生成一个独立 HTML 文件，包含笔记/任务/卡片，可用于离线查看或分享。",
      shareCreate: "生成只读快照",
      shareCreated: "已生成快照：{path}",
      shareFailed: "快照生成失败",
      optimizerTitle: "优化中心",
      optimizerRefresh: "刷新",
      optimizerEfficiencyTitle: "Token 效率与费用",
      optimizerScore: "效率评分",
      optimizerCacheBar: "缓存",
      optimizerCostBar: "成本",
      optimizerOutputBar: "输出",
      optimizerCacheHit: "缓存命中率",
      optimizerTarget: "目标",
      optimizerTodayCost: "今日费用",
      optimizerWeekCost: "近 7 日费用",
      optimizerAvgCost: "会话均费",
      optimizerOutputRatio: "输出占比",
      optimizerTotalTokens: "累计 Token",
      optimizerCacheSaving: "缓存提升可省",
      optimizerDaily: "近 14 天费用",
      optimizerRecommendations: "优化建议",
      optimizerNoUsage: "暂无用量数据；先确认会话投影缓存与设置中的单价。",
      optimizerCleanupTitle: "空间清理",
      optimizerCleanupHint: "扫描插件数据与各工作区的临时文件、缓存和构建产物；只删除勾选的类别，构建产物需人工确认。",
      optimizerScan: "重新扫描",
      optimizerScanning: "扫描中…",
      optimizerCleanSelected: "清理所选",
      optimizerCleaning: "清理中…",
      optimizerCleaned: "已清理 {removed} 项，释放 {freed}",
      optimizerFailed: "操作失败",
      optimizerNothing: "没有发现可清理的文件",
      optimizerRoots: "工作区 {count} 个",
      optimizerScanned: "已扫描 {count} 个文件",
      optimizerFiles: "项",
      optimizerReportOnly: "仅报告",
      optimizerSafe: "可安全清理",
      optimizerCaution: "可重建，需确认",
      optimizerCatPluginAttachments: "孤立附件",
      optimizerCatPluginStaging: "更新暂存文件",
      optimizerCatPluginTemp: "插件临时文件",
      optimizerCatWorkspaceJunk: "工作区临时文件",
      optimizerCatWorkspaceCaches: "工作区缓存目录",
      optimizerCatWorkspaceBuilds: "工作区构建产物",
      optimizerCatLargeStale: "大型陈旧文件",
      optimizerBudget: "每日预算（¥）",
      optimizerBudgetSave: "保存预算",
      optimizerBudgetHint: "设置每日 Token 费用预算后，这里显示今日消耗进度与超支提醒。",
      optimizerBudgetUsage: "今日已用 ¥{used} / 预算 ¥{budget}（{percent}%）",
      optimizerBudgetOver: "今日已用 ¥{used}，超出预算 ¥{budget}！",
      optimizerTopSessions: "高消耗会话",
      optimizerExport: "导出优化报告",
      optimizerExporting: "导出中…",
      optimizerExported: "报告已保存：{path}",
      optimizerHistory: "最近清理记录",
      optimizerHistoryLine: "{time} · 清理 {removed} 项 / 释放 {freed}",
      optimizerHistoryNoUndo: "不可撤销",
      optimizerShare: "分享报告快照",
      optimizerSharing: "生成中…",
      optimizerShared: "快照已生成：{path}",
      optimizerWorkspaces: "工作区费用明细",
      optimizerWorkspaceHint: "点击工作区查看该工作区的高消耗会话",
      optimizerWorkspaceSessions: "该工作区会话",
      reminderBudget: "预算超支：今日已用 ¥{used} / 预算 ¥{limit}",
      reminderBudgetWarn: "预算预警：今日已用 ¥{used}（{percent}% / 预算 ¥{limit}）",
      optimizerUndo: "撤销清理",
      optimizerUndone: "已恢复 {restored} 项",
      optimizerUndoFailed: "撤销失败或已过期",
      optimizerOpenSession: "打开对应会话",
      optimizerMonthlyBudget: "月度预算（¥）",
      optimizerMonthlyUsage: "本月已用 ¥{used} / 预算 ¥{budget}（{percent}%）",
      optimizerMonthlyCurve: "近 30 天费用曲线",
      optimizerSchedule: "自动清理计划",
      optimizerScheduleOff: "关闭",
      optimizerScheduleDaily: "每日",
      optimizerScheduleWeekly: "每周",
      optimizerAutoRun: "立即自动清理",
      optimizerAutoDone: "自动清理完成：{removed} 项 / {freed}",
      optimizerTrash: "回收站 {count} 条 / {size}",
      optimizerTrashEmpty: "清空回收站",
      optimizerTrashCleared: "回收站已清空",
      optimizerTrashRemaining: "剩余约 {hours} 小时可撤销",
      optimizerWebhook: "预算超支 Webhook",
      optimizerWebhookSave: "保存 Webhook",
      optimizerWebhookHint: "达到 80% 或超支时，Host 定时器会 POST 一次 JSON 通知到该地址（按天去重）。",
      optimizerReportRange: "报告日期范围：",
      optimizerReportFrom: "开始日期",
      optimizerReportTo: "结束日期",
      optimizerScheduleLast: "上次自动清理：{time}",
      optimizerScheduleNext: "下次预计：{time}",
      optimizerAutoTag: "自动",
      optimizerWebhookTemplate: "Webhook 模板",
      optimizerWebhookGeneric: "通用 JSON",
      optimizerWebhookSlack: "Slack",
      optimizerWebhookFeishu: "飞书",
      optimizerWebhookTest: "测试发送",
      optimizerWebhookTestOk: "测试已发送（HTTP {status}）",
      optimizerWebhookTestFailed: "测试发送失败或未配置 Webhook",
      optimizerTrashRecords: "回收站记录",
      optimizerTrashSearch: "搜索回收站（记录 id / 日期）",
      optimizerTrashRestore: "恢复所选",
      optimizerTrashRestored: "已恢复 {restored} 项",
      optimizerShareStats: "报告分享访问统计",
      scheduleLogTitle: "清理计划",
      scheduleLogHint: "自动清理执行历史、下次执行时间与失败重试",
      scheduleLogEmpty: "暂无自动清理记录",
      scheduleLogOk: "成功",
      scheduleLogFailed: "有失败项",
      scheduleRetry: "重试",
      optimizerScheduleTime: "执行时间",
      optimizerWebhookQueue: "Webhook 失败队列",
      optimizerWebhookRetry: "重试队列",
      optimizerWebhookRetried: "已重试：成功 {sent} 条，剩余 {remaining} 条",
      optimizerShareRefs: "来源",
      optimizerTrashCapacityWarn: "回收站接近容量上限，请及时清空",
      optimizerScheduleCron: "Cron",
      optimizerScheduleCronHint: "五段式 Cron：分 时 日 月 周，例如 0 3 * * 1",
      optimizerShareCsv: "导出 CSV",
      optimizerShareCsvDone: "CSV 已保存：{path}（{count} 条）",
      optimizerTrashTypeAll: "全部",
      optimizerTrashTypeAttachments: "附件",
      optimizerTrashTypeTemp: "临时",
      optimizerTrashTypeCache: "缓存",
      optimizerTrashTypeBuilds: "构建",
      optimizerCronPreview: "预览下 5 次",
      optimizerCronNext: "下次执行",
      optimizerWebhookResend: "重发",
      optimizerWebhookEdit: "编辑",
      optimizerWebhookEditSave: "保存并重发",
      optimizerTrashWorkspace: "按工作区筛选",
      optimizerTrashWorkspaceAll: "全部工作区",
      optimizerScheduleTimezone: "时区",
      optimizerWebhookBatch: "批量编辑 payload",
      optimizerWebhookBatchApply: "应用到所选",
      optimizerWebhookBatchResend: "批量重发",
      optimizerWebhookBatchRemove: "批量删除",
      optimizerPresets: "快速预设",
      optimizerPresetAll: "全部",
      optimizerPresetAttachments: "仅附件",
      optimizerPresetTemp: "仅临时",
      optimizerPresetBuilds: "仅构建",
      optimizerSharePng: "导出 PNG 图表",
      optimizerSharePngDone: "PNG 已保存：{path}（{count} 条）",
      optimizerPresetSave: "保存当前预设",
      optimizerPresetName: "预设名称",
      optimizerPresetDelete: "删除预设",
      reviewForecastTitle: "遗忘曲线预测",
      reviewDaysShort: "天",
      reviewGoalHistory: "目标完成历史",
      medAdherenceWeek: "本周依从率",
      medLogIntake: "记录已服",
      shortcutTitle: "快捷键",
      shortcutPalette: "打开命令面板",
      shortcutRate: "评分：重来/一般/良好",
      shortcutReveal: "显示答案",
      shortcutUndo: "撤销上次评分",
      shortcutClose: "关闭面板/复习",
      shortcutHelp: "显示快捷键",
      backupInterval: "自动备份间隔（分钟）",
      backupDiff: "差异预览",
      backupDiffSummary: "与当前差异：新增 {added} · 删除 {removed} · 修改 {changed}（{name}）",
      backupDiffSettings: "设置也有变化",
      reviewHalfLife: "半衰期",
      medRemindersOn: "用药提醒：开",
      medRemindersOff: "用药提醒：关",
      shortcutCustomTitle: "自定义快捷键",
      backupProgress: "自动备份进度",
      optimizerCronMulti: "多时区对照",
      optimizerWebhookExport: "导出队列",
      optimizerWebhookImport: "导入队列",
      optimizerWebhookExportDone: "队列已导出：{path}（{count} 条）",
      optimizerWebhookImportDone: "已导入 {imported} 条，剩余 {remaining} 条",
      optimizerWebhookImportFailed: "导入 JSON 需为队列项数组",
      optimizerPresetMoveUp: "上移预设",
      optimizerPresetMoveDown: "下移预设",
      optimizerSavingsPotential: "预计可节省",
      optimizerSavingsHint: "缓存命中率提升到目标后的累计估算",
      optimizerCostBreakdown: "费用构成",
      optimizerCostHit: "缓存命中输入",
      optimizerCostMiss: "未命中输入",
      optimizerCostOutput: "输出",
      optimizerCostProjection: "费用可视化",
      optimizerCurrentCost: "当前累计",
      optimizerAfterCost: "优化后预计",
      optimizerProjectionSaving: "可省 {percent}% · ¥{amount}",
      optimizerWorkspaceCostBars: "按工作区费用",
      optimizerCacheTrend30: "近 30 天缓存命中率",
      optimizerLatest: "最新",
      optimizerSavingsDetail: "查看计算过程",
      optimizerSavingsHide: "收起计算过程",
      optimizerSavingsFormulaTitle: "计算口径",
      optimizerInputTokens: "输入 Token 总量",
      optimizerCurrentCache: "当前缓存命中率",
      optimizerTargetCache: "目标命中率",
      optimizerPotentialCache: "可达命中率",
      optimizerPriceGap: "命中/未命中单价差",
      optimizerSavingsFormula: "输入 Token × 提升命中率 × 单价差 ÷ 1,000,000",
      optimizerAutoSavingsTitle: "自动省钱",
      optimizerAutoSavingsHint: "压缩与裁剪插件状态、上下文压力与预算",
      optimizerAutoStatus: "自动降费能力",
      optimizerAutoCompaction: "自动压缩",
      optimizerAutoPruner: "工具结果裁剪",
      optimizerAutoCommand: "压缩命令",
      optimizerContextPressure: "当前会话上下文",
      optimizerContextNoData: "暂无上下文数据（发送一条消息后生成）",
      optimizerCompressible: "预计可压缩 {amount} tokens",
      optimizerOpenPlugins: "打开插件设置",
      optimizerBudgetStatus: "预算状态",
      optimizerAutoBudgetDaily: "每日预算",
      optimizerAutoBudgetMonthly: "月度预算",
      optimizerSavingsMode: "省钱模式",
      optimizerSavingsGuard: "预算护栏",
      optimizerSavingsModeOff: "开启省钱模式",
      optimizerSavingsModeOn: "关闭省钱模式",
      optimizerSavingsModel: "省钱模型：{model}",
      optimizerThriftTitle: "高消耗工作区省流",
      optimizerCheckBudget: "检查预算",
      optimizerCurrentModel: "当前默认模型",
      systemSavings: "预算与省钱策略",
      systemSavingsHint: "每日/月度预算、省钱模式与模型策略入口",
      systemOpenOptimizer: "打开优化中心",
      systemBudget: "每日预算",
      systemMonthlyBudget: "月度预算",
      systemOn: "已开启",
      systemOff: "已关闭",
      valueHighValueWorkspaces: "高价值工作区",
      valueHighCostWorkspaces: "高消耗工作区",
      usageWorkspaceCostTrend: "工作区费用趋势",
      usageCostForecast: "预计月费用",
      usageForecastDaily: "日均",
      scheduleNextRun: "下次执行",
      scheduleLastResult: "最近结果",
      scheduleSuccessRate: "成功次数",
      scheduleSummary: "自动清理摘要",
      optimizerThriftSelected: "已加入省流 {count} 项",
      optimizerActualCost: "实际费用",
      optimizerBaselineCost: "无缓存基线",
      optimizerCumulativeSaved: "累计节省",
      optimizerModelCandidates: "省钱模型候选",
      optimizerNoCheaperModel: "暂未发现更低模型",
      optimizerDiscoverModel: "发现省钱模型",
      optimizerChooseModel: "省钱模型选择",
      optimizerAutoModel: "自动选择",
      optimizerSavingsEffect: "省钱模式效果",
      optimizerBeforeMode: "启用前日均",
      optimizerAfterMode: "启用后日均",
      optimizerNoEffectData: "暂无前后对比数据",
      optimizerRecommendationSaving: "可省 ¥{amount}",
      reminderView: "查看",
      reminderDismiss: "关闭",
      historyTitle: "最近复习",
      historyEmpty: "还没有复习记录",
      overviewTitle: "指标趋势",
      metricAvg: "平均",
      metricMin: "最小",
      metricMax: "最大",
      metricCount: "次数",
      detailBack: "返回列表",
      detailEmpty: "暂无记录",
      recordOnce: "记录一次",
      recordSaved: "已记录",
      retentionTitle: "记忆保持率",
      retentionDay1: "1 天内复习",
      retentionDay6: "2–6 天",
      retentionDay29: "7–29 天",
      retentionDay30: "30 天以上",
      saveEdit: "保存",
      cancelEdit: "取消",
      suggestReview: "建议下次复习",
      compare: "对比",
      notifySection: "提醒",
      notifyTitle: "用药提醒",
      notifyEnable: "请求通知权限",
      notifyGranted: "已授权系统通知",
      notifyDenied: "未授权",
      notifyUnavailable: "当前环境不支持系统通知",
      suggestOverdue: "已逾期，建议尽快复习",
      compareEmpty: "暂无可对比的指标",
      briefLabel: "每轮对话注入今日待办简报",
      briefHint: "开启后，每轮对话会向 Agent 提供今天/逾期任务摘要（仅在有到期任务时）。",
      layoutList: "列表",
      layoutBoard: "看板",
      groupNone: "不分组",
      groupPriority: "按优先级",
      groupTags: "按标签",
      noTags: "无标签",
      viewCards: "复习",
      newCard: "新建卡片",
      startReview: "开始复习",
      stopReview: "退出复习",
      showAnswer: "显示答案",
      rateAgain: "忘记",
      rateHard: "模糊",
      rateGood: "记得",
      noDueCards: "暂无到期卡片",
      reviewDone: "本轮复习完成：{count} 张",
      cardFront: "正面",
      cardBack: "背面",
      frontPlaceholder: "正面（问题 / 单词）",
      backPlaceholder: "背面（答案 / 解释）",
      dueNow: "待复习",
      dueIn: "{days} 天后",
      moduleCards: "显示「复习」",
      reviewEmptyBack: "（没有背面）",
      viewHealth: "健康",
      healthMetric: "指标",
      healthMed: "用药",
      newMetric: "记录指标",
      newMed: "添加用药",
      moduleHealth: "显示「健康」",
      metricNamePlaceholder: "指标名称（如 血压 / 体重 / 血糖）",
      metricValuePlaceholder: "数值",
      metricValue2Placeholder: "第二值（如舒张压）",
      metricUnitPlaceholder: "单位（如 mmHg）",
      measuredAt: "测量时间",
      medNamePlaceholder: "药品 / 剂量",
      medBodyPlaceholder: "用法说明（可选）…",
      medTimesPlaceholder: "服药时间 HH:mm，逗号分隔",
      medActive: "启用中",
      medInactive: "已停用",
      healthTodayMeds: "今日用药",
      healthNoMeds: "暂无启用的用药计划。",
      healthRecordCount: "近 30 天记录",
      emptyMetrics: "还没有指标记录，点「记录指标」开始。",
      emptyMeds: "还没有用药计划，点「添加用药」开始。",
      emptyCards: "还没有卡片，点「新建卡片」开始。",
      chartTitle: "趋势",
      chartEmpty: "暂无同指标历史数据",
      badTimes: "时间格式应为 HH:mm（如 08:00）",
      saveToNotes: "存为笔记",
      savingNote: "保存中…",
      savedNote: "已存为笔记",
      existsNote: "笔记里已有相同内容",
      noteSaveFailed: "保存失败",
      saveSessionNote: "保存会话为笔记",
      savedSessionNote: "已保存会话笔记",
      existsSessionNote: "会话笔记已存在",
      sessionNoteFailed: "会话笔记保存失败",
      sessionNoteFallback: "会话记录",
      quickNoteDock: "{due} 待办 · {cards} 复习 · {meds} 用药",
      quickNoteDockTitle: "打开管理台",
      quickCapture: "快速记录",
      quickCaptureTitle: "打开管理台快速记录",
      attachmentsTitle: "附件",
      addAttachment: "添加附件",
      uploading: "上传中…",
      attachmentsCount: "共 {count} 个",
      attachmentsAdded: "已添加 {count} 个附件",
      attachmentFailed: "附件上传失败",
      attachmentRemove: "删除附件",
      statDue: "待复习",
      statToday: "今日已复习",
      statStreak: "连续天数",
      statHeat: "近 30 天复习",
      statRatings: "近 30 天评级",
      selectHint: "从左侧选择一条内容开始编辑。",
      chars: "字符",
      saved: "已同步到 Host",
      statusSynced: "已同步",
      statusSaving: "同步中",
      statusOffline: "离线",
      statusLoading: "加载中",
      saving: "同步中…",
      offline: "Host 不可达，仅保存在本机浏览器",
      loading: "加载中…",
      exported: "已导出",
      imported: "已导入",
      importEmpty: "文件里没有可导入的内容",
      importFailed: "导入失败：不是有效的 JSON",
      storageUnknown: "未知（Host 不可达）",
      countLabel: "条目数",
      settingsTitle: "管理台设置",
      settingsHint: "选择工作台显示的模块；数据仍保留，只是隐藏。",
      modulesTitle: "显示模块",
      appearanceTitle: "外观",
      paletteTitle: "命令面板",
      palettePlaceholder: "搜索条目或执行操作…",
      paletteActions: "快捷操作",
      paletteItems: "条目",
      paletteEmpty: "没有匹配结果",
      paletteOpen: "打开命令面板",
      paletteShortcut: "Ctrl/⌘ K",
      pinItem: "置顶",
      unpinItem: "取消置顶",
      overviewPinned: "置顶条目",
      dueToday: "今天",
      dueTomorrow: "明天",
      dueNextWeek: "下周",
      reviewUndo: "撤销上次评分",
      reviewUndone: "已撤销上次评分",
      reviewGoalLabel: "每日复习目标",
      reviewGoalHint: "用于复习进度条（1–500）",
      reviewProgress: "今日已复习 {done} / {goal}",
      backupTitle: "数据备份",
      backupNow: "立即备份",
      backupExport: "导出完整备份",
      backupImport: "导入完整备份",
      backupEmpty: "暂无自动备份",
      backupRestore: "恢复",
      backupRestoreConfirm: "确认恢复",
      backupHint: "写入后自动滚动备份（最多 10 份，约 5 分钟一份）",
      backupCreated: "已创建备份",
      backupRestored: "已从备份恢复",
      backupFailed: "备份操作失败",
      subtasksTitle: "检查清单",
      subtaskPlaceholder: "添加检查项",
      addSubtask: "添加",
      repeatLabel: "重复",
      repeatNone: "不重复",
      repeatDaily: "每天",
      repeatWeekly: "每周",
      repeatMonthly: "每月",
      taskStatsToday: "今日完成 {done}/{total}",
      taskStatsWeek: "本周完成 {count}",
      taskStatsOverdue: "逾期 {count}",
      healthRangeTitle: "参考范围",
      rangeMin: "下限",
      rangeMax: "上限",
      rangeHigh: "偏高",
      rangeLow: "偏低",
      rangeNormal: "正常",
      rangeMissing: "未设范围",
      reviewModeLabel: "复习范围",
      reviewModeDue: "到期",
      reviewModeNew: "新卡",
      reviewModeAll: "全部",
      focusMode: "专注模式",
      focusExit: "退出专注",
      reviewKeysHint: "1 重来 · 2 困难 · 3 记住 · 空格 显示答案 · Esc 退出",
      viewCalendar: "日历",
      calendarToday: "今天",
      calendarDayEmpty: "当日无安排",
      calendarMonthFmt: "{year} 年 {month} 月",
      calendarMore: "还有 {count} 项",
      calendarMeds: "用药",
      calendarMedsHint: "显示或隐藏日历中的用药计划",
      calendarMedGroup: "{title} ×{count}",
      densityTitle: "界面密度",
      densityComfortable: "舒适",
      densityCompact: "紧凑",
      accentTitle: "强调色",
      accentDefault: "默认",
      accentSuccess: "绿色",
      accentWarn: "黄色",
      accentError: "红色",
      accentCustom: "自定义",
      moduleNotes: "显示「笔记」",
      moduleRecords: "显示「记录」",
      moduleTasks: "显示「任务」",
      storageTitle: "存储",
      syncNow: "立即同步",
      renderFailed: "管理台面板渲染失败",
      renderFailedHint: "先刷新页面重试；下面是错误详情。",
      reload: "重新加载",
      diagnostics: "诊断信息",
    };


    const en = {
      panel: "Console",
      title: "Management Console",
      subtitle: "Notes, tasks, flashcards, and health in one console; stored on this machine and shared with the agent.",
      viewOverview: "Overview",
      viewAll: "All",
      overviewBrief: "Today's brief",
      allEmpty: "No items yet",
      batchCount: "{count} items",
      batchSelected: "{count} selected",
      batchComplete: "Mark done",
      batchReopen: "Reopen",
      batchDelete: "Delete",
      batchClear: "Clear selection",
      allSortUpdated: "Updated",
      allSortTitle: "Title",
      allSortPriority: "Priority",
      allSortDue: "Due",
      pagePrev: "Previous",
      pageNext: "Next",
      pageInfo: "Page {page} of {total}",
      overviewQuick: "Quick add",
      overviewRecent: "Recent updates",
      overviewClear: "Nothing here yet — start with a quick add",
      kpiTodayDue: "Due today",
      kpiOverdue: "Overdue",
      kpiDueCards: "Cards to review",
      kpiWeekReviews: "Reviews in 7 days",
      kpiHealthToday: "Today's readings",
      kpiMedsToday: "Medications today",
      kpiRecords: "Custom records",
      overviewTypes: "Record types",
      overviewAtGlance: "Today's overview",
      quickNoteHint: "Capture ideas, references, and drafts",
      quickTaskHint: "Add a to-do with a due time",
      quickCardHint: "Create an SM-2 review card",
      quickMetricHint: "Record one health reading",
      quickMedHint: "Add a daily medication plan",
      quickRecordHint: "Log a custom record",
      viewRecords: "Records",
      viewSystem: "System",
      viewUsage: "Usage",
      viewValue: "Value",
      viewInsights: "Insights",
      viewKnowledge: "Knowledge",
      viewPlan: "Plan",
      valueSummary: "Workspace value overview",
      valueAvgScore: "Average score",
      valueTop: "Top workspace",
      valueGrade: "Grade",
      valueStage: "Stage",
      valueFuture: "Future value",
      valueScore: "Value score",
      valueSessions: "Sessions",
      valueTokens: "Tokens",
      valueCost: "Est. cost",
      valueActiveDays: "Active days",
      valueLastActive: "Last active",
      valueFiles: "Files",
      valueRecent14: "Sessions in 14d",
      valueMomentum: "Momentum",
      valueRating: "Rating",
      valueNote: "Assessment",
      valueSave: "Save assessment",
      valueSaved: "Assessment saved",
      valueUnavailable: "Cannot read the workspace value report (the Host half may need recomposition)",
      valueEmpty: "No workspace data yet",
      valueRefresh: "Refresh analysis",
      valueNoteHint: "Rate and describe each workspace by real business value; saved into the data file.",
      valueHigh: "High",
      valueMedium: "Medium",
      valueLow: "Low",
      valueUnrated: "Unrated",
      valueStageActive: "Actively developed",
      valueStageMaintaining: "Maintaining",
      valueStageRecent: "Recently active",
      valueStageSlowing: "Slowing",
      valueStageDormant: "Dormant",
      valueStageUnknown: "Unknown",
      valueFutureHigh: "High potential",
      valueFutureSteady: "Steady",
      valueFutureSlowing: "Slowing",
      valueFutureLow: "Low",
      valueFutureUnknown: "Watch",
      valueSocial: "Social application value",
      valueSocialScore: "Social score",
      valueSocialGradeStrong: "Strong",
      valueSocialGradeMedium: "Medium",
      valueSocialGradeWeak: "Weak",
      valueSocialGradeUnknown: "Not assessed",
      valueDomains: "Domains",
      valueSignals: "Signals",
      valueSignalReadme: "README",
      valueSignalLicense: "License",
      valueSignalTests: "Tests",
      valueSignalDocs: "Docs",
      valueSocialRating: "Social value rating",
      valueSocialNote: "Social value note",
      valueSocialHint: "Social application value is heuristic (README/license/tests/docs/domain keywords/activity); rate it manually to refine.",
      valueSocialDimensions: "Social value dimensions",
      valueSocialStrength: "Strengths",
      valueSocialGap: "Gaps",
      valueSocialSuggestions: "Suggestions",
      socialDimDocs: "Documentation",
      socialDimLicense: "License",
      socialDimTests: "Tests",
      socialDimImpact: "Social impact",
      socialDimSubstance: "Engineering substance",
      socialDimActivity: "Sustained activity",
      socialSuggestAddReadme: "Add a README",
      socialSuggestAddDocs: "Add project docs",
      socialSuggestAddLicense: "Add an open-source license",
      socialSuggestAddTests: "Add automated tests",
      socialSuggestAddDomains: "Connect more social domains",
      socialSuggestStayActive: "Stay active (sessions within 90 days)",
      valueSortValue: "Value score",
      valueSortSocial: "Social value",
      valueSortCost: "Cost",
      valueTrend: "Trend",
      valueSnapshotHint: "Opening the Value tab captures one score snapshot per day (last 12 kept per workspace).",
      valueSnapshotNow: "Capture snapshot now",
      valueSnapshotSaved: "Snapshot captured",
      valueTrendChart: "Value trend",
      valueChartValue: "Value score",
      valueChartSocial: "Social value",
      valueClearHistory: "Clear snapshots",
      valueClearConfirm: "Click again to clear all snapshots",
      valueHistoryCleared: "Snapshots cleared",
      valueExportCsv: "Export CSV",
      csvWorkspace: "Workspace",
      csvPath: "Path",
      csvSocialGrade: "Social grade",
      valueRange7: "7 days",
      valueRange30: "30 days",
      valueRangeAll: "All",
      valueChartEmpty: "Not enough snapshots in this range (need at least 2 per workspace).",
      valueHoverAt: "{title} · {date} · {score}",
      valueClearWorkspace: "Clear this workspace snapshots",
      valueClearWorkspaceConfirm: "Click again to clear this workspace",
      valueExportMd: "Export Markdown report",
      valueArchive: "Archive as note",
      valueArchived: "Report archived as a note",
      valueReportTitle: "Workspace value report",
      valueReportGenerated: "Generated",
      valueNoTrend: "No trend yet",
      usageSummary: "Summary",
      usageSessions: "Sessions",
      usageWorkspaces: "Workspaces",
      usageInputHit: "Cache-hit input",
      usageInputMiss: "Cache-miss input",
      usageOutput: "Output",
      usageTokens: "Total tokens",
      usageCost: "Estimated cost",
      usagePricing: "Price (CNY / 1M tokens): hit",
      usagePricingMiss: "miss",
      usagePricingOutput: "output",
      usageRefresh: "Refresh usage",
      usageUnavailable: "Cannot read usage data (the Host half may need recomposition)",
      usageEmpty: "No session usage to analyze yet",
      usageNote: "Cost is estimated from the configured prices; tokens come from the session projection cache.",
      usageCacheHit: "Cache hit rate",
      usageDaily: "Last 14 days",
      usageTopSessions: "Top sessions",
      usageAvgTokens: "Avg tokens/session",
      settingsPricingTitle: "Usage prices (CNY / 1M tokens)",
      settingsPricingHint: "Used for the Usage tab cost estimate; defaults are DeepSeek-flash peak prices (idle hours are half). Adjust to match your bill.",
      settingsPriceHit: "Cache-hit input",
      settingsPriceMiss: "Cache-miss input",
      settingsPriceOutput: "Output",
      settingsSave: "Save prices",
      settingsSaved: "Prices saved",
      systemProfile: "Runtime",
      systemData: "Data file",
      systemBundles: "Installed bundles",
      systemDeps: "Dependencies",
      systemSessions: "Sessions",
      systemRefresh: "Refresh system info",
      systemUnavailable: "Cannot read system info (the Host half may need recomposition)",
      systemHome: "DSH home",
      systemProfileName: "Profile",
      systemRevision: "Data revision",
      systemItems: "Items",
      systemTypes: "Record types",
      systemReviews: "Reviews",
      systemWorkspaces: "Workspaces",
      systemSessionsCount: "Sessions",
      harnessTitle: "Harness version manager",
      harnessCurrent: "Current version",
      harnessLatest: "Latest version",
      harnessUnknown: "Unknown (unpackaged)",
      harnessElectron: "Electron",
      harnessNode: "Node",
      harnessExecPath: "Executable",
      harnessFeedLabel: "Update feed (JSON manifest URL)",
      harnessFeedHint: "Manifest: {\"version\":\"2.0.0\",\"url\":\"https://…/setup.exe\",\"sha256\":\"64-hex (optional)\",\"notes\":\"release notes\"}",
      harnessSaveFeed: "Save feed",
      harnessCheck: "Check for updates",
      harnessDownload: "Download update",
      harnessOpenFolder: "Open downloads",
      harnessInstall: "Install update",
      harnessInstallConfirm: "Confirm install {version}",
      harnessRestart: "Restart DSH",
      harnessRestartConfirm: "Confirm restart",
      harnessAutoLabel: "Allow automatic install and restart (risky)",
      harnessAutoHint: "Install/restart require this switch; verify the feed and SHA-256 first — restart ends the current session.",
      harnessUpToDate: "Already up to date",
      harnessUpdateAvailable: "Update available: {version}",
      harnessNoStaged: "No downloaded update",
      harnessStaged: "Downloaded version {version}",
      harnessVerified: "SHA-256 verified",
      harnessUnverified: "No SHA-256 provided",
      harnessCheckFailed: "Update check failed",
      harnessDownloadFailed: "Update download failed",
      harnessDownloaded: "Update downloaded",
      harnessInstallStarted: "Installer started; restart DSH when it finishes",
      harnessRestarting: "Restarting DSH…",
      harnessNotes: "Release notes",
      harnessNoFeed: "Configure an update feed first",
      harnessOpened: "Downloads folder opened",
      harnessFetching: "Checking…",
      planTimeline: "Next 7 days timeline",
      planTimelineEmpty: "Nothing planned in the next 7 days",
      versionChannels: "Release channels",
      otherVersions: "Other versions (GitHub Releases)",
      releasePrerelease: "Prerelease",
      releaseNoAssetShort: "No installer",
      releaseDownload: "Download this version",
      releaseListEmpty: "No releases returned",
      customInstaller: "Custom installer URL",
      customShaPlaceholder: "SHA-256 (optional, 64 hex)",
      customDownload: "Download custom installer",
      customSource: "Custom source",
      customDownloaded: "Custom installer downloaded ({size}) — verify the hash before approving",
      customApproveLabel: "I confirm this installer source is trusted and I verified its SHA-256",
      harnessCheckAndDownload: "Check and download",
      harnessAutoDownloaded: "Update {version} downloaded automatically — approve the install below",
      harnessApproveLabel: "I verified the version and SHA-256; approve the install",
      harnessApproveInstall: "Approve install",
      harnessApproveNeedVerified: "Approval requires a SHA-256-verified download; otherwise enable \"Allow automatic install and restart\"",
      harnessApproveSuccess: "Approved; installer started",
      harnessAutoCheckLabel: "Auto-check updates (notify only, never install)",
      harnessAutoCheckHint: "Checks at most once every 6 hours; shows a header badge and a system notification when a new version exists.",
      harnessNewVersionNotify: "Harness {version} is available — open Insights → System to review it.",
      harnessUpdateBadge: "New version {version}",
      harnessOfficialTemplate: "Fill official feed template",
      harnessTemplateFilled: "Template filled — replace the host with the official release URL",
      harnessCopyManifest: "Copy manifest template",
      harnessCopied: "Manifest template copied",
      harnessShowTemplate: "Show manifest template",
      harnessHideTemplate: "Hide manifest template",
      harnessFeedTemplateWarning: "This is the example.com template feed — replace it with the official release URL before checking or downloading",
      harnessUseOfficial: "Use official GitHub Releases",
      harnessOfficialFilled: "Official GitHub Releases feed saved — you can run \"Check and download\" now",
      harnessOfficialSource: "From official GitHub Releases",
      harnessNoAsset: "This release has no installer asset; download it manually from the official page",
      harnessOfficialDownload: "Open official download page",
      harnessWorking: "Working…",
      harnessDirectButton: "Fetch official installer (direct link)",
      harnessDirectSource: "Official direct link",
      harnessOfficialBuild: "Latest official stable build",
      harnessDirectDownloaded: "Official installer downloaded ({size}) — verify the hash and approve the install",
      harnessApproveOfficialLabel: "I confirm the download comes from download.deepseek.com and I verified its hash",
      harnessNotesExpand: "Show full notes",
      harnessNotesCollapse: "Collapse notes",
      harnessReleasePage: "Open release page",
      harnessHash: "SHA-256",
      harnessOfficialBuildOlder: "The official direct build may be older than the installed one ({time}) — check before installing",
      harnessDirectDownloadedOld: "Official installer downloaded ({size}, build {time}); it may be older than the installed build — approve carefully",
      systemUpdated: "Data updated",
      recordsEmpty: "No custom types yet — create one",
      newRecordType: "New type",
      editType: "Edit type",
      recordTypeName: "Type name",
      recordTypeFields: "Fields",
      addField: "Add field",
      fieldLabel: "Field label",
      fieldOptions: "Options (comma separated)",
      fieldText: "Text",
      fieldNumber: "Number",
      fieldDate: "Date",
      fieldCheckbox: "Checkbox",
      fieldSelect: "Select",
      saveType: "Save type",
      deleteType: "Delete type",
      typeNameRequired: "Type name is required",
      typeDeleteHint: "This type has {count} records; deleting the type removes them too",
      newRecord: "New record",
      emptyRecords: "No records yet",
      recordTitlePlaceholder: "Record title (optional)",
      newView: "Save as view",
      saveView: "Save view",
      viewNamePlaceholder: "View name (blank = auto)",
      defaultViewName: "View {n}",
      viewSaved: "View saved",
      viewApplied: "View applied",
      viewNotes: "Notes",
      viewTasks: "Tasks",
      searchPlaceholder: "Search title, body, or tags",
      newNote: "New note",
      newTask: "New task",
      untitled: "Untitled",
      deleteItem: "Delete",
      deleteConfirm: "Click again to delete",
      export: "Export",
      import: "Import",
      refresh: "Refresh",
      back: "Back to chat",
      titlePlaceholder: "Title (optional)",
      noteBodyPlaceholder: "Write something here…",
      taskBodyPlaceholder: "Notes (optional)…",
      tagsPlaceholder: "Tags, comma separated",
      taskOpen: "Open",
      taskDone: "Done",
      dueLabel: "Due",
      emptyNotes: "No notes yet — create one.",
      emptyTasks: "No tasks yet — create one.",
      allHidden: "All modules are hidden — enable one in Settings → Console settings.",
      noMatches: "No matching items.",
      filterAll: "All",
      filterOpen: "Open",
      filterDone: "Done",
      filterToday: "Today",
      filterOverdue: "Overdue",
      priorityLabel: "Priority",
      priorityLow: "Low",
      priorityNormal: "Normal",
      priorityHigh: "High",
      reminderText: "Console: due today {today}, overdue {overdue}",
      reminderMeds: "Medication due: {times}",
      reminderCards: "Cards due: {count}",
      writeModeTitle: "Sync write mode",
      writeModeHint: "Incremental (PATCH) sends only changed items; full (PUT) is for debugging or compatibility.",
      writeModePatch: "Incremental PATCH",
      writeModeFull: "Full PUT",
      markdownTitle: "Markdown folder",
      markdownHint: "Export notes/tasks/cards as .md with front matter, or import a folder (duplicates skipped). Leave empty for the default folder.",
      markdownDirPlaceholder: "Absolute folder path (empty = default)",
      markdownExport: "Export to folder",
      markdownImport: "Import from folder",
      markdownExported: "Exported {count} Markdown files to {dir}",
      markdownImported: "Imported {imported}, skipped {skipped} ({dir})",
      markdownFailed: "Markdown operation failed",
      voiceCapture: "Voice note",
      voiceRecording: "Recording… click to stop",
      voiceBusy: "Transcribing…",
      voiceUnavailable: "Speech service unavailable",
      voicePermission: "Microphone permission denied",
      voiceEmpty: "No speech recognized",
      voiceFailed: "Transcription failed",
      voiceSaved: "Voice note saved",
      shareTitle: "Read-only snapshot",
      shareHint: "Generate a standalone HTML file with notes/tasks/cards for offline viewing or sharing.",
      shareCreate: "Generate snapshot",
      shareCreated: "Snapshot created: {path}",
      shareFailed: "Snapshot failed",
      optimizerTitle: "Optimizer",
      optimizerRefresh: "Refresh",
      optimizerEfficiencyTitle: "Token efficiency & cost",
      optimizerScore: "Efficiency score",
      optimizerCacheBar: "Cache",
      optimizerCostBar: "Cost",
      optimizerOutputBar: "Output",
      optimizerCacheHit: "Cache hit rate",
      optimizerTarget: "target",
      optimizerTodayCost: "Today cost",
      optimizerWeekCost: "Last 7 days",
      optimizerAvgCost: "Cost per session",
      optimizerOutputRatio: "Output ratio",
      optimizerTotalTokens: "Total tokens",
      optimizerCacheSaving: "Cache upside",
      optimizerDaily: "Cost · last 14 days",
      optimizerRecommendations: "Recommendations",
      optimizerNoUsage: "No usage data yet; check the session projection cache and pricing settings.",
      optimizerCleanupTitle: "Disk cleanup",
      optimizerCleanupHint: "Scans plugin data and every workspace for temp files, caches, and build outputs. Only checked categories are removed; build outputs need explicit confirmation.",
      optimizerScan: "Rescan",
      optimizerScanning: "Scanning…",
      optimizerCleanSelected: "Clean selected",
      optimizerCleaning: "Cleaning…",
      optimizerCleaned: "Removed {removed} items, freed {freed}",
      optimizerFailed: "Operation failed",
      optimizerNothing: "Nothing to clean",
      optimizerRoots: "{count} workspace(s)",
      optimizerScanned: "scanned {count} files",
      optimizerFiles: "items",
      optimizerReportOnly: "Report only",
      optimizerSafe: "Safe to clean",
      optimizerCaution: "Rebuildable, confirm first",
      optimizerCatPluginAttachments: "Orphan attachments",
      optimizerCatPluginStaging: "Staged installers",
      optimizerCatPluginTemp: "Plugin temp files",
      optimizerCatWorkspaceJunk: "Workspace temp files",
      optimizerCatWorkspaceCaches: "Workspace caches",
      optimizerCatWorkspaceBuilds: "Workspace build outputs",
      optimizerCatLargeStale: "Large stale files",
      optimizerBudget: "Daily budget (¥)",
      optimizerBudgetSave: "Save budget",
      optimizerBudgetHint: "Set a daily cost budget to see today's progress and an overspend alert.",
      optimizerBudgetUsage: "Used ¥{used} of ¥{budget} today ({percent}%)",
      optimizerBudgetOver: "Spent ¥{used} today — over the ¥{budget} budget!",
      optimizerTopSessions: "Top sessions",
      optimizerExport: "Export optimizer report",
      optimizerExporting: "Exporting…",
      optimizerExported: "Report saved: {path}",
      optimizerHistory: "Recent cleanups",
      optimizerHistoryLine: "{time} · removed {removed} / freed {freed}",
      optimizerHistoryNoUndo: "not undoable",
      optimizerShare: "Share report snapshot",
      optimizerSharing: "Generating…",
      optimizerShared: "Snapshot created: {path}",
      optimizerWorkspaces: "Workspace cost detail",
      optimizerWorkspaceHint: "Click a workspace to inspect its expensive sessions",
      optimizerWorkspaceSessions: "Sessions in this workspace",
      reminderBudget: "Budget exceeded: spent ¥{used} of ¥{limit} today",
      reminderBudgetWarn: "Budget warning: spent ¥{used} ({percent}% of ¥{limit} today)",
      optimizerUndo: "Undo cleanup",
      optimizerUndone: "Restored {restored} item(s)",
      optimizerUndoFailed: "Undo failed or expired",
      optimizerOpenSession: "Open this conversation",
      optimizerMonthlyBudget: "Monthly budget (¥)",
      optimizerMonthlyUsage: "Used ¥{used} of ¥{budget} this month ({percent}%)",
      optimizerMonthlyCurve: "30-day cost curve",
      optimizerSchedule: "Auto-clean schedule",
      optimizerScheduleOff: "Off",
      optimizerScheduleDaily: "Daily",
      optimizerScheduleWeekly: "Weekly",
      optimizerAutoRun: "Run auto-clean now",
      optimizerAutoDone: "Auto-clean done: {removed} items / {freed}",
      optimizerTrash: "Trash: {count} record(s) / {size}",
      optimizerTrashEmpty: "Empty trash",
      optimizerTrashCleared: "Trash emptied",
      optimizerTrashRemaining: "~{hours}h left to undo",
      optimizerWebhook: "Budget webhook",
      optimizerWebhookSave: "Save webhook",
      optimizerWebhookHint: "At 80% or overspend the Host timer POSTs one JSON notification to this URL (once per day).",
      optimizerReportRange: "Report date range:",
      optimizerReportFrom: "Start date",
      optimizerReportTo: "End date",
      optimizerScheduleLast: "Last auto-clean: {time}",
      optimizerScheduleNext: "Next due: {time}",
      optimizerAutoTag: "auto",
      optimizerWebhookTemplate: "Webhook template",
      optimizerWebhookGeneric: "Generic JSON",
      optimizerWebhookSlack: "Slack",
      optimizerWebhookFeishu: "Feishu",
      optimizerWebhookTest: "Send test",
      optimizerWebhookTestOk: "Test sent (HTTP {status})",
      optimizerWebhookTestFailed: "Test failed or no webhook configured",
      optimizerTrashRecords: "Trash records",
      optimizerTrashSearch: "Search trash (id / date)",
      optimizerTrashRestore: "Restore selected",
      optimizerTrashRestored: "Restored {restored} item(s)",
      optimizerShareStats: "Share visit stats",
      scheduleLogTitle: "Cleanup schedule",
      scheduleLogHint: "Auto-clean history, next run, and failure retry",
      scheduleLogEmpty: "No auto-clean runs yet",
      scheduleLogOk: "OK",
      scheduleLogFailed: "Failures",
      scheduleRetry: "Retry",
      optimizerScheduleTime: "Run time",
      optimizerWebhookQueue: "Webhook failure queue",
      optimizerWebhookRetry: "Retry queue",
      optimizerWebhookRetried: "Retried: {sent} sent, {remaining} remaining",
      optimizerShareRefs: "Referrers",
      optimizerTrashCapacityWarn: "Trash is nearing capacity — empty it soon",
      optimizerScheduleCron: "Cron",
      optimizerScheduleCronHint: "Five-field cron: minute hour day month weekday, e.g. 0 3 * * 1",
      optimizerShareCsv: "Export CSV",
      optimizerShareCsvDone: "CSV saved: {path} ({count} rows)",
      optimizerTrashTypeAll: "All",
      optimizerTrashTypeAttachments: "Attachments",
      optimizerTrashTypeTemp: "Temp",
      optimizerTrashTypeCache: "Cache",
      optimizerTrashTypeBuilds: "Builds",
      optimizerCronPreview: "Preview next 5",
      optimizerCronNext: "Next runs",
      optimizerWebhookResend: "Resend",
      optimizerWebhookEdit: "Edit",
      optimizerWebhookEditSave: "Save & resend",
      optimizerTrashWorkspace: "Filter by workspace",
      optimizerTrashWorkspaceAll: "All workspaces",
      optimizerScheduleTimezone: "Timezone",
      optimizerWebhookBatch: "Batch edit payload",
      optimizerWebhookBatchApply: "Apply to selected",
      optimizerWebhookBatchResend: "Batch resend",
      optimizerWebhookBatchRemove: "Batch remove",
      optimizerPresets: "Quick presets",
      optimizerPresetAll: "All",
      optimizerPresetAttachments: "Attachments only",
      optimizerPresetTemp: "Temp only",
      optimizerPresetBuilds: "Builds only",
      optimizerSharePng: "Export PNG chart",
      optimizerSharePngDone: "PNG saved: {path} ({count} rows)",
      optimizerPresetSave: "Save current preset",
      optimizerPresetName: "Preset name",
      optimizerPresetDelete: "Delete preset",
      reviewForecastTitle: "Forgetting curve forecast",
      reviewDaysShort: "d",
      reviewGoalHistory: "Goal history",
      medAdherenceWeek: "Weekly adherence",
      medLogIntake: "Log taken",
      shortcutTitle: "Keyboard shortcuts",
      shortcutPalette: "Open command palette",
      shortcutRate: "Rate: again/hard/good",
      shortcutReveal: "Reveal answer",
      shortcutUndo: "Undo last rating",
      shortcutClose: "Close panel/review",
      shortcutHelp: "Show shortcuts",
      backupInterval: "Auto-backup interval (minutes)",
      backupDiff: "Diff preview",
      backupDiffSummary: "Diff vs current: +{added} · -{removed} · ~{changed} ({name})",
      backupDiffSettings: "Settings also changed",
      reviewHalfLife: "Half-life",
      medRemindersOn: "Med reminders: on",
      medRemindersOff: "Med reminders: off",
      shortcutCustomTitle: "Custom shortcuts",
      backupProgress: "Auto-backup progress",
      optimizerCronMulti: "Multi-timezone compare",
      optimizerWebhookExport: "Export queue",
      optimizerWebhookImport: "Import queue",
      optimizerWebhookExportDone: "Queue exported: {path} ({count})",
      optimizerWebhookImportDone: "Imported {imported}, {remaining} remaining",
      optimizerWebhookImportFailed: "Import JSON must be an array of queue items",
      optimizerPresetMoveUp: "Move preset up",
      optimizerPresetMoveDown: "Move preset down",
      optimizerSavingsPotential: "Potential savings",
      optimizerSavingsHint: "Cumulative estimate after cache hit reaches target",
      optimizerCostBreakdown: "Cost breakdown",
      optimizerCostHit: "Cached input",
      optimizerCostMiss: "Uncached input",
      optimizerCostOutput: "Output",
      optimizerCostProjection: "Cost projection",
      optimizerCurrentCost: "Current cumulative",
      optimizerAfterCost: "Projected after optimization",
      optimizerProjectionSaving: "Save {percent}% · ¥{amount}",
      optimizerWorkspaceCostBars: "Cost by workspace",
      optimizerCacheTrend30: "30-day cache hit rate",
      optimizerLatest: "Latest",
      optimizerSavingsDetail: "Show calculation",
      optimizerSavingsHide: "Hide calculation",
      optimizerSavingsFormulaTitle: "Calculation",
      optimizerInputTokens: "Total input tokens",
      optimizerCurrentCache: "Current cache hit rate",
      optimizerTargetCache: "Target hit rate",
      optimizerPotentialCache: "Potential hit rate",
      optimizerPriceGap: "Hit vs miss price gap",
      optimizerSavingsFormula: "Input tokens × hit-rate gain × price gap ÷ 1,000,000",
      optimizerAutoSavingsTitle: "Auto savings",
      optimizerAutoSavingsHint: "Compaction/pruning status, context pressure, and budget",
      optimizerAutoStatus: "Auto-saving capability",
      optimizerAutoCompaction: "Auto compaction",
      optimizerAutoPruner: "Tool-result pruning",
      optimizerAutoCommand: "Compact command",
      optimizerContextPressure: "Current context pressure",
      optimizerContextNoData: "No context data yet (send a message first)",
      optimizerCompressible: "Estimated {amount} tokens compressible",
      optimizerOpenPlugins: "Open plugin settings",
      optimizerBudgetStatus: "Budget status",
      optimizerAutoBudgetDaily: "Daily budget",
      optimizerAutoBudgetMonthly: "Monthly budget",
      optimizerSavingsMode: "Savings mode",
      optimizerSavingsGuard: "Budget guard",
      optimizerSavingsModeOff: "Enable savings mode",
      optimizerSavingsModeOn: "Disable savings mode",
      optimizerSavingsModel: "Savings model: {model}",
      optimizerThriftTitle: "High-cost workspace thrift",
      optimizerCheckBudget: "Check budget",
      optimizerCurrentModel: "Current default model",
      systemSavings: "Budget & savings policy",
      systemSavingsHint: "Daily/monthly budget, savings mode, and model strategy entry",
      systemOpenOptimizer: "Open optimizer",
      systemBudget: "Daily budget",
      systemMonthlyBudget: "Monthly budget",
      systemOn: "On",
      systemOff: "Off",
      valueHighValueWorkspaces: "High-value workspaces",
      valueHighCostWorkspaces: "High-cost workspaces",
      usageWorkspaceCostTrend: "Workspace cost trend",
      usageCostForecast: "Forecast monthly cost",
      usageForecastDaily: "Daily avg",
      scheduleNextRun: "Next run",
      scheduleLastResult: "Last result",
      scheduleSuccessRate: "Success count",
      scheduleSummary: "Auto-clean summary",
      optimizerThriftSelected: "{count} thrift workspaces",
      optimizerActualCost: "Actual cost",
      optimizerBaselineCost: "No-cache baseline",
      optimizerCumulativeSaved: "Cumulative saved",
      optimizerModelCandidates: "Savings model candidates",
      optimizerNoCheaperModel: "No cheaper model discovered",
      optimizerDiscoverModel: "Discover savings models",
      optimizerChooseModel: "Savings model selection",
      optimizerAutoModel: "Auto select",
      optimizerSavingsEffect: "Savings effect",
      optimizerBeforeMode: "Before avg",
      optimizerAfterMode: "After avg",
      optimizerNoEffectData: "No before/after data yet",
      optimizerRecommendationSaving: "Save ¥{amount}",
      reminderView: "Open",
      reminderDismiss: "Dismiss",
      historyTitle: "Recent reviews",
      historyEmpty: "No review history yet",
      overviewTitle: "Metric trends",
      metricAvg: "Average",
      metricMin: "Min",
      metricMax: "Max",
      metricCount: "Count",
      detailBack: "Back to list",
      detailEmpty: "No readings",
      recordOnce: "Record once",
      recordSaved: "Recorded",
      retentionTitle: "Retention",
      retentionDay1: "within 1 day",
      retentionDay6: "2–6 days",
      retentionDay29: "7–29 days",
      retentionDay30: "30+ days",
      saveEdit: "Save",
      cancelEdit: "Cancel",
      suggestReview: "Suggested next",
      compare: "Compare",
      notifySection: "Alerts",
      notifyTitle: "Medication reminder",
      notifyEnable: "Allow notifications",
      notifyGranted: "Notifications allowed",
      notifyDenied: "Not allowed",
      notifyUnavailable: "Notifications are unavailable here",
      suggestOverdue: "Overdue — review soon",
      compareEmpty: "No metrics to compare",
      briefLabel: "Add today's due tasks to each request",
      briefHint: "When on, the agent receives a short summary of due-today and overdue tasks on every request (only when something is due).",
      layoutList: "List",
      layoutBoard: "Board",
      groupNone: "Flat",
      groupPriority: "By priority",
      groupTags: "By tag",
      noTags: "No tag",
      viewCards: "Review",
      newCard: "New card",
      startReview: "Start review",
      stopReview: "Exit review",
      showAnswer: "Show answer",
      rateAgain: "Again",
      rateHard: "Hard",
      rateGood: "Good",
      noDueCards: "No cards due",
      reviewDone: "Review finished: {count} cards",
      cardFront: "Front",
      cardBack: "Back",
      frontPlaceholder: "Front (question / term)",
      backPlaceholder: "Back (answer / explanation)",
      dueNow: "Due now",
      dueIn: "in {days} d",
      moduleCards: "Show \"Review\"",
      reviewEmptyBack: "(no back)",
      viewHealth: "Health",
      healthMetric: "Metrics",
      healthMed: "Meds",
      newMetric: "New reading",
      newMed: "Add medication",
      moduleHealth: "Show \"Health\"",
      metricNamePlaceholder: "Metric name (e.g. blood pressure / weight)",
      metricValuePlaceholder: "Value",
      metricValue2Placeholder: "Second value (e.g. diastolic)",
      metricUnitPlaceholder: "Unit (e.g. mmHg)",
      measuredAt: "Measured at",
      medNamePlaceholder: "Medication / dose",
      medBodyPlaceholder: "Directions (optional)…",
      medTimesPlaceholder: "Dose times HH:mm, comma separated",
      medActive: "Active",
      medInactive: "Paused",
      healthTodayMeds: "Today's medication",
      healthNoMeds: "No active medication plans.",
      healthRecordCount: "Last 30 days",
      emptyMetrics: "No readings yet — add one.",
      emptyMeds: "No medication plans yet — add one.",
      emptyCards: "No cards yet — create one.",
      chartTitle: "Trend",
      chartEmpty: "No history for this metric yet",
      badTimes: "Use HH:mm times such as 08:00",
      saveToNotes: "Save to notes",
      savingNote: "Saving…",
      savedNote: "Saved to notes",
      existsNote: "Already in notes",
      noteSaveFailed: "Could not save",
      saveSessionNote: "Save session as note",
      savedSessionNote: "Session note saved",
      existsSessionNote: "Session note already exists",
      sessionNoteFailed: "Could not save session note",
      sessionNoteFallback: "Session note",
      quickNoteDock: "{due} due · {cards} review · {meds} meds",
      quickNoteDockTitle: "Open management console",
      quickCapture: "Quick capture",
      quickCaptureTitle: "Open the console to capture quickly",
      attachmentsTitle: "Attachments",
      addAttachment: "Add attachment",
      uploading: "Uploading…",
      attachmentsCount: "{count} file(s)",
      attachmentsAdded: "Added {count} attachment(s)",
      attachmentFailed: "Could not upload attachment",
      attachmentRemove: "Remove attachment",
      statDue: "Due",
      statToday: "Reviewed today",
      statStreak: "Streak",
      statHeat: "Last 30 days",
      statRatings: "Last 30 days ratings",
      selectHint: "Pick an item on the left to start editing.",
      chars: "characters",
      saved: "Synced to Host",
      statusSynced: "Synced",
      statusSaving: "Syncing",
      statusOffline: "Offline",
      statusLoading: "Loading",
      saving: "Syncing…",
      offline: "Host unreachable — saved in this browser only",
      loading: "Loading…",
      exported: "Exported",
      imported: "Imported",
      importEmpty: "Nothing importable in that file",
      importFailed: "Import failed: not valid JSON",
      storageUnknown: "Unknown (Host unreachable)",
      countLabel: "Items",
      settingsTitle: "Console settings",
      settingsHint: "Choose which modules the workbench shows; their data is kept either way.",
      modulesTitle: "Visible modules",
      appearanceTitle: "Appearance",
      paletteTitle: "Command palette",
      palettePlaceholder: "Search items or run an action…",
      paletteActions: "Quick actions",
      paletteItems: "Items",
      paletteEmpty: "No matches",
      paletteOpen: "Open command palette",
      paletteShortcut: "Ctrl/⌘ K",
      pinItem: "Pin",
      unpinItem: "Unpin",
      overviewPinned: "Pinned",
      dueToday: "Today",
      dueTomorrow: "Tomorrow",
      dueNextWeek: "Next week",
      reviewUndo: "Undo last rating",
      reviewUndone: "Last rating undone",
      reviewGoalLabel: "Daily review goal",
      reviewGoalHint: "Used by the review progress bar (1–500)",
      reviewProgress: "Reviewed today: {done} / {goal}",
      backupTitle: "Data backups",
      backupNow: "Back up now",
      backupExport: "Export full backup",
      backupImport: "Import full backup",
      backupEmpty: "No automatic backups yet",
      backupRestore: "Restore",
      backupRestoreConfirm: "Confirm restore",
      backupHint: "Rolling backups after writes (up to 10, about one every 5 minutes)",
      backupCreated: "Backup created",
      backupRestored: "Restored from backup",
      backupFailed: "Backup operation failed",
      subtasksTitle: "Checklist",
      subtaskPlaceholder: "Add a checklist item",
      addSubtask: "Add",
      repeatLabel: "Repeat",
      repeatNone: "None",
      repeatDaily: "Daily",
      repeatWeekly: "Weekly",
      repeatMonthly: "Monthly",
      taskStatsToday: "Done today {done}/{total}",
      taskStatsWeek: "Done this week {count}",
      taskStatsOverdue: "Overdue {count}",
      healthRangeTitle: "Reference range",
      rangeMin: "Min",
      rangeMax: "Max",
      rangeHigh: "High",
      rangeLow: "Low",
      rangeNormal: "Normal",
      rangeMissing: "No range",
      reviewModeLabel: "Review scope",
      reviewModeDue: "Due",
      reviewModeNew: "New",
      reviewModeAll: "All",
      focusMode: "Focus mode",
      focusExit: "Exit focus",
      reviewKeysHint: "1 again · 2 hard · 3 good · Space answer · Esc exit",
      viewCalendar: "Calendar",
      calendarToday: "Today",
      calendarDayEmpty: "Nothing scheduled",
      calendarMonthFmt: "{month}/{year}",
      calendarMore: "+{count} more",
      calendarMeds: "Meds",
      calendarMedsHint: "Show or hide medication plans in the calendar",
      calendarMedGroup: "{title} ×{count}",
      densityTitle: "Density",
      densityComfortable: "Comfortable",
      densityCompact: "Compact",
      accentTitle: "Accent color",
      accentDefault: "Default",
      accentSuccess: "Green",
      accentWarn: "Amber",
      accentError: "Red",
      accentCustom: "Custom",
      moduleNotes: "Show \"Notes\"",
      moduleRecords: "Show \"Records\"",
      moduleTasks: "Show \"Tasks\"",
      storageTitle: "Storage",
      syncNow: "Sync now",
      renderFailed: "The console panel failed to render",
      renderFailedHint: "Reload the page to retry; details are below.",
      reload: "Reload",
      diagnostics: "Diagnostics",
    };



    /** Use the framework's `t` seat, or fall back to the local dictionary when it is absent. */
    function translateSeat(seat) {
      if (typeof seat === 'function') return seat;
      const dict = /^zh/i.test(String(window.navigator && window.navigator.language)) ? zh : en;
      return (key) => (Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : key);
    }

    /** Mint an id without depending on crypto.randomUUID being available. */
    function nextItemId() {
      return 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    /** localStorage read that never throws. */
    function readStored(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        return null;
      }
    }

    /** localStorage write that never throws. */
    function writeStored(key, value) {
      try {
        window.localStorage.setItem(key, value);
        return true;
      } catch (error) {
        return false;
      }
    }

    /** localStorage delete that never throws. */
    function removeStored(key) {
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        // a leftover key is harmless
      }
    }

    const KINDS = ['note', 'task', 'card', 'metric', 'med', 'record'];
    const PRIORITIES = ['low', 'normal', 'high'];
    const REPEATS = ['none', 'daily', 'weekly', 'monthly'];
    const HEALTH_KINDS = ['metric', 'med'];
    const RECORD_FIELD_TYPES = ['text', 'number', 'date', 'checkbox', 'select'];

    /** Coerce one health payload (metric reading or medication plan). */
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
            .filter((entry) => entry && typeof entry.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(entry.date) && typeof entry.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(entry.time) && typeof entry.at === 'number' && Number.isFinite(entry.at))
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

    /** Coerce one SM-2 review schedule. */
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

    /** Coerce the review log (one record per rated card). */
    function normalizeReviewLog(raw) {
      if (!Array.isArray(raw)) return [];
      const records = [];
      for (const entry of raw) {
        if (!entry || typeof entry !== 'object') continue;
        if (typeof entry.itemId !== 'string' || entry.itemId.length === 0) continue;
        if (![1, 2, 3, 4, 5].includes(entry.quality)) continue;
        if (typeof entry.at !== 'number' || !Number.isFinite(entry.at)) continue;
        records.push({ itemId: entry.itemId.slice(0, 80), quality: entry.quality, at: entry.at });
      }
      return records.slice(-5000);
    }

    /** Coerce one custom-record payload (type plus field values). */
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

    /** Coerce the fields of one custom record type. */
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

    /** Coerce the saved filter views of one custom record type. */
    function normalizeTypeViews(raw) {
      if (!Array.isArray(raw)) return [];
      const views = [];
      const now = Date.now();
      for (const entry of raw) {
        if (!entry || typeof entry !== 'object') continue;
        const name = typeof entry.name === 'string' ? entry.name.trim().slice(0, 60) : '';
        if (name.length === 0) continue;
        views.push({
          id: typeof entry.id === 'string' && entry.id.length > 0 ? entry.id.slice(0, 80) : nextItemId(),
          name,
          query: typeof entry.query === 'string' ? entry.query.slice(0, 200) : '',
          sort: entry.sort === 'title' ? 'title' : 'updated',
          createdAt: typeof entry.createdAt === 'number' && Number.isFinite(entry.createdAt) ? entry.createdAt : now,
        });
      }
      return views.slice(0, 20);
    }

    /** Coerce custom record type definitions. */
    function normalizeTypes(raw) {
      if (!Array.isArray(raw)) return [];
      const types = [];
      const now = Date.now();
      for (const entry of raw) {
        if (!entry || typeof entry !== 'object') continue;
        const name = typeof entry.name === 'string' ? entry.name.trim().slice(0, 60) : '';
        if (name.length === 0) continue;
        types.push({
          id: typeof entry.id === 'string' && entry.id.length > 0 ? entry.id.slice(0, 80) : nextItemId(),
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
     * Coerce one item into the shape the panel draws.
     * @param raw - candidate item.
     * @returns the canonical item, or undefined when unusable.
     */
    /** Normalize bounded attachment refs stored on one item. */
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
      const now = Date.now();
      const tags = Array.isArray(raw.tags)
        ? raw.tags.filter((tag) => typeof tag === 'string' && tag.trim().length > 0).map((tag) => tag.trim().slice(0, 40)).slice(0, 12)
        : [];
      return {
        id: raw.id.slice(0, 80),
        kind: KINDS.includes(raw.kind) ? raw.kind : 'note',
        title: typeof raw.title === 'string' ? raw.title.slice(0, 200) : '',
        body: typeof raw.body === 'string' ? raw.body.slice(0, 200000) : '',
        tags,
        status: raw.status === 'done' ? 'done' : 'open',
        priority: PRIORITIES.includes(raw.priority) ? raw.priority : 'normal',
        due: typeof raw.due === 'number' && Number.isFinite(raw.due) ? raw.due : null,
        doneAt: typeof raw.doneAt === 'number' && Number.isFinite(raw.doneAt) ? raw.doneAt : null,
        review: normalizeReview(raw.review),
        health: HEALTH_KINDS.includes(KINDS.includes(raw.kind) ? raw.kind : 'note') ? normalizeHealth(raw.health) : normalizeHealth(undefined),
        record: raw.kind === 'record' ? normalizeRecord(raw.record) : normalizeRecord(undefined),
        order: typeof raw.order === 'number' && Number.isFinite(raw.order) ? raw.order : null,
        createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : now,
        updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : now,
        rev: typeof raw.rev === 'number' && Number.isFinite(raw.rev) && raw.rev >= 0 ? Math.floor(raw.rev) : 0,
        deletedAt: typeof raw.deletedAt === 'number' && Number.isFinite(raw.deletedAt) ? raw.deletedAt : null,
        checklist:
          raw.kind === 'task' && Array.isArray(raw.checklist)
            ? raw.checklist
                .filter((row) => row && typeof row === 'object' && typeof row.id === 'string' && row.id.length > 0)
                .slice(0, 50)
                .map((row) => ({
                  id: row.id.slice(0, 80),
                  text: typeof row.text === 'string' ? row.text.slice(0, 200) : '',
                  done: row.done === true,
                }))
            : [],
        repeat: raw.kind === 'task' && REPEATS.includes(raw.repeat) ? raw.repeat : 'none',
        attachments: normalizeAttachments(raw.attachments),
      };
    }

    /** Normalize an item array. */
    function normalizeItems(raw) {
      if (!Array.isArray(raw)) return [];
      const items = [];
      for (const entry of raw) {
        const item = normalizeItem(entry);
        if (item !== undefined) items.push(item);
      }
      return items;
    }

    /** Canonical view metadata shared by tabs, palette actions, and icons. */
    const VIEW_META = {
      overview: { icon: 'overview', tabKey: 'viewOverview' },
      all: { icon: 'all', tabKey: 'viewAll' },
      calendar: { icon: 'calendar', tabKey: 'viewCalendar' },
      insights: { icon: 'value', tabKey: 'viewInsights' },
      knowledge: { icon: 'note', tabKey: 'viewKnowledge' },
      plan: { icon: 'task', tabKey: 'viewPlan' },
      system: { icon: 'system', tabKey: 'viewSystem' },
      usage: { icon: 'usage', tabKey: 'viewUsage' },
      value: { icon: 'value', tabKey: 'viewValue' },
      note: { icon: 'note', tabKey: 'viewNotes' },
      task: { icon: 'task', tabKey: 'viewTasks' },
      card: { icon: 'card', tabKey: 'viewCards' },
      health: { icon: 'health', tabKey: 'viewHealth' },
      record: { icon: 'record', tabKey: 'viewRecords' },
    };

    /** Canonical kind metadata: owning view, label/copy keys, and icon. */
    const KIND_META = {
      note: { view: 'note', icon: 'note', labelKey: 'viewNotes', newKey: 'newNote', hintKey: 'quickNoteHint' },
      task: { view: 'task', icon: 'task', labelKey: 'viewTasks', newKey: 'newTask', hintKey: 'quickTaskHint' },
      card: { view: 'card', icon: 'card', labelKey: 'viewCards', newKey: 'newCard', hintKey: 'quickCardHint' },
      metric: { view: 'health', icon: 'health', labelKey: 'healthMetric', newKey: 'newMetric', hintKey: 'quickMetricHint' },
      med: { view: 'health', icon: 'check', labelKey: 'healthMed', newKey: 'newMed', hintKey: 'quickMedHint' },
      record: { view: 'record', icon: 'record', labelKey: 'viewRecords', newKey: 'newRecord', hintKey: 'quickRecordHint' },
    };

    /** HH:mm label for one timestamp (calendar event chips). */
    function formatClock(ms) {
      const date = new Date(ms);
      const pad = (part) => String(part).padStart(2, '0');
      return pad(date.getHours()) + ':' + pad(date.getMinutes());
    }

    /** Newest-updated first, the order the list and the selection follow. */
    function newestFirst(items) {
      return items.slice().sort((left, right) => right.updatedAt - left.updatedAt);
    }

    /** Module view that owns one item kind. */
    function viewOfKind(kind) {
      const meta = KIND_META[kind];
      return meta === undefined ? kind : meta.view;
    }

    /** Localized module label for one item kind. */
    function kindLabel(kind, t) {
      const meta = KIND_META[kind];
      return t(meta === undefined ? 'viewNotes' : meta.labelKey);
    }

    /** Display title of one custom record: explicit title or the first non-empty field. */
    function recordTitle(item, type) {
      if (item.title.trim().length > 0) return item.title;
      for (const field of type.fields) {
        const value = item.record.values[field.key];
        if (typeof value === 'string' && value.trim().length > 0) return value.trim().slice(0, 80);
        if (typeof value === 'number') return String(value);
      }
      return '';
    }

    /** Manual board order value; unordered items sink below ordered ones. */
    function orderValue(item) {
      return item.order === null ? Number.POSITIVE_INFINITY : item.order;
    }

    /** Sort one board column by manual order, then recency. */
    function sortBoardColumn(items) {
      return items.slice().sort((left, right) => orderValue(left) - orderValue(right) || right.updatedAt - left.updatedAt);
    }

    /** Count review outcomes over the last `days` days. */
    function reviewDistribution(reviews, days, now) {
      const since = now - days * 24 * 60 * 60 * 1000;
      const counts = { again: 0, hard: 0, good: 0 };
      for (const record of normalizeReviewLog(reviews)) {
        if (record.at < since) continue;
        if (record.quality >= 5) counts.good += 1;
        else if (record.quality >= 3) counts.hard += 1;
        else counts.again += 1;
      }
      return counts;
    }

    /** Retention per interval since the previous review of the same card. */
    function retentionByInterval(reviews) {
      const log = normalizeReviewLog(reviews)
        .slice()
        .sort((left, right) => left.at - right.at);
      const lastByItem = new Map();
      const limits = [1, 6, 29, Number.POSITIVE_INFINITY];
      const buckets = limits.map((limit) => ({ limit, count: 0, success: 0 }));
      for (const record of log) {
        const previous = lastByItem.get(record.itemId);
        lastByItem.set(record.itemId, record.at);
        if (previous === undefined) continue;
        const days = (record.at - previous) / (24 * 60 * 60 * 1000);
        let index = limits.findIndex((limit) => days <= limit);
        if (index < 0) index = limits.length - 1;
        buckets[index].count += 1;
        if (record.quality >= 3) buckets[index].success += 1;
      }
      return buckets.map((bucket) => ({
        limit: bucket.limit,
        count: bucket.count,
        rate: bucket.count === 0 ? null : bucket.success / bucket.count,
      }));
    }

    /** Next interval (days) the SM-2 schedule would pick after a good rating. */
    function suggestNextInterval(review) {
      return applySm2(normalizeReview(review), 5, Date.now()).intervalDays;
    }

    /** Distinct metric names ordered by their latest reading. */
    function metricNameList(items) {
      const latest = new Map();
      for (const item of items) {
        if (item.kind !== 'metric') continue;
        const name = (item.title || item.body.split('\n')[0] || '').trim();
        if (name.length === 0) continue;
        const key = name.toLowerCase();
        const at = item.health.at === null ? item.createdAt : item.health.at;
        if (!latest.has(key) || latest.get(key).at < at) latest.set(key, { name, at });
      }
      return [...latest.values()].sort((left, right) => right.at - left.at).map((entry) => entry.name);
    }

    /** Up to three metric series from the last 30 days, normalized into one tiny chart. */
    function compareSeries(items, now, selected) {
      const since = now - 30 * 24 * 60 * 60 * 1000;
      const wanted = Array.isArray(selected) ? selected.map((name) => name.toLowerCase()) : null;
      const groups = new Map();
      for (const item of items) {
        if (item.kind !== 'metric' || item.health.value === null) continue;
        const name = (item.title || item.body.split('\n')[0] || '').trim();
        if (name.length === 0) continue;
        const at = item.health.at === null ? item.createdAt : item.health.at;
        if (at < since) continue;
        const key = name.toLowerCase();
        if (!groups.has(key)) groups.set(key, { name, rows: [] });
        groups.get(key).rows.push({ at, value: item.health.value });
      }
      const series = [];
      for (const group of groups.values()) {
        if (wanted !== null && !wanted.includes(group.name.toLowerCase())) continue;
        const rows = group.rows.sort((left, right) => left.at - right.at);
        if (rows.length < 2) continue;
        const values = rows.map((row) => row.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const span = max - min === 0 ? 1 : max - min;
        const points = rows
          .map((row, index) => {
            const x = 6 + (index / (rows.length - 1)) * 188;
            const y = 6 + (1 - (row.value - min) / span) * 48;
            return x.toFixed(1) + ',' + y.toFixed(1);
          })
          .join(' ');
        series.push({ name: group.name, points, latestAt: rows[rows.length - 1].at });
      }
      series.sort((left, right) => right.latestAt - left.latestAt);
      return series.slice(0, 3);
    }

    /** Doses already notified today, kept in this browser. */
    function readNotifiedKeys() {
      try {
        const raw = readStored(NOTIFIED_KEY);
        if (raw === null) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((entry) => typeof entry === 'string') : [];
      } catch (error) {
        return [];
      }
    }

    /** Remember notified dose keys, keeping only the recent ones. */
    function writeNotifiedKeys(keys) {
      writeStored(NOTIFIED_KEY, JSON.stringify(keys.slice(-40)));
    }

    /** Best-effort system notification once per due card per day. */
    function notifyDueCards(items, t, onOpen) {
      try {
        if (typeof window.Notification !== 'function' || window.Notification.permission !== 'granted') return;
        const now = Date.now();
        const due = items.filter((item) => item.kind === 'card' && item.deletedAt === null && item.review.dueAt !== null && item.review.dueAt <= now);
        if (due.length === 0) return;
        const dayKey = localDayKey();
        const known = readNotifiedKeys();
        let changed = false;
        for (const card of due.slice(0, 5)) {
          const key = dayKey + '|card|' + card.id;
          if (known.includes(key)) continue;
          known.push(key);
          changed = true;
          const notification = new window.Notification(t('notifyTitle'), { body: (itemTitle(card) || t('viewCards')) + ' · ' + fillTemplate(t('reminderCards'), { count: due.length }), tag: key });
          try {
            if (notification && typeof notification.addEventListener === 'function' && typeof onOpen === 'function') {
              notification.addEventListener('click', () => {
                try {
                  onOpen();
                } catch (error) {
                  // opening the panel is best-effort
                }
              });
            }
          } catch (error) {
            // some notification implementations reject listeners
          }
        }
        if (changed) writeNotifiedKeys(known);
      } catch (error) {
        // notifications are best-effort only
      }
    }

    /** Best-effort system notification for due medication doses (once per dose per day). */
    function notifyDueMeds(items, t, onOpen) {
      try {
        if (typeof window.Notification !== 'function') return;
        if (window.Notification.permission !== 'granted') return;
        const due = medsDueNow(items, Date.now());
        if (due.length === 0) return;
        const dayKey = localDayKey();
        const known = readNotifiedKeys();
        let changed = false;
        for (const dose of due) {
          const key = dayKey + '|' + dose.time + '|' + dose.title;
          if (known.includes(key)) continue;
          known.push(key);
          changed = true;
          const notification = new window.Notification(t('notifyTitle'), { body: dose.time + ' ' + dose.title, tag: key });
          try {
            if (notification && typeof notification.addEventListener === 'function' && typeof onOpen === 'function') {
              notification.addEventListener('click', () => {
                try {
                  onOpen();
                } catch (error) {
                  // opening the panel is best-effort
                }
              });
            }
          } catch (error) {
            // some notification implementations reject listeners
          }
        }
        if (changed) writeNotifiedKeys(known);
      } catch (error) {
        // notifications are best-effort only
      }
    }

    /** Display title: the explicit title, else the first non-empty body line. */
    function itemTitle(item) {
      if (item.title.trim().length > 0) return item.title.trim();
      const line = item.body
        .split('\n')
        .map((part) => part.trim())
        .find((part) => part.length > 0);
      return line === undefined ? '' : line.length > 60 ? line.slice(0, 60) + '…' : line;
    }

    /** Short local timestamp for a row. */
    function formatStamp(updatedAt) {
      const date = new Date(updatedAt);
      const now = new Date();
      const pad = (value) => String(value).padStart(2, '0');
      const time = pad(date.getHours()) + ':' + pad(date.getMinutes());
      if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()) {
        return time;
      }
      return date.getMonth() + 1 + '/' + date.getDate() + ' ' + time;
    }

    /** Absolute due label. */
    function formatDue(due) {
      const date = new Date(due);
      const pad = (value) => String(value).padStart(2, '0');
      return (date.getMonth() + 1) + '/' + date.getDate() + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
    }

    /** Convert milliseconds to a datetime-local input value. */
    function toLocalInput(value) {
      if (value === null) return '';
      const date = new Date(value);
      const pad = (item) => String(item).padStart(2, '0');
      return (
        date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
        'T' + pad(date.getHours()) + ':' + pad(date.getMinutes())
      );
    }

    /** Parse a datetime-local input value back to milliseconds. */
    function fromLocalInput(value) {
      if (typeof value !== 'string' || value.length === 0) return null;
      const parsed = Date.parse(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    /** Parse a free-text numeric input; blank means null. */
    function numberFromInput(value) {
      if (typeof value !== 'string' || value.trim().length === 0) return null;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    /** Local calendar-day key, used to remember a dismissed reminder for the day. */
    function localDayKey() {
      const date = new Date();
      const pad = (part) => String(part).padStart(2, '0');
      return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
    }

    /** Fill `{name}` placeholders in one localized template. */
    function fillTemplate(template, values) {
      return String(template).replace(/\{(\w+)\}/g, (match, key) =>
        Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match,
      );
    }

    /** Count open tasks due today and overdue. */
    function dueCounts(items) {
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      const start = dayStart.getTime();
      const end = start + 24 * 60 * 60 * 1000;
      let today = 0;
      let overdue = 0;
      for (const item of items) {
        if (item.kind !== 'task' || item.status === 'done' || item.due === null) continue;
        if (item.due < start) overdue += 1;
        else if (item.due < end) today += 1;
      }
      return { today, overdue };
    }

    /** Read the dismissed reminder day key. */
    function readReminderDismissed() {
      const value = readStored(REMINDER_KEY);
      return typeof value === 'string' ? value : '';
    }

    /** Remember that today's reminder was dismissed. */
    function writeReminderDismissed(dayKey) {
      writeStored(REMINDER_KEY, dayKey);
    }

    /** SM-2 schedule update for one rating (1 again, 3 hard, 5 good). */
    function applySm2(review, quality, now) {
      const current = normalizeReview(review);
      const delta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
      const ease = Math.min(5, Math.max(1.3, current.ease + delta));
      let repetitions = current.repetitions;
      let intervalDays = current.intervalDays;
      if (quality < 3) {
        repetitions = 0;
        intervalDays = 1;
      } else {
        repetitions += 1;
        intervalDays = repetitions === 1 ? 1 : repetitions === 2 ? 6 : Math.max(1, Math.round(Math.max(1, intervalDays) * ease));
      }
      return {
        ease,
        intervalDays,
        repetitions,
        dueAt: now + intervalDays * 24 * 60 * 60 * 1000,
        lastAt: now,
      };
    }

    /** Whether one flashcard is due for review now. */
    function isCardDue(item, now) {
      if (item.kind !== 'card') return false;
      const review = normalizeReview(item.review);
      return review.dueAt === null || review.dueAt <= now;
    }

    /** Human label for one card's next review time. */
    function reviewDueLabel(review, t, now) {
      const schedule = normalizeReview(review);
      if (schedule.dueAt === null || schedule.dueAt <= now) return t('dueNow');
      const days = Math.max(1, Math.ceil((schedule.dueAt - now) / (24 * 60 * 60 * 1000)));
      return fillTemplate(t('dueIn'), { days });
    }

    /** Whether a card's next review time has already passed. */
    function reviewOverdue(review, now) {
      const dueAt = normalizeReview(review).dueAt;
      return dueAt !== null && dueAt <= now;
    }

    /** Group digits for token counts. */
    function formatNumber(value) {
      return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /** Format an estimated CNY amount with a currency prefix. */
    function formatMoney(value) {
      const amount = typeof value === 'number' && Number.isFinite(value) ? value : 0;
      if (amount > 0 && amount < 0.01) return '¥' + amount.toFixed(4);
      return '¥' + amount.toFixed(2);
    }

    /** Format a byte count with a binary unit suffix. */
    function formatBytes(bytes) {
      const value = typeof bytes === 'number' && Number.isFinite(bytes) ? bytes : 0;
      if (value <= 0) return '0 B';
      const units = ['B', 'KB', 'MB', 'GB'];
      let size = value;
      let index = 0;
      while (size >= 1024 && index < units.length - 1) {
        size /= 1024;
        index += 1;
      }
      return size.toFixed(size >= 10 ? 0 : 1) + ' ' + units[index];
    }

    /** Download one text payload as a local file (CSV / Markdown / JSON exports). */
    function downloadTextFile(filename, content, mime) {
      const blob = new window.Blob([content], { type: mime });
      const url = window.URL.createObjectURL(blob);
      const anchor = window.document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    }

    /** Localized label of one workspace stage. */
    function valueStageText(stage, t) {
      const map = {
        active: t('valueStageActive'),
        maintaining: t('valueStageMaintaining'),
        recent: t('valueStageRecent'),
        slowing: t('valueStageSlowing'),
        dormant: t('valueStageDormant'),
        unknown: t('valueStageUnknown'),
      };
      return map[stage] || stage || '';
    }

    /** Localized label of one workspace future-value bucket. */
    function valueFutureText(future, t) {
      const map = {
        high: t('valueFutureHigh'),
        steady: t('valueFutureSteady'),
        slowing: t('valueFutureSlowing'),
        low: t('valueFutureLow'),
        unknown: t('valueFutureUnknown'),
      };
      return map[future] || future || '';
    }

    /** Localized label of one social value grade. */
    function valueGradeText(grade, t) {
      const map = {
        strong: t('valueSocialGradeStrong'),
        medium: t('valueSocialGradeMedium'),
        weak: t('valueSocialGradeWeak'),
        unknown: t('valueSocialGradeUnknown'),
      };
      return map[grade] || grade || '';
    }

    /** Localized label of one manual rating. */
    function ratingText(rating, t) {
      if (rating === 'high') return t('valueHigh');
      if (rating === 'medium') return t('valueMedium');
      if (rating === 'low') return t('valueLow');
      return t('valueUnrated');
    }

    /** Localized label of one social-value dimension key. */
    function socialDimLabel(key, t) {
      if (key === 'docs') return t('socialDimDocs');
      if (key === 'license') return t('socialDimLicense');
      if (key === 'tests') return t('socialDimTests');
      if (key === 'impact') return t('socialDimImpact');
      if (key === 'substance') return t('socialDimSubstance');
      if (key === 'activity') return t('socialDimActivity');
      return key;
    }

    /** Localized text of one social-value improvement suggestion code. */
    function socialSuggestionText(code, t) {
      if (code === 'addReadme') return t('socialSuggestAddReadme');
      if (code === 'addDocs') return t('socialSuggestAddDocs');
      if (code === 'addLicense') return t('socialSuggestAddLicense');
      if (code === 'addTests') return t('socialSuggestAddTests');
      if (code === 'addDomains') return t('socialSuggestAddDomains');
      if (code === 'stayActive') return t('socialSuggestStayActive');
      return code;
    }

    /** Turn raw release notes (GitHub markdown / HTML) into a short readable block. */
    function summarizeNotes(text, limit) {
      const plain = String(text || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\r/g, '')
        .replace(/^\[[^\]]*\]\([^)]*\)\s*\|?\s*/g, '')
        .replace(/[#*_`>|]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const cap = typeof limit === 'number' ? limit : 420;
      return plain.length > cap ? plain.slice(0, cap).trimEnd() + '…' : plain;
    }

    /** Local calendar-day key of a timestamp. */
    function dayKeyOf(value) {
      const date = new Date(value);
      const pad = (part) => String(part).padStart(2, '0');
      return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
    }

    /** Aggregate card review statistics over the last `days` local days. */
    function reviewStats(items, reviews, days, now) {
      const counts = new Map();
      let due = 0;
      for (const item of items) {
        if (item.kind !== 'card') continue;
        const review = normalizeReview(item.review);
        if (review.dueAt === null || review.dueAt <= now) due += 1;
      }
      const log = normalizeReviewLog(reviews);
      if (log.length > 0) {
        for (const record of log) {
          const key = dayKeyOf(record.at);
          counts.set(key, (counts.get(key) || 0) + 1);
        }
      } else {
        for (const item of items) {
          if (item.kind !== 'card') continue;
          const review = normalizeReview(item.review);
          if (review.lastAt !== null) {
            const key = dayKeyOf(review.lastAt);
            counts.set(key, (counts.get(key) || 0) + 1);
          }
        }
      }
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const cells = [];
      for (let offset = days - 1; offset >= 0; offset -= 1) {
        const date = new Date(today.getTime() - offset * 24 * 60 * 60 * 1000);
        const key = dayKeyOf(date.getTime());
        cells.push({ key, count: counts.get(key) || 0, label: date.getMonth() + 1 + '/' + date.getDate() });
      }
      const hasReview = (offset) => (counts.get(dayKeyOf(today.getTime() - offset * 24 * 60 * 60 * 1000)) || 0) > 0;
      let streak = 0;
      let offset = hasReview(0) ? 0 : 1;
      while (hasReview(offset)) {
        streak += 1;
        offset += 1;
      }
      return { due, today: counts.get(dayKeyOf(now)) || 0, streak, cells };
    }

    /** Readings of the same metric name, oldest first, limited to the last 20. */
    function metricSeries(items, metric) {
      const name = (metric.title || metric.body.split('\n')[0] || '').trim().toLowerCase();
      if (name.length === 0) return [];
      return items
        .filter(
          (item) =>
            item.kind === 'metric' &&
            item.health.value !== null &&
            (item.title || item.body.split('\n')[0] || '').trim().toLowerCase() === name,
        )
        .map((item) => ({ at: item.health.at === null ? item.createdAt : item.health.at, value: item.health.value, id: item.id }))
        .sort((left, right) => left.at - right.at)
        .slice(-20);
    }

    /** SVG polyline points for the metric sparkline. */
    function chartPoints(rows, width, height, padding) {
      if (rows.length === 0) return '';
      const values = rows.map((row) => row.value);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const span = max - min === 0 ? 1 : max - min;
      const innerWidth = width - padding * 2;
      const innerHeight = height - padding * 2;
      return rows
        .map((row, index) => {
          const x = rows.length === 1 ? padding + innerWidth / 2 : padding + (index / (rows.length - 1)) * innerWidth;
          const y = padding + (1 - (row.value - min) / span) * innerHeight;
          return x.toFixed(1) + ',' + y.toFixed(1);
        })
        .join(' ');
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

    /** Build the next open occurrence of a repeating task (client copy). */
    function nextRepeatItemClient(item, now) {
      return {
        ...item,
        id: nextItemId(),
        status: 'open',
        doneAt: null,
        due: advanceRepeatDue(item.due, item.repeat, now),
        checklist: (item.checklist || []).map((row) => ({ ...row, done: false })),
        createdAt: now,
        updatedAt: now,
        rev: 0,
        deletedAt: null,
      };
    }

    /** Active medication plans ordered by their first dose time. */
    function activeMedications(items) {
      return items
        .filter((item) => item.kind === 'med' && item.health.active && item.health.times.length > 0)
        .sort((left, right) => left.health.times[0].localeCompare(right.health.times[0]));
    }

    /** Medication doses whose time has arrived within the last 30 minutes. */
    function medsDueNow(items, now) {
      const date = new Date(now);
      const minutes = date.getHours() * 60 + date.getMinutes();
      const due = [];
      for (const item of items) {
        if (item.kind !== 'med' || !item.health.active) continue;
        const title = item.title.trim().length > 0 ? item.title : item.body.split('\n').find((line) => line.trim().length > 0) || '';
        for (const time of item.health.times) {
          const [hour, minute] = time.split(':').map((part) => Number(part));
          const target = hour * 60 + minute;
          if (minutes >= target && minutes - target <= 30) due.push({ time, title });
        }
      }
      return due.sort((left, right) => left.time.localeCompare(right.time));
    }

    /** Distinct metric names with their latest reading and a short sparkline series. */
    function metricOverview(items, now) {      const groups = new Map();
      for (const item of items) {
        if (item.kind !== 'metric' || item.health.value === null) continue;
        const name = (item.title || item.body.split('\n')[0] || '').trim();
        if (name.length === 0) continue;
        const key = name.toLowerCase();
        if (!groups.has(key)) groups.set(key, { name, rows: [] });
        groups.get(key).rows.push({ at: item.health.at === null ? item.createdAt : item.health.at, value: item.health.value });
      }
      const cards = [];
      for (const group of groups.values()) {
        const rows = group.rows.sort((left, right) => left.at - right.at);
        const last = rows[rows.length - 1];
        cards.push({ name: group.name, latest: last, rows: rows.slice(-12), unit: unitOfMetric(items, group.name) });
      }
      cards.sort((left, right) => right.latest.at - left.latest.at);
      return cards.slice(0, 3);
    }

    /** Unit declared on the most recent reading of one metric name. */
    function unitOfMetric(items, name) {
      const key = name.trim().toLowerCase();
      const matches = items
        .filter((item) => item.kind === 'metric' && (item.title || item.body.split('\n')[0] || '').trim().toLowerCase() === key)
        .sort((left, right) => (right.health.at === null ? right.createdAt : right.health.at) - (left.health.at === null ? left.createdAt : left.health.at));
      return matches.length > 0 ? matches[0].health.unit : '';
    }

    /** Recent review records of one card, newest first. */
    function cardReviewHistory(reviews, itemId, limit) {
      return normalizeReviewLog(reviews)
        .filter((record) => record.itemId === itemId)
        .sort((left, right) => left.at - right.at)
        .slice(-limit)
        .reverse();
    }

    /** Full history and aggregate statistics for one metric name. */
    function metricDetailData(items, name) {
      const key = String(name || '').trim().toLowerCase();
      const rows = items
        .filter((item) => item.kind === 'metric' && (item.title || item.body.split('\n')[0] || '').trim().toLowerCase() === key)
        .map((item) => ({
          id: item.id,
          at: item.health.at === null ? item.createdAt : item.health.at,
          value: item.health.value,
          value2: item.health.value2,
          unit: item.health.unit,
        }))
        .filter((row) => row.value !== null)
        .sort((left, right) => left.at - right.at);
      if (rows.length === 0) return { name: String(name || ''), rows, unit: '', latest: null, min: null, max: null, average: null };
      const values = rows.map((row) => row.value);
      return {
        name: String(name || ''),
        rows,
        unit: rows[rows.length - 1].unit,
        latest: rows[rows.length - 1],
        min: Math.min(...values),
        max: Math.max(...values),
        average: values.reduce((sum, value) => sum + value, 0) / values.length,
      };
    }

    /** Assistant text of one finalized message, read from the Chat snapshot's turn-tail node. */
    function chatMessageText(snapshot, messageId) {
      const nodes = snapshot && snapshot.nodes;
      if (!nodes || typeof nodes.values !== 'function') return '';
      let blocks;
      for (const node of nodes.values()) {
        const closing = node && node.data ? node.data.closing : undefined;
        if (closing && closing.finalNode && closing.finalNode.messageId === messageId) {
          blocks = closing.blocks;
          break;
        }
      }
      if (!Array.isArray(blocks)) return '';
      return blocks
        .filter((block) => block && block.kind === 'text' && typeof block.text === 'string')
        .map((block) => block.text)
        .join('\n\n')
        .trim();
    }

    /** Read the browser mirror. */
    function readMirror() {
      try {
        const raw = readStored(MIRROR_KEY);
        if (raw === null) return { items: [], revision: 0 };
        const parsed = JSON.parse(raw);
        const items = normalizeItems(parsed && parsed.items);
        return { items, revision: parsed && typeof parsed.revision === 'number' ? parsed.revision : 0 };
      } catch (error) {
        return { items: [], revision: 0 };
      }
    }

    /** Write the browser mirror. */
    function writeMirror(items, revision) {
      writeStored(MIRROR_KEY, JSON.stringify({ version: 1, revision, items }));
    }

    /** Build items out of the pre-workbench single-draft stores. */
    function migrateLegacy() {
      const items = [];
      try {
        const raw = readStored(LEGACY_NOTES_KEY);
        if (raw !== null) {
          const parsed = JSON.parse(raw);
          const notes = parsed && Array.isArray(parsed.notes) ? parsed.notes : [];
          for (const note of notes) {
            if (!note || typeof note.text !== 'string') continue;
            const stamp = typeof note.updatedAt === 'number' ? note.updatedAt : Date.now();
            items.push({
              id: typeof note.id === 'string' && note.id.length > 0 ? note.id : nextItemId(),
              kind: 'note',
              title: '',
              body: note.text,
              tags: [],
              status: 'open',
              due: null,
              createdAt: stamp,
              updatedAt: stamp,
            });
          }
        }
      } catch (error) {
        // a damaged legacy store contributes nothing
      }
      if (items.length === 0) {
        const draft = readStored(LEGACY_DRAFT_KEY);
        if (typeof draft === 'string' && draft.length > 0) {
          const stamp = Date.now();
          items.push({ id: nextItemId(), kind: 'note', title: '', body: draft, tags: [], status: 'open', due: null, createdAt: stamp, updatedAt: stamp });
        }
      }
      return normalizeItems(items);
    }

    /** Drop the pre-workbench keys after a successful migration write. */
    function clearLegacy() {
      removeStored(LEGACY_NOTES_KEY);
      removeStored(LEGACY_DRAFT_KEY);
    }

    /** Read the Host state document; pass a watermark for an incremental poll. */
    function readState(sinceMs) {
      const requestUrl = typeof sinceMs === 'number' && sinceMs > 0 ? STATE_URL + '?since=' + Math.floor(sinceMs) : STATE_URL;
      return window
        .fetch(requestUrl, { headers: { accept: 'application/json' }, cache: 'no-store' })
        .then((response) => {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return response.json();
        })
        .then((document) => ({
          items: normalizeItems(document && document.items),
          revision: document && typeof document.revision === 'number' ? document.revision : 0,
          file: document && typeof document.file === 'string' ? document.file : '',
          settings: normalizeSettings(document && document.settings),
          reviews: normalizeReviewLog(document && document.reviews),
          types: normalizeTypes(document && document.types),
          delta: document !== null && document.delta === true,
          watermark: document && typeof document.watermark === 'number' ? document.watermark : 0,
        }));
    }

    /** Split a full item list into visible items plus the newest tombstones (soft-deleted items). */
    function splitDocumentItems(raw) {
      const all = normalizeItems(raw);
      const items = [];
      const tombstones = new Map();
      for (const item of all) {
        if (item.deletedAt === null) items.push(item);
        else tombstones.set(item.id, item);
      }
      const newest = [...tombstones.values()].sort((left, right) => right.deletedAt - left.deletedAt).slice(0, 200);
      return { items, tombstones: new Map(newest.map((item) => [item.id, item])) };
    }

    /** Full item list sent to the Host: visible items followed by tombstones. */
    function mirrorItems(items, tombstones) {
      return [...items, ...tombstones.values()];
    }

    /** Stable content signature used for the PATCH write diff (ignores the server-bumped rev). */
    function itemSignature(item) {
      return JSON.stringify({ ...item, rev: 0 });
    }

    /** Two-way document merge used to resolve a Host revision conflict (newer item revision wins). */
    function mergeDocuments(local, remote, deletedIds) {
      const deleted = new Set(Array.isArray(deletedIds) ? deletedIds : []);
      const localAll = normalizeItems([...(local.items || []), ...normalizeItems(local.tombstones || [])]);
      const remoteAll = normalizeItems(remote && remote.items);
      const itemRank = (item) => (typeof item.rev === 'number' ? item.rev : 0) * 1e15 + (typeof item.updatedAt === 'number' ? item.updatedAt : 0);
      const remoteById = new Map(remoteAll.map((item) => [item.id, item]));
      const chosen = [];
      const seen = new Set();
      for (const localItem of localAll) {
        if (seen.has(localItem.id)) continue;
        const remoteItem = remoteById.get(localItem.id);
        const winner = remoteItem !== undefined && itemRank(remoteItem) > itemRank(localItem) ? remoteItem : localItem;
        if (deleted.has(winner.id)) continue;
        chosen.push(winner);
        seen.add(localItem.id);
      }
      for (const remoteItem of remoteAll) {
        if (seen.has(remoteItem.id) || deleted.has(remoteItem.id)) continue;
        chosen.push(remoteItem);
        seen.add(remoteItem.id);
      }
      const split = splitDocumentItems(chosen);
      const reviewMap = new Map();
      const reviewKey = (record) => record.itemId + '|' + record.at + '|' + record.quality;
      for (const record of normalizeReviewLog(remote && remote.reviews)) reviewMap.set(reviewKey(record), record);
      for (const record of normalizeReviewLog(local.reviews)) reviewMap.set(reviewKey(record), record);
      const mergedReviews = [...reviewMap.values()].sort((left, right) => left.at - right.at).slice(-5000);
      const typeMap = new Map();
      for (const type of normalizeTypes(remote && remote.types)) typeMap.set(type.id, type);
      for (const type of normalizeTypes(local.types)) typeMap.set(type.id, type);
      const localSettings = normalizeSettings(local.settings);
      const remoteSettings = normalizeSettings(remote && remote.settings);
      const workspaceNotes = { ...remoteSettings.workspaceNotes, ...localSettings.workspaceNotes };
      const valueHistory = {};
      for (const source of [remoteSettings.valueHistory, localSettings.valueHistory]) {
        for (const [key, entries] of Object.entries(source)) {
          const merged = [...(valueHistory[key] || [])];
          for (const entry of entries) {
            const existing = merged.findIndex((candidate) => candidate.at === entry.at);
            if (existing >= 0) merged[existing] = entry;
            else merged.push(entry);
          }
          valueHistory[key] = merged.sort((left, right) => left.at - right.at).slice(-12);
        }
      }
      return {
        items: split.items,
        tombstones: [...split.tombstones.values()],
        settings: { brief: localSettings.brief, pricing: localSettings.pricing, workspaceNotes, valueHistory },
        reviews: mergedReviews,
        types: [...typeMap.values()],
      };
    }

    /** Replace the Host item list, settings, review log, and custom record types. */
    function putState(items, settings, reviews, types, options) {
      const flags = options || {};
      const tombstones = normalizeItems(flags.tombstones || []);
      const payload = { items: [...normalizeItems(items), ...tombstones] };
      if (settings !== undefined) payload.settings = normalizeSettings(settings);
      if (reviews !== undefined) payload.reviews = normalizeReviewLog(reviews);
      if (types !== undefined) payload.types = normalizeTypes(types);
      const headers = { 'content-type': 'application/json' };
      if (typeof flags.revision === 'number' && Number.isFinite(flags.revision)) {
        headers['if-match'] = String(flags.revision);
      }
      return window
        .fetch(STATE_URL, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
          keepalive: flags.keepalive === true,
        })
        .then((response) => {
          if (response.status === 409) {
            const attempt = (flags.attempt || 0) + 1;
            if (attempt > 3) throw new Error('HTTP 409');
            return response.json().then((conflict) => {
              const merged = mergeDocuments(
                { items, tombstones, settings, reviews, types },
                conflict,
                flags.deletedIds,
              );
              return putState(merged.items, merged.settings, merged.reviews, merged.types, {
                ...flags,
                tombstones: merged.tombstones,
                revision: typeof conflict.revision === 'number' ? conflict.revision : flags.revision,
                attempt,
              });
            });
          }
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return response.json();
        })
        .then((document) => ({
          items: normalizeItems(document && document.items),
          revision: document && typeof document.revision === 'number' ? document.revision : 0,
          settings: normalizeSettings(document && document.settings),
          reviews: normalizeReviewLog(document && document.reviews),
          types: normalizeTypes(document && document.types),
        }));
    }

    /** Per-Host-process token used by the read-only routes; fetched on demand. */
    let readToken = '';

    /** Fetch the loopback read token from the Host. */
    function fetchReadToken() {
      return window
        .fetch(AUTH_URL, { headers: { accept: 'application/json' }, cache: 'no-store' })
        .then((response) => (response.ok ? response.json() : { token: '' }))
        .then((payload) => {
          readToken = payload && typeof payload.token === 'string' ? payload.token : '';
          return readToken;
        })
        .catch(() => {
          readToken = '';
          return '';
        });
    }

    /** Public URL of one stored attachment (carries the loopback token for <img>/<a>). */
    function attachmentUrl(attachment) {
      const token = readToken.length > 0 ? '?token=' + encodeURIComponent(readToken) : '';
      return FILES_URL + '/' + encodeURIComponent(attachment.id) + token;
    }

    /** Upload one file to the Host attachment store and return its ref. */
    function uploadAttachment(file) {
      const decode = (response) => {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json().then((payload) => payload.attachment);
      };
      const call = (token) =>
        window.fetch(FILES_URL, {
          method: 'POST',
          headers: {
            'content-type': file.type || 'application/octet-stream',
            'x-file-name': encodeURIComponent(file.name || 'file'),
            ...(token.length > 0 ? { 'x-quick-note-token': token } : {}),
          },
          body: file,
        });
      const start = readToken.length > 0 ? Promise.resolve(readToken) : fetchReadToken();
      return start.then(call).then((response) => {
        if (response.status !== 401) return decode(response);
        return fetchReadToken().then((token) => call(token)).then(decode);
      });
    }

    /** Read-modify-write the document settings through the optimistic lock. */
    function writeSettings(mutator) {
      return readState().then((document) =>
        putState(document.items, mutator(document.settings), document.reviews, document.types, { revision: document.revision }),
      );
    }

    /** Apply a minimal item upsert patch; resolves `{ conflict: true }` on a 409. */
    function patchState(upserts, revision) {
      const headers = { 'content-type': 'application/json' };
      if (typeof revision === 'number' && Number.isFinite(revision)) headers['if-match'] = String(revision);
      return window
        .fetch(STATE_URL, { method: 'PATCH', headers, body: JSON.stringify({ upserts }) })
        .then((response) => {
          if (response.status === 409) return { conflict: true };
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return response.json().then((document) => ({
            document: {
              items: normalizeItems(document && document.items),
              revision: document && typeof document.revision === 'number' ? document.revision : 0,
              settings: normalizeSettings(document && document.settings),
              reviews: normalizeReviewLog(document && document.reviews),
              types: normalizeTypes(document && document.types),
              watermark: document && typeof document.watermark === 'number' ? document.watermark : 0,
            },
          }));
        });
    }

    /** Perform one token-protected request, refreshing the token and retrying once after a 401. */
    function protectedRequest(url, options) {
      const flags = options || {};
      const call = (token) =>
        window.fetch(url, {
          ...flags,
          headers: {
            ...(flags.headers || {}),
            ...(token.length > 0 ? { 'x-quick-note-token': token } : {}),
          },
        });
      const failure = (response) =>
        response
          .json()
          .catch(() => ({}))
          .then((payload) => Promise.reject(new Error(payload && typeof payload.error === 'string' ? payload.error : 'HTTP ' + response.status)));
      const start = readToken.length > 0 ? Promise.resolve(readToken) : fetchReadToken();
      return start
        .then((token) => call(token))
        .then((response) => {
          if (response.status !== 401) {
            if (!response.ok) return failure(response);
            return response.json();
          }
          return fetchReadToken()
            .then((token) => call(token))
            .then((retry) => {
              if (!retry.ok) return failure(retry);
              return retry.json();
            });
        });
    }

    /** GET one read-only route with the loopback token. */
    function readProtected(url) {
      return protectedRequest(url, { headers: { accept: 'application/json' }, cache: 'no-store' });
    }

    /** Read the read-only system summary from the Host. */
    function readAdmin() {
      return readProtected(ADMIN_URL);
    }

    /** Read the read-only per-workspace usage report from the Host. */
    function readUsage() {
      return readProtected(USAGE_URL);
    }

    /** Read the read-only per-workspace value report from the Host. */
    function readValue(refresh) {
      return readProtected(VALUE_URL + (refresh === true ? '?refresh=1' : ''));
    }

    /** POST one token-protected route (retrying once after a 401). */
    function postProtected(url, body) {
      const flags = { method: 'POST' };
      if (body !== undefined) {
        flags.body = JSON.stringify(body);
        flags.headers = { 'content-type': 'application/json' };
      }
      return protectedRequest(url, flags);
    }

    /** Normalize document settings. */
    function normalizeSettings(raw) {
      const source = raw && typeof raw === 'object' ? raw : {};
      const price = (value, fallback) =>
        typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100000 ? value : fallback;
      const pricing = source.pricing && typeof source.pricing === 'object' ? source.pricing : {};
      const notesSource =
        source.workspaceNotes && typeof source.workspaceNotes === 'object' && !Array.isArray(source.workspaceNotes)
          ? source.workspaceNotes
          : {};
      const workspaceNotes = {};
      for (const [key, value] of Object.entries(notesSource)) {
        if (typeof key !== 'string' || key.length === 0 || !value || typeof value !== 'object') continue;
        const note = typeof value.note === 'string' ? value.note.slice(0, 2000) : '';
        const rating = value.rating === 'high' || value.rating === 'medium' || value.rating === 'low' ? value.rating : '';
        const socialNote = typeof value.socialNote === 'string' ? value.socialNote.slice(0, 2000) : '';
        const socialRating =
          value.socialRating === 'high' || value.socialRating === 'medium' || value.socialRating === 'low' ? value.socialRating : '';
        if (note.length === 0 && rating.length === 0 && socialNote.length === 0 && socialRating.length === 0) continue;
        workspaceNotes[key.slice(0, 400)] = {
          note,
          rating,
          socialNote,
          socialRating,
          updatedAt: typeof value.updatedAt === 'number' ? value.updatedAt : Date.now(),
        };
      }
      const valueHistorySource =
        source.valueHistory && typeof source.valueHistory === 'object' && !Array.isArray(source.valueHistory)
          ? source.valueHistory
          : {};
      const valueHistory = {};
      for (const [key, entryList] of Object.entries(valueHistorySource)) {
        if (typeof key !== 'string' || key.length === 0 || !Array.isArray(entryList)) continue;
        const entries = [];
        for (const entry of entryList.slice(-12)) {
          if (!entry || typeof entry !== 'object') continue;
          if (typeof entry.at !== 'number' || !Number.isFinite(entry.at)) continue;
          entries.push({
            at: entry.at,
            valueScore: typeof entry.valueScore === 'number' && Number.isFinite(entry.valueScore) ? entry.valueScore : 0,
            socialScore: typeof entry.socialScore === 'number' && Number.isFinite(entry.socialScore) ? entry.socialScore : 0,
          });
        }
        if (entries.length > 0) valueHistory[key.slice(0, 400)] = entries;
      }
      return {
        brief: source.brief !== false,
        pricing: {
          inputHit: price(pricing.inputHit, 0.04),
          inputMiss: price(pricing.inputMiss, 2),
          output: price(pricing.output, 8),
        },
        workspaceNotes,
        valueHistory,
        harnessFeedUrl:
          source.harnessFeedUrl === OFFICIAL_DIRECT_FEED
            ? OFFICIAL_DIRECT_FEED
            : typeof source.harnessFeedUrl === 'string' && /^https?:\/\//.test(source.harnessFeedUrl.trim())
              ? source.harnessFeedUrl.trim().slice(0, 500)
              : '',
        harnessAutoUpdate: source.harnessAutoUpdate === true,
        harnessAutoCheck: source.harnessAutoCheck === true,
        tokenBudget:
          typeof source.tokenBudget === 'number' && Number.isFinite(source.tokenBudget)
            ? Math.max(0, Math.min(1000000, Math.round(source.tokenBudget * 100) / 100))
            : 0,
        tokenBudgetMonthly:
          typeof source.tokenBudgetMonthly === 'number' && Number.isFinite(source.tokenBudgetMonthly)
            ? Math.max(0, Math.min(10000000, Math.round(source.tokenBudgetMonthly * 100) / 100))
            : 0,
        savingsMode: source.savingsMode === true,
        savingsGuard: source.savingsGuard !== false,
        savingsProvider: typeof source.savingsProvider === 'string' ? source.savingsProvider.slice(0, 100) : '',
        savingsModel: typeof source.savingsModel === 'string' ? source.savingsModel.slice(0, 200) : '',
        savingsMaxOutput:
          typeof source.savingsMaxOutput === 'number' && Number.isFinite(source.savingsMaxOutput)
            ? Math.max(0, Math.min(32768, Math.round(source.savingsMaxOutput)))
            : 1200,
        savingsActivatedAt: typeof source.savingsActivatedAt === 'number' ? source.savingsActivatedAt : 0,
        savingsActivationReason: typeof source.savingsActivationReason === 'string' ? source.savingsActivationReason.slice(0, 200) : '',
        thriftWorkspaces: Array.isArray(source.thriftWorkspaces)
          ? source.thriftWorkspaces.filter((entry) => typeof entry === 'string' && entry.trim().length > 0).map((entry) => entry.trim().slice(0, 500)).slice(0, 30)
          : [],
        cleanupSchedule: source.cleanupSchedule === 'daily' || source.cleanupSchedule === 'weekly' || source.cleanupSchedule === 'cron' ? source.cleanupSchedule : 'off',
        cleanupScheduleTime: typeof source.cleanupScheduleTime === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(source.cleanupScheduleTime) ? source.cleanupScheduleTime : '03:00',
        cleanupScheduleCron: typeof source.cleanupScheduleCron === 'string' && /^(\S+\s+){4}\S+$/.test(source.cleanupScheduleCron.trim()) ? source.cleanupScheduleCron.trim().slice(0, 100) : '',
        trashPresets: Array.isArray(source.trashPresets) ? source.trashPresets.filter((entry) => entry && typeof entry.name === 'string' && entry.name.trim().length > 0).slice(0, 10).map((entry) => ({ name: entry.name.trim().slice(0, 30), type: typeof entry.type === 'string' ? entry.type.slice(0, 20) : 'all', workspace: typeof entry.workspace === 'string' ? entry.workspace.slice(0, 120) : 'all', query: typeof entry.query === 'string' ? entry.query.slice(0, 80) : '' })) : [],
        medReminderEnabled: source.medReminderEnabled === false ? false : true,
        shortcuts: {
          palette: typeof (source.shortcuts && source.shortcuts.palette) === 'string' && source.shortcuts.palette.trim().length > 0 ? source.shortcuts.palette.trim().slice(0, 40) : 'ctrl+k',
          help: typeof (source.shortcuts && source.shortcuts.help) === 'string' && source.shortcuts.help.trim().length > 0 ? source.shortcuts.help.trim().slice(0, 40) : '?',
        },
        backupIntervalMinutes: typeof source.backupIntervalMinutes === 'number' && Number.isFinite(source.backupIntervalMinutes) ? Math.max(1, Math.min(1440, Math.round(source.backupIntervalMinutes))) : 5,
                cleanupScheduleTimezone: (() => { const value = source.cleanupScheduleTimezone; if (typeof value !== 'string') return 'local'; if (value === 'local' || /^UTC[+-]\d{1,2}$/.test(value)) return value; if (value.length <= 64 && /^[A-Za-z0-9_+\-/]+\/[A-Za-z0-9_+\-/]+$/.test(value)) return value; return 'local'; })(),
        budgetWebhookUrl:
          typeof source.budgetWebhookUrl === 'string' && /^https?:\/\//.test(source.budgetWebhookUrl.trim())
            ? source.budgetWebhookUrl.trim().slice(0, 500)
            : '',
        budgetWebhookTemplate: source.budgetWebhookTemplate === 'slack' || source.budgetWebhookTemplate === 'feishu' ? source.budgetWebhookTemplate : 'generic',
      };
    }

    /** Last-known settings when a caller has no document at hand. */
    const DEFAULT_SETTINGS = {
      brief: true,
      pricing: { inputHit: 0.04, inputMiss: 2, output: 8 },
      workspaceNotes: {},
      valueHistory: {},
    };

    /** Accent presets available in Settings: empty means the theme brand color. */
    const ACCENT_PRESETS = ['', 'var(--dsw-alias-state-success-primary)', 'var(--dsw-alias-state-warn-primary)', 'var(--dsw-alias-state-error-primary)'];

    /** Validate a stored accent value: empty (theme brand), a token preset, or a hex color. */
    function normalizeAccent(raw) {
      if (typeof raw !== 'string') return '';
      if (ACCENT_PRESETS.includes(raw)) return raw;
      return /^#[0-9a-fA-F]{6}$/.test(raw) ? raw.toLowerCase() : '';
    }

    /** Normalize the stored module preferences. */
    function normalizePrefs(raw) {
      const modules = raw && raw.modules ? raw.modules : {};
      return {
        modules: {
          note: modules.note !== false,
          task: modules.task !== false,
          card: modules.card !== false,
          health: modules.health !== false,
          record: modules.record !== false,
        },
        taskLayout:
          raw && raw.taskLayout === 'board' ? 'board' : raw && raw.taskLayout === 'calendar' ? 'calendar' : 'list',
        groupBy: raw && (raw.groupBy === 'priority' || raw.groupBy === 'tags') ? raw.groupBy : 'none',
        healthMode: raw && raw.healthMode === 'med' ? 'med' : 'metric',
        density: raw && raw.density === 'compact' ? 'compact' : 'comfortable',
        accent: normalizeAccent(raw && raw.accent),
        pins: Array.isArray(raw && raw.pins)
          ? [...new Set(raw.pins.filter((id) => typeof id === 'string' && id.length > 0))].slice(0, 100)
          : [],
        reviewGoal:
          raw && typeof raw.reviewGoal === 'number' && Number.isFinite(raw.reviewGoal)
            ? Math.max(1, Math.min(500, Math.floor(raw.reviewGoal)))
            : 20,
        insightTab: raw && (raw.insightTab === 'usage' || raw.insightTab === 'system' || raw.insightTab === 'optimizer' || raw.insightTab === 'schedule') ? raw.insightTab : 'value',
        knowledgeTab: raw && raw.knowledgeTab === 'review' ? 'review' : 'notes',
        overviewTab: raw && raw.overviewTab === 'all' ? 'all' : 'dashboard',
        writeMode: raw && raw.writeMode === 'full' ? 'full' : 'patch',
        tokenBudget: raw && typeof raw.tokenBudget === 'number' && Number.isFinite(raw.tokenBudget) ? Math.max(0, Math.min(1000000, raw.tokenBudget)) : 0,
        harnessLastCheckAt:
          raw && typeof raw.harnessLastCheckAt === 'number' && Number.isFinite(raw.harnessLastCheckAt) ? raw.harnessLastCheckAt : 0,
        harnessLatestVersion: raw && typeof raw.harnessLatestVersion === 'string' ? raw.harnessLatestVersion.slice(0, 40) : '',
        healthRanges: (() => {
          const source = raw && raw.healthRanges && typeof raw.healthRanges === 'object' && !Array.isArray(raw.healthRanges) ? raw.healthRanges : {};
          const ranges = {};
          for (const [name, range] of Object.entries(source)) {
            if (!range || typeof range !== 'object') continue;
            const min = typeof range.min === 'number' && Number.isFinite(range.min) ? range.min : null;
            const max = typeof range.max === 'number' && Number.isFinite(range.max) ? range.max : null;
            if (min === null && max === null) continue;
            ranges[String(name).slice(0, 80)] = { min, max };
          }
          return ranges;
        })(),
      };
    }

    /** Read module preferences. */
    function readPrefs() {
      try {
        const raw = readStored(PREFS_KEY);
        if (raw === null) return normalizePrefs(undefined);
        return normalizePrefs(JSON.parse(raw));
      } catch (error) {
        return normalizePrefs(undefined);
      }
    }

    /** Shared module-preference store for the panel and the settings page. */
    function createPrefsStore() {
      const listeners = new Set();
      let snapshot = readPrefs();
      return {
        getSnapshot: () => snapshot,
        subscribe: (listener) => {
          listeners.add(listener);
          return () => {
            listeners.delete(listener);
          };
        },
        set: (next) => {
          snapshot = normalizePrefs(next);
          writeStored(PREFS_KEY, JSON.stringify(snapshot));
          for (const listener of listeners) listener();
        },
      };
    }

    let prefsStore;

    /** Lazily own one preferences store per module generation. */
    function getPrefsStore() {
      if (prefsStore === undefined) prefsStore = createPrefsStore();
      return prefsStore;
    }

    /** The notebook glyph, drawn at the edge the caller allocates. */
    function NoteIcon({ size }) {
      const edge = size || 20;
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: edge,
          height: edge,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
          focusable: 'false',
        },
        h('path', { d: 'M6.75 3.75h7.05l4.45 4.45v11.05a1 1 0 0 1-1 1H6.75a1 1 0 0 1-1-1V4.75a1 1 0 0 1 1-1Z' }),
        h('path', { d: 'M13.7 3.95v4.35h4.35' }),
        h('path', { d: 'M8.9 12.3h6.2M8.9 15.8h4.1' }),
      );
    }

    /** Stroke glyph table used by the upgrade UI (all paths draw at 24×24). */
    const ICON_PATHS = {
      "overview": [
        "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"
      ],
      "all": [
        "M4.5 6.5h15M4.5 12h15M4.5 17.5h15"
      ],
      "system": [
        "M8 4h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
        "M9.5 8h5M9.5 12h5M9.5 16h5"
      ],
      "usage": [
        "M12 3.5a8.5 8.5 0 1 0 8.5 8.5H12Z",
        "M12 3.5V12h8.5"
      ],
      "value": [
        "M4 18.5 9.2 12l3.8 3.6L20 7",
        "M15.5 7H20v4.5"
      ],
      "note": [
        "M6.75 4.25h7l4.25 4.25v11a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V5a.75.75 0 0 1 .75-.75Z",
        "M13.4 4.4v4.2h4.2",
        "M9 12.4h6M9 15.7h4"
      ],
      "task": [
        "M4.5 5.5h9.5a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2H4.5z",
        "M16.5 9.2 20 5.5l1.4 1.4L16.5 12z",
        "M7 11h5M7 14.5h3.5"
      ],
      "card": [
        "M7 4.5h10a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 18V6A1.5 1.5 0 0 1 7 4.5Z",
        "M12 4.5v15"
      ],
      "health": [
        "M12 20s-7.2-4.4-7.2-9.4A4 4 0 0 1 12 7.6a4 4 0 0 1 7.2 3c0 5-7.2 9.4-7.2 9.4Z",
        "M4.8 12h3.3l1.4-2.6 2.2 5 2-3.4 1.2 1h4.3"
      ],
      "record": [
        "M4.5 6.5c0-1.4 3.4-2.5 7.5-2.5s7.5 1.1 7.5 2.5-3.4 2.5-7.5 2.5-7.5-1.1-7.5-2.5Z",
        "M4.5 6.5v11c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5v-11",
        "M4.5 12c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5"
      ],
      "search": [
        "M10.8 4.5a6.3 6.3 0 1 0 0 12.6 6.3 6.3 0 0 0 0-12.6Z",
        "M15.4 15.4 20 20"
      ],
      "plus": [
        "M12 5.5v13M5.5 12h13"
      ],
      "microphone": [
        "M12 4a2.5 2.5 0 0 1 2.5 2.5v5a2.5 2.5 0 0 1-5 0v-5A2.5 2.5 0 0 1 12 4Z",
        "M6.5 11a5.5 5.5 0 0 0 11 0",
        "M12 16.5V20"
      ],
      "refresh": [
        "M19.5 10A7.8 7.8 0 0 0 6.1 6.6L4.5 8.2",
        "M4.5 4.5v3.7h3.7",
        "M4.5 14a7.8 7.8 0 0 0 13.4 3.4l1.6-1.6",
        "M19.5 19.5v-3.7h-3.7"
      ],
      "spark": [
        "M12 3.5 13.9 9.4 20 11.3l-6.1 1.9L12 19.5l-1.9-6.3L4 11.3l6.1-1.9Z"
      ],
      "pin": [
        "M12 3.5c2.2 0 4 1.8 4 4 0 1.6-.9 3-2.3 3.7l-.4 3.8H10.7l-.4-3.8A4 4 0 0 1 8 7.5c0-2.2 1.8-4 4-4Z",
        "M12 15v5.5"
      ],
      "check": [
        "M5 12.5 9.5 17l9-10"
      ],
      "calendar": [
        "M5 5.5h14a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1Z",
        "M4 9.5h16",
        "M8 3.5v4M16 3.5v4"
      ]
    };

    /** Render one stroke icon from the upgrade glyph table. */
    function Icon({ name, size }) {
      const edge = size === undefined ? 16 : size;
      const paths = ICON_PATHS[name] || ICON_PATHS.note;
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: edge,
          height: edge,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
          focusable: 'false',
          className: 'dshqn-icon',
        },
        paths.map((path, index) => h('path', { key: index, d: path })),
      );
    }

    /** Section heading with an accent bar and optional trailing action. */
    function SectionHead({ title, hint, action }) {
      return h(
        'div',
        { className: 'dshqn-section-head' },
        h('span', { className: 'dshqn-section-mark', 'aria-hidden': true }),
        h(
          'div',
          { className: 'dshqn-section-copy' },
          h('h2', { className: 'dshqn-section-title' }, title),
          hint === undefined || hint === null ? null : h('p', { className: 'dshqn-section-hint' }, hint),
        ),
        h('span', { className: 'dshqn-section-spacer' }),
        action === undefined || action === null ? null : action,
      );
    }

    /** Segmented chip control shared by the sort/filter/range pickers. */
    function Segmented({ items, value, onChange, label }) {
      return h(
        'div',
        { className: 'dshqn-tabs', role: 'group', 'aria-label': label },
        items.map((item) =>
          h(
            'button',
            {
              key: item.id,
              type: 'button',
              className: value === item.id ? 'dshqn-filter dshqn-filter-active' : 'dshqn-filter',
              onClick: () => onChange(item.id),
            },
            item.label,
          ),
        ),
      );
    }

    /** Attachment editor: upload, image thumbnails, file chips, and removal. */
    function AttachmentEditor({ item, t, uploading, onAdd, onRemove }) {
      const attachments = Array.isArray(item.attachments) ? item.attachments : [];
      const images = attachments.filter((attachment) => typeof attachment.mediaType === 'string' && attachment.mediaType.startsWith('image/'));
      const files = attachments.filter((attachment) => !(typeof attachment.mediaType === 'string' && attachment.mediaType.startsWith('image/')));
      return h(
        'div',
        { className: 'dshqn-attachments' },
        h(
          'div',
          { className: 'dshqn-attachments-head' },
          h('span', { className: 'dshqn-checklist-title' }, t('attachmentsTitle')),
          h(
            'label',
            { className: 'dshqn-button dshqn-attach-add' },
            uploading ? t('uploading') : t('addAttachment'),
            h('input', {
              type: 'file',
              multiple: true,
              className: 'dshqn-hidden-input',
              accept: 'image/*,.pdf,.txt,.md,.csv,.json,.zip,.mp3,.wav,.webm',
              onChange: (event) => {
                onAdd(event.target.files);
                event.target.value = '';
              },
            }),
          ),
          attachments.length > 0
            ? h('span', { className: 'dshqn-settings-hint' }, fillTemplate(t('attachmentsCount'), { count: attachments.length }))
            : null,
        ),
        images.length > 0
          ? h(
              'div',
              { className: 'dshqn-attach-grid' },
              images.map((attachment) =>
                h(
                  'figure',
                  { key: attachment.id, className: 'dshqn-attach-image' },
                  h('a', { href: attachmentUrl(attachment), target: '_blank', rel: 'noreferrer' }, h('img', { src: attachmentUrl(attachment), alt: attachment.name, loading: 'lazy' })),
                  h(
                    'button',
                    { type: 'button', className: 'dshqn-attach-remove', title: t('attachmentRemove'), 'aria-label': t('attachmentRemove'), onClick: () => onRemove(attachment.id) },
                    '×',
                  ),
                ),
              ),
            )
          : null,
        files.length > 0
          ? h(
              'div',
              { className: 'dshqn-attach-list' },
              files.map((attachment) =>
                h(
                  'span',
                  { key: attachment.id, className: 'dshqn-attach-file' },
                  h('a', { href: attachmentUrl(attachment), target: '_blank', rel: 'noreferrer' }, attachment.name),
                  h('span', { className: 'dshqn-settings-hint' }, formatBytes(attachment.size)),
                  h(
                    'button',
                    { type: 'button', className: 'dshqn-attach-remove', title: t('attachmentRemove'), 'aria-label': t('attachmentRemove'), onClick: () => onRemove(attachment.id) },
                    '×',
                  ),
                ),
              ),
            )
          : null,
      );
    }

    /** Windowed renderer for long flat lists; short lists render normally. */
    function VirtualRows(props) {
      const items = Array.isArray(props.items) ? props.items : [];
      const render = props.render;
      const rowHeight = typeof props.rowHeight === 'number' && props.rowHeight > 0 ? props.rowHeight : 64;
      const [scrollTop, setScrollTop] = React.useState(0);
      if (items.length <= 150) return h('div', { className: 'dshqn-virtual-plain' }, items.map(render));
      const viewport = 640;
      const start = Math.max(0, Math.floor(scrollTop / rowHeight) - 4);
      const end = Math.min(items.length, Math.ceil((scrollTop + viewport) / rowHeight) + 4);
      return h(
        'div',
        {
          className: 'dshqn-virtual',
          style: { maxHeight: '68vh', overflowY: 'auto' },
          onScroll: (event) => setScrollTop(event.currentTarget.scrollTop),
        },
        h('div', { style: { height: start * rowHeight } }),
        items.slice(start, end).map(render),
        h('div', { style: { height: (items.length - end) * rowHeight } }),
      );
    }

    /** One overview list row used by both the pinned and recent sections. */
    function OverviewRow({ item, t, icon, onOpen, trailing }) {
      return h(
        'div',
        {
          className: 'dshqn-overview-row',
          role: 'button',
          tabIndex: 0,
          onClick: onOpen,
          onKeyDown: (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onOpen();
            }
          },
        },
        h('span', { className: 'dshqn-row-icon', 'aria-hidden': true }, h(Icon, { name: icon, size: 14 })),
        h('span', { className: 'dshqn-kind-badge' }, kindLabel(item.kind, t)),
        h('span', { className: 'dshqn-overview-row-title' }, itemTitle(item) || t('untitled')),
        trailing === undefined ? h('span', { className: 'dshqn-overview-row-meta' }, formatStamp(item.updatedAt)) : trailing,
      );
    }

    /** One selectable table row shared by the All tab and the Records pane. */
    function TableRow({ title, badge, meta, checked, onToggle, onOpen, checkboxLabel }) {
      const metas = Array.isArray(meta) ? meta : [meta];
      return h(
        'div',
        { className: 'dshqn-row dshqn-all-row', onClick: onOpen },
        h('input', {
          type: 'checkbox',
          className: 'dshqn-check',
          checked,
          'aria-label': checkboxLabel,
          onClick: (event) => {
            if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
          },
          onChange: onToggle,
        }),
        h('span', { className: 'dshqn-kind-badge' }, badge),
        h('span', { className: 'dshqn-row-title' }, title),
        metas.map((node, index) =>
          node === null || node === undefined ? null : h('span', { key: index, className: 'dshqn-row-meta' }, node),
        ),
      );
    }

    /** Centered empty state with an icon, title, and hint. */
    function EmptyState({ icon, title, hint }) {
      return h(
        'div',
        { className: 'dshqn-empty' },
        h('span', { className: 'dshqn-empty-icon', 'aria-hidden': true }, h(Icon, { name: icon || 'spark', size: 20 })),
        h('p', { className: 'dshqn-empty-title' }, title),
        hint === undefined || hint === null ? null : h('p', { className: 'dshqn-empty-hint' }, hint),
      );
    }

    /** Skeleton lines used while a report is loading. */
    function SkeletonLines({ rows }) {
      const count = typeof rows === 'number' && rows > 0 ? rows : 3;
      return h(
        'div',
        { className: 'dshqn-skeleton', 'aria-hidden': true },
        Array.from({ length: count }, (_, index) =>
          h('span', {
            key: index,
            className:
              'dshqn-skeleton-line' +
              (index === 0 ? ' dshqn-skeleton-line-wide' : index === count - 1 ? ' dshqn-skeleton-line-short' : ''),
          }),
        ),
      );
    }

    /** Skeleton cards used while a report is loading. */
    function SkeletonCards({ count }) {
      const total = typeof count === 'number' && count > 0 ? count : 3;
      return h(
        'div',
        { className: 'dshqn-skeleton-grid', 'aria-hidden': true },
        Array.from({ length: total }, (_, index) =>
          h(
            'div',
            { key: index, className: 'dshqn-skeleton-card' },
            h('span', { className: 'dshqn-skeleton-line dshqn-skeleton-line-wide' }),
            h('span', { className: 'dshqn-skeleton-line' }),
            h('span', { className: 'dshqn-skeleton-line dshqn-skeleton-line-short' }),
          ),
        ),
      );
    }

    /** Tab icon name for one view id. */
    function viewIconOf(id) {
      const meta = VIEW_META[id];
      return meta === undefined ? 'note' : meta.icon;
    }

    /** Panel-local styles: only theme tokens, so light and dark follow the host. */
    const STYLES = [
      ".dshqn-page {",
      "  box-sizing: border-box;",
      "  display: flex;",
      "  flex-direction: column;",
      "  gap: 14px;",
      "  min-height: 100%;",
      "  padding: 24px 32px 28px;",
      "  overflow: auto;",
      "  color: var(--dsw-alias-label-primary);",
      "  font-family: inherit;",
      "  font-size: 14px;",
      "}",
      ".dshqn-header { display: flex; align-items: center; gap: 12px; }",
      ".dshqn-header-icon {",
      "  display: inline-flex;",
      "  align-items: center;",
      "  justify-content: center;",
      "  flex: none;",
      "  width: 32px;",
      "  height: 32px;",
      "  border: 1px solid var(--dsw-alias-border-l1);",
      "  border-radius: 8px;",
      "  background: var(--dsw-alias-bg-layer-2);",
      "}",
      ".dshqn-headings { display: flex; flex-direction: column; gap: 2px; min-width: 0; }",
      ".dshqn-title { margin: 0; font-size: 18px; font-weight: 600; line-height: 26px; }",
      ".dshqn-subtitle { margin: 0; font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-toolbar { display: flex; align-items: center; gap: 8px; }",
      ".dshqn-tabs { display: inline-flex; gap: 4px; padding: 3px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); }",
      ".dshqn-tab {",
      "  appearance: none;",
      "  padding: 4px 12px;",
      "  border: 1px solid transparent;",
      "  border-radius: 7px;",
      "  background: transparent;",
      "  color: var(--dsw-alias-label-secondary);",
      "  font: inherit;",
      "  font-size: 13px;",
      "  line-height: 20px;",
      "  cursor: pointer;",
      "}",
      ".dshqn-tab:hover { color: var(--dsw-alias-label-primary); }",
      ".dshqn-tab-active { border-color: var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }",
      ".dshqn-tab:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }",
      ".dshqn-search {",
      "  box-sizing: border-box;",
      "  flex: 1 1 auto;",
      "  min-width: 0;",
      "  padding: 6px 12px;",
      "  border: 1px solid var(--dsw-alias-border-l1);",
      "  border-radius: 8px;",
      "  background: var(--dsw-alias-bg-layer-1);",
      "  color: var(--dsw-alias-label-primary);",
      "  font: inherit;",
      "  font-size: 13px;",
      "  line-height: 20px;",
      "}",
      ".dshqn-search::placeholder { color: var(--dsw-alias-label-secondary); }",
      ".dshqn-search:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }",
      ".dshqn-workspace { display: flex; flex: 1 1 auto; gap: 12px; min-height: 300px; }",
      ".dshqn-list {",
      "  display: flex;",
      "  flex: 0 0 216px;",
      "  flex-direction: column;",
      "  gap: 4px;",
      "  overflow: auto;",
      "  padding: 4px;",
      "  border: 1px solid var(--dsw-alias-border-l1);",
      "  border-radius: 12px;",
      "  background: var(--dsw-alias-bg-layer-1);",
      "}",
      ".dshqn-row {",
      "  display: flex;",
      "  flex-direction: column;",
      "  gap: 2px;",
      "  width: 100%;",
      "  padding: 8px 10px;",
      "  border: 1px solid transparent;",
      "  border-radius: 8px;",
      "  background: transparent;",
      "  color: inherit;",
      "  font: inherit;",
      "  text-align: left;",
      "  cursor: pointer;",
      "}",
      ".dshqn-row:hover { background: var(--dsw-alias-bg-layer-2); }",
      ".dshqn-row:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }",
      ".dshqn-row-selected { border-color: var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); }",
      ".dshqn-row-head { display: flex; align-items: center; gap: 6px; min-width: 0; }",
      ".dshqn-row-title { flex: 1 1 auto; font-size: 13px; line-height: 19px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
      ".dshqn-row-done { text-decoration: line-through; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-row-meta { font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
      ".dshqn-row-meta-overdue { color: var(--dsw-alias-state-error-primary); }",
      ".dshqn-priority { flex: none; width: 6px; height: 6px; border-radius: 50%; background: var(--dsw-alias-label-secondary); opacity: 0.6; }",
      ".dshqn-priority-high { background: var(--dsw-alias-state-error-primary); opacity: 1; }",
      ".dshqn-priority-low { background: var(--dsw-alias-border-l2); opacity: 1; }",
      ".dshqn-filters { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }",
      ".dshqn-filter {",
      "  appearance: none;",
      "  padding: 3px 10px;",
      "  border: 1px solid var(--dsw-alias-border-l1);",
      "  border-radius: 999px;",
      "  background: var(--dsw-alias-bg-layer-1);",
      "  color: var(--dsw-alias-label-secondary);",
      "  font: inherit;",
      "  font-size: 12px;",
      "  line-height: 18px;",
      "  cursor: pointer;",
      "}",
      ".dshqn-filter:hover { color: var(--dsw-alias-label-primary); }",
      ".dshqn-filter-active { border-color: var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }",
      ".dshqn-filter:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }",
      ".dshqn-filter-sep { width: 1px; height: 16px; margin: 0 2px; background: var(--dsw-alias-border-l1); }",
      ".dshqn-group-title { margin: 8px 4px 2px; font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-board { display: flex; flex: 1 1 auto; gap: 10px; min-height: 300px; min-width: 0; overflow: auto; }",
      ".dshqn-board-col { display: flex; flex: 1 1 0; flex-direction: column; gap: 6px; min-width: 150px; max-height: 100%; padding: 6px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); }",
      ".dshqn-board-head { padding: 2px 4px 4px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-board-list { display: flex; flex-direction: column; gap: 6px; overflow: auto; }",
      ".dshqn-card-item { display: flex; flex-direction: column; gap: 4px; padding: 8px 10px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; background: var(--dsw-alias-bg-layer-2); cursor: pointer; }",
      ".dshqn-card-item:hover { border-color: var(--dsw-alias-border-l2); }",
      ".dshqn-card-item-selected { border-color: var(--dsw-alias-brand-primary); }",
      ".dshqn-card-item-dragging { opacity: 0.55; }",
      ".dshqn-card-item-drop { box-shadow: inset 0 2px 0 var(--dsw-alias-brand-primary); }",
      ".dshqn-detail { position: relative; display: flex; flex: 1 1 auto; flex-direction: column; gap: 10px; min-width: 0; overflow: auto; }",
      ".dshqn-detail-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }",
      ".dshqn-detail-name { font-size: 16px; font-weight: 600; line-height: 24px; }",
      ".dshqn-detail-latest { font-size: 14px; line-height: 20px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }",
      ".dshqn-detail-stats { display: flex; flex-wrap: wrap; gap: 14px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-detail-card { padding: 10px 14px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-brand-primary); }",
      ".dshqn-detail-chart { width: 100%; height: 80px; }",
      ".dshqn-detail-add { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }",
      ".dshqn-retention { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-detail-list { display: flex; flex-direction: column; border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); overflow: auto; }",
      ".dshqn-detail-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 6px 14px; border-bottom: 1px solid var(--dsw-alias-border-l1); font-size: 12px; line-height: 18px; cursor: pointer; }",
      ".dshqn-detail-row:hover { background: var(--dsw-alias-bg-layer-2); }",
      ".dshqn-detail-delete { appearance: none; flex: none; padding: 2px 8px; border: 1px solid transparent; border-radius: 6px; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 12px; line-height: 16px; cursor: pointer; }",
      ".dshqn-detail-delete:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }",
      ".dshqn-detail-delete-armed { color: var(--dsw-alias-state-error-primary); }",
      ".dshqn-detail-delete:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }",
      ".dshqn-detail-time { color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }",
      ".dshqn-detail-value { color: var(--dsw-alias-label-primary); font-variant-numeric: tabular-nums; }",
      ".dshqn-detail-edit { position: absolute; top: 8px; left: 8px; right: 8px; z-index: 5; display: flex; flex-direction: column; gap: 10px; padding: 14px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; background: var(--dsw-alias-bg-overlay); }",
      ".dshqn-compare { display: flex; flex-direction: column; gap: 6px; padding: 8px 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); }",
      ".dshqn-compare-legend { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-compare-chart { width: 100%; height: 70px; color: var(--dsw-alias-brand-primary); }",
      ".dshqn-compare-line-1 { color: var(--dsw-alias-state-success-primary); }",
      ".dshqn-compare-line-2 { color: var(--dsw-alias-state-warn-primary); }",
      ".dshqn-overview-page { display: flex; flex-direction: column; gap: 16px; }",
      ".dshqn-kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }",
      ".dshqn-kpi { appearance: none; display: flex; flex-direction: column; gap: 2px; padding: 12px 14px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); font: inherit; text-align: left; cursor: pointer; }",
      ".dshqn-kpi:hover { border-color: var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); }",
      ".dshqn-kpi:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }",
      ".dshqn-kpi-value { font-size: 26px; line-height: 32px; font-weight: 600; color: var(--dsw-alias-label-primary); font-variant-numeric: tabular-nums; }",
      ".dshqn-kpi-label { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-kpi-sub { font-size: 12px; line-height: 16px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-overview-block { display: flex; flex-direction: column; gap: 8px; }",
      ".dshqn-kind-badge { flex: none; padding: 1px 6px; border-radius: 6px; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); font-size: 11px; line-height: 16px; }",
      ".dshqn-row-meta { margin-left: auto; color: var(--dsw-alias-label-secondary); font-size: 12px; font-variant-numeric: tabular-nums; }",
      ".dshqn-all-page { display: flex; flex-direction: column; gap: 8px; min-width: 0; }",
      ".dshqn-all-bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }",
      ".dshqn-check { flex: none; width: 14px; height: 14px; margin: 0; accent-color: var(--dsw-alias-brand-primary); }",
      ".dshqn-brief { display: flex; flex-wrap: wrap; gap: 14px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-board-col-over { border-color: var(--dsw-alias-brand-primary); }",
      ".dshqn-card-head { display: flex; align-items: center; gap: 6px; min-width: 0; }",
      ".dshqn-card-title { flex: 1 1 auto; font-size: 13px; line-height: 19px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
      ".dshqn-card-meta { font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
      ".dshqn-card-meta-overdue { color: var(--dsw-alias-state-error-primary); }",
      ".dshqn-card-action {",
      "  appearance: none;",
      "  align-self: flex-end;",
      "  padding: 2px 8px;",
      "  border: 1px solid var(--dsw-alias-border-l1);",
      "  border-radius: 6px;",
      "  background: var(--dsw-alias-bg-layer-1);",
      "  color: var(--dsw-alias-label-primary);",
      "  font: inherit;",
      "  font-size: 11px;",
      "  line-height: 16px;",
      "  cursor: pointer;",
      "}",
      ".dshqn-card-action:hover { background: var(--dsw-alias-bg-layer-2); }",
      ".dshqn-review { display: flex; flex: 1 1 auto; flex-direction: column; gap: 12px; min-width: 0; }",
      ".dshqn-review-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }",
      ".dshqn-review-progress { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }",
      ".dshqn-review-card { display: flex; flex: 1 1 auto; flex-direction: column; justify-content: center; gap: 10px; min-height: 240px; padding: 28px 24px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); }",
      ".dshqn-review-label { margin: 0; font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-review-text { margin: 0; font-size: 18px; line-height: 28px; white-space: pre-wrap; word-break: break-word; }",
      ".dshqn-review-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }",
      ".dshqn-stats { display: flex; align-items: center; flex-wrap: wrap; gap: 14px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-stat { white-space: nowrap; font-variant-numeric: tabular-nums; }",
      ".dshqn-heat { display: grid; grid-template-columns: repeat(15, 10px); grid-auto-rows: 10px; gap: 2px; margin-left: auto; }",
      ".dshqn-heat-cell { border-radius: 2px; background: var(--dsw-alias-bg-layer-2); border: 1px solid var(--dsw-alias-border-l1); }",
      ".dshqn-heat-on { background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); opacity: 0.45; }",
      ".dshqn-heat-hot { background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); opacity: 0.9; }",
      ".dshqn-hint { margin: 0; padding: 12px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-card {",
      "  display: flex;",
      "  flex: 1 1 auto;",
      "  flex-direction: column;",
      "  min-width: 0;",
      "  overflow: hidden;",
      "  border: 1px solid var(--dsw-alias-border-l1);",
      "  border-radius: 12px;",
      "  background: var(--dsw-alias-bg-layer-1);",
      "}",
      ".dshqn-title-input {",
      "  box-sizing: border-box;",
      "  width: 100%;",
      "  padding: 14px 16px 6px;",
      "  border: 0;",
      "  outline: none;",
      "  background: transparent;",
      "  color: var(--dsw-alias-label-primary);",
      "  font: inherit;",
      "  font-size: 16px;",
      "  font-weight: 600;",
      "  line-height: 24px;",
      "}",
      ".dshqn-title-input::placeholder { color: var(--dsw-alias-label-secondary); font-weight: 400; }",
      ".dshqn-body {",
      "  box-sizing: border-box;",
      "  flex: 1 1 auto;",
      "  width: 100%;",
      "  min-height: 160px;",
      "  resize: none;",
      "  border: 0;",
      "  outline: none;",
      "  padding: 6px 16px 14px;",
      "  background: transparent;",
      "  color: inherit;",
      "  font: inherit;",
      "  line-height: 1.65;",
      "}",
      ".dshqn-body::placeholder { color: var(--dsw-alias-label-secondary); }",
      ".dshqn-title-input:focus-visible, .dshqn-body:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: -2px; }",
      ".dshqn-editor-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; padding: 8px 16px; border-top: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-2); }",
      ".dshqn-field { box-sizing: border-box; flex: 1 1 auto; min-width: 0; padding: 4px 10px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 7px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); font: inherit; font-size: 12px; line-height: 18px; }",
      ".dshqn-field::placeholder { color: var(--dsw-alias-label-secondary); }",
      ".dshqn-field:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }",
      ".dshqn-select { box-sizing: border-box; flex: none; padding: 4px 8px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 7px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); font: inherit; font-size: 12px; line-height: 18px; }",
      ".dshqn-flag { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-field-label { display: flex; flex-direction: column; gap: 2px; flex: 1 1 180px; min-width: 0; }",
      ".dshqn-field-label-text { font-size: 12px; line-height: 16px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-records { display: flex; flex-direction: column; gap: 10px; min-width: 0; overflow: auto; }",
      ".dshqn-view-chip { display: inline-flex; align-items: center; gap: 2px; }",
      ".dshqn-view-delete { appearance: none; padding: 0 6px; border: 1px solid transparent; border-radius: 6px; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 12px; line-height: 18px; cursor: pointer; }",
      ".dshqn-view-delete:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }",
      ".dshqn-view-delete-armed { color: var(--dsw-alias-state-error-primary); }",
      ".dshqn-system { display: flex; flex-direction: column; gap: 14px; min-width: 0; overflow: auto; }",
      ".dshqn-usage { display: flex; flex-direction: column; gap: 10px; min-width: 0; overflow: auto; }",
      ".dshqn-usage-row { flex-wrap: wrap; }",
      ".dshqn-usage-cost { font-weight: 600; color: var(--dsw-alias-label-primary); }",
      ".dshqn-value { display: flex; flex-direction: column; gap: 10px; min-width: 0; overflow: auto; }",
      ".dshqn-value-card { display: flex; flex-direction: column; gap: 8px; padding: 12px 14px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); }",
      ".dshqn-value-score { font-size: 22px; line-height: 28px; font-weight: 600; color: var(--dsw-alias-brand-primary); font-variant-numeric: tabular-nums; }",
      ".dshqn-value-edit { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 8px; }",
      ".dshqn-value-note { flex: 1 1 260px; min-height: 54px; resize: vertical; }",
      ".dshqn-value-spark { width: 80px; height: 24px; color: var(--dsw-alias-brand-primary); }",
      ".dshqn-trend { display: flex; flex-direction: column; gap: 6px; padding: 10px 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); }",
      ".dshqn-trend-chart { width: 100%; height: 120px; }",
      ".dshqn-trend-legend { display: flex; flex-wrap: wrap; gap: 10px; }",
      ".dshqn-trend-swatch { display: inline-block; width: 10px; height: 3px; border-radius: 2px; background: currentColor; }",
      ".dshqn-trend-dot { cursor: pointer; fill: currentColor; }",
      ".dshqn-trend-axis { fill: var(--dsw-alias-label-secondary); font-size: 8px; }",
      ".dshqn-trend-line-0 { color: var(--dsw-alias-brand-primary); }",
      ".dshqn-trend-line-1 { color: var(--dsw-alias-state-success-primary); }",
      ".dshqn-trend-line-2 { color: var(--dsw-alias-state-warn-primary); }",
      ".dshqn-trend-line-3 { color: var(--dsw-alias-state-error-primary); }",
      ".dshqn-trend-line-4 { color: var(--dsw-alias-label-secondary); }",
      ".dshqn-trend-line-5 { color: var(--dsw-alias-label-primary); }",
      ".dshqn-due { flex: 0 0 auto; max-width: 190px; }",
      ".dshqn-status-toggle {",
      "  appearance: none;",
      "  flex: none;",
      "  padding: 4px 10px;",
      "  border: 1px solid var(--dsw-alias-border-l1);",
      "  border-radius: 999px;",
      "  background: var(--dsw-alias-bg-layer-1);",
      "  color: var(--dsw-alias-label-primary);",
      "  font: inherit;",
      "  font-size: 12px;",
      "  line-height: 18px;",
      "  cursor: pointer;",
      "}",
      ".dshqn-status-done { color: var(--dsw-alias-label-secondary); }",
      ".dshqn-status-toggle:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }",
      ".dshqn-priority-group { display: inline-flex; gap: 2px; padding: 2px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 999px; background: var(--dsw-alias-bg-layer-1); }",
      ".dshqn-priority-chip { appearance: none; padding: 2px 8px; border: 0; border-radius: 999px; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 11px; line-height: 16px; cursor: pointer; }",
      ".dshqn-priority-chip:hover { color: var(--dsw-alias-label-primary); }",
      ".dshqn-priority-chip-active { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }",
      ".dshqn-priority-chip:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }",
      ".dshqn-footer {",
      "  display: flex;",
      "  align-items: center;",
      "  justify-content: space-between;",
      "  gap: 12px;",
      "  padding: 8px 16px;",
      "  border-top: 1px solid var(--dsw-alias-border-l1);",
      "  font-size: 12px;",
      "  line-height: 18px;",
      "  color: var(--dsw-alias-label-secondary);",
      "}",
      ".dshqn-count { font-variant-numeric: tabular-nums; white-space: nowrap; }",
      ".dshqn-status-note { margin-right: auto; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }",
      ".dshqn-button {",
      "  appearance: none;",
      "  padding: 6px 14px;",
      "  border: 1px solid var(--dsw-alias-border-l1);",
      "  border-radius: 8px;",
      "  background: var(--dsw-alias-bg-layer-1);",
      "  color: var(--dsw-alias-label-primary);",
      "  font: inherit;",
      "  font-size: 13px;",
      "  line-height: 20px;",
      "  cursor: pointer;",
      "}",
      ".dshqn-button:hover:not(:disabled) { background: var(--dsw-alias-bg-layer-2); }",
      ".dshqn-button:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }",
      ".dshqn-button:disabled { cursor: default; opacity: 0.5; }",
      ".dshqn-button-danger { color: var(--dsw-alias-state-error-primary); }",
      ".dshqn-hidden-input { display: none; }",
      ".dshqn-reminder {",
      "  position: fixed;",
      "  right: 20px;",
      "  bottom: 20px;",
      "  z-index: 60;",
      "  display: flex;",
      "  align-items: center;",
      "  gap: 10px;",
      "  max-width: min(480px, calc(100vw - 40px));",
      "  padding: 10px 14px;",
      "  border: 1px solid var(--dsw-alias-border-l2);",
      "  border-radius: 10px;",
      "  background: var(--dsw-alias-bg-overlay);",
      "  color: var(--dsw-alias-label-primary);",
      "  font-family: inherit;",
      "  font-size: 12px;",
      "  line-height: 18px;",
      "}",
      ".dshqn-reminder-text { flex: 1 1 auto; }",
      ".dshqn-reminder-button {",
      "  appearance: none;",
      "  flex: none;",
      "  padding: 3px 10px;",
      "  border: 1px solid var(--dsw-alias-border-l1);",
      "  border-radius: 7px;",
      "  background: var(--dsw-alias-bg-layer-1);",
      "  color: var(--dsw-alias-label-primary);",
      "  font: inherit;",
      "  font-size: 12px;",
      "  line-height: 18px;",
      "  cursor: pointer;",
      "}",
      ".dshqn-reminder-button:hover { background: var(--dsw-alias-bg-layer-2); }",
      ".dshqn-reminder-button:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }",
      ".dshqn-save-note { display: inline-flex; align-items: center; }",
      ".dshqn-save-button { appearance: none; display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; padding: 0; border: 0; border-radius: 6px; background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; }",
      ".dshqn-save-button:hover:not(:disabled) { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }",
      ".dshqn-save-button:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }",
      ".dshqn-save-button:disabled { cursor: default; opacity: 0.6; }",
      ".dshqn-save-button-done { color: var(--dsw-alias-state-success-primary); opacity: 1; }",
      ".dshqn-settings { box-sizing: border-box; display: flex; flex-direction: column; gap: 14px; padding: 24px 32px; color: var(--dsw-alias-label-primary); font-family: inherit; font-size: 14px; }",
      ".dshqn-settings-title { margin: 0; font-size: 16px; font-weight: 600; line-height: 24px; }",
      ".dshqn-settings-hint { margin: 0; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-settings-group { display: flex; flex-direction: column; gap: 8px; padding: 12px 16px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); }",
      ".dshqn-settings-label { margin: 0; font-size: 12px; font-weight: 600; line-height: 18px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-settings-row { display: flex; align-items: center; gap: 8px; font-size: 13px; line-height: 20px; }",
      ".dshqn-settings-mono { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 12px; word-break: break-all; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-chart { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-top: 1px solid var(--dsw-alias-border-l1); color: var(--dsw-alias-brand-primary); }",
      ".dshqn-chart-title { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); white-space: nowrap; }",
      ".dshqn-chart-empty { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-chart-last { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-primary); font-variant-numeric: tabular-nums; white-space: nowrap; }",
      ".dshqn-spark { flex: 1 1 auto; height: 48px; min-width: 0; }",
      ".dshqn-overview { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; }",
      ".dshqn-overview-card { display: flex; flex-direction: column; gap: 2px; padding: 8px 10px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-brand-primary); appearance: none; text-align: left; font: inherit; cursor: pointer; }",
      ".dshqn-overview-card:hover { border-color: var(--dsw-alias-border-l2); }",
      ".dshqn-overview-card:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }",
      ".dshqn-overview-name { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-overview-value { font-size: 14px; line-height: 20px; font-weight: 600; color: var(--dsw-alias-label-primary); font-variant-numeric: tabular-nums; }",
      ".dshqn-overview-spark { width: 100%; height: 24px; }",
      ".dshqn-history { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 8px 16px; border-top: 1px solid var(--dsw-alias-border-l1); font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-history-row { color: var(--dsw-alias-label-primary); font-variant-numeric: tabular-nums; }",
      ".dshqn-diagnostic {",
      "  flex: 1 1 auto;",
      "  margin: 0;",
      "  padding: 16px;",
      "  overflow: auto;",
      "  white-space: pre-wrap;",
      "  word-break: break-word;",
      "  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;",
      "  font-size: 12px;",
      "  line-height: 1.6;",
      "  color: var(--dsw-alias-state-error-primary);",
      "}",
      ".dshqn-diagnostic-meta {",
      "  padding: 8px 16px;",
      "  border-top: 1px solid var(--dsw-alias-border-l1);",
      "  background: var(--dsw-alias-bg-layer-2);",
      "  font-size: 12px;",
      "  color: var(--dsw-alias-label-secondary);",
      "}",
      "[data-platform=\"darwin\"] .dshqn-page {",
      "  padding-top: calc(24px + var(--dsh-frame-top-clearance, 0px));",
      "  padding-left: calc(32px + var(--dsh-frame-leading-clearance, 0px));",
      "}"
    ].join('\n');

    /** UI v3 layer: surface hierarchy, spacing rhythm, hero/KPI/quick-add polish. Overrides only tokens. */
    const STYLE_UPGRADES = [
      ".dshqn-page {",
      "  gap: 18px;",
      "  max-width: 1180px;",
      "  margin: 0 auto;",
      "  padding: 28px 32px 32px;",
      "  scrollbar-width: thin;",
      "}",
      ".dshqn-page ::-webkit-scrollbar, .dshqn-settings ::-webkit-scrollbar { width: 10px; height: 10px; }",
      ".dshqn-page ::-webkit-scrollbar-thumb, .dshqn-settings ::-webkit-scrollbar-thumb {",
      "  border: 2px solid transparent;",
      "  border-radius: 999px;",
      "  background: var(--dsw-alias-border-l2);",
      "  background-clip: content-box;",
      "}",
      ".dshqn-page ::selection, .dshqn-settings ::selection { background: var(--dsw-alias-brand-primary); color: var(--dsw-alias-bg-base); }",
      ".dshqn-header {",
      "  padding: 18px 20px;",
      "  border: 1px solid var(--dsw-alias-border-l1);",
      "  border-radius: 18px;",
      "  background:",
      "    radial-gradient(120% 180% at 0% 0%, color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent), transparent 58%),",
      "    var(--dsw-alias-bg-layer-1);",
      "}",
      ".dshqn-header-icon {",
      "  width: 42px;",
      "  height: 42px;",
      "  border-radius: 13px;",
      "  border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 28%, var(--dsw-alias-border-l1));",
      "  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, var(--dsw-alias-bg-layer-2));",
      "  color: var(--dsw-alias-brand-primary);",
      "}",
      ".dshqn-title { font-size: 21px; line-height: 28px; letter-spacing: -0.01em; }",
      ".dshqn-subtitle { font-size: 13px; line-height: 20px; max-width: 620px; }",
      ".dshqn-header-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }",
      ".dshqn-status-pill {",
      "  display: inline-flex;",
      "  align-items: center;",
      "  gap: 6px;",
      "  padding: 4px 10px;",
      "  border: 1px solid var(--dsw-alias-border-l1);",
      "  border-radius: 999px;",
      "  background: var(--dsw-alias-bg-layer-2);",
      "  color: var(--dsw-alias-label-secondary);",
      "  font-size: 12px;",
      "  line-height: 18px;",
      "  white-space: nowrap;",
      "}",
      ".dshqn-status-pill::before {",
      "  content: \"\";",
      "  width: 6px;",
      "  height: 6px;",
      "  border-radius: 50%;",
      "  background: var(--dsw-alias-label-secondary);",
      "}",
      ".dshqn-status-synced::before { background: var(--dsw-alias-state-success-primary); }",
      ".dshqn-status-saving::before { background: var(--dsw-alias-state-warn-primary); }",
      ".dshqn-status-offline::before { background: var(--dsw-alias-state-error-primary); }",
      ".dshqn-toolbar { flex-wrap: wrap; gap: 10px; row-gap: 8px; }",
      ".dshqn-toolbar > .dshqn-tabs { flex: 0 1 auto; }",
      "@media (min-width: 1080px) {",
      "  .dshqn-overview-page .dshqn-kpi-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }",
      "}",
      ".dshqn-tabs {",
      "  padding: 4px;",
      "  gap: 2px;",
      "  flex-wrap: nowrap;",
      "  max-width: 100%;",
      "  overflow-x: auto;",
      "  scrollbar-width: thin;",
      "  border-radius: 12px;",
      "  background: var(--dsw-alias-bg-layer-1);",
      "}",
      ".dshqn-tab {",
      "  display: inline-flex;",
      "  align-items: center;",
      "  flex: none;",
      "  gap: 6px;",
      "  padding: 6px 12px;",
      "  white-space: nowrap;",
      "  border-radius: 9px;",
      "  font-weight: 500;",
      "  transition: background 120ms ease, color 120ms ease, transform 120ms ease;",
      "}",
      ".dshqn-tab:hover { background: var(--dsw-alias-bg-layer-2); }",
      ".dshqn-tab-active {",
      "  background: var(--dsw-alias-bg-layer-2);",
      "  color: var(--dsw-alias-label-primary);",
      "  box-shadow: inset 0 0 0 1px var(--dsw-alias-border-l1);",
      "}",
      ".dshqn-tab .dshqn-icon { opacity: 0.75; }",
      ".dshqn-tab-active .dshqn-icon { opacity: 1; color: var(--dsw-alias-brand-primary); }",
      ".dshqn-search-wrap { position: relative; display: flex; flex: 1 1 200px; min-width: 160px; align-items: center; }",
      ".dshqn-search-wrap .dshqn-icon { position: absolute; left: 10px; color: var(--dsw-alias-label-secondary); pointer-events: none; }",
      ".dshqn-search-wrap .dshqn-search { padding-left: 30px; }",
      ".dshqn-search { min-height: 32px; border-radius: 9px; }",
      ".dshqn-button {",
      "  display: inline-flex;",
      "  align-items: center;",
      "  justify-content: center;",
      "  gap: 6px;",
      "  padding: 7px 14px;",
      "  border-radius: 9px;",
      "  font-weight: 500;",
      "  transition: background 120ms ease, border-color 120ms ease, color 120ms ease, transform 120ms ease;",
      "}",
      ".dshqn-button:hover:not(:disabled) { border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 45%, var(--dsw-alias-border-l1)); }",
      ".dshqn-button:active:not(:disabled) { transform: translateY(1px); }",
      ".dshqn-button-primary { background: var(--dsw-alias-brand-primary); border-color: transparent; color: var(--dsw-alias-bg-base); }",
      ".dshqn-button-primary:hover:not(:disabled) { background: var(--dsw-alias-brand-primary); color: var(--dsw-alias-bg-base); opacity: 0.92; }",
      ".dshqn-icon { flex: none; }",
      ".dshqn-workspace { gap: 14px; min-height: 340px; }",
      ".dshqn-list {",
      "  flex-basis: 232px;",
      "  gap: 2px;",
      "  padding: 6px;",
      "  border-radius: 14px;",
      "  background: var(--dsw-alias-bg-layer-1);",
      "}",
      ".dshqn-row { padding: 9px 11px; border-radius: 9px; transition: background 120ms ease, border-color 120ms ease; }",
      ".dshqn-all-row { align-items: center; }",
      ".dshqn-card { border-radius: 14px; }",
      ".dshqn-title-input { padding: 18px 18px 6px; font-size: 17px; line-height: 26px; }",
      ".dshqn-body { padding: 6px 18px 16px; }",
      ".dshqn-editor-meta { padding: 10px 18px; border-top: 1px solid var(--dsw-alias-border-l1); }",
      ".dshqn-footer {",
      "  padding: 9px 16px;",
      "  border: 1px solid var(--dsw-alias-border-l1);",
      "  border-radius: 12px;",
      "  background: var(--dsw-alias-bg-layer-1);",
      "}",
      ".dshqn-status-note { display: inline-flex; align-items: center; gap: 6px; }",
      ".dshqn-overview-page { gap: 20px; }",
      ".dshqn-overview-block { gap: 10px; }",
      ".dshqn-brief { gap: 8px; }",
      ".dshqn-hero {",
      "  display: flex;",
      "  flex-wrap: wrap;",
      "  align-items: center;",
      "  justify-content: space-between;",
      "  gap: 16px;",
      "  padding: 20px 22px;",
      "  border: 1px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 22%, var(--dsw-alias-border-l1));",
      "  border-radius: 18px;",
      "  background:",
      "    radial-gradient(90% 160% at 100% 0%, color-mix(in srgb, var(--dsw-alias-brand-primary) 16%, transparent), transparent 62%),",
      "    var(--dsw-alias-bg-layer-1);",
      "}",
      ".dshqn-hero-main { display: flex; flex-direction: column; gap: 6px; min-width: 0; }",
      ".dshqn-hero-kicker {",
      "  font-size: 11px;",
      "  font-weight: 600;",
      "  line-height: 16px;",
      "  letter-spacing: 0.08em;",
      "  text-transform: uppercase;",
      "  color: var(--dsw-alias-brand-primary);",
      "}",
      ".dshqn-hero-title { margin: 0; font-size: 22px; line-height: 30px; font-weight: 650; letter-spacing: -0.01em; }",
      ".dshqn-hero-hint { margin: 0; font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }",
      ".dshqn-hero-stats { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }",
      ".dshqn-hero-chip {",
      "  display: inline-flex;",
      "  align-items: center;",
      "  gap: 5px;",
      "  padding: 3px 9px;",
      "  border: 1px solid var(--dsw-alias-border-l1);",
      "  border-radius: 999px;",
      "  background: var(--dsw-alias-bg-layer-2);",
      "  color: var(--dsw-alias-label-secondary);",
      "  font-size: 12px;",
      "  line-height: 18px;",
      "  white-space: nowrap;",
      "}",
      ".dshqn-hero-chip .dshqn-icon { color: var(--dsw-alias-brand-primary); }",
      ".dshqn-section-head { display: flex; align-items: center; gap: 10px; min-width: 0; }",
      ".dshqn-section-mark { flex: none; width: 3px; height: 18px; border-radius: 999px; background: var(--dsw-alias-brand-primary); }",
      ".dshqn-section-copy { display: flex; flex-direction: column; gap: 1px; min-width: 0; }",
      ".dshqn-section-title { margin: 0; font-size: 14px; line-height: 21px; font-weight: 600; }",
      ".dshqn-section-hint { margin: 0; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-section-spacer { flex: 1 1 auto; }",
      ".dshqn-kpi-grid { gap: 12px; grid-template-columns: repeat(auto-fit, minmax(168px, 1fr)); }",
      ".dshqn-kpi {",
      "  position: relative;",
      "  gap: 6px;",
      "  padding: 14px 16px 13px;",
      "  border-radius: 14px;",
      "  background: var(--dsw-alias-bg-layer-1);",
      "  overflow: hidden;",
      "  transition: border-color 120ms ease, transform 120ms ease, background 120ms ease;",
      "}",
      ".dshqn-kpi::after {",
      "  content: \"\";",
      "  position: absolute;",
      "  left: 0;",
      "  top: 14px;",
      "  bottom: 14px;",
      "  width: 3px;",
      "  border-radius: 999px;",
      "  background: var(--dsw-alias-brand-primary);",
      "}",
      ".dshqn-kpi:hover { transform: translateY(-1px); }",
      ".dshqn-kpi:hover::after { width: 4px; }",
      ".dshqn-kpi-top { display: flex; align-items: center; gap: 8px; }",
      ".dshqn-kpi-icon {",
      "  display: inline-flex;",
      "  align-items: center;",
      "  justify-content: center;",
      "  width: 26px;",
      "  height: 26px;",
      "  border-radius: 8px;",
      "  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent);",
      "  color: var(--dsw-alias-brand-primary);",
      "}",
      ".dshqn-kpi-value { font-size: 28px; line-height: 34px; letter-spacing: -0.02em; }",
      ".dshqn-kpi-label { font-size: 12px; font-weight: 500; }",
      ".dshqn-kpi-sub { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
      ".dshqn-kpi-warn::after { background: var(--dsw-alias-state-warn-primary); }",
      ".dshqn-kpi-warn .dshqn-kpi-icon {",
      "  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 16%, transparent);",
      "  color: var(--dsw-alias-state-warn-primary);",
      "}",
      ".dshqn-kpi-error::after { background: var(--dsw-alias-state-error-primary); }",
      ".dshqn-kpi-error .dshqn-kpi-icon {",
      "  background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 16%, transparent);",
      "  color: var(--dsw-alias-state-error-primary);",
      "}",
      ".dshqn-kpi-success::after { background: var(--dsw-alias-state-success-primary); }",
      ".dshqn-kpi-success .dshqn-kpi-icon {",
      "  background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 16%, transparent);",
      "  color: var(--dsw-alias-state-success-primary);",
      "}",
      ".dshqn-quick-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(168px, 1fr)); gap: 10px; }",
      ".dshqn-quick-card {",
      "  appearance: none;",
      "  display: flex;",
      "  align-items: flex-start;",
      "  gap: 10px;",
      "  padding: 12px 14px;",
      "  border: 1px solid var(--dsw-alias-border-l1);",
      "  border-radius: 13px;",
      "  background: var(--dsw-alias-bg-layer-1);",
      "  color: inherit;",
      "  font: inherit;",
      "  text-align: left;",
      "  cursor: pointer;",
      "  transition: border-color 120ms ease, transform 120ms ease, background 120ms ease;",
      "}",
      ".dshqn-quick-card:hover { border-color: var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); transform: translateY(-1px); }",
      ".dshqn-quick-card:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }",
      ".dshqn-quick-icon {",
      "  display: inline-flex;",
      "  align-items: center;",
      "  justify-content: center;",
      "  flex: none;",
      "  width: 30px;",
      "  height: 30px;",
      "  border-radius: 9px;",
      "  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 13%, transparent);",
      "  color: var(--dsw-alias-brand-primary);",
      "}",
      ".dshqn-quick-copy { display: flex; flex-direction: column; gap: 1px; min-width: 0; }",
      ".dshqn-quick-title { font-size: 13px; line-height: 20px; font-weight: 600; color: var(--dsw-alias-label-primary); }",
      ".dshqn-quick-hint { font-size: 11px; line-height: 17px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-overview-list { display: flex; flex-direction: column; gap: 2px; padding: 6px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 14px; background: var(--dsw-alias-bg-layer-1); }",
      ".dshqn-overview-row {",
      "  display: flex;",
      "  align-items: center;",
      "  gap: 10px;",
      "  padding: 9px 11px;",
      "  border-radius: 9px;",
      "  cursor: pointer;",
      "  transition: background 120ms ease;",
      "}",
      ".dshqn-overview-row:hover { background: var(--dsw-alias-bg-layer-2); }",
      ".dshqn-overview-row:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: -2px; }",
      ".dshqn-row-icon {",
      "  display: inline-flex;",
      "  align-items: center;",
      "  justify-content: center;",
      "  flex: none;",
      "  width: 26px;",
      "  height: 26px;",
      "  border-radius: 8px;",
      "  background: var(--dsw-alias-bg-layer-2);",
      "  color: var(--dsw-alias-label-secondary);",
      "}",
      ".dshqn-overview-row-title { flex: 1 1 auto; min-width: 0; font-size: 13px; line-height: 20px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
      ".dshqn-overview-row-meta { flex: none; font-size: 12px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }",
      ".dshqn-badge {",
      "  display: inline-flex;",
      "  align-items: center;",
      "  padding: 1px 8px;",
      "  border-radius: 999px;",
      "  background: var(--dsw-alias-bg-layer-2);",
      "  color: var(--dsw-alias-label-secondary);",
      "  font-size: 11px;",
      "  line-height: 17px;",
      "  white-space: nowrap;",
      "}",
      ".dshqn-badge-brand { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent); color: var(--dsw-alias-brand-primary); }",
      ".dshqn-badge-success { background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 15%, transparent); color: var(--dsw-alias-state-success-primary); }",
      ".dshqn-badge-warn { background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 16%, transparent); color: var(--dsw-alias-state-warn-primary); }",
      ".dshqn-badge-error { background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 15%, transparent); color: var(--dsw-alias-state-error-primary); }",
      ".dshqn-empty {",
      "  display: flex;",
      "  flex-direction: column;",
      "  align-items: center;",
      "  gap: 4px;",
      "  padding: 28px 18px;",
      "  border: 1px dashed var(--dsw-alias-border-l2);",
      "  border-radius: 14px;",
      "  color: var(--dsw-alias-label-secondary);",
      "  text-align: center;",
      "}",
      ".dshqn-empty-icon {",
      "  display: inline-flex;",
      "  align-items: center;",
      "  justify-content: center;",
      "  width: 40px;",
      "  height: 40px;",
      "  margin-bottom: 4px;",
      "  border-radius: 12px;",
      "  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent);",
      "  color: var(--dsw-alias-brand-primary);",
      "}",
      ".dshqn-empty-title { margin: 0; font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-primary); }",
      ".dshqn-empty-hint { margin: 0; font-size: 12px; line-height: 18px; }",
      ".dshqn-value-card { border-radius: 14px; padding: 14px 16px; transition: border-color 120ms ease; }",
      ".dshqn-value-head { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }",
      ".dshqn-value-head .dshqn-row-title { font-size: 15px; font-weight: 600; }",
      ".dshqn-value-card:hover { border-color: var(--dsw-alias-border-l2); }",
      ".dshqn-value-score { font-size: 24px; line-height: 30px; letter-spacing: -0.01em; }",
      ".dshqn-trend { border-radius: 14px; padding: 12px 14px; }",
      ".dshqn-filter {",
      "  padding: 4px 11px;",
      "  font-weight: 500;",
      "  transition: background 120ms ease, border-color 120ms ease, color 120ms ease;",
      "}",
      ".dshqn-filter-active {",
      "  border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 32%, var(--dsw-alias-border-l1));",
      "  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, var(--dsw-alias-bg-layer-2));",
      "  color: var(--dsw-alias-brand-primary);",
      "}",
      ".dshqn-kind-badge { border-radius: 999px; padding: 1px 8px; background: var(--dsw-alias-bg-layer-2); }",
      ".dshqn-all-bar {",
      "  padding: 8px 12px;",
      "  border: 1px solid var(--dsw-alias-border-l1);",
      "  border-radius: 12px;",
      "  background: var(--dsw-alias-bg-layer-1);",
      "}",
      ".dshqn-group-title { font-weight: 600; }",
      ".dshqn-detail-card, .dshqn-review-card, .dshqn-compare { border-radius: 14px; }",
      ".dshqn-history {",
      "  padding: 9px 16px;",
      "  border: 1px solid var(--dsw-alias-border-l1);",
      "  border-radius: 12px;",
      "  background: var(--dsw-alias-bg-layer-1);",
      "}",
      ".dshqn-usage-row, .dshqn-all-row { padding: 10px 12px; }",
      ".dshqn-settings { max-width: 980px; margin: 0 auto; gap: 16px; padding: 28px 32px; }",
      ".dshqn-settings-head { display: flex; align-items: center; gap: 12px; padding: 2px; }",
      ".dshqn-settings-head .dshqn-settings-hint { margin-top: 2px; }",
      ".dshqn-settings-group { border-radius: 14px; padding: 14px 18px; transition: border-color 120ms ease; }",
      ".dshqn-settings-group:hover { border-color: var(--dsw-alias-border-l2); }",
      ".dshqn-settings-title { letter-spacing: -0.01em; }",
      ".dshqn-heat-cell { border-radius: 3px; }",
      ".dshqn-board-col { border-radius: 14px; }",
      ".dshqn-card-item { border-radius: 10px; }",
      ".dshqn-detail-card, .dshqn-detail-list { border-radius: 14px; }",
      "@media (max-width: 860px) {",
      "  .dshqn-page { padding: 18px 18px 22px; gap: 14px; }",
      "  .dshqn-header { padding: 14px 16px; align-items: flex-start; flex-wrap: wrap; }",
      "  .dshqn-header-actions { margin-left: 0; width: 100%; }",
      "  .dshqn-toolbar { align-items: stretch; }",
      "  .dshqn-tabs { overflow-x: auto; flex-wrap: nowrap; }",
      "  .dshqn-hero { padding: 16px; }",
      "  .dshqn-hero-title { font-size: 19px; line-height: 27px; }",
      "  .dshqn-workspace { flex-direction: column; }",
      "  .dshqn-list { flex: 1 1 auto; max-height: 240px; }",
      "  .dshqn-board { flex-direction: column; }",
      "  .dshqn-settings { padding: 18px; }",
      "}",
      "@media (prefers-reduced-motion: reduce) {",
      "  .dshqn-page *, .dshqn-settings * { transition-duration: 0.01ms; animation-duration: 0.01ms; }",
      "}",
      ".dshqn-page, .dshqn-settings { --dshqn-accent: var(--dsw-alias-brand-primary); }",
      ".dshqn-hero {",
      "  border-color: color-mix(in srgb, var(--dshqn-accent) 22%, var(--dsw-alias-border-l1));",
      "  background:",
      "    radial-gradient(90% 160% at 100% 0%, color-mix(in srgb, var(--dshqn-accent) 16%, transparent), transparent 62%),",
      "    var(--dsw-alias-bg-layer-1);",
      "}",
      ".dshqn-hero-kicker, .dshqn-hero-chip .dshqn-icon, .dshqn-section-mark, .dshqn-tab-active .dshqn-icon, .dshqn-value-score { color: var(--dshqn-accent); }",
      ".dshqn-section-mark, .dshqn-kpi::after { background: var(--dshqn-accent); }",
      ".dshqn-kpi-icon, .dshqn-quick-icon {",
      "  background: color-mix(in srgb, var(--dshqn-accent) 14%, transparent);",
      "  color: var(--dshqn-accent);",
      "}",
      ".dshqn-header-icon {",
      "  border-color: color-mix(in srgb, var(--dshqn-accent) 28%, var(--dsw-alias-border-l1));",
      "  background: color-mix(in srgb, var(--dshqn-accent) 14%, var(--dsw-alias-bg-layer-2));",
      "  color: var(--dshqn-accent);",
      "}",
      ".dshqn-button-primary { background: var(--dshqn-accent); }",
      ".dshqn-filter-active {",
      "  border-color: color-mix(in srgb, var(--dshqn-accent) 32%, var(--dsw-alias-border-l1));",
      "  background: color-mix(in srgb, var(--dshqn-accent) 12%, var(--dsw-alias-bg-layer-2));",
      "  color: var(--dshqn-accent);",
      "}",
      ".dshqn-page :focus-visible { outline-color: var(--dshqn-accent); }",
      ".dshqn-kpi-spark { width: 100%; height: 22px; margin-top: 2px; color: var(--dshqn-accent); }",
      ".dshqn-kpi-warn .dshqn-kpi-spark { color: var(--dsw-alias-state-warn-primary); }",
      ".dshqn-kpi-error .dshqn-kpi-spark { color: var(--dsw-alias-state-error-primary); }",
      ".dshqn-kpi-success .dshqn-kpi-spark { color: var(--dsw-alias-state-success-primary); }",
      ".dshqn-skeleton-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }",
      ".dshqn-skeleton-card {",
      "  display: flex;",
      "  flex-direction: column;",
      "  gap: 10px;",
      "  padding: 16px;",
      "  border: 1px solid var(--dsw-alias-border-l1);",
      "  border-radius: 14px;",
      "  background: var(--dsw-alias-bg-layer-1);",
      "}",
      ".dshqn-skeleton { display: flex; flex-direction: column; gap: 8px; padding: 4px 0; }",
      ".dshqn-skeleton-line {",
      "  display: block;",
      "  height: 10px;",
      "  border-radius: 999px;",
      "  background: linear-gradient(",
      "    90deg,",
      "    var(--dsw-alias-bg-layer-2) 25%,",
      "    color-mix(in srgb, var(--dsw-alias-border-l1) 55%, var(--dsw-alias-bg-layer-2)) 50%,",
      "    var(--dsw-alias-bg-layer-2) 75%",
      "  );",
      "  background-size: 200% 100%;",
      "  animation: dshqn-shimmer 1.4s ease-in-out infinite;",
      "}",
      ".dshqn-skeleton-line-wide { width: 82%; height: 12px; }",
      ".dshqn-skeleton-line-short { width: 55%; }",
      "@keyframes dshqn-shimmer {",
      "  0% { background-position: 200% 0; }",
      "  100% { background-position: -200% 0; }",
      "}",
      ".dshqn-compact { font-size: 13px; }",
      ".dshqn-page.dshqn-compact { padding: 18px 22px 20px; gap: 12px; }",
      ".dshqn-settings.dshqn-compact { padding: 18px 22px; gap: 12px; }",
      ".dshqn-compact .dshqn-header { padding: 12px 16px; border-radius: 14px; }",
      ".dshqn-compact .dshqn-title { font-size: 19px; line-height: 26px; }",
      ".dshqn-compact .dshqn-hero { padding: 14px 16px; border-radius: 14px; }",
      ".dshqn-compact .dshqn-hero-title { font-size: 18px; line-height: 26px; }",
      ".dshqn-compact .dshqn-kpi { padding: 10px 12px 9px; border-radius: 12px; }",
      ".dshqn-compact .dshqn-kpi-value { font-size: 23px; line-height: 28px; }",
      ".dshqn-compact .dshqn-quick-card { padding: 9px 11px; }",
      ".dshqn-compact .dshqn-row, .dshqn-compact .dshqn-overview-row { padding: 6px 9px; }",
      ".dshqn-compact .dshqn-list { flex-basis: 208px; padding: 4px; }",
      ".dshqn-compact .dshqn-tabs { padding: 3px; }",
      ".dshqn-compact .dshqn-tab { padding: 4px 9px; }",
      ".dshqn-compact .dshqn-title-input { padding: 12px 14px 4px; font-size: 15px; }",
      ".dshqn-compact .dshqn-body { min-height: 120px; padding: 4px 14px 10px; }",
      ".dshqn-compact .dshqn-settings-group { padding: 10px 14px; }",
      ".dshqn-compact .dshqn-section-head { gap: 8px; }",
      ".dshqn-accent-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }",
      ".dshqn-accent-swatch {",
      "  appearance: none;",
      "  width: 26px;",
      "  height: 26px;",
      "  padding: 0;",
      "  border: 2px solid var(--dsw-alias-border-l1);",
      "  border-radius: 50%;",
      "  cursor: pointer;",
      "  transition: transform 120ms ease, border-color 120ms ease;",
      "}",
      ".dshqn-accent-swatch:hover { transform: scale(1.08); }",
      ".dshqn-accent-swatch:focus-visible { outline: 2px solid var(--dshqn-accent); outline-offset: 2px; }",
      ".dshqn-accent-swatch-active { border-color: var(--dsw-alias-label-primary); }",
      ".dshqn-accent-input {",
      "  width: 32px;",
      "  height: 26px;",
      "  padding: 0;",
      "  border: 1px solid var(--dsw-alias-border-l1);",
      "  border-radius: 7px;",
      "  background: var(--dsw-alias-bg-layer-1);",
      "  cursor: pointer;",
      "}",
      ".dshqn-card-item {",
      "  transition: border-color 120ms ease, background 120ms ease, transform 120ms ease, box-shadow 160ms ease;",
      "}",
      ".dshqn-card-item:hover { transform: translateY(-1px); }",
      ".dshqn-card-item-dragging { opacity: 0.5; transform: scale(0.98) rotate(-0.4deg); }",
      ".dshqn-card-item-drop { animation: dshqn-drop-in 260ms ease-out 1; }",
      ".dshqn-board-col { transition: border-color 120ms ease, background 120ms ease; }",
      ".dshqn-board-col-over {",
      "  border-color: var(--dshqn-accent);",
      "  background: color-mix(in srgb, var(--dshqn-accent) 8%, var(--dsw-alias-bg-layer-1));",
      "}",
      ".dshqn-pin-button {",
      "  appearance: none;",
      "  display: inline-flex;",
      "  align-items: center;",
      "  justify-content: center;",
      "  width: 26px;",
      "  height: 26px;",
      "  padding: 0;",
      "  border: 1px solid var(--dsw-alias-border-l1);",
      "  border-radius: 8px;",
      "  background: var(--dsw-alias-bg-layer-1);",
      "  color: var(--dsw-alias-label-secondary);",
      "  cursor: pointer;",
      "  transition: color 120ms ease, border-color 120ms ease, background 120ms ease;",
      "}",
      ".dshqn-pin-button:hover { color: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-border-l2); }",
      ".dshqn-pin-active { color: var(--dshqn-accent); border-color: color-mix(in srgb, var(--dshqn-accent) 45%, var(--dsw-alias-border-l1)); }",
      ".dshqn-icon-button {",
      "  appearance: none;",
      "  display: inline-flex;",
      "  align-items: center;",
      "  justify-content: center;",
      "  width: 24px;",
      "  height: 24px;",
      "  margin-left: auto;",
      "  padding: 0;",
      "  border: 1px solid transparent;",
      "  border-radius: 7px;",
      "  background: transparent;",
      "  color: var(--dsw-alias-label-secondary);",
      "  cursor: pointer;",
      "  transition: background 120ms ease, color 120ms ease;",
      "}",
      ".dshqn-icon-button:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }",
      ".dshqn-icon-button:focus-visible { outline: 2px solid var(--dshqn-accent); outline-offset: 1px; }",
      ".dshqn-due-presets { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 4px; }",
      ".dshqn-review-goal { display: flex; flex: 1 1 auto; flex-wrap: wrap; align-items: center; gap: 8px; min-width: 0; }",
      ".dshqn-review-bar {",
      "  display: inline-flex;",
      "  flex: 1 1 120px;",
      "  min-width: 80px;",
      "  max-width: 240px;",
      "  height: 6px;",
      "  overflow: hidden;",
      "  border-radius: 999px;",
      "  background: var(--dsw-alias-bg-layer-2);",
      "}",
      ".dshqn-review-bar-fill { display: block; height: 100%; border-radius: 999px; background: var(--dshqn-accent); transition: width 180ms ease; }",
      ".dshqn-review-actions { display: flex; align-items: center; gap: 8px; }",
      ".dshqn-palette-backdrop {",
      "  position: fixed;",
      "  inset: 0;",
      "  z-index: 80;",
      "  display: flex;",
      "  align-items: flex-start;",
      "  justify-content: center;",
      "  padding: 12vh 20px 20px;",
      "  background: color-mix(in srgb, var(--dsw-alias-bg-base) 45%, transparent);",
      "  backdrop-filter: blur(3px);",
      "}",
      ".dshqn-palette {",
      "  display: flex;",
      "  flex-direction: column;",
      "  width: min(560px, 100%);",
      "  max-height: 64vh;",
      "  overflow: hidden;",
      "  border: 1px solid var(--dsw-alias-border-l2);",
      "  border-radius: 16px;",
      "  background: var(--dsw-alias-bg-overlay);",
      "  box-shadow: 0 18px 48px color-mix(in srgb, var(--dsw-alias-bg-base) 40%, transparent);",
      "  animation: dshqn-palette-in 160ms ease-out 1;",
      "}",
      ".dshqn-palette-input {",
      "  box-sizing: border-box;",
      "  width: 100%;",
      "  padding: 14px 16px;",
      "  border: 0;",
      "  border-bottom: 1px solid var(--dsw-alias-border-l1);",
      "  outline: none;",
      "  background: transparent;",
      "  color: var(--dsw-alias-label-primary);",
      "  font: inherit;",
      "  font-size: 15px;",
      "}",
      ".dshqn-palette-input::placeholder { color: var(--dsw-alias-label-secondary); }",
      ".dshqn-palette-list { display: flex; flex-direction: column; gap: 2px; padding: 6px; overflow-y: auto; }",
      ".dshqn-palette-group { margin: 8px 8px 2px; font-size: 11px; line-height: 16px; font-weight: 600; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-palette-item {",
      "  appearance: none;",
      "  display: flex;",
      "  align-items: center;",
      "  gap: 9px;",
      "  width: 100%;",
      "  padding: 8px 10px;",
      "  border: 1px solid transparent;",
      "  border-radius: 9px;",
      "  background: transparent;",
      "  color: var(--dsw-alias-label-primary);",
      "  font: inherit;",
      "  font-size: 13px;",
      "  line-height: 20px;",
      "  text-align: left;",
      "  cursor: pointer;",
      "}",
      ".dshqn-palette-item .dshqn-icon { color: var(--dsw-alias-label-secondary); }",
      ".dshqn-palette-item-active { border-color: color-mix(in srgb, var(--dshqn-accent) 28%, var(--dsw-alias-border-l1)); background: color-mix(in srgb, var(--dshqn-accent) 10%, var(--dsw-alias-bg-layer-2)); }",
      ".dshqn-palette-item-active .dshqn-icon { color: var(--dshqn-accent); }",
      ".dshqn-palette-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
      ".dshqn-calendar { display: flex; flex-direction: column; gap: 12px; min-width: 0; overflow: auto; }",
      ".dshqn-calendar-bar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }",
      ".dshqn-calendar-nav { display: flex; align-items: center; gap: 8px; }",
      ".dshqn-calendar-month { min-width: 110px; text-align: center; font-size: 15px; font-weight: 600; }",
      ".dshqn-calendar-total { font-size: 12px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-calendar-weekdays { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; }",
      ".dshqn-calendar-weekday { padding: 0 8px; font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-calendar-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; }",
      ".dshqn-calendar-day {",
      "  appearance: none;",
      "  display: flex;",
      "  flex-direction: column;",
      "  align-items: stretch;",
      "  gap: 3px;",
      "  min-height: 84px;",
      "  padding: 6px 7px;",
      "  border: 1px solid var(--dsw-alias-border-l1);",
      "  border-radius: 10px;",
      "  background: var(--dsw-alias-bg-layer-1);",
      "  color: var(--dsw-alias-label-primary);",
      "  font: inherit;",
      "  text-align: left;",
      "  cursor: pointer;",
      "  transition: border-color 120ms ease, background 120ms ease;",
      "}",
      ".dshqn-calendar-day:hover { border-color: var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); }",
      ".dshqn-calendar-day:focus-visible { outline: 2px solid var(--dshqn-accent); outline-offset: 1px; }",
      ".dshqn-calendar-out { opacity: 0.45; }",
      ".dshqn-calendar-today { border-color: color-mix(in srgb, var(--dshqn-accent) 45%, var(--dsw-alias-border-l1)); }",
      ".dshqn-calendar-selected { background: color-mix(in srgb, var(--dshqn-accent) 10%, var(--dsw-alias-bg-layer-2)); border-color: var(--dshqn-accent); }",
      ".dshqn-calendar-date { font-size: 12px; line-height: 16px; font-weight: 600; font-variant-numeric: tabular-nums; }",
      ".dshqn-calendar-chip { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 1px 5px; border-radius: 5px; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); font-size: 10px; line-height: 15px; }",
      ".dshqn-calendar-chip-task { color: var(--dshqn-accent); }",
      ".dshqn-calendar-chip-review { color: var(--dsw-alias-state-warn-primary); }",
      ".dshqn-calendar-chip-med { color: var(--dsw-alias-state-success-primary); }",
      ".dshqn-calendar-chip-overdue { color: var(--dsw-alias-state-error-primary); }",
      ".dshqn-calendar-chip-done { opacity: 0.6; text-decoration: line-through; }",
      ".dshqn-calendar-more { font-size: 10px; line-height: 15px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-calendar-detail { display: flex; flex-direction: column; gap: 8px; padding: 10px 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 14px; background: var(--dsw-alias-bg-layer-1); }",
      ".dshqn-calendar-events { display: flex; flex-direction: column; gap: 4px; }",
      ".dshqn-calendar-event { appearance: none; display: flex; align-items: center; gap: 8px; padding: 6px 8px; border: 1px solid transparent; border-radius: 8px; background: transparent; color: inherit; font: inherit; font-size: 13px; text-align: left; cursor: pointer; }",
      ".dshqn-calendar-event:hover { background: var(--dsw-alias-bg-layer-2); }",
      ".dshqn-calendar-event:focus-visible { outline: 2px solid var(--dshqn-accent); outline-offset: 1px; }",
      ".dshqn-calendar-event-time { flex: none; width: 42px; font-size: 12px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }",
      ".dshqn-calendar-event-title { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
      ".dshqn-calendar-event-task .dshqn-icon { color: var(--dshqn-accent); }",
      ".dshqn-calendar-event-review .dshqn-icon { color: var(--dsw-alias-state-warn-primary); }",
      ".dshqn-calendar-event-med .dshqn-icon { color: var(--dsw-alias-state-success-primary); }",
      ".dshqn-calendar-event-overdue .dshqn-icon { color: var(--dsw-alias-state-error-primary); }",
      ".dshqn-calendar-event-done { opacity: 0.65; }",
      ".dshqn-insights { display: flex; flex-direction: column; gap: 12px; min-width: 0; }",
      ".dshqn-insights-bar { display: flex; align-items: center; gap: 10px; }",
      ".dshqn-usage-daily { display: flex; flex-direction: column; gap: 6px; padding: 10px 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 14px; background: var(--dsw-alias-bg-layer-1); }",
      ".dshqn-usage-chart { width: 100%; height: 90px; color: var(--dshqn-accent); }",
      ".dshqn-usage-days { display: flex; justify-content: space-between; gap: 2px; }",
      ".dshqn-usage-day { flex: 1 1 0; text-align: center; font-size: 10px; line-height: 14px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }",
      ".dshqn-usage-sessions { display: flex; flex-direction: column; gap: 2px; padding: 10px 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 14px; background: var(--dsw-alias-bg-layer-1); }",
      ".dshqn-usage-session { display: flex; align-items: center; gap: 10px; padding: 6px 4px; border-bottom: 1px solid var(--dsw-alias-border-l1); font-size: 12px; line-height: 18px; }",
      ".dshqn-usage-session:last-child { border-bottom: 0; }",
      ".dshqn-usage-session-ws { flex: 1 1 140px; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
      ".dshqn-usage-session-id { flex: none; width: 72px; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 11px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-usage-session-tokens { flex: none; width: 84px; text-align: right; font-variant-numeric: tabular-nums; }",
      ".dshqn-usage-session-cost { flex: none; width: 84px; text-align: right; color: var(--dsw-alias-label-primary); font-weight: 600; font-variant-numeric: tabular-nums; }",
      ".dshqn-usage-session-time { flex: none; width: 96px; text-align: right; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }",
      ".dshqn-social-deep { display: flex; flex-direction: column; gap: 6px; padding: 10px 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-alias-bg-layer-2); }",
      ".dshqn-social-dim { display: flex; align-items: center; gap: 8px; font-size: 11px; line-height: 16px; }",
      ".dshqn-social-dim-label { flex: 0 0 84px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-social-dim-bar { flex: 1 1 auto; height: 6px; border-radius: 999px; background: var(--dsw-alias-bg-layer-1); overflow: hidden; }",
      ".dshqn-social-dim-fill { display: block; height: 100%; border-radius: 999px; background: var(--dshqn-accent); }",
      ".dshqn-social-dim-score { flex: 0 0 48px; text-align: right; font-variant-numeric: tabular-nums; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-social-suggestions { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }",
      ".dshqn-plan-timeline { display: flex; flex-direction: column; gap: 4px; padding: 10px 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 14px; background: var(--dsw-alias-bg-layer-1); }",
      ".dshqn-timeline-day { display: flex; align-items: flex-start; gap: 10px; padding: 6px 0; border-bottom: 1px solid var(--dsw-alias-border-l1); }",
      ".dshqn-timeline-day:last-child { border-bottom: 0; }",
      ".dshqn-timeline-date { flex: 0 0 64px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }",
      ".dshqn-timeline-events { display: flex; flex-direction: column; gap: 2px; flex: 1 1 auto; min-width: 0; }",
      ".dshqn-timeline-event { appearance: none; display: flex; align-items: center; gap: 6px; padding: 3px 6px; border: 0; border-radius: 6px; background: transparent; color: inherit; font: inherit; font-size: 12px; text-align: left; cursor: pointer; }",
      ".dshqn-timeline-event:hover { background: var(--dsw-alias-bg-layer-2); }",
      ".dshqn-harness-warning { color: var(--dsw-alias-state-warn-primary); }",
      ".dshqn-harness-manifest { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }",
      ".dshqn-harness-manifest .dshqn-settings-hint { flex-basis: 100%; }",
      ".dshqn-harness-staged { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }",
      ".dshqn-harness-staged code { flex-basis: 100%; }",
      ".dshqn-harness .dshqn-actions, .dshqn-harness-actions { justify-content: flex-start; flex-wrap: wrap; }",
      ".dshqn-harness-releases { display: flex; flex-direction: column; gap: 2px; padding: 8px 10px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); }",
      ".dshqn-harness-notes { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; flex-basis: 100%; }",
      ".dshqn-release-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 5px 4px; border-bottom: 1px solid var(--dsw-alias-border-l1); }",
      ".dshqn-release-row:last-child { border-bottom: 0; }",
      ".dshqn-release-version { font-weight: 600; font-variant-numeric: tabular-nums; }",
      ".dshqn-harness-custom { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }",
      ".dshqn-harness-custom .dshqn-field { flex: 1 1 220px; min-width: 0; }",
      ".dshqn-button-link { height: auto; padding: 0; border: 0; background: none; color: var(--dshqn-accent); text-decoration: underline; }",
      ".dshqn-session-save { appearance: none; display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; padding: 0; border: 0; border-radius: 6px; background: transparent; color: inherit; cursor: pointer; }",
      ".dshqn-session-save:hover { background: var(--dsw-alias-bg-layer-2); }",
      ".dshqn-session-save:disabled { opacity: 0.6; cursor: default; }",
      ".dshqn-dock-chip { appearance: none; display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 999px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-secondary); font: inherit; font-size: 12px; line-height: 18px; cursor: pointer; }",
      ".dshqn-dock-chip:hover { border-color: var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }",
      ".dshqn-capture-button { appearance: none; display: inline-flex; align-items: center; gap: 5px; padding: 4px 8px; border: 1px solid transparent; border-radius: 8px; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 12px; line-height: 18px; cursor: pointer; }",
      ".dshqn-capture-button:hover { border-color: var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }",
      ".dshqn-virtual { overflow-y: auto; overscroll-behavior: contain; }",
      ".dshqn-virtual-plain { display: contents; }",
      ".dshqn-voice-wrap { display: inline-flex; align-items: center; gap: 8px; }",
      ".dshqn-voice-button { display: inline-flex; align-items: center; gap: 5px; height: 26px; padding: 0 9px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 12px; cursor: pointer; }",
      ".dshqn-voice-button:hover { border-color: var(--dsw-alias-border-l2); color: var(--dsw-alias-label-primary); }",
      ".dshqn-voice-button:disabled { opacity: 0.6; cursor: default; }",
      ".dshqn-voice-recording { border-color: var(--dshqn-danger); color: var(--dshqn-danger); }",
      ".dshqn-voice-notice { font-size: 12px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-attachments { display: flex; flex-direction: column; gap: 8px; padding: 10px 18px 14px; border-top: 1px solid var(--dsw-alias-border-l1); }",
      ".dshqn-attachments-head { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }",
      ".dshqn-attach-add { cursor: pointer; }",
      ".dshqn-hidden-input { display: none; }",
      ".dshqn-attach-grid { display: flex; flex-wrap: wrap; gap: 8px; }",
      ".dshqn-attach-image { position: relative; margin: 0; width: 108px; height: 84px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; overflow: hidden; background: var(--dsw-alias-bg-layer-2); }",
      ".dshqn-attach-image img { width: 100%; height: 100%; object-fit: cover; display: block; }",
      ".dshqn-attach-remove { appearance: none; position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; padding: 0; border: 0; border-radius: 50%; background: color-mix(in srgb, var(--dsw-alias-bg-base) 75%, transparent); color: var(--dsw-alias-label-primary); font: inherit; font-size: 14px; line-height: 20px; text-align: center; cursor: pointer; }",
      ".dshqn-attach-list { display: flex; flex-direction: column; gap: 4px; }",
      ".dshqn-attach-file { display: flex; align-items: center; gap: 8px; font-size: 12px; line-height: 18px; }",
      ".dshqn-attach-file a { color: var(--dshqn-accent); text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 60%; }",
      ".dshqn-attach-file .dshqn-attach-remove { position: static; width: 18px; height: 18px; background: transparent; }",
      ".dshqn-harness-approval { display: flex; flex-direction: column; gap: 6px; padding: 10px 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-alias-bg-layer-2); }",
      ".dshqn-manifest-template { margin: 0; padding: 10px 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); font: 11px/16px ui-monospace, SFMono-Regular, Consolas, monospace; white-space: pre-wrap; word-break: break-all; max-height: 220px; overflow: auto; }",
      ".dshqn-update-badge { border-color: color-mix(in srgb, var(--dshqn-accent) 45%, var(--dsw-alias-border-l1)); color: var(--dshqn-accent); }",
      "@media (max-width: 720px) {",
      "  .dshqn-calendar-day { min-height: 62px; padding: 4px 5px; }",
      "  .dshqn-calendar-chip { display: none; }",
      "}",
      ".dshqn-palette-empty { margin: 0; padding: 18px; text-align: center; font-size: 13px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-checklist { display: flex; flex-direction: column; gap: 6px; padding: 10px 18px; border-top: 1px solid var(--dsw-alias-border-l1); }",
      ".dshqn-checklist-title { margin: 0; font-size: 12px; line-height: 18px; font-weight: 600; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-checklist-row { display: flex; align-items: center; gap: 8px; padding: 4px 6px; border-radius: 8px; }",
      ".dshqn-checklist-row:hover { background: var(--dsw-alias-bg-layer-2); }",
      ".dshqn-checklist-done .dshqn-checklist-text { text-decoration: line-through; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-checklist-text { flex: 1 1 auto; min-width: 0; font-size: 13px; line-height: 20px; }",
      ".dshqn-checklist-add { display: flex; align-items: center; gap: 8px; }",
      ".dshqn-checklist-add .dshqn-field { flex: 1 1 auto; }",
      ".dshqn-range-group { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 6px; }",
      ".dshqn-range-label { font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-secondary); }",
      ".dshqn-range-input { flex: none; width: 64px; min-width: 0; }",
      ".dshqn-detail-row-abnormal { color: var(--dsw-alias-state-warn-primary); }",
      ".dshqn-review-keys { margin: 0; font-size: 11px; line-height: 17px; color: var(--dsw-alias-label-secondary); text-align: center; }",
      ".dshqn-focus .dshqn-header, .dshqn-focus .dshqn-toolbar, .dshqn-focus .dshqn-filters, .dshqn-focus .dshqn-actions { display: none; }",
      ".dshqn-focus .dshqn-workspace { max-width: 760px; width: 100%; margin: 0 auto; min-height: 70vh; justify-content: center; }",
      ".dshqn-focus .dshqn-review-card { min-height: 320px; }",
      ".dshqn-backup-list { display: flex; flex-direction: column; gap: 2px; }",
      ".dshqn-backup-row { display: flex; align-items: center; gap: 10px; padding: 6px 4px; border-bottom: 1px solid var(--dsw-alias-border-l1); }",
      ".dshqn-backup-row:last-child { border-bottom: 0; }",
      ".dshqn-backup-name { flex: 1 1 auto; min-width: 0; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
      "@keyframes dshqn-palette-in {",
      "  from { opacity: 0; transform: translateY(-6px) scale(0.99); }",
      "  to { opacity: 1; transform: none; }",
      "}",
      "@keyframes dshqn-drop-in {",
      "  0% { transform: scale(0.97); }",
      "  100% { transform: scale(1); }",
      "}"
    ].join('\n');

    /**
     * Harness version manager: version info, update feed, check/download/install/restart.
     * Install and restart are gated by the persisted auto-update switch plus a two-step confirm.
     */
    function HarnessVersionManager({ t }) {
      const [info, setInfo] = React.useState(null);
      const [check, setCheck] = React.useState(null);
      const [busy, setBusy] = React.useState(false);
      const [notice, setNotice] = React.useState('');
      const [feedDraft, setFeedDraft] = React.useState('');
      const [confirm, setConfirm] = React.useState('');
      const [approveInstall, setApproveInstall] = React.useState(false);
      const [showTemplate, setShowTemplate] = React.useState(false);
      const [showAllNotes, setShowAllNotes] = React.useState(false);
      const [releases, setReleases] = React.useState([]);
      const [showReleases, setShowReleases] = React.useState(false);
      const [customUrl, setCustomUrl] = React.useState('');
      const [customSha, setCustomSha] = React.useState('');
      const [loaded, setLoaded] = React.useState(false);
      const busyRef = React.useRef(false);

      const refresh = () => {
        readProtected(HARNESS_URL)
          .then((payload) => {
            setInfo(payload);
            setFeedDraft(payload.feedUrl || '');
            setLoaded(true);
          })
          .catch(() => setLoaded(true));
      };

      React.useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      const run = (action, body, onDone, failText) => {
        if (busyRef.current) return;
        busyRef.current = true;
        setBusy(true);
        setNotice(t('harnessWorking'));
        postProtected(HARNESS_URL, { action, ...(body || {}) })
          .then((payload) => {
            busyRef.current = false;
            setBusy(false);
            if (typeof onDone === 'function') onDone(payload);
          })
          .catch((error) => {
            busyRef.current = false;
            setBusy(false);
            setNotice(failText + (error && typeof error.message === 'string' && error.message.length > 0 ? ' · ' + error.message : ''));
          });
      };

      const saveFeed = () => {
        run('save-settings', {
          feedUrl: feedDraft,
          autoUpdate: info !== null && info.autoUpdate === true,
          autoCheck: info !== null && info.autoCheck === true,
        }, (payload) => {
          setInfo((current) => ({ ...(current || {}), feedUrl: payload.feedUrl, autoUpdate: payload.autoUpdate, autoCheck: payload.autoCheck }));
          setNotice(t('settingsSaved'));
        }, t('backupFailed'));
      };

      const toggleAuto = () => {
        const next = !(info !== null && info.autoUpdate === true);
        run('save-settings', { feedUrl: feedDraft, autoUpdate: next, autoCheck: info !== null && info.autoCheck === true }, (payload) => {
          setInfo((current) => ({ ...(current || {}), feedUrl: payload.feedUrl, autoUpdate: payload.autoUpdate, autoCheck: payload.autoCheck }));
        }, t('backupFailed'));
      };

      const toggleAutoCheck = () => {
        const next = !(info !== null && info.autoCheck === true);
        run('save-settings', {
          feedUrl: feedDraft,
          autoUpdate: info !== null && info.autoUpdate === true,
          autoCheck: next,
        }, (payload) => {
          setInfo((current) => ({ ...(current || {}), feedUrl: payload.feedUrl, autoUpdate: payload.autoUpdate, autoCheck: payload.autoCheck }));
          setNotice(t(next ? 'harnessAutoCheckHint' : 'settingsSaved'));
        }, t('backupFailed'));
      };

      const fillOfficialTemplate = () => {
        setFeedDraft(OFFICIAL_FEED_TEMPLATE);
        setNotice(t('harnessTemplateFilled'));
      };

      const useOfficialFeed = () => {
        setFeedDraft(OFFICIAL_GITHUB_FEED);
        run('save-settings', {
          feedUrl: OFFICIAL_GITHUB_FEED,
          autoUpdate: info !== null && info.autoUpdate === true,
          autoCheck: info !== null && info.autoCheck === true,
        }, (payload) => {
          setInfo((current) => ({ ...(current || {}), feedUrl: payload.feedUrl, autoUpdate: payload.autoUpdate, autoCheck: payload.autoCheck }));
          setNotice(t('harnessOfficialFilled'));
        }, t('backupFailed'));
      };

      const copyManifest = () => {
        setNotice(t('harnessCopied'));
        try {
          if (window.navigator && window.navigator.clipboard && typeof window.navigator.clipboard.writeText === 'function') {
            window.navigator.clipboard.writeText(UPDATE_MANIFEST_TEMPLATE);
          }
        } catch (error) {
          // clipboard is optional
        }
      };

      const checkUpdates = () => {
        if (feedDraft.trim().length === 0) {
          setNotice(t('harnessNoFeed'));
          return;
        }
        run('check', {}, (payload) => {
          setCheck(payload);
          setNotice(
            payload.updateAvailable
              ? payload.manifest.version !== null
                ? fillTemplate(t('harnessUpdateAvailable'), { version: payload.manifest.version })
                : t('harnessOfficialBuild')
              : t('harnessUpToDate'),
          );
        }, t('harnessCheckFailed'));
      };

      const downloadUpdate = () => {
        if (check !== null && check.manifest && check.manifest.downloadAvailable === false) {
          setNotice(t('harnessNoAsset'));
          return;
        }
        run('download', {}, (payload) => {
          setInfo((current) => ({ ...(current || {}), staged: payload.staged }));
          setApproveInstall(false);
          setNotice(t('harnessDownloaded'));
        }, t('harnessDownloadFailed'));
      };

      const checkAndDownload = () => {
        if (feedDraft.trim().length === 0) {
          setNotice(t('harnessNoFeed'));
          return;
        }
        run('save-settings', {
          feedUrl: feedDraft,
          autoUpdate: info !== null && info.autoUpdate === true,
          autoCheck: info !== null && info.autoCheck === true,
        }, () => {
          run('check', {}, (payload) => {
            setCheck(payload);
            if (!payload.updateAvailable) {
              setNotice(t('harnessUpToDate'));
              return;
            }
            if (payload.manifest.downloadAvailable === false) {
              setNotice(t('harnessNoAsset'));
              return;
            }
            run('download', {}, (downloaded) => {
              setInfo((current) => ({ ...(current || {}), staged: downloaded.staged }));
              setApproveInstall(false);
              setNotice(fillTemplate(t('harnessAutoDownloaded'), { version: payload.manifest.version }));
            }, t('harnessDownloadFailed'));
          }, t('harnessCheckFailed'));
        }, t('backupFailed'));
      };

      const fetchOfficialInstaller = () => {
        setFeedDraft(OFFICIAL_DIRECT_FEED);
        run('save-settings', {
          feedUrl: OFFICIAL_DIRECT_FEED,
          autoUpdate: info !== null && info.autoUpdate === true,
          autoCheck: info !== null && info.autoCheck === true,
        }, () => {
          run('check', {}, (payload) => {
            setCheck(payload);
            run('download', {}, (downloaded) => {
              setInfo((current) => ({ ...(current || {}), staged: downloaded.staged }));
              setApproveInstall(false);
              setNotice(
                payload.updateAvailable
                  ? fillTemplate(t('harnessDirectDownloaded'), { size: formatBytes(downloaded.staged.size) })
                  : payload.manifest.publishedAt !== null
                    ? fillTemplate(t('harnessDirectDownloadedOld'), {
                        size: formatBytes(downloaded.staged.size),
                        time: formatStamp(Date.parse(payload.manifest.publishedAt)),
                      })
                    : fillTemplate(t('harnessDirectDownloaded'), { size: formatBytes(downloaded.staged.size) }),
              );
            }, t('harnessDownloadFailed'));
          }, t('harnessCheckFailed'));
        }, t('backupFailed'));
      };

      const loadReleases = () => {
        run('releases', {}, (payload) => {
          setReleases(Array.isArray(payload.releases) ? payload.releases : []);
          setShowReleases(true);
        }, t('harnessCheckFailed'));
      };

      const downloadRelease = (release) => {
        if (release.downloadAvailable !== true) {
          setNotice(t('harnessNoAsset'));
          return;
        }
        run('download', { version: release.version }, (downloaded) => {
          setInfo((current) => ({ ...(current || {}), staged: downloaded.staged }));
          setApproveInstall(false);
          setNotice(fillTemplate(t('harnessAutoDownloaded'), { version: release.version }));
        }, t('harnessDownloadFailed'));
      };

      const downloadCustom = () => {
        const url = customUrl.trim();
        if (!/^https:\/\//.test(url)) {
          setNotice(t('customInstaller'));
          return;
        }
        const sha256 = customSha.trim();
        const body = { url, ...(/^[0-9a-fA-F]{64}$/.test(sha256) ? { sha256 } : {}) };
        run('download-direct', body, (downloaded) => {
          setInfo((current) => ({ ...(current || {}), staged: downloaded.staged }));
          setApproveInstall(false);
          setNotice(fillTemplate(t('customDownloaded'), { size: formatBytes(downloaded.staged.size) }));
        }, t('harnessDownloadFailed'));
      };

      const approveAndInstall = () => {
        const staged = info !== null && info.staged ? info.staged : null;
        if (staged === null || approveInstall !== true) return;
        const trusted = staged.official === true || staged.source === 'custom';
        if (staged.verified !== true && !trusted) {
          setNotice(t('harnessApproveNeedVerified'));
          return;
        }
        setApproveInstall(false);
        run(
          'install',
          { confirm: staged.version, approved: true, ...(trusted ? { acknowledgedHash: staged.sha256 } : {}) },
          () => setNotice(t('harnessApproveSuccess')),
          t('backupFailed'),
        );
      };

      const installUpdate = () => {
        const staged = info !== null && info.staged ? info.staged : null;
        if (staged === null) return;
        if (confirm !== 'install-' + staged.version) {
          setConfirm('install-' + staged.version);
          return;
        }
        setConfirm('');
        run('install', { confirm: staged.version }, () => setNotice(t('harnessInstallStarted')), t('backupFailed'));
      };

      const restartHarness = () => {
        if (confirm !== 'restart') {
          setConfirm('restart');
          return;
        }
        setConfirm('');
        run('restart', { confirm: 'restart' }, () => setNotice(t('harnessRestarting')), t('backupFailed'));
      };

      const openFolder = () => {
        run('open', {}, () => setNotice(t('harnessOpened')), t('backupFailed'));
      };

      const current = info !== null && info.current ? info.current : null;
      const staged = info !== null && info.staged ? info.staged : null;
      const stagedOfficial = staged !== null && staged.official === true;
      const stagedCustom = staged !== null && staged.source === 'custom';
      const autoUpdate = info !== null && info.autoUpdate === true;
      const autoCheck = info !== null && info.autoCheck === true;
      const latest = check !== null && check.manifest ? check.manifest : null;
      const currentVersion = current !== null && typeof current.version === 'string' ? current.version : null;
      const noteText = latest !== null && typeof latest.notes === 'string' && latest.notes.length > 0 ? latest.notes : '';

      return h(
        'section',
        { className: 'dshqn-settings-group dshqn-harness' },
        h(SectionHead, {
          title: t('harnessTitle'),
          hint: loaded && current !== null
            ? t('harnessCurrent') + ': ' + (currentVersion === null ? t('harnessUnknown') : currentVersion)
            : t('harnessFetching'),
        }),
        h(
          'div',
          { className: 'dshqn-brief' },
          h('span', { className: 'dshqn-stat' }, t('harnessCurrent') + ' ' + (currentVersion === null ? t('harnessUnknown') : currentVersion)),
          current !== null && current.electron ? h('span', { className: 'dshqn-stat' }, t('harnessElectron') + ' ' + current.electron) : null,
          current !== null && current.node ? h('span', { className: 'dshqn-stat' }, t('harnessNode') + ' ' + current.node) : null,
          latest !== null
            ? h('span', { className: 'dshqn-stat' }, t('harnessLatest') + ' ' + latest.version)
            : null,
        ),
        current !== null && current.execPath
          ? h('p', { className: 'dshqn-settings-mono' }, t('harnessExecPath') + ': ' + current.execPath)
          : null,
        h(
          'div',
          { className: 'dshqn-settings-row' },
          h('span', { className: 'dshqn-settings-label' }, t('harnessFeedLabel')),
          h('input', {
            className: 'dshqn-field',
            type: 'url',
            value: feedDraft,
            placeholder: 'https://example.com/harness/latest.json',
            'aria-label': t('harnessFeedLabel'),
            onChange: (event) => setFeedDraft(event.target.value),
          }),
          h('button', { type: 'button', className: 'dshqn-button', onClick: saveFeed, disabled: busy }, t('harnessSaveFeed')),
        ),
        h('p', { className: 'dshqn-settings-hint' }, t('harnessFeedHint')),
        /example\.com/i.test(feedDraft)
          ? h('p', { className: 'dshqn-settings-hint dshqn-harness-warning' }, t('harnessFeedTemplateWarning'))
          : null,
        h(
          'div',
          { className: 'dshqn-settings-row' },
          h('input', { type: 'checkbox', checked: autoUpdate, onChange: toggleAuto, disabled: busy }),
          h('span', { className: 'dshqn-settings-label' }, t('harnessAutoLabel')),
        ),
        h('p', { className: 'dshqn-settings-hint dshqn-harness-warning' }, t('harnessAutoHint')),
        h(
          'div',
          { className: 'dshqn-settings-row' },
          h('input', { type: 'checkbox', checked: autoCheck, onChange: toggleAutoCheck, disabled: busy }),
          h('span', { className: 'dshqn-settings-label' }, t('harnessAutoCheckLabel')),
        ),
        h('p', { className: 'dshqn-settings-hint' }, t('harnessAutoCheckHint')),
        h(
          'div',
          { className: 'dshqn-actions dshqn-harness-actions' },
          h(
            'button',
            { type: 'button', className: 'dshqn-button dshqn-button-primary', onClick: useOfficialFeed, disabled: busy },
            t('harnessUseOfficial'),
          ),
          h('button', { type: 'button', className: 'dshqn-button', onClick: fillOfficialTemplate, disabled: busy }, t('harnessOfficialTemplate')),
          h('button', { type: 'button', className: 'dshqn-button', onClick: copyManifest, disabled: busy }, t('harnessCopyManifest')),
          h(
            'button',
            { type: 'button', className: 'dshqn-button', onClick: () => setShowTemplate(!showTemplate), disabled: busy },
            showTemplate ? t('harnessHideTemplate') : t('harnessShowTemplate'),
          ),
        ),
        showTemplate ? h('pre', { className: 'dshqn-manifest-template' }, UPDATE_MANIFEST_TEMPLATE) : null,
        h(
          'div',
          { className: 'dshqn-actions dshqn-harness-actions' },
          h(
            'button',
            { type: 'button', className: 'dshqn-button', onClick: checkAndDownload, disabled: busy },
            t('harnessCheckAndDownload'),
          ),
          h('button', { type: 'button', className: 'dshqn-button', onClick: checkUpdates, disabled: busy }, t('harnessCheck')),
          h('button', { type: 'button', className: 'dshqn-button', onClick: downloadUpdate, disabled: busy || feedDraft.trim().length === 0 }, t('harnessDownload')),
          h('button', { type: 'button', className: 'dshqn-button', onClick: openFolder, disabled: busy }, t('harnessOpenFolder')),
        ),
        h('p', { className: 'dshqn-settings-label' }, t('versionChannels')),
        h(
          'div',
          { className: 'dshqn-actions dshqn-harness-actions' },
          h(
            'button',
            { type: 'button', className: 'dshqn-button dshqn-button-primary', onClick: fetchOfficialInstaller, disabled: busy },
            t('harnessDirectButton'),
          ),
          h('button', { type: 'button', className: 'dshqn-button', onClick: loadReleases, disabled: busy }, t('otherVersions')),
        ),
        showReleases
          ? h(
              'div',
              { className: 'dshqn-harness-releases' },
              releases.length === 0
                ? h('p', { className: 'dshqn-settings-hint' }, t('releaseListEmpty'))
                : releases.map((release) =>
                    h(
                      'div',
                      { key: release.version, className: 'dshqn-release-row' },
                      h('span', { className: 'dshqn-release-version' }, release.version),
                      release.prerelease ? h('span', { className: 'dshqn-badge dshqn-badge-warn' }, t('releasePrerelease')) : null,
                      release.publishedAt === null
                        ? null
                        : h('span', { className: 'dshqn-settings-hint' }, formatStamp(Date.parse(release.publishedAt))),
                      release.downloadAvailable === true
                        ? h(
                            'button',
                            { type: 'button', className: 'dshqn-button', onClick: () => downloadRelease(release), disabled: busy },
                            t('releaseDownload'),
                          )
                        : h('span', { className: 'dshqn-settings-hint dshqn-harness-warning' }, t('releaseNoAssetShort')),
                      release.releaseUrl.length > 0
                        ? h(
                            'a',
                            { className: 'dshqn-button', href: release.releaseUrl, target: '_blank', rel: 'noreferrer' },
                            t('harnessReleasePage'),
                          )
                        : null,
                    ),
                  ),
            )
          : null,
        h('p', { className: 'dshqn-settings-label' }, t('customInstaller')),
        h(
          'div',
          { className: 'dshqn-harness-custom' },
          h('input', {
            className: 'dshqn-field',
            type: 'url',
            value: customUrl,
            placeholder: 'https://…/DeepSeek-Harness-Setup.exe',
            'aria-label': t('customInstaller'),
            onChange: (event) => setCustomUrl(event.target.value),
          }),
          h('input', {
            className: 'dshqn-field',
            type: 'text',
            value: customSha,
            placeholder: t('customShaPlaceholder'),
            'aria-label': t('customShaPlaceholder'),
            onChange: (event) => setCustomSha(event.target.value),
          }),
          h(
            'button',
            { type: 'button', className: 'dshqn-button', onClick: downloadCustom, disabled: busy || customUrl.trim().length === 0 },
            t('customDownload'),
          ),
        ),
        latest !== null
          ? h(
              'div',
              { className: 'dshqn-harness-manifest' },
              h(
                'span',
                { className: 'dshqn-badge ' + (check.updateAvailable ? 'dshqn-badge-warn' : 'dshqn-badge-success') },
                latest.version !== null
                  ? check.updateAvailable
                    ? fillTemplate(t('harnessUpdateAvailable'), { version: latest.version })
                    : t('harnessUpToDate')
                  : t('harnessOfficialBuild') + (latest.publishedAt !== null ? ' · ' + formatStamp(Date.parse(latest.publishedAt)) : ''),
              ),
              latest.source === 'github'
                ? h('span', { className: 'dshqn-badge' }, t('harnessOfficialSource'))
                : latest.source === 'official-direct'
                  ? h('span', { className: 'dshqn-badge' }, t('harnessDirectSource'))
                  : null,
              noteText.length > 0
                ? h(
                    'div',
                    { className: 'dshqn-harness-notes' },
                    h('p', { className: 'dshqn-settings-hint' }, t('harnessNotes') + ': ' + summarizeNotes(noteText, showAllNotes ? 6000 : 420)),
                    noteText.length > 420
                      ? h(
                          'button',
                          {
                            type: 'button',
                            className: 'dshqn-button dshqn-button-link',
                            onClick: () => setShowAllNotes(!showAllNotes),
                          },
                          showAllNotes ? t('harnessNotesCollapse') : t('harnessNotesExpand'),
                        )
                      : null,
                  )
                : null,
              latest.source === 'official-direct' && latest.buildNewer === false && latest.publishedAt !== null
                ? h(
                    'p',
                    { className: 'dshqn-settings-hint dshqn-harness-warning' },
                    fillTemplate(t('harnessOfficialBuildOlder'), { time: formatStamp(Date.parse(latest.publishedAt)) }),
                  )
                : null,
              latest.releaseUrl.length > 0
                ? h(
                    'a',
                    { className: 'dshqn-button', href: latest.releaseUrl, target: '_blank', rel: 'noreferrer' },
                    t('harnessReleasePage'),
                  )
                : null,
              latest.downloadAvailable === false
                ? h(
                    'div',
                    { className: 'dshqn-actions dshqn-harness-actions' },
                    h('span', { className: 'dshqn-settings-hint dshqn-harness-warning' }, t('harnessNoAsset')),
                    h(
                      'button',
                      { type: 'button', className: 'dshqn-button dshqn-button-primary', onClick: fetchOfficialInstaller, disabled: busy },
                      t('harnessDirectButton'),
                    ),
                    h(
                      'a',
                      { className: 'dshqn-button', href: OFFICIAL_DOWNLOAD_PAGE, target: '_blank', rel: 'noreferrer' },
                      t('harnessOfficialDownload'),
                    ),
                  )
                : null,
            )
          : null,
        h(
          'div',
          { className: 'dshqn-harness-staged' },
          h(
            'span',
            { className: 'dshqn-settings-hint' },
            staged === null
              ? t('harnessNoStaged')
              : stagedOfficial
                ? t('harnessOfficialBuild') + ' · ' + formatBytes(staged.size)
                : stagedCustom
                  ? t('customSource') + ' · ' + formatBytes(staged.size)
                  : fillTemplate(t('harnessStaged'), { version: staged.version }) + ' · ' + formatBytes(staged.size),
          ),
          staged !== null && stagedOfficial ? h('span', { className: 'dshqn-badge' }, t('harnessDirectSource')) : null,
          staged !== null && stagedCustom ? h('span', { className: 'dshqn-badge' }, t('customSource')) : null,
          staged !== null
            ? h(
                'span',
                { className: 'dshqn-badge ' + (staged.verified ? 'dshqn-badge-success' : 'dshqn-badge-warn') },
                staged.verified ? t('harnessVerified') : t('harnessUnverified'),
              )
            : null,
          staged !== null ? h('code', { className: 'dshqn-settings-mono' }, staged.path) : null,
          staged !== null ? h('code', { className: 'dshqn-settings-mono' }, t('harnessHash') + ': ' + staged.sha256) : null,
        ),
        staged !== null
          ? h(
              'div',
              { className: 'dshqn-harness-approval' },
              h(
                'label',
                { className: 'dshqn-settings-row' },
                h('input', {
                  type: 'checkbox',
                  className: 'dshqn-harness-approve-check',
                  checked: approveInstall,
                  onChange: () => setApproveInstall(!approveInstall),
                  disabled: busy,
                }),
                h(
                  'span',
                  { className: 'dshqn-settings-label' },
                  stagedOfficial ? t('harnessApproveOfficialLabel') : stagedCustom ? t('customApproveLabel') : t('harnessApproveLabel'),
                ),
              ),
              staged.verified !== true && !stagedOfficial && !stagedCustom
                ? h('p', { className: 'dshqn-settings-hint dshqn-harness-warning' }, t('harnessApproveNeedVerified'))
                : null,
              h(
                'div',
                { className: 'dshqn-actions' },
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dshqn-button dshqn-button-primary',
                    onClick: approveAndInstall,
                    disabled: busy || approveInstall !== true || (staged.verified !== true && !stagedOfficial && !stagedCustom),
                  },
                  t('harnessApproveInstall'),
                ),
              ),
            )
          : null,
        h(
          'div',
          { className: 'dshqn-actions' },
          h(
            'button',
            {
              type: 'button',
              className: confirm === 'install-' + (staged === null ? '' : staged.version) ? 'dshqn-button dshqn-button-danger' : 'dshqn-button',
              onClick: installUpdate,
              disabled: busy || staged === null || !autoUpdate,
            },
            confirm === 'install-' + (staged === null ? '' : staged.version) && staged !== null
              ? fillTemplate(t('harnessInstallConfirm'), { version: staged.version })
              : t('harnessInstall'),
          ),
          h(
            'button',
            {
              type: 'button',
              className: confirm === 'restart' ? 'dshqn-button dshqn-button-danger' : 'dshqn-button',
              onClick: restartHarness,
              disabled: busy || !autoUpdate,
            },
            confirm === 'restart' ? t('harnessRestartConfirm') : t('harnessRestart'),
          ),
        ),
        notice.length > 0 ? h('p', { className: 'dshqn-status-note', role: 'status' }, notice) : null,
      );
    }

    /** The workbench: one list of notes and tasks, synced with the Host half. */
    function WorkbenchPanel(props) {
      const t = translateSeat(props.t);
      const goBack = typeof props.selectPanel === 'function' ? () => props.selectPanel(null) : undefined;
      const prefs = React.useSyncExternalStore(props.prefs.subscribe, props.prefs.getSnapshot);
      const taskLayout = prefs.taskLayout === 'board' ? 'board' : prefs.taskLayout === 'calendar' ? 'calendar' : 'list';
      const groupBy = prefs.groupBy === 'priority' || prefs.groupBy === 'tags' ? prefs.groupBy : 'none';
      const healthMode = prefs.healthMode === 'med' ? 'med' : 'metric';
      const insightTab = prefs.insightTab === 'usage' || prefs.insightTab === 'system' || prefs.insightTab === 'optimizer' || prefs.insightTab === 'schedule' ? prefs.insightTab : 'value';
      const setInsightTab = (value) => props.prefs.set({ ...prefs, insightTab: value });
      const setTaskLayout = (value) => props.prefs.set({ ...prefs, taskLayout: value });
      const setGroupBy = (value) => props.prefs.set({ ...prefs, groupBy: value });
      const setHealthMode = (value) => props.prefs.set({ ...prefs, healthMode: value });
      const [items, setItems] = React.useState([]);
      const [status, setStatus] = React.useState('loading');
      const [settings, setSettings] = React.useState(DEFAULT_SETTINGS);
      const settingsRef = React.useRef(DEFAULT_SETTINGS);
      const reviewsRef = React.useRef([]);
      const [types, setTypes] = React.useState([]);
      const typesRef = React.useRef([]);
      const deletedIdsRef = React.useRef(new Set());
      const tombstonesRef = React.useRef(new Map());
      const [recordTypeId, setRecordTypeId] = React.useState(null);
      const [selectedRecordId, setSelectedRecordId] = React.useState(null);
      const [editingType, setEditingType] = React.useState(null);
      const [typeDeleteConfirm, setTypeDeleteConfirm] = React.useState(false);
      const [admin, setAdmin] = React.useState(null);
      const [adminState, setAdminState] = React.useState('idle');
      const [usage, setUsage] = React.useState(null);
      const [usageState, setUsageState] = React.useState('idle');
      const [value, setValue] = React.useState(null);
      const [valueState, setValueState] = React.useState('idle');
      const [valueDrafts, setValueDrafts] = React.useState({});
      const [valueSort, setValueSort] = React.useState('value');
      const [valueChartMetric, setValueChartMetric] = React.useState('value');
      const [valueChartRange, setValueChartRange] = React.useState('30');
      const [valueHover, setValueHover] = React.useState(null);
      const [valueHistoryClearKey, setValueHistoryClearKey] = React.useState(null);
      const [valueHistoryConfirm, setValueHistoryConfirm] = React.useState(false);
      const [draggingId, setDraggingId] = React.useState(null);
      const [dragOverColumn, setDragOverColumn] = React.useState(null);
      const [storagePath, setStoragePath] = React.useState('');
      const [selectedId, setSelectedId] = React.useState(null);
      const [query, setQuery] = React.useState('');
      const [view, setView] = React.useState('overview');
      const [harnessUpdateBanner, setHarnessUpdateBanner] = React.useState(() => {
        const snapshot = props.prefs && typeof props.prefs.getSnapshot === 'function' ? props.prefs.getSnapshot() : null;
        return snapshot && typeof snapshot.harnessLatestVersion === 'string' ? snapshot.harnessLatestVersion : '';
      });
      const [calendarMonth, setCalendarMonth] = React.useState(() => {
        const date = new Date();
        date.setDate(1);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      });
      const [calendarSelected, setCalendarSelected] = React.useState(() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      });
      const [calendarMeds, setCalendarMeds] = React.useState(true);
      const [taskFilter, setTaskFilter] = React.useState('all');
      const [reviewing, setReviewing] = React.useState(false);
      const [reviewMode, setReviewMode] = React.useState('due');
      const [focusMode, setFocusMode] = React.useState(false);
      const [reviewQueue, setReviewQueue] = React.useState([]);
      const [reviewIndex, setReviewIndex] = React.useState(0);
      const [showAnswer, setShowAnswer] = React.useState(false);
      const [metricDetail, setMetricDetail] = React.useState(null);
      const [dropTargetId, setDropTargetId] = React.useState(null);
      const [detailValue, setDetailValue] = React.useState('');
      const [detailValue2, setDetailValue2] = React.useState('');
      const [pendingDeleteId, setPendingDeleteId] = React.useState(null);
      const [detailEdit, setDetailEdit] = React.useState(null);
      const [compareMode, setCompareMode] = React.useState(false);
      const [compareSelected, setCompareSelected] = React.useState([]);
      const [allKind, setAllKind] = React.useState('all');
      const [allSort, setAllSort] = React.useState('updated');
      const [allPage, setAllPage] = React.useState(1);
      const [batchIds, setBatchIds] = React.useState([]);
      const [batchConfirm, setBatchConfirm] = React.useState(false);
      const batchTimer = React.useRef(null);
      const [confirming, setConfirming] = React.useState(false);
      const [tagsDraft, setTagsDraft] = React.useState('');
      const [checklistDraft, setChecklistDraft] = React.useState('');
      const [timesDraft, setTimesDraft] = React.useState('');
      const [notice, setNotice] = React.useState('');
      const [paletteOpen, setPaletteOpen] = React.useState(false);
      const [shortcutsOpen, setShortcutsOpen] = React.useState(false);
      const [paletteQuery, setPaletteQuery] = React.useState('');
      const [paletteIndex, setPaletteIndex] = React.useState(0);
      const [lastRating, setLastRating] = React.useState(null);
      const itemsRef = React.useRef([]);
      const revisionRef = React.useRef(0);
      const watermarkRef = React.useRef(0);
      const savedSignaturesRef = React.useRef(new Map());
      const dirtyRef = React.useRef(false);
      const saveTimer = React.useRef(0);
      const confirmTimer = React.useRef(0);
      const noticeTimer = React.useRef(0);
      const fileInput = React.useRef(null);
      const [uploadingAttachments, setUploadingAttachments] = React.useState(false);
      const [, setAttachmentNonce] = React.useState(0);

      const resetConfirmation = () => {
        if (confirmTimer.current) window.clearTimeout(confirmTimer.current);
        confirmTimer.current = 0;
        setConfirming(false);
      };

      const flashNotice = (text) => {
        setNotice(text);
        if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
        noticeTimer.current = window.setTimeout(() => setNotice(''), 2600);
      };

      /** Snapshot map used by the PATCH write diff (id -> content signature). */
      const signatureMapOf = (visible, tombstones) => {
        const map = new Map();
        for (const item of [...visible, ...tombstones.values()]) map.set(item.id, itemSignature(item));
        return map;
      };

      const flush = (dirty, revision, setSyncStatus) => {
        if (!dirty.current) return;
        const snapshot = itemsRef.current;
        const tombstones = [...tombstonesRef.current.values()];
        const all = mirrorItems(snapshot, tombstones);
        const upserts = all.filter((item) => savedSignaturesRef.current.get(item.id) !== itemSignature(item));
        dirty.current = false;
        const finish = (document) => {
          revision.current = document.revision;
          deletedIdsRef.current = new Set();
          const split = splitDocumentItems(document.items);
          if (!dirty.current) {
            itemsRef.current = split.items;
            tombstonesRef.current = split.tombstones;
            setItems(split.items);
            settingsRef.current = document.settings;
            setSettings(document.settings);
            reviewsRef.current = document.reviews;
            typesRef.current = document.types;
            setTypes(document.types);
          }
          // The server document is the baseline; pending local edits diff again later.
          savedSignaturesRef.current = signatureMapOf(split.items, split.tombstones);
          writeMirror(mirrorItems(itemsRef.current, tombstonesRef.current), document.revision);
          setSyncStatus('synced');
        };
        const fallback = () =>
          putState(snapshot, settingsRef.current, reviewsRef.current, typesRef.current, {
            revision: revisionRef.current,
            tombstones,
          }).then(finish);
        if (upserts.length === 0) {
          writeMirror(mirrorItems(snapshot, tombstones), revisionRef.current);
          setSyncStatus('synced');
          return;
        }
        if (writeMode === 'full') {
          fallback().catch(() => {
            dirty.current = true;
            setSyncStatus('offline');
          });
          return;
        }
        patchState(upserts, revisionRef.current)
          .then((result) => (result.conflict === true ? fallback() : finish(result.document)))
          .catch(() => {
            dirty.current = true;
            setSyncStatus('offline');
          });
      };

      /** Mark the document dirty and schedule one debounced flush. */
      const scheduleSave = () => {
        dirtyRef.current = true;
        setStatus('saving');
        if (saveTimer.current) window.clearTimeout(saveTimer.current);
        saveTimer.current = window.setTimeout(() => {
          saveTimer.current = 0;
          flush(dirtyRef, revisionRef, setStatus);
        }, 450);
      };

      const applyItems = (next) => {
        itemsRef.current = next;
        setItems(next);
        writeMirror(mirrorItems(next, tombstonesRef.current), revisionRef.current);
        scheduleSave();
      };

      const removeItems = (predicate) => {
        const removed = itemsRef.current.filter(predicate);
        if (removed.length === 0) return;
        const deletedAt = Date.now();
        for (const item of removed) {
          tombstonesRef.current.set(item.id, {
            ...item,
            deletedAt,
            updatedAt: deletedAt,
            rev: (typeof item.rev === 'number' ? item.rev : 0) + 1,
          });
        }
        applyItems(itemsRef.current.filter((item) => !predicate(item)));
      };

      const adoptDocument = (document) => {
        revisionRef.current = document.revision;
        let nextWatermark = typeof document.watermark === 'number' ? document.watermark : 0;
        for (const item of Array.isArray(document.items) ? document.items : []) {
          nextWatermark = Math.max(nextWatermark, item.updatedAt || 0, item.deletedAt || 0);
        }
        for (const review of Array.isArray(document.reviews) ? document.reviews : []) {
          nextWatermark = Math.max(nextWatermark, review.at || 0);
        }
        watermarkRef.current = Math.max(watermarkRef.current, nextWatermark);
        const split = splitDocumentItems(document.items);
        itemsRef.current = split.items;
        tombstonesRef.current = split.tombstones;
        setItems(split.items);
        const nextSettings = normalizeSettings(document.settings);
        settingsRef.current = nextSettings;
        setSettings(nextSettings);
        reviewsRef.current = normalizeReviewLog(document.reviews);
        typesRef.current = normalizeTypes(document.types);
        setTypes(typesRef.current);
        deletedIdsRef.current = new Set();
        savedSignaturesRef.current = signatureMapOf(split.items, split.tombstones);
        writeMirror(mirrorItems(split.items, split.tombstones), document.revision);
        setStatus('synced');
      };

      /** Merge an incremental poll response into the local document. */
      const applyDeltaDocument = (delta) => {
        const changes = Array.isArray(delta.items) ? delta.items : [];
        const changedIds = new Set(changes.map((item) => item.id));
        const preservedTombstones = [...tombstonesRef.current.values()].filter((item) => !changedIds.has(item.id));
        const mergedItems = [...changes, ...itemsRef.current.filter((item) => !changedIds.has(item.id)), ...preservedTombstones];
        const reviewKey = (record) => record.itemId + '|' + record.at + '|' + record.quality;
        const reviewMap = new Map();
        for (const record of reviewsRef.current) reviewMap.set(reviewKey(record), record);
        for (const record of Array.isArray(delta.reviews) ? delta.reviews : []) reviewMap.set(reviewKey(record), record);
        const mergedReviews = [...reviewMap.values()].sort((left, right) => left.at - right.at).slice(-5000);
        adoptDocument({
          revision: delta.revision,
          watermark: delta.watermark,
          items: mergedItems,
          settings: delta.settings,
          reviews: mergedReviews,
          types: delta.types,
        });
      };

      const applyTypes = (next) => {
        typesRef.current = next;
        setTypes(next);
        scheduleSave();
      };

      /** Read-modify-write settings and refresh the panel's settings/revision refs. */
      const saveSettings = (mutator) =>
        writeSettings(mutator).then((document) => {
          revisionRef.current = document.revision;
          settingsRef.current = document.settings;
          setSettings(document.settings);
          const split = splitDocumentItems(document.items);
          savedSignaturesRef.current = signatureMapOf(split.items, split.tombstones);
          return document;
        });

      const matchShortcut = (event, combo) => {
        if (typeof combo !== 'string' || combo.trim().length === 0) return false;
        const parts = combo.toLowerCase().split('+').map((part) => part.trim()).filter((part) => part.length > 0);
        if (parts.length === 0) return false;
        const keyPart = parts[parts.length - 1];
        const needsCtrl = parts.includes('ctrl');
        const needsMeta = parts.includes('meta');
        const needsShift = parts.includes('shift');
        const needsAlt = parts.includes('alt');
        if (needsCtrl !== Boolean(event.ctrlKey)) return false;
        if (needsMeta !== Boolean(event.metaKey)) return false;
        if (needsShift !== Boolean(event.shiftKey)) return false;
        if (needsAlt !== Boolean(event.altKey)) return false;
        const key = typeof event.key === 'string' ? event.key.toLowerCase() : '';
        return key === keyPart;
      };

      React.useEffect(() => {
        if (typeof window.addEventListener !== 'function') return undefined;
        const onKeyDown = (event) => {
          const key = event && typeof event.key === 'string' ? event.key.toLowerCase() : '';
          if (matchShortcut(event, settingsRef.current.shortcuts.palette)) {
            event.preventDefault();
            setPaletteQuery('');
            setPaletteIndex(0);
            setPaletteOpen(true);
            return;
          }
          if (key === 'escape') {
            setPaletteOpen(false);
            setShortcutsOpen(false);
          }
          if (matchShortcut(event, settingsRef.current.shortcuts.help)) {
            const tag = event.target && event.target.tagName ? String(event.target.tagName).toUpperCase() : '';
            if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
              event.preventDefault();
              setShortcutsOpen((value) => !value);
            }
          }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
      }, []);

      React.useEffect(() => {
        let cancelled = false;
        const boot = async () => {
          try {
            const document = await readState();
            if (cancelled) return;
            setStoragePath(document.file);
            if (document.items.length === 0) {
              const legacy = migrateLegacy();
              if (legacy.length > 0) {
                try {
                  const written = await putState(legacy, DEFAULT_SETTINGS, reviewsRef.current, typesRef.current, {
                    revision: document.revision,
                  });
                  if (cancelled) return;
                  adoptDocument(written);
                  clearLegacy();
                } catch (error) {
                  if (cancelled) return;
                  setItems(legacy);
                  itemsRef.current = legacy;
                  setStatus('offline');
                }
              } else {
                adoptDocument(document);
              }
            } else {
              adoptDocument(document);
            }
          } catch (error) {
            if (cancelled) return;
            const mirror = readMirror();
            const split = splitDocumentItems(mirror.items);
            revisionRef.current = mirror.revision;
            itemsRef.current = split.items;
            tombstonesRef.current = split.tombstones;
            setItems(split.items);
            setStatus('offline');
          }
        };
        boot();
        return () => {
          cancelled = true;
          if (saveTimer.current) window.clearTimeout(saveTimer.current);
          if (confirmTimer.current) window.clearTimeout(confirmTimer.current);
          if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
          if (dirtyRef.current) {
            putState(itemsRef.current, settingsRef.current, reviewsRef.current, typesRef.current, {
              keepalive: true,
              revision: revisionRef.current,
              tombstones: [...tombstonesRef.current.values()],
            }).catch(() => {});
          }
        };
      }, []);

      React.useEffect(() => {
        const timer = window.setInterval(() => {
          if (dirtyRef.current) return;
          readState(watermarkRef.current)
            .then((document) => {
              if (document.delta === true) {
                applyDeltaDocument(document);
                return;
              }
              adoptDocument(document);
              setStoragePath(document.file);
            })
            .catch(() => setStatus('offline'));
        }, 12000);
        return () => window.clearInterval(timer);
      }, []);

      React.useEffect(() => {
        if (!settings.harnessAutoCheck || settings.harnessFeedUrl.length === 0) return undefined;
        let cancelled = false;
        const intervalMs = 6 * 60 * 60 * 1000;
        const notify = (version) => {
          try {
            if (typeof window.Notification !== 'function' || window.Notification.permission !== 'granted') return;
            const notification = new window.Notification(t('harnessTitle'), {
              body: fillTemplate(t('harnessNewVersionNotify'), { version }),
              tag: 'dsh-quick-note-harness-update',
            });
            notification.onclick = () => {
              if (typeof props.selectPanel === 'function') props.selectPanel(PANEL_ID);
            };
          } catch (error) {
            // notifications are optional
          }
        };
        const checkNow = () => {
          const snapshot = props.prefs && typeof props.prefs.getSnapshot === 'function' ? props.prefs.getSnapshot() : {};
          if (snapshot.harnessLatestVersion) setHarnessUpdateBanner(snapshot.harnessLatestVersion);
          if (Date.now() - (snapshot.harnessLastCheckAt || 0) < intervalMs) return;
          postProtected(HARNESS_URL, { action: 'check' })
            .then((payload) => {
              if (cancelled) return;
              if (props.prefs && typeof props.prefs.set === 'function') {
                props.prefs.set({
                  ...snapshot,
                  harnessLastCheckAt: Date.now(),
                  harnessLatestVersion: payload.updateAvailable ? payload.manifest.version : '',
                });
              }
              if (payload.updateAvailable) {
                setHarnessUpdateBanner(payload.manifest.version);
                notify(payload.manifest.version);
              } else {
                setHarnessUpdateBanner('');
              }
            })
            .catch(() => {});
        };
        checkNow();
        const timer = window.setInterval(checkNow, 60 * 60 * 1000);
        return () => {
          cancelled = true;
          window.clearInterval(timer);
        };
      }, [settings.harnessAutoCheck, settings.harnessFeedUrl]);

      const loadAdmin = () => {
        setAdminState('loading');
        readAdmin()
          .then((payload) => {
            setAdmin(payload);
            setAdminState('ready');
          })
          .catch(() => {
            setAdmin(null);
            setAdminState('offline');
          });
      };

      const loadUsage = () => {
        setUsageState('loading');
        readUsage()
          .then((payload) => {
            setUsage(payload);
            setUsageState('ready');
          })
          .catch(() => {
            setUsage(null);
            setUsageState('offline');
          });
      };

      const captureValueSnapshotNow = () => {
        if (value === null || value.workspaces.length === 0) return;
        const at = Date.now();
        saveSettings((settings) => {
          const history = { ...(settings.valueHistory || {}) };
          for (const workspace of value.workspaces) {
            const key = workspace.path || workspace.title;
            history[key] = [...(history[key] || []), { at, valueScore: workspace.valueScore, socialScore: workspace.socialScore }].slice(-12);
          }
          return { ...settings, valueHistory: history };
        })
          .then(() => flashNotice(t('valueSnapshotSaved')))
          .catch(() => flashNotice(t('valueUnavailable')));
      };

      const clearWorkspaceHistory = (key) => {
        if (valueHistoryClearKey !== key) {
          setValueHistoryClearKey(key);
          return;
        }
        setValueHistoryClearKey(null);
        saveSettings((settings) => {
          const history = { ...settings.valueHistory };
          delete history[key];
          return { ...settings, valueHistory: history };
        })
          .then(() => flashNotice(t('valueHistoryCleared')))
          .catch(() => flashNotice(t('valueUnavailable')));
      };

      const buildValueMarkdown = () => {
        if (value === null) return '';
        const ordered = [...value.workspaces].sort((left, right) => {
          if (valueSort === 'social') return right.socialScore - left.socialScore || right.valueScore - left.valueScore;
          if (valueSort === 'cost') return right.cost - left.cost || right.valueScore - left.valueScore;
          return right.valueScore - left.valueScore || right.totalTokens - left.totalTokens;
        });
        const lines = [
          '# ' + t('valueReportTitle'),
          '',
          t('valueReportGenerated') + ': ' + new Date().toISOString(),
          t('valueAvgScore') + ': ' + value.averageScore,
          '',
        ];
        for (const workspace of ordered) {
          lines.push('## ' + workspace.title);
          lines.push('');
          lines.push('- ' + t('csvPath') + ': ' + (workspace.path || '—'));
          lines.push('- ' + t('valueScore') + ': ' + workspace.valueScore + ' (' + workspace.grade + ')');
          lines.push(
            '- ' +
              t('valueStage') +
              ': ' +
              valueStageText(workspace.stage, t) +
              ' / ' +
              t('valueFuture') +
              ': ' +
              valueFutureText(workspace.future, t),
          );
          lines.push(
            '- ' +
              t('valueSocial') +
              ': ' +
              workspace.socialScore +
              ' (' +
              valueGradeText(workspace.socialGrade, t) +
              ')' +
              (workspace.socialDomains.length > 0 ? ' · ' + t('valueDomains') + ': ' + workspace.socialDomains.join('、') : ''),
          );
          lines.push(
            '- ' +
              t('valueSessions') +
              ': ' +
              workspace.sessions +
              ' · ' +
              t('valueTokens') +
              ': ' +
              formatNumber(workspace.totalTokens) +
              ' · ' +
              t('valueCost') +
              ': ' +
              formatMoney(workspace.cost),
          );
          if (workspace.note.length > 0) lines.push('- ' + t('valueNote') + ' (' + ratingText(workspace.rating, t) + '): ' + workspace.note);
          if (workspace.socialNote.length > 0) {
            lines.push('- ' + t('valueSocialNote') + ' (' + ratingText(workspace.socialRating, t) + '): ' + workspace.socialNote);
          }
          lines.push('');
        }
        return lines.join('\n');
      };

      const archiveValueReport = () => {
        const markdown = buildValueMarkdown();
        if (markdown.length === 0) return;
        const now = Date.now();
        const item = {
          id: nextItemId(),
          kind: 'note',
          title: t('valueReportTitle') + ' ' + new Date().toISOString().slice(0, 10),
          body: markdown,
          tags: ['工作区', '价值报告'],
          status: 'open',
          priority: 'normal',
          due: null,
          doneAt: null,
          review: normalizeReview(undefined),
          health: normalizeHealth(undefined),
          record: normalizeRecord(undefined),
          order: null,
          createdAt: now,
          updatedAt: now,
        };
        applyItems([item, ...itemsRef.current]);
        flashNotice(t('valueArchived'));
      };

      const exportValueMarkdown = () => {
        const markdown = buildValueMarkdown();
        if (markdown.length === 0) return;
        try {
          downloadTextFile('workspace-value-' + new Date().toISOString().slice(0, 10) + '.md', markdown, 'text/markdown;charset=utf-8');
          flashNotice(t('exported'));
        } catch (error) {
          flashNotice(t('valueUnavailable'));
        }
      };

      const clearValueHistory = () => {
        if (!valueHistoryConfirm) {
          setValueHistoryConfirm(true);
          return;
        }
        setValueHistoryConfirm(false);
        saveSettings((settings) => ({ ...settings, valueHistory: {} }))
          .then(() => flashNotice(t('valueHistoryCleared')))
          .catch(() => flashNotice(t('valueUnavailable')));
      };

      const exportValueCsv = () => {
        if (value === null) return;
        const csvCell = (cell) => '"' + String(cell === undefined || cell === null ? '' : cell).replace(/"/g, '""') + '"';
        const headers = [
          t('csvWorkspace'),
          t('csvPath'),
          t('valueScore'),
          t('valueGrade'),
          t('valueStage'),
          t('valueFuture'),
          t('valueSocialScore'),
          t('csvSocialGrade'),
          t('valueDomains'),
          t('valueTokens'),
          t('valueCost'),
          t('valueRating'),
          t('valueNote'),
          t('valueSocialRating'),
          t('valueSocialNote'),
        ];
        const ordered = [...value.workspaces].sort((left, right) => {
          if (valueSort === 'social') return right.socialScore - left.socialScore || right.valueScore - left.valueScore;
          if (valueSort === 'cost') return right.cost - left.cost || right.valueScore - left.valueScore;
          return right.valueScore - left.valueScore || right.totalTokens - left.totalTokens;
        });
        const rows = ordered.map((workspace) =>
          [
            workspace.title,
            workspace.path,
            workspace.valueScore,
            workspace.grade,
            valueStageText(workspace.stage, t),
            valueFutureText(workspace.future, t),
            workspace.socialScore,
            valueGradeText(workspace.socialGrade, t),
            workspace.socialDomains.join(' '),
            workspace.totalTokens,
            workspace.cost,
            ratingText(workspace.rating, t),
            workspace.note,
            ratingText(workspace.socialRating, t),
            workspace.socialNote,
          ].map(csvCell).join(','),
        );
        try {
          const payload = '\ufeff' + [headers.map(csvCell).join(','), ...rows].join('\r\n');
          downloadTextFile('workspace-value-' + new Date().toISOString().slice(0, 10) + '.csv', payload, 'text/csv;charset=utf-8');
          flashNotice(t('exported'));
        } catch (error) {
          flashNotice(t('valueUnavailable'));
        }
      };

      const maybeCaptureValueSnapshot = (payload) => {
        readState()
          .then((document) => {
            const history = document.settings.valueHistory || {};
            let latestAt = 0;
            for (const entries of Object.values(history)) {
              for (const entry of entries) if (entry.at > latestAt) latestAt = entry.at;
            }
            if (latestAt > Date.now() - 20 * 60 * 60 * 1000) return;
            const now = Date.now();
            saveSettings((settings) => {
              const next = { ...(settings.valueHistory || {}) };
              for (const workspace of payload.workspaces || []) {
                const key = workspace.path || workspace.title;
                next[key] = [...(next[key] || []), { at: now, valueScore: workspace.valueScore, socialScore: workspace.socialScore }].slice(-12);
              }
              return { ...settings, valueHistory: next };
            }).catch(() => {});
          })
          .catch(() => {});
      };

      const loadValue = (refresh) => {
        setValueState('loading');
        readValue(refresh === true)
          .then((payload) => {
            setValue(payload);
            const drafts = {};
            for (const workspace of payload.workspaces || []) {
              drafts[workspace.path || workspace.title] = {
                note: workspace.note || '',
                rating: workspace.rating || '',
                socialNote: workspace.socialNote || '',
                socialRating: workspace.socialRating || '',
              };
            }
            setValueDrafts(drafts);
            setValueState('ready');
            maybeCaptureValueSnapshot(payload);
          })
          .catch(() => {
            setValue(null);
            setValueState('offline');
          });
      };

      const saveWorkspaceNote = (key) => {
        const draft = valueDrafts[key] || { note: '', rating: '', socialNote: '', socialRating: '' };
        const note = draft.note.trim().slice(0, 2000);
        const rating = draft.rating === 'high' || draft.rating === 'medium' || draft.rating === 'low' ? draft.rating : '';
        const socialNote = (draft.socialNote || '').trim().slice(0, 2000);
        const socialRating =
          draft.socialRating === 'high' || draft.socialRating === 'medium' || draft.socialRating === 'low' ? draft.socialRating : '';
        saveSettings((settings) => {
          const notes = { ...settings.workspaceNotes };
          if (note.length === 0 && rating.length === 0 && socialNote.length === 0 && socialRating.length === 0) delete notes[key];
          else notes[key] = { note, rating, socialNote, socialRating, updatedAt: Date.now() };
          return { ...settings, workspaceNotes: notes };
        })
          .then(() => {
            setValueDrafts((current) => ({ ...current, [key]: { note, rating, socialNote, socialRating } }));
            flashNotice(t('valueSaved'));
          })
          .catch(() => flashNotice(t('valueUnavailable')));
      };

      React.useEffect(() => {
        if (view !== 'insights') return undefined;
        if (insightTab === 'system') loadAdmin();
        else if (insightTab === 'usage') loadUsage();
        else loadValue(false);
        return undefined;
      }, [view, insightTab]);

      const enabledViews = ['note', 'task', 'card', 'health', 'record'].filter((kind) => prefs.modules[kind]);
      const modulesHidden = enabledViews.length === 0;
      const knowledgeTab = prefs.knowledgeTab === 'review' ? 'review' : 'notes';
      const overviewTab = prefs.overviewTab === 'all' ? 'all' : 'dashboard';
      const writeMode = prefs.writeMode === 'full' ? 'full' : 'patch';
      const showKnowledge = prefs.modules.note || prefs.modules.card;
      const activeView =
        view === 'overview' || view === 'all' || view === 'insights' || view === 'record'
          ? view
          : enabledViews.includes(view)
            ? view
            : enabledViews[0] || 'note';
      const activeTabId =
        activeView === 'overview' || activeView === 'all'
          ? 'overview'
          : activeView === 'note' || activeView === 'card'
            ? 'knowledge'
            : activeView === 'task'
              ? 'plan'
              : activeView;
      const viewKind =
        activeView === 'health'
          ? healthMode
          : activeView === 'overview' || activeView === 'all' || activeView === 'insights'
            ? 'note'
            : activeView === 'record'
              ? 'record'
              : activeView;
      const knowledgeItems = [];
      if (prefs.modules.note) knowledgeItems.push({ id: 'note', label: t('viewNotes') });
      if (prefs.modules.card) knowledgeItems.push({ id: 'card', label: t('viewCards') });
      const tabIds = [
        'overview',
        ...(showKnowledge ? ['knowledge'] : []),
        ...(prefs.modules.task ? ['plan'] : []),
        ...(prefs.modules.health ? ['health'] : []),
        ...(prefs.modules.record ? ['record'] : []),
        'insights',
      ];
      const needle = query.trim().toLowerCase();
      const nowMs = Date.now();
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      const todayStart = dayStart.getTime();
      const todayEnd = todayStart + 24 * 60 * 60 * 1000;
      const matchesFilter = (item) => {
        if (activeView !== 'task' || taskFilter === 'all') return true;
        if (item.kind !== 'task') return false;
        if (taskFilter === 'open') return item.status === 'open';
        if (taskFilter === 'done') return item.status === 'done';
        if (taskFilter === 'today') return item.due !== null && item.due >= todayStart && item.due < todayEnd;
        if (taskFilter === 'overdue') return item.status === 'open' && item.due !== null && item.due < nowMs;
        return true;
      };
      const visible = newestFirst(
        items.filter((item) => {
          if (item.kind !== viewKind) return false;
          if (!matchesFilter(item)) return false;
          if (needle.length === 0) return true;
          return (item.title + '\n' + item.body + '\n' + item.tags.join(' ')).toLowerCase().includes(needle);
        }),
      );
      const effective = modulesHidden ? undefined : visible.find((item) => item.id === selectedId) ?? visible[0];      const stats = activeView === 'card' && !modulesHidden ? reviewStats(items, reviewsRef.current, 30, nowMs) : undefined;
      const distribution =
        activeView === 'card' && !modulesHidden ? reviewDistribution(reviewsRef.current, 30, nowMs) : undefined;
      const retention = activeView === 'card' && !modulesHidden ? retentionByInterval(reviewsRef.current) : undefined;
      const retentionGoal = Math.max(1, prefs.reviewGoal);
      const retentionForecast = (() => {
        if (retention === undefined) return undefined;
        const days = [1, 6, 29, 30];
        const points = retention
          .map((bucket, index) => ({ days: days[index], rate: bucket.rate }))
          .filter((point) => point.rate !== null && point.rate > 0);
        if (points.length === 0) return undefined;
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumXX = 0;
        for (const point of points) {
          const x = point.days;
          const y = Math.log(point.rate);
          sumX += x;
          sumY += y;
          sumXY += x * y;
          sumXX += x * x;
        }
        const count = points.length;
        const denominator = count * sumXX - sumX * sumX;
        const slope = denominator === 0 ? 0 : (count * sumXY - sumX * sumY) / denominator;
        const intercept = (sumY - slope * sumX) / count;
        const predict = (target) => Math.max(0, Math.min(1, Math.exp(intercept + slope * target)));
        return {
          points: [1, 7, 30].map((target) => ({ days: target, rate: predict(target) })),
          halfLife: slope < 0 ? Math.round((Math.log(2) / -slope) * 10) / 10 : null,
        };
      })();
      const reviewGoalHistory = (() => {
        const counts = new Map();
        for (const record of normalizeReviewLog(reviewsRef.current)) {
          const key = dayKeyOf(record.at);
          counts.set(key, (counts.get(key) || 0) + 1);
        }
        const cells = [];
        for (let offset = 6; offset >= 0; offset -= 1) {
          const date = new Date(nowMs - offset * 86400000);
          const key = dayKeyOf(date.getTime());
          cells.push({ key, label: date.getMonth() + 1 + '/' + date.getDate(), count: counts.get(key) || 0, goal: retentionGoal });
        }
        return cells;
      })();
      const healthSummary =
        activeView === 'health' && !modulesHidden
          ? (() => {
              if (healthMode === 'med') {
                const meds = activeMedications(items);
                return h(
                  'div',
                  { className: 'dshqn-stats' },
                  h('span', { className: 'dshqn-stat' }, t('healthTodayMeds')),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dshqn-button',
                      onClick: () => saveSettings((current) => ({ ...current, medReminderEnabled: current.medReminderEnabled === false })),
                    },
                    settings.medReminderEnabled === false ? t('medRemindersOff') : t('medRemindersOn'),
                  ),
                  meds.length === 0
                    ? h('span', { className: 'dshqn-stat' }, t('healthNoMeds'))
                    : h(
                        'div',
                        { className: 'dshqn-stats' },
                        meds.map((item) => {
                          const nowDate = new Date(nowMs);
                          const hhmm = String(nowDate.getHours()).padStart(2, '0') + ':' + String(nowDate.getMinutes()).padStart(2, '0');
                          const weekStart = nowMs - 6 * 86400000;
                          const intakes = Array.isArray(item.health.intakes) ? item.health.intakes.filter((entry) => entry.at >= weekStart) : [];
                          const expected = Math.max(1, item.health.times.length * 7);
                          const rate = Math.min(100, Math.round((intakes.length / expected) * 100));
                          return h(
                            'div',
                            { key: item.id, className: 'dshqn-stat', style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
                            h('span', null, (item.title || t('untitled')) + ' · ' + item.health.times.join('/')),
                            h('span', null, t('medAdherenceWeek') + ' ' + rate + '% (' + intakes.length + '/' + expected + ')'),
                            h(
                              'span',
                              { style: { display: 'inline-flex', gap: '2px' } },
                              Array.from({ length: 7 }, (_, offset) => {
                                const day = new Date(nowMs - (6 - offset) * 86400000);
                                const key = localDayKey(day.getTime());
                                const taken = (item.health.intakes || []).filter((entry) => entry.date === key).length;
                                return h(
                                  'span',
                                  { key, title: key + ' ' + taken + '/' + item.health.times.length, style: { fontSize: '10px', padding: '0 2px', borderRadius: '3px', background: taken >= item.health.times.length ? 'var(--dshqn-accent)' : 'var(--dsw-alias-bg-layer-2)' } },
                                  taken >= item.health.times.length ? '✓' : taken + '/' + item.health.times.length,
                                );
                              }),
                            ),
                            h(
                              'button',
                              {
                                type: 'button',
                                className: 'dshqn-button',
                                onClick: () =>
                                  updateById(item.id, {
                                    health: {
                                      ...item.health,
                                      intakes: [...(item.health.intakes || []), { date: localDayKey(nowMs), time: hhmm, at: nowMs }].slice(-180),
                                    },
                                  }),
                              },
                              t('medLogIntake'),
                            ),
                          );
                        }),
                      ),
                );
              }
              const since = nowMs - 30 * 24 * 60 * 60 * 1000;
              const recent = items.filter(
                (item) => item.kind === 'metric' && (item.health.at === null ? item.createdAt : item.health.at) >= since,
              );
              const latest = newestFirst(items.filter((item) => item.kind === 'metric'));
              return h(
                'div',
                { className: 'dshqn-stats' },
                h('span', { className: 'dshqn-stat' }, t('healthRecordCount') + ' ' + recent.length),
                latest.length > 0
                  ? h(
                      'span',
                      { className: 'dshqn-stat' },
                      (latest[0].title || t('untitled')) +
                        (latest[0].health.value === null ? '' : ' ' + latest[0].health.value) +
                        (latest[0].health.unit.length > 0 ? ' ' + latest[0].health.unit : ''),
                    )
                  : null,
              );
            })()
          : undefined;
      const metricCards =
        activeView === 'health' && healthMode === 'metric' && !modulesHidden ? metricOverview(items, nowMs) : undefined;
      const compareData =
        activeView === 'health' && healthMode === 'metric' && !modulesHidden ? compareSeries(items, nowMs, compareSelected) : [];
      const detail =
        activeView === 'health' && !modulesHidden && metricDetail !== null ? metricDetailData(items, metricDetail) : undefined;

      React.useEffect(() => {
        setTagsDraft(effective === undefined ? '' : effective.tags.join(', '));
        setTimesDraft(effective === undefined ? '' : normalizeHealth(effective.health).times.join(', '));
      }, [effective === undefined ? 'none' : effective.id]);

      React.useEffect(() => {
        setDetailValue('');
        setDetailValue2('');
        setPendingDeleteId(null);
        setDetailEdit(null);
      }, [metricDetail]);

      const deleteDetailRow = (id) => {
        if (pendingDeleteId !== id) {
          setPendingDeleteId(id);
          return;
        }
        setPendingDeleteId(null);
        if (detailEdit !== null && detailEdit.id === id) setDetailEdit(null);
        if (selectedId === id) setSelectedId(null);
        removeItems((item) => item.id === id);
      };

      const openDetailEdit = (row) => {
        setPendingDeleteId(null);
        setDetailEdit({
          id: row.id,
          value: String(row.value),
          value2: row.value2 === null ? '' : String(row.value2),
          unit: row.unit,
          at: toLocalInput(row.at),
        });
      };

      const saveDetailEdit = () => {
        if (detailEdit === null) return;
        const value = numberFromInput(detailEdit.value);
        if (value === null) return;
        updateById(detailEdit.id, {
          health: normalizeHealth({
            value,
            value2: numberFromInput(detailEdit.value2),
            unit: detailEdit.unit,
            at: fromLocalInput(detailEdit.at),
          }),
        });
        setDetailEdit(null);
      };

      const toggleCompareName = (name) => {
        const key = name.toLowerCase();
        setCompareSelected((current) => {
          if (current.some((entry) => entry.toLowerCase() === key)) {
            return current.filter((entry) => entry.toLowerCase() !== key);
          }
          return [...current, name].slice(-3);
        });
      };

      const updateItem = (patch) => {
        if (effective === undefined) return;
        const now = Date.now();
        const next = itemsRef.current.map((item) => (item.id === effective.id ? { ...item, ...patch, updatedAt: now } : item));
        resetConfirmation();
        applyItems(next);
      };

      const updateById = (id, patch) => {
        const now = Date.now();
        applyItems(itemsRef.current.map((item) => (item.id === id ? { ...item, ...patch, updatedAt: now } : item)));
      };

      /** Upload files and append their refs to the selected item. */
      const addAttachments = (fileList) => {
        if (effective === undefined) return;
        const files = Array.from(fileList || []).slice(0, 5);
        if (files.length === 0) return;
        const targetId = effective.id;
        setUploadingAttachments(true);
        Promise.all(files.map((file) => uploadAttachment(file)))
          .then((refs) => {
            const current = itemsRef.current.find((item) => item.id === targetId);
            if (current !== undefined) {
              updateById(targetId, { attachments: [...(current.attachments || []), ...refs].slice(0, 12) });
            }
            flashNotice(fillTemplate(t('attachmentsAdded'), { count: refs.length }));
          })
          .catch(() => flashNotice(t('attachmentFailed')))
          .finally(() => setUploadingAttachments(false));
      };

      /** Remove one attachment ref from the selected item (the stored file is kept). */
      const removeAttachment = (attachmentId) => {
        if (effective === undefined) return;
        updateItem({ attachments: (effective.attachments || []).filter((attachment) => attachment.id !== attachmentId) });
      };

      React.useEffect(() => {
        if (readToken.length > 0) return undefined;
        let cancelled = false;
        fetchReadToken()
          .then(() => {
            if (!cancelled) setAttachmentNonce((value) => value + 1);
          })
          .catch(() => {});
        return () => {
          cancelled = true;
        };
      }, []);

      /** Toggle a task while spawning the next occurrence for repeating tasks. */
      const advanceTaskStatus = () => {
        if (effective === undefined || effective.kind !== 'task') return;
        const now = Date.now();
        const nextStatus = effective.status === 'done' ? 'open' : 'done';
        const updated = {
          ...effective,
          status: nextStatus,
          doneAt: nextStatus === 'done' ? now : null,
          updatedAt: now,
        };
        const spawned = nextStatus === 'done' && effective.repeat !== 'none' ? nextRepeatItemClient(updated, now) : null;
        applyItems([...(spawned === null ? [] : [spawned]), ...itemsRef.current.map((item) => (item.id === effective.id ? updated : item))]);
        resetConfirmation();
      };

      /** Patch one checklist row of the selected task. */
      const updateChecklistRow = (rowId, patch) => {
        if (effective === undefined) return;
        updateItem({ checklist: (effective.checklist || []).map((row) => (row.id === rowId ? { ...row, ...patch } : row)) });
      };

      /** Append the draft checklist item to the selected task. */
      const addChecklistRow = () => {
        if (effective === undefined) return;
        const text = checklistDraft.trim();
        if (text.length === 0) return;
        updateItem({ checklist: [...(effective.checklist || []), { id: nextItemId(), text: text.slice(0, 200), done: false }].slice(0, 50) });
        setChecklistDraft('');
      };

      /** Remove one checklist row from the selected task. */
      const removeChecklistRow = (rowId) => {
        if (effective === undefined) return;
        updateItem({ checklist: (effective.checklist || []).filter((row) => row.id !== rowId) });
      };

      const recordDetail = () => {
        if (detail === undefined) return;
        const value = numberFromInput(detailValue);
        if (value === null) return;
        const now = Date.now();
        setDetailValue('');
        setDetailValue2('');
        applyItems([
          {
            id: nextItemId(),
            kind: 'metric',
            title: detail.name,
            body: '',
            tags: [],
            status: 'open',
            priority: 'normal',
            due: null,
            doneAt: null,
            review: normalizeReview(undefined),
            health: normalizeHealth({ value, value2: numberFromInput(detailValue2), unit: detail.unit, at: now }),
            order: null,
            createdAt: now,
            updatedAt: now,
          },
          ...itemsRef.current,
        ]);
        flashNotice(t('recordSaved'));
      };

      const makeEmptyItem = (kind) => {
        const now = Date.now();
        return {
          id: nextItemId(),
          kind,
          title: '',
          body: '',
          tags: [],
          status: 'open',
          priority: 'normal',
          due: null,
          doneAt: null,
          review: normalizeReview(undefined),
          health: HEALTH_KINDS.includes(kind) ? normalizeHealth({ active: true, at: now }) : normalizeHealth(undefined),
          checklist: [],
          repeat: 'none',
          order: null,
          createdAt: now,
          updatedAt: now,
        };
      };

      const createItem = () => quickCreate(viewKind);

      const quickCreate = (kind) => {
        setView(viewOfKind(kind));
        if (kind === 'note' || kind === 'card') props.prefs.set({ ...prefs, knowledgeTab: kind === 'card' ? 'review' : 'notes' });
        if (kind === 'metric' || kind === 'med') setHealthMode(kind === 'med' ? 'med' : 'metric');
        setTaskFilter('all');
        setQuery('');
        setMetricDetail(null);
        stopReview();
        resetConfirmation();
        const item = makeEmptyItem(kind);
        setSelectedId(item.id);
        applyItems([item, ...itemsRef.current]);
      };

      const deleteItem = () => {
        if (effective === undefined) return;
        if (!confirming) {
          setConfirming(true);
          if (confirmTimer.current) window.clearTimeout(confirmTimer.current);
          confirmTimer.current = window.setTimeout(() => setConfirming(false), 3000);
          return;
        }
        resetConfirmation();
        setSelectedId(null);
        removeItems((item) => item.id === effective.id);
      };

      const clearBatch = () => {
        setBatchIds([]);
        setBatchConfirm(false);
        if (batchTimer.current) window.clearTimeout(batchTimer.current);
      };

      const toggleBatch = (id) => {
        setBatchConfirm(false);
        setBatchIds((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]));
      };

      const batchApply = (action) => {
        if (batchIds.length === 0) return;
        const now = Date.now();
        const ids = batchIds;
        if (action === 'delete') {
          if (!batchConfirm) {
            setBatchConfirm(true);
            if (batchTimer.current) window.clearTimeout(batchTimer.current);
            batchTimer.current = window.setTimeout(() => setBatchConfirm(false), 3000);
            return;
          }
          removeItems((item) => ids.includes(item.id));
          clearBatch();
          return;
        }
        const status = action === 'complete' ? 'done' : 'open';
        const spawned = [];
        const nextItems = itemsRef.current.map((item) => {
          if (!ids.includes(item.id) || item.kind !== 'task') return item;
          const updated = {
            ...item,
            status,
            doneAt: status === 'done' ? (item.doneAt === null ? now : item.doneAt) : null,
            updatedAt: now,
          };
          if (status === 'done' && item.repeat !== 'none' && item.status !== 'done') {
            spawned.push(nextRepeatItemClient(updated, now));
          }
          return updated;
        });
        applyItems([...spawned, ...nextItems]);
        clearBatch();
      };

      const batchPriority = (priority) => {
        if (batchIds.length === 0) return;
        const now = Date.now();
        const ids = batchIds;
        applyItems(
          itemsRef.current.map((item) => (ids.includes(item.id) ? { ...item, priority, updatedAt: now } : item)),
        );
        clearBatch();
      };

      const [recordConfirm, setRecordConfirm] = React.useState(false);
      const recordTimer = React.useRef(0);
      const [recordQuery, setRecordQuery] = React.useState('');
      const [recordSort, setRecordSort] = React.useState('updated');
      const [recordViewName, setRecordViewName] = React.useState('');
      const [viewSaving, setViewSaving] = React.useState(false);
      const [viewDeleteId, setViewDeleteId] = React.useState(null);
      const [recordBatchIds, setRecordBatchIds] = React.useState([]);
      const [recordBatchConfirm, setRecordBatchConfirm] = React.useState(false);

      const startNewType = () => {
        setEditingType({ id: '', name: '', fields: [{ key: 'f1', label: '', type: 'text', options: [] }] });
        setTypeDeleteConfirm(false);
        setSelectedRecordId(null);
      };

      const startEditType = (type) => {
        setEditingType(JSON.parse(JSON.stringify(type)));
        setTypeDeleteConfirm(false);
        setSelectedRecordId(null);
      };

      const updateField = (index, patch) => {
        setEditingType((current) =>
          current === null ? current : { ...current, fields: current.fields.map((field, at) => (at === index ? { ...field, ...patch } : field)) },
        );
      };

      const addTypeField = () => {
        setEditingType((current) =>
          current === null
            ? current
            : { ...current, fields: [...current.fields, { key: 'f' + (current.fields.length + 1), label: '', type: 'text', options: [] }] },
        );
      };

      const removeTypeField = (index) => {
        setEditingType((current) =>
          current === null ? current : { ...current, fields: current.fields.filter((field, at) => at !== index) },
        );
      };

      const saveType = () => {
        if (editingType === null) return;
        const name = editingType.name.trim();
        if (name.length === 0) {
          flashNotice(t('typeNameRequired'));
          return;
        }
        const fields = editingType.fields
          .map((field, index) => ({ ...field, key: 'f' + (index + 1), label: field.label.trim() }))
          .filter((field) => field.label.length > 0);
        const now = Date.now();
        const next =
          editingType.id.length === 0
            ? [...typesRef.current, { id: nextItemId(), name, fields, createdAt: now, updatedAt: now }]
            : typesRef.current.map((type) => (type.id === editingType.id ? { ...type, name, fields, updatedAt: now } : type));
        applyTypes(next);
        setRecordTypeId(editingType.id.length === 0 ? next[next.length - 1].id : editingType.id);
        setEditingType(null);
        setTypeDeleteConfirm(false);
        setSelectedRecordId(null);
      };

      const deleteType = () => {
        if (editingType === null || editingType.id.length === 0) return;
        if (!typeDeleteConfirm) {
          setTypeDeleteConfirm(true);
          return;
        }
        const removedId = editingType.id;
        applyTypes(typesRef.current.filter((type) => type.id !== removedId));
        removeItems((item) => item.kind === 'record' && item.record.typeId === removedId);
        setEditingType(null);
        setTypeDeleteConfirm(false);
        setRecordTypeId(null);
        setSelectedRecordId(null);
      };

      const createRecord = () => {
        const typeId = currentTypeId();
        if (typeId === null) return;
        const now = Date.now();
        const item = {
          id: nextItemId(),
          kind: 'record',
          title: '',
          body: '',
          tags: [],
          status: 'open',
          priority: 'normal',
          due: null,
          doneAt: null,
          review: normalizeReview(undefined),
          health: normalizeHealth(undefined),
          record: normalizeRecord({ typeId, values: {} }),
          order: null,
          createdAt: now,
          updatedAt: now,
        };
        setRecordTypeId(typeId);
        setSelectedRecordId(item.id);
        setRecordConfirm(false);
        applyItems([item, ...itemsRef.current]);
      };

      const updateRecord = (id, patch) => {
        if (recordTimer.current) window.clearTimeout(recordTimer.current);
        setRecordConfirm(false);
        updateById(id, patch);
      };

      const deleteRecord = (id) => {
        if (!recordConfirm) {
          setRecordConfirm(true);
          if (recordTimer.current) window.clearTimeout(recordTimer.current);
          recordTimer.current = window.setTimeout(() => setRecordConfirm(false), 3000);
          return;
        }
        if (recordTimer.current) window.clearTimeout(recordTimer.current);
        setRecordConfirm(false);
        setSelectedRecordId(null);
        removeItems((item) => item.id === id);
      };

      const currentTypeId = () =>
        recordTypeId !== null ? recordTypeId : typesRef.current.length > 0 ? typesRef.current[0].id : null;

      const updateTypeViews = (typeId, views) => {
        applyTypes(typesRef.current.map((type) => (type.id === typeId ? { ...type, views, updatedAt: Date.now() } : type)));
      };

      const saveRecordView = () => {
        const typeId = currentTypeId();
        const type = typeId === null ? undefined : typesRef.current.find((entry) => entry.id === typeId);
        if (type === undefined) return;
        const fallback = fillTemplate(t('defaultViewName'), { n: type.views.length + 1 });
        const name = (recordViewName.trim().length > 0 ? recordViewName.trim() : fallback).slice(0, 60);
        updateTypeViews(type.id, [...type.views, { id: nextItemId(), name, query: recordQuery.trim(), sort: recordSort, createdAt: Date.now() }]);
        setRecordViewName('');
        setViewSaving(false);
        flashNotice(t('viewSaved'));
      };

      const applyRecordView = (view) => {
        setRecordQuery(view.query || '');
        setRecordSort(view.sort === 'title' ? 'title' : 'updated');
        flashNotice(t('viewApplied'));
      };

      const deleteRecordView = (viewId) => {
        const typeId = currentTypeId();
        const type = typeId === null ? undefined : typesRef.current.find((entry) => entry.id === typeId);
        if (type === undefined) return;
        if (viewDeleteId !== viewId) {
          setViewDeleteId(viewId);
          return;
        }
        setViewDeleteId(null);
        updateTypeViews(type.id, type.views.filter((view) => view.id !== viewId));
      };

      const toggleRecordBatch = (id) => {
        setRecordBatchConfirm(false);
        setRecordBatchIds((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]));
      };

      const deleteRecordBatch = () => {
        if (recordBatchIds.length === 0) return;
        if (!recordBatchConfirm) {
          setRecordBatchConfirm(true);
          return;
        }
        const ids = recordBatchIds;
        setRecordBatchConfirm(false);
        setRecordBatchIds([]);
        setSelectedRecordId(null);
        removeItems((item) => ids.includes(item.id));
      };

      const changeView = (kind) => {
        let nextView = kind;
        if (kind === 'knowledge') {
          const preferred = knowledgeTab === 'review' ? 'card' : 'note';
          nextView = prefs.modules[preferred] ? preferred : prefs.modules.note ? 'note' : prefs.modules.card ? 'card' : 'note';
        }
        if (kind === 'calendar') {
          nextView = 'task';
          props.prefs.set({ ...prefs, taskLayout: 'calendar' });
        }
        if (kind === 'plan') nextView = 'task';
        if (kind === 'overview') props.prefs.set({ ...prefs, overviewTab: 'dashboard' });
        if (kind === 'all') props.prefs.set({ ...prefs, overviewTab: 'all' });
        setView(nextView);
        setTaskFilter('all');
        setSelectedId(null);
        setQuery('');
        setMetricDetail(null);
        clearBatch();
        setSelectedRecordId(null);
        setEditingType(null);
        setTypeDeleteConfirm(false);
        setRecordBatchIds([]);
        setViewDeleteId(null);
        setViewSaving(false);
        stopReview();
        resetConfirmation();
      };

      const stopReview = () => {
        setReviewing(false);
        setReviewQueue([]);
        setReviewIndex(0);
        setShowAnswer(false);
      };

      const goToItem = (item) => {
        setView(viewOfKind(item.kind));
        if (item.kind === 'note' || item.kind === 'card') props.prefs.set({ ...prefs, knowledgeTab: item.kind === 'card' ? 'review' : 'notes' });
        if (item.kind === 'metric' || item.kind === 'med') setHealthMode(item.kind === 'med' ? 'med' : 'metric');
        setTaskFilter('all');
        setQuery('');
        setMetricDetail(null);
        stopReview();
        resetConfirmation();
        setSelectedId(item.id);
      };

      const startReview = () => {
        const now = Date.now();
        const due = itemsRef.current
          .filter((item) => {
            if (item.kind !== 'card') return false;
            if (reviewMode === 'all') return true;
            if (reviewMode === 'new') return normalizeReview(item.review).repetitions === 0;
            return isCardDue(item, now);
          })
          .sort((left, right) => {
            const leftDue = left.review.dueAt === null ? 0 : left.review.dueAt;
            const rightDue = right.review.dueAt === null ? 0 : right.review.dueAt;
            return leftDue - rightDue;
          });
        if (due.length === 0) {
          flashNotice(t('noDueCards'));
          return;
        }
        setReviewQueue(due.map((item) => item.id));
        setReviewIndex(0);
        setShowAnswer(false);
        setReviewing(true);
      };

      const rateCard = (quality) => {
        const currentId = reviewQueue[reviewIndex];
        const current = itemsRef.current.find((item) => item.id === currentId);
        if (current === undefined) {
          stopReview();
          return;
        }
        const now = Date.now();
        setLastRating({
          itemId: currentId,
          beforeReview: current.review,
          beforeUpdatedAt: current.updatedAt,
          beforeReviewsLength: reviewsRef.current.length,
          queueIndex: reviewIndex,
        });
        const next = itemsRef.current.map((item) =>
          item.id === currentId ? { ...item, review: applySm2(item.review, quality, now), updatedAt: now } : item,
        );
        reviewsRef.current = normalizeReviewLog([...reviewsRef.current, { itemId: currentId, quality, at: now }]);
        applyItems(next);
        const nextIndex = reviewIndex + 1;
        if (nextIndex >= reviewQueue.length) {
          const finished = reviewQueue.length;
          stopReview();
          flashNotice(fillTemplate(t('reviewDone'), { count: finished }));
          return;
        }
        setReviewIndex(nextIndex);
        setShowAnswer(false);
      };

      const undoLastRating = () => {
        if (lastRating === null) return;
        const { itemId, beforeReview, beforeUpdatedAt, beforeReviewsLength, queueIndex } = lastRating;
        const next = itemsRef.current.map((item) =>
          item.id === itemId ? { ...item, review: beforeReview, updatedAt: beforeUpdatedAt } : item,
        );
        reviewsRef.current = normalizeReviewLog(reviewsRef.current.slice(0, Math.max(0, beforeReviewsLength)));
        applyItems(next);
        setReviewIndex(Math.max(0, queueIndex));
        setShowAnswer(false);
        setLastRating(null);
        flashNotice(t('reviewUndone'));
      };

      /** Toggle one item in the local pinned list. */
      const togglePin = (id) => {
        const pins = prefs.pins.includes(id) ? prefs.pins.filter((entry) => entry !== id) : [...prefs.pins, id].slice(0, 100);
        props.prefs.set({ ...prefs, pins });
      };

      /** Normalized key for one metric's reference range. */
      const metricNameKey = (name) => String(name || '').trim().toLowerCase();

      /** Reference range of one metric name, or null when unset. */
      const rangeOfName = (name) => {
        const range = prefs.healthRanges[metricNameKey(name)];
        return range === undefined ? null : range;
      };

      /** Classify one reading against its metric's reference range. */
      const rangeStateOf = (name, value) => {
        const range = rangeOfName(name);
        if (range === null || value === null) return 'missing';
        if (range.min !== null && value < range.min) return 'low';
        if (range.max !== null && value > range.max) return 'high';
        return 'normal';
      };

      /** Save or clear the reference range for one metric name. */
      const setMetricRange = (name, min, max) => {
        const key = metricNameKey(name);
        if (key.length === 0) return;
        const ranges = { ...prefs.healthRanges };
        if (min === null && max === null) delete ranges[key];
        else ranges[key] = { min, max };
        props.prefs.set({ ...prefs, healthRanges: ranges });
      };

      /** Move a task due time to a short preset day at 18:00 local time. */
      const setDuePreset = (offsetDays) => {
        if (effective === undefined) return;
        const date = new Date();
        date.setHours(18, 0, 0, 0);
        date.setDate(date.getDate() + offsetDays);
        updateItem({ due: date.getTime() });
      };

      const paletteActions = [
        ...['overview', 'all', 'knowledge', 'plan', 'insights'].map((view) => ({
          id: view,
          label: t(VIEW_META[view].tabKey),
          icon: VIEW_META[view].icon,
          run: () => changeView(view),
        })),
        ...['note', 'task', 'card', 'metric', 'med', 'record'].map((kind) => ({
          id: 'new-' + kind,
          label: t(KIND_META[kind].newKey),
          icon: KIND_META[kind].icon,
          run:
            kind === 'record'
              ? () => {
                  changeView('record');
                  if (types.length === 0) startNewType();
                }
              : () => quickCreate(kind),
        })),
      ];
      const paletteData = (() => {
        const query = paletteQuery.trim().toLowerCase();
        const actions = paletteActions.filter((action) => query.length === 0 || action.label.toLowerCase().includes(query));
        const matched =
          query.length === 0
            ? []
            : newestFirst(items)
                .filter((item) => (itemTitle(item) + ' ' + item.body + ' ' + item.tags.join(' ')).toLowerCase().includes(query))
                .slice(0, 12);
        return { actions, items: matched, total: actions.length + matched.length };
      })();
      const closePalette = () => {
        setPaletteOpen(false);
        setPaletteQuery('');
        setPaletteIndex(0);
      };
      const palettePick = (index) => {
        const { actions, items: matched } = paletteData;
        if (index < actions.length) actions[index].run();
        else if (index - actions.length < matched.length) goToItem(matched[index - actions.length]);
        closePalette();
      };
      const paletteKeyDown = (event) => {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setPaletteIndex((index) => (paletteData.total === 0 ? 0 : (index + 1) % paletteData.total));
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          setPaletteIndex((index) => (paletteData.total === 0 ? 0 : (index - 1 + paletteData.total) % paletteData.total));
        } else if (event.key === 'Enter') {
          event.preventDefault();
          if (paletteData.total > 0) palettePick(Math.max(0, Math.min(paletteIndex, paletteData.total - 1)));
        } else if (event.key === 'Escape') {
          event.preventDefault();
          closePalette();
        }
      };

      React.useEffect(() => {
        if (!reviewing || typeof window.addEventListener !== 'function') return undefined;
        const onKeyDown = (event) => {
          const tag = event.target && event.target.tagName ? String(event.target.tagName).toUpperCase() : '';
          if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
          const key = typeof event.key === 'string' ? event.key : '';
          if (key === 'Escape') {
            setFocusMode(false);
            stopReview();
            return;
          }
          if (key === ' ') {
            event.preventDefault();
            setShowAnswer(true);
            return;
          }
          if (!showAnswer) return;
          if (key === '1') rateCard(1);
          else if (key === '2') rateCard(3);
          else if (key === '3') rateCard(5);
          else if (key.toLowerCase() === 'u' && lastRating !== null) undoLastRating();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [reviewing, showAnswer, lastRating, reviewQueue, reviewIndex]);

      const handleSearch = (event) => {
        const value = event.target.value;
        setQuery(value);
        resetConfirmation();
      };

      const handleTagsInput = (event) => {
        const value = event.target.value;
        setTagsDraft(value);
        const tags = value
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
          .slice(0, 12);
        updateItem({ tags });
      };

      const handleTimesInput = (event) => {
        const value = event.target.value;
        setTimesDraft(value);
        const tokens = value
          .split(',')
          .map((part) => part.trim())
          .filter((part) => part.length > 0);
        const valid = tokens.filter((part) => /^([01]\d|2[0-3]):[0-5]\d$/.test(part));
        if (valid.length !== tokens.length) flashNotice(t('badTimes'));
        updateItem({ health: { ...normalizeHealth(effective.health), times: valid } });
      };

      const exportItems = () => {
        try {
          const payload = JSON.stringify(
            { version: 2, exportedAt: new Date().toISOString(), items: itemsRef.current, types: typesRef.current },
            null,
            2,
          );
          downloadTextFile('quick-note-export-' + new Date().toISOString().slice(0, 10) + '.json', payload, 'application/json');
          flashNotice(t('exported'));
        } catch (error) {
          flashNotice(t('importFailed'));
        }
      };

      const openImport = () => {
        if (fileInput.current !== null) fileInput.current.click();
      };

      const importFile = (event) => {
        const input = event.target;
        const file = input.files && input.files[0];
        if (!file) return;
        file
          .text()
          .then((text) => {
            let parsed;
            try {
              parsed = JSON.parse(text);
            } catch (error) {
              flashNotice(t('importFailed'));
              return;
            }
            const incoming = normalizeItems(parsed && Array.isArray(parsed.items) ? parsed.items : parsed);
            const incomingTypes = normalizeTypes(parsed && Array.isArray(parsed.types) ? parsed.types : []);
            if (incoming.length === 0 && incomingTypes.length === 0) {
              flashNotice(t('importEmpty'));
              return;
            }
            const known = new Set(itemsRef.current.map((item) => item.id));
            const merged = itemsRef.current.concat(incoming.filter((item) => !known.has(item.id)));
            const knownTypes = new Set(typesRef.current.map((type) => type.id));
            const mergedTypes = typesRef.current.concat(incomingTypes.filter((type) => !knownTypes.has(type.id)));
            const added = merged.length - itemsRef.current.length;
            const addedTypes = mergedTypes.length - typesRef.current.length;
            if (mergedTypes.length !== typesRef.current.length) applyTypes(mergedTypes);
            if (merged.length !== itemsRef.current.length) applyItems(merged);
            flashNotice(
              t('imported') + ' +' + added + (addedTypes > 0 ? ' · +' + addedTypes + ' ' + t('overviewTypes') : ''),
            );
          })
          .catch(() => flashNotice(t('importFailed')))
          .finally(() => {
            input.value = '';
          });
      };

      const refresh = () => {
        if (dirtyRef.current) {
          dirtyRef.current = false;
          putState(itemsRef.current, settingsRef.current, reviewsRef.current, typesRef.current, {
            revision: revisionRef.current,
            tombstones: [...tombstonesRef.current.values()],
          })
            .then((document) => {
              revisionRef.current = document.revision;
              writeMirror(document.items, document.revision);
              adoptDocument(document);
            })
            .catch(() => {
              dirtyRef.current = true;
              setStatus('offline');
            });
          return;
        }
        readState()
          .then((document) => {
            adoptDocument(document);
            setStoragePath(document.file);
          })
          .catch(() => setStatus('offline'));
      };

      const statusLabel =
        status === 'loading' ? t('loading') : status === 'saving' ? t('saving') : status === 'offline' ? t('offline') : t('saved');
      const bodyLength = effective === undefined ? 0 : Array.from(effective.body).length;

      /** Task completion stats for the task toolbar (today done/due, week done, overdue). */
      const taskStats = (() => {
        const tasks = items.filter((item) => item.kind === 'task');
        const todayKey = dayKeyOf(nowMs);
        const doneToday = tasks.filter((item) => item.doneAt !== null && dayKeyOf(item.doneAt) === todayKey).length;
        const openDueToday = tasks.filter(
          (item) => item.status === 'open' && item.due !== null && dayKeyOf(item.due) === todayKey,
        ).length;
        const weekStart = new Date();
        weekStart.setHours(0, 0, 0, 0);
        weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
        const weekDone = tasks.filter((item) => item.doneAt !== null && item.doneAt >= weekStart.getTime()).length;
        const overdue = tasks.filter((item) => item.status === 'open' && item.due !== null && item.due < nowMs).length;
        return { done: doneToday, total: doneToday + openDueToday, week: weekDone, overdue };
      })();
      const deleteLabel = confirming ? t('deleteConfirm') : t('deleteItem');
      const shownNotice = notice.length > 0 ? notice : statusLabel;

      const renderRow = (item) => {
        const done = item.kind === 'task' && item.status === 'done';
        const overdue = item.kind === 'task' && item.status !== 'done' && item.due !== null && item.due < nowMs;        const metaParts = [];
        if (done) metaParts.push('✓');
        if (item.due !== null) metaParts.push(formatDue(item.due));
        if (item.kind === 'card') metaParts.push(reviewDueLabel(item.review, t, nowMs));
        if (item.kind === 'metric') {
          const health = normalizeHealth(item.health);
          if (health.value !== null) {
            metaParts.push(health.value + (health.value2 !== null ? '/' + health.value2 : '') + (health.unit.length > 0 ? ' ' + health.unit : ''));
          }
          if (health.at !== null) metaParts.push(formatDue(health.at));
        }
        if (item.kind === 'med') {
          const health = normalizeHealth(item.health);
          if (health.times.length > 0) metaParts.push(health.times.join(' '));
          metaParts.push(health.active ? t('medActive') : t('medInactive'));
        }
        if (item.kind !== 'metric' && item.kind !== 'med') metaParts.push(formatStamp(item.updatedAt));
        if (item.tags.length > 0) metaParts.push(item.tags.map((tag) => '#' + tag).join(' '));
        const priorityClass =
          item.kind !== 'task' || item.priority === 'normal' ? 'dshqn-priority' : 'dshqn-priority dshqn-priority-' + item.priority;
        return h(
          'button',
          {
            key: item.id,
            type: 'button',
            className: item.id === selectedId || (selectedId === null && effective !== undefined && effective.id === item.id) ? 'dshqn-row dshqn-row-selected' : 'dshqn-row',
            onClick: () => {
              setSelectedId(item.id);
              resetConfirmation();
            },
          },
          h(
            'span',
            { className: 'dshqn-row-head' },
            item.kind === 'task' && item.priority !== 'normal' ? h('span', { className: priorityClass, 'aria-hidden': true, title: t('priorityLabel') }) : null,
            h('span', { className: done ? 'dshqn-row-title dshqn-row-done' : 'dshqn-row-title' }, itemTitle(item) || t('untitled')),
          ),
          h('span', { className: overdue ? 'dshqn-row-meta dshqn-row-meta-overdue' : 'dshqn-row-meta' }, metaParts.join(' · ')),
        );
      };

      const priorityLabels = { low: t('priorityLow'), normal: t('priorityNormal'), high: t('priorityHigh') };
      const groupVisible = () => {
        if (groupBy === 'priority') {
          return ['high', 'normal', 'low']
            .map((priority) => ({
              key: priority,
              title: priorityLabels[priority],
              items: visible.filter((item) => item.priority === priority),
            }))
            .filter((group) => group.items.length > 0);
        }
        const buckets = new Map();
        for (const item of visible) {
          const tag = item.tags.length > 0 ? item.tags[0] : '__none__';
          if (!buckets.has(tag)) buckets.set(tag, []);
          buckets.get(tag).push(item);
        }
        return [...buckets.entries()]
          .sort(([left], [right]) => (left === '__none__' ? 1 : right === '__none__' ? -1 : left.localeCompare(right)))
          .map(([tag, groupItems]) => ({ key: tag, title: tag === '__none__' ? t('noTags') : '#' + tag, items: groupItems }));
      };

      const reorderColumn = (columnKey, draggedId, beforeId) => {
        const status = columnKey === 'done' ? 'done' : 'open';
        const dragged = itemsRef.current.find((item) => item.id === draggedId);
        if (dragged === undefined || dragged.kind !== 'task') return;
        const ordered = sortBoardColumn(
          itemsRef.current.filter((item) => item.kind === 'task' && item.status === status && item.id !== draggedId),
        );
        let index = beforeId === null || beforeId === undefined ? ordered.length : ordered.findIndex((item) => item.id === beforeId);
        if (index < 0) index = 0;
        const before = index === 0 ? null : ordered[index - 1];
        const after = index >= ordered.length ? null : ordered[index];
        let nextOrder;
        if (before === null && after === null) nextOrder = 0;
        else if (before === null) nextOrder = orderValue(after) - 1;
        else if (after === null) nextOrder = orderValue(before) + 1;
        else nextOrder = (orderValue(before) + orderValue(after)) / 2;
        const patch = { order: nextOrder };
        if (dragged.status !== status) {
          patch.status = status;
          patch.doneAt = status === 'done' ? Date.now() : null;
        }
        updateById(draggedId, patch);
      };

      const renderBoardCard = (item, columnKey) => {
        const done = item.status === 'done';
        const overdue = !done && item.due !== null && item.due < nowMs;
        const metaParts = [];
        if (item.due !== null) metaParts.push(formatDue(item.due));
        if (item.tags.length > 0) metaParts.push(item.tags.map((tag) => '#' + tag).join(' '));
        const priorityClass =
          item.priority === 'normal' ? 'dshqn-priority' : 'dshqn-priority dshqn-priority-' + item.priority;
        return h(
          'div',
          {
            key: item.id,
            draggable: true,
            className:
              (item.id === selectedId || (selectedId === null && effective !== undefined && effective.id === item.id)
                ? 'dshqn-card-item dshqn-card-item-selected'
                : 'dshqn-card-item') +
              (draggingId === item.id ? ' dshqn-card-item-dragging' : '') +
              (dropTargetId === item.id && draggingId !== item.id ? ' dshqn-card-item-drop' : ''),
            onClick: () => {
              setSelectedId(item.id);
              resetConfirmation();
            },
            onDragStart: (event) => {
              try {
                if (event && event.dataTransfer && typeof event.dataTransfer.setData === 'function') {
                  event.dataTransfer.setData('text/plain', item.id);
                }
              } catch (error) {
                // a restricted dataTransfer must not break dragging
              }
              setDraggingId(item.id);
              setDropTargetId(null);
            },
            onDragEnd: () => {
              setDraggingId(null);
              setDragOverColumn(null);
              setDropTargetId(null);
            },
            onDragOver: (event) => {
              if (event && typeof event.preventDefault === 'function') event.preventDefault();
              if (draggingId !== null && draggingId !== item.id) setDropTargetId(item.id);
            },
            onDragLeave: () => {
              setDropTargetId((current) => (current === item.id ? null : current));
            },
            onDrop: (event) => {
              if (event && typeof event.preventDefault === 'function') event.preventDefault();
              if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
              let id = draggingId;
              try {
                if (id === null && event && event.dataTransfer && typeof event.dataTransfer.getData === 'function') {
                  id = event.dataTransfer.getData('text/plain');
                }
              } catch (error) {
                id = null;
              }
              setDragOverColumn(null);
              setDraggingId(null);
              setDropTargetId(null);
              if (typeof id !== 'string' || id.length === 0 || id === item.id) return;
              reorderColumn(columnKey, id, item.id);
            },
          },
          h(
            'span',
            { className: 'dshqn-card-head' },
            item.priority !== 'normal' ? h('span', { className: priorityClass, 'aria-hidden': true, title: t('priorityLabel') }) : null,
            h('span', { className: done ? 'dshqn-card-title dshqn-row-done' : 'dshqn-card-title' }, itemTitle(item) || t('untitled')),
          ),
          metaParts.length > 0 ? h('span', { className: overdue ? 'dshqn-card-meta dshqn-card-meta-overdue' : 'dshqn-card-meta' }, metaParts.join(' · ')) : null,
          h(
            'button',
            {
              type: 'button',
              className: 'dshqn-card-action',
              onClick: (event) => {
                if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
                setSelectedId(item.id);
                updateItem({ status: done ? 'open' : 'done', doneAt: done ? null : Date.now() });
              },
            },
            done ? t('taskOpen') : t('taskDone'),
          ),
        );
      };

      const boardBody =
        modulesHidden || activeView !== 'task' || taskLayout !== 'board'
          ? undefined
          : (() => {
              const openTasks = sortBoardColumn(visible.filter((item) => item.status !== 'done'));
              const doneTasks = sortBoardColumn(visible.filter((item) => item.status === 'done'));
              const column = (key, label, cards) =>
                h(
                  'div',
                  {
                    key,
                    className: dragOverColumn === key ? 'dshqn-board-col dshqn-board-col-over' : 'dshqn-board-col',
                    onDragOver: (event) => {
                      if (event && typeof event.preventDefault === 'function') event.preventDefault();
                      setDragOverColumn(key);
                    },
                    onDragLeave: () => {
                      setDragOverColumn((current) => (current === key ? null : current));
                    },
                    onDrop: (event) => {
                      if (event && typeof event.preventDefault === 'function') event.preventDefault();
                      let id = draggingId;
                      try {
                        if (id === null && event && event.dataTransfer && typeof event.dataTransfer.getData === 'function') {
                          id = event.dataTransfer.getData('text/plain');
                        }
                      } catch (error) {
                        id = null;
                      }
                      setDragOverColumn(null);
                      setDraggingId(null);
                      setDropTargetId(null);
                      if (typeof id !== 'string' || id.length === 0) return;
                      reorderColumn(key, id, null);
                    },
                  },
                  h('div', { className: 'dshqn-board-head' }, label + ' · ' + cards.length),
                  h('div', { className: 'dshqn-board-list' }, cards.map((item) => renderBoardCard(item, key))),
                );
              return h('div', { className: 'dshqn-board' }, column('open', t('taskOpen'), openTasks), column('done', t('taskDone'), doneTasks));
            })();

      const listBody = modulesHidden
        ? h('p', { className: 'dshqn-hint' }, t('allHidden'))
        : items.filter((item) => item.kind === viewKind).length === 0
          ? h(
              'p',
              { className: 'dshqn-hint' },
              activeView === 'task'
                ? t('emptyTasks')
                : activeView === 'card'
                  ? t('emptyCards')
                  : activeView === 'health'
                    ? (healthMode === 'med' ? t('emptyMeds') : t('emptyMetrics'))
                    : t('emptyNotes'),
            )
          : visible.length === 0
            ? h(EmptyState, { icon: 'search', title: t('noMatches') })
            : activeView === 'task' && groupBy !== 'none'
              ? groupVisible().map((group) => [
                  h('p', { key: 'g-' + group.key, className: 'dshqn-group-title' }, group.title + ' · ' + group.items.length),
                  ...group.items.map(renderRow),
                ])
              : h(VirtualRows, { items: visible, rowHeight: 64, render: renderRow });

      const valueSorted =
        value === null
          ? []
          : [...value.workspaces].sort((left, right) => {
              if (valueSort === 'social') return right.socialScore - left.socialScore || right.valueScore - left.valueScore;
              if (valueSort === 'cost') return right.cost - left.cost || right.valueScore - left.valueScore;
              return right.valueScore - left.valueScore || right.totalTokens - left.totalTokens;
            });

      const valueHistoryMap = settings.valueHistory || {};
      const trendRangeMs = valueChartRange === '7' ? 7 * 86400000 : valueChartRange === '30' ? 30 * 86400000 : null;
      const trendSeries = (() => {
        const since = trendRangeMs === null ? 0 : Date.now() - trendRangeMs;
        const visible = (key) => (valueHistoryMap[key] || []).filter((entry) => entry.at >= since);
        const keys = Object.keys(valueHistoryMap).filter((key) => visible(key).length > 1);
        if (keys.length === 0) return [];
        const moments = keys.flatMap((key) => visible(key).map((entry) => entry.at));
        const minAt = Math.min(...moments);
        const maxAt = Math.max(...moments);
        const span = maxAt - minAt || 1;
        return keys.slice(0, 6).map((key, index) => {
          const entries = visible(key).slice().sort((left, right) => left.at - right.at);
          const plotted = entries.map((entry) => {
            const score = valueChartMetric === 'social' ? entry.socialScore : entry.valueScore;
            const clamped = Math.max(0, Math.min(100, score));
            return {
              at: entry.at,
              score,
              x: Number((8 + ((entry.at - minAt) / span) * 304).toFixed(1)),
              y: Number((8 + (1 - clamped / 100) * 84).toFixed(1)),
            };
          });
          const match = value === null ? undefined : value.workspaces.find((workspace) => (workspace.path || workspace.title) === key);
          return {
            key,
            title: match === undefined ? key : match.title,
            points: plotted.map((point) => point.x + ',' + point.y).join(' '),
            circles: plotted,
            index,
          };
        });
      })();

      const valuePane =
        activeView === 'insights' && insightTab === 'value'
          ? h(
              'div',
              { className: 'dshqn-value' },
              h(SectionHead, { title: t('valueSummary'), hint: t('valueSortValue') + ' / ' + t('valueSortSocial') + ' / ' + t('valueSortCost') }),
              h(
                'div',
                { className: 'dshqn-toolbar' },
                h('span', { className: 'dshqn-stat' }, t('valueSummary')),
                h(Segmented, {
                  items: [
                    { id: 'value', label: t('valueSortValue') },
                    { id: 'social', label: t('valueSortSocial') },
                    { id: 'cost', label: t('valueSortCost') },
                  ],
                  value: valueSort,
                  onChange: setValueSort,
                  label: t('valueSummary'),
                }),
                h('span', { style: { flex: '1 1 auto' } }),
                h('button', { type: 'button', className: 'dshqn-button', onClick: captureValueSnapshotNow }, t('valueSnapshotNow')),
                h('button', { type: 'button', className: 'dshqn-button', onClick: exportValueCsv }, t('valueExportCsv')),
                h('button', { type: 'button', className: 'dshqn-button', onClick: exportValueMarkdown }, t('valueExportMd')),
                h('button', { type: 'button', className: 'dshqn-button', onClick: archiveValueReport }, t('valueArchive')),
                h('button', { type: 'button', className: 'dshqn-button', onClick: () => loadValue(true) }, t('valueRefresh')),
              ),
              valueState === 'loading'
                ? h(SkeletonCards, { count: 3 })
                : valueState !== 'ready' || value === null
                  ? h('p', { className: 'dshqn-hint' }, t('valueUnavailable'))
                  : value.workspaces.length === 0
                    ? h(EmptyState, { icon: 'value', title: t('valueEmpty') })
                    : [
                        Object.keys(valueHistoryMap).length === 0
                          ? null
                          : h(
                              'section',
                              { key: 'trend', className: 'dshqn-trend' },
                              h(
                                'div',
                                { className: 'dshqn-toolbar' },
                                h('span', { className: 'dshqn-stat' }, t('valueTrendChart')),
                                h(Segmented, {
                                  items: [
                                    { id: '7', label: t('valueRange7') },
                                    { id: '30', label: t('valueRange30') },
                                    { id: 'all', label: t('valueRangeAll') },
                                  ],
                                  value: valueChartRange,
                                  onChange: (id) => {
                                    setValueChartRange(id);
                                    setValueHover(null);
                                  },
                                  label: t('valueTrendChart'),
                                }),
                                h(Segmented, {
                                  items: [
                                    { id: 'value', label: t('valueChartValue') },
                                    { id: 'social', label: t('valueChartSocial') },
                                  ],
                                  value: valueChartMetric,
                                  onChange: (id) => {
                                    setValueChartMetric(id);
                                    setValueHover(null);
                                  },
                                  label: t('valueTrendChart'),
                                }),
                                h('span', { style: { flex: '1 1 auto' } }),
                                h(
                                  'button',
                                  { type: 'button', className: 'dshqn-button', onClick: clearValueHistory },
                                  valueHistoryConfirm ? t('valueClearConfirm') : t('valueClearHistory'),
                                ),
                              ),
                              trendSeries.length === 0
                                ? h('p', { className: 'dshqn-hint' }, t('valueChartEmpty'))
                                : h(
                                    'svg',
                                    { viewBox: '0 0 320 100', preserveAspectRatio: 'none', className: 'dshqn-trend-chart', 'aria-hidden': true },
                                    trendSeries.map((series) => [
                                      h('polyline', {
                                        key: series.key,
                                        points: series.points,
                                        fill: 'none',
                                        stroke: 'currentColor',
                                        strokeWidth: 1.5,
                                        strokeLinejoin: 'round',
                                        strokeLinecap: 'round',
                                        className: 'dshqn-trend-line dshqn-trend-line-' + (series.index % 6),
                                      }),
                                      ...series.circles.map((point) =>
                                        h('circle', {
                                          key: series.key + '-' + point.at,
                                          cx: point.x,
                                          cy: point.y,
                                          r: 2.4,
                                          className: 'dshqn-trend-dot dshqn-trend-line-' + (series.index % 6),
                                          onMouseEnter: () => setValueHover({ title: series.title, at: point.at, score: point.score }),
                                          onMouseLeave: () => setValueHover(null),
                                        }),
                                      ),
                                    ]),
                                    ...(() => {
                                      const points = trendSeries.flatMap((series) => series.circles);
                                      if (points.length === 0) return [];
                                      const minAt = Math.min(...points.map((point) => point.at));
                                      const maxAt = Math.max(...points.map((point) => point.at));
                                      const shortDate = (at) => {
                                        const date = new Date(at);
                                        return date.getMonth() + 1 + '/' + date.getDate();
                                      };
                                      return [
                                        ...[
                                          [100, 14],
                                          [50, 52],
                                          [0, 90],
                                        ].map(([label, y]) =>
                                          h('text', { key: 'y-' + label, x: 2, y, className: 'dshqn-trend-axis', textAnchor: 'start' }, String(label)),
                                        ),
                                        h('text', { key: 'x-min', x: 10, y: 99, className: 'dshqn-trend-axis', textAnchor: 'start' }, shortDate(minAt)),
                                        minAt !== maxAt
                                          ? h('text', { key: 'x-max', x: 310, y: 99, className: 'dshqn-trend-axis', textAnchor: 'end' }, shortDate(maxAt))
                                          : null,
                                      ];
                                    })(),
                                  ),
                              valueHover === null
                                ? null
                                : h(
                                    'p',
                                    { className: 'dshqn-settings-hint' },
                                    fillTemplate(t('valueHoverAt'), {
                                      title: valueHover.title,
                                      date: formatStamp(valueHover.at),
                                      score: valueHover.score,
                                    }),
                                  ),
                              h(
                                'div',
                                { className: 'dshqn-trend-legend' },
                                trendSeries.map((series) =>
                                  h(
                                    'span',
                                    { key: series.key, className: 'dshqn-stat' },
                                    h('i', { className: 'dshqn-trend-swatch dshqn-trend-line-' + (series.index % 6) }),
                                    series.title,
                                  ),
                                ),
                              ),
                            ),
                        h(
                          'div',
                          { key: 'summary', className: 'dshqn-kpi-grid' },
                          h(
                            'div',
                            { className: 'dshqn-kpi' },
                            h('span', { className: 'dshqn-kpi-value' }, String(value.workspaces.length)),
                            h('span', { className: 'dshqn-kpi-label' }, t('valueSummary')),
                          ),
                          h(
                            'div',
                            { className: 'dshqn-kpi' },
                            h('span', { className: 'dshqn-kpi-value' }, String(value.averageScore)),
                            h('span', { className: 'dshqn-kpi-label' }, t('valueAvgScore')),
                          ),
                          h(
                            'div',
                            { className: 'dshqn-kpi' },
                            h('span', { className: 'dshqn-kpi-value' }, valueSorted[0].valueScore + ' · ' + valueSorted[0].grade),
                            h('span', { className: 'dshqn-kpi-label' }, t('valueTop')),
                            h('span', { className: 'dshqn-kpi-sub' }, valueSorted[0].title),
                          ),
                        ),
                        h(
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
                        ...valueSorted.map((workspace) => {
                          const key = workspace.path || workspace.title;
                          const draft = valueDrafts[key] || { note: '', rating: '', socialNote: '', socialRating: '' };
                          const historyEntries = (settings.valueHistory || {})[key] || [];
                          const previousEntry = historyEntries.length >= 2 ? historyEntries[historyEntries.length - 2] : null;
                          const deltaValue = previousEntry === null ? null : workspace.valueScore - previousEntry.valueScore;
                          const deltaSocial = previousEntry === null ? null : workspace.socialScore - previousEntry.socialScore;
                          const trendRows = historyEntries.map((entry) => ({ value: entry.valueScore }));
                          const socialSignals = workspace.socialSignals || {};
                          const signalText = [
                            socialSignals.readme ? t('valueSignalReadme') : '',
                            socialSignals.license ? t('valueSignalLicense') : '',
                            socialSignals.tests ? t('valueSignalTests') : '',
                            socialSignals.docs ? t('valueSignalDocs') : '',
                          ]
                            .filter((entry) => entry.length > 0)
                            .join(' · ');
                          return h(
                            'section',
                            { key, className: 'dshqn-value-card' },
                            h(
                              'div',
                              { className: 'dshqn-value-head' },
                              h('span', { className: 'dshqn-row-title' }, workspace.title),
                              h(
                                'span',
                                {
                                  className:
                                    'dshqn-badge ' +
                                    (workspace.grade === 'A'
                                      ? 'dshqn-badge-success'
                                      : workspace.grade === 'B'
                                        ? 'dshqn-badge-brand'
                                        : workspace.grade === 'C'
                                          ? 'dshqn-badge-warn'
                                          : 'dshqn-badge-error'),
                                },
                                t('valueGrade') + ' ' + workspace.grade,
                              ),
                              h('span', { className: 'dshqn-badge' }, valueStageText(workspace.stage, t)),
                              h('span', { className: 'dshqn-badge' }, valueFutureText(workspace.future, t)),
                              previousEntry === null
                                ? h('span', { className: 'dshqn-stat' }, t('valueNoTrend'))
                                : h(
                                    'span',
                                    { className: 'dshqn-stat' },
                                    t('valueTrend') +
                                      ' ' +
                                      (deltaValue >= 0 ? '+' : '') +
                                      deltaValue +
                                      ' / ' +
                                      (deltaSocial >= 0 ? '+' : '') +
                                      deltaSocial,
                                  ),
                              trendRows.length >= 2
                                ? h(
                                    'svg',
                                    { viewBox: '0 0 80 24', preserveAspectRatio: 'none', className: 'dshqn-value-spark', 'aria-hidden': true },
                                    h('polyline', {
                                      points: chartPoints(trendRows, 80, 24, 2),
                                      fill: 'none',
                                      stroke: 'currentColor',
                                      strokeWidth: 1.4,
                                      strokeLinejoin: 'round',
                                      strokeLinecap: 'round',
                                    }),
                                  )
                                : null,
                              historyEntries.length > 0
                                ? h(
                                    'button',
                                    { type: 'button', className: 'dshqn-button', onClick: () => clearWorkspaceHistory(key) },
                                    valueHistoryClearKey === key ? t('valueClearWorkspaceConfirm') : t('valueClearWorkspace'),
                                  )
                                : null,
                              h('span', { style: { flex: '1 1 auto' } }),
                              h('span', { className: 'dshqn-value-score' }, String(workspace.valueScore)),
                            ),
                            workspace.path.length > 0 ? h('p', { className: 'dshqn-settings-hint' }, workspace.path) : null,
                            h(
                              'div',
                              { className: 'dshqn-brief' },
                              h('span', { className: 'dshqn-stat' }, t('valueSessions') + ' ' + workspace.sessions),
                              h('span', { className: 'dshqn-stat' }, t('valueTokens') + ' ' + formatNumber(workspace.totalTokens)),
                              h('span', { className: 'dshqn-stat' }, t('valueCost') + ' ' + formatMoney(workspace.cost)),
                              h('span', { className: 'dshqn-stat' }, t('valueActiveDays') + ' ' + workspace.activeDays),
                              h(
                                'span',
                                { className: 'dshqn-stat' },
                                t('valueLastActive') + ' ' + (workspace.lastAt === null ? '—' : formatStamp(workspace.lastAt)),
                              ),
                              h('span', { className: 'dshqn-stat' }, t('valueFiles') + ' ' + workspace.files + (workspace.truncated ? '+' : '') + ' · ' + formatBytes(workspace.bytes)),
                              h(
                                'span',
                                { className: 'dshqn-stat' },
                                t('valueRecent14') + ' ' + workspace.recent14 + ' · ' + t('valueMomentum') + ' ' + workspace.momentum,
                              ),
                            ),
                            h(
                              'div',
                              { className: 'dshqn-brief' },
                              h(
                                'span',
                                { className: 'dshqn-stat dshqn-social-head' },
                                t('valueSocial') +
                                  ' ' +
                                  (valueGradeText(workspace.socialGrade, t)) +
                                  ' · ' +
                                  t('valueSocialScore') +
                                  ' ' +
                                  workspace.socialScore,
                              ),
                              workspace.socialDomains.length > 0
                                ? h('span', { className: 'dshqn-stat' }, t('valueDomains') + ' ' + workspace.socialDomains.join('、'))
                                : null,
                              h('span', { className: 'dshqn-stat' }, t('valueSignals') + ' ' + (signalText.length > 0 ? signalText : '—')),
                            ),
                            Array.isArray(workspace.socialBreakdown) && workspace.socialBreakdown.length > 0
                              ? h(
                                  'div',
                                  { className: 'dshqn-social-deep' },
                                  h('span', { className: 'dshqn-settings-label' }, t('valueSocialDimensions')),
                                  workspace.socialBreakdown.map((dimension) =>
                                    h(
                                      'div',
                                      { key: dimension.key, className: 'dshqn-social-dim' },
                                      h('span', { className: 'dshqn-social-dim-label' }, socialDimLabel(dimension.key, t)),
                                      h(
                                        'span',
                                        { className: 'dshqn-social-dim-bar' },
                                        h('span', {
                                          className: 'dshqn-social-dim-fill',
                                          style: { width: Math.round((dimension.score / (dimension.max || 1)) * 100) + '%' },
                                        }),
                                      ),
                                      h('span', { className: 'dshqn-social-dim-score' }, dimension.score + '/' + dimension.max),
                                    ),
                                  ),
                                  Array.isArray(workspace.socialStrengths) && workspace.socialStrengths.length > 0
                                    ? h(
                                        'span',
                                        { className: 'dshqn-badge dshqn-badge-success' },
                                        t('valueSocialStrength') +
                                          ': ' +
                                          workspace.socialStrengths.map((dimensionKey) => socialDimLabel(dimensionKey, t)).join(' / '),
                                      )
                                    : null,
                                  Array.isArray(workspace.socialGaps) && workspace.socialGaps.length > 0
                                    ? h(
                                        'span',
                                        { className: 'dshqn-badge dshqn-badge-warn' },
                                        t('valueSocialGap') +
                                          ': ' +
                                          workspace.socialGaps.map((dimensionKey) => socialDimLabel(dimensionKey, t)).join(' / '),
                                      )
                                    : null,
                                  Array.isArray(workspace.socialSuggestions) && workspace.socialSuggestions.length > 0
                                    ? h(
                                        'div',
                                        { className: 'dshqn-social-suggestions' },
                                        h('span', { className: 'dshqn-settings-label' }, t('valueSocialSuggestions')),
                                        workspace.socialSuggestions.map((code) =>
                                          h('span', { key: code, className: 'dshqn-badge' }, socialSuggestionText(code, t)),
                                        ),
                                      )
                                    : null,
                                )
                              : null,
                            h(
                              'div',
                              { className: 'dshqn-value-edit' },
                              h(
                                'select',
                                {
                                  className: 'dshqn-select',
                                  value: draft.rating,
                                  'aria-label': t('valueRating'),
                                  onChange: (event) =>
                                    setValueDrafts({ ...valueDrafts, [key]: { ...draft, rating: event.target.value } }),
                                },
                                h('option', { value: '' }, t('valueUnrated')),
                                h('option', { value: 'high' }, t('valueHigh')),
                                h('option', { value: 'medium' }, t('valueMedium')),
                                h('option', { value: 'low' }, t('valueLow')),
                              ),
                              h('textarea', {
                                className: 'dshqn-body dshqn-value-note',
                                value: draft.note,
                                placeholder: t('valueNote'),
                                'aria-label': t('valueNote'),
                                onChange: (event) =>
                                  setValueDrafts({ ...valueDrafts, [key]: { ...draft, note: event.target.value } }),
                              }),
                              h(
                                'select',
                                {
                                  className: 'dshqn-select',
                                  value: draft.socialRating || '',
                                  'aria-label': t('valueSocialRating'),
                                  onChange: (event) =>
                                    setValueDrafts({ ...valueDrafts, [key]: { ...draft, socialRating: event.target.value } }),
                                },
                                h('option', { value: '' }, t('valueUnrated')),
                                h('option', { value: 'high' }, t('valueHigh')),
                                h('option', { value: 'medium' }, t('valueMedium')),
                                h('option', { value: 'low' }, t('valueLow')),
                              ),
                              h('textarea', {
                                className: 'dshqn-body dshqn-value-note',
                                value: draft.socialNote || '',
                                placeholder: t('valueSocialNote'),
                                'aria-label': t('valueSocialNote'),
                                onChange: (event) =>
                                  setValueDrafts({ ...valueDrafts, [key]: { ...draft, socialNote: event.target.value } }),
                              }),
                              h('button', { type: 'button', className: 'dshqn-button', onClick: () => saveWorkspaceNote(key) }, t('valueSave')),
                            ),
                            h('p', { className: 'dshqn-settings-hint' }, t('valueSocialHint')),
                            h('p', { className: 'dshqn-settings-hint' }, t('valueSnapshotHint')),
                          );
                        }),
                        h('p', { key: 'note', className: 'dshqn-settings-hint' }, value.note || t('valueNoteHint')),
                      ],
            )
          : undefined;

      const usageDaily = usage !== null && Array.isArray(usage.daily) ? usage.daily : [];
      const usageTop = usage !== null && Array.isArray(usage.topSessions) ? usage.topSessions : [];
      const usageCacheRate = (() => {
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
      const usageNow = new Date(usage !== null && typeof usage.generatedAt === 'number' ? usage.generatedAt : Date.now());
      const usageDaysInMonth = new Date(usageNow.getFullYear(), usageNow.getMonth() + 1, 0).getDate();
      const usageMonthToDate = usage !== null && usage.efficiency && typeof usage.efficiency.monthToDateCost === 'number' ? usage.efficiency.monthToDateCost : 0;
      const usageForecastMonthly = usageMonthToDate > 0 ? (usageMonthToDate / Math.max(1, usageNow.getDate())) * usageDaysInMonth : usageForecastDaily * 30;
      const usageMaxWorkspaceCost = usage === null ? 0 : Math.max(0.000001, ...usage.workspaces.map((row) => Number(row.cost) || 0));

      const usagePane =
        activeView === 'insights' && insightTab === 'usage'
          ? h(
              'div',
              { className: 'dshqn-usage' },
              h(SectionHead, { title: t('usageSummary'), hint: t('viewUsage') }),
              h(
                'div',
                { className: 'dshqn-toolbar' },
                h('span', { className: 'dshqn-stat' }, t('usageSummary')),
                h('span', { style: { flex: '1 1 auto' } }),
                h('button', { type: 'button', className: 'dshqn-button', onClick: loadUsage }, t('usageRefresh')),
              ),
              usageState === 'loading'
                ? h(SkeletonCards, { count: 3 })
                : usageState !== 'ready' || usage === null
                  ? h('p', { className: 'dshqn-hint' }, t('usageUnavailable'))
                  : usage.workspaces.length === 0
                    ? h(EmptyState, { icon: 'usage', title: t('usageEmpty') })
                    : [
                        h(
                          'div',
                          { key: 'summary', className: 'dshqn-kpi-grid' },
                          h(
                            'div',
                            { className: 'dshqn-kpi' },
                            h('span', { className: 'dshqn-kpi-value' }, formatNumber(usage.totals.totalTokens)),
                            h('span', { className: 'dshqn-kpi-label' }, t('usageTokens')),
                            h(
                              'span',
                              { className: 'dshqn-kpi-sub' },
                              t('usageWorkspaces') + ' ' + usage.workspaces.length + ' · ' + t('usageSessions') + ' ' + usage.totals.sessions,
                            ),
                          ),
                          h(
                            'div',
                            { className: 'dshqn-kpi' },
                            h('span', { className: 'dshqn-kpi-value' }, formatMoney(usage.totals.cost)),
                            h('span', { className: 'dshqn-kpi-label' }, t('usageCost')),
                            h('span', { className: 'dshqn-kpi-sub' }, usage.currency || 'CNY'),
                          ),
                          h(
                            'div',
                            { className: 'dshqn-kpi dshqn-kpi-success' },
                            h('span', { className: 'dshqn-kpi-value' }, Math.round(usageCacheRate * 100) + '%'),
                            h('span', { className: 'dshqn-kpi-label' }, t('usageCacheHit')),
                            h(
                              'span',
                              { className: 'dshqn-kpi-sub' },
                              t('usageInputHit') + ' ' + formatNumber(usage.totals.inputHit),
                            ),
                          ),
                          h(
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
                        ),
                        h(
                          'section',
                          { key: 'daily', className: 'dshqn-usage-daily' },
                          h(SectionHead, { title: t('usageDaily'), hint: t('usageTokens') }),
                          usageDaily.length > 1
                            ? h(
                                'svg',
                                {
                                  viewBox: '0 0 600 90',
                                  preserveAspectRatio: 'none',
                                  className: 'dshqn-usage-chart',
                                  'aria-hidden': true,
                                },
                                h('polyline', {
                                  points: chartPoints(usageDaily.map((day) => ({ value: day.totalTokens })), 600, 90, 8),
                                  fill: 'none',
                                  stroke: 'currentColor',
                                  strokeWidth: 1.6,
                                  strokeLinejoin: 'round',
                                  strokeLinecap: 'round',
                                }),
                              )
                            : null,
                          h(
                            'div',
                            { className: 'dshqn-usage-days' },
                            usageDaily.map((day) =>
                              h(
                                'span',
                                { key: day.at, className: 'dshqn-usage-day', title: formatStamp(day.at) },
                                formatStamp(day.at).split(' ')[0],
                              ),
                            ),
                          ),
                        ),
                        h(
                          'div',
                          { key: 'breakdown', className: 'dshqn-brief' },
                          h('span', { className: 'dshqn-stat' }, t('usageInputHit') + ' ' + formatNumber(usage.totals.inputHit)),
                          h('span', { className: 'dshqn-stat' }, t('usageInputMiss') + ' ' + formatNumber(usage.totals.inputMiss)),
                          h('span', { className: 'dshqn-stat' }, t('usageOutput') + ' ' + formatNumber(usage.totals.output)),
                        ),
                        h(
                          'p',
                          { key: 'pricing', className: 'dshqn-settings-hint' },
                          t('usagePricing') +
                            ' ' +
                            usage.pricing.inputHit +
                            ' · ' +
                            t('usagePricingMiss') +
                            ' ' +
                            usage.pricing.inputMiss +
                            ' · ' +
                            t('usagePricingOutput') +
                            ' ' +
                            usage.pricing.output,
                        ),
                        h(
                          'div',
                          { key: 'rows', className: 'dshqn-list' },
                          usage.workspaces.map((workspace) =>
                            h(
                              'div',
                              { key: workspace.path || workspace.title, className: 'dshqn-row dshqn-usage-row' },
                              h(
                                'span',
                                { className: 'dshqn-row-title' },
                                workspace.title + (workspace.path.length > 0 ? ' · ' + workspace.path : ''),
                              ),
                              h('span', { className: 'dshqn-row-meta' }, t('usageSessions') + ' ' + workspace.sessions),
                              h('span', { className: 'dshqn-row-meta' }, t('usageTokens') + ' ' + formatNumber(workspace.totalTokens)),
                              h('span', { className: 'dshqn-row-meta' }, t('usageInputHit') + ' ' + formatNumber(workspace.inputHit)),
                              h(
                                'span',
                                { className: 'dshqn-row-meta' },
                                t('usageCacheHit') +
                                  ' ' +
                                  Math.round(
                                    (typeof workspace.cacheHitRate === 'number'
                                      ? workspace.cacheHitRate
                                      : workspace.inputHit + workspace.inputMiss === 0
                                        ? 0
                                        : workspace.inputHit / (workspace.inputHit + workspace.inputMiss)) * 100,
                                  ) +
                                  '%',
                              ),
                              h('span', { className: 'dshqn-row-meta' }, t('usageAvgTokens') + ' ' + formatNumber(workspace.avgTokens || 0)),
                              h(
                                'span',
                                { className: 'dshqn-row-meta' },
                                workspace.lastAt === null || workspace.lastAt === undefined ? '—' : formatStamp(workspace.lastAt),
                              ),
                              h('span', { className: 'dshqn-row-meta dshqn-usage-cost' }, formatMoney(workspace.cost)),
                            ),
                          ),
                        ),
                        h(
                          'section',
                          { key: 'sessions', className: 'dshqn-usage-sessions' },
                          h(SectionHead, { title: t('usageTopSessions'), hint: String(usageTop.length) }),
                          usageTop.map((session, index) =>
                            h(
                              'div',
                              { key: session.sessionId, className: 'dshqn-usage-session' },
                              h('span', { className: 'dshqn-usage-session-rank' }, '#' + (index + 1)),
                              h('span', { className: 'dshqn-usage-session-ws' }, session.workspace || '—'),
                              h('span', { className: 'dshqn-usage-session-id' }, session.sessionId.slice(0, 8)),
                              h('span', { className: 'dshqn-usage-session-tokens' }, formatNumber(session.totalTokens)),
                              h('span', { className: 'dshqn-usage-session-cost' }, formatMoney(session.cost)),
                              h(
                                'span',
                                { className: 'dshqn-usage-session-time' },
                                session.lastAt === null || session.lastAt === undefined ? '—' : formatStamp(session.lastAt),
                              ),
                            ),
                          ),
                        ),
                        h('p', { key: 'note', className: 'dshqn-settings-hint' }, usage.note || t('usageNote')),
                      ],
            )
          : undefined;

      const systemPane =
        activeView === 'insights' && insightTab === 'system'
          ? h(
              'div',
              { className: 'dshqn-system' },
              h(SectionHead, { title: t('viewSystem') }),
              h(
                'div',
                { className: 'dshqn-toolbar' },
                h('span', { className: 'dshqn-stat' }, t('systemProfile')),
                h('span', { style: { flex: '1 1 auto' } }),
                h('button', { type: 'button', className: 'dshqn-button', onClick: loadAdmin }, t('systemRefresh')),
              ),
              adminState === 'loading'
                ? h(SkeletonCards, { count: 2 })
                : adminState !== 'ready' || admin === null
                  ? h('p', { className: 'dshqn-hint' }, t('systemUnavailable'))
                  : [
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
                        { key: 'profile', className: 'dshqn-settings-group' },
                        h('p', { className: 'dshqn-settings-label' }, t('systemProfile')),
                        h('p', { className: 'dshqn-settings-hint' }, t('systemProfileName') + ': ' + (admin.profile.name || '—')),
                        h('p', { className: 'dshqn-settings-hint' }, t('systemHome') + ': ' + admin.home),
                        admin.profile.dir.length > 0 ? h('p', { className: 'dshqn-settings-hint' }, admin.profile.dir) : null,
                        h(
                          'div',
                          { className: 'dshqn-brief' },
                          h('span', { className: 'dshqn-stat' }, t('systemBundles') + ' ' + admin.profile.bundles.length),
                          h('span', { className: 'dshqn-stat' }, t('systemDeps') + ' ' + admin.profile.dependencies.length),
                        ),
                        admin.profile.bundles.map((name) => h('span', { key: name, className: 'dshqn-kind-badge' }, name)),
                        admin.profile.dependencies.map((dependency) =>
                          h('span', { key: dependency.name, className: 'dshqn-kind-badge' }, dependency.name + ' ' + dependency.version),
                        ),
                      ),
                      h(
                        'section',
                        { key: 'data', className: 'dshqn-settings-group' },
                        h('p', { className: 'dshqn-settings-label' }, t('systemData')),
                        h('p', { className: 'dshqn-settings-hint' }, admin.data.file),
                        h(
                          'div',
                          { className: 'dshqn-brief' },
                          h('span', { className: 'dshqn-stat' }, t('systemRevision') + ' ' + admin.data.revision),
                          h('span', { className: 'dshqn-stat' }, t('systemItems') + ' ' + admin.data.items),
                          h('span', { className: 'dshqn-stat' }, t('systemTypes') + ' ' + admin.data.types),
                          h('span', { className: 'dshqn-stat' }, t('systemReviews') + ' ' + admin.data.reviews),
                          h(
                            'span',
                            { className: 'dshqn-stat' },
                            t('systemUpdated') + ' ' + (admin.data.updatedAt === null ? '—' : formatStamp(admin.data.updatedAt)),
                          ),
                        ),
                      ),
                      h(
                        'section',
                        { key: 'sessions', className: 'dshqn-settings-group' },
                        h('p', { className: 'dshqn-settings-label' }, t('systemSessions')),
                        h('p', { className: 'dshqn-settings-hint' }, admin.sessions.root),
                        h(
                          'div',
                          { className: 'dshqn-brief' },
                          h('span', { className: 'dshqn-stat' }, t('systemWorkspaces') + ' ' + admin.sessions.workspaces),
                          h('span', { className: 'dshqn-stat' }, t('systemSessionsCount') + ' ' + admin.sessions.sessions),
                        ),
                        admin.sessions.recent.length === 0
                          ? null
                          : h(
                              'div',
                              { className: 'dshqn-list' },
                              admin.sessions.recent.map((session) =>
                                h(
                                  'div',
                                  { key: session.id, className: 'dshqn-row' },
                                  h('span', { className: 'dshqn-row-title' }, session.id),
                                  h('span', { className: 'dshqn-row-meta' }, formatStamp(session.at)),
                                ),
                              ),
                            ),
                      ),
                    ],
              h(HarnessVersionManager, { key: 'harness', t }),
            )
          : undefined;

      const recordsPane =
        activeView === 'record'
          ? (() => {
              const selectedType = types.find((type) => type.id === recordTypeId) || types[0];
              const records =
                selectedType === undefined
                  ? []
                  : newestFirst(items.filter((item) => item.kind === 'record' && item.record.typeId === selectedType.id));
              const needleRecord = recordQuery.trim().toLowerCase();
              const filteredRecords = records.filter((item) => {
                if (needleRecord.length === 0) return true;
                const haystack = (item.title + ' ' + Object.values(item.record.values).map((value) => String(value)).join(' ')).toLowerCase();
                return haystack.includes(needleRecord);
              });
              const sortedRecords =
                recordSort === 'title'
                  ? filteredRecords
                      .slice()
                      .sort((left, right) => recordTitle(left, selectedType).localeCompare(recordTitle(right, selectedType)))
                  : filteredRecords;
              const selectedRecord = sortedRecords.find((item) => item.id === selectedRecordId) || sortedRecords[0];
              const fieldControls = (item) =>
                selectedType.fields.map((field) => {
                  const value = item.record.values[field.key];
                  const raw = value === undefined || value === null ? '' : String(value);
                  if (field.type === 'checkbox') {
                    return h(
                      'label',
                      { key: field.key, className: 'dshqn-flag' },
                      h('input', {
                        type: 'checkbox',
                        checked: value === true,
                        onChange: (event) =>
                          updateRecord(item.id, {
                            record: { ...item.record, values: { ...item.record.values, [field.key]: event.target.checked } },
                          }),
                      }),
                      h('span', null, field.label),
                    );
                  }
                  if (field.type === 'select') {
                    return h(
                      'label',
                      { key: field.key, className: 'dshqn-flag' },
                      h('span', null, field.label),
                      h(
                        'select',
                        {
                          className: 'dshqn-select',
                          value: raw,
                          onChange: (event) => {
                            const values = { ...item.record.values };
                            if (event.target.value === '') delete values[field.key];
                            else values[field.key] = event.target.value;
                            updateRecord(item.id, { record: { ...item.record, values } });
                          },
                        },
                        h('option', { value: '' }, '—'),
                        field.options.map((option) => h('option', { key: option, value: option }, option)),
                      ),
                    );
                  }
                  return h(
                    'label',
                    { key: field.key, className: 'dshqn-field-label' },
                    h('span', { className: 'dshqn-field-label-text' }, field.label),
                    h('input', {
                      className: 'dshqn-field',
                      type: field.type === 'date' ? 'date' : 'text',
                      inputMode: field.type === 'number' ? 'decimal' : undefined,
                      value: raw,
                      onChange: (event) => {
                        const values = { ...item.record.values };
                        if (event.target.value === '') delete values[field.key];
                        else if (field.type === 'number') {
                          const parsed = Number(event.target.value);
                          values[field.key] = Number.isFinite(parsed) ? parsed : event.target.value;
                        } else values[field.key] = event.target.value;
                        updateRecord(item.id, { record: { ...item.record, values } });
                      },
                    }),
                  );
                });
              const typeEditor =
                editingType === null
                  ? null
                  : h(
                      'section',
                      { className: 'dshqn-card' },
                      h(
                        'div',
                        { className: 'dshqn-toolbar' },
                        h('input', {
                          className: 'dshqn-field',
                          value: editingType.name,
                          placeholder: t('recordTypeName'),
                          onChange: (event) => setEditingType({ ...editingType, name: event.target.value }),
                        }),
                        h('span', { style: { flex: '1 1 auto' } }),
                        h('button', { type: 'button', className: 'dshqn-button', onClick: () => setEditingType(null) }, t('cancelEdit')),
                        h('button', { type: 'button', className: 'dshqn-button', onClick: saveType }, t('saveType')),
                        editingType.id.length > 0
                          ? h(
                              'button',
                              { type: 'button', className: 'dshqn-button', onClick: deleteType },
                              typeDeleteConfirm ? t('deleteConfirm') : t('deleteType'),
                            )
                          : null,
                      ),
                      h('p', { className: 'dshqn-group-title' }, t('recordTypeFields')),
                      editingType.id.length > 0
                        ? h(
                            'p',
                            { className: 'dshqn-settings-hint' },
                            fillTemplate(t('typeDeleteHint'), {
                              count: items.filter((item) => item.kind === 'record' && item.record.typeId === editingType.id).length,
                            }),
                          )
                        : null,
                      editingType.fields.map((field, index) =>
                        h(
                          'div',
                          { key: 'field-' + index, className: 'dshqn-toolbar' },
                          h('input', {
                            className: 'dshqn-field',
                            value: field.label,
                            placeholder: t('fieldLabel'),
                            onChange: (event) => updateField(index, { label: event.target.value }),
                          }),
                          h(
                            'select',
                            {
                              className: 'dshqn-select',
                              value: field.type,
                              onChange: (event) => updateField(index, { type: event.target.value }),
                            },
                            [
                              ['text', t('fieldText')],
                              ['number', t('fieldNumber')],
                              ['date', t('fieldDate')],
                              ['checkbox', t('fieldCheckbox')],
                              ['select', t('fieldSelect')],
                            ].map(([key, label]) => h('option', { key, value: key }, label)),
                          ),
                          field.type === 'select'
                            ? h('input', {
                                className: 'dshqn-field',
                                value: field.options.join(','),
                                placeholder: t('fieldOptions'),
                                onChange: (event) =>
                                  updateField(index, {
                                    options: event.target.value
                                      .split(',')
                                      .map((part) => part.trim())
                                      .filter((part) => part.length > 0),
                                  }),
                              })
                            : null,
                          h('button', { type: 'button', className: 'dshqn-button', onClick: () => removeTypeField(index) }, t('deleteItem')),
                        ),
                      ),
                      h('button', { type: 'button', className: 'dshqn-button', onClick: addTypeField }, t('addField')),
                    );
              return h(
                'div',
                { className: 'dshqn-records' },
                h(SectionHead, { title: t('viewRecords'), hint: types.length + ' ' + t('overviewTypes') }),
                h(
                  'div',
                  { className: 'dshqn-tabs' },
                  types.map((type) =>
                    h(
                      'button',
                      {
                        key: type.id,
                        type: 'button',
                        className: type.id === (selectedType === undefined ? '' : selectedType.id) ? 'dshqn-filter dshqn-filter-active' : 'dshqn-filter',
                        onClick: () => {
                          setRecordTypeId(type.id);
                          setSelectedRecordId(null);
                          setEditingType(null);
                          setTypeDeleteConfirm(false);
                          setRecordQuery('');
                          setRecordSort('updated');
                          setRecordBatchIds([]);
                          setViewDeleteId(null);
                          setViewSaving(false);
                        },
                      },
                      type.name,
                    ),
                  ),
                  types.length === 0 ? h('span', { className: 'dshqn-hint' }, t('recordsEmpty')) : null,
                  h('span', { style: { flex: '1 1 auto' } }),
                  h('button', { type: 'button', className: 'dshqn-button', onClick: startNewType }, t('newRecordType')),
                  selectedType !== undefined
                    ? h('button', { type: 'button', className: 'dshqn-button', onClick: () => startEditType(selectedType) }, t('editType'))
                    : null,
                ),
                typeEditor,
                selectedType === undefined || editingType !== null
                  ? null
                  : [
                      h(
                        'div',
                        { key: 'filters', className: 'dshqn-toolbar' },
                        h('input', {
                          className: 'dshqn-search',
                          type: 'search',
                          value: recordQuery,
                          placeholder: t('searchPlaceholder'),
                          'aria-label': t('searchPlaceholder'),
                          onChange: (event) => setRecordQuery(event.target.value),
                          onKeyDown: (event) => {
                            if (event.key === 'Escape') setRecordQuery('');
                          },
                        }),
                        h(
                          'button',
                          {
                            type: 'button',
                            className: recordSort === 'updated' ? 'dshqn-filter dshqn-filter-active' : 'dshqn-filter',
                            onClick: () => setRecordSort('updated'),
                          },
                          t('allSortUpdated'),
                        ),
                        h(
                          'button',
                          {
                            type: 'button',
                            className: recordSort === 'title' ? 'dshqn-filter dshqn-filter-active' : 'dshqn-filter',
                            onClick: () => setRecordSort('title'),
                          },
                          t('allSortTitle'),
                        ),
                        h('span', { style: { flex: '1 1 auto' } }),
                        viewSaving
                          ? h('input', {
                              className: 'dshqn-field',
                              value: recordViewName,
                              placeholder: t('viewNamePlaceholder'),
                              'aria-label': t('viewNamePlaceholder'),
                              onChange: (event) => setRecordViewName(event.target.value),
                              onKeyDown: (event) => {
                                if (event.key === 'Enter') saveRecordView();
                              },
                            })
                          : null,
                        viewSaving
                          ? h('button', { type: 'button', className: 'dshqn-button', onClick: saveRecordView }, t('saveView'))
                          : h('button', { type: 'button', className: 'dshqn-button', onClick: () => setViewSaving(true) }, t('newView')),
                        viewSaving
                          ? h(
                              'button',
                              {
                                type: 'button',
                                className: 'dshqn-button',
                                onClick: () => {
                                  setViewSaving(false);
                                  setRecordViewName('');
                                },
                              },
                              t('cancelEdit'),
                            )
                          : null,
                      ),
                      selectedType.views.length === 0
                        ? null
                        : h(
                            'div',
                            { key: 'views', className: 'dshqn-tabs' },
                            selectedType.views.map((view) =>
                              h(
                                'span',
                                { key: 'view-' + view.id, className: 'dshqn-view-chip' },
                                h(
                                  'button',
                                  { type: 'button', className: 'dshqn-filter', onClick: () => applyRecordView(view) },
                                  view.name,
                                ),
                                h(
                                  'button',
                                  {
                                    type: 'button',
                                    className: viewDeleteId === view.id ? 'dshqn-view-delete dshqn-view-delete-armed' : 'dshqn-view-delete',
                                    'aria-label': t('deleteItem'),
                                    title: viewDeleteId === view.id ? t('deleteConfirm') : t('deleteItem'),
                                    onClick: () => deleteRecordView(view.id),
                                  },
                                  '×',
                                ),
                              ),
                            ),
                          ),
                      h(
                        'div',
                        { key: 'list', className: 'dshqn-list' },
                        h(
                          'div',
                          { className: 'dshqn-toolbar' },
                          h('span', { className: 'dshqn-stat' }, fillTemplate(t('batchCount'), { count: filteredRecords.length })),
                          recordBatchIds.length > 0
                            ? h('span', { className: 'dshqn-stat' }, fillTemplate(t('batchSelected'), { count: recordBatchIds.length }))
                            : null,
                          h('span', { style: { flex: '1 1 auto' } }),
                          recordBatchIds.length > 0
                            ? h(
                                'button',
                                { type: 'button', className: 'dshqn-button', onClick: deleteRecordBatch },
                                recordBatchConfirm ? t('deleteConfirm') : t('batchDelete'),
                              )
                            : null,
                          h('button', { type: 'button', className: 'dshqn-button', onClick: createRecord }, t('newRecord')),
                        ),
                        sortedRecords.length === 0
                          ? h(EmptyState, { icon: 'record', title: t('emptyRecords') })
                          : sortedRecords.map((item) =>
                              h(TableRow, {
                                key: item.id,
                                title: recordTitle(item, selectedType) || t('untitled'),
                                badge: selectedType.name,
                                meta: formatStamp(item.updatedAt),
                                checked: recordBatchIds.includes(item.id),
                                checkboxLabel: t('batchSelected'),
                                onToggle: () => toggleRecordBatch(item.id),
                                onOpen: () => {
                                  setSelectedRecordId(item.id);
                                  setRecordConfirm(false);
                                },
                              }),
                            ),
                      ),
                      h(
                        'section',
                        { key: 'editor', className: 'dshqn-card' },
                        selectedRecord === undefined
                          ? h(EmptyState, { icon: 'record', title: t('emptyRecords') })
                          : [
                              h(
                                'div',
                                { key: 'head', className: 'dshqn-toolbar' },
                                h('input', {
                                  className: 'dshqn-title-input',
                                  value: selectedRecord.title,
                                  placeholder: t('recordTitlePlaceholder'),
                                  onChange: (event) => updateRecord(selectedRecord.id, { title: event.target.value }),
                                }),
                                h(
                                  'button',
                                  { type: 'button', className: 'dshqn-button', onClick: () => deleteRecord(selectedRecord.id) },
                                  recordConfirm ? t('deleteConfirm') : t('deleteItem'),
                                ),
                              ),
                              ...fieldControls(selectedRecord),
                              h(
                                'footer',
                                { key: 'footer', className: 'dshqn-footer' },
                                h('span', { className: 'dshqn-count' }, formatStamp(selectedRecord.updatedAt)),
                              ),
                            ],
                      ),
                    ],
              );
            })()
          : undefined;

      const allPane =
        activeView === 'all'
          ? (() => {
              const kindMatch = (item) => {
                if (allKind === 'all') return true;
                if (allKind === 'health') return item.kind === 'metric' || item.kind === 'med';
                return item.kind === allKind;
              };
              const rows = newestFirst(items).filter(kindMatch);
              const priorityRank = { high: 0, normal: 1, low: 2 };
              const sorted = rows.slice().sort((left, right) => {
                if (allSort === 'title') {
                  return (left.title || left.body).localeCompare(right.title || right.body) || right.updatedAt - left.updatedAt;
                }
                if (allSort === 'priority') {
                  return (priorityRank[left.priority] ?? 1) - (priorityRank[right.priority] ?? 1) || right.updatedAt - left.updatedAt;
                }
                if (allSort === 'due') {
                  const leftDue = left.due === null ? Number.POSITIVE_INFINITY : left.due;
                  const rightDue = right.due === null ? Number.POSITIVE_INFINITY : right.due;
                  return leftDue - rightDue || right.updatedAt - left.updatedAt;
                }
                return right.updatedAt - left.updatedAt;
              });
              const pageSize = 20;
              const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
              const page = Math.min(Math.max(1, allPage), totalPages);
              const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);
              const chosen = batchIds.filter((id) => rows.some((item) => item.id === id));
              const typeName = (typeId) => {
                const type = types.find((entry) => entry.id === typeId);
                return type === undefined ? '' : type.name;
              };
              const chips = [
                ['all', t('filterAll')],
                ['note', t('viewNotes')],
                ['task', t('viewTasks')],
                ['card', t('viewCards')],
                ['health', t('viewHealth')],
                ['record', t('viewRecords')],
              ];
              return h(
                'div',
                { className: 'dshqn-all-page' },
                h(SectionHead, { title: t('viewAll'), hint: fillTemplate(t('batchCount'), { count: items.length }) }),
                h(
                  'div',
                  { className: 'dshqn-tabs' },
                  chips.map(([id, label]) =>
                    h(
                      'button',
                      {
                        key: id,
                        type: 'button',
                        className: allKind === id ? 'dshqn-filter dshqn-filter-active' : 'dshqn-filter',
                        onClick: () => {
                          setAllKind(id);
                          setAllPage(1);
                          clearBatch();
                        },
                      },
                      label,
                    ),
                  ),
                ),
                h(
                  'div',
                  { className: 'dshqn-tabs' },
                  [
                    ['updated', t('allSortUpdated')],
                    ['title', t('allSortTitle')],
                    ['priority', t('allSortPriority')],
                    ['due', t('allSortDue')],
                  ].map(([id, label]) =>
                    h(
                      'button',
                      {
                        key: id,
                        type: 'button',
                        className: allSort === id ? 'dshqn-filter dshqn-filter-active' : 'dshqn-filter',
                        onClick: () => {
                          setAllSort(id);
                          setAllPage(1);
                        },
                      },
                      label,
                    ),
                  ),
                ),
                h(
                  'div',
                  { className: 'dshqn-all-bar' },
                  h('span', { className: 'dshqn-stat' }, fillTemplate(t('batchCount'), { count: sorted.length })),
                  chosen.length > 0
                    ? h('span', { className: 'dshqn-stat' }, fillTemplate(t('batchSelected'), { count: chosen.length }))
                    : null,
                  h('span', { style: { flex: '1 1 auto' } }),
                  chosen.length > 0
                    ? h(
                        'div',
                        { className: 'dshqn-actions' },
                        h('button', { type: 'button', className: 'dshqn-button', onClick: () => batchApply('complete') }, t('batchComplete')),
                        h('button', { type: 'button', className: 'dshqn-button', onClick: () => batchApply('reopen') }, t('batchReopen')),
                        h('button', { type: 'button', className: 'dshqn-button', onClick: () => batchPriority('high') }, t('priorityHigh')),
                        h('button', { type: 'button', className: 'dshqn-button', onClick: () => batchPriority('normal') }, t('priorityNormal')),
                        h('button', { type: 'button', className: 'dshqn-button', onClick: () => batchPriority('low') }, t('priorityLow')),
                        h(
                          'button',
                          { type: 'button', className: 'dshqn-button', onClick: () => batchApply('delete') },
                          batchConfirm ? t('deleteConfirm') : t('batchDelete'),
                        ),
                        h('button', { type: 'button', className: 'dshqn-button', onClick: clearBatch }, t('batchClear')),
                      )
                    : null,
                ),
                rows.length === 0
                  ? h(EmptyState, { icon: 'all', title: t('allEmpty'), hint: t('overviewQuick') })
                  : h(
                      'div',
                      { className: 'dshqn-list' },
                      pageRows.map((item) =>
                        h(TableRow, {
                          key: item.id,
                          title: itemTitle(item) || t('untitled'),
                          badge: kindLabel(item.kind, t),
                          meta: [
                            item.kind === 'task'
                              ? item.status === 'done'
                                ? t('taskDone')
                                : t('taskOpen')
                              : item.kind === 'card'
                                ? reviewDueLabel(item.review, t, nowMs)
                                : item.kind === 'record'
                                  ? typeName(item.record.typeId)
                                  : '',
                            formatStamp(item.updatedAt),
                          ],
                          checked: batchIds.includes(item.id),
                          checkboxLabel: t('batchSelected'),
                          onToggle: () => toggleBatch(item.id),
                          onOpen: () => goToItem(item),
                        }),
                      ),
                    ),
                totalPages > 1
                  ? h(
                      'div',
                      { className: 'dshqn-all-bar' },
                      h(
                        'button',
                        { type: 'button', className: 'dshqn-button', disabled: page <= 1, onClick: () => setAllPage(page - 1) },
                        t('pagePrev'),
                      ),
                      h('span', { className: 'dshqn-stat' }, fillTemplate(t('pageInfo'), { page, total: totalPages })),
                      h(
                        'button',
                        { type: 'button', className: 'dshqn-button', disabled: page >= totalPages, onClick: () => setAllPage(page + 1) },
                        t('pageNext'),
                      ),
                    )
                  : null,
              );
            })()
          : undefined;

      const calendarPane =
        activeView === 'task' && taskLayout === 'calendar'
          ? (() => {
              const monthDate = new Date(calendarMonth);
              const monthKey = monthDate.getFullYear() + '-' + monthDate.getMonth();
              const firstDay = new Date(calendarMonth);
              firstDay.setDate(1);
              const gridStart = new Date(firstDay);
              gridStart.setDate(1 - ((firstDay.getDay() + 6) % 7));
              gridStart.setHours(0, 0, 0, 0);
              const days = Array.from({ length: 42 }, (_, index) => {
                const date = new Date(gridStart);
                date.setDate(gridStart.getDate() + index);
                return date.getTime();
              });
              const weekdayLabels = Array.from({ length: 7 }, (_, index) => {
                const date = new Date(2024, 0, 1 + index);
                try {
                  return date.toLocaleDateString(undefined, { weekday: 'short' });
                } catch (error) {
                  return String(index + 1);
                }
              });
              const eventsCache = new Map();
              const eventsOn = (dayStart) => {
                if (eventsCache.has(dayStart)) return eventsCache.get(dayStart);
                const dayEnd = dayStart + 86400000;
                const events = [];
                for (const item of items) {
                  if (item.kind === 'task' && item.due !== null && item.due >= dayStart && item.due < dayEnd) {
                    events.push({
                      key: item.id,
                      kind: 'task',
                      item,
                      time: formatClock(item.due),
                      label: itemTitle(item) || t('untitled'),
                      tone: item.status === 'done' ? 'done' : item.due < nowMs ? 'overdue' : 'task',
                    });
                  } else if (item.kind === 'card' && item.review.dueAt !== null && item.review.dueAt >= dayStart && item.review.dueAt < dayEnd) {
                    events.push({
                      key: item.id + '-review',
                      kind: 'card',
                      item,
                      time: formatClock(item.review.dueAt),
                      label: itemTitle(item) || t('untitled'),
                      tone: 'review',
                    });
                  } else if (calendarMeds && item.kind === 'med' && item.health.active && item.health.times.length > 0) {
                    events.push({
                      key: item.id + '-med',
                      kind: 'med',
                      item,
                      time: item.health.times[0],
                      medTimes: item.health.times,
                      label: item.health.times.length > 1 ? fillTemplate(t('calendarMedGroup'), { title: itemTitle(item) || t('untitled'), count: item.health.times.length }) : itemTitle(item) || t('untitled'),
                      tone: 'med',
                    });
                  }
                }
                const sorted = events.sort((left, right) => left.time.localeCompare(right.time));
                eventsCache.set(dayStart, sorted);
                return sorted;
              };
              const shiftMonth = (delta) => {
                const date = new Date(calendarMonth);
                date.setMonth(date.getMonth() + delta);
                date.setDate(1);
                setCalendarMonth(date.getTime());
              };
              const goToday = () => {
                const date = new Date();
                date.setHours(0, 0, 0, 0);
                setCalendarSelected(date.getTime());
                setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1).getTime());
              };
              const selectedEvents = eventsOn(calendarSelected);
              const dayKeyOfMonth = (ms) => {
                const date = new Date(ms);
                return date.getFullYear() + '-' + date.getMonth();
              };
              const todayStart = dayStart.getTime();
              const upcomingTimeline = Array.from({ length: 7 }, (_, index) => {
                const at = todayStart + index * 86400000;
                return { at, events: eventsOn(at) };
              }).filter((day) => day.events.length > 0);
              const monthLabel = fillTemplate(t('calendarMonthFmt'), {
                year: new Date(calendarMonth).getFullYear(),
                month: new Date(calendarMonth).getMonth() + 1,
              });
              const monthEventCount = days.reduce((count, day) => (dayKeyOfMonth(day) === monthKey ? count + eventsOn(day).length : count), 0);
              return h(
                'div',
                { className: 'dshqn-calendar' },
                h(
                  'div',
                  { className: 'dshqn-calendar-bar' },
                  h(
                    'div',
                    { className: 'dshqn-calendar-nav' },
                    h('button', { type: 'button', className: 'dshqn-button', onClick: () => shiftMonth(-1), 'aria-label': '‹' }, '‹'),
                    h('span', { className: 'dshqn-calendar-month' }, monthLabel),
                    h('button', { type: 'button', className: 'dshqn-button', onClick: () => shiftMonth(1), 'aria-label': '›' }, '›'),
                    h('button', { type: 'button', className: 'dshqn-button', onClick: goToday }, t('calendarToday')),
                    h('button', { type: 'button', className: calendarMeds ? 'dshqn-filter dshqn-filter-active' : 'dshqn-filter', 'aria-pressed': calendarMeds, title: t('calendarMedsHint'), onClick: () => setCalendarMeds((value) => !value) }, t('calendarMeds')),
                  ),
                  h(
                    'span',
                    { className: 'dshqn-calendar-total' },
                    fillTemplate(t('batchCount'), { count: monthEventCount }),
                  ),
                ),
                h(
                  'div',
                  { className: 'dshqn-calendar-weekdays', 'aria-hidden': true },
                  weekdayLabels.map((label, index) => h('span', { key: index, className: 'dshqn-calendar-weekday' }, label)),
                ),
                h(
                  'div',
                  { className: 'dshqn-calendar-grid' },
                  days.map((dayStartMs) => {
                    const date = new Date(dayStartMs);
                    const inMonth = dayKeyOfMonth(dayStartMs) === monthKey;
                    const classes = ['dshqn-calendar-day'];
                    if (!inMonth) classes.push('dshqn-calendar-out');
                    if (dayStartMs === todayStart) classes.push('dshqn-calendar-today');
                    if (dayStartMs === calendarSelected) classes.push('dshqn-calendar-selected');
                    const events = eventsOn(dayStartMs);
                    return h(
                      'button',
                      {
                        key: dayStartMs,
                        type: 'button',
                        className: classes.join(' '),
                        onClick: () => setCalendarSelected(dayStartMs),
                        'aria-label': formatStamp(dayStartMs) + (events.length > 0 ? ' · ' + fillTemplate(t('batchCount'), { count: events.length }) : ''),
                        'aria-pressed': dayStartMs === calendarSelected,
                      },
                      h('span', { className: 'dshqn-calendar-date' }, String(date.getDate())),
                      events.slice(0, 3).map((event) =>
                        h(
                          'span',
                          {
                            key: event.key,
                            className: 'dshqn-calendar-chip dshqn-calendar-chip-' + event.tone,
                            title: event.medTimes !== undefined && event.medTimes.length > 1 ? event.medTimes.join('/') + ' · ' + event.label : event.time + ' ' + event.label,
                          },
                          event.time + ' ' + event.label,
                        ),
                      ),
                      events.length > 3
                        ? h(
                            'span',
                            { className: 'dshqn-calendar-more' },
                            fillTemplate(t('calendarMore'), { count: events.length - 3 }),
                          )
                        : null,
                    );
                  }),
                ),
                h(
                  'div',
                  { className: 'dshqn-calendar-detail' },
                  h(SectionHead, {
                    title: formatStamp(calendarSelected),
                    hint: selectedEvents.length === 0 ? null : fillTemplate(t('batchCount'), { count: selectedEvents.length }),
                  }),
                  selectedEvents.length === 0
                    ? h(EmptyState, { icon: 'calendar', title: t('calendarDayEmpty') })
                    : h(
                        'div',
                        { className: 'dshqn-calendar-events' },
                        selectedEvents.map((event) =>
                          h(
                            'button',
                            {
                              key: event.key,
                              type: 'button',
                              className: 'dshqn-calendar-event dshqn-calendar-event-' + event.tone,
                              onClick: () => goToItem(event.item),
                            },
                            h(Icon, { name: KIND_META[event.kind].icon, size: 14 }),
                            h('span', { className: 'dshqn-calendar-event-time' }, event.time),
                            h('span', { className: 'dshqn-calendar-event-title' }, event.label),
                                event.medTimes !== undefined && event.medTimes.length > 1
                                  ? h('span', { className: 'dshqn-settings-hint' }, event.medTimes.join(' / '))
                                  : null,
                          ),
                        ),
                      ),
                ),
                h(
                  'section',
                  { key: 'timeline', className: 'dshqn-plan-timeline' },
                  h(SectionHead, { title: t('planTimeline'), hint: t('viewPlan') }),
                  upcomingTimeline.length === 0
                    ? h('p', { className: 'dshqn-settings-hint' }, t('planTimelineEmpty'))
                    : upcomingTimeline.map((day) =>
                        h(
                          'div',
                          { key: day.at, className: 'dshqn-timeline-day' },
                          h('span', { className: 'dshqn-timeline-date' }, formatStamp(day.at).split(' ')[0]),
                          h(
                            'div',
                            { className: 'dshqn-timeline-events' },
                            day.events.map((event) =>
                              h(
                                'button',
                                {
                                  key: event.key,
                                  type: 'button',
                                  className: 'dshqn-timeline-event dshqn-calendar-event-' + event.tone,
                                  onClick: () => goToItem(event.item),
                                },
                                h(Icon, { name: KIND_META[event.kind].icon, size: 14 }),
                                h('span', { className: 'dshqn-calendar-event-time' }, event.time),
                                h('span', { className: 'dshqn-calendar-event-title' }, event.label),
                                event.medTimes !== undefined && event.medTimes.length > 1
                                  ? h('span', { className: 'dshqn-settings-hint' }, event.medTimes.join(' / '))
                                  : null,
                              ),
                            ),
                          ),
                        ),
                      ),
                ),
              );
            })()
          : undefined;

      const insightsPane =
        activeView === 'insights'
          ? h(
              'div',
              { className: 'dshqn-insights' },
              h(
                'div',
                { className: 'dshqn-insights-bar' },
                h(Segmented, {
                  items: [
                    { id: 'value', label: t('viewValue') },
                    { id: 'usage', label: t('viewUsage') },
                    { id: 'optimizer', label: t('optimizerTitle') },
                    { id: 'schedule', label: t('scheduleLogTitle') },
                    { id: 'system', label: t('viewSystem') },
                  ],
                  value: insightTab,
                  onChange: setInsightTab,
                  label: t('viewInsights'),
                }),
              ),
              insightTab === 'usage'
                ? usagePane
                : insightTab === 'system'
                  ? systemPane
                  : insightTab === 'optimizer'
                    ? h(OptimizerContent, { t, onOpenPlugins: typeof props.selectPanel === 'function' ? () => props.selectPanel('plugins') : null, budget: typeof settings.tokenBudget === 'number' ? settings.tokenBudget : 0, onBudget: (value) => saveSettings((current) => ({ ...current, tokenBudget: value })), onOpenSession: typeof props.openSession === 'function' ? props.openSession : null, monthlyBudget: typeof settings.tokenBudgetMonthly === 'number' ? settings.tokenBudgetMonthly : 0, schedule: typeof settings.cleanupSchedule === 'string' ? settings.cleanupSchedule : 'off', onMonthlyBudget: (value) => saveSettings((current) => ({ ...current, tokenBudgetMonthly: value })), onSchedule: (value) => saveSettings((current) => ({ ...current, cleanupSchedule: value })), webhook: typeof settings.budgetWebhookUrl === 'string' ? settings.budgetWebhookUrl : '', onWebhook: (value) => saveSettings((current) => ({ ...current, budgetWebhookUrl: value })), webhookTemplate: typeof settings.budgetWebhookTemplate === 'string' ? settings.budgetWebhookTemplate : 'generic', onWebhookTemplate: (value) => saveSettings((current) => ({ ...current, budgetWebhookTemplate: value })), scheduleTime: typeof settings.cleanupScheduleTime === 'string' ? settings.cleanupScheduleTime : '03:00', onScheduleTime: (value) => saveSettings((current) => ({ ...current, cleanupScheduleTime: value })), cron: typeof settings.cleanupScheduleCron === 'string' ? settings.cleanupScheduleCron : '', onCron: (value) => saveSettings((current) => ({ ...current, cleanupScheduleCron: value })), cronTimezone: typeof settings.cleanupScheduleTimezone === 'string' ? settings.cleanupScheduleTimezone : 'local', onCronTimezone: (value) => saveSettings((current) => ({ ...current, cleanupScheduleTimezone: value })), trashPresets: Array.isArray(settings.trashPresets) ? settings.trashPresets : [], onTrashPresets: (value) => saveSettings((current) => ({ ...current, trashPresets: value })) })
                    : insightTab === 'schedule'
                      ? h(ScheduleLogContent, { t, scheduleMode: settings.cleanupSchedule || 'off', onSchedule: (value) => saveSettings((current) => ({ ...current, cleanupSchedule: value })), scheduleTime: settings.cleanupScheduleTime || '03:00', onScheduleTime: (value) => saveSettings((current) => ({ ...current, cleanupScheduleTime: value })), cron: settings.cleanupScheduleCron || '', onCron: (value) => saveSettings((current) => ({ ...current, cleanupScheduleCron: value })), cronTimezone: settings.cleanupScheduleTimezone || 'local', onCronTimezone: (value) => saveSettings((current) => ({ ...current, cleanupScheduleTimezone: value })), trashPresets: Array.isArray(settings.trashPresets) ? settings.trashPresets : [], onTrashPresets: (value) => saveSettings((current) => ({ ...current, trashPresets: value })) })
                      : valuePane,
            )
          : undefined;

      const overviewPane =
        activeView === 'overview'
          ? (() => {
              const counts = dueCounts(items);
              const cards = items.filter((item) => item.kind === 'card');
              const dueCards = cards.filter((item) => {
                const review = normalizeReview(item.review);
                return review.dueAt === null || review.dueAt <= nowMs;
              }).length;
              const weekReviews = normalizeReviewLog(reviewsRef.current).filter(
                (record) => record.at >= nowMs - 7 * 24 * 60 * 60 * 1000,
              ).length;
              const todayMetrics = items.filter(
                (item) => item.kind === 'metric' && dayKeyOf(item.health.at === null ? item.createdAt : item.health.at) === dayKeyOf(nowMs),
              ).length;
              const meds = activeMedications(items);
              const recordItems = items.filter((item) => item.kind === 'record');
              const recent = newestFirst(items).slice(0, 6);
              const pinned = prefs.pins
                .map((id) => items.find((item) => item.id === id))
                .filter((item) => item !== undefined)
                .slice(0, 6);
              const daySpan = (values, days) => {
                const buckets = new Array(days).fill(0);
                const start = new Date(nowMs);
                start.setHours(0, 0, 0, 0);
                const startMs = start.getTime();
                for (const value of values) {
                  const offset = Math.floor((value - startMs) / 86400000);
                  if (offset >= 0 && offset < days) buckets[offset] += 1;
                }
                return buckets;
              };
              const forwardSpan = (values, days) => {
                const buckets = new Array(days).fill(0);
                for (const value of values) {
                  const offset = Math.max(0, Math.floor((value - nowMs) / 86400000));
                  if (offset < days) buckets[offset] += 1;
                }
                return buckets;
              };
              const taskSpark = forwardSpan(
                items.filter((item) => item.kind === 'task' && item.status === 'open' && item.due !== null).map((item) => item.due),
                7,
              );
              const cardSpark = forwardSpan(
                items.filter((item) => item.kind === 'card').map((item) => (item.review.dueAt === null ? nowMs : item.review.dueAt)),
                7,
              );
              const reviewSpark = daySpan(normalizeReviewLog(reviewsRef.current).map((record) => record.at), 7);
              const healthSpark = daySpan(
                items.filter((item) => item.kind === 'metric').map((item) => (item.health.at === null ? item.createdAt : item.health.at)),
                7,
              );
              const recordSpark = daySpan(items.filter((item) => item.kind === 'record').map((item) => item.createdAt), 7);
              const kpi = (key, icon, label, value, sub, onClick, tone, spark) =>
                h(
                  'button',
                  {
                    key,
                    type: 'button',
                    className: 'dshqn-kpi' + (tone === undefined ? '' : ' dshqn-kpi-' + tone),
                    onClick,
                  },
                  h(
                    'span',
                    { className: 'dshqn-kpi-top' },
                    h('span', { className: 'dshqn-kpi-icon', 'aria-hidden': true }, h(Icon, { name: icon, size: 14 })),
                    h('span', { className: 'dshqn-kpi-label' }, label),
                  ),
                  h('span', { className: 'dshqn-kpi-value' }, String(value)),
                  Array.isArray(spark)
                    ? h(
                        'svg',
                        {
                          className: 'dshqn-kpi-spark',
                          viewBox: '0 0 60 20',
                          preserveAspectRatio: 'none',
                          'aria-hidden': true,
                        },
                        h('polyline', {
                          points: chartPoints(spark.map((count) => ({ value: count })), 60, 20, 2),
                          fill: 'none',
                          stroke: 'currentColor',
                          strokeWidth: 1.4,
                          strokeLinejoin: 'round',
                          strokeLinecap: 'round',
                        }),
                      )
                    : null,
                  sub === null ? null : h('span', { className: 'dshqn-kpi-sub' }, sub),
                );
              const quick = (key, icon, label, hint, onPick) =>
                h(
                  'button',
                  { key, type: 'button', className: 'dshqn-quick-card', onClick: onPick },
                  h('span', { className: 'dshqn-quick-icon', 'aria-hidden': true }, h(Icon, { name: icon, size: 15 })),
                  h(
                    'span',
                    { className: 'dshqn-quick-copy' },
                    h('span', { className: 'dshqn-quick-title' }, label),
                    h('span', { className: 'dshqn-quick-hint' }, hint),
                  ),
                );
              return h(
                'div',
                { className: 'dshqn-overview-page' },
                h(
                  'section',
                  { className: 'dshqn-hero' },
                  h(
                    'div',
                    { className: 'dshqn-hero-main' },
                    h('span', { className: 'dshqn-hero-kicker' }, formatStamp(nowMs)),
                    h('h2', { className: 'dshqn-hero-title' }, t('overviewAtGlance')),
                    h(
                      'p',
                      { className: 'dshqn-hero-hint' },
                      t('kpiTodayDue') +
                        ' ' +
                        counts.today +
                        ' · ' +
                        t('kpiOverdue') +
                        ' ' +
                        counts.overdue +
                        ' · ' +
                        t('kpiDueCards') +
                        ' ' +
                        dueCards,
                    ),
                  ),
                  h(
                    'div',
                    { className: 'dshqn-hero-actions' },
                    h(
                      'button',
                      { type: 'button', className: 'dshqn-button dshqn-button-primary', onClick: () => quickCreate('task') },
                      h(Icon, { name: 'plus', size: 14 }),
                      t('newTask'),
                    ),
                    h('button', { type: 'button', className: 'dshqn-button', onClick: () => quickCreate('note') }, t('newNote')),
                  ),
                ),
                h(
                  'div',
                  { className: 'dshqn-kpi-grid' },
                  kpi(
                    'tasks',
                    'task',
                    t('viewTasks'),
                    counts.today + counts.overdue,
                    t('kpiTodayDue') + ' ' + counts.today + ' · ' + t('kpiOverdue') + ' ' + counts.overdue,
                    () => {
                      changeView('task');
                      setTaskFilter('today');
                    },
                    counts.overdue > 0 ? 'warn' : 'success',
                    taskSpark,
                  ),
                  kpi('cards', 'card', t('kpiDueCards'), dueCards, t('viewCards'), () => changeView('card'), undefined, cardSpark),
                  kpi('reviews', 'spark', t('kpiWeekReviews'), weekReviews, t('viewCards'), () => changeView('card'), 'success', reviewSpark),
                  kpi(
                    'health',
                    'health',
                    t('kpiHealthToday'),
                    todayMetrics,
                    meds.length > 0 ? t('kpiMedsToday') + ' ' + meds.length : t('viewHealth'),
                    () => changeView('health'),
                    undefined,
                    healthSpark,
                  ),
                  kpi('records', 'record', t('kpiRecords'), recordItems.length, types.length + ' ' + t('overviewTypes'), () => changeView('record'), undefined, recordSpark),
                ),
                pinned.length === 0
                  ? null
                  : h(
                      'section',
                      { className: 'dshqn-overview-block' },
                      h(SectionHead, { title: t('overviewPinned'), hint: String(pinned.length) }),
                      h(
                        'div',
                        { className: 'dshqn-overview-list' },
                        pinned.map((item) =>
                          h(OverviewRow, {
                            key: item.id,
                            item,
                            t,
                            icon: 'pin',
                            onOpen: () => goToItem(item),
                            trailing: h(
                              'button',
                              {
                                type: 'button',
                                className: 'dshqn-icon-button',
                                title: t('unpinItem'),
                                'aria-label': t('unpinItem'),
                                onClick: (event) => {
                                  event.stopPropagation();
                                  togglePin(item.id);
                                },
                              },
                              h(Icon, { name: 'pin', size: 13 }),
                            ),
                          }),
                        ),
                      ),
                    ),
                h(
                  'section',
                  { className: 'dshqn-overview-block' },
                  h(SectionHead, { title: t('overviewBrief') }),
                  h(
                    'div',
                    { className: 'dshqn-brief' },
                    h(
                      'span',
                      { className: 'dshqn-hero-chip' },
                      h(Icon, { key: 'icon', name: 'task', size: 13 }),
                      t('kpiTodayDue') + ' ' + counts.today + ' · ' + t('kpiOverdue') + ' ' + counts.overdue,
                    ),
                    h(
                      'span',
                      { className: 'dshqn-hero-chip' },
                      h(Icon, { key: 'icon', name: 'card', size: 13 }),
                      t('kpiDueCards') + ' ' + dueCards,
                    ),
                    h(
                      'span',
                      { className: 'dshqn-hero-chip' },
                      h(Icon, { key: 'icon', name: 'spark', size: 13 }),
                      t('kpiWeekReviews') + ' ' + weekReviews,
                    ),
                    h(
                      'span',
                      { className: 'dshqn-hero-chip' },
                      h(Icon, { key: 'icon', name: 'health', size: 13 }),
                      t('kpiMedsToday') +
                        ' ' +
                        (meds.length === 0
                          ? 0
                          : meds.map((entry) => entry.health.times.join('/') + ' ' + (entry.title || t('untitled'))).join('；')),
                    ),
                  ),
                ),
                h(
                  'section',
                  { className: 'dshqn-overview-block' },
                  h(SectionHead, { title: t('overviewQuick') }),
                  h(
                    'div',
                    { className: 'dshqn-quick-grid' },
                    ...['note', 'task', 'card', 'metric', 'med', 'record'].map((kind) => {
                      const meta = KIND_META[kind];
                      const onPick =
                        kind === 'record'
                          ? () => {
                              changeView('record');
                              if (types.length === 0) startNewType();
                            }
                          : () => quickCreate(kind);
                      return quick(kind, meta.icon, t(meta.newKey), t(meta.hintKey), onPick);
                    }),
                  ),
                ),
                h(
                  'section',
                  { className: 'dshqn-overview-block' },
                  h(SectionHead, {
                    title: t('overviewRecent'),
                    hint: recent.length === 0 ? null : fillTemplate(t('batchCount'), { count: items.length }),
                  }),
                  recent.length === 0
                    ? h(EmptyState, { icon: 'spark', title: t('overviewClear'), hint: t('overviewQuick') })
                    : h(
                        'div',
                        { className: 'dshqn-overview-list' },
                        recent.map((item) =>
                          h(OverviewRow, {
                            key: item.id,
                            item,
                            t,
                            icon: viewIconOf(viewOfKind(item.kind)),
                            onOpen: () => goToItem(item),
                          }),
                        ),
                      ),
                ),
                types.length === 0
                  ? null
                  : h(
                      'section',
                      { className: 'dshqn-overview-block' },
                      h(SectionHead, {
                        title: t('overviewTypes'),
                        hint: types.length + ' ' + t('overviewTypes'),
                        action: h(
                          'button',
                          {
                            type: 'button',
                            className: 'dshqn-button',
                            onClick: () => {
                              changeView('record');
                              startNewType();
                            },
                          },
                          h(Icon, { name: 'plus', size: 14 }),
                          t('newRecordType'),
                        ),
                      }),
                      h(
                        'div',
                        { className: 'dshqn-tabs' },
                        types.map((type) =>
                          h(
                            'button',
                            {
                              key: type.id,
                              type: 'button',
                              className: 'dshqn-filter',
                              onClick: () => {
                                changeView('record');
                                setRecordTypeId(type.id);
                              },
                            },
                            type.name + ' · ' + recordItems.filter((item) => item.record.typeId === type.id).length,
                          ),
                        ),
                      ),
                    ),
              );
            })()
          : undefined;

      const reviewCard =
        reviewing && reviewQueue.length > 0 ? items.find((item) => item.id === reviewQueue[reviewIndex]) : undefined;
      const todayReviews = normalizeReviewLog(reviewsRef.current).filter((record) => dayKeyOf(record.at) === dayKeyOf(nowMs)).length;
      const reviewGoal = Math.max(1, prefs.reviewGoal);
      const reviewPercent = Math.min(100, Math.round((todayReviews / reviewGoal) * 100));
      const reviewPane = reviewing
        ? h(
            'div',
            { className: 'dshqn-review' },
            h(
              'div',
              { className: 'dshqn-review-head' },
              h(
                'div',
                { className: 'dshqn-review-goal' },
                h('span', { className: 'dshqn-review-progress' }, reviewIndex + 1 + ' / ' + reviewQueue.length),
                h('span', { className: 'dshqn-review-progress' }, fillTemplate(t('reviewProgress'), { done: todayReviews, goal: reviewGoal })),
                h(
                  'span',
                  { className: 'dshqn-review-bar', role: 'img', 'aria-label': fillTemplate(t('reviewProgress'), { done: todayReviews, goal: reviewGoal }) },
                  h('span', { className: 'dshqn-review-bar-fill', style: { width: reviewPercent + '%' } }),
                ),
              ),
              h(
                'div',
                { className: 'dshqn-review-actions' },
                lastRating !== null
                  ? h('button', { type: 'button', className: 'dshqn-button', onClick: undoLastRating }, t('reviewUndo'))
                  : null,
                h(
                  'button',
                  { type: 'button', className: 'dshqn-button', onClick: () => setFocusMode((value) => !value) },
                  focusMode ? t('focusExit') : t('focusMode'),
                ),
                h('button', { type: 'button', className: 'dshqn-button', onClick: stopReview }, t('stopReview')),
              ),
            ),
            h('p', { className: 'dshqn-review-keys' }, t('reviewKeysHint')),
            h(
              'div',
              { className: 'dshqn-review-card' },
              h('p', { className: 'dshqn-review-label' }, t('cardFront')),
              h('p', { className: 'dshqn-review-text' }, reviewCard === undefined ? '' : reviewCard.title || t('untitled')),
              showAnswer ? h('p', { className: 'dshqn-review-label' }, t('cardBack')) : null,
              showAnswer
                ? h(
                    'p',
                    { className: 'dshqn-review-text' },
                    reviewCard === undefined || reviewCard.body.length === 0 ? t('reviewEmptyBack') : reviewCard.body,
                  )
                : null,
            ),
            showAnswer
              ? h(
                  'div',
                  { className: 'dshqn-review-actions' },
                  h('button', { type: 'button', className: 'dshqn-button dshqn-button-danger', onClick: () => rateCard(1) }, t('rateAgain')),
                  h('button', { type: 'button', className: 'dshqn-button', onClick: () => rateCard(3) }, t('rateHard')),
                  h('button', { type: 'button', className: 'dshqn-button', onClick: () => rateCard(5) }, t('rateGood')),
                )
              : h(
                  'div',
                  { className: 'dshqn-review-actions' },
                  h('button', { type: 'button', className: 'dshqn-button', onClick: () => setShowAnswer(true) }, t('showAnswer')),
                ),
          )
        : undefined;

      const detailPane =
        detail !== undefined
          ? h(
              'div',
              { className: 'dshqn-detail' },
              h(
                'div',
                { className: 'dshqn-detail-head' },
                h('span', { className: 'dshqn-detail-name' }, detail.name),
                detail.latest !== null
                  ? h(
                      'span',
                      { className: 'dshqn-detail-latest' },
                      String(detail.latest.value) + (detail.unit.length > 0 ? ' ' + detail.unit : ''),
                    )
                  : null,
                detail.latest !== null
                  ? (() => {
                      const state = rangeStateOf(detail.name, detail.latest.value);
                      const tone =
                        state === 'high' || state === 'low'
                          ? 'dshqn-badge-warn'
                          : state === 'normal'
                            ? 'dshqn-badge-success'
                            : '';
                      return h(
                        'span',
                        { className: 'dshqn-badge ' + tone },
                        state === 'high'
                          ? t('rangeHigh')
                          : state === 'low'
                            ? t('rangeLow')
                            : state === 'normal'
                              ? t('rangeNormal')
                              : t('rangeMissing'),
                      );
                    })()
                  : null,
                h('span', { style: { flex: '1 1 auto' } }),
                h('button', { type: 'button', className: 'dshqn-button', onClick: () => setMetricDetail(null) }, t('detailBack')),
              ),
              detailEdit !== null
                ? h(
                    'div',
                    { className: 'dshqn-detail-edit' },
                    h('div', { className: 'dshqn-detail-add' },
                      h('input', {
                        className: 'dshqn-field',
                        type: 'text',
                        inputMode: 'decimal',
                        value: detailEdit.value,
                        'aria-label': t('metricValuePlaceholder'),
                        placeholder: t('metricValuePlaceholder'),
                        onChange: (event) => setDetailEdit({ ...detailEdit, value: event.target.value }),
                      }),
                      h('input', {
                        className: 'dshqn-field',
                        type: 'text',
                        inputMode: 'decimal',
                        value: detailEdit.value2,
                        'aria-label': t('metricValue2Placeholder'),
                        placeholder: t('metricValue2Placeholder'),
                        onChange: (event) => setDetailEdit({ ...detailEdit, value2: event.target.value }),
                      }),
                      h('input', {
                        className: 'dshqn-field',
                        type: 'text',
                        value: detailEdit.unit,
                        'aria-label': t('metricUnitPlaceholder'),
                        placeholder: t('metricUnitPlaceholder'),
                        onChange: (event) => setDetailEdit({ ...detailEdit, unit: event.target.value }),
                      }),
                      h('input', {
                        className: 'dshqn-field dshqn-due',
                        type: 'datetime-local',
                        value: detailEdit.at,
                        'aria-label': t('measuredAt'),
                        onChange: (event) => setDetailEdit({ ...detailEdit, at: event.target.value }),
                      }),
                    ),
                    h(
                      'div',
                      { className: 'dshqn-actions' },
                      h('button', { type: 'button', className: 'dshqn-button', onClick: () => setDetailEdit(null) }, t('cancelEdit')),
                      h(
                        'button',
                        { type: 'button', className: 'dshqn-button', disabled: numberFromInput(detailEdit.value) === null, onClick: saveDetailEdit },
                        t('saveEdit'),
                      ),
                    ),
                  )
                : null,
              detail.rows.length === 0
                ? h('p', { className: 'dshqn-hint' }, t('detailEmpty'))
                : [
                    h(
                      'div',
                      { key: 'stats', className: 'dshqn-detail-stats' },
                      h('span', { className: 'dshqn-stat' }, t('metricCount') + ' ' + detail.rows.length),
                      h('span', { className: 'dshqn-stat' }, t('metricMin') + ' ' + detail.min),
                      h('span', { className: 'dshqn-stat' }, t('metricMax') + ' ' + detail.max),
                      h('span', { className: 'dshqn-stat' }, t('metricAvg') + ' ' + detail.average.toFixed(1)),
                    ),
                    h(
                      'div',
                      { key: 'add', className: 'dshqn-detail-add' },
                      h('input', {
                        className: 'dshqn-field',
                        type: 'text',
                        inputMode: 'decimal',
                        value: detailValue,
                        placeholder: t('metricValuePlaceholder'),
                        'aria-label': t('metricValuePlaceholder'),
                        onChange: (event) => setDetailValue(event.target.value),
                      }),
                      h('input', {
                        className: 'dshqn-field',
                        type: 'text',
                        inputMode: 'decimal',
                        value: detailValue2,
                        placeholder: t('metricValue2Placeholder'),
                        'aria-label': t('metricValue2Placeholder'),
                        onChange: (event) => setDetailValue2(event.target.value),
                      }),
                      h('span', { className: 'dshqn-stat' }, detail.unit),
                      h(
                        'button',
                        { type: 'button', className: 'dshqn-button', disabled: numberFromInput(detailValue) === null, onClick: recordDetail },
                        t('recordOnce'),
                      ),
                    ),
                    h(
                      'div',
                      { key: 'chart', className: 'dshqn-detail-card' },
                      h(
                        'svg',
                        { viewBox: '0 0 200 80', preserveAspectRatio: 'none', className: 'dshqn-detail-chart', 'aria-hidden': true },
                        h('polyline', {
                          points: chartPoints(detail.rows, 200, 80, 6),
                          fill: 'none',
                          stroke: 'currentColor',
                          strokeWidth: 1.6,
                          strokeLinejoin: 'round',
                          strokeLinecap: 'round',
                        }),
                      ),
                    ),
                    h(
                      'div',
                      { key: 'rows', className: 'dshqn-detail-list' },
                      detail.rows
                        .slice(-20)
                        .reverse()
                        .map((row) =>
                          h(
                            'div',
                            {
                              key: row.id + '-' + row.at,
                              className:
                                rangeStateOf(detail.name, row.value) === 'high' || rangeStateOf(detail.name, row.value) === 'low'
                                  ? 'dshqn-detail-row dshqn-detail-row-abnormal'
                                  : 'dshqn-detail-row',
                              onClick: () => openDetailEdit(row),
                            },
                            h('span', { className: 'dshqn-detail-time' }, formatDue(row.at)),
                            h(
                              'span',
                              { className: 'dshqn-detail-value' },
                              String(row.value) +
                                (row.value2 === null ? '' : '/' + row.value2) +
                                (detail.unit.length > 0 ? ' ' + detail.unit : ''),
                            ),
                            rangeStateOf(detail.name, row.value) === 'high' || rangeStateOf(detail.name, row.value) === 'low'
                              ? h(
                                  'span',
                                  { className: 'dshqn-badge dshqn-badge-warn' },
                                  rangeStateOf(detail.name, row.value) === 'high' ? t('rangeHigh') : t('rangeLow'),
                                )
                              : null,
                            h(
                              'button',
                              {
                                type: 'button',
                                className:
                                  pendingDeleteId === row.id ? 'dshqn-detail-delete dshqn-detail-delete-armed' : 'dshqn-detail-delete',
                                title: pendingDeleteId === row.id ? t('deleteConfirm') : t('deleteItem'),
                                'aria-label': pendingDeleteId === row.id ? t('deleteConfirm') : t('deleteItem'),
                                onClick: (event) => {
                                  if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
                                  deleteDetailRow(row.id);
                                },
                              },
                              pendingDeleteId === row.id ? t('deleteConfirm') : '×',
                            ),
                          ),
                        ),
                    ),
                  ],
            )
          : undefined;

      const titlePlaceholder =
        effective === undefined
          ? t('titlePlaceholder')
          : effective.kind === 'card'
            ? t('frontPlaceholder')
            : effective.kind === 'metric'
              ? t('metricNamePlaceholder')
              : effective.kind === 'med'
                ? t('medNamePlaceholder')
                : t('titlePlaceholder');
      const bodyPlaceholder =
        effective === undefined
          ? t('noteBodyPlaceholder')
          : effective.kind === 'card'
            ? t('backPlaceholder')
            : effective.kind === 'task'
              ? t('taskBodyPlaceholder')
              : effective.kind === 'med'
                ? t('medBodyPlaceholder')
                : t('noteBodyPlaceholder');

      const editorBody =
        effective === undefined
          ? h(EmptyState, {
              icon: modulesHidden ? 'all' : 'note',
              title: modulesHidden ? t('allHidden') : t('selectHint'),
              hint: modulesHidden ? null : t('overviewQuick'),
            })
          : [
              h('input', {
                key: 'title',
                className: 'dshqn-title-input',
                type: 'text',
                value: effective.title,
                placeholder: titlePlaceholder,
                'aria-label': titlePlaceholder,
                onChange: (event) => updateItem({ title: event.target.value }),
              }),
              h('textarea', {
                key: 'body',
                className: 'dshqn-body',
                value: effective.body,
                placeholder: bodyPlaceholder,
                'aria-label': bodyPlaceholder,
                spellCheck: false,
                onChange: (event) => updateItem({ body: event.target.value }),
              }),
              h(AttachmentEditor, {
                key: 'attachments',
                item: effective,
                t,
                uploading: uploadingAttachments,
                onAdd: addAttachments,
                onRemove: removeAttachment,
              }),
              effective.kind === 'metric'
                ? (() => {
                    const rows = metricSeries(items, effective);
                    const last = rows[rows.length - 1];
                    const previous = rows[rows.length - 2];
                    const delta = last === undefined || previous === undefined ? null : last.value - previous.value;
                    return h(
                      'div',
                      { key: 'chart', className: 'dshqn-chart' },
                      h('span', { className: 'dshqn-chart-title' }, t('chartTitle') + (rows.length > 0 ? ' · ' + rows.length : '')),
                      rows.length === 0
                        ? h('span', { className: 'dshqn-chart-empty' }, t('chartEmpty'))
                        : h(
                            'svg',
                            { viewBox: '0 0 200 60', preserveAspectRatio: 'none', className: 'dshqn-spark', 'aria-hidden': true },
                            h('polyline', {
                              points: chartPoints(rows, 200, 60, 6),
                              fill: 'none',
                              stroke: 'currentColor',
                              strokeWidth: 1.6,
                              strokeLinejoin: 'round',
                              strokeLinecap: 'round',
                            }),
                          ),
                      last !== undefined
                        ? h(
                            'span',
                            { className: 'dshqn-chart-last' },
                            String(last.value) + (delta === null ? '' : ' (' + (delta >= 0 ? '+' : '') + delta.toFixed(1) + ')'),
                          )
                        : null,
                    );
                  })()
                : null,
              effective.kind === 'card'
                ? (() => {
                    const history = cardReviewHistory(reviewsRef.current, effective.id, 5);
                    return h(
                      'div',
                      { key: 'history', className: 'dshqn-history' },
                      h('span', { className: 'dshqn-history-title' }, t('historyTitle')),
                      history.length === 0
                        ? h('span', { className: 'dshqn-history-empty' }, t('historyEmpty'))
                        : history.map((record) =>
                            h(
                              'span',
                              { key: record.at + '-' + record.quality, className: 'dshqn-history-row' },
                              formatStamp(record.at) +
                                ' · ' +
                                (record.quality >= 5 ? t('rateGood') : record.quality >= 3 ? t('rateHard') : t('rateAgain')),
                            ),
                          ),
                    );
                  })()
                : null,
              effective.kind === 'task'
                ? h(
                    'div',
                    { key: 'checklist', className: 'dshqn-checklist' },
                    h('p', { className: 'dshqn-checklist-title' }, t('subtasksTitle')),
                    (effective.checklist || []).map((row) =>
                      h(
                        'div',
                        { key: row.id, className: row.done ? 'dshqn-checklist-row dshqn-checklist-done' : 'dshqn-checklist-row' },
                        h('input', {
                          type: 'checkbox',
                          className: 'dshqn-check',
                          checked: row.done,
                          'aria-label': row.text,
                          onChange: () => updateChecklistRow(row.id, { done: !row.done }),
                        }),
                        h('span', { className: 'dshqn-checklist-text' }, row.text),
                        h(
                          'button',
                          {
                            type: 'button',
                            className: 'dshqn-icon-button',
                            title: t('deleteItem'),
                            'aria-label': t('deleteItem'),
                            onClick: () => removeChecklistRow(row.id),
                          },
                          '×',
                        ),
                      ),
                    ),
                    h(
                      'div',
                      { className: 'dshqn-checklist-add' },
                      h('input', {
                        className: 'dshqn-field',
                        type: 'text',
                        value: checklistDraft,
                        placeholder: t('subtaskPlaceholder'),
                        'aria-label': t('subtaskPlaceholder'),
                        onChange: (event) => setChecklistDraft(event.target.value),
                        onKeyDown: (event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            addChecklistRow();
                          }
                        },
                      }),
                      h('button', { type: 'button', className: 'dshqn-button', onClick: addChecklistRow }, t('addSubtask')),
                    ),
                  )
                : null,
              h(
                'div',
                { key: 'meta', className: 'dshqn-editor-meta' },
                h(
                  'button',
                  {
                    key: 'pin',
                    type: 'button',
                    className: prefs.pins.includes(effective.id) ? 'dshqn-pin-button dshqn-pin-active' : 'dshqn-pin-button',
                    title: prefs.pins.includes(effective.id) ? t('unpinItem') : t('pinItem'),
                    'aria-label': prefs.pins.includes(effective.id) ? t('unpinItem') : t('pinItem'),
                    'aria-pressed': prefs.pins.includes(effective.id),
                    onClick: () => togglePin(effective.id),
                  },
                  h(Icon, { name: 'pin', size: 13 }),
                ),
                effective.kind === 'task'
                  ? h(
                      'button',
                      {
                        type: 'button',
                        className: effective.status === 'done' ? 'dshqn-status-toggle dshqn-status-done' : 'dshqn-status-toggle',
                        onClick: advanceTaskStatus,
                      },
                      effective.status === 'done' ? '✓ ' + t('taskDone') : '○ ' + t('taskOpen'),
                    )
                  : null,
                effective.kind === 'task'
                  ? h(
                      'span',
                      { className: 'dshqn-priority-group', role: 'group', 'aria-label': t('priorityLabel') },
                      [
                        ['low', t('priorityLow')],
                        ['normal', t('priorityNormal')],
                        ['high', t('priorityHigh')],
                      ].map(([id, label]) =>
                        h(
                          'button',
                          {
                            key: id,
                            type: 'button',
                            className: effective.priority === id ? 'dshqn-priority-chip dshqn-priority-chip-active' : 'dshqn-priority-chip',
                            onClick: () => updateItem({ priority: id }),
                          },
                          label,
                        ),
                      ),
                    )
                  : null,
                effective.kind === 'metric'
                  ? h('input', {
                      className: 'dshqn-field',
                      type: 'text',
                      inputMode: 'decimal',
                      value: effective.health.value === null ? '' : String(effective.health.value),
                      placeholder: t('metricValuePlaceholder'),
                      'aria-label': t('metricValuePlaceholder'),
                      onChange: (event) =>
                        updateItem({ health: { ...normalizeHealth(effective.health), value: numberFromInput(event.target.value) } }),
                    })
                  : null,
                effective.kind === 'metric'
                  ? h('input', {
                      className: 'dshqn-field',
                      type: 'text',
                      inputMode: 'decimal',
                      value: effective.health.value2 === null ? '' : String(effective.health.value2),
                      placeholder: t('metricValue2Placeholder'),
                      'aria-label': t('metricValue2Placeholder'),
                      onChange: (event) =>
                        updateItem({ health: { ...normalizeHealth(effective.health), value2: numberFromInput(event.target.value) } }),
                    })
                  : null,
                effective.kind === 'metric'
                  ? h('input', {
                      className: 'dshqn-field',
                      type: 'text',
                      value: effective.health.unit,
                      placeholder: t('metricUnitPlaceholder'),
                      'aria-label': t('metricUnitPlaceholder'),
                      onChange: (event) => updateItem({ health: { ...normalizeHealth(effective.health), unit: event.target.value } }),
                    })
                  : null,
                effective.kind === 'metric'
                  ? h('input', {
                      className: 'dshqn-field dshqn-due',
                      type: 'datetime-local',
                      value: toLocalInput(effective.health.at),
                      'aria-label': t('measuredAt'),
                      onChange: (event) =>
                        updateItem({ health: { ...normalizeHealth(effective.health), at: fromLocalInput(event.target.value) } }),
                    })
                  : null,
                effective.kind === 'metric'
                  ? (() => {
                      const range = rangeOfName(effective.title) || { min: null, max: null };
                      return h(
                        'span',
                        { key: 'health-range', className: 'dshqn-range-group', role: 'group', 'aria-label': t('healthRangeTitle') },
                        h('span', { className: 'dshqn-range-label' }, t('healthRangeTitle')),
                        h('input', {
                          className: 'dshqn-field dshqn-range-input',
                          type: 'text',
                          inputMode: 'decimal',
                          placeholder: t('rangeMin'),
                          'aria-label': t('rangeMin'),
                          value: range.min === null ? '' : String(range.min),
                          onChange: (event) => setMetricRange(effective.title, numberFromInput(event.target.value), range.max),
                        }),
                        h('input', {
                          className: 'dshqn-field dshqn-range-input',
                          type: 'text',
                          inputMode: 'decimal',
                          placeholder: t('rangeMax'),
                          'aria-label': t('rangeMax'),
                          value: range.max === null ? '' : String(range.max),
                          onChange: (event) => setMetricRange(effective.title, range.min, numberFromInput(event.target.value)),
                        }),
                      );
                    })()
                  : null,
                effective.kind === 'med'
                  ? h('input', {
                      className: 'dshqn-field',
                      type: 'text',
                      value: timesDraft,
                      placeholder: t('medTimesPlaceholder'),
                      'aria-label': t('medTimesPlaceholder'),
                      onChange: handleTimesInput,
                    })
                  : null,
                effective.kind === 'med'
                  ? h(
                      'button',
                      {
                        type: 'button',
                        className: effective.health.active ? 'dshqn-status-toggle' : 'dshqn-status-toggle dshqn-status-done',
                        onClick: () => updateItem({ health: { ...normalizeHealth(effective.health), active: !effective.health.active } }),
                      },
                      effective.health.active ? t('medActive') : t('medInactive'),
                    )
                  : null,
                h('input', {
                  className: 'dshqn-field',
                  type: 'text',
                  value: tagsDraft,
                  placeholder: t('tagsPlaceholder'),
                  'aria-label': t('tagsPlaceholder'),
                  onChange: handleTagsInput,
                }),
                effective.kind === 'task'
                  ? h('input', {
                      className: 'dshqn-field dshqn-due',
                      type: 'datetime-local',
                      value: toLocalInput(effective.due),
                      'aria-label': t('dueLabel'),
                      onChange: (event) => updateItem({ due: fromLocalInput(event.target.value) }),
                    })
                  : null,
                effective.kind === 'task'
                  ? h(
                      'span',
                      { key: 'due-presets', className: 'dshqn-due-presets', role: 'group', 'aria-label': t('dueLabel') },
                      [
                        [0, t('dueToday')],
                        [1, t('dueTomorrow')],
                        [7, t('dueNextWeek')],
                      ].map(([offset, label]) =>
                        h(
                          'button',
                          { key: label, type: 'button', className: 'dshqn-filter', onClick: () => setDuePreset(offset) },
                          label,
                        ),
                      ),
                    )
                  : null,
                effective.kind === 'task'
                  ? h(
                      'select',
                      {
                        key: 'repeat',
                        className: 'dshqn-select',
                        value: effective.repeat || 'none',
                        title: t('repeatLabel'),
                        'aria-label': t('repeatLabel'),
                        onChange: (event) => updateItem({ repeat: event.target.value }),
                      },
                      REPEATS.map((value) =>
                        h(
                          'option',
                          { key: value, value },
                          value === 'none'
                            ? t('repeatNone')
                            : value === 'daily'
                              ? t('repeatDaily')
                              : value === 'weekly'
                                ? t('repeatWeekly')
                                : t('repeatMonthly'),
                        ),
                      ),
                    )
                  : null,
              ),
              h(
                'footer',
                { key: 'footer', className: 'dshqn-footer' },
                h(
                  'span',
                  { className: 'dshqn-count' },
                  effective.kind === 'card'
                    ? reviewDueLabel(effective.review, t, nowMs) +
                      ' · ' +
                      t('suggestReview') +
                      ' ' +
                      fillTemplate(t('dueIn'), { days: suggestNextInterval(effective.review) }) +
                      (reviewOverdue(effective.review, nowMs) ? ' · ' + t('suggestOverdue') : '') +
                      ' · ' +
                      bodyLength +
                      ' ' +
                      t('chars')
                    : String(bodyLength) + ' ' + t('chars'),
                ),
              ),
            ];

      return h(
        'div',
        {
          className:
            'dshqn-page' + (prefs.density === 'compact' ? ' dshqn-compact' : '') + (focusMode ? ' dshqn-focus' : ''),
          style: prefs.accent.length > 0 ? { '--dshqn-accent': prefs.accent } : undefined,
        },
        h('style', { key: 'styles' }, STYLES + '\n' + STYLE_UPGRADES),
        h(
          'header',
          { className: 'dshqn-header' },
          h('span', { className: 'dshqn-header-icon', 'aria-hidden': true }, h(NoteIcon, { size: 22 })),
          h(
            'div',
            { className: 'dshqn-headings' },
            h('h1', { className: 'dshqn-title' }, t('title')),
            h('p', { className: 'dshqn-subtitle' }, t('subtitle')),
          ),
          h(
            'div',
            { className: 'dshqn-header-actions' },
            h(
              'button',
              {
                type: 'button',
                className: 'dshqn-button',
                onClick: () => {
                  setPaletteQuery('');
                  setPaletteIndex(0);
                  setPaletteOpen(true);
                },
                title: t('paletteOpen'),
                'aria-label': t('paletteOpen'),
              },
              h(Icon, { name: 'search', size: 14 }),
              t('paletteShortcut'),
            ),
            h(
              'button',
              { type: 'button', className: 'dshqn-button', onClick: () => setShortcutsOpen((value) => !value), title: t('shortcutHelp'), 'aria-label': t('shortcutHelp') },
              '?',
            ),
            harnessUpdateBanner.length > 0
              ? h(
                  'button',
                  {
                    type: 'button',
                    className: 'dshqn-button dshqn-update-badge',
                    title: fillTemplate(t('harnessUpdateBadge'), { version: harnessUpdateBanner }),
                    onClick: () => {
                      changeView('insights');
                      setInsightTab('system');
                    },
                  },
                  h(Icon, { name: 'value', size: 14 }),
                  fillTemplate(t('harnessUpdateBadge'), { version: harnessUpdateBanner }),
                )
              : null,
            h(
              'span',
              {
                className:
                  'dshqn-status-pill ' +
                  (status === 'synced'
                    ? 'dshqn-status-synced'
                    : status === 'saving'
                      ? 'dshqn-status-saving'
                      : status === 'offline'
                        ? 'dshqn-status-offline'
                        : ''),
                role: 'status',
                'aria-live': 'polite',
              },
              status === 'synced'
                ? t('statusSynced')
                : status === 'saving'
                  ? t('statusSaving')
                  : status === 'offline'
                    ? t('statusOffline')
                    : t('statusLoading'),
            ),
            h(
              'button',
              { type: 'button', className: 'dshqn-button', onClick: refresh },
              h(Icon, { name: 'refresh', size: 14 }),
              t('refresh'),
            ),
          ),
        ),
        h(
          'div',
          { className: 'dshqn-toolbar' },
          h(
            'div',
            { className: 'dshqn-tabs' },
            tabIds.map((id) =>
              h(
                'button',
                {
                  key: id,
                  type: 'button',
                  className: id === activeTabId ? 'dshqn-tab dshqn-tab-active' : 'dshqn-tab',
                  onClick: () => changeView(id),
                },
                h(Icon, { key: 'icon', name: VIEW_META[id].icon, size: 14 }),
                t(VIEW_META[id].tabKey),
              ),
            ),
          ),
          activeView !== 'overview' && activeView !== 'all' && activeView !== 'insights' && activeView !== 'record'
            ? h(
                'span',
                { className: 'dshqn-search-wrap' },
                h(Icon, { name: 'search', size: 14 }),
                h('input', {
                  className: 'dshqn-search',
                  type: 'search',
                  value: query,
                  placeholder: t('searchPlaceholder'),
                  'aria-label': t('searchPlaceholder'),
                  onChange: handleSearch,
                  onKeyDown: (event) => {
                    if (event.key === 'Escape') setQuery('');
                  },
                }),
              )
            : null,
          activeView !== 'overview' && activeView !== 'all' && activeView !== 'insights' && activeView !== 'record'
            ? h(
                'button',
                { type: 'button', className: 'dshqn-button dshqn-button-primary', onClick: createItem, disabled: modulesHidden },
                h(Icon, { name: 'plus', size: 14 }),
                t(KIND_META[viewKind].newKey),
              )
            : null,
          activeView === 'health' && !modulesHidden
            ? h(
                'div',
                { className: 'dshqn-tabs' },
                [
                  ['metric', t('healthMetric'), 'health'],
                  ['med', t('healthMed'), 'check'],
                ].map(([id, label, icon]) =>
                  h(
                    'button',
                    {
                      key: id,
                      type: 'button',
                      className: healthMode === id ? 'dshqn-tab dshqn-tab-active' : 'dshqn-tab',
                      onClick: () => {
                        setHealthMode(id);
                        setMetricDetail(null);
                        setSelectedId(null);
                        resetConfirmation();
                      },
                    },
                    h(Icon, { key: 'icon', name: icon, size: 14 }),
                    label,
                  ),
                ),
              )
            : null,
          activeView === 'health' && healthMode === 'metric' && !modulesHidden
            ? h(
                'button',
                {
                  type: 'button',
                  className: compareMode ? 'dshqn-filter dshqn-filter-active' : 'dshqn-filter',
                  onClick: () => {
                    if (!compareMode && compareSelected.length === 0) {
                      setCompareSelected(metricNameList(items).slice(0, 3));
                    }
                    setCompareMode((value) => !value);
                  },
                },
                t('compare'),
              )
            : null,
          activeView === 'card' && !modulesHidden && !reviewing
            ? h(Segmented, {
                items: [
                  { id: 'due', label: t('reviewModeDue') },
                  { id: 'new', label: t('reviewModeNew') },
                  { id: 'all', label: t('reviewModeAll') },
                ],
                value: reviewMode,
                onChange: setReviewMode,
                label: t('reviewModeLabel'),
              })
            : null,
          activeView === 'card' && !modulesHidden
            ? h(
                'button',
                { type: 'button', className: 'dshqn-button', onClick: reviewing ? stopReview : startReview },
                reviewing ? t('stopReview') : t('startReview'),
              )
            : null,
        ),
        activeView === 'task' && !modulesHidden
          ? h(
              'div',
              { className: 'dshqn-filters' },
              [
                ['all', t('filterAll')],
                ['open', t('filterOpen')],
                ['done', t('filterDone')],
                ['today', t('filterToday')],
                ['overdue', t('filterOverdue')],
              ].map(([id, label]) =>
                h(
                  'button',
                  {
                    key: id,
                    type: 'button',
                    className: taskFilter === id ? 'dshqn-filter dshqn-filter-active' : 'dshqn-filter',
                    onClick: () => {
                      setTaskFilter(id);
                      resetConfirmation();
                    },
                  },
                  label,
                ),
              ),
              h('span', { key: 'task-stats-sep', className: 'dshqn-filter-sep' }),
              h(
                'span',
                { key: 'task-stats-today', className: 'dshqn-hero-chip' },
                fillTemplate(t('taskStatsToday'), { done: taskStats.done, total: Math.max(taskStats.done, taskStats.total) }),
              ),
              h('span', { key: 'task-stats-week', className: 'dshqn-hero-chip' }, fillTemplate(t('taskStatsWeek'), { count: taskStats.week })),
              taskStats.overdue > 0
                ? h(
                    'span',
                    { key: 'task-stats-overdue', className: 'dshqn-hero-chip' },
                    fillTemplate(t('taskStatsOverdue'), { count: taskStats.overdue }),
                  )
                : null,
              taskLayout === 'list' ? h('span', { key: 'sep', className: 'dshqn-filter-sep' }) : null,
              taskLayout === 'list'
                ? [
                    ['none', t('groupNone')],
                    ['priority', t('groupPriority')],
                    ['tags', t('groupTags')],
                  ].map(([id, label]) =>
                    h(
                      'button',
                      {
                        key: 'group-' + id,
                        type: 'button',
                        className: groupBy === id ? 'dshqn-filter dshqn-filter-active' : 'dshqn-filter',
                        onClick: () => {
                          setGroupBy(id);
                          resetConfirmation();
                        },
                      },
                      label,
                    ),
                  )
                : null,
              h('span', { key: 'spacer', style: { flex: '1 1 auto' } }),
              h(
                'div',
                { key: 'layout', className: 'dshqn-subtabs' },
                h(Segmented, {
                  items: [
                    { id: 'list', label: t('layoutList') },
                    { id: 'board', label: t('layoutBoard') },
                    { id: 'calendar', label: t('viewCalendar') },
                  ],
                  value: taskLayout,
                  label: t('viewPlan'),
                  onChange: setTaskLayout,
                }),
              ),
            )
          : null,
        retention !== undefined && retention.some((bucket) => bucket.count > 0)
          ? h(
              'div',
              { className: 'dshqn-retention' },
              h('span', { className: 'dshqn-stat' }, t('retentionTitle')),
              retention.map((bucket, index) =>
                bucket.count === 0
                  ? null
                  : h(
                      'span',
                      { key: String(bucket.limit), className: 'dshqn-stat' },
                      t(['retentionDay1', 'retentionDay6', 'retentionDay29', 'retentionDay30'][index]) +
                        ' · ' +
                        bucket.count +
                        ' · ' +
                        Math.round((bucket.rate || 0) * 100) +
                        '%',
                    ),
              ),
            )
          : null,
        activeView === 'card' && !modulesHidden && retentionForecast !== undefined
          ? h(
              'div',
              { className: 'dshqn-retention' },
              h(
                'span',
                { className: 'dshqn-stat' },
                t('reviewForecastTitle') +
                  '：' +
                  retentionForecast.points.map((point) => point.days + t('reviewDaysShort') + ' ' + Math.round(point.rate * 100) + '%').join(' · ') + (retentionForecast.halfLife !== null ? ' · ' + t('reviewHalfLife') + ' ' + retentionForecast.halfLife + t('reviewDaysShort') : ''),
              ),
              h('span', { className: 'dshqn-stat' }, t('reviewGoalHistory') + '：' + reviewGoalHistory.map((cell) => cell.label + ' ' + cell.count).join(' · ')),
              reviewGoalHistory.map((cell) =>
                h(
                  'span',
                  { key: cell.key, className: 'dshqn-stat', title: cell.label + ' ' + cell.count + '/' + cell.goal },
                  h('span', { style: { display: 'inline-block', width: '28px', height: '8px', background: 'var(--dsw-alias-bg-layer-2)', borderRadius: '999px', marginRight: '4px' } }, h('span', { style: { display: 'block', width: Math.min(100, Math.round((cell.count / cell.goal) * 100)) + '%', height: '100%', background: 'var(--dshqn-accent)', borderRadius: '999px' } })),
                  cell.count + '/' + cell.goal,
                ),
              ),
            )
          : null,
                healthSummary !== undefined ? healthSummary : null,
        metricCards !== undefined && metricCards.length > 0
          ? h(
              'div',
              { className: 'dshqn-overview', 'aria-label': t('overviewTitle') },
              metricCards.map((card) =>
                h(
                  'button',
                  {
                    key: card.name,
                    type: 'button',
                    className: 'dshqn-overview-card',
                    title: t('overviewTitle') + ' · ' + card.name,
                    onClick: () => {
                      setMetricDetail(card.name);
                      setQuery('');
                      resetConfirmation();
                    },
                  },
                  h('span', { className: 'dshqn-overview-name' }, card.name),
                  h(
                    'span',
                    { className: 'dshqn-overview-value' },
                    String(card.latest.value) + (card.unit.length > 0 ? ' ' + card.unit : ''),
                  ),
                  card.rows.length > 1
                    ? h(
                        'svg',
                        { viewBox: '0 0 100 24', preserveAspectRatio: 'none', className: 'dshqn-overview-spark', 'aria-hidden': true },
                        h('polyline', {
                          points: chartPoints(card.rows, 100, 24, 2),
                          fill: 'none',
                          stroke: 'currentColor',
                          strokeWidth: 1.4,
                          strokeLinejoin: 'round',
                          strokeLinecap: 'round',
                        }),
                      )
                    : null,
                ),
              ),
            )
          : null,
        compareMode
          ? h(
              'div',
              { className: 'dshqn-compare', 'aria-label': t('compare') },
              h(
                'div',
                { className: 'dshqn-compare-legend' },
                metricNameList(items).map((name) =>
                  h(
                    'button',
                    {
                      key: name,
                      type: 'button',
                      className: compareSelected.some((entry) => entry.toLowerCase() === name.toLowerCase())
                        ? 'dshqn-filter dshqn-filter-active dshqn-compare-chip'
                        : 'dshqn-filter dshqn-compare-chip',
                      onClick: () => toggleCompareName(name),
                    },
                    name,
                  ),
                ),
              ),
              compareData.length === 0
                ? h('p', { className: 'dshqn-hint' }, t('compareEmpty'))
                : h(
                    'svg',
                    { viewBox: '0 0 200 60', preserveAspectRatio: 'none', className: 'dshqn-compare-chart', 'aria-hidden': true },
                    compareData.map((entry, index) =>
                      h('polyline', {
                        key: entry.name,
                        points: entry.points,
                        fill: 'none',
                        stroke: 'currentColor',
                        strokeWidth: 1.5,
                        strokeLinejoin: 'round',
                        strokeLinecap: 'round',
                        className: 'dshqn-compare-line dshqn-compare-line-' + index,
                      }),
                    ),
                  ),
            )
          : null,
        stats !== undefined
          ? h(
              'div',
              { className: 'dshqn-stats' },
              h('span', { className: 'dshqn-stat' }, t('statDue') + ' ' + stats.due),
              h('span', { className: 'dshqn-stat' }, t('statToday') + ' ' + stats.today),
              h('span', { className: 'dshqn-stat' }, t('statStreak') + ' ' + stats.streak),
              distribution !== undefined
                ? h(
                    'span',
                    { className: 'dshqn-stat' },
                    t('statRatings') +
                      ' ' +
                      t('rateAgain') +
                      ' ' +
                      distribution.again +
                      ' · ' +
                      t('rateHard') +
                      ' ' +
                      distribution.hard +
                      ' · ' +
                      t('rateGood') +
                      ' ' +
                      distribution.good,
                  )
                : null,
              h(
                'div',
                { className: 'dshqn-heat', role: 'img', 'aria-label': t('statHeat'), title: t('statHeat') },
                stats.cells.map((cell) =>
                  h('span', {
                    key: cell.key,
                    className:
                      cell.count >= 3 ? 'dshqn-heat-cell dshqn-heat-hot' : cell.count > 0 ? 'dshqn-heat-cell dshqn-heat-on' : 'dshqn-heat-cell',
                    title: cell.label + ' · ' + cell.count,
                  }),
                ),
              ),
            )
          : null,
        activeTabId === 'knowledge' && !reviewing && knowledgeItems.length > 1
          ? h(
              'div',
              { className: 'dshqn-subtabs' },
              h(Segmented, {
                items: knowledgeItems,
                value: activeView === 'card' ? 'card' : 'note',
                label: t('viewKnowledge'),
                onChange: (id) => {
                  setView(id);
                  props.prefs.set({ ...prefs, knowledgeTab: id === 'card' ? 'review' : 'notes' });
                  setSelectedId(null);
                  setQuery('');
                  stopReview();
                },
              }),
            )
          : null,
        activeTabId === 'overview'
          ? h(
              'div',
              { className: 'dshqn-subtabs' },
              h(Segmented, {
                items: [
                  { id: 'overview', label: t('viewOverview') },
                  { id: 'all', label: t('viewAll') },
                ],
                value: activeView === 'all' ? 'all' : 'overview',
                label: t('viewOverview'),
                onChange: (id) => {
                  setView(id === 'all' ? 'all' : 'overview');
                  props.prefs.set({ ...prefs, overviewTab: id === 'all' ? 'all' : 'dashboard' });
                  setSelectedId(null);
                  setQuery('');
                  stopReview();
                },
              }),
            )
          : null,
        h(
          'div',
          { className: 'dshqn-workspace' },
          status === 'loading'
            ? h(SkeletonCards, { key: 'loading', count: 3 })
            : activeView === 'overview'
              ? overviewPane
              : activeView === 'all'
                ? allPane
                : activeView === 'task' && taskLayout === 'calendar'
                  ? calendarPane
                  : activeView === 'insights'
                    ? insightsPane
                    : activeView === 'record'
                      ? recordsPane
                      : reviewPane !== undefined
                        ? reviewPane
                        : detailPane !== undefined
                          ? detailPane
                          : [
                              boardBody !== undefined ? boardBody : h('div', { key: 'list', className: 'dshqn-list' }, listBody),
                              h('section', { key: 'editor', className: 'dshqn-card' }, editorBody),
                            ],
        ),
        shortcutsOpen
          ? h(
              'div',
              { className: 'dshqn-palette-backdrop', onClick: () => setShortcutsOpen(false) },
              h(
                'div',
                { className: 'dshqn-palette', role: 'dialog', 'aria-label': t('shortcutTitle'), onClick: (event) => event.stopPropagation() },
                h('p', { className: 'dshqn-settings-label' }, t('shortcutTitle')),
                [
                  [settings.shortcuts.palette, t('shortcutPalette')],
                  ['1 / 2 / 3', t('shortcutRate')],
                  ['Space', t('shortcutReveal')],
                  ['U', t('shortcutUndo')],
                  ['Esc', t('shortcutClose')],
                  [settings.shortcuts.help, t('shortcutHelp')],
                ].map((row) =>
                  h(
                    'div',
                    { key: row[0], style: { display: 'flex', justifyContent: 'space-between', gap: '16px', fontSize: '12px', padding: '3px 0' } },
                    h('code', null, row[0]),
                    h('span', null, row[1]),
                  ),
                ),
              ),
            )
          : null,
                paletteOpen
          ? h(
              'div',
              { className: 'dshqn-palette-backdrop', onClick: closePalette },
              h(
                'div',
                { className: 'dshqn-palette', role: 'dialog', 'aria-label': t('paletteTitle'), onClick: (event) => event.stopPropagation() },
                h('input', {
                  className: 'dshqn-palette-input',
                  type: 'text',
                  autoFocus: true,
                  value: paletteQuery,
                  placeholder: t('palettePlaceholder'),
                  'aria-label': t('palettePlaceholder'),
                  onChange: (event) => {
                    setPaletteQuery(event.target.value);
                    setPaletteIndex(0);
                  },
                  onKeyDown: paletteKeyDown,
                }),
                h(
                  'div',
                  { className: 'dshqn-palette-list' },
                  paletteData.actions.length > 0
                    ? h('p', { key: 'actions-group', className: 'dshqn-palette-group' }, t('paletteActions'))
                    : null,
                  paletteData.actions.map((action, index) =>
                    h(
                      'button',
                      {
                        key: 'action-' + action.id,
                        type: 'button',
                        className:
                          paletteIndex === index ? 'dshqn-palette-item dshqn-palette-item-active' : 'dshqn-palette-item',
                        onMouseEnter: () => setPaletteIndex(index),
                        onClick: () => palettePick(index),
                      },
                      h(Icon, { name: action.icon, size: 14 }),
                      h('span', { className: 'dshqn-palette-label' }, action.label),
                    ),
                  ),
                  paletteData.items.length > 0
                    ? h('p', { key: 'items-group', className: 'dshqn-palette-group' }, t('paletteItems'))
                    : null,
                  paletteData.items.map((item, index) => {
                    const absolute = paletteData.actions.length + index;
                    return h(
                      'button',
                      {
                        key: 'item-' + item.id,
                        type: 'button',
                        className:
                          paletteIndex === absolute ? 'dshqn-palette-item dshqn-palette-item-active' : 'dshqn-palette-item',
                        onMouseEnter: () => setPaletteIndex(absolute),
                        onClick: () => palettePick(absolute),
                      },
                      h('span', { className: 'dshqn-kind-badge' }, kindLabel(item.kind, t)),
                      h('span', { className: 'dshqn-palette-label' }, itemTitle(item) || t('untitled')),
                    );
                  }),
                  paletteData.total === 0 ? h('p', { key: 'empty', className: 'dshqn-palette-empty' }, t('paletteEmpty')) : null,
                ),
              ),
            )
          : null,
        h(
          'div',
          { className: 'dshqn-actions' },
          h('span', { className: 'dshqn-status-note', role: 'status', 'aria-live': 'polite' }, shownNotice),
          h(
            'button',
            {
              type: 'button',
              className: confirming ? 'dshqn-button dshqn-button-danger' : 'dshqn-button',
              onClick: deleteItem,
              disabled: effective === undefined && !confirming,
            },
            deleteLabel,
          ),
          h('button', { type: 'button', className: 'dshqn-button', onClick: exportItems }, t('export')),
          h('button', { type: 'button', className: 'dshqn-button', onClick: openImport }, t('import')),
          h('input', {
            ref: fileInput,
            className: 'dshqn-hidden-input',
            type: 'file',
            accept: 'application/json,.json',
            onChange: importFile,
          }),
          h('button', { type: 'button', className: 'dshqn-button', onClick: goBack }, t('back')),
        ),
      );
    }

    /** Settings section: module visibility and storage status. */
    function SettingsSection(props) {
      const t = translateSeat(props.t);
      const prefs = React.useSyncExternalStore(props.prefs.subscribe, props.prefs.getSnapshot);
      const [file, setFile] = React.useState('');
      const [count, setCount] = React.useState(null);
      const [syncState, setSyncState] = React.useState('loading');
      const [brief, setBrief] = React.useState(true);
      const [briefBusy, setBriefBusy] = React.useState(false);
      const [priceHit, setPriceHit] = React.useState('0.04');
      const [priceMiss, setPriceMiss] = React.useState('2');
      const [priceOutput, setPriceOutput] = React.useState('8');
      const [pricingBusy, setPricingBusy] = React.useState(false);
      const [pricingNotice, setPricingNotice] = React.useState('');
      const [backups, setBackups] = React.useState([]);
      const [backupBusy, setBackupBusy] = React.useState(false);
      const [restoreConfirm, setRestoreConfirm] = React.useState('');
      const [backupInterval, setBackupInterval] = React.useState('5');
      const [shortcutPaletteDraft, setShortcutPaletteDraft] = React.useState('ctrl+k');
      const [shortcutHelpDraft, setShortcutHelpDraft] = React.useState('?');
      const [backupDiff, setBackupDiff] = React.useState(null);
      const [diffBusy, setDiffBusy] = React.useState(false);
      const [markdownDir, setMarkdownDir] = React.useState('');
      const [markdownBusy, setMarkdownBusy] = React.useState(false);
      const [markdownNotice, setMarkdownNotice] = React.useState('');
      const [shareBusy, setShareBusy] = React.useState(false);
      const [shareNotice, setShareNotice] = React.useState('');
      const backupFileInput = React.useRef(null);
      const [permission, setPermission] = React.useState(
        typeof window.Notification === 'function' ? window.Notification.permission : 'unsupported',
      );

      const sync = React.useCallback(() => {
        readState()
          .then((document) => {
            setFile(document.file);
            setCount(document.items.length);
            setBrief(document.settings.brief);
            setBackupInterval(String(document.settings.backupIntervalMinutes || 5));
            setShortcutPaletteDraft(document.settings.shortcuts && document.settings.shortcuts.palette ? document.settings.shortcuts.palette : 'ctrl+k');
            setShortcutHelpDraft(document.settings.shortcuts && document.settings.shortcuts.help ? document.settings.shortcuts.help : '?');
            setPriceHit(String(document.settings.pricing.inputHit));
            setPriceMiss(String(document.settings.pricing.inputMiss));
            setPriceOutput(String(document.settings.pricing.output));
            setSyncState('synced');
            readProtected(BACKUP_URL)
              .then((payload) => setBackups(Array.isArray(payload.backups) ? payload.backups : []))
              .catch(() => setBackups([]));
          })
          .catch(() => {
            setSyncState('offline');
          });
      }, []);

      React.useEffect(() => {
        sync();
      }, [sync]);

      /** Run one Markdown folder export/import through the Host route. */
      const runMarkdown = (action) => {
        if (markdownBusy) return;
        setMarkdownBusy(true);
        setMarkdownNotice('');
        postProtected(MARKDOWN_URL, { action, dir: markdownDir.trim() })
          .then((payload) => {
            if (action === 'export') {
              setMarkdownNotice(fillTemplate(t('markdownExported'), { count: payload.count, dir: payload.dir }));
            } else {
              setMarkdownNotice(fillTemplate(t('markdownImported'), { imported: payload.imported, skipped: payload.skipped, dir: payload.dir }));
              sync();
            }
          })
          .catch(() => setMarkdownNotice(t('markdownFailed')))
          .finally(() => setMarkdownBusy(false));
      };

      /** Generate one standalone read-only HTML snapshot through the Host route. */
      const createShareSnapshot = () => {
        if (shareBusy) return;
        setShareBusy(true);
        setShareNotice('');
        postProtected(SHARE_URL, {})
          .then((payload) => setShareNotice(fillTemplate(t('shareCreated'), { path: payload.path })))
          .catch(() => setShareNotice(t('shareFailed')))
          .finally(() => setShareBusy(false));
      };

      const toggle = (kind) => {
        props.prefs.set({ modules: { ...prefs.modules, [kind]: !prefs.modules[kind] } });
      };

      const toggleBrief = () => {
        if (briefBusy) return;
        setBriefBusy(true);
        writeSettings((settings) => ({ ...settings, brief: !settings.brief }))
          .then((document) => {
            setBrief(document.settings.brief);
            setBriefBusy(false);
            setSyncState('synced');
          })
          .catch(() => {
            setBriefBusy(false);
            setSyncState('offline');
          });
      };

      const savePricing = () => {
        if (pricingBusy) return;
        const hit = Number(priceHit);
        const miss = Number(priceMiss);
        const output = Number(priceOutput);
        if (![hit, miss, output].every((value) => Number.isFinite(value) && value >= 0 && value <= 100000)) {
          setPricingNotice(t('settingsSaved') + ' ✗');
          return;
        }
        setPricingBusy(true);
        writeSettings((settings) => ({ ...settings, pricing: { inputHit: hit, inputMiss: miss, output } }))
          .then((document) => {
            setPriceHit(String(document.settings.pricing.inputHit));
            setPriceMiss(String(document.settings.pricing.inputMiss));
            setPriceOutput(String(document.settings.pricing.output));
            setPricingBusy(false);
            setPricingNotice(t('settingsSaved'));
            setSyncState('synced');
          })
          .catch(() => {
            setPricingBusy(false);
            setSyncState('offline');
          });
      };

      /** Reload the rolling backup list from the Host. */
      const refreshBackups = () => {
        readProtected(BACKUP_URL)
          .then((payload) => setBackups(Array.isArray(payload.backups) ? payload.backups : []))
          .catch(() => setBackups([]));
      };

      /** Save custom top-level shortcuts. */
      const saveShortcuts = () => {
        writeSettings((settings) => ({
          ...settings,
          shortcuts: {
            palette: shortcutPaletteDraft.trim() || 'ctrl+k',
            help: shortcutHelpDraft.trim() || '?',
          },
        }))
          .then(() => setPricingNotice(t('saved')))
          .catch(() => setPricingNotice(t('backupFailed')));
      };

      /** Preview differences between the current document and one rolling backup. */
      const previewBackupDiff = (name) => {
        if (diffBusy) return;
        setDiffBusy(true);
        readProtected(BACKUP_URL + '?diff=' + encodeURIComponent(name))
          .then((payload) => setBackupDiff(payload))
          .catch(() => setBackupDiff(null))
          .finally(() => setDiffBusy(false));
      };

      /** Save the automatic-backup interval (minutes). */
      const saveBackupInterval = () => {
        const minutes = Math.max(1, Math.min(1440, Math.round(Number(backupInterval) || 5)));
        writeSettings((settings) => ({ ...settings, backupIntervalMinutes: minutes }))
          .then(() => setPricingNotice(t('saved')))
          .catch(() => setPricingNotice(t('backupFailed')));
      };

      /** Create one rolling backup now. */
      const createBackupNow = () => {
        if (backupBusy) return;
        setBackupBusy(true);
        postProtected(BACKUP_URL)
          .then(() => {
            setBackupBusy(false);
            setPricingNotice(t('backupCreated'));
            refreshBackups();
          })
          .catch(() => {
            setBackupBusy(false);
            setPricingNotice(t('backupFailed'));
          });
      };

      /** Download a full document backup (items, settings, reviews, types). */
      const exportFullBackup = () => {
        readState()
          .then((document) => {
            const payload = JSON.stringify(
              {
                version: 2,
                exportedAt: new Date().toISOString(),
                items: document.items,
                settings: document.settings,
                reviews: document.reviews,
                types: document.types,
              },
              null,
              2,
            );
            downloadTextFile('quick-note-backup-' + new Date().toISOString().slice(0, 10) + '.json', payload, 'application/json');
            setPricingNotice(t('exported'));
          })
          .catch(() => setPricingNotice(t('backupFailed')));
      };

      /** Import a full backup JSON file through the optimistic-locked write path. */
      const importFullBackup = (event) => {
        const input = event.target;
        const file = input.files && input.files[0];
        if (!file) return;
        file
          .text()
          .then((text) => {
            let parsed;
            try {
              parsed = JSON.parse(text);
            } catch (error) {
              setPricingNotice(t('backupFailed'));
              return;
            }
            if (!parsed || !Array.isArray(parsed.items)) {
              setPricingNotice(t('backupFailed'));
              return;
            }
            readState()
              .then((document) =>
                putState(
                  parsed.items,
                  parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : document.settings,
                  Array.isArray(parsed.reviews) ? parsed.reviews : document.reviews,
                  Array.isArray(parsed.types) ? parsed.types : document.types,
                  { revision: document.revision },
                ),
              )
              .then(() => {
                setPricingNotice(t('imported'));
                sync();
              })
              .catch(() => setPricingNotice(t('backupFailed')));
          })
          .catch(() => setPricingNotice(t('backupFailed')))
          .finally(() => {
            input.value = '';
          });
      };

      /** Restore one rolling backup (two-step confirmation). */
      const restoreBackup = (name) => {
        if (restoreConfirm !== name) {
          setRestoreConfirm(name);
          return;
        }
        setRestoreConfirm('');
        setBackupBusy(true);
        readProtected(BACKUP_URL + '?name=' + encodeURIComponent(name))
          .then((payload) => {
            const document = payload && payload.document;
            if (!document || !Array.isArray(document.items)) throw new Error('bad backup');
            return readState().then((current) =>
              putState(document.items, document.settings, document.reviews, document.types, { revision: current.revision }),
            );
          })
          .then(() => {
            setBackupBusy(false);
            setPricingNotice(t('backupRestored'));
            sync();
          })
          .catch(() => {
            setBackupBusy(false);
            setPricingNotice(t('backupFailed'));
          });
      };

      const requestNotify = () => {
        if (typeof window.Notification !== 'function') {
          setPermission('unsupported');
          return;
        }
        try {
          window.Notification.requestPermission()
            .then((value) => setPermission(value))
            .catch(() => setPermission(window.Notification.permission));
        } catch (error) {
          setPermission(window.Notification.permission);
        }
      };

      return h(
        'div',
        {
          className: 'dshqn-settings' + (prefs.density === 'compact' ? ' dshqn-compact' : ''),
          style: prefs.accent.length > 0 ? { '--dshqn-accent': prefs.accent } : undefined,
        },
        h('style', { key: 'styles' }, STYLES + '\n' + STYLE_UPGRADES),
        h(
          'header',
          { className: 'dshqn-settings-head' },
          h('span', { className: 'dshqn-header-icon', 'aria-hidden': true }, h(NoteIcon, { size: 20 })),
          h(
            'div',
            { className: 'dshqn-headings' },
            h('h2', { className: 'dshqn-settings-title' }, t('settingsTitle')),
            h('p', { className: 'dshqn-settings-hint' }, t('settingsHint')),
          ),
        ),
        h(
          'section',
          { className: 'dshqn-settings-group' },
          h('p', { className: 'dshqn-settings-label' }, t('modulesTitle')),
          h(
            'label',
            { className: 'dshqn-settings-row' },
            h('input', { type: 'checkbox', checked: prefs.modules.note, onChange: () => toggle('note') }),
            t('moduleNotes'),
          ),
          h(
            'label',
            { className: 'dshqn-settings-row' },
            h('input', { type: 'checkbox', checked: prefs.modules.task, onChange: () => toggle('task') }),
            t('moduleTasks'),
          ),
          h(
            'label',
            { className: 'dshqn-settings-row' },
            h('input', { type: 'checkbox', checked: prefs.modules.card, onChange: () => toggle('card') }),
            t('moduleCards'),
          ),
          h(
            'label',
            { className: 'dshqn-settings-row' },
            h('input', { type: 'checkbox', checked: prefs.modules.health, onChange: () => toggle('health') }),
            t('moduleHealth'),
          ),
          h(
            'label',
            { className: 'dshqn-settings-row' },
            h('input', { type: 'checkbox', checked: prefs.modules.record, onChange: () => toggle('record') }),
            t('moduleRecords'),
          ),
        ),
        h(
          'section',
          { className: 'dshqn-settings-group' },
          h('p', { className: 'dshqn-settings-label' }, t('appearanceTitle')),
          h(
            'div',
            { className: 'dshqn-settings-row' },
            h('span', null, t('densityTitle')),
            h(Segmented, {
              items: [
                { id: 'comfortable', label: t('densityComfortable') },
                { id: 'compact', label: t('densityCompact') },
              ],
              value: prefs.density,
              onChange: (id) => props.prefs.set({ ...prefs, density: id }),
              label: t('densityTitle'),
            }),
          ),
          h(
            'div',
            { className: 'dshqn-settings-row' },
            h('span', null, t('accentTitle')),
            h(
              'div',
              { className: 'dshqn-accent-row', role: 'group', 'aria-label': t('accentTitle') },
              [
                ['', t('accentDefault')],
                ['var(--dsw-alias-state-success-primary)', t('accentSuccess')],
                ['var(--dsw-alias-state-warn-primary)', t('accentWarn')],
                ['var(--dsw-alias-state-error-primary)', t('accentError')],
              ].map(([value, label]) =>
                h('button', {
                  key: label,
                  type: 'button',
                  title: label,
                  'aria-label': label,
                  className: prefs.accent === value ? 'dshqn-accent-swatch dshqn-accent-swatch-active' : 'dshqn-accent-swatch',
                  style: { background: value.length === 0 ? 'var(--dsw-alias-brand-primary)' : value },
                  onClick: () => props.prefs.set({ ...prefs, accent: value }),
                }),
              ),
              h('input', {
                className: 'dshqn-accent-input',
                type: 'color',
                title: t('accentCustom'),
                'aria-label': t('accentCustom'),
                value: /^#[0-9a-fA-F]{6}$/.test(prefs.accent) ? prefs.accent : undefined,
                onChange: (event) => props.prefs.set({ ...prefs, accent: normalizeAccent(event.target.value) }),
              }),
            ),
          ),
          h(
            'div',
            { className: 'dshqn-settings-row' },
            h('span', null, t('reviewGoalLabel')),
            h('input', {
              className: 'dshqn-field',
              type: 'number',
              min: 1,
              max: 500,
              value: String(prefs.reviewGoal),
              'aria-label': t('reviewGoalLabel'),
              onChange: (event) => {
                const value = Number(event.target.value);
                if (Number.isFinite(value)) {
                  props.prefs.set({ ...prefs, reviewGoal: Math.max(1, Math.min(500, Math.floor(value))) });
                }
              },
            }),
            h('span', { className: 'dshqn-settings-hint' }, t('reviewGoalHint')),
          ),
        ),
        h(
          'section',
          { className: 'dshqn-settings-group' },
          h('p', { className: 'dshqn-settings-label' }, t('markdownTitle')),
          h('p', { className: 'dshqn-settings-hint' }, t('markdownHint')),
          h(
            'div',
            { className: 'dshqn-settings-row' },
            h('input', {
              className: 'dshqn-field',
              type: 'text',
              value: markdownDir,
              placeholder: t('markdownDirPlaceholder'),
              'aria-label': t('markdownTitle'),
              onChange: (event) => setMarkdownDir(event.target.value),
            }),
            h('button', { type: 'button', className: 'dshqn-button', onClick: () => runMarkdown('export'), disabled: markdownBusy }, t('markdownExport')),
            h('button', { type: 'button', className: 'dshqn-button', onClick: () => runMarkdown('import'), disabled: markdownBusy }, t('markdownImport')),
          ),
          markdownNotice.length > 0 ? h('p', { className: 'dshqn-settings-hint' }, markdownNotice) : null,
        ),
        h(
          'section',
          { className: 'dshqn-settings-group' },
          h('p', { className: 'dshqn-settings-label' }, t('shareTitle')),
          h('p', { className: 'dshqn-settings-hint' }, t('shareHint')),
          h(
            'div',
            { className: 'dshqn-settings-row' },
            h('button', { type: 'button', className: 'dshqn-button', onClick: createShareSnapshot, disabled: shareBusy }, t('shareCreate')),
          ),
          shareNotice.length > 0 ? h('p', { className: 'dshqn-settings-hint' }, shareNotice) : null,
        ),
        h(
          'section',
          { className: 'dshqn-settings-group' },
          h('p', { className: 'dshqn-settings-label' }, t('writeModeTitle')),
          h('p', { className: 'dshqn-settings-hint' }, t('writeModeHint')),
          h(Segmented, {
            items: [
              { id: 'patch', label: t('writeModePatch') },
              { id: 'full', label: t('writeModeFull') },
            ],
            value: prefs.writeMode === 'full' ? 'full' : 'patch',
            label: t('writeModeTitle'),
            onChange: (id) => props.prefs.set({ ...prefs, writeMode: id }),
          }),
        ),
        h(
          'section',
          { className: 'dshqn-settings-group' },
          h('p', { className: 'dshqn-settings-label' }, t('backupTitle')),
          h('p', { className: 'dshqn-settings-hint' }, t('backupHint')),
          h(
            'div',
            { className: 'dshqn-settings-row' },
            h('button', { type: 'button', className: 'dshqn-button', onClick: createBackupNow, disabled: backupBusy }, t('backupNow')),
            h('button', { type: 'button', className: 'dshqn-button', onClick: exportFullBackup }, t('backupExport')),
            h(
              'button',
              {
                type: 'button',
                className: 'dshqn-button',
                onClick: () => {
                  if (backupFileInput.current !== null) backupFileInput.current.click();
                },
              },
              t('backupImport'),
            ),
            h('input', {
              ref: backupFileInput,
              className: 'dshqn-hidden-input',
              type: 'file',
              accept: 'application/json,.json',
              onChange: importFullBackup,
            }),
          ),
          h(
            'div',
            { className: 'dshqn-settings-group' },
            h('p', { className: 'dshqn-settings-label' }, t('shortcutCustomTitle')),
            h(
              'label',
              { className: 'dshqn-settings-row' },
              h('span', null, t('shortcutPalette')),
              h('input', { className: 'dshqn-field', type: 'text', value: shortcutPaletteDraft, onChange: (event) => setShortcutPaletteDraft(event.target.value) }),
            ),
            h(
              'label',
              { className: 'dshqn-settings-row' },
              h('span', null, t('shortcutHelp')),
              h('input', { className: 'dshqn-field', type: 'text', value: shortcutHelpDraft, onChange: (event) => setShortcutHelpDraft(event.target.value) }),
            ),
            h('button', { type: 'button', className: 'dshqn-button', onClick: saveShortcuts }, t('saved')),
          ),
          h(
            'label',
            { className: 'dshqn-settings-row' },
            h('span', null, t('backupInterval')),
            h('input', { className: 'dshqn-field', type: 'number', min: '1', max: '1440', value: backupInterval, onChange: (event) => setBackupInterval(event.target.value) }),
            h('button', { type: 'button', className: 'dshqn-button', onClick: saveBackupInterval }, t('saved')),
            h(
              'span',
              { className: 'dshqn-settings-hint', style: { display: 'inline-flex', alignItems: 'center', gap: '6px' } },
              t('backupProgress') + ' ' + (backups.length === 0 ? 0 : Math.min(100, Math.round(((Date.now() - backups[0].at) / (Number(backupInterval) * 60000)) * 100))) + '%',
              h('span', { style: { display: 'inline-block', width: '80px', height: '6px', borderRadius: '999px', background: 'var(--dsw-alias-bg-layer-2)', overflow: 'hidden' } }, h('span', { style: { display: 'block', width: (backups.length === 0 ? 0 : Math.min(100, Math.round(((Date.now() - backups[0].at) / (Number(backupInterval) * 60000)) * 100))) + '%', height: '100%', background: 'var(--dshqn-accent)' } })),
            ),
          ),
          backupDiff !== null
            ? h(
                'p',
                { className: 'dshqn-settings-hint' },
                fillTemplate(t('backupDiffSummary'), {
                  name: backupDiff.name || '',
                  added: backupDiff.added,
                  removed: backupDiff.removed,
                  changed: backupDiff.changed,
                }) + (backupDiff.settingsChanged ? ' · ' + t('backupDiffSettings') : ''),
              )
            : null,
          backups.length === 0
            ? h('p', { className: 'dshqn-settings-hint' }, t('backupEmpty'))
            : h(
                'div',
                { className: 'dshqn-backup-list' },
                backups.slice(0, 10).map((backup) =>
                  h(
                    'div',
                    { key: backup.name, className: 'dshqn-backup-row' },
                    h('span', { className: 'dshqn-backup-name' }, backup.name.replace('items-', '').replace('.json', '')),
                    h('span', { className: 'dshqn-settings-hint' }, formatBytes(backup.size)),
                    h('button', { type: 'button', className: 'dshqn-button', onClick: () => previewBackupDiff(backup.name), disabled: diffBusy }, t('backupDiff')),
                    h(
                      'button',
                      {
                        type: 'button',
                        className: restoreConfirm === backup.name ? 'dshqn-button dshqn-button-danger' : 'dshqn-button',
                        onClick: () => restoreBackup(backup.name),
                        disabled: backupBusy,
                      },
                      restoreConfirm === backup.name ? t('backupRestoreConfirm') : t('backupRestore'),
                    ),
                  ),
                ),
              ),
        ),
        h(
          'section',
          { className: 'dshqn-settings-group' },
          h('p', { className: 'dshqn-settings-label' }, t('briefLabel')),
          h('p', { className: 'dshqn-settings-hint' }, t('briefHint')),
          h(
            'label',
            { className: 'dshqn-settings-row' },
            h('input', { type: 'checkbox', checked: brief, disabled: briefBusy, onChange: toggleBrief }),
            t('briefLabel'),
          ),
        ),
        h(
          'section',
          { className: 'dshqn-settings-group' },
          h('p', { className: 'dshqn-settings-label' }, t('settingsPricingTitle')),
          h('p', { className: 'dshqn-settings-hint' }, t('settingsPricingHint')),
          h(
            'label',
            { className: 'dshqn-settings-row' },
            h('span', null, t('settingsPriceHit')),
            h('input', {
              className: 'dshqn-field',
              type: 'text',
              inputMode: 'decimal',
              value: priceHit,
              onChange: (event) => {
                setPricingNotice('');
                setPriceHit(event.target.value);
              },
            }),
          ),
          h(
            'label',
            { className: 'dshqn-settings-row' },
            h('span', null, t('settingsPriceMiss')),
            h('input', {
              className: 'dshqn-field',
              type: 'text',
              inputMode: 'decimal',
              value: priceMiss,
              onChange: (event) => {
                setPricingNotice('');
                setPriceMiss(event.target.value);
              },
            }),
          ),
          h(
            'label',
            { className: 'dshqn-settings-row' },
            h('span', null, t('settingsPriceOutput')),
            h('input', {
              className: 'dshqn-field',
              type: 'text',
              inputMode: 'decimal',
              value: priceOutput,
              onChange: (event) => {
                setPricingNotice('');
                setPriceOutput(event.target.value);
              },
            }),
          ),
          h(
            'div',
            { className: 'dshqn-settings-row' },
            h('span', { className: 'dshqn-settings-hint' }, pricingNotice),
            h('span', { style: { flex: '1 1 auto' } }),
            h('button', { type: 'button', className: 'dshqn-button', onClick: savePricing, disabled: pricingBusy }, t('settingsSave')),
          ),
        ),
        h(
          'section',
          { className: 'dshqn-settings-group' },
          h('p', { className: 'dshqn-settings-label' }, t('notifySection')),
          h('p', { className: 'dshqn-settings-hint' }, t('notifyTitle')),
          h(
            'div',
            { className: 'dshqn-settings-row' },
            h(
              'span',
              null,
              permission === 'granted'
                ? t('notifyGranted')
                : permission === 'unsupported'
                  ? t('notifyUnavailable')
                  : t('notifyDenied'),
            ),
            h('span', { style: { flex: '1 1 auto' } }),
            permission === 'granted' || permission === 'unsupported'
              ? null
              : h('button', { type: 'button', className: 'dshqn-button', onClick: requestNotify }, t('notifyEnable')),
          ),
        ),
        h(
          'section',
          { className: 'dshqn-settings-group' },
          h('p', { className: 'dshqn-settings-label' }, t('storageTitle')),
          h('p', { className: 'dshqn-settings-mono' }, file.length > 0 ? file : t('storageUnknown')),
          h(
            'div',
            { className: 'dshqn-settings-row' },
            h('span', null, t('countLabel') + ': ' + (count === null ? '—' : String(count))),
            h('span', { style: { flex: '1 1 auto' } }),
            h('span', null, syncState === 'synced' ? t('saved') : syncState === 'offline' ? t('offline') : t('loading')),
            h('button', { type: 'button', className: 'dshqn-button', onClick: sync }, t('syncNow')),
          ),
        ),
      );
    }

    /** Frame-wide reminder banner for due-today/overdue open tasks and medication doses. */
    function DueReminder(props) {
      const t = translateSeat(props.t);
      const [items, setItems] = React.useState([]);
      const [dismissed, setDismissed] = React.useState(readReminderDismissed);

      React.useEffect(() => {
        let cancelled = false;
        const load = () => {
          readState()
            .then((document) => {
              if (cancelled) return;
              const visible = document.items.filter((item) => !item.deletedAt);
              setItems(visible);
              const openPanel = () => {
                if (typeof props.selectPanel === 'function') props.selectPanel(PANEL_ID);
              };
              notifyDueMeds(visible, t, openPanel);
              notifyDueCards(visible, t, openPanel);
            })
            .catch(() => {});
        };
        load();
        const timer = window.setInterval(load, 60000);
        return () => {
          cancelled = true;
          window.clearInterval(timer);
        };
      }, []);

      const dayKey = localDayKey();
      const counts = dueCounts(items);
      const meds = medsDueNow(items, Date.now());
      const cards = items.filter(
        (item) => item.kind === 'card' && item.review.dueAt !== null && item.review.dueAt <= Date.now(),
      ).length;
      const total = counts.today + counts.overdue + meds.length + cards;
      if (total === 0 || dismissed === dayKey) return null;

      const dismiss = () => {
        writeReminderDismissed(dayKey);
        setDismissed(dayKey);
      };
      const medTimes = meds.map((dose) => dose.time + (dose.title.length > 0 ? ' ' + dose.title : '')).join('，');
      return h(
        'div',
        { className: 'dshqn-reminder', role: 'status' },
        h('style', { key: 'styles' }, STYLES + '\n' + STYLE_UPGRADES),
        counts.today + counts.overdue > 0
          ? h('span', { className: 'dshqn-reminder-text' }, fillTemplate(t('reminderText'), counts))
          : null,
        meds.length > 0 ? h('span', { className: 'dshqn-reminder-text' }, fillTemplate(t('reminderMeds'), { times: medTimes })) : null,
        cards > 0 ? h('span', { className: 'dshqn-reminder-text' }, fillTemplate(t('reminderCards'), { count: cards })) : null,
        h(
          'button',
          {
            type: 'button',
            className: 'dshqn-reminder-button',
            onClick: () => {
              dismiss();
              if (typeof props.selectPanel === 'function') props.selectPanel(PANEL_ID);
            },
          },
          t('reminderView'),
        ),
        h('button', { type: 'button', className: 'dshqn-reminder-button', onClick: dismiss }, t('reminderDismiss')),
      );
    }

    /** Assistant-message action: save that message's text as one Quick Notes note. */
    function SaveToNotesAction(props) {
      const t = translateSeat(props.t);
      const text = typeof props.useChat === 'function' ? props.useChat((snapshot) => chatMessageText(snapshot, props.messageId)) : '';
      const [state, setState] = React.useState('idle');
      if (typeof text !== 'string' || text.trim().length === 0) return null;
      const label =
        state === 'saving'
          ? t('savingNote')
          : state === 'saved'
            ? t('savedNote')
            : state === 'exists'
              ? t('existsNote')
              : state === 'failed'
                ? t('noteSaveFailed')
                : t('saveToNotes');
      const save = () => {
        if (state === 'saving' || state === 'saved') return;
        const body = text.trim().slice(0, 200000);
        const now = Date.now();
        const firstLine = body.split('\n').find((line) => line.trim().length > 0) || '';
        const item = {
          id: nextItemId(),
          kind: 'note',
          title: firstLine.slice(0, 60),
          body,
          tags: ['对话'],
          status: 'open',
          priority: 'normal',
          due: null,
          doneAt: null,
          review: normalizeReview(undefined),
          health: normalizeHealth(undefined),
          createdAt: now,
          updatedAt: now,
        };
        setState('saving');
        readState()
          .then((document) => {
            if (document.items.some((existing) => existing.kind === 'note' && existing.body === body)) {
              setState('exists');
              return undefined;
            }
            return putState([item, ...document.items], document.settings, document.reviews, document.types, { revision: document.revision }).then(() => setState('saved'));
          })
          .catch(() => setState('failed'));
      };
      return h(
        'span',
        { className: 'dshqn-save-note' },
        h('style', { key: 'styles' }, STYLES + '\n' + STYLE_UPGRADES),
        h(
          'button',
          {
            type: 'button',
            className: state === 'saved' ? 'dshqn-save-button dshqn-save-button-done' : 'dshqn-save-button',
            onClick: save,
            disabled: state === 'saving' || state === 'saved',
            title: label,
            'aria-label': label,
          },
          h(NoteIcon, { size: 14 }),
        ),
      );
    }

    /** The sidebar icon: the label comes from the list registration, the glyph from here. */
    function SidebarIcon({ size }) {
      return h(NoteIcon, { size });
    }

    /** Keep a render failure visible instead of leaving the main panel blank. */
    var PanelBoundary = class extends React.Component {
      constructor(props) {
        super(props);
        this.state = { error: null };
      }

      static getDerivedStateFromError(error) {
        return { error };
      }

      render() {
        const error = this.state.error;
        if (error === null) return h(WorkbenchPanel, this.props);
        const t = translateSeat(this.props.t);
        let detail = 'unknown error';
        try {
          detail = String((error && (error.stack || error.message)) || error);
        } catch (failure) {
          detail = 'unprintable error';
        }
        return h(
          'div',
          { className: 'dshqn-page' },
          h('style', { key: 'styles' }, STYLES + '\n' + STYLE_UPGRADES),
          h(
            'header',
            { className: 'dshqn-header' },
            h('span', { className: 'dshqn-header-icon', 'aria-hidden': true }, h(NoteIcon, { size: 18 })),
            h(
              'div',
              { className: 'dshqn-headings' },
              h('h1', { className: 'dshqn-title' }, t('renderFailed')),
              h('p', { className: 'dshqn-subtitle' }, t('renderFailedHint')),
            ),
          ),
          h(
            'section',
            { className: 'dshqn-card' },
            h('pre', { className: 'dshqn-diagnostic' }, detail),
            h(
              'footer',
              { className: 'dshqn-diagnostic-meta' },
              t('diagnostics') + ': t=' + typeof this.props.t + ', selectPanel=' + typeof this.props.selectPanel,
            ),
          ),
          h(
            'div',
            { className: 'dshqn-actions' },
            h('button', { type: 'button', className: 'dshqn-button', onClick: () => window.location.reload() }, t('reload')),
          ),
        );
      }
    };

    /** The settings fallback so a broken settings section cannot blank the settings page. */
    var SettingsBoundary = class extends React.Component {
      constructor(props) {
        super(props);
        this.state = { error: null };
      }

      static getDerivedStateFromError(error) {
        return { error };
      }

      render() {
        if (this.state.error === null) return h(SettingsSection, this.props);
        const t = translateSeat(this.props.t);
        return h(
          'div',
          { className: 'dshqn-settings' },
          h('p', { className: 'dshqn-settings-hint' }, String(this.state.error)),
          h('button', { type: 'button', className: 'dshqn-button', onClick: () => window.location.reload() }, t('reload')),
        );
      }
    };

    /** Count the ambient capture targets shown beside the composer. */
    function captureCounts(items) {
      const now = Date.now();
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      const todayEnd = dayStart.getTime() + 86400000;
      let due = 0;
      let cards = 0;
      let meds = 0;
      for (const item of items) {
        if (item.deletedAt !== null) continue;
        if (item.kind === 'task' && item.status === 'open' && item.due !== null && item.due < todayEnd) due += 1;
        else if (item.kind === 'card' && item.review.dueAt !== null && item.review.dueAt <= now) cards += 1;
        else if (item.kind === 'med' && item.health.active && item.health.times.length > 0) meds += 1;
      }
      return { due, cards, meds };
    }

    /** Sidebar session-row action: save that session (id + title) as one note. */
    function SaveSessionRowAction(props) {
      const t = translateSeat(props.t);
      const [state, setState] = React.useState('idle');
      const sessionId = typeof props.sessionId === 'string' ? props.sessionId : '';
      const displayTitle = typeof props.displayTitle === 'string' ? props.displayTitle.trim() : '';
      if (sessionId.length === 0) return null;
      const label =
        state === 'saving'
          ? t('savingNote')
          : state === 'saved'
            ? t('savedSessionNote')
            : state === 'exists'
              ? t('existsSessionNote')
              : state === 'failed'
                ? t('sessionNoteFailed')
                : t('saveSessionNote');
      const save = () => {
        if (state === 'saving' || state === 'saved') return;
        const body = '来源会话：' + sessionId;
        const now = Date.now();
        setState('saving');
        readState()
          .then((document) => {
            if (document.items.some((item) => item.kind === 'note' && typeof item.body === 'string' && item.body.includes(sessionId))) {
              setState('exists');
              return undefined;
            }
            const item = {
              id: nextItemId(),
              kind: 'note',
              title: displayTitle.length > 0 ? displayTitle.slice(0, 80) : t('sessionNoteFallback'),
              body,
              tags: ['会话'],
              status: 'open',
              priority: 'normal',
              due: null,
              doneAt: null,
              review: normalizeReview(undefined),
              health: normalizeHealth(undefined),
              createdAt: now,
              updatedAt: now,
            };
            return putState([item, ...document.items], document.settings, document.reviews, document.types, { revision: document.revision }).then(() =>
              setState('saved'),
            );
          })
          .catch(() => setState('failed'));
      };
      return h(
        'button',
        { type: 'button', className: 'dshqn-session-save', title: label, 'aria-label': label, onClick: save, disabled: state === 'saving' },
        h(Icon, { name: 'note', size: 14 }),
      );
    }

    /** Ambient composer-dock chip: today's due tasks / reviews / medication plans. */
    function ComposerDock(props) {
      const t = translateSeat(props.t);
      const [counts, setCounts] = React.useState(null);
      const refresh = () => {
        readState()
          .then((document) => setCounts(captureCounts(document.items)))
          .catch(() => {});
      };
      React.useEffect(() => {
        refresh();
        if (typeof window.setInterval !== 'function') return undefined;
        const timer = window.setInterval(refresh, 60000);
        return () => window.clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      if (counts === null || counts.due + counts.cards + counts.meds === 0) return null;
      return h(
        'button',
        {
          type: 'button',
          className: 'dshqn-dock-chip',
          title: t('quickNoteDockTitle'),
          onClick: () => {
            if (typeof props.openPanel === 'function') props.openPanel();
          },
        },
        h(Icon, { name: 'note', size: 14 }),
        fillTemplate(t('quickNoteDock'), counts),
      );
    }

    /** Resample captured Float32 audio to 16kHz mono and encode a PCM16 WAV blob. */
    function encodeVoiceWav(chunks, sampleRate) {
      const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      if (total === 0) return null;
      const merged = new Float32Array(total);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }
      const ratio = (sampleRate || 48000) / 16000;
      const length = Math.max(1, Math.floor(merged.length / ratio));
      const samples = new Int16Array(length);
      for (let index = 0; index < length; index += 1) {
        const start = Math.floor(index * ratio);
        const end = Math.min(merged.length, Math.max(start + 1, Math.floor((index + 1) * ratio)));
        let sum = 0;
        for (let cursor = start; cursor < end; cursor += 1) sum += merged[cursor];
        const value = Math.max(-1, Math.min(1, sum / (end - start)));
        samples[index] = value < 0 ? value * 0x8000 : value * 0x7fff;
      }
      const buffer = new ArrayBuffer(44 + samples.length * 2);
      const view = new DataView(buffer);
      const writeText = (at, text) => {
        for (let index = 0; index < text.length; index += 1) view.setUint8(at + index, text.charCodeAt(index));
      };
      writeText(0, 'RIFF');
      view.setUint32(4, 36 + samples.length * 2, true);
      writeText(8, 'WAVE');
      writeText(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, 16000, true);
      view.setUint32(28, 32000, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeText(36, 'data');
      view.setUint32(40, samples.length * 2, true);
      new Int16Array(buffer, 44).set(samples);
      return new Blob([buffer], { type: 'audio/wav' });
    }

    /** Composer-toolbar voice capture: records a WAV, transcribes it, saves a note. */
    function VoiceNoteButton(props) {
      const t = translateSeat(props.t);
      const [phase, setPhase] = React.useState('idle');
      const [notice, setNotice] = React.useState('');
      const recorderRef = React.useRef(null);
      const phaseRef = React.useRef('idle');
      const setPhaseBoth = (next) => {
        phaseRef.current = next;
        setPhase(next);
      };
      const upload = (blob) => {
        const token = readToken.length > 0 ? Promise.resolve(readToken) : fetchReadToken();
        return token
          .then((value) =>
            window.fetch(VOICE_URL, {
              method: 'POST',
              headers: { 'content-type': 'audio/wav', 'x-language': 'zh', ...(value.length > 0 ? { 'x-quick-note-token': value } : {}) },
              body: blob,
            }),
          )
          .then((response) => {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
          })
          .then((payload) => {
            const text = payload && typeof payload.text === 'string' ? payload.text.trim() : '';
            if (text.length === 0) {
              setNotice(t('voiceEmpty'));
              setPhaseBoth('idle');
              return;
            }
            return readState().then((document) => {
              const now = Date.now();
              const item = {
                id: nextItemId(),
                kind: 'note',
                title: text.slice(0, 60),
                body: text,
                tags: ['语音'],
                status: 'open',
                priority: 'normal',
                due: null,
                doneAt: null,
                createdAt: now,
                updatedAt: now,
              };
              return putState([item, ...document.items], document.settings, document.reviews, document.types, { revision: document.revision }).then(() => {
                setNotice(t('voiceSaved'));
                setPhaseBoth('idle');
              });
            });
          })
          .catch(() => {
            setNotice(t('voiceFailed'));
            setPhaseBoth('idle');
          });
      };
      const stop = () => {
        const recorder = recorderRef.current;
        recorderRef.current = null;
        setPhaseBoth('busy');
        if (recorder === null) return;
        try {
          recorder.processor.disconnect();
          recorder.source.disconnect();
        } catch (error) {
          // already disconnected
        }
        for (const track of recorder.stream.getTracks()) track.stop();
        recorder.context.close().catch(() => {});
        const blob = encodeVoiceWav(recorder.chunks, recorder.sampleRate);
        if (blob === null) {
          setNotice(t('voiceEmpty'));
          setPhaseBoth('idle');
          return;
        }
        upload(blob);
      };
      const start = () => {
        if (typeof navigator === 'undefined' || !navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
          setNotice(t('voiceUnavailable'));
          return;
        }
        if (typeof window.AudioContext !== 'function' && typeof window.webkitAudioContext !== 'function') {
          setNotice(t('voiceUnavailable'));
          return;
        }
        setPhaseBoth('starting');
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            const AudioCtor = window.AudioContext || window.webkitAudioContext;
            const context = new AudioCtor();
            const source = context.createMediaStreamSource(stream);
            const processor = context.createScriptProcessor(4096, 1, 1);
            const chunks = [];
            processor.onaudioprocess = (event) => {
              chunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));
            };
            source.connect(processor);
            processor.connect(context.destination);
            recorderRef.current = { stream, context, source, processor, chunks, sampleRate: context.sampleRate };
            setPhaseBoth('recording');
          })
          .catch(() => {
            setNotice(t('voicePermission'));
            setPhaseBoth('idle');
          });
      };
      const onClick = () => {
        if (phaseRef.current === 'recording') stop();
        else if (phaseRef.current === 'idle') start();
      };
      const label = phase === 'recording' ? t('voiceRecording') : phase === 'busy' ? t('voiceBusy') : t('voiceCapture');
      return h(
        'span',
        { className: 'dshqn-voice-wrap' },
        h(
          'button',
          {
            type: 'button',
            className: 'dshqn-voice-button' + (phase === 'recording' ? ' dshqn-voice-recording' : ''),
            title: t('voiceCapture'),
            'aria-label': t('voiceCapture'),
            disabled: phase === 'starting' || phase === 'busy',
            onClick,
          },
          h(Icon, { name: 'microphone', size: 14 }),
          label,
        ),
        notice.length > 0 ? h('span', { className: 'dshqn-voice-notice' }, notice) : null,
      );
    }

    /** Compact composer-toolbar button that opens the panel for a quick capture. */
    function QuickCaptureButton(props) {
      const t = translateSeat(props.t);
      return h(
        'button',
        {
          type: 'button',
          className: 'dshqn-capture-button',
          title: t('quickCaptureTitle'),
          'aria-label': t('quickCapture'),
          onClick: () => {
            if (typeof props.openPanel === 'function') props.openPanel();
          },
        },
        h(Icon, { name: 'plus', size: 14 }),
        t('quickCapture'),
      );
    }

    /** Notification bridge: consumes the Host timer's reminder snapshot. */
    function ReminderBridge(props) {
      const t = translateSeat(props.t);
      React.useEffect(() => {
        if (typeof window.Notification !== 'function' || window.Notification.permission !== 'granted') return undefined;
        let cancelled = false;
        const tick = () => {
          readProtected(REMINDERS_URL)
            .then((payload) => {
              if (cancelled || !payload || !Array.isArray(payload.items)) return;
              const dayKey = localDayKey();
              const known = readNotifiedKeys();
              let changed = false;
              for (const item of payload.items.slice(0, 10)) {
                const key = dayKey + '|host|' + item.id;
                if (known.includes(key)) continue;
                known.push(key);
                changed = true;
                const title = String(item.title || '').trim() || String(item.body || '').split('\n')[0] || item.kind;
                try {
                  new window.Notification(t('notifyTitle'), { body: title, tag: key });
                } catch (error) {
                  // notifications are best-effort
                }
              }
              if (payload.budget && payload.budget.over === true) {
                const budgetKey = dayKey + '|budget|' + payload.budget.limit;
                if (!known.includes(budgetKey)) {
                  known.push(budgetKey);
                  changed = true;
                  try {
                    new window.Notification(t('notifyTitle'), {
                      body: fillTemplate(t('reminderBudget'), { used: Number(payload.budget.todayCost).toFixed(2), limit: Number(payload.budget.limit).toFixed(2) }),
                      tag: budgetKey,
                    });
                  } catch (error) {
                    // notifications are best-effort
                  }
                }
              }
              if (payload.budget && payload.budget.warn === true) {
                const warnKey = dayKey + '|budget-warn|' + payload.budget.limit;
                if (!known.includes(warnKey)) {
                  known.push(warnKey);
                  changed = true;
                  try {
                    new window.Notification(t('notifyTitle'), {
                      body: fillTemplate(t('reminderBudgetWarn'), { used: Number(payload.budget.todayCost).toFixed(2), percent: payload.budget.percent, limit: Number(payload.budget.limit).toFixed(2) }),
                      tag: warnKey,
                    });
                  } catch (error) {
                    // notifications are best-effort
                  }
                }
              }
              if (changed) writeNotifiedKeys(known);
            })
            .catch(() => {});
        };
        tick();
        const timer = window.setInterval(tick, 60000);
        return () => {
          cancelled = true;
          window.clearInterval(timer);
        };
      }, []);
      return null;
    }

    /**
     * Contribute the sidebar entry, the workbench panel, and the settings section.
     * @param ctx - the browser plugin context.
     */
    /** Extra endpoint used by the optimizer cleanup center. */
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


    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'quick-note: dictionaries');
      const t = ctx.locale.bind(NS);
      const prefs = getPrefsStore();

      ctx.slots.inject('main', () => ctx.slots.register(
        {
          name: 'main',
          key: PANEL_ID,
          locale: NS,
          inject: () => ({
            prefs,
            selectPanel: (panelId) => {
              ctx.layout.selectPanel(panelId);
            },
            openSession: (sessionId) => {
              try {
                const uiWorkspace = typeof ctx.get === 'function' ? ctx.get('uiWorkspace') : undefined;
                if (uiWorkspace && typeof uiWorkspace.openSession === 'function') uiWorkspace.openSession(sessionId);
              } catch (error) {
                // navigation is best-effort
              }
            },
          }),
        },
        PanelBoundary,
      ));

      ctx.slots.inject('sidebar.panellist', () => ctx.slots.register(
        {
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: 20,
          label: () => t('panel'),
          locale: NS,
        },
        SidebarIcon,
      ));

      ctx.slots.inject('settings.section', () => ctx.slots.register(
        {
          name: 'settings.section',
          id: PANEL_ID,
          order: 40,
          label: () => t('settingsTitle'),
          locale: NS,
          inject: () => ({ prefs }),
        },
        SettingsBoundary,
      ));

      ctx.slots.inject('shell.overlay', () => ctx.slots.register(
        {
          name: 'shell.overlay',
          id: 'quick-note-reminder-bridge',
          order: 41,
          locale: NS,
        },
        ReminderBridge,
      ));

      ctx.slots.inject('shell.overlay', () => ctx.slots.register(
        {
          name: 'shell.overlay',
          id: 'quick-note-reminder',
          order: 40,
          locale: NS,
          inject: () => ({
            selectPanel: (panelId) => {
              ctx.layout.selectPanel(panelId);
            },
          }),
        },
        DueReminder,
      ));

      ctx.slots.inject('conversation.chat.assistant-actions', () => ctx.slots.register(
        {
          name: 'conversation.chat.assistant-actions',
          id: 'quick-note-save',
          order: 20,
          locale: NS,
        },
        SaveToNotesAction,
      ));

      ctx.slots.inject('sidebar.workspaces.session.row.action', () => ctx.slots.register(
        {
          name: 'sidebar.workspaces.session.row.action',
          id: 'quick-note-session-save',
          order: 30,
          locale: NS,
        },
        SaveSessionRowAction,
      ));

      ctx.slots.inject('conversation.composer.dock', () => {
        const openPanel = () => ctx.layout.selectPanel(PANEL_ID);
        return ctx.slots.register(
          {
            name: 'conversation.composer.dock',
            id: 'quick-note-dock',
            order: 20,
            locale: NS,
          },
          (props) => h(ComposerDock, { ...props, openPanel }),
        );
      });

      ctx.slots.inject('conversation.input.left', () => {
        const openPanel = () => ctx.layout.selectPanel(PANEL_ID);
        return ctx.slots.register(
          {
            name: 'conversation.input.left',
            id: 'quick-note-capture',
            order: 20,
            locale: NS,
          },
          (props) => h(QuickCaptureButton, { ...props, openPanel }),
        );
      });

      ctx.slots.inject('conversation.input.left', () =>
        ctx.slots.register(
          {
            name: 'conversation.input.left',
            id: 'quick-note-voice',
            order: 21,
            locale: NS,
          },
          VoiceNoteButton,
        ),
      );
    }

    return { inject: ['slots', 'locale', 'layout'], apply };
  },
});
