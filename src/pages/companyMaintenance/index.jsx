import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  DeleteOutlined,
  PlusOutlined,
  RobotOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Popconfirm,
  Select,
  Spin,
  Table,
  Tag,
  Upload,
} from "antd";
import data from "./mock/companies.json";
import styles from "./index.module.less";

const fileTypes = [
  "年度定期报告",
  "半年度定期报告",
  "季度定期报告",
  "年度业绩公告",
  "半年度业绩公告",
  "招股说明书",
  "招股书",
  "万得金融终端",
  "投资时尽调报告",
  "公开信息",
].map((value) => ({ label: value, value }));
const competitors = [
  {
    key: "长春一东",
    revenue: "7.66",
    profit: "1,143",
    equity: "4.77",
    margin: "16.22%",
    rank: 6,
  },
  {
    key: "铁流股份",
    revenue: "23.82",
    profit: "7,748",
    equity: "17.22",
    margin: "17.59%",
    rank: 3,
  },
  {
    key: "亚太股份",
    revenue: "56.07",
    profit: "49,013",
    equity: "33.64",
    margin: "20.83%",
    rank: 1,
  },
  {
    key: "长源东谷",
    revenue: "22.55",
    profit: "38,899",
    equity: "30.12",
    margin: "27.20%",
    rank: 4,
  },
  {
    key: "南方精工",
    revenue: "8.54",
    profit: "34,561",
    equity: "15.71",
    margin: "32.33%",
    rank: 5,
  },
  {
    key: "万安科技",
    revenue: "49.60",
    profit: "21,348",
    equity: "30.51",
    margin: "16.37%",
    rank: 2,
  },
];
const reportSeed = {
  industry:
    "国内商用车离合器行业规模约135亿元，年增6%-8%；国六升级、老旧货车淘汰支撑传统配套，混动商用车电控离合器增量显著，但纯电重卡长期挤压传统产品。行业加速国产替代，外资把持高端，本土企业比拼规模、客户与售后渠道，技术向轻量化、电控化迭代，原材料波动持续压缩制造端毛利。",
  market:
    "市场分整车配套与售后两大板块，售后毛利率显著高于OEM。铁流双线布局配套+商用车供应链服务，海内外渠道均衡；长春一东依托一汽系主机配套，国内重卡定点资源稳固，外贸出口稳步扩容（1.07亿元），但售后业务体量偏小，多元化市场布局弱于铁流。行业集中度持续抬升，中小厂商出清加速。",
  competition:
    "铁流营收为长春一东3倍，盈利规模大幅领先；亚太、长源东谷、万安规模均超长春一东5-7倍，业务多元、抗周期能力更强。长春一东净利率仅1.49%，资产规模、营收规模全面落后对标企业，规模效应不足，产品线单一。",
  self: "优势：背靠兵器工业、中国一汽两大央企集团，重卡配套壁垒高，2025年营收同比增10.99%，扭亏为盈，盈利修复弹性更大；离合器25%市占率、液压翻转机构35%市占率行业第一。短板：营收仅为铁流三分之一、净资产仅为四分之一；业务仅聚焦离合器及液压机构，缺少零部件贸易、精密加工第二增长曲线；盈利基数低（1143万），业绩波动大；售后与海外渠道布局滞后，规模成本劣势明显。",
  conclusion:
    "长春一东客户壁垒突出，重卡配套地位稳固，但规模、多元布局、盈利能力均显著弱于对标企业。需加大售后市场开拓力度，丰富产品线（AMT、电控离合器）放大经营稳定性，逐步缩小与铁流等龙头的差距。",
};

function FileScope({ title, subtitle, editable }) {
  const [rows, setRows] = useState([
    {
      id: `${title}-1`,
      fileType: "年度定期报告",
      files: [
        {
          uid: `${title}-file`,
          name: `${title}-2025年度报告.pdf`,
          status: "done",
        },
      ],
    },
  ]);
  const updateRow = (id, patch) =>
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  return (
    <div className={styles.scopeBlock}>
      <div className={styles.scopeHead}>
        <div>
          <strong>{title}</strong>
          <span>{subtitle}</span>
        </div>
        {editable ? (
          <Button
            icon={<PlusOutlined />}
            onClick={() =>
              setRows((current) => [
                ...current,
                {
                  id: `${title}-${Date.now()}`,
                  fileType: fileTypes[0].value,
                  files: [],
                },
              ])
            }
          >
            添加材料
          </Button>
        ) : null}
      </div>
      <div className={styles.fileColumns} aria-hidden="true">
        <span>文件类型</span>
        <span>上传文件</span>
        <span />
      </div>
      {rows.map((row) => (
        <div className={styles.fileRow} key={row.id}>
          <Select
            disabled={!editable}
            value={row.fileType}
            options={fileTypes}
            onChange={(fileType) => updateRow(row.id, { fileType })}
          />
          <div className={styles.uploadCell}>
            <Upload
              multiple
              disabled={!editable}
              fileList={row.files}
              beforeUpload={(file) => {
                updateRow(row.id, { files: [...row.files, file] });
                return false;
              }}
              onRemove={
                editable
                  ? (file) =>
                      updateRow(row.id, {
                        files: row.files.filter(
                          (item) => item.uid !== file.uid,
                        ),
                      })
                  : false
              }
            >
              {editable ? (
                <Button icon={<UploadOutlined />}>上传文件</Button>
              ) : null}
            </Upload>
          </div>
          {editable ? (
            <Popconfirm
              title="确认删除该材料？"
              onConfirm={() =>
                setRows((current) =>
                  current.filter((item) => item.id !== row.id),
                )
              }
            >
              <Button danger type="text" icon={<DeleteOutlined />} />
            </Popconfirm>
          ) : (
            <span />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CompanyMaintenance() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fromTask = searchParams.get("fromTask") === "1";
  const reportYear = searchParams.get("year") || "2025";
  const reportCycle =
    searchParams.get("period") === "semiannual" ? "半年度" : "年度";
  const view = searchParams.get("view") || (fromTask ? "task" : "comparables");
  const editable = fromTask;
  const showComparables = view === "task" || view === "comparables";
  const showAnalysis = view === "task" || view === "analysis";
  const [maintained, setMaintained] = useState(data.comparables);
  const [candidate, setCandidate] = useState({
    name: "",
    companyType: "上市公司",
    stockCode: "",
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState(view === "analysis" ? reportSeed : null);
  const company = data.company;
  const addComparable = () => {
    if (!candidate.name.trim()) return message.warning("请填写可比公司名称");
    if (candidate.companyType === "上市公司" && !candidate.stockCode.trim())
      return message.warning("上市公司请填写股票编码");
    if (
      candidate.stockCode &&
      maintained.some((item) => item.stockCode === candidate.stockCode.trim())
    )
      return message.warning("该可比公司已维护");
    setMaintained((current) => [
      ...current,
      {
        id: `cp-${Date.now()}`,
        name: candidate.name.trim(),
        companyType: candidate.companyType,
        stockCode:
          candidate.companyType === "上市公司"
            ? candidate.stockCode.trim()
            : null,
        industry: "汽车零部件",
        market: "待识别",
        status: "已维护",
      },
    ]);
    setCandidate({ name: "", companyType: "上市公司", stockCode: "" });
  };
  const runAnalysis = () => {
    setAnalyzing(true);
    setReport(null);
    window.setTimeout(() => {
      setReport(reportSeed);
      setAnalyzing(false);
      message.success("AI分析完成");
    }, 1600);
  };
  const reportColumns = useMemo(
    () =>
      ["key", "revenue", "profit", "equity", "margin", "rank"].map(
        (key, index) => ({
          title: [
            "指标/公司",
            "营收(亿)",
            "归母净利(万)",
            "归母净资产(亿)",
            "毛利率",
            "市值/规模排序",
          ][index],
          dataIndex: key,
          width: index ? 130 : 120,
        }),
      ),
    [],
  );
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <header className={styles.pageHead}>
          <div className={styles.headAccent} aria-hidden="true" />
          <div className={styles.headContent}>
            <div className={styles.headEyebrow}>
              <i />
              {fromTask
                ? "公司维护任务"
                : view === "analysis"
                  ? "AI 分析档案"
                  : "公司档案"}
            </div>
            <h1>{view === "analysis" ? "AI分析结果" : "公司维护"}</h1>
            <p>
              {fromTask
                ? "维护可比公司、分析材料与AI对标报告"
                : view === "analysis"
                  ? "查看已确认的AI对标分析报告"
                  : "查看可比公司及维护材料"}
            </p>
          </div>
          <div className={styles.companyInfo}>
            <span>当前维护企业</span>
            <strong>{company.name}</strong>
            <em>{company.stockCode}</em>
          </div>
          <div className={styles.headMeta}>
            <div>
              <span>报告周期</span>
              <strong>
                {reportYear}
                {reportCycle}
              </strong>
            </div>
            <div>
              <span>任务状态</span>
              <strong>{fromTask ? "执行中" : "已归档"}</strong>
            </div>
            <div>
              <span>维护模式</span>
              <strong>{editable ? "可编辑" : "只读"}</strong>
            </div>
          </div>
        </header>
        {showComparables ? (
          <>
            <Card
              className={styles.sectionCard}
              title={
                <span className={styles.sectionTitle}>
                  <b>01</b> 公司维护
                </span>
              }
            >
              <div
                className={`${styles.comparableGrid} ${!editable ? styles.readonlyGrid : ""}`}
              >
                {editable ? (
                  <div className={styles.comparableLeft}>
                    <h3>维护可比公司</h3>
                    <p>选择公司类型并录入基本信息，非上市公司无需股票编码。</p>
                    <Form layout="vertical">
                      <Form.Item label="公司类型" required>
                        <Select
                          value={candidate.companyType}
                          options={["上市公司", "非上市公司"].map((value) => ({
                            label: value,
                            value,
                          }))}
                          onChange={(companyType) =>
                            setCandidate((v) => ({
                              ...v,
                              companyType,
                              stockCode:
                                companyType === "非上市公司" ? "" : v.stockCode,
                            }))
                          }
                        />
                      </Form.Item>
                      <Form.Item label="可比公司名称" required>
                        <Input
                          value={candidate.name}
                          placeholder="例如：铁流股份"
                          onChange={(e) =>
                            setCandidate((v) => ({
                              ...v,
                              name: e.target.value,
                            }))
                          }
                        />
                      </Form.Item>
                      {candidate.companyType === "上市公司" ? (
                        <Form.Item label="股票编码" required>
                          <Input
                            value={candidate.stockCode}
                            placeholder="例如：603926.SH"
                            onChange={(e) =>
                              setCandidate((v) => ({
                                ...v,
                                stockCode: e.target.value,
                              }))
                            }
                          />
                        </Form.Item>
                      ) : null}
                      <Button block type="primary" onClick={addComparable}>
                        维护
                      </Button>
                    </Form>
                  </div>
                ) : null}
                <div className={styles.comparableRight}>
                  <div className={styles.listHead}>
                    <div>
                      <h3>已维护可比公司</h3>
                      <span>共 {maintained.length} 家</span>
                    </div>
                  </div>
                  {maintained.map((item) => (
                    <div className={styles.comparableItem} key={item.id}>
                      <div>
                        <strong>
                          {item.name}{" "}
                          <Tag>{item.companyType || "上市公司"}</Tag>
                        </strong>
                        <span>
                          {item.stockCode ? `${item.stockCode} · ` : ""}
                          {item.industry}
                        </span>
                      </div>
                      {editable ? (
                        <Button
                          danger
                          type="text"
                          onClick={() =>
                            setMaintained((current) =>
                              current.filter((row) => row.id !== item.id),
                            )
                          }
                        >
                          移除
                        </Button>
                      ) : (
                        <Tag>已维护</Tag>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            <Card
              className={styles.sectionCard}
              title={
                <span className={styles.sectionTitle}>
                  <b>02</b> 维护范围
                </span>
              }
            >
              <FileScope
                editable={editable}
                title={company.name}
                subtitle="本公司材料"
              />
              {maintained.map((item) => (
                <FileScope
                  editable={editable}
                  key={item.id}
                  title={item.name}
                  subtitle={`可比公司 · ${item.stockCode || "非上市公司"}`}
                />
              ))}
            </Card>
          </>
        ) : null}
        {showAnalysis ? (
          <Card
            className={styles.sectionCard}
            title={
              <span className={styles.sectionTitle}>
                <b>{fromTask ? "03" : "01"}</b> AI分析结果确认
              </span>
            }
            extra={
              editable ? (
                <Button
                  type="primary"
                  icon={<RobotOutlined />}
                  loading={analyzing}
                  onClick={runAnalysis}
                >
                  AI分析
                </Button>
              ) : null
            }
          >
            <Spin
              spinning={analyzing}
              tip="AI正在读取材料、提取财务指标并生成对标分析……"
            >
              <div className={styles.analysisArea}>
                {report ? (
                  <>
                    <ReportEditor
                      readOnly={!editable}
                      label="看行业"
                      value={report.industry}
                      onChange={(industry) =>
                        setReport((v) => ({ ...v, industry }))
                      }
                    />
                    <ReportEditor
                      readOnly={!editable}
                      label="看市场"
                      value={report.market}
                      onChange={(market) =>
                        setReport((v) => ({ ...v, market }))
                      }
                    />
                    <div className={styles.reportBlock}>
                      <h3>看竞争</h3>
                      <Table
                        rowKey="key"
                        columns={reportColumns}
                        dataSource={competitors}
                        pagination={false}
                        scroll={{ x: 760 }}
                        size="small"
                      />
                      <Input.TextArea
                        readOnly={!editable}
                        rows={4}
                        value={report.competition}
                        onChange={(e) =>
                          setReport((v) => ({
                            ...v,
                            competition: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <ReportEditor
                      readOnly={!editable}
                      label="看自己"
                      value={report.self}
                      onChange={(self) => setReport((v) => ({ ...v, self }))}
                    />
                    <ReportEditor
                      readOnly={!editable}
                      label="整体结论"
                      value={report.conclusion}
                      onChange={(conclusion) =>
                        setReport((v) => ({ ...v, conclusion }))
                      }
                    />
                    {editable ? (
                      <div className={styles.footerActions}>
                        <Button onClick={() => message.success("修改已保存")}>
                          保存修改
                        </Button>
                        <Button
                          type="primary"
                          onClick={() => {
                            message.success("报告已确认");
                            window.setTimeout(() => navigate("/djghome"), 500);
                          }}
                        >
                          确认报告
                        </Button>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className={styles.emptyAnalysis}>
                    <RobotOutlined />
                    <strong>尚未生成AI分析</strong>
                    <span>请先维护公司和材料，再点击右上角“AI分析”。</span>
                  </div>
                )}
              </div>
            </Spin>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function ReportEditor({ label, value, onChange, readOnly }) {
  return (
    <div className={styles.reportBlock}>
      <h3>{label}</h3>
      <Input.TextArea
        readOnly={readOnly}
        autoSize={{ minRows: 4, maxRows: 10 }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
