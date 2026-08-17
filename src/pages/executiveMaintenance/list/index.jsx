import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  buildExecutiveMaintenancePath,
  buildQuarterlyMaintenanceRows,
  QUARTER_CONFIGS,
} from "../quarter";
import styles from "./index.module.less";

const maintenanceRows = buildQuarterlyMaintenanceRows({
  idPrefix: "cc-001-2026",
  companyName: "长春一东离合器股份有限公司",
  shortForm: "长春一东",
  stockCode: "600148.SH",
  year: "2026",
});

const statusColor = {
  已完成: "success",
  维护中: "processing",
  待维护: "default",
};

export default function ExecutiveMaintenanceList() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({});

  const rows = useMemo(
    () =>
      maintenanceRows.filter(
        (item) =>
          (!filters.keyword ||
            `${item.companyName}${item.shortForm}${item.stockCode}`.includes(
              filters.keyword.trim(),
            )) &&
          (!filters.year || item.year === filters.year) &&
          (!filters.period || item.period === filters.period) &&
          (!filters.status || item.status === filters.status),
      ),
    [filters],
  );

  const columns = [
    {
      title: "公司名称",
      dataIndex: "companyName",
      minWidth: 230,
      render: (value, record) => (
        <div className={styles.companyCell}>
          <strong>{value}</strong>
          <span>{record.stockCode}</span>
        </div>
      ),
    },
    {
      title: "维护年度",
      dataIndex: "year",
      width: 110,
      render: (value) => `${value}年`,
    },
    { title: "维护周期", dataIndex: "period", width: 110 },
    {
      title: "委派高管",
      dataIndex: "executiveCount",
      width: 110,
      align: "center",
      render: (value) => `${value}人`,
    },
    {
      title: "人员确认进度",
      dataIndex: "executiveProgress",
      width: 130,
      align: "center",
    },
    {
      title: "月报进度",
      dataIndex: "reportProgress",
      width: 120,
      align: "center",
    },
    { title: "最近维护时间", dataIndex: "updatedAt", width: 140 },
    {
      title: "维护状态",
      dataIndex: "status",
      fixed: "right",
      width: 110,
      render: (value) => <Tag color={statusColor[value]}>{value}</Tag>,
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => navigate(buildExecutiveMaintenancePath(record))}
        >
          {record.status === "已完成" ? "查看详情" : "去维护"}
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <Card className={styles.formCard}>
          <Form form={form} layout="vertical" onFinish={setFilters}>
            <Row gutter={16}>
              <Col xs={24} md={5}>
                <Form.Item label="公司名称/股票编码" name="keyword">
                  <Input allowClear placeholder="请输入公司名称或股票编码" />
                </Form.Item>
              </Col>
              <Col xs={24} md={5}>
                <Form.Item label="维护年度" name="year">
                  <Select
                    allowClear
                    options={[{ value: "2026", label: "2026年" }]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={5}>
                <Form.Item label="维护周期" name="period">
                  <Select
                    allowClear
                    options={QUARTER_CONFIGS.map(({ value, label }) => ({
                      value: label,
                      label,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={5}>
                <Form.Item label="维护状态" name="status">
                  <Select
                    allowClear
                    options={["待维护", "维护中", "已完成"].map((value) => ({
                      value,
                      label: value,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={4} className={styles.actions}>
                <Space>
                  <Button
                    onClick={() => {
                      form.resetFields();
                      setFilters({});
                    }}
                  >
                    重置
                  </Button>
                  <Button type="primary" htmlType="submit">
                    查询
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </Card>

        <Card className={styles.tableCard}>
          <div className={styles.tableTop}>
            <strong>外派高管履职分析列表</strong>
            <span>共 {rows.length} 条</span>
          </div>
          <Table
            tableLayout="auto"
            rowKey="id"
            columns={columns}
            dataSource={rows}
            scroll={{ x: "max-content", y: 470 }}
            pagination={false}
          />
        </Card>
      </div>
    </div>
  );
}
