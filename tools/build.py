#!/usr/bin/env python3
"""Gera site estático em docs/ a partir dos materiais editáveis, sem dependências Python."""
import json
import html
from pathlib import Path
from shutil import copytree, copyfile, rmtree
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / 'docs'
DATA = json.loads((ROOT / 'curso.json').read_text(encoding='utf-8'))
COURSE, LESSONS = DATA['course'], DATA['lessons']

def esc(text):
    return html.escape(str(text), quote=True)

def render(source, replacements):
    for k, v in replacements.items():
        source = source.replace('{{' + k + '}}', str(v))
    if '{{' in source:
        raise ValueError('Placeholder sem valor encontrado: ' + source[source.index('{{'):source.index('{{')+80])
    return source

def lesson_card(lesson):
    slug = esc(lesson['slug'])
    tags = ''.join(f'<span>{esc(t)}</span>' for t in lesson['topics'])
    return f'''<a class="lesson-card" href="aulas/{slug}.html" data-search="{esc(' '.join([lesson['title'], lesson['subtitle'], *lesson['topics']]).lower())}">
    <div class="card-head"><span class="lesson-n">AULA {esc(lesson['id'])}</span><span class="lesson-clock">{int(lesson['minutes'])} MIN</span></div>
    <h3>{esc(lesson['title'])}</h3><p>{esc(lesson['subtitle'])}</p>
    <div class="tag-row">{tags}</div><div class="card-bottom"><span>{'COM LABORATÓRIO' if lesson['demo'] else 'AULA TEÓRICA'}</span><span aria-hidden="true">↗</span></div></a>'''

if TARGET.exists():
    rmtree(TARGET)
(TARGET / 'aulas').mkdir(parents=True)
(TARGET / 'conteudo').mkdir()
copytree(ROOT / 'assets', TARGET / 'assets')

main = (ROOT / 'templates/index.html').read_text(encoding='utf-8')
main = render(main, {
    'DESCRIPTION': esc(COURSE['description']), 'TITLE': esc(COURSE['title']),
    'CODE': esc(COURSE['code']), 'YEAR': esc(COURSE['year']),
    'SUBTITLE': esc(COURSE['subtitle']), 'AUTHOR': esc(COURSE['author']),
    'LESSON_CARDS': ''.join(lesson_card(l) for l in LESSONS)
})
(TARGET / 'index.html').write_text(main, encoding='utf-8')
slide_tpl = (ROOT / 'templates/slide.html').read_text(encoding='utf-8')
for i, lesson in enumerate(LESSONS):
    md = ROOT / 'conteudo' / f"{lesson['slug']}.md"
    if not md.is_file():
        raise FileNotFoundError(md)
    copyfile(md, TARGET / 'conteudo' / md.name)
    demo = lesson.get('demo')
    section = ''
    if demo:
        fragment = ROOT / 'componentes' / f'{demo}.html'
        section = fragment.read_text(encoding='utf-8')
    prev = f"{LESSONS[i-1]['slug']}.html" if i else '#'
    following = f"{LESSONS[i+1]['slug']}.html" if i+1 < len(LESSONS) else '#'
    doc = render(slide_tpl, {
        'COURSE_TITLE': esc(COURSE['title']), 'LESSON_TITLE': esc(lesson['title']),
        'LESSON_ID': esc(lesson['id']), 'LESSON_SHORT': esc(lesson['title']),
        'LESSON_SLUG': esc(lesson['slug']), 'DEMO_SECTION': section,
        'PREV_LINK': prev, 'NEXT_LINK': following,
        'PREV_DISABLED': 'aria-disabled="true"' if i == 0 else '',
        'NEXT_DISABLED': 'aria-disabled="true"' if i+1 == len(LESSONS) else ''
    })
    (TARGET / 'aulas' / f"{lesson['slug']}.html").write_text(doc, encoding='utf-8')
(TARGET / '.nojekyll').write_text('', encoding='utf-8')
print(f'✓ Site gerado em {TARGET} ({len(LESSONS)} aulas; ' +
      f'{sum(bool(l.get("demo")) for l in LESSONS)} laboratórios).')
