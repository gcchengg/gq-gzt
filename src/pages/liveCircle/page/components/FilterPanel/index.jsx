import React from 'react';
import { statusOptions } from '../../utils/timeline';

const managementProcessOptions = [
  { value: 'all', label: '全部业务流程' },
  { value: '任务管理', label: '任务管理' },
  { value: '运营管理', label: '运营管理' },
  { value: '股权投资', label: '股权投资' },
];

const mergeOptions = (baseOptions, optionMap, currentValue) => {
  const nextOptions = baseOptions.slice();
  const seen = new Set(nextOptions.map((item) => String(item.value)));

  Object.entries(optionMap || {}).forEach(([value, label]) => {
    if (seen.has(String(value))) return;
    nextOptions.push({ value, label });
    seen.add(String(value));
  });

  if (currentValue && currentValue !== 'all' && !seen.has(String(currentValue))) {
    nextOptions.push({ value: currentValue, label: currentValue });
  }

  return nextOptions;
};

export default function FilterPanel({
  bizUnitOptions,
  filters,
  processOptions,
  onChange,
  onReset,
  onQuery,
  perspective,
}) {
  const mergedProcessOptions =
    perspective === 'management'
      ? managementProcessOptions
      : mergeOptions(
          [{ value: 'all', label: '全部业务流程' }],
          processOptions,
          filters.processName
        );
  const processValue = mergedProcessOptions.some(
    (item) => String(item.value) === String(filters.processName)
  )
    ? filters.processName
    : 'all';
  const mergedBizUnitOptions = mergeOptions([], bizUnitOptions, filters.bizUnitName);

  return (
    <section className="card panel">
      <div className={`filter-grid${perspective === 'management' ? ' management' : ''}`}>
        <div className="field">
          <label>业务流程</label>
          <select
            className="select"
            value={processValue}
            onChange={(event) => onChange('processName', event.target.value)}
          >
            {mergedProcessOptions.map((item) => (
              <option value={item.value} key={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        {perspective !== 'management' && (
          <div className="field">
            <label>业务单元</label>
            <select
              className="select"
              value={filters.bizUnitName}
              onChange={(event) => onChange('bizUnitName', event.target.value)}
            >
              <option value="all">全部业务单元</option>
              {mergedBizUnitOptions.map((item) => (
                <option value={item.value} key={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="field">
          <label>状态</label>
          <select
            className="select"
            value={filters.status}
            onChange={(event) => onChange('status', event.target.value)}
          >
            {statusOptions.map((item) => (
              <option value={item.value} key={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field description-field">
          <label>任务描述搜索</label>
          <input
            className="input"
            value={filters.description}
            placeholder="输入任务描述关键词"
            onChange={(event) => onChange('description', event.target.value)}
          />
        </div>
        <div className="action-row">
          <button className="btn-secondary" type="button" onClick={onReset}>
            重置
          </button>
          <button className="btn" type="button" onClick={onQuery}>
            查询
          </button>
        </div>
      </div>
    </section>
  );
}
