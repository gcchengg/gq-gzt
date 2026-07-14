export const sectionOptions = [
  {
    key: "base",
    label: "一、基础底数“清”",
    children: ["企业画像", "业务与定位", "股权与治理结构", "对标情况"],
  },
  {
    key: "finance",
    label: "二、财务状况“清”",
    children: ["本期经营完成", "近三年财务表现", "分红情况"],
  },
  {
    key: "governance",
    label: "三、治理行权“清”",
    children: ["三会议题管理", "委派高管履职", "委派董事履职"],
  },
  { key: "synergy", label: "四、产业协同“清”", children: ["产业协同情况"] },
  { key: "risk", label: "五、风险隐患“清”", children: ["风险与整改"] },
  { key: "strategy", label: "六、管理策略“清”", children: ["管理策略"] },
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
  {
    title: "《关于修订公司内部控制制度的议案》",
    result: "同意",
    advice: "",
    follow: "",
  },
];
