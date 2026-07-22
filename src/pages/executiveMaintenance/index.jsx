import { useMemo, useState } from "react";
import {
  CheckCircleFilled,
  DownOutlined,
  FileTextOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UpOutlined,
} from "@ant-design/icons";
import {
  Button,
  ConfigProvider,
  Empty,
  Input,
  message,
  Modal,
  Tag,
} from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  executiveProfiles,
  generatedAnalysisByExecutive,
  monthlyReports,
} from "./data";
import styles from "./index.module.less";

const { TextArea } = Input;

const initialActiveReports = Object.fromEntries(
  executiveProfiles.map((person) => [
    person.id,
    monthlyReports.find((report) => report.executiveId === person.id)?.id || "",
  ]),
);

export default function ExecutiveMaintenance() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [selectedExecutiveId, setSelectedExecutiveId] = useState(
    executiveProfiles[0]?.id || "",
  );
  const [activeReportByExecutive, setActiveReportByExecutive] =
    useState(initialActiveReports);
  const [analysisByExecutive, setAnalysisByExecutive] = useState({});
  const [analyzingExecutiveId, setAnalyzingExecutiveId] = useState("");
  const [confirmedByExecutive, setConfirmedByExecutive] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const selectedExecutive = useMemo(
    () =>
      executiveProfiles.find((person) => person.id === selectedExecutiveId) ||
      executiveProfiles[0],
    [selectedExecutiveId],
  );
  const selectedReports = useMemo(
    () =>
      monthlyReports.filter(
        (report) => report.executiveId === selectedExecutive?.id,
      ),
    [selectedExecutive?.id],
  );
  const analysis = analysisByExecutive[selectedExecutive?.id] || "";
  const confirmed = Boolean(confirmedByExecutive[selectedExecutive?.id]);
  const confirmedCount =
    Object.values(confirmedByExecutive).filter(Boolean).length;
  const characterCount = useMemo(
    () => analysis.replace(/\s/g, "").length,
    [analysis],
  );
  const maintenancePeriod = searchParams.get("period") || "半年度";
  const maintenanceYear =
    searchParams.get("year") || selectedExecutive?.year || "2026";
  const totalReports = monthlyReports.length;

  const updateAnalysis = (value) => {
    setAnalysisByExecutive((current) => ({
      ...current,
      [selectedExecutive.id]: value,
    }));
    setConfirmedByExecutive((current) => ({
      ...current,
      [selectedExecutive.id]: false,
    }));
  };

  const handleAnalyze = () => {
    const executiveId = selectedExecutive.id;
    setAnalyzingExecutiveId(executiveId);
    setConfirmedByExecutive((current) => ({
      ...current,
      [executiveId]: false,
    }));
    window.setTimeout(() => {
      setAnalysisByExecutive((current) => ({
        ...current,
        [executiveId]:
          generatedAnalysisByExecutive[executiveId] ||
          `截至${maintenanceYear}年6月，${selectedExecutive.name}已完成阶段性履职报告。`,
      }));
      setAnalyzingExecutiveId("");
      messageApi.success(
        `${selectedExecutive.name}的AI履职分析已生成，可继续修改`,
      );
    }, 650);
  };

  const handleConfirm = () => {
    if (!analysis.trim()) {
      messageApi.warning(`请先生成或填写${selectedExecutive.name}的履职分析`);
      return;
    }
    setConfirmOpen(true);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#274f9d",
          borderRadius: 10,
          colorText: "#1f2a3d",
          fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
        },
      }}
    >
      {messageContextHolder}
      <div className={styles.page}>
        <div className={styles.content}>
          <header className={styles.pageHeader}>
            <button
              className={styles.backButton}
              type="button"
              onClick={() => navigate("/executiveMaintenanceList")}
            >
              <span>←</span> 返回维护列表
            </button>
            <div className={styles.titleBlock}>
              <h1>外派高管履职分析</h1>
              <p>按人员复核月度履职记录，分别形成履职分析并确认归档</p>
            </div>
            <div className={styles.taskStamp}>
              <SafetyCertificateOutlined />
              <span>维护周期</span>
              <strong>
                {maintenanceYear}年 · {maintenancePeriod}
              </strong>
            </div>
          </header>

          <section
            className={styles.overviewCard}
            aria-label="可比公司维护任务总览"
          >
            <div className={styles.overviewCompany}>
              <span>任职单位</span>
              <strong>{selectedExecutive?.fullCompany}</strong>
              <small>外派高管履职维护档案</small>
            </div>
            <div className={styles.overviewFacts}>
              <div>
                <span>委派高管</span>
                <strong>{executiveProfiles.length} 人</strong>
              </div>
              <div>
                <span>月报记录</span>
                <strong>{totalReports} 份</strong>
              </div>
              <div>
                <span>人员确认进度</span>
                <strong>
                  {confirmedCount} / {executiveProfiles.length}
                </strong>
              </div>
              <div>
                <span>任务状态</span>
                <strong
                  className={
                    confirmedCount === executiveProfiles.length
                      ? styles.successText
                      : styles.processingText
                  }
                >
                  {confirmedCount === executiveProfiles.length
                    ? "已完成"
                    : "维护中"}
                </strong>
              </div>
            </div>
          </section>

          <div className={styles.workspaceGrid}>
            <aside className={styles.rosterCard}>
              <div className={styles.rosterHeader}>
                <div>
                  <h2>人员档案</h2>
                  <p>选择人员后查看对应履职档案</p>
                </div>
                <Tag icon={<TeamOutlined />} className={styles.companyTag}>
                  共 {executiveProfiles.length} 人
                </Tag>
              </div>
              <div className={styles.personGrid}>
                {executiveProfiles.map((person) => {
                  const selected = person.id === selectedExecutive?.id;
                  const personConfirmed = Boolean(
                    confirmedByExecutive[person.id],
                  );
                  return (
                    <button
                      className={`${styles.personCard} ${selected ? styles.personSelected : ""}`}
                      type="button"
                      aria-pressed={selected}
                      key={person.id}
                      onClick={() => setSelectedExecutiveId(person.id)}
                    >
                      <span className={styles.personAvatar}>
                        {person.name.slice(0, 1)}
                      </span>
                      <span className={styles.personMain}>
                        <strong>{person.name}</strong>
                        <small>{person.position}</small>
                        <em>任期 {person.tenure}</em>
                      </span>
                      <span className={styles.personProgress}>
                        <small>月报 {person.reportProgress}</small>
                        <Tag color={personConfirmed ? "success" : "processing"}>
                          {personConfirmed ? "已确认" : "待确认"}
                        </Tag>
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className={styles.personWorkspace}>
              <section className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2>{selectedExecutive?.name} · 月度履职记录</h2>
                    <p>
                      {selectedExecutive?.position} · 月报{" "}
                      {selectedExecutive?.reportProgress}
                    </p>
                  </div>
                  <Tag className={styles.companyTag}>
                    {maintenanceYear}年 · {maintenancePeriod}
                  </Tag>
                </div>

                {selectedReports.length ? (
                  <div className={styles.reportList}>
                    {selectedReports.map((report) => {
                      const expanded =
                        activeReportByExecutive[selectedExecutive.id] ===
                        report.id;
                      return (
                        <article
                          className={`${styles.reportItem} ${expanded ? styles.expanded : ""}`}
                          key={report.id}
                        >
                          <button
                            className={styles.reportTrigger}
                            type="button"
                            aria-expanded={expanded}
                            onClick={() =>
                              setActiveReportByExecutive((current) => ({
                                ...current,
                                [selectedExecutive.id]: expanded
                                  ? ""
                                  : report.id,
                              }))
                            }
                          >
                            <div className={styles.monthBadge}>
                              <strong>{report.month}</strong>
                              <span>月</span>
                            </div>
                            <div className={styles.reportSummary}>
                              <div className={styles.reportTitle}>
                                {maintenanceYear}年{report.month}月工作报告
                              </div>
                              <div className={styles.reportMeta}>
                                任职单位工作 {report.companyWork.length} 项 ·
                                助力集团 {report.groupSupport.length} 项 ·{" "}
                                {report.attachments.length} 份材料
                              </div>
                            </div>
                            <div className={styles.status}>
                              <CheckCircleFilled /> {report.status}
                            </div>
                            <time>{report.submittedAt}</time>
                            <span className={styles.expandIcon}>
                              {expanded ? <UpOutlined /> : <DownOutlined />}
                            </span>
                          </button>

                          {expanded ? (
                            <div className={styles.reportDetail}>
                              <div className={styles.basicInfo}>
                                <span>任职单位基本情况</span>
                                <p>{report.basicInfo}</p>
                              </div>
                              <DetailGroup
                                title="任职单位工作完成情况（Top3）"
                                items={report.companyWork}
                                showContribution
                              />
                              <DetailGroup
                                title="助力集团公司发展情况（Top3）"
                                items={report.groupSupport}
                              />
                              <div className={styles.detailGrid}>
                                <InfoBlock
                                  label="工作中存在的问题"
                                  value={report.mainProblem}
                                />
                                <InfoBlock
                                  label="下月工作计划"
                                  value={report.nextPlan}
                                />
                                <InfoBlock
                                  label="其他需报告事项"
                                  value={report.otherReport}
                                />
                                <InfoBlock
                                  label="专项管理建议"
                                  value={report.advice.join("；")}
                                />
                              </div>
                              <div className={styles.attachments}>
                                <span>补充材料</span>
                                {report.attachments.map((file) => (
                                  <Tag icon={<FileTextOutlined />} key={file}>
                                    {file}
                                  </Tag>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <Empty
                    description={`${selectedExecutive?.name}暂无月度履职记录`}
                  />
                )}
              </section>

              <section className={styles.analysisCard}>
                <div className={styles.analysisHeader}>
                  <div className={styles.aiMark}>
                    <RobotOutlined />
                  </div>
                  <div>
                    <h2>{selectedExecutive?.name} · 履职综合分析</h2>
                    <p>
                      仅分析当前人员的月度工作完成情况与助力集团发展情况，切换人员后内容独立保存。
                    </p>
                  </div>
                  <Button
                    type="primary"
                    icon={<RobotOutlined />}
                    loading={analyzingExecutiveId === selectedExecutive?.id}
                    onClick={handleAnalyze}
                  >
                    {analysis ? "重新分析" : "AI智能分析"}
                  </Button>
                </div>
                <div className={styles.analysisEditor}>
                  <TextArea
                    value={analysis}
                    onChange={(event) => updateAnalysis(event.target.value)}
                    rows={7}
                    placeholder={`点击“AI智能分析”生成${selectedExecutive?.name}的履职分析，生成后可修改。`}
                    maxLength={500}
                  />
                  <div className={styles.editorFooter}>
                    <span>
                      {analysis
                        ? `${selectedExecutive?.name}的分析已生成，可直接编辑`
                        : "尚未生成分析"}
                    </span>
                    <span
                      className={characterCount > 260 ? styles.countWarn : ""}
                    >
                      {characterCount} / 约200字
                    </span>
                  </div>
                </div>
              </section>

              <footer className={styles.actionBar}>
                <div className={styles.confirmHint}>
                  {confirmed ? (
                    <>
                      <CheckCircleFilled /> {selectedExecutive?.name}已确认
                    </>
                  ) : (
                    `请核对${selectedExecutive?.name}的月报与分析内容`
                  )}
                  <span>
                    人员总进度 {confirmedCount} / {executiveProfiles.length}
                  </span>
                </div>
                <Button
                  size="large"
                  type="primary"
                  disabled={confirmed}
                  onClick={handleConfirm}
                >
                  {confirmed ? "已确认" : `确认${selectedExecutive?.name}`}
                </Button>
              </footer>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title={`确认${selectedExecutive?.name}的履职维护结果？`}
        open={confirmOpen}
        okText="确认"
        cancelText="取消"
        onCancel={() => setConfirmOpen(false)}
        onOk={() => {
          setConfirmedByExecutive((current) => ({
            ...current,
            [selectedExecutive.id]: true,
          }));
          setConfirmOpen(false);
          messageApi.success(`${selectedExecutive.name}的履职维护结果已确认`);
        }}
      >
        <p>
          确认后将保存该人员的月度履职复核记录及当前分析内容，不影响其他委派高管。
        </p>
      </Modal>
    </ConfigProvider>
  );
}

function DetailGroup({ title, items, showContribution = false }) {
  return (
    <section className={styles.detailGroup}>
      <h3>{title}</h3>
      <div className={styles.workList}>
        {items.map((item, index) => (
          <div className={styles.workItem} key={`${item.subject}-${index}`}>
            <span className={styles.workIndex}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <strong>{item.subject}</strong>
              <p>{item.content}</p>
            </div>
            {showContribution ? (
              <Tag className={styles.roleTag}>{item.contribution}</Tag>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div className={styles.infoBlock}>
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}
