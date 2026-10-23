import {
  Alert,
  Button,
  Descriptions,
  Form,
  Input,
  Select,
  Space,
  Tag,
  message,
} from "antd";
import { useEffect, useState } from "react";
import {
  mask,
  saveSettlementProfile,
  settlementProfile,
} from "../../settlement";
import { updateStore, useExpertStore } from "../../store";
import { useExpertConfig } from "../../configStore";
import styles from "./index.module.less";

export default function ExpertSettlementProfile({ expertId }) {
  const state = useExpertStore();
  const config = useExpertConfig();
  const profile = settlementProfile(state, expertId);
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const type = Form.useWatch("expertType", form);
  useEffect(() => {
    setEditing(false);
  }, [expertId]);
  if (!profile) return <Alert type="warning" message="专家不存在" />;
  const fee = config.fees.find((item) => item.key === profile.feeId);
  function action(mutator, success) {
    try {
      updateStore(mutator);
      message.success(success);
      return true;
    } catch (error) {
      message.error(error.message);
      return false;
    }
  }
  async function save() {
    try {
      const values = await form.validateFields();
      if (
        action(
          (next) => saveSettlementProfile(next, expertId, values, config),
          "结算资料已保存",
        )
      )
        setEditing(false);
    } catch (error) {
      if (error.message) message.error(error.message);
    }
  }
  return (
    <div className={styles.content}>
      <Alert
        type="info"
        showIcon
        message="计费关联运营费用标准；收款资料可在专家档案或调用报销中补充。"
      />
      <Descriptions
        bordered
        size="small"
        column={2}
        items={[
          {
            key: "type",
            label: "专家内外部身份",
            children: profile.expertType || "待补齐",
          },
          { key: "fee", label: "计费等级", children: fee?.level || "待关联" },
          { key: "identity", label: "证件号码", children: mask(profile.idNo) },
          {
            key: "name",
            label: "收款户名",
            children: profile.accountName || "待补齐",
          },
          {
            key: "bank",
            label: "开户行",
            children: profile.bankName || "待补齐",
          },
          {
            key: "account",
            label: "收款账号",
            children: mask(profile.bankAccount),
          },
          {
            key: "completeness",
            label: "收款资料",
            children: (
              <Tag
                color={
                  profile.accountName && profile.bankName && profile.bankAccount
                    ? "success"
                    : "warning"
                }
              >
                {profile.accountName && profile.bankName && profile.bankAccount
                  ? "已补齐"
                  : "待补充"}
              </Tag>
            ),
          },
          {
            key: "version",
            label: "资料版本",
            children: `v${profile.accountVersion || 1}`,
          },
        ]}
      />
      <Space>
        <Button
          onClick={() => {
            form.setFieldsValue(profile);
            setEditing(!editing);
          }}
        >
          维护计费与结算资料
        </Button>
      </Space>
      {editing ? (
        <Form form={form} layout="vertical" className={styles.form}>
          <Form.Item name="idType" label="证件类型">
            <Select
              options={["身份证", "护照", "其他"].map((value) => ({ value }))}
            />
          </Form.Item>
          <Form.Item
            name="idNo"
            label="证件号码"
            rules={[{ required: true, whitespace: true }]}
          >
            <Input autoComplete="off" />
          </Form.Item>
          <Form.Item
            name="expertType"
            label="专家内外部身份"
            rules={[{ required: true }]}
          >
            <Select
              options={["内部", "外部"].map((value) => ({ value }))}
              onChange={() => form.setFieldValue("feeId", undefined)}
            />
          </Form.Item>
          <Form.Item
            name="feeId"
            label="计费等级（运营费用标准）"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              options={config.fees
                .filter(
                  (item) => item.source === type && item.status === "启用",
                )
                .map((item) => ({
                  value: item.key,
                  label: `${item.level} · ${item.basis}`,
                }))}
            />
          </Form.Item>
          <Form.Item name="accountName" label="收款户名">
            <Input />
          </Form.Item>
          <Form.Item name="bankName" label="开户行">
            <Input />
          </Form.Item>
          <Form.Item
            name="bankAccount"
            label="收款账号"
            rules={[{ pattern: /^\d{6,30}$/, message: "账号须为6—30位数字" }]}
          >
            <Input autoComplete="off" />
          </Form.Item>
          <Space>
            <Button type="primary" onClick={save}>
              保存资料
            </Button>
            <Button onClick={() => setEditing(false)}>取消</Button>
          </Space>
        </Form>
      ) : null}
    </div>
  );
}
