import {
  DownloadOutlined,
  QuestionCircleOutlined,
  SendOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Drawer,
  Form,
  Input,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Upload,
  message,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import companyReviewSecondPdfUrl from "../../mock/data/companyReview/6a3a4395e4b0717a14fef280.pdf?url";
import companyReviewPdfUrl from "../../mock/data/companyReview/6a3b7ad8e4b0329cf1b968eb.pdf?url";
import companyReviewDocumentPdfUrl from "../../mock/data/companyReview/Document.pdf?url";
import getBySanhuiMgmtIdResponse from "../../mock/data/evaluation/getBySanhuiMgmtId.json";
import JointReviewFeedback from "../JointReviewFeedback";
import EvaluationDetail from "./EvaluationDetail";
import styles from "./index.module.css";

const reviewLevelOptions = [
  { value: "业务总监", label: "业务总监" },
  { value: "分管副总", label: "分管副总" },
  { value: "总办会", label: "总办会" },
];

const annotationsStorageKey = "newSanhui.pdfAnnotations";
const companyFeedbackStorageKey = "newSanhui.companyFeedbackRows";
const pdfFileUrlMap = {
  "20250428中联电子议题关键信息页(1).pdf": companyReviewPdfUrl,
  "20260403(股权运营部)T3出行第二届董事会2026年第一次会议、2026年第三次临时股东会议案及表决建议.pdf":
    companyReviewSecondPdfUrl,
  "1.招标文件-备注版-明阳智能AI在多业务域应用试点项目-20250606.pdf":
    companyReviewDocumentPdfUrl,
};

const seedCompanyFeedbackRows = [
  {
    id: "company-feedback-area-1",
    annotationId: "area-1",
    topicName: "一汽解放汽车有限公司发动机分公司31项报废设备购入及处置方案",
    pdfName: "20250428中联电子议题关键信息页(1).pdf",
    page: 1,
    feedbackContent:
      "关键净值与拆除费用表格区域，需要在评估前补充附件来源说明。",
    companyAnswer: "已补充固定资产卡片、处置评估底稿和拆除费用说明。",
    feedbackTime: "2025-06-21 19:05",
    answerTime: "2025-06-22 09:40",
    rounds: [
      {
        type: "send",
        role: "评估人员",
        content: "请参股公司补充净值表格与拆除费用的原始附件来源。",
        time: "2025-06-21 19:12",
      },
      {
        type: "reply",
        role: "参股公司",
        content: "已补充固定资产卡片、处置评估底稿和拆除费用说明。",
        time: "2025-06-22 09:40",
      },
      {
        type: "send",
        role: "评估人员",
        content: "请继续补充附件日期与评估报告引用页码，便于闭环归档。",
        time: "2025-06-22 10:15",
      },
    ],
  },
  {
    id: "company-feedback-text-1",
    annotationId: "text-1",
    topicName: "一汽解放汽车有限公司发动机分公司31项报废设备购入及处置方案",
    pdfName: "20250428中联电子议题关键信息页(1).pdf",
    page: 1,
    feedbackContent:
      "确认“无法再使用”的判断依据是否需要补充现场照片或附表说明。",
    companyAnswer: "已上传现场照片6张，并补充设备拆除验收单。",
    feedbackTime: "2025-06-21 19:08",
    answerTime: "2025-06-22 11:05",
    rounds: [
      {
        type: "send",
        role: "评估人员",
        content: "请补充设备现场照片和无法继续使用的判断依据。",
        time: "2025-06-21 19:18",
      },
      {
        type: "reply",
        role: "参股公司",
        content: "已上传现场照片6张，并补充设备拆除验收单。",
        time: "2025-06-22 11:05",
      },
    ],
  },
  {
    id: "company-feedback-discussion-1",
    annotationId: "discussion-1",
    topicName:
      "T3出行第二届董事会2026年第一次会议、2026年第三次临时股东会议案及表决建议",
    pdfName:
      "20260403(股权运营部)T3出行第二届董事会2026年第一次会议、2026年第三次临时股东会议案及表决建议.pdf",
    page: 2,
    feedbackContent:
      "建议在董事会审议前完成净值口径、处置价格依据及资产完备性说明的补充标注，并同步形成任务清单。",
    companyAnswer:
      "净值口径已按财务账面净值更新，处置价格依据已补充评估公司询价记录。",
    feedbackTime: "2026-05-15 18:06",
    answerTime: "2026-05-16 15:30",
    rounds: [
      {
        type: "send",
        role: "评估人员",
        content: "请说明净值口径、处置价格依据和资产完备性来源。",
        time: "2026-05-15 18:20",
      },
      {
        type: "reply",
        role: "参股公司",
        content:
          "净值口径已按财务账面净值更新，处置价格依据已补充评估公司询价记录。",
        time: "2026-05-16 15:30",
      },
      {
        type: "send",
        role: "评估人员",
        content: "请把三类附件拆分命名，并在议案正文中标出引用位置。",
        time: "2026-05-16 16:10",
      },
      {
        type: "reply",
        role: "参股公司",
        content: "已按附件1-3拆分上传，正文第2页和第5页已补充引用说明。",
        time: "2026-05-17 09:15",
      },
    ],
  },
];

function mergeSeedCompanyFeedbackRows(stored) {
  if (!Array.isArray(stored)) return seedCompanyFeedbackRows;
  const storedMap = new Map(stored.map((item) => [item.id, item]));
  const mergedSeeds = seedCompanyFeedbackRows.map((seed) => ({
    ...seed,
    ...storedMap.get(seed.id),
    companyAnswer: storedMap.get(seed.id)?.companyAnswer || seed.companyAnswer,
    answerTime: storedMap.get(seed.id)?.answerTime || seed.answerTime,
    rounds: storedMap.get(seed.id)?.rounds?.length
      ? storedMap.get(seed.id).rounds
      : seed.rounds,
  }));
  const extraItems = stored.filter(
    (item) => !seedCompanyFeedbackRows.some((seed) => seed.id === item.id),
  );
  return [...mergedSeeds, ...extraItems];
}

function readStorageList(key, fallback = []) {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(window.localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function writeCompanyFeedbackRows(rows) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(companyFeedbackStorageKey, JSON.stringify(rows));
  window.dispatchEvent(
    new CustomEvent("newSanhui:companyFeedbackChange", { detail: rows }),
  );
}

function writePdfAnnotations(annotations) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    annotationsStorageKey,
    JSON.stringify(annotations),
  );
  window.dispatchEvent(
    new CustomEvent("newSanhui:pdfAnnotationsChange", { detail: annotations }),
  );
}

function escapeCsv(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function isPendingCompanyReply(record) {
  const lastRound = record.rounds?.at(-1);
  if (!lastRound) return !record.companyAnswer;
  return lastRound.type === "send" || lastRound.role === "评估人员";
}

function getPdfFileUrl(pdfName) {
  return pdfFileUrlMap[pdfName] || companyReviewPdfUrl;
}

function CompanyFeedbackTab({ topics }) {
  const [rows, setRows] = useState(() =>
    mergeSeedCompanyFeedbackRows(
      readStorageList(companyFeedbackStorageKey, seedCompanyFeedbackRows),
    ),
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [submitOpen, setSubmitOpen] = useState(false);
  const selectedRows = rows.filter((item) => selectedRowKeys.includes(item.id));
  const selectedTopicGroups = useMemo(() => {
    const topicGroups = new Map();
    selectedRows.forEach((row) => {
      const topicName = row.topicName || "未命名议题";
      const pdfName = row.pdfName || "议题材料.pdf";
      const topicGroup = topicGroups.get(topicName) || {
        topicName,
        pdfGroups: new Map(),
        rows: [],
      };
      const pdfGroup = topicGroup.pdfGroups.get(pdfName) || {
        pdfName,
        pdfUrl: getPdfFileUrl(pdfName),
        rows: [],
      };
      pdfGroup.rows.push(row);
      topicGroup.rows.push(row);
      topicGroup.pdfGroups.set(pdfName, pdfGroup);
      topicGroups.set(topicName, topicGroup);
    });
    return Array.from(topicGroups.values()).map((group) => ({
      ...group,
      pdfGroups: Array.from(group.pdfGroups.values()),
    }));
  }, [selectedRows]);
  const [form] = Form.useForm();

  useEffect(() => {
    const handleChange = (event) => {
      setRows(
        mergeSeedCompanyFeedbackRows(
          Array.isArray(event.detail)
            ? event.detail
            : readStorageList(
                companyFeedbackStorageKey,
                seedCompanyFeedbackRows,
              ),
        ),
      );
    };
    window.addEventListener("newSanhui:companyFeedbackChange", handleChange);
    return () =>
      window.removeEventListener(
        "newSanhui:companyFeedbackChange",
        handleChange,
      );
  }, []);

  const columns = [
    {
      title: "序号",
      width: 70,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "议题名称",
      dataIndex: "topicName",
      minWidth: 240,
      render: (text) => <span className={styles.topicName}>{text}</span>,
    },
    { title: "PDF名称", dataIndex: "pdfName", width: 240 },
    {
      title: "页签",
      dataIndex: "page",
      width: 86,
      align: "center",
      render: (page) => <Tag color="blue">第{page}页</Tag>,
    },
    { title: "提问内容", dataIndex: "feedbackContent", minWidth: 260 },
    {
      title: "参股公司反馈",
      dataIndex: "companyAnswer",
      minWidth: 260,
      render: (value, record) => {
        const pending = isPendingCompanyReply(record);
        return (
          <div className={styles.feedbackAnswerCell}>
            <span>
              {pending ? (
                <span className={styles.mutedText}>待回复</span>
              ) : (
                value || <span className={styles.mutedText}>待回复</span>
              )}
            </span>
            <div className={styles.feedbackStatusTags}>
              {(record.rounds || []).length ? (
                <Tag color="processing">{record.rounds.length}轮交互</Tag>
              ) : null}
              {pending ? (
                <Tag color="warning">待回复</Tag>
              ) : (
                <Tag color="success">已回复</Tag>
              )}
            </div>
          </div>
        );
      },
    },
    { title: "反馈时间", dataIndex: "feedbackTime", width: 150 },
    {
      title: "回答时间",
      dataIndex: "answerTime",
      width: 150,
      render: (value, record) =>
        isPendingCompanyReply(record) ? "-" : value || "-",
    },
  ];

  const persistRows = (nextRows) => {
    setRows(nextRows);
    writeCompanyFeedbackRows(nextRows);
  };

  const exportRows = () => {
    const header = [
      "id",
      "annotationId",
      "议题名称",
      "PDF名称",
      "页签",
      "提问内容",
      "参股公司反馈",
      "反馈时间",
      "回答时间",
    ];
    const body = rows.map((item) =>
      [
        item.id,
        item.annotationId,
        item.topicName,
        item.pdfName,
        item.page,
        item.feedbackContent,
        item.companyAnswer,
        item.feedbackTime,
        item.answerTime,
      ]
        .map(escapeCsv)
        .join(","),
    );
    const blob = new Blob(
      [[header.map(escapeCsv).join(","), ...body].join("\n")],
      { type: "text/csv;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "参股公司反馈.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    message.success("已导出参股公司反馈");
  };

  const syncImportedRowsToAnnotations = (nextRows) => {
    const annotations = readStorageList(annotationsStorageKey, []);
    if (!annotations.length) return;
    const answerMap = new Map(
      nextRows
        .filter((item) => item.annotationId && item.companyAnswer)
        .map((item) => [item.annotationId, item]),
    );
    const nextAnnotations = annotations.map((item) => {
      const answer = answerMap.get(item.id);
      if (!answer) return item;
      const replyText = `参股公司：${answer.companyAnswer}`;
      const discussion = item.discussion || [];
      return {
        ...item,
        needCompanyReply: true,
        discussion: discussion.includes(replyText)
          ? discussion
          : [...discussion, replyText],
      };
    });
    writePdfAnnotations(nextAnnotations);
  };

  const beforeImport = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || "").trim();
        const imported = file.name.endsWith(".json")
          ? JSON.parse(text)
          : text
              .split(/\r?\n/)
              .slice(1)
              .filter(Boolean)
              .map((line) => {
                const cells = parseCsvLine(line);
                return {
                  id: cells[0] || `company-feedback-${Date.now()}`,
                  annotationId: cells[1] || "",
                  topicName: cells[2] || topics[0]?.topicName || "",
                  pdfName: cells[3] || "",
                  page: Number(cells[4]) || 1,
                  feedbackContent: cells[5] || "",
                  companyAnswer: cells[6] || "",
                  feedbackTime: cells[7] || "",
                  answerTime: cells[8] || (cells[6] ? "2026-05-13 14:30" : ""),
                  rounds: [],
                };
              });
        const normalized = Array.isArray(imported) ? imported : [];
        const nextRows = normalized.map((item) => ({
          ...item,
          id: item.id || `company-feedback-${item.annotationId || Date.now()}`,
          annotationId: item.annotationId || "",
          topicName: item.topicName || topics[0]?.topicName || "",
          page: Number(item.page) || 1,
          rounds: item.rounds || [],
        }));
        persistRows(nextRows);
        syncImportedRowsToAnnotations(nextRows);
        message.success(
          `已导入 ${nextRows.length} 条参股公司反馈，并同步批注列表`,
        );
      } catch {
        message.error("导入失败，请使用导出的 CSV 或 JSON 格式");
      }
    };
    reader.readAsText(file);
    return Upload.LIST_IGNORE;
  };

  const sendFeedback = async () => {
    await form.validateFields();
    const sentAt = "2026-05-13 14:30";
    const nextRows = rows.map((item) =>
      selectedRowKeys.includes(item.id)
        ? {
            ...item,
            feedbackTime: item.feedbackTime || sentAt,
            rounds: [
              ...(item.rounds || []),
              {
                type: "send",
                role: "评估人员",
                content: "已向参股公司发送反馈，请补充回复材料。",
                time: sentAt,
              },
            ],
          }
        : item,
    );
    persistRows(nextRows);
    setSubmitOpen(false);
    message.success(`已发送 ${selectedRowKeys.length} 条参股公司反馈`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.tableCard}>
        <div className={styles.actionBar}>
          <span className={styles.summary}>
            共 {rows.length}{" "}
            条需参股公司回复的批注，可导出给联系人并导入回答结果。
          </span>
          <Space>
            <Upload
              accept=".csv,.json"
              showUploadList={false}
              beforeUpload={beforeImport}
            >
              <Button icon={<UploadOutlined />}>导入Excel</Button>
            </Upload>
            <Button icon={<DownloadOutlined />} onClick={exportRows}>
              导出Excel
            </Button>
          </Space>
        </div>
        <div className={styles.tableWrap}>
          <Table
            rowKey="id"
            bordered
            columns={columns}
            dataSource={rows}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
              getCheckboxProps: (record) => ({
                disabled: !isPendingCompanyReply(record),
              }),
            }}
            expandable={{
              expandedRowRender: (record) => (
                <div className={styles.feedbackTimeline}>
                  {(record.rounds || []).map((round, index) => (
                    <div
                      className={styles.feedbackTimelineItem}
                      key={`${record.id}-${round.time}-${index}`}
                    >
                      <span
                        className={
                          round.type === "reply"
                            ? styles.feedbackTimelineReplyDot
                            : styles.feedbackTimelineSendDot
                        }
                      />
                      <div>
                        <div className={styles.feedbackTimelineHead}>
                          <span>{round.role}</span>
                          <span>{round.time}</span>
                        </div>
                        <div className={styles.feedbackTimelineBody}>
                          {round.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ),
              rowExpandable: (record) => Boolean(record.rounds?.length),
            }}
            pagination={{ pageSize: 6 }}
            scroll={{ x: 1420 }}
          />
        </div>
        <div className={styles.footer}>
          <Button
            type="primary"
            disabled={!selectedRowKeys.length}
            onClick={() => setSubmitOpen(true)}
          >
            提交
          </Button>
        </div>
      </div>
      <Modal
        title="提交参股公司反馈"
        open={submitOpen}
        width={1280}
        okText="发送"
        cancelText="取消"
        okButtonProps={{ icon: <SendOutlined /> }}
        onCancel={() => setSubmitOpen(false)}
        onOk={sendFeedback}
      >
        <div className={styles.companyFeedbackModal}>
          <div className={styles.pdfPreviewPane}>
            <Tabs
              className={styles.feedbackTopicTabs}
              items={selectedTopicGroups.map((topicGroup, topicIndex) => ({
                key: topicGroup.topicName,
                label: `议题 ${topicIndex + 1}`,
                children: (
                  <div className={styles.feedbackTopicPanel}>
                    <div className={styles.feedbackTopicHead}>
                      <span>{topicGroup.topicName}</span>
                      <Tag color="processing">
                        {topicGroup.pdfGroups.length}个PDF
                      </Tag>
                    </div>
                    <Tabs
                      className={styles.feedbackPdfTabs}
                      items={topicGroup.pdfGroups.map((group, index) => ({
                        key: group.pdfName,
                        label: `PDF ${index + 1}`,
                        children: (
                          <div className={styles.feedbackPdfPanel}>
                            <div className={styles.pdfPreviewHeader}>
                              <span>{group.pdfName}</span>
                              <Tag color="blue">{group.rows.length}条反馈</Tag>
                            </div>
                            <iframe
                              className={styles.feedbackPdfFrame}
                              title={group.pdfName}
                              src={group.pdfUrl}
                            />
                            <div className={styles.feedbackPdfNotes}>
                              {group.rows.map((item) => (
                                <div
                                  className={styles.feedbackPdfNote}
                                  key={item.id}
                                >
                                  <Tag color="blue">第{item.page}页</Tag>
                                  <span>{item.feedbackContent}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ),
                      }))}
                    />
                  </div>
                ),
              }))}
            />
          </div>
          <Form
            form={form}
            layout="vertical"
            className={styles.companyContactForm}
            initialValues={{
              contactName: "李明",
              email: "liming@example.com",
              phone: "13800000000",
            }}
          >
            <Form.Item
              label="联系人姓名"
              name="contactName"
              rules={[{ required: true, message: "请输入联系人姓名" }]}
            >
              <Input placeholder="请输入联系人姓名" />
            </Form.Item>
            <Form.Item
              label="邮件"
              name="email"
              rules={[
                { required: true, message: "请输入邮件" },
                { type: "email", message: "邮件格式不正确" },
              ]}
            >
              <Input placeholder="请输入邮件" />
            </Form.Item>
            <Form.Item
              label="电话"
              name="phone"
              rules={[{ required: true, message: "请输入电话" }]}
            >
              <Input placeholder="请输入电话" />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
}

const categoryOptions = {
  lv1: [
    { value: "1. 经营类", label: "1. 经营类" },
    { value: "2. 投资类", label: "2. 投资类" },
    { value: "3. 财务类", label: "3. 财务类" },
    { value: "4. 治理类", label: "4. 治理类" },
    { value: "5. 人事类", label: "5. 人事类" },
  ],
  lv2: {
    "1. 经营类": [
      { value: "1.3 定期监管报告", label: "1.3 定期监管报告" },
      { value: "1.4 股票回顾", label: "1.4 股票回顾" },
      { value: "1.5 分拆上市", label: "1.5 分拆上市" },
      { value: "1.6 其他", label: "1.6 其他" },
      { value: "1.2 年度/半年度经营报告", label: "1.2 年度/半年度经营报告" },
      { value: "1.1 业务规划及整合", label: "1.1 业务规划及整合" },
    ],
    "2. 投资类": [
      { value: "2.1 投资计划", label: "2.1 投资计划" },
      { value: "2.2 投资决策", label: "2.2 投资决策" },
      { value: "2.3 投后管理", label: "2.3 投后管理" },
    ],
    "3. 财务类": [
      { value: "3.1 财务预算", label: "3.1 财务预算" },
      { value: "3.2 财务决算", label: "3.2 财务决算" },
      { value: "3.3 利润分配", label: "3.3 利润分配" },
    ],
    "4. 治理类": [
      { value: "4.1 公司治理", label: "4.1 公司治理" },
      { value: "4.2 制度修订", label: "4.2 制度修订" },
      { value: "4.3 授权管理", label: "4.3 授权管理" },
    ],
    "5. 人事类": [
      { value: "5.1 干部任免", label: "5.1 干部任免" },
      { value: "5.2 薪酬考核", label: "5.2 薪酬考核" },
      { value: "5.3 组织调整", label: "5.3 组织调整" },
    ],
  },
  lv3: {
    "1.3 定期监管报告": [
      {
        value:
          "1.3.1 按国家部委等上级机构监管要求定期报告事项（含反洗钱、反欺诈、重大风险评估、绩效追索扣回、离任审计、内部控制等）",
        label:
          "1.3.1 按国家部委等上级机构监管要求定期报告事项（含反洗钱、反欺诈、重大风险评估、绩效追索扣回、离任审计、内部控制等）",
        approvalLevel: "业务总监",
      },
      {
        value:
          "1.3.2 落实国家、中央重大专项要求的定期报告事项（如上市公司“提质增效重回报”行动等）",
        label:
          "1.3.2 落实国家、中央重大专项要求的定期报告事项（如上市公司“提质增效重回报”行动等）",
        approvalLevel: "业务总监",
      },
    ],
    "1.4 股票回顾": [
      {
        value: "1.4.1 上市公司股票回顾及市值管理报告",
        label: "1.4.1 上市公司股票回顾及市值管理报告",
        approvalLevel: "分管副总",
      },
    ],
    "1.5 分拆上市": [
      {
        value: "1.5.1 分拆上市方案审议",
        label: "1.5.1 分拆上市方案审议",
        approvalLevel: "总办会",
      },
    ],
    "1.6 其他": [
      {
        value: "1.6.1 其他经营事项",
        label: "1.6.1 其他经营事项",
        approvalLevel: "业务总监",
      },
    ],
    "1.2 年度/半年度经营报告": [
      {
        value: "1.2.1 年度经营报告",
        label: "1.2.1 年度经营报告",
        approvalLevel: "分管副总",
      },
      {
        value: "1.2.2 半年度经营报告",
        label: "1.2.2 半年度经营报告",
        approvalLevel: "分管副总",
      },
    ],
    "1.1 业务规划及整合": [
      {
        value: "1.1.1 业务规划及整合方案",
        label: "1.1.1 业务规划及整合方案",
        approvalLevel: "总办会",
      },
    ],
  },
};

const getLevel2Options = (lv1) => categoryOptions.lv2[lv1] || [];
const getLevel3Options = (lv2) => categoryOptions.lv3[lv2] || [];
const getApprovalLevelByCategory = (lv3) => {
  const option = Object.values(categoryOptions.lv3)
    .flat()
    .find((item) => item.value === lv3);
  return option?.approvalLevel || "";
};

function createInitialTopics(projectData) {
  return getBySanhuiMgmtIdResponse.data.map((item, index) => ({
    ...item,
    topicName:
      index === 0 ? projectData?.projName || item.topicName : item.topicName,
  }));
}

function sortTopics(topics) {
  return [...topics].sort((a, b) => a.level - b.level);
}

function TopicEditDrawer({ open, mode, record, onClose, onSave }) {
  const [form] = Form.useForm();
  const planTopicFlag = Form.useWatch("planTopicFlag", form);
  const [level2Options, setLevel2Options] = useState([]);
  const [level3Options, setLevel3Options] = useState([]);

  useEffect(() => {
    if (!open) return;
    const initialValues = {
      needPreAudit: record?.needPreAudit || "0",
      topicName: record?.topicName || "",
      boardMeeting: Boolean(record?.boardMeeting),
      supervisorMeeting: Boolean(record?.supervisorMeeting),
      shareholderMeeting: Boolean(record?.shareholderMeeting),
      boardBack: Boolean(record?.boardBack),
      supervisorBack: Boolean(record?.supervisorBack),
      shareholderBack: Boolean(record?.shareholderBack),
      planTopicFlag: record?.planTopicFlag || "0",
      planItemName: record?.planItemName || "",
      categoryMain: record?.categoryMain,
      categoryMiddle: record?.categoryMiddle,
      categorySmall: record?.categorySmall,
      approvalLevel: record?.approvalLevel,
    };
    form.setFieldsValue(initialValues);
    setLevel2Options(getLevel2Options(initialValues.categoryMain));
    setLevel3Options(getLevel3Options(initialValues.categoryMiddle));
  }, [form, open, record]);

  const handleLevel1Change = (value) => {
    setLevel2Options(getLevel2Options(value));
    setLevel3Options([]);
    form.setFieldsValue({
      categoryMiddle: undefined,
      categorySmall: undefined,
      approvalLevel: undefined,
    });
  };

  const handleLevel2Change = (value) => {
    setLevel3Options(getLevel3Options(value));
    form.setFieldsValue({ categorySmall: undefined, approvalLevel: undefined });
  };

  const handleLevel3Change = (value) => {
    form.setFieldsValue({ approvalLevel: getApprovalLevelByCategory(value) });
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    if (
      !values.boardMeeting &&
      !values.supervisorMeeting &&
      !values.shareholderMeeting
    ) {
      message.error("请至少选择一项参会审议");
      return;
    }
    onSave({
      ...record,
      ...values,
      id: record?.id || `evaluation-${Date.now()}`,
      status: record?.status || "评估中",
    });
  };

  const drawerTitle = mode === "edit" ? "编辑议题" : "新增议题";
  return (
    <Drawer
      title={
        <span className={styles.topicEditDrawerTitle}>
          {drawerTitle}
          <Tooltip title="1.删除回避表决">
            <QuestionCircleOutlined className={styles.topicEditTitleHelp} />
          </Tooltip>
        </span>
      }
      width={960}
      open={open}
      onClose={onClose}
      destroyOnClose
      className={styles.topicEditDrawerShell}
      footer={
        <div className={styles.topicEditDrawerFooter}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={handleSave}>
            保存
          </Button>
        </div>
      }
    >
      <div className={styles.topicEditDrawer}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            needPreAudit: "0",
            boardMeeting: false,
            supervisorMeeting: false,
            shareholderMeeting: false,
            boardBack: false,
            supervisorBack: false,
            shareholderBack: false,
            planTopicFlag: "0",
          }}
        >
          <div className={styles.topicEditHero}>
            <div>
              <div className={styles.topicEditHeroTitle}>
                {mode === "edit" ? "维护议题信息" : "创建一条新议题"}
              </div>
              <div className={styles.topicEditHeroDesc}>
                补全议题基础信息、参会范围和审批分类后，可继续进入评估批注。
              </div>
            </div>
            <Tag color={mode === "edit" ? "processing" : "success"}>
              {mode === "edit" ? "编辑" : "新增"}
            </Tag>
          </div>

          <div className={styles.topicEditBlock}>
            <div className={styles.topicEditSectionTitle}>基础信息</div>
            <div
              className={`${styles.topicEditGrid} ${styles.topicEditGridPrimary}`}
            >
              <Form.Item
                label="前序审核（由集团/股权公司总办会/党委会等已审批通过）"
                name="needPreAudit"
                rules={[{ required: true, message: "请选择" }]}
              >
                <Select
                  placeholder="请选择"
                  options={[
                    { label: "有", value: "1" },
                    { label: "无", value: "0" },
                  ]}
                />
              </Form.Item>
              <Form.Item
                label="议题名称"
                name="topicName"
                rules={[{ required: true, message: "请输入" }]}
              >
                <Input placeholder="请输入" />
              </Form.Item>
              <Form.Item
                label="计划议题"
                name="planTopicFlag"
                rules={[{ required: true, message: "请选择是否计划议题" }]}
              >
                <Radio.Group
                  options={[
                    { label: "是", value: "1" },
                    { label: "否", value: "0" },
                  ]}
                  onChange={(event) => {
                    if (event.target.value !== "1") {
                      form.setFieldsValue({ planItemName: "" });
                    }
                  }}
                />
              </Form.Item>
              <Form.Item
                label="关联计划议题（以备证计划议题被提报）"
                name="planItemName"
              >
                <Input.Search
                  placeholder="请选择关联的计划议题"
                  enterButton
                  disabled={planTopicFlag !== "1"}
                />
              </Form.Item>
            </div>
          </div>

          <div className={styles.topicEditBlock}>
            <div className={styles.topicEditSectionTitle}>会议属性</div>
            <div className={styles.topicEditSwitchCard}>
              <Form.Item
                className={styles.topicEditSwitchItem}
                label="参会审议"
              >
                <div className={styles.topicEditSwitchGroup}>
                  <span>董事会</span>
                  <Form.Item
                    name="boardMeeting"
                    valuePropName="checked"
                    noStyle
                  >
                    <Switch />
                  </Form.Item>
                  <span>监事会</span>
                  <Form.Item
                    name="supervisorMeeting"
                    valuePropName="checked"
                    noStyle
                  >
                    <Switch />
                  </Form.Item>
                  <span>股东会</span>
                  <Form.Item
                    name="shareholderMeeting"
                    valuePropName="checked"
                    noStyle
                  >
                    <Switch />
                  </Form.Item>
                </div>
              </Form.Item>
              <Form.Item
                className={styles.topicEditSwitchItem}
                label="回避表决"
              >
                <div className={styles.topicEditSwitchGroup}>
                  <span>董事会</span>
                  <Form.Item name="boardBack" valuePropName="checked" noStyle>
                    <Switch />
                  </Form.Item>
                  <span>监事会</span>
                  <Form.Item
                    name="supervisorBack"
                    valuePropName="checked"
                    noStyle
                  >
                    <Switch />
                  </Form.Item>
                  <span>股东会</span>
                  <Form.Item
                    name="shareholderBack"
                    valuePropName="checked"
                    noStyle
                  >
                    <Switch />
                  </Form.Item>
                </div>
              </Form.Item>
            </div>
          </div>

          <div className={styles.topicEditBlock}>
            <div className={styles.topicEditSectionTitle}>分类与审批</div>
            <div className={styles.topicEditGrid}>
              <Form.Item
                label="议题分类（大）"
                name="categoryMain"
                rules={[{ required: true, message: "请选择" }]}
              >
                <Select
                  placeholder="请选择"
                  allowClear
                  options={categoryOptions.lv1}
                  onChange={handleLevel1Change}
                />
              </Form.Item>
              <Form.Item
                label="议题分类（中）"
                name="categoryMiddle"
                rules={[{ required: true, message: "请选择" }]}
              >
                <Select
                  placeholder="请选择"
                  allowClear
                  options={level2Options}
                  onChange={handleLevel2Change}
                />
              </Form.Item>
              <Form.Item
                label="议题分类（小）"
                name="categorySmall"
                rules={[{ required: true, message: "请选择" }]}
              >
                <Select
                  placeholder="请选择"
                  allowClear
                  options={level3Options}
                  onChange={handleLevel3Change}
                />
              </Form.Item>
              <Form.Item
                label="审批层级"
                name="approvalLevel"
                rules={[{ required: true, message: "请选择" }]}
              >
                <Select
                  placeholder="请选择"
                  allowClear
                  options={reviewLevelOptions}
                />
              </Form.Item>
            </div>
          </div>
        </Form>
      </div>
    </Drawer>
  );
}

export default function TopicEvaluation({ projectData, onClose }) {
  const [jointFeedbackOpen, setJointFeedbackOpen] = useState(false);
  const [topics, setTopics] = useState(() => createInitialTopics(projectData));
  const [completed, setCompleted] = useState(false);
  const [activeTopic, setActiveTopic] = useState(null);
  const [topicDrawerOpen, setTopicDrawerOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);

  useEffect(() => {
    setTopics(createInitialTopics(projectData));
    setCompleted(false);
    setActiveTopic(null);
    setTopicDrawerOpen(false);
    setEditingTopic(null);
  }, [projectData]);

  const moveTopic = (record, direction) => {
    setTopics((current) => {
      const ordered = sortTopics(current);
      const index = ordered.findIndex((item) => item.id === record.id);
      const nextIndex = direction === "up" ? index - 1 : index + 1;

      if (nextIndex < 0 || nextIndex >= ordered.length) {
        return current;
      }

      const next = [...ordered];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];

      return next.map((item, itemIndex) => ({
        ...item,
        level: itemIndex + 1,
      }));
    });
  };
  const removeTopic = (record) => {
    setTopics((current) => current.filter((item) => item.id !== record.id));
    message.success("删除成功");
  };

  const finishEvaluation = () => {
    setCompleted(true);
    message.success("议题评估已完成");
    onClose?.("close");
  };

  const openAddTopic = () => {
    setEditingTopic(null);
    setTopicDrawerOpen(true);
  };

  const openEditTopic = (record) => {
    setEditingTopic(record);
    setTopicDrawerOpen(true);
  };

  const saveTopic = (topic) => {
    setTopics((current) => {
      const existed = current.some((item) => item.id === topic.id);
      if (existed) {
        return current.map((item) => (item.id === topic.id ? topic : item));
      }
      const maxLevel = current.reduce(
        (max, item) => Math.max(max, item.level || 0),
        0,
      );
      return [{ ...topic, level: maxLevel + 1 }, ...current];
    });
    setTopicDrawerOpen(false);
    setEditingTopic(null);
    message.success("保存成功");
  };

  const orderedTopics = useMemo(() => sortTopics(topics), [topics]);

  const columns = useMemo(
    () => [
      {
        title: "序号",
        width: 72,
        align: "center",
        render: (_, __, index) => index + 1,
      },
      {
        title: "议题分类（大）",
        dataIndex: "categoryMain",
        width: 160,
      },
      {
        title: "议题分类（中）",
        dataIndex: "categoryMiddle",
        width: 180,
      },
      {
        title: "议题分类（小）",
        dataIndex: "categorySmall",
        minWidth: 300,
        render: (text) => <span className={styles.categorySmall}>{text}</span>,
      },
      {
        title: "议题名称",
        dataIndex: "topicName",
        minWidth: 240,
        render: (text) => <span className={styles.topicName}>{text}</span>,
      },
      {
        title: "审批层级",
        dataIndex: "approvalLevel",
        width: 110,
        align: "center",
      },
      {
        title: "董事会",
        dataIndex: "boardMeeting",
        width: 86,
        align: "center",
        render: (value) => (
          <span
            className={value ? styles.meetingEnabled : styles.meetingDisabled}
          >
            {value ? "√" : "-"}
          </span>
        ),
      },
      {
        title: "监事会",
        dataIndex: "supervisorMeeting",
        width: 86,
        align: "center",
        render: (value) => (
          <span
            className={value ? styles.meetingEnabled : styles.meetingDisabled}
          >
            {value ? "√" : "-"}
          </span>
        ),
      },
      {
        title: "股东会",
        dataIndex: "shareholderMeeting",
        width: 86,
        align: "center",
        render: (value) => (
          <span
            className={value ? styles.meetingEnabled : styles.meetingDisabled}
          >
            {value ? "√" : "-"}
          </span>
        ),
      },
      {
        title: "评估状态",
        dataIndex: "status",
        width: 110,
        align: "center",
        render: (status) => (
          <Tag color={completed ? "success" : "processing"}>
            {completed ? "已完成" : status}
          </Tag>
        ),
      },
      {
        title: "操作",
        width: 260,
        fixed: "right",
        render: (_, record, index) => (
          <Space className={styles.tableActions} size={4}>
            <Button type="link" onClick={() => setActiveTopic(record)}>
              评估
            </Button>
            <Button type="link" onClick={() => openEditTopic(record)}>
              编辑
            </Button>
            <Button
              type="link"
              disabled={index === 0}
              onClick={() => moveTopic(record, "up")}
            >
              上移
            </Button>
            <Button
              type="link"
              disabled={index === orderedTopics.length - 1}
              onClick={() => moveTopic(record, "down")}
            >
              下移
            </Button>
            <Popconfirm
              title="是否确定删除这条数据?"
              okText="确定"
              cancelText="取消"
              onConfirm={() => removeTopic(record)}
            >
              <Button type="link" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [completed, orderedTopics.length],
  );

  const evaluationContent = (
    <div className={styles.page}>
      <div className={styles.evaluationHeaderActions}>
        <Button type="primary" onClick={() => setJointFeedbackOpen(true)}>
          联审部门反馈
        </Button>
      </div>
      <div className={styles.tableCard}>
        <div className={styles.actionBar}>
          <span className={styles.summary}>
            共 {orderedTopics.length}{" "}
            项议题，点击“评估”进入详情并完成附件确认、评分、PDF批注与综合意见。
          </span>
          <Space>
            <Button type="primary" onClick={openAddTopic}>
              新增议题
            </Button>
            {/* <Button onClick={() => setTopics((current) => sortTopics(current))}>自动分级排序</Button> */}
          </Space>
        </div>
        <div className={styles.tableWrap}>
          <Table
            rowKey="id"
            bordered
            pagination={false}
            columns={columns}
            dataSource={orderedTopics}
            scroll={{ x: 1270 }}
          />
        </div>
        <div className={styles.footer}>
          <Button type="primary" onClick={finishEvaluation}>
            评估完成
          </Button>
        </div>
      </div>
      <EvaluationDetail
        open={Boolean(activeTopic)}
        topic={activeTopic}
        onClose={() => setActiveTopic(null)}
      />
      <TopicEditDrawer
        open={topicDrawerOpen}
        mode={editingTopic ? "edit" : "add"}
        record={editingTopic}
        onClose={() => {
          setTopicDrawerOpen(false);
          setEditingTopic(null);
        }}
        onSave={saveTopic}
      />
    </div>
  );

  const tabItems = [
    {
      key: "evaluation",
      label: "议题评估",
      children: evaluationContent,
    },
    {
      key: "company-feedback",
      label: "参股公司反馈",
      children: <CompanyFeedbackTab topics={orderedTopics} />,
    },
  ];

  return (
    <>
      <Tabs className={styles.tabs} items={tabItems} />
      <Modal
        title="联审部门反馈"
        open={jointFeedbackOpen}
        width={1120}
        footer={null}
        onCancel={() => setJointFeedbackOpen(false)}
      >
        <JointReviewFeedback isEdit />
      </Modal>
    </>
  );
}
