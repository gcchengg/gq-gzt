import { useState } from "react";
import { Button, Form, Input, Modal, Select, message } from "antd";
import { AuditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import DutyEvaluationWorkspace from "../DirectorView/components/DutyEvaluationWorkspace";
import DirectorStageTable from "../DirectorStageTable";
import StageBlocked from "../StageBlocked";
import StageDetailDrawer from "../StageDetailDrawer";
import { PageHeader } from "../../components/PageKit";
import {
  canOpenManagementDirector,
  directorStageDetailPath,
  eligibleEvaluationDirectors,
  filterDirectorsForStage,
} from "../../stageRouting";
import styles from "./index.module.less";

export default function DutyEvaluationStageView({
  resource,
  id,
  directorRecords,
  dutyPlans,
  dutyReports,
  suggestionTasks,
  generatedDirectorNames,
  evaluations,
  onCreateEvaluation,
}) {
  const navigate = useNavigate();
  const [startOpen, setStartOpen] = useState(false);
  const [startForm] = Form.useForm();
  const eligible = eligibleEvaluationDirectors(
    directorRecords,
    generatedDirectorNames,
  );
  const [selectedDirectorIds, setSelectedDirectorIds] = useState(
    eligible.map((item) => item.id),
  );
  const evaluation =
    resource === "evaluation"
      ? evaluations.find((item) => item.id === id)
      : null;
  const director =
    resource === "director"
      ? directorRecords.find((item) => item.id === id)
      : evaluation
        ? directorRecords.find((item) =>
            evaluation.directorIds.includes(item.id),
          )
        : null;
  const canOpen = canOpenManagementDirector(director, generatedDirectorNames);
  const detailOpen = resource === "director" || resource === "evaluation";

  const createEvaluation = async () => {
    const values = await startForm.validateFields();
    const directorIds = selectedDirectorIds.filter((directorId) =>
      eligible.some((item) => item.id === directorId),
    );
    if (!directorIds.length) {
      message.warning("请选择已进入履职管理的董事");
      return;
    }
    onCreateEvaluation({
      ...values,
      directorIds,
    });
    setStartOpen(false);
    startForm.resetFields();
    navigate(directorStageDetailPath("evaluation", { id: directorIds[0] }));
  };

  const renderWorkspace = (current) => {
    const plans = dutyPlans.filter(
      (item) => item.directorName === current.name,
    );
    const reports = dutyReports.filter(
      (item) => item.directorName === current.name,
    );
    const suggestions = suggestionTasks.filter(
      (item) => item.directorName === current.name,
    );
    return (
      <DutyEvaluationWorkspace
        embedded
        director={current}
        plans={plans}
        reports={reports}
        suggestionTasks={suggestions}
      />
    );
  };

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="DUTY EVALUATION"
        title="履职评价"
        subtitle="对已进入履职管理的董事发起月度、季度或年度评价"
        actions={
          <Button
            type="primary"
            icon={<AuditOutlined />}
            disabled={!eligible.length}
            onClick={() => setStartOpen(true)}
          >
            发起履职评价
          </Button>
        }
      />
      <DirectorStageTable
        directors={directorRecords}
        defaultStage="evaluation"
        generatedDirectorNames={generatedDirectorNames}
        filterDirectorsForStage={filterDirectorsForStage}
        onViewDetail={(row) =>
          navigate(directorStageDetailPath("evaluation", row))
        }
      />
      <StageDetailDrawer
        open={detailOpen}
        onClose={() => navigate("/boardGovernance/duty-evaluation")}
        title={director ? `${director.name} · 履职评价` : "未找到详情"}
        subtitle={
          evaluation
            ? `${evaluation.name} · ${evaluation.type} · ${evaluation.period}`
            : director
              ? `${director.company} · ${director.role}`
              : "该评价详情不存在或链接已失效。"
        }
      >
        {director && canOpen ? (
          renderWorkspace(director)
        ) : (
          <StageBlocked
            embedded
            title={director ? "尚未进入履职管理" : "未找到详情"}
            reason={
              director
                ? `${director.name} 还没有进入履职管理，不能打开履职评价详情。`
                : "该评价详情不存在或链接已失效。"
            }
            listTo="/boardGovernance/duty-evaluation"
            listLabel="关闭"
            nextTo={
              director
                ? `/boardGovernance/management/${director.id}`
                : undefined
            }
            nextLabel="去履职管理"
          />
        )}
      </StageDetailDrawer>
      <Modal
        open={startOpen}
        title="发起履职评价"
        okText="发起批次"
        onOk={createEvaluation}
        onCancel={() => setStartOpen(false)}
      >
        <Form
          form={startForm}
          layout="vertical"
          initialValues={{
            name: "2026年度履职评价",
            type: "年度评价",
            period: "2026-01-01 至 2026-12-31",
            deadline: "2027-01-15",
          }}
        >
          <Form.Item
            name="name"
            label="评价任务名称"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="type" label="评价类型" rules={[{ required: true }]}>
            <Select
              options={["月度评价", "季度评价", "年度评价"].map((value) => ({
                value,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="period"
            label="评价周期"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="deadline"
            label="完成期限"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="评价对象">
            <Select
              mode="multiple"
              value={selectedDirectorIds}
              onChange={setSelectedDirectorIds}
              options={eligible.map((item) => ({
                value: item.id,
                label: `${item.name} · ${item.company}`,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
