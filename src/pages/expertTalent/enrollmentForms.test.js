import assert from "node:assert/strict";
import test from "node:test";
import {
  applicationFromProfile,
  applicationFormComplete,
  draftProfile,
  profileRequiredComplete,
} from "./enrollmentForms.js";

test("draft profile prefills identity fields and defaults id type to 身份证", () => {
  const draft = draftProfile({
    name: "张明",
    gender: "男",
    phone: "13800005208",
    company: "示例研究机构",
    title: "首席研究员",
  });
  assert.equal(draft.name, "张明");
  assert.equal(draft.gender, "男");
  assert.equal(draft.phone, "13800005208");
  assert.equal(draft.idType, "身份证");
  assert.ok(draft.birth);
  assert.ok(draft.idNo);
  assert.equal(draft.company, "示例研究机构");
  assert.equal(draft.position, "首席研究员");
});

test("profile is complete when only required identity fields are filled", () => {
  assert.equal(
    profileRequiredComplete({
      name: "张明",
      gender: "男",
      birth: "1978-03-16",
      idNo: "22010219780316001X",
      phone: "13800005208",
    }),
    true,
  );
  assert.equal(
    profileRequiredComplete({
      name: "张明",
      gender: "男",
      birth: "1978-03-16",
      idNo: "22010219780316001X",
    }),
    false,
  );
});

test("application form copies identity and resume sections from the profile", () => {
  const form = applicationFromProfile({
    name: "许文博",
    gender: "男",
    phone: "13800005209",
    company: "机器人研究院（演示）",
    title: "副院长",
    profile: {
      name: "许文博",
      gender: "男",
      birth: "1978-03-16",
      idNo: "22010219780316001X",
      phone: "13800005209",
      email: "xuwenbo@example.com",
      company: "机器人研究院（演示）",
      position: "副院长",
      education: "博士 / 示例大学 / 机械电子工程",
      educationPeriod: "1998—2007，本硕博阶段",
      experience: "2015年至今：机器人研究院副院长",
      certificates: "研究员职称证书",
      domain: "机器人 / 具身智能",
      keywords: "机器人本体、运动控制",
    },
  });
  assert.equal(form.name, "许文博");
  assert.equal(form.gender, "男");
  assert.equal(form.birth, "1978-03-16");
  assert.equal(form.idNo, "22010219780316001X");
  assert.equal(form.company, "机器人研究院（演示）");
  assert.equal(form.position, "副院长");
  assert.equal(form.phone, "13800005209");
  assert.equal(form.email, "xuwenbo@example.com");
  assert.equal(form.education, "博士 / 示例大学 / 机械电子工程");
  assert.equal(form.educationBackground, "1998—2007，本硕博阶段");
  assert.equal(form.workExperience, "2015年至今：机器人研究院副院长");
  assert.equal(form.certificates, "研究员职称证书");
  assert.match(form.expertise, /机器人/);
  assert.equal(applicationFormComplete(form), true);
});

test("unsaved application is complete when the resume already supplies the paper form", () => {
  const record = {
    name: "许文博",
    gender: "男",
    phone: "13800005209",
    company: "机器人研究院（演示）",
    title: "副院长",
    application: null,
    profile: {
      name: "许文博",
      gender: "男",
      birth: "1978-03-16",
      idNo: "22010219780316001X",
      phone: "13800005209",
      email: "xuwenbo@example.com",
      company: "机器人研究院（演示）",
      position: "副院长",
      education: "博士 / 示例大学 / 机械电子工程",
    },
  };
  assert.equal(applicationFormComplete(applicationFromProfile(record)), true);
});
