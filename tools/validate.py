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
for lesson in LESSONS:
    slug=lesson['slug']
    assert (DOCS/'aulas'/f'{slug}.html').is_file()
    assert (DOCS/'conteudo'/f'{slug}.md').is_file()
    md=(DOCS/'conteudo'/f'{slug}.md').read_text(encoding='utf-8')
    assert md.count('\n---\n')>=5, f'Aula tem poucos slides: {slug}'
    if lesson.get('demo'):
        assert f'data-demo="{lesson["demo"]}"' in (DOCS/'aulas'/f'{slug}.html').read_text(encoding='utf-8')
print(f'✓ Verificados {len(htmls)} arquivos HTML e {len(LESSONS)} aulas.')
