import "antd/dist/reset.css";
import {
    BoldOutlined,
    FilePdfOutlined,
    ItalicOutlined,
    LinkOutlined,
    OrderedListOutlined,
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
    const [replyHtml, setReplyHtml] = useState("<p>建议结合表决建议单内容，补充本次议题的风险提示、表决倾向及后续跟踪要求。</p>");
    const [lastSavedAt, setLastSavedAt] = useState("");
    const [submitOpen, setSubmitOpen] = useState(false);

    const handleSave = () => {
        if (!stripHtml(replyHtml)) {
            messageApi.error("请填写表决建议内容后再保存");
            return;
        }
        const savedAt = dayjs().format("YYYY-MM-DD HH:mm:ss");
        setLastSavedAt(savedAt);
        messageApi.success("表决建议已保存");
    };

    const handleSubmit = () => {
        if (!stripHtml(replyHtml)) {
            messageApi.error("请填写表决建议内容后再提交");
            return;
        }
        setSubmitOpen(true);
    };

    const handleConfirmSubmit = () => {
        setSubmitOpen(false);
        setLastSavedAt(dayjs().format("YYYY-MM-DD HH:mm:ss"));
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
                    <p>查看表决建议单 PDF，并在下方填写富文本表决建议。</p>
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
                            <h2>表决建议</h2>
                            <p>支持基础富文本排版，内容为必填项。</p>
                        </div>
                        {lastSavedAt ? <Tag color="success">已保存 {lastSavedAt}</Tag> : <Tag>未保存</Tag>}
                    </div>
                    <RichTextEditor value={replyHtml} onChange={setReplyHtml} />
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
                <p>提交后将保存当前富文本表决建议内容。</p>
            </Modal>
        </div>
    );
}
