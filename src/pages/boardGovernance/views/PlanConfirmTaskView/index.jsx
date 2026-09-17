import { useEffect } from "react";
import {
  Alert,
  Breadcrumb,
  Button,
  Descriptions,
  Form,
  Input,
  Select,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  EditOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { confirmationOwners } from "../../dutyPlanData";
import {
  dutyQuarters,
  dutyYears,
  planTypes,
  workCategories,
} from "../../dutyPlanOptions";
import { PageHeader, SectionCard, StatusPill } from "../../components/PageKit";
import styles from "./index.module.less";

export default function PlanConfirmTaskView({
  plans,
  onSave,
  embedded = false,
  onClose,
}) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planId = searchParams.get("planId");
  const plan = plans.find((item) => item.id === planId);
  const [form] = Form.useForm();
  const completed = plan?.status === "已完成";

  useEffect(() => {
    if (!plan) return;
    form.setFieldsValue({
      directorName: plan.directorName,
      servingCompany: plan.servingCompany,
      dutyYear: plan.dutyYear,
      dutyQuarter: plan.dutyQuarter,
      type: plan.type,
      workCategory: plan.workCategory,
      content: plan.content,
      owner: plan.owner,
      confirmOwner: plan.confirmOwner,
      date: plan.date,
      target: plan.target,
      confirmationNote: plan.confirmationNote,
    });
  }, [form, plan]);

  if (!plan) {
    return (
      <div className={`${styles.page} ${embedded ? styles.embedded : ""}`}>
        <Alert
          type="warning"
          showIcon
          message="未找到该年度履职计划确认任务"
          action={
            embedded ? (
              <Button type="link" onClick={onClose}>
                返回任务列表
              </Button>
            ) : (
              <Link to="/boardGovernance/home">返回工作台首页</Link>
            )
          }
        />
      </div>
    );
  }

  const save = async (submit) => {
    const values = await form.validateFields();
    onSave(plan.id, values, submit);
    if (submit) {
      message.success("确认结果已提交，年度履职计划状态已更新");
      if (embedded) {
        onClose?.();
        return;
      }
      navigate("/boardGovernance/directors?stage=preparation");
      return;
    }
    message.success(
      completed ? "年度履职计划修改已保存" : "修改内容已保存，可继续编辑后提交",
    );
  };

  return (
    <div className={`${styles.page} ${embedded ? styles.embedded : ""}`}>
      {!embedded ? (
        <>
          <Breadcrumb
            className={styles.breadcrumb}
            items={[
              { title: <Link to="/boardGovernance/home">工作台首页</Link> },
              { title: "年度履职计划确认" },
              { title: plan.content },
            ]}
          />
          <PageHeader
            eyebrow="PLAN CONFIRMATION TASK"
            title={
              completed ? "编辑年度履职计划确认结果" : "年度履职计划确认任务"
            }
            subtitle={`${plan.confirmOwner} · ${plan.servingCompany} · ${plan.dutyYear}${plan.dutyQuarter}`}
            actions={
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/boardGovernance/home")}
              >
                返回工作台
              </Button>
            }
          />
        </>
      ) : null}
      <div className={styles.summary}>
        <div>
          <UserOutlined />
          <span>确认责任人</span>
          <strong>{plan.confirmOwner}</strong>
        </div>
        <div>
          <EditOutlined />
          <span>计划类型</span>
          <strong>{plan.type}</strong>
        </div>
        <div>
          <CheckCircleOutlined />
          <span>任务状态</span>
          <StatusPill>{plan.status}</StatusPill>
        </div>
      </div>
      <SectionCard
        title={completed ? "确认结果编辑" : "计划确认与修改"}
        extra={
          <span className={styles.helper}>
            {completed
              ? `已于 ${plan.confirmedAt} 提交，可继续修改保存`
              : "修改后请提交确认结果"}
          </span>
        }
      >
        <Descriptions
          className={styles.planInfo}
          bordered
          column={2}
          items={[
            { key: "name", label: "姓名", children: plan.directorName },
            {
              key: "company",
              label: "任职企业",
              children: plan.servingCompany,
            },
            { key: "category", label: "工作类别", children: plan.workCategory },
            {
              key: "period",
              label: "履职周期",
              children: `${plan.dutyYear} · ${plan.dutyQuarter}`,
            },
          ]}
        />
        <Form form={form} layout="vertical">
          <h4 className={styles.formSectionTitle}>履职基础信息</h4>
          <div className={styles.formGrid}>
            <Form.Item name="directorName" label="姓名">
              <Input disabled />
            </Form.Item>
            <Form.Item
              name="servingCompany"
              label="任职企业"
              rules={[{ required: true, message: "请填写任职企业" }]}
            >
              <Input placeholder="请输入任职企业" />
            </Form.Item>
            <Form.Item
              name="dutyYear"
              label="履职年度"
              rules={[{ required: true, message: "请选择履职年度" }]}
            >
              <Select options={dutyYears.map((value) => ({ value }))} />
            </Form.Item>
            <Form.Item
              name="dutyQuarter"
              label="履职季度"
              rules={[{ required: true, message: "请选择履职季度" }]}
            >
              <Select options={dutyQuarters.map((value) => ({ value }))} />
            </Form.Item>
          </div>
          <h4 className={styles.formSectionTitle}>计划与确认信息</h4>
          <div className={styles.formGrid}>
            <Form.Item name="type" label="计划类型">
              <Select options={planTypes.map((value) => ({ value }))} />
            </Form.Item>
            <Form.Item name="workCategory" label="工作类别">
              <Select options={workCategories.map((value) => ({ value }))} />
            </Form.Item>
            <Form.Item name="owner" label="责任部门">
              <Input placeholder="请输入责任部门" />
            </Form.Item>
            <Form.Item name="confirmOwner" label="确认责任人">
              <Select
                placeholder="请选择接收确认任务的责任人"
                options={confirmationOwners.map((value) => ({ value }))}
              />
            </Form.Item>
            <Form.Item
              name="date"
              label="计划时间"
              rules={[{ required: true, message: "请填写计划时间" }]}
            >
              <Input />
            </Form.Item>
          </div>
          <Form.Item
            name="content"
            label="计划内容"
            rules={[{ required: true, message: "请填写计划内容" }]}
          >
            <Input placeholder="请输入计划名称或主题" />
          </Form.Item>
          <Form.Item
            name="target"
            label="预期成果"
            rules={[{ required: true, message: "请填写预期成果" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="confirmationNote"
            label="确认说明"
            rules={[{ required: true, message: "请填写确认说明" }]}
          >
            <Input.TextArea rows={3} placeholder="请填写调整内容或确认意见" />
          </Form.Item>
        </Form>
      </SectionCard>
      <div className={styles.actionBar}>
        <span>
          {completed
            ? "保存后将同步更新年度履职计划编排表及已创建任务"
            : "提交后任务状态将变为已完成"}
        </span>
        <div>
          <Button
            onClick={() =>
              embedded ? onClose?.() : navigate("/boardGovernance/home")
            }
          >
            返回
          </Button>
          {completed ? (
            <Button type="primary" onClick={() => save(false)}>
              保存修改
            </Button>
          ) : (
            <>
              <Button onClick={() => save(false)}>保存修改</Button>
              <Button type="primary" onClick={() => save(true)}>
                提交确认
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
