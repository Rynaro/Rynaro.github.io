/*
 * observatory.js — "Solve et Coagula" (the Alchemist's Observatory, rework)
 * ---------------------------------------------------------------------------
 * The hero background enacts the motto. A few thousand motes of prima materia
 * endlessly cycle between two states:
 *   · SOLVE   — the assembled figure DISSOLVES into divergence-free curl-noise
 *               turbulence (matter unbound);
 *   · COAGULA — the cloud CONDENSES onto an alchemical figure sampled from the
 *               site's own sigil geometry (matter re-formed).
 * The dust is grounded on a static slab of dithered "prima materia" (nigredo
 * violet shot with rare gold veins, quantised through a Bayer-8 matrix for a
 * 16-bit-era grain). This deliberately replaces the old starfield + constellation
 * (proximity lines are the canvas-tutorial cliché — deleted at the root).
 *
 * First-party only (vanilla Canvas 2D, hand-rolled value/curl noise — no libs).
 * Research basis + citations: .claude/rebrand/research-hero-backgrounds.md
 * (Concept A over Concept B).
 *
 * Accessibility (research §5/§6, and .claude/rebrand/research-ui-a11y.md §3.2):
 *   · No-motion-first: the rAF loop starts ONLY under
 *     prefers-reduced-motion:no-preference and when not paused. Otherwise a
 *     premium STILL of the coagulated figure is drawn — never a blank.
 *   · WCAG 2.2.2: load runs ONE condense (≤ ~3.5s) then the figure rests with a
 *     faint opacity breath. Because the breath is continuous, the HUD pause/play
 *     button is the required 2.2.2 mechanism (prefers-reduced-motion alone does
 *     NOT discharge 2.2.2). Pointer/click motion is user-initiated (2.3.3) and
 *     decays well under 5s.
 *   · Pointer response is MATERIAL (dust scatters/stirs), not diagrammatic.
 */
(function () {
  'use strict';

  var hero = document.querySelector('.alchemist-hero');
  if (!hero || !window.requestAnimationFrame) return;

  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var STORE_KEY = 'observatory-motion'; // 'on' | 'off' | null (follow OS)

  function storedPref() { try { return localStorage.getItem(STORE_KEY); } catch (e) { return null; } }
  function savePref(v) { try { localStorage.setItem(STORE_KEY, v); } catch (e) {} }
  function motionEnabled() {
    var p = storedPref();
    if (p === 'off') return false;
    if (p === 'on') return true;
    return !reduceQuery.matches;
  }

  // ---- Palette (from _sass/settings/_variables.scss) -----------------------
  var NIGREDO = [33, 28, 48];    // #211C30
  var VIOLET = [49, 42, 69];     // #312A45
  var AURUM = [230, 165, 83];    // #e6a553  (gold)
  var LAVENDER = [177, 156, 217]; // #b19cd9  (dissolved dust tint)

  // ---- Canvases: static dithered ground + trailed particle layer -----------
  var bg = document.createElement('canvas');
  bg.className = 'observatory observatory--ground';
  bg.setAttribute('aria-hidden', 'true');
  var bctx = bg.getContext('2d');

  var fg = document.createElement('canvas');
  fg.className = 'observatory observatory--dust';
  fg.setAttribute('aria-hidden', 'true');
  var fctx = fg.getContext('2d');

  hero.insertBefore(fg, hero.firstChild);
  hero.insertBefore(bg, hero.firstChild);

  var dpr = 1, W = 0, H = 0;
  var figureCX = 0, figureCY = 0, figureSize = 0;

  // ---- First-party value noise + 2D curl (divergence-free) -----------------
  function hash(x, y) {
    var n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  }
  function vnoise(x, y) {
    var xi = Math.floor(x), yi = Math.floor(y);
    var xf = x - xi, yf = y - yi;
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    var a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
  }
  // curl of a scalar noise potential => (∂n/∂y, −∂n/∂x): swirls, never clumps.
  var NS = 0.0016; // spatial scale of the field
  function curl(x, y, t, out) {
    var e = 1.0;
    var n1 = vnoise(x * NS, (y + e) * NS + t) - vnoise(x * NS, (y - e) * NS + t);
    var n2 = vnoise((x + e) * NS, y * NS + t) - vnoise((x - e) * NS, y * NS + t);
    out[0] = n1; out[1] = -n2;
  }

  // ---- Figures: the site's own sigils, rasterised to target points ---------
  // Polyline segments in a 50-unit box (the original inline-SVG sigil coords).
  var SIGILS = {
    fire: [[[25, 5], [25, 45]], [[15, 15], [35, 35]], [[15, 35], [35, 15]]],
    water: [[[15, 25], [35, 25]], [[15, 15], [35, 15]], [[15, 35], [35, 35]]],
    air: [[[25, 5], [25, 45]], [[15, 15], [35, 15]]],
    earth: [[[15, 15], [35, 15]], [[25, 15], [25, 35]], [[15, 35], [35, 35]]],
    ansuz: [[[20, 8], [31, 8], [19, 44]]],
    laguz: [[[25, 8], [25, 44], [37, 20]]]
  };

  function strokeSegments(ctx, segs, s, lw) {
    var k = s / 50;
    ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = '#fff';
    for (var i = 0; i < segs.length; i++) {
      var seg = segs[i];
      ctx.beginPath();
      for (var j = 0; j < seg.length; j++) {
        var px = seg[j][0] * k, py = seg[j][1] * k;
        if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }

  // The default figure: the alchemy circle itself, re-expressed as dust.
  function drawAlchemyCircle(ctx, s) {
    var k = s / 50, c = 25 * k, lw = Math.max(2, s * 0.014);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = lw; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(c, c, 21 * k, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(c, c, 13 * k, 0, Math.PI * 2); ctx.stroke();
    // inner cross
    strokeSegments(ctx, [[[25, 9], [25, 41]], [[9, 25], [41, 25]]], s, lw);
    // four cardinal nodes on the outer ring
    var r = 21 * k;
    for (var a = 0; a < 4; a++) {
      var ang = a * Math.PI / 2;
      ctx.beginPath();
      ctx.arc(c + Math.cos(ang) * r, c + Math.sin(ang) * r, lw * 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawSigil(name) {
    return function (ctx, s) { strokeSegments(ctx, SIGILS[name], s, Math.max(2, s * 0.02)); };
  }

  // Ordered figure set — starts on the alchemy circle (the brand centrepiece,
  // now formed from living dust), clicks cycle through the elements + runes.
  var FIGURE_DEFS = [
    drawAlchemyCircle,
    drawSigil('fire'), drawSigil('water'), drawSigil('air'),
    drawSigil('earth'), drawSigil('ansuz'), drawSigil('laguz')
  ];
  var figures = [];      // each: array of {x,y} target points (figure-local, centred)
  var figureIndex = 0;

  function rasterizeFigures() {
    figures = [];
    var s = figureSize;
    var pad = Math.max(8, s * 0.12);
    var dim = Math.ceil(s + pad * 2);
    var oc = document.createElement('canvas');
    oc.width = dim; oc.height = dim;
    var octx = oc.getContext('2d');
    for (var f = 0; f < FIGURE_DEFS.length; f++) {
      octx.clearRect(0, 0, dim, dim);
      octx.save();
      octx.translate(pad, pad);
      FIGURE_DEFS[f](octx, s);
      octx.restore();
      var img = octx.getImageData(0, 0, dim, dim).data;
      var pts = [];
      var stride = 2;
      for (var y = 0; y < dim; y += stride) {
        for (var x = 0; x < dim; x += stride) {
          if (img[(y * dim + x) * 4 + 3] > 80) {
            pts.push({ x: x - dim / 2, y: y - dim / 2 }); // centred on figure
          }
        }
      }
      figures.push(pts.length ? pts : [{ x: 0, y: 0 }]);
    }
  }

  // ---- Particles -----------------------------------------------------------
  var particles = [];
  function particleBudget() {
    return Math.max(1300, Math.min(2600, Math.round((W * H) / 620)));
  }
  function assignTargets(idx) {
    var pts = figures[idx];
    var m = pts.length, n = particles.length;
    for (var i = 0; i < n; i++) {
      // spread N particles EVENLY across ALL M target points (never just the
      // first N), so the whole figure is covered whether N<M or N>M.
      var t = pts[Math.floor(i * m / n) % m];
      particles[i].tx = figureCX + t.x + (hash(i, idx) - 0.5) * 2.5;
      particles[i].ty = figureCY + t.y + (hash(i + 7, idx) - 0.5) * 2.5;
    }
  }
  function seedParticles() {
    var n = particleBudget();
    particles = [];
    for (var i = 0; i < n; i++) {
      // scattered in a disc around the figure — the void it condenses from
      var ang = hash(i, 1) * Math.PI * 2;
      var rad = (0.4 + hash(i, 2) * 1.3) * figureSize;
      particles.push({
        x: figureCX + Math.cos(ang) * rad,
        y: figureCY + Math.sin(ang) * rad,
        vx: 0, vy: 0, tx: figureCX, ty: figureCY,
        sz: hash(i, 3) < 0.15 ? 2 : 1,     // a few brighter grains
        seed: hash(i, 4)
      });
    }
    assignTargets(figureIndex);
  }

  // ---- Phase machine -------------------------------------------------------
  var phase = 'coagula';        // 'coagula' | 'rest' | 'solve'
  var phaseT = 0;               // ms into the current phase
  var COAG_MS = 3200, SOLVE_MS = 1500;
  var warm = 1;                 // 0 = dissolved violet, 1 = coagulated gold
  var pointer = { x: -9999, y: -9999, active: false };

  function startSolve() {
    if (phase === 'solve') return;
    phase = 'solve'; phaseT = 0;
  }

  function stepParticles(dt, ms, animate) {
    phaseT += ms;
    var targetWarm = phase === 'solve' ? 0.12 : 1;
    warm += (targetWarm - warm) * Math.min(1, 0.06 * dt);

    var EASE = phase === 'coagula' ? 0.06 : 0.028;
    var DAMP = phase === 'solve' ? 0.94 : 0.84;
    var CURL = 2.6;
    var R = 128, RF = 1.05;
    var out = [0, 0];
    var t = phaseT * 0.00006;

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      if (phase === 'solve' && animate) {
        curl(p.x, p.y, t, out);
        p.vx += out[0] * CURL; p.vy += out[1] * CURL;
      } else {
        p.vx += (p.tx - p.x) * EASE; p.vy += (p.ty - p.y) * EASE;
      }
      // Pointer = the alchemist's hand. It NEVER fights coagulation (so the
      // figure always forms cleanly); it STIRS the dissolved matter during
      // solve and SCATTERS the settled dust at rest (which then re-gathers) —
      // a material response, not a diagram.
      if (pointer.active && animate && phase !== 'coagula') {
        var dx = p.x - pointer.x, dy = p.y - pointer.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < R * R) {
          var d = Math.sqrt(d2) || 1, force = (1 - d / R) * RF;
          if (phase === 'solve') {                       // swirl
            p.vx += (-dy / d) * force + (dx / d) * force * 0.25;
            p.vy += (dx / d) * force + (dy / d) * force * 0.25;
          } else {                                        // scatter, then re-gather
            p.vx += (dx / d) * force; p.vy += (dy / d) * force;
          }
        }
      }
      p.vx *= DAMP; p.vy *= DAMP;
      p.x += p.vx * dt; p.y += p.vy * dt;
    }

    if (phase === 'coagula' && phaseT >= COAG_MS) { phase = 'rest'; phaseT = 0; }
    else if (phase === 'solve' && phaseT >= SOLVE_MS) {
      figureIndex = (figureIndex + 1) % figures.length;
      assignTargets(figureIndex);
      phase = 'coagula'; phaseT = 0;
    }
  }

  // ---- Rendering -----------------------------------------------------------
  function drawGround() {
    // nigredo→violet slab, gold aurum glows massed to the LEFT (behind the
    // figure, away from the headline zone), then a Bayer-8 ordered dither for
    // 16-bit grain. Drawn ONCE per resize — static, zero vestibular cost.
    var g = bctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, 'rgb(19,16,30)');   // nigredo — dark so the aurum dust pops
    g.addColorStop(1, 'rgb(27,22,42)');
    bctx.fillStyle = g; bctx.fillRect(0, 0, W, H);

    function glow(cx, cy, rad, col, a) {
      var rg = bctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      rg.addColorStop(0, 'rgba(' + col.join(',') + ',' + a + ')');
      rg.addColorStop(1, 'rgba(' + col.join(',') + ',0)');
      bctx.fillStyle = rg; bctx.fillRect(0, 0, W, H);
    }
    glow(figureCX, figureCY, figureSize * 1.45, [96, 60, 156], 0.34);           // contained violet aura
    glow(figureCX + figureSize * 0.05, figureCY, figureSize * 0.72, AURUM, 0.10); // warm gold heart under the figure
    glow(W * 0.86, H * 0.12, Math.max(W, H) * 0.5, [66, 60, 138], 0.07);        // faint cool corner

    ditherGround();
  }

  var BAYER8 = [
    0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26,
    12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
    3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25,
    15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21
  ];
  function ditherGround() {
    // Ordered Bayer dither for a 16-bit-era grain — but broken up with a small
    // per-pixel hash so it reads as GRAIN, not a regular screen-door mesh, and
    // kept subtle (L high) so it's a texture you feel, not a pattern you see.
    var L = 11, w = bg.width, h = bg.height;
    var img = bctx.getImageData(0, 0, w, h), d = img.data;
    var q = (L - 1);
    for (var y = 0; y < h; y++) {
      var row = (y & 7) * 8;
      for (var x = 0; x < w; x++) {
        var thr = (BAYER8[row + (x & 7)] + 0.5) / 64 - 0.5;
        thr += (hash(x, y) - 0.5) * 0.55; // grain, not weave
        var o = (y * w + x) * 4;
        for (var c = 0; c < 3; c++) {
          var v = d[o + c] / 255 * q + thr;
          v = Math.round(v < 0 ? 0 : v > q ? q : v);
          d[o + c] = (v / q) * 255;
        }
      }
    }
    bctx.putImageData(img, 0, 0);
  }

  function drawStill() {
    // reduced-motion / paused substitute: the coagulated figure as a long
    // exposure — particles at their targets, no motion, no loop.
    fctx.clearRect(0, 0, W, H);
    fctx.globalCompositeOperation = 'lighter';
    var col = 'rgba(' + AURUM.join(',') + ',';
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      fctx.fillStyle = col + (0.62 + p.seed * 0.45).toFixed(3) + ')';
      fctx.fillRect(p.tx, p.ty, p.sz + 0.5, p.sz + 0.5);
    }
    fctx.globalCompositeOperation = 'source-over';
    setFps(null);
  }

  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }

  function drawDust() {
    // trail fade (destination-out keeps the layer transparent over the ground)
    fctx.globalCompositeOperation = 'destination-out';
    fctx.fillStyle = 'rgba(0,0,0,' + (phase === 'solve' ? 0.10 : 0.16) + ')';
    fctx.fillRect(0, 0, W, H);

    fctx.globalCompositeOperation = 'lighter';
    var c = mix(LAVENDER, AURUM, warm);
    var breath = phase === 'rest' ? (0.82 + 0.18 * Math.sin(phaseT * 0.0016)) : 1;
    var head = 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')';
    fctx.fillStyle = head;
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      fctx.globalAlpha = (0.35 + p.seed * 0.5) * breath;
      fctx.fillRect(p.x, p.y, p.sz, p.sz);
    }
    fctx.globalAlpha = 1;
    fctx.globalCompositeOperation = 'source-over';
  }

  // ---- Loop + FPS ----------------------------------------------------------
  var rafId = null, running = false, lastTs = 0, frames = 0, fpsAccum = 0;
  function loop(ts) {
    if (!running) return;
    var ms = lastTs ? Math.min(ts - lastTs, 60) : 16.7;
    var dt = ms / 16.7;
    lastTs = ts;
    stepParticles(dt, ms, true);
    drawDust();
    frames++; fpsAccum += ms;
    if (fpsAccum >= 500) { setFps(Math.round(frames * 1000 / fpsAccum)); frames = 0; fpsAccum = 0; }
    rafId = window.requestAnimationFrame(loop);
  }
  function start() {
    if (running) return;
    running = true; lastTs = 0; frames = 0; fpsAccum = 0;
    rafId = window.requestAnimationFrame(loop);
  }
  function stop() { running = false; if (rafId) { window.cancelAnimationFrame(rafId); rafId = null; } setFps(null); }

  // ---- HUD (FPS readout + the 2.2.2 pause control) -------------------------
  var hud = document.createElement('div');
  hud.className = 'observatory-hud';
  var toggle = document.createElement('button');
  toggle.type = 'button'; toggle.className = 'observatory-hud__toggle';
  var icon = document.createElement('span');
  icon.className = 'observatory-hud__icon'; icon.setAttribute('aria-hidden', 'true');
  toggle.appendChild(icon);
  var fpsEl = document.createElement('span');
  fpsEl.className = 'observatory-hud__fps'; fpsEl.setAttribute('aria-hidden', 'true');
  fpsEl.textContent = 'FPS —';
  hud.appendChild(toggle); hud.appendChild(fpsEl);
  hero.appendChild(hud);

  function setFps(v) { fpsEl.textContent = 'FPS ' + (v == null ? '—' : v); }
  function reflectToggle(on) {
    toggle.setAttribute('aria-pressed', on ? 'false' : 'true');
    toggle.setAttribute('aria-label', on ? 'Pause the transmutation' : 'Resume the transmutation');
    toggle.title = on ? 'Pause the transmutation' : 'Resume the transmutation';
    hud.classList.toggle('is-paused', !on);
  }
  function apply() {
    var on = motionEnabled();
    reflectToggle(on);
    if (on) { phase = 'coagula'; phaseT = 0; warm = 0.2; start(); }
    else { stop(); drawStill(); }
  }
  toggle.addEventListener('click', function () {
    var on = motionEnabled();
    savePref(on ? 'off' : 'on');
    apply();
  });

  // ---- Input, resize, visibility ------------------------------------------
  function onPointer(e) {
    var t = e.touches ? e.touches[0] : e;
    if (!t) return;
    pointer.x = t.clientX; pointer.y = t.clientY; pointer.active = true;
  }
  function clearPointer() { pointer.active = false; }
  window.addEventListener('mousemove', onPointer, { passive: true });
  window.addEventListener('touchmove', onPointer, { passive: true });
  window.addEventListener('mouseleave', clearPointer);
  window.addEventListener('touchend', clearPointer);
  // click anywhere on the hero backdrop triggers a transmutation to the next
  // figure (ignored on interactive elements so links/buttons still work).
  hero.addEventListener('click', function (e) {
    if (e.target.closest('a, button')) return;
    if (running) startSolve();
  });

  function sizeFor() {
    W = window.innerWidth; H = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    // figure: left-of-centre on wide screens, upper-centre on narrow ones
    if (W >= 900) { figureCX = W * 0.32; figureCY = H * 0.52; figureSize = Math.min(460, H * 0.6, W * 0.44); }
    else { figureCX = W * 0.5; figureCY = H * 0.26; figureSize = Math.min(228, W * 0.6, H * 0.3); }
    [bg, fg].forEach(function (cv) {
      cv.width = W * dpr; cv.height = H * dpr;
      cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    });
  }
  function rebuild(keepPhase) {
    sizeFor();
    rasterizeFigures();
    if (!particles.length) seedParticles(); else assignTargets(figureIndex);
    drawGround();
    if (running) { fctx.clearRect(0, 0, W, H); } else drawStill();
  }
  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt); rt = setTimeout(function () { rebuild(true); }, 200);
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { if (running) stop(); }
    else if (motionEnabled() && !running) { start(); }
  });
  var onReduceChange = function () { if (storedPref() == null) apply(); };
  if (reduceQuery.addEventListener) reduceQuery.addEventListener('change', onReduceChange);
  else if (reduceQuery.addListener) reduceQuery.addListener(onReduceChange);

  // ---- Console homage ------------------------------------------------------
  try {
    console.log('%c  ☿ ⚗  SOLVE ET COAGULA  ⚗ ☿',
      'color:#e6a553;font-family:monospace;font-weight:bold;');
    console.log('%cDissolve, and bind anew. You found the console — every alchemist looks beneath the surface.\n' +
      'Old spells still work on keyboards: %c↑ ↑ ↓ ↓ ← → ← → B A',
      'color:#b9c9e6;font-family:monospace;', 'color:#f8d1e0;font-family:monospace;');
  } catch (e) {}

  // ---- Public API for home.js's Konami payoff ------------------------------
  window.Observatory = {
    transmute: function () { if (running) startSolve(); },
    flare: function () {
      hero.classList.add('is-transmuting');
      window.setTimeout(function () { hero.classList.remove('is-transmuting'); }, 2600);
      if (running) { figureIndex = 0; startSolve(); } // grand work returns to the circle
    },
    isRunning: function () { return running; }
  };

  // ---- Boot ----------------------------------------------------------------
  rebuild(false);
  window.requestAnimationFrame(function () { bg.classList.add('is-lit'); fg.classList.add('is-lit'); });
  apply();
})();
