import { useState } from "react";
import { Button, Modal, Switch, Upload } from "antd";
import {
  CloudUploadOutlined,
  FieldTimeOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import styles from "./index.module.less";

const { Dragger } = Upload;

// 全流程四步骤定义
const PROCESS_STEPS = [
  {
    key: "letter",
    title: "下发董事推荐函",
    owner: "集团董办",
    icon: "✉",
    hint: "上传推荐函并发送钉钉消息给接收人",
  },
  {
    key: "resume",
    title: "上传董事简历",
    owner: "综合管理部-办公室",
    icon: "📄",
    hint: "上传简历文件，完成材料校验",
  },
  {
    key: "permission",
    title: "配置系统权限并纳入组织架构",
    owner: "综合管理部-数字化",
    icon: "🔐",
    hint: "开通工作台账号，同步人员、岗位与任期信息",
  },
  {
    key: "change",
    title: "工商变更",
    owner: "综合管理部-董办",
    icon: "🏢",
    hint: "确认完成后归档聘任事项",
  },
];

export default function AppointmentActionPanel({
  item,
  roleLabel,
  allowedActions,
  onUpdate,
}) {
  const { currentStep = 0, status = "", completed } = item || {};

  if (completed || status === "已完成") {
    return (
      <section className={styles.completed}>
        <CheckCircleFilled />
        <div>
          <span>聘任流程已完成</span>
          <h3>{item.director} 已完成全部流程并正式归档</h3>
          <p>
            推荐函、董事简历、权限记录、组织关系与工商变更结果已形成完整证据链归档。
          </p>
        </div>
      </section>
    );
  }

  // 决定当前步骤的 key
  const currentStepKey =
    currentStep === 0
      ? "letter"
      : currentStep === 1
        ? "resume"
        : currentStep === 2
          ? "permission"
          : "change";

  return (
    <section className={styles.actionPanel}>
      {/* 当前步骤操作区 */}
      <div className={styles.stepBody}>
        <div className={styles.stepHeader}>
          {/* <div className={styles.stepBadge}>
            <FieldTimeOutlined />
            <span>
              当前步骤 · {currentStep + 1} / {PROCESS_STEPS.length}
            </span>
          </div> */}
          <h3>董事简历</h3>
          <p>{PROCESS_STEPS[currentStep].hint}</p>
        </div>

        {currentStep === 0 && (
          <LetterStep item={item} roleLabel={roleLabel} onUpdate={onUpdate} />
        )}
        {currentStep === 1 && (
          <ResumeStep
            item={item}
            roleLabel={roleLabel}
            allowedActions={allowedActions}
            onUpdate={onUpdate}
          />
        )}
        {currentStep === 2 && (
          <PermissionStep
            item={item}
            roleLabel={roleLabel}
            allowedActions={allowedActions}
            onUpdate={onUpdate}
          />
        )}
        {currentStep === 3 && (
          <ChangeStep
            item={item}
            roleLabel={roleLabel}
            allowedActions={allowedActions}
            onUpdate={onUpdate}
          />
        )}
      </div>

      {/* 后续步骤预览（不可交互，仅展示） */}
      {/* {currentStep < PROCESS_STEPS.length - 1 && (
        <div className={styles.upcomingSteps}>
          <span className={styles.upcomingLabel}>后续步骤</span>
          {PROCESS_STEPS.slice(currentStep + 1).map((step) => (
            <div key={step.key} className={styles.upcomingStep}>
              <div className={styles.upcomingDot} />
              <div>
                <strong>{step.title}</strong>
                <small>{step.owner}</small>
              </div>
            </div>
          ))}
        </div>
      )} */}
    </section>
  );
}

/* ─── Step 0: 下发推荐函（列表页触发，此处做兜底展示） ─── */
function LetterStep({ item, roleLabel }) {
  return (
    <div className={styles.stepCard}>
      <div className={styles.stepInfo}>
        <span>事项编号</span>
        <strong>{item?.id}</strong>
      </div>
      <div className={styles.stepInfo}>
        <span>推荐函</span>
        <strong>{item?.letter || "—"}</strong>
      </div>
      <div className={styles.stepInfo}>
        <span>接收人</span>
        <strong>{item?.owner}</strong>
      </div>
      <p className={styles.stepNote}>
        推荐函已下发，当前由接收人上传董事简历。
      </p>
    </div>
  );
}

/* ─── Step 1: 上传董事简历 ─── */
function ResumeStep({ item, roleLabel, allowedActions, onUpdate }) {
  const [files, setFiles] = useState(
    item?.resumeName ? [{ name: item.resumeName }] : [],
  );
  const canOperate = allowedActions?.includes("resume");

  const submit = () => {
    if (!files.length) return;
    onUpdate(
      {
        currentStep: 2,
        status: "待配置系统权限并纳入组织架构",
        owner: "综合管理部-数字化 / 林远",
        recipient: "综合管理部-数字化 / 林远",
        resumeName: files[0].name,
      },
      "董事简历已上传并提交，事项已转交数字化科室",
    );
  };

  return (
    <div className={styles.stepCard}>
      {!canOperate ? (
        <p className={styles.stepNote}>当前等待综合管理部-人力上传董事简历。</p>
      ) : (
        <>
          <Dragger
            accept=".pdf,.doc,.docx"
            maxCount={1}
            beforeUpload={() => false}
            fileList={files}
            onChange={({ fileList }) => setFiles(fileList)}
          >
            <CloudUploadOutlined />
            <p>点击或拖拽上传董事简历</p>
            <small>支持 PDF、DOC、DOCX，单文件不超过 20MB</small>
          </Dragger>
          <div className={styles.actionBar}>
            <span>
              {files.length ? `待提交：${files[0].name}` : "上传文件后方可提交"}
            </span>
            <Button type="primary" disabled={!files.length} onClick={submit}>
              上传并提交
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Step 2: 配置系统权限并纳入组织架构 ─── */
function PermissionStep({ item, roleLabel, allowedActions, onUpdate }) {
  const [permissionDone, setPermissionDone] = useState(
    Boolean(item?.permissionDone),
  );
  const canOperate = allowedActions?.includes("permission");

  const save = () => {
    onUpdate(
      {
        permissionDone,
        currentStep: 3,
        status: "待完成工商变更",
        owner: "综合管理部-董办 / 王珂",
        recipient: "综合管理部-董办 / 王珂",
      },
      "系统权限已配置并纳入组织架构，事项进入工商变更阶段",
    );
  };

  return (
    <div className={styles.stepCard}>
      {!canOperate ? (
        <p className={styles.stepNote}>
          当前等待综合管理部-数字化配置系统权限并纳入组织架构。
        </p>
      ) : (
        <>
          <div className={styles.switches}>
            <label className={styles.switchRow}>
              <div>
                <b>开通董事工作台账号</b>
                <span>账号、密码及初始登录指引</span>
              </div>
              <Switch
                checked={permissionDone}
                checkedChildren="已完成"
                unCheckedChildren="未完成"
                onChange={setPermissionDone}
              />
            </label>
            <label className={styles.switchRow}>
              <div>
                <b>纳入组织架构</b>
                <span>同步人员、岗位与任期信息</span>
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
            <span></span>
            <Button type="primary" onClick={save}>
              提交
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Step 3: 工商变更 ─── */
function ChangeStep({ item, roleLabel, allowedActions, onUpdate }) {
  const canOperate = allowedActions?.includes("change");

  const confirm = () => {
    Modal.confirm({
      title: "确认完成工商变更？",
      content: "确认后，该聘任事项状态将变更为「已完成」并归档。",
      okText: "确认完成",
      cancelText: "取消",
      onOk: () =>
        onUpdate(
          {
            currentStep: 4,
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
    <div className={styles.stepCard}>
      {!canOperate ? (
        <p className={styles.stepNote}>
          当前等待综合管理部-董办确认工商变更完成。
        </p>
      ) : (
        <>
          <div className={styles.changeConfirm}>
            <SmileOutlined className={styles.changeIcon} />
            <div>
              <strong>所有前置步骤已完成</strong>
              <p>
                推荐函、简历、系统权限与组织架构均已确认，现在可以完成工商变更归档。
              </p>
            </div>
          </div>
          <div className={styles.actionBar}>
            <span>确认后流程结束，事项归档</span>
            <Button type="primary" onClick={confirm}>
              确认完成工商变更
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
