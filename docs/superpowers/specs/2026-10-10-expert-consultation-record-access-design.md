# Expert Consultation Record Access and Attachment Design

## Context

In `/zj/tasks`, a task in `服务中` can submit a consultation record. Submission stores the latest form values and a version entry, then changes the task stage to `待评价`. The drawer currently hides the editable form outside `服务中`; later-stage users can see only a short version summary, making the submitted record difficult to inspect. The `成果附件` control is currently a text input.

## Goals

- Keep every formally submitted consultation record accessible from the existing `成果与验收` tab after the task leaves `服务中`.
- Preserve a complete snapshot of every submitted version.
- Replace the attachment filename text box with a file selection/upload control.
- Keep the current local demo storage model and avoid introducing a backend dependency.

## User experience

- In `服务中`, users continue to edit and save a draft or formally submit the consultation form.
- The attachment field uses a standard upload control with a visible file list. In the local demo, selecting a file records its name, MIME type, and size; it does not send file bytes to a server.
- A formal submission snapshots all consultation fields and attachment metadata into a numbered version before changing the task to `待评价`.
- In `待评价`, `已评价完成`, and any later task stage, the `成果与验收` tab shows submitted versions as read-only cards in descending version order. Each card includes date, duration, purpose, questions and answers, facts, judgment, reasoning basis, and attachment metadata.
- Existing versions that contain only a summary or filename remain readable; missing fields display an em dash. Legacy records are not populated with fields from another version.
- Draft data remains editable only while the task is `服务中`; formal submitted records are read-only.

## Alternatives considered

1. **Version cards in the existing tab (recommended):** Keeps records beside the submission workflow and makes the latest and previous versions easy to compare.
2. **A new consultation-record tab:** Separates editing and history but adds navigation and makes the submitted information less visible in the existing workflow.
3. **A detail modal per version:** Keeps the page compact but adds an extra click and makes comparing versions harder.

## Data flow

- The upload control prevents implicit network submission and converts selected files to serializable metadata (`name`, `type`, `size`).
- Draft save updates `consultationRecord` without adding a version.
- Formal submit adds a full `record` snapshot and attachment metadata to `versions`, updates `consultationRecord`, then advances the stage to `待评价`.
- The task drawer reads `versions` for submitted history and uses a legacy fallback for existing mock and saved data.

## Error handling and compatibility

- File selection errors display a clear inline message.
- Existing saved tasks and seeded demo tasks without full snapshots continue to render using available summary and attachment fields.
- No real upload endpoint, server-side persistence, or binary-file download is introduced by this change.

## Validation

- Confirm the production Vite build succeeds.
- Manually inspect a service task, save a draft, submit a record, and reopen the task in `待评价` to confirm the full submitted version is visible and read-only.
- Confirm selecting a file shows its name and details and that metadata survives the task state update.
