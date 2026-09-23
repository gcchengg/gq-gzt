import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Tooltip } from "antd";
import { StatusPill } from "../../components/PageKit";
import { handbookDepartments } from "../../handbookData";
import styles from "./index.module.less";

const appointmentTaskMeta = {
  待上传董事简历: {
    owner: "综合管理部-人力资源/许红昇",
    description: "董事简历",
  },
  待配置系统权限并纳入组织架构: {
    owner: "综合管理部-体系数字化/尚书新",
    description: "系统权限配置",
  },
  待完成工商变更: {
    owner: "审计风控与法务部/曹星宇",
    description: "工商变更",
  },
};

const dutyTaskTooltip =
  "a.年度履职计划中所有的各项任务，点击去执行，填报该任务的具体开展时间、地点、材料等信息，点击确认后，通知董事本人、综合董办、综合办公室完成差旅、日程等安排，本任务不关闭\nb.针对已经提交了实际开展的日期等信息的任务，进行完成情况确认。";

function BrandMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 16.7C10.6 14.7 15.3 8.3 20.2 2.7C18.6 10.6 14.6 16 7.2 19.2C9.6 19.3 12.1 18.7 14.5 17.6C11.5 20.8 7.8 22.1 3.6 21.3C5.3 19.9 6.4 18.5 7 17C5.8 17.2 4.8 17.1 4 16.7Z"
        fill="#fff"
      />
      <path
        d="M7 17C10.6 14.4 13.5 11 16.2 7.3"
        stroke="#fff"
        strokeLinecap="round"
        strokeWidth="1.3"
      />
    </svg>
  );
}

function Rays() {
  return (
    <svg className={styles.rays} viewBox="0 0 220 150" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M0 0 180 118M23 0 180 118M46 0 180 118M70 0 180 118M94 0 180 118M118 0 180 118M142 0 180 118M166 0 180 118M190 0 180 118" />
        <path d="M0 20 180 118M0 42 180 118M0 64 180 118M0 86 180 118M0 108 180 118" />
      </g>
    </svg>
  );
}

function Topbar({ role }) {
  const navigate = useNavigate();
  return (
    <header className={styles.topbar}>
      <div className={styles.brand}>
        <span className={styles.brandMark}>
          <BrandMark />
        </span>
        <strong>一汽云工作台</strong>
      </div>
      <nav className={styles.nav} aria-label="工作台导航">
        <button className={styles.active} type="button">
          <span className={styles.homeIcon}>◆</span>首页
        </button>
        <button
          type="button"
          onClick={() =>
            navigate(
              role === "director"
                ? "/boardGovernance/management"
                : role === "adminDepartment"
                  ? "/boardGovernance/appointment"
                  : "/boardGovernance/home",
            )
          }
        >
          <span className={styles.appIcon}>▦</span>应用
        </button>
        <button type="button">
          <span>♥</span>收藏
        </button>
      </nav>
      <div className={styles.tools}>
        <button type="button">⌁</button>
        <button type="button" className={styles.bell}>
          ♢<b>4</b>
        </button>
        <button type="button">▦</button>
        <span className={styles.avatar}>阮</span>
        <i>•••</i>
      </div>
    </header>
  );
}

function MetricCard({ label, value, tone }) {
  return (
    <article className={`${styles.metricCard} ${styles[tone] || ""}`}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <aside>
        <Rays />
        <i />
        <b />
      </aside>
    </article>
  );
}

function buildDepartmentGroups(items, isComplete) {
  const groups = new Map();
  items.forEach((item) => {
    const department = item.owner || item.department || "未分配部门";
    const records = groups.get(department) || [];
    records.push(item);
    groups.set(department, records);
  });
  return [...groups.entries()].map(([department, records]) => {
    const completed = records.filter(isComplete).length;
    return {
      department,
      records,
      completed,
      pending: records.length - completed,
    };
  });
}

export default function TaskHomeView({
  role,
  appointmentCases = [],
  handbookMaterials,
  dutyPlans,
  annualPlanConfirmationTasks = [],
  generatedDirectorNames,
  suggestionTasks,
}) {
  const location = useLocation();
  const appointmentTasks = useMemo(
    () =>
      ["待上传董事简历", "待配置系统权限并纳入组织架构", "待完成工商变更"]
        .map((status) =>
          appointmentCases.find((item) => item.status === status),
        )
        .filter(Boolean),
    [appointmentCases],
  );
  const visibleAppointmentTasks = useMemo(() => {
    if (role === "auditLegalDepartment") {
      return appointmentTasks.filter(
        (item) => item.status === "待完成工商变更",
      );
    }
    if (role === "adminDepartment") {
      return appointmentTasks.filter(
        (item) => item.status !== "待完成工商变更",
      );
    }
    return appointmentTasks;
  }, [appointmentTasks, role]);
  const taskGroups = useMemo(
    () =>
      handbookDepartments.map((department) => {
        const materials = handbookMaterials.filter(
          (item) => item.department === department,
        );
        const submitted = materials.filter(
          (item) => item.status !== "待提交",
        ).length;
        return {
          department,
          materials,
          submitted,
          complete: submitted === materials.length,
        };
      }),
    [handbookMaterials],
  );
  const [activeCategory, setActiveCategory] = useState(
    role === "groupOffice" ? "special-task" : "appointment",
  );
  const [activeDepartment, setActiveDepartment] = useState("");
  useEffect(() => {
    const taskSelection = location.state?.taskSelection;
    if (!taskSelection) return;
    setActiveCategory(taskSelection.category);
    setActiveDepartment(taskSelection.department);
  }, [location.state]);
  const confirmationPlans = dutyPlans.filter((item) =>
    ["待确认", "已完成"].includes(item.status),
  );
  const generatedPlans = ["会议计划", "培训计划", "调研计划"]
    .map((type) =>
      dutyPlans.find((item) => item.type === type && item.taskStatus),
    )
    .filter(Boolean);
  const directorPlanCreationTasks = annualPlanConfirmationTasks.filter(
    (item) => item.directorName === "刘欣然",
  );
  const taskCategories = useMemo(
    () => [
      {
        key: "appointment",
        label: "董事聘任",
        groups: [
          {
            department: "董事聘任",
            records: visibleAppointmentTasks,
            completed: 0,
            pending: visibleAppointmentTasks.length,
          },
        ],
      },
      {
        key: "special-task",
        label: "下发董事专项任务",
        groups: [
          {
            department: "董事专项任务",
            records: [
              {
                id: "SPECIAL-LETTER",
                title: "下发董事推荐函",
                description: "向拟任董事发起推荐函下发与聘任流程",
                status: "待办理",
                deadline: "2026-09-30",
                href: "/boardGovernance/appointment",
              },
              {
                id: "SPECIAL-EVALUATION",
                title: "发起评价",
                description: "发起董事年度履职评价专项任务",
                status: "待办理",
                deadline: "2026-10-15",
                href: "/boardGovernance/director-special-tasks",
              },
            ],
            completed: 0,
            pending: 2,
          },
        ],
      },
      {
        key: "material",
        label: "履职准备",
        groups: [
          {
            department: "董事履职手册",
            records: taskGroups,
            completed: taskGroups.filter((item) => item.complete).length,
            pending: taskGroups.filter((item) => !item.complete).length,
          },
        ],
      },
      {
        key: "plan-creation",
        label: "履职计划制定",
        groups: [
          {
            department: "履职计划制定",
            records: directorPlanCreationTasks,
            completed:
              role === "director"
                ? directorPlanCreationTasks.filter(
                    (item) => item.status === "已完成",
                  ).length
                : 0,
            pending:
              role === "director"
                ? directorPlanCreationTasks.filter(
                    (item) => item.status !== "已完成",
                  ).length
                : 2,
          },
        ],
      },
      // {
      //   key: "suggestion",
      //   label: "意见建议落实任务",
      //   groups: buildDepartmentGroups(
      //     suggestionTasks,
      //     (item) => item.status === "已完成",
      //   ),
      // },
      {
        key: "duty",
        label: "履职任务管理",
        groups: [
          {
            department: "已确认履职计划任务",
            records: generatedPlans,
            completed: generatedPlans.filter(
              (item) => item.taskStatus === "已完成",
            ).length,
            pending: generatedPlans.filter(
              (item) => item.taskStatus !== "已完成",
            ).length,
          },
        ],
      },
      {
        key: "annual-plan-confirmation",
        label: "年度履职计划确认/调整",
        groups: buildDepartmentGroups(
          annualPlanConfirmationTasks,
          (item) => item.status === "已完成",
        ),
      },
      {
        key: "confirmation",
        label: "履职报告完善",
        groups: [
          {
            department: "履职报告完善",
            records: confirmationPlans,
            completed: confirmationPlans.filter(
              (item) => item.status === "已完成",
            ).length,
            pending: confirmationPlans.filter(
              (item) => item.status !== "已完成",
            ).length,
          },
        ],
      },
      {
        key: "duty-evaluation",
        label: "履职评价",
        groups: [
          {
            department: "履职评价",
            records: [],
            completed: 0,
            pending: 0,
          },
        ],
      },
    ],
    [
      visibleAppointmentTasks,
      annualPlanConfirmationTasks,
      confirmationPlans,
      generatedPlans,
      directorPlanCreationTasks,
      role,
      suggestionTasks,
      taskGroups,
    ],
  );
  const visibleTaskCategories = taskCategories.filter(({ key }) => {
    if (role === "director") return key === "plan-creation";
    if (role === "auditLegalDepartment") return key === "appointment";
    if (role === "groupOffice") return key === "special-task";
    if (role !== "groupOffice" && key === "special-task") return false;
    return key !== "annual-plan-confirmation";
  });
  const currentCategory =
    visibleTaskCategories.find((item) => item.key === activeCategory) ||
    visibleTaskCategories[0];
  const selectedCategoryKey = currentCategory.key;
  const currentGroup =
    currentCategory.groups.find(
      (item) => item.department === activeDepartment,
    ) ||
    currentCategory.groups.find((item) => item.pending > 0) ||
    currentCategory.groups[0];
  const pendingCount = visibleTaskCategories.reduce(
    (total, category) =>
      total +
      category.groups.reduce(
        (groupTotal, group) => groupTotal + group.pending,
        0,
      ),
    0,
  );
  const completedCount = visibleTaskCategories.reduce(
    (total, category) =>
      total +
      category.groups.reduce(
        (groupTotal, group) => groupTotal + group.completed,
        0,
      ),
    0,
  );
  return (
    <div className={styles.page}>
      <Topbar role={role} />
      <main className={styles.stage}>
        <section className={styles.metrics} aria-label="统计概览">
          <MetricCard label="总待办数" value={pendingCount} tone="blue" />
          <MetricCard label="总逾期数" value="0" tone="red" />
          <MetricCard label="总完成数" value={completedCount} tone="teal" />
        </section>
        <section className={styles.detailHead}>
          <div className={styles.detailLeft}>
            <h1>任务详情</h1>
            <div className={styles.segmented}>
              <span>任务视图</span>
              <span>工作流视图</span>
            </div>
            <button className={styles.company} type="button">
              一汽股权投资（天津）有限公司　⌄
            </button>
          </div>
          <div className={styles.detailActions}>
            <span>统计时间：</span>
            <button className={styles.dateRange} type="button">
              开始日期　→　结束日期　▣
            </button>
            <button type="button">导出</button>
            <button type="button">导出记录</button>
            <button className={styles.primary} type="button">
              ＋手动创建
            </button>
          </div>
        </section>
        <section className={styles.categoryStrip} aria-label="任务大类">
          {visibleTaskCategories.map((category) => {
            const pending = category.groups.reduce(
              (total, item) => total + item.pending,
              0,
            );
            return (
              <button
                className={
                  selectedCategoryKey === category.key
                    ? styles.activeCategory
                    : ""
                }
                type="button"
                key={category.key}
                onClick={() => {
                  setActiveCategory(category.key);
                  setActiveDepartment("");
                }}
              >
                <span>{category.label}</span>
                <small>{pending ? `待办 ${pending}` : "全部完成"}</small>
              </button>
            );
          })}
        </section>
        {selectedCategoryKey !== "duty" &&
        selectedCategoryKey !== "confirmation" ? (
          <section className={styles.tabStrip} aria-label="责任部门">
            {currentCategory.groups.map((item) => (
              <button
                className={
                  currentGroup?.department === item.department
                    ? styles.activeTab
                    : ""
                }
                type="button"
                key={item.department}
                onClick={() => setActiveDepartment(item.department)}
              >
                <span>{item.department}</span>
                <small>
                  {item.pending ? `待办 ${item.pending}` : "已完成"}
                </small>
              </button>
            ))}
          </section>
        ) : null}
        <section className={`${styles.listPanel} ${styles.planTaskPanel}`}>
          <header>
            <div>
              <h2>{currentCategory.label}</h2>
              <span className={styles.chip}>
                待办 <b>{currentGroup?.pending || 0}</b>
              </span>
              <span className={styles.completedLabel}>
                已完成　{currentGroup?.completed || 0}
              </span>
            </div>
            {selectedCategoryKey === "material" ? (
              <button type="button">＋　手动创建</button>
            ) : null}
            {selectedCategoryKey === "suggestion" ? (
              <Link to="/boardGovernance/duty-tasks?taskType=suggestion">
                进入意见建议任务管理
              </Link>
            ) : null}
          </header>
          {selectedCategoryKey === "material" &&
          currentGroup?.department === "董事履职手册" ? (
            <>
              {currentGroup.records.map((group) => {
                const taskHref = `/boardGovernance/duty-tasks?taskType=material&department=${encodeURIComponent(group.department)}`;
                return (
                  <article className={styles.taskRow} key={group.department}>
                    <div>
                      <h3>2026年度董事履职手册资料更新</h3>
                      <p>
                        任务下达时间：2026-09-15
                        09:00:00　　截止时间：2026-09-30
                        17:00:00　　发送人：公司董办　　责任部门：
                        {group.department}　　描述：提交
                        {group.materials.length} 项履职手册资料
                      </p>
                    </div>
                    <aside>
                      <StatusPill>
                        {group.complete ? "已完成" : "待办理"}
                      </StatusPill>
                      <Link to={taskHref}>去执行</Link>
                      <i />
                      <Link to={taskHref}>查看详情</Link>
                    </aside>
                  </article>
                );
              })}
              <article className={styles.taskRow}>
                <div>
                  <h3>履职手册确认</h3>
                  <p>
                    董事：李晨光　　任职企业：一汽股权　　履职年度：2026年
                    　　描述：确认董事履职手册目录及资料内容
                  </p>
                </div>
                <aside>
                  <StatusPill>待确认</StatusPill>
                  <Link to="/boardGovernance/preparation/directors/D-02?tab=handbook">
                    去执行
                  </Link>
                </aside>
              </article>
            </>
          ) : null}
          {role !== "director" && selectedCategoryKey === "plan-creation" ? (
            <>
              <article className={styles.taskRow}>
                <div>
                  <h3>
                    2026年度-李晨光-履职计划制定
                    <Tooltip title="各部门责任人的履职计划制定任务、点击去执行后分别填报董事本年度的各类事项（会议、活动、培训、调研、其他等的计划）若相关部门/领域无计划内容，支持不提报，点击提交任务关闭。全部提交完毕后，形成整体的年度履职计划，自动触发“年度履职计划确认”任务，董事点击去执行，勾选确认后，形成最终的年度履职计划，自动触发“履职任务管理中”的对应任务">
                      <span className={styles.taskHint}>!</span>
                    </Tooltip>
                  </h3>
                  <p>任务描述：2026年度-李晨光-履职计划制定</p>
                </div>
                <aside>
                  <StatusPill>待制定</StatusPill>
                  <Link to="/boardGovernance/preparation/directors/D-02?tab=annual-plan&planMode=planning">
                    去执行
                  </Link>
                </aside>
              </article>
              <article className={styles.taskRow}>
                <div>
                  <h3>2026-李晨光-履职计划确认</h3>
                  <p>任务描述：年度履职计划确认</p>
                </div>
                <aside>
                  <StatusPill>待确认</StatusPill>
                  <Link to="/boardGovernance/preparation/directors/D-02?tab=annual-plan&planMode=confirmation">
                    去执行
                  </Link>
                </aside>
              </article>
            </>
          ) : null}
          {role === "director" && selectedCategoryKey === "plan-creation"
            ? currentGroup?.records.map((task) => (
                <article className={styles.taskRow} key={task.id}>
                  <div>
                    <h3>{task.title}</h3>
                    <p>任务描述：年度计划确认</p>
                  </div>
                  <aside>
                    <StatusPill>{task.status}</StatusPill>
                    <Link
                      to={`/boardGovernance/duty-tasks?taskType=annual-plan-confirmation&bizId=${task.id}`}
                    >
                      去执行
                    </Link>
                  </aside>
                </article>
              ))
            : null}
          {selectedCategoryKey === "appointment"
            ? currentGroup?.records.map((item) => {
                const taskMeta = appointmentTaskMeta[item.status] || {
                  owner: item.owner,
                  description: item.status,
                };
                return (
                  <article className={styles.taskRow} key={item.id}>
                    <div>
                      <h3>{item.director}董事聘任任务</h3>
                      <p>
                        任职企业：{item.company}
                        　　负责人：{taskMeta.owner}　　 　　描述：
                        {taskMeta.description}
                      </p>
                    </div>
                    <aside>
                      <StatusPill>{item.status}</StatusPill>
                      <Link to={`/boardGovernance/appointment/${item.id}`}>
                        去执行
                      </Link>
                    </aside>
                  </article>
                );
              })
            : null}
          {selectedCategoryKey === "special-task"
            ? currentGroup?.records.map((item) => (
                <article className={styles.taskRow} key={item.id}>
                  <div>
                    <h3>{item.title}</h3>
                    <p>
                      截止时间：{item.deadline}　　发送人：集团董办　　描述：
                      {item.description}
                    </p>
                  </div>
                  <aside>
                    <StatusPill>{item.status}</StatusPill>
                    <Link to={item.href}>去执行</Link>
                  </aside>
                </article>
              ))
            : null}
          {selectedCategoryKey === "confirmation"
            ? currentGroup?.records.map((plan) => (
                <article className={styles.taskRow} key={plan.id}>
                  <div>
                    <h3>
                      {plan.dutyYear}
                      {plan.dutyQuarter} · {plan.content}
                    </h3>
                    <p>
                      确认责任人：{plan.confirmOwner}　　任职企业：
                      {plan.servingCompany}　　工作类别：{plan.workCategory}
                      　　状态：{plan.status}　　任务描述：完善年度履职报告
                    </p>
                  </div>
                  <aside>
                    <StatusPill>{plan.status}</StatusPill>
                    <Link
                      to={`/boardGovernance/duty-tasks?taskType=confirmation&planId=${plan.id}`}
                    >
                      去执行
                    </Link>
                  </aside>
                </article>
              ))
            : null}
          {selectedCategoryKey === "annual-plan-confirmation"
            ? currentGroup?.records.map((task) => (
                <article className={styles.taskRow} key={task.id}>
                  <div>
                    <h3>{task.title}</h3>
                    <p>
                      董事：{task.directorName}　　任职企业：{task.company}
                      　　履职年度：{task.year}
                      　　描述：确认/调整年度履职计划报告
                    </p>
                  </div>
                  <aside>
                    <StatusPill>{task.status}</StatusPill>
                    <Link
                      to={`/boardGovernance/duty-tasks?taskType=annual-plan-confirmation&bizId=${task.id}`}
                    >
                      {task.status === "已完成" ? "去执行" : "去执行"}
                    </Link>
                  </aside>
                </article>
              ))
            : null}
          {selectedCategoryKey === "duty"
            ? currentGroup?.records.map((plan) => (
                <article className={styles.taskRow} key={`duty-${plan.id}`}>
                  <div>
                    <h3>
                      {plan.type} · {plan.content}
                      <Tooltip title={dutyTaskTooltip}>
                        <span className={styles.taskHint}>!</span>
                      </Tooltip>
                    </h3>
                    <p>
                      董事：{plan.directorName}　　任务类型：{plan.type}
                      　　执行部门：{plan.owner}
                      　　计划时间：{plan.date}　　预期成果：{plan.target}
                      <span className={styles.taskDescription}>
                        任务描述：确认实际开展信息并组织开展
                      </span>
                    </p>
                  </div>
                  <aside>
                    <StatusPill>{plan.taskStatus}</StatusPill>
                    <Link to={`/boardGovernance/duty-tasks?bizId=${plan.id}`}>
                      去执行
                    </Link>
                  </aside>
                </article>
              ))
            : null}
          {selectedCategoryKey === "suggestion"
            ? currentGroup?.records.map((task) => (
                <article className={styles.taskRow} key={task.id}>
                  <div>
                    <h3>{task.content}</h3>
                    <p>
                      来源：{task.source}　　责任部门：{task.owner}　　负责人：
                      {task.assignee}　　完成期限：{task.deadline}
                    </p>
                  </div>
                  <aside>
                    <StatusPill>{task.status}</StatusPill>
                    <Link
                      to={`/boardGovernance/duty-tasks?taskType=suggestion&bizId=${task.id}`}
                    >
                      {task.status === "已完成" ? "去执行" : "去办理"}
                    </Link>
                  </aside>
                </article>
              ))
            : null}
        </section>
      </main>
    </div>
  );
}
