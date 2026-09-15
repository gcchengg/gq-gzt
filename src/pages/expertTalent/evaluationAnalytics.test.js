import assert from "node:assert/strict";
import test from "node:test";
import {
  buildMonthlyTrend,
  compareAverageScore,
  filterByRange,
  filterEvaluationRecords,
  normalizeEvaluationRecords,
  scoreEvaluation,
  summarizeEvaluations,
} from "./evaluationAnalytics.js";

test("submitted task evaluations replace fallback rows for the same project", () => {
  const tasks = [
    {
      project: "项目A",
      expert: "张专家",
      evaluation: {
        delivery: 46,
        response: 28,
        attitude: 18,
        total: 92,
        result: "优秀",
        retrospective: "待回溯",
        submittedAt: "2026-09-01 10:00:00",
        comment: "已提交评价",
      },
    },
  ];
  const fallback = [
    {
      project: "项目A",
      expert: "旧专家",
      delivery: 70,
      response: 70,
      attitude: 70,
      result: "良好",
      retrospective: "偏离",
      date: "2026-08-01",
    },
  ];

  const records = normalizeEvaluationRecords(tasks, fallback);

  assert.equal(records.length, 1);
  assert.equal(records[0].expert, "张专家");
  assert.equal(records[0].total, 92);
  assert.equal(records[0].comment, "已提交评价");
});

test("scoreEvaluation supports capped point inputs and 100-scale dimension ratings", () => {
  assert.equal(
    scoreEvaluation({ delivery: 46, response: 28, attitude: 18 }),
    92,
  );
  assert.equal(
    scoreEvaluation({ delivery: 96, response: 92, attitude: 98 }),
    95.2,
  );
});

test("summary keeps fulfillment and retrospective denominators separate", () => {
  const summary = summarizeEvaluations(
    [
      { total: 95, result: "优秀", retrospective: "命中", date: "2026-09-01" },
      {
        total: 75,
        result: "良好",
        retrospective: "部分命中",
        date: "2026-09-02",
      },
      {
        total: 55,
        result: "一般",
        retrospective: "待回溯",
        date: "2026-09-03",
        retrospectiveDue: "2026-09-18",
      },
    ],
    new Date("2026-09-14T00:00:00"),
  );

  assert.deepEqual(summary, {
    averageScore: 75,
    excellentCount: 1,
    excellentRate: 33.3,
    pendingRetrospectiveCount: 1,
    dueSoonCount: 1,
    retrospectiveCompletedCount: 2,
    hitCount: 1,
    hitRate: 50,
  });
});

test("summary returns null percentages when no denominator exists", () => {
  const summary = summarizeEvaluations([], new Date("2026-09-14T00:00:00"));
  assert.equal(summary.averageScore, null);
  assert.equal(summary.excellentRate, null);
  assert.equal(summary.hitRate, null);
});

test("latest-12-month range excludes older records", () => {
  const records = [
    { date: "2025-09-01" },
    { date: "2025-10-01" },
    { date: "2026-09-14" },
  ];
  const filtered = filterByRange(
    records,
    "12m",
    new Date("2026-09-14T00:00:00"),
  );
  assert.deepEqual(
    filtered.map((record) => record.date),
    ["2025-10-01", "2026-09-14"],
  );
});

test("average-score comparison uses the previous equivalent period", () => {
  const records = [
    { date: "2026-08-01", total: 90 },
    { date: "2025-08-01", total: 80 },
  ];
  assert.equal(
    compareAverageScore(records, "year", new Date("2026-09-14T00:00:00")),
    10,
  );
});

test("monthly trend leaves months without records empty", () => {
  const series = buildMonthlyTrend(
    [
      { date: "2026-08-02", total: 90, retrospective: "命中" },
      { date: "2026-08-18", total: 80, retrospective: "偏离" },
    ],
    "3m",
    new Date("2026-09-14T00:00:00"),
  );
  assert.deepEqual(series, [
    { key: "2026-07", label: "7月", averageScore: null, hitRate: null },
    { key: "2026-08", label: "8月", averageScore: 85, hitRate: 50 },
    { key: "2026-09", label: "9月", averageScore: null, hitRate: null },
  ]);
});

test("Drawer filters combine keyword, result, retrospective, and dates", () => {
  const records = [
    {
      project: "芯片研判",
      expert: "张明",
      result: "优秀",
      retrospective: "命中",
      date: "2026-08-01",
    },
    {
      project: "电池尽调",
      expert: "李华",
      result: "良好",
      retrospective: "待回溯",
      date: "2026-09-01",
    },
  ];
  const filtered = filterEvaluationRecords(records, {
    keyword: "张",
    result: "优秀",
    retrospective: "命中",
    dates: ["2026-07-01", "2026-08-31"],
  });
  assert.deepEqual(
    filtered.map((record) => record.project),
    ["芯片研判"],
  );
});
