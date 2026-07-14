import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import data from "../mock/companies.json";
import styles from "./index.module.less";

const statusColor = {
  已完成: "success",
  维护中: "processing",
  待维护: "default",
};
const report = {
  industry:
    "国内商用车离合器行业规模约135亿元，年增6%-8%；国六升级、老旧货车淘汰支撑传统配套，混动商用车电控离合器增量显著，但纯电重卡长期挤压传统产品。行业加速国产替代，外资把持高端，本土企业比拼规模、客户与售后渠道，技术向轻量化、电控化迭代，原材料波动持续压缩制造端毛利。",
  market:
    "市场分整车配套与售后两大板块，售后毛利率显著高于OEM。铁流双线布局配套+商用车供应链服务，海内外渠道均衡；长春一东依托一汽系主机配套，国内重卡定点资源稳固，外贸出口稳步扩容，但售后业务体量偏小，多元化市场布局弱于铁流。",
  competition:
    "铁流营收为长春一东3倍，盈利规模大幅领先；亚太、长源东谷、万安规模均显著领先，业务多元、抗周期能力更强。长春一东规模效应不足，产品线相对单一。",
  self: "优势：背靠兵器工业、中国一汽两大央企集团，重卡配套壁垒高，离合器及液压翻转机构市场占有率领先。短板：营收与净资产规模偏小，产品线相对集中，售后与海外渠道布局有待加强。",
  conclusion:
    "长春一东客户壁垒突出，重卡配套地位稳固，但规模、多元布局、盈利能力均弱于头部对标企业。建议加强售后市场开拓，丰富AMT、电控离合器等产品线。",
};
const competitionRows = [
  ["长春一东", "7.66", "1,143", "4.77", "16.22%", "6"],
  ["铁流股份", "23.82", "7,748", "17.22", "17.59%", "3"],
  ["亚太股份", "56.07", "49,013", "33.64", "20.83%", "1"],
  ["长源东谷", "22.55", "38,899", "30.12", "27.20%", "4"],
  ["南方精工", "8.54", "34,561", "15.71", "32.33%", "5"],
  ["万安科技", "49.60", "21,348", "30.51", "16.37%", "2"],
].map(([name, revenue, profit, equity, margin, rank]) => ({
  name,
  revenue,
  profit,
  equity,
  margin,
  rank,
}));
const competitionColumns = [
  "name",
  "revenue",
  "profit",
  "equity",
  "margin",
  "rank",
].map((dataIndex, index) => ({
  dataIndex,
  title: [
    "公司",
    "营收(亿)",
    "归母净利(万)",
    "归母净资产(亿)",
    "毛利率",
    "市值/规模排序",
  ][index],
  width: index ? 125 : 110,
}));
export default function CompanyMaintenanceList() {
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({});
  const [drawer, setDrawer] = useState({ open: false, type: "", record: null });
  const rows = useMemo(
    () =>
      data.companyList
        .flatMap((item) => [
          { ...item, id: `${item.id}-annual`, reportPeriod: "2025年度" },
          { ...item, id: `${item.id}-semiannual`, reportPeriod: "2025半年度" },
        ])
        .filter(
          (item) =>
            (!filters.keyword ||
              `${item.name}${item.stockCode}`.includes(filters.keyword)) &&
            (!filters.industry || item.industry === filters.industry) &&
            (!filters.companyType ||
              item.companyType === filters.companyType) &&
            (!filters.status || item.status === filters.status),
        ),
    [filters],
  );
  const columns = [
    { title: "公司名称", dataIndex: "name", minWidth: 220 },
    { title: "公司类型", dataIndex: "companyType", width: 110 },
    {
      title: "股票编码",
      dataIndex: "stockCode",
      width: 130,
      render: (value) => value || "--",
    },
    { title: "所属行业", dataIndex: "industry", width: 140 },
    {
      title: "可比公司数",
      dataIndex: "comparableCount",
      width: 110,
      align: "center",
    },
    { title: "最新报告期", dataIndex: "reportPeriod", width: 120 },
    { title: "最近维护时间", dataIndex: "updated", width: 130 },
    {
      title: "维护状态",
      dataIndex: "status",
      width: 110,
      render: (value) => <Tag color={statusColor[value]}>{value}</Tag>,
    },
    {
      title: "操作",
      key: "action",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() =>
              setDrawer({ open: true, type: "comparables", record })
            }
          >
            可比公司
          </Button>
          <Button
            type="link"
            onClick={() => setDrawer({ open: true, type: "analysis", record })}
          >
            查看详情
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <Card className={styles.formCard}>
          <Form form={form} layout="vertical" onFinish={setFilters}>
            <Row gutter={16}>
              <Col xs={24} md={5}>
                <Form.Item label="公司名称/股票编码" name="keyword">
                  <Input allowClear placeholder="请输入公司名称或股票编码" />
                </Form.Item>
              </Col>
              <Col xs={24} md={5}>
                <Form.Item label="所属行业" name="industry">
                  <Select
                    allowClear
                    options={[
                      { value: "汽车零部件", label: "汽车零部件" },
                      { value: "商用车", label: "商用车" },
                      { value: "综合服务", label: "综合服务" },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={5}>
                <Form.Item label="公司类型" name="companyType">
                  <Select
                    allowClear
                    options={["上市公司", "非上市公司"].map((value) => ({
                      value,
                      label: value,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={5}>
                <Form.Item label="维护状态" name="status">
                  <Select
                    allowClear
                    options={["待维护", "维护中", "已完成"].map((value) => ({
                      value,
                      label: value,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={4} className={styles.actions}>
                <Space>
                  <Button
                    onClick={() => {
                      form.resetFields();
                      setFilters({});
                    }}
                  >
                    重置
                  </Button>
                  <Button type="primary" htmlType="submit">
                    查询
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </Card>
        <Card className={styles.tableCard}>
          <div className={styles.tableTop}>
            <strong>公司维护列表</strong>
            <span>共 {rows.length} 条</span>
          </div>
          <Table
            tableLayout="auto"
            rowKey="id"
            columns={columns}
            dataSource={rows}
            scroll={{ x: "max-content", y: 470 }}
            pagination={{ pageSize: 10, showSizeChanger: false }}
          />
        </Card>
        <Drawer
          width="min(880px, 92vw)"
          title={
            drawer.type === "comparables"
              ? `${drawer.record?.name || ""} · ${drawer.record?.reportPeriod || ""} · 可比公司`
              : `${drawer.record?.name || ""} · ${drawer.record?.reportPeriod || ""} · AI分析详情`
          }
          open={drawer.open}
          onClose={() => setDrawer({ open: false, type: "", record: null })}
        >
          {drawer.type === "comparables" ? (
            <ComparableDrawer record={drawer.record} />
          ) : drawer.type === "analysis" ? (
            <AnalysisDrawer />
          ) : null}
        </Drawer>
      </div>
    </div>
  );
}

function ComparableDrawer({ record }) {
  const reportPeriod = record?.reportPeriod || "2025年度";
  const isSemiannual = reportPeriod.includes("半年度");
  const fileGroups = [
    {
      type: isSemiannual ? "半年度定期报告" : "年度定期报告",
      period: reportPeriod,
      names: isSemiannual
        ? ["2025半年度报告.pdf", "2025半年度财务数据.xlsx"]
        : ["2025年度报告.pdf", "2025年度财务数据.xlsx"],
    },
    { type: "公开信息", period: reportPeriod, names: ["公司公开信息汇编.pdf"] },
  ];
  return (
    <div className={styles.drawerContent}>
      <div className={styles.drawerTip}>
        每家可比公司可维护多个文件类型，同一类型也可以包含多个文件。以下内容仅供查看，不属于任务执行页面。
      </div>
      {data.comparables.map((item) => (
        <Card
          size="small"
          className={styles.comparableCard}
          key={item.id}
          title={item.name}
          extra={<Tag color="blue">{item.stockCode || "非上市公司"}</Tag>}
        >
          {fileGroups.map((group) => (
            <div className={styles.fileGroup} key={group.type}>
              <div className={styles.fileMeta}>
                <span>文件类型</span>
                <strong>{group.type}</strong>
                <span>报告期</span>
                <strong>{group.period}</strong>
              </div>
              {group.names.map((name) => (
                <div className={styles.fileItem} key={name}>
                  <span>
                    {item.name}-{name}
                  </span>
                  <Tag color="success">已上传</Tag>
                </div>
              ))}
            </div>
          ))}
        </Card>
      ))}
    </div>
  );
}

function AnalysisDrawer() {
  return (
    <div className={styles.drawerContent}>
      <div className={styles.drawerTip}>已确认的AI分析报告，仅供查看。</div>
      <ReportSection title="看行业" text={report.industry} />
      <ReportSection title="看市场" text={report.market} />
      <section className={styles.reportSection}>
        <h3>看竞争</h3>
        <Table
          size="small"
          rowKey="name"
          pagination={false}
          columns={competitionColumns}
          dataSource={competitionRows}
          scroll={{ x: 720 }}
        />
        <p>{report.competition}</p>
      </section>
      <ReportSection title="看自己" text={report.self} />
      <ReportSection title="整体结论" text={report.conclusion} />
    </div>
  );
}
function ReportSection({ title, text }) {
  return (
    <section className={styles.reportSection}>
      <h3>{title}</h3>
      <p>{text}</p>
    </section>
  );
}
