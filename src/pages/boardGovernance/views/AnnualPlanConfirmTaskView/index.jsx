import { useEffect, useState } from "react";
import { Button, Descriptions, message, Modal, Table } from "antd";
import { StatusPill } from "../../components/PageKit";
import styles from "./index.module.less";

export default function AnnualPlanConfirmTaskView({
  task,
  onSave,
  onClose,
  onSubmitComplete,
  generation = false,
}) {
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);

  useEffect(() => {
    setSelectedRowIds(task?.selectedRowIds || []);
  }, [task]);

  if (!task) return null;

  const save = (submit) => {
    if (!selectedRowIds.length) {
      message.warning("请至少选择一项年度履职计划");
      return;
    }
    if (submit) {
      setSubmitConfirmOpen(true);
      return;
    }
    onSave(task.id, selectedRowIds, false);
    message.success(`已保存 ${selectedRowIds.length} 项计划的确认结果`);
  };

  const submit = () => {
    onSave(task.id, selectedRowIds, true);
    setSubmitConfirmOpen(false);
    message.success(
      generation
        ? "年度履职计划已生成，履职任务已创建"
        : "年度履职计划确认/调整结果已提交",
    );
    if (onSubmitComplete) {
      onSubmitComplete();
    } else {
      onClose?.();
    }
  };

  return (
    <div className={styles.content}>
      <Descriptions
        bordered
        className={styles.summary}
        column={{ xs: 1, sm: 2, lg: 3 }}
        items={[
          { key: "director", label: "董事", children: task.directorName },
          { key: "company", label: "任职企业", children: task.company },
          {
            key: "period",
            label: "计划周期",
            children: `${task.year} · ${task.cycle}`,
          },
          {
            key: "title",
            label: "计划名称",
            children: task.report.title,
            span: 2,
          },
          {
            key: "status",
            label: "任务状态",
            children: <StatusPill>{task.status}</StatusPill>,
          },
        ]}
      />
      <div className={styles.selectionBar}>
        <div>
          <strong>年度履职计划明细</strong>
          <span>
            {generation
              ? "请选择纳入年度履职计划的事项，可多选后生成任务。"
              : "以下为编排阶段已选择的计划，可再次勾选调整后提交。"}
          </span>
        </div>
        <b>已选择 {selectedRowIds.length} 项</b>
      </div>
      <div className={styles.tableCard}>
        <Table
          rowKey="id"
          size="small"
          tableLayout="fixed"
          pagination={false}
          dataSource={task.rows}
          rowSelection={{
            columnWidth: 44,
            selectedRowKeys: selectedRowIds,
            onChange: setSelectedRowIds,
          }}
          columns={[
            {
              title: "序号",
              dataIndex: "seq",
              width: 58,
              align: "center",
              className: styles.sequenceColumn,
              render: (_value, _record, index) => (
                <span className={styles.sequenceNumber}>{index + 1}</span>
              ),
            },
            { title: "任职企业", dataIndex: "company", width: "15%" },
            { title: "工作类别", dataIndex: "category", width: "15%" },
            { title: "计划内容", dataIndex: "content", width: "27%" },
            { title: "计划时间", dataIndex: "date", width: "12%" },
            { title: "预期成果", dataIndex: "target", width: "25%" },
          ]}
        />
      </div>
      <p className={styles.reportNotes}>{task.report.notes}</p>
      <div className={styles.actionBar}>
        <span>
          {generation
            ? "演示数据：选择计划后生成年度履职任务。"
            : "保存可稍后继续办理；提交后将记录董事确认结果。"}
        </span>
        <div>
          <Button onClick={onClose}>取消</Button>
          <Button disabled={!selectedRowIds.length} onClick={() => save(false)}>
            保存
          </Button>
          <Button
            type="primary"
            disabled={!selectedRowIds.length}
            onClick={() => save(true)}
          >
            {generation ? "生成年度计划并创建任务" : "提交"}
          </Button>
        </div>
      </div>
      <Modal
        title={
          generation
            ? "确认生成年度履职计划并创建任务？"
            : "确认提交年度履职计划？"
        }
        open={submitConfirmOpen}
        okText="确认提交"
        cancelText="返回检查"
        onOk={submit}
        onCancel={() => setSubmitConfirmOpen(false)}
      >
        本次共选择 {selectedRowIds.length}
        项计划。
        {generation
          ? "确认后生成年度履职计划并创建任务。"
          : "提交后系统将记录董事的确认/调整结果，请确认无误后继续。"}
      </Modal>
    </div>
  );
}
