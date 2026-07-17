import React, { useState, useEffect, useRef } from "react";
import {
  Form,
  Input,
  Select,
  Checkbox,
  Button,
  message,
  Spin,
  Radio,
} from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { examCompanyList } from "../../api/index";
import "./index.less";

const { Option } = Select;

const QuestionDrawer = ({ onClosed, examId, editData = {} }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [questionOptions, setQuestionOptions] = useState(["A", "B", "C", "D"]);
  const [companyList, setCompanyList] = useState([]);
  const lastQTypeRef = useRef(null); // 记录上一次的题型

  const qTypeValue = Form.useWatch("qType", form);
  const tagListValue = Form.useWatch("tagList", form);

  // 初始化表单数据
  useEffect(() => {
    if (editData.id) {
      const answerList = editData.answerList || [];
      const obj = { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E", 6: "F" };
      const arr = answerList.map((item, index) => obj[index + 1]);
      const tag = editData.tagList?.[0]?.tagType || "0";
      setQuestionOptions(arr);
      const correctAnswers = answerList
        .map((item, index) => (item.correctFlag === "1" ? arr[index] : null))
        .filter(Boolean);

      const qType = editData.qType || "100";

      // 先设置上一次题型，避免触发重置逻辑
      lastQTypeRef.current = qType;

      form.setFieldsValue({
        qType: qType,
        qLabel: editData.qLabel || "",
        ...answerList.reduce((acc, item, index) => {
          acc[`option${arr[index]}`] = item.ansLabel || "";
          return acc;
        }, {}),
        correctAnswer: correctAnswers,
        tagList: tag,
        companyName: tag === "0" ? "" : editData.tagList?.[0]?.tagValue || "",
      });
    } else {
      // 设置默认值
      lastQTypeRef.current = "100";
      form.setFieldsValue({
        qType: "100",
        tagList: "0",
        correctAnswer: [],
      });
    }
  }, [editData.id]);

  useEffect(() => {
    if (examId) {
      examCompanyList({ examId }).then((res) => {
        if (res.code === 200) {
          setCompanyList(
            res.data?.map((item) => ({
              value: item.shortForm || item.companyName,
              label: item.shortForm || item.companyName,
            })) || [],
          );
        }
      });
    }
  }, [examId]);

  // 题型改变时重置选项和正确答案
  useEffect(() => {
    // 如果是第一次设置题型，先初始化lastQTypeRef
    if (!lastQTypeRef.current && qTypeValue) {
      lastQTypeRef.current = qTypeValue;
      return;
    }

    // 只有真正从一个题型切换到另一个题型时才重置
    if (
      lastQTypeRef.current &&
      qTypeValue &&
      lastQTypeRef.current !== qTypeValue
    ) {
      if (qTypeValue === "300") {
        // 判断题只有两个选项
        setQuestionOptions(["A", "B"]);
        form.setFieldsValue({
          correctAnswer: [],
          optionA: "正确",
          optionB: "错误",
          optionC: "",
          optionD: "",
          optionE: "",
          optionF: "",
        });
      } else if (qTypeValue === "100" || qTypeValue === "200") {
        // 单选和多选恢复四个选项
        setQuestionOptions(["A", "B", "C", "D"]);
        form.setFieldsValue({
          correctAnswer: [],
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          optionE: "",
          optionF: "",
        });
      }
      // 更新上一次题型
      lastQTypeRef.current = qTypeValue;
    }
  }, [qTypeValue]);

  // 添加选项
  const addOption = () => {
    if (questionOptions.length < 999) {
      const nextLabel = String.fromCharCode(65 + questionOptions.length);
      setQuestionOptions([...questionOptions, nextLabel]);
      form.setFieldsValue({ [`option${nextLabel}`]: "" });
    }
  };

  // 删除选项
  const removeOption = (label) => {
    if (questionOptions.length > 2) {
      // 删除选项后重新排序（A、B、C、D...）
      const newOptions = ["A", "B", "C", "D", "E", "F"].slice(
        0,
        questionOptions.length - 1,
      );

      // 获取当前选项的值
      const currentValues = {};
      questionOptions.forEach((opt) => {
        currentValues[opt] = form.getFieldValue(`option${opt}`) || "";
      });

      // 获取当前正确答案
      const currentAnswers = form.getFieldValue("correctAnswer") || [];

      // 重新映射选项值和正确答案
      const newValues = {};
      let newAnswers = [];
      const deletedIndex = questionOptions.indexOf(label);

      newOptions.forEach((newOpt, index) => {
        // 确定原来的选项标签
        let originalOpt = questionOptions[index];
        if (index >= deletedIndex && questionOptions[index + 1]) {
          originalOpt = questionOptions[index + 1];
        }
        newValues[`option${newOpt}`] = currentValues[originalOpt] || "";

        // 更新正确答案
        if (currentAnswers.includes(originalOpt)) {
          newAnswers.push(newOpt);
        }
      });

      // 清空多余的选项
      ["A", "B", "C", "D", "E", "F"].slice(newOptions.length).forEach((opt) => {
        newValues[`option${opt}`] = "";
      });

      setQuestionOptions(newOptions);
      form.setFieldsValue({
        ...newValues,
        correctAnswer: newAnswers,
      });
    }
  };

  // 单选/判断题的正确答案处理
  const handleCorrectAnswerChange = (values) => {
    if ((qTypeValue === "100" || qTypeValue === "300") && values.length > 1) {
      // 只保留最后选择的一个
      form.setFieldsValue({ correctAnswer: [values[values.length - 1]] });
    }
  };

  // 保存试题
  const onSave = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      // 验证正确答案是否选择
      if (!values.correctAnswer || values.correctAnswer.length === 0) {
        message.error("请选择正确答案");
        return;
      }

      // 单选/判断题验证
      if (
        (qTypeValue === "100" || qTypeValue === "300") &&
        values.correctAnswer.length > 1
      ) {
        message.error("单选题/判断题只能选择一个正确答案");
        return;
      }

      setLoading(true);
      // 构建answerList
      const answerList = questionOptions.map((label) => ({
        ansLabel: values[`option${label}`] || "",
        correctFlag: (values.correctAnswer || []).includes(label) ? "1" : "0",
        ansType: values.qType,
      }));

      const data = {
        ...(editData || {}),
        id: editData?.id || null,
        examId,
        qType: values.qType,
        qLabel: values.qLabel,
        tagList: [
          {
            tagType: values.tagList,
            tagValue: values.tagList === "0" ? "通用题目" : values.companyName,
          },
        ],
        answerList,
      };

      setLoading(false);
      message.success("保存成功");
      onClosed(data);
    } catch (error) {
      message.error("请检查输入项");
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div className="question-drawer-container">
        <div className="form-content">
          <Form form={form} layout="vertical">
            {/* 试题类型 */}
            <div className="form-section">
              <div className="qtype-row">
                <Form.Item
                  label="试题类型"
                  name="qType"
                  rules={[{ required: true, message: "请选择题型" }]}
                >
                  <Select className="qtype-select">
                    <Option value="100">单选题</Option>
                    <Option value="200">多选题</Option>
                    <Option value="300">判断题</Option>
                  </Select>
                </Form.Item>

                {/* 题目标签 */}
                <div className="tag-section">
                  <span className="tag-label">题目标签</span>
                  <Form.Item
                    name="tagList"
                    rules={[{ required: true, message: "请选择题签类型" }]}
                  >
                    <Radio.Group name="tagList" defaultValue="0">
                      <Radio value="0" className="tag-radio">
                        通用
                      </Radio>
                      <Radio value="100" className="tag-radio">
                        关联公司
                      </Radio>
                    </Radio.Group>
                  </Form.Item>
                  {tagListValue === "100" && (
                    <Form.Item
                      name="companyName"
                      rules={[{ required: true, message: "请选择关联公司" }]}
                    >
                      <Select
                        className="company-select"
                        placeholder="搜索选择公司"
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label || "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      >
                        {companyList.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  )}
                </div>
              </div>

              {/* 试题问题 */}
              <Form.Item
                label="试题问题"
                name="qLabel"
                rules={[{ required: true, message: "请输入试题问题" }]}
              >
                <Input.TextArea
                  placeholder="请输入试题问题"
                  rows={2}
                  className="question-input"
                />
              </Form.Item>
            </div>

            {/* 选项 */}
            <div className="form-section">
              <div className="section-header">
                <h3 className="section-title">选项</h3>
                {qTypeValue === "200" && questionOptions.length < 999 && (
                  <Button
                    icon={<PlusOutlined />}
                    onClick={addOption}
                    size="small"
                  >
                    新增选项
                  </Button>
                )}
              </div>
              <div className="options-grid">
                {questionOptions.map((label) => (
                  <div key={label} className="option-item">
                    <Form.Item
                      label={`${label} 选项内容`}
                      name={`option${label}`}
                      rules={[
                        { required: true, message: `请输入${label}选项内容` },
                      ]}
                    >
                      <Input placeholder={`${label} 选项内容`} />
                    </Form.Item>
                    {qTypeValue === "200" && questionOptions.length > 2 && (
                      <Button
                        type="text"
                        danger
                        icon={<MinusOutlined />}
                        onClick={() => removeOption(label)}
                        className="remove-option-btn"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 正确答案 */}
            <div className="form-section">
              <h3 className="section-title">正确答案</h3>
              <Form.Item name="correctAnswer">
                <Checkbox.Group onChange={handleCorrectAnswerChange}>
                  {questionOptions.map((label) => (
                    <Checkbox key={label} value={label}>
                      {label}
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              </Form.Item>
              <p className="answer-tip">
                {qTypeValue === "100" || qTypeValue === "300"
                  ? "单选题/判断题只能选择一个正确答案"
                  : "多选题可以选择多个正确答案"}
              </p>
            </div>
          </Form>
        </div>

        {/* 底部按钮 */}
        <div className="footer-buttons">
          <Button type="primary" onClick={onSave} loading={loading}>
            {"保存试题"}
          </Button>
        </div>
      </div>
    </Spin>
  );
};

export default QuestionDrawer;
