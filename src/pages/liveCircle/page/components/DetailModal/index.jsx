import React from 'react';
import { statusNames } from '../../data';
import {
  getBusinessFlow,
  getBusinessUnit,
  getOwner,
  getTaskDescription,
  getTaskTitle,
} from '../../utils/timeline';
import { getInfoDetail1, getProjectDetail } from '../../../api/index';

const envConfig = import.meta.env.VITE_ENV_CONFIG || import.meta.env.MODE;

function getDetailBaseUrl() {
  if (envConfig === 'dev' || envConfig === 'uat') {
    return 'https://uat-iwork.faw.cn/gq-0207_app_002';
  }
  return 'https://iwork.faw.cn/gq-0207_app_002';
}
function getDetailBaseUrlMC() {
  if (envConfig === 'dev' || envConfig === 'uat') {
    return 'https://uat-iwork.faw.cn/fei-mc';
  }
  return 'https://iwork.faw.cn/gq-0207_app_002';
}

export default function DetailModal({ event, relatedIds, onClose, perspective }) {
  if (!event) return null;

  const isManagementRichText = perspective === 'management' && event._lane === 'aux';

  const handleJumpDetail = (event) => {
    console.log('event', event);
    if (event.processName === '任务管理') {
      window.open(
        `${getDetailBaseUrlMC()}/managerList?progType=${event.progStatus ?? ''}&projectId=${
          event.bizId ?? ''
        }`
      );
    } else if (event.processName === '运营管理') {
      getInfoDetail1(event.companyId).then((res) => {
        if (res.code === 200) {
          console.log('res.data', res.data.opsProgStatus);
          window.open(
            `${getDetailBaseUrlMC()}/manageBoard?progType=${res.data.opsProgStatus}&projectId=${
              event.bizId ?? ''
            }`
          );
        }
      });
    } else if (event.processName === '股权投资' || event.processName === '股权投资流程') {
      if (event.eventName.includes('项目接收')) {
        getProjectDetail(event.bizId).then((res) => {
          if (res.code === 200 && res.data) {
            window.open(
              `${getDetailBaseUrl()}/projectReceive?progType=${
                perspective === 'management' ? event.shProgStatus : event.progStatus
              }&projectId=${event.bizId ?? ''}&rowId=${res.data.acqId ?? ''}`
            );
          }
        });
      } else if (event.eventName.includes('项目考察与论证')) {
        window.open(
          `${getDetailBaseUrl()}/project?progType=${
            perspective === 'management' ? event.shProgStatus : event.progStatus
          }&projectId=${event.bizId ?? ''}`
        );
      } else if (event.eventName.includes('项目立项')) {
        window.open(
          `${getDetailBaseUrl()}/projectInitiation?progType=${
            perspective === 'management' ? event.shProgStatus : event.progStatus
          }&projectId=${event.bizId ?? ''}`
        );
      } else if (event.eventName.includes('尽职调查')) {
        window.open(
          `${getDetailBaseUrl()}/dueDiligence?progType=${
            perspective === 'management' ? event.shProgStatus : event.progStatus
          }&projectId=${event.bizId ?? ''}`
        );
      } else if (event.eventName.includes('决策交割')) {
        window.open(
          `${getDetailBaseUrl()}/policydecision?progType=${
            perspective === 'management' ? event.shProgStatus : event.progStatus
          }&projectId=${event.bizId ?? ''}`
        );
      }
    } else if (event.processName === '三会管理') {
      window.open(
        `${getDetailBaseUrl()}/assign?progType=${
          perspective === 'management' ? event.shProgStatus : event.progStatus
        }&projectId=${event.bizId ?? ''}`
      );
    } else {
      window.open(
        `${getDetailBaseUrl()}/assign?progType=${
          perspective === 'management' ? event.shProgStatus : event.progStatus
        }&projectId=${event.bizId ?? ''}`
      );
    }
  };

  return (
    <>
      <div className="modal-mask show" onClick={onClose} />
      <section className="modal show" aria-hidden="false">
        <div className="modal-hd">
          <h3>
            {isManagementRichText
              ? '事件详情'
              : perspective === 'management'
                ? event.eventName || '-'
                : getTaskTitle(event)}
          </h3>
          <button className="btn-secondary" type="button" onClick={onClose}>
            关闭
          </button>
        </div>
        <div className="modal-bd">
          {perspective === 'management' ? (
            <div className="kv">
              <b>事件名称</b>：
              {isManagementRichText ? (
                <div
                  className="management-detail-rich-text"
                  dangerouslySetInnerHTML={{ __html: event.eventName || '-' }}
                />
              ) : (
                event.eventName || '-'
              )}
              <br />
              <b>责任人</b>：{event.dutyUserName || '-'}
              <br />
              <b>开始时间</b>：{event.createDate || '-'}
              <br />
              <b>结束时间</b>：{event.finishDate || '-'}
              <br />
              <b>状态</b>：{event.statusText || statusNames[event.status]}
            </div>
          ) : (
            <>
              <div className="kv">
                <b>业务流程</b>：{getBusinessFlow(event)}
                <br />
                <b>业务单元</b>：{getBusinessUnit(event)}
                <br />
                <b>任务名称</b>：{event.taskName || '-'}
                <br />
                <b>任务描述</b>：{getTaskDescription(event)}
                <br />
                <b>分发人</b>：{getOwner(event)}
                {event.distributeUserCode ? `（${event.distributeUserCode}）` : ''}
                <br />
                <b>状态</b>：{statusNames[event.status]}
                <br />
                <b>计划开始</b>：{event.taskPlanBeginDate || event.startDate || '-'}
                <br />
                <b>计划完成</b>：{event.taskPlanFinishDate || event.endDate || '-'}
                <br />
                <b>实际开始</b>：{event.taskBeginDate || event.actualStartDate || '-'}
                <br />
                <b>实际完成</b>：
                {event.taskFinishDate ||
                  event.actualEndDate ||
                  (event.status === 0 ? '未完成' : '-')}
              </div>
              <div className="kv">
                <b>关联关系</b>：
                {relatedIds.length
                  ? `当前活动关联 ${relatedIds.length} 个活动（${relatedIds.join(
                      '、'
                    )}）。时间轴默认展示流程关联线。`
                  : '当前活动暂无显式关联任务。'}
              </div>
            </>
          )}
          {/* {perspective === 'task' ? ( */}
          <div className="modal-actions">
            <button className="btn" type="button" onClick={() => handleJumpDetail(event)}>
              跳转详情
            </button>
          </div>
          {/* ) : null} */}
        </div>
      </section>
    </>
  );
}
