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

// Scroll velocity clamping
const MAX_SCROLL_IMPACT = 0.15;
const SCROLL_SMOOTHING = 0.1;

// ========================================
// Lenis Smooth Scroll
// ========================================

const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// ========================================
// Custom Cursor — Lerp-based weighted movement
// ========================================

const cursor = document.querySelector('.cursor');
const cursorRing = document.querySelector('.cursor__ring');
const cursorDot = document.querySelector('.cursor__dot');

let cursorX = 0;
let cursorY = 0;
let ringX = 0;
let ringY = 0;
const LERP_FACTOR = 0.1;

if (cursor && !window.matchMedia('(pointer: coarse)').matches) {
    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
    });
    
    function updateCursor() {
        // Lerp interpolation for weighted, graceful lag
        ringX += (cursorX - ringX) * LERP_FACTOR;
        ringY += (cursorY - ringY) * LERP_FACTOR;
        
        cursorDot.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
        cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
        
        requestAnimationFrame(updateCursor);
    }
    
    updateCursor();
    
    // Hover states for interactive elements — silver ring expansion
    const interactiveElements = document.querySelectorAll('a, button, .masonry__item, .nav__link, .scroll-reel');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('is-hovering');
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('is-hovering');
        });
    });
}

// ========================================
// Cursor Parallax Effects
// ========================================

let mouseX = 0;
let mouseY = 0;
let currentX = 0;
let currentY = 0;

if (!window.matchMedia('(pointer: coarse)').matches) {
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    
    function updateCursorParallax() {
        currentX += (mouseX - currentX) * 0.05;
        currentY += (mouseY - currentY) * 0.05;
        
        document.querySelectorAll('[data-cursor-parallax]').forEach(el => {
            const intensity = parseFloat(el.dataset.cursorParallax) || 0.03;
            gsap.set(el, {
                x: currentX * 100 * intensity,
                y: currentY * 100 * intensity
            });
        });
        
        requestAnimationFrame(updateCursorParallax);
    }
    
    updateCursorParallax();
}

// ========================================
// Modal Functionality — 5 Second Auto-Close
// ========================================

const modal = document.getElementById('prototype-modal');
const modalCloseBtns = document.querySelectorAll('[data-modal-close], .modal__close');
const modalTriggers = document.querySelectorAll('[data-modal="prototype"]');
const progressBar = document.querySelector('.modal__progress-bar');
let modalTimer = null;
let progressAnimation = null;

function openModal() {
    modal.classList.add('is-active');
    lenis.stop();
}

function closeModal() {
    modal.classList.remove('is-active');
    lenis.start();
    // Clear any existing timer
    if (modalTimer) {
        clearTimeout(modalTimer);
        modalTimer = null;
    }
    // Kill progress animation
    if (progressAnimation) {
        progressAnimation.kill();
        progressAnimation = null;
    }
    // Reset progress bar
    if (progressBar) {
        gsap.set(progressBar, { scaleX: 1 });
    }
}

function startModalTimer() {
    // Reset and animate progress bar
    if (progressBar) {
        gsap.set(progressBar, { scaleX: 1 });
        progressAnimation = gsap.to(progressBar, {
            scaleX: 0,
            duration: 5,
            ease: 'linear'
        });
    }
    
    // Auto-close after 5 seconds
    modalTimer = setTimeout(() => {
        closeModal();
    }, 5000);
}

modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
        startModalTimer();
    });
});

modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', closeModal);
});

modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('modal__backdrop')) {
        closeModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-active')) {
        closeModal();
    }
});

// ========================================
// Loading Sequence — LB Monogram DrawSVG
// ========================================

const loadingTimeline = gsap.timeline({
    onComplete: () => {
        document.getElementById('loader').style.pointerEvents = 'none';
        initScrollAnimations();
        // Show preview modal after loader
        setTimeout(() => {
            openModal();
            startModalTimer();
        }, 500);
    }
});

// LB Monogram DrawSVG Animation — L coils first, then B follows with 0.1s stagger
loadingTimeline
    // Set initial state for strokes
    .set('.monogram__stroke', { 
        opacity: 1,
        strokeDasharray: 400,
        strokeDashoffset: 400 
    })
    // L letter coiling effect
    .to('.monogram__l', {
        strokeDashoffset: 0,
        duration: 1.8,
        ease: 'power2.inOut'
    })
    // B follows with 0.1s stagger from L's start
    .to('.monogram__b', {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: 'power2.inOut'
    }, '>-1.7') // Starts 0.1s after L starts (1.8 - 0.1 = 1.7)
    // Brief pause to establish presence
    .to({}, { duration: 0.8 })
    // Loading line appears
    .to('.loader__line', {
        opacity: 1,
        scaleY: 1,
        transformOrigin: 'top',
        duration: DURATION_MEDIUM,
        ease: EASE_LUXURY
    }, '-=0.4')
    // Pause before exit
    .to({}, { duration: 0.4 })
    // Exit sequence — line retracts
    .to('.loader__line', {
        scaleY: 0,
        transformOrigin: 'bottom',
        duration: DURATION_MICRO,
        ease: EASE_LUXURY
    })
    // Monogram fades out
    .to('.loader__monogram', {
        opacity: 0,
        scale: 1.1,
        duration: DURATION_MEDIUM,
        ease: EASE_LUXURY
    }, '-=0.4')
    // Loader container fades
    .to('.loader', {
        opacity: 0,
        duration: DURATION_MEDIUM,
        ease: EASE_LUXURY
    }, '-=0.3');

// ========================================
// Navigation Interactions
// ========================================

const navTrigger = document.querySelector('.nav__trigger');
const nav = document.querySelector('.nav');

// Menu trigger now opens modal instead of nav panel
if (navTrigger && navTrigger.dataset.modal === 'prototype') {
    navTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });
} else {
    navTrigger.addEventListener('click', () => {
        nav.classList.toggle('is-open');
        
        const dot = nav.querySelector('.nav__indicator-dot');
        
        if (nav.classList.contains('is-open')) {
            gsap.to(dot, {
                scale: 1.5,
                duration: DURATION_MICRO,
                ease: EASE_LUXURY
            });
            
            gsap.from('.nav__link', {
                x: 20,
                opacity: 0,
                duration: DURATION_MICRO,
                stagger: STAGGER_DELAY,
                ease: EASE_HEAVY
            });
        } else {
            gsap.to(dot, {
                scale: 1,
                duration: DURATION_MICRO,
                ease: EASE_LUXURY
            });
        }
    });
}

// Smooth scroll for nav links
document.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        
        lenis.scrollTo(target, {
            duration: 2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
        
        nav.classList.remove('is-open');
    });
});

// ========================================
// Scroll Animations
// ========================================

function initScrollAnimations() {
    
    // Progress indicator
    const sections = document.querySelectorAll('.section');
    const progressFill = document.querySelector('.progress__fill');
    const markers = document.querySelectorAll('.progress__marker');
    
    ScrollTrigger.create({
        trigger: '#smooth-content',
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
            // Update progress fill
            gsap.to(progressFill, {
                height: `${self.progress * 100}%`,
                duration: 0.3,
                ease: 'power2.out'
            });
            
            // Update section markers
            const currentSection = Math.floor(self.progress * sections.length);
            markers.forEach((marker, i) => {
                marker.classList.toggle('is-active', i === currentSection);
            });
        }
    });
    
    // ========================================
    // Section I: Manifesto Animations
    // ========================================
    
    const manifestoSection = document.querySelector('.section--manifesto');
    
    // Title reveal with word animation
    gsap.from('.section--manifesto .title__line', {
        scrollTrigger: {
            trigger: manifestoSection,
            start: 'top 70%',
            end: 'top 30%',
            scrub: 1
        },
        y: 100,
        opacity: 0,
        stagger: 0.1
    });
    
    // Lead text reveal
    gsap.from('.manifesto__text', {
        scrollTrigger: {
            trigger: manifestoSection,
            start: 'top 60%',
            end: 'top 20%',
            scrub: 1.5
        },
        y: 60,
        opacity: 0
    });
    
    // Button reveal
    gsap.from('.section--manifesto .btn', {
        scrollTrigger: {
            trigger: manifestoSection,
            start: 'top 50%',
            toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        duration: DURATION_MEDIUM,
        ease: EASE_LUXURY
    });
    
    // Corner glyph with subtle rotation tied to scroll
    gsap.to('.section--manifesto .glyph--rotation', {
        scrollTrigger: {
            trigger: manifestoSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2
        },
        rotation: 90,
        ease: 'none'
    });
    
    // Parallax on guilloche texture
    gsap.to('.section--manifesto .texture--guilloche', {
        scrollTrigger: {
            trigger: manifestoSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
        },
        x: -50,
        opacity: 0.3
    });
    
    // ========================================
    // Section II: Philosophy Animations
    // ========================================
    
    const philosophySection = document.querySelector('.section--philosophy');
    
    // Visual rings animation
    gsap.from('.visual__ring--outer', {
        scrollTrigger: {
            trigger: philosophySection,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
        },
        scale: 0.8,
        opacity: 0,
        duration: DURATION_SLOW,
        ease: EASE_LUXURY
    });
    
    gsap.from('.visual__ring--inner', {
        scrollTrigger: {
            trigger: philosophySection,
            start: 'top 65%',
            toggleActions: 'play none none reverse'
        },
        scale: 0.8,
        opacity: 0,
        duration: DURATION_SLOW,
        ease: EASE_LUXURY
    });
    
    gsap.from('.visual__glyph', {
        scrollTrigger: {
            trigger: philosophySection,
            start: 'top 60%',
            toggleActions: 'play none none reverse'
        },
        scale: 0.5,
        opacity: 0,
        duration: DURATION_MEDIUM,
        ease: EASE_LUXURY
    });
    
    // Title reveal
    gsap.from('.section--philosophy .title__line', {
        scrollTrigger: {
            trigger: philosophySection,
            start: 'top 60%',
            toggleActions: 'play none none reverse'
        },
        y: 80,
        opacity: 0,
        duration: DURATION_MEDIUM,
        stagger: STAGGER_DELAY,
        ease: EASE_LUXURY
    });
    
    // Body text fade
    gsap.from('.section--philosophy .text--body', {
        scrollTrigger: {
            trigger: philosophySection,
            start: 'top 50%',
            toggleActions: 'play none none reverse'
        },
        y: 40,
        opacity: 0,
        duration: DURATION_MEDIUM,
        stagger: STAGGER_DELAY,
        ease: EASE_HEAVY
    });
    
    // Button reveal
    gsap.from('.section--philosophy .btn', {
        scrollTrigger: {
            trigger: philosophySection,
            start: 'top 40%',
            toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        duration: DURATION_MICRO,
        ease: EASE_LUXURY
    });
    
    // ========================================
    // Section III: Collection Animations
    // ========================================
    
    const collectionSection = document.querySelector('.section--collection');
    
    // Title character stagger
    gsap.from('.section--collection .title__word', {
        scrollTrigger: {
            trigger: collectionSection,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
        },
        y: 80,
        opacity: 0,
        duration: DURATION_MEDIUM,
        stagger: STAGGER_DELAY * 2,
        ease: EASE_LUXURY
    });
    
    // Showcase artifact reveal
    gsap.from('.showcase__frame', {
        scrollTrigger: {
            trigger: collectionSection,
            start: 'top 60%',
            end: 'center center',
            scrub: 1
        },
        scale: 0.8,
        opacity: 0,
        rotation: -5
    });
    
    // Artifact hover layers
    gsap.to('.showcase__artifact', {
        scrollTrigger: {
            trigger: collectionSection,
            start: 'center center',
            end: 'bottom center',
            scrub: 1
        },
        y: -30
    });
    
    // Deep texture parallax
    gsap.to('.section--collection .texture--deep', {
        scrollTrigger: {
            trigger: collectionSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
        },
        y: -80,
        scale: 1.1
    });
    
    // ========================================
    // Section IV: Mastery Animations
    // ========================================
    
    const masterySection = document.querySelector('.section--mastery');
    
    // Architectural numbers reveal with scroll-reel animation
    gsap.from('.number__architectural', {
        scrollTrigger: {
            trigger: masterySection,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
        },
        y: 60,
        opacity: 0,
        duration: DURATION_MEDIUM,
        stagger: STAGGER_DELAY * 2,
        ease: EASE_LUXURY
    });

    // Scroll-reel counter animation
    const scrollReels = document.querySelectorAll('.scroll-reel');
    scrollReels.forEach(reel => {
        const target = parseInt(reel.dataset.target);
        const strips = reel.querySelectorAll('.scroll-reel__strip');
        const targetDigits = target.toString().split('').map(Number);
        
        strips.forEach((strip, index) => {
            const targetDigit = targetDigits[index] || 0;
            gsap.to(strip, {
                scrollTrigger: {
                    trigger: masterySection,
                    start: 'top 50%',
                    toggleActions: 'play none none reverse'
                },
                y: -targetDigit * 100,
                duration: 2,
                ease: 'power4.inOut'
            });
        });
    });
    
    // Title reveal
    gsap.from('.section--mastery .title__line', {
        scrollTrigger: {
            trigger: masterySection,
            start: 'top 60%',
            toggleActions: 'play none none reverse'
        },
        y: 80,
        opacity: 0,
        duration: DURATION_MEDIUM,
        stagger: STAGGER_DELAY,
        ease: EASE_LUXURY
    });
    
    // Body text fade
    gsap.from('.section--mastery .text--body', {
        scrollTrigger: {
            trigger: masterySection,
            start: 'top 50%',
            toggleActions: 'play none none reverse'
        },
        y: 40,
        opacity: 0,
        duration: DURATION_MEDIUM,
        stagger: STAGGER_DELAY,
        ease: EASE_HEAVY
    });
    
    // Timeline reveal
    gsap.from('.mastery__timeline', {
        scrollTrigger: {
            trigger: masterySection,
            start: 'top 40%',
            toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        duration: DURATION_MEDIUM,
        ease: EASE_LUXURY
    });
    
    // Button reveal
    gsap.from('.section--mastery .btn', {
        scrollTrigger: {
            trigger: masterySection,
            start: 'top 30%',
            toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        duration: DURATION_MICRO,
        ease: EASE_LUXURY
    });
    
    // ========================================
    // Section V: Archive Animations
    // ========================================
    
    const archiveSection = document.querySelector('.section--archive');
    
    // Header reveal
    gsap.from('.archive__header', {
        scrollTrigger: {
            trigger: archiveSection,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
        },
        x: -40,
        opacity: 0,
        duration: DURATION_MEDIUM,
        ease: EASE_LUXURY
    });
    
    // Title reveal
    gsap.from('.section--archive .title__line', {
        scrollTrigger: {
            trigger: archiveSection,
            start: 'top 65%',
            toggleActions: 'play none none reverse'
        },
        y: 60,
        opacity: 0,
        duration: DURATION_MEDIUM,
        stagger: STAGGER_DELAY,
        ease: EASE_LUXURY
    });
    
    // Masonry grid stagger
    gsap.from('.masonry__item', {
        scrollTrigger: {
            trigger: archiveSection,
            start: 'top 50%',
            toggleActions: 'play none none reverse'
        },
        y: 40,
        opacity: 0,
        duration: DURATION_MEDIUM,
        stagger: STAGGER_DELAY * 1.5,
        ease: EASE_LUXURY
    });
    
    // Archive button reveal
    gsap.from('.btn--archive', {
        scrollTrigger: {
            trigger: archiveSection,
            start: 'top 30%',
            toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        duration: DURATION_MICRO,
        ease: EASE_LUXURY
    });
    
    // ========================================
    // Section VI: Technical Animations
    // ========================================
    
    const technicalSection = document.querySelector('.section--technical');
    
    // Visuals grid reveal
    gsap.from('.tech__image', {
        scrollTrigger: {
            trigger: technicalSection,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
        },
        y: 60,
        opacity: 0,
        duration: DURATION_MEDIUM,
        stagger: STAGGER_DELAY,
        ease: EASE_LUXURY
    });
    
    // Title reveal
    gsap.from('.section--technical .title__line', {
        scrollTrigger: {
            trigger: technicalSection,
            start: 'top 60%',
            toggleActions: 'play none none reverse'
        },
        y: 60,
        opacity: 0,
        duration: DURATION_MEDIUM,
        stagger: STAGGER_DELAY,
        ease: EASE_LUXURY
    });
    
    // Specs reveal
    gsap.from('.spec__row', {
        scrollTrigger: {
            trigger: technicalSection,
            start: 'top 50%',
            toggleActions: 'play none none reverse'
        },
        x: 30,
        opacity: 0,
        duration: DURATION_MICRO,
        stagger: STAGGER_DELAY,
        ease: EASE_HEAVY
    });
    
    // Button reveal
    gsap.from('.section--technical .btn', {
        scrollTrigger: {
            trigger: technicalSection,
            start: 'top 40%',
            toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        duration: DURATION_MICRO,
        ease: EASE_LUXURY
    });
    
    // ========================================
    // Section VII: Contact Animations
    // ========================================
    
    const contactSection = document.querySelector('.section--contact');
    
    // Enclosure reveal
    gsap.from('.contact__enclosure', {
        scrollTrigger: {
            trigger: contactSection,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
        },
        scale: 0.95,
        opacity: 0,
        duration: DURATION_MEDIUM,
        ease: EASE_LUXURY
    });
    
    // Title word animation
    gsap.from('.title--contact', {
        scrollTrigger: {
            trigger: contactSection,
            start: 'top 60%',
            toggleActions: 'play none none reverse'
        },
        y: 50,
        opacity: 0,
        duration: DURATION_MEDIUM,
        ease: EASE_LUXURY
    });
    
    // Body content fade up
    gsap.from('.contact__body > *', {
        scrollTrigger: {
            trigger: contactSection,
            start: 'top 50%',
            toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        duration: DURATION_MICRO,
        stagger: STAGGER_DELAY,
        ease: EASE_HEAVY
    });
    
    // Seal rotation
    gsap.from('.seal__ring', {
        scrollTrigger: {
            trigger: contactSection,
            start: 'top 40%',
            toggleActions: 'play none none reverse'
        },
        rotation: -90,
        opacity: 0,
        duration: DURATION_MEDIUM,
        ease: EASE_LUXURY
    });
    
    // ========================================
    // Footer Animation
    // ========================================
    
    gsap.from('.footer__watermark', {
        scrollTrigger: {
            trigger: '.footer',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        scale: 0.9,
        opacity: 0,
        duration: DURATION_SLOW,
        ease: EASE_LUXURY
    });
    
    gsap.from('.footer__links', {
        scrollTrigger: {
            trigger: '.footer',
            start: 'top 60%',
            toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        duration: DURATION_MEDIUM,
        stagger: STAGGER_DELAY,
        ease: EASE_LUXURY
    });
    
    gsap.from('.footer__copyright', {
        scrollTrigger: {
            trigger: '.footer',
            start: 'top 50%',
            toggleActions: 'play none none reverse'
        },
        y: 20,
        opacity: 0,
        duration: DURATION_MEDIUM,
        ease: EASE_LUXURY
    });
}

// ========================================
// Edge Typography Scroll Response
// ========================================

gsap.to('.edge-text--left .edge-text__content', {
    scrollTrigger: {
        trigger: '#smooth-content',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 2
    },
    x: 100
});

gsap.to('.edge-text--right .edge-text__content', {
    scrollTrigger: {
        trigger: '#smooth-content',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 2
    },
    x: -100
});

// ========================================
// Navigation Hover States
// ========================================

document.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('mouseenter', () => {
        gsap.to(link, {
            letterSpacing: '0.08em',
            duration: DURATION_MICRO,
            ease: EASE_LUXURY
        });
    });
    
    link.addEventListener('mouseleave', () => {
        gsap.to(link, {
            letterSpacing: '0.05em',
            duration: DURATION_MICRO,
            ease: EASE_LUXURY
        });
    });
});

// ========================================
// Contact Link Hover
// ========================================

const contactLink = document.querySelector('.contact__link');
if (contactLink) {
    contactLink.addEventListener('mouseenter', () => {
        gsap.to('.link__glyph', {
            x: 8,
            duration: DURATION_MICRO,
            ease: EASE_LUXURY
        });
    });
    
    contactLink.addEventListener('mouseleave', () => {
        gsap.to('.link__glyph', {
            x: 0,
            duration: DURATION_MICRO,
            ease: EASE_LUXURY
        });
    });
}

// ========================================
// Image Loading State
// ========================================

function initImageLoading() {
    const imageWrappers = document.querySelectorAll('.image-wrapper');
    
    imageWrappers.forEach(wrapper => {
        const img = wrapper.querySelector('.image-wrapper__img');
        const placeholder = wrapper.querySelector('.image-wrapper__placeholder');
        
        if (img && placeholder) {
            if (img.complete) {
                img.classList.add('is-loaded');
                placeholder.classList.add('is-hidden');
            } else {
                img.addEventListener('load', () => {
                    img.classList.add('is-loaded');
                    placeholder.classList.add('is-hidden');
                });
            }
        }
    });
}

// Initialize image loading after page load
window.addEventListener('load', initImageLoading);

// ========================================
// Refresh ScrollTrigger on Resize
// ========================================

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
    }, 250);
});
