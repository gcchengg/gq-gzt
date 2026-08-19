import { useEffect, useRef, useState } from "react";
import {
  Button,
  Drawer,
  Empty,
  Input,
  Radio,
  Spin,
  Table,
  Tooltip,
  Upload,
  message,
} from "antd";
import { QuestionCircleOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  sanhuiVoteInitBySanhuiMgmtId,
  sanhuiVoteSave,
} from "../../mock/voteApi";
import "./Vote.css";

const MEETING_FILE_GROUPS = [
  { key: "bod", title: "董事会会议决议" },
  { key: "bos", title: "监事会会议决议" },
  { key: "shs", title: "股东会会议决议" },
];

const MEETING_FILE_TYPES = ["我方发出版", "会议完整版"];
const getFileCategory = (meetingTitle, fileType) =>
  `${meetingTitle}-${fileType}`;

const getEmptyVoteFileMap = () =>
  MEETING_FILE_GROUPS.reduce((fileMap, meetingItem) => {
    MEETING_FILE_TYPES.forEach((fileType) => {
      fileMap[getFileCategory(meetingItem.title, fileType)] = [];
    });
    return fileMap;
  }, {});

const normalizeFileCategory = (fileCategory) => {
  if (MEETING_FILE_GROUPS.some((item) => item.title === fileCategory)) {
    return getFileCategory(fileCategory, "我方发出版");
  }
  return fileCategory;
};

const registerStatusText = {
  100: "产权预登记发起中",
  200: "产权预登记回执",
  300: "产权登记办理中",
  400: "产权登记办理回执",
  500: "完成",
};

const voteDecisionOptions = [
  { label: "同意", value: "1" },
  { label: "反对", value: "0" },
  { label: "有条件同意", value: "2" },
  { label: "回避表决", value: "-1" },
];

const voteDecisionTextMap = voteDecisionOptions.reduce((textMap, item) => {
  textMap[item.value] = item.label;
  return textMap;
}, {});

const getTodayValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateText = (dateValue) => {
  if (!dateValue) return "";
  const [year, month, day] = dateValue.split("-");
  if (!year || !month || !day) return dateValue;
  return `${year}年${month}月${day}日`;
};

const getDecisionText = (record, flagKey, topicFlagKey) => {
  if (record.itemData?.eoSanhuiTopic?.[topicFlagKey] === "0") return "未涉及";
  return voteDecisionTextMap[record[flagKey]] || "未选择";
};

const getDefaultResolutionMatter = (record, dateValue) => {
  const topicName = record.toipcName ? `《${record.toipcName}》` : "相关议题";
  return `于${formatDateText(dateValue)}就${topicName}形成三会决议：董事会决议为${getDecisionText(
    record,
    "bodPassFlag",
    "bodFlag",
  )}，监事会决议为${getDecisionText(record, "bosPassFlag", "bosFlag")}，股东会决议/投委会决议为${getDecisionText(
    record,
    "shPassFlag",
    "shsFlag",
  )}。`;
};

function UploadFile({
  dataList = [],
  setDataList,
  disabled,
  accept,
  tipValue,
}) {
  return (
    <div className="vote-upload-file">
      <Upload
        disabled={disabled}
        accept={accept}
        fileList={dataList}
        beforeUpload={(file) => {
          const item = {
            uid: file.uid,
            name: file.name,
            fileName: file.name,
            status: "done",
            url: URL.createObjectURL(file),
            fileUrl: URL.createObjectURL(file),
            fileType: file.type,
            objectKey: `local/${file.name}`,
          };
          setDataList([item]);
          return false;
        }}
        onRemove={() => {
          setDataList([]);
        }}
        maxCount={1}
      >
        <div className="vote-upload-row">
          <Button
            disabled={disabled}
            icon={<UploadOutlined />}
            className="vote-upload-btn"
          >
            上传文件
          </Button>
          {tipValue ? (
            <span className="vote-upload-tip">{tipValue}</span>
          ) : null}
        </div>
      </Upload>
    </div>
  );
}

export default function Vote(props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [voteFileMap, setVoteFileMap] = useState(getEmptyVoteFileMap);
  const [registVisible, setRegistVisible] = useState(false);
  const [infoData, setInfoData] = useState({});
  const [rowData, setRowData] = useState({});
  const [uploadDisabled, setUploadDisabled] = useState({
    bod: true,
    bos: true,
    shs: true,
  });
  const voteIdRef = useRef(null);

  useEffect(() => {
    if (props.id) handleAllData();
  }, [props.id]);

  const handleAllData = () => {
    setLoading(true);
    sanhuiVoteInitBySanhuiMgmtId({ sanhuiMgmtId: props.id })
      .then((res) => {
        if (res.code !== 200) return;
        const {
          sanhuiVoteFileList = [],
          sanhuiVoteTopicList = [],
          sanhuiScheduleVoList = [],
          voteId,
        } = res.data || {};
        setInfoData(res.data || {});
        debugger;
        setDataSource(
          sanhuiVoteTopicList.map((item, index) => ({
            index,
            toipcName: item.eoSanhuiTopic?.toipcName,
            timelineFlag: item.timelineFlag || "0",
            resolutionDate:
              item.timelineFlag === "1" ? item.resolutionDate || "" : "",
            resolutionMatter:
              item.timelineFlag === "1" ? item.resolutionMatter || "" : "",
            resolutionMatterGenerated: false,
            bodPassFlag: item.bodPassFlag,
            bosPassFlag: item.bosPassFlag,
            shPassFlag: item.shPassFlag,
            itemData: item,
            topicId: item.eoSanhuiTopic?.id,
          })),
        );

        const nextFileMap = getEmptyVoteFileMap();
        sanhuiVoteFileList.forEach((item) => {
          const sanhuiFile = item.sanhuiFile || {};
          const fileCategory = normalizeFileCategory(sanhuiFile.fileCategory);
          if (nextFileMap[fileCategory]) {
            nextFileMap[fileCategory].push({
              ...sanhuiFile,
              itemId: sanhuiFile.id,
              uid: sanhuiFile.id,
              name: sanhuiFile.fileName,
              url: sanhuiFile.fileUrl,
              status: "done",
            });
          }
        });

        const nextUploadDisabled = { bod: true, bos: true, shs: true };
        sanhuiScheduleVoList.forEach((item) => {
          if (item.meetingType === "100")
            nextUploadDisabled.bod = !item.launchFlag;
          if (item.meetingType === "200")
            nextUploadDisabled.bos = !item.launchFlag;
          if (item.meetingType === "300")
            nextUploadDisabled.shs = !item.launchFlag;
        });

        voteIdRef.current = voteId;
        setUploadDisabled(nextUploadDisabled);
        setVoteFileMap(nextFileMap);
      })
      .finally(() => setLoading(false));
  };

  const setVoteFileList = (fileCategory, fileList) => {
    setVoteFileMap((prev) => ({ ...prev, [fileCategory]: fileList }));
  };

  const getMeetingUploadedCount = (meetingTitle) =>
    MEETING_FILE_TYPES.reduce((count, fileType) => {
      const fileCategory = getFileCategory(meetingTitle, fileType);
      return count + (voteFileMap[fileCategory]?.length ? 1 : 0);
    }, 0);

  const onSave = (status) => {
    const sanhuiVoteTopicList = dataSource.map((item) => ({
      id: item.itemData.id,
      topicId: item.topicId,
      voteId: item.itemData.voteId,
      timelineFlag: item.timelineFlag || "0",
      resolutionDate: item.timelineFlag === "1" ? item.resolutionDate : "",
      resolutionMatter: item.timelineFlag === "1" ? item.resolutionMatter : "",
      bodPassFlag: item.bodPassFlag,
      bosPassFlag: item.bosPassFlag,
      shPassFlag: item.shPassFlag,
    }));

    const sanhuiVoteFileList = [];
    Object.entries(voteFileMap).forEach(([fileCategory, fileList]) => {
      if (fileList.length === 0) return;
      const file = fileList[0];
      const voteFileItem = {
        voteId: voteIdRef.current,
        sanhuiFile: {
          fileName: file?.name || file?.fileName,
          fileUrl: file?.url || file?.fileUrl,
          fileCategory,
          objectKey: file?.objectKey,
        },
      };
      if (file?.itemId) voteFileItem.fileId = file.itemId;
      sanhuiVoteFileList.push(voteFileItem);
    });

    if (sanhuiVoteFileList.length === 0) {
      message.error("请至少上传一个会议决议！");
      return;
    }

    sanhuiVoteSave({
      sanhuiMgmtId: props.id,
      voteId: voteIdRef.current,
      status,
      sanhuiVoteTopicList,
      sanhuiVoteFileList,
    }).then((res) => {
      if (res.code !== 200) return;
      message.success(res.message || "保存成功");
      if (status === "1") {
        navigate("/GztHome");
        return;
      }
      handleAllData();
      props.onCloseDetail?.("save");
    });
  };

  const updateDecisionFlag = (index, flagKey, value) => {
    const next = [...dataSource];
    const nextRecord = { ...next[index], [flagKey]: value };
    next[index] = nextRecord.resolutionMatterGenerated
      ? {
          ...nextRecord,
          resolutionMatter: getDefaultResolutionMatter(
            nextRecord,
            nextRecord.resolutionDate,
          ),
        }
      : nextRecord;
    setDataSource(next);
  };

  const renderVoteDecision = (text, record, index, flagKey, topicFlagKey) =>
    record.itemData?.eoSanhuiTopic?.[topicFlagKey] === "0" ? (
      "-"
    ) : (
      <Radio.Group
        className="vote-decision-radio"
        disabled={props.editStatus === "detail"}
        options={voteDecisionOptions}
        value={text}
        onChange={(event) => {
          updateDecisionFlag(index, flagKey, event.target.value);
        }}
      />
    );

  const updateTimelineFlag = (index, value) => {
    const next = [...dataSource];
    if (value === "1") {
      const resolutionDate = next[index].resolutionDate || getTodayValue();
      const shouldUseDefaultMatter = !next[index].resolutionMatter;
      const nextRecord = {
        ...next[index],
        timelineFlag: value,
        resolutionDate,
      };
      next[index] = {
        ...nextRecord,
        resolutionMatter: shouldUseDefaultMatter
          ? getDefaultResolutionMatter(nextRecord, resolutionDate)
          : next[index].resolutionMatter,
        resolutionMatterGenerated: shouldUseDefaultMatter,
      };
    } else {
      next[index] = {
        ...next[index],
        timelineFlag: value,
        resolutionDate: "",
        resolutionMatter: "",
        resolutionMatterGenerated: false,
      };
    }
    setDataSource(next);
  };

  const updateResolutionDate = (index, value) => {
    const next = [...dataSource];
    const nextRecord = { ...next[index], resolutionDate: value };
    next[index] = nextRecord.resolutionMatterGenerated
      ? {
          ...nextRecord,
          resolutionMatter: getDefaultResolutionMatter(nextRecord, value),
        }
      : nextRecord;
    setDataSource(next);
  };

  const updateResolutionMatter = (index, value) => {
    const next = [...dataSource];
    next[index] = {
      ...next[index],
      resolutionMatter: value,
      resolutionMatterGenerated: false,
    };
    setDataSource(next);
  };

  const columns = [
    {
      title: "序号",
      dataIndex: "index",
      width: 60,
      align: "center",
      render: (_value, _record, index) => index + 1,
    },
    { title: "议题名称", dataIndex: "toipcName", width: 220, align: "center" },
    {
      title: "董事会决议",
      dataIndex: "bodPassFlag",
      width: 400,
      align: "center",
      render: (text, record, index) =>
        renderVoteDecision(text, record, index, "bodPassFlag", "bodFlag"),
    },
    {
      title: "监事会决议",
      dataIndex: "bosPassFlag",
      width: 400,
      align: "center",
      render: (text, record, index) =>
        renderVoteDecision(text, record, index, "bosPassFlag", "bosFlag"),
    },
    {
      title: "股东会决议/投委会决议",
      dataIndex: "shPassFlag",
      width: 400,
      align: "center",
      render: (text, record, index) =>
        renderVoteDecision(text, record, index, "shPassFlag", "shsFlag"),
    },
    {
      title: "是否列入生命时间轴事项",
      dataIndex: "timelineFlag",
      width: 190,
      align: "center",
      render: (text, _record, index) => (
        <Radio.Group
          className="vote-timeline-radio"
          disabled={props.editStatus === "detail"}
          value={text || "0"}
          onChange={(event) => updateTimelineFlag(index, event.target.value)}
        >
          <Radio value="1">是</Radio>
          <Radio value="0">否</Radio>
        </Radio.Group>
      ),
    },
    {
      title: "日期",
      dataIndex: "resolutionDate",
      width: 150,
      align: "center",
      render: (text, record, index) => (
        <Input
          className="vote-edit-input"
          disabled={
            props.editStatus === "detail" || record.timelineFlag !== "1"
          }
          type="date"
          value={text}
          onChange={(event) => updateResolutionDate(index, event.target.value)}
        />
      ),
    },
    {
      title: "事项",
      dataIndex: "resolutionMatter",
      width: 360,
      align: "center",
      render: (text, record, index) => (
        <Input.TextArea
          className="vote-edit-input"
          disabled={
            props.editStatus === "detail" || record.timelineFlag !== "1"
          }
          value={text}
          autoSize={{ minRows: 2, maxRows: 4 }}
          placeholder="请输入事项"
          onChange={(event) =>
            updateResolutionMatter(index, event.target.value)
          }
        />
      ),
    },
    {
      title: "产权登记状态",
      dataIndex: "registerPropStatus",
      width: 180,
      render: (_value, record) =>
        registerStatusText[
          record.itemData?.eoSanhuiTopic?.registerPropStatus
        ] || "-",
    },
    {
      title: "操作",
      dataIndex: "action",
      width: 120,
      align: "center",
      render: (_value, record) =>
        record.itemData?.eoSanhuiTopic?.propRegisterFlag === "1" ? (
          <Button
            disabled={props.editStatus === "detail"}
            type="link"
            onClick={() => {
              setRowData(record);
              setRegistVisible(true);
            }}
          >
            产权登记发起
          </Button>
        ) : null,
    },
  ];

  return (
    <>
      <div className="vote-page">
        {/* <div className="vote-page-head">
          <div>
            <div className="vote-page-eyebrow">三会表决</div>
            <div className="vote-page-title">三会决议及表决结果确认</div>
          </div>
        </div> */}
        <Spin spinning={loading} tip="AI正在解析中，请稍等...">
          <div className="vote-section">
            <div className="vote-section-title">三会会议决议上传</div>
            <div className="vote-upload-grid">
              {MEETING_FILE_GROUPS.map((meetingItem) => {
                const uploadedCount = getMeetingUploadedCount(
                  meetingItem.title,
                );
                return (
                  <div key={meetingItem.key} className="vote-meeting-card">
                    <div className="vote-meeting-card-header">
                      <div className="vote-meeting-card-title">
                        {meetingItem.title}
                      </div>
                      <div className="vote-upload-count">{uploadedCount}/1</div>
                    </div>
                    {MEETING_FILE_TYPES.map((fileType) => {
                      const fileCategory = getFileCategory(
                        meetingItem.title,
                        fileType,
                      );
                      return (
                        <div
                          key={fileCategory}
                          className="vote-file-upload-item"
                        >
                          <div className="vote-file-upload-title">
                            <span>{fileType}</span>
                            <span>PDF</span>
                          </div>
                          <UploadFile
                            disabled={
                              props.editStatus === "detail" ||
                              uploadDisabled[meetingItem.key]
                            }
                            accept=".pdf"
                            dataList={voteFileMap[fileCategory]}
                            setDataList={(fileList) =>
                              setVoteFileList(fileCategory, fileList)
                            }
                            tipValue="支持拓展名：.pdf"
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="vote-section">
            <div className="vote-section-title">
              三会决议
              <Tooltip
                title="1.选项统一 同意 反对 有条件同意 回避表决
               2.	是否列入生命时间轴事项如果选择是，对应的工作写实和参股公司生命周期管理都要显示对应的数据
              3.工作写实的文件就是对应会议的会议完整版文件"
              >
                <QuestionCircleOutlined className="vote-section-help-icon" />
              </Tooltip>
            </div>
            <div className="vote-table-wrap">
              <Table
                className="vote-table"
                size="small"
                bordered
                scroll={{ x: "max-content", y: 280 }}
                columns={columns}
                dataSource={dataSource}
                rowKey="index"
                pagination={false}
              />
            </div>
          </div>
        </Spin>
        {props.editStatus !== "detail" ? (
          <div className="vote-button-group">
            <Button disabled={loading} onClick={() => onSave("0")}>
              保存
            </Button>
            <Button
              disabled={loading}
              type="primary"
              onClick={() => {
                const unfinished = dataSource.filter(
                  (item) =>
                    item.itemData?.eoSanhuiTopic?.propRegisterFlag === "1" &&
                    item.itemData?.eoSanhuiTopic?.registerPropStatus !== "500",
                );
                if (unfinished.length > 0) {
                  message.error("请先完成产权登记！");
                  return;
                }
                onSave("1");
              }}
            >
              提交
            </Button>
          </div>
        ) : null}
      </div>
      <Drawer
        title="产权登记信息"
        open={registVisible}
        width="70%"
        onClose={() => setRegistVisible(false)}
      >
        <div className="vote-register-placeholder">
          <div className="vote-section-title">产权登记发起</div>
          {rowData?.topicId ? (
            <>
              <p>议题ID：{rowData.topicId}</p>
              <p>
                产权登记类型：
                {rowData.itemData?.eoSanhuiTopic?.propRegType || "-"}
              </p>
              <p>公司ID：{infoData.companyId || "-"}</p>
              <p>
                原项目这里打开产权登记完整模块；当前新项目用本地占位保留入口和参数。
              </p>
            </>
          ) : (
            <Empty description="暂无产权登记数据" />
          )}
        </div>
      </Drawer>
    </>
  );
}
