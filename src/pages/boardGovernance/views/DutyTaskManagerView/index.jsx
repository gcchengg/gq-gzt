import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Progress,
  Select,
  Steps,
  Tabs,
  Upload,
} from "antd";
import {
  CheckCircleOutlined,
  InboxOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  DataTable,
  PageHeader,
  SectionCard,
  StatusPill,
} from "../../components/PageKit";
import MaterialTaskView from "../MaterialTaskView";
import PlanConfirmTaskView from "../PlanConfirmTaskView";
import AnnualPlanConfirmTaskView from "../AnnualPlanConfirmTaskView";
import styles from "./index.module.less";

const { Dragger } = Upload;

const executionFieldsByType = {
  会议计划: [
    [
      "meetingType",
      "会议类型",
      "select",
      "出席董事会相关会议",
      ["出席董事会相关会议", "参加子企业重要会议/活动", "参加专委会会议"],
    ],
    [
      "meetingName",
      "会议名称 / 活动主题",
      "text",
      "一汽股权2026年董事会第二次会议",
    ],
    ["meetingDate", "会议时间", "text", "2026-01-28"],
    [
      "meetingFormat",
      "会议地点",
      "select",
      "现场召开",
      ["现场召开", "视频会议", "通讯会议"],
    ],
    [
      "attendanceFormat",
      "参会形式 / 参加方式",
      "select",
      "现场参会",
      ["现场参会", "视频参会", "通讯参会"],
    ],
    ["proposalCount", "议案数量", "number", 2],
    // ["dutyDays", "履职天数", "number", 2],
  ],
  培训计划: [
    [
      "trainingName",
      "培训名称",
      "text",
      "股权思享汇：参股企业财务风险处置与投后管理赋能典型案例分享",
    ],
    ["trainingDate", "培训日期", "text", "2026-01-30"],
    [
      "trainingMethod",
      "培训方式",
      "select",
      "视频",
      ["现场", "视频", "线上学习"],
    ],
    ["trainingTeacher", "培训师资", "text", "高驰"],
    ["dutyDays", "履职天数", "number", 0.5],
    [
      "trainingContent",
      "培训内容",
      "textarea",
      "参股企业财务风险处置与投后管理赋能典型案例分享。",
    ],
  ],
  调研计划: [
    ["researchTopic", "调研主题", "text", "专题调研战略规划、数字化建设情况"],
    ["researchCompany", "调研单位", "text", "一汽股权"],
    [
      "researchMethod",
      "调研方式",
      "select",
      "现场",
      ["现场", "视频", "书面调研"],
    ],
    ["researchDate", "调研日期", "text", "2026-01-29"],
    ["hasResearchReport", "是否形成调研报告", "select", "否", ["是", "否"]],
    [
      "researchConcerns",
      "调研期间发现的问题或关注的事项",
      "textarea",
      "重点了解直投与基金双轮驱动发展路径、基金设立与募资机制、投资战略布局以及以工作台为核心的数字化平台建设进展。",
    ],
    ["dutyDays", "履职天数", "number", 0.5],
    [
      "researchSuggestions",
      "调研期间提出的意见建议",
      "textarea",
      "建议明确数字化建设阶段目标，持续完善投后管理机制。",
    ],
  ],
};

export default function DutyTaskManagerView({
  role,
  plans,
  materials,
  onComplete,
  onSubmitMaterial,
  onSavePlan,
  suggestionTasks,
  onSaveSuggestion,
  annualPlanConfirmationTasks = [],
  onSaveAnnualPlanConfirmation,
  onRoleChange,
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bizId = searchParams.get("bizId");
  const department = searchParams.get("department");
  const planId = searchParams.get("planId");
  const requestedTaskType = searchParams.get("taskType");
  const requestedTaskTypeIsValid = [
    "duty",
    "suggestion",
    "material",
    "confirmation",
    "annual-plan-confirmation",
  ].includes(requestedTaskType);
  const activeTaskType =
    role === "director"
      ? "annual-plan-confirmation"
      : requestedTaskTypeIsValid &&
          requestedTaskType !== "annual-plan-confirmation"
        ? requestedTaskType
        : "duty";
  const [form] = Form.useForm();
  const [suggestionForm] = Form.useForm();
  const [files, setFiles] = useState([]);
  const tasks = useMemo(() => plans.filter((item) => item.taskStatus), [plans]);
  const visibleAnnualPlanConfirmationTasks = useMemo(
    () =>
      role === "director"
        ? annualPlanConfirmationTasks.filter(
            (task) => task.id === "ANNUAL-D-08",
          )
        : annualPlanConfirmationTasks,
    [annualPlanConfirmationTasks, role],
  );
  const selectedTask =
    activeTaskType === "duty" ? tasks.find((item) => item.id === bizId) : null;
  const selectedSuggestion =
    activeTaskType === "suggestion"
      ? suggestionTasks.find((item) => item.id === bizId)
      : null;
  const selectedPlan =
    activeTaskType === "confirmation"
      ? plans.find((item) => item.id === planId)
      : null;
  const selectedAnnualPlan =
    activeTaskType === "annual-plan-confirmation"
      ? visibleAnnualPlanConfirmationTasks.find((item) => item.id === bizId)
      : null;
  const planInputValues = selectedTask
    ? [
        selectedTask.directorName,
        selectedTask.servingCompany,
        selectedTask.dutyYear,
        selectedTask.dutyQuarter,
        selectedTask.type,
        selectedTask.workCategory,
        selectedTask.owner,
        selectedTask.confirmOwner,
        selectedTask.date,
        selectedTask.content,
        selectedTask.target,
      ]
    : [];
  const planInputCompleted = planInputValues.filter(Boolean).length;
  const executionFields = executionFieldsByType[selectedTask?.type] || [];

  useEffect(() => {
    if (!selectedTask) return;
    form.resetFields();
    form.setFieldsValue(
      Object.fromEntries(
        (executionFieldsByType[selectedTask.type] || []).map(
          ([name, , , value]) => [name, selectedTask[name] ?? value],
        ),
      ),
    );
    setFiles(
      (selectedTask.supplementFiles || []).map((name, index) => ({
        uid: `${selectedTask.id}-${index}`,
        name,
        status: "done",
      })),
    );
  }, [form, selectedTask]);

  useEffect(() => {
    if (!selectedSuggestion) return;
    suggestionForm.setFieldsValue({
      handlingPlan: selectedSuggestion.handlingPlan,
      result: selectedSuggestion.result,
      feedback: selectedSuggestion.feedback,
      progress: selectedSuggestion.progress,
    });
    setFiles(
      (selectedSuggestion.files || []).map((name, index) => ({
        uid: `${selectedSuggestion.id}-${index}`,
        name,
        status: "done",
      })),
    );
  }, [selectedSuggestion, suggestionForm]);

  const openTask = (task) => {
    navigate(`/boardGovernance/duty-tasks?taskType=duty&bizId=${task.id}`);
  };

  const openSuggestion = (task) => {
    navigate(
      `/boardGovernance/duty-tasks?taskType=suggestion&bizId=${task.id}`,
    );
  };

  const openMaterialTask = (task) => {
    navigate(
      `/boardGovernance/duty-tasks?taskType=material&department=${encodeURIComponent(task.department)}`,
    );
  };

  const openPlanConfirmation = (plan) => {
    navigate(
      `/boardGovernance/duty-tasks?taskType=confirmation&planId=${plan.id}`,
    );
  };

  const openAnnualPlanConfirmation = (task) => {
    navigate(
      `/boardGovernance/duty-tasks?taskType=annual-plan-confirmation&bizId=${task.id}`,
    );
  };

  const closeTask = () => {
    navigate(
      activeTaskType === "material"
        ? "/boardGovernance/duty-tasks?taskType=material"
        : activeTaskType === "annual-plan-confirmation"
          ? "/boardGovernance/duty-tasks?taskType=annual-plan-confirmation"
          : activeTaskType === "confirmation"
            ? "/boardGovernance/duty-tasks?taskType=confirmation"
            : "/boardGovernance/duty-tasks",
    );
    form.resetFields();
    suggestionForm.resetFields();
    setFiles([]);
  };

  const completeTask = async () => {
    const values = await form.validateFields();
    onComplete(selectedTask.id, {
      ...values,
      supplementFiles: files.map((file) => file.name),
    });
    message.success(
      "履职任务已确认完成，履职计划、履职记录和报告数据已同步更新",
    );
    closeTask();
  };

  const saveSuggestion = async (submit) => {
    const values = await suggestionForm.validateFields();
    onSaveSuggestion(
      selectedSuggestion.id,
      { ...values, files: files.map((file) => file.name) },
      submit,
    );
    message.success(submit ? "意见建议落实任务已完成" : "办理进展已保存");
    closeTask();
  };

  const pendingCount = tasks.filter(
    (item) => item.taskStatus !== "已完成",
  ).length;
  const suggestionPendingCount = suggestionTasks.filter(
    (item) => item.status !== "已完成",
  ).length;
  const materialTasks = useMemo(() => {
    const byDepartment = materials.reduce((groups, item) => {
      groups[item.department] = [...(groups[item.department] || []), item];
      return groups;
    }, {});
    return Object.entries(byDepartment).map(([department, departmentItems]) => {
      const submittedCount = departmentItems.filter(
        (item) => item.status === "已提交",
      ).length;
      const total = departmentItems.length;
      const completed = submittedCount === total;
      return {
        id: department,
        department,
        responsiblePeople: [
          ...new Set(departmentItems.map((item) => item.responsiblePerson)),
        ].join("、"),
        total,
        submittedCount,
        pendingCount: total - submittedCount,
        progress: Math.round((submittedCount / total) * 100),
        status: completed ? "已完成" : "待提交",
      };
    });
  }, [materials]);
  const materialPendingCount = materialTasks.filter(
    (item) => item.status !== "已完成",
  ).length;
  const confirmationPendingCount = plans.filter(
    (item) => item.status !== "已完成",
  ).length;
  const annualPlanPendingCount = visibleAnnualPlanConfirmationTasks.filter(
    (item) => item.status !== "已完成",
  ).length;
  const selectedMaterial =
    activeTaskType === "material" && department
      ? materialTasks.find((item) => item.department === department)
      : null;
  const currentTotal =
    activeTaskType === "suggestion"
      ? suggestionTasks.length
      : activeTaskType === "material"
        ? materialTasks.length
        : activeTaskType === "annual-plan-confirmation"
          ? visibleAnnualPlanConfirmationTasks.length
          : activeTaskType === "confirmation"
            ? plans.length
            : tasks.length;
  const currentPending =
    activeTaskType === "suggestion"
      ? suggestionPendingCount
      : activeTaskType === "material"
        ? materialPendingCount
        : activeTaskType === "annual-plan-confirmation"
          ? annualPlanPendingCount
          : activeTaskType === "confirmation"
            ? confirmationPendingCount
            : pendingCount;

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="RESPONSIBLE PERSON WORKBENCH"
        title="履职任务负责人工作台"
        subtitle="接收年度履职计划生成的任务，补充办理成果和佐证材料，确认完成后同步履职档案"
        // actions={
        //   <Button onClick={() => navigate("/boardGovernance/home")}>
        //     返回工作台首页
        //   </Button>
        // }
      />
      <div className={styles.metrics}>
        <article>
          <span>当前分类任务总数</span>
          <strong>{currentTotal}</strong>
        </article>
        <article>
          <span>待负责人办理</span>
          <strong>{currentPending}</strong>
        </article>
        <article>
          <span>已确认完成</span>
          <strong>{currentTotal - currentPending}</strong>
        </article>
      </div>
      <SectionCard
        title="履职任务列表"
        extra={
          <span className={styles.hint}>
            点击“办理”通过 URL bizId 打开右侧任务抽屉
          </span>
        }
      >
        <Tabs
          activeKey={activeTaskType}
          onChange={(value) =>
            navigate(`/boardGovernance/duty-tasks?taskType=${value}`)
          }
          items={[
            { key: "duty", label: `履职计划任务 ${tasks.length}` },
            // {
            //   key: "suggestion",
            //   label: `意见建议落实 ${suggestionTasks.length}`,
            // },
            {
              key: "material",
              label: `履职手册资料 ${materialTasks.length}`,
            },
            {
              key: "confirmation",
              label: `年度履职计划确认 ${plans.length}`,
            },
            {
              key: "annual-plan-confirmation",
              label: `年度履职计划确认/调整 ${visibleAnnualPlanConfirmationTasks.length}`,
            },
          ].filter(({ key }) =>
            role === "director"
              ? key === "annual-plan-confirmation"
              : key !== "annual-plan-confirmation",
          )}
        />
        {activeTaskType === "duty" && tasks.length ? (
          <DataTable
            rows={tasks}
            columns={[
              { title: "任务名称", dataIndex: "content", width: 280 },
              { title: "董事", dataIndex: "directorName", width: 100 },
              {
                title: "履职周期",
                width: 150,
                render: (_, row) => `${row.dutyYear} · ${row.dutyQuarter}`,
              },
              { title: "任务类型", dataIndex: "type", width: 110 },
              { title: "责任部门", dataIndex: "owner", width: 170 },
              { title: "负责人", dataIndex: "taskAssignee", width: 110 },
              { title: "计划时间", dataIndex: "date", width: 120 },
              {
                title: "状态",
                dataIndex: "taskStatus",
                width: 100,
                render: (value) => <StatusPill>{value}</StatusPill>,
              },
              {
                title: "操作",
                width: 100,
                render: (_, row) => (
                  <Button type="link" onClick={() => openTask(row)}>
                    {row.taskStatus === "已完成" ? "查看/修改" : "办理"}
                  </Button>
                ),
              },
            ]}
          />
        ) : null}
        {activeTaskType === "suggestion" ? (
          <DataTable
            rows={suggestionTasks}
            columns={[
              { title: "意见建议", dataIndex: "content", width: 330 },
              { title: "来源", dataIndex: "source", width: 190 },
              { title: "责任部门", dataIndex: "owner", width: 180 },
              { title: "负责人", dataIndex: "assignee", width: 100 },
              { title: "完成期限", dataIndex: "deadline", width: 120 },
              {
                title: "进度",
                dataIndex: "progress",
                width: 150,
                render: (value) => <Progress percent={value} size="small" />,
              },
              {
                title: "状态",
                dataIndex: "status",
                width: 100,
                render: (value) => <StatusPill>{value}</StatusPill>,
              },
              {
                title: "操作",
                width: 100,
                render: (_, row) => (
                  <Button type="link" onClick={() => openSuggestion(row)}>
                    {row.status === "已完成" ? "查看/修改" : "去办理"}
                  </Button>
                ),
              },
            ]}
          />
        ) : null}
        {activeTaskType === "material" ? (
          <DataTable
            rows={materialTasks}
            columns={[
              { title: "责任部门", dataIndex: "department", width: 210 },
              { title: "责任人", dataIndex: "responsiblePeople", width: 220 },
              {
                title: "需更新资料",
                dataIndex: "total",
                width: 110,
                render: (value) => `${value} 项`,
              },
              {
                title: "已提交资料",
                dataIndex: "submittedCount",
                width: 120,
                render: (value) => `${value} 项`,
              },
              {
                title: "完成进度",
                dataIndex: "progress",
                width: 180,
                render: (value) => <Progress percent={value} size="small" />,
              },
              {
                title: "任务状态",
                dataIndex: "status",
                width: 110,
                render: (value) => <StatusPill>{value}</StatusPill>,
              },
              {
                title: "操作",
                width: 130,
                render: (_, row) => (
                  <Button type="link" onClick={() => openMaterialTask(row)}>
                    {row.status === "已完成" ? "查看任务" : "去提交"}
                  </Button>
                ),
              },
            ]}
          />
        ) : null}
        {activeTaskType === "confirmation" ? (
          <DataTable
            rows={plans}
            columns={[
              { title: "计划内容", dataIndex: "content", width: 260 },
              { title: "董事", dataIndex: "directorName", width: 100 },
              { title: "任职企业", dataIndex: "servingCompany", width: 180 },
              { title: "责任部门", dataIndex: "owner", width: 170 },
              { title: "确认责任人", dataIndex: "confirmOwner", width: 110 },
              { title: "计划时间", dataIndex: "date", width: 120 },
              {
                title: "确认状态",
                dataIndex: "status",
                width: 110,
                render: (value) => <StatusPill>{value}</StatusPill>,
              },
              {
                title: "操作",
                width: 110,
                render: (_, row) => (
                  <Button type="link" onClick={() => openPlanConfirmation(row)}>
                    {row.status === "已完成" ? "查看/修改" : "去确认"}
                  </Button>
                ),
              },
            ]}
          />
        ) : null}
        {activeTaskType === "annual-plan-confirmation" ? (
          <DataTable
            rows={visibleAnnualPlanConfirmationTasks}
            columns={[
              { title: "任务名称", dataIndex: "title", width: 280 },
              { title: "董事", dataIndex: "directorName", width: 100 },
              { title: "任职企业", dataIndex: "company", width: 180 },
              { title: "履职年度", dataIndex: "year", width: 100 },
              {
                title: "计划条目",
                width: 100,
                render: (_, row) => `${row.rows.length} 项`,
              },
              {
                title: "已选条目",
                width: 100,
                render: (_, row) => `${row.selectedRowIds.length} 项`,
              },
              {
                title: "状态",
                dataIndex: "status",
                width: 100,
                render: (value) => <StatusPill>{value}</StatusPill>,
              },
              {
                title: "操作",
                width: 110,
                render: (_, row) => (
                  <Button
                    type="link"
                    onClick={() => openAnnualPlanConfirmation(row)}
                  >
                    {row.status === "已完成" ? "查看/调整" : "去确认"}
                  </Button>
                ),
              },
            ]}
          />
        ) : null}
        {activeTaskType === "duty" && !tasks.length ? (
          <Alert
            showIcon
            type="info"
            message="暂无履职任务"
            description="请先在履职准备阶段生成年度计划并创建任务。"
          />
        ) : null}
      </SectionCard>

      <Drawer
        open={
          (activeTaskType === "annual-plan-confirmation"
            ? Boolean(selectedAnnualPlan)
            : Boolean(bizId)) ||
          Boolean(selectedMaterial) ||
          Boolean(selectedPlan)
        }
        width={selectedAnnualPlan ? "min(1100px, 100vw)" : 720}
        title={
          selectedAnnualPlan
            ? `${selectedAnnualPlan.directorName} · 年度履职计划确认/调整`
            : selectedTask
              ? `${selectedTask.content} · 履职任务执行详情`
              : selectedSuggestion
                ? `${selectedSuggestion.content} · 意见建议落实办理`
                : selectedMaterial
                  ? `${selectedMaterial.department} · 履职手册资料更新`
                  : selectedPlan
                    ? `${selectedPlan.content} · 年度履职计划确认`
                    : "任务不存在"
        }
        onClose={closeTask}
        extra={
          selectedAnnualPlan ? (
            <StatusPill>{selectedAnnualPlan.status}</StatusPill>
          ) : selectedTask ? (
            <StatusPill>{selectedTask.taskStatus}</StatusPill>
          ) : selectedSuggestion ? (
            <StatusPill>{selectedSuggestion.status}</StatusPill>
          ) : selectedMaterial ? (
            <StatusPill>{selectedMaterial.status}</StatusPill>
          ) : selectedPlan ? (
            <StatusPill>{selectedPlan.status}</StatusPill>
          ) : null
        }
      >
        {selectedAnnualPlan ? (
          <AnnualPlanConfirmTaskView
            task={selectedAnnualPlan}
            onSave={onSaveAnnualPlanConfirmation}
            onClose={closeTask}
            onSubmitComplete={() => {
              onRoleChange?.("adminDepartment");
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
        ) : selectedTask ? (
          <div className={styles.drawerContent}>
            <div className={styles.taskHero}>
              {selectedTask.taskStatus === "已完成" ? (
                <CheckCircleOutlined />
              ) : (
                <UserOutlined />
              )}
              <div>
                <span>当前负责人 · {selectedTask.taskAssignee}</span>
                <h3>{selectedTask.content}</h3>
                <p>{selectedTask.target}</p>
              </div>
            </div>
            <Steps
              size="small"
              current={selectedTask.taskStatus === "已完成" ? 3 : 2}
              items={[
                { title: "计划生成" },
                { title: "任务送达" },
                { title: "执行办理" },
                { title: "确认完成" },
              ]}
            />
            <section className={styles.planSourceInfo}>
              <div className={styles.infoSectionHeader}>
                <div>
                  <strong>年度履职计划基础信息</strong>
                  <span>
                    任务由该年度履职计划生成，办理时可随时核对原始要求。
                  </span>
                </div>
                <div className={styles.completionMetric}>
                  <span>计划填写完整度</span>
                  <b>
                    {planInputCompleted}/{planInputValues.length}
                  </b>
                  <Progress
                    percent={Math.round(
                      (planInputCompleted / planInputValues.length) * 100,
                    )}
                    showInfo={false}
                    size="small"
                  />
                </div>
              </div>
              <Descriptions
                bordered
                column={2}
                items={[
                  {
                    key: "director",
                    label: "姓名",
                    children: selectedTask.directorName,
                  },
                  {
                    key: "company",
                    label: "任职企业",
                    children: selectedTask.servingCompany,
                  },
                  {
                    key: "year",
                    label: "履职年度",
                    children: selectedTask.dutyYear,
                  },
                  {
                    key: "quarter",
                    label: "履职季度",
                    children: selectedTask.dutyQuarter,
                  },
                  {
                    key: "type",
                    label: "计划类型",
                    children: selectedTask.type,
                  },
                  {
                    key: "category",
                    label: "工作类别",
                    children: selectedTask.workCategory,
                  },
                  {
                    key: "owner",
                    label: "责任部门",
                    children: selectedTask.owner,
                  },
                  {
                    key: "confirmOwner",
                    label: "确认责任人",
                    children: selectedTask.confirmOwner,
                  },
                  {
                    key: "date",
                    label: "计划时间",
                    children: selectedTask.date,
                  },

                  {
                    key: "content",
                    label: "计划内容",
                    span: 2,
                    children: selectedTask.content,
                  },
                  {
                    key: "target",
                    label: "预期成果",
                    span: 2,
                    children: selectedTask.target,
                  },
                  {
                    key: "note",
                    label: "计划确认信息",
                    span: 2,
                    children: selectedTask.confirmationNote || "已确认",
                  },
                ]}
              />
            </section>
            <Form form={form} layout="vertical">
              <div className={styles.formGrid}>
                {executionFields
                  .filter(([, , type]) => type !== "textarea")
                  .map(([name, label, type, , options]) => (
                    <Form.Item key={name} name={name} label={label}>
                      {type === "select" ? (
                        <Select
                          options={options.map((value) => ({
                            value,
                            label: value,
                          }))}
                        />
                      ) : type === "number" ? (
                        <InputNumber
                          min={0}
                          step={name === "dutyDays" ? 0.5 : 1}
                        />
                      ) : (
                        <Input />
                      )}
                    </Form.Item>
                  ))}
              </div>
              {executionFields
                .filter(([, , type]) => type === "textarea")
                .map(([name, label]) => (
                  <Form.Item key={name} name={name} label={label}>
                    <Input.TextArea rows={3} />
                  </Form.Item>
                ))}
              <Form.Item label="补充材料">
                <Dragger
                  multiple
                  beforeUpload={() => false}
                  fileList={files}
                  onChange={({ fileList }) => setFiles(fileList)}
                >
                  <InboxOutlined />
                  <p>点击或拖拽上传报告、纪要、图片等补充材料</p>
                  <span>材料将同步进入履职记录、成果报告和评价依据</span>
                </Dragger>
              </Form.Item>
            </Form>
            <div className={styles.actionBar}>
              <Button onClick={closeTask}>取消</Button>
              <Button type="primary" onClick={completeTask}>
                {selectedTask.taskStatus === "已完成"
                  ? "保存修改"
                  : "确认并下发任务通知"}
              </Button>
            </div>
          </div>
        ) : selectedSuggestion ? (
          <div className={styles.drawerContent}>
            <div className={styles.taskHero}>
              {selectedSuggestion.status === "已完成" ? (
                <CheckCircleOutlined />
              ) : (
                <UserOutlined />
              )}
              <div>
                <span>当前负责人 · {selectedSuggestion.assignee}</span>
                <h3>{selectedSuggestion.content}</h3>
                <p>{selectedSuggestion.source}</p>
              </div>
            </div>
            <Steps
              size="small"
              current={selectedSuggestion.status === "已完成" ? 3 : 2}
              items={[
                { title: "建议形成" },
                { title: "任务派发" },
                { title: "落实办理" },
                { title: "成果归档" },
              ]}
            />
            <Descriptions
              bordered
              column={2}
              items={[
                {
                  key: "director",
                  label: "提出董事",
                  children: selectedSuggestion.directorName,
                },
                {
                  key: "type",
                  label: "建议类型",
                  children: selectedSuggestion.type,
                },
                {
                  key: "owner",
                  label: "责任部门",
                  children: selectedSuggestion.owner,
                },
                {
                  key: "assignee",
                  label: "责任人",
                  children: selectedSuggestion.assignee,
                },
                {
                  key: "source",
                  label: "来源事项",
                  children: selectedSuggestion.source,
                },
                {
                  key: "deadline",
                  label: "完成期限",
                  children: selectedSuggestion.deadline,
                },
              ]}
            />
            <Form form={suggestionForm} layout="vertical">
              <Form.Item
                name="handlingPlan"
                label="落实方案"
                rules={[{ required: true, message: "请填写落实方案" }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="说明落实步骤、责任分工和时间安排"
                />
              </Form.Item>
              <Form.Item
                name="progress"
                label="办理进度"
                rules={[{ required: true, message: "请填写办理进度" }]}
              >
                <InputNumber min={0} max={100} suffix="%" />
              </Form.Item>
              <Form.Item
                name="result"
                label="落实结果"
                rules={[{ required: true, message: "请填写落实结果" }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="填写已完成工作和形成成果"
                />
              </Form.Item>
              <Form.Item name="feedback" label="反馈说明">
                <Input.TextArea rows={3} placeholder="填写向董事反馈的内容" />
              </Form.Item>
              <Form.Item label="佐证材料">
                <Dragger
                  multiple
                  beforeUpload={() => false}
                  fileList={files}
                  onChange={({ fileList }) => setFiles(fileList)}
                >
                  <InboxOutlined />
                  <p>上传落实方案、反馈函、成果文件等佐证材料</p>
                </Dragger>
              </Form.Item>
            </Form>
            <div className={styles.actionBar}>
              <Button onClick={closeTask}>取消</Button>
              {selectedSuggestion.status !== "已完成" ? (
                <Button onClick={() => saveSuggestion(false)}>保存进展</Button>
              ) : null}
              <Button type="primary" onClick={() => saveSuggestion(true)}>
                {selectedSuggestion.status === "已完成"
                  ? "保存修改"
                  : "提交完成"}
              </Button>
            </div>
          </div>
        ) : selectedMaterial ? (
          <MaterialTaskView
            embedded
            materials={materials}
            onSubmit={onSubmitMaterial}
            onClose={closeTask}
          />
        ) : selectedPlan ? (
          <PlanConfirmTaskView
            embedded
            plans={plans}
            onSave={onSavePlan}
            onClose={closeTask}
          />
        ) : (
          <Alert
            showIcon
            type="warning"
            message={`未找到 bizId 为 ${bizId} 的履职任务`}
          />
        )}
      </Drawer>
    </div>
  );
}
