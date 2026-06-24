import { Button, Drawer, Form, Input, Radio, Select, Space, Switch, Table, Tag, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import getBySanhuiMgmtIdResponse from "../../mock/data/evaluation/getBySanhuiMgmtId.json";
import EvaluationDetail from "./EvaluationDetail";
import styles from "./index.module.css";

const reviewLevelOptions = [
  { value: "业务总监", label: "业务总监" },
  { value: "分管副总", label: "分管副总" },
  { value: "总办会", label: "总办会" },
];

const categoryOptions = {
  lv1: [
    { value: "1. 经营类", label: "1. 经营类" },
    { value: "2. 投资类", label: "2. 投资类" },
    { value: "3. 财务类", label: "3. 财务类" },
    { value: "4. 治理类", label: "4. 治理类" },
    { value: "5. 人事类", label: "5. 人事类" },
  ],
  lv2: {
    "1. 经营类": [
      { value: "1.3 定期监管报告", label: "1.3 定期监管报告" },
      { value: "1.4 股票回顾", label: "1.4 股票回顾" },
      { value: "1.5 分拆上市", label: "1.5 分拆上市" },
      { value: "1.6 其他", label: "1.6 其他" },
      { value: "1.2 年度/半年度经营报告", label: "1.2 年度/半年度经营报告" },
      { value: "1.1 业务规划及整合", label: "1.1 业务规划及整合" },
    ],
    "2. 投资类": [
      { value: "2.1 投资计划", label: "2.1 投资计划" },
      { value: "2.2 投资决策", label: "2.2 投资决策" },
      { value: "2.3 投后管理", label: "2.3 投后管理" },
    ],
    "3. 财务类": [
      { value: "3.1 财务预算", label: "3.1 财务预算" },
      { value: "3.2 财务决算", label: "3.2 财务决算" },
      { value: "3.3 利润分配", label: "3.3 利润分配" },
    ],
    "4. 治理类": [
      { value: "4.1 公司治理", label: "4.1 公司治理" },
      { value: "4.2 制度修订", label: "4.2 制度修订" },
      { value: "4.3 授权管理", label: "4.3 授权管理" },
    ],
    "5. 人事类": [
      { value: "5.1 干部任免", label: "5.1 干部任免" },
      { value: "5.2 薪酬考核", label: "5.2 薪酬考核" },
      { value: "5.3 组织调整", label: "5.3 组织调整" },
    ],
  },
  lv3: {
    "1.3 定期监管报告": [
      { value: "1.3.1 按国家部委等上级机构监管要求定期报告事项（含反洗钱、反欺诈、重大风险评估、绩效追索扣回、离任审计、内部控制等）", label: "1.3.1 按国家部委等上级机构监管要求定期报告事项（含反洗钱、反欺诈、重大风险评估、绩效追索扣回、离任审计、内部控制等）", approvalLevel: "业务总监" },
      { value: "1.3.2 落实国家、中央重大专项要求的定期报告事项（如上市公司“提质增效重回报”行动等）", label: "1.3.2 落实国家、中央重大专项要求的定期报告事项（如上市公司“提质增效重回报”行动等）", approvalLevel: "业务总监" },
    ],
    "1.4 股票回顾": [
      { value: "1.4.1 上市公司股票回顾及市值管理报告", label: "1.4.1 上市公司股票回顾及市值管理报告", approvalLevel: "分管副总" },
    ],
    "1.5 分拆上市": [
      { value: "1.5.1 分拆上市方案审议", label: "1.5.1 分拆上市方案审议", approvalLevel: "总办会" },
    ],
    "1.6 其他": [
      { value: "1.6.1 其他经营事项", label: "1.6.1 其他经营事项", approvalLevel: "业务总监" },
    ],
    "1.2 年度/半年度经营报告": [
      { value: "1.2.1 年度经营报告", label: "1.2.1 年度经营报告", approvalLevel: "分管副总" },
      { value: "1.2.2 半年度经营报告", label: "1.2.2 半年度经营报告", approvalLevel: "分管副总" },
    ],
    "1.1 业务规划及整合": [
      { value: "1.1.1 业务规划及整合方案", label: "1.1.1 业务规划及整合方案", approvalLevel: "总办会" },
    ],
  },
};

const getLevel2Options = (lv1) => categoryOptions.lv2[lv1] || [];
const getLevel3Options = (lv2) => categoryOptions.lv3[lv2] || [];
const getApprovalLevelByCategory = (lv3) => {
  const option = Object.values(categoryOptions.lv3).flat().find((item) => item.value === lv3);
  return option?.approvalLevel || "";
};

function createInitialTopics(projectData) {
  return getBySanhuiMgmtIdResponse.data.map((item, index) => ({
    ...item,
    topicName: index === 0 ? projectData?.projName || item.topicName : item.topicName,
  }));
}

function sortTopics(topics) {
  return [...topics].sort((a, b) => a.level - b.level);
}

function TopicEditDrawer({ open, mode, record, onClose, onSave }) {
  const [form] = Form.useForm();
  const planTopicFlag = Form.useWatch("planTopicFlag", form);
  const [level2Options, setLevel2Options] = useState([]);
  const [level3Options, setLevel3Options] = useState([]);

  useEffect(() => {
    if (!open) return;
    const initialValues = {
      needPreAudit: record?.needPreAudit || "0",
      topicName: record?.topicName || "",
      boardMeeting: Boolean(record?.boardMeeting),
      supervisorMeeting: Boolean(record?.supervisorMeeting),
      shareholderMeeting: Boolean(record?.shareholderMeeting),
      boardBack: Boolean(record?.boardBack),
      supervisorBack: Boolean(record?.supervisorBack),
      shareholderBack: Boolean(record?.shareholderBack),
      planTopicFlag: record?.planTopicFlag || "0",
      planItemName: record?.planItemName || "",
      categoryMain: record?.categoryMain,
      categoryMiddle: record?.categoryMiddle,
      categorySmall: record?.categorySmall,
      approvalLevel: record?.approvalLevel,
    };
    form.setFieldsValue(initialValues);
    setLevel2Options(getLevel2Options(initialValues.categoryMain));
    setLevel3Options(getLevel3Options(initialValues.categoryMiddle));
  }, [form, open, record]);

  const handleLevel1Change = (value) => {
    setLevel2Options(getLevel2Options(value));
    setLevel3Options([]);
    form.setFieldsValue({ categoryMiddle: undefined, categorySmall: undefined, approvalLevel: undefined });
  };

  const handleLevel2Change = (value) => {
    setLevel3Options(getLevel3Options(value));
    form.setFieldsValue({ categorySmall: undefined, approvalLevel: undefined });
  };

  const handleLevel3Change = (value) => {
    form.setFieldsValue({ approvalLevel: getApprovalLevelByCategory(value) });
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    if (!values.boardMeeting && !values.supervisorMeeting && !values.shareholderMeeting) {
      message.error("请至少选择一项参会审议");
      return;
    }
    onSave({
      ...record,
      ...values,
      id: record?.id || `evaluation-${Date.now()}`,
      status: record?.status || "评估中",
    });
  };

  return (
    <Drawer title={mode === "edit" ? "编辑议题" : "新增议题"} width={960} open={open} onClose={onClose} destroyOnClose>
      <div className={styles.topicEditDrawer}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            needPreAudit: "0",
            boardMeeting: false,
            supervisorMeeting: false,
            shareholderMeeting: false,
            boardBack: false,
            supervisorBack: false,
            shareholderBack: false,
            planTopicFlag: "0",
          }}
        >
          <div className={styles.topicEditSectionTitle}>基本信息</div>
          <div className={styles.topicEditGrid}>
            <Form.Item label="前序审核（由集团/股权公司总办会/党委会等已审批通过）" name="needPreAudit" rules={[{ required: true, message: "请选择" }]}>
              <Select placeholder="请选择" options={[{ label: "有", value: "1" }, { label: "无", value: "0" }]} />
            </Form.Item>
            <Form.Item label="议题名称" name="topicName" rules={[{ required: true, message: "请输入" }]}>
              <Input placeholder="请输入" />
            </Form.Item>
            <Form.Item className={styles.topicEditSwitchItem} label="参会审议">
              <div className={styles.topicEditSwitchGroup}>
                <span>董事会</span>
                <Form.Item name="boardMeeting" valuePropName="checked" noStyle><Switch /></Form.Item>
                <span>监事会</span>
                <Form.Item name="supervisorMeeting" valuePropName="checked" noStyle><Switch /></Form.Item>
                <span>股东会</span>
                <Form.Item name="shareholderMeeting" valuePropName="checked" noStyle><Switch /></Form.Item>
              </div>
            </Form.Item>
            <Form.Item className={styles.topicEditSwitchItem} label="回避表决">
              <div className={styles.topicEditSwitchGroup}>
                <span>董事会</span>
                <Form.Item name="boardBack" valuePropName="checked" noStyle><Switch /></Form.Item>
                <span>监事会</span>
                <Form.Item name="supervisorBack" valuePropName="checked" noStyle><Switch /></Form.Item>
                <span>股东会</span>
                <Form.Item name="shareholderBack" valuePropName="checked" noStyle><Switch /></Form.Item>
              </div>
            </Form.Item>
            <Form.Item label="计划议题" name="planTopicFlag" rules={[{ required: true, message: "请选择是否计划议题" }]}>
              <Radio.Group options={[{ label: "是", value: "1" }, { label: "否", value: "0" }]} onChange={(event) => {
                if (event.target.value !== "1") {
                  form.setFieldsValue({ planItemName: "" });
                }
              }} />
            </Form.Item>
            <Form.Item label="关联计划议题（以备证计划议题被提报）" name="planItemName">
              <Input.Search placeholder="请选择关联的计划议题" enterButton disabled={planTopicFlag !== "1"} />
            </Form.Item>
            <Form.Item label="议题分类（大）" name="categoryMain" rules={[{ required: true, message: "请选择" }]}>
              <Select placeholder="请选择" allowClear options={categoryOptions.lv1} onChange={handleLevel1Change} />
            </Form.Item>
            <Form.Item label="议题分类（中）" name="categoryMiddle" rules={[{ required: true, message: "请选择" }]}>
              <Select placeholder="请选择" allowClear options={level2Options} onChange={handleLevel2Change} />
            </Form.Item>
            <Form.Item label="议题分类（小）" name="categorySmall" rules={[{ required: true, message: "请选择" }]}>
              <Select placeholder="请选择" allowClear options={level3Options} onChange={handleLevel3Change} />
            </Form.Item>
            <Form.Item label="审批层级" name="approvalLevel" rules={[{ required: true, message: "请选择" }]}>
              <Select placeholder="请选择" allowClear options={reviewLevelOptions} />
            </Form.Item>
          </div>
          <div className={styles.topicEditSectionTitle}>相关附件</div>
          <div className={styles.topicEditAttachmentTip}>AI已经帮您选择了认为相关的文档，如有遗漏请补充选择！</div>
          <div className={styles.topicEditFooter}>
            <Button onClick={() => message.info("当前为本地假数据演示，未接入材料补充页面")}>补充汇报材料</Button>
            <Button onClick={() => message.info("当前为本地假数据预览")}>预览</Button>
            <Button type="primary" onClick={handleSave}>保存</Button>
          </div>
        </Form>
      </div>
    </Drawer>
  );
}

export default function TopicEvaluation({ projectData }) {
  const navigate = useNavigate();
  const [topics, setTopics] = useState(() => createInitialTopics(projectData));
  const [completed, setCompleted] = useState(false);
  const [activeTopic, setActiveTopic] = useState(null);
  const [topicDrawerOpen, setTopicDrawerOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);

  useEffect(() => {
    setTopics(createInitialTopics(projectData));
    setCompleted(false);
    setActiveTopic(null);
    setTopicDrawerOpen(false);
    setEditingTopic(null);
  }, [projectData]);

  const moveTopic = (record, direction) => {
    setTopics((current) => {
      const ordered = sortTopics(current);
      const index = ordered.findIndex((item) => item.id === record.id);
      const nextIndex = direction === "up" ? index - 1 : index + 1;

      if (nextIndex < 0 || nextIndex >= ordered.length) {
        return current;
      }

      const next = [...ordered];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];

      return next.map((item, itemIndex) => ({
        ...item,
        level: itemIndex + 1,
      }));
    });
  };

  const finishEvaluation = () => {
    setCompleted(true);
    message.success("议题评估已完成，已发起议题审批");
    navigate("/GztHome?task=topicApproval");
  };

  const openAddTopic = () => {
    setEditingTopic(null);
    setTopicDrawerOpen(true);
  };

  const openEditTopic = (record) => {
    setEditingTopic(record);
    setTopicDrawerOpen(true);
  };

  const saveTopic = (topic) => {
    setTopics((current) => {
      const existed = current.some((item) => item.id === topic.id);
      if (existed) {
        return current.map((item) => (item.id === topic.id ? topic : item));
      }
      const maxLevel = current.reduce((max, item) => Math.max(max, item.level || 0), 0);
      return [{ ...topic, level: maxLevel + 1 }, ...current];
    });
    setTopicDrawerOpen(false);
    setEditingTopic(null);
    message.success("保存成功");
  };

  const columns = useMemo(() => [
    {
      title: "序号",
      width: 72,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "议题分类（大）",
      dataIndex: "categoryMain",
      width: 160,
    },
    {
      title: "议题分类（中）",
      dataIndex: "categoryMiddle",
      width: 180,
    },
    {
      title: "议题分类（小）",
      dataIndex: "categorySmall",
      minWidth: 300,
      render: (text) => <span className={styles.categorySmall}>{text}</span>,
    },
    {
      title: "议题名称",
      dataIndex: "topicName",
      minWidth: 240,
      render: (text) => <span className={styles.topicName}>{text}</span>,
    },
    {
      title: "审批层级",
      dataIndex: "approvalLevel",
      width: 110,
      align: "center",
    },
    {
      title: "董事会",
      dataIndex: "boardMeeting",
      width: 86,
      align: "center",
      render: (value) => <span className={value ? styles.meetingEnabled : styles.meetingDisabled}>{value ? "√" : "-"}</span>,
    },
    {
      title: "监事会",
      dataIndex: "supervisorMeeting",
      width: 86,
      align: "center",
      render: (value) => <span className={value ? styles.meetingEnabled : styles.meetingDisabled}>{value ? "√" : "-"}</span>,
    },
    {
      title: "股东会",
      dataIndex: "shareholderMeeting",
      width: 86,
      align: "center",
      render: (value) => <span className={value ? styles.meetingEnabled : styles.meetingDisabled}>{value ? "√" : "-"}</span>,
    },
    {
      title: "评估状态",
      dataIndex: "status",
      width: 110,
      align: "center",
      render: (status) => <Tag color={completed ? "success" : "processing"}>{completed ? "已完成" : status}</Tag>,
    },
    {
      title: "操作",
      width: 210,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => setActiveTopic(record)}>评估</Button>
          <Button type="link" onClick={() => openEditTopic(record)}>编辑</Button>
          <Button type="link" onClick={() => moveTopic(record, "up")}>上移</Button>
          <Button type="link" onClick={() => moveTopic(record, "down")}>下移</Button>
        </Space>
      ),
    },
  ], [completed]);

  const orderedTopics = useMemo(() => sortTopics(topics), [topics]);

  return (
    <div className={styles.page}>
      <div className={styles.tableCard}>
        <div className={styles.actionBar}>
          <span className={styles.summary}>
            共 {orderedTopics.length} 项议题，点击“评估”进入详情并完成附件确认、评分、PDF批注与综合意见。
          </span>
          <Space>
            <Button type="primary" onClick={openAddTopic}>新增议题</Button>
            <Button onClick={() => setTopics((current) => sortTopics(current))}>自动分级排序</Button>
          </Space>
        </div>
        <div className={styles.tableWrap}>
          <Table
            rowKey="id"
            bordered
            pagination={false}
            columns={columns}
            dataSource={orderedTopics}
            scroll={{ x: 1220 }}
          />
        </div>
        <div className={styles.footer}>
          <Button type="primary" onClick={finishEvaluation}>评估完成</Button>
        </div>
      </div>
      <EvaluationDetail
        open={Boolean(activeTopic)}
        topic={activeTopic}
        onClose={() => setActiveTopic(null)}
      />
      <TopicEditDrawer
        open={topicDrawerOpen}
        mode={editingTopic ? "edit" : "add"}
        record={editingTopic}
        onClose={() => {
          setTopicDrawerOpen(false);
          setEditingTopic(null);
        }}
        onSave={saveTopic}
      />
    </div>
  );
}
