import {
  Alert,
  Button,
  Card,
  Collapse,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Tag,
  Timeline,
  message,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  calculateAllowance,
  canReadReimbursement,
  currentActor,
  displayTime,
  mask,
  money,
  saveReimbursement,
  savePaymentAccount,
  paymentAccountComplete,
  settlementProfile,
  shanghaiDate,
} from "../../settlement";
import { updateStore, useExpertStore } from "../../store";
import { useExpertConfig } from "../../configStore";
import styles from "./index.module.less";
import ApprovalDetails from "../ApprovalDetails";

export default function Reimbursement({ taskId }) {
  const state = useExpertStore();
  const config = useExpertConfig();
  const navigate = useNavigate();
  const actor = currentActor(state);
  const task = state.tasks.find((item) => item.id === taskId);
  const record = state.reimbursements.find(
    (item) => item.taskId === taskId && item.status !== "已作废",
  );
  const expert = state.experts.find((item) => item.id === task?.expertId);
  const profile =
    record && !["草稿", "已退回"].includes(record.status)
      ? record.profileSnapshot
      : settlementProfile(state, task?.expertId);
  const fee =
    record && !["草稿", "已退回"].includes(record.status)
      ? record.feeSnapshot
      : config.fees.find((item) => item.key === profile?.feeId);
  const [form] = Form.useForm();
  const lines = Form.useWatch("lines", form) || [];
  const period = Form.useWatch("period", form) || "业余";
  const amount = Form.useWatch("amount", form);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const editable =
    task?.applicantId === actor.id &&
    (!record || ["草稿", "已退回"].includes(record.status)) &&
    !record?.batchId;
  const rule =
    record && !editable ? record.billingRule : config.closing.billingRule;
  const allowance =
    record && !editable
      ? record.standardCents
      : calculateAllowance(lines, fee, period, rule);
  const isOver = Number(amount) * 100 > allowance;
  useEffect(() => {
    form.setFieldsValue(
      record
        ? {
            lines: record.lines,
            amount: record.amountCents / 100,
            period: record.period,
            reason: record.reason,
            accountName:
              record.paymentDraft?.accountName ?? profile?.accountName,
            bankName: record.paymentDraft?.bankName ?? profile?.bankName,
            bankAccount:
              record.paymentDraft?.bankAccount ?? profile?.bankAccount,
          }
        : {
            lines: [
              {
                date: task?.consultationRecord?.consultDate || shanghaiDate(),
                days: 0.5,
                minutes: task?.consultationRecord?.minutes || 240,
              },
            ],
            period: "业余",
            amount: undefined,
            reason: "",
            accountName: profile?.accountName,
            bankName: profile?.bankName,
            bankAccount: profile?.bankAccount,
          },
    );
  }, [taskId, record?.id, record?.version, record?.status, form]);
  useEffect(() => setApprovalOpen(false), [taskId]);
  if (!task) return <Alert type="warning" message="调用记录不存在" />;
  if (task.stage !== "已评价完成")
    return <Alert type="info" message="已评价完成后可办理调用报销" />;
  if (task.freeService)
    return (
      <Alert type="success" message="无偿调用，无需费用结算，不生成BX单据" />
    );
  if (
    (record && !canReadReimbursement(state, record)) ||
    (!record && task.applicantId !== actor.id)
  )
    return (
      <Alert type="warning" message="仅原调用人可查看本人报销并办理提交" />
    );
  function persist(mutator, success) {
    try {
      updateStore(mutator);
      message.success(success);
      return true;
    } catch (error) {
      message.error(error.message || "保存失败");
      return false;
    }
  }
  async function save(submit) {
    try {
      const values = submit
        ? await form.validateFields()
        : form.getFieldsValue(true);
      persist(
        (next) => saveReimbursement(next, taskId, values, submit, config),
        submit ? "演示报销已提交，外部审批接口待接入" : "报销草稿已保存",
      );
    } catch (error) {
      if (error.message) message.error(error.message);
    }
  }
  async function saveAccount() {
    try {
      const values = await form.validateFields([
        "accountName",
        "bankName",
        "bankAccount",
      ]);
      persist((next) => {
        savePaymentAccount(next, task.expertId, values);
        const draft = next.reimbursements.find(
          (item) => item.id === record?.id,
        );
        if (draft) delete draft.paymentDraft;
      }, "收款资料已保存并关联专家档案");
    } catch (error) {
      if (error.message) message.error(error.message);
    }
  }
  const source =
    record?.sourceSnapshot?.consultationRecord || task.consultationRecord;
  return (
    <div className={styles.content}>
      <div className={styles.actionBar}>
        <Space wrap>
          <Tag color={record?.status === "已审批" ? "success" : "processing"}>
            {record?.status || "未发起报销"}
          </Tag>
          <b>{record?.number || "保存后自动生成BX编号"}</b>
          {record?.isOver ? <Tag color="warning">税前超标</Tag> : null}
        </Space>
        <Space>
          {record ? (
            <Button onClick={() => setApprovalOpen(true)}>审批详情</Button>
          ) : null}
          <Button
            onClick={() =>
              navigate(`/zj/tasks?taskId=${encodeURIComponent(task.id)}`)
            }
          >
            查看调用申请与成果
          </Button>
          {record?.batchId ? (
            <Button
              onClick={() =>
                navigate(
                  `/zj/settlement?tab=batches&batchId=${encodeURIComponent(record.batchId)}`,
                )
              }
            >
              查看汇总 {record.batchNumber}
            </Button>
          ) : null}
        </Space>
      </div>
      <Descriptions
        bordered
        size="small"
        column={2}
        items={[
          { key: "project", label: "咨询事项 / 项目", children: task.project },
          { key: "id", label: "调用编号", children: task.id },
          {
            key: "expert",
            label: "专家姓名",
            children: expert?.name || task.expert,
          },
          {
            key: "type",
            label: "内外部身份",
            children: profile?.expertType || "待补齐",
          },
          {
            key: "level",
            label: "计费等级",
            children: fee?.level || "待关联运营标准",
          },
          { key: "identity", label: "证件号码", children: mask(profile?.idNo) },
          {
            key: "applicant",
            label: "原调用人 / 需求部门",
            children: `${task.applicant || "—"} / ${task.department}`,
          },
          {
            key: "bank",
            label: "收款资料",
            children: `${mask(profile?.bankAccount)} · ${paymentAccountComplete(profile) ? "已补齐" : "待补充"}`,
          },
        ]}
      />
      <Form form={form} layout="vertical" disabled={!editable}>
        {editable ? (
          <Card size="small" title="收款资料">
            <Form.Item
              name="accountName"
              label="收款户名"
              rules={[
                { required: true, whitespace: true, message: "请填写收款户名" },
              ]}
            >
              <Input autoComplete="off" />
            </Form.Item>
            <Form.Item
              name="bankName"
              label="开户行"
              rules={[
                { required: true, whitespace: true, message: "请填写开户行" },
              ]}
            >
              <Input autoComplete="off" />
            </Form.Item>
            <Form.Item
              name="bankAccount"
              label="银行卡号"
              rules={[
                { required: true, message: "请填写银行卡号" },
                { pattern: /^\d{6,30}$/, message: "银行卡号须为6—30位数字" },
              ]}
            >
              <Input autoComplete="off" />
            </Form.Item>
            <Button onClick={saveAccount}>保存收款资料</Button>
          </Card>
        ) : (
          <Descriptions
            size="small"
            column={2}
            items={[
              {
                key: "name",
                label: "收款户名",
                children: profile?.accountName || "待补充",
              },
              {
                key: "bank",
                label: "开户行",
                children: profile?.bankName || "待补充",
              },
              {
                key: "account",
                label: "银行卡号",
                children: mask(profile?.bankAccount),
              },
            ]}
          />
        )}

        {profile?.expertType === "内部" ? (
          <Form.Item name="period" label="计费时段">
            <Select
              options={[
                { value: "业余", label: "业余时间" },
                { value: "工作", label: "工作时间" },
              ]}
            />
          </Form.Item>
        ) : null}
        <div className={styles.sectionHeader}>
          <b>实际服务明细</b>
          <span>元/人/半天 · 0.5天对应1个半天</span>
        </div>
        <Form.List name="lines">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...rest }) => (
                <div key={key} className={styles.serviceLine}>
                  <Form.Item
                    {...rest}
                    name={[name, "date"]}
                    label="服务日期"
                    rules={[{ required: true }]}
                  >
                    <Input type="date" max={shanghaiDate()} />
                  </Form.Item>
                  <Form.Item
                    {...rest}
                    name={[name, "days"]}
                    label="计费天数"
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={0.5} max={1} step={0.5} />
                  </Form.Item>
                  <Form.Item
                    {...rest}
                    name={[name, "minutes"]}
                    label="实际时长（分钟）"
                    rules={rule === "legacy" ? [{ required: true }] : []}
                  >
                    <InputNumber min={1} max={1440} />
                  </Form.Item>
                  {editable ? (
                    <Button
                      aria-label="删除服务日期"
                      disabled={fields.length <= 1}
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(name)}
                    />
                  ) : null}
                </div>
              ))}
              {editable ? (
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => add({ days: 0.5, minutes: 240 })}
                >
                  增加服务日期
                </Button>
              ) : null}
            </>
          )}
        </Form.List>
        <div className={styles.amounts}>
          <Card size="small">
            <span>税前半天标准</span>
            <strong>
              ¥{" "}
              {money(
                fee
                  ? Math.round(
                      Number(
                        period === "工作" && fee.workAmount != null
                          ? fee.workAmount
                          : fee.amount,
                      ) * 100,
                    )
                  : 0,
              )}
            </strong>
            <small>
              {fee?.basis || "待关联"} ·{" "}
              {rule === "legacy" ? "原时长折算规则" : "按半天计费"}
            </small>
          </Card>
          <Card size="small">
            <span>标准税前应付</span>
            <strong>¥ {money(allowance)}</strong>
            <small>
              {record?.feeSnapshot
                ? `标准快照 v${record.feeSnapshot.version}`
                : `运营配置 v${config.version}`}
            </small>
          </Card>
          <Card size="small">
            <span>超标金额</span>
            <strong className={isOver ? styles.warning : undefined}>
              ¥{" "}
              {money(
                Math.max(
                  0,
                  Math.round((Number(amount) || 0) * 100) - allowance,
                ),
              )}
            </strong>
            <small>
              {isOver ? "追加分管领导审批" : "部门负责人 → 财务负责人"}
            </small>
          </Card>
        </div>
        <Form.Item
          name="amount"
          label="申请报销金额（税前，元）"
          rules={[{ required: true, message: "请输入税前报销金额" }]}
        >
          <InputNumber min={0.01} precision={2} />
        </Form.Item>
        <Form.Item
          name="reason"
          label={isOver ? "超标原因（必填）" : "说明 / 服务差异原因"}
          rules={
            isOver
              ? [
                  {
                    required: true,
                    whitespace: true,
                    message: "请填写超标原因",
                  },
                ]
              : []
          }
        >
          <Input.TextArea rows={3} />
        </Form.Item>
        {editable ? (
          <Space>
            <Button onClick={() => save(false)}>保存草稿</Button>
            <Button type="primary" onClick={() => save(true)}>
              提交审批
            </Button>
          </Space>
        ) : !record ? (
          <Alert type="info" message="由原调用人录入和提交报销" />
        ) : null}
      </Form>
      <Collapse
        items={[
          {
            key: "source",
            label: "正式咨询记录与交付物（来源版本）",
            children: (
              <Descriptions
                bordered
                column={1}
                size="small"
                items={[
                  {
                    key: "date",
                    label: "咨询日期",
                    children: source?.consultDate || "—",
                  },
                  {
                    key: "purpose",
                    label: "咨询目的",
                    children: source?.purpose || "—",
                  },
                  {
                    key: "judgment",
                    label: "专家判断",
                    children: source?.judgment || "—",
                  },
                  {
                    key: "files",
                    label: "交付物",
                    children:
                      source?.attachments
                        ?.map((file) => file.name)
                        .join("、") ||
                      source?.attachment ||
                      "无附件",
                  },
                ]}
              />
            ),
          },
        ]}
      />
      <ApprovalDetails
        recordId={record?.id}
        open={approvalOpen}
        onClose={() => setApprovalOpen(false)}
      />
      {record?.history?.length ? (
        <Card size="small" title="办理轨迹">
          <Timeline
            items={record.history.map((item, index) => ({
              key: index,
              children: (
                <>
                  <b>{item.actor}</b> · {displayTime(item.at)}
                  <p>{item.text}</p>
                </>
              ),
            }))}
          />
        </Card>
      ) : null}
    </div>
  );
}
