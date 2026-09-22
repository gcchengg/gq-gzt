import test from "node:test";
import assert from "node:assert/strict";
import {
  DEMO_ANNUAL_PLAN_REPORT,
  buildAnnualDutyPlanReport,
  buildAnnualPlanPrintDocument,
} from "./annualPlanReport.js";

test("keeps the full demonstration report when viewing another director", () => {
  const report = buildAnnualDutyPlanReport({
    name: "刘欣然",
    company: "一汽智行科技",
  });

  assert.equal(report.title, "子企业专职外部董事年度工作计划");
  assert.equal(report.directorName, "刘欣然");
  assert.equal(report.year, "2026年");
  assert.equal(report.cycle, "全年");
  assert.equal(
    report.fileName,
    "子企业专职外部董事年度工作计划-刘欣然-2026年.pdf",
  );
  assert.equal(report.pages.length, 1);
  assert.equal(report.pages[0].company, "一汽智行科技");
  assert.deepEqual(
    report.pages[0].categories,
    DEMO_ANNUAL_PLAN_REPORT.pages[0].categories,
  );
  assert.equal(report.notes, DEMO_ANNUAL_PLAN_REPORT.notes);
  assert.match(report.notes, /本报告为系统演示数据/);
});

test("does not change the source demonstration report", () => {
  buildAnnualDutyPlanReport({ name: "刘欣然", company: "一汽智行科技" });
  assert.equal(DEMO_ANNUAL_PLAN_REPORT.directorName, "张铁斌");
  assert.equal(
    DEMO_ANNUAL_PLAN_REPORT.pages[0].company,
    "一汽能源科技有限公司",
  );
  assert.equal(DEMO_ANNUAL_PLAN_REPORT.pages[0].categories.length, 7);
});

test("builds a printable PDF document shell", () => {
  const html = buildAnnualPlanPrintDocument(
    "<article>年度计划</article>",
    "子企业专职外部董事年度工作计划-张铁斌-2026年",
  );

  assert.match(html, /<!doctype html>/i);
  assert.match(html, /@page \{ size: A4 landscape;/);
  assert.match(html, /<article>年度计划<\/article>/);
  assert.match(html, /子企业专职外部董事年度工作计划-张铁斌-2026年/);
});
