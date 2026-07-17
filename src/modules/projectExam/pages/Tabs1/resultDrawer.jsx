// ExamResult.jsx
import React, { useState, useEffect } from "react";
import { Button, Table, Modal } from "antd";
import { examResult, examStaffDetail } from "../../api/index";
import moment from "moment";
import "./index.less";

const ExamResult = ({ rowData, onClosed }) => {
  const [infoData, setInfoData] = useState({});
  const [loading, setLoading] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [detailData, setDetailData] = useState({});
  const [selectTab, setSelectTab] = useState(0);
  const [tableData, setTableData] = useState([]);

  // 表格列配置
  const columns = [
    {
      title: "姓名",
      dataIndex: "userName",
    },
    {
      title: "分数",
      dataIndex: "finalScore",
    },
    {
      title: "考试次数",
      dataIndex: "attemptNums",
    },
    {
      title: "最新考试时间",
      dataIndex: "lastAttemptTime",
      render: (time) => {
        return time ? moment(time).format("YYYY-MM-DD HH:mm:ss") : "";
      },
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Button
          className="detail-button"
          onClick={() => {
            setLoading(true);
            examStaffDetail({ id: record.id })
              .then((res) => {
                if (res.code === 200) {
                  setInfoOpen(true);
                  setDetailData(res.data);
                }
              })
              .finally(() => {
                setLoading(false);
              });
          }}
        >
          查看详情
        </Button>
      ),
    },
  ];
  const columns1 = [
    {
      title: "题目",
      dataIndex: "qLabel",
      width: 200,
    },
    {
      title: "选项",
      dataIndex: "score",
      width: 320,
      render: (score, record) => {
        const labelList = ["A", "B", "C", "D", "E", "F"];
        const arr =
          record.answerList?.map((item, idx) => {
            return `${labelList[idx]}. ${item.ansLabel}`;
          }) || [];
        return arr.join(" ");
      },
    },
    {
      title: "正确答案",
      dataIndex: "count",
      width: 100,
      render: (score, record) => {
        const labelList = ["A", "B", "C", "D", "E", "F"];
        const arr =
          record.questionAnswerList
            ?.map((item, idx) => ({ ...item, label: labelList[idx] }))
            ?.filter((item) => item.correctFlag === "1")
            ?.map((item) => item.label) || [];
        return arr.join(" ");
      },
    },
    {
      title: "用户答案",
      dataIndex: "time",
      width: 100,
      render: (score, record) => {
        const labelList = ["A", "B", "C", "D", "E", "F"];
        const arr =
          record.answerList
            ?.map((item, idx) => ({ ...item, label: labelList[idx] }))
            ?.filter((item) => item.answerValue === "1")
            ?.map((item) => item.label) || [];
        return arr.join(" ");
      },
    },
    {
      title: "结果",
      dataIndex: "scoreFlag",
      width: 80,
      render: (score, record) => {
        return score === "1" ? "正确" : "错误";
      },
    },
  ];

  useEffect(() => {
    examResult({ id: rowData.id }).then((res) => {
      if (res.code === 200) {
        setInfoData(res.data.dataMap || {});
        setTableData(res.data.list || []);
      }
    });
  }, []);

  const sortList =
    detailData.itemInfos?.toSorted((a, b) => a.attemptNo - b.attemptNo) || [];

  const exportResults = () => {
    const header = ["姓名", "分数", "考试次数", "最新考试时间"];
    const rows = tableData.map((item) => [
      item.userName,
      item.finalScore,
      item.attemptNums,
      item.lastAttemptTime || "",
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${rowData.examName || "考试结果"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="exam-result-page">
      {/* 顶部标题区域 */}
      <div className="header-wrapper">
        <div className="title-group">
          <h1 className="main-title">考试结果：{rowData.examName}</h1>
        </div>
        <div className="header-buttons">
          <Button
            className="export-button"
            loading={loading}
            onClick={exportResults}
          >
            导出
          </Button>
        </div>
      </div>

      {/* 统计卡片区域 */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-label">总考试人数</div>
          <div className="stat-value">{infoData.allNum}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">当前已通过人数</div>
          <div className="stat-value">{infoData.passNum}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">平均分数</div>
          <div className="stat-value">{infoData.averageScore}</div>
        </div>
      </div>

      {/* 表格区域 */}
      <div className="table-wrapper">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={tableData}
          pagination={false}
          className="exam-table"
        />
      </div>
      <Modal
        title="考试详情"
        width={860}
        open={infoOpen}
        onCancel={() => setInfoOpen(false)}
        footer={null}
        className="exam-result-modal"
      >
        <div className="header-wrapper">
          <div className="title-group">
            <h1 className="main-title">
              用户考试详情：{detailData.userName}（{detailData.exam?.examName}）
            </h1>
          </div>
        </div>
        <div className="stats-list">
          {sortList.map((item, index) => {
            return (
              <div
                onClick={() => {
                  setSelectTab(index);
                }}
                className={`stat-card ${selectTab === index ? "active" : ""}`}
                key={index}
              >
                <div className="stat-label">
                  第{index + 1}次（{item.finalScore}分）
                </div>
              </div>
            );
          })}
        </div>
        <div className="table-wrapper">
          <Table
            rowKey={(record) => record.id || record.qLabel}
            columns={columns1}
            dataSource={sortList?.[selectTab || 0]?.questionList || []}
            scroll={{ y: 400 }}
            pagination={false}
            className="exam-table"
          />
        </div>
      </Modal>
    </div>
  );
};

export default ExamResult;
