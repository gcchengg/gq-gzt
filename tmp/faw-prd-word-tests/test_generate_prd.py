import importlib.util
import re
import sys
import unittest
import zipfile
from pathlib import Path

from docx import Document


WORKSPACE = Path("/Users/guocc/Documents/guquan/files/gq-gzt")
SKILL = WORKSPACE / "tmp/faw-prd-word-stage/faw-prd-word"
FIXTURE = WORKSPACE / "tmp/faw-prd-word-tests/confirmed-example.md"
OUTPUT = WORKSPACE / "tmp/faw-prd-word-tests/output/example-prd.docx"


def load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


class GeneratePrdTests(unittest.TestCase):
    def test_generator_creates_branded_editable_docx(self):
        generator = load_module("generate_prd_docx", SKILL / "scripts/generate_prd_docx.py")
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        generator.generate(FIXTURE, OUTPUT)

        self.assertTrue(OUTPUT.exists())
        document = Document(OUTPUT)
        text = "\n".join(p.text for p in document.paragraphs)
        self.assertIn("规划编制需求变更说明", text)
        self.assertIn("需求背景", text)
        self.assertIn("只显示该参股公司的战略任务", text)
        self.assertNotIn("待确认", text)

        with zipfile.ZipFile(OUTPUT) as archive:
            document_xml = archive.read("word/document.xml").decode("utf-8")
            styles_xml = archive.read("word/styles.xml").decode("utf-8")
            media = [n for n in archive.namelist() if n.startswith("word/media/")]

        combined = document_xml + styles_xml
        self.assertIn("152A8C", combined)
        self.assertIn("C00000", combined)
        self.assertGreaterEqual(len(media), 2)  # FAW logo plus referenced screenshot
        self.assertRegex(document_xml, r"<w:tbl\b")

    def test_validator_accepts_generated_docx(self):
        generator = load_module("generate_prd_docx_validation", SKILL / "scripts/generate_prd_docx.py")
        validator = load_module("validate_prd_docx", SKILL / "scripts/validate_prd_docx.py")
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        generator.generate(FIXTURE, OUTPUT)
        result = validator.validate(OUTPUT, FIXTURE)
        self.assertTrue(result["valid"])
        self.assertGreaterEqual(result["embedded_images"], 2)
        self.assertGreaterEqual(result["headings"], 1)


if __name__ == "__main__":
    unittest.main()
