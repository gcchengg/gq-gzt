# 履职建议独立模块 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让董事或子企业董办发起关联履职任务的建议，董办下发给责任人，责任人落实并关闭，三方通过独立列表查看全过程。

**Architecture:** `BoardGovernancePage` 继续持有唯一的 `suggestionTasks` 状态。纯函数处理建议的创建、下发、进展和关闭；独立页面负责列表与详情表单；菜单、首页及原履职管理页只负责导航和读取同一状态。

**Tech Stack:** React 19、React Router 7、Ant Design 5、CSS Modules（Less）、Node `node:test`、Vite。

## Global Constraints

- 只改 `src/pages/boardGovernance` 演示工作台；不引入后端接口、持久化或新登录体系。
- 董事发起必须选择自己已有的履职任务并填写建议；董办下发前必须填写责任部门、责任人、完成期限。
- 责任人沿用“一汽股权”角色和页面内筛选；提交落实结果即关闭，无额外验收。
- 同一履职任务可关联多条建议；新建议保存任务 ID 及发起时摘要。
- 只迁移可确定来源任务的演示记录；其他记录保留历史来源文字和办理能力。
- 不覆盖工作区现有未提交的 `需求/` 文件改动。提交时显式列出本功能文件。

---

## File map

| 文件 | 单一职责 |
|---|---|
| `src/pages/boardGovernance/suggestionWorkflow.js` | 纯状态操作、输入校验、角色可见范围与待办筛选 |
| `src/pages/boardGovernance/suggestionWorkflow.test.js` | 状态、关联、权限和历史数据行为测试 |
| `src/pages/boardGovernance/dutySuggestionData.js` | 演示建议初始数据及确定的来源任务关联 |
| `src/pages/boardGovernance/views/DutySuggestionView/index.jsx` | 独立列表、路由驱动的详情抽屉、角色表单、空态和办理时间线 |
| `src/pages/boardGovernance/views/DutySuggestionView/index.module.less` | 本模块布局和窄屏样式 |
| `src/pages/boardGovernance/index.jsx` | 根状态、建议操作回调和新视图挂载 |
| `src/pages/boardGovernance/stageRouting.js` | 新列表/详情路由解析与旧建议深链跳转 |
| `src/pages/boardGovernance/mockData.js`、`BoardGovernanceShell/index.jsx` | 侧栏“履职任务”子菜单及角色显示 |
| `src/pages/boardGovernance/views/TaskHomeView/index.jsx` | 一汽股权首页的履职建议落实分组 |
| `src/pages/boardGovernance/views/DirectorView/index.jsx`、`views/ManagementView/index.jsx` | 移除旧页签并提供当前董事的建议链接 |
| `src/pages/boardGovernance/views/DutyTaskManagerView/index.jsx` | 移除旧建议办理界面，保留其他任务功能 |
| `src/pages/boardGovernance/index.test.js`、`stageRouting.test.js` | 更新入口、深链与移除旧 UI 的断言 |

### Task 1: 建议状态与来源任务

**Files:** Create `src/pages/boardGovernance/suggestionWorkflow.js`, `suggestionWorkflow.test.js`; modify `dutySuggestionData.js`.

**Interfaces:**
- `createSuggestion({ directorName, sourceTask, content, initiatorRole, initiatorName, now, id })` 返回 `待董办补充` 建议。
- `dispatchSuggestion(item, { owner, assignee, deadline }, now)` 返回 `待落实` 建议。
- `saveSuggestionProgress(item, values, now)` 返回 `办理中` 建议。
- `closeSuggestion(item, values, now)` 返回 `已关闭` 建议。
- `visibleSuggestions(items, { role, directorName, assignee })` 和 `suggestionFulfillmentTasks(items, assignee)` 返回过滤结果。

- [ ] **Step 1: 写失败的状态测试。** 测试董事仅选自己的任务、下发字段必填、进展不要求结果、关闭需要结果并自动进度 100、历史来源可读。同一任务两次创建生成两个不同 ID。

```js
import test from "node:test";
import assert from "node:assert/strict";
import { createSuggestion, dispatchSuggestion, saveSuggestionProgress, closeSuggestion, visibleSuggestions, suggestionFulfillmentTasks } from "./suggestionWorkflow.js";

const task = { id: "PLAN-003", directorName: "张铁斌", content: "能源科技经营情况专题调研" };
test("director suggestion retains the source task and waits for office", () => {
  const item = createSuggestion({ id: "SUG-X", directorName: "张铁斌", sourceTask: task, content: "建议跟踪风险", initiatorRole: "director", initiatorName: "张铁斌", now: "2026-10-08 10:00" });
  assert.equal(item.sourceTaskId, "PLAN-003");
  assert.equal(item.sourceTaskSnapshot.content, task.content);
  assert.equal(item.status, "待董办补充");
  assert.notEqual(createSuggestion({ id: "SUG-Y", directorName: "张铁斌", sourceTask: task, content: "另一条建议", initiatorRole: "director", initiatorName: "张铁斌", now: "2026-10-08 10:01" }).id, item.id);
  assert.throws(() => createSuggestion({ id: "SUG-Y", directorName: "李晨光", sourceTask: task, content: "建议", initiatorRole: "director", initiatorName: "李晨光", now: "2026-10-08" }));
  assert.throws(() => dispatchSuggestion(item, { owner: "投资部", assignee: "", deadline: "2026-10-30" }, "2026-10-08"));
  const sent = dispatchSuggestion(item, { owner: "投资部", assignee: "孙博", deadline: "2026-10-30" }, "2026-10-08");
  assert.equal(suggestionFulfillmentTasks([sent], "孙博").length, 1);
  assert.equal(visibleSuggestions([sent], { role: "director", directorName: "李晨光" }).length, 0);
  const saved = saveSuggestionProgress(sent, { handlingPlan: "完成测算", progress: 40 }, "2026-10-09");
  assert.equal(saved.status, "办理中");
  assert.throws(() => closeSuggestion(saved, { result: "" }, "2026-10-10"));
  assert.equal(closeSuggestion(saved, { result: "已完成测算" }, "2026-10-10").progress, 100);
});
```

- [ ] **Step 2: 运行单测确认失败。** `node --test src/pages/boardGovernance/suggestionWorkflow.test.js`；预期 `ERR_MODULE_NOT_FOUND`。
- [ ] **Step 3: 实现纯函数。** 用 `requireText` 检查必填文本；每个动作返回新对象并追加 `{ action, actor, at }` 记录，不修改输入对象；只有 `待董办补充` 可下发、只有 `待落实/办理中` 可保存或关闭。

```js
const requireText = (value, label) => {
  if (!String(value ?? "").trim()) throw new Error(`请填写${label}`);
  return String(value).trim();
};
const appendHistory = (item, action, actor, at) => [...(item.history || []), { action, actor, at }];
export function createSuggestion({ id, directorName, sourceTask, content, initiatorRole, initiatorName, now }) {
  if (!sourceTask?.id || sourceTask.directorName !== directorName) throw new Error("请选择该董事的有效履职任务");
  const item = { id, directorName, sourceTaskId: sourceTask.id, sourceTaskSnapshot: { id: sourceTask.id, content: sourceTask.content }, source: sourceTask.content, content: requireText(content, "建议内容"), initiatorRole, initiatorName, owner: "", assignee: "", deadline: "", handlingPlan: "", progress: 0, result: "", feedback: "", files: [], status: "待董办补充", createdAt: now };
  return { ...item, history: appendHistory(item, "发起建议", initiatorName, now) };
}
export function dispatchSuggestion(item, fields, now) {
  if (item.status !== "待董办补充") throw new Error("当前建议不可下发");
  const owner = requireText(fields.owner, "责任部门");
  const assignee = requireText(fields.assignee, "责任人");
  const deadline = requireText(fields.deadline, "完成期限");
  return { ...item, owner, assignee, deadline, status: "待落实", dispatchedAt: now, history: appendHistory(item, "下发建议", "综合管理部-董办", now) };
}
export function saveSuggestionProgress(item, values, now) {
  if (!["待落实", "办理中"].includes(item.status)) throw new Error("当前建议不可办理");
  return { ...item, ...values, status: "办理中", history: appendHistory(item, "保存进展", item.assignee, now) };
}
export function closeSuggestion(item, values, now) {
  if (!["待落实", "办理中"].includes(item.status)) throw new Error("当前建议不可关闭");
  const result = requireText(values.result, "落实结果");
  return { ...item, ...values, result, progress: 100, status: "已关闭", completedAt: now, history: appendHistory(item, "关闭建议", item.assignee, now) };
}
export function visibleSuggestions(items, { role, directorName, assignee } = {}) {
  if (role === "director") return items.filter((item) => item.directorName === directorName || item.initiatorName === directorName);
  if (role === "adminDepartment") return assignee ? items.filter((item) => item.assignee === assignee) : items;
  return [];
}
export function suggestionFulfillmentTasks(items, assignee) {
  return items.filter((item) => ["待落实", "办理中"].includes(item.status) && (!assignee || item.assignee === assignee));
}
```

- [ ] **Step 4: 给 `SUG-001` 补 `sourceTaskId: "PLAN-003"` 与来源快照。** `SUG-002/003` 来源不能可靠匹配时补 `legacySource: true` 并保留 `source`；现有 `已完成` 数据映射为 `已关闭`。在测试中断言历史记录保留来源文字，且 `visibleSuggestions` 不过滤掉历史记录。
- [ ] **Step 5: 运行 `node --test src/pages/boardGovernance/suggestionWorkflow.test.js`，预期通过；提交这三个文件。** `git commit -m "feat: model duty suggestion workflow" -- src/pages/boardGovernance/suggestionWorkflow.js src/pages/boardGovernance/suggestionWorkflow.test.js src/pages/boardGovernance/dutySuggestionData.js`。

### Task 2: 独立列表与详情

**Files:** Create `views/DutySuggestionView/index.jsx`, `index.module.less`; modify `index.jsx` to pass state and callbacks.

**Interfaces:** `DutySuggestionView({ role, resource, id, suggestions, plans, onCreate, onDispatch, onSaveProgress, onClose })`。根页面的四个回调接收视图传入数据、调用 Task 1 纯函数、更新 `suggestionTasks`。

- [ ] **Step 1: 在 `index.test.js` 增加新页面挂载与表单文案断言，并运行 `node --test src/pages/boardGovernance/index.test.js` 确认新断言失败。** 旧用例中只替换本功能的过时断言，不把其他现有失败当作本任务回归。

```js
test("mounts the independent duty suggestion workflow", async () => {
  const [page, view] = await Promise.all([read("./index.jsx"), read("./views/DutySuggestionView/index.jsx")]);
  assert.match(page, /<DutySuggestionView/);
  for (const label of ["关联履职任务", "建议内容", "责任部门", "责任人", "完成期限", "落实结果", "提交完成"]) assert.match(view, new RegExp(label));
});
```

- [ ] **Step 2: 实现页面。** 始终渲染 `PageHeader`、搜索、状态和责任人筛选、`DataTable`；`resource === "suggestion"` 时通过 `id` 打开右侧 `Drawer`，显示详情或错误态，关闭时导航回列表并保留查询参数。董事的 `Form` 只有任务 Select 与建议 TextArea；董办额外显示责任信息；负责人表单显示落实方案、进度、反馈、佐证和结果。提交前调用 `form.validateFields()`，关闭时仅要求结果。建议详情里的每次操作调用相应回调，成功后显示 `message.success`。用 `Timeline` 展示 `history`，窄屏下表格允许横向滚动。

```jsx
const [searchParams] = useSearchParams();
const directorName = "张铁斌";
const [selectedAssignee, setSelectedAssignee] = useState(searchParams.get("assignee") || "");
const visible = visibleSuggestions(suggestions, { role, directorName, assignee: selectedAssignee });
const eligiblePlans = plans.filter((plan) => plan.directorName === (role === "director" ? directorName : selectedDirectorName) && plan.taskStatus);
const selected = suggestions.find((item) => item.id === id);
const canDispatch = role === "adminDepartment" && selected?.status === "待董办补充";
const canFulfill = role === "adminDepartment" && ["待落实", "办理中"].includes(selected?.status) && selected?.assignee === selectedAssignee;
```

- [ ] **Step 3: 根页面使用 `createSuggestion`、`dispatchSuggestion`、`saveSuggestionProgress`、`closeSuggestion` 更新唯一 `suggestionTasks`。** 新建议 ID 用 `crypto.randomUUID()`，`getNow()` 记时间；董办直接发起时先创建，再调用 `dispatchSuggestion`。完成原履职任务时自动生成的建议必须写 `sourceTaskId` 与快照，状态改为“待董办补充”。把 `createEvaluation` 的已落实建议计数从 `status === "已完成"` 改为 `status === "已关闭"`。
- [ ] **Step 4: 运行新页面测试及 `pnpm vite.build`，修复 JSX/样式错误；提交视图、样式、根页面和测试。** 预期构建退出码 0。

### Task 3: 菜单、路由与旧入口

**Files:** Modify `mockData.js`, `BoardGovernanceShell/index.jsx`, `stageRouting.js`, `stageRouting.test.js`, `views/DirectorView/index.jsx`, `views/ManagementView/index.jsx`, `views/DutyTaskManagerView/index.jsx`, `index.test.js`.

- [ ] **Step 1: 写路由测试。** `/boardGovernance/duty-suggestions` 返回 `resource: "list"`；`/boardGovernance/duty-suggestions/SUG-001` 返回 `resource: "suggestion", id: "SUG-001"`；`/boardGovernance/duty-tasks?taskType=suggestion&bizId=SUG-001` 重定向到详情。

```js
assert.deepEqual(resolveBoardGovernanceLocation("/boardGovernance/duty-suggestions/SUG-001"), { key: "duty-suggestions", resource: "suggestion", id: "SUG-001", redirectTo: null });
assert.equal(resolveBoardGovernanceLocation("/boardGovernance/duty-tasks", "?taskType=suggestion&bizId=SUG-001").redirectTo, "/boardGovernance/duty-suggestions/SUG-001");
```

- [ ] **Step 2: 运行路由测试确认失败；在 `stageRouting.js` 加新分支和旧深链重定向。** 无 `bizId` 的旧建议链接重定向到新列表。
- [ ] **Step 3: `navigationItems` 中在 `duty-tasks` 后增加 `{ key: "duty-suggestions", label: "履职建议", parentKey: "duty-tasks" }`。** Shell 将这两项渲染成一个带子项的 Ant Design `Menu` 节点；`director` 可见键增加 `duty-suggestions`，`groupOffice` 不增加。根页面 `validKeys` 加入新键。子路由保持子项选中、父级展开。
- [ ] **Step 4: 从 `DutyManagement` Tabs 删除 `{ key: "suggestions", label: "意见建议" }` 和相应 `TabContent` 分支。** `ManagementView` 在当前董事详情加 `<Link to={\`/boardGovernance/duty-suggestions?directorName=${encodeURIComponent(director.name)}\`}>查看履职建议</Link>`；旧 `?tab=suggestions` 打开概览。`DutyTaskManagerView` 删除建议专用抽屉、表单、不可达页签与对应 props，其他任务页签不变。
- [ ] **Step 5: 更新旧静态断言并运行 `node --test src/pages/boardGovernance/stageRouting.test.js src/pages/boardGovernance/index.test.js`。** 新断言检查菜单、旧深链、新建议页签不存在；若 `index.test.js` 中其他本来失效的断言失败，只修本功能影响的断言并记录其他失败。提交以上文件。

### Task 4: 首页待办与整体核对

**Files:** Modify `views/TaskHomeView/index.jsx`, `index.test.js`；必要时调整 `views/TaskHomeView/index.module.less`。

- [ ] **Step 1: 写静态入口断言及状态函数测试。** 首页任务大类顺序应为“履职任务管理”紧接“履职建议落实”；每条建议使用 `/boardGovernance/duty-suggestions/:id` 链接；只有 `待落实/办理中` 计入待办，关闭后不计入。

```js
test("suggestion fulfillment follows duty task management on the company home", async () => {
  const home = await read("./views/TaskHomeView/index.jsx");
  assert.match(home, /label: "履职任务管理"[\s\S]*label: "履职建议落实"/);
  assert.match(home, /\/boardGovernance\/duty-suggestions\/\$\{item\.id\}/);
});
```

- [ ] **Step 2: 在 `TaskHomeView` 的 `taskCategories` 中把“履职建议落实”放在 `duty` 分组之后。** 下方直接列待办，不设置二级 tab 或按部门拆分；行标题区分“综合管理部董办的任务”和“其他任务”。前者列“待董办补充”，后者列已下发未关闭，点击时带入责任人筛选。初始演示数据让两类任务各有一条；列表行显示建议、责任人、状态，没待办时显示清晰空态。
- [ ] **Step 3: 执行 `node --test src/pages/boardGovernance/suggestionWorkflow.test.js src/pages/boardGovernance/stageRouting.test.js src/pages/boardGovernance/index.test.js` 与 `pnpm vite.build`。** 预期新增及本功能更新的测试通过、构建成功。通过应用界面切换董事/一汽股权角色，手动走一遍“发起 → 董办下发 → 责任人保存进展 → 关闭”，核对首页数量、建议列表和详情同步。
- [ ] **Step 4: 检查 `git diff --check`、`git status --short`，只提交本功能文件。** 提交信息 `feat: connect duty suggestions to company task home`；不要暂存 `需求/` 中原有未提交文件。

## Done criteria

董事可从独立模块关联既有任务提出建议；董办可补充分派或直接发起；责任人在一汽股权首页找到分派建议并提交落实结果关闭；三方在各自可见范围内查看同一条办理记录；原管理页签及旧任务办理入口不再并存。测试和构建成功，工作区原有改动未被覆盖。
