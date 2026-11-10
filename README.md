# 侧栏管理台（dsh-quick-note）

在 DSH Web GUI 的左侧栏添加「管理台」入口，一个**通用管理工具**：默认先进入「概览」仪表盘，再按模块（笔记 / 任务 / 复习 / 健康）管理条目，并提供跨模块批量管理表格；同一份数据既能在面板里用，也能被 Agent 通过工具读写。

> 说明：为保证已安装状态、本机数据与 Agent 工具调用不中断，插件 id 仍为 `dsh-quick-note`，数据文件仍在 `$DSH_HOME/quick-note/items.json`，工具名仍为 `quick_note_*`；只有面向用户的名称与文案改为「管理台」。

## 功能

- **概览 / 管理台首页（默认视图）**：5 个可点击 KPI 卡片（今日到期+逾期任务、待复习卡片、近 7 天复习、今日健康记录+今日用药数、自定义记录数/类型数）、今日简报文本块（任务/复习/用药一览）、一键快捷新建（笔记/任务/卡片/指标/用药/记录）、自定义类型快捷入口（显示类型名与记录数）、最近 6 条更新（点击跳到对应模块并选中）；概览下隐藏搜索与新建按钮，保持仪表盘清爽，点标签可进入各模块
- **全部（管理台表格）**：跨模块条目列表，可按类型筛选（全部/笔记/任务/复习/健康）；支持排序（更新时间 / 标题 / 优先级 / 截止时间）与分页（每页 20 条）；勾选条目后可批量「标记完成 / 重新打开 / 改优先级（高/普通/低）/ 删除（两次确认）」，点击行跳到对应模块并选中该条目
- **自定义记录类型（通用管理）**：「记录」标签页可新建类型并为它定义字段（文本/数字/日期/复选/单选，单选支持候选值），然后按类型新增/编辑/删除记录；类型内支持搜索、按更新时间/标题排序、勾选批量删除，并可把当前筛选+排序「保存为视图」（视图随类型定义持久化到数据文件 `types[].views`）；删除类型会同时删除其记录
- **类型视图模板**：每个自定义类型可保存多个筛选视图（名称 + 搜索词 + 排序），点击视图一键恢复；视图可两次确认删除；编辑类型时显示「该类型下有 N 条记录，删除会一并删除」提示
- **跨类型批量**：「全部」表格的类型筛选新增「记录」，记录行显示所属类型名，与其他模块一样支持批量标记完成/重开/改优先级/删除
- **分析模块（系统 / 用量 / 价值合并）**：「分析」标签页内含三个子标签（价值 / 用量 / 系统），子标签选择持久化；系统子页通过 `/api/quick-note/admin` 展示运行环境（Profile/DSH 主目录/已装 Bundles/依赖）、数据文件与会话统计，仅读取
- **用量分析（细化）**：「用量」子标签按工作区统计 Token（缓存命中/未命中/输出/总量）与估算金额，新增 **缓存命中率、均 Token/会话、最近活跃**、**近 14 天用量折线**、**会话 Top 12**（会话 ID/工作区/Token/金额/最近活跃）；单价可在设置中修改
- **工作区价值分析**：「价值」子标签通过 `/api/quick-note/workspace-value` 给出每个工作区的**价值分（A/B/C/D）**、**现阶段水平**（活跃开发 / 维护期 / 近期活跃 / 放缓 / 沉寂）与**未来价值**（高潜力 / 稳定 / 放缓 / 低），并展示会话数、Tokens、估算金额、活跃天数、最近活跃、文件数/大小、近 14 天会话与动量；可人工评级并填写评价，保存到 `settings.workspaceNotes`
- **社会应用价值（深化评价）**：社会价值改为 **6 维加权**（文档 20 / 许可证 15 / 测试 10 / 社会影响 25 / 工程沉淀 15 / 持续活跃 15），展示维度进度条与总分、**优势 / 短板**、按优先级生成的**提升建议**（补充 README/文档/许可证/测试、关联社会领域、保持活跃）；识别领域与信号保留，人工社会评级与说明同样可保存
- **价值趋势与排序**：每天首次打开「价值」页自动记录一次评分快照（每工作区最多 12 次，存 `settings.valueHistory`），也可点「立即记录快照」手动记录；顶部「价值趋势」叠加最多 6 个工作区的走势（可切换价值分/社会价值，支持 7 天 / 30 天 / 全部时间范围，含 0/50/100 与首末日期坐标刻度，鼠标悬停数据点显示工作区、时间与分数）；卡片显示相对上次的变化与迷你趋势线；支持按工作区单独清理快照、全部清理（均两次确认），以及按「价值分 / 社会价值 / 金额」排序
- **价值榜单导出与归档**：价值页「导出 CSV」按当前排序导出工作区榜单（阶段/未来价值/社会等级/评级均输出本地化文案，带 UTF-8 BOM 便于 Excel 打开）；「导出 Markdown 报告」生成 `.md` 报告；「归档为笔记」把同一份报告存为带「工作区 / 价值报告」标签的笔记
- **模块（v1.11.0 合并后）**：概览（概览 / 全部）/ 知识（笔记 + 复习）/ 计划（列表 / 看板 / 日历 + 未来 7 天时间轴）/ 健康 / 记录 / 分析；仍可在「设置 → 管理台设置」中分别隐藏笔记、任务、复习、健康、记录
- **健康模块**：指标记录（数值/第二值/单位/测量时间，同指标名自动画趋势折线，顶部有最多 3 个指标的迷你趋势总览）与用药计划（每日 HH:mm 服药时间、启用/停用、今日用药摘要）；用药到点会出现在应用内提醒条，今日用药会进入每日简报
- **复习明细**：卡片编辑器显示该卡最近 5 次复习记录（时间 + 忘记/模糊/记得）
- **统一条目模型**：标题、正文、标签、状态（任务 open/done）、优先级（低/普通/高）、截止时间、完成时间、SM-2 复习状态
- **任务视图**：列表 / 看板切换；列表可按优先级或标签分组；过滤条（全部/未完成/已完成/今天/逾期）；看板分「未完成/已完成」两列，卡片可直接完成或重新打开
- **复习模块**：闪卡正面=标题、背面=正文；「开始复习」按 SM-2 队列逐张展示，先看正面→显示答案→忘记/模糊/记得，自动安排 1/6/N 天后的复习时间
- **指标详情**：点击健康指标视图顶部的指标卡片进入详情页——该指标的大趋势图、次数/最小/最大/平均值统计、按时间倒序的历史读数列表，可直接「记录一次」快捷录入；点击历史行就地弹出编辑层（数值/第二值/单位/测量时间，保存不离开详情页），行尾按钮两次点击删除该条读数
- **多指标对比**：指标视图工具栏「对比」开关，默认叠加最近 3 个指标（最近 30 天读数归一化到同一张迷你折线图）；图例标签可点击勾选/取消指标（最多 3 个），全部取消时显示提示
- **复习建议**：卡片编辑器底部显示 SM-2 建议的下次复习间隔（按当前 ease/间隔与「记得」评分推算）；已过下次复习时间的卡片额外提示「已逾期，建议尽快复习」
- **复习记忆保持率**：复习视图按「距上次复习的间隔」分桶统计保持率（1 天内 / 2–6 天 / 7–29 天 / 30 天以上，展示次数与百分比），来自复习日志
- **复习统计**：复习视图顶部显示待复习数、今日已复习数、连续复习天数、近 30 天评级分布（忘记/模糊/记得），以及近 30 天复习热力图；评分会写入复习日志（存于数据文件 `reviews`，最多保留 5000 条），因此热力图与连续天数是精确值
- **指标总览**：健康指标视图顶部最多 3 个指标卡片，点击进入该指标详情（大趋势图 + 统计 + 历史读数）
- **看板拖拽与排序**：看板卡片可拖到「未完成 / 已完成」列直接改状态，也可在同一列内拖到另一张卡片上前/后自定义顺序（`order` 字段持久化，未设置顺序的项目按更新时间排在后面）；拖到卡片上时该卡片顶部显示插入指示线
- **搜索**：匹配标题、正文、标签；Esc 清空
- **自动保存**：改动先落浏览器镜像，再同步到 Host 数据文件；Host 不可达时显示「仅保存在本机浏览器」，恢复后可再同步
- **导入 / 导出**：导出 JSON 备份（`version 2`，含条目与自定义记录类型 `types`）；导入按 id 合并条目与类型（不覆盖已有；兼容只有 items 的旧备份）
- **提醒**：应用内右下角到期提醒条（今天/逾期任务 + 用药到点，可当日关闭）；用药到点还会尝试系统通知（同一剂每天一次，点击通知直接打开面板，需在「设置 → 管理台设置 → 提醒」授权；不支持的环境会显示提示）；可在设置里开启「每轮对话注入今日待办简报」，让 Agent 每轮收到今天/逾期任务与今日用药摘要
- **Agent 工具**（Host 半区）：
  - `quick_note_search` — 搜索条目（`query` / `kind` / `priority` / `includeDone` / `limit`）
  - `quick_note_create` — 新建笔记、任务、闪卡、健康读数/用药或自定义记录（`kind` / `title` / `body` / `tags` / `priority` / `due`；`kind: "record"` 时传 `recordTypeId` + `recordValues`）
  - `quick_note_update` — 更新既有条目（标题/正文/标签/优先级/截止/完成状态/记录字段，只改传入字段）
  - `quick_note_complete` — 完成任务或重新打开（`id` / `status`）
  - `quick_note_type` — 管理自定义记录类型（`action: list/create/update/delete`；create/update 传 `name` + `fields`，并可传 `views` 直接设置筛选视图；delete 会级联删除该类型的记录）
  - `quick_note_workspace` — 工作区价值分析与报告（`action: list` 列出价值/社会价值/阶段/未来价值/Token/金额/评价；`rate` 按路径保存人工评级与说明（含社会价值）；`snapshot` 把当前分数写入价值趋势历史；`report` 返回所有工作区的 Markdown 价值报告；`archive` 把该报告保存为带「工作区/价值报告」标签的笔记）
- **对话捕获**：每条已完成的助手消息的操作行里有一个速记图标，点击即可把该回答存为一条笔记（自动加标签「对话」，内容重复时不会重复保存）
- **错误边界**：渲染失败时显示错误详情，不会只剩空白
- **旧数据迁移**：旧版单草稿（`dsh.quick-note.draft`）与旧便签列表（`dsh.quick-note.notes`）首次读取时自动迁移为条目

## UI 升级（v1.1.0 / v1.1.1 / v1.1.2）

- **设计系统**：在原有主题令牌之上新增独立的 v3 样式层（间距节奏、圆角层级、hover/active 过渡、focus-visible、响应式与 `prefers-reduced-motion`），全部使用 `--dsw-alias-*` 令牌与 `color-mix`，无任何字面色值
- **外壳**：头部改为 Hero 卡（品牌色渐变底、图标、标题、副标题、同步状态 pill、带图标刷新按钮）；标签页使用分段控件 + 线性图标；搜索框带内嵌图标；主要操作按钮使用品牌色实底
- **概览**：新增「今日概览」Hero（日期、四项即时指标 chips、快捷 CTA）；5 张 KPI 卡带图标与状态色强调条；6 张快捷新建卡（图标 + 说明文字）；「最近更新」改为图标 + 类型徽标列表；空状态统一使用 EmptyState 组件
- **业务页**：价值 / 用量 / 系统 / 全部 / 记录页统一 SectionHead；价值卡等级徽标按 A/B/C/D 着色并新增卡片头部布局；列表、看板、设置分组圆角与 hover 统一；设置页增加图标化头部
- **可访问性与适配**：保留所有 aria 与 focus-visible 语义；宽度 <860px 自动单列/换行；尊重系统 reduced-motion 偏好
- **外观设置**：设置页新增「外观」组——界面密度（舒适 / 紧凑，作用于面板与设置页）与强调色（默认品牌色 / 绿 / 黄 / 红，或自定义取色器中的十六进制色），偏好存 `localStorage` 的 `dsh.quick-note.prefs.v2`
- **KPI 迷你趋势线**：五张概览 KPI 卡内嵌近 7 天迷你折线（任务=未来 7 天到期分布、卡片=待复习分布、复习=近 7 天复习量、健康=近 7 天指标记录、记录=近 7 天新建记录）
- **骨架屏加载态**：首屏、价值、用量、系统页加载时显示带 shimmer 动画的骨架卡片，替代纯文字提示
- **拖拽排序动画**：任务看板卡片悬停抬升、拖拽缩放、放置脉冲、目标列高亮，全部基于 CSS 过渡/关键帧并尊重 reduced-motion
- **布局修正（v1.1.2，依据真机截图）**：标签页 `white-space: nowrap` + 横向滚动，避免中文标签逐字换行；Hero 去掉与页头重复的标题/副标题，改为「日期 + 今日概览 + 摘要 + CTA」；按钮内图标与文字统一 6px 间距；宽屏（≥1080px）概览 KPI 固定五列；KPI 迷你趋势线在零数据时也绘制基线，卡片视觉更完整
- 中英文案同步（新增外观相关 10 键，移除 3 个不再展示的加载提示键），回归测试新增 UI 结构断言、交互样式断言与 CSS 括号平衡检查

## 深度功能（v1.2.0）

- **命令面板**：头部「Ctrl/⌘ K」按钮或快捷键打开，支持搜索全部条目（标题/正文/标签）与快捷操作（视图跳转、新建各类条目）；↑/↓ 选择、Enter 执行、Esc 关闭
- **置顶收藏**：编辑器图钉按钮可置顶/取消，概览页新增「置顶条目」区块；置顶保存在本机偏好
- **任务快捷截止**：任务编辑器提供「今天 / 明天 / 下周」一键设为当天 18:00 截止
- **复习增强**：复习页显示「今日已复习 x / 目标 y」进度条（目标在 设置 → 外观 → 每日复习目标 调整）；每次评分后可「撤销上次评分」，同步回滚卡片 SM-2 状态与复习日志
- 完整路线图见 [docs/ROADMAP.md](docs/ROADMAP.md)（P0–P3 优先级、模块差距矩阵、技术质量目标）

## 深度功能（v1.3.0）

- **数据备份与还原**：Host 每次写入后自动滚动备份（`$DSH_HOME/quick-note/backups/`，最多 10 份、约 5 分钟一份）+ 手动「立即备份」；设置页列出备份并可两步确认恢复；支持「导出完整备份 / 导入完整备份」（items + settings + reviews + types 全量 JSON），导入走乐观锁写入
- **任务深度**：检查清单（子任务，可勾选/删除，最多 50 条）、重复任务（每天/每周/每月，完成时自动生成下一次），任务页工具栏显示「今日完成 x/y、本周完成 n、逾期 n」统计
- **复习深度**：复习范围（到期 / 新卡 / 全部）、键盘快捷评分（1 重来 / 2 困难 / 3 记住 / 空格显示答案 / Esc 退出 / U 撤销）、专注模式（隐藏页头与工具栏，居中复习卡）
- **健康参考范围**：指标编辑器可设置参考下限/上限（本机偏好）；详情页显示「正常 / 偏高 / 偏低」徽标，异常读数在历史列表中高亮
- **Agent 增量**：新增 `quick_note_batch` 批量工具（完成/重开/软删除/优先级/标签/截止），`quick_note_search` 支持 `tag`、`overdue`、`dueWithinDays` 过滤；任务创建/更新支持 `checklist` 与 `repeat`
- 新增 `GET/POST /api/quick-note/backups` 路由（token 保护），完整路线图与进度见 [docs/ROADMAP.md](docs/ROADMAP.md)

## 代码整洁与相似功能合并（v1.3.1 / v1.3.2）

- **分段控件统一**：新增 `Segmented` 组件，替换价值排序、趋势时间范围、趋势指标、复习范围、外观密度共 5 处内联 tab/filter 渲染
- **价值标签统一**：删除价值卡内的 stage/future/social 三张本地映射表，统一复用 `valueStageText` / `valueFutureText` / `valueGradeText`（报告与 CSV 已在用）
- **创建入口统一**：`createItem` 直接委托 `quickCreate(viewKind)`，去掉两份几乎相同的创建逻辑
- **设置写入统一**：新增模块级 `writeSettings(mutator)` 与面板级 `saveSettings`，替换快照/清理历史/工作区评价/简报开关/定价保存等 7 处「readState → putState → 更新 refs」重复代码
- **概览行组件统一**：新增 `OverviewRow`，置顶与最近更新两个区块共用
- **导出统一下载**：新增 `downloadTextFile`，替换 CSV / Markdown / 条目导出 / 完整备份 4 处 Blob+anchor 重复代码
- **受保护请求统一**：`protectedRequest` 合并 read/post 两套 token 重试逻辑
- **保存调度统一**：`scheduleSave` 合并 `applyItems` / `applyTypes` 的防抖写入
- **Host 只读路由统一**：`createReadRoute` 合并 admin/usage/value 三处方法/路径/token/异常样板；`costOfTokens` 合并用量与价值报告的金额计算
- **视图/类型元数据统一（v1.3.2）**：新增 `VIEW_META` / `KIND_META` 中央表，替换标签页文案、tab 图标、创建按钮文案、命令面板动作、快捷新建卡共 5 处分散映射
- **表格行统一（v1.3.2）**：新增 `TableRow`，全部表与记录表共用同一行结构
- **Host 工具文本统一（v1.3.2）**：新增 `renderText`，替换 16 处 `[{ type: 'text', … }]` 重复返回
- 说明：设置页与面板的共享状态层经评估暂缓（生命周期与宿主注入不同，强行共享会引入跨组件订阅），已用 `writeSettings` 复用写路径把重复降到最低
- 结果：client.js 约 396KB → **389.6KB**、index.js 约 103KB → **101.7KB**，行为与 81/65 回归基线保持一致

## 聊天即录入（v1.13.0）

- **斜杠命令（Host `commands` 服务）**：在对话输入框直接录入/查询，不打开面板也能工作
  - `/note <文本>` 保存笔记；`/capture <文本>` 捕获对话片段（自动加「对话」标签）
  - `/task <标题> [--due 2026-11-06|今天|明天] [--priority low|normal|high] [--tag 标签]`
  - `/search <关键词>` 搜索并返回条目 id；`/plan` 汇总未来 7 天任务/复习/用药；`/review` 查看今日待复习
  - 命令注册失败（名称冲突等）会被安全跳过，不影响插件加载
- **会话行捕获**：侧栏会话悬停操作新增「保存会话为笔记」（带来源会话 id、「会话」标签，自动去重）
- **输入区快速入口**：对话输入工具行新增「快速记录」按钮；输入框下方显示环境提示 chip「N 待办 · N 复习 · N 用药」，点击直达管理台
- **R2 真实浏览器冒烟**：新增 `test/browser-smoke.mjs`，用本地 Edge/Chrome headless + CDP 在真实 DOM/CSS 中验证：6 个合并标签、知识子标签、计划→日历 42 格 + 时间轴、无横向溢出、无未捕获异常，并输出截图 `test/artifacts/panel-smoke.png`；默认用内置 fixture（真实 React + 真实浏览器），也支持 `--url=` 对真实 GUI 冒烟

## 省钱模式效果追踪（v1.44.0）

- 自动省钱面板新增「省钱模式效果」：对比启用前日均费用与启用后日均费用，显示变化百分比
- 未启用过省钱模式时回退为「近 7 天 vs 前 7 天」趋势对比
- 数据来自 30 天费用序列，不额外请求 Host
- 回归：Host 214 + Client 168 + 浏览器冒烟 20；client 约 660KB、index 约 266KB、文案 804 键

## 模型策略选择与预算护栏验证（v1.43.0）

- 自动省钱面板新增「省钱模型」下拉：列出当前 provider 暴露的全部模型，可手动指定；留空为自动选择
- 「发现省钱模型」会刷新候选与全量模型目录
- 用量页预计月费用改为按月内进度推算（月至今费用 ÷ 已过天数 × 当月天数），无数据时回退 7 日均值 × 30
- Host 预算护栏新增回归：自动设置极低预算后，检查预算即时检查能自动开启省钱模式
- 回归：Host 214 + Client 168 + 浏览器冒烟 20；client 约 657KB、index 约 266KB、文案 800 键

## 系统/清理计划/价值/用量 UI 统一（v1.42.0）

- **系统**：新增「预算与省钱策略」卡片，展示每日/月度预算、省钱模式、省钱模型，并提供「打开优化中心」入口
- **清理计划**：顶部新增「下次执行 / 最近结果 / 成功次数」KPI，包含自动清理摘要（次数、删除文件、释放空间）
- **价值**：新增「高价值工作区 vs 高消耗工作区」并排卡片
- **用量**：
  - 新增工作区费用趋势横向条形图
  - 新增「预计月费用」KPI（近 7 天日均 × 30）
  - 会话排行增加 `#1` 排名
- 回归：Host 213 + Client 168 + 浏览器冒烟 20；client 约 656KB、index 约 264KB、文案 798 键

## 可配置省流名单与省钱前后趋势（v1.41.0）

- **可配置高消耗工作区省流名单**：面板直接勾选费用 Top 3 工作区；名单持久化到 `thriftWorkspaces`，省钱模式系统提示会点名这些工作区，要求定向读取、禁止整文件粘贴
- **省钱前后费用对比**：30 天费用图新增「实际费用」与「无缓存基线」双折线，并显示累计节省金额
- **自动发现低价模型**：从当前 LLM provider 发现 flash/lite/mini/fast/turbo 类模型，自动排除 max/pro/ultra/reason/thinking；候选出现在面板，一键「发现省钱模型」强制刷新，开启省钱模式时自动选最优候选
- 基线：Host 213 + Client 165 + 浏览器冒烟 18；client 约 647KB、index 约 264KB、文案 782 键
- 构建预算 680KB / 280KB

## 预算护栏与一键省钱模式（v1.40.0）

- **自动预算护栏**：
  - 每日/月度预算达到 80% 发送 Webhook 告警
  - 达到 100% 自动开启省钱模式（`savingsGuard` 默认开启）
  - 预算状态在自动省钱面板实时显示
  - v1.40.1：新增「检查预算」按钮，可立即执行预算判断并触发降级
- **一键省钱模式**：
  - 优化中心「开启省钱模式」按钮，Host `POST /api/quick-note/savings-policy` 持久化
  - 自动选择 flash/lite/mini/fast 类省钱模型并写入 DSH 默认模型（新会话生效）
  - 注入精简系统提示：不重复全文、优先 diff、限制输出约 1200 tokens
  - 面板显示当前默认模型与省钱模型
  - 压缩/裁剪插件保持自动运行（阈值 70%）
- **高消耗工作区省流**：
  - 自动省钱面板显示费用最高的 3 个工作区
  - 省流提示纳入系统提示：优先定向读取、避免整文件粘贴
- 基线：Host 213 + Client 165 + 浏览器冒烟 18；client 约 643KB、index 约 262KB、文案 775 键
- 构建预算相应调整为 client 680KB / index 280KB（大版本功能增加）

## 自动省钱面板与自动压缩（v1.39.0）

- 启用并验证 DSH 官方自动降费插件：
  - `@deepseek-ai/dsh-compaction-basic`：自动上下文压缩，`auto: true`，阈值 70%，保留 35%
  - `@deepseek-ai/dsh-compaction-tool-result-pruner`：自动裁剪超长工具结果
  - `@deepseek-ai/dsh-command-compact`：`/compact` 手动压缩
- 优化中心新增「自动省钱」面板：
  - 显示自动压缩 / 工具结果裁剪 / 压缩命令是否开启
  - 显示当前会话上下文占比、压力 Token、预计可压缩 Token
  - 显示每日/月度预算状态
  - 「打开插件设置」一键跳转，刷新按钮即时更新
- 新增 Host 只读接口 `/api/quick-note/savings`：汇总 compaction、pruner、command、
  tokenMeter、agents 状态与当前会话压力；新会话、高压力会话均可见
- 验证：当前会话 35.1%（368,238 / 1,048,576 tokens）；高压力会话 68.8%（720,972 / 1,048,576），预计可压缩 196,684
- 基线：Host 211 + Client 165 + 浏览器冒烟 18；client 约 639KB、index 约 252KB、文案 767 键

## 费用/命中率深度可视化（v1.38.0）

在 v1.37 仪表盘基础上新增：

- **按工作区费用横向条形图**：最多 6 个工作区，按费用排序，显示金额、Token 数和相对长度
- **近 30 天费用趋势折线图**：带日期轴、最新值、渐变面积和数值网格
- **近 30 天缓存命中率折线图**：带 70% 目标虚线、最新命中率和日期轴
- **“预计可节省”可展开**：
  - 计算口径：输入 Token 总量、当前/目标/可达命中率、命中/未命中单价差
  - 明确公式：`输入 Token × 提升命中率 × 单价差 ÷ 1,000,000 = 可省金额`
- Host 的 `efficiency.daily30` 增加每日 `cacheHitRate`，供趋势线使用
- 真实浏览器冒烟新增工作区条形图、趋势线、展开计算过程断言与截图

基线：Host 210 + Client 164 + 浏览器冒烟 18；client 约 632KB、index 约 249KB、中英各 754 个文案键。

## Token 效率与费用可视化（v1.37.0）

管理台 **分析 → 优化中心** 新增可视化仪表盘：

- **预计可节省**：缓存命中率提升到目标后的累计金额估算，最显眼展示
- **效率评分环**：综合评分圆环 + 缓存/成本/输出三项分数
- **费用构成环图**：缓存命中输入 / 未命中输入 / 输出三段的金额占比与图例
- **费用可视化**：当前累计与优化后预计的双进度条，并显示可省百分比与金额
- **优化建议**：带 `可省 ¥x` 金额徽标
- **响应式**：卡片自适应网格，窄屏自动换行
- 实机浏览器冒烟新增“优化中心”截图与无横向溢出检查

当前基线：Host 209 + Client 162 + 浏览器冒烟 16；client 约 622KB、index 约 249KB、中英各 742 个文案键。

## 管理台审计与日历/工具修复（v1.36.0）

- **Agent 工具输出 Schema 修复**：`quick_note_search` 等工具返回的 `health.intakes` 未在共享 `ITEM_SCHEMA` 中声明，运行时校验会拒绝整个工具结果；已补齐并加回归检查
- **日历/时间轴用药聚合**：同一用药计划在同一天只显示一个事件（`Drug A ×2`），不再为每个服药时间生成重复 chip；悬停/选中详情显示完整时间列表
- **日历性能与可访问性**：42 天网格事件按天缓存；日期按钮增加事件数 aria-label 与 `aria-pressed`
- **日历 v1.36.1 补充**：新增「用药」显隐切换、聚合文案走 i18n、窄屏月历横向滚动
- **回归**：Host 209 + Client 161 + 浏览器冒烟 13 全通过
- **审计报告**：[docs/AUDIT-2026-11-10.md](docs/AUDIT-2026-11-10.md)

## 曲线拟合 / 用药提醒 / 自定义快捷键 / 备份可视化 / 多时区等（v1.35.0）

- **遗忘曲线指数拟合**：按 ln(保持率)~天数最小二乘拟合，输出 1/7/30 天预测与**半衰期**
- **用药提醒 + 依从性周报**：设置 `medReminderEnabled`（Host reminders 过滤用药）；健康页 7 天逐日 ✓/完成数周报与提醒开关
- **快捷键自定义**：设置 `shortcuts.palette/help`，标题快捷键与 `?` 均可改；帮助面板显示当前值
- **备份自动间隔可视化**：设置页显示下次自动备份进度条与百分比
- **Cron 多时区对照**：`cron-preview-multi` 同时返回 local/UTC/Asia/Shanghai 各 3 次
- **PNG 标题/坐标**：480×260，含 `SHARE ACCESS` 标题、坐标轴、网格与柱状图
- **Webhook 队列导出/导入**：`webhook-export` / `webhook-import`（JSON 数组，去重合并）
- **预设排序**：回收站自定义预设支持 ↑/↓ 调整顺序
- **回归**：Host 208 + Client 157 + 浏览器冒烟 13 全通过

## A 包：复习曲线 / 用药依从 / 快捷键 / 备份差异 + Cron 修正（v1.34.0）

- **复习遗忘曲线预测 + 目标完成历史**：复习页新增 1/7/30 天保持率预测，以及最近 7 天每日完成数 vs 目标条形
- **用药依从性周统计**：med 条目新增 `health.intakes` 记录；本周依从率 + 「记录已服」按钮，Host/Client 双向归一化
- **快捷键帮助面板**：按 `?` 或标题栏 `?` 打开，列出 Ctrl/⌘K、1/2/3、Space、U、Esc；Esc 关闭
- **备份差异预览 + 自动备份间隔**：Host 新增 `GET /backups?diff=name`（新增/删除/修改/设置变化）；设置可配置 1–1440 分钟自动备份间隔
- **Cron 技术债**：日/周字段同时受限时改为标准 OR 语义；清理定时器由 15 分钟轮询改为 **15 秒**
- **回归**：Host 203 + Client 157 + 浏览器冒烟 13 全通过

## IANA 时区 / PNG 图表 / 队列入 store / 自定义预设（v1.33.0）

- **完整 IANA 时区**：Cron 时区支持 `Asia/Shanghai`、`Asia/Tokyo`、`Europe/London`、`America/New_York` 等 IANA 名称（Host 用 Intl 计算时区日历字段），预览仍为 10 次
- **分享 PNG 图表**：新增 `{action:'share-chart-png'}`，Host 自带 PNG 编码器生成 480×240 条形图并保存 `share-chart.png`；面板提供「导出 PNG 图表」
- **Webhook 队列持久化到 store**：队列从独立文件迁入 `items.json` 文档字段 `webhookQueue`（由 store 锁与 revision 管理），旧文件仍作兼容回退
- **回收站自定义预设**：可命名保存当前类型/工作区/搜索组合到设置 `trashPresets`，面板一键应用或删除
- **回归**：Host 198 + Client 152 + 浏览器冒烟 13 全通过

## Cron 时区/10 次预览 / 分享图表区间 / Webhook 批量 / 回收站预设（v1.32.0）

- **Cron 时区**：新增 `cleanupScheduleTimezone`（local / UTC±h），cron 匹配按指定固定时区计算；预览扩展为未来 **10 次**
- **分享图表日期区间**：分享统计条形图按报告日期输入过滤（与 CSV 导出一致）
- **Webhook 队列批量操作**：多选队列项，支持批量编辑 payload、批量重发、批量删除
- **回收站组合预设**：快速预设（全部/仅附件/仅临时/仅构建）叠加类型、工作区、搜索、分页
- **回归**：Host 195 + Client 152 + 浏览器冒烟 13 全通过

## Cron 预览 / CSV 区间 / Webhook 编辑重发 / 工作区筛选（v1.31.0）

- **可视化 Cron 预览**：新增 `cron-preview` 动作，返回未来 5 次执行时间；优化面板提供「预览下 5 次」按钮并展示时间列表；非法表达式返回 400
- **分享 CSV 日期区间**：`share-csv` 支持 `from/to` 过滤（按 lastAt/firstAt），客户端复用报告日期输入；返回 `range`
- **Webhook 队列编辑/重发**：新增 `webhook-edit`（修改 URL/JSON payload、重置 attempts）与 `webhook-resend`（立即重发单条）；面板逐条提供「重发 / 编辑 / 删除」
- **回收站按工作区筛选**：trash records 新增 `roots`，面板新增工作区下拉（全部工作区 + 各 root），与类型/搜索/分页组合
- **回归**：Host 192 + Client 152 + 浏览器冒烟 13 全通过

## Cron 表达式 / 分享 CSV / Webhook 队列面板 / 回收站类型筛选（v1.30.0）

- **Cron 表达式**：新增 `cleanupScheduleCron`，支持五段式（分 时 日 月 周，如 `0 3 * * 1`）；计划模式新增 `cron`，Host 按表达式计算下次执行并判断到期；优化面板与计划页均可设置
- **分享统计导出 CSV**：新增 `{action:'share-csv'}`，导出 `share-stats.csv`（name/count/firstAt/lastAt/refs），客户端显示保存路径与行数
- **Webhook 队列持久化面板**：队列项展示 URL/错误/时间，可单条删除（`webhook-remove`）；保留手动重试全部
- **回收站按类型筛选**：全部/附件/临时/缓存/构建 五个筛选按钮，与搜索、分页组合生效；trash records 保留类别信息
- **回归**：Host 186 + Client 150 + 浏览器冒烟 13 全通过

## Cron 时间 / 分享图表与来源 / Webhook 重试队列 / 回收站分页（v1.29.0）

- **Cron 自定义时间**：新增 `cleanupScheduleTime`（HH:MM，默认 03:00）；自动清理计划页与优化面板都可设置执行时间，Host 按“当天该时刻”判断 daily/weekly 是否到期并计算 nextRunAt
- **分享统计图表 + 来源分析**：分享访问记录增加 referrer 主机名；扫描返回带 `refs` 的 shareStats，优化面板以条形图显示 Top 分享访问量，并列出 direct/来源域名分布
- **Webhook 失败重试队列**：发送失败写入 `webhook-queue.json`（最多 20 条，指数退避，5 次上限）；Host 每 5 分钟自动重试，面板显示队列数量与「重试队列」按钮（手动立即重试全部到期项）
- **回收站分页 + 容量预警**：回收站记录每页 5 条（‹ / › 翻页，搜索自动回到第一页）；使用率达到 80% 时显示容量预警
- **回归**：Host 182 + Client 149 + 浏览器冒烟 13 全通过

## 计划页 / Webhook 模板 / 回收站批量恢复 / 分享统计（v1.28.0）

- **清理计划独立页**：分析新增「清理计划」子标签，展示计划模式、上次/下次执行、最近 20 条运行记录；有失败项时出现「重试」，可立即触发自动清理
- **Webhook 模板 + 测试发送**：支持 `generic` / `slack` / `feishu` 三种载荷；优化标签提供模板选择与「测试发送」按钮（Host 强制发送一次示例，不走按天去重）
- **回收站搜索与批量恢复**：trash records 列表支持按记录 id/日期搜索、多选与批量恢复；Host 新增 `{action:'restore', ids}`，最多一次 20 条
- **报告分享访问统计**：每次访问 share HTML 计入 `share-stats.json`（count/firstAt/lastAt）；扫描结果返回 `shareStats`，优化标签显示 Top 分享与访问次数
- **回归**：Host 178 + Client 147 + 浏览器冒烟 13 全通过

## 计划日志 / 自定义日期区间 / 预算 Webhook / 回收站限额（v1.27.0）

- **自动清理计划日志**：扫描结果新增 `schedule {mode,lastRunAt,lastResult,nextRunAt}`；面板显示上次执行/下次预计时间，历史里自动清理记录带「自动」标记
- **报告自定义日期区间**：优化标签新增开始/结束日期输入，导出/分享的报告 HTML 按区间过滤每日费用并显示「统计区间」；Host 返回 `range`
- **预算 Webhook**：设置新增 `budgetWebhookUrl`；Host 定时器在 80% 预警/超支时 POST JSON（含 event/todayCost/limit/percent/monthly 字段），按天去重；客户端提供保存入口
- **回收站容量上限**：最多 20 条或 1GB，超出按最旧记录自动淘汰并标记历史不可撤销；面板显示 `count/20`
- **回归**：Host 175 + Client 144 + 浏览器冒烟 13 全通过

## 回收站管理 / 报告区间 / 月度预算 / 自动清理（v1.26.0）

- **回收站管理**：扫描结果新增 `trash {count,bytes,records}`；面板显示回收站条数/占用，支持「清空回收站」；可撤销历史显示「剩余约 N 小时可撤销」与「撤销清理」
- **报告快照时间范围**：优化报告 HTML 新增 `range-filter`（近 7 天 / 近 30 天切换），`daily30` 数据驱动每日费用表
- **月度预算 + 30 天曲线**：设置新增 `tokenBudgetMonthly`；优化标签增加月度预算输入、月度进度/超支状态与近 30 天费用曲线；reminders budget 增加 monthly 字段
- **自动清理计划**：设置新增 `cleanupSchedule`（off/daily/weekly）；Host 每 15 分钟检查并按天/周执行安全类别自动清理（pluginTemp/workspaceJunk/workspaceCaches，进回收站可撤销）；面板支持「立即自动清理」
- **回归**：Host 171 + Client 143 + 浏览器冒烟 13 全通过

## 回收站撤销 / 快照筛选 / 80% 预警 / 会话跳转（v1.25.0）

- **回收站（真撤销）**：清理不再直接删除，文件/目录先移入 `$DSH_HOME/quick-note/trash/<record-id>/`；历史记录 `recoverable:true`、24 小时有效
  - 客户端历史记录出现「撤销清理」按钮；`POST /cleanup {action:'undo', id}` 恢复原路径（目标被占用时加 `.restored-<ts>` 后缀）
  - 扫描时自动清理超过 24h 的 trash；过期记录拒绝撤销
- **优化报告 HTML 筛选/搜索**：报告快照新增搜索框 + 工作区下拉；按工作区/关键词过滤工作区与会话表格、以及优化建议
- **80% 预算预警**：reminders budget 增加 `warn/status`；达到 80% 先发一次预警通知，超支再发一次超支通知（均按天去重）
- **会话跳转**：优化标签的「高消耗会话」「工作区会话」变为可点击，调用 `uiWorkspace.openSession(sessionId)` 直接打开对应对话（无此服务时静默忽略）
- **回归**：Host 165 + Client 140 + 浏览器冒烟 13 全通过

## 预算提醒 / 报告快照 / 工作区下钻（v1.24.0）

- **预算超支接入 Host 提醒**：`tokenBudget` 改为持久化在文档设置（Host 可见）；reminders 快照新增 `budget {limit,todayCost,percent,over}`，客户端 ReminderBridge 在超支时按天去重发送系统通知（`预算超支：今日已用 ¥x / 预算 ¥y`）
- **报告分享为只读快照**：`POST /api/quick-note/optimizer-report` 支持 `{format:'html'}`，生成带暗色主题的独立 HTML 到 `shares/`，返回 `/api/quick-note/share/<name>` 链接；客户端新增「分享报告快照」按钮
- **按工作区成本下钻**：优化标签新增「工作区费用明细」，点击工作区展开该工作区的高消耗会话（session id / tokens / 费用）
- **清理历史细化**：历史记录新增 `recoverable: false` 标记；UI 明确显示「不可撤销」并按类别展示重建/恢复提示
- **回归**：Host 163 + Client 137 + 浏览器冒烟 13 全通过

## 清理历史、会话下钻与优化报告（v1.23.0）

- **清理历史与恢复提示**：每次清理写入 `$DSH_HOME/quick-note/cleanup-history.json`（最多 20 条）；优化标签展示最近记录（时间/删除项/释放空间）与按类别的恢复提示（附件不可恢复、构建产物如何重建、缓存会按需重建等）
- **高消耗会话下钻**：优化标签新增「高消耗会话」列表，展示工作区、tokens、费用（取用量报告 topSessions 前 6）
- **优化报告导出**：新增 `POST /api/quick-note/optimizer-report`，Host 汇总效率评分/建议/高消耗工作区与会话/清理统计，生成 Markdown 到 `$DSH_HOME/quick-note/reports/optimizer-<ts>.md`；客户端一键导出并显示路径
- **回归**：Host 160 + Client 133 + 浏览器冒烟 13 全通过；token 保护、构建一致性门禁保持

## 优化中心并入管理台 + 每日预算（v1.22.0）

- **合并入口**：优化中心不再单独占侧栏，已并入管理台 **分析 → 优化** 子标签（与价值 / 用量 / 系统并列）；侧栏只保留「管理台」一个入口
- **每日预算**：优化标签新增「每日预算（¥）」输入；设置后显示今日消耗进度条与超支提醒（超额变红），预算保存在本地偏好（`tokenBudget`）
- **保留能力**：效率评分、费用 KPI/14 天柱图、缓存节省估算、优化建议、跨工作区扫描/清理全部保留
- **回归**：Host 156 + Client 130 + 浏览器冒烟 13 全通过；构建一致性门禁照常

## 优化中心：Token 效率可视化 + 工作区空间清理（v1.21.0）

> v1.22.0 起优化中心已并入管理台「分析 → 优化」子标签，不再单独侧栏显示；以下能力仍在。

- **侧栏新增「优化中心」面板**（id `quick-note-optimizer`）：
  - **Token 效率评分**（0–100）：缓存命中 50% + 会话成本 30% + 输出占比 20% 加权
  - **费用可视化**：今日/近 7 日费用、会话均费、累计 Token/费用、近 14 天费用柱状图
  - **可节省估算**：缓存命中率提升到目标（70%）可省的金额（按未命中/命中单价差计算）
  - **优化建议卡片**：缓存命中、高消耗工作区占比、输入占比过高、会话均费基线，含高/中/提示分级
- **空间清理（跨工作区）**：
  - 扫描插件数据：孤立附件、更新暂存安装包、插件临时文件
  - 扫描所有已登记工作区：temp/log/系统残留（`.DS_Store`、`Thumbs.db` 等）、缓存目录（`__pycache__`/`.pytest_cache`/`.cache`/`node_modules/.cache`）、构建产物（`dist/build/out/target/coverage/.next`，需显式勾选）
  - >50MB 且 90 天未改的大文件**仅报告**（不可删除），供人工判断
  - 清理流程：先扫描 → 勾选类别 → 清理所选；Host 重新扫描后只删除本轮扫描产物且校验路径在记录 root 内，防目录穿越；不触碰源文件、未勾选类别与未引用校验失败的附件
  - 扫描本身有界（每个扫描最多 5000 个文件 / 6 秒，超出标记 `truncated`），避免大工作区卡住面板；清理仅针对本轮扫描结果
  - 全部通过 loopback token 保护，扫描本身只读
- **测试**：Host 156 项（效率评分/建议、扫描类别、清理删除与保留校验、token 401）、Client 131 项（优化中心注册/评分/清理类别渲染）

## R1 收尾：entry 壳 + 构建一致性门禁（v1.20.0）

- **`src/entry.mjs`**：`PanelBoundary` 类、常量和 `apply` 注册代码整体迁入（27KB）
- `src/client.template.js` 缩到 **181B**，只含 `window.__ModuleLoader__.load` 壳、`factory` 与 `apply` 返回；所有逻辑/数据均来自 `src/` 模块
- **构建一致性检查**：
  - [build-client.mjs](dsh-quick-note/scripts/build-client.mjs) 导出纯函数 `composeClient()`
  - [check-build.mjs](dsh-quick-note/scripts/check-build.mjs) 比对 `client.js` 与重新生成的文本，不一致退出 1
  - Host 回归新增 `build artifact matches source`；`npm test` 在跑回归前执行 build + check，手改产物会直接失败
- 构建产物保持 **517,514B** 字节不变，回归 150 + 126 全通过
- **可选 helpers 按域拆分**本轮未执行：119 个函数源块的注入顺序与位置有语义依赖，需要先建立依赖/顺序清单再拆；建议作为独立重构（见 NEXT-FEATURES）

## R1 第四步：面板主体模块化（v1.19.0）

- **119 个顶层函数/组件源码迁入 [src/helpers.mjs](dsh-quick-note/src/helpers.mjs)**，包括：
  - `WorkbenchPanel` 面板主体
  - 全部数据归一化/格式化/提醒/附件/语音等辅助函数
  - 其余独立组件
- `src/client.template.js` 仅保留常量、`PanelBoundary` 类与 `apply` 注册代码，从 **361KB 降到约 26KB**
- 构建脚本按原顺序注入 119 个函数块；产物 `client.js` 仍为单文件，**字节数与迁移前一致（517,514B）**，等价性回归通过
- `scripts/extract-helpers.mjs` 记录迁移过程；R1 主体迁移完成，后续可继续把 `PanelBoundary` 类与 `apply` 拆出

## 组件模块化、Host 提醒与性能预算（v1.18.0）

- **R1 第三步（组件模块化）**：`SectionHead`、`SettingsSection`、`DueReminder` 三个组件源码迁入 [src/components.mjs](dsh-quick-note/src/components.mjs)，template 再缩至约 353KB；构建仍输出单文件 `client.js`，完整回归通过
- **P1-4 Host 定时器 + 通知桥**：Host 每 60s 计算提醒快照（到期任务/用药/复习卡片），新增 token 保护的 `GET /api/quick-note/reminders`；客户端新增 `ReminderBridge` 覆盖层，消费 Host 快照并按天去重发送系统通知（原页面提醒条保留）
- **性能预算**：
  - 构建体积上限：client.js < 640KB、index.js < 220KB、template < 500KB（Host 测试断言）
  - 面板渲染预算：<100ms（客户端测试实测 0ms）
  - 浏览器启动预算：<5000ms（R2 冒烟实测，CI 守护）
- **快照增强**：只读 HTML 增加**搜索框**、**全部/笔记/任务/卡片筛选**、`prefers-color-scheme` 暗色跟随；筛选脚本内联、无外部依赖

## 只读快照与 R1 第二步（v1.17.0）

- **P1-5 只读快照**：设置 → 数据区新增「生成只读快照」，Host 生成独立 HTML（笔记/任务/卡片、转义安全、内联样式），保存到 `$DSH_HOME/quick-note/shares/`，返回本地路径；`GET /api/quick-note/share/<name>?token=...` 可带 token 在浏览器打开；文件名白名单校验，防目录穿越
- **R1 第二步**：`ICON_PATHS`、`STYLES`、`STYLE_UPGRADES` 迁出到 [src/ui-assets.mjs](dsh-quick-note/src/ui-assets.mjs)；template 从约 464KB 降到约 386KB，构建产物仍为单文件 `client.js`
- **等价性**：构建后完整回归通过（Host 145 / Client 125），CSS 大括号平衡、主题令牌检查保持
- **后续 R1**：继续迁移组件与面板逻辑到 `src/`，每步重建并跑回归

## 语音、Markdown 与构建拆分（v1.16.0）

- **P1-1 语音速记**：输入区工具栏新增麦克风按钮，浏览器录音后在前端重采样为 16kHz 单声道 WAV，上传到 Host `/api/quick-note/transcribe`，由 DSH `speechToText` 服务转写并保存为「语音」标签笔记；服务缺失/无 provider 时给出明确提示
- **P1-3 Markdown 文件夹导入/导出**：设置 → 数据区新增目录输入与导出/导入按钮；导出带 front matter 的 `.md`（source: quick-note），导入按 id/标题+正文去重并打「导入」标签；路由 token 保护
- **R3 写入开关**：设置新增「同步写入方式」，默认增量 PATCH，可切全量 PUT 用于调试/兼容；flush 按开关选择路径，冲突仍走全量合并兜底
- **R1 构建拆分（第一步）**：`client.js` 改为生成产物——文案字典迁出到 `src/locale.mjs`，其余代码在 `src/client.template.js`，`scripts/build-client.mjs` 注入生成；`npm run build` 重建，`npm test` 先构建再跑回归；本轮已通过完整等价性回归（Host 141 + Client 124）
- **后续 R1 迁移**：把组件、样式、面板逻辑继续迁入 `src/`，每步跑等价性回归

## 网页剪藏与提醒增强（v1.15.0）

- **PATCH 增量写入（R3 完成）**：`PATCH /api/quick-note/state` 接收 `upserts`（新增/修改/墓碑）并支持 `If-Match`，409 冲突返回当前完整文档；客户端 flush 改为按内容签名 diff 只上报变更条目，冲突时回退全量 PUT 合并；实机/客户端测试确认编辑使用 PATCH 而非整包写入
- **网页剪藏（P1-2）**：新增 `/clip <URL>` 斜杠命令与 `POST /api/quick-note/clip` 路由；Host 抓取网页（15s 超时、2MB 上限、跟随重定向）提取 `og:title`/`<title>`、描述与正文摘要，保存为带「剪藏」标签的笔记（正文含来源 URL）
- **提醒增强（P1-4 客户端 + Host 简报）**：
  - 页面内提醒条新增 **复习到期卡片** 数量（`复习到期 N 张`），并像用药一样对到期卡片发送**每日一次系统通知**
  - Host 每日简报新增「管理台待复习：N 张（卡片名…）」，Agent 上下文可直接感知复习任务
- **R1 构建拆分**：本轮未执行；需要在插件目录安装 esbuild 并把 10k 行 `client.js` 拆成 `src/` 模块，属于高风险机械重构，建议单独迭代（见 NEXT-FEATURES 的 R1 计划）

## 知识库升级与性能（v1.14.0）

- **附件与图片笔记**：笔记/任务/卡片编辑器新增「附件」区，可上传图片（缩略图预览）与文件（pdf/txt/md/csv/json/zip/音视频），单文件 ≤25MB、单条最多 12 个；支持删除引用；存储于 `$DSH_HOME/quick-note/files/`（loopback token + 随机 id 保护；`<img>`/下载链接带 token query）；**JSON 备份只含附件引用，文件本体单独保留在该目录**
- **增量同步（R3 读路径）**：`GET /api/quick-note/state?since=<watermark>` 只返回该水位之后变更的条目、新增复习与设置，客户端 12 秒轮询携带本地水位并合并（保留本地墓碑）；首次加载/冲突仍走全量；写路径仍为整包 PUT（下一步做 diff 写入）
- **列表虚拟化（R4）**：超过 150 行的扁平列表自动窗口化（`VirtualRows`，60 行缓冲），仅渲染可视区附近行；短列表保持原样，快捷键/批量/选中逻辑不变
- **命令与捕获保留**：v1.13 的 6 个斜杠命令、会话行保存、输入区快速记录、dock chip 全部保留

## Harness 版本管理（v1.12.0）

- **位置**：分析 → 系统 子标签底部「Harness 版本管理」分组
- **版本通道（稳定版 + 其他版本）**：
  - **官方稳定版直链**：一键完成 HEAD 构建检查 → 下载 → 本地 SHA-256 → 审批；约 276MB 流式下载，无需配置更新源
  - **其他版本（GitHub Releases）**：拉取官方 Release 列表（含预发布），逐条显示版本号 / 预发布徽标 / 发布时间 / 是否有安装包；有资产可直接下载该版本，无资产时提示并提供 Release 页面链接
  - **自定义安装包 URL**：可粘贴任意 https 安装包地址（可选 SHA-256）；下载后展示本地哈希，审批确认后安装（适用于官方离线包/社区构建等）
- **审批安装**：三类来源（manifest 校验哈希 / 官方直链 / 自定义 URL）均需显式勾选确认 + 本地 SHA-256 一致；Host 二次校验暂存文件哈希，未开启高风险开关也可审批安装
- **更新说明可读性**：GitHub Release notes 清洗 HTML/锚点/Markdown、截断，并提供「展开全文 / 收起」与 Release 页面链接
- **无安装包资产指引**：官方 Release 无资产时显示提示与官方直链/自定义 URL 入口，不会误触发下载
- **操作反馈**：所有操作点击后立即显示「正在处理…」，失败附带 Host 具体原因
- **版本信息 / 更新源**：读取 app.asar 当前版本；仍支持自定义 JSON manifest 更新源
- **自动检查更新（仅提醒，不自动安装）**：每 6 小时最多检查一次，发现新版本页头徽标 + 系统通知，点击直达分析 → 系统
- **官方源配置模板**：一键填入官方源占位模板（替换 host 为官方发布地址）、一键复制 manifest 模板；仓库另附 [`docs/update-manifest.example.json`](docs/update-manifest.example.json) 可直接托管到 GitHub Releases / 静态站点
- **下载更新**：下载到 `$DSH_HOME/quick-note/staging/`，上限 256MB，超时 20s，提供 SHA-256 时强制校验；可「打开下载目录」
- **安装更新**：审批路径需校验通过；旧路径 Windows `.exe` 静默安装（`/S`）、`.msi` 走 `msiexec /quiet`，其他类型返回不支持并给出文件路径供手动安装；只执行本次下载并核验过的暂存文件，不接受任意路径
- **重启 DSH（需开启开关 + 二次确认）**：重新拉起 `process.execPath` 后退出当前进程；**会结束当前会话**
- **安全默认**：自动更新开关默认关闭；自动检查只读且不下载；所有版本管理请求需 loopback token；下载源与文件哈希均需人工确认

## 分析模块（v1.5.0）

- **三合一**：原「系统 / 用量 / 价值」三个顶层标签合并为一个「分析」标签，内部用 Segmented 子标签切换（价值 / 用量 / 系统），选择写入偏好 `insightTab`
- **用量细化**：4 张 KPI（Tokens / 金额 / 缓存命中率 / 会话数）、近 14 天用量折线、每工作区缓存命中率/均 Token/最近活跃、会话 Top 12（会话 ID、工作区、Token、金额、最近活跃）
- **社会价值深化**：6 维加权评分（文档/许可证/测试/社会影响/工程沉淀/持续活跃）、维度进度条、优势/短板标签、提升建议（README/文档/许可证/测试/领域/活跃）
- 新增 Host 字段：`daily[]`、`topSessions[]`、`totals.cacheHitRate`、`totals.avgTokens`、行级 `cacheHitRate/avgTokens/lastAt`；价值行新增 `socialBreakdown/socialStrengths/socialGaps/socialSuggestions`

## 模块合并（v1.11.0）

- **知识 = 笔记 + 复习（学习）**：原「笔记」「复习」两个顶层标签合并为「知识」，内部 Segmented 子标签切换（笔记 / 复习），选择写入偏好 `knowledgeTab`；卡片复习、SM-2、目标/专注/撤销、卡片明细等全部保留
- **计划 = 任务 + 日历 + 用药时间轴**：原「日历」并入「任务」并更名为「计划」，布局为「列表 / 看板 / 日历」；日历页新增 **未来 7 天计划时间轴**，把任务截止、卡片复习、用药提醒聚合为按天分组的时间线（点击事件跳转条目）
- **概览 = 概览 + 全部**：「全部」跨模块表格并入「概览」子视图（概览 / 全部），批处理与筛选能力不变，`overviewTab` 偏好持久化
- **标签数量**：11 → 6（概览 / 知识 / 计划 / 健康 / 记录 / 分析），设置中的模块开关、路由、数据结构、Agent 工具完全不变
- **共享组件**：所有子标签/布局复用 `Segmented` 与统一偏好持久化，无新增数据字段

## 任务日历（v1.4.0）

- 新增「日历」标签页：月视图网格（42 格，含上/下月灰显），同时展示 **任务截止（due）+ 卡片复习（review.dueAt）+ 用药计划（每日 times）**
- 顶部工具栏：上一月 / 下一月 / 今天、本月事件总数；事件按颜色区分（任务=强调色、复习=黄色、用药=绿色、逾期=红色、已完成=删除线）
- 点击任意日期查看「当日安排」完整列表，点击事件直接跳转到对应条目；跨月事件仍在上/下月格中显示
- 响应式：窄屏隐藏格内事件 chip，仅保留日期与当日详情；全部使用主题令牌与强调色变量

## 数据与通道

| 项目 | 说明 |
|---|---|
| 数据文件 | `$DSH_HOME/quick-note/items.json`（未设置 `DSH_HOME` 时为 `~/.dsh/quick-note/items.json`） |
| 同步接口 | `GET/PUT /api/quick-note/state`（Host 半区注册在 Web 服务器上的普通路由；桌面版只监听 127.0.0.1，无鉴权；支持 `If-Match`/`ETag` 乐观锁） |
| 只读分析接口 | `GET /api/quick-note/admin`、`/usage`、`/workspace-value`；需 `GET /api/quick-note/auth` 获取的 loopback token（`x-quick-note-token` 头，每次 Host 启动轮换），缺失或错误返回 401 |
| 备份接口 | `GET/POST /api/quick-note/backups`（列表 / `?name=` 读取 / 立即创建），同样需要 token；备份目录 `$DSH_HOME/quick-note/backups/` |
| 浏览器镜像 | `localStorage` 的 `dsh.quick-note.mirror.v2`，Host 不可达时兜底 |
| 模块偏好 | `localStorage` 的 `dsh.quick-note.prefs.v2` |

## 文件

| 文件 | 作用 |
|---|---|
| `package.json` | 插件包清单：`dsh.bundle.patch` 指向 Cordis 补丁层，`dsh.client` 声明浏览器半区 |
| `cordis.patch.yml` | 插入 `quick-note` 行，加载 `dsh-quick-note` |
| `index.js` | Host 半区：JSON 存储、状态路由、只读分析路由与 6 个 Agent 工具 |
| `client.js` | 浏览器半区：侧栏图标、工作台面板、设置页、中英文案 |
| `locale/en.json`、`locale/zh.json` | 插件管理页展示用的标题与描述 |
| `icon.svg` | 插件图标（原创） |
| `docs/ROADMAP.md` | 功能规划：现状、模块差距、P0–P3 路线图与质量目标 |

## 安装、更新与卸载

### 从 npm 安装（推荐）

```sh
dsh plugin --profile web add @tomjerrygit/dsh-quick-note
# desktop profile
dsh plugin --profile desktop add @tomjerrygit/dsh-quick-note
```

插件市场索引（可添加到 DSH Plugins → Discover）：

```text
https://tomjerrygit.github.io/dsh-quick-note/index.json
```

### 本地目录（开发）

本目录也可以本地目录方式（link）装进 profile：

- 安装：插件管理页「安装第三方插件」填本地目录路径，或用 agent 的 `plugin_manager` `install_bundle`。
- 更新：改完 `client.js` 后浏览器半区通常由 DSH 热更新自动重载；**改了 `index.js`（Host 半区）需要触发热重组装或重启 DSH** 才会加载新代码。
- 卸载：插件管理页移除 `@tomjerrygit/dsh-quick-note`，或用 `plugin_manager` `remove_bundle`。

## 回归测试（审计后新增）

`test/` 目录包含插件自身的回归测试（无需浏览器/DSH 实例）：

- `test/host.test.mjs`：Host 半区——数据归一化与恶意输入夹取、state/admin/usage/workspace-value/backups/files 路由边界与 token 鉴权（401/403/415/正确 token）、乐观锁（ETag/If-Match/409/兼容旧写）、**增量轮询 delta（since 水位）**、用量 Token 与金额、价值分/社会价值/缓存失效、7 个 Agent 工具、滚动备份、每日简报、**6 个斜杠命令**、**附件上传/读取/类型限制**、i18n/主题令牌静态检查
- `test/client.test.mjs`：客户端半区——React 桩渲染整个面板、冲突合并、token 刷新、命令面板、任务/复习/健康/日历、**附件编辑器（token URL/删除持久化）**、**300 条笔记窗口化（VirtualRows）**、捕获槽位组件
- `test/browser-smoke.mjs`：真实浏览器冒烟（R2，Edge/Chrome headless + CDP），默认自带 fixture；需要 Chromium，DSH 沙箱下需以完整权限运行
- `test/run.mjs`：依次运行两个 Node 套件并输出 `RESULT PASS/FAIL`
- `test/helpers.mjs`：自建 fake Cordis ctx、HTTP 请求（支持二进制 body）、临时 DSH_HOME、React/browser/fetch 桩、渲染器

运行方式（在插件目录下）：

```powershell
$env:ELECTRON_RUN_AS_NODE='1'; & 'D:\Programs\DeepSeek Harness\DeepSeek Harness.exe' 'test\run.mjs'
# 真实浏览器冒烟（默认 fixture，截图写到 test\artifacts\panel-smoke.png）：
$env:ELECTRON_RUN_AS_NODE='1'; & 'D:\Programs\DeepSeek Harness\DeepSeek Harness.exe' 'test\browser-smoke.mjs'
# 或已安装 Node 22+ 时：npm test / npm run test:smoke
```

当前基线：Host 214 项 + Client 168 项 + 浏览器冒烟 20 项全部通过（退出码 0）。构建：`npm run build` 由 `src/` 生成 `client.js`；`npm run check` 校验产物与源一致；`npm test` 依次执行 build + check + 回归。

## 并发写入、条目版本、软删除与只读鉴权（审计后新增）

- `PUT /api/quick-note/state` 支持标准 `If-Match: "<revision>"`（也接受不带引号的数字）；版本不匹配返回 **409** 与当前完整文档（含 `revision`、items/settings/reviews/types），不写盘
- `GET`/`PUT` 响应都带 `ETag: "<revision>"`；不带 `If-Match` 的写请求保持旧行为兼容（面板升级前/第三方调用不会失效）
- **条目级版本**：每个条目带 `rev`，Host 写入时按内容差异自增；冲突合并先比 `rev`，再比 `updatedAt`，较新者胜（完全相同时本地优先），避免整文档「本地优先」丢失 Agent 的较新修改
- **冲突后主动回填**：合并重试成功后，若面板没有更新的本地编辑，立即采用服务端合并结果（Host 并发新增、恢复的条目无需等 12 秒轮询）
- **软删除**：删除写为 `deletedAt` 墓碑（服务端保留最多 200 条，客户端/服务端自动修剪）；列表、看板、提醒、每日简报、Agent 搜索默认隐藏；`quick_note_search` 传 `includeDeleted:true` 可查墓碑；`quick_note_update` 传 `restore:true` 可恢复；删除自定义类型会软删除其记录
- **墓碑参与合并**：较新的墓碑优先，旧的活动版本不会复活已删除条目；删除状态随同步传播到面板、其他窗口与 Agent 工具
- 合并范围：条目（含墓碑）按 rev/时间；类型本地优先并保留 Host 新增；设置本地优先，`workspaceNotes` 按路径、`valueHistory` 按时间点合并；复习日志按 `itemId+at+quality` 去重
- **只读接口鉴权**：`GET /api/quick-note/auth` 返回 loopback token（Host 启动时随机生成、常驻内存、不落盘；带非 loopback `Origin` 返回 403），`admin`/`usage`/`workspace-value` 必须携带 `x-quick-note-token`，否则 401；面板自动获取 token，遇到 401（如 Host 重启轮换）自动刷新并重试一次
- 测试覆盖：较新远端编辑胜出、本地编辑保留、Agent 新增保留、软删除隐藏/恢复/墓碑合并、冲突结果立即回填、token 401 后自动刷新

## 性能与稳定性（审计后）

- 只读路由（`/admin`、`/usage`、`/workspace-value`）精确匹配 pathname，未知子路径返回 404；并要求 loopback token（`/auth` 获取，401 时面板自动刷新重试）
- `PUT /state` 支持 `If-Match` 乐观锁（不匹配返回 409 + 当前文档），`GET/PUT` 返回 `ETag`；面板遇冲突按条目 `rev`/`updatedAt` 合并重试，避免面板与 Agent 并发写入时的丢失更新
- 删除为软删除（`deletedAt` 墓碑，服务端最多 200 条），Agent 搜索/每日简报/面板列表默认隐藏，可通过工具恢复
- 工作区价值报告 60 秒缓存，**任何写入（PUT state）立即失效**：改单价、评价、快照后无需手动刷新即可看到新结果
- 会话投影缓存按 25 个/批并发读取；价值报告对各工作区目录并行扫描（每区最多统计 500 个文件，跳过 node_modules/.git/dist 等）
- 用量总额金额按原始 Token 汇总计算，避免逐行四舍五入累计误差
- 数据文件原子写入（tmp + rename）并串行化写操作；文档中 reviews（5000）、types（40）、valueHistory（每区 12 条）等均有上限
- 前端：`client.js` 约 660KB（生成自 181B 模板壳 + `src/entry.mjs` + `src/helpers.mjs` + `src/components.mjs` + `src/optimizer.mjs` + `src/ui-assets.mjs` + `src/locale.mjs`）+ `index.js` 约 266KB；文案键无冗余（中英各 804 个，使用率 100%），无未使用静态函数与死 CSS 类

## 自定义

- 文案：`client.js` 顶部的 `zh` / `en` 字典；插件管理页的标题与描述见 `locale/*.json`。
- 数据文件位置：`index.js` 的 `resolveStoreFile()`（`DSH_HOME` 优先）。
- 侧栏顺序：`client.js` 中 `sidebar.panellist` 注册的 `order`（现有插件为 0，日程为 10）。
- 面板 id：`PANEL_ID`；侧栏图标 id、`main` 面板 key、设置页 id 必须一致。
- 工具名/描述/参数：`index.js` 的 `createTools()`。

---

# Sidebar Console (dsh-quick-note)

Adds a **Console** entry to the DSH Web UI left sidebar: a general management tool that opens on an inventory dashboard with module pages (notes / tasks / review / health) and a cross-module management table; the data is shared between the panel and the agent.

> Compatibility: the plugin id stays `dsh-quick-note`, the data file stays `$DSH_HOME/quick-note/items.json`, and the tools stay `quick_note_*`; only the user-facing name and copy change to "Console".

- Opens on an **Overview console**: four clickable KPI cards (tasks due today/overdue, cards to review, reviews in the last 7 days, today's health readings + medications), a today's-brief text block, one-click quick add for every module, and the six most recently updated items — each jumps to its module; search and the create button are hidden on the overview to keep it dashboard-like.
- **All** tab: a cross-module management table with kind filters (all/notes/tasks/cards/health), sorting (updated / title / priority / due) and pagination (20 per page); batch actions on selected rows — mark done, reopen, set priority (high/normal/low), delete (second confirming click); clicking a row opens its module and selects the item.
- **Custom record types**: the Records tab creates user-defined types (name + fields of type text/number/date/checkbox/select, with options for select) and manages records per type; records support search, sorting by updated/title, batch delete, and saved filter views (`types[].views` in the data file). Deleting a type removes its records.
- **Insights module (System / Usage / Value merged)**: one **Insights** tab with three sub-tabs (Value / Usage / System) whose last choice persists; the System sub-tab reads `/api/quick-note/admin` for the runtime (profile / DSH home / installed bundles / dependencies), the data file, and session statistics — read only.
- **Usage analysis (refined)**: the Usage sub-tab reads `/api/quick-note/usage` and shows four KPIs (tokens / cost / cache hit rate / sessions), a 14-day usage line, and per-workspace cache hit rate, average tokens per session, last activity, plus the top 12 sessions (session id, workspace, tokens, cost, last active). Prices are configurable in Settings.
- **Workspace value analysis**: the Value sub-tab reads `/api/quick-note/workspace-value` and scores each workspace with a **value score (A/B/C/D)**, a **current stage**, and a **future value** label, alongside sessions, tokens, estimated cost, active days, last active, files/size, 14-day activity and momentum. Manual ratings and assessments persist in `settings.workspaceNotes`.
- **Social application value (deep evaluation)**: six weighted dimensions (docs 20 / license 15 / tests 10 / social impact 25 / engineering substance 15 / sustained activity 15) with score bars, **strengths / gaps**, and prioritized **improvement suggestions** (README, docs, license, tests, social domains, activity); detected domains and signals stay visible, and manual social rating/note are still supported.
- **Value trend and sorting**: the first opening of the Value tab each day captures one score snapshot per workspace (last 12 kept in `settings.valueHistory`), and a "Capture snapshot now" button records one manually; a "Value trend" chart overlays up to six workspaces' histories (switchable between value score and social value, with 7-day / 30-day / all ranges, 0/50/100 and first/last-date axis labels, and a hover tooltip per data point), each card shows the delta and a mini sparkline, snapshots can be cleared per workspace or all at once (both two confirming clicks), and the list sorts by value score / social value / estimated cost.
- **Value exports and archiving**: "Export CSV" downloads the current sorted leaderboard with localized stage/future-value/social-grade/rating labels (UTF-8 BOM for Excel); "Export Markdown report" generates a `.md` report; "Archive as note" stores the same report as a note tagged `工作区` / `价值报告`.
- Unified notes / tasks / flashcards / health workbench: shared list, editor, search, tags, priorities, board layout, import/export; task filters for Today/Overdue/Open/Done and grouping by priority or tag.
- Health module: metric readings (value/second value/unit/measured-at with a per-name trend sparkline plus a mini overview of up to three metrics) and medication plans (daily HH:mm times, pause/resume, today's plan, due-dose in-app reminder), with today's medication included in the daily brief.
- Flashcard editor shows that card's five most recent reviews (time + Again/Hard/Good).
- Flashcards use a SM-2 review queue (front = title, back = body; rates Again/Hard/Good), with a precise due/today/streak summary, a 30-day rating distribution, and a 30-day heatmap backed by a review log (`reviews` in the data file, capped at 5000 records).
- The task board supports drag and drop between the open and done columns and manual ordering inside a column (`order` field, persisted).
- Metric overview cards in the health view open a detail page (larger trend chart, count/min/max/average, newest-first reading history, and a "record once" quick entry). A history row opens an in-place edit overlay (value/second value/unit/measured-at) without leaving the detail page; its trailing button deletes the reading after a second confirming click.
- A "Compare" toggle overlays normalized metric series from the last 30 days in one mini chart; the legend chips select up to three metrics (three most recent by default; clearing all shows a hint).
- The flashcard editor shows the SM-2 suggested next interval, plus an "Overdue — review soon" hint for cards past their next review. Clicking a task card while dragging shows an insertion indicator; the board supports drag and drop between columns and manual ordering inside one.
- Retention buckets per interval since the previous review (within 1 day / 2–6 / 7–29 / 30+ days) with counts and success rate, computed from the review log.
- A due reminder banner appears for due-today/overdue tasks and due medication doses (dismissible per day); due doses also attempt a system notification once per dose per day when the user has granted permission in Settings → Quick Notes → Alerts, and clicking the notification opens the panel. Settings can inject a short daily brief into every agent request.
- Conversation capture: each finalized assistant message carries a Quick Notes icon action that saves the answer as a note (tag `对话`, duplicate content skipped).
- Agent tools cover notes/tasks/cards/health/custom records (`quick_note_search`, `quick_note_create`, `quick_note_update`, `quick_note_complete`, `quick_note_batch`, `quick_note_type`) and workspace value analysis (`quick_note_workspace`); `quick_note_search` hides soft-deleted items unless `includeDeleted:true` and filters by `tag`/`overdue`/`dueWithinDays`, while `quick_note_update` restores with `restore:true`.
- The Host half owns `$DSH_HOME/quick-note/items.json`, serves `GET/PUT /api/quick-note/state` for the panel, read-only `GET /api/quick-note/admin`, `GET /api/quick-note/usage`, and `GET /api/quick-note/workspace-value`, and `GET/POST /api/quick-note/backups`; the read-only/backup routes require the loopback token from `GET /api/quick-note/auth` (rotated on every Host start).
- The browser mirrors the last known state in `localStorage` and reports an offline status when the Host route is unreachable.
- Client changes hot-reload through DSH HMR; Host changes need a recomposition or a DSH restart.
- The sync route is an unauthenticated loopback route, so it is reachable by local processes; notes and tasks are personal local data, not secrets.

## UI upgrade (v1.1.0)

- **Design system**: an additive v3 style layer on top of the theme tokens (spacing rhythm, radius hierarchy, hover/active transitions, focus-visible, responsive rules, and `prefers-reduced-motion`), using only `--dsw-alias-*` tokens and `color-mix` — no literal colors.
- **Shell**: the header becomes a hero card (brand-tinted background, icon, title, subtitle, sync status pill, icon refresh button); tabs use a segmented control with line icons; the search field has an inline icon; primary actions use the brand fill.
- **Overview**: a new "today at a glance" hero (date, four live-metric chips, quick CTA); five KPI cards with icons and state-colored accent bars; six quick-add cards (icon + hint); the recent list uses icons + kind badges; empty states share one EmptyState component.
- **Module pages**: Value / Usage / System / All / Records get a consistent SectionHead; value grade badges are colored by A/B/C/D with a new card head layout; lists, boards, and settings groups share radii and hover styling; the settings page gets an icon header.
- **Accessibility and responsiveness**: all aria/focus-visible semantics are preserved, layouts collapse to one column below 860px, and the system reduced-motion preference is respected.
- Copy is kept in sync in Chinese and English (11 new locale keys); regression tests now assert the new UI structure and CSS brace balance.

- **Appearance settings**: a new Appearance group in Settings offers interface density (comfortable / compact, applied to both the panel and Settings) and an accent color (default brand / green / amber / red, or a custom hex value from a color picker), persisted in `localStorage` under `dsh.quick-note.prefs.v2`.
- **KPI sparklines**: each of the five overview KPI cards embeds a mini 7-day line (tasks = upcoming due distribution, cards = review backlog, reviews = last 7 days, health = recent readings, records = newly created records).
- **Skeleton loading states**: first paint plus the Value, Usage, and System pages show shimmer skeleton cards instead of plain text while loading.
- **Drag-and-drop animations**: board cards lift on hover, scale while dragging, pulse when dropped, and highlight the target column; all CSS transitions/keyframes respect reduced-motion.
- **Layout corrections (v1.1.2, from a real screenshot)**: tab labels use `white-space: nowrap` with horizontal scrolling so CJK labels no longer wrap one character per line; the hero drops the duplicated title/subtitle for "date + Today's overview + summary + CTA"; buttons get a consistent 6px icon/text gap; on wide screens (≥1080px) the overview KPIs stay in five columns; KPI sparklines draw a baseline even with zero data so cards look complete.
- Chinese and English copy stay in sync (10 new appearance keys, 3 obsolete loading hints removed); regression tests cover the new UI structure, interaction styles, and CSS brace balance.

## Depth features (v1.2.0)

- **Command palette**: open with the header "Ctrl/⌘ K" button or the shortcut; search every item (title/body/tags) and run quick actions (view jumps, create any kind); ↑/↓ to move, Enter to run, Esc to close.
- **Pinning**: a pin button in the editor pins/unpins an item, the overview gains a Pinned section, and pins persist in local preferences.
- **Task due presets**: the task editor offers Today / Tomorrow / Next week buttons that set the due time to 18:00.
- **Review depth**: the review page shows a "reviewed today / goal" progress bar (goal configurable in Settings → Appearance → Daily review goal) and an "Undo last rating" button that rolls back the card's SM-2 state and the review log entry.
- Full roadmap in [docs/ROADMAP.md](docs/ROADMAP.md) (P0–P3 priorities, per-module gap matrix, quality targets).

## Depth features (v1.3.0)

- **Backups and restore**: the Host keeps rolling full-document backups after writes (`$DSH_HOME/quick-note/backups/`, up to 10, roughly one every 5 minutes) plus a manual "Back up now"; Settings lists them and restores behind a two-step confirmation; full JSON export/import covers items + settings + reviews + types and imports through the optimistic-locked write path.
- **Task depth**: checklists (subtasks with check/delete, max 50), repeating tasks (daily/weekly/monthly that spawn the next occurrence on completion), and a task toolbar showing done today, done this week, and overdue counts.
- **Review depth**: review scope (due / new / all), keyboard shortcuts (1 again / 2 hard / 3 good / Space answer / Esc exit / U undo), and a focus mode that hides the shell for a centered review card.
- **Health reference ranges**: the metric editor stores a local min/max; the detail page shows a Normal/High/Low badge and abnormal readings are highlighted in the history list.
- **Agent additions**: new `quick_note_batch` (complete/reopen/soft-delete/priority/tags/due), `quick_note_search` filters `tag` / `overdue` / `dueWithinDays`, and task create/update accept `checklist` and `repeat`.
- New `GET/POST /api/quick-note/backups` route (token-protected); see [docs/ROADMAP.md](docs/ROADMAP.md) for the full plan and progress.

## Consolidation refactor (v1.3.1 / v1.3.2)

- **Segmented controls**: a shared `Segmented` component now renders the value sort, trend range, trend metric, review scope, and appearance density pickers (5 inline copies removed).
- **Value labels**: the three local stage/future/social label maps in the value card were removed in favour of the existing `valueStageText` / `valueFutureText` / `valueGradeText` helpers.
- **Creation entry**: `createItem` now delegates to `quickCreate(viewKind)`, removing a near-duplicate implementation.
- **Settings writes**: module-level `writeSettings(mutator)` plus panel-level `saveSettings` replace 7 copies of the readState → putState → refresh refs pattern (snapshots, history clearing, workspace notes, brief toggle, pricing).
- **Overview rows**: a shared `OverviewRow` component backs both the pinned and recent sections.
- **Downloads**: `downloadTextFile` replaces four Blob+anchor copies (CSV, Markdown, item export, full backup).
- **Protected requests**: `protectedRequest` merges the duplicated read/post token-retry logic.
- **Save scheduling**: `scheduleSave` merges the debounce used by `applyItems` and `applyTypes`.
- **Host read routes**: `createReadRoute` merges the method/path/token/error boilerplate for admin/usage/value; `costOfTokens` merges the usage and value cost math.
- **View/kind metadata (v1.3.2)**: `VIEW_META` / `KIND_META` central tables replace the scattered label/icon/create-action mappings used by tabs, the create button, palette actions, and quick-add cards.
- **Table rows (v1.3.2)**: a shared `TableRow` component backs both the All table and the Records table.
- **Host tool text (v1.3.2)**: `renderText` replaces 16 repeated `[{ type: 'text', … }]` returns.
- Note: a shared settings/panel state layer was evaluated and intentionally skipped (different host lifetimes and injection would need cross-component subscriptions); reusing `writeSettings` keeps the duplication minimal.
- Result: `client.js` ~396KB → **389.6KB**, `index.js` ~103KB → **101.7KB**, with the 81/65 regression baseline unchanged.

## Savings-mode effect tracking (v1.44.0)

- The Auto savings panel now compares average daily cost before and after savings mode, with a percentage delta
- Falls back to recent 7 days vs previous 7 days when savings mode was never activated
- Uses the existing 30-day cost series; no extra Host request
- Regression: 214 host + 168 client + 20 browser-smoke checks; client ~660KB, index ~266KB, 804 locale keys

## Model strategy selection and budget-guard verification (v1.43.0)

- The Auto savings panel now has a savings-model dropdown listing every model exposed by mounted providers; leave it on Auto select for automatic choice
- Discover savings models refreshes both cheap candidates and the full model catalog
- Usage monthly forecast now uses month-to-date cost ÷ elapsed days × days in month, falling back to 7-day average × 30
- Host regression now verifies that a tiny budget makes the check trigger savings mode automatically
- Regression: 214 host + 168 client + 20 browser-smoke checks; client ~657KB, index ~266KB, 800 locale keys

## System / cleanup / value / usage UI unification (v1.42.0)

- **System**: a Budget & savings policy card shows daily/monthly budget, savings mode, and savings model, with an Open optimizer button
- **Cleanup schedule**: KPI cards for next run, last result, and success count, plus an auto-clean summary
- **Value**: side-by-side High-value vs High-cost workspace cards
- **Usage**:
  - Workspace cost trend bars
  - Forecast monthly cost KPI (7-day daily average × 30)
  - Session ranking with #1 labels
- Regression: 213 host + 168 client + 20 browser-smoke checks; client ~656KB, index ~264KB, 798 locale keys

## Configurable thrift list and savings comparison (v1.41.0)

- **Configurable high-cost workspace thrift list**: toggle the top 3 cost workspaces in the Auto savings panel; the list persists in `thriftWorkspaces` and the savings prompt explicitly names them for targeted reads and no whole-file paste
- **Before/after cost comparison**: the 30-day cost chart now draws actual cost and a no-cache baseline, with cumulative savings
- **Automatic cheaper-model discovery**: discovers flash/lite/mini/fast/turbo models from mounted LLM providers, excludes max/pro/ultra/reason/thinking, lists candidates in the panel, and offers a force-refresh Discover button; savings mode picks the best candidate automatically
- Baseline: 213 host + 165 client + 18 browser-smoke checks; client ~647KB, index ~264KB, 782 locale keys
- Build budgets: 680KB client / 280KB index

## Budget guard and one-click savings mode (v1.40.0)

- **Automatic budget guard**:
  - 80% of the daily/monthly budget sends a webhook warning
  - 100% automatically enables savings mode (`savingsGuard` on by default)
  - Budget state is shown live in the Auto savings panel
- **One-click savings mode**:
  - The Optimizer's Enable savings mode button persists via Host `POST /api/quick-note/savings-policy`
  - Automatically picks a flash/lite/mini/fast cheaper model and saves it as the DSH default model (new sessions)
  - Injects a concise system directive: no full-file restatements, prefer diffs, about 1200 output tokens
  - Compaction and tool-result pruning stay automatic (70% threshold)
- **High-cost workspace thrift**:
  - The Auto savings panel lists the three most expensive workspaces
  - The savings prompt prefers targeted reads and avoids whole-file paste
- **v1.40.1 additions**: a Check budget button evaluates the guard immediately; the panel shows the current default model beside the savings model.
- Baseline: 213 host + 165 client + 18 browser-smoke checks; client ~643KB, index ~262KB, 775 locale keys
- Build budgets raised to 680KB client / 280KB index for this feature set

## Auto-savings panel and automatic compaction (v1.39.0)

- Enabled and verified DSH official auto-saving plugins:
  - `@deepseek-ai/dsh-compaction-basic`: automatic context compaction, `auto: true`, threshold 70%, retain 35%
  - `@deepseek-ai/dsh-compaction-tool-result-pruner`: automatic pruning of oversized tool results
  - `@deepseek-ai/dsh-command-compact`: `/compact` manual compaction
- New **Auto savings** panel in the Optimizer:
  - Shows whether auto compaction / tool-result pruning / compact command are enabled
  - Shows current context ratio, pressure tokens, and estimated compressible tokens
  - Shows daily/monthly budget status
  - One-click **Open plugin settings** and an immediate refresh button
- New Host read-only endpoint `/api/quick-note/savings` aggregating compaction, pruner,
  tokenMeter, agents, and current-session pressure
- Verified: current session 35.1% (368,238 / 1,048,576 tokens); high-pressure session 68.8% (720,972 / 1,048,576), with 196,684 tokens estimated compressible
- Baseline: 211 host + 165 client + 18 browser-smoke checks; client ~639KB, index ~252KB, 767 locale keys

## Cost/cache-hit deep visualization (v1.38.0)

Added on top of the v1.37 dashboard:

- **Cost by workspace horizontal bars**: up to 6 workspaces, cost-sorted, with amount, tokens, and relative length
- **30-day cost trend line**: date axis, latest value, gradient area, and grid lines
- **30-day cache hit rate line**: 70% target dashed line, latest value, and date axis
- **Expandable "Potential savings"**:
  - Calculation inputs: total input tokens, current/target/potential hit rate, hit-vs-miss price gap
  - Explicit formula: `input tokens × hit-rate gain × price gap ÷ 1,000,000 = savings`
- Host `efficiency.daily30` now exposes daily `cacheHitRate` for the trend line
- Browser smoke checks workspace bars, both trend lines, and the expanded calculation

Baseline: 210 host checks + 164 client checks + 18 browser-smoke checks; client ~632KB, index ~249KB, 754 locale keys.

## Token efficiency and cost visualization (v1.37.0)

The **Analytics → Optimizer** tab now opens with a visual dashboard:

- **Potential savings**: the most prominent card, estimated cumulative savings from raising the cache hit rate toward target
- **Efficiency score ring**: conic-gradient ring plus cache/cost/output component scores
- **Cost breakdown donut**: cached input / uncached input / output costs, with a full legend
- **Cost projection**: current cumulative versus projected cost bars, plus saved percentage and amount
- **Recommendation badges**: each cache recommendation shows its `Save ¥x` amount
- **Responsive**: auto-fit cards wrap on narrow screens
- Browser smoke now checks the optimizer dashboard and captures `optimizer-smoke.png`

Baseline: 209 host checks + 162 client checks + 16 browser-smoke checks; client ~622KB, index ~249KB, 742 locale keys.

## Management console audit + calendar/tool fixes (v1.36.0)

- **Agent tool output schema fix**: `quick_note_search` and other tools returned `health.intakes` without declaring it in the shared `ITEM_SCHEMA`, so runtime output validation rejected the whole tool result. The field is now declared and covered by a regression check.
- **Calendar/timeline medication aggregation**: a medication plan renders one event per day (`Drug A ×2`) instead of one chip per scheduled time; hover shows the complete time list.
- **Calendar performance**: the 42-day grid caches events per day, avoiding repeated full scans by month count, selected day, and the future timeline.
- **Calendar accessibility**: date buttons expose an event-count aria-label and `aria-pressed`.
- **v1.36.1 additions**: a "Meds" visibility toggle, i18n grouping copy, and horizontal scrolling for narrow calendars.
- **Regression**: 209 host + 161 client checks pass.
- **Audit report**: [docs/AUDIT-2026-11-10.md](docs/AUDIT-2026-11-10.md)

## Exponential curve / med reminders / custom shortcuts / backup progress / multi-timezone etc (v1.35.0)

- **Exponential forgetting-curve fit**: least-squares fit of ln(retention) vs day interval, reporting 1/7/30-day predictions and a half-life.
- **Med reminders + weekly adherence**: `medReminderEnabled` filters Host reminders; the health view adds per-day 7-day report cells and a reminder toggle.
- **Custom shortcuts**: `shortcuts.palette/help` settings drive the palette and help shortcuts; the help panel shows the current values.
- **Backup interval visualization**: settings show a progress bar/percentage toward the next automatic backup.
- **Cron multi-timezone compare**: `cron-preview-multi` returns three upcoming runs for local/UTC/Asia/Shanghai.
- **PNG title/axes**: 480×260 output with a `SHARE ACCESS` title, axes, grid, and bars.
- **Webhook queue export/import**: `webhook-export` / `webhook-import` (JSON array with de-duplicated merge).
- **Preset ordering**: saved trash presets can be moved up/down.
- **Regression**: 208 host + 157 client + 13 browser-smoke checks pass.

## Package A: review curve / med adherence / shortcuts / backup diff + cron fixes (v1.34.0)

- **Review forgetting-curve forecast + goal history**: the review page adds 1/7/30-day retention predictions and a 7-day daily-completions-vs-goal bar history.
- **Medication adherence**: med items gain `health.intakes`; the health view shows weekly adherence and a "Log taken" button, normalized on both Host and client.
- **Shortcut help panel**: press `?` or the header `?` button to list Ctrl/⌘K, 1/2/3, Space, U, Esc; Esc closes it.
- **Backup diff preview + interval**: Host adds `GET /backups?diff=name` (added/removed/changed/settings); settings expose a 1–1440 minute auto-backup interval.
- **Cron fixes**: day-of-month/day-of-week now use standard OR semantics when both are restricted; the cleanup timer moved from 15 minutes to **15 seconds**.
- **Regression**: 203 host + 157 client + 13 browser-smoke checks pass.

## IANA timezones / PNG chart / queue in store / custom presets (v1.33.0)

- **Full IANA timezones**: cron timezones accept IANA names such as `Asia/Shanghai`, `Asia/Tokyo`, `Europe/London`, and `America/New_York` (Host derives zone calendar fields via Intl); previews stay at 10 runs.
- **Share PNG chart**: new `{action:'share-chart-png'}` uses a built-in PNG encoder to render a 480×240 bar chart to `share-chart.png`; the panel adds an "Export PNG chart" button.
- **Webhook queue persisted in store**: the queue moved into the `items.json` document field `webhookQueue` under the store lock/revision; the legacy file remains as a fallback.
- **Custom trash presets**: the current type/workspace/search combination can be named and saved to settings `trashPresets`, then applied or deleted from the panel.
- **Regression**: 198 host + 152 client + 13 browser-smoke checks pass.

## Cron timezone/10 previews / share chart range / webhook batch / trash presets (v1.32.0)

- **Cron timezone**: `cleanupScheduleTimezone` (local / UTC±h) applies a fixed offset to cron matching; previews now return the next 10 runs.
- **Share chart date range**: the share-stats bar chart filters by the report date inputs (same range as CSV export).
- **Webhook queue batch actions**: multi-select queue items and batch-edit payloads, batch resend, or batch remove.
- **Trash presets**: quick presets (All / Attachments only / Temp only / Builds only) layered over type, workspace, search, and pagination.
- **Regression**: 195 host + 152 client + 13 browser-smoke checks pass.

## Cron preview / CSV ranges / webhook edit-resend / workspace filter (v1.31.0)

- **Visual cron preview**: new `cron-preview` action returns the next five runs; the optimizer adds a "Preview next 5" button with the time list; invalid expressions return 400.
- **Share CSV date ranges**: `share-csv` accepts `from/to` (filtering by lastAt/firstAt), reusing the report date inputs; the response includes `range`.
- **Webhook queue edit/resend**: new `webhook-edit` (URL/JSON payload, attempts reset) and `webhook-resend` (immediate single resend); each panel row offers Resend / Edit / Delete.
- **Trash workspace filter**: trash records expose `roots`, and the panel adds a workspace dropdown (all workspaces + each root) combined with type/search/pagination.
- **Regression**: 192 host + 152 client + 13 browser-smoke checks pass.

## Cron expressions / share CSV / webhook queue panel / trash type filter (v1.30.0)

- **Cron expressions**: `cleanupScheduleCron` accepts five fields (minute hour day month weekday, e.g. `0 3 * * 1`); the schedule mode gains `cron`, the Host computes the next occurrence/due state, and both the optimizer and schedule page can set it.
- **Share stats CSV export**: new `{action:'share-csv'}` exports `share-stats.csv` (name/count/firstAt/lastAt/refs); the client shows the saved path and row count.
- **Webhook queue panel**: queue entries show URL/error/time and can be removed individually (`webhook-remove`); retry-all remains.
- **Trash type filter**: All/Attachments/Temp/Cache/Builds filters combine with search and pagination; trash records keep category metadata.
- **Regression**: 186 host + 150 client + 13 browser-smoke checks pass.

## Cron time / share charts & referrers / webhook retry queue / trash paging (v1.29.0)

- **Cron custom time**: `cleanupScheduleTime` (HH:MM, default 03:00); both the schedule page and optimizer can set the run time, and the Host decides daily/weekly due-ness at that local time and reports `nextRunAt`.
- **Share charts + referrer analysis**: share visits now record the referrer hostname; scans return `shareStats` with `refs`, and the optimizer renders a bar chart for top shares plus direct/referrer distribution.
- **Webhook failure retry queue**: failed deliveries go to `webhook-queue.json` (max 20, backoff, 5 attempts); the Host retries every 5 minutes and the panel shows the queue size plus a "Retry queue" button for an immediate retry of due items.
- **Trash pagination + capacity warning**: five records per page (`‹` / `›`, search resets to page 1); an 80% capacity warning appears when the trash is nearly full.
- **Regression**: 182 host + 149 client + 13 browser-smoke checks pass.

## Schedule page / webhook templates / batch restore / share stats (v1.28.0)

- **Independent cleanup-schedule page**: Insights gains a "Cleanup schedule" sub-tab showing the mode, last/next run, and the latest 20 runs; failed runs expose a "Retry" action that triggers auto-clean immediately.
- **Webhook templates + test send**: supports `generic` / `slack` / `feishu` payloads; the optimizer offers template selection and a "Send test" button (Host force-sends a sample, bypassing daily dedupe).
- **Trash search & batch restore**: trash records can be searched by id/date, multi-selected and batch restored; Host adds `{action:'restore', ids}` (up to 20).
- **Share access stats**: every share-HTML visit is counted in `share-stats.json` (count/firstAt/lastAt); scans return `shareStats` and the optimizer shows top shares with visit counts.
- **Regression**: 178 host + 147 client + 13 browser-smoke checks pass.

## Schedule log / custom date range / budget webhook / trash limits (v1.27.0)

- **Auto-clean schedule log**: scans include `schedule {mode,lastRunAt,lastResult,nextRunAt}`; the panel shows last/next run times and auto-clean history rows are tagged "auto".
- **Custom report date range**: the optimizer adds start/end date inputs; exported/shared report HTML filters the daily cost table by that range and shows the 统计区间 label; the Host returns `range`.
- **Budget webhook**: settings add `budgetWebhookUrl`; the Host timer POSTs JSON at 80% warning/overspend (event/todayCost/limit/percent/monthly), deduped per day; the client exposes a save field.
- **Trash capacity limits**: at most 20 records or 1GB; oldest records are evicted automatically and their history marked non-recoverable; the panel shows `count/20`.
- **Regression**: 175 host + 144 client + 13 browser-smoke checks pass.

## Trash management / report range / monthly budget / auto-clean (v1.26.0)

- **Trash management**: scans include `trash {count,bytes,records}`; the panel shows trash size and an "Empty trash" action, while undoable history shows "~Nh left to undo" plus the undo button.
- **Report snapshot range**: the optimizer HTML gains a `range-filter` (last 7 / 30 days) driven by the new `daily30` series.
- **Monthly budget + 30-day curve**: settings add `tokenBudgetMonthly`; the optimizer adds a monthly budget input, progress/overspend state, and a 30-day cost curve; reminders `budget` gains monthly fields.
- **Auto-clean schedule**: settings add `cleanupSchedule` (off/daily/weekly); the Host checks every 15 minutes and runs safe-category cleanup (pluginTemp/workspaceJunk/workspaceCaches) when due — items still go to recoverable trash; the panel also offers "Run auto-clean now".
- **Regression**: 171 host + 143 client + 13 browser-smoke checks pass.

## Trash undo / snapshot filters / 80% warning / session jump (v1.25.0)

- **Trash (real undo)**: cleanup no longer deletes directly — files/dirs move into `$DSH_HOME/quick-note/trash/<record-id>/`; history records are `recoverable:true` for 24h.
  - The panel shows an "Undo cleanup" button; `POST /cleanup {action:'undo', id}` restores original paths (occupied targets get a `.restored-<ts>` suffix).
  - Scans prune trash older than 24h; expired records refuse undo.
- **Optimizer HTML filters/search**: the report snapshot gains a search box and a workspace dropdown filtering workspace/session tables and recommendation cards.
- **80% budget warning**: reminders `budget` adds `warn/status`; a once-per-day warning fires at 80%, with a separate overspend notice beyond 100%.
- **Session jump**: expensive-session and workspace-session rows are clickable and call `uiWorkspace.openSession(sessionId)` (silently ignored when the service is unavailable).
- **Regression**: 165 host + 140 client + 13 browser-smoke checks pass.

## Budget alert / report snapshot / workspace drilldown (v1.24.0)

- **Budget overspend feeds Host reminders**: `tokenBudget` is now persisted in document settings (Host-visible); the reminders snapshot adds `budget {limit,todayCost,percent,over}`, and ReminderBridge sends a once-per-day system notification when over budget.
- **Report share as a read-only snapshot**: `POST /api/quick-note/optimizer-report` accepts `{format:'html'}`, writes a standalone dark-theme HTML into `shares/`, and returns `/api/quick-note/share/<name>`; the client adds a "Share report snapshot" button.
- **Workspace cost drilldown**: the Optimizer tab adds a workspace cost list; clicking a workspace expands its expensive sessions (session id / tokens / cost).
- **Cleanup history refinement**: records now carry `recoverable: false`; the UI shows a clear "not undoable" marker plus category-specific rebuild/recovery hints.
- **Regression**: 163 host + 137 client + 13 browser-smoke checks pass.

## Cleanup history, session drilldown & optimizer report (v1.23.0)

- **Cleanup history + recovery hints**: every clean writes `$DSH_HOME/quick-note/cleanup-history.json` (max 20 entries); the Optimizer tab shows recent entries (time / removed / freed) and per-category recovery hints (attachments unrecoverable, how to rebuild build outputs, caches rebuild on demand, etc.).
- **Top-session drilldown**: the Optimizer tab lists the top 6 expensive sessions with workspace, tokens, and cost from the usage report.
- **Optimizer report export**: new `POST /api/quick-note/optimizer-report` aggregates the efficiency score, recommendations, top workspaces/sessions, and cleanup stats into a Markdown file under `$DSH_HOME/quick-note/reports/optimizer-<ts>.md`; the client exports with one click and shows the path.
- **Regression**: 160 host + 133 client + 13 browser-smoke checks pass; token protection and the build-consistency gate remain.

## Optimizer folded into the console + daily budget (v1.22.0)

- **Merged entry point**: the Optimizer is no longer a separate sidebar panel; it now lives under **Insights → Optimizer** alongside Value / Usage / System. The sidebar keeps only the management console.
- **Daily budget**: the Optimizer tab adds a "Daily budget (¥)" field; after saving it shows today's spend progress bar and an overspend alert (red when over). The value is stored in local preferences (`tokenBudget`).
- **Preserved capabilities**: efficiency score, cost KPIs/14-day bars, cache savings estimate, recommendations, and cross-workspace scan/clean all remain.
- **Regression**: 156 host + 130 client + 13 browser-smoke checks pass; the build-consistency gate stays in place.

## Optimizer: token-efficiency dashboard + workspace cleanup (v1.21.0)

> Since v1.22.0 the Optimizer is folded into Insights → Optimizer instead of a separate sidebar panel; the capabilities below remain.

- **New sidebar panel "Optimizer"** (`quick-note-optimizer`):
  - **Efficiency score (0–100)**: weighted cache hit 50% + cost per session 30% + output ratio 20%.
  - **Cost visualization**: today/last-7-days cost, cost per session, total tokens/cost, and a 14-day cost bar chart.
  - **Savings estimate**: how much a cache-hit improvement to the 70% target would save (using miss/hit price difference).
  - **Recommendation cards**: cache hit, top spending workspace share, input-heavy context, session-cost baseline, each graded high/medium/info.
- **Workspace cleanup (cross-workspace)**:
  - Plugin data: orphan attachments, staged installers, plugin temp files.
  - Every registered workspace: temp/log/OS junk (`.DS_Store`, `Thumbs.db`…), cache dirs (`__pycache__`, `.pytest_cache`, `.cache`, `node_modules/.cache`), build outputs (`dist/build/out/target/coverage/.next`, explicit opt-in), plus report-only large stale files (>50MB, 90 days).
  - Flow: scan → select categories → clean selected. The Host rescans, deletes only that scan's items whose resolved path stays inside the recorded root (no traversal), and never touches source files, unchecked categories, or attachments that are still referenced.
  - Scanning is bounded (≤5000 files / 6s per scan, `truncated` flag when hit) so large workspaces cannot block the panel; cleanup only deletes items from that scan.
  - All endpoints are loopback-token protected; scanning is read-only.

## R1 wrap-up: entry shell + build gate (v1.20.0)

- `src/entry.mjs` now holds the whole factory body (constants, `PanelBoundary`, `apply`) — the `src/client.template.js` shell is **181B** (ModuleLoader wrapper, factory, return only). All logic/data comes from `src/` modules.
- Build consistency gate: `build-client.mjs` exports pure `composeClient()`; `check-build.mjs` compares `client.js` with the regenerated text and exits 1 on drift. Host regression adds `build artifact matches source`; `npm test` runs build + check before the suite, so hand-edited artifacts fail fast.
- The bundle remains **517,514B**, byte-identical; 150 host + 126 client checks pass.
- Optional domain split of helpers was not executed: the 119 injected source blocks have order/position dependencies, so it needs an explicit dependency/order manifest first (tracked in NEXT-FEATURES).

## R1 step 4: panel body modularized (v1.19.0)

- **119 top-level function/component sources moved to [src/helpers.mjs](dsh-quick-note/src/helpers.mjs)**, including `WorkbenchPanel` and all remaining data/format/reminder/attachment/voice helpers. `src/client.template.js` now keeps only constants, the `PanelBoundary` class, and the `apply` registrations — shrinking from ~361KB to ~26KB.
- The build re-emits the 119 source blocks in their original order; `client.js` stays a single runtime bundle and is **byte-identical to the pre-migration build (517,514B)**. The full equivalence suite passes.
- `scripts/extract-helpers.mjs` records the migration; R1's main body migration is complete, with only `PanelBoundary` and `apply` left as possible follow-ups.

## Component modules, Host reminders & performance budget (v1.18.0)

- **R1 step 3**: `SectionHead`, `SettingsSection`, and `DueReminder` sources moved to [src/components.mjs](dsh-quick-note/src/components.mjs); the template is now ~353KB and `client.js` stays a single runtime bundle. Full regression passes.
- **P1-4 Host timer + notification bridge**: the Host recomputes a reminder snapshot every 60s and exposes token-protected `GET /api/quick-note/reminders`; a new client `ReminderBridge` overlay consumes it and sends once-per-day system notifications (the in-app banner remains).
- **Performance budget**: build caps client.js <640KB, index.js <220KB, template <500KB (host test); panel render <100ms (client test, 0ms measured); browser boot <5000ms (R2 smoke, CI guard).
- **Snapshot boost**: the standalone HTML now has a search box, all/note/task/card filters, and `prefers-color-scheme` dark mode; filtering is inline with no external dependencies.

## Read-only snapshot & R1 step 2 (v1.17.0)

- **P1-5 read-only snapshot**: Settings → data now generates a standalone HTML snapshot (notes/tasks/cards, escaped and self-styled) under `$DSH_HOME/quick-note/shares/` and returns its local path; `GET /api/quick-note/share/<name>?token=...` opens it in a browser. Filename whitelist blocks path traversal.
- **R1 step 2**: `ICON_PATHS`, `STYLES`, and `STYLE_UPGRADES` moved to [src/ui-assets.mjs](dsh-quick-note/src/ui-assets.mjs); the template shrank from ~464KB to ~386KB while `client.js` remains a single runtime bundle.
- **Equivalence**: the full suite passes after rebuilding (Host 145 / Client 125), including CSS brace balance and theme-token checks.
- **Next R1 slices**: move components and panel logic into `src/`, rebuilding and running the suite after each move.

## Voice, Markdown & build split (v1.16.0)

- **P1-1 voice notes**: a microphone button in the composer records audio, resamples it to 16kHz mono WAV in the browser, uploads it to `/api/quick-note/transcribe`, and the DSH `speechToText` service turns it into a 语音-tagged note; missing service/providers produce a clear notice.
- **P1-3 Markdown folder exchange**: Settings → data now has a folder input plus export/import buttons. Export writes `.md` files with front matter (`source: quick-note`); import deduplicates by id/title+body and tags imported items 导入; both routes require the loopback token.
- **R3 write switch**: Settings adds "Sync write mode" (incremental PATCH by default, full PUT for debugging/compatibility); conflicts still fall back to a full merge.
- **R1 build split (first slice)**: `client.js` is now generated — dictionaries live in `src/locale.mjs`, the rest in `src/client.template.js`, and `scripts/build-client.mjs` injects them. `npm run build` regenerates; `npm test` builds first. The full equivalence regression passes (Host 141 + Client 124).
- **Next R1 slices**: move components, styles, and panel logic into `src/`, running the equivalence suite after each move.

## Web clipping & reminder boost (v1.15.0)

- **PATCH incremental writes (R3 complete)**: `PATCH /api/quick-note/state` accepts `upserts` (adds/changes/tombstones) with `If-Match` and returns the full current document on 409. The client flush now diffs items by content signature and only sends changed ones; conflicts fall back to a full-PUT merge.
- **Web clipping (P1-2)**: a new `/clip <URL>` slash command and `POST /api/quick-note/clip` route; the Host fetches the page (15s timeout, 2MB cap, redirects followed) and extracts `og:title`/`<title>`, description, and a body excerpt, saving a note tagged 剪藏 with the source URL.
- **Reminder boost (P1-4 client + Host brief)**: the in-app reminder now includes **due review cards** and fires a once-per-day system notification for them; the Host daily brief adds a "待复习 N 张" line so the agent sees due cards.
- **R1 build split**: not executed this round; it needs esbuild plus a large `src/` extraction of the 10k-line bundle and is scheduled as a separate iteration (see NEXT-FEATURES).

## Knowledge base upgrade & performance (v1.14.0)

- **Attachments / image notes**: the editor gains an Attachments section for images (thumbnail preview) and files (pdf/txt/md/csv/json/zip/audio/video). One file ≤25MB, up to 12 per item, with removal. Files are stored under `$DSH_HOME/quick-note/files/`, protected by the loopback token and random ids (`<img>`/download links carry the token query). **JSON backups contain only attachment refs; the file bodies stay in that directory.**
- **Incremental sync (R3 read path)**: `GET /api/quick-note/state?since=<watermark>` returns only items/reviews newer than that watermark; the 12s client poll sends its local watermark and merges, preserving local tombstones. First load and conflict resolution still use full documents; writes remain a full PUT (diff writes are next).
- **List virtualization (R4)**: flat lists with more than 150 rows render through `VirtualRows` (60-row buffer, windowed slice); short lists keep the classic rendering, and selection/batch/shortcut behavior is unchanged.
- **Capture from v1.13 stays**: six slash commands, session-row save, composer quick-capture button, and the dock chip.

## Chat-native capture (v1.13.0)

- **Slash commands (Host `commands` service)**: create/query without opening the panel
  - `/note <text>` saves a note; `/capture <text>` captures a conversation snippet (tagged 对话)
  - `/task <title> [--due 2026-11-06|today|tomorrow] [--priority low|normal|high] [--tag tag]`
  - `/search <keywords>` returns matching ids; `/plan` summarizes the next 7 days (tasks/reviews/meds); `/review` lists due cards
  - Registration conflicts are skipped safely and never break plugin loading
- **Session-row capture**: a hover action saves the session as a note (source session id + 会话 tag, deduplicated)
- **Composer entry points**: a quick-capture button in the composer tool row and an ambient dock chip showing due tasks / reviews / meds that opens the console
- **R2 real-browser smoke**: `test/browser-smoke.mjs` drives headless Edge/Chrome over CDP against the real DOM/CSS: six merged tabs, knowledge sub-tabs, plan calendar (42 cells) + timeline, no horizontal overflow, no uncaught exceptions, plus `test/artifacts/panel-smoke.png`. Defaults to a self-contained fixture (real React, real browser) and also accepts `--url=` for a live GUI.

## Harness version manager (v1.12.0)

- **Location**: a "Harness version manager" group at the bottom of Insights → System.
- **Release channels (stable + other versions)**:
  - **Official stable direct link**: one click performs HEAD build-time check → download → local SHA-256 → approval; ~276MB streams to disk and no feed configuration is required.
  - **Other versions (GitHub Releases)**: fetches the official release list (including prereleases) and shows version / prerelease badge / publish date / installer availability per row; releases with assets can be downloaded directly, releases without assets show a hint plus the release page link.
  - **Custom installer URL**: paste any https installer with an optional SHA-256; after download the local hash is shown and approval installs it (useful for official offline packages or community builds).
- **Approval install**: all three sources require an explicit checkbox plus a matching local SHA-256; the Host re-verifies the staged file hash, and approval works without the high-risk auto-update switch.
- **Readable release notes**: notes are stripped of HTML/anchors/Markdown and truncated, with "Show full notes / Collapse notes" and an "Open release page" link.
- **No-asset guidance**: when a release has no installer assets the panel explains it and offers the direct/custom options instead of failing silently.
- **Immediate feedback**: every action shows "Working…" right away and failures include the Host reason; a busy ref prevents stale state from swallowing clicks.
- **Layout polish**: the manifest template is collapsed by default, long URLs wrap inside a capped block, action rows are left-aligned and wrap, and the `example.com` template feed shows a warning.
- **Version info / feeds / auto-check**: current version from app.asar; custom JSON manifest feeds remain supported, as do auto-check notifications and the manual check/download/approve/install flow.
- **Restart DSH (requires the switch + two-step confirm)**: relaunches `process.execPath` and exits the current process — **this ends the current session**.
- **Safe defaults**: the auto-update switch is off by default; auto-check is read-only and never downloads; every version-manager request requires the loopback token; feed and hash are always human-verified.

## Insights module (v1.5.0)

- **Three-in-one**: the former System / Usage / Value top-level tabs are merged into one **Insights** tab with Segmented sub-tabs (Value / Usage / System); the last choice persists as `insightTab`.
- **Usage detail**: four KPIs (tokens / cost / cache hit rate / sessions), a 14-day usage line, per-workspace cache hit rate, average tokens per session and last activity, plus the top 12 sessions (id, workspace, tokens, cost, last active).
- **Deep social value**: six weighted dimensions (docs / license / tests / social impact / engineering substance / sustained activity), dimension bars, strengths/gaps badges, and prioritized improvement suggestions (README, docs, license, tests, domains, activity).
- New Host fields: `daily[]`, `topSessions[]`, `totals.cacheHitRate`, `totals.avgTokens`, row-level `cacheHitRate/avgTokens/lastAt`; value rows add `socialBreakdown/socialStrengths/socialGaps/socialSuggestions`.

## Module consolidation (v1.11.0)

- **Knowledge = Notes + Review (learning)**: the former Notes and Review top-level tabs are merged into **Knowledge** with Segmented sub-tabs (Notes / Review); the last choice persists as `knowledgeTab`. Card review, SM-2, daily goal, focus mode, undo, and card history all stay.
- **Plan = Tasks + Calendar + medication timeline**: Calendar is now the third **Plan** layout (List / Board / Calendar), and the calendar page adds a **next-7-days timeline** that groups task due dates, card reviews, and medication reminders by day (clicking an event jumps to the item).
- **Overview = Overview + All**: the cross-module All table became an Overview sub-view (Dashboard / All); batch actions and filters are unchanged, with `overviewTab` persisted.
- **Tab count**: 11 → 6 (Overview / Knowledge / Plan / Health / Records / Insights). Module visibility toggles, routes, data shape, and agent tools are unchanged.
- **Shared building blocks**: all sub-tabs and layouts reuse the `Segmented` control and the existing preference store; no data-model changes.

## Task calendar (v1.4.0)

- New **Calendar** tab: a 42-cell month grid (adjacent months dimmed) showing task due times, card reviews (`review.dueAt`), and medication plans (daily `times`) together.
- Toolbar: previous/next month, Today, and the month's event count; events are color-coded (task = accent, review = amber, medication = green, overdue = red, done = strikethrough).
- Click any day for the full day agenda; click an event to jump to its item. Cross-month events still appear in the adjacent grid cells.
- Responsive: narrow screens hide in-cell chips and keep the date plus the selected-day agenda; everything uses theme tokens and the accent variable.

## Regression tests (added after audit)

The `test/` directory holds self-contained regression tests (no browser or DSH instance required):

- `test/host.test.mjs` — Host half: normalization/hostile input clamping, state/admin/usage/workspace-value route boundaries (404/405), read-token authorization (401/403/valid token), optimistic locking (ETag/If-Match/409/legacy writes), usage tokens and cost, value/social scores and cache invalidation, all seven agent tools (type cascade soft delete, search hiding/including tombstones, restore, report, archive, rate, snapshot, batch actions, checklist/repeat), rolling backups, daily brief (soft-deleted items hidden), **six slash commands (note/capture/task/search/plan/review with option parsing)**, and static i18n/theme-token checks
- `test/client.test.mjs` — client half: renders the whole panel with a React stub (overview KPIs, tabs, records page, value trend, archive action), the settings section, conflict merging (local edits kept, agent additions kept, newer remote edit wins, soft delete applied and hidden in the UI, merged result shown immediately), automatic token refresh after 401, and **session-row save / composer dock / quick-capture slot components**
- `test/browser-smoke.mjs` — R2 real-browser smoke (headless Edge/Chrome + CDP); self-contained fixture by default, `--url=` for a live GUI; needs Chromium and full access outside the DSH file sandbox
- `test/run.mjs` — runs both Node suites and prints `RESULT PASS/FAIL`
- `test/helpers.mjs` — fake Cordis ctx, HTTP request helper, temporary DSH_HOME, React/browser/fetch stubs, and the renderer

Run from the plugin directory:

```powershell
$env:ELECTRON_RUN_AS_NODE='1'; & 'D:\Programs\DeepSeek Harness\DeepSeek Harness.exe' 'test\run.mjs'
# real-browser smoke (writes test\artifacts\panel-smoke.png):
$env:ELECTRON_RUN_AS_NODE='1'; & 'D:\Programs\DeepSeek Harness\DeepSeek Harness.exe' 'test\browser-smoke.mjs'
# or with Node 22+ installed: npm test / npm run test:smoke
```

Baseline: 214 host checks + 168 client checks + 20 browser-smoke checks pass (exit code 0). Build: `npm run build` generates `client.js` from `src/`; `npm run check` verifies the artifact matches the source; `npm test` runs build + check + regression.

## Concurrent writes, item revisions, soft delete, and read-only auth (added after audit)

- `PUT /api/quick-note/state` supports the standard `If-Match: "<revision>"` header (an unquoted number is also accepted); a stale revision returns **409** with the full current document (revision, items, settings, reviews, types) and nothing is written.
- `GET`/`PUT` responses carry `ETag: "<revision>"`; requests without `If-Match` keep the legacy behavior so older clients and third-party callers do not break.
- **Item-level revisions**: every item carries `rev` and the Host increments it when content changes; conflict merges compare `rev` and then `updatedAt`, so the newer side wins (local wins a complete tie) instead of always clobbering the agent's edits.
- **Merge result adopted immediately**: after a successful conflict retry, when no newer local edit is pending, the panel adopts the server document right away (agent additions/restores appear without waiting for the next poll).
- **Soft delete**: deletions write a `deletedAt` tombstone (the Host keeps at most 200, trimming old ones); lists, board, reminders, daily brief, and agent search hide them by default; `quick_note_search includeDeleted:true` shows tombstones and `quick_note_update restore:true` restores one; deleting a custom type soft-deletes its records.
- **Tombstones participate in merging**: a newer tombstone wins, so an older active version cannot resurrect a deleted item; deletion state propagates to the panel, other windows, and the agent tools.
- Merge scope: items (including tombstones) by rev/timestamp; types local-first plus Host additions; settings local-first with `workspaceNotes` per path and `valueHistory` per timestamp; review log deduplicated by `itemId+at+quality`.
- **Read-only authorization**: `GET /api/quick-note/auth` returns a loopback token (random per Host start, memory only, never on disk; a non-loopback `Origin` gets 403); `admin`/`usage`/`workspace-value` require the `x-quick-note-token` header (401 otherwise). The panel fetches the token automatically and, on 401 (e.g. Host restart rotation), refreshes it and retries once.
- Tests cover: newer remote edit winning, local edits kept, agent additions kept, soft delete hidden/restored/merged, merged result shown immediately, and token refresh after 401.

## Performance and stability (after audit)

- Read-only routes (`/admin`, `/usage`, `/workspace-value`) match the exact pathname (unknown subpaths return 404) and require the loopback read token from `/auth` (the panel refreshes and retries once after a 401).
- `PUT /state` supports `If-Match` optimistic locking (a stale revision returns 409 with the current document) and `GET`/`PUT` return `ETag`; the panel merges per item by `rev`/`updatedAt` and retries, preventing lost updates between the panel and the agent.
- Deletions are soft deletes (`deletedAt` tombstones, at most 200 kept), hidden by default in agent search, the daily brief, and the panel, and restorable through the agent tool.
- The workspace value report is cached for 60 seconds and invalidated by every write (PUT state), so pricing, assessments, and snapshots appear immediately without a manual refresh (measured: repeat request ~30-50 ms vs ~500-700 ms for a recompute).
- Session projection-cache files are read concurrently in batches of 25; workspace directories are scanned in parallel (max 500 files per workspace, skipping node_modules/.git/dist).
- Usage total cost is computed from raw token sums instead of summing per-row rounded costs.
- The data file uses atomic writes (tmp + rename) behind a serialized write queue; reviews (5000), types (40), and valueHistory (12 per workspace) are all capped.
- Front end: `client.js` ~639KB (generated from a 181B template shell + `src/entry.mjs` + `src/helpers.mjs` + `src/components.mjs` + `src/optimizer.mjs` + `src/ui-assets.mjs` + `src/locale.mjs`) and `index.js` ~252KB; all 767 locale keys are used exactly once, with no unused static functions or dead CSS classes.
