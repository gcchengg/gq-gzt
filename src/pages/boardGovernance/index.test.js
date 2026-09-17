import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("registers an isolated board governance route", async () => {
  const [routes, shell] = await Promise.all([
    read("../../routes.jsx"),
    read("../../components/AppShell.jsx"),
  ]);
  assert.match(routes, /path: "boardGovernance\/\*"/);
  assert.match(shell, /startsWith\("\/boardgovernance"\)/);
});

test("keeps only the requested board governance menus visible", async () => {
  const source = await read("./mockData.js");
  const navigationSource = source.slice(
    source.indexOf("export const navigationItems"),
    source.indexOf("export const metrics"),
  );
  for (const label of ["工作台首页", "董事履职", "负责人任务", "角色配置"]) {
    assert.match(navigationSource, new RegExp(label));
  }
  for (const label of [
    "治理规划",
    "会议管理",
    "子企业治理",
    "治理监控",
    "评价与应用",
    "治理资料",
  ]) {
    assert.doesNotMatch(navigationSource, new RegExp(label));
  }
  for (const key of ["home", "directors", "duty-tasks", "roles"]) {
    assert.match(navigationSource, new RegExp(`key: "${key}"`));
  }
});

test("covers the approved business workspaces", async () => {
  const files = await Promise.all([
    read("./views/HomeView/index.jsx"),
    read("./views/PlanningMeetingView/index.jsx"),
    read("./views/DirectorView/index.jsx"),
    read("./views/CompanyMonitoringView/index.jsx"),
    read("./views/EvaluationResourceView/index.jsx"),
    read("./views/MobileDirectorView/index.jsx"),
  ]);
  const source = files.join("\n");
  for (const label of [
    "公司董办",
    "董事视角",
    "治理重点任务",
    "议题征集",
    "会议归档",
    "董事档案",
    "履职计划",
    "计算明细",
    "意见建议",
    "成果报告",
    "董事会结构",
    "运行督导",
    "决议执行",
    "授权执行",
    "治理改进",
    "评价模型",
    "过程评价",
    "履职手册",
    "版本记录",
    "日程",
    "材料",
    "待办",
    "我的",
  ]) {
    assert.match(source, new RegExp(label));
  }
});

test("keeps board governance styles feature-scoped", async () => {
  const styleFiles = [
    "./BoardGovernanceShell/index.module.less",
    "./views/HomeView/index.module.less",
    "./views/TaskHomeView/index.module.less",
    "./views/DutyTaskManagerView/index.module.less",
    "./views/PlanningMeetingView/index.module.less",
    "./views/DirectorView/index.module.less",
    "./views/CompanyMonitoringView/index.module.less",
    "./views/EvaluationResourceView/index.module.less",
    "./views/MobileDirectorView/index.module.less",
    "./views/RoleConfigView/index.module.less",
  ];
  const sources = await Promise.all(styleFiles.map(read));
  assert.equal(
    sources.some((source) => /\.assign-|\.assign-page/.test(source)),
    false,
  );
});

test("covers the four-stage director lifecycle and appointment handoff", async () => {
  const [director, appointment, actions] = await Promise.all([
    read("./views/DirectorView/index.jsx"),
    read("./views/DirectorView/components/AppointmentFlow/index.jsx"),
    read("./views/DirectorView/components/AppointmentActionPanel/index.jsx"),
  ]);
  for (const label of ["董事聘任", "履职准备", "履职管理", "履职评价"]) {
    assert.match(director, new RegExp(label));
  }
  for (const label of [
    "下发董事推荐函",
    "综合管理部-办公室",
    "上传董事简历",
    "配置系统权限",
    "纳入组织架构",
    "发送钉钉消息",
  ]) {
    assert.match(appointment, new RegExp(label));
  }
  for (const label of [
    "上传并提交",
    "保存权限配置",
    "完成工商变更",
    "Modal.confirm",
  ]) {
    assert.match(actions, new RegExp(label));
  }
  assert.match(appointment, /setAuditMessages/);
  assert.match(appointment, /visibleAuditMessages\.map/);
  assert.match(appointment, /item\.caseId === selected\.id/);
  assert.match(appointment, /selectedRowKey=\{selected\.id\}/);
  assert.match(appointment, /activeAuditId/);
  assert.match(appointment, /<Tabs/);
  assert.doesNotMatch(`${appointment}${actions}`, /待办公室接收|线下/);
});

test("keeps every board-governance workspace responsive", async () => {
  const responsiveStyles = [
    "./BoardGovernanceShell/index.module.less",
    "./views/HomeView/index.module.less",
    "./views/PlanningMeetingView/index.module.less",
    "./views/DirectorView/index.module.less",
    "./views/DirectorView/components/AppointmentFlow/index.module.less",
    "./views/DirectorView/components/AppointmentActionPanel/index.module.less",
    "./views/DirectorView/components/MaterialHistoryDrawer/index.module.less",
    "./views/DirectorView/components/DutyPlanWorkspace/index.module.less",
    "./views/DirectorView/components/DutyPlanWorkspace/AnnualPlanReport/index.module.less",
    "./views/DirectorView/components/DutyEvaluationWorkspace/index.module.less",
    "./views/MaterialTaskView/index.module.less",
    "./views/PlanConfirmTaskView/index.module.less",
    "./views/CompanyMonitoringView/index.module.less",
    "./views/EvaluationResourceView/index.module.less",
    "./views/MobileDirectorView/index.module.less",
    "./views/RoleConfigView/index.module.less",
  ];
  const sources = await Promise.all(responsiveStyles.map(read));
  for (const source of sources) assert.match(source, /@media\s*\(max-width:/);
});

test("provides an operable three-type duty plan lifecycle", async () => {
  const [director, plan, planOptions] = await Promise.all([
    read("./views/DirectorView/index.jsx"),
    read("./views/DirectorView/components/DutyPlanWorkspace/index.jsx"),
    read("./dutyPlanOptions.js"),
  ]);
  assert.match(director, /发起年度履职计划/);
  for (const label of ["会议计划", "培训计划", "调研计划"]) {
    assert.match(`${plan}${planOptions}`, new RegExp(label));
  }
  for (const category of [
    "参加董事会",
    "参加调研",
    "参加子企业重要会议",
    "参加能力培训",
    "开展专项交流",
    "督导子企业落实工作",
    "解决子企业发展问题",
  ]) {
    assert.match(`${plan}${planOptions}`, new RegExp(category));
  }
  assert.match(plan, /label="工作类别"/);
  assert.match(plan, /dataIndex: "workCategory"/);
  for (const field of ["姓名", "任职企业", "履职年度", "履职季度"]) {
    assert.match(plan, new RegExp(field));
  }
  for (const value of [
    "activeDirector.name",
    "activeDirector.company",
    "2026年",
    "三季度",
  ]) {
    assert.match(plan, new RegExp(value));
  }
  assert.match(director, /履职准备董事选择/);
  assert.match(director, /directors\.map/);
  assert.match(director, /directorPlans/);
  for (const action of [
    "新增计划",
    "提交并发送确认任务",
    "确认责任人",
    "生成年度计划并创建任务",
    "查看任务",
    "查看结果",
    "查看年度履职计划报告",
    "打印 / 导出 PDF",
  ]) {
    assert.match(plan, new RegExp(action));
  }
  assert.match(plan, /buildAnnualDutyPlanReport/);
  assert.match(plan, /printAnnualPlanReport/);
  assert.doesNotMatch(plan, /专项任务|线下/);
});

test("connects handbook department tasks with the preparation table", async () => {
  const [page, home, taskHome, task, director, historyDrawer, materialData] =
    await Promise.all([
      read("./index.jsx"),
      read("./views/HomeView/index.jsx"),
      read("./views/TaskHomeView/index.jsx"),
      read("./views/MaterialTaskView/index.jsx"),
      read("./views/DirectorView/index.jsx"),
      read("./views/DirectorView/components/MaterialHistoryDrawer/index.jsx"),
      read("./handbookData.js"),
    ]);
  for (const department of [
    "综合管理部-办公室",
    "股权运营部",
    "投资部",
    "综合管理部-数字化",
  ]) {
    assert.match(materialData, new RegExp(department));
  }
  assert.match(materialData, /responsiblePerson/);
  assert.equal((materialData.match(/id: "HB-/g) || []).length, 8);
  assert.equal((materialData.match(/status: "已提交"/g) || []).length, 8);
  assert.match(`${home}${taskHome}`, /去执行/);
  assert.match(taskHome, /任务视图/);
  assert.match(taskHome, /总待办数/);
  assert.match(taskHome, /董事履职手册资料更新/);
  assert.match(task, /Dragger/);
  assert.match(task, /提交资料/);
  assert.match(page, /status: "已提交"/);
  assert.match(page, /"material-task", "plan-confirm-task"/);
  assert.match(director, /title: "责任人"/);
  assert.match(director, /查看详情/);
  assert.doesNotMatch(
    `${page}${director}`,
    /确认资料|onConfirmMaterial|confirmedCount/,
  );
  assert.match(director, /disabled=\{!allSubmitted\}/);
  assert.match(historyDrawer, /资料历史详情/);
  assert.match(historyDrawer, /全部年度/);
  assert.match(historyDrawer, /全部季度/);
  assert.match(historyDrawer, /历史内容/);
  assert.match(page, /activeKey === "home"/);
});

test("connects plan confirmation tasks with the workbench and plan table", async () => {
  const [page, taskHome, task, plan, data] = await Promise.all([
    read("./index.jsx"),
    read("./views/TaskHomeView/index.jsx"),
    read("./views/PlanConfirmTaskView/index.jsx"),
    read("./views/DirectorView/components/DutyPlanWorkspace/index.jsx"),
    read("./dutyPlanData.js"),
  ]);
  assert.match(page, /plan-confirm-task/);
  assert.match(page, /saveDutyPlanConfirmation/);
  assert.match(page, /generateDutyTasks/);
  assert.match(taskHome, /年度履职计划确认/);
  assert.match(taskHome, /已创建履职任务/);
  assert.match(taskHome, />编辑</);
  assert.match(task, /保存修改/);
  assert.match(task, /提交确认/);
  assert.doesNotMatch(task, /disabled=\{completed\}/);
  assert.match(plan, /label="确认责任人"/);
  assert.match(plan, /查看结果/);
  assert.match(plan, /disabled=\{!canGenerateAnnual\}/);
  assert.equal((data.match(/status: "已完成"/g) || []).length, 3);
});

test("connects responsible-person tasks with director records and reports", async () => {
  const [page, navigation, data, home, manager, director, report] =
    await Promise.all([
      read("./index.jsx"),
      read("./mockData.js"),
      read("./dutyPlanData.js"),
      read("./views/TaskHomeView/index.jsx"),
      read("./views/DutyTaskManagerView/index.jsx"),
      read("./views/DirectorView/index.jsx"),
      read("./views/DirectorView/components/DutyReportWorkspace/index.jsx"),
    ]);
  assert.match(page, /"duty-tasks"/);
  assert.match(navigation, /key: "duty-tasks", label: "负责人任务"/);
  assert.equal((data.match(/taskStatus:/g) || []).length, 3);
  assert.equal((data.match(/taskAssignee:/g) || []).length, 3);
  assert.match(data, /taskStatus: "待执行"/);
  assert.match(data, /taskStatus: "办理中"/);
  assert.match(data, /taskStatus: "已完成"/);
  assert.match(home, /duty-tasks\?bizId=/);
  assert.match(manager, /searchParams\.get\("bizId"\)/);
  assert.match(manager, /确认完成该计划/);
  assert.match(manager, /Dragger/);
  assert.match(page, /completeDutyTask/);
  assert.match(director, /taskEventsFromPlans/);
  for (const label of [
    "履职概览",
    "履职计划",
    "履职记录",
    "意见建议",
    "成果报告",
    "履职手册",
    "评价结果",
    "任职记录",
  ]) {
    assert.match(director, new RegExp(label));
  }
  assert.match(report, /自动生成履职报告/);
  assert.match(report, /保存完善内容/);
  assert.match(report, /提交接收/);
  assert.match(report, /接收履职报告/);
});

test("provides complete duty execution, suggestion, report, and evaluation workflows", async () => {
  const [
    page,
    manager,
    suggestionData,
    report,
    reportData,
    evaluation,
    director,
  ] = await Promise.all([
    read("./index.jsx"),
    read("./views/DutyTaskManagerView/index.jsx"),
    read("./dutySuggestionData.js"),
    read("./views/DirectorView/components/DutyReportWorkspace/index.jsx"),
    read("./dutyReportData.js"),
    read("./views/DirectorView/components/DutyEvaluationWorkspace/index.jsx"),
    read("./views/DirectorView/index.jsx"),
  ]);
  for (const label of [
    "履职任务执行详情",
    "意见建议落实办理",
    "落实方案",
    "落实结果",
    "保存进展",
    "提交完成",
  ]) {
    assert.match(manager, new RegExp(label));
  }
  assert.match(manager, /taskType=suggestion/);
  assert.equal((suggestionData.match(/id: "SUG-/g) || []).length, 3);
  for (const type of ["月度报告", "季度报告", "年度报告"]) {
    assert.match(report, new RegExp(type));
    assert.match(reportData, new RegExp(type));
  }
  for (const label of [
    "发起履职评价",
    "评价人员配置",
    "分角色评分",
    "汇总并提交结果审核",
    "审核通过并反馈",
    "接收评价结果",
  ]) {
    assert.match(evaluation, new RegExp(label));
  }
  assert.match(page, /initialDutyReports/);
  assert.match(page, /initialSuggestionTasks/);
  assert.match(page, /saveSuggestionTask/);
  assert.match(director, /DutyEvaluationWorkspace/);
});

test("provides a personnel-maintain style role configuration page", async () => {
  const [page, view, data] = await Promise.all([
    read("./index.jsx"),
    read("./views/RoleConfigView/index.jsx"),
    read("./roleConfigData.js"),
  ]);
  assert.match(page, /RoleConfigView/);
  assert.match(page, /"roles"/);
  for (const label of [
    "集团董办",
    "综合管理部",
    "办公室",
    "战略规划",
    "公司简介",
    "支撑机制",
    "制度文件",
    "其他",
    "人力",
    "数字化",
    "董办",
    "股权运营部",
    "投资部",
    "审计风控与法务部",
    "班子成员",
  ]) {
    assert.match(`${view}\n${data}`, new RegExp(label));
  }
  for (const label of ["股权运营部", "投资部", "战略规划", "公司简介"]) {
    assert.match(data, new RegExp(`label: "${label}"`));
  }
  for (const action of [
    "权限角色",
    "保存",
    "请输入姓名、账号或所属组织",
    "rowSelection",
  ]) {
    assert.match(view, new RegExp(action));
  }
});
