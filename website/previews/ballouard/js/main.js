// ========================================
// Ballouard — Cinematic Atelier
// The Minimalist Purge
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

// Sync Lenis with ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

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
// Section 0: Fly-Through Loader (DrawSVG + Portal)
// ========================================

function initLoader() {
    const loader = document.getElementById('loader');
    const monogramPaths = document.querySelectorAll('.monogram__stroke');
    const heroSection = document.querySelector('.section--hero');

    // Hero initial state
    gsap.set(heroSection, {
        scale: 0.8,
        filter: 'blur(10px)',
        opacity: 0,
        zIndex: 1
    });

    // Calculate path lengths for DrawSVG (1.5s)
    monogramPaths.forEach(path => {
        const length = path.getTotalLength();
        gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length
        });
    });

    const tl = gsap.timeline({
        onComplete: () => {
            gsap.set('body', { overflow: 'auto' });
            gsap.set(loader, {
                pointerEvents: 'none',
                display: 'none'
            });
            initScrollAnimations();
            updateCursor();
        }
    });

    // PHASE 1: DrawSVG Animation (1.5s)
    tl.to('.monogram__l', {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: 'power4.inOut'
    })
    .to('.monogram__b-vertical', {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: 'power4.inOut'
    }, '-=1.2')
    .to('.monogram__b-top', {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: 'power4.inOut'
    }, '-=1.1')
    .to('.monogram__b-bottom', {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: 'power4.inOut'
    }, '-=1.0')

    // PHASE 2: Fly-Through — scale to 50x and fade
    .to('.loader__inner', {
        scale: 50,
        opacity: 0,
        duration: 1.2,
        ease: 'expo.in'
    })

    // PHASE 3: Hero Section Reveal
    .to(heroSection, {
        scale: 1,
        filter: 'blur(0px)',
        opacity: 1,
        duration: 1.5,
        ease: 'power2.out'
    }, '-=0.8')

    // PHASE 4: Loader fade out
    .to(loader, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
    }, '-=0.5');
}

// ========================================
// Philosophy Character Reveal Logic
// ========================================

function splitPhilosophyText() {
    const textEl = document.getElementById('reveal-text');
    if (!textEl) return;
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
// Heartbeat Canvas Animation
// ========================================

function initHeartbeat() {
    const canvas = document.querySelector('.craft__heartbeat-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const size = 300;
    canvas.width = size * 2;
    canvas.height = size * 2;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(2, 2);

    const cx = size / 2;
    const cy = size / 2;
    const baseRadius = 80;
    let heartbeatPhase = 0;
    let isAnimating = true;

    function drawFrame() {
        if (!isAnimating) return;

        ctx.clearRect(0, 0, size, size);

        // Heartbeat cycle: double-beat pattern
        heartbeatPhase = (heartbeatPhase + 0.012) % 1;
        let beatScale = 1;

        if (heartbeatPhase < 0.1) {
            beatScale = 1 + 0.15 * Math.sin(heartbeatPhase / 0.1 * Math.PI);
        } else if (heartbeatPhase > 0.15 && heartbeatPhase < 0.25) {
            beatScale = 1 + 0.08 * Math.sin((heartbeatPhase - 0.15) / 0.1 * Math.PI);
        }

        const radius = baseRadius * beatScale;

        // Outer ring — matte silver
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 20, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(192, 192, 192, 0.15)';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Main circle — matte silver geometric
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(192, 192, 192, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner glow
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, 'rgba(192, 192, 192, 0.08)');
        grad.addColorStop(0.7, 'rgba(192, 192, 192, 0.03)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fill();

        // Inner ring
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(192, 192, 192, 0.2)';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(192, 192, 192, 0.5)';
        ctx.fill();

        requestAnimationFrame(drawFrame);
    }

    drawFrame();
    return () => { isAnimating = false; };
}

// ========================================
// Legacy Gradient Dissolve
// ========================================

function initLegacyGradient() {
    const gradient = document.querySelector('.legacy__gradient');
    if (!gradient) return;

    const pastelColors = [
        ['#2a1f3d', '#1a2a3a', '#2d2a3e'],
        ['#1f2d3d', '#2a1f2e', '#1e2a35'],
        ['#2d2a2e', '#1a2d3a', '#2a1f35'],
        ['#1e2a3d', '#2d1f2e', '#1f2a35'],
    ];

    let time = 0;

    function updateGradient() {
        time += 0.003;
        const i = Math.floor(time) % pastelColors.length;
        const colors = pastelColors[i];

        gradient.style.background = `
            linear-gradient(${120 + Math.sin(time) * 30}deg,
                ${colors[0]} 0%,
                ${colors[1]} 50%,
                ${colors[2]} 100%)
        `;

        requestAnimationFrame(updateGradient);
    }

    updateGradient();
}

// ========================================
// Scroll Animations Orchestration
// ========================================

function initScrollAnimations() {

    // S1 -> S2: The V-Split
    // Hero image rotates 45deg right and scales out, text moves left
    const heroTl = gsap.timeline({
        scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: '+=100%',
            scrub: true,
            pin: true
        }
    });

    heroTl.to('.hero__watch', {
        rotation: 45,
        scale: 1.5,
        opacity: 0,
        ease: 'none'
    }, 0)
    .to('.hero__text', {
        x: '-100%',
        opacity: 0,
        ease: 'none'
    }, 0)
    .from('#philosophy', {
        scale: 0.8,
        opacity: 0,
        ease: 'none'
    }, 0);

    // Philosophy Character-by-Character Reveal
    splitPhilosophyText();
    gsap.to('.char', {
        scrollTrigger: {
            trigger: '#philosophy',
            start: 'top 40%',
            end: 'bottom 60%',
            scrub: 0.5
        },
        opacity: 1,
        stagger: 0.05,
        ease: 'power1.inOut'
    });

    // Craft Section — Pin until heartbeat completes
    const craftTl = gsap.timeline({
        scrollTrigger: {
            trigger: '#craft',
            start: 'top top',
            end: '+=200%',
            scrub: true,
            pin: true
        }
    });

    craftTl.from('.craft__heartbeat-container', {
        scale: 0.5,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out'
    }, 0)
    .from('.craft__text', {
        y: 60,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out'
    }, 0.2)
    .to('.craft__heartbeat-container', {
        scale: 1.2,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in'
    }, 0.7)
    .to('.craft__text', {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in'
    }, 0.8);

    // Legacy Fragment Dissolve — scroll-based
    const fragments = document.querySelectorAll('.legacy__fragment');
    fragments.forEach((fragment, i) => {
        gsap.fromTo(fragment,
            { opacity: 0, filter: 'blur(8px)' },
            {
                opacity: 1,
                filter: 'blur(0px)',
                scrollTrigger: {
                    trigger: fragment,
                    start: 'top 80%',
                    end: 'top 40%',
                    scrub: true
                },
                onUpdate: function() {
                    const progress = this.progress();
                    if (progress > 0.7) {
                        gsap.set(fragment, {
                            opacity: Math.max(0, 1 - (progress - 0.7) / 0.3),
                            filter: `blur(${(progress - 0.7) / 0.3 * 8}px)`
                        });
                    }
                }
            }
        );
    });

    // Initialize sub-systems
    initHeartbeat();
    initLegacyGradient();
}

// ========================================
// Kickoff
// ========================================

window.addEventListener('DOMContentLoaded', initLoader);
