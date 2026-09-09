import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Table, Tag, message } from "antd";
import { useMemo, useState } from "react";
import { uid, updateStore, useExpertStore } from "../../store";
import styles from "./index.module.less";

const fields = [
  ["batch", "名单批次"],
  ["name", "姓名"],
  ["company", "单位"],
  ["title", "职务"],
  ["phone", "手机号"],
  ["source", "人员来源"],
  ["department", "推荐部门"],
  ["recommender", "推荐人"],
  ["project", "关联项目"],
  ["field", "拟服务领域"],
  ["reason", "推荐理由"],
];
const requiredFields = ["batch", "name", "company", "phone", "field"];
const csvHeader = fields.map(([, label]) => label).join(",");
const dash = (value) => value || "--";

function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) throw new Error("请至少粘贴表头和一行候选人员数据");
  const rows = lines
    .slice(1)
    .map((line) => line.split(/[,，\t]/).map((cell) => cell.trim()));
  return rows.map((cells, index) => {
    if (!cells[1] || !cells[2] || !cells[4])
      throw new Error(`第 ${index + 2} 行缺少姓名、单位或手机号`);
    return Object.fromEntries(
      fields.map(([key], position) => [key, cells[position] || ""]),
    );
  });
}

export default function CandidatePool({ onInvite }) {
  const state = useExpertStore();
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [editing, setEditing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [csv, setCsv] = useState(
    `${csvHeader}\n2026年补充名单,示例专家,示例单位,技术总监,13800009999,部门推荐,投资一部,王经理,示例项目,智能制造,具备相关项目经验`,
  );
  const [form] = Form.useForm();
  const rows = useMemo(
    () =>
      state.candidates.filter(
        (item) => !keyword || Object.values(item).join(" ").includes(keyword),
      ),
    [keyword, state.candidates],
  );
  const eligible = selectedKeys.filter(
    (id) =>
      state.candidates.find((item) => item.id === id)?.status === "待邀请",
  );

  function addCandidate() {
    form.validateFields().then((values) => {
      updateStore((store) =>
        store.candidates.unshift({
          id: uid("CAND"),
          ...values,
          status: "待邀请",
        }),
      );
      setEditing(false);
      form.resetFields();
      message.success("候选人员已加入初始推荐名单");
    });
  }
  function importCsv() {
    try {
      const imported = parseCsv(csv);
      updateStore((store) =>
        imported.forEach((item) =>
          store.candidates.push({ id: uid("CAND"), ...item, status: "待邀请" }),
        ),
      );
      setImporting(false);
      message.success(`已导入 ${imported.length} 位候选人员（演示）`);
    } catch (error) {
      message.error(error.message);
    }
  }

  const columns = [
    {
      title: "名单批次 / 来源",
      key: "batch",
      width: 160,
      render: (_, row) => (
        <div className={styles.personCell}>
          <strong>{dash(row.batch)}</strong>
          <span>{dash(row.source)}</span>
        </div>
      ),
    },
    {
      title: "姓名",
      dataIndex: "name",
      minWidth: 110,
      render: (_, row) => (
        <div className={styles.personCell}>
          <strong>{row.name}</strong>
          <span>{dash(row.title)}</span>
        </div>
      ),
    },
    { title: "单位", dataIndex: "company", minWidth: 160, ellipsis: true },
    { title: "手机号", dataIndex: "phone", width: 120 },
    {
      title: "推荐部门 / 推荐人",
      key: "recommender",
      width: 140,
      render: (_, row) => (
        <div className={styles.personCell}>
          <strong>{dash(row.department)}</strong>
          <span>{dash(row.recommender)}</span>
        </div>
      ),
    },
    {
      title: "关联项目",
      dataIndex: "project",
      width: 160,
      ellipsis: true,
      render: dash,
    },
    { title: "拟服务领域", dataIndex: "field", width: 110 },
    {
      title: "推荐理由",
      dataIndex: "reason",
      minWidth: 180,
      ellipsis: true,
      render: dash,
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (value) => (
        <Tag color={value === "待邀请" ? "processing" : "success"}>{value}</Tag>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.tableTop}>
        <strong>初始推荐名单</strong>
        <span>
          共 {rows.length} 条
          {eligible.length ? ` · 已选 ${eligible.length} 人可转邀请` : ""}
        </span>
      </div>
      <div className={styles.toolbar}>
        <Input.Search
          allowClear
          placeholder="搜索姓名、单位、批次、项目或领域"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          className={styles.search}
        />
        <div className={styles.tools}>
          <Button onClick={() => setImporting(true)}>CSV文本导入</Button>
          <Button icon={<PlusOutlined />} onClick={() => setEditing(true)}>
            新增候选人
          </Button>
          <Button
            type="primary"
            disabled={!eligible.length}
            onClick={() => onInvite(eligible)}
          >
            选中人员转邀请
          </Button>
        </div>
      </div>
      <Table
        tableLayout="auto"
        rowKey="id"
        columns={columns}
        dataSource={rows}
        scroll={{ y: 470 }}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        rowSelection={{
          selectedRowKeys: selectedKeys,
          onChange: setSelectedKeys,
          getCheckboxProps: (row) => ({ disabled: row.status !== "待邀请" }),
        }}
      />
      <Modal
        title="新增初始推荐名单人员"
        open={editing}
        onCancel={() => setEditing(false)}
        onOk={addCandidate}
        width={760}
        okText="保存"
      >
        <Form form={form} layout="vertical" className={styles.formGrid}>
          {fields.map(([key, label]) => (
            <Form.Item
              key={key}
              name={key}
              label={label}
              rules={[
                { required: requiredFields.includes(key), whitespace: true },
              ]}
            >
              <Input.TextArea
                autoSize={
                  key === "reason"
                    ? { minRows: 2, maxRows: 3 }
                    : { minRows: 1, maxRows: 1 }
                }
              />
            </Form.Item>
          ))}
        </Form>
      </Modal>
      <Modal
        title="CSV文本导入（演示）"
        open={importing}
        onCancel={() => setImporting(false)}
        onOk={importCsv}
        width={900}
        okText="导入名单"
      >
        <div className={styles.tip}>
          不设置“7类/5类”或固定人数。首行按下列表头粘贴，逗号、中文逗号或制表符均可分隔。
        </div>
        <Input.TextArea
          rows={10}
          value={csv}
          onChange={(event) => setCsv(event.target.value)}
        />
      </Modal>
    </div>
  );
}
