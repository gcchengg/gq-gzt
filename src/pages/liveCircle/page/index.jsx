import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';
import { getEvents, getMgtEvents, getMgtTableEvents, getTableEvents } from './data';
import CompanySidebar from './components/CompanySidebar';
import CompanySummary from './components/CompanySummary';
import DetailModal from './components/DetailModal';
import FilterPanel from './components/FilterPanel';
import ListView from './components/ListView';
import PageHeader from './components/PageHeader';
import TimelineView from './components/TimelineView';
import TaskIssueDrawer from '@/components/TaskIssueDrawer';
import { computeRelations, defaultFilters, getTaskDescription } from './utils/timeline';
import './index.css';
import { businessProcessOption, getCompanyList, getCompanyDetail, getMgtInfo } from '../api/index';
const DEFAULT_COMPANY_PAGE_SIZE = 10;
const DETAIL_VIEW_TYPE = {
  timeline: 0,
  list: 1,
};

const getCompanyPageData = (res, fallback) => {
  const payload = res?.data;
  const nextList = Array.isArray(payload)
    ? payload
    : payload?.records || payload?.list || payload?.rows || payload?.data || [];
  const list = Array.isArray(nextList) ? nextList : [];

  return {
    list,
    current:
      Number(
        (Array.isArray(payload)
          ? res?.currentPage || res?.current
          : payload?.currentPage || payload?.current || payload?.pageNum) || fallback.currentPage
      ) || fallback.currentPage,
    pageSize:
      Number((Array.isArray(payload) ? res?.pageSize : payload?.pageSize) || fallback.pageSize) ||
      fallback.pageSize,
    total:
      Number((Array.isArray(payload) ? res?.total : payload?.total) ?? list.length) || list.length,
  };
};

const getCompanyDetailParams = (companyId, viewType, filters) => {
  const params = {
    companyId,
    viewType,
  };

  const processName = String(filters.processName || '').trim();
  const bizUnitName = String(filters.bizUnitName || '').trim();
  const description = String(filters.description || '').trim();

  if (processName && processName !== 'all') params.processName = processName;
  if (bizUnitName && bizUnitName !== 'all') params.bizUnitName = bizUnitName;
  if (filters.status !== 'all' && filters.status !== undefined && filters.status !== '') {
    params.status = Number(filters.status);
  }
  if (description) params.description = description;

  return params;
};

const getFilteredEvents = (events, currentCompany, filters) => {
  const description = filters.description.trim().toLowerCase();
  return events
    .filter((item) => item._companyId === currentCompany)
    .filter((item) =>
      filters.processName === 'all' ? true : item._processName === filters.processName
    )
    .filter((item) =>
      filters.bizUnitName === 'all'
        ? true
        : (item.bizUnitName || item.businessUnit) === filters.bizUnitName
    )
    .filter((item) =>
      filters.status === 'all' ? true : String(item.status) === String(filters.status)
    )
    .filter((item) => {
      if (!description) return true;
      return getTaskDescription(item).toLowerCase().includes(description);
    })
    .sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)));
};

const getBusinessOptionMap = (list = []) =>
  (Array.isArray(list) ? list : []).reduce((acc, item) => {
    const optionName = item?.bizUnitName || item?.bitUnitName;
    if (optionName) acc[optionName] = optionName;
    return acc;
  }, {});

export default function LiveCirclePage() {
  const [companyList, setCompanyList] = useState([]);
  const [currentCompany, setCurrentCompany] = useState('');
  const [companySearchValue, setCompanySearchValue] = useState('');
  const [companyQueryName, setCompanyQueryName] = useState('');
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyPagination, setCompanyPagination] = useState({
    current: 1,
    pageSize: DEFAULT_COMPANY_PAGE_SIZE,
    total: 0,
  });
  const [detailData, setDetailData] = useState({});
  const [perspective, setPerspective] = useState('management');
  const [filters, setFilters] = useState(defaultFilters);
  const [activeTab, setActiveTab] = useState('timeline');
  const [sideHidden, setSideHidden] = useState(false);
  const [detailEvent, setDetailEvent] = useState(null);
  const [activeEventId, setActiveEventId] = useState(null);
  const [scrollToEventId, setScrollToEventId] = useState('');
  const [locatedEventId, setLocatedEventId] = useState('');
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);
  const [timelineFullscreen, setTimelineFullscreen] = useState(false);
  const [pendingLocateLatest, setPendingLocateLatest] = useState(false);
  const [businessProcessOptions, setBusinessProcessOptions] = useState({});
  const [businessUnitOptions, setBusinessUnitOptions] = useState({});
  const {
    bizUnitName,
    description: filterDescription,
    processName,
    status: filterStatus,
  } = filters;

  const selectedCompany = useMemo(
    () => companyList.find((item) => item.id === currentCompany) || {},
    [companyList, currentCompany]
  );
  const profile = { ...selectedCompany, ...detailData };
  const timelineEvents = useMemo(
    () =>
      perspective === 'management'
        ? getMgtEvents(detailData, currentCompany)
        : getEvents(detailData, currentCompany),
    [currentCompany, detailData, perspective]
  );
  const tableEvents = useMemo(
    () =>
      perspective === 'management'
        ? getMgtTableEvents(detailData, currentCompany)
        : getTableEvents(detailData, currentCompany),
    [currentCompany, detailData, perspective]
  );

  const showToast = useCallback((text) => {
    message.success(text);
  }, []);

  const filteredTimelineList = useMemo(
    () => getFilteredEvents(timelineEvents, currentCompany, filters),
    [currentCompany, filters, timelineEvents]
  );
  const filteredTableList = useMemo(
    () => getFilteredEvents(tableEvents, currentCompany, filters),
    [currentCompany, filters, tableEvents]
  );
  const filteredList = activeTab === 'list' ? filteredTableList : filteredTimelineList;

  const relations = useMemo(() => computeRelations(filteredTimelineList), [filteredTimelineList]);
  const doingCount =
    profile.activeActivity ?? filteredList.filter((item) => item.status === 0).length;
  const actionCount = profile.executeActivity ?? filteredList.length;
  const detailRelatedIds = detailEvent ? relations.relatedIndex[detailEvent.id] || [] : [];
  const detailRequestParams = useMemo(
    () =>
      currentCompany
        ? getCompanyDetailParams(currentCompany, DETAIL_VIEW_TYPE[activeTab], {
            bizUnitName,
            description: filterDescription,
            processName,
            status: filterStatus,
          })
        : null,
    [activeTab, bizUnitName, currentCompany, filterDescription, filterStatus, processName]
  );

  const requestCompanyList = useCallback((params = {}) => {
    const requestParams = {
      companyName: (params.companyName || '').trim(),
      currentPage: params.currentPage || 1,
      pageSize: params.pageSize || DEFAULT_COMPANY_PAGE_SIZE,
    };

    setCompanyLoading(true);
    return getCompanyList(requestParams)
      .then((res) => {
        if (!(res?.code == 200 || res?.success)) {
          message.error(res?.message || '参股公司列表查询失败');
          return;
        }

        const pageData = getCompanyPageData(res, requestParams);
        setCompanyList(pageData.list);
        setCompanyPagination({
          current: pageData.current,
          pageSize: pageData.pageSize,
          total: pageData.total,
        });
        setCurrentCompany((prevCompany) => {
          const nextCompany =
            pageData.list.find((item) => item.id === prevCompany) || pageData.list[0];
          return nextCompany?.id || '';
        });

        if (!pageData.list.length) {
          setDetailData({});
          setDetailEvent(null);
          setActiveEventId(null);
          setLocatedEventId('');
          setFilters(defaultFilters);
        }
      })
      .catch(() => {
        message.error('参股公司列表查询失败');
      })
      .finally(() => {
        setCompanyLoading(false);
      });
  }, []);

  const requestBusinessOptions = useCallback((processName = '') => {
    const nextProcessName = (processName || '').trim();
    return businessProcessOption({ processName: nextProcessName })
      .then((res) => {
        if (!(res?.code == 200 || res?.success)) {
          message.error(res?.message || '业务流程选项查询失败');
          return {};
        }
        return getBusinessOptionMap(res.data);
      })
      .catch(() => {
        message.error('业务流程选项查询失败');
        return {};
      });
  }, []);

  useEffect(() => {
    requestCompanyList({
      companyName: '',
      currentPage: 1,
      pageSize: DEFAULT_COMPANY_PAGE_SIZE,
    });
  }, [requestCompanyList]);

  useEffect(() => {
    let ignore = false;
    requestBusinessOptions('').then((options) => {
      if (!ignore) setBusinessProcessOptions(options);
    });
    return () => {
      ignore = true;
    };
  }, [requestBusinessOptions]);

  useEffect(() => {
    if (!processName || processName === 'all') {
      setBusinessUnitOptions({});
      return undefined;
    }

    let ignore = false;
    requestBusinessOptions(processName).then((options) => {
      if (!ignore) setBusinessUnitOptions(options);
    });
    return () => {
      ignore = true;
    };
  }, [processName, requestBusinessOptions]);

  useEffect(() => {
    if (!currentCompany) return undefined;
    let ignore = false;
    const requestDetail = perspective === 'management' ? getMgtInfo : getCompanyDetail;
    requestDetail(detailRequestParams)
      .then((res) => {
        if (ignore) return;
        if (res?.code == 200 || res?.success) {
          setDetailData(res.data || {});
          setDetailEvent(null);
          setActiveEventId(null);
          return;
        }
        message.error(res?.message || '参股公司生命周期查询失败');
      })
      .catch(() => {
        if (!ignore) message.error('参股公司生命周期查询失败');
      });
    return () => {
      ignore = true;
    };
  }, [currentCompany, detailRefreshKey, detailRequestParams, perspective]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (timelineFullscreen) {
        setTimelineFullscreen(false);
        return;
      }
      setDetailEvent(null);
      setActiveEventId(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [timelineFullscreen]);

  useEffect(() => {
    if (activeTab !== 'timeline') setTimelineFullscreen(false);
  }, [activeTab]);

  const setFilter = (key, value) => {
    setFilters((prev) => {
      if (key === 'processName') return { ...prev, processName: value, bizUnitName: 'all' };
      return { ...prev, [key]: value };
    });
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setDetailRefreshKey((prev) => prev + 1);
    showToast('筛选条件已重置');
  };

  const handleFilterQuery = () => {
    setDetailRefreshKey((prev) => prev + 1);
    showToast('筛选条件已提交，正在更新结果');
  };

  const handleCompanySearch = (value) => {
    const nextCompanyName = (value || '').trim();
    setCompanyQueryName(nextCompanyName);
    requestCompanyList({
      companyName: nextCompanyName,
      currentPage: 1,
      pageSize: companyPagination.pageSize,
    });
  };

  const handleCompanyPageChange = (currentPage, pageSize) => {
    requestCompanyList({
      companyName: companyQueryName,
      currentPage,
      pageSize,
    });
  };

  const openDetail = (item) => {
    setDetailEvent(item);
    setActiveEventId(item.id);
  };

  const closeDetail = () => {
    setDetailEvent(null);
    setActiveEventId(null);
  };

  const locateLatestEvent = useCallback(
    (list) => {
      if (!list.length) return false;
      const latest = list[list.length - 1];
      setActiveTab('timeline');
      setActiveEventId(latest.id);
      setLocatedEventId(latest.id);
      setScrollToEventId(latest.id);
      showToast(`已定位到最新活动`);
      // showToast(`已定位到最新活动：${latest.id}`);
      return true;
    },
    [showToast]
  );

  useEffect(() => {
    if (!pendingLocateLatest || activeTab !== 'timeline') return;
    if (!locateLatestEvent(filteredTimelineList)) return;
    setPendingLocateLatest(false);
  }, [activeTab, filteredTimelineList, locateLatestEvent, pendingLocateLatest]);

  const jumpLatest = () => {
    if (activeTab !== 'timeline') {
      setPendingLocateLatest(true);
      setActiveTab('timeline');
      return;
    }
    locateLatestEvent(filteredTimelineList);
  };
  return (
    <div className={`live-circle-page${sideHidden ? ' fullscreen' : ''}`}>
      <div className={`workspace${sideHidden ? ' side-hidden' : ''}`}>
        <CompanySidebar
          companyList={companyList}
          currentCompany={currentCompany}
          companySearchValue={companySearchValue}
          companyLoading={companyLoading}
          companyPagination={companyPagination}
          onCompanySearchValueChange={setCompanySearchValue}
          onCompanySearch={handleCompanySearch}
          onCompanyPageChange={handleCompanyPageChange}
          perspective={perspective}
          onChangePerspective={setPerspective}
          onChangeCompany={(code, company) => {
            setCurrentCompany(code);
            setActiveEventId(null);
            setDetailEvent(null);
            setLocatedEventId('');
            showToast(`已切换到：${company.companyName}`);
          }}
        />

        <main className="main">
          <PageHeader
            profile={profile}
            sideHidden={sideHidden}
            onToggleSide={() => {
              setSideHidden((prev) => !prev);
              showToast(sideHidden ? '已显示参股公司列表' : '已切换为全屏视图');
            }}
            onJumpLatest={jumpLatest}
          />

          <CompanySummary
            profile={profile}
            doingCount={doingCount}
            actionCount={actionCount}
            onFilterDoing={() => {
              setFilter('status', 0);
              showToast('已筛选进行中活动');
            }}
          />

          <FilterPanel
            bizUnitOptions={businessUnitOptions}
            filters={filters}
            processOptions={businessProcessOptions}
            onChange={setFilter}
            onReset={resetFilters}
            onQuery={handleFilterQuery}
            perspective={perspective}
          />

          <section
            className={`card panel timeline-panel${timelineFullscreen ? ' timeline-fullscreen' : ''}`}
          >
            <div className="panel-view-head">
              <div className="tabs">
                <button
                  className={`tab${activeTab === 'timeline' ? ' active' : ''}`}
                  type="button"
                  onClick={() => setActiveTab('timeline')}
                >
                  时间轴视图
                </button>
                <button
                  className={`tab${activeTab === 'list' ? ' active' : ''}`}
                  type="button"
                  onClick={() => setActiveTab('list')}
                >
                  列表视图
                </button>
              </div>
              {activeTab === 'timeline' ? (
                <button
                  className="fullscreen-icon-btn"
                  type="button"
                  aria-label={timelineFullscreen ? '退出全屏展示' : '全屏展示时间轴'}
                  title={timelineFullscreen ? '退出全屏展示' : '全屏展示时间轴'}
                  onClick={() => setTimelineFullscreen((prev) => !prev)}
                >
                  {timelineFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                  <span>{timelineFullscreen ? '退出全屏' : '全屏展示'}</span>
                </button>
              ) : null}
            </div>

            <div className="panel-view-body">
              {activeTab === 'timeline' ? (
                <TimelineView
                  list={filteredTimelineList}
                  profile={profile}
                  granularity={filters.granularity}
                  relations={relations}
                  activeEventId={activeEventId}
                  detailOpen={Boolean(detailEvent)}
                  locatedEventId={locatedEventId}
                  scrollToEventId={scrollToEventId}
                  onChangeGranularity={(value) => setFilter('granularity', value)}
                  onOpenDetail={openDetail}
                  onHoverEvent={setActiveEventId}
                  onClearHover={() => setActiveEventId(null)}
                  onScrollHandled={() => setScrollToEventId('')}
                  onToast={showToast}
                  perspective={perspective}
                />
              ) : (
                <ListView
                  list={filteredTableList}
                  onOpenDetail={openDetail}
                  perspective={perspective}
                />
              )}

              {!filteredList.length ? (
                <div className="empty show">
                  <div className="empty-title">当前筛选条件下暂无执行活动</div>
                  <div>
                    建议补充：确认是否限定了过窄时间范围或任务类型，可先恢复“全部”后重新查询。
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </main>
      </div>

      <DetailModal
        event={detailEvent}
        relatedIds={detailRelatedIds}
        onClose={closeDetail}
        perspective={perspective}
      />

      <TaskIssueDrawer
        onSubmit={(payload) => {
          // 调接口
          console.log(payload);
        }}
      />
    </div>
  );
}
