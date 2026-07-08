import React from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Input } from 'antd';

const { Search } = Input;

const COMPANY_STATUS_TEXT = {
  10000: '投资中',
  43000: '投资运营',
  50000: '运营部运营',
  60000: '退出运营',
  70000: '其他运营',
};

export default function CompanySidebar({
  companyList,
  currentCompany,
  companySearchValue,
  companyLoading,
  companyPagination,
  onChangeCompany,
  onCompanySearchValueChange,
  onCompanySearch,
  onCompanyPageChange,
  perspective,
  onChangePerspective,
}) {
  const { current, pageSize, total } = companyPagination;
  const pageCount = Math.max(Math.ceil(total / pageSize), 1);
  const canPrev = current > 1 && !companyLoading;
  const canNext = current < pageCount && !companyLoading;

  return (
    <aside className="card side">
      <div className="perspective-tabs" role="tablist" aria-label="视角切换">
        <button
          className={`perspective-tab${perspective === 'management' ? ' active' : ''}`}
          type="button"
          role="tab"
          aria-selected={perspective === 'management'}
          onClick={() => onChangePerspective('management')}
        >
          管理者视角
        </button>
        <button
          className={`perspective-tab${perspective === 'task' ? ' active' : ''}`}
          type="button"
          role="tab"
          aria-selected={perspective === 'task'}
          onClick={() => onChangePerspective('task')}
        >
          任务视角
        </button>
      </div>

      <div className="side-head">
        <div>
          <h2>参股公司</h2>
        </div>
        <span className="side-count">{total} 家</span>
      </div>

      <div className="company-tools">
        <Search
          allowClear
          // className="side-company-search"
          enterButton="搜索"
          loading={companyLoading}
          placeholder="搜索公司名称"
          value={companySearchValue}
          onChange={(event) => onCompanySearchValueChange(event.target.value)}
          onSearch={onCompanySearch}
        />
        <div className="side-pager">
          <button
            className="pager-btn"
            type="button"
            disabled={!canPrev}
            onClick={() => onCompanyPageChange(current - 1, pageSize)}
          >
            <LeftOutlined />
          </button>
          <div className="pager-current">
            <b>{current}</b>
            <span>/ {pageCount}</span>
          </div>
          <button
            className="pager-btn"
            type="button"
            disabled={!canNext}
            onClick={() => onCompanyPageChange(current + 1, pageSize)}
          >
            <RightOutlined />
          </button>
          <select
            className="pager-size"
            value={pageSize}
            disabled={companyLoading}
            onChange={(event) => onCompanyPageChange(1, Number(event.target.value))}
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>{size} 条/页</option>
            ))}
          </select>
        </div>
      </div>

      <div className="company-list">
        {companyList.length ? (
          companyList.map((company) => (
            <button
              className={`company-item${currentCompany === company.id ? ' active' : ''}${company.opsProgStatus === '10000' || company.opsProgStatus === '43000' ? ' status-invest' : ' status-operate'}`}
              type="button"
              key={company.id}
              onClick={() => onChangeCompany(company.id, company)}
            >
              <b>{company.companyName}</b>
              <span>管理部门：{company.orgName || '-'} ｜ 管户：{company.dutyUserName || '-'}</span>
              <span className="company-status">
                公司状态：{COMPANY_STATUS_TEXT[company.opsProgStatus] || '-'}
              </span>
            </button>
          ))
        ) : (
          <div className="company-empty">暂无匹配公司</div>
        )}
      </div>
    </aside>
  );
}
