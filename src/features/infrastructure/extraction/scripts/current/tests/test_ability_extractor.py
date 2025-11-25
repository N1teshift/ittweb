from __future__ import annotations

import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

import sys

CURRENT_DIR = Path(__file__).resolve().parent
SCRIPT_ROOT = CURRENT_DIR.parent
if str(SCRIPT_ROOT) not in sys.path:
    sys.path.insert(0, str(SCRIPT_ROOT))

from modules.ability_extractor import extract_abilities


ABILITY_FILE_CONTENT = """
let TOOLTIP_NORM = "Test Ability"
let TOOLTIP_EXTENDED = "Deals damage"
let COOLDOWN = 10.
let MANACOST = 25
let DURATION = 3.

new MixHerbSpell(ABILITY_TEST_ABILITY, 0)
""".strip()


class AbilityExtractorTest(unittest.TestCase):
    def test_extracts_basic_fields(self):
        with TemporaryDirectory() as tmp_dir:
            ability_path = Path(tmp_dir) / "hunter" / "TestAbility.wurst"
            ability_path.parent.mkdir(parents=True, exist_ok=True)
            ability_path.write_text(ABILITY_FILE_CONTENT, encoding="utf-8")

            abilities = extract_abilities(
                ability_files=[ability_path],
                descriptions={"test-ability": {"description": "Overridden desc"}},
            )

            self.assertEqual(len(abilities), 1)
            ability = abilities[0]
            self.assertEqual(ability["id"], "test-ability")
            self.assertEqual(ability["name"], "Test Ability")
            self.assertEqual(ability["category"], "hunter")
            self.assertEqual(ability["manaCost"], 25)
            self.assertEqual(ability["cooldown"], 10.0)
            self.assertEqual(ability["duration"], 3.0)
            self.assertEqual(ability["description"], "Overridden desc")


if __name__ == "__main__":
    unittest.main()

