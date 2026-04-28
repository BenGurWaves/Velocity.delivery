// ========================================
// Ballouard — GSAP Animation Architecture
// Heavy, Mechanical, Precise
// ========================================

gsap.registerPlugin(ScrollTrigger);

// ========================================
// Configuration
// ========================================

const EASE_LUXURY = 'power4.inOut';
const EASE_HEAVY = 'power3.inOut';
const DURATION_SLOW = 2;
const DURATION_MEDIUM = 1.5;
const DURATION_MICRO = 0.8;
const STAGGER_DELAY = 0.08;

// ========================================
// Lenis Smooth Scroll — High Inertia
// ========================================

const lenis = new Lenis({
    lerp: 0.05, // High inertia for luxury feel
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// ========================================
// Custom Cursor
// ========================================

const cursor = document.querySelector('.cursor');
const cursorRing = document.querySelector('.cursor__ring');
const cursorDot = document.querySelector('.cursor__dot');

let cursorX = 0;
let cursorY = 0;
let ringX = 0;
let ringY = 0;
const LERP_FACTOR = 0.15;

if (cursor && !window.matchMedia('(pointer: coarse)').matches) {
    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
    });
    
    function updateCursor() {
        ringX += (cursorX - ringX) * LERP_FACTOR;
        ringY += (cursorY - ringY) * LERP_FACTOR;
        
        if (cursorDot) cursorDot.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
        if (cursorRing) cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
        
        requestAnimationFrame(updateCursor);
    }
    
    updateCursor();
    
    const interactiveElements = document.querySelectorAll('a, button, .nav__trigger');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
    });
}

// ========================================
// Modal Functionality — 5 Second Auto-Close
// ========================================

const modal = document.getElementById('prototype-modal');
const progressBar = document.querySelector('.modal__progress-bar');
const modalClose = document.querySelector('[data-modal-close]');
let modalTimer = null;
let progressAnimation = null;

function openModal() {
    if (!modal) return;
    modal.classList.add('is-active');
    lenis.stop();
    startModalTimer();
}

function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-active');
    lenis.start();
    if (modalTimer) {
        clearTimeout(modalTimer);
        modalTimer = null;
    }
    if (progressAnimation) {
        progressAnimation.kill();
        progressAnimation = null;
    }
}

function startModalTimer() {
    if (progressBar) {
        gsap.set(progressBar, { scaleX: 1 });
        progressAnimation = gsap.to(progressBar, {
            scaleX: 0,
            duration: 5,
            ease: 'none',
            onComplete: closeModal
        });
    }
    
    modalTimer = setTimeout(() => {
        closeModal();
    }, 5000);
}

if (modalClose) {
    modalClose.addEventListener('click', closeModal);
}

// ========================================
// Loading Sequence
// ========================================

const loader = document.getElementById('loader');
const loadingTimeline = gsap.timeline({
    onComplete: () => {
        if (loader) {
            gsap.to(loader, {
                opacity: 0,
                duration: 1,
                onComplete: () => {
                    loader.style.display = 'none';
                    initScrollAnimations();
                    openModal();
                }
            });
        } else {
            initScrollAnimations();
            openModal();
        }
    }
});

if (document.querySelector('.monogram__stroke')) {
    loadingTimeline
        .to('.monogram__stroke', {
            strokeDashoffset: 0,
            duration: 2,
            stagger: 0.3,
            ease: 'power2.inOut'
        })
        .to('.loader__text', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out'
        }, '-=1');
} else {
    loadingTimeline.to({}, { duration: 0.1 });
}

// ========================================
// Scroll Animations
// ========================================

function initScrollAnimations() {
    
    // Section 1: Hero Parallax
    if (document.querySelector('.hero__background')) {
        gsap.to('.hero__background', {
            scrollTrigger: {
                trigger: '#atelier',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            },
            y: '20%',
            scale: 1.1
        });
    }

    // Section 2: Z-Axis Zoom
    if (document.querySelector('.zoom-artifact')) {
        gsap.to('.zoom-artifact', {
            scrollTrigger: {
                trigger: '#philosophy',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            },
            scale: 4,
            ease: 'none'
        });
    }

    // Section 3: Horizontal Strip
    const horizontalSection = document.querySelector('.section--horizontal');
    const horizontalStrip = document.querySelector('.horizontal-strip');
    
    if (horizontalSection && horizontalStrip) {
        gsap.to(horizontalStrip, {
            x: () => -(horizontalStrip.scrollWidth - window.innerWidth),
            ease: 'none',
            scrollTrigger: {
                trigger: horizontalSection,
                start: 'top top',
                end: () => `+=${horizontalStrip.scrollWidth}`,
                scrub: true,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true
            }
        });
    }

    // Section 4: Floating Watch
    if (document.querySelector('.watch-floating')) {
        gsap.to('.watch-floating', {
            scrollTrigger: {
                trigger: '#mastery',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            },
            rotation: 360,
            y: -100,
            ease: 'none'
        });
    }

    // Section 5: Last Section Fade
    if (document.querySelector('.last-content')) {
        gsap.from('.last-content', {
            scrollTrigger: {
                trigger: '#contact',
                start: 'top 80%',
                end: 'top 20%',
                scrub: true
            },
            opacity: 0,
            y: 100
        });
    }

    // Footer Watermark Parallax
    if (document.querySelector('.footer__watermark')) {
        gsap.from('.footer__watermark', {
            scrollTrigger: {
                trigger: '.footer',
                start: 'top bottom',
                end: 'bottom bottom',
                scrub: true
            },
            y: '20%',
            opacity: 0
        });
    }
}
