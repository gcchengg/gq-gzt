import React, { useEffect, useState } from "react";
import { Card, Input, Form, Button, message, Modal, Spin, Drawer } from "antd";
import { CloseOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import WangEdit from "../components/WangEdit/index";
import moment from "moment";
import { getQueryStringGcc } from "../utils";
import { useInterval } from "../useInterval";
import {
  executeTaskConfirm,
  taskConfirm,
  callLLMCompletions,
  getTaskData,
  getPeerRecord,
} from "../mockApi";
import UploadFile from "../components/UploadFile/index";
import collaborationScreenshot from "../../../截屏2026-07-13 10.34.17.png";

const { confirm } = Modal;
const { TextArea } = Input;
export default function StepDom3({
  id,
  isShowBtn,
  infoData = {},
  parentId,
  getList = () => {},
  aiIndex,
}) {
  const [fileList, setFileList] = useState([]);
  const [fileList1, setFileList1] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiData, setAiData] = useState({});
  const [recordList, setRecordList] = useState([]);
  const [recordModal, setRecordModal] = useState(false);
  const [form] = Form.useForm();

  const onSave = async () => {
    try {
      await form.validateFields();
      setLoading(true);
      const obj = infoData.taskCoVisit || {}; // 100
      const obj2 = infoData.taskAttendMeet || {}; // 200
      const obj1 = infoData.taskFollow || {}; // 300
      const params = {
        id: id,
        parentId: parentId,
        taskType: infoData.taskType,
        taskAttendMeet: {
          ...obj2,
          summary: form.getFieldValue("summary"),
          commBg: form.getFieldValue("commBg"),
          nextPlan: form.getFieldValue("nextPlan"),
          fileList: infoData.taskType === "200" ? fileList : [],
        },
        taskCoVisit: {
          ...obj,
          summary: form.getFieldValue("summary"),
          commBg: form.getFieldValue("commBg"),
          nextPlan: form.getFieldValue("nextPlan"),
          fileList: infoData.taskType === "100" ? fileList : [],
        },
        taskFollow: {
          ...obj1,
          taskDesc: form.getFieldValue("taskDesc"),
        },
        collaboration:
          infoData.taskType === "400"
            ? {
                ...infoData.collaboration,
                executionFeedback: form.getFieldValue("collaborationFeedback"),
                resultDescription: form.getFieldValue("resultDescription"),
              }
            : infoData.collaboration,
        fileList: fileList1,
        taskInstanceCode: getQueryStringGcc("taskInstanceCode"),
      };
      const res = await executeTaskConfirm(params);
      setLoading(false);
      if (res.code === 200) {
        window.location.href = "/GztHome";
      }
    } catch (error) {
      setLoading(false);
      message.error("请检查输入项");
    }
  };
  const onSave1 = async () => {
    try {
      setLoading(true);
      const obj = infoData.taskCoVisit || {}; // 100
      const obj2 = infoData.taskAttendMeet || {}; // 200
      const obj1 = infoData.taskFollow || {}; // 300
      const params = {
        id: id,
        parentId: parentId,
        taskType: infoData.taskType,
        taskAttendMeet: {
          ...obj2,
          summary: form.getFieldValue("summary"),
          commBg: form.getFieldValue("commBg"),
          nextPlan: form.getFieldValue("nextPlan"),
          fileList: infoData.taskType === "200" ? fileList : [],
        },
        taskCoVisit: {
          ...obj,
          summary: form.getFieldValue("summary"),
          commBg: form.getFieldValue("commBg"),
          nextPlan: form.getFieldValue("nextPlan"),
          fileList: infoData.taskType === "100" ? fileList : [],
        },
        taskFollow: {
          ...obj1,
          taskDesc: form.getFieldValue("taskDesc"),
        },
        collaboration:
          infoData.taskType === "400"
            ? {
                ...infoData.collaboration,
                executionFeedback: form.getFieldValue("collaborationFeedback"),
                resultDescription: form.getFieldValue("resultDescription"),
              }
            : infoData.collaboration,
        fileList: fileList1,
        taskInstanceCode: getQueryStringGcc("taskInstanceCode"),
      };
      const res = await taskConfirm(params);
      setLoading(false);
      if (res.code === 200) {
        getList();
      }
    } catch (error) {
      setLoading(false);
      message.error("请检查输入项");
    }
  };

  const clear = useInterval(async () => {
    const str = aiData.taskCoVisit?.videoList
      ?.map((item) => item.confText)
      ?.join(",");
    const isNext = aiData.taskCoVisit?.videoList?.every(
      (item) => item.confText,
    );

    if ((str && isNext) || infoData.taskType !== "100") {
      clear();
      return;
    }
    try {
      getTaskData({ taskId: id })
        .then((res) => {
          if (res.code === 200) {
            setAiData(res.data[aiIndex]);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.log(error, "error");
    }
  }, 60000);

  useEffect(() => {
    if (infoData.taskType === "400") {
      form.setFieldsValue({
        collaborationFeedback: infoData.collaboration?.executionFeedback,
        resultDescription: infoData.collaboration?.resultDescription,
      });
      setFileList1(infoData.fileList || []);
    }
    if (infoData.taskType === "300" && !isShowBtn) {
      form.setFieldsValue({
        taskDesc: infoData.taskFollow?.taskDesc,
      });
      setFileList1(infoData?.fileList || []);
    }
    if (infoData.taskType === "100") {
      form.setFieldsValue({
        summary: infoData.taskCoVisit?.summary,
        commBg: infoData.taskCoVisit?.commBg,
        nextPlan: infoData.taskCoVisit?.nextPlan,
      });
      setFileList(infoData.taskCoVisit?.fileList || []);
    }
    if (infoData.taskType === "200") {
      form.setFieldsValue({
        summary: infoData.taskAttendMeet?.summary,
        commBg: infoData.taskAttendMeet?.commBg,
        nextPlan: infoData.taskAttendMeet?.nextPlan,
      });
      setFileList(infoData.taskAttendMeet?.fileList || []);
    }
  }, [infoData]);
  const DATA =
    infoData.taskType === "100"
      ? infoData.taskCoVisit
      : infoData.taskAttendMeet;

  const splitTextIntoParts = (text) => {
    // 使用正则表达式匹配三个主要部分
    const parts = [];

    // 匹配第一部分：交流背景
    const part1Match = text.match(
      /1\.\s*交流背景\s*([\s\S]*?)(?=2\.\s*主要交流\/调研内容)/,
    );
    if (part1Match && part1Match[1]) {
      parts.push(part1Match[1].trim());
    } else {
      parts.push("");
    }

    // 匹配第二部分：主要交流/调研内容
    const part2Match = text.match(
      /2\.\s*主要交流\/调研内容\s*([\s\S]*?)(?=3\.\s*下一步工作计划)/,
    );
    if (part2Match && part2Match[1]) {
      parts.push(part2Match[1].trim());
    } else {
      parts.push("");
    }

    // 匹配第三部分：下一步工作计划
    const part3Match = text.match(/3\.\s*下一步工作计划\s*([\s\S]*?)(?="|$)/);
    if (part3Match && part3Match[1]) {
      parts.push(part3Match[1].trim());
    } else {
      parts.push("");
    }

    return parts;
  };

  return (
    <div className="tasks-step-dom3">
      <Spin spinning={loading}>
        <Form form={form} disabled={!isShowBtn} layout="vertical">
          <Card>
            <div className="create-task-title">任务执行</div>
            {["100", "200"].includes(infoData.taskType) && (
              <>
                <div className="dom3-header">
                  {isShowBtn && (
                    <div className="dom3-title">
                      <Button
                        type="primary"
                        onClick={() => {
                          getPeerRecord({ taskId: id }).then((res) => {
                            if (res.code === 200) {
                              setRecordList(res.data);
                              setRecordModal(true);
                            }
                          });
                        }}
                      >
                        查看同行人记录
                      </Button>
                      <Button
                        type="primary"
                        onClick={() => {
                          const str = DATA?.videoList
                            ?.map((item) => item.confText)
                            ?.join(",");
                          const isNext = DATA?.videoList?.every(
                            (item) => item.confText,
                          );
                          if (!str || !isNext) {
                            confirm({
                              title: "录音正在解析中，请稍后再试！",
                              icon: <ExclamationCircleOutlined />,
                            });
                            return;
                          }
                          const content =
                            infoData.taskType === "100"
                              ? `请根据以下内容生成三段内容格式为： 1.交流背景: 2.主要交流/调研内容: 3.下一步工作计划: ,不用生成会议总结,不用显示共多少字数：${str}`
                              : `请根据以下内容生成300字以内的会议总结,不用生成走访简报,不用显示共多少字数：${str}`;
                          const data = {
                            model: "DeepSeek-R1",
                            messages: [
                              {
                                role: "user",
                                content,
                              },
                            ],
                            stream: false,
                            temperature: 0.6,
                          };
                          setLoading(true);
                          callLLMCompletions(data)
                            .then((res) => {
                              if (res.choices?.[0]?.message?.content) {
                                const result =
                                  res.choices[0].message.content.replace(
                                    /<think>[\s\S]*?<\/think>/g,
                                    "",
                                  );
                                const arr = splitTextIntoParts(result);
                                console.log(arr, "arr");
                                if (
                                  arr.length > 0 &&
                                  infoData.taskType === "100"
                                ) {
                                  arr.forEach((item, index) => {
                                    form.setFieldsValue({
                                      [`${["commBg", "summary", "nextPlan"][index]}`]:
                                        item,
                                    });
                                  });
                                } else {
                                  form.setFieldsValue({ summary: result });
                                }
                              }
                            })
                            .finally(() => {
                              setLoading(false);
                            });
                        }}
                      >
                        AI生成简报
                      </Button>
                    </div>
                  )}
                  {infoData.taskType === "200" &&
                    (isShowBtn ? (
                      <WangEdit
                        label={"会议总结"}
                        name="summary"
                        form={form}
                        disabled={!isShowBtn}
                        html={infoData.taskAttendMeet?.summary}
                      />
                    ) : (
                      <Form.Item
                        label={"会议总结"}
                        name="summary"
                        rules={[
                          { required: true, message: "请输入会议总结内容" },
                        ]}
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: infoData.taskAttendMeet?.summary,
                          }}
                        />
                      </Form.Item>
                    ))}
                  {infoData.taskType === "100" &&
                    (isShowBtn ? (
                      <>
                        <WangEdit
                          label={"交流背景"}
                          name="commBg"
                          form={form}
                          disabled={!isShowBtn}
                          html={infoData.taskCoVisit?.commBg}
                        />
                        <WangEdit
                          label={"主要交流/调研内容"}
                          name="summary"
                          form={form}
                          disabled={!isShowBtn}
                          html={infoData.taskCoVisit?.summary}
                        />
                        <WangEdit
                          label={"下一步工作计划"}
                          name="nextPlan"
                          form={form}
                          disabled={!isShowBtn}
                          html={infoData.taskCoVisit?.nextPlan}
                        />
                      </>
                    ) : (
                      <>
                        <Form.Item label={"交流背景"} name="commBg">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: infoData.taskCoVisit?.commBg,
                            }}
                          />
                        </Form.Item>
                        <Form.Item label={"主要交流/调研内容"} name="summary">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: infoData.taskCoVisit?.summary,
                            }}
                          />
                        </Form.Item>
                        <Form.Item label={"下一步工作计划"} name="nextPlan">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: infoData.taskCoVisit?.nextPlan,
                            }}
                          />
                        </Form.Item>
                      </>
                    ))}
                  {/* <Form.Item
                    label={infoData.taskType === '100' ? '走访简报' : '会议总结'}
                    name="summary"
                    rules={[{ required: true, message: '请输入会议总结内容' }]}
                  >
                    <TextArea rows={4} />
                  </Form.Item> */}
                </div>
                <div className="dom3-main-list">
                  <div className="list-item-file">
                    <div className="file-title">{"文件"}</div>
                    <div className="list-item-video">
                      {fileList
                        ?.filter?.(
                          (item) =>
                            ![
                              "png",
                              "jpg",
                              "jpeg",
                              "gif",
                              "mp3",
                              "mp4",
                            ].includes(item.fileType),
                        )
                        ?.map((item) => {
                          return (
                            <div className="video-item-file" key={item.fileUrl}>
                              {isShowBtn && (
                                <div
                                  className="delet-icon"
                                  onClick={() => {
                                    setFileList(
                                      fileList.filter(
                                        (item1) =>
                                          item1.fileUrl !== item.fileUrl,
                                      ),
                                    );
                                  }}
                                >
                                  <CloseOutlined />
                                </div>
                              )}
                              <a
                                className="video-item"
                                onClick={() => window.open(item.fileUrl)}
                                key={item.fileUrl}
                              >
                                {item.fileName}
                              </a>
                              {(item.recTime || item.created) && (
                                <div className="time-video">
                                  创建时间：
                                  {moment(item.recTime || item.created).format(
                                    "YYYY-MM-DD HH:mm:ss",
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  <div className="list-item-file">
                    <div className="file-title">{"录音"}</div>
                    <div className="list-item-video">
                      {DATA?.videoList
                        ?.filter((item) => item.mediaUrl)
                        ?.map((item) => {
                          return (
                            <div
                              className="video-item-file"
                              key={item.mediaUrl}
                            >
                              <audio
                                className="video-item"
                                controls="controls"
                                src={item.mediaUrl}
                              />
                              {(item.recTime || item.created) && (
                                <div className="time-video">
                                  创建时间：
                                  {moment(item.recTime || item.created).format(
                                    "YYYY-MM-DD HH:mm:ss",
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      {fileList
                        ?.filter?.((item) =>
                          ["mp3", "mp4"].includes(item.fileType),
                        )
                        ?.map((item) => {
                          return (
                            <div className="video-item-file" key={item.fileUrl}>
                              {isShowBtn && (
                                <div
                                  className="delet-icon"
                                  onClick={() => {
                                    setFileList(
                                      fileList.filter(
                                        (item1) =>
                                          item1.fileUrl !== item.fileUrl,
                                      ),
                                    );
                                  }}
                                >
                                  <CloseOutlined />
                                </div>
                              )}
                              <audio
                                className="video-item"
                                controls="controls"
                                src={item.fileUrl}
                              />
                              {(item.recTime || item.created) && (
                                <div className="time-video">
                                  创建时间：
                                  {moment(item.recTime || item.created).format(
                                    "YYYY-MM-DD HH:mm:ss",
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  <div className="list-item-file">
                    <div className="file-title">{"照片"}</div>
                    <div className="list-item-video">
                      {fileList
                        ?.filter?.((item) =>
                          ["png", "jpg", "jpeg", "gif"].includes(item.fileType),
                        )
                        ?.map((item) => {
                          return (
                            <div className="video-item-file" key={item.fileUrl}>
                              {isShowBtn && (
                                <div
                                  className="delet-icon"
                                  onClick={() => {
                                    setFileList(
                                      fileList.filter(
                                        (item1) =>
                                          item1.fileUrl !== item.fileUrl,
                                      ),
                                    );
                                  }}
                                >
                                  <CloseOutlined />
                                </div>
                              )}
                              <img
                                className="img-item"
                                src={item.fileUrl}
                                alt=""
                              />
                              {(item.recTime || item.created) && (
                                <div className="time-video">
                                  创建时间：
                                  {moment(item.recTime || item.created).format(
                                    "YYYY-MM-DD HH:mm:ss",
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
                <div className="upload-file-wrap">
                  <UploadFile
                    dataList={fileList}
                    type={"primary"}
                    disabled={!isShowBtn}
                    setDataList={(data) => setFileList(data)}
                  />
                </div>
              </>
            )}
            {infoData.taskType === "300" && (
              <div className="dom3-main-list1">
                {isShowBtn ? (
                  <WangEdit
                    label="备证说明"
                    name="taskDesc"
                    form={form}
                    disabled={!isShowBtn}
                    html={infoData.taskFollow?.taskDesc1}
                  />
                ) : (
                  <Form.Item label="备证说明" name="taskDesc">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: infoData.taskFollow?.taskDesc1,
                      }}
                    />
                  </Form.Item>
                )}
                {/* <Form.Item label="备证说明" name="taskDesc">
                  <TextArea rows={2} placeholder="请输入备证说明" />
                </Form.Item> */}
                <div className="beiz-file">
                  <div className="tip-beiz">备证材料</div>
                  <UploadFile
                    dataList={fileList1}
                    disabled={!isShowBtn}
                    setDataList={(data) => setFileList1(data)}
                    uploadText="上传文件"
                  />
                </div>
              </div>
            )}
            {infoData.taskType === "400" && (
              <div className="collaboration-task-execution">
                <div className="collaboration-meta-grid">
                  <div>
                    <span>来源</span>
                    <strong>{infoData.collaboration?.sourcePage}</strong>
                  </div>
                  <div>
                    <span>会议及议题编码</span>
                    <strong>{infoData.collaboration?.meetingTopicNo}</strong>
                  </div>
                  <div>
                    <span>任务完成时间</span>
                    <strong>
                      {moment(infoData.planCmplDate).format(
                        "YYYY-MM-DD HH:mm:ss",
                      )}
                    </strong>
                  </div>
                </div>
                <Form.Item label="分享建议">
                  <div className="collaboration-readonly-text">
                    {infoData.collaboration?.shareAdvice}
                  </div>
                </Form.Item>
                <div className="collaboration-shot-block">
                  <div className="collaboration-field-title">PDF 批注截图</div>
                  <img
                    className="collaboration-shot"
                    src={collaborationScreenshot}
                    alt="PDF 批注截图"
                  />
                </div>
                <WangEdit
                  label="处理反馈"
                  name="collaborationFeedback"
                  form={form}
                  disabled={!isShowBtn}
                  html={infoData.collaboration?.executionFeedback}
                />
                <div className="beiz-file">
                  <div className="tip-beiz">处理结果附件</div>
                  <UploadFile
                    dataList={fileList1}
                    disabled={!isShowBtn}
                    setDataList={(data) => setFileList1(data)}
                  />
                </div>
              </div>
            )}
          </Card>
        </Form>
      </Spin>
      {isShowBtn && (
        <div className="save-btn">
          <Button loading={loading} onClick={() => onSave1()}>
            保存
          </Button>
          <Button loading={loading} type="primary" onClick={() => onSave()}>
            确认
          </Button>
        </div>
      )}
      {recordModal && (
        <Drawer
          title="同行人记录"
          width={800}
          open={recordModal}
          onClose={() => setRecordModal(false)}
        >
          <div className="record-list-modalWrap">
            <div className="modal-title">共{recordList?.length || 0}条记录</div>
            <div className="record-list-main">
              {recordList?.length > 0 ? (
                recordList?.map((item) => (
                  <div className="record-item" key={item.id}>
                    <div className="record-item-left">
                      <div className="record-item-left-title">{item.name}</div>
                      <div className="record-item-left-time">
                        {moment(item.created).format("YYYY-MM-DD HH:mm:ss")}
                      </div>
                    </div>
                    <div className="record-item-right">
                      <div className="record-item-right-content">
                        {item.workMemo}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-record">暂无记录</div>
              )}
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
}
