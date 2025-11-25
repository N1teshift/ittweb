from __future__ import annotations

from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
import sys

CURRENT_DIR = Path(__file__).resolve().parent
SCRIPT_ROOT = CURRENT_DIR.parent
if str(SCRIPT_ROOT) not in sys.path:
    sys.path.insert(0, str(SCRIPT_ROOT))

from modules.description_extractor import extract_descriptions_from_directory


DESCRIPTION_CONTENT = """
let TOOLTIP_NORM = "Basic tooltip"
let TOOLTIP_EXTENDED = "Extended tooltip details"
new AbilityDefinition(ABILITY_TEST_DESCRIPTION)
""".strip()


class DescriptionExtractorTest(unittest.TestCase):
    def test_extracts_description(self):
        with TemporaryDirectory() as tmp_dir:
            file_path = Path(tmp_dir) / "mage" / "TestDescription.wurst"
            file_path.parent.mkdir(parents=True, exist_ok=True)
            file_path.write_text(DESCRIPTION_CONTENT, encoding="utf-8")

            descriptions = extract_descriptions_from_directory(Path(tmp_dir))
            self.assertIn("test-description", descriptions)
            entry = descriptions["test-description"]
            self.assertEqual(entry["description"], "Extended tooltip details")


if __name__ == "__main__":
    unittest.main()

