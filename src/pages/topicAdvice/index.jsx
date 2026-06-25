import "antd/dist/reset.css";
import { BoldOutlined, CalendarOutlined, DownOutlined, FileDoneOutlined, ItalicOutlined, LinkOutlined, MessageOutlined, OrderedListOutlined, PaperClipOutlined, RightOutlined, SaveOutlined, SendOutlined, TeamOutlined, UnorderedListOutlined, UploadOutlined, } from "@ant-design/icons";
import { Button, Descriptions, Divider, Modal, Space, Table, Tag, Upload, message, } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import "./index.css";
const topicFileTypes = {
    "100": "会议通知",
    "200": "议题相关",
    "300": "议题目录",
    "400": "补充材料",
};
const smartFiles = [
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
const topics = [
    {
        id: "topic-001",
        categoryLv1Name: "1. 经营类",
        categoryLv2Name: "1.3 定期监管报告",
        categoryLv3Name: "1.3.1 按国家部委等上级机构监管要求定期报告事项（含反洗钱、反欺诈、重大风险评估、绩效追索扣回、离任审计、内部控制等）",
        toipcName: "测试1",
        reviewLevel2: "业务总监",
        board: true,
        supervisor: false,
        shareholder: false,
    },
    {
        id: "topic-002",
        categoryLv1Name: "1. 经营类",
        categoryLv2Name: "1.3 定期监管报告",
        categoryLv3Name: "1.3.1 按国家部委等上级机构监管要求定期报告事项（含反洗钱、反欺诈、重大风险评估、绩效追索扣回、离任审计、内部控制等）",
        toipcName: "测试1",
        reviewLevel2: "业务总监",
        board: true,
        supervisor: false,
        shareholder: false,
    },
];
const meetings = [
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
const distributionRows = [
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
const reviewerNotifyRows = [
    {
        id: "reviewer-001",
        orgName: "财务管理部",
        hasJoin: true,
        userList: [
            { fullName: "王明", loginId: "wangming" },
            { fullName: "李娜", loginId: "lina" },
        ],
    },
    {
        id: "reviewer-002",
        orgName: "法律合规部",
        hasJoin: true,
        userList: [{ fullName: "赵鹏", loginId: "zhaopeng" }],
    },
    {
        id: "reviewer-003",
        orgName: "战略投资部",
        hasJoin: false,
        userList: [],
    },
    {
        id: "reviewer-004",
        orgName: "审计风控部",
        hasJoin: true,
        userList: [{ fullName: "周静", loginId: "zhoujing" }],
    },
];
const topicFeedbackRecords = {
    "topic-001": [
        { id: "feedback-001", role: "leader", sender: "张总", time: "2026-04-24 09:18", content: "请补充基金退出方案中交易对手资信情况，以及本次退出对年度收益目标的影响测算。" },
        { id: "feedback-002", role: "manager", sender: "股权运营部 王明", time: "2026-04-24 10:06", content: "已收到，管户团队正在补充资信核查表和收益测算口径，预计今日 16:00 前完成材料更新。" },
    ],
    "topic-002": [
        { id: "feedback-003", role: "leader", sender: "李董", time: "2026-04-24 14:32", content: "请同步说明是否涉及其他股东优先购买权，以及法律合规部是否已出具书面意见。" },
        { id: "feedback-004", role: "manager", sender: "法律合规部 李娜", time: "2026-04-24 15:11", content: "已核对章程及投资协议，不触发其他股东优先购买权。书面意见已随补充材料上传。" },
    ],
};
const initialTopicFiles = {
    "topic-001": [{ uid: "reference-001", name: "基金退出方案补充材料.pdf", url: "/advice-review/6a2133fde4b0cb6abf664a41.pdf" }],
    "topic-002": [{ uid: "reference-002", name: "外部董事意见采纳情况说明.pdf", url: "/advice-review/6a2133fde4b0cb6abf664a41.pdf" }],
};
const initialTopicReplies = {
    "topic-001": "<p>建议围绕基金退出节奏、交易对手资信及年度收益影响进一步补充说明。</p>",
    "topic-002": "<p>建议补充外部董事意见采纳情况及法律合规部门书面意见。</p>",
};
const stripHtml = (value) => value
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
function ReadonlySection({ title, children, }) {
    return (<section className="topic-advice-section">
      <div className="topic-advice-section-head">
        <div>
          <h2>{title}</h2>
        </div>
      </div>
      {children}
    </section>);
}
function RichReplyEditor({ value, onChange, }) {
    const editorRef = useRef(null);
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);
    const exec = (command, payload) => {
        editorRef.current?.focus();
        document.execCommand(command, false, payload);
        onChange(editorRef.current?.innerHTML || "");
    };
    const addLink = () => {
        const url = window.prompt("请输入链接地址");
        if (url) {
            exec("createLink", url);
        }
    };
    return (<div className="topic-rich-editor">
      <div className="topic-rich-toolbar">
        <Button title="加粗" icon={<BoldOutlined />} onClick={() => exec("bold")}/>
        <Button title="斜体" icon={<ItalicOutlined />} onClick={() => exec("italic")}/>
        <Button title="无序列表" icon={<UnorderedListOutlined />} onClick={() => exec("insertUnorderedList")}/>
        <Button title="有序列表" icon={<OrderedListOutlined />} onClick={() => exec("insertOrderedList")}/>
        <Button title="插入链接" icon={<LinkOutlined />} onClick={addLink}/>
      </div>
      <div ref={editorRef} className="topic-rich-body" contentEditable data-placeholder="请输入反馈建议意见，可使用上方工具进行简单排版" onInput={(event) => onChange(event.currentTarget.innerHTML)} onBlur={(event) => onChange(event.currentTarget.innerHTML)} suppressContentEditableWarning/>
    </div>);
}
export default function TopicAdvicePage() {
    const [messageApi, messageContextHolder] = message.useMessage();
    const [topicReplies, setTopicReplies] = useState(initialTopicReplies);
    const [topicFiles, setTopicFiles] = useState(initialTopicFiles);
    const [savedAtByTopic, setSavedAtByTopic] = useState({});
    const [collapsedTopicIds, setCollapsedTopicIds] = useState(() => new Set());
    const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
    const enabledMeetings = meetings.filter((item) => item.enabled);
    const summaryStats = [
        {
            key: "files",
            label: "识别文件",
            value: smartFiles.length,
            suffix: "份",
            icon: <FileDoneOutlined />,
        },
        {
            key: "topics",
            label: "提取议题",
            value: topics.length,
            suffix: "项",
            icon: <FileDoneOutlined />,
        },
        {
            key: "meetings",
            label: "三会安排",
            value: enabledMeetings.length,
            suffix: "场",
            icon: <CalendarOutlined />,
        },
        {
            key: "receivers",
            label: "传达对象",
            value: distributionRows.filter((item) => item.hasConvey).length,
            suffix: "人",
            icon: <TeamOutlined />,
        },
    ];
    const smartColumns = useMemo(() => [
        { title: "序号", width: 70, render: (_value, _row, index) => index + 1 },
        {
            title: "文件名",
            dataIndex: "fileName",
            width: 300,
            render: (value) => <a href="#">{value}</a>,
        },
        {
            title: "文件分类",
            dataIndex: "fileCategory",
            width: 140,
            render: (value) => topicFileTypes[value] || value,
        },
        {
            title: "AI处理状态",
            dataIndex: "aiAnalysisStatus",
            width: 130,
            render: (value) => (<Tag color={value === "1" ? "success" : "error"}>
            {value === "1" ? "解析完成" : "解析失败"}
          </Tag>),
        },
        { title: "AI提取结果", dataIndex: "aiAnalysisResult" },
    ], []);
    const topicColumns = useMemo(() => [
        { title: "序号", width: 70, render: (_value, _row, index) => index + 1 },
        { title: "议题分类（大）", dataIndex: "categoryLv1Name" },
        { title: "议题分类（中）", dataIndex: "categoryLv2Name" },
        { title: "议题分类（小）", dataIndex: "categoryLv3Name" },
        { title: "议题名称", dataIndex: "toipcName", width: 300 },
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
    ], []);
    const distributionColumns = useMemo(() => [
        { title: "序号", width: 70, render: (_value, _row, index) => index + 1 },
        { title: "职务分类", dataIndex: "positionCategory" },
        { title: "职务", dataIndex: "positionCode" },
        { title: "股东代表", dataIndex: "shDelFlag" },
        { title: "任职人", dataIndex: "userName" },
        {
            title: "董事会",
            dataIndex: "attendeeVos100",
            render: (value) => (value ? <Tag color="blue">参会</Tag> : "-"),
        },
        {
            title: "监事会",
            dataIndex: "attendeeVos200",
            render: (value) => (value ? <Tag color="purple">参会</Tag> : "-"),
        },
        {
            title: "股东会",
            dataIndex: "attendeeVos300",
            render: (value) => (value ? <Tag color="cyan">参会</Tag> : "-"),
        },
        { title: "集团总经理助理及以上", dataIndex: "topicNotifyFlag" },
        {
            title: "传达对象",
            dataIndex: "hasConvey",
            render: (value) => (value ? <Tag color="success">是</Tag> : "否"),
        },
    ], []);
    const updateTopicReply = (topicId, value) => {
        setTopicReplies((current) => ({ ...current, [topicId]: value }));
    };
    const toggleTopicCollapsed = (topicId) => {
        setCollapsedTopicIds((current) => {
            const next = new Set(current);
            if (next.has(topicId)) {
                next.delete(topicId);
            }
            else {
                next.add(topicId);
            }
            return next;
        });
    };
    const addTopicFile = (topicId, file) => {
        const nextFile = { uid: `${topicId}-${Date.now()}`, name: file.name, url: URL.createObjectURL(file) };
        setTopicFiles((current) => ({ ...current, [topicId]: [...(current[topicId] || []), nextFile] }));
        messageApi.success(`已上传参考文件：${file.name}`);
        return Upload.LIST_IGNORE;
    };
    const handleSave = () => {
        if (topics.some((topic) => !stripHtml(topicReplies[topic.id] || ""))) {
            messageApi.error("请填写每个议题的回复内容后再保存");
            return;
        }
        const savedAt = dayjs().format("YYYY-MM-DD HH:mm:ss");
        setSavedAtByTopic(Object.fromEntries(topics.map((topic) => [topic.id, savedAt])));
        messageApi.success("各议题回复已保存到本地假数据");
    };
    const handleSubmit = () => {
        if (topics.some((topic) => !stripHtml(topicReplies[topic.id] || ""))) {
            messageApi.error("请填写每个议题的回复内容后再提交");
            return;
        }
        setSubmitConfirmOpen(true);
    };
    const handleConfirmSubmit = () => {
        setSubmitConfirmOpen(false);
        const savedAt = dayjs().format("YYYY-MM-DD HH:mm:ss");
        setSavedAtByTopic(Object.fromEntries(topics.map((topic) => [topic.id, savedAt])));
        messageApi.success("提交成功，已写入本地假数据");
    };
    return (<div className="topic-advice-page">
      {messageContextHolder}
      <header className="topic-advice-header">
        <div className="topic-advice-title">
          <h1>议题反馈建议</h1>
          <p>参股公司议题提报内容、三会安排与回复意见集中处理。</p>
        </div>
        <div className="topic-advice-header-meta">
          <Tag color="processing">待反馈建议</Tag>
        </div>
      </header>

      <main className="topic-advice-content">
        <section className="topic-advice-overview">
          {summaryStats.map((item) => (<div className="topic-advice-stat" key={item.key}>
              <span className="topic-advice-stat-icon">{item.icon}</span>
              <div>
                <span className="topic-advice-stat-label">{item.label}</span>
                <strong>
                  {item.value}
                  <small>{item.suffix}</small>
                </strong>
              </div>
            </div>))}
        </section>

        <section className="topic-advice-summary">
          <Descriptions column={4} size="small" labelStyle={{ width: 128 }} items={[
            {
                key: "companyCreditCode",
                label: "统一社会信用代码",
                children: "91120118MA06A8FAW1",
            },
            {
                key: "companyName",
                label: "参股公司",
                children: "一汽股权投资（天津）有限公司",
            },
            {
                key: "mgmtNo",
                label: "会议及议题编码",
                children: "SH-2026-004",
            },
            {
                key: "submitUser",
                label: "提报人",
                children: "系统自动提报",
            },
            {
                key: "submitTime",
                label: "提报时间",
                children: "2026-04-21 15:46:03",
            },
            {
                key: "topicCount",
                label: "议题数量",
                children: `${topics.length} 个`,
            },
            {
                key: "meetingCount",
                label: "会议数量",
                children: `${enabledMeetings.length} 个`,
            },
            {
                key: "status",
                label: "当前状态",
                children: <Tag color="processing">待处理</Tag>,
            },
        ]}/>
        </section>

        <ReadonlySection title="智能提报">
          <Table rowKey="id" columns={smartColumns} dataSource={smartFiles} pagination={false} size="small"/>
        </ReadonlySection>

        <ReadonlySection title="议题管理">
          <Table rowKey="id" columns={topicColumns} dataSource={topics} pagination={false} size="small"/>
        </ReadonlySection>

        <ReadonlySection title="会议管理">
          <div className="topic-meeting-grid">
            {meetings.map((meeting) => (<article className="topic-meeting-card" key={meeting.key}>
                <div className="topic-meeting-title">
                  <span>{meeting.title}</span>
                  <Tag color={meeting.enabled ? "success" : "default"}>
                    {meeting.enabled ? "召开" : "不召开"}
                  </Tag>
                </div>
                <Divider />
                <Descriptions column={1} size="small" items={[
                {
                    key: "meetingName",
                    label: "会议名称",
                    children: meeting.meetingName,
                },
                {
                    key: "notifyDate",
                    label: "通知时间",
                    children: meeting.notifyDate.format("YYYY-MM-DD"),
                },
                {
                    key: "launchType",
                    label: "召开方式",
                    children: meeting.launchType === 1 ? "现场会议" : "通讯表决",
                },
                {
                    key: "launchTime",
                    label: meeting.launchType === 2 ? "表决日期" : "会议时间",
                    children: meeting.launchTime.format(meeting.launchType === 2 ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm"),
                },
                {
                    key: "location",
                    label: "会议地点",
                    children: meeting.location,
                },
            ]}/>
              </article>))}
          </div>
        </ReadonlySection>

        {/* <ReadonlySection title="议题资料传达">
          <Table rowKey="id" columns={distributionColumns} dataSource={distributionRows} pagination={false} size="small" scroll={{ x: 1180 }}/>
          <div className="topic-reviewer-list">
            {reviewerNotifyRows.map((row) => (<div className="topic-reviewer-item" key={row.id}>
                <span>{row.orgName}</span>
                {row.hasJoin ? (<Space size={4} wrap>
                    {row.userList.map((user) => (<Tag key={user.loginId}>{user.fullName}</Tag>))}
                  </Space>) : (<Tag>未参与</Tag>)}
              </div>))}
          </div>
        </ReadonlySection> */}

        <section className="topic-advice-section topic-feedback-section">
          <div className="topic-advice-section-head">
            <div>
              <h2>议题意见反馈与答复</h2>
              <p>每个议题独立上传参考文件、查看问答记录并填写反馈建议。</p>
            </div>
            <Tag icon={<MessageOutlined />} color="processing">
              {topics.length} 个议题
            </Tag>
          </div>
          <div className="topic-feedback-topic-list">
            {topics.map((topic, index) => {
            const isCollapsed = collapsedTopicIds.has(topic.id);
            return (<article className="topic-feedback-topic" key={topic.id}>
              <div className="topic-feedback-topic-head">
                <div>
                  <span>议题 {String(index + 1).padStart(2, "0")}</span>
                  <h3>{topic.toipcName}</h3>
                </div>
                <div className="topic-feedback-topic-actions">
                  {savedAtByTopic[topic.id] ? <Tag color="green">已保存 {savedAtByTopic[topic.id]}</Tag> : <Tag>未保存</Tag>}
                  <Button type="text" size="small" icon={isCollapsed ? <RightOutlined /> : <DownOutlined />} aria-expanded={!isCollapsed} onClick={() => toggleTopicCollapsed(topic.id)}>
                    {isCollapsed ? "展开" : "收起"}
                  </Button>
                </div>
              </div>
              <div className="topic-feedback-topic-body" hidden={isCollapsed}>
                <div className="topic-reference-files">
                <div className="topic-reference-files-head">
                  <strong><PaperClipOutlined /> 参考文件</strong>
                  <Upload showUploadList={false} beforeUpload={(file) => addTopicFile(topic.id, file)}>
                    <Button size="small" icon={<UploadOutlined />}>上传参考文件</Button>
                  </Upload>
                </div>
                <div className="topic-reference-file-list">
                  {(topicFiles[topic.id] || []).map((file) => <a href={file.url} target="_blank" rel="noreferrer" key={file.uid}><FileDoneOutlined /> {file.name}</a>)}
                </div>
              </div>
              <div className="topic-feedback-list">
                {(topicFeedbackRecords[topic.id] || []).map((item) => (<div className={`topic-feedback-row ${item.role === "manager" ? "is-manager" : "is-leader"}`} key={item.id}>
                  <div className="topic-feedback-meta">
                    <span>{item.role === "manager" ? "管户回复" : "反馈建议"}</span>
                    <strong>{item.sender}</strong>
                    <em>{item.time}</em>
                  </div>
                  <div className="topic-feedback-bubble">{item.content}</div>
                </div>))}
              </div>
              <div className="topic-feedback-editor">
                <h4>本议题反馈建议</h4>
                <RichReplyEditor value={topicReplies[topic.id] || ""} onChange={(value) => updateTopicReply(topic.id, value)}/>
              </div>
              </div>
            </article>);
        })}
          </div>
        </section>
      </main>

      <footer className="topic-advice-actions">
        <Button icon={<SaveOutlined />} onClick={handleSave}>
          保存
        </Button>
        <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit}>
          提交
        </Button>
      </footer>
      <Modal title="确认提交回复？" open={submitConfirmOpen} okText="确认提交" cancelText="取消" onOk={handleConfirmSubmit} onCancel={() => setSubmitConfirmOpen(false)}>
        <p>提交后将给对应管户发钉钉消息。</p>
      </Modal>
    </div>);
}
