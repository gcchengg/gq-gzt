import { Form, Input } from "antd";

const htmlToText = (html = "") =>
  html
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n+$/, "");

export default function WangEdit({ label, name, disabled, html, onChange }) {
  return (
    <Form.Item label={label} name={name} initialValue={htmlToText(html)}>
      <Input.TextArea
        disabled={disabled}
        rows={5}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </Form.Item>
  );
}
