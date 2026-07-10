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

const defaultMeetingHistory = [
  {
    id: "history-001",
    submittedAt: "2026-07-08 15:20:11",
    submitter: "模拟用户",
    companyNames: "一汽股权一号、启明信息",
    previewData: {
      companyName: "一汽股权一号、启明信息",
      shortForm: "一汽股权一号、启明信息",
      reqOrgName: "股权管理部",
      companyList: [
        {
          companyName: "一汽股权一号有限公司",
          shortForm: "一汽股权一号",
          reqOrgName: "股权管理部",
          selectionList: [
            { positionCategory: "director", selType: "2000" },
            { positionCategory: "supervisor", selType: "2000" },
          ],
          backgroud:
            "一汽股权一号有限公司根据治理结构调整需要，拟开展董监高人选推荐事项。",
          recommendPlan: "董事：张明\n监事：李娜",
          decisionItem:
            "同意一汽股权一号董监高推荐方案，并按程序提交党委会审议。",
        },
        {
          companyName: "启明信息技术股份有限公司",
          shortForm: "启明信息",
          reqOrgName: "股权管理部",
          selectionList: [{ positionCategory: "executive", selType: "3000" }],
          backgroud:
            "启明信息技术股份有限公司根据经营管理需要，拟开展高管续聘事项。",
          recommendPlan: "总经理：王磊",
          decisionItem: "同意启明信息高管续聘方案，并按程序提交党委会审议。",
        },
      ],
    },
    oaParams: {
      topicType: "2",
      topic: "关于一汽股权一号等公司董监高推荐方案的议题",
      applDate: "2026-07-08",
      supervisingLeader: "赵敏",
      oaMeetingAttendeeList: [
        { userId: "attendee-001", userName: "陈晨" },
        { userId: "attendee-002", userName: "刘洋" },
      ],
      jointReviewers2: "张明",
      jointReviewers: "李娜、王磊",
      thImptLarge: "涉及重要人事任免事项",
      thImptLargeType: "重要人事任免",
      presUserName: "张明",
      planMinute: "15",
      planStartDate: "2026-07-12 09:00:00",
      planEndDate: "2026-07-12 09:30:00",
      topicSummary:
        "拟对一汽股权一号、启明信息董监高人选进行推荐并提交党委会审议。",
      reportFileList: [{ fileName: "多家公司董监高推荐方案汇总.pdf" }],
      comment: "默认历史记录",
    },
  },
  {
    id: "history-002",
    submittedAt: "2026-07-06 10:08:45",
    submitter: "模拟用户",
    companyNames: "富奥股份",
    previewData: {
      companyName: "富奥股份",
      shortForm: "富奥股份",
      reqOrgName: "股权管理部",
      companyList: [
        {
          companyName: "富奥汽车零部件股份有限公司",
          shortForm: "富奥股份",
          reqOrgName: "股权管理部",
          selectionList: [{ positionCategory: "director", selType: "4000" }],
          backgroud:
            "富奥汽车零部件股份有限公司根据董事会换届安排，拟开展董事重新选聘事项。",
          recommendPlan: "董事：赵敏",
          decisionItem:
            "同意富奥股份董事重新选聘方案，并按程序提交党委会审议。",
        },
      ],
    },
    oaParams: {
      topicType: "2",
      topic: "关于富奥股份董事重新选聘方案的议题",
      applDate: "2026-07-06",
      supervisingLeader: "王磊",
      oaMeetingAttendeeList: [{ userId: "attendee-003", userName: "孙悦" }],
      jointReviewers2: "李娜",
      jointReviewers: "张明",
      thImptLarge: "涉及董事重新选聘事项",
      thImptLargeType: "重要人事任免",
      presUserName: "李娜",
      planMinute: "10",
      planStartDate: "2026-07-10 14:00:00",
      planEndDate: "2026-07-10 14:20:00",
      topicSummary: "拟对富奥股份董事重新选聘事项提交党委会审议。",
      reportFileList: [{ fileName: "富奥股份董事重新选聘方案.pdf" }],
      comment: "默认历史记录",
    },
  },
  {
    id: "history-003",
    submittedAt: "2026-07-03 17:35:02",
    submitter: "模拟用户",
    companyNames: "一汽财务",
    previewData: {
      companyName: "一汽财务",
      shortForm: "一汽财务",
      reqOrgName: "股权管理部",
      companyList: [
        {
          companyName: "一汽财务有限公司",
          shortForm: "一汽财务",
          reqOrgName: "股权管理部",
          selectionList: [{ positionCategory: "supervisor", selType: "5000" }],
          backgroud:
            "一汽财务有限公司根据监事任职调整安排，拟开展监事撤回事项。",
          recommendPlan: "监事：王磊",
          decisionItem: "同意一汽财务监事撤回方案，并按程序提交党委会审议。",
        },
      ],
    },
    oaParams: {
      topicType: "2",
      topic: "关于一汽财务监事撤回方案的议题",
      applDate: "2026-07-03",
      supervisingLeader: "张明",
      oaMeetingAttendeeList: [
        { userId: "attendee-004", userName: "周宁" },
        { userId: "attendee-005", userName: "吴迪" },
      ],
      jointReviewers2: "王磊",
      jointReviewers: "赵敏、李娜",
      thImptLarge: "涉及监事撤回事项",
      thImptLargeType: "重要人事任免",
      presUserName: "王磊",
      planMinute: "8",
      planStartDate: "2026-07-08 10:00:00",
      planEndDate: "2026-07-08 10:15:00",
      topicSummary: "拟对一汽财务监事撤回事项提交党委会审议。",
      reportFileList: [{ fileName: "一汽财务监事撤回方案.pdf" }],
      comment: "默认历史记录",
    },
  },
];

const formatDateTime = (date = new Date()) => {
  const pad = (value) => `${value}`.padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
};

const meetingTypeMap = {
  1: "投委会",
  2: "党委会",
};

const textValue = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          return item.userName || item.name || item.label || item.value || "-";
        }
        return item;
      })
      .filter(Boolean)
      .join("、");
  }
  if (typeof value === "object" && value !== null) {
    return value.userName || value.name || value.label || value.value || "-";
  }
  return value || "-";
};

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
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRecords, setHistoryRecords] = useState(defaultMeetingHistory);
  const [historyPreviewData, setHistoryPreviewData] = useState(null);

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

  const historyColumns = [
    {
      title: "提交时间",
      dataIndex: "submittedAt",
      width: 170,
    },
    {
      title: "会议类型",
      dataIndex: ["oaParams", "topicType"],
      width: 100,
      render: (value) => meetingTypeMap[value] || value || "-",
    },
    {
      title: "议题名称",
      dataIndex: ["oaParams", "topic"],
      width: 280,
      ellipsis: true,
    },
    {
      title: "参股公司",
      dataIndex: "companyNames",
      width: 220,
      ellipsis: true,
    },
    {
      title: "汇报人",
      dataIndex: ["oaParams", "presUserName"],
      width: 100,
      render: (text) => text || "-",
    },
    {
      title: "操作",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Button type="link" onClick={() => setHistoryPreviewData(record)}>
          预览材料
        </Button>
      ),
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

  const createHistoryRecord = (submitData) => {
    const oaParams = {
      ...(submitData?.oaParams || {}),
      reportFileList: submitData?.reportFileList || [],
    };
    const previewData = {
      ...batchPreviewData,
      ...(submitData || {}),
      oaParams,
    };
    const companyNames =
      previewData.companyList
        ?.map((item) => item.shortForm || item.companyName)
        .filter(Boolean)
        .join("、") ||
      previewData.shortForm ||
      previewData.companyName ||
      "-";

    return {
      id: `history-${Date.now()}`,
      submittedAt: formatDateTime(),
      submitter: "模拟用户",
      companyNames,
      previewData,
      oaParams,
      reportFileList: submitData?.reportFileList || [],
    };
  };

  const completeBatchSubmit = async (type, submitData) => {
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
      if (submitData) {
        setHistoryRecords((records) => [
          createHistoryRecord(submitData),
          ...records,
        ]);
      }
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
            <div className={css.tableHeaderActions}>
              <div className={css.tableMeta}>共 {pagination.total} 条</div>
              <Button
                icon={<FileDoneOutlined />}
                onClick={() => setHistoryOpen(true)}
              >
                上会历史记录
              </Button>
            </div>
          </div>
          <div className={css.selectionTip}>
            可选择范围：状态为“董监高任职选聘-已提交”，且“是否需要上会”为“是”的数据。
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
      <Drawer
        title="上会历史记录"
        open={historyOpen}
        width="86%"
        destroyOnClose
        onClose={() => setHistoryOpen(false)}
      >
        <Table
          rowKey={(record) => record.id}
          columns={historyColumns}
          dataSource={historyRecords}
          size="small"
          scroll={{ x: 1000 }}
          expandable={{
            expandedRowRender: (record) => (
              <div className={css.historyDetail}>
                <div>
                  会议类型：{meetingTypeMap[record.oaParams?.topicType] || "-"}
                </div>
                <div>议题名称：{record.oaParams?.topic || "-"}</div>
                <div>参股公司：{record.companyNames || "-"}</div>
                <div>提报日期：{record.oaParams?.applDate || "-"}</div>
                <div>
                  分管领导：{textValue(record.oaParams?.supervisingLeader)}
                </div>
                <div>
                  列席人：{textValue(record.oaParams?.oaMeetingAttendeeList)}
                </div>
                <div>汇报人：{record.oaParams?.presUserName || "-"}</div>
                <div>
                  投资部2总监：{textValue(record.oaParams?.jointReviewers2)}
                </div>
                <div>
                  联审人员：{textValue(record.oaParams?.jointReviewers)}
                </div>
                <div>
                  三重一大事项：{textValue(record.oaParams?.thImptLarge)}
                </div>
                <div>
                  三重一大事项类型：
                  {textValue(record.oaParams?.thImptLargeType)}
                </div>
                <div>
                  预计汇报时长（分钟）：{record.oaParams?.planMinute || "-"}
                </div>
                <div>
                  拟上会时间：
                  {record.oaParams?.planStartDate ||
                  record.oaParams?.planEndDate
                    ? `${record.oaParams?.planStartDate || "-"} 至 ${
                        record.oaParams?.planEndDate || "-"
                      }`
                    : "-"}
                </div>
                <div>议题内容概要：{record.oaParams?.topicSummary || "-"}</div>
                <div>
                  相关材料：
                  {textValue(
                    record.oaParams?.reportFileList?.map(
                      (file) => file.fileName || file.name,
                    ),
                  )}
                </div>
                <div>备注：{record.oaParams?.comment || "-"}</div>
              </div>
            ),
          }}
          pagination={{
            pageSize: 6,
            showSizeChanger: false,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Drawer>
      {historyPreviewData ? (
        <PdfModal
          open={Boolean(historyPreviewData)}
          setOpen={(open) => {
            if (!open) setHistoryPreviewData(null);
          }}
          title="上会汇报预览"
          infoData={historyPreviewData.previewData}
          labelTitle={historyPreviewData.oaParams?.topic}
        />
      ) : null}
    </Spin>
  );
};

export default NeedSubmit;
