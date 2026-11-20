"""Regression contract for the standalone homepage synchronizer.

Run after installing the rewritten, environment-aware script:
    python3 -m unittest discover -s _tests -p 'sync_homepage_test.py' -v

SYNC_HOMEPAGE_SCRIPT selects a different script. Every invocation overrides all
five directory settings with disposable fixture paths; never run the old script
that ignores those settings. Set SYNC_HOMEPAGE_TEST_CONTAINMENT=1 to additionally
exercise optional embedded-attachment traversal rejection.

Deletion verification must inspect destination files and backups, not merely the
exit code: a fixture run of the native rsync implementation returned success
while leaving an obsolete Markdown file in place.
"""

import ast
import contextlib
import io
import os
from pathlib import Path
import re
import subprocess
import tempfile
import unittest
from unittest.mock import patch


SCRIPT = Path(os.environ.get(
    "SYNC_HOMEPAGE_SCRIPT",
    "/Users/wenliu/Code/RayCast/Extensions/sync_homepage.sh",
)).expanduser().resolve()
DIRECTORY_VARIABLES = (
    "SOURCE_FOLDER", "TARGET_FOLDER", "ATTACHMENT_SOURCE",
    "ATTACHMENT_TARGET", "BACKUP_ROOT",
)


def snapshot(root):
    """Capture structure, bytes and mtimes without following directory symlinks."""
    if not root.exists():
        return None
    result = {}
    for path in [root, *sorted(root.rglob("*"))]:
        key = str(path.relative_to(root))
        stat = path.lstat()
        if path.is_symlink():
            result[key] = ("symlink", os.readlink(path), stat.st_mtime_ns)
        elif path.is_dir():
            result[key] = ("directory", stat.st_mtime_ns)
        else:
            result[key] = ("file", path.read_bytes(), stat.st_mtime_ns)
    return result


class SyncHomepageTests(unittest.TestCase):
    def setUp(self):
        self.fixture = tempfile.TemporaryDirectory(prefix="sync-homepage-test-")
        self.addCleanup(self.fixture.cleanup)
        self.root = Path(self.fixture.name).resolve()
        self.source = self.root / "vault posts"
        self.target = self.root / "site" / "_posts"
        self.attachment_source = self.root / "vault attachments"
        self.attachment_target = self.root / "site" / "attachment"
        self.backup_root = self.root / "backups"
        self.paths = dict(zip(DIRECTORY_VARIABLES, (
            self.source, self.target, self.attachment_source,
            self.attachment_target, self.backup_root,
        )))
        for path in self.paths.values():
            path.mkdir(parents=True)
        self.assertEqual(self.target.name, "_posts")
        self.assertTrue(SCRIPT.is_file(), f"Synchronizer not found: {SCRIPT}")

    @staticmethod
    def write(path, content):
        path.parent.mkdir(parents=True, exist_ok=True)
        if isinstance(content, bytes):
            path.write_bytes(content)
        else:
            path.write_text(content, encoding="utf-8")
        return path

    def run_sync(self, *arguments, success=True):
        env = os.environ.copy()
        # Do not allow inherited production settings to leak into a subprocess.
        for name, path in self.paths.items():
            self.assertTrue(path.is_relative_to(self.root), str(path))
            env[name] = str(path)
        self.assertTrue(all(env[name] == str(self.paths[name])
                            for name in DIRECTORY_VARIABLES))
        completed = subprocess.run(
            ["/bin/bash", str(SCRIPT), *arguments],
            cwd=self.root, env=env, capture_output=True, text=True, timeout=30,
        )
        diagnostic = (f"exit={completed.returncode}\n"
                      f"stdout:\n{completed.stdout}\nstderr:\n{completed.stderr}")
        if success:
            self.assertEqual(completed.returncode, 0, diagnostic)
        else:
            self.assertNotEqual(completed.returncode, 0, diagnostic)
        return completed

    def fixture_program(self):
        # Load definitions only, never the script's production entrypoint.
        text = SCRIPT.read_text(encoding="utf-8").split("<<'PY'\n", 1)[1].rsplit("\nPY", 1)[0]
        tree = ast.parse(text, filename=str(SCRIPT))
        definitions = ast.Module(body=[node for node in tree.body if isinstance(
            node, (ast.Import, ast.ImportFrom, ast.FunctionDef, ast.ClassDef)
        )], type_ignores=[])
        namespace = {}
        exec(compile(definitions, str(SCRIPT), 'exec'), namespace)
        return namespace

    def test_icloud_metadata_updates_do_not_abort_content_snapshot(self):
        post = self.write(self.source / "post.md", "stable content\n")
        self.write(self.target / "post.md", "old content\n")
        program = self.fixture_program()
        read_bytes = Path.read_bytes
        reads = []

        def hydrate(path):
            data = read_bytes(path)
            if path == post:
                stat = path.stat()
                os.utime(path, ns=(stat.st_atime_ns, stat.st_mtime_ns + 1_000_000))
                reads.append(path)
            return data

        with patch.dict(os.environ, {name: str(path) for name, path in self.paths.items()}), \
             patch('sys.argv', ['sync_homepage']), \
             patch.object(Path, 'read_bytes', hydrate), contextlib.redirect_stdout(io.StringIO()):
            program['main']()
        self.assertGreaterEqual(len(reads), 4)
        self.assertEqual((self.target / post.name).read_text(), "stable content\n")
        self.assert_backup(post.name, b"old content\n")

    def test_real_content_change_during_staging_prevents_any_destination_change(self):
        post = self.write(self.source / "post.md", "initial content\n")
        self.write(self.target / "post.md", "old destination\n")
        self.write(self.target / "obsolete.md", "do not delete\n")
        program = self.fixture_program()
        read_bytes = Path.read_bytes
        count = 0
        before = [snapshot(path) for path in (self.target, self.attachment_target, self.backup_root)]

        def changed_content(path):
            nonlocal count
            if path == post:
                count += 1
                # Stable in each read pair, but truly different at final validation.
                return b"initial content\n" if count <= 2 else b"new content\n"
            return read_bytes(path)

        with patch.dict(os.environ, {name: str(path) for name, path in self.paths.items()}), \
             patch('sys.argv', ['sync_homepage']), \
             patch.object(Path, 'read_bytes', changed_content), contextlib.redirect_stdout(io.StringIO()):
            with self.assertRaises(program['SourceChanged']) as raised:
                program['main']()
        self.assertIn(post.name, str(raised.exception))
        self.assertEqual([snapshot(path) for path in (self.target, self.attachment_target, self.backup_root)], before)

    def markdown(self):
        return {path.name: path.read_bytes()
                for path in self.target.glob("*.md") if path.is_file()}

    def assert_backup(self, filename, content):
        matches = [path for path in self.backup_root.rglob(filename)
                   if path.is_file() and path.read_bytes() == content]
        self.assertTrue(matches, f"No intact backup of {filename!r} under "
                        f"{self.backup_root}")

    def test_mirror_add_update_rename_delete_and_preserve_non_posts(self):
        first = self.write(self.source / "2026-01-01-first.md", "first\n")
        second = self.write(self.source / "2026-01-02-second.md", "second\n")
        self.write(self.source / "notes.txt", "not a post\n")
        obsolete = self.write(self.target / "obsolete.md", b"obsolete original\n")
        keep = self.write(self.target / "keep.txt", "keep this\n")
        nested = self.write(self.target / "manual" / "nested.md", "nested keep\n")
        (self.target / "empty directory").mkdir()
        keep_before = snapshot(keep)
        nested_before = snapshot(self.target / "manual")
        source_before = snapshot(self.source)

        self.run_sync()
        self.assertEqual(self.markdown(), {
            first.name: b"first\n", second.name: b"second\n",
        })
        self.assertFalse(obsolete.exists())
        self.assert_backup("obsolete.md", b"obsolete original\n")
        self.assertEqual(snapshot(self.source), source_before)
        self.assertEqual(snapshot(keep), keep_before)
        self.assertEqual(snapshot(nested.parent), nested_before)
        self.assertTrue((self.target / "empty directory").is_dir())
        self.assertFalse((self.target / "notes.txt").exists())

        self.write(first, "first updated\n")
        renamed = second.with_name("2026-01-02-renamed 中文.md")
        second.rename(renamed)
        added = self.write(self.source / "2026-01-03-added.md", "added\n")
        source_before = snapshot(self.source)
        self.run_sync()
        self.assertEqual(self.markdown(), {
            first.name: b"first updated\n", renamed.name: b"second\n",
            added.name: b"added\n",
        })
        self.assert_backup(second.name, b"second\n")
        self.assertEqual(snapshot(self.source), source_before)

        added.unlink()
        source_before = snapshot(self.source)
        self.run_sync()
        self.assertEqual(self.markdown(), {
            first.name: b"first updated\n", renamed.name: b"second\n",
        })
        self.assert_backup(added.name, b"added\n")
        self.assertEqual(snapshot(self.source), source_before)
        self.assertEqual(snapshot(keep), keep_before)
        self.assertEqual(snapshot(nested.parent), nested_before)
        self.assertTrue((self.target / "empty directory").is_dir())
        # Backups from earlier runs must not be lost to timestamp collisions.
        self.assert_backup("obsolete.md", b"obsolete original\n")
        self.assert_backup(second.name, b"second\n")

    def test_embeds_convert_copy_and_repeated_sync_preserves_post_mtime(self):
        post = self.write(self.source / "2026-01-01-images.md",
                          "---\ntitle: Images\n---\n"
                          "Sized ![[image.png|300]]\n"
                          "Plain ![[image.png]]\n")
        self.write(self.attachment_source / "image.png", b"fixture image bytes\x00")
        source_before = snapshot(self.source)
        attachments_before = snapshot(self.attachment_source)
        self.run_sync()
        output = self.target / post.name
        rendered = output.read_text(encoding="utf-8")
        self.assertNotIn("![[", rendered)
        liquid_image = (
            r"!\[image\.png\]\(\{\{\s*(['\"])/docs/attachment/image\.png"
            r"\1\s*\|\s*relative_url\s*\}\}\)"
        )
        self.assertRegex(rendered, liquid_image + r'\s*\{:\s*width=[\"\']300[\"\']\s*\}')
        self.assertRegex(rendered, r"Plain " + liquid_image + r"\s*\n")
        self.assertEqual(len(re.findall(liquid_image, rendered)), 2)
        self.assertEqual((self.attachment_target / "image.png").read_bytes(),
                         b"fixture image bytes\x00")
        self.assertEqual(snapshot(self.source), source_before)
        self.assertEqual(snapshot(self.attachment_source), attachments_before)

        # A deliberately old mtime detects unnecessary rewriting without sleeps.
        old_time = 946684800_000000000
        os.utime(output, ns=(old_time, old_time))
        before = snapshot(output)
        self.run_sync()
        self.assertEqual(snapshot(output), before)
        self.assertEqual(snapshot(self.source), source_before)
        self.assertEqual(snapshot(self.attachment_source), attachments_before)

    def test_unreferenced_attachments_are_never_deleted(self):
        post = self.write(self.source / "post.md", "![[used.png]]\n")
        self.write(self.attachment_source / "used.png", b"used")
        old = self.write(self.attachment_target / "old.png", b"old attachment")
        nested = self.write(self.attachment_target / "archive" / "keep.bin", b"keep")
        old_before, nested_before = snapshot(old), snapshot(nested.parent)
        self.run_sync()
        self.assertEqual(snapshot(old), old_before)
        self.assertEqual(snapshot(nested.parent), nested_before)
        used = self.attachment_target / "used.png"
        used_before = snapshot(used)
        self.write(post, "no embeds now\n")
        self.run_sync()
        self.assertEqual(snapshot(used), used_before)
        self.assertEqual(snapshot(old), old_before)
        self.assertEqual(snapshot(nested.parent), nested_before)

    def test_dry_run_has_no_mutations(self):
        self.write(self.source / "added.md", "![[new.png|300]]\n")
        self.write(self.source / "updated.md", "new content\n")
        self.write(self.attachment_source / "new.png", b"new image")
        self.write(self.target / "updated.md", "old content\n")
        self.write(self.target / "obsolete.md", "obsolete\n")
        self.write(self.target / "keep.txt", "keep\n")
        self.write(self.attachment_target / "old.png", b"old image")
        before = snapshot(self.root)
        self.run_sync("--dry-run")
        self.assertEqual(snapshot(self.root), before)

    def test_dry_run_does_not_create_absent_output_directories(self):
        self.write(self.source / "post.md", "![[image.png]]\n")
        self.write(self.attachment_source / "image.png", b"image")
        self.attachment_target.rmdir()
        self.backup_root.rmdir()
        before = snapshot(self.root)
        self.run_sync("--dry-run")
        self.assertEqual(snapshot(self.root), before)

    def test_missing_source_rejected_without_mutation(self):
        self.write(self.target / "existing.md", "do not delete\n")
        self.source.rmdir()
        before = snapshot(self.root)
        self.run_sync(success=False)
        self.assertEqual(snapshot(self.root), before)

    def test_empty_source_rejected_without_mutation(self):
        self.write(self.target / "existing.md", "do not delete\n")
        before = snapshot(self.root)
        self.run_sync(success=False)
        self.assertEqual(snapshot(self.root), before)

    def test_source_with_no_markdown_rejected_without_mutation(self):
        self.write(self.source / "notes.txt", "not markdown\n")
        self.write(self.target / "existing.md", "do not delete\n")
        before = snapshot(self.root)
        self.run_sync(success=False)
        self.assertEqual(snapshot(self.root), before)

    def test_missing_target_rejected_without_mutation(self):
        self.write(self.source / "post.md", "valid post\n")
        self.target.rmdir()
        before = snapshot(self.root)
        self.run_sync(success=False)
        self.assertEqual(snapshot(self.root), before)

    def test_missing_embedded_attachment_rejected_before_any_changes(self):
        # A valid earlier post catches implementations that validate as they copy.
        self.write(self.source / "a-valid.md", "![[exists.png]]\n")
        self.write(self.attachment_source / "exists.png", b"existing image")
        self.write(self.target / "a-valid.md", "old valid content\n")
        self.write(self.target / "obsolete.md", "must not disappear\n")
        self.write(self.attachment_target / "exists.png", b"old image")
        for embed in ("![[missing.png|300]]", "![[missing.png]]"):
            with self.subTest(embed=embed):
                self.write(self.source / "z-invalid.md", embed + "\n")
                before = snapshot(self.root)
                self.run_sync(success=False)
                self.assertEqual(snapshot(self.root), before)

    def test_unavailable_backup_prevents_obsolete_deletion(self):
        self.write(self.source / "post.md", "valid post\n")
        self.write(self.target / "post.md", "valid post\n")
        obsolete = self.write(self.target / "obsolete.md", "original obsolete content\n")
        self.backup_root.rmdir()
        self.write(self.backup_root, "a file cannot contain backups\n")
        before = snapshot(obsolete)
        self.run_sync(success=False)
        self.assertEqual(snapshot(obsolete), before)

    @unittest.skipUnless(os.environ.get("SYNC_HOMEPAGE_TEST_CONTAINMENT") == "1",
                         "optional traversal contract; enable when supported")
    def test_attachment_traversal_rejected_without_mutation(self):
        self.write(self.root / "outside.png", b"outside attachment source")
        self.write(self.source / "post.md", "![[../outside.png]]\n")
        self.write(self.target / "obsolete.md", "must not disappear\n")
        before = snapshot(self.root)
        self.run_sync(success=False)
        self.assertEqual(snapshot(self.root), before)


if __name__ == "__main__":
    unittest.main()
