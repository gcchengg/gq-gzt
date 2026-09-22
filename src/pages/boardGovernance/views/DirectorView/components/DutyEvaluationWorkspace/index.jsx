import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Progress,
  Select,
  Steps,
} from "antd";
import { AuditOutlined, SettingOutlined } from "@ant-design/icons";
import {
  DataTable,
  ProgressCell,
  SectionCard,
  StatusPill,
} from "../../../../components/PageKit";
import styles from "./index.module.less";

const initialEvaluators = [
  {
    id: "ROLE-SELF",
    role: "董事本人",
    names: ["张铁斌"],
    scope: "履职总结、勤勉程度与自我改进",
    progress: 100,
    status: "已提交",
    score: 92,
    comment: "能够按计划完成重点履职任务。",
  },
  {
    id: "ROLE-TEAM",
    role: "班子成员",
    names: ["李晨光", "王珂"],
    scope: "协同表现、专业判断与决策贡献",
    progress: 50,
    status: "评价中",
  },
  {
    id: "ROLE-OFFICE",
    role: "公司董办",
    names: ["阮迪"],
    scope: "出席、表决、任务完成与材料质量",
    progress: 100,
    status: "已提交",
    score: 95,
    comment: "履职记录完整，任务成果能够按要求归档。",
  },
  {
    id: "ROLE-SUPPORT",
    role: "其他支持机构",
    names: ["陈哲", "孙博"],
    scope: "调研、培训、意见建议及成果价值",
    progress: 0,
    status: "待评价",
  },
];

const scoreFields = [
  ["diligence", "勤勉履职"],
  ["professional", "专业贡献"],
  ["collaboration", "协同质效"],
  ["value", "成果价值"],
];

export default function DutyEvaluationWorkspace({
  embedded = false,
  director,
  plans,
  reports,
  suggestionTasks,
}) {
  const [evaluation, setEvaluation] = useState({
    id: "EVA-2026-001",
    name: "2026年度履职评价",
    type: "年度评价",
    period: "2026-01-01 至 2026-12-31",
    deadline: "2027-01-15",
    status: "评价中",
    feedback: "",
  });
  const [evaluators, setEvaluators] = useState(initialEvaluators);
  const [startOpen, setStartOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [scoringRole, setScoringRole] = useState(null);
  const [startForm] = Form.useForm();
  const [configForm] = Form.useForm();
  const [scoreForm] = Form.useForm();

  useEffect(() => {
    if (!scoringRole) return;
    scoreForm.setFieldsValue({
      diligence: scoringRole.score || 90,
      professional: scoringRole.score || 90,
      collaboration: scoringRole.score || 90,
      value: scoringRole.score || 90,
      comment: scoringRole.comment || "",
    });
  }, [scoreForm, scoringRole]);

  const receivedReports = reports.filter((item) => item.status === "已接收");
  const completedPlans = plans.filter((item) => item.taskStatus === "已完成");
  const completedSuggestions = suggestionTasks.filter(
    (item) => item.status === "已完成",
  );
  const submittedCount = evaluators.filter(
    (item) => item.status === "已提交",
  ).length;
  const allSubmitted = submittedCount === evaluators.length;
  const averageScore = useMemo(() => {
    const scores = evaluators.map((item) => item.score).filter(Boolean);
    return scores.length
      ? Math.round(
          scores.reduce((sum, value) => sum + value, 0) / scores.length,
        )
      : 0;
  }, [evaluators]);

  const startEvaluation = async () => {
    const values = await startForm.validateFields();
    setEvaluation((current) => ({
      ...current,
      ...values,
      id: `EVA-${Date.now()}`,
      status: "评价中",
    }));
    setEvaluators(initialEvaluators.map((item) => ({ ...item })));
    configForm.setFieldsValue(
      Object.fromEntries(
        initialEvaluators.map((item) => [item.id, item.names]),
      ),
    );
    setStartOpen(false);
    setConfigOpen(true);
    message.success("评价任务已发起，请配置评价人员");
  };

  const openConfig = () => {
    configForm.setFieldsValue(
      Object.fromEntries(evaluators.map((item) => [item.id, item.names])),
    );
    setConfigOpen(true);
  };

  const saveConfig = async () => {
    const values = await configForm.validateFields();
    setEvaluators((current) =>
      current.map((item) => ({ ...item, names: values[item.id] })),
    );
    setConfigOpen(false);
    message.success("评价人员配置已保存，评分任务已发送");
  };

  const submitScore = async () => {
    const values = await scoreForm.validateFields();
    const score = Math.round(
      scoreFields.reduce((sum, [key]) => sum + values[key], 0) /
        scoreFields.length,
    );
    setEvaluators((current) =>
      current.map((item) =>
        item.id === scoringRole.id
          ? {
              ...item,
              score,
              progress: 100,
              status: "已提交",
              comment: values.comment,
              scoreDetail: values,
            }
          : item,
      ),
    );
    setScoringRole(null);
    message.success(`${scoringRole.role}评分已提交`);
  };

  const advanceResult = (nextStatus, successMessage) => {
    setEvaluation((current) => ({ ...current, status: nextStatus }));
    message.success(successMessage);
  };

  const currentStep =
    {
      评价中: 2,
      待审核: 3,
      待董事接收: 4,
      已接收: 5,
    }[evaluation.status] ?? 1;

  return (
    <div
      className={`${styles.workspace} ${embedded ? styles.embeddedWorkspace : ""}`}
    >
      <div className={styles.hero}>
        <div>
          <span>当前阶段 · 履职评价</span>
          <h2>用履职事实支撑分角色线上评价</h2>
          <p>从履职任务、意见建议和已接收报告中自动提取事实依据。</p>
        </div>
        <div className={styles.heroActions}>
          <Button icon={<SettingOutlined />} onClick={openConfig}>
            配置评价人员
          </Button>
          <Button
            type="primary"
            icon={<AuditOutlined />}
            onClick={() => setStartOpen(true)}
          >
            发起评价
          </Button>
        </div>
      </div>

      <SectionCard
        title={`${evaluation.name} · ${director.name}`}
        extra={<StatusPill>{evaluation.status}</StatusPill>}
      >
        <Steps
          current={currentStep}
          size={embedded ? "small" : "default"}
          items={[
            { title: "接收报告" },
            { title: "发起评价" },
            { title: "角色评分" },
            { title: "结果审核" },
            { title: "结果反馈" },
            { title: "董事接收" },
          ]}
        />
        <div className={styles.summaryGrid}>
          <div className={styles.scoreRing}>
            <Progress type="circle" percent={averageScore} size={116} />
            <span>当前综合得分</span>
          </div>
          <Descriptions
            column={2}
            items={[
              { key: "type", label: "评价类型", children: evaluation.type },
              { key: "period", label: "评价周期", children: evaluation.period },
              {
                key: "deadline",
                label: "完成期限",
                children: evaluation.deadline,
              },
              {
                key: "progress",
                label: "评分进度",
                children: `${submittedCount} / ${evaluators.length}`,
              },
            ]}
          />
        </div>
        <div className={styles.evidenceGrid}>
          <article>
            <b>{completedPlans.length}</b>
            <span>已完成履职任务</span>
          </article>
          <article>
            <b>{completedSuggestions.length}</b>
            <span>已落实意见建议</span>
          </article>
          <article>
            <b>{receivedReports.length}</b>
            <span>已接收履职报告</span>
          </article>
          <article>
            <b>{plans.flatMap((item) => item.supplementFiles || []).length}</b>
            <span>佐证材料</span>
          </article>
        </div>
      </SectionCard>

      <SectionCard
        title="评价人员与分角色评分"
        extra={
          <Button onClick={() => message.success("已提醒未完成人员")}>
            提醒未完成人员
          </Button>
        }
      >
        <DataTable
          rows={evaluators}
          scroll={embedded ? undefined : { x: "max-content" }}
          columns={[
            {
              title: "评价角色",
              dataIndex: "role",
              width: embedded ? 105 : 130,
            },
            {
              title: "评价人员",
              dataIndex: "names",
              width: embedded ? 130 : 180,
              render: (value) => value.join("、"),
            },
            {
              title: "评价内容",
              dataIndex: "scope",
              width: embedded ? 210 : 310,
            },
            {
              title: "完成进度",
              dataIndex: "progress",
              width: embedded ? 130 : 170,
              render: (value) => <ProgressCell value={value} />,
            },
            {
              title: "得分",
              dataIndex: "score",
              render: (value) => value || "—",
            },
            {
              title: "状态",
              dataIndex: "status",
              render: (value) => <StatusPill>{value}</StatusPill>,
            },
            {
              title: "操作",
              render: (_, row) => (
                <Button type="link" onClick={() => setScoringRole(row)}>
                  {row.status === "已提交" ? "查看/修改评分" : "进入评分"}
                </Button>
              ),
            },
          ]}
        />
      </SectionCard>

      <SectionCard title="评价结果审核、反馈与接收">
        {!allSubmitted && evaluation.status === "评价中" ? (
          <Alert
            showIcon
            type="info"
            message={`尚有 ${evaluators.length - submittedCount} 个角色未完成评分`}
            description="全部角色提交评分后，可汇总结果并进入审核。"
          />
        ) : null}
        <div className={styles.resultPanel}>
          <div>
            <span>综合得分</span>
            <strong>{averageScore || "—"}</strong>
            <StatusPill>{evaluation.status}</StatusPill>
          </div>
          <Input.TextArea
            rows={3}
            value={evaluation.feedback}
            placeholder="填写审核意见或向董事反馈的评价结果说明"
            onChange={(event) =>
              setEvaluation((current) => ({
                ...current,
                feedback: event.target.value,
              }))
            }
          />
          <aside>
            {evaluation.status === "评价中" ? (
              <Button
                type="primary"
                disabled={!allSubmitted}
                onClick={() => advanceResult("待审核", "评价结果已提交审核")}
              >
                汇总并提交结果审核
              </Button>
            ) : null}
            {evaluation.status === "待审核" ? (
              <>
                <Button
                  onClick={() => advanceResult("评价中", "评价结果已退回修改")}
                >
                  退回修改
                </Button>
                <Button
                  type="primary"
                  onClick={() =>
                    advanceResult("待董事接收", "审核通过，评价结果已反馈董事")
                  }
                >
                  审核通过并反馈
                </Button>
              </>
            ) : null}
            {evaluation.status === "待董事接收" ? (
              <Button
                type="primary"
                onClick={() =>
                  advanceResult("已接收", "董事已接收评价结果，评价档案已归档")
                }
              >
                接收评价结果
              </Button>
            ) : null}
          </aside>
        </div>
      </SectionCard>

      <Modal
        open={startOpen}
        title="发起履职评价"
        okText="发起并配置人员"
        onOk={startEvaluation}
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
        </Form>
      </Modal>

      <Modal
        open={configOpen}
        title="评价人员配置"
        okText="保存并发送评分任务"
        onOk={saveConfig}
        onCancel={() => setConfigOpen(false)}
        width={680}
      >
        <Alert
          showIcon
          type="info"
          message="每个评价角色可配置一名或多名人员"
        />
        <Form form={configForm} layout="vertical" className={styles.configForm}>
          {evaluators.map((item) => (
            <Form.Item
              key={item.id}
              name={item.id}
              label={`${item.role} · ${item.scope}`}
              rules={[
                { required: true, message: `请选择${item.role}评价人员` },
              ]}
            >
              <Select
                mode="tags"
                options={[
                  "张铁斌",
                  "李晨光",
                  "王珂",
                  "阮迪",
                  "陈哲",
                  "孙博",
                ].map((value) => ({ value }))}
              />
            </Form.Item>
          ))}
        </Form>
      </Modal>

      <Drawer
        open={Boolean(scoringRole)}
        title={`${scoringRole?.role} · 分角色评分`}
        width={680}
        onClose={() => setScoringRole(null)}
      >
        {scoringRole ? (
          <div className={styles.scoreDrawer}>
            <Alert
              showIcon
              type="info"
              message={`评价人员：${scoringRole.names.join("、")}`}
              description={scoringRole.scope}
            />
            <Form form={scoreForm} layout="vertical">
              <div className={styles.scoreFields}>
                {scoreFields.map(([key, label]) => (
                  <Form.Item
                    key={key}
                    name={key}
                    label={label}
                    rules={[{ required: true, message: "请评分" }]}
                  >
                    <InputNumber min={0} max={100} suffix="分" />
                  </Form.Item>
                ))}
              </div>
              <Form.Item
                name="comment"
                label="评价意见"
                rules={[{ required: true, message: "请填写评价意见" }]}
              >
                <Input.TextArea
                  rows={5}
                  placeholder="填写事实依据、主要评价和改进建议"
                />
              </Form.Item>
            </Form>
            <div className={styles.actionBar}>
              <Button onClick={() => setScoringRole(null)}>取消</Button>
              <Button type="primary" onClick={submitScore}>
                提交评分
              </Button>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
