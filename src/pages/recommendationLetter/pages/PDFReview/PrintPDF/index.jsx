import React from "react";
import { getDictInfo } from "../../../support";
const { position_code, supervisor_selection_type, position_category } =
  getDictInfo()["GQ-0207"];

const MeetingReviewDocument = ({ infoData = {}, title }) => {
  const companyList = Array.isArray(infoData.companyList)
    ? infoData.companyList
    : [];
  const pageStyles = {
    fontFamily:
      '"阿里巴巴普惠体 3.0", "KaiLight", "deja-sans", "cjk", sans-serif',
    fontSize: "16px",
    lineHeight: 1.6,
    color: "#212529",
    backgroundColor: "#fff",
    margin: 0,
    padding: 0,
    width: "293mm",
  };

  const heading1Styles = {
    color: "#152a8c",
    margin: 0,
    fontSize: "2.25em",
    fontWeight: 800,
    marginBottom: "25px",
    paddingBottom: "12px",
    borderBottom: "2px solid #2980b9",
    textAlign: "center",
    position: "relative",
  };

  const heading2Styles = {
    color: "#2980b9",
    marginTop: "35px",
    marginBottom: "16px",
    fontSize: "1.4em",
    borderLeft: "4px solid #2980b9",
    paddingLeft: "12px",
    pageBreakAfter: "avoid",
  };
  const titleStyles = {
    color: "#437EB4",
    fontSize: "1.1em",
    fontWeight: 600,
    paddingLeft: "36px",
  };

  const paragraphStyles = {
    marginBottom: "16px",
    textAlign: "justify",
    orphans: 3,
    widows: 3,
  };
  const department = {
    fontSize: "24px",
    color: "#6c757d",
    fontWeight: 600,
    position: "absolute",
    bottom: "0",
    width: "100%",
    padding: 0,
    textAlign: "right",
    right: "0",
  };

  const replaceNewlinesWithBr = (text) => {
    const str = text?.replace(/\n/g, "<br />") || "-";
    return str?.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;") || "-";
  };
  const getTitle = (data = infoData) => {
    // 标题：XXXX公司董事、监事、高管推荐/撤回方案。说明：公司名称自动带入，董事、监事、高管则根据涉及到职务类别自动带入。新选聘、续聘、重新选聘为推荐方案，撤回撤回方法。
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

    return `${data.shortForm || data.companyName}${uniqueArr.join("、")}${str}方案`; // 根据实际情况调整标题内容
  };

  const renderCompanySection = (data = infoData, index = 0) => (
    <section
      key={data.id || data.companyId || data.companyName || index}
      style={{
        marginTop: index === 0 ? 0 : "42px",
        paddingTop: index === 0 ? 0 : "34px",
        borderTop: index === 0 ? "none" : "1px dashed #cfd6e4",
      }}
    >
      <h1 style={heading1Styles}>
        <div>{getTitle(data)}</div>
        <div style={department}>{data.reqOrgName}</div>
      </h1>

      <h2 style={heading2Styles}>背景</h2>
      <p style={paragraphStyles}>
        <div
          style={titleStyles}
          dangerouslySetInnerHTML={{
            __html: replaceNewlinesWithBr(data.backgroud),
          }}
        />
      </p>
      <h2 style={heading2Styles}>{getTitle(data)}</h2>
      <p style={paragraphStyles}>
        <div
          style={titleStyles}
          dangerouslySetInnerHTML={{
            __html: replaceNewlinesWithBr(data.recommendPlan),
          }}
        />
      </p>
      <h2 style={heading2Styles}>提请决策事项</h2>
      <p style={paragraphStyles}>
        <div
          style={titleStyles}
          dangerouslySetInnerHTML={{
            __html: replaceNewlinesWithBr(data.decisionItem),
          }}
        />
      </p>
    </section>
  );

  return (
    <div style={pageStyles}>
      <style>{`
        @page {
          size: a4 landscape;
          margin: 0.5mm 2mm;
        }
        p, h2, h3, tr {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        img {
          max-width: 100%;
          height: auto;
        }
            table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      th {
        background-color: #f2f2f2;
      }
      `}</style>

      {companyList.length
        ? companyList.map((item, index) => renderCompanySection(item, index))
        : renderCompanySection(infoData, 0)}
    </div>
  );
};

export default MeetingReviewDocument;
