import { useSyncExternalStore } from "react";
import { experts, tasks } from "./data";
import {
  applicationFormComplete,
  applicationFromProfile,
  profileRequiredComplete,
} from "./enrollmentForms";

const KEY = "expert-talent-pc-v6";
export const demoNotice =
  "本地前端演示：数据仅保存在当前浏览器；短信、审批及小程序同步均未接真实服务。";

export const people = [
  {
    id: "P1",
    name: "张明",
    gender: "男",
    phone: "13800005208",
    company: "示例研究机构",
    title: "首席研究员",
    source: "外部",
  },
  {
    id: "P2",
    name: "许文博",
    gender: "男",
    phone: "13800005209",
    company: "机器人研究院（演示）",
    title: "副院长",
    source: "内部",
  },
  {
    id: "P3",
    name: "唐欣然",
    gender: "女",
    phone: "13800005210",
    company: "汽车软件公司（演示）",
    title: "技术总监",
    source: "参股企业",
  },
  {
    id: "P4",
    name: "陈书远",
    gender: "男",
    phone: "13800005211",
    company: "智能网联研究中心",
    title: "主任",
    source: "内部",
  },
  {
    id: "P5",
    name: "高成宇",
    gender: "男",
    phone: "13800005213",
    company: "海外市场研究院（演示）",
    title: "研究员",
    source: "外部",
  },
  {
    id: "P6",
    name: "邹雨桐",
    gender: "女",
    phone: "13800005214",
    company: "绿色发展研究中心",
    title: "副主任",
    source: "内部",
  },
  {
    id: "P7",
    name: "何启航",
    gender: "男",
    phone: "13800005215",
    company: "动力电池创新中心",
    title: "首席工程师",
    source: "内部",
  },
  {
    id: "P8",
    name: "沈若溪",
    gender: "女",
    phone: "13800005216",
    company: "汽车电子联合实验室",
    title: "技术总监",
    source: "外部",
  },
  {
    id: "P9",
    name: "马知远",
    gender: "男",
    phone: "13800005217",
    company: "产业投资咨询公司",
    title: "合伙人",
    source: "内部",
  },
];
const profile = {
  name: "许文博",
  gender: "男",
  birth: "1978-03-16",
  idType: "身份证",
  idNo: "22010219780316001X",
  phone: "13800005209",
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
    confirmed: true,
  },
  {
    key: "admission",
    name: "准入条件",
    result: "通过",
    detail: "从业年限、专业经历满足演示准入规则",
    confirmed: true,
  },
  {
    key: "compliance",
    name: "关联与合规",
    result: "通过",
    detail: "未发现明确冲突",
    confirmed: true,
  },
];
const recommendation = {
  batch: "2026年首批推荐名单",
  name: "许文博",
  gender: "男",
  company: "机器人研究院（演示）",
  title: "副院长",
  phone: "13800005209",
  source: "内部",
  department: "战略投资部",
  recommender: "李经理",
  project: "具身智能产业研究",
  field: "机器人",
  reason: "具备产业研究和重大项目评审经验",
};
function makeProfile(overrides = {}) {
  const person =
    people.find((item) => item.name === (overrides.name || profile.name)) ||
    people[1];
  const birth = overrides.birth || profile.birth;
  return {
    ...profile,
    name: person.name,
    gender: person.gender,
    phone: person.phone,
    company: person.company,
    position: person.title,
    idNo: `220102${String(birth).replaceAll("-", "")}001X`,
    ...overrides,
  };
}
function dossier(profileOverrides = {}) {
  const nextProfile = makeProfile(profileOverrides);
  const person = people.find((item) => item.name === nextProfile.name) || {};
  return {
    profile: nextProfile,
    application: applicationFromProfile({ ...person, profile: nextProfile }),
  };
}
const femaleNames = new Set([
  "唐欣然",
  "邹雨桐",
  "沈若溪",
  "林若岚",
  "陆青禾",
  "裴南星",
]);
function withGender(item) {
  return {
    ...item,
    gender: item.gender || (femaleNames.has(item.name) ? "女" : "男"),
  };
}
function confirmedChecks() {
  return checks.map((item) => ({
    ...item,
    confirmed: true,
    confirmedAt: "2026-09-05 10:20:00",
  }));
}
function makeAppointment(overrides = {}) {
  return {
    number: "PS-2026-001",
    termStart: "2026-09-08",
    termEnd: "2029-09-07",
    years: 3,
    signingDeadline: "2026-09-23",
    attachment: "专家聘书-待签署.pdf",
    status: "已生效",
    sentAt: "2026-09-07 14:20:00",
    ageLimit: 65,
    ageLimitDate: "2043-03-16",
    ...overrides,
  };
}
function invitationHistory(entries) {
  return entries.map(([at, actor, text]) => ({ at, actor, text }));
}
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
      source: "内部",
      department: "投资一部",
      recommender: "王经理",
      project: "智能驾驶产业链研究",
      field: "智能驾驶",
      reason: "拥有智能驾驶产业与技术研判经验",
      status: "已转邀请",
      invitationId: "INV-DEMO-4",
    },
    {
      id: "CAND-003",
      batch: "2026年储备名单",
      name: "林若岚",
      company: "某会计师事务所",
      title: "合伙人",
      phone: "13800005212",
      source: "内部",
      department: "财务管理部",
      recommender: "赵主管",
      project: "并购估值复核",
      field: "财务审计",
      reason: "熟悉并购估值和上市公司财务审计",
      status: "待邀请",
    },
    {
      id: "CAND-010",
      batch: "2026年储备名单",
      name: "江衡",
      company: "智能制造产业联盟",
      title: "秘书长",
      phone: "13800005218",
      source: "内部",
      department: "投资二部",
      recommender: "周经理",
      project: "智能工厂改造评估",
      field: "智能制造",
      reason: "熟悉数字孪生、工业机器人和产线改造路径",
      status: "待邀请",
    },
    {
      id: "CAND-011",
      batch: "2026年储备名单",
      name: "陆青禾",
      company: "供应链研究中心",
      title: "主任研究员",
      phone: "13800005219",
      source: "内部",
      department: "综合管理部",
      recommender: "赵主管",
      project: "商用车供应链韧性评估",
      field: "供应链",
      reason: "长期研究汽车零部件供应安全和成本结构",
      status: "待邀请",
    },
    {
      id: "CAND-012",
      batch: "2026年补充名单",
      name: "曹予安",
      company: "国际汽车合规中心",
      title: "资深顾问",
      phone: "13800005220",
      source: "外部",
      department: "战略投资部",
      recommender: "李经理",
      project: "出口数据合规尽调",
      field: "海外合规",
      reason: "具备出口管制、数据跨境和海外投资合规经验",
      status: "待邀请",
    },
    {
      id: "CAND-013",
      batch: "2026年补充名单",
      name: "裴南星",
      company: "新能源材料研究中心",
      title: "研究员",
      phone: "13800005221",
      source: "参股企业",
      department: "投资一部",
      recommender: "王经理",
      project: "固态电池材料体系评估",
      field: "新能源材料",
      reason: "熟悉固态电池材料路线和失效分析",
      status: "待邀请",
    },
    {
      id: "CAND-014",
      batch: "2026年储备名单",
      name: "尹昭宁",
      company: "华信会计师事务所",
      title: "合伙人",
      phone: "13800005222",
      source: "内部",
      department: "财务管理部",
      recommender: "赵主管",
      project: "并购标的财务尽调",
      field: "财务审计",
      reason: "熟悉并购审计、估值复核和内控诊断",
      status: "待邀请",
    },
    {
      id: "CAND-015",
      batch: "2026年补充名单",
      name: "韩沐川",
      company: "商用车技术研究院",
      title: "副总工程师",
      phone: "13800005223",
      source: "内部",
      department: "投资二部",
      recommender: "周经理",
      project: "商用车节能技术评审",
      field: "商用车",
      reason: "具备整车开发、可靠性和节能技术评审经验",
      status: "待邀请",
    },
    {
      id: "CAND-004",
      batch: "2026年首批推荐名单",
      name: "唐欣然",
      company: "汽车软件公司（演示）",
      title: "技术总监",
      phone: "13800005210",
      source: "参股企业",
      department: "投资二部",
      recommender: "周经理",
      project: "汽车软件架构评估",
      field: "汽车软件",
      reason: "熟悉域控制器与基础软件架构",
      status: "已转邀请",
      invitationId: "INV-DEMO-3",
    },
    {
      id: "CAND-005",
      batch: "2026年补充名单",
      name: "高成宇",
      company: "海外市场研究院（演示）",
      title: "研究员",
      phone: "13800005213",
      source: "外部",
      department: "战略投资部",
      recommender: "李经理",
      project: "海外市场准入研究",
      field: "海外市场",
      reason: "具备出口与海外投资研究经验",
      status: "已转邀请",
      invitationId: "INV-DEMO-5",
    },
    {
      id: "CAND-006",
      batch: "2026年补充名单",
      name: "邹雨桐",
      company: "绿色发展研究中心",
      title: "副主任",
      phone: "13800005214",
      source: "内部",
      department: "战略投资部",
      recommender: "孙主管",
      project: "ESG与双碳专题",
      field: "ESG与双碳",
      reason: "长期从事碳核算与绿色金融研究",
      status: "已转邀请",
      invitationId: "INV-DEMO-6",
    },
    {
      id: "CAND-007",
      batch: "2026年补充名单",
      name: "何启航",
      company: "动力电池创新中心",
      title: "首席工程师",
      phone: "13800005215",
      source: "内部",
      department: "投资一部",
      recommender: "王经理",
      project: "动力电池标的技术尽调",
      field: "新能源动力",
      reason: "熟悉电芯、热管理与量产工艺",
      status: "已转邀请",
      invitationId: "INV-DEMO-7",
    },
    {
      id: "CAND-008",
      batch: "2026年补充名单",
      name: "沈若溪",
      company: "汽车电子联合实验室",
      title: "技术总监",
      phone: "13800005216",
      source: "外部",
      department: "战略投资部",
      recommender: "李经理",
      project: "汽车芯片国产化研判",
      field: "汽车电子",
      reason: "具备芯片与域控制器技术评审经验",
      status: "已转邀请",
      invitationId: "INV-DEMO-8",
    },
    {
      id: "CAND-009",
      batch: "2026年补充名单",
      name: "马知远",
      company: "产业投资咨询公司",
      title: "合伙人",
      phone: "13800005217",
      source: "内部",
      department: "综合管理部",
      recommender: "赵主管",
      project: "参股企业治理机制优化",
      field: "公司治理",
      reason: "熟悉国企治理与三会运作",
      status: "已转邀请",
      invitationId: "INV-DEMO-9",
    },
  ].map(withGender),
  invitations: [
    {
      ...people[0],
      id: "INV-DEMO-1",
      personId: "P1",
      field: "动力电池",
      project: "动力电池技术咨询",
      department: "投资一部",
      reason: "邀请参与技术咨询",
      letterNo: "YQH-2026-001",
      letterTemplate: "专家合作邀请函（标准版）",
      expiry: "2026-09-30",
      stage: "资料完善中",
      agreed: false,
      submitted: false,
      history: invitationHistory([
        [
          "2026-09-01 09:12:00",
          "股权运营部（演示）",
          "发送《专家合作邀请函（标准版）》YQH-2026-001；短信仅作小程序查看通知",
        ],
      ]),
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
      stage: "资料完善中",
      agreed: true,
      submitted: true,
      profile,
      application: null,
      checks,
      history: invitationHistory([
        [
          "2026-09-02 10:00:00",
          "股权运营部（演示）",
          "发送《专家合作邀请函（标准版）》YQH-2026-002",
        ],
        [
          "2026-09-04 16:20:00",
          "演示专家·许文博",
          "同意合作邀请，填写完整履历并正式提交",
        ],
      ]),
    },
    {
      ...people[2],
      id: "INV-DEMO-3",
      personId: "P3",
      field: "汽车软件",
      project: "汽车软件架构评估",
      department: "投资二部",
      reason: "熟悉域控制器与基础软件架构",
      letterNo: "YQH-2026-003",
      letterTemplate: "专家合作邀请函（标准版）",
      expiry: "2026-09-30",
      stage: "资料完善中",
      agreed: true,
      submitted: true,
      ...dossier({
        name: "唐欣然",
        birth: "1982-07-21",
        email: "tangxinran@example.com",
        company: "汽车软件公司（演示）",
        position: "技术总监",
        category: "技术研发专家",
        domain: "汽车软件 / 基础软件",
        keywords: "域控制器、AUTOSAR、软件架构",
        years: "16",
      }),
      checks,
      history: invitationHistory([
        ["2026-09-03 11:00:00", "演示专家·唐欣然", "同意合作邀请"],
        ["2026-09-05 09:40:00", "股权运营部（演示）", "填写并保存专家履历资料"],
      ]),
    },
    {
      ...people[3],
      id: "INV-DEMO-4",
      personId: "P4",
      field: "智能驾驶",
      project: "智能驾驶产业链研究",
      department: "投资一部",
      reason: "拥有智能驾驶产业与技术研判经验",
      letterNo: "YQH-2026-004",
      letterTemplate: "专家合作邀请函（标准版）",
      expiry: "2026-09-30",
      stage: "核对完成",
      agreed: true,
      submitted: true,
      ...dossier({
        name: "陈书远",
        birth: "1976-11-02",
        email: "chenshuyuan@example.com",
        company: "智能网联研究中心",
        position: "主任",
        category: "产业研究专家",
        domain: "智能网联 / 智能驾驶",
        keywords: "智能驾驶、车路云、测试评价",
        years: "20",
      }),
      checks: confirmedChecks(),
      history: invitationHistory([
        [
          "2026-09-03 14:10:00",
          "演示专家·陈书远",
          "同意合作邀请，填写完整履历并正式提交",
        ],
        [
          "2026-09-06 10:05:00",
          "需求部门（演示）",
          "填写并提交正式《专家入库申请表》",
        ],
        [
          "2026-09-06 15:30:00",
          "股权运营部（演示）",
          "完成入库资料与人工校验核对：资料齐全，准入条件满足",
        ],
      ]),
    },
    {
      ...people[4],
      id: "INV-DEMO-5",
      personId: "P5",
      field: "海外市场",
      project: "海外市场准入研究",
      department: "战略投资部",
      reason: "具备出口与海外投资研究经验",
      letterNo: "YQH-2026-005",
      letterTemplate: "专家合作邀请函（标准版）",
      expiry: "2026-09-30",
      stage: "领导审批中",
      agreed: true,
      submitted: true,
      flowId: "FLOW-2026-005",
      ...dossier({
        name: "高成宇",
        birth: "1980-04-18",
        email: "gaochengyu@example.com",
        company: "海外市场研究院（演示）",
        position: "研究员",
        category: "产业研究专家",
        domain: "海外市场 / 出口合规",
        keywords: "海外投资、出口管制、区域市场",
        years: "15",
      }),
      checks: confirmedChecks(),
      history: invitationHistory([
        [
          "2026-09-04 09:20:00",
          "演示专家·高成宇",
          "同意合作邀请，填写完整履历并正式提交",
        ],
        [
          "2026-09-06 11:00:00",
          "需求部门（演示）",
          "填写并提交正式《专家入库申请表》",
        ],
        [
          "2026-09-07 09:15:00",
          "股权运营部（演示）",
          "完成入库资料与人工校验核对：可发起审批",
        ],
        [
          "2026-09-07 14:40:00",
          "股权运营部（演示）",
          "发起分管领导线上审批：海外业务专家储备紧缺，建议通过",
        ],
      ]),
    },
    {
      ...people[5],
      id: "INV-DEMO-6",
      personId: "P6",
      field: "ESG与双碳",
      project: "ESG与双碳专题",
      department: "战略投资部",
      reason: "长期从事碳核算与绿色金融研究",
      letterNo: "YQH-2026-006",
      letterTemplate: "专家合作邀请函（标准版）",
      expiry: "2026-09-30",
      stage: "审批退回",
      agreed: true,
      submitted: true,
      ...dossier({
        name: "邹雨桐",
        birth: "1979-08-09",
        email: "zouyutong@example.com",
        company: "绿色发展研究中心",
        position: "副主任",
        category: "产业研究专家",
        domain: "ESG与双碳",
        keywords: "碳核算、绿色金融、ESG",
        years: "17",
      }),
      checks: confirmedChecks(),
      history: invitationHistory([
        [
          "2026-09-04 16:00:00",
          "演示专家·邹雨桐",
          "同意合作邀请，填写完整履历并正式提交",
        ],
        [
          "2026-09-06 16:40:00",
          "需求部门（演示）",
          "填写并提交正式《专家入库申请表》",
        ],
        [
          "2026-09-07 10:10:00",
          "股权运营部（演示）",
          "完成入库资料与人工校验核对：资料完整",
        ],
        [
          "2026-09-07 15:00:00",
          "股权运营部（演示）",
          "发起分管领导线上审批：拟补充双碳领域专家",
        ],
        [
          "2026-09-08 09:30:00",
          "分管领导（线上审批演示）",
          "审批退回：请补充近三年代表性项目及利益关联说明后重新提交",
        ],
      ]),
    },
    {
      ...people[6],
      id: "INV-DEMO-7",
      personId: "P7",
      field: "新能源动力",
      project: "动力电池标的技术尽调",
      department: "投资一部",
      reason: "熟悉电芯、热管理与量产工艺",
      letterNo: "YQH-2026-007",
      letterTemplate: "专家合作邀请函（标准版）",
      expiry: "2026-09-30",
      stage: "待签发聘书",
      agreed: true,
      submitted: true,
      flowId: "FLOW-2026-007",
      ...dossier({
        name: "何启航",
        birth: "1974-01-25",
        email: "heqihang@example.com",
        company: "动力电池创新中心",
        position: "首席工程师",
        category: "技术研发专家",
        domain: "新能源动力 / 动力电池",
        keywords: "动力电池、热管理、量产工艺",
        years: "21",
      }),
      checks: confirmedChecks(),
      history: invitationHistory([
        [
          "2026-09-02 13:20:00",
          "演示专家·何启航",
          "同意合作邀请，填写完整履历并正式提交",
        ],
        [
          "2026-09-05 11:20:00",
          "需求部门（演示）",
          "填写并提交正式《专家入库申请表》",
        ],
        [
          "2026-09-06 09:50:00",
          "股权运营部（演示）",
          "完成入库资料与人工校验核对：准入条件满足",
        ],
        [
          "2026-09-06 16:10:00",
          "股权运营部（演示）",
          "发起分管领导线上审批：动力电池领域急需补充专家",
        ],
        [
          "2026-09-08 10:05:00",
          "分管领导（线上审批演示）",
          "审批通过，进入待签发聘书",
        ],
      ]),
    },
    {
      ...people[7],
      id: "INV-DEMO-8",
      personId: "P8",
      field: "汽车电子",
      project: "汽车芯片国产化研判",
      department: "战略投资部",
      reason: "具备芯片与域控制器技术评审经验",
      letterNo: "YQH-2026-008",
      letterTemplate: "专家合作邀请函（标准版）",
      expiry: "2026-09-30",
      stage: "已正式入库",
      agreed: true,
      submitted: true,
      flowId: "FLOW-2026-008",
      ...dossier({
        name: "沈若溪",
        birth: "1977-06-14",
        email: "shenruoxi@example.com",
        company: "汽车电子联合实验室",
        position: "技术总监",
        category: "技术研发专家",
        domain: "汽车电子 / 芯片",
        keywords: "汽车芯片、域控制器、国产化",
        years: "18",
      }),
      checks: confirmedChecks(),
      appointment: makeAppointment({
        number: "PS-2026-008",
        attachment: "专家聘书-沈若溪-待签署.pdf",
      }),
      history: invitationHistory([
        [
          "2026-09-03 10:40:00",
          "演示专家·沈若溪",
          "同意合作邀请，填写完整履历并正式提交",
        ],
        [
          "2026-09-05 15:10:00",
          "需求部门（演示）",
          "填写并提交正式《专家入库申请表》",
        ],
        [
          "2026-09-06 11:25:00",
          "股权运营部（演示）",
          "完成入库资料与人工校验核对：资料齐全",
        ],
        [
          "2026-09-06 17:00:00",
          "股权运营部（演示）",
          "发起分管领导线上审批：芯片领域专家紧缺",
        ],
        [
          "2026-09-08 09:10:00",
          "分管领导（线上审批演示）",
          "审批通过，进入待签发聘书",
        ],
        [
          "2026-09-08 11:30:00",
          "股权运营部（演示）",
          "向专家发送聘书：PS-2026-008，聘期2026-09-08至2029-09-07，专家正式入库",
        ],
      ]),
    },
    {
      ...people[8],
      id: "INV-DEMO-9",
      personId: "P9",
      field: "公司治理",
      project: "参股企业治理机制优化",
      department: "综合管理部",
      reason: "熟悉国企治理与三会运作",
      letterNo: "YQH-2026-009",
      letterTemplate: "专家合作邀请函（标准版）",
      expiry: "2026-09-30",
      stage: "已正式入库",
      agreed: true,
      submitted: true,
      flowId: "FLOW-2026-009",
      ...dossier({
        name: "马知远",
        birth: "1971-12-03",
        email: "mazhiyuan@example.com",
        company: "产业投资咨询公司",
        position: "合伙人",
        category: "财务法务专家",
        domain: "公司治理 / 合规风控",
        keywords: "国企治理、三会管理、合规风控",
        years: "24",
      }),
      checks: confirmedChecks(),
      appointment: makeAppointment({
        number: "PS-2026-009",
        status: "已生效",
        signedAt: "2026-09-08",
        completedAt: "2026-09-08 16:18:00",
        attachment: "专家聘书-马知远.pdf",
      }),
      history: invitationHistory([
        [
          "2026-09-01 15:00:00",
          "演示专家·马知远",
          "同意合作邀请，填写完整履历并正式提交",
        ],
        [
          "2026-09-03 10:00:00",
          "需求部门（演示）",
          "填写并提交正式《专家入库申请表》",
        ],
        [
          "2026-09-04 09:40:00",
          "股权运营部（演示）",
          "完成入库资料与人工校验核对：资料完整",
        ],
        [
          "2026-09-04 14:20:00",
          "股权运营部（演示）",
          "发起分管领导线上审批：治理类专家匹配当前项目",
        ],
        [
          "2026-09-06 11:00:00",
          "分管领导（线上审批演示）",
          "审批通过，进入待签发聘书",
        ],
        [
          "2026-09-07 09:50:00",
          "股权运营部（演示）",
          "向专家发送聘书：PS-2026-009，聘期2026-09-08至2029-09-07，通过E签宝签署",
        ],
        [
          "2026-09-08 16:18:00",
          "E签宝（签署回调演示）",
          "专家完成聘书PS-2026-009签署，公司与专家签订完成，正式入库",
        ],
      ]),
    },
  ],
  sms: [],
  tasks: tasks.map(enrichDemoTask),
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
    if (["待确认", "待资料核对", "待补充资料"].includes(migrated.stage))
      migrated.stage = "资料完善中";
    delete migrated.meeting;
    migrated.history = Array.isArray(migrated.history) ? migrated.history : [];
    if (migrated.id === "INV-DEMO-2")
      migrated.profile = { ...profile, ...(migrated.profile || {}) };
    return migrated;
  });
  seed.invitations.forEach((item) => {
    if (!next.invitations.some((entry) => entry.id === item.id)) {
      next.invitations.push(structuredClone(item));
    }
  });
  seed.candidates.forEach((item) => {
    if (!next.candidates.some((entry) => entry.id === item.id)) {
      next.candidates.push(structuredClone(item));
    }
  });
  next.tasks = next.tasks.map((task) => {
    const migratedTask = { ...task };
    if (migratedTask.stage === "调用受理中") migratedTask.stage = "匹配中";
    if (
      ["待专家签署声明", "声明拒签", "声明失效", "待专家确认"].includes(
        migratedTask.stage,
      )
    )
      migratedTask.stage = "服务中";
    if (migratedTask.stage === "已完成") migratedTask.stage = "已评价完成";
    if (migratedTask.stage === "待验收") migratedTask.stage = "待评价";
    delete migratedTask.commitment;
    migratedTask.evaluations = Array.isArray(migratedTask.evaluations)
      ? migratedTask.evaluations
      : migratedTask.evaluation
        ? [migratedTask.evaluation]
        : [];
    if (migratedTask.evaluations.length)
      migratedTask.evaluation = migratedTask.evaluations.at(-1);
    task = migratedTask;
    const demo = seed.tasks.find((item) => item.id === task.id);
    if (!demo) return task;
    const shouldShowSignedDemo = [
      "服务中",
      "履约中",
      "待补充",
      "待评价",
      "已评价完成",
      "已完成",
    ].includes(task.stage);
    if (!shouldShowSignedDemo) return task;
    return {
      ...task,
      serviceMode: task.serviceMode || demo.serviceMode,
      applicant: task.applicant || demo.applicant,
      consultationRecord:
        task.consultationRecord || structuredClone(demo.consultationRecord),
      evaluations: task.evaluations?.length
        ? task.evaluations
        : structuredClone(demo.evaluations || []),
      evaluation:
        task.evaluations?.at(-1) ||
        task.evaluation ||
        structuredClone(demo.evaluations?.at(-1)),
      versions: task.versions?.length
        ? task.versions
        : structuredClone(demo.versions),
      history: [...(task.history || []), ...structuredClone(demo.history)],
    };
  });
  seed.tasks.forEach((item) => {
    if (!next.tasks.some((entry) => entry.id === item.id)) {
      next.tasks.push(structuredClone(item));
    }
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
export const complete = (record) =>
  record?.agreed === true &&
  record?.submitted === true &&
  profileRequiredComplete({
    phone: record.phone,
    ...record.profile,
  });
export const applicationComplete = (record) =>
  applicationFormComplete(applicationFromProfile(record));
export const checksConfirmed = (record) =>
  !Array.isArray(record?.checks) ||
  record.checks.every((item) => item.result !== "不通过");
function taskHistory(entries) {
  return entries.map(([at, actor, text]) => ({ at, actor, text }));
}
function consultationRecord(task, extras = {}) {
  return {
    consultDate: extras.consultDate || "2026-09-05",
    minutes: extras.minutes || 120,
    purpose: `${task.project}项目关键问题咨询，辅助需求部门形成投资与业务判断。`,
    questions:
      "1. 当前技术或业务方案的成熟度如何？\n专家答复：核心方案已经完成验证，但规模化应用仍需关注供应链和成本。\n2. 项目主要风险是什么？\n专家答复：需重点核查量产能力、客户验证进度及关键资源保障。",
    facts:
      "行业处于规模化应用前期，头部企业已开展示范项目，核心环节仍存在成本和产能约束。",
    judgment:
      extras.judgment ||
      "项目方向具备中长期价值，短期商业化节奏应保持审慎，建议分阶段验证。",
    basis:
      "判断依据包括行业增速、客户验证情况、技术成熟度、竞争格局及供应链稳定性。",
    risks: "量产进度不及预期、核心零部件依赖、成本下降速度和客户订单兑现风险。",
    suggestions:
      extras.suggestions ||
      "补充客户访谈，核验产线与订单，设置阶段性投资条件并持续跟踪关键指标。",
    attachment: extras.attachment || `咨询记录-${task.id}.pdf（演示）`,
    archiveNo: extras.archiveNo || `ZXJL-2026-${String(task.id).slice(-3)}`,
    remark: extras.remark || "排期锁定后形成的演示咨询记录。",
    savedAt: extras.savedAt,
  };
}
function enrichDemoTask(task) {
  const demoEvaluations =
    {
      EX20260018: [
        {
          delivery: 44,
          response: 27,
          attitude: 19,
          total: 90,
          result: "优秀",
          submittedAt: "2026-08-28 17:20:00",
          evaluator: "PC需求部门（演示）",
          retrospective: "待回溯",
          tags: ["专业判断清晰", "建议可执行"],
          comment: "研究结论清晰，能够支撑投资机会筛选。",
        },
        {
          delivery: 46,
          response: 29,
          attitude: 20,
          total: 95,
          result: "优秀",
          submittedAt: "2026-09-10 16:40:00",
          evaluator: "战略投资部（演示）",
          retrospective: "命中",
          tags: ["交付完整", "响应及时"],
          comment: "复评显示前期判断与实际产业进展基本一致。",
        },
      ],
      EX20260063: [
        {
          delivery: 28,
          response: 17,
          attitude: 14,
          total: 59,
          result: "一般",
          submittedAt: "2026-09-02 14:30:00",
          evaluator: "战略投资部（演示）",
          retrospective: "待回溯",
          tags: ["依据需加强", "交付延期"],
          comment: "报告完成度尚可，但关键数据依据和交付时效需要改进。",
        },
      ],
      EX20260042: [
        {
          delivery: 46,
          response: 28,
          attitude: 18,
          total: 92,
          result: "优秀",
          submittedAt: "2026-08-28 17:20:00",
          evaluator: "PC需求部门（演示）",
          retrospective: "待回溯",
          tags: ["专业判断清晰", "建议可执行"],
          comment: "专家对治理机制问题判断清晰，建议已转化为整改清单。",
        },
      ],
    }[task.expertId] || [];
  const base = {
    ...task,
    background: "产业投资项目技术研究（演示）",
    problem: "技术成熟度及商业化风险",
    serviceTime: "2026-09-08 14:00",
    serviceMode: "会议形式",
    applicant: "郑华峰",
    contact: "138****5208 / zhenghf@example.com",
    delivery: "书面报告及风险清单",
    materials: "项目摘要（模拟材料）",
    permission: "仅受邀且确认合作的专家可查看",
    versions: [],
    history: [],
    acceptance: [],
    consultationRecord: null,
    evaluations: structuredClone(demoEvaluations),
    evaluation: structuredClone(demoEvaluations.at(-1)),
  };
  const record = consultationRecord(task);
  if (task.stage === "草稿") {
    return {
      ...base,
      history: taskHistory([
        ["2026-09-07 09:12:00", "PC需求部门（演示）", "保存调用申请草稿"],
      ]),
    };
  }
  if (task.stage === "匹配中") {
    return {
      ...base,
      history: taskHistory([
        [
          "2026-09-06 11:08:00",
          "PC需求部门（演示）",
          "提交专家调用申请，自动进入推荐匹配",
        ],
        [
          "2026-09-06 14:32:00",
          "股权运营部（演示）",
          "受理专家调用申请，进入推荐匹配与排期",
        ],
      ]),
    };
  }
  if (task.stage === "待运营排期") {
    return {
      ...base,
      matchReason: "产业投资与投后管理经验匹配本次并购咨询诉求",
      matchScore: 96,
      matchAdjusted: false,
      departmentConfirmed: true,
      history: taskHistory([
        [
          "2026-09-05 09:40:00",
          "PC需求部门（演示）",
          "提交专家调用申请，自动进入推荐匹配",
        ],
        [
          "2026-09-05 11:16:00",
          "股权运营部（演示）",
          "受理专家调用申请，进入推荐匹配与排期",
        ],
        [
          "2026-09-05 16:08:00",
          "PC需求部门（演示）",
          `确认专家${task.expert}，等待运营锁定服务时间`,
        ],
      ]),
    };
  }
  const signedBase = {
    ...base,
    lockedSchedule: task.serviceTime || "2026-09-08 14:00",
    supportNote: "排期已锁定，专家已确认合作。",
    consultationRecord: record,
  };
  if (task.stage === "服务中" || task.stage === "履约中") {
    return {
      ...signedBase,
      history: taskHistory([
        [
          "2026-09-01 10:06:18",
          "股权运营部（演示）",
          "排期已锁定，任务进入服务中，成果与验收已解锁",
        ],
        ["2026-09-05 16:40:00", "专家/经办人（演示）", "保存咨询记录草稿"],
      ]),
    };
  }
  if (task.stage === "待补充") {
    const version = {
      number: 1,
      at: "2026-09-04 16:20:00",
      content: record.judgment,
      attachment: record.attachment,
    };
    return {
      ...signedBase,
      revisionDeadline: "2026-09-18",
      versions: [version],
      acceptance: [
        {
          at: "2026-09-05 11:08:00",
          actor: "PC需求部门（演示）",
          text: "退回补充：请补充客户验证与量产进度的量化依据",
          version: 1,
          deadline: "2026-09-18",
        },
      ],
      history: taskHistory([
        [
          "2026-09-01 10:06:18",
          "股权运营部（演示）",
          "排期已锁定，任务进入服务中，成果与验收已解锁",
        ],
        [
          "2026-09-04 16:20:00",
          "专家/经办人（演示）",
          "正式提交咨询记录 v1，进入待评价",
        ],
        [
          "2026-09-05 11:08:00",
          "PC需求部门（演示）",
          "退回补充：请补充客户验证与量产进度的量化依据",
        ],
      ]),
    };
  }
  if (task.stage === "待评价") {
    return {
      ...signedBase,
      consultationRecord: consultationRecord(task, {
        consultDate: "2026-08-29",
        minutes: 90,
        savedAt: "2026-08-29 16:40:00",
      }),
      versions: [
        {
          number: 1,
          at: "2026-08-29 16:40:00",
          content: record.judgment,
          attachment: record.attachment,
        },
      ],
      acceptance: [
        {
          at: "2026-09-02 10:18:00",
          actor: "PC需求部门（演示）",
          text: "咨询成果确认通过：结论可用于投资判断",
          version: 1,
          deadline: null,
        },
      ],
      history: taskHistory([
        [
          "2026-09-01 10:06:18",
          "股权运营部（演示）",
          "排期已锁定，任务进入服务中，成果与验收已解锁",
        ],
        [
          "2026-08-29 16:40:00",
          "专家/经办人（演示）",
          "正式提交咨询记录 v1，进入待评价",
        ],
        [
          "2026-09-02 10:18:00",
          "PC需求部门（演示）",
          "咨询成果确认通过：结论可用于投资判断",
        ],
      ]),
    };
  }
  if (task.stage === "已完成" || task.stage === "已评价完成") {
    return {
      ...signedBase,
      consultationRecord: consultationRecord(task, {
        consultDate: "2026-08-22",
        minutes: 150,
        savedAt: "2026-08-22 15:30:00",
      }),
      versions: [
        {
          number: 1,
          at: "2026-08-22 15:30:00",
          content: record.judgment,
          attachment: record.attachment,
        },
      ],
      acceptance: [
        {
          at: "2026-08-25 09:40:00",
          actor: "PC需求部门（演示）",
          text: "咨询成果确认通过：建议已转化为整改清单",
          version: 1,
          deadline: null,
        },
      ],
      evaluation: {
        delivery: 46,
        response: 28,
        attitude: 18,
        total: 92,
        result: "优秀",
        submittedAt: "2026-08-28 17:20:00",
        evaluator: "PC需求部门（演示）",
        retrospective: "待回溯",
        tags: ["专业判断清晰", "建议可执行"],
        comment: "专家对治理机制问题判断清晰，建议已转化为整改清单。",
        anonymousToExpert: false,
      },
      evaluations: [
        {
          delivery: 46,
          response: 28,
          attitude: 18,
          total: 92,
          result: "优秀",
          submittedAt: "2026-08-28 17:20:00",
          evaluator: "PC需求部门（演示）",
          retrospective: "待回溯",
          tags: ["专业判断清晰", "建议可执行"],
          comment: "专家对治理机制问题判断清晰，建议已转化为整改清单。",
          anonymousToExpert: false,
        },
      ],
      history: taskHistory([
        [
          "2026-08-20 10:06:18",
          "股权运营部（演示）",
          "排期已锁定，任务进入服务中，成果与验收已解锁",
        ],
        [
          "2026-08-22 15:30:00",
          "专家/经办人（演示）",
          "正式提交咨询记录 v1，进入待评价",
        ],
        [
          "2026-08-25 09:40:00",
          "PC需求部门（演示）",
          "咨询成果确认通过：建议已转化为整改清单",
        ],
        [
          "2026-08-28 17:20:00",
          "PC需求部门（演示）",
          "提交专家履约评价：92分，优秀",
        ],
      ]),
    };
  }
  return base;
}
