// ═══════════════════════════════════════
// MACIEJ MIŚNIK — SCROLL ENGINE
// GSAP + Lenis Parallax
// ═══════════════════════════════════════

(() => {
    'use strict';

    gsap.registerPlugin(ScrollTrigger);

    // ─── INIT LENIS (SMOOTH SCROLL) ───
    const lenis = new Lenis({
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        mouseMultiplier: 1.2,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // ─── PARALLAX IMAGES ───
    const parallaxImages = document.querySelectorAll('.parallax-img');
    parallaxImages.forEach(img => {
        // We move the image inside its wrapper based on scroll
        gsap.to(img, {
            yPercent: 20, // Moves down as you scroll past
            ease: "none",
            scrollTrigger: {
                trigger: img.parentElement,
                start: "top bottom", // when top of wrapper hits bottom of screen
                end: "bottom top",   // when bottom of wrapper hits top of screen
                scrub: true
            }
        });
    });

    // ─── SCROLL SPEED ELEMENTS ───
    const speedElements = document.querySelectorAll('[data-speed]');
    speedElements.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-speed'));
        // 1.0 is normal speed. >1 is faster, <1 is slower.
        const yMovement = (1 - speed) * 200; // Calculate movement range

        gsap.to(el, {
            y: yMovement,
            ease: "none",
            scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });

    // ─── CURSOR ENGINE ───
    const cursorDot  = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    const isTouch = !window.matchMedia('(hover: hover)').matches;

    let tX = window.innerWidth / 2, tY = window.innerHeight / 2;
    let cX = tX, cY = tY, rX = tX, rY = tY;

    if (!isTouch && cursorDot && cursorRing) {
        document.addEventListener('mousemove', (e) => { tX = e.clientX; tY = e.clientY; });

        (function tick() {
            cX += (tX - cX) * 0.25; cY += (tY - cY) * 0.25;
            cursorDot.style.transform = `translate(${cX}px, ${cY}px) translate(-50%, -50%)`;
            
            rX += (tX - rX) * 0.15; rY += (tY - rY) * 0.15;
            cursorRing.style.transform = `translate(${rX}px, ${rY}px) translate(-50%, -50%)`;

            requestAnimationFrame(tick);
        })();

        // Hover states
        document.querySelectorAll('a, .hero-image-wrapper, .image-mask, .showcase-image, .seaman-image').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorRing.style.width = '80px';
                cursorRing.style.height = '80px';
                cursorRing.style.backgroundColor = 'rgba(194, 157, 109, 0.1)';
            });
            el.addEventListener('mouseleave', () => {
                cursorRing.style.width = '40px';
                cursorRing.style.height = '40px';
                cursorRing.style.backgroundColor = 'transparent';
            });
        });
    }

})();
