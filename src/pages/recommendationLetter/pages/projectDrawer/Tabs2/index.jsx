import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Spin,
  Modal,
  message,
  DatePicker,
  Select,
} from "antd";
import moment from "moment";
import { saveRecommendLetter } from "../../../api/index";
import { ApprovalStep, PreviewDownload } from "../../../support";
import WordDom from "./wordDom";

import "./index.css";
const { TextArea } = Input;
export default function Tabs2({ isEdit, getTitle, id, infoData, getList }) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [approveModal, setApproveModal] = useState(false);
  const [wordOpen, setWordOpen] = useState(false);

  const onSave = async (type, isShow) => {
    form
      .validateFields()
      .then((values) => {
        const data = {
          ...(infoData.lor || {}),
          ...values,
          isSubmit: type,
          reqId: id,
          signDate: values.signDate
            ? moment(values.signDate).format("YYYY-MM-DD")
            : undefined,
          issueDate: values.issueDate
            ? moment(values.issueDate).format("YYYY-MM-DD")
            : undefined,
        };
        setLoading(true);
        saveRecommendLetter(data).then((res) => {
          setLoading(false);
          if (res.code === 200) {
            message.success("保存成功");
            if (isShow) {
              setWordOpen(true);
            }
            getList();
          }
        });
      })
      .catch(() => {
        message.error("请检查输入项");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (infoData.lor) {
      form.setFieldsValue({
        ...infoData.lor,
        signDate: infoData.lor.signDate
          ? moment(infoData.lor.signDate)
          : moment(),
        issueDate: infoData.lor.issueDate
          ? moment(infoData.lor.issueDate)
          : moment(),
        docNo: infoData.lor.docNo || `一汽股权投资函〔${moment().year()}〕`,
        title: infoData.lor.title || getTitle(infoData).faWenTitle || ``,
        content: infoData.lor.content || getTitle(infoData).fawen,
        signCompany: infoData.lor.signCompany || "一汽股权投资（天津）有限公司",
      });
    } else {
      form.setFieldsValue({
        signDate: moment(),
        issueDate: moment(),
        docNo: `一汽股权投资函〔${moment().year()}〕`,
        title: getTitle(infoData).faWenTitle || ``,
        content: getTitle(infoData).fawen,
        signCompany: "一汽股权投资（天津）有限公司",
      });
    }
  }, [infoData.lor]);

  return (
    <Spin spinning={loading}>
      <div className="tabs2-recommendation-letter">
        <div className="form-section-header">
          <span className="section-title">基本信息</span>
          {infoData.lor?.processInstanceId && (
            <Button
              onClick={() => setApproveModal(true)}
              className="approval-detail-btn"
            >
              审批详情
            </Button>
          )}
        </div>

        <Form form={form} layout="vertical" disabled={!isEdit}>
          <Form.Item label="文号" name="docNo">
            <Input placeholder="请输入文号" />
          </Form.Item>

          <Form.Item label="发文标题" name="title">
            <Input placeholder="请输入发文标题" />
          </Form.Item>

          <Form.Item label="发文内容" name="content">
            <TextArea autoSize={{ minRows: 6 }} placeholder="请输入发文内容" />
          </Form.Item>

          <Form.Item label="落款公司" name="signCompany">
            <Select
              placeholder="请输入落款公司"
              onChange={(value) => {
                form.setFieldsValue({
                  signCompany: value,
                  docNo:
                    value === "一汽股权投资（天津）有限公司"
                      ? `一汽股权投资函〔${moment().year()}〕`
                      : `一汽资产投资函〔${moment().year()}〕`,
                });
              }}
              options={[
                {
                  value: "一汽股权投资（天津）有限公司",
                  label: "一汽股权投资（天津）有限公司",
                },
                {
                  value: "一汽资产经营管理有限公司",
                  label: "一汽资产经营管理有限公司",
                },
              ]}
            />
          </Form.Item>

          <div className="form-row">
            <Form.Item label="落款日期" name="signDate" className="half-width">
              <DatePicker placeholder="请输入落款日期" />
            </Form.Item>
            <Form.Item label="发文日期" name="issueDate" className="half-width">
              <DatePicker placeholder="请输入发文日期" />
            </Form.Item>
          </div>
        </Form>

        <div className="form-footer">
          <Button
            type="primary"
            className="preview-btn"
            onClick={() => onSave("0", true)}
          >
            发文预览
          </Button>
          {isEdit && (
            <div className="footer-right">
              <Button className="save-btn" onClick={() => onSave("0")}>
                保存
              </Button>
              <Button
                type="primary"
                onClick={() => onSave("1")}
                className="submit-btn"
              >
                发起签批
              </Button>
            </div>
          )}
        </div>
      </div>
      {approveModal && (
        <Modal
          title="审批详情"
          open={approveModal}
          onCancel={() => setApproveModal(false)}
          footer={null}
          width={500}
        >
          <ApprovalStep
            id={infoData.lor?.processInstanceId}
            title={"审批流程"}
          />
        </Modal>
      )}
      {wordOpen && (
        <Modal
          title="发文预览"
          open={wordOpen}
          onCancel={() => setWordOpen(false)}
          footer={null}
          width={900}
        >
          {infoData.lor?.issueFiles?.[0]?.fileUrl ? (
            <PreviewDownload
              getPreviewParams={() => {
                return {
                  fileName: infoData.lor.issueFiles[0]?.fileName,
                  fileUrl: infoData.lor.issueFiles[0]?.fileUrl,
                  objectKey: infoData.lor.issueFiles[0]?.objectKey,
                };
              }}
              getDownloadParams={() => {
                const arr =
                  infoData.lor.issueFiles[0]?.fileUrl?.split("/") || [];
                const str = arr[arr.length - 1] || "";
                return {
                  newFileName: infoData.lor.issueFiles[0]?.fileName,
                  objectKey: infoData.lor.issueFiles[0]?.objectKey || str,
                };
              }}
              isShowIcon={false}
              isShowName={false}
              isShowDelete={false}
              showText="预览"
              fileName={infoData.lor.issueFiles[0]?.fileName}
            />
          ) : (
            <WordDom onClosed={() => setWordOpen(false)} infoData={infoData} />
          )}
        </Modal>
      )}
    </Spin>
  );
}
