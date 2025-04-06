document.addEventListener('DOMContentLoaded', function() {
  // Filter functionality
  const filterButtons = document.querySelectorAll('.filter-button');
  const projectItems = document.querySelectorAll('.project-item');
  const searchInput = document.getElementById('project-search');
  const emptyState = document.querySelector('.empty-state');
  const resetButton = document.querySelector('.reset-search-button');

  // Animate particles
  const particles = document.querySelectorAll('.particle');
  particles.forEach((particle, index) => {
    particle.style.animation = `float ${3 + (index % 2)}s ease-in-out ${index * 0.7}s infinite alternate`;
  });

  // Add rarity classes based on project properties
  projectItems.forEach(item => {
    // You can modify this to determine rarity based on other factors
    const rarityIndicator = item.querySelector('.item-rarity-indicator');

    if (rarityIndicator.getAttribute('data-rarity') === 'legendary') {
      rarityIndicator.classList.add('legendary');
    } else if (rarityIndicator.getAttribute('data-rarity') === 'epic') {
      rarityIndicator.classList.add('epic');
    } else if (rarityIndicator.getAttribute('data-rarity') === 'rare') {
      rarityIndicator.classList.add('rare');
    } else {
      rarityIndicator.classList.add('common');
    }
  });

  // Filter projects by type and search term
  function filterProjects() {
    const activeFilter = document.querySelector('.filter-button.active').getAttribute('data-filter');
    const searchTerm = searchInput.value.toLowerCase();

    let visibleCount = 0;

    projectItems.forEach(item => {
      const type = item.getAttribute('data-type');
      const title = item.querySelector('.item-name').textContent.toLowerCase();
      const description = item.querySelector('.item-description').textContent.toLowerCase();

      const matchesFilter = activeFilter === 'all' || type === activeFilter;
      const matchesSearch = searchTerm === '' ||
                            title.includes(searchTerm) ||
                            description.includes(searchTerm);

      if (matchesFilter && matchesSearch) {
        item.style.display = 'block';
        visibleCount++;

        // Add fade-in animation
        setTimeout(() => {
          item.classList.add('visible');
        }, 50 * visibleCount); // Stagger the animations
      } else {
        item.style.display = 'none';
        item.classList.remove('visible');
      }
    });

    // Show empty state if no results
    emptyState.style.display = visibleCount === 0 ? 'flex' : 'none';
  }

  // Filter button click event
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active filter
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Reset visible state for animation
      projectItems.forEach(item => {
        item.classList.remove('visible');
      });

      // Filter projects
      filterProjects();
    });
  });

  // Search input event
  searchInput.addEventListener('input', filterProjects);

  // Reset search button
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      searchInput.value = '';
      filterButtons.forEach(btn => {
        if (btn.getAttribute('data-filter') === 'all') {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      filterProjects();
    });
  }

  // Initialize with all projects visible
  filterProjects();

  // Add hover effects
  const itemCards = document.querySelectorAll('.item-card');
  itemCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      // Add particle effects
      const particleCount = 3;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'item-particle';

        // Randomize particle properties
        const size = 3 + Math.random() * 4;
        const posX = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const duration = 0.5 + Math.random() * 1;
        const color = getComputedStyle(document.documentElement).getPropertyValue('--ff-gold');

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
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

  // Observe all project items
  projectItems.forEach(item => {
    observer.observe(item);
  });
});
