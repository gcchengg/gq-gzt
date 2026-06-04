import { Button, Form, Input, Spin, Table, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { suggestGet, suggestSave } from "../mockApi";
import "./VoteSuggest.css";

const resultText = {
  0: "反对",
  1: "同意",
  2: "有条件同意",
};

function VoteResult({ enabled, result, elusion }) {
  if (enabled !== "1") return "-";

  const isOpposed = result === "0";

  return (
    <>
      <span className={isOpposed ? "vote-suggest-result-no" : "vote-suggest-result-yes"}>
        {resultText[result] || "-"}
      </span>
      {elusion === "1" ? <span>（回避表决）</span> : null}
    </>
  );
}

export default function VoteSuggest({
  id,
  editStatus,
  disabled,
}) {
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
        width: 260,
      },
      {
        title: "董事会表决建议",
        dataIndex: "bodCompResult",
        width: 160,
        render: (_value, record) => (
          <VoteResult
            enabled={record.bodFlag}
            result={record.bodCompResult}
            elusion={record.bodVoteElusionFlag}
          />
        ),
      },
      {
        title: "监事会表决建议",
        dataIndex: "bosCompResult",
        width: 160,
        render: (_value, record) => (
          <VoteResult
            enabled={record.bosFlag}
            result={record.bosCompResult}
            elusion={record.bosVoteElusionFlag}
          />
        ),
      },
      {
        title: "股东会表决建议",
        dataIndex: "shsCompResult",
        width: 160,
        render: (_value, record) => (
          <VoteResult
            enabled={record.shsFlag}
            result={record.shsCompResult}
            elusion={record.shsVoteElusionFlag}
          />
        ),
      },
    ],
    [],
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
        bodAdvice: data.bodAdvice,
        bosAdvice: data.bosAdvice,
        shsAdvice: data.shsAdvice,
      });
      setDetailData(data);
      setDataSource(
        (data.sanhuiTopicAssessMiscVoList || []).map((item, index) => ({
          ...item,
          key: item.id || index,
        })),
      );
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

    const res = await suggestSave({
      ...values,
      sanhuiMgmtId: id,
      status,
    });
    if (res.code !== 200) return;

    form.setFieldValue("id", res.data.id);
    message.success(res.message || "保存成功");

    if (status === "1") {
      navigate("/GztHome");
      return;
    }

    fetchData();
  };

  const handleDownload = async () => {
    const values = form.getFieldsValue();
    const res = await suggestSave({
      ...values,
      sanhuiMgmtId: id,
      status: "0",
    });
    if (res.code !== 200) return;

    form.setFieldValue("id", res.data.id);
    await fetchData();
    message.success("已生成表决建议单下载任务（本地假数据）");
  };

  const hasAdviceTarget =
    detailData?.bodFlag === "1" ||
    detailData?.bosFlag === "1" ||
    detailData?.shsFlag === "1";

  return (
    <div className="vote-suggest">
      <Spin spinning={loading}>
        <div className="vote-suggest-content">
          <div className="vote-suggest-main">
            <div className="vote-suggest-left">
              <div className="vote-suggest-title">表决建议单</div>
              <Form
                form={form}
                layout="vertical"
                className="vote-suggest-form"
                autoComplete="off"
              >
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
                <Form.Item name="bodAdvice" label="向董事会发起的建议">
                  <Input.TextArea
                    placeholder="请输入"
                    allowClear
                    disabled={detailData?.bodFlag === "0" || isDetail}
                    rows={4}
                  />
                </Form.Item>
                <Form.Item name="bosAdvice" label="向监事会发起的建议">
                  <Input.TextArea
                    placeholder="请输入"
                    allowClear
                    disabled={detailData?.bosFlag === "0" || isDetail}
                    rows={4}
                  />
                </Form.Item>
                <Form.Item name="shsAdvice" label="向股东会发起的建议">
                  <Input.TextArea
                    placeholder="请输入"
                    allowClear
                    disabled={detailData?.shsFlag === "0" || isDetail}
                    rows={4}
                  />
                </Form.Item>
              </Form>
            </div>
            <div className="vote-suggest-right">
              <div className="vote-suggest-title">表决建议</div>
              <Table
                rowKey="key"
                columns={columns}
                bordered
                dataSource={dataSource}
                pagination={false}
                scroll={{ y: 460 }}
              />
            </div>
          </div>
          {hasAdviceTarget && !isDetail ? (
            <div className="vote-suggest-footer">
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
            </div>
          ) : null}
          <div className="vote-suggest-download">
            <Button disabled={actionDisabled} onClick={handleDownload}>
              下载表决建议单
            </Button>
          </div>
        </div>
      </Spin>
    </div>
  );
}
