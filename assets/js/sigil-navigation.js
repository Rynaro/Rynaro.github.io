// Add this to a new file: assets/js/horizontal-sigil-nav.js
document.addEventListener('DOMContentLoaded', function() {
  // Set active state based on current page
  const currentPath = window.location.pathname;
  const navItems = document.querySelectorAll('.sigil-nav-item');
  
  navItems.forEach(item => {
    const link = item.querySelector('a').getAttribute('href');
    
    // Check if this is the current page
    if ((link === '/' && currentPath === '/') || 
        (link !== '/' && currentPath.startsWith(link))) {
      item.classList.add('active');
    }
  });
  
  // Add alchemical spark effects on hover (if reduced motion is not preferred)
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const sigilNav = document.querySelector('.sigil-nav');
    
    navItems.forEach(item => {
      const iconBubble = item.querySelector('.sigil-icon-bubble');
      
      iconBubble.addEventListener('mouseenter', function() {
        createSparks(this);
      });
      
      iconBubble.addEventListener('click', function() {
        createSparks(this, true);
      });
    });
    
    function createSparks(element, isClick = false) {
      const count = isClick ? 12 : 6;
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      for (let i = 0; i < count; i++) {
        const spark = document.createElement('div');
        spark.className = 'sigil-spark';
        document.body.appendChild(spark);
        
        // Set initial position at the center of the bubble
        spark.style.left = `${centerX}px`;
        spark.style.top = `${centerY}px`;
        
        // Random parameters for movement
        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 60;
        const duration = 0.6 + Math.random() * 0.8;
        
        // Random colors for sparks
        const colors = [
          'rgba(205, 180, 219, 0.8)',
          'rgba(185, 201, 230, 0.8)',
          'rgba(248, 209, 224, 0.8)',
          'rgba(200, 231, 213, 0.8)'
        ];
        spark.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Animate the spark
        spark.animate([
          { 
            transform: 'scale(1) translate(0, 0)',
            opacity: 1
          },
          { 
            transform: `scale(0) translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`,
            opacity: 0
          }
        ], {
          duration: duration * 1000,
          easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        });
        
        // Remove spark after animation
        setTimeout(() => {
          spark.remove();
        }, duration * 1000);
      }
    }
  }
  
  // Make nav bar slightly transparent when scrolling down
  let scrollTimeout;
  const sigilNav = document.querySelector('.sigil-nav');
  
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    
    if (window.scrollY > 100) {
      sigilNav.style.background = 'rgba(33, 28, 48, 0.65)';
    } else {
      sigilNav.style.background = 'rgba(33, 28, 48, 0.75)';
    }
    
    scrollTimeout = setTimeout(function() {
      sigilNav.style.background = 'rgba(33, 28, 48, 0.75)';
    }, 200);
  });
  
  // Ensure tooltips don't go off-screen
  navItems.forEach(item => {
    const tooltip = item.querySelector('.sigil-title');
    
    item.addEventListener('mouseenter', function() {
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      if (tooltipRect.right > viewportWidth) {
        tooltip.style.left = 'auto';
        tooltip.style.right = '0';
        tooltip.style.transform = 'translateY(5px)';
        
        // Also move the arrow
        const arrow = tooltip.querySelector('::before');
        if (arrow) {
          arrow.style.left = 'auto';
          arrow.style.right = '10px';
        }
      }
    });
  });
});
