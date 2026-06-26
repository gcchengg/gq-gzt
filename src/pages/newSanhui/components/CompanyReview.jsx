import { Button, Card, DatePicker, Descriptions, Form, Input, InputNumber, Modal, Popconfirm, Radio, Select, Space, Spin, Table, Tabs, Tag, Tooltip, Upload, message, } from "antd";
import { QuestionCircleOutlined, UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import companyReviewDetailResponse from "../mock/data/companyReview/threeListDetail.json";
import filesReplaceResponse from "../mock/data/companyReview/filesReplace.json";
import questionListResponse from "../mock/data/companyReview/questionList.json";
import reviewMaterialDataResponse from "../mock/data/companyReview/reviewMaterialData.json";
import votePersonSelectResponse from "../mock/data/companyReview/votePersonSelect.json";
import generatePdfResponse from "../mock/data/companyReview/generatePdf.json";
import getCompanyIdResponse from "../mock/data/companyReview/getCompanyId.json";
import topicOADetailResponse from "../mock/data/companyReview/topicOADetail.json";
import meetingDecisionResponse from "../mock/data/companyReview/meetingDecision.json";
import approvalDemoPdfUrl from "../mock/data/companyReview/Document.pdf?url";
import JointReviewFeedback from "./JointReviewFeedback";
import { EvaluationPreview, SupplementMaterials } from "./TopicEvaluation/EvaluationMaterials";
import "./CompanyReview.css";
const tabLabels = [
    { key: "2", label: "前置任务确认" },
    { key: "8", label: "提请部务会" },
    { key: "4", label: "议题审批" },
    { key: "5", label: "联审意见确认" },
    { key: "6", label: "会后材料替换" },
    { key: "7", label: "总办会会议纪要" },
];
const initialFiles = filesReplaceResponse.data;
const initialQuestions = questionListResponse.data.list;
const initialMaterialPrepare = reviewMaterialDataResponse.data;
const meetingDecisionVoteOptions = [
    { label: "同意", value: "1" },
    { label: "反对", value: "0" },
    { label: "有条件同意", value: "2" },
];
const normalizeDecisionRows = (rows = []) => rows.map((item) => ({
    ...item,
    voteAdvice: item.avoidVoteFlag === "1" ? "" : item.voteAdvice,
}));
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
    const [selectedFileId, setSelectedFileId] = useState(initialFiles[0]?.id);
    const [topicRelMap, setTopicRelMap] = useState(() => ({
        [initialFiles[0]?.id]: ["topic-001"],
    }));
    const [uploadConfirm, setUploadConfirm] = useState(null);
    const [loading, setLoading] = useState(false);
    const selectedTopicIds = topicRelMap[selectedFileId] || [];
    const topicData = [
        { id: "topic-001", toipcName: "关于推进基金退出事项的议案" },
        { id: "topic-002", toipcName: "关于补充外部董事意见采纳情况的议案" },
        { id: "topic-003", toipcName: "关于参股公司年度预算调整的议案" },
    ];
    const fileTypeOf = (fileName = "") => {
        const suffix = fileName.split(".").pop()?.toUpperCase();
        return suffix || "附件";
    };
    const openUploadConfirm = (fileList, record) => {
        const selectedFiles = Array.from(fileList || []);
        const duplicated = selectedFiles.some((file) => files.some((item) => item.fileName === file.name && item.id !== record?.id));
        setUploadConfirm({
            type: record ? "replace" : "batch",
            record,
            files: selectedFiles,
            duplicated,
        });
    };
    const handleUploadConfirm = () => {
        if (!uploadConfirm?.files?.length) {
            message.warning("请先选择文件");
            return;
        }
        if (uploadConfirm.type === "replace" && uploadConfirm.duplicated) {
            message.error("您选择的文件在列表中存在同名文件，无法替换！");
            setUploadConfirm(null);
            return;
        }
        setLoading(true);
        setTimeout(() => {
            if (uploadConfirm.type === "replace") {
                const file = uploadConfirm.files[0];
                setFiles((current) => current.map((item) => item.id === uploadConfirm.record.id
                    ? {
                        ...item,
                        fileName: file.name,
                        fileType: fileTypeOf(file.name),
                        created: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    }
                    : item));
                message.success("替换成功");
            } else {
                setFiles((current) => {
                    const incoming = uploadConfirm.files.map((file, index) => {
                        const existed = current.find((item) => item.fileName === file.name);
                        return {
                            id: existed?.id || `file-${Date.now()}-${index}`,
                            fileName: file.name,
                            fileType: fileTypeOf(file.name),
                            relatedTopic: existed?.relatedTopic || "",
                            created: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                        };
                    });
                    const incomingNames = new Set(incoming.map((item) => item.fileName));
                    return [...incoming, ...current.filter((item) => !incomingNames.has(item.fileName))];
                });
                message.success(uploadConfirm.duplicated ? "同名文件已替换" : "上传成功");
            }
            setLoading(false);
            setUploadConfirm(null);
        }, 200);
    };
    const handleDeleteFile = (record) => {
        setFiles((current) => current.filter((item) => item.id !== record.id));
        setTopicRelMap((current) => {
            const next = { ...current };
            delete next[record.id];
            return next;
        });
        if (selectedFileId === record.id) {
            setSelectedFileId(files.find((item) => item.id !== record.id)?.id);
        }
        message.success("删除成功");
    };
    const fileColumns = [
        { title: "序号", width: 64, render: (_value, _row, index) => index + 1 },
        {
            title: "附件名称",
            dataIndex: "fileName",
            ellipsis: true,
            render: (value) => <a href="#" onClick={(event) => event.preventDefault()}>{value}</a>,
        },
        { title: "上传时间", dataIndex: "created", width: 180 },
        {
            title: "操作",
            width: 130,
            render: (_value, record) => (<Space>
          <Upload disabled={!isEdit} maxCount={1} showUploadList={false} beforeUpload={(file, fileList) => {
                    openUploadConfirm(fileList, record);
                    return false;
                }}>
            <Button type="link" disabled={!isEdit}>
              替换
            </Button>
          </Upload>
          <Popconfirm title="确认删除附件吗?" okText="确认" cancelText="取消" disabled={!isEdit} onConfirm={() => handleDeleteFile(record)}>
            <Button type="link" danger disabled={!isEdit}>删除</Button>
          </Popconfirm>
        </Space>),
        },
    ];
    const topicColumns = [
        { title: "序号", width: 64, render: (_value, _row, index) => index + 1 },
        { title: "议题名称", dataIndex: "toipcName" },
    ];
    return (<Spin spinning={loading}>
      <div className="filesReplace-wraper">
        <div className="filesReplace-left">
          <div className="filesReplace-title">
            <span className="title-text">参股公司提报文件</span>
          </div>
          <div className="nav-list">
            <div className="nav-item">
              <span className="nav-icon">!</span>
              <div className="nav-title">参股公司对接人提供新版文件时，请使用该功能替换！</div>
            </div>
            <Upload disabled={!isEdit} multiple showUploadList={false} beforeUpload={(file, fileList) => {
                if (file.name === fileList[fileList.length - 1]?.name) {
                    openUploadConfirm(fileList);
                }
                return false;
            }}>
              <Button icon={<UploadOutlined />} type="primary" disabled={!isEdit}>
                新增
              </Button>
            </Upload>
          </div>
          <Table
            rowKey="id"
            bordered
            columns={fileColumns}
            dataSource={files}
            pagination={false}
            size="small"
            scroll={{ x: 650, y: 260 }}
            className="filesReplace-table"
            rowSelection={{
                type: "radio",
                selectedRowKeys: selectedFileId ? [selectedFileId] : [],
                onChange: (keys) => setSelectedFileId(keys[0]),
            }}
          />
        </div>
        <div className="filesReplace-right">
          <div className="filesReplace-title">
            <span className="title-text">提报文件关联议题</span>
          </div>
          <div className="nav-list">
            <div className="nav-item">
              <span className="nav-icon">!</span>
              <div className="nav-title">请在以下列表选择左侧被选中文件相关联的议题！</div>
            </div>
          </div>
          <Table rowKey="id" bordered columns={topicColumns} dataSource={topicData} pagination={false} size="small" scroll={{ x: 440, y: 260 }} className="filesReplace-table" rowSelection={{
            type: "checkbox",
            selectedRowKeys: selectedTopicIds,
            onChange: (keys) => {
                if (!selectedFileId) {
                    message.warning("请先选择左侧文件");
                    return;
                }
                setTopicRelMap((current) => ({ ...current, [selectedFileId]: keys }));
                message.success("操作成功");
            },
            getCheckboxProps: () => ({
                disabled: !isEdit || !selectedFileId,
            }),
        }}/>
        </div>
        <Modal
          title="提示："
          open={Boolean(uploadConfirm)}
          okText="确认"
          cancelText="取消"
          onOk={handleUploadConfirm}
          onCancel={() => setUploadConfirm(null)}
          cancelButtonProps={{ disabled: uploadConfirm?.type === "replace" && uploadConfirm?.duplicated }}
        >
          {uploadConfirm?.type === "replace" && uploadConfirm.duplicated ? (
            <p>您选择的文件在列表中存在同名文件，无法替换！</p>
          ) : uploadConfirm?.type === "replace" ? (
            <p>确认要将文件替换为{uploadConfirm.files?.[0]?.name}吗?</p>
          ) : uploadConfirm?.duplicated ? (
            <p>您新增的文件在列表中已经存在，确认要替换吗?</p>
          ) : (
            <p>确认要上传新增的{uploadConfirm?.files?.length || 0}个文件吗?</p>
          )}
        </Modal>
      </div>
    </Spin>);
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
function TopicApprovalPanel({ isEdit }) {
    return <JointReviewFeedback isEdit={isEdit}/>;
}
export function MaterialPreparePanel({ isEdit, setActiveKey, onSubmitSuccess, submitButtonText = "下一步", afterContent }) {
    const [form] = Form.useForm();
    const materialData = initialMaterialPrepare;
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState(() => normalizeDecisionRows(materialData.opnFormMap?.["100"] || []));
    const [tableData1, setTableData1] = useState(() => normalizeDecisionRows(materialData.opnFormMap?.["200"] || []));
    const [tableData2, setTableData2] = useState(() => normalizeDecisionRows(materialData.opnFormMap?.["300"] || []));
    const [proposalList, setProposalList] = useState(materialData.proposalList || []);
    const [pdfUrl, setPdfUrl] = useState(() => ({
        1000: approvalDemoPdfUrl,
        2000: approvalDemoPdfUrl,
        3000: approvalDemoPdfUrl,
    }));
    const [pdfModalOpen, setPdfModalOpen] = useState(false);
    const [pdfCurrent, setPdfCurrent] = useState(0);
    const [materialOpen, setMaterialOpen] = useState(null);
    const [previewTopic, setPreviewTopic] = useState(null);
    const [submitMeetingModalOpen, setSubmitMeetingModalOpen] = useState(false);
    const pdfCurrentList = ["1000", "2000", "3000"];
    const previewTitleMap = {
        1000: "业务总监PDF预览",
        2000: "分管副总PDF预览",
        3000: "总办会PDF预览",
    };
    const previewSuccessMap = {
        1000: "成功生成业务总监审批议题材料！",
        2000: "成功生成分管副总审批议题材料！",
        3000: "成功生成总办会审批议题材料！",
    };
    const initialFormValues = useMemo(() => ({
        partyOrgInfo: materialData.detailsVo?.companyVo?.partyOrgInfo,
        voteDueDate: materialData.voteDTO?.voteDueDate,
        voteMethod: materialData.voteDTO?.voteMethod,
        itemFormList: materialData.voteDTO?.itemFormList?.map((item) => item.userId) || [],
    }), [materialData]);
    const userOptions = useMemo(() => (votePersonSelectResponse.data || []).map((item) => ({
        label: item.optionName,
        value: item.optionValue,
        userId: item.optionValue,
        userName: item.optionName,
    })), []);
    const showVote = getCompanyIdResponse.data?.listFlag === "1";
    const getStatus = (result, maxResult, excludeFlag) => {
        if (excludeFlag)
            return <span className="status-dot status-green"/>;
        if (result === null || result === undefined)
            return <span>--</span>;
        if (result >= 90)
            return <span className="status-dot status-green"/>;
        if (result >= 80)
            return <span className="status-dot status-blue"/>;
        if (result >= 70)
            return <span className="status-dot status-yellow"/>;
        return <span className="status-dot status-red"/>;
    };
    const calculateRowSpan = (data, field, index) => {
        if (index === 0 || data[index]?.sanhuiTopicModelFactorVo?.[field] !== data[index - 1]?.sanhuiTopicModelFactorVo?.[field]) {
            let count = 1;
            for (let i = index + 1; i < data.length; i += 1) {
                if (data[i]?.sanhuiTopicModelFactorVo?.[field] === data[index]?.sanhuiTopicModelFactorVo?.[field]) {
                    count += 1;
                }
                else {
                    break;
                }
            }
            return count;
        }
        return 0;
    };
    const updateVoteAdvice = (record, value, setter) => {
        setter((current) => current.map((item) => (item.id === record.id ? { ...item, voteAdvice: value } : item)));
    };
    const updateAvoidVote = (record, value, setter) => {
        setter((current) => current.map((item) => (item.id === record.id ? { ...item, avoidVoteFlag: value, voteAdvice: value === "1" ? "" : item.voteAdvice } : item)));
    };
    const updateMgmtComment = (record, value, setter) => {
        setter((current) => current.map((item) => (item.id === record.id ? { ...item, mgmtComment: value } : item)));
    };
    const changeTotalValue = (score, proposalName) => {
        const nextVote = score >= 80 ? "1" : score >= 60 ? "2" : "0";
        [setTableData, setTableData1, setTableData2].forEach((setter) => {
            setter((current) => current.map((item) => item.sanhuiTopicName === proposalName && item.avoidVoteFlag !== "1" ? { ...item, voteAdvice: nextVote } : item));
        });
    };
    const updateProposal = (proposalId, updater) => {
        setProposalList((current) => current.map((item) => (item.id === proposalId ? updater({ ...item }) : item)));
    };
    const buildPayload = (values) => ({
        mgmtId: materialData.mgmtId,
        detailsVo: {
            ...materialData.detailsVo,
            companyVo: {
                ...materialData.detailsVo?.companyVo,
                partyOrgInfo: values.partyOrgInfo,
            },
        },
        opnFormList: [...tableData, ...tableData1, ...tableData2],
        proposalList,
        reviewMapFileList: Object.fromEntries(Object.entries(pdfUrl).filter(([, value]) => value).map(([key, value]) => [key, [{ fileName: previewTitleMap[key], fileUrl: value }]])),
        voteDTO: {
            ...materialData.voteDTO,
            voteDueDate: values.voteDueDate,
            voteMethod: values.voteMethod,
            itemFormList: userOptions
                .filter((item) => values.itemFormList?.includes(item.value))
                .map((item) => ({ userId: item.value, userName: item.label })),
        },
    });
    const onPreview = (type = "1000") => {
        setLoading(true);
        setTimeout(() => {
            setPdfUrl((current) => ({
                ...current,
                [type]: approvalDemoPdfUrl || generatePdfResponse.data?.[type],
            }));
            setPdfModalOpen(true);
            setLoading(false);
        }, 260);
    };
    const onSave = (type = 0, pdfType) => {
        form.validateFields().then((values) => {
            buildPayload(values);
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
                if (type === 0) {
                    message.success("保存成功");
                }
                if (pdfType) {
                    setPdfCurrent(Math.max(0, pdfCurrentList.indexOf(pdfType)));
                    onPreview(pdfType);
                    return;
                }
                if (type === 2) {
                    setPdfCurrent(0);
                    onPreview(pdfCurrentList[0]);
                    return;
                }
                if (type === 1) {
                    message.success("提交成功");
                    setPdfModalOpen(false);
                    if (onSubmitSuccess) {
                        onSubmitSuccess();
                    } else {
                        setActiveKey("4");
                    }
                }
            }, 260);
        }).catch(() => {
            message.error("请检查输入项");
        });
    };
    const createColumns = (setter) => [
        { title: "序号", width: 64, render: (_value, _row, index) => index + 1 },
        { title: "议案名称", dataIndex: "sanhuiTopicName", width: 260 },
        {
            title: (
              <span className="review-tab-label-with-help">
                回避表决
                <Tooltip title="1.添加回避表决列">
                  <QuestionCircleOutlined className="review-tab-help-icon" />
                </Tooltip>
              </span>
            ),
            dataIndex: "avoidVoteFlag",
            width: 120,
            render: (value, record) => (<Select value={value || "0"} disabled={!isEdit} style={{ width: "100%" }} onChange={(nextValue) => updateAvoidVote(record, nextValue, setter)} options={[
                    { label: "否", value: "0" },
                    { label: "是", value: "1" },
                ]}/>),
        },
        {
            title: "表决意见",
            dataIndex: "voteAdvice",
            width: 180,
            render: (value, record) => {
                const isAvoidVote = record.avoidVoteFlag === "1";
                return (<Select value={isAvoidVote ? undefined : value || undefined} disabled={!isEdit || isAvoidVote} style={{ width: "100%" }} onChange={(nextValue) => updateVoteAdvice(record, nextValue, setter)} options={[
                    { label: "通过", value: "1" },
                    { label: "通过（附管理意见）", value: "2" },
                    { label: "不通过", value: "0" },
                ]}/>);
            },
        },
        {
            title: "管理建议",
            dataIndex: "mgmtComment",
            render: (value, record) => (<Input.TextArea value={value} disabled={!isEdit} autoSize={{ minRows: 1, maxRows: 3 }} onChange={(event) => updateMgmtComment(record, event.target.value, setter)}/>),
        },
    ];
    const renderDecisionTable = (title, dataSource, setter) => dataSource.length ? (<>
      <div className="questions-title">
        <span className="title-dot"/>
        <span className="title-text">{title}</span>
      </div>
      <Table rowKey="id" bordered className="table-tabs1" pagination={false} columns={createColumns(setter)} dataSource={dataSource}/>
    </>) : null;
    const renderScoreTable = (scoreData, scoreIndex) => {
        const tableList = scoreData.topicAssesList || [];
        const columns = [
            { title: "序号", width: 60, render: (_value, _record, index) => index + 1 },
            {
                title: "一级维度",
                width: 120,
                render: (_value, record, index) => ({
                    children: record.sanhuiTopicModelFactorVo?.factorLv3Name || "",
                    props: { rowSpan: calculateRowSpan(tableList, "factorLv3Name", index) },
                }),
            },
            { title: "二级维度", width: 120, render: (_value, record) => record.sanhuiTopicModelFactorVo?.factorLv2Name || "" },
            { title: "评价要素", width: 250, render: (_value, record) => record.sanhuiTopicModelFactorVo?.assessElement || "" },
            { title: "权重(%)", width: 90, render: (_value, record) => record.sanhuiTopicModelFactorVo?.weight || "" },
            { title: "评价标准", width: 250, render: (_value, record) => record.sanhuiTopicModelFactorVo?.criterion || "" },
            {
                title: "执行情况",
                dataIndex: "execDetail",
                width: 360,
                render: (value, record, index) => (<Input.TextArea disabled={!isEdit} value={value} autoSize={{ minRows: 2, maxRows: 6 }} onChange={(event) => updateProposal(scoreData.id, (draft) => {
                        draft.topicAssesList[index] = { ...record, execDetail: event.target.value };
                        return draft;
                    })}/>),
            },
            { title: "评价规则", width: 250, render: (_value, record) => record.sanhuiTopicModelFactorVo?.assessRule || "" },
            {
                title: "评价结果(分)",
                dataIndex: "assessResult",
                width: 150,
                render: (value, record, index) => record.sanhuiTopicModelFactorVo?.factorType === "2" ? (<Radio.Group disabled={!isEdit} value={Number(value)} onChange={(event) => updateProposal(scoreData.id, (draft) => {
                            draft.topicAssesList[index] = { ...record, assessResult: event.target.value };
                            return draft;
                        })}>
              <Radio value={0}>不通过</Radio>
              <Radio value={100}>通过</Radio>
            </Radio.Group>) : (<Space>
              {record.excludeFlag !== "1" ? <InputNumber disabled={!isEdit} min={0} max={Number(record.sanhuiTopicModelFactorVo?.maxScore) || 100} value={value} onChange={(nextValue) => updateProposal(scoreData.id, (draft) => {
                            draft.topicAssesList[index] = { ...record, assessResult: nextValue };
                            return draft;
                        })}/> : <span>/</span>}
              {record.sanhuiTopicModelFactorVo?.excludeAble === "1" && isEdit ? <Button onClick={() => updateProposal(scoreData.id, (draft) => {
                            draft.topicAssesList[index] = {
                                ...record,
                                excludeFlag: record.excludeFlag === "1" ? "0" : "1",
                                assessResult: record.excludeFlag === "1" ? 0 : null,
                            };
                            return draft;
                        })}>{record.excludeFlag === "1" ? "打分" : "不打分"}</Button> : null}
            </Space>),
            },
            {
                title: "异常提示",
                fixed: "right",
                width: 100,
                render: (_value, record) => getStatus(record.assessResult, Number(record.sanhuiTopicModelFactorVo?.maxScore) || 100, record.excludeFlag === "1"),
            },
        ];
        const hasDisqualified = tableList.some((item) => item.sanhuiTopicModelFactorVo?.factorType === "2" && Number(item.assessResult) === 0);
        const hasValidFactors = tableList.some((item) => item.sanhuiTopicModelFactorVo?.factorType === "1");
        const total = hasDisqualified || !hasValidFactors ? (hasDisqualified ? 0 : 100) : Number(tableList.filter((item) => item.sanhuiTopicModelFactorVo?.factorType !== "2").reduce((sum, item) => sum + (Number(item.sanhuiTopicModelFactorVo?.weight) * Number(item.excludeFlag === "1" ? 0 : item.assessResult || 0)) / 100, 0).toFixed(2));
        return (<div className="scoreTable" key={scoreData.id || scoreIndex}>
          <div className="questions-title table-title">
            <span className="proposal-index-badge">{scoreIndex + 1}</span>
            <span className="title-text review-tab-label-with-help">
              议题名称:
              <Tooltip title="1.这里不让删除议题了">
                <QuestionCircleOutlined className="review-tab-help-icon" />
              </Tooltip>
            </span>
            <Input className="proposal-name" disabled={!isEdit} value={scoreData.proposalName} onChange={(event) => updateProposal(scoreData.id, (draft) => ({ ...draft, proposalName: event.target.value }))}/>
            {/* <Button danger disabled={!isEdit} onClick={() => {
                setProposalList((current) => current.filter((item) => item.id !== scoreData.id));
                message.success("删除成功");
            }}>删除议题</Button> */}
          </div>
          <div className="img-wraper">
            <span className="img-title-text">补充汇报材料</span>
            <Button disabled={!isEdit} className="purple-btn" onClick={() => setMaterialOpen(scoreData)}>补充汇报材料</Button>
            <Button onClick={() => setPreviewTopic(scoreData)}>预览</Button>
          </div>
          <Table rowKey="id" bordered className="table-tabs1" columns={columns} dataSource={tableList} pagination={false} scroll={{ x: 2200 }} summary={() => (<Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={9}>综合得分</Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <div style={{ textAlign: "center" }}>{hasDisqualified ? "不通过" : total}</div>
              </Table.Summary.Cell>
            </Table.Summary.Row>)}/>
          <Form.Item label="董监事意见" name={`comment-${scoreData.id}`} initialValue={scoreData.comment}>
            <Input.TextArea disabled={!isEdit} autoSize onChange={(event) => updateProposal(scoreData.id, (draft) => ({ ...draft, comment: event.target.value }))}/>
          </Form.Item>
          <Form.Item label="提请决策事项" name={`decisionRequestItems-${scoreData.id}`} initialValue={scoreData.decisionRequestItems}>
            <Input.TextArea disabled={!isEdit} autoSize onChange={(event) => updateProposal(scoreData.id, (draft) => ({ ...draft, decisionRequestItems: event.target.value }))}/>
          </Form.Item>
        </div>);
    };
    const currentPreviewType = pdfCurrentList[pdfCurrent];
    return (<div className="tabs-container-sanhui material-prepare-container">
      <div className="tabs1-scroll-content">
        <Spin spinning={loading}>
          <Form form={form} layout="vertical" disabled={!isEdit} initialValues={initialFormValues}>
            {renderDecisionTable("董事会提请决策事项管理建议补充", tableData, setTableData)}
            {renderDecisionTable("监事会提请决策事项管理建议补充", tableData1, setTableData1)}
            {renderDecisionTable("股东会提请决策事项管理建议补充", tableData2, setTableData2)}
            {proposalList.map(renderScoreTable)}
            {showVote ? (<>
              <div className="questions-title">
                <span className="title-dot"/>
                <span className="title-text">议题投票</span>
              </div>
              <div className="vote-form-list">
                <Form.Item label="投票人：" name="itemFormList">
                  <Select mode="multiple" options={userOptions} style={{ width: 260 }}/>
                </Form.Item>
                <Form.Item label="投票日：" name="voteDueDate">
                  <Input type="date" style={{ width: 260 }}/>
                </Form.Item>
                <Form.Item label="投票方式：" name="voteMethod">
                  <Select style={{ width: 260 }} options={[
            { label: "现场表决", value: "100" },
            { label: "网络投票", value: "200" },
        ]}/>
                </Form.Item>
              </div>
            </>) : null}
            {afterContent}
          </Form>
        </Spin>
      </div>
      <div className="projectBtn">
        {pdfCurrentList.includes("1000") ? <Button loading={loading} type="primary" onClick={() => (isEdit ? onSave(0, "1000") : onPreview("1000"))}>向总监汇报预览</Button> : null}
        {pdfCurrentList.includes("2000") ? <Button loading={loading} type="primary" onClick={() => (isEdit ? onSave(0, "2000") : onPreview("2000"))}>向分管领导汇报预览</Button> : null}
        {pdfCurrentList.includes("3000") ? <Button loading={loading} type="primary" onClick={() => (isEdit ? onSave(0, "3000") : onPreview("3000"))}>向总办会汇报预览</Button> : null}
        {isEdit ? <Button loading={loading} onClick={() => onSave(0)}>保存</Button> : null}
        {isEdit ? <Button loading={loading} type="primary" onClick={() => (onSubmitSuccess ? onSave(1) : setSubmitMeetingModalOpen(true))}>{submitButtonText}</Button> : null}
      </div>
      <Modal title="是否提请部务会" open={submitMeetingModalOpen} onCancel={() => setSubmitMeetingModalOpen(false)} footer={<Space>
          <Button onClick={() => {
                setSubmitMeetingModalOpen(false);
                setActiveKey("4");
            }}>否</Button>
          <Button type="primary" onClick={() => {
                setSubmitMeetingModalOpen(false);
                setActiveKey("8");
            }}>是</Button>
        </Space>}>
        <div className="submit-meeting-confirm">是否需要提请部务会？</div>
      </Modal>
      <Modal title={previewTitleMap[currentPreviewType]} open={pdfModalOpen} confirmLoading={loading} width="100%" style={{ top: 0 }} className="search-modal" onCancel={() => setPdfModalOpen(false)} footer={<>
          {pdfUrl[currentPreviewType] ? <div className="pdf-success">{previewSuccessMap[currentPreviewType]}</div> : null}
          <Button onClick={() => setPdfModalOpen(false)}>取消</Button>
          {pdfCurrent > 0 ? <Button onClick={() => setPdfCurrent(pdfCurrent - 1)}>上一步</Button> : null}
          <Button type="primary" loading={loading} onClick={() => {
            if (pdfCurrent === pdfCurrentList.length - 1) {
                onSave(1);
                return;
            }
            const nextIndex = pdfCurrent + 1;
            const nextType = pdfCurrentList[nextIndex];
            setPdfCurrent(nextIndex);
            if (!pdfUrl[nextType]) {
                onPreview(nextType);
            }
        }}>
            下一步
          </Button>
        </>}>
        {pdfUrl[currentPreviewType] ? (<iframe title={previewTitleMap[currentPreviewType]} src={pdfUrl[currentPreviewType]} width="100%" height="100%"/>) : (<div>正在生成...</div>)}
      </Modal>
      <EvaluationPreview open={Boolean(previewTopic)} topic={previewTopic} onClose={() => setPreviewTopic(null)} />
      <SupplementMaterials open={Boolean(materialOpen)} onClose={() => setMaterialOpen(null)} />
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
function ReviewApprovalSteps() {
    const steps = [
        { role: "申请人", name: "杨佰君", time: "2026-04-21 18:44:33", state: "start" },
        { role: "总监", name: "黄国平", time: "2026-04-21 18:59:18", state: "approved", remark: "同意" },
        { role: "联审", name: "刘红艳", time: "2026-04-21 20:47:40", state: "approved", remark: "同意" },
        { role: "联审", name: "陈昊", time: "2026-04-22 08:03:36", state: "approved", remark: "同意", muted: true },
        { role: "联审", name: "高峰", time: "2026-04-22 08:55:13", state: "approved", remark: "同意", muted: true },
        { role: "分管领导", name: "李秀柱", time: "2026-04-22 09:15:44", state: "approved", remark: "同意", muted: true },
    ];
    return (<div className="approval-step-panel">
      <div className="approval-step-title">当前审批状态</div>
      <div className="approval-step-list">
        {steps.map((step, index, list) => (<div className={`approval-step-item ${step.state === "approved" ? "is-approved" : "is-start"} ${step.muted ? "is-muted" : ""}`} key={`${step.role}-${step.name}`}>
            <div className="approval-step-rail">
              <span className="approval-step-dot">{step.state === "approved" ? "✓" : ""}</span>
              {index < list.length - 1 ? <span className="approval-step-line"/> : null}
            </div>
            <div className="approval-step-card">
              <div className="approval-step-card-head">
                <span className="approval-step-role">{step.role}</span>
                <span className="approval-step-name">{step.name}</span>
                {step.state === "approved" ? <span className="approval-step-status">审批通过</span> : null}
              </div>
              <div className="approval-step-time">{step.time}</div>
              {step.remark ? <div className="approval-step-remark">审批意见：{step.remark}</div> : null}
            </div>
          </div>))}
      </div>
    </div>);
}
function TopicApprovalFlowPanel({ projectId, isEdit, onClosed, setActiveKey, investOrg, pdfCurrentList = ["1000", "2000", "3000"], }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState({});
    const [fileImgList, setFileImgList] = useState([]);
    const [sendUserList, setSendUserList] = useState([]);
    const [largeFlag, setLargeFlag] = useState("1");
    const [infoData, setInfoData] = useState({});
    const [saveId, setSaveId] = useState("");
    const [leaderList, setLeaderList] = useState([]);
    const [reviewOpen, setReviewOpen] = useState(false);
    const [reviewType, setReviewType] = useState("1000");
    const isShow = isEdit && !["1", "2"].includes(infoData.status);
    const userOptions = (votePersonSelectResponse.data || []).map((item) => ({
        label: item.optionName,
        value: item.optionValue,
    }));
    const reviewTitleMap = {
        1000: "总监PDF预览",
        2000: "分管副总PDF预览",
        3000: "总办会PDF预览",
    };
    const fileTypeMap = {
        1000: "业务总监审批",
        2000: "分管领导审批",
        3000: "总办会审批",
    };
    const fileNameMap = {
        1000: "业务总监审批议题材料.pdf",
        2000: "分管领导审批议题材料.pdf",
        3000: "总办会审批议题材料.pdf",
    };
    const reviewFileKeys = ["1000", "2000", "3000"].filter((key) => pdfCurrentList.includes(key));
    const normalizeUploadList = (list = []) => list.map((file) => ({
        uid: file.uid || file.fileUrl || file.url || file.name || file.fileName,
        name: file.name || file.fileName,
        url: file.url || file.fileUrl,
    }));
    const generateReviewFile = (key) => {
        const fileName = fileNameMap[key];
        setFileList((current) => ({
            ...current,
            [key]: [
                {
                    uid: `generated-${key}-${Date.now()}`,
                    name: fileName,
                    fileName,
                    url: `/mock-pdf/generated-${key}.pdf`,
                    fileUrl: `/mock-pdf/generated-${key}.pdf`,
                },
            ],
        }));
        message.success(`${fileTypeMap[key]}材料已${(fileList[key] || []).length ? "重新" : ""}生成`);
    };
    const addUploadFile = (setter, file) => {
        const objectUrl = URL.createObjectURL(file);
        setter((current) => [
            ...current,
            {
                uid: file.uid,
                name: file.name,
                fileName: file.name,
                url: objectUrl,
                fileUrl: objectUrl,
            },
        ]);
    };
    const addReviewFile = (key, file) => {
        const objectUrl = URL.createObjectURL(file);
        setFileList((current) => ({
            ...current,
            [key]: [
                ...(current[key] || []),
                {
                    uid: file.uid,
                    name: file.name,
                    fileName: file.name,
                    url: objectUrl,
                    fileUrl: objectUrl,
                },
            ],
        }));
    };
    const onSave = (type) => {
        const messageText = ["保存成功", "提交成功"];
        form.validateFields().then((values) => {
            const data = {
                ...infoData,
                mgmtId: projectId,
                ...values,
                id: saveId,
                reviewMapFileList: fileList,
                planStartDate: values["planStartDate-planEndDate"]?.[0]?.format("YYYY-MM-DD HH:mm:ss") || null,
                planEndDate: values["planStartDate-planEndDate"]?.[1]?.format("YYYY-MM-DD HH:mm:ss") || null,
                decisionRequestScreenshotFile: fileImgList,
            };
            setLoading(true);
            setTimeout(() => {
                message.success(messageText[type]);
                setSaveId(data.id || "oa-save-local");
                if (type === "1") {
                    onClosed?.("submit");
                }
                setLoading(false);
            }, 500);
        }).catch(() => {
            message.error("请校验必填项");
            setLoading(false);
        });
    };
    useEffect(() => {
        const data = topicOADetailResponse.data || {};
        form.setFieldsValue({
            ...data,
            "planStartDate-planEndDate": data.planStartDate ? [dayjs(data.planStartDate), dayjs(data.planEndDate)] : null,
            thImptLargeFlag: data.thImptLargeFlag || "0",
            oaMeetingAttendeeList: data.oaMeetingAttendeeList?.map((item) => item.userId) || [],
        });
        setLeaderList(data.supervisingLeader?.split(",") || []);
        setSendUserList(data.oaMeetingAttendeeList?.map((item) => item.userId) || []);
        setLargeFlag(data.thImptLargeFlag || "1");
        setInfoData(data);
        setSaveId(data.id);
        setFileList({
            1000: [],
            2000: data.reviewMapFileList?.["2000"] || [],
            3000: data.reviewMapFileList?.["3000"] || [],
        });
        setFileImgList(data.decisionRequestScreenshotFile || []);
    }, []);
    return (<div className="tabs2-container tabs-container-sanhui">
      <div className="tabs2-left">
        <div className="questions-title">
          <span className="title-dot"/>
          <span className="title-text">议题审批申请</span>
        </div>
        <div className="tabs2-content">
          <Spin spinning={loading}>
            <Form layout="vertical" form={form} disabled={!isShow}>
              {pdfCurrentList?.includes("3000") && (<Form.Item label="会议类型" name="topicType" initialValue="0" rules={[{ required: true, message: "请选择会议类型" }]}>
                  <Select options={[
                { value: "0", label: "总办会" },
                { value: "1", label: "投委会" },
            ]}/>
                </Form.Item>)}
              <Form.Item label="议题名称" name="topic" rules={[{ required: true, message: "请输入议题名称" }]}>
                <Input />
              </Form.Item>
              <div className="item-flex-wrap">
                <Form.Item label="提报人" name="applUserName"><Input disabled /></Form.Item>
                <Form.Item label="提报部门" name="applOrgName"><Input disabled /></Form.Item>
              </div>
              <div className="item-flex-wrap">
                <Form.Item label="提报日期" name="applDate"><Input disabled /></Form.Item>
                <Form.Item label="分管领导" name="supervisingLeader">
                  <Select mode="multiple" disabled value={leaderList} options={userOptions}/>
                </Form.Item>
              </div>
              <div className="item-flex-wrap">
                <Form.Item label="列席人" name="oaMeetingAttendeeList">
                  <Select mode="multiple" options={userOptions} value={sendUserList} onChange={(value) => {
            setSendUserList(value);
            form.setFieldsValue({
                oaMeetingAttendeeList: value.map((item) => ({
                    userId: item,
                    userName: userOptions.find((option) => option.value === item)?.label || item,
                })),
            });
        }}/>
                </Form.Item>
                <Form.Item label="汇报人" name="presUserName"><Input disabled /></Form.Item>
              </div>
              <div className="item-flex-wrap">
                <Form.Item label="法务联审" name="fwlsName"><Input disabled /></Form.Item>
                <Form.Item label="综合管理联审" name="jhgllsName"><Input disabled /></Form.Item>
              </div>
              <div className="item-flex-wrap">
                <Form.Item label="财务联审" name="cwlsName"><Input disabled /></Form.Item>
                <Form.Item label="投资联审" name="tzlsName"><Input disabled /></Form.Item>
              </div>
              <div className="item-flex-wrap">
                <Form.Item label="投资部2总监" name="investDeptTwo"><Input disabled={!isShow} value={investOrg}/></Form.Item>
                <Form.Item label="党群联审" name="dqlsName"><Input disabled /></Form.Item>
              </div>
              {pdfCurrentList?.includes("3000") && (<div className="item-flex-wrap">
                  <Form.Item label="是否为三重一大事项：" name="thImptLargeFlag" initialValue="0" rules={[{ required: true, message: "请选择是否为三重一大事项" }]}>
                    <Radio.Group disabled onChange={(event) => setLargeFlag(event.target.value)}>
                      <Radio value="0">是</Radio>
                      <Radio value="1">否</Radio>
                    </Radio.Group>
                  </Form.Item>
                  {largeFlag === "0" && (<Form.Item label="三重一大事项" name="thImptLargeType">
                      <div>{infoData.thImptLargeType}</div>
                    </Form.Item>)}
                </div>)}
              <div className="item-flex-wrap">
                <Form.Item label="预计汇报时长（分钟）" name="planMinute" rules={[{ required: true, message: "请输入预计汇报时长" }]}>
                  <InputNumber />
                </Form.Item>
                <Form.Item label="拟上会时间" name="planStartDate-planEndDate">
                  <DatePicker.RangePicker showTime />
                </Form.Item>
              </div>
              <Form.Item label="议题内容概要" name="topicSummary" rules={[{ required: true, message: "请输入议题内容概要" }]}>
                <Input.TextArea rows={3}/>
              </Form.Item>
              <Form.Item label="相关材料" name="relatedFile">
                <div className="file-upload-container">
                  <span>相关材料要求：</span>
                  <span>1、所有材料均需解密后上传会议系统</span>
                  <span>2、会议材料中如涉及插入附件，需将附件单独上传</span>
                </div>
                <div className="file-listWrap">
                  {reviewFileKeys.map((key) => {
                    const currentFiles = fileList[key] || [];
                    const hasFile = currentFiles.length > 0;
                    return (<div key={key}>
                      <div className="file-upload-item">
                        <span>{fileTypeMap[key]}</span>
                        <Button size="small" type="primary" ghost loading={loading} onClick={() => generateReviewFile(key)}>
                          {hasFile ? "重新生成" : "生成"}
                        </Button>
                      </div>
                      <Upload disabled={!isShow} fileList={normalizeUploadList(fileList[key])} beforeUpload={(file) => {
                addReviewFile(key, file);
                return false;
            }} onRemove={(file) => {
                setFileList((current) => ({
                    ...current,
                    [key]: (current[key] || []).filter((item) => (item.uid || item.fileUrl || item.url || item.name || item.fileName) !== file.uid),
                }));
            }}>
                        <Button icon={<UploadOutlined />}>上传文件</Button>
                      </Upload>
                    </div>);
                  })}
                </div>
              </Form.Item>
              <Form.Item label="提请决策事项" name="applDecisionItem">
                <Input.TextArea rows={3}/>
              </Form.Item>
              <div className="item-flex-wrap">
                <Form.Item label="提请决策事项截图" name="decisionRequestScreenshotFile">
                  <Upload disabled={!isShow} fileList={normalizeUploadList(fileImgList)} beforeUpload={(file) => {
            addUploadFile(setFileImgList, file);
            return false;
        }} onRemove={(file) => {
            setFileImgList((current) => current.filter((item) => (item.uid || item.fileUrl || item.url || item.name || item.fileName) !== file.uid));
        }}>
                    <Button icon={<UploadOutlined />}>上传文件</Button>
                  </Upload>
                </Form.Item>
                <Form.Item label="预期目标" name="expectTarget">
                  <div>通过</div>
                </Form.Item>
              </div>
              <Form.Item label="备注" name="comment">
                <Input.TextArea rows={3}/>
              </Form.Item>
            </Form>
          </Spin>
        </div>
      </div>
      <ReviewApprovalSteps />
      <div className="projectBtn">
        {pdfCurrentList.includes("1000") && (<Button loading={loading} type="primary" onClick={() => {
                setReviewType("1000");
                setReviewOpen(true);
            }}>向总监汇报预览</Button>)}
        {pdfCurrentList.includes("2000") && (<Button loading={loading} type="primary" onClick={() => {
                setReviewType("2000");
                setReviewOpen(true);
            }}>向分管领导汇报预览</Button>)}
        {pdfCurrentList.includes("3000") && (<Button loading={loading} type="primary" onClick={() => {
                setReviewType("3000");
                setReviewOpen(true);
            }}>向总办会汇报预览</Button>)}
        {isShow && <Button onClick={() => setActiveKey("1")}>上一步</Button>}
        {isShow && <Button loading={loading} onClick={() => onSave("0")}>保存</Button>}
        {isShow && <Button loading={loading} type="primary" onClick={() => onSave("1")}>提交</Button>}
      </div>
      <Modal title={reviewTitleMap[reviewType]} open={reviewOpen} width="100%" style={{ top: 0 }} className="search-modal" onCancel={() => setReviewOpen(false)} footer={null}>
        <iframe title={reviewTitleMap[reviewType]} src={approvalDemoPdfUrl} width="100%" height="100%"/>
      </Modal>
    </div>);
}
function JointOpinionTable({ isEdit }) {
    const [rows, setRows] = useState([
        { id: "dept-opinion-001", deptName: "财务部", opinion: "同意", reply: "" },
        { id: "dept-opinion-002", deptName: "综合管理部", opinion: "同意", reply: "" },
    ]);
    const columns = [
        { title: "序号", width: 64, render: (_value, _row, index) => index + 1 },
        { title: "相关部门", dataIndex: "deptName", width: 260 },
        { title: "反馈意见", dataIndex: "opinion", width: 260 },
        {
            title: "意见解答",
            dataIndex: "reply",
            render: (value, record) => (<Input value={value} disabled={!isEdit} onChange={(event) => setRows((current) => current.map((item) => item.id === record.id ? { ...item, reply: event.target.value } : item))}/>),
        },
    ];
    return <Table rowKey="id" columns={columns} dataSource={rows} pagination={false} className="table-tabs1 joint-opinion-table" bordered/>;
}
function RiskComplianceOpinions() {
    const rows = [
        {
            title: "风控合规审核意见",
            content: "经审核，本议题决策依据、审批路径及材料完整性基本符合公司治理要求；建议在提交正式审批前补充交易对手资信复核记录，并同步完善资金回收节点责任分工。",
        },
        {
            title: "风控合规风险提示应对建议",
            content: "请重点关注退出协议履约、资金到账进度及信息披露一致性风险；建议设置阶段性跟踪台账，明确异常情况升级汇报机制，并在会后形成风险闭环记录。",
        },
    ];
    return (<div className="risk-compliance-opinions">
      {rows.map((item) => (<div className="risk-compliance-card" key={item.title}>
          <div className="risk-compliance-title">{item.title}</div>
          <div className="risk-compliance-content">{item.content}</div>
        </div>))}
    </div>);
}
function JointOpinionPanel({ isEdit, setActiveKey, }) {
    return (<div className="joint-review-layout tabs2-container tabs-container-sanhui">
      <div className="joint-review-left">
        <div className="joint-review-workspace">
          <div className="joint-opinion-section">
            <div className="questions-title">
              <span className="title-dot"/>
              <span className="title-text">相关部门意见</span>
            </div>
            <RiskComplianceOpinions />
            <JointOpinionTable isEdit={isEdit}/>
          </div>
          <div className="joint-material-section">
            <MaterialPreparePanel isEdit={isEdit} setActiveKey={setActiveKey}/>
          </div>
        </div>
      </div>
      <ReviewApprovalSteps />
    </div>);
}
function AfterMeetingReplacementApplication({ isEdit }) {
    const [form] = Form.useForm();
    const [directorFinalFiles, setDirectorFinalFiles] = useState([
        {
            uid: "director-final-001",
            name: "总监审批文件终板.pdf",
            fileName: "总监审批文件终板.pdf",
            url: "/mock-pdf/director-final.pdf",
            fileUrl: "/mock-pdf/director-final.pdf",
        },
    ]);
    const [leaderFinalFiles, setLeaderFinalFiles] = useState([
        {
            uid: "leader-final-001",
            name: "分管领导审批文件终板.pdf",
            fileName: "分管领导审批文件终板.pdf",
            url: "/mock-pdf/leader-final.pdf",
            fileUrl: "/mock-pdf/leader-final.pdf",
        },
    ]);
    const [fileList, setFileList] = useState([
        {
            uid: "after-meeting-file-001",
            name: "总办会决策文件.pdf",
            fileName: "总办会决策文件.pdf",
        },
    ]);
    const userOptions = (votePersonSelectResponse.data || []).map((item) => ({
        label: item.optionName,
        value: item.optionValue,
    }));
    const normalizeUploadList = (list = []) => list.map((file) => ({
        uid: file.uid || file.fileUrl || file.url || file.name || file.fileName,
        name: file.name || file.fileName,
        url: file.url || file.fileUrl,
    }));
    const addArchiveFile = (setter, file) => {
        const objectUrl = URL.createObjectURL(file);
        setter((current) => [
            ...current,
            {
                uid: file.uid,
                name: file.name,
                fileName: file.name,
                url: objectUrl,
                fileUrl: objectUrl,
            },
        ]);
    };
    const removeArchiveFile = (setter, file) => {
        setter((current) => current.filter((item) => (item.uid || item.fileUrl || item.url || item.name || item.fileName) !== file.uid));
    };
    const regenerateArchiveFile = (setter, label, fileName, fileUrl) => {
        setter([
            {
                uid: `${label}-${Date.now()}`,
                name: fileName,
                fileName,
                url: fileUrl,
                fileUrl,
            },
        ]);
        message.success(`${label}已重新生成`);
    };
    const renderArchiveUpload = ({ label, files, setter, fileName, fileUrl }) => {
        return (
            <div className="after-meeting-archive-card">
              <div className="after-meeting-file-action">
                <span className="after-meeting-file-label">
                  {label}
                  <Tooltip title="如果页面信息发生变化需重新生成">
                    <QuestionCircleOutlined className="review-tab-help-icon" />
                  </Tooltip>
                </span>
                <Button size="small" type="primary" ghost disabled={!isEdit} onClick={() => regenerateArchiveFile(setter, label, fileName, fileUrl)}>
                  重新生成
                </Button>
              </div>
              <Upload
                disabled={!isEdit}
                fileList={normalizeUploadList(files)}
                beforeUpload={(file) => {
                    addArchiveFile(setter, file);
                    return false;
                }}
                onRemove={(file) => removeArchiveFile(setter, file)}
              >
                <Button icon={<UploadOutlined />}>上传文件</Button>
              </Upload>
            </div>
        );
    };
    const initialValues = {
        topic: "关于推进基金退出事项的议案",
        applUserName: "张明",
        lsryName: "李娜、王强",
        applOrgName: "投资管理部",
        projectAlias: ["u001", "u002"],
        "planStartDate-planEndDate": [dayjs("2026-05-08 09:00", "YYYY-MM-DD HH:mm"), dayjs("2026-05-08 11:00", "YYYY-MM-DD HH:mm")],
        planMinute: 20,
    };
    return (<div className="after-meeting-application">
      <div className="after-meeting-archive-section">
        {renderArchiveUpload({
            label: "总监审批文件终板归档",
            files: directorFinalFiles,
            setter: setDirectorFinalFiles,
            fileName: "总监审批文件终板.pdf",
            fileUrl: "/mock-pdf/director-final.pdf",
        })}
        {renderArchiveUpload({
            label: "分管领导审批文件终板归档",
            files: leaderFinalFiles,
            setter: setLeaderFinalFiles,
            fileName: "分管领导审批文件终板.pdf",
            fileUrl: "/mock-pdf/leader-final.pdf",
        })}
      </div>
      <div className="questions-title table-title">
        <span className="title-dot"/>
        <span className="title-text">会后材料替换申请</span>
      </div>
      <Form form={form} layout="vertical" initialValues={initialValues} disabled={!isEdit}>
        <div className="item-flex-wrap">
          <Form.Item label="议题名称" name="topic">
            <Input disabled/>
          </Form.Item>
          <Form.Item label="提报人" name="applUserName">
            <Input disabled/>
          </Form.Item>
        </div>
        <div className="item-flex-wrap">
          <Form.Item label="联审人员" name="lsryName">
            <Input disabled/>
          </Form.Item>
          <Form.Item label="提报部门" name="applOrgName">
            <Input disabled/>
          </Form.Item>
        </div>
        <div className="item-flex-wrap">
          <Form.Item label="列席人" name="projectAlias">
            <Select mode="multiple" disabled options={userOptions}/>
          </Form.Item>
          <Form.Item label="拟上会时间段" name="planStartDate-planEndDate">
            <DatePicker.RangePicker showTime disabled/>
          </Form.Item>
        </div>
        <div className="item-flex-wrap">
          <Form.Item label="相关材料" name="relatedFile">
            <div className="file-upload-container">
              <span>相关材料要求：</span>
              <span>1、所有材料均需解密后上传会议系统</span>
              <span>2、会议材料中如涉及插入附件，需将附件单独上传</span>
            </div>
            <div className="after-meeting-file-action">
              <span className="after-meeting-file-label">
                总办会决策文件
                <Tooltip title="如果页面信息发生变化需重新生成">
                  <QuestionCircleOutlined className="review-tab-help-icon" />
                </Tooltip>
              </span>
              <Button size="small" type="primary" ghost disabled={!isEdit} onClick={() => regenerateArchiveFile(setFileList, "总办会决策文件", "总办会决策文件.pdf", "/mock-pdf/after-meeting-replacement.pdf")}>
                重新生成
              </Button>
            </div>
            <Upload disabled={!isEdit} fileList={normalizeUploadList(fileList)} beforeUpload={(file) => {
            addArchiveFile(setFileList, file);
            return false;
        }} onRemove={(file) => {
            removeArchiveFile(setFileList, file);
        }}>
              <Button icon={<UploadOutlined />}>上传文件</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="预计汇报时长（分钟）" name="planMinute">
            <InputNumber min={0} precision={0} disabled/>
          </Form.Item>
        </div>
      </Form>
    </div>);
}
function PostMeetingMaterialPanel({ isEdit, setActiveKey }) {
    return (<div className="joint-review-layout tabs2-container tabs-container-sanhui post-meeting-material-layout">
      <div className="joint-review-left">
        <div className="joint-review-workspace">
          <div className="joint-opinion-section">
            <div className="questions-title">
              <span className="title-dot"/>
              <span className="title-text">相关部门意见</span>
            </div>
            <JointOpinionTable isEdit={isEdit}/>
          </div>
          <div className="joint-material-section">
            <MaterialPreparePanel isEdit={isEdit} setActiveKey={setActiveKey} afterContent={<AfterMeetingReplacementApplication isEdit={isEdit}/>}/>
          </div>
        </div>
      </div>
      <ReviewApprovalSteps />
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
function MeetingMinutesPanel({ projectId, isEdit, onClosed, currentInstanceCode, }) {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [isShowTip] = useState(false);
    const getList = () => {
        setTableLoading(true);
        setTimeout(() => {
            const data = meetingDecisionResponse.data || {};
            const decisionList = (data.sanhuiCoReviewGoDecisionVos || []).map((item) => ({
                ...item,
                directorPassFlag: item.directorPassFlag || item.dsPassFlag || item.gqPassFlag,
                supervisorPassFlag: item.supervisorPassFlag || item.jsPassFlag || item.gqPassFlag,
                shareholderPassFlag: item.shareholderPassFlag || item.gdPassFlag || item.gqPassFlag,
            }));
            setTableData(decisionList);
            setFileList(data.fileList || []);
            form.setFieldsValue(decisionList.reduce((values, item, index) => ({
                ...values,
                [`directorPassFlag${index}`]: item.directorPassFlag,
                [`supervisorPassFlag${index}`]: item.supervisorPassFlag,
                [`shareholderPassFlag${index}`]: item.shareholderPassFlag,
            }), {}));
            if (data.zbhLaunchDate) {
                form.setFieldsValue({
                    zbhLaunchDate: dayjs(data.zbhLaunchDate, "YYYY-MM-DD"),
                    zbhIssueNo: data.zbhIssueNo,
                });
            }
            setTableLoading(false);
        }, 200);
    };
    const onSave = (type) => {
        const params = {
            mgmtId: projectId,
            sanhuiCoReviewGoDecisionVos: tableData,
            fileList,
            saveOrCommit: type,
            currentInstanceCode,
        };
        setLoading(true);
        const str = ["保存成功", "提交成功"];
        form.validateFields().then((values) => {
            params.zbhLaunchDate = values.zbhLaunchDate ? values.zbhLaunchDate.format("YYYY-MM-DD") : undefined;
            params.zbhIssueNo = values.zbhIssueNo;
            setTimeout(() => {
                message.success(str[type]);
                getList();
                if (type === "1") {
                    navigate("/GztHome");
                }
                setLoading(false);
            }, 300);
        }).finally(() => {
            setTimeout(() => {
                setLoading(false);
            }, 500);
        });
    };
    const updateMeetingDecision = (index, fieldName, value) => {
        setTableData((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [fieldName]: value } : item)));
    };
    useEffect(() => {
        getList();
    }, []);
    return (<div className="tabs4-container tabs-container-sanhui">
      <div className="approval-table">
        <Form layout="vertical" form={form}>
          <div className="meeting-minutes-basic">
            <div className="questions-title">
              <span className="title-dot"/>
              <span className="title-text">会议信息</span>
            </div>
            <div className="meeting-basic-grid">
              <Form.Item label="总办会召开日" name="zbhLaunchDate" rules={[{ required: true, message: "请选择日期" }]}>
                <DatePicker format="YYYY-MM-DD" style={{ width: 300 }}/>
              </Form.Item>
              <Form.Item label="期数" name="zbhIssueNo">
                <InputNumber min={1} precision={0} placeholder="请输入期数" style={{ width: 300 }}/>
              </Form.Item>
              <Form.Item label="会议纪要" name="dutyUserName" className="formItem-upload">
                <Upload fileList={fileList.map((file) => ({
                    uid: file.uid || file.fileUrl || file.name || file.fileName,
                    name: file.name || file.fileName,
                    url: file.url || file.fileUrl,
                }))} beforeUpload={(file) => {
                    const objectUrl = URL.createObjectURL(file);
                    setFileList((current) => [
                        ...current,
                        {
                            uid: file.uid,
                            name: file.name,
                            fileName: file.name,
                            url: objectUrl,
                            fileUrl: objectUrl,
                        },
                    ]);
                    return false;
                }} onRemove={(file) => {
                    setFileList((current) => current.filter((item) => (item.uid || item.fileUrl || item.name || item.fileName) !== file.uid));
                }}>
                  <Button icon={<UploadOutlined />}>上传文件</Button>
                </Upload>
              </Form.Item>
            </div>
          </div>
          <div className="meeting-decision-section">
            <div className="tableWrap">
              <div className="tableTitle">会议决策</div>
            </div>
            {isShowTip && fileList.length > 0 && (<div className="jingshi-title">
                <span className="jingshi-text">AI已经从会议纪要中提取了各议题的会议决策，请确认并补充遗漏或修改错误！</span>
              </div>)}
            <Spin spinning={tableLoading}>
              <div className="meeting-decision-card-list">
                {tableData.map((record, index) => {
                    const topic = record.eoSanhuiTopic || {};
                    return (
                      <div className="meeting-decision-card" key={record.id || `${topic.categoryLv3Name}-${topic.toipcName}`}>
                        <div className="meeting-decision-card-head">
                          <span className="meeting-decision-index">{index + 1}</span>
                          <div className="meeting-decision-topic">
                            <div className="meeting-decision-topic-name">{topic.toipcName || "未命名议题"}</div>
                            <div className="meeting-decision-tags">
                              <Tag>{topic.categoryLv1Name || "-"}</Tag>
                              <Tag>{topic.categoryLv2Name || "-"}</Tag>
                              <Tag>{topic.categoryLv3Name || "-"}</Tag>
                            </div>
                          </div>
                        </div>
                        <div className="meeting-vote-grid">
                          <Form.Item
                            label="董事会"
                            name={`directorPassFlag${index}`}
                            initialValue={record.directorPassFlag}
                            rules={[{ required: true, message: "请选择董事会表决建议" }]}
                          >
                            <Radio.Group
                              disabled={!isEdit}
                              options={meetingDecisionVoteOptions}
                              value={record.directorPassFlag}
                              onChange={(event) => updateMeetingDecision(index, "directorPassFlag", event.target.value)}
                            />
                          </Form.Item>
                          <Form.Item
                            label="监事会"
                            name={`supervisorPassFlag${index}`}
                            initialValue={record.supervisorPassFlag}
                            rules={[{ required: true, message: "请选择监事会表决建议" }]}
                          >
                            <Radio.Group
                              disabled={!isEdit}
                              options={meetingDecisionVoteOptions}
                              value={record.supervisorPassFlag}
                              onChange={(event) => updateMeetingDecision(index, "supervisorPassFlag", event.target.value)}
                            />
                          </Form.Item>
                          <Form.Item
                            label="股东会/投委会"
                            name={`shareholderPassFlag${index}`}
                            initialValue={record.shareholderPassFlag}
                            rules={[{ required: true, message: "请选择股东会/投委会表决建议" }]}
                          >
                            <Radio.Group
                              disabled={!isEdit}
                              options={meetingDecisionVoteOptions}
                              value={record.shareholderPassFlag}
                              onChange={(event) => updateMeetingDecision(index, "shareholderPassFlag", event.target.value)}
                            />
                          </Form.Item>
                        </div>
                      </div>
                    );
                })}
              </div>
            </Spin>
          </div>
        </Form>
      </div>
      <div className="projectBtn">
        <Button loading={loading} onClick={() => onSave("0")}>
          保存
        </Button>
        {isEdit && (<Button type="primary" loading={loading} onClick={() => onSave("1")}>
            提交
          </Button>)}
      </div>
    </div>);
}
export default function CompanyReview({ projectId, isEdit, projectData = companyReviewDetailResponse.data, initialActiveKey = "2", onClosed }) {
    const [activeKey, setActiveKey] = useState(initialActiveKey);
    const items = useMemo(() => [
        {
            key: "2",
            label: "前置任务确认",
            children: <TopicApprovalPanel isEdit={isEdit} setActiveKey={setActiveKey}/>,
        },
        {
            key: "8",
            label: "提请部务会",
            children: <MinistryMeetingPanel isEdit={isEdit}/>,
        },
        {
            key: "4",
            label: "议题审批",
            children: <TopicApprovalFlowPanel projectId={projectId} isEdit={isEdit} onClosed={onClosed} setActiveKey={setActiveKey}/>,
        },
        {
            key: "5",
            label: "联审意见确认",
            children: <JointOpinionPanel isEdit={isEdit} setActiveKey={setActiveKey}/>,
        },
        {
            key: "6",
            label: (
                <span className="review-tab-label-with-help">
                  会后材料替换
                  <Tooltip title="1.现在要显示所有的议题">
                    <QuestionCircleOutlined className="review-tab-help-icon" onClick={(event) => event.stopPropagation()}/>
                  </Tooltip>
                </span>
            ),
            children: <PostMeetingMaterialPanel isEdit={isEdit} setActiveKey={setActiveKey}/>,
        },
        {
            key: "7",
            label: (
                <span className="review-tab-label-with-help">
                  股权公司决策结果
                  <Tooltip title="1.董事会 监事会 股东会/投委会 都要填写各自的表决建议 2.增加期数 3.总办会会议纪要-->股权公司决策结果">
                    <QuestionCircleOutlined className="review-tab-help-icon" onClick={(event) => event.stopPropagation()}/>
                  </Tooltip>
                </span>
            ),
            children: <MeetingMinutesPanel projectId={projectId} isEdit={isEdit} onClosed={onClosed}/>,
        },
    ], [isEdit, onClosed, projectId]);
    const radioOptions = items.map((item) => ({
        label: item.label,
        value: item.key,
    }));
    return (<div className="company-review">
      {/* <ReviewHeader projectData={projectData}/> */}
      <div className="review-tab-shell">
        <Radio.Group options={radioOptions} onChange={(event) => setActiveKey(event.target.value)} value={activeKey} optionType="button" buttonStyle="solid" className="review-radio-tabs"/>
        <Tabs activeKey={activeKey} items={items} className="review-hidden-tabs"/>
      </div>
      <div className="review-close-row">
        <span></span>
        <Button onClick={() => onClosed("close")}>关闭审核页</Button>
      </div>
    </div>);
}
