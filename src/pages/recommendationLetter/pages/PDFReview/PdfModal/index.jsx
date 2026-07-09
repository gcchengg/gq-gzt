import React, { useState } from "react";
import { Drawer, Button } from "antd";
import PrintComponent from "../Print/index";
import PrintPDF from "../PrintPDF/index";
import "./index.css";

export default function PdfModal({
  open,
  setOpen,
  title,
  infoData = {},
  labelTitle,
}) {
  const customPrintStyle = `
    @media print {
      .invoice-header {
        color: #333;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
        margin-bottom: 20px;
      }
      img {
          max-width: 100%;
          height: auto;
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
  return (
    <div>
      <Drawer
        title={title}
        width={"100%"}
        open={open}
        className="pdf-modal-shanhui"
        onClose={() => {
          setOpen(false);
        }}
        extra={
          <PrintComponent
            pageStyle={customPrintStyle}
            onBeforePrint={() => console.log("开始打印...")}
            onAfterPrint={() => console.log("打印完成!")}
          >
            <PrintPDF infoData={infoData} title={labelTitle} />
          </PrintComponent>
        }
      >
        <div
          style={{ display: "flex", justifyContent: "center", width: "100%" }}
        >
          <PrintPDF infoData={infoData} title={labelTitle} />
        </div>
      </Drawer>
    </div>
  );
}
