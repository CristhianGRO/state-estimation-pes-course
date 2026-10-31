/* Protect TeX before Markdown can interpret escapes, underscores, or HTML. */
(() => {
  'use strict';
  const escape=s=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const block=/^\$\$([\s\S]*?)\$\$(?:\n|$)/;
  const inline=/^\$(?!\$)((?:\\.|[^$\\])+?)\$(?!\$)/;
  function extensions() {
    return [
      {name:'texBlock',level:'block',start:src=>src.indexOf('$$'),tokenizer(src){const m=block.exec(src);if(m)return {type:'texBlock',raw:m[0],text:m[1].trim()};},renderer:token=>`<div class="tex-math" data-display="true" data-tex="${escape(token.text)}"></div>\n`},
      {name:'texInline',level:'inline',start:src=>src.search(/(?<!\\)\$(?!\$)/),tokenizer(src){const m=inline.exec(src);if(m)return {type:'texInline',raw:m[0],text:m[1]};},renderer:token=>`<span class="tex-math" data-tex="${escape(token.text)}"></span>`}
    ];
  }
  function render(root=document) {
    root.querySelectorAll('.tex-math[data-tex]').forEach(element=>{
      try {
        if(!window.katex)throw new Error('The math renderer could not be loaded.');
        window.katex.render(element.dataset.tex,element,{displayMode:element.dataset.display==='true',throwOnError:true,strict:'warn',trust:false});
        element.classList.remove('math-error');
      } catch(error) {
        element.classList.add('math-error');element.textContent=element.dataset.tex;element.title=error.message;
        console.error('LaTeX rendering failed:',element.dataset.tex,error.message);
      }
    });
  }
  const api={extensions,render,block,inline};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(typeof window!=='undefined')window.SEPMath=api;
})();
