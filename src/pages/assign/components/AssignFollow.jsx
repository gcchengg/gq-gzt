import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Upload,
  message,
} from "antd";
import { InboxOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { getFollowList, parseAssignFile, saveFollow } from "../mockApi";
import "./AssignFollow.css";

const itemTypeText = {
  1: "议题相关",
  2: "会议相关",
  3: "其他",
};

const statusText = {
  0: "执行中",
  1: "完成确认中",
  2: "结束",
};

const fileKindText = {
  audio: "录音",
  pdf: "PDF",
};

export default function AssignFollow({ id, editStatus }) {
  const [loading, setLoading] = useState(false);
  const [aiParsing, setAiParsing] = useState(false);
  const [assignList, setAssignList] = useState([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeRow, setActiveRow] = useState(null);
  const [parsedFiles, setParsedFiles] = useState([]);
  const [form] = Form.useForm();

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getFollowList({
        sanhuiMgmtId: id,
        currentPage: 1,
        pageSize: 10,
      });
      setAssignList(res.data.list || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const columns = useMemo(
    () => [
      {
        title: "序号",
        dataIndex: "index",
        key: "index",
        fixed: "left",
        width: 70,
        render: (_text, _record, index) => index + 1,
      },
      {
        title: "交办来源",
        dataIndex: "followFromType",
        key: "followFromType",
        align: "center",
        width: 120,
        render: (value) =>
          !value
            ? "三会反馈"
            : value === "100"
              ? "专题汇报"
              : value === "200"
                ? "三会反馈"
                : "决策执行",
      },
      {
        title: "交办名称",
        dataIndex: "followName",
        key: "followName",
        align: "center",
        width: 180,
      },
      {
        title: "交办内容",
        dataIndex: "followDetail",
        key: "followDetail",
        width: 280,
        ellipsis: true,
      },
      {
        title: "相关分类",
        dataIndex: "itemType",
        key: "itemType",
        align: "center",
        width: 120,
        render: (value) => itemTypeText[value] || "",
      },
      {
        title: "相关议题/会议名称",
        dataIndex: "toipcName",
        key: "toipcName",
        width: 220,
        ellipsis: true,
      },
      {
        title: "交办人",
        dataIndex: "assignUserName",
        key: "assignUserName",
        align: "center",
        width: 110,
      },
      {
        title: "截止时间",
        dataIndex: "deadlineDate",
        key: "deadlineDate",
        align: "center",
        width: 130,
        render: (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "-"),
      },
      {
        title: "计划执行时间",
        key: "planData",
        align: "center",
        width: 220,
        render: (_value, row) =>
          row.planStartDate && row.planEndDate
            ? `${dayjs(row.planStartDate).format("YYYY-MM-DD")}~${dayjs(row.planEndDate).format("YYYY-MM-DD")}`
            : "-",
      },
      {
        title: "执行总结",
        dataIndex: "execDetail",
        key: "execDetail",
        width: 260,
        ellipsis: true,
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        align: "center",
        width: 120,
        render: (value, row) =>
          !row.followFromType ? (
            <Tag color="gold">反馈确认中</Tag>
          ) : (
            <Tag
              color={
                value === "2"
                  ? "success"
                  : value === "1"
                    ? "blue"
                    : "processing"
              }
            >
              {statusText[value || "0"]}
            </Tag>
          ),
      },
      {
        title: "操作",
        key: "action",
        align: "center",
        fixed: "right",
        width: 130,
        render: (_value, row) => (
          <Button
            type="link"
            onClick={() => {
              setActiveRow(row);
              form.setFieldsValue({
                ...row,
                deadlineDate: row.deadlineDate
                  ? dayjs(row.deadlineDate)
                  : undefined,
                planDate:
                  row.planStartDate && row.planEndDate
                    ? [dayjs(row.planStartDate), dayjs(row.planEndDate)]
                    : undefined,
              });
              setDetailOpen(true);
            }}
          >
            {editStatus && row.status === "0" ? "编辑" : "查看"}
          </Button>
        ),
      },
    ],
    [editStatus, form],
  );

  const handleUpload = async (file) => {
    const fileName = file.name || "";
    const lowerName = fileName.toLowerCase();
    const isPdf = lowerName.endsWith(".pdf");
    const isAudio =
      file.type?.startsWith("audio/") ||
      [".mp3", ".wav", ".m4a", ".aac", ".flac"].some((suffix) =>
        lowerName.endsWith(suffix),
      );

    if (!isPdf && !isAudio) {
      message.error("仅支持上传录音或 PDF 文件");
      return Upload.LIST_IGNORE;
    }

    setAiParsing(true);
    try {
      const parseRes = await parseAssignFile({
        sanhuiMgmtId: id,
        fileName,
        fileType: isAudio ? "audio" : "pdf",
      });
      const record = parseRes.data;
      const saveRes = await saveFollow({
        ...record,
        sanhuiMgmtId: id,
      });
      const nextRecord = saveRes.data || {
        ...record,
        id: `follow-${Date.now()}`,
      };
      setAssignList((current) => [nextRecord, ...current]);
      setParsedFiles((current) => [
        {
          id: `${file.uid}-${Date.now()}`,
          name: fileName,
          type: isAudio ? "audio" : "pdf",
          parsedAt: dayjs().format("HH:mm:ss"),
          followName: nextRecord.followName,
        },
        ...current,
      ]);
      message.success("AI 解析完成，已补充到交办事项表格");
    } finally {
      setAiParsing(false);
    }

    return false;
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    await saveFollow({
      ...activeRow,
      ...values,
      sanhuiMgmtId: id,
      deadlineDate: values.deadlineDate
        ? values.deadlineDate.format("YYYY-MM-DD")
        : "",
      planStartDate: values.planDate?.[0]?.format("YYYY-MM-DD"),
      planEndDate: values.planDate?.[1]?.format("YYYY-MM-DD"),
    });
    message.success("保存成功");
    setDetailOpen(false);
    fetchData();
  };

  return (
    <div className="assign-follow">
      {editStatus ? (
        <div className="assign-follow-ai">
          <div className="assign-follow-ai-copy">
            <strong>AI 交办解析</strong>
            <span>上传会议录音或 PDF，自动识别交办事项并补充到下方列表。</span>
          </div>
          <Upload.Dragger
            className="assign-follow-upload"
            accept=".pdf,audio/*,.mp3,.wav,.m4a,.aac,.flac"
            multiple={false}
            showUploadList={false}
            disabled={aiParsing}
            beforeUpload={handleUpload}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              {aiParsing ? "AI 正在解析..." : "点击或拖拽录音 / PDF 到这里"}
            </p>
            <p className="ant-upload-hint">
              当前为本地模拟解析，不会上传到真实接口。
            </p>
          </Upload.Dragger>
          {parsedFiles.length > 0 ? (
            <div className="assign-follow-files">
              {parsedFiles.map((file) => (
                <div className="assign-follow-file" key={file.id}>
                  <Tag color={file.type === "audio" ? "purple" : "blue"}>
                    {fileKindText[file.type]}
                  </Tag>
                  <span>{file.name}</span>
                  <em>{file.parsedAt}</em>
                  <strong>{file.followName}</strong>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="assign-follow-toolbar">
        <div>
          <strong>交办事项</strong>
          <span>共 {assignList.length} 条</span>
        </div>
        {editStatus ? (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setActiveRow(null);
              form.resetFields();
              setDetailOpen(true);
            }}
          >
            新增交办
          </Button>
        ) : null}
      </div>

      <Table
        loading={loading || aiParsing}
        columns={columns}
        dataSource={assignList}
        rowKey="id"
        size="small"
        scroll={{ x: 1800 }}
        pagination={false}
      />

      <Drawer
        title={activeRow ? "交办详情" : "新增交办"}
        open={detailOpen}
        width={640}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
        footer={
          <div className="assign-form-footer">
            <Button onClick={() => setDetailOpen(false)}>取消</Button>
            {editStatus ? (
              <Button type="primary" onClick={handleSave}>
                保存
              </Button>
            ) : null}
          </div>
        }
      >
        <Form form={form} layout="vertical" disabled={!editStatus}>
          <Form.Item
            name="followName"
            label="交办名称"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="followDetail"
            label="交办内容"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="itemType"
            label="相关分类"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: "议题相关", value: "1" },
                { label: "会议相关", value: "2" },
                { label: "其他", value: "3" },
              ]}
            />
          </Form.Item>
          <Form.Item name="toipcName" label="相关议题/会议名称">
            <Input />
          </Form.Item>
          <Form.Item
            name="assignUserName"
            label="交办人"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="deadlineDate"
            label="截止时间"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="planDate" label="计划执行时间">
            <DatePicker.RangePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="execDetail" label="执行总结">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
