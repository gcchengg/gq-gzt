import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { SendOutlined } from "@ant-design/icons";
import TaskIssueDrawer from "@/components/TaskIssueDrawer";
import AppointmentFlow from "../DirectorView/components/AppointmentFlow";
import DirectorStageTable from "../DirectorStageTable";
import StageBlocked from "../StageBlocked";
import StageDetailDrawer from "../StageDetailDrawer";
import { PageHeader } from "../../components/PageKit";
import {
  directorStageDetailPath,
  filterDirectorsForStage,
} from "../../stageRouting";
import styles from "./index.module.less";

export default function AppointmentView({
  role,
  resource,
  id,
  cases,
  directorRecords,
  generatedDirectorNames,
  onCasesChange,
  onCaseCompleted,
  onIssueCreated,
}) {
  const navigate = useNavigate();
  const canIssueLetter = role === "groupOffice";
  const [openIssue, setOpenIssue] = useState(false);
  const visibleCases = useMemo(
    () =>
      role === "auditLegalDepartment"
        ? cases.filter((item) => item.status === "待完成工商变更")
        : cases,
    [cases, role],
  );
  const appointmentDirectors = useMemo(
    () =>
      visibleCases.map((item) => {
        const director = directorRecords.find(
          (record) =>
            record.id === item.directorId || record.name === item.director,
        );
        return {
          ...director,
          id: item.directorId || director?.id || item.id,
          name: item.director,
          role: item.position,
          company: item.company,
          term: director?.term || "待维护",
          lifecycleStage: "appointment",
          appointmentStatus: item.status,
          appointmentOwner: item.owner,
        };
      }),
    [visibleCases, directorRecords],
  );
  const current =
    resource === "case" ? visibleCases.find((item) => item.id === id) : null;
  const closeDetail = () => navigate("/boardGovernance/appointment");
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="DIRECTOR APPOINTMENT"
        title="董事聘任"
        subtitle="按董事完成简历准备、系统权限配置、工商变更等事项"
      />
      <DirectorStageTable
        directors={appointmentDirectors}
        defaultStage="appointment"
        generatedDirectorNames={generatedDirectorNames}
        filterDirectorsForStage={filterDirectorsForStage}
        extra={
          canIssueLetter ? (
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => setOpenIssue(true)}
            >
              下发董事推荐函
            </Button>
          ) : null
        }
        onViewDetail={(director) =>
          navigate(
            directorStageDetailPath("appointment", director, {
              cases: visibleCases,
            }),
          )
        }
      />
      <AppointmentFlow
        modalOnly
        canIssueLetter={canIssueLetter}
        autoOpenIssue={openIssue}
        onIssueLetterOpened={() => setOpenIssue(false)}
        cases={visibleCases}
        onCasesChange={onCasesChange}
        onIssueCreated={(nextCase) => {
          onIssueCreated?.(nextCase);
          navigate(`/boardGovernance/appointment/${nextCase.id}`);
        }}
        onCaseCompleted={onCaseCompleted}
      />
      <StageDetailDrawer
        open={resource === "case"}
        onClose={closeDetail}
        title={
          current ? `${current.director} · 聘任事项详情` : "未找到聘任案件"
        }
        subtitle={
          current
            ? `${current.company} · ${current.position || ""}`
            : "该聘任事项不存在或链接已失效。"
        }
      >
        {current ? (
          <AppointmentFlow
            variant="detail"
            embedded
            canIssueLetter={canIssueLetter}
            cases={visibleCases}
            onCasesChange={onCasesChange}
            selectedId={id}
            onCaseCompleted={onCaseCompleted}
          />
        ) : (
          <StageBlocked
            embedded
            title="未找到聘任案件"
            reason="该聘任事项不存在或链接已失效。"
            listTo="/boardGovernance/appointment"
            listLabel="关闭"
          />
        )}
      </StageDetailDrawer>
      {role === "groupOffice" ? (
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
