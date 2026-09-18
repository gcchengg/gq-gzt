import { PlusOutlined, WarningOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Timeline,
  message,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { experts } from "./data";
import { demoNotice, log, uid, updateStore, useExpertStore } from "./store";
import styles from "./Calls.module.less";
import wb from "./workbench.module.less";
import PageHelp from "./components/PageHelp";
import {
  taskStageColor,
  taskStageHint,
  taskStageStrip,
  taskStageTone,
} from "./stages";

const fields = [
  ["project", "项目名称"],
  ["projectInvestment", "项目投资额（万元）"],
  ["department", "需求发起部门"],
  ["applicant", "申请人"],
  ["contact", "联系电话 / 邮箱"],
  ["background", "项目背景"],
  ["problem", "核心诉求"],
  ["field", "所需领域"],
  ["serviceTime", "预计服务时间段"],
  ["due", "最终交付截止时间"],
  ["delivery", "交付与验收要求"],
  ["materials", "材料说明（演示，不上传真实文件）"],
  ["permission", "材料访问权限"],
];
const textAreaFields = new Set([
  "background",
  "problem",
  "delivery",
  "materials",
]);
const feeStandards = {
  "外聘专家·两院院士": 2500,
  "外聘专家·高级专家": 2000,
  "外聘专家·正高级/教授": 1500,
  "外聘专家·副高级/副教授": 1000,
  "外聘专家·中级职称": 800,
  "外聘专家·其他人员": 500,
  "内部专家·专家/总师/正高级·业余": 1500,
  "内部专家·专家/总师/正高级·工作": 1000,
  "内部专家·主任级/副高级·业余": 800,
  "内部专家·主任级/副高级·工作": 500,
  "内部专家·主管级/中级·业余": 600,
  "内部专家·主管级/中级·工作": 400,
  "内部专家·其他人员·业余": 400,
  "内部专家·其他人员·工作": 250,
};

function calculateFee(standard = 0, hours = 0) {
  const value = Number(hours) || 0;
  if (!value || !standard) return 0;
  const halfDays = value < 2 ? 0.5 : Math.ceil(value / 4);
  return Math.round(
    standard * Math.min(halfDays, 4) +
      standard * 0.5 * Math.max(halfDays - 4, 0),
  );
}

function scoreCandidate(expert, task) {
  const fieldMatch = expert.field === task.field;
  const available = expert.status === "可用";
  const avoidancePassed = expert.risk === "正常";
  return {
    score:
      (fieldMatch ? 45 : 22) +
      (available ? 25 : 8) +
      (avoidancePassed ? 20 : 0) +
      Math.min(expert.projects || 0, 10),
    fieldMatch,
    available,
    avoidancePassed,
  };
}

export default function Calls() {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = useExpertStore();
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState("");
  const [taskKeyword, setTaskKeyword] = useState("");
  const [taskStage, setTaskStage] = useState();
  const [taskDepartment, setTaskDepartment] = useState();
  const [taskField, setTaskField] = useState();
  const [taskExpert, setTaskExpert] = useState();
  const [candidate, setCandidate] = useState(null);
  const [matchReason, setMatchReason] = useState("");
  const [adjusted, setAdjusted] = useState(false);
  const [departmentConfirmed, setDepartmentConfirmed] = useState(false);
  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleEnd, setScheduleEnd] = useState("");
  const [supportNote, setSupportNote] = useState("");
  const [opinion, setOpinion] = useState("");
  const [deadline, setDeadline] = useState("");
  const [preview, setPreview] = useState(null);
  const [consultationPreview, setConsultationPreview] = useState(null);
  const [consultationForm] = Form.useForm();
  const [evaluationForm] = Form.useForm();
  const feeStandard = Form.useWatch("feeStandard", form);
  const serviceHours = Form.useWatch("serviceHours", form);
  const record = state.tasks.find((task) => task.id === selected);
  const recordEvaluations = record?.evaluations?.length
    ? record.evaluations
    : record?.evaluation
      ? [record.evaluation]
      : [];
  const recommendations = useMemo(
    () =>
      record
        ? experts
            .map((expert) => ({
              ...expert,
              recommendation: scoreCandidate(expert, record),
            }))
            .toSorted((a, b) => b.recommendation.score - a.recommendation.score)
        : [],
    [record],
  );
  const canSelectCandidate = ["匹配中", "待运营排期"].includes(record?.stage);
  const canEditConsultation = ["履约中", "服务中", "待补充"].includes(
    record?.stage,
  );
  const filterOptions = useMemo(
    () => ({
      departments: [
        ...new Set(state.tasks.map((task) => task.department).filter(Boolean)),
      ],
      fields: [
        ...new Set(state.tasks.map((task) => task.field).filter(Boolean)),
      ],
      experts: [
        ...new Set(
          state.tasks
            .map((task) => task.expert)
            .filter((value) => value && value !== "待确认"),
        ),
      ],
    }),
    [state.tasks],
  );
  const stageCounts = useMemo(() => {
    const counts = {};
    state.tasks.forEach((item) => {
      const key = item.stage === "履约中" ? "服务中" : item.stage;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [state.tasks]);
  const filteredTasks = useMemo(() => {
    const keyword = taskKeyword.trim().toLowerCase();
    return state.tasks.filter((task) => {
      const matchesKeyword =
        !keyword ||
        [task.id, task.project, task.department, task.field, task.expert].some(
          (value) =>
            String(value || "")
              .toLowerCase()
              .includes(keyword),
        );
      const matchesStage =
        !taskStage ||
        task.stage === taskStage ||
        (taskStage === "服务中" && task.stage === "履约中");
      return (
        matchesKeyword &&
        matchesStage &&
        (!taskDepartment || task.department === taskDepartment) &&
        (!taskField || task.field === taskField) &&
        (!taskExpert || task.expert === taskExpert)
      );
    });
  }, [
    state.tasks,
    taskKeyword,
    taskStage,
    taskDepartment,
    taskField,
    taskExpert,
  ]);

  function persist(mutator, success) {
    try {
      updateStore(mutator);
      if (success) message.success(success);
      return true;
    } catch {
      message.error("本地保存失败，请检查浏览器存储");
      return false;
    }
  }
  function edit(task, presetExpert) {
    const chosen =
      presetExpert ||
      (task?.expertId
        ? experts.find((item) => item.id === task.expertId)
        : null);
    setEditing(task || { id: uid("RW") });
    form.resetFields();
    form.setFieldsValue(
      task
        ? {
            ...task,
            budget: Number(String(task.budget).replace(/[^\d.]/g, "")),
          }
        : {
            applicant: "郑华峰",
            contact: "138****5208 / zhenghf@example.com",
            permission: "仅受邀且确认合作的专家可查看",
            expertId: chosen?.id,
            expert: chosen?.name,
            field: chosen?.field,
            serviceMode: "会议形式",
          },
    );
  }
  useEffect(() => {
    if (searchParams.get("create") !== "1") return;
    const preset = experts.find(
      (item) => item.id === searchParams.get("expertId"),
    );
    edit(null, preset);
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);
  useEffect(() => {
    const taskId = searchParams.get("taskId");
    if (!taskId) return;
    const task = state.tasks.find((item) => item.id === taskId);
    if (task) openTask(task);
  }, [searchParams, state.tasks]);
  async function save(submit) {
    const values = submit ? await form.validateFields() : form.getFieldsValue();
    if (
      persist(
        (store) => {
          let task = store.tasks.find((item) => item.id === editing.id);
          if (!task) {
            task = {
              id: editing.id,
              expert: "待确认",
              versions: [],
              history: [],
              acceptance: [],
            };
            store.tasks.unshift(task);
          }
          const chosen = experts.find((item) => item.id === values.expertId);
          Object.assign(task, values, {
            expert: chosen?.name || values.expert || "待确认",
            estimatedFee: calculateFee(values.feeStandard, values.serviceHours),
            stage: submit ? "调用受理中" : "草稿",
            progress: submit ? 10 : 0,
          });
          task.history.push(
            log(
              "PC需求部门（演示）",
              submit
                ? "提交专家调用申请，等待股权运营部受理"
                : "保存调用申请草稿",
            ),
          );
        },
        submit ? "已提交股权运营部受理" : "草稿已保存",
      )
    )
      setEditing(null);
  }
  function previewApplication() {
    const values = form.getFieldsValue();
    setPreview({
      ...values,
      expert:
        experts.find((item) => item.id === values.expertId)?.name ||
        values.expert ||
        "待匹配",
      estimatedFee: calculateFee(values.feeStandard, values.serviceHours),
    });
  }
  function confirmExpert() {
    const expert = experts.find((item) => item.id === candidate);
    if (
      !record ||
      !canSelectCandidate ||
      !expert ||
      !departmentConfirmed ||
      !matchReason.trim()
    )
      return message.warning("请选择专家、填写确认理由并由需求部门确认");
    const result = scoreCandidate(expert, record);
    if (!result.available || !result.avoidancePassed)
      return message.warning("该专家不可用或回避校验未通过，不能确认");
    persist((store) => {
      const task = store.tasks.find((item) => item.id === selected);
      task.expert = expert.name;
      task.expertId = expert.id;
      task.matchReason = matchReason;
      task.matchScore = result.score;
      task.matchAdjusted = adjusted;
      task.stage = "待运营排期";
      task.progress = 25;
      task.history.push(
        log(
          "需求部门（演示）",
          `${adjusted ? "调整系统推荐并" : "确认系统推荐"}选择 ${expert.name}，匹配参考分 ${result.score}；理由：${matchReason}`,
        ),
      );
    }, "需求部门已确认专家人选，等待股权运营部锁定排期");
  }
  function chooseCandidate(expert) {
    if (!canSelectCandidate)
      return message.info(`当前任务处于“${record?.stage}”，不可调整专家人选`);
    if (!expert.recommendation.available)
      return message.warning(`专家当前状态为“${expert.status}”，不可新增调用`);
    if (!expert.recommendation.avoidancePassed)
      return message.warning(`专家回避校验未通过：${expert.risk}`);
    setCandidate(expert.id);
    setDepartmentConfirmed(false);
    setAdjusted(Boolean(expert.id !== recommendations[0]?.id));
  }
  function acceptTask() {
    if (record?.stage !== "调用受理中") return;
    persist((store) => {
      const task = store.tasks.find((item) => item.id === selected);
      task.stage = "匹配中";
      task.progress = 15;
      task.history.push(
        log("股权运营部（演示）", "受理专家调用申请，进入推荐匹配与排期"),
      );
    }, "已受理，进入推荐匹配");
  }
  function lockSchedule() {
    if (
      !record ||
      record.stage !== "待运营排期" ||
      !scheduleStart ||
      !scheduleEnd ||
      !supportNote.trim()
    )
      return message.warning("请填写完整服务时间段和协调说明");
    if (new Date(scheduleEnd).getTime() <= new Date(scheduleStart).getTime())
      return message.warning("服务结束时间必须晚于开始时间");
    const schedule = `${scheduleStart} 至 ${scheduleEnd}`;
    persist((store) => {
      const task = store.tasks.find((item) => item.id === selected);
      task.lockedSchedule = schedule;
      task.supportNote = supportNote;
      task.stage = "待专家确认";
      task.progress = 35;
      task.history.push(
        log(
          "股权运营部（演示）",
          `锁定排期 ${schedule}；协调说明：${supportNote}；已发送专家确认邀请`,
        ),
      );
    }, "排期已锁定，已发送专家确认邀请");
  }
  function confirmExpertParticipation() {
    if (!record || record.stage !== "待专家确认") return;
    Modal.confirm({
      title: "确认专家已确认合作？",
      content: "确认后将进入履约中，并解锁咨询记录填写。",
      okText: "确认",
      cancelText: "取消",
      onOk: () =>
        persist((store) => {
          const task = store.tasks.find((item) => item.id === selected);
          task.stage = "履约中";
          task.progress = 50;
          task.history.push(log("专家（演示）", "已确认合作，任务进入履约中"));
        }, "专家已确认合作，咨询记录已解锁"),
    });
  }
  async function saveConsultation(submit) {
    if (!canEditConsultation)
      return message.warning("专家确认合作后，才能填写咨询记录");
    const values = submit
      ? await consultationForm.validateFields()
      : consultationForm.getFieldsValue();
    if (
      persist(
        (store) => {
          const task = store.tasks.find((item) => item.id === selected);
          task.consultationRecord = {
            ...(task.consultationRecord || {}),
            ...values,
            savedAt: new Date().toLocaleString("zh-CN"),
          };
          if (submit) {
            const number = (task.versions?.length || 0) + 1;
            task.versions = [
              ...(task.versions || []),
              {
                number,
                at: new Date().toLocaleString("zh-CN"),
                content: values.judgment,
                attachment: values.attachment || "咨询记录.pdf（演示）",
              },
            ];
            task.stage = "待验收";
            task.progress = 80;
            task.history.push(
              log(
                "专家/经办人（演示）",
                `正式提交咨询记录 v${number}，等待需求部门验收`,
              ),
            );
          } else
            task.history.push(log("专家/经办人（演示）", "保存咨询记录草稿"));
        },
        submit ? "咨询记录已正式提交，等待验收" : "咨询记录草稿已保存",
      )
    )
      consultationForm.setFieldsValue(values);
  }
  async function submitEvaluation() {
    if (!["待评价", "已评价完成"].includes(record?.stage))
      return message.warning("当前任务不可进行评价");
    const values = await evaluationForm.validateFields();
    const total =
      Number(values.delivery) +
      Number(values.response) +
      Number(values.attitude);
    Modal.confirm({
      title: "确认提交专家履约评价？",
      content: `本次综合得分为 ${total} 分。提交后将新增一条评价记录，原有评价不会被覆盖。`,
      okText: "确认提交",
      cancelText: "取消",
      onOk: () =>
        persist((store) => {
          const task = store.tasks.find((item) => item.id === selected);
          const evaluation = {
            ...values,
            total,
            result: total >= 90 ? "优秀" : total >= 75 ? "良好" : "一般",
            submittedAt: new Date().toLocaleString("zh-CN"),
            evaluator: "PC需求部门（演示）",
            retrospective: "待回溯",
          };
          const previousEvaluations = Array.isArray(task.evaluations)
            ? task.evaluations
            : task.evaluation
              ? [task.evaluation]
              : [];
          task.evaluations = [...previousEvaluations, evaluation];
          task.evaluation = evaluation;
          task.stage = "已评价完成";
          task.progress = 100;
          task.history.push(
            log(
              "PC需求部门（演示）",
              `提交专家履约评价：${total}分，${task.evaluation.result}；${values.comment}`,
            ),
          );
        }, "评价已提交，任务已评价完成，可继续复评"),
    });
  }
  function accept(passed) {
    if (record?.stage !== "待验收" || !record.versions?.length)
      return message.warning("只有正式提交成果才能验收");
    if (
      !opinion.trim() ||
      (!passed && (!deadline || new Date(deadline).getTime() <= Date.now()))
    )
      return message.warning("请填写验收意见；退回还需设置未来补充期限");
    if (
      persist((store) => {
        const task = store.tasks.find((item) => item.id === selected);
        const entry = {
          ...log(
            "PC需求部门（演示）",
            `${passed ? "咨询成果确认通过" : "退回补充"}：${opinion}`,
          ),
          version: task.versions.at(-1).number,
          deadline: passed ? null : deadline,
        };
        task.acceptance.push(entry);
        task.history.push(entry);
        task.stage = passed ? "待评价" : "待补充";
        task.revisionDeadline = passed ? null : deadline;
        task.progress = passed ? 95 : 75;
      })
    ) {
      setOpinion("");
      setDeadline("");
    }
  }
  function openTask(task) {
    if (task.stage === "草稿") return edit(task);
    setSelected(task.id);
    setCandidate(null);
    setMatchReason("");
    setAdjusted(false);
    setDepartmentConfirmed(false);
    const [start = "", end = ""] = String(task.lockedSchedule || "")
      .split(" 至 ")
      .map((value) => value.trim());
    setScheduleStart(start);
    setScheduleEnd(end);
    setSupportNote(task.supportNote || "");
    setOpinion("");
    setDeadline("");
    consultationForm.resetFields();
    consultationForm.setFieldsValue(task.consultationRecord || {});
    evaluationForm.resetFields();
    evaluationForm.setFieldsValue(
      task.evaluation || { delivery: 45, response: 27, attitude: 18 },
    );
  }

  return (
    <div className={wb.page}>
      <div className={wb.content}>
        <div className={wb.pageHead}>
          <div>
            <h1>
              调用管理
              <PageHelp page="调用管理" />
            </h1>
            <p>需求申请、运营受理、推荐匹配、排期协调与成果确认</p>
          </div>
          <div className={wb.headActions}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => edit()}
            >
              发起调用
            </Button>
          </div>
        </div>
        <div className={wb.demoNotice}>
          <WarningOutlined />
          <span>{demoNotice}</span>
        </div>
        <div className={wb.stageStrip}>
          <button
            type="button"
            className={`${wb.stageItem} ${taskStage ? "" : wb.active}`}
            onClick={() => setTaskStage()}
          >
            <span>
              <i style={{ background: "#2563eb" }} />
              全部任务
            </span>
            <b>{state.tasks.length}</b>
            <small>不按阶段筛选，展示全部调用工单</small>
          </button>
          {taskStageStrip.map((stage) => (
            <button
              type="button"
              key={stage}
              className={`${wb.stageItem} ${taskStage === stage ? wb.active : ""}`}
              onClick={() =>
                setTaskStage(taskStage === stage ? undefined : stage)
              }
            >
              <span>
                <i style={{ background: taskStageTone(stage) }} />
                {stage}
              </span>
              <b>{stageCounts[stage] || 0}</b>
              <small>{taskStageHint(stage)}</small>
            </button>
          ))}
        </div>
        <section className={wb.filter}>
          <Input.Search
            className={wb.filterSearch}
            allowClear
            value={taskKeyword}
            onChange={(event) => setTaskKeyword(event.target.value)}
            placeholder="项目名称 / 工单号 / 专家"
          />
          <Select
            allowClear
            style={{ width: 170 }}
            value={taskDepartment}
            onChange={setTaskDepartment}
            placeholder="需求部门"
            options={filterOptions.departments.map((value) => ({
              value,
              label: value,
            }))}
          />
          <Select
            allowClear
            style={{ width: 160 }}
            value={taskField}
            onChange={setTaskField}
            placeholder="所需领域"
            options={filterOptions.fields.map((value) => ({
              value,
              label: value,
            }))}
          />
          <Select
            allowClear
            style={{ width: 150 }}
            value={taskExpert}
            onChange={setTaskExpert}
            placeholder="已选专家"
            options={filterOptions.experts.map((value) => ({
              value,
              label: value,
            }))}
          />
          <Button
            onClick={() => {
              setTaskKeyword("");
              setTaskStage(undefined);
              setTaskDepartment(undefined);
              setTaskField(undefined);
              setTaskExpert(undefined);
            }}
          >
            重置
          </Button>
        </section>
        <Card className={wb.card}>
          <div className={wb.tableTop}>
            <strong>调用任务</strong>
            <div className={wb.tableTools}>
              {taskStage ? (
                <span className={wb.filterChip}>
                  已按「{taskStage}」筛选
                  <Button
                    type="link"
                    size="small"
                    onClick={() => setTaskStage()}
                  >
                    清除
                  </Button>
                </span>
              ) : null}
              <span>共 {filteredTasks.length} 条</span>
            </div>
          </div>
          <Table
            rowKey="id"
            dataSource={filteredTasks}
            locale={{ emptyText: "没有符合当前筛选条件的调用任务" }}
            scroll={{ x: "max-content" }}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            columns={[
              {
                title: "项目",
                render: (_, task) => (
                  <div className={wb.personCell}>
                    <strong>{task.project || "未命名草稿"}</strong>
                    <span>{task.id}</span>
                  </div>
                ),
              },
              { title: "需求部门", dataIndex: "department" },
              { title: "领域", dataIndex: "field" },
              { title: "专家", dataIndex: "expert" },
              {
                title: "状态",
                dataIndex: "stage",
                render: (value) => (
                  <Tag color={taskStageColor(value)}>{value}</Tag>
                ),
              },
              {
                title: "操作",
                width: 120,
                render: (_, task) => (
                  <Button type="link" onClick={() => openTask(task)}>
                    {task.stage === "草稿" ? "继续编辑" : "任务详情"}
                  </Button>
                ),
              },
            ]}
          />
        </Card>
      </div>
      <Modal
        width={820}
        title="专家调用申请表"
        open={!!editing}
        onCancel={() => setEditing(null)}
        footer={
          <Space>
            <Button onClick={previewApplication}>PDF 预览 / 打印</Button>
            <Button onClick={() => save(false)}>保存草稿</Button>
            <Button type="primary" onClick={() => save(true)}>
              提交股权运营部受理
            </Button>
          </Space>
        }
      >
        <Alert
          type="info"
          showIcon
          message="本表对应《专家调用申请表》，提交后进入运营受理、推荐匹配和排期邀约。"
        />
        <Form layout="vertical" form={form} style={{ marginTop: 16 }}>
          <Form.Item
            name="expertId"
            label="意向专家（可留空，由推荐匹配环节选择）"
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              options={experts.map((item) => ({
                value: item.id,
                label: `${item.name} · ${item.company} · ${item.field}`,
              }))}
              onChange={(id) => {
                const item = experts.find((expert) => expert.id === id);
                form.setFieldsValue({ expert: item?.name, field: item?.field });
              }}
            />
          </Form.Item>
          {fields.map(([key, label]) => (
            <Form.Item
              key={key}
              name={key}
              label={label}
              rules={[{ required: true, whitespace: true }]}
            >
              {key === "serviceTime" ? (
                <Input type="datetime-local" />
              ) : key === "due" ? (
                <Input type="date" />
              ) : textAreaFields.has(key) ? (
                <Input.TextArea rows={2} />
              ) : (
                <Input />
              )}
            </Form.Item>
          ))}
          <Divider orientation="left">服务方式与费用测算</Divider>
          <Form.Item
            name="serviceMode"
            label="服务形式"
            rules={[{ required: true }]}
          >
            <Select
              options={["会议形式", "现场访谈", "现场考察", "通讯形式"].map(
                (value) => ({ value }),
              )}
            />
          </Form.Item>
          <Form.Item
            name="feeLevel"
            label="专家来源与职级"
            rules={[{ required: true }]}
          >
            <Select
              options={Object.keys(feeStandards).map((value) => ({
                value,
                label: value,
              }))}
              onChange={(value) =>
                form.setFieldValue("feeStandard", feeStandards[value])
              }
            />
          </Form.Item>
          <Form.Item
            name="feeStandard"
            label="对应单日津贴标准（元/人/半天，自动关联）"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} readOnly style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="serviceHours"
            label="预计咨询时长（小时）"
            rules={[{ required: true }, { type: "number", min: 0.5 }]}
          >
            <InputNumber min={0.5} step={0.5} style={{ width: "100%" }} />
          </Form.Item>
          <Alert
            message={`预计服务总费用（税后）：${calculateFee(feeStandard, serviceHours).toLocaleString()} 元`}
            description="不足2小时按半天标准折半，2至4小时按半天计算；超过2天的部分按标准的50%计算。差旅费另行据实登记。"
          />
          <Form.Item
            name="budget"
            label="预算上限（元，0 表示无偿）"
            rules={[{ required: true }, { type: "number", min: 0 }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        width={900}
        title="专家调用申请表 · PDF 预览"
        open={!!preview}
        onCancel={() => setPreview(null)}
        footer={
          <Space>
            <Button onClick={() => setPreview(null)}>关闭</Button>
            <Button type="primary" onClick={() => window.print()}>
              打印 / 另存为 PDF
            </Button>
          </Space>
        }
      >
        {preview ? (
          <section
            className={styles.printSheet}
            style={{ padding: 28, color: "#111", background: "#fff" }}
          >
            <h2 style={{ textAlign: "center" }}>
              一汽股权投资（天津）有限公司
            </h2>
            <h1 style={{ textAlign: "center", marginBottom: 28 }}>
              专家调用申请表
            </h1>
            <Descriptions
              bordered
              column={2}
              size="small"
              items={[
                { key: "id", label: "工单编号", children: editing?.id },
                {
                  key: "date",
                  label: "填报日期",
                  children: new Date().toLocaleDateString("zh-CN"),
                },
                ...fields.map(([key, label]) => ({
                  key,
                  label,
                  span: textAreaFields.has(key) ? 2 : 1,
                  children: preview[key] || "—",
                })),
                { key: "expert", label: "专家姓名", children: preview.expert },
                {
                  key: "mode",
                  label: "服务形式",
                  children: preview.serviceMode || "—",
                },
                {
                  key: "level",
                  label: "专家来源与职级",
                  children: preview.feeLevel || "—",
                },
                {
                  key: "hours",
                  label: "预计时长",
                  children: `${preview.serviceHours || 0} 小时`,
                },
                {
                  key: "standard",
                  label: "对应单日津贴标准",
                  children: `${preview.feeStandard || 0} 元/人/半天`,
                },
                {
                  key: "fee",
                  label: "预计服务总费用（税后）",
                  children: `${preview.estimatedFee || 0} 元`,
                },
              ]}
            />
            <p style={{ marginTop: 24 }}>
              申请人签字：________________　　需求部门审核：________________
            </p>
          </section>
        ) : null}
      </Modal>
      <Drawer
        width="min(920px, 92vw)"
        title={record?.project}
        open={!!record}
        onClose={() => setSelected(null)}
      >
        {record ? (
          <div className={wb.drawerBody}>
            <div className={wb.stageBanner}>
              <i style={{ background: taskStageTone(record.stage) }} />
              <span>
                当前阶段「{record.stage}」：
                {taskStageHint(record.stage) || "暂无阶段说明"}
              </span>
            </div>
            <Tabs
              items={[
                {
                  key: "detail",
                  label: "需求与轨迹",
                  children: (
                    <div className={wb.stack}>
                      {record.stage === "调用受理中" ? (
                        <Button type="primary" onClick={acceptTask}>
                          运营受理并进入推荐匹配
                        </Button>
                      ) : null}
                      <Descriptions
                        bordered
                        column={1}
                        items={[
                          ...fields,
                          ["serviceMode", "服务形式"],
                          ["feeLevel", "专家来源与职级"],
                          ["feeStandard", "单日津贴标准（元/人/半天）"],
                          ["serviceHours", "预计咨询时长（小时）"],
                          ["estimatedFee", "预计服务总费用（元）"],
                          ["budget", "预算上限"],
                        ].map(([key, label]) => ({
                          key,
                          label,
                          children: record[key] ?? "—",
                        }))}
                      />
                      <h3 className={wb.sectionTitle}>办理轨迹</h3>
                      <Timeline
                        items={(record.history || []).map((item, index) => ({
                          key: index,
                          color:
                            index === record.history.length - 1
                              ? "blue"
                              : "gray",
                          children: `${item.at} · ${item.actor} · ${item.text}`,
                        }))}
                      />
                    </div>
                  ),
                },
                {
                  key: "match",
                  label: "推荐匹配与排期",
                  children: (
                    <div className={wb.stack}>
                      {record.stage === "调用受理中" ? (
                        <Alert
                          type="warning"
                          showIcon
                          message="该调用申请尚未受理"
                          description="运营人员受理后，候选专家表将进入可选择状态。"
                          action={
                            <Button type="primary" onClick={acceptTask}>
                              运营受理并开始匹配
                            </Button>
                          }
                        />
                      ) : null}
                      <Alert
                        type="info"
                        showIcon
                        message="系统推荐仅提供匹配参考分和回避校验提示，不自动决定人选。需求部门确认或调整人选，之后由股权运营部锁定排期。"
                        description={
                          canSelectCandidate
                            ? "点击单选框或专家所在行均可选择；灰色候选人表示当前不可新增调用或回避校验未通过。"
                            : `当前任务状态为“${record.stage}”，候选表仅供查看。任务进入“匹配中”后才允许选择。`
                        }
                      />
                      <Input.Search
                        placeholder="搜索姓名、单位、领域或标签"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                      />
                      <Table
                        rowKey="id"
                        pagination={false}
                        dataSource={recommendations.filter((expert) =>
                          [
                            expert.name,
                            expert.company,
                            expert.field,
                            ...expert.tags,
                          ]
                            .join(" ")
                            .includes(search),
                        )}
                        onRow={(expert) => ({
                          onClick: () => chooseCandidate(expert),
                          style: {
                            cursor:
                              canSelectCandidate &&
                              expert.recommendation.available &&
                              expert.recommendation.avoidancePassed
                                ? "pointer"
                                : "not-allowed",
                          },
                        })}
                        rowSelection={{
                          type: "radio",
                          selectedRowKeys: candidate ? [candidate] : [],
                          onChange: (keys, rows) =>
                            rows[0] && chooseCandidate(rows[0]),
                          getCheckboxProps: (expert) => ({
                            disabled:
                              !expert.recommendation.available ||
                              !expert.recommendation.avoidancePassed ||
                              !canSelectCandidate,
                          }),
                        }}
                        columns={[
                          {
                            title: "推荐",
                            width: 90,
                            render: (_, expert, index) => (
                              <Tag color={index < 3 ? "blue" : "default"}>
                                第 {index + 1} 位
                              </Tag>
                            ),
                          },
                          {
                            title: "专家 / 单位",
                            render: (_, expert) =>
                              `${expert.name} · ${expert.company}`,
                          },
                          {
                            title: "参考分",
                            render: (_, expert) => (
                              <b className={wb.number}>
                                {expert.recommendation.score}
                              </b>
                            ),
                          },
                          {
                            title: "系统推荐依据",
                            render: (_, expert) =>
                              `${expert.recommendation.fieldMatch ? "领域匹配" : "跨领域"}；${expert.tags.join("、")}；${expert.availability}`,
                          },
                          {
                            title: "回避校验",
                            render: (_, expert) => (
                              <Tag
                                color={
                                  expert.recommendation.avoidancePassed
                                    ? "success"
                                    : "error"
                                }
                              >
                                {expert.recommendation.avoidancePassed
                                  ? "未发现明确冲突"
                                  : "未通过"}
                              </Tag>
                            ),
                          },
                        ]}
                      />
                      <div className={wb.actionBar}>
                        <Input.TextArea
                          value={matchReason}
                          disabled={!canSelectCandidate}
                          onChange={(event) =>
                            setMatchReason(event.target.value)
                          }
                          placeholder="需求部门确认/调整人选理由（必填）"
                        />
                        <Checkbox
                          checked={departmentConfirmed}
                          disabled={!canSelectCandidate}
                          onChange={(event) =>
                            setDepartmentConfirmed(event.target.checked)
                          }
                        >
                          需求部门已核对推荐依据、回避提示和项目适配情况
                        </Checkbox>
                        <Button
                          type="primary"
                          disabled={
                            !canSelectCandidate ||
                            !candidate ||
                            !departmentConfirmed ||
                            !matchReason.trim()
                          }
                          onClick={confirmExpert}
                        >
                          {record.stage === "待运营排期"
                            ? "重新确认人选"
                            : "需求部门确认人选"}
                        </Button>
                      </div>
                      {record.expertId ? (
                        <Alert
                          type="success"
                          showIcon
                          message={`已确认 ${record.expert}，匹配参考分 ${record.matchScore}${record.matchAdjusted ? "（人工调整系统首选）" : ""}`}
                          description={record.matchReason}
                        />
                      ) : null}
                      <h3 className={wb.sectionTitle}>股权运营部锁定排期</h3>
                      <div className={wb.actionBar}>
                        <Space align="start" wrap>
                          <Input
                            type="datetime-local"
                            value={scheduleStart}
                            onChange={(event) =>
                              setScheduleStart(event.target.value)
                            }
                            disabled={record.stage !== "待运营排期"}
                            aria-label="服务开始时间"
                          />
                          <span>至</span>
                          <Input
                            type="datetime-local"
                            value={scheduleEnd}
                            onChange={(event) =>
                              setScheduleEnd(event.target.value)
                            }
                            disabled={record.stage !== "待运营排期"}
                            aria-label="服务结束时间"
                          />
                          <Input.TextArea
                            style={{ width: 420 }}
                            rows={2}
                            value={supportNote}
                            onChange={(event) =>
                              setSupportNote(event.target.value)
                            }
                            disabled={record.stage !== "待运营排期"}
                            placeholder="与专家、需求部门协调情况及服务保障说明"
                          />
                          <Button
                            type="primary"
                            disabled={record.stage !== "待运营排期"}
                            onClick={lockSchedule}
                          >
                            锁定排期并生成邀约
                          </Button>
                        </Space>
                      </div>
                      {record.stage === "待专家确认" ? (
                        <section className={wb.block}>
                          <h3 className={wb.sectionTitle}>专家确认</h3>
                          <Alert
                            type="info"
                            showIcon
                            message="已发送专家确认邀请"
                            description="等待专家确认合作后开始履约。"
                          />
                          <Button
                            type="primary"
                            style={{ marginTop: 16 }}
                            onClick={confirmExpertParticipation}
                          >
                            模拟专家确认合作
                          </Button>
                        </section>
                      ) : null}
                    </div>
                  ),
                },
                {
                  key: "delivery",
                  label: "成果与验收",
                  children: (
                    <div className={wb.stack}>
                      {!canEditConsultation ? (
                        <Alert
                          type="warning"
                          showIcon
                          message="咨询记录尚未解锁"
                          description="专家确认合作后，才可填写咨询记录。"
                        />
                      ) : (
                        <>
                          <Alert
                            type="success"
                            showIcon
                            message="专家已确认合作，咨询记录已解锁"
                          />
                          <Form
                            form={consultationForm}
                            layout="vertical"
                            disabled={!canEditConsultation}
                          >
                            <Divider orientation="left">一、基础信息</Divider>
                            <Descriptions
                              bordered
                              size="small"
                              column={2}
                              items={[
                                {
                                  key: 1,
                                  label: "项目名称",
                                  children: record.project,
                                },
                                {
                                  key: 2,
                                  label: "项目等级",
                                  children: record.projectLevel || "Ⅱ类",
                                },
                                {
                                  key: 3,
                                  label: "咨询人",
                                  children: record.applicant,
                                },
                                {
                                  key: 4,
                                  label: "专家姓名",
                                  children: record.expert,
                                },
                                {
                                  key: 5,
                                  label: "咨询方式",
                                  children: record.serviceMode,
                                },
                                {
                                  key: 6,
                                  label: "所属领域",
                                  children: record.field,
                                },
                              ]}
                            />
                            <Form.Item
                              name="consultDate"
                              label="咨询日期"
                              rules={[{ required: true }]}
                            >
                              <Input type="date" />
                            </Form.Item>
                            <Form.Item
                              name="minutes"
                              label="咨询时长（分钟）"
                              rules={[
                                { required: true },
                                { type: "number", min: 1 },
                              ]}
                            >
                              <InputNumber min={1} style={{ width: "100%" }} />
                            </Form.Item>
                            <Divider orientation="left">
                              二、咨询核心目的
                            </Divider>
                            <Form.Item
                              name="purpose"
                              label="咨询核心目的"
                              rules={[{ required: true, whitespace: true }]}
                            >
                              <Input.TextArea rows={3} />
                            </Form.Item>
                            <Divider orientation="left">
                              三、咨询内容记录
                            </Divider>
                            <Form.Item
                              name="questions"
                              label="咨询问题与专家答复（逐条记录）"
                              rules={[{ required: true, whitespace: true }]}
                            >
                              <Input.TextArea
                                rows={6}
                                placeholder="1. 咨询问题：……\n   专家答复：……"
                              />
                            </Form.Item>
                            <Divider orientation="left">
                              四、核心观点分层提炼
                            </Divider>
                            <Form.Item
                              name="facts"
                              label="事实类（客观数据 / 行业现状）"
                              rules={[{ required: true, whitespace: true }]}
                            >
                              <Input.TextArea rows={3} />
                            </Form.Item>
                            <Form.Item
                              name="judgment"
                              label="判断类（趋势观点 / 优劣评价）"
                              rules={[{ required: true, whitespace: true }]}
                            >
                              <Input.TextArea rows={3} />
                            </Form.Item>
                            <Form.Item
                              name="basis"
                              label="逻辑类（推导依据 / 底层原因）"
                              rules={[{ required: true, whitespace: true }]}
                            >
                              <Input.TextArea rows={3} />
                            </Form.Item>
                            <Divider orientation="left">
                              五、风险提示与行动建议
                            </Divider>
                            <Form.Item
                              name="risks"
                              label="核心风险点"
                              rules={[{ required: true, whitespace: true }]}
                            >
                              <Input.TextArea rows={3} />
                            </Form.Item>
                            <Form.Item
                              name="suggestions"
                              label="后续行动建议"
                              rules={[{ required: true, whitespace: true }]}
                            >
                              <Input.TextArea rows={3} />
                            </Form.Item>
                            <Form.Item name="attachment" label="成果附件">
                              <Input placeholder="如：技术研判意见.pdf（演示）" />
                            </Form.Item>
                            <Divider orientation="left">六、归档信息</Divider>
                            <Form.Item name="archiveNo" label="归档编号">
                              <Input placeholder="正式提交后由系统生成，可提前登记演示编号" />
                            </Form.Item>
                            <Form.Item name="remark" label="备注">
                              <Input.TextArea rows={2} />
                            </Form.Item>
                          </Form>
                          <Space>
                            {canEditConsultation ? (
                              <>
                                <Button onClick={() => saveConsultation(false)}>
                                  保存咨询记录草稿
                                </Button>
                                <Button
                                  type="primary"
                                  onClick={() => saveConsultation(true)}
                                >
                                  正式提交咨询记录
                                </Button>
                              </>
                            ) : null}
                            <Button
                              onClick={() =>
                                setConsultationPreview({
                                  ...consultationForm.getFieldsValue(),
                                  task: record,
                                })
                              }
                            >
                              PDF 预览 / 打印
                            </Button>
                          </Space>
                        </>
                      )}
                      {record.versions?.length
                        ? record.versions.map((version) => (
                            <section key={version.number} className={wb.block}>
                              <h4>
                                正式咨询记录 v{version.number} · {version.at}
                              </h4>
                              <p>{version.content}</p>
                              <p>{version.attachment}</p>
                            </section>
                          ))
                        : null}
                      {record.stage === "待验收" ? (
                        <section className={wb.actionBar}>
                          <h3 className={wb.sectionTitle}>需求部门验收</h3>
                          <Input.TextArea
                            value={opinion}
                            onChange={(event) => setOpinion(event.target.value)}
                            placeholder="成果确认意见 / 退回原因（必填）"
                          />
                          <span>
                            退回补充期限：
                            <Input
                              type="datetime-local"
                              value={deadline}
                              onChange={(event) =>
                                setDeadline(event.target.value)
                              }
                            />
                          </span>
                          <Space>
                            <Button type="primary" onClick={() => accept(true)}>
                              咨询成果确认通过
                            </Button>
                            <Button danger onClick={() => accept(false)}>
                              退回补充
                            </Button>
                          </Space>
                        </section>
                      ) : null}
                      {["待评价", "已评价完成"].includes(record.stage) ? (
                        <section className={wb.block}>
                          <h3 className={wb.sectionTitle}>
                            本次专家调用履约评价
                          </h3>
                          <Alert
                            type="info"
                            showIcon
                            message="由需求部门评价本次实际提供服务的专家"
                            description="评价提交后计入专家档案和后续推荐匹配参考。履约评价与未来的观点准确度回溯分别记录。"
                          />
                          <Form form={evaluationForm} layout="vertical">
                            <Space align="start" wrap size="large">
                              <Form.Item
                                name="delivery"
                                label="交付质量（最高50分）"
                                rules={[
                                  { required: true },
                                  { type: "number", min: 0, max: 50 },
                                ]}
                              >
                                <InputNumber min={0} max={50} />
                              </Form.Item>
                              <Form.Item
                                name="response"
                                label="响应效率（最高30分）"
                                rules={[
                                  { required: true },
                                  { type: "number", min: 0, max: 30 },
                                ]}
                              >
                                <InputNumber min={0} max={30} />
                              </Form.Item>
                              <Form.Item
                                name="attitude"
                                label="服务态度（最高20分）"
                                rules={[
                                  { required: true },
                                  { type: "number", min: 0, max: 20 },
                                ]}
                              >
                                <InputNumber min={0} max={20} />
                              </Form.Item>
                            </Space>
                            <Form.Item shouldUpdate noStyle>
                              {() => (
                                <Alert
                                  message={`当前总分：${Number(evaluationForm.getFieldValue("delivery") || 0) + Number(evaluationForm.getFieldValue("response") || 0) + Number(evaluationForm.getFieldValue("attitude") || 0)} / 100`}
                                />
                              )}
                            </Form.Item>
                            <Form.Item
                              name="tags"
                              label="评价标签"
                              rules={[
                                {
                                  required: true,
                                  message: "请至少选择一个评价标签",
                                },
                              ]}
                            >
                              <Select
                                mode="multiple"
                                options={[
                                  "专业判断清晰",
                                  "交付完整",
                                  "响应及时",
                                  "沟通顺畅",
                                  "建议可执行",
                                  "依据需加强",
                                  "交付延期",
                                ].map((value) => ({ value }))}
                              />
                            </Form.Item>
                            <Form.Item
                              name="comment"
                              label="评价说明"
                              rules={[
                                {
                                  required: true,
                                  whitespace: true,
                                  message: "请填写评价说明",
                                },
                              ]}
                            >
                              <Input.TextArea
                                rows={4}
                                placeholder="说明专家交付质量、响应情况及建议采用价值"
                              />
                            </Form.Item>
                            <Form.Item
                              name="anonymousToExpert"
                              valuePropName="checked"
                            >
                              <Checkbox>向专家展示时隐藏评价人姓名</Checkbox>
                            </Form.Item>
                            <Button type="primary" onClick={submitEvaluation}>
                              {record.stage === "已评价完成"
                                ? "提交复评"
                                : "提交评价并完成任务"}
                            </Button>
                          </Form>
                        </section>
                      ) : null}
                      {recordEvaluations.length ? (
                        <section className={wb.blockSuccess}>
                          <h3 className={wb.sectionTitle}>履约评价记录</h3>
                          {recordEvaluations.map((evaluation, index) => (
                            <Descriptions
                              key={`${evaluation.submittedAt}-${index}`}
                              bordered
                              size="small"
                              column={2}
                              style={{ marginBottom: 16 }}
                              items={[
                                {
                                  key: 1,
                                  label: "综合得分",
                                  children: `${evaluation.total}分 · ${evaluation.result}`,
                                },
                                {
                                  key: 2,
                                  label: "评价时间",
                                  children: evaluation.submittedAt,
                                },
                                {
                                  key: 3,
                                  label: "交付质量",
                                  children: `${evaluation.delivery}/50`,
                                },
                                {
                                  key: 4,
                                  label: "响应效率",
                                  children: `${evaluation.response}/30`,
                                },
                                {
                                  key: 5,
                                  label: "服务态度",
                                  children: `${evaluation.attitude}/20`,
                                },
                                {
                                  key: 6,
                                  label: "观点回溯",
                                  children: evaluation.retrospective,
                                },
                                {
                                  key: 7,
                                  label: "评价标签",
                                  span: 2,
                                  children: (evaluation.tags || []).join("、"),
                                },
                                {
                                  key: 8,
                                  label: "评价说明",
                                  span: 2,
                                  children: evaluation.comment,
                                },
                              ]}
                            />
                          ))}
                        </section>
                      ) : null}
                      <Timeline
                        items={(record.acceptance || []).map((item, index) => ({
                          key: index,
                          children: `${item.at} · v${item.version} · ${item.text}${item.deadline ? ` · 补充期限 ${item.deadline}` : ""}`,
                        }))}
                      />
                    </div>
                  ),
                },
              ]}
            />
          </div>
        ) : null}
      </Drawer>
      <Modal
        width={900}
        title="咨询记录 · PDF 预览"
        open={!!consultationPreview}
        onCancel={() => setConsultationPreview(null)}
        footer={
          <Space>
            <Button onClick={() => setConsultationPreview(null)}>关闭</Button>
            <Button type="primary" onClick={() => window.print()}>
              打印 / 另存为 PDF
            </Button>
          </Space>
        }
      >
        {consultationPreview ? (
          <section
            className={styles.printSheet}
            style={{ padding: 28, color: "#111", background: "#fff" }}
          >
            <h1 style={{ textAlign: "center" }}>咨询记录</h1>
            <Descriptions
              bordered
              column={2}
              size="small"
              items={[
                { key: 1, label: "项目名称", children: record?.project },
                {
                  key: 2,
                  label: "项目等级",
                  children: record?.projectLevel || "Ⅱ类",
                },
                {
                  key: 3,
                  label: "咨询日期",
                  children: consultationPreview.consultDate || "—",
                },
                {
                  key: 4,
                  label: "咨询时长",
                  children: `${consultationPreview.minutes || "—"} 分钟`,
                },
                { key: 5, label: "咨询人", children: record?.applicant },
                { key: 6, label: "专家姓名", children: record?.expert },
                { key: 7, label: "咨询方式", children: record?.serviceMode },
                { key: 8, label: "所属领域", children: record?.field },
                ...[
                  ["purpose", "咨询核心目的"],
                  ["questions", "咨询问题与专家答复"],
                  ["facts", "事实类"],
                  ["judgment", "判断类"],
                  ["basis", "逻辑类"],
                  ["risks", "核心风险点"],
                  ["suggestions", "后续行动建议"],
                  ["archiveNo", "归档编号"],
                  ["remark", "备注"],
                ].map(([key, label]) => ({
                  key,
                  label,
                  span: 2,
                  children: consultationPreview[key] || "—",
                })),
              ]}
            />
            <p style={{ marginTop: 24 }}>
              专家确认：________________　　需求部门审核：________________
            </p>
          </section>
        ) : null}
      </Modal>
    </div>
  );
}
