document.addEventListener('DOMContentLoaded', () => {
  const anchor = document.querySelector('.wayfinder__trigger');
  const chart = document.querySelector('.astrolabe');
  const closeButton = chart?.querySelector('[data-wayfinder-close]');
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

  const views = new Map(
    [...chart.querySelectorAll('[data-wayfinder-view]')].map((view) => [view.dataset.wayfinderView, view])
  );
  const chartView = views.get('chart');
  const gameView = views.get('harmonic-seal');
  if (!chartView) return;

  const pageRegions = [...document.body.children].filter((element) => (
    !element.matches('.wayfinder') && element.tagName !== 'SCRIPT'
  ));
  const inertBeforeOpen = new Map();
  let returnFocus = trigger;
  let currentView = 'chart';
  const constellations = window.WayfinderConstellations?.mount(chart);
  const game = gameView ? window.HarmonicSeal?.mount(gameView, { onBack: () => setView('chart', true) }) : null;
  const gameInvitation = game ? document.querySelector('[data-harmonic-seal-invitation]') : null;
  const playTriggers = game ? [...document.querySelectorAll('[data-wayfinder-open="harmonic-seal"]')] : [];

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

  if (gameInvitation) gameInvitation.hidden = false;
  playTriggers.forEach((playTrigger) => {
    playTrigger.setAttribute('aria-controls', chart.id);
    playTrigger.setAttribute('aria-expanded', 'false');
    playTrigger.setAttribute('aria-haspopup', 'dialog');
  });

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

  function setView(viewName, moveFocus = false) {
    if (!views.has(viewName) || (viewName === 'harmonic-seal' && !game)) return;
    currentView = viewName;
    views.forEach((view, name) => { view.hidden = name !== currentView; });
    chart.dataset.wayfinderViewCurrent = currentView;
    chart.setAttribute('aria-labelledby', currentView === 'chart' ? 'astrolabe-title' : 'harmonic-seal-title');
    closeButton.setAttribute('aria-label', currentView === 'chart' ? 'Close navigation chart' : 'Close The Harmonic Seal');
    if (currentView === 'chart') constellations?.render();
    if (moveFocus) {
      if (currentView === 'chart') chartView.querySelector('a[href], button:not([disabled])')?.focus();
      else game.focusInitial();
    }
  }

  function setTriggersExpanded(value) {
    trigger.setAttribute('aria-expanded', String(value));
    playTriggers.forEach((playTrigger) => playTrigger.setAttribute('aria-expanded', String(value)));
  }

  function openDialog(viewName, invoker) {
    if (viewName === 'harmonic-seal' && !game) return;
    returnFocus = invoker instanceof HTMLElement ? invoker : trigger;
    setView(viewName);
    if (chart.classList.contains('is-open')) {
      if (viewName === 'harmonic-seal') game.focusInitial();
      return;
    }
    setPageInert(true);
    chart.classList.add('is-open');
    chart.setAttribute('aria-hidden', 'false');
    setTriggersExpanded(true);
    trigger.tabIndex = -1;
    document.documentElement.classList.add('wayfinder-open');
    if (viewName === 'harmonic-seal') game.focusInitial();
    else {
      closeButton.focus();
      constellations?.render();
    }
  }

  function closeChart() {
    if (!chart.classList.contains('is-open')) return;
    chart.classList.remove('is-open');
    chart.setAttribute('aria-hidden', 'true');
    setTriggersExpanded(false);
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

  trigger.addEventListener('click', () => openDialog('chart', trigger));
  playTriggers.forEach((playTrigger) => {
    playTrigger.addEventListener('click', () => openDialog('harmonic-seal', playTrigger));
  });
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

  function horizonFade(altitude) {
    if (altitude <= 0) return 0;
    if (altitude >= 12) return 1;
    const t = altitude / 12;
    return t * t * (3 - 2 * t);
  }

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
    return {
      x: width / 2 + radius * Math.sin(azimuth),
      y: height / 2 - radius * Math.cos(azimuth),
      altitude: position.altitude,
      horizonOpacity: horizonFade(position.altitude),
    };
  }

  function profileForWidth(width) {
    if (width <= 576) return Object.freeze({ name: 'compact', magnitudeLimit: 2.75, maxFigures: 6, maxStars: 28, maxLabels: 0, labelMinMembers: Infinity, labelMinAltitude: Infinity, washOpacity: 0.014, washWidth: 12 });
    if (width <= 1024) return Object.freeze({ name: 'tablet', magnitudeLimit: 3.5, maxFigures: 18, maxStars: Infinity, maxLabels: 4, labelMinMembers: 2, labelMinAltitude: 18, washOpacity: 0.022, washWidth: 18 });
    return Object.freeze({ name: 'desktop', magnitudeLimit: Infinity, maxFigures: 18, maxStars: Infinity, maxLabels: 7, labelMinMembers: 3, labelMinAltitude: 12, washOpacity: 0.035, washWidth: 28 });
  }

  function rankVisibleFigures(catalog, points, profile) {
    const stars = new Map(catalog.stars.map((star) => [star.id, star]));
    const ranked = catalog.constellations.map((figure) => {
      const visibleMembers = figure.members.filter((id) => stars.get(id).mag <= profile.magnitudeLimit && points.get(id));
      const score = visibleMembers.reduce((sum, id) => {
        const star = stars.get(id);
        return sum + points.get(id).horizonOpacity * (4.5 - star.mag);
      }, visibleMembers.length * 2);
      return { figure, visibleMembers, score };
    }).filter(({ visibleMembers }) => visibleMembers.length > 0)
      .sort((a, b) => b.score - a.score || a.figure.labelPriority - b.figure.labelPriority || a.figure.name.localeCompare(b.figure.name));

    const selected = [];
    let starCount = 0;
    for (const entry of ranked) {
      if (selected.length >= profile.maxFigures) break;
      if (starCount + entry.visibleMembers.length > profile.maxStars) continue;
      selected.push(entry);
      starCount += entry.visibleMembers.length;
    }
    return selected;
  }

  function galacticEquatorPoint(rightAscension) {
    const poleRa = radians(192.85948);
    const poleDec = radians(27.12825);
    const ra = radians(rightAscension);
    return { ra: wrap(rightAscension), dec: degrees(Math.atan2(-Math.cos(poleDec) * Math.cos(ra - poleRa), Math.sin(poleDec))) };
  }

  function sampleGalacticEquator(observer, now, width, height, step = 6) {
    const samples = [];
    for (let ra = 0; ra <= 360; ra += step) {
      const equatorial = galacticEquatorPoint(ra);
      samples.push(project(horizontalPosition(equatorial.ra, equatorial.dec, observer.latitude, observer.longitude, now), width, height));
    }
    return samples;
  }

  function traceHorizonSegments(context, samples) {
    context.beginPath();
    let drawing = false;
    samples.forEach((point) => {
      if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) { drawing = false; return; }
      if (drawing) context.lineTo(point.x, point.y);
      else { context.moveTo(point.x, point.y); drawing = true; }
    });
  }

  function milkyWayLayers(profile) {
    return [
      { width: profile.washWidth, opacity: profile.washOpacity, color: '#9b8bb0' },
      { width: Math.max(1, profile.washWidth * .34), opacity: profile.washOpacity * 1.8, color: '#d2c3df' },
    ];
  }

  function drawMilkyWay(context, observer, now, width, height, profile) {
    const samples = sampleGalacticEquator(observer, now, width, height);
    context.lineCap = 'round';
    milkyWayLayers(profile).forEach((layer) => {
      traceHorizonSegments(context, samples);
      context.globalAlpha = layer.opacity;
      context.lineWidth = layer.width;
      context.strokeStyle = layer.color;
      context.stroke();
    });
    context.globalAlpha = 1;
    context.lineCap = 'butt';
  }

  function boxesOverlap(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  }

  function placeLabels(selected, points, profile, width, height, measureText = (text) => text.length * 5.5) {
    if (!profile.maxLabels) return [];
    const occupied = [];
    const placements = [];
    const center = { x: width / 2, y: height / 2 };
    const skyRadius = Math.min(width, height) * .46;
    const medallionRadius = Math.min(width, height) * .105;
    const offsets = [[0,-14],[14,-10],[14,4],[10,14],[0,16],[-10,14],[-14,4],[-14,-10]];
    for (const { figure, visibleMembers } of [...selected].sort((a, b) => a.figure.labelPriority - b.figure.labelPriority || a.figure.name.localeCompare(b.figure.name))) {
      if (placements.length >= profile.maxLabels || visibleMembers.length < profile.labelMinMembers) continue;
      const members = visibleMembers.map((id) => points.get(id));
      if (Math.max(...members.map((point) => point.altitude)) < profile.labelMinAltitude) continue;
      const anchor = { x: members.reduce((sum, point) => sum + point.x, 0) / members.length, y: members.reduce((sum, point) => sum + point.y, 0) / members.length };
      const text = figure.name.toUpperCase();
      const textWidth = measureText(text);
      for (const [dx, dy] of offsets) {
        const x = anchor.x + dx;
        const y = anchor.y + dy;
        const box = { left: x - textWidth / 2 - 4, right: x + textWidth / 2 + 4, top: y - 7, bottom: y + 7 };
        const corners = [[box.left,box.top],[box.right,box.top],[box.left,box.bottom],[box.right,box.bottom]];
        const insideSky = corners.every(([px, py]) => Math.hypot(px - center.x, py - center.y) <= skyRadius);
        const closestX = Math.max(box.left, Math.min(center.x, box.right));
        const closestY = Math.max(box.top, Math.min(center.y, box.bottom));
        const outsideMedallion = Math.hypot(closestX - center.x, closestY - center.y) >= medallionRadius;
        if (!insideSky || !outsideMedallion || occupied.some((other) => boxesOverlap(box, other))) continue;
        const placement = { name: figure.name, text, x, y, box };
        occupied.push(box); placements.push(placement); break;
      }
    }
    return placements;
  }

  function drawLabels(context, selected, points, profile, width, height) {
    context.font = '600 9px sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = 'rgba(209,167,101,.7)';
    const placements = placeLabels(selected, points, profile, width, height, (text) => context.measureText ? context.measureText(text).width : text.length * 5.5);
    placements.forEach((label) => context.fillText(label.text, label.x, label.y));
    return placements;
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
    let resizeFrame = null;
    let lastMetrics = null;
    let renderCount = 0;
    const requestFrame = window.requestAnimationFrame?.bind(window) || ((callback) => callback());

    function loadCatalog() {
      if (!loading) loading = fetch(canvas.dataset.catalogUrl, { credentials: 'same-origin' }).then((response) => {
        if (!response.ok) throw new Error(`Constellation catalog ${response.status}`);
        return response.json();
      }).then((data) => { catalog = data; }).catch(() => { status.textContent = 'The constellation chart is temporarily unavailable'; });
      return loading;
    }

    function draw() {
      if (!catalog || !chart.classList.contains('is-open')) return;
      const startedAt = window.performance?.now ? window.performance.now() : Date.now();
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(bounds.width * ratio);
      canvas.height = Math.round(bounds.height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, bounds.width, bounds.height);
      const now = new Date();
      const profile = profileForWidth(window.innerWidth || bounds.width);
      const points = new Map();
      catalog.stars.forEach((star) => points.set(star.id, project(horizontalPosition(star.ra, star.dec, observer.latitude, observer.longitude, now), bounds.width, bounds.height)));
      const selected = rankVisibleFigures(catalog, points, profile);
      const selectedIds = new Set(selected.flatMap(({ visibleMembers }) => visibleMembers));
      drawMilkyWay(context, observer, now, bounds.width, bounds.height, profile);
      context.lineWidth = 0.75;
      context.strokeStyle = 'rgba(129, 181, 214, .38)';
      selected.forEach(({ figure }) => figure.lines.forEach(([from, to]) => {
        const a = points.get(from);
        const b = points.get(to);
        if (!a || !b || !selectedIds.has(from) || !selectedIds.has(to)) return;
        context.globalAlpha = Math.min(a.horizonOpacity, b.horizonOpacity);
        context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
      }));
      context.globalAlpha = 1;
      catalog.stars.filter((star) => selectedIds.has(star.id)).forEach((star) => {
        const point = points.get(star.id);
        if (!point) return;
        const radius = Math.max(0.8, 3.2 - star.mag * 0.65);
        context.beginPath(); context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.globalAlpha = point.horizonOpacity;
        context.fillStyle = star.mag < 0.6 ? '#fff4d2' : 'rgba(222, 235, 255, .9)';
        context.shadowColor = '#b7d7ff'; context.shadowBlur = star.mag < 1 ? 7 : 3; context.fill();
      });
      context.shadowBlur = 0; context.globalAlpha = 1;
      const labels = drawLabels(context, selected, points, profile, bounds.width, bounds.height);
      lastMetrics = { profile: profile.name, figures: selected.length, eligibleFigures: profile.name === 'compact' ? selected.length : catalog.constellations.length, stars: selectedIds.size, labels: labels.length };
      renderCount++;
      canvas.dataset.renderProfile = profile.name;
      canvas.dataset.renderFigures = String(lastMetrics.figures);
      canvas.dataset.renderEligibleFigures = String(lastMetrics.eligibleFigures);
      canvas.dataset.renderStars = String(lastMetrics.stars);
      canvas.dataset.renderLabels = String(lastMetrics.labels);
      canvas.dataset.labelBoxes = JSON.stringify(labels.map((label) => label.box));
      canvas.dataset.renderCount = String(renderCount);
      canvas.dataset.renderMs = ((window.performance?.now ? window.performance.now() : Date.now()) - startedAt).toFixed(2);
      status.textContent = `Visible constellations · ${observer.label} · ${now.toISOString().slice(11, 16)} UTC`;
    }

    function render() { loadCatalog().then(draw); }
    function scheduleDraw() {
      if (resizeFrame !== null) return;
      resizeFrame = requestFrame(() => { resizeFrame = null; draw(); });
    }
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
    window.addEventListener('resize', scheduleDraw);
    return { render, metrics: () => lastMetrics };
  }

  window.WayfinderConstellations = Object.freeze({ horizontalPosition, horizonFade, project, profileForWidth, rankVisibleFigures, galacticEquatorPoint, sampleGalacticEquator, milkyWayLayers, placeLabels, mount });
})();
