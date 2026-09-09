import { Descriptions, Modal, Tag } from "antd";
import styles from "./index.module.less";

const EMPTY_VALUE = "—";

function findHistory(record, keyword) {
  return [...(record?.history || [])]
    .reverse()
    .find((item) => item.text?.includes(keyword));
}

export default function ApprovalDetailModal({ record, open, onClose }) {
  const submitHistory = findHistory(record, "正式提交");
  const checkHistory = findHistory(record, "核对");
  const startHistory = findHistory(record, "发起分管领导");
  const startedAt =
    startHistory?.at || record?.startedAt || record?.createdAt || EMPTY_VALUE;
  const matter =
    record?.application?.project ||
    record?.project ||
    record?.reason ||
    "专家入库申请";
  const applicant = startHistory?.actor || "股权运营部经办人（演示）";

  const descriptionItems = [
    {
      key: "flowId",
      label: "流程编号",
      children: record?.flowId || EMPTY_VALUE,
    },
    {
      key: "expert",
      label: "专家",
      children: record
        ? [record.name, record.company].filter(Boolean).join(" · ") ||
          EMPTY_VALUE
        : EMPTY_VALUE,
    },
    { key: "matter", label: "申请事项", children: matter },
    {
      key: "stage",
      label: "当前状态",
      children: record?.stage ? (
        <Tag color="processing">{record.stage}</Tag>
      ) : (
        EMPTY_VALUE
      ),
    },
    { key: "startedAt", label: "发起时间", children: startedAt },
  ];

  return (
    <Modal
      title="专家入库审批详情"
      open={open}
      onCancel={onClose}
      footer={null}
      width={860}
      destroyOnClose
    >
      <Descriptions
        className={styles.summary}
        bordered
        column={2}
        items={descriptionItems}
      />

      <section className={styles.approvalSection}>
        <div className={styles.statusHead}>
          <h3 className={styles.sectionTitle}>当前审批状态</h3>
          <Tag color="processing">审批中</Tag>
        </div>
        <div className={styles.timeline}>
          <article className={`${styles.timelineItem} ${styles.applicant}`}>
            <div className={styles.nodeHeader}>
              <strong>申请人　{applicant}</strong>
              <span className={`${styles.badge} ${styles.initiatedBadge}`}>
                已发起
              </span>
            </div>
            <div className={styles.nodeTime}>{startedAt}</div>
            <p className={styles.nodeDescription}>
              发起 {record?.name || EMPTY_VALUE} 的专家入库审批
            </p>
          </article>

          <article className={`${styles.timelineItem} ${styles.completed}`}>
            <div className={styles.nodeHeader}>
              <strong>{checkHistory?.actor || "股权运营部（演示）"}</strong>
              <span className={`${styles.badge} ${styles.passedBadge}`}>
                核对通过
              </span>
            </div>
            <div className={styles.nodeTime}>
              {checkHistory?.at || submitHistory?.at || startedAt}
            </div>
            <p className={styles.nodeDescription}>
              {checkHistory?.text || "入库资料与人工校验核对完成"}
            </p>
          </article>

          <article className={`${styles.timelineItem} ${styles.completed}`}>
            <div className={styles.nodeHeader}>
              <strong>总监审批</strong>
              <span className={`${styles.badge} ${styles.passedBadge}`}>
                审批通过
              </span>
            </div>
            <div className={styles.nodeTime}>{startedAt}</div>
            <p className={styles.nodeDescription}>
              审批意见：同意提交分管领导审批
            </p>
          </article>

          <article className={`${styles.timelineItem} ${styles.pending}`}>
            <div className={styles.nodeHeader}>
              <strong>分管领导</strong>
              <span className={`${styles.badge} ${styles.pendingBadge}`}>
                待审批
              </span>
            </div>
            <div className={styles.nodeTime}>{startedAt}</div>
            <p className={styles.nodeDescription}>
              等待分管领导审批专家入库申请
            </p>
          </article>
        </div>
      </section>
    </Modal>
  );
}
