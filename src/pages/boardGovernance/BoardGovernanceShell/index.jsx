import {
  Badge,
  Button,
  ConfigProvider,
  Dropdown,
  Input,
  Select,
  Tooltip,
} from "antd";
import {
  BellOutlined,
  DownOutlined,
  MobileOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { navigationItems } from "../mockData";
import styles from "./index.module.less";

export default function BoardGovernanceShell({
  activeKey,
  role,
  onRoleChange,
  children,
}) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#245fca",
          borderRadius: 8,
          fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
        },
      }}
    >
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.brand}>
            <div className={styles.logo}>FAW</div>
            <div>
              <strong>董事会建设工作台</strong>
              <span>BOARD GOVERNANCE</span>
            </div>
          </div>
          <nav>
            {navigationItems.map(({ key, label, icon: Icon }) => (
              <Link
                key={key}
                className={activeKey === key ? styles.active : ""}
                to={`/boardGovernance/${key}`}
              >
                <Icon />
                <span>{label}</span>
                {key === "monitoring" ? <b>3</b> : null}
              </Link>
            ))}
          </nav>
          <div className={styles.sidebarFoot}>
            <SafetyCertificateOutlined />
            <div>
              <strong>内部系统</strong>
              <span>操作全程留痕</span>
            </div>
          </div>
        </aside>
        <div className={styles.workspace}>
          <header className={styles.topbar}>
            <div className={styles.switches}>
              {/* <Select
                defaultValue="all"
                options={[
                  { value: "all", label: "一汽股权及所属企业" },
                  { value: "gq", label: "一汽股权" },
                  { value: "qn", label: "旗新动力科技" },
                ]}
              /> */}
              <Select
                defaultValue="2026"
                options={[
                  { value: "2026", label: "2026 年度" },
                  { value: "2025", label: "2025 年度" },
                ]}
              />
            </div>
            <div className={styles.tools}>
              <Input
                prefix={<SearchOutlined />}
                placeholder="搜索董事、会议、议题、任务和资料"
              />
              <Tooltip title="董事移动端">
                <Link to="/boardGovernance/mobile">
                  <Button type="text" icon={<MobileOutlined />} />
                </Link>
              </Tooltip>
              <Badge count={5} size="small">
                <Button type="text" icon={<BellOutlined />} />
              </Badge>
              <Dropdown
                menu={{
                  items: [
                    { key: "office", label: "公司董办" },
                    { key: "director", label: "董事视角" },
                  ],
                  onClick: ({ key }) => onRoleChange(key),
                }}
              >
                <button className={styles.user}>
                  <span>{role === "director" ? "张" : "阮"}</span>
                  <div>
                    <strong>{role === "director" ? "张铁斌" : "阮迪"}</strong>
                    <small>
                      {role === "director" ? "外部董事召集人" : "公司董办"}
                    </small>
                  </div>
                  <DownOutlined />
                </button>
              </Dropdown>
            </div>
          </header>
          <main className={styles.main}>{children}</main>
        </div>
      </div>
    </ConfigProvider>
  );
}
