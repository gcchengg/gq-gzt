import fs from "node:fs";

const path =
  "/Users/guocc/Documents/guquan/files/gq-gzt/需求/综合页面PRD/股权云工作台综合功能PRD_20260727.md";
const source = fs.readFileSync(path, "utf8");

function between(start, end) {
  const startIndex = source.indexOf(start);
  if (startIndex < 0) throw new Error(`未找到：${start}`);
  const endIndex = source.indexOf(end, startIndex + start.length);
  if (endIndex < 0) throw new Error(`未找到：${end}`);
  return source.slice(startIndex, endIndex).trim();
}

function renumber(section, from, to) {
  return section.replaceAll(from, to);
}

const title = source.slice(0, source.indexOf("## 三、需求范围")).trim();

const companyOriginal = between(
  "## 5.3 可比公司维护",
  "## 5.4 外派高管履职分析",
);
const executiveOriginal = between("## 5.4 外派高管履职分析", "## 5.5 勋章管家");
const companyReportOriginal = between("## 5.2 一口清", "## 5.3 可比公司维护");

let company = renumber(companyOriginal, "5.3", "5.1");
company = company
  .replace(
    "## 5.1 可比公司维护\n\n### 5.1.1 列表路由",
    `## 5.1 可比公司维护

### 5.1.1 可比公司维护任务页面

页面路由：\`/djghome\`

![可比公司维护任务页面](./images/02-djghome-可比公司维护任务.png)

用户在任务工作台选择“可比公司维护”后，下方任务列表切换为可比公司维护任务。任务记录展示任务名称、任务下达时间、逾期时间、发送人、计划耗时、执行时间和任务描述。

- 点击“去执行”，进入对应公司的可比公司维护执行页。
- 点击“查看详情”，进入对应任务的详情页面。
- 跳转时携带任务对应的公司、年度、报告周期和任务标识。

### 5.1.2 可比公司维护列表页面

#### 5.1.2.1 列表路由`,
  )
  .replace("### 5.1.2 页面截图", "#### 5.1.2.2 页面截图")
  .replace("### 5.1.3 查询条件", "#### 5.1.2.3 查询条件")
  .replace("### 5.1.4 列表字段", "#### 5.1.2.4 列表字段")
  .replace("### 5.1.5 列表操作", "#### 5.1.2.5 列表操作")
  .replace(
    "### 5.1.6 详情页顶部",
    "### 5.1.3 可比公司维护详情及执行页面\n\n#### 5.1.3.1 详情页顶部",
  )
  .replace("### 5.1.7 第一步", "#### 5.1.3.2 第一步")
  .replace("### 5.1.8 第二步", "#### 5.1.3.3 第二步")
  .replace("### 5.1.9 第三步", "#### 5.1.3.4 第三步");

let executive = renumber(executiveOriginal, "5.4", "5.2");
executive = executive
  .replace(
    "## 5.2 外派高管履职分析\n\n### 5.2.1 列表路由",
    `## 5.2 外派高管履职分析

### 5.2.1 外派高管履职分析任务页面

页面路由：\`/djghome\`

![外派高管履职分析任务页面](./images/03-djghome-外派高管履职分析任务.png)

用户在任务工作台选择“外派高管履职分析”后，下方任务列表切换为外派高管履职分析任务。任务记录展示任务名称、任务下达时间、逾期时间、发送人、计划耗时、执行时间和任务描述。

- 点击“去执行”，进入对应公司的外派高管履职分析执行页。
- 点击“查看详情”，进入对应任务的详情页面。
- 跳转时携带任务对应的公司、年度、维护周期和任务标识。

### 5.2.2 外派高管履职分析列表页面

#### 5.2.2.1 列表路由`,
  )
  .replace("### 5.2.2 页面截图", "#### 5.2.2.2 页面截图")
  .replace("### 5.2.3 查询条件", "#### 5.2.2.3 查询条件")
  .replace("### 5.2.4 列表字段", "#### 5.2.2.4 列表字段")
  .replace(
    "### 5.2.5 执行页顶部",
    "### 5.2.3 外派高管履职分析详情及执行页面\n\n#### 5.2.3.1 执行页顶部",
  )
  .replace("### 5.2.6 人员档案", "#### 5.2.3.2 人员档案")
  .replace("### 5.2.7 月度履职记录", "#### 5.2.3.3 月度履职记录")
  .replace("### 5.2.8 履职综合分析", "#### 5.2.3.4 履职综合分析")
  .replace("### 5.2.9 人员确认", "#### 5.2.3.5 人员确认");

const companyReport = renumber(companyReportOriginal, "5.2", "5.3");

const flowCompany = between(
  "## 6.1 可比公司维护到一口清",
  "## 6.2 外派高管履职分析到一口清",
);
const flowExecutive = between(
  "## 6.2 外派高管履职分析到一口清",
  "## 6.3 一口清到勋章管家",
);

const statusCompany = between(
  "### 7.1 可比公司维护状态",
  "### 7.2 外派高管履职分析状态",
);
const statusExecutive = between(
  "### 7.2 外派高管履职分析状态",
  "### 7.3 人员确认状态",
);
const statusPerson = between("### 7.3 人员确认状态", "### 7.4 考试状态");

let navigation = between("## 八、页面跳转规则", "## 九、交互与视觉要求");
navigation = navigation
  .split("\n")
  .filter(
    (line) =>
      !line.includes("/projectExam") && !line.includes("勋章管家—确认进入"),
  )
  .join("\n")
  .trim();

const visual = between("## 九、交互与视觉要求", "## 十、验收标准");

let acceptanceCompany = between(
  "## 10.3 可比公司维护",
  "## 10.4 外派高管履职分析",
);
acceptanceCompany = acceptanceCompany.replace("## 10.3", "## 10.1").replace(
  "- [ ] `/companyMaintenanceList` 可正常打开。",
  `- [ ] \`/djghome\` 可切换到“可比公司维护”任务。
- [ ] 可比公司维护任务的“去执行”和“查看详情”跳转正确。
- [ ] \`/companyMaintenanceList\` 可正常打开。`,
);

let acceptanceExecutive = between(
  "## 10.4 外派高管履职分析",
  "## 10.5 勋章管家",
);
acceptanceExecutive = acceptanceExecutive.replace("## 10.4", "## 10.2").replace(
  "- [ ] `/executiveMaintenanceList` 可正常打开。",
  `- [ ] \`/djghome\` 可切换到“外派高管履职分析”任务。
- [ ] 外派高管履职分析任务的“去执行”和“查看详情”跳转正确。
- [ ] \`/executiveMaintenanceList\` 可正常打开。`,
);

let acceptanceReport = between("## 10.2 一口清", "## 10.3 可比公司维护");
acceptanceReport = acceptanceReport.replace("## 10.2", "## 10.3");

let delivery = between("## 十一、开发交付范围", "## 十二、变更范围汇总");
delivery = delivery
  .split("\n")
  .filter(
    (line) =>
      !line.includes("勋章管家的考试管理和题库维护") &&
      !line.includes("勋章考试管理"),
  )
  .join("\n")
  .replace(
    "7. 一口清报告、显示配置、PDF 预览和勋章管家入口。",
    "7. 一口清报告、显示配置、PDF 预览和勋章管家入口。",
  )
  .trim();

const scope = `## 三、需求范围

| 序号 | 功能模块 | 页面路由 | 核心功能 |
| --- | --- | --- | --- |
| 1 | 可比公司维护任务及维护页面 | \`/djghome\`、\`/companyMaintenanceList\`、\`/companyMaintenance\` | 从任务进入维护流程，查询维护记录，维护可比公司及材料，生成并确认 AI 对标分析 |
| 2 | 外派高管履职分析任务及分析页面 | \`/djghome\`、\`/executiveMaintenanceList\`、\`/executiveMaintenance\` | 从任务进入履职分析，查询分析记录，查看月报，生成并确认人员履职分析 |
| 3 | 一口清 | \`/comapnyList\` | 选择公司和报告期、查看一企一档报告、配置显示模块、PDF 预览 |
`;

const summary = `## 十二、变更范围汇总

| 模块 | 新增/调整内容 | 使用端 |
| --- | --- | --- |
| 可比公司维护 | 工作台任务、维护列表、公司维护、材料维护、AI 对标分析、确认 | PC |
| 外派高管履职分析 | 工作台任务、分析列表、月报复核、AI 履职分析、人员确认 | PC |
| 一口清 | 企业索引、六大报告模块、显示配置、PDF 预览、勋章入口 | PC |
`;

const output =
  [
    title.replace(
      "工作台任务、一口清、可比公司维护、外派高管履职分析、勋章管家",
      "可比公司维护、外派高管履职分析、一口清",
    ),
    scope,
    "## 五、详细功能需求",
    company,
    executive,
    companyReport,
    "## 六、核心业务流程",
    flowCompany,
    flowExecutive,
    "## 七、页面状态与状态变化",
    statusCompany,
    statusExecutive,
    statusPerson,
    navigation,
    visual,
    "## 十、验收标准",
    acceptanceCompany,
    acceptanceExecutive,
    acceptanceReport,
    delivery,
    summary,
  ].join("\n\n") + "\n";

fs.writeFileSync(path, output);
