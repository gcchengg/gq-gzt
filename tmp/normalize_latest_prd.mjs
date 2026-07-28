import fs from "node:fs";

const path =
  "/Users/guocc/Documents/guquan/files/gq-gzt/需求/综合页面PRD/股权云工作台综合功能PRD_20260727.md";

let text = fs.readFileSync(path, "utf8");

// Keep only the content currently retained by the user; normalize its hierarchy.
text = text
  .replace("## 三、需求范围", "## 一、需求范围")
  .replace("## 五、详细功能需求", "## 二、详细功能需求")
  .replaceAll("5.1", "2.1")
  .replaceAll("5.2", "2.2")
  .replaceAll("5.3", "2.3")
  .replace("## 六、核心业务流程", "## 三、核心业务流程")
  .replace("## 6.1 可比公司维护到一口清", "### 3.1 可比公司维护到一口清")
  .replace(
    "## 6.2 外派高管履职分析到一口清",
    "### 3.2 外派高管履职分析到一口清",
  )
  .replace("## 七、页面状态与状态变化", "## 四、页面状态与状态变化")
  .replaceAll("### 7.1", "### 4.1")
  .replaceAll("### 7.2", "### 4.2")
  .replaceAll("### 7.3", "### 4.3")
  .replace("## 八、页面跳转规则", "## 五、页面跳转规则")
  .replace("## 九、交互与视觉要求", "## 六、交互与视觉要求")
  .replace("## 十二、变更范围汇总", "## 七、变更范围汇总");

// Keep list screenshots with list pages, and move detail screenshots to execution pages.
text = text
  .replace(
    `![可比公司维护列表](./images/04-可比公司维护列表.png)

![可比公司维护查看页](./images/05-可比公司维护详情.png)

![可比公司维护执行页](./images/06-可比公司维护执行页.png)

![可比公司 AI 分析结果](./images/07-可比公司AI分析结果.png)`,
    `![可比公司维护列表](./images/04-可比公司维护列表.png)`,
  )
  .replace(
    `### 2.1.3 可比公司任务执行页面
\`http://www.prompt.ski/companyMaintenance?fromTask=1&companyId=cc-001&year=2025&period=annual\`
- 工作台存放位置: [股权云工作台][运营管理]`,
    `### 2.1.3 可比公司任务执行页面

页面地址：\`http://www.prompt.ski/companyMaintenance?fromTask=1&companyId=cc-001&year=2025&period=annual\`

工作台存放位置：股权云工作台 → 运营管理

![可比公司维护查看页](./images/05-可比公司维护详情.png)

![可比公司维护执行页](./images/06-可比公司维护执行页.png)

![可比公司 AI 分析结果](./images/07-可比公司AI分析结果.png)`,
  )
  .replace(
    `![外派高管履职分析列表](./images/08-外派高管履职分析列表.png)

![外派高管履职分析执行页](./images/09-外派高管履职分析执行页.png)

![外派高管 AI 履职分析结果](./images/10-外派高管AI履职分析结果.png)`,
    `![外派高管履职分析列表](./images/08-外派高管履职分析列表.png)`,
  )
  .replace(
    `### 2.2.3 外派高管履职分析任务执行页面
\`http://www.prompt.ski/executiveMaintenance?company=%E9%95%BF%E6%98%A5%E4%B8%80%E4%B8%9C&year=2026&period=%E5%B9%B4%E5%BA%A6\`
- 工作台存放位置: [股权云工作台][董监高管理]
#### 2.2.3.1 执行页顶部
- 取数来源：https://iwork.faw.cn/gq-0207_app_002/monthRecordReview （外派高管月报复核）`,
    `### 2.2.3 外派高管履职分析任务执行页面

页面地址：\`http://www.prompt.ski/executiveMaintenance?company=%E9%95%BF%E6%98%A5%E4%B8%80%E4%B8%9C&year=2026&period=%E5%B9%B4%E5%BA%A6\`

工作台存放位置：股权云工作台 → 董监高管理

![外派高管履职分析执行页](./images/09-外派高管履职分析执行页.png)

![外派高管 AI 履职分析结果](./images/10-外派高管AI履职分析结果.png)

#### 2.2.3.1 执行页顶部

取数来源：[外派高管月报复核](https://iwork.faw.cn/gq-0207_app_002/monthRecordReview)`,
  );

// Remove excess empty lines introduced by manual deletions while preserving section spacing.
text = text.replace(/\n{4,}/g, "\n\n\n").trimEnd() + "\n";

fs.writeFileSync(path, text);
