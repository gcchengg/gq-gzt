import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Table,
} from "antd";
import {
  CheckCircleOutlined,
  UnorderedListOutlined,
  PlusOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import {
  DataTable,
  SectionCard,
  StatusPill,
} from "../../../../components/PageKit";
import AnnualPlanConfirmTaskView from "../../../AnnualPlanConfirmTaskView";
import { buildAnnualPlanConfirmationTask } from "../../../../annualPlanConfirmationData";
import { buildAnnualDutyPlanReport } from "./annualPlanReport.js";
import styles from "./index.module.less";

const workCategories = [
  "董事会",
  "调研",
  "子企业重要会议",
  "能力培训",
  "专项交流",
  "督导子企业落实工作",
  "解决子企业发展问题",
  "其他",
];

const responsiblePeople = ["阮迪", "周航", "陈哲", "孙博", "李晨光", "刘欣然"];

const planTypeByWorkCategory = {
  董事会: "会议计划",
  调研: "调研计划",
  子企业重要会议: "会议计划",
  能力培训: "培训计划",
  专项交流: "交流计划",
  督导子企业落实工作: "督导计划",
  解决子企业发展问题: "问题解决计划",
  其他: "其他计划",
};

const normalizeWorkCategory = (value) =>
  ({
    参加董事会: "董事会",
    参加调研: "调研",
    参加能力培训: "能力培训",
    参加子企业重要会议: "子企业重要会议",
  })[value] || value;

export default function DutyPlanWorkspace({
  embedded = false,
  mode = "default",
  createOpen,
  onCreateOpenChange,
  plans,
  onDeletePlan,
  onCreatePlan,
  onSubmitPlan,
  onGenerateTasks,
  annualGenerated,
  activeDirector,
}) {
  const navigate = useNavigate();
  const [resultPlan, setResultPlan] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedAnnualIds, setSelectedAnnualIds] = useState(null);
  const [selectedGenerationIds, setSelectedGenerationIds] = useState([]);
  const [savedGenerationIds, setSavedGenerationIds] = useState(null);
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

  const savePlan = async () => {
    const values = await form.validateFields();
    const plan = {
      directorName: activeDirector.name,
      servingCompany: activeDirector.company,
      dutyYear: "2026年",
      dutyQuarter: "四季度",
      type: planTypeByWorkCategory[values.workCategory],
      owner: "待指定",
      confirmOwner: activeDirector.name,
      ...values,
    };
    onCreatePlan?.(plan);
    setPlanSummaries((current) => [
      ...current,
      {
        directorName: activeDirector.name,
        dutyType: "年度",
        dutyYear: plan.dutyYear,
        dutyQuarter: plan.dutyQuarter,
        confirmOwners: [activeDirector.name],
        id: `plan-summary-${Date.now()}`,
        submittedAt: new Date().toLocaleString("zh-CN", { hour12: false }),
      },
    ]);
    message.success("计划草稿已保存");
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
    {
      title: "责任人",
      dataIndex: "taskAssignee",
      width: 110,
      render: (value) => value || "待指定",
    },
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
  const planningColumns = [
    {
      title: "工作类别",
      dataIndex: "workCategory",
      width: "12%",
      onCell: (row) => ({
        rowSpan: row.categoryRowSpan,
        className: row.categoryRowSpan ? styles.planningCategoryCell : "",
      }),
      render: (value) => <strong>{value}</strong>,
    },
    { title: "序号", dataIndex: "sequence", width: "6%", align: "center" },
    { title: "工作内容", dataIndex: "content", width: "23%" },
    {
      title: "责任人",
      dataIndex: "taskAssignee",
      width: "10%",
      render: (value) => value || "待指定",
    },
    {
      title: "计划开展时间",
      dataIndex: "date",
      width: "12%",
      align: "center",
      render: (value) => value?.replaceAll("-", "/") || "",
    },
    { title: "预期达成目标", dataIndex: "target", width: "16%" },
    {
      title: "状态",
      dataIndex: "status",
      width: "8%",
      render: (value) => <StatusPill>{value || "草稿"}</StatusPill>,
    },
    {
      title: "操作",
      width: "13%",
      render: (_, row) =>
        row.status === "草稿" ? (
          <Space size={0}>
            <Button type="link" size="small" onClick={() => submitPlan(row)}>
              提交
            </Button>
            <Popconfirm
              title="删除该计划草稿？"
              okText="删除"
              cancelText="取消"
              onConfirm={() => onDeletePlan?.(row.id)}
            >
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ) : (
          "—"
        ),
    },
  ];
  const buildPlanRows = (planItems) =>
    workCategories.flatMap((workCategory) => {
      const categoryPlans = planItems.filter(
        (plan) => normalizeWorkCategory(plan.workCategory) === workCategory,
      );
      const rows = categoryPlans.map((plan, index) => ({
        ...plan,
        sequence: index + 1,
      }));
      if (!rows.length) return [];
      rows[0].categoryRowSpan = rows.length;
      rows.slice(1).forEach((row) => {
        row.categoryRowSpan = 0;
      });
      return rows;
    });
  const planningRows = buildPlanRows(plans);
  const submittedRows = buildPlanRows(
    plans.filter((plan) => plan.status !== "草稿"),
  );
  const generatedRows = submittedRows.filter((plan) => plan.taskStatus);
  const allPlansSubmitted =
    plans.length > 0 &&
    plans.every((plan) => ["已提交", "待确认", "已完成"].includes(plan.status));
  const openGenerationDrawer = () => {
    const availableIds = submittedRows.map((plan) => plan.id);
    setSelectedGenerationIds(
      savedGenerationIds?.directorId === activeDirector.id
        ? savedGenerationIds.ids.filter((id) => availableIds.includes(id))
        : availableIds,
    );
    setReportOpen(true);
  };

  return (
    <>
      <SectionCard
        title={mode === "generation" ? "年度履职计划生成" : "年度履职计划编制"}
        className={embedded ? styles.embeddedPlanCard : ""}
        extra={
          mode !== "confirmation" && mode !== "generation" ? (
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
        {mode === "planning" ? (
          <div className={styles.planningTable}>
            <Table
              rowKey="id"
              size="middle"
              bordered
              pagination={false}
              tableLayout="fixed"
              dataSource={planningRows}
              columns={planningColumns}
            />
            <div className={styles.planFooter}>
              <div className={styles.planFooterCopy}>
                <strong>
                  草稿 {plans.length - submittedRows.length} 项，已提交{" "}
                  {submittedRows.length} 项
                </strong>
                <span>草稿可单独提交或删除，也可一次提交全部草稿。</span>
              </div>
              <Button
                type="primary"
                disabled={!planningRows.some((plan) => plan.status === "草稿")}
                onClick={() => {
                  const draftIds = planningRows
                    .filter((plan) => plan.status === "草稿")
                    .map((plan) => plan.id);
                  if (!draftIds.length) return;
                  onSubmitPlan?.(draftIds);
                  message.success(`已提交 ${draftIds.length} 项年度履职计划`);
                }}
              >
                提交全部草稿
              </Button>
            </div>
          </div>
        ) : mode === "generation" ? (
          <div className={styles.planningTable}>
            <p className={styles.modalTip}>
              汇总已提交的计划，确认后直接生成年度履职计划及对应履职任务。
            </p>
            <Table
              rowKey="id"
              size="middle"
              bordered
              pagination={false}
              tableLayout="fixed"
              dataSource={submittedRows}
              columns={planningColumns.slice(0, -1)}
            />
            <div className={styles.planFooter}>
              <div className={styles.planFooterCopy}>
                <strong>
                  {annualGenerated
                    ? `年度计划已生成，${generatedRows.length} 项履职任务已创建`
                    : allPlansSubmitted
                      ? `${submittedRows.length} 项计划已全部提交`
                      : `已提交 ${submittedRows.length} / ${plans.length} 项计划`}
                </strong>
                <span>全部计划提交后，可在生成抽屉中选择要纳入的计划。</span>
              </div>
              {annualGenerated ? (
                <Space>
                  <Button onClick={openGenerationDrawer}>
                    查看年度履职计划
                  </Button>
                  <Link to={`/boardGovernance/management/${activeDirector.id}`}>
                    <Button type="primary">查看已创建任务</Button>
                  </Link>
                </Space>
              ) : (
                <Button
                  type="primary"
                  icon={<RocketOutlined />}
                  disabled={!allPlansSubmitted}
                  onClick={openGenerationDrawer}
                >
                  生成年度计划并创建任务
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.planCards}>
            {planSummaries.map((summary) => (
              <Descriptions
                key={summary.id}
                bordered
                size="small"
                column={2}
                items={[
                  {
                    key: "name",
                    label: "姓名",
                    children: summary.directorName,
                  },
                  {
                    key: "type",
                    label: "履职类型",
                    children: summary.dutyType,
                  },
                  {
                    key: "year",
                    label: "履职年度",
                    children: summary.dutyYear,
                  },
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
        )}
      </SectionCard>
      {mode !== "planning" && mode !== "generation" ? (
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
        open={(mode === "planning" || mode === "default") && createOpen}
        title="新增年度履职计划"
        okText="保存草稿"
        cancelText="取消"
        onOk={savePlan}
        onCancel={closeComposer}
        afterOpenChange={(open) => {
          if (!open) return;
          form.setFieldsValue({
            workCategory: "董事会",
          });
        }}
        destroyOnHidden
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="workCategory"
            label="工作类别"
            rules={[{ required: true, message: "请选择工作类别" }]}
          >
            <Select
              placeholder="请选择工作类别"
              options={workCategories.map((value) => ({ value, label: value }))}
            />
          </Form.Item>
          <Form.Item
            name="taskAssignee"
            label="责任人"
            rules={[{ required: true, message: "请选择责任人" }]}
          >
            <Select
              showSearch
              placeholder="请选择责任人"
              options={responsiblePeople.map((value) => ({
                value,
                label: value,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="content"
            label="工作内容"
            rules={[{ required: true, message: "请填写工作内容" }]}
          >
            <Input.TextArea rows={3} placeholder="请填写计划开展的工作内容" />
          </Form.Item>
          <Form.Item
            name="date"
            label="计划开展时间"
            rules={[{ required: true, message: "请选择计划开展时间" }]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item
            name="target"
            label="预期达成目标"
            rules={[{ required: true, message: "请填写预期达成目标" }]}
          >
            <Input.TextArea rows={3} placeholder="请填写预期达成目标" />
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
        title={
          mode === "generation" ? "确认生成年度履职计划" : "年度履职计划选择"
        }
        open={reportOpen}
        width={1100}
        onClose={() => setReportOpen(false)}
      >
        {mode === "generation" ? (
          <div className={styles.planningTable}>
            <Descriptions
              bordered
              column={2}
              items={[
                {
                  key: "director",
                  label: "董事",
                  children: activeDirector.name,
                },
                {
                  key: "company",
                  label: "任职企业",
                  children: activeDirector.company,
                },
                { key: "year", label: "计划年度", children: "2026年" },
                {
                  key: "count",
                  label: "计划数量",
                  children: `${annualGenerated ? generatedRows.length : submittedRows.length} 项`,
                },
              ]}
            />
            <p className={styles.modalTip}>
              {annualGenerated
                ? "以下计划已纳入年度履职计划，并创建了对应履职任务。"
                : `请勾选纳入年度履职计划的事项，当前已选 ${selectedGenerationIds.length} 项。`}
            </p>
            <Table
              rowKey="id"
              size="middle"
              bordered
              pagination={false}
              tableLayout="fixed"
              dataSource={annualGenerated ? generatedRows : submittedRows}
              rowSelection={
                annualGenerated
                  ? undefined
                  : {
                      columnWidth: 44,
                      selectedRowKeys: selectedGenerationIds,
                      onChange: setSelectedGenerationIds,
                    }
              }
              columns={planningColumns.slice(0, -1)}
            />
            <div className={styles.planFooter}>
              <div className={styles.planFooterCopy}>
                <strong>
                  {annualGenerated
                    ? `已生成 ${generatedRows.length} 项履职任务`
                    : `将生成 ${selectedGenerationIds.length} 项履职任务`}
                </strong>
                {!annualGenerated ? (
                  <span>请核对计划内容与责任人后确认生成。</span>
                ) : null}
              </div>
              {annualGenerated ? (
                <Button onClick={() => setReportOpen(false)}>关闭</Button>
              ) : (
                <Space>
                  <Button onClick={() => setReportOpen(false)}>取消</Button>
                  <Button
                    disabled={!selectedGenerationIds.length}
                    onClick={() => {
                      setSavedGenerationIds({
                        directorId: activeDirector.id,
                        ids: selectedGenerationIds,
                      });
                      message.success(
                        `已保存 ${selectedGenerationIds.length} 项计划的选择结果`,
                      );
                    }}
                  >
                    保存选择
                  </Button>
                  <Popconfirm
                    title="确认生成年度履职计划并创建任务？"
                    description={`本次将为已选的 ${selectedGenerationIds.length} 项计划创建履职任务。`}
                    okText="确认生成"
                    cancelText="返回检查"
                    onConfirm={() => {
                      if (!allPlansSubmitted || !selectedGenerationIds.length)
                        return;
                      onGenerateTasks?.(selectedGenerationIds);
                      setReportOpen(false);
                      message.success("年度履职计划已生成，履职任务已创建");
                    }}
                  >
                    <Button
                      type="primary"
                      disabled={
                        !allPlansSubmitted || !selectedGenerationIds.length
                      }
                    >
                      确认生成并创建任务
                    </Button>
                  </Popconfirm>
                </Space>
              )}
            </div>
          </div>
        ) : (
          <AnnualPlanConfirmTaskView
            generation
            task={annualSelectionTask}
            onSave={(_id, ids, submit) => {
              setSelectedAnnualIds(ids);
              if (submit) onGenerateTasks?.();
            }}
            onClose={() => setReportOpen(false)}
            onSubmitComplete={() => {
              setReportOpen(false);
              navigate("/boardGovernance/home", {
                state: {
                  taskSelection: {
                    category: "duty",
                    department: "已确认履职计划任务",
                  },
                },
              });
            }}
          />
        )}
      </Drawer>
    </>
  );
}
