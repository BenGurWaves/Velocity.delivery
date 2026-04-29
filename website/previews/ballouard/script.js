/* ============================================
   LUDOVIC BALLOUARD — CINEMATIC ATELIER
   JavaScript Architecture
   ============================================ */

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

/* ============================================
   LENIS SMOOTH SCROLL
   ============================================ */
const lenis = new Lenis({
    lerp: 0.04,
    smooth: true,
    smoothTouch: false
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Sync Lenis with ScrollTrigger
lenis.on('scroll', () => {
    ScrollTrigger.update();
});

/* ============================================
   CUSTOM CURSOR WITH VELOCITY
   ============================================ */
function initCursor() {
    const cursor = document.getElementById('cursor');
    const ring = cursor.querySelector('.cursor-ring');
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let lastMouseX = 0, lastMouseY = 0;
    let velocity = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function animateCursor() {
        // Calculate velocity
        const dx = mouseX - lastMouseX;
        const dy = mouseY - lastMouseY;
        const currentSpeed = Math.sqrt(dx * dx + dy * dy);
        
        // Trailing velocity average
        velocity = velocity * 0.9 + currentSpeed * 0.1;
        
        // Smooth position (lerp)
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        
        // Morph size based on velocity
        const size = 20 + Math.min(velocity * 0.3, 12);
        
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        ring.style.width = size + 'px';
        ring.style.height = size + 'px';
        
        lastMouseX = mouseX;
        lastMouseY = mouseY;
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
}

/* ============================================
   LOADER — CINEMATIC FLY-THROUGH
   ============================================ */
function initLoader() {
    const loader = document.getElementById('loader');
    const paths = document.querySelectorAll('.monogram-path');
    
    // Calculate and set path lengths
    paths.forEach(path => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
    });
    
    // Draw animation timeline
    const drawTl = gsap.timeline({
        onComplete: () => {
            // Fly-through animation
            gsap.to(loader, {
                scale: 80,
                opacity: 0,
                duration: 1,
                ease: 'expo.in',
                onComplete: () => {
                    loader.remove();
                    document.body.style.overflow = 'auto';
                    initScrollAnimations();
                }
            });
        }
    });
    
    // Draw each path with precision
    drawTl.to('.monogram-path', {
        strokeDashoffset: 0,
        duration: 1.6,
        ease: 'power3.inOut',
        stagger: 0.1
    });
}

/* ============================================
   TEXT SPLITTING UTILITY
   ============================================ */
function splitText(element) {
    const text = element.textContent;
    element.innerHTML = '';
    
    text.split('').forEach(char => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        element.appendChild(span);
    });
}

/* ============================================
   BREATHING EFFECT — SECTIONS
   ============================================ */
function initBreathingEffect() {
    const sections = document.querySelectorAll('.section');
    
    sections.forEach((section, index) => {
        gsap.to(section, {
            scale: 1.005,
            duration: 7.5,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            delay: index * 0.5
        });
    });
}

/* ============================================
   WEBGL WATCH ASSEMBLY
   ============================================ */
function initWatchShader() {
    const canvas = document.getElementById('watch-canvas');
    if (!canvas) return;
    
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
        console.warn('WebGL not supported');
        return;
    }
    
    // Resize canvas
    function resize() {
        canvas.width = 600;
        canvas.height = 600;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    
    // Vertex shader
    const vsSource = `
        attribute vec4 aPosition;
        void main() {
            gl_Position = aPosition;
        }
    `;
    
    // Fragment shader — Procedural Watch
    const fsSource = `
        precision highp float;
        uniform float uTime;
        uniform float uProgress;
        uniform vec2 uResolution;
        
        #define PI 3.14159265359
        #define SILVER vec3(0.906, 0.902, 0.902)
        #define GOLD vec3(0.773, 0.631, 0.353)
        #define BLACK vec3(0.0, 0.0, 0.0)
        
        float smoothCircle(vec2 uv, float radius, float thickness) {
            float dist = length(uv);
            return smoothstep(radius + thickness, radius, dist) - 
                   smoothstep(radius, radius - thickness, dist);
        }
        
        float tickMarks(vec2 uv, float radius) {
            float angle = atan(uv.y, uv.x);
            float normalizedAngle = (angle / PI + 1.0) * 0.5;
            float tick = sin(normalizedAngle * 60.0 * PI);
            float tickMask = smoothstep(0.97, 1.0, tick);
            float dist = length(uv);
            float ringMask = smoothstep(radius + 0.02, radius, dist) - 
                           smoothstep(radius, radius - 0.02, dist);
            return tickMask * ringMask;
        }
        
        float hand(vec2 uv, float length, float width, float angle, vec3 color) {
            float ca = cos(angle);
            float sa = sin(angle);
            vec2 rotated = vec2(uv.x * ca + uv.y * sa, -uv.x * sa + uv.y * ca);
            float handMask = smoothstep(width, width * 0.5, abs(rotated.x)) * 
                            smoothstep(length, length * 0.8, rotated.y) * 
                            step(0.0, rotated.y);
            return handMask;
        }
        
        void main() {
            vec2 uv = (gl_FragCoord.xy - uResolution * 0.5) / min(uResolution.x, uResolution.y);
            
            float progress = uProgress;
            vec3 color = BLACK;
            
            // 0%: Center point
            if (progress > 0.0) {
                float pointIntensity = smoothstep(0.0, 0.15, progress);
                float point = smoothstep(0.02, 0.0, length(uv));
                color += SILVER * point * pointIntensity;
            }
            
            // 15%: Case circle
            if (progress > 0.15) {
                float caseIntensity = smoothstep(0.15, 0.30, progress);
                float caseCircle = smoothCircle(uv, 0.35, 0.005);
                color += SILVER * caseCircle * caseIntensity;
            }
            
            // 30%: Tick marks
            if (progress > 0.30) {
                float tickIntensity = smoothstep(0.30, 0.45, progress);
                float ticks = tickMarks(uv, 0.32);
                color += SILVER * ticks * tickIntensity;
            }
            
            // 60%: Hour and minute hands
            if (progress > 0.60) {
                float handIntensity = smoothstep(0.60, 0.75, progress);
                
                // Hour hand (10 o'clock position)
                float hourAngle = -PI / 3.0;
                float hourHand = hand(uv, 0.15, 0.015, hourAngle, SILVER);
                color += SILVER * hourHand * handIntensity;
                
                // Minute hand (10 minutes, slightly thicker)
                float minuteAngle = PI / 6.0;
                float minuteHand = hand(uv, 0.22, 0.012, minuteAngle, SILVER);
                color += SILVER * minuteHand * handIntensity;
            }
            
            // 85%: Second hand (gold)
            if (progress > 0.85) {
                float secondIntensity = smoothstep(0.85, 1.0, progress);
                
                // Ticking second hand
                float tickTime = floor(uTime * 2.0) / 2.0;
                float secondAngle = -PI / 2.0 + tickTime;
                float secondHand = hand(uv, 0.28, 0.005, secondAngle, GOLD);
                color += GOLD * secondHand * secondIntensity;
                
                // Center pivot
                float pivot = smoothstep(0.02, 0.0, length(uv));
                color += SILVER * pivot * secondIntensity;
            }
            
            // 100%: Continuous rotation
            if (progress >= 1.0) {
                float rotation = uTime * 0.1; // Slow rotation
                float ca = cos(rotation);
                float sa = sin(rotation);
                vec2 rotatedUV = vec2(uv.x * ca - uv.y * sa, uv.x * sa + uv.y * ca);
                
                // Redraw with rotation
                color = BLACK;
                color += SILVER * smoothCircle(rotatedUV, 0.35, 0.005);
                color += SILVER * tickMarks(rotatedUV, 0.32) * 0.8;
                
                float hourAngle = -PI / 3.0 + rotation;
                float minuteAngle = PI / 6.0 + rotation;
                color += SILVER * hand(rotatedUV, 0.15, 0.015, hourAngle, SILVER);
                color += SILVER * hand(rotatedUV, 0.22, 0.012, minuteAngle, SILVER);
                
                float tickTime = floor(uTime * 2.0) / 2.0;
                float secondAngle = -PI / 2.0 + tickTime;
                color += GOLD * hand(rotatedUV, 0.28, 0.005, secondAngle, GOLD);
                color += SILVER * smoothstep(0.02, 0.0, length(rotatedUV));
            }
            
            gl_FragColor = vec4(color, 1.0);
        }
    `;
    
    // Compile shaders
    function compileShader(gl, source, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
    
    const vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);
    
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return;
    }
    
    gl.useProgram(program);
    
    // Create fullscreen quad
    const positions = new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
         1,  1
    ]);
    
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    
    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    
    // Get uniform locations
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uProgress = gl.getUniformLocation(program, 'uProgress');
    const uResolution = gl.getUniformLocation(program, 'uResolution');
    
    let progress = 0;
    let isPinned = false;
    
    // ScrollTrigger for watch assembly
    ScrollTrigger.create({
        trigger: '#section3',
        start: 'top top',
        end: '+=200%',
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
            progress = self.progress;
            isPinned = true;
        },
        onLeave: () => {
            progress = 1;
            isPinned = false;
        },
        onEnterBack: () => {
            isPinned = true;
        }
    });
    
    // Craft text reveal
    ScrollTrigger.create({
        trigger: '#section3',
        start: '60% center',
        end: '80% center',
        scrub: true,
        onUpdate: (self) => {
            gsap.set('#craftText', { opacity: self.progress });
        }
    });
    
    // Animation loop
    let startTime = Date.now();
    function render() {
        const currentTime = (Date.now() - startTime) / 1000;
        
        gl.uniform1f(uTime, currentTime);
        gl.uniform1f(uProgress, progress);
        gl.uniform2f(uResolution, canvas.width, canvas.height);
        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        
        requestAnimationFrame(render);
    }
    
    render();
}

/* ============================================
   SCROLL ANIMATIONS — MAIN
   ============================================ */
function initScrollAnimations() {
    
    // SECTION 1 → 2: V-Split Mainspring Transition
    const splitTl = gsap.timeline({
        scrollTrigger: {
            trigger: '#section1',
            start: 'top top',
            end: '+=150%',
            pin: true,
            scrub: 1.2
        }
    });
    
    splitTl
        .to('.hero-text', {
            rotateY: -15,
            x: -150,
            opacity: 0,
            ease: 'expo.out'
        }, 0)
        .to('.hero-image', {
            rotateY: 15,
            x: 150,
            opacity: 0,
            ease: 'expo.out'
        }, 0)
        .fromTo('#section2', 
            { z: -400, scale: 0.9, opacity: 0 },
            { z: 0, scale: 1, opacity: 1, ease: 'expo.out' },
            0.3
        );
    
    // SECTION 2: Character-by-character reveal
    const splitElements = document.querySelectorAll('.split-text');
    splitElements.forEach(el => splitText(el));
    
    const chars = document.querySelectorAll('.philosophy-content .char');
    
    gsap.to(chars, {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        duration: 0.8,
        stagger: 0.015,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '#section2',
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1
        }
    });
    
    // SECTION 4: Drifting memory fragments
    gsap.fromTo('.fragment-1', 
        { x: 0, y: 0, opacity: 0, filter: 'blur(10px)' },
        { 
            x: -100, y: -80, opacity: 1, filter: 'blur(0px)',
            scrollTrigger: {
                trigger: '#section4',
                start: 'top 80%',
                end: 'center center',
                scrub: true
            }
        }
    );
    
    gsap.to('.fragment-1', {
        opacity: 0,
        filter: 'blur(10px)',
        x: -150,
        y: -120,
        scrollTrigger: {
            trigger: '#section4',
            start: 'center center',
            end: 'bottom 60%',
            scrub: true
        }
    });
    
    gsap.fromTo('.fragment-2',
        { x: 0, y: 0, opacity: 0, filter: 'blur(10px)' },
        {
            x: 100, y: 60, opacity: 1, filter: 'blur(0px)',
            scrollTrigger: {
                trigger: '#section4',
                start: 'top 60%',
                end: 'center 40%',
                scrub: true
            }
        }
    );
    
    gsap.to('.fragment-2', {
        opacity: 0,
        filter: 'blur(10px)',
        x: 150,
        y: 100,
        scrollTrigger: {
            trigger: '#section4',
            start: 'center 40%',
            end: 'bottom 40%',
            scrub: true
        }
    });
    
    gsap.fromTo('.fragment-3',
        { scale: 0.9, opacity: 0, filter: 'blur(10px)' },
        {
            scale: 1.02, opacity: 1, filter: 'blur(0px)',
            scrollTrigger: {
                trigger: '#section4',
                start: 'top 40%',
                end: 'center 20%',
                scrub: true
            }
        }
    );
    
    gsap.to('.fragment-3', {
        opacity: 0,
        filter: 'blur(10px)',
        scale: 1.05,
        scrollTrigger: {
            trigger: '#section4',
            start: 'center 20%',
            end: 'bottom 20%',
            scrub: true
        }
    });
}

/* ============================================
   FLUID BACKGROUND ANIMATION
   ============================================ */
function initFluidBackground() {
    const turbulence = document.querySelector('#fluid-filter feTurbulence');
    if (!turbulence) return;
    
    let time = 0;
    
    function animate() {
        time += 0.0008;
        const baseFreqX = 0.003;
        const baseFreqY = 0.003 + Math.sin(time) * 0.001;
        turbulence.setAttribute('baseFrequency', `${baseFreqX} ${baseFreqY}`);
        requestAnimationFrame(animate);
    }
    
    animate();
}

/* ============================================
   INITIALIZATION
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize in sequence
    initCursor();
    initLoader();
    initBreathingEffect();
    initFluidBackground();
    
    // Delay WebGL init to ensure context is ready
    setTimeout(initWatchShader, 500);
});
