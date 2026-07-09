import React, { useState, useEffect, useMemo } from "react";
import { Form, Input, Button, message, Spin, Radio, Modal, Steps } from "antd";
import { ApprovalStep, getDictInfo, runWithCheckVer } from "../../support";
import PdfModal from "../PDFReview/PdfModal/index";
import {
  getInfo,
  getCompanySupervisorList,
  saveCompany,
} from "../../api/index";
import FormDom from "./formDom";
import Tabs2 from "./Tabs2/index";
import OaView from "./oaView";
const { position_code, supervisor_selection_type, position_category } =
  getDictInfo()["GQ-0207"];

import "./index.css";
const { TextArea } = Input;

const RecommendationInfo = ({
  onClosed,
  id,
  isEdit,
  setDrawerData = () => {},
}) => {
  const [reviewOpen, setReviewOpen] = useState(false); // PDF预览
  const [reviewModal, setReviewModal] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [userOption, setUserOption] = useState([]);
  const [infoData, setInfoData] = useState({});
  const [staffList, setStaffList] = useState([]);
  const [inGroupFlag, setInGroupFlag] = useState("");
  const [backgroudValue, setBackgroudValue] = useState(""); // 背景
  const [recommendPlanValue, setRecommendPlanValue] = useState(""); // 推荐方案
  const [decisionItemValue, setDecisionItemValue] = useState(""); // 决策事项
  const meetingFlag = Form.useWatch("meetingFlag", form);
  const [currentNum, setCurrentNum] = useState(0);

  const getTitle = (data = {}) => {
    const arr = data.selectionList?.map(
      (item) =>
        position_category.find((i) => i.value === item.positionCategory)?.text,
    );
    const uniqueArr = [...new Set(arr)];
    const arr1 = data.selectionList?.map(
      (item) =>
        supervisor_selection_type.find((i) => i.value === item.selType)?.text,
    );
    const uniqueArr1 = [...new Set(arr1)];
    const isTui = uniqueArr1.filter((item) => item !== "撤回")?.length > 0;
    const isChe = uniqueArr1.filter((item) => item === "撤回")?.length > 0;
    let str = "";
    if (isTui && isChe) {
      str = "推荐/撤回";
    } else if (isTui) {
      str = "推荐";
    } else if (isChe) {
      str = "撤回";
    }

    const recommendList = [];
    const withdrawList = [];

    data.selectionList?.forEach((item) => {
      const selType = item.selType;
      let positionCategoryText = "";
      let name = "";
      let positionText = "";

      if (selType === "2000") {
        positionCategoryText =
          position_category.find((i) => i.value === item.positionCategory)
            ?.text || "";
        name = item.suggestSupervisor?.fullName || "";
        positionText =
          position_code.find((i) => i.value === item.positionCode)?.text || "";
        recommendList.push({ positionCategoryText, name, positionText });
      } else if (selType === "3000") {
        positionCategoryText =
          position_category.find((i) => i.value === item.positionCategory)
            ?.text || "";
        name = item.currentSupervisor?.userName || "";
        positionText =
          position_code.find((i) => i.value === item.positionCode)?.text || "";
        recommendList.push({ positionCategoryText, name, positionText });
      } else if (selType === "4000") {
        const recommendPositionCategory =
          position_category.find((i) => i.value === item.positionCategory)
            ?.text || "";
        const recommendName = item.suggestSupervisor?.fullName || "";
        const recommendPosition =
          position_code.find((i) => i.value === item.positionCode)?.text || "";
        recommendList.push({
          positionCategoryText: recommendPositionCategory,
          name: recommendName,
          positionText: recommendPosition,
        });

        const withdrawPositionCategory =
          position_category.find(
            (i) => i.value === item.currentSupervisor?.positionCategory,
          )?.text || "";
        const withdrawName = item.currentSupervisor?.userName || "";
        const withdrawPosition =
          position_code.find(
            (i) => i.value === item.currentSupervisor?.positionCode,
          )?.text || "";
        withdrawList.push({
          positionCategoryText: withdrawPositionCategory,
          name: withdrawName,
          positionText: withdrawPosition,
        });
      } else if (selType === "5000") {
        positionCategoryText =
          position_category.find((i) => i.value === item.positionCategory)
            ?.text || "";
        name = item.currentSupervisor?.userName || "";
        positionText =
          position_code.find((i) => i.value === item.positionCode)?.text || "";
        withdrawList.push({ positionCategoryText, name, positionText });
      }
    });

    const recommendText = recommendList
      .map((item) => `\t${item.positionText}：${item.name}`)
      .join("\n");
    const withdrawText = withdrawList
      .map((item) => `\t${item.positionText}：${item.name}`)
      .join("\n");
    const recommendText1 = recommendList
      .map(
        (item) => `\t${item.name}兼任${data.companyName}${item.positionText}`,
      )
      .join("\n");
    const withdrawText1 = withdrawList
      .map(
        (item) =>
          `\t${item.name}兼任${data.companyName}${item.positionText}的推荐`,
      )
      .join("\n");

    let back = `${data.companyName}根据公司治理需要，经研究拟同步${str}${data.selectionList?.length}名董监高人选，需履行董事会决策及工商登记流程。`;
    // 推荐方案
    let tuijian = "";
    let fawen = `${data.companyName}:\n\t根据工作需要，经研究决定：`;
    if (recommendList.length > 0) {
      const str = recommendList
        .map((item) => item.positionCategoryText)
        .join("、");
      tuijian += `推荐${str}情况如下：\n${recommendText}`;
      fawen += `\n\t推荐\n${recommendText1}`;
    }
    if (withdrawList.length > 0) {
      const str = withdrawList
        .map((item) => item.positionCategoryText)
        .join("、");
      tuijian += `\n撤回${str}情况如下：\n${withdrawText}`;
      fawen += `\n\t撤回\n${withdrawText1}`;
    }

    // 生成发文标题
    const recommendNames = recommendList
      .map((item) => item.name)
      .filter((name) => name);
    const withdrawNames = withdrawList
      .map((item) => item.name)
      .filter((name) => name);
    const fawenList = [...new Set([...recommendNames, ...withdrawNames])];
    let faWenTitle = "";
    if (fawenList.length > 0) {
      const namesStr =
        fawenList.length > 1 ? `${fawenList[0]}等` : fawenList[0];
      faWenTitle += `关于${str}${namesStr}任职的函`;
    }
    return {
      title: `${data.shortForm || data.companyName}${uniqueArr?.join("、")}${str}方案`,
      str,
      back,
      tuijian,
      fawen,
      faWenTitle,
    };
  };
  const onChangeName = (list) => {
    const back = getTitle({ ...infoData, selectionList: list }).back;
    const tuijian = getTitle({ ...infoData, selectionList: list }).tuijian;
    setBackgroudValue(back); // 设置背景值
    setRecommendPlanValue(tuijian); // 设置推荐方案值
    setDecisionItemValue(
      "同意" + getTitle({ ...infoData, selectionList: list }).title,
    ); // 设置提请决议事项
  };

  const getList = (paramsId) => {
    setLoading(true);
    getInfo(paramsId || id).then((res) => {
      if (res.code == 200 && res.data) {
        setDrawerData(res.data || {});
        setInfoData(res.data || {});
        const isXP =
          res.data.selectionList?.every((item) => item.selType === "3000") &&
          res.data.selectionList?.length > 0;
        form.setFieldsValue({
          companyName: res.data.companyName,
          selBackgroud: res.data.selBackgroud,
          reqOrgName: res.data.reqOrgName,
          reqOrg: res.data.reqOrg,
          meetingFlag: res.data.meetingFlag || (isXP ? "0" : "1"),
          backgroud: res.data.backgroud?.trim() || getTitle(res.data).back,
          recommendPlan:
            res.data.recommendPlan?.trim() || getTitle(res.data).tuijian,
          decisionItem:
            res.data.decisionItem?.trim() || "同意" + getTitle(res.data).title, // 提请决议事项
        });
        setBackgroudValue(
          res.data.backgroud?.trim() || getTitle(res.data).back,
        );
        setRecommendPlanValue(
          res.data.recommendPlan?.trim() || getTitle(res.data).tuijian,
        );
        setDecisionItemValue(
          res.data.decisionItem?.trim() || "同意" + getTitle(res.data).title,
        ); // 提请决议事项
        if (res.data?.selectionList?.length > 0) {
          setStaffList(res.data?.selectionList);
        }
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    if (id) {
      getList();
    }
  }, [id]);

  const onSave = async (type) => {
    form
      .validateFields()
      .then((values) => {
        const data = {
          ...(infoData || {}),
          ...values,
          selectionList: staffList,
          submitStatus: type === "submit" ? "0" : infoData.submitStatus,
        };
        setLoading(true);
        saveCompany(data).then((res) => {
          setLoading(false);
          if (res.code === 200) {
            message.success(type === "submit" ? "提交成功" : "保存成功");
            getList();
            if (type === "submit") {
              onClosed("save");
              return;
            }
            if (type === "1") {
              setReviewOpen(true);
            }
            if (type === "2") {
              setReviewModal(true);
            }
          }
        });
      })
      .catch(() => {
        message.error("请检查输入项");
        setLoading(false);
      });
  };

  const companyChange = (id) => {
    getCompanySupervisorList({
      companyId: id,
      hintFlag: "1",
      fawFlag: "1",
      dr: "1",
    }).then((res) => {
      if (res.code === 200) {
        const userConfig = res.data.map((item) => {
          return {
            ...item,
            label: item.userName || "--",
            value: item.id,
            userName:
              `${item.userName}-${
                position_code.find((i) => i.value == item.positionCode).text
              }` || "--",
          };
        });
        setUserOption(() => [...userConfig]);
      } else {
        setUserOption(() => []);
      }
    });
  };

  useEffect(() => {
    if (infoData.companyId) {
      companyChange(infoData.companyId);
    }
  }, [infoData.companyId]);

  const isShow =
    infoData.status === "0" && isEdit && infoData.selStatus === "2000";

  useEffect(() => {
    if (backgroudValue && recommendPlanValue && decisionItemValue) {
      form.setFieldsValue({
        backgroud: backgroudValue,
        recommendPlan: recommendPlanValue,
        decisionItem: decisionItemValue,
      });
    }
  }, [backgroudValue, recommendPlanValue, decisionItemValue]);
  useEffect(() => {
    if (infoData.selStatus) {
      const VAL = {
        2000: 0,
        3000: 1,
        9999: 2,
      };
      setCurrentNum(VAL[infoData.selStatus]);
    }
  }, [infoData.selStatus]);
  const isXP =
    infoData.selectionList?.every((item) => item.selType === "3000") &&
    infoData.selectionList?.length > 0; // 是否是续聘模式

  return (
    <Spin spinning={loading}>
      <Steps
        current={currentNum}
        onChange={(current) => setCurrentNum(current)}
        items={[
          {
            title: "董监高任职选聘",
          },
          {
            title: "下发推荐函",
            disabled: infoData.selStatus === "2000",
          },
          {
            title: "结束",
            disabled: infoData.selStatus !== "9999",
          },
        ]}
      />
      {currentNum === 0 && (
        <div className="recommendation-wrapper">
          <Form form={form} layout="vertical" disabled={!isShow}>
            {/* 基本信息 */}
            <div className="form-section">
              <Form.Item label="参股公司" name="companyName">
                <Input disabled />
              </Form.Item>

              <Form.Item label="选聘背景" name="selBackgroud">
                <TextArea disabled className="form-textarea" />
              </Form.Item>

              <Form.Item label="选聘需求提出部门" name="reqOrgName">
                <Input disabled />
              </Form.Item>
              <Form.Item hidden name="reqOrg" />
            </div>

            {/* 人员明细信息 */}
            <div className="form-section">
              <div className="section-header">人员明细信息</div>
              {staffList.map((staff, index) => {
                return (
                  <FormDom
                    staff={staff}
                    index={index}
                    staffList={staffList}
                    isEdit={isShow}
                    setStaffList={setStaffList}
                    userOption={userOption}
                    form={form}
                    key={staff.id}
                    inGroupFlag={inGroupFlag}
                    setInGroupFlag={setInGroupFlag}
                    onChangeName={onChangeName}
                  />
                );
              })}
            </div>
            <Form.Item
              name="meetingFlag"
              label="是否需要上会"
              rules={[{ required: true }]}
            >
              <Radio.Group disabled={!isShow || isXP}>
                <Radio value="1">是</Radio>
                <Radio value="0">否</Radio>
              </Radio.Group>
            </Form.Item>
            {meetingFlag === "1" && (
              <>
                <Form.Item
                  name="backgroud"
                  label="背景"
                  rules={[{ required: true }]}
                >
                  <Input.TextArea
                    autoSize={{ minRows: 3, maxRows: 10 }}
                    placeholder="请输入"
                  />
                </Form.Item>
                <Form.Item
                  label={getTitle(infoData)?.title}
                  name="recommendPlan"
                  rules={[{ required: true, message: "请输入" }]}
                >
                  <Input.TextArea autoSize={{ minRows: 3, maxRows: 10 }} />
                </Form.Item>
                <Form.Item
                  label="提请决议事项"
                  name="decisionItem"
                  rules={[{ required: true, message: "请输入提请决议事项" }]}
                >
                  <Input.TextArea autoSize={{ minRows: 3, maxRows: 10 }} />
                </Form.Item>
              </>
            )}
          </Form>

          {/* 底部按钮 */}
          <div className="form-footer">
            {isEdit && infoData.selStatus === "2000" && (
              <div className="footer-btns">
                <Button
                  type="primary"
                  loading={loading}
                  disabled={infoData.status === "1"}
                  onClick={() => runWithCheckVer(() => onSave("submit"))}
                >
                  提交
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      {currentNum === 1 && (
        <Tabs2
          isEdit={
            infoData.selStatus === "3000" && isEdit && infoData.status === "0"
          }
          id={id}
          getTitle={getTitle}
          infoData={infoData}
          getList={getList}
        />
      )}
      {currentNum === 2 && (
        <Tabs2
          getList={getList}
          infoData={infoData}
          isEdit={false}
          id={id}
          getTitle={getTitle}
        />
      )}
      {reviewOpen && (
        <PdfModal
          open={reviewOpen}
          setOpen={setReviewOpen}
          title="上会汇报预览"
          infoData={infoData}
          labelTitle={getTitle(infoData)?.title}
        />
      )}
      {reviewModal && (
        <OaView
          reviewModal={reviewModal}
          setReviewModal={setReviewModal}
          onClosed={() => {
            setReviewModal(false);
            getList();
          }}
          projectId={id}
          parentInfoData={infoData}
          title={getTitle(infoData)?.title}
        />
      )}
      {approveModal && (
        <Modal
          title="审批详情"
          open={approveModal}
          onCancel={() => setApproveModal(false)}
          footer={null}
          width={500}
        >
          <ApprovalStep
            isOA={true}
            id={infoData.oaParams?.oaReqId}
            title={"审批流程"}
          />
        </Modal>
      )}
    </Spin>
  );
};

export default RecommendationInfo;
