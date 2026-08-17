import {
  renderCaption,
  renderProcessFlow,
  renderPromptInput,
  renderResultPanel,
  renderSkillFrame,
  renderWarning,
} from "../components.js";

const candidates = [
  {
    rank: "01",
    name: "ppt-design-forge",
    source: "精选技能库",
    match: "96%",
    updated: "今天更新",
    note: "从大纲生成完整演示文稿",
    selected: true,
  },
  {
    rank: "02",
    name: "baoyu-slide-deck",
    source: "skills.sh · baoyu",
    match: "91%",
    updated: "2 天前",
    note: "强视觉叙事与逐页设计",
  },
  {
    rank: "03",
    name: "ppt-set-skill",
    source: "团队工作区",
    match: "86%",
    updated: "6 天前",
    note: "快速生成可翻页网页 PPT",
  },
];

function renderSemanticTags() {
  return `<div class="semantic-zone" aria-label="需求语义标签">
    <span class="semantic-label">需求已拆解</span>
    <div class="semantic-tags">
      <span>PPT</span>
      <span>根据大纲</span>
      <span>专业排版</span>
    </div>
  </div>`;
}

function renderCandidateCards() {
  return `<section class="candidate-list" aria-label="候选 Skill">
    <div class="section-heading">
      <span>候选 Skill</span>
      <span>3 个结果 · 按匹配度排序</span>
    </div>
    ${candidates
      .map(
        (
          candidate,
        ) => `<article class="candidate-card${candidate.selected ? " is-selected" : ""}">
          <span class="candidate-rank">${candidate.rank}</span>
          <div class="candidate-copy">
            <h3>${candidate.name}</h3>
            <p>${candidate.note}</p>
            <div class="candidate-meta">
              <span>${candidate.source}</span>
              <span>${candidate.updated}</span>
            </div>
          </div>
          <div class="match-score">
            <strong>${candidate.match}</strong>
            <span>匹配</span>
          </div>
        </article>`,
      )
      .join("")}
  </section>`;
}

function renderInstallCommand() {
  return `<section class="install-panel" aria-label="安装命令">
    <div class="install-head">
      <span>推荐安装</span>
      <span class="verified-dot">已读取说明</span>
    </div>
    <div class="command-row">
      <code>npx skills add baoyu-skills --skill ppt-design-forge</code>
      <span class="copy-key">⌘ C</span>
    </div>
  </section>`;
}

const sceneStyles = `<style>
  .find-skills-scene {
    position: relative;
    isolation: isolate;
    min-height: 100%;
    gap: 15px;
    padding: var(--safe-top) var(--safe-x) var(--safe-bottom);
    overflow: hidden;
    background:
      radial-gradient(circle at 86% 7%, rgba(97, 231, 181, 0.14), transparent 27%),
      radial-gradient(circle at 8% 62%, rgba(104, 168, 255, 0.1), transparent 31%),
      var(--canvas);
  }

  .find-skills-scene::before {
    position: absolute;
    z-index: -1;
    inset: 18px;
    border: 1px solid rgba(140, 160, 162, 0.08);
    border-radius: 42px;
    content: "";
    pointer-events: none;
  }

  .find-skills-scene::after {
    position: absolute;
    z-index: -1;
    top: 264px;
    right: -172px;
    width: 480px;
    height: 480px;
    border: 1px solid rgba(97, 231, 181, 0.1);
    border-radius: 50%;
    box-shadow:
      0 0 0 72px rgba(97, 231, 181, 0.025),
      0 0 0 144px rgba(97, 231, 181, 0.018);
    content: "";
    pointer-events: none;
  }

  .find-skills-scene > header {
    font-size: 18px;
  }

  .find-skills-scene h1 {
    max-inline-size: none;
    color: var(--text);
    font-size: 68px;
    letter-spacing: -0.045em;
    line-height: 0.98;
  }

  .find-skills-scene h1::before {
    margin-right: 18px;
    color: var(--accent);
    content: "01";
    font-family: "SFMono-Regular";
    font-size: 24px;
    letter-spacing: 0;
    vertical-align: 17px;
  }

  .find-skills-scene h2 {
    max-inline-size: none;
    color: var(--muted);
    font-size: 28px;
    font-weight: 500;
    line-height: 1.25;
  }

  .find-skills-scene .skill-body {
    display: grid;
    min-height: 0;
    gap: 13px;
  }

  .find-skills-scene .prompt {
    grid-template-columns: auto 1fr auto;
    gap: 14px;
    min-height: 88px;
    padding: 19px 24px;
    border: 2px solid color-mix(in srgb, var(--info) 38%, var(--line));
    border-radius: 20px;
    box-shadow: 0 18px 58px rgba(0, 0, 0, 0.24);
  }

  .find-skills-scene .prompt > span {
    font-size: 18px;
  }

  .find-skills-scene .prompt code {
    max-inline-size: none;
    font-family: "PingFang SC", "Microsoft YaHei";
    font-size: 24px;
    font-weight: 600;
    line-height: 1.35;
  }

  .semantic-zone {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    min-height: 58px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(140, 160, 162, 0.18);
  }

  .semantic-label {
    color: var(--muted);
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .semantic-tags {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .semantic-tags span {
    padding: 9px 15px;
    border: 1px solid color-mix(in srgb, var(--info) 52%, var(--line));
    border-radius: 999px;
    background: color-mix(in srgb, var(--info) 10%, var(--surface-1));
    color: #cfe2ff;
    font-size: 19px;
    font-weight: 700;
  }

  .section-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 9px;
    color: var(--muted);
    font-size: 17px;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .section-heading span:first-child {
    color: var(--text);
    font-size: 21px;
  }

  .candidate-list {
    display: grid;
    gap: 9px;
  }

  .candidate-card {
    display: grid;
    grid-template-columns: 44px 1fr 84px;
    align-items: center;
    gap: 16px;
    min-height: 124px;
    padding: 14px 20px;
    border: 1px solid var(--line);
    border-radius: 18px;
    background: color-mix(in srgb, var(--surface-2) 92%, transparent);
  }

  .candidate-card.is-selected {
    border: 2px solid color-mix(in srgb, var(--accent) 66%, var(--line));
    background: color-mix(in srgb, var(--accent) 8%, var(--surface-1));
    box-shadow: 0 16px 42px rgba(0, 0, 0, 0.22);
  }

  .candidate-rank {
    color: var(--muted);
    font-family: "SFMono-Regular";
    font-size: 18px;
  }

  .is-selected .candidate-rank {
    color: var(--accent);
  }

  .candidate-copy {
    min-width: 0;
  }

  .candidate-copy h3 {
    overflow: hidden;
    min-height: 38px;
    color: var(--text);
    font-family: "SFMono-Regular";
    font-size: 25px;
    line-height: 38px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .candidate-copy p {
    margin-top: 3px;
    color: var(--text);
    font-size: 19px;
    line-height: 1.32;
  }

  .candidate-meta {
    display: flex;
    gap: 18px;
    margin-top: 6px;
    color: var(--muted);
    font-size: 16px;
  }

  .candidate-meta span + span::before {
    margin-right: 18px;
    color: var(--line);
    content: "•";
  }

  .match-score {
    display: grid;
    justify-items: end;
  }

  .match-score strong {
    color: var(--accent);
    font-family: "SFMono-Regular";
    font-size: 30px;
    line-height: 1;
  }

  .match-score span {
    margin-top: 7px;
    color: var(--muted);
    font-size: 15px;
  }

  .find-skills-scene .result-panel {
    display: grid;
    grid-template-columns: 176px 1fr;
    align-items: start;
    gap: 8px 24px;
    padding: 18px 22px;
    border-width: 1px;
    border-radius: 18px;
    background: color-mix(in srgb, var(--surface-1) 92%, transparent);
  }

  .find-skills-scene .result-panel h3 {
    grid-row: 1 / span 2;
    margin: 0;
    color: var(--accent);
    font-size: 23px;
    line-height: 1.3;
  }

  .find-skills-scene .result-panel p {
    max-inline-size: none;
    color: var(--text);
    font-size: 19px;
    line-height: 1.4;
  }

  .find-skills-scene .result-panel p + p {
    margin-top: 0;
    padding-top: 8px;
    border-top: 1px solid rgba(140, 160, 162, 0.16);
  }

  .find-skills-scene .process-flow {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .find-skills-scene .process-flow li {
    display: grid;
    justify-items: center;
    gap: 5px;
    min-height: 60px;
    padding: 9px 7px;
    border-radius: 14px;
    color: var(--text);
    font-size: 17px;
    line-height: 1.2;
    text-align: center;
  }

  .find-skills-scene .process-flow li::before {
    font-size: 15px;
  }

  .install-panel {
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--accent) 44%, var(--line));
    border-radius: 18px;
    background: var(--surface-1);
  }

  .install-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 11px 19px;
    border-bottom: 1px solid var(--line);
    color: var(--text);
    font-size: 17px;
    font-weight: 700;
  }

  .verified-dot {
    color: var(--accent);
  }

  .verified-dot::before {
    display: inline-block;
    width: 8px;
    height: 8px;
    margin-right: 9px;
    border-radius: 50%;
    background: var(--accent);
    content: "";
  }

  .command-row {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 14px;
    min-height: 66px;
    padding: 12px 19px;
  }

  .command-row code {
    overflow: hidden;
    color: var(--text);
    font-size: 18px;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .copy-key {
    padding: 7px 10px;
    border: 1px solid var(--line);
    border-radius: 9px;
    color: var(--muted);
    font-family: "SFMono-Regular";
    font-size: 15px;
  }

  .find-skills-scene .warning {
    position: relative;
    padding: 17px 22px 17px 58px;
    border-width: 2px;
    border-radius: 18px;
    background: color-mix(in srgb, var(--warning) 8%, var(--surface-1));
    color: var(--warning);
    font-size: 21px;
    font-weight: 700;
    line-height: 1.35;
  }

  .find-skills-scene .warning::before {
    position: absolute;
    top: 50%;
    left: 22px;
    content: "!";
    font-family: "SFMono-Regular";
    font-size: 26px;
    transform: translateY(-50%);
  }

  .find-skills-scene .caption {
    z-index: 2;
    min-height: var(--safe-bottom);
    padding: 28px 0 42px;
    border-top: 1px solid rgba(140, 160, 162, 0.18);
    background: linear-gradient(to bottom, rgba(5, 9, 13, 0.2), rgba(5, 9, 13, 0.96) 36%);
    font-size: 31px;
    letter-spacing: 0.01em;
    text-shadow: 0 2px 18px var(--canvas);
  }

  .find-skills-scene .caption span:last-child {
    color: var(--accent);
  }
</style>`;

export function buildFindSkillsScene() {
  const comparison = renderResultPanel({
    title: "对比结论",
    rows: [
      "ppt-design-forge：专业排版、图表与完整交付最匹配",
      "另外两个候选分别偏视觉叙事与网页演示",
    ],
  });

  const process = renderProcessFlow({
    steps: ["描述需求", "搜索候选", "比较用途", "安装使用"],
  });

  const body = [
    renderPromptInput({
      label: "INPUT",
      text: "帮我找一个可以根据大纲生成专业 PPT 的 Skill。",
    }),
    renderSemanticTags(),
    renderCandidateCards(),
    comparison,
    process,
    renderInstallCommand(),
    renderWarning({ text: "安装前：检查来源、权限与说明" }),
  ].join("");

  const markup = renderSkillFrame({
    number: 1,
    title: "find-skills",
    subtitle: "不知道装什么？先描述任务",
    body,
  });

  const template = document.createElement("template");
  template.innerHTML = markup.trim();
  const scene = template.content.firstElementChild;
  scene.classList.add("find-skills-scene");
  scene.insertAdjacentHTML("afterbegin", sceneStyles);
  scene.insertAdjacentHTML(
    "beforeend",
    renderCaption({
      lines: ["需求 → 候选 → 对比 → 安装", "先找到对的工具，再决定是否安装"],
    }),
  );
  return scene;
}
