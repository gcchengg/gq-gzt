# newSanhui2 股权投委会会议纪要 Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `/newSanhui2` 的“一汽股权会议纪要”抽屉中增加独立的股权投委会会议纪要 Tab。

**Architecture:** 在现有 `DueDrawer.jsx` 中新增独立 `EquityInvestmentMeeting` 组件，沿用总办会布局但使用自己的 Form 和附件 state。将该组件插入总办会右侧，并扩展保存分支。

**Tech Stack:** React、Ant Design、dayjs、Node.js `node:test`

## Global Constraints

- 只修改 `/newSanhui2`，不得修改 `/newSanhui`。
- 股权投委会召开日期、期数和附件与总办会完全独立。

---

### Task 1: 股权投委会会议纪要 Tab

**Files:**
- Modify: `src/pages/newSanhui2/components/DueDrawer.jsx`
- Test: `src/pages/newSanhui2/components/DueDrawer.test.js`

**Interfaces:**
- Consumes: `canEditMeetingMinutes: boolean` 和现有 Ant Design 表单、上传组件。
- Produces: `EquityInvestmentMeeting({ canEdit })`，以及 key 为 `investment` 的会议纪要 Tab。

- [ ] **Step 1: Write the failing test**

```js
test("adds an independent equity investment committee minutes tab", () => {
  assert.match(source, /function EquityInvestmentMeeting/);
  assert.ok(source.indexOf('label: "总办会"') < source.indexOf('label: "股权投委会"'));
  assert.match(source, /label="股权投委会召开日"/);
  assert.match(source, /name="investmentLaunchDate"/);
  assert.match(source, /name="investmentIssueNo"/);
  assert.match(source, /股权投委会会议纪要信息已保存/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/pages/newSanhui2/components/DueDrawer.test.js`
Expected: FAIL because `EquityInvestmentMeeting` and the new Tab are absent.

- [ ] **Step 3: Write minimal implementation**

```jsx
function EquityInvestmentMeeting({ canEdit = false }) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  return <div className="meeting-minutes-wrap">{/* independent fields and upload */}</div>;
}
```

Insert after the general office item:

```jsx
{
  key: "investment",
  label: "股权投委会",
  children: <EquityInvestmentMeeting canEdit={canEditMeetingMinutes} />,
}
```

Extend the save condition and message for `meetingActiveKey === "investment"`.

- [ ] **Step 4: Run verification**

Run: `node --test src/pages/newSanhui2/components/DueDrawer.test.js src/pages/newSanhui2/components/CompanyReview.test.js src/pages/newSanhui2/components/TopicEvaluation/index.test.js`
Expected: all tests PASS.

Run: `npm run vite.build`
Expected: Vite exits with code 0.

Run: `git diff --check && git diff --quiet -- src/pages/newSanhui`
Expected: exits with code 0.
