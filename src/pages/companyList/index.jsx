import {
  CheckOutlined,
  FileTextOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  Button,
  Checkbox,
  ConfigProvider,
  Empty,
  Input,
  Modal,
  Table,
  Tag,
} from "antd";
import { useMemo, useState } from "react";
import companyList from "@/pages/companyReview/list.json";
import companyDetail from "@/pages/companyReview/长春一东.json";
import SourceMark from "./components/SourceMark";
import {
  comparisonRows,
  financeRows,
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
const source = {
  basic: "参股公司信息管理-基础信息",
  product: "参股公司信息管理-产品信息",
  later: "需要后续补充",
  shareholder: "参股公司信息管理-股东信息",
  director: "参股公司信息管理-董监事信息",
  finance: "投后工作报告-财务指标",
  financeCalc: "根据投后工作报告-财务指标表格计算得知",
  operation: "投后工作报告-经营情况",
  topic: "三会管理工作台-议题交办",
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

export default function CompanyList() {
  const companies = useMemo(() => {
    const rows = companyList.data?.list || [];
    return [...rows].sort(
      (a, b) =>
        Number(b.shortForm === "长春一东") - Number(a.shortForm === "长春一东"),
    );
  }, []);
  const [selectedId, setSelectedId] = useState(companies[0]?.id);
  const [keyword, setKeyword] = useState("");
  const [configOpen, setConfigOpen] = useState(false);
  const [configs, setConfigs] = useState({});
  const selected =
    companies.find((item) => item.id === selectedId) || companies[0];
  const isYidong = selected?.shortForm === "长春一东";
  const detail = isYidong ? companyDetail.data.companyHis : selected;
  const shares = isYidong ? companyDetail.data.companyShsHis : null;
  const enabled = configs[selectedId] || allKeys;
  const checked = (key) => enabled.includes(key);
  const visibleCompanies = companies.filter((item) =>
    `${item.companyName}${item.shortForm}`.includes(keyword.trim()),
  );
  const products =
    detail?.productList
      ?.slice(0, 5)
      .map((item) => item.prodName)
      .join("、") || "商用车离合器总成、液压举升器";
  const displayName =
    detail?.shortForm || selected?.shortForm || selected?.companyName;
  const setCompanyConfig = (values) =>
    setConfigs((current) => ({ ...current, [selectedId]: values }));

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
      <div className={styles.page}>
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
                    {item.shortForm || item.companyName}
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
                    />
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

        <main className={styles.workspace}>
          <div className={styles.paper}>
            <header className={styles.documentHeader}>
              <div className={styles.kicker}>
                <FileTextOutlined /> 一企一档 · 一口清
              </div>
              <h1>{displayName}</h1>
              <div className={styles.metaGrid}>
                <div>
                  <span>公司简称</span>
                  <b>{displayName}</b>
                </div>
                <div>
                  <span>管户</span>
                  <b>
                    {detail?.dutyUserName || selected?.dutyUserName || "丛圣元"}
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
                    国内商用车离合器行业规模约135亿元，年增6%-8%；国六升级、老旧货车淘汰支撑传统配套，混动商用车电控离合器增量显著，但纯电重卡长期挤压传统产品。行业加速国产替代，技术向轻量化、电控化迭代。
                  </p>
                  <h4>看市场</h4>
                  <p>
                    市场分整车配套与售后两大板块。长春一东依托一汽系主机配套，国内重卡定点资源稳固，外贸出口稳步扩容，但售后业务体量偏小。
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
                    铁流营收为长春一东3倍，盈利规模大幅领先；长春一东净利率仅1.49%，规模效应不足，产品线相对单一。
                  </p>
                  <h4>看自己</h4>
                  <p>
                    <b>优势：</b>
                    背靠两大央企集团，重卡配套壁垒高，离合器25%市占率、液压翻转机构35%市占率行业第一。
                    <b>短板：</b>
                    业务聚焦离合器及液压机构，售后与海外渠道布局滞后。
                  </p>
                  <div className={styles.conclusion}>
                    <b>整体结论</b>
                    客户壁垒突出、重卡配套地位稳固，但规模、多元布局、盈利能力弱于对标企业。需加大售后市场开拓，丰富AMT、电控离合器产品线。
                  </div>
                </div>
              </Sub>
            </Block>

            <Block id="finance" title="二、财务状况“清”" checked={checked}>
              <Sub id="finance-0" title="1. 本期经营完成" checked={checked}>
                <p>
                  截至2026年5月，
                  <S source={source.finance}>
                    {displayName}完成营业收入35805.11万元
                  </S>
                  ，<S source={source.finance}>预算完成度46.72%</S>，
                  <S source={source.finance}>实现归母净利润920.40万元</S>，
                  <S source={source.finance}>预算完成度68.48%</S>
                  。2026年度营业收入预算
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
                  dataSource={financeRows}
                  bordered
                  pagination={false}
                  size="small"
                  scroll={{ x: 760 }}
                />
              </Sub>
              <Sub id="finance-2" title="3. 分红情况" checked={checked}>
                <p>
                  {displayName}本年度
                  <S source={source.operation}>完成分红93.8万元</S>，
                  <S source={source.operation}>历史累计分红458万元</S>。
                </p>
              </Sub>
            </Block>

            <Block id="governance" title="三、治理行权“清”" checked={checked}>
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
                    截至2026年6月，共有1名委派高管，为副总经理（财务负责人）高英。高英围绕提质增效、运营管理、风险控制开展履职工作，并在股东减持、产业协同等方面发挥桥梁作用
                  </S>
                  。
                </p>
              </Sub>
              <Sub id="governance-2" title="3. 委派董事履职" checked={checked}>
                <p>
                  <S source="委派董事月报复核">
                    {displayName}
                    共2名委派董事，为副董事长李秀柱、董事马振来。截至2026年6月，委派董事完成4次董事会31项议题的审议
                  </S>
                  。
                </p>
              </Sub>
            </Block>

            <Block
              id="synergy"
              title="四、产业协同“清”"
              checked={checked}
              titleSource={source.later}
            >
              <Sub id="synergy-0" title="产业协同情况" checked={checked}>
                <p>
                  <b>战略定位：</b>集团公司商用车传动系统零部件的重要供应方。
                  <br />
                  <b>集团内客户及产品：</b>
                  客户为一汽解放，供应商用车离合器总成及液压举升器。
                  <br />
                  <b>协同项目：</b>
                  重卡离合器占一汽解放本部65%、解放青岛38%供应份额；AMT车型10档、12档离合器项目按计划推进。
                </p>
              </Sub>
            </Block>
            <Block
              id="risk"
              title="五、风险隐患“清”"
              checked={checked}
              titleSource={source.later}
            >
              <Sub id="risk-0" title="风险与整改" checked={checked}>
                <div className={styles.twoCol}>
                  <p>
                    <b>审计及整改情况</b>
                    {displayName}暂无审计及专项整改事项
                  </p>
                  <p>
                    <b>风险情况</b>
                    {displayName}暂无风险上报
                  </p>
                </div>
              </Sub>
            </Block>
            <Block
              id="strategy"
              title="六、管理策略“清”"
              checked={checked}
              titleSource="初始化导入，待一企一策上线后，同步抓取数据"
            >
              <Sub id="strategy-0" title="管理策略" checked={checked}>
                <div className={styles.strategyGrid}>
                  <p>
                    <b>产业协同</b>
                    延续双方良好的市场化合作机制，在AMT、限扭减振器等新能源商用车领域继续合作。
                  </p>
                  <p>
                    <b>经营管理</b>
                    紧盯总部利润，通过压降管理费用、汇率套期、专项清收等方式提升归母净利润。
                  </p>
                  <p>
                    <b>股权经营</b>
                    谋划股权经营方案，优化股权运营和记账方式，为股权增利储备机会。
                  </p>
                </div>
              </Sub>
            </Block>
            <footer>一企一档 · 数据更新至 2026年6月</footer>
          </div>
        </main>

        <Modal
          title={`${displayName} · 显示配置`}
          open={configOpen}
          onCancel={() => setConfigOpen(false)}
          onOk={() => setConfigOpen(false)}
          okText="完成"
          cancelText="取消"
          width={560}
        >
          <p className={styles.modalIntro}>
            选择需要在该公司“一口清”档案中展示的模块。配置仅作用于当前公司。
          </p>
          <Checkbox.Group
            className={styles.configGroup}
            value={enabled}
            onChange={setCompanyConfig}
          >
            {sectionOptions.map((section) => (
              <div className={styles.configSection} key={section.key}>
                <Checkbox value={section.key}>
                  <b>{section.label}</b>
                </Checkbox>
                <div>
                  {section.children.map((child, i) => (
                    <Checkbox
                      value={`${section.key}-${i}`}
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
      </div>
    </ConfigProvider>
  );
}
