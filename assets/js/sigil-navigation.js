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
  const constellations = window.WayfinderConstellations?.mount(chart);

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
    constellations?.render();
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

(() => {
  const fallback = Object.freeze({ latitude: -23.5505, longitude: -46.6333, label: 'São Paulo fallback' });
  const radians = (degrees) => degrees * Math.PI / 180;
  const degrees = (value) => value * 180 / Math.PI;
  const wrap = (value) => ((value % 360) + 360) % 360;

  function horizontalPosition(rightAscension, declination, latitude, longitude, date = new Date()) {
    const julianDate = date.getTime() / 86400000 + 2440587.5;
    const sidereal = wrap(280.46061837 + 360.98564736629 * (julianDate - 2451545) + longitude);
    const hourAngle = radians(wrap(sidereal - rightAscension));
    const dec = radians(declination);
    const lat = radians(latitude);
    const altitude = Math.asin(Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(hourAngle));
    const azimuth = Math.atan2(Math.sin(hourAngle), Math.cos(hourAngle) * Math.sin(lat) - Math.tan(dec) * Math.cos(lat)) + Math.PI;
    return { altitude: degrees(altitude), azimuth: wrap(degrees(azimuth)) };
  }

  function project(position, width, height) {
    if (position.altitude < 0) return null;
    const radius = Math.min(width, height) * 0.46 * (90 - position.altitude) / 90;
    const azimuth = radians(position.azimuth);
    return { x: width / 2 + radius * Math.sin(azimuth), y: height / 2 - radius * Math.cos(azimuth) };
  }

  function mount(chart) {
    const canvas = chart?.querySelector('[data-wayfinder-constellations]');
    const locate = chart?.querySelector('[data-constellation-locate]');
    const status = chart?.querySelector('[data-constellation-status]');
    if (!canvas || !locate || !status || !canvas.getContext) return null;
    const context = canvas.getContext('2d');
    if (!context) return null;
    chart.classList.add('are-constellations-ready');
    let observer = fallback;
    let catalog;
    let loading;

    function loadCatalog() {
      if (!loading) loading = fetch(canvas.dataset.catalogUrl, { credentials: 'same-origin' }).then((response) => {
        if (!response.ok) throw new Error(`Constellation catalog ${response.status}`);
        return response.json();
      }).then((data) => { catalog = data; }).catch(() => { status.textContent = 'The constellation chart is temporarily unavailable'; });
      return loading;
    }

    function draw() {
      if (!catalog || !chart.classList.contains('is-open')) return;
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(bounds.width * ratio);
      canvas.height = Math.round(bounds.height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, bounds.width, bounds.height);
      const now = new Date();
      const points = new Map();
      catalog.stars.forEach((star) => points.set(star.id, project(horizontalPosition(star.ra, star.dec, observer.latitude, observer.longitude, now), bounds.width, bounds.height)));
      context.lineWidth = 0.75;
      context.strokeStyle = 'rgba(129, 181, 214, .38)';
      catalog.constellations.forEach((constellation) => constellation.lines.forEach(([from, to]) => {
        const a = points.get(from);
        const b = points.get(to);
        if (!a || !b) return;
        context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
      }));
      catalog.stars.forEach((star) => {
        const point = points.get(star.id);
        if (!point) return;
        const radius = Math.max(0.8, 3.2 - star.mag * 0.65);
        context.beginPath(); context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.fillStyle = star.mag < 0.6 ? '#fff4d2' : 'rgba(222, 235, 255, .9)';
        context.shadowColor = '#b7d7ff'; context.shadowBlur = star.mag < 1 ? 7 : 3; context.fill();
      });
      context.shadowBlur = 0;
      status.textContent = `Visible constellations · ${observer.label} · ${now.toISOString().slice(11, 16)} UTC`;
    }

    function render() { loadCatalog().then(draw); }
    locate.addEventListener('click', () => {
      if (!navigator.geolocation) { status.textContent = 'Location is unavailable · using São Paulo'; return; }
      locate.disabled = true;
      status.textContent = 'Waiting for location permission…';
      navigator.geolocation.getCurrentPosition((position) => {
        observer = { latitude: position.coords.latitude, longitude: position.coords.longitude, label: 'your location' };
        locate.textContent = 'Using my location'; render();
      }, () => {
        locate.disabled = false; status.textContent = 'Location not shared · using São Paulo'; render();
      }, { enableHighAccuracy: false, maximumAge: 600000, timeout: 10000 });
    });
    window.addEventListener('resize', draw);
    return { render };
  }

  window.WayfinderConstellations = Object.freeze({ horizontalPosition, project, mount });
})();
