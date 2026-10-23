import { effectiveFee, validMoney } from "./config.js";

export const demoOperator = Object.freeze({
  id: "caller-zheng",
  name: "郑华峰",
  role: "经办人",
  department: "战略投资部",
});
// A single local operator drives the prototype; approvers are workflow nodes only.
export const currentActor = () => demoOperator;
export const money = (cents = 0) =>
  (cents / 100).toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
export const mask = (value) =>
  value
    ? `${String(value).slice(0, 3)}${"*".repeat(Math.max(4, String(value).length - 7))}${String(value).slice(-4)}`
    : "未补齐";
export function shanghaiDate(now = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(now));
}
export const timestamp = (now = new Date()) => new Date(now).toISOString();
export const displayTime = (value) =>
  value
    ? new Date(value).toLocaleString("zh-CN", {
        timeZone: "Asia/Shanghai",
        hour12: false,
      })
    : "—";
const requireThat = (condition, message) => {
  if (!condition) throw new Error(message);
};
export function toCents(amount) {
  requireThat(
    /^(\d+)(\.\d{1,2})?$/.test(String(amount)) && Number(amount) <= 100000000,
    "请输入有效金额（最多两位小数，最高一亿元）",
  );
  return Math.round(Number(amount) * 100);
}
const event = (actor, text, now) => ({
  actor: actor.name,
  actorId: actor.id,
  role: actor.role,
  text,
  at: timestamp(now),
});

export function normalizeSettlement(state) {
  delete state.actorId;
  state.reimbursements = Array.isArray(state.reimbursements)
    ? state.reimbursements
    : [];
  state.settlementBatches = Array.isArray(state.settlementBatches)
    ? state.settlementBatches
    : [];
  state.settlementBatches.forEach((batch) => {
    if (batch.status === "待账号确认") batch.status = "已生成";
  });
  state.tasks.forEach((task) => {
    task.applicantId ||=
      task.applicant === demoOperator.name
        ? demoOperator.id
        : `legacy-${task.id}`;
  });
  return state;
}

export function settlementProfile(state, expertId) {
  const expert = state.experts.find((item) => item.id === expertId);
  if (!expert) return null;
  const invitation = state.invitations?.find(
    (item) => item.id === expert.sourceInvitationId,
  );
  return {
    idType: expert.idType || invitation?.profile?.idType || "身份证",
    idNo: expert.idNo || invitation?.profile?.idNo || "",
    expertType: expert.expertType || invitation?.profile?.expertType || "",
    feeId: expert.feeId || invitation?.profile?.feeId || "",
    accountName: "",
    bankName: "",
    bankAccount: "",
    accountVersion: 1,
    accountConfirmed: false,
    ...expert.settlement,
  };
}
export function saveSettlementProfile(
  state,
  expertId,
  values,
  config,
  now = new Date(),
) {
  const actor = currentActor(state);
  const expert = state.experts.find((item) => item.id === expertId);
  requireThat(expert, "专家不存在");
  const fee = config.fees.find((item) => item.key === values.feeId);
  requireThat(
    values.idNo?.trim() &&
      values.expertType &&
      fee &&
      fee.source === values.expertType &&
      fee.status === "启用",
    "请补齐证件、内外部身份并选择有效计费等级",
  );
  const old = settlementProfile(state, expertId);
  const changed = ["idNo", "accountName", "bankName", "bankAccount"].some(
    (key) => (values[key] || "").trim() !== (old[key] || ""),
  );
  const next = {
    ...old,
    ...values,
    accountConfirmed: changed ? false : old.accountConfirmed,
    accountVersion: (old.accountVersion || 1) + (changed ? 1 : 0),
  };
  ["idNo", "accountName", "bankName", "bankAccount"].forEach((key) => {
    next[key] = String(next[key] || "").trim();
  });
  if (changed) {
    delete next.confirmedBy;
    delete next.confirmedAt;
  }
  expert.settlement = next;
  expert.expertType = next.expertType;
  expert.feeId = next.feeId;
  expert.history ||= [];
  expert.history.push(
    event(
      actor,
      "维护专家计费与结算资料" + (changed ? "，收款资料已更新" : ""),
      now,
    ),
  );
}
export const paymentAccountComplete = (profile) =>
  Boolean(
    profile?.accountName?.trim() &&
    profile?.bankName?.trim() &&
    /^\d{6,30}$/.test(profile?.bankAccount || ""),
  );
export function savePaymentAccount(state, expertId, values, now = new Date()) {
  const expert = state.experts.find((item) => item.id === expertId);
  requireThat(expert, "专家不存在");
  const old = settlementProfile(state, expertId);
  const account = Object.fromEntries(
    ["accountName", "bankName", "bankAccount"].map((key) => [
      key,
      String(values[key] || "").trim(),
    ]),
  );
  requireThat(
    paymentAccountComplete(account),
    "请补齐收款户名、开户行和有效银行卡号（6—30位数字）",
  );
  const changed = Object.keys(account).some((key) => account[key] !== old[key]);
  if (!changed) return;
  expert.settlement = {
    ...old,
    ...account,
    accountVersion: (old.accountVersion || 1) + 1,
    accountConfirmed: false,
  };
  delete expert.settlement.confirmedBy;
  delete expert.settlement.confirmedAt;
  expert.history ||= [];
  expert.history.push(event(currentActor(state), "调用报销补充收款资料", now));
}
export function confirmAccount(state, expertId, now = new Date()) {
  const actor = currentActor(state);
  const profile = settlementProfile(state, expertId);
  requireThat(
    profile &&
      profile.idNo &&
      profile.accountName &&
      profile.bankName &&
      /^\d{6,30}$/.test(profile.bankAccount),
    "请补齐证件、户名、开户行和有效收款账号",
  );
  const expert = state.experts.find((item) => item.id === expertId);
  expert.settlement = {
    ...profile,
    accountConfirmed: true,
    confirmedBy: actor.name,
    confirmedAt: timestamp(now),
  };
  expert.history ||= [];
  expert.history.push(event(actor, "经办人确认收款账号及资料版本", now));
}
export function canCallExpert(expert, date = shanghaiDate()) {
  return Boolean(
    expert &&
    ![
      "已解聘",
      "限制调用",
      "不可用",
      "待续聘",
      "续聘审批中",
      "待签发续聘聘书",
    ].includes(expert.status) &&
    expert.risk === "正常" &&
    expert.termStart <= date &&
    expert.termEnd >= date &&
    expert.appointmentHistory?.some(
      (item) =>
        ["已生效", "已签署"].includes(item.status) ||
        item.sentAt ||
        item.signedAt,
    ),
  );
}

export function calculateAllowance(
  lines,
  fee,
  period = "业余",
  rule = "halfDay",
) {
  if (!fee) return 0;
  const amount =
    period === "工作" && fee.workAmount != null ? fee.workAmount : fee.amount;
  if (!validMoney(amount)) return 0;
  const rate = toCents(amount);
  const units = lines.reduce((total, line) => {
    if (rule === "legacy") {
      const minutes = Number(line.minutes);
      return (
        total +
        (minutes > 0 ? (minutes < 120 ? 0.5 : Math.ceil(minutes / 240)) : 0)
      );
    }
    return total + (Number(line.days) || 0) * 2;
  }, 0);
  return Math.round(
    rate *
      (rule === "legacy"
        ? Math.min(units, 4) + Math.max(units - 4, 0) * 0.5
        : units),
  );
}
export function saveReimbursement(
  state,
  taskId,
  values,
  submit,
  config,
  now = new Date(),
) {
  const actor = currentActor(state);
  const task = state.tasks.find((item) => item.id === taskId);
  requireThat(task && task.stage === "已评价完成", "仅已评价完成的调用可报销");
  requireThat(task.applicantId === actor.id, "仅原调用人可录入和提交报销");
  requireThat(!task.freeService, "无偿调用无需生成报销单");
  let record = state.reimbursements.find(
    (item) => item.taskId === taskId && item.status !== "已作废",
  );
  requireThat(
    !record ||
      (["草稿", "已退回", "已撤回"].includes(record.status) && !record.batchId),
    "当前单据已锁定，不可重复提交或修改",
  );
  if (
    ["accountName", "bankName", "bankAccount"].some(
      (key) => values[key] !== undefined,
    )
  ) {
    const account = Object.fromEntries(
      ["accountName", "bankName", "bankAccount"].map((key) => [
        key,
        String(values[key] || "").trim(),
      ]),
    );
    if (submit || paymentAccountComplete(account))
      savePaymentAccount(state, task.expertId, account, now);
  }
  const profile = settlementProfile(state, task.expertId);
  const fee = config.fees.find((item) => item.key === profile?.feeId);
  const lines = (values.lines || []).map((line) => ({
    date: line.date || "",
    days: Number(line.days) || 0,
    minutes: Number(line.minutes) || 0,
  }));
  const amountCents =
    values.amount === undefined ||
    values.amount === null ||
    values.amount === ""
      ? 0
      : toCents(values.amount);
  const standardCents = calculateAllowance(
    lines,
    fee,
    values.period,
    config.closing.billingRule,
  );
  if (submit) {
    requireThat(
      paymentAccountComplete(profile),
      "请先补齐收款户名、开户行和有效银行卡号",
    );
    requireThat(
      profile?.idNo &&
        profile.expertType &&
        fee &&
        fee.source === profile.expertType,
      "请先补齐专家证件、内外部身份及计费等级",
    );
    requireThat(
      fee.basis === "税前",
      "运营费用标准尚未确认税前金额，请业务维护后再提交",
    );
    requireThat(
      lines.length &&
        lines.every(
          (line) =>
            /^\d{4}-\d{2}-\d{2}$/.test(line.date) &&
            !Number.isNaN(Date.parse(`${line.date}T00:00:00+08:00`)) &&
            shanghaiDate(`${line.date}T00:00:00+08:00`) === line.date &&
            line.date <= shanghaiDate(now) &&
            line.days > 0 &&
            line.days <= 1 &&
            Number.isInteger(line.days * 2),
        ),
      "请填写实际服务日期和计费天数（每天0.5或1天，不得为未来日期）",
    );
    requireThat(
      new Set(lines.map((line) => line.date)).size === lines.length,
      "同一服务日期请合并为一行，避免重复计费",
    );
    requireThat(
      lines.every((line) => effectiveFee(fee, line.date)),
      "费用标准已停用或不在服务日期有效期内",
    );
    requireThat(
      config.closing.billingRule !== "legacy" ||
        lines.every((line) => line.minutes > 0 && line.minutes <= 1440),
      "旧时长折算须填写各日实际服务分钟数",
    );
    requireThat(
      amountCents > 0 && standardCents > 0,
      "有偿调用的报销金额与标准额度须大于0",
    );
    requireThat(
      amountCents <= standardCents || values.reason?.trim(),
      "税前金额超标，请填写超标原因",
    );
  }
  if (!record) {
    const prefix = `BX${shanghaiDate(now).slice(0, 7).replace("-", "")}`;
    const sequence =
      Math.max(
        0,
        ...state.reimbursements
          .filter((item) => item.number.startsWith(prefix))
          .map((item) => Number(item.number.slice(prefix.length))),
      ) + 1;
    requireThat(
      sequence <= 999,
      "本月BX三位流水已用尽，请运营处理编号扩位后继续",
    );
    record = {
      id: `reimbursement-${prefix}-${sequence}`,
      number: `${prefix}${String(sequence).padStart(3, "0")}`,
      taskId,
      expertId: task.expertId,
      applicantId: actor.id,
      applicant: task.applicant,
      department: task.department,
      project: task.project,
      createdAt: timestamp(now),
      history: [],
      revisions: [],
    };
    state.reimbursements.unshift(record);
  }
  Object.assign(record, {
    lines,
    period: values.period || "业余",
    amountCents,
    standardCents,
    reason: values.reason?.trim() || "",
    paymentDraft: submit
      ? undefined
      : Object.fromEntries(
          ["accountName", "bankName", "bankAccount"].map((key) => [
            key,
            values[key] ?? record.paymentDraft?.[key] ?? profile?.[key] ?? "",
          ]),
        ),
    isOver: amountCents > standardCents,
    status: submit ? "部门负责人审批中" : "草稿",
    version: (record.version || 0) + 1,
    updatedAt: timestamp(now),
  });
  if (submit) {
    record.feeSnapshot = structuredClone(fee);
    record.profileSnapshot = structuredClone(profile);
    record.billingRule = config.closing.billingRule;
    record.sourceSnapshot = {
      taskId,
      project: task.project,
      applicant: task.applicant,
      department: task.department,
      consultationRecord: structuredClone(task.consultationRecord || null),
      versions: structuredClone(task.versions || []),
    };
    record.revisions.push({
      version: record.version,
      amountCents,
      standardCents,
      lines: structuredClone(lines),
      submittedAt: timestamp(now),
      feeSnapshot: structuredClone(fee),
    });
  }
  record.history.push(
    event(
      actor,
      submit
        ? `提交税前报销 v${record.version}，${record.isOver ? "超标，追加分管领导" : "普通审批"}`
        : "保存报销草稿",
      now,
    ),
  );
  return record.id;
}
export function approveReimbursement(
  state,
  id,
  passed,
  opinion,
  now = new Date(),
  expectedStage,
) {
  const record = state.reimbursements.find((item) => item.id === id);
  const roles = {
    部门负责人审批中: "部门负责人",
    财务负责人审批中: "财务负责人",
    分管领导审批中: "分管领导",
  };
  requireThat(
    record &&
      roles[record.status] &&
      !record.batchId &&
      (!expectedStage || record.status === expectedStage),
    "审批节点已变化或单据已锁定，请刷新审批详情",
  );
  requireThat(opinion?.trim(), "请填写审批意见");
  const previous = record.status;
  const actor = {
    id: `demo-approval-${roles[previous]}`,
    name: `${roles[previous]}（演示）`,
    role: roles[previous],
  };
  if (!passed) record.status = "已退回";
  else if (previous === "部门负责人审批中") record.status = "财务负责人审批中";
  else if (previous === "财务负责人审批中" && record.isOver)
    record.status = "分管领导审批中";
  else {
    record.status = "已审批";
    record.approvedAt = timestamp(now);
  }
  record.history.push({
    ...event(actor, `${passed ? "通过" : "退回"}：${opinion.trim()}`, now),
    stage: previous,
    decision: passed ? "通过" : "退回",
    version: record.version,
    demonstration: true,
  });
}
export const approvalRole = (status) =>
  ({
    部门负责人审批中: "部门负责人",
    财务负责人审批中: "财务负责人",
    分管领导审批中: "分管领导",
  })[status];
export const canReadReimbursement = (_state, item) => Boolean(item);
export function closingInstant(month, config) {
  requireThat(/^\d{4}-(0[1-9]|1[0-2])$/.test(month), "结算月格式不正确");
  const [year, monthNumber] = month.split("-").map(Number);
  const day =
    config.closing.day || new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return `${month}-${String(day).padStart(2, "0")}T${config.closing.time}:59.999+08:00`;
}
export function generateBatch(
  state,
  month,
  config,
  now = new Date(),
  automatic = false,
) {
  const actor = currentActor(state);
  requireThat(month <= shanghaiDate(now).slice(0, 7), "不能生成未来月份汇总");
  let batch = state.settlementBatches.find((item) => item.month === month);
  const cutoff = batch?.cutoff || closingInstant(month, config);
  if (batch?.status === "已确认") {
    if (automatic) return null;
    throw new Error("批次已确认冻结，补报单请进入下一结算月");
  }
  const eligible = state.reimbursements.filter(
    (record) =>
      record.status === "已审批" &&
      record.approvedAt &&
      Date.parse(record.approvedAt) <=
        Math.min(Date.parse(cutoff), new Date(now).getTime()) &&
      (!record.batchId || record.batchId === batch?.id),
  );
  if (!eligible.length) return null;
  if (!batch) {
    batch = {
      id: `batch-${month}`,
      number: `HZ${month.replace("-", "")}`,
      month,
      cutoff,
      status: "已生成",
      version: 0,
      createdAt: timestamp(now),
      history: [],
      exports: [],
      items: [],
    };
    state.settlementBatches.unshift(batch);
  }
  const ids = eligible.map((item) => item.id);
  if (
    automatic &&
    batch.items.length === ids.length &&
    batch.items.every((item) => ids.includes(item.reimbursementId))
  )
    return null;
  batch.items = eligible.map((record) => ({
    reimbursementId: record.id,
    amountCents: record.amountCents,
    expertId: record.expertId,
  }));
  eligible.forEach((record) => {
    record.batchId = batch.id;
    record.batchNumber = batch.number;
  });
  batch.totalCents = eligible.reduce(
    (total, record) => total + record.amountCents,
    0,
  );
  batch.version += 1;
  batch.cutoff = cutoff;
  batch.status = "已生成";
  batch.history.push(
    event(
      automatic
        ? { id: "scheduler", name: "系统结账检查", role: "系统" }
        : actor,
      `${automatic ? "自动归集" : "生成/刷新"} v${batch.version}，${eligible.length}笔`,
      now,
    ),
  );
  return batch.id;
}
export function submitBatchForReview(state, id, now = new Date()) {
  const actor = currentActor(state);
  const batch = state.settlementBatches.find((item) => item.id === id);
  requireThat(batch?.status === "已生成", "批次状态已变化");
  requireThat(
    batch.items.every(
      (item) => settlementProfile(state, item.expertId)?.accountConfirmed,
    ),
    "仍有账号未补齐或未确认",
  );
  batch.items.forEach((item) => {
    item.accountSnapshot = structuredClone(
      settlementProfile(state, item.expertId),
    );
  });
  batch.status = "待汇总复核";
  batch.history.push(event(actor, "提交已确认的账号版本，进入汇总复核", now));
}
export function reviewBatch(state, id, passed, opinion, now = new Date()) {
  const actor = currentActor(state);
  const batch = state.settlementBatches.find((item) => item.id === id);
  requireThat(batch?.status === "待汇总复核", "批次不在待复核状态");
  requireThat(opinion?.trim(), "请填写汇总复核意见");
  if (passed) {
    requireThat(batch.items.length > 0, "空批次不可确认");
    requireThat(
      batch.items.every((item) => {
        const profile = settlementProfile(state, item.expertId);
        return (
          profile?.accountConfirmed &&
          profile.accountVersion === item.accountSnapshot?.accountVersion
        );
      }),
      "账号版本已变化，请退回重新确认",
    );
    requireThat(
      batch.items.every((item) => {
        const record = state.reimbursements.find(
          (row) => row.id === item.reimbursementId,
        );
        return (
          record?.status === "已审批" &&
          record.amountCents === item.amountCents &&
          record.batchId === batch.id
        );
      }),
      "报销明细与批准金额不一致",
    );
    batch.status = "已确认";
    batch.confirmedAt = timestamp(now);
  } else batch.status = "已生成";
  batch.history.push(
    event(
      actor,
      `${passed ? "确认并冻结汇总" : "退回补充资料"}：${opinion.trim()}`,
      now,
    ),
  );
}
const nextMonth = (month) => {
  const [year, number] = month.split("-").map(Number);
  return number === 12
    ? `${year + 1}-01`
    : `${year}-${String(number + 1).padStart(2, "0")}`;
};
export function runClosing(state, config, now = new Date()) {
  const thisMonth = shanghaiDate(now).slice(0, 7);
  const months = new Set();
  for (const record of state.reimbursements) {
    if (record.status !== "已审批" || !record.approvedAt) continue;
    const assigned = state.settlementBatches.find(
      (batch) => batch.id === record.batchId,
    );
    if (assigned?.status === "已确认") continue;
    let month = assigned?.month || shanghaiDate(record.approvedAt).slice(0, 7);
    while (month <= thisMonth) {
      const existing = state.settlementBatches.find(
        (batch) => batch.month === month,
      );
      const cutoff = Date.parse(
        existing?.cutoff || closingInstant(month, config),
      );
      if (
        Date.parse(record.approvedAt) > cutoff ||
        existing?.status === "已确认"
      ) {
        month = nextMonth(month);
        continue;
      }
      if (cutoff <= new Date(now).getTime()) months.add(month);
      break;
    }
  }
  const generated = [];
  [...months].sort().forEach((month) => {
    const id = generateBatch(state, month, config, now, true);
    if (id) generated.push(id);
  });
  return generated;
}

export function returnBatchItem(
  state,
  batchId,
  reimbursementId,
  opinion,
  now = new Date(),
) {
  const actor = currentActor(state);
  const batch = state.settlementBatches.find((item) => item.id === batchId);
  const record = state.reimbursements.find(
    (item) => item.id === reimbursementId,
  );
  requireThat(
    batch?.status === "待汇总复核" && record?.batchId === batch.id,
    "仅待复核批次可退回其报销单，已确认批次不可修改",
  );
  requireThat(opinion?.trim(), "请填写退回来源单据的原因");
  record.status = "已退回";
  delete record.batchId;
  delete record.batchNumber;
  delete record.approvedAt;
  record.history.push(
    event(actor, `月度复核退回原调用人更正：${opinion.trim()}`, now),
  );
  batch.items = batch.items.filter(
    (item) => item.reimbursementId !== reimbursementId,
  );
  batch.totalCents = batch.items.reduce(
    (total, item) => total + item.amountCents,
    0,
  );
  batch.version += 1;
  if (!batch.items.length) batch.status = "已生成";
  batch.history.push(
    event(actor, `退回${record.number}并重算汇总：${opinion.trim()}`, now),
  );
}

const csvCell = (value) => {
  const string = String(value ?? "");
  return `"${/^[=+@\-\t\r\n]/.test(string) ? "'" : ""}${string.replaceAll('"', '""')}"`;
};
export function batchCsv(state, batchId) {
  const batch = state.settlementBatches.find((item) => item.id === batchId);
  requireThat(batch, "汇总批次不存在");
  const rows = [
    [
      "汇总批次",
      "单据编号",
      "专家姓名",
      "证件号码",
      "服务日期",
      "税前报销金额",
      "个人所得税（本期未计算）",
      "增值税及附加（本期未计算）",
      "实发金额（本期未计算）",
      "收款户名",
      "开户行",
      "付款账号",
      "账号确认状态",
      "调用编号",
      "咨询事项",
      "调用人",
      "需求部门",
      "交付物",
    ],
  ];
  batch.items.forEach((item) => {
    const record = state.reimbursements.find(
      (row) => row.id === item.reimbursementId,
    );
    const profile =
      batch.status === "已生成"
        ? settlementProfile(state, item.expertId)
        : item.accountSnapshot || settlementProfile(state, item.expertId);
    const expert = state.experts.find((row) => row.id === item.expertId);
    const files =
      record.sourceSnapshot?.consultationRecord?.attachments
        ?.map((file) => file.name)
        .join("；") ||
      record.sourceSnapshot?.consultationRecord?.attachment ||
      "";
    rows.push([
      batch.number,
      record.number,
      expert?.name,
      profile?.idNo,
      record.lines.map((line) => line.date).join("；"),
      (item.amountCents / 100).toFixed(2),
      "",
      "",
      "",
      profile?.accountName,
      profile?.bankName,
      profile?.bankAccount,
      profile?.accountConfirmed ? "已确认" : "待确认",
      record.taskId,
      record.project,
      record.applicant,
      record.department,
      files,
    ]);
  });
  rows.push([
    "合计",
    `${batch.items.length}笔`,
    "",
    "",
    "",
    (batch.totalCents / 100).toFixed(2),
  ]);
  return "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}
