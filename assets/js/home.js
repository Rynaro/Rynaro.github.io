// Enhanced Home Page JavaScript with better mobile support
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
    // Apply animations with more subtle effects on mobile
    symbolNames.forEach((name, index) => {
      // Find the element
      let selector = `.alchemy-symbol--${name}, .rune--${name}`;
      let element = document.querySelector(selector);
      
      if (element) {
        // Set unique animation delays to stagger movement
        const delay = (index * 0.5) % 2; // Stagger between 0-2 seconds
        const duration = isMobile ? (3 + (index % 2)) : (3 + (index % 3)); // Shorter on mobile
        
        // Apply the animation style directly
        element.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
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
});
