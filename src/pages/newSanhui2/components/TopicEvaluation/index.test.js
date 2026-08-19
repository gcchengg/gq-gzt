import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("./index.jsx", import.meta.url), "utf8");

test("defaults the equity investment committee field to yes and restores saved values", () => {
  assert.match(source, /topicType: record\?\.topicType \|\| "1"/);
  assert.match(source, /topicType: "1"/);
});

test("renders the equity investment committee radio below the approval level", () => {
  const approvalLevelIndex = source.indexOf('name="approvalLevel"');
  const topicTypeIndex = source.indexOf('name="topicType"');

  assert.notEqual(approvalLevelIndex, -1);
  assert.notEqual(topicTypeIndex, -1);
  assert.ok(topicTypeIndex > approvalLevelIndex);

  const topicTypeSource = source.slice(topicTypeIndex, topicTypeIndex + 500);
  assert.match(topicTypeSource, /label: "是", value: "1"/);
  assert.match(topicTypeSource, /label: "否", value: "0"/);
});
