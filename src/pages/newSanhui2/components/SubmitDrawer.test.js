import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("./SubmitDrawer.jsx", import.meta.url),
  "utf8",
);

test("shows topicType in add and edit topic drawers with yes as the default", () => {
  assert.match(source, /label="是否为股权投委会" name="topicType"/);
  assert.match(source, /topicType: record\?\.topicType \|\| "1"/);
  assert.match(source, /topicType: "1"/);
  assert.match(source, /\{ label: "是", value: "1" \}/);
  assert.match(source, /\{ label: "否", value: "0" \}/);

  const approvalLevelIndex = source.indexOf(
    'label="审批层级" name="reviewLevel2"',
  );
  const topicTypeIndex = source.indexOf(
    'label="是否为股权投委会" name="topicType"',
  );
  assert.ok(approvalLevelIndex >= 0);
  assert.ok(topicTypeIndex > approvalLevelIndex);
});
