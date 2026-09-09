# Expert Enrollment Approval Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在专家入库状态为“领导审批中”时，从列表和办理抽屉打开统一的审批详情弹窗。

**Architecture:** 新建专家人才库内聚的审批详情组件，接收当前入库记录并渲染流程概要及审批时间轴。`Enrollment.jsx` 仅管理弹窗打开状态，并在表格操作列和详情抽屉中按状态显示入口。样式使用 CSS Modules，避免复用或覆盖 `gztDemo`、`gzthome` 的全局样式。

**Tech Stack:** React、Ant Design、CSS Modules（Less）

## Global Constraints

- 不修改 `/gzthome` 路由、页面和业务逻辑。
- 不直接引用 `src/pages/gztDemo/index.css` 的全局审批样式。
- “审批详情”仅在记录状态严格等于 `领导审批中` 时显示。
- 不操作 Git，不调用验证相关 skill。

---

### Task 1: 创建审批详情弹窗组件

**Files:**
- Create: `src/pages/expertTalent/components/ApprovalDetailModal/index.jsx`
- Create: `src/pages/expertTalent/components/ApprovalDetailModal/index.module.less`

**Interfaces:**
- Consumes: `record`（专家入库记录）、`open`（布尔值）、`onClose`（关闭函数）。
- Produces: `ApprovalDetailModal({ record, open, onClose })` React 组件。

- [x] **Step 1: 创建组件结构**

使用 Ant Design `Modal` 和 `Descriptions` 展示流程编号、专家、申请事项、当前状态、发起时间；使用局部样式时间轴展示申请人、已完成节点、当前分管领导节点和抄送节点。

- [x] **Step 2: 创建隔离样式**

在 CSS Module 中实现参考 `gztDemo` 的蓝色时间轴、橙色发起节点、绿色通过节点、蓝色抄送标签和待办状态标签。

### Task 2: 接入入库办理列表和抽屉

**Files:**
- Modify: `src/pages/expertTalent/Enrollment.jsx`

**Interfaces:**
- Consumes: `ApprovalDetailModal`。
- Produces: 表格操作列及详情抽屉中的条件入口。

- [x] **Step 1: 增加弹窗状态**

保存当前查看审批详情的入库记录 ID，并由该 ID解析最新记录。

- [x] **Step 2: 接入表格操作列**

当 `item.stage === "领导审批中"` 时，在“办理详情”旁显示“审批详情”；其他状态不渲染该按钮。

- [x] **Step 3: 接入详情抽屉**

当 `record.stage === "领导审批中"` 时，在审批状态提示区域显示“审批详情”按钮。

- [x] **Step 4: 挂载统一弹窗**

列表和抽屉入口均打开同一个 `ApprovalDetailModal`，关闭弹窗不改变办理抽屉状态。

### Task 3: 轻量检查

**Files:**
- Check: `src/pages/expertTalent/Enrollment.jsx`
- Check: `src/pages/expertTalent/components/ApprovalDetailModal/index.jsx`

**Interfaces:**
- Produces: 可构建的专家人才库页面。

- [x] **Step 1: 执行项目构建**

Run: `./node_modules/.bin/vite build`

Expected: 命令退出码为 `0`，无 JSX、Less 或导入错误。
