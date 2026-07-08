import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { statusNames } from '../../data';
import {
  buildBucketsByRange,
  buildLaneRows,
  formatEventTime,
  formatRulerLabel,
  getBusinessFlow,
  getBusinessUnit,
  getOwner,
  getTaskDescription,
  getTimeKey,
  granularityOptions,
  MANAGEMENT_TIMELINE_CARD_HEIGHT,
  statusClass,
  TIMELINE_CARD_GAP,
  TIMELINE_CARD_HEIGHT,
} from '../../utils/timeline';

const MAX_COLLAPSED_CARDS = 4;

const getCellGroupKey = (item, granularity) =>
  [item._lane, getBusinessFlow(item), getTimeKey(item.startDate, granularity)].join('::');

function EventCard({
  item,
  meta,
  relatedCount,
  active,
  expanded,
  located,
  onOpen,
  onHover,
  onLeave,
  onToggleExpand,
  setEventRef,
  perspective,
  cardHeight,
}) {
  const taskDesc = getTaskDescription(item);
  const span = meta?.span || 1;
  const row = meta?.row || 0;
  const rowTop = row * (cardHeight + TIMELINE_CARD_GAP) + 4;
  const isManagementRichText = perspective === 'management' && item._lane === 'aux';

  return (
    <article
      ref={(node) => setEventRef(item.id, node)}
      className={`event ${item._lane}${perspective === 'management' ? ' management' : ' timeline-event'}${meta?.isCross && span > 1 ? ' range-span' : ''}${active ? ' highlight' : ''}${located ? ' located' : ''}`}
      data-id={item.id}
      style={{
        width: `calc(${span} * var(--col-w) - 12px)`,
        top: `${rowTop}px`,
        height: 'auto',
      }}
      onClick={() => onOpen(item)}
      onMouseEnter={() => onHover(item.id)}
      onMouseLeave={onLeave}
    >
      {located ? <span className="located-badge">最新定位</span> : null}
      {perspective === 'management' ? (
        <>
          <div className="event-head">
            {isManagementRichText ? (
              <div
                className="event-title management-rich-text"
                dangerouslySetInnerHTML={{ __html: item.eventName || '-' }}
              />
            ) : (
              <div className="event-title">{item.eventName || '-'}</div>
            )}
            <span className={`pill ${item.statusClass || statusClass[item.status]}`}>
              {item.statusText || statusNames[item.status]}
            </span>
          </div>
          <div className="event-management-info">
            <span>责任人：{item.dutyUserName || '-'}</span>
            <span>开始时间：{item.createDate || '-'}</span>
            <span>结束时间：{item.finishDate || '-'}</span>
          </div>
        </>
      ) : (
        <>
          <div className="event-head">
            <div className="event-content">
              <div className={`event-title${expanded ? ' expanded' : ''}`}>{taskDesc}</div>
              {taskDesc.length > 36 ? (
                <button
                  className="event-desc-toggle"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleExpand(item.id);
                  }}
                >
                  {expanded ? '收起' : '展开全部'}
                </button>
              ) : null}
              <div className="event-subtitle">
                <span>业务单元：{getBusinessUnit(item)}</span>
                <span className="event-owner">{getOwner(item)}</span>
              </div>
            </div>
            <span className={`pill ${statusClass[item.status]}`}>{statusNames[item.status]}</span>
          </div>
          <div>
            <div className="event-time">{formatEventTime(item)}</div>
            {/* <div className="event-meta">
              <span>{item.currentInstanceCode || item.id}</span>
              <span>{getBusinessFlow(item)}</span>
              <span>责任人：{getOwner(item)}</span>
              {relatedCount ? <span className="link-chip">关联 {relatedCount} 项</span> : null}
            </div> */}
          </div>
        </>
      )}
    </article>
  );
}

export default function TimelineView({
  list,
  profile,
  granularity,
  relations,
  activeEventId,
  detailOpen,
  locatedEventId,
  scrollToEventId,
  onChangeGranularity,
  onOpenDetail,
  onHoverEvent,
  onClearHover,
  onScrollHandled,
  onToast,
  perspective,
}) {
  const [expandedCards, setExpandedCards] = useState({});
  const [expandedCellGroups, setExpandedCellGroups] = useState({});
  const [linkPaths, setLinkPaths] = useState([]);
  const [boardScrollWidth, setBoardScrollWidth] = useState(0);
  const boardRef = useRef(null);
  const topScrollRef = useRef(null);
  const bodyScrollRef = useRef(null);
  const eventRefs = useRef({});
  const cardHeight =
    perspective === 'management' ? MANAGEMENT_TIMELINE_CARD_HEIGHT : TIMELINE_CARD_HEIGHT;

  const buckets = useMemo(() => buildBucketsByRange(list, granularity), [list, granularity]);
  const cellGroupMeta = useMemo(() => {
    const groups = {};
    list.forEach((item) => {
      const key = getCellGroupKey(item, granularity);
      groups[key] = (groups[key] || 0) + 1;
    });
    return groups;
  }, [granularity, list]);
  const visibleList = useMemo(() => {
    const groupIndexes = {};
    return list.filter((item) => {
      const key = getCellGroupKey(item, granularity);
      groupIndexes[key] = (groupIndexes[key] || 0) + 1;
      return expandedCellGroups[key] || groupIndexes[key] <= MAX_COLLAPSED_CARDS;
    });
  }, [expandedCellGroups, granularity, list]);
  const mainRows = useMemo(
    () => buildLaneRows(visibleList, 'main', buckets, granularity, cardHeight),
    [buckets, cardHeight, granularity, visibleList]
  );
  const auxRows = useMemo(
    () => buildLaneRows(visibleList, 'aux', buckets, granularity, cardHeight),
    [buckets, cardHeight, granularity, visibleList]
  );
  const colW = granularity === 'day' ? 220 : 280;
  const activeRelatedIds = useMemo(() => (
    activeEventId ? [activeEventId].concat(relations.relatedIndex[activeEventId] || []) : []
  ), [activeEventId, relations.relatedIndex]);
  const activeLinkKeys = useMemo(() => {
    const keys = new Set();
    activeRelatedIds.forEach((id) => (relations.linkIndex[id] || []).forEach((key) => keys.add(key)));
    return keys;
  }, [activeRelatedIds, relations.linkIndex]);

  const setEventRef = (id, node) => {
    if (node) eventRefs.current[id] = node;
    else delete eventRefs.current[id];
  };

  useLayoutEffect(() => {
    let raf = 0;
    const draw = () => {
      const board = boardRef.current;
      if (!board || !relations.pairs.length) {
        setLinkPaths([]);
        return;
      }

      const boardRect = board.getBoundingClientRect();
      const boardW = Math.ceil(board.scrollWidth);
      const boardH = Math.ceil(board.scrollHeight);
      setBoardScrollWidth(boardW);
      const nextPaths = relations.pairs
        .map((pair) => {
          const fromEl = eventRefs.current[pair.from];
          const toEl = eventRefs.current[pair.to];
          if (!fromEl || !toEl) return null;

          const fromRect = fromEl.getBoundingClientRect();
          const toRect = toEl.getBoundingClientRect();
          const x1 = fromRect.right - boardRect.left + 8;
          const y1 = fromRect.top + fromRect.height / 2 - boardRect.top;
          const x2 = toRect.right - boardRect.left + 8;
          const y2 = toRect.top + toRect.height / 2 - boardRect.top;
          const span = Math.max(22, Math.abs(x2 - x1) * 0.2);
          const xMid = Math.min(boardW - 20, Math.max(x1, x2) + span);
          return {
            ...pair,
            boardW,
            boardH,
            d: `M ${x1} ${y1} C ${xMid} ${y1}, ${xMid} ${y2}, ${x2} ${y2}`,
          };
        })
        .filter(Boolean);
      setLinkPaths(nextPaths);
    };

    raf = window.requestAnimationFrame(draw);
    window.addEventListener('resize', draw);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', draw);
    };
  }, [buckets, list, relations.pairs]);

  useLayoutEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    setBoardScrollWidth(Math.ceil(board.scrollWidth));
  }, [buckets, list, granularity]);

  const syncTimelineScroll = (source) => {
    const topScroll = topScrollRef.current;
    const bodyScroll = bodyScrollRef.current;
    if (!topScroll || !bodyScroll) return;

    if (source === 'top' && bodyScroll.scrollLeft !== topScroll.scrollLeft) {
      bodyScroll.scrollLeft = topScroll.scrollLeft;
    }
    if (source === 'body' && topScroll.scrollLeft !== bodyScroll.scrollLeft) {
      topScroll.scrollLeft = bodyScroll.scrollLeft;
    }
  };

  useEffect(() => {
    if (!scrollToEventId) return;

    const targetItem = list.find((item) => item.id === scrollToEventId);
    if (targetItem) {
      const groupKey = getCellGroupKey(targetItem, granularity);
      if (cellGroupMeta[groupKey] > MAX_COLLAPSED_CARDS && !expandedCellGroups[groupKey]) {
        setExpandedCellGroups((prev) => ({ ...prev, [groupKey]: true }));
        return;
      }
    }

    window.requestAnimationFrame(() => {
      const target = eventRefs.current[scrollToEventId];
      if (target) target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      onScrollHandled();
    });
  }, [
    cellGroupMeta,
    expandedCellGroups,
    granularity,
    list,
    onScrollHandled,
    scrollToEventId,
  ]);

  const renderLaneRows = (rows, laneName) => rows.map((row) => (
    <div className="flow-row" key={row.flowName}>
      <div className="flow-label">{row.flowName}</div>
      <div className="flow-grid">
        {row.cells.map((cell) => {
          const groupKey = [laneName, row.flowName, cell.bucket].join('::');
          const groupCount = cellGroupMeta[groupKey] || 0;
          const hasCollapsedCards = groupCount > MAX_COLLAPSED_CARDS;
          const cellHeight = cell.height + (hasCollapsedCards ? 34 : 0);

          return (
            <div
              className="lane-cell"
              style={{ minHeight: cellHeight }}
              key={`${row.flowName}-${cell.bucket}`}
            >
              {cell.items.map((item) => {
                const meta = row.layout.placement[item.id];
                return (
                  <EventCard
                    key={item.id}
                    item={item}
                    meta={meta}
                    relatedCount={(relations.relatedIndex[item.id] || []).length}
                    active={activeRelatedIds.includes(item.id)}
                    expanded={Boolean(expandedCards[item.id])}
                    located={item.id === locatedEventId}
                    onOpen={onOpenDetail}
                    onHover={onHoverEvent}
                    onLeave={() => {
                      if (!detailOpen) onClearHover();
                    }}
                    onToggleExpand={(id) =>
                      setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }))
                    }
                    setEventRef={setEventRef}
                    perspective={perspective}
                    cardHeight={cardHeight}
                  />
                );
              })}
              {hasCollapsedCards ? (
                <button
                  className="lane-cell-collapse"
                  type="button"
                  onClick={() =>
                    setExpandedCellGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }))
                  }
                >
                  {expandedCellGroups[groupKey]
                    ? '收起'
                    : `展开其余 ${groupCount - MAX_COLLAPSED_CARDS} 项`}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  ));

  return (
    <div className="timeline-wrap">
      <div className="axis-note">
        <small>核心运营流程：投资、三会管理、投后报告、股权退出 | 管理支持流程：督办任务、公司走访、参加会议</small>
        <div className="axis-tools">
          <div className="granularity-switch" aria-label="时间轴粒度切换">
            {granularityOptions.map((item) => (
              <button
                className={`gbtn${granularity === item.value ? ' active' : ''}`}
                type="button"
                key={item.value}
                onClick={() => {
                  onChangeGranularity(item.value);
                  onToast(`已切换为${item.label}视图`);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <small>{profile.companyName || '-'}：当前展示 {list.length} 条活动</small>
        </div>
      </div>
      <div
        className="timeline-top-scroll"
        ref={topScrollRef}
        onScroll={() => syncTimelineScroll('top')}
      >
        <div style={{ width: boardScrollWidth || '100%', height: 1 }} />
      </div>
      <div
        className="timeline-scroll"
        ref={bodyScrollRef}
        onScroll={() => syncTimelineScroll('body')}
      >
        <div
          className={`timeline-board${perspective === 'management' ? ' management' : ''}`}
          ref={boardRef}
          style={{ '--col-w': `${colW}px` }}
        >
          <div className="timeline-ruler">
            {buckets.map((bucket) => <div className="time-col" key={bucket}>{formatRulerLabel(bucket, granularity)}</div>)}
          </div>
          <svg className="link-layer" aria-hidden="true" width={linkPaths[0]?.boardW || 0} height={linkPaths[0]?.boardH || 0} viewBox={`0 0 ${linkPaths[0]?.boardW || 0} ${linkPaths[0]?.boardH || 0}`}>
            <defs>
              <marker id="live-circle-arrow-base" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L8,3 L0,6 z" fill="rgba(78, 111, 178, 0.62)" />
              </marker>
              <marker id="live-circle-arrow-active" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L8,3 L0,6 z" fill="rgba(46, 80, 201, 0.95)" />
              </marker>
            </defs>
            {linkPaths.map((path) => (
              <path
                className={`link-path${activeLinkKeys.has(path.key) ? ' active' : ''}`}
                data-key={path.key}
                d={path.d}
                key={path.key}
              />
            ))}
          </svg>
          <div className="lane main-lane">
            <div className="lane-label main">
              <span className="lane-badge" />
              <span>核心运营流程</span>
            </div>
            <div className="lane-grid">{renderLaneRows(mainRows, 'main')}</div>
          </div>
          <div className="lane aux-lane">
            <div className="lane-label aux">
              <span className="lane-badge" />
              <span>管理支持流程</span>
            </div>
            <div className="lane-grid">{renderLaneRows(auxRows, 'aux')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
