import "antd/dist/reset.css";
import { Button, Drawer, Form, Input, Modal, Select, Space, Spin, Table, Tag, message, } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import AssignDueDrawer from "./components/AssignDueDrawer";
import { getStatusText, sanhuiProgStatus, threeListDetail, threeListGetList, updateById, } from "./mockApi";
import "./index.css";
const statusColorMap = {
    "12000": "default",
    "13000": "processing",
    "14000": "purple",
    "15000": "gold",
    "16000": "cyan",
    "17000": "blue",
    "18000": "geekblue",
    "19000": "processing",
    "20000": "success",
    "99999": "error",
};
const initialPagination = {
    current: 1,
    pageSize: 10,
    total: 0,
};
export default function AssignPage() {
    const [form] = Form.useForm();
    const [overdueForm] = Form.useForm();
    const [tableData, setTableData] = useState([]);
    const [pagination, setPagination] = useState(initialPagination);
    const [loading, setLoading] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [editStatus, setEditStatus] = useState("detail");
    const [activeRecord, setActiveRecord] = useState(null);
    const [overdueRecord, setOverdueRecord] = useState(null);
    const [overdueSaving, setOverdueSaving] = useState(false);
    const getTableData = async (current = Number(pagination.current || 1), pageSize = Number(pagination.pageSize || 10)) => {
        setLoading(true);
        const values = form.getFieldsValue();
        const res = await threeListGetList({
            ...values,
            currentPage: current,
            pageSize,
        });
        setTableData(res.data.list);
        setPagination({ current, pageSize, total: res.data.total });
        setLoading(false);
    };
    useEffect(() => {
        form.setFieldsValue({ progStatus: "19000" });
        getTableData(1, 10);
    }, []);
    const openDetail = async (record, mode) => {
        setEditStatus(mode);
        const res = await threeListDetail(record.id);
        setActiveRecord(res.data);
        setDetailOpen(true);
    };
    const columns = useMemo(() => [
        {
            title: "序号",
            dataIndex: "index",
            key: "index",
            width: 64,
            fixed: "left",
            render: (_text, _record, index) => Number(pagination.pageSize || 10) * (Number(pagination.current || 1) - 1) + index + 1,
        },
        {
            title: "参股公司统一社会信用代码",
            dataIndex: "companyCreditCode",
            key: "companyCreditCode",
            width: 210,
        },
        {
            title: "参股公司简称",
            dataIndex: "companyName",
            key: "companyName",
            width: 220,
        },
        {
            title: "会议及议题编码",
            dataIndex: "mgmtNo",
            key: "mgmtNo",
            width: 180,
        },
        {
            title: "创建人",
            dataIndex: "createUserName",
            key: "createUserName",
            width: 100,
        },
        {
            title: "创建时间",
            dataIndex: "created",
            key: "created",
            width: 180,
            render: (value) => (value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : ""),
        },
        {
            title: "更新人",
            dataIndex: "updateUserName",
            key: "updateUserName",
            width: 100,
        },
        {
            title: "更新时间",
            dataIndex: "updated",
            key: "updated",
            width: 180,
            render: (value) => (value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : ""),
        },
        {
            title: "提报人",
            dataIndex: "submitUserName",
            key: "submitUserName",
            width: 110,
        },
        {
            title: "提报时间",
            dataIndex: "submitTime",
            key: "submitTime",
            width: 180,
            render: (value) => (value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : ""),
        },
        {
            title: "状态",
            dataIndex: "progStatus",
            key: "progStatus",
            fixed: "right",
            width: 130,
            render: (value) => <Tag color={statusColorMap[String(value)]}>{getStatusText(value)}</Tag>,
        },
        {
            title: "操作",
            key: "action",
            fixed: "right",
            width: 210,
            render: (_text, record) => (<Space size="small">
            {String(record.progStatus) === "19000" ? (<Button type="link" onClick={() => openDetail(record, "edit")}>
                处理
              </Button>) : null}
            <Button type="link" onClick={() => openDetail(record, "detail")}>
              查看
            </Button>
            {String(record.progStatus) === "99999" ? (<Button type="link" onClick={() => {
                        setOverdueRecord(record);
                        overdueForm.setFieldsValue({ overdueRemark: record.overdueRemark });
                    }}>
                逾期说明
              </Button>) : null}
          </Space>),
        },
    ], [pagination.current, pagination.pageSize]);
    const handleOverdueOk = async () => {
        const values = await overdueForm.validateFields();
        if (!overdueRecord)
            return;
        setOverdueSaving(true);
        await updateById({ id: overdueRecord.id, overdueRemark: values.overdueRemark || "" });
        message.success("保存成功");
        setOverdueSaving(false);
        setOverdueRecord(null);
        getTableData();
    };
    return (<div className="assign-page">
      <Spin spinning={loading} tip="加载中...">
        <section className="assign-search">
          <Form form={form} layout="vertical" colon={false}>
            <div className="assign-search-grid">
              <Form.Item name="companyCreditCode" label="参股公司统一社会信用代码">
                <Input allowClear/>
              </Form.Item>
              <Form.Item name="companyName" label="参股公司简称">
                <Input allowClear/>
              </Form.Item>
              <Form.Item name="progStatus" label="状态">
                <Select allowClear placeholder="请选择" options={sanhuiProgStatus.map((item) => ({
            label: item.text,
            value: item.value,
        }))}/>
              </Form.Item>
              <Form.Item name="submitUserName" label="提报人">
                <Input allowClear/>
              </Form.Item>
              <div className="assign-search-actions">
                <Button onClick={() => {
            form.resetFields();
            form.setFieldsValue({ progStatus: "19000" });
            getTableData(1, Number(pagination.pageSize || 10));
        }}>
                  重置
                </Button>
                <Button type="primary" onClick={() => getTableData(1, Number(pagination.pageSize || 10))}>
                  查询
                </Button>
              </div>
            </div>
          </Form>
        </section>

        <section className="assign-table-card">
          <div className="assign-table-head">
            <div className="assign-table-title">交办汇总</div>
            <div className="assign-table-total">共 {pagination.total || 0} 条</div>
          </div>
          <Table columns={columns} size="small" dataSource={tableData} rowKey="id" scroll={{ x: 1900, y: 520 }} pagination={pagination} onChange={(page) => getTableData(Number(page.current || 1), Number(page.pageSize || 10))}/>
        </section>
      </Spin>

      <Drawer width="80%" title={activeRecord ? (<div className="assign-drawer-title">
              <span>{getStatusText(activeRecord.progStatus)}</span>
              <em>|</em>
              <small>{activeRecord.mgmtNo}</small>
              <small>{activeRecord.companyName}</small>
            </div>) : null} open={detailOpen} destroyOnClose onClose={() => setDetailOpen(false)} className="assign-detail-drawer">
        {activeRecord ? (<AssignDueDrawer id={activeRecord.id} record={activeRecord} editStatus={editStatus} progStatus={activeRecord.progStatus} onCloseDetail={(type) => {
                if (type === "submit" || type === "save") {
                    getTableData();
                }
                setDetailOpen(false);
            }}/>) : null}
      </Drawer>

      <Modal title="逾期说明" open={Boolean(overdueRecord)} width={860} confirmLoading={overdueSaving} destroyOnClose onOk={handleOverdueOk} onCancel={() => setOverdueRecord(null)}>
        <Form form={overdueForm} layout="vertical">
          <Form.Item name="overdueRemark" label="逾期原因">
            <Input.TextArea rows={6} placeholder="请输入逾期原因"/>
          </Form.Item>
        </Form>
      </Modal>
    </div>);
}
