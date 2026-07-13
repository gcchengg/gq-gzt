import React, { useState, useEffect, useRef } from "react";
import {
  Tabs,
  Drawer,
  Card,
  Form,
  Input,
  Select,
  Button,
  AutoComplete,
  Table,
  DatePicker,
  Modal,
  message,
} from "antd";
import { getUserInfo, getQueryStringGcc, nanoid, uniqBy } from "../utils";
import moment from "moment";
import UserSelect from "../components/UserSelect/index";
import { DcpForm } from "../components/CompatForms";
import addImg from "./images/add.png";
import WangEdit from "../components/WangEdit/index";
import { saveTaskCompleteness, getEyes, getCompanyList } from "../mockApi";
import UploadFile from "../components/UploadFile/index";
import "./index.less";

const { TextArea } = Input;

// 创建任务
export default function StepDom1({
  id,
  isShowBtn,
  infoData = {},
  parentId,
  selectOptions,
  isShowVl,
}) {
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [taskType, setTaskType] = useState("");
  const [companyOptions, setCompanyOptions] = useState([]);
  const [selectList, setSelectList] = useState([]);
  const [initCompany, setInitCompany] = useState([]);
  const [cityName, setCityName] = useState("");
  const [companyData, setCompanyData] = useState({});
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const timer = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (id) {
      // getProjectDetail(id).then((res) => {
      //   if (res.code === 200) {
      //     console.log();
      //   }
      // });
    }
  }, [id]);

  useEffect(() => {
    if (initCompany.length > 0) {
      setCompanyOptions([...initCompany]);
    }
  }, [initCompany]);

  useEffect(() => {
    if (!isShowBtn) {
      if (["300", "400"].includes(infoData.taskType)) {
        form.setFieldsValue({
          planCmplTime: infoData.planCmplDate
            ? moment(infoData.planCmplDate)
            : null,
          taskDesc: infoData.taskFollow?.taskDesc,
          taskType: infoData.taskType,
          issueUserName: infoData.issueUserName,
          companyName: infoData.companyName,
          dutyUserName: infoData.dutyUserName,
        });
        setFileList(infoData.taskFollow?.fileList || []);
      }
      if (infoData.taskType === "200") {
        form.setFieldsValue({
          attendUsers: infoData.taskAttendMeet?.attendUsers,
          taskType: infoData.taskType,
          summary: infoData.taskAttendMeet?.summary,
          meetLocation: infoData.taskAttendMeet?.meetLocation,
          meetTopic: infoData.taskAttendMeet?.meetTopic,
          startTime: infoData.taskAttendMeet?.startTime
            ? moment(infoData.taskAttendMeet?.startTime)
            : null,
          endTime: infoData.taskAttendMeet?.endTime
            ? moment(infoData.taskAttendMeet?.endTime)
            : null,
          issueUserName: infoData.issueUserName,
          companyName: infoData.companyName,
          dutyUserName: infoData.dutyUserName,
        });
      }
      if (infoData.taskType === "100") {
        form.setFieldsValue({
          depTime: infoData.taskCoVisit?.depTime
            ? moment(infoData.taskCoVisit?.depTime)
            : null,
          retTime: infoData.taskCoVisit?.retTime
            ? moment(infoData.taskCoVisit?.retTime)
            : null,
          taskType: infoData.taskType,
          issueUserName: infoData.issueUserName,
          companyName: infoData.companyName,
          dutyUserName: infoData.dutyUserName,
        });

        formRef.current?.SET_FIELDS_VALUE({
          m: infoData.taskCoVisit?.destCity,
        });
        setCityName(infoData.taskCoVisit?.destCity);
        setSelectList(
          infoData.taskCoVisit?.userList?.map((item) => ({
            ...item,
            value: item.userId,
            label: item.userName,
          })) || [],
        );
        setDataList(
          infoData.taskCoVisit?.planList?.map((item) => ({
            ...item,
            userList: item.userList?.map((val) => val.userId) || [],
          })) || [],
        );
      }

      setTaskType(infoData.taskType);
    }
  }, [infoData, formRef.current]);

  const columns = [
    {
      title: "时间",
      dataIndex: "planTime",
      width: 240,
      render: (text, record, index) => {
        return (
          <Form.Item
            name={`planTime${record.id || record.key}`}
            initialValue={text ? moment(text) : null}
            rules={[{ required: true, message: "请选择时间" }]}
          >
            <DatePicker
              format="YYYY-MM-DD HH:mm:ss"
              showTime
              onChange={(value, dateString) => {
                const newData = [...dataList];
                newData[index].planTime = dateString;
                setDataList(newData);
              }}
            />
          </Form.Item>
        );
      },
    },
    {
      title: "类型",
      dataIndex: "planType",
      width: 160,
      render: (text, record, index) => {
        return (
          <Form.Item
            name={`planType${record.id || record.key}`}
            initialValue={text}
            rules={[{ required: true, message: "请选择类型" }]}
          >
            <Select
              value={text}
              disabled={!isShowBtn}
              options={[
                { label: "会议", value: "100" },
                { label: "拜访", value: "200" },
                { label: "出差", value: "300" },
              ]}
              onChange={(value) => {
                const newData = [...dataList];
                newData[index].planType = value;
                setDataList(newData);
              }}
            />
          </Form.Item>
        );
      },
    },
    {
      title: "出发地点（具体位置）",
      dataIndex: "depLocation",
      width: 180,
      render: (text, record, index) => {
        return (
          <Form.Item
            name={`depLocation${record.id || record.key}`}
            initialValue={text}
            rules={[{ required: true, message: "请输入出发地点" }]}
          >
            <Input
              disabled={!isShowBtn}
              value={text}
              onChange={(e) => {
                const newData = [...dataList];
                newData[index].depLocation = e.target.value;
                setDataList(newData);
              }}
            />
          </Form.Item>
        );
      },
    },
    {
      title: "到达地点（实际位置）",
      dataIndex: "retLocation",
      width: 180,
      render: (text, record, index) => {
        return (
          <Form.Item
            name={`retLocation${record.id || record.key}`}
            initialValue={text}
            rules={[{ required: true, message: "请输入到达地点" }]}
          >
            <Input
              disabled={!isShowBtn}
              value={text}
              onChange={(e) => {
                const newData = [...dataList];
                newData[index].retLocation = e.target.value;
                setDataList(newData);
              }}
            />
          </Form.Item>
        );
      },
    },
    {
      title: "事项描述",
      dataIndex: "itemDesc",
      width: 180,
      render: (text, record, index) => {
        return (
          <Form.Item
            name={`itemDesc${record.id || record.key}`}
            initialValue={text}
            rules={[{ required: true, message: "请输入事项描述" }]}
          >
            <Input
              disabled={!isShowBtn}
              value={text}
              onChange={(e) => {
                const newData = [...dataList];
                newData[index].itemDesc = e.target.value;
                setDataList(newData);
              }}
            />
          </Form.Item>
        );
      },
    },
    {
      title: "相关方人员",
      dataIndex: "relUser",
      width: 180,
      render: (text, record, index) => {
        return (
          <Form.Item
            name={`relUser${record.id || record.key}`}
            initialValue={text}
            rules={[{ required: true, message: "请输入相关方人员" }]}
          >
            <Input
              disabled={!isShowBtn}
              value={text}
              onChange={(e) => {
                const newData = [...dataList];
                newData[index].relUser = e.target.value;
                setDataList(newData);
              }}
            />
          </Form.Item>
        );
      },
    },
    {
      title: "我方人员",
      dataIndex: "userList",
      width: 240,
      render: (text, record, index) => {
        return (
          <Form.Item
            name={`userList${record.id || record.key}`}
            initialValue={text}
            rules={[{ required: true, message: "请选择我方人员" }]}
          >
            <Select
              value={text}
              mode="multiple"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              disabled={!isShowBtn}
              options={uniqBy([...selectOptions, ...selectList], "label")}
              onChange={(value, option) => {
                const newData = [...dataList];
                newData[index].userList =
                  value?.map((item, index) => {
                    return {
                      value: item,
                      label: option[index]?.label,
                      userId: item,
                      userName: option[index]?.label,
                    };
                  }) || [];
                setDataList(newData);
              }}
            />
          </Form.Item>
        );
      },
    },
  ];

  useEffect(() => {
    form.setFieldsValue({
      issueUserId: getUserInfo()?.loginName,
    });
  }, []);
  useEffect(() => {
    getCompanyList().then((res) => {
      if (res.code === 200) {
        const arr =
          res.data
            ?.map((item) => ({
              ...item,
              value: item.id,
              label: item.companyName,
            }))
            ?.filter((item) => item.companyName) || [];
        setInitCompany(arr);
      }
    });
  }, []);

  const onSave = async () => {
    try {
      await form.validateFields();
      setLoading(true);
      const params = {
        id: id,
        parentId: parentId,
        taskType: taskType,
        planCmplDate: form.getFieldValue("planCmplTime")
          ? moment(form.getFieldValue("planCmplTime")).format(
              "YYYY-MM-DD HH:mm:ss",
            )
          : null,
        taskDesc: infoData.taskDesc,
        taskFollow: {
          planCmplTime: form.getFieldValue("planCmplTime")
            ? moment(form.getFieldValue("planCmplTime")).format(
                "YYYY-MM-DD HH:mm:ss",
              )
            : null,
          taskDesc: form.getFieldValue("taskDesc"),
          fileList: fileList,
        },
        taskCoVisit: {
          destCity: cityName,
          userList: selectList,
          depTime: form.getFieldValue("depTime")
            ? moment(form.getFieldValue("depTime")).format(
                "YYYY-MM-DD HH:mm:ss",
              )
            : null,
          retTime: form.getFieldValue("retTime")
            ? moment(form.getFieldValue("retTime")).format(
                "YYYY-MM-DD HH:mm:ss",
              )
            : null,
          planList: dataList,
        },
        taskAttendMeet: {
          attendUsers: form.getFieldValue("attendUsers"),
          meetLocation: form.getFieldValue("meetLocation"),
          meetTopic: form.getFieldValue("meetTopic"),
          startTime: form.getFieldValue("startTime")
            ? moment(form.getFieldValue("startTime")).format(
                "YYYY-MM-DD HH:mm:ss",
              )
            : null,
          endTime: form.getFieldValue("endTime")
            ? moment(form.getFieldValue("endTime")).format(
                "YYYY-MM-DD HH:mm:ss",
              )
            : null,
        },
        taskInstanceCode: getQueryStringGcc("taskInstanceCode"),
      };
      const res = await saveTaskCompleteness(params);
      setLoading(false);
      if (res.code === 200) {
        window.location.href = "/home";
      }
    } catch (error) {
      setLoading(false);
      message.error("请检查输入项");
    }
  };

  const disabledTime = (current) => {
    return {
      disabledMinutes: () => {
        const minutes = [];
        for (let i = 0; i < 60; i++) {
          if (i % 10 !== 0) {
            minutes.push(i);
          }
        }
        return minutes;
      },
    };
  };

  return (
    <div className="tasks-step-dom1">
      <Card>
        <div className="create-task-title">
          {isShowVl ? "创建任务" : "任务完善"}
        </div>
        <Form layout="vertical" form={form} disabled={!isShowBtn}>
          {isShowVl && (
            <div className="tasks-flex">
              <Form.Item
                label="任务发起人"
                name="issueUserName"
                rules={[{ required: true, message: "请输入任务发起人" }]}
              >
                <Input disabled style={{ width: "190px" }} />
              </Form.Item>
              <Form.Item
                label="目标公司"
                name="companyName"
                rules={[{ required: true, message: "请选择目标公司" }]}
              >
                <Input disabled style={{ width: "190px" }} />
              </Form.Item>
              <Form.Item
                label="任务执行人"
                name="dutyUserName"
                rules={[{ required: true, message: "请输入任务执行人" }]}
              >
                <Input disabled style={{ width: "190px" }} />
              </Form.Item>
            </div>
          )}
          <div className="tasks-flex">
            <Form.Item
              label="任务类型选择"
              name="taskType"
              rules={[{ required: true, message: "请选择任务类型" }]}
            >
              <Select
                style={{ width: "190px" }}
                onChange={(value) => setTaskType(value)}
                options={[
                  {
                    label: "督办任务",
                    value: "300",
                  },
                  {
                    label: "参加会议",
                    value: "200",
                  },
                  {
                    label: "公司走访",
                    value: "100",
                  },
                  {
                    label: "协同事项",
                    value: "400",
                  },
                ]}
              />
            </Form.Item>
            {taskType === "100" && (
              <>
                <DcpForm
                  items={[
                    {
                      type: "CITY_SELECT",
                      label: "选择城市",
                      className: "city-select-item",
                      fieldName: "m",
                      onChange: (a, b, c) => {
                        setCityName(a);
                      },
                    },
                  ]}
                  style={{ width: "190px" }}
                  className="city-select"
                  ref={formRef}
                />
                <Form.Item label="随行人员" name="userList">
                  <UserSelect
                    multiple={true}
                    style={{ width: 400 }}
                    idList={selectList.map((item) => item.userId)}
                    disabled={!isShowBtn}
                    onSelect={(value, label) => {
                      const arr =
                        value?.map((item, index) => {
                          return {
                            value: item,
                            label: label[index],
                            userId: item,
                            userName: label[index],
                          };
                        }) || [];
                      setSelectList(arr);
                    }}
                  />
                </Form.Item>
              </>
            )}
          </div>

          {taskType === "100" && (
            <>
              <div className="tasks-flex">
                <Form.Item
                  label="计划出发时间"
                  name="depTime"
                  rules={[{ required: true, message: "请选择计划出发时间" }]}
                >
                  <DatePicker
                    popupClassName="date-picker-stepDom"
                    format="YYYY-MM-DD HH:mm"
                    showTime
                    style={{ width: "190px" }}
                    disabledTime={disabledTime}
                  />
                </Form.Item>
                <Form.Item
                  label="计划返回时间"
                  name="retTime"
                  rules={[{ required: true, message: "请选择计划返回时间" }]}
                >
                  <DatePicker
                    popupClassName="date-picker-stepDom"
                    format="YYYY-MM-DD HH:mm"
                    showTime
                    style={{ width: "190px" }}
                    disabledTime={disabledTime}
                  />
                </Form.Item>
              </div>
              <Table
                dataSource={dataList}
                columns={columns}
                pagination={false}
                className="table-tasks-wrap"
                scroll={{ x: "max-content" }}
                tableLayout="auto"
                rowKey={(record) => record.id || record.key}
              />
              {isShowBtn && (
                <div
                  className="addBtn"
                  onClick={() => {
                    const newData = [...dataList];
                    newData.push({
                      key: nanoid(),
                    });
                    setDataList(newData);
                  }}
                >
                  <img
                    crossOrigin="use-credentials"
                    src={addImg}
                    className="addImg"
                    alt=""
                  />
                  <Button type="link" className="addBtnText">
                    添加
                  </Button>
                </div>
              )}
            </>
          )}
          {taskType === "200" && (
            <>
              <div className="tasks-flex">
                <Form.Item
                  label="会议开始时间"
                  name="startTime"
                  rules={[{ required: true, message: "请选择会议开始时间" }]}
                >
                  <DatePicker
                    style={{ width: "190px" }}
                    format="YYYY-MM-DD HH:mm:ss"
                    showTime
                  />
                </Form.Item>
                <Form.Item
                  label="会议结束时间"
                  name="endTime"
                  rules={[{ required: true, message: "请选择会议结束时间" }]}
                >
                  <DatePicker
                    style={{ width: "190px" }}
                    format="YYYY-MM-DD HH:mm:ss"
                    showTime
                  />
                </Form.Item>
                <Form.Item
                  label="会议地点"
                  name="meetLocation"
                  rules={[{ required: true, message: "请输入会议地点" }]}
                >
                  <Input style={{ width: "190px" }} />
                </Form.Item>
                <Form.Item
                  label="主要与会人员"
                  name="attendUsers"
                  rules={[{ required: true, message: "请输入主要与会人员" }]}
                >
                  <Input style={{ width: "190px" }} />
                </Form.Item>
              </div>
              {isShowBtn ? (
                <WangEdit
                  label="会议有关议题"
                  name="meetTopic"
                  form={form}
                  disabled={!isShowBtn}
                  html={infoData.taskAttendMeet?.meetTopic}
                />
              ) : (
                <Form.Item
                  label="会议有关议题"
                  name="meetTopic"
                  rules={[{ required: true, message: "请输入会议有关议题" }]}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: infoData.taskAttendMeet?.meetTopic,
                    }}
                  />
                </Form.Item>
              )}
              {/* <Form.Item
                label="会议有关议题"
                name="meetTopic"
                rules={[{ required: true, message: '请输入会议有关议题' }]}
              >
                <TextArea rows={4} />
              </Form.Item> */}
            </>
          )}
          {["300", "400"].includes(taskType) && (
            <>
              {isShowBtn ? (
                <WangEdit
                  label="任务描述"
                  name="taskDesc"
                  form={form}
                  disabled={!isShowBtn}
                  html={infoData.taskFollow?.taskDesc}
                />
              ) : (
                <Form.Item
                  label="任务描述"
                  name="taskDesc"
                  rules={[{ required: true, message: "请输入任务描述" }]}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: infoData.taskFollow?.taskDesc,
                    }}
                  />
                </Form.Item>
              )}
              {/* <Form.Item
                label="任务描述"
                name="taskDesc"
                rules={[{ required: true, message: '请输入任务描述' }]}
              >
                <TextArea rows={4} />
              </Form.Item> */}
              <div className="tasks-flex">
                <Form.Item
                  label="任务完成时间"
                  name="planCmplTime"
                  style={{ width: "190px" }}
                  rules={[{ required: true, message: "请选择任务完成时间" }]}
                >
                  <DatePicker format="YYYY-MM-DD" />
                </Form.Item>
                <Form.Item label="上传附件" name="planCmplTime">
                  <UploadFile
                    dataList={fileList}
                    type={"primary"}
                    disabled={!isShowBtn}
                    setDataList={(data) => setFileList(data)}
                  />
                </Form.Item>
              </div>
            </>
          )}
        </Form>
      </Card>
      {isShowBtn && (
        <div className="save-btn">
          <Button loading={loading} type="primary" onClick={() => onSave()}>
            确认
          </Button>
        </div>
      )}
    </div>
  );
}
