// ========================================
// Ballouard — Delusional Atelier
// Heavy, Mechanical, Intentional
// ========================================

gsap.registerPlugin(ScrollTrigger);

// ========================================
// Lenis Smooth Scroll — High Viscosity
// ========================================

const lenis = new Lenis({
    lerp: 0.03,
    duration: 1.8,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// ========================================
// Custom Cursor — Absolute Persistence
// ========================================

const cursor = document.querySelector('.cursor');
const cursorRing = document.querySelector('.cursor__ring');
const cursorDot = document.querySelector('.cursor__dot');

let cursorX = 0;
let cursorY = 0;
let ringX = 0;
let ringY = 0;
const LERP_FACTOR = 0.15;

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

// ========================================
// Modal Functionality — Shatter Exit
// ========================================

const modal = document.getElementById('prototype-modal');
const progressBar = document.querySelector('.modal__progress-bar');
const modalClose = document.querySelector('[data-modal-close]');
let progressAnimation = null;

function openModal() {
    if (!modal) return;
    modal.classList.add('is-active');
    lenis.stop();
    startModalTimer();
}

function closeModal() {
    if (!modal) return;
    
    const tl = gsap.timeline({
        onComplete: () => {
            modal.classList.remove('is-active');
            lenis.start();
        }
    });

    tl.to('.modal__content', {
        scale: 1.5,
        opacity: 0,
        filter: 'blur(30px)',
        duration: 1.5,
        ease: 'power4.in'
    })
    .to('.modal__backdrop', {
        opacity: 0,
        duration: 1
    }, '-=0.5');
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
}

if (modalClose) {
    modalClose.addEventListener('click', () => {
        if (progressAnimation) progressAnimation.kill();
        closeModal();
    });
}

// ========================================
// Loading Sequence — Fine-Line Engraving
// ========================================

const loader = document.getElementById('loader');
const loadingTimeline = gsap.timeline({
    onComplete: () => {
        if (loader) {
            gsap.to(loader, {
                opacity: 0,
                duration: 1.5,
                ease: 'power4.inOut',
                onComplete: () => {
                    loader.style.display = 'none';
                    initScrollAnimations();
                    openModal();
                }
            });
        }
    }
});

// Calculate path lengths for surgical drawing
const strokes = document.querySelectorAll('.monogram__stroke');
strokes.forEach(path => {
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
});

loadingTimeline
    .to('.monogram__stroke', {
        strokeDashoffset: 0,
        duration: 3.5,
        ease: 'power2.inOut',
        stagger: 0.8
    })
    .to('.loader__text', {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: 'power3.out'
    }, '-=1.5');

// ========================================
// Multi-Dimensional Scroll Transitions
// ========================================

function initScrollAnimations() {
    
    // Journey I: S1 to S2 (Z-Axis Walkthrough)
    const journey1 = gsap.timeline({
        scrollTrigger: {
            trigger: '#atelier',
            start: 'top top',
            end: '+=100%',
            scrub: true,
            pin: true,
            anticipatePin: 1
        }
    });

    journey1.to('.hero-title', {
        scale: 0.5,
        opacity: 0,
        filter: 'blur(20px)',
        duration: 1
    })
    .to('.hero__background', {
        scale: 2,
        opacity: 0,
        duration: 1
    }, 0)
    .from('#philosophy', {
        scale: 0.5,
        opacity: 0,
        duration: 1
    }, 0);

    // Journey II: S2 to S3 (360-Degree Viewport Rotation)
    const journey2 = gsap.timeline({
        scrollTrigger: {
            trigger: '#philosophy',
            start: 'top top',
            end: '+=100%',
            scrub: true,
            pin: true,
            anticipatePin: 1
        }
    });

    journey2.to('.rotation-wrapper', {
        rotation: 360,
        scale: 0.7,
        duration: 1,
        ease: 'power2.inOut'
    })
    .to('.rotation-wrapper', {
        scale: 1,
        duration: 0.5
    });

    // Journey III: S3 Horizontal Excursion
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

    // Journey IV: S4 Floating Void
    gsap.to('.watch-floating', {
        scrollTrigger: {
            trigger: '#mastery',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
        },
        rotation: 720,
        scale: 1.2,
        y: -100,
        ease: 'none'
    });

    // Journey V: S5 Distant Memory
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

    // Footer Watermark (Fixing 'LOCI')
    const watermarkSpans = document.querySelectorAll('.footer__watermark span');
    gsap.from(watermarkSpans, {
        scrollTrigger: {
            trigger: '.footer',
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: true
        },
        y: 100,
        opacity: 0,
        stagger: 0.05
    });
}
