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
