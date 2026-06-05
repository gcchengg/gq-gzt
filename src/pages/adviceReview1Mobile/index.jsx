import "antd-mobile/es/global";
import {
  AudioOutlined,
  DownOutlined,
  FilePdfOutlined,
  PaperClipOutlined,
  RightOutlined,
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
const adviceTopics = [
  {
    id: "topic-001",
    name: "测试1",
    category:
      "1. 经营类 / 1.3 定期监管报告 / 1.3.1 按国家部委等上级机构监管要求定期报告事项（含反洗钱、反欺诈、重大风险评估、绩效追索扣回、离任审计、内部控制等）",
    meeting: "董事会",
    reviewLevel: "业务总监",
    initialReply: "请填写本议题的表决建议。",
  },
  {
    id: "topic-002",
    name: "测试1",
    category:
      "1. 经营类 / 1.3 定期监管报告 / 1.3.1 按国家部委等上级机构监管要求定期报告事项（含反洗钱、反欺诈、重大风险评估、绩效追索扣回、离任审计、内部控制等）",
    meeting: "董事会",
    reviewLevel: "业务总监",
    initialReply: "请填写本议题的表决建议。",
  },
];
const initialTopicFiles = {
  "topic-001": [
    { id: "advice-reference-001", name: "羿动科技董事会会议材料.pdf", url: pdfUrl },
  ],
  "topic-002": [
    { id: "advice-reference-002", name: "羿动科技临时股东会表决材料.pdf", url: pdfUrl },
  ],
};

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
  const [topicReplies, setTopicReplies] = useState(() =>
    Object.fromEntries(
      adviceTopics.map((topic) => [topic.id, topic.initialReply]),
    ),
  );
  const [topicFiles, setTopicFiles] = useState(initialTopicFiles);
  const [listeningTopicId, setListeningTopicId] = useState("");
  const [uploadTopicId, setUploadTopicId] = useState("");
  const [savedAtByTopic, setSavedAtByTopic] = useState({});
  const [collapsedTopicIds, setCollapsedTopicIds] = useState(() => new Set());
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const appendReplyText = (topicId, text) => {
    const nextText = text.trim();
    if (!nextText) return;
    setTopicReplies((current) => {
      const prefix = current[topicId]?.trim() || "";
      return {
        ...current,
        [topicId]: [prefix, nextText]
          .filter(Boolean)
          .join(prefix ? "\n" : "")
          .slice(0, 500),
      };
    });
  };

  const handleSpeechToText = (topicId) => {
    if (listeningTopicId) {
      recognitionRef.current?.stop();
      return;
    }
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
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

  const getIncompleteTopic = () =>
    adviceTopics.find((topic) => !stripHtml(topicReplies[topic.id] || ""));

  const toggleTopicCollapsed = (topicId) => {
    setCollapsedTopicIds((current) => {
      const next = new Set(current);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  };

  const handleReferenceUpload = (topicId) => {
    setUploadTopicId(topicId);
    fileInputRef.current?.click();
  };

  const handleReferenceFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file || !uploadTopicId) return;
    const nextFile = {
      id: `${uploadTopicId}-${Date.now()}`,
      name: file.name,
      url: URL.createObjectURL(file),
    };
    setTopicFiles((current) => ({
      ...current,
      [uploadTopicId]: [...(current[uploadTopicId] || []), nextFile],
    }));
    event.target.value = "";
    Toast.show(`已上传参考文件：${file.name}`);
  };

  const handleSave = () => {
    const incompleteTopic = getIncompleteTopic();
    if (incompleteTopic) {
      Toast.show(`请填写“${incompleteTopic.name}”的表决建议`);
      return;
    }
    const savedAt = dayjs().format("YYYY-MM-DD HH:mm:ss");
    setSavedAtByTopic(
      Object.fromEntries(adviceTopics.map((topic) => [topic.id, savedAt])),
    );
    Toast.show("各议题表决建议已保存");
  };

  const handleSubmit = async () => {
    const incompleteTopic = getIncompleteTopic();
    if (incompleteTopic) {
      Toast.show(`请填写“${incompleteTopic.name}”的表决建议`);
      return;
    }
    const confirmed = await Dialog.confirm({
      title: "确认提交表决建议？",
      content: `提交后将保存全部 ${adviceTopics.length} 个议题的表决建议。`,
      confirmText: "确认提交",
      cancelText: "取消",
    });
    if (confirmed) {
      const savedAt = dayjs().format("YYYY-MM-DD HH:mm:ss");
      setSavedAtByTopic(
        Object.fromEntries(adviceTopics.map((topic) => [topic.id, savedAt])),
      );
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
        <p className="advice1-mobile-meeting-info">
          <strong>会议信息：</strong>
          羿动新能源科技有限公司羿动科技第二届董事会第六次会议、羿动科技2025第三次临时股东会会会议以通讯表决、通讯表决召开
        </p>
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

        <Section
          title={`董事建议与交办`}
          icon={<SendOutlined />}
        >
          <input
            ref={fileInputRef}
            className="advice1-mobile-file-input"
            type="file"
            onChange={handleReferenceFileChange}
          />
          <div className="advice1-mobile-topic-list">
            {adviceTopics.map((topic, index) => {
              const isCollapsed = collapsedTopicIds.has(topic.id);
              return (
              <article className="advice1-mobile-reply-card" key={topic.id}>
                <div className="advice1-mobile-topic-head">
                  <div className="advice1-mobile-topic-index">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3>{topic.name}</h3>
                    <p>{topic.category}</p>
                  </div>
                  <Button size="mini" fill="none" aria-expanded={!isCollapsed} onClick={() => toggleTopicCollapsed(topic.id)}>
                    {isCollapsed ? <RightOutlined /> : <DownOutlined />}
                    {isCollapsed ? "展开" : "收起"}
                  </Button>
                </div>
                <div className="advice1-mobile-topic-body" hidden={isCollapsed}>
                  <div className="advice1-mobile-reference">
                    <div className="advice1-mobile-reference-head">
                      <strong><PaperClipOutlined /> 参考文件</strong>
                      <Button
                        size="mini"
                        fill="outline"
                        color="primary"
                        onClick={() => handleReferenceUpload(topic.id)}
                      >
                        <UploadOutlined /> 上传
                      </Button>
                    </div>
                    <div className="advice1-mobile-reference-list">
                      {(topicFiles[topic.id] || []).map((file) => (
                        <a href={file.url} target="_blank" rel="noreferrer" key={file.id}>
                          {file.name}
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className="advice1-mobile-reply-meta">
                    <Tag color="primary">{topic.meeting}</Tag>
                    {savedAtByTopic[topic.id] ? (
                      <Tag color="success">已保存</Tag>
                    ) : (
                      <Tag>未保存</Tag>
                    )}
                  </div>
                  <TextArea
                    value={topicReplies[topic.id]}
                    onChange={(value) =>
                      setTopicReplies((current) => ({
                        ...current,
                        [topic.id]: value,
                      }))
                    }
                    placeholder={`请输入“${topic.name}”的表决建议`}
                    autoSize={{ minRows: 4, maxRows: 7 }}
                    showCount
                    maxLength={500}
                  />
                  <div className="advice1-mobile-voice-actions">
                    <Button
                      size="small"
                      color={
                        listeningTopicId === topic.id ? "warning" : "primary"
                      }
                      fill={listeningTopicId === topic.id ? "solid" : "outline"}
                      onClick={() => handleSpeechToText(topic.id)}
                    >
                      <AudioOutlined />
                      {listeningTopicId === topic.id ? "停止识别" : "语音转文字"}
                    </Button>
                  </div>
                  {savedAtByTopic[topic.id] ? (
                    <p className="advice1-mobile-saved-at">
                      最近保存：{savedAtByTopic[topic.id]}
                    </p>
                  ) : null}
                </div>
              </article>
              );
            })}
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
