/* ===== CLICQR — Interactive 3D Luxury Experience ===== */

(function () {
    'use strict';

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
                if (typeof gsap !== 'undefined') initAnimations();
            }, 600);
        }
        preloaderFill.style.width = progress + '%';
    }, 200);

    /* ----- Particles Canvas ----- */
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;

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
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
                this.x += dx * 0.002;
                this.y += dy * 0.002;
            }
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
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
        if (spotlight) {
            spotlight.style.left = e.clientX + 'px';
            spotlight.style.top = e.clientY + 'px';
        }
    });

    /* ----- Navbar Scroll ----- */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    });

    /* ----- Smooth Scroll Links ----- */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
        });
    });

    /* ===================================================
       THREE.JS HERO SCENE
       =================================================== */
    function initThreeScene() {
        const heroCanvas = document.getElementById('threejs-hero');
        if (!heroCanvas || typeof THREE === 'undefined') return;

        const hero = document.querySelector('.hero');
        heroCanvas.width = hero.offsetWidth;
        heroCanvas.height = hero.offsetHeight;

        const renderer = new THREE.WebGLRenderer({ canvas: heroCanvas, alpha: true, antialias: true });
        renderer.setSize(hero.offsetWidth, hero.offsetHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, hero.offsetWidth / hero.offsetHeight, 0.1, 100);
        camera.position.z = 5;

        // Gold material
        const goldMat = new THREE.MeshStandardMaterial({
            color: 0xc9a96e,
            metalness: 0.9,
            roughness: 0.2,
            wireframe: false,
            emissive: 0x3d2800,
            emissiveIntensity: 0.3,
        });
        const wireMat = new THREE.MeshBasicMaterial({ color: 0xc9a96e, wireframe: true, transparent: true, opacity: 0.12 });

        // Icosahedron (main hero gem)
        const icoGeo = new THREE.IcosahedronGeometry(1.2, 1);
        const ico = new THREE.Mesh(icoGeo, goldMat);
        ico.position.set(2.5, 0, -1);
        scene.add(ico);

        // Wireframe double
        const icoWire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 1), wireMat);
        icoWire.position.copy(ico.position);
        scene.add(icoWire);

        // Torus ring
        const torusGeo = new THREE.TorusGeometry(1.8, 0.015, 8, 120);
        const torus = new THREE.Mesh(torusGeo, new THREE.MeshBasicMaterial({ color: 0xc9a96e, transparent: true, opacity: 0.25 }));
        torus.position.set(-2.5, 0.3, -1.5);
        torus.rotation.x = Math.PI / 3;
        scene.add(torus);

        // Small orbiting gem
        const smallGeo = new THREE.OctahedronGeometry(0.35, 0);
        const small = new THREE.Mesh(smallGeo, goldMat.clone());
        small.material.emissiveIntensity = 0.5;
        scene.add(small);

        // Ambient + directional light
        scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        const dirLight = new THREE.DirectionalLight(0xffd080, 2);
        dirLight.position.set(5, 5, 5);
        scene.add(dirLight);
        const rimLight = new THREE.DirectionalLight(0xc9a96e, 1);
        rimLight.position.set(-5, -2, 3);
        scene.add(rimLight);

        // Mouse reactive vars
        let targetRotX = 0, targetRotY = 0;
        let currentRotX = 0, currentRotY = 0;
        const heroRect = hero.getBoundingClientRect();

        document.addEventListener('mousemove', (e) => {
            const nx = (e.clientX / window.innerWidth - 0.5) * 2;
            const ny = (e.clientY / window.innerHeight - 0.5) * 2;
            targetRotY = nx * 0.4;
            targetRotX = -ny * 0.3;
        });

        let t = 0;
        function threeAnimate() {
            requestAnimationFrame(threeAnimate);
            t += 0.008;

            // Smooth mouse follow
            currentRotX += (targetRotX - currentRotX) * 0.04;
            currentRotY += (targetRotY - currentRotY) * 0.04;

            // Ico rotation + mouse parallax
            ico.rotation.x = t * 0.3 + currentRotX;
            ico.rotation.y = t * 0.5 + currentRotY;
            icoWire.rotation.copy(ico.rotation);

            // Torus spin
            torus.rotation.z = t * 0.2;
            torus.rotation.y = t * 0.1 + currentRotY * 0.5;

            // Orbiting small gem
            small.position.set(
                ico.position.x + Math.cos(t * 0.8) * 2.2,
                ico.position.y + Math.sin(t * 1.1) * 1.2,
                ico.position.z + Math.sin(t * 0.8) * 0.5
            );
            small.rotation.x = t * 1.5;
            small.rotation.y = t * 2;

            // Camera subtle drift
            camera.position.x = currentRotY * 0.3;
            camera.position.y = currentRotX * 0.2;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);
        }
        threeAnimate();

        // Resize
        window.addEventListener('resize', () => {
            const w = hero.offsetWidth, h = hero.offsetHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        });

        // Scroll fade
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            const heroH = hero.offsetHeight;
            heroCanvas.style.opacity = Math.max(0, 1 - scrolled / (heroH * 0.5));
        });
    }

    // Init Three.js after DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initThreeScene);
    } else {
        initThreeScene();
    }

    /* ===================================================
       COUNTER ANIMATION
       =================================================== */
    function animateCounters() {
        if (typeof gsap === 'undefined') return;
        document.querySelectorAll('.stat-number').forEach(el => {
            const target = parseInt(el.dataset.count);
            gsap.to(el, {
                innerText: target, duration: 2,
                snap: { innerText: 1 }, ease: 'power2.out',
                scrollTrigger: { trigger: el, start: 'top 85%', once: true }
            });
        });
    }

    /* ===================================================
       GSAP ANIMATIONS
       =================================================== */
    function initAnimations() {
        gsap.registerPlugin(ScrollTrigger);
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.to('.title-word', { y: 0, opacity: 1, duration: 1.2, stagger: 0.12 })
          .to('.hero-eyebrow', { opacity: 1, duration: 0.8 }, '-=0.6')
          .to('.hero-subtitle', { opacity: 1, duration: 0.8 }, '-=0.5')
          .to('.hero-cta', { opacity: 1, duration: 0.8 }, '-=0.4')
          .to('.hero-scroll-indicator', { opacity: 0.6, duration: 0.8 }, '-=0.3')
          .to('.hero-floating-tag', { opacity: 0.5, duration: 0.8 }, '-=0.6');

        // Hero parallax
        gsap.to('.hero-content', {
            y: -100, opacity: 0,
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.5 }
        });
        gsap.to('.hero-glow', {
            scale: 2, opacity: 0,
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
        });

        // 3D Rings parallax on scroll
        gsap.to('.hero-3d-ring', {
            rotateZ: 360,
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 2 }
        });
        gsap.to('.hero-3d-ring-2', {
            rotateZ: -360,
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 3 }
        });

        // Section eyebrows
        gsap.utils.toArray('.section-eyebrow').forEach(el => {
            gsap.to(el, { opacity: 1, y: 0, duration: 1,
                scrollTrigger: { trigger: el, start: 'top 85%' } });
        });

        // Reveal lines
        gsap.utils.toArray('.reveal-line').forEach(line => {
            gsap.from(line, { y: 60, opacity: 0, duration: 1, ease: 'power3.out',
                scrollTrigger: { trigger: line, start: 'top 90%' } });
        });

        // Vision description
        gsap.utils.toArray('.reveal-text').forEach(el => {
            gsap.to(el, { opacity: 1, y: 0, duration: 1.2,
                scrollTrigger: { trigger: el, start: 'top 85%' } });
        });

        // Vision images
        gsap.from('.img-1', { x: -60, opacity: 0, duration: 1.2,
            scrollTrigger: { trigger: '.vision-image-stack', start: 'top 80%' } });
        gsap.from('.img-2', { x: 60, opacity: 0, duration: 1.2, delay: 0.3,
            scrollTrigger: { trigger: '.vision-image-stack', start: 'top 80%' } });

        // Product flip cards — stagger entrance
        gsap.from('.product-card-3d', { y: 100, opacity: 0, duration: 1.2, stagger: 0.2, ease: 'power3.out',
            scrollTrigger: { trigger: '.collection-grid', start: 'top 85%' } });

        // Feature blocks
        gsap.from('.feature-block', { y: 60, opacity: 0, duration: 1, stagger: 0.15,
            scrollTrigger: { trigger: '.feature-row', start: 'top 85%' } });

        // Testimonials
        gsap.from('.testimonial-card', { y: 50, opacity: 0, duration: 1, stagger: 0.15,
            scrollTrigger: { trigger: '.testimonials-track', start: 'top 85%' } });

        // Footer
        gsap.from('.footer-grid > *', { y: 30, opacity: 0, duration: 0.8, stagger: 0.1,
            scrollTrigger: { trigger: '.footer-grid', start: 'top 90%' } });

        animateCounters();
    }
})();
