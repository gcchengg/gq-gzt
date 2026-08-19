import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("./DueDrawer.jsx", import.meta.url),
  "utf8",
);

test("adds an independent equity investment committee minutes tab", () => {
  assert.match(source, /function EquityInvestmentMeeting/);
  assert.match(source, /label="股权投委会召开日"/);
  assert.match(source, /name="investmentLaunchDate"/);
  assert.match(source, /name="investmentIssueNo"/);
  assert.match(source, /股权投委会会议纪要信息已保存/);

  const meetingTabsStart = source.indexOf("const meetingTabItems");
  const meetingTabsSource = source.slice(
    meetingTabsStart,
    meetingTabsStart + 1800,
  );
  const officeIndex = meetingTabsSource.indexOf('label: "总办会"');
  const investmentIndex = meetingTabsSource.indexOf('label: "股权投委会"');
  const viceIndex = meetingTabsSource.indexOf('label: "向分管副总汇报专题会"');

  assert.notEqual(officeIndex, -1);
  assert.notEqual(investmentIndex, -1);
  assert.notEqual(viceIndex, -1);
  assert.ok(officeIndex < investmentIndex);
  assert.ok(investmentIndex < viceIndex);
});
