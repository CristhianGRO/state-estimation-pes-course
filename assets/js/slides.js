(() => {
  if (!window.Reveal) {
    document.body.insertAdjacentHTML('beforeend', '<p class="boot-error">Não foi possível carregar o Reveal.js. Verifique a conexão com a internet.</p>');
    return;
  }
  Reveal.initialize({
    hash: true, controls: true, progress: true, slideNumber: 'c/t',
    center: true, transition: 'slide', backgroundTransition: 'fade',
    width: 1280, height: 720, margin: 0.055, minScale: 0.2, maxScale: 1.7,
    plugins: [RevealMarkdown, RevealMath.KaTeX, RevealNotes, RevealHighlight],
    katex: {version:'0.16.25', delimiters: [
      {left: '$$', right: '$$', display: true},
      {left: '$', right: '$', display: false},
      {left: '\\(', right: '\\)', display: false},
      {left: '\\[', right: '\\]', display: true}
    ]}
  }).then(() => {
    document.querySelectorAll('[data-demo]').forEach(section => {
      if (window.SEPExperimentos) window.SEPExperimentos.mount(section);
    });
  }).catch(err => console.error('Não foi possível inicializar os slides:', err));
})();
