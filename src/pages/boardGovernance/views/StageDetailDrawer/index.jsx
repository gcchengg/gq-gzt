import { Drawer } from "antd";
import styles from "./index.module.less";

export default function StageDetailDrawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = "min(1040px, 100vw)",
}) {
  return (
    <Drawer
      className={styles.drawer}
      open={open}
      onClose={onClose}
      width={width}
      destroyOnClose
      title={
        <div className={styles.drawerTitle}>
          <strong>{title}</strong>
          {subtitle ? <span>{subtitle}</span> : null}
        </div>
      }
    >
      <div className={styles.body}>{children}</div>
    </Drawer>
  );
}
