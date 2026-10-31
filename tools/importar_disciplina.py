#!/usr/bin/env python3
"""Atualiza o inventário local, sem publicar slides ou alterar aulas.

python tools/importar_disciplina.py "DIRETORIO DOS MATERIAIS"
--extrair-texto: consulta opcional com PyMuPDF, salva texto em tmp/fontes/.
Os arquivos conteudo/*.md são a fonte editorial e nunca são sobrescritos.
"""
import argparse
import hashlib
import json
import re,zipfile
from xml.etree import ElementTree
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('materiais',type=Path)
    parser.add_argument('--extrair-texto',action='store_true')
    args=parser.parse_args()
    plan=json.loads((ROOT/'tools/plano-disciplina.json').read_text(encoding='utf-8'))
    manifest_path=ROOT/'conteudo/fontes-2024.json'
    old=json.loads(manifest_path.read_text(encoding='utf-8'))
    previous={s['sha256']:s for s in old['sources']}
    sources=[]
    for lesson in plan:
        for block,pattern in enumerate(lesson['sources'],1):
            matches=list(args.materiais.glob(pattern))
            if len(matches)!=1:raise ValueError(f'Fonte ausente ou ambígua: {pattern}')
            source=matches[0];digest=hashlib.sha256(source.read_bytes()).hexdigest()
            record={'lesson':lesson['id'],'block':block,'file':source.name,'sha256':digest,
                    'pdf_pages':previous.get(digest,{}).get('pdf_pages')}
            if source.suffix.lower()=='.pptx':
                with zipfile.ZipFile(source) as archive:
                    slides=sorted((name for name in archive.namelist() if re.fullmatch(r'ppt/slides/slide\d+\.xml',name)),key=lambda name:int(re.search(r'(\d+)\.xml',name)[1]))
                    record.pop('pdf_pages',None)
                    record.update(source_format='pptx',slide_count=len(slides))
                    for key in ('authors','date'):
                        if key in previous.get(digest,{}):record[key]=previous[digest][key]
                    if args.extrair_texto:
                        text='\n\n'.join(f'Slide {i+1}\n'+' '.join(e.text for e in ElementTree.fromstring(archive.read(name)).iter() if e.tag.endswith('}t') and e.text) for i,name in enumerate(slides))
            elif args.extrair_texto:
                import fitz
                doc=fitz.open(source);record['pdf_pages']=len(doc)
                text='\n\n'.join(f'Página {i+1}\n'+page.get_text() for i,page in enumerate(doc))
            if args.extrair_texto:
                folder=ROOT/'tmp/fontes';folder.mkdir(parents=True,exist_ok=True)
                (folder/f"aula-{lesson['id']}-bloco-{block}.txt").write_text(text,encoding='utf-8')
            sources.append(record)
    old.update({'format':'markdown-latex','sources':sources})
    manifest_path.write_text(json.dumps(old,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'{len(sources)} fontes inventariadas; aulas e materiais externos preservados.')

if __name__=='__main__':main()
