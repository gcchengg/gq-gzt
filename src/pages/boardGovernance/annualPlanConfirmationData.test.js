import test from "node:test";
import assert from "node:assert/strict";
import {
  buildAnnualPlanConfirmationTask,
  flattenAnnualPlanReport,
  initialAnnualPlanConfirmationTasks,
} from "./annualPlanConfirmationData.js";
import {
  DEMO_ANNUAL_PLAN_REPORT,
  buildAnnualDutyPlanReport,
} from "./views/DirectorView/components/DutyPlanWorkspace/annualPlanReport.js";

test("annual confirmation task keeps the submitted report rows and director", () => {
  const director = {
    id: "D-08",
    name: "刘欣然",
    company: "一汽智行科技",
  };
  const report = buildAnnualDutyPlanReport(director);
  const task = buildAnnualPlanConfirmationTask({
    director,
    report,
    submittedAt: "2026-09-22 10:00",
  });

  assert.equal(task.id, "ANNUAL-D-08");
  assert.equal(task.status, "待确认");
  assert.equal(task.report.directorName, director.name);
  assert.equal(
    task.rows.length,
    flattenAnnualPlanReport(DEMO_ANNUAL_PLAN_REPORT).length,
  );
  assert.deepEqual(task.rows, flattenAnnualPlanReport(report));
  assert.equal(
    task.rows[0].content,
    DEMO_ANNUAL_PLAN_REPORT.pages[0].categories[0].items[0].content,
  );
  assert.equal(new Set(task.rows.map((row) => row.id)).size, task.rows.length);
});

test("director workbench starts with three operable annual confirmation tasks", () => {
  assert.equal(initialAnnualPlanConfirmationTasks.length, 3);
  assert.deepEqual(
    initialAnnualPlanConfirmationTasks.map((task) => task.status),
    ["待确认", "办理中", "已完成"],
  );
  assert.equal(
    new Set(initialAnnualPlanConfirmationTasks.map((task) => task.id)).size,
    3,
  );
  for (const task of initialAnnualPlanConfirmationTasks) {
    assert.ok(task.rows.length > 0);
    assert.equal(task.rows.length, flattenAnnualPlanReport(task.report).length);
    assert.equal(task.report.directorName, task.directorName);
    assert.ok(
      task.selectedRowIds.every((id) => task.rows.some((row) => row.id === id)),
    );
  }
});
