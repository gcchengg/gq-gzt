import { latestTimelineDate } from '../data';

export const TIMELINE_CARD_HEIGHT = 76;
export const MANAGEMENT_TIMELINE_CARD_HEIGHT = 82;
export const TIMELINE_CARD_GAP = 4;
export const TIMELINE_CELL_VERTICAL_PADDING = 8;

export const statusClass = {
  0: 'doing',
  1: 'done',
};

export const processOptions = [
  { value: 'all', label: '全部业务流程' },
];

export const statusOptions = [
  { value: 'all', label: '全部' },
  { value: 0, label: '进行中' },
  { value: 1, label: '已完成' },
];

export const granularityOptions = [
  { value: 'month', label: '按月' },
  { value: 'day', label: '按日' },
  { value: 'year', label: '按年' },
];

export const defaultFilters = {
  processName: 'all',
  bizUnitName: 'all',
  status: 'all',
  granularity: 'month',
  description: '',
};

export const defaultVisitPlans = [
  {
    id: 1,
    time: '09:30-11:00',
    tag: '园区走访',
    from: '上海虹桥站',
    to: '苏州工业园区',
    desc: '了解项目投后运营情况并核对关键经营指标。',
    ours: '刘敏、王涛',
    others: '参股公司总经理、招商主管',
  },
  {
    id: 2,
    time: '14:00-16:30',
    tag: '交流座谈',
    from: '园区会议中心',
    to: '参股公司办公区',
    desc: '围绕下一阶段协同事项进行对接，确认后续责任人。',
    ours: '刘敏',
    others: '董事会秘书、财务负责人',
  },
];

function pad2(value) {
  return String(value).padStart(2, '0');
}

function parseDate(dateStr) {
  return new Date(`${dateStr || latestTimelineDate}T00:00:00`);
}

export function getTimeKey(dateStr, granularity) {
  const d = parseDate(dateStr);
  if (granularity === 'year') return `${d.getFullYear()}`;
  if (granularity === 'day') return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

export function getEffectiveEndDate(item) {
  if (item.endDate) return item.endDate;
  if (item.status === 0) return latestTimelineDate;
  return item.startDate;
}

export function buildBucketsByRange(list, granularity) {
  return Array.from(
    new Set(list.map((item) => getTimeKey(item.startDate, granularity)))
  ).sort((a, b) => a.localeCompare(b));
}

export function bucketSpan(item, buckets, granularity) {
  const startIndex = buckets.indexOf(getTimeKey(item.startDate, granularity));
  const endKey = getTimeKey(getEffectiveEndDate(item), granularity);
  const endIndex = buckets.reduce(
    (lastIndex, bucket, index) => (index >= startIndex && bucket <= endKey ? index : lastIndex),
    startIndex
  );
  if (startIndex === -1) return 1;
  return Math.max(1, endIndex - startIndex + 1);
}

export function formatRulerLabel(key, granularity) {
  if (granularity === 'year') return key;
  if (granularity === 'day') return key.slice(5);
  return key;
}

export function getFlowType(item) {
  return item._lane === 'main' ? '核心运营流程' : '管理支持流程';
}

export function getBusinessFlow(item) {
  return item._processName || item.processName || '-';
}

export function getBusinessUnit(item) {
  return item.bizUnitName || item.businessUnit || '-';
}

export function getTaskTitle(item) {
  return item.taskName || '-';
}

export function getTaskDescription(item) {
  return item.description || '-';
}

export function getOwner(item) {
  return item.distributeUserName || item.dutyName || '-';
}

export function formatEventTime(item) {
  return `开始：${item.startDate || '-'} ｜ 结束：${item.endDate || (item.status === 0 ? '未完成' : item.startDate || '-')}`;
}

function normalizePair(a, b) {
  return [a, b].sort().join('::');
}

export function computeRelations(list) {
  const byId = Object.fromEntries(list.map((item) => [item.id, item]));
  const pairs = [];
  const seen = new Set();
  const auxOwner = {};
  const linkIndex = {};
  const relatedIndex = {};

  list
    .filter((item) => item._lane === 'main')
    .forEach((mainItem) => {
      (mainItem.linkIdList || []).forEach((auxId) => {
        const auxItem = byId[auxId];
        if (!auxItem || auxItem._lane !== 'aux') return;
        if (auxOwner[auxId] && auxOwner[auxId] !== mainItem.id) return;

        auxOwner[auxId] = mainItem.id;
        const key = normalizePair(mainItem.id, auxId);
        if (seen.has(key)) return;

        seen.add(key);
        pairs.push({ key, from: mainItem.id, to: auxId });
        linkIndex[mainItem.id] = (linkIndex[mainItem.id] || []).concat(key);
        linkIndex[auxId] = (linkIndex[auxId] || []).concat(key);
        relatedIndex[mainItem.id] = (relatedIndex[mainItem.id] || []).concat(auxId);
        relatedIndex[auxId] = [mainItem.id];
      });
    });

  return { pairs, linkIndex, relatedIndex };
}

function buildFlowLayout(flowItems, buckets, granularity) {
  const rowsEnd = [];
  const placement = {};
  const ordered = flowItems
    .map((item) => {
      const startKey = getTimeKey(item.startDate, granularity);
      const span = bucketSpan(item, buckets, granularity);
      const isCross = span > 1;
      const startIndex = Math.max(0, buckets.indexOf(startKey));
      const endIndex = Math.max(startIndex, startIndex + span - 1);
      return { item, startIndex, endIndex, span, isCross };
    })
    .sort((a, b) => {
      if (a.startIndex !== b.startIndex) return a.startIndex - b.startIndex;
      if (a.endIndex !== b.endIndex) return a.endIndex - b.endIndex;
      return a.item.id.localeCompare(b.item.id);
    });

  ordered.forEach((meta) => {
    let row = rowsEnd.findIndex((endIndex) => meta.startIndex > endIndex);
    if (row === -1) {
      row = rowsEnd.length;
      rowsEnd.push(meta.endIndex);
    } else {
      rowsEnd[row] = meta.endIndex;
    }
    placement[meta.item.id] = { ...meta, row };
  });

  return { placement };
}

export function buildLaneRows(
  list,
  laneName,
  buckets,
  granularity,
  cardHeight = TIMELINE_CARD_HEIGHT
) {
  const flowOrder = laneName === 'main'
    ? ['投资阶段', '三会管理', '投后报告', '股权退出', '运营管理']
    : ['任务管理'];
  const flowMap = new Map();

  list
    .filter((item) => item._lane === laneName)
    .forEach((item) => {
      const flowName = getBusinessFlow(item);
      if (!flowMap.has(flowName)) flowMap.set(flowName, []);
      flowMap.get(flowName).push(item);
    });

  let flowNames = Array.from(flowMap.keys()).sort((a, b) => {
    const ao = flowOrder.indexOf(a) === -1 ? 999 : flowOrder.indexOf(a);
    const bo = flowOrder.indexOf(b) === -1 ? 999 : flowOrder.indexOf(b);
    if (ao !== bo) return ao - bo;
    return a.localeCompare(b, 'zh-CN');
  });

  if (!flowNames.length) {
    flowNames = [laneName === 'main' ? '股权投资' : '任务管理'];
    flowMap.set(flowNames[0], []);
  }

  return flowNames.map((flowName) => {
    const flowItems = flowMap.get(flowName) || [];
    const layout = buildFlowLayout(flowItems, buckets, granularity);
    const bucketRows = Array.from({ length: buckets.length }, () => 1);

    Object.values(layout.placement).forEach((meta) => {
      for (let i = meta.startIndex; i <= meta.endIndex; i += 1) {
        bucketRows[i] = Math.max(bucketRows[i], meta.row + 1);
      }
    });

    return {
      flowName,
      layout,
      cells: buckets.map((bucket, bucketIndex) => {
        const rowCount = bucketRows[bucketIndex];
        return {
          bucket,
          height:
            rowCount * cardHeight +
            Math.max(0, rowCount - 1) * TIMELINE_CARD_GAP +
            TIMELINE_CELL_VERTICAL_PADDING,
          items: flowItems
            .filter((item) => getTimeKey(item.startDate, granularity) === bucket)
            .sort((a, b) => (layout.placement[a.id]?.row || 0) - (layout.placement[b.id]?.row || 0)),
        };
      }),
    };
  });
}
