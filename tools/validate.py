#!/usr/bin/env python3
"""Verificações básicas da estrutura estática e dos links internos (sem dependências)."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse
import json
import re

ROOT=Path(__file__).resolve().parents[1]
DOCS=ROOT/'docs'
LESSONS=json.loads((ROOT/'curso.json').read_text(encoding='utf-8'))['lessons']

class LinkChecker(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls=[]
    def handle_starttag(self, tag, attrs):
        props=dict(attrs)
        for key in ('href','src','data-src','data-markdown'):
            if key in props and tag not in ('svg','animateMotion'):
                self.urls.append(props[key])

assert (DOCS/'index.html').is_file(), 'Site não foi gerado.'
assert len(LESSONS)>=1
htmls=list(DOCS.rglob('*.html'))
for page in htmls:
    text=page.read_text(encoding='utf-8')
    assert '<!doctype html>' in text.lower(), f'HTML inválido: {page}'
    assert '<html lang="en">' in text, f'Page language must be English: {page}'
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
    assert 'source-slide' not in md and 'assets/disciplinas/' not in md, f'Recorte de slide original: {slug}'
    # Valida os recursos citados pelo Markdown, inclusive figuras vetoriais.
    urls=re.findall(r'\]\(([^\s)]+)\)', md)
    embedded=LinkChecker();embedded.feed(md)
    urls.extend(embedded.urls)
    for url in urls:
        parts=urlparse(url)
        if parts.scheme or parts.netloc or not parts.path:
            continue
        assert (html_path.parent/unquote(parts.path)).is_file(), f'Recurso da aula ausente: {slug}: {url}'
    assert md.count('\n---\n')>=5, f'Aula tem poucos slides: {slug}'
    for line in md.splitlines():
        if line.lstrip().startswith('|'):
            for formula in re.findall(r'\$(.+?)\$',line):
                assert '|' not in formula, f'Use \\lvert/\\rvert, \\lVert/\\rVert, or \\mid for math inside Markdown tables: {slug}'
    if lesson.get('demo'):
        lesson_html=html_path.read_text(encoding='utf-8')
        assert f'data-demo="{lesson["demo"]}"' in lesson_html
        assert lesson_html.index('data-markdown=') < lesson_html.index('data-demo='), 'Laboratory must follow theory'
        assert re.search(r'<section[^>]+data-demo=[\s\S]*?</section>\s*</div></div>',lesson_html), 'Laboratory must be the final slide'
        assert 'data-demo=' not in md, 'Laboratories belong after the Markdown theory'
sources=ROOT/'conteudo/fontes-2024.json'
references=ROOT/'conteudo/bibliografia.json'
if references.is_file():
    bibliography=json.loads(references.read_text(encoding='utf-8'))
    books={b['id']:b for b in bibliography['books']}
    assert set(books)=={'AE04','M99','BLC'}, 'Incomplete textbook bibliography'
    assert set(bibliography['lessons'])=={l['id'] for l in LESSONS}, 'Reading guides must cover every lesson'
    assert all(len(b['sha256'])==64 and b['pdf_pages']>0 for b in books.values())
    for lesson in LESSONS:
        md=(ROOT/'conteudo'/f"{lesson['slug']}.md").read_text(encoding='utf-8')
        assert '## Textbook foundations' in md and '## References' in md
        assert not re.search(r'\[(AE04|M99|BLC)\]',md), f"Non-numeric citation: {lesson['id']}"
        readings=bibliography['lessons'][lesson['id']]
        numbers=[r['number'] for r in readings]
        assert numbers==list(range(1,len(readings)+1)), f"Non-sequential references: {lesson['id']}"
        assert all(r['book'] in books for r in readings)
        body,reference_section=md.split('## References',1)
        listed=[int(n) for n in re.findall(r'^\*\*\[(\d+)\]\*\*',reference_section,re.M)]
        cited=list(dict.fromkeys(int(n) for n in re.findall(r'\[(\d+)\]',body)))
        assert cited==listed==numbers, f"Numeric citation/reference mismatch: {lesson['id']}"
        assert md.index('## Textbook foundations')<md.index('## References')
    print('✓ Textbook bibliography and reading guides cover all 13 lessons.')
if sources.is_file():
    manifest=json.loads(sources.read_text(encoding='utf-8'))
    assert {s['lesson'] for s in manifest['sources']} == {l['id'] for l in LESSONS}, 'Fontes não cobrem a grade'
    assert manifest.get('format')=='markdown-latex'
    for source in manifest['sources']:
        assert len(source['sha256']) == 64
        assert 'slides' not in source, 'Inventário não deve publicar recortes dos PDFs'
    assert len(manifest['lists']) == 8
    for entry in manifest['lists']:
        assert (ROOT/entry['asset']).is_file(), f"Lista ausente: {entry['asset']}"
    assert not list((DOCS/'assets/disciplinas').rglob('*.webp')), 'Recortes antigos ainda publicados'
    print(f'✓ Rastreabilidade: {len(manifest["sources"])} fontes, Markdown/LaTeX e 8 listas.')
print(f'✓ Verificados {len(htmls)} arquivos HTML e {published_count}/{len(LESSONS)} aulas publicadas.')
