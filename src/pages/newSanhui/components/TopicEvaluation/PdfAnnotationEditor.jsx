import { PlusOutlined, QuestionCircleOutlined, StarFilled, StarOutlined } from "@ant-design/icons";
import {
    Button,
    Input,
    Modal,
    Pagination,
    Radio,
    Space,
    Tooltip,
    message,
} from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./PdfAnnotationEditor.css";

const pages = [
    { page: 1, title: "一汽解放汽车有限公司发动机分公司31项报废设备购入及处置方案", section: "项目背景", annotated: true, variant: "asset" },
    { page: 2, title: "补充评估说明", section: "评估结论", annotated: true, variant: "conclusion" },
    { page: 3, title: "补充说明（第3页）", section: "说明页", annotated: false, variant: "normal" },
    { page: 4, title: "补充说明（第4页）", section: "评估依据", annotated: true, variant: "basis" },
    { page: 5, title: "补充说明（第5页）", section: "说明页", annotated: false, variant: "normal" },
    { page: 6, title: "补充说明（第6页）", section: "说明页", annotated: false, variant: "normal" },
    { page: 7, title: "补充说明（第7页）", section: "异常说明", annotated: true, variant: "risk" },
    { page: 8, title: "补充说明（第8页）", section: "说明页", annotated: false, variant: "normal" },
    { page: 9, title: "补充说明（第9页）", section: "管理建议", annotated: true, variant: "suggestion" },
    { page: 10, title: "补充说明（第10页）", section: "说明页", annotated: false, variant: "normal" },
];

const pdfFiles = [
    "20250428中联电子议题关键信息页(1).pdf",
    "20260403(股权运营部)T3出行第二届董事会2026年第一次会议、2026年第三次临时股东会议案及表决建议.pdf",
    "1.招标文件-备注版-明阳智能AI在多业务域应用试点项目-20250606.docx",
];

const seedAnnotations = [
    { id: "area-1", page: 1, type: "框选批注", rect: { left: 49, top: 51, width: 43, height: 20 }, content: "关键净值与拆除费用表格区域，需要在评估前补充附件来源说明。", author: "郑华峰 2025-06-21 19:05", favorite: true },
    { id: "text-1", page: 1, type: "文字选择", textKey: "asset-status", content: "确认“无法再使用”的判断依据是否需要补充现场照片或附表说明。", author: "吴文君 2025-06-21 19:08" },
    { id: "discussion-1", page: 2, type: "文字选择", textKey: "asset-status", content: "建议在董事会审议前完成净值口径、处置价格依据及资产完备性说明的补充标注，并同步形成任务清单。", author: "系统预置 2026-05-15 18:06", discussion: [
        "吴文君：建议补充现场照片作为支撑，避免判断只停留在文字描述。",
        "创建人：已补充现场照片，并同步到汇报材料。",
        "郑华峰：建议把净值口径、处置价格依据和资产完备性说明拆成三条附件来源。",
    ] },
];

const screenshotStorageKey = "newSanhui.annotationScreenshotPages";
const defaultScreenshotPages = {
    [pdfFiles[0]]: [1, 2],
    [pdfFiles[1]]: [2, 5],
};

function readScreenshotPages() {
    if (typeof window === "undefined") return defaultScreenshotPages;
    try {
        return JSON.parse(window.localStorage.getItem(screenshotStorageKey)) || defaultScreenshotPages;
    } catch {
        return defaultScreenshotPages;
    }
}

function writeScreenshotPages(value) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(screenshotStorageKey, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("newSanhui:annotationScreenshotPagesChange", { detail: value }));
}

export default function PdfAnnotationEditor({ open, fileName, mode = "annotation", showNeedReply = true, onClose }) {
    const [activeFile, setActiveFile] = useState(fileName || pdfFiles[0]);
    const [compareFiles, setCompareFiles] = useState([fileName || pdfFiles[0], pdfFiles[1]]);
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
    const [contextOpen, setContextOpen] = useState(false);
    const [replyingId, setReplyingId] = useState(null);
    const [reply, setReply] = useState("");
    const [creationArmed, setCreationArmed] = useState(false);
    const [draftTarget, setDraftTarget] = useState(null);
    const [drawingRect, setDrawingRect] = useState(null);
    const [screenshotPages, setScreenshotPages] = useState(() => readScreenshotPages());
    const [annotationPage, setAnnotationPage] = useState(1);
    const [annotationFavoriteOnly, setAnnotationFavoriteOnly] = useState(false);
    const pageRef = useRef(null);
    const drawStartRef = useRef(null);

    const visiblePages = useMemo(() => pages.filter((page) => {
        if (scope === "existing") return page.annotated || annotations.some((item) => item.page === page.page);
        if (scope === "new") return !page.annotated && !annotations.some((item) => item.page === page.page);
        return true;
    }), [annotations, scope]);
    const activePage = visiblePages.find((page) => page.page === currentPage) || visiblePages[0] || pages[0];
    const activeAnnotations = annotations.filter((item) => item.page === activePage.page);
    const filteredAnnotations = annotationFavoriteOnly ? activeAnnotations.filter((item) => item.favorite) : activeAnnotations;
    const pagedAnnotations = filteredAnnotations.slice((annotationPage - 1) * 5, annotationPage * 5);
    const isAnnotationScreenshotPage = screenshotPages[activeFile]?.includes(activePage.page);

    useEffect(() => {
        const maxPage = Math.max(Math.ceil(filteredAnnotations.length / 5), 1);
        if (annotationPage > maxPage) {
            setAnnotationPage(maxPage);
        }
    }, [annotationPage, filteredAnnotations.length]);

    const selectPage = (page) => {
        setCurrentPage(page.page);
        setAnnotationPage(1);
    };
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
    const toggleAnnotationFavorite = (id) => {
        setAnnotations((current) => current.map((item) => item.id === id ? { ...item, favorite: !item.favorite } : item));
    };
    const toggleAnnotationScreenshotPage = (checked) => {
        setScreenshotPages((current) => {
            const filePages = current[activeFile] || [];
            const nextPages = checked
                ? [...new Set([...filePages, activePage.page])]
                : filePages.filter((page) => page !== activePage.page);
            const next = { ...current, [activeFile]: nextPages };
            writeScreenshotPages(next);
            return next;
        });
        message.success(checked ? "已标记为汇报材料页收藏" : "已取消汇报材料页收藏标记");
    };
    const renderCompareTasks = (side) => {
        const list = side === "left"
            ? [
                { page: 1, type: "框选批注", content: "关键净值与拆除费用表格区域，需要在评估前补充附件来源说明。", author: "郑华峰 2025-06-21 19:05", active: true },
                { page: 1, type: "文字选择", content: "确认“无法再使用”的判断依据是否需要补充现场照片或附表说明。", author: "吴文君 2025-06-21 19:08" },
            ]
            : [
                { page: 2, type: "文字选择", content: "报告中对于关键净值、拆除费用与管理要求的表述需进一步核对原始附件。", author: "吴文君 2025-06-21 19:08", active: true },
                { page: 2, type: "历史批注", content: "上一版本建议将净值口径、处置价格依据和资产完备性说明拆分为三条附件来源。", author: "系统预置 2026-05-15 18:06" },
            ];
        return list.map((item) => (
            <article className={`pdf-task-card ${item.active ? "active" : ""}`} key={`${side}-${item.page}-${item.content}`}>
                <div className="pdf-task-top">
                    <div className="pdf-task-tags">
                        <span className="pdf-tag pdf-tag-page">第{item.page}页</span>
                        <span className="pdf-tag pdf-tag-type">{item.type}</span>
                    </div>
                </div>
                <div className="pdf-task-main">{item.content}</div>
                <div className="pdf-task-foot">
                    <div className="pdf-task-meta">{item.author}</div>
                    <div className="pdf-task-actions">
                        <span>编辑</span>
                        <span className="danger">删除</span>
                    </div>
                </div>
            </article>
        ));
    };
    const renderPageContent = () => {
        if (activePage.variant === "asset") {
            return (
                <>
                    <p className="pdf-paragraph">
                        一汽解放汽车有限公司发动机分公司向我公司转让31项报废设备，主要为报废清洗机、磨床、车床、抛光机、连杆螺母拧紧机等资产，
                        <span
                            className={`pdf-selectable ${activeAnnotations.some((item) => item.textKey === "asset-status") ? "annotated" : ""}`}
                            onClick={(event) => selectTextTarget(event, "asset-status")}
                        >
                            全部资产均已拆除完毕，存放在解放卡车厂院内，根据现场实际情况判断，均已无法再使用。
                        </span>
                        评估公司按照材质类资产进行评估，主要为废钢、废旧电机两类。现状及评估情况如下：
                    </p>
                    <table className="pdf-table">
                        <thead>
                            <tr>
                                <th>项目编号</th>
                                <th>项目名称</th>
                                <th>账面原值</th>
                                <th>账面净值</th>
                                <th>评估净值<br />(不含税、不含拆除费、元)</th>
                                <th>评估拆除费<br />(不含税、元)</th>
                                <th>评估净值<br />(含税、元)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>JYB-2025-0123</td>
                                <td>一汽解放汽车有限公司发动机分公司31项报废设备</td>
                                <td>92,509,505.36</td>
                                <td>2,774,331.20</td>
                                <td>598,596.00</td>
                                <td>0.00</td>
                                <td>676,413.48</td>
                            </tr>
                        </tbody>
                    </table>
                    <h3 className="pdf-section-title">资产购入</h3>
                    <p className="pdf-paragraph">建议一汽解放汽车有限公司发动机分公司31项报废设备按照评估单价购入，其中废钢1900.00元/吨（含税）、废旧电机5000.00元/吨（含税），最终根据各材质实际交付数量进行结算。</p>
                    <h3 className="pdf-section-title">资产处置</h3>
                    <p className="pdf-paragraph">
                        根据资产现状，结合市场行情，建议该批资产整包处置，其中废钢处置单价不低于
                        <span
                            className={`pdf-selectable ${activeAnnotations.some((item) => item.textKey === "pricing-rule") ? "annotated" : ""}`}
                            onClick={(event) => selectTextTarget(event, "pricing-rule")}
                        >
                            2,290.51元/吨（含税）、废旧电机处置单价不低于7,684.00元/吨（含税）
                        </span>
                        ，在汽购平台公开竞价处置。
                    </p>
                </>
            );
        }

        if (activePage.variant === "conclusion") {
            return (
                <>
                    <p className="pdf-paragraph">
                        本次评估以现场查验资料为基础，结合已关联附件内容对资产状态、处置方式及监管要求进行综合判断。
                        <span
                            className={`pdf-selectable ${activeAnnotations.some((item) => item.textKey === "asset-status") ? "annotated" : ""}`}
                            onClick={(event) => selectTextTarget(event, "asset-status")}
                        >
                            报告中对于关键净值、拆除费用与管理要求的表述需进一步核对原始附件。
                        </span>
                    </p>
                    <p className="pdf-paragraph">
                        <span
                            className="pdf-selectable annotated"
                            onClick={(event) => selectTextTarget(event, "discussion-1")}
                        >
                            建议在董事会审议前完成净值口径、处置价格依据及资产完备性说明的补充标注，并同步形成任务清单，便于后续跟踪。
                        </span>
                    </p>
                </>
            );
        }

        const contentMap = {
            basis: "本页包含与资产定价依据相关的补充说明，可用于关联批注演示。",
            risk: "本页标注资产净值与拆除费用之间的异常说明，便于关联到评分维度。",
            suggestion: "本页标注管理建议相关段落，便于在综合意见环节快速引用。",
            normal: "本页为正文延续内容，用于展示完整 PDF 在评估执行场景下的分页浏览效果。",
        };
        return (
            <p className="pdf-paragraph">
                <span className={activePage.annotated ? "pdf-selectable annotated" : "pdf-selectable"}>
                    {contentMap[activePage.variant] || contentMap.normal}
                </span>
            </p>
        );
    };

    if (!open) {
        return null;
    }

    const editor = (
        <>
            <section className={`pdf-editor-overlay open ${mode === "associate" ? "annotation-context" : "toolbar-visible"}`} aria-hidden={!open}>
                <div className="pdf-editor-head">
                    <button className="pdf-editor-back" type="button" aria-label="返回" onClick={onClose} />
                    <div className="pdf-editor-title">编辑PDF</div>
                    <select className="pdf-file-switch" value={activeFile} onChange={(event) => setActiveFile(event.target.value)}>
                        {pdfFiles.filter((item) => item.endsWith(".pdf")).map((item) => <option value={item} key={item}>{item}</option>)}
                    </select>
                </div>

                <div className="pdf-toolbar">
                    <span className="pdf-toolbar-label">{mode === "associate" ? "关联类别：" : "标注模式："}</span>
                    {mode === "associate" ? (
                        <>
                            <button className={`pdf-mode-btn annotation-only ${scope === "all" ? "active" : ""}`} type="button" onClick={() => setScope("all")}>全部页面</button>
                            <button className={`pdf-mode-btn annotation-only ${scope === "existing" ? "active" : ""}`} type="button" onClick={() => setScope("existing")}>已有批注</button>
                            <button className={`pdf-mode-btn annotation-only ${scope === "new" ? "active" : ""}`} type="button" onClick={() => setScope("new")}>未加批注</button>
                        </>
                    ) : (
                        <div className="pdf-toolbar-switch">
                            <button className={`pdf-mode-btn attach-only ${markMode === "area" && creationArmed ? "active" : ""}`} type="button" onClick={() => armCreation("area")}>区域标记</button>
                            <button className={`pdf-mode-btn attach-only ${markMode === "text" && creationArmed ? "active" : ""}`} type="button" onClick={() => armCreation("text")}>文字选择</button>
                        </div>
                    )}
                    {mode === "associate" ? (
                        <label className="pdf-page-link-toggle">
                            <input
                                type="checkbox"
                                checked={linkedPages.includes(activePage.page)}
                                onChange={(event) => setLinkedPages((current) => event.target.checked
                                    ? [...new Set([...current, activePage.page])]
                                    : current.filter((page) => page !== activePage.page))}
                            />
                            关联此页
                        </label>
                    ) : <span className="pdf-toolbar-hint">{creationArmed ? (markMode === "area" ? "拖动鼠标绘制矩形区域" : "点击正文高亮文本后填写说明") : "请选择标注模式开始批注"}</span>}
                    {creationArmed && mode !== "associate" ? <button className="pdf-toolbar-cancel" type="button" onClick={() => { setCreationArmed(false); setDrawingRect(null); }}>取消</button> : null}
                </div>

                <div className="pdf-editor-body">
                    <main className="pdf-main">
                        <div className="pdf-scroll">
                            <div
                                ref={pageRef}
                                className={`pdf-page active ${creationArmed ? "is-annotating" : ""} ${markMode === "area" ? "area-mode" : "text-mode"}`}
                                onPointerDown={startArea}
                                onPointerMove={moveArea}
                                onPointerUp={finishArea}
                            >
                                <h2 className="pdf-page-title">{activePage.title}</h2>
                                <div className="pdf-page-rule" />
                                <h3 className="pdf-section-title">{activePage.section}</h3>
                                {renderPageContent()}
                                {activeAnnotations.filter((item) => item.rect).map((item) => (
                                    <button
                                        type="button"
                                        aria-label={`查看批注 ${item.content}`}
                                        className="pdf-annotation-box"
                                        style={{ left: `${item.rect.left}%`, top: `${item.rect.top}%`, width: `${item.rect.width}%`, height: `${item.rect.height}%` }}
                                        onPointerDown={(event) => event.stopPropagation()}
                                        onClick={() => openNote(item)}
                                        key={item.id}
                                    />
                                ))}
                                {drawingRect ? <div className="pdf-drawing-box" style={drawingRect} /> : null}
                            </div>
                        </div>

                        <div className="pdf-page-jump">
                            <button className="pdf-page-context-btn" type="button" onClick={() => setContextOpen(true)}>参考信息</button>
                            <button className="pdf-page-nav-btn" type="button" disabled={activePage.page === visiblePages[0]?.page} onClick={() => shiftPage(-1)}>上一页</button>
                            <div className="pdf-page-stepper">
                                <button className="pdf-page-step-btn" type="button" disabled={activePage.page === visiblePages[0]?.page} onClick={() => shiftPage(-1)}>-</button>
                                <input className="pdf-page-input" value={activePage.page} onChange={(event) => {
                                    const page = Number(event.target.value.replace(/\D/g, "")) || 1;
                                    const matchedPage = visiblePages.find((item) => item.page === page);
                                    if (matchedPage) setCurrentPage(page);
                                }} />
                                <span className="pdf-page-total">/ {visiblePages.length}</span>
                                <button className="pdf-page-step-btn" type="button" disabled={activePage.page === visiblePages.at(-1)?.page} onClick={() => shiftPage(1)}>+</button>
                            </div>
                            <button className="pdf-page-nav-btn" type="button" disabled={activePage.page === visiblePages.at(-1)?.page} onClick={() => shiftPage(1)}>下一页</button>
                            {mode !== "associate" ? (
                                <div className="pdf-page-screenshot-action">
                                    <button
                                      className={`pdf-page-screenshot-btn ${isAnnotationScreenshotPage ? "active" : ""}`}
                                      type="button"
                                      aria-pressed={isAnnotationScreenshotPage}
                                      onClick={() => toggleAnnotationScreenshotPage(!isAnnotationScreenshotPage)}
                                    >
                                      {isAnnotationScreenshotPage ? <StarFilled /> : <StarOutlined />}
                                      {isAnnotationScreenshotPage ? "已收藏为汇报材料页" : "收藏为汇报材料页"}
                                    </button>
                                    <Tooltip
                                      title="如果批注列表发生变化，需要重新收藏截图，确保汇报材料页同步最新批注。"
                                      placement="top"
                                      zIndex={10090}
                                      getPopupContainer={() => document.body}
                                    >
                                      <span className="pdf-page-screenshot-tip" tabIndex={0} aria-label="汇报材料页收藏提示">
                                        <QuestionCircleOutlined />
                                      </span>
                                    </Tooltip>
                                </div>
                            ) : null}
                        </div>

                    </main>
                    <aside className="pdf-side">
                        <div className="pdf-side-head">
                            <div className="pdf-side-title">{mode === "associate" ? "关联项列表" : "批注列表"}</div>
                            <div className="pdf-side-actions">
                                {mode !== "associate" ? (
                                    <div className="pdf-annotation-filter" aria-label="批注收藏过滤">
                                        <button
                                            className={!annotationFavoriteOnly ? "active" : ""}
                                            type="button"
                                            onClick={() => {
                                                setAnnotationFavoriteOnly(false);
                                                setAnnotationPage(1);
                                            }}
                                        >
                                            全部
                                        </button>
                                        <button
                                            className={annotationFavoriteOnly ? "active" : ""}
                                            type="button"
                                            onClick={() => {
                                                setAnnotationFavoriteOnly(true);
                                                setAnnotationPage(1);
                                            }}
                                        >
                                            <StarFilled />
                                            已收藏
                                        </button>
                                    </div>
                                ) : null}
                                {mode !== "associate" ? <Button type="primary" icon={<PlusOutlined />} onClick={() => armCreation(markMode)}>新增</Button> : null}
                            </div>
                        </div>
                        <div className="pdf-task-scroll">
                          <div className="pdf-task-list">
                            {pagedAnnotations.map((item, index) => (
                                <article className={`pdf-task-card ${index === 0 ? "active" : ""}`} key={item.id}>
                                    <div className="pdf-task-top">
                                        <div className="pdf-task-tags">
                                            <span className="pdf-tag pdf-tag-page">第{item.page}页</span>
                                            <span className="pdf-tag pdf-tag-type">{item.type}</span>
                                            {item.needReply ? <span className="pdf-tag pdf-tag-thread">需协同回复</span> : null}
                                        </div>
                                        <button
                                            className={`pdf-task-favorite ${item.favorite ? "active" : ""}`}
                                            type="button"
                                            aria-label={item.favorite ? "取消收藏批注" : "收藏批注"}
                                            aria-pressed={Boolean(item.favorite)}
                                            onClick={() => toggleAnnotationFavorite(item.id)}
                                        >
                                            {item.favorite ? <StarFilled /> : <StarOutlined />}
                                        </button>
                                    </div>
                                    <div className="pdf-task-main">{item.content}</div>
                                    {(item.discussion || []).length ? (
                                        <div className="pdf-task-discussion">
                                            <div className="pdf-discussion-summary">
                                                <span>共 {item.discussion.length} 轮讨论</span>
                                                <button type="button">展开更早讨论</button>
                                            </div>
                                            <div className="pdf-discussion-latest">
                                                {(item.discussion || []).map((text) => (
                                                    <div className="pdf-discussion-message suggestion" key={text}>
                                                        <div className="pdf-discussion-head">评估人员 · 建议</div>
                                                        <div className="pdf-discussion-body">{text}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}
                                    {replyingId === item.id ? (
                                        <Space.Compact block className="pdf-discussion-composer active">
                                            <Input value={reply} onChange={(event) => setReply(event.target.value)} placeholder="请输入建议或回复内容" />
                                            <Button type="primary" onClick={() => sendReply(item.id)}>发送</Button>
                                        </Space.Compact>
                                    ) : null}
                                    <div className="pdf-task-foot">
                                        <div className="pdf-task-meta">{item.author}</div>
                                        <div className="pdf-task-actions">
                                            <button type="button" onClick={() => setReplyingId(item.id)}>回复</button>
                                            <button type="button" onClick={() => openNote(item)}>编辑</button>
                                            <button className="danger" type="button" onClick={() => setAnnotations((current) => current.filter((annotation) => annotation.id !== item.id))}>删除</button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                            {!filteredAnnotations.length ? <div className="pdf-empty-annotations">{annotationFavoriteOnly ? "本页暂无收藏批注" : "本页暂无批注"}</div> : null}
                          </div>
                          {filteredAnnotations.length > 5 ? (
                            <Pagination
                                className="pdf-task-pagination"
                                size="small"
                                current={annotationPage}
                                pageSize={5}
                                total={filteredAnnotations.length}
                                onChange={setAnnotationPage}
                            />
                          ) : null}
                        </div>
                    </aside>
                </div>
                <div className={`pdf-compare-overlay ${compareOpen ? "open" : ""}`} aria-hidden={!compareOpen}>
                    <button className="pdf-compare-mask" type="button" aria-label="关闭文件对比" onClick={() => setCompareOpen(false)} />
                    <div className="pdf-compare-drawer">
                        <button className="pdf-compare-close" type="button" aria-label="关闭对比抽屉" onClick={() => setCompareOpen(false)} />
                        <div className="pdf-compare-drawer-head">
                            <div className="pdf-compare-drawer-title">文件对比</div>
                            <div className="pdf-compare-drawer-subtitle">对比文件内容与批注历史</div>
                        </div>
                        <div className="pdf-compare-drawer-body">
                            {compareFiles.map((name, index) => (
                                <section className="pdf-compare-panel" key={name}>
                                    <div className="pdf-compare-doc">
                                        <div className="pdf-compare-doc-head">
                                            <div className="pdf-compare-doc-meta">
                                                <div className="pdf-compare-doc-title">{name}</div>
                                            </div>
                                        </div>
                                        <div className="pdf-compare-page">
                                            <div className="pdf-page-title">{index ? "董事会会议案及表决建议" : pages[0].title}</div>
                                            <div className="pdf-page-rule" />
                                            {index ? (
                                                <>
                                                    <p className="pdf-paragraph">建议在董事会审议前完成净值口径、处置价格依据及资产完备性说明的补充标注，并同步形成任务清单。</p>
                                                    <p className="pdf-paragraph">本页展示对比文档中的关键批注段落，供评估员上下参照阅读。</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="pdf-paragraph">全部资产均已拆除完毕，存放在解放卡车厂院内，根据现场实际情况判断，均已无法再使用。评估前需补充附件来源说明。</p>
                                                    <table className="pdf-table">
                                                        <thead><tr><th>项目编号</th><th>账面净值</th><th>评估净值</th></tr></thead>
                                                        <tbody><tr><td>JYB-2025-0123</td><td>2,774,331.20</td><td>598,596.00</td></tr></tbody>
                                                    </table>
                                                </>
                                            )}
                                        </div>
                                        <div className="pdf-compare-pager">
                                            <button className="pdf-page-nav-btn" type="button">上一页</button>
                                            <div className="pdf-page-stepper">
                                                <button className="pdf-page-step-btn" type="button">-</button>
                                                <input className="pdf-page-input" type="text" value={index ? 2 : 1} readOnly inputMode="numeric" />
                                                <span className="pdf-page-total">/ 10</span>
                                                <button className="pdf-page-step-btn" type="button">+</button>
                                            </div>
                                            <button className="pdf-page-nav-btn" type="button">下一页</button>
                                        </div>
                                    </div>
                                    <div className="pdf-compare-side">
                                        <div className="pdf-compare-side-title">批注列表</div>
                                        <div className="pdf-compare-task-scroll">
                                            <div className="pdf-compare-task-list">{renderCompareTasks(index ? "right" : "left")}</div>
                                        </div>
                                    </div>
                                </section>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            <Modal
                title={editing ? "编辑批注" : "填写说明"}
                open={noteOpen}
                zIndex={10070}
                cancelText="取消"
                okText="确认"
                onCancel={() => { setNoteOpen(false); setDraftTarget(null); setDrawingRect(null); }}
                onOk={saveNote}
            >
                <Input.TextArea value={note} onChange={(event) => setNote(event.target.value)} placeholder="请输入批注说明" autoSize={{ minRows: 4, maxRows: 8 }} />
                {showNeedReply && !editing ? (<div className="pdf-note-reply-field">
                    <span>是否需要提报人回复：</span>
                    <Radio.Group value={needReply} onChange={(event) => setNeedReply(event.target.value)}>
                        <Radio value={true}>是</Radio>
                        <Radio value={false}>否</Radio>
                    </Radio.Group>
                </div>) : null}
            </Modal>
            <Modal
                title="参考信息"
                open={contextOpen}
                width={980}
                zIndex={10060}
                footer={null}
                onCancel={() => setContextOpen(false)}
                className="pdf-context-modal"
            >
                <div className={`pdf-context-modal-content ${mode === "associate" ? "annotation-mode" : ""}`}>
                    {mode === "associate" ? (
                        <div className="pdf-bottom-info-row">
                            <div className="pdf-bottom-info"><div className="pdf-bottom-info-label">评价要素</div><div className="pdf-bottom-info-value">外部管理规定</div></div>
                            <div className="pdf-bottom-info"><div className="pdf-bottom-info-label">参股公司信息</div><div className="pdf-bottom-info-value">长春富维集团汽车零部件股份有限公司</div></div>
                            <div className="pdf-bottom-info"><div className="pdf-bottom-info-label">议案名称</div><div className="pdf-bottom-info-value">2026年第三次临时股东会议案及表决建议</div></div>
                        </div>
                    ) : null}
                    <div className="pdf-bottom-select-row">
                        <div className="pdf-bottom-field"><label>议题大类</label><select><option>1. 经营类</option><option>2. 投资类</option></select></div>
                        <div className="pdf-bottom-field"><label>议题中类</label><select><option>1.3 定期监管报告</option><option>1.4 经营分析</option></select></div>
                        <div className="pdf-bottom-field"><label>议题小类</label><select><option>1.3.1 按国家部委等上级机构监管要求定期报告事项</option><option>1.3.2 风险事项报告</option></select></div>
                        <div className="pdf-bottom-field"><label>参股公司</label><select><option>长春富维集团汽车零部件股份有限公司</option><option>T3出行科技有限公司</option></select></div>
                        <div className="pdf-bottom-field"><label>议案</label><select><option>请选择议案</option><option>设备购入及处置方案</option><option>董事会会议案及表决建议</option></select></div>
                    </div>
                    <div className="pdf-bottom-attach-panel">
                        <div className="pdf-bottom-attach-list">
                            {pdfFiles.map((item) => (
                                <div className="pdf-bottom-attach-row" key={item}>
                                    <div className="pdf-bottom-attach-type">{item.endsWith(".pdf") ? "PDF" : "DOCX"}</div>
                                    <button className="pdf-bottom-attach-file" type="button" onClick={() => item.endsWith(".pdf") && setActiveFile(item)}>{item}</button>
                                    <button className="pdf-bottom-row-compare" type="button" onClick={() => setCompareOpen(true)}>对比</button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="pdf-bottom-actions-row">
                        <button className="pdf-bottom-action" type="button">参股公司信息</button>
                        <button className="pdf-bottom-action" type="button">一企一策</button>
                        <button className="pdf-bottom-action" type="button">战略规划</button>
                        <button className="pdf-bottom-action" type="button">财务报表</button>
                    </div>
                </div>
            </Modal>
        </>
    );

    return typeof document === "undefined" ? editor : createPortal(editor, document.body);
}
