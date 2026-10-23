import assert from "node:assert/strict";
import test from "node:test";
import { seedSettlementDemo } from "./settlementDemo.js";
import { normalizeConfig } from "./config.js";
import {
  approveReimbursement,
  batchCsv,
  confirmAccount,
  normalizeSettlement,
  reviewBatch,
  submitBatchForReview,
} from "./settlement.js";
const now = new Date("2026-10-22T12:00:00+08:00");
const empty = () =>
  normalizeSettlement({ experts: [], tasks: [], invitations: [] });
test("demo data covers reimbursement and batch states with valid source links and amounts", () => {
  const state = seedSettlementDemo(empty(), now);
  assert.equal(state.reimbursements.length, 9);
  assert.deepEqual(
    new Set(state.reimbursements.map((item) => item.status)),
    new Set([
      "草稿",
      "部门负责人审批中",
      "财务负责人审批中",
      "分管领导审批中",
      "已退回",
      "已审批",
    ]),
  );
  assert.deepEqual(
    new Set(state.settlementBatches.map((item) => item.status)),
    new Set(["已生成", "待汇总复核", "已确认"]),
  );
  for (const record of state.reimbursements) {
    const task = state.tasks.find((item) => item.id === record.taskId);
    assert.equal(task.expertId, record.expertId);
    assert.equal(task.applicantId, record.applicantId);
    assert.equal(task.stage, "已评价完成");
    assert.match(task.consultationRecord.attachment, /演示/);
    assert.equal(record.lines.length, 1);
  }
  for (const batch of state.settlementBatches) {
    assert.equal(
      batch.totalCents,
      batch.items.reduce((sum, row) => sum + row.amountCents, 0),
    );
    assert.equal(
      state.reimbursements.find(
        (row) => row.id === batch.items[0].reimbursementId,
      ).batchId,
      batch.id,
    );
  }
  assert.match(
    batchCsv(
      state,
      state.settlementBatches.find((item) => item.status === "已确认").id,
    ),
    /演示/,
  );
});
test("seed is persistent and idempotent, preserves existing data and leaves operation rates intact", () => {
  const state = empty();
  const existingExpert = { id: "existing", name: "已有专家" };
  const existingBatch = {
    id: "existing-batch",
    month: "2026-10",
    status: "已确认",
    items: [],
    totalCents: 0,
  };
  state.experts.push(existingExpert);
  state.settlementBatches.push(existingBatch);
  const configBefore = normalizeConfig();
  seedSettlementDemo(state, now);
  assert.equal(state.experts[0], existingExpert);
  assert.equal(state.settlementBatches[0], existingBatch);
  assert.equal(
    state.settlementBatches.filter((item) => item.month === "2026-10").length,
    1,
  );
  const snapshot = JSON.stringify(state);
  seedSettlementDemo(state, new Date("2026-11-01T10:00:00+08:00"));
  assert.equal(JSON.stringify(state), snapshot);
  assert.deepEqual(normalizeConfig(), configBefore);
  assert.equal(configBefore.fees[3].basis, "税后待确认");
});
test("mock pending reimbursement and batch can be advanced by the same operator", () => {
  const state = seedSettlementDemo(empty(), now);
  const record = state.reimbursements.find(
    (row) => row.status === "分管领导审批中",
  );
  approveReimbursement(state, record.id, true, "演示批准", now, record.status);
  assert.equal(record.status, "已审批");
  const batch = state.settlementBatches.find((row) => row.status === "已生成");
  for (const row of batch.items) confirmAccount(state, row.expertId, now);
  submitBatchForReview(state, batch.id, now);
  reviewBatch(state, batch.id, true, "演示复核", now);
  assert.match(batchCsv(state, batch.id), /演示/);
});
