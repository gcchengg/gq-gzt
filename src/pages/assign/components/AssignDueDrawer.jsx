import { Button, Descriptions, Drawer, Empty, Input, Steps, Tabs, Tag, Timeline, message } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import AssignExecution from "./AssignExecution";
import CompanyReview from "./CompanyReview";
import SubmitDrawer from "./SubmitDrawer";
import VoteSuggest from "./VoteSuggest";
import { getOtherInfo, getStatusText, getVoteList, sanhuiProgStatus, sanhuiStatusAvailable, } from "../mockApi";
import "./AssignDueDrawer.css";
const tabStatusMap = {
    "12000": "1",
    "13000": "1",
    "14000": "2",
    "15000": "3",
    "16000": "4",
    "17000": "5",
    "18000": "6",
    "19000": "7",
    "99999": "3",
};
const tabStepThreshold = {
    "1": 13000,
    "2": 14000,
    "3": 15000,
    "4": 16000,
    "5": 17000,
    "6": 18000,
    "7": 19000,
};
const directorFeedbackRecords = [
    {
        id: "feedback-001",
        role: "leader",
        sender: "张总",
        time: "2026-04-24 09:18",
        content: "请补充基金退出方案中交易对手资信情况，以及本次退出对年度收益目标的影响测算。",
    },
    {
        id: "feedback-002",
        role: "manager",
        sender: "股权运营部 王明",
        time: "2026-04-24 10:06",
        content: "已收到，管护团队正在补充资信核查表和收益测算口径，预计今日 16:00 前完成材料更新。",
    },
    {
        id: "feedback-003",
        role: "leader",
        sender: "李董",
        time: "2026-04-24 14:32",
        content: "请同步说明是否涉及其他股东优先购买权，以及法律合规部是否已出具书面意见。",
    },
    {
        id: "feedback-004",
        role: "manager",
        sender: "法律合规部 李娜",
        time: "2026-04-24 15:11",
        content: "已核对章程及投资协议，不触发其他股东优先购买权。书面意见已随补充材料上传。",
    },
];
const voteFeedbackRecords = [
    {
        id: "vote-feedback-001",
        role: "leader",
        sender: "张总",
        time: "2026-04-25 09:42",
        content: "表决建议中请明确本次基金退出的表决倾向，并补充收益测算依据和风险兜底安排。",
    },
    {
        id: "vote-feedback-002",
        role: "manager",
        sender: "股权运营部 王明",
        time: "2026-04-25 10:18",
        content: "已收到，表决倾向拟调整为建议同意，并同步补充收益测算底稿及风险处置预案。",
    },
    {
        id: "vote-feedback-003",
        role: "leader",
        sender: "李董",
        time: "2026-04-25 14:05",
        content: "请在表决建议单中说明是否需要附带授权条件，避免后续执行口径不一致。",
    },
    {
        id: "vote-feedback-004",
        role: "manager",
        sender: "法律合规部 李娜",
        time: "2026-04-25 15:26",
        content: "已补充授权条件：交易价格、付款节点及协议签署文本需经法务复核后方可执行。",
    },
];
function FeedbackChat({ title, records, draft, onDraftChange, onSend, status = "沟通中" }) {
    return (<div className="assign-feedback-chat">
      <div className="assign-feedback-chat-head">
        <div>
          <h3>{title}</h3>
          <p>左侧为领导返回，右侧为管护回复。</p>
        </div>
        <Tag color="processing">{status}</Tag>
      </div>
      <div className="assign-feedback-chat-body">
        {records.map((item) => (<div className={`assign-feedback-row ${item.role === "manager" ? "is-manager" : "is-leader"}`} key={item.id}>
            <div className="assign-feedback-meta">
              <span>{item.role === "manager" ? "管护回复" : "领导返回"}</span>
              <strong>{item.sender}</strong>
              <em>{item.time}</em>
            </div>
            <div className="assign-feedback-bubble">{item.content}</div>
          </div>))}
      </div>
      <div className="assign-feedback-reply">
        <Input.TextArea value={draft} onChange={(event) => onDraftChange(event.target.value)} placeholder="请输入管护回复内容" autoSize={{ minRows: 3, maxRows: 5 }} maxLength={500} showCount/>
        <div className="assign-feedback-reply-actions">
          <Button type="primary" onClick={onSend}>
            发送管护回复
          </Button>
        </div>
      </div>
    </div>);
}
function StagePlaceholder({ title, projectData, status, }) {
    return (<div className="assign-stage-card">
      <Descriptions bordered size="small" column={2} title={title}>
        <Descriptions.Item label="参股公司">{projectData.companyName}</Descriptions.Item>
        <Descriptions.Item label="统一社会信用代码">
          {projectData.companyCreditCode}
        </Descriptions.Item>
        <Descriptions.Item label="会议及议题编码">{projectData.mgmtNo}</Descriptions.Item>
        <Descriptions.Item label="当前状态">
          <Tag color="processing">{getStatusText(status)}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="议题名称">{projectData.topicName}</Descriptions.Item>
        <Descriptions.Item label="会议名称">{projectData.meetingName}</Descriptions.Item>
      </Descriptions>
      <Timeline className="assign-stage-timeline" items={[
            { color: "green", children: "材料完整性检查已完成" },
            { color: "blue", children: "相关部门意见已汇总" },
            { color: "gray", children: "当前新项目使用本地假数据展示，无后端接口请求" },
        ]}/>
    </div>);
}
export default function AssignDueDrawer({ id, record, editStatus, progStatus, onCloseDetail, }) {
    const [projectData, setProjectData] = useState({});
    const [firstActiveKey, setFirstActiveKey] = useState(tabStatusMap[String(progStatus)] || "7");
    const [voteOpen, setVoteOpen] = useState(false);
    const [meetingOpen, setMeetingOpen] = useState(false);
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [voteList, setVoteList] = useState([]);
    const [topicFeedbackRecords, setTopicFeedbackRecords] = useState(directorFeedbackRecords);
    const [voteFeedbackRecordsState, setVoteFeedbackRecordsState] = useState(voteFeedbackRecords);
    const [feedbackDrafts, setFeedbackDrafts] = useState({ topic: "", vote: "" });
    const currentStep = String(progStatus) === "99999" ? "15000" : String(progStatus);
    useEffect(() => {
        getOtherInfo({ id }).then((res) => setProjectData(res.data));
        getVoteList().then((res) => setVoteList(res.data || []));
        sanhuiStatusAvailable();
    }, [id]);
    useEffect(() => {
        setFirstActiveKey(tabStatusMap[String(progStatus)] || "7");
    }, [progStatus]);
    const isTabDisabled = (key) => {
        const statusNumber = Number(currentStep);
        return statusNumber < tabStepThreshold[key];
    };
    const stepItems = useMemo(() => sanhuiProgStatus
        .filter((item) => item.value !== "99999")
        .map((item) => ({
        key: item.value,
        title: item.text,
        description: Number(item.value) < Number(currentStep)
            ? "已完成"
            : Number(item.value) === Number(currentStep)
                ? "当前节点"
                : "待处理",
    })), [currentStep]);
    const updateFeedbackDraft = (key, value) => {
        setFeedbackDrafts((current) => ({ ...current, [key]: value }));
    };
    const sendFeedbackReply = (key) => {
        const content = feedbackDrafts[key]?.trim();
        if (!content) {
            message.warning("请输入管护回复内容");
            return;
        }
        const nextRecord = {
            id: `${key}-feedback-${Date.now()}`,
            role: "manager",
            sender: "管护 王明",
            time: dayjs().format("YYYY-MM-DD HH:mm"),
            content,
        };
        if (key === "topic") {
            setTopicFeedbackRecords((current) => [...current, nextRecord]);
        }
        else {
            setVoteFeedbackRecordsState((current) => [...current, nextRecord]);
        }
        updateFeedbackDraft(key, "");
        message.success("管护回复已添加");
    };
    const tabItems = [
        {
            key: "1",
            label: "议题提报",
            children: (<SubmitDrawer id={id} editStatus={editStatus} progStatus={progStatus} projectData={projectData}/>),
        },
        {
            key: "2",
            label: "议题评估",
            disabled: isTabDisabled("2"),
            children: <StagePlaceholder title="议题评估" projectData={projectData} status={progStatus}/>,
        },
        {
            key: "3",
            label: "议题审核",
            disabled: isTabDisabled("3"),
            children: (<CompanyReview projectId={id} isEdit={editStatus !== "detail" && String(progStatus) !== "99999"} projectData={projectData} onClosed={onCloseDetail}/>),
        },
        {
            key: "4",
            label: "表决建议",
            disabled: isTabDisabled("4"),
            children: (<VoteSuggest id={id} editStatus={editStatus} onCloseDetail={onCloseDetail} disabled={String(progStatus) === "99999"}/>),
        },
        {
            key: "5",
            label: "专题汇报",
            disabled: isTabDisabled("5"),
            children: <StagePlaceholder title="专题汇报" projectData={projectData} status={progStatus}/>,
        },
        {
            key: "6",
            label: "三会表决",
            disabled: isTabDisabled("6"),
            children: <StagePlaceholder title="三会表决" projectData={projectData} status={progStatus}/>,
        },
        {
            key: "7",
            label: "决策执行",
            disabled: isTabDisabled("7"),
            children: (<AssignExecution id={id} record={record} editStatus={editStatus === "edit"} onCloseDetail={onCloseDetail}/>),
        },
    ];
    return (<div className="assign-due">
      <div className="assign-due-steps">
        <Steps size="small" current={sanhuiProgStatus.findIndex((item) => item.value === currentStep)} labelPlacement="vertical" items={stepItems}/>
      </div>
      <div className="assign-due-tabs">
        <Tabs activeKey={firstActiveKey} onChange={setFirstActiveKey} items={tabItems}/>
        {firstActiveKey !== "1" ? (<div className="assign-action-group">
            <Button type="primary" onClick={() => setFeedbackOpen(true)}>
              董事反馈记录
            </Button>
            <Button type="primary" onClick={() => setMeetingOpen(true)}>
              一汽股权会议纪要
            </Button>
            <Button type="primary" onClick={() => setVoteOpen(true)}>
              投票结果
            </Button>
            <Button type="primary" onClick={() => message.info("表决授权使用假数据展示")}>
              表决授权
            </Button>
            <Button type="primary" onClick={() => message.info("用印申请使用假数据展示")}>
              用印申请
            </Button>
          </div>) : null}
      </div>

      <Drawer title="议题投票" open={voteOpen} width={720} onClose={() => setVoteOpen(false)} destroyOnClose>
        {voteList.length > 0 ? (voteList.map((item) => (<Descriptions bordered size="middle" column={1} labelStyle={{ width: 160 }} className="assign-vote-desc" key={item.id}>
              <Descriptions.Item label="投票人">{item.userName}</Descriptions.Item>
              <Descriptions.Item label="计划投票日">
                {item.voteTime ? dayjs(item.voteTime).format("YYYY-MM-DD") : ""}
              </Descriptions.Item>
              <Descriptions.Item label="投票方式">
                {item.voteMethod === "100" ? "现场表决" : "网络投票"}
              </Descriptions.Item>
            </Descriptions>))) : (<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="尚未有投票数据"/>)}
      </Drawer>

      <Drawer title="董事反馈记录" open={feedbackOpen} width={720} onClose={() => setFeedbackOpen(false)} destroyOnClose>
        <Tabs className="assign-feedback-tabs" defaultActiveKey="topic" items={[
            {
                key: "topic",
                label: "议题建议反馈",
                children: (<FeedbackChat title={projectData.topicName || "关于推进基金退出事项的议案"} records={topicFeedbackRecords} draft={feedbackDrafts.topic} onDraftChange={(value) => updateFeedbackDraft("topic", value)} onSend={() => sendFeedbackReply("topic")}/>),
            },
            {
                key: "vote",
                label: "表决建议反馈",
                children: (<FeedbackChat title="表决建议单反馈记录" records={voteFeedbackRecordsState} draft={feedbackDrafts.vote} onDraftChange={(value) => updateFeedbackDraft("vote", value)} onSend={() => sendFeedbackReply("vote")}/>),
            },
        ]}/>
      </Drawer>

      <Drawer title="一汽股权会议纪要" open={meetingOpen} width={760} onClose={() => setMeetingOpen(false)} destroyOnClose footer={<div className="assign-meeting-footer">
            <Button type="primary" onClick={() => message.success("会议纪要已保存到本地假数据")}>
              保存
            </Button>
            <Button onClick={() => message.success("已生成假数据下载任务")}>合并下载纪要</Button>
          </div>}>
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label="会议名称">{projectData.meetingName}</Descriptions.Item>
          <Descriptions.Item label="纪要摘要">
            会议审议通过相关议题，要求责任部门按期推进决策执行，并形成闭环反馈。
          </Descriptions.Item>
          <Descriptions.Item label="参会范围">
            股权运营部、财务管理部、法律合规部及参股公司代表
          </Descriptions.Item>
        </Descriptions>
      </Drawer>
    </div>);
}
