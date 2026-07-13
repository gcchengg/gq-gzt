import React, { forwardRef } from "react";
import { Select } from "antd";

const CityForm = forwardRef(function CityForm(
  { items = [], style, className },
  ref,
) {
  const item = items[0] || {};
  return (
    <Select
      ref={ref}
      style={style}
      className={className}
      placeholder={item.label}
      options={[
        { value: "220100", label: "长春市" },
        { value: "120100", label: "天津市" },
        { value: "440300", label: "深圳市" },
      ]}
      onChange={(value, option) => item.onChange?.(value, option.label, option)}
    />
  );
});

export const QmForm = CityForm;
export const DcpForm = CityForm;
