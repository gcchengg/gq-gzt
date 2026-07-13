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
import { getUserInfo, getQueryStringGcc, uniqBy, nanoid } from "../utils";
import WangEdit from "../components/WangEdit/index";
import moment from "moment";
import UserSelect from "../components/UserSelect/index";
import { QmForm } from "../components/CompatForms";
// import CompanyDetail from '@/modules/companyDetail/pages/index';
import addImg from "./images/add.png";
import { saveTask, getEyes, getCompanyList } from "../mockApi";
import UploadFile from "../components/UploadFile/index";
import "./index.less";

const { TextArea } = Input;

// 创建任务
export default function StepDom1({
  id,
  selectOptions = [],
  isShowBtn,
  isGuanli,
  infoData = {},
  initCompany,
  guanliList = [],
  cmplComment,
  getList = () => {},
  isBihuan,
}) {
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState([{ key: nanoid() }]);
  const [taskType, setTaskType] = useState("");
  const [companyOptions, setCompanyOptions] = useState([]);
  const [selectList, setSelectList] = useState([]);
  const [companyInfoOpen, setCompanyInfoOpen] = useState(false); // 参股公司详情\
  const [selectUser, setSelectUser] = useState(getUserInfo().loginName);
  const [cityName, setCityName] = useState("");
  const [cityId, setCityId] = useState("");
  const [companyData, setCompanyData] = useState({});
  const [fileList, setFileList] = useState([]);
  const [eyesData, setEyesData] = useState(null);
  const [form] = Form.useForm();
  const timer = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (initCompany.length > 0) {
      setCompanyOptions([...initCompany]);
    }
  }, [initCompany]);

  const onChangeCompany = (value, option) => {
    const val = initCompany.find((item) => item.companyName === option.name);
    console.log(val, "val");

    if (val?.id) {
      setCompanyData(val);
      form.setFieldsValue({
        companyId: val.id,
      });
      setCompanyOptions([...initCompany]);
      setEyesData(null);
      return;
    }
    if (option.id) {
      setCompanyData(option);
      setCompanyOptions([...initCompany]);
      form.setFieldsValue({
        companyId: option.id,
      });
      setEyesData(null);
    } else {
      setEyesData({ ...option });
      setCompanyData(option || {});
      form.setFieldsValue({
        companyId: option.name,
      });
    }
  };
  const onSearchCompany = (value) => {
    // 1. 搜索为空：直接恢复初始公司列表
    if (!value?.trim()) {
      setCompanyOptions([...initCompany]);
      return;
    }

    const searchKey = value.trim().toLowerCase();

    // 2. 先过滤【本地initCompany】中匹配的数据（本地优先）
    const localList = initCompany.filter((item) =>
      item.companyName?.toLowerCase().includes(searchKey),
    );

    // 3. 先展示本地匹配数据（无等待，体验更好）
    setCompanyOptions([...localList]);

    // 4. 防抖请求远程数据
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setLoading(true);
      getEyes(value)
        .then((res) => {
          if (res.code === 200) {
            // 格式化接口数据（统一格式）
            const remoteList =
              res.data?.map((item) => ({
                ...item,
                label: item.name,
                value: item.name,
                companyName: item.name, // 统一字段，方便去重
              })) || [];

            // 5. ✅ 核心：本地数据 + 远程数据 合并去重
            const finalList = uniqBy(
              [...localList, ...remoteList],
              "companyName",
            );

            setCompanyOptions(finalList);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }, 500);
  };

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
            required
            // rules={[{ required: true, message: '请选择类型' }]}
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
            rules={[{ required: true, message: "请选择人员" }]}
          >
            <Select
              value={text}
              mode="multiple"
              disabled={!isShowBtn}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
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
    if (!isShowBtn) {
      form.setFieldsValue({
        ...infoData,
        issueUserId: infoData?.issueUserId,
        planCmplTime: infoData.planCmplDate
          ? moment(infoData.planCmplDate)
          : null,
        companyId: infoData.companyId,
        taskDesc: infoData.taskDesc,
      });
      setFileList(infoData.taskFollow?.fileList || []);
      setTaskType(infoData.taskType);
    }
  }, [infoData, formRef.current]);

  const onSave = async () => {
    try {
      await form.validateFields();
      setLoading(true);
      const params = {
        oldTaskId: isBihuan ? id : null,
        taskType: taskType,
        cmplComment,
        tuneFlag: id ? "1" : null,
        issueUserId: form.getFieldValue("issueUserId"),
        issueUserName: selectOptions.find(
          (item) => item.value === form.getFieldValue("issueUserId"),
        ).label,
        dutyUserId: form.getFieldValue("dutyUserId"),
        dutyUserName: selectOptions.find(
          (item) => item.value === form.getFieldValue("dutyUserId"),
        ).label,
        companyId: form.getFieldValue("companyId"),
        taskSource: form.getFieldValue("taskSource"),
        planCmplDate: form.getFieldValue("planCmplTime")
          ? moment(form.getFieldValue("planCmplTime")).format(
              "YYYY-MM-DD HH:mm:ss",
            )
          : null,
        taskDesc: taskType === "300" ? null : form.getFieldValue("taskDesc"),
        taskFollow: {
          planCmplTime:
            taskType !== "300"
              ? null
              : form.getFieldValue("planCmplTime")
                ? moment(form.getFieldValue("planCmplTime")).format(
                    "YYYY-MM-DD HH:mm:ss",
                  )
                : null,
          taskDesc: taskType !== "300" ? null : form.getFieldValue("taskDesc"),
          fileList: fileList,
        },
        parentId: id,
        tycCompanyBaseInfo: eyesData,
        taskCoVisit: {
          destCity: cityId,
          destCityName: cityName,
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
          userList: selectList,
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
        fileList: fileList,
        taskInstanceCode: getQueryStringGcc("taskInstanceCode"),
      };
      const res = await saveTask(params);
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
        <div className="create-task-title">创建任务</div>
        <Form layout="vertical" form={form} disabled={!isShowBtn}>
          <div className="tasks-flex">
            <Form.Item
              label="任务发起人"
              name="issueUserId"
              initialValue={getUserInfo().loginName}
              rules={[{ required: true, message: "请输入任务发起人" }]}
            >
              <Select
                disabled={isGuanli || !isShowBtn}
                onChange={(value) => {
                  setSelectUser(value);
                }}
                style={{ width: "190px" }}
                options={selectOptions}
              />
            </Form.Item>
            <Form.Item
              label="目标公司"
              name="companyId"
              rules={[{ required: true, message: "请选择目标公司" }]}
              initialValue={
                !isShowBtn
                  ? infoData.companyId
                  : companyData.id || companyData.name || infoData.companyId
              }
            >
              <Select
                showSearch
                disabled={isBihuan || !isShowBtn}
                loading={loading}
                style={{ width: "190px" }}
                value={
                  !isShowBtn
                    ? infoData.companyId
                    : companyData.id || companyData.name || infoData.companyId
                }
                defaultActiveFirstOption={false}
                showArrow={false}
                filterOption={false}
                onSearch={onSearchCompany}
                onChange={onChangeCompany}
                notFoundContent={"未找到该公司"}
                options={companyOptions}
              />
              {/* {companyData.id && (
                <div className="btns-wrap">
                  <a
                    onClick={() => {
                      setCompanyInfoOpen(true);
                    }}
                  >
                    查看该公司信息
                  </a>
                </div>
              )} */}
            </Form.Item>
            <Form.Item
              label="任务执行人"
              name="dutyUserId"
              rules={[{ required: true, message: "请输入任务执行人" }]}
            >
              <Select
                style={{ width: "190px" }}
                optionFilterProp="label"
                showSearch
                optionLabelProp="label"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={selectOptions}
              />
            </Form.Item>
            <Form.Item label="任务来源" name="taskSource">
              <Input style={{ width: "190px" }} />
            </Form.Item>
          </div>
          <div className="tasks-flex">
            {isShowBtn && !isGuanli && !guanliList.includes(selectUser) && (
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
            )}
            {taskType === "100" &&
              isShowBtn &&
              !isGuanli &&
              !guanliList.includes(selectUser) && (
                <>
                  <QmForm
                    items={[
                      {
                        type: "CITY_SELECT",
                        label: "选择城市",
                        className: "city-select-item",
                        fieldName: "m",
                        onChange: (a, b, c) => {
                          setCityName(b);
                          setCityId(a);
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

          {taskType === "100" &&
            isShowBtn &&
            !isGuanli &&
            !guanliList.includes(selectUser) && (
              <>
                <div className="tasks-flex">
                  <Form.Item
                    label="计划出发时间"
                    name="depTime"
                    style={{ width: "190px" }}
                    rules={[{ required: true, message: "请选择计划出发时间" }]}
                  >
                    <DatePicker
                      popupClassName="date-picker-stepDom"
                      format="YYYY-MM-DD HH:mm"
                      showTime
                      disabledTime={disabledTime}
                    />
                  </Form.Item>
                  <Form.Item
                    label="计划返回时间"
                    style={{ width: "190px" }}
                    name="retTime"
                    rules={[{ required: true, message: "请选择计划返回时间" }]}
                  >
                    <DatePicker
                      popupClassName="date-picker-stepDom"
                      format="YYYY-MM-DD HH:mm"
                      showTime
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
          {taskType === "200" &&
            isShowBtn &&
            !isGuanli &&
            !guanliList.includes(selectUser) && (
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
          {(taskType === "300" ||
            !isShowBtn ||
            (isShowBtn && (guanliList.includes(selectUser) || isGuanli))) && (
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
                      __html: infoData.taskDesc,
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
                  rules={[{ required: true, message: "请选择任务完成时间" }]}
                >
                  <DatePicker format="YYYY-MM-DD" style={{ width: "190px" }} />
                </Form.Item>
                {taskType === "300" &&
                  !(guanliList.includes(selectUser) || isGuanli) && (
                    <Form.Item label="上传附件" name="planCmplTime">
                      <UploadFile
                        dataList={fileList}
                        type={"primary"}
                        disabled={!isShowBtn}
                        setDataList={(data) => setFileList(data)}
                      />
                    </Form.Item>
                  )}
              </div>
            </>
          )}
        </Form>
      </Card>
      {/* {companyInfoOpen && (
        <Drawer
          width="85%"
          title="参股公司详情"
          open={companyInfoOpen}
          destroyOnClose={true}
          onClose={() => setCompanyInfoOpen(false)}
        >
          <CompanyDetail
            rowId={companyData.id}
            onClose={() => setCompanyInfoOpen(false)}
            rowData={companyData}
          />
        </Drawer>
      )} */}
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
