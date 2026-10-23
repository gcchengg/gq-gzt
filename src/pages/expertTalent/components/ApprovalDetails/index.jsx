import { Alert, Button, Descriptions, Modal, Steps, Tag } from "antd";
import { approvalSteps } from "../../approvalDetails";
import { displayTime, money } from "../../settlement";
import { useExpertStore } from "../../store";
import rejectedIcon from "./images/bohui.svg";
import approvedIcon from "./images/tongguo.svg";
import processingIcon from "./images/shenpi.svg";
import waitingIcon from "./images/weikaishi.svg";
import styles from "./index.module.less";
const labels = {
  submitted: "已提交",
  approved: "审批通过",
  rejected: "不通过",
  processing: "审批中",
  waiting: "未开始",
};
const icons = {
  submitted: waitingIcon,
  approved: approvedIcon,
  rejected: rejectedIcon,
  processing: processingIcon,
  waiting: waitingIcon,
};
const stepStatus = {
  submitted: "finish",
  approved: "finish",
  rejected: "error",
  processing: "process",
  waiting: "wait",
};

export default function ApprovalDetails({ recordId, open, onClose }) {
  const state = useExpertStore();
  const record = state.reimbursements.find((item) => item.id === recordId);
  const nodes = approvalSteps(record);
  return (
    <Modal
      title="报销审批详情"
      open={open}
      onCancel={onClose}
      footer={<Button onClick={onClose}>关闭</Button>}
      width={720}
    >
      {record ? (
        <div className={styles.content}>
          <Descriptions
            size="small"
            column={2}
            items={[
              { key: "number", label: "单据编号", children: record.number },
              {
                key: "amount",
                label: "税前金额",
                children: `¥${money(record.amountCents)}`,
              },
            ]}
          />
          <div className={styles.projectRight}>
            <div className={styles.projectTitleWraper}>
              <div className={styles.projectApproval}>
                <div className={styles.projectApprovalTitle}>当前审批状态</div>
                <div className={styles.approvalStatus}>
                  调用报销 · {record.status}
                </div>
              </div>
              <Tag>{nodes.length ? record.status : "未启动"}</Tag>
            </div>
            {nodes.length ? (
              <Steps
                direction="vertical"
                items={nodes.map((node) => ({
                  key: node.key,
                  status: stepStatus[node.state],
                  icon: (
                    <img
                      src={icons[node.state]}
                      className={styles.stepImg}
                      alt=""
                    />
                  ),
                  title: (
                    <div className={styles.stepTitle}>
                      <div className={styles.titleLeft}>
                        <span className={styles.stepIndex}>
                          {node.title}　{node.approver}
                        </span>
                        <span
                          className={`${styles.titleRight} ${styles[node.state]}`}
                        >
                          {labels[node.state]}
                        </span>
                      </div>
                      <span className={styles.stepTime}>
                        {node.time ? displayTime(node.time) : "—"}
                      </span>
                      {node.remark ? (
                        <span
                          className={
                            node.state === "rejected"
                              ? styles.stepRejected
                              : styles.stepRemark
                          }
                        >
                          {node.state === "submitted"
                            ? ""
                            : node.state === "rejected"
                              ? "驳回原因："
                              : "审批意见："}
                          {node.remark}
                        </span>
                      ) : null}
                    </div>
                  ),
                }))}
              />
            ) : (
              <Alert type="info" message="报销尚未提交，审批流程未启动" />
            )}
          </div>
        </div>
      ) : (
        <Alert type="info" message="请先保存报销单" />
      )}
    </Modal>
  );
}
