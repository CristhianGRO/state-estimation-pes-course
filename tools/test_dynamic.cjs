const assert=require('node:assert/strict');
const dynamic=require('../assets/js/dynamic.js'),core=require('../assets/js/labs-disciplina.js');
for(const dt of [1,.1]) {
 const result=dynamic.simulate({dt});assert.equal(result.rows.length,50/dt);
 const before=result.rows.find(r=>Math.abs(r.time-(20-dt))<1e-6),after=result.rows.find(r=>Math.abs(r.time-20)<1e-6);
 assert.ok(Math.abs(after.truth[0]/before.truth[0]-1.25)<1e-12);
 for(const row of result.rows) {
  const P=row.covariance;assert.ok(P[0][0]>0 && P[1][1]>0 && P[0][0]*P[1][1]-P[0][1]*P[1][0]>0);
  assert.ok(Math.abs(P[0][1]-P[1][0])<1e-12);assert.ok(row.estimate.every(Number.isFinite));
 }
 // Independent information-form covariance check at the first update.
 const G=[[1/.001,0],[0,1/.001]];
 dynamic.H.forEach((h,i)=>h.forEach((a,j)=>h.forEach((b,k)=>G[j][k]+=a*b/dynamic.sigma[i]**2)));
 for(let j=0;j<2;j++){const column=core.solve(G,[Number(j===0),Number(j===1)]);for(let i=0;i<2;i++)assert.ok(Math.abs(column[i]-result.rows[0].covariance[i][j])<1e-12);}
 assert.deepEqual(result.rows[5],dynamic.simulate({dt}).rows[5]);
}
for(const q of [1e-10,1e-4]) {
 const result=dynamic.simulate({dt:.1,q});
 assert.ok(result.rows.every(row=>row.estimate.every(Number.isFinite)));
}
console.log('Dynamic experiment: reproducibility, timing, covariance, and information-form cross-check passed.');
