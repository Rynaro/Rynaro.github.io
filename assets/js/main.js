document.addEventListener('DOMContentLoaded', () => {
  // Initialize mobile navigation
  initMobileNav();

  // Initialize smooth scrolling
  initSmoothScroll();

  // Add animation classes
  animateOnScroll();
});

/**
 * Initialize mobile navigation
 */
function initMobileNav() {
  const mediaQuery = window.matchMedia('(max-width: 768px)');

  // Check if we're on mobile
  if (mediaQuery.matches) {
    // Add listener for scroll to hide/show mobile nav
    let lastScrollTop = 0;
    const sidebar = document.querySelector('.sidebar');

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down
        sidebar.style.transform = 'translateY(100%)';
      } else {
        // Scrolling up
        sidebar.style.transform = 'translateY(0)';
      }

      lastScrollTop = scrollTop;
    });
  }
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();

      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Add animation classes to elements when they scroll into view
 */
function animateOnScroll() {
  const elements = document.querySelectorAll('.card, .section-title, .button');

  // Create IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  // Observe each element
  elements.forEach(element => {
    observer.observe(element);
  });
}
