import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Form,
  Input,
  Radio,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Upload,
  message,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SubmitDrawer.css";
const topicFileTypes = [
  { value: "100", label: "会议通知" },
  { value: "200", label: "议题相关" },
  { value: "300", label: "议题目录" },
  { value: "400", label: "补充材料" },
];
const reviewLevelOptions = [
  { value: "400", label: "业务总监" },
  { value: "100", label: "董事会" },
  { value: "200", label: "股东会" },
  { value: "300", label: "集团总办会" },
];
const categoryOptions = {
  lv1: [
    { value: "operation", label: "1. 经营类" },
    { value: "fund", label: "基金管理" },
    { value: "asset", label: "资产处置" },
    { value: "governance", label: "公司治理" },
  ],
  lv2: [
    { value: "regular-report", label: "1.3 定期监管报告" },
    { value: "exit", label: "基金退出" },
    { value: "transfer", label: "股权转让" },
    { value: "board", label: "董事会事项" },
  ],
  lv3: [
    {
      value: "regulatory-report",
      label:
        "1.3.1 按国家部委等上级机构监管要求定期报告事项（含反洗钱、反欺诈、重大风险评估、绩效追索扣回、离任审计、内部控制等）",
    },
    { value: "decision", label: "退出决策" },
    { value: "review", label: "方案审议" },
    { value: "execute", label: "决策执行" },
  ],
};
const promptText = {
  smart: "请上传提报文档，AI 将会提取信息并自动创建议题以及会议数据。",
  topic:
    "AI 从提报的文档中提取并创建了以下议题，请确认并补充遗漏或修改错误的议题信息。",
  meeting:
    "AI 从提报的文档中提取并创建了以下会议，请确认并补充遗漏或修改错误的会议信息。",
  distribution:
    "请确认议题资料传达对象，并根据会议类型勾选参会人员和传达范围。",
};
const initialSmartFiles = [
  {
    id: "smart-001",
    fileName: "2026年第4次董事会会议通知.pdf",
    fileCategory: "100",
    aiAnalysisStatus: "1",
    aiAnalysisResult: "已提取到 1 个会议信息",
  },
  {
    id: "smart-002",
    fileName: "基金退出决策议题目录.xlsx",
    fileCategory: "300",
    aiAnalysisStatus: "1",
    aiAnalysisResult: "已提取到关键信息并创建了 2 个议题",
  },
  {
    id: "smart-003",
    fileName: "基金退出方案补充材料.pdf",
    fileCategory: "200",
    aiAnalysisStatus: "1",
    aiAnalysisResult: "已通过议题目录文件提取议题，本文件不解析",
  },
];
const initialTopics = [
  {
    id: "topic-001",
    categoryLv1Name: "1. 经营类",
    categoryLv2Name: "1.3 定期监管报告",
    categoryLv3Name:
      "1.3.1 按国家部委等上级机构监管要求定期报告事项（含反洗钱、反欺诈、重大风险评估、绩效追索扣回、离任审计、内部控制等）",
    toipcName: "年度财务决算报告",
    reviewLevel2: "业务总监",
    board: true,
    supervisor: false,
    shareholder: false,
  },
  {
    id: "topic-002",
    categoryLv1Name: "1. 经营类",
    categoryLv2Name: "1.3 定期监管报告",
    categoryLv3Name:
      "1.3.1 按国家部委等上级机构监管要求定期报告事项（含反洗钱、反欺诈、重大风险评估、绩效追索扣回、离任审计、内部控制等）",
    toipcName: "年度财务决算报告",
    reviewLevel2: "业务总监",
    board: true,
    supervisor: false,
    shareholder: false,
  },
];
const initialMeetings = [
  {
    key: "board",
    title: "董事会",
    meetingName: "一汽股权投资 2026 年第 4 次董事会",
    notifyDate: dayjs("2026-04-22"),
    launchType: 1,
    launchTime: dayjs("2026-04-28 09:30"),
    location: "总部会议中心 301",
    enabled: true,
  },
  {
    key: "supervisor",
    title: "监事会",
    meetingName: "一汽股权投资 2026 年第 2 次监事会",
    notifyDate: dayjs("2026-04-22"),
    launchType: 2,
    launchTime: dayjs("2026-04-29 00:00"),
    location: "线上通讯表决",
    enabled: true,
  },
  {
    key: "shareholder",
    title: "股东会",
    meetingName: "一汽股权投资 2026 年第 3 次股东会",
    notifyDate: dayjs("2026-04-23"),
    launchType: 1,
    launchTime: dayjs("2026-04-30 14:00"),
    location: "总部会议中心 305",
    enabled: true,
  },
];
const initialDistribution = [
  {
    id: "person-001",
    positionCategory: "董事",
    positionCode: "外部董事",
    shDelFlag: "否",
    userName: "王明",
    attendeeVos100: true,
    attendeeVos200: false,
    attendeeVos300: true,
    topicNotifyFlag: "是",
    hasConvey: true,
  },
  {
    id: "person-002",
    positionCategory: "监事",
    positionCode: "监事会主席",
    shDelFlag: "否",
    userName: "李娜",
    attendeeVos100: false,
    attendeeVos200: true,
    attendeeVos300: false,
    topicNotifyFlag: "否",
    hasConvey: true,
  },
  {
    id: "person-003",
    positionCategory: "股东代表",
    positionCode: "股东代表",
    shDelFlag: "是",
    userName: "赵鹏",
    attendeeVos100: false,
    attendeeVos200: false,
    attendeeVos300: true,
    topicNotifyFlag: "是",
    hasConvey: true,
  },
];
const reviewerUserOptions = [
  { label: "王明", value: "wangming" },
  { label: "李娜", value: "lina" },
  { label: "赵鹏", value: "zhaopeng" },
  { label: "周静", value: "zhoujing" },
  { label: "刘洋", value: "liuyang" },
  { label: "陈晨", value: "chenchen" },
];
const initialReviewerNotifyList = [
  {
    id: "reviewer-001",
    orgName: "财务管理部",
    hasJoin: true,
    isDisabled: false,
    userList: [
      { fullName: "王明", loginId: "wangming" },
      { fullName: "李娜", loginId: "lina" },
    ],
  },
  {
    id: "reviewer-002",
    orgName: "法律合规部",
    hasJoin: true,
    isDisabled: false,
    userList: [{ fullName: "赵鹏", loginId: "zhaopeng" }],
  },
  {
    id: "reviewer-003",
    orgName: "战略投资部",
    hasJoin: false,
    isDisabled: false,
    userList: [],
  },
  {
    id: "reviewer-004",
    orgName: "审计风控部",
    hasJoin: true,
    isDisabled: false,
    userList: [{ fullName: "周静", loginId: "zhoujing" }],
  },
  {
    id: "reviewer-005",
    orgName: "运营管理部",
    hasJoin: false,
    isDisabled: true,
    userList: [],
  },
];
function Prompt({ type }) {
  return (
    <div className="submit-prompt">
      <span className="submit-prompt-icon">AI</span>
      <span>{promptText[type]}</span>
    </div>
  );
}
function SmartSubmit({ disabled, onNext }) {
  const [files, setFiles] = useState(initialSmartFiles);
  const columns = [
    {
      title: "序号",
      width: 64,
      render: (_value, _row, index) => index + 1,
    },
    {
      title: "文件名",
      dataIndex: "fileName",
      width: 260,
      render: (value) => <a href="#">{value}</a>,
    },
    {
      title: "文件分类",
      dataIndex: "fileCategory",
      width: 180,
      render: (value, record) => (
        <Select
          disabled={disabled}
          value={value}
          style={{ width: "100%" }}
          options={topicFileTypes}
          onChange={(nextValue) => {
            setFiles((current) =>
              current.map((item) =>
                item.id === record.id
                  ? {
                      ...item,
                      fileCategory: nextValue,
                      aiAnalysisResult:
                        nextValue === "100"
                          ? "已提取到 1 个会议信息"
                          : nextValue === "300"
                            ? "已提取到关键信息并创建了 2 个议题"
                            : "已通过议题目录文件提取议题，本文件不解析",
                    }
                  : item,
              ),
            );
          }}
        />
      ),
    },
    {
      title: "AI处理状态",
      dataIndex: "aiAnalysisStatus",
      width: 130,
      render: (value) => (
        <Tag color={value === "1" ? "success" : "error"}>
          {value === "1" ? "解析完成" : "解析失败"}
        </Tag>
      ),
    },
    {
      title: "AI提取结果",
      dataIndex: "aiAnalysisResult",
      ellipsis: true,
    },
    {
      title: "操作",
      width: 90,
      render: (_value, record) =>
        disabled ? null : (
          <Button
            type="link"
            danger
            onClick={() =>
              setFiles((current) =>
                current.filter((item) => item.id !== record.id),
              )
            }
          >
            删除
          </Button>
        ),
    },
  ];
  return (
    <div className="submit-section">
      <Prompt type="smart" />
      <Upload.Dragger
        disabled={disabled}
        multiple={false}
        showUploadList={false}
        beforeUpload={(file) => {
          const newFile = {
            id: `smart-${Date.now()}`,
            fileName: file.name,
            fileCategory: file.name.includes("通知") ? "100" : "200",
            aiAnalysisStatus: "1",
            aiAnalysisResult: file.name.includes("通知")
              ? "已提取到 1 个会议信息"
              : "已提取到关键信息并创建了 1 个议题",
          };
          setFiles((current) => [newFile, ...current]);
          message.success(`文件 "${file.name}" 已加入本地假数据`);
          return false;
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或将文件拖拽到这里上传</p>
      </Upload.Dragger>
      <Table
        className="submit-table"
        bordered
        size="small"
        rowKey="id"
        columns={columns}
        dataSource={files}
        pagination={false}
      />
      {!disabled ? (
        <div className="submit-footer">
          <Button type="primary" onClick={onNext}>
            下一步
          </Button>
        </div>
      ) : null}
    </div>
  );
}
function TopicManage({ disabled, onPrev, onNext }) {
  const [form] = Form.useForm();
  const [topics, setTopics] = useState(initialTopics);
  const columns = [
    { title: "序号", width: 64, render: (_value, _row, index) => index + 1 },
    { title: "议题分类（大）", dataIndex: "categoryLv1Name" },
    { title: "议题分类（中）", dataIndex: "categoryLv2Name" },
    { title: "议题分类（小）", dataIndex: "categoryLv3Name" },
    { title: "议题名称", dataIndex: "toipcName", width: 280 },
    {
      title: "董事会",
      dataIndex: "board",
      render: (value) => (value ? "√" : "-"),
    },
    {
      title: "监事会",
      dataIndex: "supervisor",
      render: (value) => (value ? "√" : "-"),
    },
    {
      title: "股东会",
      dataIndex: "shareholder",
      render: (value) => (value ? "√" : "-"),
    },
    { title: "审批层级", dataIndex: "reviewLevel2" },
    {
      title: "操作",
      width: 120,
      render: (_value, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => message.info(`${record.toipcName} 使用假数据详情`)}
          >
            编辑
          </Button>
          {!disabled ? (
            <Button
              type="link"
              danger
              onClick={() =>
                setTopics((current) =>
                  current.filter((item) => item.id !== record.id),
                )
              }
            >
              删除
            </Button>
          ) : null}
        </Space>
      ),
    },
  ];
  const handleSearch = () => {
    const values = form.getFieldsValue();
    const filtered = initialTopics.filter((topic) => {
      const lv1Matched = values.categoryLv1Name
        ? topic.categoryLv1Name === values.categoryLv1Name
        : true;
      const lv2Matched = values.categoryLv2Name
        ? topic.categoryLv2Name === values.categoryLv2Name
        : true;
      const lv3Matched = values.categoryLv3Name
        ? topic.categoryLv3Name === values.categoryLv3Name
        : true;
      const levelMatched = values.reviewLevel2
        ? topic.reviewLevel2 === values.reviewLevel2
        : true;
      return lv1Matched && lv2Matched && lv3Matched && levelMatched;
    });
    setTopics(filtered);
  };
  return (
    <div className="submit-section">
      <Prompt type="topic" />
      <Form form={form} layout="vertical">
        <div className="submit-filter-grid">
          <Form.Item name="categoryLv1Name" label="议题分类（大）">
            <Select
              allowClear
              options={categoryOptions.lv1.map((item) => ({
                ...item,
                value: item.label,
              }))}
            />
          </Form.Item>
          <Form.Item name="categoryLv2Name" label="议题分类（中）">
            <Select
              allowClear
              options={categoryOptions.lv2.map((item) => ({
                ...item,
                value: item.label,
              }))}
            />
          </Form.Item>
          <Form.Item name="categoryLv3Name" label="议题分类（小）">
            <Select
              allowClear
              options={categoryOptions.lv3.map((item) => ({
                ...item,
                value: item.label,
              }))}
            />
          </Form.Item>
          <Form.Item name="reviewLevel2" label="审批层级">
            <Select
              allowClear
              options={reviewLevelOptions.map((item) => ({
                label: item.label,
                value: item.label,
              }))}
            />
          </Form.Item>
          <div className="submit-filter-actions">
            <Button
              onClick={() => {
                form.resetFields();
                setTopics(initialTopics);
              }}
            >
              重置
            </Button>
            <Button type="primary" onClick={handleSearch}>
              搜索
            </Button>
            {!disabled ? (
              <Button
                type="primary"
                onClick={() => {
                  setTopics((current) => [
                    {
                      id: `topic-${Date.now()}`,
                      categoryLv1Name: "1. 经营类",
                      categoryLv2Name: "1.3 定期监管报告",
                      categoryLv3Name:
                        "1.3.1 按国家部委等上级机构监管要求定期报告事项（含反洗钱、反欺诈、重大风险评估、绩效追索扣回、离任审计、内部控制等）",
                      toipcName: "年度财务决算报告",
                      reviewLevel2: "业务总监",
                      board: true,
                      supervisor: false,
                      shareholder: false,
                    },
                    ...current,
                  ]);
                  message.success("新增议题已写入本地假数据");
                }}
              >
                新增
              </Button>
            ) : null}
          </div>
        </div>
      </Form>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={topics}
        pagination={false}
        size="small"
      />
      {!disabled ? (
        <div className="submit-footer">
          <Button onClick={onPrev}>上一步</Button>
          <Button type="primary" onClick={onNext}>
            下一步
          </Button>
        </div>
      ) : null}
    </div>
  );
}
function MeetingCard({ meeting, disabled, onChange }) {
  const [form] = Form.useForm();
  return (
    <div className="meeting-card">
      <div className="meeting-card-head">
        <div>
          <span className="meeting-card-mark" />
          <strong>{meeting.title}</strong>
        </div>
        <Space>
          <Switch
            disabled={disabled}
            checked={meeting.enabled}
            onChange={(checked) => onChange({ ...meeting, enabled: checked })}
          />
          <span>召开</span>
        </Space>
      </div>
      <Form
        form={form}
        layout="vertical"
        disabled={disabled || !meeting.enabled}
        initialValues={meeting}
        onValuesChange={(_, values) => onChange({ ...meeting, ...values })}
      >
        <Form.Item
          name="meetingName"
          label="会议名称"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="notifyDate"
          label="通知时间"
          rules={[{ required: true }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="launchType"
          label="召开方式"
          rules={[{ required: true }]}
        >
          <Radio.Group>
            <Radio value={1}>现场会议</Radio>
            <Radio value={2}>通讯表决</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="launchTime"
          label={meeting.launchType === 2 ? "表决日期" : "会议时间"}
          rules={[{ required: meeting.launchType !== 2 }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            showTime={meeting.launchType !== 2 ? { format: "HH:mm" } : false}
            format={
              meeting.launchType !== 2 ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD"
            }
          />
        </Form.Item>
        <Form.Item name="location" label="会议地点">
          <Input />
        </Form.Item>
      </Form>
    </div>
  );
}
function MeetingManage({ disabled, onPrev, onNext }) {
  const [meetings, setMeetings] = useState(initialMeetings);
  return (
    <div className="submit-section">
      <Prompt type="meeting" />
      <div className="meeting-grid">
        {meetings.map((meeting) => (
          <MeetingCard
            key={meeting.key}
            meeting={meeting}
            disabled={disabled}
            onChange={(nextMeeting) =>
              setMeetings((current) =>
                current.map((item) =>
                  item.key === nextMeeting.key ? nextMeeting : item,
                ),
              )
            }
          />
        ))}
      </div>
      {!disabled ? (
        <div className="submit-footer">
          <Button onClick={onPrev}>上一步</Button>
          <Button type="primary" onClick={onNext}>
            下一步
          </Button>
        </div>
      ) : null}
    </div>
  );
}
function DistributionManage({ disabled, onPrev, onSubmit }) {
  const [data, setData] = useState(initialDistribution);
  const [reviewerNotifyList, setReviewerNotifyList] = useState(
    initialReviewerNotifyList,
  );
  const setChecked = (id, key, checked) => {
    setData((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [key]: checked } : item,
      ),
    );
  };
  const columns = [
    {
      title: "序号",
      width: 64,
      fixed: "left",
      render: (_value, _row, index) => index + 1,
    },
    { title: "职务分类", dataIndex: "positionCategory", width: 110 },
    { title: "职务", dataIndex: "positionCode", width: 140 },
    { title: "股东代表", dataIndex: "shDelFlag", width: 100 },
    { title: "任职人", dataIndex: "userName", width: 100 },
    {
      title: "董事会参会人员",
      dataIndex: "attendeeVos100",
      width: 140,
      render: (value, row) => (
        <Checkbox
          disabled={disabled}
          checked={value}
          onChange={(event) =>
            setChecked(row.id, "attendeeVos100", event.target.checked)
          }
        />
      ),
    },
    {
      title: "监事会参会人员",
      dataIndex: "attendeeVos200",
      width: 140,
      render: (value, row) => (
        <Checkbox
          disabled={disabled}
          checked={value}
          onChange={(event) =>
            setChecked(row.id, "attendeeVos200", event.target.checked)
          }
        />
      ),
    },
    {
      title: "股东会参会人员",
      dataIndex: "attendeeVos300",
      width: 140,
      render: (value, row) => (
        <Checkbox
          disabled={disabled}
          checked={value}
          onChange={(event) =>
            setChecked(row.id, "attendeeVos300", event.target.checked)
          }
        />
      ),
    },
    { title: "集团总经理助理及以上", dataIndex: "topicNotifyFlag", width: 180 },
    {
      title: "传达对象",
      dataIndex: "hasConvey",
      fixed: "right",
      width: 110,
      render: (value, row) => (
        <Checkbox
          disabled={disabled}
          checked={value}
          onChange={(event) =>
            setChecked(row.id, "hasConvey", event.target.checked)
          }
        />
      ),
    },
  ];
  const switchReviewerJoin = (checked, index) => {
    setReviewerNotifyList((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        return {
          ...item,
          hasJoin: checked,
          userList: checked ? item.userList : [],
        };
      }),
    );
  };
  const setReviewerUsers = (values, index) => {
    setReviewerNotifyList((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        return {
          ...item,
          userList: values.map((loginId) => {
            const option = reviewerUserOptions.find(
              (user) => user.value === loginId,
            );
            return {
              fullName: option?.label || loginId,
              loginId,
            };
          }),
        };
      }),
    );
  };
  const submitDistribution = () => {
    const invalidReviewer = reviewerNotifyList.find(
      (item) => item.hasJoin && item.userList.length === 0,
    );
    if (invalidReviewer) {
      message.error(`请在「${invalidReviewer.orgName}」中选取人`);
      return;
    }
    message.success("提交成功");
    onSubmit();
  };
  return (
    <div className="submit-section">
      <Prompt type="distribution" />
      <div className="distribution-layout">
        <div className="distribution-left">
          <div className="distribution-title">议题材料传达对象</div>
          <div className="distribution-notice danger">
            <span className="distribution-notice-icon">!</span>
            <span>注意：集团总经理助理及以上不传达！</span>
          </div>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={data}
            pagination={false}
            size="small"
            scroll={{ x: 1260 }}
          />
        </div>
        <div className="distribution-right">
          <div className="distribution-title">职能联审议题材料传达对象</div>
          <div className="distribution-notice warning">
            <span className="distribution-notice-icon">!</span>
            <span>请根据议题内容指定参与职能联审初审的职能部门。</span>
          </div>
          <Card className="distribution-reviewer-card">
            {reviewerNotifyList.map((item, index) => (
              <div className="distribution-card-item" key={item.id || index}>
                <span className="distribution-org-name">{item.orgName}</span>
                <Switch
                  checked={item.hasJoin}
                  onChange={(checked) => switchReviewerJoin(checked, index)}
                  style={{ marginRight: "3px" }}
                  disabled={disabled || item.isDisabled ? true : false}
                />
                <Select
                  mode="multiple"
                  allowClear
                  disabled={!item.hasJoin || disabled}
                  placeholder={item.hasJoin ? "请选择人员" : "未参与"}
                  className="distribution-user-select"
                  value={item.userList.map((user) => user.loginId)}
                  options={reviewerUserOptions}
                  onChange={(values) => setReviewerUsers(values, index)}
                  maxTagCount="responsive"
                />
              </div>
            ))}
          </Card>
        </div>
      </div>
      {!disabled ? (
        <div className="submit-footer">
          <Button onClick={onPrev}>上一步</Button>
          <Button type="primary" onClick={submitDistribution}>
            提交
          </Button>
        </div>
      ) : null}
    </div>
  );
}
export default function SubmitDrawer({ editStatus, projectData }) {
  const navigate = useNavigate();
  const disabled = editStatus === "detail";
  const [activeKey, setActiveKey] = useState("1");
  const [allowedTabs, setAllowedTabs] = useState(["1", "2", "3", "4"]);
  const goNext = () => {
    const nextKey = String(Number(activeKey) + 1);
    if (Number(nextKey) <= 4) {
      setAllowedTabs((current) => Array.from(new Set([...current, nextKey])));
      setActiveKey(nextKey);
      message.success("保存成功，已进入下一步");
    }
  };
  const goPrev = () => {
    setActiveKey(String(Math.max(1, Number(activeKey) - 1)));
  };
  const goGztHome = () => {
    navigate("/GztHome");
  };
  const items = useMemo(
    () => [
      {
        key: "1",
        label: "智能提报",
        disabled: !allowedTabs.includes("1"),
        children: <SmartSubmit disabled={disabled} onNext={goNext} />,
      },
      {
        key: "2",
        label: "议题管理",
        disabled: !allowedTabs.includes("2"),
        children: (
          <TopicManage disabled={disabled} onPrev={goPrev} onNext={goNext} />
        ),
      },
      {
        key: "3",
        label: "会议管理",
        disabled: !allowedTabs.includes("3"),
        children: (
          <MeetingManage disabled={disabled} onPrev={goPrev} onNext={goNext} />
        ),
      },
      {
        key: "4",
        label: "议题资料传达",
        disabled: !allowedTabs.includes("4"),
        children: (
          <DistributionManage
            disabled={disabled}
            onPrev={goPrev}
            onSubmit={goGztHome}
          />
        ),
      },
    ],
    [allowedTabs, activeKey, disabled],
  );
  return (
    <div className="submit-drawer">
      <div className="submit-company">
        <span className="submit-company-title">参股公司</span>
        <span>|</span>
        <span>{projectData.companyCreditCode || "91120118MA06A8FAW1"}</span>
        <span>{projectData.companyName || "一汽股权投资（天津）有限公司"}</span>
      </div>
      <Tabs
        activeKey={activeKey}
        onChange={setActiveKey}
        destroyInactiveTabPane
        items={items}
      />
    </div>
  );
}
