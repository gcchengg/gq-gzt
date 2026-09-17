# Board Governance Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete interactive front-end prototype for the board governance workbench without changing the `/assign` page or its implementation.

**Architecture:** Add one isolated `boardGovernance` feature directory and a wildcard route. The feature owns its shell, navigation, mock data, reusable presentation components, desktop module views, and director mobile view. Existing three-meeting behavior is represented as read-only synchronized data; no existing business API is changed.

**Tech Stack:** React 19, React Router 7, Ant Design 5, Ant Design Icons, CSS, Node test runner, Vite 8.

## Global Constraints

- New routes use `/boardGovernance/*`.
- New code lives under `src/pages/boardGovernance` except route and shellless-path registration.
- Do not edit `src/pages/assign` or its dependencies.
- All feature CSS selectors start with `board-governance`.
- Use independent mock data and no real API mutations.
- Desktop is optimized for a 1440px board-office workspace.
- Mobile supports the director's home, schedule, materials, tasks, and profile.

---

## File Map

- `src/pages/boardGovernance/index.jsx`: route-aware feature entry and module composition.
- `src/pages/boardGovernance/BoardGovernanceShell.jsx`: isolated desktop/mobile shell and navigation.
- `src/pages/boardGovernance/components.jsx`: shared page header, metrics, status, table, timeline, and detail drawer components.
- `src/pages/boardGovernance/mockData.js`: all prototype entities and module page definitions.
- `src/pages/boardGovernance/views/HomeView.jsx`: role-aware board-office and director home.
- `src/pages/boardGovernance/views/PlanningMeetingView.jsx`: governance planning and meeting workspaces.
- `src/pages/boardGovernance/views/DirectorView.jsx`: director directory, profile, plan, events, suggestions, and reports.
- `src/pages/boardGovernance/views/CompanyMonitoringView.jsx`: subsidiary governance and monitoring.
- `src/pages/boardGovernance/views/EvaluationResourceView.jsx`: evaluation and governance resources.
- `src/pages/boardGovernance/views/MobileDirectorView.jsx`: director mobile prototype.
- `src/pages/boardGovernance/index.css`: feature-scoped visual system and responsive rules.
- `src/pages/boardGovernance/index.test.js`: static regression and coverage assertions.
- `src/routes.jsx`: register `boardGovernance/*` only.
- `src/components/AppShell.jsx`: render board governance without the legacy app shell only for `/boardGovernance/*`.

### Task 1: Route, isolated shell, and regression guard

**Files:**
- Create: `src/pages/boardGovernance/index.test.js`
- Create: `src/pages/boardGovernance/index.jsx`
- Create: `src/pages/boardGovernance/BoardGovernanceShell.jsx`
- Create: `src/pages/boardGovernance/index.css`
- Modify: `src/routes.jsx`
- Modify: `src/components/AppShell.jsx`

**Interfaces:**
- Produces: default `BoardGovernancePage()` and `BoardGovernanceShell({activeKey, children})`.
- Consumes: `useLocation()` and `Link` from React Router.

- [ ] **Step 1: Write the failing route and isolation test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const routes = await readFile(new URL("../../routes.jsx", import.meta.url), "utf8");
const shell = await readFile(new URL("../../components/AppShell.jsx", import.meta.url), "utf8");

test("registers the isolated board governance route", () => {
  assert.match(routes, /path: "boardGovernance\/\*"/);
  assert.match(shell, /startsWith\("\/boardgovernance"\)/);
});

test("does not reference or modify assign implementation", () => {
  assert.doesNotMatch(routes, /import\("@\/pages\/assign\/.*boardGovernance/);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test src/pages/boardGovernance/index.test.js`

Expected: FAIL because the route and feature files do not exist.

- [ ] **Step 3: Implement the route-aware entry and shell**

Add a lazy `BoardGovernance` import and this route before the catch-all route:

```jsx
{
  path: "boardGovernance/*",
  element: (
    <Suspense>
      <BoardGovernance />
    </Suspense>
  ),
}
```

Extend `isShelllessPath` with a board-governance prefix check while preserving existing exact paths:

```js
const isShelllessPath = (path = "") => {
  const normalized = path.toLowerCase();
  return ["/ai-pricing", "/companyreportshare"].includes(normalized) ||
    normalized.startsWith("/boardgovernance");
};
```

The feature entry maps the final path segment to a view and defaults to `home`.

- [ ] **Step 4: Run the route test**

Run: `node --test src/pages/boardGovernance/index.test.js`

Expected: PASS.

### Task 2: Shared mock model and reusable components

**Files:**
- Create: `src/pages/boardGovernance/mockData.js`
- Create: `src/pages/boardGovernance/components.jsx`
- Modify: `src/pages/boardGovernance/index.test.js`

**Interfaces:**
- Produces: `navigationItems`, `metrics`, `tasks`, `meetings`, `directors`, `companies`, `monitoringItems`, `evaluationItems`, and `resources`.
- Produces: `PageHeader`, `MetricCard`, `StatusPill`, `SectionCard`, `ProgressBar`, `DataTable`, and `DetailDrawer`.

- [ ] **Step 1: Add coverage assertions**

```js
test("defines all eight governance modules", async () => {
  const source = await readFile(new URL("./mockData.js", import.meta.url), "utf8");
  for (const label of ["工作台", "治理规划", "会议管理", "董事履职", "子企业治理", "治理监控", "评价与应用", "治理资料"]) {
    assert.match(source, new RegExp(label));
  }
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test src/pages/boardGovernance/index.test.js`

Expected: FAIL because `mockData.js` does not exist.

- [ ] **Step 3: Implement mock entities and components**

Use stable string IDs, explicit state fields, source labels, deadlines, risk levels, progress values, and cross-object references. `DataTable` accepts `{columns, rows, onRowClick}`. `DetailDrawer` accepts `{open, title, onClose, children}`.

- [ ] **Step 4: Run the coverage test**

Run: `node --test src/pages/boardGovernance/index.test.js`

Expected: PASS.

### Task 3: Role-aware workbench

**Files:**
- Create: `src/pages/boardGovernance/views/HomeView.jsx`
- Modify: `src/pages/boardGovernance/index.jsx`
- Modify: `src/pages/boardGovernance/index.css`
- Modify: `src/pages/boardGovernance/index.test.js`

**Interfaces:**
- Produces: `HomeView({role, onRoleChange})`.
- Consumes: shared metric, card, progress, table, and mock-data exports.

- [ ] **Step 1: Add role-home assertions**

```js
test("home supports board office and director roles", async () => {
  const source = await readFile(new URL("./views/HomeView.jsx", import.meta.url), "utf8");
  assert.match(source, /公司董办/);
  assert.match(source, /董事视角/);
  assert.match(source, /年度治理计划完成率/);
  assert.match(source, /会议筹备/);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test src/pages/boardGovernance/index.test.js`

Expected: FAIL because the view does not exist.

- [ ] **Step 3: Implement the home view**

Render four metrics, task queue, schedule, meeting readiness, director-completeness table, monitoring risk list, subsidiary deviations, and resource reminders. Switch the content to director-focused materials, confirmations, suggestions, and annual duty days when role is `director`.

- [ ] **Step 4: Run tests**

Run: `node --test src/pages/boardGovernance/index.test.js`

Expected: PASS.

### Task 4: Governance planning and meeting workspace

**Files:**
- Create: `src/pages/boardGovernance/views/PlanningMeetingView.jsx`
- Modify: `src/pages/boardGovernance/index.jsx`
- Modify: `src/pages/boardGovernance/index.css`
- Modify: `src/pages/boardGovernance/index.test.js`

**Interfaces:**
- Produces: `PlanningMeetingView({mode})`, where `mode` is `planning` or `meetings`.
- Consumes: plan and meeting mock entities and shared components.

- [ ] **Step 1: Add planning and meeting assertions**

```js
test("covers planning and the nine meeting stages", async () => {
  const source = await readFile(new URL("./views/PlanningMeetingView.jsx", import.meta.url), "utf8");
  for (const label of ["治理重点任务", "年度会议计划", "董事履职计划", "子企业运行计划", "议题征集", "通知与材料", "会前沟通", "表决与决议", "会议归档"]) {
    assert.match(source, new RegExp(label));
  }
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test src/pages/boardGovernance/index.test.js`

Expected: FAIL because the view does not exist.

- [ ] **Step 3: Implement both modes**

Planning mode renders type tabs, progress summary, filtered plan table, and a detail drawer with milestones and changes. Meeting mode renders meeting cards, the nine-stage step bar, meeting summary, agenda table, material-readiness list, pre-meeting questions, decision results, execution tasks, and archive checklist.

- [ ] **Step 4: Run tests**

Run: `node --test src/pages/boardGovernance/index.test.js`

Expected: PASS.

### Task 5: Director duty management

**Files:**
- Create: `src/pages/boardGovernance/views/DirectorView.jsx`
- Modify: `src/pages/boardGovernance/index.jsx`
- Modify: `src/pages/boardGovernance/index.css`
- Modify: `src/pages/boardGovernance/index.test.js`

**Interfaces:**
- Produces: `DirectorView()`.
- Consumes: directors, duty events, suggestions, reports, and time-rule mock data.

- [ ] **Step 1: Add duty coverage assertions**

```js
test("covers director profile, duty events, time calculation, suggestions and reports", async () => {
  const source = await readFile(new URL("./views/DirectorView.jsx", import.meta.url), "utf8");
  for (const label of ["董事档案", "履职计划", "履职记录", "意见建议", "成果报告", "计算明细", "系统同步", "待董事确认"]) {
    assert.match(source, new RegExp(label));
  }
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test src/pages/boardGovernance/index.test.js`

Expected: FAIL because the view does not exist.

- [ ] **Step 3: Implement the director workspace**

Render the director directory, selected profile, eight detail tabs, annual plan, event timeline, source labels, duty-time calculation breakdown, suggestion tracking, and report completeness panel. Add drawer interactions for event evidence and report source traceability.

- [ ] **Step 4: Run tests**

Run: `node --test src/pages/boardGovernance/index.test.js`

Expected: PASS.

### Task 6: Subsidiary governance and monitoring

**Files:**
- Create: `src/pages/boardGovernance/views/CompanyMonitoringView.jsx`
- Modify: `src/pages/boardGovernance/index.jsx`
- Modify: `src/pages/boardGovernance/index.css`
- Modify: `src/pages/boardGovernance/index.test.js`

**Interfaces:**
- Produces: `CompanyMonitoringView({mode})`, where `mode` is `companies` or `monitoring`.
- Consumes: company, deviation, resolution, authorization, suggestion, and improvement data.

- [ ] **Step 1: Add company and monitoring assertions**

```js
test("covers company governance and four monitoring categories", async () => {
  const source = await readFile(new URL("./views/CompanyMonitoringView.jsx", import.meta.url), "utf8");
  for (const label of ["董事会结构", "董事成员", "运行督导", "决议执行", "授权执行", "董事建议落实", "治理改进"]) {
    assert.match(source, new RegExp(label));
  }
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test src/pages/boardGovernance/index.test.js`

Expected: FAIL because the view does not exist.

- [ ] **Step 3: Implement both modes**

Company mode renders an organization tree, governance KPIs, company table, board-seat composition, member terms, committee setup, operating deviations, and rectification actions. Monitoring mode renders category filters, risk summary, task table, progress timeline, completion evidence, approval stages, and four report entry points.

- [ ] **Step 4: Run tests**

Run: `node --test src/pages/boardGovernance/index.test.js`

Expected: PASS.

### Task 7: Evaluation, resources, and mobile director view

**Files:**
- Create: `src/pages/boardGovernance/views/EvaluationResourceView.jsx`
- Create: `src/pages/boardGovernance/views/MobileDirectorView.jsx`
- Modify: `src/pages/boardGovernance/index.jsx`
- Modify: `src/pages/boardGovernance/index.css`
- Modify: `src/pages/boardGovernance/index.test.js`

**Interfaces:**
- Produces: `EvaluationResourceView({mode})` and `MobileDirectorView()`.
- Consumes: evaluation indicators, resource catalog, material versions, schedules, and tasks.

- [ ] **Step 1: Add evaluation, resource, and mobile assertions**

```js
test("covers evaluation, resources, and the mobile director entry", async () => {
  const evaluation = await readFile(new URL("./views/EvaluationResourceView.jsx", import.meta.url), "utf8");
  const mobile = await readFile(new URL("./views/MobileDirectorView.jsx", import.meta.url), "utf8");
  for (const label of ["评价模型", "过程评价", "年度评价", "改进任务", "履职手册", "政策法规", "版本记录"]) {
    assert.match(evaluation, new RegExp(label));
  }
  for (const label of ["首页", "日程", "材料", "待办", "我的"]) {
    assert.match(mobile, new RegExp(label));
  }
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test src/pages/boardGovernance/index.test.js`

Expected: FAIL because the views do not exist.

- [ ] **Step 3: Implement evaluation and resources**

Evaluation mode renders model version, indicator tree, automatic and manual evidence, annual evaluation table, score breakdown, feedback, and linked improvements. Resource mode renders catalog filters, handbook completeness, update tasks, file list, version drawer, source labels, confidentiality, and reading progress.

- [ ] **Step 4: Implement the mobile director screen**

Render a phone-width interface with home summary, schedule, materials, tasks, profile, and a fixed five-item bottom navigation. Use the same mock entities without desktop tables.

- [ ] **Step 5: Run tests**

Run: `node --test src/pages/boardGovernance/index.test.js`

Expected: PASS.

### Task 8: Build, regression verification, and visual review

**Files:**
- Modify only files under `src/pages/boardGovernance` if fixes are required.

**Interfaces:**
- Consumes: all feature routes and views.
- Produces: verified Vite build and unchanged assign source tree.

- [ ] **Step 1: Run feature tests**

Run: `node --test src/pages/boardGovernance/index.test.js`

Expected: all tests PASS.

- [ ] **Step 2: Run lint and production build**

Run: `npm run lint`

Expected: exit code 0.

Run: `npm run vite.build`

Expected: production build completes without errors.

- [ ] **Step 3: Verify assign protection**

Run: `git diff -- src/pages/assign`

Expected: no output.

- [ ] **Step 4: Preview desktop and mobile routes**

Open `/boardGovernance/home`, each of the seven module routes, `/boardGovernance/mobile`, and `/assign`. Check navigation, drawers, tab changes, table overflow, mobile layout, and CSS isolation.

- [ ] **Step 5: Commit implementation files only**

```bash
git add src/routes.jsx src/components/AppShell.jsx src/pages/boardGovernance docs/superpowers/plans/2026-09-15-board-governance-workbench.md
git commit -m "feat: add board governance workbench prototype"
```
