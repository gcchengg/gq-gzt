# Expert Evaluation Dashboard Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the standalone expert evaluation navigation and page, then add a complete evaluation-and-retrospective analytics section with a recent-records Drawer to the expert pool dashboard.

**Architecture:** Normalize submitted task evaluations and fallback demo evaluations in one pure-data module, then derive dashboard summaries, monthly trends, distributions, and Drawer filtering from that canonical record list. Keep presentation split between `EvaluationAnalytics` and `EvaluationRecordsDrawer`; `Dashboard` owns the shared time range and Drawer open state. Render the charts with SVG and CSS so the feature does not add a chart dependency.

**Tech Stack:** React 19, React Router 7, Ant Design 5, dayjs, CSS Modules with Less, SVG, Node.js `node:test`, Biome, Vite.

## Global Constraints

- Remove the “评价与回溯” side-menu item and stop registering `/expertTalentEvaluation` as a business route.
- Keep fulfillment evaluation and viewpoint retrospective as separate calculations and labels.
- Use one normalized record list for summary cards, charts, distribution, and Drawer rows.
- Default the analytics range to the latest 12 months.
- Open recent evaluation records in a right-side Drawer with desktop width `72vw` and near-full width on narrow screens.
- Do not add a charting dependency; use SVG and CSS within the existing stack.
- Preserve unrelated existing user changes, including the current modification to `prd.txt` and unrelated untracked requirement files.

---

## File Structure

- Create `src/pages/expertTalent/evaluationAnalytics.js`: normalize records, calculate scores and summaries, build monthly series, and filter Drawer rows.
- Create `src/pages/expertTalent/evaluationAnalytics.test.js`: unit tests for precedence, scoring, empty denominators, time filtering, trends, and combined Drawer filters.
- Create `src/pages/expertTalent/components/EvaluationAnalytics/index.jsx`: summary cards, time-range selector, SVG trend chart, CSS distribution chart, and record-entry button.
- Create `src/pages/expertTalent/components/EvaluationAnalytics/index.module.less`: analytics-section layout, chart styling, empty state, and responsive rules.
- Create `src/pages/expertTalent/components/EvaluationRecordsDrawer/index.jsx`: filters, paginated table, semantic tags, and expandable evaluation comments.
- Create `src/pages/expertTalent/components/EvaluationRecordsDrawer/index.module.less`: Drawer filter and responsive table styles.
- Create `src/pages/expertTalent/index.test.js`: source-level navigation, integration, copy, and Drawer-contract checks suitable for the repository's current test setup.
- Modify `src/pages/expertTalent/index.jsx`: integrate analytics and Drawer into `Dashboard`, replace the duplicate top score card, and remove the old `Evaluation` page component and route branch.
- Modify `src/components/AppShell.jsx`: remove the side-menu item and route-area recognition for the old evaluation path.
- Modify `src/routes.jsx`: remove the old route registration.
- Modify `src/pages/expertTalent/components/PageHelp/index.jsx`: expand the dashboard help copy to cover evaluation analysis and remove the obsolete standalone-page help entry.

---

### Task 1: Canonical Evaluation Data and Analytics

**Files:**
- Create: `src/pages/expertTalent/evaluationAnalytics.js`
- Create: `src/pages/expertTalent/evaluationAnalytics.test.js`

**Interfaces:**
- Consumes: task records shaped as `{ project, expert, evaluation }` and fallback rows from `data.js`.
- Produces: `normalizeEvaluationRecords(taskRecords, fallbackRecords)`, `filterByRange(records, range, now)`, `compareAverageScore(records, range, now)`, `summarizeEvaluations(records, now)`, `buildMonthlyTrend(records, range, now)`, `filterEvaluationRecords(records, filters)`, and `scoreEvaluation(evaluation)`.

- [ ] **Step 1: Write failing normalization and summary tests**

Create `src/pages/expertTalent/evaluationAnalytics.test.js` with these initial tests:

```js
import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeEvaluationRecords,
  scoreEvaluation,
  summarizeEvaluations,
} from "./evaluationAnalytics.js";

test("submitted task evaluations replace fallback rows for the same project", () => {
  const tasks = [{
    project: "项目A",
    expert: "张专家",
    evaluation: {
      delivery: 46,
      response: 28,
      attitude: 18,
      total: 92,
      result: "优秀",
      retrospective: "待回溯",
      submittedAt: "2026-09-01 10:00:00",
      comment: "已提交评价",
    },
  }];
  const fallback = [{
    project: "项目A",
    expert: "旧专家",
    delivery: 70,
    response: 70,
    attitude: 70,
    result: "良好",
    retrospective: "偏离",
    date: "2026-08-01",
  }];

  const records = normalizeEvaluationRecords(tasks, fallback);

  assert.equal(records.length, 1);
  assert.equal(records[0].expert, "张专家");
  assert.equal(records[0].total, 92);
  assert.equal(records[0].comment, "已提交评价");
});

test("scoreEvaluation supports capped point inputs and 100-scale dimension ratings", () => {
  assert.equal(scoreEvaluation({ delivery: 46, response: 28, attitude: 18 }), 92);
  assert.equal(scoreEvaluation({ delivery: 96, response: 92, attitude: 98 }), 95.4);
});

test("summary keeps fulfillment and retrospective denominators separate", () => {
  const summary = summarizeEvaluations([
    { total: 95, result: "优秀", retrospective: "命中", date: "2026-09-01" },
    { total: 75, result: "良好", retrospective: "部分命中", date: "2026-09-02" },
    { total: 55, result: "一般", retrospective: "待回溯", date: "2026-09-03", retrospectiveDue: "2026-09-18" },
  ], new Date("2026-09-14T00:00:00"));

  assert.deepEqual(summary, {
    averageScore: 75,
    excellentCount: 1,
    excellentRate: 33.3,
    pendingRetrospectiveCount: 1,
    dueSoonCount: 1,
    retrospectiveCompletedCount: 2,
    hitCount: 1,
    hitRate: 50,
  });
});

test("summary returns null percentages when no denominator exists", () => {
  const summary = summarizeEvaluations([], new Date("2026-09-14T00:00:00"));
  assert.equal(summary.averageScore, null);
  assert.equal(summary.excellentRate, null);
  assert.equal(summary.hitRate, null);
});
```

- [ ] **Step 2: Run the tests to verify the module is missing**

Run:

```bash
node --test src/pages/expertTalent/evaluationAnalytics.test.js
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `evaluationAnalytics.js`.

- [ ] **Step 3: Implement normalization, scoring, and summary calculation**

Create `src/pages/expertTalent/evaluationAnalytics.js` with the following behavior:

```js
const COMPLETED_RETROSPECTIVES = new Set(["命中", "部分命中", "偏离", "证伪"]);

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function dateOnly(value) {
  return String(value || "").slice(0, 10).replaceAll("/", "-");
}

function asDate(value) {
  const normalized = dateOnly(value);
  if (!normalized) return null;
  const parsed = new Date(`${normalized}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function scoreEvaluation(evaluation) {
  if (evaluation.total != null && Number.isFinite(Number(evaluation.total))) return Number(evaluation.total);
  const delivery = Number(evaluation.delivery || 0);
  const response = Number(evaluation.response || 0);
  const attitude = Number(evaluation.attitude || 0);
  const usesCappedPoints = delivery <= 50 && response <= 30 && attitude <= 20;
  return round(
    usesCappedPoints
      ? delivery + response + attitude
      : delivery * 0.5 + response * 0.3 + attitude * 0.2,
  );
}

function normalizeRecord(record) {
  return {
    project: record.project,
    expert: record.expert,
    delivery: Number(record.delivery || 0),
    response: Number(record.response || 0),
    attitude: Number(record.attitude || 0),
    total: scoreEvaluation(record),
    result: record.result,
    retrospective: record.retrospective || "待回溯",
    retrospectiveDue: dateOnly(record.retrospectiveDue),
    date: dateOnly(record.date || record.submittedAt),
    comment: record.comment || "",
  };
}

export function normalizeEvaluationRecords(taskRecords, fallbackRecords) {
  const submitted = taskRecords
    .filter((task) => task.evaluation)
    .map((task) => normalizeRecord({
      project: task.project,
      expert: task.expert,
      ...task.evaluation,
      date: task.evaluation.submittedAt,
    }));
  const submittedProjects = new Set(submitted.map((record) => record.project));
  return [
    ...submitted,
    ...fallbackRecords
      .filter((record) => !submittedProjects.has(record.project))
      .map(normalizeRecord),
  ].sort((a, b) => b.date.localeCompare(a.date));
}

export function summarizeEvaluations(records, now = new Date()) {
  const completed = records.filter((record) => COMPLETED_RETROSPECTIVES.has(record.retrospective));
  const pending = records.filter((record) => record.retrospective === "待回溯");
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const dueLimit = new Date(today);
  dueLimit.setDate(dueLimit.getDate() + 7);
  const dueSoonCount = pending.filter((record) => {
    const due = asDate(record.retrospectiveDue);
    return due && due >= today && due <= dueLimit;
  }).length;
  const scoreTotal = records.reduce((sum, record) => sum + record.total, 0);
  const excellentCount = records.filter((record) => record.result === "优秀").length;
  const hitCount = completed.filter((record) => record.retrospective === "命中").length;

  return {
    averageScore: records.length ? round(scoreTotal / records.length) : null,
    excellentCount,
    excellentRate: records.length ? round((excellentCount / records.length) * 100) : null,
    pendingRetrospectiveCount: pending.length,
    dueSoonCount,
    retrospectiveCompletedCount: completed.length,
    hitCount,
    hitRate: completed.length ? round((hitCount / completed.length) * 100) : null,
  };
}
```

- [ ] **Step 4: Run the initial tests and confirm they pass**

Run:

```bash
node --test src/pages/expertTalent/evaluationAnalytics.test.js
```

Expected: 4 tests PASS.

- [ ] **Step 5: Add failing range, trend, and Drawer-filter tests**

Extend the test imports with `buildMonthlyTrend`, `compareAverageScore`, `filterByRange`, and `filterEvaluationRecords`, then add:

```js
test("latest-12-month range excludes older records", () => {
  const records = [{ date: "2025-09-01" }, { date: "2025-10-01" }, { date: "2026-09-14" }];
  const filtered = filterByRange(records, "12m", new Date("2026-09-14T00:00:00"));
  assert.deepEqual(filtered.map((record) => record.date), ["2025-10-01", "2026-09-14"]);
});

test("average-score comparison uses the previous equivalent period", () => {
  const records = [
    { date: "2026-08-01", total: 90 },
    { date: "2025-08-01", total: 80 },
  ];
  assert.equal(compareAverageScore(records, "year", new Date("2026-09-14T00:00:00")), 10);
});

test("monthly trend leaves months without records empty", () => {
  const series = buildMonthlyTrend([
    { date: "2026-08-02", total: 90, retrospective: "命中" },
    { date: "2026-08-18", total: 80, retrospective: "偏离" },
  ], "3m", new Date("2026-09-14T00:00:00"));
  assert.deepEqual(series, [
    { key: "2026-07", label: "7月", averageScore: null, hitRate: null },
    { key: "2026-08", label: "8月", averageScore: 85, hitRate: 50 },
    { key: "2026-09", label: "9月", averageScore: null, hitRate: null },
  ]);
});

test("Drawer filters combine keyword, result, retrospective, and dates", () => {
  const records = [
    { project: "芯片研判", expert: "张明", result: "优秀", retrospective: "命中", date: "2026-08-01" },
    { project: "电池尽调", expert: "李华", result: "良好", retrospective: "待回溯", date: "2026-09-01" },
  ];
  const filtered = filterEvaluationRecords(records, {
    keyword: "张",
    result: "优秀",
    retrospective: "命中",
    dates: ["2026-07-01", "2026-08-31"],
  });
  assert.deepEqual(filtered.map((record) => record.project), ["芯片研判"]);
});
```

- [ ] **Step 6: Implement time filtering, monthly trends, and Drawer filters**

Add these exports to `evaluationAnalytics.js`:

```js
const RANGE_MONTHS = { "3m": 3, "6m": 6, "12m": 12 };

function rangeStart(range, now) {
  if (range === "year") return new Date(now.getFullYear(), 0, 1);
  const months = RANGE_MONTHS[range] || 12;
  return new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
}

export function filterByRange(records, range, now = new Date()) {
  const start = rangeStart(range, now);
  if (!start) return records;
  return records.filter((record) => {
    const date = asDate(record.date);
    return date && date >= start && date <= now;
  });
}

export function compareAverageScore(records, range, now = new Date()) {
  const current = filterByRange(records, range, now);
  const currentStart = rangeStart(range, now);
  let previousStart;
  let previousEnd;
  if (range === "year") {
    previousStart = new Date(now.getFullYear() - 1, 0, 1);
    previousEnd = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  } else {
    const months = RANGE_MONTHS[range] || 12;
    previousStart = new Date(now.getFullYear(), now.getMonth() - months * 2 + 1, 1);
    previousEnd = new Date(currentStart);
    previousEnd.setDate(previousEnd.getDate() - 1);
  }
  const previous = records.filter((record) => {
    const date = asDate(record.date);
    return date && date >= previousStart && date <= previousEnd;
  });
  if (!current.length || !previous.length) return null;
  return round(summarizeEvaluations(current).averageScore - summarizeEvaluations(previous).averageScore);
}

export function buildMonthlyTrend(records, range, now = new Date()) {
  const months = range === "3m" ? 3 : range === "6m" ? 6 : range === "year" ? now.getMonth() + 1 : 12;
  return Array.from({ length: months }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - months + index + 1, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const monthRecords = records.filter((record) => record.date.startsWith(key));
    const summary = summarizeEvaluations(monthRecords, now);
    return {
      key,
      label: `${date.getMonth() + 1}月`,
      averageScore: summary.averageScore,
      hitRate: summary.hitRate,
    };
  });
}

export function filterEvaluationRecords(records, filters) {
  const keyword = String(filters.keyword || "").trim().toLowerCase();
  const [start, end] = filters.dates || [];
  return records.filter((record) => {
    const matchesKeyword = !keyword || `${record.project} ${record.expert}`.toLowerCase().includes(keyword);
    const matchesResult = !filters.result || record.result === filters.result;
    const matchesRetrospective = !filters.retrospective || record.retrospective === filters.retrospective;
    const matchesStart = !start || record.date >= start;
    const matchesEnd = !end || record.date <= end;
    return matchesKeyword && matchesResult && matchesRetrospective && matchesStart && matchesEnd;
  });
}
```

- [ ] **Step 7: Run the complete analytics test file**

Run:

```bash
node --test src/pages/expertTalent/evaluationAnalytics.test.js
```

Expected: 8 tests PASS.

- [ ] **Step 8: Commit the canonical analytics layer**

```bash
git add src/pages/expertTalent/evaluationAnalytics.js src/pages/expertTalent/evaluationAnalytics.test.js
git commit -m "feat: add expert evaluation analytics model"
```

---

### Task 2: Dashboard Analytics Section

**Files:**
- Create: `src/pages/expertTalent/components/EvaluationAnalytics/index.jsx`
- Create: `src/pages/expertTalent/components/EvaluationAnalytics/index.module.less`
- Create: `src/pages/expertTalent/index.test.js`
- Modify: `src/pages/expertTalent/index.jsx:1-230`

**Interfaces:**
- Consumes: normalized records, `range`, `onRangeChange(range)`, and optional `onOpenRecords()` until the Drawer is mounted.
- Produces: `<EvaluationAnalytics records range onRangeChange onOpenRecords />`, rendered between the dashboard top stats and `dashboardGrid`.

- [ ] **Step 1: Write a failing dashboard-integration source test**

Create `src/pages/expertTalent/index.test.js`:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pageSource = readFileSync(new URL("./index.jsx", import.meta.url), "utf8");
const analyticsSource = readFileSync(
  new URL("./components/EvaluationAnalytics/index.jsx", import.meta.url),
  "utf8",
);

test("dashboard mounts the evaluation analytics section", () => {
  assert.match(pageSource, /<EvaluationAnalytics/);
  assert.match(pageSource, /range=\{evaluationRange\}/);
});

test("analytics section exposes the approved metrics and charts", () => {
  for (const label of ["平均履约评分", "评价优秀率", "待回溯项目", "观点命中率", "评价分布", "最近评价记录"])
    assert.match(analyticsSource, new RegExp(label));
  assert.match(analyticsSource, /<svg/);
  assert.match(analyticsSource, /role="img"/);
  assert.match(analyticsSource, /<title>/);
  assert.match(analyticsSource, /评价数据加载失败/);
  assert.match(analyticsSource, /重新加载/);
});
```

- [ ] **Step 2: Run the source test and verify the component is missing**

Run:

```bash
node --test src/pages/expertTalent/index.test.js
```

Expected: FAIL because `components/EvaluationAnalytics/index.jsx` does not exist.

- [ ] **Step 3: Build the analytics component**

Create `components/EvaluationAnalytics/index.jsx` with:

```jsx
import { Alert, Button, Empty, Select } from "antd";
import { buildMonthlyTrend, summarizeEvaluations } from "../../evaluationAnalytics";
import styles from "./index.module.less";

const rangeOptions = [
  { label: "近 3 个月", value: "3m" },
  { label: "近 6 个月", value: "6m" },
  { label: "近 12 个月", value: "12m" },
  { label: "本年度", value: "year" },
];

function display(value, suffix = "") {
  return value == null ? "--" : `${value}${suffix}`;
}

function lineSegments(series, key) {
  const segments = [];
  let current = [];
  series.forEach((item, index) => {
    if (item[key] == null) {
      if (current.length) segments.push(current.join(" "));
      current = [];
      return;
    }
    const point = chartPoint(series.length, index, item[key]);
    current.push(`${point.x},${point.y}`);
  });
  if (current.length) segments.push(current.join(" "));
  return segments;
}

function chartPoint(length, index, value) {
  return { x: 24 + index * (552 / Math.max(length - 1, 1)), y: 164 - value * 1.35 };
}

export default function EvaluationAnalytics({ records, range, averageDelta, onRangeChange, onOpenRecords, error = false, onRetry }) {
  const summary = summarizeEvaluations(records);
  const trend = buildMonthlyTrend(records, range);
  const excellent = summary.excellentRate || 0;
  const good = records.length
    ? Math.round((records.filter((item) => item.result === "良好").length / records.length) * 1000) / 10
    : 0;
  const normal = Math.max(0, Math.round((100 - excellent - good) * 10) / 10);

  if (error) return (
    <section className={styles.section}>
      <Alert
        type="error"
        showIcon
        message="评价数据加载失败"
        description="看板其他区域仍可正常使用。"
        action={<Button onClick={onRetry}>重新加载</Button>}
      />
    </section>
  );

  return (
    <section className={styles.section} aria-labelledby="evaluation-analytics-title">
      <header className={styles.header}>
        <div><h2 id="evaluation-analytics-title">评价与回溯</h2><p>履约质量与观点准确度分开统计</p></div>
        <div className={styles.actions}>
          <Select value={range} options={rangeOptions} onChange={onRangeChange} aria-label="评价统计时间范围" />
          {onOpenRecords ? <Button type="link" onClick={onOpenRecords}>最近评价记录 ›</Button> : null}
        </div>
      </header>
      <div className={styles.metrics}>
        <article><span>平均履约评分</span><strong>{display(summary.averageScore)}</strong><small>{averageDelta == null ? "暂无上期对比" : `较上一等长周期 ${averageDelta > 0 ? "+" : ""}${averageDelta}`}</small></article>
        <article><span>评价优秀率</span><strong>{display(summary.excellentRate, "%")}</strong><small>优秀 {summary.excellentCount} 人次</small></article>
        <article className={styles.warning}><span>待回溯项目</span><strong>{summary.pendingRetrospectiveCount}</strong><small>{summary.dueSoonCount} 项将在 7 日内到期</small></article>
        <article><span>观点命中率</span><strong>{display(summary.hitRate, "%")}</strong><small>已回溯 {summary.retrospectiveCompletedCount} 条</small></article>
      </div>
      {records.length ? (
        <div className={styles.charts}>
          <div className={styles.trend}>
            <h3>趋势</h3>
            <div className={styles.chartLegend}><span>平均履约评分</span><span>观点命中率</span></div>
            <svg viewBox="0 0 600 190" role="img" aria-label="平均履约评分与观点命中率趋势图">
              {lineSegments(trend, "averageScore").map((points) => <polyline key={`score-${points}`} className={styles.scoreLine} points={points} />)}
              {lineSegments(trend, "hitRate").map((points) => <polyline key={`hit-${points}`} className={styles.hitLine} points={points} />)}
              {trend.flatMap((item, index) => [
                item.averageScore == null ? null : { key: "score", value: item.averageScore, unit: "分", className: styles.scorePoint },
                item.hitRate == null ? null : { key: "hit", value: item.hitRate, unit: "%", className: styles.hitPoint },
              ].filter(Boolean).map((point) => {
                const position = chartPoint(trend.length, index, point.value);
                return <circle key={`${item.key}-${point.key}`} className={point.className} cx={position.x} cy={position.y} r="4"><title>{`${item.label}：${point.value}${point.unit}`}</title></circle>;
              }))}
            </svg>
            <div className={styles.months}>{trend.map((item) => <span key={item.key}>{item.label}</span>)}</div>
          </div>
          <div className={styles.distribution}>
            <h3>评价分布</h3>
            <div className={styles.donut} style={{ "--excellent": excellent, "--good": excellent + good }}><b>{records.length}</b><span>条评价</span></div>
            <div className={styles.legend}><span>优秀 {excellent}%</span><span>良好 {good}%</span><span>一般 {normal}%</span></div>
          </div>
        </div>
      ) : <Empty description="所选时间范围暂无评价数据" />}
    </section>
  );
}
```

Create `components/EvaluationAnalytics/index.module.less` with named rules used above: `.section`, `.header`, `.actions`, `.metrics`, `.warning`, `.charts`, `.trend`, `.chartLegend`, `.scoreLine`, `.hitLine`, `.scorePoint`, `.hitPoint`, `.months`, `.distribution`, `.donut`, `.legend`. Use the existing dashboard colors `#234f7d`, `#43816b`, `#c7864f`, `#a9442d`, border `#dce4ea`, and card radius `9px`. Define the ring as:

```less
.donut {
  --excellent: 0;
  --good: 0;
  display: grid;
  width: 132px;
  height: 132px;
  place-content: center;
  border-radius: 50%;
  background: conic-gradient(
    #43816b 0 calc(var(--excellent) * 1%),
    #4f7fa6 calc(var(--excellent) * 1%) calc(var(--good) * 1%),
    #a9442d calc(var(--good) * 1%) 100%
  );
  position: relative;
}
.donut::after { position: absolute; inset: 18px; border-radius: 50%; background: #fff; content: ""; }
.donut b, .donut span { position: relative; z-index: 1; text-align: center; }
.scoreLine, .hitLine { fill: none; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
.scoreLine { stroke: #234f7d; }
.hitLine { stroke: #c7864f; }
.scorePoint { fill: #fff; stroke: #234f7d; stroke-width: 2; }
.hitPoint { fill: #fff; stroke: #c7864f; stroke-width: 2; }
@media (max-width: 1100px) { .charts { grid-template-columns: 1fr; } }
@media (max-width: 760px) { .metrics { grid-template-columns: 1fr 1fr; } .header { align-items: stretch; flex-direction: column; } }
```

- [ ] **Step 4: Integrate canonical records and the analytics section into Dashboard**

In `index.jsx`:

1. Import `EvaluationAnalytics` and `compareAverageScore`, `filterByRange`, `normalizeEvaluationRecords`.
2. In `Dashboard`, call `useExpertStore()`, initialize `evaluationRange` to `"12m"`, normalize task and fallback evaluation records with `useMemo`, derive the visible range, and calculate `evaluationAverageDelta` from the full canonical list and current range.

Use these declarations at the start of `Dashboard`:

```jsx
const { tasks: taskRecords } = useExpertStore();
const [evaluationRange, setEvaluationRange] = useState("12m");
const evaluationRecords = useMemo(
  () => normalizeEvaluationRecords(taskRecords, evaluations),
  [taskRecords],
);
const visibleEvaluationRecords = useMemo(
  () => filterByRange(evaluationRecords, evaluationRange),
  [evaluationRange, evaluationRecords],
);
const evaluationAverageDelta = useMemo(
  () => compareAverageScore(evaluationRecords, evaluationRange),
  [evaluationRange, evaluationRecords],
);
```
3. Replace the top “综合评分” card with:

```jsx
<StatCard
  label="任务完成率"
  value="94%"
  delta="按期完成 32 项"
  icon={CheckCircleOutlined}
  tone="red"
/>
```

4. Insert this immediately after the top `.stats` section and before `.dashboardGrid`:

```jsx
<EvaluationAnalytics
  records={visibleEvaluationRecords}
  range={evaluationRange}
  averageDelta={evaluationAverageDelta}
  onRangeChange={setEvaluationRange}
/>
```

Do not remove the old `Evaluation` function yet; Task 4 removes the page and route after the new experience is complete.

- [ ] **Step 5: Run analytics and dashboard source tests**

Run:

```bash
node --test src/pages/expertTalent/evaluationAnalytics.test.js src/pages/expertTalent/index.test.js
```

Expected: all tests PASS.

- [ ] **Step 6: Run lint and build**

Run:

```bash
pnpm lint src/pages/expertTalent/evaluationAnalytics.js src/pages/expertTalent/evaluationAnalytics.test.js src/pages/expertTalent/components/EvaluationAnalytics/index.jsx src/pages/expertTalent/index.jsx
pnpm vite.build
```

Expected: lint exits 0 and Vite build succeeds.

- [ ] **Step 7: Commit the dashboard analytics section**

```bash
git add src/pages/expertTalent/index.jsx src/pages/expertTalent/index.test.js src/pages/expertTalent/components/EvaluationAnalytics
git commit -m "feat: add evaluation analytics to expert dashboard"
```

---

### Task 3: Recent Evaluation Records Drawer

**Files:**
- Create: `src/pages/expertTalent/components/EvaluationRecordsDrawer/index.jsx`
- Create: `src/pages/expertTalent/components/EvaluationRecordsDrawer/index.module.less`
- Modify: `src/pages/expertTalent/index.jsx:150-330`
- Modify: `src/pages/expertTalent/index.test.js`

**Interfaces:**
- Consumes: `open`, `onClose()`, canonical `records`, and the active dashboard `range` label.
- Produces: `<EvaluationRecordsDrawer open onClose records />` with local filters and pagination.

- [ ] **Step 1: Add a failing source-contract test for the Drawer**

Extend `index.test.js`:

```js
const drawerSource = readFileSync(
  new URL("./components/EvaluationRecordsDrawer/index.jsx", import.meta.url),
  "utf8",
);

test("recent evaluation records use a filterable wide Drawer", () => {
  assert.match(drawerSource, /title="最近评价记录"/);
  assert.match(drawerSource, /width="72vw"/);
  for (const label of ["项目 / 专家搜索", "评价结果", "回溯状态", "评价日期", "交付性 50%", "响应效率 30%", "服务态度 20%"])
    assert.match(drawerSource, new RegExp(label));
  assert.match(drawerSource, /expandedRowRender/);
  assert.match(pageSource, /<EvaluationRecordsDrawer/);
  assert.match(pageSource, /onOpenRecords=\{\(\) => setEvaluationDrawerOpen\(true\)\}/);
});
```

- [ ] **Step 2: Run the source test to verify the Drawer is missing**

Run:

```bash
node --test src/pages/expertTalent/index.test.js
```

Expected: FAIL because `EvaluationRecordsDrawer/index.jsx` does not exist.

- [ ] **Step 3: Create the filterable Drawer component**

Create `components/EvaluationRecordsDrawer/index.jsx` using Ant Design `Drawer`, `Input`, `Select`, `DatePicker.RangePicker`, `Table`, `Tag`, and `Button`. Keep filters local and reset them whenever `open` changes from false to true:

```jsx
import { Button, DatePicker, Drawer, Input, Select, Table, Tag } from "antd";
import { useEffect, useMemo, useState } from "react";
import { filterEvaluationRecords } from "../../evaluationAnalytics";
import styles from "./index.module.less";

const resultColors = { 优秀: "success", 良好: "blue", 一般: "error" };
const retrospectiveColors = { 命中: "success", 部分命中: "processing", 偏离: "error", 证伪: "error", 待回溯: "warning" };

export default function EvaluationRecordsDrawer({ open, onClose, records }) {
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState();
  const [retrospective, setRetrospective] = useState();
  const [dates, setDates] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!open) return;
    setKeyword("");
    setResult(undefined);
    setRetrospective(undefined);
    setDates([]);
    setPage(1);
  }, [open]);

  const filtered = useMemo(() => filterEvaluationRecords(records, {
    keyword,
    result,
    retrospective,
    dates: dates.map((date) => date.format("YYYY-MM-DD")),
  }), [dates, keyword, records, result, retrospective]);

  const columns = [
    { title: "项目", dataIndex: "project", ellipsis: { showTitle: true }, render: (value) => <b>{value}</b> },
    { title: "专家", dataIndex: "expert" },
    { title: "交付性 50%", dataIndex: "delivery" },
    { title: "响应效率 30%", dataIndex: "response" },
    { title: "服务态度 20%", dataIndex: "attitude" },
    { title: "评价结果", dataIndex: "result", render: (value) => <Tag color={resultColors[value]}>{value}</Tag> },
    { title: "观点回溯", dataIndex: "retrospective", render: (value) => <Tag color={retrospectiveColors[value]}>{value}</Tag> },
    { title: "评价日期", dataIndex: "date" },
  ];

  function clearFilters() {
    setKeyword("");
    setResult(undefined);
    setRetrospective(undefined);
    setDates([]);
    setPage(1);
  }

  return (
    <Drawer title="最近评价记录" open={open} onClose={onClose} width="72vw" className={styles.drawer}>
      <div className={styles.summary}>共 {filtered.length} 条评价记录</div>
      <div className={styles.filters}>
        <Input.Search value={keyword} onChange={(event) => { setKeyword(event.target.value); setPage(1); }} placeholder="项目 / 专家搜索" allowClear />
        <Select value={result} onChange={(value) => { setResult(value); setPage(1); }} placeholder="评价结果" allowClear options={["优秀", "良好", "一般"].map((value) => ({ value }))} />
        <Select value={retrospective} onChange={(value) => { setRetrospective(value); setPage(1); }} placeholder="回溯状态" allowClear options={["待回溯", "命中", "部分命中", "偏离", "证伪"].map((value) => ({ value }))} />
        <DatePicker.RangePicker value={dates} onChange={(value) => { setDates(value || []); setPage(1); }} placeholder={["评价日期", "评价日期"]} />
        <Button onClick={clearFilters}>清除筛选</Button>
      </div>
      <Table
        rowKey={(record) => `${record.project}-${record.expert}-${record.date}`}
        columns={columns}
        dataSource={filtered}
        scroll={{ x: 980 }}
        locale={{ emptyText: "暂无符合条件的评价记录" }}
        pagination={{ current: page, pageSize: 8, showSizeChanger: false, showTotal: (total) => `共 ${total} 条`, onChange: setPage }}
        expandable={{ expandedRowRender: (record) => <p className={styles.comment}>评价说明：{record.comment || "暂无评价说明"}</p> }}
      />
    </Drawer>
  );
}
```

Create `index.module.less` with `.drawer`, `.summary`, `.filters`, and `.comment`. Make `.filters` a grid with `minmax(220px, 1fr) 150px 150px 240px auto`, and at `max-width: 900px` switch to two columns. Add:

```less
@media (max-width: 760px) {
  .drawer :global(.ant-drawer-content-wrapper) { width: calc(100vw - 16px) !important; }
  .filters { grid-template-columns: 1fr; }
}
```

- [ ] **Step 4: Mount the Drawer from Dashboard**

Import `EvaluationRecordsDrawer`. In `Dashboard`, add `const [evaluationDrawerOpen, setEvaluationDrawerOpen] = useState(false);` and add `onOpenRecords={() => setEvaluationDrawerOpen(true)}` to `EvaluationAnalytics`.

At the end of the `Shell` children in `Dashboard`, mount:

```jsx
<EvaluationRecordsDrawer
  open={evaluationDrawerOpen}
  onClose={() => setEvaluationDrawerOpen(false)}
  records={visibleEvaluationRecords}
/>
```

The records are already limited by the dashboard time range. Drawer filters refine this list without mutating `evaluationRange`.

- [ ] **Step 5: Run unit and source-contract tests**

Run:

```bash
node --test src/pages/expertTalent/evaluationAnalytics.test.js src/pages/expertTalent/index.test.js
```

Expected: all tests PASS.

- [ ] **Step 6: Run lint and build**

Run:

```bash
pnpm lint src/pages/expertTalent/components/EvaluationRecordsDrawer/index.jsx src/pages/expertTalent/components/EvaluationAnalytics/index.jsx src/pages/expertTalent/index.jsx
pnpm vite.build
```

Expected: lint exits 0 and Vite build succeeds.

- [ ] **Step 7: Commit the records Drawer**

```bash
git add src/pages/expertTalent/index.jsx src/pages/expertTalent/index.test.js src/pages/expertTalent/components/EvaluationRecordsDrawer
git commit -m "feat: add recent expert evaluation records drawer"
```

---

### Task 4: Remove the Standalone Evaluation Entry and Complete Verification

**Files:**
- Modify: `src/components/AppShell.jsx:100-165`
- Modify: `src/routes.jsx:35-50`
- Modify: `src/pages/expertTalent/index.jsx:1048-1205,1740-1760`
- Modify: `src/pages/expertTalent/components/PageHelp/index.jsx:3-38`
- Modify: `src/pages/expertTalent/index.test.js`

**Interfaces:**
- Consumes: completed dashboard analytics and Drawer from Tasks 2–3.
- Produces: five-item expert side navigation with no standalone evaluation route or page code.

- [ ] **Step 1: Add failing navigation-removal tests**

Extend `index.test.js` with:

```js
const shellSource = readFileSync(new URL("../../components/AppShell.jsx", import.meta.url), "utf8");
const routeSource = readFileSync(new URL("../../routes.jsx", import.meta.url), "utf8");
const helpSource = readFileSync(new URL("./components/PageHelp/index.jsx", import.meta.url), "utf8");

test("standalone evaluation menu and route are removed", () => {
  assert.doesNotMatch(shellSource, /key:\s*"\/expertTalentEvaluation"/);
  assert.doesNotMatch(shellSource, /"\/experttalentevaluation"/);
  assert.doesNotMatch(routeSource, /"expertTalentEvaluation"/);
  assert.doesNotMatch(pageSource, /pathname === "\/expertTalentEvaluation"/);
  assert.doesNotMatch(pageSource, /function Evaluation\(/);
});

test("dashboard help describes the integrated evaluation capability", () => {
  assert.match(helpSource, /查看专家及调用指标、评价趋势、观点回溯/);
  assert.doesNotMatch(helpSource, /^\s*评价与回溯:\s*\[/m);
});
```

- [ ] **Step 2: Run the source tests and verify old references fail the assertions**

Run:

```bash
node --test src/pages/expertTalent/index.test.js
```

Expected: FAIL because the old menu, route array entry, `Evaluation` function, route branch, and help entry still exist.

- [ ] **Step 3: Remove the old navigation and route**

In `AppShell.jsx`:

- Remove `"/experttalentevaluation"` from `isCompanyListArea`.
- Remove the object with `id: "expert-evaluation"`, title `评价与回溯`, and key `/expertTalentEvaluation` from `activeMenus`.

In `routes.jsx`, remove `"expertTalentEvaluation"` from the expert route-name array.

- [ ] **Step 4: Remove the old page component and branch**

In `src/pages/expertTalent/index.jsx`:

- Delete the complete `function Evaluation()` block.
- Delete `if (pathname === "/expertTalentEvaluation") return <Evaluation />;`.
- Remove imports used only by the deleted page after confirming they are not used by the new analytics component.

- [ ] **Step 5: Update dashboard help content**

In `PageHelp/index.jsx`, change the `专家库看板` entry to:

```js
专家库看板: [
  "汇总专家资源、待办、领域覆盖、履约评价和观点回溯，帮助用户判断资源状态与服务质量。",
  "股权运营部、专家库管理员、需求部门及授权管理人员。",
  "查看专家及调用指标、评价趋势、观点回溯，并打开最近评价记录或跳转业务待办。",
  "看板负责汇总、分析和导航；履约评价与观点回溯分别统计，不相互覆盖。",
],
```

Delete the standalone `评价与回溯` description entry.

- [ ] **Step 6: Run all feature tests**

Run:

```bash
node --test src/pages/expertTalent/evaluationAnalytics.test.js src/pages/expertTalent/index.test.js
```

Expected: all tests PASS.

- [ ] **Step 7: Scan for stale route references**

Run:

```bash
rg -ni "expertTalentEvaluation|expert-evaluation|function Evaluation" src
```

Expected: no matches.

- [ ] **Step 8: Run repository verification**

Run:

```bash
pnpm lint
pnpm check-types
pnpm vite.build
git diff --check
```

Expected: every command exits 0; the Vite build completes without unresolved imports or unused route code.

- [ ] **Step 9: Manually verify the approved interaction**

Start the app:

```bash
pnpm dev
```

Open `/expertTalentPool` and verify:

- The expert side menu contains five entries and no “评价与回溯”.
- The top fourth card is “任务完成率”, not “综合评分”.
- The evaluation section sits between top stats and the lower dashboard grid.
- Changing the time range updates all four evaluation metrics and both charts.
- The trend chart distinguishes score and hit rate and leaves missing months empty.
- Clicking “最近评价记录” opens the right-side Drawer.
- Keyword, result, retrospective, and date filters combine correctly.
- Expanding a row shows its evaluation explanation or “暂无评价说明”.
- Closing the Drawer keeps the dashboard at the same scroll position.
- At a viewport below 760px, the Drawer is nearly full width and its filters stack vertically.

- [ ] **Step 10: Commit navigation cleanup and final integration**

```bash
git add src/components/AppShell.jsx src/routes.jsx src/pages/expertTalent/index.jsx src/pages/expertTalent/index.test.js src/pages/expertTalent/components/PageHelp/index.jsx
git commit -m "refactor: merge expert evaluation into dashboard"
```
