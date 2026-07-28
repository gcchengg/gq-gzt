from pathlib import Path
from PIL import Image

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, Image as RLImage, PageBreak, PageTemplate,
    Paragraph, Spacer, Table, TableStyle
)

ROOT = Path("/Users/guocc/Documents/guquan/files/gq-gzt/需求/下发推荐函")
SOURCE_IMAGE = ROOT / "images/截屏2026-07-27 09.32.47.png"
REJECT_IMAGE = ROOT / "images/截屏2026-07-27 13.24.54.png"
DESCRIPTION_IMAGE = ROOT / "images/iwEdAqNwbmcDAQTRB20F0QHZBrA-taF8QDaQRwo6EdwFwTgAB9JtH5V0CAAJomltCgAL0gACUEE.png"
OUTPUT = ROOT / "下发推荐函需求变更说明_20260727.pdf"
TMP = Path("/Users/guocc/Documents/guquan/files/gq-gzt/tmp/pdfs/confirmed")
TMP.mkdir(parents=True, exist_ok=True)

FONT = "STHeiti"
pdfmetrics.registerFont(TTFont(FONT, "/System/Library/Fonts/STHeiti Medium.ttc"))

BLUE = colors.HexColor("#155EEF")
NAVY = colors.HexColor("#0B1F3A")
TEXT = colors.HexColor("#344054")
MUTED = colors.HexColor("#667085")
PALE = colors.HexColor("#F7F9FC")
LIGHT_BLUE = colors.HexColor("#EEF4FF")
LINE = colors.HexColor("#D0D5DD")

body = ParagraphStyle("body", fontName=FONT, fontSize=10, leading=17, textColor=TEXT, spaceAfter=5)
small = ParagraphStyle("small", parent=body, fontSize=8, leading=12, textColor=MUTED)
h1 = ParagraphStyle("h1", fontName=FONT, fontSize=23, leading=32, textColor=NAVY, spaceAfter=8)
h2 = ParagraphStyle("h2", fontName=FONT, fontSize=15.5, leading=23, textColor=NAVY, spaceBefore=6, spaceAfter=9)
h3 = ParagraphStyle("h3", fontName=FONT, fontSize=12, leading=18, textColor=NAVY, spaceBefore=5, spaceAfter=6)
cell = ParagraphStyle("cell", parent=body, fontSize=8.8, leading=13, spaceAfter=0)
cell_head = ParagraphStyle("cell_head", parent=cell, textColor=colors.white)


def p(text, style=body):
    return Paragraph(text, style)


def bullet(text):
    return Paragraph(f"• {text}", body)


def header_footer(canvas, doc):
    canvas.saveState()
    w, h = doc.pagesize
    canvas.setFillColor(BLUE)
    canvas.rect(0, h - 5 * mm, w, 5 * mm, fill=1, stroke=0)
    canvas.setFont(FONT, 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 10 * mm, "下发推荐函｜需求变更说明")
    canvas.drawRightString(w - 18 * mm, 10 * mm, f"{canvas.getPageNumber():02d}")
    canvas.restoreState()


doc = BaseDocTemplate(
    str(OUTPUT), pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm,
    topMargin=18 * mm, bottomMargin=17 * mm,
    title="下发推荐函需求变更说明", author="项目组",
)
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="main")
doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=header_footer)])

story = [
    Spacer(1, 7 * mm),
    p("需求变更说明", ParagraphStyle("eyebrow", parent=small, textColor=BLUE, fontSize=9)),
    p("下发推荐函", h1),
    p("转发、发文下载与手机端审批", ParagraphStyle(
        "subtitle", parent=body, fontSize=13, leading=20, textColor=MUTED
    )),
    Spacer(1, 6 * mm),
]

meta = Table([
    [p("文档状态", small), p("已确认", body), p("编制日期", small), p("2026-07-27", body)],
    [p("适用模块", small), p("股权云工作台 / 下发推荐函", body), p("变更范围", small), p("PC 端 + 手机端", body)],
], colWidths=[28 * mm, 56 * mm, 28 * mm, 62 * mm], rowHeights=[13 * mm, 13 * mm])
meta.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), PALE),
    ("BOX", (0, 0), (-1, -1), 0.5, LINE),
    ("INNERGRID", (0, 0), (-1, -1), 0.3, LINE),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 8),
]))
story += [
    meta, Spacer(1, 7 * mm),
    p("一、需求背景", h2),
    p("对“下发推荐函”相关功能进行调整，增加推荐函转发、发文下载及手机端审批能力。"),
    Spacer(1, 2 * mm),
    p("二、需求变更", h2),
    p("1. 下发推荐函增加转发功能", h3),
    p("下发推荐函提交后，增加“转发”功能。"),
]

for item in [
    "点击“转发”后，可以选择转发接收人。",
    "默认选择该公司的管户，该公司管户只有一人。",
    "用户可以取消默认选择的管户。",
    "接收人支持多选。",
    "可多选人员的范围为一汽股权的所有人。",
    "转发成功后，通过钉钉通知接收人。",
]:
    story.append(bullet(item))

story += [
    Spacer(1, 5 * mm),
    p("2. 发文预览增加下载功能", h3),
    p("在“发文预览”附近增加“下载”按钮。"),
    bullet("用户点击“下载”按钮，可以下载发文。"),
    Spacer(1, 5 * mm),
    p("3. 下发推荐函增加手机端审批页面", h3),
    p("下发推荐函审批需要提供手机端审批页面。"),
    bullet("手机端审批页面及审批逻辑与以往审批逻辑一致。"),
    PageBreak(),
    p("4. 董监高选聘增加驳回操作", h3),
    p("董监高选聘增加“驳回”操作。"),
    bullet("点击“驳回”后，显示“是否确认驳回”确认提示。"),
    bullet("用户确认驳回后，流程退回到“任职需求提出”。"),
    Spacer(1, 5 * mm),
    p("5. 下发推荐函描述增加公司简称", h3),
    p("下发推荐函的描述中增加公司简称。"),
    Spacer(1, 8 * mm),
    p("三、本次变更范围", h2),
]

scope = Table([
    [p("序号", cell_head), p("需求项", cell_head), p("使用端", cell_head)],
    [p("1", cell), p("下发推荐函提交后增加转发功能", cell), p("PC 端", cell)],
    [p("2", cell), p("发文预览增加下载功能", cell), p("PC 端", cell)],
    [p("3", cell), p("下发推荐函增加审批页面", cell), p("手机端", cell)],
    [p("4", cell), p("董监高选聘增加驳回操作", cell), p("PC 端", cell)],
    [p("5", cell), p("下发推荐函描述增加公司简称", cell), p("PC 端", cell)],
], colWidths=[22 * mm, 118 * mm, 34 * mm])
scope.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), NAVY),
    ("GRID", (0, 0), (-1, -1), 0.45, LINE),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PALE]),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 7),
    ("RIGHTPADDING", (0, 0), (-1, -1), 7),
    ("TOPPADDING", (0, 0), (-1, -1), 7),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
]))
story += [
    scope, PageBreak(),
    p("四、页面参考", h2),
    p("1. 下发推荐函转发入口", h3),
    p("页面底部包含“发文预览”和“转发”按钮，“转发”按钮位置已使用红框标注。"),
    Spacer(1, 3 * mm),
]

def prepared_image(source, name, max_height):
    image = Image.open(source).convert("RGB")
    target = TMP / name
    image.save(target, quality=91, optimize=True)
    width, height = image.size
    image_scale = min((174 * mm) / width, max_height / height)
    return RLImage(str(target), width=width * image_scale, height=height * image_scale)


story += [
    prepared_image(SOURCE_IMAGE, "transfer_reference.jpg", 69 * mm),
    Spacer(1, 3 * mm),
    p("截图：截屏2026-07-27 09.32.47.png", small),
    Spacer(1, 4 * mm),
    p("2. 董监高选聘驳回操作", h3),
    prepared_image(REJECT_IMAGE, "reject_reference.jpg", 69 * mm),
    Spacer(1, 3 * mm),
    p("截图：截屏2026-07-27 13.24.54.png", small),
    Spacer(1, 4 * mm),
    p("3. 下发推荐函描述增加公司简称", h3),
    prepared_image(DESCRIPTION_IMAGE, "description_reference.jpg", 34 * mm),
    Spacer(1, 3 * mm),
    p("截图：iwEdAqNwbmcDAQTRB20F0QHZBrA-taF8QDaQRwo6EdwFwTgAB9JtH5V0CAAJomltCgAL0gACUEE.png", small),
]

doc.build(story)
print(OUTPUT)
