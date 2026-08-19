import { useState } from "react";
import { Button } from "antd";
import TopicForm from "./TopicForm";
import Assign from "./Assign";
import "./TopicReport.css";

export default function TopicReport(props) {
  const [activeKey, setActiveKey] = useState("1");
  const [reportId, setReportId] = useState(null);

  const items = [
    {
      key: "1",
      label: "专题汇报",
      children: (
        <TopicForm
          id={props.id}
          setActiveKey={setActiveKey}
          setReportId={setReportId}
          reportId={reportId}
          editStatus={props.editStatus}
          onGoAssign={() => setActiveKey("2")}
        />
      ),
    },
    {
      key: "2",
      label: "汇报后交办事项录入",
      children: (
        <Assign
          id={props.id}
          setActiveKey={setActiveKey}
          setReportId={setReportId}
          reportId={reportId}
          onCloseDetail={props.onCloseDetail}
          editStatus={props.editStatus}
        />
      ),
    },
  ];

  return (
    <div className="topic-report">
      <div className="topic-report-shell">
        <div className="topic-report-head">
          <div>
            <div className="topic-report-eyebrow">专题汇报</div>
            <div className="topic-report-heading">董监事专题汇报工作台</div>
          </div>
          <div className="topic-report-segmented">
            {items.map((item) => (
              <Button
                key={item.key}
                type={activeKey === item.key ? "primary" : "default"}
                onClick={() => setActiveKey(item.key)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="topic-report-body">
          {items.find((item) => item.key === activeKey)?.children}
        </div>
      </div>
    </div>
  );
}
