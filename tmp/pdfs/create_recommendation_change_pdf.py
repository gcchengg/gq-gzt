from pathlib import Path
from PIL import Image

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, Image as RLImage, KeepTogether, PageBreak,
    PageTemplate, Paragraph, Spacer, Table, TableStyle
)


ROOT = Path("/Users/guocc/Documents/guquan/files/gq-gzt/需求/下发推荐函")
SOURCE_IMAGE = ROOT / "images/截屏2026-07-27 09.32.47.png"
OUTPUT = ROOT / "下发推荐函需求变更说明_20260727.pdf"
TMP = Path("/Users/guocc/Documents/guquan/files/gq-gzt/tmp/pdfs")
TMP.mkdir(parents=True, exist_ok=True)

FONT_NAME = "STHeiti"
pdfmetrics.registerFont(TTFont(
    FONT_NAME, "/System/Library/Fonts/STHeiti Medium.ttc", subfontIndex=0
))

BLUE = colors.HexColor("#155EEF")
NAVY = colors.HexColor("#0B1F3A")
LIGHT_BLUE = colors.HexColor("#EEF4FF")
PALE = colors.HexColor("#F7F9FC")
MID = colors.HexColor("#667085")
LINE = colors.HexColor("#D0D5DD")
GREEN = colors.HexColor("#067647")
ORANGE = colors.HexColor("#B54708")

styles = getSampleStyleSheet()
body = ParagraphStyle(
    "body", fontName=FONT_NAME, fontSize=9.2, leading=15,
    textColor=colors.HexColor("#344054"), spaceAfter=5,
)
small = ParagraphStyle(
    "small", parent=body, fontSize=8, leading=12, textColor=MID,
)
h1 = ParagraphStyle(
    "h1", fontName=FONT_NAME, fontSize=22, leading=30,
    textColor=NAVY, spaceAfter=8,
)
h2 = ParagraphStyle(
    "h2", fontName=FONT_NAME, fontSize=15, leading=21,
    textColor=NAVY, spaceBefore=4, spaceAfter=9,
)
h3 = ParagraphStyle(
    "h3", fontName=FONT_NAME, fontSize=11.5, leading=17,
    textColor=NAVY, spaceBefore=5, spaceAfter=5,
)
label = ParagraphStyle(
    "label", fontName=FONT_NAME, fontSize=8.5, leading=12,
    textColor=BLUE,
)
center = ParagraphStyle(
    "center", parent=body, alignment=TA_CENTER, textColor=NAVY,
)
cell = ParagraphStyle(
    "cell", parent=body, fontSize=8.3, leading=12.5, spaceAfter=0,
)
cell_head = ParagraphStyle(
    "cell_head", parent=cell, textColor=colors.white, alignment=TA_CENTER,
)


def P(text, style=body):
    return Paragraph(text, style)


def bullet(text):
    return Paragraph(f"• {text}", body)


def header_footer(canvas, doc):
    canvas.saveState()
    w, h = doc.pagesize
    canvas.setFillColor(BLUE)
    canvas.rect(0, h - 5 * mm, w, 5 * mm, fill=1, stroke=0)
    canvas.setFont(FONT_NAME, 8)
    canvas.setFillColor(MID)
    canvas.drawString(18 * mm, 10 * mm, "下发推荐函｜需求变更说明")
    canvas.drawRightString(w - 18 * mm, 10 * mm, f"{canvas.getPageNumber():02d}")
    canvas.restoreState()


doc = BaseDocTemplate(
    str(OUTPUT), pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm,
    topMargin=18 * mm, bottomMargin=17 * mm, title="下发推荐函需求变更说明",
    author="项目组",
)
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
doc.addPageTemplates([PageTemplate(id="all", frames=[frame], onPage=header_footer)])

story = []

# Cover
story += [
    Spacer(1, 28 * mm),
    P("需求变更说明", label),
    Spacer(1, 3 * mm),
    P("下发推荐函", h1),
    P("转发、发文下载与移动审批能力补充", ParagraphStyle(
        "subtitle", parent=body, fontSize=13, leading=20, textColor=MID
    )),
    Spacer(1, 14 * mm),
]
summary = Table([
    [P("版本", small), P("V1.0", body), P("编制日期", small), P("2026-07-27", body)],
    [P("文档类型", small), P("需求变更", body), P("适用模块", small), P("股权云工作台 / 下发推荐函", body)],
    [P("变更范围", small), P("PC 端 + 手机端", body), P("状态", small), P("待评审", body)],
], colWidths=[25 * mm, 48 * mm, 28 * mm, 73 * mm], rowHeights=[12 * mm] * 3)
summary.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), PALE),
    ("BOX", (0, 0), (-1, -1), 0.6, LINE),
    ("INNERGRID", (0, 0), (-1, -1), 0.35, LINE),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 8),
]))
story += [summary, Spacer(1, 14 * mm)]

scope_cards = Table([
    [P("<b>01 转发</b><br/>提交后选择接收人并转发", center),
     P("<b>02 下载</b><br/>发文预览支持文件下载", center),
     P("<b>03 移动审批</b><br/>手机端完成审批处理", center)]
], colWidths=[58 * mm] * 3, rowHeights=[31 * mm])
scope_cards.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BLUE),
    ("BOX", (0, 0), (-1, -1), 0.7, colors.HexColor("#B2CCFF")),
    ("INNERGRID", (0, 0), (-1, -1), 2.5, colors.white),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 7),
    ("RIGHTPADDING", (0, 0), (-1, -1), 7),
]))
story += [
    scope_cards, Spacer(1, 20 * mm),
    P("文档目的", h3),
    P("明确本次变更的业务规则、页面交互和验收口径，作为产品、设计、研发与测试共同评审依据。未在本文明确的权限、文件格式及审批操作，沿用系统现有规则。", body),
    PageBreak(),
]

# Overview
story += [
    P("01  变更总览", h2),
    P("本次变更围绕推荐函提交后的触达、发文文件获取，以及审批人在移动场景下的处理能力展开。", body),
    Spacer(1, 2 * mm),
]
overview = [
    [P("编号", cell_head), P("需求项", cell_head), P("核心变化", cell_head), P("端", cell_head), P("优先验收点", cell_head)],
    [P("R1", cell), P("提交后转发", cell), P("新增“转发”入口；默认勾选该公司管户；支持多选接收人", cell), P("PC", cell), P("默认值准确、多选有效、转发结果有反馈", cell)],
    [P("R2", cell), P("发文预览下载", cell), P("预览界面新增下载按钮，下载当前预览版本", cell), P("PC", cell), P("文件可打开，内容与预览一致", cell)],
    [P("R3", cell), P("推荐函移动审批", cell), P("提供手机端审批详情及审批操作页面", cell), P("手机", cell), P("信息完整、权限正确、审批状态同步", cell)],
]
t = Table(overview, colWidths=[14 * mm, 30 * mm, 63 * mm, 18 * mm, 49 * mm], repeatRows=1)
t.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), NAVY),
    ("GRID", (0, 0), (-1, -1), 0.45, LINE),
    ("BACKGROUND", (0, 1), (-1, -1), colors.white),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PALE]),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
]))
story += [t, Spacer(1, 8 * mm), P("统一约束", h3)]
for x in [
    "所有新增入口均受现有菜单权限、数据权限和单据状态控制。",
    "操作成功或失败必须给出明确反馈；重复操作需避免产生重复任务或重复转发记录。",
    "PC 与手机端展示同一审批实例，状态和审批意见实时一致。",
]:
    story.append(bullet(x))

story += [Spacer(1, 5 * mm), P("建议业务流程", h3)]
flow = Table([[
    P("<b>提交推荐函</b><br/><font color='#667085'>形成待审批/已提交记录</font>", center),
    P("→", center),
    P("<b>审批处理</b><br/><font color='#667085'>PC 或手机端</font>", center),
    P("→", center),
    P("<b>发文预览 / 下载</b><br/><font color='#667085'>获取最终发文</font>", center),
    P("→", center),
    P("<b>转发</b><br/><font color='#667085'>默认管户，可多选</font>", center),
]], colWidths=[36 * mm, 9 * mm, 36 * mm, 9 * mm, 42 * mm, 9 * mm, 36 * mm], rowHeights=[28 * mm])
flow.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BLUE),
    ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#B2CCFF")),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
]))
story += [flow, PageBreak()]

# Detailed requirements
story += [P("02  详细需求", h2)]

def requirement_block(title, goal, trigger, rules, acceptance):
    items = [
        P(title, h3),
        Table([
            [P("目标", label), P(goal, body)],
            [P("入口/触发", label), P(trigger, body)],
        ], colWidths=[25 * mm, 149 * mm], style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), PALE),
            ("BOX", (0, 0), (-1, -1), 0.4, LINE),
            ("INNERGRID", (0, 0), (-1, -1), 0.3, LINE),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ])),
        Spacer(1, 2 * mm), P("业务与交互规则", label),
    ]
    items += [bullet(r) for r in rules]
    items += [Spacer(1, 1 * mm), P("验收标准", label)]
    items += [bullet(a) for a in acceptance]
    items += [Spacer(1, 4 * mm)]
    return items

story += requirement_block(
    "R1｜下发推荐函提交后增加转发功能",
    "让推荐函在完成提交后可快速触达相关管户人员，减少线下另行通知。",
    "推荐函提交成功后的结果页或详情页显示“转发”按钮；截图中底部“转发”位置作为入口参考。",
    [
        "点击“转发”打开人员选择界面，候选范围遵循现有组织及人员数据权限。",
        "系统默认勾选“该公司管户”。若该公司存在多名管户，则默认勾选全部有效管户。",
        "接收人支持多选；用户可取消默认项并选择其他有权限人员。",
        "确认转发前展示已选人数；未选择接收人时不可提交，并提示“请选择接收人”。",
        "转发成功后提示成功，并记录操作人、操作时间、单据、接收人及结果，便于追溯。",
    ],
    [
        "默认接收人与当前公司管户关系一致，失效人员不被默认选择。",
        "选择 2 名及以上人员后可一次提交，所有目标均收到同一推荐函信息。",
        "无权限、接口失败或部分失败时提示原因；不可静默失败。",
    ],
)

story += requirement_block(
    "R2｜发文预览增加下载功能",
    "允许用户将预览中的正式发文保存到本地，用于归档、流转或线下使用。",
    "在“发文预览”页面的清晰可见位置增加“下载”按钮。",
    [
        "下载对象为当前预览对应的最新有效发文版本，内容与预览保持一致。",
        "文件名建议采用“推荐函_公司简称_文号_日期.pdf”；非法文件名字符需自动处理。",
        "下载期间显示加载状态，避免重复点击；失败时允许重试并显示错误提示。",
        "下载权限沿用发文预览权限，不具备预览权限的用户不可通过直链下载。",
    ],
    [
        "点击下载后生成文件，文件可正常打开，中文、印章及排版无缺失。",
        "下载文件的文号、标题、正文、落款及日期与页面预览一致。",
        "同一发文多次下载不改变业务状态或生成重复审批记录。",
    ],
)

story += [PageBreak()]
story += requirement_block(
    "R3｜下发推荐函审批增加手机端页面",
    "支持审批人在移动场景下查看推荐函信息、审批记录并完成审批。",
    "从手机端待办、消息通知或审批列表进入“下发推荐函审批详情”。",
    [
        "详情页至少展示：公司、文号、标题、发文内容、落款公司、落款日期、发文日期、附件/预览、发起人、发起时间和审批记录。",
        "页面底部提供与现有流程一致的审批操作，例如“同意”“驳回/退回”；审批意见是否必填沿用流程配置。",
        "长文本支持滚动与换行；附件或发文预览支持手机端查看，必要时可调用系统预览能力。",
        "提交审批前进行二次确认；提交中禁用按钮；成功后回到待办并刷新数量。",
        "已处理、已撤回、流程结束或无权限的实例仅允许查看，不显示可操作按钮。",
    ],
    [
        "主流手机屏幕宽度下无横向溢出，按钮不遮挡正文，关键字段无需缩放即可阅读。",
        "同意或驳回后，PC 与手机端审批状态、意见、处理人和处理时间一致。",
        "网络失败、重复提交、实例已被他人处理等异常均有明确提示并保持数据正确。",
    ],
)

story += [
    Spacer(1, 4 * mm),
    P("03  待评审确认项", h2),
]
confirm = [
    [P("序号", cell_head), P("待确认事项", cell_head), P("建议口径", cell_head)],
    [P("1", cell), P("转发入口出现的准确状态", cell), P("至少在提交成功后可用；是否须审批通过后才可转发，由业务确认。", cell)],
    [P("2", cell), P("“该公司管户”的数据来源与多人规则", cell), P("以公司-管户有效关系为准，多名有效管户全部默认勾选。", cell)],
    [P("3", cell), P("转发的实际触达渠道", cell), P("优先复用系统站内待办/消息；若需短信、邮件或企业微信，另行确认。", cell)],
    [P("4", cell), P("下载文件格式及印章规则", cell), P("默认 PDF，内容与正式发文预览一致；印章按现有发文规则输出。", cell)],
    [P("5", cell), P("手机端支持的审批动作", cell), P("与当前流程配置保持一致，不在移动端新增独立审批规则。", cell)],
]
ct = Table(confirm, colWidths=[14 * mm, 59 * mm, 101 * mm], repeatRows=1)
ct.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), NAVY),
    ("GRID", (0, 0), (-1, -1), 0.45, LINE),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PALE]),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
]))
story += [ct, PageBreak()]

# Screenshot appendix: create scaled full image
img = Image.open(SOURCE_IMAGE).convert("RGB")
shot_path = TMP / "recommendation_screenshot.jpg"
img.save(shot_path, quality=90, optimize=True)

story += [
    P("附录  现状截图", h2),
    P("截图展示“下发推荐函”页面现状；底部红框处为“转发”入口参考位置，左侧为“发文预览”入口。", body),
    Spacer(1, 2 * mm),
]
max_w, max_h = 174 * mm, 110 * mm
iw, ih = img.size
scale = min(max_w / iw, max_h / ih)
story += [
    RLImage(str(shot_path), width=iw * scale, height=ih * scale),
    Spacer(1, 5 * mm),
    P("截图来源：images/截屏2026-07-27 09.32.47.png", small),
    Spacer(1, 8 * mm),
]

# Highlighted crop around controls
crop = img.crop((700, 1100, 1650, 1550))
crop_path = TMP / "recommendation_controls_crop.jpg"
crop.save(crop_path, quality=92, optimize=True)
cw, ch = crop.size
cscale = min(150 * mm / cw, 62 * mm / ch)
story += [
    P("关键入口局部", h3),
    RLImage(str(crop_path), width=cw * cscale, height=ch * cscale),
    Spacer(1, 3 * mm),
    P("说明：最终按钮位置及样式以产品设计稿为准；本图用于标识业务入口，不作为像素级 UI 验收依据。", small),
]

doc.build(story)
print(OUTPUT)
