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
import styles from "./index.module.less";

const { Dragger } = Upload;

export default function DutyTaskManagerView({
  plans,
  onComplete,
  suggestionTasks,
  onSaveSuggestion,
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bizId = searchParams.get("bizId");
  const activeTaskType =
    searchParams.get("taskType") === "suggestion" ? "suggestion" : "duty";
  const [form] = Form.useForm();
  const [suggestionForm] = Form.useForm();
  const [files, setFiles] = useState([]);
  const tasks = useMemo(() => plans.filter((item) => item.taskStatus), [plans]);
  const selectedTask =
    activeTaskType === "duty" ? tasks.find((item) => item.id === bizId) : null;
  const selectedSuggestion =
    activeTaskType === "suggestion"
      ? suggestionTasks.find((item) => item.id === bizId)
      : null;

  useEffect(() => {
    if (!selectedTask) return;
    form.setFieldsValue({
      actualDate: selectedTask.actualDate || selectedTask.date,
      completionSummary: selectedTask.completionSummary || "",
      resultSuggestion: selectedTask.resultSuggestion || "",
      evidenceNote: selectedTask.evidenceNote || "",
    });
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

  const closeTask = () => {
    navigate("/boardGovernance/duty-tasks");
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
  const currentTotal =
    activeTaskType === "suggestion" ? suggestionTasks.length : tasks.length;
  const currentPending =
    activeTaskType === "suggestion" ? suggestionPendingCount : pendingCount;

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="RESPONSIBLE PERSON WORKBENCH"
        title="履职任务负责人工作台"
        subtitle="接收年度履职计划生成的任务，补充办理成果和佐证材料，确认完成后同步履职档案"
        actions={
          <Button onClick={() => navigate("/boardGovernance/home")}>
            返回工作台首页
          </Button>
        }
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
        title="负责人任务列表"
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
            { key: "duty", label: `履职任务 ${tasks.length}` },
            {
              key: "suggestion",
              label: `意见建议落实 ${suggestionTasks.length}`,
            },
          ]}
        />
        {activeTaskType === "duty" && tasks.length ? (
          <DataTable
            rows={tasks}
            columns={[
              { title: "任务名称", dataIndex: "content", width: 280 },
              { title: "董事", dataIndex: "directorName", width: 100 },
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
        {activeTaskType === "duty" && !tasks.length ? (
          <Alert
            showIcon
            type="info"
            message="暂无负责人任务"
            description="请先在履职准备阶段生成年度计划并创建任务。"
          />
        ) : null}
      </SectionCard>

      <Drawer
        open={Boolean(bizId)}
        width={720}
        title={
          selectedTask
            ? `${selectedTask.content} · 履职任务执行详情`
            : selectedSuggestion
              ? `${selectedSuggestion.content} · 意见建议落实办理`
              : "任务不存在"
        }
        onClose={closeTask}
        extra={
          selectedTask ? (
            <StatusPill>{selectedTask.taskStatus}</StatusPill>
          ) : selectedSuggestion ? (
            <StatusPill>{selectedSuggestion.status}</StatusPill>
          ) : null
        }
      >
        {selectedTask ? (
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
            <Descriptions
              bordered
              column={2}
              items={[
                {
                  key: "director",
                  label: "董事",
                  children: selectedTask.directorName,
                },
                {
                  key: "company",
                  label: "任职企业",
                  children: selectedTask.servingCompany,
                },
                { key: "type", label: "任务类型", children: selectedTask.type },
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
                { key: "date", label: "计划时间", children: selectedTask.date },
                {
                  key: "note",
                  label: "计划确认信息",
                  children: selectedTask.confirmationNote || "已确认",
                },
                {
                  key: "target",
                  label: "预期成果",
                  children: selectedTask.target,
                },
              ]}
            />
            <Form form={form} layout="vertical">
              <div className={styles.formGrid}>
                <Form.Item
                  name="actualDate"
                  label="实际完成日期"
                  rules={[{ required: true, message: "请填写实际完成日期" }]}
                >
                  <Input placeholder="例如：2026-10-15" />
                </Form.Item>
                <Form.Item
                  name="evidenceNote"
                  label="成果说明"
                  rules={[{ required: true, message: "请填写成果说明" }]}
                >
                  <Input placeholder="例如：已形成会议纪要及决议清单" />
                </Form.Item>
              </div>
              <Form.Item
                name="completionSummary"
                label="完成情况"
                rules={[{ required: true, message: "请填写完成情况" }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="说明任务执行过程和完成结果"
                />
              </Form.Item>
              <Form.Item name="resultSuggestion" label="形成的意见建议">
                <Input.TextArea rows={3} placeholder="没有意见建议时可不填写" />
              </Form.Item>
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
                  : "确认完成该计划"}
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
