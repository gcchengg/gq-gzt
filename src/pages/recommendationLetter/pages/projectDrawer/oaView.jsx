import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Form,
  message,
  Radio,
  DatePicker,
  Spin,
  Select,
  Drawer,
} from "antd";
import datePickerZhCN from "antd/es/date-picker/locale/zh_CN";
import {
  AModal,
  DirectorSelect,
  getUserInfo,
  UploadFileWps,
} from "../../support";
import moment from "moment";
import "moment/dist/locale/zh-cn";
import SearchModal from "../components/SearchModal/index";
import UserSelect from "../components/userSelect/index";
import { hrSubmit } from "../../api/index";
import PdfView from "./pdfView";
import PdfModal from "../PDFReview/PdfModal/index";
import "./index.css";
const { RangePicker } = DatePicker;
moment.locale("zh-cn");
// 议题审批
const Tabs2 = ({
  projectId,
  isEdit = true,
  onClosed,
  reviewModal,
  setReviewModal,
  parentInfoData,
  title,
}) => {
  const [form] = Form.useForm();
  const [pdfData, setPdfData] = useState({});
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState({}); // 上传文件列表
  const [sendUserList, setSendUserList] = useState([]); // 联审人员
  const [sendUserList1, setSendUserList1] = useState([]); // 列席人列表
  const [infoData, setInfoData] = useState({});
  const [reportPreviewOpen, setReportPreviewOpen] = useState(false);
  const [leaderList, setLeaderList] = useState([]); // 分管领导
  const presUserId = Form.useWatch("presUserId", form); // 预设汇报人

  const onSave = async () => {
    form
      .validateFields()
      .then((values) => {
        console.log(values, "values");

        const data = {
          ...parentInfoData,
          oaParams: {
            ...values,
            planStartDate: values["planStartDate-planEndDate"]
              ? values["planStartDate-planEndDate"][0].format(
                  "YYYY-MM-DD HH:mm:ss",
                )
              : null,
            planEndDate: values["planStartDate-planEndDate"]
              ? values["planStartDate-planEndDate"][1].format(
                  "YYYY-MM-DD HH:mm:ss",
                )
              : null,
            applDate: values.applDate
              ? moment(values.applDate).format("YYYY-MM-DD")
              : null,
            applUserId: getUserInfo().loginName,
          },
          reportFileList: [pdfData],
        };
        setLoading(true); // 提交中
        hrSubmit(data)
          .then((res) => {
            if (res.code === 200) {
              message.success("提交成功");
              setReviewModal(false);
              onClosed("submit", data);
              setTimeout(() => {
                setLoading(false);
              }, 500);
            }
          })
          .finally(() => {
            setLoading(false); // 提交完成
          });
      })
      .catch((error) => {
        message.error("请校验必填项");
        setTimeout(() => {
          setLoading(false);
        }, 500);
      });
  };

  return (
    <Drawer
      title={"编制上会方案"}
      open={reviewModal}
      onClose={() => {
        setReviewModal(false);
      }}
      width={"80%"}
      className="pdf-review-modal"
    >
      <div className="tabs2-container tabs-container-sanhui">
        {isEdit && (
          <PdfView
            title={title}
            setPdfUrl={setPdfData}
            infoData={parentInfoData}
          />
        )}
        <div className="tabs2-left">
          <div className="tabs2-content">
            <Spin spinning={loading}>
              <Form layout="vertical" form={form}>
                <Form.Item
                  label="会议类型"
                  name="topicType"
                  initialValue={"2"}
                  rules={[{ required: true, message: "请选择会议类型" }]}
                >
                  <Select
                    disabled
                    options={[
                      {
                        value: "2",
                        label: "党委会",
                      },
                      {
                        value: "1",
                        label: "投委会",
                      },
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  label="议题名称"
                  name="topic"
                  rules={[{ required: true, message: "请输入议题名称" }]}
                >
                  <Input />
                </Form.Item>
                {/* <div className="item-flex-wrap">
                  <Form.Item label="提报人" name="applUserName">
                    <Input disabled />
                  </Form.Item>
                  <Form.Item label="提报部门" name="applOrgName">
                    <Input disabled />
                  </Form.Item>
                </div> */}
                <div className="item-flex-wrap">
                  <Form.Item
                    label="提报日期"
                    initialValue={moment()}
                    name="applDate"
                  >
                    <DatePicker
                      locale={datePickerZhCN}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                  <Form.Item
                    label="分管领导"
                    name="supervisingLeader"
                    rules={[
                      { required: true, message: "请选择是否为三重一大事项" },
                    ]}
                  >
                    <UserSelect
                      multiple={true}
                      idList={leaderList}
                      onSelect={(value, label) => {
                        setLeaderList(value);
                        form.setFieldsValue({
                          supervisingLeader: value?.join(","),
                        });
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="item-flex-wrap">
                  <Form.Item label="列席人" name="oaMeetingAttendeeList">
                    <UserSelect
                      multiple={true}
                      idList={sendUserList1}
                      onSelect={(value, label) => {
                        const arr = value.map((item, index) => ({
                          userId: item,
                          userName: label[index],
                        }));
                        setSendUserList1(value);
                        form.setFieldsValue({
                          oaMeetingAttendeeList: arr,
                        });
                      }}
                    />
                  </Form.Item>
                  <Form.Item label="汇报人" name="presUserId">
                    <UserSelect
                      multiple={false}
                      idList={presUserId}
                      onSelect={(value, label) => {
                        form.setFieldsValue({
                          presUserId: value,
                          presUserName: label[0],
                        });
                      }}
                    />
                  </Form.Item>
                  <Form.Item hidden name="presUserName" />
                </div>
                <div className="item-flex-wrap">
                  <Form.Item label="投资部2总监" name="jointReviewers2">
                    <Select
                      placeholder="请选择董事"
                      options={[
                        { value: "director-001", label: "张明" },
                        { value: "director-002", label: "李娜" },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item label="联审人员" name="jointReviewers">
                    <UserSelect
                      multiple={true}
                      idList={sendUserList}
                      onSelect={(value, label) => {
                        setSendUserList(value);
                        form.setFieldsValue({
                          jointReviewers: value?.join(","),
                        });
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="item-flex-wrap">
                  <Form.Item
                    label="三重一大事项"
                    name="thImptLarge"
                    rules={[{ required: true, message: "请选择三重一大事项" }]}
                  >
                    <SearchModal
                      value={infoData.thImptLarge}
                      isEdit={true}
                      isSearch
                      type="topicType"
                      onOk={(value) => {
                        form.setFieldsValue({
                          thImptLarge: value.value,
                          thImptLargeType: value.property,
                        });
                        setInfoData({
                          ...infoData,
                          thImptLarge: value.value,
                          thImptLargeType: value.property,
                        });
                      }}
                    />
                  </Form.Item>
                  <Form.Item label="三重一大事项类型" name="thImptLargeType">
                    <Input placeholder="请输入" disabled />
                  </Form.Item>
                </div>

                <div className="item-flex-wrap">
                  <Form.Item
                    label="预计汇报时长（分钟）"
                    name="planMinute"
                    rules={[{ required: true, message: "请输入预计汇报时长" }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    className="meeting-time-item"
                    label="拟上会时间"
                    name="planStartDate-planEndDate"
                  >
                    <RangePicker
                      className="meeting-time-picker"
                      locale={datePickerZhCN}
                      showTime={{ format: "HH:mm:ss" }}
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder={["开始时间", "结束时间"]}
                    />
                  </Form.Item>
                </div>
                <Form.Item
                  label="议题内容概要"
                  name="topicSummary"
                  rules={[{ required: true, message: "请输入议题内容概要" }]}
                >
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item label="相关材料" name="reportFileList">
                  <UploadFileWps
                    dataList={[pdfData]}
                    disabled={true}
                    setDataList={(data) => setFileList(data)}
                    onPreview={() => setReportPreviewOpen(true)}
                    uploadText="上传文件"
                  />
                  <Input
                    style={{ marginTop: 8 }}
                    value={pdfData.fileName}
                    placeholder="请输入文件名称"
                    onChange={(event) => {
                      const fileName = event.target.value;
                      setPdfData((current) => ({
                        ...current,
                        fileName,
                        name: fileName,
                      }));
                    }}
                  />
                </Form.Item>
                <Form.Item label="备注" name="comment">
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Form>
            </Spin>
          </div>
          <div className="projectBtn">
            <Button onClick={() => setReviewModal(false)}>取消</Button>
            <AModal
              loading={loading}
              okText="确定"
              onOk={() => onSave()}
              content={"确认提交报告吗？"}
            />
          </div>
        </div>
      </div>
      {reportPreviewOpen ? (
        <PdfModal
          open={reportPreviewOpen}
          setOpen={setReportPreviewOpen}
          title="上会汇报预览"
          infoData={parentInfoData}
          labelTitle={title}
        />
      ) : null}
    </Drawer>
  );
};

export default Tabs2;
