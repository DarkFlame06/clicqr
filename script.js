/**
 * CLICQR — SCRIPT.JS
 * All interactive behaviour for the Clicqr website.
 * Vanilla JS, no dependencies required.
 * Version: 1.0.0
 */

'use strict';

/* ════════════════════════════════════════════════
   1. LOADER
════════════════════════════════════════════════ */
(function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  window.addEventListener('load', () => {
    // Small grace delay so the bar animation completes visually
    setTimeout(() => loader.classList.add('out'), 900);
  });
})();


/* ════════════════════════════════════════════════
   2. NAVBAR — scroll behaviour + active link
════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const links   = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  if (!navbar) return;

  // Add .scrolled class once user scrolls past 20px
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    highlightActiveLink();
  };

  // Highlight the nav link whose section is currently in view
  function highlightActiveLink() {
    let current = '';
    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      if (top <= window.innerHeight * 0.45) current = sec.id;
    });
    links.forEach(link => {
      const href = link.getAttribute('href')?.replace('#', '');
      link.classList.toggle('active', href === current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load
})();


/* ════════════════════════════════════════════════
   3. HAMBURGER / MOBILE MENU
════════════════════════════════════════════════ */
(function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (!hamburger || !mobileMenu) return;

  let isOpen = false;

  function openMenu() {
    isOpen = true;
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    isOpen = false;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => isOpen ? closeMenu() : openMenu());

  // Close when any menu link is clicked
  document.querySelectorAll('[data-close]').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });
})();


/* ════════════════════════════════════════════════
   4. SMOOTH SCROLL for anchor links
════════════════════════════════════════════════ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();


/* ════════════════════════════════════════════════
   5. SCROLL REVEAL  (IntersectionObserver)
════════════════════════════════════════════════ */
(function initReveal() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          // Once revealed, stop observing to save memory
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => {
    // Respect custom reveal delay set via CSS custom property --rd
    const delay = getComputedStyle(el).getPropertyValue('--rd').trim();
    if (delay) el.style.transitionDelay = delay;
    observer.observe(el);
  });
})();


/* ════════════════════════════════════════════════
   6. TOAST NOTIFICATION
════════════════════════════════════════════════ */
const Toast = (() => {
  const el = document.getElementById('toast');
  let tid;

  function show(message, duration = 2800) {
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(tid);
    tid = setTimeout(() => el.classList.remove('show'), duration);
  }

  return { show };
})();


/* ════════════════════════════════════════════════
   7. WISHLIST TOGGLE on product cards
════════════════════════════════════════════════ */
(function initWishlist() {
  document.querySelectorAll('.pcard-btn-wish').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const wished = this.classList.toggle('wished');
      this.textContent = wished ? '♥' : '♡';
      this.setAttribute('aria-label', wished ? 'Remove from wishlist' : 'Save to wishlist');

      // Find the product name in the same card
      const card = this.closest('.pcard');
      const name = card?.querySelector('.pcard-name')?.textContent || 'item';

      Toast.show(wished ? `"${name}" saved to wishlist` : `"${name}" removed from wishlist`);
    });
  });
})();


/* ════════════════════════════════════════════════
   8. NOTIFY ME BUTTONS (product cards)
════════════════════════════════════════════════ */
(function initNotifyButtons() {
  // Simple in-memory store for this session
  const notified = new Set();

  document.querySelectorAll('.pcard-notify').forEach(btn => {
    btn.addEventListener('click', function () {
      const product = this.dataset.product;
      if (!product || notified.has(product)) return;

      notified.add(product);
      this.textContent = '✓ Notified';
      this.classList.add('notified');
      this.disabled = true;

      Toast.show(`We'll notify you when "${product}" launches!`);
    });
  });
})();


/* ════════════════════════════════════════════════
   9. CONTACT FORM VALIDATION & SUBMIT
════════════════════════════════════════════════ */
(function initContactForm() {
  const form    = document.getElementById('contactForm');
  const submitBtn = document.getElementById('formSubmit');
  const successEl = document.getElementById('formSuccess');

  if (!form) return;

  // Simple field validators
  const validators = {
    name: value => {
      if (!value.trim())           return 'Please enter your name.';
      if (value.trim().length < 2) return 'Name must be at least 2 characters.';
      return '';
    },
    email: value => {
      if (!value.trim()) return 'Please enter your email address.';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) return 'Please enter a valid email address.';
      return '';
    }
  };

  function validateField(id, validatorKey) {
    const input = document.getElementById(id);
    const errorEl = document.getElementById(`err-${validatorKey}`);
    if (!input || !errorEl) return true;

    const error = validators[validatorKey](input.value);
    errorEl.textContent = error;
    input.classList.toggle('error', !!error);
    return !error;
  }

  // Validate on blur (user leaves field)
  const nameInput  = document.getElementById('cf-name');
  const emailInput = document.getElementById('cf-email');

  nameInput?.addEventListener('blur',  () => validateField('cf-name',  'name'));
  emailInput?.addEventListener('blur', () => validateField('cf-email', 'email'));

  // Clear error on input
  nameInput?.addEventListener('input',  () => {
    document.getElementById('err-name').textContent = '';
    nameInput.classList.remove('error');
  });
  emailInput?.addEventListener('input', () => {
    document.getElementById('err-email').textContent = '';
    emailInput.classList.remove('error');
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Validate all required fields
    const nameValid  = validateField('cf-name',  'name');
    const emailValid = validateField('cf-email', 'email');

    if (!nameValid || !emailValid) return;

    // Simulate async submission (replace with your real API call)
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    await simulateSubmit();

    submitBtn.textContent = '✓ Message Sent';
    submitBtn.style.background = 'linear-gradient(135deg, #10B981, #059669)';

    successEl.textContent = "Thanks! We'll be in touch soon. Welcome to the Clicqr family.";

    // Reset form after a delay
    setTimeout(() => {
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
      submitBtn.style.background = '';
      successEl.textContent = '';
    }, 5000);

    Toast.show('Message received — we\'ll be in touch!');
  });

  // Fake async delay — replace with your real fetch/API call
  function simulateSubmit() {
    return new Promise(resolve => setTimeout(resolve, 1200));
  }
})();


/* ════════════════════════════════════════════════
   10. PARALLAX HERO ORBS  (desktop only)
════════════════════════════════════════════════ */
(function initParallax() {
  const orbs = document.querySelectorAll('.hero-orb');
  if (!orbs.length) return;

  // Only run if no motion preference and viewport is large enough
  const mediaQuery = window.matchMedia('(min-width: 768px) and (prefers-reduced-motion: no-preference)');
  if (!mediaQuery.matches) return;

  let ticking = false;

  window.addEventListener('mousemove', e => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;

      orbs.forEach((orb, i) => {
        const factor = (i + 1) * 0.5;
        orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
      });
      ticking = false;
    });
  });
})();


/* ════════════════════════════════════════════════
   11. ACTIVE BOTTOM NAV  (mobile UX helper)
     — adds subtle tap-feedback to product cards
════════════════════════════════════════════════ */
(function initMobileTap() {
  if (window.innerWidth > 639) return;

  document.querySelectorAll('.pcard').forEach(card => {
    card.addEventListener('touchstart', () => {
      card.style.transform = 'scale(.98)';
    }, { passive: true });

    card.addEventListener('touchend', () => {
      card.style.transform = '';
    }, { passive: true });
  });
})();


/* ════════════════════════════════════════════════
   12. YEAR — auto-update copyright in footer
════════════════════════════════════════════════ */
(function updateYear() {
  const yearEl = document.querySelector('.footer-bottom p');
  if (yearEl) {
    const year = new Date().getFullYear();
    yearEl.textContent = `© ${year} Clicqr. All rights reserved.`;
  }
})();
