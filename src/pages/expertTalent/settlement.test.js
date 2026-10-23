import assert from "node:assert/strict";
import test from "node:test";
import { normalizeConfig, validateConfig } from "./config.js";
import {
  normalizeSettlement,
  currentActor,
  canReadReimbursement,
  calculateAllowance,
  saveReimbursement,
  approveReimbursement,
  generateBatch,
  confirmAccount,
  submitBatchForReview,
  reviewBatch,
  returnBatchItem,
  batchCsv,
  runClosing,
  saveSettlementProfile,
  toCents,
  closingInstant,
  canCallExpert,
} from "./settlement.js";
const now = new Date("2026-10-20T09:00:00+08:00");
function fixture() {
  const config = normalizeConfig();
  config.fees[0].basis = "税前";
  config.fees[0].amount = 1000;
  const state = normalizeSettlement({
    actorId: "caller-zheng",
    tasks: [
      {
        id: "T1",
        expertId: "E1",
        applicant: "郑华峰",
        department: "投资部",
        project: "咨询",
        stage: "已评价完成",
      },
    ],
    experts: [
      {
        id: "E1",
        name: "专家甲",
        settlement: {
          idNo: "123456789012345678",
          expertType: "外部",
          feeId: "fee-0",
          accountVersion: 1,
          accountName: "专家甲",
          bankName: "银行",
          bankAccount: "1234567890123456",
        },
      },
    ],
    invitations: [],
  });
  return {
    config,
    state,
    values: {
      lines: [{ date: "2026-09-28", days: 0.5, minutes: 120 }],
      amount: 1000,
      period: "业余",
    },
  };
}
function approved(extra = {}) {
  const f = fixture();
  const id = saveReimbursement(
    f.state,
    "T1",
    { ...f.values, ...extra },
    true,
    f.config,
    now,
  );
  f.state.actorId = "department-head";
  approveReimbursement(f.state, id, true, "业务真实", now);
  f.state.actorId = "finance-head";
  approveReimbursement(f.state, id, true, "金额正确", now);
  if (f.state.reimbursements[0].isOver) {
    f.state.actorId = "supervisor";
    approveReimbursement(f.state, id, true, "同意超标", now);
  }
  return { ...f, id };
}
test("half-day conversion uses cents and multiple-day totals", () => {
  const { config } = fixture();
  assert.equal(calculateAllowance([{ days: 0.5 }], config.fees[0]), 100000);
  assert.equal(
    calculateAllowance([{ days: 0.5 }, { days: 1 }], config.fees[0]),
    300000,
  );
  assert.equal(toCents("0.29"), 29);
  assert.throws(() => toCents("1.234"));
  assert.throws(() => toCents(-1));
});
test("legacy discount accumulates across dates, not per line", () => {
  const { config } = fixture();
  assert.equal(
    calculateAllowance([{ minutes: 60 }], config.fees[0], "业余", "legacy"),
    50000,
  );
  assert.equal(
    calculateAllowance(
      [{ minutes: 480 }, { minutes: 480 }, { minutes: 240 }],
      config.fees[0],
      "业余",
      "legacy",
    ),
    450000,
  );
});
test("ownership, completion and free-service guards are enforced in model", () => {
  const { state, config, values } = fixture();
  state.tasks[0].applicantId = "caller-li";
  assert.throws(
    () => saveReimbursement(state, "T1", values, true, config, now),
    /原调用人/,
  );
  state.tasks[0].applicantId = "caller-zheng";
  state.tasks[0].stage = "待评价";
  assert.throws(
    () => saveReimbursement(state, "T1", values, true, config, now),
    /已评价/,
  );
  state.tasks[0].stage = "已评价完成";
  state.tasks[0].freeService = true;
  assert.throws(
    () => saveReimbursement(state, "T1", values, false, config, now),
    /无偿/,
  );
});
test("tax-after standards require an explicit business update", () => {
  const { state, config, values } = fixture();
  config.fees[0].basis = "税后待确认";
  assert.throws(
    () => saveReimbursement(state, "T1", values, true, config, now),
    /税前/,
  );
  assert.equal(state.reimbursements.length, 0);
});
test("duplicate dates, future services and invalid durations cannot submit", () => {
  const { state, config, values } = fixture();
  assert.throws(
    () =>
      saveReimbursement(
        state,
        "T1",
        { ...values, lines: [...values.lines, ...values.lines] },
        true,
        config,
        now,
      ),
    /合并/,
  );
  assert.throws(
    () =>
      saveReimbursement(
        state,
        "T1",
        { ...values, lines: [{ date: "2027-01-01", days: 0.5 }] },
        true,
        config,
        now,
      ),
    /日期/,
  );
  assert.throws(
    () =>
      saveReimbursement(
        state,
        "T1",
        { ...values, lines: [{ date: "2026-10-01", days: 0.25 }] },
        true,
        config,
        now,
      ),
    /计费/,
  );
});
test("draft save reuses BX; first submit locks duplicate submissions", () => {
  const { state, config, values } = fixture();
  const id = saveReimbursement(state, "T1", values, false, config, now);
  assert.equal(saveReimbursement(state, "T1", values, true, config, now), id);
  assert.equal(state.reimbursements.length, 1);
  assert.equal(state.reimbursements[0].number, "BX202610001");
  assert.throws(
    () => saveReimbursement(state, "T1", values, true, config, now),
    /锁定/,
  );
});
test("ordinary reimbursement requires department then finance and saves snapshots", () => {
  const { state, config, values } = fixture();
  const id = saveReimbursement(state, "T1", values, true, config, now);
  state.actorId = "finance-head";
  assert.throws(
    () =>
      approveReimbursement(
        state,
        id,
        true,
        "跳过部门",
        now,
        "财务负责人审批中",
      ),
    /节点已变化/,
  );
  state.actorId = "department-head";
  approveReimbursement(state, id, true, "同意", now);
  assert.equal(state.reimbursements[0].status, "财务负责人审批中");
  state.actorId = "finance-head";
  approveReimbursement(state, id, true, "同意", now);
  assert.equal(state.reimbursements[0].status, "已审批");
  config.fees[0].amount = 999;
  assert.equal(state.reimbursements[0].feeSnapshot.amount, 1000);
});
test("over-standard requires reason and extra supervisor; returned draft resubmits full chain", () => {
  const { state, config, values } = fixture();
  assert.throws(
    () =>
      saveReimbursement(
        state,
        "T1",
        { ...values, amount: 1200 },
        true,
        config,
        now,
      ),
    /超标原因/,
  );
  const id = saveReimbursement(
    state,
    "T1",
    { ...values, amount: 1200, reason: "额外工作" },
    true,
    config,
    now,
  );
  state.actorId = "department-head";
  approveReimbursement(state, id, true, "同意", now);
  state.actorId = "finance-head";
  approveReimbursement(state, id, true, "同意", now);
  assert.equal(state.reimbursements[0].status, "分管领导审批中");
  state.actorId = "supervisor";
  approveReimbursement(state, id, false, "补充说明", now);
  state.actorId = "caller-zheng";
  saveReimbursement(state, "T1", values, true, config, now);
  assert.equal(state.reimbursements[0].status, "部门负责人审批中");
  assert.equal(state.reimbursements[0].revisions.length, 2);
});
test("monthly collection includes prior service months and is idempotent", () => {
  const { state, config } = approved();
  state.actorId = "operations";
  const id = generateBatch(state, "2026-10", config, now);
  generateBatch(state, "2026-10", config, now);
  assert.equal(state.settlementBatches.length, 1);
  assert.equal(state.settlementBatches[0].items.length, 1);
  assert.equal(state.settlementBatches[0].totalCents, 100000);
  assert.equal(state.reimbursements[0].batchId, id);
  assert.equal(generateBatch(state, "2026-09", config, now), null);
});
test("late approval follows configured cutoff and enters following month", () => {
  const { state, config } = approved();
  state.actorId = "operations";
  config.closing.day = 19;
  assert.equal(generateBatch(state, "2026-10", config, now), null);
  const later = new Date("2026-11-20T09:00:00+08:00");
  assert.ok(generateBatch(state, "2026-11", config, later));
});
test("same operator confirms account and edits invalidate confirmation", () => {
  const { state, config } = fixture();
  assert.equal(currentActor(state).role, "经办人");
  state.actorId = "hr";
  confirmAccount(state, "E1", now);
  saveSettlementProfile(
    state,
    "E1",
    { ...state.experts[0].settlement, bankAccount: "222222222222" },
    config,
    now,
  );
  assert.equal(state.experts[0].settlement.accountConfirmed, false);
});
test("confirmation checks account versions; approved batch is frozen", () => {
  const { state, config } = approved();
  state.actorId = "operations";
  const id = generateBatch(state, "2026-10", config, now);
  state.actorId = "hr";
  assert.throws(() => submitBatchForReview(state, id, now), /未确认/);
  confirmAccount(state, "E1", now);
  submitBatchForReview(state, id, now);
  saveSettlementProfile(
    state,
    "E1",
    { ...state.experts[0].settlement, bankAccount: "222222222222" },
    config,
    now,
  );
  state.actorId = "finance-head";
  assert.throws(() => reviewBatch(state, id, true, "同意", now), /版本已变化/);
  reviewBatch(state, id, false, "重确认", now);
  state.actorId = "hr";
  confirmAccount(state, "E1", now);
  submitBatchForReview(state, id, now);
  state.actorId = "finance-head";
  reviewBatch(state, id, true, "通过", now);
  assert.throws(() => generateBatch(state, "2026-10", config, now), /冻结/);
  assert.equal(state.settlementBatches[0].status, "已确认");
});
test("formal export has no batch-status restriction and tax columns remain blank", () => {
  const { state, config } = approved();
  state.actorId = "operations";
  const id = generateBatch(state, "2026-10", config, now);
  for (const status of ["已生成", "待汇总复核", "已确认", "付款中", "已付款"]) {
    state.settlementBatches[0].status = status;
    const before = structuredClone(state.settlementBatches[0]);
    assert.match(batchCsv(state, id), /本期未计算/);
    assert.deepEqual(state.settlementBatches[0], before);
  }
  assert.throws(() => batchCsv(state, "missing"), /不存在/);
  state.experts[0].name = '=HYPERLINK("bad")';
  const csv = batchCsv(state, id);
  assert.match(csv, /本期未计算/);
  assert.match(csv, /"1000.00","","",""/);
  assert.ok(csv.includes("\"'=HYPERLINK"));
  state.actorId = "caller-zheng";
  assert.match(batchCsv(state, id), /本期未计算/);
});
test("closing runner catches up and skips duplicate work", () => {
  const { state, config } = approved();
  const later = new Date("2026-11-01T00:01:00+08:00");
  assert.equal(runClosing(state, config, later).length, 1);
  assert.equal(runClosing(state, config, later).length, 0);
  assert.equal(
    closingInstant("2026-02", config),
    "2026-02-28T23:59:59.999+08:00",
  );
});
test("legacy config is migrated without silently converting after-tax rates", () => {
  const config = normalizeConfig({
    fees: [
      {
        key: 0,
        source: "外聘",
        level: "高级",
        amount: 2000,
        note: "税后",
        status: "启用",
      },
    ],
  });
  assert.equal(config.fees[0].basis, "税后待确认");
  assert.equal(config.fees[0].key, "fee-0");
  validateConfig(config);
});
test("appointment issued as effective is callable but expired and restricted experts are excluded", () => {
  const expert = {
    status: "可用",
    risk: "正常",
    termStart: "2026-01-01",
    termEnd: "2029-01-01",
    appointmentHistory: [{ status: "已生效", sentAt: "2026-01-01" }],
  };
  assert.equal(canCallExpert(expert, "2026-10-22"), true);
  assert.equal(
    canCallExpert({ ...expert, status: "限制调用" }, "2026-10-22"),
    false,
  );
  assert.equal(canCallExpert(expert, "2029-10-22"), false);
});

test("automatic closing carries late approval into the next due month", () => {
  const { state, config } = approved();
  config.closing.day = 19;
  assert.equal(
    runClosing(state, config, new Date("2026-10-20T10:00:00+08:00")).length,
    0,
  );
  assert.equal(
    runClosing(state, config, new Date("2026-11-20T10:00:00+08:00")).length,
    1,
  );
  assert.equal(state.settlementBatches[0].month, "2026-11");
});
test("invalid configured money is rejected without breaking allowance rendering", () => {
  const { config } = fixture();
  config.fees[0].amount = 1000.123;
  assert.throws(() => validateConfig(config), /金额/);
  assert.equal(calculateAllowance([{ days: 0.5 }], config.fees[0]), 0);
});
test("automatic closing moves supplemental approvals past frozen batches", () => {
  const { state, config } = approved();
  state.actorId = "operations";
  const batchId = generateBatch(state, "2026-10", config, now);
  state.settlementBatches[0].status = "已确认";
  state.reimbursements.push({
    ...structuredClone(state.reimbursements[0]),
    id: "late",
    number: "BX202610002",
    batchId: undefined,
    batchNumber: undefined,
  });
  assert.equal(
    runClosing(state, config, new Date("2026-11-30T23:59:59.999+08:00")).length,
    1,
  );
  assert.equal(
    state.reimbursements.find((row) => row.id === "late").batchId,
    "batch-2026-11",
  );
  assert.equal(state.reimbursements[0].batchId, batchId);
});

test("financial batch review can return an incorrect source bill for full reapproval", () => {
  const { state, config, values, id } = approved();
  state.actorId = "operations";
  const batchId = generateBatch(state, "2026-10", config, now);
  state.actorId = "hr";
  confirmAccount(state, "E1", now);
  submitBatchForReview(state, batchId, now);
  state.actorId = "finance-head";
  returnBatchItem(state, batchId, id, "服务天数错误", now);
  assert.equal(state.reimbursements[0].status, "已退回");
  assert.equal(state.reimbursements[0].batchId, undefined);
  assert.equal(state.settlementBatches[0].totalCents, 0);
  state.actorId = "caller-zheng";
  saveReimbursement(state, "T1", values, true, config, now);
  assert.equal(state.reimbursements[0].status, "部门负责人审批中");
  assert.equal(state.reimbursements.length, 1);
});

test("created monthly batch keeps its cutoff when operators change future closing rules", () => {
  const { state, config } = approved();
  state.actorId = "operations";
  const id = generateBatch(state, "2026-10", config, now);
  const cutoff = state.settlementBatches[0].cutoff;
  config.closing.day = 19;
  generateBatch(state, "2026-10", config, now);
  assert.equal(state.settlementBatches[0].cutoff, cutoff);
  assert.equal(state.settlementBatches[0].items.length, 1);
  assert.equal(state.reimbursements[0].batchId, id);
});
test("frozen export retains the confirmed account after profile changes", () => {
  const { state, config } = approved();
  state.actorId = "operations";
  const id = generateBatch(state, "2026-10", config, now);
  state.actorId = "hr";
  confirmAccount(state, "E1", now);
  submitBatchForReview(state, id, now);
  state.actorId = "finance-head";
  reviewBatch(state, id, true, "资料完整", now);
  state.actorId = "hr";
  saveSettlementProfile(
    state,
    "E1",
    { ...state.experts[0].settlement, bankAccount: "999999999999" },
    config,
    now,
  );
  assert.match(batchCsv(state, id), /1234567890123456/);
  assert.doesNotMatch(batchCsv(state, id), /999999999999/);
});

test("old role selection has no effect and normalization removes it", () => {
  const { state } = fixture();
  state.actorId = "supervisor";
  assert.equal(currentActor(state).id, "caller-zheng");
  assert.equal(canReadReimbursement(state, { applicantId: "other" }), true);
  normalizeSettlement(state);
  assert.equal(state.actorId, undefined);
});

test("reimbursement can save missing payment data as draft but requires complete account on submission", () => {
  const { state, config, values } = fixture();
  Object.assign(state.experts[0].settlement, {
    accountName: "",
    bankName: "",
    bankAccount: "",
  });
  const draft = {
    ...values,
    accountName: "测试专家",
    bankName: "",
    bankAccount: "",
  };
  const id = saveReimbursement(state, "T1", draft, false, config, now);
  assert.equal(state.reimbursements[0].paymentDraft.accountName, "测试专家");
  assert.throws(
    () => saveReimbursement(state, "T1", draft, true, config, now),
    /收款/,
  );
  const complete = {
    ...draft,
    bankName: "演示银行",
    bankAccount: "0000000001234567",
  };
  assert.equal(saveReimbursement(state, "T1", complete, true, config, now), id);
  assert.equal(state.experts[0].settlement.bankAccount, complete.bankAccount);
  assert.equal(
    state.reimbursements[0].profileSnapshot.bankAccount,
    complete.bankAccount,
  );
  assert.equal(state.reimbursements[0].paymentDraft, undefined);
});

test("payment account maintenance preserves identity, fee and submitted snapshots", async () => {
  const { savePaymentAccount } = await import("./settlement.js");
  const { state, config, values } = fixture();
  saveReimbursement(state, "T1", values, true, config, now);
  const snapshot = structuredClone(state.reimbursements[0].profileSnapshot);
  const original = structuredClone(state.experts[0].settlement);
  const data = {
    accountName: " 新户名 ",
    bankName: " 新银行 ",
    bankAccount: "0000000001234567",
    feeId: "ignored",
    expertType: "内部",
  };
  savePaymentAccount(state, "E1", data, now);
  assert.equal(state.experts[0].settlement.accountName, "新户名");
  assert.equal(state.experts[0].settlement.idNo, original.idNo);
  assert.equal(state.experts[0].settlement.feeId, original.feeId);
  assert.equal(state.experts[0].settlement.expertType, original.expertType);
  assert.deepEqual(state.reimbursements[0].profileSnapshot, snapshot);
  assert.throws(
    () => savePaymentAccount(state, "E1", { ...data, bankAccount: "bad" }),
    /银行卡/,
  );
});

test("monthly batch no longer uses account-confirmation state and migrates legacy records", () => {
  const { state, config } = approved();
  const id = generateBatch(state, "2026-10", config, now);
  const batch = state.settlementBatches.find((item) => item.id === id);
  assert.equal(batch.status, "已生成");
  const before = structuredClone(batch);
  batch.status = "待账号确认";
  normalizeSettlement(state);
  assert.deepEqual(batch, before);
  batch.status = "已确认";
  normalizeSettlement(state);
  assert.equal(batch.status, "已确认");
});
