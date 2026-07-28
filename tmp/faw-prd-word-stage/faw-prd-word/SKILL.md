---
name: faw-prd-word
description: Use when creating a PRD, product requirement document, requirement change specification, or other confirmed requirements deliverable as an editable Word DOCX in FAW Equity branding, especially when the request includes screenshots or requires a Markdown review before formal document generation.
---

# FAW PRD Word

## Core contract

Create editable PRD `.docx` files with FAW Equity branding. Treat confirmed user content as the only source of business rules.

Read these references before drafting:

- `references/prd-content-rules.md` for the confirmation gate and content boundaries.
- `references/brand-style.md` for exact Word styling.

Use the bundled scripts:

- `scripts/generate_prd_docx.py` to convert confirmed Markdown to Word.
- `scripts/validate_prd_docx.py` to verify structure, images, colors, and unresolved markers.

## Required workflow

1. Inspect every supplied file and screenshot.
2. Extract only requirements explicitly stated by the user.
3. Create a Markdown review draft near the requested output location.
4. Mark genuinely ambiguous requirements as `待确认`.
5. Show the Markdown draft to the user and stop.
6. Generate Word only after the user explicitly confirms the draft.
7. Run:

```bash
python scripts/generate_prd_docx.py \
  --input /absolute/path/confirmed.md \
  --output /absolute/path/requirements.docx
```

8. Validate:

```bash
python scripts/validate_prd_docx.py \
  /absolute/path/requirements.docx \
  --source-markdown /absolute/path/confirmed.md
```

9. Load the installed `documents` skill and use its canonical `render_docx.py`.
10. Inspect every rendered page at full size. Fix and repeat until clean.
11. Deliver only the final `.docx` unless the user requests intermediates.

## Confirmation gate

An explicit confirmation is a user statement such as:

- “确认”
- “没意见”
- “生成 Word”
- “按这个版本生成”

Revision instructions are not confirmation. Apply the revisions to Markdown and ask again.

If the user explicitly provides already-confirmed text and directly requests Word, treat that as confirmation only when no material ambiguity remains.

## Output expectations

- Use real Word headings, list numbering, tables, headers, and footers.
- Preserve screenshot aspect ratios and insert original files.
- Use FAW blue for hierarchy and FAW red for restrained emphasis.
- Keep the document editable; do not convert pages to images.
- Omit empty sections.
- Keep captions with their images when possible.

## Common mistakes

| Mistake | Required correction |
| --- | --- |
| Inventing formats, permissions, notifications, or approval fields | Remove them or mark them `待确认` |
| Generating Word before Markdown confirmation | Stop and request confirmation |
| Recreating a business screenshot | Use the supplied original screenshot |
| Styling with generic Word defaults | Apply `references/brand-style.md` |
| Delivering without render review | Render, inspect every page, and iterate |

