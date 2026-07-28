# PRD content rules

## Source-of-truth rule

Use only:

1. explicit user requirements;
2. user-confirmed answers;
3. facts visibly present in supplied screenshots;
4. existing rules the user explicitly says to reuse.

Do not infer or invent:

- file formats or file-name rules;
- permissions or roles;
- notification channels;
- approval fields or approval operations;
- error handling, audit records, or system states;
- acceptance criteria not requested by the user.

## Markdown review contract

Before Word generation, create a Markdown draft containing:

1. document title;
2. requirement background;
3. numbered requirement changes;
4. original screenshots;
5. a compact change-scope table;
6. `待确认` questions only when needed.

Keep wording close to the user’s language. Do not turn a short requirement into a speculative full product specification.

## Handling ambiguity

- If ambiguity would materially change behavior, write a short `待确认` question.
- Ask only what blocks an accurate document.
- When the user says “不需要管这些”, remove those questions and do not replace them with assumptions.
- After the user answers, convert the answer into a direct requirement and remove the corresponding question.

## Confirmation behavior

Do not run the Word generator until the user explicitly confirms the latest Markdown version.

After any material change to the Markdown, the prior confirmation no longer applies. Ask for confirmation again.

## Word content mapping

| Markdown content | Word form |
| --- | --- |
| `#` document name | branded cover title |
| `##` major section | Heading 1 with blue rule |
| `###` numbered requirement | Heading 2 |
| bullet list | real Word bullet list |
| Markdown table | editable Word table |
| local image | embedded original image plus caption |
| blockquote metadata | cover metadata table |

