(() => {
  const list = document.querySelector('[data-career-list]');
  const controls = document.querySelector('[data-career-controls]');
  const toggle = controls?.querySelector('[data-career-toggle]');
  const status = controls?.querySelector('[data-career-status]');
  const entries = list ? [...list.querySelectorAll('[data-career-entry]')] : [];
  const initialCount = 5;

  if (!list || !controls || !toggle || !status || entries.length <= initialCount) return;

  const setExpanded = (expanded, announce = false) => {
    entries.slice(initialCount).forEach((entry) => { entry.hidden = !expanded; });
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.textContent = expanded ? 'Close the complete chronicle' : 'Open the complete chronicle';
    if (announce) {
      status.textContent = expanded
        ? `Complete quest chronicle shown: ${entries.length} roles.`
        : `Quest chronicle shortened to the ${initialCount} most recent roles.`;
    }
  };

  setExpanded(false);
  controls.hidden = false;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') !== 'true';
    list.classList.toggle('is-revealing', expanded);
    setExpanded(expanded, true);
    if (!expanded) {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      list.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  });
})();
