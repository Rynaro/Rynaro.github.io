document.addEventListener('DOMContentLoaded', () => {
  const anchor = document.querySelector('.wayfinder__trigger');
  const chart = document.querySelector('.astrolabe');
  const closeButton = chart?.querySelector('.astrolabe__close');
  if (!anchor || !chart || !closeButton) return;

  // The server sends a useful anchor. Only a working script promotes it to a button.
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = anchor.className;
  trigger.innerHTML = anchor.innerHTML;
  const triggerLabel = anchor.getAttribute('aria-label');
  if (triggerLabel) trigger.setAttribute('aria-label', triggerLabel);
  trigger.setAttribute('aria-controls', chart.id);
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-haspopup', 'dialog');
  anchor.replaceWith(trigger);

  const pageRegions = [...document.body.children].filter((element) => (
    !element.matches('.wayfinder') && element.tagName !== 'SCRIPT'
  ));
  const inertBeforeOpen = new Map();
  let returnFocus = trigger;

  chart.setAttribute('role', 'dialog');
  chart.setAttribute('aria-modal', 'true');
  chart.setAttribute('aria-hidden', 'true');

  // A no-JavaScript visit may leave the fallback target in the URL. Once the
  // modal enhancement is active, start closed and return the visitor to the page.
  if (window.location.hash === `#${chart.id}`) {
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}${window.location.search}`
    );
  }

  document.documentElement.classList.add('wayfinder-ready');

  const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function setPageInert(value) {
    pageRegions.forEach((region) => {
      if (value) {
        inertBeforeOpen.set(region, region.inert);
        region.inert = true;
      } else {
        region.inert = inertBeforeOpen.get(region) || false;
      }
    });
    if (!value) inertBeforeOpen.clear();
  }

  function openChart() {
    if (chart.classList.contains('is-open')) return;
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : trigger;
    setPageInert(true);
    chart.classList.add('is-open');
    chart.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    trigger.tabIndex = -1;
    document.documentElement.classList.add('wayfinder-open');
    closeButton.focus();
  }

  function closeChart() {
    if (!chart.classList.contains('is-open')) return;
    chart.classList.remove('is-open');
    chart.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.removeAttribute('tabindex');
    document.documentElement.classList.remove('wayfinder-open');
    setPageInert(false);
    returnFocus?.focus();
  }

  function trapFocus(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeChart();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusables = [...chart.querySelectorAll(focusableSelector)].filter((element) => element.getClientRects().length > 0);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  trigger.addEventListener('click', openChart);
  closeButton.addEventListener('click', closeChart);
  chart.addEventListener('keydown', trapFocus);
  chart.addEventListener('click', (event) => {
    if (event.target === chart) closeChart();
  });
});
