import suggestGetResponse from "./data/voteSuggest/suggestGet.json";
import suggestSaveResponse from "./data/voteSuggest/suggestSave.json";

const sleep = (ms = 160) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = (data) => JSON.parse(JSON.stringify(data));

let currentSuggest = clone(suggestGetResponse.data || {});

export async function suggestGet(params = {}) {
  await sleep();
  return {
    ...suggestGetResponse,
    data: {
      ...clone(currentSuggest),
      sanhuiMgmtId: params.sanhuiMgmtId || currentSuggest.sanhuiMgmtId,
    },
  };
}

export async function suggestSave(params = {}) {
  await sleep();
  currentSuggest = {
    ...currentSuggest,
    ...params,
    id: params.id || currentSuggest.id || suggestSaveResponse.data?.id,
    updated: new Date().toISOString().slice(0, 19).replace("T", " "),
  };

  return {
    ...suggestSaveResponse,
    data: clone(currentSuggest),
    message: params.status === "1" ? "提交成功" : suggestSaveResponse.message,
  };
}
