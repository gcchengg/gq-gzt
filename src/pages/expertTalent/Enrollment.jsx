import {
  FileTextOutlined,
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
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
  Upload,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Enrollment.module.less";
import ApprovalDetailModal from "./components/ApprovalDetailModal";
import CandidatePool from "./components/CandidatePool";
import PageHelp from "./components/PageHelp";
import { stageColor, stageHint, stageStrip, stageTone } from "./stages";
import {
  applicationBasicRows,
  applicationFromProfile,
  applicationSectionFields,
  draftProfile,
} from "./enrollmentForms";
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
  idNo: "证件号码",
  phone: "联系电话",
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
};
const lockedStages = ["领导审批中", "待签发聘书", "已正式入库"];
const displayedStage = (stage) =>
  ({
    领导审批中: "审批中",
    待签发聘书: "审批通过",
    审批退回: "审批驳回",
  })[stage] || stage;
const defaultChecks = [
  {
    key: "completeness",
    name: "资料完整性",
    result: "通过",
    detail: "必填资料、履历及证明材料齐全",
    confirmed: true,
  },
  {
    key: "admission",
    name: "准入条件",
    result: "通过",
    detail: "从业年限、专业经历满足演示准入规则",
    confirmed: true,
  },
  {
    key: "compliance",
    name: "关联与合规",
    result: "通过",
    detail: "未发现明确冲突",
    confirmed: true,
  },
];
const DEFAULT_INVITATION_NOTE =
  "您好！一汽股权投资（天津）有限公司诚邀您加入专家人才库，发挥您在相关领域的专业经验，为公司投资决策、产业研究及项目咨询提供专业支持。后续入库资料及办理流程由工作人员与您联系，感谢您的支持！";
const drawerHiddenProfileFields = new Set([
  "roles",
  "travel",
  "attachment",
  "city",
  "service",
  "certificates",
]);
const processActionText = {
  check: "完成入库资料核对",
  start: "发起分管领导线上审批",
};
const profileFormFields = [
  ["name", "姓名"],
  ["gender", "性别"],
  ["birth", "出生日期"],
  ["idType", "证件类型"],
  ["idNo", "证件号码"],
  ["phone", "联系电话"],
  ["email", "邮箱"],
  ["company", "工作单位"],
  ["position", "职务 / 职称"],
  ["education", "最高学历、院校与专业"],
  ["educationPeriod", "教育起止时间与说明"],
  ["experience", "工作经历、起止时间、岗位"],
  ["years", "从业年限"],
  ["category", "专家类别"],
  ["domain", "主领域 / 细分方向"],
  ["keywords", "关联领域与技术关键词"],
  ["projects", "代表项目和本人职责"],
  ["roles", "可承担角色"],
  ["certificates", "证书及有效期"],
  ["results", "代表成果 / 获奖"],
  ["city", "常驻城市 / 服务地区"],
  ["service", "服务形式 / 可服务时间"],
  ["travel", "出差意愿"],
  ["attachment", "证明附件"],
];
const profileRequiredFields = ["name", "gender", "birth", "idNo", "phone"];
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
function escapeHtml(value) {
  return String(value || "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}
function lastUpdatedAt(record) {
  const history = record?.history;
  if (!Array.isArray(history) || !history.length) return "";
  return history[history.length - 1].at || "";
}

function PaperApplication({ readOnly = false, values }) {
  return (
    <div className={styles.paperForm}>
      <div className={styles.paperTitle}>专家推荐表</div>
      <div className={styles.paperSection}>个人基本信息</div>
      {applicationBasicRows.map((row) => (
        <div className={styles.paperRow} key={row[0][0]}>
          {row.map(([key, label]) => (
            <div className={styles.paperPair} key={key}>
              <span>{label}</span>
              {readOnly ? (
                <b>{dash(values?.[key])}</b>
              ) : (
                <Form.Item
                  name={key}
                  rules={[{ required: true, whitespace: true }]}
                  className={styles.paperField}
                >
                  {key === "gender" ? (
                    <Select
                      options={["男", "女"].map((value) => ({ value }))}
                      variant="borderless"
                    />
                  ) : (
                    <Input
                      type={key === "birth" ? "date" : "text"}
                      variant="borderless"
                    />
                  )}
                </Form.Item>
              )}
            </div>
          ))}
        </div>
      ))}
      {applicationSectionFields.map(([key, label]) => (
        <div key={key}>
          <div className={styles.paperSection}>{label}</div>
          {readOnly ? (
            <div className={styles.paperArea}>{dash(values?.[key])}</div>
          ) : (
            <Form.Item name={key} className={styles.paperField}>
              <Input.TextArea rows={3} variant="borderless" />
            </Form.Item>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Enrollment({
  embedded = false,
  innerTab,
  onInnerTabChange,
  inviteTick = 0,
  initialSelectedId = "",
}) {
  const navigate = useNavigate();
  const state = useExpertStore();
  const [uncontrolledTab, setUncontrolledTab] = useState("pool");
  const activeTab = innerTab ?? uncontrolledTab;
  const setActiveTab = onInnerTabChange ?? setUncontrolledTab;
  const [stageFilter, setStageFilter] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [letterPreview, setLetterPreview] = useState(null);
  const [selected, setSelected] = useState(null);
  const [approvalDetailId, setApprovalDetailId] = useState(null);
  const [opinion, setOpinion] = useState("");
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [appointmentFiles, setAppointmentFiles] = useState([]);
  const [inviteForm] = Form.useForm();
  const [applicationForm] = Form.useForm();
  const [appointmentForm] = Form.useForm();
  const [profileForm] = Form.useForm();
  const [profileOpen, setProfileOpen] = useState(false);
  const record = state.invitations.find((item) => item.id === selected);
  const approvalRecord = state.invitations.find(
    (item) => item.id === approvalDetailId,
  );
  const visibleProfileEntries = Object.entries(record?.profile || {}).filter(
    ([key]) => !drawerHiddenProfileFields.has(key),
  );
  const canFinishCheck =
    !!record &&
    complete(record) &&
    applicationComplete(record) &&
    checksConfirmed(record);
  const inviteCandidates = state.candidates.filter(
    (item) => item.status === "待邀请",
  );

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
  function deleteCandidate(candidate) {
    const invitationId = candidate.invitationId;
    if (
      persist((store) => {
        store.candidates = store.candidates.filter(
          (item) => item.id !== candidate.id,
        );
        if (invitationId) {
          store.invitations = store.invitations.filter(
            (item) => item.id !== invitationId,
          );
        }
      }, "推荐名单已删除") &&
      invitationId === selected
    ) {
      setSelected(null);
    }
  }
  function deleteInvitation(invitation) {
    if (
      persist((store) => {
        store.invitations = store.invitations.filter(
          (item) => item.id !== invitation.id,
        );
        const candidate = store.candidates.find(
          (item) => item.invitationId === invitation.id,
        );
        if (candidate) {
          candidate.status = "待邀请";
          delete candidate.invitationId;
        }
      }, "入库办理记录已删除")
    ) {
      if (selected === invitation.id) setSelected(null);
    }
  }
  function openInvite(ids = []) {
    inviteForm.resetFields();
    inviteForm.setFieldsValue({
      candidateIds: ids,
      letterNo: `YQH-${new Date().getFullYear()}-${String(state.invitations.length + 1).padStart(3, "0")}`,
      letterTemplate: "专家合作邀请函（标准版）",
      invitationNote: DEFAULT_INVITATION_NOTE,
    });
    setInviteOpen(true);
  }
  useEffect(() => {
    if (!inviteTick) return;
    openInvite();
  }, [inviteTick]);
  useEffect(() => {
    if (!initialSelectedId) return;
    if (!state.invitations.some((item) => item.id === initialSelectedId))
      return;
    setActiveTab("invitations");
    setSelected(initialSelectedId);
    setOpinion("");
  }, [initialSelectedId, state.invitations]);
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
              invitationNote: values.invitationNote,
              stage: "资料完善中",
              agreed: true,
              submitted: false,
              checks: structuredClone(defaultChecks),
              history: [
                log(
                  "股权运营部（演示）",
                  `生成《${values.letterTemplate}》${letterNo}，并记录短信/邮件通知`,
                ),
              ],
            });
            const source = store.candidates.find(
              (item) => item.id === candidate.id,
            );
            source.status = "已转邀请";
            source.invitationId = invitationId;
            const notificationContent = `【专家人才库】${candidate.name}老师，您的专家合作邀请函已生成，工作人员将与您联系。`;
            const notifiedAt = new Date().toLocaleString("zh-CN");
            store.sms.unshift(
              {
                id: uid("SMS"),
                invitationId,
                type: "短信",
                name: candidate.name,
                address: candidate.phone,
                content: notificationContent,
                at: notifiedAt,
                status: "已发送",
              },
              {
                id: uid("EMAIL"),
                invitationId,
                type: "邮件",
                name: candidate.name,
                address: candidate.email || "未填写邮箱",
                content: notificationContent,
                at: notifiedAt,
                status: "已发送",
              },
            );
          }),
        "已生成合作邀请函及短信/邮件通知记录",
      )
    ) {
      setInviteOpen(false);
      setActiveTab("invitations");
    }
  }
  function openApplication() {
    applicationForm.resetFields();
    applicationForm.setFieldsValue(applicationFromProfile(record));
    setApplicationOpen(true);
  }
  async function saveApplication() {
    const values = await applicationForm.validateFields();
    if (
      persist((store) => {
        const item = store.invitations.find((entry) => entry.id === selected);
        item.application = values;
        item.history.push(
          log("需求部门（演示）", "填写并提交正式《专家推荐表》"),
        );
      }, "推荐表已保存")
    )
      setApplicationOpen(false);
  }
  function openAppointment() {
    const today = dateText(new Date());
    const year = new Date().getFullYear();
    const sequence = state.invitations.reduce((max, item) => {
      const match = item.appointment?.number?.match(
        new RegExp(`^PS-${year}-(\\d+)$`),
      );
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);
    const number = `PS-${year}-${String(sequence + 1).padStart(3, "0")}`;
    appointmentForm.resetFields();
    appointmentForm.setFieldsValue({
      number,
      termStart: today,
      termEnd: fixedTermEnd(today),
    });
    generateAppointmentFile({
      number,
      termStart: today,
      termEnd: fixedTermEnd(today),
    });
    setAppointmentOpen(true);
  }
  function generateAppointmentFile(values = appointmentForm.getFieldsValue()) {
    if (!record) return;
    const number = values.number || "聘书编号待生成";
    const content = `<!doctype html><html><head><meta charset="utf-8"><title>专家聘书-${escapeHtml(record.name)}</title><style>body{font-family:serif;color:#222;margin:48px auto;max-width:760px;line-height:2}h1{text-align:center;font-size:28px;margin:40px 0}p{font-size:16px;text-indent:2em}.meta{text-align:right;margin-top:60px}</style></head><body><h1>专家聘书</h1><p>${escapeHtml(record.name)}老师：</p><p>经审核，聘请您担任一汽股权投资（天津）有限公司专家，为公司投资决策、产业研究及项目咨询提供专业支持。</p><p>聘书编号：${escapeHtml(number)}</p><p>聘期：${escapeHtml(values.termStart || "待定")} 至 ${escapeHtml(values.termEnd || "待定")}（三年）</p><p class="meta">一汽股权投资（天津）有限公司<br>${dateText(new Date())}</p></body></html>`;
    const file = new File([content], `专家聘书-${record.name}-${number}.doc`, {
      type: "application/msword",
    });
    setAppointmentFiles([
      {
        uid: `generated-${Date.now()}`,
        name: file.name,
        status: "done",
        source: "自动生成",
        originFileObj: file,
      },
    ]);
  }
  async function submitAppointment() {
    const values = await appointmentForm.validateFields();
    if (!appointmentFiles.length) return message.error("请生成或上传聘书文件");
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
      content: `聘书编号${values.number}，聘期${values.termStart}至${values.termEnd}。发送后专家正式入库并生成可调用档案。`,
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
              attachment: appointmentFiles[0].name,
              years: 3,
              ageLimit: limit,
              ageLimitDate: limitDate,
              status: "已生效",
              sentAt: new Date().toLocaleString("zh-CN"),
            };
            item.stage = "已正式入库";
            item.history ||= [];
            item.history.push(
              log(
                "股权运营部（演示）",
                `向专家发送聘书：${values.number}，聘期${values.termStart}至${values.termEnd}，专家正式入库`,
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
                enrolledAt: dateText(new Date()),
                appointmentHistory: [{ ...item.appointment }],
                history: [
                  {
                    at: new Date().toLocaleString("zh-CN"),
                    actor: "股权运营部（演示）",
                    text: "聘书已发送，正式聘用入库",
                  },
                ],
              });
          }, "聘书已发送，专家已正式入库")
        )
          setAppointmentOpen(false);
      },
    });
  }
  function openProfile() {
    profileForm.resetFields();
    profileForm.setFieldsValue(draftProfile(record));
    setProfileOpen(true);
  }
  async function saveProfile() {
    const values = await profileForm.validateFields();
    if (
      persist((store) => {
        const item = store.invitations.find((entry) => entry.id === selected);
        item.profile = { ...item.profile, ...values, consent: true };
        item.submitted = true;
        item.history.push(log("股权运营部（演示）", "填写并保存专家履历资料"));
      }, "履历资料已保存")
    )
      setProfileOpen(false);
  }
  function process(action) {
    if (!record || !complete(record))
      return message.warning("请先填写专家履历资料，并等待专家确认邀请");
    if (
      action === "check" &&
      (!applicationComplete(record) || !checksConfirmed(record))
    )
      return message.warning("请先完成专家履历资料与推荐表");
    if (action === "start" && record.stage !== "核对完成")
      return message.warning("请先完成资料、申请表及校验核对");
    const note =
      opinion.trim() ||
      (action === "check" ? "资料与申请已核对" : "发起分管领导线上审批");
    if (
      persist((store) => {
        const item = store.invitations.find((entry) => entry.id === selected);
        if (action === "check") {
          item.application = applicationFromProfile(item);
          item.stage = "核对完成";
        }
        if (action === "start") {
          item.stage = "领导审批中";
          item.flowId = uid("FLOW");
        }
        item.history.push(
          log("股权运营部（演示）", `${processActionText[action]}：${note}`),
        );
      })
    ) {
      setOpinion("");
      setSelected(null);
      setStageFilter("");
      return true;
    }
    return false;
  }
  function persistPendingMaterials(nextStage) {
    if (!record || record.stage !== "资料完善中") return false;
    const profile = draftProfile(record);
    const application = applicationFromProfile({ ...record, profile });
    return persist(
      (store) => {
        const item = store.invitations.find((entry) => entry.id === selected);
        item.profile = profile;
        item.application = application;
        item.submitted = true;
        if (nextStage) item.stage = nextStage;
        item.history.push(
          log(
            "股权运营部（演示）",
            nextStage ? "提交入库办理资料，进入资料完善中" : "保存入库办理资料",
          ),
        );
      },
      nextStage ? "已提交，进入资料完善中" : "已保存",
    );
  }
  function savePendingInvitation() {
    persistPendingMaterials();
  }
  function submitPendingInvitation() {
    if (persistPendingMaterials("资料完善中")) {
      setSelected(null);
      setStageFilter("");
    }
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
    {
      title: "当前阶段",
      dataIndex: "stage",
      width: 130,
      render: (value) => (
        <Tag color={stageColor(value)}>{displayedStage(value)}</Tag>
      ),
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
      width: 250,
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
          {item.stage === "资料完善中" ? (
            <Popconfirm
              title="确认删除这条入库办理记录？"
              description="删除后关联推荐人员将恢复为待邀请，通知记录保留。"
              okText="确认删除"
              cancelText="取消"
              okButtonProps={{ danger: true }}
              onConfirm={() => deleteInvitation(item)}
            >
              <Button type="link" danger>
                删除
              </Button>
            </Popconfirm>
          ) : null}
        </Space>
      ),
    },
  ];
  const smsColumns = [
    { title: "通知方式", dataIndex: "type", width: 100 },
    { title: "接收人", dataIndex: "name", width: 110 },
    { title: "手机号 / 邮箱", dataIndex: "address", width: 200 },
    { title: "通知内容", dataIndex: "content", minWidth: 320, ellipsis: true },
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
    if (["资料完善中", "审批退回", "核对完成"].includes(record.stage)) {
      return (
        <div className={styles.actionBar}>
          <Input.TextArea
            rows={3}
            value={opinion}
            onChange={(event) => setOpinion(event.target.value)}
            placeholder={
              record.stage === "核对完成"
                ? "发起审批说明（选填）"
                : "资料核对意见（选填）"
            }
          />
          {["资料完善中", "审批退回"].includes(record.stage) ? (
            <Popconfirm
              title="确认完成资料与申请核对？"
              description="请确认专家履历资料与推荐表已填写完整。"
              okText="确认完成"
              cancelText="取消"
              onConfirm={() => process("check")}
            >
              <Button type="primary" disabled={!canFinishCheck}>
                完成资料与申请核对
              </Button>
            </Popconfirm>
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
        <div>
          <Alert type="info" showIcon message="审批中" description="" />
        </div>
      );
    }
    if (record.stage === "待签发聘书") {
      return (
        <Alert
          type="warning"
          showIcon
          message="分管领导审批已通过，待发送聘书"
          description="配置固定3年聘期并向专家发送聘书，发送后正式入库。"
          action={
            <Button type="primary" size="small" onClick={openAppointment}>
              发送聘书
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
          message="聘书已发送，专家已正式入库"
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
    <div className={embedded ? undefined : styles.page}>
      <div className={styles.content}>
        {embedded ? null : (
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
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openInvite()}
              >
                发起合作邀请
              </Button>
            </div>
          </div>
        )}

        {embedded ? null : (
          <div className={styles.demoNotice}>
            <WarningOutlined />
            <span>{demoNotice}</span>
          </div>
        )}

        <Card className={`${styles.card} ${styles.tabCard}`}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "pool",
                label: `初始推荐名单（${state.candidates.length}）`,
                children: (
                  <CandidatePool
                    onInvite={openInvite}
                    onDeleteCandidate={deleteCandidate}
                    onViewInvitation={(candidate) =>
                      setLetterPreview(
                        state.invitations.find(
                          (item) => item.id === candidate.invitationId,
                        ),
                      )
                    }
                  />
                ),
              },
              {
                key: "invitations",
                label: `入库办理（${state.invitations.length}）`,
                children: (
                  <>
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
                      </button>
                      {stageStrip.map((stage) => (
                        <button
                          type="button"
                          key={stage}
                          title={stageHint(stage)}
                          className={`${styles.stageItem} ${stageFilter === stage ? styles.active : ""}`}
                          onClick={() =>
                            setStageFilter(stageFilter === stage ? "" : stage)
                          }
                        >
                          <span>
                            <i style={{ background: stageTone(stage) }} />
                            {displayedStage(stage)}
                          </span>
                          <b>{stageCounts[stage] || 0}</b>
                        </button>
                      ))}
                    </div>
                    <div className={styles.tableTop}>
                      <strong>入库办理列表</strong>
                      <div className={styles.tableTools}>
                        {stageFilter ? (
                          <span className={styles.filterChip}>
                            已按「{displayedStage(stageFilter)}」筛选
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
                label: `短信/邮件通知记录（${state.sms.length}）`,
                children: (
                  <>
                    <div className={styles.tableTop}>
                      <strong>短信/邮件通知记录</strong>
                      <span>共 {state.sms.length} 条</span>
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
                          "尚未生成通知记录，发起合作邀请后自动记录短信和邮件通知",
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
        okText="生成邀请函并通知"
        cancelText="取消"
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
          </div>
          <Form.Item name="invitationNote" label="合作邀请说明">
            <Input.TextArea rows={5} showCount maxLength={500} />
          </Form.Item>
          <Alert
            type="info"
            showIcon
            message="生成邀请函后将自动记录短信和邮件通知"
            description="通知记录会保存在短信/邮件通知记录中，供后续查询。正式环境提交时将同时发送短信和邮件。"
          />
        </Form>
      </Modal>

      <Modal
        title="专家合作邀请函"
        open={!!letterPreview}
        onCancel={() => setLetterPreview(null)}
        footer={[
          <Button key="close" onClick={() => setLetterPreview(null)}>
            关闭
          </Button>,
          <Button
            key="download"
            type="primary"
            onClick={() => {
              if (!letterPreview) return;
              const printWindow = window.open("", "_blank");
              if (!printWindow) {
                message.error("浏览器阻止了打印窗口，请允许弹出窗口后重试");
                return;
              }
              printWindow.document.write(
                `<!doctype html><html><head><meta charset="utf-8"><title>${letterPreview.letterNo || "专家合作邀请函"}</title><style>body{font-family:serif;color:#222;margin:60px auto;max-width:760px;line-height:2}h1{text-align:center;font-size:26px;margin:50px 0}p{font-size:16px;text-indent:2em}.meta{text-align:right;margin-top:60px}</style></head><body><h1>${letterPreview.letterTemplate || "专家合作邀请函"}</h1><p>${letterPreview.name}老师：</p><p>${letterPreview.invitationNote || DEFAULT_INVITATION_NOTE}</p><p class="meta">一汽股权投资（天津）有限公司<br>邀请函编号：${letterPreview.letterNo || "--"}<br>${new Date().toLocaleDateString("zh-CN")}</p><script>window.onload=()=>window.print()<\/script></body></html>`,
              );
              printWindow.document.close();
            }}
          >
            下载 PDF
          </Button>,
        ]}
        width={760}
      >
        {letterPreview ? (
          <div className={styles.letterPreview}>
            <h2>{letterPreview.letterTemplate || "专家合作邀请函"}</h2>
            <p>{letterPreview.name}老师：</p>
            <p>{letterPreview.invitationNote || DEFAULT_INVITATION_NOTE}</p>
            <div>
              一汽股权投资（天津）有限公司
              <br />
              邀请函编号：{letterPreview.letterNo || "--"}
            </div>
          </div>
        ) : null}
      </Modal>

      <Drawer
        width="min(880px, 92vw)"
        title="专家入库办理详情"
        open={!!selected}
        destroyOnClose
        onClose={() => setSelected(null)}
        footer={
          record?.stage === "资料完善中" ? (
            <div className={styles.drawerFooter}>
              <Button onClick={savePendingInvitation}>保存</Button>
              <Button type="primary" onClick={submitPendingInvitation}>
                提交
              </Button>
            </div>
          ) : null
        }
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
                      <Tag color={stageColor(record.stage)}>
                        {displayedStage(record.stage)}
                      </Tag>
                    ),
                  },
                  {
                    key: "letter",
                    label: "合作邀请函",
                    children: `${record.letterNo || "—"} / ${record.letterTemplate || "—"}`,
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
                  履历资料：
                  <b>
                    {complete(record) || record.submitted ? "已填写" : "未填写"}
                  </b>
                </span>
                <span>
                  推荐表：
                  <b>{applicationComplete(record) ? "已完成" : "未完成"}</b>
                </span>
                <span>
                  三重校验：
                  <b>已确认</b>
                </span>
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>专家履历资料</h3>
              {visibleProfileEntries.length ? (
                <Descriptions
                  bordered
                  column={1}
                  size="small"
                  items={visibleProfileEntries.map(([key, value]) => ({
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
                  message="尚未填写专家履历资料"
                  description="请由经办人员补充并保存专家履历资料。"
                />
              )}
              <div>
                <Button
                  disabled={lockedStages.includes(record.stage)}
                  onClick={openProfile}
                >
                  {Object.entries(record.profile || {}).length
                    ? "修改履历资料"
                    : "填写履历资料"}
                </Button>
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>需求部门《专家推荐表》</h3>
              {applicationComplete(record) ? null : (
                <Alert
                  type="warning"
                  showIcon
                  message="推荐表尚未填写完整，不能发起审批。可带出的字段已按专家履历资料预填。"
                />
              )}
              <PaperApplication
                readOnly
                values={applicationFromProfile(record)}
              />
              <div>
                <Button
                  disabled={lockedStages.includes(record.stage)}
                  onClick={openApplication}
                >
                  {applicationComplete(record) ? "修改推荐表" : "填写推荐表"}
                </Button>
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>三重校验</h3>
              <div className={styles.checkList}>
                {(record.checks || defaultChecks).map((item) => (
                  <div
                    key={item.key}
                    className={`${styles.checkItem} ${styles.confirmed}`}
                  >
                    <div className={styles.checkHead}>
                      <b>{item.name}</b>
                      <Tag color="success">通过</Tag>
                    </div>
                    <p>{item.detail}</p>
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

      <Modal
        title="填写《专家推荐表》"
        open={applicationOpen}
        onCancel={() => setApplicationOpen(false)}
        onOk={saveApplication}
        width={920}
        okText="保存"
        cancelText="取消"
      >
        <Alert
          className={styles.formAlert}
          type="info"
          showIcon
          message="个人基本信息及教育、经历、证书、专长按专家履历资料带出，可再修改。"
        />
        <Form form={applicationForm} layout="vertical">
          <PaperApplication />
        </Form>
      </Modal>

      <Modal
        title="填写专家履历资料"
        open={profileOpen}
        onCancel={() => setProfileOpen(false)}
        onOk={saveProfile}
        width={760}
        okText="保存"
        cancelText="取消"
      >
        <Alert
          className={styles.formAlert}
          type="info"
          showIcon
          message="请由经办人员补充并保存专家履历资料。"
        />
        <Form form={profileForm} layout="vertical">
          {profileFormFields.map(([key, label]) => (
            <Form.Item
              key={key}
              name={key}
              label={label}
              rules={
                profileRequiredFields.includes(key)
                  ? [{ required: true, whitespace: true }]
                  : []
              }
            >
              {key === "gender" ? (
                <Select options={["男", "女"].map((value) => ({ value }))} />
              ) : key === "idType" ? (
                <Select
                  options={["身份证", "护照", "其他"].map((value) => ({
                    value,
                  }))}
                />
              ) : [
                  "education",
                  "educationPeriod",
                  "experience",
                  "projects",
                  "keywords",
                  "results",
                ].includes(key) ? (
                <Input.TextArea rows={2} />
              ) : (
                <Input type={key === "birth" ? "date" : "text"} />
              )}
            </Form.Item>
          ))}
          <Form.Item name="consent" valuePropName="checked" initialValue={true}>
            <Checkbox>已确认诚信、保密、利益关联及个人信息授权声明</Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="发送专家聘书"
        open={appointmentOpen}
        onCancel={() => setAppointmentOpen(false)}
        onOk={submitAppointment}
        width={680}
        okText="发送聘书"
        cancelText="取消"
      >
        <Form form={appointmentForm} layout="vertical">
          <Alert
            className={styles.formAlert}
            type="info"
            showIcon
            message={`聘期固定3年；${record?.profile?.category || "普通专家"}年龄上限为${ageLimitFor(record?.profile?.category)}周岁。`}
          />
          <Form.Item name="number" label="聘书编号">
            <Input readOnly />
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
          </div>
          <Form.Item label="聘书文件" required>
            <div className={styles.appointmentFileSection}>
              <div className={styles.appointmentFileCard}>
                <div className={styles.appointmentFileIcon}>
                  <FileTextOutlined />
                </div>
                <div className={styles.appointmentFileInfo}>
                  <strong>
                    {appointmentFiles[0]?.name || "尚未生成聘书文件"}
                  </strong>
                  <span>
                    {appointmentFiles[0]?.source || "请生成文件或上传已有文件"}
                  </span>
                </div>
                <Button
                  type="link"
                  icon={<ReloadOutlined />}
                  onClick={() => generateAppointmentFile()}
                >
                  重新生成
                </Button>
              </div>
              <Upload.Dragger
                className={styles.appointmentUpload}
                accept=".doc,.docx,.pdf"
                maxCount={1}
                fileList={[]}
                showUploadList={false}
                beforeUpload={(file) => {
                  setAppointmentFiles([
                    {
                      uid: file.uid,
                      name: file.name,
                      status: "done",
                      source: "已上传新文件",
                      originFileObj: file,
                    },
                  ]);
                  return false;
                }}
              >
                <p className={styles.appointmentUploadIcon}>
                  <UploadOutlined />
                </p>
                <p className={styles.appointmentUploadTitle}>
                  上传新文件替换当前聘书
                </p>
                <p className={styles.appointmentUploadHint}>
                  点击选择或拖拽文件至此，支持 DOC、DOCX、PDF
                </p>
              </Upload.Dragger>
              {!appointmentFiles.length ? (
                <span className={styles.appointmentFileError}>
                  请生成或上传聘书文件
                </span>
              ) : null}
            </div>
          </Form.Item>
        </Form>
      </Modal>
      <ApprovalDetailModal
        record={approvalRecord}
        open={!!approvalRecord}
        onClose={() => setApprovalDetailId(null)}
      />
    </div>
  );
}
