export const monthlySections = [
  {
    key: "meetings",
    title: "参会决策",
    columns: [
      "会议类型",
      "会议名称",
      "会议日期",
      "会议形式",
      "参会形式",
      "议案数量",
      "履职天数",
    ],
    rows: [
      [
        "出席董事会相关会议",
        "董事会第二次会议",
        "2026-01-28",
        "现场召开",
        "现场参会",
        "2",
        "2",
      ],
    ],
  },
  {
    key: "research",
    title: "调查研究",
    columns: [
      "调研主题",
      "调研单位",
      "调研方式",
      "调研日期",
      "是否形成调研报告",
      "发现的问题或关注的事项",
      "履职天数",
    ],
    rows: [
      [
        "战略规划、数字化建设情况",
        "一汽股权",
        "现场",
        "2026-01-29",
        "否",
        "关注直投与基金双轮驱动、基金募资机制及数字化平台建设进展。",
        "0.5",
      ],
    ],
  },
  {
    key: "activities",
    title: "参加子企业会议/活动",
    columns: ["类型", "会议/活动主题", "会议/活动日期", "参加方式", "履职天数"],
    rows: [
      ["重要会议/活动", "外部董事调整宣布会议", "2026-01-27", "现场", "0.5"],
      [
        "重要会议/活动",
        "公司介绍及董事履职支撑工作机制专题汇报",
        "2026-01-29",
        "现场",
        "0.5",
      ],
    ],
  },
  {
    key: "training",
    title: "履职能力培训",
    columns: [
      "培训名称",
      "培训日期",
      "培训方式",
      "培训师资",
      "履职天数",
      "培训内容",
    ],
    rows: [
      [
        "股权思享汇",
        "2026-01-30",
        "视频",
        "高驰",
        "0.5",
        "参股企业财务风险处置与投后管理赋能典型案例分享",
      ],
    ],
  },
  {
    key: "communication",
    title: "专项交流沟通",
    columns: [
      "交流对象",
      "交流主题",
      "交流方式",
      "交流日期",
      "交流取得的成果",
      "履职天数",
    ],
    rows: [
      [
        "子企业董事长",
        "经营管理与重点风险",
        "现场",
        "2026-01-29",
        "明确后续跟踪事项及沟通机制",
        "0",
      ],
    ],
  },
  {
    key: "specialWork",
    title: "专项工作落实",
    columns: [
      "专项工作主题",
      "工作落实要求",
      "工作来源",
      "承担角色",
      "计划完成日期",
      "实际完成日期",
      "工作交付成果",
      "工作开展（或完成）情况",
    ],
    rows: [
      [
        "重点项目风险跟踪",
        "跟踪风险事项整改",
        "集团董办",
        "督导",
        "2026-01-30",
        "2026-01-30",
        "跟踪清单",
        "已完成阶段性跟踪",
      ],
    ],
  },
  {
    key: "workReports",
    title: "工作报告",
    columns: ["报告类型", "主送对象", "报告名称", "报告主要内容"],
    rows: [
      [
        "专题报告",
        "集团董办",
        "经营管理与风险防控情况报告",
        "汇总经营管理情况、重点风险及后续工作安排",
      ],
    ],
  },
  {
    key: "topics",
    title: "年度课题执行情况",
    columns: ["课题名称", "本月进展", "下月计划"],
    rows: [
      [
        "投后管理与数字化治理研究",
        "完成资料收集与问题梳理",
        "开展专题访谈，形成阶段性研究成果",
      ],
    ],
  },
];

export const feedbackSection = {
  key: "feedback",
  title: "附件：工作报告意见建议落实情况意见征询表",
  columns: [
    "企业名称",
    "工作报告提交时间",
    "工作报告意见建议",
    "意见反馈类别",
    "意见反馈内容",
  ],
  rows: [
    [
      "一汽股权",
      "2026年第一季度",
      "完善投后管理与风险跟踪机制",
      "亮点成效",
      "已建立重点事项跟踪台账，明确责任部门和落实时限。",
    ],
  ],
};

export function buildReportDraft(report, director) {
  const monthly = report.reportType === "月度报告";
  const sections = monthly ? monthlySections : [feedbackSection];
  const demoDate = "2026-01-31";
  return {
    title: monthly
      ? "外部董事月度履职工作写实报告"
      : `子企业专职外部董事${report.reportType === "年度报告" ? "年度" : "季度"}工作报告`,
    directorName: report.directorName || director.name,
    identity: director.role || "专职外部董事",
    company: report.company || director.company,
    companyType: "全资子企业",
    period: report.period,
    reportDate: demoDate,
    category: "企业经营",
    cumulativeDays: "4",
    background:
      "围绕企业年度经营目标、战略布局及公司治理要求，结合董事会审议、专题调研和经营层沟通情况，对重点项目推进、投后管理及数字化建设开展履职监督。",
    currentSituation:
      "企业持续推进直投与基金协同发展，重点项目按计划实施。当前需重点关注基金募资进度、投资项目投后管理及风险预警机制建设，进一步明确责任分工和阶段性目标。",
    recommendations:
      "一是建立重点事项跟踪台账，明确责任部门、完成时限与交付成果。\n二是完善投资项目风险识别与预警机制，定期向董事会报告重大变化。\n三是推进数字化平台与业务流程协同，提高投后管理的信息共享和问题闭环效率。",
    otherNotes: "本月按计划完成履职工作，无其他需说明事项。",
    tables: Object.fromEntries(
      sections.map((section) => [
        section.key,
        section.rows.map((row) => [...row]),
      ]),
    ),
    ...report.templateData,
  };
}

export function sectionDays(section, rows) {
  const index = section.columns.indexOf("履职天数");
  return index < 0
    ? null
    : (rows || []).reduce((sum, row) => sum + (Number(row[index]) || 0), 0);
}
