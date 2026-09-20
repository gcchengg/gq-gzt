import { useMemo, useState } from "react";
import { Button, Empty, Input, message, Table, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {
  ROLE_DIRECTORY,
  ROLE_KEYS,
  ROLE_META,
  ROLE_ORDER,
  initialRolePersonnel,
} from "../../roleConfigData";
import styles from "./index.module.less";

export default function RoleConfigView() {
  const [selectedRole, setSelectedRole] = useState(ROLE_KEYS.GROUP_OFFICE);
  const [searchText, setSearchText] = useState("");
  const [personnel, setPersonnel] = useState(initialRolePersonnel);
  const [selectedRowKeys, setSelectedRowKeys] = useState(
    initialRolePersonnel
      .filter((item) => item.role === ROLE_KEYS.GROUP_OFFICE)
      .map((item) => item.userId),
  );

  const selectedMeta = ROLE_META[selectedRole];
  const panelTitle =
    selectedRole === ROLE_KEYS.GROUP_OFFICE
      ? "集团董办人员维护"
      : `${selectedMeta.label}维护`;

  const roleCounts = useMemo(
    () =>
      ROLE_ORDER.reduce((counts, role) => {
        counts[role] = personnel.filter((item) => item.role === role).length;
        return counts;
      }, {}),
    [personnel],
  );

  const filteredData = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    return personnel.filter((item) => {
      const text =
        `${item.userName || ""}${item.userId || ""}${item.orgName || ""}`.toLowerCase();
      return text.includes(keyword);
    });
  }, [personnel, searchText]);

  const selectRole = (role) => {
    setSelectedRole(role);
    setSelectedRowKeys(
      personnel.filter((item) => item.role === role).map((item) => item.userId),
    );
  };

  const handleSave = () => {
    const selectedIds = new Set(selectedRowKeys);
    setPersonnel((current) =>
      current.map((item) => {
        if (selectedIds.has(item.userId))
          return { ...item, role: selectedRole };
        if (item.role === selectedRole) return { ...item, role: null };
        return item;
      }),
    );
    message.success("保存成功");
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (_, selectedRows) => {
      const visibleSelectedIds = selectedRows.map((item) => item.userId);
      const hiddenSelectedIds = selectedRowKeys.filter(
        (id) => !filteredData.some((item) => item.userId === id),
      );
      setSelectedRowKeys([
        ...new Set([...hiddenSelectedIds, ...visibleSelectedIds]),
      ]);
    },
  };

  const columns = [
    {
      title: "人员",
      dataIndex: "userName",
      render: (name, record) => (
        <div className={styles.personCell}>
          <span className={styles.personName}>{name || "-"}</span>
          <span className={styles.personId}>{record.userId}</span>
        </div>
      ),
    },
    {
      title: "所属组织",
      dataIndex: "orgName",
      render: (name) => name || "-",
    },
    {
      title: "当前角色",
      dataIndex: "role",
      render: (role) =>
        role ? (
          <Tag color={ROLE_META[role].color}>{ROLE_META[role].label}</Tag>
        ) : (
          <Tag>未配置</Tag>
        ),
    },
    {
      title: "数据范围",
      dataIndex: "role",
      render: (role) => <Tag>{role ? ROLE_META[role].scope : "无"}</Tag>,
    },
  ];

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>角色配置</h1>
      <div className={styles.content}>
        <aside className={`${styles.panel} ${styles.roleDirectory}`}>
          <h2 className={styles.directoryTitle}>权限角色</h2>
          {ROLE_DIRECTORY.map((group) => (
            <div key={group.title}>
              <p
                className={`${styles.groupTitle} ${
                  group.type === "department" ? styles.department : ""
                }`}
              >
                {group.title}
              </p>
              {group.roles
                ? group.roles.map((role) => (
                    <RoleCard
                      key={role}
                      role={role}
                      selectedRole={selectedRole}
                      count={roleCounts[role] || 0}
                      global={group.type === "global"}
                      onSelect={selectRole}
                    />
                  ))
                : group.sections.map((section) => (
                    <DirectorySection
                      key={section.title || section.roles?.[0]}
                      section={section}
                      selectedRole={selectedRole}
                      roleCounts={roleCounts}
                      onSelect={selectRole}
                    />
                  ))}
            </div>
          ))}
        </aside>

        <main className={`${styles.panel} ${styles.personnelPanel}`}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelTitleLine}>
                <h2>{panelTitle}</h2>
                {selectedRole === ROLE_KEYS.GROUP_OFFICE ? (
                  <Tag color="blue">最高权限</Tag>
                ) : null}
              </div>
              <p className={styles.scopeDesc}>{selectedMeta.description}</p>
            </div>
          </div>

          <div className={styles.filterBar}>
            <Input
              allowClear
              value={searchText}
              prefix={<SearchOutlined />}
              placeholder="请输入姓名、账号或所属组织"
              onChange={(event) => setSearchText(event.target.value)}
            />
            <Button onClick={() => setSearchText("")}>重置</Button>
          </div>

          <Table
            className={styles.personnelTable}
            rowKey="userId"
            columns={columns}
            dataSource={filteredData}
            rowSelection={rowSelection}
            pagination={false}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无人员数据"
                />
              ),
            }}
          />

          <div className={styles.footerBar}>
            <span className={styles.selectedCount}>
              已选择 {selectedRowKeys.length} 人作为{selectedMeta.label}
            </span>
            <Button
              type="primary"
              className={styles.saveBtn}
              onClick={handleSave}
            >
              保存
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}

function DirectorySection({ section, selectedRole, roleCounts, onSelect }) {
  return (
    <div>
      {section.title ? (
        <p className={styles.sectionTitle}>{section.title}</p>
      ) : null}
      {section.subsections
        ? section.subsections
            .filter((subsection) => !subsection.hidden)
            .map((subsection) => (
              <div key={subsection.title}>
                <p className={styles.subSectionTitle}>{subsection.title}</p>
                {subsection.roles.map((role) => (
                  <RoleCard
                    key={role}
                    role={role}
                    selectedRole={selectedRole}
                    count={roleCounts[role] || 0}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            ))
        : section.roles.map((role) => (
            <RoleCard
              key={role}
              role={role}
              selectedRole={selectedRole}
              count={roleCounts[role] || 0}
              onSelect={onSelect}
            />
          ))}
    </div>
  );
}

function RoleCard({ role, selectedRole, count, global, onSelect }) {
  const item = ROLE_META[role];
  const Icon = item.icon;
  const scopeText = global
    ? `${item.scope} · ${count} 人`
    : item.unit
      ? `${item.unit} · ${item.scope}`
      : item.scope;
  return (
    <button
      type="button"
      className={`${styles.roleCard} ${global ? styles.global : ""} ${
        selectedRole === role ? styles.active : ""
      }`}
      onClick={() => onSelect(role)}
    >
      <div className={styles.roleName}>
        <span>
          <Icon /> {item.label}
        </span>
        {global ? <Tag color="blue">全局</Tag> : null}
        {item.kind === "category" ? <Tag>资料类别</Tag> : null}
      </div>
      <div className={styles.roleScope}>{scopeText}</div>
      {global ? null : <div className={styles.roleCount}>{count} 人</div>}
    </button>
  );
}
