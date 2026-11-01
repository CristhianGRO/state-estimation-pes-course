/* Browser regression for the sequential Assignment 3 laboratory.
 * Run after tools/build.py. Requires Node 22+ and Chrome (or CHROME_PATH).
 */
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd(),output=path.join(root,'tmp/qa-bad-data');await mkdir(output,{recursive:true});
const server=spawn('python',['-u','-m','http.server','8769','--bind','127.0.0.1','--directory',path.join(root,'docs')],{windowsHide:true,stdio:'ignore'});
const chrome=spawn(process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=9234','--window-size=1440,900','--user-data-dir='+path.join(root,'tmp/chrome-bad-data-test')],{windowsHide:true,stdio:'ignore'});
const delay=ms=>new Promise(r=>setTimeout(r,ms));let ws;
try {
 let tabs;for(let i=0;i<100;i++){try{tabs=await(await fetch('http://127.0.0.1:9234/json/list')).json();break;}catch{await delay(100);}}
 assert.ok(tabs,'Chrome startup');ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
 let seq=0;const pending=new Map(),errors=[];
 ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params);});
 const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;const timer=setTimeout(()=>{pending.delete(id);reject(Error('Timeout: '+method));},20000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});
 const run=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await call('Page.enable');await call('Runtime.enable');await call('Network.enable');await call('Network.setCacheDisabled',{cacheDisabled:true});
 await call('Page.navigate',{url:'http://127.0.0.1:8769/aulas/04-erros-lineares.html'});
 let ready=false;for(let i=0;i<150;i++){await delay(100);if(await run('Boolean(window.Reveal?.isReady()&&document.querySelector("[data-reading]"))')){ready=true;break;}}
 assert.ok(ready,'Laboratory startup');await run('Reveal.configure({transition:"none"});Reveal.slide(Reveal.getSlides().length-1)');await delay(200);
 const click=role=>run(`document.querySelector('[data-demo="lista-erros"] [data-role="${role}"]').click()`);
 const reset=()=>run('document.querySelector("[data-mode=all]").click()');
 const edit=(index,value)=>run(`(()=>{const input=document.querySelector('[data-error="${index}"]');input.value=${JSON.stringify(value)};input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
 const baseline=value=>run(`(()=>{const select=document.querySelector('[data-role="baseline"]');select.value=${JSON.stringify(value)};select.dispatchEvent(new Event('change'));})()`);
 const state=()=>run(`(()=>{const r=document.querySelector('[data-demo="lista-erros"]'),q=role=>r.querySelector('[data-role="'+role+'"]');return {states:q('states').textContent,summary:q('summary').textContent,history:q('history').textContent,removed:[...r.querySelectorAll('.removed-reading [data-error]')].map(e=>Number(e.dataset.error)),canRemove:!q('remove').disabled,canUndo:!q('undo').disabled,values:[...r.querySelectorAll('[data-reading]')].map(e=>Number(e.textContent.replaceAll(',',''))),offsets:[...r.querySelectorAll('[data-error]')].map(e=>Number(e.value)),height:r.scrollHeight,width:r.scrollWidth};})()`);
 const shot=async name=>{const r=await call('Page.captureScreenshot',{format:'png'});await writeFile(path.join(output,name+'.png'),Buffer.from(r.data,'base64'));};
 const nominal=await state();assert.equal(nominal.values[1],-49);assert.ok(!nominal.canRemove);
 await edit(6,'-2.5');assert.equal((await state()).values[6],8.5);assert.ok((await state()).states.includes('—'));assert.ok(!(await state()).canRemove);
 await click('clear-errors');assert.equal((await state()).values[6],11);assert.deepEqual((await state()).offsets,Array(9).fill(0));
 await reset();const original=await state();assert.ok(original.summary.includes('C = 12.592'));assert.ok(original.canRemove);
 await click('remove');const one=await state();assert.deepEqual(one.removed,[1]);assert.ok(one.summary.includes('C = 11.070'));assert.ok(!one.canRemove);assert.ok(one.states.includes('11.0378'));
 await click('run');assert.deepEqual((await state()).removed,[1]);await click('undo');assert.equal((await state()).states,original.states);
 await baseline('nominal');await edit(1,'100');await edit(2,'40');assert.ok(!(await state()).canRemove);assert.equal((await state()).values[1],51);assert.equal((await state()).values[2],25);await click('run');const twoStart=await state();assert.ok(twoStart.summary.includes('I21'));await shot('two-errors');
 await click('remove');const first=await state();assert.deepEqual(first.removed,[1]);assert.ok(first.canRemove);assert.ok(first.summary.includes('I13'));assert.notEqual(first.states,twoStart.states);
 await click('remove');const second=await state();assert.deepEqual(second.removed,[1,2]);assert.ok(second.summary.includes('C = 9.488'));assert.ok(!second.canRemove);assert.notEqual(second.states,first.states);assert.ok(second.history.includes('I21 → I13'));assert.ok(second.height<=725&&second.width<=1285);await shot('two-removals');
 await click('undo');assert.deepEqual((await state()).removed,[1]);assert.ok((await state()).canRemove);
 await reset();assert.deepEqual((await state()).removed,[]);assert.equal((await state()).values[2],-15);assert.deepEqual((await state()).offsets,Array(9).fill(0));
 await click('recover');assert.ok((await state()).summary.includes('100.108'));assert.ok(!(await state()).canRemove);await click('run');assert.equal((await state()).values[1],49);assert.ok((await state()).canRemove);
 await click('recover');await run('(()=>{const s=document.querySelector("[data-role=weight]");s.value="10";s.dispatchEvent(new Event("change"));})()');assert.ok(!(await state()).canRemove);await click('run');assert.equal((await state()).values[1],49);assert.ok((await state()).states.includes('6.1868'));
 await baseline('nominal');await edit(0,'-40');assert.equal((await state()).values[0],12);await click('run');assert.ok((await state()).canRemove);await click('clear-errors');assert.deepEqual((await state()).removed,[]);assert.deepEqual((await state()).offsets,Array(9).fill(0));
 const audit=await run(`(()=>{const overflow=[];Reveal.getSlides().forEach((s,i)=>{Reveal.slide(i);if(s.scrollHeight>725||s.scrollWidth>1285)overflow.push({i,title:s.querySelector('h2')?.textContent,height:s.scrollHeight,width:s.scrollWidth});});return {overflow,mathErrors:document.querySelectorAll('.math-error,.katex-error').length};})()`);
 assert.deepEqual(audit.overflow,[]);assert.equal(audit.mathErrors,0);assert.deepEqual(errors,[]);
 console.log('Passed: per-channel error sliders, deferred estimates, positive/negative offsets, sequential refits, re-ranked suspect, thresholds, undo/reset, recovery provenance, and slide layout.');
 await call('Browser.close').catch(()=>{});
} finally {ws?.close();server.kill();chrome.kill();}
