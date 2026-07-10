import React from "react";
import { Button, Descriptions, Modal, Select, Steps, Tag, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

export const dictInfo = {
  "GQ-0207": {
    position_category: [
      { value: "director", text: "董事" },
      { value: "supervisor", text: "监事" },
      { value: "executive", text: "高管" },
    ],
    position_code: [
      { value: "chairman", text: "董事长" },
      { value: "director", text: "董事" },
      { value: "supervisor", text: "监事" },
      { value: "generalManager", text: "总经理" },
    ],
    supervisor_selection_type: [
      { value: "2000", text: "新选聘" },
      { value: "3000", text: "续聘" },
      { value: "4000", text: "重新选聘" },
      { value: "5000", text: "撤回" },
    ],
    supervisor_selection_status: [
      { value: "1000", text: "待处理" },
      { value: "2000", text: "董监高任职选聘" },
      { value: "3000", text: "下发推荐函" },
      { value: "9999", text: "结束" },
    ],
  },
};

export const getDictInfo = () => dictInfo;

export const getUserInfo = () => ({
  loginName: "mock.user",
  userName: "模拟用户",
});

export const getQueryStringGcc = (name) => {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
};

export const sanhuiStatus = (value, options = []) => {
  const item = options.find((option) => option.value === value);
  const colorMap = {
    1000: "default",
    2000: "processing",
    3000: "warning",
    9999: "success",
  };
  return (
    <Tag color={colorMap[value] || "blue"}>{item?.text || value || "-"}</Tag>
  );
};

export const runWithCheckVer = (callback) => callback();

export function ApprovalStep({ title = "审批流程", id }) {
  const steps = [
    {
      title: "提交申请",
      description: "股权管理部已发起上会方案审批",
    },
    {
      title: "部门负责人审批",
      description: "张明已审批通过",
    },
    {
      title: "分管领导审批",
      description: "李娜审批中",
    },
    {
      title: "党委会秘书确认",
      description: "等待分管领导审批完成后处理",
    },
    {
      title: "流程归档",
      description: "审批通过后自动归档",
    },
  ];

  return (
    <div style={{ color: "#262629" }}>
      <div
        style={{
          marginBottom: 16,
          padding: "14px 16px",
          background: "#f7f9ff",
          border: "1px solid #e4ebff",
          borderRadius: 6,
        }}
      >
        <div style={{ marginBottom: 8, fontSize: 16, fontWeight: 600 }}>
          {title}
        </div>
        <Descriptions
          size="small"
          column={2}
          items={[
            { label: "审批单号", children: id || "OA-MOCK-0001" },
            {
              label: "当前状态",
              children: <Tag color="processing">审批中</Tag>,
            },
            { label: "当前节点", children: "分管领导审批" },
            { label: "发起部门", children: "股权管理部" },
          ]}
        />
      </div>
      <Steps
        direction="vertical"
        current={2}
        items={steps.map((step, index) => ({
          ...step,
          status: index < 2 ? "finish" : index === 2 ? "process" : "wait",
        }))}
      />
      <div
        style={{
          marginTop: 16,
          padding: "12px 14px",
          color: "#5f6270",
          fontSize: 13,
          lineHeight: "20px",
          background: "#fafafa",
          border: "1px solid #edf0f5",
          borderRadius: 6,
        }}
      >
        审批通过后，系统将进入党委会材料归档与后续下发推荐函流程。
      </div>
    </div>
  );
}

export function AModal({ loading, okText = "确定", content, onOk }) {
  return (
    <Button
      type="primary"
      loading={loading}
      onClick={() => {
        Modal.confirm({
          title: "提示",
          content,
          okText,
          cancelText: "取消",
          onOk,
        });
      }}
    >
      提交
    </Button>
  );
}

export function DirectorSelect() {
  return (
    <Form.Item
      label="投资部2总监"
      name={name}
      rules={[{ required: investOrg, message: "请选择投资部2总监" }]}
    >
      <Select
        placeholder="请选择董事"
        options={[
          { value: "director-001", label: "张明" },
          { value: "director-002", label: "李娜" },
        ]}
      />
    </Form.Item>
  );
}

export function SearchModalAllUser({
  valueData = [],
  onOk,
  isEdit = true,
  style,
}) {
  const value = valueData?.[0]?.fullName || valueData?.[0]?.name;
  return (
    <Select
      disabled={!isEdit}
      style={style}
      value={value}
      placeholder="请选择人员"
      onChange={(nextValue) => {
        onOk([{ loginName: nextValue, name: nextValue }]);
      }}
      options={[
        { value: "张明", label: "张明" },
        { value: "李娜", label: "李娜" },
        { value: "王磊", label: "王磊" },
        { value: "赵敏", label: "赵敏" },
      ]}
    />
  );
}

export function UploadFileWps({
  dataList = [],
  disabled,
  setDataList,
  uploadText = "上传文件",
  onPreview,
}) {
  return (
    <Upload
      disabled={false}
      showUploadList={{ showRemoveIcon: !disabled }}
      fileList={dataList.map((file, index) => ({
        uid: file.uid || file.objectKey || `${index}`,
        name: file.fileName || file.name || `附件${index + 1}`,
        status: "done",
        url: file.fileUrl,
      }))}
      beforeUpload={(file) => {
        if (disabled) return false;
        const nextFile = {
          uid: file.uid,
          fileName: file.name,
          name: file.name,
          fileUrl: "",
          objectKey: file.uid,
        };
        setDataList([...(dataList || []), nextFile]);
        return false;
      }}
      onRemove={(file) => {
        if (disabled) return false;
        setDataList(
          (dataList || []).filter(
            (item) => (item.uid || item.objectKey) !== file.uid,
          ),
        );
      }}
      onPreview={(file) => {
        if (onPreview) {
          onPreview(file);
        }
      }}
    >
      {!disabled ? (
        <Button icon={<UploadOutlined />}>{uploadText}</Button>
      ) : null}
    </Upload>
  );
}

export function PreviewDownload({ showText = "预览", fileName }) {
  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <Button type="primary">{showText}</Button>
      <div style={{ marginTop: 12, color: "#666" }}>
        {fileName || "暂无可预览文件"}
      </div>
    </div>
  );
}
