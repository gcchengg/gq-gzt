import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Checkbox, Drawer, Space, Table, Tag, Upload, message } from "antd";
import { useMemo, useState } from "react";
import previewData from "@/components/test.json";
import PreReview from "./PreReview";
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
        <Drawer title="补充汇报材料" open={open} width="92%" onClose={onClose} destroyOnHidden footer={<div className={styles.detailFooter}><Button type="primary" onClick={() => { message.success("补充汇报材料已保存"); onClose(); }}>保存</Button></div>}>
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
    const previewTopic = useMemo(() => {
        const topicName = topic?.topicName || topic?.toipcName || topic?.proposalName;
        const assessmentList = previewData?.data?.assessmentList || [];
        return assessmentList.find((item) => item.topicName === topicName) || assessmentList[0] || {};
    }, [topic]);

    return (
        <PreReview
            title="材料预览"
            type="sanhui"
            open={open}
            setOpen={(nextOpen) => {
                if (!nextOpen) onClose?.();
            }}
            tableData={previewTopic.assessmentList || []}
            infoData={{ title: previewTopic.topicName || topic?.topicName || previewData?.data?.companyName || "材料预览" }}
        />
    );
}
