import styles from "./index.module.less";

const dangerWords = ["逾期", "退回", "异常", "缺口", "过期"];
const successWords = ["完成", "有效", "确认", "通过", "最终版", "归档"];
const warningWords = ["临期", "待补充", "待提交", "偏差"];

export default function StatusPill({ children }) {
  const text = String(children ?? "-");
  const tone = dangerWords.some((word) => text.includes(word))
    ? "danger"
    : successWords.some((word) => text.includes(word))
      ? "success"
      : warningWords.some((word) => text.includes(word))
        ? "warning"
        : text.includes("待") || text.includes("中")
          ? "processing"
          : "neutral";
  return (
    <span className={`${styles.pill} ${styles[tone]}`}>
      <i />
      {text}
    </span>
  );
}
