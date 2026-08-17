export function renderSkillFrame({ number, title, subtitle, body }) {
  return `<section class="skill-frame" data-skill="${number}">
    <header><span>${String(number).padStart(2, "0")} / 05</span><span>AI SKILL TOOLKIT</span></header>
    <h1>${title}</h1><h2>${subtitle}</h2><div class="skill-body">${body}</div>
  </section>`;
}

export function renderPromptInput({ label, text }) {
  return `<div class="prompt"><span>${label}</span><code>${text}</code><i class="cursor"></i></div>`;
}

export function renderProcessFlow({ steps }) {
  return `<ol class="process-flow">${steps.map((step) => `<li>${step}</li>`).join("")}</ol>`;
}

export function renderResultPanel({ title, rows }) {
  return `<section class="result-panel"><h3>${title}</h3>${rows.map((row) => `<p>${row}</p>`).join("")}</section>`;
}

export function renderWarning({ text }) {
  return `<aside class="warning">${text}</aside>`;
}

export function renderCaption({ lines }) {
  return `<div class="caption">${lines.map((line) => `<span>${line}</span>`).join("")}</div>`;
}
