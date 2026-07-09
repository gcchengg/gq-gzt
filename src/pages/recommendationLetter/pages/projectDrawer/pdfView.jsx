import React, { useLayoutEffect } from "react";
import PDFDom from "../PDFReview/PrintPDF/index";
import "./index.css";

const ValuationReportPage = ({
  infoData = {},
  setPdfUrl = () => {},
  title,
}) => {
  useLayoutEffect(() => {
    setPdfUrl({
      fileUrl: "",
      fileName: `${title || "上会汇报"}.pdf`,
      fileNameType: "pdf",
      fileType: "pdf",
      objectKey: "mock-pdf",
    });
  }, [setPdfUrl, title]);

  return (
    <div
      style={{ position: "absolute", zIndex: -1, opacity: 0, top: "-3000px" }}
    >
      <div className="valuation-report-page pdfPage">
        <PDFDom infoData={infoData} />
      </div>
    </div>
  );
};

export default ValuationReportPage;
