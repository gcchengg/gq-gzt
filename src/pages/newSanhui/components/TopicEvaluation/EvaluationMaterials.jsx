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
            <div className={styles.evalPreviewBody}>
                <div className={styles.evalPreviewSheet}>
                    <section className={styles.evalPreviewPage}>
                        <div className={styles.evalPreviewDocTitle}>
                            长春富维集团汽车零部件股份有限公司测试发送钉钉的议案及表决建议
                        </div>
                        <div className={styles.evalPreviewCompanyTag}>股权公司</div>
                        <div className={styles.evalPreviewRule} />

                        <div className={styles.evalPreviewSection}>
                            <div className={styles.evalPreviewSectionTitle}>提报材料</div>
                            <table className={styles.evalPreviewTable}>
                                <colgroup>
                                    <col style={{ width: "90px" }} />
                                    <col />
                                </colgroup>
                                <thead><tr><th>序号</th><th>文件</th></tr></thead>
                                <tbody><tr><td>1</td><td className={styles.left}>gitlab.jpg</td></tr></tbody>
                            </table>
                        </div>

                        <div className={styles.evalPreviewSection}>
                            <div className={styles.evalPreviewSectionTitle}>风控合规审核意见</div>
                        </div>

                        <div className={styles.evalPreviewSection}>
                            <div className={styles.evalPreviewSectionTitle}>风控合规风险提示应对建议</div>
                        </div>

                        <div className={styles.evalPreviewSection}>
                            <div className={styles.evalPreviewSectionTitle}>会议概况</div>
                            <table className={styles.evalPreviewTable}>
                                <colgroup>
                                    <col style={{ width: "180px" }} />
                                    <col />
                                    <col style={{ width: "220px" }} />
                                    <col style={{ width: "180px" }} />
                                </colgroup>
                                <thead><tr><th>会议分类</th><th>会议名称</th><th>会议日期</th><th>会议形式</th></tr></thead>
                                <tbody><tr><td>董事会</td><td className={styles.left}>测试发送钉钉</td><td>2026年04月27日</td><td>通讯表决</td></tr></tbody>
                            </table>
                        </div>

                        <div className={styles.evalPreviewSection}>
                            <div className={styles.evalPreviewSectionTitle}>议案信息</div>
                            <table className={styles.evalPreviewTable}>
                                <colgroup>
                                    <col style={{ width: "90px" }} />
                                    <col />
                                    <col style={{ width: "150px" }} />
                                    <col style={{ width: "150px" }} />
                                    <col style={{ width: "150px" }} />
                                </colgroup>
                                <thead><tr><th>序号</th><th>议案名称</th><th>董事会</th><th>监事会</th><th>股东会</th></tr></thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td className={styles.left}>{topic?.topicName || "测试议题1"}</td>
                                        <td>√<br />(回避表决)</td>
                                        <td>–</td>
                                        <td>–</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className={styles.evalPreviewPage}>
                        <div className={styles.evalPreviewSection}>
                            <div className={styles.evalPreviewSectionTitle}>议题1:测</div>
                            <table className={styles.evalPreviewTable}>
                                <colgroup>
                                    <col style={{ width: "60px" }} />
                                    <col style={{ width: "92px" }} />
                                    <col style={{ width: "92px" }} />
                                    <col style={{ width: "126px" }} />
                                    <col style={{ width: "74px" }} />
                                    <col />
                                    <col style={{ width: "78px" }} />
                                    <col style={{ width: "430px" }} />
                                    <col style={{ width: "126px" }} />
                                    <col style={{ width: "90px" }} />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>序号</th>
                                        <th>一级维度</th>
                                        <th>二级维度</th>
                                        <th>评价要素</th>
                                        <th>权重</th>
                                        <th>评价标准</th>
                                        <th>执行情况</th>
                                        <th>评价规则</th>
                                        <th>评价结果(分)</th>
                                        <th>异常提示</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>1</td><td rowSpan="4">合规性</td><td rowSpan="3">实质合规</td><td>外部管理规定</td><td>/</td><td className={styles.left}>政策法规及国家部委等上级机构的监管要求</td><td>12</td><td className={styles.left}>符合要求或不涉及，通过；不符合要求，否决该议案</td><td>通过</td><td><span className={styles.greenDot} /></td></tr>
                                    <tr><td>2</td><td>内部管理规定</td><td>/</td><td className={styles.left}>该公司内部该类事项管理要求</td><td>1</td><td className={styles.left}>符合要求或不涉及，通过；不符合要求，否决该议案</td><td>通过</td><td><span className={styles.greenDot} /></td></tr>
                                    <tr><td>3</td><td>控股股东要求</td><td>/</td><td className={styles.left}>控股股东该类事项要求</td><td>1</td><td className={styles.left}>符合要求或不涉及，通过；不符合要求，否决该议案</td><td>通过</td><td><span className={styles.greenDot} /></td></tr>
                                    <tr><td>4</td><td>程序合规</td><td>审议程序</td><td>/</td><td className={styles.left}>是否按制度要求进行前置审议</td><td>1</td><td className={styles.left}>符合要求或不涉及，通过；不符合要求，否决该议案</td><td>通过</td><td><span className={styles.greenDot} /></td></tr>
                                    <tr><td>5</td><td>合理性</td><td>工作开展情况</td><td>工作开展成效</td><td>100%</td><td className={styles.left}>实际工作开展效果是否符合专项行动目标</td><td>111</td><td className={styles.left}>开展效果达到目标，得100分；开展效果未达到目标，得0分</td><td>1</td><td><span className={`${styles.greenDot} ${styles.redDot}`} /></td></tr>
                                    <tr><td colSpan="3">综合得分</td><td colSpan="5" className={styles.left}>1、得分≥80分，议题通过；2、80分&gt;得≥60，议题通过，但要提出管理意见或提示项；3、得分&lt;60分，不通过；4、合规性维度任意一项不通过，议题不通过</td><td>1</td><td /></tr>
                                </tbody>
                            </table>

                            <div className={styles.evalPreviewProofStack}>
                                <PreviewProof
                                    active={false}
                                    page="第1页"
                                    type="框选批注"
                                    fileName="20250428中联电子议题关键信息页(1)P1.jpg"
                                    note="关键净值与拆除费用表格区域，需要在评估前补充附件来源说明。"
                                    annotations={[
                                        { page: "第1页", type: "框选批注", note: "关键净值与拆除费用表格区域，需要在评估前补充附件来源说明。", author: "郑华峰 2025-06-21 19:05" },
                                        { page: "第1页", type: "文字选择", note: "确认“无法再使用”的判断依据是否需要补充现场照片或附表说明。", author: "吴文君 2025-06-21 19:08" },
                                    ]}
                                />
                                <PreviewProof
                                    active
                                    page="第2页"
                                    type="文字选择"
                                    fileName="董事会议案表决建议P2.jpg（含批注）"
                                    note="报告中对于关键净值、拆除费用与管理要求的表述需进一步核对原始附件。"
                                    summary
                                    annotations={[
                                        { page: "第2页", type: "文字选择", note: "报告中对于关键净值、拆除费用与管理要求的表述需进一步核对原始附件。", author: "吴文君 2025-06-21 19:08" },
                                        { page: "第2页", type: "文字选择", note: "建议在董事会审议前完成净值口径、处置价格依据及资产完备性说明的补充标注，并同步形成任务清单。", author: "系统预置 2026-05-15 18:06" },
                                        { page: "第2页", type: "历史批注", note: "上一版本建议将净值口径、处置价格依据和资产完备性说明拆分为三条附件来源。", author: "郑华峰 2026-05-15 18:20" },
                                    ]}
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </Drawer>
    );
}

function PreviewProof({ active, page, type, fileName, note, annotations = [], summary = false }) {
    return (
        <div className={styles.evalPreviewProofRow}>
            <article className={styles.evalPreviewProofImage}>
                <div className={styles.evalPreviewPdfSheet}>
                    <div className={styles.evalPreviewImageHead}>{fileName}</div>
                    <div className={styles.evalPreviewImageBox}>
                        <div className={styles.evalPreviewProofDoc}>
                            <div className={summary ? styles.evalPreviewProofSummaryTitle : styles.evalPreviewProofDocTitle}>
                                {summary ? "补充评估说明" : "一汽解放汽车有限公司发动机分公司31项报废设备购入及处置方案"}
                            </div>
                            <div className={styles.evalPreviewProofDocRule} />
                            <div className={styles.evalPreviewProofSection}>
                                <div className={styles.evalPreviewProofSectionTitle}>{summary ? "评估结论" : "项目背景"}</div>
                                {summary ? (
                                    <>
                                        <div className={styles.evalPreviewProofSummaryCopy}>本次评估以现场查验资料为基础，结合已关联附件内容对资产状态、处置方式及监管要求进行综合判断。<span className={styles.evalPreviewProofHighlight}>{note}</span></div>
                                        <div className={styles.evalPreviewProofSummaryCopy}><span className={styles.evalPreviewProofHighlight}>建议在董事会审议前完成净值口径、处置价格依据及资产完备性说明的补充标注，并同步形成任务清单，便于后续跟踪。</span></div>
                                    </>
                                ) : (
                                    <>
                                        <div className={styles.evalPreviewProofParagraph}>一汽解放汽车有限公司发动机分公司向我公司转让31项报废设备，主要为报废清洗机、磨床、车床、抛光机、连杆螺母拧紧机等资产，<span className={styles.evalPreviewProofHighlight}>全部资产均已拆除完毕，存放在解放卡车厂院内，根据现场实际情况判断，均已无法再使用。</span>评估公司按照材质类资产进行评估，主要为废钢、废旧电机两类。</div>
                                        <div className={styles.evalPreviewProofPanel}>
                                            <table className={styles.evalPreviewProofTable}>
                                                <thead><tr><th>项目编号</th><th>项目名称</th><th>账面原值</th><th>账面净值</th><th>评估净值<br />(含税，元)</th></tr></thead>
                                                <tbody><tr><td>JYB-2025-0123</td><td>一汽解放汽车有限公司发动机分公司31项报废设备</td><td>92,509,505.36</td><td>2,774,331.20</td><td>676,413.48</td></tr></tbody>
                                            </table>
                                            <div className={styles.evalPreviewProofRegion} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </article>
            <aside className={styles.evalPreviewProofSide}>
                <div className={styles.evalPreviewSideScroll}>
                    {(annotations.length ? annotations : [{ page, type, note, author: active ? "吴文君 2025-06-21 19:08" : "郑华峰 2025-06-21 19:05" }]).map((annotation, index) => (
                        <article className={`${styles.evalPreviewSideCard} ${active || index === 0 ? styles.active : ""}`} key={`${annotation.page}-${annotation.type}-${annotation.note}`}>
                            <div className={styles.evalPreviewSideTags}>
                                <div className={styles.evalPreviewSideTagGroup}>
                                    <span className={`${styles.evalPreviewSideTag} ${styles.pageTag}`}>{annotation.page}</span>
                                    <span className={`${styles.evalPreviewSideTag} ${styles.typeTag}`}>{annotation.type}</span>
                                </div>
                            </div>
                            <div className={styles.evalPreviewSideCopy}>{annotation.note}</div>
                            <div className={styles.evalPreviewSideMeta}>
                                <span>{annotation.author}</span>
                                <span className={styles.evalPreviewSideActions}><span className={styles.edit}>编辑</span><span className={styles.delete}>删除</span></span>
                            </div>
                        </article>
                    ))}
                </div>
            </aside>
        </div>
    );
}
