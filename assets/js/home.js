document.addEventListener('DOMContentLoaded', function() {
  const alchemyCircle = document.querySelector('.alchemy-circle');
  const symbols = document.querySelectorAll('.alchemy-symbol, .rune');
  let isDragging = false;
  let startX, startY, startRotate = 0;
  let isMobile = window.innerWidth < 768;

  // Detect device type and update interactions accordingly
  function updateDeviceType() {
    isMobile = window.innerWidth < 768;

    // Adjust animation speed and behavior based on device
    updateAnimations();
  }

  function updateAnimations() {
    // AC-024: no script-created animated node under a reduced-motion preference.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Apply animations with more subtle effects on mobile
    // AC-031: finite (2 bob cycles, then hold), not an infinite loop -- the
    // alchemy-symbol/rune glyphs auto-start on page load in parallel with
    // the hero name/subtitle/tagline, so WCAG 2.2.2 binds them the same way
    // it binds the ring rotation below. Delay is capped (not unbounded by
    // index) so delay + duration * iterations stays <= 5s.
    symbolNames.forEach((name, index) => {
      // Find the element
      let selector = `.alchemy-symbol--${name}, .rune--${name}`;
      let element = document.querySelector(selector);

      if (element) {
        // Set unique animation delays to stagger movement
        const delay = Math.min(index * 0.2, 1); // Stagger, capped at 1s
        const duration = isMobile ? 1.6 : 1.6 + (index % 2) * 0.3; // 1.6-1.9s

        // Apply the animation style directly -- 2 iterations (one full bob,
        // there-and-back) then stop; delay(<=1) + duration*2(<=3.8) <= 4.8s.
        element.style.animation = `float-glyphs ${duration}s ease-in-out ${delay}s 2`;
      }
    });
  }

  // Update on resize with debouncing
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateDeviceType, 250);
  });

  // Set unique animation delays for each symbol
  const symbolNames = [
    'fire', 'water', 'air', 'earth', 'quintessence',
    'ansuz', 'kenaz', 'raidho', 'laguz'
  ];

  // Initialize animations
  updateDeviceType();

  // Make symbols interactive - more touch-friendly on mobile
  symbols.forEach(symbol => {
    // Combined event listener for both mouse and touch
    symbol.addEventListener('mouseenter', handleSymbolHover);
    symbol.addEventListener('touchstart', handleSymbolTouch, { passive: false });
    symbol.addEventListener('mouseleave', handleSymbolUnhover);

    // Click/tap handler
    symbol.addEventListener('click', handleSymbolActivation);
    symbol.addEventListener('touchend', function(e) {
      // Prevent default to avoid double-triggering
      if (e.cancelable) {
        e.preventDefault();
      }
      handleSymbolActivation(e);
    });
  });

  function handleSymbolHover() {
    this.classList.add('hovered');
  }

  function handleSymbolTouch(e) {
    // Prevent scrolling when touching symbols
    if (e.cancelable) {
      e.preventDefault();
    }

    // Remove hover from all other symbols first
    symbols.forEach(s => s.classList.remove('hovered'));

    // Add hover to this symbol
    this.classList.add('hovered');
  }

  function handleSymbolUnhover() {
    this.classList.remove('hovered');
  }

  function handleSymbolActivation(e) {
    e.stopPropagation();

    // Add activation effect
    this.classList.add('activated');
    setTimeout(() => {
      this.classList.remove('activated');
    }, 1000);

    // Show ripple effect
    createRippleEffect(e);

    // Create particles
    createParticleEffect(e);
  }

  function createParticleEffect(e) {
    const symbol = e.currentTarget;
    const rect = symbol.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Create 8 particles in a circular pattern
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const distance = 50;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      const particle = document.createElement('div');
      particle.className = 'alchemy-particle';
      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;

      document.body.appendChild(particle);

      // Remove particle after animation
      setTimeout(() => {
        particle.remove();
      }, 1000);
    }
  }

  function createRippleEffect(e) {
    const ripple = document.createElement('div');
    ripple.className = 'alchemy-ripple';

    // Position differently based on event type
    if (e.type === 'touchend' && e.changedTouches) {
      ripple.style.left = e.changedTouches[0].clientX + 'px';
      ripple.style.top = e.changedTouches[0].clientY + 'px';
    } else {
      ripple.style.left = e.clientX + 'px';
      ripple.style.top = e.clientY + 'px';
    }

    document.body.appendChild(ripple);

    // Remove ripple after animation
    setTimeout(() => {
      ripple.remove();
    }, 1000);
  }

  // Make circle draggable/rotatable - support both mouse and touch
  alchemyCircle.addEventListener('mousedown', handleCircleGrabStart);
  alchemyCircle.addEventListener('touchstart', handleCircleTouchStart, { passive: false });

  document.addEventListener('mousemove', handleCircleMove);
  document.addEventListener('touchmove', handleCircleTouchMove, { passive: false });

  document.addEventListener('mouseup', handleCircleRelease);
  document.addEventListener('touchend', handleCircleRelease);
  document.addEventListener('touchcancel', handleCircleRelease);

  function handleCircleGrabStart(e) {
    startDrag(e.clientX, e.clientY);
    e.preventDefault();
  }

  function handleCircleTouchStart(e) {
    if (e.touches.length === 1) {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
      if (e.cancelable) {
        e.preventDefault(); // Prevent scrolling while rotating
      }
    }
  }

  function startDrag(x, y) {
    isDragging = true;
    startX = x;
    startY = y;
    alchemyCircle.classList.add('interacting');

    // Get current rotation
    const style = window.getComputedStyle(alchemyCircle);
    const transform = style.getPropertyValue('transform');
    if (transform !== 'none') {
      const values = transform.split('(')[1].split(')')[0].split(',');
      const a = values[0];
      const b = values[1];
      startRotate = Math.round(Math.atan2(parseFloat(b), parseFloat(a)) * (180/Math.PI));
    } else {
      startRotate = 0;
    }
  }

  function handleCircleMove(e) {
    if (!isDragging) return;
    moveCircle(e.clientX, e.clientY);
  }

  function handleCircleTouchMove(e) {
    if (!isDragging || e.touches.length !== 1) return;
    moveCircle(e.touches[0].clientX, e.touches[0].clientY);
    if (e.cancelable) {
      e.preventDefault(); // Prevent scrolling while rotating
    }
  }

  function moveCircle(x, y) {
    const rect = alchemyCircle.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startAngle = Math.atan2(startY - centerY, startX - centerX);
    const currentAngle = Math.atan2(y - centerY, x - centerX);

    const rotation = (currentAngle - startAngle) * (180 / Math.PI);

    alchemyCircle.style.transform = `rotate(${startRotate + rotation}deg)`;
  }

  function handleCircleRelease() {
    isDragging = false;
    alchemyCircle.classList.remove('interacting');
  }

  // Add glow effect on hover/touch
  alchemyCircle.addEventListener('mousemove', handleCircleGlow);
  alchemyCircle.addEventListener('touchmove', function(e) {
    if (e.touches.length === 1 && !isDragging) {
      const touch = e.touches[0];
      handleCircleGlow({
        clientX: touch.clientX,
        clientY: touch.clientY,
        target: alchemyCircle
      });
    }
  });

  function handleCircleGlow(e) {
    if (isDragging) return;

    const rect = alchemyCircle.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    document.documentElement.style.setProperty('--glow-x', `${x}px`);
    document.documentElement.style.setProperty('--glow-y', `${y}px`);
    document.documentElement.style.setProperty('--glow-strength', '1');
  }

  alchemyCircle.addEventListener('mouseleave', function() {
    document.documentElement.style.setProperty('--glow-strength', '0');
  });

  // Remove glow on touch end
  alchemyCircle.addEventListener('touchend', function() {
    document.documentElement.style.setProperty('--glow-strength', '0');
  });

  // Responsive adjustments for orientation changes
  window.addEventListener('orientationchange', function() {
    // Brief timeout to allow DOM to update before recalculating
    setTimeout(function() {
      updateDeviceType();

      // Reset any transformations to avoid strange positioning
      alchemyCircle.style.transform = 'rotate(0deg)';
    }, 200);
  });

  // -------------------------------------------------------------------------
  // The Great Work -- a hidden transmutation for those who know the old spell.
  // Konami code (↑ ↑ ↓ ↓ ← → ← → B A). Purely a flourish: it changes no
  // navigation and no content state (AC-A07). Motion is gated behind
  // no-preference; a reduced-motion visitor gets a calm opacity reveal of the
  // motto instead of the sigil cascade. The console greeting (observatory.js)
  // is what points a curious dev at this spell.
  // -------------------------------------------------------------------------
  (function initTransmutation() {
    const SPELL = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
                   'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let progress = 0;
    let sealed = false; // debounce while a transmutation is already playing

    document.addEventListener('keydown', function (e) {
      const key = e.key && e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === SPELL[progress]) {
        progress++;
        if (progress === SPELL.length) {
          progress = 0;
          castTransmutation();
        }
      } else {
        // A wrong key that is itself the opening note restarts cleanly.
        progress = (key === SPELL[0]) ? 1 : 0;
      }
    });

    function castTransmutation() {
      if (sealed) return;
      sealed = true;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Ask the sky to flare (no-op if observatory.js didn't load).
      if (window.Observatory && typeof window.Observatory.flare === 'function') {
        window.Observatory.flare();
      }

      // Light every element sigil in sequence -- reuse the existing activated
      // look. Skipped under reduced motion (the reveal below is enough).
      if (!reduce) {
        symbols.forEach((sym, i) => {
          setTimeout(() => {
            sym.classList.add('activated');
            setTimeout(() => sym.classList.remove('activated'), 900);
          }, i * 90);
        });
      }

      // Reveal the motto in the core of the circle.
      const reveal = document.createElement('div');
      reveal.className = 'transmutation-reveal';
      reveal.setAttribute('role', 'status');
      reveal.innerHTML =
        '<span class="transmutation-reveal__motto">Solve et Coagula</span>' +
        '<span class="transmutation-reveal__sub">— dissolve, and bind anew —</span>';
      (alchemyCircle || document.querySelector('.alchemist-hero') || document.body)
        .appendChild(reveal);
      requestAnimationFrame(() => reveal.classList.add('is-visible'));

      const life = reduce ? 2200 : 2600;
      setTimeout(() => reveal.classList.remove('is-visible'), life - 500);
      setTimeout(() => { reveal.remove(); sealed = false; }, life);
    }
  })();
});
