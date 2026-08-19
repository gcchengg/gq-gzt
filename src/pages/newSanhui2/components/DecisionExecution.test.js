import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("./DecisionExecution.jsx", import.meta.url),
  "utf8",
);
const mockSource = await readFile(
  new URL("../mockApi.js", import.meta.url),
  "utf8",
);

test("adds conditional investment committee decision columns and topic tag", () => {
  assert.match(source, /title: "股权投委会决策结果"/);
  assert.match(source, /row\.topicType === "1"/);
  assert.match(source, /<Tag color="gold">股权投委会<\/Tag>/);
  assert.match(source, /investmentBodPassFlag/);
  assert.match(source, /investmentBosPassFlag/);
  assert.match(source, /investmentShPassFlag/);
  assert.match(source, /return "--"/);
});

test("keeps consistency limited to FAW Equity and three-meeting decisions", () => {
  const consistencyStart = source.indexOf("const getDecisionConsistency");
  const consistencySource = source.slice(
    consistencyStart,
    consistencyStart + 700,
  );

  assert.match(consistencySource, /getOfficeDecision/);
  assert.match(consistencySource, /getThreeDecision/);
  assert.doesNotMatch(consistencySource, /getInvestmentDecision/);
});

test("provides investment committee mock values only for topicType 1", () => {
  assert.match(mockSource, /topicType: "1"/);
  assert.match(mockSource, /topicType: "0"/);
  assert.match(mockSource, /investmentBodPassFlag/);
  assert.match(mockSource, /investmentBosPassFlag/);
  assert.match(mockSource, /investmentShPassFlag/);
});
