const delay = (data, ms = 180) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(data), ms);
  });

const mockRows = [
  {
    id: "req-001",
    shortForm: "启明信息",
    companyName: "启明信息技术股份有限公司",
    companyId: "company-001",
    positionCategory: "director",
    positionCode: "director",
    userName: "张明",
    selType: "2000",
    selStatus: "2000",
    submitStatus: "0",
    meetingFlag: "1",
  },
  {
    id: "req-001-supervisor",
    reqId: "req-001",
    shortForm: "启明信息",
    companyName: "启明信息技术股份有限公司",
    companyId: "company-001",
    positionCategory: "supervisor",
    positionCode: "supervisor",
    userName: "李娜",
    selType: "4000",
    selStatus: "2000",
    submitStatus: "0",
    meetingFlag: "1",
  },
  {
    id: "req-002",
    shortForm: "富奥股份",
    companyName: "富奥汽车零部件股份有限公司",
    companyId: "company-002",
    positionCategory: "executive",
    positionCode: "generalManager",
    userName: "王磊",
    selType: "3000",
    selStatus: "3000",
    submitStatus: "0",
    meetingFlag: "0",
  },
  {
    id: "req-003",
    shortForm: "一汽富维",
    companyName: "长春一汽富维汽车零部件股份有限公司",
    companyId: "company-003",
    positionCategory: "director",
    positionCode: "chairman",
    userName: "赵敏",
    selType: "5000",
    selStatus: "9999",
    submitStatus: "0",
    meetingFlag: "1",
  },
  {
    id: "req-004",
    shortForm: "一汽解放",
    companyName: "一汽解放集团股份有限公司",
    companyId: "company-004",
    positionCategory: "director",
    positionCode: "director",
    userName: "刘洋",
    selType: "2000",
    selStatus: "2000",
    submitStatus: "0",
    meetingFlag: "1",
  },
  {
    id: "req-005",
    shortForm: "一汽奔腾",
    companyName: "一汽奔腾汽车股份有限公司",
    companyId: "company-005",
    positionCategory: "supervisor",
    positionCode: "supervisor",
    userName: "周倩",
    selType: "4000",
    selStatus: "2000",
    submitStatus: "0",
    meetingFlag: "1",
  },
  {
    id: "req-006",
    shortForm: "富维安道拓",
    companyName: "长春富维安道拓汽车饰件系统有限公司",
    companyId: "company-006",
    positionCategory: "executive",
    positionCode: "generalManager",
    userName: "孙浩",
    selType: "2000",
    selStatus: "2000",
    submitStatus: "0",
    meetingFlag: "1",
  },
  {
    id: "req-007",
    shortForm: "一汽财务",
    companyName: "一汽财务有限公司",
    companyId: "company-007",
    positionCategory: "director",
    positionCode: "chairman",
    userName: "陈静",
    selType: "3000",
    selStatus: "2000",
    submitStatus: "0",
    meetingFlag: "1",
  },
  {
    id: "req-008",
    shortForm: "一汽模具",
    companyName: "一汽模具制造有限公司",
    companyId: "company-008",
    positionCategory: "supervisor",
    positionCode: "supervisor",
    userName: "高峰",
    selType: "2000",
    selStatus: "2000",
    submitStatus: "1",
    meetingFlag: "1",
  },
];

const makeSelection = (row) => ({
  id: row.id,
  companyId: row.companyId,
  coSupervisorId: `${row.id}-current`,
  positionCategory: row.positionCategory,
  positionCode: row.positionCode,
  expectConfigDate: "2026-07-20",
  selType: row.selType,
  currentSupervisor: {
    userName: row.userName,
    positionCategory: row.positionCategory,
    positionCode: row.positionCode,
    tenureStartDate: "2024-01-01",
    tenureEndDate: "2027-12-31",
  },
  suggestSupervisor: {
    fullName: row.userName,
    age: 42,
    gender: "1",
    graduation: "吉林大学",
    major: "工商管理",
    education: "硕士",
    currEmployer: `${row.companyName} 管理人员`,
    politicalAffil: "中共党员",
    inGroupFlag: "1",
    files: [],
  },
});

const detailStore = new Map();

function createDetail(id) {
  const first =
    mockRows.find((row) => row.id === id || row.reqId === id) || mockRows[0];
  const groupedRows = mockRows.filter(
    (row) =>
      row.id === first.id || row.reqId === first.id || row.id === first.reqId,
  );
  const selectionList = (groupedRows.length ? groupedRows : [first]).map(
    makeSelection,
  );

  return {
    ...first,
    id: first.reqId || first.id,
    reqOrgName: "股权管理部",
    reqOrg: "equity-management",
    status: "0",
    selBackgroud:
      "根据参股公司治理需要，拟开展董监高人选推荐及推荐函下发工作。",
    backgroud: "",
    recommendPlan: "",
    decisionItem: "",
    submitStatus: first.submitStatus || "1",
    meetingFlag: first.meetingFlag || (first.selType === "3000" ? "0" : "1"),
    selectionList,
    lor:
      first.selStatus === "9999"
        ? {
            docNo: "一汽股权投资函〔2026〕18号",
            title: `关于${first.userName}任职的函`,
            content: `${first.companyName}:\n\t根据工作需要，经研究决定下发推荐函。`,
            signCompany: "一汽股权投资（天津）有限公司",
            signDate: "2026-07-09",
            issueDate: "2026-07-09",
            processInstanceId: "mock-process-001",
            issueFiles: [],
          }
        : null,
  };
}

const getDetail = (id) => {
  const key = id || "req-001";
  if (!detailStore.has(key)) {
    detailStore.set(key, createDetail(key));
  }
  return detailStore.get(key);
};

export async function getCompanySupervisorPageMock(params = {}) {
  const currentPage = params.currentPage || params.current || 1;
  const pageSize = params.pageSize || 10;
  const filtered = mockRows.filter((row) => {
    const shortFormMatched = params.shortForm
      ? row.shortForm.includes(params.shortForm)
      : true;
    const categoryMatched = params.positionCategory
      ? row.positionCategory === params.positionCategory
      : true;
    const positionMatched = params.positionCode
      ? row.positionCode === params.positionCode
      : true;
    return shortFormMatched && categoryMatched && positionMatched;
  });

  return delay({
    code: 200,
    data: {
      list: filtered.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
      ),
      pageNum: currentPage,
      pageSize,
      total: filtered.length,
    },
  });
}

export async function getInfoMock(id) {
  return delay({ code: 200, data: getDetail(id) });
}

export async function saveCompanyMock(params = {}) {
  const key = params.id || "req-001";
  const submitStatus = params.submitStatus ?? "0";
  mockRows.forEach((row) => {
    if (row.id === key || row.reqId === key || row.id === params.reqId) {
      row.submitStatus = submitStatus;
      row.meetingFlag = params.meetingFlag || row.meetingFlag;
      if (params.selStatus) {
        row.selStatus = params.selStatus;
      }
    }
  });
  detailStore.set(key, {
    ...getDetail(key),
    ...params,
    submitStatus,
    status: params.isSubmit ? "1" : params.status || "0",
  });
  return delay({ code: 200, data: detailStore.get(key) });
}

export async function saveRecommendLetterMock(params = {}) {
  const detail = getDetail(params.reqId);
  detailStore.set(params.reqId, {
    ...detail,
    selStatus: params.isSubmit === "1" ? "9999" : detail.selStatus,
    lor: {
      ...(detail.lor || {}),
      ...params,
      processInstanceId:
        params.isSubmit === "1"
          ? "mock-process-001"
          : detail.lor?.processInstanceId,
      issueFiles: detail.lor?.issueFiles || [],
    },
  });
  return delay({ code: 200, data: detailStore.get(params.reqId) });
}

export async function getCompanySupervisorListMock() {
  return delay({
    code: 200,
    data: mockRows.map((row) => ({
      id: `${row.id}-current`,
      userName: row.userName,
      positionCode: row.positionCode,
    })),
  });
}

export async function getCandidateInfoMock(params = {}) {
  return delay({
    code: 200,
    data: {
      name: params.loginName || "候选人",
      age: 39,
      gender: "1",
      graduation: "吉林大学",
      major: "管理科学与工程",
      education: "硕士研究生",
      currEmployer: "一汽股权投资（天津）有限公司",
      politicalAffil: "中共党员",
    },
  });
}
