import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Timeline,
  Upload,
  message,
} from "antd";
import { InboxOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  DataTable,
  PageHeader,
  SectionCard,
  StatusPill,
} from "../../components/PageKit";
import { visibleSuggestions } from "../../suggestionWorkflow";
import styles from "./index.module.less";

const currentDirectorName = "张铁斌";
const { Dragger } = Upload;

const taskLabel = (task) => `${task.type} · ${task.content}`;
const sourceLabel = (item) =>
  item.sourceTaskSnapshot?.content || item.source || "历史来源";

export default function DutySuggestionView({
  role,
  resource,
  id,
  suggestions,
  plans,
  onCreate,
  onDispatch,
  onSaveProgress,
  onClose,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const listPath = "/boardGovernance/duty-suggestions";
  const [searchParams] = useSearchParams();
  const [createForm] = Form.useForm();
  const [dispatchForm] = Form.useForm();
  const [progressForm] = Form.useForm();
  const [createOpen, setCreateOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [assignee, setAssignee] = useState(searchParams.get("assignee") || "");
  const [files, setFiles] = useState([]);
  const officeView = role === "adminDepartment" && !assignee;
  const personView = role === "adminDepartment" && Boolean(assignee);
  const selected = suggestions.find((item) => item.id === id);
  const watchedDirector = Form.useWatch("directorName", createForm);
  const directors = useMemo(
    () => [
      ...new Set(
        plans
          .filter((plan) => plan.taskStatus)
          .map((plan) => plan.directorName),
      ),
    ],
    [plans],
  );
  const assignees = useMemo(
    () => [
      ...new Set(suggestions.map((item) => item.assignee).filter(Boolean)),
    ],
    [suggestions],
  );
  const selectedDirector =
    role === "director" ? currentDirectorName : watchedDirector;
  const availableTasks = plans.filter(
    (plan) => plan.taskStatus && plan.directorName === selectedDirector,
  );
  const visible = visibleSuggestions(suggestions, {
    role,
    directorName: currentDirectorName,
    assignee,
  }).filter((item) => {
    const matchDirector =
      !searchParams.get("directorName") ||
      item.directorName === searchParams.get("directorName");
    const matchStatus = !statusFilter || item.status === statusFilter;
    const text = [
      item.id,
      item.content,
      item.directorName,
      sourceLabel(item),
      item.owner,
      item.assignee,
    ]
      .join(" ")
      .toLowerCase();
    return (
      matchDirector &&
      matchStatus &&
      text.includes(keyword.trim().toLowerCase())
    );
  });

  useEffect(() => {
    setAssignee(searchParams.get("assignee") || "");
  }, [searchParams]);

  useEffect(() => {
    if (!selected) return;
    dispatchForm.setFieldsValue({
      owner: selected.owner,
      assignee: selected.assignee,
      deadline: selected.deadline,
    });
    progressForm.setFieldsValue({
      handlingPlan: selected.handlingPlan,
      progress: selected.progress,
      result: selected.result,
      feedback: selected.feedback,
    });
    setFiles(
      (selected.files || []).map((name, index) => ({
        uid: `${selected.id}-${index}`,
        name,
        status: "done",
      })),
    );
  }, [selected, dispatchForm, progressForm]);

  const changeAssignee = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("assignee", value);
    else next.delete("assignee");
    navigate({ pathname: location.pathname, search: next.toString() });
  };

  const submitCreate = async (dispatchNow = false) => {
    try {
      const values = await createForm.validateFields();
      if (
        dispatchNow &&
        (!values.owner || !values.assignee || !values.deadline)
      ) {
        message.error("下发前请填写责任部门、责任人和完成期限");
        return;
      }
      const sourceTask = plans.find((plan) => plan.id === values.sourceTaskId);
      const created = onCreate(
        {
          directorName:
            role === "director" ? currentDirectorName : values.directorName,
          sourceTask,
          content: values.content,
          initiatorRole: role,
          initiatorName:
            role === "director" ? currentDirectorName : "综合管理部-董办",
        },
        dispatchNow
          ? {
              owner: values.owner,
              assignee: values.assignee,
              deadline: values.deadline,
            }
          : null,
      );
      setCreateOpen(false);
      createForm.resetFields();
      message.success(dispatchNow ? "履职建议已下发" : "履职建议已提交");
      navigate(
        `/boardGovernance/duty-suggestions/${created.id}${location.search}`,
      );
    } catch (error) {
      if (!error?.errorFields) message.error(error.message || "提交失败");
    }
  };

  const submitDispatch = async () => {
    try {
      const values = await dispatchForm.validateFields();
      onDispatch(selected.id, values);
      message.success("履职建议已下发");
    } catch (error) {
      if (!error?.errorFields) message.error(error.message || "下发失败");
    }
  };

  const submitProgress = async (close = false) => {
    try {
      const values = close
        ? await progressForm.validateFields(["result"])
        : progressForm.getFieldsValue();
      const payload = {
        ...progressForm.getFieldsValue(),
        ...values,
        files: files.map((file) => file.name),
      };
      if (close) onClose(selected.id, payload);
      else onSaveProgress(selected.id, payload);
      message.success(close ? "履职建议已关闭" : "办理进展已保存");
    } catch (error) {
      if (!error?.errorFields) message.error(error.message || "保存失败");
    }
  };

  const canDispatch = officeView && selected?.status === "待董办补充";
  const canFulfill =
    personView &&
    selected?.assignee === assignee &&
    ["待落实", "办理中"].includes(selected?.status);
  const canViewSelected = Boolean(
    selected &&
    visibleSuggestions([selected], {
      role,
      directorName: currentDirectorName,
      assignee,
    }).length,
  );

  const closeDetail = () => {
    navigate({ pathname: listPath, search: location.search });
  };

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="DUTY SUGGESTIONS"
        title="履职建议"
        subtitle="关联前序履职任务，跟踪建议下发、落实与关闭全过程"
        actions={
          <Space>
            {role === "director" || officeView ? (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateOpen(true)}
              >
                发起履职建议
              </Button>
            ) : null}
          </Space>
        }
      />

      {/* {role === "adminDepartment" ? (
        <SectionCard title="办理视角" extra={<span className={styles.hint}>选择责任人后办理分派给他的建议</span>}>
          <Select
            className={styles.personSelect}
            value={assignee || undefined}
            placeholder="综合管理部-董办 · 查看全部"
            allowClear
            onChange={changeAssignee}
            options={assignees.map((name) => ({ label: `${name} · 责任人`, value: name }))}
          />
        </SectionCard>
      ) : null} */}

      <SectionCard
        title="履职建议列表"
        extra={<span className={styles.hint}>共 {visible.length} 条</span>}
      >
        <div className={styles.filters}>
          <Input.Search
            allowClear
            placeholder="搜索建议、董事、任务或责任人"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <Select
            value={statusFilter || undefined}
            placeholder="全部状态"
            allowClear
            onChange={(value) => setStatusFilter(value || "")}
            options={["待董办补充", "待落实", "办理中", "已关闭"].map(
              (status) => ({ label: status, value: status }),
            )}
          />
        </div>
        {officeView &&
        suggestions.some((item) => item.status === "待董办补充") ? (
          <Alert
            type="info"
            showIcon
            className={styles.notice}
            message={`有 ${suggestions.filter((item) => item.status === "待董办补充").length} 条建议待董办明确责任并下发`}
          />
        ) : null}
        {visible.length ? (
          <DataTable
            rows={visible}
            columns={[
              { title: "编号", dataIndex: "id", width: 110 },
              {
                title: "建议内容",
                dataIndex: "content",
                width: 310,
                ellipsis: true,
              },
              { title: "提出董事", dataIndex: "directorName", width: 100 },
              {
                title: "关联履职任务",
                width: 230,
                render: (_, item) => sourceLabel(item),
              },
              {
                title: "责任部门",
                dataIndex: "owner",
                width: 160,
                render: (value) => value || "待明确",
              },
              {
                title: "责任人",
                dataIndex: "assignee",
                width: 95,
                render: (value) => value || "待明确",
              },
              {
                title: "完成期限",
                dataIndex: "deadline",
                width: 115,
                render: (value) => value || "待明确",
              },
              {
                title: "状态",
                dataIndex: "status",
                width: 110,
                render: (value) => <StatusPill>{value}</StatusPill>,
              },
              {
                title: "操作",
                width: 90,
                render: (_, item) => (
                  <Link
                    to={`/boardGovernance/duty-suggestions/${item.id}${location.search}`}
                  >
                    查看详情
                  </Link>
                ),
              },
            ]}
          />
        ) : null}
        {!visible.length ? (
          <Empty description="暂无符合条件的履职建议" />
        ) : null}
      </SectionCard>

      <Drawer
        open={resource === "suggestion"}
        onClose={closeDetail}
        width="min(960px, 100vw)"
        title={"履职建议详情"}
        // extra={canViewSelected ? <StatusPill>{selected.status}</StatusPill> : null}
      >
        {canViewSelected ? (
          <div className={styles.detailGrid}>
            <SectionCard
              title={`${selected.id} · 履职建议`}
              extra={<StatusPill>{selected.status}</StatusPill>}
            >
              <Descriptions
                bordered
                column={{ xs: 1, sm: 2 }}
                items={[
                  {
                    key: "director",
                    label: "提出董事",
                    children: selected.directorName,
                  },
                  {
                    key: "initiator",
                    label: "发起人",
                    children: selected.initiatorName || selected.directorName,
                  },
                  {
                    key: "source",
                    label: "关联履职任务",
                    children: sourceLabel(selected),
                  },
                  {
                    key: "taskId",
                    label: "任务编号",
                    children: selected.sourceTaskId || "历史来源",
                  },
                  {
                    key: "content",
                    label: "建议内容",
                    children: selected.content,
                    span: 2,
                  },
                  {
                    key: "owner",
                    label: "责任部门",
                    children: selected.owner || "待明确",
                  },
                  {
                    key: "assignee",
                    label: "责任人",
                    children: selected.assignee || "待明确",
                  },
                  {
                    key: "deadline",
                    label: "完成期限",
                    children: selected.deadline || "待明确",
                  },
                  {
                    key: "progress",
                    label: "办理进度",
                    children: `${selected.progress || 0}%`,
                  },
                  {
                    key: "plan",
                    label: "落实方案",
                    children: selected.handlingPlan || "暂无",
                    span: 2,
                  },
                  {
                    key: "result",
                    label: "落实结果",
                    children: selected.result || "暂无",
                    span: 2,
                  },
                  {
                    key: "feedback",
                    label: "反馈说明",
                    children: selected.feedback || "暂无",
                    span: 2,
                  },
                  {
                    key: "files",
                    label: "佐证材料",
                    children: selected.files?.length
                      ? selected.files.join("、")
                      : "暂无",
                    span: 2,
                  },
                ]}
              />
            </SectionCard>
            {canDispatch ? (
              <SectionCard title="董办补充并下发">
                <Form form={dispatchForm} layout="vertical">
                  <div className={styles.formGrid}>
                    <Form.Item
                      name="owner"
                      label="责任部门"
                      rules={[{ required: true, message: "请填写责任部门" }]}
                    >
                      <Input placeholder="例如：股权运营部" />
                    </Form.Item>
                    <Form.Item
                      name="assignee"
                      label="责任人"
                      rules={[{ required: true, message: "请填写责任人" }]}
                    >
                      <Input placeholder="例如：陈哲" />
                    </Form.Item>
                    <Form.Item
                      name="deadline"
                      label="完成期限"
                      rules={[{ required: true, message: "请选择完成期限" }]}
                    >
                      <Input type="date" />
                    </Form.Item>
                  </div>
                  <Button type="primary" onClick={submitDispatch}>
                    下发履职建议
                  </Button>
                </Form>
              </SectionCard>
            ) : null}
            {canFulfill ? (
              <SectionCard title="履职建议落实">
                <Form form={progressForm} layout="vertical">
                  <Form.Item name="handlingPlan" label="落实方案">
                    <Input.TextArea
                      rows={3}
                      placeholder="填写落实步骤和时间安排"
                    />
                  </Form.Item>
                  <div className={styles.formGrid}>
                    <Form.Item name="progress" label="办理进度">
                      <InputNumber min={0} max={100} suffix="%" />
                    </Form.Item>
                    <Form.Item name="feedback" label="反馈说明">
                      <Input placeholder="填写向董事反馈的内容" />
                    </Form.Item>
                  </div>
                  <Form.Item
                    name="result"
                    label="落实结果"
                    rules={[
                      { required: true, message: "关闭前请填写落实结果" },
                    ]}
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="填写已完成工作及成果"
                    />
                  </Form.Item>
                  <Form.Item label="佐证材料">
                    <Dragger
                      multiple
                      beforeUpload={() => false}
                      fileList={files}
                      onChange={({ fileList }) => setFiles(fileList)}
                    >
                      <InboxOutlined />
                      <p>上传落实方案、反馈函或成果材料</p>
                    </Dragger>
                  </Form.Item>
                  <Space>
                    <Button onClick={() => submitProgress(false)}>
                      保存进展
                    </Button>
                    <Button type="primary" onClick={() => submitProgress(true)}>
                      提交完成并关闭
                    </Button>
                  </Space>
                </Form>
              </SectionCard>
            ) : null}
            <SectionCard title="办理记录">
              <Timeline
                items={
                  selected.history?.length
                    ? selected.history.map((entry, index) => ({
                        key: `${index}-${entry.at}`,
                        children: (
                          <div>
                            <strong>{entry.action}</strong>
                            <div>
                              {entry.at} · {entry.actor}
                            </div>
                            {entry.detail ? <p>{entry.detail}</p> : null}
                          </div>
                        ),
                      }))
                    : [{ children: "历史演示数据：办理过程未记录" }]
                }
              />
            </SectionCard>
          </div>
        ) : (
          <SectionCard title="建议不存在或无权查看">
            <Empty description="该履职建议不存在，或当前办理视角无权查看。">
              <Button onClick={closeDetail}>返回列表</Button>
            </Empty>
          </SectionCard>
        )}
      </Drawer>

      <Modal
        title="发起履职建议"
        open={createOpen}
        onCancel={() => {
          setCreateOpen(false);
          createForm.resetFields();
        }}
        footer={
          <Space>
            <Button onClick={() => setCreateOpen(false)}>取消</Button>
            <Button onClick={() => submitCreate(false)}>
              {officeView ? "保存待下发" : "提交建议"}
            </Button>
            {officeView ? (
              <Button type="primary" onClick={() => submitCreate(true)}>
                下发建议
              </Button>
            ) : null}
          </Space>
        }
        destroyOnHidden
      >
        <Form
          form={createForm}
          layout="vertical"
          initialValues={{
            directorName: role === "director" ? currentDirectorName : undefined,
          }}
        >
          {officeView ? (
            <Form.Item
              name="directorName"
              label="提出董事"
              rules={[{ required: true, message: "请选择董事" }]}
            >
              <Select
                placeholder="选择董事"
                options={directors.map((name) => ({
                  label: name,
                  value: name,
                }))}
                onChange={() =>
                  createForm.setFieldValue("sourceTaskId", undefined)
                }
              />
            </Form.Item>
          ) : null}
          <Form.Item
            name="sourceTaskId"
            label="关联履职任务"
            rules={[{ required: true, message: "请选择前序履职任务" }]}
          >
            <Select
              placeholder={
                availableTasks.length
                  ? "选择一项前序履职任务"
                  : "暂无可关联的履职任务"
              }
              options={availableTasks.map((task) => ({
                label: taskLabel(task),
                value: task.id,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="content"
            label="建议内容"
            rules={[
              { required: true, whitespace: true, message: "请填写建议内容" },
            ]}
          >
            <Input.TextArea rows={5} placeholder="填写具体、可落实的履职建议" />
          </Form.Item>
          {officeView ? (
            <div className={styles.formGrid}>
              <Form.Item name="owner" label="责任部门">
                <Input placeholder="下发前填写" />
              </Form.Item>
              <Form.Item name="assignee" label="责任人">
                <Input placeholder="下发前填写" />
              </Form.Item>
              <Form.Item name="deadline" label="完成期限">
                <Input type="date" />
              </Form.Item>
            </div>
          ) : null}
          {!availableTasks.length ? (
            <Alert
              type="warning"
              showIcon
              message="请先为该董事生成履职任务"
              action={
                <Link to="/boardGovernance/duty-tasks">查看履职任务</Link>
              }
            />
          ) : null}
        </Form>
      </Modal>
    </div>
  );
}
