import {
  AppstoreOutlined,
  FileDoneOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
import { Button, Menu, Radio } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import webmenu from "@/pages/webmenu.json";
import TaskIssueDrawer from "./TaskIssueDrawer";
import "./AppShell.css";

const iconById = {
  workbench: <HomeOutlined />,
  "sanhui-work": <ProjectOutlined />,
  demo: <AppstoreOutlined />,
};

const normalizePath = (path = "") => {
  if (!path) return "/";
  if (/^https?:\/\//.test(path)) return path;
  return `/${path}`.replace(/\/+/g, "/");
};

const getPathOnly = (path = "") => path.split("?")[0];
const isShelllessPath = (path = "") => path === "/ai-pricing";

const flattenMenus = (menus = []) =>
  menus.flatMap((item) => {
    if (Array.isArray(item.children) && item.children.length) {
      return flattenMenus(item.children);
    }
    return [{ ...item, key: normalizePath(item.key) }];
  });

const findParentKeys = (menus = [], activePath = "", parents = []) => {
  for (const item of menus) {
    const itemKey = normalizePath(item.key || item.id);
    const nextParents = [...parents, item.id || itemKey];

    if (Array.isArray(item.children) && item.children.length) {
      const result = findParentKeys(item.children, activePath, nextParents);
      if (result) return result;
    }

    if (getPathOnly(itemKey) === getPathOnly(activePath)) {
      return parents;
    }
  }

  return null;
};

function createMenuItems(menus = []) {
  return menus
    .filter((item) => !item.hideInMenu)
    .map((item) => {
      const path = normalizePath(item.key);
      const hasChildren =
        Array.isArray(item.children) && item.children.length > 0;

      if (hasChildren) {
        return {
          key: item.id || path,
          icon: iconById[item.id] || <FileDoneOutlined />,
          label: item.title,
          children: createMenuItems(item.children),
        };
      }

      return {
        key: path,
        label: <Link to={path}>{item.title}</Link>,
      };
    });
}

export default function AppShell() {
  const { pathname, search } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState("manager");
  const [sanhuiDetailContext, setSanhuiDetailContext] = useState({
    open: false,
    record: null,
  });
  const fullPath = pathname + search;
  const isShelllessPage = isShelllessPath(pathname);

  const menuItems = useMemo(() => createMenuItems(webmenu), []);
  const leafMenus = useMemo(() => flattenMenus(webmenu), []);

  const selectedKey = useMemo(() => {
    const matched = leafMenus.find(
      (item) => getPathOnly(item.key) === pathname,
    );
    return matched?.key || pathname;
  }, [leafMenus, pathname]);

  const [openKeys, setOpenKeys] = useState(
    () => findParentKeys(webmenu, fullPath) || [],
  );

  useEffect(() => {
    if (!collapsed) {
      setOpenKeys(findParentKeys(webmenu, fullPath) || []);
    }
  }, [collapsed, fullPath]);

  useEffect(() => {
    const handleSanhuiDetailContext = (event) => {
      setSanhuiDetailContext(event.detail || { open: false, record: null });
    };

    window.addEventListener(
      "gq:sanhui-detail-context",
      handleSanhuiDetailContext,
    );
    return () => {
      window.removeEventListener(
        "gq:sanhui-detail-context",
        handleSanhuiDetailContext,
      );
    };
  }, []);

  useEffect(() => {
    if (pathname !== "/newSanhui" && sanhuiDetailContext.open) {
      setSanhuiDetailContext({ open: false, record: null });
    }
  }, [pathname, sanhuiDetailContext.open]);

  if (isShelllessPage) {
    return <Outlet />;
  }

  return (
    <div className="gq-app-shell">
      <aside
        className={["gq-app-sidebar", collapsed ? "is-collapsed" : ""].join(
          " ",
        )}
      >
        <div className="gq-app-brand">
          <div className="gq-app-brand-mark">GQ</div>
          {!collapsed ? (
            <div className="gq-app-brand-copy">
              <strong>股权云工作台</strong>
            </div>
          ) : null}
        </div>

        <Menu
          className="gq-app-menu"
          mode="inline"
          inlineCollapsed={collapsed}
          selectedKeys={[selectedKey]}
          openKeys={collapsed ? undefined : openKeys}
          onOpenChange={setOpenKeys}
          items={menuItems}
        />

        <div className="gq-app-role-switch">
          {!collapsed ? (
            <div className="gq-app-role-title">角色选择</div>
          ) : null}
          <Radio.Group
            className="gq-app-role-radio"
            optionType="button"
            buttonStyle="solid"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            options={[
              { label: collapsed ? "股" : "股权管理者", value: "director" },
              { label: collapsed ? "管" : "管户", value: "manager" },
            ]}
          />
        </div>

        <div className="gq-app-sidebar-footer">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed((value) => !value)}
          >
            {!collapsed ? "收起导航" : null}
          </Button>
        </div>
      </aside>

      <main className="gq-app-main">
        <Outlet />
      </main>
      {role === "director" && sanhuiDetailContext.open ? (
        <TaskIssueDrawer
          key={sanhuiDetailContext.record?.id || "sanhui-task-drawer"}
          sanhuiRecord={sanhuiDetailContext.record}
          isSanhui={false}
          ifFromTask={true}
          onSubmit={(payload) => {
            console.log(payload);
          }}
        />
      ) : null}
    </div>
  );
}
