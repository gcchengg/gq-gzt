# Top 5 AI Skill Tutorial Video Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and render a polished 9:16 Chinese tutorial video that explains five AI Skill topics through dark AI-product interfaces and information visualization.

**Architecture:** Author one HyperFrames composition with seven independently testable scenes, shared UI components, and a single timeline manifest. Keep narration, captions, visual events, and audio cues data-driven so timing changes do not require rewriting scene markup.

**Tech Stack:** HyperFrames HTML composition, GSAP seek-safe animation, CSS custom properties, Node.js validation scripts, FFmpeg/ffprobe, Chinese TTS selected through an approved voice audition.

## Global Constraints

- Source of truth: `skill-video/top-5-skills-video-script-v3.md`.
- Output: 1080×1920, 30fps, approximately 5 minutes 35 seconds.
- Language: Simplified Chinese with tutorial-paced Mandarin narration.
- Visual direction: dark AI product interface × information visualization.
- No person, mascot, comic character, virtual presenter, or story IP.
- Main palette: deep black, blue-black, ink green, cyan-green; orange-red only for errors, risks, and warnings.
- Motion must explain task input, processing, output, or comparison; no decorative random particle bursts, camera shake, or frequent glitch effects.
- Captions use at most two lines and must not cover the active interface.
- The approved narration may only change after explicit user approval.
- “PDF/Word/Excel document suite” is presented as a capability category, not a specific installable product.
- Every approval artifact and final render is versioned; approved files are never overwritten.

## Planned File Structure

```text
skill-video/top5-tutorial/
├── README.md                         # project commands and approval status
├── content/
│   ├── script.md                     # frozen copy of the approved V3 script
│   ├── timeline.json                 # scene, narration, caption, and cue timing
│   └── voice-audition.md             # three fixed voice samples and selection record
├── hyperframes/
│   ├── hyperframes.json              # composition configuration
│   ├── index.html                    # composition entry and track declarations
│   ├── src/
│   │   ├── tokens.css                # palette, typography, spacing, glow, radii
│   │   ├── base.css                  # frame, safe area, captions, common layout
│   │   ├── components.js             # shared UI component renderers
│   │   ├── timeline.js               # manifest loading and master timeline
│   │   └── scenes/
│   │       ├── opening.js
│   │       ├── find-skills.js
│   │       ├── tavily-search.js
│   │       ├── summarize.js
│   │       ├── skill-creator.js
│   │       ├── document-suite.js
│   │       └── closing.js
│   ├── tests/
│   │   ├── manifest.test.mjs
│   │   └── scene-contract.test.mjs
│   └── assets/
│       ├── audio/
│       │   ├── narration-v1.wav
│       │   ├── bgm-v1.wav
│       │   └── sfx/
│       └── fonts/
├── previews/
│   ├── style-frame-v1.png
│   ├── animatic-v1.mp4
│   └── final-preview-v1.mp4
└── renders/
    └── top5-ai-skills-v1.mp4
```

---

### Task 1: Scaffold the Composition and Freeze Approved Content

**Files:**
- Create: `skill-video/top5-tutorial/README.md`
- Create: `skill-video/top5-tutorial/content/script.md`
- Create: `skill-video/top5-tutorial/content/timeline.json`
- Create: `skill-video/top5-tutorial/hyperframes/index.html`
- Create: `skill-video/top5-tutorial/hyperframes/hyperframes.json`
- Create: `skill-video/top5-tutorial/hyperframes/tests/manifest.test.mjs`

**Interfaces:**
- Produces: `timeline.json` with `fps`, `width`, `height`, `scenes[]`, `captions[]`, and `audioCues[]`.
- Produces: seven scene IDs consumed by every later task: `opening`, `find-skills`, `tavily-search`, `summarize`, `skill-creator`, `document-suite`, `closing`.

- [ ] **Step 1: Initialize the HyperFrames project**

Run:

```bash
mkdir -p skill-video/top5-tutorial/hyperframes
cd skill-video/top5-tutorial/hyperframes
npx hyperframes init --template blank
```

Expected: `hyperframes/` exists and `npx hyperframes info` reports a valid local project.

- [ ] **Step 2: Freeze the approved script**

Copy `skill-video/top-5-skills-video-script-v3.md` to `skill-video/top5-tutorial/content/script.md` without editing narration text. Record its SHA-256 in `README.md`:

```bash
shasum -a 256 skill-video/top5-tutorial/content/script.md
```

Expected: `README.md` contains `Approved script SHA-256: <64 lowercase hex characters>`.

- [ ] **Step 3: Write the timing manifest**

Create `content/timeline.json` with this top-level contract:

```json
{
  "fps": 30,
  "width": 1080,
  "height": 1920,
  "durationSeconds": 335,
  "scenes": [
    {"id":"opening","start":0,"end":20},
    {"id":"find-skills","start":20,"end":80},
    {"id":"tavily-search","start":80,"end":140},
    {"id":"summarize","start":140,"end":200},
    {"id":"skill-creator","start":200,"end":260},
    {"id":"document-suite","start":260,"end":320},
    {"id":"closing","start":320,"end":335}
  ],
  "captions": [],
  "audioCues": []
}
```

- [ ] **Step 4: Write the failing manifest test**

Create `hyperframes/tests/manifest.test.mjs`:

```js
import assert from "node:assert/strict";
import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("../content/timeline.json", "utf8"));
assert.equal(data.width, 1080);
assert.equal(data.height, 1920);
assert.equal(data.fps, 30);
assert.equal(data.scenes.length, 7);
assert.equal(data.scenes[0].start, 0);
for (let i = 1; i < data.scenes.length; i += 1) {
  assert.equal(data.scenes[i - 1].end, data.scenes[i].start);
}
assert.equal(data.scenes.at(-1).end, data.durationSeconds);
console.log("manifest contract: PASS");
```

- [ ] **Step 5: Run the manifest test**

Run:

```bash
cd skill-video/top5-tutorial/hyperframes
node tests/manifest.test.mjs
```

Expected: `manifest contract: PASS`.

- [ ] **Step 6: Commit the scaffold**

```bash
git add skill-video/top5-tutorial
git commit -m "feat(video): scaffold top five skill tutorial"
```

---

### Task 2: Build the Shared Dark AI Interface System

**Files:**
- Create: `skill-video/top5-tutorial/hyperframes/src/tokens.css`
- Create: `skill-video/top5-tutorial/hyperframes/src/base.css`
- Create: `skill-video/top5-tutorial/hyperframes/src/components.js`
- Create: `skill-video/top5-tutorial/hyperframes/tests/scene-contract.test.mjs`
- Modify: `skill-video/top5-tutorial/hyperframes/index.html`

**Interfaces:**
- Produces: `renderSkillFrame(config)`, `renderPromptInput(config)`, `renderProcessFlow(config)`, `renderResultPanel(config)`, `renderWarning(config)`, and `renderCaption(config)`.
- Consumes: scene IDs and dimensions from `content/timeline.json`.

- [ ] **Step 1: Define exact design tokens**

Create `src/tokens.css`:

```css
:root {
  --canvas: #05090d;
  --surface-1: #091218;
  --surface-2: #0d1a21;
  --line: #20343b;
  --text: #f4f8f7;
  --muted: #8ca0a2;
  --accent: #61e7b5;
  --info: #68a8ff;
  --warning: #ff8a5b;
  --success: #65e6a7;
  --radius-lg: 28px;
  --radius-md: 18px;
  --safe-x: 72px;
  --safe-top: 96px;
  --safe-bottom: 210px;
}
```

- [ ] **Step 2: Write the failing scene contract test**

Create `tests/scene-contract.test.mjs`:

```js
import assert from "node:assert/strict";
import fs from "node:fs";

const components = fs.readFileSync("src/components.js", "utf8");
for (const name of [
  "renderSkillFrame",
  "renderPromptInput",
  "renderProcessFlow",
  "renderResultPanel",
  "renderWarning",
  "renderCaption"
]) {
  assert.match(components, new RegExp(`export function ${name}\\\\(`));
}
console.log("scene component contract: PASS");
```

Run:

```bash
cd skill-video/top5-tutorial/hyperframes
node tests/scene-contract.test.mjs
```

Expected: FAIL because `src/components.js` does not exist.

- [ ] **Step 3: Implement the component renderers**

Create `src/components.js` with these exact signatures:

```js
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
```

- [ ] **Step 4: Implement the base layout**

In `src/base.css`, define `.frame` as exactly `1080px × 1920px`, keep all interactive content within the safe-area variables, cap body copy at 32 Chinese characters per line, and reserve the bottom 210px for captions.

- [ ] **Step 5: Verify component contracts and HyperFrames structure**

Run:

```bash
node tests/scene-contract.test.mjs
npx hyperframes lint
npx hyperframes validate
```

Expected: both tests print `PASS`; lint and validation exit 0.

- [ ] **Step 6: Commit the design system**

```bash
git add skill-video/top5-tutorial/hyperframes
git commit -m "feat(video): add dark AI interface system"
```

---

### Task 3: Create and Approve One Representative Style Frame

**Files:**
- Create: `skill-video/top5-tutorial/hyperframes/src/scenes/find-skills.js`
- Modify: `skill-video/top5-tutorial/hyperframes/index.html`
- Create: `skill-video/top5-tutorial/previews/style-frame-v1.png`

**Interfaces:**
- Produces: `buildFindSkillsScene(): HTMLElement`.
- Consumes: all component renderers from Task 2.

- [ ] **Step 1: Implement the static representative state**

Build the 50-second state of `find-skills` with:

- input prompt at the top;
- three semantic tags in the center;
- three candidate Skill cards with source, match percentage, and updated time;
- a comparison panel;
- an expanded install command;
- an orange “check source and permissions” notice;
- two-line caption area.

- [ ] **Step 2: Render the style frame**

Run:

```bash
cd skill-video/top5-tutorial/hyperframes
npx hyperframes snapshot --time 50 --output ../previews/style-frame-v1.png
```

Expected: a 1080×1920 PNG with no clipped copy and no content inside the caption safe area.

- [ ] **Step 3: Inspect the frame at phone size**

Open the PNG at 25% scale and verify:

- Skill title remains readable;
- body copy remains readable;
- no more than three simultaneous emphasis colors;
- the warning color is not used for normal status;
- UI looks like a plausible premium AI product, not a game HUD.

- [ ] **Step 4: Pause for explicit user approval**

Show `style-frame-v1.png`. Do not animate the remaining scenes until the user explicitly approves this exact image.

- [ ] **Step 5: Commit the approved style frame**

```bash
git add skill-video/top5-tutorial/hyperframes/src/scenes/find-skills.js skill-video/top5-tutorial/previews/style-frame-v1.png
git commit -m "feat(video): approve tutorial style frame"
```

---

### Task 4: Build the Seven Seek-Safe Scene Timelines

**Files:**
- Create: `skill-video/top5-tutorial/hyperframes/src/scenes/opening.js`
- Modify: `skill-video/top5-tutorial/hyperframes/src/scenes/find-skills.js`
- Create: `skill-video/top5-tutorial/hyperframes/src/scenes/tavily-search.js`
- Create: `skill-video/top5-tutorial/hyperframes/src/scenes/summarize.js`
- Create: `skill-video/top5-tutorial/hyperframes/src/scenes/skill-creator.js`
- Create: `skill-video/top5-tutorial/hyperframes/src/scenes/document-suite.js`
- Create: `skill-video/top5-tutorial/hyperframes/src/scenes/closing.js`
- Create: `skill-video/top5-tutorial/hyperframes/src/timeline.js`
- Modify: `skill-video/top5-tutorial/hyperframes/index.html`

**Interfaces:**
- Every scene exports `buildScene(root, gsap): gsap.core.Timeline`.
- `src/timeline.js` exports `buildMasterTimeline(root, gsap): gsap.core.Timeline`.
- Every animation uses only the provided paused GSAP timeline; no `setTimeout`, `requestAnimationFrame`, CSS infinite animation, or uncontrolled media playback.

- [ ] **Step 1: Build the opening timeline**

Implement these beats at exact local times:

```js
[
  [0, "show chat interface"],
  [2, "type three work requests"],
  [6, "show outdated / too long / cannot edit warnings"],
  [11, "collapse failures into one command"],
  [15, "reveal 5 ESSENTIAL SKILLS"],
  [19, "transition into find-skills"]
]
```

- [ ] **Step 2: Animate `find-skills`**

Use this local sequence:

```js
[
  [0, "type prompt"],
  [7, "split semantic tags"],
  [15, "load candidates"],
  [26, "compare three candidates"],
  [40, "expand install command"],
  [50, "highlight source and permission warning"],
  [58, "transition out"]
]
```

- [ ] **Step 3: Animate `tavily-search`**

Use source tiers, a 24-hour filter, duplicate merging, three retained sources, structured answer generation, and a source-preview drawer. The final ten seconds must emphasize source verification rather than search speed.

- [ ] **Step 4: Animate `summarize`**

Show PDF upload, chapter indexing, four summary parameters, four processing channels, a 486-character management summary, source page links, and the comparison `80 pages → 3 minutes`.

- [ ] **Step 5: Animate `skill-creator`**

Show five manual steps, four configuration regions, node reordering, a failed test caused by an abnormal value, rule correction, successful rerun, and a versioned “销售周报” Skill card.

- [ ] **Step 6: Animate the document suite**

Show 20 PDFs in a batch queue, OCR extraction with page references, Word template generation, Excel cleanup, pivot/chart generation, an orange anomaly, and a final “source files unchanged” safety notice.

- [ ] **Step 7: Animate the closing**

Return all five modules to one workspace, illuminate five paths, merge them into a completed task result, and hold the comment question for at least four seconds.

- [ ] **Step 8: Validate deterministic animation**

Run:

```bash
npx hyperframes lint
npx hyperframes validate
npx hyperframes inspect
```

Expected: no unmanaged timers, no missing scene IDs, no overlapping scene ranges, and no media ownership errors.

- [ ] **Step 9: Commit all scene timelines**

```bash
git add skill-video/top5-tutorial/hyperframes
git commit -m "feat(video): build five skill tutorial scenes"
```

---

### Task 5: Produce a Silent Animatic and Approve Motion

**Files:**
- Create: `skill-video/top5-tutorial/previews/animatic-v1.mp4`
- Modify: `skill-video/top5-tutorial/content/timeline.json`

**Interfaces:**
- Produces: a 335-second silent MP4 using the final scene timing.
- Consumes: the seven scene timelines from Task 4.

- [ ] **Step 1: Render low-resolution animatic**

Run:

```bash
cd skill-video/top5-tutorial/hyperframes
npx hyperframes render --quality preview --output ../previews/animatic-v1.mp4
```

Expected: a 1080×1920 or proportional preview MP4 covering all seven scenes.

- [ ] **Step 2: Probe technical properties**

Run:

```bash
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate -of json ../previews/animatic-v1.mp4
```

Expected: duration near 335 seconds, 9:16 video stream, 30fps.

- [ ] **Step 3: Review motion against the script**

Verify every narrated claim has a corresponding visible state. Remove any animation that does not explain an input, process, result, comparison, warning, or transition.

- [ ] **Step 4: Pause for explicit user approval**

Show `animatic-v1.mp4`. Do not generate full narration or final-quality assets until the user approves the motion and reading pace.

- [ ] **Step 5: Commit the approved animatic timing**

```bash
git add skill-video/top5-tutorial/content/timeline.json skill-video/top5-tutorial/previews/animatic-v1.mp4
git commit -m "feat(video): approve tutorial animatic"
```

---

### Task 6: Audition, Generate, and Time the Chinese Narration

**Files:**
- Create: `skill-video/top5-tutorial/content/voice-audition.md`
- Create: `skill-video/top5-tutorial/previews/voice-audition-a.wav`
- Create: `skill-video/top5-tutorial/previews/voice-audition-b.wav`
- Create: `skill-video/top5-tutorial/previews/voice-audition-c.wav`
- Create: `skill-video/top5-tutorial/hyperframes/assets/audio/narration-v1.wav`
- Modify: `skill-video/top5-tutorial/content/timeline.json`

**Interfaces:**
- Produces: one approved Mandarin voice identity and `narration-v1.wav`.
- Produces: caption timings in `timeline.json` with `{start, end, lines}`.

- [ ] **Step 1: Create three voice auditions**

Use the exact opening paragraph from V3 for all three samples:

- A: calm professional female, medium-low pitch;
- B: precise technology presenter, neutral gender impression;
- C: steady professional male, restrained energy.

Keep provider, voice ID, speed, and synthesis parameters in `voice-audition.md`.

- [ ] **Step 2: Pause for explicit user voice approval**

Present all three WAV files. Record the chosen provider, voice ID, and speed in `voice-audition.md`. Do not synthesize the complete script before approval.

- [ ] **Step 3: Generate full narration**

Synthesize the approved V3 narration as one lossless WAV:

```text
sample rate: 48000 Hz
channels: mono
peak: no higher than -3 dBFS
leading silence: 300 ms
trailing silence: 500 ms
```

- [ ] **Step 4: Transcribe and align captions**

Generate per-sentence timestamps from `narration-v1.wav`. Insert entries into `timeline.json`:

```json
{"start":20.4,"end":24.8,"lines":["第一个，find-skills","技能发现器"]}
```

Split captions by meaning, never exceed two lines, and keep each line under 18 Chinese characters when possible.

- [ ] **Step 5: Reconcile scene timing**

If narration duration differs from 335 seconds, adjust scene ends to actual sentence boundaries. Keep scene order unchanged and rerun `node tests/manifest.test.mjs`.

- [ ] **Step 6: Commit approved narration and timing**

```bash
git add skill-video/top5-tutorial/content skill-video/top5-tutorial/hyperframes/assets/audio/narration-v1.wav skill-video/top5-tutorial/previews/voice-audition-*.wav
git commit -m "feat(video): add approved Mandarin narration"
```

---

### Task 7: Add Captions, Music, and Restrained Interface Sound

**Files:**
- Modify: `skill-video/top5-tutorial/hyperframes/src/timeline.js`
- Modify: `skill-video/top5-tutorial/hyperframes/src/base.css`
- Create: `skill-video/top5-tutorial/hyperframes/assets/audio/bgm-v1.wav`
- Create: `skill-video/top5-tutorial/hyperframes/assets/audio/sfx/input.wav`
- Create: `skill-video/top5-tutorial/hyperframes/assets/audio/sfx/match.wav`
- Create: `skill-video/top5-tutorial/hyperframes/assets/audio/sfx/success.wav`
- Create: `skill-video/top5-tutorial/hyperframes/assets/audio/sfx/warning.wav`

**Interfaces:**
- Consumes: timed captions and audio cues from `timeline.json`.
- Produces: one caption track, one narration track, one BGM track, and a sparse SFX track.

- [ ] **Step 1: Render captions from the manifest**

Use `renderCaption({lines})` and switch caption states only at manifest timestamps. Captions must occupy the reserved bottom safe area and use a semi-opaque surface only when the underlying interface reduces contrast.

- [ ] **Step 2: Add background music**

Use a restrained future-technology ambient bed with no lead melody and no vocals. Normalize it so narration remains dominant; target approximately `-28 LUFS` under speech.

- [ ] **Step 3: Add four interface sounds**

Use:

- `input.wav` for executed prompts;
- `match.wav` for successful candidate or source matching;
- `success.wav` for completed outputs;
- `warning.wav` for risks and verification notices.

No more than two SFX events may overlap.

- [ ] **Step 4: Validate audio ownership and caption bounds**

Run:

```bash
npx hyperframes inspect
npx hyperframes validate
```

Expected: all media belongs to declared tracks; no captions exceed the safe area.

- [ ] **Step 5: Commit audio and caption integration**

```bash
git add skill-video/top5-tutorial/hyperframes skill-video/top5-tutorial/content/timeline.json
git commit -m "feat(video): add captions music and interface sound"
```

---

### Task 8: Render, Review, and Verify the Final Video

**Files:**
- Create: `skill-video/top5-tutorial/previews/final-preview-v1.mp4`
- Create: `skill-video/top5-tutorial/renders/top5-ai-skills-v1.mp4`
- Modify: `skill-video/top5-tutorial/README.md`

**Interfaces:**
- Produces: approved preview and high-quality final MP4.
- Consumes: the completed HyperFrames composition and approved audio.

- [ ] **Step 1: Run the complete pre-render checks**

Run:

```bash
cd skill-video/top5-tutorial/hyperframes
node tests/manifest.test.mjs
node tests/scene-contract.test.mjs
npx hyperframes lint
npx hyperframes validate
npx hyperframes inspect
```

Expected: both Node tests print `PASS`; all HyperFrames commands exit 0.

- [ ] **Step 2: Render final preview**

Run:

```bash
npx hyperframes render --quality preview --output ../previews/final-preview-v1.mp4
```

- [ ] **Step 3: Pause for explicit final-preview approval**

Show `final-preview-v1.mp4`. Ask the user to review copy readability, motion pace, narration, captions, music, and warning states. Do not render the final MP4 until approved.

- [ ] **Step 4: Render the high-quality MP4**

Run:

```bash
npx hyperframes render --quality high --output ../renders/top5-ai-skills-v1.mp4
```

- [ ] **Step 5: Verify the final file**

Run:

```bash
ffprobe -v error \
  -show_entries format=duration:stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels \
  -of json ../renders/top5-ai-skills-v1.mp4
```

Expected:

- H.264 video at 1080×1920 and 30fps;
- AAC audio present;
- duration matches `timeline.json` within one frame;
- no missing narration, BGM, or caption track.

Inspect beginning, every scene boundary, and ending for black frames or frozen states.

- [ ] **Step 6: Record delivery details and commit**

Add the final filename, duration, resolution, render command, script hash, and approval date to `README.md`.

```bash
git add skill-video/top5-tutorial
git commit -m "feat(video): render top five AI skill tutorial"
```
