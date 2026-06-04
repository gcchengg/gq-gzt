import {
  Button,
  Input,
  Spin,
  Table,
  Tabs,
  message,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import {
  initDecisionExec,
  saveExec,
} from "../mockApi";
import AssignFollow from "./AssignFollow";
import "./AssignExecution.css";

const passText = (value) =>
  value === "0"
    ? "不通过"
    : value === "1"
      ? "通过"
      : value === "2"
        ? "有条件通过"
        : "-";

const pickTopDecision = (row) => {
  if (row.shPassFlag !== undefined && row.shPassFlag !== null && row.shPassFlag !== "") {
    return { from: "sh", value: row.shPassFlag };
  }
  if (row.bosPassFlag !== undefined && row.bosPassFlag !== null && row.bosPassFlag !== "") {
    return { from: "bos", value: row.bosPassFlag };
  }
  if (row.bodPassFlag !== undefined && row.bodPassFlag !== null && row.bodPassFlag !== "") {
    return { from: "bod", value: row.bodPassFlag };
  }
  return { from: null, value: null };
};

export default function AssignExecution({
  id,
  record,
  editStatus,
}) {
  const [loading, setLoading] = useState(false);
  const [decisionList, setDecisionList] = useState([]);
  const [activeTab, setActiveTab] = useState("decision");
  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const decisionRes = await initDecisionExec({ sanhuiMgmtId: id });
      setDecisionList(decisionRes.data.sanhuiVoteTopicList || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [id]);

  const decisionColumns = useMemo(
    () => [
      {
        title: "序号",
        dataIndex: "index",
        width: 70,
        fixed: "left",
        render: (_value, _row, index) => index + 1,
      },
      {
        title: "议题名称",
        dataIndex: "toipcName",
        width: 260,
        render: (_value, row) => row?.eoSanhuiTopic?.toipcName || row?.toipcName || "-",
      },
      {
        title: "总办会",
        dataIndex: "gqPassFlag",
        align: "center",
        width: 120,
        render: passText,
      },
      {
        title: "董事会",
        dataIndex: "bodPassFlag",
        align: "center",
        width: 120,
        render: passText,
      },
      {
        title: "监事会",
        dataIndex: "bosPassFlag",
        align: "center",
        width: 120,
        render: passText,
      },
      {
        title: "股东会 / 投委会",
        dataIndex: "shPassFlag",
        align: "center",
        width: 150,
        render: passText,
      },
      {
        title: "一致性",
        dataIndex: "consistency",
        align: "center",
        width: 120,
        render: (_value, row) => {
          const top = pickTopDecision(row);
          if (!top.from) return <span>-</span>;
          const matched = String(row.gqPassFlag) === String(top.value);
          return matched ? (
            <span className="assign-decision-ok">一致</span>
          ) : (
            <span className="assign-decision-bad">不一致</span>
          );
        },
      },
      {
        title: "原因说明",
        dataIndex: "diffRemark",
        width: 360,
        render: (_value, row, index) => {
          const top = pickTopDecision(row);
          const matched = top.from && String(row.gqPassFlag) === String(top.value);

          if (!top.from || matched) return "-";

          return (
            <Input.TextArea
              value={row.diffRemark}
              autoSize={{ minRows: 2, maxRows: 6 }}
              disabled={!editStatus}
              placeholder="请输入不一致原因"
              onChange={(event) => {
                const value = event.target.value;
                setDecisionList((prev) => {
                  const next = [...prev];
                  next[index] = { ...next[index], diffRemark: value };
                  return next;
                });
              }}
            />
          );
        },
      },
    ],
    [editStatus],
  );

  const handleDecisionSave = async (type) => {
    const invalid = decisionList.find((row) => {
      const top = pickTopDecision(row);
      if (!top.from) return false;
      const matched = String(row.gqPassFlag) === String(top.value);
      return !matched && !String(row.diffRemark || "").trim();
    });

    if (invalid) {
      message.warning("存在“不一致”但未填写原因说明的数据，请补齐后保存");
      return;
    }

    setLoading(true);
    try {
      const res = await saveExec({
        sanhuiMgmtId: id,
        sanhuiVoteTopicList: decisionList,
      });
      if (res.code === 200) {
        message.success("保存成功");
        if (type === "next") {
          setActiveTab("follow");
        }
      } else {
        message.error(res.msg || "保存失败");
      }
    } catch (_error) {
      message.error("保存失败");
    } finally {
      setLoading(false);
    }
  };

  const decisionTab = (
    <div className="assign-decision">
      <div className="assign-warning">
        <strong>决策执行情况</strong>
        <span>
          以下列表中总办会与三会决议不一致时，请填写原因说明。
        </span>
      </div>
      <Table
        columns={decisionColumns}
        dataSource={decisionList}
        rowKey={(row) => row.id || row.topicId}
        size="small"
        bordered
        scroll={{ x: 1400, y: 600 }}
        pagination={false}
      />
      {editStatus ? (
        <div className="assign-decision-footer">
          <Button onClick={() => handleDecisionSave("save")} disabled={loading}>
            保存
          </Button>
          <Button
            type="primary"
            onClick={() => handleDecisionSave("next")}
            disabled={loading}
          >
            下一步
          </Button>
        </div>
      ) : null}
    </div>
  );
  const followTab = <AssignFollow id={id} editStatus={editStatus} />;
  return (
    <Spin spinning={loading} tip="加载中...">
      <div className="assign-execution">
        <div className="assign-execution-head">
          <div>
            <h3>{record.companyName}</h3>
            <p>
              {record.mgmtNo} / {record.submitUserName} 提报
            </p>
          </div>
        </div>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: "decision", label: "决策执行情况", children: decisionTab },
            { key: "follow", label: "交办事项", children: followTab },
          ]}
        />
      </div>
    </Spin>
  );
}
