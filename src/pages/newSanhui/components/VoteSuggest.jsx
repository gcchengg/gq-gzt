import {
  Button,
  Form,
  Input,
  Popconfirm,
  Spin,
  Table,
  Tooltip,
  message,
} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { suggestGet, suggestSave } from "../mock/voteSuggestApi";
import voteSuggestPdfUrl from "../mock/data/companyReview/6a3b7ad8e4b0329cf1b968eb.pdf?url";
import "./VoteSuggest.css";

const resultText = {
  0: "反对",
  1: "同意",
  2: "有条件同意",
  "-1": "回避表决",
};

function VoteResult({ enabled, result, elusion }) {
  if (enabled !== "1") return "-";

  const value = elusion === "1" ? "-1" : result;

  return (
    <span className="vote-suggest-result-text">{resultText[value] || "-"}</span>
  );
}

const meetingFields = [
  {
    key: "bod",
    flag: "bodFlag",
    result: "bodCompResult",
    elusion: "bodVoteElusionFlag",
    advice: "bodAdvice",
    title: "董事会",
    label: "向董事会发起的建议",
  },
  {
    key: "bos",
    flag: "bosFlag",
    result: "bosCompResult",
    elusion: "bosVoteElusionFlag",
    advice: "bosAdvice",
    title: "监事会",
    label: "向监事会发起的建议",
  },
  {
    key: "shs",
    flag: "shsFlag",
    result: "shsCompResult",
    elusion: "shsVoteElusionFlag",
    advice: "shsAdvice",
    title: "股东会",
    label: "向股东会发起的建议",
  },
];

const sendTaskTip = (
  <div className="vote-suggest-send-tip">
    <strong>表决建议：提交后</strong>
    <p>1. 原先：发送给董监事发送表决建议确认，现在：不发送该任务</p>
    <p>2. 点击【发送建议单任务】后，发送【表决建议单】任务</p>
    <p>3. 整个三会结束后关闭【表决建议单】任务</p>
    <p>4. 第一次给董事发送任务，第二次不会发出任务只会发送钉钉消息</p>
    <p>4. 根据会议时间，提前三天给管户发送提醒让他点击发送建议单任务</p>
  </div>
);

function openVoteSuggestPdf() {
  const opened = window.open(
    voteSuggestPdfUrl,
    "_blank",
    "noopener,noreferrer",
  );
  if (opened) {
    opened.opener = null;
  }
}

function createTopicAdviceValues(data = {}, topics = []) {
  return topics.reduce((values, topic, index) => {
    const key = topic.key || topic.id || index;
    values[key] = {
      bodAdvice: topic.bodAdvice || data.bodAdvice || "",
      bosAdvice: topic.bosAdvice || data.bosAdvice || "",
      shsAdvice: topic.shsAdvice || data.shsAdvice || "",
    };
    return values;
  }, {});
}

export default function VoteSuggest({ id, editStatus, disabled }) {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const isDetail = editStatus === "detail";
  const actionDisabled = Boolean(disabled);

  const columns = useMemo(
    () => [
      {
        title: "序号",
        dataIndex: "index",
        width: 70,
        render: (_value, _record, index) => index + 1,
      },
      {
        title: "议题名称",
        dataIndex: "topicName",
        width: 280,
        fixed: "left",
        render: (text, record) => (
          <div className="vote-suggest-topic-name">
            <strong>{text}</strong>
          </div>
        ),
      },
      {
        title: "表决建议",
        className: "vote-suggest-result-group",
        children: meetingFields.map((meeting) => ({
          title: meeting.title,
          dataIndex: meeting.result,
          width: 128,
          align: "center",
          render: (_value, record) => (
            <VoteResult
              enabled={record[meeting.flag]}
              result={record[meeting.result]}
              elusion={record[meeting.elusion]}
            />
          ),
        })),
      },
      {
        title: "发起建议",
        className: "vote-suggest-advice-group",
        children: meetingFields.map((meeting) => ({
          title: meeting.label,
          dataIndex: meeting.advice,
          width: 290,
          render: (_value, record) => {
            const enabled = record[meeting.flag] === "1";

            if (!enabled) {
              return (
                <span className="vote-suggest-table-disabled">无需填写</span>
              );
            }

            return (
              <Form.Item
                className="vote-suggest-table-form-item"
                name={["topicAdvices", record.key, meeting.advice]}
                rules={
                  isDetail
                    ? []
                    : [
                        {
                          required: true,
                          message: `请输入${meeting.title}建议`,
                        },
                      ]
                }
              >
                <Input.TextArea
                  placeholder={`请输入${meeting.title}建议`}
                  allowClear
                  disabled={isDetail}
                  autoSize={{ minRows: 2, maxRows: 4 }}
                />
              </Form.Item>
            );
          },
        })),
      },
    ],
    [isDetail],
  );

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await suggestGet({ sanhuiMgmtId: id });
      if (res.code !== 200) return;

      const data = res.data || {};
      form.setFieldsValue({
        id: data.id,
        summary: data.summary,
        addlSummary: data.addlSummary,
      });
      setDetailData(data);
      const topics = (data.sanhuiTopicAssessMiscVoList || []).map(
        (item, index) => ({
          ...item,
          key: item.id || index,
        }),
      );
      setDataSource(topics);
      form.setFieldValue("topicAdvices", createTopicAdviceValues(data, topics));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const persist = async (status) => {
    const values =
      status === "1" ? await form.validateFields() : form.getFieldsValue();
    const topicAdvices = values.topicAdvices || {};
    const nextTopics = dataSource.map((topic) => ({
      ...topic,
      ...(topicAdvices[topic.key] || {}),
    }));

    const res = await suggestSave({
      ...values,
      sanhuiTopicAssessMiscVoList: nextTopics,
      sanhuiMgmtId: id,
      status,
    });
    if (res.code !== 200) return;

    form.setFieldValue("id", res.data.id);
    message.success(res.message || "保存成功");

    if (status === "1") {
      navigate("/GztHome?task=meetingVote");
      return;
    }

    fetchData();
  };

  const handleDownload = async () => {
    const values = form.getFieldsValue();
    const topicAdvices = values.topicAdvices || {};
    const res = await suggestSave({
      ...values,
      sanhuiTopicAssessMiscVoList: dataSource.map((topic) => ({
        ...topic,
        ...(topicAdvices[topic.key] || {}),
      })),
      sanhuiMgmtId: id,
      status: "0",
    });
    if (res.code !== 200) return;

    form.setFieldValue("id", res.data.id);
    await fetchData();
    openVoteSuggestPdf();
    message.success("表决建议单已在新标签页打开");
  };

  const handleSendTask = async () => {
    const values = form.getFieldsValue();
    const topicAdvices = values.topicAdvices || {};
    const res = await suggestSave({
      ...values,
      sanhuiTopicAssessMiscVoList: dataSource.map((topic) => ({
        ...topic,
        ...(topicAdvices[topic.key] || {}),
      })),
      sanhuiMgmtId: id,
      status: "0",
      adviceTaskSent: "1",
    });
    if (res.code !== 200) return;

    form.setFieldValue("id", res.data.id);
    await fetchData();
    message.success(
      "已发送建议单任务，董事将收到表决建议单任务或钉钉消息（本地假数据）",
    );
  };

  const hasAdviceTarget =
    detailData?.bodFlag === "1" ||
    detailData?.bosFlag === "1" ||
    detailData?.shsFlag === "1";

  return (
    <div className="vote-suggest">
      <Spin spinning={loading}>
        <div className="vote-suggest-content">
          <Form
            form={form}
            layout="vertical"
            className="vote-suggest-form-shell"
            autoComplete="off"
          >
            <div className="vote-suggest-main">
              <div className="vote-suggest-left">
                <div className="vote-suggest-title">表决建议单</div>
                <div className="vote-suggest-form">
                  <Form.Item name="id" hidden />
                  <Form.Item name="summary" label="会议信息">
                    <Input.TextArea disabled={isDetail} rows={4} />
                  </Form.Item>
                  <Form.Item
                    name="addlSummary"
                    label={
                      <div>
                        审议情况
                        <div className="vote-suggest-tip">
                          （请将****年**月**日改为实际日期）
                        </div>
                      </div>
                    }
                  >
                    <Input.TextArea
                      placeholder="请输入"
                      allowClear
                      disabled={isDetail}
                      rows={4}
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
            <div className="vote-suggest-table-section">
              <div className="vote-suggest-title">
                <span>表决建议</span>
                <small>
                  {dataSource.length} 个议题，按召开会议填写对应建议
                </small>
              </div>
              <Table
                rowKey="key"
                columns={columns}
                bordered
                dataSource={dataSource}
                pagination={false}
                scroll={{ x: 1540, y: 520 }}
              />
            </div>
          </Form>
          <div className="vote-suggest-footer">
            <Button disabled={actionDisabled} onClick={handleDownload}>
              下载表决建议单
            </Button>
            {hasAdviceTarget && !isDetail ? (
              <div className="vote-suggest-actions">
                <Button disabled={actionDisabled} onClick={() => persist("0")}>
                  保存
                </Button>
                <Button
                  type="primary"
                  disabled={actionDisabled}
                  onClick={() => persist("1")}
                >
                  提交
                </Button>
                <span className="vote-suggest-task-action">
                  <Popconfirm
                    title="确认发送建议单任务？"
                    description="本操作将给董监高发送表决建议单任务。"
                    okText="确认发送"
                    cancelText="取消"
                    onConfirm={handleSendTask}
                    disabled={actionDisabled}
                  >
                    <Button disabled={actionDisabled}>发送建议单任务</Button>
                  </Popconfirm>
                  <Tooltip
                    title={sendTaskTip}
                    placement="topRight"
                    overlayStyle={{ maxWidth: "none" }}
                    overlayClassName="vote-suggest-send-tooltip"
                  >
                    <QuestionCircleOutlined className="vote-suggest-help-icon" />
                  </Tooltip>
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </Spin>
    </div>
  );
}
