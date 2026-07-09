import React, { useRef, useState } from "react";

const PrintComponent = ({
  children,
  trigger = null,
  pageStyle = "",
  onBeforePrint = () => {},
  onAfterPrint = () => {},
  documentTitle = "Document",
}) => {
  const printRef = useRef();
  const [isPrinting, setIsPrinting] = useState(false);

  // 默认打印样式
  const defaultPageStyle = `
    @page {
      size: A4;
      margin: 10mm;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
        background: white !important;
      }
      .no-print {
        display: none !important;
      }
      .page-break {
        page-break-after: always;
      }
    }
  `;

  const handlePrint = () => {
    setIsPrinting(true);
    onBeforePrint();

    // 创建打印窗口
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setIsPrinting(false);
      onAfterPrint();
      return;
    }
    const printDocument = printWindow.document;
    let finished = false;
    const finishPrint = () => {
      if (finished) return;
      finished = true;
      setIsPrinting(false);
      onAfterPrint();
      if (!printWindow.closed) {
        printWindow.close();
      }
      window.focus();
    };
    printWindow.onafterprint = finishPrint;
    printWindow.addEventListener?.("afterprint", finishPrint);

    // 写入HTML结构
    printDocument.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${documentTitle}</title>
          <style>
            ${defaultPageStyle}
            ${pageStyle}
          </style>
        </head>
        <body>
          ${printRef.current.innerHTML}
        </body>
      </html>
    `);

    printDocument.close();

    // 确保内容加载完成后再打印
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      window.setTimeout(finishPrint, 300);
    };
  };

  return (
    <>
      {/* 自定义触发按钮或使用默认按钮 */}
      {trigger ? (
        trigger(handlePrint)
      ) : (
        <button
          onClick={handlePrint}
          disabled={isPrinting}
          style={{
            padding: "4px 12px",
            backgroundColor: isPrinting ? "#8fb7f5" : "#0D5FE9",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isPrinting ? "not-allowed" : "pointer",
            fontSize: "14px",
          }}
        >
          {isPrinting ? "处理中..." : "打印/另存为PDF"}
        </button>
      )}

      {/* 打印内容区域 */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>{children}</div>
      </div>
    </>
  );
};

export default PrintComponent;
