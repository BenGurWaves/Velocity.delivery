/* ======================================================================
   TONY ANDERSON — THE EROSION SCORE
   Script: Stratigraphic Descent Engine
   ====================================================================== */

(function () {
    'use strict';

    // --- PALETTE CONSTANTS ---
    const COLORS = {
        chalk: '#E8E0D4',
        fossil: '#D4C8B0',
        iron: '#8B5E3C',
        shale: '#3A4A5C',
        deep: '#1A1714',
        dust: '#C4B89A',
        water: '#5B7A8C',
        amber: '#B8946A',
        surface: '#2A2420',
        bedrock: '#0F0D0B',
    };

    // --- STATE ---
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let scrollProgress = 0;
    let isLoaded = false;

    // --- CUSTOM CURSOR ---
    const cursorCore = document.getElementById('cursor-core');
    const cursorErosion = document.getElementById('cursor-erosion');

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function updateCursor() {
        cursorX += (mouseX - cursorX) * 0.12;
        cursorY += (mouseY - cursorY) * 0.12;

        cursorCore.style.left = mouseX + 'px';
        cursorCore.style.top = mouseY + 'px';
        cursorErosion.style.left = cursorX + 'px';
        cursorErosion.style.top = cursorY + 'px';

        requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Hover states
    const hoverTargets = document.querySelectorAll('a, button, .channel-link');
    hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorCore.classList.add('hovering');
            cursorErosion.classList.add('hovering');
        });
        el.addEventListener('mouseleave', () => {
            cursorCore.classList.remove('hovering');
            cursorErosion.classList.remove('hovering');
        });
    });

    // Touch devices — hide cursor
    if ('ontouchstart' in window) {
        cursorCore.style.display = 'none';
        cursorErosion.style.display = 'none';
        document.documentElement.style.cursor = 'auto';
        document.body.style.cursor = 'auto';
    }

    // --- GEOLOGICAL CANVAS (Living Background) ---
    const canvas = document.getElementById('geo-canvas');
    const ctx = canvas.getContext('2d');
    let cW, cH;

    function resizeCanvas() {
        cW = canvas.width = window.innerWidth;
        cH = canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Sedimentary layer drawing
    function drawStrata(progress) {
        ctx.clearRect(0, 0, cW, cH);

        // Deep background gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 0, cH);
        const depthShift = progress * 0.6;
        bgGrad.addColorStop(0, lerpColor(COLORS.surface, COLORS.bedrock, depthShift));
        bgGrad.addColorStop(0.5, lerpColor(COLORS.deep, COLORS.bedrock, depthShift * 0.8));
        bgGrad.addColorStop(1, COLORS.bedrock);
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, cW, cH);

        // Horizontal strata lines — living geological layers
        const numLines = 12;
        const time = Date.now() * 0.0003;

        for (let i = 0; i < numLines; i++) {
            const baseY = (cH / numLines) * i + (cH / numLines) * 0.5;
            const waveOffset = Math.sin(time + i * 0.7) * 8;
            const y = baseY + waveOffset;

            // Each stratum has different opacity based on depth
            const layerDepth = i / numLines;
            const opacity = 0.03 + (1 - Math.abs(layerDepth - progress)) * 0.06;

            ctx.beginPath();
            ctx.moveTo(0, y);

            // Organic wave path
            for (let x = 0; x <= cW; x += 20) {
                const wave = Math.sin(x * 0.003 + time + i * 1.2) * (3 + i * 0.5)
                           + Math.sin(x * 0.007 + time * 0.5) * 2;
                ctx.lineTo(x, y + wave);
            }

            // Color varies by depth
            const layerColors = [COLORS.dust, COLORS.fossil, COLORS.iron, COLORS.amber, COLORS.shale, COLORS.water];
            const colorIdx = i % layerColors.length;

            ctx.strokeStyle = layerColors[colorIdx];
            ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        // Mouse erosion effect — concentric rings at cursor
        if (isLoaded) {
            const erosionRadius = 80 + Math.sin(time * 2) * 10;
            const grad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, erosionRadius);
            grad.addColorStop(0, `rgba(184, 148, 106, 0.04)`);
            grad.addColorStop(0.5, `rgba(139, 94, 60, 0.02)`);
            grad.addColorStop(1, `rgba(0, 0, 0, 0)`);
            ctx.globalAlpha = 1;
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, cW, cH);

            // Thin erosion rings
            for (let r = 0; r < 3; r++) {
                const ringR = erosionRadius * (0.3 + r * 0.25) + Math.sin(time * 3 + r) * 5;
                ctx.beginPath();
                ctx.arc(mouseX, mouseY, ringR, 0, Math.PI * 2);
                ctx.strokeStyle = COLORS.amber;
                ctx.globalAlpha = 0.03 - r * 0.008;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }

        ctx.globalAlpha = 1;
    }

    function lerpColor(a, b, t) {
        const ah = parseInt(a.replace('#', ''), 16);
        const bh = parseInt(b.replace('#', ''), 16);
        const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
        const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
        const rr = Math.round(ar + (br - ar) * t);
        const rg = Math.round(ag + (bg - ag) * t);
        const rb = Math.round(ab + (bb - ab) * t);
        return `rgb(${rr}, ${rg}, ${rb})`;
    }

    function animateCanvas() {
        drawStrata(scrollProgress);
        requestAnimationFrame(animateCanvas);
    }
    animateCanvas();

    // --- LENIS SMOOTH SCROLL ---
    const lenis = new Lenis({
        duration: 1.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // --- GSAP + SCROLLTRIGGER SETUP ---
    gsap.registerPlugin(ScrollTrigger);

    // Sync Lenis with ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // --- STRATA DEFINITIONS ---
    const strata = [
        { id: 'stratum-surface', start: 0, end: 0.2 },
        { id: 'stratum-philosophy', start: 0.18, end: 0.4 },
        { id: 'stratum-niobrara', start: 0.38, end: 0.6 },
        { id: 'stratum-method', start: 0.58, end: 0.8 },
        { id: 'stratum-commission', start: 0.78, end: 1.0 },
    ];

    // --- SCROLL-DRIVEN STRATUM TRANSITIONS ---
    ScrollTrigger.create({
        trigger: '#scroll-proxy',
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
            scrollProgress = self.progress;
            updateStrata(scrollProgress);
            updateDepth(scrollProgress);
        },
    });

    function updateStrata(progress) {
        strata.forEach(({ id, start, end }) => {
            const el = document.getElementById(id);
            if (!el) return;

            const mid = (start + end) / 2;
            const fadeIn = start;
            const fadeOut = end;

            let opacity = 0;
            let yOffset = 0;

            if (progress < fadeIn) {
                // Not yet visible
                opacity = 0;
                yOffset = 40;
            } else if (progress >= fadeIn && progress < mid) {
                // Fading in
                const t = (progress - fadeIn) / (mid - fadeIn);
                const eased = easeOutCubic(t);
                opacity = eased;
                yOffset = 40 * (1 - eased);
            } else if (progress >= mid && progress < fadeOut) {
                // Visible, then fading out
                const t = (progress - mid) / (fadeOut - mid);
                const eased = easeInCubic(t);
                opacity = 1 - eased;
                yOffset = -30 * eased;
            } else {
                opacity = 0;
                yOffset = -30;
            }

            el.style.opacity = opacity;
            el.style.visibility = opacity > 0.01 ? 'visible' : 'hidden';
            el.style.transform = `translateY(${yOffset}px)`;
        });

        // Scroll prompt fades out
        const prompt = document.getElementById('scroll-prompt');
        if (prompt) {
            prompt.style.opacity = Math.max(0, 0.5 - progress * 5);
        }
    }

    function updateDepth(progress) {
        const fill = document.querySelector('.depth-fill');
        if (fill) {
            fill.style.height = (progress * 100) + '%';
        }
    }

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    function easeInCubic(t) { return t * t * t; }

    // --- SPECIAL ANIMATIONS FOR NIOBRARA LETTERS ---
    ScrollTrigger.create({
        trigger: '#scroll-proxy',
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
            const p = self.progress;
            // Niobrara letters animate when stratum-niobrara is active (0.38–0.6)
            if (p >= 0.38 && p <= 0.6) {
                const localP = (p - 0.38) / 0.12; // 0→1 over entry
                const letters = document.querySelectorAll('.serif-display');
                letters.forEach((letter, i) => {
                    const delay = i * 0.08;
                    const t = Math.max(0, Math.min(1, (localP - delay) * 3));
                    const eased = easeOutCubic(t);
                    letter.style.opacity = eased;
                    letter.style.transform = `translateY(${30 * (1 - eased)}px)`;
                });
            }
        },
    });

    // --- SURFACE NAME ENTRANCE (on load) ---
    function animateSurface() {
        const tl = gsap.timeline({ delay: 0.2 });

        tl.to('.surface-coords', {
            opacity: 1,
            duration: 1.2,
            ease: 'power2.out',
        });

        tl.to('.name-line', {
            opacity: 1,
            y: 0,
            duration: 1.4,
            stagger: 0.15,
            ease: 'power3.out',
        }, '-=0.8');

        tl.to('.name-line::after', {
            scaleX: 1,
            duration: 1,
            ease: 'power2.inOut',
        }, '-=0.5');

        tl.to('.surface-descriptor', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out',
        }, '-=0.8');
    }

    // --- EMAIL COPY ---
    const copyBtn = document.getElementById('copy-email');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const email = copyBtn.getAttribute('data-email');
            navigator.clipboard.writeText(email).then(() => {
                copyBtn.classList.add('copied');
                setTimeout(() => copyBtn.classList.remove('copied'), 2000);
            });
        });
    }

    // --- LOADER ---
    function runLoader() {
        const loader = document.getElementById('loader');
        const tl = gsap.timeline({
            onComplete: () => {
                gsap.to(loader, {
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        loader.style.display = 'none';
                        isLoaded = true;
                        animateSurface();
                    },
                });
            },
        });

        // Loader strata layers shift
        tl.to('.loader-mono', {
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
        });

        tl.to('.loader-name', {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
        }, '-=0.2');

        tl.to('.loader-bar', {
            opacity: 1,
            duration: 0.3,
        }, '-=0.4');

        tl.to('.loader-bar-fill', {
            width: '100%',
            duration: 2,
            ease: 'power1.inOut',
        }, '-=0.2');

        // Layers peel
        tl.to('.loader-layer-1', { scaleY: 0, duration: 0.4, ease: 'power2.in' }, '-=0.5');
        tl.to('.loader-layer-2', { scaleY: 0, duration: 0.4, ease: 'power2.in' }, '-=0.3');
        tl.to('.loader-layer-3', { scaleY: 0, duration: 0.4, ease: 'power2.in' }, '-=0.3');
        tl.to('.loader-layer-4', { scaleY: 0, duration: 0.4, ease: 'power2.in' }, '-=0.3');
    }

    // Start
    window.addEventListener('load', () => {
        runLoader();
    });

})();
