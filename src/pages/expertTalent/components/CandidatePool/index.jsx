import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Table, Tag, message } from "antd";
import { useMemo, useState } from "react";
import { uid, updateStore, useExpertStore } from "../../store";
import styles from "./index.module.less";

const sourceOptions = ["内部", "外部", "参股企业"];
const genderOptions = ["男", "女"];
const fields = [
  ["name", "姓名"],
  ["gender", "性别"],
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
const requiredFields = ["name", "gender", "phone"];
const dash = (value) => value || "--";

export default function CandidatePool({ onInvite }) {
  const state = useExpertStore();
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const statusCounts = useMemo(() => {
    const counts = { 待邀请: 0, 已转邀请: 0 };
    state.candidates.forEach((item) => {
      if (counts[item.status] != null) counts[item.status] += 1;
    });
    return counts;
  }, [state.candidates]);
  const rows = useMemo(
    () =>
      state.candidates.filter(
        (item) =>
          (!statusFilter || item.status === statusFilter) &&
          (!keyword || Object.values(item).join(" ").includes(keyword)),
      ),
    [keyword, state.candidates, statusFilter],
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

  const columns = [
    {
      title: "人员来源",
      dataIndex: "source",
      width: 120,
      render: dash,
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
    {
      title: "性别",
      dataIndex: "gender",
      width: 80,
      render: dash,
    },
    {
      title: "单位",
      dataIndex: "company",
      minWidth: 160,
      ellipsis: true,
      render: dash,
    },
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
    { title: "拟服务领域", dataIndex: "field", width: 110, render: dash },
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
      <div className={styles.stageStrip}>
        <button
          type="button"
          className={`${styles.stageItem} ${statusFilter ? "" : styles.active}`}
          onClick={() => setStatusFilter("")}
        >
          <span>
            <i style={{ background: "#2563eb" }} />
            全部名单
          </span>
          <b>{state.candidates.length}</b>
        </button>
        <button
          type="button"
          className={`${styles.stageItem} ${statusFilter === "待邀请" ? styles.active : ""}`}
          onClick={() =>
            setStatusFilter(statusFilter === "待邀请" ? "" : "待邀请")
          }
        >
          <span>
            <i style={{ background: "#1677ff" }} />
            待邀请
          </span>
          <b>{statusCounts["待邀请"] || 0}</b>
        </button>
        <button
          type="button"
          className={`${styles.stageItem} ${statusFilter === "已转邀请" ? styles.active : ""}`}
          onClick={() =>
            setStatusFilter(statusFilter === "已转邀请" ? "" : "已转邀请")
          }
        >
          <span>
            <i style={{ background: "#389e0d" }} />
            已转邀请
          </span>
          <b>{statusCounts["已转邀请"] || 0}</b>
        </button>
      </div>
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
          placeholder="搜索姓名、单位、来源、项目或领域"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          className={styles.search}
        />
        <div className={styles.tools}>
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
        cancelText="取消"
      >
        <Form form={form} layout="vertical" className={styles.formGrid}>
          {fields.map(([key, label]) => (
            <Form.Item
              key={key}
              name={key}
              label={label}
              rules={
                requiredFields.includes(key)
                  ? [{ required: true, whitespace: true }]
                  : []
              }
            >
              {key === "source" || key === "gender" ? (
                <Select
                  options={(key === "gender"
                    ? genderOptions
                    : sourceOptions
                  ).map((value) => ({ value }))}
                  placeholder="请选择"
                />
              ) : (
                <Input.TextArea
                  autoSize={
                    key === "reason"
                      ? { minRows: 2, maxRows: 3 }
                      : { minRows: 1, maxRows: 1 }
                  }
                />
              )}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </div>
  );
}
