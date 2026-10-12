# Expert Consultation Record Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep complete submitted consultation records visible after a task leaves `服务中`, and replace the attachment text field with a local-demo upload control.

**Architecture:** Keep the workflow in `Calls.jsx` and the existing `成果与验收` tab. The active form stores serializable attachment metadata; formal submissions snapshot all form fields and attachment metadata into `task.versions`, while later stages render those snapshots read-only.

**Tech Stack:** React, Ant Design Form and Upload, existing local expert task store.

## Global Constraints

- The local demo upload records file name, MIME type, and byte size; it does not send file contents to a server.
- Preserve existing task stage transitions and support legacy saved versions that contain only summary text and an attachment filename.
- Do not add or run tests unless the user asks; run the production Vite build for compile verification.

---

### Task 1: Capture uploaded attachment metadata and complete version snapshots

**Files:**
- Modify: `src/pages/expertTalent/Calls.jsx`

**Interfaces:**
- The upload field keeps a serializable list of `{ uid, name, type, size, status }` objects in component state.
- `task.consultationRecord` keeps the latest saved form fields plus the attachment metadata list.
- Each new `task.versions` entry stores a `record` snapshot containing every consultation form field and the attachment metadata list.

- [ ] **Step 1: Add controlled upload metadata state**

Import Ant Design `Upload` and `UploadOutlined`. Add state for the current attachment list. In `openTask`, initialize it from `task.consultationRecord.attachments`; if a legacy `attachment` string exists, adapt it to one completed file-list entry.

- [ ] **Step 2: Replace the filename input with a local upload control**

Replace the `成果附件` text input with an Ant Design upload field. Use `beforeUpload={() => false}` so the component does not send a network request. In `onChange`, keep only serializable file metadata and set each selected file status to `done` for the demo UI.

- [ ] **Step 3: Persist attachment metadata with drafts and submissions**

In `saveConsultation`, build a saved record from validated form values and the current attachment list. Persist that record to `task.consultationRecord`. When `submit` is true, add `record: savedRecord` to the new version while preserving the existing `number`, `at`, `content`, and `attachment` compatibility fields.

**Validation:** Run `git diff --check -- src/pages/expertTalent/Calls.jsx` and `./node_modules/.bin/vite build`. Expected: no whitespace errors and a successful Vite build.

### Task 2: Render submitted consultation versions read-only in later stages

**Files:**
- Modify: `src/pages/expertTalent/Calls.jsx`

**Interfaces:**
- Submitted versions use `version.record` when available.
- Legacy versions without `version.record` still show their existing summary and attachment name.

- [ ] **Step 1: Render full version details in the existing tab**

For each submitted version, render a read-only section with date, duration, purpose, questions and answers, facts, judgment, reasoning basis, and attachment metadata. Use an em dash for absent legacy fields and keep version cards in descending version order.

- [ ] **Step 2: Verify stage-dependent access**

Keep form controls and submission buttons available only while `canEditConsultation` is true. Keep submitted version cards outside that conditional so they render after transition to `待评价` and `已评价完成`.

**Validation:** Run `git diff --check -- src/pages/expertTalent/Calls.jsx` and `./node_modules/.bin/vite build`. Expected: the existing drawer compiles with submitted versions visible in the read-only history region.
