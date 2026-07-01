import { Button, Drawer, Form, Input, Modal, Select, Space, Spin, Table, Tag, message } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import {
  getPlanItemList,
  removeById,
  reviewLevelOptions,
  savePlanItem,
  topicSanAdd,
} from "../../mockApi";
import MeetingPlanForm from "../MeetingPlanForm";
import styles from "./index.module.css";

const monthOptions = Array.from({ length: 12 }, (_, index) => ({
  label: `${index + 1}月`,
  value: String(index + 1),
}));

const deliberativeBodyOptions = [
  { label: "股东会", value: "2" },
  { label: "董事会", value: "1" },
  { label: "监事会", value: "0" },
];

const submitStatusOptions = [
  { label: "未提报", value: "0" },
  { label: "已提报", value: "1" },
];

const toCategoryOptions = (items = []) => items.map((item) => ({ value: item.id, label: item.name }));

const Dot = ({ active }) => <span className={active ? styles.dotActive : styles.dotMuted}>{active ? "◎" : "-"}</span>;

export default function PlanDetailList({
  currentYear,
  topicMonth,
  activeItem,
  status = "detail",
  pageSource = "shjh",
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectActive, setSelectActive] = useState(null);
  const [editStatus, setEditStatus] = useState("detail");
  const [level1, setLevel1] = useState([]);
  const [level2, setLevel2] = useState([]);

  const editable = status === "edit";

  const loadLevel1 = async () => {
    const res = await topicSanAdd({ level: 1 });
    if (res.code === 200) setLevel1(toCategoryOptions(res.data));
  };

  const loadLevel2 = async (parentId, reset = true) => {
    const res = await topicSanAdd({ level: 2, parentId });
    if (res.code === 200) {
      setLevel2(toCategoryOptions(res.data));
      if (reset) form.setFieldsValue({ categoryLv2Id: undefined });
    }
  };

  const loadData = async (params = {}) => {
    if (!activeItem?.id) return;
    setLoading(true);
    try {
      const res = await getPlanItemList({
        ...params,
        pageSource,
        planId: activeItem.id,
      });
      if (res.code === 200) {
        setDataSource(res.data.map((item, index) => ({ ...item, index })));
      } else {
        message.error(res.msg || "获取数据失败");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLevel1();
  }, []);

  useEffect(() => {
    const month = topicMonth ? topicMonth.replace("月", "") : undefined;
    form.setFieldsValue({ month });
    loadData({ month });
  }, [activeItem?.id, topicMonth]);

  const handleSearch = async () => {
    const values = await form.validateFields();
    loadData({
      ...values,
      shFlag: values.deliberativeBody === "2" ? "1" : "",
      bodFlag: values.deliberativeBody === "1" ? "1" : "",
      bosFlag: values.deliberativeBody === "0" ? "1" : "",
    });
  };

  const handleReset = () => {
    form.resetFields();
    const month = topicMonth ? topicMonth.replace("月", "") : undefined;
    form.setFieldsValue({ month });
    setLevel2([]);
    loadData({ month });
  };

  const openAddDrawer = () => {
    setSelectActive(null);
    setEditStatus("add");
    setDrawerOpen(true);
  };

  const openEditDrawer = (record) => {
    setSelectActive(record);
    setEditStatus("edit");
    setDrawerOpen(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "确认删除",
      content: "删除后将无法恢复，确定删除这条会议计划吗？",
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        const res = await removeById({ id: record.id });
        if (res.code === 200) {
          message.success("删除成功");
          handleSearch();
        }
      },
    });
  };

  const handleSave = async (values) => {
    const res = await savePlanItem(values);
    if (res.code === 200) {
      message.success("保存成功");
      setDrawerOpen(false);
      setSelectActive(null);
      handleSearch();
    } else {
      message.error("保存失败");
    }
  };

  const columns = useMemo(() => {
    const baseColumns = [
      {
        title: "序号",
        width: 58,
        align: "center",
        render: (_, __, index) => index + 1,
      },
      {
        title: "会议召开时间",
        dataIndex: "planLaunchDate",
        width: 116,
        align: "center",
        render: (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "-"),
      },
      {
        title: "章程约定通知时间",
        dataIndex: "agreedNotifyDate",
        width: 136,
        align: "center",
        render: (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "-"),
      },
      {
        title: "实际通知时间",
        dataIndex: "actualNotifyDate",
        width: 126,
        align: "center",
        render: (value, record) => {
          if (!value) return <span className={styles.mutedText}>-</span>;
          const isLate = record.agreedNotifyDate && dayjs(value).isAfter(dayjs(record.agreedNotifyDate), "day");
          return (
            <span className={isLate ? styles.dateLate : styles.dateNormal}>
              {dayjs(value).format("YYYY-MM-DD")}
            </span>
          );
        },
      },
      {
        title: "议题分类（大）",
        dataIndex: "categoryLv1Name",
        width: 132,
        ellipsis: true,
      },
      {
        title: "议题分类（中）",
        dataIndex: "categoryLv2Name",
        width: 170,
        ellipsis: true,
      },
      {
        title: "议题分类（小）",
        dataIndex: "categoryLv3Name",
        width: 220,
        ellipsis: true,
      },
      {
        title: "议题",
        dataIndex: "topicName",
        width: 280,
        ellipsis: true,
        render: (text) => <span className={styles.topicName}>{text}</span>,
      },
      {
        title: "编制计划管户",
        dataIndex: "bianZhiDutyUserName",
        width: 120,
        align: "center",
      },
      {
        title: "实际提报管户",
        dataIndex: "topicSubmitUserName",
        width: 120,
        align: "center",
        render: (value) => value || "-",
      },
      {
        title: "审议机构",
        children: [
          { title: "董事会", dataIndex: "bodFlag", width: 76, align: "center", render: (value) => <Dot active={value === "1"} /> },
          { title: "监事会", dataIndex: "bosFlag", width: 76, align: "center", render: (value) => <Dot active={value === "1"} /> },
          { title: "股东会", dataIndex: "shFlag", width: 76, align: "center", render: (value) => <Dot active={value === "1"} /> },
        ],
      },
      {
        title: "决策层次",
        children: [
          { title: "总办会", dataIndex: "reviewLevel", width: 78, align: "center", render: (value) => <Dot active={value === "3000"} /> },
          { title: "分管领导", dataIndex: "reviewLevel", width: 90, align: "center", render: (value) => <Dot active={value === "2000"} /> },
          { title: "业务总监", dataIndex: "reviewLevel", width: 90, align: "center", render: (value) => <Dot active={value === "1000"} /> },
        ],
      },
      {
        title: "状态",
        dataIndex: "submitStatus",
        width: 92,
        align: "center",
        render: (value) => <Tag color={value === "1" ? "success" : "warning"}>{value === "1" ? "已提报" : "未提报"}</Tag>,
      },
    ];

    if (!editable) return baseColumns;

    return [
      ...baseColumns,
      {
        title: "操作",
        width: 116,
        align: "center",
        render: (_, record) => (
          <Space size={2}>
            <Button type="link" onClick={() => openEditDrawer(record)}>
              编辑
            </Button>
            <Button type="link" danger onClick={() => handleDelete(record)}>
              删除
            </Button>
          </Space>
        ),
      },
    ];
  }, [editable]);

  const drawerTitle = `会议计划 - ${currentYear}年 ${activeItem?.companyName || ""}${
    activeItem?.shortForm ? `（${activeItem.shortForm}）` : ""
  }`;

  return (
    <>
      <Spin spinning={loading} tip="加载中...">
        <div className={styles.detailShell}>
          <div className={styles.filterPanel}>
            <Form form={form} layout="vertical">
              <div className={styles.filterGrid}>
                <Form.Item className={styles.filterItem} name="month" label="会议召开月">
                  <Select allowClear options={monthOptions} />
                </Form.Item>
                <Form.Item className={styles.filterItem} name="categoryLv1Id" label="议题分类（大）">
                  <Select allowClear options={level1} onChange={loadLevel2} />
                </Form.Item>
                <Form.Item className={styles.filterItem} name="categoryLv2Id" label="议题分类（中）">
                  <Select allowClear options={level2} />
                </Form.Item>
                <Form.Item className={styles.filterItem} name="topicName" label="议题">
                  <Input allowClear />
                </Form.Item>
                <Form.Item className={styles.filterItem} name="bianZhiDutyUserName" label="编制计划管户">
                  <Input allowClear />
                </Form.Item>
                <Form.Item className={styles.filterItem} name="topicSubmitUserName" label="实际提报管户">
                  <Input allowClear />
                </Form.Item>
                <Form.Item className={styles.filterItem} name="deliberativeBody" label="审议机构">
                  <Select allowClear options={deliberativeBodyOptions} />
                </Form.Item>
                <Form.Item className={styles.filterItem} name="reviewLevel" label="决策层级">
                  <Select allowClear options={reviewLevelOptions} />
                </Form.Item>
                <Form.Item className={styles.filterItem} name="submitStatus" label="状态">
                  <Select allowClear options={submitStatusOptions} />
                </Form.Item>
                <div className={`${styles.filterItem} ${styles.actions}`}>
                  <Button onClick={handleReset}>重置</Button>
                  <Button type="primary" onClick={handleSearch}>
                    搜索
                  </Button>
                </div>
              </div>
            </Form>
          </div>

          {editable ? (
            <div className={styles.toolbar}>
              <Button type="primary" onClick={openAddDrawer}>
                新增
              </Button>
            </div>
          ) : null}

          <div className={styles.tableScroll}>
            <Table
              rowKey="id"
              className={styles.table}
              bordered
              size="small"
              tableLayout="fixed"
              pagination={false}
              columns={columns}
              dataSource={dataSource}
              scroll={{ x: 1570, y: "calc(100vh - 390px)" }}
            />
          </div>
        </div>
      </Spin>

      <Drawer
        width={720}
        title={drawerTitle}
        open={drawerOpen}
        destroyOnClose
        onClose={() => {
          setDrawerOpen(false);
          setSelectActive(null);
        }}
      >
        <MeetingPlanForm
          activeItem={activeItem}
          selectActive={selectActive}
          editStatus={editStatus}
          topicMonth={topicMonth}
          currentYear={currentYear}
          onSavePlanItem={handleSave}
        />
      </Drawer>
    </>
  );
}
