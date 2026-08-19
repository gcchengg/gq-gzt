import { Drawer } from "antd";
import PrintComponent from "./Print";
import PrintPDF from "./PrintPDF";

export default function PreReview({
  open,
  setOpen,
  title,
  infoData = {},
  topicId,
  mgmtId,
  tableData = [],
  type,
}) {
  const customPrintStyle = `
    @media print {
      .invoice-header {
        color: #333;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
        margin-bottom: 20px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      th {
        background-color: #f2f2f2;
      }
    }
  `;

  const previewContent = (
    <PrintPDF
      infoData={infoData}
      type={type}
      tableData={tableData}
      mgmtId={mgmtId}
      topicId={topicId}
    />
  );

  return (
    <Drawer
      title={title}
      width="85%"
      open={open}
      onClose={() => setOpen(false)}
      destroyOnHidden
      extra={
        <PrintComponent
          pageStyle={customPrintStyle}
          onBeforePrint={() => console.log("开始打印...")}
          onAfterPrint={() => console.log("打印完成!")}
        >
          {previewContent}
        </PrintComponent>
      }
    >
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        {previewContent}
      </div>
    </Drawer>
  );
}
