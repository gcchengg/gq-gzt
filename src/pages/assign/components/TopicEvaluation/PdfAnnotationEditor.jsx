import {
    ArrowLeftOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    SwapOutlined,
} from "@ant-design/icons";
import {
    Button,
    Checkbox,
    Drawer,
    Input,
    Modal,
    Radio,
    Select,
    Space,
    Tag,
    message,
} from "antd";
import { useMemo, useRef, useState } from "react";
import styles from "./index.module.css";

const pages = [
    { page: 1, title: "一汽解放汽车有限公司发动机分公司31项报废设备购入及处置方案", section: "项目背景", annotated: true },
    { page: 2, title: "补充评估说明", section: "评估结论", annotated: true },
    { page: 3, title: "补充说明（第3页）", section: "说明页", annotated: false },
    { page: 4, title: "补充说明（第4页）", section: "评估依据", annotated: true },
    { page: 5, title: "补充说明（第5页）", section: "说明页", annotated: false },
    { page: 6, title: "补充说明（第6页）", section: "说明页", annotated: false },
    { page: 7, title: "补充说明（第7页）", section: "异常说明", annotated: true },
    { page: 8, title: "补充说明（第8页）", section: "说明页", annotated: false },
    { page: 9, title: "补充说明（第9页）", section: "管理建议", annotated: true },
    { page: 10, title: "补充说明（第10页）", section: "说明页", annotated: false },
];

const seedAnnotations = [
    { id: "area-1", page: 1, type: "框选批注", rect: { left: 49, top: 51, width: 43, height: 20 }, content: "关键净值与拆除费用表格区域，需要在评估前补充附件来源说明。", author: "郑华峰 2025-06-21 19:05" },
    { id: "text-1", page: 1, type: "文字选择", textKey: "asset-status", content: "确认“无法再使用”的判断依据是否需要补充现场照片或附表说明。", author: "吴文君 2025-06-21 19:08" },
    { id: "discussion-1", page: 2, type: "文字选择", textKey: "asset-status", content: "建议在董事会审议前完成净值口径、处置价格依据及资产完备性说明的补充标注，并同步形成任务清单。", author: "系统预置 2026-05-15 18:06", discussion: [
        "吴文君：建议补充现场照片作为支撑，避免判断只停留在文字描述。",
        "创建人：已补充现场照片，并同步到汇报材料。",
        "郑华峰：建议把净值口径、处置价格依据和资产完备性说明拆成三条附件来源。",
    ] },
];

export default function PdfAnnotationEditor({ open, fileName, mode = "annotation", onClose }) {
    const [scope, setScope] = useState(mode === "associate" ? "existing" : "all");
    const [markMode, setMarkMode] = useState("area");
    const [currentPage, setCurrentPage] = useState(1);
    const [annotations, setAnnotations] = useState(seedAnnotations);
    const [linkedPages, setLinkedPages] = useState([1]);
    const [noteOpen, setNoteOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [note, setNote] = useState("");
    const [needReply, setNeedReply] = useState(false);
    const [compareOpen, setCompareOpen] = useState(false);
    const [replyingId, setReplyingId] = useState(null);
    const [reply, setReply] = useState("");
    const [creationArmed, setCreationArmed] = useState(false);
    const [draftTarget, setDraftTarget] = useState(null);
    const [drawingRect, setDrawingRect] = useState(null);
    const pageRef = useRef(null);
    const drawStartRef = useRef(null);

    const visiblePages = useMemo(() => pages.filter((page) => {
        if (scope === "existing") return page.annotated || annotations.some((item) => item.page === page.page);
        if (scope === "new") return !page.annotated && !annotations.some((item) => item.page === page.page);
        return true;
    }), [annotations, scope]);
    const activePage = visiblePages.find((page) => page.page === currentPage) || visiblePages[0] || pages[0];
    const activeAnnotations = annotations.filter((item) => item.page === activePage.page);

    const selectPage = (page) => setCurrentPage(page.page);
    const shiftPage = (offset) => {
        const index = visiblePages.findIndex((page) => page.page === activePage.page);
        selectPage(visiblePages[Math.min(Math.max(index + offset, 0), visiblePages.length - 1)]);
    };
    const openNote = (annotation = null, target = null) => {
        setEditing(annotation);
        setDraftTarget(target);
        setNote(annotation?.content || "");
        setNeedReply(Boolean(annotation?.needReply));
        setNoteOpen(true);
    };
    const saveNote = () => {
        if (!note.trim()) return;
        setAnnotations((current) => editing
            ? current.map((item) => item.id === editing.id ? { ...item, content: note, needReply } : item)
            : [{ id: `note-${Date.now()}`, page: activePage.page, type: draftTarget?.type === "area" ? "框选批注" : "文字选择", rect: draftTarget?.rect, textKey: draftTarget?.textKey, content: note, needReply, author: "系统预置 2026-05-13 10:20" }, ...current]);
        setNoteOpen(false);
        setDraftTarget(null);
        setCreationArmed(false);
        setDrawingRect(null);
        message.success(editing ? "批注已更新" : "批注已新增");
    };
    const armCreation = (nextMode = markMode) => {
        setMarkMode(nextMode);
        setCreationArmed(true);
        setDrawingRect(null);
        message.info(nextMode === "area" ? "请在文档页面拖拽框选区域" : "请点击文档中的高亮文字");
    };
    const pointInPage = (event) => {
        const bounds = pageRef.current?.getBoundingClientRect();
        if (!bounds) return null;
        return {
            x: Math.min(Math.max(event.clientX - bounds.left, 0), bounds.width),
            y: Math.min(Math.max(event.clientY - bounds.top, 0), bounds.height),
            width: bounds.width,
            height: bounds.height,
        };
    };
    const startArea = (event) => {
        if (mode === "associate" || !creationArmed || markMode !== "area") return;
        const point = pointInPage(event);
        if (!point) return;
        drawStartRef.current = point;
        setDrawingRect({ left: point.x, top: point.y, width: 0, height: 0 });
        event.currentTarget.setPointerCapture(event.pointerId);
    };
    const moveArea = (event) => {
        if (!drawStartRef.current) return;
        const point = pointInPage(event);
        if (!point) return;
        setDrawingRect({
            left: Math.min(drawStartRef.current.x, point.x),
            top: Math.min(drawStartRef.current.y, point.y),
            width: Math.abs(point.x - drawStartRef.current.x),
            height: Math.abs(point.y - drawStartRef.current.y),
        });
    };
    const finishArea = () => {
        if (!drawStartRef.current || !drawingRect) return;
        drawStartRef.current = null;
        const bounds = pageRef.current?.getBoundingClientRect();
        if (!bounds || drawingRect.width < 12 || drawingRect.height < 12) {
            setDrawingRect(null);
            return;
        }
        openNote(null, {
            type: "area",
            rect: {
                left: drawingRect.left / bounds.width * 100,
                top: drawingRect.top / bounds.height * 100,
                width: drawingRect.width / bounds.width * 100,
                height: drawingRect.height / bounds.height * 100,
            },
        });
    };
    const selectTextTarget = (event, textKey) => {
        event.stopPropagation();
        if (mode === "associate" || !creationArmed || markMode !== "text") return;
        openNote(null, { type: "text", textKey });
    };
    const sendReply = (id) => {
        if (!reply.trim()) return;
        setAnnotations((current) => current.map((item) => item.id === id
            ? { ...item, discussion: [...(item.discussion || []), `创建人：${reply}`] }
            : item));
        setReply("");
        setReplyingId(null);
    };

    return (
        <>
            <Drawer
                title={<Space><ArrowLeftOutlined />编辑PDF · {fileName}</Space>}
                open={open}
                width="100%"
                onClose={onClose}
                destroyOnHidden
                className={styles.pdfDrawer}
            >
                <div className={styles.pdfToolbar}>
                    <strong>{mode === "associate" ? "关联类别：" : "标注模式："}</strong>
                    {mode === "associate" ? (
                        <Space>
                            <Button type={scope === "all" ? "primary" : "default"} onClick={() => setScope("all")}>全部页面</Button>
                            <Button type={scope === "existing" ? "primary" : "default"} onClick={() => setScope("existing")}>已有批注</Button>
                            <Button type={scope === "new" ? "primary" : "default"} onClick={() => setScope("new")}>未加批注</Button>
                        </Space>
                    ) : (
                        <Space>
                            <Button type={markMode === "area" && creationArmed ? "primary" : "default"} onClick={() => armCreation("area")}>区域标记</Button>
                            <Button type={markMode === "text" && creationArmed ? "primary" : "default"} onClick={() => armCreation("text")}>文字选择</Button>
                        </Space>
                    )}
                    {mode === "associate" ? (
                        <Checkbox
                            checked={linkedPages.includes(activePage.page)}
                            onChange={(event) => setLinkedPages((current) => event.target.checked
                                ? [...new Set([...current, activePage.page])]
                                : current.filter((page) => page !== activePage.page))}
                        >
                            关联此页
                        </Checkbox>
                    ) : <span className={styles.toolbarHint}>{creationArmed ? (markMode === "area" ? "请在文档页拖动鼠标绘制矩形区域" : "请点击正文中的可选文字") : "请选择标注模式开始批注"}</span>}
                </div>

                <div className={styles.pdfLayout}>
                    <main className={styles.pdfMain}>
                        <div
                            ref={pageRef}
                            className={`${styles.pdfPage} ${creationArmed ? styles.isAnnotating : ""} ${markMode === "area" ? styles.areaMode : styles.textMode}`}
                            onPointerDown={startArea}
                            onPointerMove={moveArea}
                            onPointerUp={finishArea}
                        >
                            <h2>{activePage.title}</h2>
                            <div className={styles.docRule} />
                            <h3>{activePage.section}</h3>
                            <p>
                                一汽解放汽车有限公司发动机分公司向我公司转让31项报废设备，主要为报废清洗机、磨床、车床、抛光机等资产。
                                <mark
                                    className={`${styles.selectableText} ${activeAnnotations.some((item) => item.textKey === "asset-status") ? styles.hasAnnotation : ""}`}
                                    onClick={(event) => selectTextTarget(event, "asset-status")}
                                >
                                    全部资产均已拆除完毕，存放在解放卡车厂院内，根据现场实际情况判断，均已无法再使用。
                                </mark>
                                评估公司按照材质类资产进行评估，主要为废钢、废旧电机两类。
                            </p>
                            <table className={styles.docTable}>
                                <thead><tr><th>项目编号</th><th>账面原值</th><th>账面净值</th><th>评估净值</th></tr></thead>
                                <tbody><tr><td>JYB-2025-0123</td><td>92,509,505.36</td><td>2,774,331.20</td><td>676,413.48</td></tr></tbody>
                            </table>
                            <p>
                                <span
                                    className={`${styles.selectableText} ${activeAnnotations.some((item) => item.textKey === "pricing-rule") ? styles.hasAnnotation : ""}`}
                                    onClick={(event) => selectTextTarget(event, "pricing-rule")}
                                >
                                    建议在董事会审议前完成净值口径、处置价格依据及资产完备性说明的补充标注。
                                </span>
                            </p>
                            {activeAnnotations.filter((item) => item.rect).map((item) => (
                                <button
                                    type="button"
                                    aria-label={`查看批注 ${item.content}`}
                                    className={styles.savedAnnotationBox}
                                    style={{ left: `${item.rect.left}%`, top: `${item.rect.top}%`, width: `${item.rect.width}%`, height: `${item.rect.height}%` }}
                                    onPointerDown={(event) => event.stopPropagation()}
                                    onClick={() => openNote(item)}
                                    key={item.id}
                                />
                            ))}
                            {drawingRect ? <div className={styles.drawingAnnotationBox} style={drawingRect} /> : null}
                        </div>
                        <div className={styles.pager}>
                            <Button disabled={activePage.page === visiblePages[0]?.page} onClick={() => shiftPage(-1)}>上一页</Button>
                            <Select value={activePage.page} options={visiblePages.map((page) => ({ value: page.page, label: `第 ${page.page} 页` }))} onChange={(page) => setCurrentPage(page)} />
                            <span>/ {visiblePages.length} 页</span>
                            <Button disabled={activePage.page === visiblePages.at(-1)?.page} onClick={() => shiftPage(1)}>下一页</Button>
                        </div>
                        <div className={styles.referenceDock}>
                            <Space wrap>
                                <Select placeholder="请选择议案" style={{ width: 230 }} options={[{ value: "设备购入及处置方案", label: "设备购入及处置方案" }, { value: "董事会会议案及表决建议", label: "董事会会议案及表决建议" }]} />
                                <Button onClick={() => setCompareOpen(true)} icon={<SwapOutlined />}>文件对比</Button>
                                <Button>参股公司信息</Button><Button>一企一策</Button><Button>战略规划</Button><Button>财务报表</Button>
                            </Space>
                        </div>
                    </main>
                    <aside className={styles.annotationSide}>
                        <div className={styles.sectionHead}>
                            <h3>{mode === "associate" ? "关联项列表" : "批注列表"}</h3>
                            {mode !== "associate" ? <Button type="primary" icon={<PlusOutlined />} onClick={() => armCreation(markMode)}>新增</Button> : null}
                        </div>
                        <div className={styles.annotationList}>
                            {activeAnnotations.map((item) => (
                                <article className={styles.annotationCard} key={item.id}>
                                    <Space wrap><Tag color="blue">第{item.page}页</Tag><Tag color="purple">{item.type}</Tag>{item.needReply ? <Tag color="orange">需协同回复</Tag> : null}</Space>
                                    <p>{item.content}</p>
                                    {(item.discussion || []).map((text) => <div className={styles.discussion} key={text}>{text}</div>)}
                                    {replyingId === item.id ? (
                                        <Space.Compact block>
                                            <Input value={reply} onChange={(event) => setReply(event.target.value)} placeholder="请输入建议或回复内容" />
                                            <Button type="primary" onClick={() => sendReply(item.id)}>发送</Button>
                                        </Space.Compact>
                                    ) : null}
                                    <div className={styles.annotationFoot}>
                                        <span>{item.author}</span>
                                        <Space size={2}>
                                            <Button type="link" onClick={() => setReplyingId(item.id)}>回复</Button>
                                            <Button type="link" icon={<EditOutlined />} onClick={() => openNote(item)}>编辑</Button>
                                            <Button danger type="link" icon={<DeleteOutlined />} onClick={() => setAnnotations((current) => current.filter((annotation) => annotation.id !== item.id))}>删除</Button>
                                        </Space>
                                    </div>
                                </article>
                            ))}
                            {!activeAnnotations.length ? <div className={styles.emptyAnnotations}>本页暂无批注</div> : null}
                        </div>
                    </aside>
                </div>
            </Drawer>
            <Modal title={editing ? "编辑批注" : "填写说明"} open={noteOpen} onCancel={() => { setNoteOpen(false); setDraftTarget(null); setDrawingRect(null); }} onOk={saveNote}>
                <Input.TextArea value={note} onChange={(event) => setNote(event.target.value)} placeholder="请输入批注说明" autoSize={{ minRows: 4, maxRows: 8 }} />
                <Radio.Group className={styles.needReply} value={needReply} onChange={(event) => setNeedReply(event.target.value)}>
                    <Radio value={true}>需要提报人回复</Radio><Radio value={false}>无需回复</Radio>
                </Radio.Group>
            </Modal>
            <Drawer title="文件对比" open={compareOpen} width="96%" onClose={() => setCompareOpen(false)} destroyOnHidden>
                <div className={styles.compareGrid}>
                    {[fileName, "20260403(股权运营部)T3出行第二届董事会2026年第一次会议、2026年第三次临时股东会议案及表决建议.pdf"].map((name, index) => (
                        <section className={styles.comparePanel} key={name}>
                            <h3>{name}</h3>
                            <div className={styles.pdfPage}><h2>{index ? "董事会会议案及表决建议" : pages[0].title}</h2><div className={styles.docRule} /><p>本区域展示对比文档中的关键批注段落，供评估员上下参照阅读。</p></div>
                        </section>
                    ))}
                </div>
            </Drawer>
        </>
    );
}
