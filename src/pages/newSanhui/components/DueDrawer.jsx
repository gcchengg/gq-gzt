import {
  AuditOutlined,
  CheckCircleOutlined,
  FileOutlined,
  FileDoneOutlined,
  FileSearchOutlined,
  FormOutlined,
  QuestionCircleOutlined,
  PoweroffOutlined,
  SafetyCertificateOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Button, DatePicker, Descriptions, Drawer, Empty, Form, Image, Input, InputNumber, Modal, Popconfirm, Radio, Select, Space, Switch, Table, Tabs, Tag, Tooltip, Upload, message } from "antd";
import dayjs from "dayjs";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import meetingGetListResponse from "../mock/data/submit/meetingGetList.json";
import removedFileReplaceTabImage from "../mock/data/companyReview/截屏2026-06-25 11.08.51.png";
import removedTopicReportTabImage from "../../截屏2026-06-25 13.34.13.png";
import SubmitDrawer from "./SubmitDrawer";
import TopicEvaluation from "./TopicEvaluation";
import CompanyReview from "./CompanyReview";
import VoteSuggest from "./VoteSuggest";
import Vote from "./Vote";
import DecisionExecution from "./DecisionExecution";
import "./DueDrawer.css";
import "./AssignDueDrawer.css";

const tabStatusMap = {
  12000: "1",
  13000: "1",
  14000: "2",
  15000: "3",
  16000: "4",
  17000: "6",
  18000: "6",
  19000: "7",
  20000: "7",
  99999: "8",
};

const showMeetingText = ["15000", "16000", "17000", "18000", "19000"];
const stageMeta = {
  1: { title: "议题提报", desc: "资料上传、AI提取、议题与会议确认", icon: FormOutlined },
  2: { title: "议题评估", desc: "材料批注、问答反馈、风险判断", icon: FileSearchOutlined },
  3: { title: "议题审核", desc: "联审意见、审批记录、附件校验", icon: AuditOutlined },
  4: { title: "表决建议", desc: "生成建议单、收集董事反馈", icon: FileDoneOutlined },
  6: { title: "三会表决", desc: "表决结果、会议决议、用印材料", icon: SafetyCertificateOutlined },
  7: { title: "决策执行", desc: "落实跟踪、执行反馈、闭环确认", icon: CheckCircleOutlined },
  8: { title: "结束", desc: "流程已结束", icon: PoweroffOutlined },
};
const phaseSteps = [
  { value: "1", text: "议题提报" },
  { value: "2", text: "议题评估" },
  { value: "3", text: "议题审核" },
  { value: "4", text: "表决建议" },
  { value: "6", text: "三会表决" },
  { value: "7", text: "决策执行" },
  { value: "8", text: "结束" },
];
const voteRecords = [
  {
    id: "vote-001",
    userName: "王明",
    voteTime: "2026-04-28",
    voteMethod: "100",
    fileList: [],
  },
  {
    id: "vote-002",
    userName: "李娜",
    voteTime: "2026-04-28",
    voteMethod: "200",
    fileList: [],
  },
];

const feedbackReferenceUrl = "/advice-review/6a2133fde4b0cb6abf664a41.pdf";
const initialFeedbackGroups = {
  topic: [
    {
      key: "zhang",
      name: "张总",
      topics: [
        {
          id: "topic-001",
          name: "关于推进基金退出事项的议案",
          files: [{ name: "基金退出方案补充材料.pdf", url: feedbackReferenceUrl }],
          records: [
            { id: "feedback-001", role: "leader", sender: "张总", time: "2026-04-24 09:18", content: "请补充基金退出方案中交易对手资信情况，以及本次退出对年度收益目标的影响测算。" },
            { id: "feedback-002", role: "manager", sender: "股权运营部 王明", time: "2026-04-24 10:06", content: "已收到，管户团队正在补充资信核查表和收益测算口径。" },
          ],
        },
        {
          id: "topic-002",
          name: "关于补充外部董事意见采纳情况的议案",
          files: [{ name: "外部董事意见采纳情况说明.pdf", url: feedbackReferenceUrl }],
          records: [
            { id: "feedback-003", role: "leader", sender: "张总", time: "2026-04-24 11:20", content: "请逐项标注外部董事意见是否采纳以及未采纳原因。" },
          ],
        },
      ],
    },
    {
      key: "li",
      name: "李董",
      topics: [
        {
          id: "topic-001",
          name: "关于推进基金退出事项的议案",
          files: [{ name: "交易协议法律意见.pdf", url: feedbackReferenceUrl }],
          records: [
            { id: "feedback-004", role: "leader", sender: "李董", time: "2026-04-24 14:32", content: "请同步说明是否涉及其他股东优先购买权，以及法律合规部是否已出具书面意见。" },
            { id: "feedback-005", role: "manager", sender: "法律合规部 李娜", time: "2026-04-24 15:11", content: "已核对章程及投资协议，不触发其他股东优先购买权。" },
          ],
        },
      ],
    },
  ],
  vote: [
    {
      key: "zhang",
      name: "张总",
      topics: [
        {
          id: "topic-001",
          name: "关于推进基金退出事项的议案",
          files: [{ name: "表决建议单-基金退出.pdf", url: feedbackReferenceUrl }],
          records: [
            { id: "vote-feedback-001", role: "leader", sender: "张总", time: "2026-04-25 09:42", content: "表决建议中请明确本次基金退出的表决倾向，并补充收益测算依据和风险兜底安排。" },
            { id: "vote-feedback-002", role: "manager", sender: "股权运营部 王明", time: "2026-04-25 10:18", content: "已收到，表决倾向拟调整为建议同意，并同步补充收益测算底稿。" },
          ],
        },
      ],
    },
    {
      key: "li",
      name: "李董",
      topics: [
        {
          id: "topic-002",
          name: "关于补充外部董事意见采纳情况的议案",
          files: [{ name: "表决建议单-董事意见采纳.pdf", url: feedbackReferenceUrl }],
          records: [
            { id: "vote-feedback-003", role: "leader", sender: "李董", time: "2026-04-25 14:05", content: "请在表决建议单中说明是否需要附带授权条件，避免后续执行口径不一致。" },
            { id: "vote-feedback-004", role: "manager", sender: "法律合规部 李娜", time: "2026-04-25 15:26", content: "已补充授权条件，协议签署文本需经法务复核后方可执行。" },
          ],
        },
      ],
    },
  ],
};

function FeedbackChat({ topic, draft, onDraftChange }) {
  return (
    <section className="assign-feedback-topic">
      <div className="assign-feedback-chat-head">
        <div>
          <h3>{topic.name}</h3>
          <p>按议题保留董事建议、参考文件和管户回复。</p>
        </div>
        <Tag color="processing">沟通中</Tag>
      </div>
      <div className="assign-feedback-files">
        <strong>议题文件</strong>
        {topic.files.map((file) => (
          <a href={file.url} target="_blank" rel="noreferrer" key={file.name}>
            <FileOutlined /> {file.name}
          </a>
        ))}
      </div>
      <div className="assign-feedback-chat-body">
        {topic.records.map((item) => (
          <div className={`assign-feedback-row ${item.role === "manager" ? "is-manager" : "is-leader"}`} key={item.id}>
            <div className="assign-feedback-meta">
              <span>{item.role === "manager" ? "管户回复" : "反馈建议"}</span>
              <strong>{item.sender}</strong>
              <em>{item.time}</em>
            </div>
            <div className="assign-feedback-bubble">{item.content}</div>
          </div>
        ))}
      </div>
      <div className="assign-feedback-reply">
        <Input.TextArea
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder="请输入对本议题的管户回复内容"
          autoSize={{ minRows: 3, maxRows: 5 }}
          maxLength={500}
          showCount
        />
      </div>
    </section>
  );
}

function DirectorFeedbackPanel({ type, directors, drafts, onDraftChange, onSend }) {
  return (
    <Tabs
      className="assign-director-tabs"
      defaultActiveKey={directors[0]?.key}
      items={directors.map((director) => ({
        key: director.key,
        label: director.name,
        children: (
          <div className="assign-feedback-panel">
            <div className="assign-feedback-chat">
              {director.topics.map((topic) => {
                const draftKey = `${type}-${director.key}-${topic.id}`;
                return (
                  <FeedbackChat
                    key={topic.id}
                    topic={topic}
                    draft={drafts[draftKey] || ""}
                    onDraftChange={(value) => onDraftChange(draftKey, value)}
                  />
                );
              })}
            </div>
            <div className="assign-feedback-panel-actions">
              <Button type="primary" onClick={() => onSend(type, director.key)}>
                发送管户回复
              </Button>
            </div>
          </div>
        ),
      }))}
    />
  );
}

function TabLabel({ active, disabled, stageKey, children }) {
  const Icon = stageMeta[stageKey]?.icon || FormOutlined;
  const reviewRemovedTip = stageKey === "3" ? (
    <div className="new-sanhui-review-remove-tip">
      <div className="new-sanhui-review-remove-title">Demo说明：已删除子tab【议题初审问答】</div>
      <img src="/new-sanhui-review-removed-question-tab.png" alt="已删除的议题初审问答子tab截图" />
      <div className="new-sanhui-review-remove-title">Demo说明：已删除文件替换tab页面</div>
      <img src={removedFileReplaceTabImage} alt="已删除的文件替换tab页面截图" />
    </div>
  ) : null;
  const voteRemovedTip = stageKey === "6" ? (
    <div className="new-sanhui-review-remove-tip">
      <div className="new-sanhui-review-remove-title">Demo说明：删除【专题汇报】</div>
      <img src={removedTopicReportTabImage} alt="已删除专题汇报tab页面截图" />
    </div>
  ) : null;
  const removedTip = reviewRemovedTip || voteRemovedTip;
  return (
    <div
      className={[
        "new-sanhui-tab-label",
        active ? "active" : "",
        disabled ? "disabled" : "",
      ].join(" ")}
    >
      <span className="new-sanhui-member-icon">
        <Icon />
      </span>
      <span className="new-sanhui-tab-text">
        <strong>
          {children}
          {removedTip ? (
            <Tooltip placement="bottom" title={removedTip} overlayClassName="new-sanhui-review-remove-tooltip">
              <QuestionCircleOutlined className="new-sanhui-tab-help-icon" onClick={(event) => event.stopPropagation()} />
            </Tooltip>
          ) : null}
        </strong>
        <small>{stageMeta[stageKey]?.desc}</small>
      </span>
    </div>
  );
}

const stepStateText = {
  finish: "已完成",
  process: "当前",
  wait: "未开始",
};

function StageHelpTip({ stageKey }) {
  const reviewRemovedTip = stageKey === "3" ? (
    <div className="new-sanhui-review-remove-tip">
      <div className="new-sanhui-review-remove-title">Demo说明：已删除子tab【议题初审问答】</div>
      <img src="/new-sanhui-review-removed-question-tab.png" alt="已删除的议题初审问答子tab截图" />
      <div className="new-sanhui-review-remove-title">Demo说明：已删除文件替换tab页面</div>
      <img src={removedFileReplaceTabImage} alt="已删除的文件替换tab页面截图" />
    </div>
  ) : null;
  const voteRemovedTip = stageKey === "6" ? (
    <div className="new-sanhui-review-remove-tip">
      <div className="new-sanhui-review-remove-title">Demo说明：删除【专题汇报】</div>
      <img src={removedTopicReportTabImage} alt="已删除专题汇报tab页面截图" />
    </div>
  ) : null;
  const title = reviewRemovedTip || voteRemovedTip;

  if (!title) return null;

  return (
    <Tooltip placement="bottom" title={title} overlayClassName="new-sanhui-review-remove-tooltip">
      <QuestionCircleOutlined className="new-sanhui-tab-help-icon" onClick={(event) => event.stopPropagation()} />
    </Tooltip>
  );
}

function StageStep({ item, state, active, disabled, onClick }) {
  const meta = stageMeta[item.value] || {};
  const Icon = meta.icon || FormOutlined;

  return (
    <button
      type="button"
      className={["new-sanhui-stage-step", state, active ? "active" : "", disabled ? "disabled" : ""].join(" ")}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="new-sanhui-stage-icon">
        <Icon />
      </span>
      <span className="new-sanhui-stage-copy">
        <span className="new-sanhui-stage-title">
          {item.text}
          <StageHelpTip stageKey={item.value} />
        </span>
        <span className="new-sanhui-stage-status">{stepStateText[state]}</span>
      </span>
    </button>
  );
}

function PlaceholderPanel({ title }) {
  return (
    <div className="new-sanhui-placeholder">
      <div className="new-sanhui-placeholder-title">{title}</div>
      <div className="new-sanhui-placeholder-desc">
        该模块会在后续迁移时替换为原项目完整内容；当前先保留一级流程、禁用逻辑和操作区布局。
      </div>
    </div>
  );
}

const meetingReviewOptions = [
  { label: "同意", value: "1" },
  { label: "反对", value: "0" },
  { label: "有条件同意", value: "2" },
  { label: "回避表决", value: "-1" },
];

const meetingUserOptions = [
  { label: "郑华峰", value: "zhenghuafeng" },
  { label: "王明", value: "wangming" },
  { label: "李娜", value: "lina" },
  { label: "耿姬", value: "gengji" },
  { label: "孔令娜", value: "konglingna" },
  { label: "张华", value: "zhanghua" },
];

const initialVoteAuthorizeList = [
  {
    key: "vote-auth-001",
    userId: "user-001",
    positionCategoryName: "董事",
    positionName: "董事长",
    shDelFlag: "1",
    userName: "郑华峰",
    ds_attendFlag: "1",
    ds_needRespFlag: "2",
    js_attendFlag: "0",
    js_needRespFlag: "1",
    gd_attendFlag: "1",
    gd_needRespFlag: "0",
    meetingDs: {
      attendFlag: "1",
      needRespFlag: "2",
      authorizeeId: "wangming",
      authorizeeName: "王明",
    },
    meetingJs: {
      attendFlag: "0",
      needRespFlag: "1",
    },
    meetingGd: {
      attendFlag: "1",
      needRespFlag: "0",
      authorizeeId: "lina",
      authorizeeName: "李娜",
    },
    DSfileList: [
      {
        uid: "ds-auth-001",
        name: "董事会表决授权书-郑华峰.pdf",
        status: "done",
        url: "/advice-review/6a2133fde4b0cb6abf664a41.pdf",
      },
    ],
    JSfileList: [],
    GDfileList: [],
  },
  {
    key: "vote-auth-002",
    userId: "user-002",
    positionCategoryName: "监事",
    positionName: "监事会主席",
    shDelFlag: "0",
    userName: "李娜",
    ds_attendFlag: "0",
    ds_needRespFlag: "1",
    js_attendFlag: "1",
    js_needRespFlag: "2",
    gd_attendFlag: "0",
    gd_needRespFlag: "1",
    meetingDs: {
      attendFlag: "0",
      needRespFlag: "1",
    },
    meetingJs: {
      attendFlag: "1",
      needRespFlag: "2",
      authorizeeId: "gengji",
      authorizeeName: "耿姬",
    },
    meetingGd: {
      attendFlag: "0",
      needRespFlag: "1",
    },
    DSfileList: [],
    JSfileList: [
      {
        uid: "js-auth-001",
        name: "监事会表决授权书-李娜.pdf",
        status: "done",
        url: "/advice-review/6a2133fde4b0cb6abf664a41.pdf",
      },
    ],
    GDfileList: [],
  },
  {
    key: "vote-auth-003",
    userId: "user-003",
    positionCategoryName: "股东代表",
    positionName: "股东代表",
    shDelFlag: "1",
    userName: "张华",
    ds_attendFlag: "1",
    ds_needRespFlag: "1",
    js_attendFlag: "0",
    js_needRespFlag: "1",
    gd_attendFlag: "1",
    gd_needRespFlag: "2",
    meetingDs: {
      attendFlag: "1",
      needRespFlag: "1",
    },
    meetingJs: {
      attendFlag: "0",
      needRespFlag: "1",
    },
    meetingGd: {
      attendFlag: "1",
      needRespFlag: "2",
      authorizeeId: "konglingna",
      authorizeeName: "孔令娜",
    },
    DSfileList: [],
    JSfileList: [],
    GDfileList: [
      {
        uid: "gd-auth-001",
        name: "股东会表决授权书-张华.pdf",
        status: "done",
        url: "/advice-review/6a2133fde4b0cb6abf664a41.pdf",
      },
    ],
  },
];

const voteAuthorizeMeetingMap = {
  MEETING_DS: { fileKey: "DSfileList", meetingKey: "meetingDs", disabledKey: "disabledDs" },
  MEETING_JS: { fileKey: "JSfileList", meetingKey: "meetingJs", disabledKey: "disabledJs" },
  MEETING_GD: { fileKey: "GDfileList", meetingKey: "meetingGd", disabledKey: "disabledGd" },
};

function cloneVoteAuthorizeRows() {
  return initialVoteAuthorizeList.map((item) => ({
    ...item,
    meetingDs: { ...item.meetingDs },
    meetingJs: { ...item.meetingJs },
    meetingGd: { ...item.meetingGd },
    DSfileList: item.DSfileList.map((file) => ({ ...file })),
    JSfileList: item.JSfileList.map((file) => ({ ...file })),
    GDfileList: item.GDfileList.map((file) => ({ ...file })),
  }));
}

function VoteAuthorizeUpload({ fileList = [], disabled, onChange }) {
  return (
    <Upload
      accept=".pdf"
      maxCount={1}
      disabled={disabled}
      fileList={fileList}
      beforeUpload={(file) => {
        const nextFile = {
          uid: file.uid,
          name: file.name,
          status: "done",
          url: URL.createObjectURL(file),
          fileName: file.name,
          fileUrl: URL.createObjectURL(file),
        };
        onChange([nextFile]);
        message.success("授权书已上传");
        return false;
      }}
      onRemove={() => {
        onChange([]);
        message.success("授权书已删除");
        return true;
      }}
    >
      <Button icon={<UploadOutlined />} size="small" disabled={disabled}>
        上传
      </Button>
    </Upload>
  );
}

function VoteAuthorizeSelect({ value, disabled, onChange }) {
  return (
    <Select
      allowClear
      showSearch
      className="vote-authorize-select"
      disabled={disabled}
      placeholder="请选择"
      options={meetingUserOptions}
      optionFilterProp="label"
      value={value}
      onChange={onChange}
    />
  );
}

function VoteAuthorizeDrawer({ open, onClose }) {
  const [dataSource, setDataSource] = useState(() => cloneVoteAuthorizeRows());

  useEffect(() => {
    if (open) {
      setDataSource(cloneVoteAuthorizeRows());
    }
  }, [open]);

  const updateRow = (rowKey, patch) => {
    setDataSource((current) => current.map((item) => (item.key === rowKey ? { ...item, ...patch } : item)));
  };

  const renderAttend = (value) => (value === "1" ? "✔️" : "-");
  const renderNeedResp = (value) => {
    if (!value) return "-";
    if (value === "0") return "未反馈";
    if (value === "1") return "不需要";
    if (value === "2") return "需要";
    return "-";
  };

  const buildMeetingColumns = (type, attendKey, needRespKey) => {
    const config = voteAuthorizeMeetingMap[type];
    return [
      {
        title: "参会人员",
        dataIndex: attendKey,
        width: 110,
        render: renderAttend,
      },
      {
        title: "授权是否反馈",
        dataIndex: needRespKey,
        width: 140,
        render: renderNeedResp,
      },
      {
        title: "授权书",
        dataIndex: config.fileKey,
        width: 180,
        render: (value = [], row) => (
          <VoteAuthorizeUpload
            disabled={row[config.disabledKey] === false}
            fileList={value}
            onChange={(nextFileList) => updateRow(row.key, { [config.fileKey]: nextFileList })}
          />
        ),
      },
      {
        title: "被授权人",
        dataIndex: `${type}_authorizee`,
        width: 180,
        render: (_, row) => (
          <VoteAuthorizeSelect
            disabled={row[config.disabledKey] === false}
            value={row[config.meetingKey]?.authorizeeId}
            onChange={(value, option) => {
              updateRow(row.key, {
                [config.meetingKey]: {
                  ...row[config.meetingKey],
                  authorizeeId: value,
                  authorizeeName: option?.label,
                },
              });
            }}
          />
        ),
      },
    ];
  };

  const columns = [
    {
      title: "序号",
      dataIndex: "index",
      width: 70,
      fixed: "left",
      render: (_, __, index) => index + 1,
    },
    { title: "职务分类", dataIndex: "positionCategoryName", width: 140, fixed: "left" },
    { title: "职务", dataIndex: "positionName", width: 150 },
    {
      title: "股东代表",
      dataIndex: "shDelFlag",
      width: 110,
      render: (value) => (value === "1" ? "✔️" : "-"),
    },
    { title: "任职人", dataIndex: "userName", width: 120 },
    { title: "董事会", children: buildMeetingColumns("MEETING_DS", "ds_attendFlag", "ds_needRespFlag") },
    { title: "监事会", children: buildMeetingColumns("MEETING_JS", "js_attendFlag", "js_needRespFlag") },
    { title: "股东会", children: buildMeetingColumns("MEETING_GD", "gd_attendFlag", "gd_needRespFlag") },
  ];

  return (
    <Drawer
      width="90%"
      title="表决授权"
      open={open}
      destroyOnClose
      onClose={onClose}
      className="vote-authorize-drawer"
    >
      <Table
        columns={columns}
        dataSource={dataSource}
        bordered
        scroll={{ x: 2000, y: 600 }}
        rowKey={(row) => row.key}
        pagination={false}
        size="small"
      />
    </Drawer>
  );
}

const meetingTopicSeed = [
  {
    id: "topic-001",
    topicId: "topic-001",
    topicName: "关于推进基金退出事项的议案",
    bodFlag: "1",
    bosFlag: "0",
    shFlag: "1",
    bodCond: "1",
    bosCond: undefined,
    shCond: "1",
  },
  {
    id: "topic-002",
    topicId: "topic-002",
    topicName: "关于补充外部董事意见采纳情况的议案",
    bodFlag: "1",
    bosFlag: "0",
    shFlag: "1",
    bodCond: "2",
    bosCond: undefined,
    shCond: "1",
  },
];

const initialMeetingTimeList = meetingGetListResponse.data
  .filter((item) => ["董事会", "监事会", "股东会"].includes(item.meetingTypeName))
  .map((item, index) => ({
    ...item,
    key: `${item.id || item.meetingType}-${item.meetingTypeName}-${index}`,
    enabled: ["董事会", "监事会"].includes(item.meetingTypeName),
    notifyDate: item.notifyDate ? dayjs(item.notifyDate) : null,
    launchTime: item.launchTime ? dayjs(item.launchTime) : null,
    launchType: Number(item.launchType || 1),
  }));

const meetingEnabledChangeTip = (
  <div>
    <div>如关闭/开启该会议：</div>
    <div>1.请确认每个议题的参会审议情况</div>
    <div>2.会影响议题材料传达对象参会人员是否可选</div>
  </div>
);

function MeetingTimeCard({ meeting, onChange, onEnabledChange }) {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(meeting);
  }, [form, meeting]);

  const handleEnabledChange = (checked) => {
    onEnabledChange(meeting, checked);
  };

  return (
    <div className="meeting-card">
      <div className="meeting-card-head">
        <div>
          <span className="meeting-card-mark" />
          <strong>{meeting.meetingTypeName}</strong>
        </div>
        <Space>
          <Switch
            checked={meeting.enabled}
            onChange={handleEnabledChange}
          />
          <span>召开</span>
        </Space>
      </div>
      <Form
        form={form}
        layout="vertical"
        disabled={!meeting.enabled}
        onValuesChange={(_, values) => onChange({ ...meeting, ...values })}
      >
        <Form.Item name="meetingName" label="会议名称" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="notifyDate" label="通知时间" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="launchType" label="召开方式" rules={[{ required: true }]}>
          <Radio.Group>
            <Radio value={1}>现场会议</Radio>
            <Radio value={2}>通讯表决</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="launchTime" label={meeting.launchType === 2 ? "表决日期" : "会议时间"} rules={[{ required: meeting.launchType !== 2 }]}>
          <DatePicker
            style={{ width: "100%" }}
            showTime={meeting.launchType !== 2 ? { format: "HH:mm" } : false}
            format={meeting.launchType !== 2 ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD"}
          />
        </Form.Item>
        <Form.Item name="location" label="会议地点">
          <Input />
        </Form.Item>
      </Form>
    </div>
  );
}

function MeetingTimeApprovalSteps() {
  const steps = [
    { role: "申请人", name: "杨佰君", time: "2026-04-28 09:30:12", state: "start" },
    { role: "总监", name: "黄国平", time: "待审批", state: "pending" },
    { role: "分管领导", name: "李秀柱", time: "待审批", state: "pending", muted: true },
  ];

  return (
    <div className="meeting-time-approval-panel">
      <div className="meeting-time-approval-title">当前审批状态</div>
      <div className="meeting-time-approval-list">
        {steps.map((step, index, list) => (
          <div
            className={`meeting-time-approval-item ${step.state === "approved" ? "is-approved" : "is-start"} ${step.muted ? "is-muted" : ""}`}
            key={`${step.role}-${step.name}`}
          >
            <div className="meeting-time-approval-rail">
              <span className="meeting-time-approval-dot">{step.state === "approved" ? "✓" : ""}</span>
              {index < list.length - 1 ? <span className="meeting-time-approval-line" /> : null}
            </div>
            <div className="meeting-time-approval-card">
              <div className="meeting-time-approval-card-head">
                <span className="meeting-time-approval-role">{step.role}</span>
                <span className="meeting-time-approval-name">{step.name}</span>
                {step.state === "approved" ? <span className="meeting-time-approval-status">审批通过</span> : null}
                {step.state === "pending" ? <span className="meeting-time-approval-status is-pending">待审批</span> : null}
              </div>
              <div className="meeting-time-approval-time">{step.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MeetingTimeManage({ onSave }) {
  const [meetings, setMeetings] = useState(initialMeetingTimeList);
  const [fileList, setFileList] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [pendingEnabledChange, setPendingEnabledChange] = useState(null);

  const updateMeeting = (nextMeeting) => {
    setMeetings((current) => current.map((item) => (item.key === nextMeeting.key ? nextMeeting : item)));
  };

  const confirmPendingEnabledChange = () => {
    if (pendingEnabledChange) {
      updateMeeting({ ...pendingEnabledChange.meeting, enabled: pendingEnabledChange.checked });
    }
    setPendingEnabledChange(null);
  };

  const handleSubmit = () => {
    if (!fileList.length) {
      message.error("请上传会议时间审批附件");
      return;
    }
    setSubmitted(true);
    onSave(meetings, fileList);
  };

  return (
    <div className="submit-section meeting-time-manage">
      {/* <div className="submit-prompt">
        <span className="submit-prompt-icon">AI</span>
        <span>请确认并维护会议时间、召开方式和会议地点。</span>
      </div> */}
      <div className="submit-panel">
        <div className="submit-panel-head">
          <div className="submit-panel-title">会议安排</div>
        </div>
        <div className="submit-panel-body">
          <div className="meeting-grid">
            {meetings.map((meeting) => (
              <MeetingTimeCard
                key={meeting.key}
                meeting={meeting}
                onEnabledChange={(nextMeeting, checked) => setPendingEnabledChange({ meeting: nextMeeting, checked })}
                onChange={updateMeeting}
              />
            ))}
          </div>
        </div>
      </div>
      <Modal
        title={pendingEnabledChange?.checked ? "确认开启该会议？" : "确认关闭该会议？"}
        open={Boolean(pendingEnabledChange)}
        onOk={confirmPendingEnabledChange}
        onCancel={() => setPendingEnabledChange(null)}
        okText="确认"
        cancelText="取消"
        zIndex={2200}
      >
        {meetingEnabledChangeTip}
      </Modal>
      <div className="submit-panel meeting-time-upload-panel">
        <div className="submit-panel-head">
          <div className="submit-panel-title">
            会议时间审批附件<span className="meeting-time-required">*</span>
          </div>
        </div>
        <div className="submit-panel-body">
          <Upload
            fileList={fileList}
            beforeUpload={() => false}
            onChange={({ fileList: nextFileList }) => setFileList(nextFileList)}
          >
            <Button icon={<UploadOutlined />}>上传文件</Button>
          </Upload>
        </div>
      </div>
      {submitted ? <MeetingTimeApprovalSteps /> : null}
      <div className="submit-footer meeting-time-footer">
        <span className="submit-footer-hint">提交后将发起会议时间审批流程</span>
        <Popconfirm title="是否确认提交？" okText="确认提交" cancelText="取消" onConfirm={handleSubmit}>
          <Button type="primary">
            提交
          </Button>
        </Popconfirm>
      </div>
    </div>
  );
}

function GeneralOfficeMeeting({ canEdit = false }) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([
    {
      uid: "general-minutes-001",
      name: "总办会会议纪要.pdf",
      status: "done",
      url: "/advice-review/6a2133fde4b0cb6abf664a41.pdf",
    },
  ]);

  return (
    <div className="meeting-minutes-wrap">
      <div className="meeting-minutes-title">总办会会议纪要</div>
      <Form
        form={form}
        layout="vertical"
        disabled={!canEdit}
        initialValues={{
          zbhLaunchDate: dayjs("2026-04-28"),
          zbhIssueNo: 4,
        }}
      >
        <div className="meeting-minutes-form-grid">
          <Form.Item label="总办会召开日" name="zbhLaunchDate" rules={[{ required: true, message: "请选择日期" }]}>
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="期数" name="zbhIssueNo">
            <InputNumber min={1} precision={0} placeholder="请输入期数" style={{ width: "100%" }} />
          </Form.Item>
        </div>
      </Form>
      <Upload
        accept=".pdf"
        disabled={!canEdit}
        fileList={fileList}
        beforeUpload={(file) => {
          setFileList([
            {
              uid: file.uid,
              name: file.name,
              status: "done",
              url: URL.createObjectURL(file),
              fileName: file.name,
              fileUrl: URL.createObjectURL(file),
            },
          ]);
          return false;
        }}
        onRemove={() => setFileList([])}
        maxCount={1}
      >
        <Button disabled={!canEdit} icon={<UploadOutlined />}>上传会议纪要</Button>
      </Upload>
      <div className="meeting-minutes-tip">支持扩展名：.pdf</div>
    </div>
  );
}

const TopicReviewMeeting = forwardRef(function TopicReviewMeeting(
  { mgmtId, reviewLevel, saveId, canEdit = false, title },
  ref,
) {
  const [form] = Form.useForm();
  const [topicList, setTopicList] = useState(meetingTopicSeed);

  useEffect(() => {
    form.setFieldsValue({
      launchDate: dayjs("2026-04-28"),
      location: "一汽股权会议室",
      hostUserId: "zhenghuafeng",
      noteUserId: "konglingna",
      cxrList: ["wangming", "lina"],
      lxrList: ["gengji"],
      rptUserId: "zhanghua",
      meetingReq: "请各责任部门按照会议意见完善材料并跟踪落实。",
    });
  }, [form, mgmtId, reviewLevel]);

  useImperativeHandle(ref, () => ({
    getSaveData: () => {
      const values = form.getFieldsValue();
      const findLabel = (value) => meetingUserOptions.find((item) => item.value === value)?.label || "";
      const mapUsers = (list = [], userType) =>
        list.map((value) => ({ userType, userId: value, userName: findLabel(value) })).filter((item) => item.userId);

      return {
        id: saveId,
        sanhuiMgmtId: mgmtId,
        reviewLevel,
        ...values,
        launchDate: values.launchDate ? dayjs(values.launchDate).format("YYYY-MM-DD") : null,
        hostUserName: findLabel(values.hostUserId),
        noteUserName: findLabel(values.noteUserId),
        rptUserName: findLabel(values.rptUserId),
        cxrList: mapUsers(values.cxrList, "100"),
        lxrList: mapUsers(values.lxrList, "200"),
        topicList,
      };
    },
  }));

  const updateTopic = (recordKey, field, value, recordIndex) => {
    setTopicList((list) =>
      list.map((item, index) => {
        const key = item.topicId || item.id || index;
        return key === recordKey || index === recordIndex ? { ...item, [field]: value } : item;
      }),
    );
  };

  const renderResultSelect = (record, fieldKey, index) => {
    const enabled = {
      bodCond: record.bodFlag === "1",
      bosCond: record.bosFlag === "1",
      shCond: record.shFlag === "1",
    }[fieldKey];

    if (!enabled) return <span>--</span>;

    const key = record.topicId || record.id;
    return (
      <Select
        allowClear
        showSearch
        disabled={!canEdit}
        optionFilterProp="label"
        value={record[fieldKey]}
        options={meetingReviewOptions}
        onChange={(value) => updateTopic(key, fieldKey, value, index)}
      />
    );
  };

  const columns = [
    { title: "序号", dataIndex: "index", width: 64, render: (_value, _record, index) => index + 1 },
    { title: "议案名称", dataIndex: "topicName", width: 240 },
    { title: "董事会审议", dataIndex: "bodCond", width: 160, render: (_value, record, index) => renderResultSelect(record, "bodCond", index) },
    { title: "监事会审议", dataIndex: "bosCond", width: 160, render: (_value, record, index) => renderResultSelect(record, "bosCond", index) },
    { title: "股东会审议", dataIndex: "shCond", width: 160, render: (_value, record, index) => renderResultSelect(record, "shCond", index) },
  ];

  return (
    <div className="meeting-minutes-wrap">
      <div className="meeting-minutes-title">{title}</div>
      <Form layout="vertical" form={form}>
        <div className="meeting-minutes-form-grid">
          <Form.Item label="会议时间" name="launchDate">
            <DatePicker style={{ width: "100%" }} disabled={!canEdit} />
          </Form.Item>
          <Form.Item label="会议地点" name="location">
            <Input placeholder="请输入" disabled={!canEdit} />
          </Form.Item>
          <Form.Item label="会议主持" name="hostUserId">
            <Select options={meetingUserOptions} disabled={!canEdit} />
          </Form.Item>
          <Form.Item label="会议记录" name="noteUserId">
            <Select options={meetingUserOptions} disabled={!canEdit} />
          </Form.Item>
          <Form.Item label="出席" name="cxrList" className="meeting-minutes-full-row">
            <Select mode="multiple" options={meetingUserOptions} disabled={!canEdit} />
          </Form.Item>
          <Form.Item label="列席" name="lxrList" className="meeting-minutes-full-row">
            <Select mode="multiple" options={meetingUserOptions} disabled={!canEdit} />
          </Form.Item>
          <Form.Item label="汇报人" name="rptUserId">
            <Select options={meetingUserOptions} disabled={!canEdit} />
          </Form.Item>
        </div>
        <div className="meeting-minutes-table-section">
          <div className="meeting-minutes-section-title">议题主要内容及讨论意见</div>
          <Table
            rowKey={(record, index) => record.topicId || record.id || index}
            columns={columns}
            dataSource={topicList}
            pagination={false}
            scroll={{ y: 300, x: 860 }}
          />
        </div>
        <Form.Item label="会议要求" name="meetingReq">
          <Input.TextArea rows={4} placeholder="请输入" disabled={!canEdit} />
        </Form.Item>
      </Form>
    </div>
  );
});

export default function DueDrawer({
  id,
  editStatus,
  progStatus,
  dutyUserName,
  record,
  onCloseDetail,
  reviewInitialTab,
  smartSetID,
  setCompanyInfo,
}) {
  const [projectData, setProjectData] = useState(record || {});
  const [currentStep, setCurrentStep] = useState("12000");
  const [initStep, setInitStep] = useState("12000");
  const [firstActiveKey, setFirstActiveKey] = useState("1");
  const [voteVisible, setVoteVisible] = useState(false);
  const [sealVisible, setSealVisible] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [meetingDrawerOpen, setMeetingDrawerOpen] = useState(false);
  const [meetingTimeDrawerOpen, setMeetingTimeDrawerOpen] = useState(false);
  const [meetingActiveKey, setMeetingActiveKey] = useState("1");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackGroups, setFeedbackGroups] = useState(initialFeedbackGroups);
  const [feedbackDrafts, setFeedbackDrafts] = useState({});
  const [loading, setLoading] = useState(false);
  const [meetingSaveId, setMeetingSaveId] = useState("");
  const viceMeetingRef = useRef(null);
  const directorMeetingRef = useRef(null);

  useEffect(() => {
    setProjectData(record || {});
    setCompanyInfo?.(record || {});
  }, [record, setCompanyInfo]);

  useEffect(() => {
    if (progStatus) {
      const stepStatus = String(progStatus);
      setCurrentStep(stepStatus);
      setInitStep(stepStatus);
      setFirstActiveKey(tabStatusMap[String(progStatus)] || "1");
    }
  }, [progStatus]);

  const isTabDisabled = (key) => {
    const statusNumber = parseInt(progStatus);
    const tabKey = parseInt(key);
    return (
      tabKey === 8 ||
      ((statusNumber === 12000 || statusNumber === 13000) && tabKey >= 2) ||
      (statusNumber === 14000 && tabKey >= 3) ||
      (statusNumber === 15000 && tabKey >= 4) ||
      (statusNumber === 16000 && tabKey >= 5) ||
      (statusNumber === 17000 && tabKey >= 7) ||
      (statusNumber === 18000 && tabKey >= 7)
    );
  };

  const isMeetingAvailable = showMeetingText.includes(String(progStatus));
  const visibleCurrentStep = currentStep === "12000" ? "13000" : currentStep;
  const progressPhaseKey = tabStatusMap[visibleCurrentStep] || "1";
  const currentStepIndex = Math.max(0, phaseSteps.findIndex((item) => item.value === progressPhaseKey));
  const progressPercent =
    phaseSteps.length > 1 ? Math.round((currentStepIndex / (phaseSteps.length - 1)) * 100) : 0;
  const getPhaseStatus = (tabKey) => {
    if (isTabDisabled(tabKey)) {
      return "wait";
    }
    if (tabKey === progressPhaseKey) {
      return "process";
    }
    return "finish";
  };
  const canEditMeetingMinutes = editStatus === "edit";
  const showMeetingSave = canEditMeetingMinutes && (meetingActiveKey === "1" || meetingActiveKey === "2" || meetingActiveKey === "3");
  const meetingTabItems = [
    {
      key: "1",
      label: "总办会",
      children: <GeneralOfficeMeeting canEdit={canEditMeetingMinutes} />,
    },
    {
      key: "2",
      label: "向分管副总汇报专题会",
      children: (
        <TopicReviewMeeting
          ref={viceMeetingRef}
          mgmtId={id}
          reviewLevel="200"
          saveId={meetingSaveId}
          canEdit={canEditMeetingMinutes}
          title="向分管副总汇报专题会"
        />
      ),
    },
    {
      key: "3",
      label: "向总监汇报专题会",
      children: (
        <TopicReviewMeeting
          ref={directorMeetingRef}
          mgmtId={id}
          reviewLevel="100"
          saveId={meetingSaveId}
          canEdit={canEditMeetingMinutes}
          title="向总监汇报专题会"
        />
      ),
    },
  ];

  const items = useMemo(
    () => [
      {
        label: (
          <TabLabel active={firstActiveKey === "1"} disabled={false} stageKey="1">
            议题提报
          </TabLabel>
        ),
        key: "1",
        children: (
          <SubmitDrawer
            projectData={projectData}
            smartSetID={smartSetID}
            id={id}
            editStatus={editStatus === "edit" && (progStatus === "12000" || progStatus === "13000") ? "edit" : "detail"}
            ifInitSubmit={false}
            close={onCloseDetail}
            type="canGuNO"
            progStatus={progStatus}
            dutyUserName={dutyUserName}
          />
        ),
      },
      {
        label: (
          <TabLabel active={firstActiveKey === "2"} disabled={isTabDisabled("2")} stageKey="2">
            议题评估
          </TabLabel>
        ),
        key: "2",
        disabled: isTabDisabled("2"),
        children: <TopicEvaluation projectData={projectData} onClose={onCloseDetail} />,
      },
      {
        label: (
          <TabLabel active={firstActiveKey === "3"} disabled={isTabDisabled("3")} stageKey="3">
            议题审核
          </TabLabel>
        ),
        key: "3",
        disabled: isTabDisabled("3"),
        children: (
          <CompanyReview
            projectId={id}
            projectData={projectData}
            isEdit={editStatus !== "detail"}
            initialActiveKey={reviewInitialTab}
            onClosed={onCloseDetail}
          />
        ),
      },
      {
        label: (
          <TabLabel active={firstActiveKey === "4"} disabled={isTabDisabled("4")} stageKey="4">
            <span className="new-sanhui-tab-title-with-help">
              表决建议
              <Tooltip title="1.向董事会发起的建议/向监事会发起的建议/向股东会发起的建议，改成以议题为维度">
                <QuestionCircleOutlined
                  className="new-sanhui-tab-help-icon"
                  onClick={(event) => event.stopPropagation()}
                />
              </Tooltip>
            </span>
          </TabLabel>
        ),
        key: "4",
        disabled: isTabDisabled("4"),
        children: (
          <VoteSuggest
            id={id}
            editStatus={editStatus === "edit" && progStatus === "16000" ? "edit" : "detail"}
          />
        ),
      },
      {
        label: (
          <TabLabel active={firstActiveKey === "6"} disabled={isTabDisabled("6")} stageKey="6">
            三会表决
          </TabLabel>
        ),
        key: "6",
        disabled: isTabDisabled("6"),
        children: (
          <Vote
            id={id}
            onCloseDetail={onCloseDetail}
            editStatus={editStatus === "edit" && progStatus === "18000" ? "edit" : "detail"}
          />
        ),
      },
      {
        label: (
          <TabLabel active={firstActiveKey === "7"} disabled={isTabDisabled("7")} stageKey="7">
            <span className="new-sanhui-tab-title-with-help">
              决策执行
              <Tooltip title={<div><div>1.删除 董事会会议决议/监事会会议决议/股东会会议决议 完整版文件上传功能</div><div>2.删除 会议纪要上传功能</div></div>}>
                <QuestionCircleOutlined
                  className="new-sanhui-tab-help-icon"
                  onClick={(event) => event.stopPropagation()}
                />
              </Tooltip>
            </span>
          </TabLabel>
        ),
        key: "7",
        disabled: isTabDisabled("7"),
        children: (
          <DecisionExecution
            id={id}
            record={projectData}
            editStatus={editStatus === "edit" && (progStatus === "19000" || progStatus === "20000")}
          />
        ),
      },
      {
        label: (
          <TabLabel active={firstActiveKey === "8"} disabled={false} stageKey="8">
            结束
          </TabLabel>
        ),
        key: "8",
        children: <PlaceholderPanel title="流程已结束" />,
      },
    ],
    [firstActiveKey, projectData, id, editStatus, progStatus, dutyUserName]
  );

  const handleMeetingSave = () => {
    if (meetingActiveKey === "1") {
      message.success("总办会会议纪要信息已保存");
      return;
    }
    const ref = meetingActiveKey === "2" ? viceMeetingRef.current : meetingActiveKey === "3" ? directorMeetingRef.current : null;
    const payload = ref?.getSaveData?.();
    if (!payload) {
      message.warning("暂无可保存内容");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMeetingSaveId(payload.id || `meeting-save-${Date.now()}`);
      message.success("保存成功");
    }, 200);
  };

  const handleMeetingDownload = () => {
    message.success("已触发合并下载纪要");
  };

  const handleMeetingTimeSave = () => {
    message.success("会议时间提交成功，已发起审批");
  };

  const updateFeedbackDraft = (key, value) => {
    setFeedbackDrafts((current) => ({ ...current, [key]: value }));
  };

  const sendFeedbackReply = (type, directorKey) => {
    const director = feedbackGroups[type].find((item) => item.key === directorKey);
    const replies = director?.topics
      .map((topic) => {
        const draftKey = `${type}-${directorKey}-${topic.id}`;
        return { topicId: topic.id, draftKey, content: feedbackDrafts[draftKey]?.trim() };
      })
      .filter((item) => item.content) || [];

    if (!replies.length) {
      message.warning("请输入管户回复内容");
      return;
    }

    const sentAt = dayjs().format("YYYY-MM-DD HH:mm");

    setFeedbackGroups((current) => ({
      ...current,
      [type]: current[type].map((directorItem) => directorItem.key === directorKey ? {
        ...directorItem,
        topics: directorItem.topics.map((topic) => {
          const reply = replies.find((item) => item.topicId === topic.id);
          return reply ? {
            ...topic,
            records: [
              ...topic.records,
              {
                id: `${reply.draftKey}-feedback-${Date.now()}`,
                role: "manager",
                sender: "管户 王明",
                time: sentAt,
                content: reply.content,
              },
            ],
          } : topic;
        }),
      } : directorItem),
    }));

    setFeedbackDrafts((current) => {
      const nextDrafts = { ...current };
      replies.forEach((reply) => {
        nextDrafts[reply.draftKey] = "";
      });
      return nextDrafts;
    });

    message.success(`已发送 ${replies.length} 条管户回复`);
  };

  return (
    <div className="new-sanhui-due">
      <div className="new-sanhui-due-left">
        <div className="new-sanhui-step-card">
          <div
            className="new-sanhui-stage-rail"
            aria-label="三会流程进度"
            style={{ "--stage-progress": `${progressPercent}%` }}
          >
            {phaseSteps.map((item) => {
              const state = getPhaseStatus(item.value);
              const disabled = isTabDisabled(item.value);

              return (
                <StageStep
                  key={item.value}
                  item={item}
                  state={state}
                  active={item.value === firstActiveKey}
                  disabled={disabled}
                  onClick={() => setFirstActiveKey(item.value)}
                />
              );
            })}
          </div>
        </div>
        <div className="new-sanhui-project-tabs">
          {firstActiveKey !== "1" && firstActiveKey !== "8" && (
            <div className="new-sanhui-button-group">
              <Button type="primary" onClick={() => setFeedbackOpen(true)}>
                董事反馈记录
              </Button>
       
                <Button
                  type="primary"
                  onClick={() => {
                    setMeetingDrawerOpen(true);
                    if (meetingTabItems.length > 0) {
                      setMeetingActiveKey(meetingTabItems[0].key);
                    }
                  }}
                >
                  <span className="new-sanhui-action-title-with-help">
                    一汽股权会议纪要
                    <Tooltip title="1.从议题评估阶段开始，并且从任务进入和上总办会才能显示 2.可以修改召开时间和期数">
                      <QuestionCircleOutlined
                        className="new-sanhui-action-help-icon"
                        onClick={(event) => event.stopPropagation()}
                      />
                    </Tooltip>
                  </span>
                </Button>
                <Button type="primary" onClick={() => setMeetingTimeDrawerOpen(true)}>
                  <span className="new-sanhui-action-title-with-help">
                    修改会议信息
                    <Tooltip title={<div><div>1.审批层级到 科室经理</div><div>2.只有修改会议时间的时候才发起审批</div></div>}>
                      <QuestionCircleOutlined
                        className="new-sanhui-action-help-icon"
                        onClick={(event) => event.stopPropagation()}
                      />
                    </Tooltip>
                  </span>
                </Button>
          
              {Number(progStatus) > 14000 && (
                <Button type="primary" onClick={() => setDrawerOpen(true)}>
                  投票结果
                </Button>
              )}
              <Button type="primary" onClick={() => setVoteVisible(true)}>
                <span className="new-sanhui-action-title-with-help">
                  表决授权
                  <Tooltip title="1.自动生成上传文件">
                    <QuestionCircleOutlined
                      className="new-sanhui-action-help-icon"
                      onClick={(event) => event.stopPropagation()}
                    />
                  </Tooltip>
                </span>
              </Button>
              <Button type="primary" onClick={() => setSealVisible(true)}>
                用印申请
              </Button>
            </div>
          )}
          <Tabs className="new-sanhui-stage-content-tabs" activeKey={firstActiveKey} items={items} />
        </div>
      </div>

      {voteVisible && <VoteAuthorizeDrawer open={voteVisible} onClose={() => setVoteVisible(false)} />}

      <Drawer title="用印申请" open={sealVisible} width={920} onClose={() => setSealVisible(false)} destroyOnClose>
        <PlaceholderPanel title="用印申请" />
      </Drawer>

      <Drawer title="董事反馈记录" open={feedbackOpen} width={760} onClose={() => setFeedbackOpen(false)} destroyOnClose>
        <Tabs
          className="assign-feedback-tabs"
          defaultActiveKey="topic"
          items={[
            {
              key: "topic",
              label: "董事意见反馈",
              children: (
                <DirectorFeedbackPanel
                  type="topic"
                  directors={feedbackGroups.topic}
                  drafts={feedbackDrafts}
                  onDraftChange={updateFeedbackDraft}
                  onSend={sendFeedbackReply}
                />
              ),
            },
            {
              key: "vote",
              label: "三会情况反馈",
              children: (
                <DirectorFeedbackPanel
                  type="vote"
                  directors={feedbackGroups.vote}
                  drafts={feedbackDrafts}
                  onDraftChange={updateFeedbackDraft}
                  onSend={sendFeedbackReply}
                />
              ),
            },
          ]}
        />
      </Drawer>

      <Drawer title="议题投票" open={drawerOpen} width={720} onClose={() => setDrawerOpen(false)} destroyOnClose>
        <div className="new-sanhui-drawer-body">
          {voteRecords.length > 0 ? (
            voteRecords.map((item) => (
              <div className="new-sanhui-vote-item" key={item.id}>
                <Descriptions bordered size="middle" column={1} labelStyle={{ width: 160 }}>
                  <Descriptions.Item label="投票人">{item.userName}</Descriptions.Item>
                  <Descriptions.Item label="计划投票日">
                    {item.voteTime ? dayjs(item.voteTime).format("YYYY-MM-DD") : ""}
                  </Descriptions.Item>
                  <Descriptions.Item label="投票方式">
                    {item.voteMethod === "100" ? "现场表决" : "网络投票"}
                  </Descriptions.Item>
                </Descriptions>
                {item.fileList?.map((file) => (
                  <Image key={file.fileUrl} src={file.fileUrl} alt={file.fileName} width={520} />
                ))}
              </div>
            ))
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="尚未有投票数据" />
          )}
        </div>
      </Drawer>

      <Drawer
        title="一汽股权会议纪要"
        open={meetingDrawerOpen}
        width={760}
        onClose={() => setMeetingDrawerOpen(false)}
        destroyOnClose
        footer={
          <div className="new-sanhui-meeting-footer">
            {showMeetingSave && (
              <Button type="primary" loading={loading} onClick={handleMeetingSave}>
                保存
              </Button>
            )}
            <Button onClick={handleMeetingDownload}>合并下载纪要</Button>
          </div>
        }
      >
        <Tabs activeKey={meetingActiveKey} onChange={(key) => setMeetingActiveKey(key)} items={meetingTabItems} />
      </Drawer>

      <Drawer
        title="会议时间"
        open={meetingTimeDrawerOpen}
        width={980}
        onClose={() => setMeetingTimeDrawerOpen(false)}
        destroyOnClose
      >
        <MeetingTimeManage onSave={handleMeetingTimeSave} />
      </Drawer>
    </div>
  );
}
