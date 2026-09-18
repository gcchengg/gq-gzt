const COMPLETED_RETROSPECTIVES = new Set(["命中", "部分命中", "偏离", "证伪"]);
const RANGE_MONTHS = { "3m": 3, "6m": 6, "12m": 12 };

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function dateOnly(value) {
  return String(value || "")
    .slice(0, 10)
    .replaceAll("/", "-");
}

function asDate(value) {
  const normalized = dateOnly(value);
  if (!normalized) return null;
  const parsed = new Date(`${normalized}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function scoreEvaluation(evaluation) {
  if (evaluation.total != null && Number.isFinite(Number(evaluation.total))) {
    return Number(evaluation.total);
  }
  const delivery = Number(evaluation.delivery || 0);
  const response = Number(evaluation.response || 0);
  const attitude = Number(evaluation.attitude || 0);
  const usesCappedPoints = delivery <= 50 && response <= 30 && attitude <= 20;
  return round(
    usesCappedPoints
      ? delivery + response + attitude
      : delivery * 0.5 + response * 0.3 + attitude * 0.2,
  );
}

function normalizeRecord(record) {
  return {
    project: record.project,
    expert: record.expert,
    delivery: Number(record.delivery || 0),
    response: Number(record.response || 0),
    attitude: Number(record.attitude || 0),
    total: scoreEvaluation(record),
    result: record.result,
    retrospective: record.retrospective || "待回溯",
    retrospectiveDue: dateOnly(record.retrospectiveDue),
    date: dateOnly(record.date || record.submittedAt),
    comment: record.comment || "",
  };
}

export function normalizeEvaluationRecords(taskRecords, fallbackRecords) {
  const submitted = taskRecords.flatMap((task) => {
    const records = Array.isArray(task.evaluations)
      ? task.evaluations
      : task.evaluation
        ? [task.evaluation]
        : [];
    return records.map((evaluation) =>
      normalizeRecord({
        project: task.project,
        expert: task.expert,
        ...evaluation,
        date: evaluation.submittedAt,
      }),
    );
  });
  const submittedProjects = new Set(submitted.map((record) => record.project));
  return [
    ...submitted,
    ...fallbackRecords
      .filter((record) => !submittedProjects.has(record.project))
      .map(normalizeRecord),
  ].sort((a, b) => b.date.localeCompare(a.date));
}

export function summarizeEvaluations(records, now = new Date()) {
  const completed = records.filter((record) =>
    COMPLETED_RETROSPECTIVES.has(record.retrospective),
  );
  const pending = records.filter((record) => record.retrospective === "待回溯");
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const dueLimit = new Date(today);
  dueLimit.setDate(dueLimit.getDate() + 7);
  const dueSoonCount = pending.filter((record) => {
    const due = asDate(record.retrospectiveDue);
    return due && due >= today && due <= dueLimit;
  }).length;
  const scoreTotal = records.reduce((sum, record) => sum + record.total, 0);
  const excellentCount = records.filter(
    (record) => record.result === "优秀",
  ).length;
  const hitCount = completed.filter(
    (record) => record.retrospective === "命中",
  ).length;

  return {
    averageScore: records.length ? round(scoreTotal / records.length) : null,
    excellentCount,
    excellentRate: records.length
      ? round((excellentCount / records.length) * 100)
      : null,
    pendingRetrospectiveCount: pending.length,
    dueSoonCount,
    retrospectiveCompletedCount: completed.length,
    hitCount,
    hitRate: completed.length
      ? round((hitCount / completed.length) * 100)
      : null,
  };
}

function rangeStart(range, now) {
  if (range === "year") return new Date(now.getFullYear(), 0, 1);
  const months = RANGE_MONTHS[range] || 12;
  return new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
}

export function filterByRange(records, range, now = new Date()) {
  const start = rangeStart(range, now);
  if (!start) return records;
  return records.filter((record) => {
    const date = asDate(record.date);
    return date && date >= start && date <= now;
  });
}

export function compareAverageScore(records, range, now = new Date()) {
  const current = filterByRange(records, range, now);
  const currentStart = rangeStart(range, now);
  let previousStart;
  let previousEnd;
  if (range === "year") {
    previousStart = new Date(now.getFullYear() - 1, 0, 1);
    previousEnd = new Date(
      now.getFullYear() - 1,
      now.getMonth(),
      now.getDate(),
    );
  } else {
    const months = RANGE_MONTHS[range] || 12;
    previousStart = new Date(
      now.getFullYear(),
      now.getMonth() - months * 2 + 1,
      1,
    );
    previousEnd = new Date(currentStart);
    previousEnd.setDate(previousEnd.getDate() - 1);
  }
  const previous = records.filter((record) => {
    const date = asDate(record.date);
    return date && date >= previousStart && date <= previousEnd;
  });
  if (!current.length || !previous.length) return null;
  return round(
    summarizeEvaluations(current).averageScore -
      summarizeEvaluations(previous).averageScore,
  );
}

export function buildMonthlyTrend(records, range, now = new Date()) {
  const months =
    range === "3m"
      ? 3
      : range === "6m"
        ? 6
        : range === "year"
          ? now.getMonth() + 1
          : 12;
  return Array.from({ length: months }, (_, index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - months + index + 1,
      1,
    );
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const monthRecords = records.filter((record) =>
      record.date.startsWith(key),
    );
    const summary = summarizeEvaluations(monthRecords, now);
    return {
      key,
      label: `${date.getMonth() + 1}月`,
      averageScore: summary.averageScore,
      hitRate: summary.hitRate,
    };
  });
}

export function filterEvaluationRecords(records, filters) {
  const keyword = String(filters.keyword || "")
    .trim()
    .toLowerCase();
  const [start, end] = filters.dates || [];
  return records.filter((record) => {
    const matchesKeyword =
      !keyword ||
      `${record.project} ${record.expert}`.toLowerCase().includes(keyword);
    const matchesResult = !filters.result || record.result === filters.result;
    const matchesRetrospective =
      !filters.retrospective || record.retrospective === filters.retrospective;
    const matchesStart = !start || record.date >= start;
    const matchesEnd = !end || record.date <= end;
    return (
      matchesKeyword &&
      matchesResult &&
      matchesRetrospective &&
      matchesStart &&
      matchesEnd
    );
  });
}
