/* WLS CA acoplado: dados da Lista 6 (2024), exercício 1. */
(() => {
  'use strict';
  const branches = [[0,1,4.99913,-15.26308,.0264],[1,2,1.135019,-4.781863,.0219]];
  const labels=['P12','P21','P23','P32','Q12','Q21','Q23','Q32','P2','Q2','V1','V3'];
  const measurements=[.819,-.807,.990,-.942,-.011,-.012,.349,-.190,.183,.338,1.060,.945];
  const sigma=[.005460,.005380,.006600,.006280,.000073,.000080,.002327,.001267,.001220,.002253,.007067,.006300];
  // x = [theta2, theta3, V1, V2, V3]; theta1 = 0 rad.
  function model(x) {
    const theta=[0,x[0],x[1]], v=x.slice(2), p=[],q=[];
    for(const [a,b,g,bs,bsh] of branches) {
      for(const [i,j] of [[a,b],[b,a]]) {
        const d=theta[i]-theta[j];
        p.push(g*v[i]*v[i]-v[i]*v[j]*(g*Math.cos(d)+bs*Math.sin(d)));
        q.push(-(bs+bsh)*v[i]*v[i]-v[i]*v[j]*(g*Math.sin(d)-bs*Math.cos(d)));
      }
    }
    return [...p,...q,p[1]+p[2],q[1]+q[2],v[0],v[2]];
  }
  function jacobian(x) {
    const H=Array.from({length:12},()=>Array(5));
    for(let j=0;j<5;j++) {
      const plus=x.slice(), minus=x.slice(), step=1e-6;
      plus[j]+=step;minus[j]-=step;
      const a=model(plus),b=model(minus);
      for(let i=0;i<12;i++) H[i][j]=(a[i]-b[i])/(2*step);
    }
    return H;
  }
  function solve(A,b) {
    const n=b.length, a=A.map((row,i)=>[...row,b[i]]);
    for(let k=0;k<n;k++) {
      let p=k;
      for(let i=k+1;i<n;i++) if(Math.abs(a[i][k])>Math.abs(a[p][k]))p=i;
      [a[k],a[p]]=[a[p],a[k]];
      if(Math.abs(a[k][k])<1e-14) throw new Error('Singular system');
      for(let i=k+1;i<n;i++) {
        const f=a[i][k]/a[k][k];
        for(let j=k;j<=n;j++)a[i][j]-=f*a[k][j];
      }
    }
    const x=Array(n).fill(0);
    for(let i=n-1;i>=0;i--) x[i]=(a[i][n]-a[i].slice(i+1,n).reduce((s,v,j)=>s+v*x[i+1+j],0))/a[i][i];
    return x;
  }
  const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
  function normal(H,r) {
    const A=Array.from({length:5},()=>Array(5).fill(0)), b=Array(5).fill(0);
    for(let i=0;i<12;i++)for(let j=0;j<5;j++) {
      b[j]+=H[i][j]*r[i]/sigma[i]**2;
      for(let k=0;k<5;k++)A[j][k]+=H[i][j]*H[i][k]/sigma[i]**2;
    }
    return {A,b};
  }
  function estimate(errorSigma=0) {
    const z=measurements.slice(); z[0]+=errorSigma*sigma[0];
    let x=[0,0,1,1,1],converged=false,iterations=0;
    const cost=v=>model(v).reduce((s,h,i)=>s+((z[i]-h)/sigma[i])**2,0);
    for(let it=0;it<50;it++) {
      const h=model(x),H=jacobian(x),{A,b}=normal(H,z.map((v,i)=>v-h[i]));
      const dx=solve(A,b), previous=cost(x);
      let scale=1,next;
      while(scale>=1/1024) {
        next=x.map((v,i)=>v+scale*dx[i]);
        if(next.slice(2).every(v=>v>0) && cost(next)<=previous+1e-8)break;
        scale/=2;
      }
      if(scale<1/1024)throw new Error('Step search did not converge');
      x=next;iterations=it+1;
      if(Math.max(...dx.map(v=>Math.abs(v*scale)))<1e-9){converged=true;break;}
    }
    if(!converged)throw new Error('Iteration limit reached');
    const h=model(x),r=z.map((v,i)=>v-h[i]), H=jacobian(x),{A}=normal(H,r);
    const rn=H.map((row,i)=>{
      const variance=sigma[i]**2-dot(row,solve(A,row));
      return variance>1e-16?r[i]/Math.sqrt(variance):NaN;
    });
    return {x,h,r,rn,z,cost:cost(x),iterations};
  }
  function mount(root) {
    const q=role=>root.querySelector(`[data-role="${role}"]`),fmt=(v,n=4)=>v.toLocaleString('en-US',{minimumFractionDigits:n,maximumFractionDigits:n});
    function render() {
      try {
        const error=Number(q('error').value),result=estimate(error);
        q('error-value').textContent=fmt(error,1)+' σ';
        q('states').innerHTML=result.x.map((v,i)=>`<tr><td>${['θ2 (rad)','θ3 (rad)','V1 (p.u.)','V2 (p.u.)','V3 (p.u.)'][i]}</td><td>${fmt(v)}</td></tr>`).join('');
        const largest=Math.max(...result.rn.map(Math.abs));
        q('summary').textContent=`${result.iterations} iterations · J = ${fmt(result.cost,3)} · largest |rN| = ${fmt(largest,3)}. ${largest>3?'A reading exceeds the teaching threshold of 3.':'No reading exceeds the teaching threshold of 3.'}`;
        q('residuals').innerHTML=labels.map((name,i)=>`<tr><td>${name}</td><td>${fmt(result.z[i])}</td><td>${fmt(result.rn[i],3)}</td></tr>`).join('');
      } catch(error) {q('summary').textContent=error.message;}
    }
    q('error').addEventListener('input',render);
    q('reset').addEventListener('click',()=>{q('error').value=0;render();});render();
    root.addEventListener('keydown',event=>{if(event.target.tagName==='INPUT')event.stopPropagation();});
  }
  const api={model,jacobian,estimate,solve,measurements,sigma,labels,mount};
  if(typeof module!=='undefined' && module.exports)module.exports=api;
  if(typeof window!=='undefined')window.SEPWLSCA=api;
})();
