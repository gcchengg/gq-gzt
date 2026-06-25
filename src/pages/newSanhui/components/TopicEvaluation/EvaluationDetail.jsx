import { QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Drawer, Input, Radio, Space, Table, Tabs, Tooltip, message } from "antd";
import { useState } from "react";
import EvaluationExecution from "./EvaluationExecution";
import EvaluationModelScore from "./EvaluationModelScore";
import { EvaluationPreview, SupplementMaterials } from "./EvaluationMaterials";
import PdfAnnotationEditor from "./PdfAnnotationEditor";
import styles from "./index.module.css";

const opinions = [
  { id: "1", category: "董事", position: "董事长", person: "郑华峰", opinion: "" },
  { id: "2", category: "董事", position: "职工董事", person: "吴文君", opinion: "" },
  { id: "3", category: "董事", position: "总经理助理", person: "郑华峰", opinion: "" },
  { id: "4", category: "董事", position: "董事长", person: "郑华峰", opinion: "" },
  { id: "5", category: "董事", position: "董事长", person: "郑华峰", opinion: "" },
];

export default function EvaluationDetail({ open, topic, onClose }) {
  const [activeTab, setActiveTab] = useState("execute");
  const [pdfEditor, setPdfEditor] = useState(null);
  const [supplementOpen, setSupplementOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [overallOpinion, setOverallOpinion] = useState("agree");
  const [suggestion, setSuggestion] = useState("");

  const save = () => message.success(`已保存“${topic?.topicName || "议题"}”评估详情`);
  const finish = () => message.success(`已完成“${topic?.topicName || "议题"}”评估`);
  const openPdfEditor = (fileName, mode = "annotation") => setPdfEditor({ fileName, mode });
  const executeTabLabel = (
    <span className={styles.tabHelpLabel}>
      评估执行
      <Tooltip
        placement="bottom"
        title={(
          <div>
            <div>1.AI自动为文件生成默认批注，具体规则需要业务提供</div>
            <div>2.管户确认，初审人员能够标注哪些文件</div>
          </div>
        )}
      >
        <QuestionCircleOutlined className={styles.tabHelpIcon} />
      </Tooltip>
    </span>
  );

  const opinionPane = (
    <div className={styles.gztOpinionLayout}>
      <EvaluationModelScore hideModelAction />

      <section className={styles.gztOpinionTableWrap}>
        <div className={styles.gztOpinionSectionTitle}>董监高意见</div>
        <Table
          rowKey="id"
          bordered
          pagination={false}
          dataSource={opinions}
          columns={[
            { title: "序号", width: 84, align: "center", render: (_, __, index) => index + 1 },
            { title: "职务分类", dataIndex: "category", width: 220 },
            { title: "职务", dataIndex: "position", width: 220 },
            { title: "任职人", dataIndex: "person", width: 180 },
            {
              title: (
                <span className={styles.tabHelpLabel}>
                  意见
                  <Tooltip title="1.董监高提交的议题反馈建议，要体现在这里面">
                    <QuestionCircleOutlined className={styles.tabHelpIcon} />
                  </Tooltip>
                </span>
              ),
              dataIndex: "opinion",
            },
          ]}
        />
      </section>

      <section className={styles.gztOpinionFormCard}>
        <div className={`${styles.gztOpinionSectionTitle} ${styles.gztOpinionSummaryTitle}`}>综合意见</div>
        <div className={styles.gztOpinionForm}>
          <div className={styles.requiredLabel}>综合意见</div>
          <Radio.Group value={overallOpinion} onChange={(event) => setOverallOpinion(event.target.value)}>
            <Space direction="vertical">
              <Radio value="agree">同意</Radio>
              <Radio value="conditional">有条件同意（附管理建议）</Radio>
              <Radio value="disagree">不同意</Radio>
            </Space>
          </Radio.Group>
          <div className={styles.gztOpinionTextareaLabel}>管理建议</div>
          <Input.TextArea
            value={suggestion}
            onChange={(event) => setSuggestion(event.target.value)}
            placeholder="请输入管理建议"
            autoSize={{ minRows: 5, maxRows: 8 }}
          />
        </div>
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
            {activeTab === "execute" ? (
              <>
                <Button type="primary" onClick={save}>保存</Button>
                <Button type="primary" onClick={() => setActiveTab("opinion")}>下一步</Button>
              </>
            ) : (
              <>
                <Button onClick={() => setActiveTab("execute")}>上一步</Button>
                <Button type="primary" onClick={() => setSupplementOpen(true)}>补充汇报材料</Button>
                <Button onClick={() => setPreviewOpen(true)}>预览</Button>
                <Button type="primary" onClick={finish}>保存</Button>
              </>
            )}
          </div>
        )}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "execute",
              label: executeTabLabel,
              children: <EvaluationExecution onOpenPdf={openPdfEditor} />,
            },
            {
              key: "opinion",
              label: "综合意见",
              children: opinionPane,
            },
          ]}
        />
      </Drawer>

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
