/* Bayesian MAP fusion teaching surrogate: no dependencies; deterministic data. */
(() => {
  'use strict';
  function noise(seed){let a=seed>>>0;return ()=>{a=(1664525*a+1013904223)>>>0;const u=(a+1)/4294967297;a=(1664525*a+1013904223)>>>0;const v=(a+1)/4294967297;return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};}
  function simulate({pv=3,pf=1,plan=1,q=0.000003,outlier=false}={}) {
    const random=noise(89173), n=360, slowEvery=45;
    const trueSeries=[], slow=[],fast=[],ml=[],map=[], posterior=[];
    const means=[0.03,1.01], cov=[0.03**2,0.02**2];
    const slowVariance=[0.006**2,0.003**2];
    const fastVariance=[0.0008**2,0.0004**2];
    let currentSlow=[0,0];
    for(let k=0;k<n;k++){
      const t=k/30; // two hours represented with 20s steps
      const solar=(0.65+0.25*Math.sin(2*Math.PI*t/2))*pv/3;
      const clouds=(0.50*Math.sin(k*0.11)+0.28*Math.sin(k*0.37)+0.17*Math.sin(k*0.031))*solar;
      const angle=0.035-0.026*solar-0.018*clouds*(pf===1?1:0.72)+0.0015*Math.sin(k*.035);
      const voltage=1.010+0.012*solar+0.010*clouds*(pf===1?0.50:1.3)+0.001*Math.sin(k*.04);
      const truth=[angle,voltage];trueSeries.push(truth);
      if(k%slowEvery===0){currentSlow=[angle+0.006*random(),voltage+0.003*random()];}
      slow.push(currentSlow.slice());
      const updated=[];
      for(let d=0;d<2;d++){
        // For standalone demonstration, WLS is a stale-data hold, NOT the paper's conventional estimator.
        const old=currentSlow[d];
        ml.push(null); // placeholder retained for API compatibility
        cov[d]+=q*(d===0?1:0.5);
        if(k%slowEvery===0){const gain=cov[d]/(cov[d]+slowVariance[d]);means[d]+=gain*(old-means[d]);cov[d]*=(1-gain);}
        if(plan===2 || (plan===1&&d===0)){
          let measurement=truth[d]+Math.sqrt(fastVariance[d])*random();
          if(outlier&&k===200&&d===0)measurement+=0.035;
          const gain=cov[d]/(cov[d]+fastVariance[d]);means[d]+=gain*(measurement-means[d]);cov[d]*=(1-gain);
        }
        updated.push(means[d]);
      }
      map.push(updated);posterior.push(cov.slice());
    }
    const metric=(field,which)=>trueSeries.reduce((s,x,i)=>s+Math.abs(x[field]-(which==='map'?map[i][field]:slow[i][field])),0)/n;
    return {truth:trueSeries,slow,map,posterior,mae:{angle:[metric(0,'slow'),metric(0,'map')],voltage:[metric(1,'slow'),metric(1,'map')]}};
  }
  function mount(root){
    const by=role=>root.querySelector(`[data-role="${role}"]`);
    if(!by('plot')||root.dataset.mapMounted)return;root.dataset.mapMounted='true';
    const render=()=>{
      const q=10**(-8+Number(by('q').value)/25);
      by('qvalue').textContent=q.toExponential(2)+' per 20-s step';
      const data=simulate({pv:Number(by('pv').value),pf:Number(by('pf').value),plan:Number(by('plan').value),q,outlier:by('outlier').checked});
      const svg=by('plot');svg.replaceChildren();
      const ns='http://www.w3.org/2000/svg';
      const line=(x1,y1,x2,y2,stroke='#cbd5e1')=>{const el=document.createElementNS(ns,'line');Object.entries({x1,y1,x2,y2,stroke,'stroke-width':1}).forEach(([k,v])=>el.setAttribute(k,v));svg.append(el);};
      const label=(txt,x,y)=>{const el=document.createElementNS(ns,'text');el.textContent=txt;Object.entries({x,y,fill:'#334155','font-size':12}).forEach(([k,v])=>el.setAttribute(k,v));svg.append(el);};
      for(let d=0;d<2;d++){
        const series=[data.truth,data.slow,data.map], all=series.flatMap(seq=>seq.map(v=>v[d]));
        const min=Math.min(...all),max=Math.max(...all),span=Math.max(1e-4,max-min),top=d===0?16:166,height=108;
        line(48,top+height,625,top+height);line(48,top,48,top+height);
        label(d===0?'Voltage angle (rad)':'Voltage magnitude (pu)',52,top+12);
        label(min.toFixed(3),3,top+height);label(max.toFixed(3),3,top+24);
        const colors=['#146a54','#be6b26','#275fbd'];
        series.forEach((seq,j)=>{const el=document.createElementNS(ns,'polyline');const points=seq.map((v,i)=>`${48+i/359*577},${top+height-(v[d]-min)/span*height}`).join(' ');el.setAttribute('points',points);el.setAttribute('fill','none');el.setAttribute('stroke',colors[j]);el.setAttribute('stroke-width',j===0?'2.3':'1.6');el.setAttribute('opacity',j===1?'.72':'1');svg.append(el);});
      }
      by('metrics').innerHTML=`<tr><td>Angle (rad)</td><td>${data.mae.angle[0].toFixed(5)}</td><td>${data.mae.angle[1].toFixed(5)}</td></tr><tr><td>Magnitude (pu)</td><td>${data.mae.voltage[0].toFixed(5)}</td><td>${data.mae.voltage[1].toFixed(5)}</td></tr>`;
      by('diagnosis').textContent=`20-s teaching time grid; ${Number(by('plan').value)} fast proxy channel(s). MAE is computed against the surrogate truth; high-confidence priors may lag rapid PV changes, and a Gaussian MAP update remains sensitive to outliers.`;
    };
    ['pv','pf','plan','q','outlier'].forEach(role=>by(role).addEventListener('change',render));by('q').addEventListener('input',render);by('run').addEventListener('click',render);render();
  }
  window.SEPMapFusion={mount,simulate};
})();
