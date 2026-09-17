import { useState } from "react";
import { Button, Descriptions, Progress, Tabs, Tree } from "antd";
import { DownloadOutlined, PlusOutlined } from "@ant-design/icons";
import { companies, monitoringItems } from "../../mockData";
import {
  DataTable,
  GovernanceDrawer,
  PageHeader,
  ProgressCell,
  SectionCard,
  StatusPill,
} from "../../components/PageKit";
import styles from "./index.module.less";

export default function CompanyMonitoringView({ mode }) {
  return mode === "companies" ? <Companies /> : <Monitoring />;
}
const companyColumns = [
  { title: "企业名称", dataIndex: "name", width: 220 },
  { title: "产权层级", dataIndex: "level" },
  { title: "席位实设 / 核定", dataIndex: "seats" },
  { title: "外部董事", dataIndex: "external", render: (v) => `${v} 人` },
  {
    title: "空缺席位",
    dataIndex: "vacancy",
    render: (v) => <StatusPill>{v ? `${v} 席空缺` : "无空缺"}</StatusPill>,
  },
  { title: "会议执行", dataIndex: "meetings" },
  {
    title: "决议闭环率",
    dataIndex: "closure",
    render: (v) => <ProgressCell value={v} />,
  },
  { title: "评价得分", dataIndex: "score" },
  {
    title: "治理状态",
    dataIndex: "risk",
    render: (v) => <StatusPill>{v}</StatusPill>,
  },
];
function Companies() {
  const [selected, setSelected] = useState(companies[1]);
  const tree = [
    {
      title: "一汽股权",
      key: "root",
      children: [
        { title: "一汽能源科技", key: "energy" },
        { title: "旗新动力科技", key: "power" },
        { title: "红旗私募基金", key: "fund" },
      ],
    },
  ];
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="SUBSIDIARY GOVERNANCE"
        title="子企业治理"
        subtitle="穿透查看董事会结构、成员配置、会议运行与治理偏差"
        actions={
          <Button type="primary" icon={<PlusOutlined />}>
            下发运行标准
          </Button>
        }
      />
      <div className={styles.kpis}>
        <Kpi n="4" t="纳入管控企业" />
        <Kpi n="1" t="董事席位空缺" warning />
        <Kpi n="82%" t="会议计划执行率" />
        <Kpi n="3" t="治理偏差" danger />
      </div>
      <div className={styles.layout}>
        <SectionCard title="组织范围">
          <Tree defaultExpandAll selectedKeys={["energy"]} treeData={tree} />
          <div className={styles.legend}>
            <p>
              <i className={styles.ok} />
              治理运行正常
            </p>
            <p>
              <i className={styles.warn} />
              存在治理偏差
            </p>
          </div>
        </SectionCard>
        <SectionCard title="企业治理台账" extra={<span>共 4 家企业</span>}>
          <DataTable
            rows={companies}
            columns={companyColumns}
            onRowClick={setSelected}
          />
        </SectionCard>
      </div>
      <GovernanceDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name}
        subtitle="企业治理档案"
        width={900}
      >
        <Tabs
          items={[
            {
              key: "base",
              label: "基本信息",
              children: <CompanyDetail company={selected} />,
            },
            { key: "board", label: "董事会结构", children: <BoardStructure /> },
            { key: "members", label: "董事成员", children: <MemberList /> },
            {
              key: "committee",
              label: "专委会",
              children: (
                <p>战略委员会、审计与风险委员会、提名委员会设置情况。</p>
              ),
            },
            {
              key: "operation",
              label: "会议运行",
              children: <p>年度会议计划、召开情况、必审议题和档案完整性。</p>,
            },
            {
              key: "duty",
              label: "董事履职",
              children: <p>董事履职计划、记录、报告和评价汇总。</p>,
            },
            { key: "supervision", label: "运行督导", children: <Deviation /> },
          ]}
        />
      </GovernanceDrawer>
    </div>
  );
}
function Kpi({ n, t, warning, danger }) {
  return (
    <div
      className={`${styles.kpi} ${warning ? styles.warning : ""} ${danger ? styles.danger : ""}`}
    >
      <b>{n}</b>
      <span>{t}</span>
    </div>
  );
}
function CompanyDetail({ company }) {
  return (
    <>
      <Descriptions
        column={2}
        items={[
          { key: 1, label: "企业类别", children: company?.level },
          { key: 2, label: "董事会席位", children: company?.seats },
          { key: 3, label: "外部董事", children: `${company?.external} 人` },
          { key: 4, label: "年度会议", children: company?.meetings },
          { key: 5, label: "决议闭环率", children: `${company?.closure}%` },
          { key: 6, label: "治理评价", children: `${company?.score} 分` },
        ]}
      />
      <Deviation />
    </>
  );
}
function BoardStructure() {
  return (
    <div className={styles.seats}>
      <div>
        <b>7</b>
        <span>核定席位</span>
      </div>
      <div>
        <b>6</b>
        <span>实际席位</span>
      </div>
      <div>
        <b>2</b>
        <span>内部董事</span>
      </div>
      <div>
        <b>3</b>
        <span>外部董事</span>
      </div>
      <div>
        <b>1</b>
        <span>职工董事</span>
      </div>
      <div className={styles.emptySeat}>
        <b>1</b>
        <span>空缺席位</span>
      </div>
    </div>
  );
}
function MemberList() {
  return (
    <DataTable
      rowKey="name"
      rows={[
        {
          name: "张铁斌",
          type: "外部董事召集人",
          term: "2026-01 至 2028-12",
          committee: "战略委员会主任委员",
          status: "在任",
        },
        {
          name: "李晨光",
          type: "专职外部董事",
          term: "2025-06 至 2028-05",
          committee: "审计与风险委员会委员",
          status: "在任",
        },
        {
          name: "待选聘",
          type: "外部董事",
          term: "-",
          committee: "-",
          status: "席位空缺",
        },
      ]}
      columns={[
        { title: "姓名", dataIndex: "name" },
        { title: "董事类型", dataIndex: "type" },
        { title: "任期", dataIndex: "term" },
        { title: "专委会职务", dataIndex: "committee" },
        {
          title: "状态",
          dataIndex: "status",
          render: (v) => <StatusPill>{v}</StatusPill>,
        },
      ]}
    />
  );
}
function Deviation() {
  return (
    <div className={styles.deviations}>
      <h3>运行督导</h3>
      <div>
        <StatusPill>席位空缺</StatusPill>
        <b>外部董事席位空缺 47 天</b>
        <span>责任部门：人力资源部 · 要求 11 月 1 日前完成选聘</span>
        <Button size="small">查看整改</Button>
      </div>
      <div>
        <StatusPill>临期</StatusPill>
        <b>三季度决议执行报告待提交</b>
        <span>责任部门：子企业董办 · 剩余 3 天</span>
        <Button size="small">催办</Button>
      </div>
    </div>
  );
}
const monitoringColumns = [
  {
    title: "类型",
    dataIndex: "type",
    render: (v) => <StatusPill>{v}</StatusPill>,
  },
  { title: "监控事项", dataIndex: "title", width: 320 },
  { title: "所属企业", dataIndex: "company" },
  { title: "责任部门 / 责任人", dataIndex: "owner", width: 220 },
  { title: "完成期限", dataIndex: "deadline" },
  {
    title: "进展",
    dataIndex: "progress",
    render: (v) => <ProgressCell value={v} />,
  },
  {
    title: "业务阶段",
    dataIndex: "stage",
    render: (v) => <StatusPill>{v}</StatusPill>,
  },
  {
    title: "风险",
    dataIndex: "risk",
    render: (v) => <StatusPill>{v}</StatusPill>,
  },
];
function Monitoring() {
  const [category, setCategory] = useState("全部");
  const [selected, setSelected] = useState(null);
  const categories = [
    "全部",
    "决议执行",
    "授权执行",
    "董事建议落实",
    "治理改进",
  ];
  const rows =
    category === "全部"
      ? monitoringItems
      : monitoringItems.filter((x) => x.type === category);
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="GOVERNANCE MONITORING"
        title="治理监控"
        subtitle="集中监控决议、授权、董事建议和治理改进的执行闭环"
        actions={
          <>
            <Button icon={<DownloadOutlined />}>生成监控报告</Button>
            <Button type="primary" icon={<PlusOutlined />}>
              新增监控事项
            </Button>
          </>
        }
      />
      <div className={styles.kpis}>
        <Kpi n="12" t="正常推进" />
        <Kpi n="3" t="临期" warning />
        <Kpi n="2" t="已逾期" danger />
        <Kpi n="4" t="待审批" />
      </div>
      <SectionCard
        title="监控事项台账"
        extra={
          <Tabs
            activeKey={category}
            onChange={setCategory}
            items={categories.map((key) => ({ key, label: key }))}
          />
        }
      >
        <DataTable
          rows={rows}
          columns={monitoringColumns}
          onRowClick={setSelected}
        />
      </SectionCard>
      <div className={styles.reports}>
        {[
          "董事会决议执行情况报告",
          "董事会授权执行情况报告",
          "董事建议落实情况报告",
          "治理改进落实情况报告",
        ].map((x) => (
          <button key={x}>
            <DownloadOutlined />
            <span>{x}</span>
            <small>数据实时汇总，可穿透查看</small>
          </button>
        ))}
      </div>
      <GovernanceDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title}
        subtitle={`${selected?.type} · ${selected?.id}`}
      >
        <Descriptions
          column={2}
          items={[
            { key: 1, label: "所属企业", children: selected?.company },
            { key: 2, label: "责任人", children: selected?.owner },
            { key: 3, label: "完成期限", children: selected?.deadline },
            {
              key: 4,
              label: "风险",
              children: <StatusPill>{selected?.risk}</StatusPill>,
            },
          ]}
        />
        <h3>办理进展</h3>
        <Progress percent={selected?.progress} />
        <div className={styles.flow}>
          {[
            "任务下发",
            "责任人接收",
            "进展填报",
            "归口确认",
            "领导审批",
            "董办确认",
            "事项办结",
          ].map((x, i) => (
            <p key={x} className={i < 3 ? styles.done : ""}>
              <i />
              <b>{x}</b>
              <span>{i < 3 ? "已完成" : "待处理"}</span>
            </p>
          ))}
        </div>
        <h3>完成证据</h3>
        <p>
          完成情况、实际完成日期、交付成果和佐证材料将在办结前进行完整性检查。
        </p>
      </GovernanceDrawer>
    </div>
  );
}
