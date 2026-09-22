import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import BoardGovernanceShell from "./BoardGovernanceShell";
import { handbookMaterials as initialHandbookMaterials } from "./handbookData";
import { initialDutyPlans } from "./dutyPlanData";
import { initialDutyReports } from "./dutyReportData";
import { initialSuggestionTasks } from "./dutySuggestionData";
import { directors as initialDirectors } from "./mockData";
import { initialAppointmentCases } from "./appointmentData";
import { initialEvaluations } from "./evaluationData";
import {
  buildAnnualPlanConfirmationTask,
  initialAnnualPlanConfirmationTasks,
} from "./annualPlanConfirmationData";
import { resolveBoardGovernanceLocation, shellActiveKey } from "./stageRouting";
import MaterialTaskView from "./views/MaterialTaskView";
import PlanConfirmTaskView from "./views/PlanConfirmTaskView";
import DutyTaskManagerView from "./views/DutyTaskManagerView";
import RoleConfigView from "./views/RoleConfigView";
import TaskHomeView from "./views/TaskHomeView";
import PlanningMeetingView from "./views/PlanningMeetingView";
import AppointmentView from "./views/AppointmentView";
import PreparationView from "./views/PreparationView";
import ManagementView from "./views/ManagementView";
import DutyEvaluationStageView from "./views/DutyEvaluationStageView";
import CompanyMonitoringView from "./views/CompanyMonitoringView";
import EvaluationResourceView from "./views/EvaluationResourceView";
import MobileDirectorView from "./views/MobileDirectorView";

const validKeys = new Set([
  "home",
  "planning",
  "meetings",
  "appointment",
  "preparation",
  "management",
  "duty-evaluation",
  "companies",
  "monitoring",
  "evaluation",
  "resources",
  "mobile",
  "material-task",
  "plan-confirm-task",
  "duty-tasks",
  "roles",
]);

const taskAssigneeByDepartment = {
  "综合管理部-董办": "阮迪",
  "综合管理部-人力": "周航",
  股权运营部: "陈哲",
  投资部: "孙博",
};

const getNow = () =>
  new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date())
    .replaceAll("/", "-");

export default function BoardGovernancePage() {
  const location = useLocation();
  const resolved = resolveBoardGovernanceLocation(
    location.pathname,
    location.search,
  );
  const key = resolved.key;
  const activeKey = validKeys.has(key) ? key : "home";
  const [role, setRole] = useState("groupOffice");
  const [directorRecords, setDirectorRecords] = useState(initialDirectors);
  const [appointmentCases, setAppointmentCases] = useState(
    initialAppointmentCases,
  );
  const [evaluations, setEvaluations] = useState(initialEvaluations);
  const [handbookMaterials, setHandbookMaterials] = useState(
    initialHandbookMaterials,
  );
  const [dutyPlans, setDutyPlans] = useState(initialDutyPlans);
  const [annualPlanConfirmationTasks, setAnnualPlanConfirmationTasks] =
    useState(initialAnnualPlanConfirmationTasks);
  const [generatedDirectorNames, setGeneratedDirectorNames] = useState(() => [
    ...new Set([
      ...initialDutyPlans
        .filter((item) => item.taskStatus)
        .map((item) => item.directorName),
      ...initialDirectors
        .filter((item) => item.lifecycleStage === "management")
        .map((item) => item.name),
    ]),
  ]);
  const [dutyReports, setDutyReports] = useState(initialDutyReports);
  const [suggestionTasks, setSuggestionTasks] = useState(
    initialSuggestionTasks,
  );
  if (activeKey === "mobile") return <MobileDirectorView />;
  if (resolved.redirectTo) {
    return <Navigate to={resolved.redirectTo} replace />;
  }
  const submitMaterials = (materialFiles) => {
    const submittedAt = new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .format(new Date())
      .replaceAll("/", "-");
    setHandbookMaterials((current) =>
      current.map((item) =>
        materialFiles[item.id]
          ? {
              ...item,
              status: "已提交",
              submittedAt,
              files: materialFiles[item.id].map((file) => file.name),
            }
          : item,
      ),
    );
  };
  const createHandbookMaterial = (values) => {
    setHandbookMaterials((current) => [
      ...current,
      {
        ...values,
        id: `HB-${Date.now()}`,
        status: "待提交",
        taskStatus: "未发起",
      },
    ]);
  };
  const updateHandbookMaterial = (materialId, values) => {
    setHandbookMaterials((current) =>
      current.map((item) =>
        item.id === materialId ? { ...item, ...values } : item,
      ),
    );
  };
  const deleteHandbookMaterial = (materialId) => {
    setHandbookMaterials((current) =>
      current.filter((item) => item.id !== materialId),
    );
  };
  const requestMaterialUpdate = (materialIds) => {
    const requestedAt = getNow();
    setHandbookMaterials((current) =>
      current.map((item) =>
        materialIds.includes(item.id)
          ? {
              ...item,
              status: "待提交",
              taskStatus: "待办理",
              updateRequestedAt: requestedAt,
            }
          : item,
      ),
    );
  };
  const pushHandbook = (directorName) => {
    const pushedAt = getNow();
    setHandbookMaterials((current) =>
      current.map((item) => ({
        ...item,
        lastPushedTo: directorName,
        lastPushedAt: pushedAt,
      })),
    );
  };
  const createDutyPlan = (values) => {
    setDutyPlans((current) => [
      ...current,
      {
        ...values,
        id: `PLAN-${Date.now()}`,
        status: "草稿",
        confirmationNote: "",
        confirmedAt: "",
      },
    ]);
    setGeneratedDirectorNames((current) =>
      current.filter((name) => name !== values.directorName),
    );
  };
  const deleteDutyPlan = (planId) => {
    setDutyPlans((current) => current.filter((item) => item.id !== planId));
  };
  const submitDutyPlan = (planIds) => {
    const submittedPlanIds = new Set(
      Array.isArray(planIds) ? planIds : [planIds],
    );
    setDutyPlans((current) =>
      current.map((item) =>
        submittedPlanIds.has(item.id)
          ? { ...item, status: "已提交", submittedAt: getNow() }
          : item,
      ),
    );
  };
  const saveDutyPlanConfirmation = (planId, values, submit = false) => {
    const confirmedAt = submit
      ? new Intl.DateTimeFormat("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
          .format(new Date())
          .replaceAll("/", "-")
      : "";
    setDutyPlans((current) =>
      current.map((item) =>
        item.id === planId
          ? {
              ...item,
              ...values,
              status: submit ? "已完成" : item.status,
              confirmedAt: submit ? confirmedAt : item.confirmedAt,
            }
          : item,
      ),
    );
  };
  const generateDutyTasks = (directorName) => {
    setDutyPlans((current) =>
      current.map((item) =>
        item.directorName === directorName
          ? {
              ...item,
              taskStatus: item.taskStatus || "待执行",
              taskAssignee:
                item.taskAssignee ||
                taskAssigneeByDepartment[item.owner] ||
                item.confirmOwner,
            }
          : item,
      ),
    );
    setGeneratedDirectorNames((current) =>
      current.includes(directorName) ? current : [...current, directorName],
    );
    setDirectorRecords((current) =>
      current.map((item) =>
        item.name === directorName
          ? {
              ...item,
              lifecycleStage: "management",
              preparationStatus: "已完成",
              managementStatus: "执行中",
            }
          : item,
      ),
    );
  };
  const submitAnnualPlanReport = (director, report) => {
    const task = buildAnnualPlanConfirmationTask({
      director,
      report,
      submittedAt: getNow(),
    });
    setAnnualPlanConfirmationTasks((current) =>
      current.some((item) => item.directorId === director.id)
        ? current.map((item) => (item.directorId === director.id ? task : item))
        : [...current, task],
    );
  };
  const saveAnnualPlanConfirmation = (
    taskId,
    selectedRowIds,
    submit = false,
  ) => {
    setAnnualPlanConfirmationTasks((current) =>
      current.map((item) =>
        item.id === taskId
          ? {
              ...item,
              selectedRowIds,
              status: submit || item.status === "已完成" ? "已完成" : "办理中",
              completedAt: submit ? getNow() : item.completedAt,
            }
          : item,
      ),
    );
  };
  const completeDutyTask = (planId, values) => {
    setDutyPlans((current) =>
      current.map((item) =>
        item.id === planId
          ? {
              ...item,
              ...values,
              taskStatus: "已完成",
              taskCompletedAt: getNow(),
            }
          : item,
      ),
    );
    if (values.resultSuggestion?.trim()) {
      setSuggestionTasks((current) => {
        const suggestionId = `SUG-${planId}`;
        const exists = current.some((item) => item.id === suggestionId);
        if (exists) return current;
        const plan = dutyPlans.find((item) => item.id === planId);
        return [
          ...current,
          {
            id: suggestionId,
            directorName: plan?.directorName,
            type: "履职建议类",
            content: values.resultSuggestion,
            source: plan?.content,
            owner: plan?.owner,
            assignee: plan?.taskAssignee,
            deadline: values.actualDate || plan?.date,
            progress: 0,
            status: "待办理",
            handlingPlan: "",
            result: "",
            feedback: "",
            files: [],
          },
        ];
      });
    }
  };
  const saveSuggestionTask = (taskId, values, submit = false) => {
    setSuggestionTasks((current) =>
      current.map((item) =>
        item.id === taskId
          ? {
              ...item,
              ...values,
              status: submit ? "已完成" : "办理中",
              progress: submit ? 100 : values.progress,
              completedAt: submit ? getNow() : item.completedAt,
            }
          : item,
      ),
    );
  };
  const generateDutyReport = (director, completedPlans, values) => {
    const report = {
      id: `REPORT-${Date.now()}`,
      directorName: director.name,
      company: director.company,
      reportType: values.reportType,
      period: values.period,
      title: `${values.period}${director.name}履职写实报告`,
      status: "待完善",
      sourceCount: completedPlans.length,
      sourcePlanIds: completedPlans.map((item) => item.id),
      taskSnapshots: completedPlans.map((item) => ({
        id: item.id,
        content: item.content,
        type: item.type,
        workCategory: item.workCategory,
        actualDate: item.actualDate,
        evidenceNote: item.evidenceNote,
        completionSummary: item.completionSummary,
        target: item.target,
        supplementFiles: item.supplementFiles || [],
      })),
      generatedAt: getNow(),
      summary: `${director.name}在${values.period}围绕会议、培训和调研计划开展履职工作，系统已归集${completedPlans.length}条已确认履职记录。`,
      workHighlights: completedPlans
        .map(
          (item, index) =>
            `${index + 1}. ${item.content}\n实际完成日期：${item.actualDate || "—"}\n成果说明：${item.evidenceNote || "—"}\n完成情况：${item.completionSummary || item.target}`,
        )
        .join("\n"),
      suggestions:
        completedPlans
          .map((item) => item.resultSuggestion)
          .filter(Boolean)
          .join("\n") || "暂无补充意见建议。",
      files: completedPlans.flatMap((item) => item.supplementFiles || []),
    };
    setDutyReports((current) => [...current, report]);
    return report;
  };
  const saveDutyReport = (reportId, values, submit = false) => {
    setDutyReports((current) =>
      current.map((item) =>
        item.id === reportId
          ? {
              ...item,
              ...values,
              status: submit ? "待接收" : item.status,
              submittedAt: submit ? getNow() : item.submittedAt,
            }
          : item,
      ),
    );
  };
  const receiveDutyReport = (reportId) => {
    setDutyReports((current) =>
      current.map((item) =>
        item.id === reportId
          ? { ...item, status: "已接收", receivedAt: getNow() }
          : item,
      ),
    );
  };
  const registerAppointmentDirector = (item) => {
    setDirectorRecords((current) => {
      if (
        current.some(
          (row) => row.name === item.director || row.id === item.directorId,
        )
      ) {
        return current;
      }
      return [
        ...current,
        {
          id: item.directorId || `D-${Date.now()}`,
          name: item.director,
          role: item.position,
          company: item.company,
          term: "待维护",
          committee: "待配置",
          days: 0,
          completion: 0,
          report: "未开始",
          risk: "正常",
          lifecycleStage: "appointment",
          appointmentStatus: item.status || "待上传董事简历",
          preparationStatus: "未开始",
          managementStatus: "未开始",
          evaluationStatus: "未开始",
        },
      ];
    });
  };
  const completeAppointment = (item) => {
    setDirectorRecords((current) => {
      const existing = current.find(
        (row) => row.name === item.director || row.id === item.directorId,
      );
      if (existing) {
        return current.map((row) =>
          row.id === existing.id
            ? {
                ...row,
                appointmentStatus: "已完成",
                lifecycleStage:
                  row.lifecycleStage === "appointment"
                    ? "preparation"
                    : row.lifecycleStage,
                preparationStatus:
                  row.preparationStatus === "未开始"
                    ? "待补充"
                    : row.preparationStatus,
              }
            : row,
        );
      }
      return [
        ...current,
        {
          id: `D-${Date.now()}`,
          name: item.director,
          role: item.position,
          company: item.company,
          term: "待维护",
          committee: "待配置",
          days: 0,
          completion: 0,
          report: "未开始",
          risk: "正常",
          lifecycleStage: "preparation",
          appointmentStatus: "已完成",
          preparationStatus: "待补充",
          managementStatus: "未开始",
          evaluationStatus: "未开始",
        },
      ];
    });
  };
  const createEvaluation = (values) => {
    const next = {
      id: `EVA-${Date.now()}`,
      status: "评价中",
      snapshot: {
        completedPlanCount: dutyPlans.filter(
          (item) => item.taskStatus === "已完成",
        ).length,
        receivedReportCount: dutyReports.filter(
          (item) => item.status === "已接收",
        ).length,
        completedSuggestionCount: suggestionTasks.filter(
          (item) => item.status === "已完成",
        ).length,
      },
      ...values,
    };
    setEvaluations((current) => [next, ...current]);
    return next;
  };
  const views = {
    home: (
      <TaskHomeView
        role={role}
        appointmentCases={appointmentCases}
        handbookMaterials={handbookMaterials}
        dutyPlans={dutyPlans}
        annualPlanConfirmationTasks={annualPlanConfirmationTasks}
        generatedDirectorNames={generatedDirectorNames}
        suggestionTasks={suggestionTasks}
      />
    ),
    "material-task": (
      <MaterialTaskView
        materials={handbookMaterials}
        onSubmit={submitMaterials}
      />
    ),
    "plan-confirm-task": (
      <PlanConfirmTaskView
        plans={dutyPlans}
        onSave={saveDutyPlanConfirmation}
      />
    ),
    "duty-tasks": (
      <DutyTaskManagerView
        role={role}
        plans={dutyPlans}
        annualPlanConfirmationTasks={annualPlanConfirmationTasks}
        onSaveAnnualPlanConfirmation={saveAnnualPlanConfirmation}
        materials={handbookMaterials}
        onComplete={completeDutyTask}
        onSubmitMaterial={submitMaterials}
        onSavePlan={saveDutyPlanConfirmation}
        suggestionTasks={suggestionTasks}
        onSaveSuggestion={saveSuggestionTask}
      />
    ),
    roles: <RoleConfigView />,
    planning: <PlanningMeetingView mode="planning" />,
    meetings: <PlanningMeetingView mode="meetings" />,
    appointment: (
      <AppointmentView
        role={role}
        resource={resolved.resource}
        id={resolved.id}
        cases={appointmentCases}
        directorRecords={directorRecords}
        generatedDirectorNames={generatedDirectorNames}
        onCasesChange={setAppointmentCases}
        onCaseCompleted={completeAppointment}
        onIssueCreated={registerAppointmentDirector}
      />
    ),
    preparation: (
      <PreparationView
        resource={resolved.resource}
        id={resolved.id}
        directorRecords={directorRecords}
        materials={handbookMaterials}
        dutyPlans={dutyPlans}
        generatedDirectorNames={generatedDirectorNames}
        onCreateDutyPlan={createDutyPlan}
        onDeleteDutyPlan={deleteDutyPlan}
        onSubmitDutyPlan={submitDutyPlan}
        onGenerateDutyTasks={generateDutyTasks}
        onSubmitAnnualPlanReport={submitAnnualPlanReport}
        onCreateMaterial={createHandbookMaterial}
        onUpdateMaterial={updateHandbookMaterial}
        onDeleteMaterial={deleteHandbookMaterial}
        onRequestMaterialUpdate={requestMaterialUpdate}
        onPushHandbook={pushHandbook}
        onSavePlan={saveDutyPlanConfirmation}
      />
    ),
    management: (
      <ManagementView
        role={role}
        resource={resolved.resource}
        id={resolved.id}
        directorRecords={directorRecords}
        materials={handbookMaterials}
        dutyPlans={dutyPlans}
        dutyReports={dutyReports}
        suggestionTasks={suggestionTasks}
        generatedDirectorNames={generatedDirectorNames}
        onGenerateDutyReport={generateDutyReport}
        onSaveDutyReport={saveDutyReport}
        onReceiveDutyReport={receiveDutyReport}
      />
    ),
    "duty-evaluation": (
      <DutyEvaluationStageView
        resource={resolved.resource}
        id={resolved.id}
        directorRecords={directorRecords}
        dutyPlans={dutyPlans}
        dutyReports={dutyReports}
        suggestionTasks={suggestionTasks}
        generatedDirectorNames={generatedDirectorNames}
        evaluations={evaluations}
        onCreateEvaluation={createEvaluation}
      />
    ),
    companies: <CompanyMonitoringView mode="companies" />,
    monitoring: <CompanyMonitoringView mode="monitoring" />,
    evaluation: <EvaluationResourceView mode="evaluation" />,
    resources: <EvaluationResourceView mode="resources" />,
  };
  return (
    <BoardGovernanceShell
      activeKey={shellActiveKey(activeKey)}
      role={role}
      onRoleChange={setRole}
    >
      {views[activeKey]}
    </BoardGovernanceShell>
  );
}
