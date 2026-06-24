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
  voteData = {
    ...voteData,
    voteId: params.voteId || voteData.voteId || saveResponse.data.voteId,
    sanhuiVoteTopicList: params.sanhuiVoteTopicList || voteData.sanhuiVoteTopicList,
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
