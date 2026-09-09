export const stageMeta = {
  待确认: {
    color: "default",
    tone: "#94a3b8",
    hint: "等待专家在小程序确认合作邀请",
  },
  待资料核对: {
    color: "processing",
    tone: "#1677ff",
    hint: "需经办人核对履历与入库申请表",
  },
  待补充资料: {
    color: "warning",
    tone: "#d48806",
    hint: "已退回，等待专家补充后重新提交",
  },
  核对完成: {
    color: "geekblue",
    tone: "#2f54eb",
    hint: "核对已通过，可发起分管领导审批",
  },
  领导审批中: {
    color: "processing",
    tone: "#1677ff",
    hint: "分管领导线上审批中",
  },
  审批退回: {
    color: "error",
    tone: "#cf1322",
    hint: "审批未通过，需修改后重新提交",
  },
  待签发聘书: {
    color: "gold",
    tone: "#d48806",
    hint: "审批已通过，需配置3年聘期并发送聘书",
  },
  待专家签署: {
    color: "purple",
    tone: "#722ed1",
    hint: "聘书已发送，等待E签宝签署回调",
  },
  已正式入库: {
    color: "success",
    tone: "#389e0d",
    hint: "双方签订完成，已生成可调用档案",
  },
};

export const stageStrip = [
  "待确认",
  "待资料核对",
  "领导审批中",
  "待签发聘书",
  "待专家签署",
  "已正式入库",
];

export const stageColor = (stage) => stageMeta[stage]?.color || "default";
export const stageTone = (stage) => stageMeta[stage]?.tone || "#94a3b8";
export const stageHint = (stage) => stageMeta[stage]?.hint || "";

export const taskStageMeta = {
  草稿: {
    color: "default",
    tone: "#94a3b8",
    hint: "需求部门尚未提交，可继续编辑",
  },
  调用受理中: {
    color: "processing",
    tone: "#1677ff",
    hint: "等待股权运营部受理申请",
  },
  匹配中: {
    color: "geekblue",
    tone: "#2f54eb",
    hint: "系统推荐候选，需求部门确认人选",
  },
  待运营排期: {
    color: "cyan",
    tone: "#08979c",
    hint: "人选已确认，等待锁定服务时间",
  },
  待专家签署声明: {
    color: "purple",
    tone: "#722ed1",
    hint: "排期已锁定，等待E签宝签署",
  },
  履约中: {
    color: "processing",
    tone: "#1677ff",
    hint: "声明已签署，可填写咨询记录",
  },
  服务中: {
    color: "processing",
    tone: "#1677ff",
    hint: "声明已签署，咨询服务进行中",
  },
  待补充: {
    color: "warning",
    tone: "#d48806",
    hint: "成果已退回，等待专家补充",
  },
  待验收: {
    color: "gold",
    tone: "#d48806",
    hint: "咨询记录已提交，等待需求部门验收",
  },
  待评价: { color: "blue", tone: "#2563eb", hint: "验收通过，等待履约评价" },
  已完成: { color: "success", tone: "#389e0d", hint: "评价已提交，任务关闭" },
  声明拒签: {
    color: "error",
    tone: "#cf1322",
    hint: "专家拒绝签署声明，任务暂不可履约",
  },
  声明失效: {
    color: "error",
    tone: "#cf1322",
    hint: "声明签署失效，需重新发起邀约",
  },
};

export const taskStageStrip = [
  "调用受理中",
  "匹配中",
  "待运营排期",
  "待专家签署声明",
  "服务中",
  "待验收",
  "待评价",
  "已完成",
];
export const taskStageColor = (stage) =>
  taskStageMeta[stage]?.color || "default";
export const taskStageTone = (stage) => taskStageMeta[stage]?.tone || "#94a3b8";
export const taskStageHint = (stage) => taskStageMeta[stage]?.hint || "";

export const expertStatusMeta = {
  可用: { color: "success", tone: "#389e0d", hint: "可发起调用" },
  忙碌: { color: "processing", tone: "#1677ff", hint: "当前有在办任务" },
  待续聘: { color: "warning", tone: "#d48806", hint: "聘期临近，需办理续聘" },
  续聘审批中: {
    color: "geekblue",
    tone: "#2f54eb",
    hint: "分管领导审批续聘中",
  },
  待签发续聘聘书: {
    color: "gold",
    tone: "#d48806",
    hint: "审批通过，待签发聘书",
  },
  限制调用: { color: "error", tone: "#cf1322", hint: "合规限制，不可新增调用" },
  已解聘: { color: "default", tone: "#94a3b8", hint: "已退出专家库" },
};

export const expertStatusStrip = [
  "可用",
  "忙碌",
  "待续聘",
  "续聘审批中",
  "待签发续聘聘书",
  "限制调用",
  "已解聘",
];
export const expertStatusColor = (status) =>
  expertStatusMeta[status]?.color || "default";
export const expertStatusTone = (status) =>
  expertStatusMeta[status]?.tone || "#94a3b8";
export const expertStatusHint = (status) =>
  expertStatusMeta[status]?.hint || "";
