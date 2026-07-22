# 生命周期重要事项 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在基础底数中新增可独立配置的“生命周期重要事项”时间轴事件卡片，并通过标题说明图标展示取数来源。

**Architecture:** `data.js` 提供配置项和结构化事件对象；`index.jsx` 使用 `base-4` 条件渲染非表格事件卡片；`index.module.less` 提供紧凑元信息布局、移动端自然换行与打印友好的卡片样式。

**Tech Stack:** React 19、Ant Design 5、CSS Modules、Less、Biome、Vite

## Global Constraints

- 标题固定为“5. 生命周期重要事项”。
- 来源提示固定为“取数来源：投后报告-列入生命周期时间轴事项”。
- 配置键固定为 `base-4`。
- 仅展示日期、类别、事项和其他相关方，不显示表格、序号或“列入生命周期轴事项”标签。
- 不新增依赖，不改动现有接口和路由。
- 保留工作区中已有的无关修改，不提交生产文件。

---

### Task 1: 新增生命周期事项数据、配置与时间轴卡片

**Files:**
- Modify: `src/pages/companyList/data.js`
- Modify: `src/pages/companyList/index.jsx`
- Modify: `src/pages/companyList/index.module.less`

**Interfaces:**
- Produces: `lifecycleMilestone` 对象，字段为 `key`、`date`、`category`、`content`、`relatedParty`
- Consumes: 现有 `sectionOptions`、`Sub`、`Tag` 和 CSS Module

- [x] **Step 1: 运行缺失功能检查并确认失败**

```bash
node -e "const fs=require('fs');const data=fs.readFileSync('src/pages/companyList/data.js','utf8');const page=fs.readFileSync('src/pages/companyList/index.jsx','utf8');if(!data.includes('lifecycleMilestone')||!data.includes('生命周期重要事项')||!page.includes('id=\"base-4\"')||!page.includes('取数来源：投后报告-列入生命周期时间轴事项'))process.exit(1)"
```

Expected: exit code 1，因为配置、数据和卡片尚不存在。

- [x] **Step 2: 在 `data.js` 增加配置项和结构化数据**

在 `base.children` 末尾加入 `"生命周期重要事项"`，并新增：

```js
export const lifecycleMilestone = {
  key: "lifecycle-board-approval",
  date: "2026-06-24",
  category: "三会管理",
  content:
    "接收长春一东临时董事会议题（选举独立董事、选举董事、接收国有资本预算金）并完成审批",
  relatedParty: "无",
};
```

- [x] **Step 3: 在 `index.jsx` 导入数据并渲染 `base-4`**

在数据导入中加入 `lifecycleMilestone`，并在 `base-3` 后加入：

```jsx
<Sub
  id="base-4"
  title="5. 生命周期重要事项"
  titleSource="取数来源：投后报告-列入生命周期时间轴事项"
  checked={checked}
>
  <article className={styles.lifecycleCard}>
    <div className={styles.lifecycleDate}>
      <span>2026</span>
      <b>06-24</b>
    </div>
    <div className={styles.lifecycleBody}>
      <header>
        <Tag color="processing">{lifecycleMilestone.category}</Tag>
        <span>其他相关方：{lifecycleMilestone.relatedParty}</span>
      </header>
      <p>{lifecycleMilestone.content}</p>
    </div>
  </article>
</Sub>
```

把 `styles.lifecycleCard` 加入打印样式的 `break-inside: avoid-page` 列表。

- [x] **Step 4: 在 `index.module.less` 增加时间轴卡片与移动端样式**

新增：

```less
.lifecycleCard { position: relative; display: grid; grid-template-columns: 118px minmax(0, 1fr); overflow: hidden; border: 1px solid #d8e1e7; border-left: 4px solid @red; border-radius: 3px 10px 10px 3px; background: #fff; box-shadow: 0 5px 15px rgba(34,58,78,.055); font-family: "Microsoft YaHei", sans-serif; }
.lifecycleDate { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 18px 14px; background: linear-gradient(145deg, #e7eef4, #f6f9fb); color: @blue; span { font-family: Georgia, serif; font-size: 13px; letter-spacing: 2px; } b { margin-top: 4px; font-family: Georgia, serif; font-size: 24px; letter-spacing: 1px; } }
.lifecycleBody { padding: 16px 18px; header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; :global(.ant-tag) { margin-inline-end: 0; } > span { color: #7b8b97; font-size: 11px; } } p { margin: 0 !important; color: #40566a !important; font-size: 13px !important; line-height: 1.8 !important; text-align: justify !important; } }
```

在 `max-width: 760px` 中新增：

```less
.lifecycleCard { grid-template-columns: 1fr; }
.lifecycleDate { align-items: flex-start; padding: 12px 15px; b { font-size: 20px; } }
.lifecycleBody header { align-items: flex-start; flex-direction: column; gap: 6px; }
```

- [x] **Step 5: 重新运行功能检查**

Run: Step 1 中的 `node -e` 命令。

Expected: exit code 0。

- [x] **Step 6: 运行格式与构建验证**

```bash
./node_modules/.bin/biome check --no-errors-on-unmatched --files-ignore-unknown=true src/pages/companyList/data.js src/pages/companyList/index.jsx
git diff --check
npm run vite.build
```

Expected: 所有命令 exit code 0，Vite 输出 `✓ built`。

---

### Task 2: 收敛日期与卡片元信息样式

**Files:**
- Modify: `src/pages/companyList/index.jsx`
- Modify: `src/pages/companyList/index.module.less`

**Interfaces:**
- Consumes: `lifecycleMilestone.date`、`lifecycleMilestone.category`、`lifecycleMilestone.relatedParty`
- Produces: `lifecycleMeta` 紧凑元信息行；移除 `lifecycleDate` 和 `lifecycleBody` 独立布局

- [x] **Step 1: 运行旧日期栏检查并确认失败**

```bash
node -e "const fs=require('fs');const page=fs.readFileSync('src/pages/companyList/index.jsx','utf8');const css=fs.readFileSync('src/pages/companyList/index.module.less','utf8');if(page.includes('styles.lifecycleDate')||!page.includes('日期：{lifecycleMilestone.date}')||css.includes('.lifecycleDate')||!css.includes('.lifecycleMeta'))process.exit(1)"
```

Expected: exit code 1，因为页面仍使用独立大日期栏。

- [x] **Step 2: 将 JSX 改为紧凑元信息行**

用以下结构替换 `lifecycleDate` 和 `lifecycleBody`：

```jsx
<article className={styles.lifecycleCard}>
  <header className={styles.lifecycleMeta}>
    <Tag color="processing">{lifecycleMilestone.category}</Tag>
    <span>日期：{lifecycleMilestone.date}</span>
    <span>其他相关方：{lifecycleMilestone.relatedParty}</span>
  </header>
  <p>{lifecycleMilestone.content}</p>
</article>
```

- [x] **Step 3: 将 LESS 改为页面现有的元信息视觉**

删除 `.lifecycleDate`、`.lifecycleBody` 及其移动端规则，使用：

```less
.lifecycleCard { overflow: hidden; border: 1px solid #d8e1e7; border-left: 4px solid @red; border-radius: 3px 8px 8px 3px; background: #fff; box-shadow: 0 4px 12px rgba(34,58,78,.05); font-family: "Microsoft YaHei", sans-serif; > p { margin: 0 !important; padding: 13px 16px 15px; color: #40566a !important; font-size: 13px !important; line-height: 1.8 !important; text-align: justify !important; } }
.lifecycleMeta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; padding: 9px 16px; border-bottom: 1px solid #e3e9ed; background: #f7f9fa; :global(.ant-tag) { margin-inline-end: 0; } > span { color: #748694; font-size: 11px; line-height: 22px; } }
```

移动端无需独立日期规则，`flex-wrap` 自动保证元信息换行。

- [x] **Step 4: 重新运行结构检查**

Run: Step 1 中的 `node -e` 命令。

Expected: exit code 0。

- [x] **Step 5: 运行格式、差异和生产构建验证**

```bash
./node_modules/.bin/biome check --no-errors-on-unmatched --files-ignore-unknown=true src/pages/companyList/index.jsx
git diff --check
npm run vite.build
```

Expected: 所有命令 exit code 0，Vite 输出 `✓ built`。
