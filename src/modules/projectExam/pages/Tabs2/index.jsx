import React, { useState, useEffect, useRef } from "react";
import { Input, Table, Button, message, Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import {
  sanhuiStatus,
  UploadFileWps,
} from "@/pages/recommendationLetter/support";
import { examLibPageList } from "../../api/index";
import "./index.less";

const MedalManager = () => {
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [tableData, setTableData] = useState([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [rowData, setRowData] = useState({});
  const [tikuValue, setTikuValue] = useState("");
  const [fileList, setFileList] = useState([]);
  const [fileList2, setFileList2] = useState([]);
  const libraryStoreRef = useRef([]);
  // 题库维护表格列配置
  const bankColumns = [
    {
      title: "题库ID",
      dataIndex: "libCode",
    },
    {
      title: "题库名称",
      dataIndex: "libName",
    },
    {
      title: "状态",
      dataIndex: "status",
      render: (status, record) => {
        return (
          <div>
            {sanhuiStatus(record.status, [
              { value: "0", text: "创建中" },
              { value: "1", text: "考点已生成" },
            ])}
          </div>
        );
      },
    },
    // {
    //   title: '文件数',
    //   dataIndex: 'fileCount',
    //   key: 'fileCount',
    // },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <div className="action-buttons">
          <Button
            onClick={() => {
              setDetailOpen(true);
              setRowData({
                ...record,
                fileList: record.fileList || [],
                fileList2: record.fileList2 || [],
              });
            }}
          >
            维护
          </Button>
          <Button
            danger
            onClick={() => {
              Modal.confirm({
                title: "删除题库",
                icon: <ExclamationCircleOutlined />,
                content: "确定要删除该题库吗？",
                okText: "确定",
                cancelText: "取消",
                onOk: () => {
                  libraryStoreRef.current = libraryStoreRef.current.filter(
                    (item) => item.id !== record.id,
                  );
                  message.success("删除成功");
                  getList({ current: 1 });
                },
              });
            }}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];
  const getList = async (params = {}) => {
    try {
      setLoading(true);
      if (libraryStoreRef.current.length === 0) {
        const res = await examLibPageList();
        if (res.code === 200) {
          libraryStoreRef.current = res.data?.list || [];
        }
      }
      const current = params.current || pagination.current;
      const pageSize = params.pageSize || pagination.pageSize;
      setTableData(
        libraryStoreRef.current.slice(
          (current - 1) * pageSize,
          current * pageSize,
        ),
      );
      setPagination({
        current,
        pageSize,
        total: libraryStoreRef.current.length,
      });
    } catch (error) {
      message.error("题库列表加载失败");
    } finally {
      setLoading(false);
    }
  };
  const handleTableChange = (pagination) => {
    getList({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  useEffect(() => {
    getList();
  }, []);
  useEffect(() => {
    if (!addOpen) {
      setTikuValue("");
      setFileList([]);
    }
  }, [addOpen]);

  return (
    <div className="bank-manage-section">
      <div className="section-header">
        <div>
          <h3 className="section-title">题库维护</h3>
        </div>
        <Button type="primary" onClick={() => setAddOpen(true)}>
          新增题库
        </Button>
      </div>

      {/* 题库列表表格 */}
      <Table
        rowKey="id"
        columns={bankColumns}
        dataSource={tableData}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
        loading={loading}
        className="common-table"
      />
      {addOpen && (
        <Modal
          title="新增题库"
          width={600}
          open={addOpen}
          onCancel={() => setAddOpen(false)}
          confirmLoading={loading}
          className="add-result-modal"
          okText="保存"
          onOk={() => {
            if (!tikuValue) {
              message.error("题库名称不能为空！");
              return;
            }
            if (fileList.length === 0 && fileList2.length === 0) {
              message.error("请上传题库文件！");
              return;
            }
            const nextIndex = libraryStoreRef.current.length + 1;
            libraryStoreRef.current = [
              {
                id: `library-${Date.now()}`,
                libCode: `BK-MOCK-${String(nextIndex).padStart(3, "0")}`,
                libName: tikuValue,
                status: "0",
                fileList,
                fileList2,
              },
              ...libraryStoreRef.current,
            ];
            message.success("题库添加成功！");
            setAddOpen(false);
            setTikuValue("");
            setFileList([]);
            setFileList2([]);
            getList({ current: 1 });
          }}
        >
          <div className="add-form">
            <div className="addNav">
              <div className="addNav-title">题库名称</div>
              <div className="input-wrapper">
                <Input
                  placeholder="请输入题库名称"
                  value={tikuValue}
                  onChange={(e) => setTikuValue(e.target.value)}
                />
              </div>
            </div>
            <div className="addNav">
              <div className="addNav-title">上传知识文档（可多选）</div>
              <div className="file-wrapper">
                <UploadFileWps
                  dataList={fileList}
                  setDataList={(data) => setFileList(data)}
                />
              </div>
            </div>
            <div className="addNav">
              <div className="addNav-title">上传试题文件（可多选）</div>
              <div className="file-wrapper">
                <UploadFileWps
                  dataList={fileList2}
                  setDataList={(data) => setFileList2(data)}
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
      {detailOpen && (
        <Modal
          title="题库文件维护"
          width={600}
          open={detailOpen}
          onCancel={() => setDetailOpen(false)}
          confirmLoading={loading}
          className="weihu-result-modal"
          okText="保存"
          onOk={() => {
            if (!rowData.libName) {
              message.error("题库名称不能为空！");
              return;
            }
            if (
              rowData.fileList?.length === 0 &&
              rowData.fileList2?.length === 0
            ) {
              message.error("请上传题库文件！");
              return;
            }
            libraryStoreRef.current = libraryStoreRef.current.map((item) =>
              item.id === rowData.id ? { ...item, ...rowData } : item,
            );
            message.success("题库文件维护成功！");
            setDetailOpen(false);
            setRowData({});
            getList();
          }}
        >
          <div className="add-form">
            <div className="addNav">
              <div className="addNav-title">题库名称</div>
              <div className="input-wrapper">
                <Input
                  placeholder="请输入题库名称"
                  value={rowData.libName}
                  onChange={(e) =>
                    setRowData({ ...rowData, libName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="addNav">
              <div className="addNav-title">上传知识文档</div>
              <div className="file-wrapper">
                <UploadFileWps
                  setLoading={setLoading}
                  dataList={rowData.fileList || []}
                  setDataList={(data) =>
                    setRowData({ ...rowData, fileList: data })
                  }
                />
              </div>
            </div>
            <div className="addNav">
              <div className="addNav-title">上传试题文件</div>
              <div className="file-wrapper">
                <UploadFileWps
                  dataList={rowData.fileList2}
                  setDataList={(data) =>
                    setRowData({ ...rowData, fileList2: data })
                  }
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MedalManager;
