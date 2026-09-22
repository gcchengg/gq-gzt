import { Alert, Button } from "antd";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/PageKit";
import styles from "./index.module.less";

export default function StageBlocked({
  title,
  reason,
  listTo,
  listLabel,
  nextTo,
  nextLabel,
  embedded = false,
}) {
  const actions = (
    <span className={styles.actions}>
      <Link to={listTo}>
        <Button>{listLabel}</Button>
      </Link>
      {nextTo ? (
        <Link to={nextTo}>
          <Button type="primary">{nextLabel}</Button>
        </Link>
      ) : null}
    </span>
  );
  if (embedded) {
    return (
      <Alert
        type="warning"
        showIcon
        message={title}
        description={reason}
        action={actions}
      />
    );
  }
  return (
    <div className={styles.page}>
      <PageHeader eyebrow="STAGE GATE" title={title} subtitle={reason} />
      <Alert type="warning" showIcon message={reason} action={actions} />
    </div>
  );
}
