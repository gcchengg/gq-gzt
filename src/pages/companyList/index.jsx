import {
  CheckOutlined,
  EyeOutlined,
  FileTextOutlined,
  HolderOutlined,
  PrinterOutlined,
  SettingOutlined,
  ShareAltOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import {
  Button,
  Checkbox,
  ConfigProvider,
  Drawer,
  Empty,
  Input,
  Modal,
  Select,
  Table,
  Tag,
  message,
} from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import companyList from "@/pages/companyReview/list.json";
import companyDetail from "@/pages/companyReview/长春一东.json";
import { generatedAnalysis } from "@/pages/executiveMaintenance/data";
import SourceMark from "./components/SourceMark";
import {
  auditProblemRows,
  comparisonRows,
  financeRows,
  financialAnalysisSections,
  financialWarningItems,
  riskTrackingRows,
  sectionOptions,
  topicDemos,
} from "./data";
import styles from "./index.module.less";

const S = ({ children, source }) => (
  <SourceMark source={source}>{children}</SourceMark>
);
const allKeys = sectionOptions.flatMap((section) => [
  section.key,
  ...section.children.map((_, i) => `${section.key}-${i}`),
]);
const directorKeyTopics = [
  "关于聘任赵德良为公司总经理的议案",
  "2026年度全面预算报告",
  "关于公司未来三年股东回报规划（2026年-2028年）的议案",
  "关于2025年度利润分配方案的议案",
  "关于2026年度投资计划的议案",
];
const synergyInitializationItems = [
  {
    title: "集团内客户及产品",
    content: "客户为一汽解放，供应商用车离合器总成及液压举升器。",
    source: "参股公司基础信息-产品信息",
  },
  {
    title: "战略定位",
    content: "取“一企一策”战略定位情况，工作台未上线前进行初始化导入",
  },
  {
    title: "战略执行",
    content: "取“一企一策”战略执行情况，工作台未上线前进行初始化导入",
  },
  {
    title: "战略成果",
    content: "取“一企一策”战略成果情况，工作台未上线前进行初始化导入",
  },
  {
    title: "产业协同",
    content: "取“一企一策”确定的产业协同任务，工作台未上线前进行初始化导入",
  },
];
const source = {
  basic: "参股公司信息管理-基础信息",
  product: "参股公司信息管理-产品信息",
  later: "需要后续补充",
  shareholder: "参股公司信息管理-股东信息",
  director: "参股公司信息管理-董监事信息",
  compliance: "参股公司信息管理-合规管理",
  finance: "投后工作报告-财务指标",
  financeCalc: "根据投后工作报告-财务指标表格计算得知",
  operation: "投后工作报告-经营情况",
  topic: "三会管理工作台-议题交办",
  risk: "风险管理",
};

function Block({ id, title, checked, titleSource, children }) {
  if (!checked(id)) return null;
  return (
    <section className={styles.block}>
      <h2>
        <span>{title}</span>
        {titleSource ? (
          <SourceMark source={titleSource}>
            <span className={styles.sourceLabel}>数据说明</span>
          </SourceMark>
        ) : null}
      </h2>
      {children}
    </section>
  );
}

function Sub({ id, title, checked, children }) {
  return checked(id) ? (
    <article className={styles.sub}>
      <h3>{title}</h3>
      {children}
    </article>
  ) : null;
}

function MedalQuestionBankButton({ onOpen }) {
  const buttonRef = useRef(null);
  const dragState = useRef(null);
  const dragged = useRef(false);
  const [position, setPosition] = useState(null);

  useEffect(() => {
    const keepInViewport = () => {
      if (!position || !buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        left: Math.min(
          Math.max(12, position.left),
          window.innerWidth - rect.width - 12,
        ),
        top: Math.min(
          Math.max(12, position.top),
          window.innerHeight - rect.height - 12,
        ),
      });
    };
    window.addEventListener("resize", keepInViewport);
    return () => window.removeEventListener("resize", keepInViewport);
  }, [position]);

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;
    const rect = buttonRef.current.getBoundingClientRect();
    dragged.current = false;
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const state = dragState.current;
    if (!state || state.pointerId !== event.pointerId) return;
    if (
      Math.hypot(event.clientX - state.startX, event.clientY - state.startY) > 4
    ) {
      dragged.current = true;
    }
    if (!dragged.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPosition({
      left: Math.min(
        Math.max(12, event.clientX - state.offsetX),
        window.innerWidth - rect.width - 12,
      ),
      top: Math.min(
        Math.max(12, event.clientY - state.offsetY),
        window.innerHeight - rect.height - 12,
      ),
    });
  };

  const handlePointerUp = (event) => {
    if (dragState.current?.pointerId === event.pointerId) {
      dragState.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      className={styles.medalFloatButton}
      style={position ? { left: position.left, top: position.top } : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={() => {
        if (dragged.current) {
          dragged.current = false;
          return;
        }
        onOpen();
      }}
      aria-label="打开勋章管家题库入口"
    >
      <span className={styles.dragHandle} aria-hidden="true">
        <HolderOutlined />
      </span>
      <span className={styles.medalIcon}>
        <TrophyOutlined />
      </span>
      <span className={styles.medalCopy}>
        <b>勋章管家</b>
        <small>进入题库</small>
      </span>
    </button>
  );
}

export default function CompanyList() {
  const companies = useMemo(() => {
    const rows = companyList.data?.list || [];
    return [...rows].sort(
      (a, b) =>
        Number(b.shortForm === "长春一东") - Number(a.shortForm === "长春一东"),
    );
  }, []);
  const sharedParams = useMemo(
    () => new URLSearchParams(window.location.search),
    [],
  );
  const isSharedView =
    window.location.pathname.toLowerCase() === "/companyreportshare";
  const sharedSections = useMemo(() => {
    const sections =
      sharedParams.get("sections")?.split(",").filter(Boolean) || [];
    return sections.length
      ? sections.filter((key) => allKeys.includes(key))
      : allKeys;
  }, [sharedParams]);
  const [selectedId, setSelectedId] = useState(
    sharedParams.get("companyId") || companies[0]?.id,
  );
  const [keyword, setKeyword] = useState("");
  const [globalYear, setGlobalYear] = useState("2025");
  const [globalPeriod, setGlobalPeriod] = useState("年度");
  const [documentYear, setDocumentYear] = useState(
    sharedParams.get("year") || "2025",
  );
  const [documentPeriod, setDocumentPeriod] = useState(
    sharedParams.get("period") || "年度",
  );
  const [configOpen, setConfigOpen] = useState(false);
  const [medalOpen, setMedalOpen] = useState(false);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [configs, setConfigs] = useState({});
  const paperRef = useRef(null);
  const previewRef = useRef(null);
  const [messageApi, messageContextHolder] = message.useMessage();
  const selected =
    companies.find((item) => String(item.id) === String(selectedId)) ||
    companies[0];
  const isYidong = selected?.shortForm === "长春一东";
  const detail = isYidong ? companyDetail.data.companyHis : selected;
  const shares = isYidong ? companyDetail.data.companyShsHis : null;
  const enabled = isSharedView
    ? sharedSections
    : configs[selectedId] || allKeys;
  const checked = (key) => enabled.includes(key);
  const visibleCompanies = companies.filter((item) =>
    `${item.companyName}${item.shortForm}`.includes(keyword.trim()),
  );
  const reportLabel = `${documentYear}${documentPeriod}`;
  const reportCutoff =
    documentPeriod === "年度"
      ? `${documentYear}年12月`
      : `${documentYear}年6月`;
  const visibleFinanceRows = financeRows.filter(
    (item) => Number(item.year) <= Number(documentYear),
  );
  const products =
    detail?.productList
      ?.slice(0, 5)
      .map((item) => item.prodName)
      .join("、") || "商用车离合器总成、液压举升器";
  const displayName =
    detail?.shortForm || selected?.shortForm || selected?.companyName;
  const specialResolutionRequirement =
    (isYidong
      ? companyDetail.data.companySoInfoHis?.superReqDtlFlag
      : selected?.companySoInfoHis?.superReqDtlFlag) ||
    "公司章程规定，修改公司章程、增加或者减少注册资本、公司合并、分立、解散、清算或者变更公司形式等特殊决议事项，须经出席股东会会议的股东所持表决权三分之二以上通过；涉及重大资产处置、对外担保及其他对股东权益有重大影响的事项，按照公司章程及议事规则履行特别审议程序。";
  const setCompanyConfig = (values) =>
    setConfigs((current) => ({ ...current, [selectedId]: values }));

  const openPdfPreview = () => {
    if (!paperRef.current) return;
    setPreviewHtml(paperRef.current.innerHTML);
    setPdfPreviewOpen(true);
  };

  const copyShareUrl = async () => {
    const url = new URL("/companyReportShare", window.location.origin);
    url.searchParams.set("companyId", selectedId);
    url.searchParams.set("year", documentYear);
    url.searchParams.set("period", documentPeriod);
    url.searchParams.set("sections", enabled.join(","));

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url.toString());
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url.toString();
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      messageApi.success("分享链接已复制，可粘贴到新的浏览器打开");
    } catch (error) {
      console.error("Copy share URL failed", error);
      messageApi.error("复制失败，请检查浏览器剪贴板权限");
    }
  };

  const printPdf = () => {
    if (!previewRef.current) return;
    const printWindow = window.open("", "_blank", "width=1100,height=800");
    if (!printWindow) {
      messageApi.warning("浏览器阻止了打印窗口，请允许弹出窗口后重试");
      return;
    }

    const documentTitle = `${displayName}-${reportLabel}一企一档报告`;
    const escapedTitle = documentTitle.replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
    const inheritedStyles = [
      ...document.head.querySelectorAll('style, link[rel="stylesheet"]'),
    ]
      .map((node) => node.outerHTML)
      .join("");
    const printStyles = `
      @page { size: A4 portrait; margin: 12mm; }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: #fff !important; }
      body { color: #172a3d; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .${styles.paper} {
        width: auto !important; max-width: none !important; min-height: 0 !important;
        margin: 0 !important; padding: 0 !important; border: 0 !important;
        background: #fff !important; box-shadow: none !important;
      }
      .${styles.block} { content-visibility: visible !important; contain: none !important; }
      .${styles.block} > h2, .${styles.sub} > h3 { break-after: avoid-page; page-break-after: avoid; }
      .${styles.documentHeader}, .${styles.metaGrid}, .${styles.conclusion},
      .${styles.financeTable}, .${styles.comparisonTable}, .${styles.topic},
      .${styles.twoCol} > p, .${styles.strategyGrid} > p,
      .${styles.auditIssueCard}, .${styles.riskTrackingCard} {
        break-inside: avoid-page; page-break-inside: avoid;
      }
      .${styles.comparisonTable} { overflow: visible !important; }
      .${styles.comparisonTable} table { min-width: 0 !important; table-layout: fixed; }
      .${styles.financeTable} .ant-table-content { overflow: visible !important; }
      .${styles.financeTable} table { width: 100% !important; table-layout: fixed !important; }
      .${styles.metaGrid} { grid-template-columns: repeat(3, 1fr) !important; }
      .${styles.strategyGrid} { grid-template-columns: 1fr !important; }
      .${styles.strategyGrid} > p { grid-template-columns: 118px minmax(0, 1fr) !important; }
      a { color: inherit !important; text-decoration: none !important; }
      @media print { .no-print { display: none !important; } }
    `;

    printWindow.document.open();
    printWindow.document
      .write(`<!doctype html><html><head><meta charset="UTF-8" />
      <title>${escapedTitle}</title>${inheritedStyles}<style>${printStyles}</style>
      </head><body>${previewRef.current.outerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    };
  };

  const enterMedalQuestionBank = () => {
    setMedalOpen(false);
    window.dispatchEvent(
      new CustomEvent("gq:open-medal-question-bank", {
        detail: { companyId: selectedId, companyName: displayName },
      }),
    );
    messageApi.success("已选择进入勋章管家题库");
  };

  const financeColumns = [
    { title: "年度", dataIndex: "year", fixed: "left" },
    {
      title: "营业收入",
      children: [
        { title: "决算金额", dataIndex: "revenue" },
        { title: "同比增长", dataIndex: "revenueRate" },
      ],
    },
    {
      title: "归母净利润",
      children: [
        { title: "决算金额", dataIndex: "profit" },
        { title: "同比增长", dataIndex: "profitRate" },
      ],
    },
    {
      title: "归母所有者权益",
      children: [
        { title: "决算金额", dataIndex: "equity" },
        { title: "同比增长", dataIndex: "equityRate" },
      ],
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#234f7d",
          borderRadius: 6,
          fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif',
        },
      }}
    >
      <div
        className={`${styles.page} ${isSharedView ? styles.sharedPage : ""}`}
      >
        {messageContextHolder}
        {!isSharedView ? (
          <aside className={styles.companyRail}>
            <div className={styles.railHeader}>
              <div>
                <span>企业索引</span>
                <strong>{companies.length}</strong>
              </div>
              <Input.Search
                allowClear
                placeholder="搜索公司"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <div className={styles.globalReportFilter}>
                <span>全部公司报告</span>
                <Select
                  value={globalYear}
                  onChange={setGlobalYear}
                  options={["2025", "2024", "2023"].map((value) => ({
                    value,
                    label: `${value}年`,
                  }))}
                />
                <Select
                  value={globalPeriod}
                  onChange={setGlobalPeriod}
                  options={["年度", "半年度"].map((value) => ({
                    value,
                    label: value,
                  }))}
                />
              </div>
            </div>
            <div className={styles.companyList}>
              {visibleCompanies.length ? (
                visibleCompanies.map((item) => (
                  <div
                    key={item.id}
                    className={`${styles.companyItem} ${item.id === selectedId ? styles.active : ""}`}
                    onClick={() => setSelectedId(item.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <span className={styles.companyNo}>
                      {String(companies.indexOf(item) + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.companyName}>
                      <b>{item.shortForm || item.companyName}</b>
                      <small>
                        {globalYear}
                        {globalPeriod}
                      </small>
                    </span>
                    {item.id === selectedId ? (
                      <Button
                        type="text"
                        className={styles.configButton}
                        icon={<SettingOutlined />}
                        aria-label="配置显示模块"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfigOpen(true);
                        }}
                      >
                        配置
                      </Button>
                    ) : null}
                  </div>
                ))
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="未找到公司"
                />
              )}
            </div>
          </aside>
        ) : null}

        <main
          className={`${styles.workspace} ${isSharedView ? styles.sharedWorkspace : ""}`}
        >
          {!isSharedView ? (
            <div className={styles.documentFilter}>
              <div>
                <span>当前公司报告</span>
                <strong>{displayName}</strong>
              </div>
              <Select
                value={documentYear}
                onChange={setDocumentYear}
                options={["2025", "2024", "2023"].map((value) => ({
                  value,
                  label: `${value}年`,
                }))}
              />
              <Select
                value={documentPeriod}
                onChange={setDocumentPeriod}
                options={["年度", "半年度"].map((value) => ({
                  value,
                  label: value,
                }))}
              />
              <Button
                className={styles.pdfButton}
                icon={<EyeOutlined />}
                onClick={openPdfPreview}
              >
                PDF 预览
              </Button>
            </div>
          ) : null}
          <div
            className={`${styles.paper} ${isSharedView ? styles.sharedPaper : ""}`}
            ref={paperRef}
          >
            {!isSharedView ? (
              <header className={styles.documentHeader}>
                <div className={styles.kicker}>
                  <FileTextOutlined /> 一企一档 · 一口清
                </div>
                <h1>{displayName}</h1>
                <div className={styles.reportPeriod}>
                  {reportLabel}一企一档报告
                </div>
                <div className={styles.metaGrid}>
                  <div>
                    <span>公司简称</span>
                    <b>{displayName}</b>
                  </div>
                  <div>
                    <span>管户</span>
                    <b>
                      {detail?.dutyUserName ||
                        selected?.dutyUserName ||
                        "丛圣元"}
                    </b>
                  </div>
                  <div>
                    <span>管理部门</span>
                    <b>股权运营部</b>
                  </div>
                  <div>
                    <span>持股比例</span>
                    <b>{detail?.shRatio ?? selected?.shRatio ?? "—"}%</b>
                  </div>
                  <div>
                    <span>管理分类</span>
                    <b>成长期股权投资</b>
                  </div>
                  <div>
                    <span>股权分类</span>
                    <b>保留</b>
                  </div>
                </div>
              </header>
            ) : null}

            <Block id="base" title="一、基础底数“清”" checked={checked}>
              <Sub id="base-0" title="1. 企业画像" checked={checked}>
                <p>
                  <a href="#company-detail">
                    {detail?.companyName || selected?.companyName}
                  </a>
                  ，成立于
                  <S source={source.basic}>
                    {detail?.launchDate || selected?.launchDate || "—"}
                  </S>
                  ，注册资本
                  <S source={source.basic}>
                    {detail?.registeredCapitalAmt ||
                      selected?.registeredCapitalAmt ||
                      "—"}
                    万元
                  </S>
                  ，
                  <S source={source.later}>
                    {isYidong
                      ? "沪交所上市公司，代码600148.SH"
                      : "上市信息待补充"}
                  </S>
                  ，法定代表人
                  <S source={source.later}>{isYidong ? "孟庆洪" : "待补充"}</S>
                  ，注册地址为
                  <S source={source.basic}>
                    {detail?.registeredAddress ||
                      selected?.registeredAddress ||
                      "—"}
                  </S>
                  ，人员规模
                  <S source={source.basic}>
                    {detail?.employeeNums ?? selected?.employeeNums ?? "—"}人
                  </S>
                  。
                </p>
              </Sub>
              <Sub id="base-1" title="2. 业务与定位" checked={checked}>
                <p>
                  <S source={source.basic}>
                    主营业务为
                    {detail?.coreBusiness ||
                      selected?.coreBusiness ||
                      "商用车离合器、液压举升器的研发、制造与销售"}
                  </S>
                  ；<S source={source.product}>主要产品为{products}</S>。
                  <S source={source.later}>
                    战略定位为集团公司商用车传动系统零部件的重要供应方，为解放品牌配套离合器总成、液压举升器等产品
                  </S>
                  。
                </p>
              </Sub>
              <Sub id="base-2" title="3. 股权与治理结构" checked={checked}>
                <p>
                  <a href="#company-detail">{displayName}</a>的股权结构为
                  <S source={source.shareholder}>
                    {shares
                      ? `${shares.ctrlShName}持股${shares.ctrlShRatio}%，${shares.investEntityName}持股${detail.shRatio}%，中兵投资管理有限责任公司持股8.07%，${shares.firstShName}持股${shares.firstShRatio}%`
                      : "股东信息待补充"}
                  </S>
                  。
                  <S source={source.director}>
                    董事会共{detail?.bodSeats || 9}席，其中一汽方
                    {detail?.fawBodSeats || 2}席
                  </S>
                  ；<S source={source.later}>经管层共6席，其中一汽方1席</S>。
                  <S source={source.basic}>党建要求已进章程，已成立党组织</S>。
                </p>
              </Sub>
              <Sub id="base-3" title="4. 对标情况（AI生成）" checked={checked}>
                <div className={styles.analysis}>
                  <h4>看行业</h4>
                  <p>
                    2025年国内商用车销量429.6万辆，同比增长10.9%，其中重卡销量114.5万辆，同比增长27%，行业复苏为离合器、驾驶室液压翻转机构等传统配套产品提供了需求支撑。与此同时，新能源商用车销量达到87.1万辆，同比增长63.7%，市场渗透率升至26.9%；新能源重卡销量23.11万辆，同比增长182%。行业需求正由单一燃油车型向燃油、燃气、混动和纯电多路线并行切换。对长春一东而言，重卡复苏有利于稳住现有基本盘，但纯电车型减少传统离合器用量，主机厂持续压价、原材料价格波动也会挤压利润空间，AMT执行机构、扭转减振器及新能源相关部件将成为中长期转型重点。
                  </p>
                  <h4>看市场</h4>
                  <p>
                    长春一东形成了“主机配套为主、售后零售与外贸出口协同”的市场结构，产品已覆盖国内主流商用车主机厂并进入重卡前五企业配套体系。2025年离合器配套业务收入同比增长26.45%，液压翻转机构业务收入同比增长8.35%；外贸出口实现收入1.07亿元，约占营业收入14%，产品覆盖中亚、欧美及东南亚，液压翻转机构已进入国际一流商用车集团供应链。售后市场通过渠道拓展、双品牌运营和大客户专属模式推动大马力、天然气车型订单增长，但与铁流股份覆盖近万家维修终端、拥有全车件智慧供应链平台相比，长春一东的后市场品类广度、渠道下沉和一站式服务能力仍有提升空间。
                  </p>
                  <h4>看竞争</h4>
                  <div className={styles.comparisonTable}>
                    <table>
                      <thead>
                        <tr>
                          {[
                            "指标",
                            "长春一东",
                            "铁流股份",
                            "亚太股份",
                            "长源东谷",
                            "南方精工",
                            "万安科技",
                          ].map((x) => (
                            <th key={x}>{x}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonRows.map((row) => (
                          <tr key={row[0]}>
                            {row.map((x) => (
                              <td key={x}>{x}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p>
                    从经营规模看，长春一东7.66亿元营收在六家公司中最低，约为铁流股份的32%、亚太股份的14%；归母净利润1,143万元，净利率约1.49%，也明显低于对标企业。铁流股份与长春一东同处离合器赛道，但已形成传动系统、高精密零部件和商用车后市场服务三大板块，并布局近两千种离合器型号、AMT、自调整离合器、双质量飞轮及混动系统产品。亚太股份、万安科技依靠制动与底盘电子系统扩大智能化产品矩阵；长源东谷通过发动机零部件向新能源混动客户延伸；南方精工则以精密轴承、单向离合器切入新能源和机器人领域。相比之下，长春一东细分市场份额领先，但收入体量、产品多元化和利润转化能力偏弱。
                  </p>
                  <h4>看自己</h4>
                  <p>
                    <b>优势：</b>
                    公司离合器市场占有率25%、重卡液压翻转机构市场占有率35%，均处行业领先地位；拥有国家级企业技术中心、博士后科研工作站和CNAS实验室，长春、苏州双研发中心能够支撑主机厂同步开发。2025年取得大马力离合器、AMT、扭转减振器等重点项目32项，申请专利54项，关键工序自动化覆盖率达到85%，客户资源和制造质量构成较高进入壁垒。
                    <b>短板：</b>
                    业务仍集中于离合器和液压翻转机构，规模效应不足，2025年毛利率16.22%、净利率约1.49%，盈利韧性弱于多数对标企业；研发费用1,927万元，同比下降19.34%，新业务虽已获得小批量订单，但尚未形成足以对冲传统离合器需求收缩的收入支柱。海外市场和售后渠道已有突破，覆盖深度及产品丰富度仍需继续提升。
                  </p>
                  <div className={styles.conclusion}>
                    <b>整体结论</b>
                    长春一东属于“细分冠军、规模偏小、转型加速”的企业：短期受益于重卡复苏和配套份额提升，中长期则需把客户与技术优势转化为AMT、混动减振及新能源部件的批量收入，同时复制铁流股份的后市场渠道能力，扩大海外本地化服务，通过产品结构升级、精益降本和规模增长改善盈利水平。
                  </div>
                </div>
              </Sub>
            </Block>

            <Block id="finance" title="二、财务状况“清”" checked={checked}>
              <Sub id="finance-0" title="1. 本期经营完成" checked={checked}>
                <p>
                  截至{reportCutoff}，
                  <S source={source.finance}>
                    {displayName}完成营业收入35805.11万元
                  </S>
                  ，<S source={source.finance}>预算完成度46.72%</S>，
                  <S source={source.finance}>实现归母净利润920.40万元</S>，
                  <S source={source.finance}>预算完成度68.48%</S>。
                  {documentYear}年度营业收入预算
                  <S source={source.finance}>80,232万元</S>，较2025年决算
                  <S source={source.financeCalc}>增长4.71%</S>；归母净利润预算
                  <S source={source.finance}>1344万元</S>，较2025年决算
                  <S source={source.financeCalc}>增长16.92%</S>。
                </p>
              </Sub>
              <Sub id="finance-1" title="2. 近三年财务表现" checked={checked}>
                <SourceMark source="金额均取参股公司大司库（运营监控平台）数据，同比增长根据公式计算；单位万元，不保留小数点">
                  <span className={styles.tableNote}>口径说明</span>
                </SourceMark>
                <Table
                  className={styles.financeTable}
                  rowKey="year"
                  columns={financeColumns}
                  dataSource={visibleFinanceRows}
                  bordered
                  pagination={false}
                  size="small"
                  scroll={{ x: 760 }}
                />
              </Sub>
              <Sub id="finance-2" title="3. 分红情况" checked={checked}>
                <p>
                  {displayName}
                  {reportLabel}
                  <S source={source.operation}>完成分红93.8万元</S>，
                  <S source={source.operation}>历史累计分红458万元</S>。
                </p>
              </Sub>
              <Sub id="finance-3" title="4. 财务分析" checked={checked}>
                <SourceMark source="参股公司投后报告-财务指标-财务综合评价报告-AI分析">
                  <span className={styles.tableNote}>数据来源</span>
                </SourceMark>
                <div className={styles.financialAnalysis}>
                  <section className={styles.analysisPanel}>
                    <div className={styles.analysisPanelTitle}>
                      <b>参股公司财务分析</b>
                      <span>综合评价：稳中向好</span>
                    </div>
                    <p className={styles.analysisSummary}>
                      {displayName}
                      2025年经营表现较上年改善，收入恢复增长并实现扭亏，经营现金流同步增强；但净利率仍处低位，费用控制、营运资金周转以及新业务规模化贡献仍是后续财务管理重点。
                    </p>
                    <div className={styles.analysisGrid}>
                      {financialAnalysisSections.map((item) => (
                        <article
                          className={styles.analysisCard}
                          key={item.title}
                        >
                          <div>
                            <b>{item.title}</b>
                            <span className={styles[item.tone]}>
                              {item.status}
                            </span>
                          </div>
                          <strong>{item.summary}</strong>
                          {item.details.map((detail) => (
                            <p key={detail}>{detail}</p>
                          ))}
                        </article>
                      ))}
                    </div>
                  </section>
                  <section className={styles.warningPanel}>
                    <div className={styles.analysisPanelTitle}>
                      <b>预警总结</b>
                      <span>共识别3项关注事项</span>
                    </div>
                    <div className={styles.warningList}>
                      {financialWarningItems.map((item) => (
                        <article key={item.title}>
                          <span>{item.level}</span>
                          <div>
                            <b>{item.title}</b>
                            <p>{item.content}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                </div>
              </Sub>
            </Block>

            <Block id="governance" title="三、治理行权“清”" checked={checked}>
              <div className={styles.specialResolution}>
                <span>合规管理</span>
                <div>
                  <b>特殊决议事项和通过要求具体内容</b>
                  <p>
                    <S source={source.compliance}>
                      {specialResolutionRequirement}
                    </S>
                  </p>
                </div>
              </div>
              <Sub id="governance-0" title="1. 三会议题管理" checked={checked}>
                <p>
                  <S source={source.topic}>
                    截至2026年6月，共审核{displayName}
                    三会议题31项，其中同意31项、反对0项，发表管理建议1条
                  </S>
                  。
                </p>
                <div className={styles.topicList}>
                  {topicDemos.map((topic, index) => (
                    <div className={styles.topic} key={topic.title}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <b>{topic.title}</b>
                        <Tag color="success" icon={<CheckOutlined />}>
                          {topic.result}
                        </Tag>
                        {topic.advice ? (
                          <p>
                            <strong>管理建议：</strong>
                            {topic.advice}
                          </p>
                        ) : null}
                        {topic.follow ? (
                          <p>
                            <strong>落实情况：</strong>
                            {topic.follow}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </Sub>
              <Sub id="governance-1" title="2. 委派高管履职" checked={checked}>
                <p>
                  <S source="外派高管月报复核">
                    {isYidong
                      ? generatedAnalysis
                      : `${displayName}委派高管履职分析尚未维护。`}
                  </S>
                </p>
              </Sub>
              <Sub id="governance-2" title="3. 委派董事履职" checked={checked}>
                <p>
                  <S source="三会工作台-需总办会审核议题">
                    {displayName}
                    共2名委派董事，为副董事长李秀柱、董事马振来。截至2026年6月，委派董事完成4次董事会31项议题的审议
                  </S>
                  。
                </p>
                <p className={styles.keyTopicLead}>其中关键议题为：</p>
                <ol className={styles.keyTopicList}>
                  {directorKeyTopics.map((topic) => (
                    <li key={topic}>{topic}</li>
                  ))}
                </ol>
              </Sub>
            </Block>

            <Block
              id="synergy"
              title="四、产业协同“清”"
              checked={checked}
              titleSource={source.later}
            >
              <Sub id="synergy-0" title="产业协同情况" checked={checked}>
                <div className={styles.synergyInitializationList}>
                  {synergyInitializationItems.map((item) => (
                    <p key={item.title}>
                      <b>{item.title}：</b>
                      {item.source ? (
                        <S source={item.source}>{item.content}</S>
                      ) : (
                        <span className={styles.synergyInitializationContent}>
                          {item.content}
                        </span>
                      )}
                    </p>
                  ))}
                </div>
              </Sub>
            </Block>
            <Block
              id="risk"
              title="五、风险隐患“清”"
              checked={checked}
              titleSource={source.risk}
            >
              <Sub
                id="risk-0"
                title="1. 审计发现问题及整改明细"
                checked={checked}
              >
                <div className={styles.recordSectionMeta}>
                  <S source="审计管理-审计发现问题及整改明细">审计整改数据</S>
                  <span>共 {auditProblemRows.length} 条</span>
                </div>
                <div className={styles.auditIssueList}>
                  {auditProblemRows.map((record, index) => (
                    <article className={styles.auditIssueCard} key={record.key}>
                      <header>
                        <div className={styles.recordIdentity}>
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <div>
                            <b>{record.projectName}</b>
                            <small>{record.opinionCode}</small>
                          </div>
                        </div>
                        <Tag
                          color={
                            record.status === "已完成"
                              ? "success"
                              : record.status === "整改进行中"
                                ? "processing"
                                : "warning"
                          }
                        >
                          {record.status}
                        </Tag>
                      </header>
                      <div className={styles.auditIssueFacts}>
                        <div>
                          <span>问题编号</span>
                          <strong>{record.draftIndex}</strong>
                        </div>
                        <div>
                          <span>责任单位</span>
                          <strong>{record.problemFinderName}</strong>
                        </div>
                        <div>
                          <span>距整改到期</span>
                          <strong>
                            {record.distance === "—"
                              ? "已完成"
                              : `${record.distance}天`}
                          </strong>
                        </div>
                      </div>
                      <div className={styles.auditIssueSummary}>
                        <span>问题摘要</span>
                        <p>{record.problemSummary}</p>
                      </div>
                      <dl className={styles.auditDateLine}>
                        <div>
                          <dt>预计完成</dt>
                          <dd>{record.estimateEndDate}</dd>
                        </div>
                        <div>
                          <dt>实际开始</dt>
                          <dd>{record.actualityStartDate}</dd>
                        </div>
                        <div>
                          <dt>实际完成</dt>
                          <dd>{record.actualityEndDate}</dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              </Sub>
              <Sub id="risk-1" title="2. 风险情况" checked={checked}>
                <div className={styles.recordSectionMeta}>
                  <S source="风险管理-风险跟踪">风险跟踪数据</S>
                  <span>共 {riskTrackingRows.length} 条</span>
                </div>
                <div className={styles.riskTrackingList}>
                  {riskTrackingRows.map((record, index) => (
                    <article
                      className={styles.riskTrackingCard}
                      key={record.key}
                    >
                      <header>
                        <div className={styles.recordIdentity}>
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <div>
                            <b>{record.riskName}</b>
                            <small>{record.companyName}</small>
                          </div>
                        </div>
                        <div className={styles.riskTags}>
                          <Tag
                            color={
                              record.riskLevelName === "中风险"
                                ? "warning"
                                : "success"
                            }
                          >
                            {record.riskLevelName}
                          </Tag>
                          <Tag color="processing">{record.progStatus}</Tag>
                        </div>
                      </header>
                      <div className={styles.riskCategoryPath}>
                        <span>{record.riskCategoryLv1Name}</span>
                        <i>›</i>
                        <span>{record.riskCategoryLv2Name}</span>
                        <i>›</i>
                        <span>{record.riskTypeName}</span>
                      </div>
                      <dl className={styles.riskFacts}>
                        <div>
                          <dt>风险属性</dt>
                          <dd>{record.eventOrInfo}</dd>
                        </div>
                        <div>
                          <dt>发生时间</dt>
                          <dd>{record.riskOccTime}</dd>
                        </div>
                        <div>
                          <dt>识别方式</dt>
                          <dd>{record.riskMethod}</dd>
                        </div>
                        <div>
                          <dt>点检频率</dt>
                          <dd>{record.inspFreq}</dd>
                        </div>
                        <div>
                          <dt>责任人</dt>
                          <dd>{record.fullName}</dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              </Sub>
            </Block>
            <Block
              id="strategy"
              title="六、管理策略“清”"
              checked={checked}
              titleSource="初始化导入，待一企一策上线后，同步抓取数据"
            >
              {checked("strategy-0") ||
              checked("strategy-1") ||
              checked("strategy-2") ? (
                <article className={styles.sub}>
                  <h3>管理策略</h3>
                  <div className={styles.strategyGrid}>
                    {checked("strategy-0") ? (
                      <p>
                        <b>产业协同</b>
                        <span className={styles.strategyBody}>
                          推动长春一东保持与解放公司长期稳定、互利共赢的市场化合作机制，保持传统零部件份额稳定的同时，聚焦商用车电动化转型赛道，开展AMT系统、限扭减震器等零部件合作。推动双方立足新能源商用车市场发展需求，持续开展技术联合攻关、产品迭代升级与国产化配套落地，依托属地产业协同优势，打通研发、试验、量产全流程合作链路，持续拓展合作广度与深度，助力一汽新能源商用车产品提质降本、迭代升级，巩固双方在商用车核心零部件领域的竞争优势与市场话语权。
                        </span>
                      </p>
                    ) : null}
                    {checked("strategy-1") ? (
                      <p>
                        <b>经营管理</b>
                        <span className={styles.strategyBody}>
                          紧盯长春一东总部利润情况，从成本端强化刚性约束，督促管理层实施全周期费用精益管控，划定管理费用压降目标，压缩非必要行政、后勤、差旅等低效开支，优化组织架构与人员统筹，杜绝无效资源消耗，持续拓宽利润空间。针对海外业务汇率波动侵蚀收益的风险，推动企业常态化开展汇率套期保值操作，提前锁定结算汇率，对冲汇兑损失，保障账面利润稳定可控。同时加大存量债权资产治理力度，部署应收账款专项清收行动，督导经营层建立客户分级催收机制，厘清逾期账款台账，通过对账、限期回款、法务介入等手段加速资金回流，降低资产减值计提。依托费用节流、风险对冲、资产盘活三维管理手段同步发力，有效对冲各类经营减利因素，稳步增厚归母净利润，持续提升公司净资产收益水平，切实维护全体股东投资收益。
                        </span>
                      </p>
                    ) : null}
                    {checked("strategy-2") ? (
                      <p>
                        <b>股权经营</b>
                        <span className={styles.strategyBody}>
                          深入分析长春一东近五年营收、利润贡献及与集团公司协作情况，初步确定该参股公司近年来总体营收下滑、经营质量下降、利润贡献不足，且与解放公司建立良好的市场化合作机制，长期持有股权的战略性目标已达成，管理定位应从战略持有调整为获取财务收益；设计撤回委派至长春一东的董事、高管方案，并确定完成撤回后长春一东股权可由“长期股权投资”转变为“交易性金融资产”，预计年度增利2.78亿元，储备股权增利机会。
                        </span>
                      </p>
                    ) : null}
                  </div>
                </article>
              ) : null}
            </Block>
            <footer>一企一档 · 数据更新至 2026年6月</footer>
          </div>
        </main>

        {!isSharedView ? (
          <MedalQuestionBankButton onOpen={() => setMedalOpen(true)} />
        ) : null}

        {!isSharedView ? (
          <Drawer
            title={`${displayName} · ${reportLabel}一企一档报告预览`}
            width="100%"
            open={pdfPreviewOpen}
            onClose={() => setPdfPreviewOpen(false)}
            className={styles.pdfPreviewDrawer}
            extra={
              <div className={styles.previewActions}>
                <Button icon={<ShareAltOutlined />} onClick={copyShareUrl}>
                  复制分享链接
                </Button>
                <Button
                  type="primary"
                  icon={<PrinterOutlined />}
                  onClick={printPdf}
                >
                  打印 / 另存为 PDF
                </Button>
              </div>
            }
          >
            <div className={styles.previewStage}>
              <div
                ref={previewRef}
                className={`${styles.paper} ${styles.previewPaper}`}
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </Drawer>
        ) : null}

        <Modal
          title={
            <div className={styles.configTitle}>
              <span>显示配置</span>
              <small>{displayName} · 一口清档案</small>
            </div>
          }
          open={configOpen}
          onCancel={() => setConfigOpen(false)}
          onOk={() => setConfigOpen(false)}
          okText="完成"
          cancelText="取消"
          width={700}
          className={styles.configModal}
        >
          <div className={styles.configOverview}>
            <div>
              <span>当前显示</span>
              <strong>
                {
                  sectionOptions.filter((section) => checked(section.key))
                    .length
                }
                <small> / {sectionOptions.length} 大模块</small>
              </strong>
            </div>
            <div className={styles.configQuickActions}>
              <Button size="small" onClick={() => setCompanyConfig(allKeys)}>
                全部显示
              </Button>
              <Button size="small" onClick={() => setCompanyConfig([])}>
                全部隐藏
              </Button>
            </div>
          </div>
          <p className={styles.modalIntro}>
            按模块配置报告内容，子项可独立控制；本次设置仅作用于当前公司。
          </p>
          <Checkbox.Group
            className={styles.configGroup}
            value={enabled}
            onChange={setCompanyConfig}
          >
            {sectionOptions.map((section, sectionIndex) => (
              <div className={styles.configSection} key={section.key}>
                <div className={styles.configSectionHead}>
                  <span>{String(sectionIndex + 1).padStart(2, "0")}</span>
                  <Checkbox value={section.key}>
                    <b>{section.label}</b>
                  </Checkbox>
                  <small>
                    {
                      section.children.filter((_, childIndex) =>
                        checked(`${section.key}-${childIndex}`),
                      ).length
                    }
                    /{section.children.length}项
                  </small>
                </div>
                <div className={styles.configChildren}>
                  {section.children.map((child, childIndex) => (
                    <Checkbox
                      value={`${section.key}-${childIndex}`}
                      key={child}
                      disabled={!checked(section.key)}
                    >
                      {child}
                    </Checkbox>
                  ))}
                </div>
              </div>
            ))}
          </Checkbox.Group>
        </Modal>

        <Modal
          title="进入勋章管家题库"
          open={medalOpen}
          onCancel={() => setMedalOpen(false)}
          footer={[
            <Button key="stay" onClick={() => setMedalOpen(false)}>
              暂不进入
            </Button>,
            <Button key="enter" type="primary" onClick={enterMedalQuestionBank}>
              确认进入
            </Button>,
          ]}
          width={430}
          centered
        >
          <div className={styles.medalConfirm}>
            <span>
              <TrophyOutlined />
            </span>
            <div>
              <b>是否进入勋章管家的题库？</b>
              <p>进入后可查看与当前企业相关的题目和学习任务。</p>
            </div>
          </div>
        </Modal>
      </div>
    </ConfigProvider>
  );
}
