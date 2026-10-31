/* Referência externa: Lista 6, exercício 1 (2024). Executar com node. */
const assert=require('node:assert/strict');
const lab=require('../assets/js/wls-ca.js');
const reference=[-.0435,-.2255,1.0591,1.0441,.9443];
const result=lab.estimate();
result.x.forEach((v,i)=>assert.ok(Math.abs(v-reference[i])<=5.1e-5,`Variável ${i}: ${v}`));
assert.ok(Math.max(...result.rn.map(Math.abs))<3,'O enunciado não identifica erro grosseiro');
assert.ok(result.iterations<20);
// A hipótese de perdas passivas exige Pij + Pji >= 0 nos dois ramos.
const h=lab.model(result.x);
assert.ok(h[0]+h[1]>0 && h[2]+h[3]>0);
assert.ok(Math.abs(h[8]-h[1]-h[2])<1e-12,'Balanço de potência ativa na barra 2');
assert.ok(Math.abs(h[9]-h[5]-h[6])<1e-12,'Balanço de potência reativa na barra 2');
// Condição de estacionariedade, em coordenadas normalizadas pela informação.
const H=lab.jacobian(result.x);
for(let j=0;j<5;j++) {
 const g=H.reduce((s,row,i)=>s+row[j]*result.r[i]/lab.sigma[i]**2,0);
 const scale=Math.sqrt(H.reduce((s,row,i)=>s+(row[j]/lab.sigma[i])**2,0));
 assert.ok(Math.abs(g)/scale<1e-6,'Solução não estacionária');
}
for(const error of [-20,-10,10,20]) {
 const changed=lab.estimate(error);
 assert.ok(changed.x.every(Number.isFinite));
 assert.ok(Math.max(...changed.rn.map(Math.abs))>3,'Erro injetado deve aparecer no teste residual');
}
console.log('WLS CA: referência da Lista 6, balanços, convergência e injeção de erros verificados.');
