import React, { useEffect, useState } from "react";
import { Card, Input, Form, Button, message, Modal } from "antd";
import WangEdit from "../components/WangEdit/index";
import StepDom1 from "./StepDom1";
import { getQueryStringGcc } from "../utils";
import { executeTaskClose } from "../mockApi";
import collaborationScreenshot from "../../../截屏2026-07-13 10.34.17.png";

const { TextArea } = Input;
export default function StepDom4({
  id,
  isShowBtn,
  infoData = {},
  parentId,
  selectOptions,
  isGuanli,
  initCompany,
  guanliList,
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [cmplComment, setCmplComment] = useState("");
  const [form] = Form.useForm();

  const onSave = async (type) => {
    try {
      await form.validateFields();
      if (type === "0") {
        setOpen(true);
        return;
      }
      setLoading(true);
      const params = {
        ...infoData,
        id: id,
        parentId,
        tuneFlag: type,
        taskType: infoData.taskType,
        cmplComment: form.getFieldValue("cmplComment"),
        taskInstanceCode: getQueryStringGcc("taskInstanceCode"),
      };
      const res = await executeTaskClose(params);
      setLoading(false);
      if (res.code === 200) {
        console.log();
        window.location.href = "/GztHome";
      }
    } catch (error) {
      setLoading(false);
      message.error("请检查输入项");
    }
  };

  useEffect(() => {
    if (!isShowBtn) {
      form.setFieldsValue({
        cmplComment: infoData.cmplComment,
      });
    }
  }, [infoData]);

  return (
    <div className="tasks-step-dom3">
      <Form form={form} disabled={!isShowBtn}>
        <Card>
          <div className="create-task-title">任务闭环</div>
          {infoData.taskType === "400" ? (
            <div className="collaboration-close-summary">
              <div className="collaboration-field-title">协同事项处理结果</div>
              <div className="collaboration-readonly-text">
                {infoData.collaboration?.executionFeedback}
              </div>
              <img
                className="collaboration-close-shot"
                src={collaborationScreenshot}
                alt="PDF 批注截图"
              />
            </div>
          ) : null}
          {isShowBtn ? (
            <WangEdit
              label="任务闭环意见"
              name="cmplComment"
              form={form}
              disabled={!isShowBtn}
              html={infoData.cmplComment}
              onChange={(e) => setCmplComment(e)}
            />
          ) : (
            <Form.Item
              label="任务闭环意见"
              name="cmplComment"
              // rules={[{ required: true, message: '请输入任务闭环意见' }]}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: infoData.cmplComment,
                }}
              />
            </Form.Item>
          )}
          {/* <Form.Item
            label="任务闭环意见"
            name="cmplComment"
            // rules={[{ required: true, message: '请输入任务闭环意见' }]}
          >
            <TextArea
              onChange={(e) => setCmplComment(e.target.value)}
              rows={4}
              placeholder="请输入任务闭环意见"
            />
          </Form.Item> */}
        </Card>
      </Form>
      {isShowBtn && (
        <div className="save-btn">
          <Button loading={loading} type="primary" onClick={() => onSave("1")}>
            确认闭环
          </Button>
          <Button loading={loading} type="primary" onClick={() => onSave("0")}>
            再次下发任务
          </Button>
        </div>
      )}
      {open && (
        <Modal
          className="dom4-modal-tasks"
          open={open}
          title="创建任务"
          width={"85%"}
          onCancel={() => setOpen(false)}
          footer={null}
        >
          <StepDom1
            selectOptions={selectOptions}
            isGuanli={isGuanli}
            cmplComment={cmplComment}
            initCompany={initCompany}
            infoData={infoData}
            guanliList={guanliList}
            isBihuan={true}
            id={id}
            isShowBtn={isShowBtn}
          />
        </Modal>
      )}
    </div>
  );
}
