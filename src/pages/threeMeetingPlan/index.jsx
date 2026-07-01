import { Button, Drawer, Form, Input, Modal, Select, Space, Spin, Table, Tag, Tooltip, message } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  apiEndpointMap,
  closeTask,
  getAllYears,
  getPlanList,
  getTaskByBizId,
  getUserOrgInfo,
} from "./mockApi";
import PlanDetailList from "./components/PlanDetailList";
import styles from "./index.module.css";

const monthColumns = [
  ["1月", "january"],
  ["2月", "february"],
  ["3月", "march"],
  ["4月", "april"],
  ["5月", "may"],
  ["6月", "june"],
  ["7月", "july"],
  ["8月", "august"],
  ["9月", "september"],
  ["10月", "october"],
  ["11月", "november"],
  ["12月", "december"],
];

const getMonthNumber = (label) => Number(label.replace("月", ""));

export default function ThreeMeetingPlan() {
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [editStatus, setEditStatus] = useState("detail");
  const [currentYear, setCurrentYear] = useState(null);
  const [yearOptions, setYearOptions] = useState([]);
  const [topicMonth, setTopicMonth] = useState(null);
  const [bizId, setBizId] = useState(null);
  const [userOptions, setUserOptions] = useState([]);

  const loadUsers = async (fullName = "") => {
    const res = await getUserOrgInfo({ fullName });
    if (res.code === 200) {
      setUserOptions(
        res.data.map((item) => ({
          label: `${item.fullName}（${item.email}）`,
          value: item.loginId,
          title: item.fullName,
        })),
      );
    }
  };

  const loadData = async (params = {}) => {
    setLoading(true);
    try {
      const res = await getPlanList(params);
      if (res.code === 200) {
        setDataSource(res.data.map((item, index) => ({ ...item, rowIndex: index })));
        if (!res.data.length) message.warning("暂无数据");
      } else {
        message.error("获取数据失败");
      }
    } finally {
      setLoading(false);
    }
  };

  const initPage = async () => {
    const yearsRes = await getAllYears();
    if (yearsRes.code !== 200) return;

    const nextYearOptions = yearsRes.data.map((item) => ({ label: `${item}年`, value: item }));
    setYearOptions(nextYearOptions);

    const queryBizId = searchParams.get("bizId");
    let initialYear = nextYearOptions[0]?.value;
    if (queryBizId) {
      setBizId(queryBizId);
      const taskRes = await getTaskByBizId({ bizId: queryBizId });
      initialYear = taskRes.data?.year || initialYear;
    }

    setCurrentYear(initialYear);
    form.setFieldsValue({ year: initialYear });
    loadData({ year: initialYear });
  };

  useEffect(() => {
    loadUsers();
    initPage();
  }, []);

  const getTopicCellClass = (monthLabel, record) => {
    const month = getMonthNumber(monthLabel);
    const now = dayjs();
    const baseClass = styles.monthCell;
    if (Number(record.year) !== now.year()) return baseClass;
    if (month < now.month() + 1) {
      return record[`hasUnreported${month}`]
        ? `${baseClass} ${styles.monthCellRisk}`
        : `${baseClass} ${styles.monthCellDone}`;
    }
    return `${baseClass} ${styles.monthCellFuture}`;
  };

  const openMonthDrawer = (month, record) => {
    setTopicMonth(month);
    setActiveItem(record);
    setEditStatus("edit");
    setDrawerOpen(true);
  };

  const openRecordDrawer = (record) => {
    setTopicMonth(null);
    setActiveItem(record);
    setEditStatus("edit");
    setDrawerOpen(true);
  };

  const handleSearch = async () => {
    const values = await form.validateFields();
    const params = {
      ...values,
      currentDutyUserName: values.currentDutyUserName?.value || values.currentDutyUserName || "",
    };
    setCurrentYear(values.year);
    loadData(params);
  };

  const handleReset = () => {
    form.resetFields(["shortForm", "bianZhiDutyUserName", "currentDutyUserName"]);
    form.setFieldsValue({ year: currentYear });
    loadData({ year: currentYear });
  };

  const handleCloseTask = () => {
    Modal.confirm({
      title: "确认结束任务",
      content: "提交后将结束当前三会计划任务，确定吗？",
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        setLoading(true);
        try {
          const res = await closeTask({ bizId });
          if (res.code === 200) {
            message.success("任务已结束");
          } else {
            message.error("结束任务失败");
          }
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const summary = useMemo(() => {
    const totalTopics = dataSource.reduce((sum, item) => sum + Number(item.total || 0), 0);
    const avgCompletion = dataSource.length
      ? dataSource.reduce((sum, item) => sum + Number(item.completionRate || 0), 0) / dataSource.length
      : 0;
    const riskMonths = dataSource.reduce(
      (sum, item) =>
        sum + Array.from({ length: 12 }, (_, index) => (item[`hasUnreported${index + 1}`] ? 1 : 0)).reduce((a, b) => a + b, 0),
      0,
    );
    return { companyCount: dataSource.length, totalTopics, avgCompletion, riskMonths };
  }, [dataSource]);

  const columns = useMemo(
    () => [
      {
        title: "序号",
        width: 64,
        align: "center",
        fixed: "left",
        render: (_, __, index) => index + 1,
      },
      {
        title: "参股公司简称",
        dataIndex: "shortForm",
        width: 130,
        fixed: "left",
        render: (text, record) => (
          <button className={styles.companyButton} type="button" onClick={() => openRecordDrawer(record)}>
            {text}
          </button>
        ),
      },
      {
        title: "编制计划管户",
        dataIndex: "bianZhiDutyUserName",
        width: 120,
        align: "center",
      },
      {
        title: "当前管户",
        dataIndex: "currentDutyUserName",
        width: 110,
        align: "center",
      },
      {
        title: "议题个数",
        children: monthColumns.map(([month, dataIndex]) => ({
          title: month,
          dataIndex,
          width: 74,
          align: "center",
          render: (value, record) => (
            <div className={getTopicCellClass(month, record)}>
              <button type="button" className={styles.monthButton} onClick={() => openMonthDrawer(month, record)}>
                {value || 0}
              </button>
            </div>
          ),
        })),
      },
      {
        title: "年度合计",
        dataIndex: "total",
        width: 92,
        align: "center",
        render: (value) => <strong>{value || 0}</strong>,
      },
      {
        title: "完成率",
        dataIndex: "completionRate",
        width: 106,
        align: "center",
        render: (value) => <Tag color={Number(value) >= 0.8 ? "success" : "processing"}>{`${(Number(value || 0) * 100).toFixed(2)}%`}</Tag>,
      },
      {
        title: "操作",
        width: 98,
        fixed: "right",
        align: "center",
        render: (_, record) => (
          <Button type="link" onClick={() => openRecordDrawer(record)}>
            编辑
          </Button>
        ),
      },
    ],
    [],
  );

  const drawerTitle = activeItem
    ? `三会计划 - ${currentYear}年 ${activeItem.companyName || ""}${activeItem.shortForm ? `（${activeItem.shortForm}）` : ""} 当前管户：${activeItem.currentDutyUserName || "-"}`
    : "三会计划";

  return (
    <Spin spinning={loading} tip="加载中...">
      <div className={styles.page}>

        <section className={styles.filterCard}>
          <Form form={form} layout="vertical">
            <div className={styles.filterGrid}>
              <Form.Item name="year" label="年度">
                <Select options={yearOptions} onChange={handleSearch} />
              </Form.Item>
              <Form.Item name="shortForm" label="参股公司简称">
                <Input allowClear />
              </Form.Item>
              <Form.Item name="bianZhiDutyUserName" label="编制计划管户">
                <Input allowClear />
              </Form.Item>
              <Form.Item name="currentDutyUserName" label="当前管户">
                <Select
                  allowClear
                  showSearch
                  labelInValue
                  filterOption={false}
                  onSearch={loadUsers}
                  options={userOptions}
                  placeholder="请选择人员"
                />
              </Form.Item>
              <div className={styles.filterActions}>
                <Button onClick={handleReset}>重置</Button>
                <Button type="primary" onClick={handleSearch}>
                  搜索
                </Button>
              </div>
            </div>
          </Form>
        </section>

        <section className={styles.tableCard}>
          <Table
            rowKey="id"
            bordered
            pagination={false}
            columns={columns}
            dataSource={dataSource}
            scroll={{ x: 1700, y: "calc(100vh - 210px)" }}
            size="small"
          />
        </section>
      </div>

      <Drawer
        width="86%"
        title={drawerTitle}
        open={drawerOpen}
        destroyOnClose
        onClose={() => {
          setActiveItem(null);
          setTopicMonth(null);
          setDrawerOpen(false);
          loadData({ year: currentYear });
        }}
      >
        <PlanDetailList
          currentYear={currentYear}
          topicMonth={topicMonth}
          activeItem={activeItem}
          status={editStatus}
          pageSource="shjh"
        />
      </Drawer>
    </Spin>
  );
}
