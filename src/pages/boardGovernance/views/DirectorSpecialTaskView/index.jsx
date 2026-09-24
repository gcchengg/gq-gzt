import { useState } from "react";
import {
  Button,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Table,
  Tag,
  Upload,
  message,
} from "antd";
import {
  PaperClipOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { PageHeader, SectionCard, StatusPill } from "../../components/PageKit";
import { directors } from "../../mockData";
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

const managedDirectors = directors.filter(
  (director) => director.appointmentStatus === "已完成",
);

const initialTasks = [
  {
    id: "DST-2026-001",
    name: "2026年度董事履职评价专项",
    scope: "全体在任董事",
    content: "年度履职表现、重点任务完成情况及履职风险",
    timeRequirement: "2026-10-15前完成",
    issuer: "集团董办",
    createdAt: "2026-09-18 10:30",
    status: "执行中",
  },
  {
    id: "DST-2026-002",
    name: "董事任期中期评价",
    scope: "李晨光、张铁斌",
    content: "任期目标完成情况与年度履职计划达成度",
    timeRequirement: "2026-11-20前完成",
    issuer: "集团董办",
    createdAt: "2026-09-12 14:00",
    status: "待办理",
  },
];

export default function DirectorSpecialTaskView() {
  const [tasks, setTasks] = useState(initialTasks);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [materialFiles, setMaterialFiles] = useState([]);
  const [form] = Form.useForm();
  const selectedDirectorIds = Form.useWatch("directors", form) || [];
  const selectedDirectors = managedDirectors.filter((director) =>
    selectedDirectorIds.includes(director.id),
  );

  const closeCreate = () => {
    setCreateOpen(false);
    form.resetFields();
    setMaterialFiles([]);
  };

  const createTask = async () => {
    const values = await form.validateFields();
    const taskDirectors = managedDirectors.filter((director) =>
      values.directors.includes(director.id),
    );
    const scope = taskDirectors.map((director) => director.name).join("、");
    setTasks((current) => [
      {
        id: `DST-2026-${String(current.length + 3).padStart(3, "0")}`,
        name: values.name,
        scope,
        directors: taskDirectors.map(({ id, name, company, role }) => ({
          id,
          name,
          company,
          role,
        })),
        workCategory: values.workCategory,
        content: values.content,
        timeRequirement: values.time.format("YYYY-MM-DD HH:mm"),
        location: values.location,
        target: values.target,
        materials: materialFiles.map((file) => file.name),
        issuer: "集团董办",
        createdAt: "2026-09-24 09:00",
        status: "待办理",
      },
      ...current,
    ]);
    closeCreate();
    message.success("董事专项任务已下发");
  };

  const columns = [
    { title: "专项任务名称", dataIndex: "name", width: 230 },
    { title: "人员范围", dataIndex: "scope", width: 170 },
    {
      title: "工作分类",
      dataIndex: "workCategory",
      width: 160,
      render: (value) => value || "—",
    },
    {
      title: "工作内容",
      dataIndex: "content",
      width: 300,
      ellipsis: true,
    },
    { title: "时间", dataIndex: "timeRequirement", width: 170 },
    { title: "发起人", dataIndex: "issuer", width: 110 },
    { title: "创建时间", dataIndex: "createdAt", width: 160 },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (status) => <StatusPill>{status}</StatusPill>,
    },
    {
      title: "操作",
      key: "actions",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <Button type="link" onClick={() => setSelectedTask(record)}>
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="DIRECTOR SPECIAL TASKS"
        title="董事专项任务"
        subtitle="集团董办统一下发董事评价及其他专项办理任务"
      />
      <SectionCard
        title="专项任务列表"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            下发董事专项
          </Button>
        }
      >
        <div className={styles.summary}>
          <span>
            全部专项 <b>{tasks.length}</b>
          </span>
          <Tag color="processing">
            执行中 {tasks.filter((item) => item.status === "执行中").length}
          </Tag>
          <Tag color="warning">
            待办理 {tasks.filter((item) => item.status === "待办理").length}
          </Tag>
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={tasks}
          pagination={false}
          scroll={{ x: 1500 }}
        />
      </SectionCard>
      <Modal
        open={createOpen}
        width={780}
        title="下发董事专项"
        okText="确认下发"
        cancelText="取消"
        onOk={createTask}
        onCancel={closeCreate}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className={styles.createForm}>
          <Form.Item
            label="任务名称"
            name="name"
            rules={[{ required: true, message: "请输入任务名称" }]}
          >
            <Input placeholder="请输入任务名称" />
          </Form.Item>
          <Form.Item
            label="人员范围"
            name="directors"
            rules={[{ required: true, message: "请选择管理范围内的董事" }]}
          >
            <Select
              mode="multiple"
              showSearch
              optionFilterProp="label"
              placeholder="搜索并选择董事，可多选"
              options={managedDirectors.map((director) => ({
                value: director.id,
                label: `${director.name} · ${director.company} · ${director.role}`,
              }))}
            />
          </Form.Item>
          <div className={styles.selectionSummary}>
            <strong>已选董事</strong>
            <span>{selectedDirectors.length} 位</span>
            {selectedDirectors.length ? (
              <div>
                {selectedDirectors.map((director) => (
                  <Tag key={director.id} color="blue">
                    {director.name}
                  </Tag>
                ))}
              </div>
            ) : (
              <small>请选择本次专项任务的办理人员</small>
            )}
          </div>
          <div className={styles.formGrid}>
            <Form.Item
              label="工作分类"
              name="workCategory"
              rules={[{ required: true, message: "请选择工作分类" }]}
            >
              <Select
                placeholder="请选择工作分类"
                options={workCategories.map((value) => ({
                  value,
                  label: value,
                }))}
              />
            </Form.Item>
            <Form.Item
              label="时间"
              name="time"
              rules={[{ required: true, message: "请选择任务时间" }]}
            >
              <DatePicker
                className={styles.fullWidth}
                showTime
                format="YYYY-MM-DD HH:mm"
                placeholder="请选择时间"
              />
            </Form.Item>
            <Form.Item
              label="地点"
              name="location"
              rules={[{ required: true, message: "请输入地点" }]}
            >
              <Input placeholder="请输入工作地点" />
            </Form.Item>
          </div>
          <Form.Item
            label="工作内容"
            name="content"
            rules={[{ required: true, message: "请输入工作内容" }]}
          >
            <Input.TextArea rows={3} placeholder="请描述具体工作内容" />
          </Form.Item>
          <Form.Item
            label="预期达成目标"
            name="target"
            rules={[{ required: true, message: "请输入预期达成目标" }]}
          >
            <Input.TextArea rows={3} placeholder="请填写预期成果或完成标准" />
          </Form.Item>
          <Form.Item label="相关材料">
            <Upload
              multiple
              beforeUpload={() => false}
              fileList={materialFiles}
              onChange={({ fileList }) => setMaterialFiles(fileList)}
            >
              <Button icon={<UploadOutlined />}>上传相关附件</Button>
            </Upload>
            <div className={styles.uploadHint}>
              <PaperClipOutlined /> 支持上传与专项任务相关的文件
            </div>
          </Form.Item>
        </Form>
      </Modal>
      <Drawer
        open={Boolean(selectedTask)}
        width={620}
        title="董事专项任务详情"
        onClose={() => setSelectedTask(null)}
      >
        {selectedTask ? (
          <Descriptions
            bordered
            column={1}
            items={[
              {
                key: "name",
                label: "专项任务名称",
                children: selectedTask.name,
              },
              { key: "scope", label: "人员范围", children: selectedTask.scope },
              {
                key: "category",
                label: "工作分类",
                children: selectedTask.workCategory || "—",
              },
              {
                key: "content",
                label: "工作内容",
                children: selectedTask.content || "—",
              },
              {
                key: "time",
                label: "时间",
                children: selectedTask.timeRequirement || "—",
              },
              {
                key: "location",
                label: "地点",
                children: selectedTask.location || "—",
              },
              {
                key: "target",
                label: "预期达成目标",
                children: selectedTask.target || "—",
              },
              {
                key: "materials",
                label: "相关材料",
                children: selectedTask.materials?.length
                  ? selectedTask.materials.map((name) => (
                      <Tag key={name}>{name}</Tag>
                    ))
                  : "无",
              },
              { key: "issuer", label: "发起人", children: selectedTask.issuer },
              {
                key: "createdAt",
                label: "创建时间",
                children: selectedTask.createdAt,
              },
              {
                key: "status",
                label: "状态",
                children: <StatusPill>{selectedTask.status}</StatusPill>,
              },
            ]}
          />
        ) : null}
      </Drawer>
    </div>
  );
}
