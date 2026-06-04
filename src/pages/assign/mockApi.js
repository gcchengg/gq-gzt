import dayjs from "dayjs";
export const sanhuiProgStatus = [
    { value: "12000", text: "提报确认" },
    { value: "13000", text: "议题提报" },
    { value: "14000", text: "议题评估" },
    { value: "15000", text: "议题审核" },
    { value: "16000", text: "表决建议" },
    { value: "17000", text: "专题汇报" },
    { value: "18000", text: "三会表决" },
    { value: "19000", text: "决策执行" },
    { value: "20000", text: "结束" },
    { value: "99999", text: "逾期" },
];
const mockRecords = [
    {
        id: "assign-001",
        companyCreditCode: "91120118MA06A8FAW1",
        companyName: "一汽股权投资（天津）有限公司",
        mgmtNo: "GQ-SH-2026-031",
        createUserName: "系统管理员",
        created: "2026-03-31 09:18:22",
        updateUserName: "王明",
        updated: "2026-04-02 16:08:11",
        submitUserId: "wangming",
        submitUserName: "王明",
        submitTime: "2026-03-31 15:46:03",
        progStatus: "19000",
    },
    {
        id: "assign-002",
        companyCreditCode: "91220101MA078FAW2",
        companyName: "国汽轻量化技术研究院",
        mgmtNo: "GQ-SH-2026-042",
        createUserName: "李娜",
        created: "2026-04-08 10:12:04",
        updateUserName: "李娜",
        updated: "2026-04-14 11:36:49",
        submitUserId: "lina",
        submitUserName: "李娜",
        submitTime: "2026-04-08 10:42:25",
        progStatus: "19000",
    },
    {
        id: "assign-003",
        companyCreditCode: "91110108MA09FAW33",
        companyName: "一汽产业协同发展有限公司",
        mgmtNo: "GQ-SH-2026-057",
        createUserName: "赵鹏",
        created: "2026-04-16 14:26:31",
        updateUserName: "赵鹏",
        updated: "2026-04-19 17:20:13",
        submitUserId: "zhaopeng",
        submitUserName: "赵鹏",
        submitTime: "2026-04-16 15:08:10",
        progStatus: "99999",
        overdueRemark: "因外部董事反馈材料补充较晚，决策执行说明延后提交。",
    },
    {
        id: "assign-004",
        companyCreditCode: "91220203MA08FAW88",
        companyName: "一汽资本控股有限公司",
        mgmtNo: "GQ-SH-2026-063",
        createUserName: "陈晨",
        created: "2026-04-22 08:50:18",
        updateUserName: "陈晨",
        updated: "2026-04-25 12:01:46",
        submitUserId: "chenchen",
        submitUserName: "陈晨",
        submitTime: "2026-04-22 09:20:00",
        progStatus: "20000",
    },
];
const followListByMgmtId = {
    "assign-001": [
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
    ],
    "assign-002": [
        {
            id: "follow-003",
            followFromType: "300",
            followName: "完成审计整改闭环",
            followDetail: "跟踪年度审计报告中涉及股权管理事项的整改计划。",
            itemType: "3",
            toipcName: "审计整改专题",
            assignUserName: "周静",
            deadlineDate: "2026-05-28",
            planStartDate: "2026-04-15",
            planEndDate: "2026-05-28",
            execDetail: "已完成第一轮佐证材料收集。",
            status: "0",
        },
    ],
};
const decisionExecByMgmtId = {
    "assign-001": [
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
    ],
    "assign-002": [
        {
            id: "decision-topic-004",
            topicId: "topic-004",
            eoSanhuiTopic: {
                toipcName: "关于审计整改闭环方案的议案",
            },
            gqPassFlag: "1",
            bodPassFlag: "1",
            bosPassFlag: "1",
            shPassFlag: "",
            diffRemark: "",
        },
        {
            id: "decision-topic-005",
            topicId: "topic-005",
            eoSanhuiTopic: {
                toipcName: "关于轻量化项目阶段投入调整的议案",
            },
            gqPassFlag: "2",
            bodPassFlag: "2",
            bosPassFlag: "",
            shPassFlag: "2",
            diffRemark: "",
        },
    ],
    "assign-003": [
        {
            id: "decision-topic-006",
            topicId: "topic-006",
            eoSanhuiTopic: {
                toipcName: "关于产业协同投资计划延期的议案",
            },
            gqPassFlag: "1",
            bodPassFlag: "2",
            bosPassFlag: "",
            shPassFlag: "2",
            diffRemark: "三会要求补充外部股东书面意见后再执行，决议结果调整为有条件通过。",
        },
    ],
};
const voteSuggestByMgmtId = {
    "assign-001": {
        id: "vote-suggest-001",
        sanhuiMgmtId: "assign-001",
        summary:
            "一汽股权投资（天津）有限公司拟于2026年4月28日召开2026年第4次董事会、监事会及股东会，审议基金退出及参股公司预算调整相关事项。",
        addlSummary:
            "经2026年4月22日总办会审议，原则同意相关议题提交三会审议。请将****年**月**日改为实际日期后形成正式表决建议。",
        bodAdvice:
            "建议董事会同意推进基金退出路径比选，并授权经营层根据测算结果组织交易谈判。",
        bosAdvice:
            "建议监事会同意相关议题，并持续关注交易合规性及执行闭环情况。",
        shsAdvice:
            "建议股东会同意相关议题，并要求管护团队按月反馈执行进展。",
        bodFlag: "1",
        bosFlag: "1",
        shsFlag: "1",
        pdfFileUrl: "/mock-files/vote-suggest-assign-001.pdf",
        sanhuiTopicAssessMiscVoList: [
            {
                id: "misc-001",
                topicName: "关于推进基金退出事项的议案",
                bodFlag: "1",
                bodCompResult: "1",
                bodVoteElusionFlag: "0",
                bosFlag: "1",
                bosCompResult: "1",
                bosVoteElusionFlag: "0",
                shsFlag: "1",
                shsCompResult: "1",
                shsVoteElusionFlag: "0",
            },
            {
                id: "misc-002",
                topicName: "关于参股公司年度预算调整的议案",
                bodFlag: "1",
                bodCompResult: "2",
                bodVoteElusionFlag: "0",
                bosFlag: "1",
                bosCompResult: "2",
                bosVoteElusionFlag: "0",
                shsFlag: "1",
                shsCompResult: "2",
                shsVoteElusionFlag: "0",
            },
            {
                id: "misc-003",
                topicName: "关于授权签署补充协议的议案",
                bodFlag: "1",
                bodCompResult: "0",
                bodVoteElusionFlag: "1",
                bosFlag: "0",
                bosCompResult: "",
                bosVoteElusionFlag: "0",
                shsFlag: "0",
                shsCompResult: "",
                shsVoteElusionFlag: "0",
            },
        ],
    },
    "assign-002": {
        id: "vote-suggest-002",
        sanhuiMgmtId: "assign-002",
        summary:
            "国汽轻量化技术研究院拟召开董事会、监事会，审议审计整改闭环和轻量化项目阶段投入调整事项。",
        addlSummary:
            "经总办会审议，建议相关议题按既定层级提交三会审议，并同步说明预算调整依据。",
        bodAdvice:
            "建议董事会同意审计整改闭环方案和阶段投入调整，后续按季度更新整改台账。",
        bosAdvice:
            "建议监事会同意审计整改闭环方案，并监督佐证材料归档。",
        shsAdvice: "",
        bodFlag: "1",
        bosFlag: "1",
        shsFlag: "0",
        pdfFileUrl: "/mock-files/vote-suggest-assign-002.pdf",
        sanhuiTopicAssessMiscVoList: [
            {
                id: "misc-004",
                topicName: "关于审计整改闭环方案的议案",
                bodFlag: "1",
                bodCompResult: "1",
                bodVoteElusionFlag: "0",
                bosFlag: "1",
                bosCompResult: "1",
                bosVoteElusionFlag: "0",
                shsFlag: "0",
                shsCompResult: "",
                shsVoteElusionFlag: "0",
            },
            {
                id: "misc-005",
                topicName: "关于轻量化项目阶段投入调整的议案",
                bodFlag: "1",
                bodCompResult: "2",
                bodVoteElusionFlag: "0",
                bosFlag: "0",
                bosCompResult: "",
                bosVoteElusionFlag: "0",
                shsFlag: "0",
                shsCompResult: "",
                shsVoteElusionFlag: "0",
            },
        ],
    },
};
const sleep = (ms = 160) => new Promise((resolve) => setTimeout(resolve, ms));
const ok = (data) => ({ code: 200, data });
const clone = (data) => JSON.parse(JSON.stringify(data));
const ensureVoteSuggest = (sanhuiMgmtId) => {
    if (voteSuggestByMgmtId[sanhuiMgmtId]) {
        return voteSuggestByMgmtId[sanhuiMgmtId];
    }
    voteSuggestByMgmtId[sanhuiMgmtId] = {
        ...clone(voteSuggestByMgmtId["assign-001"]),
        id: `vote-suggest-${sanhuiMgmtId}`,
        sanhuiMgmtId,
    };
    return voteSuggestByMgmtId[sanhuiMgmtId];
};
export function getStatusText(status) {
    return sanhuiProgStatus.find((item) => item.value === String(status))?.text || "-";
}
export async function threeListGetList(params) {
    await sleep();
    const currentPage = Number(params.currentPage || 1);
    const pageSize = Number(params.pageSize || 10);
    const filtered = mockRecords.filter((record) => {
        const codeMatched = params.companyCreditCode
            ? record.companyCreditCode.includes(params.companyCreditCode)
            : true;
        const companyMatched = params.companyName
            ? record.companyName.includes(params.companyName)
            : true;
        const userMatched = params.submitUserName
            ? record.submitUserName.includes(params.submitUserName)
            : true;
        const statusMatched = params.progStatus
            ? String(record.progStatus) === String(params.progStatus)
            : true;
        return codeMatched && companyMatched && userMatched && statusMatched;
    });
    const start = (currentPage - 1) * pageSize;
    return ok({
        list: filtered.slice(start, start + pageSize),
        total: filtered.length,
    });
}
export async function threeListDetail(id) {
    await sleep();
    return ok(mockRecords.find((record) => record.id === id) || mockRecords[0]);
}
export async function updateById(params) {
    await sleep();
    const record = mockRecords.find((item) => item.id === params.id);
    if (record) {
        record.overdueRemark = params.overdueRemark;
    }
    return ok(record);
}
export async function getOtherInfo(params) {
    await sleep();
    const record = params.id
        ? mockRecords.find((item) => item.id === params.id)
        : mockRecords[0];
    return ok({
        id: record?.id || "assign-001",
        companyName: record?.companyName || "一汽股权投资（天津）有限公司",
        companyCreditCode: record?.companyCreditCode || "91120118MA06A8FAW1",
        mgmtNo: record?.mgmtNo || "GQ-SH-2026-031",
        topicName: "关于推进基金退出事项的议案",
        meetingName: "2026年第4次董事会",
        dutyDepartment: "股权运营部",
    });
}
export async function sanhuiStatusAvailable() {
    await sleep();
    return ok([
        { reviewType: "1000", isAvailable: true },
        { reviewType: "2000", isAvailable: true },
        { reviewType: "3000", isAvailable: true },
    ]);
}
export async function getVoteList() {
    await sleep();
    return ok([
        {
            id: "vote-001",
            userName: "王明",
            voteTime: "2026-04-28",
            voteMethod: "100",
        },
        {
            id: "vote-002",
            userName: "李娜",
            voteTime: "2026-04-28",
            voteMethod: "200",
        },
    ]);
}
export async function getFollowList(params) {
    await sleep();
    const list = followListByMgmtId[params.sanhuiMgmtId] || followListByMgmtId["assign-001"];
    return ok({ list, total: list.length });
}
export async function meetingDecision(mgmtId) {
    await sleep();
    return ok({
        mgmtId,
        fileList: [
            {
                id: "file-001",
                fileName: "董事会会议决议-完整版.pdf",
                fileCategory: "董事会会议决议-会议完整版",
                created: dayjs().subtract(5, "day").format("YYYY-MM-DD"),
            },
            {
                id: "file-002",
                fileName: "股东会会议决议-我方发出版.pdf",
                fileCategory: "股东会会议决议-我方发出版",
                created: dayjs().subtract(3, "day").format("YYYY-MM-DD"),
            },
        ],
        sanhuiVoteFileList: [],
        voteId: "vote-main-001",
    });
}
export async function initDecisionExec(params) {
    await sleep();
    const list =
        decisionExecByMgmtId[params.sanhuiMgmtId] || decisionExecByMgmtId["assign-001"];
    return ok({
        sanhuiMgmtId: params.sanhuiMgmtId,
        sanhuiVoteTopicList: clone(list),
    });
}
export async function suggestGet(params) {
    await sleep();
    return ok(clone(ensureVoteSuggest(params.sanhuiMgmtId)));
}
export async function suggestSave(params) {
    await sleep();
    const current = ensureVoteSuggest(params.sanhuiMgmtId);
    voteSuggestByMgmtId[params.sanhuiMgmtId] = {
        ...current,
        ...params,
        id: params.id || current.id || `vote-suggest-${Date.now()}`,
        updated: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    };
    return {
        code: 200,
        data: clone(voteSuggestByMgmtId[params.sanhuiMgmtId]),
        message: params.status === "1" ? "提交成功" : "保存成功",
    };
}
export async function parseAssignFile(params) {
    await sleep(700);
    const isAudio = params.fileType === "audio";
    const topicName = isAudio
        ? "会议录音纪要识别事项"
        : "PDF材料识别事项";
    return ok({
        followFromType: "300",
        followName: isAudio ? "AI解析录音交办事项" : "AI解析PDF交办事项",
        followDetail: isAudio
            ? `根据录音「${params.fileName}」识别：需跟踪会议中明确的责任事项，补充执行计划并定期反馈进展。`
            : `根据PDF「${params.fileName}」识别：需核对材料中的决议要求，形成交办清单并推动闭环落实。`,
        itemType: isAudio ? "2" : "1",
        toipcName: topicName,
        assignUserName: isAudio ? "会议秘书" : "材料管理员",
        deadlineDate: dayjs().add(isAudio ? 7 : 10, "day").format("YYYY-MM-DD"),
        planStartDate: dayjs().format("YYYY-MM-DD"),
        planEndDate: dayjs().add(isAudio ? 7 : 10, "day").format("YYYY-MM-DD"),
        execDetail: "AI已生成初步交办描述，请责任人复核后更新执行总结。",
        status: "0",
        aiSourceFileName: params.fileName,
        aiSourceFileType: params.fileType,
    });
}
export async function saveFollow(record) {
    await sleep();
    const sanhuiMgmtId = record.sanhuiMgmtId || "assign-001";
    if (!followListByMgmtId[sanhuiMgmtId]) {
        followListByMgmtId[sanhuiMgmtId] = [];
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
    else {
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
            followFromType: "300",
            aiSourceFileName: record.aiSourceFileName,
            aiSourceFileType: record.aiSourceFileType,
        };
        mgmtList.unshift(savedRecord);
    }
    return ok(clone(savedRecord || record));
}
export async function saveExec(params = {}) {
    await sleep();
    if (params.sanhuiMgmtId && params.sanhuiVoteTopicList) {
        decisionExecByMgmtId[params.sanhuiMgmtId] = clone(params.sanhuiVoteTopicList);
    }
    return ok(true);
}
