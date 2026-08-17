export const QUARTER_CONFIGS = [
  { value: "1", label: "第一季度", months: [1, 2, 3] },
  { value: "2", label: "第二季度", months: [4, 5, 6] },
  { value: "3", label: "第三季度", months: [7, 8, 9] },
  { value: "4", label: "第四季度", months: [10, 11, 12] },
];

export function normalizeQuarter(value) {
  return QUARTER_CONFIGS.some((item) => item.value === value) ? value : "1";
}

export function getQuarterConfig(value) {
  const normalized = normalizeQuarter(value);
  return QUARTER_CONFIGS.find((item) => item.value === normalized);
}

export function filterReportsByQuarter(reports, quarter, executiveId) {
  const { months } = getQuarterConfig(quarter);
  return reports.filter(
    (report) =>
      report.executiveId === executiveId && months.includes(report.month),
  );
}

export function getQuarterStateKey(quarter, executiveId) {
  return `${normalizeQuarter(quarter)}:${executiveId}`;
}

export function buildExecutiveMaintenancePath(record) {
  const params = new URLSearchParams({
    company: record.shortForm,
    year: record.year,
    quater: normalizeQuarter(record.quarter),
  });
  return `/executiveMaintenance?${params.toString()}`;
}

export function buildQuarterlyMaintenanceRows(baseRecord) {
  return QUARTER_CONFIGS.map((quarter) => {
    const hasReports = quarter.value === "1" || quarter.value === "2";
    return {
      ...baseRecord,
      id: `${baseRecord.idPrefix}-q${quarter.value}`,
      quarter: quarter.value,
      period: quarter.label,
      executiveCount: 1,
      executiveProgress: hasReports ? "1 / 1" : "0 / 1",
      reportProgress: hasReports ? "3 / 3" : "0 / 3",
      updatedAt: hasReports ? "2026-07-08" : "-",
      status: hasReports ? "已完成" : "待维护",
    };
  });
}
