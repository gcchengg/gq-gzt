import { useMemo, useState } from "react";
import { Button, Descriptions, Input, Select, Steps, Tabs } from "antd";
import { PlusOutlined, SearchOutlined, SyncOutlined } from "@ant-design/icons";
import {
  DataTable,
  GovernanceDrawer,
  PageHeader,
  ProgressCell,
  SectionCard,
  StatusPill,
} from "../../components/PageKit";
import { meetings, meetingStages, plans, topics } from "../../mockData";
import styles from "./index.module.less";

const planTabs = [
  "治理重点任务",
  "年度会议计划",
  "董事履职计划",
  "子企业运行计划",
];
export default function PlanningMeetingView({ mode }) {
  return mode === "planning" ? <Planning /> : <Meetings />;
}
function Filters() {
  return (
    <div className={styles.filters}>
      <Input prefix={<SearchOutlined />} placeholder="搜索名称或负责人" />
      <Select
        defaultValue="all"
        options={[
          { value: "all", label: "全部企业" },
          { value: "gq", label: "一汽股权" },
          { value: "qn", label: "旗新动力" },
        ]}
      />
      <Select
        defaultValue="all"
        options={[
          { value: "all", label: "全部状态" },
          { value: "doing", label: "执行中" },
          { value: "risk", label: "存在风险" },
        ]}
      />
      <Button>重置</Button>
      <Button type="primary">查询</Button>
    </div>
  );
}
function Planning() {
  const [tab, setTab] = useState(planTabs[0]);
  const [selected, setSelected] = useState(null);
  const rows = useMemo(() => plans.filter((x) => x.type === tab), [tab]);
  const columns = [
    { title: "计划名称", dataIndex: "name", width: 300 },
    { title: "所属企业", dataIndex: "company" },
    { title: "负责人", dataIndex: "owner" },
    { title: "当前里程碑", dataIndex: "milestone", width: 190 },
    {
      title: "完成率",
      dataIndex: "progress",
      render: (v) => <ProgressCell value={v} />,
    },
    {
      title: "状态",
      dataIndex: "status",
      render: (v) => <StatusPill>{v}</StatusPill>,
    },
    {
      title: "风险",
      dataIndex: "risk",
      render: (v) => <StatusPill>{v}</StatusPill>,
    },
  ];
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="GOVERNANCE PLANNING"
        title="治理规划"
        subtitle="将治理要求拆解为年度计划、里程碑和责任任务"
        actions={
          <Button type="primary" icon={<PlusOutlined />}>
            新建计划
          </Button>
        }
      />
      <div className={styles.summary}>
        {planTabs.map((x, i) => (
          <button
            key={x}
            className={tab === x ? styles.selected : ""}
            onClick={() => setTab(x)}
          >
            <span>{x}</span>
            <b>{[12, 4, 18, 9][i]}</b>
            <small>{[88, 75, 92, 81][i]}% 已完成</small>
          </button>
        ))}
      </div>
      <SectionCard title={tab} extra={<span>共 {rows.length} 项</span>}>
        <Filters />
        <DataTable columns={columns} rows={rows} onRowClick={setSelected} />
      </SectionCard>
      <GovernanceDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name}
        subtitle={selected?.id}
      >
        <Descriptions
          column={2}
          items={[
            { key: 1, label: "所属企业", children: selected?.company },
            { key: 2, label: "负责人", children: selected?.owner },
            {
              key: 3,
              label: "状态",
              children: <StatusPill>{selected?.status}</StatusPill>,
            },
            { key: 4, label: "完成率", children: `${selected?.progress}%` },
          ]}
        />
        <h3>任务分解与里程碑</h3>
        <div className={styles.timeline}>
          <p>
            <i />
            年度目标确认 <b>已完成</b>
          </p>
          <p>
            <i />
            责任任务分解 <b>已完成</b>
          </p>
          <p>
            <i />
            季度进展点检 <b>进行中</b>
          </p>
          <p>
            <i />
            年度总结评价 <b>未开始</b>
          </p>
        </div>
        <h3>变更记录</h3>
        <p className={styles.muted}>
          09-05 阮迪调整第三季度里程碑完成日期，原因：会议计划调整。
        </p>
      </GovernanceDrawer>
    </div>
  );
}
function Meetings() {
  const [selected, setSelected] = useState(meetings[1]);
  const [tab, setTab] = useState("overview");
  const columns = [
    { title: "议题名称", dataIndex: "name", width: 360 },
    { title: "提报部门", dataIndex: "department", width: 170 },
    { title: "类型", dataIndex: "kind" },
    {
      title: "材料",
      dataIndex: "material",
      render: (v) => <StatusPill>{v}</StatusPill>,
    },
    {
      title: "审核",
      dataIndex: "review",
      render: (v) => <StatusPill>{v}</StatusPill>,
    },
    { title: "董事意见", dataIndex: "opinions", render: (v) => `${v} 条` },
    { title: "表决结果", dataIndex: "decision" },
  ];
  const items = [
    { key: "overview", label: "会议概览" },
    { key: "topics", label: "议题与材料" },
    { key: "communication", label: "会前沟通" },
    { key: "decision", label: "表决与决议" },
    { key: "execution", label: "任务落实" },
    { key: "archive", label: "会议归档" },
  ];
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="MEETING MANAGEMENT"
        title="会议管理"
        subtitle="会议数据来自三会系统，本工作台负责履职归集与闭环跟踪"
        actions={
          <>
            <Button icon={<SyncOutlined />}>同步记录</Button>
            <Button type="primary">进入会议系统</Button>
          </>
        }
      />
      <div className={styles.meetingLayout}>
        <aside className={styles.meetingList}>
          <h3>会议列表</h3>
          {meetings.map((x) => (
            <button
              className={selected.id === x.id ? styles.selectedMeeting : ""}
              key={x.id}
              onClick={() => setSelected(x)}
            >
              <StatusPill>{x.status}</StatusPill>
              <strong>{x.name}</strong>
              <span>
                {x.date} · {x.topics} 项议题
              </span>
              <ProgressCell value={x.readiness} />
            </button>
          ))}
        </aside>
        <section className={styles.meetingWork}>
          <div className={styles.meetingTitle}>
            <div>
              <span>{selected.id}</span>
              <h2>{selected.name}</h2>
              <p>{selected.date} · 现场召开 · 董事会会议室</p>
            </div>
            <StatusPill>{selected.status}</StatusPill>
          </div>
          <Steps
            size="small"
            current={Math.max(0, meetingStages.indexOf(selected.stage))}
            items={meetingStages.map((title) => ({ title }))}
            className={styles.steps}
          />
          <Tabs activeKey={tab} onChange={setTab} items={items} />
          {tab === "overview" ? (
            <MeetingOverview meeting={selected} />
          ) : tab === "topics" ? (
            <SectionCard
              title="议题清单"
              extra={
                <Button type="primary" size="small">
                  发起议题征集
                </Button>
              }
            >
              <DataTable columns={columns} rows={topics} />
            </SectionCard>
          ) : (
            <WorkflowTab tab={tab} />
          )}
        </section>
      </div>
    </div>
  );
}
function MeetingOverview({ meeting }) {
  return (
    <div className={styles.overviewGrid}>
      <SectionCard title="会议准备情况">
        <Descriptions
          column={2}
          items={[
            { key: 1, label: "当前阶段", children: meeting.stage },
            { key: 2, label: "议题数量", children: `${meeting.topics} 项` },
            { key: 3, label: "材料齐备度", children: `${meeting.readiness}%` },
            { key: 4, label: "董事阅读率", children: `${meeting.readRate}%` },
            { key: 5, label: "通知发出时间", children: "2026-09-18 09:00" },
            { key: 6, label: "材料截止时间", children: "2026-09-23 17:00" },
          ]}
        />
      </SectionCard>
      <SectionCard title="关键风险">
        <div className={styles.alert}>
          <b>材料风险</b>
          <span>重大风险评估报告尚未提交最终版</span>
        </div>
        <div className={styles.alert}>
          <b>阅读提醒</b>
          <span>2 位董事尚未阅读更新材料</span>
        </div>
      </SectionCard>
      <SectionCard title="议题准备进度" className={styles.span2}>
        {topics.map((t) => (
          <div className={styles.topicLine} key={t.id}>
            <b>{t.id}</b>
            <span>{t.name}</span>
            <StatusPill>{t.material}</StatusPill>
            <StatusPill>{t.review}</StatusPill>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}
function WorkflowTab({ tab }) {
  const content = {
    communication: ["会前沟通", "董事问题 4 条，已回复 3 条，1 条待董事确认"],
    decision: ["表决与决议", "表决结果由三会系统同步，工作台不可修改权威结果"],
    execution: ["任务落实", "已生成 6 项决议落实任务，其中 1 项临期"],
    archive: [
      "会议归档",
      "通知、材料、出席、表决、纪要、决议、签署文件完整性检查",
    ],
  }[tab];
  return (
    <SectionCard title={content[0]}>
      <div className={styles.empty}>
        <h3>{content[0]}</h3>
        <p>{content[1]}</p>
        <Button type="primary">查看详细台账</Button>
      </div>
    </SectionCard>
  );
}
