import assert from "node:assert/strict";
import fs from "node:fs";

const components = fs.readFileSync("src/components.js", "utf8");
for (const name of [
  "renderSkillFrame",
  "renderPromptInput",
  "renderProcessFlow",
  "renderResultPanel",
  "renderWarning",
  "renderCaption",
]) {
  assert.match(components, new RegExp(`export function ${name}\\(`));
}
console.log("scene component contract: PASS");
