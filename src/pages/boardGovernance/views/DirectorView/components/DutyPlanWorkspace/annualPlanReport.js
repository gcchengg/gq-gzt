export const DEMO_ANNUAL_PLAN_REPORT = {
  title: "子企业专职外部董事年度工作计划",
  directorName: "张铁斌",
  year: "2026年",
  cycle: "全年",
  fileName: "子企业专职外部董事年度工作计划-2026年度示范版.pdf",
  notes: `填写说明
1.本报告为系统演示数据，用于展示年度履职计划的预览与打印效果，不与当前计划数据联动。
2.各项履职安排围绕公司治理、战略发展、经营监督与风险防控统筹编制；每月归集履职资料，每季度形成履职小结。`,
  pages: [
    {
      company: "一汽能源科技有限公司",
      categories: [
        {
          category: "参加董事会",
          items: [
            {
              seq: 1,
              content:
                "参加年度首次董事会，审议年度经营目标、投资计划及重点任务。",
              date: "2026年3月",
              target: "形成年度经营目标与董事会监督重点清单。",
            },
            {
              seq: 2,
              content:
                "参加半年度董事会，审阅预算执行、经营分析及重大项目进展。",
              date: "2026年8月",
              target: "提出经营分析意见与风险提示。",
            },
            {
              seq: 3,
              content:
                "参加年度末董事会，审议年度总结、预算方案及下一年度经营计划。",
              date: "2026年12月",
              target: "完成年度履职意见及下一年度工作建议。",
            },
          ],
        },
        {
          category: "参加调研",
          items: [
            {
              seq: 1,
              content:
                "围绕新能源业务布局、重点项目建设和市场拓展开展现场专题调研。",
              date: "2026年5月",
              target: "形成专题调研报告及建议事项清单。",
            },
            {
              seq: 2,
              content: "开展重点投资项目投后管理与资金使用情况专项调研。",
              date: "2026年9月",
              target: "提出投后管理优化建议并跟踪整改。",
            },
          ],
        },
        {
          category: "参加子企业重要会议",
          items: [
            {
              seq: 1,
              content: "列席公司战略研讨会，研判行业趋势与中长期发展路径。",
              date: "2026年3月",
              target: "形成战略发展专题意见。",
            },
            {
              seq: 2,
              content:
                "列席经营分析会，跟踪年度关键经营指标与重点任务达成情况。",
              date: "2026年10月",
              target: "督导重点问题闭环并形成跟踪记录。",
            },
          ],
        },
        {
          category: "参加能力培训",
          items: [
            {
              seq: 1,
              content: "参加国资监管、公司治理与风险合规专题培训。",
              date: "2026年6月",
              target: "完成培训总结，更新履职知识清单。",
            },
            {
              seq: 2,
              content: "开展外部董事同业交流，学习先进治理经验和履职实践。",
              date: "2026年11月",
              target: "形成交流纪要及可借鉴治理建议。",
            },
          ],
        },
        {
          category: "开展专项交流",
          items: [
            {
              seq: 1,
              content:
                "与经营层围绕年度战略执行、重大投资和重点风险开展专项沟通。",
              date: "2026年7月",
              target: "明确重点关注事项和工作协同机制。",
            },
          ],
        },
        {
          category: "督导子企业落实工作",
          items: [
            {
              seq: 1,
              content: "督导重大投资项目进度、资金使用与风险防控措施落实。",
              date: "2026年7—10月",
              target: "推动重点事项按节点落实并闭环。",
            },
          ],
        },
        {
          category: "解决子企业发展问题",
          items: [
            {
              seq: 1,
              content:
                "针对项目协同、市场拓展及经营质效提升中的难点问题提出建议。",
              date: "全年",
              target: "推动形成专项解决方案并跟踪成效。",
            },
          ],
        },
      ],
    },
  ],
};

const escapeHtml = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );

export function buildAnnualDutyPlanReport() {
  return DEMO_ANNUAL_PLAN_REPORT;
}

export function buildAnnualPlanPrintDocument(
  reportHtml,
  title,
  inheritedStyles = "",
) {
  const escapedTitle = escapeHtml(title);
  return `<!doctype html><html><head><meta charset="UTF-8" /><title>${escapedTitle}</title>${inheritedStyles}<style>@page { size: A4 landscape; margin: 10mm; }* { box-sizing: border-box; }html, body { margin: 0; padding: 0; background: #fff !important; }body { color: #1a1a1a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }@media print { .no-print { display: none !important; } }</style></head><body>${reportHtml}</body></html>`;
}

export function printAnnualPlanReport(reportHtml, title, options = {}) {
  const openWindow =
    options.openWindow ||
    ((url, target, features) => window.open(url, target, features));
  const ownerDocument = options.ownerDocument || document;
  const printWindow = openWindow("", "_blank", "width=1200,height=800");
  if (!printWindow) return false;
  const inheritedStyles = [
    ...ownerDocument.head.querySelectorAll('style, link[rel="stylesheet"]'),
  ]
    .map((node) => node.outerHTML)
    .join("");
  printWindow.document.open();
  printWindow.document.write(
    buildAnnualPlanPrintDocument(reportHtml, title, inheritedStyles),
  );
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
  };
  return true;
}
