import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Select,
  Spin,
  Steps,
  Upload,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  PaperClipOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAssignFollowTask } from "../newSanhui/mockApi";
import "./index.css";

const taskTypeOptions = [
  { label: "督办任务", value: "300" },
  { label: "参加会议", value: "200" },
  { label: "公司走访", value: "100" },
];

export default function AssignFollowTask() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [taskData, setTaskData] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAssignFollowTask({
        taskId: searchParams.get("taskId"),
      });
      if (res.code === 200) {
        setTaskData(res.data);
        form.setFieldsValue({
          taskType: "300",
          taskDesc: res.data.taskDesc || "212",
          planCmplDate: dayjs(res.data.planCmplDate || "2026-06-22"),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchParams]);

  const steps = useMemo(
    () => [
      {
        title: "创建任务",
        icon: <CheckCircleOutlined />,
        description: `任务创建时间:${taskData?.createdAt || "2026-06-22 18:33:35"}`,
      },
      {
        title: "任务完善",
        description: `任务完善完成时间:${taskData?.completedAt || "2026-06-22 18:33:35"}`,
      },
    ],
    [taskData],
  );

  const handleConfirm = async () => {
    await form.validateFields();
    message.success("交办事项任务已确认");
    navigate("/GztHome");
  };

  return (
    <Spin spinning={loading}>
      <div className="assign-follow-task-page">
        <div className="assign-follow-task-steps">
          <Steps current={1} items={steps} />
        </div>

        <div className="assign-follow-task-body">
          <Card className="assign-follow-task-card" bordered={false}>
            <div className="assign-follow-task-title">创建任务</div>
            <Form layout="vertical" className="assign-follow-task-create" disabled>
              <div className="assign-follow-task-grid">
                <Form.Item label="任务发起人" required>
                  <Select
                    value={taskData?.issueUserName || "郑华峰"}
                    options={[{ label: taskData?.issueUserName || "郑华峰", value: taskData?.issueUserName || "郑华峰" }]}
                  />
                </Form.Item>
                <Form.Item label="目标公司" required>
                  <Input value={taskData?.companyName || "富奥汽车零部件股份有限公司"} />
                </Form.Item>
                <Form.Item label="任务执行人" required>
                  <Select
                    value={taskData?.dutyUserName || "郑华峰"}
                    options={[{ label: taskData?.dutyUserName || "郑华峰", value: taskData?.dutyUserName || "郑华峰" }]}
                  />
                </Form.Item>
                <Form.Item label="任务来源">
                  <Input value={taskData?.taskSource || "三会决策执行"} />
                </Form.Item>
              </div>

              <Form.Item label="任务描述" required className="assign-follow-task-desc">
                <div className="assign-follow-task-text">
                  {taskData?.taskDesc || "212"}
                </div>
              </Form.Item>

              <div className="assign-follow-task-grid compact">
                <Form.Item label="任务完成时间" required>
                  <DatePicker
                    value={dayjs(taskData?.planCmplDate || "2026-06-22")}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item label="上传附件">
                  <Upload disabled fileList={[]}>
                    <Button icon={<UploadOutlined />}>上传文件</Button>
                  </Upload>
                  <a className="assign-follow-task-file" href="#attachment" onClick={(event) => event.preventDefault()}>
                    <PaperClipOutlined />
                    <span>{taskData?.attachmentName || "截屏2026-04-15 17.55.31.png"}</span>
                  </a>
                </Form.Item>
              </div>
            </Form>
          </Card>

          <Card className="assign-follow-task-card" bordered={false}>
            <div className="assign-follow-task-title">任务完善</div>
            <Form form={form} layout="vertical" className="assign-follow-task-improve">
              <div className="assign-follow-task-improve-head">
                <Form.Item
                  label="任务类型选择"
                  name="taskType"
                  rules={[{ required: true, message: "请选择任务类型" }]}
                  className="assign-follow-task-type"
                >
                  <Select disabled options={taskTypeOptions} />
                </Form.Item>
                <div className="assign-follow-task-type-note">
                  当前交办事项固定为督办任务，按交办要求完善执行信息。
                </div>
              </div>

              <Form.Item
                label="任务描述"
                name="taskDesc"
                rules={[{ required: true, message: "请输入任务描述" }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="请输入任务描述"
                  className="assign-follow-task-textarea"
                />
              </Form.Item>

              <div className="assign-follow-task-grid compact">
                <Form.Item
                  label="任务完成时间"
                  name="planCmplDate"
                  rules={[{ required: true, message: "请选择任务完成时间" }]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item label="上传附件">
                  <Upload fileList={[]}>
                    <Button icon={<UploadOutlined />}>上传文件</Button>
                  </Upload>
                  <a className="assign-follow-task-file" href="#attachment" onClick={(event) => event.preventDefault()}>
                    <PaperClipOutlined />
                    <span>{taskData?.attachmentName || "截屏2026-04-15 17.55.31.png"}</span>
                  </a>
                </Form.Item>
              </div>
            </Form>
          </Card>
        </div>

        <div className="assign-follow-task-footer">
          <Button type="primary" onClick={handleConfirm}>
            确认
          </Button>
        </div>
      </div>
    </Spin>
  );
}
