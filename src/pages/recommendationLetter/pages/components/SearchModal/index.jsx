import React, { useState, useEffect } from "react";
import { Modal, Input, Table, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { getDictTree } from "../api/index";
import "./index.css";

const SearchModal = ({
  onOk = () => {},
  isEdit = false,
  value,
  isSearch = false,
}) => {
  const [szydOpen, setSzydOpen] = useState(false); // 三重一大事项弹窗
  const [selectedRowKeys, setSelectedRowKeys] = useState([]); // 选中的行
  const [sectorList, setSectorList] = useState([]);
  const [dataSource, setDataSource] = useState([]);

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    type: "radio",
  };

  const handleSearch = (value) => {
    console.log("value", value);
    const newOptions = sectorList.filter((item) => item.text.includes(value));
    console.log("newOptions", newOptions);
    setDataSource(newOptions);
  };

  const columns = [
    {
      title: "事项",
      width: 400,
      dataIndex: "text",
    },
    {
      title: "类型",
      width: 200,
      dataIndex: "property",
    },
  ];

  // 初始化下拉选项数据
  useEffect(() => {
    getDictTree({ dictType: "szyd_category" }).then((res) => {
      if (res.code === 200) {
        const arr =
          res.data
            ?.filter((item) => item.stoped === "0")
            ?.map((item) => ({
              value: item.value,
              text: item.text,
              label: item.text,
              property: item.property,
              topicType: item.topicType,
            })) || [];
        setSectorList(arr);
        setDataSource(arr);
      }
    });
  }, []);

  return (
    <div className="search-modal-wrap">
      <Select
        disabled={!isEdit}
        options={sectorList}
        value={value}
        dropdownStyle={{ display: "none" }}
        suffixIcon={
          <SearchOutlined
            onClick={() => isEdit && setSzydOpen(true)}
            style={{ fontSize: "14px" }}
          />
        }
        // readOnly
        onClick={() => isEdit && setSzydOpen(true)}
      />
      {szydOpen && (
        <Modal
          title="三重一大事项选择"
          open={szydOpen}
          width={700}
          className="search-modal"
          onCancel={() => setSzydOpen(false)}
          onOk={() => {
            const val = sectorList.find(
              (item) => item.value === selectedRowKeys[0],
            );
            onOk(val);
            setSzydOpen(false);
          }}
        >
          {isSearch && (
            <Input
              placeholder="请输入"
              allowClear
              style={{ marginBottom: 12 }}
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
            />
          )}
          <Table
            rowSelection={rowSelection}
            columns={columns}
            scroll={{ y: 500 }}
            dataSource={dataSource}
            onRow={(record) => {
              return {
                onClick: () => {
                  setSelectedRowKeys([record.value]);
                },
              };
            }}
            rowKey="value"
          />
        </Modal>
      )}
    </div>
  );
};

export default SearchModal;
