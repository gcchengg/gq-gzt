export const CONFIG_KEY = "expert-operations-config-v1";
export const defaultConfig = {
  version: 1,
  categories: [
    "产业研究",
    "技术研发",
    "资本运营",
    "财务法务",
    "企业运营",
    "高层次专家",
  ],
  domains: [
    "智能网联",
    "新能源动力",
    "汽车软件",
    "产业投资",
    "公司治理",
    "财务审计",
    "供应链",
    "海外合规",
    "机器人",
  ],
  positions: [
    "首席科学家",
    "首席研究员",
    "研究员",
    "副院长",
    "主任",
    "技术总监",
    "合伙人",
    "教授",
    "副教授",
    "高级工程师",
    "工程师",
    "其他",
  ],
  disabledDictionaries: { categories: [], domains: [], positions: [] },
  weights: {
    tag: 35,
    scene: 20,
    quality: 15,
    trace: 10,
    time: 10,
    balance: 10,
  },
  rules: {
    normalAge: 65,
    highAge: 70,
    termYears: 3,
    minYears: 8,
    warningDays: 90,
  },
  closing: { day: 0, time: "23:59", billingRule: "halfDay" },
  fees: [
    ["外部", "两院院士", 2500],
    ["外部", "高级专家", 2000],
    ["外部", "正高级职称 / 教授", 1500],
    ["外部", "副高级职称 / 副教授", 1000],
    ["外部", "中级职称", 800],
    ["外部", "其他人员", 500],
    ["内部", "首席科学家", 2000, 1500],
    ["内部", "专家、总师、正高级", 1500, 1000],
    ["内部", "主任级、副高级", 800, 500],
    ["内部", "主管级、中级", 600, 400],
    ["内部", "其他人员", 400, 250],
  ].map(([source, level, amount, workAmount], key) => ({
    key: `fee-${key}`,
    source,
    level,
    amount,
    workAmount,
    basis: source === "外部" ? "税后待确认" : "税前",
    note:
      source === "外部" ? "请业务维护确认后的税前金额" : "工作/业余分别匹配",
    status: "启用",
    validFrom: "",
    validTo: "",
    version: 1,
  })),
};

export function normalizeConfig(saved = {}) {
  const config = { ...structuredClone(defaultConfig), ...saved };
  config.closing = { ...defaultConfig.closing, ...saved.closing };
  config.disabledDictionaries = {
    ...defaultConfig.disabledDictionaries,
    ...saved.disabledDictionaries,
  };
  for (const key of ["categories", "domains", "positions"]) {
    config[key] = Array.isArray(saved[key])
      ? saved[key]
      : [...defaultConfig[key]];
  }
  config.fees = (
    Array.isArray(saved.fees) ? saved.fees : defaultConfig.fees
  ).map((fee) => ({
    ...fee,
    key: typeof fee.key === "number" ? `fee-${fee.key}` : String(fee.key),
    source: fee.source === "外聘" ? "外部" : fee.source,
    basis:
      fee.basis ||
      (String(fee.note).includes("税后")
        ? "税后待确认"
        : String(fee.note).includes("税前")
          ? "税前"
          : "待确认"),
    workAmount:
      fee.workAmount ??
      (String(fee.note).match(/工作时间(\d+)/)?.[1]
        ? Number(String(fee.note).match(/工作时间(\d+)/)[1])
        : undefined),
    validFrom: fee.validFrom || "",
    validTo: fee.validTo || "",
    version: fee.version || config.version,
  }));
  return config;
}

export function dictionaryOptions(config, key, current) {
  const disabled = config.disabledDictionaries[key] || [];
  const options = config[key].map((value) => ({
    value,
    label: disabled.includes(value) ? `${value}（已停用）` : value,
    disabled: disabled.includes(value),
  }));
  if (current && !config[key].includes(current))
    options.unshift({
      value: current,
      label: `${current}（待规范）`,
      disabled: true,
    });
  return options;
}

export function validDictionary(config, key, value) {
  return (
    config[key].includes(value) &&
    !config.disabledDictionaries[key]?.includes(value)
  );
}

export function effectiveFee(fee, date) {
  return (
    fee &&
    fee.status === "启用" &&
    (!fee.validFrom || fee.validFrom <= date) &&
    (!fee.validTo || fee.validTo >= date)
  );
}

export function validMoney(value) {
  return (
    /^(\d+)(\.\d{1,2})?$/.test(String(value)) && Number(value) <= 100000000
  );
}

export function validateConfig(config) {
  if (Object.values(config.weights).reduce((a, b) => a + Number(b), 0) !== 100)
    throw new Error("匹配权重合计必须为100%");
  const ids = new Set();
  const matches = new Set();
  for (const fee of config.fees) {
    if (ids.has(fee.key) || !fee.level?.trim())
      throw new Error("费用标准编号重复或职级为空");
    ids.add(fee.key);
    if (
      !validMoney(fee.amount) ||
      (fee.workAmount != null && !validMoney(fee.workAmount))
    )
      throw new Error("费用标准金额须为非负数、最多两位小数且不超过一亿元");
    if (fee.validFrom && fee.validTo && fee.validFrom > fee.validTo)
      throw new Error("标准生效日期不得晚于失效日期");
    const match = `${fee.source}/${fee.level.trim()}`;
    if (fee.status === "启用" && matches.has(match))
      throw new Error("同一身份和等级不能同时启用两条标准");
    if (fee.status === "启用") matches.add(match);
  }
  if (
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(config.closing.time) ||
    !Number.isInteger(config.closing.day) ||
    config.closing.day < 0 ||
    config.closing.day > 28
  )
    throw new Error("结账日请选择月末或1—28日，时间格式HH:mm");
}
