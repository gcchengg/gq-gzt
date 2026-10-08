const required = (value, label) => {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`请填写${label}`);
  return text;
};

const appendHistory = (item, action, actor, at, detail = "") => [
  ...(item.history || []),
  { action, actor, at, detail },
];

export function createSuggestion({
  id,
  directorName,
  sourceTask,
  content,
  initiatorRole,
  initiatorName,
  now,
}) {
  if (
    !sourceTask?.id ||
    !sourceTask.taskStatus ||
    sourceTask.directorName !== directorName
  ) {
    throw new Error("请选择该董事的有效履职任务");
  }
  const item = {
    id,
    directorName,
    sourceTaskId: sourceTask.id,
    sourceTaskSnapshot: {
      id: sourceTask.id,
      content: sourceTask.content,
      type: sourceTask.type,
      date: sourceTask.date,
    },
    source: sourceTask.content,
    content: required(content, "建议内容"),
    initiatorRole,
    initiatorName,
    owner: "",
    assignee: "",
    deadline: "",
    handlingPlan: "",
    progress: 0,
    result: "",
    feedback: "",
    files: [],
    status: "待董办补充",
    createdAt: now,
  };
  return {
    ...item,
    history: appendHistory(item, "发起建议", initiatorName, now, item.content),
  };
}

export function dispatchSuggestion(item, fields, now) {
  if (item.status !== "待董办补充") throw new Error("当前建议不可下发");
  const owner = required(fields.owner, "责任部门");
  const assignee = required(fields.assignee, "责任人");
  const deadline = required(fields.deadline, "完成期限");
  return {
    ...item,
    owner,
    assignee,
    deadline,
    status: "待落实",
    dispatchedAt: now,
    history: appendHistory(
      item,
      "下发建议",
      "综合管理部-董办",
      now,
      `${owner} / ${assignee}，期限 ${deadline}`,
    ),
  };
}

export function saveSuggestionProgress(item, values, now) {
  if (!["待落实", "办理中"].includes(item.status)) {
    throw new Error("当前建议不可办理");
  }
  return {
    ...item,
    ...values,
    progress: Number(values.progress ?? item.progress),
    status: "办理中",
    history: appendHistory(
      item,
      "保存进展",
      item.assignee,
      now,
      `进度 ${values.progress ?? item.progress ?? 0}%${values.handlingPlan ? `；${values.handlingPlan}` : ""}`,
    ),
  };
}

export function closeSuggestion(item, values, now) {
  if (!["待落实", "办理中"].includes(item.status)) {
    throw new Error("当前建议不可关闭");
  }
  const result = required(values.result, "落实结果");
  return {
    ...item,
    ...values,
    result,
    progress: 100,
    status: "已关闭",
    completedAt: now,
    history: appendHistory(item, "关闭建议", item.assignee, now, result),
  };
}

export function visibleSuggestions(
  items,
  { role, directorName, assignee } = {},
) {
  if (role === "director") {
    return items.filter(
      (item) =>
        item.directorName === directorName ||
        item.initiatorName === directorName,
    );
  }
  if (role === "adminDepartment") {
    return assignee
      ? items.filter((item) => item.assignee === assignee)
      : items;
  }
  return [];
}

export function suggestionFulfillmentTasks(items, assignee) {
  return items.filter(
    (item) =>
      ["待落实", "办理中"].includes(item.status) &&
      (!assignee || item.assignee === assignee),
  );
}
