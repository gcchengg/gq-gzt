import { Button, Drawer, Input, Space, Table, Tag, message } from "antd";
import { FilePdfOutlined, PaperClipOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import getBySanhuiMgmtIdResponse from "../newSanhui/mock/data/evaluation/getBySanhuiMgmtId.json";
import meetingGetListResponse from "../newSanhui/mock/data/submit/meetingGetList.json";
import PdfAnnotationEditor from "../newSanhui/components/TopicEvaluation/PdfAnnotationEditor";
import EvaluationModelScore from "../newSanhui/components/TopicEvaluation/EvaluationModelScore";
import "../newSanhui/components/TopicEvaluation/EvaluationModelScore/index.css";
import "./index.css";

const reviewTypeMap = {
  legal: "议题初审_法务",
  finance: "议题初审_财务",
  managerDirector: "议题初审_科室经理/总监",
  investment: "议题初审_投资",
  management: "议题初审_综合管理",
  party: "议题初审_党群初审",
};

const attachments = [
  {
    id: "file-3",
    name: "20250428中联电子议题关键信息页(1).pdf",
    version: "V1.0.0",
    annotatable: true,
    notes: 0,
  },
  {
    id: "file-4",
    name: "T3出行董事会及临时股东会议案.pdf",
    version: "V1.0.0",
    annotatable: true,
    notes: 3,
  },
  {
    id: "file-5",
    name: "议题补充说明.docx",
    version: "V1.0.0",
    annotatable: false,
    notes: null,
  },
];

const meetingRows = meetingGetListResponse.data.map((item, index) => ({
  ...item,
  key: `${item.id || item.meetingType}-${item.meetingTypeName}-${index}`,
}));

function getReviewType() {
  const params = new URLSearchParams(window.location.search);
  return reviewTypeMap[params.get("type")] || reviewTypeMap.legal;
}

function createInitialTopics() {
  return getBySanhuiMgmtIdResponse.data.map((item) => ({
    ...item,
    status: "待初审",
  }));
}

function sortTopics(topics) {
  return [...topics].sort((a, b) => a.level - b.level);
}

function formatDate(value, template = "YYYY-MM-DD") {
  return value ? dayjs(value).format(template) : "-";
}

function MeetingManageInfo() {
  return (
    <section className="pre-review-card">
      <div className="pre-review-card-head">
        <span>会议管理</span>
        <span className="pre-review-muted">来自议题提报 / 会议管理</span>
      </div>
      <div className="pre-review-meeting-grid">
        {meetingRows.map((meeting) => {
          const launchType = Number(meeting.launchType || 1);
          return (
            <article className="pre-review-meeting-card" key={meeting.key}>
              <div className="pre-review-meeting-head">
                <span className="pre-review-meeting-mark" />
                <strong>{meeting.meetingTypeName}</strong>
                <Tag color={meeting.launchFlag === false ? "default" : "processing"}>
                  {meeting.launchFlag === false ? "不召开" : "召开"}
                </Tag>
              </div>
              <div className="pre-review-meeting-field">
                <span>会议名称</span>
                <p>{meeting.meetingName || "-"}</p>
              </div>
              <div className="pre-review-meeting-row">
                <div className="pre-review-meeting-field">
                  <span>通知时间</span>
                  <p>{formatDate(meeting.notifyDate)}</p>
                </div>
                <div className="pre-review-meeting-field">
                  <span>召开方式</span>
                  <p>{launchType === 2 ? "通讯表决" : "现场会议"}</p>
                </div>
              </div>
              <div className="pre-review-meeting-row">
                <div className="pre-review-meeting-field">
                  <span>{launchType === 2 ? "表决日期" : "会议时间"}</span>
                  <p>{formatDate(meeting.launchTime, launchType === 2 ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm")}</p>
                </div>
                <div className="pre-review-meeting-field">
                  <span>会议地点</span>
                  <p>{meeting.location || "-"}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function PreReviewDetail({ open, topic, reviewType, onClose }) {
  const [pdfEditor, setPdfEditor] = useState(null);

  const attachmentColumns = [
    { title: "序号", width: 70, align: "center", render: (_, __, index) => index + 1 },
    {
      title: "文件名",
      dataIndex: "name",
      render: (name, record) => record.annotatable ? (
        <Button type="link" icon={<FilePdfOutlined />} onClick={() => setPdfEditor({ fileName: name, mode: "annotation" })}>
          {name}
        </Button>
      ) : (
        <Space>
          <PaperClipOutlined />
          {name}
        </Space>
      ),
    },
    { title: "版本号", dataIndex: "version", width: 120 },
    {
      title: "批注状态",
      width: 120,
      align: "center",
      render: (_, record) => record.annotatable ? <Tag color={record.notes ? "blue" : "red"}>{record.notes} 条批注</Tag> : <Tag>不可批注</Tag>,
    },
  ];

  return (
    <>
      <Drawer
        title="初审详情"
        open={open}
        width="92%"
        onClose={onClose}
        destroyOnHidden
        footer={(
          <div className="pre-review-detail-footer">
            <Button onClick={onClose}>关闭</Button>
          </div>
        )}
      >
        <div className="pre-review-detail">
          <section className="pre-review-section">
            <div className="pre-review-section-head">
              <div>
                <h3>附件确认</h3>
                <p>以下为管户议题评估详情已选择的附件，仅可查看并对 PDF 文件进行批注。</p>
              </div>
              <Tag color="processing">已关联 {attachments.length} 个附件</Tag>
            </div>
            <Table rowKey="id" size="small" bordered pagination={false} columns={attachmentColumns} dataSource={attachments} />
          </section>

          <EvaluationModelScore hideModelAction hideMaterialAction hideExecutionColumn hideExceptionColumn />
        </div>
      </Drawer>

      <PdfAnnotationEditor
        open={Boolean(pdfEditor)}
        fileName={pdfEditor?.fileName}
        mode={pdfEditor?.mode}
        showNeedReply
        onClose={() => setPdfEditor(null)}
      />
    </>
  );
}

export default function NewSanhuiPreReview() {
  const [reviewType] = useState(getReviewType);
  const [topics] = useState(createInitialTopics);
  const [activeTopic, setActiveTopic] = useState(null);
  const [reviewOpinion, setReviewOpinion] = useState("");
  const [legalMeetingOpinion, setLegalMeetingOpinion] = useState("");
  const [legalRiskAdvice, setLegalRiskAdvice] = useState("");
  const orderedTopics = useMemo(() => sortTopics(topics), [topics]);

  const columns = [
    { title: "序号", width: 72, align: "center", render: (_, __, index) => index + 1 },
    { title: "议题分类（大）", dataIndex: "categoryMain", width: 160 },
    { title: "议题分类（中）", dataIndex: "categoryMiddle", width: 180 },
    { title: "议题分类（小）", dataIndex: "categorySmall", minWidth: 300, render: (text) => <span className="pre-review-category-small">{text}</span> },
    { title: "议题名称", dataIndex: "topicName", minWidth: 240, render: (text) => <span className="pre-review-topic-name">{text}</span> },
    { title: "审批层级", dataIndex: "approvalLevel", width: 110, align: "center" },
    { title: "董事会", dataIndex: "boardMeeting", width: 86, align: "center", render: (value) => value ? "√" : "-" },
    { title: "监事会", dataIndex: "supervisorMeeting", width: 86, align: "center", render: (value) => value ? "√" : "-" },
    { title: "股东会", dataIndex: "shareholderMeeting", width: 86, align: "center", render: (value) => value ? "√" : "-" },
    { title: "初审状态", dataIndex: "status", width: 110, align: "center", render: (status) => <Tag color="processing">{status}</Tag> },
    {
      title: "操作",
      width: 90,
      fixed: "right",
      render: (_, record) => <Button type="link" onClick={() => setActiveTopic(record)}>初审</Button>,
    },
  ];

  return (
    <div className="pre-review-page">
      <div className="pre-review-header">
        <div>
          <h1>{reviewType}</h1>
          <p>请完成议题初审批注与初审意见填写。</p>
        </div>
        <Tag color="blue">待办任务</Tag>
      </div>

      <MeetingManageInfo />

      <section className="pre-review-card">
        <div className="pre-review-card-head">
          <span>议题列表</span>
          <span className="pre-review-muted">共 {orderedTopics.length} 项议题</span>
        </div>
        <Table
          rowKey="id"
          bordered
          pagination={false}
          columns={columns}
          dataSource={orderedTopics}
          scroll={{ x: 1220 }}
        />
      </section>

      <section className="pre-review-card">
        <div className="pre-review-card-head">
          <span>初审意见</span>
          <strong>重点：请填写初审最终意见，并及时汇报至部门总监</strong>
        </div>
        <Input.TextArea
          value={reviewOpinion}
          onChange={(event) => setReviewOpinion(event.target.value)}
          placeholder="请输入初审最终意见"
          autoSize={{ minRows: 5, maxRows: 8 }}
        />
      </section>

      {reviewType === reviewTypeMap.legal ? (
        <section className="pre-review-card">
          <div className="pre-review-card-head">
            <span>上会意见</span>
          </div>
          <div className="pre-review-legal-grid">
            <label>
              <span>风控合规审核意见</span>
              <Input.TextArea
                value={legalMeetingOpinion}
                onChange={(event) => setLegalMeetingOpinion(event.target.value)}
                placeholder="请输入风控合规审核意见"
                autoSize={{ minRows: 4, maxRows: 7 }}
              />
            </label>
            <label>
              <span>风控合规风险提示应对建议</span>
              <Input.TextArea
                value={legalRiskAdvice}
                onChange={(event) => setLegalRiskAdvice(event.target.value)}
                placeholder="请输入风控合规风险提示应对建议"
                autoSize={{ minRows: 4, maxRows: 7 }}
              />
            </label>
          </div>
        </section>
      ) : null}

      <div className="pre-review-footer">
        <Button onClick={() => history.back()}>返回</Button>
        <Button type="primary" onClick={() => message.success(`${reviewType}已提交`)}>
          完成初审
        </Button>
      </div>

      <PreReviewDetail
        open={Boolean(activeTopic)}
        topic={activeTopic}
        reviewType={reviewType}
        onClose={() => setActiveTopic(null)}
      />
    </div>
  );
}
