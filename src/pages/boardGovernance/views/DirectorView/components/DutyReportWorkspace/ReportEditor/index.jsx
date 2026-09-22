import { useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Button, Input, Select, Upload, message } from "antd";
import { PrinterOutlined, PlusOutlined } from "@ant-design/icons";
import {
  buildReportDraft,
  feedbackSection,
  monthlySections,
  sectionDays,
} from "./reportTemplate";
import styles from "./index.module.less";

function ReportContent({
  draft,
  monthly,
  update,
  updateCell,
  updateRows,
  readOnly = false,
}) {
  const sections = monthly ? monthlySections : [feedbackSection];
  const field = (key, label, multiline = false) => (
    <div className={styles.field} key={key}>
      <label>{label}</label>
      {readOnly ? (
        <div className={styles.value}>{draft[key] || "—"}</div>
      ) : multiline ? (
        <Input.TextArea
          aria-label={label}
          autoSize={{ minRows: 4, maxRows: 18 }}
          value={draft[key]}
          onChange={(event) => update(key, event.target.value)}
        />
      ) : (
        <Input
          aria-label={label}
          value={draft[key]}
          onChange={(event) => update(key, event.target.value)}
        />
      )}
    </div>
  );
  const totalDays = monthlySections.reduce(
    (sum, section) =>
      sum + (sectionDays(section, draft.tables[section.key]) || 0),
    0,
  );
  return (
    <article className={styles.paper} data-report-paper>
      <header>
        {readOnly ? (
          <h1>{draft.title}</h1>
        ) : (
          <Input
            className={styles.titleInput}
            aria-label="报告名称"
            value={draft.title}
            onChange={(event) => update("title", event.target.value)}
          />
        )}
        <p>
          {monthly ? "月度履职工作写实" : "工作报告"} · {draft.period}
        </p>
      </header>
      <div className={styles.metadata} data-report-meta>
        {field("directorName", monthly ? "姓名" : "报告人")}
        {field("company", "企业名称")}
        {field("period", "报告周期")}
        {field("reportDate", "报告日期")}
        {monthly ? (
          <>
            {field("identity", "董事身份")}
            {field("companyType", "企业类别")}
            <div className={styles.field}>
              <label>本月履职天数（天）</label>
              <strong>{totalDays}</strong>
            </div>
            {field("cumulativeDays", "年度累计履职天数（天）")}
          </>
        ) : (
          <div className={styles.field}>
            <label>报告类型</label>
            {readOnly ? (
              <div>{draft.category}</div>
            ) : (
              <Select
                aria-label="报告类型"
                value={draft.category}
                onChange={(value) => update("category", value)}
                options={["战略规划", "企业经营", "风险防控", "其它"].map(
                  (value) => ({ value }),
                )}
              />
            )}
          </div>
        )}
      </div>
      {!monthly ? (
        <>
          <section>
            <h2>一、背景</h2>
            {field("background", "相关背景信息（参考300—500字）", true)}
          </section>
          <section>
            <h2>二、当前情况</h2>
            {field(
              "currentSituation",
              "目前状态、存在问题、潜在风险及发展机会（参考500—800字）",
              true,
            )}
          </section>
          <section>
            <h2>三、意见建议</h2>
            {field(
              "recommendations",
              "具体、详细、可落地的意见建议（参考1000—1200字）",
              true,
            )}
          </section>
        </>
      ) : (
        <h2>本月履职情况</h2>
      )}
      {sections.map((section) => {
        const rows = draft.tables[section.key] || [];
        const days = sectionDays(section, rows);
        return (
          <section key={section.key}>
            <div className={styles.sectionHeader}>
              <h2>{section.title}</h2>
              {!readOnly && (
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() =>
                    updateRows(section.key, [
                      ...rows,
                      section.columns.map(() => ""),
                    ])
                  }
                >
                  新增记录
                </Button>
              )}
            </div>
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>序号</th>
                    {section.columns.map((column) => (
                      <th key={column}>{column}</th>
                    ))}
                    {!readOnly && <th>操作</th>}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      {section.columns.map((column, cellIndex) => (
                        <td key={column}>
                          {readOnly ? (
                            <div className={styles.value}>
                              {row[cellIndex] || "—"}
                            </div>
                          ) : (
                            <Input.TextArea
                              aria-label={`${section.title}第${index + 1}行${column}`}
                              autoSize={{ minRows: 2 }}
                              value={row[cellIndex]}
                              onChange={(event) =>
                                updateCell(
                                  section.key,
                                  index,
                                  cellIndex,
                                  event.target.value,
                                )
                              }
                            />
                          )}
                        </td>
                      ))}
                      {!readOnly && (
                        <td>
                          <Button
                            danger
                            type="link"
                            size="small"
                            onClick={() =>
                              updateRows(
                                section.key,
                                rows.filter(
                                  (_, rowIndex) => rowIndex !== index,
                                ),
                              )
                            }
                          >
                            删除
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {days !== null && (
              <p className={styles.subtotal}>履职天数小计：{days} 天</p>
            )}
          </section>
        );
      })}
      {monthly && (
        <section>
          <h2>其他说明事项</h2>
          {field("otherNotes", "其他说明", true)}
        </section>
      )}
      {draft.files?.length > 0 && (
        <section>
          <h2>报告附件</h2>
          {draft.files.map((name, index) => (
            <p key={index}>
              {index + 1}. {name}
            </p>
          ))}
        </section>
      )}
    </article>
  );
}

export default function ReportEditor({
  report,
  director,
  onSave,
  onReceive,
  onClose,
}) {
  const [draft, setDraft] = useState(() => buildReportDraft(report, director));
  const [files, setFiles] = useState(() =>
    (report.files || []).map((name, index) => ({
      uid: String(index),
      name,
      status: "done",
    })),
  );
  const monthly = report.reportType === "月度报告";
  const update = (key, value) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const updateRows = (key, rows) =>
    setDraft((current) => ({
      ...current,
      tables: { ...current.tables, [key]: rows },
    }));
  const updateCell = (key, rowIndex, cellIndex, value) =>
    setDraft((current) => ({
      ...current,
      tables: {
        ...current.tables,
        [key]: current.tables[key].map((row, index) =>
          index === rowIndex
            ? row.map((cell, column) => (column === cellIndex ? value : cell))
            : row,
        ),
      },
    }));
  const save = (submit) => {
    onSave(
      report.id,
      {
        title: draft.title,
        directorName: draft.directorName,
        company: draft.company,
        period: draft.period,
        templateData: draft,
        files: files.map((file) => file.name),
      },
      submit,
    );
    message.success(submit ? "履职报告已提交接收" : "履职报告已保存");
  };
  const print = () => {
    const popup = window.open("", "_blank");
    if (!popup) {
      message.warning("请允许浏览器弹出打印窗口后重试");
      return;
    }
    popup.onload = () => {
      popup.document.title = draft.title;
      popup.focus();
      popup.print();
    };
    const content = renderToStaticMarkup(
      <ReportContent
        draft={{ ...draft, files: files.map((file) => file.name) }}
        monthly={monthly}
        readOnly
      />,
    );
    popup.document
      .write(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>履职写实报告</title><style>
      @page{size:A4 ${monthly ? "landscape" : "portrait"};margin:14mm}body{font:12px/1.7 "Microsoft YaHei","PingFang SC",sans-serif;color:#111;margin:0}h1{text-align:center;font-size:24px}header p{text-align:center;color:#555}h2{font-size:17px;margin:22px 0 10px;break-after:avoid}label{display:block;color:#555;font-size:11px}[data-report-meta]{display:grid;grid-template-columns:repeat(${monthly ? 4 : 2},1fr);gap:12px;margin:20px 0}table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:10px}th,td{border:1px solid #aaa;padding:7px;vertical-align:top;overflow-wrap:anywhere;white-space:pre-wrap}th{background:#eef1f5}th:first-child{width:28px}thead{display:table-header-group}tr{break-inside:avoid}section>div{white-space:pre-wrap}p{white-space:pre-wrap}button{display:none}
      </style></head><body>${content}</body></html>`);
    popup.document.close();
    popup.document.title = draft.title;
  };
  return (
    <div className={styles.editor}>
      <p className={styles.hint}>
        按{monthly ? "月度写实表" : "季度工作报告模板"}
        生成的演示内容，可直接编辑；打印使用当前内容，无需先保存。
      </p>
      <ReportContent
        draft={draft}
        monthly={monthly}
        update={update}
        updateRows={updateRows}
        updateCell={updateCell}
      />
      <Upload
        multiple
        beforeUpload={() => false}
        fileList={files}
        onChange={({ fileList }) => setFiles(fileList)}
      >
        <Button>上传报告附件</Button>
      </Upload>
      <div className={styles.actions}>
        <Button onClick={onClose}>关闭</Button>
        <Button icon={<PrinterOutlined />} onClick={print}>
          打印 / 保存为 PDF
        </Button>
        <Button onClick={() => save(false)}>保存报告</Button>
        {report.status === "待完善" && (
          <Button type="primary" onClick={() => save(true)}>
            提交接收
          </Button>
        )}
        {report.status === "待接收" && (
          <Button
            type="primary"
            onClick={() => {
              save(false);
              onReceive(report.id);
              message.success("履职报告已接收并归档");
            }}
          >
            接收履职报告
          </Button>
        )}
      </div>
    </div>
  );
}
