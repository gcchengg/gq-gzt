import { PlusOutlined, QuestionCircleOutlined, RedoOutlined, StarFilled, StarOutlined, UndoOutlined } from "@ant-design/icons";
import {
    Button,
    Drawer,
    Input,
    Modal,
    Pagination,
    Radio,
    Select,
    Space,
    Spin,
    Table,
    Tooltip,
    message,
} from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import TaskIssueDrawer from "@/components/TaskIssueDrawer";
import userResponse from "@/pages/liveCircle/mock/user.json";
import companyInfoImageUrl from "../../../../components/imgages/参股公司信息管理.png?url";
import financeReportImageUrl from "../../../../components/imgages/财务报表.png?url";
import strategyProgressImageUrl from "../../../../components/imgages/规划进展点检.png?url";
import oneCompanyPolicyImageUrl from "../../../../components/imgages/一企一策.png?url";
import { evaluationData, evaluationRelationColumns } from "./EvaluationExecution";
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
    "1.招标文件-备注版-明阳智能AI在多业务域应用试点项目-20250606.pdf",
];

const seedDiscussionVersion = 2;

const seedAnnotations = [
    { id: "area-1", page: 1, type: "框选批注", rect: { left: 49, top: 51, width: 43, height: 20 }, content: "关键净值与拆除费用表格区域，需要在评估前补充附件来源说明。", author: "郑华峰 2025-06-21 19:05", favorite: true, needReply: true, needCompanyReply: true, discussionVersion: seedDiscussionVersion, discussion: [
        { role: "evaluator", name: "郑华峰", time: "2025-06-21 19:05", content: "请参股公司补充净值表格与拆除费用的原始附件来源，并说明是否与评估底稿一致。" },
        { role: "company", name: "长春富维集团", time: "2025-06-22 09:18", content: "已补充固定资产卡片、处置评估底稿和拆除费用说明，附件已放入本议题材料包第3项。" },
        { role: "evaluator", name: "郑华峰", time: "2025-06-22 11:32", content: "附件来源已收到。请继续补充附件日期与评估报告引用页码，便于后续闭环归档。" },
        { role: "company", name: "长春富维集团", time: "2025-06-22 16:45", content: "已在净值测算表右上角补充附件日期，并在说明中标注评估报告第12页、第15页。" },
        { role: "evaluator", name: "吴文君", time: "2025-06-23 10:10", content: "已核对，净值来源和拆除费用说明可以支撑本次评估意见，建议提报人同步更新正文描述。" },
        { role: "submitter", name: "刘博", time: "2025-06-23 14:26", content: "正文已按批注意见更新，并补充附件索引页。" },
    ] },
    { id: "text-1", page: 1, type: "文字选择", textKey: "asset-status", content: "确认“无法再使用”的判断依据是否需要补充现场照片或附表说明。", author: "吴文君 2025-06-21 19:08", favorite: true, needReply: true, needCompanyReply: true, discussionVersion: seedDiscussionVersion, discussion: [
        { role: "evaluator", name: "吴文君", time: "2025-06-21 19:08", content: "请参股公司补充设备现场照片，以及“无法继续使用”的判定依据。" },
        { role: "company", name: "长春富维集团", time: "2025-06-22 10:04", content: "已上传现场照片6张，并补充设备拆除验收单。" },
        { role: "evaluator", name: "吴文君", time: "2025-06-22 14:30", content: "照片能证明拆除状态，但还缺设备编号和照片对应关系，请按资产清单顺序补充。" },
        { role: "company", name: "长春富维集团", time: "2025-06-23 09:40", content: "已在照片文件名中补充设备编号，并新增照片编号与资产清单映射表。" },
    ] },
    { id: "discussion-1", page: 2, type: "文字选择", textKey: "asset-status", content: "建议在董事会审议前完成净值口径、处置价格依据及资产完备性说明的补充标注，并同步形成任务清单。", author: "系统预置 2026-05-15 18:06", discussionVersion: seedDiscussionVersion, discussion: [
        { role: "evaluator", name: "吴文君", time: "2026-05-15 18:06", content: "建议补充现场照片作为支撑，避免判断只停留在文字描述。" },
        { role: "submitter", name: "刘博", time: "2026-05-16 09:22", content: "已补充现场照片，并同步到汇报材料。" },
        { role: "evaluator", name: "郑华峰", time: "2026-05-16 11:18", content: "建议把净值口径、处置价格依据和资产完备性说明拆成三条附件来源，由参股公司逐项反馈。" },
        { role: "company", name: "长春富维集团", time: "2026-05-16 16:35", content: "净值口径已按财务账面净值更新，处置价格依据已补充评估公司询价记录。" },
        { role: "evaluator", name: "郑华峰", time: "2026-05-17 09:10", content: "处置价格依据已满足要求，资产完备性说明仍需补充缺失设备的处置原因。" },
        { role: "company", name: "长春富维集团", time: "2026-05-17 15:42", content: "已补充缺失设备原因，涉及设备均为前期拆除后统一暂存，未发生对外处置。" },
    ], favorite: true, needReply: true, needCompanyReply: true },
];

const screenshotStorageKey = "newSanhui.annotationScreenshotPages";
const annotationsStorageKey = "newSanhui.pdfAnnotations";
const companyFeedbackStorageKey = "newSanhui.companyFeedbackRows";
const defaultScreenshotPages = {
    [pdfFiles[0]]: [1, 2],
    [pdfFiles[1]]: [2, 5],
};

const referenceActions = [
    { label: "参股公司信息", url: companyInfoImageUrl },
    { label: "一企一策", url: oneCompanyPolicyImageUrl },
    { label: "战略规划", url: strategyProgressImageUrl },
    { label: "财务报表", url: financeReportImageUrl },
];

const shareUserOptions = (Array.isArray(userResponse.data) ? userResponse.data : []).slice(0, 80).map((item) => ({
    label: `${item.fullName || item.loginId || "未命名用户"}${item.orgName ? `（${item.orgName}）` : ""}`,
    value: item.id || item.loginId || item.userCode,
    raw: item,
}));

function createShareSnapshotMarkup(element) {
    if (!element) return "";
    const clone = element.cloneNode(true);
    clone.querySelectorAll("button").forEach((button) => {
        button.setAttribute("disabled", "true");
    });
    clone.querySelectorAll("input, textarea, select").forEach((field) => {
        field.setAttribute("disabled", "true");
    });
    clone.classList.add("pdf-share-captured-page");
    return clone.outerHTML;
}

function openReferenceImage(url) {
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (opened) {
        opened.opener = null;
    }
}

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

function normalizeDiscussionItem(item, index = 0) {
    if (typeof item === "string") {
        const matched = item.match(/^([^：:]+)[：:]\s*(.*)$/);
        const speaker = matched?.[1] || "评估人员";
        const content = matched?.[2] || item;
        const role = speaker.includes("参股公司")
            ? "company"
            : speaker.includes("提报人") || speaker.includes("创建人")
              ? "submitter"
              : "evaluator";
        return {
            role,
            name: speaker,
            time: "",
            content,
            legacyKey: `${speaker}-${content}-${index}`,
        };
    }
    return {
        role: item?.role || "evaluator",
        name: item?.name || (item?.role === "company" ? "参股公司" : item?.role === "submitter" ? "提报人" : "评估人员"),
        time: item?.time || "",
        content: item?.content || "",
        legacyKey: `${item?.role || "evaluator"}-${item?.name || ""}-${item?.content || ""}-${index}`,
    };
}

function normalizeDiscussionList(list = []) {
    return (Array.isArray(list) ? list : []).map(normalizeDiscussionItem).filter((item) => item.content);
}

function getDiscussionRoleText(role) {
    if (role === "company") return "参股公司";
    if (role === "submitter") return "提报人";
    return "评估人员";
}

function readAnnotations() {
    if (typeof window === "undefined") return seedAnnotations;
    try {
        const stored = JSON.parse(window.localStorage.getItem(annotationsStorageKey));
        if (!Array.isArray(stored)) return seedAnnotations;
        const storedMap = new Map(stored.map((item) => [item.id, item]));
        const mergedSeeds = seedAnnotations.map((seed) => ({
            ...seed,
            ...storedMap.get(seed.id),
            needReply: seed.needReply,
            needCompanyReply: seed.needCompanyReply,
            discussionVersion: seedDiscussionVersion,
            discussion: storedMap.get(seed.id)?.discussionVersion >= seedDiscussionVersion && storedMap.get(seed.id)?.discussion?.length
                ? normalizeDiscussionList(storedMap.get(seed.id).discussion)
                : seed.discussion,
        }));
        const extraItems = stored
            .filter((item) => !seedAnnotations.some((seed) => seed.id === item.id))
            .map((item) => ({ ...item, discussion: normalizeDiscussionList(item.discussion) }));
        return [...mergedSeeds, ...extraItems];
    } catch {
        return seedAnnotations;
    }
}

function readCompanyFeedbackRows() {
    if (typeof window === "undefined") return [];
    try {
        return JSON.parse(window.localStorage.getItem(companyFeedbackStorageKey)) || [];
    } catch {
        return [];
    }
}

function buildCompanyFeedbackFromAnnotation(annotation, fileName) {
    const existed = readCompanyFeedbackRows().find((item) => item.annotationId === annotation.id);
    return {
        id: existed?.id || `company-feedback-${annotation.id}`,
        annotationId: annotation.id,
        topicName: existed?.topicName || "一汽解放汽车有限公司发动机分公司31项报废设备购入及处置方案",
        pdfName: existed?.pdfName || fileName || pdfFiles[0],
        page: annotation.page,
        feedbackContent: annotation.content,
        companyAnswer: existed?.companyAnswer || "",
        feedbackTime: existed?.feedbackTime || annotation.author?.match(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/)?.[0] || "2026-05-13 10:20",
        answerTime: existed?.answerTime || "",
        rounds: existed?.rounds?.length ? existed.rounds : normalizeDiscussionList(annotation.discussion),
    };
}

function writeAnnotations(value, activeFile = pdfFiles[0]) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(annotationsStorageKey, JSON.stringify(value));
    const existedRows = readCompanyFeedbackRows();
    const existedMap = new Map(existedRows.map((item) => [item.annotationId, item]));
    const nextRows = value
        .filter((item) => item.needCompanyReply)
        .map((item) => ({
            ...buildCompanyFeedbackFromAnnotation(item, activeFile),
            ...existedMap.get(item.id),
            page: item.page,
            feedbackContent: item.content,
        }));
    window.localStorage.setItem(companyFeedbackStorageKey, JSON.stringify(nextRows));
    window.dispatchEvent(new CustomEvent("newSanhui:pdfAnnotationsChange", { detail: value }));
    window.dispatchEvent(new CustomEvent("newSanhui:companyFeedbackChange", { detail: nextRows }));
}

export default function PdfAnnotationEditor({ open, fileName, mode = "annotation", showNeedReply = true, onClose }) {
    const [activeFile, setActiveFile] = useState(fileName || pdfFiles[0]);
    const [compareFiles, setCompareFiles] = useState([fileName || pdfFiles[0], pdfFiles[1]]);
    const [scope, setScope] = useState(mode === "associate" ? "existing" : "all");
    const [markMode, setMarkMode] = useState("area");
    const [currentPage, setCurrentPage] = useState(1);
    const [annotations, setAnnotations] = useState(() => readAnnotations());
    const [linkedPages, setLinkedPages] = useState([1]);
    const [noteOpen, setNoteOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [note, setNote] = useState("");
    const [needReply, setNeedReply] = useState(false);
    const [needCompanyReply, setNeedCompanyReply] = useState(false);
    const [compareOpen, setCompareOpen] = useState(false);
    const [contextOpen, setContextOpen] = useState(false);
    const [replyingId, setReplyingId] = useState(null);
    const [reply, setReply] = useState("");
    const [creationArmed, setCreationArmed] = useState(false);
    const [draftTarget, setDraftTarget] = useState(null);
    const [drawingRect, setDrawingRect] = useState(null);
    const [screenshotPages, setScreenshotPages] = useState(() => readScreenshotPages());
    const [annotationPage, setAnnotationPage] = useState(1);
    const [annotationFilter, setAnnotationFilter] = useState("all");
    const [expandedAnnotationIds, setExpandedAnnotationIds] = useState([]);
    const [factorTableOpen, setFactorTableOpen] = useState(false);
    const [factorButtonPosition, setFactorButtonPosition] = useState({ x: 32, y: 116 });
    const [shareButtonPosition, setShareButtonPosition] = useState({ x: 32, y: 196 });
    const [shareOpen, setShareOpen] = useState(false);
    const [shareSnapshotMarkup, setShareSnapshotMarkup] = useState("");
    const [shareLoading, setShareLoading] = useState(false);
    const [shareUsers, setShareUsers] = useState([]);
    const [shareAdvice, setShareAdvice] = useState("<p>请查看当前 PDF 批注截图，并结合批注内容反馈处理意见。</p>");
    const [shareMarkColor, setShareMarkColor] = useState("#e11d48");
    const [shareMarks, setShareMarks] = useState([]);
    const [shareRedoMarks, setShareRedoMarks] = useState([]);
    const [shareDraftMark, setShareDraftMark] = useState(null);
    const [shareConfirmOpen, setShareConfirmOpen] = useState(false);
    const [shareSuccessOpen, setShareSuccessOpen] = useState(false);
    const pageRef = useRef(null);
    const drawStartRef = useRef(null);
    const factorDragRef = useRef(null);
    const shareDragRef = useRef(null);
    const shareShotRef = useRef(null);
    const shareMarkStartRef = useRef(null);

    const visiblePages = useMemo(() => pages.filter((page) => {
        if (scope === "existing") return page.annotated || annotations.some((item) => item.page === page.page);
        if (scope === "new") return !page.annotated && !annotations.some((item) => item.page === page.page);
        return true;
    }), [annotations, scope]);
    const activePage = visiblePages.find((page) => page.page === currentPage) || visiblePages[0] || pages[0];
    const activeAnnotations = annotations.filter((item) => item.page === activePage.page);
    const filteredAnnotations = activeAnnotations.filter((item) => {
        if (annotationFilter === "favorite") return item.favorite;
        if (annotationFilter === "submitter") return item.needReply;
        if (annotationFilter === "company") return item.needCompanyReply;
        return true;
    });
    const pagedAnnotations = filteredAnnotations.slice((annotationPage - 1) * 5, annotationPage * 5);
    const isAnnotationScreenshotPage = screenshotPages[activeFile]?.includes(activePage.page);
    const shareSelectedNames = useMemo(() => shareUserOptions
        .filter((item) => shareUsers.includes(item.value))
        .map((item) => item.label)
        .slice(0, 3)
        .join("、"), [shareUsers]);

    useEffect(() => {
        const maxPage = Math.max(Math.ceil(filteredAnnotations.length / 5), 1);
        if (annotationPage > maxPage) {
            setAnnotationPage(maxPage);
        }
    }, [annotationPage, filteredAnnotations.length]);

    useEffect(() => {
        if (!open) return undefined;
        const handleAnnotationsChange = (event) => {
            setAnnotations(Array.isArray(event.detail) ? event.detail : readAnnotations());
        };
        window.addEventListener("newSanhui:pdfAnnotationsChange", handleAnnotationsChange);
        return () => window.removeEventListener("newSanhui:pdfAnnotationsChange", handleAnnotationsChange);
    }, [open]);

    useEffect(() => {
        writeAnnotations(annotations, activeFile);
    }, [activeFile, annotations]);

    useEffect(() => {
        window.dispatchEvent(new CustomEvent("gq:pdf-editor-task-visible", { detail: { open } }));
        return () => {
            window.dispatchEvent(new CustomEvent("gq:pdf-editor-task-visible", { detail: { open: false } }));
        };
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;
        const handlePointerMove = (event) => {
            const drag = factorDragRef.current;
            const shareDrag = shareDragRef.current;
            if (drag) {
                const nextX = Math.min(Math.max(event.clientX - drag.offsetX, 16), window.innerWidth - 148);
                const nextY = Math.min(Math.max(event.clientY - drag.offsetY, 84), window.innerHeight - 76);
                if (Math.abs(nextX - drag.startX) > 3 || Math.abs(nextY - drag.startY) > 3) {
                    drag.moved = true;
                }
                setFactorButtonPosition({ x: nextX, y: nextY });
                return;
            }
            if (shareDrag) {
                const nextX = Math.min(Math.max(event.clientX - shareDrag.offsetX, 16), window.innerWidth - 132);
                const nextY = Math.min(Math.max(event.clientY - shareDrag.offsetY, 84), window.innerHeight - 72);
                if (Math.abs(nextX - shareDrag.startX) > 3 || Math.abs(nextY - shareDrag.startY) > 3) {
                    shareDrag.moved = true;
                }
                setShareButtonPosition({ x: nextX, y: nextY });
            }
        };
        const handlePointerUp = () => {
            const drag = factorDragRef.current;
            const shareDrag = shareDragRef.current;
            if (drag) {
                factorDragRef.current = null;
                if (!drag.moved) {
                    setFactorTableOpen((value) => !value);
                }
            }
            if (shareDrag) {
                shareDragRef.current = null;
                if (!shareDrag.moved) {
                    handleOpenShare();
                }
            }
        };
        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };
    }, [open]);

    const startFactorButtonDrag = (event) => {
        event.preventDefault();
        factorDragRef.current = {
            offsetX: event.clientX - factorButtonPosition.x,
            offsetY: event.clientY - factorButtonPosition.y,
            startX: factorButtonPosition.x,
            startY: factorButtonPosition.y,
            moved: false,
        };
    };
    const startShareButtonDrag = (event) => {
        event.preventDefault();
        shareDragRef.current = {
            offsetX: event.clientX - shareButtonPosition.x,
            offsetY: event.clientY - shareButtonPosition.y,
            startX: shareButtonPosition.x,
            startY: shareButtonPosition.y,
            moved: false,
        };
    };

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
        setNeedCompanyReply(Boolean(annotation?.needCompanyReply));
        setNoteOpen(true);
    };
    const saveNote = () => {
        if (!note.trim()) return;
        setAnnotations((current) => editing
            ? current.map((item) => item.id === editing.id ? { ...item, content: note, needReply, needCompanyReply } : item)
            : [{ id: `note-${Date.now()}`, page: activePage.page, type: draftTarget?.type === "area" ? "框选批注" : "文字选择", rect: draftTarget?.rect, textKey: draftTarget?.textKey, content: note, needReply, needCompanyReply, author: "系统预置 2026-05-13 10:20" }, ...current]);
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
            ? { ...item, discussion: [...normalizeDiscussionList(item.discussion), { role: "evaluator", name: "评估人员", time: "刚刚", content: reply }] }
            : item));
        setReply("");
        setReplyingId(null);
    };
    const toggleAnnotationExpanded = (id) => {
        setExpandedAnnotationIds((current) => current.includes(id)
            ? current.filter((item) => item !== id)
            : [...current, id]);
    };
    const pointInShareShot = (event) => {
        const bounds = shareShotRef.current?.getBoundingClientRect();
        if (!bounds) return null;
        return {
            x: Math.min(Math.max((event.clientX - bounds.left) / bounds.width * 100, 0), 100),
            y: Math.min(Math.max((event.clientY - bounds.top) / bounds.height * 100, 0), 100),
        };
    };
    const startShareMark = (event) => {
        if (!shareSnapshotMarkup || event.button !== 0) return;
        const point = pointInShareShot(event);
        if (!point) return;
        shareMarkStartRef.current = point;
        setShareDraftMark({ left: point.x, top: point.y, width: 0, height: 0, color: shareMarkColor });
        event.currentTarget.setPointerCapture(event.pointerId);
    };
    const moveShareMark = (event) => {
        if (!shareMarkStartRef.current) return;
        const point = pointInShareShot(event);
        if (!point) return;
        setShareDraftMark({
            left: Math.min(shareMarkStartRef.current.x, point.x),
            top: Math.min(shareMarkStartRef.current.y, point.y),
            width: Math.abs(point.x - shareMarkStartRef.current.x),
            height: Math.abs(point.y - shareMarkStartRef.current.y),
            color: shareMarkColor,
        });
    };
    const finishShareMark = () => {
        if (!shareMarkStartRef.current) return;
        shareMarkStartRef.current = null;
        setShareDraftMark((mark) => {
            if (mark && mark.width >= 1 && mark.height >= 1) {
                setShareMarks((current) => [...current, { ...mark, id: `share-mark-${Date.now()}`, text: "" }]);
                setShareRedoMarks([]);
            }
            return null;
        });
    };
    const updateShareMarkText = (id, text) => {
        setShareMarks((current) => current.map((mark) => mark.id === id ? { ...mark, text } : mark));
    };
    const undoShareMark = () => {
        setShareMarks((current) => {
            const removed = current.at(-1);
            if (!removed) return current;
            setShareRedoMarks((redo) => [removed, ...redo]);
            return current.slice(0, -1);
        });
    };
    const redoShareMark = () => {
        setShareRedoMarks((current) => {
            const restored = current[0];
            if (!restored) return current;
            setShareMarks((marks) => [...marks, restored]);
            return current.slice(1);
        });
    };
    const handleOpenShare = async () => {
        if (!pageRef.current) {
            message.warning("未找到可分享的 PDF 内容区域");
            return;
        }
        setShareOpen(true);
        setShareLoading(true);
        try {
            setShareSnapshotMarkup(createShareSnapshotMarkup(pageRef.current));
            setShareMarks([]);
            setShareRedoMarks([]);
            setShareDraftMark(null);
            message.success("已截取当前 PDF 内容，可选择分享人后发送");
        } catch (error) {
            console.error("PDF内容截图失败:", error);
            message.error("PDF内容截图失败，请稍后重试");
        } finally {
            setShareLoading(false);
        }
    };
    const handleConfirmShare = () => {
        if (!shareUsers.length) {
            message.warning("请选择至少一位分享人");
            return;
        }
        setShareConfirmOpen(true);
    };
    const sendShareMessage = () => {
        setShareConfirmOpen(false);
        setShareOpen(false);
        setTimeout(() => setShareSuccessOpen(true), 120);
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
                            <div className="pdf-side-title-row">
                                <div className="pdf-side-title">{mode === "associate" ? "关联项列表" : "批注列表"}</div>
                                {mode !== "associate" ? <Button type="primary" icon={<PlusOutlined />} onClick={() => armCreation(markMode)}>新增</Button> : null}
                            </div>
                            <div className="pdf-side-actions">
                                {mode !== "associate" ? (
                                    <div className="pdf-annotation-filter" aria-label="批注收藏过滤">
                                        <button
                                            className={annotationFilter === "all" ? "active" : ""}
                                            type="button"
                                            onClick={() => {
                                                setAnnotationFilter("all");
                                                setAnnotationPage(1);
                                            }}
                                        >
                                            全部
                                        </button>
                                        <button
                                            className={annotationFilter === "favorite" ? "active" : ""}
                                            type="button"
                                            onClick={() => {
                                                setAnnotationFilter("favorite");
                                                setAnnotationPage(1);
                                            }}
                                        >
                                            <StarFilled />
                                            已收藏
                                        </button>
                                        <button
                                            className={annotationFilter === "submitter" ? "active" : ""}
                                            type="button"
                                            onClick={() => {
                                                setAnnotationFilter("submitter");
                                                setAnnotationPage(1);
                                            }}
                                        >
                                            提报人回复
                                        </button>
                                        <button
                                            className={annotationFilter === "company" ? "active" : ""}
                                            type="button"
                                            onClick={() => {
                                                setAnnotationFilter("company");
                                                setAnnotationPage(1);
                                            }}
                                        >
                                            参股公司回复
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                        <div className="pdf-task-scroll">
                          <div className="pdf-task-list">
                            {pagedAnnotations.map((item, index) => {
                                const discussionList = normalizeDiscussionList(item.discussion);
                                const isExpanded = expandedAnnotationIds.includes(item.id);
                                return (
                                <article className={`pdf-task-card ${index === 0 ? "active" : ""} ${isExpanded ? "expanded" : "collapsed"}`} key={item.id}>
                                    <div className="pdf-task-top">
                                        <div className="pdf-task-tags">
                                            <span className="pdf-tag pdf-tag-page">第{item.page}页</span>
                                            <span className="pdf-tag pdf-tag-type">{item.type}</span>
                                            {item.needReply ? <span className="pdf-tag pdf-tag-thread">需提报人回复</span> : null}
                                            {item.needCompanyReply ? <span className="pdf-tag pdf-tag-company">需参股公司回复</span> : null}
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
                                    {discussionList.length ? (
                                        <div className="pdf-task-discussion">
                                            <div className="pdf-discussion-summary">
                                                <span>共 {discussionList.length} 轮讨论</span>
                                            </div>
                                            {isExpanded ? (
                                                <div className="pdf-discussion-latest">
                                                    {discussionList.map((discussion, discussionIndex) => (
                                                        <div className={`pdf-discussion-message ${discussion.role}`} key={discussion.legacyKey || `${item.id}-${discussionIndex}`}>
                                                            <div className="pdf-discussion-head">
                                                                {getDiscussionRoleText(discussion.role)}
                                                                {discussion.name ? ` · ${discussion.name}` : ""}
                                                                {discussion.time ? ` · ${discussion.time}` : ""}
                                                            </div>
                                                            <div className="pdf-discussion-body">{discussion.content}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>
                                    ) : null}
                                    {isExpanded && replyingId === item.id ? (
                                        <Space.Compact block className="pdf-discussion-composer active">
                                            <Input value={reply} onChange={(event) => setReply(event.target.value)} placeholder="请输入建议或回复内容" />
                                            <Button type="primary" onClick={() => sendReply(item.id)}>发送</Button>
                                        </Space.Compact>
                                    ) : null}
                                    <div className="pdf-task-foot">
                                        <div className="pdf-task-meta">{item.author}</div>
                                        <div className="pdf-task-actions">
                                            <button type="button" onClick={() => toggleAnnotationExpanded(item.id)}>{isExpanded ? "收起" : "展开"}</button>
                                            <button type="button" onClick={() => {
                                                setExpandedAnnotationIds((current) => current.includes(item.id) ? current : [...current, item.id]);
                                                setReplyingId(item.id);
                                            }}>回复</button>
                                            <button type="button" onClick={() => openNote(item)}>编辑</button>
                                            <button className="danger" type="button" onClick={() => setAnnotations((current) => current.filter((annotation) => annotation.id !== item.id))}>删除</button>
                                        </div>
                                    </div>
                                </article>
                                );
                            })}
                            {!filteredAnnotations.length ? <div className="pdf-empty-annotations">当前筛选下暂无批注</div> : null}
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
                <div
                    className="pdf-factor-floating"
                    style={{ left: factorButtonPosition.x, top: factorButtonPosition.y }}
                >
                    <button
                        className={`pdf-factor-toggle ${factorTableOpen ? "active" : ""}`}
                        type="button"
                        aria-expanded={factorTableOpen}
                        onPointerDown={startFactorButtonDrag}
                    >
                        评估模型
                    </button>
                    {factorTableOpen ? (
                        <div className="pdf-factor-panel">
                            <Table
                                rowKey="key"
                                size="small"
                                bordered
                                pagination={false}
                                dataSource={evaluationData}
                                columns={evaluationRelationColumns}
                                scroll={{ x: 810, y: 280 }}
                            />
                        </div>
                    ) : null}
                </div>
                <div
                    className="pdf-share-floating"
                    style={{ left: shareButtonPosition.x, top: shareButtonPosition.y }}
                >
                    <button
                        className="pdf-share-toggle"
                        type="button"
                        aria-label="分享当前PDF内容"
                        onPointerDown={startShareButtonDrag}
                    >
                        分享
                    </button>
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
            <Drawer
                title="分享批注截图"
                width={760}
                open={shareOpen}
                onClose={() => setShareOpen(false)}
                zIndex={12140}
                className="pdf-share-drawer"
                footer={(
                    <div className="pdf-share-footer">
                        <Button onClick={() => setShareOpen(false)}>取消</Button>
                        <Button type="primary" onClick={handleConfirmShare}>确认分享</Button>
                    </div>
                )}
            >
                <Spin spinning={shareLoading} tip="正在截取PDF内容...">
                    <div className="pdf-share-content">
                        <section className="pdf-share-section">
                                <div className="pdf-share-section-title-row">
                                <div className="pdf-share-section-title">截图批注</div>
                                <div className="pdf-share-mark-tools">
                                    {["#e11d48", "#f59e0b", "#2563eb", "#16a34a"].map((color) => (
                                        <button
                                            className={`pdf-share-color ${shareMarkColor === color ? "active" : ""}`}
                                            key={color}
                                            type="button"
                                            style={{ backgroundColor: color }}
                                            onClick={() => setShareMarkColor(color)}
                                            aria-label={`选择${color}批注颜色`}
                                        />
                                    ))}
                                    <Button size="small" icon={<UndoOutlined />} disabled={!shareMarks.length} onClick={undoShareMark}>撤销</Button>
                                    <Button size="small" icon={<RedoOutlined />} disabled={!shareRedoMarks.length} onClick={redoShareMark}>重做</Button>
                                </div>
                            </div>
                            <div className="pdf-share-shot">
                                {shareSnapshotMarkup ? (
                                    <div
                                        className="pdf-share-shot-stage"
                                        ref={shareShotRef}
                                        onPointerDown={startShareMark}
                                        onPointerMove={moveShareMark}
                                        onPointerUp={finishShareMark}
                                        onPointerLeave={finishShareMark}
                                    >
                                        <div className="pdf-share-shot-content" dangerouslySetInnerHTML={{ __html: shareSnapshotMarkup }} />
                                        <div className="pdf-share-mark-layer">
                                            {shareMarks.map((mark) => (
                                                <div
                                                    className="pdf-share-mark-rect"
                                                    key={mark.id}
                                                    style={{
                                                        left: `${mark.left}%`,
                                                        top: `${mark.top}%`,
                                                        width: `${mark.width}%`,
                                                        height: `${mark.height}%`,
                                                        borderColor: mark.color,
                                                        backgroundColor: `${mark.color}18`,
                                                    }}
                                                >
                                                    <textarea
                                                        className="pdf-share-mark-input"
                                                        value={mark.text}
                                                        placeholder="输入批注"
                                                        onPointerDown={(event) => event.stopPropagation()}
                                                        onChange={(event) => updateShareMarkText(mark.id, event.target.value)}
                                                    />
                                                </div>
                                            ))}
                                            {shareDraftMark ? (
                                                <div
                                                    className="pdf-share-mark-rect drafting"
                                                    style={{
                                                        left: `${shareDraftMark.left}%`,
                                                        top: `${shareDraftMark.top}%`,
                                                        width: `${shareDraftMark.width}%`,
                                                        height: `${shareDraftMark.height}%`,
                                                        borderColor: shareDraftMark.color,
                                                        backgroundColor: `${shareDraftMark.color}18`,
                                                    }}
                                                />
                                            ) : null}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="pdf-share-empty">暂无截图，请重新点击分享按钮生成。</div>
                                )}
                            </div>
                            <div className="pdf-share-tip">仅截取左侧 PDF 正文内容，不包含右侧批注列表；拖拽框选后可在框内输入批注文字。</div>
                        </section>

                        <section className="pdf-share-section">
                            <div className="pdf-share-section-title">分享人</div>
                            <Select
                                mode="multiple"
                                allowClear
                                showSearch
                                value={shareUsers}
                                options={shareUserOptions}
                                optionFilterProp="label"
                                placeholder="请选择需要发送钉钉消息的人员"
                                className="pdf-share-user-select"
                                popupClassName="pdf-share-user-dropdown"
                                style={{ width: "100%" }}
                                maxTagCount="responsive"
                                getPopupContainer={() => document.body}
                                onChange={setShareUsers}
                            />
                        </section>

                        <section className="pdf-share-section">
                            <div className="pdf-share-section-title">分享建议</div>
                            <div
                                className="pdf-share-editor"
                                contentEditable
                                suppressContentEditableWarning
                                dangerouslySetInnerHTML={{ __html: shareAdvice }}
                                onInput={(event) => setShareAdvice(event.currentTarget.innerHTML)}
                            />
                        </section>
                    </div>
                </Spin>
            </Drawer>
            <Modal
                title="确认分享"
                open={shareConfirmOpen}
                zIndex={12220}
                okText="确认发送"
                cancelText="取消"
                onCancel={() => setShareConfirmOpen(false)}
                onOk={sendShareMessage}
            >
                <div className="pdf-share-success">
                    <p>确认后将向选中的 {shareUsers.length} 位人员发送钉钉消息。</p>
                    {shareSelectedNames ? <p>接收人：{shareSelectedNames}{shareUsers.length > 3 ? " 等" : ""}</p> : null}
                    <p>消息中会包含当前 PDF 截图批注和分享建议。</p>
                </div>
            </Modal>
            <Modal
                title="分享成功"
                open={shareSuccessOpen}
                zIndex={12230}
                okText="知道了"
                cancelButtonProps={{ style: { display: "none" } }}
                onCancel={() => setShareSuccessOpen(false)}
                onOk={() => setShareSuccessOpen(false)}
            >
                <div className="pdf-share-success">
                    <p>已模拟向 {shareUsers.length} 位人员发送钉钉消息。</p>
                    {shareSelectedNames ? <p>接收人：{shareSelectedNames}{shareUsers.length > 3 ? " 等" : ""}</p> : null}
                    <p>消息内容包含当前 PDF 截图批注和分享建议。</p>
                </div>
            </Modal>
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
                {showNeedReply ? (<div className="pdf-note-reply-field">
                    <span>是否需要提报人回复：</span>
                    <Radio.Group value={needReply} onChange={(event) => setNeedReply(event.target.value)}>
                        <Radio value={true}>是</Radio>
                        <Radio value={false}>否</Radio>
                    </Radio.Group>
                </div>) : null}
                <div className="pdf-note-reply-field">
                    <span>是否需要参股公司回复：</span>
                    <Radio.Group value={needCompanyReply} onChange={(event) => setNeedCompanyReply(event.target.value)}>
                        <Radio value={true}>是</Radio>
                        <Radio value={false}>否</Radio>
                    </Radio.Group>
                </div>
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
                        {referenceActions.map((item) => (
                            <button className="pdf-bottom-action" type="button" key={item.label} onClick={() => openReferenceImage(item.url)}>
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </Modal>
            <TaskIssueDrawer
                zIndex={12120}
                title="议题评估任务浮窗"
                onSubmit={(payload) => {
                    console.log(payload);
                }}
            />
        </>
    );

    return typeof document === "undefined" ? editor : createPortal(editor, document.body);
}
