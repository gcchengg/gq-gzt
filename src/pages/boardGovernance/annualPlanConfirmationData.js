import { buildAnnualDutyPlanReport } from "./views/DirectorView/components/DutyPlanWorkspace/annualPlanReport.js";

export function flattenAnnualPlanReport(report) {
  return report.pages.flatMap((page, pageIndex) =>
    page.categories.flatMap((category, categoryIndex) =>
      category.items.map((item) => ({
        ...item,
        id: `${pageIndex + 1}-${categoryIndex + 1}-${item.seq}`,
        company: page.company,
        category: category.category,
      })),
    ),
  );
}

export function buildAnnualPlanConfirmationTask({
  director,
  report,
  submittedAt,
}) {
  return {
    id: `ANNUAL-${director.id}`,
    directorId: director.id,
    directorName: director.name,
    company: director.company,
    owner: "董事本人",
    title: `${director.name}年度履职计划确认/调整`,
    year: report.year,
    cycle: report.cycle,
    status: "待确认",
    submittedAt,
    selectedRowIds: [],
    report,
    rows: flattenAnnualPlanReport(report),
  };
}

const demoDirectors = [
  { id: "D-08", name: "刘欣然", company: "一汽智行科技" },
  { id: "D-01", name: "张铁斌", company: "一汽能源科技公司" },
  { id: "D-02", name: "李晨光", company: "一汽股权" },
];

const demoTasks = demoDirectors.map((director) => {
  const task = buildAnnualPlanConfirmationTask({
    director,
    report: buildAnnualDutyPlanReport(director),
    submittedAt: "2026-09-22 10:00",
  });
  const rows = task.rows.slice(0, 6);
  return {
    ...task,
    rows,
    selectedRowIds: rows.map((row) => row.id),
    report: {
      ...task.report,
      notes:
        "演示数据：以上为年度履职计划编排阶段已选择的计划，董事可再次勾选调整。",
    },
  };
});

export const initialAnnualPlanConfirmationTasks = [
  demoTasks[0],
  {
    ...demoTasks[1],
    status: "办理中",
    selectedRowIds: [demoTasks[1].rows[0].id],
  },
  {
    ...demoTasks[2],
    status: "已完成",
    selectedRowIds: demoTasks[2].rows.map((row) => row.id),
    completedAt: "2026-09-22 11:30",
  },
];
