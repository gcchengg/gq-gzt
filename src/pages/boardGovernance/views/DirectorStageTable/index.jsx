import { useState } from "react";
import { Avatar, Button, Input, Select, Space } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FilterOutlined,
  SolutionOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { DataTable, SectionCard, StatusPill } from "../../components/PageKit";
import {
  directorLifecycleStages,
  directorStageLabel,
  directorTableColumnTitles,
  filterDirectorsForStage as defaultFilterDirectorsForStage,
} from "../../stageRouting";
import styles from "./index.module.less";

export default function DirectorStageTable({
  directors = [],
  defaultStage = "all",
  generatedDirectorNames = [],
  extra,
  onViewDetail,
  filterDirectorsForStage = defaultFilterDirectorsForStage,
}) {
  const [keyword, setKeyword] = useState("");
  const [stage, setStage] = useState(defaultStage);
  const rows = filterDirectorsForStage(directors, {
    keyword,
    stage,
    generatedDirectorNames,
  });
  return (
    <>
      <div className={styles.directorToolbar}>
        {/* <Input
          allowClear
          prefix={<FilterOutlined />}
          placeholder="搜索董事姓名、编号、企业或董事类型"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        /> */}
        <Select
          value={stage}
          onChange={setStage}
          options={[
            { value: "all", label: "全部阶段" },
            ...directorLifecycleStages.map((item) => ({
              value: item.key,
              label: item.label,
            })),
          ]}
        />
        {extra}
      </div>
      <SectionCard
        title="董事列表"
        extra={<span className={styles.tableMeta}>{rows.length} 位董事</span>}
      >
        <DataTable
          rowKey="id"
          rows={rows}
          onRowClick={onViewDetail}
          columns={directorColumns(onViewDetail, defaultStage).filter(
            (column) => {
              const titles = directorTableColumnTitles(defaultStage);
              if (column.key === "action") return titles.includes("查看详情");
              return titles.includes(column.title);
            },
          )}
        />
      </SectionCard>
    </>
  );
}

function directorColumns(onViewDetail, defaultStage) {
  return [
    {
      title: "董事信息",
      key: "director",
      fixed: "left",
      width: 190,
      render: (_, record) => (
        <div className={styles.directorCell}>
          <Avatar icon={<UserOutlined />} />
          <span>
            <strong>{record.name}</strong>
            <small>
              {defaultStage === "appointment"
                ? record.id
                : `${record.id} · ${record.role}`}
            </small>
          </span>
        </div>
      ),
    },
    { title: "董事类型", dataIndex: "role", width: 130 },
    {
      title: "负责人",
      dataIndex: "appointmentOwner",
      width: 210,
      render: (value) => value || "待分配",
    },
    { title: "任职企业", dataIndex: "company", width: 130 },
    { title: "任期", dataIndex: "term", width: 210 },
    {
      title: "当前阶段",
      key: "stage",
      width: 130,
      render: (_, record) => (
        <div className={styles.stageCell}>
          <StatusPill>{directorStageLabel(record)}</StatusPill>
          <small>{record[`${record.lifecycleStage}Status`] || "待办理"}</small>
        </div>
      ),
    },
    {
      title: "董事聘任",
      key: "appointment",
      width: 150,
      render: (_, record) => (
        <StageStatus
          icon={<SolutionOutlined />}
          label={record.appointmentStatus}
          tone={record.appointmentStatus === "已完成" ? "success" : "warning"}
        />
      ),
    },
    {
      title: "履职准备",
      key: "preparation",
      width: 130,
      render: (_, record) => (
        <StageStatus
          icon={<CheckCircleOutlined />}
          label={record.preparationStatus}
          tone={record.preparationStatus === "已完成" ? "success" : "warning"}
        />
      ),
    },
    {
      title: "履职管理",
      key: "management",
      width: 150,
      render: (_, record) => (
        <div className={styles.managementCell}>
          <span>
            {record.days} 天 · {record.completion}%完成
          </span>
          <small>{record.managementStatus}</small>
        </div>
      ),
    },
    {
      title: "履职评价",
      key: "evaluation",
      width: 130,
      render: (_, record) => (
        <StageStatus
          icon={<ClockCircleOutlined />}
          label={record.evaluationStatus}
          tone={record.evaluationStatus === "已完成" ? "success" : "warning"}
        />
      ),
    },
    {
      title: "风险状态",
      dataIndex: "risk",
      width: 110,
      render: (value) => <StatusPill>{value}</StatusPill>,
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={(event) => {
              event.stopPropagation();
              onViewDetail?.(record);
            }}
          >
            查看详情
          </Button>
        </Space>
      ),
    },
  ];
}

function StageStatus({ icon, label, tone }) {
  return (
    <span className={`${styles.stageStatus} ${styles[tone]}`}>
      {icon}
      {label}
    </span>
  );
}
