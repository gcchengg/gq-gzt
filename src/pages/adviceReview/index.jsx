import {
  Button,
  Card,
  DatePicker,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Spin,
  Table,
  message,
} from "antd";
import {
  CloseOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  RedoOutlined,
  SendOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

const pdfUrl = "/advice-review/6a2133fde4b0cb6abf664a41.pdf";
const previewUrl = "/advice-review/6a2133fde4b0cb6abf664a41.pdf.png";
const adviceTopics = [
  {
    id: "topic-001",
    categoryLv1Name: "1. 经营类",
    categoryLv2Name: "1.3 定期监管报告",
    categoryLv3Name:
      "1.3.1 按国家部委等上级机构监管要求定期报告事项（含反洗钱、反欺诈、重大风险评估、绩效追索扣回、离任审计、内部控制等）",
    topicName: "年度财务决算报告",
    board: true,
    supervisor: false,
    shareholder: false,
    reviewLevel: "业务总监",
  },
  {
    id: "topic-002",
    categoryLv1Name: "1. 经营类",
    categoryLv2Name: "1.3 定期监管报告",
    categoryLv3Name:
      "1.3.1 按国家部委等上级机构监管要求定期报告事项（含反洗钱、反欺诈、重大风险评估、绩效追索扣回、离任审计、内部控制等）",
    topicName: "年度财务决算报告",
    board: true,
    supervisor: false,
    shareholder: false,
    reviewLevel: "业务总监",
  },
];
const adviceTopicColumns = [
  { title: "序号", width: 64, render: (_value, _record, index) => index + 1 },
  { title: "议题分类（大）", dataIndex: "categoryLv1Name", width: 140 },
  { title: "议题分类（中）", dataIndex: "categoryLv2Name", width: 180 },
  { title: "议题分类（小）", dataIndex: "categoryLv3Name", width: 720 },
  { title: "议题名称", dataIndex: "topicName", width: 120 },
  {
    title: "董事会",
    dataIndex: "board",
    width: 88,
    render: (value) => (value ? "√" : "-"),
  },
  {
    title: "监事会",
    dataIndex: "supervisor",
    width: 88,
    render: (value) => (value ? "√" : "-"),
  },
  {
    title: "股东会",
    dataIndex: "shareholder",
    width: 88,
    render: (value) => (value ? "√" : "-"),
  },
  { title: "审批层级", dataIndex: "reviewLevel", width: 120 },
];

function ScreenshotButton({ onClick }) {
  return (
    <Button type="primary" icon={<SendOutlined />} onClick={onClick}>
      一键下发任务
    </Button>
  );
}

function AnnotationDrawer({ open, onClose, imageData, onSubmit }) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [form] = Form.useForm();
  const [annotations, setAnnotations] = useState([]);
  const [actions, setActions] = useState([[]]);
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [currentAnno, setCurrentAnno] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [color, setColor] = useState("#d92d20");
  const [loading, setLoading] = useState(false);

  const redrawAnnotations = (annoList = annotations) => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    annoList.forEach((anno) => {
      const x = anno.width < 0 ? anno.x + anno.width : anno.x;
      const y = anno.height < 0 ? anno.y + anno.height : anno.y;
      const width = Math.abs(anno.width);
      const height = Math.abs(anno.height);

      ctx.strokeStyle = anno.color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      if (anno.text) {
        ctx.font = "16px sans-serif";
        const textWidth = ctx.measureText(anno.text).width;
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.fillRect(x + 4, Math.max(4, y - 26), textWidth + 12, 24);
        ctx.fillStyle = anno.color;
        ctx.fillText(anno.text, x + 10, Math.max(22, y - 8));
      }
    });
  };

  const getCanvasPoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  useEffect(() => {
    if (!open || !imageData || !canvasRef.current) return;

    setLoading(true);
    setAnnotations([]);
    setActions([[]]);
    setCurrentActionIndex(0);
    setShowTextInput(false);

    const image = new Image();
    image.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      imageRef.current = image;
      setLoading(false);
    };
    image.onerror = () => {
      message.error("预览图加载失败");
      setLoading(false);
    };
    image.src = imageData;
  }, [open, imageData]);

  const handleMouseDown = (event) => {
    const point = getCanvasPoint(event);
    setCurrentAnno({
      x: point.x,
      y: point.y,
      width: 0,
      height: 0,
      color,
      text: "",
    });
    setIsDrawing(true);
  };

  const handleMouseMove = (event) => {
    if (!isDrawing || !currentAnno) return;
    const point = getCanvasPoint(event);
    const nextAnno = {
      ...currentAnno,
      width: point.x - currentAnno.x,
      height: point.y - currentAnno.y,
    };
    setCurrentAnno(nextAnno);
    redrawAnnotations();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(nextAnno.x, nextAnno.y, nextAnno.width, nextAnno.height);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setTextInput("");
    setShowTextInput(true);
  };

  const saveAnnotation = () => {
    if (!textInput.trim()) {
      message.warning("请输入批注内容");
      return;
    }

    const nextAnnotations = [
      ...annotations,
      {
        ...currentAnno,
        text: textInput.trim(),
      },
    ];
    const nextActions = [
      ...actions.slice(0, currentActionIndex + 1),
      nextAnnotations,
    ];
    setAnnotations(nextAnnotations);
    setActions(nextActions);
    setCurrentActionIndex(nextActions.length - 1);
    setShowTextInput(false);
    redrawAnnotations(nextAnnotations);
  };

  const undo = () => {
    if (currentActionIndex <= 0) return;
    const nextIndex = currentActionIndex - 1;
    setCurrentActionIndex(nextIndex);
    setAnnotations(actions[nextIndex]);
    redrawAnnotations(actions[nextIndex]);
  };

  const redo = () => {
    if (currentActionIndex >= actions.length - 1) return;
    const nextIndex = currentActionIndex + 1;
    setCurrentActionIndex(nextIndex);
    setAnnotations(actions[nextIndex]);
    redrawAnnotations(actions[nextIndex]);
  };

  const saveToImage = async () => {
    await form.validateFields();
    message.success("提交成功");
    onSubmit();
  };

  return (
    <Drawer
      title="截图标注"
      width="82%"
      open={open}
      onClose={onClose}
      destroyOnHidden
      extra={
        <Space>
          <Button
            onClick={undo}
            disabled={currentActionIndex <= 0}
            icon={<UndoOutlined />}
          >
            撤销
          </Button>
          <Button
            onClick={redo}
            disabled={currentActionIndex >= actions.length - 1}
            icon={<RedoOutlined />}
          >
            重做
          </Button>
          <Button onClick={onClose} icon={<CloseOutlined />}>
            关闭
          </Button>
        </Space>
      }
    >
      <Spin spinning={loading} tip="加载中...">
        <Card className="advice-annotation-card">
          <div className="advice-annotation-title">
            <span />
            表决建议审阅-截图标注
          </div>
        </Card>

        <div className="advice-annotation-tool">
          <label>标注颜色</label>
          <input
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
          />
        </div>

        <div className="advice-canvas-wrap">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
          {showTextInput && currentAnno ? (
            <div
              className="advice-annotation-popover"
              style={{
                left: `min(${(currentAnno.x / (canvasRef.current?.width || 1)) * 100 + 2}%, calc(100% - 240px))`,
                top: `${Math.max(
                  12,
                  (currentAnno.y / (canvasRef.current?.height || 1)) *
                    (canvasRef.current?.getBoundingClientRect().height || 1),
                )}px`,
              }}
            >
              <Input
                placeholder="输入批注内容"
                value={textInput}
                onChange={(event) => setTextInput(event.target.value)}
              />
              <Space>
                <Button type="primary" size="small" onClick={saveAnnotation}>
                  确认
                </Button>
                <Button size="small" onClick={() => setShowTextInput(false)}>
                  取消
                </Button>
              </Space>
            </div>
          ) : null}
        </div>

        <Form
          form={form}
          layout="vertical"
          className="advice-task-form"
          initialValues={{
            workflowName: "表决建议审阅",
            dutyUserType: "manager",
            cmplMethod: "material",
          }}
        >
          <Form.Item name="workflowName" label="流程名称">
            <Select
              options={[
                { label: "表决建议审阅", value: "表决建议审阅" },
                { label: "材料复核", value: "材料复核" },
              ]}
            />
          </Form.Item>
          <Form.Item name="dutyUserType" label="指派执行人">
            <Select
              options={[
                { label: "管户经理", value: "manager" },
                { label: "法律合规部", value: "legal" },
                { label: "股权运营部", value: "operation" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="taskDesc"
            label="督办描述"
            rules={[{ required: true, message: "请输入督办描述" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="请输入需要对方关注的 PDF 标注说明"
            />
          </Form.Item>
          <Form.Item
            name="deadlineDate"
            label="完成时间"
            rules={[{ required: true, message: "请选择完成时间" }]}
          >
            <DatePicker />
          </Form.Item>
        </Form>

        <div className="advice-drawer-footer">
          <Button type="primary" onClick={saveToImage}>
            提交
          </Button>
        </div>
      </Spin>
    </Drawer>
  );
}

export default function AdviceReview() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [screenshot, setScreenshot] = useState(null);

  const handleCapture = async () => {
    setScreenshot(previewUrl);
    setDrawerOpen(true);
    message.success("截图成功，可在抽屉中进行标注");
  };

  return (
    <div className="advice-review-page">
      <div className="advice-review-shell">
        <div className="advice-review-header">
          <div>
            <h1>表决建议审阅</h1>
          </div>
          <div className="contentHeader">
            <ScreenshotButton onClick={handleCapture} />
          </div>
        </div>

        <Card
          title={`议题列表（${adviceTopics.length}）`}
          className="advice-pdf-card"
        >
          <Table
            rowKey="id"
            columns={adviceTopicColumns}
            dataSource={adviceTopics}
            pagination={false}
            size="small"
            scroll={{ x: 1616 }}
          />
        </Card>

        <div className="advice-pdf-card">
          <div className="advice-pdf-toolbar">
            <div>
              <FilePdfOutlined />
              <span>6a2133fde4b0cb6abf664a41.pdf</span>
            </div>
            <Button href={pdfUrl} target="_blank" icon={<DownloadOutlined />}>
              打开 PDF
            </Button>
          </div>
          <iframe
            title="表决建议 PDF"
            src={`${pdfUrl}#toolbar=1&navpanes=0`}
            className="advice-pdf-frame"
          />
        </div>
      </div>

      <AnnotationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        imageData={screenshot}
        onSubmit={() => navigate("/GztHome")}
      />
    </div>
  );
}
