import dayjs from "dayjs";
import topicReportGetResponse from "./data/topicReport/topicReportGet.json";
import getMatNameResponse from "./data/topicReport/getMatName.json";
import groupMessageDlvyGetResponse from "./data/topicReport/groupMessageDlvyGet.json";
import groupMessageDlvySaveResponse from "./data/topicReport/groupMessageDlvySave.json";
import groupMessageDlvySubmitResponse from "./data/topicReport/groupMessageDlvySubmit.json";
import topicReportSaveResponse from "./data/topicReport/topicReportSave.json";
import initFollowSanhuiMgmtIdResponse from "./data/topicReport/initFollowSanhuiMgmtId.json";
import getFollowInfoResponse from "./data/topicReport/getFollowInfo.json";
import getSanhuiFollowInfoResponse from "./data/topicReport/getSanhuiFollowInfo.json";
import getSanhuiTopicInfoResponse from "./data/topicReport/getSanhuiTopicInfo.json";
import sanhuiFollowSaveResponse from "./data/topicReport/sanhuiFollowSave.json";
import sanhuiFollowSubmitResponse from "./data/topicReport/sanhuiFollowSubmit.json";

const sleep = (ms = 160) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = (data) => JSON.parse(JSON.stringify(data));

let reportData = clone(topicReportGetResponse.data || {});
let messageDlvyData = clone(groupMessageDlvyGetResponse.data || {});
let followList = clone(
  initFollowSanhuiMgmtIdResponse.data?.sanhuiFollowVoList || [],
);

const ok = (data, message = "success") => ({
  code: 200,
  data: clone(data),
  message,
});

export async function topicReportGet(params = {}) {
  await sleep();
  return ok({
    ...reportData,
    sanhuiMgmtId: params.sanhuiMgmtId || reportData.sanhuiMgmtId,
  });
}

export async function getMatName() {
  await sleep();
  return clone(getMatNameResponse);
}

export async function groupMessageDlvyOAGet() {
  await sleep();
  return ok(messageDlvyData);
}

export async function groupMessageDlvySave(params = {}) {
  await sleep();
  messageDlvyData = {
    ...messageDlvyData,
    ...params,
    messageDlvyId:
      params.messageDlvyId ||
      messageDlvyData.messageDlvyId ||
      groupMessageDlvySaveResponse.data.messageDlvyId,
  };
  return {
    ...clone(groupMessageDlvySaveResponse),
    data: clone(messageDlvyData),
  };
}

export async function groupMessageDlvySubmit(params = {}) {
  await sleep();
  messageDlvyData = { ...messageDlvyData, ...params };
  return {
    ...clone(groupMessageDlvySubmitResponse),
    data: clone(messageDlvyData),
  };
}

export async function topicReportSave(params = {}) {
  await sleep();
  reportData = {
    ...reportData,
    ...params,
    id: params.id || reportData.id || topicReportSaveResponse.data.id,
    updated: dayjs().format("YYYY-MM-DD HH:mm:ss"),
  };
  return {
    ...clone(topicReportSaveResponse),
    data: clone(reportData),
    message:
      params.status === "1" ? "提交成功" : topicReportSaveResponse.message,
  };
}

export async function initFollowSanhuiMgmtId() {
  await sleep();
  return ok({
    sanhuiSpecReportId: reportData.id,
    sanhuiFollowVoList: followList,
  });
}

export async function getFollowInfo(params = {}) {
  await sleep();
  return ok(
    followList.find((item) => item.id === params.id) ||
      getFollowInfoResponse.data,
  );
}

export async function getSanhuiFollowInfo() {
  await sleep();
  return clone(getSanhuiFollowInfoResponse);
}

export async function getSanhuiTopicInfo() {
  await sleep();
  return clone(getSanhuiTopicInfoResponse);
}

export async function sanhuiFollowSave(params = {}) {
  await sleep();
  const saved = {
    ...params,
    id: params.id || `follow-report-${Date.now()}`,
    assignDate: params.assignDate || dayjs().format("YYYY-MM-DD"),
    status: params.status || "0",
  };
  const index = followList.findIndex((item) => item.id === saved.id);
  if (index >= 0) {
    followList[index] = { ...followList[index], ...saved };
  } else {
    followList.unshift(saved);
  }
  return { ...clone(sanhuiFollowSaveResponse), data: clone(saved) };
}

export async function sanhuiFollowSubmit(params = {}) {
  await sleep();
  const res = await sanhuiFollowSave(params);
  return { ...clone(sanhuiFollowSubmitResponse), data: res.data };
}
