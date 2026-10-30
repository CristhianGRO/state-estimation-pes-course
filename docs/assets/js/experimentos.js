/**
 * Laboratórios interativos - Curso de Estimação de Estado em SEP.
 * Nenhuma dependência de execução além do JavaScript do navegador.
 * Modelos pedagógicos sintéticos: não usar como software de operação de SEP.
 */
(() => {
  'use strict';
  const fr = (value, n=3) => Number(value).toLocaleString('pt-BR', {minimumFractionDigits:n, maximumFractionDigits:n});
  const truth = [-0.060, -0.095]; // theta_2, theta_3, rad
  const flows = [[-5, 0], [0, -4], [2.5, -2.5]];
  const dot = (a,b) => a.reduce((s, x, i) => s+x*b[i], 0);
  const q = (root, role) => root.querySelector(`[data-role="${role}"]`);
  const set = (root, role, value) => { const el=q(root,role); if(el) el.textContent=value; };
  const registerRange = (root, role, handler) => q(root, role)?.addEventListener('input', handler);
  const colors = ['#176e8c','#eb9845','#09a98c'];

  /** Minimos quadrados ponderados linear: H de duas colunas, R diagonal. */
  function wls(H,z,sigma) {
    if (H.length !== z.length || z.length !== sigma.length || !H.length) throw new Error('Dimensões inconsistentes');
    let a=0,b=0,c=0,y0=0,y1=0;
    for(let i=0;i<H.length;i++) {
      const [h0,h1]=H[i];
      const w=1/(sigma[i]*sigma[i]);
      a+=h0*h0*w; b+=h0*h1*w; c+=h1*h1*w;
      y0+=h0*z[i]*w; y1+=h1*z[i]*w;
    }
    const det=a*c-b*b;
    if (!Number.isFinite(det) || det < 1e-12) return null;
    const inv00=c/det, inv01=-b/det, inv11=a/det;
    const x=[inv00*y0+inv01*y1, inv01*y0+inv11*y1];
    const residuals=H.map((row,i)=>z[i]-dot(row,x));
    const cost=residuals.reduce((s,r,i)=>s+(r/sigma[i])**2,0);
    const omegaDiag=H.map(([h0,h1],i)=>Math.max(0,sigma[i]**2-(inv00*h0*h0+2*inv01*h0*h1+inv11*h1*h1)));
    const normalized=residuals.map((v,i)=>omegaDiag[i]>1e-12?v/Math.sqrt(omegaDiag[i]):NaN);
    return {x, residuals, cost, omegaDiag, normalized, inv:[[inv00,inv01],[inv01,inv11]]};
  }

  function rank2(rows) {
    if (!rows.length || rows.every(row=>Math.abs(row[0])+Math.abs(row[1])<1e-12)) return 0;
    for(let i=0;i<rows.length;i++) for(let j=i+1;j<rows.length;j++) {
      if(Math.abs(rows[i][0]*rows[j][1]-rows[i][1]*rows[j][0])>1e-9) return 2;
    }
    return 1;
  }

  function makeBars(element, names, values, scale, digits=3) {
    element.replaceChildren();
    names.forEach((name,i)=>{
      const track=document.createElement('div'); track.className='bar-item';
      const label=document.createElement('span'); label.textContent=name;
      const rail=document.createElement('div'); rail.className='bar-track';
      const bar=document.createElement('span');
      const v=values[i];
      const f=Number.isFinite(v)?Math.min(100, Math.abs(v)/scale*100):0;
      bar.style.width=f+'%';
      if (Math.abs(v)>3 && digits===2) bar.style.background='#e86b58';
      rail.append(bar);
      const value=document.createElement('strong'); value.textContent=Number.isFinite(v)?fr(v,digits):'n/d';
      track.append(label,rail,value); element.append(track);
    });
  }

  function mountWLS(root) {
    const sigma=[0.020,0.025,0.020];
    const baseline=flows.map((h,i)=>dot(h,truth)+[0.012,-0.010,0.008][i]);
    function render() {
      const delta=Number(q(root,'slider').value);
      set(root,'offset',(delta>=0?'+':'')+fr(delta,3)+' pu');
      const z=baseline.slice(); z[2]+=delta;
      const result=wls(flows,z,sigma);
      set(root,'theta2',fr(result.x[0],4)+' rad');
      set(root,'theta3',fr(result.x[1],4)+' rad');
      set(root,'cost',fr(result.cost,2));
      makeBars(q(root,'bars'),['r(P₁₂)','r(P₁₃)','r(P₂₃)'],result.residuals,0.14,4);
    }
    registerRange(root,'slider',render);
    q(root,'reset').addEventListener('click',()=>{q(root,'slider').value=0;render();});
    render();
  }

  function mountObservability(root) {
    const rows={P12:[-5,0],P13:[0,-4],P23:[2.5,-2.5],TH2:[1,0]};
    const names={P12:'P₁₂',P13:'P₁₃',P23:'P₂₃',TH2:'θ₂ (PMU)'};
    const checks=[...root.querySelectorAll('[data-channel]')];
    function render(){
      const active=checks.filter(el=>el.checked).map(el=>el.dataset.channel);
      const rank=rank2(active.map(name=>rows[name]));
      const observable=rank===2;
      const critical=observable?active.filter(name=>rank2(active.filter(n=>n!==name).map(n=>rows[n]))<2):[];
      set(root,'count',`${active.length} canais`);
      set(root,'rank',`${rank} / 2`);
      set(root,'status',observable?'Observável':'Não observável');
      q(root,'status').classList.toggle('warn',!observable);
      set(root,'critical',observable?(critical.length?critical.map(name=>names[name]).join(', '):'Nenhuma individualmente'):'não definidas (conjunto não observável)');
      set(root,'redundancy',observable?`${active.length-2} medida(s) excedente(s)`:'—');
      set(root,'explain',observable?'O conjunto permite determinar os dois ângulos no modelo CC linear.':'O posto é inferior ao número de ângulos: não existe solução de estado única a partir das medidas selecionadas.');
    }
    checks.forEach(el=>el.addEventListener('change',render));
    q(root,'all').addEventListener('click',()=>{checks.forEach(el=>el.checked=true);render();});
    q(root,'minimum').addEventListener('click',()=>{checks.forEach(el=>el.checked=['P12','P13'].includes(el.dataset.channel));render();});
    render();
  }

  function mountBadData(root) {
    const H=[...flows,[1,0],[0,1]];
    const sigma=[0.025,0.025,0.020,0.008,0.009];
    const names=['P₁₂','P₁₃','P₂₃','θ₂','θ₃'];
    const base=H.map((row,i)=>dot(row,truth)+[0.009,-0.008,0.003,0.001,-0.001][i]);
    let excluded=null;
    function estimate(excludeIdx, z) {
      const indices=H.map((_,i)=>i).filter(i=>i!==excludeIdx);
      const res=wls(indices.map(i=>H[i]),indices.map(i=>z[i]),indices.map(i=>sigma[i]));
      return {res,indices};
    }
    function render(){
      const delta=Number(q(root,'slider').value);
      set(root,'offset','+'+fr(delta,3)+' pu');
      const z=base.slice();z[2]+=delta;
      const full=estimate(null,z).res;
      const fullScores=full.normalized.map(v=>Number.isFinite(v)?Math.abs(v):-1);
      const suspected=fullScores.indexOf(Math.max(...fullScores));
      const result=estimate(excluded,z);
      const normalized=names.map((_,i)=>{
        const j=result.indices.indexOf(i);
        return j===-1?NaN:result.res.normalized[j];
      });
      set(root,'theta2',fr(result.res.x[0],4)+' rad');
      set(root,'theta3',fr(result.res.x[1],4)+' rad');
      set(root,'cost',fr(result.res.cost,2));
      set(root,'suspect',names[suspected]);
      makeBars(q(root,'bars'),names,normalized,5,2);
      const flagged=result.res.normalized.some(v=>Math.abs(v)>3);
      set(root,'status',flagged?'Resíduo acima de 3':'Resíduos até 3');
      q(root,'status').classList.toggle('warn',flagged);
      set(root,'description',excluded===null?`Maior |rᵢᴺ| no conjunto completo: ${names[suspected]} (${fr(fullScores[suspected],2)}).`:`Canal ${names[excluded]} excluído. Compare a estimativa e o custo com o conjunto completo; graus de liberdade reduzidos para 2.`);
      set(root,'remove',excluded===null?'Remover canal suspeito':'Reincluir canal');
      root.dataset.suspected=String(suspected);
    }
    q(root,'remove').addEventListener('click',()=>{excluded=excluded===null?Number(root.dataset.suspected):null;render();});
    q(root,'reset').addEventListener('click',()=>{excluded=null;q(root,'slider').value=0;render();});
    registerRange(root,'slider',()=>{excluded=null;render();});
    render();
  }

  function plotPhasors(svg, vectors, labels, maxMag=1.25) {
    const ox=210,oy=151,scale=117/maxMag;
    let result=`<defs><marker id="arw-${svg.closest('[data-demo]').dataset.demo}" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="#7089a0"/></marker></defs>`;
    for(let i=0;i<5;i++) {
      const offset=i*45;
      result+=`<line x1="${ox-offset}" y1="${oy}" x2="${ox+offset}" y2="${oy}" stroke="#eef2f6" stroke-width="1"/>`;
      result+=`<line x1="${ox}" y1="${oy-offset*.65}" x2="${ox}" y2="${oy+offset*.65}" stroke="#eef2f6" stroke-width="1"/>`;
    }
    result+=`<line x1="25" y1="${oy}" x2="395" y2="${oy}" stroke="#8fa7ba" stroke-width="1.2"/><line x1="${ox}" y1="17" x2="${ox}" y2="288" stroke="#8fa7ba" stroke-width="1.2"/><text x="380" y="140" font-size="14" fill="#60778a">Re</text><text x="218" y="22" font-size="14" fill="#60778a">Im</text>`;
    vectors.forEach((v,i)=>{
      const ex=ox+scale*v[0],ey=oy-scale*v[1];
      const color=colors[i];
      result+=`<line x1="${ox}" y1="${oy}" x2="${ex}" y2="${ey}" stroke="${color}" stroke-width="4" stroke-linecap="round"/><circle cx="${ex}" cy="${ey}" r="5" fill="${color}"/><text x="${ex+10}" y="${ey-9}" font-size="16" font-weight="700" fill="${color}">${labels[i]}</text>`;
    });
    svg.innerHTML=result;
  }
  const polar=(mag, deg)=>[mag*Math.cos(deg*Math.PI/180),mag*Math.sin(deg*Math.PI/180)];

  function mountPhasors(root){
    function render(){
      const angle=Number(q(root,'rotation').value), magb=Number(q(root,'magb-slider').value);
      set(root,'angle',`${angle}°`);set(root,'magb',`${fr(magb,2)} pu`);
      const vectors=[polar(1.00,angle),polar(magb,-120+angle),polar(1.02,120+angle)];
      plotPhasors(q(root,'chart'),vectors,['Va','Vb','Vc']);
      set(root,'values',vectors.map((v,i)=>`${['Va','Vb','Vc'][i]} = ${fr(v[0],3)} ${v[1]<0?'−':'+'} j${fr(Math.abs(v[1]),3)} pu`).join('   ·   '));
    }
    registerRange(root,'rotation',render);registerRange(root,'magb-slider',render);
    q(root,'reset').addEventListener('click',()=>{q(root,'rotation').value=0;q(root,'magb-slider').value=.98;render();});
    render();
  }

  function mountThreePhase(root){
    function render(){
      const mags=['a','b','c'].map(phase=>Number(q(root,phase).value));
      mags.forEach((m,i)=>set(root,'val-'+['a','b','c'][i],fr(m,2)+' pu'));
      const mean=mags.reduce((a,b)=>a+b,0)/3;
      const dev=100*Math.max(...mags.map(x=>Math.abs(x-mean)))/mean;
      set(root,'mean',fr(mean,3)+' pu');set(root,'imbalance',fr(dev,2)+' %');
      plotPhasors(q(root,'chart'),mags.map((m,i)=>polar(m,[0,-120,120][i])),['Va','Vb','Vc']);
    }
    ['a','b','c'].forEach(phase=>registerRange(root,phase,render));
    q(root,'balanced').addEventListener('click',()=>{['a','b','c'].forEach(phase=>q(root,phase).value=1);render();});
    render();
  }

  function mountKalman(root){
    const state=[1.015,1.018,1.011,1.027,1.030,1.026,1.010,0.992,0.987,0.999,1.012,1.019,1.025,1.018,1.006,0.994,0.985,0.977,0.988,0.996,1.009,1.022,1.029,1.023];
    const noises=[.031,-.021,.018,-.028,.024,-.019,.031,-.024,.009,.013,-.035,.019,-.016,.024,-.009,.006,-.020,.032,-.012,.014,.011,-.025,.026,-.015];
    let history=[], estimate=1.0, P=.060, k=0, K=null;
    function plot(){
      const svg=q(root,'chart');const W=490,H=320,left=43,right=20,top=18,bottom=32;
      const yMin=.90,yMax=1.13;
      const xp=i=>left+i*(W-left-right)/(state.length-1);
      const yp=v=>top+(yMax-v)*(H-top-bottom)/(yMax-yMin);
      let markup='';
      [0.94,0.98,1.02,1.06,1.10].forEach(y=>{markup+=`<line x1="${left}" y1="${yp(y)}" x2="${W-right}" y2="${yp(y)}" stroke="#e1eaf0" stroke-width="1"/><text x="4" y="${yp(y)+5}" font-size="12" fill="#667f91">${y.toFixed(2)}</text>`;});
      markup+=`<line x1="${left}" y1="${top}" x2="${left}" y2="${H-bottom}" stroke="#94aabe" stroke-width="1"/>`;
      function line(values,color,strokeWidth=3){if(!values.length)return;markup+=`<polyline points="${values.map((v,i)=>xp(i)+','+yp(v)).join(' ')}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>`;}
      line(history.map(x=>x.true),'#176e8c',2.5);
      line(history.map(x=>x.measured),'#ec9a28',1.9);
      line(history.map(x=>x.estimated),'#09a98c',3.5);
      markup+=`<text x="${W-115}" y="${H-8}" font-size="13" fill="#73899d">Tempo →</text>`;
      svg.innerHTML=markup;
    }
    function render(){
      set(root,'q-value',fr(Number(q(root,'q').value),4));set(root,'r-value',fr(Number(q(root,'r').value),4));
      set(root,'k',`${k} / ${state.length}`);set(root,'gain',K===null?'—':fr(K,3));
      set(root,'estimate',fr(estimate,4)+' pu');set(root,'variance',fr(P,5));
      q(root,'step').disabled=k===state.length;
      plot();
    }
    function step(){if(k>=state.length)return;
      const Q=Number(q(root,'q').value),R=Number(q(root,'r').value);
      const minusP=P+Q;
      const predicted=estimate;
      K=minusP/(minusP+R);
      const z=state[k]+noises[k];
      estimate=predicted+K*(z-predicted);
      P=(1-K)*minusP; // algebraically equivalent to scalar Joseph update
      history.push({true:state[k], measured:z, estimated:estimate});
      k++;render();
    }
    q(root,'step').addEventListener('click',step);
    q(root,'reset').addEventListener('click',()=>{history=[];estimate=1;P=.06;K=null;k=0;render();});
    registerRange(root,'q',render);registerRange(root,'r',render);
    render();
  }
  const registry={wls:mountWLS,observabilidade:mountObservability,erros:mountBadData,fasores:mountPhasors,trifasico:mountThreePhase,kalman:mountKalman};
  window.SEPExperimentos={mount(root){
    const name=root.dataset.demo;
    if(!registry[name]) {console.warn('Laboratório não registrado:',name);return;}
    registry[name](root);
    root.addEventListener('keydown', event=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(event.key) && ['INPUT','BUTTON'].includes(event.target.tagName)){event.stopPropagation();}});
  }, wls};
})();
