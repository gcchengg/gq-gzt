export const DEFAULT_ID_TYPE = "身份证";
export const DEMO_BIRTH = "1978-03-16";
export const profileRequiredFields = [
  "name",
  "gender",
  "birth",
  "idNo",
  "phone",
];
export const applicationBasicRows = [
  [
    ["name", "专家姓名"],
    ["gender", "性别"],
    ["birth", "出生日期"],
  ],
  [
    ["idNo", "证件号码"],
    ["company", "工作单位"],
    ["position", "职级/职称"],
  ],
  [
    ["phone", "联系电话"],
    ["email", "电子邮箱"],
    ["education", "最高毕业院校及专业"],
  ],
];
export const applicationSectionFields = [
  ["educationBackground", "教育背景"],
  ["workExperience", "工作经历"],
  ["certificates", "资质与证书"],
  ["expertise", "专长领域与研究方向"],
];
export const applicationFieldLabels = Object.fromEntries([
  ...applicationBasicRows.flat(),
  ...applicationSectionFields,
]);

function filled(value) {
  return typeof value === "string" && value.trim();
}
function pick(existing, fallback) {
  return filled(existing) ? existing : fallback || "";
}
function demoIdNo(birth) {
  return `220102${String(birth || DEMO_BIRTH).replaceAll("-", "")}001X`;
}

export function draftProfile(record = {}) {
  const profile = record.profile || {};
  const birth = pick(profile.birth, DEMO_BIRTH);
  return {
    name: pick(profile.name, record.name),
    gender: pick(profile.gender, record.gender) || "男",
    birth,
    idType: pick(profile.idType, DEFAULT_ID_TYPE),
    idNo: pick(profile.idNo, demoIdNo(birth)),
    phone: pick(profile.phone, record.phone),
    email: pick(profile.email, record.email),
    company: pick(profile.company, record.company),
    position: pick(profile.position, record.title || record.position),
    education: profile.education || "",
    educationPeriod: profile.educationPeriod || "",
    experience: profile.experience || "",
    years: profile.years || "",
    category: profile.category || "",
    domain: profile.domain || record.field || "",
    keywords: profile.keywords || "",
    projects: profile.projects || "",
    roles: profile.roles || "",
    certificates: profile.certificates || "",
    results: profile.results || "",
    city: profile.city || "",
    service: profile.service || "",
    travel: profile.travel || "",
    attachment: profile.attachment || "",
    consent: profile.consent !== false,
  };
}

export function applicationFromProfile(record = {}) {
  const profile = draftProfile(record);
  const existing = record.application || {};
  const expertise = [profile.domain, profile.keywords]
    .filter(Boolean)
    .join(" / ");
  return {
    name: pick(existing.name, profile.name),
    gender: pick(existing.gender, profile.gender),
    birth: pick(existing.birth, profile.birth),
    idNo: pick(existing.idNo, profile.idNo),
    company: pick(existing.company, profile.company),
    position: pick(existing.position, profile.position),
    phone: pick(existing.phone, profile.phone),
    email: pick(existing.email, profile.email),
    education: pick(existing.education, profile.education),
    educationBackground: pick(
      existing.educationBackground,
      profile.educationPeriod || profile.education,
    ),
    workExperience: pick(existing.workExperience, profile.experience),
    certificates: pick(existing.certificates, profile.certificates),
    expertise: pick(existing.expertise, expertise),
  };
}

export function profileRequiredComplete(profile) {
  return profileRequiredFields.every((key) => filled(profile?.[key]));
}

export function applicationFormComplete(application) {
  return applicationBasicRows
    .flat()
    .map(([key]) => key)
    .every((key) => filled(application?.[key]));
}
