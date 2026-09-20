import { useMemo, useRef, useState } from "react";
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
  FilePdfOutlined,
  PlusOutlined,
  PrinterOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { confirmationOwners } from "../../../../dutyPlanData";
import {
  dutyQuarters,
  dutyYears,
  planTypes,
  workCategories,
} from "../../../../dutyPlanOptions";
import {
  DataTable,
  SectionCard,
  StatusPill,
} from "../../../../components/PageKit";
import AnnualPlanReport from "./AnnualPlanReport/index.jsx";
import {
  buildAnnualDutyPlanReport,
  printAnnualPlanReport,
} from "./annualPlanReport.js";
import styles from "./index.module.less";

export default function DutyPlanWorkspace({
  embedded = false,
  createOpen,
  onCreateOpenChange,
  plans,
  onCreatePlan,
  onDeletePlan,
  onSubmitPlan,
  onGenerateTasks,
  annualGenerated,
  activeDirector,
}) {
  const [resultPlan, setResultPlan] = useState(null);
  const [generateConfirmOpen, setGenerateConfirmOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedDraftIds, setSelectedDraftIds] = useState([]);
  const [form] = Form.useForm();
  const paperRef = useRef(null);
  const draftCount = useMemo(
    () => plans.filter((item) => item.status === "草稿").length,
    [plans],
  );
  const canGenerateAnnual =
    plans.length > 0 &&
    plans.every((item) => ["已提交", "已完成"].includes(item.status));
  const annualReport = useMemo(() => buildAnnualDutyPlanReport(), []);

  const closeComposer = () => {
    onCreateOpenChange(false);
    form.resetFields();
  };

  const savePlan = async () => {
    const values = await form.validateFields();
    onCreatePlan(values);
    message.success("年度履职计划已保存为草稿");
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
    setGenerateConfirmOpen(true);
  };

  const confirmGenerateAnnualPlan = () => {
    onGenerateTasks();
    setGenerateConfirmOpen(false);
    setReportOpen(true);
    message.success(`年度履职计划已生成，已创建 ${plans.length} 项履职任务`);
  };

  const printCurrentReport = () => {
    const html = paperRef.current?.outerHTML;
    if (!html) return;
    const printed = printAnnualPlanReport(
      html,
      annualReport.fileName.replace(/\.pdf$/, ""),
    );
    if (!printed) {
      message.warning("浏览器阻止了打印窗口，请允许弹出窗口后重试");
    }
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
          查看结果
        </Button>
      );
    }
    if (row.status === "待确认") {
      return (
        <Link to={`/boardGovernance/plan-confirm-task?planId=${row.id}`}>
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

  const flowIndex = annualGenerated ? 3 : canGenerateAnnual ? 2 : 1;

  return (
    <>
      <SectionCard
        title="年度履职计划编排"
        className={embedded ? styles.embeddedPlanCard : ""}
        extra={
          <Space wrap>
            <span className={styles.typeHint}>
              会议计划 · 培训计划 · 调研计划
            </span>
            <Button
              icon={<PlusOutlined />}
              onClick={() => onCreateOpenChange(true)}
            >
              新增计划
            </Button>
          </Space>
        }
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
                            toggleDraftSelection(plan.id, event.target.checked)
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
          <div>
            <strong>
              {annualGenerated
                ? `年度计划已生成，${plans.length} 项履职任务已创建`
                : draftCount
                  ? `${draftCount} 项计划草稿待提交`
                  : "全部计划已提交，可生成正式年度计划"}
            </strong>
            <span>
              {annualGenerated
                ? "可查看年度履职计划报告，任务已同步至工作台首页"
                : "请提交全部计划后，再生成年度履职计划与履职任务"}
            </span>
          </div>
          {annualGenerated ? (
            <div className={styles.footerActions}>
              <Button
                icon={<FilePdfOutlined />}
                type="primary"
                onClick={() => setReportOpen(true)}
              >
                查看年度履职计划报告
              </Button>
              <Link to="/boardGovernance/home">
                <Button>查看已创建任务</Button>
              </Link>
            </div>
          ) : (
            <Button
              type="primary"
              icon={<RocketOutlined />}
              disabled={!canGenerateAnnual}
              onClick={generateAnnualPlan}
            >
              生成年度计划并创建任务
            </Button>
          )}
        </div>
        <div
          className={`${styles.flowNote} ${embedded ? styles.embeddedFlow : ""}`}
        >
          {[
            "计划制定",
            "计划全部提交",
            "年度履职计划生成",
            "自动创建履职任务",
          ].map((label, index) => (
            <div key={label} className={index <= flowIndex ? styles.done : ""}>
              <span>{index + 1}</span>
              <b>{label}</b>
              {index < 3 ? <i>→</i> : null}
            </div>
          ))}
        </div>
      </SectionCard>

      <Modal
        open={createOpen}
        title="新增年度履职计划"
        okText="保存为草稿"
        cancelText="取消"
        onOk={savePlan}
        onCancel={closeComposer}
        afterOpenChange={(open) => {
          if (!open) return;
          form.setFieldsValue({
            directorName: activeDirector.name,
            servingCompany: activeDirector.company,
            dutyYear: "2026年",
            dutyQuarter: "三季度",
            type: "会议计划",
            workCategory: "参加董事会",
            owner: "综合管理部-董办",
            confirmOwner: activeDirector.name,
          });
        }}
        destroyOnHidden
        width={680}
      >
        <p className={styles.modalTip}>
          填写计划并保存草稿；可在计划列表中继续删除或提交。全部计划提交后，才可生成年度履职计划与履职任务。
        </p>
        <Form form={form} layout="vertical" preserve={false}>
          <h4 className={styles.formSectionTitle}>履职基础信息</h4>
          <div className={styles.formGrid}>
            <Form.Item
              name="directorName"
              label="姓名"
              rules={[{ required: true, message: "请填写姓名" }]}
            >
              <Input disabled />
            </Form.Item>
            <Form.Item
              name="servingCompany"
              label="任职企业"
              rules={[{ required: true, message: "请填写任职企业" }]}
            >
              <Input placeholder="请输入任职企业" />
            </Form.Item>
            <Form.Item
              name="dutyYear"
              label="履职年度"
              rules={[{ required: true, message: "请选择履职年度" }]}
            >
              <Select options={dutyYears.map((value) => ({ value }))} />
            </Form.Item>
            <Form.Item
              name="dutyQuarter"
              label="履职季度"
              rules={[{ required: true, message: "请选择履职季度" }]}
            >
              <Select options={dutyQuarters.map((value) => ({ value }))} />
            </Form.Item>
          </div>
          <h4 className={styles.formSectionTitle}>计划与确认信息</h4>
          <div className={styles.formGrid}>
            <Form.Item
              name="type"
              label="计划类型"
              // rules={[{ required: true, message: "请选择计划类型" }]}
            >
              <Select options={planTypes.map((value) => ({ value }))} />
            </Form.Item>
            <Form.Item
              name="workCategory"
              label="工作类别"
              // rules={[{ required: true, message: "请选择工作类别" }]}
            >
              <Select options={workCategories.map((value) => ({ value }))} />
            </Form.Item>
            <Form.Item
              name="owner"
              label="责任部门"
              // rules={[{ required: true, message: "请填写责任部门" }]}
            >
              <Input placeholder="请输入责任部门" />
            </Form.Item>
            <Form.Item
              name="confirmOwner"
              label="确认责任人"
              // rules={[{ required: true, message: "请选择确认责任人" }]}
            >
              <Select
                placeholder="请选择接收确认任务的责任人"
                options={confirmationOwners.map((value) => ({ value }))}
              />
            </Form.Item>
            <Form.Item
              name="date"
              label="计划时间"
              // rules={[{ required: true, message: "请填写计划时间" }]}
            >
              <Input placeholder="例如：2026-11-20" />
            </Form.Item>
          </div>
          <Form.Item
            name="content"
            label="计划内容"
            // rules={[{ required: true, message: "请填写计划内容" }]}
          >
            <Input placeholder="请输入计划名称或主题" />
          </Form.Item>
          <Form.Item
            name="target"
            label="预期成果"
            // rules={[{ required: true, message: "请填写预期成果" }]}
          >
            <Input.TextArea rows={3} placeholder="请输入计划应形成的成果" />
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
      <Modal
        title="生成年度履职计划并创建任务？"
        open={generateConfirmOpen}
        okText="确认生成"
        cancelText="取消"
        onOk={confirmGenerateAnnualPlan}
        onCancel={() => setGenerateConfirmOpen(false)}
      >
        系统将基于 {plans.length}
        项已完成确认的计划，生成年度履职计划报告，并创建会议、培训和调研履职任务。
      </Modal>
      <Modal
        title="年度履职计划报告"
        open={reportOpen}
        width={1100}
        onCancel={() => setReportOpen(false)}
        footer={[
          <Button key="close" onClick={() => setReportOpen(false)}>
            关闭
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={printCurrentReport}
          >
            打印 / 导出 PDF
          </Button>,
        ]}
      >
        <div className={styles.reportPreview}>
          <AnnualPlanReport report={annualReport} paperRef={paperRef} />
        </div>
      </Modal>
    </>
  );
}
