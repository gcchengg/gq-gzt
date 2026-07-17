import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Checkbox,
  Button,
  message,
  Radio,
} from "antd";
import moment from "moment";
import CompanmyCascader from "../companmyCascader/index";
import {
  examMedalList,
  getAllDingUsers,
  examLibPageList,
  examDetail,
} from "../../api/index";
import "./index.less";
import { runWithCheckVer } from "@/pages/recommendationLetter/support";

const { Option } = Select;

function transformDeptToOption(dept) {
  const children = [];

  // 1）子部门
  if (Array.isArray(dept.childDeptInfos) && dept.childDeptInfos.length > 0) {
    children.push(...dept.childDeptInfos.map(transformDeptToOption));
  }

  // 2）部门下员工
  if (Array.isArray(dept.userInfos) && dept.userInfos.length > 0) {
    children.push(
      ...dept.userInfos.map((user) => ({
        label: user.title ? `${user.name}（${user.title}）` : user.name,
        value: `user_${dept.deptId}_${user.userId}`,
        isLeaf: true,
        type: "user",
        deptId: dept.deptId,
        userId: user.userId,
        rawUser: user,
      })),
    );
  }

  return {
    label: dept.deptName,
    value: `dept_${dept.deptId}`,
    type: "dept",
    deptId: dept.deptId,
    rawDept: dept,
    children: children.length > 0 ? children : undefined,
  };
}
const getUserIdFromTargetValue = (value) => {
  if (typeof value !== "string" || !value.startsWith("user_")) return "";
  const parts = value.split("_");
  return parts.length >= 3 ? parts.slice(2).join("_") : value.slice(5);
};

const formatUserList = (userIds, treeData) => {
  userIds = Array.from(
    new Set(userIds?.map(getUserIdFromTargetValue).filter(Boolean) || []),
  );
  // 1. 建立 userId -> userName 的映射表（遍历一次树形数据，效率更高）
  const userMap = {};

  // 递归遍历树形数据，收集所有用户信息
  const traverseTree = (nodes) => {
    if (!Array.isArray(nodes) || nodes.length === 0) return;

    nodes.forEach((node) => {
      // 匹配【用户节点】，存入映射表
      if (node.type === "user" && node.userId && node.rawUser?.name) {
        userMap[node.userId] = node.rawUser.name;
      }
      // 递归遍历子节点（兼容子部门/子用户嵌套）
      if (node.children && node.children.length) {
        traverseTree(node.children);
      }
    });
  };

  // 执行遍历，生成映射表
  traverseTree(treeData);

  // 2. 根据传入的userId数组，匹配并返回目标格式
  return userIds
    .map((userId) => ({
      userId: userId,
      userName: userMap[userId] || "", // 无匹配用户时用户名为空
    }))
    .filter((item) => item.userName); // 可选：过滤掉不存在的无效用户
};

const findUserValueById = (userId, treeData) => {
  const traverseTree = (nodes) => {
    if (!Array.isArray(nodes) || nodes.length === 0) return null;

    for (const node of nodes) {
      if (node.type === "user" && String(node.userId) === String(userId)) {
        return node.value;
      }
      const found = traverseTree(node.children);
      if (found) return found;
    }

    return null;
  };

  return traverseTree(treeData);
};

const buildSelectedValuesFromDistrUserList = (
  distrUserList = [],
  treeData = [],
) => {
  if (!Array.isArray(distrUserList)) return [];

  return distrUserList
    .map((item) => {
      const userId = item?.userId;
      if (!userId) return null;
      return findUserValueById(userId, treeData) || `user_${userId}`;
    })
    .filter(Boolean);
};

const AddExamDrawer = ({ onClosed, id, isEdit, initialData = {} }) => {
  const [form] = Form.useForm();
  const [targetOptions, setTargetOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [targetValue, setTargetValue] = useState([]);
  const [detailDistrUserList, setDetailDistrUserList] = useState([]);
  const [bankList, setBankList] = useState([]); // 题库列表
  const [badgeList, setBadgeList] = useState([]); // 徽章列表
  const qType100qNums = Form.useWatch("qType100qNums", form);
  const qType200qNums = Form.useWatch("qType200qNums", form);
  const qType300qNums = Form.useWatch("qType300qNums", form);
  const qType100score = Form.useWatch("qType100score", form);
  const qType200score = Form.useWatch("qType200score", form);
  const qType300score = Form.useWatch("qType300score", form);

  useEffect(() => {
    setLoading(true);
    getAllDingUsers()
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          const options = res.data.map(transformDeptToOption);
          setTargetOptions(options);
          setTargetValue((pre) => pre);
        } else {
          message.error("获取组织架构失败");
        }
      })
      .catch(() => {
        message.error("获取组织架构异常");
      })
      .finally(() => {
        setLoading(false);
      });
    examLibPageList({ currentPage: 1, pageSize: 10000, status: "1" }).then(
      (res) => {
        if (res.code === 200) {
          const arr =
            res.data?.list?.map((item) => ({
              ...item,
              value: item.libCode,
              label: item.libName,
            })) || [];
          setBankList([...arr]);
        }
      },
    );
    examMedalList().then((res) => {
      if (res.code === 200) {
        const arr =
          res.data?.map((item) => ({ value: item, label: item })) || [];
        setBadgeList([...arr]);
      }
    });
  }, []);

  const onSave = async () => {
    try {
      const values = form.getFieldsValue();
      const num =
        values.qType100qNums * values.qType100score +
        values.qType200qNums * values.qType200score +
        values.qType300qNums * values.qType300score;
      if (num !== 100) {
        message.error("总分数必须为100分");
        return false;
      }
      await form.validateFields();
      setLoading(true);
      const data = {
        ...values,
        startDate: values.startDate
          ? values.startDate.format("YYYY-MM-DD")
          : "",
        endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : "",
        libList: values.libList.map((item) => {
          return { ...(bankList.find((bank) => bank.value === item) || {}) };
        }),
        questionTypeList: [
          {
            qType: "100",
            qNums: values.qType100qNums,
            score: values.qType100score,
          },
          {
            qType: "200",
            qNums: values.qType200qNums,
            score: values.qType200score,
          },
          {
            qType: "300",
            qNums: values.qType300qNums,
            score: values.qType300score,
          },
        ],
        specItemList: [
          {
            specType: "100",
            enableFlag: values.specType?.includes("100") ? "1" : "0",
          },
          {
            specType: "200",
            enableFlag: values.specType?.includes("200") ? "1" : "0",
          },
        ],
        distrUserList: formatUserList(targetValue, targetOptions),
      };
      setLoading(false);
      onClosed({ ...data, id: id || undefined });
      message.success("保存成功");
      return true;
    } catch (error) {
      message.error("请检查输入项");
      setLoading(false);
    }
  };

  useEffect(() => {
    form.setFieldsValue({
      questionNums:
        (qType100qNums || 0) + (qType200qNums || 0) + (qType300qNums || 0),
    });
  }, [form, qType100qNums, qType200qNums, qType300qNums]);

  useEffect(() => {
    if (id) {
      examDetail({ id }).then((res) => {
        if (res.code === 200) {
          const detail = { ...res.data, ...initialData };
          form.setFieldsValue({
            ...detail,
            startDate: detail.startDate ? moment(detail.startDate) : null,
            endDate: detail.endDate ? moment(detail.endDate) : null,
            libList: detail.libList?.map((item) => item.libCode) || [],
            qType100qNums:
              detail.questionTypeList?.find((item) => item.qType === "100")
                ?.qNums || 0,
            qType100score:
              detail.questionTypeList?.find((item) => item.qType === "100")
                ?.score || 0,
            qType200qNums:
              detail.questionTypeList?.find((item) => item.qType === "200")
                ?.qNums || 0,
            qType200score:
              detail.questionTypeList?.find((item) => item.qType === "200")
                ?.score || 0,
            qType300qNums:
              detail.questionTypeList?.find((item) => item.qType === "300")
                ?.qNums || 0,
            qType300score:
              detail.questionTypeList?.find((item) => item.qType === "300")
                ?.score || 0,
            specType: [
              detail.specItemList?.find((item) => item.specType === "100")
                ?.enableFlag === "1"
                ? "100"
                : "",
              detail.specItemList?.find((item) => item.specType === "200")
                ?.enableFlag === "1"
                ? "200"
                : "",
            ],
          });
          const distrUserList = detail.distrUserList || [];
          setDetailDistrUserList(distrUserList);
          setTargetValue(distrUserList.map((item) => `user_${item.userId}`));
        }
      });
    }
  }, [form, id, initialData]);

  useEffect(() => {
    if (!targetOptions.length || !detailDistrUserList.length) return;
    setTargetValue(
      buildSelectedValuesFromDistrUserList(detailDistrUserList, targetOptions),
    );
  }, [targetOptions, detailDistrUserList]);

  const allNums =
    (qType100qNums * qType100score || 0) +
    (qType200qNums * qType200score || 0) +
    (qType300qNums * qType300score || 0);

  return (
    <div className="add-exam-container">
      <div className="form-content">
        <Form form={form} layout="vertical" disabled={!isEdit}>
          <div className="form-section">
            <h3 className="section-title">基础信息</h3>

            {/* 考试名称 + 合格分数线 双列布局 */}
            <div className="form-row">
              <Form.Item
                label="考试名称"
                name="examName"
                rules={[{ required: true, message: "请输入考试名称" }]}
              >
                <Input placeholder="请输入考试名称" />
              </Form.Item>
              <Form.Item
                label="合格分数线"
                name="passScore"
                initialValue={80}
                rules={[{ required: true, message: "请输入合格分数线" }]}
              >
                <InputNumber min={0} max={100} style={{ width: "100%" }} />
              </Form.Item>
            </div>

            {/* 考试期限（开始+结束日期） */}
            <div className="form-row date-row">
              <Form.Item
                label="考试期限"
                name="startDate"
                rules={[{ required: true, message: "请选择开始日期" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="选择开始日期"
                />
              </Form.Item>
              <span className="date-separator">至</span>
              <Form.Item label=" " name="endDate">
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="选择结束日期"
                />
              </Form.Item>
            </div>

            {/* 题库选择 */}
            <Form.Item
              label="题库选择"
              name="libList"
              rules={[{ required: true, message: "请选择题库" }]}
            >
              <Select
                mode="multiple"
                placeholder="请选择题库"
                options={bankList}
              />
            </Form.Item>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              考试范围选择（支持部门 + 人员多选）
            </h3>

            <CompanmyCascader
              title="选择发布对象"
              options={targetOptions}
              value={targetValue}
              loading={loading}
              onChange={(val) => {
                setTargetValue(val);
              }}
              style={{ width: "100%" }}
              disabled={!isEdit}
            />
          </div>

          <div className="form-section">
            <div className="form-row">
              <Form.Item
                label="总题量"
                name="questionNums"
                rules={[{ required: true, message: "请输入总题量" }]}
              >
                <InputNumber disabled min={1} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                label="考试时长（分钟）"
                name="timeLimit"
                rules={[{ required: true, message: "请输入考试时长" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </div>
            <div className="form-row">
              <Form.Item
                label="单次测试周期最大次数"
                initialValue={3}
                name="attemptLimit"
                rules={[
                  { required: true, message: "请输入单次测试周期最大次数" },
                ]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item />
            </div>
            <div className="section-nav">
              题型配置{" "}
              <span className="section-tip">
                当前分数：{allNums || 0}（分）
              </span>
            </div>

            <div className="form-row">
              <div className="form-row-item">
                <Form.Item
                  label="单选题（数量）"
                  name="qType100qNums"
                  rules={[{ required: true, message: "请输入单选题数量" }]}
                >
                  <InputNumber min={0} max={100} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                  label="单选题（分数/题）"
                  name="qType100score"
                  rules={[{ required: true, message: "请输入单选题分数/题" }]}
                >
                  <InputNumber min={0} max={100} style={{ width: "100%" }} />
                </Form.Item>
              </div>
              <div className="form-row-item">
                <Form.Item
                  label="多选题（数量）"
                  name="qType200qNums"
                  rules={[{ required: true, message: "请输入多选题数量" }]}
                >
                  <InputNumber min={0} max={100} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                  label="多选题（分数/题）"
                  name="qType200score"
                  rules={[{ required: true, message: "请输入多选题分数/题" }]}
                >
                  <InputNumber min={0} max={100} style={{ width: "100%" }} />
                </Form.Item>
              </div>
              <div className="form-row-item">
                <Form.Item
                  label="判断题（数量）"
                  name="qType300qNums"
                  rules={[{ required: true, message: "请输入判断题数量" }]}
                >
                  <InputNumber min={0} max={100} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                  label="判断题（分数/题）"
                  name="qType300score"
                  rules={[{ required: true, message: "请输入判断题分数/题" }]}
                >
                  <InputNumber min={0} max={100} style={{ width: "100%" }} />
                </Form.Item>
              </div>
            </div>

            <div className="form-row">
              <Form.Item
                label="难度选择"
                name="difficutity"
                rules={[{ required: true, message: "请选择难度" }]}
              >
                <Select placeholder="请选择难度">
                  <Option value={"100"}>简单</Option>
                  <Option value={"200"}>中等</Option>
                  <Option value={"300"}>困难</Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="特殊逻辑选择"
                name="specType"
                // rules={[{ required: true, message: '请选择特殊逻辑选择' }]}
              >
                <Checkbox.Group>
                  <Checkbox value={"100"}>
                    题库根据管户管理公司进行出题
                  </Checkbox>
                  <Checkbox value={"200"}>
                    题库根据科室经理下属管理公司进行出题
                  </Checkbox>
                </Checkbox.Group>
              </Form.Item>
            </div>

            {/* 题库选择 */}
            <div className="form-row">
              <Form.Item
                label="关联勋章（考试完成后下发）"
                name="badge"
                // rules={[{ required: true, message: '请选择关联勋章' }]}
              >
                <Select
                  options={badgeList}
                  showSearch
                  allowClear
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
              <Form.Item />
            </div>
          </div>
        </Form>
      </div>
      {isEdit && (
        <div className="projectBtn">
          <Button
            type="primary"
            loading={loading}
            onClick={() => runWithCheckVer(() => onSave())}
          >
            保存
          </Button>
        </div>
      )}
    </div>
  );
};

export default AddExamDrawer;
