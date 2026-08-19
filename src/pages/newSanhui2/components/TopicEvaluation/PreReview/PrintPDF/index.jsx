import { useMemo, useState } from "react";
import screenshot1 from "@/components/1.png";
import screenshot2 from "@/components/2.png";

const defaultFileList = [
  {
    id: "preview-image-1",
    fileName: "议题评估截图1.png",
    fileUrl: screenshot1,
    fileType: "png",
    checked: "1",
  },
  {
    id: "preview-image-2",
    fileName: "议题评估截图2.png",
    fileUrl: screenshot2,
    fileType: "png",
    checked: "1",
  },
];

const getScoreValue = (value) => {
  if (value && typeof value === "object") {
    return value.parsedValue ?? Number(value.source);
  }
  return value;
};

const preprocessTableData = (data) => {
  if (!Array.isArray(data) || data.length === 0) return [];

  const processedData = data.map((item) => ({
    ...item,
    assessResult: getScoreValue(item.assessResult),
    result: getScoreValue(item.result),
    mergeInfo: {
      factorLv3Name: { rowSpan: 1, isShow: false },
      factorLv2Name: { rowSpan: 1, isShow: false },
      assessElement: { rowSpan: 1, isShow: false },
    },
  }));

  ["factorLv3Name", "factorLv2Name", "assessElement"].forEach((field) => {
    let prevValue = null;

    for (let index = 0; index < processedData.length; index += 1) {
      const currentItem = processedData[index];
      const currentValue = currentItem?.sanhuiTopicModelFactorVo?.[field] || "";

      if (currentValue !== prevValue) {
        prevValue = currentValue;
        let rowSpan = 1;

        for (
          let nextIndex = index + 1;
          nextIndex < processedData.length;
          nextIndex += 1
        ) {
          const nextValue =
            processedData[nextIndex]?.sanhuiTopicModelFactorVo?.[field] || "";
          if (nextValue !== currentValue) break;
          rowSpan += 1;
        }

        currentItem.mergeInfo[field] = { rowSpan, isShow: true };

        for (
          let nextIndex = index + 1;
          nextIndex < index + rowSpan;
          nextIndex += 1
        ) {
          processedData[nextIndex].mergeInfo[field] = {
            rowSpan: 1,
            isShow: false,
          };
        }
      }
    }
  });

  return processedData;
};

const HtmlCell = ({ html }) => (
  <div dangerouslySetInnerHTML={{ __html: html || "" }} />
);

export default function PrintPDF({ infoData = {}, tableData = [] }) {
  const [fileList] = useState(defaultFileList);
  const processedTableData = useMemo(
    () => preprocessTableData(tableData),
    [tableData],
  );

  const styles = {
    huiyiStyle: {
      display: "flex",
      gap: "4px",
      flexDirection: "column",
      alignItems: "center",
    },
    department: {
      fontSize: "20px",
      color: "#6c757d",
      fontWeight: 500,
      position: "absolute",
      top: "20px",
      width: "100%",
      padding: 0,
      textAlign: "right",
      right: "0",
    },
    evenRow: {
      backgroundColor: "#F9FBFF",
    },
    imgList: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    imgItem: {
      border: "1px solid #dee2e6",
      padding: "10px",
      backgroundColor: "#f5f5f5",
      borderRadius: "4px",
    },
    img: {
      maxWidth: "max-content",
      maxHeight: "177mm",
      width: "100%",
      pageBreakInside: "avoid",
    },
    circle: {
      width: "16px",
      height: "16px",
      borderRadius: "50%",
      display: "inline-block",
    },
    green2: { backgroundColor: "green" },
    yellow2: { backgroundColor: "yellow" },
    red2: { backgroundColor: "red" },
    blue2: { backgroundColor: "blue" },
  };

  const pageStyles = {
    fontFamily:
      '"阿里巴巴普惠体 3.0", "KaiLight", "deja-sans", "cjk", sans-serif',
    fontSize: "16px",
    lineHeight: 1.6,
    color: "#212529",
    backgroundColor: "#fff",
    margin: 0,
    padding: 0,
    maxWidth: "293mm",
  };

  const thStyles = {
    border: "1px solid #dee2e6",
    padding: 0,
    backgroundColor: "#3498db",
    color: "#fff",
    fontWeight: 600,
    textAlign: "center",
    verticalAlign: "middle",
  };

  const tdStyles = {
    border: "1px solid #dee2e6",
    padding: 0,
    verticalAlign: "top",
    whiteSpace: "normal",
    wordWrap: "break-word",
    overflowWrap: "break-word",
  };

  const motionTitleStyles = {
    fontSize: "1.1em",
    margin: 0,
    pageBreakBefore: "always",
    color: "#2980b9",
  };

  const tableStyles = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 0,
    fontSize: "10.5px",
    tableLayout: "auto",
    wordBreak: "break-word",
    pageBreakInside: "avoid",
  };

  const textCellStyles = {
    textAlign: "left",
    paddingLeft: "2px",
    fontSize: "10.3px",
  };

  const columns = [
    {
      title: "序号",
      render: (_, __, index) => index + 1,
    },
    {
      title: "一级维度",
      field: "factorLv3Name",
      render: (_, record) => record.sanhuiTopicModelFactorVo?.factorLv3Name,
    },
    {
      title: "二级维度",
      field: "factorLv2Name",
      render: (_, record) => record.sanhuiTopicModelFactorVo?.factorLv2Name,
    },
    {
      title: "评价要素",
      field: "assessElement",
      render: (_, record) => record.sanhuiTopicModelFactorVo?.assessElement,
    },
    {
      title: "权重",
      render: (_, record) =>
        record.sanhuiTopicModelFactorVo?.factorType === "2"
          ? "/"
          : `${record.sanhuiTopicModelFactorVo?.weight || ""}%`,
    },
    {
      title: "评价标准",
      render: (_, record) => (
        <HtmlCell html={record.sanhuiTopicModelFactorVo?.criterion} />
      ),
    },
    {
      title: "执行情况",
      render: (_, record) => <HtmlCell html={record?.execDetail} />,
    },
    {
      title: "评价规则",
      render: (_, record) => (
        <HtmlCell html={record.sanhuiTopicModelFactorVo?.assessRule} />
      ),
    },
    {
      title: "评价结果(分)",
      render: (_, record) => {
        if (record.sanhuiTopicModelFactorVo?.factorType === "2") {
          return Number(record.assessResult) === 100 ? "通过" : "不通过";
        }
        return record.sanhuiTopicModelFactorVo?.excludeAble === "1" &&
          record.excludeFlag === "1"
          ? "/"
          : record.assessResult;
      },
    },
    {
      title: "异常提示",
      render: (_, record) => {
        let colorKey = record.ligh;
        if (
          record.sanhuiTopicModelFactorVo?.excludeAble === "1" &&
          record.excludeFlag === "1"
        ) {
          colorKey = "green2";
        }
        return (
          <div
            style={{ ...styles.circle, ...(styles[colorKey] || styles.green2) }}
          />
        );
      },
    },
  ];

  const hasDisqualified = processedTableData.some(
    (item) =>
      item.sanhuiTopicModelFactorVo?.factorType === "2" &&
      Number(item.assessResult) === 0,
  );
  const hasValidFactors = processedTableData.some(
    (item) => item.sanhuiTopicModelFactorVo?.factorType === "1",
  );

  const total =
    !hasDisqualified && hasValidFactors
      ? Number(
          processedTableData
            .filter((item) => item.sanhuiTopicModelFactorVo?.factorType !== "2")
            .reduce(
              (pre, cur) =>
                pre +
                (Number(cur.sanhuiTopicModelFactorVo?.weight || 0) *
                  (cur.excludeFlag === "1"
                    ? 0
                    : Number(cur.assessResult || 0))) /
                  100,
              0,
            )
            .toFixed(2),
        )
      : 0;

  const finalResult = hasDisqualified
    ? "不通过"
    : !hasValidFactors
      ? "通过"
      : total;

  return (
    <div style={pageStyles}>
      <style>{`
        @page {
          size: a4 landscape;
          margin: 0.5mm 2mm;
        }
        p, h2, h3, tr {
          break-inside: avoid;
          page-break-inside: avoid;
        }
      `}</style>

      <div>
        <h2 style={motionTitleStyles}>{infoData.title}</h2>
        {fileList.length > 0 ? (
          <div style={styles.imgList}>
            {fileList.map((img) => (
              <div style={styles.imgItem} key={img.id}>
                <img style={styles.img} src={img.fileUrl} alt={img.fileName} />
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{ width: "100%", margin: "20px auto", textAlign: "center" }}
          >
            暂无图片
          </div>
        )}

        {processedTableData.length > 0 ? (
          <table style={tableStyles}>
            <colgroup>
              <col style={{ width: "2%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "4%" }} />
              <col />
              <col style={{ width: "3%" }} />
              <col />
              <col />
              <col />
              <col style={{ width: "5%" }} />
              <col style={{ width: "3%" }} />
            </colgroup>
            <thead>
              <tr>
                {columns.map((item) => (
                  <th key={item.title} style={thStyles}>
                    {item.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processedTableData.map((item, index) => (
                <tr
                  key={item.id || index}
                  style={index % 2 === 0 ? styles.evenRow : null}
                >
                  <td
                    style={{
                      ...tdStyles,
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    {index + 1}
                  </td>

                  {item.mergeInfo?.factorLv3Name?.isShow ? (
                    <td
                      style={{
                        ...tdStyles,
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                      rowSpan={item.mergeInfo.factorLv3Name.rowSpan}
                    >
                      {columns[1].render(null, item)}
                    </td>
                  ) : null}

                  {item.mergeInfo?.factorLv2Name?.isShow ? (
                    <td
                      style={{
                        ...tdStyles,
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                      rowSpan={item.mergeInfo.factorLv2Name.rowSpan}
                    >
                      {columns[2].render(null, item)}
                    </td>
                  ) : null}

                  {item.mergeInfo?.assessElement?.isShow ? (
                    <td
                      style={{
                        ...tdStyles,
                        textAlign: "left",
                        paddingLeft: "8px",
                      }}
                      rowSpan={item.mergeInfo.assessElement.rowSpan}
                    >
                      {columns[3].render(null, item)}
                    </td>
                  ) : null}

                  <td
                    style={{
                      ...tdStyles,
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    {columns[4].render(null, item)}
                  </td>
                  <td style={{ ...tdStyles, ...textCellStyles }}>
                    {columns[5].render(null, item)}
                  </td>
                  <td style={{ ...tdStyles, ...textCellStyles }}>
                    {columns[6].render(null, item)}
                  </td>
                  <td style={{ ...tdStyles, ...textCellStyles }}>
                    {columns[7].render(null, item)}
                  </td>
                  <td
                    style={{
                      ...tdStyles,
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    {columns[8].render(null, item)}
                  </td>
                  <td
                    style={{
                      ...tdStyles,
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    {columns[9].render(null, item)}
                  </td>
                </tr>
              ))}

              <tr>
                <td
                  style={{
                    ...tdStyles,
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                  colSpan={3}
                >
                  综合评价得分
                </td>
                <td
                  style={{
                    ...tdStyles,
                    fontSize: "0.9em",
                    textAlign: "left",
                    paddingLeft: "8px",
                  }}
                  colSpan={5}
                >
                  1、得分≥80分，议题通过；2、80分&gt;得分≥60，议题通过，但要提出管理意见或提示项；3、得分&lt;60分，不通过；4、合规性维度任意一项不通过，议题不通过
                </td>
                <td
                  style={{
                    ...tdStyles,
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {finalResult}
                </td>
                <td
                  style={{
                    ...tdStyles,
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                />
              </tr>
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
}
