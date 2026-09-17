import test from "node:test";
import assert from "node:assert/strict";
import { initialDutyPlans } from "../../../../dutyPlanData.js";
import {
  WORK_CATEGORIES,
  buildAnnualDutyPlanReport,
  buildAnnualPlanPrintDocument,
} from "./annualPlanReport.js";

test("builds an annual duty plan report from confirmed plans", () => {
  const report = buildAnnualDutyPlanReport(initialDutyPlans, {
    name: "张铁斌",
  });

  assert.equal(report.title, "子企业专职外部董事年度工作计划");
  assert.equal(report.directorName, "张铁斌");
  assert.equal(report.year, "2026年");
  assert.equal(report.cycle, "全年");
  assert.equal(
    report.fileName,
    "子企业专职外部董事年度工作计划-张铁斌-2026年.pdf",
  );
  assert.equal(report.pages.length, 1);
  assert.equal(report.pages[0].company, "一汽能源科技公司");
  assert.deepEqual(
    report.pages[0].categories.map((item) => item.category),
    WORK_CATEGORIES,
  );

  const board = report.pages[0].categories.find(
    (item) => item.category === "参加董事会",
  );
  assert.deepEqual(board.items, [
    {
      seq: 1,
      content: "第四次定期董事会",
      date: "2026-12-16",
      target: "完成重点议题审议并形成会议成果",
      quarter: "三季度",
    },
  ]);

  const empty = report.pages[0].categories.find(
    (item) => item.category === "解决子企业发展问题",
  );
  assert.deepEqual(empty.items, []);
  assert.match(report.notes, /以任职企业为单位/);
});

test("groups annual report pages by serving company", () => {
  const report = buildAnnualDutyPlanReport(
    [
      ...initialDutyPlans,
      {
        ...initialDutyPlans[0],
        id: "PLAN-004",
        servingCompany: "旗新动力科技公司",
        content: "第五次董事会预备会及正式会",
      },
    ],
    { name: "张铁斌" },
  );

  assert.deepEqual(
    report.pages.map((page) => page.company),
    ["一汽能源科技公司", "旗新动力科技公司"],
  );
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
