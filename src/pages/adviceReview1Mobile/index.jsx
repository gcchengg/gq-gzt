import "antd-mobile/es/global";
import {
    AudioOutlined,
    CloseOutlined,
    FilePdfOutlined,
    SaveOutlined,
    SendOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import { Button, Dialog, Tag, TextArea, Toast } from "antd-mobile";
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

function Section({ title, icon, children, extra }) {
    return (
        <section className="advice1-mobile-section">
            <div className="advice1-mobile-section-title">
                <span>{icon}</span>
                <h2>{title}</h2>
                {extra}
            </div>
            {children}
        </section>
    );
}

export default function AdviceReview1MobilePage() {
    const [replyText, setReplyText] = useState("建议结合表决建议单内容，补充本次议题的风险提示、表决倾向及后续跟踪要求。");
    const [voiceFiles, setVoiceFiles] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState("");
    const voiceInputRef = useRef(null);
    const voiceUrlRef = useRef([]);
    const recognitionRef = useRef(null);
    const hasReplyContent = stripHtml(replyText) || voiceFiles.length > 0;

    useEffect(() => {
        return () => {
            recognitionRef.current?.stop();
            voiceUrlRef.current.forEach((url) => URL.revokeObjectURL(url));
        };
    }, []);

    const appendReplyText = (text) => {
        const nextText = text.trim();
        if (!nextText) return;
        setReplyText((current) => {
            const prefix = current.trim();
            return [prefix, nextText].filter(Boolean).join(prefix ? "\n" : "").slice(0, 500);
        });
    };

    const handleVoiceUpload = (event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;
        const uploadedFiles = files.map((file) => {
            const url = URL.createObjectURL(file);
            voiceUrlRef.current.push(url);
            return {
                id: `${file.name}-${file.lastModified}-${Date.now()}`,
                name: file.name,
                size: file.size,
                url,
            };
        });
        setVoiceFiles((current) => [...current, ...uploadedFiles]);
        Toast.show(`已上传 ${files.length} 条语音`);
        event.target.value = "";
    };

    const handleRemoveVoice = (id) => {
        setVoiceFiles((current) => {
            const target = current.find((item) => item.id === id);
            if (target?.url) URL.revokeObjectURL(target.url);
            voiceUrlRef.current = voiceUrlRef.current.filter((url) => url !== target?.url);
            return current.filter((item) => item.id !== id);
        });
    };

    const handleSpeechToText = () => {
        if (isListening) {
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
            setIsListening(true);
            Toast.show("正在听取语音");
        };
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map((result) => result[0]?.transcript || "")
                .join("");
            appendReplyText(transcript);
            Toast.show("已转为文字");
        };
        recognition.onerror = () => {
            Toast.show("语音识别失败，请重试");
        };
        recognition.onend = () => {
            setIsListening(false);
            recognitionRef.current = null;
        };
        recognitionRef.current = recognition;
        recognition.start();
    };

    const handleSave = () => {
        if (!hasReplyContent) {
            Toast.show("请填写表决建议或上传语音后再保存");
            return;
        }
        setLastSavedAt(dayjs().format("YYYY-MM-DD HH:mm:ss"));
        Toast.show("表决建议已保存");
    };

    const handleSubmit = async () => {
        if (!hasReplyContent) {
            Toast.show("请填写表决建议或上传语音后再提交");
            return;
        }
        const confirmed = await Dialog.confirm({
            title: "确认提交表决建议？",
            content: "提交后将保存当前文字和语音表决建议。",
            confirmText: "确认提交",
            cancelText: "取消",
        });
        if (confirmed) {
            setLastSavedAt(dayjs().format("YYYY-MM-DD HH:mm:ss"));
            Toast.show("提交成功");
        }
    };

    return (
        <div className="advice1-mobile-page">
            <header className="advice1-mobile-hero">
                <div className="advice1-mobile-status">
                    <Tag color="primary" fill="solid">
                        表决建议单
                    </Tag>
                    <span>SH-2026-004</span>
                </div>
                <h1>表决建议单审阅</h1>
                <p>查看 PDF，并填写文字或语音表决建议。</p>
            </header>

            <main className="advice1-mobile-content">
                <Section
                    title="表决建议单 PDF"
                    icon={<FilePdfOutlined />}
                    extra={
                        <a href={pdfUrl} target="_blank" rel="noreferrer">
                            打开
                        </a>
                    }
                >
                    <div className="advice1-mobile-pdf">
                        <iframe title="表决建议单 PDF" src={pdfUrl} />
                        <img src={pdfPreviewUrl} alt="表决建议单预览" />
                    </div>
                </Section>

                <Section title="表决建议" icon={<SendOutlined />}>
                    <div className="advice1-mobile-reply-card">
                        <div className="advice1-mobile-reply-meta">
                            <span>文字或语音至少填写一项</span>
                            {lastSavedAt ? <Tag color="success">已保存</Tag> : <Tag>未保存</Tag>}
                        </div>
                        <TextArea
                            value={replyText}
                            onChange={setReplyText}
                            placeholder="请输入表决建议"
                            autoSize={{ minRows: 5, maxRows: 8 }}
                            showCount
                            maxLength={500}
                        />
                        <div className="advice1-mobile-voice-actions">
                            <input ref={voiceInputRef} className="advice1-mobile-voice-input" type="file" accept="audio/*" capture="microphone" multiple onChange={handleVoiceUpload} />
                            <Button size="small" fill="outline" onClick={() => voiceInputRef.current?.click()}>
                                <UploadOutlined />
                                上传语音
                            </Button>
                            <Button size="small" color={isListening ? "warning" : "primary"} fill={isListening ? "solid" : "outline"} onClick={handleSpeechToText}>
                                <AudioOutlined />
                                {isListening ? "停止识别" : "语音转文字"}
                            </Button>
                        </div>
                        {voiceFiles.length ? (
                            <div className="advice1-mobile-voice-list">
                                {voiceFiles.map((file) => (
                                    <article className="advice1-mobile-voice-item" key={file.id}>
                                        <div className="advice1-mobile-voice-info">
                                            <AudioOutlined />
                                            <div>
                                                <strong>{file.name}</strong>
                                                <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                            </div>
                                        </div>
                                        <audio controls src={file.url} />
                                        <button type="button" className="advice1-mobile-voice-remove" onClick={() => handleRemoveVoice(file.id)} aria-label={`移除${file.name}`}>
                                            <CloseOutlined />
                                        </button>
                                    </article>
                                ))}
                            </div>
                        ) : null}
                        {lastSavedAt ? <p className="advice1-mobile-saved-at">最近保存：{lastSavedAt}</p> : null}
                    </div>
                </Section>
            </main>

            <footer className="advice1-mobile-actions">
                <Button block size="large" fill="outline" onClick={handleSave}>
                    <SaveOutlined />
                    保存
                </Button>
                <Button block size="large" color="primary" onClick={handleSubmit}>
                    <SendOutlined />
                    提交
                </Button>
            </footer>
        </div>
    );
}
