import {
  AppstoreOutlined,
  CalendarOutlined,
  FileTextOutlined,
  FlagOutlined,
  LineChartOutlined,
  SendOutlined,
  TeamOutlined,
  UserOutlined
} from "@ant-design/icons";
import { Button, DatePicker, Descriptions, Drawer, Empty, Form, Input, Select, Space, Spin, Table, Tabs, Tag, Tooltip, message } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import {
  getMonthId,
  getMonthlyWorkList,
  getPostReportCompanyDetail,
  getPostReportTable,
} from "../api/postReportApi";
import monthlyWorkCategory from "../mock/monthlyWorkCategory.json";
import "./postReport.css";

const statusList = monthlyWorkCategory.filter((item) => item.stoped !== "1");
const categoryOptions = statusList.map((item) => ({ label: item.text, value: item.value }));
const categoryNameMap = Object.fromEntries(statusList.map((item) => [item.value, item.text]));

function normalizeTableRows(response) {
  const list = response?.data?.list || [];
  return list.map((item, index) => ({
    ...item,
    reportIndex: index + 1,
    key: item.id || `${item.companyName}-${index}`
  }));
}

function updateGroupedItem(groups, rowId, patch) {
  return groups.map((group) => ({
    ...group,
    list: group.list.map((item) => item.id === rowId ? { ...item, ...patch } : item)
  }));
}

function getCategoryOption(value) {
  const safeValue = value == null ? "" : String(value);
  return categoryOptions.find((item) => item.value === safeValue) || {
    label: safeValue ? `分类${safeValue}` : "未分类",
    value: safeValue
  };
}

function normalizeMonthlyWorkGroups(list = []) {
  return (Array.isArray(list) ? list : []).map((group) => {
    const category = group.category == null ? "" : String(group.category);
    const categoryOption = getCategoryOption(category);
    return {
      ...group,
      category,
      categoryName: group.categoryName || categoryOption.label,
      list: (Array.isArray(group.list) ? group.list : []).map((item) => ({
        ...item,
        category: item.category == null ? category : String(item.category),
        relatedDetail: item.relatedDetail || "",
        comment: item.comment || "",
        labelList: Array.isArray(item.labelList) ? item.labelList : [],
        fileList: Array.isArray(item.fileList) ? item.fileList : []
      }))
    };
  });
}

function MonthlyManagementWork({ infoData }) {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);

  const fetchList = async (dateRange = []) => {
    setLoading(true);
    const res = await getMonthlyWorkList({
      monthlyReportId: infoData.gzxsReportId || infoData.id,
      startDate: dateRange?.[0]?.format?.("YYYY-MM-DD") || "",
      endDate: dateRange?.[1]?.format?.("YYYY-MM-DD") || ""
    });
    if (res.code === 200) {
      setGroups(normalizeMonthlyWorkGroups(res.data));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (infoData.gzxsReportId || infoData.id) {
      fetchList([]);
    }
  }, [infoData.gzxsReportId, infoData.id]);

  const columns = [
    { title: "序号", width: 70, align: "center", render: (_value, _record, index) => index + 1 },
    {
      title: "类别",
      dataIndex: "category",
      width: 130,
      render: (value, record) => (
        <Select
          className="post-report-cell-control"
          disabled
          value={value}
          options={categoryOptions.some((item) => item.value === value) ? categoryOptions : [...categoryOptions, getCategoryOption(value)]}
          onChange={(nextValue) => setGroups((current) => updateGroupedItem(current, record.id, { category: nextValue }))}
        />
      )
    },
    {
      title: "日期",
      dataIndex: "workDate",
      width: 150,
      render: (value, record) => (
        <DatePicker
          className="post-report-cell-control"
          disabled
          value={value ? dayjs(value) : null}
          format="YYYY-MM-DD"
          onChange={(date) => setGroups((current) => updateGroupedItem(current, record.id, { workDate: date?.format("YYYY-MM-DD") || "" }))}
        />
      )
    },
    {
      title: "事项",
      dataIndex: "workDetail",
      width: 340,
      render: (value, record) => (
        <Input.TextArea
          className="post-report-cell-control"
          disabled
          value={value || ""}
          autoSize={{ minRows: 2, maxRows: 5 }}
          placeholder="请输入事项"
          onChange={(event) => setGroups((current) => updateGroupedItem(current, record.id, { workDetail: event.target.value }))}
        />
      )
    },
    {
      title: "其他相关方",
      dataIndex: "relatedDetail",
      width: 190,
      render: (value, record) => (
        <Input.TextArea
          className="post-report-cell-control"
          disabled
          value={value || ""}
          autoSize={{ minRows: 2, maxRows: 4 }}
          placeholder="请输入相关方"
          onChange={(event) => setGroups((current) => updateGroupedItem(current, record.id, { relatedDetail: event.target.value }))}
        />
      )
    },
    {
      title: "标签",
      dataIndex: "labelList",
      width: 180,
      render: (_value, record) => (
        <div className="tag-wrap-list">
          <div className="tag-item">
            {record.labelList?.map((item) => (
              <Tag closable key={item.label} color="blue">
                {item.label}
              </Tag>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "备证文件",
      dataIndex: "fileList",
      width: 220,
      render: (value = []) => value.length ? (
        <div className="post-report-file-list">
          {value.map((file) => (
            <Space key={file.objectKey || file.fileName} size={4}>
              <FileTextOutlined />
              <span className="post-report-file-link">{file.fileName}</span>
            </Space>
          ))}
        </div>
      ) : <span className="post-report-muted">暂无文件</span>
    },
    {
      title: "备注",
      dataIndex: "comment",
      width: 190,
      render: (value, record) => (
        <Input.TextArea
          className="post-report-cell-control"
          disabled
          value={value || ""}
          autoSize={{ minRows: 2, maxRows: 4 }}
          placeholder="请输入备注"
          onChange={(event) => setGroups((current) => updateGroupedItem(current, record.id, { comment: event.target.value }))}
        />
      )
    }
  ];
  const handleDispatchTask = (title) => {
    message.success(`${title || "管理工作写实"}已生成下发任务截图（本地模拟）`);
  };

  return (
    <div className="post-report-monthly">
      {groups.length ? groups.map((group) => (
        <section className="post-report-work-group" key={group.category}>
          <div className="post-report-work-title">{group.categoryName || categoryNameMap[group.category] || "管理工作写实"}</div>
          <div className="post-report-content-header">
            <Button type="primary" icon={<SendOutlined />} onClick={() => handleDispatchTask(group.categoryName || categoryNameMap[group.category])}>
              一键下发任务
            </Button>
          </div>
          <Table
            rowKey="id"
            size="small"
            bordered
            loading={loading}
            columns={columns}
            dataSource={group.list}
            pagination={false}
            scroll={{ x: 1600 }}
          />
        </section>
      )) : (
        <Empty description="暂无月度管理工作写实数据" />
      )}
    </div>
  );
}

function PlaceholderTab({ title, rowData }) {
  return (
    <div className="post-report-placeholder">
      <Descriptions bordered size="small" column={2}>
        <Descriptions.Item label="模块">{title}</Descriptions.Item>
        <Descriptions.Item label="公司">{rowData?.shortForm || rowData?.companyName || "-"}</Descriptions.Item>
        <Descriptions.Item label="管理状态">{rowData?.opsProgStatus || "-"}</Descriptions.Item>
        <Descriptions.Item label="数据说明">当前为本地假数据占位，后续可替换为真实接口。</Descriptions.Item>
      </Descriptions>
    </div>
  );
}

function CompanyDetail({ rowId, rowData, selectedYear, setTitleType }) {
  const [activeTab, setActiveTab] = useState("5");
  const [detailData, setDetailData] = useState({});
  const [infoData, setInfoData] = useState({
    id: "month-report-202602",
    annalTargetId: "year-report-2026",
    gzxsReportId: "gzxs-202602",
    year: 2026,
    month: 2
  });
  const [monthValue, setMonthValue] = useState(dayjs("2026-02"));

  useEffect(() => {
    getPostReportCompanyDetail({ id: rowId }).then((res) => {
      if (res.code === 200) {
        setDetailData({ ...res.data, ...rowData });
        setTitleType?.(res.data?.opsProgStatus);
      }
    });
  }, [rowId]);

  const handleMonthChange = (date) => {
    const nextDate = date || dayjs("2026-02");
    setMonthValue(nextDate);
    getMonthId({ date: nextDate.format("YYYY-MM"), companyId: rowId }).then((res) => {
      if (res.code === 200) {
        setInfoData({
          id: res.data.monthId,
          annalTargetId: res.data.yearId,
          gzxsReportId: res.data.gzxsReportId,
          year: res.data.year,
          month: res.data.month
        });
      }
    });
  };

  const currentMonth = infoData.month || 2;
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const tabItems = [
    {
      key: "0",
      label: <span><AppstoreOutlined /> 经营情况</span>,
      children: <PlaceholderTab title="经营情况" rowData={detailData} />
    },
    {
      key: "1",
      label: <span><AppstoreOutlined /> 基本信息</span>,
      children: <PlaceholderTab title="基本信息" rowData={detailData} />
    },
    {
      key: "2",
      label: <span><TeamOutlined /> 董监事信息</span>,
      children: <PlaceholderTab title="董监事信息" rowData={detailData} />
    },
    {
      key: "3",
      label: <span><UserOutlined /> 股东信息</span>,
      children: <PlaceholderTab title="股东信息" rowData={detailData} />
    },
    {
      key: "4",
      label: <span><LineChartOutlined /> 财务指标({previousMonth}月)</span>,
      children: <PlaceholderTab title="财务指标" rowData={detailData} />
    },
    {
      key: "5",
      label: <span><CalendarOutlined /> 月度管理工作写实({currentMonth}月)</span>,
      children: <MonthlyManagementWork infoData={infoData} />
    },
    {
      key: "6",
      label: <span><FlagOutlined /> 重点工作推进情况/综合评价({currentMonth}月)</span>,
      children: <PlaceholderTab title="重点工作推进情况/综合评价" rowData={detailData} />
    }
  ];

  return (
    <div className="post-report-company-detail">
      <div className="post-report-detail-head">
        <div className="post-report-detail-title-row">
          <div>参股公司</div>
          <div className="post-report-detail-title">{detailData.companyName || rowData?.companyName || "参股公司详情"}</div>
        </div>
        <div className="post-report-detail-actions">
          {["4", "5", "6"].includes(activeTab) ? (
            <DatePicker
              picker="month"
              value={monthValue}
              format="YYYY年MM月"
              allowClear={false}
              onChange={handleMonthChange}
            />
          ) : null}
        </div>
      </div>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
}

export default function PostReport() {
  const [searchForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rowId, setRowId] = useState("");
  const [rowData, setRowData] = useState(null);
  const [titleType, setTitleType] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const selectedYear = useMemo(() => dayjs("2026-02"), []);
  const filteredRows = useMemo(() => {
    const keyword = searchKeyword.trim();
    if (!keyword) return rows;
    return rows.filter((item) => [item.companyName, item.shortForm, item.dutyUserName]
      .filter(Boolean)
      .some((value) => String(value).includes(keyword)));
  }, [rows, searchKeyword]);

  useEffect(() => {
    setLoading(true);
    getPostReportTable()
      .then((res) => {
        if (res.code === 200) {
          setRows(normalizeTableRows(res));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const openDetail = (record, monthQuarter) => {
    setRowId(record.id);
    setRowData({ ...record, monthQuarter });
    setDrawerOpen(true);
  };

  const columns = [
    { title: "序号", dataIndex: "reportIndex", width: 60, align: "center", render: (_value, _record, index) => index + 1 },
    {
      title: "公司/公司简称",
      dataIndex: "shortForm",
      width: 120,
      align: "center",
      render: (value) => (
        <Tooltip title={value}>
          <span className="post-report-ellipsis">{value || "--"}</span>
        </Tooltip>
      )
    },
    {
      title: "公司全称",
      dataIndex: "companyName",
      width: 160,
      align: "center",
      render: (value) => (
        <Tooltip title={value}>
          <span className="post-report-ellipsis">{value || "--"}</span>
        </Tooltip>
      )
    },
    {
      title: "负责人",
      dataIndex: "dutyUserName",
      align: "center",
      render: (value, record) => <span>{value || record.projectDutyUserName || "--"}</span>
    },
    { title: "成立时间", dataIndex: "launchDate", align: "center" },
    {
      title: "注册资本（万元）",
      dataIndex: "registeredCapitalAmt",
      align: "right",
      render: (value) => value || value === 0 ? Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""
    },
    {
      title: "投资成本（万元）",
      dataIndex: "investCostAmt",
      align: "right",
      render: (value) => value || value === 0 ? Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0"
    },
    {
      title: "持股比例",
      dataIndex: "shRatio",
      align: "right",
      render: (value) => value || value === 0 ? `${Number(value).toFixed(2)}%` : value
    },
    {
      title: "操作",
      dataIndex: "action",
      width: 100,
      fixed: "right",
      render: (_value, record) => (
        <Space size="middle">
          <a onClick={() => openDetail(record, "month")} style={{ color: "#3A2AE4", marginRight: 10 }}>月报</a>
          <a onClick={() => openDetail(record, "quarter")} style={{ color: "#3A2AE4" }}>季报</a>
        </Space>
      )
    }
  ];

  return (
    <div className="post-report-page">
      <Spin spinning={loading} tip="加载中..." style={{ width: "100%" }}>
        <div className="post-report-knowledge-all">
          <div className="post-report-filter-row">
            <div className="post-report-filter-left">
              <Form
                form={searchForm}
                name="postReportSearch"
                labelAlign="left"
                layout="vertical"
                labelWrap
                wrapperCol={{ flex: 1 }}
                colon={false}
                style={{ width: "100%" }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    setSearchKeyword(searchForm.getFieldValue("companyName") || "");
                  }
                }}
              >
                <div className="post-report-filter-grid">
                  <Form.Item name="companyName" label="公司名称">
                    <Input />
                  </Form.Item>
                </div>
              </Form>
            </div>
            <div className="post-report-filter-right">
              <Button
                type="primary"
                onClick={() => {
                  searchForm.setFieldsValue({ companyName: "" });
                  setSearchKeyword("");
                }}
                style={{ background: "#FFFFFF", color: "#262626", borderColor: "#E4E4E7" }}
              >
                重置
              </Button>
              <Button
                type="primary"
                onClick={() => setSearchKeyword(searchForm.getFieldValue("companyName") || "")}
                style={{ marginLeft: 5, background: "#3A2AE4" }}
              >
                <span style={{ color: "#fff" }}>查询</span>
              </Button>
            </div>
          </div>
        </div>
        <Table
          rowKey="key"
          className="post-report-table"
          size="small"
          tableLayout="auto"
          columns={columns}
          dataSource={filteredRows}
          pagination={{ pageSize: 10, total: filteredRows.length }}
          scroll={{ x: "max-content" }}
        />
      </Spin>
      <Drawer
        width="80%"
        title={titleType === "10000" ? "投资项目详情" : "参股公司详情"}
        open={drawerOpen}
        destroyOnClose
        onClose={() => setDrawerOpen(false)}
      >
        {rowData ? (
          <CompanyDetail
            rowId={rowId}
            onClose={() => setDrawerOpen(false)}
            selectedYear={selectedYear}
            rowData={rowData}
            setTitleType={setTitleType}
            initialActiveTab="5"
          />
        ) : null}
      </Drawer>
    </div>
  );
}
