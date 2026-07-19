/*
 * observatory.js -- "The Alchemist's Observatory"
 * ---------------------------------------------------------------------------
 * A first-party, dependency-free canvas that turns the homepage hero into a
 * living night sky: drifting stardust, soft nebula clouds, and a constellation
 * that wakes where the pointer travels. Inspired by earendil.com's live-render
 * ethos (the reason its HUD carries an FPS readout).
 *
 * Accessibility contract (see .claude/rebrand/research-ui-a11y.md §3.2, and the
 * change spec .spectra/changes/home-atelier/spec.md):
 *
 *   - No-motion-first (Tatiana Mac): the animation loop starts ONLY when the OS
 *     expresses no reduced-motion preference AND the visitor has not paused it.
 *     Otherwise a single static frame is painted -- premium, not blank.
 *
 *   - WCAG 2.2.2 (Pause, Stop, Hide): a drifting starfield auto-starts, lasts
 *     >5s, and sits in parallel with the hero text -- all three conditions hold,
 *     so honoring prefers-reduced-motion is NOT enough (the single most-believed
 *     false thing in this area, per the research doc). The HUD's pause/play
 *     button IS the required mechanism, available to everyone, and it persists.
 *
 *   - Substitution over deletion: a reduced-motion visitor may still opt IN via
 *     the same control -- agency, not a wall.
 *
 *   - Pointer reactivity is LOCAL (stars near the cursor drift toward it and
 *     link up) with only a whisper of whole-scene parallax (<=6px), keeping it
 *     off the high-risk end of Val Head's vestibular taxonomy.
 */
(function () {
  'use strict';

  var hero = document.querySelector('.alchemist-hero');
  if (!hero || !window.requestAnimationFrame) return;

  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var STORE_KEY = 'observatory-motion'; // 'on' | 'off' | null (follow OS)

  // ---- Motion policy ------------------------------------------------------
  function storedPref() {
    try { return localStorage.getItem(STORE_KEY); } catch (e) { return null; }
  }
  function savePref(v) {
    try { localStorage.setItem(STORE_KEY, v); } catch (e) { /* private mode: fine */ }
  }
  // The effective "should the loop run" decision. Explicit user choice wins;
  // absent one, we follow the OS (no-motion-first).
  function motionEnabled() {
    var pref = storedPref();
    if (pref === 'off') return false;
    if (pref === 'on') return true;
    return !reduceQuery.matches;
  }

  // ---- Canvas + offscreen nebula ------------------------------------------
  var canvas = document.createElement('canvas');
  canvas.className = 'observatory';
  canvas.setAttribute('aria-hidden', 'true');
  var ctx = canvas.getContext('2d');
  hero.insertBefore(canvas, hero.firstChild);

  var nebula = document.createElement('canvas'); // offscreen, pre-rendered once per resize
  var nctx = nebula.getContext('2d');

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;                 // CSS pixels
  var stars = [];
  var pointer = { x: -9999, y: -9999, active: false };
  var scene = { px: 0, py: 0 };     // eased parallax offset (<=6px)
  var rafId = null;
  var running = false;

  // Palette drawn from _sass/settings/_variables.scss (pastels over the
  // #211C30 -> #312A45 hero gradient).
  var STAR_TINTS = [
    'rgba(248,245,242,',   // cream
    'rgba(205,180,219,',   // pastel purple
    'rgba(185,201,230,',   // pastel blue
    'rgba(230,165,83,',    // ff-gold (sparingly)
    'rgba(248,209,224,'    // pastel pink
  ];
  var NEBULA_BLOBS = [
    { xr: 0.22, yr: 0.28, col: 'rgba(103,58,183,',  a: 0.16 }, // purple
    { xr: 0.80, yr: 0.68, col: 'rgba(63,81,181,',   a: 0.14 }, // indigo
    { xr: 0.62, yr: 0.20, col: 'rgba(248,209,224,', a: 0.07 }, // pink whisper
    { xr: 0.35, yr: 0.82, col: 'rgba(230,165,83,',  a: 0.05 }  // gold whisper
  ];

  // Seeded PRNG (mulberry32) so the sky is REPRODUCIBLE: a fixed constellation
  // every load (which is also how a real night sky behaves), and -- crucially --
  // a byte-identical static frame for the pixel-diff visual-baseline harness,
  // which runs under reducedMotion:'reduce' and would otherwise diff a random
  // starfield on every run.
  function makeRng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function starBudget() {
    // Scale with area, but stay bounded so the loop never pegs the CPU
    // (AC-A10). ~1 star per 12k CSS px^2, hard-capped.
    return Math.max(40, Math.min(150, Math.round((W * H) / 12000)));
  }

  function seedStars() {
    var rand = makeRng(0x5eed);          // reset each seeding -> stable layout
    var n = starBudget();
    stars = [];
    for (var i = 0; i < n; i++) {
      stars.push({
        x: rand() * W,
        y: rand() * H,
        z: 0.4 + rand() * 0.9,           // depth: size + parallax weight + speed
        r: 0.5 + rand() * 1.4,           // radius
        vx: (rand() - 0.5) * 0.06,       // slow ambient drift (CSS px / frame)
        vy: (rand() - 0.5) * 0.06,
        tw: rand() * Math.PI * 2,         // twinkle phase
        tws: 0.6 + rand() * 1.2,          // twinkle speed
        base: 0.35 + rand() * 0.5,        // base opacity
        tint: STAR_TINTS[(rand() * STAR_TINTS.length) | 0]
      });
    }
  }

  function renderNebula() {
    // Pre-render the soft clouds ONCE per resize into an offscreen buffer with
    // a margin so the whole-scene parallax never exposes an edge. Each frame
    // then only blits this (cheap) instead of rebuilding gradients.
    var margin = 24;
    nebula.width = (W + margin * 2) * dpr;
    nebula.height = (H + margin * 2) * dpr;
    nctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    nctx.clearRect(0, 0, W + margin * 2, H + margin * 2);
    for (var i = 0; i < NEBULA_BLOBS.length; i++) {
      var b = NEBULA_BLOBS[i];
      var cx = margin + b.xr * W;
      var cy = margin + b.yr * H;
      var rad = Math.max(W, H) * 0.45;
      var g = nctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      g.addColorStop(0, b.col + b.a + ')');
      g.addColorStop(1, b.col + '0)');
      nctx.fillStyle = g;
      nctx.fillRect(0, 0, W + margin * 2, H + margin * 2);
    }
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedStars();
    renderNebula();
  }

  // ---- Rendering ----------------------------------------------------------
  function drawFrame(dt, animate) {
    ctx.clearRect(0, 0, W, H);

    // Ease the scene parallax toward the pointer (whisper only: <=6px).
    var targetPx = 0, targetPy = 0;
    if (pointer.active && animate) {
      targetPx = ((pointer.x / W) - 0.5) * -12; // opposite the cursor, subtle
      targetPy = ((pointer.y / H) - 0.5) * -12;
    }
    scene.px += (targetPx - scene.px) * 0.06;
    scene.py += (targetPy - scene.py) * 0.06;

    // Nebula (blitted, parallax-shifted). Margin was 24px; center the buffer.
    ctx.drawImage(nebula, -24 + scene.px * 0.6, -24 + scene.py * 0.6, W + 48, H + 48);

    // Stars
    var influence = 150;         // pointer influence radius
    var linkDist = 116;          // constellation link distance
    var near = [];               // stars inside the pointer's influence
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      if (animate) {
        s.x += s.vx * s.z * dt;
        s.y += s.vy * s.z * dt;
        s.tw += 0.02 * s.tws * dt;
        // wrap
        if (s.x < -4) s.x = W + 4; else if (s.x > W + 4) s.x = -4;
        if (s.y < -4) s.y = H + 4; else if (s.y > H + 4) s.y = -4;
      }

      var dx = 0, dy = 0, drawX = s.x + scene.px * s.z, drawY = s.y + scene.py * s.z;
      var glow = 0;
      if (pointer.active) {
        dx = pointer.x - s.x;
        dy = pointer.y - s.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < influence * influence) {
          var d = Math.sqrt(d2) || 1;
          var pull = (1 - d / influence);
          glow = pull;
          if (animate) {
            // LOCAL attraction: nudge toward the cursor (short distance, small
            // area -> low vestibular risk).
            drawX += (dx / d) * pull * 6;
            drawY += (dy / d) * pull * 6;
          } else {
            drawX += (dx / d) * pull * 6; // static frame still shows the halo shape
          }
          near.push({ s: s, x: drawX, y: drawY });
        }
      }

      var tw = animate ? (0.72 + 0.28 * Math.sin(s.tw)) : 0.85;
      var alpha = Math.min(1, s.base * tw + glow * 0.5);
      ctx.beginPath();
      ctx.arc(drawX, drawY, s.r + glow * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = s.tint + alpha.toFixed(3) + ')';
      ctx.fill();
    }

    // Constellation: link near-pointer stars to each other, and to the cursor.
    // Only the small `near` subset is considered, so this stays cheap.
    if (near.length > 1) {
      for (var a = 0; a < near.length; a++) {
        for (var b2 = a + 1; b2 < near.length; b2++) {
          var lx = near[a].x - near[b2].x, ly = near[a].y - near[b2].y;
          var ld = Math.sqrt(lx * lx + ly * ly);
          if (ld < linkDist) {
            var la = (1 - ld / linkDist) * 0.5;
            ctx.beginPath();
            ctx.moveTo(near[a].x, near[a].y);
            ctx.lineTo(near[b2].x, near[b2].y);
            ctx.strokeStyle = 'rgba(205,180,219,' + la.toFixed(3) + ')';
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    }
  }

  // ---- Loop + FPS ---------------------------------------------------------
  var lastTs = 0, frames = 0, fpsAccum = 0, fps = 0;

  function loop(ts) {
    if (!running) return;
    var dt = lastTs ? Math.min((ts - lastTs) / 16.667, 3) : 1; // frames elapsed, clamped
    lastTs = ts;

    drawFrame(dt, true);

    // FPS readout, refreshed ~twice a second.
    frames++;
    fpsAccum += ts - (loop._prev || ts);
    loop._prev = ts;
    if (fpsAccum >= 500) {
      fps = Math.round((frames * 1000) / fpsAccum);
      frames = 0; fpsAccum = 0;
      setFps(fps);
    }

    rafId = window.requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;
    lastTs = 0; loop._prev = 0; frames = 0; fpsAccum = 0;
    rafId = window.requestAnimationFrame(loop);
  }
  function stop() {
    running = false;
    if (rafId) { window.cancelAnimationFrame(rafId); rafId = null; }
    setFps(null);
  }
  function staticFrame() {
    // One premium still frame -- no loop, no motion.
    drawFrame(1, false);
    setFps(null);
  }

  // ---- HUD (FPS readout + the 2.2.2 pause control) ------------------------
  var hud = document.createElement('div');
  hud.className = 'observatory-hud';

  var toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'observatory-hud__toggle';
  var icon = document.createElement('span');
  icon.className = 'observatory-hud__icon';
  icon.setAttribute('aria-hidden', 'true');
  toggle.appendChild(icon);

  var fpsEl = document.createElement('span');
  fpsEl.className = 'observatory-hud__fps';
  fpsEl.setAttribute('aria-hidden', 'true');
  fpsEl.textContent = 'FPS —';

  hud.appendChild(toggle);
  hud.appendChild(fpsEl);
  hero.appendChild(hud);

  function setFps(v) {
    fpsEl.textContent = 'FPS ' + (v == null ? '—' : v);
  }

  function reflectToggle(on) {
    // aria-pressed = "is motion paused". on === animating.
    toggle.setAttribute('aria-pressed', on ? 'false' : 'true');
    toggle.setAttribute('aria-label', on ? 'Pause ambient motion' : 'Play ambient motion');
    toggle.title = on ? 'Pause the observatory' : 'Wake the observatory';
    hud.classList.toggle('is-paused', !on);
  }

  // Apply the current policy: run the loop or hold a static frame.
  function apply() {
    var on = motionEnabled();
    reflectToggle(on);
    if (on) start(); else { stop(); staticFrame(); }
  }

  toggle.addEventListener('click', function () {
    var on = motionEnabled();
    savePref(on ? 'off' : 'on'); // explicit choice overrides the OS default
    apply();
  });

  // ---- Pointer, resize, visibility ----------------------------------------
  function onPointer(e) {
    var t = e.touches ? e.touches[0] : e;
    if (!t) return;
    pointer.x = t.clientX;
    pointer.y = t.clientY;
    pointer.active = true;
    // A paused/static observatory still reveals the constellation on hover --
    // it's pointer-driven (2.3.3), not auto-play, so it stays available even
    // when the ambient loop is stopped.
    if (!running) staticFrame();
  }
  function clearPointer() {
    pointer.active = false;
    if (!running) staticFrame();
  }
  window.addEventListener('mousemove', onPointer, { passive: true });
  window.addEventListener('touchmove', onPointer, { passive: true });
  window.addEventListener('mouseleave', clearPointer);
  window.addEventListener('touchend', clearPointer);

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
      if (running) { /* loop keeps going */ } else { staticFrame(); }
    }, 200);
  });

  // Never burn cycles on a hidden tab (AC-A10).
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (running) stop();
    } else {
      if (motionEnabled()) start();
    }
  });

  // React live to an OS reduced-motion change (only matters when the visitor
  // hasn't made an explicit choice).
  var onReduceChange = function () { if (storedPref() == null) apply(); };
  if (reduceQuery.addEventListener) reduceQuery.addEventListener('change', onReduceChange);
  else if (reduceQuery.addListener) reduceQuery.addListener(onReduceChange);

  // ---- Console homage (earendil-style dev wink) ---------------------------
  function consoleSigil() {
    var sigil = [
      '',
      '        .  *  .   ·   *   .  ·  *  .',
      '     ·   ╭─────────────────────╮   *',
      '   *     │   ☿   THE  ATELIER   │  ·',
      '     .   │   ⚗   OBSERVATORY    │    .',
      '   ·     ╰─────────────────────╯  *  .',
      '        *   .   ·    *   .   ·   *',
      ''
    ].join('\n');
    try {
      console.log('%c' + sigil, 'color:#cdb4db; font-family:monospace; line-height:1.15;');
      console.log(
        '%cSolve et Coagula.%c  You found the console — a true alchemist always looks beneath the surface.\n' +
        'The stars remember those who look up. Some old spells still work on keyboards: %c↑ ↑ ↓ ↓ ← → ← → B A%c',
        'color:#e6a553; font-weight:bold; font-family:monospace;',
        'color:#b9c9e6; font-family:monospace;',
        'color:#f8d1e0; font-family:monospace;',
        'color:#b9c9e6; font-family:monospace;'
      );
    } catch (e) { /* no console: fine */ }
  }

  // ---- Boot ---------------------------------------------------------------
  resize();
  // Fade the sky in (opacity is vestibular-safe for everyone).
  requestAnimationFrame(function () { canvas.classList.add('is-lit'); });
  apply();
  consoleSigil();

  // Expose a tiny hook so home.js's Konami payoff can ask the sky to flare
  // without either file reaching into the other's internals.
  window.Observatory = {
    flare: function () {
      if (!hero) return;
      hero.classList.add('is-transmuting');
      window.setTimeout(function () { hero.classList.remove('is-transmuting'); }, 2600);
    },
    isRunning: function () { return running; }
  };
})();
