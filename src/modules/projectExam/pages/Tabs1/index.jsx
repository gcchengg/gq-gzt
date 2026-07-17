import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Table,
  Button,
  Select,
  Input,
  Form,
  Drawer,
  message,
} from "antd";
import { ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { sanhuiStatus } from "@/pages/recommendationLetter/support";
import moment from "moment";
import { examPageList, examQuestionPageList } from "../../api/index";
import AddDrawer from "./addDrawer";
import ResultDrawer from "./resultDrawer";
import QuestionDrawer from "./questionDrawer";
import "./index.less";

const { Option } = Select;

const MedalManager = () => {
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [pagination1, setPagination1] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [tableData, setTableData] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [questionOpen, setQuestionOpen] = useState(false); // 试题编辑弹窗
  const [rowData, setRowData] = useState({});
  const [detailData, setDetailData] = useState([]);
  const [detailInfo, setDetailInfo] = useState({});
  const [addData, setAddData] = useState({});
  const [detailIsEdit, setDetailIsEdit] = useState(false);
  const [editQuestionData, setEditQuestionData] = useState({}); // 当前编辑的试题数据
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const examStoreRef = useRef([]);
  const questionStoreRef = useRef(new Map());

  const getList = async (params = {}) => {
    try {
      const values = form.getFieldsValue();
      setLoading(true);
      if (examStoreRef.current.length === 0) {
        const res = await examPageList();
        if (res.code === 200) {
          examStoreRef.current = res.data?.list || [];
        }
      }
      const current = params.current || pagination.current;
      const pageSize = params.pageSize || pagination.pageSize;
      const filteredData = examStoreRef.current.filter((item) => {
        const matchesStatus =
          values.status === undefined || values.status === null
            ? true
            : String(item.status) === String(values.status);
        const matchesName = values.examName
          ? item.examName?.includes(values.examName.trim())
          : true;
        return matchesStatus && matchesName;
      });
      setTableData(
        filteredData.slice((current - 1) * pageSize, current * pageSize),
      );
      setPagination({ current, pageSize, total: filteredData.length });
    } catch (error) {
      message.error("考试列表加载失败");
    } finally {
      setLoading(false);
    }
  };
  const getDeatil = async (params = {}) => {
    try {
      setLoading(true);
      const values = form1.getFieldsValue();
      const examId = params.id || detailInfo.id;
      const current = params.current || pagination1.current;
      const pageSize = params.pageSize || pagination1.pageSize;
      if (!questionStoreRef.current.has(examId)) {
        const res = await examQuestionPageList({ examId });
        questionStoreRef.current.set(examId, res.data?.list || []);
      }
      const questions = questionStoreRef.current.get(examId) || [];
      const filteredData = values.qLabel
        ? questions.filter((item) =>
            item.qLabel?.includes(values.qLabel.trim()),
          )
        : questions;
      setDetailData(
        filteredData.slice((current - 1) * pageSize, current * pageSize),
      );
      setPagination1({ current, pageSize, total: filteredData.length });
    } catch (error) {
      message.error("试题详情加载失败");
    } finally {
      setLoading(false);
    }
  };
  const handleTableChange = (pagination) => {
    getList({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };
  const handleTableChange1 = (pagination) => {
    getDeatil({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };
  useEffect(() => {
    getList();
  }, []);

  // 考试管理表格列配置
  const examColumns = [
    {
      title: "测试名称",
      width: 280,
      dataIndex: "examName",
    },
    {
      title: "测试期限",
      width: 220,
      dataIndex: "startDate",
      render: (text, record) => {
        const start = record.startDate
          ? moment(record.startDate).format("YYYY-MM-DD")
          : "";
        const end = record.endDate
          ? moment(record.endDate).format("YYYY-MM-DD")
          : "";
        return `${start} 至 ${end}`;
      },
    },
    {
      title: "状态",
      width: 100,
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        return (
          <div>
            {sanhuiStatus(record.status, [
              { value: "-1", text: "出题中" },
              { value: "0", text: "已出题" },
              { value: "1", text: "已发布" },
              { value: "2", text: "已结束" },
              { value: "3", text: "已终止" },
            ])}
          </div>
        );
      },
    },
    {
      title: "操作",
      width: 280,
      dataIndex: "action",
      render: (_, record) => (
        <div className="action-buttons">
          <Button
            loading={loading}
            onClick={async () => {
              getDeatil({ id: record.id });
              setDetailInfo(record);
              setDetailOpen(true);
              setDetailIsEdit(record.status === "0");
            }}
          >
            查看试题
          </Button>
          <Button
            type="primary"
            ghost
            onClick={() => {
              setResultOpen(true);
              setRowData(record);
            }}
          >
            考试结果
          </Button>
          {record.status === "0" && (
            <Button
              type="primary"
              ghost
              onClick={() => {
                Modal.confirm({
                  title: "发布考试确认",
                  icon: <ExclamationCircleOutlined />,
                  content: "确定要发布该考试吗？",
                  okText: "确定",
                  cancelText: "取消",
                  onOk: () => {
                    examStoreRef.current = examStoreRef.current.map((item) =>
                      item.id === record.id ? { ...item, status: "1" } : item,
                    );
                    message.success("提交成功，考试已发布！");
                    getList();
                  },
                });
              }}
            >
              发布考试
            </Button>
          )}
          {record.status !== "2" && record.status !== "3" && (
            <Button
              danger
              onClick={() => {
                Modal.confirm({
                  title: "终止考试确认",
                  icon: <ExclamationCircleOutlined />,
                  content: "确定要终止该考试吗？",
                  okText: "确定",
                  cancelText: "取消",
                  onOk: () => {
                    examStoreRef.current = examStoreRef.current.map((item) =>
                      item.id === record.id ? { ...item, status: "3" } : item,
                    );
                    message.success("提交成功，任务已结束！");
                    getList();
                  },
                });
              }}
            >
              终止考试
            </Button>
          )}
          <Button
            type="primary"
            ghost
            onClick={() => {
              setAddOpen("detail");
              setAddData(record);
            }}
          >
            查看详情
          </Button>
        </div>
      ),
    },
  ];
  // 试题类型映射
  const questionTypeMap = {
    100: "单选题",
    200: "多选题",
    300: "判断题",
  };

  const columns1 = [
    {
      title: "题型",
      dataIndex: "qType",
      width: 100,
      render: (text) => questionTypeMap[text] || text,
    },
    {
      title: "题目",
      dataIndex: "qLabel",
    },
    {
      title: "选项",
      dataIndex: "answerList",
      render: (answerList) => {
        const labelList = ["A", "B", "C", "D", "E", "F"];
        const arr =
          answerList?.map((item, idx) => {
            return `${labelList[idx]}. ${item.ansLabel}`;
          }) || [];
        return arr.join(" ； ");
      },
    },
    {
      title: "正确答案",
      dataIndex: "answerList",
      width: 120,
      render: (answerList) => {
        const labelList = ["A", "B", "C", "D", "E", "F"];
        const arr =
          answerList
            ?.map((item, idx) => ({ ...item, label: labelList[idx] }))
            ?.filter((item) => item.correctFlag === "1")
            ?.map((item) => item.label) || [];
        return arr.join("、");
      },
    },
    detailIsEdit && {
      title: "操作",
      dataIndex: "action",
      width: 120,
      render: (_, record) => (
        <div className="action-buttons-edit">
          <Button
            type="link"
            onClick={() => {
              setEditQuestionData(record);
              setQuestionOpen(true);
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            onClick={() => {
              Modal.confirm({
                title: "删除试题确认",
                icon: <ExclamationCircleOutlined />,
                content: "确定要删除该试题吗？",
                okText: "确定",
                cancelText: "取消",
                onOk: () => {
                  const questions =
                    questionStoreRef.current.get(detailInfo.id) || [];
                  questionStoreRef.current.set(
                    detailInfo.id,
                    questions.filter((item) => item.id !== record.id),
                  );
                  message.success("提交成功，试题已删除！");
                  getDeatil({ current: 1 });
                },
              });
            }}
          >
            删除
          </Button>
        </div>
      ),
    },
  ].filter(Boolean);

  return (
    <div className="exam-manage-section">
      <div className="section-header">
        <h3 className="section-title">考试列表管理</h3>
        <Button
          type="primary"
          onClick={() => {
            setAddOpen("add");
            setAddData({});
          }}
        >
          新增考试
        </Button>
      </div>

      {/* 查询区域 */}
      <Form form={form} layout="vertical">
        <div className="search-area">
          <Form.Item label="测试状态" name={"status"}>
            <Select
              options={[
                {
                  label: "出题中",
                  value: "-1",
                },
                {
                  label: "已出题",
                  value: 0,
                },
                {
                  label: "进行中",
                  value: 1,
                },
                {
                  label: "已结束",
                  value: 2,
                },
                {
                  label: "已终止",
                  value: 3,
                },
              ]}
              className="status-select"
              allowClear
            />
          </Form.Item>
          <Form.Item label="测试名称" name={"examName"}>
            <Input placeholder="输入测试名称关键词" className="name-input" />
          </Form.Item>
          <Button type="primary" onClick={() => getList({ current: 1 })}>
            查询
          </Button>
          <Button
            onClick={() => {
              form.resetFields();
              getList({ current: 1 });
            }}
          >
            重置
          </Button>
        </div>
      </Form>

      {/* 考试列表表格 */}
      <Table
        rowKey="id"
        columns={examColumns}
        dataSource={tableData}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
        className="common-table"
      />
      {addOpen && (
        <Drawer
          title="新增考试"
          width={"95%"}
          open={addOpen}
          onClose={() => setAddOpen(false)}
          destroyOnClose
          className="add-drawer-wrapper"
        >
          <AddDrawer
            id={addData.id}
            initialData={addData}
            isEdit={addOpen === "add"}
            onClosed={(examData) => {
              setAddOpen(false);
              if (examData) {
                const nextExam = {
                  ...examData,
                  id: examData.id || `exam-${Date.now()}`,
                  status: examData.status || "0",
                };
                const exists = examStoreRef.current.some(
                  (item) => item.id === nextExam.id,
                );
                examStoreRef.current = exists
                  ? examStoreRef.current.map((item) =>
                      item.id === nextExam.id ? nextExam : item,
                    )
                  : [nextExam, ...examStoreRef.current];
              }
              getList({ current: 1 });
            }}
          />
        </Drawer>
      )}
      {resultOpen && (
        <Drawer
          title="考试结果"
          width={800}
          open={resultOpen}
          onClose={() => setResultOpen(false)}
          destroyOnClose
        >
          <ResultDrawer
            rowData={rowData}
            onClosed={() => setResultOpen(false)}
          />
        </Drawer>
      )}
      {detailOpen && (
        <Modal
          title="试题列表"
          width={"90%"}
          open={detailOpen}
          onCancel={() => setDetailOpen(false)}
          className="exam-result-modal"
          footer={null}
        >
          <div className="header-wrapper">
            <Form form={form1} layout="vertical">
              <div className="search-area">
                <Form.Item label="题目名称" name={"qLabel"}>
                  <Input placeholder="输入题目关键词" className="name-input" />
                </Form.Item>
                <Button
                  type="primary"
                  onClick={() => getDeatil({ current: 1 })}
                >
                  查询
                </Button>
                <Button
                  onClick={() => {
                    form1.resetFields();
                    getDeatil({ current: 1 });
                  }}
                >
                  重置
                </Button>
              </div>
            </Form>
            {detailIsEdit && (
              <Button
                type="primary"
                onClick={() => {
                  setEditQuestionData({});
                  setQuestionOpen(true);
                }}
                icon={<PlusOutlined />}
              >
                新增试题
              </Button>
            )}
          </div>

          <div className="table-wrapper">
            <Table
              rowKey="id"
              columns={columns1}
              dataSource={detailData || []}
              scroll={{ y: 400 }}
              loading={loading}
              pagination={{
                current: pagination1.current,
                pageSize: pagination1.pageSize,
                total: pagination1.total,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条`,
              }}
              onChange={handleTableChange1}
              className="exam-table"
            />
          </div>
        </Modal>
      )}
      {/* 试题编辑弹窗 */}
      {questionOpen && (
        <Modal
          title={editQuestionData ? "编辑试题" : "新增试题"}
          width={900}
          open={questionOpen}
          onCancel={() => setQuestionOpen(false)}
          destroyOnClose
          className="question-modal"
          footer={null}
        >
          <QuestionDrawer
            examId={detailInfo.id}
            editData={editQuestionData}
            onClosed={(questionData) => {
              setQuestionOpen(false);
              if (questionData) {
                const questions =
                  questionStoreRef.current.get(detailInfo.id) || [];
                const nextQuestion = {
                  ...questionData,
                  id: questionData.id || `question-${Date.now()}`,
                };
                const exists = questions.some(
                  (item) => item.id === nextQuestion.id,
                );
                questionStoreRef.current.set(
                  detailInfo.id,
                  exists
                    ? questions.map((item) =>
                        item.id === nextQuestion.id ? nextQuestion : item,
                      )
                    : [nextQuestion, ...questions],
                );
              }
              getDeatil({ current: 1 });
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default MedalManager;
