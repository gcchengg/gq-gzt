import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const sourcePath = new URL(
  "../src/pages/companyReview/list.json",
  import.meta.url,
);
const source = JSON.parse(await fs.readFile(sourcePath, "utf8"));
const companies = (source.data?.list || [])
  .map((item) => String(item.companyName || "").trim())
  .filter(Boolean);

const outputDir = new URL(
  "../outputs/019fa7f6-ef01-7712-b56e-52bb5290b983/",
  import.meta.url,
);
await fs.mkdir(outputDir, { recursive: true });

const workbook = Workbook.create();
const inputSheet = workbook.worksheets.add("信息补充");
const guideSheet = workbook.worksheets.add("填写说明");

const headers = [
  "序号",
  "公司名称",
  "是否上市",
  "上市交易所",
  "股票代码",
  "法定代表人",
  "战略定位",
  "经管层席位总数",
  "经管层中一汽方席位数",
];
const rows = companies.map((name, index) => [
  index + 1,
  name,
  "",
  "",
  "",
  "",
  "",
  "",
  "",
]);
const lastRow = 4 + rows.length;

inputSheet.showGridLines = false;
inputSheet.getRange("A1:I1").merge();
inputSheet.getRange("A1").values = [["参股公司缺失信息补充表"]];
inputSheet.getRange("A2:I2").merge();
inputSheet.getRange("A2").values = [
  [
    `共 ${companies.length} 家公司。黄色单元格由业务填写；未上市公司上市交易所、股票代码填写“不适用”。`,
  ],
];
inputSheet.getRange("A4:I4").values = [headers];
inputSheet.getRange(`A5:I${lastRow}`).values = rows;

inputSheet.getRange("A1:I1").format = {
  fill: "#C00000",
  font: { bold: true, color: "#FFFFFF", size: 16 },
  horizontalAlignment: "center",
  verticalAlignment: "center",
};
inputSheet.getRange("A2:I2").format = {
  fill: "#FCE4D6",
  font: { color: "#7F0000", italic: true },
  horizontalAlignment: "left",
  verticalAlignment: "center",
};
inputSheet.getRange("A4:I4").format = {
  fill: "#7F0000",
  font: { bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "all", style: "thin", color: "#D9A6A6" },
};
inputSheet.getRange(`A5:B${lastRow}`).format = {
  fill: "#F2F2F2",
  font: { color: "#404040" },
  verticalAlignment: "center",
  borders: {
    insideHorizontal: { style: "thin", color: "#E7E6E6" },
    bottom: { style: "thin", color: "#D9D9D9" },
  },
};
inputSheet.getRange(`C5:I${lastRow}`).format = {
  fill: "#FFF2CC",
  verticalAlignment: "center",
  wrapText: true,
  borders: {
    insideHorizontal: { style: "thin", color: "#E7E6E6" },
    bottom: { style: "thin", color: "#D9D9D9" },
  },
};
inputSheet.getRange(`A5:A${lastRow}`).format = {
  horizontalAlignment: "center",
  numberFormat: "0",
};
inputSheet.getRange(`C5:F${lastRow}`).format.horizontalAlignment = "center";
inputSheet.getRange(`H5:I${lastRow}`).format = {
  fill: "#FFF2CC",
  horizontalAlignment: "center",
  verticalAlignment: "center",
  numberFormat: "0",
  borders: {
    insideHorizontal: { style: "thin", color: "#E7E6E6" },
    bottom: { style: "thin", color: "#D9D9D9" },
  },
};
inputSheet.getRange("A1:I1").format.rowHeight = 30;
inputSheet.getRange("A2:I2").format.rowHeight = 25;
inputSheet.getRange("A4:I4").format.rowHeight = 34;
inputSheet.getRange(`A5:I${lastRow}`).format.rowHeight = 28;
inputSheet.getRange("A:A").format.columnWidth = 7;
inputSheet.getRange("B:B").format.columnWidth = 34;
inputSheet.getRange("C:C").format.columnWidth = 12;
inputSheet.getRange("D:D").format.columnWidth = 20;
inputSheet.getRange("E:E").format.columnWidth = 17;
inputSheet.getRange("F:F").format.columnWidth = 16;
inputSheet.getRange("G:G").format.columnWidth = 52;
inputSheet.getRange("H:I").format.columnWidth = 18;

inputSheet.getRange(`C5:C${lastRow}`).dataValidation = {
  rule: { type: "list", values: ["是", "否"] },
};
inputSheet.getRange(`D5:D${lastRow}`).dataValidation = {
  rule: {
    type: "list",
    values: [
      "上海证券交易所",
      "深圳证券交易所",
      "北京证券交易所",
      "香港交易所",
      "其他",
      "不适用",
    ],
  },
};
inputSheet.getRange(`H5:I${lastRow}`).dataValidation = {
  rule: {
    type: "whole",
    operator: "between",
    formula1: 0,
    formula2: 100,
  },
};

const table = inputSheet.tables.add(
  `A4:I${lastRow}`,
  true,
  "CompanySupplementTable",
);
table.style = "TableStyleMedium2";
table.showBandedColumns = false;
table.showFilterButton = true;
inputSheet.freezePanes.freezeRows(4);
inputSheet.freezePanes.freezeColumns(2);

guideSheet.showGridLines = false;
guideSheet.getRange("A1:D1").merge();
guideSheet.getRange("A1").values = [["填写说明"]];
guideSheet.getRange("A3:D3").values = [
  ["字段名称", "填写要求", "示例", "页面展示用途"],
];
guideSheet.getRange("A4:D12").values = [
  ["序号", "已生成，无需修改", "1", "辅助核对"],
  [
    "公司名称",
    "来源于 companyReview/list.json，无需修改",
    "长春一东离合器股份有限公司",
    "企业名称",
  ],
  ["是否上市", "从下拉选“是”或“否”", "是", "判断是否生成上市公司文案"],
  [
    "上市交易所",
    "选择交易所；未上市选“不适用”",
    "上海证券交易所",
    "生成“沪交所上市公司”",
  ],
  [
    "股票代码",
    "填写含市场后缀的完整代码；未上市填“不适用”",
    "600148.SH",
    "生成“代码600148.SH”",
  ],
  [
    "法定代表人",
    "填写当前工商登记法定代表人姓名",
    "孟庆洪",
    "生成“法定代表人孟庆洪”",
  ],
  [
    "战略定位",
    "概括该公司在集团产业链或投资组合中的定位",
    "集团公司商用车传动系统零部件的重要供应方",
    "基础底数、产业协同",
  ],
  [
    "经管层席位总数",
    "填写非负整数；没有填0；未知留空",
    "6",
    "生成“经管层共6席”",
  ],
  [
    "经管层中一汽方席位数",
    "填写非负整数，且不应超过经管层席位总数",
    "1",
    "生成“其中一汽方1席”",
  ],
];
guideSheet.getRange("A14:D14").merge();
guideSheet.getRange("A14").values = [
  ["数据来源：src/pages/companyReview/list.json；生成日期：2026-07-28"],
];
guideSheet.getRange("A1:D1").format = {
  fill: "#C00000",
  font: { bold: true, color: "#FFFFFF", size: 16 },
  horizontalAlignment: "center",
  verticalAlignment: "center",
};
guideSheet.getRange("A3:D3").format = {
  fill: "#7F0000",
  font: { bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "all", style: "thin", color: "#D9A6A6" },
};
guideSheet.getRange("A4:D12").format = {
  verticalAlignment: "center",
  wrapText: true,
  borders: {
    insideHorizontal: { style: "thin", color: "#E7E6E6" },
    bottom: { style: "thin", color: "#D9D9D9" },
  },
};
guideSheet.getRange("A4:A12").format = {
  fill: "#FCE4D6",
  font: { bold: true, color: "#7F0000" },
  verticalAlignment: "center",
};
guideSheet.getRange("A14:D14").format = {
  fill: "#F2F2F2",
  font: { color: "#666666", italic: true },
  verticalAlignment: "center",
};
guideSheet.getRange("A1:D1").format.rowHeight = 30;
guideSheet.getRange("A3:D3").format.rowHeight = 28;
guideSheet.getRange("A4:D12").format.rowHeight = 42;
guideSheet.getRange("A14:D14").format.rowHeight = 24;
guideSheet.getRange("A:A").format.columnWidth = 24;
guideSheet.getRange("B:B").format.columnWidth = 46;
guideSheet.getRange("C:C").format.columnWidth = 34;
guideSheet.getRange("D:D").format.columnWidth = 31;
guideSheet.freezePanes.freezeRows(3);

const inputPreview = await workbook.render({
  sheetName: "信息补充",
  range: `A1:I${Math.min(lastRow, 16)}`,
  scale: 1.3,
  format: "png",
});
await fs.writeFile(
  new URL("信息补充预览.png", outputDir),
  new Uint8Array(await inputPreview.arrayBuffer()),
);
const guidePreview = await workbook.render({
  sheetName: "填写说明",
  range: "A1:D14",
  scale: 1.3,
  format: "png",
});
await fs.writeFile(
  new URL("填写说明预览.png", outputDir),
  new Uint8Array(await guidePreview.arrayBuffer()),
);

const inspect = await workbook.inspect({
  kind: "table",
  range: `信息补充!A1:I${Math.min(lastRow, 10)}`,
  include: "values,formulas",
  tableMaxRows: 10,
  tableMaxCols: 9,
});
console.log(inspect.ndjson);
const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

const output = await SpreadsheetFile.exportXlsx(workbook);
const outputPath = new URL("参股公司缺失信息补充表.xlsx", outputDir);
await output.save(decodeURIComponent(outputPath.pathname));
console.log(outputPath.pathname);
