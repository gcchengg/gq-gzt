import taskData from "./mock/taskData.json";
import taskFlow from "./mock/taskFlow.json";
import companyList from "./mock/companyList.json";
import riskOperatorList from "./mock/riskOperatorList.json";
import companySearch from "./mock/companySearch.json";
import peerRecord from "./mock/peerRecord.json";
import llmCompletions from "./mock/llmCompletions.json";

const ok = (data = null) => Promise.resolve({ code: 200, data });
const clone = (value) => JSON.parse(JSON.stringify(value));

export const getTaskData = () => Promise.resolve(clone(taskData));
export const getTaskFlow = () => {
  const response = clone(taskFlow);
  if (new URLSearchParams(window.location.search).get("status") === "400") {
    response.data.push({
      progStatus: "400",
      created: "2026-07-13 10:00:00",
      cmplDateTime: "2026-07-13 10:00:00",
    });
  }
  return Promise.resolve(response);
};
export const getCompanyList = () => Promise.resolve(clone(companyList));
export const getRiskOperatorList1 = () =>
  Promise.resolve(clone(riskOperatorList));
export const getEyes = () => Promise.resolve(clone(companySearch));
export const getPeerRecord = () => Promise.resolve(clone(peerRecord));
export const callLLMCompletions = () => Promise.resolve(clone(llmCompletions));
export const saveTask = () => ok();
export const saveTaskCompleteness = () => ok();
export const executeTaskConfirm = () => ok();
export const taskConfirm = () => ok();
export const executeTaskClose = () => ok();
