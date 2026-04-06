/* ============================================================
   ORKIN REDESIGN — JavaScript
   Handles: sticky header, mobile nav, form/modal, carousel,
   ZIP autocomplete, analytics placeholder
   ============================================================ */

(function () {
  'use strict';

  // ── ZIP AUTOCOMPLETE ──────────────────────────────────────
  const fakeZips = [
    { zip: '10001', city: 'New York, NY' },
    { zip: '30301', city: 'Atlanta, GA' },
    { zip: '60601', city: 'Chicago, IL' },
    { zip: '77001', city: 'Houston, TX' },
    { zip: '85001', city: 'Phoenix, AZ' },
    { zip: '19101', city: 'Philadelphia, PA' },
    { zip: '78201', city: 'San Antonio, TX' },
    { zip: '75201', city: 'Dallas, TX' },
    { zip: '32099', city: 'Jacksonville, FL' },
    { zip: '78401', city: 'Corpus Christi, TX' },
  ];

  function initZipAutocomplete(inputEl, dropdownEl) {
    if (!inputEl || !dropdownEl) return;
    inputEl.addEventListener('input', function () {
      const val = this.value.trim();
      dropdownEl.innerHTML = '';
      if (val.length < 2) { dropdownEl.style.display = 'none'; return; }
      const matches = fakeZips.filter(z => z.zip.startsWith(val) || z.city.toLowerCase().includes(val.toLowerCase()));
      if (!matches.length) { dropdownEl.style.display = 'none'; return; }
      matches.slice(0, 4).forEach(function (m) {
        const item = document.createElement('div');
        item.className = 'zip-suggestion';
        item.setAttribute('role', 'option');
        item.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> <strong>${m.zip}</strong>&nbsp;— ${m.city}`;
        item.addEventListener('mousedown', function (e) {
          e.preventDefault();
          inputEl.value = m.zip;
          dropdownEl.style.display = 'none';
        });
        dropdownEl.appendChild(item);
      });
      dropdownEl.style.display = 'block';
    });
    inputEl.addEventListener('blur', function () {
      setTimeout(function () { dropdownEl.style.display = 'none'; }, 150);
    });
  }

  // ── MODAL ─────────────────────────────────────────────────
  const modalOverlay = document.getElementById('quoteModal');
  const modalFormEl = document.getElementById('modalForm');
  const modalSuccessEl = document.getElementById('modalSuccess');
  const modalTitle = document.getElementById('modalServiceTitle');

  function openModal(serviceLabel) {
    if (!modalOverlay) return;
    if (modalFormEl) modalFormEl.style.display = '';
    if (modalSuccessEl) modalSuccessEl.style.display = 'none';
    if (modalTitle && serviceLabel) modalTitle.textContent = serviceLabel + ' — Free Quote';
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    const firstInput = modalOverlay.querySelector('input');
    if (firstInput) setTimeout(function () { firstInput.focus(); }, 100);
    // Analytics placeholder
    console.log('[Orkin Analytics] quote_modal_open', { service: serviceLabel || 'general', ts: Date.now() });
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Open modal from any .open-modal trigger
  document.querySelectorAll('[data-modal]').forEach(function (el) {
    el.addEventListener('click', function () {
      openModal(this.dataset.service || '');
    });
  });

  // Close on overlay click or close button
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) closeModal();
    });
  }
  document.querySelectorAll('.modal-close').forEach(function (btn) {
    btn.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  // ── FORM SUBMIT ───────────────────────────────────────────
  function handleFormSubmit(formEl, successCallback) {
    if (!formEl) return;
    formEl.addEventListener('submit', function (e) {
      e.preventDefault();
      const submitBtn = formEl.querySelector('[type="submit"]');
      if (submitBtn) { submitBtn.classList.add('loading'); submitBtn.disabled = true; }

      const data = {};
      new FormData(formEl).forEach(function (v, k) { data[k] = v; });
      console.log('[Orkin Analytics] form_submit', data);

      setTimeout(function () {
        if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.disabled = false; }
        formEl.reset();
        if (successCallback) successCallback();
      }, 1600);
    });
  }

  // Modal form
  const modalFormInner = document.getElementById('modalFormInner');
  handleFormSubmit(modalFormInner, function () {
    if (modalFormEl) modalFormEl.style.display = 'none';
    if (modalSuccessEl) modalSuccessEl.style.display = '';
    console.log('[Orkin Analytics] quote_submitted', { ts: Date.now() });
  });

  // Hero inline form
  const heroFormEl = document.getElementById('heroInlineForm');
  handleFormSubmit(heroFormEl, function () {
    openModal('');
    if (modalFormEl) modalFormEl.style.display = 'none';
    if (modalSuccessEl) modalSuccessEl.style.display = '';
  });

  // Mini forms in sections
  document.querySelectorAll('.mini-form-el').forEach(function (form) {
    handleFormSubmit(form, function () { openModal(''); if (modalFormEl) modalFormEl.style.display = 'none'; if (modalSuccessEl) modalSuccessEl.style.display = ''; });
  });

  // ── ZIP INPUTS ────────────────────────────────────────────
  initZipAutocomplete(
    document.getElementById('heroZip'),
    document.getElementById('heroZipDropdown')
  );
  initZipAutocomplete(
    document.getElementById('sectionZip'),
    document.getElementById('sectionZipDropdown')
  );
  initZipAutocomplete(
    document.getElementById('modalZip'),
    document.getElementById('modalZipDropdown')
  );

  // ── REVIEWS CAROUSEL ──────────────────────────────────────
  (function initCarousel() {
    const track = document.querySelector('.reviews-track');
    const dots = document.querySelectorAll('.review-dot');
    const prevBtn = document.getElementById('reviewPrev');
    const nextBtn = document.getElementById('reviewNext');
    const countEl = document.getElementById('reviewCount');
    if (!track) return;

    const slides = track.querySelectorAll('.review-slide');
    let current = 0;
    const total = slides.length;

    function goTo(idx) {
      current = (idx + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
      if (countEl) countEl.textContent = `${current + 1} / ${total}`;
      console.log('[Orkin Analytics] carousel_view', { slide: current + 1 });
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });
    dots.forEach(function (dot, i) { dot.addEventListener('click', function () { goTo(i); }); });

    // Auto-advance every 7 seconds
    let autoTimer = setInterval(function () { goTo(current + 1); }, 7000);
    track.addEventListener('mouseenter', function () { clearInterval(autoTimer); });
    track.addEventListener('mouseleave', function () { autoTimer = setInterval(function () { goTo(current + 1); }, 7000); });

    // Touch swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', function (e) { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) goTo(dx < 0 ? current + 1 : current - 1);
    }, { passive: true });

    goTo(0);
  })();

  // ── MOBILE NAV ────────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const mobileNavClose = document.getElementById('mobileNavClose');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      mobileNav.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (mobileNavClose) mobileNavClose.focus();
    });
  }
  if (mobileNavClose) {
    mobileNavClose.addEventListener('click', function () {
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // ── STICKY HEADER SHADOW ──────────────────────────────────
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.style.boxShadow = window.scrollY > 10
        ? '0 2px 20px rgba(0,0,0,0.4)'
        : '0 2px 12px rgba(0,0,0,0.3)';
    }, { passive: true });
  }

  // ── ZIP SEARCH BAR (section) ──────────────────────────────
  const zipForm = document.getElementById('zipSearchForm');
  if (zipForm) {
    zipForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const val = document.getElementById('sectionZip').value.trim();
      console.log('[Orkin Analytics] zip_search', { zip: val });
      openModal('');
    });
  }

  // ── LAZY LOAD IMAGES ──────────────────────────────────────
  if ('IntersectionObserver' in window) {
    const lazyImgs = document.querySelectorAll('img[data-src]');
    const imgObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    lazyImgs.forEach(function (img) { imgObserver.observe(img); });
  }

})();
