export const sectionOptions = [
  {
    key: "base",
    label: "一、基础底数“清”",
    children: [
      "企业画像",
      "业务与定位",
      "股权与治理结构",
      "对标情况（AI生成）",
      "生命周期重要事项",
    ],
  },
  {
    key: "finance",
    label: "二、财务状况“清”",
    children: ["本期经营完成", "近三年财务表现", "分红情况", "财务分析"],
  },
  {
    key: "governance",
    label: "三、治理行权“清”",
    children: ["三会议题管理", "委派高管履职", "委派董事履职"],
  },
  { key: "synergy", label: "四、产业协同“清”", children: ["产业协同情况"] },
  {
    key: "risk",
    label: "五、风险隐患“清”",
    children: ["审计发现问题及整改明细", "风险情况", "国资委监管要求整改"],
  },
  {
    key: "strategy",
    label: "六、管理策略“清”",
    children: ["产业协同", "经营管理", "股权经营"],
  },
];

export const financeRows = [
  {
    year: "2025",
    revenue: "76616",
    revenueRate: "10.99%",
    profit: "1143",
    profitRate: "592.47%",
    equity: "47670",
    equityRate: "2.70%",
  },
  {
    year: "2024",
    revenue: "69030",
    revenueRate: "-0.85%",
    profit: "-232",
    profitRate: "-451.27%",
    equity: "46419",
    equityRate: "-1.66%",
  },
  {
    year: "2023",
    revenue: "29619",
    revenueRate: "26.33%",
    profit: "66",
    profitRate: "109.38%",
    equity: "47202",
    equityRate: "0.17%",
  },
];

export const comparisonRows = [
  ["营收(亿)", "7.66", "23.82", "56.07", "22.55", "8.54", "49.60"],
  ["归母净利(万)", "1,143", "7,748", "49,013", "38,899", "34,561", "21,348"],
  ["归母净资产(亿)", "4.77", "17.22", "33.64", "30.12", "15.71", "30.51"],
  ["毛利率", "16.22%", "17.59%", "20.83%", "27.20%", "32.33%", "16.37%"],
  ["市值/规模排序", "6", "3", "1", "4", "5", "2"],
];

export const lifecycleMilestone = {
  key: "lifecycle-board-approval",
  date: "2026-06-24",
  category: "三会管理",
  content:
    "接收长春一东临时董事会议题（选举独立董事、选举董事、接收国有资本预算金）并完成审批",
  relatedParty: "无",
};

export const financialAnalysisSections = [
  {
    title: "盈利能力",
    status: "改善",
    tone: "positive",
    summary: "收入规模稳步恢复，利润端实现扭亏，盈利质量较上年明显改善。",
    details: [
      "2025年营业收入7.66亿元，同比增长10.99%，市场拓展带动主营业务恢复增长。",
      "归母净利润1,143万元，较上年亏损232万元实现扭亏，但净利率约1.49%，利润空间仍偏薄。",
    ],
  },
  {
    title: "偿债能力",
    status: "稳健",
    tone: "stable",
    summary: "资本结构总体稳定，短期偿债压力处于可控区间。",
    details: [
      "期末归母净资产约4.77亿元，同比增长2.70%，所有者权益保持增长。",
      "经营回款改善对流动性形成支撑，但仍需持续关注应收账款和存货对营运资金的占用。",
    ],
  },
  {
    title: "现金流量",
    status: "向好",
    tone: "positive",
    summary: "经营活动现金净流入增加，利润与现金流匹配度有所提升。",
    details: [
      "经营活动产生的现金流量净额7,709万元，同比增长23.47%，主要受票据到期收付结构改善影响。",
      "投资活动现金净流出8,837万元，反映公司仍处于产线升级和新产品投入阶段。",
    ],
  },
  {
    title: "营运能力",
    status: "承压",
    tone: "warning",
    summary: "收入增长快于成本增长，但规模效应尚未充分转化为利润。",
    details: [
      "营业成本同比增长10.09%，低于收入增速0.90个百分点，精益降本初见成效。",
      "管理费用同比增长20.81%，高于收入增速；需强化费用预算约束及存货、应收账款周转管理。",
    ],
  },
];

export const financialWarningItems = [
  {
    level: "中风险",
    title: "盈利能力偏弱",
    content:
      "归母净利率约1.49%，明显低于多数对标企业，主营业务抵御价格波动和客户降本压力的空间有限。",
  },
  {
    level: "中风险",
    title: "费用增速较快",
    content:
      "管理费用同比增长20.81%，高于营业收入增速，建议按月跟踪费用预算偏差并落实专项降本措施。",
  },
  {
    level: "提示",
    title: "转型投入需关注产出",
    content:
      "研发费用同比下降19.34%，AMT、扭转减振器及新能源部件尚处培育期，需关注重点项目量产进度和投入产出效率。",
  },
];

export const topicDemos = [
  {
    title: "《关于计提2025年度资产减值准备的议案》",
    result: "同意",
    advice:
      "加强存货管理，完善盘点机制和产供销联动；针对大额应收账款成立专项清收机制。",
    follow:
      "经管层牵头成立专项组，2026年6月收回部分款项，冲回资产减值损失237万元。",
  },
  {
    title: "《2026年度经营计划及预算方案》",
    result: "同意",
    advice: "持续跟踪总部利润和预算执行偏差，按月形成闭环分析。",
    follow: "已建立月度经营分析机制，重点指标纳入经管层督办台账。",
  },
];

export const sasacRectification = {
  key: "sasac-veto-right",
  problem: "公司章程、股东协议约定非国有股东对一些事项具有一票否决权",
  planDate: "2026年12月",
  planContent: "推动参股公司修改公司章程、股东协议，取消非国有股东一票否决权",
  owner: "丛圣元",
  status: "进行中",
  evidence:
    "截至2026年7月，已与参股公司全体股东就公司章程、股东协议修订事项达成一致意见，正推动参股公司准备议案，提请董事会、股东会决议",
};

export const auditProblemRows = [
  {
    key: "audit-wt03",
    opinionCode: "一汽审报字〔2026〕06号",
    projectName: "长春一东参股管理专项审计",
    draftIndex: "WT03",
    problemFinderName: "长春一东离合器股份有限公司",
    problemSummary:
      "部分更新改造项目达到预定可使用状态后，未按制度及时开展投资项目后评价，项目经验及投入产出情况尚未形成闭环总结。",
    status: "整改进行中",
    estimateEndDate: "2026-09-30",
    actualityStartDate: "2026-05-16",
    actualityEndDate: "—",
    distance: "75",
  },
  {
    key: "audit-wt02",
    opinionCode: "一汽审报字〔2026〕06号",
    projectName: "长春一东参股管理专项审计",
    draftIndex: "WT02",
    problemFinderName: "长春一东离合器股份有限公司",
    problemSummary:
      "个别零星采购项目的供应商比选记录不完整，询价依据和审批资料未统一归档，采购过程留痕有待进一步规范。",
    status: "整改未到期",
    estimateEndDate: "2026-10-31",
    actualityStartDate: "2026-06-05",
    actualityEndDate: "—",
    distance: "106",
  },
  {
    key: "audit-wt01",
    opinionCode: "一汽审报字〔2026〕06号",
    projectName: "长春一东参股管理专项审计",
    draftIndex: "WT01",
    problemFinderName: "长春一东离合器股份有限公司",
    problemSummary:
      "部分账龄较长的应收账款缺少逐户清收计划，责任分工和阶段性回款目标不够明确，影响营运资金周转效率。",
    status: "已完成",
    estimateEndDate: "2026-06-30",
    actualityStartDate: "2026-04-12",
    actualityEndDate: "2026-06-20",
    distance: "—",
  },
];

export const riskTrackingRows = [
  {
    key: "risk-receivable",
    riskName: "应收账款周转效率下降预警",
    companyName: "长春一东离合器股份有限公司",
    eventOrInfo: "风险信息",
    riskCategoryLv1Name: "运营风险",
    riskCategoryLv2Name: "财务管理风险",
    riskTypeName: "投后管理风险",
    riskOccTime: "2026-06-01",
    riskLevelName: "中风险",
    riskMethod: "指标识别",
    inspFreq: "月度点检",
    fullName: "高英",
    progStatus: "跟踪中",
  },
  {
    key: "risk-transformation",
    riskName: "新能源业务转型进度风险",
    companyName: "长春一东离合器股份有限公司",
    eventOrInfo: "风险信息",
    riskCategoryLv1Name: "战略风险",
    riskCategoryLv2Name: "产业转型风险",
    riskTypeName: "经营发展风险",
    riskOccTime: "2026-05-01",
    riskLevelName: "中风险",
    riskMethod: "专项识别",
    inspFreq: "季度点检",
    fullName: "赵德良",
    progStatus: "处置中",
  },
  {
    key: "risk-customer",
    riskName: "客户集中度较高风险",
    companyName: "长春一东离合器股份有限公司",
    eventOrInfo: "风险信息",
    riskCategoryLv1Name: "市场风险",
    riskCategoryLv2Name: "客户结构风险",
    riskTypeName: "经营发展风险",
    riskOccTime: "2026-04-01",
    riskLevelName: "低风险",
    riskMethod: "定期识别",
    inspFreq: "季度点检",
    fullName: "王立新",
    progStatus: "监测中",
  },
];
