/**
 * CLICQR — script.js
 * All interactive behaviour, no external dependencies.
 * Mobile-first, accessible, performant.
 * Version: 1.0.0
 */

'use strict';

/* ═══════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════ */

/** Simple toast notification */
const Toast = (() => {
  const el = document.getElementById('toast');
  let timer;
  return {
    show(msg, duration = 3000) {
      if (!el) return;
      el.textContent = msg;
      el.classList.add('show');
      clearTimeout(timer);
      timer = setTimeout(() => el.classList.remove('show'), duration);
    }
  };
})();

/** Run fn once DOM is ready */
function ready(fn) {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
}


/* ═══════════════════════════════════════════════
   1. NAVBAR — scroll appearance + active link
═══════════════════════════════════════════════ */
function initNavbar() {
  const header   = document.getElementById('site-header');
  const navLinks = document.querySelectorAll('[data-nav]');
  const sections = document.querySelectorAll('main section[id]');

  if (!header) return;

  let lastScroll = 0;

  function onScroll() {
    const scrollY = window.scrollY;

    // Add scrolled class after 10px (adds background blur)
    header.classList.toggle('scrolled', scrollY > 10);

    // Active link highlighting
    let active = '';
    sections.forEach(sec => {
      const top    = sec.getBoundingClientRect().top;
      const middle = window.innerHeight * 0.5;
      if (top <= middle) active = sec.id;
    });

    navLinks.forEach(link => {
      const href = (link.getAttribute('href') || '').replace('#', '');
      link.classList.toggle('active', href === active);
    });

    lastScroll = scrollY;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}


/* ═══════════════════════════════════════════════
   2. HAMBURGER / MOBILE DRAWER
═══════════════════════════════════════════════ */
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const backdrop  = document.getElementById('mnBackdrop');
  const closeBtn  = document.getElementById('mnClose');
  const closeLinks = document.querySelectorAll('[data-close-nav]');

  if (!hamburger || !mobileNav) return;

  let isOpen = false;
  // Track first focusable element for accessibility
  const focusable = mobileNav.querySelectorAll('a, button, [tabindex]');

  function open() {
    isOpen = true;
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('open');
    mobileNav.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Move focus into panel for screen readers
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    isOpen = false;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  hamburger.addEventListener('click', () => (isOpen ? close() : open()));
  closeBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  closeLinks.forEach(link => link.addEventListener('click', close));

  // Escape key closes menu
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) close();
  });
}


/* ═══════════════════════════════════════════════
   3. SMOOTH SCROLL — all internal anchor links
═══════════════════════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id     = this.getAttribute('href');
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update URL without jump
      history.pushState(null, '', id);
    });
  });
}


/* ═══════════════════════════════════════════════
   4. SCROLL REVEAL — IntersectionObserver
═══════════════════════════════════════════════ */
function initReveal() {
  // Skip if reduced motion is preferred
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target); // fire once
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}


/* ═══════════════════════════════════════════════
   5. WISHLIST BUTTONS
═══════════════════════════════════════════════ */
function initWishlist() {
  // In-memory session store
  const wished = new Set();

  document.querySelectorAll('.wish-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const card    = this.closest('.pcard');
      const name    = card?.querySelector('.pcard-name')?.textContent?.trim() || 'item';
      const isNow   = wished.has(name);

      if (isNow) {
        wished.delete(name);
        this.textContent = '♡';
        this.classList.remove('wished');
        this.setAttribute('aria-label', `Save ${name} to wishlist`);
        Toast.show(`"${name}" removed from wishlist`);
      } else {
        wished.add(name);
        this.textContent = '♥';
        this.classList.add('wished');
        this.setAttribute('aria-label', `Remove ${name} from wishlist`);
        Toast.show(`"${name}" saved to wishlist ♥`);
      }
    });
  });
}


/* ═══════════════════════════════════════════════
   6. NOTIFY ME BUTTONS
═══════════════════════════════════════════════ */
function initNotifyButtons() {
  const notified = new Set();

  document.querySelectorAll('.notify-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const product = this.dataset.product;
      if (!product || notified.has(product)) return;

      notified.add(product);
      this.textContent = '✓ Notified';
      this.classList.add('notified');
      this.disabled = true;
      this.setAttribute('aria-label', `You will be notified about ${product}`);

      Toast.show(`We'll notify you when "${product}" launches! 🎉`);
    });
  });
}


/* ═══════════════════════════════════════════════
   7. CONTACT FORM — validation + submit
═══════════════════════════════════════════════ */
function initContactForm() {
  const form      = document.getElementById('contactForm');
  const submitBtn = document.getElementById('formSubmit');
  const successEl = document.getElementById('formSuccess');
  if (!form) return;

  // Validators
  const validate = {
    name:  v => (!v.trim() ? 'Please enter your name.'
               : v.trim().length < 2 ? 'Name must be at least 2 characters.' : ''),
    email: v => (!v.trim() ? 'Please enter your email.'
               : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? 'Please enter a valid email address.' : '')
  };

  function checkField(inputId, key) {
    const input = document.getElementById(inputId);
    const errEl = document.getElementById(`err-${key}`);
    if (!input || !errEl) return true;
    const err = validate[key](input.value);
    errEl.textContent = err;
    input.classList.toggle('error', !!err);
    return !err;
  }

  // Validate on blur
  document.getElementById('cf-name')?.addEventListener('blur',  () => checkField('cf-name',  'name'));
  document.getElementById('cf-email')?.addEventListener('blur', () => checkField('cf-email', 'email'));

  // Clear error on input
  ['cf-name', 'cf-email'].forEach(id => {
    const key = id.replace('cf-', '');
    document.getElementById(id)?.addEventListener('input', () => {
      const errEl = document.getElementById(`err-${key}`);
      if (errEl) errEl.textContent = '';
      document.getElementById(id)?.classList.remove('error');
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const nameOk  = checkField('cf-name',  'name');
    const emailOk = checkField('cf-email', 'email');
    if (!nameOk || !emailOk) return;

    // Loading state
    submitBtn.disabled   = true;
    submitBtn.textContent = 'Sending…';

    // Simulate network delay — replace with your actual API call:
    // await fetch('/api/contact', { method:'POST', body: new FormData(form) })
    await new Promise(r => setTimeout(r, 1200));

    // Success state
    submitBtn.textContent = '✓ Message Sent!';
    submitBtn.style.background = 'linear-gradient(135deg,#10B981,#059669)';
    if (successEl) successEl.textContent = "Thanks! We'll be in touch soon. Welcome to the Clicqr family 🎉";

    Toast.show('Message received! Talk soon.');

    // Reset after 5s
    setTimeout(() => {
      form.reset();
      submitBtn.disabled         = false;
      submitBtn.textContent      = 'Send Message';
      submitBtn.style.background = '';
      if (successEl) successEl.textContent = '';
    }, 5000);
  });
}


/* ═══════════════════════════════════════════════
   8. FOOTER COPYRIGHT YEAR — auto-update
═══════════════════════════════════════════════ */
function initYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = `© ${new Date().getFullYear()} Clicqr. All rights reserved.`;
}


/* ═══════════════════════════════════════════════
   9. PARALLAX BLOBS — desktop mouse follow
      (Only runs when no reduced-motion preference
       and viewport is wide enough)
═══════════════════════════════════════════════ */
function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 768) return;

  const blobs = document.querySelectorAll('.hero-blob');
  if (!blobs.length) return;

  let raf = false;
  window.addEventListener('mousemove', e => {
    if (raf) return;
    raf = true;
    requestAnimationFrame(() => {
      const cx = (e.clientX / window.innerWidth  - .5) * 22;
      const cy = (e.clientY / window.innerHeight - .5) * 14;
      blobs.forEach((b, i) => {
        const f = (i + 1) * .4;
        b.style.transform = `translate(${cx * f}px, ${cy * f}px)`;
      });
      raf = false;
    });
  });
}


/* ═══════════════════════════════════════════════
   10. MOBILE TAP FEEDBACK on product cards
═══════════════════════════════════════════════ */
function initMobileTap() {
  // Only attach on touch devices
  if (!('ontouchstart' in window)) return;

  document.querySelectorAll('.pcard').forEach(card => {
    card.addEventListener('touchstart', () => {
      card.style.transform = 'scale(.97)';
    }, { passive: true });
    card.addEventListener('touchend',   () => { card.style.transform = ''; }, { passive: true });
    card.addEventListener('touchcancel',() => { card.style.transform = ''; }, { passive: true });
  });
}


/* ═══════════════════════════════════════════════
   INIT ALL
═══════════════════════════════════════════════ */
ready(() => {
  initNavbar();
  initMobileNav();
  initSmoothScroll();
  initReveal();
  initWishlist();
  initNotifyButtons();
  initContactForm();
  initYear();
  initParallax();
  initMobileTap();
});
