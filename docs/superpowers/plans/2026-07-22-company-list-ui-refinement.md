# 一口清页面整体 UI 精修 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改变页面结构和信息密度的前提下，统一一口清页面左侧企业索引、顶部筛选栏和右侧报告正文的字体、字号、行高、圆角与阴影。

**Architecture:** 仅修改 `src/pages/companyList/index.module.less`。先建立页面级 Less 排版变量，再让索引、筛选控件、报告正文和结构化卡片消费同一套变量，最后以静态断言、桌面/平板/移动端视觉检查和 Vite 构建验证结果。

**Tech Stack:** React 19、CSS Modules、Less、Ant Design 5、Biome、Vite 8

## Global Constraints

- 保留当前蓝灰色、暗红强调色和暖白纸张背景。
- 保留报告标题与叙述正文的宋体体系。
- 左侧索引、筛选控件、表格、标签和结构化卡片使用微软雅黑/苹方等无衬线字体。
- 保持当前紧凑信息密度，不改变页面宽度、侧栏宽度、章节顺序和卡片信息结构。
- 不修改 JSX、业务数据、业务文案、筛选逻辑、数据来源提示、接口或路由。
- 不新增网络字体、依赖、动画、主题或第三方组件。
- 保留当前工作区的所有已有修改；不暂存或提交生产代码。
- 所有 Ant Design 覆盖必须位于 `companyList` CSS Module 作用域内。

---

### Task 1: 建立排版变量并统一左侧索引与顶部筛选栏

**Files:**
- Modify: `src/pages/companyList/index.module.less:1-30`

**Interfaces:**
- Produces: `@font-report`、`@font-ui`、`@size-meta`、`@size-small`、`@size-card`、`@size-ui`、`@size-body`、`@radius-control`、`@radius-card`、`@shadow-card`
- Consumes: 现有 `@ink`、`@blue`、`@red`、`@line` 和 CSS Module 页面作用域

- [x] **Step 1: 运行缺失变量和旧字体检查并确认失败**

```bash
node -e "const fs=require('fs');const css=fs.readFileSync('src/pages/companyList/index.module.less','utf8');const required=['@font-report:','@font-ui:','@size-meta:','font-variant-numeric: tabular-nums'];if(required.some((x)=>!css.includes(x))||css.includes('font-family: Georgia'))process.exit(1)"
```

Expected: exit code 1，因为页面尚未建立统一变量，且仍使用 Georgia。

- [x] **Step 2: 在现有颜色变量后增加页面级设计变量**

```less
@font-report: "Noto Serif SC", "STSong", "SimSun", serif;
@font-ui: "Microsoft YaHei", "PingFang SC", sans-serif;
@size-meta: 11px;
@size-small: 12px;
@size-card: 13px;
@size-ui: 14px;
@size-body: 15px;
@radius-control: 7px;
@radius-card: 8px;
@shadow-card: 0 4px 14px rgba(34, 58, 78, .05);
```

在 `.page` 中增加：

```less
font-family: @font-ui;
font-variant-numeric: tabular-nums;
```

- [x] **Step 3: 统一左侧企业索引字体层级**

按以下规则修改现有选择器：

```less
.railHeader > div:first-child { font-family: @font-report; }
.railHeader strong { font-family: @font-ui; font-size: @size-small; font-variant-numeric: tabular-nums; }
.globalReportFilter span { font-size: @size-meta; }
.companyNo { font-family: @font-ui; font-size: @size-meta; font-variant-numeric: tabular-nums; }
.companyName { font-size: @size-ui; }
.companyName small { font-size: @size-meta; }
.configButton { border-radius: @radius-control; font-size: @size-meta; }
```

不得改变 `.companyRail` 宽度、`.companyItem` 高度和网格列定义。

- [x] **Step 4: 统一顶部筛选栏与 Ant Design 控件密度**

将 `.documentFilter` 字体替换为 `@font-ui`，圆角替换为 `@radius-card`，并增加：

```less
.railHeader, .documentFilter {
  :global(.ant-input),
  :global(.ant-select-selector),
  :global(.ant-btn) {
    font-family: @font-ui;
    font-size: @size-small;
  }
}
.documentFilter > div span { font-size: @size-meta; }
.documentFilter > div strong { font-size: @size-ui; font-weight: 600; }
.documentFilter :global(.ant-select-selector), .pdfButton { min-height: 32px; border-radius: @radius-control !important; }
```

- [x] **Step 5: 运行左侧和顶部规则检查**

```bash
node -e "const fs=require('fs');const css=fs.readFileSync('src/pages/companyList/index.module.less','utf8');const required=['@font-report:','@font-ui:','@size-meta: 11px','font-variant-numeric: tabular-nums','.railHeader, .documentFilter'];if(required.some((x)=>!css.includes(x)))process.exit(1)"
```

Expected: exit code 0。

---

### Task 2: 统一报告正文与结构化卡片视觉规则

**Files:**
- Modify: `src/pages/companyList/index.module.less:31-122`

**Interfaces:**
- Consumes: Task 1 产生的全部页面级变量
- Produces: 宋体报告正文、无衬线结构化数据、统一卡片边框/圆角/阴影和最小 11px 有效字号

- [x] **Step 1: 运行旧字号与旧数字字体检查并确认失败**

```bash
node -e "const fs=require('fs');const css=fs.readFileSync('src/pages/companyList/index.module.less','utf8');if(!css.includes('font-size: 10px')&&!css.includes('font-family: Georgia'))process.exit(1)"
```

Expected: exit code 0，证明需要清理的旧规则仍存在；完成 Task 2 后此命令应 exit code 1。

- [x] **Step 2: 收敛报告标题、正文和来源提示**

应用以下值：

```less
.paper { font-family: @font-report; }
.kicker, .reportPeriod, .metaGrid span, .sourceLabel, .tableNote { font-family: @font-ui; }
.sourceLabel, .tableNote { font-size: @size-meta !important; }
.sub p { font-size: @size-body; line-height: 1.9; }
.comparisonTable table, .financeTable { font-family: @font-ui; font-size: @size-small; font-variant-numeric: tabular-nums; }
```

保留主标题 `clamp(30px, 3vw, 42px)`、章节标题 22px、子标题 17px 和分析小标题 14px。

- [x] **Step 3: 统一结构化卡片容器**

在媒体查询之前增加统一容器规则：

```less
.lifecycleCard,
.analysisPanel,
.warningPanel,
.analysisCard,
.specialResolution,
.keyTopicList,
.auditIssueCard,
.riskTrackingCard,
.rectificationCard,
.strategyGrid p,
.configSection {
  border-radius: @radius-card;
  box-shadow: @shadow-card;
}
```

其中 `.specialResolution` 和 `.lifecycleCard` 保留左侧红色强调边；`.auditIssueCard`、`.riskTrackingCard`、`.rectificationCard` 保留蓝色强调边；不改变背景渐变和风险色。

- [x] **Step 4: 统一结构化区域字体和卡片正文行高**

在媒体查询之前增加：

```less
.lifecycleCard,
.financialAnalysis,
.specialResolution,
.topicList,
.recordSectionMeta,
.auditIssueList,
.riskTrackingList,
.rectificationCard,
.strategyGrid,
.configOverview,
.configGroup,
.medalFloatButton {
  font-family: @font-ui;
}

.lifecycleCard > p,
.specialResolution p {
  font-size: @size-card !important;
  line-height: 1.8 !important;
}

.analysisCard > p,
.warningList article p,
.auditIssueSummary p,
.rectificationDetail p {
  font-size: @size-small !important;
  line-height: 1.75 !important;
}

.topic p {
  font-size: @size-card;
  line-height: 1.75;
}

.strategyGrid p {
  font-size: @size-ui;
  line-height: 1.85;
}
```

- [x] **Step 5: 清理所有 10px 有效文字与 Georgia**

把以下现有 10px 规则改为 `@size-meta`：

```less
.recordIdentity small,
.auditIssueFacts span,
.auditDateLine dt,
.riskFacts dt,
.rectificationCard > header span,
.rectificationFacts dt,
.configSectionHead > span,
.configSectionHead > small,
.medalCopy small
```

把以下数字或序号字体改为 `@font-ui` 并保留各自原有字号，只有 `configSectionHead > span` 提升到 `@size-meta`：

```less
.topic > span,
.recordIdentity > span,
.strategyGrid b::before,
.configOverview strong,
.configSectionHead > span
```

完成后运行：

```bash
rg -n "font-size: 10px|font-family: Georgia" src/pages/companyList/index.module.less
```

Expected: 无输出，exit code 1。

- [x] **Step 6: 检查结构化样式没有改变业务结构**

```bash
git diff -- src/pages/companyList/index.jsx src/pages/companyList/data.js
```

Expected: 仅显示进入本任务前工作区已有的差异；本任务不新增 JSX 或数据文件变化。

---

### Task 3: 响应式、视觉和生产构建验证

**Files:**
- Verify: `src/pages/companyList/index.module.less`

**Interfaces:**
- Consumes: Task 1–2 完成的统一排版与卡片规则
- Produces: 桌面、1050px 和 760px 以下均可用的最终样式

- [x] **Step 1: 检查响应式规则是否保留现有布局**

```bash
node -e "const fs=require('fs');const css=fs.readFileSync('src/pages/companyList/index.module.less','utf8');const required=['@media (max-width: 1050px)','@media (max-width: 760px)','.companyRail { width: 220px; min-width: 220px; }','.riskFacts { grid-template-columns: repeat(2, minmax(0, 1fr)); }'];if(required.some((x)=>!css.includes(x)))process.exit(1)"
```

Expected: exit code 0。

- [x] **Step 2: 启动本地页面并检查桌面视口**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

在 `/comapnyList` 检查左侧索引、顶部筛选、报告封面和六个章节。Expected：无文字截断回归；左侧行高不增大；报告正文仍保持宋体；结构化卡片使用统一无衬线字体。

- [x] **Step 3: 检查 1050px 与 760px 以下视口**

使用浏览器视口能力分别检查约 `1024×768` 和 `750×900`。Expected：企业索引宽度切换正常；顶部筛选允许换行；卡片元信息和风险字段不溢出；最小有效字号为 11px。

- [x] **Step 4: 运行静态规则检查**

```bash
node -e "const fs=require('fs');const css=fs.readFileSync('src/pages/companyList/index.module.less','utf8');const required=['@font-report:','@font-ui:','@radius-card: 8px','@shadow-card:','font-variant-numeric: tabular-nums'];if(required.some((x)=>!css.includes(x))||css.includes('font-size: 10px')||css.includes('font-family: Georgia'))process.exit(1)"
git diff --check
```

Expected: 两条命令均 exit code 0。

- [x] **Step 5: 运行代码检查与生产构建**

```bash
./node_modules/.bin/biome check --no-errors-on-unmatched --files-ignore-unknown=true src/pages/companyList/index.jsx
npm run vite.build
```

Expected: Biome exit code 0；Vite 输出 `✓ built`。

- [x] **Step 6: 记录项目级类型检查的已知基线问题**

```bash
npm run check-types
```

Expected: 当前仓库仍报告 `TS18003`（`tsconfig.json` 未找到输入）和 `TS5108`（`esModuleInterop=false` 已移除）。不得在本任务中修改 `tsconfig.json`；最终交付需明确说明该基线问题。
