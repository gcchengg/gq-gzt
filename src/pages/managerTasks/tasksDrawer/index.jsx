import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Button, Spin } from "antd";
import { getUserInfo, getQueryStringGcc } from "../utils";
import { getRiskOperatorList1, getCompanyList } from "../mockApi";
import moment from "moment";
import StepWrap from "./StepWrap";
import { saveTask, getTaskData, getTaskFlow } from "../mockApi";
import StepDom1 from "./StepDom1";
import StepDom2 from "./StepDom2";
import StepDom3 from "./StepDom3";
import StepDom4 from "./StepDom4";
import "./index.less";
const envAppName =
  import.meta.env.VITE_ENV_APP_NAME || import.meta.env.ENV_APP_NAME;
const envConfig = import.meta.env.VITE_ENV_CONFIG || import.meta.env.ENV_CONFIG;
const pCode =
  envAppName === "GQ-0207_app_006"
    ? "006"
    : envAppName === "GQ-0207_app_007"
      ? "007"
      : "008";
// 管理者任务
const TasksDrawer = ({ id, onClosed = () => {} }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [infoList, setInfoList] = useState([]);
  const [initCompany, setInitCompany] = useState([]);
  const [selectOptions, setSelectOptions] = useState([]);
  const [isGuanli, setIsGuanli] = useState(false);
  const itemRefs = useRef([]);
  const [stepData, setStepData] = useState([]);
  const [bizId, setBizId] = useState("");
  const [loading, setLoading] = useState(false);
  const [guanliList, setGuanliList] = useState([]);

  const VAL = {
    100: "创建任务",
    200: "任务完善",
    300: "任务执行",
    400: "任务闭环",
  };
  useEffect(() => {
    if (getQueryStringGcc("bizId")) {
      setBizId(getQueryStringGcc("bizId"));
    }
  }, [getQueryStringGcc("bizId")]);
  const STATUS = {
    100: "任务创建时间",
    200: "任务完善完成时间",
    300: "任务要求完成时间",
    400: "任务闭环时间",
  };

  const items = stepData.map((item, index) => {
    let title = VAL[item.progStatus];
    if (
      item.progStatus === "200" &&
      stepData[index - 1]?.progStatus !== "100"
    ) {
      title = "任务创建";
    }
    const isRed =
      item.planCmplDate &&
      item.progStatus === "300" &&
      moment(item.created) < moment(item.planCmplDate);
    return {
      title,
      description: (
        <div className="projectInfo" key={index}>
          {item.created && (
            <div className="expectedStart">
              {STATUS[item.progStatus]}:
              {item.cmplDateTime && item.progStatus === "400"
                ? moment(item.cmplDateTime).format("YYYY-MM-DD HH:mm:ss")
                : item.created
                  ? moment(item.created).format("YYYY-MM-DD HH:mm:ss")
                  : ""}
            </div>
          )}
          {/* {item.progStatus === '300' && item.planCmplDate && (
            <div className={`expectedStart ${isRed ? 'redstyle' : ''}`}>
              任务执行完成时间:
              {item.planCmplDate ? moment(item.planCmplDate).format('YYYY-MM-DD HH:mm:ss') : ''}
            </div>
          )} */}
        </div>
      ),
    };
  });
  useEffect(() => {
    if (stepData.length > 0) {
      setCurrentStep(stepData.length - 1);
    }
  }, [stepData]);
  const getList = () => {
    setLoading(true);
    getTaskData({ taskId: bizId || id })
      .then((res) => {
        if (res.code === 200) {
          setInfoList(res.data);
        }
      })
      .finally(() => {
        setLoading(false);
      });
    getTaskFlow({ taskId: bizId || id }).then((res) => {
      if (res.code === 200) {
        setStepData(res.data);
      }
    });
  };
  useEffect(() => {
    if (bizId || id) {
      getList();
    } else {
      setStepData([
        {
          progStatus: "100",
        },
      ]);
    }
  }, [id, bizId]);

  useEffect(() => {
    getCompanyList().then((res) => {
      if (res.code === 200) {
        const arr =
          res.data
            ?.map((item) => ({
              ...item,
              value: item.id,
              label: item.companyName,
            }))
            ?.filter((item) => item.companyName) || [];
        setInitCompany(arr);
      }
    });
  }, []);
  useLayoutEffect(() => {
    if (itemRefs.current?.[stepData.length - 1]) {
      setTimeout(() => {
        itemRefs.current[stepData.length - 1].scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 200);
    }
  }, [itemRefs.current?.[stepData.length - 1]]);

  useEffect(() => {
    // 股权管理运营经理
    const cCode =
      envConfig === "uat" || envConfig === "dev"
        ? "WB0640013"
        : pCode === "006"
          ? "WB067100063"
          : pCode === "007"
            ? "WB067100064"
            : "WB067100019";
    // 股权管理者 WB0640013 WB067100019
    const cCode1 =
      envConfig === "uat" || envConfig === "dev"
        ? "WB0640020"
        : pCode === "006"
          ? "WB067100051"
          : pCode === "007"
            ? "WB067100052"
            : "WB067100020";
    getRiskOperatorList1({ code: cCode }).then((res) => {
      if (res.code === 200) {
        setSelectOptions(
          res.data?.map((item) => ({
            ...item,
            id: item.loginName,
            userName: item.name,
            value: item.loginName,
            label: item.name,
          })) || [],
        );
      }
    });
    setLoading(true);
    getRiskOperatorList1({ code: cCode1 })
      .then((res) => {
        if (res.code === 200) {
          const arr =
            res.data?.filter(
              (item) => item.loginName === getUserInfo().loginName,
            ) || [];
          setIsGuanli(arr.length > 0);
          setGuanliList(res.data?.map((item) => item.loginName));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const renderDom = (item, index) => {
    const isShowBtn = index === stepData.length - 1 && !id;
    function findOuterIndex(arr, target) {
      for (let i = 0; i < arr.length; i++) {
        const current = arr[i];

        // 如果当前元素是数组（子数组），检查其中是否包含目标对象
        if (Array.isArray(current)) {
          if (current.some((item) => item?.id == target.id)) {
            return i; // 返回外层索引
          }
        }
        // 如果当前元素是对象，直接比较
        else if (typeof current === "object" && current !== null) {
          if (current.id == target.id) {
            return i; // 返回外层索引
          }
        }
      }

      return -1; // 未找到返回 -1
    }
    const arr = groupArray(stepData);

    const i = findOuterIndex(groupArray(stepData), item);
    return {
      100: (
        <StepDom1
          selectOptions={selectOptions}
          isGuanli={isGuanli}
          guanliList={guanliList}
          initCompany={initCompany}
          infoData={infoList[i] || {}}
          getList={getList}
          id={bizId || id}
          isShowBtn={isShowBtn}
        />
      ),
      200: (
        <StepDom2
          infoData={infoList[i] || {}}
          isShowVl={arr[i][0]?.progStatus === "200"}
          selectOptions={selectOptions}
          parentId={infoList[i]?.parentId}
          id={bizId || id}
          getList={getList}
          guanliList={guanliList}
          isShowBtn={isShowBtn}
        />
      ),
      300: (
        <StepDom3
          infoData={infoList[i] || {}}
          parentId={infoList[i]?.parentId}
          aiIndex={i}
          id={bizId || id}
          getList={getList}
          isShowBtn={isShowBtn}
        />
      ),
      400: (
        <StepDom4
          selectOptions={selectOptions}
          isGuanli={isGuanli}
          initCompany={initCompany}
          infoData={infoList[i] || {}}
          parentId={infoList[i]?.parentId}
          id={bizId || id}
          getList={getList}
          isShowBtn={isShowBtn}
          guanliList={guanliList}
        />
      ),
    };
  };

  const groupArray = (arr) => {
    const result = [];
    let temp = [];

    for (let i = 0; i < arr.length; i++) {
      temp.push(arr[i]);

      // 每3个元素一组，或者到达数组末尾
      const v = temp.find((item) => item.progStatus === "400")?.progStatus;
      if (v === "400" || i === arr.length - 1) {
        result.push(temp);
        temp = [];
      }
    }
    return result;
  };

  return (
    <Spin spinning={loading}>
      <div className="tasks-drawer-wrap">
        <StepWrap steps={items} propCurrent={stepData.length - 1} />
        <div className="tasks-list-wrap">
          {stepData.length > 0 &&
            stepData.map((item, index) => {
              return (
                <div key={index} ref={(ref) => (itemRefs.current[index] = ref)}>
                  {renderDom(item, index)[item.progStatus]}
                </div>
              );
            })}
          <div className="tasks-scroll-spacer" aria-hidden="true" />
        </div>
      </div>
    </Spin>
  );
};

export default TasksDrawer;
