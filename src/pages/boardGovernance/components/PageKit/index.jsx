import { Button, Card, Drawer, Progress, Space, Table, Typography } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import StatusPill from "../StatusPill";
import styles from "./index.module.less";

export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <header className={styles.header}>
      <div>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <Typography.Title level={2}>{title}</Typography.Title>
        <p>{subtitle}</p>
      </div>
      <Space wrap>{actions}</Space>
    </header>
  );
}

export function SectionCard({ title, extra, children, className = "" }) {
  return (
    <Card variant="borderless" className={`${styles.card} ${className}`}>
      <div className={styles.cardHead}>
        <h3>{title}</h3>
        {extra}
      </div>
      {children}
    </Card>
  );
}

export function MetricCard({ item }) {
  return (
    <div className={`${styles.metric} ${styles[item.tone]}`}>
      <span>{item.label}</span>
      <strong>{item.value}</strong>
      <small>{item.trend}</small>
      <ArrowRightOutlined />
    </div>
  );
}

export function DataTable({
  columns,
  rows,
  onRowClick,
  rowKey = "id",
  selectedRowKey,
}) {
  return (
    <Table
      rowKey={rowKey}
      columns={columns}
      dataSource={rows}
      pagination={false}
      size="middle"
      scroll={{ x: "max-content" }}
      rowClassName={(row) =>
        row[rowKey] === selectedRowKey ? styles.selectedRow : ""
      }
      onRow={(row) => ({ onClick: () => onRowClick?.(row) })}
    />
  );
}

export function ProgressCell({ value }) {
  return (
    <div className={styles.progress}>
      <Progress
        percent={value}
        size="small"
        strokeColor={value < 60 ? "#d98300" : "#2f6bff"}
      />
      <span>{value}%</span>
    </div>
  );
}

export function GovernanceDrawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = 760,
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={width}
      title={
        <div className={styles.drawerTitle}>
          <strong>{title}</strong>
          <span>{subtitle}</span>
        </div>
      }
      extra={<Button type="primary">进入完整详情</Button>}
    >
      {children}
    </Drawer>
  );
}

export { StatusPill };
