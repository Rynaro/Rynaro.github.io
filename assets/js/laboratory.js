document.addEventListener('DOMContentLoaded', () => {
  const laboratory = document.querySelector('[data-laboratory]');
  if (!laboratory) return;
  const controls = laboratory.querySelector('[data-laboratory-controls]');
  const search = laboratory.querySelector('[data-project-search]');
  const buttons = [...laboratory.querySelectorAll('[data-filter]')];
  const projects = [...laboratory.querySelectorAll('[data-project]')];
  const sections = [...laboratory.querySelectorAll('[data-project-section]')];
  const count = laboratory.querySelector('[data-result-count]');
  const empty = laboratory.querySelector('[data-empty-state]');
  const reset = laboratory.querySelector('[data-reset-laboratory]');
  if (!controls || !search || !buttons.length || !projects.length || !count || !empty) return;
  let activeCategory = 'all';
  controls.hidden = false;
  const update = () => {
    const term = search.value.trim().toLocaleLowerCase();
    let visible = 0;
    projects.forEach((project) => {
      const matchesCategory = activeCategory === 'all' || project.dataset.category === activeCategory;
      const matchesSearch = !term || project.dataset.search.includes(term);
      project.hidden = !(matchesCategory && matchesSearch);
      if (!project.hidden) visible += 1;
    });
    sections.forEach((section) => { section.hidden = !section.querySelector('[data-project]:not([hidden])'); });
    count.textContent = `${visible} ${visible === 1 ? 'artifact' : 'artifacts'} charted`;
    empty.hidden = visible !== 0;
  };
  buttons.forEach((button) => button.addEventListener('click', () => {
    activeCategory = button.dataset.filter;
    buttons.forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
    update();
  }));
  search.addEventListener('input', update);
  reset?.addEventListener('click', () => {
    activeCategory = 'all'; search.value = '';
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === 'all')));
    update(); search.focus();
  });
  update();
});
