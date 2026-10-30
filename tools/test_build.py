#!/usr/bin/env python3
"""Testes do gerador incremental (stdlib somente): python -m unittest tools.test_build"""
import importlib.util
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

SOURCE = Path(__file__).resolve().parents[1]


class IncrementalBuildTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='curso-build-test-')
        self.root = Path(self.temp.name)
        for name in ('curso.json',):
            shutil.copy2(SOURCE / name, self.root / name)
        for name in ('assets', 'templates', 'conteudo', 'componentes', 'tools'):
            shutil.copytree(SOURCE / name, self.root / name)

    def tearDown(self):
        self.temp.cleanup()

    def run_script(self, name, should_succeed=True):
        result = subprocess.run(
            [sys.executable, str(self.root / 'tools' / name)],
            cwd=self.root, text=True, capture_output=True, encoding='utf-8'
        )
        if should_succeed:
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        else:
            self.assertNotEqual(result.returncode, 0)
        return result

    def test_first_build_and_second_build_preserves_identical_files(self):
        self.run_script('build.py')
        self.run_script('validate.py')
        css = self.root / 'docs/assets/css/site.css'
        index = self.root / 'docs/index.html'
        css_stat = css.stat().st_mtime_ns
        index_stat = index.stat().st_mtime_ns
        again = self.run_script('build.py')
        self.assertIn('0 criados/alterados', again.stdout)
        self.assertEqual(css_stat, css.stat().st_mtime_ns)
        self.assertEqual(index_stat, index.stat().st_mtime_ns)
        self.run_script('validate.py')

    def test_edit_only_updates_affected_file(self):
        self.run_script('build.py')
        index = self.root / 'docs/index.html'
        old_mtime = index.stat().st_mtime_ns
        css_src = self.root / 'assets/css/site.css'
        css_src.write_text(css_src.read_text(encoding='utf-8') + '\n/* test */\n', encoding='utf-8')
        self.run_script('build.py')
        self.assertIn('/* test */', (self.root / 'docs/assets/css/site.css').read_text(encoding='utf-8'))
        self.assertEqual(old_mtime, index.stat().st_mtime_ns)

    def test_unpublish_removes_old_html_and_markdown(self):
        self.run_script('build.py')
        index = self.root / 'docs/index.html'
        self.assertIn('href="aulas/03-wls.html"', index.read_text(encoding='utf-8'))
        data = json.loads((self.root / 'curso.json').read_text(encoding='utf-8'))
        data['lessons'][2]['published'] = False
        (self.root / 'curso.json').write_text(json.dumps(data, ensure_ascii=False), encoding='utf-8')
        result = self.run_script('build.py')
        self.assertIn('2 obsoletos removidos', result.stdout)
        self.assertFalse((self.root / 'docs/aulas/03-wls.html').exists())
        self.assertFalse((self.root / 'docs/conteudo/03-wls.md').exists())
        self.assertNotIn('href="aulas/03-wls.html"', index.read_text(encoding='utf-8'))
        self.run_script('validate.py')

    def test_existing_docs_without_manifest_are_migrated(self):
        self.run_script('build.py')
        (self.root / 'docs/.site-build-manifest.json').unlink()
        data = json.loads((self.root / 'curso.json').read_text(encoding='utf-8'))
        data['lessons'][2]['published'] = False
        (self.root / 'curso.json').write_text(json.dumps(data, ensure_ascii=False), encoding='utf-8')
        self.run_script('build.py')
        self.assertFalse((self.root / 'docs/aulas/03-wls.html').exists())
        self.run_script('validate.py')

    def test_invalid_missing_source_does_not_destroy_existing_site(self):
        self.run_script('build.py')
        index = self.root / 'docs/index.html'
        content = index.read_bytes()
        (self.root / 'conteudo/01-introducao.md').unlink()
        self.run_script('build.py', should_succeed=False)
        self.assertEqual(content, index.read_bytes())

    def test_atomic_replace_failure_preserves_destination(self):
        path = self.root / 'existing.css'
        path.write_text('existing', encoding='utf-8')
        spec = importlib.util.spec_from_file_location('build_test_module', self.root / 'tools/build.py')
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        with patch.object(mod, 'ATTEMPTS', 2), patch.object(mod.time, 'sleep'), \
             patch.object(mod.os, 'replace', side_effect=PermissionError('locked')):
            with self.assertRaises(PermissionError):
                mod.write_if_changed(path, b'new data')
        self.assertEqual('existing', path.read_text(encoding='utf-8'))
        self.assertFalse(list(self.root.glob('.build-*.tmp')))


if __name__ == '__main__':
    unittest.main()
