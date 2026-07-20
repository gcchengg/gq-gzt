# 国资委监管要求整改 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在“五、风险隐患‘清’”中增加可独立配置的国资委监管要求整改卡片，并通过说明图标标注数据来源。

**Architecture:** 示例数据作为结构化对象放在 `data.js`，配置弹窗继续由 `sectionOptions` 驱动，页面通过 `risk-2` 条件渲染一张复用现有风险视觉语言的整改卡片。样式追加在现有 CSS Module 中，并覆盖移动端和打印场景。

**Tech Stack:** React 19、Ant Design 5、CSS Modules、Less、Biome、Vite

## Global Constraints

- 数据来源必须仅通过项目现有 `SourceMark` 说明图标显示。
- 数据来源文本必须为“财务工作台-财务分析-产权管理-国资委监管要求”。
- 新增配置键固定为 `risk-2`。
- 不新增依赖，不改动现有接口和路由。
- 保留工作区中已有的无关修改，不提交生产文件。

---

### Task 1: 新增国资委监管整改数据、配置与卡片

**Files:**
- Modify: `src/pages/companyList/data.js`
- Modify: `src/pages/companyList/index.jsx`
- Modify: `src/pages/companyList/index.module.less`

**Interfaces:**
- Produces: `sasacRectification` 对象，字段为 `key`、`problem`、`planDate`、`planContent`、`owner`、`status`、`evidence`
- Consumes: 现有 `sectionOptions`、`Sub`、`SourceMark`、`Tag` 和 CSS Module

- [x] **Step 1: 运行缺失功能检查并确认失败**

```bash
node -e "const fs=require('fs');const data=fs.readFileSync('src/pages/companyList/data.js','utf8');const page=fs.readFileSync('src/pages/companyList/index.jsx','utf8');if(!data.includes('sasacRectification')||!data.includes('国资委监管要求整改')||!page.includes('id=\"risk-2\"')||!page.includes('财务工作台-财务分析-产权管理-国资委监管要求'))process.exit(1)"
```

Expected: exit code 1，因为新增数据、配置项和板块尚不存在。

- [x] **Step 2: 在 `data.js` 增加配置项和结构化示例数据**

将 `risk` 分组修改为：

```js
{
  key: "risk",
  label: "五、风险隐患“清”",
  children: ["审计发现问题及整改明细", "风险情况", "国资委监管要求整改"],
},
```

并新增：

```js
export const sasacRectification = {
  key: "sasac-veto-right",
  problem: "公司章程、股东协议约定非国有股东对一些事项具有一票否决权",
  planDate: "2026年12月",
  planContent:
    "推动参股公司修改公司章程、股东协议，取消非国有股东一票否决权",
  owner: "丛圣元",
  status: "进行中",
  evidence:
    "截至2026年7月，已与参股公司全体股东就公司章程、股东协议修订事项达成一致意见，正推动参股公司准备议案，提请董事会、股东会决议",
};
```

- [x] **Step 3: 在 `index.jsx` 导入数据并条件渲染 `risk-2`**

在数据导入中加入 `sasacRectification`，并在 `risk-1` 后加入：

```jsx
<Sub
  id="risk-2"
  title="3. 国资委监管要求整改"
  titleSource="财务工作台-财务分析-产权管理-国资委监管要求"
  checked={checked}
>
  <article className={styles.rectificationCard}>
    <header>
      <div>
        <span>整改问题</span>
        <b>{sasacRectification.problem}</b>
      </div>
      <Tag color="processing">{sasacRectification.status}</Tag>
    </header>
    <dl className={styles.rectificationFacts}>
      <div>
        <dt>计划时间</dt>
        <dd>{sasacRectification.planDate}</dd>
      </div>
      <div>
        <dt>责任人</dt>
        <dd>{sasacRectification.owner}</dd>
      </div>
    </dl>
    <div className={styles.rectificationDetail}>
      <span>计划内容</span>
      <p>{sasacRectification.planContent}</p>
    </div>
    <div className={styles.rectificationDetail}>
      <span>备证说明</span>
      <p>{sasacRectification.evidence}</p>
    </div>
  </article>
</Sub>
```

把 `styles.rectificationCard` 加入打印样式的 `break-inside: avoid-page` 列表。

- [x] **Step 4: 在 `index.module.less` 增加卡片和移动端样式**

新增：

```less
.rectificationCard { overflow: hidden; border: 1px solid #d8e1e7; border-left: 3px solid #315d7f; border-radius: 8px; background: #fff; box-shadow: 0 4px 13px rgba(34,58,78,.045); font-family: "Microsoft YaHei", sans-serif; }
.rectificationCard > header { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; padding: 13px; border-bottom: 1px solid #e3e9ed; background: linear-gradient(135deg, #f1f5f8, #fbfcfd); > div { min-width: 0; } span, b { display: block; } span { margin-bottom: 4px; color: #83919c; font-size: 10px; } b { color: #29465f; font-size: 13px; line-height: 1.7; } :global(.ant-tag) { flex: 0 0 auto; margin-inline-end: 0; } }
.rectificationFacts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); margin: 0; border-bottom: 1px solid #e6ebef; background: #fbfcfd; > div { padding: 10px 13px; border-right: 1px solid #e6ebef; &:last-child { border-right: 0; } } dt { margin-bottom: 3px; color: #84929d; font-size: 10px; } dd { margin: 0; color: #40566a; font-size: 12px; font-weight: 600; } }
.rectificationDetail { display: grid; grid-template-columns: 72px minmax(0, 1fr); gap: 11px; padding: 12px 13px; border-bottom: 1px dashed #e3e9ed; &:last-child { border-bottom: 0; } > span { color: #8a5a48; font-size: 11px; font-weight: 700; } p { color: #465a6b !important; font-size: 12px !important; line-height: 1.75 !important; text-align: justify !important; } }
```

在 `max-width: 760px` 中新增：

```less
.rectificationFacts, .rectificationDetail { grid-template-columns: 1fr; }
.rectificationFacts > div { border-right: 0; border-bottom: 1px solid #e6ebef; &:last-child { border-bottom: 0; } }
.rectificationDetail { gap: 5px; }
```

- [x] **Step 5: 重新运行功能检查**

Run: Step 1 中的 `node -e` 命令。

Expected: exit code 0。

- [x] **Step 6: 运行格式和构建验证**

```bash
./node_modules/.bin/biome check --no-errors-on-unmatched --files-ignore-unknown=true src/pages/companyList/data.js src/pages/companyList/index.jsx
git diff --check
npm run vite.build
```

Expected: 所有命令 exit code 0，Vite 输出 `✓ built`。
