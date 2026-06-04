import { Button, Card, Descriptions, Form, Input, Modal, Radio, Select, Space, Table, Tabs, Tag, Timeline, Upload, message, } from "antd";
import { InboxOutlined, UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import "./CompanyReview.css";
const tabLabels = [
    { key: "0", label: "文件替换" },
    { key: "1", label: "议题初审问答" },
    { key: "2", label: "前置任务确认" },
    { key: "3", label: "审批材料准备" },
    { key: "8", label: "提请部务会" },
    { key: "4", label: "议题审批" },
    { key: "5", label: "联审意见确认" },
    { key: "6", label: "会后材料替换" },
    { key: "7", label: "总办会会议纪要" },
];
const initialFiles = [
    {
        id: "file-001",
        fileName: "基金退出决策议案.pdf",
        fileType: "议案正文",
        created: "2026-04-22 09:30:00",
        relatedTopic: "关于推进基金退出事项的议案",
    },
    {
        id: "file-002",
        fileName: "外部董事意见采纳情况说明.docx",
        fileType: "说明材料",
        created: "2026-04-23 14:12:18",
        relatedTopic: "关于补充外部董事意见采纳情况的议案",
    },
    {
        id: "file-003",
        fileName: "基金退出风险评估报告.xlsx",
        fileType: "测算材料",
        created: "2026-04-24 10:05:41",
        relatedTopic: "关于推进基金退出事项的议案",
    },
];
const initialQuestions = [
    {
        id: "qa-001",
        topicName: "关于推进基金退出事项的议案",
        orgName: "法律合规部",
        userFullName: "赵鹏",
        updated: "2026-04-25 16:30:00",
        state: "0",
        question: "请补充交易对手合规审查结论。",
        messages: [
            {
                id: "msg-001",
                type: "question",
                userName: "赵鹏",
                content: "请补充交易对手合规审查结论。",
                time: "2026-04-25 16:30",
            },
            {
                id: "msg-002",
                type: "answer",
                userName: "王明",
                content: "已联系法务顾问补充审查意见，预计明日上传。",
                time: "2026-04-25 17:20",
            },
        ],
    },
    {
        id: "qa-002",
        topicName: "关于补充外部董事意见采纳情况的议案",
        orgName: "财务管理部",
        userFullName: "李娜",
        updated: "2026-04-26 10:08:00",
        state: "1",
        question: "请说明测算假设是否与预算口径一致。",
        messages: [
            {
                id: "msg-003",
                type: "question",
                userName: "李娜",
                content: "请说明测算假设是否与预算口径一致。",
                time: "2026-04-26 10:08",
            },
            {
                id: "msg-004",
                type: "answer",
                userName: "张华",
                content: "测算口径已按财务预算模型更新，详见附件第 3 页。",
                time: "2026-04-26 11:12",
            },
        ],
    },
];
const initialPreTasks = [
    { id: "task-001", taskName: "法律合规审查", deptName: "法律合规部", executor: "赵鹏", status: "1" },
    { id: "task-002", taskName: "财务测算复核", deptName: "财务管理部", executor: "李娜", status: "1" },
    { id: "task-003", taskName: "风险评估确认", deptName: "审计风控部", executor: "周静", status: "0" },
];
const initialApprovalRows = [
    {
        id: "approval-001",
        nodeName: "部门负责人审核",
        deptName: "股权运营部",
        userName: "陈晨",
        result: "approved",
        opinion: "材料完整，建议提交联审。",
        updated: "2026-04-27 09:20",
    },
    {
        id: "approval-002",
        nodeName: "法律合规复核",
        deptName: "法律合规部",
        userName: "赵鹏",
        result: "pending",
        opinion: "等待补充交易对手合规审查结论。",
        updated: "2026-04-27 11:05",
    },
    {
        id: "approval-003",
        nodeName: "分管领导审批",
        deptName: "公司领导",
        userName: "刘洋",
        result: "pending",
        opinion: "-",
        updated: "-",
    },
];
const initialJointOpinions = [
    {
        id: "joint-001",
        deptName: "财务管理部",
        reviewer: "李娜",
        opinion: "测算假设与预算口径一致，建议通过。",
        status: "confirmed",
    },
    {
        id: "joint-002",
        deptName: "法律合规部",
        reviewer: "赵鹏",
        opinion: "需补充交易对手合规审查结论。",
        status: "waiting",
    },
    {
        id: "joint-003",
        deptName: "审计风控部",
        reviewer: "周静",
        opinion: "风险提示已纳入议案附件。",
        status: "confirmed",
    },
];
const resultColor = {
    pending: "processing",
    approved: "success",
    rejected: "error",
};
function ReviewHeader({ projectData }) {
    return (<Card className="review-summary" size="small">
      <Descriptions size="small" column={3}>
        <Descriptions.Item label="参股公司">
          {projectData.companyName || "一汽股权投资（天津）有限公司"}
        </Descriptions.Item>
        <Descriptions.Item label="会议及议题编码">
          {projectData.mgmtNo || "GQ-SH-2026-031"}
        </Descriptions.Item>
        <Descriptions.Item label="当前环节">
          <Tag color="gold">议题审核</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="议题名称">
          {projectData.topicName || "关于推进基金退出事项的议案"}
        </Descriptions.Item>
        <Descriptions.Item label="会议名称">
          {projectData.meetingName || "2026年第4次董事会"}
        </Descriptions.Item>
        <Descriptions.Item label="资料状态">
          <Tag color="processing">待联审确认</Tag>
        </Descriptions.Item>
      </Descriptions>
    </Card>);
}
function FilesReplacePanel({ isEdit }) {
    const [files, setFiles] = useState(initialFiles);
    const [selectedTopicIds, setSelectedTopicIds] = useState([]);
    const fileColumns = [
        { title: "序号", width: 64, render: (_value, _row, index) => index + 1 },
        {
            title: "附件名称",
            dataIndex: "fileName",
            ellipsis: true,
            render: (value) => <a href="#">{value}</a>,
        },
        { title: "附件类型", dataIndex: "fileType", width: 130 },
        { title: "关联议题", dataIndex: "relatedTopic", width: 280, ellipsis: true },
        { title: "上传时间", dataIndex: "created", width: 180 },
        {
            title: "操作",
            width: 140,
            render: (_value, record) => (<Space>
          <Upload disabled={!isEdit} showUploadList={false} beforeUpload={(file) => {
                    setFiles((current) => current.map((item) => item.id === record.id
                        ? {
                            ...item,
                            fileName: file.name,
                            created: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                        }
                        : item));
                    message.success("附件已替换到本地假数据");
                    return false;
                }}>
            <Button type="link" disabled={!isEdit}>
              替换
            </Button>
          </Upload>
          <Button type="link" danger disabled={!isEdit} onClick={() => setFiles((current) => current.filter((item) => item.id !== record.id))}>
            删除
          </Button>
        </Space>),
        },
    ];
    const topicColumns = [
        { title: "序号", width: 64, render: (_value, _row, index) => index + 1 },
        { title: "议题名称", dataIndex: "toipcName" },
    ];
    return (<div className="review-panel">
      <div className="review-toolbar">
        <Upload disabled={!isEdit} multiple showUploadList={false} beforeUpload={(file) => {
            setFiles((current) => [
                {
                    id: `file-${Date.now()}`,
                    fileName: file.name,
                    fileType: "补充材料",
                    relatedTopic: "关于推进基金退出事项的议案",
                    created: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                },
                ...current,
            ]);
            message.success("附件已加入本地假数据");
            return false;
        }}>
          <Button icon={<UploadOutlined />} type="primary" disabled={!isEdit}>
            批量上传附件
          </Button>
        </Upload>
        <Button disabled={!isEdit || selectedTopicIds.length === 0} onClick={() => message.success("已将选中议题与附件建立本地关联")}>
          关联选中议题
        </Button>
      </div>
      <div className="review-files-layout">
        <Table rowKey="id" columns={fileColumns} dataSource={files} pagination={false} size="small" scroll={{ x: 1000 }}/>
        <Card title="议题列表" size="small" className="review-topic-card">
          <Table rowKey="id" columns={topicColumns} dataSource={[
            { id: "topic-001", toipcName: "关于推进基金退出事项的议案" },
            { id: "topic-002", toipcName: "关于补充外部董事意见采纳情况的议案" },
        ]} pagination={false} size="small" rowSelection={{
            selectedRowKeys: selectedTopicIds,
            onChange: setSelectedTopicIds,
        }}/>
        </Card>
      </div>
    </div>);
}
function QuestionsPanel({ isEdit, onCountChange, }) {
    const [questions, setQuestions] = useState(initialQuestions);
    const [selectedId, setSelectedId] = useState(initialQuestions[0]?.id);
    const [answer, setAnswer] = useState("");
    const [addOpen, setAddOpen] = useState(false);
    const [form] = Form.useForm();
    const selectedQuestion = questions.find((item) => item.id === selectedId) || questions[0];
    const questionColumns = [
        { title: "序号", width: 56, render: (_value, _row, index) => index + 1 },
        { title: "议题名称", dataIndex: "topicName", width: 180, ellipsis: true },
        { title: "提问部门", dataIndex: "orgName", width: 120 },
        { title: "提问人", dataIndex: "userFullName", width: 90 },
        { title: "最后更新时间", dataIndex: "updated", width: 150 },
        {
            title: "状态",
            dataIndex: "state",
            width: 90,
            render: (value) => {
                const config = {
                    "0": { color: "warning", text: "待回答" },
                    "1": { color: "processing", text: "已回答" },
                    "2": { color: "success", text: "结束" },
                }[String(value)] || { color: "default", text: "-" };
                return <Tag color={config.color}>{config.text}</Tag>;
            },
        },
        { title: "提问内容", dataIndex: "question", ellipsis: true },
    ];
    const addMessage = (type) => {
        if (!answer.trim() || !selectedQuestion)
            return;
        setQuestions((current) => current.map((item) => item.id === selectedQuestion.id
            ? {
                ...item,
                state: type === "answer" ? "1" : item.state,
                updated: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                messages: [
                    ...item.messages,
                    {
                        id: `msg-${Date.now()}`,
                        type,
                        userName: type === "answer" ? "当前处理人" : "当前提问人",
                        content: answer,
                        time: dayjs().format("YYYY-MM-DD HH:mm"),
                    },
                ],
            }
            : item));
        setAnswer("");
    };
    const endQuestion = () => {
        if (!selectedQuestion)
            return;
        setQuestions((current) => current.map((item) => (item.id === selectedQuestion.id ? { ...item, state: "2" } : item)));
        onCountChange(questions.filter((item) => item.id !== selectedQuestion.id && item.state !== "2").length);
        message.success("已结束提问");
    };
    return (<div className="question-layout">
      <div className="question-left">
        <div className="question-head">
          <strong>问答列表</strong>
          <Button type="primary" disabled={!isEdit} onClick={() => setAddOpen(true)}>
            新增提问
          </Button>
        </div>
        <Table rowKey="id" columns={questionColumns} dataSource={questions} size="small" pagination={false} scroll={{ x: 860, y: 420 }} rowSelection={{
            type: "radio",
            selectedRowKeys: selectedId ? [selectedId] : [],
            onChange: (keys) => setSelectedId(String(keys[0])),
        }}/>
      </div>
      <div className="question-right">
        <div className="question-detail-title">{selectedQuestion?.topicName || "问答详情"}</div>
        <div className="question-message-list">
          {selectedQuestion?.messages.map((item) => (<div className={`question-message ${item.type}`} key={item.id}>
              <div className="question-message-meta">
                <span>{item.userName}</span>
                <span>{item.time}</span>
              </div>
              <div>{item.content}</div>
            </div>))}
        </div>
        <Input.TextArea rows={4} value={answer} disabled={!isEdit || selectedQuestion?.state === "2"} placeholder="请输入提问或回答内容" onChange={(event) => setAnswer(event.target.value)}/>
        <div className="question-actions">
          <Button disabled={!isEdit} onClick={() => addMessage("question")}>
            追问
          </Button>
          <Button type="primary" disabled={!isEdit} onClick={() => addMessage("answer")}>
            回答
          </Button>
          <Button danger disabled={!isEdit} onClick={endQuestion}>
            结束提问
          </Button>
        </div>
      </div>
      <Modal title="新增提问" open={addOpen} onCancel={() => setAddOpen(false)} onOk={() => {
            form.validateFields().then((values) => {
                const nextQuestion = {
                    id: `qa-${Date.now()}`,
                    topicName: values.topicName,
                    orgName: values.orgName,
                    userFullName: "当前用户",
                    updated: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    state: "0",
                    question: values.question,
                    messages: [
                        {
                            id: `msg-${Date.now()}`,
                            type: "question",
                            userName: "当前用户",
                            content: values.question,
                            time: dayjs().format("YYYY-MM-DD HH:mm"),
                        },
                    ],
                };
                setQuestions((current) => [nextQuestion, ...current]);
                setSelectedId(nextQuestion.id);
                onCountChange(questions.filter((item) => item.state !== "2").length + 1);
                form.resetFields();
                setAddOpen(false);
            });
        }}>
        <Form form={form} layout="vertical">
          <Form.Item name="topicName" label="议题名称" rules={[{ required: true }]}>
            <Select options={[
            { label: "关于推进基金退出事项的议案", value: "关于推进基金退出事项的议案" },
            {
                label: "关于补充外部董事意见采纳情况的议案",
                value: "关于补充外部董事意见采纳情况的议案",
            },
        ]}/>
          </Form.Item>
          <Form.Item name="orgName" label="提问部门" rules={[{ required: true }]}>
            <Select options={[
            { label: "法律合规部", value: "法律合规部" },
            { label: "财务管理部", value: "财务管理部" },
            { label: "审计风控部", value: "审计风控部" },
        ]}/>
          </Form.Item>
          <Form.Item name="question" label="提问内容" rules={[{ required: true }]}>
            <Input.TextArea rows={4}/>
          </Form.Item>
        </Form>
      </Modal>
    </div>);
}
function TopicApprovalPanel({ isEdit, setActiveKey, }) {
    const [rows, setRows] = useState(initialPreTasks);
    const columns = [
        { title: "序号", width: 64, render: (_value, _row, index) => index + 1 },
        { title: "任务名称", dataIndex: "taskName" },
        { title: "相关部门", dataIndex: "deptName" },
        { title: "执行人", dataIndex: "executor" },
        {
            title: "状态",
            dataIndex: "status",
            render: (value, row) => (<Tag color={value === "1" ? "success" : "warning"} onClick={() => {
                    if (!isEdit || value === "1")
                        return;
                    setRows((current) => current.map((item) => (item.id === row.id ? { ...item, status: "1" } : item)));
                }}>
          {value === "1" ? "完成" : "未完成"}
        </Tag>),
        },
    ];
    const hasUnfinished = rows.some((item) => item.status === "0");
    return (<div className="review-panel">
      <div className="review-warning">
        以下列表中所有的前置任务都完成后才能进行议题审核，请联系各个任务的执行人尽快完成前置任务！
      </div>
      <Table rowKey="id" columns={columns} dataSource={rows} pagination={false} size="small"/>
      {isEdit ? (<div className="review-footer">
          <Button type="primary" disabled={hasUnfinished} onClick={() => setActiveKey("3")}>
            下一步
          </Button>
        </div>) : null}
    </div>);
}
function MaterialPreparePanel({ isEdit, setActiveKey, }) {
    const [checkedList, setCheckedList] = useState(["1000", "2000", "3000"]);
    return (<div className="review-panel">
      <div className="material-grid">
        <Card title="审批材料清单" size="small">
          <Table rowKey="id" size="small" pagination={false} columns={[
            { title: "材料名称", dataIndex: "name" },
            { title: "材料类型", dataIndex: "type", width: 120 },
            {
                title: "状态",
                dataIndex: "status",
                width: 100,
                render: (value) => <Tag color={value === "已完成" ? "success" : "processing"}>{value}</Tag>,
            },
        ]} dataSource={[
            { id: "mat-001", name: "议案正文", type: "PDF", status: "已完成" },
            { id: "mat-002", name: "法律合规意见", type: "DOCX", status: "已完成" },
            { id: "mat-003", name: "风险评估报告", type: "XLSX", status: "待复核" },
        ]}/>
        </Card>
        <Card title="可用审批材料包" size="small">
          <Select mode="multiple" value={checkedList} disabled={!isEdit} style={{ width: "100%" }} onChange={setCheckedList} options={[
            { label: "董事会材料包", value: "1000" },
            { label: "监事会材料包", value: "2000" },
            { label: "股东会材料包", value: "3000" },
        ]}/>
          <Upload.Dragger disabled={!isEdit} showUploadList={false} beforeUpload={(file) => {
            message.success(`审批材料 ${file.name} 已写入本地假数据`);
            return false;
        }} className="material-upload">
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">拖拽补充材料到此处</p>
          </Upload.Dragger>
        </Card>
      </div>
      {isEdit ? (<div className="review-footer">
          <Button type="primary" onClick={() => setActiveKey("4")}>
            下一步
          </Button>
        </div>) : null}
    </div>);
}
function MinistryMeetingPanel({ isEdit }) {
    const [form] = Form.useForm();
    return (<div className="review-panel">
      <Card title="提请部务会" size="small">
        <Form form={form} layout="vertical" disabled={!isEdit} initialValues={{
            meetingSubject: "关于推进基金退出事项提请部务会审议",
            reason: "该事项涉及基金退出路径、交易对手沟通和风险应对安排，需提请部务会审议。",
            date: dayjs("2026-04-29").format("YYYY-MM-DD"),
        }}>
          <Form.Item name="meetingSubject" label="会议主题">
            <Input />
          </Form.Item>
          <Form.Item name="reason" label="提请原因">
            <Input.TextArea rows={5}/>
          </Form.Item>
          <Form.Item name="date" label="拟上会日期">
            <Input />
          </Form.Item>
        </Form>
        {isEdit ? (<Button type="primary" onClick={() => message.success("部务会提请信息已保存")}>
            保存
          </Button>) : null}
      </Card>
    </div>);
}
function TopicApprovalFlowPanel({ isEdit, setActiveKey, }) {
    const [rows, setRows] = useState(initialApprovalRows);
    const columns = [
        { title: "序号", width: 64, render: (_value, _row, index) => index + 1 },
        { title: "审批节点", dataIndex: "nodeName" },
        { title: "部门", dataIndex: "deptName" },
        { title: "处理人", dataIndex: "userName" },
        {
            title: "结果",
            dataIndex: "result",
            render: (value) => {
                const text = value === "approved" ? "通过" : value === "rejected" ? "驳回" : "待处理";
                return <Tag color={resultColor[value]}>{text}</Tag>;
            },
        },
        { title: "意见", dataIndex: "opinion", ellipsis: true },
        { title: "更新时间", dataIndex: "updated", width: 150 },
    ];
    return (<div className="review-panel">
      <Table rowKey="id" columns={columns} dataSource={rows} pagination={false} size="small"/>
      <Card title="当前审批意见" size="small" className="approval-opinion-card">
        <Input.TextArea rows={4} disabled={!isEdit} defaultValue="建议补充交易对手合规审查结论后提交联审。"/>
        {isEdit ? (<Space className="approval-actions">
            <Button type="primary" onClick={() => {
                setRows((current) => current.map((item) => item.id === "approval-002"
                    ? { ...item, result: "approved", opinion: "已补充材料，审核通过。", updated: dayjs().format("YYYY-MM-DD HH:mm") }
                    : item));
                message.success("审批意见已保存");
            }}>
              通过
            </Button>
            <Button danger onClick={() => message.warning("已记录驳回意见到本地假数据")}>
              驳回
            </Button>
            <Button onClick={() => setActiveKey("5")}>进入联审意见确认</Button>
          </Space>) : null}
      </Card>
    </div>);
}
function JointOpinionPanel({ isEdit, setActiveKey, }) {
    const [rows, setRows] = useState(initialJointOpinions);
    const columns = [
        { title: "序号", width: 64, render: (_value, _row, index) => index + 1 },
        { title: "联审部门", dataIndex: "deptName" },
        { title: "审核人", dataIndex: "reviewer" },
        { title: "意见", dataIndex: "opinion", ellipsis: true },
        {
            title: "状态",
            dataIndex: "status",
            render: (value) => <Tag color={value === "confirmed" ? "success" : "warning"}>{value === "confirmed" ? "已确认" : "待确认"}</Tag>,
        },
        {
            title: "操作",
            width: 120,
            render: (_value, row) => row.status === "waiting" && isEdit ? (<Button type="link" onClick={() => setRows((current) => current.map((item) => (item.id === row.id ? { ...item, status: "confirmed" } : item)))}>
            确认
          </Button>) : null,
        },
    ];
    return (<div className="review-panel">
      <Table rowKey="id" columns={columns} dataSource={rows} pagination={false} size="small"/>
      {isEdit ? (<div className="review-footer">
          <Button type="primary" onClick={() => setActiveKey("6")}>
            下一步
          </Button>
        </div>) : null}
    </div>);
}
function PostMeetingReplacePanel({ isEdit }) {
    const [files, setFiles] = useState([
        { id: "post-001", name: "会后修订版议案.pdf", type: "会后材料", updated: "2026-04-30 16:20" },
        { id: "post-002", name: "决议事项执行清单.xlsx", type: "执行清单", updated: "2026-05-01 09:40" },
    ]);
    return (<div className="review-panel">
      <Upload disabled={!isEdit} showUploadList={false} beforeUpload={(file) => {
            setFiles((current) => [
                { id: `post-${Date.now()}`, name: file.name, type: "会后材料", updated: dayjs().format("YYYY-MM-DD HH:mm") },
                ...current,
            ]);
            message.success("会后材料已替换到本地假数据");
            return false;
        }}>
        <Button icon={<UploadOutlined />} type="primary" disabled={!isEdit}>
          上传替换材料
        </Button>
      </Upload>
      <Table className="post-file-table" rowKey="id" pagination={false} size="small" columns={[
            { title: "序号", width: 64, render: (_value, _row, index) => index + 1 },
            { title: "文件名称", dataIndex: "name" },
            { title: "类型", dataIndex: "type", width: 130 },
            { title: "更新时间", dataIndex: "updated", width: 160 },
        ]} dataSource={files}/>
    </div>);
}
function MeetingMinutesPanel({ isEdit }) {
    return (<div className="review-panel">
      <Card title="总办会会议纪要" size="small">
        <Timeline items={[
            { color: "green", children: "2026-04-30 会议召开，审议基金退出事项" },
            { color: "blue", children: "2026-05-01 形成会议纪要初稿" },
            { color: "gray", children: "2026-05-02 等待相关部门确认纪要内容" },
        ]}/>
        <Input.TextArea rows={7} disabled={!isEdit} defaultValue="会议原则同意基金退出事项后续推进安排，要求股权运营部牵头完善交易对手合规审查、风险应对措施及执行里程碑，并按月反馈执行进展。"/>
        {isEdit ? (<div className="review-footer">
            <Button type="primary" onClick={() => message.success("会议纪要已保存")}>
              保存纪要
            </Button>
          </div>) : null}
      </Card>
    </div>);
}
export default function CompanyReview({ projectId, isEdit, projectData, onClosed }) {
    const [activeKey, setActiveKey] = useState("0");
    const [questNum, setQuestNum] = useState(initialQuestions.filter((item) => item.state !== "2").length);
    const items = useMemo(() => [
        {
            key: "0",
            label: "文件替换",
            children: <FilesReplacePanel isEdit={isEdit}/>,
        },
        {
            key: "1",
            label: `议题初审问答(${questNum || 0}件未处理)`,
            children: <QuestionsPanel isEdit={isEdit} onCountChange={setQuestNum}/>,
        },
        {
            key: "2",
            label: "前置任务确认",
            children: <TopicApprovalPanel isEdit={isEdit} setActiveKey={setActiveKey}/>,
        },
        {
            key: "3",
            label: "审批材料准备",
            children: <MaterialPreparePanel isEdit={isEdit} setActiveKey={setActiveKey}/>,
        },
        {
            key: "8",
            label: "提请部务会",
            children: <MinistryMeetingPanel isEdit={isEdit}/>,
        },
        {
            key: "4",
            label: "议题审批",
            children: <TopicApprovalFlowPanel isEdit={isEdit} setActiveKey={setActiveKey}/>,
        },
        {
            key: "5",
            label: "联审意见确认",
            children: <JointOpinionPanel isEdit={isEdit} setActiveKey={setActiveKey}/>,
        },
        {
            key: "6",
            label: "会后材料替换",
            children: <PostMeetingReplacePanel isEdit={isEdit}/>,
        },
        {
            key: "7",
            label: "总办会会议纪要",
            children: <MeetingMinutesPanel isEdit={isEdit}/>,
        },
    ], [isEdit, questNum]);
    const radioOptions = items.map((item) => ({
        label: item.label,
        value: item.key,
    }));
    return (<div className="company-review">
      <ReviewHeader projectData={projectData}/>
      <div className="review-tab-shell">
        <Radio.Group options={radioOptions} onChange={(event) => setActiveKey(event.target.value)} value={activeKey} optionType="button" buttonStyle="solid" className="review-radio-tabs"/>
        <Tabs activeKey={activeKey} items={items} className="review-hidden-tabs"/>
      </div>
      <div className="review-close-row">
        <span>项目ID：{projectId}</span>
        <Button onClick={() => onClosed("close")}>关闭审核页</Button>
      </div>
    </div>);
}
