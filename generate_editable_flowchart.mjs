import fs from "node:fs";

const elements = [];
let seq = 1;
const now = Date.now();

function base(type, x, y, width, height, opts = {}) {
  return {
    id: opts.id ?? `el-${seq++}`,
    type,
    x,
    y,
    width,
    height,
    angle: 0,
    strokeColor: opts.strokeColor ?? "#4c8dff",
    backgroundColor: opts.backgroundColor ?? "#dbe8ff",
    fillStyle: "solid",
    strokeWidth: opts.strokeWidth ?? 2,
    strokeStyle: "solid",
    roughness: opts.roughness ?? 0,
    opacity: 100,
    groupIds: opts.groupIds ?? [],
    frameId: null,
    index: `a${String(seq).padStart(3, "0")}`,
    roundness:
      type === "rectangle"
        ? { type: 3 }
        : type === "ellipse"
          ? { type: 2 }
          : null,
    seed: 1000 + seq,
    version: 1,
    versionNonce: 5000 + seq,
    isDeleted: false,
    boundElements: [],
    updated: now,
    link: null,
    locked: false,
  };
}

function node(x, y, w, h, label, style = {}) {
  const shape = base(style.type ?? "rectangle", x, y, w, h, style);
  const textId = `text-${seq++}`;
  shape.boundElements.push({ type: "text", id: textId });
  const text = {
    ...base("text", x + 8, y + 8, w - 16, h - 16, {
      id: textId,
      strokeColor: style.textColor ?? "#2f3542",
      backgroundColor: "transparent",
    }),
    text: label,
    fontSize: style.fontSize ?? 16,
    fontFamily: 5,
    textAlign: "center",
    verticalAlign: "middle",
    containerId: shape.id,
    originalText: label,
    autoResize: true,
    lineHeight: 1.25,
  };
  elements.push(shape, text);
  return shape;
}

function label(x, y, textValue, opts = {}) {
  const t = base("text", x, y, opts.width ?? 280, opts.height ?? 36, {
    strokeColor: opts.color ?? "#ff3b30",
    backgroundColor: "transparent",
  });
  Object.assign(t, {
    text: textValue,
    fontSize: opts.fontSize ?? 28,
    fontFamily: 5,
    textAlign: opts.align ?? "left",
    verticalAlign: "top",
    containerId: null,
    originalText: textValue,
    autoResize: true,
    lineHeight: 1.25,
  });
  elements.push(t);
  return t;
}

function arrow(x1, y1, x2, y2, opts = {}) {
  const bend = opts.points ?? [
    [0, 0],
    [x2 - x1, y2 - y1],
  ];
  const xs = bend.map((p) => p[0]);
  const ys = bend.map((p) => p[1]);
  const a = base(
    "arrow",
    x1,
    y1,
    Math.max(...xs) - Math.min(...xs),
    Math.max(...ys) - Math.min(...ys),
    {
      strokeColor: opts.color ?? "#b7bec8",
      backgroundColor: "transparent",
      strokeWidth: opts.strokeWidth ?? 2,
    },
  );
  Object.assign(a, {
    points: bend,
    lastCommittedPoint: null,
    startBinding: null,
    endBinding: null,
    startArrowhead: null,
    endArrowhead: "arrow",
    elbowed: bend.length > 2,
  });
  elements.push(a);
  if (opts.text)
    label(
      opts.textX ?? (x1 + x2) / 2,
      opts.textY ?? (y1 + y2) / 2 - 25,
      opts.text,
      { width: 40, height: 24, fontSize: 14, color: "#606873" },
    );
  return a;
}

const blue = {};
const purple = { strokeColor: "#a855f7", backgroundColor: "#f1e5ff" };
const green = {
  strokeColor: "#22c55e",
  backgroundColor: "#e5f8df",
  type: "rectangle",
};
const neutral = {
  strokeColor: "#b9c0c8",
  backgroundColor: "#f1f3f5",
  type: "ellipse",
};

// Main pre-processing flow.
node(120, 40, 105, 68, "开始", neutral);
node(330, 40, 105, 68, "维护可比公司", blue);
node(540, 40, 120, 68, "识别相关文件\n是否披露", green);
node(750, 40, 105, 68, "触发文件维护任务", blue);
node(950, 40, 105, 68, "财务维护文件", blue);
arrow(225, 74, 330, 74);
arrow(435, 74, 540, 74);
arrow(660, 74, 750, 74, { text: "是", textX: 690, textY: 52 });
arrow(855, 74, 950, 74);
node(950, 175, 105, 68, "获得万得财务数据", blue);
arrow(1002, 108, 1002, 175);

// AI frame and its label.
const frame = base("rectangle", 20, 340, 1960, 430, {
  strokeColor: "#c9ced5",
  backgroundColor: "#f7f8fa",
  strokeWidth: 1,
});
elements.push(frame);
label(20, 312, "AI", { width: 32, height: 24, fontSize: 14, color: "#5f6670" });
arrow(1002, 243, 1002, 340);

// AI row 1.
node(120, 435, 105, 68, "开始", neutral);
node(330, 435, 105, 68, "财务分析数据源\n汇总", blue);
node(540, 435, 105, 68, "引用规则：00_\n全局分析准则", purple);
node(750, 435, 105, 68, "引用规则：01_数据\n来源证据", purple);
node(950, 435, 105, 68, "计算或识别指标\n结果", blue);
node(1160, 435, 105, 68, "引用规则：04_\n触发阈值规则", purple);
node(1360, 435, 105, 68, "判断哪些指标异常", blue);
node(1570, 435, 105, 68, "引用规则：03_\n维度分析链路", purple);
node(1780, 435, 105, 68, "确定分析维度和\n分析路径", blue);
for (const [a, b] of [
  [225, 330],
  [435, 540],
  [645, 750],
  [855, 950],
  [1055, 1160],
  [1265, 1360],
  [1465, 1570],
  [1675, 1780],
])
  arrow(a, 469, b, 469);

// AI row 2, with a return connector from row 1.
node(120, 610, 105, 68, "引用规则：05_\n归因判断规则", purple);
node(330, 610, 105, 68, "解释指标变化原因", blue);
node(540, 610, 105, 68, "引用规则：06_\n结论输出模板", purple);
node(750, 610, 105, 68, "生成标准化结论", blue);
node(950, 610, 105, 68, "引用规则：07_\n报告结构规则", purple);
node(1160, 610, 105, 68, "组织成完整报告", blue);
node(1360, 610, 105, 68, "引用规则：08_\n质量校验规则", purple);
node(1570, 610, 105, 68, "检查、纠错、反推\n问题来源", blue);
node(1780, 610, 105, 68, "结束", neutral);
arrow(1832, 503, 1832, 570, {
  points: [
    [0, 0],
    [0, 40],
    [-1765, 40],
    [-1765, 141],
    [68, 141],
  ],
});
for (const [a, b] of [
  [225, 330],
  [435, 540],
  [645, 750],
  [855, 950],
  [1055, 1160],
  [1265, 1360],
  [1465, 1570],
  [1675, 1780],
])
  arrow(a, 644, b, 644);

// Review flow.
label(35, 825, "1. 后续规则可维护\n2. 不同公司规则不一样", {
  width: 410,
  height: 90,
  fontSize: 28,
  color: "#ff3b30",
});
node(950, 845, 105, 68, "财务复核", blue);
node(950, 995, 105, 68, "管户复核", blue);
node(1160, 995, 105, 68, "完成确认", blue);
node(1370, 995, 105, 68, "结束", neutral);
arrow(1002, 770, 1002, 845);
arrow(1002, 913, 1002, 995);
arrow(1055, 1029, 1160, 1029);
arrow(1265, 1029, 1370, 1029);

const doc = {
  type: "excalidraw",
  version: 2,
  source: "https://excalidraw.com",
  elements,
  appState: { viewBackgroundColor: "#ffffff", gridSize: 20 },
  files: {},
};

fs.writeFileSync(
  "财务分析流程图-可编辑.excalidraw",
  JSON.stringify(doc, null, 2),
);
console.log(
  `Generated 财务分析流程图-可编辑.excalidraw with ${elements.length} elements.`,
);
