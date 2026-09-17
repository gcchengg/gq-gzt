import { useMemo, useState } from "react";
import { Alert, Breadcrumb, Button, Upload, message } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader, SectionCard, StatusPill } from "../../components/PageKit";
import styles from "./index.module.less";

const { Dragger } = Upload;

export default function MaterialTaskView({ materials, onSubmit }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const department = searchParams.get("department") || "综合管理部-办公室";
  const departmentMaterials = useMemo(
    () => materials.filter((item) => item.department === department),
    [department, materials],
  );
  const [fileLists, setFileLists] = useState(() =>
    Object.fromEntries(
      departmentMaterials.map((item) => [
        item.id,
        (item.files || []).map((name, index) => ({
          uid: `${item.id}-${index}`,
          name,
          status: "done",
        })),
      ]),
    ),
  );
  const readyCount = departmentMaterials.filter(
    (item) => (fileLists[item.id] || []).length > 0,
  ).length;
  const canSubmit =
    departmentMaterials.length > 0 && readyCount === departmentMaterials.length;

  const handleFilesChange = (materialId, nextFileList) => {
    setFileLists((current) => ({
      ...current,
      [materialId]: nextFileList.slice(-5),
    }));
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      message.warning("请先为每一项资料上传文件");
      return;
    }
    onSubmit(fileLists);
    message.success(`${department}资料已提交，履职手册状态已更新`);
    navigate("/boardGovernance/directors?stage=preparation");
  };

  if (departmentMaterials.length === 0) {
    return (
      <div className={styles.page}>
        <Alert
          type="warning"
          showIcon
          message="未找到该部门的履职手册更新任务"
          action={<Link to="/boardGovernance/home">返回工作台首页</Link>}
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Breadcrumb
        className={styles.breadcrumb}
        items={[
          { title: <Link to="/boardGovernance/home">工作台首页</Link> },
          { title: "任务执行" },
          { title: department },
        ]}
      />
      <PageHeader
        eyebrow="TASK EXECUTION"
        title="更新董事履职手册资料"
        subtitle={`${department} · 请逐项上传本次更新文件，全部准备完成后统一提交`}
        actions={
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/boardGovernance/home")}
          >
            返回工作台
          </Button>
        }
      />
      <div className={styles.summary}>
        <div>
          <FileTextOutlined />
          <span>本次需提交</span>
          <strong>{departmentMaterials.length}</strong>
          <small>项资料</small>
        </div>
        <div>
          <UploadOutlined />
          <span>已选择文件</span>
          <strong>{readyCount}</strong>
          <small>项资料</small>
        </div>
        <div>
          <CheckCircleOutlined />
          <span>任务状态</span>
          <strong className={canSubmit ? styles.ready : ""}>
            {canSubmit ? "可提交" : "准备中"}
          </strong>
        </div>
      </div>
      <SectionCard
        title="任务资料"
        extra={
          <span className={styles.required}>每项资料至少上传 1 个文件</span>
        }
      >
        <div className={styles.materialList}>
          {departmentMaterials.map((item, index) => (
            <article className={styles.materialItem} key={item.id}>
              <div className={styles.materialInfo}>
                <span className={styles.number}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className={styles.materialTitle}>
                    <strong>{item.material}</strong>
                    <StatusPill>{item.status}</StatusPill>
                  </div>
                  <p>
                    {item.category} · 更新频次：{item.frequency}
                  </p>
                  <dl>
                    <div>
                      <dt>责任部门</dt>
                      <dd>{item.department}</dd>
                    </div>
                    <div>
                      <dt>责任人</dt>
                      <dd>{item.responsiblePerson}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              <Dragger
                className={styles.upload}
                multiple
                fileList={fileLists[item.id] || []}
                beforeUpload={() => false}
                onChange={({ fileList }) =>
                  handleFilesChange(item.id, fileList)
                }
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
                <p className="ant-upload-hint">
                  支持文档、表格、演示文稿及压缩包，单项最多 5 个文件
                </p>
              </Dragger>
            </article>
          ))}
        </div>
      </SectionCard>
      <div className={styles.actionBar}>
        <span>
          已完成 {readyCount} / {departmentMaterials.length} 项资料上传
        </span>
        <div>
          <Button onClick={() => navigate("/boardGovernance/home")}>
            取消
          </Button>
          <Button type="primary" disabled={!canSubmit} onClick={handleSubmit}>
            提交资料
          </Button>
        </div>
      </div>
    </div>
  );
}
