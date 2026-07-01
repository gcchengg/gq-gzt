import { Button, Checkbox, Col, DatePicker, Form, Input, Row, Select, message } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import {
  currentUser,
  getByCategoryLv3Id,
  getInfoById,
  reviewLevelOptions,
  topicSanAdd,
} from "../../mockApi";
import styles from "./index.module.css";

const toOptions = (items = []) => items.map((item) => ({ value: item.id, label: item.name }));

export default function MeetingPlanForm({
  activeItem,
  selectActive,
  editStatus,
  topicMonth,
  onSavePlanItem,
}) {
  const [form] = Form.useForm();
  const [level1, setLevel1] = useState([]);
  const [level2, setLevel2] = useState([]);
  const [level3, setLevel3] = useState([]);
  const isDetail = editStatus === "detail";

  const loadLevel1 = async () => {
    const res = await topicSanAdd({ level: 1 });
    if (res.code === 200) {
      setLevel1(toOptions(res.data));
    }
  };

  const loadLevel2 = async (parentId, mode) => {
    const res = await topicSanAdd({ level: 2, parentId });
    if (res.code === 200) {
      setLevel2(toOptions(res.data));
      if (mode !== "init") {
        setLevel3([]);
        form.setFieldsValue({ categoryLv2Id: undefined, categoryLv3Id: undefined, reviewLevel: undefined });
      }
    }
  };

  const loadLevel3 = async (parentId, mode) => {
    const res = await topicSanAdd({ level: 3, parentId });
    if (res.code === 200) {
      setLevel3(toOptions(res.data));
      if (mode !== "init") {
        form.setFieldsValue({ categoryLv3Id: undefined, reviewLevel: undefined });
      }
    }
  };

  useEffect(() => {
    loadLevel1();
  }, []);

  useEffect(() => {
    const initForm = async () => {
      if (!selectActive) {
        form.setFieldsValue({
          month: topicMonth ? topicMonth.replace("月", "") : undefined,
          actualNotifyDate: null,
          bianZhiDutyUserName: currentUser.name,
          topicSubmitUserName: "-",
          submitStatus: "0",
          deliberativeBody: [],
        });
        return;
      }

      const res = await getInfoById({ id: selectActive.id });
      if (res.code !== 200 || !res.data) return;

      const data = res.data;
      await loadLevel2(data.categoryLv1Id, "init");
      await loadLevel3(data.categoryLv2Id, "init");

      form.setFieldsValue({
        ...data,
        planLaunchDate: data.planLaunchDate ? dayjs(data.planLaunchDate) : null,
        agreedNotifyDate: data.agreedNotifyDate ? dayjs(data.agreedNotifyDate) : null,
        actualNotifyDate: data.actualNotifyDate ? dayjs(data.actualNotifyDate) : null,
        deliberativeBody: [
          data.shFlag === "1" ? "2" : null,
          data.bodFlag === "1" ? "1" : null,
          data.bosFlag === "1" ? "0" : null,
        ].filter(Boolean),
        topicSubmitUserName: data.topicSubmitUserName || "-",
      });
    };

    initForm();
  }, [form, selectActive, topicMonth]);

  const handleLevel3Change = async (value) => {
    const res = await getByCategoryLv3Id({ id: value });
    if (res.code === 200) {
      form.setFieldsValue({ reviewLevel: res.data || undefined });
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const deliberativeBody = values.deliberativeBody || [];
      onSavePlanItem({
        ...values,
        id: selectActive?.id || "",
        planId: activeItem?.id || "",
        month: values.month || (topicMonth ? topicMonth.replace("月", "") : ""),
        planLaunchDate: values.planLaunchDate?.format("YYYY-MM-DD") || "",
        agreedNotifyDate: values.agreedNotifyDate?.format("YYYY-MM-DD") || "",
        actualNotifyDate: values.actualNotifyDate?.format("YYYY-MM-DD") || "",
        shFlag: deliberativeBody.includes("2") ? "1" : "",
        bodFlag: deliberativeBody.includes("1") ? "1" : "",
        bosFlag: deliberativeBody.includes("0") ? "1" : "",
        topicSubmitUserName: values.topicSubmitUserName === "-" ? "" : values.topicSubmitUserName,
      });
    } catch {
      message.warning("请完善必填项后再保存");
    }
  };

  return (
    <div className={styles.formShell}>
      <div className={styles.formHero}>
        <div>
          <div className={styles.heroEyebrow}>{editStatus === "add" ? "新增计划议题" : "维护计划议题"}</div>
          <div className={styles.heroTitle}>{activeItem?.shortForm || "参股公司"} · 三会计划明细</div>
        </div>
      </div>

      <Form form={form} layout="vertical" disabled={isDetail}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="month" label="会议召开月" rules={[{ required: true, message: "请选择会议召开月" }]}>
              <Select
                placeholder="请选择"
                options={Array.from({ length: 12 }, (_, index) => ({
                  label: `${index + 1}月`,
                  value: String(index + 1),
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="planLaunchDate" label="会议召开时间" rules={[{ required: true, message: "请选择会议召开时间" }]}>
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="agreedNotifyDate" label="章程约定通知时间" rules={[{ required: true, message: "请选择章程约定通知时间" }]}>
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="actualNotifyDate" label="实际通知时间">
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="categoryLv1Id" label="议题分类（大）" rules={[{ required: true, message: "请选择议题分类（大）" }]}>
              <Select placeholder="请选择" allowClear options={level1} onChange={(value) => loadLevel2(value)} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="categoryLv2Id" label="议题分类（中）" rules={[{ required: true, message: "请选择议题分类（中）" }]}>
              <Select placeholder="请选择" allowClear options={level2} onChange={(value) => loadLevel3(value)} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="categoryLv3Id" label="议题分类（小）" rules={[{ required: true, message: "请选择议题分类（小）" }]}>
              <Select placeholder="请选择" allowClear options={level3} onChange={handleLevel3Change} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="topicName" label="议题名称" rules={[{ required: true, message: "请输入议题名称" }]}>
              <Input placeholder="请输入议题名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="deliberativeBody" label="审议机构" rules={[{ required: true, message: "请选择审议机构" }]}>
              <Checkbox.Group>
                <Checkbox value="2">股东会</Checkbox>
                <Checkbox value="1">董事会</Checkbox>
                <Checkbox value="0">监事会</Checkbox>
              </Checkbox.Group>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="reviewLevel" label="决策层级">
              <Select placeholder="自动带出" disabled options={reviewLevelOptions} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="bianZhiDutyUserName" label="编制计划管户">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="topicSubmitUserName" label="实际提报管户">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="submitStatus" label="状态">
              <Select
                disabled
                options={[
                  { label: "未提报", value: "0" },
                  { label: "已提报", value: "1" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {!isDetail ? (
        <div className={styles.footer}>
          <Button type="primary" onClick={handleSave}>
            保存
          </Button>
        </div>
      ) : null}
    </div>
  );
}
