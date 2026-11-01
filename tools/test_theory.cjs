/* Independent checks for identities used in the textbook supplements. */
const assert = require('node:assert/strict');
const lab = require('../assets/js/labs-disciplina.js');
const near = (a,b,tol=1e-9) => assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)), `${a} != ${b}`);
const dot = (a,b) => a.reduce((s,x,i)=>s+x*b[i],0);
const mv = (A,x) => A.map(row=>dot(row,x));
const det2 = A => A[0][0]*A[1][1]-A[0][1]*A[1][0];
const inv2 = A => {const d=det2(A);return [[A[1][1]/d,-A[0][1]/d],[-A[1][0]/d,A[0][0]/d]];};
const {H,z,sigma} = lab.list2;
const base = lab.linear(H,z,sigma);

// Absolute uncertainty scaling preserves the estimate but changes covariance and J.
const scaled = lab.linear(H,z,sigma.map(s=>3*s));
base.x.forEach((x,i)=>near(x,scaled.x[i]));
near(scaled.cost,base.cost/9);
base.covariance.forEach((row,i)=>row.forEach((v,j)=>near(scaled.covariance[i][j],9*v)));

// Each deleted reading: independent refit versus the analytic cost-drop identity.
H.forEach((h,i)=>{
 const keep = H.map((_,j)=>j).filter(j=>j!==i);
 const removed = lab.linear(keep.map(j=>H[j]),keep.map(j=>z[j]),keep.map(j=>sigma[j]));
 const leverage = dot(h,mv(base.covariance,h))/sigma[i]**2;
 near(base.cost-removed.cost,base.rn[i]**2,1e-8);
 near(z[i]-base.r[i]/(1-leverage),dot(h,removed.x));
 // Whitened bias splits orthogonally into fitted and residual components.
 const absorbed = H.map((row,j)=>dot(row,mv(base.covariance,h))/(sigma[j]*sigma[i]));
 const detected = absorbed.map((v,j)=>(i===j?1:0)-v);
 near(dot(absorbed,detected),0);
 near(dot(absorbed,absorbed),leverage);
 near(dot(detected,detected),1-leverage);
 near(Math.sqrt(dot(absorbed,absorbed)/dot(detected,detected)),Math.sqrt(leverage/(1-leverage)));
});

// The determinant condition detects an exactly critical reading and a safe deletion.
const G=[[2,0],[0,1]], P=inv2(G);
for(const h of [[0,1],[1,0]]){
 const minus=G.map((row,i)=>row.map((v,j)=>v-h[i]*h[j]));
 near(det2(minus),det2(G)*(1-dot(h,mv(P,h))));
}

// Parameter information after state elimination equals a profiled quadratic cost.
const hx=[1,2,1], hp=[2,1,3], w=[1,2,4];
const gxx=hx.reduce((s,v,i)=>s+w[i]*v*v,0);
const gxp=hx.reduce((s,v,i)=>s+w[i]*v*hp[i],0);
const gpp=hp.reduce((s,v,i)=>s+w[i]*v*v,0);
const dx=-gxp/gxx;
near(gpp-gxp*gxp/gxx,hp.reduce((s,v,i)=>s+w[i]*(v+hx[i]*dx)**2,0));
near(gxx-(gxx*gxx)/gxx,0); // An identical state/parameter sensitivity is inseparable.
assert.equal(lab.rank([[1,1],[1,1]],2),1);
assert.equal(lab.rank([[1,.95**2],[1,1.05**2]],2),2);

// Conditional demand covariance is positive and the uncertain aggregate is not exact.
const demand=lab.demand(54,1);
near(demand.x.reduce((s,v)=>s+v,0),53.5);
near(demand.covariance.flat().reduce((s,v)=>s+v,0),17/18);
const exact=lab.demand(54,1e-5);
near(exact.x.reduce((s,v)=>s+v,0),54);

// Constant-state sequential fusion agrees with an independent batch normal equation.
const observations=[{h:[1,0],z:2,r:.4},{h:[1,1],z:1,r:.3},{h:[0,1],z:-1.2,r:.2}];
let x=[0,0], covariance=[[2,0],[0,3]];
const information=[[.5,0],[0,1/3]], rhs=[0,0];
for(const obs of observations){
 const ph=mv(covariance,obs.h),s=obs.r+dot(obs.h,ph),innovation=obs.z-dot(obs.h,x);
 x=x.map((v,i)=>v+ph[i]*innovation/s);
 covariance=covariance.map((row,i)=>row.map((v,j)=>v-ph[i]*ph[j]/s));
 obs.h.forEach((v,i)=>{rhs[i]+=v*obs.z/obs.r;obs.h.forEach((u,j)=>information[i][j]+=v*u/obs.r);});
}
const batchP=inv2(information),batchX=mv(batchP,rhs);
x.forEach((v,i)=>near(v,batchX[i]));
covariance.forEach((row,i)=>row.forEach((v,j)=>near(v,batchP[i][j])));
console.log('Theory checks passed: scaling, deletion, UI geometry, criticality, parameter information, demand conditioning, and batch/filter equivalence.');
