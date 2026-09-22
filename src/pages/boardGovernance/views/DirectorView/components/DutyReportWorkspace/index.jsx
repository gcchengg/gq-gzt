import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Select,
  Tabs,
} from "antd";
import { FileTextOutlined, RobotOutlined } from "@ant-design/icons";
import { SectionCard, StatusPill } from "../../../../components/PageKit";
import styles from "./index.module.less";

import ReportEditor from "./ReportEditor";

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
  const [generateForm] = Form.useForm();
  const completedPlans = useMemo(
    () => plans.filter((item) => item.taskStatus === "已完成"),
    [plans],
  );
  const selectedReport = reports.find((item) => item.id === selectedReportId);
  const visibleReports =
    reportTypeFilter === "全部报告"
      ? reports
      : reports.filter((item) => item.reportType === reportTypeFilter);

  const generateReport = async () => {
    const values = await generateForm.validateFields();
    const report = onGenerate(director, completedPlans, values);
    setGenerateOpen(false);
    generateForm.resetFields();
    setSelectedReportId(report.id);
    message.success("履职报告已根据确认完成的履职记录自动生成");
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
            description="月度采用履职写实表，季度及年度采用工作报告模板；生成后可编辑并打印。"
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
        {/* <Alert
          showIcon
          type="info"
          message={`系统将引用 ${completedPlans.length} 条已确认履职记录`}
          description="生成后可以继续完善正文、意见建议和附件，再提交董办接收。"
        /> */}
        <Form
          form={generateForm}
          layout="vertical"
          initialValues={{ reportType: "季度报告", period: "2026年第一季度" }}
        >
          <Form.Item
            name="reportType"
            label="报告类型"
            rules={[{ required: true }]}
          >
            <Select
              onChange={(value) =>
                generateForm.setFieldValue(
                  "period",
                  value === "月度报告"
                    ? "2026年1月"
                    : value === "年度报告"
                      ? "2026年度"
                      : "2026年第一季度",
                )
              }
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
        width={1280}
        title={selectedReport?.title}
        onClose={() => setSelectedReportId(null)}
        extra={
          selectedReport ? (
            <StatusPill>{selectedReport.status}</StatusPill>
          ) : null
        }
      >
        {selectedReport ? (
          <ReportEditor
            key={selectedReport.id}
            report={selectedReport}
            director={director}
            onSave={onSave}
            onReceive={onReceive}
            onClose={() => setSelectedReportId(null)}
          />
        ) : null}
      </Drawer>
    </div>
  );
}
