import { useEffect, useMemo, useState } from "react";
import { Button, Descriptions, Drawer, Select, Table } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import StatusPill from "../../../../components/StatusPill";
import styles from "./index.module.less";

const quarterMonths = {
  第一季度: "03-28",
  第二季度: "06-28",
  第三季度: "09-12",
  第四季度: "12-20",
};
const quarterOptions = ["第一季度", "第二季度", "第三季度", "第四季度"];

function buildHistory(material) {
  if (!material) return [];
  return ["2026", "2025", "2024"].flatMap((year) => {
    const periods =
      material.frequency === "年度"
        ? ["年度"]
        : year === "2026"
          ? ["第三季度", "第二季度", "第一季度"]
          : quarterOptions.toReversed();
    return periods.map((period, index) => ({
      id: `${material.id}-${year}-${period}`,
      year,
      quarter: period === "年度" ? "-" : period,
      period: period === "年度" ? `${year}年度` : `${year}年${period}`,
      submittedAt: `${year}-${period === "年度" ? "12-18" : quarterMonths[period]} ${index % 2 ? "14:26" : "09:35"}`,
      submitter: material.responsiblePerson,
      fileName: `${material.material}-${year}${period === "年度" ? "年度版" : period}.pdf`,
      status: "已提交",
    }));
  });
}

export default function MaterialHistoryDrawer({
  material,
  open,
  onClose,
  asPage = false,
}) {
  const [year, setYear] = useState("all");
  const [quarter, setQuarter] = useState("all");
  const history = useMemo(() => buildHistory(material), [material]);
  const filteredHistory = useMemo(
    () =>
      history.filter((item) => {
        const matchesYear = year === "all" || item.year === year;
        const matchesQuarter = quarter === "all" || item.quarter === quarter;
        return matchesYear && matchesQuarter;
      }),
    [history, quarter, year],
  );

  useEffect(() => {
    setYear("all");
    setQuarter("all");
  }, [material?.id]);

  const columns = [
    { title: "归档周期", dataIndex: "period", width: 140 },
    { title: "提交时间", dataIndex: "submittedAt", width: 165 },
    { title: "提交人", dataIndex: "submitter", width: 130 },
    {
      title: "历史内容",
      dataIndex: "fileName",
      width: 300,
      render: (value) => (
        <Button type="link" icon={<FileTextOutlined />}>
          {value}
        </Button>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (value) => <StatusPill>{value}</StatusPill>,
    },
  ];

  const body = (
    <>
      <Descriptions
        className={styles.summary}
        column={2}
        size="small"
        items={[
          { key: "category", label: "资料类别", children: material?.category },
          {
            key: "frequency",
            label: "更新频次",
            children: material?.frequency,
          },
          {
            key: "department",
            label: "责任部门",
            children: material?.department,
          },
          {
            key: "person",
            label: "责任人",
            children: material?.responsiblePerson,
          },
        ]}
      />
      <div className={styles.filters}>
        <div>
          <label>年度</label>
          <Select
            value={year}
            onChange={setYear}
            options={[
              { value: "all", label: "全部年度" },
              ...["2026", "2025", "2024"].map((value) => ({
                value,
                label: `${value}年`,
              })),
            ]}
          />
        </div>
        <div>
          <label>季度</label>
          <Select
            value={quarter}
            disabled={material?.frequency === "年度"}
            onChange={setQuarter}
            options={[
              {
                value: "all",
                label: material?.frequency === "年度" ? "年度资料" : "全部季度",
              },
              ...quarterOptions.map((value) => ({ value, label: value })),
            ]}
          />
        </div>
        <span>共 {filteredHistory.length} 条历史记录</span>
      </div>
      <Table
        rowKey="id"
        tableLayout="fixed"
        columns={columns}
        dataSource={filteredHistory}
        pagination={{ pageSize: 8, showSizeChanger: false }}
      />
    </>
  );

  if (asPage) {
    return <div className={styles.page}>{body}</div>;
  }

  return (
    <Drawer
      className={styles.drawer}
      width={900}
      open={open}
      onClose={onClose}
      title={
        <div className={styles.drawerTitle}>
          <strong>资料历史详情</strong>
          <span>{material?.material}</span>
        </div>
      }
    >
      {body}
    </Drawer>
  );
}
