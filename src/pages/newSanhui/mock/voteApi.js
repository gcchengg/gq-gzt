import initResponse from "./data/vote/sanhuiVoteInitBySanhuiMgmtId.json";
import saveResponse from "./data/vote/sanhuiVoteSave.json";

const sleep = (ms = 160) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = (data) => JSON.parse(JSON.stringify(data));

let voteData = clone(initResponse.data || {});

export async function sanhuiVoteInitBySanhuiMgmtId(params = {}) {
  await sleep();
  return {
    ...clone(initResponse),
    data: {
      ...clone(voteData),
      sanhuiMgmtId: params.sanhuiMgmtId || voteData.sanhuiMgmtId,
    },
  };
}

export async function sanhuiVoteSave(params = {}) {
  await sleep();
  const previousTopicMap = new Map((voteData.sanhuiVoteTopicList || []).map((item) => [item.id || item.topicId, item]));
  const nextTopicList = (params.sanhuiVoteTopicList || voteData.sanhuiVoteTopicList || []).map((item) => ({
    ...(previousTopicMap.get(item.id || item.topicId) || {}),
    ...item,
  }));
  voteData = {
    ...voteData,
    voteId: params.voteId || voteData.voteId || saveResponse.data.voteId,
    sanhuiVoteTopicList: nextTopicList,
    sanhuiVoteFileList: params.sanhuiVoteFileList || voteData.sanhuiVoteFileList,
    status: params.status,
  };
  return {
    ...clone(saveResponse),
    data: {
      ...clone(saveResponse.data),
      voteId: voteData.voteId,
    },
    message: params.status === "1" ? "提交成功" : saveResponse.message,
  };
}
