# 外派高管履职维护季度化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将外派高管履职维护从半年度/年度任务改为四个相互独立的季度任务，并优化详情页返回入口布局。

**Architecture:** 新建纯函数季度领域模块，统一负责 `quater` 解析、季度配置、月报筛选、状态键和详情 URL，列表与详情共同消费，避免周期文案、月份和地址分散定义。详情页继续沿用现有本地 React 状态，但所有人员状态改用“季度 + 人员”组合键；模拟分析数据按季度组织。

**Tech Stack:** React 19、React Router 7、Ant Design 5、Less、Node.js 内置测试运行器、Vite 8

## Global Constraints

- 查询参数名固定为 `quater`，合法值仅为字符串 `1`、`2`、`3`、`4`。
- `period` 不再参与详情页逻辑，也不再由列表入口传递。
- 缺失或非法 `quater` 统一回退到第一季度。
- 第一、第二季度各显示 3 份月报；第三、第四季度显示空状态。
- 没有月报时禁用 AI 分析，但允许手工填写分析后确认。
- 不修改工作区中与本需求无关的现有改动。

---

## 文件结构

- 新建 `src/pages/executiveMaintenance/quarter.js`：季度配置、参数解析、月报筛选、状态键和 URL 构造。
- 新建 `src/pages/executiveMaintenance/quarter.test.js`：季度领域行为测试。
- 修改 `src/pages/executiveMaintenance/data.js`：按季度提供模拟 AI 分析。
- 修改 `src/pages/executiveMaintenance/list/index.jsx`：四条季度任务、季度筛选和 `quater` 导航。
- 修改 `src/pages/executiveMaintenance/index.jsx`：按季度筛选月报并隔离分析、确认和展开状态。
- 修改 `src/pages/executiveMaintenance/index.module.less`：返回链接与页头两栏布局。

### Task 1: 建立季度领域模块

**Files:**
- Create: `src/pages/executiveMaintenance/quarter.js`
- Create: `src/pages/executiveMaintenance/quarter.test.js`

**Interfaces:**
- Produces: `QUARTER_CONFIGS`、`normalizeQuarter(value)`、`getQuarterConfig(value)`、`filterReportsByQuarter(reports, quarter, executiveId)`、`getQuarterStateKey(quarter, executiveId)`、`buildExecutiveMaintenancePath(record)`。
- Consumes: 月报对象的 `month`、`executiveId` 字段，以及列表记录的 `shortForm`、`year`、`quarter` 字段。

- [ ] **Step 1: 写季度映射、筛选、状态键和 URL 的失败测试**

```js
// src/pages/executiveMaintenance/quarter.test.js
import test from "node:test";
import assert from "node:assert/strict";
import {
  buildExecutiveMaintenancePath,
  filterReportsByQuarter,
  getQuarterConfig,
  getQuarterStateKey,
  normalizeQuarter,
} from "./quarter.js";

test("normalizes quater values and falls back to quarter one", () => {
  assert.equal(normalizeQuarter("1"), "1");
  assert.equal(normalizeQuarter("4"), "4");
  assert.equal(normalizeQuarter(undefined), "1");
  assert.equal(normalizeQuarter("5"), "1");
});

test("maps every quarter to its label and months", () => {
  assert.deepEqual(getQuarterConfig("1"), {
    value: "1",
    label: "第一季度",
    months: [1, 2, 3],
  });
  assert.deepEqual(getQuarterConfig("4"), {
    value: "4",
    label: "第四季度",
    months: [10, 11, 12],
  });
});

test("filters reports by executive and quarter", () => {
  const reports = [
    { id: "a-3", executiveId: "a", month: 3 },
    { id: "a-4", executiveId: "a", month: 4 },
    { id: "b-3", executiveId: "b", month: 3 },
  ];
  assert.deepEqual(
    filterReportsByQuarter(reports, "1", "a").map((item) => item.id),
    ["a-3"],
  );
});

test("creates isolated quarter and executive state keys", () => {
  assert.equal(getQuarterStateKey("2", "gaoying"), "2:gaoying");
});

test("builds a detail URL with quater as the only period parameter", () => {
  assert.equal(
    buildExecutiveMaintenancePath({
      shortForm: "长春一东",
      year: "2026",
      quarter: "3",
    }),
    "/executiveMaintenance?company=%E9%95%BF%E6%98%A5%E4%B8%80%E4%B8%9C&year=2026&quater=3",
  );
});
```

- [ ] **Step 2: 运行测试并确认因模块不存在而失败**

Run: `node --test src/pages/executiveMaintenance/quarter.test.js`

Expected: FAIL，错误包含 `Cannot find module './quarter.js'`。

- [ ] **Step 3: 实现最小季度领域模块**

```js
// src/pages/executiveMaintenance/quarter.js
export const QUARTER_CONFIGS = [
  { value: "1", label: "第一季度", months: [1, 2, 3] },
  { value: "2", label: "第二季度", months: [4, 5, 6] },
  { value: "3", label: "第三季度", months: [7, 8, 9] },
  { value: "4", label: "第四季度", months: [10, 11, 12] },
];

export function normalizeQuarter(value) {
  return QUARTER_CONFIGS.some((item) => item.value === value) ? value : "1";
}

export function getQuarterConfig(value) {
  const normalized = normalizeQuarter(value);
  return QUARTER_CONFIGS.find((item) => item.value === normalized);
}

export function filterReportsByQuarter(reports, quarter, executiveId) {
  const { months } = getQuarterConfig(quarter);
  return reports.filter(
    (report) =>
      report.executiveId === executiveId && months.includes(report.month),
  );
}

export function getQuarterStateKey(quarter, executiveId) {
  return `${normalizeQuarter(quarter)}:${executiveId}`;
}

export function buildExecutiveMaintenancePath(record) {
  const params = new URLSearchParams({
    company: record.shortForm,
    year: record.year,
    quater: normalizeQuarter(record.quarter),
  });
  return `/executiveMaintenance?${params.toString()}`;
}
```

- [ ] **Step 4: 运行季度模块测试并确认通过**

Run: `node --test src/pages/executiveMaintenance/quarter.test.js`

Expected: 5 tests PASS，0 tests FAIL。

- [ ] **Step 5: 提交季度领域模块**

```bash
git add src/pages/executiveMaintenance/quarter.js src/pages/executiveMaintenance/quarter.test.js
git commit -m "feat: add executive maintenance quarter model"
```

### Task 2: 将维护列表改为四个季度任务

**Files:**
- Modify: `src/pages/executiveMaintenance/list/index.jsx`
- Test: `src/pages/executiveMaintenance/quarter.test.js`

**Interfaces:**
- Consumes: `QUARTER_CONFIGS`、`buildQuarterlyMaintenanceRows(baseRecord)` 和 `buildExecutiveMaintenancePath(record)`。
- Produces: 四条包含 `quarter` 与季度 `period` 标签的维护任务。

- [ ] **Step 1: 添加四个入口 URL 的失败测试**

```js
import {
  buildExecutiveMaintenancePath,
  buildQuarterlyMaintenanceRows,
  filterReportsByQuarter,
  getQuarterConfig,
  getQuarterStateKey,
  normalizeQuarter,
} from "./quarter.js";

test("builds four quarterly tasks and one independent URL for each", () => {
  const rows = buildQuarterlyMaintenanceRows({
    idPrefix: "cc-001-2026",
    companyName: "长春一东离合器股份有限公司",
    shortForm: "长春一东",
    stockCode: "600148.SH",
    year: "2026",
  });
  assert.deepEqual(
    rows.map(({ period, reportProgress, status }) => ({
      period,
      reportProgress,
      status,
    })),
    [
      { period: "第一季度", reportProgress: "3 / 3", status: "已完成" },
      { period: "第二季度", reportProgress: "3 / 3", status: "已完成" },
      { period: "第三季度", reportProgress: "0 / 3", status: "待维护" },
      { period: "第四季度", reportProgress: "0 / 3", status: "待维护" },
    ],
  );
  const urls = rows.map(buildExecutiveMaintenancePath);
  assert.deepEqual(
    urls.map((url) => new URL(url, "http://localhost").searchParams.get("quater")),
    ["1", "2", "3", "4"],
  );
  assert.equal(urls.some((url) => url.includes("period=")), false);
});
```

- [ ] **Step 2: 运行测试并确认季度任务构造函数尚不存在**

Run: `node --test src/pages/executiveMaintenance/quarter.test.js`

Expected: FAIL，错误表明 `buildQuarterlyMaintenanceRows` 尚未导出。

- [ ] **Step 3: 实现季度任务构造函数并确认测试通过**

```js
// src/pages/executiveMaintenance/quarter.js
export function buildQuarterlyMaintenanceRows(baseRecord) {
  return QUARTER_CONFIGS.map((quarter) => {
    const hasReports = quarter.value === "1" || quarter.value === "2";
    return {
      ...baseRecord,
      id: `${baseRecord.idPrefix}-q${quarter.value}`,
      quarter: quarter.value,
      period: quarter.label,
      executiveCount: 1,
      executiveProgress: hasReports ? "1 / 1" : "0 / 1",
      reportProgress: hasReports ? "3 / 3" : "0 / 3",
      updatedAt: hasReports ? "2026-07-08" : "-",
      status: hasReports ? "已完成" : "待维护",
    };
  });
}
```

Run: `node --test src/pages/executiveMaintenance/quarter.test.js`

Expected: 所有测试 PASS。

- [ ] **Step 4: 替换维护任务数据和季度筛选**

```jsx
import {
  buildExecutiveMaintenancePath,
  buildQuarterlyMaintenanceRows,
  QUARTER_CONFIGS,
} from "../quarter";

const maintenanceRows = buildQuarterlyMaintenanceRows({
  idPrefix: "cc-001-2026",
  companyName: "长春一东离合器股份有限公司",
  shortForm: "长春一东",
  stockCode: "600148.SH",
  year: "2026",
});
```

将操作按钮改为：

```jsx
onClick={() => navigate(buildExecutiveMaintenancePath(record))}
```

将维护周期筛选选项改为：

```jsx
options={QUARTER_CONFIGS.map(({ value, label }) => ({
  value: label,
  label,
}))}
```

- [ ] **Step 5: 运行季度测试、代码检查和构建**

Run: `node --test src/pages/executiveMaintenance/quarter.test.js && npm run lint && npm run vite.build`

Expected: 所有命令退出码为 0；构建产物生成成功。

- [ ] **Step 6: 提交列表季度化**

```bash
git add src/pages/executiveMaintenance/list/index.jsx src/pages/executiveMaintenance/quarter.js src/pages/executiveMaintenance/quarter.test.js
git commit -m "feat: split executive maintenance into quarterly tasks"
```

### Task 3: 让详情页按季度独立工作

**Files:**
- Modify: `src/pages/executiveMaintenance/data.js`
- Modify: `src/pages/executiveMaintenance/index.jsx`
- Test: `src/pages/executiveMaintenance/quarter.test.js`

**Interfaces:**
- Consumes: `getQuarterDetailContext(rawQuarter, reports, executiveId)`。
- Produces: `generatedAnalysisByQuarterAndExecutive`，结构为 `{ [quarter]: { [executiveId]: string } }`。

- [ ] **Step 1: 添加详情页季度上下文的失败测试**

```js
import {
  buildExecutiveMaintenancePath,
  buildQuarterlyMaintenanceRows,
  filterReportsByQuarter,
  getQuarterConfig,
  getQuarterDetailContext,
  getQuarterStateKey,
  normalizeQuarter,
} from "./quarter.js";

test("creates a normalized and isolated detail context", () => {
  const context = getQuarterDetailContext(
    "invalid",
    [
      { id: "jan", executiveId: "gaoying", month: 1 },
      { id: "apr", executiveId: "gaoying", month: 4 },
    ],
    "gaoying",
  );
  assert.equal(context.quarter, "1");
  assert.equal(context.label, "第一季度");
  assert.equal(context.stateKey, "1:gaoying");
  assert.deepEqual(context.reports.map((report) => report.id), ["jan"]);
});
```

- [ ] **Step 2: 运行测试并确认详情季度上下文尚不存在**

Run: `node --test src/pages/executiveMaintenance/quarter.test.js`

Expected: FAIL，错误表明 `getQuarterDetailContext` 尚未导出。

- [ ] **Step 3: 实现详情季度上下文并确认测试通过**

```js
// src/pages/executiveMaintenance/quarter.js
export function getQuarterDetailContext(rawQuarter, reports, executiveId) {
  const quarter = normalizeQuarter(rawQuarter);
  const config = getQuarterConfig(quarter);
  return {
    quarter,
    label: config.label,
    months: config.months,
    stateKey: getQuarterStateKey(quarter, executiveId),
    reports: filterReportsByQuarter(reports, quarter, executiveId),
  };
}
```

Run: `node --test src/pages/executiveMaintenance/quarter.test.js`

Expected: 所有测试 PASS。

- [ ] **Step 4: 添加季度分析数据的失败测试**

```js
import { generatedAnalysisByQuarterAndExecutive } from "./data.js";

test("provides independent generated analysis only for quarters with reports", () => {
  assert.match(generatedAnalysisByQuarterAndExecutive["1"].gaoying, /第一季度/);
  assert.match(generatedAnalysisByQuarterAndExecutive["2"].gaoying, /第二季度/);
  assert.equal(generatedAnalysisByQuarterAndExecutive["3"], undefined);
  assert.equal(generatedAnalysisByQuarterAndExecutive["4"], undefined);
});
```

Run: `node --test src/pages/executiveMaintenance/quarter.test.js`

Expected: FAIL，错误表明 `generatedAnalysisByQuarterAndExecutive` 尚未导出。

- [ ] **Step 5: 将模拟分析拆分为第一、第二季度**

```js
export const generatedAnalysisByQuarterAndExecutive = {
  1: {
    gaoying:
      "2026年第一季度，高英围绕预算管理、成本控制和资金风险防控履职，推动归母净利润达到470万元，实现降本438.69万元；同步推进财务共享、穿透式监管和合同管理系统建设，并配合完成股份减持及信息披露。总体履职成效良好，建议持续跟踪海外经营及“两金”占用风险。",
  },
  2: {
    gaoying:
      "2026年第二季度，高英持续推进预算控制、降本增效和风险防控，上半年主营业务收入、利润总额分别完成年度预算的56.14%和67.25%，累计实现降本1780万元；推进逾期应收和积压存货治理，并推动数智化及具身智能产业协同。建议继续关注海外回款、汇率波动和重点降本项目成效。",
  },
};
```

- [ ] **Step 6: 接入季度参数、月报筛选和组合状态键**

在详情组件中建立季度上下文：

```jsx
const rawQuarter = searchParams.get("quater");
const quarterContext = useMemo(
  () =>
    getQuarterDetailContext(
      rawQuarter,
      monthlyReports,
      selectedExecutive?.id,
    ),
  [rawQuarter, selectedExecutive?.id],
);
const { quarter, label: quarterLabel, reports: selectedReports } =
  quarterContext;
const maintenanceYear =
  searchParams.get("year") || selectedExecutive?.year || "2026";
const selectedStateKey = quarterContext.stateKey;
```

将 `analysisByExecutive`、`confirmedByExecutive`、`activeReportByExecutive` 分别重命名为 `analysisByState`、`confirmedByState`、`activeReportByState`，所有读取和写入键改为 `selectedStateKey`，并将季度显示统一替换为 `quarterLabel`。初始展开月报按当前季度处理：

```jsx
const [activeReportByState, setActiveReportByState] = useState({});
const activeReportId =
  activeReportByState[selectedStateKey] ?? selectedReports[0]?.id ?? "";
```

当前季度人员确认进度只统计该季度：

```jsx
const confirmedCount = executiveProfiles.filter((person) =>
  Boolean(confirmedByState[getQuarterStateKey(quarter, person.id)]),
).length;
```

人员卡片的确认状态和月报进度也按该人员的季度组合键计算：

```jsx
const personStateKey = getQuarterStateKey(quarter, person.id);
const personReportCount = filterReportsByQuarter(
  monthlyReports,
  quarter,
  person.id,
).length;
const personConfirmed = Boolean(confirmedByState[personStateKey]);

<small>月报 {personReportCount} / 3</small>
```

当前人员工作区显示：

```jsx
<small>月报 {selectedReports.length} / 3</small>
```

分析按钮接入季度内容并在空季度禁用：

```jsx
const generatedAnalysis =
  generatedAnalysisByQuarterAndExecutive[quarter]?.[selectedExecutive.id] || "";

<Button
  type="primary"
  icon={<RobotOutlined />}
  loading={analyzingStateKey === selectedStateKey}
  disabled={selectedReports.length === 0}
  onClick={handleAnalyze}
>
  {analysis ? "重新分析" : "AI智能分析"}
</Button>
```

空状态与分析说明使用当前季度：

```jsx
<Empty
  description={`${selectedExecutive?.name}暂无${quarterLabel}月度履职记录`}
/>
```

```jsx
<p>
  {selectedReports.length
    ? `仅分析当前人员${quarterLabel}的月度工作完成情况与助力集团发展情况。`
    : `当前季度暂无月报，暂不能生成分析；可根据实际情况手工填写。`}
</p>
```

- [ ] **Step 7: 运行测试、代码检查和构建**

Run: `node --test src/pages/executiveMaintenance/quarter.test.js && npm run lint && npm run vite.build`

Expected: 全部退出码为 0；第一、第二季度代码路径有对应分析，第三、第四季度不生成模拟分析。

- [ ] **Step 8: 提交详情季度隔离**

```bash
git add src/pages/executiveMaintenance/data.js src/pages/executiveMaintenance/index.jsx src/pages/executiveMaintenance/quarter.js src/pages/executiveMaintenance/quarter.test.js
git commit -m "feat: isolate executive analysis by quarter"
```

### Task 4: 优化返回入口并完成浏览器验收

**Files:**
- Modify: `src/pages/executiveMaintenance/index.jsx`
- Modify: `src/pages/executiveMaintenance/index.module.less`

**Interfaces:**
- Consumes: 当前 `navigate("/executiveMaintenanceList")` 返回行为。
- Produces: 标题上方轻链接布局，桌面端两栏页头与移动端纵向页头。

- [ ] **Step 1: 修改页头结构为方案 B**

```jsx
<header className={styles.pageHeader}>
  <div className={styles.titleBlock}>
    <button
      className={styles.backButton}
      type="button"
      onClick={() => navigate("/executiveMaintenanceList")}
    >
      <span>←</span> 返回维护列表
    </button>
    <h1>外派高管履职分析</h1>
    <p>按人员复核季度履职记录，分别形成履职分析并确认归档</p>
  </div>
  <div className={styles.taskStamp}>
    <SafetyCertificateOutlined />
    <span>维护周期</span>
    <strong>{maintenanceYear}年 · {quarterLabel}</strong>
  </div>
</header>
```

- [ ] **Step 2: 修改页头和返回链接样式**

```less
.pageHeader {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  min-height: 112px;
}

.backButton {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin: 0 0 8px;
  padding: 0;
  color: @blue;
  background: transparent;
  border: 0;
  font-size: 12px;
  font-weight: 600;
}

.backButton:hover {
  color: @navy;
  text-decoration: underline;
}

@media (max-width: 1000px) {
  .pageHeader {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .taskStamp {
    display: grid;
    justify-self: stretch;
  }
}
```

- [ ] **Step 3: 运行完整验证**

Run: `node --test src/pages/executiveMaintenance/quarter.test.js && npm run lint && npm run check-types && npm run vite.build`

Expected: 测试全部 PASS，lint/type check/build 均退出码为 0。

- [ ] **Step 4: 启动本地页面并逐个验收季度 URL**

Run: `npm run dev`

检查：

```text
http://localhost:5173/executiveMaintenance?company=长春一东&year=2026&quater=1
http://localhost:5173/executiveMaintenance?company=长春一东&year=2026&quater=2
http://localhost:5173/executiveMaintenance?company=长春一东&year=2026&quater=3
http://localhost:5173/executiveMaintenance?company=长春一东&year=2026&quater=4
```

Expected:

- Q1 显示 1～3 月，Q2 显示 4～6 月。
- Q3、Q4 显示季度空状态，AI 按钮禁用，文本框可手工填写。
- 四个季度的分析与确认状态互不影响。
- 返回链接在标题上方，与标题左对齐；窄屏下不遮挡标题或周期卡片。

- [ ] **Step 5: 提交布局与最终验证结果**

```bash
git add src/pages/executiveMaintenance/index.jsx src/pages/executiveMaintenance/index.module.less
git commit -m "style: refine executive maintenance back navigation"
```
