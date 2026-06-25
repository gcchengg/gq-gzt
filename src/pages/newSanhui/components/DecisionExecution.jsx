import {
  Button,
  Input,
  Spin,
  Table,
  Tabs,
  Tooltip,
  message,
} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import {
  initDecisionExec,
  saveExec,
} from "../mockApi";
import AssignFollow from "./AssignFollow";
import "./DecisionExecution.css";

const hasDecisionValue = (value) => value !== undefined && value !== null && value !== "";

const passText = (value) => {
  if (value === "0") return "反对";
  if (value === "1") return "同意";
  if (value === "2") return "有条件同意";
  if (value === "-1" || value === "3") return "回避表决";
  return "-";
};

const getOfficeDecision = (row, meetingKey) => {
  const fieldMap = {
    bod: "gqBodPassFlag",
    bos: "gqBosPassFlag",
    sh: "gqShPassFlag",
  };
  const currentValue = row[fieldMap[meetingKey]];
  if (hasDecisionValue(currentValue)) return currentValue;
  if (hasDecisionValue(row.gqPassFlag) && hasDecisionValue(getThreeDecision(row, meetingKey))) return row.gqPassFlag;
  return "";
};

const getThreeDecision = (row, meetingKey) => {
  const fieldMap = {
    bod: "bodPassFlag",
    bos: "bosPassFlag",
    sh: "shPassFlag",
  };
  return row[fieldMap[meetingKey]];
};

const getDecisionConsistency = (row) => {
  const meetingKeys = ["bod", "bos", "sh"];
  const compared = meetingKeys
    .map((key) => ({
      officeValue: getOfficeDecision(row, key),
      threeValue: getThreeDecision(row, key),
    }))
    .filter(({ officeValue, threeValue }) => hasDecisionValue(officeValue) || hasDecisionValue(threeValue));

  if (compared.length === 0) return null;

  return compared.every(({ officeValue, threeValue }) => String(officeValue || "") === String(threeValue || ""));
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
        title: "股权公司决策",
        align: "center",
        children: [
          {
            title: "董事会",
            dataIndex: "gqBodPassFlag",
            align: "center",
            width: 120,
            render: (_value, row) => passText(getOfficeDecision(row, "bod")),
          },
          {
            title: "监事会",
            dataIndex: "gqBosPassFlag",
            align: "center",
            width: 120,
            render: (_value, row) => passText(getOfficeDecision(row, "bos")),
          },
          {
            title: "股东会 / 投委会",
            dataIndex: "gqShPassFlag",
            align: "center",
            width: 150,
            render: (_value, row) => passText(getOfficeDecision(row, "sh")),
          },
        ],
      },
      {
        title: "三会决议",
        align: "center",
        children: [
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
        ],
      },
      {
        title: "一致性",
        dataIndex: "consistency",
        align: "center",
        width: 120,
        render: (_value, row) => {
          const matched = getDecisionConsistency(row);
          if (matched === null) return <span>-</span>;
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
          const matched = getDecisionConsistency(row);

          if (matched === null || matched) return "-";

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
      const matched = getDecisionConsistency(row);
      return matched === false && !String(row.diffRemark || "").trim();
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
        <strong>决策情况</strong>
        <span>
          以下列表中总办会与三会决议不一致时，请填写原因说明。
        </span>
      </div>
      <Table
        className="assign-decision-table"
        columns={decisionColumns}
        dataSource={decisionList}
        rowKey={(row) => row.id || row.topicId}
        size="small"
        bordered
        scroll={{ x: 1700, y: 600 }}
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
        {/* <div className="assign-execution-head">
          <div>
            <h3>{record.companyName}</h3>
            <p>
              {record.mgmtNo} / {record.submitUserName} 提报
            </p>
          </div>
        </div> */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "decision",
              label: (
                <span className="assign-tab-label-with-help">
                  决策情况
                  <Tooltip title={<div><div>1.选项统一 同意 反对 有条件同意 回避表决</div><div>2. 股东会议决策 数据 取自审批材料准备</div></div>}>
                    <QuestionCircleOutlined className="assign-tab-help-icon" onClick={(event) => event.stopPropagation()} />
                  </Tooltip>
                </span>
              ),
              children: decisionTab,
            },
            { key: "follow", label: "交办事项", children: followTab },
          ]}
        />
      </div>
    </Spin>
  );
}
