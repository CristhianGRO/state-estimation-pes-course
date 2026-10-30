(() => {
  const input = document.querySelector('#search');
  const cards = [...document.querySelectorAll('.lesson-card')];
  const empty = document.querySelector('#search-empty');
  if (!input) return;
  input.addEventListener('input', () => {
    const query = input.value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let shown = 0;
    for (const card of cards) {
      const haystack = card.dataset.search.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const matches = haystack.includes(query);
      card.hidden = !matches;
      if (matches) shown++;
    }
    empty.hidden = Boolean(shown);
  });
})();
