import { useState } from "react";
import { Button, Descriptions, Progress, Tabs, Tree } from "antd";
import {
  FileSearchOutlined,
  PlusOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { evaluationItems, resources } from "../../mockData";
import {
  DataTable,
  GovernanceDrawer,
  PageHeader,
  ProgressCell,
  SectionCard,
  StatusPill,
} from "../../components/PageKit";
import styles from "./index.module.less";

export default function EvaluationResourceView({ mode }) {
  return mode === "evaluation" ? <Evaluation /> : <Resources />;
}
const evalColumns = [
  { title: "评价对象", dataIndex: "object", width: 230 },
  { title: "评价类型", dataIndex: "type" },
  { title: "模型版本", dataIndex: "model", width: 260 },
  {
    title: "数据完整度",
    dataIndex: "progress",
    render: (v) => <ProgressCell value={v} />,
  },
  { title: "当前得分", dataIndex: "score", render: (v) => <b>{v}</b> },
  {
    title: "当前阶段",
    dataIndex: "stage",
    render: (v) => <StatusPill>{v}</StatusPill>,
  },
  { title: "证据", dataIndex: "evidence" },
];
function Evaluation() {
  const [selected, setSelected] = useState(evaluationItems[0]);
  const tree = [
    { title: "组织结构规范性 15%", key: "1" },
    { title: "会议运行质量 20%", key: "2" },
    { title: "重大议题审议 20%", key: "3" },
    { title: "决议与授权执行 20%", key: "4" },
    { title: "董事履职保障 15%", key: "5" },
    { title: "治理改进 10%", key: "6" },
  ];
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="EVALUATION & IMPROVEMENT"
        title="评价与应用"
        subtitle="使用全过程事实数据开展董事和企业董事会评价"
        actions={
          <>
            <Button>评价模型</Button>
            <Button type="primary" icon={<PlusOutlined />}>
              发起年度评价
            </Button>
          </>
        }
      />
      <div className={styles.evalGrid}>
        <SectionCard title="评价模型">
          <div className={styles.model}>
            <span>当前发布版本</span>
            <b>2026 董事会建设评价模型 V2</b>
            <small>2026-01-05 发布 · 42 项指标</small>
          </div>
          <Tree treeData={tree} defaultExpandAll />
        </SectionCard>
        <SectionCard
          title="年度评价任务"
          extra={
            <Tabs
              items={[
                { key: "all", label: "全部" },
                { key: "process", label: "过程评价" },
                { key: "annual", label: "年度评价" },
              ]}
            />
          }
        >
          <DataTable
            rows={evaluationItems}
            columns={evalColumns}
            onRowClick={setSelected}
          />
        </SectionCard>
      </div>
      <div className={styles.cycle}>
        <div>
          <b>1</b>
          <strong>过程数据归集</strong>
          <span>会议、履职、监控数据</span>
        </div>
        <i />
        <div>
          <b>2</b>
          <strong>过程评价</strong>
          <span>阶段问题及时纠偏</span>
        </div>
        <i />
        <div>
          <b>3</b>
          <strong>年度评价</strong>
          <span>系统计算与角色评分</span>
        </div>
        <i />
        <div>
          <b>4</b>
          <strong>改进任务</strong>
          <span>进入治理监控闭环</span>
        </div>
      </div>
      <GovernanceDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.object}
        subtitle={selected?.model}
        width={900}
      >
        <Descriptions
          column={2}
          items={[
            { key: 1, label: "评价类型", children: selected?.type },
            {
              key: 2,
              label: "当前阶段",
              children: <StatusPill>{selected?.stage}</StatusPill>,
            },
            { key: 3, label: "数据完整度", children: selected?.evidence },
            { key: 4, label: "综合得分", children: selected?.score },
          ]}
        />
        <h3>指标得分</h3>
        {[
          ["会议运行质量", 95],
          ["重大议题审议", 92],
          ["决议与授权执行", 86],
          ["董事履职保障", 96],
          ["治理改进", 82],
        ].map((x) => (
          <div className={styles.score} key={x[0]}>
            <span>{x[0]}</span>
            <Progress percent={x[1]} />
            <b>{x[1]}</b>
          </div>
        ))}
        <h3>评价应用</h3>
        <div className={styles.improve}>
          <StatusPill>治理改进</StatusPill>
          <b>完善决议执行阶段性点检机制</b>
          <span>已生成 G-04 改进任务并进入治理监控</span>
        </div>
      </GovernanceDrawer>
    </div>
  );
}
const resourceColumns = [
  { title: "资料类别", dataIndex: "category" },
  { title: "资料名称", dataIndex: "name", width: 280 },
  { title: "责任部门 / 责任人", dataIndex: "owner", width: 230 },
  { title: "更新频率", dataIndex: "frequency" },
  { title: "最近更新", dataIndex: "updated" },
  { title: "下次更新", dataIndex: "next" },
  {
    title: "获取方式",
    dataIndex: "source",
    render: (v) => <StatusPill>{v}</StatusPill>,
  },
  { title: "保密等级", dataIndex: "level" },
  {
    title: "状态",
    dataIndex: "status",
    render: (v) => <StatusPill>{v}</StatusPill>,
  },
];
function Resources() {
  const [selected, setSelected] = useState(null);
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="GOVERNANCE RESOURCES"
        title="治理资料"
        subtitle="统一维护履职手册、政策法规、会议档案、履职成果和评价档案"
        actions={
          <>
            <Button icon={<FileSearchOutlined />}>全文检索</Button>
            <Button type="primary" icon={<SyncOutlined />}>
              发起材料更新
            </Button>
          </>
        }
      />
      <div className={styles.resourceTypes}>
        {[
          ["履职手册", 8, "92%"],
          ["政策法规", 36, "本月 +4"],
          ["会议档案", 12, "完整度 96%"],
          ["履职成果", 18, "本季 +6"],
          ["治理案例", 24, "精选 8"],
          ["评价档案", 9, "已归档"],
        ].map((x) => (
          <button key={x[0]}>
            <b>{x[1]}</b>
            <strong>{x[0]}</strong>
            <span>{x[2]}</span>
          </button>
        ))}
      </div>
      <SectionCard
        title="董事履职手册"
        extra={<span>当前版本 V6 · 完整度 92%</span>}
      >
        <div className={styles.handbook}>
          <aside>
            <h4>资料目录</h4>
            {[
              "全部资料",
              "战略规划",
              "公司简介",
              "业务资料",
              "支撑机制",
              "制度文件",
              "其他",
            ].map((x, i) => (
              <button className={i === 0 ? styles.active : ""} key={x}>
                {x}
                <span>{[8, 1, 1, 2, 2, 1, 1][i]}</span>
              </button>
            ))}
          </aside>
          <main>
            <div className={styles.updateAlert}>
              <b>2 项资料需要更新</b>
              <span>
                股权运营核心业务材料待提交，公司基本情况介绍将在 20 天后到期。
              </span>
              <Button size="small">查看更新任务</Button>
            </div>
            <DataTable
              rows={resources}
              columns={resourceColumns}
              onRowClick={setSelected}
            />
          </main>
        </div>
      </SectionCard>
      <GovernanceDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name}
        subtitle={`${selected?.category} · ${selected?.level}`}
        width={880}
      >
        <div className={styles.preview}>
          <section>
            <FileSearchOutlined />
            <h3>文件在线预览</h3>
            <p>当前原型展示文件信息、业务关联与阅读进度。</p>
            <Button type="primary">打开文件</Button>
          </section>
          <aside>
            <Descriptions
              column={1}
              items={[
                { key: 1, label: "当前版本", children: "V6.2" },
                { key: 2, label: "责任人", children: selected?.owner },
                { key: 3, label: "来源方式", children: selected?.source },
                { key: 4, label: "最近更新", children: selected?.updated },
                { key: 5, label: "下次更新", children: selected?.next },
                { key: 6, label: "阅读进度", children: "5 / 7 位董事已阅" },
              ]}
            />
          </aside>
        </div>
        <h3>版本记录</h3>
        <div className={styles.versions}>
          <p>
            <b>V6.2</b>
            <span>2026-09-10　陈哲更新　当前有效版本</span>
            <StatusPill>有效</StatusPill>
          </p>
          <p>
            <b>V6.1</b>
            <span>2026-06-30　季度例行更新</span>
            <StatusPill>历史版本</StatusPill>
          </p>
          <p>
            <b>V6.0</b>
            <span>2026-03-31　履职手册年度发布</span>
            <StatusPill>历史版本</StatusPill>
          </p>
        </div>
      </GovernanceDrawer>
    </div>
  );
}
