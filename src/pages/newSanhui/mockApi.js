import sanhuiProgStatusData from "./mock/data/sanhuiProgStatus.json";
import threeListDetailData from "./mock/data/threeListDetail.json";
import threeListGetListData from "./mock/data/threeListGetList.json";
import updateByIdData from "./mock/data/updateById.json";
import dayjs from "dayjs";

export const sanhuiProgStatus = sanhuiProgStatusData;

const sleep = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = (data) => JSON.parse(JSON.stringify(data));
const records = clone(threeListGetListData.data.list || []);

const defaultDecisionExecList = [
  {
    id: "decision-topic-001",
    topicId: "topic-001",
    eoSanhuiTopic: {
      toipcName: "关于推进基金退出事项的议案",
    },
    gqPassFlag: "1",
    bodPassFlag: "1",
    bosPassFlag: "1",
    shPassFlag: "1",
    diffRemark: "",
  },
  {
    id: "decision-topic-002",
    topicId: "topic-002",
    eoSanhuiTopic: {
      toipcName: "关于参股公司年度预算调整的议案",
    },
    gqPassFlag: "1",
    bodPassFlag: "2",
    bosPassFlag: "2",
    shPassFlag: "2",
    diffRemark: "三会审议时增加了预算执行过程中的月度监测条件，需按有条件通过跟踪。",
  },
  {
    id: "decision-topic-003",
    topicId: "topic-003",
    eoSanhuiTopic: {
      toipcName: "关于授权签署补充协议的议案",
    },
    gqPassFlag: "1",
    bodPassFlag: "0",
    bosPassFlag: "",
    shPassFlag: "",
    diffRemark: "董事会认为补充协议部分条款仍需法律合规部复核，暂未通过。",
  },
];

const defaultFollowList = [
  {
    id: "follow-001",
    followFromType: "300",
    followName: "落实董事会决议事项",
    followDetail: "按照会议决议推进基金退出路径比选，并形成执行台账。",
    itemType: "1",
    toipcName: "关于推进基金退出事项的议案",
    assignUserName: "张华",
    deadlineDate: "2026-05-15",
    planStartDate: "2026-04-01",
    planEndDate: "2026-05-15",
    execDetail: "已完成退出路径测算，正在补充交易对手沟通记录。",
    status: "0",
  },
  {
    id: "follow-002",
    followFromType: "200",
    followName: "补充反馈会议材料",
    followDetail: "补充外部董事意见采纳情况和风险应对说明。",
    itemType: "2",
    toipcName: "2026年第4次董事会",
    assignUserName: "刘洋",
    deadlineDate: "2026-04-30",
    planStartDate: "2026-04-18",
    planEndDate: "2026-04-30",
    execDetail: "材料已归档，待确认。",
    status: "1",
  },
];

const decisionExecByMgmtId = {};
const followListByMgmtId = {};
const assignFollowTaskById = {
  "assign-follow-task-001": {
    id: "assign-follow-task-001",
    status: "200",
    createdAt: "2026-06-22 18:33:35",
    completedAt: "2026-06-22 18:33:35",
    issueUserName: "郑华峰",
    companyName: "富奥汽车零部件股份有限公司",
    dutyUserName: "郑华峰",
    taskSource: "三会决策执行",
    taskDesc: "212",
    planCmplDate: "2026-06-22",
    attachmentName: "截屏2026-04-15 17.55.31.png",
    taskType: "",
  },
};
let latestAssignFollowTaskId = "assign-follow-task-001";

if (!records.some((record) => String(record.progStatus) === "14000")) {
  records.unshift({
    ...records[0],
    id: "topic-evaluation-task-001",
    mgmtNo: "202600177",
    created: "2026-06-11T09:12:00",
    updated: "2026-06-11T09:12:00",
    submitTime: "2026-06-11T09:10:00",
    stageCode: "14000",
    stepCode: "14100",
    progStatus: "14000",
    outerProgStatus: "11000",
    topicCfmState: "2",
    overdueRemark: null,
  });
}

if (!records.some((record) => String(record.progStatus) === "15000")) {
  records.unshift({
    ...records[0],
    id: "topic-approval-task-001",
    mgmtNo: "202600178",
    created: "2026-06-11T10:12:00",
    updated: "2026-06-11T10:12:00",
    submitTime: "2026-06-11T10:10:00",
    stageCode: "15000",
    stepCode: "15100",
    progStatus: "15000",
    outerProgStatus: "11000",
    topicCfmState: "2",
    overdueRemark: null,
  });
}

if (!records.some((record) => String(record.progStatus) === "17000")) {
  records.unshift({
    ...records[0],
    id: "topic-report-task-001",
    mgmtNo: "202600179",
    created: "2026-06-11T11:12:00",
    updated: "2026-06-11T11:12:00",
    submitTime: "2026-06-11T11:10:00",
    stageCode: "17000",
    stepCode: "17100",
    progStatus: "17000",
    outerProgStatus: "11000",
    topicCfmState: "2",
    overdueRemark: null,
  });
}

if (!records.some((record) => String(record.progStatus) === "18000")) {
  records.unshift({
    ...records[0],
    id: "meeting-vote-task-001",
    mgmtNo: "202600180",
    created: "2026-06-11T12:12:00",
    updated: "2026-06-11T12:12:00",
    submitTime: "2026-06-11T12:10:00",
    stageCode: "18000",
    stepCode: "18100",
    progStatus: "18000",
    outerProgStatus: "11000",
    topicCfmState: "2",
    overdueRemark: null,
  });
}

const getStatusText = (status) =>
  sanhuiProgStatus.find((item) => String(item.value) === String(status))?.text || "-";

export { getStatusText };

export async function threeListGetList(params = {}) {
  await sleep();
  const currentPage = Number(params.currentPage || 1);
  const pageSize = Number(params.pageSize || 10);
  const filtered = records.filter((record) => {
    const codeMatched = params.companyCreditCode
      ? String(record.companyCreditCode || "").includes(params.companyCreditCode)
      : true;
    const companyMatched = params.companyName
      ? String(record.companyName || "").includes(params.companyName)
      : true;
    const userMatched = params.submitUserName
      ? String(record.submitUserName || "").includes(params.submitUserName)
      : true;
    const statusMatched = params.progStatus
      ? String(record.progStatus) === String(params.progStatus)
      : true;
    return codeMatched && companyMatched && userMatched && statusMatched;
  });
  const start = (currentPage - 1) * pageSize;
  return {
    ...clone(threeListGetListData),
    data: {
      list: clone(filtered.slice(start, start + pageSize)),
      total: filtered.length,
    },
  };
}

export async function threeListDetail(id) {
  await sleep();
  const record = records.find((item) => String(item.id) === String(id));
  return {
    ...clone(threeListDetailData),
    data: clone(record || threeListDetailData.data),
  };
}

export async function updateById(params = {}) {
  await sleep();
  const index = records.findIndex((item) => String(item.id) === String(params.id));
  if (index >= 0) {
    records[index] = {
      ...records[index],
      ...params,
    };
  }
  return {
    ...clone(updateByIdData),
    data: index >= 0 ? clone(records[index]) : updateByIdData.data,
  };
}

export async function initDecisionExec(params = {}) {
  await sleep();
  const sanhuiMgmtId = params.sanhuiMgmtId || "default";
  const list = decisionExecByMgmtId[sanhuiMgmtId] || defaultDecisionExecList;
  return {
    code: 200,
    data: {
      sanhuiMgmtId,
      sanhuiVoteTopicList: clone(list),
    },
    message: "success",
  };
}

export async function saveExec(params = {}) {
  await sleep();
  if (params.sanhuiMgmtId && params.sanhuiVoteTopicList) {
    decisionExecByMgmtId[params.sanhuiMgmtId] = clone(params.sanhuiVoteTopicList);
  }
  return {
    code: 200,
    data: true,
    message: "保存成功",
  };
}

export async function getFollowList(params = {}) {
  await sleep();
  const sanhuiMgmtId = params.sanhuiMgmtId || "default";
  const list = followListByMgmtId[sanhuiMgmtId] || defaultFollowList;
  return {
    code: 200,
    data: { list: clone(list), total: list.length },
    message: "success",
  };
}

export async function parseAssignFile(params = {}) {
  await sleep(700);
  const isAudio = params.fileType === "audio";
  return {
    code: 200,
    data: {
      followFromType: "300",
      followName: isAudio ? "AI解析录音交办事项" : "AI解析PDF交办事项",
      followDetail: isAudio
        ? `根据录音「${params.fileName}」识别：需跟踪会议中明确的责任事项，补充执行计划并定期反馈进展。`
        : `根据PDF「${params.fileName}」识别：需核对材料中的决议要求，形成交办清单并推动闭环落实。`,
      itemType: isAudio ? "2" : "1",
      toipcName: isAudio ? "会议录音纪要识别事项" : "PDF材料识别事项",
      assignUserName: isAudio ? "会议秘书" : "材料管理员",
      deadlineDate: dayjs().add(isAudio ? 7 : 10, "day").format("YYYY-MM-DD"),
      planStartDate: dayjs().format("YYYY-MM-DD"),
      planEndDate: dayjs().add(isAudio ? 7 : 10, "day").format("YYYY-MM-DD"),
      execDetail: "AI已生成初步交办描述，请责任人复核后更新执行总结。",
      status: "0",
      aiSourceFileName: params.fileName,
      aiSourceFileType: params.fileType,
    },
    message: "success",
  };
}

export async function saveFollow(record = {}) {
  await sleep();
  const sanhuiMgmtId = record.sanhuiMgmtId || "default";
  if (!followListByMgmtId[sanhuiMgmtId]) {
    followListByMgmtId[sanhuiMgmtId] = clone(defaultFollowList);
  }
  const mgmtList = followListByMgmtId[sanhuiMgmtId];
  let savedRecord = null;

  if (record.id) {
    const index = mgmtList.findIndex((item) => item.id === record.id);
    if (index >= 0) {
      mgmtList[index] = { ...mgmtList[index], ...record };
      savedRecord = mgmtList[index];
    }
  }

  if (!savedRecord) {
    savedRecord = {
      id: `follow-${Date.now()}`,
      followName: record.followName || "新增交办事项",
      followDetail: record.followDetail || "",
      itemType: record.itemType || "1",
      toipcName: record.toipcName || "关于推进基金退出事项的议案",
      assignUserName: record.assignUserName || "张华",
      deadlineDate: record.deadlineDate || dayjs().add(10, "day").format("YYYY-MM-DD"),
      planStartDate: record.planStartDate,
      planEndDate: record.planEndDate,
      execDetail: record.execDetail,
      status: "0",
      followFromType: record.followFromType || "300",
      aiSourceFileName: record.aiSourceFileName,
      aiSourceFileType: record.aiSourceFileType,
    };
    mgmtList.unshift(savedRecord);
  }

  return {
    code: 200,
    data: clone(savedRecord),
    message: "保存成功",
  };
}

export async function createAssignFollowTask(params = {}) {
  await sleep();
  const sourceList = params.followList || [];
  const firstFollow = sourceList[0] || {};
  const taskId = `assign-follow-task-${Date.now()}`;
  const task = {
    id: taskId,
    status: "200",
    createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    completedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    issueUserName: params.issueUserName || "郑华峰",
    companyName: params.companyName || "富奥汽车零部件股份有限公司",
    dutyUserName: firstFollow.assignUserName || params.dutyUserName || "郑华峰",
    taskSource: "三会决策执行",
    taskDesc: firstFollow.followDetail || "212",
    planCmplDate: firstFollow.deadlineDate || dayjs().format("YYYY-MM-DD"),
    attachmentName: firstFollow.aiSourceFileName || "截屏2026-04-15 17.55.31.png",
    taskType: "",
    sanhuiMgmtId: params.sanhuiMgmtId,
    followList: clone(sourceList),
  };
  assignFollowTaskById[taskId] = task;
  latestAssignFollowTaskId = taskId;
  return {
    code: 200,
    data: clone(task),
    message: "交办事项任务已创建",
  };
}

export async function getAssignFollowTask(params = {}) {
  await sleep();
  const taskId = params.taskId || latestAssignFollowTaskId;
  const task = assignFollowTaskById[taskId] || assignFollowTaskById[latestAssignFollowTaskId];
  return {
    code: 200,
    data: clone(task),
    message: "success",
  };
}

export function getLatestAssignFollowTaskId() {
  return latestAssignFollowTaskId;
}
