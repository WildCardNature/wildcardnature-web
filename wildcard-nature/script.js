/**
 * WildCard Nature - Website Scripts
 * Modern interactions and animations
 */

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initParticles();
  initWaitlistForm();
  initScrollAnimations();
  initCardAnimations();
});

/**
 * Navigation functionality
 */
function initNavigation() {
  const nav = document.getElementById('nav');
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  // Scroll effect for nav
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });

  // Mobile menu toggle
  mobileToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    mobileToggle.classList.toggle('active');
  });

  // Close mobile menu on link click
  const mobileLinks = mobileMenu.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      mobileToggle.classList.remove('active');
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/**
 * Floating particles animation
 */
function initParticles() {
  const container = document.getElementById('particles');
  const particleCount = 30;

  for (let i = 0; i < particleCount; i++) {
    createParticle(container);
  }
}

function createParticle(container) {
  const particle = document.createElement('div');
  particle.className = 'particle';

  // Random position
  particle.style.left = Math.random() * 100 + '%';

  // Random size
  const size = Math.random() * 4 + 2;
  particle.style.width = size + 'px';
  particle.style.height = size + 'px';

  // Random animation duration and delay
  const duration = Math.random() * 20 + 15;
  const delay = Math.random() * 20;
  particle.style.animationDuration = duration + 's';
  particle.style.animationDelay = delay + 's';

  // Random color (green or blue tint)
  const colors = ['#22c55e', '#3b82f6', '#8b5cf6', '#10b981'];
  particle.style.background = colors[Math.floor(Math.random() * colors.length)];

  container.appendChild(particle);
}

/**
 * Waitlist form handling
 */
function initWaitlistForm() {
  const form = document.getElementById('waitlistForm');
  const successMessage = document.getElementById('waitlistSuccess');
  const emailInput = document.getElementById('emailInput');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value;
    const button = form.querySelector('button');
    const originalText = button.innerHTML;

    // Show loading state
    button.innerHTML = '<span>Joining...</span>';
    button.disabled = true;

    // Simulate API call (replace with actual API endpoint)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Show success state
    form.style.display = 'none';
    successMessage.classList.add('show');

    // Store email in localStorage for demo
    const waitlist = JSON.parse(localStorage.getItem('waitlist') || '[]');
    waitlist.push({ email, timestamp: new Date().toISOString() });
    localStorage.setItem('waitlist', JSON.stringify(waitlist));

    // Update counter (demo)
    console.log('Email added to waitlist:', email);
  });
}

/**
 * Scroll-triggered animations using Intersection Observer
 */
function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe elements
  const animatedElements = document.querySelectorAll(
    '.feature-card, .step, .rarity-card, .nft-card, .section-header'
  );

  animatedElements.forEach(el => {
    observer.observe(el);
  });
}

/**
 * Interactive card animations
 */
function initCardAnimations() {
  // Hero card stack hover effect
  const cardStack = document.querySelector('.card-stack');
  if (cardStack) {
    const cards = cardStack.querySelectorAll('.demo-card');

    cardStack.addEventListener('mousemove', (e) => {
      const rect = cardStack.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      cards.forEach((card, index) => {
        const depth = (3 - index) * 2;
        const rotateX = y * depth * 2;
        const rotateY = -x * depth * 2;
        const translateZ = depth * 10;

        card.style.transform = `
          perspective(1000px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          translateZ(${translateZ}px)
        `;
      });
    });

    cardStack.addEventListener('mouseleave', () => {
      cards.forEach((card, index) => {
        // Reset to original transforms
        if (index === 0) {
          card.style.transform = 'rotate(-2deg)';
        } else if (index === 1) {
          card.style.transform = 'translateX(20px) translateY(10px) rotate(3deg)';
        } else {
          card.style.transform = 'translateX(-20px) translateY(20px) rotate(-5deg)';
        }
      });
    });
  }

  // Rarity card tilt effect
  const rarityCards = document.querySelectorAll('.rarity-card');
  rarityCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const rotateX = (y - 0.5) * 10;
      const rotateY = (x - 0.5) * -10;

      card.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateY(-8px)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // NFT card rotation effect
  const nftCard = document.querySelector('.nft-card');
  if (nftCard) {
    nftCard.addEventListener('mousemove', (e) => {
      const rect = nftCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const rotateX = (y - 0.5) * 15;
      const rotateY = (x - 0.5) * -15;

      nftCard.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
      `;
    });

    nftCard.addEventListener('mouseleave', () => {
      nftCard.style.transform = '';
    });
  }
}

/**
 * Typing effect for hero text (optional enhancement)
 */
function initTypingEffect() {
  const heroTitle = document.querySelector('.hero-title .gradient-text');
  if (!heroTitle) return;

  const text = heroTitle.textContent;
  heroTitle.textContent = '';
  heroTitle.style.opacity = '1';

  let i = 0;
  const typeInterval = setInterval(() => {
    if (i < text.length) {
      heroTitle.textContent += text.charAt(i);
      i++;
    } else {
      clearInterval(typeInterval);
    }
  }, 100);
}

/**
 * Counter animation for stats
 */
function animateCounters() {
  const counters = document.querySelectorAll('.stat-value');

  counters.forEach(counter => {
    const target = counter.textContent;
    if (target === '∞') return;

    const value = parseInt(target.replace(/\D/g, ''));
    const suffix = target.replace(/\d/g, '');
    let current = 0;
    const increment = value / 50;
    const duration = 1500;
    const stepTime = duration / 50;

    const updateCounter = () => {
      current += increment;
      if (current < value) {
        counter.textContent = Math.floor(current) + suffix;
        setTimeout(updateCounter, stepTime);
      } else {
        counter.textContent = target;
      }
    };

    updateCounter();
  });
}

/**
 * Parallax effect for background elements
 */
function initParallax() {
  const parallaxElements = document.querySelectorAll('[data-parallax]');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    parallaxElements.forEach(el => {
      const speed = el.dataset.parallax || 0.5;
      el.style.transform = `translateY(${scrollY * speed}px)`;
    });
  });
}

/**
 * Theme toggle (for future dark/light mode)
 */
function initThemeToggle() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme');
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Utility: Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Utility: Throttle function
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Performance optimization: Use passive event listeners for scroll
document.addEventListener('scroll', throttle(() => {
  // Scroll-based animations here
}, 100), { passive: true });

// Log for development
console.log('WildCard Nature website initialized');
