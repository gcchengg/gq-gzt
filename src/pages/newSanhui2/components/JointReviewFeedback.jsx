import { Button, Space, Table, Tag, message } from "antd";
import { useMemo, useState } from "react";

const initialJointReviewRows = [
  {
    id: "finance",
    deptName: "财务部",
    reviewerTaskName: "议题初审",
    reviewer: "刘红艳",
    reviewerStatus: "done",
    reviewerFeedback:
      "本次事项预计不会突破年度预算控制线，付款节奏与现金流安排基本匹配。建议补充未来三年收益测算表，并说明敏感性测算假设来源。",
    managerTaskName: "财务科室经理审核确认",
    manager: "王经理",
    managerStatus: "pending",
    managerFeedback:
      "测算口径需统一为税后口径，付款节点建议与协议生效条件绑定。请将收益测算底稿、资金计划表作为附件随议案同步提交。",
    needManagerConfirm: true,
  },
  {
    id: "audit-risk-legal",
    deptName: "审计风控与法务部",
    reviewerTaskName: "议题初审",
    reviewer: "李娜",
    reviewerStatus: "done",
    reviewerFeedback:
      "议案审议路径基本符合制度要求，未发现明显程序瑕疵。合同文本中违约责任、争议解决条款仍偏原则，建议明确赔偿上限及退出触发条件。",
    managerTaskName: "审计风控与法务科室经理审核确认",
    manager: "赵经理",
    managerStatus: "pending",
    managerFeedback:
      "请在表决建议中单列法律风险提示，重点说明交易对手履约能力、担保措施有效性及历史遗留事项处理安排。",
    needManagerConfirm: true,
  },
  {
    id: "investment",
    deptName: "投资部",
    reviewerTaskName: "议题初审",
    reviewer: "陈浩",
    reviewerStatus: "done",
    reviewerFeedback:
      "项目商业逻辑较清晰，退出路径与当前市场窗口基本匹配。建议补充同类项目估值对比，并在后续执行中按月跟踪关键里程碑。",
    managerTaskName: "",
    manager: "",
    managerStatus: "",
    managerFeedback: "",
    needManagerConfirm: false,
  },
  {
    id: "party",
    deptName: "党委工作部",
    reviewerTaskName: "议题初审",
    reviewer: "张雪",
    reviewerStatus: "pending",
    reviewerFeedback:
      "该事项暂不涉及干部任免、机构调整等党委前置研究事项。建议在议案说明中补充“不涉及党委会前置研究”的判断依据，便于留痕备查。",
    managerTaskName: "",
    manager: "",
    managerStatus: "",
    managerFeedback: "",
    needManagerConfirm: false,
  },
  {
    id: "general",
    deptName: "综合管理部",
    reviewerTaskName: "议题初审",
    reviewer: "周敏",
    reviewerStatus: "pending",
    reviewerFeedback:
      "会议材料格式基本符合三会管理要求。建议统一附件命名规则，补齐签批页、议程版本号和材料提交时间，避免会前分发口径不一致。",
    managerTaskName: "",
    manager: "",
    managerStatus: "",
    managerFeedback: "",
    needManagerConfirm: false,
  },
];

const statusConfig = {
  pending: { color: "warning", text: "未完成" },
  done: { color: "success", text: "已完成" },
};

function StatusTag({ status, emptyText = "-" }) {
  if (!status) return <span>{emptyText}</span>;
  const config = statusConfig[status] || statusConfig.pending;
  return <Tag color={config.color}>{config.text}</Tag>;
}

function FeedbackCell({ value }) {
  return <span>{value || "-"}</span>;
}

export default function JointReviewFeedback({ isEdit = false }) {
  const [rows, setRows] = useState(initialJointReviewRows);

  const completedCount = useMemo(
    () =>
      rows.filter(
        (item) =>
          item.reviewerStatus === "done" &&
          (!item.needManagerConfirm || item.managerStatus === "done"),
      ).length,
    [rows],
  );

  const handleRemind = (record, target) => {
    const targetName = target === "manager" ? record.manager : record.reviewer;
    const targetLabel = target === "manager" ? "科室经理" : "联审人";

    setRows((current) =>
      current.map((item) =>
        item.id === record.id
          ? {
              ...item,
              [`${target}Reminded`]: true,
            }
          : item,
      ),
    );
    message.success(
      `已提醒${record.deptName}${targetLabel}${targetName ? `（${targetName}）` : ""}`,
    );
  };

  const columns = [
    { title: "序号", width: 64, render: (_value, _row, index) => index + 1 },
    { title: "部门", dataIndex: "deptName", width: 150 },
    { title: "联审人任务", dataIndex: "reviewerTaskName", width: 190 },
    { title: "联审人", dataIndex: "reviewer", width: 100 },
    {
      title: "联审人状态",
      dataIndex: "reviewerStatus",
      width: 130,
      render: (value) => <StatusTag status={value} />,
    },
    {
      title: "联审人反馈建议",
      dataIndex: "reviewerFeedback",
      width: 280,
      render: (value) => <FeedbackCell value={value} />,
    },
    {
      title: "科室经理任务",
      dataIndex: "managerTaskName",
      width: 210,
      render: (value, record) => (record.needManagerConfirm ? value : "不涉及"),
    },
    {
      title: "科室经理",
      dataIndex: "manager",
      width: 120,
      render: (value, record) => (record.needManagerConfirm ? value : "-"),
    },
    {
      title: "科室经理状态",
      dataIndex: "managerStatus",
      width: 140,
      render: (value, record) =>
        record.needManagerConfirm ? (
          <StatusTag status={value || "pending"} />
        ) : (
          <span>不涉及</span>
        ),
    },
    {
      title: "科室经理反馈建议",
      dataIndex: "managerFeedback",
      width: 280,
      render: (value, record) =>
        record.needManagerConfirm ? (
          <FeedbackCell value={value} />
        ) : (
          <span>不涉及</span>
        ),
    },
    ...(isEdit
      ? [
          {
            title: "操作",
            key: "action",
            width: 180,
            fixed: "right",
            render: (_value, record) => {
              const reviewerDone = record.reviewerStatus === "done";
              const managerDone =
                !record.needManagerConfirm || record.managerStatus === "done";
              return (
                <Space size={4}>
                  <Button
                    type="link"
                    size="small"
                    disabled={reviewerDone}
                    onClick={() => handleRemind(record, "reviewer")}
                  >
                    {record.reviewerReminded ? "已提醒联审人" : "提醒联审人"}
                  </Button>
                  {record.needManagerConfirm ? (
                    <Button
                      type="link"
                      size="small"
                      disabled={managerDone}
                      onClick={() => handleRemind(record, "manager")}
                    >
                      {record.managerReminded ? "已提醒经理" : "提醒经理"}
                    </Button>
                  ) : null}
                </Space>
              );
            },
          },
        ]
      : []),
  ];

  return (
    <div className="review-panel joint-review-feedback-panel">
      <div className="review-warning">
        联审部门反馈共 {rows.length} 个部门，已完成 {completedCount}{" "}
        个。联审人任务和科室经理任务分别记录完成状态与反馈建议；财务部、审计风控与法务部需同时完成联审人及科室经理任务。
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={rows}
        pagination={false}
        size="small"
        scroll={{ x: isEdit ? 1980 : 1800 }}
      />
    </div>
  );
}
