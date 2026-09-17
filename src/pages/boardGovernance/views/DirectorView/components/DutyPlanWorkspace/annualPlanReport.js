export const WORK_CATEGORIES = [
  "参加董事会",
  "参加调研",
  "参加子企业重要会议",
  "参加能力培训",
  "开展专项交流",
  "督导子企业落实工作",
  "解决子企业发展问题",
];

export const ANNUAL_PLAN_NOTES = `填写说明
1.各位董事以任职企业为单位，结合本年度履职需要，梳理重点工作，并完成填报。
2.每月第一周，子企业董办应根据董事上个月履职工作完成情况，填报上月履职写实报告，董事确认后，由子企业董办上传到一汽云原生工作台的董事会云盘。`;

const escapeHtml = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );

export function buildAnnualDutyPlanReport(plans = [], director = {}) {
  const confirmed = plans.filter((item) => item.status === "已完成");
  const source = confirmed.length ? confirmed : plans;
  const directorName = director.name || source[0]?.directorName || "";
  const years = [
    ...new Set(source.map((item) => item.dutyYear).filter(Boolean)),
  ];
  const year = years[0] || "2026年";
  const companies = [
    ...new Set(source.map((item) => item.servingCompany).filter(Boolean)),
  ];
  const pageCompanies = companies.length ? companies : [director.company || ""];

  return {
    title: "子企业专职外部董事年度工作计划",
    directorName,
    year,
    cycle: "全年",
    fileName: `子企业专职外部董事年度工作计划-${directorName}-${year}.pdf`,
    notes: ANNUAL_PLAN_NOTES,
    pages: pageCompanies.map((company) => ({
      company,
      year,
      categories: WORK_CATEGORIES.map((category) => ({
        category,
        items: source
          .filter(
            (item) =>
              item.servingCompany === company && item.workCategory === category,
          )
          .map((item, index) => ({
            seq: index + 1,
            content: item.content,
            date: item.date,
            target: item.target,
            quarter: item.dutyQuarter,
          })),
      })),
    })),
  };
}

export function buildAnnualPlanPrintDocument(
  reportHtml,
  title,
  inheritedStyles = "",
) {
  const escapedTitle = escapeHtml(title);
  return `<!doctype html><html><head><meta charset="UTF-8" />
      <title>${escapedTitle}</title>${inheritedStyles}<style>
      @page { size: A4 landscape; margin: 10mm; }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: #fff !important; }
      body { color: #1a1a1a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @media print { .no-print { display: none !important; } }
    </style></head><body>${reportHtml}</body></html>`;
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
