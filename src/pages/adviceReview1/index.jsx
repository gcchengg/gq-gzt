import "antd/dist/reset.css";
import {
    BoldOutlined,
    DownOutlined,
    FilePdfOutlined,
    ItalicOutlined,
    LinkOutlined,
    OrderedListOutlined,
    RightOutlined,
    SaveOutlined,
    SendOutlined,
    UnorderedListOutlined,
} from "@ant-design/icons";
import { Button, Modal, Tag, message } from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import "./index.css";

const pdfUrl = "/advice-review/6a2133fde4b0cb6abf664a41.pdf";
const pdfPreviewUrl = "/advice-review/6a2133fde4b0cb6abf664a41.pdf.png";
const adviceTopics = [
    {
        id: "topic-001",
        name: "测试1",
        category: "1. 经营类 / 1.3 定期监管报告 / 1.3.1 按国家部委等上级机构监管要求定期报告事项（含反洗钱、反欺诈、重大风险评估、绩效追索扣回、离任审计、内部控制等）",
        meeting: "董事会",
        reviewLevel: "业务总监",
        initialReply: "<p>请填写本议题的表决建议。</p>",
    },
    {
        id: "topic-002",
        name: "测试1",
        category: "1. 经营类 / 1.3 定期监管报告 / 1.3.1 按国家部委等上级机构监管要求定期报告事项（含反洗钱、反欺诈、重大风险评估、绩效追索扣回、离任审计、内部控制等）",
        meeting: "董事会",
        reviewLevel: "业务总监",
        initialReply: "<p>请填写本议题的表决建议。</p>",
    },
];

const stripHtml = (value) =>
    value
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();

function RichTextEditor({ value, onChange }) {
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
        if (url) exec("createLink", url);
    };

    return (
        <div className="advice1-rich-editor">
            <div className="advice1-toolbar">
                <Button title="加粗" icon={<BoldOutlined />} onClick={() => exec("bold")} />
                <Button title="斜体" icon={<ItalicOutlined />} onClick={() => exec("italic")} />
                <Button title="无序列表" icon={<UnorderedListOutlined />} onClick={() => exec("insertUnorderedList")} />
                <Button title="有序列表" icon={<OrderedListOutlined />} onClick={() => exec("insertOrderedList")} />
                <Button title="插入链接" icon={<LinkOutlined />} onClick={addLink} />
            </div>
            <div
                ref={editorRef}
                className="advice1-rich-body"
                contentEditable
                data-placeholder="请输入表决建议说明，可使用上方工具进行简单排版"
                onInput={(event) => onChange(event.currentTarget.innerHTML)}
                onBlur={(event) => onChange(event.currentTarget.innerHTML)}
                suppressContentEditableWarning
            />
        </div>
    );
}

export default function AdviceReview1Page() {
    const [messageApi, messageContextHolder] = message.useMessage();
    const [topicReplies, setTopicReplies] = useState(() => Object.fromEntries(adviceTopics.map((topic) => [topic.id, topic.initialReply])));
    const [savedAtByTopic, setSavedAtByTopic] = useState({});
    const [collapsedTopicIds, setCollapsedTopicIds] = useState(() => new Set());
    const [submitOpen, setSubmitOpen] = useState(false);

    const getIncompleteTopic = () => adviceTopics.find((topic) => !stripHtml(topicReplies[topic.id] || ""));

    const toggleTopicCollapsed = (topicId) => {
        setCollapsedTopicIds((current) => {
            const next = new Set(current);
            if (next.has(topicId)) next.delete(topicId);
            else next.add(topicId);
            return next;
        });
    };

    const handleSave = () => {
        const incompleteTopic = getIncompleteTopic();
        if (incompleteTopic) {
            messageApi.error(`请填写“${incompleteTopic.name}”的表决建议`);
            return;
        }
        const savedAt = dayjs().format("YYYY-MM-DD HH:mm:ss");
        setSavedAtByTopic(Object.fromEntries(adviceTopics.map((topic) => [topic.id, savedAt])));
        messageApi.success("各议题表决建议已保存");
    };

    const handleSubmit = () => {
        const incompleteTopic = getIncompleteTopic();
        if (incompleteTopic) {
            messageApi.error(`请填写“${incompleteTopic.name}”的表决建议`);
            return;
        }
        setSubmitOpen(true);
    };

    const handleConfirmSubmit = () => {
        setSubmitOpen(false);
        const savedAt = dayjs().format("YYYY-MM-DD HH:mm:ss");
        setSavedAtByTopic(Object.fromEntries(adviceTopics.map((topic) => [topic.id, savedAt])));
        messageApi.success("提交成功");
    };

    return (
        <div className="advice1-page">
            {messageContextHolder}
            <header className="advice1-header">
                <div>
                    <span className="advice1-kicker">
                        <FilePdfOutlined />
                        表决建议单
                    </span>
                    <h1>表决建议单审阅</h1>
                    <p>查看表决建议单 PDF，并按议题分别填写富文本表决建议。</p>
                </div>
                <Tag color="processing">待填写</Tag>
            </header>

            <main className="advice1-content">
                <section className="advice1-card advice1-pdf-card">
                    <div className="advice1-section-head">
                        <h2>表决建议单 PDF</h2>
                        <a href={pdfUrl} target="_blank" rel="noreferrer">
                            打开原文件
                        </a>
                    </div>
                    <object className="advice1-pdf-viewer" data={pdfUrl} type="application/pdf" aria-label="表决建议单 PDF">
                        <img src={pdfPreviewUrl} alt="表决建议单预览" />
                    </object>
                </section>

                <section className="advice1-card advice1-editor-card">
                    <div className="advice1-section-head">
                        <div>
                            <h2>建议反馈</h2>
                            <p>共 {adviceTopics.length} 个议题，每个议题均需单独回复。</p>
                        </div>
                        <Tag color="processing">{adviceTopics.length} 个议题</Tag>
                    </div>
                    <div className="advice1-topic-list">
                        {adviceTopics.map((topic, index) => {
                            const isCollapsed = collapsedTopicIds.has(topic.id);
                            return (
                            <article className="advice1-topic-item" key={topic.id}>
                                <div className="advice1-topic-head">
                                    <div className="advice1-topic-index">{String(index + 1).padStart(2, "0")}</div>
                                    <div className="advice1-topic-title">
                                        <h3>{topic.name}</h3>
                                        <p>{topic.category}</p>
                                    </div>
                                    <div className="advice1-topic-tags">
                                        <Tag color="blue">{topic.meeting}</Tag>
                                        <Tag color="processing">{topic.reviewLevel}</Tag>
                                        {savedAtByTopic[topic.id] ? <Tag color="success">已保存</Tag> : <Tag>未保存</Tag>}
                                        <Button type="text" size="small" icon={isCollapsed ? <RightOutlined /> : <DownOutlined />} aria-expanded={!isCollapsed} onClick={() => toggleTopicCollapsed(topic.id)}>
                                            {isCollapsed ? "展开" : "收起"}
                                        </Button>
                                    </div>
                                </div>
                                <div className="advice1-topic-body" hidden={isCollapsed}>
                                    <RichTextEditor
                                        value={topicReplies[topic.id]}
                                        onChange={(value) => setTopicReplies((current) => ({ ...current, [topic.id]: value }))}
                                    />
                                    {savedAtByTopic[topic.id] ? <p className="advice1-topic-saved">最近保存：{savedAtByTopic[topic.id]}</p> : null}
                                </div>
                            </article>
                            );
                        })}
                    </div>
                </section>
            </main>

            <footer className="advice1-actions">
                <Button icon={<SaveOutlined />} onClick={handleSave}>
                    保存
                </Button>
                <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit}>
                    提交
                </Button>
            </footer>

            <Modal title="确认提交表决建议？" open={submitOpen} okText="确认提交" cancelText="取消" onOk={handleConfirmSubmit} onCancel={() => setSubmitOpen(false)}>
                <p>提交后将保存全部 {adviceTopics.length} 个议题的表决建议内容。</p>
            </Modal>
        </div>
    );
}
