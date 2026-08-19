# newSanhui2 股权投委会决策结果列 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在决策情况表格新增按 `topicType` 条件展示的股权投委会决策结果列和议题 Tag。

**Architecture:** 在 `DecisionExecution.jsx` 增加投委会结果读取函数和分组列，继续复用现有表决文本转换。Mock 行数据提供 `topicType` 及三个独立投委会结果字段；一致性函数保持只读取一汽股权和三会字段。

**Tech Stack:** React、Ant Design Table/Tag、Node.js `node:test`

## Global Constraints

- 仅修改 `/newSanhui2`，不得修改 `/newSanhui`。
- `topicType === "1"` 才显示投委会 Tag 和决策值。
- 一致性不比较股权投委会结果。

---

### Task 1: 决策情况投委会结果列

**Files:**
- Modify: `src/pages/newSanhui2/components/DecisionExecution.jsx`
- Modify: `src/pages/newSanhui2/mockApi.js`
- Create: `src/pages/newSanhui2/components/DecisionExecution.test.js`

**Interfaces:**
- Consumes: 行字段 `topicType`、`investmentBodPassFlag`、`investmentBosPassFlag`、`investmentShPassFlag`。
- Produces: `getInvestmentDecision(row, meetingKey)`，非投委会议题返回 `null`，表格渲染 `--`。

- [ ] **Step 1: Write the failing test**

```js
test("adds conditional investment committee decision columns and tag", () => {
  assert.match(source, /title: "股权投委会决策结果"/);
  assert.match(source, /row\.topicType === "1"/);
  assert.match(source, /<Tag color="gold">股权投委会<\/Tag>/);
  assert.match(source, /investmentBodPassFlag/);
  assert.match(source, /investmentBosPassFlag/);
  assert.match(source, /investmentShPassFlag/);
  assert.match(source, /return "--"/);
});
```

- [ ] **Step 2: Verify RED**

Run: `node --test src/pages/newSanhui2/components/DecisionExecution.test.js`
Expected: FAIL because the new group is absent.

- [ ] **Step 3: Implement the table and mock fields**

```jsx
const getInvestmentDecision = (row, meetingKey) => {
  if (row.topicType !== "1") return null;
  const fieldMap = { bod: "investmentBodPassFlag", bos: "investmentBosPassFlag", sh: "investmentShPassFlag" };
  return row[fieldMap[meetingKey]];
};
```

Render the Tag beside the topic name and add the three-child `股权投委会决策结果` group after `一汽股权决策结果`. Use `--` when the helper returns `null`; otherwise use `passText`.

- [ ] **Step 4: Verify**

Run: `node --test src/pages/newSanhui2/components/DecisionExecution.test.js src/pages/newSanhui2/components/DueDrawer.test.js src/pages/newSanhui2/components/CompanyReview.test.js src/pages/newSanhui2/components/TopicEvaluation/index.test.js`
Expected: all tests PASS.

Run: `npm run vite.build && git diff --check && git diff --quiet -- src/pages/newSanhui`
Expected: exit code 0.
