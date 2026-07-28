from pathlib import Path
from PIL import Image, ImageDraw

source = Path("/Users/guocc/Documents/guquan/files/gq-gzt/tmp/comprehensive-prd-rendered-final")
pages = sorted(source.glob("page-*.png"), key=lambda p: int(p.stem.split("-")[1]))

for start in range(0, len(pages), 8):
    group = pages[start : start + 8]
    thumbs = []
    for path in group:
        image = Image.open(path).convert("RGB")
        image.thumbnail((420, 594))
        canvas = Image.new("RGB", (440, 630), "white")
        canvas.paste(image, ((440 - image.width) // 2, 26))
        ImageDraw.Draw(canvas).text((12, 7), path.stem, fill="black")
        thumbs.append(canvas)
    sheet = Image.new("RGB", (1760, 1260), "#d9d9d9")
    for index, thumb in enumerate(thumbs):
        sheet.paste(thumb, ((index % 4) * 440, (index // 4) * 630))
    sheet.save(source / f"contact-{start + 1:02d}-{start + len(group):02d}.png")
