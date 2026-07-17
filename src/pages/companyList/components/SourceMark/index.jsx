import { InfoCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import styles from "./index.module.less";

export default function SourceMark({ children, source }) {
  const needsSupplement = source === "需要后续补充";

  return (
    <span className={`${styles.mark} ${needsSupplement ? styles.missing : ""}`}>
      <span className={styles.value}>{children}</span>
      <Tooltip title={source} placement="top">
        <InfoCircleOutlined
          className={styles.icon}
          aria-label={`数据来源：${source}`}
        />
      </Tooltip>
    </span>
  );
}
