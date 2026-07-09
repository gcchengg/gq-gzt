import React, { useState, useEffect } from "react";
import { Form, Input, DatePicker, Radio, Select, InputNumber } from "antd";
import { getDictInfo, SearchModalAllUser, UploadFileWps } from "../../support";
import { getCandidateInfo } from "../../api/index";
const { position_code, supervisor_selection_type, position_category } =
  getDictInfo()["GQ-0207"];
import moment from "moment";
import "./index.css";
const { RangePicker } = DatePicker;
const { Option } = Select;

const FormDom = ({
  userOption,
  form,
  staff,
  index,
  isEdit,
  staffList,
  setStaffList,
  inGroupFlag,
  setInGroupFlag,
  onChangeName = () => {},
}) => {
  const [userNameArray, setUserNameArray] = useState([]);

  const onOk = (value, id) => {
    if (value.length > 0) {
      getCandidateInfo({ loginName: value[0].loginName }).then((res) => {
        console.log("????", res);
        if (res.code == 200) {
          if (res.data) {
            res.data.name = value[0].name;
            console.log("res.data", res.data);
            const fullName = `fullName-${id}`;
            const age = `age-${id}`;
            const gender = `gender-${id}`;
            const graduation = `graduation-${id}`;
            const major = `major-${id}`;
            const education = `education-${id}`;
            const currEmployer = `currEmployer-${id}`;
            const politicalAffil = `politicalAffil-${id}`;
            const configData = {
              [fullName]: res.data.name,
              [age]: res.data.age,
              [gender]: res.data.gender,
              [graduation]: res.data.graduation,
              [major]: res.data.major,
              [education]: res.data.education,
              [currEmployer]: res.data.currEmployer,
              [politicalAffil]: res.data.politicalAffil,
            };
            form.setFieldsValue(configData);
            // setUserNameArray(() => [res.data]);
            const newData = staffList.map((item) => {
              if (item.id === staff.id) {
                return {
                  ...item,
                  suggestSupervisor: {
                    ...(item.suggestSupervisor || {}),
                    fullName: res.data.name,
                    age: res.data.age,
                    gender: res.data.gender,
                    graduation: res.data.graduation,
                    major: res.data.major,
                    education: res.data.education,
                    currEmployer: res.data.currEmployer,
                    politicalAffil: res.data.politicalAffil,
                  },
                };
              }
              return item;
            });
            onChangeName(newData);
            setStaffList([...newData]);
          } else {
            // setUserNameArray(() => [...value]);
            const configData = {
              fullName: value && value.length > 0 ? value[0].name || "" : "",
            };
            form.setFieldsValue(configData);
            const newData = staffList.map((item) => {
              if (item.id === staff.id) {
                return {
                  ...item,
                  suggestSupervisor: {
                    ...(item.suggestSupervisor || {}),
                    fullName:
                      value && value.length > 0 ? value[0].name || "" : "",
                  },
                };
              }
              return item;
            });
            setStaffList([...newData]);
            onChangeName(newData);
          }
        }
      });
    }
  };
  useEffect(() => {
    setUserNameArray([staff.suggestSupervisor || {}]);
  }, [staff.suggestSupervisor]);
  const categoryPosition = position_category.map((item) => ({
    ...item,
    label: item.text,
  }));
  const typeName = supervisor_selection_type.find(
    (item) => item.value === staff.selType,
  )?.text;
  const filelist1 =
    staff.suggestSupervisor?.files?.filter(
      (item) => item.fileCategory === "简历",
    ) || [];
  const filelist2 =
    staff.suggestSupervisor?.files?.filter(
      (item) => item.fileCategory === "推荐材料",
    ) || [];
  const isInit = staff.selType === "4000";
  const initName =
    position_code.find(
      (item) => item.value === staff.currentSupervisor?.positionCode,
    )?.text || "";

  return (
    <div className="staff-detail-card" key={staff.id}>
      <div className="staff-header">
        <span className="staff-title">第 {index + 1} 人员明细</span>
        <div className="staff-actions">
          <span className={`type-badge select-${staff.selType}`}>
            {typeName}
          </span>
        </div>
      </div>

      {/* 岗位信息 */}
      <div className="info-block">
        <div className="block-title">岗位信息</div>
        {staff.selType !== "2000" && (
          <div className="form-row three-col">
            <Form.Item
              label="当前任职人"
              className="field-item"
              name={`coSupervisorId-${staff.id || staff.key}`}
              initialValue={staff.coSupervisorId}
            >
              <Select disabled options={userOption} />
            </Form.Item>
            <Form.Item
              label="任职日期"
              className="field-item"
              name={`currentDate-${staff.id || staff.key}`}
              initialValue={
                staff.currentSupervisor?.tenureStartDate &&
                staff.currentSupervisor?.tenureEndDate
                  ? [
                      moment(staff.currentSupervisor?.tenureStartDate),
                      moment(staff.currentSupervisor?.tenureEndDate),
                    ]
                  : null
              }
            >
              <RangePicker
                disabled
                style={{ width: "100%" }}
                className="field-date"
              />
            </Form.Item>
            <Form.Item
              label={`${isInit ? "原" : ""}职务分类`}
              className="field-item"
              initialValue={staff.currentSupervisor?.positionCategory}
              name={`initPositionCategory-${staff.id || staff.key}`}
            >
              <Select
                className="field-select"
                disabled
                options={categoryPosition}
              />
            </Form.Item>
            <Form.Item
              label={`${isInit ? "原" : ""}职务`}
              className="field-item"
              initialValue={initName}
              name={`initPositionCode-${staff.id || staff.key}`}
            >
              <Input className="field-select" disabled />
            </Form.Item>
          </div>
        )}
        {["2000", "4000"].includes(staff.selType) && (
          <div className="form-row three-col">
            <Form.Item
              label={`${isInit ? "拟" : ""}职务分类`}
              name={`positionCategory-${staff.id || staff.key}`}
              initialValue={staff.positionCategory}
            >
              <Select disabled className="form-select" placeholder="请选择">
                {position_category?.map((item, idx) => (
                  <Option key={idx} value={item.value}>
                    {item.text}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label={`${isInit ? "拟" : ""}职务`}
              name={`positionCode-${staff.id}`}
              initialValue={staff.positionCode}
            >
              <Select disabled className="form-select" placeholder="请选择">
                {position_code?.map((item, idx) => (
                  <Option key={idx} value={item.value}>
                    {item.text}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="期望配置时间"
              name={`expectConfigDate-${staff.id}`}
              initialValue={
                staff.expectConfigDate ? moment(staff.expectConfigDate) : null
              }
            >
              <DatePicker
                disabled
                className="form-date"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </div>
        )}
      </div>

      {/* 拟任职人信息 */}
      {["2000", "4000"].includes(staff.selType) && (
        <div className="info-block">
          <div className="block-title">拟任职人信息</div>

          <div className="form-row three-col">
            <Form.Item
              label="选聘来源"
              name={`inGroupFlag-${staff.id}`}
              className="form-inGroupFlag"
              initialValue={staff.suggestSupervisor?.inGroupFlag}
              rules={[{ required: true }]}
            >
              <Radio.Group
                onChange={(e) => {
                  const newData = staffList.map((item) => {
                    if (item.id === staff.id) {
                      return {
                        ...item,
                        suggestSupervisor: {
                          ...(item.suggestSupervisor || {}),
                          inGroupFlag: e.target.value,
                        },
                      };
                    }
                    return item;
                  });
                  setStaffList([...newData]);
                  setInGroupFlag(e.target.value);
                }}
              >
                <Radio value="0">集团公司内选聘</Radio>
                <Radio value="1">股权公司内选聘</Radio>
                <Radio value="2">外部公司选聘</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label="姓名"
              required
              initialValue={staff.suggestSupervisor?.fullName}
              name={`fullName-${staff.id}`}
            >
              {inGroupFlag !== "2" ? (
                <SearchModalAllUser
                  isEdit={isEdit}
                  onOk={(value) => onOk(value, staff.id)}
                  type="radio"
                  valueData={userNameArray || []}
                  style={{ width: "100%" }}
                />
              ) : (
                <Input
                  placeholder="请输入姓名"
                  onChange={(e) => {
                    const newData = staffList.map((item) => {
                      if (item.id === staff.id) {
                        return {
                          ...item,
                          suggestSupervisor: {
                            ...(item.suggestSupervisor || {}),
                            fullName: e.target.value,
                          },
                        };
                      }
                      return item;
                    });
                    setStaffList([...newData]);
                  }}
                />
              )}
            </Form.Item>
            <Form.Item
              initialValue={staff.suggestSupervisor?.age}
              label="年龄"
              name={`age-${staff.id}`}
            >
              <InputNumber
                placeholder="请输入年龄"
                onChange={(e) => {
                  const newData = staffList.map((item) => {
                    if (item.id === staff.id) {
                      return {
                        ...item,
                        suggestSupervisor: {
                          ...(item.suggestSupervisor || {}),
                          age: e,
                        },
                      };
                    }
                    return item;
                  });
                  setStaffList([...newData]);
                }}
              />
            </Form.Item>
            <Form.Item
              initialValue={staff.suggestSupervisor?.gender}
              label="性别"
              name={`gender-${staff.id}`}
            >
              <Radio.Group
                onChange={(e) => {
                  const newData = staffList.map((item) => {
                    if (item.id === staff.id) {
                      return {
                        ...item,
                        suggestSupervisor: {
                          ...(item.suggestSupervisor || {}),
                          gender: e.target.value,
                        },
                      };
                    }
                    return item;
                  });
                  setStaffList([...newData]);
                }}
              >
                <Radio value="0">女</Radio>
                <Radio value="1">男</Radio>
              </Radio.Group>
            </Form.Item>
          </div>
          <div className="form-row three-col">
            <Form.Item
              label="毕业院校"
              initialValue={staff.suggestSupervisor?.graduation}
              name={`graduation-${staff.id}`}
            >
              <Input
                placeholder="请输入毕业院校"
                onChange={(e) => {
                  const newData = staffList.map((item) => {
                    if (item.id === staff.id) {
                      return {
                        ...item,
                        suggestSupervisor: {
                          ...(item.suggestSupervisor || {}),
                          graduation: e.target.value,
                        },
                      };
                    }
                    return item;
                  });
                  setStaffList([...newData]);
                }}
              />
            </Form.Item>
            <Form.Item
              label="专业"
              initialValue={staff.suggestSupervisor?.major}
              name={`major-${staff.id}`}
            >
              <Input
                placeholder="请输入专业"
                onChange={(e) => {
                  const newData = staffList.map((item) => {
                    if (item.id === staff.id) {
                      return {
                        ...item,
                        suggestSupervisor: {
                          ...(item.suggestSupervisor || {}),
                          major: e.target.value,
                        },
                      };
                    }
                    return item;
                  });
                  setStaffList([...newData]);
                }}
              />
            </Form.Item>
            <Form.Item
              label="学历"
              initialValue={staff.suggestSupervisor?.education}
              name={`education-${staff.id}`}
            >
              <Input
                placeholder="请输入学历"
                onChange={(e) => {
                  const newData = staffList.map((item) => {
                    if (item.id === staff.id) {
                      return {
                        ...item,
                        suggestSupervisor: {
                          ...(item.suggestSupervisor || {}),
                          education: e.target.value,
                        },
                      };
                    }
                    return item;
                  });
                  setStaffList([...newData]);
                }}
              />
            </Form.Item>
          </div>

          <div className="form-row two-col">
            <Form.Item
              label="现单位及职务"
              rules={[{ required: true }]}
              initialValue={staff.suggestSupervisor?.currEmployer}
              name={`currEmployer-${staff.id}`}
            >
              <Input
                placeholder="请输入现单位及职务"
                onChange={(e) => {
                  const newData = staffList.map((item) => {
                    if (item.id === staff.id) {
                      return {
                        ...item,
                        suggestSupervisor: {
                          ...(item.suggestSupervisor || {}),
                          currEmployer: e.target.value,
                        },
                      };
                    }
                    return item;
                  });
                  setStaffList([...newData]);
                }}
              />
            </Form.Item>
            <Form.Item
              label="政治面貌"
              initialValue={staff.suggestSupervisor?.politicalAffil}
              name={`politicalAffil-${staff.id}`}
            >
              <Input
                placeholder="请输入政治面貌"
                onChange={(e) => {
                  const newData = staffList.map((item) => {
                    if (item.id === staff.id) {
                      return {
                        ...item,
                        suggestSupervisor: {
                          ...(item.suggestSupervisor || {}),
                          politicalAffil: e.target.value,
                        },
                      };
                    }
                    return item;
                  });
                  setStaffList([...newData]);
                }}
              />
            </Form.Item>
          </div>

          <div className="form-row two-col upload-row">
            <Form.Item
              label="简历"
              initialValue={staff.suggestSupervisor?.resumes}
              name={`resumes-${staff.id}`}
            >
              <UploadFileWps
                fileCategory={"简历"}
                dataList={filelist1}
                disabled={!isEdit}
                setDataList={(data) => {
                  const newData = staffList.map((item) => {
                    if (item.id === staff.id) {
                      return {
                        ...item,
                        suggestSupervisor: {
                          ...(item.suggestSupervisor || {}),
                          files: [...filelist2, ...data],
                        },
                      };
                    }
                    return item;
                  });
                  setStaffList([...newData]);
                }}
              />
            </Form.Item>
            <Form.Item
              label="推荐材料"
              name={`recommendationLetters-${staff.id}`}
            >
              <UploadFileWps
                fileCategory={"推荐材料"}
                dataList={filelist2}
                disabled={!isEdit}
                setDataList={(data) => {
                  const newData = staffList.map((item) => {
                    if (item.id === staff.id) {
                      return {
                        ...item,
                        suggestSupervisor: {
                          ...(item.suggestSupervisor || {}),
                          files: [...filelist1, ...data],
                        },
                      };
                    }
                    return item;
                  });
                  setStaffList([...newData]);
                }}
              />
            </Form.Item>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormDom;
