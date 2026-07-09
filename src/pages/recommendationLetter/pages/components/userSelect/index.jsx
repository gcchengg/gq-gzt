import React, { useEffect, useState } from "react";
import { TreeSelect } from "antd";
import { getUser } from "./api/index";
const { SHOW_PARENT } = TreeSelect;
export default function UserSelect(props) {
  const [value, setValue] = useState();
  const [treeData, setTreeDate] = useState([]);
  useEffect(() => {
    getUser().then((res) => {
      let arr = [];
      const clonedData = getRecursionDatas(res.data);
      console.log(clonedData);
      arr.push({ ...clonedData, disabled: true });
      setTreeDate([...arr]);
    });
  }, []);
  useEffect(() => {
    if (props.idList) {
      if (props.multiple) {
        setValue([...props.idList]);
      } else {
        setValue(props.idList);
      }
    }
  }, [props.idList]);
  const onChange = (newValue, newLabel) => {
    props.onSelect(newValue, newLabel);
    setValue(newValue);
  };
  const tProps = {
    treeData,
    value,
    onChange,
    treeCheckable: props.multiple,
    showCheckedStrategy: SHOW_PARENT,
    placeholder: "请选择",
    fieldNames: {
      label: "orgName",
      value: "id",
      key: "id",
    },
    style: {
      width: "100%",
      ...props.style,
    },
    filterTreeNode: (inputValue, treeNode) => {
      if (!inputValue) {
        return true;
      }
      const lowerCaseInput = inputValue.toLowerCase();
      const lowerCaseTitle = (treeNode.props.orgName || "").toLowerCase();
      return lowerCaseTitle.includes(lowerCaseInput);
    },
  };
  return (
    <TreeSelect
      showSearch
      {...tProps}
      defaultValue={props.defaultValue}
      disabled={props.disabled ? true : false}
    />
  );
}

function deepClone(obj) {
  // 简单的深拷贝实现，适用于大多数情况；对于更复杂的情况，考虑使用专门的库。
  return JSON.parse(JSON.stringify(obj));
}

function getRecursionDatas(node) {
  let obj = node;
  if (obj.members && obj.members.length > 0) {
    obj.members.forEach((member) => {
      const childNode = {
        id: member.loginId,
        tenantId: member.tenantId,
        createdBy: member.createdBy,
        created: member.created,
        updated: member.updated,
        updatedBy: member.updatedBy,
        version: member.version,
        groupCode: node.groupCode, // 继承自父节点的 groupCode
        orgName: `${member.fullName}`, // 使用成员的 fullName 作为 orgName 并标注为成员
        parentId: node.id, // 成员的 parentId 应该是指向当前节点的 id
        status: member.status,
        dutyUserId: member.loginId,
        dutyUserName: member.fullName,
        respManagerUserId: node.dutyUserId, // 可以指定一个负责人，这里用节点的责任人代替
        respManagerUserName: node.dutyUserName,
        disabled: false,
        children: [], // 成员没有子节点
        // disabled: false
      };
      obj.children.push(childNode);
    });
    delete obj.members;
  }
  if (obj.children && obj.children.length > 0) {
    obj.children = obj.children.map((item) => {
      return {
        ...getRecursionDatas(item),
        disabled: item.disabled === false ? false : true,
      };
    });
  }
  return obj;
}

function getRecursionData(node) {
  // 如果当前节点有 members，则处理这些成员
  if (node.members && node.members.length > 0) {
    node.children = node.children || []; // 确保 children 存在
    node.members.forEach((member) => {
      // 将 member 转换为与 children 相同格式的对象
      const childNode = {
        id: member.loginId,
        tenantId: member.tenantId,
        createdBy: member.createdBy,
        created: member.created,
        updated: member.updated,
        updatedBy: member.updatedBy,
        version: member.version,
        groupCode: node.groupCode, // 继承自父节点的 groupCode
        orgName: `${member.fullName}`, // 使用成员的 fullName 作为 orgName 并标注为成员
        parentId: node.id, // 成员的 parentId 应该是指向当前节点的 id
        status: member.status,
        dutyUserId: member.loginId,
        dutyUserName: member.fullName,
        respManagerUserId: node.dutyUserId, // 可以指定一个负责人，这里用节点的责任人代替
        respManagerUserName: node.dutyUserName,
        children: [], // 成员没有子节点
      };
      node.children.push(childNode);
    });
    // 移除原始的 members 属性（可选）
    delete node.members;
  }

  // 递归地对每个子节点执行相同的操作
  if (node.children && node.children.length > 0) {
    node.children.forEach(getRecursionData);
  }
}
