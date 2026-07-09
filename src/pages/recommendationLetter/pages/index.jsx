import css from "./index.module.css";
import {
  Button,
  Checkbox,
  Form,
  Input,
  Table,
  Drawer,
  Tooltip,
  Spin,
  Select,
  message,
} from "antd";
import React from "react";
import {
  CloseOutlined,
  FileDoneOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import ProjectDrawer from "./projectDrawer/index";
import { getDictInfo, getQueryStringGcc, sanhuiStatus } from "../support";
import { getCompanySupervisorPage, getInfo, saveCompany } from "../api/index";
import PdfModal from "./PDFReview/PdfModal";
import OaView from "./projectDrawer/oaView";
const {
  position_code,
  position_category,
  supervisor_selection_status,
  supervisor_selection_type,
} = getDictInfo()["GQ-0207"];
const { Option } = Select;

const submitStatusMap = {
  0: "已提交",
  1: "未提交",
};

const meetingFlagMap = {
  0: "否",
  1: "是",
};

const getOptionText = (options = [], value) =>
  options.find((item) => item.value == value)?.text || value || "-";

const canSelectRow = (record) =>
  !record.reqId &&
  record.selStatus === "2000" &&
  record.submitStatus === "0" &&
  record.meetingFlag === "1";

const NeedSubmit = () => {
  const [form] = Form.useForm();
  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  }); // page数据
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rowId, setRowId] = useState("");
  const [taskId, setTaskId] = useState(null);
  const [isEdit, setIsEdit] = useState(true); //是否编辑
  const [drawerData, setDrawerData] = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [batchPreviewOpen, setBatchPreviewOpen] = useState(false);
  const [batchPreviewData, setBatchPreviewData] = useState(null);
  const [batchSubmitOpen, setBatchSubmitOpen] = useState(false);

  const calculateRowSpan = (data, field, index) => {
    // 如果当前行是第一个出现的值，计算合并的行数
    if (index === 0 || data[index]?.[field] !== data[index - 1]?.[field]) {
      let count = 1;
      for (let i = index + 1; i < data.length; i++) {
        if (data[i]?.[field] === data[index]?.[field]) {
          count++;
        } else {
          break;
        }
      }
      return count;
    }
    // 否则返回 0，不显示单元格
    return 0;
  };

  const toggleSelectedRow = (record) => {
    if (!canSelectRow(record)) return;
    const checked = selectedRowKeys.includes(record.id);
    if (checked) {
      setSelectedRowKeys((current) =>
        current.filter((key) => key !== record.id),
      );
      setSelectedRows((current) =>
        current.filter((row) => row.id !== record.id),
      );
      return;
    }
    setSelectedRowKeys((current) => [...current, record.id]);
    setSelectedRows((current) => [...current, record]);
  };

  const columns = [
    {
      title: "选择",
      width: 64,
      align: "center",
      render: (_, record, index) => {
        const rowSpan = calculateRowSpan(tableData, "shortForm", index);
        return {
          children: (
            <Checkbox
              checked={selectedRowKeys.includes(record.id)}
              disabled={!canSelectRow(record)}
              onChange={() => toggleSelectedRow(record)}
            />
          ),
          props: { rowSpan },
        };
      },
    },
    {
      title: "公司简称",
      width: 140,
      dataIndex: "shortForm",
      render: (text, record, index) => {
        const rowSpan = calculateRowSpan(tableData, "shortForm", index);
        return {
          children: (
            <Tooltip title={record.shortForm}>
              <span className={css.ellipsisContainer}>{record.shortForm}</span>
            </Tooltip>
          ),
          props: { rowSpan },
        };
      },
    },
    {
      title: "职务分类",
      dataIndex: "positionCategory",
      width: 100,
      render: (text, row) => {
        return (
          <span>
            {
              position_category.find(
                (item) => item.value == row.positionCategory,
              )?.text
            }
          </span>
        );
      },
    },
    {
      title: "职务",
      dataIndex: "positionCode",
      width: 140,
      render: (text, row) => {
        return (
          <span>
            {position_code.find((item) => item.value == row.positionCode)?.text}
          </span>
        );
      },
    },
    {
      title: "任职人",
      dataIndex: "userName",
      width: 120,
    },
    {
      title: "选聘类型",
      dataIndex: "selType",
      width: 120,
      render: (text, record, index) => {
        return sanhuiStatus(record.selType, supervisor_selection_type);
      },
    },
    {
      title: "状态",
      dataIndex: "selStatus",
      width: 220,
      render: (text, record, index) => {
        const selStatusText = getOptionText(
          supervisor_selection_status,
          record.selStatus,
        );
        const submitStatusText = submitStatusMap[record.submitStatus] || "-";
        return (
          <span className={css.statusText}>
            {selStatusText}-{submitStatusText}
          </span>
        );
      },
    },
    {
      title: "是否需要上会",
      dataIndex: "meetingFlag",
      width: 120,
      render: (value) => meetingFlagMap[value] || "-",
    },
    {
      title: "操作",
      key: "action",
      width: 100,
      render: (_, record) => {
        const isE = Boolean(taskId) || record.selStatus == "1000";
        return (
          <Button
            type="link"
            onClick={async () => {
              setIsEdit(isE);
              setRowId(record.id);
              setDrawerOpen(true);
            }}
          >
            {isE ? "处理" : "查看"}
          </Button>
        );
      },
    },
  ];
  useEffect(() => {
    setTaskId(getQueryStringGcc("bizId"));
    getList({ currentPage: 1 });
  }, []);

  const getList = (params = {}) => {
    setLoading(() => true);
    const values = form.getFieldsValue();
    getCompanySupervisorPage({
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...values,
      ...params,
    })
      .then((res) => {
        if (res.code == 200) {
          setTableData(() => res.data.list);
          setPagination({
            current: res.data?.pageNum || 1,
            pageSize: res.data?.pageSize || 10,
            total: res.data?.total || 0,
          });
        }
      })
      .finally(() => {
        setLoading(() => false);
      });
  };
  const clearSearchFunc = () => {
    form.resetFields();
    setSelectedRowKeys([]);
    setSelectedRows([]);
    getList({ currentPage: 1 });
  };

  const onClose = (type) => {
    if (type == "save") {
      getList({ currentPage: 1 });
    }
    setDrawerOpen(false);
  };

  const buildBatchPreviewData = (details = []) => {
    const companyNames = details
      .map((item) => item.shortForm || item.companyName)
      .filter(Boolean);
    const companyList = details.map((item) => {
      const recommendPlan =
        item.recommendPlan ||
        (item.selectionList || [])
          .map((staff) => {
            const positionText = getOptionText(
              position_code,
              staff.positionCode,
            );
            const name =
              staff.suggestSupervisor?.fullName ||
              staff.currentSupervisor?.userName ||
              "-";
            return `${positionText}：${name}`;
          })
          .join("\n");

      return {
        ...item,
        backgroud:
          item.backgroud ||
          `${item.companyName}根据公司治理需要，拟开展董监高人选推荐事项。`,
        recommendPlan,
        decisionItem:
          item.decisionItem ||
          `同意${item.shortForm || item.companyName}董监高推荐方案，并按程序提交党委会审议。`,
      };
    });

    return {
      companyName: companyNames.join("、"),
      shortForm: companyNames.join("、"),
      reqOrgName: "股权管理部",
      companyList,
    };
  };

  const getSelectedDetails = async () => {
    const rows = selectedRows.filter(canSelectRow);
    const results = await Promise.all(rows.map((row) => getInfo(row.id)));
    return results
      .filter((res) => res.code === 200 && res.data)
      .map((res) => res.data);
  };

  const handleBatchPreview = async () => {
    if (!selectedRows.length) {
      message.warning("请先选择董监高任职选聘-已提交且需要上会的数据");
      return;
    }
    setLoading(true);
    try {
      const details = await getSelectedDetails();
      if (!details.length) {
        message.warning("请先选择董监高任职选聘-已提交且需要上会的数据");
        return;
      }
      setBatchPreviewData(buildBatchPreviewData(details));
      setBatchPreviewOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSubmit = async () => {
    if (!selectedRows.length) {
      message.warning("请先选择董监高任职选聘-已提交且需要上会的数据");
      return;
    }
    const details = await getSelectedDetails();
    if (!details.length) {
      message.warning("请先选择董监高任职选聘-已提交且需要上会的数据");
      return;
    }
    setBatchPreviewData(buildBatchPreviewData(details));
    setBatchSubmitOpen(true);
  };

  const completeBatchSubmit = async () => {
    setLoading(true);
    try {
      const details = await getSelectedDetails();
      await Promise.all(
        details.map((detail) =>
          saveCompany({
            ...detail,
            selStatus: "3000",
            submitStatus: "0",
          }),
        ),
      );
      message.success("已提交党委会");
      setSelectedRowKeys([]);
      setSelectedRows([]);
      setBatchSubmitOpen(false);
      getList({ currentPage: pagination.current });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      setRowId(taskId);
      setDrawerOpen(true);
      setIsEdit(true);
    }
  }, [taskId]);

  return (
    <Spin spinning={loading} tip={"加载中..."}>
      <div className={css.page}>
        <div className={css.pageHeader}>
          <div className={css.titleWrap}>
            <span className={css.titleIcon}>
              <FileDoneOutlined />
            </span>
            <div>
              <h1>下发推荐函</h1>
              <p>董监高选聘推荐函编制、预览与签批</p>
            </div>
          </div>
        </div>

        <section className={css.filterSection}>
          <Form
            form={form}
            name="wrap"
            labelAlign="left"
            layout={"vertical"}
            labelWrap
            wrapperCol={{ flex: 1 }}
            colon={false}
            className={css.filterForm}
          >
            <div className={css.filterGrid}>
              <Form.Item name="shortForm" label="参股公司简称">
                <Input placeholder="请输入公司简称" allowClear />
              </Form.Item>
              <Form.Item name="positionCategory" label="职务分类">
                <Select placeholder="请选择" allowClear>
                  {position_category?.map((item, idx) => (
                    <Option key={idx} value={item.value}>
                      {item.text}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="positionCode" label="职务">
                <Select placeholder="请选择" allowClear>
                  {position_code?.map((item, idx) => {
                    return (
                      <Option key={idx} value={item.value}>
                        {item.text}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <div className={css.filterActions}>
                <Button icon={<ReloadOutlined />} onClick={clearSearchFunc}>
                  重置
                </Button>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={() => getList({ currentPage: 1 })}
                >
                  搜索
                </Button>
              </div>
            </div>
          </Form>
        </section>

        <section className={css.tableSection}>
          <div className={css.tableHeader}>
            <div className={css.tableTitle}>推荐函列表</div>
            <div className={css.tableMeta}>共 {pagination.total} 条</div>
          </div>
          <Table
            className={css.table}
            columns={columns}
            size="small"
            dataSource={tableData}
            onChange={(page) =>
              getList({ currentPage: page.current, pageSize: page.pageSize })
            }
            rowKey={(record) => record.id}
            scroll={{ x: "max-content" }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showTotal: (total) => (
                <div className={css.paginationTotal}>共 {total} 条数据</div>
              ),
              showSizeChanger: false,
            }}
          />
          <div className={css.batchActions}>
            <Button
              disabled={!selectedRowKeys.length}
              onClick={handleBatchPreview}
            >
              向党委会汇报预览
            </Button>
            <Button
              type="primary"
              disabled={!selectedRowKeys.length}
              onClick={handleBatchSubmit}
            >
              提交党委会
            </Button>
          </div>
        </section>
      </div>
      {drawerOpen && (
        <Drawer
          width="80%"
          title={`董监高选聘——${drawerData.companyName || ""}`}
          open={drawerOpen}
          destroyOnClose={true}
          onClose={() => onClose(false)}
          closable={false}
          extra={
            <Button
              type="text"
              onClick={() => onClose(false)}
              icon={<CloseOutlined />}
            />
          }
        >
          <ProjectDrawer
            onClose={onClose}
            id={rowId}
            isEdit={isEdit}
            setDrawerData={setDrawerData}
          />
        </Drawer>
      )}
      {batchPreviewOpen && batchPreviewData ? (
        <PdfModal
          open={batchPreviewOpen}
          setOpen={setBatchPreviewOpen}
          title="上会汇报预览"
          infoData={batchPreviewData}
          labelTitle="多家公司董监高推荐方案汇总"
        />
      ) : null}
      {batchSubmitOpen && batchPreviewData ? (
        <OaView
          reviewModal={batchSubmitOpen}
          setReviewModal={setBatchSubmitOpen}
          onClosed={completeBatchSubmit}
          parentInfoData={batchPreviewData}
          title="多家公司董监高推荐方案汇总"
        />
      ) : null}
    </Spin>
  );
};

export default NeedSubmit;
