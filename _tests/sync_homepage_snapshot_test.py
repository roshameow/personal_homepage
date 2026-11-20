"""Isolated tests for the synchronizer's content-stability helper.

Run with:
    python3 -m unittest discover -s _tests -p 'sync_homepage_snapshot_test.py' -v

SYNC_HOMEPAGE_SCRIPT overrides the script path. We only read that shell file,
parse its Python heredoc, and execute imports plus the two selected definitions.
The shell, main(), retry wrapper, and all other top-level statements never run.
All post reads are mocked: no production posts, destinations, or backups are used.

Verified safety method: filtering the AST before compile/exec allows testing a
helper embedded in an executable script without invoking its entry point.
Compatibility pitfall: macOS Python 3.9 lacks TestCase.enterContext; use
patcher.start() plus addCleanup(patcher.stop) instead.
"""

import ast
import os
from pathlib import Path
import re
import unittest
from unittest import mock


SCRIPT = Path(os.environ.get(
    "SYNC_HOMEPAGE_SCRIPT",
    "/Users/wenliu/Code/RayCast/Extensions/sync_homepage.sh",
)).expanduser()


def load_helpers(shell, filename="<sync_homepage.sh>"):
    """Load only imports, SourceChanged, and read_stable_post from a heredoc."""
    heredoc = re.search(r"<<'PY'[^\n]*\n(.*?)^PY[ \t]*$", shell,
                        flags=re.MULTILINE | re.DOTALL)
    if heredoc is None:
        raise AssertionError("Synchronizer must contain a <<'PY' heredoc")
    parsed = ast.parse(heredoc.group(1), filename=filename)
    selected = [
        node for node in parsed.body
        if isinstance(node, (ast.Import, ast.ImportFrom))
        or (isinstance(node, ast.ClassDef) and node.name == "SourceChanged")
        or (isinstance(node, ast.FunctionDef) and node.name == "read_stable_post")
    ]
    definitions = {node.name for node in selected
                   if isinstance(node, (ast.ClassDef, ast.FunctionDef))}
    if definitions != {"SourceChanged", "read_stable_post"}:
        raise AssertionError("Synchronizer is missing its stable snapshot helpers")
    namespace = {"__name__": "snapshot_helpers_under_test"}
    isolated = ast.Module(body=selected, type_ignores=[])
    exec(compile(isolated, filename, "exec"), namespace)
    return namespace


class HelperIsolationTests(unittest.TestCase):
    def test_entrypoint_and_other_top_level_statements_are_not_executed(self):
        namespace = load_helpers("""#!/bin/bash
python3 - <<'PY'
import pathlib
class SourceChanged(RuntimeError):
    pass

def read_stable_post(path):
    return path.read_bytes()

def main():
    raise AssertionError('main must never run')

raise AssertionError('top-level statements must never run')
try:
    main()
except RuntimeError:
    pass
PY
""")
        self.assertNotIn("main", namespace)
        self.assertTrue(issubclass(namespace["SourceChanged"], RuntimeError))
        path = mock.Mock()
        path.read_bytes.return_value = b"isolated"
        self.assertEqual(namespace["read_stable_post"](path), b"isolated")


class StablePostTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # This is the only real file read: the shell source, never a post.
        cls.helpers = load_helpers(SCRIPT.read_text(encoding="utf-8"), str(SCRIPT))

    def setUp(self):
        self.read_stable_post = self.helpers["read_stable_post"]
        self.source_changed = self.helpers["SourceChanged"]
        self.assertTrue(issubclass(self.source_changed, RuntimeError))
        sleep_patch = mock.patch("time.sleep")
        self.sleep = sleep_patch.start()
        self.addCleanup(sleep_patch.stop)
        # Also support a direct `from time import sleep` in the helper module.
        if "sleep" in self.helpers:
            direct_patch = mock.patch.dict(self.helpers, {"sleep": self.sleep})
            direct_patch.start()
            self.addCleanup(direct_patch.stop)
        self.path = mock.MagicMock(spec=Path)
        self.path.name = "2026-10-12-icloud-post.md"
        self.path.__str__.return_value = "/mock-vault/" + self.path.name
        self.path.stat.side_effect = AssertionError("Snapshot must not inspect stat/mtime")
        self.path.lstat.side_effect = AssertionError("Snapshot must not inspect lstat/mtime")

    def assert_no_metadata_reads(self):
        self.path.stat.assert_not_called()
        self.path.lstat.assert_not_called()

    def test_metadata_only_changes_do_not_invalidate_equal_bytes(self):
        content = b"same content\n"
        self.path.st_mtime_ns = 100

        def read_with_metadata_churn():
            self.path.st_mtime_ns += 100
            return content

        self.path.read_bytes.side_effect = read_with_metadata_churn
        self.assertEqual(self.read_stable_post(self.path), content)
        self.assertEqual(self.path.read_bytes.call_count, 2)
        self.assertEqual(self.path.st_mtime_ns, 300)
        self.assert_no_metadata_reads()

    def test_content_change_then_stable_pair_returns_latest_bytes(self):
        old, latest = b"old content\n", b"new content\n"
        self.path.read_bytes.side_effect = [old, latest, latest, latest]
        self.assertEqual(self.read_stable_post(self.path), latest)
        self.assertEqual(self.path.read_bytes.call_count, 4)
        self.assert_no_metadata_reads()

    def test_transient_oserror_on_either_read_is_retried(self):
        content = b"download complete\n"
        for reads in ([OSError("iCloud unavailable"), content, content],
                      [content, OSError("iCloud unavailable"), content, content]):
            with self.subTest(error_on_read=1 if isinstance(reads[0], OSError) else 2):
                self.path.read_bytes.reset_mock(side_effect=True)
                self.path.read_bytes.side_effect = reads
                self.assertEqual(self.read_stable_post(self.path), content)
                self.assertEqual(self.path.read_bytes.call_count, len(reads))
                self.assert_no_metadata_reads()

    def test_permanently_changing_content_raises_named_sourcechanged(self):
        # Every pair differs, so all five attempts must fail, without a sixth.
        self.path.read_bytes.side_effect = [str(i).encode("ascii") for i in range(10)]
        with self.assertRaises(self.source_changed) as caught:
            self.read_stable_post(self.path)
        self.assertIn(self.path.name, str(caught.exception))
        self.assertEqual(self.path.read_bytes.call_count, 10)
        self.assert_no_metadata_reads()

    def test_persistent_oserror_exhausts_five_attempts(self):
        self.path.read_bytes.side_effect = OSError("iCloud unavailable")
        with self.assertRaises(self.source_changed) as caught:
            self.read_stable_post(self.path)
        self.assertIn(self.path.name, str(caught.exception))
        self.assertEqual(self.path.read_bytes.call_count, 5)
        self.assert_no_metadata_reads()

    def test_stable_content_never_requires_stat(self):
        self.path.read_bytes.return_value = b"stable\n"
        self.assertEqual(self.read_stable_post(self.path), b"stable\n")
        self.assert_no_metadata_reads()

    def test_utf8_unicode_bytes_are_preserved_exactly(self):
        # Include BOM, CRLF, combining marks, CJK, and emoji: no normalization.
        content = "\ufeff---\r\ntitle: 云端 ☁️\r\n---\r\ncafe\u0301 / café / 🐎\r\n".encode("utf-8")
        self.path.read_bytes.side_effect = [content, content]
        actual = self.read_stable_post(self.path)
        self.assertIsInstance(actual, bytes)
        self.assertEqual(actual, content)
        self.assertEqual(self.path.read_bytes.call_count, 2)
        self.assert_no_metadata_reads()


if __name__ == "__main__":
    unittest.main()
