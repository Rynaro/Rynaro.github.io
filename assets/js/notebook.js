document.addEventListener('DOMContentLoaded', function() {
  // Filter functionality
  const categoryTabs = document.querySelectorAll('.category-tab');
  const scrollItems = document.querySelectorAll('.scroll-item');
  const searchInput = document.getElementById('scroll-search');
  const emptyArchive = document.querySelector('.empty-archive');
  const resetButton = document.querySelector('.reset-search-button');

  // Animate glyphs
  const glyphs = document.querySelectorAll('.glyph');
  glyphs.forEach((glyph, index) => {
    const delay = index * 0.7;
    const duration = 3 + Math.random() * 2;
    glyph.style.animation = `float ${duration}s ease-in-out ${delay}s infinite alternate`;
  });

  // Add rarity classes and effects
  scrollItems.forEach(item => {
    const scrollCard = item.querySelector('.scroll-card');
    const rarityElement = item.querySelector('.scroll-rarity');

    if (rarityElement.classList.contains('legendary')) {
      scrollCard.classList.add('legendary-card');
    } else if (rarityElement.classList.contains('epic')) {
      scrollCard.classList.add('epic-card');
    } else if (rarityElement.classList.contains('rare')) {
      scrollCard.classList.add('rare-card');
    }
  });

  // Filter scrolls by category and search term
  function filterScrolls() {
    const activeCategory = document.querySelector('.category-tab.active').getAttribute('data-category');
    const searchTerm = searchInput.value.toLowerCase();

    let visibleCount = 0;

    scrollItems.forEach(item => {
      const category = item.getAttribute('data-category');
      const title = item.querySelector('.scroll-title').textContent.toLowerCase();
      const excerpt = item.querySelector('.scroll-excerpt').textContent.toLowerCase();
      const tags = Array.from(item.querySelectorAll('.scroll-tag')).map(tag => tag.textContent.toLowerCase());

      const matchesCategory = activeCategory === 'all' || category === activeCategory;
      const matchesSearch = searchTerm === '' ||
                          title.includes(searchTerm) ||
                          excerpt.includes(searchTerm) ||
                          tags.some(tag => tag.includes(searchTerm));

      if (matchesCategory && matchesSearch) {
        item.classList.remove('hidden');
        visibleCount++;
      } else {
        item.classList.add('hidden');
      }
    });

    // Show empty state if no results
    emptyArchive.style.display = visibleCount === 0 ? 'flex' : 'none';
  }

  // Tab click event
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      categoryTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Filter scrolls
      filterScrolls();
    });
  });

  // Search input event
  searchInput.addEventListener('input', filterScrolls);

  // Reset search button
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      searchInput.value = '';
      categoryTabs.forEach(tab => {
        if (tab.getAttribute('data-category') === 'all') {
          tab.classList.add('active');
          tab.setAttribute('aria-selected', 'true');
        } else {
          tab.classList.remove('active');
          tab.setAttribute('aria-selected', 'false');
        }
      });
      filterScrolls();
    });
  }

  // Initialize with all scrolls visible
  filterScrolls();

  // Add hover effects
  const scrollCards = document.querySelectorAll('.scroll-card');
  scrollCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      // Add page turning effect
      this.classList.add('hover');

      // Add magical dust particles on hover
      const particleCount = 5;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'magic-particle';

        // Randomize particle properties
        const size = 2 + Math.random() * 3;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const duration = 0.5 + Math.random() * 1;

        // Determine particle color based on scroll rarity
        let color;
        if (this.classList.contains('legendary-card')) {
          color = 'var(--rarity-legendary)';
        } else if (this.classList.contains('epic-card')) {
          color = 'var(--rarity-epic)';
        } else if (this.classList.contains('rare-card')) {
          color = 'var(--rarity-rare)';
        } else {
          color = 'var(--rarity-common)';
        }

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.backgroundColor = color;

        this.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
          particle.remove();
        }, (delay + duration) * 1000);
      }
    });

    card.addEventListener('mouseleave', function() {
      this.classList.remove('hover');
    });
  });

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all scroll items
  scrollItems.forEach((item, index) => {
    // Add delay based on index for staggered animation
    item.style.animationDelay = `${index * 0.1}s`;
    observer.observe(item);
  });
});
