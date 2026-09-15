import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Input,
  Popconfirm,
  Space,
  Timeline,
  message,
} from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import { applicationFieldLabels } from "./enrollmentForms";
import {
  applicationComplete,
  checksConfirmed,
  complete,
  log,
  updateStore,
  useExpertStore,
} from "./store";
import PageHelp from "./components/PageHelp";

export default function ApprovalTasks({ kind }) {
  const state = useExpertStore();
  const [selected, setSelected] = useState(null);
  const [opinion, setOpinion] = useState("");
  const enrollment = kind === "enrollment";
  const title = enrollment ? "专家入库审批" : "专家调用申请受理";
  const pendingStage = enrollment ? "领导审批中" : "调用受理中";
  const source = enrollment
    ? [
        ...state.invitations.map((item) => ({
          ...item,
          approvalType: "enrollment",
        })),
        ...state.experts.map((item) => ({
          ...item,
          stage: item.status,
          approvalType: "renewal",
        })),
      ]
    : state.tasks;
  const rows = source.filter((item) =>
    enrollment
      ? Boolean(item.flowId) &&
        ["领导审批中", "续聘审批中"].includes(item.stage)
      : item.stage === pendingStage,
  );
  const record = source.find((item) => item.id === selected);

  function decide(passed) {
    if (!opinion.trim())
      return message.warning(
        enrollment ? "请填写分管领导审批意见" : "请填写股权运营部受理意见",
      );
    try {
      updateStore((store) => {
        const renewal = enrollment && record?.approvalType === "renewal";
        const item = (
          renewal ? store.experts : enrollment ? store.invitations : store.tasks
        ).find((entry) => entry.id === selected);
        const expectedStage = renewal ? "续聘审批中" : pendingStage;
        if (!item || (renewal ? item.status : item.stage) !== expectedStage)
          throw new Error("状态已变化，请刷新后处理");
        if (
          enrollment &&
          !renewal &&
          (!complete(item) ||
            !applicationComplete(item) ||
            !checksConfirmed(item))
        )
          throw new Error("履历、入库申请表或人工校验未满足审批条件");
        if (renewal) item.status = passed ? "待签发续聘聘书" : "待续聘";
        else
          item.stage = enrollment
            ? passed
              ? "待签发聘书"
              : "审批退回"
            : passed
              ? "匹配中"
              : "草稿";
        if (renewal && !passed) {
          delete item.flowId;
          item.renewal = { ...item.renewal, returnedOpinion: opinion.trim() };
        }
        item.history.push(
          log(
            enrollment ? "分管领导（线上审批演示）" : "股权运营部（受理演示）",
            `${passed ? (renewal ? "续聘审批通过，待签发续聘聘书" : enrollment ? "审批通过，待签发聘书" : "受理通过，进入专家匹配") : renewal ? "续聘申请退回，恢复待续聘" : "退回修改"}：${opinion.trim()}`,
          ),
        );
      });
      setSelected(null);
      setOpinion("");
      message.success("办理结果已保存");
    } catch (error) {
      message.error(error.message || "保存失败");
    }
  }

  const labels = {
    name: "专家姓名",
    company: "工作单位",
    field: "专业领域",
    project: "关联/调用项目",
    department: "需求部门",
    background: "项目背景",
    problem: "核心问题",
    serviceTime: "服务时间",
    due: "交付期限",
    delivery: "交付要求",
    budget: "预算上限",
    materials: "材料说明",
    permission: "材料权限",
  };
  const keys = enrollment
    ? record?.approvalType === "renewal"
      ? ["name", "company", "field", "termStart", "termEnd"]
      : ["name", "company", "field", "project", "department"]
    : [
        "project",
        "department",
        "background",
        "problem",
        "field",
        "serviceTime",
        "due",
        "delivery",
        "budget",
        "materials",
        "permission",
      ];
  const detailLabels = {
    ...labels,
    termStart: "当前聘期起始日",
    termEnd: "当前聘期结束日",
  };
  return (
    <>
      <section className="list-panel" aria-label={title}>
        <div className="list-title-row">
          <div className="list-title-left">
            <div className="list-title">
              {title}
              <PageHelp page={title} compact />
            </div>
            <div className="summary">
              <span className="chip">
                待办 <b>{rows.length}</b>
              </span>
            </div>
          </div>
          <Link
            className="manual-link"
            to={enrollment ? "/expertTalentList" : "/expertTalentTasks"}
            state={{ expertManagementTab: "enrollment" }}
          >
            前往业务页面
          </Link>
        </div>
        <div className="rows">
          {rows.length ? (
            rows.map((item) => (
              <article
                className="task-row"
                key={`${item.approvalType || "call"}-${item.id}`}
                style={{
                  padding: 20,
                  borderBottom: "1px solid #edf0f4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 20,
                }}
              >
                <div>
                  <strong>
                    {enrollment
                      ? `${item.name} · ${item.approvalType === "renewal" ? "续聘审批" : "入库审批"}`
                      : `${item.project} · 调用申请受理`}
                  </strong>
                  <p>
                    {item.flowId || item.id} · {item.field} · {item.stage}
                  </p>
                </div>
                <Button
                  type="link"
                  onClick={() => {
                    setSelected(item.id);
                    setOpinion("");
                  }}
                >
                  办理 / 查看详情
                </Button>
              </article>
            ))
          ) : (
            <p style={{ padding: 24, color: "#768898" }}>
              暂无待办，请从业务页面提交申请。
            </p>
          )}
        </div>
      </section>
      <Drawer
        title={
          <span>
            {record?.approvalType === "renewal" ? "专家续聘审批" : title}
            <PageHelp page={title} compact />
          </span>
        }
        width={760}
        open={!!record}
        onClose={() => setSelected(null)}
        extra={
          record &&
          (record.stage === pendingStage || record.stage === "续聘审批中") ? (
            <Space>
              <Popconfirm
                title="确认退回？"
                description={
                  record.approvalType === "renewal"
                    ? "退回后专家恢复为待续聘，可修改后重新发起。"
                    : "退回后将由发起人修改并重新提交。"
                }
                okText="确认退回"
                cancelText="取消"
                onConfirm={() => decide(false)}
              >
                <Button>退回修改</Button>
              </Popconfirm>
              <Popconfirm
                title={enrollment ? "确认审批通过？" : "确认受理通过？"}
                description={
                  record.approvalType === "renewal"
                    ? "通过后进入待签发续聘聘书状态。"
                    : enrollment
                      ? "通过后进入待签发聘书状态，签发完成后才正式入库。"
                      : "通过后进入专家匹配环节。"
                }
                okText="确认通过"
                cancelText="取消"
                onConfirm={() => decide(true)}
              >
                <Button type="primary">
                  {enrollment ? "审批通过" : "受理通过"}
                </Button>
              </Popconfirm>
            </Space>
          ) : null
        }
      >
        {record ? (
          <>
            <Alert
              type="info"
              message={
                record.approvalType === "renewal"
                  ? "本待办复用专家入库审批入口，由分管领导审批续聘；通过后由股权运营部登记续聘聘书。"
                  : enrollment
                    ? "本节点为分管领导线上审批。审批通过后进入待签发聘书状态；退回后由发起人补充或修改后重新提交。"
                    : "本节点由股权运营部受理专家调用申请，不是领导审批。受理通过后才可匹配专家。"
              }
            />
            <Descriptions
              style={{ marginTop: 16 }}
              bordered
              column={1}
              items={keys.map((key) => ({
                key,
                label: detailLabels[key],
                children: String(record[key] ?? "—"),
              }))}
            />
            {record.approvalType === "renewal" ? (
              <>
                <h3>续聘申请</h3>
                <Descriptions
                  bordered
                  column={1}
                  items={[
                    {
                      key: "reason",
                      label: "续聘理由",
                      children: record.renewal?.reason || "—",
                    },
                    {
                      key: "newTerm",
                      label: "拟续聘聘期",
                      children: record.renewal
                        ? `${record.renewal.termStart} 至 ${record.renewal.termEnd}`
                        : "—",
                    },
                    {
                      key: "limit",
                      label: "年龄上限",
                      children: `${record.highLevel ? 70 : 65}周岁`,
                    },
                  ]}
                />
              </>
            ) : enrollment ? (
              <>
                <h3>专家提交的全部入库资料</h3>
                <Descriptions
                  bordered
                  column={1}
                  items={Object.entries(record.profile || {}).map(
                    ([key, value]) => ({
                      key,
                      label:
                        {
                          name: "姓名",
                          gender: "性别",
                          birth: "出生日期",
                          idType: "证件类型",
                          idNo: "证件号码",
                          phone: "联系电话",
                          email: "邮箱",
                          company: "工作单位",
                          position: "职务 / 职称",
                          education: "最高学历、院校与专业",
                          educationPeriod: "教育起止时间与说明",
                          experience: "工作经历、起止时间、岗位",
                          years: "从业年限",
                          category: "专家类别",
                          domain: "主领域 / 细分方向",
                          keywords: "关联领域与技术关键词",
                          projects: "代表项目和本人职责",
                          roles: "可承担角色",
                          certificates: "证书及有效期",
                          results: "代表成果 / 获奖",
                          city: "常驻城市 / 服务地区",
                          service: "服务形式 / 可服务时间",
                          travel: "出差意愿",
                          attachment: "证明附件",
                          consent: "声明确认",
                          capability: "专业能力",
                          achievements: "资质成果",
                          willingness: "服务意愿",
                          declaration: "声明",
                        }[key] || key,
                      children:
                        typeof value === "boolean"
                          ? value
                            ? "已确认"
                            : "未确认"
                          : value,
                    }),
                  )}
                />
                <h3>专家入库申请表</h3>
                <Descriptions
                  bordered
                  column={1}
                  items={Object.entries(record.application || {}).map(
                    ([key, value]) => ({
                      key,
                      label: applicationFieldLabels[key] || key,
                      children: value,
                    }),
                  )}
                />
                <h3>三重校验（均已人工确认后方可提交）</h3>
                <Descriptions
                  bordered
                  column={1}
                  items={(record.checks || []).map((item) => ({
                    key: item.key,
                    label: item.name,
                    children: `${item.result} · ${item.detail} · ${item.confirmed ? "已人工确认" : "未人工确认"}`,
                  }))}
                />
              </>
            ) : null}
            <h3>办理轨迹</h3>
            <Timeline
              items={(record.history || []).map((item, index) => ({
                key: index,
                children: `${item.at} · ${item.actor} · ${item.text}`,
              }))}
            />
            {[pendingStage, "续聘审批中"].includes(record.stage) ? (
              <Input.TextArea
                rows={4}
                value={opinion}
                onChange={(event) => setOpinion(event.target.value)}
                placeholder={
                  enrollment
                    ? "分管领导审批意见（必填）"
                    : "股权运营部受理意见（必填）"
                }
              />
            ) : (
              <Alert message={`当前状态：${record.stage}，不可重复办理`} />
            )}
          </>
        ) : null}
      </Drawer>
    </>
  );
}
