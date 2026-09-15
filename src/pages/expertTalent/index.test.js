import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pageSource = readFileSync(
  new URL("./index.jsx", import.meta.url),
  "utf8",
);
const analyticsSource = readFileSync(
  new URL("./components/EvaluationAnalytics/index.jsx", import.meta.url),
  "utf8",
);
const drawerSource = readFileSync(
  new URL("./components/EvaluationRecordsDrawer/index.jsx", import.meta.url),
  "utf8",
);
const shellSource = readFileSync(
  new URL("../../components/AppShell.jsx", import.meta.url),
  "utf8",
);
const routeSource = readFileSync(
  new URL("../../routes.jsx", import.meta.url),
  "utf8",
);
const helpSource = readFileSync(
  new URL("./components/PageHelp/index.jsx", import.meta.url),
  "utf8",
);
const enrollmentSource = readFileSync(
  new URL("./Enrollment.jsx", import.meta.url),
  "utf8",
);
const approvalSource = readFileSync(
  new URL("./ApprovalTasks.jsx", import.meta.url),
  "utf8",
);
const poolSource = readFileSync(
  new URL("./components/CandidatePool/index.jsx", import.meta.url),
  "utf8",
);
const formsSource = readFileSync(
  new URL("./enrollmentForms.js", import.meta.url),
  "utf8",
);
const stageSource = readFileSync(
  new URL("./stages.js", import.meta.url),
  "utf8",
);

test("dashboard mounts the evaluation analytics section", () => {
  assert.match(pageSource, /<EvaluationAnalytics/);
  assert.match(pageSource, /range=\{evaluationRange\}/);
});

test("analytics section exposes the approved metrics and charts", () => {
  for (const label of [
    "平均履约评分",
    "评价优秀率",
    "待回溯项目",
    "观点命中率",
    "评价分布",
    "最近评价记录",
  ])
    assert.match(analyticsSource, new RegExp(label));
  assert.match(analyticsSource, /<svg/);
  assert.match(analyticsSource, /role="img"/);
  assert.match(analyticsSource, /<title>/);
  assert.match(analyticsSource, /评价数据加载失败/);
  assert.match(analyticsSource, /重新加载/);
});

test("recent evaluation records use a filterable wide Drawer", () => {
  assert.match(drawerSource, /title="最近评价记录"/);
  assert.match(drawerSource, /width="72vw"/);
  for (const label of [
    "项目 / 专家搜索",
    "评价结果",
    "回溯状态",
    "评价日期",
    "交付性 50%",
    "响应效率 30%",
    "服务态度 20%",
  ])
    assert.match(drawerSource, new RegExp(label));
  assert.match(drawerSource, /expandedRowRender/);
  assert.match(pageSource, /<EvaluationRecordsDrawer/);
  assert.match(
    pageSource,
    /onOpenRecords=\{\(\) => setEvaluationDrawerOpen\(true\)\}/,
  );
});

test("standalone evaluation menu and route are removed", () => {
  assert.doesNotMatch(shellSource, /key:\s*"\/expertTalentEvaluation"/);
  assert.doesNotMatch(shellSource, /"\/experttalentevaluation"/);
  assert.doesNotMatch(routeSource, /"expertTalentEvaluation"/);
  assert.doesNotMatch(pageSource, /pathname === "\/expertTalentEvaluation"/);
  assert.doesNotMatch(pageSource, /function Evaluation\(/);
});

test("dashboard help describes the integrated evaluation capability", () => {
  assert.match(helpSource, /查看专家及调用指标、评价趋势、观点回溯/);
  assert.doesNotMatch(helpSource, /^\s*评价与回溯:\s*\[/m);
});

test("sidebar uses expert management without a standalone enrollment menu", () => {
  assert.match(shellSource, /title: "专家管理"/);
  assert.doesNotMatch(shellSource, /title: "专家人才库"/);
  assert.doesNotMatch(shellSource, /title: "入库管理"/);
  assert.doesNotMatch(shellSource, /key: "\/expertTalentApplications"/);
  assert.match(shellSource, /"\/experttalentapplications"/);
  assert.match(
    shellSource,
    /normalizedPathname === "\/experttalentapplications"/,
  );
});

test("expert list route renders a tabbed management page", () => {
  assert.match(pageSource, /function ExpertManagement/);
  const management = pageSource.slice(
    pageSource.indexOf("function ExpertManagement"),
  );
  assert.doesNotMatch(management, /wb\.pageHead/);
  assert.doesNotMatch(management, /<h1>\s*专家管理/);
  assert.doesNotMatch(management, /在库档案与入库办理分开管理/);
  assert.doesNotMatch(management, /<Avatar/);
  assert.match(management, /tabBarExtraContent/);
  assert.match(pageSource, /在库专家/);
  assert.match(pageSource, /入库办理（/);
  assert.match(pageSource, /activeKey=\{panel\}/);
  assert.match(pageSource, /onChange=\{setPanel\}/);
  assert.match(
    pageSource,
    /pathname === "\/expertTalentList"\) return <ExpertManagement/,
  );
  assert.doesNotMatch(
    pageSource,
    /pathname === "\/expertTalentList"\) return <ExpertList/,
  );
});

test("old enrollment route redirects onto the enrollment tab once", () => {
  assert.match(routeSource, /"expertTalentApplications"/);
  assert.match(pageSource, /<Navigate/);
  assert.match(pageSource, /to="\/expertTalentList"/);
  assert.match(pageSource, /replace/);
  assert.match(pageSource, /expertManagementTab: "enrollment"/);
  assert.doesNotMatch(
    pageSource,
    /pathname === "\/expertTalentApplications"\) return <Enrollment/,
  );
});

test("invite expert switches to the recommended-name inner tab without changing the url", () => {
  assert.match(pageSource, /setPanel\("enrollment"\)/);
  assert.match(pageSource, /setInnerTab\("pool"\)/);
  assert.doesNotMatch(pageSource, /已进入专家邀请流程/);
  assert.doesNotMatch(pageSource, /前往分管领导审批待办/);
  assert.match(pageSource, /发起合作邀请/);
});

test("enrollment stage filters sit under the matching inner tab", () => {
  assert.doesNotMatch(enrollmentSource, /前往分管领导审批待办/);
  const beforePoolTab = enrollmentSource.slice(
    0,
    enrollmentSource.indexOf('key: "pool"'),
  );
  const invitationsTab = enrollmentSource.slice(
    enrollmentSource.indexOf('key: "invitations"'),
    enrollmentSource.indexOf('key: "sms"'),
  );
  assert.doesNotMatch(beforePoolTab, /全部办理中/);
  assert.match(invitationsTab, /全部办理中/);
  assert.match(invitationsTab, /styles.stageStrip/);
});

test("recommended-name tab filters by pending and transferred invite status", () => {
  assert.match(poolSource, /setStatusFilter/);
  assert.match(poolSource, /styles.stageStrip/);
  assert.match(poolSource, />\s*待邀请\s*</);
  assert.match(poolSource, />\s*已转邀请\s*</);
});

test("dashboard and approval entries open enrollment through location state", () => {
  assert.match(pageSource, /state: \{ expertManagementTab: "enrollment" \}/);
  assert.doesNotMatch(pageSource, /navigate\("\/expertTalentApplications"\)/);
  assert.match(
    approvalSource,
    /state=\{\{ expertManagementTab: "enrollment" \}\}/,
  );
  assert.doesNotMatch(approvalSource, /"\/expertTalentApplications"/);
});

test("enrollment can be embedded with a controlled inner tab and invite trigger", () => {
  assert.match(enrollmentSource, /embedded = false/);
  assert.match(enrollmentSource, /innerTab/);
  assert.match(enrollmentSource, /onInnerTabChange/);
  assert.match(enrollmentSource, /inviteTick/);
  assert.match(enrollmentSource, /openInvite\(\)/);
});

test("expert management help replaces standalone pool and enrollment entries", () => {
  assert.match(helpSource, /专家管理:/);
  assert.doesNotMatch(helpSource, /^\s*专家人才库:\s*\[/m);
  assert.doesNotMatch(helpSource, /^\s*入库管理:\s*\[/m);
});

test("recommended-name tab drops csv import and batch, and classifies source", () => {
  assert.doesNotMatch(poolSource, /CSV文本导入/);
  assert.doesNotMatch(poolSource, /名单批次/);
  assert.match(poolSource, /"内部"/);
  assert.match(poolSource, /"外部"/);
  assert.match(poolSource, /"参股企业"/);
  assert.match(poolSource, /requiredFields = \["name", "gender", "phone"\]/);
});

test("candidate add form and profile identity fields include gender", () => {
  assert.match(poolSource, /\["gender", "性别"\]/);
  assert.match(
    enrollmentSource,
    /profileRequiredFields = \["name", "gender", "birth", "idNo", "phone"\]/,
  );
  assert.match(enrollmentSource, /身份证/);
  assert.match(enrollmentSource, /"联系电话"/);
});

test("enrollment application form follows the paper application layout", () => {
  assert.match(formsSource, /专家姓名/);
  assert.match(formsSource, /职级\/职称/);
  assert.match(formsSource, /最高毕业院校及专业/);
  assert.match(formsSource, /教育背景/);
  assert.match(formsSource, /工作经历/);
  assert.match(formsSource, /资质与证书/);
  assert.match(formsSource, /专长领域与研究方向/);
  assert.match(enrollmentSource, /applicationFromProfile/);
  assert.match(enrollmentSource, /PaperApplication/);
  assert.doesNotMatch(enrollmentSource, /\["necessity", "入库必要性"\]/);
});

test("invite modal drops expiry, makes note optional, and uses chinese cancel", () => {
  assert.doesNotMatch(enrollmentSource, /邀请有效期/);
  assert.match(enrollmentSource, /label="合作邀请说明"/);
  assert.doesNotMatch(
    enrollmentSource,
    /label="合作邀请说明"[\s\S]{0,80}required: true/,
  );
  assert.match(enrollmentSource, /cancelText="取消"/);
});

test("enrollment no longer waits for expert appointment signing or return-for-fix", () => {
  assert.doesNotMatch(stageSource, /^\s*待专家签署:/m);
  assert.doesNotMatch(stageSource, /"待专家签署"/);
  assert.doesNotMatch(enrollmentSource, /待专家签署/);
  assert.doesNotMatch(enrollmentSource, /模拟E签宝回调/);
  assert.doesNotMatch(enrollmentSource, /退回补充/);
  assert.doesNotMatch(enrollmentSource, /我已人工复核该项结果及相关材料/);
  assert.match(enrollmentSource, /填写履历资料|修改履历资料/);
  assert.match(enrollmentSource, /完成资料与申请核对/);
  assert.doesNotMatch(stageSource, /^\s*待补充资料:/m);
  assert.doesNotMatch(stageSource, /"待补充资料"/);
});

test("enrollment drawer shows save and submit only while waiting for confirmation", () => {
  assert.match(enrollmentSource, /footer=\{\s*record\?\.stage === "待确认"/);
  assert.match(enrollmentSource, />保存</);
  assert.match(enrollmentSource, />提交</);
  assert.match(enrollmentSource, /savePendingInvitation/);
  assert.match(enrollmentSource, /submitPendingInvitation/);
});
