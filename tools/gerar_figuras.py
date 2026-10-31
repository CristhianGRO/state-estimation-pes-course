#!/usr/bin/env python3
"""Figuras SVG próprias do curso. Não utiliza imagens ou recortes dos PDFs."""
from pathlib import Path
from html import escape
from math import exp,pi,sqrt
import json,re
from html import unescape

OUT=Path(__file__).resolve().parents[1]/'assets/figuras'
LABELS=json.loads((Path(__file__).parent/'figure-labels-en.json').read_text(encoding='utf-8'))
INK='#09213a'; TEAL='#008f96'; BLUE='#3167bd'; MUTED='#4c6076'; ORANGE='#c46b22'

def text(x,y,label,size=22,color=INK,anchor='middle'):
    return f'<text x="{x}" y="{y}" fill="{color}" font-size="{size}" text-anchor="{anchor}">{escape(label)}</text>'

def line(x1,y1,x2,y2,color=TEAL,width=4,dash=''):
    return f'<path d="M{x1} {y1}L{x2} {y2}" stroke="{color}" stroke-width="{width}" fill="none"'+(f' stroke-dasharray="{dash}"' if dash else '')+'/>'

def box(x,y,w,h,label,sub=''):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="16" fill="white" stroke="#d7e4ed" stroke-width="2"/>'+text(x+w/2,y+h/2-5,label,24)+text(x+w/2,y+h/2+28,sub,18,MUTED)

def node(x,y,label):
    return f'<circle cx="{x}" cy="{y}" r="24" fill="#e4f8f6" stroke="{TEAL}" stroke-width="3"/>'+text(x,y+8,label)

def save(name,title,desc,body,height=340):
    OUT.mkdir(parents=True,exist_ok=True)
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 {height}" role="img" aria-labelledby="t d"><title id="t">{escape(title)}</title><desc id="d">{escape(desc)}</desc><rect width="1100" height="{height}" rx="20" fill="#f1f7fa"/><g font-family="Arial,sans-serif">{body}</g></svg>\n'
    svg=re.sub(r'>([^<>]+)<',lambda m:'>'+escape(LABELS.get(unescape(m[1]),unescape(m[1])))+'<',svg)
    (OUT/(name+'.svg')).write_text(svg,encoding='utf-8')

def flow(name,title,labels,subs):
    body=''
    for i,(label,sub) in enumerate(zip(labels,subs)):
        x=30+i*360
        body+=box(x,100,320,140,label,sub)
        if i<2:body+=line(x+325,170,x+352,170)+text(x+348,178,'›',35,TEAL)
    save(name,title,' → '.join(labels),body)

def main():
    body=line(150,130,950,130)+line(350,130,350,250)+line(750,130,750,250)
    body+='<rect x="410" y="110" width="280" height="40" rx="8" fill="white" stroke="#008f96" stroke-width="3"/>'
    body+=text(550,85,'yij = gij + jbij')+text(350,293,'j bsh')+text(750,293,'j bsh')
    body+=node(150,130,'i')+node(950,130,'j')
    for x in (350,750):
        body+=line(x-25,250,x+25,250,INK,3)+line(x-17,260,x+17,260,INK,3)+line(x-9,270,x+9,270,INK,3)
    save('linha-pi','Modelo π de linha','Admitância série entre os terminais e metade da susceptância shunt em cada terminal.',body)
    body=box(30,80,180,150,'Seção A','mesmo nível de tensão')+box(320,80,180,150,'Seção B','terminal da linha')
    body+=line(210,150,320,150)+text(265,125,'DS fechado',17)
    body+=text(600,160,'→',60,TEAL)+box(740,80,280,150,'Barra elétrica','A e B agregadas')
    save('configurador','Redução topológica','Duas seções conectadas por dispositivo ideal fechado são agrupadas em uma barra.',body)
    for name,circuit in [('rede-lista2',False),('circuito-lista3',True)]:
        body=line(550,60,180,250)+line(550,60,920,250)+line(180,250,920,250)
        body+=node(550,60,'1')+node(180,250,'2')+node(920,250,'3')
        body+=text(310,130,'R12 = 0,1 Ω' if circuit else 'x12 = 0,04 p.u.',20)
        body+=text(790,130,'R13 = 0,2 Ω' if circuit else 'x13 = 0,05 p.u.',20)
        body+=text(550,285,'R23 = 0,1 Ω' if circuit else 'x23 = 0,08 p.u.',20)
        body+=text(550,325,'Correntes nos dois sentidos e tensões nodais' if circuit else 'P12, P21, P13, P23 e injeções P1, P2',18,MUTED)
        save(name,'Circuito da Lista 3' if circuit else 'Rede da Lista 2','Rede de três nós com parâmetros e medidas indicados no texto.',body,360)
    body=line(100,290,970,290,BLUE,5)+text(920,325,'Imagem de H',19,BLUE)
    body+=line(200,290,650,70,INK)+line(200,290,650,290,TEAL,6)+line(650,290,650,70,ORANGE,5)
    body+=text(680,70,'z',28)+text(690,285,'ẑ = Kz',23,TEAL)+text(720,175,'r = z − ẑ',22,ORANGE)
    body+=text(200,325,'Origem',18,MUTED)+text(390,330,'Componente ajustada',19,TEAL)
    body+=text(520,30,'Geometria em coordenadas branqueadas',20,MUTED)
    save('projecao-wls','Projeção do WLS','Em coordenadas branqueadas, a medida é decomposta em projeção no espaço do modelo e resíduo ortogonal.',body,370)
    body='<rect x="35" y="70" width="460" height="200" rx="24" fill="#e1f3f2"/><rect x="605" y="70" width="460" height="200" rx="24" fill="#e6eefb"/>'
    body+=line(140,170,390,170)+line(710,170,960,170)+line(390,170,710,170,MUTED,3,'9 9')
    for x,l in [(140,'1'),(390,'2'),(710,'3'),(960,'4')]:body+=node(x,170,l)
    body+=text(260,115,'Ilha observável A',22)+text(835,115,'Ilha observável B',22)
    body+=text(260,230,'Fluxo P12 medido',18)+text(835,230,'Fluxo P34 medido',18)
    body+=text(550,305,'O ramo físico 2–3 não possui relação angular determinada',20,MUTED)
    save('ilhas','Ilhas observáveis','Uma rede fisicamente conectada pode conter duas ilhas de informação.',body)
    flow('simulacao','Validação do estimador',['Estado de referência','Medidas simuladas','Avaliação'],['Fluxo e h(xref) conhecidos','Ruído + cenários de EG','Viés, RMSE e diagnóstico'])
    flow('pmu','Medição fasorial sincronizada',['PMU','PDC','Estimador'],['Fasores + timestamp','Organização dos canais','Modelo + covariância'])
    flow('edttr','Estágios da estimação de demanda',['Perfis e agregação','Fluxo trifásico','Refinamento'],['Classes e consumo por fase','Correntes e tensões','Medidas em tempo real'])
    body=line(120,160,980,160,INK,5)+text(120,110,'Medição total',23)
    for x,label,color,mu in [(360,'A',TEAL,'10 kW'),(620,'B',BLUE,'20 kW'),(880,'C',ORANGE,'15 kW')]:
        body+=line(x,160,x,240,color,5)+box(x-85,230,170,70,'Fase '+label,mu)
    save('demanda-trifasica','Demandas por fase','Exemplo agregado com três demandas por fase e uma medida total em tempo real.',body,360)
    body=text(145,55,'Barra i',24)+text(955,55,'Barra j',24)
    for y,label,color in [(100,'a',TEAL),(180,'b',BLUE),(260,'c',ORANGE)]:
        body+=line(180,y,920,y,color,4)+node(145,y,label)+node(955,y,label)
    body+=line(480,105,580,175,MUTED,2,'5 6')+line(480,185,580,255,MUTED,2,'5 6')
    body+=text(710,335,'Acoplamentos representados nos termos mútuos de Yabc',18,MUTED)
    save('rede-trifasica','Ramo trifásico com acoplamentos','Três condutores de fase ligam dois barramentos. Os termos mútuos da matriz de admitância representam os acoplamentos entre fases.',body,360)
    body=line(100,285,100,55,MUTED,2)+line(100,285,1000,285,MUTED,2)
    for x,y in [(180,250),(220,225),(270,235),(330,205),(370,210),(420,185),(460,180)]:
        body+=f'<circle cx="{x}" cy="{y}" r="7" fill="{TEAL}"/>'
    body+='<circle cx="900" cy="75" r="12" fill="#c46b22"/>'
    body+=line(130,275,950,115,TEAL,3,'8 7')+line(130,275,950,65,ORANGE,3)
    body+=text(800,40,'Ponto influente contaminado',20,ORANGE)+text(220,320,'Espaço dos fatores (sensibilidades)',20,MUTED)
    save('alavancamento','Alavancamento em regressão','Um ponto distante no espaço dos fatores pode deslocar o ajuste e apresentar resíduo pequeno.',body,360)
    body=box(40,100,290,150,'Área 1','Estado local + fronteira')+box(405,100,290,150,'Área 2','Estado local + fronteira')+box(770,100,290,150,'Área 3','Estado local + fronteira')
    body+=line(330,175,405,175)+line(695,175,770,175)+text(550,300,'Troca de informação e consistência nas fronteiras',22,MUTED)
    save('multiarea','Coordenação multiárea','Três áreas trocam informação de fronteira para compatibilizar suas estimativas.',body)
    body=line(80,275,750,275,MUTED,2)
    for sigma,color in [(1,TEAL),(1.8,BLUE)]:
        pts=[]
        for k in range(201):
            v=-4+8*k/200;x=80+670*k/200;y=275-470*exp(-v*v/(2*sigma*sigma))/(sigma*sqrt(2*pi));pts.append(f'{x:.2f},{y:.2f}')
        body+=f'<polyline points="{" ".join(pts)}" fill="none" stroke="{color}" stroke-width="4"/>'
    body+=text(420,315,'Mesma média',20,MUTED)+text(900,130,'Menor σ',24,TEAL)+text(900,180,'Maior σ',24,BLUE)
    save('gaussiana','Densidades gaussianas','Duas distribuições gaussianas com a mesma média e desvios-padrão diferentes.',body)
    print('Figuras SVG atualizadas em assets/figuras/.')

if __name__=='__main__':main()
