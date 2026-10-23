import { normalizeConfig } from "./config.js";
import {
  approveReimbursement,
  confirmAccount,
  currentActor,
  generateBatch,
  normalizeSettlement,
  reviewBatch,
  saveReimbursement,
  shanghaiDate,
  submitBatchForReview,
} from "./settlement.js";

// Append once, without changing existing experts, bills, batches or operating rates.
export function seedSettlementDemo(state, now = new Date()) {
  normalizeSettlement(state);
  if (state.settlementDemoVersion >= 1) return state;
  const config = normalizeConfig();
  const actor = currentActor();
  const thisMonth = shanghaiDate(now).slice(0, 7);
  const sourceExpert = state.experts[0] || {};
  const sourceTask =
    state.tasks.find((item) => item.stage === "已评价完成") || {};
  function create(index, month, target, external = false) {
    const suffix = String(index).padStart(2, "0");
    const expertId = `EX-SETTLEMENT-DEMO-${suffix}`;
    const taskId = `RW-SETTLEMENT-DEMO-${suffix}`;
    if (
      state.tasks.some((item) => item.id === taskId) ||
      state.experts.some((item) => item.id === expertId)
    )
      return null;
    const name =
      [
        "顾明远",
        "林若溪",
        "陈书衡",
        "苏景行",
        "沈知微",
        "唐启航",
        "陆思源",
        "程嘉宁",
        "许文清",
      ][index - 1] + "（演示）";
    const date = `${month}-01`;
    const at =
      month === thisMonth
        ? new Date(now)
        : new Date(`${month}-02T10:00:00+08:00`);
    const feeId = external ? "fee-3" : "fee-8";
    const demoConfig = structuredClone(config);
    // Only this marked sample snapshot uses an explicit pretax external rate.
    // The actual operations configuration remains untouched.
    const fee = demoConfig.fees.find((item) => item.key === feeId);
    fee.basis = "税前";
    const settlement = {
      idType: "其他",
      idNo: `DEMO-ONLY-${suffix}`,
      expertType: external ? "外部" : "内部",
      feeId,
      accountName: name,
      bankName: "演示银行（非真实账号）",
      bankAccount: `00000000000000${suffix}`,
      accountVersion: 1,
      accountConfirmed: false,
    };
    state.experts.push({
      ...structuredClone(sourceExpert),
      id: expertId,
      name,
      initials: name[0],
      company: "费用结算演示研究院",
      sourceInvitationId: undefined,
      isDemo: true,
      settlement,
      history: [],
      evaluationHistory: [],
      projects: 1,
      expertType: settlement.expertType,
      feeId,
      idType: "其他",
      idNo: settlement.idNo,
    });
    const project =
      [
        "智能网联技术咨询",
        "新能源项目论证",
        "汽车软件架构评审",
        "供应链专项咨询",
        "财务合规咨询",
        "产业投资尽调",
        "海外业务咨询",
        "公司治理访谈",
        "机器人技术评估",
      ][index - 1] + "（演示）";
    const consultationRecord = {
      ...(structuredClone(sourceTask.consultationRecord) || {}),
      consultDate: date,
      minutes: 240,
      judgment:
        "演示结论：已完成专题访谈与咨询意见交付，建议纳入项目推进计划。",
      attachment: "咨询访谈记录（演示）.pdf",
      attachments: [{ name: "咨询访谈记录（演示）.pdf" }],
      savedAt: at.toISOString(),
    };
    state.tasks.push({
      ...structuredClone(sourceTask),
      id: taskId,
      isDemo: true,
      project,
      expertId,
      expert: name,
      applicant: actor.name,
      applicantId: actor.id,
      department: actor.department,
      stage: "已评价完成",
      freeService: false,
      fee: fee.amount,
      consultationRecord,
      versions: [
        {
          number: 1,
          at: at.toISOString(),
          content: consultationRecord.judgment,
          attachment: consultationRecord.attachment,
        },
      ],
      history: [
        {
          actor: actor.name,
          at: at.toISOString(),
          text: "演示调用已评价，可办理税前报销",
        },
      ],
      evaluations: [],
      evaluation: {
        total: 92,
        result: "优秀",
        submittedAt: at.toISOString(),
        evaluator: actor.name,
        comment: "演示服务已完成",
      },
    });
    const over = target === "分管领导审批中";
    const id = saveReimbursement(
      state,
      taskId,
      {
        lines: [{ date, days: 0.5, minutes: 240 }],
        amount: over ? fee.amount + 200 : fee.amount,
        period: "业余",
        reason: over ? "演示：增加现场专题论证工作，申请超出标准200元" : "",
      },
      target !== "草稿",
      demoConfig,
      at,
    );
    const record = state.reimbursements.find((item) => item.id === id);
    record.isDemo = true;
    const steps = {
      草稿: 0,
      部门负责人审批中: 0,
      财务负责人审批中: 1,
      分管领导审批中: 2,
      已退回: 0,
      已审批: 2,
    }[target];
    for (let step = 0; step < steps; step++)
      approveReimbursement(state, id, true, "演示：咨询事项及金额核对通过", at);
    if (target === "已退回")
      approveReimbursement(
        state,
        id,
        false,
        "演示：请补充服务日期及访谈内容说明",
        at,
      );
    return { id, expertId, at };
  }
  [
    "草稿",
    "部门负责人审批中",
    "财务负责人审批中",
    "分管领导审批中",
    "已退回",
    "已审批",
  ].forEach((status, index) =>
    create(index + 1, thisMonth, status, index === 5),
  );
  let candidate = new Date(`${thisMonth}-01T12:00:00+08:00`);
  ["已生成", "待汇总复核", "已确认"].forEach((target, index) => {
    let month = shanghaiDate(candidate).slice(0, 7);
    while (state.settlementBatches.some((item) => item.month === month)) {
      candidate.setUTCMonth(candidate.getUTCMonth() - 1);
      month = shanghaiDate(candidate).slice(0, 7);
    }
    const sample = create(index + 7, month, "已审批");
    if (!sample) return;
    // Isolate collection to this new sample; never collect existing user bills.
    const subset = {
      ...state,
      reimbursements: state.reimbursements.filter(
        (item) => item.id === sample.id,
      ),
      settlementBatches: [],
    };
    const id = generateBatch(subset, month, config, sample.at);
    const batch = subset.settlementBatches[0];
    batch.isDemo = true;
    state.settlementBatches.push(batch);
    if (target !== "已生成") {
      confirmAccount(state, sample.expertId, sample.at);
      submitBatchForReview(state, id, sample.at);
    }
    if (target === "已确认")
      reviewBatch(state, id, true, "演示：月度报销及账号复核通过", sample.at);
    candidate.setUTCMonth(candidate.getUTCMonth() - 1);
  });
  state.settlementDemoVersion = 1;
  return state;
}
