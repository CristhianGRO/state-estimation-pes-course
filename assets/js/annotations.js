/* Per-slide ink and text, stored locally without changing course content. */
(() => {
  'use strict';
  function mount(deck) {
    const NS='http://www.w3.org/2000/svg', storageKey='sep-annotations:v1:'+location.pathname;
    const colors=['#d33232','#1765c1','#008575','#142b42'];
    let pages={}, mode='off', color=colors[0], width=3, gesture=null, editor=null, storageOK=true, designTop=0;
    const history=new Map(), originalTouch=deck.getConfig().touch;
    const key=()=>{const i=deck.getIndices();return `${i.h}.${i.v||0}`;};
    const items=(id=key())=>pages[id]||(pages[id]=[]);
    // Parse only supported primitives. Never insert stored text as HTML.
    try {
      const saved=JSON.parse(localStorage.getItem(storageKey)||'null');
      if(saved?.version===1 && saved.pages && typeof saved.pages==='object') {
        for(const [id,shapes] of Object.entries(saved.pages)) {
          if(!/^\d+\.\d+$/.test(id)||!Array.isArray(shapes))continue;
          pages[id]=shapes.filter(s=>s && colors.includes(s.color) && (
            s.type==='ink' && Number.isFinite(s.width) && s.width>=1 && s.width<=12 && Array.isArray(s.points) && s.points.length>0 && s.points.length<=20000 && s.points.every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)) ||
            s.type==='text' && Number.isFinite(s.x) && Number.isFinite(s.y) && typeof s.text==='string' && s.text.length<=4000
          ));
        }
      }
    } catch { storageOK=false; }
    const layer=document.createElement('div');layer.className='annotation-layer';
    const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 1280 720');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-label','Slide annotations');
    layer.append(svg);document.body.append(layer);
    const toolbar=document.createElement('div');toolbar.className='annotation-toolbar';toolbar.setAttribute('role','group');toolbar.setAttribute('aria-label','Slide annotation tools');
    toolbar.innerHTML=`<button type="button" data-action="pen" title="Toggle pen (A)" aria-label="Toggle annotation pen (A)">✎ <span>Annotate</span></button>
      <div class="annotation-options" hidden>
        <button type="button" data-action="text" title="Text (T)">Text</button>
        <button type="button" data-action="erase" title="Eraser (E)">Eraser</button>
        <label>Color <select aria-label="Annotation color">${colors.map((c,i)=>`<option value="${c}">${['Red','Blue','Teal','Navy'][i]}</option>`).join('')}</select></label>
        <label>Width <select aria-label="Pen width"><option value="3">Thin</option><option value="6">Thick</option></select></label>
        <button type="button" data-action="undo" title="Undo (Ctrl+Z / ⌘Z)">Undo</button>
        <button type="button" data-action="clear" title="Clear this slide (can be undone)">Clear slide</button>
        <button type="button" data-action="off" title="Exit annotation mode (Esc)">Done</button>
        <span class="annotation-status" role="status" aria-live="polite"></span>
      </div>`;
    document.body.append(toolbar);
    const options=toolbar.querySelector('.annotation-options'),status=toolbar.querySelector('.annotation-status');
    function save() {
      try {localStorage.setItem(storageKey,JSON.stringify({version:1,pages}));storageOK=true;}
      catch {storageOK=false;}
      status.textContent=storageOK?'Saved in this browser':'Not saved: browser storage unavailable';
    }
    function remember(id=key()) {
      if(!history.has(id))history.set(id,[]);
      const stack=history.get(id);stack.push(JSON.stringify(items(id)));if(stack.length>30)stack.shift();
    }
    function node(shape) {
      if(shape.type==='ink') {
        const el=document.createElementNS(NS,'polyline');el.setAttribute('points',shape.points.map(p=>p.join(',')).join(' '));el.setAttribute('fill','none');el.setAttribute('stroke',shape.color);el.setAttribute('stroke-width',shape.width);el.setAttribute('stroke-linecap','round');el.setAttribute('stroke-linejoin','round');
        // A one-point stroke is represented as a tiny segment so taps are visible.
        if(shape.points.length===1){const [x,y]=shape.points[0];el.setAttribute('points',`${x},${y} ${x+.01},${y}`);}
        return el;
      }
      const el=document.createElementNS(NS,'text');el.setAttribute('x',shape.x);el.setAttribute('y',shape.y);el.setAttribute('fill',shape.color);el.setAttribute('font-size','24');el.setAttribute('font-family','DM Sans, Arial, sans-serif');
      shape.text.split('\n').forEach((line,i)=>{const span=document.createElementNS(NS,'tspan');span.setAttribute('x',shape.x);span.setAttribute('dy',i===0?'0':'30');span.textContent=line||' ';el.append(span);});return el;
    }
    function render() {svg.replaceChildren(...items().map(node));toolbar.querySelector('[data-action="undo"]').disabled=!history.get(key())?.length;}
    function layout() {
      // Store coordinates relative to slide content, not its vertical centering.
      // This also follows sections in Reveal's mobile scroll view.
      const slide=deck.getCurrentSlide(),rect=slide.getBoundingClientRect(),scale=rect.width/1280;
      designTop=deck.getConfig().center?Math.max(0,(720-slide.offsetHeight)/2):0;
      Object.assign(layer.style,{left:rect.left+'px',top:(rect.top-designTop*scale)+'px',width:rect.width+'px',height:720*scale+'px'});
      svg.setAttribute('viewBox',`0 ${-designTop} 1280 720`);
      if(editor)Object.assign(editor.input.style,{top:(editor.y-24+designTop)/720*100+'%',fontSize:24*scale+'px'});
      layer.hidden=deck.isOverview() || deck.isPaused();
    }
    let layoutFrame=0;
    function scheduleLayout() {cancelAnimationFrame(layoutFrame);layoutFrame=requestAnimationFrame(layout);}
    function finish() {
      if(!gesture)return;
      if(gesture.changed)save();gesture=null;render();
    }
    function commitText(cancel=false) {
      if(!editor)return;
      const current=editor;editor=null;
      if(!cancel && current.input.value.trim()) {
        remember(current.id);items(current.id).push({type:'text',x:current.x,y:current.y,color:current.color,text:current.input.value.trim().slice(0,4000)});save();
      }
      current.input.remove();render();
    }
    function setMode(next) {
      finish();commitText();mode=next;
      layer.dataset.mode=mode;options.hidden=mode==='off';
      toolbar.querySelector('[data-action="pen"]').setAttribute('aria-pressed',String(mode==='pen'));
      for(const name of ['text','erase'])toolbar.querySelector(`[data-action="${name}"]`).setAttribute('aria-pressed',String(mode===name));
      deck.configure({touch:mode==='off'?originalTouch:false});
      status.textContent=!storageOK?'Not saved: browser storage unavailable':mode==='text'?'Click to type · Ctrl+Enter saves · Esc cancels':mode==='erase'?'Drag to erase · Undo restores':'Draw with mouse, touch, or pen · Esc finishes';
      layout();render();
    }
    function undo() {
      finish();commitText();const previous=history.get(key())?.pop();
      if(previous){pages[key()]=JSON.parse(previous);save();render();}
    }
    function clear() {finish();commitText();if(items().length){remember();pages[key()]=[];save();render();}}
    toolbar.addEventListener('click',event=>{
      const action=event.target.closest('[data-action]')?.dataset.action;
      if(action==='pen')setMode(mode==='pen'?'off':'pen');
      else if(action==='text'||action==='erase'||action==='off')setMode(action);
      else if(action==='undo')undo();else if(action==='clear')clear();
    });
    toolbar.querySelector('[aria-label="Annotation color"]').addEventListener('change',event=>{color=event.target.value;});
    toolbar.querySelector('[aria-label="Pen width"]').addEventListener('change',event=>{width=Number(event.target.value);});
    function point(event) {
      const rect=layer.getBoundingClientRect();
      return [Math.max(0,Math.min(1280,(event.clientX-rect.left)*1280/rect.width)),Math.max(0,Math.min(720,(event.clientY-rect.top)*720/rect.height))-designTop];
    }
    function distance(p,a,b) {
      const dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy,t=len?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/len)):0;
      return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);
    }
    function erase(p) {
      const shapes=items(gesture.id);
      const index=shapes.findLastIndex(s=>{
        if(s.type==='text') {const lines=s.text.split('\n');return p[0]>=s.x-10&&p[0]<=s.x+Math.max(...lines.map(l=>l.length))*24&&p[1]>=s.y-26&&p[1]<=s.y+(lines.length-1)*30+10;}
        return s.points.some((a,i)=>distance(p,a,s.points[Math.max(0,i-1)])<=12+s.width/2);
      });
      if(index<0)return;
      if(!gesture.changed)remember(gesture.id);
      shapes.splice(index,1);gesture.changed=true;render();
    }
    svg.addEventListener('pointerdown',event=>{
      if(mode==='off'||event.button!==0||gesture)return;
      event.preventDefault();event.stopPropagation();commitText();
      const [x,y]=point(event);
      if(mode==='text') {
        const input=document.createElement('textarea');input.className='annotation-editor';input.setAttribute('aria-label','Annotation text');input.placeholder='Type a note…';input.maxLength=4000;input.rows=3;
        const top=Math.max(0,Math.min(y+designTop,610));
        Object.assign(input.style,{left:Math.min(x,950)/1280*100+'%',top:top/720*100+'%',fontSize:24*layer.getBoundingClientRect().width/1280+'px',color});
        editor={input,id:key(),x:Math.min(x,950),y:top-designTop+24,color};
        input.addEventListener('blur',()=>commitText());input.addEventListener('keydown',event=>{
          event.stopPropagation();if(event.key==='Escape'){event.preventDefault();commitText(true);}
          else if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)){event.preventDefault();commitText();}
        });layer.append(input);input.focus();return;
      }
      gesture={id:key(),pointer:event.pointerId,changed:false};svg.setPointerCapture(event.pointerId);
      if(mode==='pen') {remember();const shape={type:'ink',color,width,points:[[x,y]]};items().push(shape);gesture.shape=shape;gesture.changed=true;render();gesture.element=svg.lastElementChild;}
      else erase([x,y]);
    });
    svg.addEventListener('pointermove',event=>{
      if(!gesture||event.pointerId!==gesture.pointer)return;
      event.preventDefault();const p=point(event);
      if(gesture.shape) {
        const points=gesture.shape.points,last=points[points.length-1];
        if(points.length<20000&&Math.hypot(p[0]-last[0],p[1]-last[1])>.7){points.push(p);gesture.element.setAttribute('points',points.map(v=>v.join(',')).join(' '));}
      } else erase(p);
    });
    for(const event of ['pointerup','pointercancel','lostpointercapture'])svg.addEventListener(event,finish);
    deck.addKeyBinding({keyCode:65,key:'A',description:'Toggle annotation pen'},()=>setMode(mode==='pen'?'off':'pen'));
    deck.addKeyBinding({keyCode:84,key:'T',description:'Add annotation text'},()=>setMode('text'));
    deck.addKeyBinding({keyCode:69,key:'E',description:'Erase annotations'},()=>setMode('erase'));
    document.addEventListener('keydown',event=>{
      if(event.target.closest('input,textarea,select,[contenteditable="true"]'))return;
      if(mode!=='off'&&event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();setMode('off');}
      else if(mode!=='off'&&(event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();event.stopImmediatePropagation();undo();}
    },true);
    deck.on('slidechanged',()=>{finish();commitText();layout();render();});
    deck.on('resize',scheduleLayout);deck.on('overviewshown',()=>{setMode('off');layout();});deck.on('overviewhidden',scheduleLayout);deck.on('paused',layout);deck.on('resumed',layout);
    window.addEventListener('resize',scheduleLayout);
    document.addEventListener('scroll',scheduleLayout,true);
    window.addEventListener('pagehide',()=>{finish();commitText();});
    setMode('off');
  }
  window.SEPAnnotations={mount};
})();
