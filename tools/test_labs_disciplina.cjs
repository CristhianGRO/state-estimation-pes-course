/* Valores de referência independentes e propriedades físicas/estatísticas.
 * node tools/test_labs_disciplina.cjs
 */
const assert=require('node:assert/strict');
const lab=require('../assets/js/labs-disciplina.js');
const close=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<=tol,`${a} difere de ${b}`);
const vector=(a,b,tol)=>a.forEach((v,i)=>close(v,b[i],tol));
const weighted=lab.estimateList2(),unweighted=lab.estimateList2({weighted:false});
vector(weighted.x,[-.2504,-.3484],5.1e-5);
vector(unweighted.x,[-.2504,-.3488],5.1e-5);
// O balanço ativo do modelo sem perdas vale nas medidas estimadas.
close(weighted.h[0]+weighted.h[2],weighted.h[4]);
close(-weighted.h[0]+weighted.h[3],weighted.h[5]);
// Reprodução dos casos degenerado e mínimo da aula de observabilidade.
assert.equal(lab.rank([lab.list2.H[0],lab.list2.H[1]],2),1);
assert.equal(lab.rank([lab.list2.H[0],lab.list2.H[2]],2),2);
assert.throws(()=>lab.linear([[1,0],[2,0]],[1,2],[1,1]),/Unobservable/);
const original=lab.estimateList3();
assert.equal(original.suspect,1);
assert.equal(original.diagnosis.degreesOfFreedom,6);
assert.equal(original.diagnosis.rejected,true);
close(original.diagnosis.criticalValue,12.591587243743977);
close(Math.abs(original.rn[1]),81.372,5e-4);
const removed=lab.estimateList3({mode:'remove'}),recovered=lab.estimateList3({mode:'recover'});
assert.equal(removed.diagnosis.degreesOfFreedom,5);
assert.equal(removed.diagnosis.rejected,false);
close(removed.diagnosis.criticalValue,11.070497693516351);
assert.equal(recovered.diagnosis.criticalValue,null,'Do not calibrate dependent reconstructed data as fresh observations');
assert.equal(recovered.diagnosis.rejected,null);
close(recovered.estimatedError,3704/37);
close(recovered.standardizedError,recovered.estimatedError/recovered.sigma[recovered.suspect]);
const stronger=lab.estimateList3({weight21:10,mode:'recover'});
close(stronger.estimatedError,recovered.estimatedError);
close(stronger.standardizedError,Math.sqrt(10)*recovered.standardizedError);
// Independent density integration verifies the two tabulated chi-square quantiles.
for(const df of [5,6]) {
 const C=df===5?removed.diagnosis.criticalValue:original.diagnosis.criticalValue;
 const gamma=df===5?3*Math.sqrt(Math.PI)/4:2;
 const density=x=>x**(df/2-1)*Math.exp(-x/2)/(2**(df/2)*gamma);
 const n=10000,h=C/n;let sum=density(0)+density(C);
 for(let i=1;i<n;i++)sum+=(i%2?4:2)*density(i*h);
 close(sum*h/3,.95,2e-8);
}
// Solução exata racional independente: [2042/185, 2193/370, 5193/370] V.
vector(removed.x,[2042/185,2193/370,5193/370],1e-10);
vector(recovered.x,removed.x,1e-10);
assert.ok(recovered.z[1]<0,'A corrente recuperada deve respeitar a orientação I21');
const critical=lab.qualitative(lab.nrlCase.H,5);
assert.deepEqual(critical.nrl,[2,2,0,1,1,2,2,1,1]);
assert.deepEqual(critical.critical,[2]);
assert.deepEqual(critical.cuts.map(c=>c.length).sort(),[1,2,2,3,3,3,3]);
const lost=lab.nrlCase.H.filter((_,i)=>i!==2);
assert.equal(lab.qualitative(lost,5).rank,4);
// Todo corte classificado é mínimo por inclusão.
for(const cut of critical.cuts) {
 assert.ok(lab.rank(lab.nrlCase.H.filter((_,i)=>!cut.includes(i)),5)<5);
 for(const spared of cut)assert.equal(lab.rank(lab.nrlCase.H.filter((_,i)=>!cut.includes(i)||i===spared),5),5);
}
const hybrid=lab.hybrid(0);
vector(hybrid.x,weighted.x,1e-12);
hybrid.covariance.forEach((row,i)=>assert.ok(row[i]<weighted.covariance[i][i]));
close(lab.hybrid(100).shift,Math.PI*.012,1e-12);
const demand=lab.demand();vector(demand.x,[12,24.5,17],1e-12);
close(demand.covariance[0][1],-2,1e-12);
assert.ok(lab.demand(54,10).x.reduce((s,v)=>s+v,0)<demand.x.reduce((s,v)=>s+v,0));
for(const offset of [-.4,0,.4]) {
 const r=lab.robust(offset);assert.ok(r.converged);assert.ok(r.weights.every(w=>w>0 && w<=1));
 // Gradiente da função Huber em escala padronizada.
 for(let j=0;j<2;j++) {
  const score=r.u.reduce((s,u,i)=>s+lab.list2.H[i][j]*Math.max(-1.5,Math.min(1.5,u))/lab.list2.sigma[i],0);
  assert.ok(Math.abs(score)<.01,`IRLS sem estacionariedade: ${score}`);
 }
}
console.log('Listas 2 e 3, NRL da Aula 8, extensão PMU, refinamento de demanda e IRLS: verificados.');
