import React, { useState, useEffect, useMemo } from "react";
import { Cascader, Spin } from "antd";
import styles from "./index.module.less";

const CascaderPanel = Cascader.Panel;

const NiceCascaderPanel = (props) => {
  const {
    title = "选择",
    options = [],
    value = [],
    onChange,
    style,
    disabled = false,
    loading = false,
  } = props;

  const [innerValue, setInnerValue] = useState(value || []);
  const [keyword, setKeyword] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options || []);

  /** 父组件 value 变化时回显 */
  useEffect(() => {
    setInnerValue(Array.isArray(value) ? value : []);
  }, [value]);

  /** options 变化时重置过滤结果 */
  useEffect(() => {
    setFilteredOptions(options || []);
  }, [options]);

  // ===================== 核心新增：根据选中value获取对应人员名字 =====================
  const selectedLabels = useMemo(() => {
    // 存储匹配到的标签
    const labelMap = new Map();
    // 深度遍历树形数据，匹配value和label
    const traverseTree = (nodes) => {
      if (!Array.isArray(nodes)) return;
      nodes.forEach((node) => {
        // 匹配当前节点value
        if (node.value !== undefined && innerValue.includes(node.value)) {
          labelMap.set(node.value, node.label || "未知人员");
        }
        // 递归遍历子节点
        if (Array.isArray(node.children)) {
          traverseTree(node.children);
        }
      });
    };

    traverseTree(options);
    // 按选中顺序返回名字数组
    return innerValue.map((val) => labelMap.get(val)).filter(Boolean);
  }, [innerValue, options]);

  // 处理名字展示：拼接文字，超长省略
  const selectedText = useMemo(() => {
    if (selectedLabels.length === 0) return "暂无选中人员";
    // // 最多展示3个名字，超出显示...
    // if (selectedLabels.length > 3) {
    //   return `${selectedLabels.slice(0, 3).join('、')}...`;
    // }
    return selectedLabels.join("、");
  }, [selectedLabels]);

  /** 收集所有叶子节点的 value，用于“全选” */
  const leafValues = useMemo(() => {
    const result = [];
    const dfs = (nodes) => {
      if (!Array.isArray(nodes)) return;
      nodes.forEach((node) => {
        if (Array.isArray(node.children) && node.children.length > 0) {
          dfs(node.children);
        } else if (node && node.value !== undefined) {
          result.push(node.value);
        }
      });
    };
    dfs(options);
    return result;
  }, [options]);

  /** 搜索过滤后的叶子节点，用于区分“当前过滤树中的选择” */
  const filteredLeafValues = useMemo(() => {
    const result = [];
    const dfs = (nodes) => {
      if (!Array.isArray(nodes)) return;
      nodes.forEach((node) => {
        if (Array.isArray(node.children) && node.children.length > 0) {
          dfs(node.children);
        } else if (node && node.value !== undefined) {
          result.push(node.value);
        }
      });
    };
    dfs(filteredOptions);
    return result;
  }, [filteredOptions]);

  /** 当前是否已全选（所有叶子都在 innerValue 中） */
  const isAllSelected = useMemo(() => {
    if (!leafValues.length) return false;
    if (!Array.isArray(innerValue) || innerValue.length === 0) return false;
    return leafValues.every((v) => innerValue.includes(v));
  }, [leafValues, innerValue]);

  /** 一键全选 / 取消全选 */
  const handleSelectAll = () => {
    if (disabled) return;
    let next = [];
    if (!isAllSelected) {
      next = leafValues.slice();
    }
    setInnerValue(next);
    if (onChange) {
      onChange(next);
    }
  };

  /** 只根据“用户”节点进行搜索匹配 */
  const matchUserNode = (node, kw) => {
    if (!node) return false;
    if (node.type !== "user") return false;
    const label = (node.label || "").toString().toLowerCase();
    const name =
      (node.rawUser && node.rawUser.name && node.rawUser.name.toLowerCase()) ||
      "";
    return label.includes(kw) || name.includes(kw);
  };

  /** 递归过滤 options，只保留包含匹配用户的分支 */
  const filterTree = (nodes, kw) => {
    if (!Array.isArray(nodes)) return [];
    const result = [];
    nodes.forEach((node) => {
      const children = Array.isArray(node.children)
        ? filterTree(node.children, kw)
        : [];
      const selfMatch = matchUserNode(node, kw);
      if (selfMatch) {
        result.push({ ...node });
      } else if (children.length > 0) {
        result.push({ ...node, children });
      }
    });
    return result;
  };

  /** 关键词变化时重新过滤显示用的树，但不动已选值 */
  useEffect(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) {
      setFilteredOptions(options || []);
    } else {
      const filtered = filterTree(options || [], kw);
      setFilteredOptions(filtered);
    }
  }, [keyword, options]);

  /** 清空搜索 */
  const handleClearKeyword = () => {
    if (disabled) return;
    setKeyword("");
  };

  /** 级联面板选择变化 */
  const handlePanelChange = (val) => {
    if (disabled) return;
    const hasKeyword = keyword.trim() !== "";

    if (!hasKeyword) {
      setInnerValue(val);
      if (onChange) onChange(val);
      return;
    }

    // 搜索时保留非过滤区域的选中值
    const filteredSet = new Set(filteredLeafValues);
    const preserved = (innerValue || []).filter((v) => !filteredSet.has(v));
    const unionSet = new Set([...preserved, ...val]);
    const next = Array.from(unionSet);

    setInnerValue(next);
    if (onChange) {
      onChange(next);
    }
  };

  return (
    <Spin spinning={loading}>
      <div className={styles.niceCascaderPanel} style={style}>
        {/* 头部标题 + 全选按钮 */}
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
          <button
            type="button"
            className={styles.selectAllBtn}
            onClick={handleSelectAll}
            disabled={disabled || !leafValues.length}
          >
            {isAllSelected ? "取消全选" : "全选"}
          </button>
        </div>

        {/* 工具栏：搜索 / 已选名字 + 已选数量 */}
        <div className={styles.toolbar}>
          {disabled ? (
            // ===================== 已选中名字展示（禁用状态） =====================
            <div
              className={styles.selectedNames}
              title={selectedLabels.join("、")}
            >
              {selectedText}
            </div>
          ) : (
            <div className={styles.search}>
              <input
                className={styles.searchInput}
                placeholder="按姓名搜索"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                disabled={disabled}
              />
              {keyword && !disabled && (
                <span className={styles.clearIcon} onClick={handleClearKeyword}>
                  ×
                </span>
              )}
            </div>
          )}
          <div className={styles.summary}>
            已选择
            <span className={styles.summaryNumber}>
              {Array.isArray(innerValue) ? innerValue.length : 0}
            </span>
            项
          </div>
        </div>

        {/* 级联面板 */}
        <div className={styles.panelWrapper}>
          <CascaderPanel
            options={filteredOptions}
            value={innerValue}
            showAllLevels={false}
            multiple
            onChange={handlePanelChange}
            disabled={disabled}
          />
        </div>
      </div>
    </Spin>
  );
};

export default NiceCascaderPanel;
