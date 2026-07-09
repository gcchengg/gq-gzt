import React from "react";
import { getDictInfo } from "../../../support";
import moment from "moment";
import "./wordDom.css";
const { position_code, supervisor_selection_type, position_category } =
  getDictInfo()["GQ-0207"];

export default function WordDom({ infoData }) {
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
      .map(
        (item) =>
          `    ${item.positionCategoryText}：推荐${item.name} 担任 ${item.positionText}`,
      )
      .join("\n");
    const withdrawText = withdrawList
      .map(
        (item) =>
          `    ${item.positionCategoryText}：撤回${item.name} 担任 ${item.positionText}的推荐。`,
      )
      .join("\n");

    let fawen = "";
    if (recommendList.length > 0) {
      fawen += `推荐\n${recommendText}\n`;
    }
    if (withdrawList.length > 0) {
      fawen += `撤回\n${withdrawText}\n`;
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
      fawen,
      faWenTitle,
    };
  };

  const lor = infoData.lor || {};
  const title = lor.title || getTitle(infoData).faWenTitle || "";
  const docNo = lor.docNo || "";
  const content = lor.content || getTitle(infoData).fawen || "";
  const signCompany = lor.signCompany || "一汽股权投资（天津）有限公司";
  const signDate = lor.signDate
    ? moment(lor.signDate).format("YYYY年MM月DD日")
    : moment().format("YYYY年MM月DD日");
  const issueDate = lor.issueDate
    ? moment(lor.issueDate).format("YYYY年MM月DD日")
    : moment().format("YYYY年MM月DD日");

  // 拆分内容为段落
  const contentParagraphs = content.split("\n").filter((p) => p.trim());

  return (
    <div className="word-preview">
      {/* 页面1 */}
      <div className="word-page page1">
        <div className="header-top">企业信息 严格保密</div>

        <div className="company-header">
          <h1>{signCompany}文件</h1>
        </div>

        <div className="doc-no">{docNo}</div>
        <div className="divider-red"></div>

        <div className="doc-title">{title}</div>

        <div className="doc-content">
          {contentParagraphs.map((paragraph, index) => (
            <p key={index} className={`${index > 0 ? "pStyle" : ""}`}>
              {paragraph}
            </p>
          ))}
        </div>

        <div className="doc-footer">
          <p>{signCompany}</p>
          <p>{signDate}</p>
        </div>

        <div className="secret-remind">（禁止未经审核，扩大知悉范围）</div>

        <div className="page-number">— 1 —</div>
      </div>

      {/* 页脚 */}
      <div className="footer-bottom">
        <div className="footer-divider"></div>
        <div className="footer-content">
          <span>{signCompany}</span>
          <span>综合管理部</span>
          <span>{issueDate}印发</span>
        </div>
      </div>
    </div>
  );
}
