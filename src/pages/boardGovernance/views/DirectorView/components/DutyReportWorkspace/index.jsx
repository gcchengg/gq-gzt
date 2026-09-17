import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Select,
  Tabs,
  Upload,
} from "antd";
import {
  FileDoneOutlined,
  FileTextOutlined,
  InboxOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import { SectionCard, StatusPill } from "../../../../components/PageKit";
import styles from "./index.module.less";

const { Dragger } = Upload;

export default function DutyReportWorkspace({
  director,
  plans,
  reports,
  onGenerate,
  onSave,
  onReceive,
}) {
  const [generateOpen, setGenerateOpen] = useState(false);
  const [reportTypeFilter, setReportTypeFilter] = useState("全部报告");
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [reportFiles, setReportFiles] = useState([]);
  const [generateForm] = Form.useForm();
  const [reportForm] = Form.useForm();
  const completedPlans = useMemo(
    () => plans.filter((item) => item.taskStatus === "已完成"),
    [plans],
  );
  const selectedReport = reports.find((item) => item.id === selectedReportId);
  const visibleReports =
    reportTypeFilter === "全部报告"
      ? reports
      : reports.filter((item) => item.reportType === reportTypeFilter);

  useEffect(() => {
    if (!selectedReport) return;
    reportForm.setFieldsValue({
      title: selectedReport.title,
      summary: selectedReport.summary,
      workHighlights: selectedReport.workHighlights,
      suggestions: selectedReport.suggestions,
    });
    setReportFiles(
      (selectedReport.files || []).map((name, index) => ({
        uid: `${selectedReport.id}-${index}`,
        name,
        status: "done",
      })),
    );
  }, [reportForm, selectedReport]);

  const generateReport = async () => {
    const values = await generateForm.validateFields();
    const report = onGenerate(director, completedPlans, values);
    setGenerateOpen(false);
    generateForm.resetFields();
    setSelectedReportId(report.id);
    message.success("履职报告已根据确认完成的履职记录自动生成");
  };

  const saveReport = async (submit) => {
    const values = await reportForm.validateFields();
    onSave(
      selectedReport.id,
      {
        ...values,
        files: reportFiles.map((file) => file.name),
      },
      submit,
    );
    message.success(submit ? "履职报告已提交接收" : "履职报告已保存");
  };

  return (
    <div className={styles.workspace}>
      <SectionCard
        title="成果报告"
        extra={
          <Button
            type="primary"
            icon={<RobotOutlined />}
            disabled={!completedPlans.length}
            onClick={() => setGenerateOpen(true)}
          >
            自动生成履职报告
          </Button>
        }
      >
        {completedPlans.length ? (
          <Alert
            type="success"
            showIcon
            message={`已归集 ${completedPlans.length} 条负责人确认完成的履职记录`}
            description="报告自动引用任务完成情况、成果说明、意见建议和补充材料。"
          />
        ) : (
          <Alert
            type="info"
            showIcon
            message="暂无可生成报告的履职记录"
            description="负责人确认完成履职任务后，系统才会将其纳入报告。"
          />
        )}
        <Tabs
          activeKey={reportTypeFilter}
          onChange={setReportTypeFilter}
          items={["全部报告", "月度报告", "季度报告", "年度报告"].map(
            (value) => ({
              key: value,
              label: `${value} ${
                value === "全部报告"
                  ? reports.length
                  : reports.filter((item) => item.reportType === value).length
              }`,
            }),
          )}
        />
        <div className={styles.reportList}>
          {visibleReports.map((report) => (
            <article key={report.id}>
              <FileTextOutlined />
              <div>
                <span>
                  {report.period} · 自动引用 {report.sourceCount} 条履职记录
                </span>
                <h3>{report.title}</h3>
                <p>{report.summary}</p>
              </div>
              <aside>
                <StatusPill>{report.status}</StatusPill>
                <Button
                  type="link"
                  onClick={() => setSelectedReportId(report.id)}
                >
                  {report.status === "待完善" ? "完善报告" : "查看/办理"}
                </Button>
              </aside>
            </article>
          ))}
        </div>
      </SectionCard>

      <Modal
        open={generateOpen}
        title="自动生成履职报告"
        okText="生成报告"
        cancelText="取消"
        onOk={generateReport}
        onCancel={() => setGenerateOpen(false)}
      >
        <Alert
          showIcon
          type="info"
          message={`系统将引用 ${completedPlans.length} 条已确认履职记录`}
          description="生成后可以继续完善正文、意见建议和附件，再提交董办接收。"
        />
        <Form
          form={generateForm}
          layout="vertical"
          initialValues={{ reportType: "季度报告", period: "2026年第三季度" }}
        >
          <Form.Item
            name="reportType"
            label="报告类型"
            rules={[{ required: true }]}
          >
            <Select
              options={["月度报告", "季度报告", "年度报告"].map((value) => ({
                value,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="period"
            label="报告周期"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        open={Boolean(selectedReport)}
        width={780}
        title={selectedReport?.title}
        onClose={() => setSelectedReportId(null)}
        extra={
          selectedReport ? (
            <StatusPill>{selectedReport.status}</StatusPill>
          ) : null
        }
      >
        {selectedReport ? (
          <div className={styles.reportEditor}>
            <Descriptions
              bordered
              column={2}
              items={[
                {
                  key: "director",
                  label: "董事",
                  children: selectedReport.directorName,
                },
                {
                  key: "period",
                  label: "报告周期",
                  children: selectedReport.period,
                },
                {
                  key: "sources",
                  label: "引用记录",
                  children: `${selectedReport.sourceCount} 条`,
                },
                {
                  key: "generated",
                  label: "生成时间",
                  children: selectedReport.generatedAt,
                },
              ]}
            />
            <Form form={reportForm} layout="vertical">
              <Form.Item
                name="title"
                label="报告名称"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="summary"
                label="履职综述"
                rules={[{ required: true }]}
              >
                <Input.TextArea rows={4} />
              </Form.Item>
              <Form.Item
                name="workHighlights"
                label="主要履职情况"
                rules={[{ required: true }]}
              >
                <Input.TextArea rows={7} />
              </Form.Item>
              <Form.Item name="suggestions" label="意见建议与后续安排">
                <Input.TextArea rows={4} />
              </Form.Item>
              <Form.Item label="报告附件">
                <Dragger
                  multiple
                  beforeUpload={() => false}
                  fileList={reportFiles}
                  onChange={({ fileList }) => setReportFiles(fileList)}
                >
                  <InboxOutlined />
                  <p>上传报告附件或其他补充材料</p>
                </Dragger>
              </Form.Item>
            </Form>
            <div className={styles.actionBar}>
              <Button onClick={() => setSelectedReportId(null)}>关闭</Button>
              <Button onClick={() => saveReport(false)}>保存完善内容</Button>
              {selectedReport.status === "待完善" ? (
                <Button type="primary" onClick={() => saveReport(true)}>
                  提交接收
                </Button>
              ) : null}
              {selectedReport.status === "待接收" ? (
                <Button
                  type="primary"
                  icon={<FileDoneOutlined />}
                  onClick={() => {
                    onReceive(selectedReport.id);
                    message.success("履职报告已接收并归档");
                  }}
                >
                  接收履职报告
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
