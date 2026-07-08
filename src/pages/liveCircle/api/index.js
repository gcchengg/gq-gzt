import businessProcessOptionResponse from "../mock/businessProcessOption.json";
import companyDetailResponse from "../mock/companyDetail.json";
import companyInfoDetailResponse from "../mock/companyInfoDetail.json";
import companyListResponse from "../mock/companyList.json";
import mgtInfoResponse from "../mock/mgtInfo.json";
import projectDetailResponse from "../mock/projectDetail.json";

const clone = (value) => JSON.parse(JSON.stringify(value));
const ok = (response) => Promise.resolve(clone(response));

function getPayload(response) {
  return response?.data ?? response;
}

function getList(payload) {
  if (Array.isArray(payload)) return payload;
  const list =
    payload?.records ||
    payload?.list ||
    payload?.rows ||
    payload?.data ||
    payload?.result ||
    payload?.items ||
    [];

  return Array.isArray(list) ? list : [];
}

function getPageValue(payload, keys, fallback) {
  const source = payload || {};
  const key = keys.find((item) => source[item] !== undefined && source[item] !== null);
  return key ? source[key] : fallback;
}

function normalizeCompanyItem(item, index) {
  const rawId =
    item.id ||
    item.companyId ||
    item.companyCode ||
    item.bizId ||
    item.usciCode ||
    `company-${index + 1}`;
  const id = String(rawId);

  return {
    ...item,
    id,
    companyName: String(
      item.companyName || item.shortForm || item.name || item.companyShortName || id,
    ),
    orgName: item.orgName || item.orgFullName || item.manageOrgName || item.investEntityName,
  };
}

function filterCompanyList(params = {}) {
  const keyword = String(params.companyName || "").trim();
  const currentPage = Number(params.currentPage || 1);
  const pageSize = Number(params.pageSize || 10);
  const payload = getPayload(companyListResponse);
  const source = getList(payload).map(normalizeCompanyItem);
  const filtered = keyword
    ? source.filter((item) => item.companyName?.includes(keyword))
    : source;
  const start = (currentPage - 1) * pageSize;

  return {
    ...companyListResponse,
    data: {
      currentPage,
      pageSize,
      total: keyword
        ? filtered.length
        : Number(getPageValue(payload, ["total", "count", "totalCount"], filtered.length)),
      pages: getPageValue(payload, ["pages", "totalPage", "totalPages"], undefined),
      records: filtered.slice(start, start + pageSize),
      list: filtered.slice(start, start + pageSize),
    },
  };
}

// 原接口：POST /uwone-ei/companyLifecycle/companyList
export const getCompanyList = (params) => ok(filterCompanyList(params));

// 原接口：GET /uwone-ei/companyLifecycle/businessProcessOption
export const businessProcessOption = () => ok(businessProcessOptionResponse);

// 原接口：POST /uwone-ei/companyLifecycle/get
export const getCompanyDetail = () => ok(companyDetailResponse);

// 原接口：POST /uwone-ei/companyLifecycle/getMgtInfo
export const getMgtInfo = () => ok(mgtInfoResponse);

// 原接口：GET /uwone-ei/company/byId/{id}
export const getInfoDetail1 = () => ok(companyInfoDetailResponse);

// 原接口：GET /uwone-ei/project/getById
export const getProjectDetail = () => ok(projectDetailResponse);
