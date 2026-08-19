import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("./CompanyReview.jsx", import.meta.url),
  "utf8",
);

test("shows the equity investment committee tag only for topicType 1", () => {
  assert.match(source, /record\.topicType === "1"/);
  assert.match(source, /<Tag color="gold">股权投委会<\/Tag>/);
});

test("places the investment committee preview before the general office preview and reuses type 3000", () => {
  const investmentPreviewIndex = source.indexOf("向投委会汇报预览");
  const officePreviewIndex = source.indexOf("向总办会汇报预览");

  assert.notEqual(investmentPreviewIndex, -1);
  assert.notEqual(officePreviewIndex, -1);
  assert.ok(investmentPreviewIndex < officePreviewIndex);

  const investmentPreviewSource = source.slice(
    Math.max(0, investmentPreviewIndex - 240),
    investmentPreviewIndex + 40,
  );
  assert.match(
    investmentPreviewSource,
    /onSave\(0, "3000"\)|onPreview\("3000"\)/,
  );
});

test("shows separate investment committee and general office meeting fields", () => {
  assert.match(source, /股权投委会议题名称/);
  assert.match(source, /总办会议题名称/);
  assert.match(source, /name="investmentScopeFlag"/);
  assert.match(source, /name="investmentAgendaItem"/);
  assert.match(source, /name="investmentMeetingTime"/);
  assert.match(source, /name="officeMeetingTime"/);
  assert.match(
    source,
    /5\.2\.7公司投资事业部、公司股权运营部负责管理的参股企业/,
  );
});

test("adds independent type 4000 approval material and preview", () => {
  assert.match(source, /4000: "股权投委会PDF预览"/);
  assert.match(source, /4000: "股权投委会审批"/);
  assert.match(source, /4000: "股权投委会审批议题材料\.pdf"/);
  assert.match(source, /\["1000", "2000", "3000", "4000"\]/);

  const flowStart = source.indexOf("function TopicApprovalFlowPanel");
  const flowSource = source.slice(flowStart);
  const investmentPreviewIndex = flowSource.indexOf("向投委会汇报预览");
  const officePreviewIndex = flowSource.indexOf("向总办会汇报预览");

  assert.notEqual(investmentPreviewIndex, -1);
  assert.notEqual(officePreviewIndex, -1);
  assert.ok(investmentPreviewIndex < officePreviewIndex);
  assert.match(
    flowSource.slice(investmentPreviewIndex - 220, investmentPreviewIndex),
    /setReviewType\("4000"\)/,
  );
});

test("uses approval-flow tabs for the joint-review confirmation panel", () => {
  assert.match(source, /function JointReviewApprovalTabs/);
  assert.match(source, /defaultActiveKey="office"/);
  assert.match(source, /label: "总办会审批流"/);
  assert.match(source, /label: "股权投委会审批流"/);
  assert.match(source, /const officeApprovalSteps/);
  assert.match(source, /const investmentApprovalSteps/);

  const jointPanelStart = source.indexOf("function JointOpinionPanel");
  const jointPanelSource = source.slice(
    jointPanelStart,
    jointPanelStart + 1800,
  );
  assert.match(jointPanelSource, /<JointReviewApprovalTabs \/>/);
});

test("shows independent office and investment committee meeting result sections", () => {
  const meetingPanelStart = source.indexOf("function MeetingMinutesPanel");
  const meetingPanelSource = source.slice(meetingPanelStart);

  assert.match(meetingPanelSource, /总办会会议信息/);
  assert.match(meetingPanelSource, /总办会会议决策/);
  assert.match(meetingPanelSource, /股权投委会会议信息/);
  assert.match(meetingPanelSource, /股权投委会会议决策/);
  assert.match(meetingPanelSource, /officeDecisionData/);
  assert.match(meetingPanelSource, /investmentDecisionData/);
  assert.match(meetingPanelSource, /officeFileList/);
  assert.match(meetingPanelSource, /investmentFileList/);
  assert.match(meetingPanelSource, /dateName: "investmentLaunchDate"/);
  assert.match(meetingPanelSource, /issueName: "investmentIssueNo"/);
});
