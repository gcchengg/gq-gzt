import { InfoCircleOutlined } from "@ant-design/icons";
import { Popover } from "antd";
import styles from "./index.module.less";
const descriptions = {
  专家库看板: [
    "汇总专家资源、待办、领域覆盖、履约评价和观点回溯，帮助用户判断资源状态与服务质量。",
    "股权运营部、专家库管理员、需求部门及授权管理人员。",
    "查看专家及调用指标、评价趋势、观点回溯，并打开最近评价记录或跳转业务待办。",
    "看板负责汇总、分析和导航；履约评价与观点回溯分别统计，不相互覆盖。",
  ],
  专家管理: [
    "查询在库专家档案，并办理推荐名单、合作邀请、资料核对、审批、发送聘书和签署。",
    "股权运营部、专家库管理员、需求部门及授权管理人员。",
    "在库专家中检索档案并办理续聘或解聘；入库办理中处理推荐名单、邀请和申请。",
    "在库档案与入库申请分开管理；签署完成后才生成可调用专家档案。首次及续聘固定3年。",
  ],
  调用管理: [
    "管理专家服务从需求申请、受理、匹配、排期邀约到成果验收。",
    "需求部门发起、确认和验收；运营部受理、复核和锁定排期；专家在小程序履约。",
    "填写背景、问题、领域、时间、成果、预算和权限；保存草稿、确认专家、查看并验收成果。",
    "受理后才能匹配；仅合规可用专家可邀约；只有正式成果版本可以验收。",
  ],
  运营管理: [
    "维护专家库共同使用的分类、准入、匹配、费用、模板、通知和审计规则。",
    "股权运营部、专家库管理员及授权系统管理员。",
    "配置领域标签、等级、匹配权重、调用上限、费用标准及业务模板。",
    "重要规则需版本化并设置生效时间；当前主要为配置演示。",
  ],
  专家入库审批: [
    "承接首次入库和续聘申请，由分管领导完成线上审批。",
    "分管领导办理，需求部门和运营部去执行。",
    "查看首次入库资料或续聘理由、拟聘期及年龄上限，填写意见并通过或退回。",
    "首次通过后待签发聘书；续聘通过后待签发续聘聘书；完成签订后聘任才生效。",
  ],
  专家调用申请受理: [
    "审核调用申请是否完整、必要、合规并具备执行条件。",
    "股权运营部受理，需求部门按退回意见修改。",
    "查看背景、问题、领域、时间、成果、预算及材料权限，填写意见并受理或退回。",
    "通过后进入匹配，退回后恢复草稿；这是业务受理，不是领导审批。",
  ],
};
export default function PageHelp({ page, compact = false }) {
  const data = descriptions[page];
  if (!data) return null;
  const labels = ["页面用途", "使用角色", "主要操作", "流转规则"];
  return (
    <Popover
      placement="rightTop"
      trigger="hover"
      title={`${page} · 页面说明`}
      content={
        <div className={styles.content}>
          {data.map((text, i) => (
            <div className={styles.row} key={labels[i]}>
              <strong>{labels[i]}</strong>
              <p>{text}</p>
            </div>
          ))}
        </div>
      }
    >
      <button
        type="button"
        className={styles.trigger}
        aria-label={`${page}页面说明`}
      >
        <InfoCircleOutlined />
        <span>{compact ? "说明" : "页面说明"}</span>
      </button>
    </Popover>
  );
}
