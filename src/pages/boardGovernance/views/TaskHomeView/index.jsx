import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StatusPill } from "../../components/PageKit";
import { handbookDepartments } from "../../handbookData";
import styles from "./index.module.less";

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

function Topbar() {
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
          onClick={() => navigate("/boardGovernance/directors")}
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
  handbookMaterials,
  dutyPlans,
  generatedDirectorNames,
  suggestionTasks,
}) {
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
  const [activeCategory, setActiveCategory] = useState("material");
  const [activeDepartment, setActiveDepartment] = useState("");
  const materialPendingCount = taskGroups.filter(
    (item) => !item.complete,
  ).length;
  const confirmationPendingCount = dutyPlans.filter(
    (item) => item.status !== "已完成",
  ).length;
  const generatedPlans = dutyPlans.filter((item) =>
    generatedDirectorNames.includes(item.directorName),
  );
  const generatedTaskCount = generatedPlans.filter(
    (item) => item.taskStatus !== "已完成",
  ).length;
  const suggestionPendingCount = suggestionTasks.filter(
    (item) => item.status !== "已完成",
  ).length;
  const taskCategories = useMemo(
    () => [
      {
        key: "material",
        label: "董事履职手册资料",
        groups: taskGroups.map((item) => ({
          department: item.department,
          records: item.materials,
          completed: item.submitted,
          pending: item.materials.length - item.submitted,
        })),
      },
      {
        key: "suggestion",
        label: "意见建议落实任务",
        groups: buildDepartmentGroups(
          suggestionTasks,
          (item) => item.status === "已完成",
        ),
      },
      {
        key: "duty",
        label: "已创建履职任务",
        groups: buildDepartmentGroups(
          generatedPlans,
          (item) => item.taskStatus === "已完成",
        ),
      },
      {
        key: "confirmation",
        label: "年度履职计划确认",
        groups: buildDepartmentGroups(
          dutyPlans,
          (item) => item.status === "已完成",
        ),
      },
    ],
    [dutyPlans, generatedPlans, suggestionTasks, taskGroups],
  );
  const currentCategory =
    taskCategories.find((item) => item.key === activeCategory) ||
    taskCategories[0];
  const currentGroup =
    currentCategory.groups.find(
      (item) => item.department === activeDepartment,
    ) ||
    currentCategory.groups.find((item) => item.pending > 0) ||
    currentCategory.groups[0];
  const pendingCount =
    materialPendingCount +
    confirmationPendingCount +
    generatedTaskCount +
    suggestionPendingCount;
  const completedCount =
    taskGroups.length -
    materialPendingCount +
    dutyPlans.filter((item) => item.status === "已完成").length +
    generatedPlans.filter((item) => item.taskStatus === "已完成").length +
    suggestionTasks.filter((item) => item.status === "已完成").length;
  const taskHref = currentGroup
    ? `/boardGovernance/duty-tasks?taskType=material&department=${encodeURIComponent(currentGroup.department)}`
    : "/boardGovernance/duty-tasks?taskType=material";

  return (
    <div className={styles.page}>
      <Topbar />
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
          {taskCategories.map((category) => {
            const pending = category.groups.reduce(
              (total, item) => total + item.pending,
              0,
            );
            return (
              <button
                className={
                  currentCategory.key === category.key
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
              <small>{item.pending ? `待办 ${item.pending}` : "已完成"}</small>
            </button>
          ))}
        </section>
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
            {activeCategory === "material" ? (
              <button type="button">＋　手动创建</button>
            ) : null}
            {activeCategory === "duty" ? (
              <Link to="/boardGovernance/duty-tasks">进入负责人任务管理</Link>
            ) : null}
            {activeCategory === "suggestion" ? (
              <Link to="/boardGovernance/duty-tasks?taskType=suggestion">
                进入意见建议任务管理
              </Link>
            ) : null}
          </header>
          {activeCategory === "material" && currentGroup ? (
            <article className={styles.taskRow}>
              <div>
                <h3>2026年度董事履职手册资料更新</h3>
                <p>
                  任务下达时间：2026-09-15 09:00:00　　截止时间：2026-09-30
                  17:00:00　　发送人：公司董办　　计划耗时：8.00小时　　描述：
                  {currentGroup.department}提交{currentGroup.records.length}
                  项履职手册资料
                </p>
              </div>
              <aside>
                <Link to={taskHref}>
                  {currentGroup.pending ? "去执行" : "重新提交"}
                </Link>
                <i />
                <Link to={taskHref}>查看详情</Link>
              </aside>
            </article>
          ) : null}
          {activeCategory === "confirmation"
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
                      　　状态：{plan.status}
                    </p>
                  </div>
                  <aside>
                    <StatusPill>{plan.status}</StatusPill>
                    <Link
                      to={`/boardGovernance/duty-tasks?taskType=confirmation&planId=${plan.id}`}
                    >
                      编辑
                    </Link>
                  </aside>
                </article>
              ))
            : null}
          {activeCategory === "duty"
            ? currentGroup?.records.map((plan) => (
                <article className={styles.taskRow} key={`duty-${plan.id}`}>
                  <div>
                    <h3>{plan.content}履职任务</h3>
                    <p>
                      董事：{plan.directorName}　　任务类型：{plan.type}
                      　　执行部门：{plan.owner}
                      　　计划时间：{plan.date}　　预期成果：{plan.target}
                    </p>
                  </div>
                  <aside>
                    <StatusPill>{plan.taskStatus}</StatusPill>
                    <Link to={`/boardGovernance/duty-tasks?bizId=${plan.id}`}>
                      {plan.taskStatus === "已完成" ? "查看/修改" : "去执行"}
                    </Link>
                  </aside>
                </article>
              ))
            : null}
          {activeCategory === "suggestion"
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
                      {task.status === "已完成" ? "查看结果" : "去办理"}
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
