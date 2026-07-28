import fs from "node:fs";

const file =
  "/Users/guocc/Documents/guquan/files/gq-gzt/需求/综合页面PRD/股权云工作台综合功能PRD_20260727.md";

let markdown = fs.readFileSync(file, "utf8");
markdown = markdown
  .replace(/^##### (.+)$/gm, "**$1**")
  .replace(/^#### (.+)$/gm, "**$1**")
  .replaceAll("**", "")
  .replaceAll("`", "");

fs.writeFileSync(file, markdown, "utf8");
