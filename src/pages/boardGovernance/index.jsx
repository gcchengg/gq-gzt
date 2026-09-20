import { useState } from "react";
import { useLocation } from "react-router-dom";
import BoardGovernanceShell from "./BoardGovernanceShell";
import { handbookMaterials as initialHandbookMaterials } from "./handbookData";
import { initialDutyPlans } from "./dutyPlanData";
import { initialDutyReports } from "./dutyReportData";
import { initialSuggestionTasks } from "./dutySuggestionData";
import MaterialTaskView from "./views/MaterialTaskView";
import PlanConfirmTaskView from "./views/PlanConfirmTaskView";
import DutyTaskManagerView from "./views/DutyTaskManagerView";
import RoleConfigView from "./views/RoleConfigView";
import TaskHomeView from "./views/TaskHomeView";
import PlanningMeetingView from "./views/PlanningMeetingView";
import DirectorView from "./views/DirectorView";
import CompanyMonitoringView from "./views/CompanyMonitoringView";
import EvaluationResourceView from "./views/EvaluationResourceView";
import MobileDirectorView from "./views/MobileDirectorView";

const validKeys = new Set([
  "home",
  "planning",
  "meetings",
  "directors",
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
  const pathParts = location.pathname.split("/").filter(Boolean);
  const key = pathParts[1] || "home";
  const activeKey = validKeys.has(key) ? key : "home";
  const [role, setRole] = useState("office");
  const [handbookMaterials, setHandbookMaterials] = useState(
    initialHandbookMaterials,
  );
  const [dutyPlans, setDutyPlans] = useState(initialDutyPlans);
  const [generatedDirectorNames, setGeneratedDirectorNames] = useState(() => [
    ...new Set(
      initialDutyPlans
        .filter((item) => item.taskStatus)
        .map((item) => item.directorName),
    ),
  ]);
  const [dutyReports, setDutyReports] = useState(initialDutyReports);
  const [suggestionTasks, setSuggestionTasks] = useState(
    initialSuggestionTasks,
  );
  if (activeKey === "mobile") return <MobileDirectorView />;
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
        status: "待确认",
        confirmationNote: "",
        confirmedAt: "",
      },
    ]);
    setGeneratedDirectorNames((current) =>
      current.filter((name) => name !== values.directorName),
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
      generatedAt: getNow(),
      summary: `${director.name}在${values.period}围绕会议、培训和调研计划开展履职工作，系统已归集${completedPlans.length}条已确认履职记录。`,
      workHighlights: completedPlans
        .map(
          (item, index) =>
            `${index + 1}. ${item.content}：${item.completionSummary || item.target}`,
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
  if (activeKey === "home") {
    return (
      <TaskHomeView
        handbookMaterials={handbookMaterials}
        dutyPlans={dutyPlans}
        generatedDirectorNames={generatedDirectorNames}
        suggestionTasks={suggestionTasks}
      />
    );
  }
  const views = {
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
        plans={dutyPlans}
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
    directors: (
      <DirectorView
        role={role}
        materials={handbookMaterials}
        dutyPlans={dutyPlans}
        onCreateDutyPlan={createDutyPlan}
        onGenerateDutyTasks={generateDutyTasks}
        generatedDirectorNames={generatedDirectorNames}
        dutyReports={dutyReports}
        onGenerateDutyReport={generateDutyReport}
        onSaveDutyReport={saveDutyReport}
        onReceiveDutyReport={receiveDutyReport}
        suggestionTasks={suggestionTasks}
        onCreateMaterial={createHandbookMaterial}
        onUpdateMaterial={updateHandbookMaterial}
        onDeleteMaterial={deleteHandbookMaterial}
        onRequestMaterialUpdate={requestMaterialUpdate}
        onPushHandbook={pushHandbook}
      />
    ),
    companies: <CompanyMonitoringView mode="companies" />,
    monitoring: <CompanyMonitoringView mode="monitoring" />,
    evaluation: <EvaluationResourceView mode="evaluation" />,
    resources: <EvaluationResourceView mode="resources" />,
  };
  return (
    <BoardGovernanceShell
      activeKey={
        ["material-task", "plan-confirm-task"].includes(activeKey)
          ? "home"
          : activeKey
      }
      role={role}
      onRoleChange={setRole}
    >
      {views[activeKey]}
    </BoardGovernanceShell>
  );
}
