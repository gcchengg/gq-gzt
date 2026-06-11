import { DeleteOutlined, PrinterOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Checkbox, Drawer, Space, Table, Tag, Upload, message } from "antd";
import { useState } from "react";
import styles from "./index.module.css";

const seedMaterials = [
    { id: "1", name: "20250428中联电子议题关键信息页(1)P1.jpg", source: "批注内容", selected: true },
    { id: "2", name: "董事会议案表决建议P2.jpg", source: "批注内容", selected: true },
    { id: "3", name: "20250428中联电子议题关键信息页(1)P3.jpg", source: "手动上传", selected: false },
    { id: "4", name: "20250428中联电子议题关键信息页(1)P4.jpg", source: "手动上传", selected: false },
];

export function SupplementMaterials({ open, onClose }) {
    const [materials, setMaterials] = useState(seedMaterials);
    const move = (index, offset) => setMaterials((current) => {
        const next = [...current];
        const target = index + offset;
        if (target < 0 || target >= next.length) return current;
        [next[index], next[target]] = [next[target], next[index]];
        return next;
    });
    return (
        <Drawer title="补充汇报材料" open={open} width="92%" onClose={onClose} destroyOnHidden footer={<Button type="primary" onClick={() => { message.success("补充汇报材料已保存"); onClose(); }}>保存</Button>}>
            <div className={styles.materialSteps}>⚠ 第一步：可以混合上传多张图片和 PDF 文件，PDF 会按打印分页自动拆解成图片。<br />⚠ 第二步：通过列表第一列选择本议题展示的材料图片。</div>
            <Upload beforeUpload={() => false} showUploadList={false}><Button icon={<UploadOutlined />}>上传文件</Button></Upload>
            <Table
                className={styles.materialTable}
                rowKey="id"
                pagination={false}
                dataSource={materials}
                columns={[
                    { title: "选择", width: 70, align: "center", render: (_, record) => <Checkbox checked={record.selected} onChange={(event) => setMaterials((current) => current.map((item) => item.id === record.id ? { ...item, selected: event.target.checked } : item))} /> },
                    { title: "图片文件名", dataIndex: "name" },
                    { title: "缩略图", width: 160, align: "center", render: (_, record) => <div className={styles.thumbnail}>{record.source === "批注内容" ? "批注" : "预览"}</div> },
                    { title: "来源", dataIndex: "source", width: 120, render: (value) => <Tag color={value === "批注内容" ? "purple" : "blue"}>{value}</Tag> },
                    { title: "操作", width: 230, render: (_, record, index) => <Space><Button type="link" disabled={!index} onClick={() => move(index, -1)}>上移</Button><Button type="link" disabled={index === materials.length - 1} onClick={() => move(index, 1)}>下移</Button><Button danger type="link" icon={<DeleteOutlined />} onClick={() => setMaterials((current) => current.filter((item) => item.id !== record.id))}>删除</Button></Space> },
                ]}
            />
        </Drawer>
    );
}

export function EvaluationPreview({ open, topic, onClose }) {
    return (
        <Drawer title="PDF预览" open={open} width="94%" onClose={onClose} destroyOnHidden extra={<Button type="primary" icon={<PrinterOutlined />} onClick={() => message.success("已生成打印任务")}>打印/另存为PDF</Button>}>
            <div className={styles.previewSheet}>
                <section className={styles.previewPage}>
                    <h1>长春富维集团汽车零部件股份有限公司议案及表决建议</h1>
                    <div className={styles.companyTag}>股权公司</div>
                    <h2>提报材料</h2><p>gitlab.jpg</p>
                    <h2>会议概况</h2><p>董事会 · 2026年04月27日 · 通讯表决</p>
                    <h2>议案信息</h2><p>{topic?.topicName || "测试议题1"} · 董事会 √ · 监事会 - · 股东会 -</p>
                </section>
                <section className={styles.previewPage}>
                    <h1>议题评估结果</h1>
                    <table className={styles.docTable}><thead><tr><th>一级维度</th><th>评价要素</th><th>执行情况</th><th>评价结果</th></tr></thead><tbody><tr><td>合规性</td><td>外部管理规定</td><td>通过</td><td>通过</td></tr><tr><td>合理性</td><td>工作开展成效</td><td>符合要求</td><td>100</td></tr></tbody></table>
                    <h2>关联汇报材料与批注</h2>
                    <div className={styles.previewProof}><div className={styles.thumbnail}>批注材料 P1</div><p>关键净值与拆除费用表格区域，需要在评估前补充附件来源说明。</p></div>
                    <div className={styles.previewProof}><div className={styles.thumbnail}>批注材料 P2</div><p>报告中对于关键净值、拆除费用与管理要求的表述需进一步核对原始附件。</p></div>
                </section>
            </div>
        </Drawer>
    );
}
