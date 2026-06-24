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
  Tooltip,
  Upload,
  message,
} from "antd";
import {
  InboxOutlined,
  PaperClipOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createAssignFollowTask,
  getFollowList,
  parseAssignFile,
  saveFollow,
} from "../mockApi";
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

const isThreeMeetingFeedback = (item) =>
  !item.followFromType || String(item.followFromType) === "200";

function ColumnHelpTitle({ title, items }) {
  return (
    <span className="assign-follow-column-title">
      {title}
      <Tooltip
        title={
          <div className="assign-follow-column-help">
            {items.map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
        }
      >
        <QuestionCircleOutlined />
      </Tooltip>
    </span>
  );
}

const voteSuggestionFeedbackFollow = {
  id: "follow-vote-feedback-001",
  followFromType: "200",
  followName: "落实董事会决议事项",
  followDetail:
    "表决建议中请明确本次基金退出的表决倾向，并补充收益测算依据、风险兜底安排及授权条件。",
  itemType: "voteFeedback",
  toipcName: "关于推进基金退出事项的表决建议单",
  assignUserName: "张总",
  deadlineDate: "2026-04-30",
  planStartDate: "2026-04-25",
  planEndDate: "2026-04-30",
  execDetail:
    "管户回复：已将表决倾向调整为建议同意，补充收益测算底稿、风险处置预案及授权条件，交易价格和协议文本将提交法务复核。",
  status: "1",
  feedbackKind: "voteSuggestion",
  referenceAttachments: [
    {
      id: "vote-review-attachment-001",
      name: "表决建议单审阅附件-反馈建议.pdf",
      url: "/advice-review/6a2133fde4b0cb6abf664a41.pdf",
    },
    {
      id: "vote-review-attachment-002",
      name: "表决建议单审阅附件-补充说明.pdf",
      url: "/advice-review/6a2133fde4b0cb6abf664a41.pdf",
    },
  ],
};

export default function AssignFollow({
  id,
  editStatus,
  filterFollowFromType,
  allowCreate = true,
}) {
  const navigate = useNavigate();
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

  const tableData = useMemo(() => {
    const hasVoteFeedback = assignList.some(
      (item) => item.id === voteSuggestionFeedbackFollow.id,
    );
    return hasVoteFeedback
      ? assignList
      : [voteSuggestionFeedbackFollow, ...assignList];
  }, [assignList]);

  const visibleTableData = useMemo(
    () =>
      filterFollowFromType === "threeMeetingFeedback"
        ? tableData.filter(isThreeMeetingFeedback)
        : tableData,
    [filterFollowFromType, tableData],
  );

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
        title: (
          <ColumnHelpTitle
            title="交办来源"
            items={["1.反馈建议默认显示-三会反馈"]}
          />
        ),
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
        width: 210,
        render: (value, row) =>
          row.feedbackKind === "voteSuggestion" ? (
            <div className="assign-follow-cell-stack is-center">
              <span>{value}</span>{" "}
              <ColumnHelpTitle
                title=""
                items={["交办名称默认显示-落实董事会决议事项"]}
              />
            </div>
          ) : (
            value
          ),
      },
      {
        title: "交办内容",
        dataIndex: "followDetail",
        key: "followDetail",
        width: 360,
        render: (value, row) =>
          row.feedbackKind === "voteSuggestion" ? (
            <div className="assign-follow-cell-stack">
              <span>{value}</span>
            </div>
          ) : (
            value
          ),
      },

      {
        title: "相关议题/会议名称",
        dataIndex: "toipcName",
        key: "toipcName",
        width: 220,
        ellipsis: true,
      },
      {
        title: "参考附件",
        dataIndex: "referenceAttachments",
        key: "referenceAttachments",
        width: 260,
        render: (attachments) =>
          attachments?.length ? (
            <div className="assign-follow-attachments">
              {attachments.map((attachment) => (
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  key={attachment.id || attachment.name}
                  title={attachment.name}
                >
                  <PaperClipOutlined />
                  <span>{attachment.name}</span>
                </a>
              ))}
            </div>
          ) : (
            "-"
          ),
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
        width: 340,
        render: (value, row) =>
          row.feedbackKind === "voteSuggestion" ? (
            <div className="assign-follow-cell-stack">
              <span>{value}</span>
            </div>
          ) : (
            value
          ),
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
            编辑
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

  const handleDraftSave = () => {
    message.success("交办事项已保存");
  };

  const handleSubmit = async () => {
    if (!visibleTableData.length) {
      message.warning("请先新增交办事项后再提交");
      return;
    }
    setLoading(true);
    try {
      const res = await createAssignFollowTask({
        sanhuiMgmtId: id,
        followList: visibleTableData,
      });
      if (res.code !== 200) {
        message.error(res.message || "提交失败");
        return;
      }
      message.success("已创建交办事项任务");
      navigate("/GztHome");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assign-follow">
      <div className="assign-follow-toolbar">
        <div>
          <strong>交办事项</strong>
          <span>共 {visibleTableData.length} 条</span>
          <ColumnHelpTitle
            title=""
            items={[
              "1.删除相关分类列",
              "2.三会表决后额外给管护发送一个【交办落实跟踪】任务，目的是记录领导反馈内容的交办事项",
              "2.当数据来源董事反馈，可以暂时不填写截止时间	计划执行时间	执行总结，不影响业务流程",
            ]}
          />
        </div>
        {editStatus && allowCreate ? (
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
        dataSource={visibleTableData}
        rowKey="id"
        size="small"
        scroll={{ x: 2060 }}
        pagination={false}
      />

      {editStatus ? (
        <div className="assign-follow-footer">
          <Button onClick={handleDraftSave}>保存</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            提交
          </Button>
        </div>
      ) : null}

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
