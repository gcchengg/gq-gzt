export const latestTimelineDate = '2026-03-20';

export const statusNames = {
  0: '进行中',
  1: '已完成',
};

const statusValueMap = {
  0: 0,
  1: 1,
  2: 1,
  未开始: 0,
  待执行: 0,
  进行中: 0,
  已完成: 1,
};

function normalizeStatus(status) {
  return statusValueMap[status] ?? 0;
}

function toText(value, fallback = '-') {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value);
}

function normalizeTask(task) {
  const id = toText(task.currentInstanceCode || task.id || task.bizId);

  return {
    ...task,
    id,
    bizId: toText(task.bizId || task.id, ''),
    taskName: toText(task.taskName),
    description: toText(task.description || task.taskName),
    businessUnit: toText(task.bizUnitName || task.businessUnit, ''),
    bizUnitName: toText(task.bizUnitName || task.businessUnit, ''),
    dutyName: toText(task.distributeUserName || task.dutyName, ''),
    distributeUserName: toText(task.distributeUserName || task.dutyName, ''),
    startDate: task.taskBeginDate || task.createDate || task.startDate || task.beginDate,
    endDate: task.taskFinishDate || task.finishDate || task.endDate || task.finishTime,
    actualStartDate: task.taskBeginDate || task.createDate || task.startDate || task.beginDate,
    actualEndDate: task.taskFinishDate || task.finishDate || task.endDate || task.finishTime,
    linkIdList: Array.isArray(task.linkIdList) ? task.linkIdList : [],
    status: normalizeStatus(task.status),
  };
}

function normalizeTaskList(list) {
  return (Array.isArray(list) ? list : []).map(normalizeTask);
}

const managementStatusMap = {
  '-1': { status: 0, statusText: '未完成', statusClass: 'todo' },
  1: { status: 0, statusText: '进行中', statusClass: 'doing' },
  2: { status: 1, statusText: '已完成', statusClass: 'done' },
};

function getCurrentDate() {
  const date = new Date();
  const pad2 = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function normalizeMgtEvent(event) {
  const managementStatus = managementStatusMap[event.progStatus] || managementStatusMap['-1'];
  const startDate = event.createDate || event.startDate || event.taskBeginDate || event.finishDate;
  const finishDate = event.finishDate || event.endDate || event.taskFinishDate || getCurrentDate();
  const id = [
    event.bizId || event.companyId || 'mgt-event',
    event.processName || 'management',
    event.createDate || event.finishDate || '',
    event.eventName || '',
  ].join('-');

  return {
    ...event,
    finishDate,
    id: toText(id),
    eventName: toText(event.eventName),
    taskName: toText(event.eventName),
    description: toText(event.eventName),
    distributeUserName: toText(event.dutyUserName, ''),
    startDate,
    endDate: finishDate,
    status: managementStatus.status,
    statusText: managementStatus.statusText,
    statusClass: managementStatus.statusClass,
    linkIdList: Array.isArray(event.linkIdList) ? event.linkIdList : [],
    _viewMode: 'management',
  };
}

function normalizeMgtEventList(list) {
  return (Array.isArray(list) ? list : []).map(normalizeMgtEvent);
}

function flattenMapEvents(map = {}) {
  return Object.values(map || {}).flatMap((list) => (Array.isArray(list) ? list : []));
}

export function getProcessNames(detailData = {}) {
  const names = Object.keys(detailData.taskMap || {}).reduce((acc, processName) => {
    acc[processName] = processName;
    return acc;
  }, {});

  normalizeTaskList(detailData.taskManagementList).forEach((task) => {
    const processName = task.processName || '任务管理';
    if (processName) names[processName] = processName;
  });
  normalizeTaskList(detailData.taskTableList).forEach((task) => {
    const processName = task.processName;
    if (processName) names[processName] = processName;
  });

  names.taskManagement = '任务管理';
  return names;
}

export function getBizUnitNames(list = []) {
  return list.reduce((acc, item) => {
    const bizUnitName = item.bizUnitName || item.businessUnit;
    if (bizUnitName) acc[bizUnitName] = bizUnitName;
    return acc;
  }, {});
}

export function getEvents(detailData = {}, companyId) {
  const mainEvents = Object.entries(detailData.taskMap || {}).flatMap(([stageName, list]) => (
    normalizeTaskList(list).map((task) => ({
      ...task,
      _companyId: companyId,
      _lane: 'main',
      _processName: task.processName || stageName,
    }))
  ));

  const taskManagementEvents = normalizeTaskList(detailData.taskManagementList).map((task) => ({
    ...task,
    _companyId: companyId,
    _lane: 'aux',
    _processName: task.processName || '任务管理',
  }));

  return mainEvents.concat(taskManagementEvents);
}

export function getTableEvents(detailData = {}, companyId) {
  const tableList = Array.isArray(detailData.taskTableList)
    ? detailData.taskTableList
    : flattenMapEvents(detailData.taskMap).concat(detailData.taskManagementList || []);

  return normalizeTaskList(tableList).map((task) => ({
    ...task,
    _companyId: task.companyId || companyId,
    _lane: task.processName === '任务管理' ? 'aux' : 'main',
    _processName: task.processName || '-',
  }));
}

export function getMgtEvents(detailData = {}, companyId) {
  const mainEvents = Object.entries(detailData.mgtMap || {}).flatMap(([stageName, list]) => (
    normalizeMgtEventList(list).map((event) => ({
      ...event,
      _companyId: event.companyId || companyId,
      _lane: 'main',
      _processName: event.processName || stageName,
    }))
  ));

  const taskManagementEvents = normalizeMgtEventList(detailData.managementMgtList).map((event) => ({
    ...event,
    _companyId: event.companyId || companyId,
    _lane: 'aux',
    _processName: event.processName || '任务管理',
  }));

  return mainEvents.concat(taskManagementEvents);
}

export function getMgtTableEvents(detailData = {}, companyId) {
  const tableList = Array.isArray(detailData.mgtList)
    ? detailData.mgtList
    : flattenMapEvents(detailData.mgtMap).concat(detailData.managementMgtList || []);

  return normalizeMgtEventList(tableList).map((event) => ({
    ...event,
    _companyId: event.companyId || companyId,
    _lane: event.processName === '任务管理' ? 'aux' : 'main',
    _processName: event.processName || '-',
  }));
}
