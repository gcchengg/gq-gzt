# 专家调用表单与声明签署 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将专家调用申请表、E签宝声明签署和咨询记录接入现有专家调用业务闭环。

**Architecture:** PC 端继续以 `Calls.jsx` 和本地 store 为任务主状态；专家档案通过路由参数带入预选专家。锁定排期后创建声明签署记录，小程序模拟 E签宝签署，PC 依据声明状态解锁咨询记录和验收。

**Tech Stack:** React、Ant Design、React Router、单文件 HTML/JavaScript 原型、浏览器 localStorage。

## Global Constraints

- 不修改 `/gzthome` 路径下任何逻辑和页面。
- 不操作 Git。
- 不调用验证相关 skill，仅执行简单静态检查。
- 声明通过 E签宝完成签署。

---

### Task 1: PC 专家调用申请表与入口

**Files:**
- Modify: `src/pages/expertTalent/index.jsx`
- Modify: `src/pages/expertTalent/Calls.jsx`

- [x] 专家档案“发起调用”跳转 `/expertTalentTasks` 并携带专家编号。
- [x] 调用页面自动打开申请表并预填专家。
- [x] 按 PPT 补全申请表字段、计费标准和预计费用。
- [x] 增加申请表 PDF 样式预览和浏览器打印。

### Task 2: 排期邀约与 E签宝声明状态

**Files:**
- Modify: `src/pages/expertTalent/Calls.jsx`
- Modify: `src/pages/expertTalent/store.js`

- [x] 锁定排期时生成声明签署单，状态变为“待专家签署声明”。
- [x] PC 展示声明内容、E签宝单号和签署状态。
- [x] 处理已签署、拒绝和失效状态，只有已签署才能进入咨询记录。

### Task 3: 小程序声明签署与咨询记录

**Files:**
- Modify: `需求/专家人才库/移动端投资合作服务平台_v4_专家人才库_单文件分享版.html`

- [x] 将声明页面改为 E签宝签署入口和模拟回调。
- [x] 补充待签、已签、拒绝、失效演示状态。
- [x] 已签署后进入履约，允许填写 PPT《咨询记录》字段。
- [x] PC“成果与验收”展示咨询记录并支持 PDF 预览、打印和验收。
