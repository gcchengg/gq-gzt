import { useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  Descriptions,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
} from "antd";
import {
  CheckCircleOutlined,
  UnorderedListOutlined,
  PlusOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { confirmationOwners } from "../../../../dutyPlanData";
import { dutyQuarters, dutyYears } from "../../../../dutyPlanOptions";
import {
  DataTable,
  SectionCard,
  StatusPill,
} from "../../../../components/PageKit";
import AnnualPlanConfirmTaskView from "../../../AnnualPlanConfirmTaskView";
import { buildAnnualPlanConfirmationTask } from "../../../../annualPlanConfirmationData";
import { buildAnnualDutyPlanReport } from "./annualPlanReport.js";
import styles from "./index.module.less";

export default function DutyPlanWorkspace({
  embedded = false,
  mode = "default",
  createOpen,
  onCreateOpenChange,
  plans,
  onDeletePlan,
  onSubmitPlan,
  onGenerateTasks,
  annualGenerated,
  activeDirector,
}) {
  const [resultPlan, setResultPlan] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedAnnualIds, setSelectedAnnualIds] = useState(null);
  const [selectedDraftIds, setSelectedDraftIds] = useState([]);
  const [planSummaries, setPlanSummaries] = useState(() => [
    {
      id: "plan-summary-demo",
      directorName: activeDirector.name,
      dutyType: "年度",
      dutyYear: "2026年",
      dutyQuarter: "四季度",
      confirmOwners: [activeDirector.name, "阮迪"],
      submittedAt: "2026-09-22 09:10",
    },
  ]);
  const [form] = Form.useForm();
  const draftCount = useMemo(
    () => plans.filter((item) => item.status === "草稿").length,
    [plans],
  );
  const annualReport = useMemo(
    () => buildAnnualDutyPlanReport(activeDirector),
    [activeDirector],
  );
  const annualSelectionTask = useMemo(() => {
    const task = buildAnnualPlanConfirmationTask({
      director: activeDirector,
      report: annualReport,
      submittedAt: "2026-09-22 10:00",
    });
    return {
      ...task,
      status: annualGenerated ? "已生成" : "待选择",
      selectedRowIds:
        selectedAnnualIds || task.rows.slice(0, 6).map((row) => row.id),
      report: {
        ...task.report,
        notes:
          "演示数据：勾选需要纳入年度履职计划的事项，董事确认时可对已选计划再次调整。",
      },
    };
  }, [activeDirector, annualReport, annualGenerated, selectedAnnualIds]);

  const closeComposer = () => {
    onCreateOpenChange(false);
    form.resetFields();
  };

  const savePlan = () => {
    const values = form.getFieldsValue();
    setPlanSummaries((current) => [
      ...current,
      {
        ...values,
        id: `plan-summary-${Date.now()}`,
        submittedAt: new Date().toLocaleString("zh-CN", { hour12: false }),
      },
    ]);
    message.success("年度履职计划已保存");
    closeComposer();
  };

  const submitPlan = (plan) => {
    onSubmitPlan?.(plan.id);
    setSelectedDraftIds((current) => current.filter((id) => id !== plan.id));
    message.success(`“${plan.content}”已提交`);
  };

  const toggleDraftSelection = (planId, checked) => {
    setSelectedDraftIds((current) =>
      checked
        ? [...new Set([...current, planId])]
        : current.filter((id) => id !== planId),
    );
  };

  const submitSelectedDrafts = () => {
    if (!selectedDraftIds.length) {
      message.warning("请先选择要提交的计划草稿");
      return;
    }
    onSubmitPlan?.(selectedDraftIds);
    message.success(`已提交 ${selectedDraftIds.length} 项计划`);
    setSelectedDraftIds([]);
  };

  const generateAnnualPlan = () => {
    setReportOpen(true);
  };

  const renderPlanActions = (row) => {
    if (row.status === "草稿") {
      return (
        <Space size={0}>
          <Button type="link" size="small" onClick={() => submitPlan(row)}>
            提交计划
          </Button>
          <Popconfirm
            title="删除该计划？"
            description="删除后无法恢复。"
            okText="删除"
            cancelText="取消"
            onConfirm={() => onDeletePlan?.(row.id)}
          >
            <Button type="link" danger size="small">
              删除计划
            </Button>
          </Popconfirm>
        </Space>
      );
    }
    if (row.status === "已完成") {
      return (
        <Button type="link" size="small" onClick={() => setResultPlan(row)}>
          去执行
        </Button>
      );
    }
    if (row.status === "待确认") {
      return (
        <Link to={`/boardGovernance/preparation/plans/${row.id}`}>
          查看任务
        </Link>
      );
    }
    return <span className={styles.submittedHint}>已提交</span>;
  };

  const columns = [
    { title: "姓名", dataIndex: "directorName", width: 90 },
    { title: "任职企业", dataIndex: "servingCompany", width: 180 },
    { title: "履职年度", dataIndex: "dutyYear", width: 100 },
    { title: "履职季度", dataIndex: "dutyQuarter", width: 100 },
    { title: "计划类型", dataIndex: "type", width: 110 },
    { title: "工作类别", dataIndex: "workCategory", width: 170 },
    { title: "计划内容", dataIndex: "content", width: 260 },
    { title: "责任部门", dataIndex: "owner", width: 160 },
    { title: "确认责任人", dataIndex: "confirmOwner", width: 120 },
    { title: "计划时间", dataIndex: "date", width: 120 },
    { title: "预期成果", dataIndex: "target", width: 240 },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      fixed: "right",
      render: (value) => <StatusPill>{value}</StatusPill>,
    },
    {
      title: "操作",
      width: 130,
      fixed: "right",
      render: (_, row) => renderPlanActions(row),
    },
  ];

  return (
    <>
      <SectionCard
        title="年度履职计划编排"
        className={embedded ? styles.embeddedPlanCard : ""}
        extra={
          mode !== "confirmation" ? (
            <Space wrap>
              <Button
                icon={<PlusOutlined />}
                onClick={() => onCreateOpenChange(true)}
              >
                新增计划
              </Button>
            </Space>
          ) : null
        }
      >
        <div className={styles.planCards}>
          {planSummaries.map((summary) => (
            <Descriptions
              key={summary.id}
              bordered
              size="small"
              column={2}
              items={[
                { key: "name", label: "姓名", children: summary.directorName },
                { key: "type", label: "履职类型", children: summary.dutyType },
                { key: "year", label: "履职年度", children: summary.dutyYear },
                {
                  key: "quarter",
                  label: "履职季度",
                  children: summary.dutyQuarter,
                },
                {
                  key: "owners",
                  label: "确认责任人",
                  children: summary.confirmOwners?.join("、"),
                },
                {
                  key: "time",
                  label: "提交时间",
                  children: summary.submittedAt,
                },
              ]}
            />
          ))}
        </div>
      </SectionCard>
      {mode !== "planning" ? (
        <SectionCard
          title="履职计划确认明细"
          className={embedded ? styles.embeddedPlanCard : ""}
          extra={<StatusPill>已完成确认</StatusPill>}
        >
          {embedded ? (
            <div className={styles.planCards}>
              {draftCount ? (
                <div className={styles.batchActionBar}>
                  <span>已选择 {selectedDraftIds.length} 项草稿计划</span>
                  <Button
                    type="primary"
                    disabled={!selectedDraftIds.length}
                    onClick={submitSelectedDrafts}
                  >
                    批量提交
                  </Button>
                </div>
              ) : null}
              {plans.length ? (
                plans.map((plan) => (
                  <article key={plan.id} className={styles.planCard}>
                    <div className={styles.planCardHead}>
                      <span>
                        {plan.type} · {plan.workCategory}
                      </span>
                      <div className={styles.planCardStatus}>
                        {plan.status === "草稿" ? (
                          <Checkbox
                            checked={selectedDraftIds.includes(plan.id)}
                            onChange={(event) =>
                              toggleDraftSelection(
                                plan.id,
                                event.target.checked,
                              )
                            }
                          >
                            选择
                          </Checkbox>
                        ) : null}
                        <StatusPill>{plan.status}</StatusPill>
                      </div>
                    </div>
                    <strong>{plan.content}</strong>
                    <div className={styles.planCardMeta}>
                      <span>
                        {plan.directorName} · {plan.servingCompany}
                      </span>
                      <span>
                        {plan.dutyYear} · {plan.dutyQuarter} · {plan.date}
                      </span>
                      <span>
                        责任部门：{plan.owner} · 确认责任人：{plan.confirmOwner}
                      </span>
                      <span>预期成果：{plan.target}</span>
                    </div>
                    {renderPlanActions(plan)}
                  </article>
                ))
              ) : (
                <p className={styles.emptyPlan}>
                  当前董事暂未建立履职计划，可点击“新增计划”发起编排。
                </p>
              )}
            </div>
          ) : (
            <DataTable rows={plans} columns={columns} />
          )}
          <div className={styles.planFooter}>
            <div className={styles.planFooterCopy}>
              <strong>
                {annualGenerated
                  ? `年度计划已生成，${plans.length} 项履职任务已创建`
                  : draftCount
                    ? `${draftCount} 项计划草稿待提交`
                    : "全部计划已提交，可生成正式年度计划"}
              </strong>
              <span>
                {annualGenerated
                  ? "可查看年度履职计划清单，并再次调整选择"
                  : "请提交全部计划后，再生成年度履职计划与履职任务"}
              </span>
            </div>
            {annualGenerated ? (
              <div className={styles.footerActions}>
                <Button
                  icon={<UnorderedListOutlined />}
                  type="primary"
                  onClick={() => setReportOpen(true)}
                >
                  查看年度履职计划
                </Button>
                <Link to="/boardGovernance/home">
                  <Button>查看已创建任务</Button>
                </Link>
              </div>
            ) : (
              <Button
                type="primary"
                icon={<RocketOutlined />}
                onClick={generateAnnualPlan}
              >
                生成年度计划并创建任务
              </Button>
            )}
          </div>
        </SectionCard>
      ) : null}

      <Modal
        open={mode !== "confirmation" && createOpen}
        title="新增年度履职计划"
        okText="提交"
        cancelText="取消"
        onOk={savePlan}
        onCancel={closeComposer}
        afterOpenChange={(open) => {
          if (!open) return;
          form.setFieldsValue({
            directorName: activeDirector.name,
            dutyType: "年度",
            dutyYear: "2026年",
            dutyQuarter: "四季度",
            confirmOwners: [activeDirector.name],
          });
        }}
        destroyOnHidden
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <div className={styles.formGrid}>
            <Form.Item name="directorName" label="姓名">
              <Input disabled />
            </Form.Item>
            <Form.Item name="dutyType" label="履职类型">
              <Select
                options={["年度", "季度", "月度"].map((value) => ({ value }))}
              />
            </Form.Item>
            <Form.Item name="dutyYear" label="履职年度">
              <Select options={dutyYears.map((value) => ({ value }))} />
            </Form.Item>
            <Form.Item name="dutyQuarter" label="履职季度">
              <Select options={dutyQuarters.map((value) => ({ value }))} />
            </Form.Item>
          </div>
          <Form.Item name="confirmOwners" label="确认责任人">
            <Select
              mode="multiple"
              placeholder="请选择确认责任人（可多选）"
              options={[
                ...new Set([activeDirector.name, ...confirmationOwners]),
              ].map((value) => ({ value }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        open={!!resultPlan}
        width={620}
        title="计划确认结果"
        onClose={() => setResultPlan(null)}
      >
        {resultPlan ? (
          <div className={styles.taskDetail}>
            <div className={styles.taskHero}>
              <CheckCircleOutlined />
              <div>
                <span>{resultPlan.type}</span>
                <h3>{resultPlan.content}</h3>
                <StatusPill>{resultPlan.status}</StatusPill>
              </div>
            </div>
            <Descriptions
              bordered
              column={1}
              items={[
                {
                  key: "directorName",
                  label: "姓名",
                  children: resultPlan.directorName,
                },
                {
                  key: "servingCompany",
                  label: "任职企业",
                  children: resultPlan.servingCompany,
                },
                {
                  key: "period",
                  label: "履职周期",
                  children: `${resultPlan.dutyYear} · ${resultPlan.dutyQuarter}`,
                },
                {
                  key: "confirmOwner",
                  label: "确认责任人",
                  children: resultPlan.confirmOwner,
                },
                {
                  key: "confirmedAt",
                  label: "提交时间",
                  children: resultPlan.confirmedAt || "—",
                },
                {
                  key: "confirmationNote",
                  label: "确认说明",
                  children: resultPlan.confirmationNote || "已确认，无补充说明",
                },
              ]}
            />
          </div>
        ) : null}
      </Drawer>
      <Drawer
        title="年度履职计划选择"
        open={reportOpen}
        width={1100}
        onClose={() => setReportOpen(false)}
      >
        <AnnualPlanConfirmTaskView
          generation
          task={annualSelectionTask}
          onSave={(_id, ids, submit) => {
            setSelectedAnnualIds(ids);
            if (submit) onGenerateTasks?.();
          }}
          onClose={() => setReportOpen(false)}
        />
      </Drawer>
    </>
  );
}
