import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Button, Col, DatePicker, Form, Input, Radio, Row, Select, Spin, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {
  getFollowInfo,
  getSanhuiFollowInfo,
  getSanhuiTopicInfo,
  sanhuiFollowSave,
  sanhuiFollowSubmit,
} from "../../mock/topicReportApi";

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const typeOptions = [
  { label: "议题相关", value: "1" },
  { label: "会议相关", value: "2" },
  { label: "其他", value: "3" },
];

export default function AssignDetail({ detailId, sanhuiMgmtId, loadList, onCloseDrawer }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [topicOptions, setTopicOptions] = useState([]);
  const [meetingOptions, setMeetingOptions] = useState([]);
  const [radioCheck, setRadioCheck] = useState("1");
  const [actId, setActId] = useState(null);
  const [actStatus, setActStatus] = useState(null);

  useEffect(() => {
    if (!detailId) return;
    getFollowInfo({ id: detailId }).then((res) => {
      if (res.code !== 200) return;
      const data = res.data || {};
      setActId(data.actId);
      setActStatus(data.actStatus);
      setRadioCheck(data.itemType || "1");
      setFileList((data.fileList || []).map((item) => ({ ...item, uid: item.id, name: item.fileName, status: "done", url: item.fileUrl })));
      form.setFieldsValue({
        followName: data.followName,
        status: data.status || "0",
        statusName: data.status === "1" ? "完成确认中" : data.status === "2" ? "结束" : "执行中",
        followDetail: data.followDetail,
        assignUserId: data.assignUserId,
        assignUserName: data.assignUserName,
        assignDate: data.assignDate ? dayjs(data.assignDate) : dayjs(),
        deadlineDate: data.deadlineDate ? dayjs(data.deadlineDate) : null,
        planDate: data.planStartDate && data.planEndDate ? [dayjs(data.planStartDate), dayjs(data.planEndDate)] : null,
        itemType: data.itemType || "1",
        itemId: data.itemId,
        execDate: data.startDate && data.endDate ? [dayjs(data.startDate), dayjs(data.endDate)] : null,
        execDetail: data.execDetail,
      });
    });
  }, [detailId]);

  useEffect(() => {
    if (!sanhuiMgmtId) return;
    getSanhuiFollowInfo({ sanhuiMgmtId }).then((res) => {
      if (res.code === 200) setMeetingOptions((res.data || []).map((item) => ({ label: item.meetingName, value: item.id })));
    });
    getSanhuiTopicInfo({ sanhuiMgmtId }).then((res) => {
      if (res.code === 200) setTopicOptions((res.data || []).map((item) => ({ label: item.toipcName, value: item.id })));
    });
  }, [sanhuiMgmtId]);

  const formateParams = (values) => ({
    followName: values.followName,
    status: values.status || "0",
    followDetail: values.followDetail,
    assignUserId: values.assignUserId,
    assignUserName: values.assignUserName,
    assignDate: values.assignDate?.format("YYYY-MM-DD"),
    deadlineDate: values.deadlineDate?.format("YYYY-MM-DD"),
    planStartDate: values.planDate?.[0]?.format("YYYY-MM-DD"),
    planEndDate: values.planDate?.[1]?.format("YYYY-MM-DD"),
    itemType: values.itemType,
    itemId: values.itemId,
    toipcName: [...topicOptions, ...meetingOptions].find((item) => item.value === values.itemId)?.label,
    startDate: values.execDate?.[0]?.format("YYYY-MM-DD"),
    endDate: values.execDate?.[1]?.format("YYYY-MM-DD"),
    execDetail: values.execDetail,
    sanhuiMgmtId,
    id: detailId,
    followFromType: detailId ? undefined : "100",
    fileList: fileList.map((item) => ({ fileName: item.name, fileUrl: item.url || "/mock-files/uploaded.pdf", fileType: item.type || item.fileType })),
  });

  const onSave = async () => {
    const res = await sanhuiFollowSave(formateParams(form.getFieldsValue()));
    if (res.code !== 200) return;
    message.success(res.message || "保存成功");
    loadList(sanhuiMgmtId);
    onCloseDrawer();
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    const res = await sanhuiFollowSubmit(formateParams(values));
    if (res.code !== 200) return;
    message.success(res.message || "提交成功");
    loadList(sanhuiMgmtId);
    onCloseDrawer();
  };

  const editable = !actStatus || actStatus === "2";
  const itemOptions = radioCheck === "1" ? topicOptions : meetingOptions;

  return (
    <div className="topic-report-detail">
      <div className={actId ? "topic-report-detail-grid" : ""}>
        <Form form={form} layout="vertical" disabled={!editable}>
          <Spin spinning={loading}>
            <div className="topic-report-title">交办详情</div>
            <Row gutter={24}>
              <Col span={12}><Form.Item label="交办名称" name="followName" rules={[{ required: true }]}><Input /></Form.Item></Col>
              <Col span={12}><Form.Item name="status" hidden initialValue="0" /><Form.Item label="状态" name="statusName" initialValue="执行中"><Input disabled /></Form.Item></Col>
              <Col span={24}><Form.Item label="交办内容" name="followDetail" rules={[{ required: true }]}><TextArea rows={4} /></Form.Item></Col>
              <Col span={12}><Form.Item label="交办人id" name="assignUserId" hidden /><Form.Item label="交办人" name="assignUserName" rules={[{ required: true }]}><Select showSearch options={[{ value: "张华", label: "张华" }, { value: "刘洋", label: "刘洋" }, { value: "周静", label: "周静" }]} /></Form.Item></Col>
              <Col span={12}><Form.Item label="交办时间" name="assignDate" rules={[{ required: true }]} initialValue={dayjs()}><DatePicker style={{ width: "100%" }} /></Form.Item></Col>
              <Col span={12}><Form.Item label="截至时间" name="deadlineDate"><DatePicker style={{ width: "100%" }} /></Form.Item></Col>
              <Col span={12}><Form.Item label="计划执行时间" name="planDate"><RangePicker style={{ width: "100%" }} /></Form.Item></Col>
              <Col span={24}><Form.Item label="相关分类" name="itemType" rules={[{ required: true }]} initialValue="1"><Radio.Group options={typeOptions} onChange={(event) => { setRadioCheck(event.target.value); form.setFieldValue("itemId", null); }} /></Form.Item></Col>
              <Col span={24}><Form.Item label="相关议题/会议名称" name="itemId" rules={[{ required: radioCheck !== "3" }]}><Select disabled={radioCheck === "3"} options={itemOptions} /></Form.Item></Col>
            </Row>
            <div className="topic-report-title">交办执行</div>
            <Row gutter={24}>
              <Col span={12}><Form.Item label="实际执行时间" name="execDate" rules={[{ required: true }]}><RangePicker style={{ width: "100%" }} /></Form.Item></Col>
              <Col span={24}><Form.Item label="执行完成情况" name="execDetail" rules={[{ required: true }]}><TextArea rows={4} /></Form.Item></Col>
              <Col span={24}>
                <Form.Item label="执行完成备证材料">
                  <Upload beforeUpload={(file) => { setFileList((list) => [...list, { uid: file.uid, name: file.name, status: "done", url: URL.createObjectURL(file), type: file.type }]); return false; }} fileList={fileList} onRemove={(file) => setFileList((list) => list.filter((item) => item.uid !== file.uid))}>
                    <Button icon={<UploadOutlined />}>上传文件</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </Spin>
        </Form>
        {actId ? (
          <div className="topic-report-approval">
            <div className="topic-report-title">交办执行结果确认详情</div>
            <div className="topic-report-approval-step">流程实例：{actId}</div>
            <div className="topic-report-approval-step">当前状态：{actStatus || "-"}</div>
          </div>
        ) : null}
      </div>
      {editable ? (
        <div className="topic-report-drawer-actions">
          <Button onClick={onSave}>保存</Button>
          <Button type="primary" onClick={onSubmit}>提交</Button>
        </div>
      ) : null}
    </div>
  );
}
