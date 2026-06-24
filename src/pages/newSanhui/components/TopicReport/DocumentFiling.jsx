import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Button, Col, Form, Input, Radio, Row, Select, Space, Spin, Switch, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {
  getMatName,
  groupMessageDlvyOAGet,
  groupMessageDlvySave,
  groupMessageDlvySubmit,
} from "../../mock/topicReportApi";

const { TextArea } = Input;

function ApprovalBox() {
  const steps = [
    { role: "申请人", name: "郑华峰", time: "2026-04-27 10:30:21", type: "start" },
    { role: "科室经理", name: "郑华峰", time: "2026-04-28 19:18:09", type: "pass", opinion: "审批通过" },
  ];

  return (
    <aside className="topic-report-approval">
      <div className="topic-report-approval-head">
        <div className="topic-report-approval-title">当前审批状态</div>
      </div>
      <div className="topic-report-timeline">
        {steps.map((step) => (
          <div className={`topic-report-time-item ${step.type}`} key={`${step.role}-${step.name}`}>
            <div className="topic-report-time-main">
              <strong>{step.role}　{step.name}</strong>
              {step.type === "pass" ? <span className="topic-report-pass">审批通过</span> : null}
            </div>
            <div className="topic-report-time-date">{step.time}</div>
            {step.opinion ? <div className="topic-report-time-opinion">{step.type === "pass" ? "审批意见：" : ""}{step.opinion}</div> : null}
          </div>
        ))}
      </div>
    </aside>
  );
}

const DocumentFiling = (props, ref) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [formObj, setFormObj] = useState({ submission: false });
  const [saveId, setSaveId] = useState(null);
  const [fileList, setFileList] = useState([]);
  const uploadUid = useRef(0);
  const disabled = props.editStatus === "detail" || !formObj.submission;

  useImperativeHandle(ref, () => ({ formObj }));

  useEffect(() => {
    form.setFieldsValue(formObj);
  }, []);

  useEffect(() => {
    if (!props.sanhuiMgmtId) return;
    setLoading(true);
    Promise.all([getMatName({ sanhuiId: props.sanhuiMgmtId }), groupMessageDlvyOAGet({ sanhuiId: props.sanhuiMgmtId })])
      .then(([matNameResult, result]) => {
        if (result.code !== 200) return;
        const data = result.data || {};
        const uploadList = (data.uploadFileList || []).map((item) => ({
          uid: item.id,
          name: item.fileName,
          url: item.fileUrl,
          status: "done",
          response: { data: { originalFilename: item.fileName, url: item.fileUrl } },
        }));
        setFileList(uploadList);
        form.setFieldsValue({
          submission: true,
          matDesc: data.matDesc,
          matName: data.matName || matNameResult.data,
          matType: data.matType,
          recvUserId: data.recvUserId,
          recvUserName: data.recvUserName,
          sealFlag: data.sealFlag,
          sealType: data.sealType,
          applOrgId: data.applOrgId || "股权运营部",
          confidentialType: data.confidentialType,
          recvOrg: data.recvOrg,
          fileList: uploadList,
        });
        setFormObj({ submission: Boolean(data.matName || data.matDesc || uploadList.length) });
        setSaveId(data.messageDlvyId);
      })
      .finally(() => setLoading(false));
  }, [props.sanhuiMgmtId]);

  const formatParams = async () => {
    const values = await form.validateFields();
    return {
      ...values,
      messageDlvyId: saveId,
      uploadFileList: fileList.map((item) => ({
        fileName: item.name,
        fileUrl: item.url || item.response?.data?.url || "/mock-files/uploaded.pdf",
        sanhuiMgmtId: props.sanhuiMgmtId,
      })),
      sanhuiMgmtId: props.sanhuiMgmtId,
    };
  };

  const handleSave = async () => {
    const res = await groupMessageDlvySave(await formatParams());
    if (res.code !== 200) return;
    message.success(res.message || "保存成功");
    setSaveId(res.data?.messageDlvyId);
  };

  const handleSubmit = async () => {
    const res = await groupMessageDlvySubmit(await formatParams());
    if (res.code !== 200) return;
    message.success(res.message || "提交成功");
    props.onNext?.();
  };

  const beforeUpload = (file) => {
    uploadUid.current += 1;
    const item = {
      uid: `topic-report-upload-${uploadUid.current}`,
      name: file.name,
      status: "done",
      url: URL.createObjectURL(file),
      response: { data: { originalFilename: file.name, url: URL.createObjectURL(file) } },
    };
    const next = [...fileList, item];
    setFileList(next);
    form.setFieldValue("fileList", next);
    return false;
  };

  return (
    <Form form={form} layout="vertical" className="topic-report-form">
      <Spin spinning={loading}>
        <Form.Item label="集团非公文报送" name="submission" rules={[{ required: true }]}>
          <Switch
            checked={formObj.submission}
            onChange={(value) => setFormObj({ submission: value })}
            disabled={props.editStatus === "detail"}
          />
          <span className="topic-report-switch-text">
            {formObj.submission ? "有（需要向集团总经理助理及以上董监事汇报）" : "无（本参股企业没有集团总经理助理及以上董监事）"}
          </span>
        </Form.Item>
        <div className="topic-report-form-grid">
          <div className="topic-report-scroll">
            <div className="topic-report-subtitle">OA集团非公文报送申请</div>
            <Form.Item label="材料标题" name="matName" rules={[{ required: true }]}>
              <Input disabled={disabled} />
            </Form.Item>
            <Form.Item label="材料内容" name="fileList" rules={[{ required: true }]}>
              <Upload fileList={fileList} beforeUpload={beforeUpload} onRemove={(file) => setFileList((list) => list.filter((item) => item.uid !== file.uid))} disabled={disabled}>
                <Button disabled={disabled} icon={<UploadOutlined />}>上传文件</Button>
              </Upload>
            </Form.Item>
            <Form.Item label="材料类型" name="matType" rules={[{ required: true }]}>
              <Radio.Group disabled={disabled}>
                <Space direction="vertical">
                  <Radio value="0">请示（只是提请集团领导决策的材料）</Radio>
                  <Radio value="1">报告（只是向集团公司领导汇报某一事项，仅需领导阅知，不需批示的材料）</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="材料密级" name="confidentialType" rules={[{ required: true }]}>
              <Radio.Group disabled={disabled}>
                <Radio value="0">无</Radio>
                <Radio value="1">普通商密</Radio>
                <Radio value="2">核心商密</Radio>
                <Radio value="3">敏感信息</Radio>
              </Radio.Group>
            </Form.Item>
            <div className="topic-report-required">是否需要用印</div>
            <p className="topic-report-help">申请集团非公文报送Word版材料需加盖股权公司行政公章（党委发文需加盖公司党委章）</p>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="sealFlag" rules={[{ required: true }]} initialValue="1">
                  <Select disabled={disabled} options={[{ value: "1", label: "是" }, { value: "0", label: "否" }]} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="sealType" rules={[{ required: true }]} initialValue="0">
                  <Select disabled={disabled} options={[{ value: "0", label: "行政公章" }, { value: "1", label: "法人章" }, { value: "2", label: "总经理名章" }, { value: "3", label: "公司党委章" }]} />
                </Form.Item>
              </Col>
            </Row>
            <div className="topic-report-required">拟报送集团领导或职能部</div>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="recvOrg" rules={[{ required: true }]}>
                  <Select disabled={disabled} options={[{ value: "0", label: "报送集团公司领导" }, { value: "1", label: "报送集团公司职能部" }]} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="recvUserId" rules={[{ required: true }]}>
                  <Select
                    disabled={disabled}
                    options={[
                      { value: "0", label: "邱现东" },
                      { value: "1", label: "刘亦功" },
                      { value: "2", label: "王国强" },
                      { value: "9", label: "办公室（党委办公室）" },
                      { value: "20", label: "财务管理部（董事会办公室）" },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="申请人部门" name="applOrgId">
              <Input disabled />
            </Form.Item>
            <div className="topic-report-required">核心内容（材料具体描述）</div>
            <p className="topic-report-help">核心内容样例：1. 所呈材料的中心内容。2. 现呈报XX领导阅示。</p>
            <Form.Item name="matDesc" rules={[{ required: true, message: "请输入" }]}>
              <TextArea rows={4} disabled={disabled} />
            </Form.Item>
            {formObj.submission && props.editStatus !== "detail" ? (
              <div className="topic-report-form-actions">
                <Button onClick={handleSave}>保存</Button>
                <Button type="primary" onClick={handleSubmit}>下一步</Button>
              </div>
            ) : null}
          </div>
          <ApprovalBox />
        </div>
      </Spin>
    </Form>
  );
};

export default forwardRef(DocumentFiling);
