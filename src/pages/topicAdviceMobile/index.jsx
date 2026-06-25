import "antd-mobile/es/global";
import {
    AuditOutlined,
    AudioOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    DownOutlined,
    FileTextOutlined,
    MessageOutlined,
    PaperClipOutlined,
    RightOutlined,
    SendOutlined,
    TeamOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import { Button, Collapse, Dialog, Tag, TextArea, Toast } from "antd-mobile";
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
    "topic-001": [{ id: "reference-001", name: "基金退出方案补充材料.pdf", url: "/advice-review/6a2133fde4b0cb6abf664a41.pdf" }],
    "topic-002": [{ id: "reference-002", name: "外部董事意见采纳情况说明.pdf", url: "/advice-review/6a2133fde4b0cb6abf664a41.pdf" }],
};
const initialTopicReplies = {
    "topic-001": "建议围绕基金退出节奏、交易对手资信及年度收益影响进一步补充说明。",
    "topic-002": "建议补充外部董事意见采纳情况及法律合规部门书面意见。",
};

const stripHtml = (value) =>
    value
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();

function Section({ title, icon, children }) {
    return (
        <section className="topic-mobile-section">
            <div className="topic-mobile-section-title">
                <span>{icon}</span>
                <h2>{title}</h2>
            </div>
            {children}
        </section>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="topic-mobile-info-row">
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}

function MeetingTags({ topic }) {
    return (
        <div className="topic-mobile-tags">
            {topic.board ? <Tag color="primary">董事会</Tag> : null}
            {topic.supervisor ? <Tag color="warning">监事会</Tag> : null}
            {topic.shareholder ? <Tag color="success">股东会</Tag> : null}
        </div>
    );
}

export default function TopicAdviceMobilePage() {
    const [topicReplies, setTopicReplies] = useState(initialTopicReplies);
    const [topicFiles, setTopicFiles] = useState(initialTopicFiles);
    const [listeningTopicId, setListeningTopicId] = useState("");
    const [uploadTopicId, setUploadTopicId] = useState("");
    const [savedAtByTopic, setSavedAtByTopic] = useState({});
    const [collapsedTopicIds, setCollapsedTopicIds] = useState(() => new Set());
    const recognitionRef = useRef(null);
    const fileInputRef = useRef(null);
    const enabledMeetings = useMemo(() => meetings.filter((item) => item.enabled), []);
    const conveyCount = useMemo(() => distributionRows.filter((item) => item.hasConvey).length, []);
    const summaryStats = [
        { key: "files", label: "文件", value: smartFiles.length, suffix: "份" },
        { key: "topics", label: "议题", value: topics.length, suffix: "项" },
        { key: "meetings", label: "会议", value: enabledMeetings.length, suffix: "场" },
        { key: "people", label: "传达", value: conveyCount, suffix: "人" },
    ];

    useEffect(() => {
        return () => {
            recognitionRef.current?.stop();
        };
    }, []);

    const updateTopicReply = (topicId, value) => {
        setTopicReplies((current) => ({ ...current, [topicId]: value }));
    };

    const toggleTopicCollapsed = (topicId) => {
        setCollapsedTopicIds((current) => {
            const next = new Set(current);
            if (next.has(topicId)) next.delete(topicId);
            else next.add(topicId);
            return next;
        });
    };

    const appendReplyText = (topicId, text) => {
        const nextText = text.trim();
        if (!nextText) return;
        setTopicReplies((current) => {
            const prefix = (current[topicId] || "").trim();
            return { ...current, [topicId]: [prefix, nextText].filter(Boolean).join(prefix ? "\n" : "").slice(0, 500) };
        });
    };

    const handleSpeechToText = (topicId) => {
        if (listeningTopicId === topicId) {
            recognitionRef.current?.stop();
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            Toast.show("当前浏览器不支持语音转文字");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = "zh-CN";
        recognition.interimResults = false;
        recognition.continuous = false;
        recognition.onstart = () => {
            setListeningTopicId(topicId);
            Toast.show("正在听取语音");
        };
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map((result) => result[0]?.transcript || "")
                .join("");
            appendReplyText(topicId, transcript);
            Toast.show("已转为文字");
        };
        recognition.onerror = () => {
            Toast.show("语音识别失败，请重试");
        };
        recognition.onend = () => {
            setListeningTopicId("");
            recognitionRef.current = null;
        };
        recognitionRef.current = recognition;
        recognition.start();
    };

    const handleReferenceUpload = (topicId) => {
        setUploadTopicId(topicId);
        fileInputRef.current?.click();
    };

    const handleReferenceFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file || !uploadTopicId) return;
        const nextFile = { id: `${uploadTopicId}-${Date.now()}`, name: file.name, url: URL.createObjectURL(file) };
        setTopicFiles((current) => ({ ...current, [uploadTopicId]: [...(current[uploadTopicId] || []), nextFile] }));
        event.target.value = "";
        Toast.show(`已上传参考文件：${file.name}`);
    };

    const handleSave = () => {
        if (topics.some((topic) => !stripHtml(topicReplies[topic.id] || ""))) {
            Toast.show("请填写每个议题的回复内容后再保存");
            return;
        }
        const savedAt = dayjs().format("YYYY-MM-DD HH:mm:ss");
        setSavedAtByTopic(Object.fromEntries(topics.map((topic) => [topic.id, savedAt])));
        Toast.show("各议题回复已保存");
    };

    const handleSubmit = async () => {
        if (topics.some((topic) => !stripHtml(topicReplies[topic.id] || ""))) {
            Toast.show("请填写每个议题的回复内容后再提交");
            return;
        }
        const confirmed = await Dialog.confirm({
            title: "确认提交回复？",
            content: "提交后将给对应管户发钉钉消息。",
            confirmText: "确认提交",
            cancelText: "取消",
        });
        if (confirmed) {
            const savedAt = dayjs().format("YYYY-MM-DD HH:mm:ss");
            setSavedAtByTopic(Object.fromEntries(topics.map((topic) => [topic.id, savedAt])));
            Toast.show("提交成功");
        }
    };

    return (
        <div className="topic-mobile-page">
            <header className="topic-mobile-hero">
                <div className="topic-mobile-status">
                    <Tag color="primary" fill="solid">
                        待反馈建议
                    </Tag>
                    <span>SH-2026-004</span>
                </div>
                <h1>议题反馈建议</h1>
                <p>参股公司议题提报内容、三会安排与回复意见集中处理。</p>
            </header>

            <main className="topic-mobile-content">
                <section className="topic-mobile-stats" aria-label="议题概览">
                    {summaryStats.map((item) => (
                        <div className="topic-mobile-stat" key={item.key}>
                            <span>{item.label}</span>
                            <strong>
                                {item.value}
                                <small>{item.suffix}</small>
                            </strong>
                        </div>
                    ))}
                </section>

                <Section title="基础信息" icon={<AuditOutlined />}>
                    <div className="topic-mobile-info-card">
                        <InfoRow label="参股公司" value="一汽股权投资（天津）有限公司" />
                        <InfoRow label="统一社会信用代码" value="91120118MA06A8FAW1" />
                        <InfoRow label="提报人" value="系统自动提报" />
                        <InfoRow label="提报时间" value="2026-04-21 15:46:03" />
                    </div>
                </Section>

                <Section title="智能提报" icon={<FileTextOutlined />}>
                    <div className="topic-mobile-list">
                        {smartFiles.map((file) => (
                            <article className="topic-mobile-file" key={file.id}>
                                <div>
                                    <h3>{file.fileName}</h3>
                                    <p>{file.aiAnalysisResult}</p>
                                </div>
                                <div className="topic-mobile-file-meta">
                                    <Tag fill="outline">{topicFileTypes[file.fileCategory] || file.fileCategory}</Tag>
                                    <Tag color="success">解析完成</Tag>
                                </div>
                            </article>
                        ))}
                    </div>
                </Section>

                <Section title="议题管理" icon={<CheckCircleOutlined />}>
                    <div className="topic-mobile-list">
                        {topics.map((topic, index) => (
                            <article className="topic-mobile-topic" key={topic.id}>
                                <div className="topic-mobile-topic-index">{String(index + 1).padStart(2, "0")}</div>
                                <div className="topic-mobile-topic-body">
                                    <h3>{topic.toipcName}</h3>
                                    <p>
                                        {topic.categoryLv1Name} / {topic.categoryLv2Name} / {topic.categoryLv3Name}
                                    </p>
                                    <div className="topic-mobile-topic-footer">
                                        <Tag color="primary">{topic.reviewLevel2}</Tag>
                                        <MeetingTags topic={topic} />
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </Section>

                <Section title="会议管理" icon={<CalendarOutlined />}>
                    <div className="topic-mobile-meeting-list">
                        {meetings.map((meeting) => (
                            <article className="topic-mobile-meeting" key={meeting.key}>
                                <div className="topic-mobile-meeting-head">
                                    <h3>{meeting.title}</h3>
                                    <Tag color={meeting.enabled ? "success" : "default"}>{meeting.enabled ? "召开" : "不召开"}</Tag>
                                </div>
                                <p>{meeting.meetingName}</p>
                                <div className="topic-mobile-meeting-grid">
                                    <InfoRow label="通知时间" value={meeting.notifyDate.format("YYYY-MM-DD")} />
                                    <InfoRow label={meeting.launchType === 2 ? "表决日期" : "会议时间"} value={meeting.launchTime.format(meeting.launchType === 2 ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm")} />
                                    <InfoRow label="召开方式" value={meeting.launchType === 1 ? "现场会议" : "通讯表决"} />
                                    <InfoRow label="地点" value={meeting.location} />
                                </div>
                            </article>
                        ))}
                    </div>
                </Section>

                {/* <Section title="议题资料传达" icon={<TeamOutlined />}>
                    <Collapse className="topic-mobile-collapse" defaultActiveKey={["attendees"]}>
                        <Collapse.Panel key="attendees" title={`参会及传达对象（${distributionRows.length}）`}>
                            <div className="topic-mobile-person-list">
                                {distributionRows.map((person) => (
                                    <article className="topic-mobile-person" key={person.id}>
                                        <div>
                                            <h3>{person.userName}</h3>
                                            <p>
                                                {person.positionCategory} · {person.positionCode}
                                            </p>
                                        </div>
                                        <div className="topic-mobile-tags">
                                            {person.attendeeVos100 ? <Tag color="primary">董事会</Tag> : null}
                                            {person.attendeeVos200 ? <Tag color="warning">监事会</Tag> : null}
                                            {person.attendeeVos300 ? <Tag color="success">股东会</Tag> : null}
                                            {person.hasConvey ? <Tag color="success">传达</Tag> : null}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </Collapse.Panel>
                        <Collapse.Panel key="reviewers" title={`职能联审传达（${reviewerNotifyRows.length}）`}>
                            <div className="topic-mobile-reviewer-list">
                                {reviewerNotifyRows.map((row) => (
                                    <div className="topic-mobile-reviewer" key={row.id}>
                                        <strong>{row.orgName}</strong>
                                        <div className="topic-mobile-tags">
                                            {row.hasJoin ? row.userList.map((user) => <Tag key={user.loginId}>{user.fullName}</Tag>) : <Tag>未参与</Tag>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Collapse.Panel>
                    </Collapse>
                </Section> */}

                <Section title="议题意见反馈与答复" icon={<MessageOutlined />}>
                    <input ref={fileInputRef} className="topic-mobile-file-input" type="file" onChange={handleReferenceFileChange} />
                    <div className="topic-mobile-feedback-topics">
                        {topics.map((topic, index) => {
                            const isCollapsed = collapsedTopicIds.has(topic.id);
                            return (
                            <article className="topic-mobile-feedback-topic" key={topic.id}>
                                <div className="topic-mobile-feedback-topic-head">
                                    <div>
                                        <span>议题 {String(index + 1).padStart(2, "0")}</span>
                                        <h3>{topic.toipcName}</h3>
                                    </div>
                                    <div className="topic-mobile-feedback-topic-actions">
                                        {savedAtByTopic[topic.id] ? <Tag color="success">已保存</Tag> : <Tag>未保存</Tag>}
                                        <Button size="mini" fill="none" aria-expanded={!isCollapsed} onClick={() => toggleTopicCollapsed(topic.id)}>
                                            {isCollapsed ? <RightOutlined /> : <DownOutlined />}
                                            {isCollapsed ? "展开" : "收起"}
                                        </Button>
                                    </div>
                                </div>
                                <div className="topic-mobile-feedback-topic-body" hidden={isCollapsed}>
                                  <div className="topic-mobile-reference">
                                    <div className="topic-mobile-reference-head">
                                        <strong><PaperClipOutlined /> 参考文件</strong>
                                        <Button size="mini" fill="outline" color="primary" onClick={() => handleReferenceUpload(topic.id)}>
                                            <UploadOutlined /> 上传
                                        </Button>
                                    </div>
                                    <div className="topic-mobile-reference-list">
                                        {(topicFiles[topic.id] || []).map((file) => <a href={file.url} target="_blank" rel="noreferrer" key={file.id}>{file.name}</a>)}
                                    </div>
                                </div>
                                <div className="topic-mobile-feedback-list">
                                    {(topicFeedbackRecords[topic.id] || []).map((item) => (
                                        <article className={`topic-mobile-feedback ${item.role === "manager" ? "is-manager" : "is-leader"}`} key={item.id}>
                                            <div className="topic-mobile-feedback-meta">
                                                <span>{item.role === "manager" ? "管户回复" : "反馈建议"}</span>
                                                <strong>{item.sender}</strong>
                                            </div>
                                            <p>{item.content}</p>
                                            <time>{item.time}</time>
                                        </article>
                                    ))}
                                </div>
                                <div className="topic-mobile-reply-card">
                                    <div className="topic-mobile-reply-meta"><span>本议题反馈建议</span><span>支持语音转文字</span></div>
                                    <TextArea value={topicReplies[topic.id] || ""} onChange={(value) => updateTopicReply(topic.id, value)} placeholder="请输入本议题反馈建议意见" autoSize={{ minRows: 4, maxRows: 8 }} showCount maxLength={500} />
                                    <div className="topic-mobile-voice-actions">
                                        <Button size="small" color={listeningTopicId === topic.id ? "warning" : "primary"} fill={listeningTopicId === topic.id ? "solid" : "outline"} onClick={() => handleSpeechToText(topic.id)}>
                                            <AudioOutlined />{listeningTopicId === topic.id ? "停止识别" : "语音转文字"}
                                        </Button>
                                    </div>
                                    {savedAtByTopic[topic.id] ? <p className="topic-mobile-saved-at">最近保存：{savedAtByTopic[topic.id]}</p> : null}
                                  </div>
                                </div>
                            </article>
                            );
                        })}
                    </div>
                </Section>
            </main>

            <footer className="topic-mobile-actions">
                <Button block size="large" fill="outline" onClick={handleSave}>
                    保存
                </Button>
                <Button block size="large" color="primary" onClick={handleSubmit}>
                    提交
                </Button>
            </footer>
        </div>
    );
}
