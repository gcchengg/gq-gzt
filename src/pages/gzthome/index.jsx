import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./index.css";
const taskTabs = [
    "议题反馈建议",
    "表决建议单",
    "基金股权转让",
    "基金回购",
    "基金股票交易",
    "基金退出诉讼",
];
const metrics = [
    { label: "总待办数", value: "4450" },
    { label: "总逾期数", value: "0", tone: "red" },
    { label: "总完成数", value: "6712", tone: "teal" },
];
const taskCopyByCard = {
    议题反馈建议: {
        title: "议题反馈建议",
        description: "手动创建议题反馈建议",
        href: "/topicAdvice",
    },
    表决建议单: {
        title: "表决建议单",
        description: "批注表决建议单",
        href: "/AdviceReview",
    },
    基金股权转让: {
        title: "基金股权转让",
        description: "对应股权转让环节名称",
        href: "3-非上市：股权转让.html",
    },
    基金回购: {
        title: "基金回购",
        description: "对应回购环节名称",
        href: "4-非上市：回购.html",
    },
    基金股票交易: {
        title: "基金股票交易",
        description: "股票交易指令",
        href: "2-上市：股票交易.html",
    },
    基金退出诉讼: {
        title: "基金退出诉讼",
        description: "基金退出诉讼",
        href: "#",
    },
};
const secondaryTaskCopyByCard = {
    表决建议单: {
        title: "表决建议单",
        description: "非上市退出决策",
    },
    基金股票交易: {
        title: "基金股票交易",
        description: "维护交易结果",
    },
};
function BrandMark() {
    return (<svg viewBox="0 0 24 24">
      <path d="M4 16.7C10.6 14.7 15.3 8.3 20.2 2.7C18.6 10.6 14.6 16 7.2 19.2C9.6 19.3 12.1 18.7 14.5 17.6C11.5 20.8 7.8 22.1 3.6 21.3C5.3 19.9 6.4 18.5 7 17C5.8 17.2 4.8 17.1 4 16.7Z" fill="#ffffff"/>
      <path d="M7 17C10.6 14.4 13.5 11 16.2 7.3" stroke="#ffffff" strokeLinecap="round" strokeWidth="1.3"/>
    </svg>);
}
function Rays() {
    return (<svg className="rays" viewBox="0 0 220 150">
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M0 0 180 118M23 0 180 118M46 0 180 118M70 0 180 118M94 0 180 118M118 0 180 118M142 0 180 118M166 0 180 118M190 0 180 118"/>
        <path d="M0 20 180 118M0 42 180 118M0 64 180 118M0 86 180 118M0 108 180 118"/>
      </g>
    </svg>);
}
function Avatar() {
    return (<svg viewBox="0 0 110 110" role="img" aria-label="用户头像">
      <rect width="110" height="110" fill="#565656"/>
      <path d="M18 110V92.5C18 78.4 29.4 67 43.5 67h23C80.6 67 92 78.4 92 92.5V110H18z" fill="#9f908e"/>
      <path d="M39 72.5c3.2 6.4 9 9.9 16 9.9s12.8-3.5 16-9.9V91c-3.9 2.7-9.2 4.3-16 4.3S42.9 93.7 39 91V72.5z" fill="#ffffff"/>
      <path d="M25.5 53.5c0 4 2.4 7.2 5.5 7.2 1.2 0 2.1-.4 2.8-1.3C37.6 72.1 45.1 80 55 80s17.4-7.9 21.2-20.6c.7.9 1.6 1.3 2.8 1.3 3.1 0 5.5-3.2 5.5-7.2s-2.4-7.2-5.5-7.2h-.7C77.6 30.8 69 18.5 55 18.5S32.4 30.8 31.7 46.3H31c-3.1 0-5.5 3.2-5.5 7.2z" fill="#fbf5ea"/>
      <path d="M27.5 45.4C29.9 24.2 41.6 7 62 7c8 0 14.2 3.3 18.2 9.1 10.3 2.9 15.8 13.3 13.8 27.1-1.3 8.9-4.4 13.5-8.8 17 0-6.3-2-13.1-5.9-18.2-10.9 1.2-19.8-.6-26.1-6.2-6.4 8.6-16.3 10.8-25.7 9.6z" fill="#9f908e"/>
    </svg>);
}
function Topbar() {
    const navigate = useNavigate();
    return (<header className="topbar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <BrandMark />
        </div>
        <div className="brand-name">一汽云工作台</div>
      </div>

      <nav className="nav">
        <div className="nav-item active">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 11.2 12 3l9 8.2v8.4c0 .7-.5 1.2-1.2 1.2h-5.1v-6h-5.4v6H4.2c-.7 0-1.2-.5-1.2-1.2v-8.4z"/>
          </svg>
          <span>首页</span>
        </div>
        <button className="nav-item" type="button" onClick={() => navigate("/assign")}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>
          </svg>
          <span>应用</span>
        </button>
        <div className="nav-item">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 21s7-5.2 7-11.2A7 7 0 1 0 5 9.8C5 15.8 12 21 12 21zm0-8a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2z"/>
          </svg>
          <span>收藏</span>
        </div>
      </nav>

      <div className="tools" aria-hidden="true">
        <div className="tool">
          <svg viewBox="0 0 24 24">
            <path d="m14.7 6.3 3-3 3 3-3 3"/>
            <path d="M17.2 3.6 8 12.8"/>
            <path d="M7 12.4 3.5 16l4.5 4.5 3.6-3.5"/>
          </svg>
        </div>
        <div className="tool">
          <span className="badge">64</span>
          <svg viewBox="0 0 24 24">
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/>
            <path d="M10 21h4"/>
          </svg>
        </div>
        <div className="tool">
          <svg viewBox="0 0 24 24">
            <path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6z"/>
            <path d="M12 8v8M8 12h8"/>
          </svg>
        </div>
        <div className="tool">
          <svg viewBox="0 0 24 24">
            <path d="M16 4c-.8 1.7-2 2.5-4 2.5S8.8 5.7 8 4L3.5 6.3 6 11v8.5h12V11l2.5-4.7L16 4z"/>
          </svg>
        </div>
        <div className="avatar" aria-hidden="true">
          <Avatar />
        </div>
        <div className="kebab">
          <i />
          <i />
          <i />
        </div>
      </div>
    </header>);
}
function MetricCards() {
    return (<section className="metrics" aria-label="统计概览">
      {metrics.map((metric) => (<article className={["metric-card", metric.tone].filter(Boolean).join(" ")} key={metric.label}>
          <div className="metric-text">
            <div className="metric-label">{metric.label}</div>
            <div className="metric-value">{metric.value}</div>
          </div>
          <div className="metric-visual" aria-hidden="true">
            <Rays />
            <div className="device">
              <div className="device-base"/>
              <div className="device-coin"/>
            </div>
          </div>
        </article>))}
    </section>);
}
function DetailHeader() {
    return (<section className="detail-head" aria-label="任务详情筛选">
      <div className="detail-left">
        <h1 className="page-title">任务详情</h1>
        <div className="segmented" role="tablist" aria-label="视图切换">
          <span role="tab" aria-selected="true">
            任务视图
          </span>
          <span role="tab" aria-selected="false">
            工作流视图
          </span>
        </div>
        <div className="company">
          <span>一汽股权投资（天津）有限公司</span>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 6l4 4 4-4"/>
          </svg>
        </div>
      </div>
      <div className="detail-actions">
        <span className="stat-label">统计时间：</span>
        <div className="date-range">
          <span>开始日期</span>
          <span className="arrow">→</span>
          <span>结束日期</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 3v4M17 3v4M4 9h16M5 5h14v15H5z"/>
          </svg>
        </div>
        <button className="btn" type="button">
          导出
        </button>
        <button className="btn" type="button">
          导出记录
        </button>
        <button className="btn primary" type="button">
          ＋手动创建
        </button>
      </div>
    </section>);
}
function TaskMeta({ description, onDescriptionClick, }) {
    return (<span className="task-meta">
      任务下达时间： 2026-03-31 15:46:03&nbsp;&nbsp; 逾期时间： 2026-04-01
      15:46:03&nbsp;&nbsp; 发送人： System&nbsp;&nbsp; 计划耗时：
      40.00小时&nbsp;&nbsp; 执行时间： -&nbsp;&nbsp;{" "}
      <button className="description-trigger" type="button" onClick={(event) => onDescriptionClick(event, `描述：${description}`)}>
        描述： {description}
      </button>
    </span>);
}
function TaskRow({ task, secondary, onDescriptionClick, }) {
    const actionNode = task.href?.startsWith("/") ? (<Link className="action-link" to={task.href}>
      去执行
    </Link>) : (<a className="action-link" href={task.href ?? "#"}>
      去执行
    </a>);
    return (<article className={["task-row", secondary ? "secondary" : ""].join(" ")}>
      <div>
        <h2 className="task-row-title">{task.title}</h2>
        <TaskMeta description={task.description} onDescriptionClick={onDescriptionClick}/>
      </div>
      <div className="row-actions">
        {actionNode}
        <span className="sep"/>
        <button className="action-link" type="button">
          查看详情
        </button>
      </div>
    </article>);
}
function TaskPanel() {
    const [activeTab, setActiveTab] = useState("议题反馈建议");
    const [popover, setPopover] = useState({
        text: "",
        left: 24,
        top: 24,
        visible: false,
    });
    const primaryTask = taskCopyByCard[activeTab];
    const secondaryTask = secondaryTaskCopyByCard[activeTab];
    const showSecondary = Boolean(secondaryTask);
    const rowsClassName = useMemo(() => ["rows", showSecondary ? "show-secondary" : ""].join(" "), [showSecondary]);
    const panelClassName = useMemo(() => ["list-panel", showSecondary ? "show-secondary" : ""].join(" "), [showSecondary]);
    useEffect(() => {
        const hidePopover = () => {
            setPopover((current) => ({ ...current, visible: false }));
        };
        const handleKeydown = (event) => {
            if (event.key === "Escape") {
                hidePopover();
            }
        };
        document.addEventListener("click", hidePopover);
        document.addEventListener("keydown", handleKeydown);
        return () => {
            document.removeEventListener("click", hidePopover);
            document.removeEventListener("keydown", handleKeydown);
        };
    }, []);
    const openDescription = (event, text) => {
        event.stopPropagation();
        const rect = event.currentTarget.getBoundingClientRect();
        const popoverWidth = 430;
        const left = Math.min(rect.left, window.innerWidth - popoverWidth - 24);
        setPopover({
            text,
            left: Math.max(24, left),
            top: rect.bottom + 10,
            visible: true,
        });
    };
    return (<>
      <section className="tab-strip" aria-label="任务卡片">
        {taskTabs.map((tab) => (<button className={["task-card", activeTab === tab ? "active" : ""].join(" ")} type="button" aria-pressed={activeTab === tab} key={tab} onClick={() => {
                setActiveTab(tab);
                setPopover((current) => ({ ...current, visible: false }));
            }}>
            {tab}
          </button>))}
      </section>

      <section className={panelClassName} aria-label="基金退出列表">
        <div className="list-title-row">
          <div className="list-title-left">
            <div className="list-title">基金退出</div>
            <div className="summary">
              <span className="chip">
                待办 <b>946</b>
              </span>
              <span className="overdue">逾期&nbsp;&nbsp;0</span>
            </div>
          </div>
          <button className="manual-link" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <span>手动创建</span>
          </button>
        </div>

        <div className={rowsClassName}>
          <TaskRow task={primaryTask} onDescriptionClick={openDescription}/>
          {secondaryTask ? (<TaskRow task={{ ...secondaryTask, href: "2-非上市：退出决策.html" }} secondary onDescriptionClick={openDescription}/>) : null}
        </div>
      </section>

      <div className={["description-popover", popover.visible ? "show" : ""].join(" ")} role="status" style={{ left: popover.left, top: popover.top }} onClick={(event) => event.stopPropagation()}>
        {popover.text}
      </div>
    </>);
}
export default function GztHome() {
    return (<div className="page">
      <Topbar />
      <main className="stage">
        <MetricCards />
        <DetailHeader />
        <TaskPanel />
      </main>
    </div>);
}
