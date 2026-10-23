import {
  Alert,
  Button,
  Card,
  DatePicker,
  Descriptions,
  Drawer,
  Input,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Timeline,
  message,
} from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  batchCsv,
  canReadReimbursement,
  displayTime,
  generateBatch,
  mask,
  money,
  settlementProfile,
  shanghaiDate,
} from "../../settlement";
import { updateStore, useExpertStore } from "../../store";
import { useExpertConfig } from "../../configStore";
import ExpertSettlementProfile from "../ExpertSettlementProfile";
import Reimbursement from "../Reimbursement";
import ApprovalDetails from "../ApprovalDetails";
import { checkClosing } from "../ExpertSession";
import styles from "./index.module.less";
const statusColor = (value) =>
  value === "已审批" || value === "已确认"
    ? "success"
    : value === "已退回"
      ? "error"
      : "processing";
export default function SettlementWorkspace() {
  const state = useExpertStore();
  const config = useExpertConfig();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const activeTab = params.get("tab") === "batches" ? "batches" : "ledger";
  const [month, setMonth] = useState(dayjs(shanghaiDate()));
  const [keyword, setKeyword] = useState("");
  const [department, setDepartment] = useState();
  const [status, setStatus] = useState();
  const selected = state.reimbursements.find(
    (item) =>
      item.id === params.get("reimbursementId") &&
      canReadReimbursement(state, item),
  );
  const batch = state.settlementBatches.find(
    (item) => item.id === params.get("batchId"),
  );
  const [approvalId, setApprovalId] = useState(null);
  const visible = useMemo(
    () =>
      state.reimbursements.filter((row) => {
        const expert = state.experts.find((item) => item.id === row.expertId);
        return (
          canReadReimbursement(state, row) &&
          (!keyword ||
            [
              row.number,
              row.taskId,
              row.project,
              row.applicant,
              expert?.name,
              row.batchNumber,
            ]
              .join(" ")
              .includes(keyword)) &&
          (!status || row.status === status) &&
          (!department || row.department === department)
        );
      }),
    [state, keyword, status, department],
  );
  const batches = state.settlementBatches.filter(
    (item) => !month || item.month === month.format("YYYY-MM"),
  );
  function locate(key, value) {
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      next.delete("workspace");
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  }
  function persist(mutator, success) {
    try {
      updateStore(mutator);
      if (success) message.success(success);
      return true;
    } catch (error) {
      message.error(error.message);
      return false;
    }
  }
  function generate() {
    if (!month) return message.warning("请选择结算月份");
    let id;
    if (
      persist((next) => {
        id = generateBatch(next, month.format("YYYY-MM"), config);
      })
    ) {
      if (id) {
        locate("batchId", id);
        message.success("月度汇总已生成/刷新");
      } else message.info("截止时间内暂无已审批且未汇总的单据");
    }
  }
  function download() {
    try {
      const csv = batchCsv(state, batch.id);
      const url = URL.createObjectURL(
        new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `${batch.number}_v${batch.version}.csv`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      message.error(error.message);
    }
  }
  const reimbursementColumns = [
    {
      title: "报销单号 / 调用",
      width: 200,
      render: (_, item) => (
        <>
          <Button
            type="link"
            onClick={() => locate("reimbursementId", item.id)}
          >
            {item.number}
          </Button>
          <small className={styles.secondary}>{item.taskId}</small>
        </>
      ),
    },
    {
      title: "专家 / 项目",
      width: 210,
      render: (_, item) => (
        <>
          <b>{state.experts.find((row) => row.id === item.expertId)?.name}</b>
          <small className={styles.secondary}>{item.project}</small>
        </>
      ),
    },
    {
      title: "调用人 / 部门",
      width: 160,
      render: (_, item) => (
        <>
          {item.applicant}
          <small className={styles.secondary}>{item.department}</small>
        </>
      ),
    },
    {
      title: "服务日期",
      width: 150,
      render: (_, item) =>
        item.lines.map((line) => line.date).join("、") || "—",
    },
    {
      title: "标准税前 / 申请税前",
      width: 180,
      render: (_, item) => (
        <>
          ¥{money(item.standardCents)}
          <small className={styles.secondary}>
            申请 ¥{money(item.amountCents)}{" "}
            {item.isOver ? <Tag color="warning">超标</Tag> : null}
          </small>
        </>
      ),
    },
    {
      title: "审批状态",
      dataIndex: "status",
      width: 170,
      render: (value) => <Tag color={statusColor(value)}>{value}</Tag>,
    },
    {
      title: "汇总批次",
      width: 160,
      render: (_, item) =>
        item.batchNumber ? (
          <Button
            type="link"
            onClick={() => {
              setParams({
                tab: "batches",
                batchId: item.batchId,
              });
            }}
          >
            {item.batchNumber}
          </Button>
        ) : (
          item.batchNumber || "未汇总"
        ),
    },
    {
      title: "操作",
      width: 200,
      fixed: "right",
      render: (_, item) => (
        <Space>
          <Button onClick={() => locate("reimbursementId", item.id)}>
            查看 / 办理
          </Button>
          <Button onClick={() => setApprovalId(item.id)}>审批详情</Button>
        </Space>
      ),
    },
  ];
  const batchRows =
    batch?.items.map((item) => ({
      ...item,
      record: state.reimbursements.find(
        (row) => row.id === item.reimbursementId,
      ),
      expert: state.experts.find((row) => row.id === item.expertId),
      account:
        batch.status === "已生成"
          ? settlementProfile(state, item.expertId)
          : item.accountSnapshot || settlementProfile(state, item.expertId),
    })) || [];
  return (
    <div className={styles.content}>
      <ApprovalDetails
        recordId={approvalId}
        open={Boolean(approvalId)}
        onClose={() => setApprovalId(null)}
      />
      <Tabs
        activeKey={activeTab}
        onChange={(key) => locate("tab", key)}
        items={[
          { key: "ledger", label: "报销台账" },
          { key: "batches", label: "月度汇总" },
        ]}
      />
      {activeTab === "ledger" ? (
        <>
          <div className={styles.filters}>
            <Input
              aria-label="搜索报销"
              placeholder="单号 / 专家 / 项目 / 调用人"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              allowClear
            />
            <Select
              aria-label="筛选报销部门"
              placeholder="需求部门"
              value={department}
              allowClear
              onChange={setDepartment}
              options={[
                ...new Set(state.reimbursements.map((item) => item.department)),
              ].map((value) => ({ value }))}
            />
            <Select
              aria-label="筛选报销状态"
              placeholder="审批状态"
              value={status}
              allowClear
              onChange={setStatus}
              options={[
                "草稿",
                "部门负责人审批中",
                "财务负责人审批中",
                "分管领导审批中",
                "已退回",
                "已审批",
              ].map((value) => ({ value }))}
            />
            <Button
              onClick={() => {
                setKeyword("");
                setDepartment(undefined);
                setStatus(undefined);
              }}
            >
              重置筛选
            </Button>
          </div>
          <Card className={styles.tableCard}>
            <div className={styles.actionBar}>
              <span>
                共 <b>{visible.length}</b> 张报销单
              </span>
              <Button onClick={() => navigate("/zj/tasks")}>
                前往调用办理报销
              </Button>
            </div>
            <Table
              rowKey="id"
              dataSource={visible}
              columns={reimbursementColumns}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1480, y: "max(320px, calc(100vh - 440px))" }}
            />
          </Card>
        </>
      ) : (
        <>
          <div className={styles.actionBar}>
            <Space>
              <DatePicker
                aria-label="选择结算月份"
                picker="month"
                placeholder="全部月份"
                value={month}
                onChange={setMonth}
              />
              <Button type="primary" onClick={generate}>
                生成 / 刷新月度汇总
              </Button>
            </Space>
            <span>
              月结：
              {config.closing.day
                ? `每月${config.closing.day}日`
                : "每月最后一日"}{" "}
              {config.closing.time} · 税前金额
            </span>
          </div>
          <Card className={styles.tableCard}>
            <Table
              rowKey="id"
              dataSource={batches}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000, y: "max(320px, calc(100vh - 440px))" }}
              columns={[
                {
                  title: "汇总批次",
                  dataIndex: "number",
                  render: (value, item) => (
                    <Button
                      type="link"
                      onClick={() => locate("batchId", item.id)}
                    >
                      {value}
                    </Button>
                  ),
                },
                { title: "结算月", dataIndex: "month" },
                {
                  title: "单据 / 专家",
                  render: (_, item) =>
                    `${item.items.length}笔 / ${new Set(item.items.map((row) => row.expertId)).size}人`,
                },
                {
                  title: "税前合计",
                  render: (_, item) => `¥${money(item.totalCents)}`,
                },
                {
                  title: "状态",
                  dataIndex: "status",
                  render: (value) => (
                    <Tag color={statusColor(value)}>{value}</Tag>
                  ),
                },
                {
                  title: "版本",
                  render: (_, item) => `v${item.version}`,
                },
                {
                  title: "生成时间",
                  render: (_, item) => displayTime(item.createdAt),
                },
              ]}
            />
          </Card>
        </>
      )}
      <Drawer
        title="专家调用报销"
        width="76vw"
        open={Boolean(selected)}
        onClose={() => locate("reimbursementId", null)}
      >
        {selected ? <Reimbursement taskId={selected.taskId} /> : null}
      </Drawer>
      <Drawer
        title={`${batch?.number || "月度汇总"} · 税前报销汇总`}
        width="86vw"
        open={Boolean(batch)}
        onClose={() => locate("batchId", null)}
      >
        {batch ? (
          <div className={styles.content}>
            <Descriptions
              bordered
              size="small"
              column={3}
              items={[
                { key: "month", label: "结算月份", children: batch.month },
                {
                  key: "count",
                  label: "单据笔数",
                  children: batch.items.length,
                },
                {
                  key: "total",
                  label: "税前金额合计",
                  children: `¥${money(batch.totalCents)}`,
                },
                {
                  key: "state",
                  label: "状态",
                  children: (
                    <Tag color={statusColor(batch.status)}>{batch.status}</Tag>
                  ),
                },
                {
                  key: "cutoff",
                  label: "归集截止",
                  children: displayTime(batch.cutoff),
                },
                {
                  key: "version",
                  label: "版本",
                  children: `v${batch.version}`,
                },
              ]}
            />

            <Table
              rowKey="reimbursementId"
              dataSource={batchRows}
              pagination={false}
              scroll={{ x: 1500, y: 360 }}
              expandable={{
                expandedRowRender: (row) => (
                  <div className={styles.content}>
                    <ExpertSettlementProfile expertId={row.expertId} />
                    <Button
                      onClick={() =>
                        locate("reimbursementId", row.reimbursementId)
                      }
                    >
                      查看原报销与咨询记录
                    </Button>
                  </div>
                ),
              }}
              columns={[
                {
                  title: "报销单号",
                  render: (_, row) => (
                    <Button
                      type="link"
                      onClick={() =>
                        locate("reimbursementId", row.reimbursementId)
                      }
                    >
                      {row.record?.number}
                    </Button>
                  ),
                },
                {
                  title: "专家 / 身份",
                  render: (_, row) => (
                    <>
                      {row.expert?.name}
                      <small className={styles.secondary}>
                        {row.account?.expertType}
                      </small>
                    </>
                  ),
                },
                {
                  title: "证件号码",
                  render: (_, row) => mask(row.account?.idNo),
                },
                {
                  title: "服务日期",
                  render: (_, row) =>
                    row.record?.lines.map((line) => line.date).join("、"),
                },
                {
                  title: "税前金额",
                  render: (_, row) => `¥${money(row.amountCents)}`,
                },
                {
                  title: "付款账号",
                  render: (_, row) => mask(row.account?.bankAccount),
                },
                {
                  title: "收款资料",
                  render: (_, row) => (
                    <Tag
                      color={
                        row.account?.accountName &&
                        row.account?.bankName &&
                        row.account?.bankAccount
                          ? "success"
                          : "warning"
                      }
                    >
                      {row.account?.accountName &&
                      row.account?.bankName &&
                      row.account?.bankAccount
                        ? "已补齐"
                        : "待补充"}
                    </Tag>
                  ),
                },
                {
                  title: "调用 / 部门",
                  render: (_, row) => (
                    <>
                      {row.record?.taskId}
                      <small className={styles.secondary}>
                        {row.record?.department}
                      </small>
                    </>
                  ),
                },
              ]}
            />
            <Space wrap>
              <Button onClick={download}>正式导出</Button>
            </Space>
            {/* <Timeline
              items={batch.history
                .filter((item) => !/^(预览|正式)导出/.test(item.text || ""))
                .map((item, index) => ({
                  key: index,
                  children: (
                    <>
                      {item.actor} · {displayTime(item.at)}
                      <p>{item.text}</p>
                    </>
                  ),
                }))}
            /> */}
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
