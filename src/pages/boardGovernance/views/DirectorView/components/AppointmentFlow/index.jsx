import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Descriptions,
  Form,
  Input,
  Modal,
  Select,
  Segmented,
  Steps,
  Tabs,
  Timeline,
  Upload,
  message,
} from "antd";
import {
  BellOutlined,
  CheckCircleFilled,
  DingdingOutlined,
  FileDoneOutlined,
  SendOutlined,
  UserAddOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  DataTable,
  SectionCard,
  StatusPill,
} from "../../../../components/PageKit";
import AppointmentActionPanel from "../AppointmentActionPanel";
import styles from "./index.module.less";

const initialCases = [
  {
    id: "AP-2026-007",
    director: "赵启明",
    company: "一汽能源科技",
    position: "外部董事",
    letter: "一汽股董推〔2026〕17号",
    letterFileName: "董事推荐函-赵启明.pdf",
    owner: "综合管理部-办公室 / 阮迪",
    recipient: "综合管理部-人力 / 周航",
    deadline: "09-17 17:00",
    status: "待上传董事简历",
    currentStep: 2,
  },
  {
    id: "AP-2026-006",
    director: "陈思远",
    company: "旗新动力科技",
    position: "专职外部董事",
    letter: "一汽股董推〔2026〕16号",
    letterFileName: "董事推荐函-陈思远.pdf",
    owner: "综合管理部-人力 / 周航",
    recipient: "综合管理部-人力 / 周航",
    deadline: "09-16 12:00",
    status: "待权限配置",
    currentStep: 3,
  },
  {
    id: "AP-2026-005",
    director: "林舒然",
    company: "红旗私募基金",
    position: "外部董事",
    letter: "一汽股董推〔2026〕15号",
    letterFileName: "董事推荐函-林舒然.pdf",
    owner: "综合管理部-人力 / 周航",
    recipient: "综合管理部-董办 / 王珂",
    deadline: "09-20 17:00",
    status: "待完成工商变更",
    currentStep: 5,
  },
];

function casesForDirector(director) {
  if (!director) return initialCases;
  const appointmentState = {
    待上传董事简历: { status: "待上传董事简历", currentStep: 2 },
    待配置系统权限: { status: "待配置系统权限", currentStep: 3 },
    待完成工商变更: { status: "待完成工商变更", currentStep: 6 },
    已完成: { status: "已完成", currentStep: 7 },
  };
  return [
    {
      ...initialCases[0],
      id: `AP-${director.id}`,
      director: director.name,
      company: director.company,
      position: director.role,
      ...(appointmentState[director.appointmentStatus] || {
        status: "待接收推荐函",
        currentStep: 1,
      }),
    },
  ];
}

const processSteps = [
  ["下发董事推荐函", "集团董办", "线上下发并创建交接任务"],
  ["接收董事推荐函", "综合管理部-办公室", "钉钉提醒指定经办人接收"],
  ["上传董事简历", "综合管理部-办公室", "上传简历并完成材料校验"],
  ["配置系统权限", "综合管理部-人力", "按董事身份开通工作台权限"],
  ["纳入组织架构", "综合管理部-人力", "同步人员、岗位与任期信息"],
  ["人员选举 / 专委会委员变更", "综合管理部-董办", "完成后更新聘任事项状态"],
  ["工商变更", "审计风控与法务部", "确认完成后归档聘任事项"],
];

const initialAuditMessages = [
  {
    id: "MSG-20260915-003",
    time: "14:21",
    caseId: "AP-2026-007",
    director: "赵启明",
    recipient: "综合管理部-办公室 / 阮迪",
    deadline: "09-17 17:00",
    title: "董事推荐函已下发",
    detail: "请在 09-17 17:00 前上传董事简历，完成后转交人力科室办理。",
  },
  {
    id: "MSG-20260915-002",
    time: "11:06",
    caseId: "AP-2026-006",
    director: "陈思远",
    recipient: "综合管理部-办公室 / 胡欣悦",
    deadline: "09-16 12:00",
    title: "董事推荐函已下发",
    detail: "请在 09-16 12:00 前上传董事简历，完成后转交人力科室办理。",
  },
  {
    id: "MSG-20260914-001",
    time: "09-14 16:42",
    caseId: "AP-2026-005",
    director: "林舒然",
    recipient: "综合管理部-办公室 / 王玥",
    deadline: "09-20 17:00",
    title: "董事推荐函已下发",
    detail: "推荐函、办理要求和董事简历上传任务已送达。",
  },
];

const appointmentRoles = [
  { value: "groupOffice", label: "集团董办", action: "下发董事推荐函" },
  { value: "adminOffice", label: "综合管理部-办公室", action: "查看聘任事项" },
  { value: "adminHr", label: "综合管理部-人力", action: "上传董事简历" },
  { value: "adminDigital", label: "综合管理部-数字化", action: "配置系统权限" },
  { value: "adminBoard", label: "综合管理部-董办", action: "完成变更" },
];

const roleActionSteps = {
  groupOffice: ["issue"],
  adminHr: ["resume"],
  adminDigital: ["permission"],
  adminBoard: ["change"],
};

export default function AppointmentFlow({
  director,
  handlerRole = "groupOffice",
  autoOpenIssue = false,
  onIssueLetterOpened,
  embedded = false,
  modalOnly = false,
  variant,
  cases: casesProp,
  onCasesChange,
  selectedId,
  onSelectId,
  onIssueCreated,
  onCaseCompleted,
  canIssueLetter = handlerRole === "groupOffice",
}) {
  const listOnly = variant === "list";
  const detailOnly = variant === "detail" || embedded;
  const directorCases = casesProp || casesForDirector(director);
  const [uncontrolledCases, setUncontrolledCases] = useState(directorCases);
  const cases = casesProp || uncontrolledCases;
  const setCases = (updater) => {
    const next = typeof updater === "function" ? updater(cases) : updater;
    if (casesProp) onCasesChange?.(next);
    else setUncontrolledCases(next);
  };
  const [selectedLocal, setSelectedLocal] = useState(
    directorCases.find((item) => item.id === selectedId) || directorCases[0],
  );
  const selected =
    cases.find((item) => item.id === (selectedId || selectedLocal?.id)) ||
    cases[0] ||
    directorCases[0];
  const [open, setOpen] = useState(false);
  const [letterFileList, setLetterFileList] = useState([]);
  const [auditMessages, setAuditMessages] = useState(initialAuditMessages);
  const [activeAuditId, setActiveAuditId] = useState(
    initialAuditMessages[0].id,
  );
  const role = handlerRole;
  const [keyword, setKeyword] = useState("");
  const [progressFilter, setProgressFilter] = useState("open");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const selectedAuditMessages = useMemo(
    () =>
      selected
        ? auditMessages.filter((item) => item.caseId === selected.id)
        : [],
    [auditMessages, selected],
  );
  const visibleAuditMessages = useMemo(() => {
    if (!selected) return [];
    return selectedAuditMessages.length
      ? selectedAuditMessages
      : [
          {
            id: `MSG-${selected.id}`,
            time: "09:30",
            caseId: selected.id,
            director: selected.director,
            recipient: selected.owner,
            deadline: selected.deadline,
            title: "聘任事项已创建",
            detail: `事项已进入${selected.status}阶段，当前由${selected.owner}办理。`,
          },
        ];
  }, [selected, selectedAuditMessages]);
  const roleMeta =
    appointmentRoles.find((item) => item.value === role) || appointmentRoles[0];

  useEffect(() => {
    if (autoOpenIssue && canIssueLetter) {
      setOpen(true);
      onIssueLetterOpened?.();
    }
  }, [autoOpenIssue, canIssueLetter, onIssueLetterOpened]);

  useEffect(() => {
    if (!visibleAuditMessages.some((item) => item.id === activeAuditId)) {
      setActiveAuditId(visibleAuditMessages[0]?.id);
    }
  }, [activeAuditId, selected?.id, visibleAuditMessages]);
  const ownerOptions = useMemo(
    () => [...new Set(cases.map((item) => item.owner))],
    [cases],
  );
  const statusOptions = useMemo(
    () => [...new Set(cases.map((item) => item.status))],
    [cases],
  );
  const filteredCases = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return cases.filter((item) => {
      const matchesKeyword =
        !normalizedKeyword ||
        [item.id, item.director, item.company].some((value) =>
          value.toLowerCase().includes(normalizedKeyword),
        );
      const matchesProgress =
        !listOnly ||
        progressFilter === "all" ||
        (progressFilter === "open"
          ? item.status !== "已完成"
          : item.status === "已完成");
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchesOwner = ownerFilter === "all" || item.owner === ownerFilter;
      return matchesKeyword && matchesProgress && matchesStatus && matchesOwner;
    });
  }, [cases, keyword, listOnly, ownerFilter, progressFilter, statusFilter]);

  const selectCase = (nextCase) => {
    setSelectedLocal(nextCase);
    onSelectId?.(nextCase.id);
    const nextAudit = auditMessages.find((item) => item.caseId === nextCase.id);
    setActiveAuditId(nextAudit?.id);
  };

  useEffect(() => {
    if (
      !listOnly &&
      filteredCases.length &&
      selected &&
      !filteredCases.some((item) => item.id === selected.id)
    ) {
      selectCase(filteredCases[0]);
    }
  }, [filteredCases, listOnly, selected?.id]);

  const updateSelected = (patch, successMessage) => {
    if (!selected) return;
    const next = { ...selected, ...patch };
    setSelectedLocal(next);
    setCases((current) =>
      current.map((item) => (item.id === selected.id ? next : item)),
    );
    messageApi.success(successMessage);
    if (next.status === "已完成" || next.currentStep >= 7) {
      onCaseCompleted?.(next);
    }
  };

  const issueLetter = async () => {
    if (!canIssueLetter) {
      messageApi.error("仅集团董办可以下发董事推荐函");
      return;
    }
    if (!letterFileList.length) {
      messageApi.error("请先上传推荐函文件");
      return;
    }
    const values = await form.validateFields();
    const nextCase = {
      id: `AP-2026-${String(cases.length + 8).padStart(3, "0")}`,
      director: values.director,
      company: values.company,
      position: values.position,
      letter: values.letter,
      letterFileName: letterFileList[0].name,
      owner: `综合管理部-办公室 / ${values.recipient}`,
      recipient: "综合管理部-人力 / 周航",
      deadline: values.deadline,
      status: "待上传董事简历",
      currentStep: 2,
    };
    setCases((current) => [nextCase, ...current]);
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const auditId = `MSG-${Date.now()}`;
    setAuditMessages((current) => [
      {
        id: auditId,
        time,
        caseId: nextCase.id,
        director: nextCase.director,
        recipient: nextCase.owner,
        deadline: nextCase.deadline,
        title: "董事推荐函已下发",
        detail: `请在 ${nextCase.deadline} 前上传董事简历，完成后转交人力科室办理。`,
      },
      ...current,
    ]);
    setActiveAuditId(auditId);
    setSelectedLocal(nextCase);
    setOpen(false);
    form.resetFields();
    setLetterFileList([]);
    messageApi.success("推荐函已下发，钉钉消息与待办已送达指定经办人");
    onIssueCreated?.(nextCase);
  };

  return (
    <div
      className={`${styles.workspace} ${embedded ? styles.embeddedWorkspace : ""} ${modalOnly ? styles.modalOnly : ""}`}
    >
      {contextHolder}
      <section className={styles.command}>
        <div>
          <span className={styles.role}>当前角色 · {roleMeta.label}</span>
          <h2>董事聘任工作台</h2>
          <p>
            {detailOnly && selected
              ? `聚焦 ${selected.director} 的聘任事项，完整展示办理信息、流程节点、交接规则与审计记录。`
              : "全量查看聘任事项，按当前角色办理职责范围内的节点，所有操作自动保留完整交接证据。"}
          </p>
        </div>
        {listOnly && canIssueLetter ? (
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => setOpen(true)}
          >
            下发董事推荐函
          </Button>
        ) : selected ? (
          <div className={styles.commandMeta}>
            <span>当前聘任状态</span>
            <strong>{selected.status}</strong>
            <small>当前责任人：{selected.owner}</small>
          </div>
        ) : null}
      </section>

      {listOnly ? (
        <div className={styles.metrics}>
          <Segmented
            value={progressFilter}
            onChange={setProgressFilter}
            options={[
              { label: "办理中", value: "open" },
              { label: "已完成", value: "done" },
            ]}
          />
        </div>
      ) : selected ? (
        <div className={styles.metrics}>
          {(detailOnly
            ? [
                [
                  "流程进度",
                  `${Math.min(selected.currentStep + 1, processSteps.length)} / ${processSteps.length}`,
                  "已完成节点 / 全部节点",
                ],
                ["当前状态", selected.status, roleMeta.label],
                ["办理时限", selected.deadline, "超时前自动提醒"],
                [
                  "交接记录",
                  `${visibleAuditMessages.length} 条`,
                  "消息与审计轨迹",
                ],
              ]
            : [
                ["待上传董事简历", "2", "综合管理部-办公室"],
                ["待配置系统权限", "1", "综合管理部-人力"],
                ["待选举 / 工商变更", "4", "董办 / 法务"],
              ]
          ).map(([label, value, owner]) => (
            <article key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{owner}</small>
            </article>
          ))}
        </div>
      ) : null}

      {detailOnly && selected ? (
        <SectionCard
          title={`${selected.director} · 聘任事项详情`}
          extra={<StatusPill>{selected.status}</StatusPill>}
        >
          <div className={styles.caseOverview}>
            <div className={styles.caseIdentity}>
              <span>事项编号</span>
              <strong>{selected.id}</strong>
              <p>
                {selected.company} · {selected.position}
              </p>
            </div>
            <Descriptions
              size="small"
              column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
              items={[
                {
                  key: "letter",
                  label: "推荐函",
                  children: selected.letter || "待生成",
                },
                {
                  key: "letterFile",
                  label: "推荐函文件",
                  children: selected.letterFileName ? (
                    <span className={styles.fileValue}>
                      <FileDoneOutlined />
                      {selected.letterFileName}
                    </span>
                  ) : (
                    "未上传"
                  ),
                },
                {
                  key: "deadline",
                  label: "办理时限",
                  children: selected.deadline,
                },
                { key: "owner", label: "当前责任人", children: selected.owner },
                {
                  key: "recipient",
                  label: "下一接收人",
                  children: selected.recipient,
                },
              ]}
            />
          </div>
        </SectionCard>
      ) : (
        <SectionCard
          title="聘任事项台账"
          extra={
            <span className={styles.hint}>
              共 {filteredCases.length} / {cases.length} 项 ·
              点击事项查看流程定位和交接记录
            </span>
          }
        >
          <div className={styles.filters}>
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索事项编号、董事或任职企业"
              allowClear
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "全部状态" },
                ...statusOptions.map((value) => ({ value, label: value })),
              ]}
            />
            <Select
              value={ownerFilter}
              onChange={setOwnerFilter}
              options={[
                { value: "all", label: "全部当前责任人" },
                ...ownerOptions.map((value) => ({ value, label: value })),
              ]}
            />
            <Button
              onClick={() => {
                setKeyword("");
                setStatusFilter("all");
                setOwnerFilter("all");
              }}
            >
              重置
            </Button>
          </div>
          <DataTable
            rows={filteredCases}
            selectedRowKey={selected?.id}
            onRowClick={selectCase}
            columns={[
              { title: "事项编号", dataIndex: "id" },
              { title: "拟任董事", dataIndex: "director" },
              {
                title: "任职企业 / 职务",
                render: (_, row) => (
                  <>
                    <b>{row.company}</b>
                    <small className={styles.cellSub}>{row.position}</small>
                  </>
                ),
              },
              { title: "推荐函", dataIndex: "letter", width: 210 },
              { title: "当前责任人", dataIndex: "owner", width: 210 },
              { title: "下一接收人", dataIndex: "recipient", width: 220 },
              { title: "办理时限", dataIndex: "deadline" },
              {
                title: "状态",
                dataIndex: "status",
                render: (value) => <StatusPill>{value}</StatusPill>,
              },
            ]}
          />
        </SectionCard>
      )}

      {!listOnly && selected ? (
        <>
          <AppointmentActionPanel
            key={`${selected.id}-${selected.currentStep}`}
            item={selected}
            roleLabel={roleMeta.label}
            allowedActions={Object.values(roleActionSteps).flat()}
            onUpdate={updateSelected}
          />

          <SectionCard
            title={`${selected.director} · 全流程定位`}
            extra={<StatusPill>{selected.status}</StatusPill>}
          >
            {!detailOnly ? (
              <Steps
                current={selected.currentStep}
                size="small"
                responsive={false}
                items={processSteps.map(([title, owner]) => ({
                  title,
                  description: owner,
                }))}
              />
            ) : null}
            <div
              className={
                detailOnly ? styles.embeddedProcess : styles.laneDetail
              }
            >
              {processSteps.map(([title, owner, detail], index) => (
                <article
                  key={title}
                  className={`${index === selected.currentStep ? styles.activeStep : ""} ${index < selected.currentStep ? styles.completedStep : ""}`}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <b>{title}</b>
                    <small>{owner}</small>
                    <p>{detail}</p>
                  </div>
                  <em>
                    {index < selected.currentStep
                      ? "已完成"
                      : index === selected.currentStep
                        ? "办理中"
                        : "待办理"}
                  </em>
                  {index < selected.currentStep ? <CheckCircleFilled /> : null}
                </article>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="消息与审计轨迹"
            extra={
              <span className={styles.auditCount}>
                <BellOutlined /> 共 {visibleAuditMessages.length} 条
              </span>
            }
          >
            <Tabs
              className={styles.auditTabs}
              activeKey={activeAuditId}
              onChange={setActiveAuditId}
              items={visibleAuditMessages.map((item) => ({
                key: item.id,
                label: (
                  <span className={styles.auditTabLabel}>
                    <b>{item.director}</b>
                    <small>{item.time}</small>
                  </span>
                ),
                children: (
                  <div className={styles.auditTimeline}>
                    <div className={styles.auditSummary}>
                      <strong>{item.caseId}</strong>
                      <span>接收人：{item.recipient}</span>
                    </div>
                    <Timeline
                      items={[
                        {
                          color: "green",
                          children: (
                            <>
                              <b>{item.time} 推荐函下发</b>
                              <p>集团董办 / 刘颖 · {item.caseId}</p>
                            </>
                          ),
                        },
                        {
                          color: "blue",
                          children: (
                            <>
                              <b>{item.time} 发送钉钉消息</b>
                              <p>送达 {item.recipient}</p>
                            </>
                          ),
                        },
                        {
                          color: "blue",
                          children: (
                            <>
                              <b>{item.time} 创建办理待办</b>
                              <p>要求上传董事简历，截止 {item.deadline}</p>
                            </>
                          ),
                        },
                        {
                          color: "gray",
                          children: (
                            <>
                              <b>待上传董事简历</b>
                              <p>
                                超时前 24 小时自动提醒，逾期升级至部门负责人
                              </p>
                            </>
                          ),
                        },
                      ]}
                    />
                  </div>
                ),
              }))}
            />
          </SectionCard>
        </>
      ) : null}

      <Modal
        open={open && canIssueLetter}
        width={720}
        title="下发董事推荐函"
        okText="下发并发送钉钉消息"
        footer={(_, { OkBtn }) => <OkBtn />}
        okButtonProps={{ icon: <DingdingOutlined /> }}
        onOk={issueLetter}
        onCancel={() => setOpen(false)}
      >
        <Alert
          type="info"
          showIcon
          message="下发后将自动通知综合管理部-办公室经办人"
          description="办公室上传董事简历后，系统继续通知综合管理部-人力经办人配置系统权限、纳入组织架构。"
        />
        <Form
          form={form}
          layout="vertical"
          className={styles.issueForm}
          initialValues={{
            company: "一汽能源科技",
            position: "外部董事",
            recipient: "阮迪",
            deadline: "2026-09-17 17:00",
          }}
        >
          <div className={styles.formGrid}>
            <Form.Item
              label="推荐函编号"
              name="letter"
              rules={[{ required: true }]}
            >
              <Input placeholder="如：一汽股董推〔2026〕18号" />
            </Form.Item>
            <Form.Item
              label="拟任董事"
              name="director"
              rules={[{ required: true }]}
            >
              <Input prefix={<UserAddOutlined />} placeholder="请输入姓名" />
            </Form.Item>
            <Form.Item
              label="任职企业"
              name="company"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  "一汽股权",
                  "一汽能源科技",
                  "旗新动力科技",
                  "红旗私募基金",
                ].map((value) => ({ value }))}
              />
            </Form.Item>
            <Form.Item
              label="董事类型"
              name="position"
              rules={[{ required: true }]}
            >
              <Select
                options={["外部董事", "专职外部董事", "职工董事"].map(
                  (value) => ({ value }),
                )}
              />
            </Form.Item>
            <Form.Item label="接收部门">
              <Input value="综合管理部-办公室" disabled />
            </Form.Item>
            <Form.Item
              label="接收人"
              name="recipient"
              rules={[{ required: true }]}
            >
              <Select
                options={["阮迪", "胡欣悦", "王玥"].map((value) => ({ value }))}
              />
            </Form.Item>
            <Form.Item
              label="办理时限"
              name="deadline"
              rules={[{ required: true }]}
            >
              <Input placeholder="YYYY-MM-DD HH:mm" />
            </Form.Item>
            <Form.Item label="推荐函文件" required>
              <Upload
                accept=".pdf,.doc,.docx"
                maxCount={1}
                fileList={letterFileList}
                beforeUpload={(file) => {
                  setLetterFileList([file]);
                  return false;
                }}
                onRemove={() => setLetterFileList([])}
              >
                <Button icon={<UploadOutlined />}>选择推荐函文件</Button>
              </Upload>
            </Form.Item>
          </div>
          <div className={styles.messagePreview}>
            <DingdingOutlined />
            <div>
              <b>钉钉消息预览</b>
              <p>
                【董事聘任任务】集团董办已下发董事推荐函，请在办理时限前接收并上传董事简历。完成后系统将通知人力科室配置系统权限并纳入组织架构。
              </p>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
