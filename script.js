document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once animated to keep it visible
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in-up');
    animatedElements.forEach(el => observer.observe(el));

    // Simple Parallax Effect for Images
    const parallaxImages = document.querySelectorAll('.parallax-img');
    
    window.addEventListener('scroll', () => {
        parallaxImages.forEach(img => {
            const speed = 0.05;
            const rect = img.getBoundingClientRect();
            // Apply parallax only when the image is in the viewport
            if(rect.top < window.innerHeight && rect.bottom > 0) {
                 const offset = (rect.top - window.innerHeight/2) * speed;
                 // Since we have a hover scale effect, we only translate here
                 img.style.transform = `translateY(${offset}px) scale(1.05)`;
            }
        });
    });
});
