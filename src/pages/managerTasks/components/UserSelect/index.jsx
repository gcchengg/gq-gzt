import { Select } from "antd";
import users from "../../mock/riskOperatorList.json";

export default function UserSelect({ multiple, idList, onSelect, ...props }) {
  return (
    <Select
      {...props}
      mode={multiple ? "multiple" : undefined}
      value={idList}
      options={users.data.map((u) => ({ value: u.loginName, label: u.name }))}
      onChange={(value, options) =>
        onSelect?.(value, options.map?.((o) => o.label) || [])
      }
    />
  );
}
