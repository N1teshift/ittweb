"""Tests for item_stats_extractor module."""

import tempfile
import unittest
from pathlib import Path

from modules.item_stats_extractor import extract_item_stats_from_file


class ItemStatsExtractorTest(unittest.TestCase):
    """Test item stats extraction."""

    def test_extracts_item_stats(self):
        """Test extraction of item stats from Wurst file."""
        with tempfile.TemporaryDirectory() as tmpdir:
            test_file = Path(tmpdir) / "test_item.wurst"
            test_file.write_text(
                """
new CustomItemType(ITEM_TEST_SWORD)
    ..addBonusDamage(15)
    ..addBonusArmor(5)
    ..addBonusStrength(10)

new CustomItemType(ITEM_TEST_SHIELD)
    ..addBonusArmor(20)
    ..addBonusAgility(5)
    ..addBonusLife(100)
"""
            )

            stats = extract_item_stats_from_file(test_file)

            self.assertIn("item-test-sword", stats)
            self.assertEqual(stats["item-test-sword"]["damage"], 15)
            self.assertEqual(stats["item-test-sword"]["armor"], 5)
            self.assertEqual(stats["item-test-sword"]["strength"], 10)

            self.assertIn("item-test-shield", stats)
            self.assertEqual(stats["item-test-shield"]["armor"], 20)
            self.assertEqual(stats["item-test-shield"]["agility"], 5)
            self.assertEqual(stats["item-test-shield"]["health"], 100)

    def test_handles_missing_file(self):
        """Test handling of non-existent file."""
        stats = extract_item_stats_from_file(Path("/nonexistent/file.wurst"))
        self.assertEqual(stats, {})

    def test_handles_empty_file(self):
        """Test handling of empty file."""
        with tempfile.TemporaryDirectory() as tmpdir:
            test_file = Path(tmpdir) / "empty.wurst"
            test_file.write_text("")

            stats = extract_item_stats_from_file(test_file)
            self.assertEqual(stats, {})

