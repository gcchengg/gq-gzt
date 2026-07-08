import { Button, DatePicker, Drawer, Form, Input, Modal, Select, Tabs, Upload, message } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import "./TaskIssueDrawer.css";

const taskTypeOptions = [
  {
    label: "参加会议",
    value: "200",
    desc: "填写会议时间、地点、主要与会人员和会议内容。",
  },
  {
    label: "公司走访",
    value: "100",
    desc: "填写走访城市、随行人员、出发返回时间和走访计划。",
  },
  {
    label: "领导督办",
    value: "300",
    desc: "突出督办事项、责任人和完成时限。",
  },
  {
    label: "集团交办",
    value: "400",
    desc: "集团交办类任务，当前仅做展示。",
    disabled: true,
  },
  {
    label: "协同事项",
    value: "500",
    desc: "跨部门协同事项，当前仅做展示。",
    disabled: true,
  },
];

const userOptions = [
  { label: "黄国平", value: "huangguoping" },
  { label: "王明", value: "wangming" },
  { label: "李娜", value: "lina" },
  { label: "郑华峰", value: "zhenghuafeng" },
];

const companyOptions = [
  { label: "一汽股权投资（天津）有限公司", value: "company-001" },
  { label: "中联汽车电子有限公司", value: "company-002" },
  { label: "T3出行科技有限公司", value: "company-003" },
];

export default function TaskIssueDrawer({
  open,
  showTrigger = true,
  onClose,
  onOpen,
  onSubmit,
  onSave,
  loading = false,
  relatedTasks = [],
  title = "任务下发浮窗",
  ifFromTask,
  isSanhui,
  sanhuiRecord,
  zIndex = 12080,
}) {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("create");
  const [taskType, setTaskType] = useState("300");
  const [innerOpen, setInnerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState(null);
  const [triggerPosition, setTriggerPosition] = useState(null);
  const [dragging, setDragging] = useState(false);
  const triggerDragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const isControlled = typeof open === "boolean";
  const mergedOpen = isControlled ? open : innerOpen;
  const currentTaskType = useMemo(() => taskTypeOptions.find((item) => item.value === taskType), [taskType]);
  const mergedCompanyOptions = useMemo(() => {
    if (!sanhuiRecord?.companyId) return companyOptions;
    if (companyOptions.some((item) => String(item.value) === String(sanhuiRecord.companyId))) {
      return companyOptions;
    }
    return [
      {
        label: sanhuiRecord.companyName || sanhuiRecord.companyShortName || "当前三会事项公司",
        value: sanhuiRecord.companyId,
      },
      ...companyOptions,
    ];
  }, [sanhuiRecord]);

  useEffect(() => {
    if (!sanhuiRecord) return;
    form.setFieldsValue({
      sanhuiMgmtId: sanhuiRecord.id,
      sanhuiMgmtNo: sanhuiRecord.mgmtNo,
      companyId: sanhuiRecord.companyId || "company-001",
      taskType,
    });
  }, [form, sanhuiRecord, taskType]);

  const handleOpen = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    onOpen?.();
    if (!isControlled) {
      setInnerOpen(true);
    }
  };

  const handleTriggerPointerDown = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    triggerDragRef.current = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleTriggerPointerMove = (event) => {
    const drag = triggerDragRef.current;
    if (!drag) return;

    const moved = Math.abs(event.clientX - drag.startX) > 4 || Math.abs(event.clientY - drag.startY) > 4;
    if (moved) {
      drag.moved = true;
      suppressClickRef.current = true;
    }

    const triggerWidth = 160;
    const triggerHeight = 64;
    const maxLeft = Math.max(window.innerWidth - triggerWidth - 12, 12);
    const maxTop = Math.max(window.innerHeight - triggerHeight - 12, 12);
    setTriggerPosition({
      left: Math.min(Math.max(event.clientX - drag.offsetX, 12), maxLeft),
      top: Math.min(Math.max(event.clientY - drag.offsetY, 72), maxTop),
    });
  };

  const handleTriggerPointerUp = (event) => {
    const drag = triggerDragRef.current;
    triggerDragRef.current = null;
    setDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (!drag?.moved) {
      suppressClickRef.current = false;
    }
  };

  const handleClose = () => {
    setConfirmOpen(false);
    setPendingValues(null);
    onClose?.();
    if (!isControlled) {
      setInnerOpen(false);
    }
  };

  const handleTaskTypeChange = (item) => {
    if (!item || item.disabled) return;
    setTaskType(item.value);
    form.setFieldsValue({ taskType: item.value });
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    onSave?.(values);
    message.success("保存成功");
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setPendingValues({
      ...values,
      taskType,
      ifFromTask,
      isSanhui,
    });
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = () => {
    onSubmit?.(pendingValues);
    message.success("任务已创建");
    setConfirmOpen(false);
    setPendingValues(null);
    form.resetFields();
    handleClose();
  };

  return (
    <>
      {showTrigger && !mergedOpen ? (
        <button
          type="button"
          className={`task-issue-trigger${dragging ? " is-dragging" : ""}`}
          style={{
            zIndex,
            ...(triggerPosition
              ? {
                  left: triggerPosition.left,
                  top: triggerPosition.top,
                  right: "auto",
                  bottom: "auto",
                }
              : null),
          }}
          onClick={handleOpen}
          onPointerDown={handleTriggerPointerDown}
          onPointerMove={handleTriggerPointerMove}
          onPointerUp={handleTriggerPointerUp}
          onPointerCancel={handleTriggerPointerUp}
        >
          <span className="task-issue-trigger__icon">+</span>
          <span>
            任务浮窗
            <small>选择类型并直接创建任务</small>
          </span>
        </button>
      ) : null}

      <Drawer
        title={title}
        width={920}
        open={mergedOpen}
        onClose={handleClose}
        destroyOnClose
        className="task-issue-drawer"
        zIndex={zIndex}
      >
        <div className="task-issue-drawer__hint">直接选择任务类型并填写信息，支持跨页面复用。</div>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "create",
              label: "创建任务",
              children: (
                <div className="task-issue-drawer__create">
                  <section className="task-issue-drawer__section">
                    <div className="task-issue-drawer__section-head">
                      <h3>选择任务类型</h3>
                      <span>当前类型：{currentTaskType?.label}</span>
                    </div>
                    <div className="task-issue-drawer__type-grid">
                      {taskTypeOptions.map((item) => {
                        const active = item.value === taskType;
                        return (
                          <button
                            key={item.value}
                            type="button"
                            disabled={item.disabled}
                            className={[
                              "task-issue-drawer__type-card",
                              active ? "task-issue-drawer__type-card--active" : "",
                              item.disabled ? "task-issue-drawer__type-card--disabled" : "",
                            ].join(" ")}
                            onClick={() => handleTaskTypeChange(item)}
                          >
                            <b>{item.label}</b>
                            <span>{item.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <section className="task-issue-drawer__section">
                    <Form
                      form={form}
                      layout="vertical"
                      initialValues={{
                        issueUserId: "huangguoping",
                        dutyUserId: "wangming",
                        companyId: sanhuiRecord?.companyId || "company-001",
                        sanhuiMgmtId: sanhuiRecord?.id,
                        sanhuiMgmtNo: sanhuiRecord?.mgmtNo,
                        taskType,
                      }}
                    >
                      <div className="task-issue-drawer__base-grid">
                        <Form.Item label="任务发起人" name="issueUserId" rules={[{ required: true, message: "请选择任务发起人" }]}>
                          <Select options={userOptions} showSearch optionFilterProp="label" />
                        </Form.Item>
                        <Form.Item label="任务执行人" name="dutyUserId" rules={[{ required: true, message: "请选择任务执行人" }]}>
                          <Select options={userOptions} showSearch optionFilterProp="label" />
                        </Form.Item>
                      </div>

                      <div className="task-issue-drawer__base-grid">
                        <Form.Item label="任务类型选择" name="taskType" rules={[{ required: true, message: "请选择任务类型" }]}>
                          <Select
                            options={taskTypeOptions.map((item) => ({
                              label: item.label,
                              value: item.value,
                              disabled: item.disabled,
                            }))}
                            onChange={(value) => handleTaskTypeChange(taskTypeOptions.find((item) => item.value === value))}
                          />
                        </Form.Item>
                        <Form.Item label="目标公司" name="companyId" rules={[{ required: true, message: "请选择目标公司" }]}>
                          <Select disabled={Boolean(ifFromTask)} options={mergedCompanyOptions} showSearch optionFilterProp="label" />
                        </Form.Item>
                      </div>

                      {taskType === "200" ? (
                        <>
                          <div className="task-issue-drawer__base-grid task-issue-drawer__meeting-grid">
                            <Form.Item label="会议开始时间" name="startTime" rules={[{ required: true, message: "请选择会议开始时间" }]}>
                              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD HH:mm:ss" showTime />
                            </Form.Item>
                            <Form.Item label="会议结束时间" name="endTime" rules={[{ required: true, message: "请选择会议结束时间" }]}>
                              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD HH:mm:ss" showTime />
                            </Form.Item>
                            <Form.Item label="会议地点" name="meetLocation" rules={[{ required: true, message: "请输入会议地点" }]}>
                              <Input />
                            </Form.Item>
                            <Form.Item label="主要与会人员" name="attendUsers" rules={[{ required: true, message: "请输入主要与会人员" }]}>
                              <Input />
                            </Form.Item>
                          </div>
                          <Form.Item label="会议有关议题" name="meetTopic">
                            <Input.TextArea rows={4} placeholder="请输入会议有关议题" />
                          </Form.Item>
                        </>
                      ) : null}

                      {taskType === "100" ? (
                        <>
                          <div className="task-issue-drawer__base-grid">
                            <Form.Item label="走访城市" name="cityName" rules={[{ required: true, message: "请输入走访城市" }]}>
                              <Input />
                            </Form.Item>
                            <Form.Item label="随行人员" name="visitUsers">
                              <Select mode="multiple" options={userOptions} />
                            </Form.Item>
                            <Form.Item label="出发时间" name="leaveTime">
                              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD HH:mm:ss" showTime />
                            </Form.Item>
                            <Form.Item label="返回时间" name="returnTime">
                              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD HH:mm:ss" showTime />
                            </Form.Item>
                          </div>
                          <Form.Item label="走访计划" name="visitPlan">
                            <Input.TextArea rows={4} placeholder="请输入走访计划" />
                          </Form.Item>
                        </>
                      ) : null}

                      {["300", "400", "500"].includes(taskType) ? (
                        <>
                          {taskType === "300" ? (
                            <>
                              <Form.Item name="sanhuiMgmtId" hidden rules={[{ required: true, message: "缺少三会事项" }]}>
                                <Input />
                              </Form.Item>
                              <Form.Item
                                label="会议及议题编码"
                                name="sanhuiMgmtNo"
                                rules={[{ required: true, message: "缺少会议及议题编码" }]}
                              >
                                <Input disabled placeholder="打开三会详情后自动带入" />
                              </Form.Item>
                            </>
                          ) : null}
                          <Form.Item label="任务标题" name="taskTitle" rules={[{ required: true, message: "请输入任务标题" }]}>
                            <Input placeholder="请输入任务标题" />
                          </Form.Item>
                          <Form.Item label="任务描述" name="taskDesc" rules={[{ required: true, message: "请输入任务描述" }]}>
                            <Input.TextArea rows={5} placeholder="请输入任务描述" />
                          </Form.Item>
                        </>
                      ) : null}

                      <div className="task-issue-drawer__base-grid">
                        <Form.Item label="任务完成时间" name="planCmplTime" rules={[{ required: true, message: "请选择任务完成时间" }]}>
                          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD HH:mm:ss" showTime />
                        </Form.Item>
                        <Form.Item label="上传附件" name="files">
                          <Upload beforeUpload={() => false}>
                            <Button>上传附件</Button>
                          </Upload>
                        </Form.Item>
                      </div>
                    </Form>
                  </section>
                  <div className="task-issue-drawer__footer">
                    <span>保存后可继续补充，创建任务后自动写入关联任务列表。</span>
                    <div>
                      <Button onClick={handleSave} loading={loading}>保存</Button>
                      <Button type="primary" onClick={handleSubmit} loading={loading}>创建任务</Button>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: "related",
              label: "关联任务",
              children: relatedTasks.length ? (
                <div className="task-issue-drawer__related-list">
                  {relatedTasks.map((task) => (
                    <article key={task.id || task.title}>
                      <strong>{task.title}</strong>
                      <span>{task.status || "处理中"}</span>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="task-issue-drawer__empty">暂无关联任务</div>
              ),
            },
          ]}
        />
      </Drawer>

      <Modal
        title="确认创建任务"
        open={confirmOpen}
        okText="确认"
        cancelText="取消"
        onCancel={() => setConfirmOpen(false)}
        onOk={handleConfirmSubmit}
        zIndex={zIndex + 10}
      >
        <div>确认提交后将立即创建任务，是否继续？</div>
      </Modal>
    </>
  );
}
