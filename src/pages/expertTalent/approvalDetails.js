import { approvalRole } from "./settlement.js";

// Adapter for local sample history; external workflow data can supply the same view model.
export function approvalSteps(record) {
  if (!record) return [];
  const history = record.history || [];
  const submittedIndex = history.findLastIndex((item) =>
    item.text?.startsWith("提交税前报销"),
  );
  if (submittedIndex < 0) return [];
  const submission = history[submittedIndex];
  const latest = history.slice(submittedIndex + 1);
  const currentRole = approvalRole(record.status);
  const roles = [
    "部门负责人",
    "财务负责人",
    ...(record.isOver ? ["分管领导"] : []),
  ];
  return [
    {
      key: `applicant-${record.version}`,
      title: "申请人",
      approver: submission.actor || record.applicant,
      state: "submitted",
      time: submission.at,
      remark: "提交调用报销",
    },
    ...roles.map((role) => {
      const entry = latest.findLast(
        (item) => item.stage === `${role}审批中` || item.role === role,
      );
      const returned =
        entry?.decision === "退回" || entry?.text?.startsWith("退回");
      return {
        key: role,
        title: role,
        approver: entry?.actor || "",
        state: entry
          ? returned
            ? "rejected"
            : "approved"
          : currentRole === role
            ? "processing"
            : "waiting",
        time: entry?.at,
        remark: entry?.text?.replace(/^(通过|退回)[：:]/, "") || "",
      };
    }),
  ];
}
