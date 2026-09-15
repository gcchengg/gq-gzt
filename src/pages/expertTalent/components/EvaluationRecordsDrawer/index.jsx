import {
  Button,
  DatePicker,
  Drawer,
  Input,
  Select,
  Table,
  Tag,
  Tooltip,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { filterEvaluationRecords } from "../../evaluationAnalytics";
import styles from "./index.module.less";

const resultColors = { 优秀: "success", 良好: "blue", 一般: "error" };
const retrospectiveColors = {
  命中: "success",
  部分命中: "processing",
  偏离: "error",
  证伪: "error",
  待回溯: "warning",
};

export default function EvaluationRecordsDrawer({ open, onClose, records }) {
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState();
  const [retrospective, setRetrospective] = useState();
  const [dates, setDates] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!open) return;
    setKeyword("");
    setResult(undefined);
    setRetrospective(undefined);
    setDates([]);
    setPage(1);
  }, [open]);

  const filtered = useMemo(
    () =>
      filterEvaluationRecords(records, {
        keyword,
        result,
        retrospective,
        dates: dates.map((date) => date.format("YYYY-MM-DD")),
      }),
    [dates, keyword, records, result, retrospective],
  );

  const columns = [
    {
      title: "项目",
      dataIndex: "project",
      ellipsis: { showTitle: false },
      render: (value) => (
        <Tooltip placement="topLeft" title={value}>
          <b className={styles.projectName}>{value}</b>
        </Tooltip>
      ),
    },
    { title: "专家", dataIndex: "expert" },
    { title: "交付性 50%", dataIndex: "delivery" },
    { title: "响应效率 30%", dataIndex: "response" },
    { title: "服务态度 20%", dataIndex: "attitude" },
    {
      title: "评价结果",
      dataIndex: "result",
      render: (value) => <Tag color={resultColors[value]}>{value}</Tag>,
    },
    {
      title: "观点回溯",
      dataIndex: "retrospective",
      render: (value) => <Tag color={retrospectiveColors[value]}>{value}</Tag>,
    },
    { title: "评价日期", dataIndex: "date" },
  ];

  function clearFilters() {
    setKeyword("");
    setResult(undefined);
    setRetrospective(undefined);
    setDates([]);
    setPage(1);
  }

  return (
    <Drawer
      title="最近评价记录"
      open={open}
      onClose={onClose}
      width="72vw"
      className={styles.drawer}
      rootClassName={styles.drawerRoot}
    >
      <div className={styles.summary}>共 {filtered.length} 条评价记录</div>
      <div className={styles.filters}>
        <Input.Search
          value={keyword}
          onChange={(event) => {
            setKeyword(event.target.value);
            setPage(1);
          }}
          placeholder="项目 / 专家搜索"
          allowClear
        />
        <Select
          value={result}
          onChange={(value) => {
            setResult(value);
            setPage(1);
          }}
          placeholder="评价结果"
          allowClear
          options={["优秀", "良好", "一般"].map((value) => ({ value }))}
        />
        <Select
          value={retrospective}
          onChange={(value) => {
            setRetrospective(value);
            setPage(1);
          }}
          placeholder="回溯状态"
          allowClear
          options={["待回溯", "命中", "部分命中", "偏离", "证伪"].map(
            (value) => ({ value }),
          )}
        />
        <DatePicker.RangePicker
          value={dates.length ? dates : null}
          onChange={(value) => {
            setDates(value || []);
            setPage(1);
          }}
          placeholder={["评价日期", "评价日期"]}
        />
        <Button onClick={clearFilters}>清除筛选</Button>
      </div>
      <Table
        rowKey={(record) => `${record.project}-${record.expert}-${record.date}`}
        columns={columns}
        dataSource={filtered}
        scroll={{ x: 980 }}
        locale={{ emptyText: "暂无符合条件的评价记录" }}
        pagination={{
          current: page,
          pageSize: 8,
          showSizeChanger: false,
          showTotal: (total) => `共 ${total} 条`,
          onChange: setPage,
        }}
        expandable={{
          expandedRowRender: (record) => (
            <p className={styles.comment}>
              评价说明：{record.comment || "暂无评价说明"}
            </p>
          ),
        }}
      />
    </Drawer>
  );
}
