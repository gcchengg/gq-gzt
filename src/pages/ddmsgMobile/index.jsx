import { useNavigate } from "react-router-dom";
import "./index.css";

const dingTalkMessages = [
    {
        id: "topic-director",
        time: "2026年06月05日 09:16",
        avatarText: "董",
        avatarTone: "blue",
        receiver: "董事端",
        content: "春成总好，议题反馈建议已生成，请您查看会议及议题材料，并填写议题反馈建议。",
        buttonText: "查看详情",
        linkTo: "/TopicAdviceMobile",
    },
    {
        id: "topic-manager",
        time: "2026年06月05日 09:28",
        avatarText: "管",
        avatarTone: "green",
        receiver: "管护端",
        content: "王经理您好，领导已完成议题反馈建议回复，请及时查看回复内容，并补充管护回答。",
        buttonText: "查看详情",
    },
    {
        id: "vote-director",
        time: "2026年06月05日 10:04",
        avatarText: "董",
        avatarTone: "blue",
        receiver: "董事端",
        content: "春成总好，表决建议单已生成，请您查看表决建议单，并填写表决建议。",
        buttonText: "查看详情",
        linkTo: "/adviceReview1Mobile",
    },
    {
        id: "vote-manager",
        time: "2026年06月05日 10:22",
        avatarText: "管",
        avatarTone: "green",
        receiver: "管护端",
        content: "王经理您好，领导已完成表决建议回复，请查看领导意见，并按要求跟进补充材料。",
        buttonText: "查看详情",
    },
];

function DingTalkCard({ message, onOpen }) {
    const canOpen = Boolean(message.linkTo);

    const handleOpen = () => {
        if (canOpen) onOpen(message.linkTo);
    };

    return (
        <article className="ddmsg-mobile-item">
            <div className="ddmsg-mobile-time">{message.time}</div>
            <div className={`ddmsg-mobile-row ${canOpen ? "is-clickable" : ""}`} onClick={handleOpen} role={canOpen ? "button" : undefined} tabIndex={canOpen ? 0 : undefined} onKeyDown={(event) => {
                if (canOpen && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    handleOpen();
                }
            }}>
                <div className={`ddmsg-mobile-avatar ${message.avatarTone}`} aria-label={message.receiver}>
                    <span>{message.avatarText}</span>
                </div>
                <div className="ddmsg-mobile-bubble">
                    <div className="ddmsg-mobile-watermark" aria-hidden="true">
                        <span>钉钉消息</span>
                        <span>钉钉消息</span>
                        <span>钉钉消息</span>
                    </div>
                    <p>{message.content}</p>
                    <button type="button" onClick={(event) => {
                        event.stopPropagation();
                        handleOpen();
                    }}>{message.buttonText}</button>
                </div>
            </div>
        </article>
    );
}

export default function DingTalkMobileMessagesPage() {
    const navigate = useNavigate();

    return (
        <main className="ddmsg-mobile-page">
            <div className="ddmsg-mobile-screen">
                {dingTalkMessages.map((message) => (
                    <DingTalkCard message={message} key={message.id} onOpen={navigate} />
                ))}
            </div>
        </main>
    );
}
