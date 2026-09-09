import {
  AuditOutlined,
  PlusOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Descriptions,
  Drawer,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Timeline,
  message,
} from "antd";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Enrollment.module.less";
import ApprovalDetailModal from "./components/ApprovalDetailModal";
import CandidatePool from "./components/CandidatePool";
import PageHelp from "./components/PageHelp";
import { stageColor, stageHint, stageStrip, stageTone } from "./stages";
import {
  applicationComplete,
  checksConfirmed,
  complete,
  demoNotice,
  log,
  uid,
  updateStore,
  useExpertStore,
} from "./store";

const profileLabels = {
  name: "姓名",
  gender: "性别",
  birth: "出生日期",
  idType: "证件类型",
  idNo: "证件号码（演示）",
  email: "邮箱",
  company: "工作单位",
  position: "职务 / 职称",
  education: "最高学历、院校与专业",
  educationPeriod: "教育起止时间与说明",
  experience: "工作经历、起止时间、岗位",
  years: "从业年限",
  category: "专家类别",
  domain: "主领域 / 细分方向",
  keywords: "关联领域与技术关键词",
  projects: "代表项目和本人职责",
  roles: "可承担角色",
  certificates: "证书及有效期",
  results: "代表成果 / 获奖",
  city: "常驻城市 / 服务地区",
  service: "服务形式 / 可服务时间",
  travel: "出差意愿",
  attachment: "证明附件",
  consent: "诚信、保密、利益关联及个人信息授权声明",
  capability: "专业能力（兼容历史数据）",
  achievements: "资质成果（兼容历史数据）",
  willingness: "服务意愿（兼容历史数据）",
  declaration: "声明（兼容历史数据）",
};
const applicationFields = [
  ["project", "关联项目"],
  ["necessity", "入库必要性"],
  ["abilityEvaluation", "专业能力评价"],
  ["suggestedCategory", "建议专家类别"],
  ["suggestedLevel", "建议专业等级"],
  ["suggestedRole", "建议承担角色"],
  ["leaderOpinion", "需求部门负责人意见"],
];
const longTextApplicationFields = [
  "necessity",
  "abilityEvaluation",
  "leaderOpinion",
];
const lockedStages = ["领导审批中", "待签发聘书", "待专家签署", "已正式入库"];
const defaultChecks = [
  {
    key: "completeness",
    name: "资料完整性",
    result: "通过",
    detail: "必填资料、履历及证明材料齐全",
    confirmed: false,
  },
  {
    key: "admission",
    name: "准入条件",
    result: "通过",
    detail: "从业年限、专业经历满足演示准入规则",
    confirmed: false,
  },
  {
    key: "compliance",
    name: "关联与合规",
    result: "需人工核实",
    detail: "未发现明确冲突，仍需经办人核实关联关系",
    confirmed: false,
  },
];
const processActionText = {
  return: "退回专家补充资料",
  check: "完成入库资料与人工校验核对",
  start: "发起分管领导线上审批",
};
const dash = (value) => value || "--";

function dateText(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function fixedTermEnd(start) {
  if (!start) return "";
  const date = new Date(`${start}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  date.setFullYear(date.getFullYear() + 3);
  date.setDate(date.getDate() - 1);
  return dateText(date);
}
function ageLimitFor(category) {
  return String(category || "").includes("高层次") ? 70 : 65;
}
function ageLimitDate(birth, limit) {
  if (!birth) return "";
  const date = new Date(`${birth}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  date.setFullYear(date.getFullYear() + limit);
  return dateText(date);
}
function lastUpdatedAt(record) {
  const history = record?.history;
  if (!Array.isArray(history) || !history.length) return "";
  return history[history.length - 1].at || "";
}

export default function Enrollment() {
  const navigate = useNavigate();
  const state = useExpertStore();
  const [activeTab, setActiveTab] = useState("pool");
  const [stageFilter, setStageFilter] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [approvalDetailId, setApprovalDetailId] = useState(null);
  const [opinion, setOpinion] = useState("");
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [inviteForm] = Form.useForm();
  const [applicationForm] = Form.useForm();
  const [appointmentForm] = Form.useForm();
  const inviteValues = Form.useWatch([], inviteForm) || {};
  const record = state.invitations.find((item) => item.id === selected);
  const approvalRecord = state.invitations.find(
    (item) => item.id === approvalDetailId,
  );
  const inviteCandidates = state.candidates.filter(
    (item) => item.status === "待邀请",
  );
  const sms = `【专家人才库】您收到合作邀请，请于${inviteValues.expiry || "有效期内"}进入微信小程序「个人中心—入库邀请」查看《${inviteValues.letterTemplate || "专家合作邀请函"}》并确认。本短信仅作通知。`;

  const stageCounts = useMemo(() => {
    const counts = {};
    state.invitations.forEach((item) => {
      counts[item.stage] = (counts[item.stage] || 0) + 1;
    });
    return counts;
  }, [state.invitations]);
  const invitationRows = useMemo(
    () =>
      stageFilter
        ? state.invitations.filter((item) => item.stage === stageFilter)
        : state.invitations,
    [stageFilter, state.invitations],
  );

  function persist(mutator, success) {
    try {
      updateStore(mutator);
      if (success) message.success(success);
      return true;
    } catch {
      message.error("本地存储失败，未保存");
      return false;
    }
  }
  function openInvite(ids = []) {
    inviteForm.resetFields();
    inviteForm.setFieldsValue({
      candidateIds: ids,
      letterNo: `YQH-${new Date().getFullYear()}-${String(state.invitations.length + 1).padStart(3, "0")}`,
      letterTemplate: "专家合作邀请函（标准版）",
    });
    setInviteOpen(true);
  }
  async function sendInvitation() {
    const values = await inviteForm.validateFields();
    const targets = state.candidates.filter(
      (item) =>
        values.candidateIds.includes(item.id) && item.status === "待邀请",
    );
    if (!targets.length)
      return message.warning("请选择仍处于待邀请状态的候选人员");
    if (
      persist(
        (store) =>
          targets.forEach((candidate, index) => {
            const invitationId = uid("INV");
            const letterNo =
              targets.length === 1
                ? values.letterNo
                : `${values.letterNo}-${index + 1}`;
            store.invitations.unshift({
              ...candidate,
              id: invitationId,
              candidateId: candidate.id,
              letterNo,
              letterTemplate: values.letterTemplate,
              expiry: values.expiry,
              invitationNote: values.invitationNote,
              stage: "待确认",
              agreed: false,
              submitted: false,
              history: [
                log(
                  "股权运营部（演示）",
                  `发送《${values.letterTemplate}》${letterNo}；短信仅作小程序查看通知`,
                ),
              ],
            });
            const source = store.candidates.find(
              (item) => item.id === candidate.id,
            );
            source.status = "已转邀请";
            source.invitationId = invitationId;
            store.sms.unshift({
              id: uid("SMS"),
              invitationId,
              name: candidate.name,
              phone: candidate.phone,
              content: sms,
              at: new Date().toLocaleString("zh-CN"),
              status: "模拟记录·未真实发送",
            });
          }),
        "已生成合作邀请函及短信通知记录",
      )
    ) {
      setInviteOpen(false);
      setActiveTab("invitations");
    }
  }
  function openApplication() {
    applicationForm.resetFields();
    applicationForm.setFieldsValue(
      record?.application || { project: record?.project },
    );
    setApplicationOpen(true);
  }
  async function saveApplication() {
    const values = await applicationForm.validateFields();
    if (
      persist((store) => {
        const item = store.invitations.find((entry) => entry.id === selected);
        item.application = values;
        item.history.push(
          log("需求部门（演示）", "填写并提交正式《专家入库申请表》"),
        );
      }, "入库申请表已保存")
    )
      setApplicationOpen(false);
  }
  function openAppointment() {
    const today = dateText(new Date());
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 15);
    appointmentForm.resetFields();
    appointmentForm.setFieldsValue({
      termStart: today,
      termEnd: fixedTermEnd(today),
      signingDeadline: dateText(deadline),
    });
    setAppointmentOpen(true);
  }
  async function submitAppointment() {
    const values = await appointmentForm.validateFields();
    const expectedEnd = fixedTermEnd(values.termStart);
    if (values.termEnd !== expectedEnd)
      return message.error(`聘期固定为3年，结束日期应为${expectedEnd}`);
    const limit = ageLimitFor(record?.profile?.category);
    const limitDate = ageLimitDate(record?.profile?.birth, limit);
    if (!limitDate)
      return message.error("专家出生日期缺失或格式不正确，无法校验年龄上限");
    if (values.termEnd > limitDate)
      return message.error(
        `${record.profile.category || "普通专家"}年龄上限为${limit}周岁，本次聘期结束日期不得晚于${limitDate}`,
      );
    Modal.confirm({
      title: "确认发送聘书？",
      content: `聘书编号${values.number}，聘期${values.termStart}至${values.termEnd}。发送后专家需在小程序通过E签宝完成签署。`,
      okText: "确认发送",
      cancelText: "取消",
      onOk: () => {
        if (
          persist((store) => {
            const item = store.invitations.find(
              (entry) => entry.id === selected,
            );
            if (!item || item.stage !== "待签发聘书")
              throw new Error("状态已变化，请刷新后重试");
            item.appointment = {
              ...values,
              years: 3,
              ageLimit: limit,
              ageLimitDate: limitDate,
              status: "待专家签署",
              sentAt: new Date().toLocaleString("zh-CN"),
              signPlatform: "E签宝（演示）",
            };
            item.stage = "待专家签署";
            item.history ||= [];
            item.history.push(
              log(
                "股权运营部（演示）",
                `向专家发送聘书：${values.number}，聘期${values.termStart}至${values.termEnd}，签署截止${values.signingDeadline}，通过E签宝签署`,
              ),
            );
          }, "聘书已发送，等待专家在小程序签署")
        )
          setAppointmentOpen(false);
      },
    });
  }
  function completeSigning() {
    Modal.confirm({
      title: "模拟接收E签宝签署完成回调？",
      content:
        "回调成功后，聘书标记为双方签订完成，专家正式入库并生成可调用档案。",
      okText: "确认回调完成",
      cancelText: "取消",
      onOk: () =>
        persist((store) => {
          const item = store.invitations.find((entry) => entry.id === selected);
          if (!item || item.stage !== "待专家签署" || !item.appointment)
            throw new Error("状态已变化，请刷新后重试");
          const signedAt = dateText(new Date());
          item.appointment = {
            ...item.appointment,
            status: "已签署",
            signedAt,
            completedAt: new Date().toLocaleString("zh-CN"),
          };
          item.stage = "已正式入库";
          item.history.push(
            log(
              "E签宝（签署回调演示）",
              `专家完成聘书${item.appointment.number}签署，公司与专家签订完成，正式入库`,
            ),
          );
          if (
            !store.experts.some(
              (expert) => expert.sourceInvitationId === item.id,
            )
          )
            store.experts.unshift({
              id: `EX${new Date().getFullYear()}${String(store.experts.length + 1).padStart(4, "0")}`,
              sourceInvitationId: item.id,
              name: item.name,
              initials: item.name?.slice(0, 1) || "专",
              title: item.profile?.position || item.title,
              company: item.profile?.company || item.company,
              category: item.profile?.category || "产业研究",
              field: item.profile?.domain || item.field,
              tags: String(item.profile?.keywords || item.field || "专业咨询")
                .split(/[、，,/]/)
                .filter(Boolean)
                .slice(0, 3),
              level: item.application?.suggestedLevel || "高级专家",
              highLevel: String(item.profile?.category || "").includes(
                "高层次",
              ),
              birth: item.profile?.birth,
              status: "可用",
              score: 90,
              projects: 0,
              availability: item.profile?.service || "待维护",
              lastUsed: "—",
              risk: "正常",
              termStart: item.appointment.termStart,
              termEnd: item.appointment.termEnd,
              appointmentHistory: [{ ...item.appointment }],
              history: [
                {
                  at: new Date().toLocaleString("zh-CN"),
                  actor: "E签宝（演示）",
                  text: "聘书签署完成，正式聘用入库",
                },
              ],
            });
        }, "E签宝签署回调已处理，专家已正式入库"),
    });
  }
  function confirmCheck(key, confirmed) {
    persist((store) => {
      const item = store.invitations.find((entry) => entry.id === selected);
      item.checks ||= structuredClone(defaultChecks);
      const check = item.checks.find((entry) => entry.key === key);
      check.confirmed = confirmed;
      check.confirmedAt = confirmed ? new Date().toLocaleString("zh-CN") : null;
    });
  }
  function process(action) {
    if (!record || !complete(record))
      return message.warning("专家须先同意邀请、完整填写履历并正式提交");
    if (!opinion.trim()) return message.warning("请填写核对意见或退回原因");
    if (
      action === "check" &&
      (!applicationComplete(record) || !checksConfirmed(record))
    )
      return message.warning(
        "请先完成需求部门入库申请表，并人工确认三重校验结果",
      );
    if (action === "start" && record.stage !== "核对完成")
      return message.warning("请先完成资料、申请表及校验核对");
    if (
      persist((store) => {
        const item = store.invitations.find((entry) => entry.id === selected);
        if (action === "return") {
          item.stage = "待补充资料";
          item.submitted = false;
        }
        if (action === "check") item.stage = "核对完成";
        if (action === "start") {
          item.stage = "领导审批中";
          item.flowId = uid("FLOW");
        }
        item.history.push(
          log(
            "股权运营部（演示）",
            `${processActionText[action]}：${opinion.trim()}`,
          ),
        );
      })
    )
      setOpinion("");
  }

  const invitationColumns = [
    {
      title: "专家",
      dataIndex: "name",
      minWidth: 200,
      render: (_, item) => (
        <div className={styles.personCell}>
          <strong>{item.name}</strong>
          <span>
            {dash([item.company, item.title].filter(Boolean).join(" / "))}
          </span>
        </div>
      ),
    },
    { title: "邀请函编号", dataIndex: "letterNo", width: 150, render: dash },
    { title: "拟服务领域", dataIndex: "field", width: 120, render: dash },
    {
      title: "关联项目",
      dataIndex: "project",
      width: 200,
      ellipsis: true,
      render: dash,
    },
    { title: "推荐部门", dataIndex: "department", width: 130, render: dash },
    { title: "有效期", dataIndex: "expiry", width: 120, render: dash },
    {
      title: "当前阶段",
      dataIndex: "stage",
      width: 130,
      render: (value) => <Tag color={stageColor(value)}>{value}</Tag>,
    },
    {
      title: "最近更新",
      key: "updated",
      width: 170,
      render: (_, item) => dash(lastUpdatedAt(item)),
    },
    {
      title: "操作",
      key: "action",
      width: 170,
      render: (_, item) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setSelected(item.id);
              setOpinion("");
            }}
          >
            办理详情
          </Button>
          {item.stage === "领导审批中" ? (
            <Button type="link" onClick={() => setApprovalDetailId(item.id)}>
              审批详情
            </Button>
          ) : null}
        </Space>
      ),
    },
  ];
  const smsColumns = [
    { title: "接收人", dataIndex: "name", width: 110 },
    { title: "手机号", dataIndex: "phone", width: 140 },
    { title: "短信内容", dataIndex: "content", minWidth: 320, ellipsis: true },
    { title: "记录时间", dataIndex: "at", width: 180 },
    {
      title: "状态",
      dataIndex: "status",
      width: 190,
      render: (value) => <Tag color="default">{value}</Tag>,
    },
  ];

  function renderStageAction() {
    if (!record) return null;
    if (["待资料核对", "审批退回", "核对完成"].includes(record.stage)) {
      return (
        <div className={styles.actionBar}>
          <Input.TextArea
            rows={3}
            value={opinion}
            onChange={(event) => setOpinion(event.target.value)}
            placeholder={
              record.stage === "核对完成"
                ? "发起审批说明（必填）"
                : "资料核对意见 / 退回原因（必填）"
            }
          />
          {["待资料核对", "审批退回"].includes(record.stage) ? (
            <Space wrap>
              <Popconfirm
                title="确认退回专家补充资料？"
                description="退回后专家需在小程序补充资料并重新提交。"
                okText="确认退回"
                cancelText="取消"
                onConfirm={() => process("return")}
              >
                <Button disabled={!complete(record)}>退回补充</Button>
              </Popconfirm>
              <Popconfirm
                title="确认完成资料与申请核对？"
                description="请确认专家全部资料、入库申请表及三重校验均已人工核实。"
                okText="确认完成"
                cancelText="取消"
                onConfirm={() => process("check")}
              >
                <Button
                  disabled={
                    !complete(record) ||
                    !applicationComplete(record) ||
                    !checksConfirmed(record)
                  }
                >
                  完成资料与申请核对
                </Button>
              </Popconfirm>
            </Space>
          ) : null}
          {record.stage === "核对完成" ? (
            <Popconfirm
              title="确认发起分管领导审批？"
              description="提交后将在原工作台生成分管领导审批待办；审批通过后还需签发聘书。"
              okText="确认发起"
              cancelText="取消"
              onConfirm={() => process("start")}
            >
              <Button type="primary">发起分管领导审批</Button>
            </Popconfirm>
          ) : null}
        </div>
      );
    }
    if (record.stage === "领导审批中") {
      return (
        <Alert
          type="info"
          showIcon
          message="已发起分管领导审批"
          description="请在原工作台审批待办中办理。审批通过后进入待签发聘书状态。"
          action={
            <Button size="small" onClick={() => setApprovalDetailId(record.id)}>
              审批详情
            </Button>
          }
        />
      );
    }
    if (record.stage === "待签发聘书") {
      return (
        <Alert
          type="warning"
          showIcon
          message="分管领导审批已通过，待发送聘书"
          description="配置固定3年聘期并向专家发送聘书，专家需在小程序通过E签宝签署。"
          action={
            <Button type="primary" size="small" onClick={openAppointment}>
              发送聘书
            </Button>
          }
        />
      );
    }
    if (record.stage === "待专家签署") {
      return (
        <Alert
          type="info"
          showIcon
          message="聘书已发送，等待专家签署"
          description={
            record.appointment
              ? `聘书编号：${record.appointment.number}；签署截止：${record.appointment.signingDeadline}；平台：E签宝（演示）`
              : undefined
          }
          action={
            <Button type="primary" size="small" onClick={completeSigning}>
              模拟E签宝回调
            </Button>
          }
        />
      );
    }
    if (record.stage === "已正式入库") {
      return (
        <Alert
          type="success"
          showIcon
          message="聘书已完成签署，专家已正式入库"
          description={
            record.appointment
              ? `聘书编号：${record.appointment.number}；聘期：${record.appointment.termStart} 至 ${record.appointment.termEnd}`
              : undefined
          }
        />
      );
    }
    return null;
  }

  const stageAction = renderStageAction();

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.pageHead}>
          <div>
            <h1>
              入库管理
              <PageHelp page="入库管理" />
            </h1>
            <p>初始推荐名单、合作邀请、完整资料核对与分管领导审批</p>
          </div>
          <div className={styles.headActions}>
            <Button
              icon={<AuditOutlined />}
              onClick={() => navigate("/djghome?task=expertEnrollmentApproval")}
            >
              前往分管领导审批待办
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openInvite()}
            >
              发起合作邀请
            </Button>
          </div>
        </div>

        <div className={styles.demoNotice}>
          <WarningOutlined />
          <span>{demoNotice}</span>
        </div>

        <div className={styles.stageStrip}>
          <button
            type="button"
            className={`${styles.stageItem} ${stageFilter ? "" : styles.active}`}
            onClick={() => setStageFilter("")}
          >
            <span>
              <i style={{ background: "#2563eb" }} />
              全部办理中
            </span>
            <b>{state.invitations.length}</b>
            <small>不按阶段筛选，展示全部入库申请</small>
          </button>
          {stageStrip.map((stage) => (
            <button
              type="button"
              key={stage}
              className={`${styles.stageItem} ${stageFilter === stage ? styles.active : ""}`}
              onClick={() => setStageFilter(stageFilter === stage ? "" : stage)}
            >
              <span>
                <i style={{ background: stageTone(stage) }} />
                {stage}
              </span>
              <b>{stageCounts[stage] || 0}</b>
              <small>{stageHint(stage)}</small>
            </button>
          ))}
        </div>

        <Card className={`${styles.card} ${styles.tabCard}`}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "pool",
                label: `初始推荐名单（${state.candidates.length}）`,
                children: <CandidatePool onInvite={openInvite} />,
              },
              {
                key: "invitations",
                label: `入库办理（${state.invitations.length}）`,
                children: (
                  <>
                    <div className={styles.tableTop}>
                      <strong>入库办理列表</strong>
                      <div className={styles.tableTools}>
                        {stageFilter ? (
                          <span className={styles.filterChip}>
                            已按「{stageFilter}」筛选
                            <Button
                              type="link"
                              size="small"
                              onClick={() => setStageFilter("")}
                            >
                              清除
                            </Button>
                          </span>
                        ) : null}
                        <span>共 {invitationRows.length} 条</span>
                      </div>
                    </div>
                    <Table
                      tableLayout="auto"
                      rowKey="id"
                      columns={invitationColumns}
                      dataSource={invitationRows}
                      scroll={{ x: "max-content", y: 470 }}
                      pagination={{ pageSize: 10, showSizeChanger: false }}
                    />
                  </>
                ),
              },
              {
                key: "sms",
                label: `短信通知记录（${state.sms.length}）`,
                children: (
                  <>
                    <div className={styles.tableTop}>
                      <strong>短信通知记录</strong>
                      <span>
                        共 {state.sms.length} 条 · 仅模拟记录，未真实发送
                      </span>
                    </div>
                    <Table
                      tableLayout="auto"
                      rowKey="id"
                      columns={smsColumns}
                      dataSource={state.sms}
                      scroll={{ x: "max-content", y: 470 }}
                      pagination={{ pageSize: 10, showSizeChanger: false }}
                      locale={{
                        emptyText:
                          "尚未生成短信通知记录，发起合作邀请后自动记录",
                      }}
                    />
                  </>
                ),
              },
            ]}
          />
        </Card>
      </div>

      <Modal
        title="发送专家合作邀请"
        open={inviteOpen}
        onCancel={() => setInviteOpen(false)}
        onOk={sendInvitation}
        width={780}
        okText="生成邀请函并记录短信通知"
      >
        <Form form={inviteForm} layout="vertical">
          <Form.Item
            name="candidateIds"
            label="从初始推荐名单选择人员（可多选）"
            rules={[{ required: true }]}
          >
            <Select
              mode="multiple"
              showSearch
              optionFilterProp="label"
              options={inviteCandidates.map((item) => ({
                value: item.id,
                label: `${item.name} · ${item.company} · ${item.phone} · ${item.field}`,
              }))}
            />
          </Form.Item>
          <div className={styles.formRow}>
            <Form.Item
              name="letterNo"
              label="合作邀请函编号"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="letterTemplate"
              label="邀请函模板"
              rules={[{ required: true }]}
            >
              <Select
                options={["专家合作邀请函（标准版）", "专项咨询合作邀请函"].map(
                  (value) => ({ value }),
                )}
              />
            </Form.Item>
            <Form.Item
              name="expiry"
              label="邀请有效期"
              rules={[{ required: true }]}
            >
              <Input type="date" />
            </Form.Item>
          </div>
          <Form.Item
            name="invitationNote"
            label="合作邀请说明"
            rules={[{ required: true, whitespace: true }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Alert
            type="info"
            showIcon
            message="短信只负责提醒，不替代正式合作邀请函"
            description={sms}
          />
        </Form>
      </Modal>

      <Drawer
        width="min(880px, 92vw)"
        title="专家入库办理详情"
        open={!!record}
        onClose={() => setSelected(null)}
      >
        {record ? (
          <div className={styles.drawerBody}>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>基本信息</h3>
              <Descriptions
                bordered
                column={2}
                items={[
                  {
                    key: "name",
                    label: "专家",
                    children: `${record.name} · ${record.company}`,
                  },
                  {
                    key: "stage",
                    label: "当前阶段",
                    children: (
                      <Tag color={stageColor(record.stage)}>{record.stage}</Tag>
                    ),
                  },
                  {
                    key: "letter",
                    label: "合作邀请函",
                    children: `${record.letterNo || "—"} / ${record.letterTemplate || "—"}`,
                  },
                  {
                    key: "expiry",
                    label: "有效期",
                    children: record.expiry || "—",
                  },
                  {
                    key: "project",
                    label: "关联项目",
                    children: record.project || "—",
                  },
                  {
                    key: "department",
                    label: "推荐部门",
                    children: record.department || "—",
                  },
                ]}
              />
              <div className={styles.summaryMeta}>
                <span>
                  专家同意邀请：<b>{record.agreed ? "是" : "否"}</b>
                </span>
                <span>
                  履历完整并正式提交：<b>{complete(record) ? "是" : "否"}</b>
                </span>
                <span>
                  入库申请表：
                  <b>{applicationComplete(record) ? "已完成" : "未完成"}</b>
                </span>
                <span>
                  三重校验人工确认：
                  <b>{checksConfirmed(record) ? "已确认" : "待确认"}</b>
                </span>
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>专家履历资料</h3>
              {Object.entries(record.profile || {}).length ? (
                <Descriptions
                  bordered
                  column={1}
                  size="small"
                  items={Object.entries(record.profile).map(([key, value]) => ({
                    key,
                    label: profileLabels[key] || key,
                    children:
                      typeof value === "boolean"
                        ? value
                          ? "已确认"
                          : "未确认"
                        : value,
                  }))}
                />
              ) : (
                <Alert
                  type="info"
                  showIcon
                  message="专家尚未提交履历资料"
                  description="专家在小程序同意邀请并填写完整履历后，此处展示全部入库资料。"
                />
              )}
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>
                需求部门《专家入库申请表》
              </h3>
              {applicationComplete(record) ? (
                <Descriptions
                  bordered
                  column={1}
                  size="small"
                  items={applicationFields.map(([key, label]) => ({
                    key,
                    label,
                    children: record.application[key],
                  }))}
                />
              ) : (
                <Alert
                  type="warning"
                  showIcon
                  message="需求部门尚未填写完整入库申请表，不能发起审批"
                />
              )}
              <div>
                <Button
                  disabled={
                    !complete(record) || lockedStages.includes(record.stage)
                  }
                  onClick={openApplication}
                >
                  {applicationComplete(record)
                    ? "修改入库申请表"
                    : "填写入库申请表"}
                </Button>
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>三重校验与人工确认</h3>
              <Alert
                type="info"
                showIcon
                message="系统仅提供校验结果和风险提示，不自动作出入库决定；每项均须经办人确认。"
              />
              <div className={styles.checkList}>
                {(record.checks || defaultChecks).map((item) => (
                  <div
                    key={item.key}
                    className={`${styles.checkItem} ${item.confirmed ? styles.confirmed : ""}`}
                  >
                    <div className={styles.checkHead}>
                      <b>{item.name}</b>
                      <Tag
                        color={item.result === "通过" ? "success" : "warning"}
                      >
                        {item.result}
                      </Tag>
                    </div>
                    <p>{item.detail}</p>
                    <Checkbox
                      checked={item.confirmed}
                      disabled={
                        !applicationComplete(record) ||
                        lockedStages.includes(record.stage)
                      }
                      onChange={(event) =>
                        confirmCheck(item.key, event.target.checked)
                      }
                    >
                      我已人工复核该项结果及相关材料
                    </Checkbox>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>阶段办理</h3>
              <div className={styles.stageBanner}>
                <i style={{ background: stageTone(record.stage) }} />
                <span>
                  当前阶段「{record.stage}」：
                  {stageHint(record.stage) || "暂无阶段说明"}
                </span>
              </div>
              {stageAction}
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>办理轨迹</h3>
              <Timeline
                items={(record.history || []).map((item, index) => ({
                  key: index,
                  color: index === record.history.length - 1 ? "blue" : "gray",
                  children: `${item.at} · ${item.actor} · ${item.text}`,
                }))}
              />
            </section>
          </div>
        ) : null}
      </Drawer>

      <ApprovalDetailModal
        record={approvalRecord}
        open={!!approvalRecord}
        onClose={() => setApprovalDetailId(null)}
      />

      <Modal
        title="需求部门填写《专家入库申请表》"
        open={applicationOpen}
        onCancel={() => setApplicationOpen(false)}
        onOk={saveApplication}
        width={720}
      >
        <Form form={applicationForm} layout="vertical">
          {applicationFields.map(([key, label]) => (
            <Form.Item
              key={key}
              name={key}
              label={label}
              rules={[{ required: true, whitespace: true }]}
            >
              {longTextApplicationFields.includes(key) ? (
                <Input.TextArea rows={2} />
              ) : (
                <Input />
              )}
            </Form.Item>
          ))}
        </Form>
      </Modal>

      <Modal
        title="发送专家聘书"
        open={appointmentOpen}
        onCancel={() => setAppointmentOpen(false)}
        onOk={submitAppointment}
        width={680}
        okText="发送聘书"
      >
        <Form form={appointmentForm} layout="vertical">
          <Alert
            className={styles.formAlert}
            type="info"
            showIcon
            message={`聘期固定3年；${record?.profile?.category || "普通专家"}年龄上限为${ageLimitFor(record?.profile?.category)}周岁。`}
          />
          <Form.Item
            name="number"
            label="聘书编号"
            rules={[
              { required: true, whitespace: true, message: "请输入聘书编号" },
            ]}
          >
            <Input />
          </Form.Item>
          <div className={styles.formRow}>
            <Form.Item
              name="termStart"
              label="聘期开始"
              rules={[{ required: true, message: "请选择聘期开始日期" }]}
            >
              <Input
                type="date"
                onChange={(event) =>
                  appointmentForm.setFieldValue(
                    "termEnd",
                    fixedTermEnd(event.target.value),
                  )
                }
              />
            </Form.Item>
            <Form.Item
              name="termEnd"
              label="聘期结束（自动计算）"
              rules={[{ required: true }]}
            >
              <Input type="date" disabled />
            </Form.Item>
            <Form.Item
              name="signingDeadline"
              label="签署截止日期"
              rules={[{ required: true, message: "请选择签署截止日期" }]}
            >
              <Input type="date" />
            </Form.Item>
          </div>
          <Form.Item
            name="attachment"
            label="待签聘书文件"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "请登记待签聘书文件",
              },
            ]}
          >
            <Input placeholder="如：专家聘书-待签署.pdf" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
