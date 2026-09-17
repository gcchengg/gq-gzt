import { useState } from "react";
import { Avatar, Badge, Button, Progress } from "antd";
import {
  BellOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  FileTextOutlined,
  HomeOutlined,
  LeftOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { schedules } from "../../mockData";
import styles from "./index.module.less";

const tabs = [
  { key: "首页", icon: HomeOutlined },
  { key: "日程", icon: CalendarOutlined },
  { key: "材料", icon: FileTextOutlined },
  { key: "待办", icon: CheckSquareOutlined },
  { key: "我的", icon: UserOutlined },
];
export default function MobileDirectorView() {
  const [tab, setTab] = useState("首页");
  return (
    <div className={styles.stage}>
      <div className={styles.phone}>
        <header>
          <Button type="text" icon={<LeftOutlined />} />
          <strong>董事会工作台</strong>
          <Badge count={3}>
            <Button type="text" icon={<BellOutlined />} />
          </Badge>
        </header>
        <main>
          {tab === "首页" ? (
            <Home />
          ) : tab === "日程" ? (
            <Schedule />
          ) : tab === "材料" ? (
            <Materials />
          ) : tab === "待办" ? (
            <Tasks />
          ) : (
            <Profile />
          )}
        </main>
        <nav>
          {tabs.map(({ key, icon: Icon }) => (
            <button
              key={key}
              className={tab === key ? styles.active : ""}
              onClick={() => setTab(key)}
            >
              <Icon />
              <span>{key}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
function Home() {
  return (
    <>
      <section className={styles.welcome}>
        <div>
          <small>下午好</small>
          <h2>张铁斌董事</h2>
          <p>一汽股权 · 外部董事召集人</p>
        </div>
        <Avatar size={48}>张</Avatar>
      </section>
      <section className={styles.next}>
        <span>下一场会议 · 还有 13 天</span>
        <h3>2026 年第三次定期董事会</h3>
        <p>09 月 28 日 09:00 · 现场召开</p>
        <Progress percent={62} size="small" />
        <small>会议材料已阅读 5 / 8 份</small>
        <Button type="primary" block>
          继续阅读材料
        </Button>
      </section>
      <h3 className={styles.heading}>待我处理</h3>
      <div className={styles.quick}>
        <button>
          <b>6</b>
          <span>待阅材料</span>
        </button>
        <button>
          <b>3</b>
          <span>履职确认</span>
        </button>
        <button>
          <b>2</b>
          <span>建议反馈</span>
        </button>
      </div>
      <h3 className={styles.heading}>近期日程</h3>
      {schedules.slice(0, 2).map((x) => (
        <article className={styles.row} key={x.title}>
          <time>{x.date}</time>
          <div>
            <b>{x.title}</b>
            <span>
              {x.time} · {x.location}
            </span>
          </div>
        </article>
      ))}
    </>
  );
}
function Schedule() {
  return (
    <>
      <h2>日程</h2>
      <div className={styles.calendar}>
        <b>2026 年 9 月</b>
        <div>
          {["一", "二", "三", "四", "五", "六", "日"].map((x) => (
            <span key={x}>{x}</span>
          ))}
          {Array.from({ length: 30 }, (_, i) => (
            <i
              className={
                [18, 22, 26, 28].includes(i + 1) ? styles.hasEvent : ""
              }
              key={i}
            >
              {i + 1}
            </i>
          ))}
        </div>
      </div>
      {schedules.map((x) => (
        <article className={styles.row} key={x.title}>
          <time>{x.date}</time>
          <div>
            <b>{x.title}</b>
            <span>
              {x.type} · {x.location}
            </span>
          </div>
        </article>
      ))}
    </>
  );
}
function Materials() {
  return (
    <>
      <h2>会议材料</h2>
      {[
        "2026 年经营情况及 2027 年经营预算方案",
        "董事会决议执行情况报告",
        "2027 年重大风险评估报告",
      ].map((x, i) => (
        <article className={styles.material} key={x}>
          <FileTextOutlined />
          <div>
            <b>{x}</b>
            <span>
              {i === 0 ? "已读 68%" : i === 1 ? "已读" : "新版本待阅"}
            </span>
            <Progress
              percent={i === 0 ? 68 : i === 1 ? 100 : 0}
              showInfo={false}
            />
          </div>
        </article>
      ))}
    </>
  );
}
function Tasks() {
  return (
    <>
      <h2>待办</h2>
      {[
        "确认四季度履职计划",
        "确认培训履职记录",
        "反馈内部控制建议落实结果",
      ].map((x, i) => (
        <article className={styles.task} key={x}>
          <CheckSquareOutlined />
          <div>
            <b>{x}</b>
            <span>{i === 0 ? "今天 17:00 截止" : "来自董事履职"}</span>
          </div>
          <Button size="small" type={i === 0 ? "primary" : "default"}>
            处理
          </Button>
        </article>
      ))}
    </>
  );
}
function Profile() {
  return (
    <>
      <section className={styles.profile}>
        <Avatar size={70}>张</Avatar>
        <h2>张铁斌</h2>
        <p>外部董事召集人</p>
      </section>
      <div className={styles.profileStats}>
        <p>
          <b>15.5</b>
          <span>年度履职天数</span>
        </p>
        <p>
          <b>92%</b>
          <span>计划达成率</span>
        </p>
      </div>
      {[
        "我的履职档案",
        "我的意见建议",
        "成果报告",
        "履职手册",
        "设置与帮助",
      ].map((x) => (
        <button className={styles.menu} key={x}>
          {x}
          <span>›</span>
        </button>
      ))}
    </>
  );
}
