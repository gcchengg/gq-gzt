import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  ConfigProvider,
  Dropdown,
  Input,
  Menu,
  Select,
  Tooltip,
} from "antd";
import {
  BellOutlined,
  DownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MobileOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { navigationItems } from "../mockData";
import "@/components/AppShell.css";
import styles from "./index.module.less";

const roleOptions = [
  { key: "groupOffice", label: "集团董办", avatar: "董" },
  { key: "adminDepartment", label: "综合管理部", avatar: "综" },
  { key: "director", label: "董事", avatar: "董" },
];

const roleMenuKeys = {
  groupOffice: ["home", "appointment", "director-special-tasks"],
  adminDepartment: navigationItems
    .filter(({ key }) => key !== "director-special-tasks")
    .map(({ key }) => key),
  director: ["home", "management", "duty-tasks"],
};

const roleDefaultPage = {
  groupOffice: "appointment",
  adminDepartment: "home",
  director: "home",
};

export default function BoardGovernanceShell({
  activeKey,
  role,
  onRoleChange,
  children,
}) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const currentRole =
    roleOptions.find(({ key }) => key === role) || roleOptions[0];
  const visibleMenuKeys = roleMenuKeys[currentRole.key];
  const menuItems = useMemo(
    () =>
      navigationItems
        .filter(({ key }) => visibleMenuKeys.includes(key))
        .map(({ key, label, icon: Icon }) => {
          const path = `/boardGovernance/${key}`;
          return {
            key: path,
            icon: <Icon />,
            label: <Link to={path}>{label}</Link>,
          };
        }),
    [visibleMenuKeys],
  );

  useEffect(() => {
    if (!visibleMenuKeys.includes(activeKey)) {
      navigate(`/boardGovernance/${roleDefaultPage[currentRole.key]}`, {
        replace: true,
      });
    }
  }, [activeKey, currentRole.key, navigate, visibleMenuKeys]);

  const handleRoleChange = (nextRole) => {
    onRoleChange(nextRole);
    const nextVisibleMenuKeys = roleMenuKeys[nextRole];
    if (!nextVisibleMenuKeys.includes(activeKey)) {
      navigate(`/boardGovernance/${roleDefaultPage[nextRole]}`);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1677ff",
          borderRadius: 8,
          fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
        },
      }}
    >
      <div className={styles.shell}>
        <aside
          className={["gq-app-sidebar", collapsed ? "is-collapsed" : ""]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="gq-app-brand">
            <div className="gq-app-brand-mark">GQ</div>
            {collapsed ? null : (
              <div className="gq-app-brand-copy">
                <strong>董事会建设工作台</strong>
              </div>
            )}
          </div>
          <Menu
            className="gq-app-menu"
            mode="inline"
            inlineCollapsed={collapsed}
            selectedKeys={[`/boardGovernance/${activeKey}`]}
            items={menuItems}
          />
          <div className="gq-app-sidebar-footer">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((value) => !value)}
            >
              {collapsed ? null : "收起导航"}
            </Button>
          </div>
        </aside>
        <div className={styles.workspace}>
          <header className={styles.topbar}>
            <div className={styles.switches}>
              {/* <Select
                defaultValue="2026"
                options={[
                  { value: "2026", label: "2026 年度" },
                  { value: "2025", label: "2025 年度" },
                ]}
              /> */}
            </div>
            <div className={styles.tools}>
              {/* <Input
                prefix={<SearchOutlined />}
                placeholder="搜索董事、会议、议题、任务和资料"
              /> */}
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
                    { key: "groupOffice", label: "集团董办" },
                    { key: "adminDepartment", label: "综合管理部" },
                    { key: "director", label: "董事" },
                  ],
                  onClick: ({ key }) => handleRoleChange(key),
                }}
              >
                <button className={styles.user}>
                  <span>{currentRole.avatar}</span>
                  <div>
                    <strong>{currentRole.label}</strong>
                    <small>当前角色</small>
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
