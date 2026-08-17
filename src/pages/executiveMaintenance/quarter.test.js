import test from "node:test";
import assert from "node:assert/strict";
import {
  buildExecutiveMaintenancePath,
  filterReportsByQuarter,
  getQuarterConfig,
  getQuarterStateKey,
  normalizeQuarter,
} from "./quarter.js";

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
