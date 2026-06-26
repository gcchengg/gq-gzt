import { useRef, useState } from "react";

export default function PrintComponent({
  children,
  trigger = null,
  pageStyle = "",
  onBeforePrint = () => {},
  onAfterPrint = () => {},
  documentTitle = "Document",
}) {
  const printRef = useRef(null);
  const [isPrinting, setIsPrinting] = useState(false);

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
    if (!printRef.current || isPrinting) return;
    setIsPrinting(true);
    onBeforePrint();

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setIsPrinting(false);
      return;
    }

    const printDocument = printWindow.document;
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

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => {
        setIsPrinting(false);
        onAfterPrint();
        printWindow.close();
      };
    };
  };

  return (
    <>
      {trigger ? (
        trigger(handlePrint)
      ) : (
        <button
          disabled={isPrinting}
          onClick={handlePrint}
          style={{
            padding: "4px 12px",
            backgroundColor: "#0D5FE9",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isPrinting ? "not-allowed" : "pointer",
            fontSize: "14px",
          }}
          type="button"
        >
          打印/另存为PDF
        </button>
      )}

      <div style={{ display: "none" }}>
        <div ref={printRef}>{children}</div>
      </div>
    </>
  );
}
