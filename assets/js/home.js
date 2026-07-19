/*
 * home.js — the homepage's one page-specific easter egg.
 * ---------------------------------------------------------------------------
 * The hero visuals now live entirely in observatory.js (the Solve et Coagula
 * transmutation). All this file does is wire the hidden Konami spell to a
 * "grand work": it asks the Observatory to flare gold and return the dust to
 * the alchemy circle, and reveals the motto. Purely a flourish — it changes no
 * navigation and no content state (AC-A07). Motion is gated behind
 * no-preference; a reduced-motion visitor gets a calm opacity reveal only.
 * The console greeting (observatory.js) is what points a curious dev here.
 */
document.addEventListener('DOMContentLoaded', function () {
  var hero = document.querySelector('.alchemist-hero');
  if (!hero) return;

  var SPELL = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
               'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  var progress = 0;
  var sealed = false;

  document.addEventListener('keydown', function (e) {
    var key = e.key && e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === SPELL[progress]) {
      progress++;
      if (progress === SPELL.length) { progress = 0; cast(); }
    } else {
      progress = (key === SPELL[0]) ? 1 : 0;
    }
  });

  function cast() {
    if (sealed) return;
    sealed = true;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (window.Observatory && typeof window.Observatory.flare === 'function') {
      window.Observatory.flare();
    }

    var reveal = document.createElement('div');
    reveal.className = 'transmutation-reveal';
    reveal.setAttribute('role', 'status');
    reveal.innerHTML =
      '<span class="transmutation-reveal__motto">Solve et Coagula</span>' +
      '<span class="transmutation-reveal__sub">— dissolve, and bind anew —</span>';
    hero.appendChild(reveal);
    requestAnimationFrame(function () { reveal.classList.add('is-visible'); });

    var life = reduce ? 2200 : 2600;
    setTimeout(function () { reveal.classList.remove('is-visible'); }, life - 500);
    setTimeout(function () { reveal.remove(); sealed = false; }, life);
  }
});
