import categoryTreeResponse from "./mock/categoryTree.json";
import planItemsResponse from "./mock/planItems.json";
import planListResponse from "./mock/planList.json";
import taskByBizIdResponse from "./mock/tasksByBizId.json";
import usersResponse from "./mock/users.json";
import yearsResponse from "./mock/years.json";

const delay = (value, timeout = 120) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(value), timeout);
  });

let planList = planListResponse.data.map((item) => ({ ...item }));
let planItems = planItemsResponse.data.map((item) => ({ ...item }));

const reviewLevelText = {
  1000: "业务总监",
  2000: "分管领导",
  3000: "总办会",
};

const cloneResponse = (data) => ({
  code: 200,
  data: JSON.parse(JSON.stringify(data)),
  msg: "success",
});

const getMonthCountKey = (month) => {
  const keys = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  return keys[Number(month) - 1];
};

const getMonthUnsubmittedKey = (month) => `${getMonthCountKey(month)}Unsubmitted`;

const getItemMonth = (item = {}) => {
  if (item.month) return String(item.month);
  if (item.planLaunchDate) {
    const [, month] = String(item.planLaunchDate).split("-");
    return String(Number(month));
  }
  return "";
};

const normalizeCompletionRate = (value) => {
  if (value && typeof value === "object") {
    return Number(value.parsedValue ?? value.source ?? 0) || 0;
  }
  return Number(value || 0);
};

const findCategory = (id, nodes = categoryTreeResponse.data, parents = []) => {
  for (const node of nodes) {
    const nextParents = [...parents, node];
    if (node.id === id) return { node, parents };
    if (node.children?.length) {
      const found = findCategory(id, node.children, nextParents);
      if (found) return found;
    }
  }
  return null;
};

const hydratePlanTotals = () => {
  planList = planList.map((plan) => {
    const next = { ...plan };
    for (let month = 1; month <= 12; month += 1) {
      const key = getMonthCountKey(month);
      const unsubmittedKey = getMonthUnsubmittedKey(month);
      const matchedItems = planItems.filter(
        (item) => item.planId === plan.id && getItemMonth(item) === String(month),
      );
      next[key] = matchedItems.length || Number(plan[key] || 0);
      next[`hasUnreported${month}`] =
        Number(plan[unsubmittedKey] || 0) > 0 ||
        planItems.some(
        (item) =>
          item.planId === plan.id &&
          getItemMonth(item) === String(month) &&
          item.submitStatus === "0",
      );
    }
    next.total = Number(plan.total ?? 0) || Array.from({ length: 12 }, (_, index) => next[getMonthCountKey(index + 1)]).reduce(
      (sum, value) => sum + Number(value || 0),
      0,
    );
    const submitted = planItems.filter((item) => item.planId === plan.id && item.submitStatus === "1").length;
    next.completionRate = plan.completionRate == null ? (next.total ? submitted / next.total : 0) : normalizeCompletionRate(plan.completionRate);
    return next;
  });
};

export const currentUser = {
  name: "张明",
  loginName: "guohu001",
};

export const reviewLevelOptions = Object.entries(reviewLevelText).map(([value, label]) => ({
  value,
  label,
}));

export const getAllYears = async () => delay(cloneResponse(yearsResponse.data));

export const getTaskByBizId = async ({ bizId } = {}) =>
  delay(cloneResponse({ ...taskByBizIdResponse.data, bizId: bizId || taskByBizIdResponse.data.bizId }));

export const getUserOrgInfo = async ({ fullName = "" } = {}) => {
  const keyword = String(fullName || "").trim().toLowerCase();
  const data = usersResponse.data.filter((item) =>
    `${item.fullName}${item.email}${item.loginId}`.toLowerCase().includes(keyword),
  );
  return delay(cloneResponse(data));
};

export const getPlanList = async (params = {}) => {
  hydratePlanTotals();
  const data = planList.filter((item) => {
    const matchYear = params.year && item.year ? String(item.year) === String(params.year) : true;
    const matchCompany = params.shortForm ? item.shortForm?.includes(params.shortForm) : true;
    const matchCreateUser = params.bianZhiDutyUserName
      ? item.bianZhiDutyUserName?.includes(params.bianZhiDutyUserName)
      : true;
    const currentDutyUserName = params.currentDutyUserName?.value || params.currentDutyUserName || "";
    const matchCurrentUser = currentDutyUserName
      ? item.currentDutyUserId === currentDutyUserName || item.currentDutyUserName?.includes(currentDutyUserName)
      : true;
    return matchYear && matchCompany && matchCreateUser && matchCurrentUser;
  });
  return delay(cloneResponse(data));
};

export const getPlanItemList = async (params = {}) => {
  const filterItems = ({ usePlan = true, useMonth = true } = {}) =>
    planItems.filter((item) => {
      const matchPlan = usePlan && params.planId ? item.planId === params.planId : true;
      const matchMonth = useMonth && params.month ? getItemMonth(item) === String(params.month) : true;
      const matchLv1 = params.categoryLv1Id ? item.categoryLv1Id === params.categoryLv1Id : true;
      const matchLv2 = params.categoryLv2Id ? item.categoryLv2Id === params.categoryLv2Id : true;
      const matchTopic = params.topicName ? item.topicName?.includes(params.topicName) : true;
      const matchCreateUser = params.bianZhiDutyUserName
        ? item.bianZhiDutyUserName?.includes(params.bianZhiDutyUserName)
        : true;
      const matchSubmitUser = params.topicSubmitUserName
        ? item.topicSubmitUserName?.includes(params.topicSubmitUserName)
        : true;
      const matchBod = params.bodFlag ? item.bodFlag === params.bodFlag : true;
      const matchBos = params.bosFlag ? item.bosFlag === params.bosFlag : true;
      const matchSh = params.shFlag ? item.shFlag === params.shFlag : true;
      const matchReview = params.reviewLevel ? item.reviewLevel === params.reviewLevel : true;
      const matchStatus = params.submitStatus ? item.submitStatus === params.submitStatus : true;
      return (
        matchPlan &&
        matchMonth &&
        matchLv1 &&
        matchLv2 &&
        matchTopic &&
        matchCreateUser &&
        matchSubmitUser &&
        matchBod &&
        matchBos &&
        matchSh &&
        matchReview &&
        matchStatus
      );
    });

  let data = filterItems();
  if (!data.length) data = filterItems({ usePlan: false });
  if (!data.length) data = filterItems({ usePlan: false, useMonth: false });

  data = data.map((item) => ({
    ...item,
    planId: params.planId || item.planId,
    month: getItemMonth(item),
  }));

  return delay(cloneResponse(data));
};

export const getPlanItemListStrict = async (params = {}) => {
  const data = planItems.filter((item) => {
    const matchPlan = params.planId ? item.planId === params.planId : true;
    const matchMonth = params.month ? getItemMonth(item) === String(params.month) : true;
    const matchLv1 = params.categoryLv1Id ? item.categoryLv1Id === params.categoryLv1Id : true;
    const matchLv2 = params.categoryLv2Id ? item.categoryLv2Id === params.categoryLv2Id : true;
    const matchTopic = params.topicName ? item.topicName?.includes(params.topicName) : true;
    const matchCreateUser = params.bianZhiDutyUserName
      ? item.bianZhiDutyUserName?.includes(params.bianZhiDutyUserName)
      : true;
    const matchSubmitUser = params.topicSubmitUserName
      ? item.topicSubmitUserName?.includes(params.topicSubmitUserName)
      : true;
    const matchBod = params.bodFlag ? item.bodFlag === params.bodFlag : true;
    const matchBos = params.bosFlag ? item.bosFlag === params.bosFlag : true;
    const matchSh = params.shFlag ? item.shFlag === params.shFlag : true;
    const matchReview = params.reviewLevel ? item.reviewLevel === params.reviewLevel : true;
    const matchStatus = params.submitStatus ? item.submitStatus === params.submitStatus : true;
    return (
      matchPlan &&
      matchMonth &&
      matchLv1 &&
      matchLv2 &&
      matchTopic &&
      matchCreateUser &&
      matchSubmitUser &&
      matchBod &&
      matchBos &&
      matchSh &&
      matchReview &&
      matchStatus
    );
  });
  return delay(cloneResponse(data));
};

export const topicSanAdd = async ({ level, parentId } = {}) => {
  if (Number(level) === 1) {
    return delay(cloneResponse(categoryTreeResponse.data.map(({ id, name }) => ({ id, name }))));
  }

  const found = findCategory(parentId);
  const data = found?.node?.children?.map(({ id, name }) => ({ id, name })) || [];
  return delay(cloneResponse(data));
};

export const getByCategoryLv3Id = async ({ id } = {}) => {
  const found = findCategory(id);
  return delay(cloneResponse(found?.node?.reviewLevel || ""));
};

export const getInfoById = async ({ id } = {}) =>
  delay(cloneResponse(planItems.find((item) => item.id === id) || null));

export const savePlanItem = async (params = {}) => {
  const foundLv1 = findCategory(params.categoryLv1Id);
  const foundLv2 = findCategory(params.categoryLv2Id);
  const foundLv3 = findCategory(params.categoryLv3Id);
  const nextItem = {
    ...params,
    id: params.id || `item-${Date.now()}`,
    month: params.month || getItemMonth(params),
    categoryLv1Name: foundLv1?.node?.name || "",
    categoryLv2Name: foundLv2?.node?.name || "",
    categoryLv3Name: foundLv3?.node?.name || "",
  };

  const existed = planItems.some((item) => item.id === nextItem.id);
  planItems = existed
    ? planItems.map((item) => (item.id === nextItem.id ? { ...item, ...nextItem } : item))
    : [{ ...nextItem }, ...planItems];
  hydratePlanTotals();
  return delay(cloneResponse(nextItem));
};

export const removeById = async ({ id } = {}) => {
  planItems = planItems.filter((item) => item.id !== id);
  hydratePlanTotals();
  return delay(cloneResponse(true));
};

export const closeTask = async ({ bizId } = {}) =>
  delay(cloneResponse({ bizId: bizId || "mock-biz-id", status: "closed" }));

export const apiEndpointMap = [
  {
    name: "getTaskByBizId",
    method: "GET",
    url: "/uwone-ei/eoSanhuiAnnualPlanTask/getTaskByBizId",
    mock: "src/pages/threeMeetingPlan/mock/tasksByBizId.json",
  },
  {
    name: "getAllYears",
    method: "GET",
    url: "/uwone-ei/eoSanhuiAnnualPlanTask/getAllYears",
    mock: "src/pages/threeMeetingPlan/mock/years.json",
  },
  {
    name: "getPlanList",
    method: "POST",
    url: "/uwone-ei/eoSanhuiAnnualPlan/getList",
    mock: "src/pages/threeMeetingPlan/mock/planList.json",
  },
  {
    name: "getPlanItemList",
    method: "POST",
    url: "/uwone-ei/eoSanhuiAnnualPlanItem/getList",
    mock: "src/pages/threeMeetingPlan/mock/planItems.json",
  },
  {
    name: "savePlanItem",
    method: "POST",
    url: "/uwone-ei/eoSanhuiAnnualPlanItem/save",
    mock: "src/pages/threeMeetingPlan/mock/planItems.json",
  },
  {
    name: "getInfoById",
    method: "GET",
    url: "/uwone-ei/eoSanhuiAnnualPlanItem/getInfoById",
    mock: "src/pages/threeMeetingPlan/mock/planItems.json",
  },
  {
    name: "removeById",
    method: "GET",
    url: "/uwone-ei/eoSanhuiAnnualPlanItem/removeById",
    mock: "src/pages/threeMeetingPlan/mock/planItems.json",
  },
  {
    name: "closeTask",
    method: "GET",
    url: "/uwone-ei/eoSanhuiAnnualPlanTask/closeTask",
    mock: "src/pages/threeMeetingPlan/mock/tasksByBizId.json",
  },
  {
    name: "topicSanAdd",
    method: "GET/POST",
    url: "/uwone-ei/sanhuiCategory/treeByLevel",
    mock: "src/pages/threeMeetingPlan/mock/categoryTree.json",
  },
  {
    name: "getByCategoryLv3Id",
    method: "GET",
    url: "/uwone-ei/sanhuiTopicModel/getByCategoryLv3Id",
    mock: "src/pages/threeMeetingPlan/mock/categoryTree.json",
  },
  {
    name: "getUserOrgInfo",
    method: "GET/POST",
    url: "api.orgManage.getUserOrgInfo",
    mock: "src/pages/threeMeetingPlan/mock/users.json",
  },
];
