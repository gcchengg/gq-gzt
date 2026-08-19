# newSanhui2 议题提报股权投委会字段 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在议题清单新增和编辑抽屉中显示并保存“是否为股权投委会”。

**Architecture:** 复用现有 `TopicEditDrawer` 表单，在分类与审批区域增加 `topicType` Radio。初始化时将旧数据缺省值归一为 `"1"`，表单保存逻辑自然把字段合并到议题对象。

**Tech Stack:** React、Ant Design Form/Radio、Node.js `node:test`

## Global Constraints

- 仅修改 `/newSanhui2`，不得修改 `/newSanhui`。
- `topicType === "1"` 表示是，`topicType === "0"` 表示否。
- 新增及旧数据缺省时默认选择是。

---

### Task 1: 议题新增编辑字段

**Files:**
- Modify: `src/pages/newSanhui2/components/SubmitDrawer.jsx`
- Create: `src/pages/newSanhui2/components/SubmitDrawer.test.js`

**Interfaces:**
- Consumes: `record.topicType?: "0" | "1"`。
- Produces: 表单值 `topicType: "0" | "1"`，随 `onSave` 议题对象保存。

- [ ] **Step 1: Write the failing test**

```js
test("shows topicType in add and edit drawer with yes default", () => {
  assert.match(source, /label="是否为股权投委会" name="topicType"/);
  assert.match(source, /topicType: record\?\.topicType \|\| "1"/);
  assert.match(source, /topicType: "1"/);
  assert.match(source, /\{ label: "是", value: "1" \}/);
  assert.match(source, /\{ label: "否", value: "0" \}/);
});
```

- [ ] **Step 2: Verify RED**

Run: `node --test src/pages/newSanhui2/components/SubmitDrawer.test.js`
Expected: FAIL because `topicType` is absent.

- [ ] **Step 3: Implement**

Add `topicType: record?.topicType || "1"` to edit initialization, `topicType: "1"` to Form initial values, and the required Radio below approval level.

- [ ] **Step 4: Verify**

Run: `node --test src/pages/newSanhui2/components/SubmitDrawer.test.js src/pages/newSanhui2/components/DecisionExecution.test.js src/pages/newSanhui2/components/DueDrawer.test.js src/pages/newSanhui2/components/CompanyReview.test.js src/pages/newSanhui2/components/TopicEvaluation/index.test.js`
Expected: all tests PASS.

Run: `npm run vite.build && git diff --check && git diff --quiet -- src/pages/newSanhui`
Expected: exit code 0.
