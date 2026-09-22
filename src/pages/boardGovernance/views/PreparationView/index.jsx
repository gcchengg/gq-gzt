import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PreparationWorkspace } from "../DirectorView";
import DirectorStageTable from "../DirectorStageTable";
import MaterialHistoryDrawer from "../DirectorView/components/MaterialHistoryDrawer";
import PlanConfirmTaskView from "../PlanConfirmTaskView";
import StageBlocked from "../StageBlocked";
import StageDetailDrawer from "../StageDetailDrawer";
import { PageHeader } from "../../components/PageKit";
import {
  canOpenPreparationDirector,
  directorStageDetailPath,
  filterDirectorsForStage,
} from "../../stageRouting";
import styles from "./index.module.less";

export default function PreparationView({
  resource,
  id,
  directorRecords,
  materials,
  dutyPlans,
  generatedDirectorNames,
  onCreateDutyPlan,
  onDeleteDutyPlan,
  onSubmitDutyPlan,
  onGenerateDutyTasks,
  onSubmitAnnualPlanReport,
  onCreateMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
  onRequestMaterialUpdate,
  onPushHandbook,
  onSavePlan,
}) {
  const navigate = useNavigate();
  const [materialId, setMaterialId] = useState(null);
  const workspaceProps = {
    materials,
    dutyPlans,
    onCreateDutyPlan,
    onDeleteDutyPlan,
    onSubmitDutyPlan,
    onGenerateDutyTasks,
    onSubmitAnnualPlanReport,
    generatedDirectorNames,
    onCreateMaterial,
    onUpdateMaterial,
    onDeleteMaterial,
    onRequestMaterialUpdate,
    onPushHandbook,
  };
  const selectedDirector =
    resource === "director"
      ? directorRecords.find((item) => item.id === id)
      : null;
  const canOpen = canOpenPreparationDirector(selectedDirector);
  const routeMaterial =
    resource === "material" ? materials.find((item) => item.id === id) : null;
  const localMaterial = materials.find((item) => item.id === materialId);
  const historyMaterial = routeMaterial || localMaterial;

  if (resource === "plan") {
    return (
      <PlanConfirmTaskView
        plans={dutyPlans}
        onSave={onSavePlan}
        planId={id}
        backTo="/boardGovernance/preparation"
      />
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="DUTY PREPARATION"
        title="履职准备"
        subtitle="为已完成聘任的董事办理手册、年度计划，确认后生成履职任务"
      />
      <DirectorStageTable
        directors={directorRecords}
        defaultStage="preparation"
        generatedDirectorNames={generatedDirectorNames}
        filterDirectorsForStage={filterDirectorsForStage}
        onViewDetail={(director) =>
          navigate(directorStageDetailPath("preparation", director))
        }
      />
      <StageDetailDrawer
        open={resource === "director"}
        onClose={() => navigate("/boardGovernance/preparation")}
        title={
          selectedDirector
            ? `${selectedDirector.name} · 履职准备`
            : "未找到董事"
        }
        subtitle={
          selectedDirector
            ? `${selectedDirector.company} · ${selectedDirector.role}`
            : "该董事不存在或链接已失效。"
        }
      >
        {selectedDirector && canOpen ? (
          <PreparationWorkspace
            compact
            embedded
            director={selectedDirector}
            setDirector={() => {}}
            onViewMaterial={(row) => setMaterialId(row.id)}
            {...workspaceProps}
          />
        ) : (
          <StageBlocked
            embedded
            title={selectedDirector ? "尚未完成董事聘任" : "未找到董事"}
            reason={
              selectedDirector
                ? `${selectedDirector.name} 的聘任尚未完成，不能进入履职准备详情。`
                : "该董事不存在或链接已失效。"
            }
            listTo="/boardGovernance/preparation"
            listLabel="关闭"
            nextTo={
              selectedDirector ? "/boardGovernance/appointment" : undefined
            }
            nextLabel="去董事聘任"
          />
        )}
      </StageDetailDrawer>
      <MaterialHistoryDrawer
        material={historyMaterial}
        open={!!historyMaterial}
        onClose={() => {
          setMaterialId(null);
          if (resource === "material") {
            navigate("/boardGovernance/preparation");
          }
        }}
      />
    </div>
  );
}
