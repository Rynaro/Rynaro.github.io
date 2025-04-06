document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('contact-form');
  const successMessage = document.getElementById('success-message');
  const errorMessage = document.getElementById('error-message');

  // Animate letter glyphs
  const letterGlyphs = document.querySelectorAll('.letter-glyph');
  letterGlyphs.forEach((glyph, index) => {
    const delay = index * 0.7;
    const duration = 3 + Math.random() * 2;
    glyph.style.animation = `float ${duration}s ease-in-out ${delay}s infinite alternate`;
  });

  // Add magical flourishes to form inputs
  const formInputs = document.querySelectorAll('.form-input, .form-textarea');

  formInputs.forEach(input => {
    // Focus effect
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('input-focused');

      // Add sparkle effect
      const sparkleCount = 3;
      for (let i = 0; i < sparkleCount; i++) {
        setTimeout(() => {
          const sparkle = document.createElement('div');
          sparkle.className = 'input-sparkle';

          // Randomize sparkle position
          const posX = 10 + Math.random() * 80;
          sparkle.style.left = `${posX}%`;

          this.parentElement.appendChild(sparkle);

          // Remove sparkle after animation
          setTimeout(() => {
            sparkle.remove();
          }, 1000);
        }, i * 200);
      }
    });

    // Blur effect
    input.addEventListener('blur', function() {
      this.parentElement.classList.remove('input-focused');
    });
  });

  // Form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(form);
    const submitButton = form.querySelector('.submit-button');

    // Disable button and show loading state
    submitButton.disabled = true;
    submitButton.classList.add('is-loading');

    fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        // Show success message
        form.reset();
        form.style.display = 'none';
        successMessage.style.display = 'flex';

        // Add magical success effects
        const magicalBurst = document.createElement('div');
        magicalBurst.className = 'magical-burst';
        successMessage.appendChild(magicalBurst);

        // Remove magical burst after animation
        setTimeout(() => {
          magicalBurst.remove();
        }, 2000);
      } else {
        throw new Error('Network response was not ok');
      }
    })
    .catch(error => {
      // Show error message
      console.error('Error:', error);
      errorMessage.style.display = 'flex';

      // Re-enable button
      submitButton.disabled = false;
      submitButton.classList.remove('is-loading');
    });
  });
});
