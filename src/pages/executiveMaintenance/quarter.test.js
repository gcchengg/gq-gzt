import test from "node:test";
import assert from "node:assert/strict";
import {
  generatedAnalysis,
  generatedAnalysisByQuarterAndExecutive,
} from "./data.js";
import {
  buildExecutiveMaintenancePath,
  buildQuarterlyMaintenanceRows,
  filterReportsByQuarter,
  getQuarterConfig,
  getQuarterDetailContext,
  getQuarterStateKey,
  normalizeQuarter,
  setQuarterStateLoading,
} from "./quarter.js";

test("builds four quarterly tasks and one independent URL for each", () => {
  const rows = buildQuarterlyMaintenanceRows({
    idPrefix: "cc-001-2026",
    companyName: "长春一东离合器股份有限公司",
    shortForm: "长春一东",
    stockCode: "600148.SH",
    year: "2026",
  });
  assert.deepEqual(
    rows.map(({ period, reportProgress, status }) => ({
      period,
      reportProgress,
      status,
    })),
    [
      { period: "第一季度", reportProgress: "3 / 3", status: "已完成" },
      { period: "第二季度", reportProgress: "3 / 3", status: "已完成" },
      { period: "第三季度", reportProgress: "0 / 3", status: "待维护" },
      { period: "第四季度", reportProgress: "0 / 3", status: "待维护" },
    ],
  );
  const urls = rows.map(buildExecutiveMaintenancePath);
  assert.deepEqual(
    urls.map((url) =>
      new URL(url, "http://localhost").searchParams.get("quater"),
    ),
    ["1", "2", "3", "4"],
  );
  assert.equal(
    urls.some((url) => url.includes("period=")),
    false,
  );
});

test("normalizes quater values and falls back to quarter one", () => {
  assert.equal(normalizeQuarter("1"), "1");
  assert.equal(normalizeQuarter("4"), "4");
  assert.equal(normalizeQuarter(undefined), "1");
  assert.equal(normalizeQuarter("5"), "1");
});

test("maps every quarter to its label and months", () => {
  assert.deepEqual(getQuarterConfig("1"), {
    value: "1",
    label: "第一季度",
    months: [1, 2, 3],
  });
  assert.deepEqual(getQuarterConfig("4"), {
    value: "4",
    label: "第四季度",
    months: [10, 11, 12],
  });
});

test("filters reports by executive and quarter", () => {
  const reports = [
    { id: "a-3", executiveId: "a", month: 3 },
    { id: "a-4", executiveId: "a", month: 4 },
    { id: "b-3", executiveId: "b", month: 3 },
  ];
  assert.deepEqual(
    filterReportsByQuarter(reports, "1", "a").map((item) => item.id),
    ["a-3"],
  );
});

test("creates isolated quarter and executive state keys", () => {
  assert.equal(getQuarterStateKey("2", "gaoying"), "2:gaoying");
});

test("keeps a second scoped analysis pending when the first one completes", () => {
  const q1Key = getQuarterStateKey("1", "gaoying");
  const q2Key = getQuarterStateKey("2", "gaoying");
  const q1AndQ2Pending = setQuarterStateLoading(
    setQuarterStateLoading({}, q1Key, true),
    q2Key,
    true,
  );

  const afterQ1Completes = setQuarterStateLoading(q1AndQ2Pending, q1Key, false);

  assert.equal(afterQ1Completes[q1Key], undefined);
  assert.equal(afterQ1Completes[q2Key], true);
});

test("creates a normalized and isolated detail context", () => {
  const context = getQuarterDetailContext(
    "invalid",
    [
      { id: "jan", executiveId: "gaoying", month: 1 },
      { id: "apr", executiveId: "gaoying", month: 4 },
    ],
    "gaoying",
  );

  assert.equal(context.quarter, "1");
  assert.equal(context.label, "第一季度");
  assert.equal(context.stateKey, "1:gaoying");
  assert.deepEqual(
    context.reports.map((report) => report.id),
    ["jan"],
  );
});

test("provides independent generated analysis only for quarters with reports", () => {
  assert.match(generatedAnalysisByQuarterAndExecutive["1"].gaoying, /第一季度/);
  assert.match(generatedAnalysisByQuarterAndExecutive["2"].gaoying, /第二季度/);
  assert.equal(generatedAnalysisByQuarterAndExecutive["3"], undefined);
  assert.equal(generatedAnalysisByQuarterAndExecutive["4"], undefined);
});

test("retains the generated analysis export for existing consumers", () => {
  assert.equal(
    generatedAnalysis,
    generatedAnalysisByQuarterAndExecutive["2"].gaoying,
  );
});

test("builds a detail URL with quater as the only period parameter", () => {
  assert.equal(
    buildExecutiveMaintenancePath({
      shortForm: "长春一东",
      year: "2026",
      quarter: "3",
    }),
    "/executiveMaintenance?company=%E9%95%BF%E6%98%A5%E4%B8%80%E4%B8%9C&year=2026&quater=3",
  );
});
