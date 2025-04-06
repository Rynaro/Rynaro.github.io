document.addEventListener('DOMContentLoaded', () => {
  // Initialize animations
  animateAttributeBars();
  animateOrbs();

  // Initialize quest toggling
  initQuestToggle();

  // Initialize ability cards
  initAbilityCards();

  // Initialize timeline hover effects
  initTimelineHover();

  // Initialize fade-in animations
  initFadeInAnimations();
});

/**
 * Animate attribute bars with a smooth transition
 */
function animateAttributeBars() {
  const bars = document.querySelectorAll('.attribute-fill');
  bars.forEach(bar => {
    const width = bar.style.width;
    bar.style.width = '0';
    setTimeout(() => {
      bar.style.transition = 'width 1.2s cubic-bezier(0.12, 0.89, 0.32, 1.27)';
      bar.style.width = width;
    }, 300);
  });
}

/**
 * Initialize quest history toggle functionality
 */
function initQuestToggle() {
  const toggleButton = document.querySelector('.toggle-button');
  const hiddenQuests = document.querySelectorAll('.timeline-item.hidden');
  const toggleMore = document.querySelector('.toggle-more');

  if (toggleButton) {
    toggleButton.addEventListener('click', function() {
      hiddenQuests.forEach(quest => {
        quest.classList.toggle('show');
      });

      if (this.textContent === 'Show more adventures') {
        this.textContent = 'Hide adventures';
        toggleMore.querySelector('.timeline-marker i').classList.replace('fa-chevron-down', 'fa-chevron-up');
      } else {
        this.textContent = 'Show more adventures';
        toggleMore.querySelector('.timeline-marker i').classList.replace('fa-chevron-up', 'fa-chevron-down');
      }
    });
  }
}

/**
 * Initialize floating effect for ability cards
 */
function initAbilityCards() {
  const abilityCards = document.querySelectorAll('.ability-card');
  abilityCards.forEach((card, index) => {
    card.style.animationDelay = (index * 0.2) + 's';
  });
}

/**
 * Initialize hover effects for timeline items
 */
function initTimelineHover() {
  const timelineItems = document.querySelectorAll('.timeline-item:not(.toggle-more)');
  timelineItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
      this.classList.add('hovered');
    });

    item.addEventListener('mouseleave', function() {
      this.classList.remove('hovered');
    });
  });
}

/**
 * Initialize fade-in animations using Intersection Observer
 */
function initFadeInAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.sheet-block, .attribute-card, .ability-card, .trait-card').forEach(el => {
    el.classList.add('fade-in-element');
    observer.observe(el);
  });
}

/**
 * Animate the avatar orbs with orbital motion
 */
function animateOrbs() {
  const orbs = document.querySelectorAll('.avatar-orbs .orb');
  orbs.forEach((orb, index) => {
    orb.style.animation = `orbit ${8 + index * 2}s linear infinite`;
    orb.style.animationDelay = `${index * 0.5}s`;
  });
}
