const stageRedirects = {
  appointment: "/boardGovernance/appointment",
  preparation: "/boardGovernance/preparation",
  management: "/boardGovernance/management",
  evaluation: "/boardGovernance/duty-evaluation",
};

function searchParams(search = "") {
  return new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
}

export function resolveBoardGovernanceLocation(pathname, search = "") {
  const parts = pathname.split("/").filter(Boolean);
  const key = parts[1] || "home";
  const rest = parts.slice(2);
  const query = searchParams(search);

  if (key === "directors") {
    return {
      key: "directors",
      resource: "list",
      id: null,
      redirectTo:
        stageRedirects[query.get("stage")] || stageRedirects.appointment,
    };
  }

  if (key === "plan-confirm-task") {
    const planId = query.get("planId");
    return {
      key: "plan-confirm-task",
      resource: "plan",
      id: planId,
      redirectTo: planId
        ? `/boardGovernance/preparation/plans/${planId}`
        : "/boardGovernance/preparation",
    };
  }

  if (key === "appointment") {
    return {
      key,
      resource: rest[0] ? "case" : "list",
      id: rest[0] || null,
      redirectTo: null,
    };
  }

  if (key === "preparation") {
    if (rest[0] === "materials" && rest[1]) {
      return { key, resource: "material", id: rest[1], redirectTo: null };
    }
    if (rest[0] === "directors" && rest[1]) {
      return { key, resource: "director", id: rest[1], redirectTo: null };
    }
    if (rest[0] === "plans" && rest[1]) {
      return { key, resource: "plan", id: rest[1], redirectTo: null };
    }
    return { key, resource: "list", id: null, redirectTo: null };
  }

  if (key === "management") {
    return {
      key,
      resource: rest[0] ? "director" : "list",
      id: rest[0] || null,
      redirectTo: null,
    };
  }

  if (key === "duty-evaluation") {
    if (!rest[0]) {
      return { key, resource: "list", id: null, redirectTo: null };
    }
    return {
      key,
      resource: rest[0].startsWith("EVA-") ? "evaluation" : "director",
      id: rest[0],
      redirectTo: null,
    };
  }

  return { key, resource: "list", id: null, redirectTo: null };
}

export function shellActiveKey(key) {
  if (key === "plan-confirm-task") return "preparation";
  if (key === "material-task") return "duty-tasks";
  return key;
}

export function canOpenPreparationDirector(director) {
  return director?.appointmentStatus === "已完成";
}

export function canOpenManagementDirector(
  director,
  generatedDirectorNames = [],
) {
  return generatedDirectorNames.includes(director?.name);
}

export function eligibleEvaluationDirectors(
  directors = [],
  generatedDirectorNames = [],
) {
  return directors.filter((director) =>
    canOpenManagementDirector(director, generatedDirectorNames),
  );
}

export const directorLifecycleStages = [
  { key: "appointment", label: "董事聘任" },
  { key: "preparation", label: "履职准备" },
  { key: "management", label: "履职管理" },
  { key: "evaluation", label: "履职评价" },
];

export function directorStageLabel(director) {
  return (
    directorLifecycleStages.find(
      (item) => item.key === director?.lifecycleStage,
    )?.label || "履职管理"
  );
}

export function directorTableColumnTitles(stage) {
  if (stage === "appointment") {
    return [
      "董事信息",
      "董事类型",
      "负责人",
      "任职企业",
      "当前阶段",
      "查看详情",
    ];
  }
  const statusLabel = directorLifecycleStages.find(
    (item) => item.key === stage,
  )?.label;
  return [
    "董事信息",
    "任职企业",
    "任期",
    "当前阶段",
    ...(statusLabel
      ? [statusLabel]
      : directorLifecycleStages.map((item) => item.label)),
    "风险状态",
    "查看详情",
  ];
}

export function directorMatchesKeyword(director, keyword = "") {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) return true;
  return [
    director.id,
    director.name,
    director.role,
    director.company,
    director.appointmentOwner,
  ].some((value) =>
    String(value || "")
      .toLowerCase()
      .includes(normalized),
  );
}

export function directorMatchesStageFilter(
  director,
  stage,
  generatedDirectorNames = [],
) {
  if (!stage || stage === "all") return true;
  if (stage === "evaluation") {
    return canOpenManagementDirector(director, generatedDirectorNames);
  }
  return director.lifecycleStage === stage;
}

export function filterDirectorsForStage(
  directors = [],
  { keyword = "", stage = "all", generatedDirectorNames = [] } = {},
) {
  return directors.filter(
    (director) =>
      directorMatchesKeyword(director, keyword) &&
      directorMatchesStageFilter(director, stage, generatedDirectorNames),
  );
}

export function directorStageDetailPath(stage, director, { cases = [] } = {}) {
  if (!director) return null;
  if (stage === "appointment") {
    const matched =
      cases.find((item) => item.directorId === director.id) ||
      cases.find((item) => item.director === director.name);
    return `/boardGovernance/appointment/${matched?.id || `AP-${director.id}`}`;
  }
  if (stage === "preparation") {
    return `/boardGovernance/preparation/directors/${director.id}`;
  }
  if (stage === "management") {
    return `/boardGovernance/management/${director.id}`;
  }
  if (stage === "evaluation") {
    return `/boardGovernance/duty-evaluation/${director.id}`;
  }
  return null;
}
