import { Alert, Button, Empty, Select } from "antd";
import {
  buildMonthlyTrend,
  summarizeEvaluations,
} from "../../evaluationAnalytics";
import styles from "./index.module.less";

const rangeOptions = [
  { label: "近 3 个月", value: "3m" },
  { label: "近 6 个月", value: "6m" },
  { label: "近 12 个月", value: "12m" },
  { label: "本年度", value: "year" },
];

const CHART = { left: 8, right: 592, top: 8, bottom: 92 };

function display(value, suffix = "") {
  return value == null ? "--" : `${value}${suffix}`;
}

function chartPoint(length, index, value) {
  const span = Math.max(length - 1, 1);
  return {
    x: CHART.left + (index * (CHART.right - CHART.left)) / span,
    y: CHART.bottom - (value / 100) * (CHART.bottom - CHART.top),
  };
}

function lineSegments(series, key) {
  const segments = [];
  let current = [];
  series.forEach((item, index) => {
    if (item[key] == null) {
      if (current.length) segments.push(current.join(" "));
      current = [];
      return;
    }
    const point = chartPoint(series.length, index, item[key]);
    current.push(`${point.x},${point.y}`);
  });
  if (current.length) segments.push(current.join(" "));
  return segments;
}

function distributionPercents(records, summary) {
  const excellent = summary.excellentRate || 0;
  const good = records.length
    ? Math.round(
        (records.filter((item) => item.result === "良好").length /
          records.length) *
          1000,
      ) / 10
    : 0;
  const normal = Math.max(0, Math.round((100 - excellent - good) * 10) / 10);
  return { excellent, good, normal };
}

export default function EvaluationAnalytics({
  records,
  range,
  averageDelta,
  onRangeChange,
  onOpenRecords,
  error = false,
  onRetry,
}) {
  const summary = summarizeEvaluations(records);
  const trend = buildMonthlyTrend(records, range);
  const { excellent, good, normal } = distributionPercents(records, summary);

  if (error)
    return (
      <section className={styles.section}>
        <Alert
          type="error"
          showIcon
          message="评价数据加载失败"
          description="看板其他区域仍可正常使用。"
          action={<Button onClick={onRetry}>重新加载</Button>}
        />
      </section>
    );

  return (
    <section
      className={styles.section}
      aria-labelledby="evaluation-analytics-title"
    >
      <header className={styles.header}>
        <div>
          <h2 id="evaluation-analytics-title">评价与回溯</h2>
          <p>履约质量与观点准确度分开统计</p>
        </div>
        <div className={styles.actions}>
          <Select
            value={range}
            options={rangeOptions}
            onChange={onRangeChange}
            aria-label="评价统计时间范围"
          />
          {onOpenRecords ? (
            <Button type="link" onClick={onOpenRecords}>
              最近评价记录 ›
            </Button>
          ) : null}
        </div>
      </header>
      <div className={styles.metrics}>
        <article>
          <span>平均履约评分</span>
          <strong>{display(summary.averageScore)}</strong>
          <small>
            {averageDelta == null
              ? "暂无上期对比"
              : `较上一等长周期 ${averageDelta > 0 ? "+" : ""}${averageDelta}`}
          </small>
        </article>
        <article>
          <span>评价优秀率</span>
          <strong>{display(summary.excellentRate, "%")}</strong>
          <small>优秀 {summary.excellentCount} 人次</small>
        </article>
        <article className={styles.warning}>
          <span>待回溯项目</span>
          <strong>{summary.pendingRetrospectiveCount}</strong>
          <small>{summary.dueSoonCount} 项将在 7 日内到期</small>
        </article>
        <article>
          <span>观点命中率</span>
          <strong>{display(summary.hitRate, "%")}</strong>
          <small>已回溯 {summary.retrospectiveCompletedCount} 条</small>
        </article>
      </div>
      {records.length ? (
        <div className={styles.charts}>
          <div className={styles.trend}>
            <div className={styles.chartHead}>
              <h3>趋势</h3>
              <div className={styles.chartLegend}>
                <span>平均履约评分</span>
                <span>观点命中率</span>
              </div>
            </div>
            <div className={styles.plotWrap}>
              <div className={styles.yAxis} aria-hidden="true">
                <span>100</span>
                <span>50</span>
                <span>0</span>
              </div>
              <div className={styles.plot}>
                <svg
                  viewBox="0 0 600 100"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label="平均履约评分与观点命中率趋势图"
                >
                  <title>
                    平均履约评分（分）与观点命中率（%）按月趋势，无数据月份留空
                  </title>
                  {[0, 50, 100].map((value) => {
                    const y = chartPoint(2, 0, value).y;
                    return (
                      <line
                        key={value}
                        className={styles.gridLine}
                        x1={CHART.left}
                        x2={CHART.right}
                        y1={y}
                        y2={y}
                      />
                    );
                  })}
                  {lineSegments(trend, "averageScore").map((points) => (
                    <polyline
                      key={`score-${points}`}
                      className={styles.scoreLine}
                      points={points}
                    />
                  ))}
                  {lineSegments(trend, "hitRate").map((points) => (
                    <polyline
                      key={`hit-${points}`}
                      className={styles.hitLine}
                      points={points}
                    />
                  ))}
                  {trend.flatMap((item, index) =>
                    [
                      item.averageScore == null
                        ? null
                        : {
                            key: "score",
                            value: item.averageScore,
                            unit: "分",
                            className: styles.scorePoint,
                          },
                      item.hitRate == null
                        ? null
                        : {
                            key: "hit",
                            value: item.hitRate,
                            unit: "%",
                            className: styles.hitPoint,
                          },
                    ]
                      .filter(Boolean)
                      .map((point) => {
                        const position = chartPoint(
                          trend.length,
                          index,
                          point.value,
                        );
                        return (
                          <circle
                            key={`${item.key}-${point.key}`}
                            className={point.className}
                            cx={position.x}
                            cy={position.y}
                            r="3.5"
                          >
                            <title>{`${item.label}：${point.value}${point.unit}`}</title>
                          </circle>
                        );
                      }),
                  )}
                </svg>
                <div className={styles.months}>
                  {trend.map((item) => (
                    <span key={item.key}>{item.label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.distribution}>
            <div className={styles.chartHead}>
              <h3>评价分布</h3>
            </div>
            <div className={styles.distributionBody}>
              <div
                className={styles.donut}
                style={{
                  "--excellent": excellent,
                  "--good": excellent + good,
                }}
              >
                <b>{records.length}</b>
                <span>条评价</span>
              </div>
              <div className={styles.legend}>
                <span>优秀 {excellent}%</span>
                <span>良好 {good}%</span>
                <span>一般 {normal}%</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Empty description="所选时间范围暂无评价数据" />
      )}
    </section>
  );
}
