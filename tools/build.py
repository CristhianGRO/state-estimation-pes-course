#!/usr/bin/env python3
"""Gera docs/ incrementalmente, adequado a diretórios sincronizados com OneDrive.

- Nunca remove o diretório docs/ nem recria arquivos que não mudaram.
- Atualiza os arquivos alterados por substituição atômica, com retentativas.
- Exclui apenas saídas obsoletas de aulas/assets gerados, sem remover pastas.
- Respeita published=false, inclusive quando a aula já foi publicada antes.
"""
import html
import json
import os
import tempfile
import time
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / 'docs'
MANIFEST = '.site-build-manifest.json'
ATTEMPTS = 6


def esc(text):
    return html.escape(str(text), quote=True)


def render(source, replacements):
    for key, value in replacements.items():
        source = source.replace('{{' + key + '}}', str(value))
    if '{{' in source:
        start = source.index('{{')
        raise ValueError('Placeholder sem valor: ' + source[start:start + 80])
    return source


def is_published(lesson):
    """Sem o campo = publicada; false explícito = indisponível."""
    value = lesson.get('published', True)
    if not isinstance(value, bool):
        raise ValueError(f'Aula {lesson["id"]}: published deve ser true ou false no JSON')
    return value


def lesson_card(lesson):
    available = is_published(lesson)
    slug = esc(lesson['slug'])
    tags = ''.join(f'<span>{esc(tag)}</span>' for tag in lesson['topics'])
    terms = esc(' '.join([lesson['title'], lesson['subtitle'], *lesson['topics']]).lower())
    body = (f'<div class="card-head"><span class="lesson-n">LESSON {esc(lesson["id"])}</span>'
            f'<span class="lesson-clock">{int(lesson["minutes"])} MIN</span></div>'
            f'<h3>{esc(lesson["title"])}</h3><p>{esc(lesson["subtitle"])}</p>'
            f'<div class="tag-row">{tags}</div>')
    if available:
        label = 'WITH LABORATORY' if lesson.get('demo') else 'THEORY LESSON'
        return (f'<a class="lesson-card" href="aulas/{slug}.html" data-search="{terms}">'
                + body + f'<div class="card-bottom"><span>{label}</span>'
                '<span aria-hidden="true">↗</span></div></a>')
    return (f'<article class="lesson-card lesson-card--locked" data-search="{terms}" '
            f'aria-label="Lesson {esc(lesson["id"])} not yet available">' + body
            + '<div class="card-bottom"><span>COMING SOON</span>'
            '<span aria-hidden="true">🔒</span></div></article>')


def output_files():
    """Prepara todo o conteúdo antes de escrever em docs/.

    Um erro em curso.json, template, Markdown ou componente não altera o site.
    """
    data = json.loads((ROOT / 'curso.json').read_text(encoding='utf-8'))
    course, lessons = data['course'], data['lessons']
    published = [lesson for lesson in lessons if is_published(lesson)]
    result = {}

    if published:
        first = published[0]
        start = (f'<a class="cta" href="aulas/{esc(first["slug"])}.html">'
                 f'Start lesson {esc(first["id"])} <span aria-hidden="true">↗</span></a>')
    else:
        start = '<span class="cta cta-disabled">Lessons coming soon</span>'

    demo_lesson = next((lesson for lesson in published if lesson.get('demo')), None)
    if demo_lesson:
        demo_cta = (f'<a class="cta small" href="aulas/{esc(demo_lesson["slug"])}.html">'
                    f'Explore {esc(demo_lesson["title"])} ↗</a>')
    else:
        demo_cta = '<span class="cta small cta-disabled">Laboratories coming soon</span>'

    main = (ROOT / 'templates/index.html').read_text(encoding='utf-8')
    main = render(main, {
        'DESCRIPTION': esc(course['description']), 'TITLE': esc(course['title']),
        'GROUP': esc(course.get('group', course.get('institution','University of São Paulo'))),
        'CODE': esc(course['code']), 'YEAR': esc(course['year']),
        'SUBTITLE': esc(course['subtitle']), 'AUTHOR': esc(course['author']),
        'START_CTA': start, 'DEMO_CTA': demo_cta,
        'TOTAL_MODULES': len(lessons), 'AVAILABLE_LESSONS': len(published),
        'AVAILABLE_DEMOS': sum(bool(lesson.get('demo')) for lesson in published),
        'LESSON_CARDS': ''.join(lesson_card(lesson) for lesson in lessons)
    })
    result['index.html'] = main.encode('utf-8')

    template = (ROOT / 'templates/slide.html').read_text(encoding='utf-8')
    for index, lesson in enumerate(published):
        slug = lesson['slug']
        # O slug nunca deve poder escapar de docs/aulas ou docs/conteudo.
        if not isinstance(slug, str) or not slug or slug in {'.', '..'} or '/' in slug or '\\' in slug:
            raise ValueError(f'Slug inválido: {slug!r}')
        md = ROOT / 'conteudo' / (slug + '.md')
        result[f'conteudo/{slug}.md'] = md.read_bytes()
        demo = lesson.get('demo')
        section = ''
        if demo:
            if not isinstance(demo, str) or '/' in demo or '\\' in demo or demo in {'.', '..'}:
                raise ValueError(f'Demo inválida: {demo!r}')
            section = (ROOT / 'componentes' / f'{demo}.html').read_text(encoding='utf-8')
        prev_slug = published[index - 1]['slug'] if index else None
        next_slug = published[index + 1]['slug'] if index + 1 < len(published) else None
        slide = render(template, {
            'COURSE_TITLE': esc(course['title']), 'LESSON_TITLE': esc(lesson['title']),
            'LESSON_ID': esc(lesson['id']), 'LESSON_SHORT': esc(lesson['title']),
            'LESSON_SLUG': esc(slug), 'DEMO_SECTION': section,
            'PREV_LINK': f'{esc(prev_slug)}.html' if prev_slug else '#',
            'NEXT_LINK': f'{esc(next_slug)}.html' if next_slug else '#',
            'PREV_DISABLED': 'aria-disabled="true"' if not prev_slug else '',
            'NEXT_DISABLED': 'aria-disabled="true"' if not next_slug else ''
        })
        result[f'aulas/{slug}.html'] = slide.encode('utf-8')

    for src in (ROOT / 'assets').rglob('*'):
        if src.is_file():
            rel = src.relative_to(ROOT).as_posix()
            result[rel] = src.read_bytes()
    result['.nojekyll'] = b''
    return result, len(published), len(lessons), sum(bool(lesson.get('demo')) for lesson in published)


def retry_locked(operation, path):
    """Retenta bloqueios temporários do Windows/OneDrive, sem forçar permissões."""
    for attempt in range(ATTEMPTS):
        try:
            return operation()
        except PermissionError as exc:
            if attempt == ATTEMPTS - 1:
                raise PermissionError(
                    f'Não foi possível atualizar {path} após {ATTEMPTS} tentativas. '
                    'Verifique se o arquivo está aberto ou temporariamente bloqueado '
                    'pelo OneDrive, VS Code ou antivírus e execute o build novamente.'
                ) from exc
            time.sleep(min(0.15 * (2 ** attempt), 1.0))


def write_if_changed(path, data):
    """Não toca em arquivo idêntico; substitui alterados sem truncar o destino."""
    if path.is_file():
        old = retry_locked(path.read_bytes, path)
        if old == data:
            return False
    retry_locked(lambda: path.parent.mkdir(parents=True, exist_ok=True), path.parent)
    temp_name = None
    try:
        # Arquivo temporário NA MESMA PASTA: os.replace é atômico no mesmo volume.
        with retry_locked(
            lambda: tempfile.NamedTemporaryFile(mode='wb', prefix='.build-', suffix='.tmp',
                                               dir=path.parent, delete=False), path.parent
        ) as temp:
            temp_name = temp.name
            temp.write(data)
        retry_locked(lambda: os.replace(temp_name, path), path)
        return True
    finally:
        if temp_name and Path(temp_name).exists():
            # Falha em os.replace não deve deixar temporários acumulados.
            try:
                retry_locked(lambda: os.unlink(temp_name), temp_name)
            except PermissionError:
                print(f'Aviso: arquivo temporário bloqueado: {temp_name}')


def valid_old_generated(value):
    """Manifesto nunca tem permissão para apagar caminhos fora das saídas geradas."""
    if not isinstance(value, str) or '\\' in value:
        return False
    p = PurePosixPath(value)
    if p.is_absolute() or '..' in p.parts:
        return False
    return (value in ('index.html', '.nojekyll') or
            value.startswith(('assets/', 'aulas/', 'conteudo/')))


def read_old_manifest():
    path = TARGET / MANIFEST
    if not path.is_file():
        return set()
    old = json.loads(retry_locked(lambda: path.read_text(encoding='utf-8'), path))
    generated = old.get('generated', [])
    if not isinstance(generated, list) or not all(valid_old_generated(v) for v in generated):
        raise ValueError('Manifesto de geração inválido: docs/' + MANIFEST)
    return set(generated)


def build():
    generated, n_published, n_total, n_demos = output_files()
    previous = read_old_manifest()
    # Compatibilidade com builds antigos: docs/aulas e docs/conteudo eram gerados
    # sem manifesto. Remover somente HTML/Markdown obsoletos dessas pastas.
    for dirname, ext in [('aulas', '*.html'), ('conteudo', '*.md')]:
        folder = TARGET / dirname
        if folder.is_dir():
            for file in folder.glob(ext):
                previous.add(file.relative_to(TARGET).as_posix())

    changed = unchanged = removed = 0
    for relative, content in generated.items():
        updated = write_if_changed(TARGET / relative, content)
        changed += bool(updated)
        unchanged += not updated

    # Não deixar no Pages o HTML de aulas alteradas para published=false.
    for relative in sorted(previous - generated.keys()):
        if not valid_old_generated(relative):
            raise ValueError('Saída antiga insegura: ' + relative)
        dest = TARGET / relative
        if dest.is_file():
            retry_locked(dest.unlink, dest)
            removed += 1

    manifest = json.dumps({'version': 1, 'generated': sorted(generated)},
                          ensure_ascii=False, indent=2).encode('utf-8') + b'\n'
    write_if_changed(TARGET / MANIFEST, manifest)
    print(f'✓ Site atualizado em {TARGET}: {changed} criados/alterados, '
          f'{unchanged} preservados, {removed} obsoletos removidos.')
    print(f'✓ {n_published}/{n_total} aulas e {n_demos} laboratórios publicados.')


if __name__ == '__main__':
    try:
        build()
    except PermissionError as exc:
        raise SystemExit('ERRO de acesso (Windows/OneDrive): ' + str(exc)) from exc
