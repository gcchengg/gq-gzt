# Expert Talent Mobile Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于现有移动端投资合作服务平台v3单文件原型，交付可演示专家入库、邀约、任务履约、评价和费用查询闭环的v4专家人才库原型。

**Architecture:** 保留原型的五栏底部导航、产业协同入口和整体视觉规范，复制生成v4文件后实施低侵入改造。使用单文件HTML、CSS和原生JavaScript维护演示数据，通过轻量路由状态切换专家工作区页面；测试脚本使用Node.js内置测试模块检查关键页面、状态和交互契约。

**Tech Stack:** HTML5、CSS3、原生JavaScript ES2022、Node.js `node:test`、本地HTTP服务器、Codex内置浏览器。

## Global Constraints

- 原始文件`需求/专家人才库/移动端投资合作服务平台_v3_2026-08-31_19-02_单文件分享版.html`保持不变。
- 新产物固定为`需求/专家人才库/移动端投资合作服务平台_v4_专家人才库_单文件分享版.html`。
- 保留“投资布局、产业协同、股权小智、社区论坛、个人中心”五个底部导航的名称、顺序和主要视觉样式。
- 专家人才继续位于“产业协同”下，不新增底部导航。
- 390像素画布和真实手机宽度下均不得出现横向滚动。
- 小程序原型只展示专家本人数据，不展示其他专家、候选名单、内部审批意见和内部预算信息。
- 所有演示操作仅修改前端内存中的模拟数据，刷新页面后恢复初始状态。
- 本计划只实现小程序单文件原型，不实现管理工作台、后端接口、真实微信登录、真实电子签署或真实文件上传。

---

## File Structure

- `需求/专家人才库/移动端投资合作服务平台_v3_2026-08-31_19-02_单文件分享版.html`：只读原型基线。
- `需求/专家人才库/移动端投资合作服务平台_v4_专家人才库_单文件分享版.html`：新增的完整可分享原型，包含样式、页面、模拟数据和交互。
- `需求/专家人才库/expert-mobile-prototype.test.mjs`：使用Node.js内置测试模块检查v4文件结构、角色入口、状态常量和关键交互函数。

## Interface Contracts

所有后续任务统一使用以下前端接口，不另起同义名称：

```js
const expertState = {
  identityStatus: "active",
  profileCompleteness: 92,
  currentRoute: { name: "expertWorkspace", params: {}, from: "profile" },
  routeStack: [],
  tasks: [],
  messages: [],
  fees: [],
  onboardingDraft: {},
};

function navigateExpert(name, params = {}, from = "expertWorkspace") {}
function backExpert() {}
function renderExpertWorkspace() {}
function renderOnboarding(step = 1) {}
function renderTaskList(filter = "pending") {}
function renderTaskDetail(taskId) {}
function renderExpertProfile() {}
function renderFeeList(filter = "all") {}
function renderUserCenter() {}
function showPrototypeToast(message) {}
```

固定状态值：

```js
const EXPERT_IDENTITY_STATUS = [
  "unbound",
  "invited",
  "reviewing",
  "active",
  "paused",
  "exited",
];

const EXPERT_TASK_STATUS = [
  "invited",
  "commitment_pending",
  "compliance_review",
  "scheduled",
  "in_service",
  "delivery_pending",
  "revision_required",
  "evaluation_pending",
  "settlement_pending",
  "completed",
  "cancelled",
];
```

---

### Task 1: 建立v4副本和静态契约测试

**Files:**
- Create: `需求/专家人才库/移动端投资合作服务平台_v4_专家人才库_单文件分享版.html`
- Create: `需求/专家人才库/expert-mobile-prototype.test.mjs`
- Read only: `需求/专家人才库/移动端投资合作服务平台_v3_2026-08-31_19-02_单文件分享版.html`

**Interfaces:**
- Consumes: v3单文件中的`.phone`、`.subpage`、`.bottom`、`openServiceCategory()`、`goProfile()`和`backFromSub()`。
- Produces: v4原型文件、`expertState`、身份与任务状态常量，以及后续任务使用的测试入口。

- [ ] **Step 1: 编写结构测试并确认失败**

创建`需求/专家人才库/expert-mobile-prototype.test.mjs`：

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const file = join(here, "移动端投资合作服务平台_v4_专家人才库_单文件分享版.html");
const html = readFileSync(file, "utf8");

test("keeps the five existing bottom navigation entries", () => {
  const labels = ["投资布局", "产业协同", "股权小智", "社区论坛", "个人中心"];
  for (const label of labels) assert.match(html, new RegExp(`data-nav="${label}"`));
});

test("defines expert identity and task state contracts", () => {
  assert.match(html, /const EXPERT_IDENTITY_STATUS/);
  assert.match(html, /"unbound"[\s\S]*"active"[\s\S]*"exited"/);
  assert.match(html, /const EXPERT_TASK_STATUS/);
  assert.match(html, /"invited"[\s\S]*"delivery_pending"[\s\S]*"completed"/);
  assert.match(html, /const expertState/);
});
```

运行：

```bash
node --test '需求/专家人才库/expert-mobile-prototype.test.mjs'
```

预期：FAIL，错误为找不到v4 HTML文件。

- [ ] **Step 2: 复制v3生成v4**

运行：

```bash
cp '需求/专家人才库/移动端投资合作服务平台_v3_2026-08-31_19-02_单文件分享版.html' '需求/专家人才库/移动端投资合作服务平台_v4_专家人才库_单文件分享版.html'
```

仅编辑v4文件，在现有主脚本的数据定义区加入：

```js
const EXPERT_IDENTITY_STATUS = ["unbound", "invited", "reviewing", "active", "paused", "exited"];
const EXPERT_TASK_STATUS = [
  "invited",
  "commitment_pending",
  "compliance_review",
  "scheduled",
  "in_service",
  "delivery_pending",
  "revision_required",
  "evaluation_pending",
  "settlement_pending",
  "completed",
  "cancelled",
];
const expertState = {
  identityStatus: "active",
  profileCompleteness: 92,
  currentRoute: { name: "expertWorkspace", params: {}, from: "profile" },
  routeStack: [],
  tasks: [],
  messages: [],
  fees: [],
  onboardingDraft: {},
};
```

- [ ] **Step 3: 运行结构测试**

运行：

```bash
node --test '需求/专家人才库/expert-mobile-prototype.test.mjs'
```

预期：2个测试全部PASS。

- [ ] **Step 4: 检查v3未被修改**

运行：

```bash
git diff --exit-code -- '需求/专家人才库/移动端投资合作服务平台_v3_2026-08-31_19-02_单文件分享版.html'
```

预期：退出码0，无输出。

- [ ] **Step 5: 提交**

```bash
git add '需求/专家人才库/移动端投资合作服务平台_v4_专家人才库_单文件分享版.html' '需求/专家人才库/expert-mobile-prototype.test.mjs'
git commit -m 'feat: scaffold expert talent mobile prototype'
```

---

### Task 2: 专家人才角色入口和个人中心

**Files:**
- Modify: `需求/专家人才库/移动端投资合作服务平台_v4_专家人才库_单文件分享版.html`
- Modify: `需求/专家人才库/expert-mobile-prototype.test.mjs`

**Interfaces:**
- Consumes: `expertState.identityStatus`、现有`openServiceCategory(name)`、现有`goProfile()`。
- Produces: `renderExpertEntry()`、`renderUserCenter()`、`openServiceRequest()`、`navigateExpert()`和`backExpert()`。

- [ ] **Step 1: 添加失败测试**

在测试文件追加：

```js
test("adds role-aware expert entry and a real user center", () => {
  assert.match(html, /function renderExpertEntry\(/);
  assert.match(html, /function renderUserCenter\(/);
  assert.match(html, /进入专家工作区/);
  assert.match(html, /申请专家服务/);
  assert.match(html, /我的专家档案/);
  assert.match(html, /我的任务/);
  assert.match(html, /我的费用/);
});

test("defines expert navigation without replacing bottom navigation", () => {
  assert.match(html, /function navigateExpert\(/);
  assert.match(html, /function backExpert\(/);
  assert.match(html, /routeStack/);
});
```

运行：

```bash
node --test '需求/专家人才库/expert-mobile-prototype.test.mjs'
```

预期：新增2个测试FAIL。

- [ ] **Step 2: 添加专家页面通用样式**

在v4末尾样式区加入以下类，并使用现有CSS变量：

```css
.expert-shell{padding:0 0 28px}.expert-entry{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0}
.expert-entry button{border:0;border-radius:15px;padding:13px 10px;font-size:12px;font-weight:600}
.expert-entry .expert-primary{background:var(--blue);color:#fff}.expert-entry .expert-secondary{background:#eef3ff;color:var(--blue)}
.expert-id-card{margin:14px 12px 0;padding:18px;border-radius:20px;background:linear-gradient(135deg,#315fd9,#6b91ef);color:#fff}
.expert-id-card h2{margin:8px 0 4px;font-size:21px}.expert-id-card p{margin:0;color:#dfe8ff;font-size:11px}
.expert-status{display:inline-flex;padding:4px 8px;border-radius:999px;background:#ffffff26;font-size:10px}
.expert-menu{margin:12px;background:#fff;border:1px solid #e6eaf2;border-radius:17px;overflow:hidden}
.expert-menu button{width:100%;border:0;border-bottom:1px solid #edf0f5;background:#fff;padding:15px;text-align:left;display:flex;justify-content:space-between;font-size:13px}
.expert-menu button:last-child{border-bottom:0}.expert-menu small{color:#8b95a8}
```

- [ ] **Step 3: 实现轻量路由**

使用以下逻辑维护专家页面返回栈：

```js
function navigateExpert(name, params = {}, from = "expertWorkspace") {
  if (expertState.currentRoute?.name) expertState.routeStack.push(expertState.currentRoute);
  expertState.currentRoute = { name, params, from };
  renderExpertRoute();
}

function backExpert() {
  const previous = expertState.routeStack.pop();
  if (!previous) {
    goProfile();
    return;
  }
  expertState.currentRoute = previous;
  renderExpertRoute();
}
```

`renderExpertRoute()`必须只调用本计划接口中声明的页面渲染函数，并在进入页面后将滚动位置恢复为顶部。

- [ ] **Step 4: 改造专家人才页入口**

在`openServiceCategory(name)`渲染完成后，仅当`name === "专家人才"`时插入`renderExpertEntry()`返回的入口区：

```js
function renderExpertEntry() {
  const active = expertState.identityStatus === "active" || expertState.identityStatus === "paused";
  const primary = active
    ? '<button class="expert-primary" onclick="navigateExpert(\'expertWorkspace\',{},\'expertService\')">进入专家工作区</button>'
    : '<button class="expert-primary" onclick="openServiceRequest()">申请专家服务</button>';
  return `<div class="expert-entry">${primary}<button class="expert-secondary" onclick="openModal('服务流程','提交需求后，由工作人员确认需求、匹配专家并安排服务。')">查看服务说明</button></div>`;
}
```

对于`invited`和`reviewing`状态，主按钮分别改为“完善入库资料”和“查看审核进度”。

- [ ] **Step 5: 实现个人中心**

将`goProfile()`改为调用`renderUserCenter()`。个人中心至少渲染身份卡、专家工作区、我的专家档案、我的任务、我的费用、可服务时间、我的服务申请和消息设置。

```js
function renderUserCenter() {
  el("#profile").innerHTML = `
    <section class="expert-id-card">
      <span class="expert-status">在库可用</span>
      <h2>张明</h2>
      <p>专家编号 DJ-001 · 动力电池 · 一级专家</p>
    </section>
    <section class="expert-menu">
      <button onclick="navigateExpert('expertWorkspace')">专家工作区<small>3项待办 ›</small></button>
      <button onclick="navigateExpert('expertProfile')">我的专家档案<small>完整度92% ›</small></button>
      <button onclick="navigateExpert('taskList',{filter:'pending'})">我的任务<small>2项进行中 ›</small></button>
      <button onclick="navigateExpert('feeList')">我的费用<small>1笔处理中 ›</small></button>
      <button onclick="navigateExpert('availability')">可服务时间<small>正常接单 ›</small></button>
    </section>
    <section class="expert-menu">
      <button onclick="openModal('我的服务申请','当前没有待补充的服务申请。')">我的服务申请<small>›</small></button>
      <button onclick="openModal('消息设置','任务、审核和费用消息已开启。')">消息设置<small>›</small></button>
    </section>`;
}
```

- [ ] **Step 6: 运行测试并浏览器检查**

运行：

```bash
node --test '需求/专家人才库/expert-mobile-prototype.test.mjs'
python3 -m http.server 8765 --bind 127.0.0.1
```

浏览器检查：进入“产业协同—专家人才”，确认出现专家入口；进入“个人中心”，确认不再为空白，并可进入专家工作区。

预期：所有测试PASS，两个入口均可用，底部导航未变化。

- [ ] **Step 7: 提交**

```bash
git add '需求/专家人才库/移动端投资合作服务平台_v4_专家人才库_单文件分享版.html' '需求/专家人才库/expert-mobile-prototype.test.mjs'
git commit -m 'feat: add expert entry and user center'
```

---

### Task 3: 专家工作区、任务列表和任务详情

**Files:**
- Modify: `需求/专家人才库/移动端投资合作服务平台_v4_专家人才库_单文件分享版.html`
- Modify: `需求/专家人才库/expert-mobile-prototype.test.mjs`

**Interfaces:**
- Consumes: `navigateExpert()`、`backExpert()`、`expertState.tasks`。
- Produces: `renderExpertWorkspace()`、`renderTaskList(filter)`、`renderTaskDetail(taskId)`、`getTaskById(taskId)`。

- [ ] **Step 1: 添加任务闭环失败测试**

追加：

```js
test("renders expert workspace and task routes", () => {
  assert.match(html, /function renderExpertWorkspace\(/);
  assert.match(html, /function renderTaskList\(/);
  assert.match(html, /function renderTaskDetail\(/);
  assert.match(html, /待确认邀约/);
  assert.match(html, /近期安排/);
  assert.match(html, /概览[\s\S]*材料[\s\S]*交付[\s\S]*记录/);
});

test("includes representative tasks for key lifecycle states", () => {
  for (const status of ["invited", "commitment_pending", "delivery_pending", "revision_required", "completed"])
    assert.match(html, new RegExp(`status:\\s*["']${status}["']`));
});
```

运行测试，预期新增测试FAIL。

- [ ] **Step 2: 创建任务演示数据**

将`expertState.tasks`初始化为至少5条任务：

```js
expertState.tasks = [
  { id:"XT-2026-0018", title:"固态电池技术路线研判", project:"新能源项目A", type:"技术支持", status:"invited", serviceAt:"2026-09-08 14:00", deadline:"2026-09-06 18:00", action:"确认邀约" },
  { id:"XT-2026-0016", title:"智能底盘项目技术咨询", project:"智能底盘项目B", type:"技术支持", status:"commitment_pending", serviceAt:"2026-09-10 09:00", deadline:"2026-09-07 18:00", action:"签署承诺" },
  { id:"XT-2026-0012", title:"动力电池企业现场访谈", project:"动力电池项目C", type:"技术支持", status:"delivery_pending", serviceAt:"2026-09-02 09:00", deadline:"2026-09-05 18:00", action:"提交成果" },
  { id:"XT-2026-0009", title:"新能源供应链风险研判", project:"供应链项目D", type:"管理咨询", status:"revision_required", serviceAt:"2026-08-28 13:30", deadline:"2026-09-05 12:00", action:"补充成果" },
  { id:"XT-2026-0003", title:"氢能赛道趋势分析", project:"氢能项目E", type:"技术支持", status:"completed", serviceAt:"2026-07-16 09:00", deadline:"2026-07-18 18:00", action:"查看记录" },
];
```

- [ ] **Step 3: 实现专家工作区**

`renderExpertWorkspace()`必须显示身份卡、待办任务、近期安排、累计服务8次、进行中2项、平均评价96分和待结算1500元，并为每个待办绑定`navigateExpert('taskDetail',{taskId})`。

- [ ] **Step 4: 实现任务列表**

`renderTaskList(filter)`使用三个主筛选：`pending`、`active`、`completed`。映射规则固定为：

```js
const TASK_FILTERS = {
  pending: ["invited", "commitment_pending", "revision_required"],
  active: ["scheduled", "in_service", "delivery_pending", "evaluation_pending", "settlement_pending"],
  completed: ["completed", "cancelled"],
};
```

无结果时显示独立空状态；不允许使用空白页面代替。

- [ ] **Step 5: 实现任务详情四页签**

`renderTaskDetail(taskId)`根据状态显示主操作，并渲染“概览、材料、交付、记录”四页签。材料区使用三条模拟材料，标注“在线预览”；记录区显示邀约、排期和材料更新的时间线。

状态操作映射：

```js
const TASK_PRIMARY_ACTION = {
  invited: ["接受邀约", "acceptInvitation"],
  commitment_pending: ["签署承诺", "openCommitment"],
  delivery_pending: ["提交成果", "openDelivery"],
  revision_required: ["补充成果", "openDelivery"],
  evaluation_pending: ["等待评价", "disabled"],
  settlement_pending: ["查看费用", "openFee"],
  completed: ["查看服务记录", "viewRecord"],
};
```

- [ ] **Step 6: 运行测试和浏览器验证**

运行Node测试。浏览器依次验证：个人中心进入工作区、查看全部三类任务筛选、打开一条待邀约任务、一条待交付任务和一条已完成任务、返回路径正确。

预期：测试PASS；各状态显示不同主操作；任务返回后保留原筛选。

- [ ] **Step 7: 提交**

```bash
git add '需求/专家人才库/移动端投资合作服务平台_v4_专家人才库_单文件分享版.html' '需求/专家人才库/expert-mobile-prototype.test.mjs'
git commit -m 'feat: add expert workspace and task center'
```

---

### Task 4: 邀约确认、利益关系申报和交付

**Files:**
- Modify: `需求/专家人才库/移动端投资合作服务平台_v4_专家人才库_单文件分享版.html`
- Modify: `需求/专家人才库/expert-mobile-prototype.test.mjs`

**Interfaces:**
- Consumes: `getTaskById(taskId)`、`expertState.tasks`、`navigateExpert()`。
- Produces: `acceptInvitation(taskId)`、`rejectInvitation(taskId)`、`openCommitment(taskId)`、`submitCommitment(taskId, hasConflict)`、`openDelivery(taskId)`、`saveDeliveryDraft(taskId)`、`submitDelivery(taskId)`。

- [ ] **Step 1: 添加失败测试**

```js
test("implements invitation commitment and delivery actions", () => {
  for (const name of ["acceptInvitation", "rejectInvitation", "openCommitment", "submitCommitment", "openDelivery", "saveDeliveryDraft", "submitDelivery"])
    assert.match(html, new RegExp(`function ${name}\\(`));
  assert.match(html, /时间冲突/);
  assert.match(html, /领域不匹配/);
  assert.match(html, /存在利益关系/);
  assert.match(html, /事实类信息/);
  assert.match(html, /判断观点/);
  assert.match(html, /推导依据/);
});
```

运行测试，预期FAIL。

- [ ] **Step 2: 实现接受、拒绝和改期演示**

- 接受邀约：将任务状态改为`commitment_pending`并跳转承诺页。
- 拒绝邀约：弹出原因选择，确认后将任务状态改为`cancelled`并显示处理结果。
- 申请改期：展示两个备选时间，选择后更新`serviceAt`并添加一条任务记录。

拒绝原因固定为“时间冲突、领域不匹配、存在利益关系、材料不足、个人原因、其他”。

- [ ] **Step 3: 实现利益关系申报页**

页面展示项目主体、关联范围、三个申报问题和承诺说明。选择“存在或可能存在”后显示关系说明输入框；提交后任务显示“待合规复核”，并禁用材料入口。选择“不存在”后状态改为`scheduled`。

```js
function submitCommitment(taskId, hasConflict) {
  const task = getTaskById(taskId);
  task.status = hasConflict ? "compliance_review" : "scheduled";
  task.action = hasConflict ? "等待合规复核" : "查看安排";
  showPrototypeToast(hasConflict ? "已提交，等待合规复核" : "承诺已签署，排期已确认");
  renderTaskDetail(taskId);
}
```

`compliance_review`已在Task 1的状态常量中声明，本任务将其加入`pending`筛选。

- [ ] **Step 4: 实现咨询记录和成果提交**

交付页面字段固定为咨询日期、咨询方式、咨询时长、参与人员、咨询目的、问题与答复、事实类信息、判断观点、推导依据、风险提示、行动建议和附件演示区。

草稿保存在`expertState.deliveryDrafts[taskId]`。正式提交将状态改为`evaluation_pending`并向任务记录追加“专家已提交成果”。退回补充的任务进入页面时显示退回意见“请补充技术路线选择的判断依据”。

- [ ] **Step 5: 增加原型表单样式和校验**

必填字段未完成时显示字段级错误。模拟附件区域提供“添加附件”按钮，点击后添加`固态电池技术路线研判意见.pdf`条目，不调用真实文件选择器。

- [ ] **Step 6: 运行测试和浏览器验证**

验证两条路径：

1. 接受邀约、申报无冲突、查看排期。
2. 打开待交付任务、保存草稿、刷新前不丢失、提交后状态变为等待评价。

预期：测试PASS；状态、按钮和时间线同步变化；不存在重复提交。

- [ ] **Step 7: 提交**

```bash
git add '需求/专家人才库/移动端投资合作服务平台_v4_专家人才库_单文件分享版.html' '需求/专家人才库/expert-mobile-prototype.test.mjs'
git commit -m 'feat: add expert invitation and delivery flow'
```

---

### Task 5: 入库办理、专家档案和可服务时间

**Files:**
- Modify: `需求/专家人才库/移动端投资合作服务平台_v4_专家人才库_单文件分享版.html`
- Modify: `需求/专家人才库/expert-mobile-prototype.test.mjs`

**Interfaces:**
- Consumes: `expertState.onboardingDraft`、`navigateExpert()`。
- Produces: `renderOnboarding(step)`、`saveOnboardingStep(step)`、`submitOnboarding()`、`renderExpertProfile()`、`renderAvailability()`。

- [ ] **Step 1: 添加失败测试**

```js
test("implements six-step onboarding and expert profile", () => {
  assert.match(html, /function renderOnboarding\(/);
  assert.match(html, /身份与基本信息/);
  assert.match(html, /教育与工作经历/);
  assert.match(html, /专业能力/);
  assert.match(html, /资质与成果/);
  assert.match(html, /服务意愿与声明/);
  assert.match(html, /确认提交/);
  assert.match(html, /function renderExpertProfile\(/);
  assert.match(html, /function renderAvailability\(/);
});
```

运行测试，预期FAIL。

- [ ] **Step 2: 实现六步入库表单**

按设计文档第18.3节实现六步表单。每步显示`步骤N/6`、步骤名、完成进度和上一步/下一步按钮。模拟邀请手机号为`138****5208`并设为只读。

保存逻辑：

```js
function saveOnboardingStep(step) {
  expertState.onboardingDraft.step = step;
  expertState.onboardingDraft.updatedAt = new Date().toISOString();
  showPrototypeToast("已保存草稿");
}
```

最后提交后将`identityStatus`改为`reviewing`，进入进度页。

- [ ] **Step 3: 实现入库进度页**

展示邀请已发送、资料填写、资料审核、审批确认、聘书签发和正式入库六个节点。`reviewing`状态下前两项完成，第三项进行中，其余等待。

- [ ] **Step 4: 实现专家档案**

档案展示基本信息、专业领域、履历、资质、服务意愿和档案变更记录。顶部显示完整度92%，缺失项为“全固态电池项目证明材料”。“申请变更”按钮弹出演示说明，不直接编辑已审核字段。

- [ ] **Step 5: 实现可服务时间**

展示每周一至周日开关、上午/下午选择、特定不可用日期和暂停接单开关。已经确认的任务冲突时显示提示“修改不会取消已确认任务，请联系管理员调整排期”。

- [ ] **Step 6: 运行测试和浏览器验证**

将`identityStatus`临时切换为`invited`，验证专家人才页进入入库办理；完成六步流程并查看进度。恢复`active`后验证个人中心进入档案和可服务时间。

预期：测试PASS；步骤返回保留草稿；提交后状态与入口文案同步。

- [ ] **Step 7: 提交**

```bash
git add '需求/专家人才库/移动端投资合作服务平台_v4_专家人才库_单文件分享版.html' '需求/专家人才库/expert-mobile-prototype.test.mjs'
git commit -m 'feat: add expert onboarding and profile'
```

---

### Task 6: 评价、费用、消息和服务申请

**Files:**
- Modify: `需求/专家人才库/移动端投资合作服务平台_v4_专家人才库_单文件分享版.html`
- Modify: `需求/专家人才库/expert-mobile-prototype.test.mjs`

**Interfaces:**
- Consumes: `expertState.tasks`、`expertState.messages`、`expertState.fees`、`navigateExpert()`。
- Produces: `renderEvaluation(taskId)`、`renderFeeList(filter)`、`renderFeeDetail(feeId)`、`renderMessageCenter()`、`openServiceRequest()`、`submitServiceRequest()`。

- [ ] **Step 1: 添加失败测试**

```js
test("adds evaluation fee message and service request pages", () => {
  for (const name of ["renderEvaluation", "renderFeeList", "renderFeeDetail", "renderMessageCenter", "openServiceRequest", "submitServiceRequest"])
    assert.match(html, new RegExp(`function ${name}\\(`));
  assert.match(html, /交付性/);
  assert.match(html, /响应效率/);
  assert.match(html, /服务态度/);
  assert.match(html, /待确认[\s\S]*处理中[\s\S]*已支付[\s\S]*无需支付/);
});
```

运行测试，预期FAIL。

- [ ] **Step 2: 实现评价展示**

已完成任务展示总分96、等级优秀、交付性48/50、响应效率29/30、服务态度19/20，以及评价说明。提供“提交异议”演示入口，填写后显示“异议已提交，等待复核”，不修改原评价。

- [ ] **Step 3: 实现费用记录**

初始化三条费用：处理中1500元、已支付1000元、无需支付0元。列表提供全部、处理中、已支付筛选。详情显示服务明细、费用规则版本、应付金额、调整金额、实付金额和更新时间，不展示内部预算科目。

- [ ] **Step 4: 实现消息中心**

初始化待办、任务、审核、费用、系统五类消息。每条消息包含`id`、`category`、`title`、`summary`、`createdAt`、`read`、`route`和`params`。点击消息标记已读并跳转目标页面；失效消息展示“该事项已处理”。

- [ ] **Step 5: 实现专家服务申请**

表单字段使用设计文档第18.1节定义：需求类型、需求主题、需求描述、所属单位、联系人、期望时间、服务形式和附件演示区。提交后生成固定演示编号`XQ-2026-0098`，显示受理结果页。

- [ ] **Step 6: 运行测试和浏览器验证**

验证评价、费用筛选、消息跳转和服务申请提交。预期测试PASS，所有结果页面都有明确返回入口，不出现空白页。

- [ ] **Step 7: 提交**

```bash
git add '需求/专家人才库/移动端投资合作服务平台_v4_专家人才库_单文件分享版.html' '需求/专家人才库/expert-mobile-prototype.test.mjs'
git commit -m 'feat: add expert evaluation fees and messages'
```

---

### Task 7: 响应式、异常状态和最终验收

**Files:**
- Modify: `需求/专家人才库/移动端投资合作服务平台_v4_专家人才库_单文件分享版.html`
- Modify: `需求/专家人才库/expert-mobile-prototype.test.mjs`

**Interfaces:**
- Consumes: 前六项任务产生的全部页面和路由函数。
- Produces: `renderLoadingState()`、`renderEmptyState(message)`、`renderErrorState(message, retryAction)`、最终可交付v4原型。

- [ ] **Step 1: 添加最终失败测试**

```js
test("provides loading empty error and access-denied states", () => {
  assert.match(html, /function renderLoadingState\(/);
  assert.match(html, /function renderEmptyState\(/);
  assert.match(html, /function renderErrorState\(/);
  assert.match(html, /无权查看该内容/);
  assert.match(html, /重新加载/);
});

test("keeps mobile overflow constrained", () => {
  assert.match(html, /overflow-x:\s*hidden/);
  assert.match(html, /@media\(max-width:430px\)/);
});
```

运行测试，预期新增测试FAIL。

- [ ] **Step 2: 实现通用状态组件**

```js
function renderLoadingState() {
  return '<div class="expert-state"><div class="expert-spinner"></div><p>正在加载</p></div>';
}
function renderEmptyState(message) {
  return `<div class="expert-state"><b>暂无内容</b><p>${message}</p></div>`;
}
function renderErrorState(message, retryAction) {
  return `<div class="expert-state"><b>加载失败</b><p>${message}</p><button onclick="${retryAction}">重新加载</button></div>`;
}
```

为任务、费用、消息和档案页面补充空数据、加载失败和无权访问的演示状态。

- [ ] **Step 3: 静态质量检查**

运行：

```bash
node --test '需求/专家人才库/expert-mobile-prototype.test.mjs'
rg -n 'TODO|TBD|待定|onclick=""|href="#"' '需求/专家人才库/移动端投资合作服务平台_v4_专家人才库_单文件分享版.html'
```

预期：全部测试PASS；`rg`无输出。

- [ ] **Step 4: 本地浏览器完整走查**

运行：

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

逐项检查：

1. 五个底部导航名称、顺序和切换正常。
2. 产业协同原有四类服务仍可进入。
3. 专家人才页可进入服务申请和专家工作区。
4. 个人中心显示专家身份和五个专家业务入口。
5. 入库六步表单、进度页和档案页可返回。
6. 邀约接受、利益关系申报、交付提交状态正确。
7. 评价、费用、消息和服务申请页面完整。
8. 390×844、375×812和430×932视口无横向滚动、遮挡和底部按钮不可点击问题。

- [ ] **Step 5: 检查浏览器控制台**

访问所有新增页面后读取控制台日志。

预期：无`ReferenceError`、`TypeError`、未捕获异常和资源404；允许原单文件内嵌图片产生正常加载记录。

- [ ] **Step 6: 检查改动范围**

运行：

```bash
git status --short
git diff --check -- '需求/专家人才库/移动端投资合作服务平台_v4_专家人才库_单文件分享版.html' '需求/专家人才库/expert-mobile-prototype.test.mjs'
git diff --exit-code -- '需求/专家人才库/移动端投资合作服务平台_v3_2026-08-31_19-02_单文件分享版.html'
```

预期：仅v4文件和测试文件存在本计划内修改；无空白错误；v3无变化。

- [ ] **Step 7: 最终提交**

```bash
git add '需求/专家人才库/移动端投资合作服务平台_v4_专家人才库_单文件分享版.html' '需求/专家人才库/expert-mobile-prototype.test.mjs'
git commit -m 'test: verify expert mobile prototype flows'
```

## Completion Criteria

- v4单文件可以直接在浏览器打开和分享。
- 原v3文件内容保持不变。
- 五栏导航及原有产业协同模块无回归。
- 专家从身份入口可以走通入库、邀约、承诺、任务、交付、评价和费用演示流程。
- 个人中心不再为空白，并成为专家业务的稳定入口。
- 所有Node静态契约测试通过。
- 三种手机视口完成视觉走查，页面无横向滚动和底部遮挡。
- 浏览器控制台无新增脚本错误。

## Deferred Work

- 管理工作台需单独形成实施计划。
- 真实接口、数据库、统一认证、微信授权、电子签署、文件存储和消息订阅不在本原型实施范围。
- 真实产品开发时，应将单文件页面拆为微信小程序独立页面与组件，并以接口状态替代演示数据。
