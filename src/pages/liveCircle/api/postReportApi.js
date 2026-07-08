import companyDetailResponse from "../mock/postReportCompanyDetail.json";
import monthlyWorkResponse from "../mock/monthlyWorkList.json";
import reportTableResponse from "../mock/reportTable.json";

const sleep = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = (value) => JSON.parse(JSON.stringify(value));

let monthlyWorkData = clone(monthlyWorkResponse.data || []);

export async function getPostReportTable() {
  await sleep();
  return clone(reportTableResponse);
}

export async function getPostReportCompanyDetail() {
  await sleep();
  return clone(companyDetailResponse);
}

export async function getMonthId(params = {}) {
  await sleep();
  const date = params.date || "2026-02";
  const [year, month] = date.split("-");
  return {
    code: 200,
    message: "success",
    data: {
      monthId: `month-report-${year}${month}`,
      yearId: `year-report-${year}`,
      gzxsReportId: `gzxs-${year}${month}`,
      deptType: "1",
      year: Number(year),
      month: Number(month)
    }
  };
}

export async function getMonthlyWorkList(params = {}) {
  await sleep();
  const startDate = params.startDate;
  const endDate = params.endDate;
  const filtered = monthlyWorkData.map((group) => ({
    ...group,
    list: group.list.filter((item) => {
      if (!startDate || !endDate) return true;
      return item.workDate >= startDate && item.workDate <= endDate;
    })
  })).filter((group) => group.list.length);
  return {
    code: 200,
    message: "success",
    data: filtered
  };
}

export async function saveMonthlyManagementWork(params = {}) {
  await sleep();
  monthlyWorkData = params.data || monthlyWorkData;
  return {
    code: 200,
    message: "保存成功",
    data: clone(monthlyWorkData)
  };
}

export async function deleteMonthlyManagementWork(id) {
  await sleep();
  monthlyWorkData = monthlyWorkData.map((group) => ({
    ...group,
    list: group.list.filter((item) => item.id !== id)
  }));
  return {
    code: 200,
    message: "删除成功",
    data: clone(monthlyWorkData)
  };
}
