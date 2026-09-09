import { useSyncExternalStore } from "react";
import { experts, tasks } from "./data";

const KEY = "expert-talent-pc-v2";
export const demoNotice =
  "本地前端演示：数据仅保存在当前浏览器；短信、审批及小程序同步均未接真实服务。";

export const people = [
  {
    id: "P1",
    name: "张明",
    phone: "13800005208",
    company: "示例研究机构",
    title: "首席研究员",
    source: "研究院推荐",
  },
  {
    id: "P2",
    name: "许文博",
    phone: "13800005209",
    company: "机器人研究院（演示）",
    title: "副院长",
    source: "部门推荐",
  },
  {
    id: "P3",
    name: "唐欣然",
    phone: "13800005210",
    company: "汽车软件公司（演示）",
    title: "技术总监",
    source: "被投企业推荐",
  },
];
const profile = {
  name: "许文博",
  gender: "男",
  birth: "1978-03-16",
  idType: "身份证",
  idNo: "演示号码（非真实证件）",
  email: "xuwenbo@example.com",
  company: "机器人研究院（演示）",
  position: "副院长",
  education: "博士 / 示例大学 / 机械电子工程",
  educationPeriod: "1998—2007，本硕博阶段",
  experience: "2007—2015：智能装备研究所研究员；2015年至今：机器人研究院副院长",
  years: "19",
  category: "产业研究专家",
  domain: "机器人 / 具身智能",
  keywords: "机器人本体、运动控制、具身智能、产业化",
  projects:
    "具身智能产业研究项目，担任技术评审与产业顾问；智能机器人产业化项目，负责技术路线评估",
  roles: "技术咨询、投前尽调、项目评审",
  certificates: "研究员职称证书 / 长期有效；机器人相关发明专利证明",
  results: "机器人产业研究报告、重大项目评审成果、示例科技进步奖",
  city: "长春 / 可全国服务",
  service: "线上会议、现场评审 / 工作日下午",
  travel: "可接受短期出差",
  attachment: "学历证明.pdf；职称证书.pdf；代表成果清单.pdf（均为模拟附件）",
  consent: true,
};
const checks = [
  {
    key: "completeness",
    name: "资料完整性",
    result: "通过",
    detail: "必填资料、履历及证明材料齐全",
    confirmed: false,
  },
  {
    key: "admission",
    name: "准入条件",
    result: "通过",
    detail: "从业年限、专业经历满足演示准入规则",
    confirmed: false,
  },
  {
    key: "compliance",
    name: "关联与合规",
    result: "需人工核实",
    detail: "未发现明确冲突，仍需经办人核实关联关系",
    confirmed: false,
  },
];
const recommendation = {
  batch: "2026年首批推荐名单",
  name: "许文博",
  company: "机器人研究院（演示）",
  title: "副院长",
  phone: "13800005209",
  source: "需求部门推荐",
  department: "战略投资部",
  recommender: "李经理",
  project: "具身智能产业研究",
  field: "机器人",
  reason: "具备产业研究和重大项目评审经验",
};
const seed = {
  experts,
  candidates: [
    {
      id: "CAND-001",
      ...recommendation,
      status: "已转邀请",
      invitationId: "INV-DEMO-2",
    },
    {
      id: "CAND-002",
      batch: "2026年首批推荐名单",
      name: "陈书远",
      company: "智能网联研究中心",
      title: "主任",
      phone: "13800005211",
      source: "项目推荐",
      department: "投资一部",
      recommender: "王经理",
      project: "智能驾驶产业链研究",
      field: "智能驾驶",
      reason: "拥有智能驾驶产业与技术研判经验",
      status: "待邀请",
    },
    {
      id: "CAND-003",
      batch: "2026年储备名单",
      name: "林若岚",
      company: "某会计师事务所",
      title: "合伙人",
      phone: "13800005212",
      source: "业务部门推荐",
      department: "财务管理部",
      recommender: "赵主管",
      project: "并购估值复核",
      field: "财务审计",
      reason: "熟悉并购估值和上市公司财务审计",
      status: "待邀请",
    },
  ],
  invitations: [
    {
      ...people[0],
      id: "INV-DEMO-1",
      personId: "P1",
      field: "动力电池",
      reason: "邀请参与技术咨询",
      letterNo: "YQH-2026-001",
      letterTemplate: "专家合作邀请函（标准版）",
      expiry: "2026-09-30",
      stage: "待确认",
      agreed: false,
      submitted: false,
      history: [],
    },
    {
      ...people[1],
      ...recommendation,
      id: "INV-DEMO-2",
      personId: "P2",
      field: "机器人",
      reason: "演示完整资料提交后的核对流程",
      letterNo: "YQH-2026-002",
      letterTemplate: "专家合作邀请函（标准版）",
      expiry: "2026-09-30",
      stage: "待资料核对",
      agreed: true,
      submitted: true,
      profile,
      application: null,
      checks,
      history: [
        {
          at: "2026-09-04",
          actor: "演示专家·许文博",
          text: "同意合作邀请，填写完整履历并正式提交",
        },
      ],
    },
  ],
  sms: [],
  tasks: tasks.map((task, index) => {
    const signed = ["服务中", "待验收", "待评价"].includes(task.stage);
    const consultationRecord = signed
      ? {
          consultDate:
            ["2026-09-05", "2026-09-03", "2026-08-29"][index] || "2026-09-02",
          minutes: [120, 180, 90][index] || 120,
          purpose: `${task.project}项目关键问题咨询，辅助需求部门形成投资与业务判断。`,
          questions:
            "1. 当前技术或业务方案的成熟度如何？\n专家答复：核心方案已经完成验证，但规模化应用仍需关注供应链和成本。\n2. 项目主要风险是什么？\n专家答复：需重点核查量产能力、客户验证进度及关键资源保障。",
          facts:
            "行业处于规模化应用前期，头部企业已开展示范项目，核心环节仍存在成本和产能约束。",
          judgment:
            "项目方向具备中长期价值，短期商业化节奏应保持审慎，建议分阶段验证。",
          basis:
            "判断依据包括行业增速、客户验证情况、技术成熟度、竞争格局及供应链稳定性。",
          risks:
            "量产进度不及预期、核心零部件依赖、成本下降速度和客户订单兑现风险。",
          suggestions:
            "补充客户访谈，核验产线与订单，设置阶段性投资条件并持续跟踪关键指标。",
          attachment: `咨询记录-${task.id}.pdf（演示）`,
          archiveNo: `ZXJL-2026-${String(index + 1).padStart(3, "0")}`,
          remark: "E签宝声明签署完成后形成的演示咨询记录。",
        }
      : null;
    return {
      ...task,
      background: "产业投资项目技术研究（演示）",
      problem: "技术成熟度及商业化风险",
      serviceTime: "2026-09-08 14:00",
      serviceMode: "会议形式",
      applicant: "郑华峰",
      delivery: "书面报告及风险清单",
      materials: "项目摘要（模拟材料）",
      permission: "仅受邀且完成承诺的专家可查看",
      commitment: signed
        ? {
            id: `ESIGN-CALL-DEMO-${String(index + 1).padStart(3, "0")}`,
            platform: "E签宝",
            status: "已签署",
            createdAt: "2026-09-01 09:30:00",
            callbackAt: "2026-09-01 10:06:18",
            signedAt: "2026-09-01 10:06:18",
            expiresAt: "2026-09-15",
            conflict: "不存在",
          }
        : null,
      consultationRecord,
      versions:
        task.stage === "待验收"
          ? [
              {
                number: 1,
                at: "2026-09-03",
                content: consultationRecord?.judgment,
                attachment: consultationRecord?.attachment,
              },
            ]
          : [],
      history: signed
        ? [
            {
              at: "2026-09-01 10:06:18",
              actor: "E签宝回调（演示）",
              text: "专家声明已签署，成果与验收已解锁",
            },
          ]
        : [],
      acceptance: [],
    };
  }),
};
function normalize(saved) {
  if (
    !saved ||
    !Array.isArray(saved.invitations) ||
    !Array.isArray(saved.tasks)
  )
    return structuredClone(seed);
  const next = {
    ...structuredClone(seed),
    ...saved,
    candidates: Array.isArray(saved.candidates)
      ? saved.candidates
      : structuredClone(seed.candidates),
    sms: Array.isArray(saved.sms) ? saved.sms : [],
  };
  const savedExperts = Array.isArray(saved.experts) ? saved.experts : [];
  next.experts = structuredClone(experts).map((fallback) => {
    const existing = savedExperts.find((item) => item.id === fallback.id);
    const migrated = { ...fallback, ...(existing || {}) };
    migrated.highLevel =
      typeof migrated.highLevel === "boolean"
        ? migrated.highLevel
        : String(migrated.category || "").includes("高层次");
    migrated.appointmentHistory = Array.isArray(migrated.appointmentHistory)
      ? migrated.appointmentHistory
      : [];
    migrated.history = Array.isArray(migrated.history) ? migrated.history : [];
    return migrated;
  });
  savedExperts
    .filter((item) => !next.experts.some((expert) => expert.id === item.id))
    .forEach((item) =>
      next.experts.push({
        ...item,
        highLevel: Boolean(item.highLevel),
        appointmentHistory: Array.isArray(item.appointmentHistory)
          ? item.appointmentHistory
          : [],
        history: Array.isArray(item.history) ? item.history : [],
      }),
    );
  next.invitations = next.invitations.map((item) => {
    const migrated = { ...item };
    if (migrated.stage === "待总办会审议") migrated.stage = "领导审批中";
    if (migrated.stage === "总办会通过·待聘任") migrated.stage = "待签发聘书";
    if (migrated.stage === "总办会未通过") migrated.stage = "审批退回";
    delete migrated.meeting;
    migrated.history = Array.isArray(migrated.history) ? migrated.history : [];
    if (migrated.id === "INV-DEMO-2")
      migrated.profile = { ...profile, ...(migrated.profile || {}) };
    return migrated;
  });
  next.tasks = next.tasks.map((task) => {
    const demo = seed.tasks.find((item) => item.id === task.id);
    if (!demo) return task;
    const shouldShowSignedDemo = ["服务中", "待验收", "待评价"].includes(
      task.stage,
    );
    if (!shouldShowSignedDemo || task.commitment) return task;
    return {
      ...task,
      serviceMode: task.serviceMode || demo.serviceMode,
      applicant: task.applicant || demo.applicant,
      commitment: structuredClone(demo.commitment),
      consultationRecord:
        task.consultationRecord || structuredClone(demo.consultationRecord),
      versions: task.versions?.length
        ? task.versions
        : structuredClone(demo.versions),
      history: [...(task.history || []), ...structuredClone(demo.history)],
    };
  });
  return next;
}
let state;
try {
  state = normalize(JSON.parse(localStorage.getItem(KEY)));
} catch {
  state = structuredClone(seed);
}
const listeners = new Set();
window.addEventListener("storage", (event) => {
  if (event.key !== KEY || !event.newValue) return;
  try {
    state = normalize(JSON.parse(event.newValue));
    listeners.forEach((listener) => listener());
  } catch {
    /* ignore malformed cross-tab data */
  }
});
export function updateStore(mutator) {
  const next = structuredClone(state);
  mutator(next);
  localStorage.setItem(KEY, JSON.stringify(next));
  state = next;
  listeners.forEach((listener) => listener());
}
export function useExpertStore() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
  );
}
export const uid = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
export const log = (actor, text) => ({
  at: new Date().toLocaleString("zh-CN"),
  actor,
  text,
});
export const complete = (record) => {
  if (record?.agreed !== true || record?.submitted !== true) return false;
  const fullMobileProfile =
    [
      "name",
      "gender",
      "birth",
      "idType",
      "idNo",
      "email",
      "company",
      "position",
      "education",
      "educationPeriod",
      "experience",
      "years",
      "category",
      "domain",
      "keywords",
      "projects",
      "roles",
      "certificates",
      "results",
      "city",
      "service",
      "travel",
    ].every(
      (key) =>
        typeof record.profile?.[key] === "string" && record.profile[key].trim(),
    ) && record.profile?.consent === true;
  const legacyProfile =
    [
      "education",
      "experience",
      "capability",
      "achievements",
      "willingness",
    ].every(
      (key) =>
        typeof record.profile?.[key] === "string" && record.profile[key].trim(),
    ) && record.profile?.declaration === true;
  return fullMobileProfile || legacyProfile;
};
export const applicationComplete = (record) =>
  [
    "project",
    "necessity",
    "abilityEvaluation",
    "suggestedCategory",
    "suggestedLevel",
    "suggestedRole",
    "leaderOpinion",
  ].every(
    (key) =>
      typeof record?.application?.[key] === "string" &&
      record.application[key].trim(),
  );
export const checksConfirmed = (record) =>
  Array.isArray(record?.checks) &&
  record.checks.length === 3 &&
  record.checks.every((item) => item.confirmed && item.result !== "不通过");
