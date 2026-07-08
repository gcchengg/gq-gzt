import React from 'react';

const COMPANY_STATUS_TEXT = {
  10000: '投资中',
  43000: '投资运营',
  50000: '运营部运营',
  60000: '退出运营',
  70000: '其他运营',
};

function formatShareRatio(value) {
  if (value === undefined || value === null || value === '') return '-';
  const ratio = Number(value);
  if (!Number.isFinite(ratio)) return '-';
  return `${Number((ratio * 100).toFixed(2))}%`;
}

export default function CompanySummary({ profile, doingCount, actionCount, onFilterDoing }) {
  return (
    <section className="company-info">
      <article className="info card">
        <b>{profile.dutyUserName || '-'}</b>
        <span>管户</span>
        <p>管理部门：{profile.orgName || '-'}</p>
      </article>
      <article className="info card">
        <b>{formatShareRatio(profile.shRatio)}</b>
        <span>持股比例</span>
        <p>投资金额：{`${profile.investCostAmt || '--'}万元` ?? '-'}</p>
      </article>
      <article className="info card clickable" onClick={onFilterDoing}>
        <b>{doingCount}</b>
        <span>进行中活动</span>
        <p>执行活动：{actionCount} 条</p>
      </article>
      <article className="info card">
        <b>{COMPANY_STATUS_TEXT[profile.opsProgStatus] || '-'}</b>
        <span>公司状态</span>
        <p>当前阶段状态</p>
      </article>
    </section>
  );
}
