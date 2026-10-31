/* Ferramentas didáticas ligadas às Listas 2, 3 e ao exemplo de NRL da Aula 8.
 * As extensões PMU, Huber e demanda estão definidas nas próprias aulas.
 * Núcleo numérico exportável para validação em Node, sem dependências externas.
 */
(() => {
  'use strict';
  const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
  function solve(A,b) {
    const n=b.length,a=A.map((r,i)=>[...r,b[i]]);
    const scale=Math.max(...A.flat().map(Math.abs));
    for(let k=0;k<n;k++) {
      let pivot=k;
      for(let i=k+1;i<n;i++)if(Math.abs(a[i][k])>Math.abs(a[pivot][k]))pivot=i;
      if(!Number.isFinite(a[pivot][k]) || Math.abs(a[pivot][k])<=scale*1e-13)throw new Error('Unobservable or ill-conditioned system');
      [a[k],a[pivot]]=[a[pivot],a[k]];
      for(let i=k+1;i<n;i++) {
        const f=a[i][k]/a[k][k];
        for(let j=k;j<=n;j++)a[i][j]-=f*a[k][j];
      }
    }
    const x=Array(n).fill(0);
    for(let i=n-1;i>=0;i--)x[i]=(a[i][n]-dot(a[i].slice(i+1,n),x.slice(i+1)))/a[i][i];
    return x;
  }
  function rank(H,n=H[0]?.length||0) {
    if(!H.length)return 0;
    const A=H.map(r=>r.slice()),tol=Math.max(...A.flat().map(Math.abs))*1e-10;
    let r=0;
    for(let col=0;col<n && r<A.length;col++) {
      let p=r;for(let i=r+1;i<A.length;i++)if(Math.abs(A[i][col])>Math.abs(A[p][col]))p=i;
      if(Math.abs(A[p][col])<=tol)continue;
      [A[r],A[p]]=[A[p],A[r]];
      for(let i=r+1;i<A.length;i++) {
        const f=A[i][col]/A[r][col];
        for(let j=col;j<n;j++)A[i][j]-=f*A[r][j];
      }
      r++;
    }
    return r;
  }
  function linear(H,z,sigma) {
    if(!H.length || H.length!==z.length || z.length!==sigma.length || !sigma.every(v=>Number.isFinite(v)&&v>0))throw new Error('Incompatible input data');
    const n=H[0].length;
    if(rank(H,n)<n)throw new Error('Unobservable measurement set');
    const G=Array.from({length:n},()=>Array(n).fill(0)),b=Array(n).fill(0);
    H.forEach((row,i)=>row.forEach((v,j)=>{
      b[j]+=v*z[i]/sigma[i]**2;
      row.forEach((w,k)=>G[j][k]+=v*w/sigma[i]**2);
    }));
    const x=solve(G,b),h=H.map(row=>dot(row,x)),r=z.map((v,i)=>v-h[i]);
    const covariance=Array.from({length:n},(_,i)=>solve(G,Array.from({length:n},(_,j)=>Number(i===j))));
    const omega=H.map((row,i)=>Math.max(0,sigma[i]**2-dot(row,solve(G,row))));
    const rn=r.map((v,i)=>omega[i]>sigma[i]**2*1e-10?v/Math.sqrt(omega[i]):NaN);
    return {x,h,r,rn,omega,covariance,cost:r.reduce((s,v,i)=>s+(v/sigma[i])**2,0)};
  }
  const list2={H:[[-25,0],[25,0],[0,-20],[12.5,-12.5],[-25,-20],[37.5,-12.5]],z:[6.2452,-6.234,6.992,1.13,13.265,-5.0055],sigma:[.008,.008,.008,.008,.01,.01],names:['P12','P21','P13','P23','P1','P2']};
  const list3={H:[[10,-10,0],[-10,10,0],[5,0,-5],[-5,0,5],[0,10,-10],[0,-10,10],[1,0,0],[0,1,0],[0,0,1]],z:[52,49,-15,16,-82,80,11,6,14],sigma:[1,1,1,1,1,1,.1,.1,.1],names:['I12','I21','I13','I31','I23','I32','V1','V2','V3']};
  const nrlCase={H:[[1,0,0,0,0],[0,1,0,0,0],[0,0,1,0,0],[0,0,0,1,0],[0,0,0,0,1],[1,1,0,0,0],[-1,1,0,0,0],[0,0,0,-1,0],[0,0,0,0,-1]],names:['F1','F2','I4','F4','F5','I1','F3','I5','I6']};
  function estimateList2({weighted=true,offset=0,sigma12=.008}={}) {
    const z=list2.z.slice(),sigma=weighted?list2.sigma.slice():Array(6).fill(1);
    z[0]+=offset;if(weighted)sigma[0]=sigma12;
    return {...linear(list2.H,z,sigma),z,sigma};
  }
  function estimateList3({weight21=1,mode='all'}={}) {
    const z=list3.z.slice(),sigma=list3.sigma.slice();sigma[1]=1/Math.sqrt(weight21);
    const original=linear(list3.H,z,sigma);
    const suspect=original.rn.reduce((best,v,i)=>Math.abs(v)>Math.abs(original.rn[best])?i:best,0);
    let indices=list3.H.map((_,i)=>i),correction=null;
    if(mode==='remove')indices=indices.filter(i=>i!==suspect);
    if(mode==='recover') {
      const sensitivity=original.omega[suspect]/sigma[suspect]**2;
      if(sensitivity<=1e-10)throw new Error('Measurement has insufficient redundancy for recovery');
      correction=original.r[suspect]/sensitivity;z[suspect]-=correction;
    }
    const result=linear(indices.map(i=>list3.H[i]),indices.map(i=>z[i]),indices.map(i=>sigma[i]));
    return {...result,indices,z,suspect,correction,original};
  }
  function qualitative(H,n) {
    const r=rank(H,n),m=H.length;
    if(r<n)return {rank:r,critical:[],cuts:[],nrl:Array(m).fill(null)};
    // Enumeração de referência para pequenos exemplos; descarta superconjuntos de cortes já encontrados.
    const masks=Array.from({length:(1<<m)-1},(_,i)=>i+1),size=x=>x.toString(2).replace(/0/g,'').length;
    masks.sort((a,b)=>size(a)-size(b));const cuts=[];
    for(const mask of masks) {
      if(cuts.some(c=>(c&mask)===c))continue;
      if(rank(H.filter((_,i)=>!(mask&(1<<i))),n)<n)cuts.push(mask);
    }
    return {rank:r,cuts:cuts.map(mask=>Array.from({length:m},(_,i)=>i).filter(i=>mask&(1<<i))),
      critical:Array.from({length:m},(_,i)=>i).filter(i=>cuts.includes(1<<i)),
      nrl:Array.from({length:m},(_,i)=>Math.min(...cuts.filter(c=>c&(1<<i)).map(c=>size(c)-1)))};
  }
  function hybrid(timeMicroseconds=0) {
    const base=estimateList2(),shift=2*Math.PI*60*timeMicroseconds*1e-6;
    const result=linear([...list2.H,[1,0],[0,1]],[...list2.z,base.x[0]+shift,base.x[1]+shift],[...list2.sigma,.001,.001]);
    return {...result,base,shift};
  }
  function demand(z=54,sigma=1) {
    if(!(sigma>0))throw new Error('Standard deviation must be positive');
    const mu=[10,20,15],variance=[4,9,4],denominator=17+sigma*sigma;
    return {x:mu.map((v,i)=>v+variance[i]/denominator*(z-45)),
      covariance:variance.map((v,i)=>variance.map((w,j)=>(i===j?v:0)-v*w/denominator)),
      gain:variance.map(v=>v/denominator)};
  }
  function robust(offset=0,c=1.5) {
    const z=list2.z.slice();z[0]+=offset;
    const ordinary=linear(list2.H,z,list2.sigma);let x=ordinary.x.slice(),iterations=0,converged=false;
    for(let it=0;it<500;it++) {
      const weights=z.map((v,i)=>Math.min(1,c/Math.max(Math.abs((v-dot(list2.H[i],x))/list2.sigma[i]),1e-15)));
      const next=linear(list2.H,z,list2.sigma.map((s,i)=>s/Math.sqrt(weights[i]))).x;
      const delta=Math.max(...next.map((v,i)=>Math.abs(v-x[i])));x=next;iterations=it+1;
      if(delta<1e-10){converged=true;break;}
    }
    const u=z.map((v,i)=>(v-dot(list2.H[i],x))/list2.sigma[i]);
    const weights=u.map(v=>Math.min(1,c/Math.max(Math.abs(v),1e-15)));
    const cost=u.reduce((s,v)=>s+(Math.abs(v)<=c?v*v/2:c*Math.abs(v)-c*c/2),0);
    return {x,u,weights,cost,ordinary,iterations,converged};
  }
  const fmt=(v,n=4)=>Number.isFinite(v)?v.toLocaleString('en-US',{minimumFractionDigits:n,maximumFractionDigits:n}):'—';
  const row=values=>'<tr>'+values.map(v=>`<td>${v}</td>`).join('')+'</tr>';
  function mount(root) {
    const q=role=>root.querySelector(`[data-role="${role}"]`),kind=root.dataset.demo;
    let mode='all';
    function render() {
      try {
        if(kind==='lista-wls') {
          const result=estimateList2({weighted:q('weighted').checked,offset:Number(q('offset').value),sigma12:Number(q('sigma').value)});
          q('offset-value').textContent=fmt(Number(q('offset').value),3)+' p.u.';
          q('sigma-value').textContent=fmt(Number(q('sigma').value),3)+' p.u.';
          q('sigma').disabled=!q('weighted').checked;
          q('states').innerHTML=result.x.map((v,i)=>row([`θ${i+2} (rad)`,fmt(v,6)])).join('');
          q('results').innerHTML=list2.names.map((name,i)=>row([name,fmt(result.z[i]),fmt(result.r[i]),fmt(result.rn[i],3)])).join('');
          q('summary').textContent=`${q('weighted').checked?'WLS':'LS'} · J = ${fmt(result.cost,4)} · 6 measurements, 2 states. LS and WLS objective values use different scales.`;
        } else if(kind==='lista-erros') {
          const result=estimateList3({weight21:Number(q('weight').value),mode});
          q('states').innerHTML=result.x.map((v,i)=>row([`V${i+1} (V)`,fmt(v)])).join('');
          q('results').innerHTML=list3.names.map((name,i)=>{const j=result.indices.indexOf(i);return row([name,fmt(result.z[i],3),j<0?'removed':fmt(result.rn[j],3)]);}).join('');
          q('summary').textContent=`Suspect in the original set: ${list3.names[result.suspect]}. ${mode==='recover'?`Correction of ${fmt(result.correction,3)} applied to the channel.`:mode==='remove'?'Channel removed and state re-estimated.':'All original readings retained.'} J = ${fmt(result.cost,3)}; ${result.indices.length-3} degrees of freedom.`;
          root.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
        } else if(kind==='plano-medicao' || kind==='criticidade') {
          const dataset=kind==='criticidade'?nrlCase:list2,n=dataset.H[0].length;
          const checks=[...root.querySelectorAll('[data-channel]')],indices=checks.filter(c=>c.checked).map(c=>Number(c.dataset.channel));
          const result=qualitative(indices.map(i=>dataset.H[i]),n),observable=result.rank===n;
          q('states').innerHTML=indices.map((i,j)=>row([dataset.names[i],observable?result.nrl[j]:'—',observable?(result.critical.includes(j)?'critical':'noncritical'):'undefined'])).join('');
          q('summary').textContent=`Rank ${result.rank}/${n} · ${indices.length} measurements · ${observable?'Observable':'Unobservable'}. ${observable?'LRL and criticality evaluated on the active set.':'Restore information before classifying criticality.'}`;
          q('cuts').textContent=observable?result.cuts.map(c=>'{'+c.map(j=>dataset.names[indices[j]]).join(', ')+'}').join(' · '):'p-critical sets are not classified for an unobservable base case.';
        } else if(kind==='pmu-hibrido') {
          const dt=Number(q('time').value),result=hybrid(dt);
          q('time-value').textContent=fmt(dt,0)+' µs';
          q('states').innerHTML=result.x.map((v,i)=>row([`θ${i+2}`,fmt(result.base.x[i],6),fmt(v,6),fmt(Math.sqrt(result.covariance[i][i]),6)])).join('');
          q('summary').textContent=`Common angle error = ${fmt(result.shift,6)} rad (${fmt(result.shift*180/Math.PI,3)}°). Hybrid J = ${fmt(result.cost,3)}. PMU standard deviations fixed at 0.001 rad.`;
        } else if(kind==='demanda') {
          const z=Number(q('total').value),sigma=Number(q('sigma').value),result=demand(z,sigma);
          q('total-value').textContent=fmt(z,1)+' kW';q('sigma-value').textContent=fmt(sigma,1)+' kW';
          q('states').innerHTML=result.x.map((v,i)=>row([['A','B','C'][i],[10,20,15][i],fmt(v,3),fmt(Math.sqrt(result.covariance[i][i]),3)])).join('');
          q('summary').textContent=`Initial total 45 kW → estimated ${fmt(result.x.reduce((a,b)=>a+b,0),3)} kW. Reading: ${fmt(z,1)} kW. The total reading has finite uncertainty and is not imposed as an exact constraint.`;
        } else if(kind==='robusto') {
          const offset=Number(q('offset').value),result=robust(offset),base=estimateList2();
          q('offset-value').textContent=fmt(offset,3)+' p.u.';
          q('states').innerHTML=result.x.map((v,i)=>row([`θ${i+2}`,fmt(base.x[i],6),fmt(result.ordinary.x[i],6),fmt(v,6)])).join('');
          q('results').innerHTML=list2.names.map((name,i)=>row([name,fmt(result.u[i],3),fmt(result.weights[i],3)])).join('');
          q('summary').textContent=`Huber c = 1.5 · ${result.iterations} iterations · ${result.converged?'converged':'iteration limit reached'}. Reference: WLS on the original data. This IRLS does not include specific leverage protection.`;
        }
      } catch(error) {q('summary').textContent=error.message;}
    }
    if(kind==='plano-medicao' || kind==='criticidade') {
      const dataset=kind==='criticidade'?nrlCase:list2;
      q('channels').innerHTML=dataset.names.map((name,i)=>`<label><input type="checkbox" data-channel="${i}" checked>${name}</label>`).join('');
      q('all').addEventListener('click',()=>{root.querySelectorAll('[data-channel]').forEach(c=>c.checked=true);render();});
    }
    root.querySelectorAll('input,select').forEach(el=>el.addEventListener(el.type==='checkbox'||el.tagName==='SELECT'?'change':'input',render));
    root.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.mode;render();}));
    q('reset')?.addEventListener('click',()=>{mode='all';root.querySelectorAll('input[type="range"]').forEach(el=>el.value=el.defaultValue);root.querySelectorAll('input[type="checkbox"]').forEach(el=>el.checked=el.defaultChecked);render();});
    root.addEventListener('keydown',event=>{if(['INPUT','SELECT','BUTTON'].includes(event.target.tagName))event.stopPropagation();});
    render();
  }
  const api={solve,rank,linear,list2,list3,nrlCase,estimateList2,estimateList3,qualitative,hybrid,demand,robust,mount};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(typeof window!=='undefined')window.SEPLabsDisciplina=api;
})();
