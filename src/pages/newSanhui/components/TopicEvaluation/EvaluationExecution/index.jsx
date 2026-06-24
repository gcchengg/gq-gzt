import {
  Alert,
  Button,
  Checkbox,
  Image,
  Input,
  Modal,
  Tabs,
  Table,
  Tag,
  Upload,
  message,
} from "antd";
import { DeleteOutlined, EditOutlined, LinkOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import EvaluationModelScore from "../EvaluationModelScore";
import "./index.css";

const attachmentData = [
  {
    key: "file-3",
    name: "20250428中联电子议题关键信息页(1).pdf",
    version: "V1.0.0",
    editableVersion: false,
    annotatable: true,
    notes: 0,
    snapshots: [
      {
        key: "file-3-page-1",
        page: 1,
        notes: 2,
        summary: "处置方案及资产净值表格，包含净值口径批注。",
        mark: "批注：请补充附件来源",
      },
      {
        key: "file-3-page-3",
        page: 3,
        notes: 1,
        summary: "资产处置价格依据及附件来源说明。",
        mark: "批注：需核对净值口径",
      },
    ],
  },
  {
    key: "file-4",
    name: "T3出行董事会及临时股东会议案.pdf",
    version: "V1.0.0",
    editableVersion: false,
    annotatable: true,
    notes: 3,
    snapshots: [
      {
        key: "file-4-page-2",
        page: 2,
        notes: 1,
        summary: "董事会会议案及表决建议，包含管理建议批注。",
        mark: "批注：请说明表决依据",
      },
      {
        key: "file-4-page-5",
        page: 5,
        notes: 2,
        summary: "临时股东会议程及授权事项，包含程序合规批注。",
        mark: "批注：需补充前置审议",
      },
      {
        key: "file-4-page-8",
        page: 8,
        notes: 1,
        summary: "经营数据及风险提示页，包含合理性说明批注。",
        mark: "批注：风险提示需量化",
      },
    ],
  },
];

const evaluationData = [
  {
    key: "rule-1",
    dimension: "合规性",
    subDimension: "实质合规",
    element: "外部管理规定",
    rule: "符合政策法规及上级机构监管要求或不涉及，则通过。",
  },
  {
    key: "rule-2",
    dimension: "合规性",
    subDimension: "实质合规",
    element: "内部管理规定",
    rule: "符合公司内部该类事项管理要求或不涉及，则通过。",
  },
  {
    key: "rule-3",
    dimension: "合规性",
    subDimension: "实质合规",
    element: "控股股东要求",
    rule: "符合控股股东相关管理要求或不涉及，则通过。",
  },
  {
    key: "rule-4",
    dimension: "合规性",
    subDimension: "程序合规",
    element: "审议程序",
    rule: "已按照制度要求完成前置审议程序，则通过。",
  },
  {
    key: "rule-5",
    dimension: "合理性",
    subDimension: "工作开展情况",
    element: "成效、问题及相应举措",
    weight: "100",
    rule: "工作有效开展并达到预期目标，得100分。",
  },
];

export default function EvaluationExecution({ onOpenPdf }) {
  const [attachments, setAttachments] = useState(attachmentData);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedRules, setSelectedRules] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [links, setLinks] = useState({});
  const [snapshotOpen, setSnapshotOpen] = useState(false);
  const [selectedSnapshots, setSelectedSnapshots] = useState([]);
  const [activeSnapshotFileKey, setActiveSnapshotFileKey] = useState();

  const selectedAttachmentData = useMemo(
    () => attachments.filter((item) => selectedFiles.includes(item.key)),
    [attachments, selectedFiles],
  );

  const selectedAnnotatableFiles = useMemo(
    () => selectedAttachmentData.filter((file) => file.annotatable),
    [selectedAttachmentData],
  );

  const openAnnotation = (file) => {
    setActiveFile(file);
    if (onOpenPdf) {
      onOpenPdf(file.name, "annotation");
    } else {
      message.info(`已打开《${file.name}》，完成批注后可关联到评价项`);
    }
  };

  const openSnapshotPicker = () => {
    if (!selectedRules.length) {
      message.warning("请先选择需要关联的评价项");
      return;
    }
    const initialFile = activeFile || selectedAnnotatableFiles[0];
    setSelectedSnapshots([]);
    setActiveSnapshotFileKey(initialFile?.key);
    setSnapshotOpen(true);
  };

  const linkSelectedSnapshot = () => {
    if (!selectedSnapshots.length) {
      message.warning("请至少选择一个需要关联的批注页截图");
      return;
    }
    const snapshots = selectedAnnotatableFiles.flatMap((file) =>
      (file.snapshots || [])
        .filter((snapshot) =>
          selectedSnapshots.includes(`${file.key}:${snapshot.key}`),
        )
        .map((snapshot) => ({ ...snapshot, file })),
    );
    setLinks((current) => {
      const next = { ...current };
      selectedRules.forEach((ruleKey) => {
        const currentSnapshots = next[ruleKey] || [];
        const newSnapshots = snapshots
          .filter(
            (snapshot) =>
              !currentSnapshots.some(
                (item) =>
                  item.file.key === snapshot.file.key &&
                  item.page === snapshot.page,
              ),
          )
          .map((snapshot) => ({ ...snapshot }));
        next[ruleKey] = [...currentSnapshots, ...newSnapshots];
      });
      return next;
    });
    setSnapshotOpen(false);
    message.success(
      `已将 ${snapshots.length} 张批注页截图关联至 ${selectedRules.length} 个评价项`,
    );
  };

  const removeLink = (ruleKey, fileKey, page) => {
    setLinks((current) => {
      const next = { ...current };
      next[ruleKey] = (next[ruleKey] || []).filter(
        (item) => !(item.file.key === fileKey && item.page === page),
      );
      if (!next[ruleKey].length) delete next[ruleKey];
      return next;
    });
  };

  const addSupplementAttachment = (file) => {
    const isPdf = file.name.toLowerCase().endsWith(".pdf");
    const key = `supplement-${Date.now()}`;
    setAttachments((current) => [
      ...current,
      {
        key,
        name: file.name,
        version: "V1.0.0",
        editableVersion: true,
        annotatable: isPdf,
        notes: isPdf ? 0 : null,
        snapshots: isPdf
          ? [
              {
                key: `${key}-page-1`,
                page: 1,
                notes: 0,
                summary: "新补充附件的第 1 页，待完成批注后可关联。",
                mark: "新补充附件",
              },
            ]
          : [],
      },
    ]);
    message.success(`已补充附件：${file.name}`);
    return false;
  };

  const updateAttachmentVersion = (key, version) => {
    setAttachments((current) =>
      current.map((item) => (item.key === key ? { ...item, version } : item)),
    );
  };

  const attachmentColumns = [
    { title: "序号", width: 70, render: (_, __, index) => index + 1 },
    {
      title: "文件名",
      dataIndex: "name",
      render: (name, record) =>
        record.annotatable ? (
          <Button
            type="link"
            className="gzt-eval-file-link"
            data-open-main-pdf={name}
            onClick={() => openAnnotation(record)}
          >
            {name}
          </Button>
        ) : (
          name
        ),
    },
    {
      title: "版本号",
      dataIndex: "version",
      width: 140,
      render: (version, record) =>
        record.editableVersion ? (
          <Input
            value={version}
            placeholder="请输入版本号"
            onChange={(event) =>
              updateAttachmentVersion(record.key, event.target.value)
            }
          />
        ) : (
          version || "V1.0.0"
        ),
    },
    {
      title: "批注状态",
      width: 130,
      render: (_, record) =>
        record.annotatable ? (
          <Tag color={record.notes ? "blue" : "red"}>{record.notes} 条批注</Tag>
        ) : (
          <Tag>不可批注</Tag>
        ),
    },
  ];

  const relationColumns = [
    { title: "一级维度", dataIndex: "dimension", width: 110 },
    { title: "二级维度", dataIndex: "subDimension", width: 140 },
    { title: "评价要素", dataIndex: "element", width: 180 },
    { title: "权重", dataIndex: "weight", width: 80, align: "center" },
    { title: "评价规则", dataIndex: "rule", width: 300, ellipsis: true },
    {
      title: "异常提示",
      width: 100,
      align: "center",
      render: () => <span className="green-dot"></span>,
    },
    {
      title: "关联页面截图",
      width: 340,
      render: (_, record) => {
        const linkedSnapshots = links[record.key] || [];
        return linkedSnapshots.length ? (
          <div className="gzt-eval-linked-list">
            {linkedSnapshots.map((linkedSnapshot) => (
              <div
                className="gzt-eval-linked-file"
                key={`${linkedSnapshot.file.key}-${linkedSnapshot.page}`}
              >
                <div className="gzt-eval-linked-thumb">
                  <Image
                    width={70}
                    height={52}
                    preview
                    src="/advice-review/6a2133fde4b0cb6abf664a41.pdf.png"
                  />
                  <i>{linkedSnapshot.notes}条批注</i>
                </div>
                <span title={linkedSnapshot.file.name}>
                  第 {linkedSnapshot.page} 页 · {linkedSnapshot.file.name}
                </span>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() =>
                    removeLink(
                      record.key,
                      linkedSnapshot.file.key,
                      linkedSnapshot.page,
                    )
                  }
                />
              </div>
            ))}
          </div>
        ) : (
          <span className="gzt-eval-empty-link">暂未关联</span>
        );
      },
    },
  ];

  return (
    <div className="gzt-eval-execution">
      <section className="gzt-eval-section">
        <div className="gzt-eval-section-head">
          <div>
            <h3>附件确认</h3>
            <p>请先选择需要进行批注和关联的文件。</p>
          </div>
          <div className="gzt-eval-section-actions">
            <Upload showUploadList={false} beforeUpload={addSupplementAttachment}>
              <Button type="primary">补充附件</Button>
            </Upload>
            <Tag color={selectedFiles.length ? "processing" : "warning"}>
              已选择 {selectedFiles.length} 个附件
            </Tag>
          </div>
        </div>
        <Table
          size="small"
          pagination={false}
          dataSource={attachments}
          columns={attachmentColumns}
          rowSelection={{
            selectedRowKeys: selectedFiles,
            onChange: setSelectedFiles,
          }}
        />
      </section>

      {selectedFiles.length ? (
        <>
          <Alert
            showIcon
            type="info"
            message="下一步：选择评价项，点击 PDF 文件完成批注，再选择需要关联的页面截图。"
          />

          <div className="gzt-eval-selected-files">
            {selectedAttachmentData
              .filter((file) => file.annotatable)
              .map((file) => (
                <Button
                  key={file.key}
                  data-open-main-pdf={file.name}
                  icon={<EditOutlined />}
                  onClick={() => openAnnotation(file)}
                >
                  批注：{file.name}
                </Button>
              ))}
          </div>

          <EvaluationModelScore hideScore />

          <section className="gzt-eval-section">
            <div className="gzt-eval-section-head">
              <div>
                <h3>评价要素关联材料</h3>
                <p>
                  当前批注文件：
                  <strong>
                    {activeFile?.name || "尚未选择，请点击上方已选 PDF 文件"}
                  </strong>
                </p>
              </div>
              <Button
                type="primary"
                icon={<LinkOutlined />}
                disabled={!selectedRules.length}
                onClick={openSnapshotPicker}
              >
                选择批注页截图
              </Button>
            </div>
            <Table
              size="small"
              pagination={false}
              dataSource={evaluationData}
              columns={relationColumns}
              rowSelection={{
                selectedRowKeys: selectedRules,
                onChange: setSelectedRules,
              }}
            />
          </section>

          <Modal
            title="选择批注页截图"
            open={snapshotOpen}
            width={900}
            okText="关联所选页面截图"
            cancelText="取消"
            onOk={linkSelectedSnapshot}
            onCancel={() => setSnapshotOpen(false)}
          >
            <Alert
              showIcon
              type="info"
              message="请选择各 PDF 文件下的批注页截图"
              description="可在多个 PDF 标签页中勾选页面。关联后将保存该页正文和批注内容的截图，并记录对应文件来源。"
            />
            <Checkbox.Group
              className="gzt-eval-snapshot-checks"
              value={selectedSnapshots}
              onChange={setSelectedSnapshots}
            >
              <Tabs
                className="gzt-eval-snapshot-tabs"
                activeKey={activeSnapshotFileKey}
                onChange={setActiveSnapshotFileKey}
                items={selectedAnnotatableFiles.map((file) => ({
                  key: file.key,
                  label: file.name,
                  children: (
                    <div className="gzt-eval-snapshot-grid">
                      {(file.snapshots || []).map((snapshot) => (
                        <Checkbox
                          key={snapshot.key}
                          value={`${file.key}:${snapshot.key}`}
                          className="gzt-eval-snapshot-card"
                        >
                          <div className="gzt-eval-snapshot-image">
                            <Image
                              preview={false}
                              src="/advice-review/6a2133fde4b0cb6abf664a41.pdf.png"
                            />
                            <span className="gzt-eval-annotation-mark">
                              {snapshot.mark}
                            </span>
                          </div>
                          <div className="gzt-eval-snapshot-meta">
                            <strong>第 {snapshot.page} 页</strong>
                            <Tag color="blue">{snapshot.notes} 条批注</Tag>
                          </div>
                          <p>{snapshot.summary}</p>
                        </Checkbox>
                      ))}
                    </div>
                  ),
                }))}
              />
            </Checkbox.Group>
          </Modal>
        </>
      ) : (
        <div className="gzt-eval-gate">
          <Alert
            showIcon
            type="warning"
            message="请先在附件确认表格中选择文件，选择后将显示评估评分及材料关联内容。"
          />
        </div>
      )}
    </div>
  );
}
