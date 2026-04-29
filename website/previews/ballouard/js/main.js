// ========================================
// Ballouard — Cinematic Atelier
// Multi-Dimensional Interaction
// ========================================

gsap.registerPlugin(ScrollTrigger);

// ========================================
// Configuration
// ========================================

const CONFIG = {
    viscosity: 0.04,
    easeExpo: 'power4.inOut',
    easeHeavy: 'power3.inOut'
};

// ========================================
// Lenis Smooth Scroll
// ========================================

const lenis = new Lenis({
    lerp: CONFIG.viscosity,
    duration: 1.5,
    smooth: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// ========================================
// Global Breathing State (rAF)
// ========================================

const breathingElements = document.querySelectorAll('.section-breath');
let breathTime = 0;

function updateBreathing() {
    breathTime += 0.005;
    const scale = 1 + Math.sin(breathTime) * 0.005;
    
    breathingElements.forEach(el => {
        gsap.set(el, { scale: scale });
    });
    
    requestAnimationFrame(updateBreathing);
}

// ========================================
// Custom Abstract Cursor
// ========================================

const cursorRing = document.querySelector('.cursor__ring');
let mouseX = 0, mouseY = 0;
let cursorPosX = 0, cursorPosY = 0;
let velocity = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function updateCursor() {
    if (!cursorRing) {
        requestAnimationFrame(updateCursor);
        return;
    }
    
    const dx = mouseX - cursorPosX;
    const dy = mouseY - cursorPosY;
    
    cursorPosX += dx * 0.15;
    cursorPosY += dy * 0.15;
    
    velocity = Math.sqrt(dx * dx + dy * dy);
    
    // Morph ring based on velocity
    const morph = 50 + Math.min(velocity * 0.5, 50);
    const scaleX = 1 + velocity * 0.01;
    const scaleY = 1 - velocity * 0.005;
    
    gsap.set(cursorRing, {
        x: cursorPosX,
        y: cursorPosY,
        borderRadius: `${morph}%`,
        scaleX: scaleX,
        scaleY: scaleY,
        rotation: Math.atan2(dy, dx) * (180 / Math.PI)
    });
    
    requestAnimationFrame(updateCursor);
}

// ========================================
// Section 0: Fly-Through Loader (The Portal Breach)
// ========================================

function initLoader() {
    const loader = document.getElementById('loader');
    const monogramPaths = document.querySelectorAll('.monogram__stroke');
    const heroSection = document.querySelector('.section--hero');
    
    // Set initial states
    // Loader z-index: 9999
    gsap.set(loader, { zIndex: 9999 });
    
    // Hero initial state: scale 0.8, blur 10px, opacity 0
    gsap.set(heroSection, { 
        scale: 0.8, 
        filter: 'blur(10px)', 
        opacity: 0,
        zIndex: 1
    });
    
    // SVG paths already have stroke-dasharray and stroke-dashoffset set in HTML
    // No need to recalculate - use the values from HTML

    const tl = gsap.timeline({
        onComplete: () => {
            // Cleanup: remove overflow hidden on body
            gsap.set('body', { overflow: 'auto' });
            
            // Set pointer-events none and display none on loader
            gsap.set(loader, { 
                pointerEvents: 'none',
                display: 'none'
            });
            
            initScrollAnimations();
            updateBreathing();
            updateCursor();
        }
    });

    // PHASE 1: The Draw Animation (1.8s, power4.inOut)
    tl.to('.monogram__l', {
        strokeDashoffset: 0,
        duration: 1.8,
        ease: 'power4.inOut'
    })
    .to('.monogram__b-vertical', {
        strokeDashoffset: 0,
        duration: 1.8,
        ease: 'power4.inOut'
    }, '-=1.5')
    .to('.monogram__b-top', {
        strokeDashoffset: 0,
        duration: 1.8,
        ease: 'power4.inOut'
    }, '-=1.4')
    .to('.monogram__b-bottom', {
        strokeDashoffset: 0,
        duration: 1.8,
        ease: 'power4.inOut'
    }, '-=1.3')
    
    // PHASE 2: The Fly-Through Mechanic (Super-Expo)
    .to('.loader__inner', {
        scale: 50,
        opacity: 0,
        z: 1000,
        duration: 1.5,
        ease: 'expo.in'
    })
    
    // PHASE 3: Hero Section Reveal (Sync with fly-through)
    .to(heroSection, {
        scale: 1,
        filter: 'blur(0px)',
        opacity: 1,
        duration: 1.5,
        ease: 'power2.out'
    }, '-=1.2')
    
    // PHASE 4: Loader fade out
    .to(loader, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
    }, '-=0.3');
}

// ========================================
// Philosophy Character Reveal Logic
// ========================================

function splitPhilosophyText() {
    const textEl = document.getElementById('reveal-text');
    const content = textEl.innerText;
    textEl.innerHTML = '';
    
    content.split('').forEach(char => {
        const span = document.createElement('span');
        span.className = 'char';
        span.innerText = char === ' ' ? '\u00A0' : char;
        textEl.appendChild(span);
    });
}

// ========================================
// Scroll Animations Orchestration
// ========================================

function initScrollAnimations() {
    
    // S1 -> S2: The V-Split
    const heroTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.section--hero',
            start: 'top top',
            end: '+=100%',
            scrub: true,
            pin: true
        }
    });

    heroTl.to('.hero__right', {
        rotation: 45,
        scale: 1.5,
        opacity: 0,
        x: '50%',
        ease: 'none'
    }, 0)
    .to('.hero__left', {
        x: '-30%',
        opacity: 0,
        ease: 'none'
    }, 0)
    .from('.section--philosophy', {
        z: -500,
        opacity: 0,
        scale: 0.8,
        ease: 'none'
    }, 0);

    // Philosophy Character Reveal
    const philosophyText = document.querySelector('.philosophy__text');
    if (philosophyText) {
        const lines = philosophyText.querySelectorAll('.philosophy__line');
        lines.forEach((line, lineIndex) => {
            const chars = line.textContent.split('');
            line.innerHTML = '';
            chars.forEach((char, charIndex) => {
                const span = document.createElement('span');
                span.className = 'philosophy__char';
                span.textContent = char === ' ' ? '\u00A0' : char;
                line.appendChild(span);
            });
        });

        const allChars = document.querySelectorAll('.philosophy__char');
        gsap.to(allChars, {
            scrollTrigger: {
                trigger: '.section--philosophy',
                start: 'top 40%',
                end: 'bottom 60%',
                scrub: 0.5
            },
            opacity: 1,
            stagger: 0.02,
            ease: 'power1.inOut'
        });
    }

    // Craft Heartbeat Animation with Scroll Pin
    const craftTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.section--craft',
            start: 'top top',
            end: '+=150%',
            scrub: true,
            pin: true
        }
    });

    const heartbeatCircle = document.querySelector('.craft__heartbeat-circle');
    if (heartbeatCircle) {
        craftTl.from(heartbeatCircle, {
            scale: 0.5,
            opacity: 0,
            ease: 'power2.out'
        }, 0)
        .to(heartbeatCircle, {
            scale: 1.2,
            duration: 0.3,
            ease: 'power1.inOut'
        }, 0.2)
        .to(heartbeatCircle, {
            scale: 1,
            duration: 0.3,
            ease: 'power1.inOut'
        }, 0.5)
        .to(heartbeatCircle, {
            scale: 1.15,
            duration: 0.3,
            ease: 'power1.inOut'
        }, 0.8)
        .to(heartbeatCircle, {
            scale: 1,
            duration: 0.3,
            ease: 'power1.inOut'
        }, 1.1);
    }

    // Legacy Text Dissolve
    const legacyText = document.querySelector('.legacy__text');
    if (legacyText) {
        gsap.fromTo(legacyText,
            { opacity: 0, filter: 'blur(10px)', y: 50 },
            {
                opacity: 1,
                filter: 'blur(0px)',
                y: 0,
                scrollTrigger: {
                    trigger: '.section--legacy',
                    start: 'top 40%',
                    end: 'bottom 60%',
                    scrub: true
                }
            }
        );
    }
}

// ========================================
// Legacy Section Shader (Removed - Using CSS Gradient)
// ========================================

function initLegacyShader() {
    // No longer needed - using CSS gradient animation
}

// Kickoff
window.addEventListener('DOMContentLoaded', initLoader);
