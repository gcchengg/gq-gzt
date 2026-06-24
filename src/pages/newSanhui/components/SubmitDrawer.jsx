import { Button, Card, Checkbox, DatePicker, Drawer, Form, Input, Popconfirm, Radio, Select, Space, Switch, Table, Tabs, Tag, Tooltip, Upload, message, } from "antd";
import { InboxOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import smartGetListResponse from "../mock/data/submit/smartGetList.json";
import topicGetListResponse from "../mock/data/submit/topicGetList.json";
import meetingGetListResponse from "../mock/data/submit/meetingGetList.json";
import proposalGetResponse from "../mock/data/submit/proposalGet.json";
import "./SubmitDrawer.css";
const topicFileTypes = [
    { value: "100", label: "会议通知" },
    { value: "200", label: "议题相关" },
    { value: "300", label: "议题目录" },
    { value: "400", label: "补充材料" },
];
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
            { value: "1.3.1 按国家部委等上级机构监管要求定期报告事项（含反洗钱、反欺诈、重大风险评估、绩效追索扣回、离任审计、内部控制等）", label: "1.3.1 按国家部委等上级机构监管要求定期报告事项（含反洗钱、反欺诈、重大风险评估、绩效追索扣回、离任审计、内部控制等）", reviewLevel2: "业务总监" },
            { value: "1.3.2 落实国家、中央重大专项要求的定期报告事项（如上市公司“提质增效重回报”行动等）", label: "1.3.2 落实国家、中央重大专项要求的定期报告事项（如上市公司“提质增效重回报”行动等）", reviewLevel2: "业务总监" },
        ],
        "1.4 股票回顾": [
            { value: "1.4.1 上市公司股票回顾及市值管理报告", label: "1.4.1 上市公司股票回顾及市值管理报告", reviewLevel2: "分管副总" },
        ],
        "1.5 分拆上市": [
            { value: "1.5.1 分拆上市方案审议", label: "1.5.1 分拆上市方案审议", reviewLevel2: "总办会" },
        ],
        "1.6 其他": [
            { value: "1.6.1 其他经营事项", label: "1.6.1 其他经营事项", reviewLevel2: "业务总监" },
        ],
        "1.2 年度/半年度经营报告": [
            { value: "1.2.1 年度经营报告", label: "1.2.1 年度经营报告", reviewLevel2: "分管副总" },
            { value: "1.2.2 半年度经营报告", label: "1.2.2 半年度经营报告", reviewLevel2: "分管副总" },
        ],
        "1.1 业务规划及整合": [
            { value: "1.1.1 业务规划及整合方案", label: "1.1.1 业务规划及整合方案", reviewLevel2: "总办会" },
        ],
    },
};
const getLevel2Options = (lv1) => categoryOptions.lv2[lv1] || [];
const getLevel3Options = (lv2) => categoryOptions.lv3[lv2] || [];
const getReviewLevelByCategory = (lv3) => {
    const option = Object.values(categoryOptions.lv3)
        .flat()
        .find((item) => item.value === lv3);
    return option?.reviewLevel2 || "";
};

const distributionSubmitTip = (
  <div className="submit-distribution-tip">
    <div>
      <strong>原先：</strong>
      <p>1. 给董监高角色发送【三会议题确认】钉钉通知</p>
      <p>2. 发送议题评估任务</p>
    </div>
    <div>
      <strong>现在：</strong>
      <p>1. 给董监高角色发送议题反馈建议任务</p>
      <p>2. 发送财务/法务/投资/综合管理/党群初审任务 -- 二期</p>
      <p>3. 发送议题评估任务</p>
    </div>
  </div>
);
const smartSubmitTip = (
  <div className="submit-distribution-tip">
    <p>1.操作列新增 【上移】【下移】</p>
    <p>2.点击下一步时，需要使用E签宝把非pdf文件转为pdf文件，方便在评估时标注</p>
  </div>
);
const launchedSubmitTasks = [
    "议题初审_法务",
    "议题初审_财务",
    "议题初审_投资",
    "议题初审_综合管理",
    "议题初审_党群初审",
    "议题评估任务",
];
const promptText = {
    smart: "请上传提报文档，AI 将会提取信息并自动创建议题以及会议数据。",
    topic: "AI 从提报的文档中提取并创建了以下议题，请确认并补充遗漏或修改错误的议题信息。",
    meeting: "AI 从提报的文档中提取并创建了以下会议，请确认并补充遗漏或修改错误的会议信息。",
    distribution: "请确认议题资料传达对象，并根据会议类型勾选参会人员和传达范围。",
};
const initialSmartFiles = smartGetListResponse.data;
const initialTopics = topicGetListResponse.data.list;
const initialMeetings = meetingGetListResponse.data.map((item) => ({
    ...item,
    notifyDate: item.notifyDate ? dayjs(item.notifyDate) : null,
    launchTime: item.launchTime ? dayjs(item.launchTime) : null,
}));
const initialDistribution = proposalGetResponse.data.supervisorNotifyList;
const reviewerUserOptions = [
    { label: "王明", value: "wangming" },
    { label: "李娜", value: "lina" },
    { label: "赵鹏", value: "zhaopeng" },
    { label: "周静", value: "zhoujing" },
    { label: "刘洋", value: "liuyang" },
    { label: "陈晨", value: "chenchen" },
];
const initialReviewerNotifyList = proposalGetResponse.data.reviewerNotifyList;
function Prompt({ type }) {
    return (<div className="submit-prompt">
      <span className="submit-prompt-icon">AI</span>
      <span>{promptText[type]}</span>
    </div>);
}
function Panel({ title, extra, children }) {
    return (<div className="submit-panel">
      <div className="submit-panel-head">
        <div className="submit-panel-title">{title}</div>
        {extra ? <div className="submit-panel-extra">{extra}</div> : null}
      </div>
      <div className="submit-panel-body">{children}</div>
    </div>);
}
function TopicEditDrawer({ open, mode, record, disabled, onClose, onSave, }) {
    const [form] = Form.useForm();
    const planTopicFlag = Form.useWatch("planTopicFlag", form);
    const [selectedFileKeys, setSelectedFileKeys] = useState([]);
    const [level2Options, setLevel2Options] = useState([]);
    const [level3Options, setLevel3Options] = useState([]);
    useEffect(() => {
        if (!open) {
            return;
        }
        const initialValues = {
            needPreAudit: record?.needPreAudit || "0",
            toipcName: record?.toipcName || "",
            board: Boolean(record?.board),
            supervisor: Boolean(record?.supervisor),
            shareholder: Boolean(record?.shareholder),
            boardBack: Boolean(record?.boardBack),
            supervisorBack: Boolean(record?.supervisorBack),
            shareholderBack: Boolean(record?.shareholderBack),
            planTopicFlag: record?.planTopicFlag || "0",
            planItemName: record?.planItemName || "",
            categoryLv1Name: record?.categoryLv1Name,
            categoryLv2Name: record?.categoryLv2Name,
            categoryLv3Name: record?.categoryLv3Name,
            reviewLevel2: record?.reviewLevel2,
        };
        form.setFieldsValue(initialValues);
        setLevel2Options(getLevel2Options(initialValues.categoryLv1Name));
        setLevel3Options(getLevel3Options(initialValues.categoryLv2Name));
        setSelectedFileKeys(record?.fileIds || []);
    }, [form, open, record]);
    const handleLevel1Change = (value) => {
        setLevel2Options(getLevel2Options(value));
        setLevel3Options([]);
        form.setFieldsValue({
            categoryLv2Name: undefined,
            categoryLv3Name: undefined,
            reviewLevel2: undefined,
        });
    };
    const handleLevel2Change = (value) => {
        setLevel3Options(getLevel3Options(value));
        form.setFieldsValue({
            categoryLv3Name: undefined,
            reviewLevel2: undefined,
        });
    };
    const handleLevel3Change = (value) => {
        form.setFieldsValue({ reviewLevel2: getReviewLevelByCategory(value) });
    };
    const handleSave = async () => {
        const values = await form.validateFields();
        if (!values.board && !values.supervisor && !values.shareholder) {
            message.error("请至少选择一项参会审议");
            return;
        }
        onSave({
            ...record,
            ...values,
            id: record?.id || `topic-${Date.now()}`,
            fileIds: selectedFileKeys,
        });
    };
    const attachmentColumns = [
        { title: "序号", width: 64, render: (_value, _row, index) => index + 1 },
        { title: "文件名", dataIndex: "fileName" },
        {
            title: "文件分类",
            dataIndex: "fileCategory",
            width: 140,
            render: (value) => topicFileTypes.find((item) => item.value === value)?.label || "-",
        },
    ];
    return (<Drawer title={mode === "edit" ? "编辑议题" : "新增议题"} width={960} open={open} onClose={onClose} destroyOnClose>
      <div className="topic-edit-drawer">
        <Form form={form} layout="vertical" disabled={disabled} initialValues={{
            needPreAudit: "0",
            board: false,
            supervisor: false,
            shareholder: false,
            boardBack: false,
            supervisorBack: false,
            shareholderBack: false,
            planTopicFlag: "0",
        }}>
          <div className="topic-edit-section-title">基本信息</div>
          <div className="topic-edit-grid">
            <Form.Item label="前序审核（由集团/股权公司总办会/党委会等已审批通过）" name="needPreAudit" rules={[{ required: true, message: "请选择" }]}>
              <Select placeholder="请选择" options={[
            { label: "有", value: "1" },
            { label: "无", value: "0" },
        ]}/>
            </Form.Item>
            <Form.Item label="议题名称" name="toipcName" rules={[{ required: true, message: "请输入" }]}>
              <Input placeholder="请输入"/>
            </Form.Item>
            <Form.Item className="topic-edit-switch-item" label="参会审议">
              <div className="topic-edit-switch-group">
                <span>董事会</span>
                <Form.Item name="board" valuePropName="checked" noStyle>
                  <Switch/>
                </Form.Item>
                <span>监事会</span>
                <Form.Item name="supervisor" valuePropName="checked" noStyle>
                  <Switch/>
                </Form.Item>
                <span>股东会</span>
                <Form.Item name="shareholder" valuePropName="checked" noStyle>
                  <Switch/>
                </Form.Item>
              </div>
            </Form.Item>
            <Form.Item className="topic-edit-switch-item" label="回避表决">
              <div className="topic-edit-switch-group">
                <span>董事会</span>
                <Form.Item name="boardBack" valuePropName="checked" noStyle>
                  <Switch/>
                </Form.Item>
                <span>监事会</span>
                <Form.Item name="supervisorBack" valuePropName="checked" noStyle>
                  <Switch/>
                </Form.Item>
                <span>股东会</span>
                <Form.Item name="shareholderBack" valuePropName="checked" noStyle>
                  <Switch/>
                </Form.Item>
              </div>
            </Form.Item>
            <Form.Item label="计划议题" name="planTopicFlag" rules={[{ required: true, message: "请选择是否计划议题" }]}>
              <Radio.Group options={[
            { label: "是", value: "1" },
            { label: "否", value: "0" },
        ]} onChange={(event) => {
            if (event.target.value !== "1") {
                form.setFieldsValue({ planItemName: "" });
            }
        }}/>
            </Form.Item>
            <Form.Item label="关联计划议题（以备证计划议题被提报）" name="planItemName">
              <Input.Search placeholder="请选择关联的计划议题" enterButton disabled={planTopicFlag !== "1"}/>
            </Form.Item>
            <Form.Item label="议题分类（大）" name="categoryLv1Name" rules={[{ required: true, message: "请选择" }]}>
              <Select placeholder="请选择" allowClear options={categoryOptions.lv1} onChange={handleLevel1Change}/>
            </Form.Item>
            <Form.Item label="议题分类（中）" name="categoryLv2Name" rules={[{ required: true, message: "请选择" }]}>
              <Select placeholder="请选择" allowClear options={level2Options} onChange={handleLevel2Change}/>
            </Form.Item>
            <Form.Item label="议题分类（小）" name="categoryLv3Name" rules={[{ required: true, message: "请选择" }]}>
              <Select placeholder="请选择" allowClear options={level3Options} onChange={handleLevel3Change}/>
            </Form.Item>
            <Form.Item label="审批层级" name="reviewLevel2" rules={[{ required: true, message: "请选择" }]}>
              <Select placeholder="请选择" allowClear options={reviewLevelOptions}/>
            </Form.Item>
          </div>
          <div className="topic-edit-section-title">相关附件</div>
          <div className="topic-edit-attachment-tip">
            AI已经帮您选择了认为相关的文档，如有遗漏请补充选择！
          </div>
          <Table className="submit-table" rowKey="id" columns={attachmentColumns} dataSource={initialSmartFiles} pagination={false} size="small" rowSelection={{
            selectedRowKeys: selectedFileKeys,
            onChange: (keys) => setSelectedFileKeys(keys),
          }}/>
          <div className="topic-edit-footer">
            <Button onClick={() => message.info("当前为本地假数据演示，未接入材料补充页面")} disabled={disabled}>
              补充汇报材料
            </Button>
            <Button onClick={() => message.info("当前为本地假数据预览")} disabled={disabled}>
              预览
            </Button>
            <Button type="primary" onClick={handleSave} disabled={disabled}>
              保存
            </Button>
          </div>
        </Form>
      </div>
    </Drawer>);
}
function SmartSubmit({ disabled, onNext, }) {
    const [files, setFiles] = useState(initialSmartFiles);
    const moveFile = (index, offset) => {
        setFiles((current) => {
            const nextIndex = index + offset;
            if (nextIndex < 0 || nextIndex >= current.length) {
                return current;
            }
            const next = [...current];
            const [target] = next.splice(index, 1);
            next.splice(nextIndex, 0, target);
            return next;
        });
    };
    const columns = [
        {
            title: "序号",
            width: 64,
            render: (_value, _row, index) => index + 1,
        },
        {
            title: "文件名",
            dataIndex: "fileName",
            width: 260,
            render: (value) => <a href="#">{value}</a>,
        },
        {
            title: "文件分类",
            dataIndex: "fileCategory",
            width: 180,
            render: (value, record) => (<Select disabled={disabled} value={value} style={{ width: "100%" }} options={topicFileTypes} onChange={(nextValue) => {
                    setFiles((current) => current.map((item) => item.id === record.id
                        ? {
                            ...item,
                            fileCategory: nextValue,
                            aiAnalysisResult: nextValue === "100"
                                ? "已提取到 1 个会议信息"
                                : nextValue === "300"
                                    ? "已提取到关键信息并创建了 2 个议题"
                                    : "已通过议题目录文件提取议题，本文件不解析",
                        }
                        : item));
                }}/>),
        },
        {
            title: "AI处理状态",
            dataIndex: "aiAnalysisStatus",
            width: 130,
            render: (value) => (<Tag color={value === "1" ? "success" : "error"}>
          {value === "1" ? "解析完成" : "解析失败"}
        </Tag>),
        },
        {
            title: "AI提取结果",
            dataIndex: "aiAnalysisResult",
            ellipsis: true,
        },
        {
            title: "操作",
            width: 210,
            render: (_value, record, index) => disabled ? null : (<Space className="submit-table-action" size={4}>
            <Button type="link" disabled={index === 0} onClick={() => moveFile(index, -1)}>
              上移
            </Button>
            <Button type="link" disabled={index === files.length - 1} onClick={() => moveFile(index, 1)}>
              下移
            </Button>
            <Button type="link" danger onClick={() => setFiles((current) => current.filter((item) => item.id !== record.id))}>
              删除
            </Button>
          </Space>),
        },
    ];
    return (<div className="submit-section">
      <Prompt type="smart"/>
      <Panel title="提报材料">
        <Upload.Dragger className="submit-upload-dragger" disabled={disabled} multiple={false} showUploadList={false} beforeUpload={(file) => {
            const newFile = {
                id: `smart-${Date.now()}`,
                fileName: file.name,
                fileCategory: file.name.includes("通知") ? "100" : "200",
                aiAnalysisStatus: "1",
                aiAnalysisResult: file.name.includes("通知")
                    ? "已提取到 1 个会议信息"
                    : "已提取到关键信息并创建了 1 个议题",
            };
            setFiles((current) => [newFile, ...current]);
            message.success(`文件 "${file.name}" 已加入本地假数据`);
            return false;
        }}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或将文件拖拽到这里上传</p>
        <p className="ant-upload-hint">本项目不会调用真实上传接口，文件只会写入本地假数据列表。</p>
      </Upload.Dragger>
      </Panel>
      <Panel title="AI 解析结果">
        <Table className="submit-table" bordered size="small" rowKey="id" columns={columns} dataSource={files} pagination={false} scroll={{ x: 920 }}/>
      </Panel>
      {!disabled ? (<div className="submit-footer">
          <span className="submit-footer-hint">确认材料顺序后进入议题管理</span>
          <Button type="primary" onClick={onNext}>
            下一步
          </Button>
        </div>) : null}
    </div>);
}
function TopicManage({ disabled, onPrev, onNext, }) {
    const [form] = Form.useForm();
    const [allTopics, setAllTopics] = useState(initialTopics);
    const [topics, setTopics] = useState(initialTopics);
    const [filterLevel2Options, setFilterLevel2Options] = useState([]);
    const [filterLevel3Options, setFilterLevel3Options] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingTopic, setEditingTopic] = useState(null);
    const columns = [
        { title: "序号", width: 64, render: (_value, _row, index) => index + 1 },
        { title: "议题分类（大）", dataIndex: "categoryLv1Name" },
        { title: "议题分类（中）", dataIndex: "categoryLv2Name" },
        { title: "议题分类（小）", dataIndex: "categoryLv3Name" },
        { title: "议题名称", dataIndex: "toipcName", width: 280 },
        {
            title: "董事会",
            dataIndex: "board",
            render: (value) => (value ? "√" : "-"),
        },
        {
            title: "监事会",
            dataIndex: "supervisor",
            render: (value) => (value ? "√" : "-"),
        },
        {
            title: "股东会",
            dataIndex: "shareholder",
            render: (value) => (value ? "√" : "-"),
        },
        { title: "审批层级", dataIndex: "reviewLevel2" },
        {
            title: "操作",
            width: 150,
            render: (_value, record) => (<Space size={4}>
          <Button type="link" onClick={() => {
                setEditingTopic(record);
                setDrawerOpen(true);
            }}>
            编辑
          </Button>
          {!disabled ? (<Popconfirm title="是否确定删除这条数据?" okText="确定" cancelText="取消" onConfirm={() => {
                setTopics((current) => current.filter((item) => item.id !== record.id));
                setAllTopics((current) => current.filter((item) => item.id !== record.id));
            }}>
              <Button type="link" danger>
                删除
              </Button>
            </Popconfirm>) : null}
        </Space>),
        },
    ];
    const handleSearch = () => {
        const values = form.getFieldsValue();
        const filtered = allTopics.filter((topic) => {
            const lv1Matched = values.categoryLv1Name
                ? topic.categoryLv1Name === values.categoryLv1Name
                : true;
            const lv2Matched = values.categoryLv2Name
                ? topic.categoryLv2Name === values.categoryLv2Name
                : true;
            const lv3Matched = values.categoryLv3Name
                ? topic.categoryLv3Name === values.categoryLv3Name
                : true;
            const levelMatched = values.reviewLevel2 ? topic.reviewLevel2 === values.reviewLevel2 : true;
            return lv1Matched && lv2Matched && lv3Matched && levelMatched;
        });
        setTopics(filtered);
    };
    const handleFilterLevel1Change = (value) => {
        setFilterLevel2Options(getLevel2Options(value));
        setFilterLevel3Options([]);
        form.setFieldsValue({
            categoryLv2Name: undefined,
            categoryLv3Name: undefined,
        });
    };
    const handleFilterLevel2Change = (value) => {
        setFilterLevel3Options(getLevel3Options(value));
        form.setFieldsValue({ categoryLv3Name: undefined });
    };
    const openAddDrawer = () => {
        setEditingTopic(null);
        setDrawerOpen(true);
    };
    const handleSaveTopic = (topic) => {
        setTopics((current) => {
            const existed = current.some((item) => item.id === topic.id);
            if (existed) {
                return current.map((item) => (item.id === topic.id ? topic : item));
            }
            return [topic, ...current];
        });
        setAllTopics((current) => {
            const existed = current.some((item) => item.id === topic.id);
            if (existed) {
                return current.map((item) => (item.id === topic.id ? topic : item));
            }
            return [topic, ...current];
        });
        setDrawerOpen(false);
        setEditingTopic(null);
        message.success("保存成功");
    };
    return (<div className="submit-section">
      <Prompt type="topic"/>
      <Panel title="筛选条件">
        <Form form={form} layout="vertical">
          <div className="submit-filter-grid">
            <Form.Item name="categoryLv1Name" label="议题分类（大）">
              <Select placeholder="请选择" allowClear options={categoryOptions.lv1} onChange={handleFilterLevel1Change}/>
            </Form.Item>
            <Form.Item name="categoryLv2Name" label="议题分类（中）">
              <Select placeholder="请选择" allowClear options={filterLevel2Options} onChange={handleFilterLevel2Change}/>
            </Form.Item>
            <Form.Item name="categoryLv3Name" label="议题分类（小）">
              <Select placeholder="请选择" allowClear options={filterLevel3Options}/>
            </Form.Item>
            <Form.Item name="reviewLevel2" label="审批层级">
              <Select placeholder="请选择" allowClear options={reviewLevelOptions}/>
            </Form.Item>
            <div className="submit-filter-actions">
              <Button onClick={() => {
              form.resetFields();
              setFilterLevel2Options([]);
              setFilterLevel3Options([]);
              setTopics(allTopics);
          }}>
                重置
              </Button>
              <Button type="primary" onClick={handleSearch}>
                搜索
              </Button>
              {!disabled ? (<Button type="primary" onClick={openAddDrawer}>
                  新增
                </Button>) : null}
            </div>
          </div>
        </Form>
      </Panel>
      <Panel title="议题清单">
        <Table className="submit-table" rowKey="id" columns={columns} dataSource={topics} pagination={false} size="small"/>
      </Panel>
      {!disabled ? (<div className="submit-footer">
          <span className="submit-footer-hint">确认议题后生成会议安排</span>
          <Button onClick={onPrev}>上一步</Button>
          <Button type="primary" onClick={onNext}>
            下一步
          </Button>
        </div>) : null}
      <TopicEditDrawer open={drawerOpen} mode={editingTopic ? "edit" : "add"} record={editingTopic} disabled={disabled} onClose={() => {
            setDrawerOpen(false);
            setEditingTopic(null);
        }} onSave={handleSaveTopic}/>
    </div>);
}
function MeetingCard({ meeting, disabled, onChange, }) {
    const [form] = Form.useForm();
    return (<div className="meeting-card">
      <div className="meeting-card-head">
        <div>
          <span className="meeting-card-mark"/>
          <strong>{meeting.meetingTypeName}</strong>
        </div>
        <Space>
          <Switch disabled={disabled} checked={meeting.enabled} onChange={(checked) => onChange({ ...meeting, enabled: checked })}/>
          <span>召开</span>
        </Space>
      </div>
      <Form form={form} layout="vertical" disabled={disabled || !meeting.enabled} initialValues={meeting} onValuesChange={(_, values) => onChange({ ...meeting, ...values })}>
        <Form.Item name="meetingName" label="会议名称" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="notifyDate" label="通知时间" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }}/>
        </Form.Item>
        <Form.Item name="launchType" label="召开方式" rules={[{ required: true }]}>
          <Radio.Group>
            <Radio value={1}>现场会议</Radio>
            <Radio value={2}>通讯表决</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="launchTime" label={meeting.launchType === 2 ? "表决日期" : "会议时间"} rules={[{ required: meeting.launchType !== 2 }]}>
          <DatePicker style={{ width: "100%" }} showTime={meeting.launchType !== 2 ? { format: "HH:mm" } : false} format={meeting.launchType !== 2 ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD"}/>
        </Form.Item>
        <Form.Item name="location" label="会议地点">
          <Input />
        </Form.Item>
      </Form>
    </div>);
}
function MeetingManage({ disabled, onPrev, onNext, }) {
    const [meetings, setMeetings] = useState(initialMeetings);
    return (<div className="submit-section">
      <Prompt type="meeting"/>
      <Panel title="会议安排">
        <div className="meeting-grid">
          {meetings.map((meeting) => (<MeetingCard key={meeting.key} meeting={meeting} disabled={disabled} onChange={(nextMeeting) => setMeetings((current) => current.map((item) => (item.key === nextMeeting.key ? nextMeeting : item)))}/>))}
        </div>
      </Panel>
      {!disabled ? (<div className="submit-footer">
          <span className="submit-footer-hint">确认会议后进入资料传达配置</span>
          <Button onClick={onPrev}>上一步</Button>
          <Button type="primary" onClick={onNext}>
            下一步
          </Button>
        </div>) : null}
    </div>);
}
function DistributionManage({ disabled, onPrev, onSubmit, }) {
    const [data, setData] = useState(initialDistribution);
    const [reviewerNotifyList, setReviewerNotifyList] = useState(initialReviewerNotifyList);
    const setChecked = (id, key, checked) => {
        setData((current) => current.map((item) => (item.id === id ? { ...item, [key]: checked } : item)));
    };
    const columns = [
        { title: "序号", width: 64, fixed: "left", render: (_value, _row, index) => index + 1 },
        { title: "职务分类", dataIndex: "positionCategory", width: 110 },
        { title: "职务", dataIndex: "positionCode", width: 140 },
        { title: "股东代表", dataIndex: "shDelFlag", width: 100 },
        { title: "任职人", dataIndex: "userName", width: 100 },
        {
            title: "董事会参会人员",
            dataIndex: "attendeeVos100",
            width: 140,
            render: (value, row) => (<Checkbox disabled={disabled} checked={value} onChange={(event) => setChecked(row.id, "attendeeVos100", event.target.checked)}/>),
        },
        {
            title: "监事会参会人员",
            dataIndex: "attendeeVos200",
            width: 140,
            render: (value, row) => (<Checkbox disabled={disabled} checked={value} onChange={(event) => setChecked(row.id, "attendeeVos200", event.target.checked)}/>),
        },
        {
            title: "股东会参会人员",
            dataIndex: "attendeeVos300",
            width: 140,
            render: (value, row) => (<Checkbox disabled={disabled} checked={value} onChange={(event) => setChecked(row.id, "attendeeVos300", event.target.checked)}/>),
        },
        { title: "集团总经理助理及以上", dataIndex: "topicNotifyFlag", width: 180 },
        {
            title: "传达对象",
            dataIndex: "hasConvey",
            fixed: "right",
            width: 110,
            render: (value, row) => (<Checkbox disabled={disabled} checked={value} onChange={(event) => setChecked(row.id, "hasConvey", event.target.checked)}/>),
        },
    ];
    const switchReviewerJoin = (checked, index) => {
        setReviewerNotifyList((current) => current.map((item, itemIndex) => {
            if (itemIndex !== index)
                return item;
            return {
                ...item,
                hasJoin: checked,
                userList: checked ? item.userList : [],
            };
        }));
    };
    const setReviewerUsers = (values, index) => {
        setReviewerNotifyList((current) => current.map((item, itemIndex) => {
            if (itemIndex !== index)
                return item;
            return {
                ...item,
                userList: values.map((loginId) => {
                    const option = reviewerUserOptions.find((user) => user.value === loginId);
                    return {
                        fullName: option?.label || loginId,
                        loginId,
                    };
                }),
            };
        }));
    };
    const submitDistribution = () => {
        const invalidReviewer = reviewerNotifyList.find((item) => item.hasJoin && item.userList.length === 0);
        if (invalidReviewer) {
            message.error(`请在「${invalidReviewer.orgName}」中选取人`);
            return;
        }
        message.success(`提交成功，已发起：${launchedSubmitTasks.join("、")}`);
        onSubmit();
    };
    return (<div className="submit-section">
      <Prompt type="distribution"/>
      <div className="distribution-layout">
        <Panel title="议题材料传达对象" extra={<span className="distribution-notice danger"><span className="distribution-notice-icon">!</span><span>集团总经理助理及以上不传达</span></span>}>
          <Table className="submit-table" rowKey="id" columns={columns} dataSource={data} pagination={false} size="small" scroll={{ x: 1260 }}/>
        </Panel>
        <Panel title="职能联审议题材料传达对象" extra={<span className="distribution-notice warning"><span className="distribution-notice-icon">!</span><span>指定参与职能联审初审的职能部门</span></span>}>
          <Card className="distribution-reviewer-card">
            {reviewerNotifyList.map((item, index) => (<div className="distribution-card-item" key={item.id || index}>
                <span className="distribution-org-name">{item.orgName}</span>
                <Switch checked={item.hasJoin} onChange={(checked) => switchReviewerJoin(checked, index)} style={{ marginRight: "3px" }} disabled={disabled || item.isDisabled ? true : false}/>
                <Select mode="multiple" allowClear disabled={!item.hasJoin || disabled} placeholder={item.hasJoin ? "请选择人员" : "未参与"} className="distribution-user-select" value={item.userList.map((user) => user.loginId)} options={reviewerUserOptions} onChange={(values) => setReviewerUsers(values, index)} maxTagCount="responsive"/>
              </div>))}
          </Card>
        </Panel>
      </div>
      {!disabled ? (<div className="submit-footer">
          <span className="submit-footer-hint">提交后将同时发起议题初审与议题评估任务</span>
          <Button onClick={onPrev}>上一步</Button>
          <Button type="primary" onClick={submitDistribution}>
            提交
          </Button>
        </div>) : null}
    </div>);
}
export default function SubmitDrawer({ editStatus, projectData }) {
    const navigate = useNavigate();
    const disabled = editStatus === "detail";
    const [activeKey, setActiveKey] = useState("1");
    const [allowedTabs, setAllowedTabs] = useState(["1", "2", "3", "4"]);
    const goNext = () => {
        const nextKey = String(Number(activeKey) + 1);
        if (Number(nextKey) <= 4) {
            setAllowedTabs((current) => Array.from(new Set([...current, nextKey])));
            setActiveKey(nextKey);
            message.success("保存成功，已进入下一步");
        }
    };
    const goPrev = () => {
        setActiveKey(String(Math.max(1, Number(activeKey) - 1)));
    };
    const goGztHome = () => {
        navigate("/GztHome");
    };
    const items = useMemo(() => [
        {
            key: "1",
            label: (
              <span className="submit-tab-label-with-help">
                智能提报
                <Tooltip title={smartSubmitTip} placement="topLeft" overlayClassName="submit-distribution-tooltip">
                  <QuestionCircleOutlined className="submit-tab-help-icon" onClick={(event) => event.stopPropagation()} />
                </Tooltip>
              </span>
            ),
            disabled: !allowedTabs.includes("1"),
            children: <SmartSubmit disabled={disabled} onNext={goNext}/>,
        },
        {
            key: "2",
            label: "议题管理",
            disabled: !allowedTabs.includes("2"),
            children: <TopicManage disabled={disabled} onPrev={goPrev} onNext={goNext}/>,
        },
        {
            key: "3",
            label: "会议管理",
            disabled: !allowedTabs.includes("3"),
            children: <MeetingManage disabled={disabled} onPrev={goPrev} onNext={goNext}/>,
        },
        {
            key: "4",
            label: (
              <span className="submit-tab-label-with-help">
                议题资料传达
                <Tooltip title={distributionSubmitTip} placement="topLeft" overlayClassName="submit-distribution-tooltip">
                  <QuestionCircleOutlined className="submit-tab-help-icon" onClick={(event) => event.stopPropagation()} />
                </Tooltip>
              </span>
            ),
            disabled: !allowedTabs.includes("4"),
            children: <DistributionManage disabled={disabled} onPrev={goPrev} onSubmit={goGztHome}/>,
        },
    ], [allowedTabs, activeKey, disabled]);
    return (<div className="submit-drawer">
      {/* <div className="submit-company">
        <span className="submit-company-title">参股公司</span>
        <span>|</span>
        <span>{projectData.companyCreditCode || "91120118MA06A8FAW1"}</span>
        <span>{projectData.companyName || "一汽股权投资（天津）有限公司"}</span>
      </div> */}
      <Tabs activeKey={activeKey} onChange={setActiveKey} destroyInactiveTabPane items={items}/>
    </div>);
}
