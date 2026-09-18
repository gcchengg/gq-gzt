import {
  BellOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  FileSearchOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  Input,
  Modal,
  Progress,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Timeline,
  message,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { activity, evaluations } from "./data";
import styles from "./index.module.less";
import wb from "./workbench.module.less";
import PageHelp from "./components/PageHelp";
import EvaluationAnalytics from "./components/EvaluationAnalytics";
import EvaluationRecordsDrawer from "./components/EvaluationRecordsDrawer";
import Enrollment from "./Enrollment";
import Calls from "./Calls";
import { log, uid, updateStore, useExpertStore } from "./store";
import {
  compareAverageScore,
  filterByRange,
  normalizeEvaluationRecords,
} from "./evaluationAnalytics";
import {
  expertStatusColor,
  expertStatusHint,
  expertStatusStrip,
  expertStatusTone,
} from "./stages";

const statusColor = {
  可用: "success",
  忙碌: "processing",
  待续聘: "warning",
  续聘审批中: "processing",
  待签发续聘聘书: "gold",
  已解聘: "default",
  限制调用: "error",
  服务中: "processing",
  待验收: "warning",
  匹配中: "purple",
  待评价: "cyan",
};

function dateText(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function fixedTermEnd(start) {
  const date = new Date(`${start}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  date.setFullYear(date.getFullYear() + 3);
  date.setDate(date.getDate() - 1);
  return dateText(date);
}
function ageLimit(expert) {
  return expert.highLevel ? 70 : 65;
}
function ageLimitDate(expert) {
  const date = new Date(`${expert.birth}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  date.setFullYear(date.getFullYear() + ageLimit(expert));
  return dateText(date);
}
function currentAge(birth) {
  const born = new Date(`${birth}T00:00:00`);
  const today = new Date();
  if (Number.isNaN(born.getTime())) return "—";
  let age = today.getFullYear() - born.getFullYear();
  if (
    today.getMonth() < born.getMonth() ||
    (today.getMonth() === born.getMonth() && today.getDate() < born.getDate())
  )
    age -= 1;
  return age;
}
function daysUntil(value) {
  const target = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / 86400000);
}
function warningInfo(expert) {
  if (expert.status === "已解聘")
    return { type: "default", text: "专家已解聘" };
  const termDays = daysUntil(expert.termEnd);
  const ageDays = daysUntil(ageLimitDate(expert));
  if (ageDays >= 0 && ageDays <= 90)
    return {
      type: "error",
      text: `距${ageLimit(expert)}周岁年龄上限还有${ageDays}天`,
      ageWarning: true,
    };
  if (termDays >= 0 && termDays <= 90)
    return {
      type: "warning",
      text: `距当前聘期结束还有${termDays}天`,
      termWarning: true,
    };
  return { type: "success", text: "当前聘期正常" };
}

function Shell({ title, subtitle, actions, children }) {
  return (
    <div className={styles.shell}>
      <section className={styles.main}>
        <div className={styles.page}>
          <div className={styles.pageHead}>
            <div>
              <h1>
                {title}
                <PageHelp page={title} />
              </h1>
              <p>{subtitle}</p>
            </div>
            <Space>{actions}</Space>
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, delta, icon: Icon, tone = "blue" }) {
  return (
    <article className={`${styles.stat} ${styles[tone]}`}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{delta}</small>
      </div>
      <i>
        <Icon />
      </i>
    </article>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { tasks: taskRecords } = useExpertStore();
  const [evaluationRange, setEvaluationRange] = useState("12m");
  const [evaluationDrawerOpen, setEvaluationDrawerOpen] = useState(false);
  const [evaluationRetry, setEvaluationRetry] = useState(0);
  const evaluationBundle = useMemo(() => {
    try {
      return {
        records: normalizeEvaluationRecords(taskRecords, evaluations),
        error: false,
      };
    } catch {
      return { records: [], error: true };
    }
  }, [evaluationRetry, taskRecords]);
  const evaluationRecords = evaluationBundle.records;
  const visibleEvaluationRecords = useMemo(
    () => filterByRange(evaluationRecords, evaluationRange),
    [evaluationRange, evaluationRecords],
  );
  const evaluationAverageDelta = useMemo(
    () => compareAverageScore(evaluationRecords, evaluationRange),
    [evaluationRange, evaluationRecords],
  );
  return (
    <Shell
      title="专家库看板"
      subtitle="汇聚专业智慧，让每一次专家调用都有依据、可追溯"
    >
      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>EXPERT INTELLIGENCE CENTER</span>
          <h2>
            今天有 <b>7 项</b> 专家业务待您处理
          </h2>
          <p>4 项入库审核 · 2 项候选确认 · 1 项交付验收</p>
          <Space>
            <Button
              type="primary"
              onClick={() =>
                navigate("/expertTalentList", {
                  state: { expertManagementTab: "enrollment" },
                })
              }
            >
              处理待办
            </Button>
            <Button onClick={() => navigate("/expertTalentList")}>
              查找专家
            </Button>
          </Space>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.orbit}>
            <span>专家</span>
            <i />
            <i />
            <i />
          </div>
          <b>86%</b>
          <small>核心领域覆盖率</small>
        </div>
      </section>
      <section className={styles.stats}>
        <StatCard
          label="在库专家"
          value="286"
          delta="较上月 +12"
          icon={TeamOutlined}
        />
        <StatCard
          label="当前可用"
          value="219"
          delta="可用率 76.6%"
          icon={CheckCircleOutlined}
          tone="green"
        />
        <StatCard
          label="本月调用"
          value="34"
          delta="平均匹配 1.8天"
          icon={FileSearchOutlined}
          tone="orange"
        />
        <StatCard
          label="任务完成率"
          value="94%"
          delta="按期完成 32 项"
          icon={CheckCircleOutlined}
          tone="red"
        />
      </section>
      <EvaluationAnalytics
        records={visibleEvaluationRecords}
        range={evaluationRange}
        averageDelta={evaluationAverageDelta}
        onRangeChange={setEvaluationRange}
        onOpenRecords={() => setEvaluationDrawerOpen(true)}
        error={evaluationBundle.error}
        onRetry={() => setEvaluationRetry((count) => count + 1)}
      />
      <div className={styles.dashboardGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h3>我的待办</h3>
              <p>按紧急程度排序</p>
            </div>
            <Button
              type="link"
              onClick={() =>
                navigate("/expertTalentList", {
                  state: { expertManagementTab: "enrollment" },
                })
              }
            >
              查看全部
            </Button>
          </div>
          <div className={styles.todoList}>
            {[
              ["入库审核", "许文博 · 机器人与具身智能", "今天 16:00", "red"],
              ["候选确认", "参股企业治理机制优化咨询", "剩余 6 小时", "orange"],
              ["交付验收", "动力电池标的技术尽调", "明天到期", "blue"],
              ["专家评价", "汽车芯片国产化专题研判", "待评价", "green"],
            ].map(([type, text, time, tone]) => (
              <button
                key={text}
                onClick={() =>
                  type === "入库审核"
                    ? navigate("/expertTalentList", {
                        state: { expertManagementTab: "enrollment" },
                      })
                    : navigate("/expertTalentTasks")
                }
              >
                <i className={styles[tone]}>{type.slice(0, 1)}</i>
                <span>
                  <b>{type}</b>
                  {text}
                </span>
                <em>{time}</em>
                <strong>›</strong>
              </button>
            ))}
          </div>
        </section>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h3>领域覆盖</h3>
              <p>可用专家结构</p>
            </div>
            <span className={styles.liveDot}>实时</span>
          </div>
          <div className={styles.coverage}>
            {[
              ["产业研究", 78, 92],
              ["技术研发", 64, 84],
              ["资本运营", 52, 76],
              ["财务法务", 48, 68],
              ["企业运营", 44, 61],
            ].map(([name, count, p]) => (
              <div key={name}>
                <span>{name}</span>
                <div>
                  <i style={{ width: `${p}%` }} />
                </div>
                <b>{count}</b>
              </div>
            ))}
          </div>
          <div className={styles.shortage}>
            <b>紧缺领域</b>
            <Tag color="volcano">具身智能</Tag>
            <Tag color="gold">汽车芯片</Tag>
            <Tag>海外合规</Tag>
          </div>
        </section>
        <section className={`${styles.panel} ${styles.activityPanel}`}>
          <div className={styles.panelHead}>
            <div>
              <h3>业务动态</h3>
              <p>近期关键节点</p>
            </div>
          </div>
          <Timeline
            items={activity.map((item) => ({
              color: item.tone,
              children: (
                <div className={styles.activity}>
                  <time>{item.time}</time>
                  <b>{item.title}</b>
                  <small>{item.meta}</small>
                </div>
              ),
            }))}
          />
        </section>
      </div>
      <EvaluationRecordsDrawer
        open={evaluationDrawerOpen}
        onClose={() => setEvaluationDrawerOpen(false)}
        records={visibleEvaluationRecords}
      />
    </Shell>
  );
}

function ExpertDrawer({ expert, open, onClose }) {
  const navigate = useNavigate();
  const { tasks } = useExpertStore();
  const [renewOpen, setRenewOpen] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);
  const [dismissOpen, setDismissOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [renewForm] = Form.useForm();
  const [letterForm] = Form.useForm();
  const [dismissForm] = Form.useForm();
  if (!expert) return null;
  const warning = warningInfo(expert);
  const limitDate = ageLimitDate(expert);
  const canRenew =
    expert.status === "待续聘" ||
    (warning.termWarning &&
      ["可用", "忙碌", "限制调用"].includes(expert.status));
  const canDismiss =
    warning.ageWarning &&
    ["可用", "忙碌", "限制调用", "待续聘"].includes(expert.status);
  const formallyEmployed =
    (expert.appointmentHistory || []).some(
      (item) => item.status === "已签署" || item.signedAt,
    ) && daysUntil(expert.termEnd) >= 0;
  const canCall =
    formallyEmployed && !["限制调用", "已解聘"].includes(expert.status);
  const callTip = !formallyEmployed
    ? "尚未正式聘用或聘期已结束，不可发起调用"
    : ["限制调用", "已解聘"].includes(expert.status)
      ? `当前状态为“${expert.status}”，不可发起调用`
      : "发起专家调用申请";
  const callRecords = tasks.filter((task) => task.expertId === expert.id);
  const evaluationRecords = callRecords.flatMap((task) => {
    const evaluations = Array.isArray(task.evaluations)
      ? task.evaluations
      : task.evaluation
        ? [task.evaluation]
        : [];
    return evaluations.map((evaluation, index) => ({
      ...evaluation,
      key: `${task.id}-${evaluation.submittedAt}-${index}`,
      project: task.project,
      reviewLabel: index === 0 ? "首次评价" : `复评 ${index}`,
    }));
  });
  function save(mutator, success) {
    try {
      updateStore(mutator);
      message.success(success);
      return true;
    } catch (error) {
      message.error(error.message || "保存失败");
      return false;
    }
  }
  async function startRenewal() {
    const values = await renewForm.validateFields();
    if (values.termEnd !== fixedTermEnd(values.termStart))
      return message.error(
        `新聘期固定3年，结束日期应为${fixedTermEnd(values.termStart)}`,
      );
    if (values.termStart <= expert.termEnd)
      return message.error("新聘期起始日须晚于当前聘期结束日");
    if (values.termEnd > limitDate)
      return message.error(
        `新聘期不得超过${ageLimit(expert)}周岁年龄上限${limitDate}`,
      );
    Modal.confirm({
      title: "确认发起续聘审批？",
      content: `拟续聘期限为${values.termStart}至${values.termEnd}，提交后将在原工作台生成分管领导审批待办。`,
      okText: "确认发起",
      cancelText: "取消",
      onOk: () => {
        if (
          save((store) => {
            const item = store.experts.find((entry) => entry.id === expert.id);
            if (!item || !canRenew) throw new Error("当前状态不可发起续聘");
            item.status = "续聘审批中";
            item.flowId = uid("RENEW-FLOW");
            item.renewal = {
              ...values,
              requestedAt: new Date().toLocaleString("zh-CN"),
            };
            item.history.push(
              log(
                "股权运营部（演示）",
                `发起续聘审批：${values.reason}；拟聘期${values.termStart}至${values.termEnd}`,
              ),
            );
          }, "续聘申请已发起，请在原工作台审批")
        )
          setRenewOpen(false);
      },
    });
  }
  async function signRenewal() {
    const values = await letterForm.validateFields();
    const expectedEnd = fixedTermEnd(values.termStart);
    if (values.termEnd !== expectedEnd)
      return message.error(`续聘聘期固定3年，结束日期应为${expectedEnd}`);
    if (values.termEnd > limitDate)
      return message.error(
        `聘期不得超过${ageLimit(expert)}周岁年龄上限${limitDate}`,
      );
    Modal.confirm({
      title: "确认续聘聘书已签订？",
      content: `聘书编号${values.number}，新聘期${values.termStart}至${values.termEnd}。确认后续聘正式生效。`,
      okText: "确认完成续聘",
      cancelText: "取消",
      onOk: () => {
        if (
          save((store) => {
            const item = store.experts.find((entry) => entry.id === expert.id);
            if (!item || item.status !== "待签发续聘聘书")
              throw new Error("当前状态不可签发续聘聘书");
            const appointment = { ...values, years: 3 };
            item.appointmentHistory.push(appointment);
            item.termStart = values.termStart;
            item.termEnd = values.termEnd;
            item.status = "可用";
            item.risk = "正常";
            delete item.renewal;
            delete item.flowId;
            item.history.push(
              log(
                "股权运营部（演示）",
                `签发续聘聘书${values.number}，新聘期${values.termStart}至${values.termEnd}，附件${values.attachment}`,
              ),
            );
          }, "续聘聘书已签发，续聘完成")
        )
          setLetterOpen(false);
      },
    });
  }
  async function dismiss() {
    const values = await dismissForm.validateFields();
    Modal.confirm({
      title: "确认主动解聘该专家？",
      content: `解聘原因：${values.reason}；生效日期：${values.effectiveDate}。提交后专家状态将变为“已解聘”。`,
      okText: "确认解聘",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: () => {
        if (
          save((store) => {
            const item = store.experts.find((entry) => entry.id === expert.id);
            if (!item || !canDismiss) throw new Error("当前状态不可主动解聘");
            item.status = "已解聘";
            item.dismissal = {
              ...values,
              submittedAt: new Date().toLocaleString("zh-CN"),
            };
            item.history.push(
              log(
                "股权运营部（演示）",
                `主动解聘：${values.reason}；${values.effectiveDate}生效；说明：${values.note}`,
              ),
            );
          }, "主动解聘已登记")
        )
          setDismissOpen(false);
      },
    });
  }
  function openRenewal() {
    const start = new Date(`${expert.termEnd}T00:00:00`);
    start.setDate(start.getDate() + 1);
    const termStart = dateText(start);
    renewForm.resetFields();
    renewForm.setFieldsValue({
      ...expert.renewal,
      termStart,
      termEnd: fixedTermEnd(termStart),
    });
    setRenewOpen(true);
  }
  function openLetter() {
    const termStart = expert.renewal?.termStart;
    letterForm.resetFields();
    letterForm.setFieldsValue({
      signedAt: dateText(new Date()),
      termStart,
      termEnd: fixedTermEnd(termStart),
    });
    setLetterOpen(true);
  }
  function startCall() {
    if (!canCall) return;
    onClose?.();
    navigate(
      `/expertTalentTasks?create=1&expertId=${encodeURIComponent(expert.id)}`,
    );
  }
  return (
    <Drawer
      width="min(880px, 92vw)"
      open={open}
      onClose={onClose}
      title="专家档案"
      extra={
        <Button
          type="primary"
          disabled={!canCall}
          title={callTip}
          onClick={startCall}
        >
          发起调用
        </Button>
      }
    >
      <div className={wb.drawerBody}>
        <div className={wb.profileHead}>
          <Avatar size={68} style={{ background: "#dbeafe", color: "#1d4ed8" }}>
            {expert.initials}
          </Avatar>
          <div>
            <h2>
              {expert.name}{" "}
              <Tag
                color={
                  expertStatusColor(expert.status) || statusColor[expert.status]
                }
              >
                {expert.status}
              </Tag>
            </h2>
            <p>
              {expert.company} · {expert.title}
            </p>
            <Space wrap>
              {expert.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </Space>
          </div>
          <div className={wb.score}>
            <strong>{expert.score}</strong>
            <span>综合评分</span>
          </div>
        </div>
        <Tabs
          items={[
            {
              key: "basic",
              label: "基本档案",
              children: (
                <>
                  <Descriptions
                    column={2}
                    bordered
                    size="small"
                    items={[
                      { key: 1, label: "专家编号", children: expert.id },
                      { key: 2, label: "专家等级", children: expert.level },
                      { key: 3, label: "专家类别", children: expert.category },
                      { key: 4, label: "主领域", children: expert.field },
                      { key: 5, label: "联系电话", children: "138****5621" },
                      { key: 6, label: "出生日期", children: expert.birth },
                      {
                        key: 7,
                        label: "服务意愿",
                        children: expert.availability,
                      },
                      {
                        key: 8,
                        label: "历史项目",
                        children: `${expert.projects} 个`,
                      },
                    ]}
                  />
                  <h3 className={wb.sectionTitle}>专业画像</h3>
                  <div className={wb.insight}>
                    <b>擅长方向</b>
                    <p>
                      长期从事汽车产业趋势、技术路线与商业化研究，具备多项集团级战略课题及投资项目咨询经验。
                    </p>
                  </div>
                </>
              ),
            },
            {
              key: "appointment",
              label: "聘期管理",
              children: (
                <div className={wb.appointmentPane}>
                  <Alert
                    showIcon
                    type={warning.type === "default" ? "info" : warning.type}
                    message={warning.text}
                    description={`系统在聘期结束或年龄上限前90天触发预警；${expert.highLevel ? "高层次专家" : "普通专家"}上限为${ageLimit(expert)}周岁。`}
                  />
                  <Descriptions
                    column={2}
                    bordered
                    size="small"
                    items={[
                      { key: 1, label: "出生日期", children: expert.birth },
                      {
                        key: 2,
                        label: "年龄 / 上限日期",
                        children: `${currentAge(expert.birth)}周岁 / ${limitDate}（上限${ageLimit(expert)}周岁）`,
                      },
                      {
                        key: 3,
                        label: "当前聘期",
                        span: 2,
                        children: `${expert.termStart || "—"} 至 ${expert.termEnd || "—"}`,
                      },
                      {
                        key: 4,
                        label: "续聘审批流程",
                        span: 2,
                        children: expert.flowId || "—",
                      },
                    ]}
                  />
                  <Space wrap>
                    {canRenew ? (
                      <Button type="primary" onClick={openRenewal}>
                        发起续聘
                      </Button>
                    ) : null}
                    {expert.status === "待签发续聘聘书" ? (
                      <Button type="primary" onClick={openLetter}>
                        登记续聘聘书
                      </Button>
                    ) : null}
                    {canDismiss ? (
                      <Button
                        danger
                        onClick={() => {
                          dismissForm.resetFields();
                          dismissForm.setFieldsValue({
                            effectiveDate: dateText(new Date()),
                          });
                          setDismissOpen(true);
                        }}
                      >
                        主动解聘
                      </Button>
                    ) : null}
                  </Space>
                  <h3 className={wb.sectionTitle}>历史聘书</h3>
                  <Table
                    rowKey="number"
                    size="small"
                    pagination={false}
                    columns={[
                      { title: "聘书编号", dataIndex: "number" },
                      { title: "签订日", dataIndex: "signedAt" },
                      {
                        title: "聘期",
                        render: (_, r) => `${r.termStart} 至 ${r.termEnd}`,
                      },
                      { title: "附件", dataIndex: "attachment" },
                    ]}
                    dataSource={expert.appointmentHistory || []}
                  />
                </div>
              ),
            },
            {
              key: "service",
              label: `调用记录 ${evaluationRecords.length}`,
              children: (
                <Table
                  pagination={false}
                  size="small"
                  columns={[
                    { title: "项目", dataIndex: "project" },
                    { title: "评价类型", dataIndex: "reviewLabel" },
                    {
                      title: "综合评分",
                      dataIndex: "total",
                      render: (value) => `${value} 分`,
                    },
                    { title: "评价结果", dataIndex: "result" },
                    { title: "评价时间", dataIndex: "submittedAt" },
                    {
                      title: "操作",
                      width: 110,
                      render: (_, evaluation) => (
                        <Button
                          type="link"
                          onClick={() => setSelectedEvaluation(evaluation)}
                        >
                          查看详情
                        </Button>
                      ),
                    },
                  ]}
                  dataSource={evaluationRecords}
                  locale={{ emptyText: "暂无评价或复评记录" }}
                />
              ),
            },
            {
              key: "risk",
              label: "合规与轨迹",
              children: (
                <Timeline
                  items={(expert.history || []).map((item, index) => ({
                    key: index,
                    color: index === 0 ? "blue" : "gray",
                    children: `${item.at} · ${item.actor} · ${item.text}`,
                  }))}
                />
              ),
            },
          ]}
        />
        <Drawer
          title={`${selectedEvaluation?.reviewLabel || "评价"} · 评价详情`}
          open={!!selectedEvaluation}
          onClose={() => setSelectedEvaluation(null)}
          width="min(680px, 88vw)"
        >
          {selectedEvaluation ? (
            <Descriptions
              bordered
              column={1}
              items={[
                { key: 1, label: "项目", children: selectedEvaluation.project },
                {
                  key: 2,
                  label: "评价类型",
                  children: selectedEvaluation.reviewLabel,
                },
                {
                  key: 3,
                  label: "综合评分",
                  children: `${selectedEvaluation.total}分 · ${selectedEvaluation.result}`,
                },
                {
                  key: 4,
                  label: "评价时间",
                  children: selectedEvaluation.submittedAt,
                },
                {
                  key: 5,
                  label: "交付质量",
                  children: `${selectedEvaluation.delivery}/50`,
                },
                {
                  key: 6,
                  label: "响应效率",
                  children: `${selectedEvaluation.response}/30`,
                },
                {
                  key: 7,
                  label: "服务态度",
                  children: `${selectedEvaluation.attitude}/20`,
                },
                {
                  key: 8,
                  label: "观点回溯",
                  children: selectedEvaluation.retrospective || "待回溯",
                },
                {
                  key: 9,
                  label: "评价标签",
                  children: (selectedEvaluation.tags || []).join("、") || "—",
                },
                {
                  key: 10,
                  label: "评价说明",
                  children: selectedEvaluation.comment || "—",
                },
              ]}
            />
          ) : null}
        </Drawer>
        <Modal
          title="发起续聘"
          open={renewOpen}
          onCancel={() => setRenewOpen(false)}
          onOk={startRenewal}
          okText="发起审批"
        >
          <Form form={renewForm} layout="vertical">
            <Form.Item
              name="reason"
              label="续聘理由"
              rules={[
                { required: true, whitespace: true, message: "请填写续聘理由" },
              ]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item
              name="termStart"
              label="新聘期起始日"
              rules={[{ required: true, message: "请输入起始日" }]}
            >
              <Input
                type="date"
                onChange={(e) =>
                  renewForm.setFieldValue(
                    "termEnd",
                    fixedTermEnd(e.target.value),
                  )
                }
              />
            </Form.Item>
            <Form.Item
              name="termEnd"
              label="新聘期结束日（自动3年）"
              rules={[{ required: true }]}
            >
              <Input type="date" readOnly />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="登记续聘聘书"
          open={letterOpen}
          onCancel={() => setLetterOpen(false)}
          onOk={signRenewal}
          okText="完成续聘"
        >
          <Form form={letterForm} layout="vertical">
            <Form.Item
              name="number"
              label="聘书编号"
              rules={[
                { required: true, whitespace: true, message: "请输入聘书编号" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="signedAt"
              label="签订日"
              rules={[{ required: true }]}
            >
              <Input type="date" />
            </Form.Item>
            <Form.Item
              name="termStart"
              label="起始日"
              rules={[{ required: true }]}
            >
              <Input
                type="date"
                onChange={(e) =>
                  letterForm.setFieldValue(
                    "termEnd",
                    fixedTermEnd(e.target.value),
                  )
                }
              />
            </Form.Item>
            <Form.Item
              name="termEnd"
              label="结束日（自动3年）"
              rules={[{ required: true }]}
            >
              <Input type="date" readOnly />
            </Form.Item>
            <Form.Item
              name="attachment"
              label="聘书附件"
              rules={[
                { required: true, whitespace: true, message: "请登记聘书附件" },
              ]}
            >
              <Input placeholder="如：续聘聘书.pdf" />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="主动解聘"
          open={dismissOpen}
          onCancel={() => setDismissOpen(false)}
          onOk={dismiss}
          okText="提交解聘"
          okButtonProps={{ danger: true }}
        >
          <Form form={dismissForm} layout="vertical">
            <Form.Item
              name="reason"
              label="解聘原因"
              rules={[
                { required: true, whitespace: true, message: "请填写解聘原因" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="effectiveDate"
              label="生效日期"
              rules={[{ required: true, message: "请选择生效日期" }]}
            >
              <Input type="date" />
            </Form.Item>
            <Form.Item
              name="note"
              label="情况说明"
              rules={[
                { required: true, whitespace: true, message: "请填写情况说明" },
              ]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Drawer>
  );
}

function ExpertList({ embedded = false }) {
  const { experts } = useExpertStore();
  const [keyword, setKeyword] = useState("");
  const [field, setField] = useState();
  const [status, setStatus] = useState();
  const [selected, setSelected] = useState(null);
  const [exitExpert, setExitExpert] = useState(null);
  const [exitReason, setExitReason] = useState("");
  const statusCounts = useMemo(() => {
    const counts = {};
    experts.forEach((item) => {
      counts[item.status] = (counts[item.status] || 0) + 1;
    });
    return counts;
  }, [experts]);
  const rows = useMemo(
    () =>
      experts.filter(
        (x) =>
          (!keyword ||
            [x.name, x.company, x.id, ...x.tags].join(" ").includes(keyword)) &&
          (!field || x.field === field) &&
          (!status || x.status === status),
      ),
    [experts, keyword, field, status],
  );
  function requestExit(expert) {
    setExitExpert(expert);
    setExitReason(
      expert.score < 60
        ? "综合评分低于60分，建议退出专家库"
        : "个人原因申请退出专家库",
    );
  }
  function submitExitRequest() {
    if (!exitExpert || !exitReason.trim()) {
      message.warning("请填写退出原因");
      return;
    }
    try {
      updateStore((store) => {
        const item = store.experts.find((entry) => entry.id === exitExpert.id);
        if (!item || item.status === "已解聘")
          throw new Error("当前专家不可申请退出");
        item.exitRequest = {
          reason: exitReason.trim(),
          score: item.score,
          submittedAt: new Date().toLocaleString("zh-CN"),
          status: "待审核",
        };
        item.history.push(
          log(
            "股权运营部（演示）",
            `提交退出申请：${exitReason.trim()}；综合评分${item.score}分`,
          ),
        );
      });
      message.success("退出申请已提交，待审核");
      setExitExpert(null);
      setExitReason("");
    } catch (error) {
      message.error(error.message || "退出申请提交失败");
    }
  }
  const columns = [
    {
      title: "专家",
      dataIndex: "name",
      width: 220,
      render: (_, r) => (
        <button className={wb.person} onClick={() => setSelected(r)}>
          <Avatar style={{ background: "#dbeafe", color: "#1d4ed8" }}>
            {r.initials}
          </Avatar>
          <span>
            <b>{r.name}</b>
            <small>
              {r.id} · {r.title}
            </small>
          </span>
        </button>
      ),
    },
    { title: "单位", dataIndex: "company", ellipsis: true },
    {
      title: "领域与标签",
      dataIndex: "field",
      width: 250,
      render: (_, r) => (
        <div className={wb.personCell}>
          <strong>{r.field}</strong>
          <span className={wb.tags}>
            {r.tags.slice(0, 2).map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </span>
        </div>
      ),
    },
    { title: "等级", dataIndex: "level", width: 100 },
    {
      title: "状态",
      dataIndex: "status",
      width: 130,
      render: (v) => (
        <Tag color={expertStatusColor(v) || statusColor[v]}>{v}</Tag>
      ),
    },
    { title: "历史项目数", dataIndex: "projects", width: 100 },
    {
      title: "综合评分",
      dataIndex: "score",
      width: 110,
      render: (value) => (
        <Tag color={value < 60 ? "error" : value < 75 ? "warning" : "success"}>
          {value} 分
        </Tag>
      ),
    },
    { title: "可服务时间", dataIndex: "availability", width: 120 },
    {
      title: "操作",
      width: 190,
      render: (_, r) => (
        <Space size={0}>
          <Button type="link" onClick={() => setSelected(r)}>
            查看档案
          </Button>
          {r.status !== "已解聘" ? (
            <Button
              type="link"
              danger={r.score < 60}
              onClick={() => requestExit(r)}
            >
              申请退出
            </Button>
          ) : null}
        </Space>
      ),
    },
  ];
  return (
    <div className={embedded ? undefined : wb.page}>
      <div className={embedded ? undefined : wb.content}>
        {embedded ? null : (
          <div className={wb.pageHead}>
            <div>
              <h1>
                专家人才库
                <PageHelp page="专家人才库" />
              </h1>
              <p>一人一档，统一检索专家能力、履历、服务与合规信息</p>
            </div>
            <div className={wb.headActions}>
              <Button>导出</Button>
              <Button type="primary" icon={<PlusOutlined />}>
                邀请专家
              </Button>
            </div>
          </div>
        )}
        <div className={wb.stageStrip}>
          <button
            type="button"
            className={`${wb.stageItem} ${status ? "" : wb.active}`}
            onClick={() => setStatus()}
          >
            <span>
              <i style={{ background: "#2563eb" }} />
              全部专家
            </span>
            <b>{experts.length}</b>
          </button>
          {expertStatusStrip.map((item) => (
            <button
              type="button"
              key={item}
              title={expertStatusHint(item)}
              className={`${wb.stageItem} ${status === item ? wb.active : ""}`}
              onClick={() => setStatus(status === item ? undefined : item)}
            >
              <span>
                <i style={{ background: expertStatusTone(item) }} />
                {item}
              </span>
              <b>{statusCounts[item] || 0}</b>
            </button>
          ))}
        </div>
        <Card className={wb.card}>
          <section className={wb.filter}>
            <Input
              className={wb.filterSearch}
              allowClear
              prefix={<SearchOutlined />}
              placeholder="搜索姓名、单位、专家编号或技术关键词"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Select
              allowClear
              placeholder="主领域"
              style={{ width: 180 }}
              value={field}
              onChange={setField}
              options={[...new Set(experts.map((x) => x.field))].map((v) => ({
                label: v,
                value: v,
              }))}
            />
            <Button
              onClick={() => {
                setKeyword("");
                setField();
                setStatus();
              }}
            >
              重置
            </Button>
            <span className={wb.filterMeta}>共 {rows.length} 位</span>
          </section>
          {status ? (
            <div className={wb.tableTop}>
              <span className={wb.filterChip}>
                已按「{status}」筛选
                <Button type="link" size="small" onClick={() => setStatus()}>
                  清除
                </Button>
              </span>
            </div>
          ) : null}
          <Table
            rowKey="id"
            columns={columns}
            dataSource={rows}
            scroll={{ x: "max-content" }}
            pagination={{
              pageSize: 8,
              showSizeChanger: false,
              showTotal: (t) => `共 ${t} 位专家`,
            }}
          />
        </Card>
      </div>
      <ExpertDrawer
        expert={experts.find((item) => item.id === selected?.id)}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
      <Modal
        title="申请退出专家库"
        open={!!exitExpert}
        onCancel={() => setExitExpert(null)}
        onOk={submitExitRequest}
        okText="提交申请"
        okButtonProps={{ danger: exitExpert?.score < 60 }}
      >
        {exitExpert ? (
          <>
            <Alert
              showIcon
              type={exitExpert.score < 60 ? "warning" : "info"}
              message={`当前综合评分：${exitExpert.score}分`}
              description={
                exitExpert.score < 60
                  ? "综合评分低于60分，系统建议申请退出。"
                  : "当前评分合格，仍可基于个人意愿或其他原因申请退出。"
              }
            />
            <Input.TextArea
              style={{ marginTop: 16 }}
              rows={4}
              value={exitReason}
              onChange={(event) => setExitReason(event.target.value)}
              placeholder="请填写退出原因"
            />
          </>
        ) : null}
      </Modal>
    </div>
  );
}

function Tasks() {
  return <Calls />;
}

function Operations() {
  const saved = useMemo(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("expert-operations-config-v1")) || {}
      );
    } catch {
      return {};
    }
  }, []);
  const [selected, setSelected] = useState("标签与分类");
  const [weights, setWeights] = useState(
    saved.weights || {
      tag: 35,
      scene: 20,
      quality: 15,
      trace: 10,
      time: 10,
      balance: 10,
    },
  );
  const [categories, setCategories] = useState(
    saved.categories || [
      "产业研究",
      "技术研发",
      "资本运营",
      "财务法务",
      "企业运营",
      "高层次专家",
    ],
  );
  const [domains, setDomains] = useState(
    saved.domains || [
      "智能网联",
      "新能源动力",
      "汽车软件",
      "产业投资",
      "公司治理",
      "财务审计",
      "供应链",
      "海外合规",
    ],
  );
  const [rules, setRules] = useState(
    saved.rules || {
      normalAge: 65,
      highAge: 70,
      termYears: 3,
      minYears: 8,
      warningDays: 90,
    },
  );
  const [notices, setNotices] = useState(
    saved.notices || { sms: true, mini: true, todo: true, expiry: true },
  );
  const defaultFees = [
    ["外聘", "两院院士", 2500, "税后"],
    ["外聘", "高级专家", 2000, "税后"],
    ["外聘", "正高级职称 / 教授", 1500, "税后"],
    ["外聘", "副高级职称 / 副教授", 1000, "税后"],
    ["外聘", "中级职称", 800, "税后"],
    ["外聘", "其他人员", 500, "税后"],
    ["内部", "首席科学家", 2000, "业余 / 税前（工作时间1500）"],
    ["内部", "专家、总师、正高级", 1500, "业余 / 税前（工作时间1000）"],
    ["内部", "主任级、副高级", 800, "业余 / 税前（工作时间500）"],
    ["内部", "主管级、中级", 600, "业余 / 税前（工作时间400）"],
    ["内部", "其他人员", 400, "业余 / 税前（工作时间250）"],
  ];
  const [fees, setFees] = useState(
    saved.fees ||
      defaultFees.map(([source, level, amount, note], index) => ({
        key: index,
        source,
        level,
        amount,
        note,
        status: "启用",
      })),
  );
  const [templatePreview, setTemplatePreview] = useState(null);
  const configs = [
    {
      title: "标签与分类",
      desc: "专家类别、主领域、细分方向和技术关键词",
      count: `${categories.length + domains.length} 项`,
      icon: TeamOutlined,
    },
    {
      title: "准入与等级",
      desc: "专业等级、可承担角色、聘期与准入规则",
      count: "5 项规则",
      icon: SafetyCertificateOutlined,
    },
    {
      title: "匹配策略",
      desc: "候选评分权重、均衡轮换与并行任务上限",
      count: "V2.3 生效中",
      icon: SearchOutlined,
    },
    {
      title: "费用标准",
      desc: "按来源、职级、形式、时长匹配费用标准",
      count: `${fees.length} 条标准`,
      icon: DatabaseOutlined,
    },
    {
      title: "表单与模板",
      desc: "邀请函、聘书、承诺、评价及消息模板",
      count: "6 个模板",
      icon: FileSearchOutlined,
    },
    {
      title: "通知与日志",
      desc: "消息触达、权限范围及关键操作日志",
      count: "4 项通知",
      icon: BellOutlined,
    },
  ];
  const templates = [
    ["专家合作邀请函", "入库邀请", "V1.2"],
    ["专家聘书", "聘书签署", "V1.1"],
    ["专家调用申请表", "调用申请", "V1.3"],
    ["利害关系承诺声明", "调用邀约", "V1.2"],
    ["咨询记录", "成果与验收", "V1.4"],
    ["履约评价表", "任务评价", "V1.0"],
  ].map(([name, scene, version]) => ({
    key: name,
    name,
    scene,
    version,
    status: "生效中",
    updated: "2026-09-05",
  }));
  const audits = [
    {
      key: 1,
      time: "2026-09-07 15:20",
      actor: "管理员·郑华峰",
      action: "调整候选匹配权重",
      result: "成功",
    },
    {
      key: 2,
      time: "2026-09-06 11:08",
      actor: "运营部·王琳",
      action: "启用咨询记录 V1.4",
      result: "成功",
    },
    {
      key: 3,
      time: "2026-09-05 17:42",
      actor: "系统",
      action: "同步专家费用标准",
      result: "成功",
    },
  ];
  function saveConfig() {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    if (total !== 100) return message.error("匹配权重合计必须为100%");
    localStorage.setItem(
      "expert-operations-config-v1",
      JSON.stringify({ weights, categories, domains, rules, notices, fees }),
    );
    message.success("运营配置已保存到当前浏览器，并生成演示版本 V2.4");
  }
  function updateFee(key, field, value) {
    setFees((current) =>
      current.map((fee) =>
        fee.key === key
          ? { ...fee, [field]: field === "amount" ? Number(value) : value }
          : fee,
      ),
    );
  }
  function addFee() {
    setFees((current) => [
      ...current,
      {
        key: `fee-${Date.now()}`,
        source: "外聘",
        level: "新费用标准",
        amount: 0,
        note: "待补充",
        status: "启用",
      },
    ]);
  }
  function content() {
    if (selected === "标签与分类")
      return (
        <>
          <div className={styles.panelHead}>
            <div>
              <h3>专家标签与分类</h3>
              <p>用于专家档案、筛选检索和推荐匹配</p>
            </div>
            <Tag color="blue">可编辑</Tag>
          </div>
          <Form layout="vertical">
            <Form.Item label="专家类别">
              <Select
                mode="tags"
                value={categories}
                onChange={setCategories}
                options={categories.map((value) => ({ value }))}
              />
            </Form.Item>
            <Form.Item label="主领域">
              <Select
                mode="tags"
                value={domains}
                onChange={setDomains}
                options={domains.map((value) => ({ value }))}
              />
            </Form.Item>
            <Alert
              type="info"
              message="可直接输入新类别或领域，按回车加入。已被专家档案使用的标签，正式系统中应停用而不是直接删除。"
            />
          </Form>
        </>
      );
    if (selected === "准入与等级")
      return (
        <>
          <div className={styles.panelHead}>
            <div>
              <h3>准入、聘期与年龄规则</h3>
              <p>入库核对、续聘预警和主动解聘共同使用</p>
            </div>
            <Switch
              defaultChecked
              checkedChildren="启用"
              unCheckedChildren="停用"
            />
          </div>
          <Form layout="vertical">
            <div className={styles.weights}>
              {[
                ["normalAge", "普通专家年龄上限（周岁）"],
                ["highAge", "高层次专家年龄上限（周岁）"],
                ["termYears", "聘期（年）"],
                ["minYears", "建议最低从业年限"],
                ["warningDays", "聘期/年龄预警天数"],
              ].map(([key, label]) => (
                <div key={key}>
                  <span>{label}</span>
                  <Input
                    type="number"
                    min={1}
                    value={rules[key]}
                    onChange={(e) =>
                      setRules({ ...rules, [key]: Number(e.target.value) })
                    }
                  />
                  <Tag>{key === "termYears" ? "固定聘期" : "系统校验"}</Tag>
                </div>
              ))}
            </div>
            <div className={styles.ruleNote}>
              <SafetyCertificateOutlined />
              <p>
                <b>现行口径</b>
                年龄不超过65周岁，高层次专家不超过70周岁；聘期3年，期满可续聘；续聘需分管领导审批。
              </p>
            </div>
          </Form>
        </>
      );
    if (selected === "匹配策略")
      return (
        <>
          <div className={styles.panelHead}>
            <div>
              <h3>候选匹配权重</h3>
              <p>当前版本 V2.3 · 评分只作为人工决策参考</p>
            </div>
            <Switch
              defaultChecked
              checkedChildren="启用"
              unCheckedChildren="停用"
            />
          </div>
          <div className={styles.weights}>
            {[
              ["tag", "专业标签匹配度"],
              ["scene", "同类场景及项目经验"],
              ["quality", "历史履约质量"],
              ["trace", "观点回溯准确度"],
              ["time", "可用时间"],
              ["balance", "调用均衡度"],
            ].map(([key, label]) => (
              <div key={key}>
                <span>{label}</span>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={weights[key]}
                  onChange={(e) =>
                    setWeights({ ...weights, [key]: Number(e.target.value) })
                  }
                />
                <Progress percent={weights[key]} showInfo={false} />
              </div>
            ))}
          </div>
          <div className={styles.weightTotal}>
            <span>权重合计</span>
            <b
              className={
                Object.values(weights).reduce((a, b) => a + b, 0) === 100
                  ? styles.ok
                  : styles.bad
              }
            >
              {Object.values(weights).reduce((a, b) => a + b, 0)}%
            </b>
          </div>
          <div className={styles.ruleNote}>
            <SafetyCertificateOutlined />
            <p>
              <b>硬性过滤优先</b>
              系统先检查正式聘用、聘期、年龄、限制调用、利益冲突和排期，再计算推荐参考分。
            </p>
          </div>
        </>
      );
    if (selected === "费用标准")
      return (
        <>
          <div className={styles.panelHead}>
            <div>
              <h3>专家咨询费用标准</h3>
              <p>
                可编辑来源、职级、半天标准和计税说明；实际支付仍以财务审批为准
              </p>
            </div>
            <Space>
              <Button onClick={addFee}>新增标准</Button>
              <Button type="primary" onClick={saveConfig}>
                保存费用标准
              </Button>
            </Space>
          </div>
          <Table
            size="small"
            pagination={false}
            rowKey="key"
            dataSource={fees}
            columns={[
              {
                title: "来源",
                dataIndex: "source",
                render: (v, record) => (
                  <Select
                    value={v}
                    style={{ width: 100 }}
                    options={["外聘", "内部"].map((value) => ({
                      value,
                      label: value,
                    }))}
                    onChange={(value) => updateFee(record.key, "source", value)}
                  />
                ),
              },
              {
                title: "职级 / 职称",
                dataIndex: "level",
                render: (v, record) => (
                  <Input
                    value={v}
                    onChange={(e) =>
                      updateFee(record.key, "level", e.target.value)
                    }
                  />
                ),
              },
              {
                title: "元/人/半天",
                dataIndex: "amount",
                render: (v, record) => (
                  <Input
                    type="number"
                    min={0}
                    value={v}
                    onChange={(e) =>
                      updateFee(record.key, "amount", e.target.value)
                    }
                  />
                ),
              },
              {
                title: "计税及时间说明",
                dataIndex: "note",
                render: (v, record) => (
                  <Input
                    value={v}
                    onChange={(e) =>
                      updateFee(record.key, "note", e.target.value)
                    }
                  />
                ),
              },
              {
                title: "状态",
                dataIndex: "status",
                render: (v, record) => (
                  <Select
                    value={v}
                    style={{ width: 90 }}
                    options={["启用", "停用"].map((value) => ({
                      value,
                      label: value,
                    }))}
                    onChange={(value) => updateFee(record.key, "status", value)}
                  />
                ),
              },
            ]}
          />
          <Alert
            style={{ marginTop: 14 }}
            type="info"
            message="计费说明"
            description="不足2小时按半天标准折半，2至4小时按半天计算；超过2天的，第1至2天按标准，第3天起按标准的50%执行。差旅费按对应等级另行承担。"
          />
        </>
      );
    if (selected === "表单与模板")
      return (
        <>
          <div className={styles.panelHead}>
            <div>
              <h3>业务表单与签署模板</h3>
              <p>模板只允许发布新版本，历史任务继续使用原版本</p>
            </div>
            <Button onClick={() => message.info("演示：打开新建模板表单")}>
              新增模板
            </Button>
          </div>
          <Table
            size="small"
            pagination={false}
            dataSource={templates}
            columns={[
              { title: "模板名称", dataIndex: "name" },
              { title: "使用环节", dataIndex: "scene" },
              { title: "版本", dataIndex: "version" },
              { title: "更新时间", dataIndex: "updated" },
              {
                title: "状态",
                dataIndex: "status",
                render: (v) => <Tag color="success">{v}</Tag>,
              },
              {
                title: "操作",
                render: (_, record) => (
                  <Space>
                    <Button
                      size="small"
                      onClick={() => setTemplatePreview(record)}
                    >
                      预览
                    </Button>
                    <Button
                      size="small"
                      onClick={() =>
                        message.info(`演示：编辑${record.name}并生成新版本`)
                      }
                    >
                      编辑
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        </>
      );
    return (
      <>
        <div className={styles.panelHead}>
          <div>
            <h3>通知开关与操作审计</h3>
            <p>通知失败不阻断业务，关键操作必须留痕</p>
          </div>
          <Tag color="green">运行正常</Tag>
        </div>
        <Descriptions
          bordered
          column={2}
          items={[
            ["sms", "短信通知"],
            ["mini", "小程序消息"],
            ["todo", "工作台待办"],
            ["expiry", "聘期与签署到期提醒"],
          ].map(([key, label]) => ({
            key,
            label,
            children: (
              <Switch
                checked={notices[key]}
                onChange={(checked) =>
                  setNotices({ ...notices, [key]: checked })
                }
                checkedChildren="启用"
                unCheckedChildren="停用"
              />
            ),
          }))}
        />
        <h3 className={styles.sectionTitle}>最近操作日志</h3>
        <Table
          size="small"
          pagination={false}
          dataSource={audits}
          columns={[
            { title: "时间", dataIndex: "time" },
            { title: "操作人", dataIndex: "actor" },
            { title: "操作内容", dataIndex: "action" },
            {
              title: "结果",
              dataIndex: "result",
              render: (v) => <Tag color="success">{v}</Tag>,
            },
          ]}
        />
      </>
    );
  }
  return (
    <Shell
      title="运营管理"
      subtitle="集中维护专家库规则、标准、模板和通知策略"
      actions={
        <Button type="primary" onClick={saveConfig}>
          保存当前配置
        </Button>
      }
    >
      <Alert
        style={{ marginBottom: 16 }}
        showIcon
        type="warning"
        message="演示配置中心"
        description="当前配置保存在本浏览器中，用于展示运营管理能力；尚未连接真实配置服务和权限审批。"
      />
      <div className={styles.operationGrid}>
        <section className={styles.configList}>
          {configs.map(({ title, desc, count, icon: Icon }) => (
            <button
              key={title}
              className={selected === title ? styles.selected : ""}
              onClick={() => setSelected(title)}
            >
              <i>
                <Icon />
              </i>
              <span>
                <b>{title}</b>
                <small>{desc}</small>
              </span>
              <em>{count}</em>
              <strong>›</strong>
            </button>
          ))}
        </section>
        <section className={styles.panel}>{content()}</section>
      </div>
      <Modal
        width={720}
        title={`${templatePreview?.name || "模板"} · ${templatePreview?.version || ""}`}
        open={!!templatePreview}
        onCancel={() => setTemplatePreview(null)}
        footer={
          <Button type="primary" onClick={() => setTemplatePreview(null)}>
            关闭
          </Button>
        }
      >
        <Alert
          type="info"
          message={`适用环节：${templatePreview?.scene || "—"}`}
        />
        <div
          style={{
            marginTop: 16,
            padding: 28,
            border: "1px solid #dce4ea",
            background: "#fff",
            minHeight: 280,
          }}
        >
          <h2 style={{ textAlign: "center" }}>{templatePreview?.name}</h2>
          <p>一汽股权投资（天津）有限公司专家人才库业务模板</p>
          <p>项目名称：________________________</p>
          <p>专家姓名：________________________</p>
          <p>
            业务内容：本区域展示模板正文、字段和签署位置。正式系统发布新版本后，业务办理页面按生效日期引用对应版本。
          </p>
          <p style={{ marginTop: 60 }}>
            签署/确认：________________　日期：____年__月__日
          </p>
        </div>
      </Modal>
    </Shell>
  );
}

function ExpertManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const { invitations } = useExpertStore();
  const [panel, setPanel] = useState(() =>
    location.state?.expertManagementTab === "enrollment"
      ? "enrollment"
      : "experts",
  );
  const [innerTab, setInnerTab] = useState("pool");
  const [inviteTick, setInviteTick] = useState(0);

  useEffect(() => {
    if (location.state?.expertManagementTab !== "enrollment") return;
    setPanel("enrollment");
    navigate("/expertTalentList", { replace: true, state: {} });
  }, [location.state, navigate]);

  return (
    <div className={wb.page}>
      <div className={wb.content}>
        <Tabs
          className={wb.workspaceTabs}
          activeKey={panel}
          onChange={setPanel}
          tabBarExtraContent={
            <div className={wb.headActions}>
              <PageHelp page="专家管理" compact />
              {panel === "experts" ? (
                <>
                  <Button>导出</Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setPanel("enrollment");
                      setInnerTab("pool");
                    }}
                  >
                    邀请专家
                  </Button>
                </>
              ) : (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setInviteTick((count) => count + 1)}
                >
                  发起合作邀请
                </Button>
              )}
            </div>
          }
          items={[
            { key: "experts", label: "在库专家" },
            {
              key: "enrollment",
              label: `入库办理（${invitations.length}）`,
            },
          ]}
        />
        <div className={panel === "experts" ? undefined : wb.hiddenPanel}>
          <ExpertList embedded />
        </div>
        <div className={panel === "enrollment" ? undefined : wb.hiddenPanel}>
          <Enrollment
            embedded
            innerTab={innerTab}
            onInnerTabChange={setInnerTab}
            inviteTick={inviteTick}
          />
        </div>
      </div>
    </div>
  );
}

export default function ExpertTalent() {
  const { pathname } = useLocation();
  if (pathname === "/expertTalentList") return <ExpertManagement />;
  if (pathname === "/expertTalentApplications")
    return (
      <Navigate
        replace
        to="/expertTalentList"
        state={{ expertManagementTab: "enrollment" }}
      />
    );
  if (pathname === "/expertTalentTasks") return <Tasks />;
  if (pathname === "/expertTalentOperations") return <Operations />;
  return <Dashboard />;
}
