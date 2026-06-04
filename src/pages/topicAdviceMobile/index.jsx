import "antd-mobile/es/global";
import {
    AuditOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    FileTextOutlined,
    SendOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import { Button, Collapse, Dialog, Tag, TextArea, Toast } from "antd-mobile";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
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
        categoryLv1Name: "基金管理",
        categoryLv2Name: "基金退出",
        categoryLv3Name: "退出决策",
        toipcName: "关于推进基金退出事项的议案",
        reviewLevel2: "董事会",
        board: true,
        supervisor: false,
        shareholder: true,
    },
    {
        id: "topic-002",
        categoryLv1Name: "公司治理",
        categoryLv2Name: "董事会事项",
        categoryLv3Name: "方案审议",
        toipcName: "关于补充外部董事意见采纳情况的议案",
        reviewLevel2: "集团总办会",
        board: true,
        supervisor: true,
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
    const [replyText, setReplyText] = useState("建议围绕基金退出节奏、董事会审议材料完整性及股东会沟通安排进一步补充说明。");
    const [lastSavedAt, setLastSavedAt] = useState("");
    const enabledMeetings = useMemo(() => meetings.filter((item) => item.enabled), []);
    const conveyCount = useMemo(() => distributionRows.filter((item) => item.hasConvey).length, []);
    const summaryStats = [
        { key: "files", label: "文件", value: smartFiles.length, suffix: "份" },
        { key: "topics", label: "议题", value: topics.length, suffix: "项" },
        { key: "meetings", label: "会议", value: enabledMeetings.length, suffix: "场" },
        { key: "people", label: "传达", value: conveyCount, suffix: "人" },
    ];

    const handleSave = () => {
        if (!stripHtml(replyText)) {
            Toast.show("请填写回复内容后再保存");
            return;
        }
        const savedAt = dayjs().format("YYYY-MM-DD HH:mm:ss");
        setLastSavedAt(savedAt);
        Toast.show("回复内容已保存");
    };

    const handleSubmit = async () => {
        if (!stripHtml(replyText)) {
            Toast.show("请填写回复内容后再提交");
            return;
        }
        const confirmed = await Dialog.confirm({
            title: "确认提交回复？",
            content: "提交后将给对应管护发钉钉消息。",
            confirmText: "确认提交",
            cancelText: "取消",
        });
        if (confirmed) {
            setLastSavedAt(dayjs().format("YYYY-MM-DD HH:mm:ss"));
            Toast.show("提交成功");
        }
    };

    return (
        <div className="topic-mobile-page">
            <header className="topic-mobile-hero">
                <div className="topic-mobile-status">
                    <Tag color="primary" fill="solid">
                        待领导回复
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

                <Section title="议题资料传达" icon={<TeamOutlined />}>
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
                </Section>

                <Section title="领导回复" icon={<SendOutlined />}>
                    <div className="topic-mobile-reply-card">
                        <div className="topic-mobile-reply-meta">
                            <span>回复内容为必填项</span>
                            {lastSavedAt ? <Tag color="success">已保存</Tag> : <Tag>未保存</Tag>}
                        </div>
                        <TextArea
                            value={replyText}
                            onChange={setReplyText}
                            placeholder="请输入领导回复意见"
                            autoSize={{ minRows: 5, maxRows: 8 }}
                            showCount
                            maxLength={500}
                        />
                        {lastSavedAt ? <p className="topic-mobile-saved-at">最近保存：{lastSavedAt}</p> : null}
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
