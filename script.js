/* ===== CLICQR — Cinematic Luxury Experience ===== */

(function () {
    'use strict';

    // Wait for GSAP
    if (typeof gsap === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    /* ----- Preloader ----- */
    const preloader = document.getElementById('preloader');
    const preloaderFill = document.getElementById('preloader-fill');
    let progress = 0;

    const preloaderInterval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(preloaderInterval);
            preloaderFill.style.width = '100%';
            setTimeout(() => {
                preloader.classList.add('done');
                initAnimations();
            }, 600);
        }
        preloaderFill.style.width = progress + '%';
    }, 200);

    /* ----- Particles ----- */
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = 0, mouseY = 0;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.5 + 0.3;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.4 + 0.1;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            // Subtle mouse attraction
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
                this.x += dx * 0.002;
                this.y += dy * 0.002;
            }
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(201, 169, 110, ${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < 80; i++) particles.push(new Particle());

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    /* ----- Mouse Spotlight ----- */
    const spotlight = document.getElementById('mouse-spotlight');
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        spotlight.style.left = e.clientX + 'px';
        spotlight.style.top = e.clientY + 'px';
    });

    /* ----- Navbar Scroll ----- */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    });

    /* ----- 3D Tilt Cards ----- */
    document.querySelectorAll('[data-tilt]').forEach(card => {
        const inner = card.querySelector('.card-inner');
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            inner.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            inner.style.transform = 'rotateY(0) rotateX(0) scale(1)';
        });
    });

    /* ----- Smooth Scroll Links ----- */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    /* ----- Counter Animation ----- */
    function animateCounters() {
        document.querySelectorAll('.stat-number').forEach(el => {
            const target = parseInt(el.dataset.count);
            const duration = 2;
            gsap.to(el, {
                innerText: target,
                duration: duration,
                snap: { innerText: 1 },
                ease: 'power2.out',
                scrollTrigger: { trigger: el, start: 'top 85%', once: true }
            });
        });
    }

    /* ----- Main GSAP Animations ----- */
    function initAnimations() {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Hero entrance
        tl.to('.title-word', {
            y: 0, opacity: 1, duration: 1.2, stagger: 0.12
        })
        .to('.hero-eyebrow', { opacity: 1, duration: 0.8 }, '-=0.6')
        .to('.hero-subtitle', { opacity: 1, duration: 0.8 }, '-=0.5')
        .to('.hero-cta', { opacity: 1, duration: 0.8 }, '-=0.4')
        .to('.hero-scroll-indicator', { opacity: 0.6, duration: 0.8 }, '-=0.3')
        .to('.hero-floating-tag', { opacity: 0.5, duration: 0.8 }, '-=0.6');

        // Hero parallax on scroll
        gsap.to('.hero-content', {
            y: -100, opacity: 0,
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.5 }
        });
        gsap.to('.hero-glow', {
            scale: 2, opacity: 0,
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
        });

        // Section eyebrows
        gsap.utils.toArray('.section-eyebrow').forEach(el => {
            gsap.to(el, {
                opacity: 1, y: 0, duration: 1,
                scrollTrigger: { trigger: el, start: 'top 85%' }
            });
        });

        // Reveal lines
        gsap.utils.toArray('.reveal-line').forEach(line => {
            gsap.from(line, {
                y: 60, opacity: 0, duration: 1, ease: 'power3.out',
                scrollTrigger: { trigger: line, start: 'top 90%' }
            });
        });

        // Vision description
        gsap.utils.toArray('.reveal-text').forEach(el => {
            gsap.to(el, {
                opacity: 1, y: 0, duration: 1.2,
                scrollTrigger: { trigger: el, start: 'top 85%' }
            });
        });

        // Vision images
        gsap.from('.img-1', {
            x: -60, opacity: 0, duration: 1.2,
            scrollTrigger: { trigger: '.vision-image-stack', start: 'top 80%' }
        });
        gsap.from('.img-2', {
            x: 60, opacity: 0, duration: 1.2, delay: 0.3,
            scrollTrigger: { trigger: '.vision-image-stack', start: 'top 80%' }
        });

        // Product cards stagger
        gsap.from('.product-card-3d', {
            y: 80, opacity: 0, duration: 1, stagger: 0.2,
            scrollTrigger: { trigger: '.collection-grid', start: 'top 85%' }
        });

        // Feature blocks
        gsap.from('.feature-block', {
            y: 60, opacity: 0, duration: 1, stagger: 0.15,
            scrollTrigger: { trigger: '.feature-row', start: 'top 85%' }
        });

        // Testimonial cards
        gsap.from('.testimonial-card', {
            y: 50, opacity: 0, duration: 1, stagger: 0.15,
            scrollTrigger: { trigger: '.testimonials-track', start: 'top 85%' }
        });

        // Footer reveal
        gsap.from('.footer-grid > *', {
            y: 30, opacity: 0, duration: 0.8, stagger: 0.1,
            scrollTrigger: { trigger: '.footer-grid', start: 'top 90%' }
        });

        animateCounters();
    }
})();
