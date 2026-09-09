# Expert Appointment And Renewal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 恢复首次聘书签订后入库，并补充3年聘期、90天续聘/年龄预警、续聘审批和主动解聘演示流程。

**Architecture:** 专家本地 store 统一保存入库记录与在聘专家聘期记录。入库管理处理首次聘书；专家档案处理续聘、续聘聘书和解聘；原 `/djghome` 专家入库审批列表同时承接首次入库与续聘审批，不改变 `/gzthome`。

**Tech Stack:** React、Ant Design、本地 store、CSS Modules

## Global Constraints

- 不恢复总办会。
- 首次及续聘聘期固定3年。
- 聘期或年龄上限前90天预警。
- 普通专家上限65周岁，高层次专家上限70周岁。
- 续聘必须经过分管领导审批。
- 解聘必须填写原因、生效日期和说明，并二次确认。
- 不修改 `/gzthome` 逻辑，不操作 Git，不调用验证类 skill。

---

### Task 1: 首次聘书与审批状态

**Files:** `src/pages/expertTalent/store.js`、`src/pages/expertTalent/ApprovalTasks.jsx`、`src/pages/expertTalent/Enrollment.jsx`

- [x] 分管领导首次入库审批通过后进入“待签发聘书”。
- [x] 入库详情按该状态显示“签发聘书并正式入库”。
- [x] 聘书弹窗登记编号、签订日期、3年聘期和附件，校验年龄并二次确认。
- [x] 签订完成后变为“已正式入库”并保存聘书历史。

### Task 2: 续聘、预警和主动解聘

**Files:** `src/pages/expertTalent/data.js`、`src/pages/expertTalent/index.jsx`、`src/pages/expertTalent/index.module.less`、`src/pages/expertTalent/store.js`、`src/pages/expertTalent/ApprovalTasks.jsx`

- [x] 专家档案展示出生日期、年龄上限、聘期和90天预警。
- [x] 临期专家可发起续聘，生成分管领导审批待办。
- [x] 续聘审批通过后签订新聘书并延长3年。
- [x] 临近年龄上限的在聘专家可登记原因并二次确认主动解聘。

### Task 3: 轻量构建

- [x] 运行 `./node_modules/.bin/vite build`，确认退出码为0。
