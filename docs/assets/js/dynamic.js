/* Lesson 13: reproducible Pθ tracking experiment based on the separate lecture. */
(() => {
  'use strict';
  const H=[[-25,0],[0,-20],[25,0],[0,20],[-25,-20],[37.5,-12.5],[-12.5,32.5]];
  const sigma=[.008,.008,.008,.008,.01,.01,.01],base=[-.2504,-.3484];
  const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
  const transpose=A=>A[0].map((_,i)=>A.map(r=>r[i]));
  const multiply=(A,B)=>A.map(row=>transpose(B).map(col=>dot(row,col)));
  const plus=(A,B)=>A.map((row,i)=>row.map((v,j)=>v+B[i][j]));
  function random(seed) {
    let state=seed>>>0;
    const uniform=()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return (state+.5)/4294967296;};
    return ()=>Math.sqrt(-2*Math.log(uniform()))*Math.cos(2*Math.PI*uniform());
  }
  function simulate({dt=1,q=1e-7,seed=2024}={}) {
    if(![1,.1].includes(dt) || !Number.isFinite(q) || q<0)throw Error('Invalid sampling interval or process-noise intensity');
    const core=typeof module!=='undefined'&&module.exports?require('./labs-disciplina.js'):window.SEPLabsDisciplina;
    const normal=random(seed),R=sigma.map((s,i)=>sigma.map((_,j)=>i===j?s*s:0));
    let x=[0,0],P=[[.001,0],[0,.001]];const rows=[];
    for(let k=0;k<Math.round(50/dt);k++) {
      const time=k*dt,truth=base.map(v=>v*(time>=20?1.25:1));
      const z=H.map((row,i)=>dot(row,truth)+sigma[i]*normal());
      const snapshot=core.linear(H,z,sigma).x;
      // P is the initial prior at t=0; add process noise only across elapsed intervals.
      const minus=k===0?P:plus(P,[[q*dt,0],[0,q*dt]]),Ht=transpose(H);
      const S=plus(multiply(multiply(H,minus),Ht),R);
      const K=multiply(minus,Ht).map(row=>core.solve(S,row));
      const innovation=z.map((v,i)=>v-dot(H[i],x));
      x=x.map((v,i)=>v+dot(K[i],innovation));
      const KH=multiply(K,H),A=KH.map((row,i)=>row.map((v,j)=>(i===j?1:0)-v));
      P=plus(multiply(multiply(A,minus),transpose(A)),multiply(multiply(K,R),transpose(K)));
      rows.push({time,truth,z,snapshot,estimate:x.slice(),covariance:P.map(r=>r.slice()),innovation,K});
    }
    return {rows,dt,q,H,sigma,base};
  }
  function mount(root) {
    const q=role=>root.querySelector(`[data-role="${role}"]`),fmt=(v,n=5)=>v.toLocaleString('en-US',{minimumFractionDigits:n,maximumFractionDigits:n});
    let experiment,k=0;
    function restart(){experiment=simulate({dt:Number(q('dt').value),q:10**Number(q('q').value)});k=0;render();}
    function render() {
      const rows=experiment.rows,latest=k?rows[k-1]:null;
      q('q-value').textContent=experiment.q.toExponential(1)+' rad²/s';
      q('states').innerHTML=[0,1].map(i=>`<tr><td>θ${i+2}</td><td>${latest?fmt(latest.truth[i]):'—'}</td><td>${latest?fmt(latest.snapshot[i]):'—'}</td><td>${latest?fmt(latest.estimate[i]):'—'}</td><td>${latest?fmt(Math.sqrt(latest.covariance[i][i]),6):'—'}</td></tr>`).join('');
      q('summary').textContent=k?`${k}/${rows.length} observations · t = ${fmt(latest.time,1)} s · ${latest.time>=20?'The 25% operating-point step has occurred.':'Before the operating-point step.'} Compare tracking lag with snapshot variability.`:'No observations processed. Predict and update one observation at a time, or run the full 50 s window.';
      q('step').disabled=k===rows.length;q('run').disabled=k===rows.length;
      const x=t=>45+t/50*480,y=v=>175-(v+.34)/.12*130;
      let markup='<path d="M45 20V175H530" fill="none" stroke="#8ba0b2"/><text x="15" y="15" font-size="12" fill="#4c6076">θ2 (rad)</text><text x="472" y="205" font-size="12" fill="#4c6076">Time (s)</text>';
      markup+=`<path d="M${x(20)} 20V175" stroke="#c46b22" stroke-dasharray="5 5"/><text x="${x(20)+5}" y="28" font-size="12" fill="#a55b1c">25% step</text>`;
      for(const [field,color] of [['truth','#09213a'],['snapshot','#9aadc4'],['estimate','#008f96']]) {
        const pts=rows.slice(0,k).map(row=>`${x(row.time)},${y(row[field][0])}`).join(' ');
        markup+=`<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="${field==='estimate'?2.6:1.5}"/>`;
      }
      q('chart').innerHTML=markup;
    }
    q('step').addEventListener('click',()=>{k=Math.min(k+1,experiment.rows.length);render();});
    q('run').addEventListener('click',()=>{k=experiment.rows.length;render();});
    q('reset').addEventListener('click',restart);q('dt').addEventListener('change',restart);q('q').addEventListener('input',restart);
    root.addEventListener('keydown',event=>{if(['INPUT','SELECT','BUTTON'].includes(event.target.tagName))event.stopPropagation();});restart();
  }
  const api={simulate,random,H,sigma,mount};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(typeof window!=='undefined')window.SEPDynamic=api;
})();
