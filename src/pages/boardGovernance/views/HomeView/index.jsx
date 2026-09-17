import { Button, Segmented } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  RightOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import {
  MetricCard,
  PageHeader,
  ProgressCell,
  SectionCard,
  StatusPill,
} from "../../components/PageKit";
import { handbookDepartments } from "../../handbookData";
import { meetings, metrics, schedules } from "../../mockData";
import styles from "./index.module.less";

const readiness = meetings.slice(0, 2);
export default function HomeView({ role, onRoleChange, handbookMaterials }) {
  const isDirector = role === "director";
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="BOARD GOVERNANCE"
        title={isDirector ? "董事履职工作台" : "董事会工作台首页"}
        subtitle={
          isDirector
            ? "张铁斌董事 · 一汽股权 · 2026 年度"
            : "上午好，阮迪 · 集中处理治理任务并跟踪履职资料提交进度"
        }
        actions={
          <Segmented
            value={role}
            onChange={onRoleChange}
            options={[
              { label: "公司董办", value: "office" },
              { label: "董事视角", value: "director" },
            ]}
          />
        }
      />
      <div className={styles.metrics}>
        {metrics.map((item) => (
          <MetricCard key={item.label} item={item} />
        ))}
      </div>
      {isDirector ? (
        <DirectorHome />
      ) : (
        <OfficeHome handbookMaterials={handbookMaterials} />
      )}
    </div>
  );
}

function OfficeHome({ handbookMaterials }) {
  const materialTasks = handbookDepartments.map((department) => {
    const departmentMaterials = handbookMaterials.filter(
      (item) => item.department === department,
    );
    const submittedCount = departmentMaterials.filter(
      (item) => item.status !== "待提交",
    ).length;
    return {
      department,
      materials: departmentMaterials,
      submittedCount,
      complete: submittedCount === departmentMaterials.length,
    };
  });
  const pendingCount = materialTasks.filter((item) => !item.complete).length;
  return (
    <>
      <div className={styles.twoCol}>
        <SectionCard
          title="我的任务"
          extra={
            <span className={styles.taskSummary}>
              待办 <b>{pendingCount}</b>　已办{" "}
              <b>{materialTasks.length - pendingCount}</b>
            </span>
          }
        >
          <div className={styles.taskList}>
            {materialTasks.map((item) => (
              <div className={styles.task} key={item.department}>
                <span
                  className={`${styles.taskIcon} ${item.complete ? styles.success : styles.warning}`}
                >
                  <FileTextOutlined />
                </span>
                <div>
                  <strong>更新董事履职手册资料</strong>
                  <p>
                    {item.department} · 共 {item.materials.length} 项，已提交{" "}
                    {item.submittedCount} 项
                  </p>
                </div>
                <div className={styles.taskEnd}>
                  <StatusPill>{item.complete ? "已提交" : "待提交"}</StatusPill>
                  <Link
                    to={`/boardGovernance/material-task?department=${encodeURIComponent(item.department)}`}
                  >
                    <Button
                      type={item.complete ? "link" : "primary"}
                      size="small"
                    >
                      {item.complete ? "查看详情" : "去执行"} <RightOutlined />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard
          title="近期日程"
          extra={<Button type="link">日历视图</Button>}
        >
          <div className={styles.schedule}>
            {schedules.map((item) => (
              <div key={item.date + item.title}>
                <b>{item.date}</b>
                <i />
                <section>
                  <strong>{item.title}</strong>
                  <span>
                    {item.time} · {item.location}
                  </span>
                </section>
                <StatusPill>{item.type}</StatusPill>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
      <div className={styles.threeCol}>
        <SectionCard
          title="会议筹备"
          extra={<span className={styles.helper}>未来 90 天</span>}
        >
          {readiness.map((m) => (
            <div className={styles.readiness} key={m.id}>
              <div>
                <strong>{m.name}</strong>
                <span>
                  {m.date} · {m.stage}
                </span>
              </div>
              <ProgressCell value={m.readiness} />
            </div>
          ))}
          <div className={styles.notice}>
            <WarningOutlined /> 第三次定期董事会有 1 份材料待补充
          </div>
        </SectionCard>
        <SectionCard title="董事履职完整性">
          <div className={styles.ringRow}>
            <div className={styles.ring}>
              <strong>92%</strong>
              <span>计划达成</span>
            </div>
            <ul>
              <li>
                <b>18</b>
                <span>待确认记录</span>
              </li>
              <li>
                <b>2</b>
                <span>报告待补充</span>
              </li>
              <li>
                <b>1</b>
                <span>履职缺口</span>
              </li>
            </ul>
          </div>
        </SectionCard>
        <SectionCard title="治理运行风险">
          <div className={styles.risks}>
            <p>
              <b className={styles.red}>2</b>
              <span>已逾期事项</span>
            </p>
            <p>
              <b className={styles.orange}>3</b>
              <span>临期事项</span>
            </p>
            <p>
              <b className={styles.blue}>1</b>
              <span>席位空缺</span>
            </p>
          </div>
          <Button block>进入治理监控</Button>
        </SectionCard>
      </div>
      <div className={styles.twoCol}>
        <SectionCard title="子企业治理偏差">
          <div className={styles.deviation}>
            <span>旗新动力科技</span>
            <strong>2 项偏差</strong>
            <small>会议计划未完成、整改任务临期</small>
          </div>
          <div className={styles.deviation}>
            <span>一汽能源科技</span>
            <strong>1 项偏差</strong>
            <small>董事席位空缺 47 天</small>
          </div>
        </SectionCard>
        <SectionCard title="履职手册更新">
          <div className={styles.resource}>
            <FileTextOutlined />
            <div>
              <strong>股权运营核心业务材料</strong>
              <span>责任部门：股权运营部 · 09-30 到期</span>
            </div>
            <StatusPill>待提交</StatusPill>
          </div>
          <div className={styles.resource}>
            <FileTextOutlined />
            <div>
              <strong>公司基本情况介绍</strong>
              <span>责任人：阮迪 · 20 天后更新</span>
            </div>
            <StatusPill>临期更新</StatusPill>
          </div>
        </SectionCard>
      </div>
    </>
  );
}

function DirectorHome() {
  return (
    <div className={styles.directorGrid}>
      <SectionCard title="下一场会议">
        <div className={styles.nextMeeting}>
          <CalendarOutlined />
          <span>还有 13 天</span>
          <h3>2026 年第三次定期董事会</h3>
          <p>09 月 28 日 09:00 · 现场召开</p>
          <div>
            <Button type="primary">阅读会议材料</Button>
            <Button>查看议题</Button>
          </div>
        </div>
      </SectionCard>
      <SectionCard title="待我处理">
        <div className={styles.quick}>
          <button>
            <FileTextOutlined />
            <b>6</b>
            <span>待阅材料</span>
          </button>
          <button>
            <CheckCircleOutlined />
            <b>3</b>
            <span>履职确认</span>
          </button>
          <button>
            <ClockCircleOutlined />
            <b>2</b>
            <span>建议反馈</span>
          </button>
        </div>
      </SectionCard>
      <SectionCard title="本季度履职计划">
        <div className={styles.planSummary}>
          <strong>8 / 11</strong>
          <span>已完成事项</span>
          <ProgressCell value={73} />
          <p>会议 2 · 调研 1 · 培训 3 · 专项交流 2</p>
        </div>
      </SectionCard>
      <SectionCard title="年度履职投入">
        <div className={styles.days}>
          <strong>15.5</strong>
          <span>累计履职天数</span>
          <p>会议 9 天　调研 0.5 天　培训 4 天　活动 2 天</p>
        </div>
      </SectionCard>
      <SectionCard title="近期日程" className={styles.wide}>
        {schedules.map((x) => (
          <div className={styles.directorSchedule} key={x.title}>
            <b>{x.date}</b>
            <span>{x.title}</span>
            <small>
              {x.time} · {x.location}
            </small>
          </div>
        ))}
      </SectionCard>
      <SectionCard title="意见建议落实" className={styles.wide}>
        <div className={styles.suggestion}>
          <StatusPill>办理中</StatusPill>
          <strong>明确研发中心技术路线与资本投向</strong>
          <span>投资部反馈进度 65%，预计 10 月 20 日完成</span>
        </div>
        <div className={styles.suggestion}>
          <StatusPill>待确认</StatusPill>
          <strong>优化内部控制数字化管控边界</strong>
          <span>审计风控与法务部已提交落实结果</span>
        </div>
      </SectionCard>
    </div>
  );
}
