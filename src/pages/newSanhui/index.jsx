import "antd/dist/reset.css";
import { Button, ConfigProvider, Drawer, Form, Input, Modal, Select, Space, Spin, Table, Tag, message } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getStatusText, sanhuiProgStatus, threeListDetail, threeListGetList, updateById } from "./mockApi";
import DueDrawer from "./components/DueDrawer";
import "./index.css";

const statusColorMap = {
  12000: "default",
  13000: "processing",
  14000: "purple",
  15000: "gold",
  16000: "cyan",
  18000: "geekblue",
  19000: "processing",
  20000: "success",
  99999: "error",
};

const initialPagination = {
  current: 1,
  pageSize: 10,
  total: 0,
};

const taskStatusMap = {
  topicSubmit: ["13000", "12000"],
  topicEvaluation: ["14000"],
  topicApproval: ["15000"],
  voteSuggest: ["16000"],
  meetingVote: ["18000"],
  decisionExecution: ["19000", "20000"],
};

export default function NewSanhuiPage() {
  const [form] = Form.useForm();
  const [overdueForm] = Form.useForm();
  const [searchParams] = useSearchParams();
  const autoOpenHandledRef = useRef(false);
  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState(null);
  const [overdueRecord, setOverdueRecord] = useState(null);
  const [overdueSaving, setOverdueSaving] = useState(false);

  const getTableData = async (
    current = Number(pagination.current || 1),
    pageSize = Number(pagination.pageSize || 10)
  ) => {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      const res = await threeListGetList({
        ...values,
        currentPage: current,
        pageSize,
      });
      setTableData(res.data.list);
      setPagination({ current, pageSize, total: res.data.total });
      return res.data.list;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      const list = await getTableData(1, 10);
      const taskType = searchParams.get("task");
      const taskStatuses = taskStatusMap[taskType] || [];
      const shouldAutoOpen =
        taskStatuses.length > 0 &&
        searchParams.get("autoOpen") === "1" &&
        !autoOpenHandledRef.current;

      if (!shouldAutoOpen) return;
      autoOpenHandledRef.current = true;

      const recordId = searchParams.get("recordId");
      const taskRecord =
        list.find((item) => recordId && String(item.id) === String(recordId)) ||
        list.find((item) => taskStatuses.includes(String(item.progStatus))) ||
        list[0];

      if (taskRecord) {
        openDetail(taskRecord);
      }
    };

    initPage();
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("gq:sanhui-detail-context", {
      detail: {
        open: detailOpen,
        record: detailOpen ? activeRecord : null,
      },
    }));

    return () => {
      window.dispatchEvent(new CustomEvent("gq:sanhui-detail-context", {
        detail: {
          open: false,
          record: null,
        },
      }));
    };
  }, [activeRecord, detailOpen]);

  const openDetail = async (record) => {
    const res = await threeListDetail(record.id);
    setActiveRecord(res.data);
    setDetailOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        title: "序号",
        dataIndex: "index",
        key: "index",
        width: 64,
        fixed: "left",
        render: (_text, _record, index) =>
          Number(pagination.pageSize || 10) * (Number(pagination.current || 1) - 1) + index + 1,
      },
      {
        title: "参股公司统一社会信用代码",
        dataIndex: "companyCreditCode",
        key: "companyCreditCode",
        width: 230,
      },
      {
        title: "参股公司简称",
        dataIndex: "companyName",
        key: "companyName",
        width: 220,
      },
      {
        title: "会议及议题编码",
        dataIndex: "mgmtNo",
        key: "mgmtNo",
        width: 180,
      },
      {
        title: "创建人",
        dataIndex: "createUserName",
        key: "createUserName",
        width: 100,
      },
      {
        title: "创建时间",
        dataIndex: "created",
        key: "created",
        width: 180,
        render: (value) => (value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : ""),
      },
      {
        title: "更新人",
        dataIndex: "updateUserName",
        key: "updateUserName",
        width: 100,
      },
      {
        title: "更新时间",
        dataIndex: "updated",
        key: "updated",
        width: 180,
        render: (value) => (value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : ""),
      },
      {
        title: "提报人",
        dataIndex: "submitUserName",
        key: "submitUserName",
        width: 110,
      },
      {
        title: "提报时间",
        dataIndex: "submitTime",
        key: "submitTime",
        width: 180,
        render: (value) => (value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : ""),
      },
      {
        title: "状态",
        dataIndex: "progStatus",
        key: "progStatus",
        fixed: "right",
        width: 130,
        render: (value) => <Tag color={statusColorMap[String(value)]}>{getStatusText(value)}</Tag>,
      },
      {
        title: "操作",
        key: "action",
        fixed: "right",
        width: 210,
        render: (_text, record) => (
          <Space size="small">
            <Button type="link" onClick={() => openDetail(record)}>
              查看
            </Button>
            {String(record.progStatus) === "99999" ? (
              <Button
                type="link"
                onClick={() => {
                  setOverdueRecord(record);
                  overdueForm.setFieldsValue({ overdueRemark: record.overdueRemark });
                }}
              >
                逾期说明
              </Button>
            ) : null}
          </Space>
        ),
      },
    ],
    [pagination.current, pagination.pageSize]
  );

  const handleOverdueOk = async () => {
    const values = await overdueForm.validateFields();
    if (!overdueRecord) return;
    setOverdueSaving(true);
    await updateById({ id: overdueRecord.id, overdueRemark: values.overdueRemark || "" });
    message.success("保存成功");
    setOverdueSaving(false);
    setOverdueRecord(null);
    getTableData();
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1d4ed8",
          borderRadius: 6,
          fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
        },
        components: {
          Table: {
            headerBg: "#f3f6fb",
            headerColor: "#273449",
            rowHoverBg: "#f8fbff",
          },
        },
      }}
    >
      <div className="new-sanhui-page">
        <Spin spinning={loading} tip="加载中...">
          <section className="new-sanhui-search">
            <Form form={form} layout="vertical" colon={false}>
              <div className="new-sanhui-search-grid">
                <Form.Item name="companyCreditCode" label="参股公司统一社会信用代码">
                  <Input allowClear placeholder="请输入统一社会信用代码" />
                </Form.Item>
                <Form.Item name="companyName" label="参股公司简称">
                  <Input allowClear placeholder="请输入公司简称" />
                </Form.Item>
                <Form.Item name="progStatus" label="状态">
                  <Select
                    allowClear
                    placeholder="请选择"
                    options={sanhuiProgStatus.map((item) => ({
                      label: item.text,
                      value: item.value,
                    }))}
                  />
                </Form.Item>
                <Form.Item name="submitUserName" label="提报人">
                  <Input allowClear placeholder="请输入提报人" />
                </Form.Item>
                <div className="new-sanhui-search-actions">
                  <Button
                    onClick={() => {
                      form.resetFields();
                      getTableData(1, Number(pagination.pageSize || 10));
                    }}
                  >
                    重置
                  </Button>
                  <Button type="primary" onClick={() => getTableData(1, Number(pagination.pageSize || 10))}>
                    查询
                  </Button>
                </div>
              </div>
            </Form>
          </section>

          <section className="new-sanhui-table-card">
            <div className="new-sanhui-table-head">
              <div>
                <div className="new-sanhui-table-title">事项列表</div>
                <div className="new-sanhui-table-subtitle">按更新时间倒序展示当前三会事项</div>
              </div>
              <div className="new-sanhui-table-total">共 {pagination.total || 0} 条</div>
            </div>
            <Table
              columns={columns}
              size="middle"
              dataSource={tableData}
              rowKey="id"
              scroll={{ x: 1900, y: 520 }}
              pagination={pagination}
              onChange={(page) => getTableData(Number(page.current || 1), Number(page.pageSize || 10))}
            />
          </section>
        </Spin>

        <Drawer
          width="min(1500px, 96vw)"
          className="new-sanhui-detail-drawer"
          title={
            activeRecord ? (
              <div className="new-sanhui-drawer-title">
                <span>{getStatusText(activeRecord.progStatus)}</span>
                <small>{activeRecord.mgmtNo}</small>
                <small>{activeRecord.companyName}</small>
              </div>
            ) : null
          }
          open={detailOpen}
          destroyOnClose
          onClose={() => setDetailOpen(false)}
        >
          {activeRecord ? (
            <DueDrawer
              id={activeRecord.id}
              record={activeRecord}
              editStatus="edit"
              progStatus={activeRecord.progStatus}
              dutyUserName={activeRecord.submitUserName}
              reviewInitialTab={searchParams.get("task") === "topicApproval" ? "1" : undefined}
              onCloseDetail={(type) => {
                if (type === "submit" || type === "save") {
                  getTableData();
                }
                setDetailOpen(false);
              }}
            />
          ) : null}
        </Drawer>

        <Modal
          title="逾期说明"
          open={!!overdueRecord}
          width={860}
          confirmLoading={overdueSaving}
          destroyOnClose
          onOk={handleOverdueOk}
          onCancel={() => setOverdueRecord(null)}
        >
          <Form form={overdueForm} layout="vertical">
            <Form.Item name="overdueRemark" label="逾期原因">
              <Input.TextArea rows={6} placeholder="请输入逾期原因" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
}
