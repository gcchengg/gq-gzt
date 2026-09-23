import { useState } from "react";
import {
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  Modal,
  Table,
  Tag,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { PageHeader, SectionCard, StatusPill } from "../../components/PageKit";
import styles from "./index.module.less";

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
  const [form] = Form.useForm();

  const createTask = async () => {
    const values = await form.validateFields();
    setTasks((current) => [
      {
        id: `DST-2026-${String(current.length + 3).padStart(3, "0")}`,
        name: values.name,
        scope: values.scope,
        content: values.content,
        timeRequirement: values.timeRequirement,
        issuer: "集团董办",
        createdAt: "2026-09-23 09:00",
        status: "待办理",
      },
      ...current,
    ]);
    setCreateOpen(false);
    form.resetFields();
    message.success("董事专项任务已下发");
  };

  const columns = [
    { title: "专项任务名称", dataIndex: "name", width: 230 },
    { title: "人员范围", dataIndex: "scope", width: 170 },
    {
      title: "评价内容",
      dataIndex: "content",
      width: 300,
      ellipsis: true,
    },
    { title: "时间要求", dataIndex: "timeRequirement", width: 170 },
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
        title="下发董事专项任务"
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
          scroll={{ x: 1340 }}
        />
      </SectionCard>
      <Modal
        open={createOpen}
        title="下发董事专项"
        okText="确认下发"
        cancelText="取消"
        onOk={createTask}
        onCancel={() => {
          setCreateOpen(false);
          form.resetFields();
        }}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ scope: "全体在任董事" }}
        >
          <Form.Item
            label="专项任务名称"
            name="name"
            rules={[{ required: true, message: "请输入专项任务名称" }]}
          >
            <Input placeholder="例如：2026年度董事履职评价专项" />
          </Form.Item>
          <Form.Item
            label="人员范围"
            name="scope"
            rules={[{ required: true, message: "请输入人员范围" }]}
          >
            <Input placeholder="请输入董事姓名或人员范围" />
          </Form.Item>
          <Form.Item
            label="评价内容"
            name="content"
            rules={[{ required: true, message: "请输入评价内容" }]}
          >
            <Input.TextArea rows={4} placeholder="请输入评价维度和重点内容" />
          </Form.Item>
          <Form.Item
            label="时间要求"
            name="timeRequirement"
            rules={[{ required: true, message: "请输入时间要求" }]}
          >
            <Input placeholder="例如：2026-10-15前完成" />
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
                key: "content",
                label: "评价内容",
                children: selectedTask.content,
              },
              {
                key: "time",
                label: "时间要求",
                children: selectedTask.timeRequirement,
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
