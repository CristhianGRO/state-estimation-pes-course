(() => {
  if (!window.Reveal) {
    document.body.insertAdjacentHTML('beforeend', '<p class="boot-error">The presentation could not be loaded. Please check your internet connection.</p>');
    return;
  }
  const markdown=RevealMarkdown();
  markdown.marked.use({extensions:window.SEPMath.extensions()});
  Reveal.initialize({
    hash: true, controls: true, progress: true, slideNumber: 'c/t',
    center: true, transition: 'slide', backgroundTransition: 'fade',
    width: 1280, height: 720, margin: 0.055, minScale: 0.2, maxScale: 1.7,
    plugins: [markdown, RevealNotes, RevealHighlight]
  }).then(() => {
    document.querySelectorAll('[data-demo]').forEach(section => {
      if (section.dataset.demo === 'wls-ca' && window.SEPWLSCA) window.SEPWLSCA.mount(section);
      else if (section.dataset.demo === 'dynamic' && window.SEPDynamic) window.SEPDynamic.mount(section);
      else if (window.SEPLabsDisciplina) window.SEPLabsDisciplina.mount(section);
    });
    window.SEPMath.render();
    Reveal.layout();
  }).catch(err => console.error('The presentation could not be initialized:', err));
})();
