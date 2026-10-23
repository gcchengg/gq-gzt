import assert from "node:assert/strict";
import test from "node:test";
import { approvalSteps } from "./approvalDetails.js";
const submit = {
  actor: "经办人",
  at: "2026-10-23T09:00:00+08:00",
  text: "提交税前报销 v1，普通审批",
};
test("draft approval is not started and history remains unmodified", () => {
  assert.deepEqual(approvalSteps({ status: "草稿", history: [] }), []);
  const record = {
    status: "财务负责人审批中",
    history: [
      submit,
      {
        actor: "部门负责人（演示）",
        role: "部门负责人",
        at: submit.at,
        text: "通过：同意",
      },
    ],
  };
  const before = JSON.stringify(record);
  const nodes = approvalSteps(record);
  assert.deepEqual(
    nodes.map((node) => node.state),
    ["submitted", "approved", "processing"],
  );
  assert.equal(nodes[0].approver, "经办人");
  assert.equal(nodes[1].remark, "同意");
  assert.equal(JSON.stringify(record), before);
});
test("over-limit route shows supervisor rejection with opinion and timestamp", () => {
  const record = {
    status: "已退回",
    isOver: true,
    history: [
      submit,
      { stage: "部门负责人审批中", decision: "通过", text: "通过：真实" },
      { stage: "财务负责人审批中", decision: "通过", text: "通过：金额正确" },
      {
        stage: "分管领导审批中",
        decision: "退回",
        actor: "分管领导（演示）",
        at: submit.at,
        text: "退回：补充超标原因",
      },
    ],
  };
  const nodes = approvalSteps(record);
  assert.deepEqual(
    nodes.map((row) => row.state),
    ["submitted", "approved", "approved", "rejected"],
  );
  assert.equal(nodes[3].remark, "补充超标原因");
  assert.equal(nodes[3].time, submit.at);
});
test("resubmitted bill shows current round without reusing past decisions", () => {
  const record = {
    status: "部门负责人审批中",
    history: [
      submit,
      { role: "部门负责人", text: "退回：原因" },
      { ...submit, text: "提交税前报销 v2，普通审批" },
    ],
  };
  const nodes = approvalSteps(record);
  assert.deepEqual(
    nodes.map((row) => row.state),
    ["submitted", "processing", "waiting"],
  );
  assert.equal(nodes[1].remark, "");
});
