from docx import Document


path = "/Users/guocc/Documents/guquan/files/gq-gzt/需求/规划编制/0727需求更改/规划编制需求变更说明_20260727.docx"
document = Document(path)

for paragraph in document.paragraphs:
    if paragraph.text.strip() == "三、本次变更范围":
        paragraph.paragraph_format.page_break_before = True
        break
else:
    raise RuntimeError("未找到“三、本次变更范围”标题")

document.save(path)
