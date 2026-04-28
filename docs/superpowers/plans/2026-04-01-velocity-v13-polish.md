# Velocity v13 Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish velocity.calyvent.com into a fully premium experience — real work previews, luxury scroll, cinematic preloader, fixed mobile, and correct metadata throughout.

**Architecture:** All changes are in static files (`website/index.html`, `website/styles.css`, `website/terms.html`, `website/privacy.html`) plus new static screenshot assets. No build tool. No backend. Lenis is added via CDN for smooth scroll. GSAP already loaded.

**Tech Stack:** Vanilla HTML/CSS/JS · GSAP 3 + ScrollTrigger (CDN) · Lenis smooth scroll (CDN) · Cloudflare Pages · Playwright MCP for screenshot capture

---

## Decisions Locked In

### Item 1 — Work Preview
**Chosen approach: Option B — Playwright screenshots as static images + fake browser loading overlay.**

Rationale: iframes fail because `calyvent.com`, `thread.calyvent.com`, and `vault.calyvent.com` all send `X-Frame-Options` or CSP headers that block embedding. Microlink free tier has rate limits and adds external dependency. Static screenshots are 100% reliable across all browsers, zero latency, zero errors. The "loading" feeling is created by a 2.3s CSS animation (progress bar + skeleton) that plays before the image reveals — this is actually more controlled and cinematic than a real iframe load.

### Item 10 — "Nano Banana" AI Image
**Skipped — needs user clarification.** The model name "nano banana (first model)" is unrecognized. No API key is visible in the current session context. Calyvent.com is already a strong visual reference for the work section. Adding an AI-generated image risks disrupting the Quiet Luxury aesthetic unless perfectly executed. **Ping user after this plan to clarify the API endpoint, key, and intended placement before proceeding.**

### Item 7 — Mailto
**This is a browser/OS config issue, not a code bug.** The HTML `href="mailto:hello@calyvent.com"` is correct. On macOS, if no default mail client is configured (or the user uses Gmail in browser), clicking mailto does nothing or opens an error. Fix on our side: open links in a new tab with a fallback. Recommendation: leave code as-is but mention this to the user.

---

## File Map

| File | Changes |
|------|---------|
| `website/index.html` | Calyvent work item, dates, work preview JS overhaul, Lenis CDN, preloader timing, GSAP boot tweaks |
| `website/styles.css` | Grain sweet spot, work preview CSS (browser chrome + loading bar + image reveal), Lenis integration |
| `website/terms.html` | Add `.cursor` + `.cdot` HTML + cursor JS block, `cursor:none` on body |
| `website/privacy.html` | Same as terms.html |
| `website/work-thread.jpg` | Real Playwright screenshot of thread.calyvent.com (1280×800) |
| `website/work-calyvent.jpg` | Real Playwright screenshot of calyvent.com (1280×800) |
| `website/work-vault.jpg` | Real Playwright screenshot of vault.calyvent.com (1280×800) |

---

## Task 1: Capture Real Screenshots (Playwright MCP)

**Files:**
- Create: `website/work-thread.jpg`
- Create: `website/work-calyvent.jpg`
- Create: `website/work-vault.jpg`

- [ ] **Step 1: Screenshot thread.calyvent.com**

Using Playwright MCP:
```
browser_navigate: https://thread.calyvent.com
wait 2s
browser_resize: 1280 × 800
browser_take_screenshot: filename=website/work-thread.jpg, type=jpeg
```

- [ ] **Step 2: Screenshot calyvent.com**

```
browser_navigate: https://calyvent.com
wait 2s
browser_resize: 1280 × 800
browser_take_screenshot: filename=website/work-calyvent.jpg, type=jpeg
```

- [ ] **Step 3: Screenshot vault.calyvent.com**

```
browser_navigate: https://vault.calyvent.com
wait 2s
browser_resize: 1280 × 800
browser_take_screenshot: filename=website/work-vault.jpg, type=jpeg
```

- [ ] **Step 4: Verify file sizes are non-zero**

```bash
ls -lh website/work-*.jpg
```
Expected: each file > 50KB

- [ ] **Step 5: Commit screenshots**

```bash
git add website/work-thread.jpg website/work-calyvent.jpg website/work-vault.jpg
git commit -m "assets: real site screenshots for work preview"
```

---

## Task 2: Replace LinkDrop with Calyvent + Fix Dates

**Files:**
- Modify: `website/index.html` (work list section, lines ~62–97)

- [ ] **Step 1: Update the work list HTML**

Find the existing item 02 (LinkDrop) and replace the entire work-list block with:

```html
<div class="work-list" id="workList">
  <a href="https://thread.calyvent.com" target="_blank" class="wl-item" data-color="#C8A882" data-img="/work-thread.jpg">
    <span class="wl-num">01</span>
    <span class="wl-name">Thread</span>
    <span class="wl-type">Brand Infrastructure</span>
    <span class="wl-year">2026</span>
    <span class="wl-arrow">↗</span>
  </a>
  <div class="wl-sep"></div>
  <a href="https://calyvent.com" target="_blank" class="wl-item" data-color="#D4C4B0" data-img="/work-calyvent.jpg">
    <span class="wl-num">02</span>
    <span class="wl-name">Calyvent</span>
    <span class="wl-type">Brand Identity</span>
    <span class="wl-year">2025</span>
    <span class="wl-arrow">↗</span>
  </a>
  <div class="wl-sep"></div>
  <a href="https://vault.calyvent.com" target="_blank" class="wl-item" data-color="#A8C8A0" data-img="/work-vault.jpg">
    <span class="wl-num">03</span>
    <span class="wl-name">The Vault</span>
    <span class="wl-type">E-Commerce</span>
    <span class="wl-year">2026</span>
    <span class="wl-arrow">↗</span>
  </a>
</div>
```

Note: added `data-img` attribute to each item — used by the new preview JS in Task 3.

- [ ] **Step 2: Commit**

```bash
git add website/index.html
git commit -m "content: Calyvent replaces LinkDrop, fix work dates"
```

---

## Task 3: Work Preview — Real Screenshots with Fake Loading

**Files:**
- Modify: `website/index.html` (work hover preview JS block, lines ~271–305)
- Modify: `website/styles.css` (`.work-preview`, `.wp-inner` and new `.wp-browser` rules)

The preview card gets a fake browser chrome (three dots + address bar + progress bar). On mouseenter: progress bar animates 0→100% over 2.3s, skeleton shows. After 2.3s: skeleton fades out, real screenshot fades in.

- [ ] **Step 1: Replace `.work-preview` / `.wp-inner` CSS with browser-chrome preview**

In `website/styles.css`, replace the current `.work-preview` and `.wp-inner` blocks with:

```css
/* Hover preview — fake browser chrome */
.work-preview {
  position: fixed;
  top: 0; left: 0;
  width: 320px;
  pointer-events: none;
  z-index: 500;
  opacity: 0;
  transform: translate(-500px, 0);
  transition: opacity .3s cubic-bezier(0.16,1,0.3,1);
  filter: drop-shadow(0 28px 60px rgba(0,0,0,.7));
}
.work-preview.show { opacity: 1 }

.wp-browser {
  border-radius: 7px;
  overflow: hidden;
  border: 1px solid rgba(222,200,181,.1);
  background: #0f0e0b;
}
.wp-chrome {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #1a1916;
  border-bottom: 1px solid rgba(222,200,181,.07);
}
.wp-dots {
  display: flex;
  gap: 5px;
  flex-shrink: 0;
}
.wp-dot {
  width: 9px; height: 9px;
  border-radius: 50%;
  background: rgba(222,200,181,.12);
}
.wp-dot:first-child { background: rgba(255,95,86,.5) }
.wp-dot:nth-child(2) { background: rgba(255,189,46,.5) }
.wp-dot:nth-child(3) { background: rgba(39,201,63,.5) }
.wp-address {
  flex: 1;
  height: 20px;
  background: rgba(222,200,181,.06);
  border-radius: 3px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  font-family: 'Inter', sans-serif;
  font-size: .58rem;
  letter-spacing: .02em;
  color: rgba(222,200,181,.3);
  overflow: hidden;
  white-space: nowrap;
}
.wp-progress-track {
  height: 2px;
  background: rgba(222,200,181,.06);
  position: relative;
  overflow: hidden;
}
.wp-progress-bar {
  position: absolute;
  inset: 0 100% 0 0;
  background: var(--brass);
  transition: right 0s;
}
.wp-progress-bar.loading {
  right: 0;
  transition: right 2.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.wp-viewport {
  position: relative;
  width: 100%;
  height: 190px;
  overflow: hidden;
}
.wp-skeleton {
  position: absolute;
  inset: 0;
  background: #0f0e0b;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  transition: opacity .4s;
}
.wp-sk-row {
  height: 10px;
  border-radius: 3px;
  background: rgba(222,200,181,.06);
  animation: skpulse 1.4s ease-in-out infinite;
}
.wp-sk-row.tall { height: 60px }
.wp-sk-row.short { width: 55% }
.wp-sk-row.xshort { width: 35% }
@keyframes skpulse {
  0%,100% { opacity: .6 }
  50%      { opacity: 1 }
}
.wp-screenshot {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  opacity: 0;
  transition: opacity .5s ease;
}
.wp-screenshot.reveal { opacity: 1 }
```

- [ ] **Step 2: Replace the preview HTML in index.html**

Find the existing `<!-- Hover preview -->` block and replace it:

```html
<!-- Hover preview -->
<div class="work-preview" id="workPreview">
  <div class="wp-browser">
    <div class="wp-chrome">
      <div class="wp-dots">
        <div class="wp-dot"></div>
        <div class="wp-dot"></div>
        <div class="wp-dot"></div>
      </div>
      <div class="wp-address" id="wpAddress">calyvent.com</div>
    </div>
    <div class="wp-progress-track">
      <div class="wp-progress-bar" id="wpBar"></div>
    </div>
    <div class="wp-viewport">
      <div class="wp-skeleton" id="wpSkeleton">
        <div class="wp-sk-row tall"></div>
        <div class="wp-sk-row"></div>
        <div class="wp-sk-row short"></div>
        <div class="wp-sk-row xshort"></div>
        <div class="wp-sk-row"></div>
      </div>
      <img class="wp-screenshot" id="wpShot" src="" alt="" loading="lazy">
    </div>
  </div>
</div>
```

- [ ] **Step 3: Replace the work hover preview JS block**

Find the `/* ── Work hover preview ── */` IIFE and replace entirely:

```javascript
/* ── Work hover preview ── */
(function(){
  const items    = document.querySelectorAll('.wl-item');
  const preview  = document.getElementById('workPreview');
  const address  = document.getElementById('wpAddress');
  const bar      = document.getElementById('wpBar');
  const skeleton = document.getElementById('wpSkeleton');
  const shot     = document.getElementById('wpShot');
  let mx=0, my=0, active=false, revealTimer=null;

  const urls = {
    0: 'thread.calyvent.com',
    1: 'calyvent.com',
    2: 'vault.calyvent.com'
  };

  document.addEventListener('mousemove', e=>{ mx=e.clientX; my=e.clientY; });

  items.forEach((item, i)=>{
    item.addEventListener('mouseenter', ()=>{
      // Reset state
      clearTimeout(revealTimer);
      bar.classList.remove('loading');
      bar.style.transition = 'none';
      shot.classList.remove('reveal');
      shot.src = '';
      skeleton.style.opacity = '1';
      address.textContent = urls[i] || '';

      // Preload image
      const img = item.dataset.img || '';
      shot.src = img;

      // Show preview
      preview.classList.add('show');
      active = true;

      // Start progress bar after 1 frame
      requestAnimationFrame(()=>{
        requestAnimationFrame(()=>{
          bar.classList.add('loading');
        });
      });

      // Reveal screenshot after 2.3s
      revealTimer = setTimeout(()=>{
        skeleton.style.opacity = '0';
        shot.classList.add('reveal');
      }, 2300);
    });

    item.addEventListener('mouseleave', ()=>{
      preview.classList.remove('show');
      active = false;
      clearTimeout(revealTimer);
      // Reset for next hover
      setTimeout(()=>{
        if(!active){
          bar.classList.remove('loading');
          bar.style.transition = 'none';
          shot.classList.remove('reveal');
          skeleton.style.opacity = '1';
        }
      }, 350);
    });
  });

  (function loop(){
    if(active){
      preview.style.transform = `translate(${mx+28}px,${my-100}px)`;
    }
    requestAnimationFrame(loop);
  })();
})();
```

- [ ] **Step 4: Commit**

```bash
git add website/index.html website/styles.css
git commit -m "feat: work preview with real screenshots and 2.3s browser loading animation"
```

---

## Task 4: Custom Cursor on Legal Pages

**Files:**
- Modify: `website/terms.html`
- Modify: `website/privacy.html`

Both pages link `styles.css?v=12` which already has `.cursor` and `.cdot` CSS, and sets `cursor: none` on `body`. The problem: the cursor HTML elements and JS aren't in the legal pages.

- [ ] **Step 1: Add cursor HTML + JS to terms.html**

After `<div class="grain"></div>`, add:
```html
<div class="cursor" id="cursor"></div>
<div class="cdot" id="cdot"></div>
```

Before `</body>`, add:
```html
<script>
(function(){
  if(window.matchMedia('(pointer:coarse)').matches) return;
  const c=document.getElementById('cursor'), d=document.getElementById('cdot');
  let mx=-200,my=-200,cx=-200,cy=-200;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
  (function loop(){
    cx+=(mx-cx)*0.1; cy+=(my-cy)*0.1;
    c.style.transform=`translate(${cx-20}px,${cy-20}px)`;
    d.style.transform=`translate(${mx-3}px,${my-3}px)`;
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a,button').forEach(el=>{
    el.addEventListener('mouseenter',()=>c.classList.add('hover'));
    el.addEventListener('mouseleave',()=>c.classList.remove('hover'));
  });
})();
window.addEventListener('scroll',()=>{
  document.getElementById('nav').classList.toggle('s', scrollY>60);
},{passive:true});
</script>
```

- [ ] **Step 2: Same additions to privacy.html**

Identical changes to `website/privacy.html`.

- [ ] **Step 3: Commit**

```bash
git add website/terms.html website/privacy.html
git commit -m "fix: custom cursor on legal pages"
```

---

## Task 5: Luxury Scroll (Lenis) + Slower Preloader

**Files:**
- Modify: `website/index.html` (CDN script tag + Lenis init + preloader timing)

- [ ] **Step 1: Add Lenis CDN before GSAP scripts**

In `index.html`, before the GSAP `<script>` tags, add:
```html
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js"></script>
```

- [ ] **Step 2: Initialize Lenis in the inline script (top of the script block)**

At the very top of the inline `<script>` block, before `gsap.registerPlugin(...)`, add:

```javascript
/* ── Luxury scroll (Lenis) ── */
const lenis = new Lenis({
  duration: 2.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
  smoothTouch: false,
});
function lenisRaf(time){ lenis.raf(time); requestAnimationFrame(lenisRaf); }
requestAnimationFrame(lenisRaf);

// Wire Lenis to ScrollTrigger
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);
```

- [ ] **Step 3: Slow the preloader to 2.5s minimum**

Replace the preloader IIFE:

```javascript
(function(){
  let p = 0;
  const bar  = document.getElementById('pl-bar');
  const pl   = document.getElementById('pl');
  const MIN_DURATION = 2600; // ms — never dismiss before this
  const start = Date.now();

  // Slow, uneven trickle — builds tension
  const t = setInterval(()=>{
    const remaining = 100 - p;
    const increment = remaining > 40
      ? Math.random() * 6 + 2        // fast early
      : remaining > 15
        ? Math.random() * 2.5 + 0.5  // slow middle
        : Math.random() * 0.8 + 0.1; // agonizingly slow at end
    p = Math.min(p + increment, 97); // never auto-complete — waits for load
    bar.style.width = p + '%';
  }, 80);

  window.addEventListener('load', ()=>{
    clearInterval(t);
    const elapsed = Date.now() - start;
    const delay   = Math.max(0, MIN_DURATION - elapsed);
    setTimeout(()=>{
      p = 100;
      bar.style.width = '100%';
      setTimeout(()=>{ pl.classList.add('out'); boot(); }, 500);
    }, delay);
  });
})();
```

- [ ] **Step 4: Commit**

```bash
git add website/index.html
git commit -m "feat: Lenis luxury scroll (duration 2.2), extended preloader 2.5s minimum"
```

---

## Task 6: Grain Sweet Spot

**Files:**
- Modify: `website/styles.css` (`.grain` background-image and opacity)

Sweet spot between v11 (0.82, too chunky) and v12 (0.92, invisible): **baseFrequency 0.87**, viewBox 512px, opacity 0.022 — visible as a fine texture when looking at a flat dark area but not immediately obvious.

- [ ] **Step 1: Update grain CSS**

In `website/styles.css`, find the `.grain` background-image line and replace:

```css
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.87' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity:.022;
```

- [ ] **Step 2: Bump CSS version to v=13 in index.html, terms.html, privacy.html**

In all three files:
```
/styles.css?v=12  →  /styles.css?v=13
```

- [ ] **Step 3: Commit**

```bash
git add website/styles.css website/index.html website/terms.html website/privacy.html
git commit -m "fix: grain sweet spot 0.87, v13"
```

---

## Task 7: Mobile Audit and Fixes

**Files:**
- Modify: `website/styles.css` (mobile breakpoints)
- Modify: `website/index.html` (any mobile-specific markup if needed)

- [ ] **Step 1: Take mobile screenshot (375px viewport)**

Using Playwright MCP:
```
browser_resize: 375 × 812
browser_navigate: https://[latest-preview-url]
browser_take_screenshot: filename=mobile-audit.png
```
Scroll through and screenshot all sections.

- [ ] **Step 2: Identify problems and apply fixes**

Known likely issues to fix in the `@media(max-width:600px)` block:

```css
@media(max-width:600px){
  /* Cursor hidden, body pointer restored */
  .cursor, .cdot { display:none }
  body { cursor:auto }
  a, button { cursor:pointer }

  /* Nav — show only Contact on mobile */
  .nav-links a:not(:last-child) { display:none }

  /* Hero — name must still dominate but fit */
  .hero-name {
    font-size: clamp(4rem, 22vw, 9rem);
    letter-spacing: -.05em;
    top: 50%;
  }
  .hero-foot {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .hero-scroll { display: none } /* too cramped on mobile */

  /* Intro — single column, full width */
  .intro {
    grid-template-columns: 1fr;
    padding: clamp(4rem, 12vw, 7rem) var(--px);
  }
  .intro-text {
    grid-column: 1;
    font-size: clamp(1.6rem, 7vw, 2.8rem);
  }

  /* Work list — hide type and year, keep number + name + arrow */
  .wl-item {
    grid-template-columns: 2.5rem 1fr 2rem;
    padding: clamp(1.5rem, 5vw, 3rem) 0;
  }
  .wl-type, .wl-year { display: none }
  .wl-arrow { grid-column: 3 }
  .wl-name { font-size: clamp(2rem, 9vw, 4rem) }

  /* Work preview hidden on mobile (no hover) */
  .work-preview { display: none }

  /* Studio */
  .studio-grid { grid-template-columns: 1fr }
  .studio-left { display: none }
  .studio-facts {
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  /* Services */
  .svc-item {
    grid-template-columns: 2.5rem 1fr;
    gap: 1rem;
  }
  .svc-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  /* CTA — email can wrap/overflow on mobile */
  .cta { overflow: visible }
  .cta-email {
    font-size: clamp(2.5rem, 11vw, 6rem);
    white-space: normal;
    word-break: break-all;
  }

  /* Footer */
  .footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

/* Tablet */
@media(min-width:601px) and (max-width:1024px){
  .intro {
    grid-template-columns: 1fr;
  }
  .intro-text { grid-column: 1 }
  .studio-grid { grid-template-columns: 1fr }
  .studio-left { display: none }
  .wl-name { font-size: clamp(2.5rem, 5.5vw, 5rem) }
}
```

- [ ] **Step 3: Take after screenshot to verify**

```
browser_take_screenshot: filename=mobile-after.png
```
Confirm: no overflow, no text collisions, no invisible content.

- [ ] **Step 4: Commit**

```bash
git add website/styles.css
git commit -m "fix: mobile layout — hero, intro, work, studio, cta all responsive"
```

---

## Task 8: Final Deploy + Verify

- [ ] **Step 1: Push all commits**

```bash
git push
```

- [ ] **Step 2: Get latest preview URL**

```bash
npx wrangler pages deployment list --project-name velocitydelivery 2>/dev/null | grep -m1 "seconds\|minute"
```

- [ ] **Step 3: Playwright desktop verify**

Check hero, intro, work hover (verify loading animation plays, screenshot reveals after 2.3s), CTA, footer.

- [ ] **Step 4: Playwright mobile verify (375px)**

```
browser_resize: 375 × 812
```
Check all sections on the preview URL.

- [ ] **Step 5: Playwright legal page verify**

Navigate to `/terms.html` and `/privacy.html` — confirm cursor circle and dot are visible.

---

## Open Question for User

**"Nano banana" model (Item 10):** Before I can use this API, I need:
1. The model's actual API endpoint/provider name
2. The API key (paste it in chat or check if it's already in the environment)
3. What you'd want the image to be (hero background? work section texture? something else?)
4. Whether to crop the Gemini watermark — if this is a Gemini model, I'd need to confirm the output image format and where the logo appears

**Mailto (Item 7):** The code `href="mailto:hello@calyvent.com"` is correct. If clicking it does nothing on your Mac, it means macOS has no default mail app configured. Fix: go to Mail.app → Preferences → General → Default email reader, set to Gmail or whichever you use. Not a code issue.

---

## Spec Coverage Check

| Requirement | Task |
|-------------|------|
| Real work previews with 2.3s loading | Task 3 |
| Legal page cursor | Task 4 |
| Mobile fixes | Task 7 |
| Luxury scroll | Task 5 |
| Slower preloader | Task 5 |
| Grain sweet spot | Task 6 |
| Mailto diagnosis | Noted — browser config issue |
| Calyvent replaces LinkDrop | Task 2 |
| Correct dates | Task 2 |
| Nano banana image | Deferred — needs clarification |
