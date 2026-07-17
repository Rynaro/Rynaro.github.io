document.addEventListener('DOMContentLoaded', function() {
  const expBar = document.getElementById('exp-bar');
  const expValue = document.getElementById('exp-value');
  const expContainer = document.getElementById('exp-bar-container');
  const levelBadge = document.querySelector('.level-badge');

  // Get current date
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

  // Calculate progress through the year (0-1)
  const totalYearTime = endOfYear - startOfYear;
  const elapsedTime = now - startOfYear;
  const yearProgress = Math.min(1, elapsedTime / totalYearTime);

  // Get current level
  const currentLevel = parseInt(levelBadge.textContent.match(/\d+/)[0]);

  // Calculate XP requirements
  const maxXP = currentLevel * 150;
  const currentXP = Math.round(yearProgress * maxXP);

  // Format large numbers
  function formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  // Update EXP bar
  const progressPercentage = (currentXP / maxXP) * 100;
  expBar.style.width = `${progressPercentage}%`;
  expValue.textContent = `${formatNumber(currentXP)}/${formatNumber(maxXP)}`;

  // AC-029: role="progressbar" -- keep aria-valuenow/max and aria-valuetext
  // in sync with the JS-computed values (the Liquid-rendered attributes are
  // 0/100 placeholders; this is the real, live progress).
  updateExpAria(currentXP, maxXP);

  function updateExpAria(current, max) {
    if (!expContainer) return;
    expContainer.setAttribute('aria-valuemax', max);
    expContainer.setAttribute('aria-valuenow', current);
    expContainer.setAttribute('aria-valuetext', `${current} of ${max} experience points`);
  }

  // Check for level up
  if (yearProgress === 1) {
    levelUp();
  }

  function levelUp() {
    const newLevel = currentLevel + 1;

    // Add level up animation class
    levelBadge.classList.add('level-up');

    // Update level after animation
    setTimeout(() => {
      levelBadge.textContent = `LVL ${newLevel}`;
      levelBadge.classList.remove('level-up');

      // Update XP values for new level
      const newMaxXP = newLevel * 150;
      expValue.textContent = `0/${formatNumber(newMaxXP)}`;
      expBar.style.width = '0%';
      updateExpAria(0, newMaxXP);
    }, 1000);
  }
});
