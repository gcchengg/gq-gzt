import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Script } from "node:vm";
import { createHash } from "node:crypto";

const here = dirname(fileURLToPath(import.meta.url));
const file = join(
  here,
  "移动端投资合作服务平台_v4_专家人才库_单文件分享版.html",
);
const html = readFileSync(file, "utf8");

test("original v3 is unchanged", () => {
  const source = readFileSync(
    join(here, "移动端投资合作服务平台_v3_2026-08-31_19-02_单文件分享版.html"),
  );
  assert.equal(
    createHash("sha256").update(source).digest("hex"),
    "cdbbfd7eb90faac2f43704ff758c4e8a41852034a1312dc10dce0773250399a0",
  );
});

test("all inline scripts parse without syntax errors", () => {
  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
  assert.ok(scripts.length > 0);
  scripts.forEach(
    (match, index) => new Script(match[1], { filename: `inline-${index}.js` }),
  );
});

test("keeps the five existing bottom navigation entries", () => {
  const labels = ["投资布局", "产业协同", "股权小智", "社区论坛", "个人中心"];
  for (const label of labels)
    assert.match(html, new RegExp(`data-nav="${label}"`));
});

test("defines expert identity and task state contracts", () => {
  assert.match(html, /const EXPERT_IDENTITY_STATUS/);
  assert.match(html, /"unbound"[\s\S]*"active"[\s\S]*"exited"/);
  assert.match(html, /const EXPERT_TASK_STATUS/);
  assert.match(html, /"invited"[\s\S]*"delivery_pending"[\s\S]*"completed"/);
  assert.match(html, /const expertState/);
});

test("expert personal center is limited to decisions and records", () => {
  const center =
    html.match(/function renderUserCenter\(\)\{([\s\S]*?)\n  \}/)?.[1] ?? "";
  assert.match(center, /处理入库邀请/);
  assert.match(center, /处理调用申请/);
  assert.match(center, /查看入库与调用记录/);
  assert.match(html, /acceptCall/);
  assert.match(html, /rejectCall/);
  assert.doesNotMatch(center, /绑定邀请 \/ 完善资料/);
  assert.doesNotMatch(center, /继续填写教育经历、专业能力等资料/);
  assert.doesNotMatch(center, /我的专家档案/);
  assert.doesNotMatch(center, /可服务时间/);
});

test("mobile enrollment invitation exposes only the final business states", () => {
  assert.match(
    html,
    /const labels=\{pending:'待处理',accepted:'已接受，待完成入库',rejected:'已拒绝',completed:'已完成入库'\}/,
  );
  assert.match(html, /mobileInviteStatus/);
  assert.doesNotMatch(html, /资料审核中/);
  assert.doesNotMatch(html, /待签署聘书/);
  assert.doesNotMatch(html, /继续填写教育经历、专业能力等资料/);
});
