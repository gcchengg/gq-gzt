import { useState } from "react";
import { Button, Modal, Switch, Upload } from "antd";
import {
  CheckCircleFilled,
  CloudUploadOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import styles from "./index.module.less";

const { Dragger } = Upload;

export default function AppointmentActionPanel({
  item,
  roleLabel,
  allowedActions,
  onUpdate,
}) {
  const [files, setFiles] = useState([]);
  const [permissionDone, setPermissionDone] = useState(
    Boolean(item.permissionDone),
  );

  if (item.completed) {
    return (
      <section className={styles.completed}>
        <CheckCircleFilled />
        <div>
          <span>聘任流程已完成</span>
          <h3>{item.director} 已完成工商变更并正式归档</h3>
          <p>
            推荐函、董事简历、权限记录、组织关系与工商变更结果已形成完整证据链。
          </p>
        </div>
      </section>
    );
  }

  if (item.status === "待上传董事简历") {
    if (!allowedActions.includes("resume")) {
      return (
        <RoleNotice
          roleLabel={roleLabel}
          message="当前事项等待综合管理部-人力上传董事简历"
        />
      );
    }
    const submitResume = () => {
      if (!files.length) return;
      onUpdate(
        {
          currentStep: 3,
          status: "待权限配置",
          owner: "综合管理部-人力 / 周航",
          recipient: "综合管理部-人力 / 周航",
          resumeName: files[0].name,
        },
        "董事简历已上传并提交，事项已转交人力科室",
      );
      setFiles([]);
    };
    return (
      <section className={styles.panel}>
        <header>
          <div className={styles.icon}>
            <CloudUploadOutlined />
          </div>
          <div>
            <span>当前办理角色 · {roleLabel}</span>
            <h3>上传董事简历</h3>
            <p>
              上传董事简历并提交，系统随即更新事项状态，并向数字化经办人发送办理待办。
            </p>
          </div>
        </header>
        <Dragger
          accept=".pdf,.doc,.docx"
          maxCount={1}
          beforeUpload={() => false}
          fileList={files}
          onChange={({ fileList }) => setFiles(fileList)}
        >
          <CloudUploadOutlined />
          <p>点击或拖拽上传董事简历</p>
          <small>支持 PDF、DOC、DOCX，单个文件不超过 20MB</small>
        </Dragger>
        <div className={styles.actionBar}>
          <span>
            {files.length ? `待提交：${files[0].name}` : "上传文件后方可提交"}
          </span>
          <Button
            type="primary"
            disabled={!files.length}
            onClick={submitResume}
          >
            上传并提交
          </Button>
        </div>
      </section>
    );
  }

  if (item.status === "待配置系统权限") {
    if (!allowedActions.includes("permission")) {
      return (
        <RoleNotice
          roleLabel={roleLabel}
          message="当前事项等待综合管理部-数字化配置系统权限"
        />
      );
    }
    const saveConfiguration = () => {
      onUpdate(
        {
          permissionDone,
          currentStep: permissionDone ? 5 : 3,
          status: permissionDone ? "待选举变更" : "待权限配置",
          owner: permissionDone
            ? "综合管理部-董办 / 王珂"
            : "综合管理部-数字化 / 林远",
          recipient: permissionDone
            ? "综合管理部-董办 / 王珂"
            : "综合管理部-数字化 / 林远",
        },
        permissionDone
          ? "系统权限已配置，事项进入待选举变更"
          : "权限配置状态已保存",
      );
    };
    return (
      <section className={styles.panel}>
        <header>
          <div className={styles.icon}>
            <SafetyCertificateOutlined />
          </div>
          <div>
            <span>当前办理角色 · {roleLabel}</span>
            <h3>配置系统权限</h3>
            <p>
              确认工作台账号、任职企业和数据权限，完成后自动流转至综合管理部-董办。
            </p>
          </div>
        </header>
        <div className={styles.switches}>
          <label>
            <div>
              <b>配置系统权限</b>
              <span>账号、董事工作台、任职企业数据权限</span>
            </div>
            <Switch
              checked={permissionDone}
              checkedChildren="已完成"
              unCheckedChildren="未完成"
              onChange={setPermissionDone}
            />
          </label>
        </div>
        <div className={styles.actionBar}>
          <span>手动修改后点击保存，系统记录操作人和操作时间</span>
          <Button type="primary" onClick={saveConfiguration}>
            保存权限配置
          </Button>
        </div>
      </section>
    );
  }

  if (!allowedActions.includes("change")) {
    return (
      <RoleNotice
        roleLabel={roleLabel}
        message="当前事项等待综合管理部-董办完成变更"
      />
    );
  }

  const confirmCompletion = () => {
    Modal.confirm({
      title: "确认完成工商变更？",
      content: "确认后，该聘任事项状态将变更为“已完成”并归档。",
      okText: "确认完成",
      cancelText: "取消",
      onOk: () =>
        onUpdate(
          {
            currentStep: 7,
            status: "已完成",
            owner: "已归档",
            recipient: "—",
            completed: true,
          },
          "工商变更已完成，聘任事项已归档",
        ),
    });
  };

  return (
    <section className={styles.finalAction}>
      <Button type="primary" size="large" onClick={confirmCompletion}>
        完成工商变更
      </Button>
    </section>
  );
}

function RoleNotice({ roleLabel, message }) {
  return (
    <section className={styles.roleNotice}>
      <span>当前办理角色 · {roleLabel}</span>
      <strong>当前角色暂无可办理动作</strong>
      <p>{message}。你仍可查看全量台账、流程定位和消息审计轨迹。</p>
    </section>
  );
}
