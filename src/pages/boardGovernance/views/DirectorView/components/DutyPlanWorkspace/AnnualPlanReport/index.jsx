import styles from "./index.module.less";

function CategoryRows({ category, items }) {
  const rows = items.length
    ? items
    : [{ seq: 1, content: "", date: "", target: "" }];
  const displayRows = [
    ...rows,
    { seq: "...", content: "", date: "", target: "" },
  ];
  return displayRows.map((row, index) => (
    <tr key={`${category}-${row.seq}-${index}`}>
      {index === 0 ? (
        <th rowSpan={displayRows.length} className={styles.categoryCell}>
          {category}
        </th>
      ) : null}
      <td className={styles.seqCell}>{row.seq}</td>
      <td>{row.content}</td>
      <td className={styles.dateCell}>{row.date}</td>
      <td>{row.target}</td>
    </tr>
  ));
}

export default function AnnualPlanReport({ report, paperRef }) {
  return (
    <div className={styles.stack} ref={paperRef}>
      {report.pages.map((page) => (
        <article key={page.company} className={styles.paper}>
          <h1>{report.title}</h1>
          <table className={styles.sheet}>
            <colgroup>
              <col className={styles.colCategory} />
              <col className={styles.colSeq} />
              <col className={styles.colContent} />
              <col className={styles.colDate} />
              <col className={styles.colTarget} />
            </colgroup>
            <tbody>
              <tr className={styles.metaRow}>
                <th>姓名</th>
                <td>{report.directorName}</td>
                <th>任职企业</th>
                <td colSpan={2}>{page.company}</td>
              </tr>
              <tr className={styles.metaRow}>
                <th>履职年度</th>
                <td>{report.year}</td>
                <th>履职周期</th>
                <td colSpan={2}>{report.cycle}</td>
              </tr>
              <tr>
                <th colSpan={5} className={styles.sectionTitle}>
                  本年度重点工作计划
                </th>
              </tr>
              <tr className={styles.headRow}>
                <th>工作类别</th>
                <th>序号</th>
                <th>工作内容</th>
                <th>计划开展时间</th>
                <th>预期达成目标</th>
              </tr>
              {page.categories.map((group) => (
                <CategoryRows
                  key={group.category}
                  category={group.category}
                  items={group.items}
                />
              ))}
              <tr>
                <td colSpan={5} className={styles.notes}>
                  {report.notes}
                </td>
              </tr>
            </tbody>
          </table>
        </article>
      ))}
    </div>
  );
}
