import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import TaskIssueDrawer from "@/components/TaskIssueDrawer";
import {
  DutyManagement,
  EventDetailDrawer,
  buildManagementDemoPlans,
  buildManagementDemoReports,
} from "../DirectorView";
import DirectorStageTable from "../DirectorStageTable";
import StageBlocked from "../StageBlocked";
import StageDetailDrawer from "../StageDetailDrawer";
import { PageHeader } from "../../components/PageKit";
import {
  canOpenManagementDirector,
  directorStageDetailPath,
  filterDirectorsForStage,
} from "../../stageRouting";
import styles from "./index.module.less";

const currentDirectorName = "张铁斌";

export default function ManagementView({
  role,
  resource,
  id,
  directorRecords,
  materials,
  dutyPlans,
  dutyReports,
  generatedDirectorNames,
  onGenerateDutyReport,
  onSaveDutyReport,
  onReceiveDutyReport,
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const requestedReportType = searchParams.get("reportType");
  const [tab, setTab] = useState(
    requestedTab === "suggestions" ? "overview" : requestedTab || "overview",
  );
  const [event, setEvent] = useState(null);
  useEffect(() => {
    setTab(
      requestedTab === "suggestions" ? "overview" : requestedTab || "overview",
    );
  }, [requestedTab, id]);
  const scopedDirectors =
    role === "director"
      ? directorRecords.filter((item) => item.name === currentDirectorName)
      : directorRecords;
  const director =
    resource === "director"
      ? scopedDirectors.find((item) => item.id === id)
      : null;
  const canOpen = canOpenManagementDirector(director, generatedDirectorNames);
  const visiblePlans = dutyPlans.filter(
    (item) => item.directorName === director?.name,
  );
  const visibleReports = dutyReports.filter(
    (item) => item.directorName === director?.name,
  );
  const managementPlans = visiblePlans.length
    ? visiblePlans
    : buildManagementDemoPlans(director);
  const managementReports = visibleReports.length
    ? visibleReports
    : buildManagementDemoReports(director, managementPlans);

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="DUTY MANAGEMENT"
        title="履职管理"
        subtitle="跟踪已生成履职任务的董事：任务、写实、建议与成果报告"
      />
      <DirectorStageTable
        directors={scopedDirectors}
        defaultStage="management"
        generatedDirectorNames={generatedDirectorNames}
        filterDirectorsForStage={filterDirectorsForStage}
        onViewDetail={(next) =>
          navigate(directorStageDetailPath("management", next))
        }
      />
      <StageDetailDrawer
        open={resource === "director"}
        onClose={() => {
          setEvent(null);
          setTab("overview");
          navigate("/boardGovernance/management");
        }}
        title={director ? `${director.name} · 履职管理` : "未找到董事"}
        subtitle={
          director
            ? `${director.company} · ${director.role}`
            : "该董事不存在或链接已失效。"
        }
      >
        {director && canOpen ? (
          <>
            <div className={styles.suggestionLink}>
              <Link
                to={`/boardGovernance/duty-suggestions?directorName=${encodeURIComponent(director.name)}`}
              >
                查看{director.name}的履职建议
              </Link>
            </div>
            <DutyManagement
              compact
              director={director}
              setDirector={() => {}}
              tab={tab}
              reportTypeFilter={requestedReportType}
              setTab={setTab}
              onEvent={setEvent}
              dutyPlans={managementPlans}
              materials={materials}
              dutyReports={managementReports}
              onGenerateDutyReport={onGenerateDutyReport}
              onSaveDutyReport={onSaveDutyReport}
              onReceiveDutyReport={onReceiveDutyReport}
            />
            <EventDetailDrawer event={event} onClose={() => setEvent(null)} />
          </>
        ) : (
          <StageBlocked
            embedded
            title={director ? "尚未生成履职任务" : "未找到董事"}
            reason={
              director
                ? `${director.name} 还没有生成履职任务，不能进入履职管理详情。`
                : "该董事不存在或链接已失效。"
            }
            listTo="/boardGovernance/management"
            listLabel="关闭"
            nextTo={
              director
                ? `/boardGovernance/preparation/directors/${director.id}`
                : undefined
            }
            nextLabel="去履职准备"
          />
        )}
      </StageDetailDrawer>
      {role === "director" ? (
        <TaskIssueDrawer
          zIndex={12120}
          title="任务浮窗"
          defaultTaskType="500"
          onSubmit={(payload) => {
            console.log(payload);
          }}
        />
      ) : null}
    </div>
  );
}
