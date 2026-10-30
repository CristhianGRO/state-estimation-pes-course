#!/usr/bin/env python3
"""Verificações básicas da estrutura estática e dos links internos (sem dependências)."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse
import json

ROOT=Path(__file__).resolve().parents[1]
DOCS=ROOT/'docs'
LESSONS=json.loads((ROOT/'curso.json').read_text(encoding='utf-8'))['lessons']

class LinkChecker(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls=[]
    def handle_starttag(self, tag, attrs):
        props=dict(attrs)
        for key in ('href','src','data-markdown'):
            if key in props and tag not in ('svg','animateMotion'):
                self.urls.append(props[key])

assert (DOCS/'index.html').is_file(), 'Site não foi gerado.'
assert len(LESSONS)>=1
htmls=list(DOCS.rglob('*.html'))
for page in htmls:
    text=page.read_text(encoding='utf-8')
    assert '<!doctype html>' in text.lower(), f'HTML inválido: {page}'
    assert '{{' not in text, f'Placeholder não resolvido: {page}'
    parser=LinkChecker();parser.feed(text)
    for url in parser.urls:
        parts=urlparse(url)
        if parts.scheme or parts.netloc or not parts.path or parts.path.startswith('#'):
            continue
        absolute=(page.parent/unquote(parts.path)).resolve()
        if not absolute.is_file():
            raise AssertionError(f'Link não encontrado em {page.relative_to(DOCS)}: {url}')
index=(DOCS/'index.html').read_text(encoding='utf-8')
published_count=0
for lesson in LESSONS:
    slug=lesson['slug']
    published=lesson.get('published', True)
    assert isinstance(published, bool), f'published deve ser true/false: {slug}'
    html_path=DOCS/'aulas'/f'{slug}.html'
    md_path=DOCS/'conteudo'/f'{slug}.md'
    if not published:
        assert not html_path.exists(), f'Aula indisponível foi publicada: {slug}'
        assert not md_path.exists(), f'Markdown indisponível foi publicado: {slug}'
        assert f'href="aulas/{slug}.html"' not in index, f'Link ativo para aula indisponível: {slug}'
        continue
    published_count += 1
    assert html_path.is_file()
    assert md_path.is_file()
    md=md_path.read_text(encoding='utf-8')
    assert md.count('\n---\n')>=5, f'Aula tem poucos slides: {slug}'
    if lesson.get('demo'):
        assert f'data-demo="{lesson["demo"]}"' in html_path.read_text(encoding='utf-8')
print(f'✓ Verificados {len(htmls)} arquivos HTML e {published_count}/{len(LESSONS)} aulas publicadas.')
