import { Button, Image, Input, Modal, Radio, Tag, Tooltip, message } from "antd";
import { EyeOutlined, QuestionCircleOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { useState } from "react";
import "./index.css";

const scoreRows = [
  {
    key: "1",
    dimension: "合规性",
    subDimension: "实质合规",
    element: "外部管理规定",
    result: "pass",
  },
  {
    key: "2",
    dimension: "合规性",
    subDimension: "实质合规",
    element: "内部管理规定",
    result: "pass",
  },
  {
    key: "3",
    dimension: "合规性",
    subDimension: "实质合规",
    element: "控股股东要求",
    result: "pass",
  },
  {
    key: "4",
    dimension: "合规性",
    subDimension: "程序合规",
    element: "审议程序",
    result: "pass",
  },
  {
    key: "5",
    dimension: "合理性",
    subDimension: "工作开展情况",
    element: "成效、问题及相应举措",
    weight: "100",
    result: "100",
  },
];

const linkedMaterials = [
  {
    key: "material-1",
    page: 1,
    file: "20250428中联电子议题关键信息页(1).pdf",
    note: "请补充资产净值口径及附件来源说明。",
  },
  {
    key: "material-2",
    page: 3,
    file: "T3出行董事会及临时股东会议案.pdf",
    note: "处置价格依据需要与原始议案保持一致。",
  },
  {
    key: "material-3",
    page: 5,
    file: "20250428中联电子议题关键信息页(1).pdf",
    note: "已标记前置审议程序及审批节点。",
  },
];

export default function EvaluationModelScore({
  hideScore = false,
  hideModelAction = false,
  hideMaterialAction = false,
  hideExecutionColumn = false,
  hideExceptionColumn = false,
  showAiEvaluation = false,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeElement, setActiveElement] = useState("");

  const openMaterialDrawer = (row) => {
    setActiveElement(row.element);
    setDrawerOpen(true);
  };

  return (
    <>
      <section className="eval-score-card eval-opinion-model-score">
        <div className="eval-model-block">
          <div className="eval-model-head">
            <div className="eval-model-title">评估模型</div>
            {!hideModelAction ? (
              <div className="eval-model-actions">
                <Button type="primary">更换模型</Button>
              </div>
            ) : null}
          </div>
          <div className="eval-model-grid">
            <div className="eval-model-field">
              <div className="eval-model-field-label">模型目录</div>
              <div className="eval-model-field-value">
                1.经营类 / 1.3 定期监管报告 / 1.3.1
                按国家部委等上级机构监管要求定期报告事项
              </div>
            </div>
            <div className="eval-model-field">
              <div className="eval-model-field-label">模型版本</div>
              <div className="eval-model-field-value">V1.0</div>
            </div>
            <div className="eval-model-field">
              <div className="eval-model-field-label">联审方</div>
              <div className="eval-model-field-value">
                审计风控与法务部 / 财务部
              </div>
            </div>
            <div className="eval-model-field">
              <div className="eval-model-field-label">审批层级</div>
              <div className="eval-model-field-value">业务总监</div>
            </div>
            <div className="eval-model-field">
              <div className="eval-model-field-label">当前状态</div>
              <div className="eval-model-field-value">有效</div>
            </div>
            <div className="eval-model-field">
              <div className="eval-model-field-label">创建人</div>
              <div className="eval-model-field-value">系统预置</div>
            </div>
            <div className="eval-model-field">
              <div className="eval-model-field-label">最后更新人</div>
              <div className="eval-model-field-value">郑华峰</div>
            </div>
            <div className="eval-model-field">
              <div className="eval-model-field-label">最后更新时间</div>
              <div className="eval-model-field-value">2025-06-21 19:05:05</div>
            </div>
          </div>
        </div>

        {!hideScore ? (
          <>
            <div className="eval-score-head">
              <div className="eval-score-title">评估评分</div>
              {showAiEvaluation ? (
                <div className="eval-ai-action">
                  <Button
                    type="primary"
                    icon={<ThunderboltOutlined />}
                    onClick={() => message.success("AI评估已生成")}
                  >
                    AI评估
                  </Button>
                  <Tooltip title="1.根据评注内容和模型评价规则智能评估执行情况及评价结果">
                    <QuestionCircleOutlined className="eval-ai-help-icon" />
                  </Tooltip>
                </div>
              ) : null}
            </div>
            <table className="data-table eval-grade-table">
              <colgroup>
                <col style={{ width: "8%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "5%" }} />
                {!hideExecutionColumn ? <col style={{ width: "18%" }} /> : null}
                <col style={{ width: "14%" }} />
                <col style={{ width: "10%" }} />
                {!hideExceptionColumn ? <col style={{ width: "7%" }} /> : null}
                <col style={{ width: "14%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>一级维度</th>
                  <th>二级维度</th>
                  <th>评价要素</th>
                  <th>权重</th>
                  {!hideExecutionColumn ? (
                    <th>
                      <span className="eval-table-title-help">
                        执行情况
                        <Tooltip title="1.根据选择的批注截图，自动生成执行情况">
                          <QuestionCircleOutlined className="eval-table-help-icon" />
                        </Tooltip>
                      </span>
                    </th>
                  ) : null}
                  <th>评价规则</th>
                  <th>评价结果(分)</th>
                  {!hideExceptionColumn ? <th>异常提示</th> : null}
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {scoreRows.map((row, index) => (
                  <tr key={row.key}>
                    {index === 0 ? (
                      <td rowSpan="4" className="dimension-cell">
                        合规性
                      </td>
                    ) : null}
                    {index === 4 ? (
                      <td className="dimension-cell">合理性</td>
                    ) : null}
                    <td>{row.subDimension}</td>
                    <td>{row.element}</td>
                    <td className="center">{row.weight || ""}</td>
                    {!hideExecutionColumn ? (
                      <td>
                        <div className="eval-textbox">
                          {row.result === "pass" ? "通过" : ""}
                        </div>
                      </td>
                    ) : null}
                    <td className="rule-cell">
                      <Tooltip
                        placement="topLeft"
                        title={
                          row.result === "pass"
                            ? "符合要求或不涉及，通过；不符合要求，否决该议案"
                            : "有效开展，或有相应问题解决举措"
                        }
                      >
                        <span className="eval-rule-ellipsis">
                          {row.result === "pass"
                            ? "符合要求或不涉及，通过；不符合要求，否决该议案"
                            : "有效开展，或有相应问题解决举措"}
                        </span>
                      </Tooltip>
                    </td>
                    <td className="result-cell">
                      {row.result === "pass" ? (
                        <Radio.Group defaultValue="pass">
                          <Radio value="fail">不通过</Radio>
                          <Radio value="pass">通过</Radio>
                        </Radio.Group>
                      ) : (
                        <>
                          <Input defaultValue="100" />
                          {/* <Button size="small">不打分</Button> */}
                        </>
                      )}
                    </td>
                    {!hideExceptionColumn ? (
                      <td className="center">
                        <span className="green-dot"></span>
                      </td>
                    ) : null}
                    <td className="center">
                      {hideMaterialAction ? (
                        <span className="eval-readonly-mark">已关联</span>
                      ) : (
                        <div className="eval-op-actions">
                          <Button
                            className="eval-op-action"
                            type="link"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => openMaterialDrawer(row)}
                          >
                            查看关联材料
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="eval-score-summary-row">
              <div className="eval-grade-note">
                总得分（1、得分≥80分，议题通过；2、80分&gt;得≥60，议题通过，但要提出管理意见或提示项；3、得分&lt;60分，不通过；4、合规性维度任意一项不通过，议题不通过）
              </div>
              <div className="eval-grade-total">100</div>
            </div>
          </>
        ) : null}
      </section>

      <Modal
        title={`${activeElement} · 关联材料`}
        width={920}
        open={drawerOpen}
        footer={null}
        onCancel={() => setDrawerOpen(false)}
      >
        <div className="eval-material-drawer-tip">
          以下截屏均来自已完成批注的文件页面，包含原文内容及批注意见。
        </div>
        <div className="eval-material-grid">
          {linkedMaterials.map((material) => (
            <article className="eval-material-card" key={material.key}>
              <div className="eval-material-preview">
                <Image
                  src="/advice-review/6a2133fde4b0cb6abf664a41.pdf.png"
                  alt={`${material.file} 第${material.page}页`}
                />
                <span className="eval-material-annotation">
                  {material.note}
                </span>
              </div>
              <div className="eval-material-card-head">
                <Tag color="blue">第 {material.page} 页</Tag>
                <span title={material.file}>{material.file}</span>
              </div>
              <p>{material.note}</p>
            </article>
          ))}
        </div>
      </Modal>
    </>
  );
}
