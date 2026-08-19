import { useEffect, useRef, useState } from "react";
import { Table } from "antd";
import DocumentFiling from "./DocumentFiling";
import { topicReportGet } from "../../mock/topicReportApi";

const positionCategory = {
  100: "董事",
  200: "监事",
  300: "高级管理人员",
};

const positionCode = {
  1001: "董事长",
  2001: "监事会主席",
  3001: "总经理助理",
};

export default function TopicForm(props) {
  const [tableData, setTableData] = useState([]);
  const documentFormRef = useRef(null);

  useEffect(() => {
    topicReportGet({ sanhuiMgmtId: props.id }).then((res) => {
      if (res.code !== 200) return;
      const list = res.data?.sanhuiVoteAdviceRespVoList || [];
      setTableData(
        list.map((item) => ({
          ...item.companySupervisor,
          ...item,
        })),
      );
      props.setReportId(res.data?.id);
    });
  }, [props.id]);

  const columns = [
    {
      title: "序号",
      dataIndex: "id",
      width: 60,
      render: (_value, _record, index) => index + 1,
    },
    {
      title: "职务分类",
      dataIndex: "positionCategory",
      width: 110,
      render: (value) => positionCategory[value] || value || "-",
    },
    {
      title: "职务",
      dataIndex: "positionCode",
      width: 120,
      render: (value) => positionCode[value] || value || "-",
    },
    { title: "任职人", dataIndex: "userName", width: 120 },
    {
      title: "参会对象",
      dataIndex: "attendFlag",
      render: (value) => (value === "1" ? "√" : "-"),
    },
    {
      title: "是否需要专题汇报",
      dataIndex: "report_flag",
      render: (value) => (!value ? "无反馈" : value === "1" ? "是" : "否"),
    },
  ];

  return (
    <>
      <div className="topic-report-grid">
        <div className="topic-report-card">
          <div className="topic-report-title">董监事专题汇报需求反馈结果</div>
          <Table
            size="small"
            columns={columns}
            dataSource={tableData}
            rowKey="id"
            pagination={false}
            scroll={{ x: 760 }}
          />
        </div>
        <div className="topic-report-panel">
          <div className="topic-report-title">
            向集团总经理助理及以上董监事汇报
          </div>
          <DocumentFiling
            ref={documentFormRef}
            sanhuiMgmtId={props.id}
            editStatus={props.editStatus}
            onNext={props.onGoAssign}
          />
        </div>
      </div>
    </>
  );
}
