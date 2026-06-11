import {
    DeleteOutlined,
    FilePdfOutlined,
    PaperClipOutlined,
} from "@ant-design/icons";
import {
    Button,
    Checkbox,
    Descriptions,
    Drawer,
    Input,
    Modal,
    Radio,
    Space,
    Table,
    Tabs,
    Tag,
    message,
} from "antd";
import { useMemo, useState } from "react";
import { EvaluationPreview, SupplementMaterials } from "./EvaluationMaterials";
import PdfAnnotationEditor from "./PdfAnnotationEditor";
import styles from "./index.module.css";

const initialAttachments = [
    { id: "1", name: "1.png", annotations: null },
    {
        id: "2",
        name: "1.招标文件-备注版-明阳智能AI在多业务域应用试点项目-20250606.docx",
        annotations: null,
    },
    {
        id: "3",
        name: "20250428中联电子议题关键信息页(1).pdf",
        annotations: 0,
    },
    {
        id: "4",
        name: "20260403(股权运营部)T3出行第二届董事会2026年第一次会议、2026年第三次临时股东会议案及表决建议.pdf",
        annotations: 3,
    },
];

const initialScores = [
    { id: "1", primary: "合规性", secondary: "实质合规", factor: "外部管理规定", execution: "通过", result: "pass" },
    { id: "2", primary: "合规性", secondary: "实质合规", factor: "内部管理规定", execution: "通过", result: "pass" },
    { id: "3", primary: "合规性", secondary: "实质合规", factor: "控股股东要求", execution: "通过", result: "pass" },
    { id: "4", primary: "合规性", secondary: "程序合规", factor: "审议程序", execution: "通过", result: "pass" },
    { id: "5", primary: "合理性", secondary: "工作开展情况", factor: "成效、问题及相应举措", weight: 100, execution: "", score: 100 },
];

const opinions = [
    { id: "1", category: "董事", position: "董事长", person: "郑华峰", opinion: "" },
    { id: "2", category: "董事", position: "职工董事", person: "吴文君", opinion: "" },
    { id: "3", category: "董事", position: "总经理助理", person: "郑华峰", opinion: "" },
    { id: "4", category: "董事", position: "董事长", person: "郑华峰", opinion: "" },
    { id: "5", category: "董事", position: "董事长", person: "郑华峰", opinion: "" },
];

export default function EvaluationDetail({ open, topic, onClose }) {
    const [activeTab, setActiveTab] = useState("execute");
    const [attachments, setAttachments] = useState(initialAttachments);
    const [scores, setScores] = useState(initialScores);
    const [modelOpen, setModelOpen] = useState(false);
    const [attachmentPickerOpen, setAttachmentPickerOpen] = useState(false);
    const [selectedAttachmentIds, setSelectedAttachmentIds] = useState(initialAttachments.map((item) => item.id));
    const [pdfEditor, setPdfEditor] = useState(null);
    const [supplementOpen, setSupplementOpen] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [overallOpinion, setOverallOpinion] = useState("agree");
    const [suggestion, setSuggestion] = useState("");

    const attachmentColumns = useMemo(() => [
        { title: "序号", width: 64, align: "center", render: (_, __, index) => index + 1 },
        {
            title: "文件名",
            dataIndex: "name",
            render: (name) => (
                <Button
                    type="link"
                    icon={name.endsWith(".pdf") ? <FilePdfOutlined /> : <PaperClipOutlined />}
                    onClick={() => name.endsWith(".pdf") && setPdfEditor({ fileName: name, mode: "annotation" })}
                >
                    {name}
                </Button>
            ),
        },
        {
            title: "批注",
            dataIndex: "annotations",
            width: 110,
            align: "center",
            render: (value) => value === null
                ? <Tag color="gold">不可批注</Tag>
                : <Tag color={value ? "blue" : "error"}>{value}条批注</Tag>,
        },
        {
            title: "操作",
            width: 80,
            align: "center",
            render: (_, record) => (
                <Button
                    danger
                    type="link"
                    icon={<DeleteOutlined />}
                    onClick={() => setAttachments((current) => current.filter((item) => item.id !== record.id))}
                >
                    删除
                </Button>
            ),
        },
    ], []);

    const scoreColumns = useMemo(() => [
        { title: "一级维度", dataIndex: "primary", width: 90 },
        { title: "二级维度", dataIndex: "secondary", width: 120 },
        { title: "评价要素", dataIndex: "factor", width: 170 },
        { title: "权重", dataIndex: "weight", width: 65, align: "center", render: (value) => value ?? "-" },
        {
            title: "执行情况",
            dataIndex: "execution",
            width: 190,
            render: (value, record) => (
                <Input.TextArea
                    value={value}
                    autoSize={{ minRows: 1, maxRows: 3 }}
                    onChange={(event) => setScores((current) => current.map((item) => (
                        item.id === record.id ? { ...item, execution: event.target.value } : item
                    )))}
                />
            ),
        },
        { title: "评价规则", width: 190, render: () => "符合要求或不涉及，通过；否则不通过。" },
        {
            title: "评价结果(分)",
            width: 165,
            render: (_, record) => record.primary === "合规性" ? (
                <Radio.Group
                    value={record.result}
                    onChange={(event) => setScores((current) => current.map((item) => (
                        item.id === record.id ? { ...item, result: event.target.value } : item
                    )))}
                >
                    <Radio value="fail">不通过</Radio>
                    <Radio value="pass">通过</Radio>
                </Radio.Group>
            ) : (
                <Input
                    type="number"
                    value={record.score}
                    min={0}
                    max={100}
                    onChange={(event) => setScores((current) => current.map((item) => (
                        item.id === record.id ? { ...item, score: Number(event.target.value) } : item
                    )))}
                />
            ),
        },
        { title: "异常提示", width: 90, align: "center", render: () => <Tag color="success">正常</Tag> },
        {
            title: "操作",
            width: 120,
            fixed: "right",
            render: () => <Button type="link" onClick={() => setPdfEditor({ fileName: initialAttachments[2].name, mode: "associate" })}>关联汇报材料</Button>,
        },
    ], []);

    const totalScore = scores.find((item) => item.id === "5")?.score ?? 0;
    const save = () => message.success(`已保存“${topic?.topicName || "议题"}”评估详情`);

    const executePane = (
        <div className={styles.detailPane}>
            <section className={styles.detailSection}>
                <div className={styles.sectionHead}>
                    <h3>附件确认</h3>
                    <Button onClick={() => setAttachmentPickerOpen(true)}>关联附件</Button>
                </div>
                <Table rowKey="id" size="small" bordered pagination={false} columns={attachmentColumns} dataSource={attachments} />
            </section>

            <section className={styles.detailSection}>
                <div className={styles.sectionHead}>
                    <h3>评估模型</h3>
                    <Button type="primary" onClick={() => setModelOpen(true)}>更换模型</Button>
                </div>
                <Descriptions bordered size="small" column={4}>
                    <Descriptions.Item label="模型目录" span={4}>1.经营类 / 1.3 定期监管报告 / 1.3.1 按国家部委等上级机构监管要求定期报告事项</Descriptions.Item>
                    <Descriptions.Item label="模型版本">V1.0</Descriptions.Item>
                    <Descriptions.Item label="联审方">审计风控与法务部 / 财务部</Descriptions.Item>
                    <Descriptions.Item label="审批层级">{topic?.approvalLevel || "业务总监"}</Descriptions.Item>
                    <Descriptions.Item label="当前状态"><Tag color="success">有效</Tag></Descriptions.Item>
                    <Descriptions.Item label="创建人">系统预置</Descriptions.Item>
                    <Descriptions.Item label="最后更新人">郑华峰</Descriptions.Item>
                    <Descriptions.Item label="最后更新时间" span={2}>2025-06-21 19:05:05</Descriptions.Item>
                </Descriptions>
            </section>

            <section className={styles.detailSection}>
                <div className={styles.sectionHead}><h3>评估评分</h3></div>
                <Table
                    rowKey="id"
                    size="small"
                    bordered
                    pagination={false}
                    columns={scoreColumns}
                    dataSource={scores}
                    scroll={{ x: 1300 }}
                />
                <div className={styles.scoreSummary}>
                    <span>得分≥80分议题通过；60-79分议题通过，但需提出管理意见；低于60分或任一合规项不通过，议题不通过。</span>
                    <strong>总得分：{totalScore}</strong>
                </div>
            </section>
        </div>
    );

    const opinionPane = (
        <div className={styles.detailPane}>
            <section className={styles.detailSection}>
                <div className={styles.sectionHead}><h3>董监高意见</h3></div>
                <Table
                    rowKey="id"
                    bordered
                    pagination={false}
                    dataSource={opinions}
                    columns={[
                        { title: "序号", width: 70, align: "center", render: (_, __, index) => index + 1 },
                        { title: "职务分类", dataIndex: "category" },
                        { title: "职务", dataIndex: "position" },
                        { title: "任职人", dataIndex: "person" },
                        { title: "意见", dataIndex: "opinion" },
                    ]}
                />
            </section>
            <section className={styles.detailSection}>
                <div className={styles.sectionHead}><h3>综合意见</h3></div>
                <Radio.Group value={overallOpinion} onChange={(event) => setOverallOpinion(event.target.value)}>
                    <Space direction="vertical">
                        <Radio value="agree">同意</Radio>
                        <Radio value="conditional">有条件同意（附管理建议）</Radio>
                        <Radio value="disagree">不同意</Radio>
                    </Space>
                </Radio.Group>
                <Input.TextArea
                    className={styles.suggestion}
                    value={suggestion}
                    onChange={(event) => setSuggestion(event.target.value)}
                    placeholder="请输入管理建议"
                    autoSize={{ minRows: 5, maxRows: 8 }}
                />
            </section>
        </div>
    );

    return (
        <>
            <Drawer
                title={`议题评估详情 · ${topic?.topicName || ""}`}
                open={open}
                width="92%"
                onClose={onClose}
                destroyOnHidden
                footer={(
                    <div className={styles.detailFooter}>
                        {activeTab === "opinion" ? <Button onClick={() => setActiveTab("execute")}>上一步</Button> : null}
                        <Button onClick={save}>保存</Button>
                        {activeTab === "execute" ? (
                            <>
                                <Button onClick={() => setSupplementOpen(true)}>补充汇报材料</Button>
                                <Button onClick={() => setPreviewOpen(true)}>预览</Button>
                                <Button type="primary" onClick={() => setActiveTab("opinion")}>下一步</Button>
                            </>
                        ) : <Button type="primary" onClick={save}>完成评估</Button>}
                    </div>
                )}
            >
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        { key: "execute", label: "评估执行", children: executePane },
                        { key: "opinion", label: "综合意见", children: opinionPane },
                    ]}
                />
            </Drawer>
            <Modal
                title="更换评估模型"
                open={modelOpen}
                onCancel={() => setModelOpen(false)}
                onOk={() => {
                    setModelOpen(false);
                    message.success("评估模型已更换");
                }}
            >
                <Radio.Group defaultValue="standard">
                    <Space direction="vertical">
                        <Radio value="standard">定期监管报告标准评估模型 V1.0</Radio>
                        <Radio value="risk">经营风险专项评估模型 V2.1</Radio>
                        <Radio value="compliance">重大事项合规评估模型 V1.3</Radio>
                    </Space>
                </Radio.Group>
            </Modal>
            <Modal
                title="附件确认"
                open={attachmentPickerOpen}
                width={920}
                onCancel={() => setAttachmentPickerOpen(false)}
                onOk={() => {
                    setAttachments(initialAttachments.filter((item) => selectedAttachmentIds.includes(item.id)));
                    setAttachmentPickerOpen(false);
                    message.success("附件关联已更新");
                }}
            >
                <p className={styles.pickerNote}>请勾选当前议题需要关联的附件，PDF 文件可点击进入批注编辑。</p>
                <Table
                    rowKey="id"
                    bordered
                    pagination={false}
                    dataSource={initialAttachments}
                    columns={[
                        {
                            title: "选择",
                            width: 70,
                            align: "center",
                            render: (_, record) => (
                                <Checkbox
                                    checked={selectedAttachmentIds.includes(record.id)}
                                    onChange={(event) => setSelectedAttachmentIds((current) => event.target.checked
                                        ? [...new Set([...current, record.id])]
                                        : current.filter((id) => id !== record.id))}
                                />
                            ),
                        },
                        { title: "序号", width: 70, align: "center", render: (_, __, index) => index + 1 },
                        {
                            title: "文件名",
                            dataIndex: "name",
                            render: (name) => <Button type="link" onClick={() => name.endsWith(".pdf") && setPdfEditor({ fileName: name, mode: "annotation" })}>{name}</Button>,
                        },
                    ]}
                />
            </Modal>
            <PdfAnnotationEditor
                open={Boolean(pdfEditor)}
                fileName={pdfEditor?.fileName}
                mode={pdfEditor?.mode}
                onClose={() => setPdfEditor(null)}
            />
            <SupplementMaterials open={supplementOpen} onClose={() => setSupplementOpen(false)} />
            <EvaluationPreview open={previewOpen} topic={topic} onClose={() => setPreviewOpen(false)} />
        </>
    );
}
