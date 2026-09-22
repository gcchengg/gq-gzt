import test from "node:test";
import assert from "node:assert/strict";
import {
  canOpenManagementDirector,
  canOpenPreparationDirector,
  directorStageDetailPath,
  directorTableColumnTitles,
  eligibleEvaluationDirectors,
  filterDirectorsForStage,
  resolveBoardGovernanceLocation,
  shellActiveKey,
} from "./stageRouting.js";

test("redirects the old directors entry to stage list pages", () => {
  assert.equal(
    resolveBoardGovernanceLocation("/boardGovernance/directors").redirectTo,
    "/boardGovernance/appointment",
  );
  assert.equal(
    resolveBoardGovernanceLocation(
      "/boardGovernance/directors",
      "stage=preparation",
    ).redirectTo,
    "/boardGovernance/preparation",
  );
  assert.equal(
    resolveBoardGovernanceLocation(
      "/boardGovernance/directors",
      "stage=management",
    ).redirectTo,
    "/boardGovernance/management",
  );
  assert.equal(
    resolveBoardGovernanceLocation(
      "/boardGovernance/directors",
      "stage=evaluation",
    ).redirectTo,
    "/boardGovernance/duty-evaluation",
  );
});

test("parses independent list and detail routes for each stage", () => {
  assert.deepEqual(
    resolveBoardGovernanceLocation("/boardGovernance/appointment/AP-2026-007"),
    {
      key: "appointment",
      resource: "case",
      id: "AP-2026-007",
      redirectTo: null,
    },
  );
  assert.deepEqual(
    resolveBoardGovernanceLocation(
      "/boardGovernance/preparation/materials/HB-01",
    ),
    {
      key: "preparation",
      resource: "material",
      id: "HB-01",
      redirectTo: null,
    },
  );
  assert.deepEqual(
    resolveBoardGovernanceLocation(
      "/boardGovernance/preparation/directors/D-01",
    ),
    {
      key: "preparation",
      resource: "director",
      id: "D-01",
      redirectTo: null,
    },
  );
  assert.deepEqual(
    resolveBoardGovernanceLocation(
      "/boardGovernance/preparation/plans/PLAN-001",
    ),
    {
      key: "preparation",
      resource: "plan",
      id: "PLAN-001",
      redirectTo: null,
    },
  );
  assert.deepEqual(
    resolveBoardGovernanceLocation("/boardGovernance/management/D-01"),
    {
      key: "management",
      resource: "director",
      id: "D-01",
      redirectTo: null,
    },
  );
  assert.deepEqual(
    resolveBoardGovernanceLocation(
      "/boardGovernance/duty-evaluation/EVA-2026-001",
    ),
    {
      key: "duty-evaluation",
      resource: "evaluation",
      id: "EVA-2026-001",
      redirectTo: null,
    },
  );
  assert.deepEqual(
    resolveBoardGovernanceLocation("/boardGovernance/duty-evaluation/D-01"),
    {
      key: "duty-evaluation",
      resource: "director",
      id: "D-01",
      redirectTo: null,
    },
  );
});

test("redirects the old plan-confirm-task URL onto the plan detail page", () => {
  assert.equal(
    resolveBoardGovernanceLocation(
      "/boardGovernance/plan-confirm-task",
      "planId=PLAN-001",
    ).redirectTo,
    "/boardGovernance/preparation/plans/PLAN-001",
  );
});

test("keeps nested stage routes highlighted on the matching sidebar item", () => {
  assert.equal(shellActiveKey("appointment"), "appointment");
  assert.equal(shellActiveKey("preparation"), "preparation");
  assert.equal(shellActiveKey("management"), "management");
  assert.equal(shellActiveKey("duty-evaluation"), "duty-evaluation");
  assert.equal(shellActiveKey("plan-confirm-task"), "preparation");
  assert.equal(shellActiveKey("material-task"), "duty-tasks");
  assert.equal(shellActiveKey("duty-tasks"), "duty-tasks");
});

test("blocks later-stage director details until the previous stage is finished", () => {
  const appointmentDirector = {
    name: "周明轩",
    appointmentStatus: "待完成工商变更",
  };
  const preparedDirector = {
    name: "李晨光",
    appointmentStatus: "已完成",
  };
  const generatedNames = ["张铁斌", "何向东", "王珂"];
  assert.equal(canOpenPreparationDirector(appointmentDirector), false);
  assert.equal(canOpenPreparationDirector(preparedDirector), true);
  assert.equal(
    canOpenManagementDirector(preparedDirector, generatedNames),
    false,
  );
  assert.equal(
    canOpenManagementDirector({ name: "张铁斌" }, generatedNames),
    true,
  );
});

test("evaluation batches can only include directors who already entered management", () => {
  const directors = [
    { id: "D-05", name: "陈思远", appointmentStatus: "待上传董事简历" },
    { id: "D-02", name: "李晨光", appointmentStatus: "已完成" },
    { id: "D-01", name: "张铁斌", appointmentStatus: "已完成" },
  ];
  const names = eligibleEvaluationDirectors(directors, ["张铁斌"]);
  assert.deepEqual(
    names.map((item) => item.id),
    ["D-01"],
  );
});

test("filters the shared director roster by keyword and current stage", () => {
  const directors = [
    {
      id: "D-01",
      name: "张铁斌",
      role: "外部董事召集人",
      company: "一汽股权",
      lifecycleStage: "management",
    },
    {
      id: "D-02",
      name: "李晨光",
      role: "专职外部董事",
      company: "一汽股权",
      lifecycleStage: "preparation",
    },
    {
      id: "D-05",
      name: "陈思远",
      role: "专职外部董事",
      company: "旗新动力科技",
      lifecycleStage: "appointment",
    },
  ];
  assert.deepEqual(
    filterDirectorsForStage(directors, { stage: "appointment" }).map(
      (item) => item.id,
    ),
    ["D-05"],
  );
  assert.deepEqual(
    filterDirectorsForStage(directors, { stage: "preparation" }).map(
      (item) => item.id,
    ),
    ["D-02"],
  );
  assert.deepEqual(
    filterDirectorsForStage(directors, { stage: "management" }).map(
      (item) => item.id,
    ),
    ["D-01"],
  );
  assert.deepEqual(
    filterDirectorsForStage(directors, {
      stage: "evaluation",
      generatedDirectorNames: ["张铁斌"],
    }).map((item) => item.id),
    ["D-01"],
  );
  assert.deepEqual(
    filterDirectorsForStage(directors, {
      keyword: "一汽股权",
      stage: "all",
    }).map((item) => item.id),
    ["D-01", "D-02"],
  );
});

test("maps a director row to the current stage detail path", () => {
  const director = { id: "D-05", name: "陈思远" };
  const cases = [{ id: "AP-D-05", directorId: "D-05", director: "陈思远" }];
  assert.equal(
    directorStageDetailPath("appointment", director, { cases }),
    "/boardGovernance/appointment/AP-D-05",
  );
  assert.equal(
    directorStageDetailPath("preparation", director),
    "/boardGovernance/preparation/directors/D-05",
  );
  assert.equal(
    directorStageDetailPath("management", director),
    "/boardGovernance/management/D-05",
  );
  assert.equal(
    directorStageDetailPath("evaluation", director),
    "/boardGovernance/duty-evaluation/D-05",
  );
});

test("each stage table only shows that stage's status column", () => {
  const appointmentTitles = directorTableColumnTitles("appointment");
  for (const label of [
    "董事信息",
    "董事类型",
    "负责人",
    "任职企业",
    "当前阶段",
    "查看详情",
  ]) {
    assert.equal(appointmentTitles.includes(label), true);
  }
  assert.equal(appointmentTitles.includes("董事聘任"), false);
  assert.equal(appointmentTitles.includes("风险状态"), false);

  const shared = [
    "董事信息",
    "任职企业",
    "任期",
    "当前阶段",
    "风险状态",
    "查看详情",
  ];
  const otherStatuses = {
    preparation: ["董事聘任", "履职管理", "履职评价"],
    management: ["董事聘任", "履职准备", "履职评价"],
    evaluation: ["董事聘任", "履职准备", "履职管理"],
  };
  const ownStatus = {
    preparation: "履职准备",
    management: "履职管理",
    evaluation: "履职评价",
  };
  for (const [stage, hidden] of Object.entries(otherStatuses)) {
    const titles = directorTableColumnTitles(stage);
    for (const label of shared) assert.equal(titles.includes(label), true);
    assert.equal(titles.includes(ownStatus[stage]), true);
    for (const label of hidden) assert.equal(titles.includes(label), false);
  }
});
