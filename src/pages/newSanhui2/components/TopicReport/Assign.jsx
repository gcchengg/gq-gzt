import { useEffect, useState } from "react";
import { Button, Drawer, Spin, Table, message } from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import AssignDetail from "./AssignDetail";
import {
  initFollowSanhuiMgmtId,
  topicReportSave,
} from "../../mock/topicReportApi";

export default function Assign(props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [assignList, setAssignList] = useState([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState(null);

  const loadList = async (sanhuiMgmtId) => {
    const res = await initFollowSanhuiMgmtId({ sanhuiMgmtId });
    if (res.code !== 200) return;
    setAssignList(res.data?.sanhuiFollowVoList || []);
    props.setReportId(res.data?.sanhuiSpecReportId);
  };

  useEffect(() => {
    if (props.id) loadList(props.id);
  }, [props.id]);

  const columns = [
    {
      title: "序号",
      dataIndex: "index",
      align: "center",
      width: 60,
      render: (_value, _record, index) => index + 1,
    },
    { title: "交办名称", dataIndex: "followName", align: "center", width: 180 },
    { title: "交办内容", dataIndex: "followDetail", width: 240 },
    {
      title: "相关分类",
      dataIndex: "itemType",
      align: "center",
      width: 120,
      render: (value) =>
        ({ 1: "议题相关", 2: "会议相关", 3: "其他" })[value] || "-",
    },
    {
      title: "相关议题/会议名称",
      dataIndex: "toipcName",
      align: "center",
      width: 220,
    },
    {
      title: "交办人",
      dataIndex: "assignUserName",
      align: "center",
      width: 100,
    },
    {
      title: "截止时间",
      dataIndex: "deadlineDate",
      align: "center",
      width: 120,
      render: (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "计划执行时间",
      dataIndex: "planDate",
      align: "center",
      width: 220,
      render: (_value, row) =>
        row.planStartDate && row.planEndDate
          ? `${dayjs(row.planStartDate).format("YYYY-MM-DD")} ~ ${dayjs(row.planEndDate).format("YYYY-MM-DD")}`
          : "-",
    },
    { title: "执行计划", dataIndex: "execDetail", align: "center", width: 180 },
    {
      title: "状态",
      dataIndex: "status",
      align: "center",
      width: 100,
      render: (value) =>
        ({ 0: "执行中", 1: "完成确认中", 2: "结束" })[value] || "-",
    },
    {
      title: "操作",
      dataIndex: "action",
      align: "center",
      fixed: "right",
      width: 90,
      render: (_value, record) => (
        <Button
          type="link"
          disabled={props.editStatus === "detail" || record.status !== "0"}
          onClick={() => {
            setDetailId(record.id);
            setDetailOpen(true);
          }}
        >
          编辑
        </Button>
      ),
    },
  ];

  const onSubmit = async () => {
    setLoading(true);
    try {
      const res = await topicReportSave({
        id: props.reportId,
        sanhuiMgmtId: props.id,
        status: "1",
      });
      if (res.code !== 200) return;
      message.success(res.message || "提交成功");
      navigate("/GztHome?task=meetingVote");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="topic-report-assign">
      <Spin spinning={loading}>
        {props.editStatus !== "detail" ? (
          <div className="topic-report-top-actions">
            <Button
              type="primary"
              onClick={() => {
                setDetailId(null);
                setDetailOpen(true);
              }}
            >
              新增
            </Button>
          </div>
        ) : null}
        <Table
          size="small"
          bordered
          scroll={{ x: 1800 }}
          columns={columns}
          dataSource={assignList}
          rowKey="id"
          pagination={false}
        />
      </Spin>
      <div className="topic-report-actions">
        <Button
          disabled={loading}
          type="primary"
          onClick={() => props.setActiveKey("1")}
        >
          上一步
        </Button>
        {props.editStatus !== "detail" ? (
          <Button disabled={loading} type="primary" onClick={onSubmit}>
            提交
          </Button>
        ) : null}
      </div>
      <Drawer
        title="董监事专题汇报交办"
        placement="right"
        width="80%"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      >
        <AssignDetail
          detailId={detailId}
          sanhuiMgmtId={props.id}
          loadList={loadList}
          onCloseDrawer={() => setDetailOpen(false)}
        />
      </Drawer>
    </div>
  );
}
