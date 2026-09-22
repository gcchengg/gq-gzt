import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("registers an isolated board governance route", async () => {
  const [routes, shell, boardShell] = await Promise.all([
    read("../../routes.jsx"),
    read("../../components/AppShell.jsx"),
    read("./BoardGovernanceShell/index.jsx"),
  ]);
  assert.match(routes, /path: "boardGovernance\/\*"/);
  assert.match(shell, /startsWith\("\/boardgovernance"\)/);
  assert.match(boardShell, /gq-app-sidebar/);
  assert.match(boardShell, /gq-app-menu/);
  assert.match(boardShell, /className="gq-app-menu"/);
});

test("keeps only the requested board governance menus visible", async () => {
  const source = await read("./mockData.js");
  const navigationSource = source.slice(
    source.indexOf("export const navigationItems"),
    source.indexOf("export const metrics"),
  );
  for (const label of [
    "工作台首页",
    "董事聘任",
    "履职准备",
    "履职管理",
    "履职评价",
    "履职任务",
    "履职角色配置",
  ]) {
    assert.match(navigationSource, new RegExp(label));
  }
  for (const label of [
    "董事履职",
    "治理规划",
    "会议管理",
    "子企业治理",
    "治理监控",
    "评价与应用",
    "治理资料",
  ]) {
    assert.doesNotMatch(navigationSource, new RegExp(label));
  }
  for (const key of [
    "home",
    "appointment",
    "preparation",
    "management",
    "duty-evaluation",
    "duty-tasks",
    "roles",
  ]) {
    assert.match(navigationSource, new RegExp(`key: "${key}"`));
  }
});

test("filters board governance menus by the selected role", async () => {
  const [shell, page, appointment, flow] = await Promise.all([
    read("./BoardGovernanceShell/index.jsx"),
    read("./index.jsx"),
    read("./views/AppointmentView/index.jsx"),
    read("./views/DirectorView/components/AppointmentFlow/index.jsx"),
  ]);
  assert.match(shell, /groupOffice: \["appointment"\]/);
  assert.match(shell, /adminDepartment: navigationItems\.map/);
  assert.match(shell, /auditLegalDepartment: \["home"\]/);
  assert.match(shell, /director: \["home", "management", "duty-tasks"\]/);
  assert.doesNotMatch(
    shell,
    /currentRole\.key === "director" && activeKey === "duty-tasks"/,
  );
  assert.match(shell, /label: "集团董办"/);
  assert.match(shell, /label: "综合管理部"/);
  assert.match(shell, /label: "审计封控与法务部"/);
  assert.match(shell, /label: "董事"/);
  assert.match(page, /useState\("groupOffice"\)/);
  assert.match(appointment, /role === "groupOffice"/);
  assert.match(flow, /仅集团董办可以下发董事推荐函/);
});

test("shows the reusable task issue drawer on director management only", async () => {
  const [page, management] = await Promise.all([
    read("./index.jsx"),
    read("./views/ManagementView/index.jsx"),
  ]);
  assert.match(page, /<ManagementView\s+role=\{role\}/);
  assert.match(
    management,
    /import TaskIssueDrawer from "@\/components\/TaskIssueDrawer"/,
  );
  assert.match(management, /role === "director"\s*\?\s*\(/);
  assert.match(management, /title="任务浮窗"/);
  assert.match(management, /defaultTaskType="500"/);
  assert.match(management, /zIndex=\{12120\}/);
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
  const [director, appointment, actions, actionStyles] = await Promise.all([
    read("./views/DirectorView/index.jsx"),
    read("./views/DirectorView/components/AppointmentFlow/index.jsx"),
    read("./views/DirectorView/components/AppointmentActionPanel/index.jsx"),
    read(
      "./views/DirectorView/components/AppointmentActionPanel/index.module.less",
    ),
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
  assert.match(appointment, /selectedRowKey=\{selected\?\.id\}/);
  assert.match(appointment, /activeAuditId/);
  assert.match(appointment, /<Tabs/);
  assert.match(actionStyles, /grid-template-columns:minmax\(0,1fr\)/);
  assert.match(actionStyles, /min-width:76px/);
  assert.match(actionStyles, /\.ant-btn-primary\)\{color:#fff\}/);
  assert.doesNotMatch(`${appointment}${actions}`, /待办公室接收|线下/);
});

test("keeps every board-governance workspace responsive", async () => {
  const responsiveStyles = [
    "./BoardGovernanceShell/index.module.less",
    "./views/HomeView/index.module.less",
    "./views/PlanningMeetingView/index.module.less",
    "./views/DirectorView/index.module.less",
    "./views/AppointmentView/index.module.less",
    "./views/DirectorStageTable/index.module.less",
    "./views/StageDetailDrawer/index.module.less",
    "./views/PreparationView/index.module.less",
    "./views/ManagementView/index.module.less",
    "./views/DutyEvaluationStageView/index.module.less",
    "./views/StageBlocked/index.module.less",
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
  const [director, plan, planOptions, planStyles] = await Promise.all([
    read("./views/DirectorView/index.jsx"),
    read("./views/DirectorView/components/DutyPlanWorkspace/index.jsx"),
    read("./dutyPlanOptions.js"),
    read("./views/DirectorView/components/DutyPlanWorkspace/index.module.less"),
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
  assert.match(
    director,
    /function PreparationWorkspace\(\{[\s\S]{0,500}onDeleteDutyPlan/,
  );
  assert.match(
    director,
    /function PreparationWorkspace\(\{[\s\S]{0,500}onSubmitDutyPlan/,
  );
  for (const action of [
    "新增计划",
    "保存为草稿",
    "提交计划",
    "批量提交",
    "删除计划",
    "确认责任人",
    "生成年度计划并创建任务",
    "查看任务",
    "去执行",
    "查看年度履职计划报告",
    "打印 / 导出 PDF",
  ]) {
    assert.match(plan, new RegExp(action));
  }
  assert.match(plan, /selectedDraftIds/);
  assert.match(plan, /className=\{styles\.planFooterCopy\}/);
  assert.match(planStyles, /\.planFooterCopy span/);
  assert.doesNotMatch(planStyles, /\.planFooter span/);
  const page = await read("./index.jsx");
  assert.match(page, /Array\.isArray\(planIds\)/);
  assert.match(plan, /buildAnnualDutyPlanReport/);
  assert.match(plan, /printAnnualPlanReport/);
  const annualReport = await read(
    "./views/DirectorView/components/DutyPlanWorkspace/annualPlanReport.js",
  );
  const annualReportView = await read(
    "./views/DirectorView/components/DutyPlanWorkspace/AnnualPlanReport/index.jsx",
  );
  assert.match(annualReport, /DEMO_ANNUAL_PLAN_REPORT/);
  assert.match(annualReportView, /本年度重点工作计划/);
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
  assert.match(taskHome, /label: "履职准备"/);
  assert.match(taskHome, /department: "董事履职手册"/);
  assert.match(taskHome, /department: "年度履职计划"/);
  assert.equal(
    (taskHome.match(/department: "(?:董事履职手册|年度履职计划)"/g) || [])
      .length,
    2,
  );
  assert.match(taskHome, /const pendingCount = visibleTaskCategories\.reduce/);
  assert.match(taskHome, /董事履职手册确认任务/);
  assert.match(taskHome, /preparation\/directors\/D-02\?tab=handbook/);
  assert.match(taskHome, /preparation\/directors\/D-02\?tab=annual-plan/);
  assert.match(task, /Dragger/);
  assert.match(task, /提交资料/);
  assert.match(page, /status: "已提交"/);
  assert.match(page, /"material-task"/);
  assert.match(page, /"plan-confirm-task"/);
  assert.match(director, /title: "责任人"/);
  assert.match(director, /查看详情/);
  assert.doesNotMatch(
    `${page}${director}`,
    /确认资料|onConfirmMaterial|confirmedCount/,
  );
  assert.match(director, /disabled=\{!materials\.length \|\| !allSubmitted\}/);
  assert.match(director, /label: "董事履职手册"/);
  assert.match(director, /label: "年度履职计划编排"/);
  for (const step of [
    "计划制定",
    "计划全部提交",
    "年度履职计划生成",
    "自动创建履职任务",
  ]) {
    assert.match(director, new RegExp(step));
  }
  assert.match(director, /<Steps[\s\S]{0,220}current=\{annualPlanStep\}/);
  assert.match(director, /annualPlanGenerated\s*\? 4/);
  const dutyPlanData = await read("./dutyPlanData.js");
  assert.equal((dutyPlanData.match(/id: "PLAN-D02-/g) || []).length, 3);
  assert.match(director, /const previewColumns = \[/);
  assert.doesNotMatch(director, /scroll=\{\{ x: 950, y: 280 \}\}/);
  assert.match(historyDrawer, /资料历史详情/);
  assert.match(historyDrawer, /全部年度/);
  assert.match(historyDrawer, /全部季度/);
  assert.match(historyDrawer, /历史内容/);
  assert.match(page, /home:\s*\(/);
});

test("opens appointment task drawers from the workbench", async () => {
  const [page, home, data] = await Promise.all([
    read("./index.jsx"),
    read("./views/TaskHomeView/index.jsx"),
    read("./appointmentData.js"),
  ]);
  assert.match(page, /appointmentCases=\{appointmentCases\}/);
  assert.match(home, /label: "董事聘任任务"/);
  assert.match(home, /useState\("appointment"\)/);
  for (const status of ["待上传董事简历", "待配置系统权限", "待完成工商变更"]) {
    assert.match(`${home}${data}`, new RegExp(status));
  }
  assert.match(home, /\/boardGovernance\/appointment\/\$\{item\.id\}/);
  assert.match(home, /描述：\{item\.status\}/);
});

test("splits business-registration appointment tasks by department role", async () => {
  const home = await read("./views/TaskHomeView/index.jsx");
  assert.match(home, /const visibleAppointmentTasks = useMemo/);
  assert.match(home, /role === "auditLegalDepartment"/);
  assert.match(home, /item\.status === "待完成工商变更"/);
  assert.match(home, /role === "adminDepartment"/);
  assert.match(home, /item\.status !== "待完成工商变更"/);
  assert.match(home, /records: visibleAppointmentTasks/);
  assert.match(home, /key === "appointment"/);
});

test("submits annual reports into selectable confirmation tasks", async () => {
  const [page, preparation, workspace, home, manager, detail] =
    await Promise.all([
      read("./index.jsx"),
      read("./views/PreparationView/index.jsx"),
      read("./views/DirectorView/components/DutyPlanWorkspace/index.jsx"),
      read("./views/TaskHomeView/index.jsx"),
      read("./views/DutyTaskManagerView/index.jsx"),
      read("./views/AnnualPlanConfirmTaskView/index.jsx"),
    ]);
  assert.match(preparation, /onSubmitAnnualPlanReport/);
  assert.match(workspace, /确认提交年度履职计划报告/);
  assert.match(workspace, /onSubmitAnnualPlanReport\?\.\(annualReport\)/);
  assert.match(
    await read("./views/DirectorView/index.jsx"),
    /onSubmitAnnualPlanReport\?\.\(director, report\)/,
  );
  assert.match(page, /buildAnnualPlanConfirmationTask/);
  assert.match(await read("./dutyPlanData.js"), /id: "PLAN-D08-001"/);
  assert.match(
    page,
    /onSaveAnnualPlanConfirmation=\{saveAnnualPlanConfirmation\}/,
  );
  assert.match(home, /年度履职计划确认\/调整/);
  assert.match(home, /taskType=annual-plan-confirmation&bizId=\$\{task\.id\}/);
  assert.match(manager, /selectedAnnualPlan/);
  assert.match(manager, /<AnnualPlanConfirmTaskView/);
  assert.match(detail, /rowSelection=\{\{/);
  assert.match(detail, /onChange: setSelectedRowIds/);
  assert.match(detail, /确认提交年度履职计划/);
});

test("shows role-specific workbench categories and task tabs", async () => {
  const [page, home, manager] = await Promise.all([
    read("./index.jsx"),
    read("./views/TaskHomeView/index.jsx"),
    read("./views/DutyTaskManagerView/index.jsx"),
  ]);
  assert.match(page, /<TaskHomeView\s+role=\{role\}/);
  assert.match(page, /<DutyTaskManagerView\s+role=\{role\}/);
  assert.match(
    home,
    /if \(role === "director"\) return key === "annual-plan-confirmation"/,
  );
  assert.match(
    home,
    /if \(role === "auditLegalDepartment"\) return key === "appointment"/,
  );
  assert.match(home, /visibleTaskCategories\.map/);
  assert.match(home, /selectedCategoryKey === "annual-plan-confirmation"/);
  assert.match(manager, /role === "director"\s*\? "annual-plan-confirmation"/);
  assert.match(
    manager,
    /role === "director"\s*\? key === "annual-plan-confirmation"\s*: key !== "annual-plan-confirmation"/,
  );
  assert.match(manager, /const visibleAnnualPlanConfirmationTasks = useMemo/);
  assert.match(manager, /task\.id === "ANNUAL-D-08"/);
  assert.match(manager, /rows=\{visibleAnnualPlanConfirmationTasks\}/);
  assert.match(manager, /visibleAnnualPlanConfirmationTasks\.find/);
});

test("annual plan confirmation drawer fits without horizontal table scrolling", async () => {
  const detail = await read("./views/AnnualPlanConfirmTaskView/index.jsx");
  const style = await read(
    "./views/AnnualPlanConfirmTaskView/index.module.less",
  );
  assert.doesNotMatch(detail, /scroll=\{\{\s*x:/);
  assert.match(detail, /tableLayout="fixed"/);
  assert.match(detail, /className: styles\.sequenceColumn/);
  assert.match(style, /overflow-wrap:\s*anywhere/);
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
  assert.match(page, /deleteDutyPlan/);
  assert.match(page, /submitDutyPlan/);
  assert.match(page, /generateDutyTasks/);
  assert.match(taskHome, /年度履职计划确认/);
  assert.match(taskHome, /已确认履职计划任务/);
  assert.match(task, /保存修改/);
  assert.match(task, /提交确认/);
  assert.doesNotMatch(task, /disabled=\{completed\}/);
  assert.match(plan, /label="确认责任人"/);
  assert.match(plan, /保存为草稿/);
  assert.match(plan, /删除计划/);
  assert.match(plan, /提交计划/);
  assert.match(page, /status: "已提交"/);
  assert.match(plan, /去执行/);
  assert.match(plan, /disabled=\{!canGenerateAnnual\}/);
  assert.equal((data.match(/status: "已完成"/g) || []).length, 3);
});

test("shows the annual-plan source details and completion progress in duty tasks", async () => {
  const [manager, planData] = await Promise.all([
    read("./views/DutyTaskManagerView/index.jsx"),
    read("./dutyPlanData.js"),
  ]);
  for (const label of [
    "履职年度",
    "履职季度",
    "确认责任人",
    "年度履职计划基础信息",
    "计划填写完整度",
    "任务办理填写情况",
  ]) {
    assert.match(manager, new RegExp(label));
  }
  for (const planId of ["PLAN-001", "PLAN-002", "PLAN-003"]) {
    const planRecord = planData.slice(
      planData.indexOf(`id: \"${planId}\"`),
      planData.indexOf(`id: \"${planId}\"`) + 1200,
    );
    for (const field of [
      "actualDate",
      "evidenceNote",
      "completionSummary",
      "supplementFiles",
    ]) {
      assert.match(planRecord, new RegExp(field));
    }
  }
});

test("supplements management-stage demo data for every director archive", async () => {
  const director = await read("./views/DirectorView/index.jsx");
  for (const helper of [
    "buildManagementDemoPlans",
    "buildManagementDemoReports",
    "buildManagementDemoSuggestions",
  ]) {
    assert.match(director, new RegExp(helper));
  }
  for (const label of [
    "年度董事会及重点议题审议",
    "公司治理与风险防控专题培训",
    "经营情况专题调研",
  ]) {
    assert.match(director, new RegExp(label));
  }
  assert.match(director, /managementPlans/);
  assert.match(director, /managementReports/);
  assert.match(director, /managementSuggestions/);
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
  assert.match(navigation, /key: "duty-tasks", label: "履职任务"/);
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
  ]) {
    assert.match(director, new RegExp(label));
  }
  assert.doesNotMatch(
    director,
    /key: "handbook", label: "履职手册"|key: "evaluation", label: "评价结果"|key: "appointment", label: "任职记录"/,
  );
  assert.match(report, /自动生成履职报告/);
  assert.match(report, /保存完善内容/);
  assert.match(report, /提交接收/);
  assert.match(report, /接收履职报告/);
  for (const label of [
    "引用履职任务明细",
    "实际完成日期",
    "成果说明",
    "完成情况",
    "佐证材料",
  ]) {
    assert.match(report, new RegExp(label));
  }
  assert.match(page, /taskSnapshots/);
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

test("splits director lifecycle into four independent list and detail pages", async () => {
  const [page, appointment, preparation, management, evaluation] =
    await Promise.all([
      read("./index.jsx"),
      read("./views/AppointmentView/index.jsx"),
      read("./views/PreparationView/index.jsx"),
      read("./views/ManagementView/index.jsx"),
      read("./views/DutyEvaluationStageView/index.jsx"),
    ]);
  assert.match(page, /resolveBoardGovernanceLocation/);
  assert.match(page, /<Navigate to=\{resolved\.redirectTo\} replace \/>/);
  assert.match(page, /AppointmentView/);
  assert.match(page, /PreparationView/);
  assert.match(page, /ManagementView/);
  assert.match(page, /DutyEvaluationStageView/);
  assert.doesNotMatch(page, /<DirectorView/);
  assert.match(appointment, /variant="detail"/);
  assert.match(preparation, /resource === "material"/);
  assert.match(preparation, /resource === "director"/);
  assert.match(preparation, /canOpenPreparationDirector/);
  assert.match(management, /canOpenManagementDirector/);
  assert.match(evaluation, /eligibleEvaluationDirectors/);
  assert.match(evaluation, /发起履职评价/);
});

test("shows each stage detail in a drawer over the list", async () => {
  const [
    drawer,
    drawerStyle,
    appointment,
    preparation,
    management,
    evaluation,
  ] = await Promise.all([
    read("./views/StageDetailDrawer/index.jsx"),
    read("./views/StageDetailDrawer/index.module.less"),
    read("./views/AppointmentView/index.jsx"),
    read("./views/PreparationView/index.jsx"),
    read("./views/ManagementView/index.jsx"),
    read("./views/DutyEvaluationStageView/index.jsx"),
  ]);
  assert.match(drawer, /<Drawer/);
  for (const source of [appointment, preparation, management, evaluation]) {
    assert.match(source, /StageDetailDrawer/);
    assert.match(source, /DirectorStageTable/);
  }
  assert.doesNotMatch(appointment, /返回聘任列表/);
  assert.doesNotMatch(management, /返回履职管理<\/Button>/);
  assert.doesNotMatch(evaluation, /返回评价列表/);
  assert.match(
    appointment,
    /<AppointmentFlow\s+variant="detail"[\s\S]{0,180}embedded/,
  );
  assert.match(evaluation, /<DutyEvaluationWorkspace\s+[\s\S]{0,180}embedded/);
  assert.match(drawerStyle, /overflow-x/);
});

test("keeps stage drawer tables from overflowing the drawer width", async () => {
  const [directorStyle, director, evalWs, evalWsStyle, history] =
    await Promise.all([
      read("./views/DirectorView/index.module.less"),
      read("./views/DirectorView/index.jsx"),
      read("./views/DirectorView/components/DutyEvaluationWorkspace/index.jsx"),
      read(
        "./views/DirectorView/components/DutyEvaluationWorkspace/index.module.less",
      ),
      read("./views/DirectorView/components/MaterialHistoryDrawer/index.jsx"),
    ]);
  assert.match(
    directorStyle,
    /\.compactLayout :global\(\.ant-table\)[\s\S]{0,80}table-layout:\s*fixed/,
  );
  assert.match(
    directorStyle,
    /\.compactLayout[\s\S]{0,240}:global\(\.progress\)[\s\S]{0,40}min-width:\s*0/,
  );
  assert.match(
    director,
    /function SyncedSuggestions[\s\S]{0,1800}title: "操作"[\s\S]{0,120}width: compact/,
  );
  assert.match(evalWs, /scroll=\{embedded \? undefined/);
  assert.match(evalWsStyle, /table-layout:\s*fixed/);
  assert.doesNotMatch(history, /scroll=\{\{ x: 835 \}\}/);
});

test("uses the same director table on every stage list page", async () => {
  const [table, appointment, preparation, management, evaluation] =
    await Promise.all([
      read("./views/DirectorStageTable/index.jsx"),
      read("./views/AppointmentView/index.jsx"),
      read("./views/PreparationView/index.jsx"),
      read("./views/ManagementView/index.jsx"),
      read("./views/DutyEvaluationStageView/index.jsx"),
    ]);
  for (const label of [
    "董事信息",
    "任职企业",
    "任期",
    "当前阶段",
    "风险状态",
    "查看详情",
  ]) {
    assert.match(table, new RegExp(label));
  }
  assert.match(table, /directorTableColumnTitles/);
  assert.match(table, /defaultStage/);
  assert.match(table, /title: "董事类型"/);
  assert.match(table, /title: "负责人"/);
  assert.match(appointment, /appointmentOwner: item\.owner/);
  for (const source of [appointment, preparation, management, evaluation]) {
    assert.match(source, /DirectorStageTable/);
    assert.match(source, /filterDirectorsForStage/);
    assert.match(source, /directorStageDetailPath/);
  }
  assert.doesNotMatch(appointment, /variant="list"/);
  assert.doesNotMatch(preparation, /title="已完成聘任的董事"/);
  assert.doesNotMatch(preparation, /title="年度履职计划"/);
  assert.doesNotMatch(management, /title="履职中的董事"/);
  assert.doesNotMatch(evaluation, /title="评价批次"/);
});

test("shows appointment letter files and removes handoff rules", async () => {
  const [flow, data] = await Promise.all([
    read("./views/DirectorView/components/AppointmentFlow/index.jsx"),
    read("./appointmentData.js"),
  ]);
  assert.match(flow, /label: "推荐函文件"/);
  assert.match(flow, /selected\.letterFileName/);
  assert.match(data, /letterFileName/);
  assert.doesNotMatch(flow, /跨部门交接规则/);
  assert.doesNotMatch(flow, /const handoffs/);
});

test("provides a personnel-maintain style role configuration page", async () => {
  const [page, view, data] = await Promise.all([
    read("./index.jsx"),
    read("./views/RoleConfigView/index.jsx"),
    read("./roleConfigData.js"),
  ]);
  assert.match(page, /RoleConfigView/);
  assert.match(page, /"roles"/);
  assert.match(data, /title: "办公室 · 资料类别",\n\s+hidden: true/);
  assert.match(
    view,
    /subsections\s*\n\s*\.filter\(\(subsection\) => !subsection\.hidden\)/,
  );
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
