// ═══════════════════════════════════════
// MACIEJ MIŚNIK — ROOM GALLERY ENGINE
// Pure Typography · Liquid Parallax
// ═══════════════════════════════════════

(() => {
    'use strict';

    const rooms     = document.querySelectorAll('.room');
    const dots      = document.querySelectorAll('.room-dot');
    const counterEl = document.querySelector('.counter-current');

    let current = 0;
    let locked  = false;
    const COOLDOWN = 1400; // Slower, more deliberate transitions

    // ─── AMBIENT FLUID BACKGROUND ───
    const canvas = document.getElementById('fluid-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        });

        const particles = [];
        const numParticles = 40;

        function initParticles() {
            particles.length = 0;
            for(let i=0; i<numParticles; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    size: Math.random() * (width * 0.4) + (width * 0.2),
                    colorStart: [165, 124, 76, Math.random() * 0.01 + 0.005], // Bronze
                    colorEnd: [10, 30, 20, 0] // Fade to dark
                });
            }
        }
        initParticles();

        function drawFluid() {
            ctx.clearRect(0, 0, width, height);
            
            for(let p of particles) {
                p.x += p.vx;
                p.y += p.vy;

                // Bounce
                if (p.x < -p.size) p.vx *= -1;
                if (p.x > width + p.size) p.vx *= -1;
                if (p.y < -p.size) p.vy *= -1;
                if (p.y > height + p.size) p.vy *= -1;

                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                grad.addColorStop(0, `rgba(${p.colorStart[0]}, ${p.colorStart[1]}, ${p.colorStart[2]}, ${p.colorStart[3]})`);
                grad.addColorStop(1, `rgba(${p.colorEnd[0]}, ${p.colorEnd[1]}, ${p.colorEnd[2]}, ${p.colorEnd[3]})`);
                
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
            requestAnimationFrame(drawFluid);
        }
        drawFluid();
    }

    // ─── ROOM TRANSITIONS ───

    function goTo(index) {
        if (locked || index === current) return;
        if (index < 0 || index >= rooms.length) return;

        locked = true;
        const from = rooms[current];
        const to   = rooms[index];
        const dir  = index > current ? 1 : -1;

        const fromEls = from.querySelectorAll('[data-animate]');
        const toEls   = to.querySelectorAll('[data-animate]');

        // Cursor pulse during transition
        if (cursorRing) {
            gsap.to(cursorRing, { scale: 1.5, opacity: .2, duration: .4, ease: 'power2.out' });
            gsap.to(cursorRing, { scale: 1, opacity: 1, duration: .6, ease: 'power2.inOut', delay: .6 });
        }

        const tl = gsap.timeline({
            onComplete: () => {
                from.classList.remove('active');
                current = index;
                locked = false;
                updateNav();
            }
        });

        // Exit: Smooth float away
        tl.to(fromEls, {
            y: -25 * dir,
            opacity: 0,
            stagger: 0.04,
            duration: 0.6,
            ease: 'power2.inOut',
        });

        tl.to(from, {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.inOut',
        }, '-=0.2');

        // Enter: Smooth float in
        to.classList.add('active');
        tl.fromTo(to,
            { opacity: 0 },
            { opacity: 1, duration: 0.4, ease: 'power2.out' },
            '-=0.1'
        );

        tl.fromTo(toEls,
            { y: 35 * dir, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.06, duration: 0.8, ease: 'power3.out' },
            '-=0.2'
        );
    }

    function updateNav() {
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
        if (counterEl) counterEl.textContent = String(current + 1).padStart(2, '0');
        
        // Slightly shift background colors based on room
        if (particles && particles.length > 0) {
            const hueShifts = [0, 5, 10, -5, 0, 15, 0];
            const shift = hueShifts[current] || 0;
            const newR = 165 + shift;
            const newG = 124 - shift;
            
            particles.forEach(p => {
                gsap.to(p.colorStart, { 0: newR, 1: newG, duration: 1.5 });
            });
        }
    }

    // ─── INPUT: WHEEL (Debounced & Accumulating) ───

    let lastWheel = 0;
    let wheelAccum = 0;

    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        const now = Date.now();
        if (now - lastWheel < COOLDOWN || locked) return;

        wheelAccum += e.deltaY;
        if (Math.abs(wheelAccum) >= 40) {
            lastWheel = now;
            if (wheelAccum > 0) goTo(current + 1);
            else goTo(current - 1);
            wheelAccum = 0;
        }
    }, { passive: false });

    let wheelTimer;
    window.addEventListener('wheel', () => {
        clearTimeout(wheelTimer);
        wheelTimer = setTimeout(() => { wheelAccum = 0; }, 150);
    }, { passive: true });

    // ─── INPUT: KEYBOARD ───

    window.addEventListener('keydown', (e) => {
        if (['ArrowDown', ' ', 'PageDown'].includes(e.key)) { e.preventDefault(); goTo(current + 1); }
        if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); goTo(current - 1); }
    });

    // ─── INPUT: TOUCH ───

    let touchY = 0, touchTime = 0;

    window.addEventListener('touchstart', (e) => {
        touchY = e.touches[0].clientY;
        touchTime = Date.now();
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        const diff = touchY - e.changedTouches[0].clientY;
        const fast = Date.now() - touchTime < 250;
        if (Math.abs(diff) > (fast ? 30 : 50)) {
            if (diff > 0) goTo(current + 1);
            else goTo(current - 1);
        }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) e.preventDefault();
    }, { passive: false });

    // ─── NAV DOTS ───

    dots.forEach(dot => {
        dot.addEventListener('click', () => goTo(parseInt(dot.dataset.target)));
    });

    // ─── CURSOR & PARALLAX ENGINE ───

    const cursorDot  = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    const isTouch = !window.matchMedia('(hover: hover)').matches;

    // We store the target mouse position from the event
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    
    // We store the interpolated position
    let currentX = targetX;
    let currentY = targetY;
    
    // Ring interpolation
    let ringX = targetX;
    let ringY = targetY;

    if (!isTouch && cursorDot && cursorRing) {

        document.addEventListener('mousemove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
        });

        // The tick loop handles the smoothing (lerp)
        (function tick() {
            // Lerp current mouse position slightly to smooth out tiny jitters
            currentX += (targetX - currentX) * 0.25;
            currentY += (targetY - currentY) * 0.25;

            // Cursor dot follows smoothed position
            cursorDot.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
            
            // Ring lags behind
            ringX += (targetX - ringX) * 0.12;
            ringY += (targetY - ringY) * 0.12;
            cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

            // Mouse parallax on active room
            const activeRoom = rooms[current];
            if (activeRoom) {
                // Use smoothed mouse coordinates for parallax
                const nx = (currentX / window.innerWidth - 0.5) * 2;
                const ny = (currentY / window.innerHeight - 0.5) * 2;
                
                activeRoom.querySelectorAll('[data-depth]').forEach(el => {
                    // Cache depth property if not already
                    if(!el._depth) el._depth = parseFloat(el.dataset.depth || 0);
                    const d = el._depth;
                    
                    const tx = nx * d * -18;
                    const ty = ny * d * -12;
                    el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
                });
            }

            requestAnimationFrame(tick);
        })();

        // ── Cursor states ──

        function setCS(cls) {
            cursorDot.classList.add(cls);
            cursorRing.classList.add(cls);
        }
        function clearCS(cls) {
            cursorDot.classList.remove(cls);
            cursorRing.classList.remove(cls);
        }

        // Links & buttons
        document.querySelectorAll('a, button, [data-magnetic]').forEach(el => {
            el.addEventListener('mouseenter', () => setCS('on-link'));
            el.addEventListener('mouseleave', () => clearCS('on-link'));
        });

        // Headings
        document.querySelectorAll('h1, h2, .room-title, .threshold-name').forEach(el => {
            el.addEventListener('mouseenter', () => setCS('on-heading'));
            el.addEventListener('mouseleave', () => clearCS('on-heading'));
        });

        // Ghost text
        document.querySelectorAll('.ghost-text, .cl-ghost').forEach(el => {
            el.addEventListener('mouseenter', () => setCS('on-ghost'));
            el.addEventListener('mouseleave', () => clearCS('on-ghost'));
        });

        // Data values
        document.querySelectorAll('.data-val').forEach(el => {
            el.addEventListener('mouseenter', () => setCS('on-data'));
            el.addEventListener('mouseleave', () => clearCS('on-data'));
        });

        // Click
        document.addEventListener('mousedown', () => {
            gsap.to(cursorRing, { scale: 0.6, duration: 0.15, ease: 'power2.in' });
        });
        document.addEventListener('mouseup', () => {
            gsap.to(cursorRing, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
        });

        // Magnetic Objects
        document.querySelectorAll('[data-magnetic]').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                gsap.to(el, {
                    x: (e.clientX - r.left - r.width / 2) * 0.4,
                    y: (e.clientY - r.top - r.height / 2) * 0.4,
                    duration: 0.3, ease: 'power2.out',
                    overwrite: 'auto'
                });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
            });
        });

    } else {
        if (cursorDot) cursorDot.style.display = 'none';
        if (cursorRing) cursorRing.style.display = 'none';
        
        // Still run parallax on touch, but tie it to device orientation instead if possible
        // For now, center it.
        rooms.forEach((r) => {
            r.querySelectorAll('[data-depth]').forEach(el => {
                el.style.transform = `translate3d(0, 0, 0)`;
            });
        });
    }

    // ─── ENTRANCE ANIMATION ───

    const first = rooms[0];
    if (first) {
        const els = first.querySelectorAll('[data-animate]');
        gsap.set(els, { y: 40, opacity: 0 });
        gsap.to(els, {
            y: 0, opacity: 1,
            stagger: 0.15, duration: 1.4,
            ease: 'power3.out', delay: 0.2,
        });
    }

})();
