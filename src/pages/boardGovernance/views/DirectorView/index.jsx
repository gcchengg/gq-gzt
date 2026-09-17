import { useState } from "react";
import {
  Avatar,
  Button,
  Descriptions,
  Input,
  Progress,
  Select,
  Space,
  Tabs,
} from "antd";
import { Link, useSearchParams } from "react-router-dom";
import {
  AuditOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  EyeOutlined,
  FilterOutlined,
  FileAddOutlined,
  FileTextOutlined,
  PlusOutlined,
  SendOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  DataTable,
  GovernanceDrawer,
  PageHeader,
  ProgressCell,
  SectionCard,
  StatusPill,
} from "../../components/PageKit";
import { directors, dutyEvents, suggestions } from "../../mockData";
import AppointmentFlow from "./components/AppointmentFlow";
import DutyPlanWorkspace from "./components/DutyPlanWorkspace";
import DutyReportWorkspace from "./components/DutyReportWorkspace";
import DutyEvaluationWorkspace from "./components/DutyEvaluationWorkspace";
import MaterialHistoryDrawer from "./components/MaterialHistoryDrawer";
import styles from "./index.module.less";

const lifecycleStages = [
  {
    key: "appointment",
    label: "董事聘任",
    description: "推荐、交接与任职落位",
    icon: SolutionOutlined,
  },
  {
    key: "preparation",
    label: "履职准备",
    description: "手册与年度计划",
    icon: CalendarOutlined,
  },
  {
    key: "management",
    label: "履职管理",
    description: "任务、事实与成果",
    icon: TeamOutlined,
  },
  {
    key: "evaluation",
    label: "履职评价",
    description: "多角色评价与反馈",
    icon: AuditOutlined,
  },
];

const directorHandlerRoles = {
  "D-01": ["集团董办", "综合管理部-办公室", "董事本人"],
  "D-02": ["集团董办", "综合管理部-人力", "综合管理部-数字化"],
  "D-03": ["集团董办", "综合管理部-董办", "董事本人"],
  "D-04": ["集团董办", "综合管理部-办公室"],
  "D-05": ["集团董办", "综合管理部-人力"],
  "D-06": ["集团董办", "综合管理部-董办", "董事本人"],
};

const appointmentRoleKeys = {
  集团董办: "groupOffice",
  "综合管理部-办公室": "adminOffice",
  "综合管理部-人力": "adminHr",
  "综合管理部-数字化": "adminDigital",
  "综合管理部-董办": "adminBoard",
  董事本人: "adminBoard",
};

export default function DirectorView({
  role = "office",
  materials,
  dutyPlans,
  onCreateDutyPlan,
  onGenerateDutyTasks,
  generatedDirectorNames,
  dutyReports,
  onGenerateDutyReport,
  onSaveDutyReport,
  onReceiveDutyReport,
  suggestionTasks,
}) {
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedDirector, setSelectedDirector] = useState(null);
  const [openIssueLetter, setOpenIssueLetter] = useState(false);
  const [drawerStage, setDrawerStage] = useState(
    lifecycleStages.some((item) => item.key === searchParams.get("stage"))
      ? searchParams.get("stage")
      : "management",
  );
  const currentRole = role === "director" ? "董事本人" : "集团董办";
  const filteredDirectors = directors.filter((item) => {
    const normalized = keyword.trim().toLowerCase();
    const matchesKeyword =
      !normalized ||
      [item.id, item.name, item.role, item.company].some((value) =>
        value.toLowerCase().includes(normalized),
      );
    const matchesRole =
      roleFilter === "all" ||
      directorHandlerRoles[item.id]?.includes(roleFilter);
    return matchesKeyword && matchesRole;
  });
  const openDirector = (director, stage = getDirectorStage(director)) => {
    setSelectedDirector(director);
    setDrawerStage(stage);
  };
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="DIRECTOR LIFECYCLE"
        title="董事履职"
        subtitle="董事聘任、履职准备、履职管理、履职评价全周期协同与证据留痕"
      />
      <div className={styles.directorToolbar}>
        <Input
          allowClear
          prefix={<FilterOutlined />}
          placeholder="搜索董事姓名、编号、企业或董事类型"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        <Select
          value={roleFilter}
          onChange={setRoleFilter}
          options={[
            { value: "all", label: "全部办理角色" },
            { value: "集团董办", label: "集团董办" },
            { value: "董事本人", label: "董事本人" },
            { value: "综合管理部-办公室", label: "综合管理部-办公室" },
            { value: "综合管理部-人力", label: "综合管理部-人力" },
            { value: "综合管理部-数字化", label: "综合管理部-数字化" },
            { value: "综合管理部-董办", label: "综合管理部-董办" },
          ]}
        />
        <span className={styles.toolbarHint}>当前身份：{currentRole}</span>
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={() => {
            const appointmentDirector =
              directors.find((item) => item.lifecycleStage === "appointment") ||
              directors[0];
            setOpenIssueLetter(true);
            openDirector(appointmentDirector, "appointment");
          }}
        >
          下发董事推荐函
        </Button>
      </div>
      <SectionCard
        title="董事列表"
        extra={
          <span className={styles.tableMeta}>
            {filteredDirectors.length} 位董事
          </span>
        }
      >
        <DataTable
          rowKey="id"
          rows={filteredDirectors}
          onRowClick={openDirector}
          columns={directorColumns({
            openDirector,
            dutyPlans,
            dutyReports,
            suggestionTasks,
          })}
        />
      </SectionCard>
      <DirectorLifecycleDrawer
        director={selectedDirector}
        stage={drawerStage}
        onStageChange={setDrawerStage}
        onClose={() => setSelectedDirector(null)}
        materials={materials}
        dutyPlans={dutyPlans}
        onCreateDutyPlan={onCreateDutyPlan}
        onGenerateDutyTasks={onGenerateDutyTasks}
        generatedDirectorNames={generatedDirectorNames}
        dutyReports={dutyReports}
        onGenerateDutyReport={onGenerateDutyReport}
        onSaveDutyReport={onSaveDutyReport}
        onReceiveDutyReport={onReceiveDutyReport}
        suggestionTasks={suggestionTasks}
        currentRole={currentRole}
        appointmentRoleKey={
          appointmentRoleKeys[
            roleFilter === "all" ? currentRole : roleFilter
          ] || "groupOffice"
        }
        openIssueLetter={openIssueLetter}
        onIssueLetterOpened={() => setOpenIssueLetter(false)}
      />
    </div>
  );
}

function getDirectorStage(director) {
  if (!director) return "management";
  return lifecycleStages.some((item) => item.key === director.lifecycleStage)
    ? director.lifecycleStage
    : "management";
}

function directorColumns({
  openDirector,
  dutyPlans,
  dutyReports,
  suggestionTasks,
}) {
  return [
    {
      title: "董事信息",
      key: "director",
      fixed: "left",
      width: 190,
      render: (_, record) => (
        <div className={styles.directorCell}>
          <Avatar icon={<UserOutlined />} />
          <span>
            <strong>{record.name}</strong>
            <small>
              {record.id} · {record.role}
            </small>
          </span>
        </div>
      ),
    },
    { title: "任职企业", dataIndex: "company", width: 130 },
    { title: "任期", dataIndex: "term", width: 210 },
    {
      title: "当前阶段",
      key: "stage",
      width: 130,
      render: (_, record) => (
        <div className={styles.stageCell}>
          <StatusPill>{getDirectorStageLabel(record)}</StatusPill>
          <small>{record[`${record.lifecycleStage}Status`] || "待办理"}</small>
        </div>
      ),
    },
    {
      title: "董事聘任",
      key: "appointment",
      width: 150,
      render: (_, record) => (
        <StageStatus
          icon={<SolutionOutlined />}
          label={record.appointmentStatus}
          tone={record.appointmentStatus === "已完成" ? "success" : "warning"}
        />
      ),
    },
    {
      title: "履职准备",
      key: "preparation",
      width: 130,
      render: (_, record) => (
        <StageStatus
          icon={<CheckCircleOutlined />}
          label={record.preparationStatus}
          tone={record.preparationStatus === "已完成" ? "success" : "warning"}
        />
      ),
    },
    {
      title: "履职管理",
      key: "management",
      width: 150,
      render: (_, record) => (
        <div className={styles.managementCell}>
          <span>
            {record.days} 天 · {record.completion}%完成
          </span>
          <small>{record.managementStatus}</small>
        </div>
      ),
    },
    {
      title: "履职评价",
      key: "evaluation",
      width: 130,
      render: (_, record) => (
        <StageStatus
          icon={<ClockCircleOutlined />}
          label={record.evaluationStatus}
          tone={record.evaluationStatus === "已完成" ? "success" : "warning"}
        />
      ),
    },
    {
      title: "风险状态",
      dataIndex: "risk",
      width: 110,
      render: (value) => <StatusPill>{value}</StatusPill>,
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      width: 145,
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={(event) => {
              event.stopPropagation();
              openDirector(record);
            }}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={(event) => {
              event.stopPropagation();
              openDirector(record);
            }}
          >
            办理
          </Button>
        </Space>
      ),
    },
  ];
}

function getDirectorStageLabel(director) {
  return (
    lifecycleStages.find((item) => item.key === director?.lifecycleStage)
      ?.label || "履职管理"
  );
}

function StageStatus({ icon, label, tone }) {
  return (
    <span className={`${styles.stageStatus} ${styles[tone]}`}>
      {icon}
      {label}
    </span>
  );
}

function DirectorLifecycleDrawer({
  director,
  stage,
  onStageChange,
  onClose,
  materials,
  dutyPlans,
  onCreateDutyPlan,
  onGenerateDutyTasks,
  generatedDirectorNames,
  dutyReports,
  onGenerateDutyReport,
  onSaveDutyReport,
  onReceiveDutyReport,
  suggestionTasks,
  currentRole,
  appointmentRoleKey,
  openIssueLetter,
  onIssueLetterOpened,
}) {
  const [managementTab, setManagementTab] = useState("overview");
  const [event, setEvent] = useState(null);
  const visiblePlans = dutyPlans.filter(
    (item) => item.directorName === director?.name,
  );
  const visibleReports = dutyReports.filter(
    (item) => item.directorName === director?.name,
  );
  const visibleSuggestions = suggestionTasks.filter(
    (item) => item.directorName === director?.name,
  );
  return (
    <>
      <GovernanceDrawer
        open={!!director}
        onClose={onClose}
        width="min(1040px, 100vw)"
        title={director ? `${director.name} · 董事履职档案` : ""}
        subtitle={
          director
            ? `${director.company} · ${director.role} · 当前办理角色：${currentRole}`
            : ""
        }
      >
        {director ? (
          <>
            <div className={styles.drawerProfile}>
              <Avatar size={58} icon={<UserOutlined />} />
              <div>
                <span>{director.id}</span>
                <h2>{director.name}</h2>
                <p>
                  {director.company} · {director.committee} · 任期{" "}
                  {director.term}
                </p>
              </div>
              <div className={styles.drawerStats}>
                <strong>{director.days}</strong>
                <small>年度履职天数</small>
                <strong>{director.completion}%</strong>
                <small>计划完成率</small>
                <StatusPill>{director.risk}</StatusPill>
              </div>
            </div>
            <Tabs
              activeKey={stage}
              onChange={onStageChange}
              items={lifecycleStages.map((item) => ({
                key: item.key,
                label: item.label,
              }))}
            />
            <div className={styles.drawerStageBody}>
              {stage === "appointment" ? (
                <AppointmentFlow
                  key={director.id}
                  director={director}
                  handlerRole={appointmentRoleKey}
                  autoOpenIssue={openIssueLetter}
                  onIssueLetterOpened={onIssueLetterOpened}
                  embedded
                />
              ) : null}
              {stage === "preparation" ? (
                <PreparationWorkspace
                  compact
                  materials={materials}
                  dutyPlans={dutyPlans}
                  onCreateDutyPlan={onCreateDutyPlan}
                  onGenerateDutyTasks={onGenerateDutyTasks}
                  generatedDirectorNames={generatedDirectorNames}
                  director={director}
                  setDirector={() => {}}
                />
              ) : null}
              {stage === "management" ? (
                <DutyManagement
                  compact
                  director={director}
                  setDirector={() => {}}
                  tab={managementTab}
                  setTab={setManagementTab}
                  onEvent={setEvent}
                  dutyPlans={dutyPlans}
                  materials={materials}
                  dutyReports={dutyReports}
                  onGenerateDutyReport={onGenerateDutyReport}
                  onSaveDutyReport={onSaveDutyReport}
                  onReceiveDutyReport={onReceiveDutyReport}
                  suggestionTasks={visibleSuggestions}
                />
              ) : null}
              {stage === "evaluation" ? (
                <DutyEvaluationWorkspace
                  embedded
                  director={director}
                  plans={visiblePlans}
                  reports={visibleReports}
                  suggestionTasks={visibleSuggestions}
                />
              ) : null}
            </div>
          </>
        ) : null}
      </GovernanceDrawer>
      <EventDetailDrawer event={event} onClose={() => setEvent(null)} />
    </>
  );
}

function EventDetailDrawer({ event, onClose }) {
  return (
    <GovernanceDrawer
      open={!!event}
      onClose={onClose}
      title={event?.title}
      subtitle={`${event?.date} · ${event?.source}`}
    >
      <Descriptions
        column={2}
        items={[
          { key: 1, label: "履职类型", children: event?.type },
          {
            key: 2,
            label: "确认状态",
            children: <StatusPill>{event?.status}</StatusPill>,
          },
          { key: 3, label: "数据来源", children: event?.source },
          { key: 4, label: "履职天数", children: `${event?.days} 天` },
        ]}
      />
      <h3>事实与证据</h3>
      <p>{event?.evidence}</p>
      <h3>计算明细</h3>
      <div className={styles.calc}>
        <span>基础活动时间</span>
        <b>{event?.days} 天</b>
        <span>报告附加时间</span>
        <b>0 天</b>
        <strong>最终结果</strong>
        <strong>{event?.days} 天</strong>
      </div>
      <p className={styles.source}>
        系统同步数据仅允许补充说明，不允许修改会议、出席和表决等权威事实。
      </p>
    </GovernanceDrawer>
  );
}

function AppointmentDrawerPanel({ director }) {
  return (
    <div className={styles.drawerGrid}>
      <SectionCard title="聘任办理状态" extra={<StatusPill>办理中</StatusPill>}>
        <Descriptions
          column={2}
          items={[
            { key: 1, label: "董事人选", children: director.name },
            { key: 2, label: "任职企业", children: director.company },
            { key: 3, label: "董事类型", children: director.role },
            { key: 4, label: "专委会职务", children: director.committee },
          ]}
        />
        <div className={styles.drawerActions}>
          <Button type="primary" icon={<SendOutlined />}>
            下发董事推荐函
          </Button>
          <Button>查看推荐函</Button>
        </div>
      </SectionCard>
      <SectionCard title="聘任流程">
        {[
          "董事推荐函",
          "接收推荐函",
          "上传董事简历",
          "配置系统权限",
          "纳入组织架构",
          "聘任事项归档",
        ].map((item, index) => (
          <div className={styles.drawerTimeline} key={item}>
            <span className={index < 3 ? styles.doneDot : ""}>
              {index < 3 ? <CheckCircleOutlined /> : index + 1}
            </span>
            <div>
              <strong>{item}</strong>
              <small>{index < 3 ? "已完成 · 系统留痕" : "待办理"}</small>
            </div>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}

function PreparationDrawerPanel({
  director,
  materials,
  dutyPlans,
  onCreateDutyPlan,
  onGenerateDutyTasks,
  generatedDirectorNames,
}) {
  return (
    <div className={styles.drawerGrid}>
      <SectionCard
        title="履职手册"
        extra={
          <StatusPill>
            {materials.every((item) => item.status === "已提交")
              ? "已完成"
              : "更新中"}
          </StatusPill>
        }
      >
        <p className={styles.drawerDescription}>
          围绕任职企业、董事职责、制度依据和重点风险，为 {director.name}{" "}
          建立专属履职资料包。
        </p>
        <Button icon={<FileTextOutlined />}>查看履职手册</Button>
      </SectionCard>
      <SectionCard
        title="年度履职计划"
        extra={
          <StatusPill>{dutyPlans.length ? "已建立" : "待建立"}</StatusPill>
        }
      >
        <p className={styles.drawerDescription}>
          当前董事已有 {dutyPlans.length}{" "}
          项履职计划，支持继续编辑、确认并生成履职任务。
        </p>
        <DutyPlanWorkspace
          plans={dutyPlans}
          activeDirector={director}
          createOpen={false}
          onCreateOpenChange={() => {}}
          onCreatePlan={onCreateDutyPlan}
          onGenerateTasks={() => onGenerateDutyTasks(director.name)}
          annualGenerated={generatedDirectorNames.includes(director.name)}
        />
      </SectionCard>
    </div>
  );
}

function ManagementDrawerPanel({
  director,
  reports,
  suggestions,
  onGenerateDutyReport,
  onSaveDutyReport,
  onReceiveDutyReport,
}) {
  return (
    <div className={styles.drawerGrid}>
      <SectionCard title="履职概览">
        <div className={styles.drawerMetrics}>
          <div>
            <strong>{director.days}</strong>
            <span>年度履职天数</span>
          </div>
          <div>
            <strong>{director.completion}%</strong>
            <span>计划完成率</span>
          </div>
          <div>
            <strong>{suggestions.length}</strong>
            <span>意见建议</span>
          </div>
          <div>
            <strong>{reports.length}</strong>
            <span>成果报告</span>
          </div>
        </div>
      </SectionCard>
      <SectionCard title="履职事实与成果">
        <p className={styles.drawerDescription}>
          会议出席、调研培训、专项交流及意见建议均按董事维度归集，可继续补充证据并形成履职报告。
        </p>
        <div className={styles.drawerActions}>
          <Button type="primary" icon={<PlusOutlined />}>
            新增履职记录
          </Button>
          <Button icon={<FileAddOutlined />}>生成履职报告</Button>
        </div>
      </SectionCard>
      <SectionCard title="近期办理事项">
        <div className={styles.drawerList}>
          <div>
            <span>季度履职报告</span>
            <StatusPill>{director.report}</StatusPill>
          </div>
          <div>
            <span>意见建议跟踪</span>
            <StatusPill>{suggestions.length ? "办理中" : "暂无"}</StatusPill>
          </div>
          <div>
            <span>履职事实确认</span>
            <StatusPill>待检查</StatusPill>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function PreparationWorkspace({
  compact = false,
  materials,
  dutyPlans,
  onCreateDutyPlan,
  onGenerateDutyTasks,
  generatedDirectorNames,
  director,
  setDirector,
}) {
  const [historyMaterial, setHistoryMaterial] = useState(null);
  const [planComposerOpen, setPlanComposerOpen] = useState(false);
  const submittedCount = materials.filter(
    (item) => item.status === "已提交",
  ).length;
  const allSubmitted = submittedCount === materials.length;
  const directorPlans = dutyPlans.filter(
    (item) => item.directorName === director.name,
  );
  const annualPlanGenerated = generatedDirectorNames.includes(director.name);
  return (
    <div className={styles.stageWorkspace}>
      {!compact ? (
        <section
          className={styles.directorSelector}
          aria-label="履职准备董事选择"
        >
          <div className={styles.directorSelectorTitle}>
            <span>当前办理董事</span>
            <strong>请选择董事查看对应履职手册与年度计划</strong>
          </div>
          <div className={styles.directorOptions}>
            {directors.map((item) => {
              const planCount = dutyPlans.filter(
                (plan) => plan.directorName === item.name,
              ).length;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={
                    director.id === item.id ? styles.selectedDirector : ""
                  }
                  onClick={() => setDirector(item)}
                >
                  <Avatar icon={<UserOutlined />} />
                  <span>
                    <b>{item.name}</b>
                    <small>
                      {item.role} · {item.company}
                    </small>
                  </span>
                  <em>{planCount} 项计划</em>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}
      <div className={styles.stageIntro}>
        <div>
          <span>当前阶段 · {director.name} · 履职准备</span>
          <h2>为 {director.name} 准备履职手册与年度履职计划</h2>
          <p>
            定期发起资料更新，推送董事履职手册；汇总会议、培训、调研计划，经董事确认后自动生成履职任务。
          </p>
        </div>
        <Button
          type="primary"
          icon={<CalendarOutlined />}
          onClick={() => setPlanComposerOpen(true)}
        >
          发起年度履职计划
        </Button>
      </div>
      <div className={styles.prepGrid}>
        <SectionCard
          title="董事履职手册"
          extra={<Button>定期发起资料更新</Button>}
        >
          <DataTable
            rows={materials}
            columns={[
              { title: "资料类别", dataIndex: "category", width: 110 },
              { title: "资料名称", dataIndex: "material", width: 320 },
              { title: "责任部门", dataIndex: "department", width: 180 },
              { title: "责任人", dataIndex: "responsiblePerson", width: 130 },
              { title: "更新频次", dataIndex: "frequency", width: 100 },
              {
                title: "状态",
                dataIndex: "status",
                width: 100,
                render: (value) => <StatusPill>{value}</StatusPill>,
              },
              {
                title: "操作",
                width: 100,
                render: (_, row) => (
                  <Button
                    type="link"
                    onClick={(event) => {
                      event.stopPropagation();
                      setHistoryMaterial(row);
                    }}
                  >
                    查看详情
                  </Button>
                ),
              },
            ]}
          />
          <div className={styles.cardFooter}>
            <span>
              已提交 {submittedCount} / {materials.length}{" "}
              项；全部提交后可预览并推送董事履职手册
            </span>
            <Button type="primary" disabled={!allSubmitted}>
              预览并推送手册
            </Button>
          </div>
        </SectionCard>
        <SectionCard title="准备阶段进度">
          <ol className={styles.prepSteps}>
            <li className={styles.done}>
              <CheckCircleOutlined />
              <div>
                <b>资料目录确认</b>
                <span>{materials.length} 项资料已匹配责任部门和责任人</span>
              </div>
            </li>
            <li className={styles.done}>
              <CheckCircleOutlined />
              <div>
                <b>更新任务发起</b>
                <span>资料更新任务已发送至 4 个责任部门</span>
              </div>
            </li>
            <li className={allSubmitted ? styles.done : styles.current}>
              <FileTextOutlined />
              <div>
                <b>资料内容更新</b>
                <span>{materials.length - submittedCount} 项资料待提交</span>
              </div>
            </li>
            <li className={allSubmitted ? styles.current : ""}>
              <TeamOutlined />
              <div>
                <b>董事履职手册推送</b>
                <span>
                  {allSubmitted
                    ? "资料已全部提交，可预览并推送"
                    : "待资料全部提交"}
                </span>
              </div>
            </li>
          </ol>
        </SectionCard>
      </div>
      <DutyPlanWorkspace
        createOpen={planComposerOpen}
        onCreateOpenChange={setPlanComposerOpen}
        plans={directorPlans}
        onCreatePlan={onCreateDutyPlan}
        onGenerateTasks={() => onGenerateDutyTasks(director.name)}
        annualGenerated={annualPlanGenerated}
        activeDirector={director}
      />
      <MaterialHistoryDrawer
        material={historyMaterial}
        open={!!historyMaterial}
        onClose={() => setHistoryMaterial(null)}
      />
    </div>
  );
}

function DutyManagement({
  compact = false,
  director,
  setDirector,
  tab,
  setTab,
  onEvent,
  dutyPlans,
  materials,
  dutyReports,
  onGenerateDutyReport,
  onSaveDutyReport,
  onReceiveDutyReport,
  suggestionTasks,
}) {
  return (
    <div className={`${styles.layout} ${compact ? styles.compactLayout : ""}`}>
      {!compact ? (
        <aside className={styles.directory}>
          <h3>董事档案</h3>
          <p>一汽股权 · 在任董事 {directors.length} 人</p>
          {directors.map((item) => (
            <button
              key={item.id}
              className={director.id === item.id ? styles.selected : ""}
              onClick={() => setDirector(item)}
            >
              <Avatar icon={<UserOutlined />} />
              <div>
                <strong>{item.name}</strong>
                <span>{item.role}</span>
                <small>{item.committee}</small>
              </div>
              <StatusPill>{item.risk}</StatusPill>
            </button>
          ))}
        </aside>
      ) : null}
      <section className={styles.profile}>
        <div className={styles.hero}>
          <Avatar size={64} icon={<UserOutlined />} />
          <div className={styles.identity}>
            <span>{director.id}</span>
            <h2>
              {director.name} <StatusPill>{director.role}</StatusPill>
            </h2>
            <p>
              {director.company} · {director.committee}
            </p>
          </div>
          <div className={styles.heroStats}>
            <p>
              <b>{director.days}</b>
              <span>年度履职天数</span>
            </p>
            <p>
              <b>{director.completion}%</b>
              <span>计划完成率</span>
            </p>
            <p>
              <StatusPill>{director.report}</StatusPill>
              <span>季度报告</span>
            </p>
          </div>
        </div>
        <Tabs
          activeKey={tab}
          onChange={setTab}
          items={[
            { key: "overview", label: "履职概览" },
            { key: "plan", label: "履职计划" },
            { key: "events", label: "履职记录" },
            { key: "suggestions", label: "意见建议" },
            { key: "reports", label: "成果报告" },
            { key: "handbook", label: "履职手册" },
            { key: "evaluation", label: "评价结果" },
            { key: "appointment", label: "任职记录" },
          ]}
        />
        <TabContent
          tab={tab}
          director={director}
          onEvent={onEvent}
          dutyPlans={dutyPlans}
          materials={materials}
          reports={dutyReports.filter(
            (item) => item.directorName === director.name,
          )}
          onGenerateDutyReport={onGenerateDutyReport}
          onSaveDutyReport={onSaveDutyReport}
          onReceiveDutyReport={onReceiveDutyReport}
          suggestionTasks={suggestionTasks}
        />
      </section>
    </div>
  );
}

function DutyEvaluation() {
  const evaluators = [
    {
      id: 1,
      role: "董事本人",
      scope: "履职总结与自评",
      progress: 100,
      status: "已提交",
    },
    {
      id: 2,
      role: "班子成员",
      scope: "协同表现与专业贡献",
      progress: 75,
      status: "评价中",
    },
    {
      id: 3,
      role: "公司董办",
      scope: "出席、表决与任务完成",
      progress: 100,
      status: "已提交",
    },
    {
      id: 4,
      role: "其他支持机构",
      scope: "调研、培训与成果质量",
      progress: 50,
      status: "评价中",
    },
  ];
  return (
    <div className={styles.stageWorkspace}>
      <div className={`${styles.stageIntro} ${styles.evaluationIntro}`}>
        <div>
          <span>当前阶段 · 履职评价</span>
          <h2>用履职事实支撑多角色线上评价</h2>
          <p>
            按月度、季度、年度接收履职报告，确认评价人员与范围，自动带入会议、培训、调研和专项任务事实。
          </p>
        </div>
        <Button type="primary" icon={<AuditOutlined />}>
          发起年度评价
        </Button>
      </div>
      <div className={styles.evalGrid}>
        <SectionCard
          title="2026 年度履职评价"
          extra={<StatusPill>评价中</StatusPill>}
        >
          <div className={styles.evalSummary}>
            <Progress type="circle" percent={82} size={110} />
            <div>
              <span>评价对象</span>
              <b>张铁斌 · 外部董事召集人</b>
              <span>评价周期</span>
              <b>2026-01-01 至 2026-12-31</b>
              <span>事实完整度</span>
              <b>26 / 28 项</b>
            </div>
          </div>
          <div className={styles.flowNote}>
            <span>接收履职报告</span>
            <i>→</i>
            <span>发起评价</span>
            <i>→</i>
            <span>确认评价人员</span>
            <i>→</i>
            <span>分角色线上评价</span>
            <i>→</i>
            <span>结果反馈</span>
          </div>
        </SectionCard>
        <SectionCard title="自动带入的评价依据">
          <ul className={styles.evidenceList}>
            <li>
              <b>8 次</b>
              <span>会议出席与表决</span>
            </li>
            <li>
              <b>12 条</b>
              <span>专业意见建议</span>
            </li>
            <li>
              <b>3 项</b>
              <span>调研与专项成果</span>
            </li>
            <li>
              <b>15.5 天</b>
              <span>有效履职时间</span>
            </li>
          </ul>
        </SectionCard>
      </div>
      <SectionCard title="评价参与进度" extra={<Button>提醒未完成人员</Button>}>
        <DataTable
          rows={evaluators}
          columns={[
            { title: "评价角色", dataIndex: "role" },
            { title: "评价内容", dataIndex: "scope", width: 360 },
            {
              title: "完成进度",
              dataIndex: "progress",
              width: 280,
              render: (value) => <ProgressCell value={value} />,
            },
            {
              title: "状态",
              dataIndex: "status",
              render: (value) => <StatusPill>{value}</StatusPill>,
            },
            {
              title: "操作",
              render: () => <Button type="link">查看评价明细</Button>,
            },
          ]}
        />
      </SectionCard>
    </div>
  );
}

function TabContent({
  tab,
  director,
  onEvent,
  dutyPlans,
  materials,
  reports,
  onGenerateDutyReport,
  onSaveDutyReport,
  onReceiveDutyReport,
  suggestionTasks,
}) {
  const plans = dutyPlans.filter((item) => item.directorName === director.name);
  const events = taskEventsFromPlans(plans);
  if (tab === "overview")
    return <SyncedOverview plans={plans} events={events} onEvent={onEvent} />;
  if (tab === "plan") return <SyncedPlan plans={plans} />;
  if (tab === "events")
    return <SyncedEvents events={events} onEvent={onEvent} />;
  if (tab === "suggestions")
    return <SyncedSuggestions suggestionTasks={suggestionTasks} />;
  if (tab === "reports")
    return (
      <DutyReportWorkspace
        director={director}
        plans={plans}
        reports={reports}
        onGenerate={onGenerateDutyReport}
        onSave={onSaveDutyReport}
        onReceive={onReceiveDutyReport}
      />
    );
  if (tab === "handbook") return <SyncedHandbook materials={materials} />;
  if (tab === "evaluation")
    return (
      <SyncedEvaluation director={director} plans={plans} reports={reports} />
    );
  return <SyncedAppointment director={director} />;
}
function Overview({ director, onEvent }) {
  return (
    <div className={styles.grid}>
      <SectionCard title="年度履职结构">
        <div className={styles.dutyChart}>
          <div className={styles.bigRing}>
            <strong>{director.days}</strong>
            <span>工作日</span>
          </div>
          <ul>
            <li>
              <i className={styles.navy} />
              会议决策 <b>9 天</b>
            </li>
            <li>
              <i className={styles.blue} />
              调查研究 <b>0.5 天</b>
            </li>
            <li>
              <i className={styles.green} />
              培训活动 <b>4 天</b>
            </li>
            <li>
              <i className={styles.amber} />
              专项工作 <b>2 天</b>
            </li>
          </ul>
        </div>
      </SectionCard>
      <SectionCard title="计划完成情况">
        <div className={styles.planScore}>
          <Progress type="dashboard" percent={director.completion} />
          <p>11 项计划已完成 9 项</p>
          <small>调研计划尚有 1 项未安排，1 项报告待确认</small>
        </div>
      </SectionCard>
      <SectionCard title="最近履职记录" className={styles.span2}>
        {dutyEvents.slice(0, 3).map((item) => (
          <button
            className={styles.event}
            key={item.id}
            onClick={() => onEvent(item)}
          >
            <time>{item.date.slice(5)}</time>
            <div>
              <strong>{item.title}</strong>
              <span>
                {item.type} · {item.evidence}
              </span>
            </div>
            <StatusPill>{item.source}</StatusPill>
            <b>{item.days} 天</b>
          </button>
        ))}
      </SectionCard>
    </div>
  );
}
function Plan() {
  const rows = [
    {
      id: 1,
      type: "参加董事会",
      content: "第四次定期董事会",
      date: "12-14 至 12-18",
      goal: "完成重点议题审议",
      status: "已确认",
    },
    {
      id: 2,
      type: "参加调研",
      content: "调研参股企业经营动态",
      date: "10-15 至 10-31",
      goal: "形成专业建议",
      status: "执行中",
    },
    {
      id: 3,
      type: "参加能力培训",
      content: "一汽股权思享汇",
      date: "四季度",
      goal: "完成 8 期学习",
      status: "执行中",
    },
    {
      id: 4,
      type: "督导子企业工作",
      content: "规范国有参股股权管理专项成果",
      date: "12-14",
      goal: "董事会上报告结果",
      status: "待确认",
    },
  ];
  return (
    <SectionCard
      title="2026 年四季度履职计划"
      extra={<Button type="primary">提交董事确认</Button>}
    >
      <DataTable
        rows={rows}
        columns={[
          { title: "工作类别", dataIndex: "type" },
          { title: "工作内容", dataIndex: "content", width: 280 },
          { title: "计划时间", dataIndex: "date" },
          { title: "预期目标", dataIndex: "goal", width: 240 },
          {
            title: "状态",
            dataIndex: "status",
            render: (value) => <StatusPill>{value}</StatusPill>,
          },
        ]}
      />
    </SectionCard>
  );
}
function Events({ onEvent }) {
  return (
    <SectionCard
      title="履职记录"
      extra={<span>系统同步 2 条 · 人工补充 2 条</span>}
    >
      <DataTable
        rows={dutyEvents}
        onRowClick={onEvent}
        columns={[
          { title: "日期", dataIndex: "date" },
          { title: "类型", dataIndex: "type" },
          { title: "事件名称", dataIndex: "title", width: 330 },
          {
            title: "数据来源",
            dataIndex: "source",
            render: (value) => <StatusPill>{value}</StatusPill>,
          },
          {
            title: "履职天数",
            dataIndex: "days",
            render: (value) => `${value} 天`,
          },
          {
            title: "确认状态",
            dataIndex: "status",
            render: (value) => <StatusPill>{value}</StatusPill>,
          },
        ]}
      />
    </SectionCard>
  );
}
function Suggestions() {
  return (
    <SectionCard title="意见建议落实">
      <DataTable
        rows={suggestions}
        columns={[
          { title: "类型", dataIndex: "type" },
          { title: "意见建议", dataIndex: "content", width: 380 },
          { title: "来源", dataIndex: "source" },
          { title: "责任部门", dataIndex: "owner" },
          { title: "完成期限", dataIndex: "deadline" },
          {
            title: "进度",
            dataIndex: "progress",
            render: (value) => <ProgressCell value={value} />,
          },
          {
            title: "状态",
            dataIndex: "status",
            render: (value) => <StatusPill>{value}</StatusPill>,
          },
        ]}
      />
    </SectionCard>
  );
}
function Reports() {
  return (
    <div className={styles.reportGrid}>
      <SectionCard title="成果报告">
        <div className={styles.report}>
          <b>2026 年第三季度履职写实报告</b>
          <span>自动归集 12 条履职记录、9 条意见建议</span>
          <Progress percent={86} />
          <StatusPill>待董事确认</StatusPill>
        </div>
        <div className={styles.report}>
          <b>参股企业经营情况专题调研报告</b>
          <span>关联调研任务、4 条建议和 3 份附件</span>
          <Progress percent={100} />
          <StatusPill>已归档</StatusPill>
        </div>
      </SectionCard>
      <SectionCard title="完整性检查">
        <ul className={styles.checks}>
          <li>✓ 会议和出席记录已同步</li>
          <li>✓ 履职时间计算完成</li>
          <li>✓ 意见建议均有具体内容</li>
          <li className={styles.warn}>! 1 条培训记录待董事确认</li>
          <li className={styles.warn}>! 1 项专项工作缺少交付成果</li>
        </ul>
        <Button type="primary" block>
          进入报告编辑
        </Button>
      </SectionCard>
    </div>
  );
}
function Placeholder({ tab }) {
  const map = {
    handbook: [
      "履职手册",
      "战略规划、公司简介、业务资料、制度文件已按董事权限汇集。",
    ],
    evaluation: ["评价结果", "展示投入数据、价值成果、事实依据和待改进事项。"],
    appointment: [
      "任职记录",
      "查看推荐函、选举、专委会配置、权限开通和工商变更的历史记录。",
    ],
  };
  return (
    <SectionCard title={map[tab][0]}>
      <div className={styles.placeholder}>
        <h3>{map[tab][0]}</h3>
        <p>{map[tab][1]}</p>
        <Button>查看详细档案</Button>
      </div>
    </SectionCard>
  );
}

function taskEventsFromPlans(plans) {
  return plans
    .filter((item) => item.taskStatus)
    .map((item) => ({
      id: `EVENT-${item.id}`,
      date: item.actualDate || item.date,
      title: item.content,
      type: item.type,
      source: "年度计划任务",
      status: item.taskStatus,
      days: item.taskStatus === "已完成" ? 1 : 0,
      evidence:
        item.evidenceNote ||
        (item.taskStatus === "已完成" ? "负责人已确认完成" : "等待负责人办理"),
      files: item.supplementFiles || [],
    }));
}

function SyncedOverview({ plans, events, onEvent }) {
  const completedCount = plans.filter(
    (item) => item.taskStatus === "已完成",
  ).length;
  const completion = plans.length
    ? Math.round((completedCount / plans.length) * 100)
    : 0;
  const typeCounts = ["会议计划", "培训计划", "调研计划"].map((type) => ({
    type,
    count: plans.filter((item) => item.type === type).length,
  }));
  return (
    <div className={styles.grid}>
      <SectionCard title="年度履职结构">
        <div className={styles.dutyChart}>
          <div className={styles.bigRing}>
            <strong>{completedCount}</strong>
            <span>已完成任务</span>
          </div>
          <ul>
            {typeCounts.map((item, index) => (
              <li key={item.type}>
                <i
                  className={[styles.navy, styles.blue, styles.green][index]}
                />
                {item.type.replace("计划", "任务")} <b>{item.count} 项</b>
              </li>
            ))}
          </ul>
        </div>
      </SectionCard>
      <SectionCard title="计划完成情况">
        <div className={styles.planScore}>
          <Progress type="dashboard" percent={completion} />
          <p>
            {plans.length} 项计划已完成 {completedCount} 项
          </p>
          <small>{plans.length - completedCount} 项负责人任务待确认完成</small>
        </div>
      </SectionCard>
      <SectionCard title="最近履职记录" className={styles.span2}>
        {events.length ? (
          events.slice(0, 3).map((item) => (
            <button
              className={styles.event}
              key={item.id}
              onClick={() => onEvent(item)}
            >
              <time>{item.date?.slice(5) || "—"}</time>
              <div>
                <strong>{item.title}</strong>
                <span>
                  {item.type} · {item.evidence}
                </span>
              </div>
              <StatusPill>{item.source}</StatusPill>
              <b>{item.days} 天</b>
            </button>
          ))
        ) : (
          <p className={styles.emptyHint}>
            负责人确认完成任务后，将在这里形成履职记录。
          </p>
        )}
      </SectionCard>
    </div>
  );
}

function SyncedPlan({ plans }) {
  return (
    <SectionCard title="年度履职计划" extra={<span>与负责人任务实时同步</span>}>
      <DataTable
        rows={plans}
        columns={[
          { title: "计划类型", dataIndex: "type" },
          { title: "工作类别", dataIndex: "workCategory", width: 180 },
          { title: "工作内容", dataIndex: "content", width: 260 },
          { title: "计划时间", dataIndex: "date" },
          { title: "预期目标", dataIndex: "target", width: 240 },
          { title: "负责人", dataIndex: "taskAssignee" },
          {
            title: "任务状态",
            dataIndex: "taskStatus",
            render: (value) => <StatusPill>{value || "未创建"}</StatusPill>,
          },
        ]}
      />
    </SectionCard>
  );
}

function SyncedEvents({ events, onEvent }) {
  return (
    <SectionCard
      title="履职记录"
      extra={<span>负责人任务同步 {events.length} 条</span>}
    >
      <DataTable
        rows={events}
        onRowClick={onEvent}
        columns={[
          { title: "日期", dataIndex: "date" },
          { title: "类型", dataIndex: "type" },
          { title: "事件名称", dataIndex: "title", width: 330 },
          { title: "成果说明", dataIndex: "evidence", width: 280 },
          {
            title: "任务状态",
            dataIndex: "status",
            render: (value) => <StatusPill>{value}</StatusPill>,
          },
        ]}
      />
    </SectionCard>
  );
}

function SyncedSuggestions({ suggestionTasks }) {
  const rows = suggestionTasks;
  return (
    <SectionCard
      title="意见建议落实"
      extra={<span>来源于负责人任务办理结果</span>}
    >
      <DataTable
        rows={rows}
        columns={[
          { title: "类型", dataIndex: "type" },
          { title: "意见建议", dataIndex: "content", width: 380 },
          { title: "来源任务", dataIndex: "source" },
          { title: "责任部门", dataIndex: "owner" },
          { title: "完成期限", dataIndex: "deadline" },
          {
            title: "进度",
            dataIndex: "progress",
            render: (value) => <ProgressCell value={value} />,
          },
          {
            title: "状态",
            dataIndex: "status",
            render: (value) => <StatusPill>{value}</StatusPill>,
          },
          {
            title: "操作",
            render: (_, row) => (
              <Link
                to={`/boardGovernance/duty-tasks?taskType=suggestion&bizId=${row.id}`}
              >
                {row.status === "已完成" ? "查看结果" : "去办理"}
              </Link>
            ),
          },
        ]}
      />
    </SectionCard>
  );
}

function SyncedHandbook({ materials }) {
  return (
    <SectionCard title="履职手册" extra={<span>履职准备阶段资料同步</span>}>
      <DataTable
        rows={materials}
        columns={[
          { title: "资料类别", dataIndex: "category" },
          { title: "资料名称", dataIndex: "material", width: 320 },
          { title: "责任部门", dataIndex: "department" },
          { title: "责任人", dataIndex: "responsiblePerson" },
          {
            title: "状态",
            dataIndex: "status",
            render: (value) => <StatusPill>{value}</StatusPill>,
          },
        ]}
      />
    </SectionCard>
  );
}

function SyncedEvaluation({ director, plans, reports }) {
  const completed = plans.filter((item) => item.taskStatus === "已完成").length;
  const archivedReports = reports.filter(
    (item) => item.status === "已接收",
  ).length;
  const progress = plans.length
    ? Math.round((completed / plans.length) * 100)
    : 0;
  return (
    <div className={styles.grid}>
      <SectionCard title="履职投入依据">
        <div className={styles.placeholder}>
          <h3>{completed} 项任务已完成</h3>
          <p>会议、培训、调研任务及佐证材料已作为评价依据。</p>
        </div>
      </SectionCard>
      <SectionCard title="价值成果依据">
        <div className={styles.placeholder}>
          <h3>{archivedReports} 份报告已接收</h3>
          <p>履职报告和意见建议将进入多角色评价。</p>
        </div>
      </SectionCard>
      <SectionCard
        title={`${director.name} · 评价数据完整度`}
        className={styles.span2}
      >
        <Progress percent={progress} />
      </SectionCard>
    </div>
  );
}

function SyncedAppointment({ director }) {
  return (
    <SectionCard title="任职记录">
      <Descriptions
        bordered
        column={2}
        items={[
          { key: "name", label: "董事姓名", children: director.name },
          { key: "role", label: "董事类型", children: director.role },
          { key: "company", label: "任职企业", children: director.company },
          { key: "term", label: "任期", children: director.term },
          {
            key: "committee",
            label: "专委会任职",
            children: director.committee,
          },
          {
            key: "status",
            label: "任职状态",
            children: <StatusPill>在任</StatusPill>,
          },
        ]}
      />
    </SectionCard>
  );
}
