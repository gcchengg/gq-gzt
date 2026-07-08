import React from 'react';
import { statusNames } from '../../data';
import {
  getBusinessFlow,
  getBusinessUnit,
  getFlowType,
  getOwner,
  getTaskDescription,
  getTaskTitle,
  statusClass,
} from '../../utils/timeline';

export default function ListView({ list, onOpenDetail, perspective }) {
  return (
    <div className="list">
      {list.map((item) => (
        <article className="list-item" key={item.id} onClick={() => onOpenDetail(item)}>
          {perspective === 'management' ? (
            <div className="list-main">
              <b>{item.eventName || '-'}</b>
              <p>责任人：{item.dutyUserName || '-'}</p>
              <p>开始时间：{item.createDate || '-'}</p>
              <p>结束时间：{item.finishDate || '-'}</p>
            </div>
          ) : (
            <div className="list-main">
              <b>{getTaskTitle(item)}</b>
              <p>任务描述：{getTaskDescription(item)}</p>
              <p>业务单元：{getBusinessUnit(item)}</p>
              <p>流程实例：{item.currentInstanceCode || item.id} ｜ 业务ID：{item.bizId || '-'}</p>
              <p>计划开始：{item.startDate || '-'} ｜ 计划结束：{item.endDate || (item.status === 0 ? '未完成' : item.startDate || '-')}</p>
              <p>流程类型：{getFlowType(item)} ｜ 业务流程：{getBusinessFlow(item)}</p>
              <p>责任人：{getOwner(item)}</p>
            </div>
          )}
          <div>
            <span className={`pill ${item.statusClass || statusClass[item.status]}`}>
              {perspective === 'management'
                ? item.statusText || statusNames[item.status]
                : statusNames[item.status]}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
