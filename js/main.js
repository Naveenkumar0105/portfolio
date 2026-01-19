document.addEventListener('DOMContentLoaded', () => {

    // --- Sticky Navbar ---
    const nav = document.querySelector('.arcane-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // --- Smooth Scroll for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Vanilla JS Tilt Effect ---
    // A lightweight implementation of the tilt effect for project cards
    const cards = document.querySelectorAll('[data-tilt]');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top + cardRect.height / 2;

            const mouseX = e.clientX;
            const mouseY = e.clientY;

            // Calculate rotation based on mouse position relative to center
            // Max rotation 10 degrees
            const rotateX = -((mouseY - cardCenterY) / (cardRect.height / 2)) * 10;
            const rotateY = ((mouseX - cardCenterX) / (cardRect.width / 2)) * 10;

            const cardInner = card.querySelector('.card-inner');
            if (cardInner) {
                // Note: We need to preserve the hover flip effect if intended, 
                // but since we have a flip effect on hover in CSS, 
                // adding 3D tilt might conflict if we are not careful.
                // The user requested "interactive cards styled like pages".
                // The CSS currently does a full 180 flip on hover.
                // We should probably NOT do a tilt on top of a full flip unless we are careful.

                // However, "Magic" feel often implies the tilt.
                // Let's apply the tilt to the CONTAINER or a wrapper, 
                // but the CSS flip happens on the inner.

                // Actually, combining a 180 flip with mouse tracking tilt is complex.
                // Let's sticking to the CSS flip for the main interaction as it reveals info.
                // But we can add a subtle tilt to the WHOLE card before it flips?
                // Or we can tilt the card container slightly.

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });
    });

    // --- Intersection Observer for Fade-In Animations ---
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply to sections and cards
    document.querySelectorAll('.section-title, .about-text, .project-card, .achievement-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        observer.observe(el);
    });
    // --- Certificate Lightbox ---
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-img");
    const closeBtn = document.getElementsByClassName("close-modal")[0];

    document.querySelectorAll('.cert-preview img').forEach(img => {
        img.addEventListener('click', function () {
            modal.style.display = "block";
            modalImg.src = this.src;
        });
    });

    // Close on X
    if (closeBtn) {
        closeBtn.onclick = function () {
            modal.style.display = "none";
        }
    }

    // Close on click outside
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
    // --- Hero Blue Mode Hover (Robust JS Fallback) ---
    const heroName = document.querySelector('.hero-content h1');
    if (heroName) {
        heroName.addEventListener('mouseenter', () => {
            document.body.classList.add('blue-mode');
        });
        heroName.addEventListener('mouseleave', () => {
            document.body.classList.remove('blue-mode');
        });
    }
});
