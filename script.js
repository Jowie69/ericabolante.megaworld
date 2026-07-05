/* ==========================================================================
   ERICA BOLANTE — Site Interactions
   Features: dark/light theme, native dialog modal popups, clean scroll entry fades
   ========================================================================== */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────────
     Theme Management (Dark / Light Mode)
     ───────────────────────────────────────────────────────────────────── */
  function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    // Determine current theme: localStorage first, then system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    // Apply initial theme
    document.documentElement.setAttribute('data-theme', initialTheme);

    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  /* ─────────────────────────────────────────────────────────────────────
     Header Scroll Behaviour
     ───────────────────────────────────────────────────────────────────── */
  function initHeaderScroll() {
    const header = document.getElementById('siteHeader');
    if (!header) return;
    
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    };
    
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ─────────────────────────────────────────────────────────────────────
     Mobile Navigation Toggle
     ───────────────────────────────────────────────────────────────────── */
  function initNavToggle() {
    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('mainNav');
    if (!toggle || !nav) return;

    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    };

    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setOpen(false));
    });
  }

  /* ─────────────────────────────────────────────────────────────────────
     Scroll Reveal (Minimalist Entry Animations)
     ───────────────────────────────────────────────────────────────────── */
  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (items.length === 0) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('in-view'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // Slight delay stagger for clustered items
            entry.target.style.transitionDelay = `${(i % 3) * 60}ms`;
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    items.forEach(el => observer.observe(el));
  }

  /* ─────────────────────────────────────────────────────────────────────
     Native Dialog Helper for Light Dismiss Fallback
     ───────────────────────────────────────────────────────────────────── */
  function setupLightDismissFallback(dialog) {
    if (!dialog) return;

    // Fallback for browsers that do not support the declarative closedby="any" attribute
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', (event) => {
        // Ignore clicks inside the dialog frame itself
        if (event.target !== dialog) return;

        // Check if click occurred outside the dialog content box
        const rect = dialog.getBoundingClientRect();
        const isOutside = (
          event.clientY < rect.top ||
          event.clientY > rect.bottom ||
          event.clientX < rect.left ||
          event.clientX > rect.right
        );

        if (isOutside) {
          dialog.close();
        }
      });
    }
  }

  /* ─────────────────────────────────────────────────────────────────────
     Property Detail Dialog Manager
     ───────────────────────────────────────────────────────────────────── */
  function initPropertyDialog() {
    const dialog = document.getElementById('propModal');
    if (!dialog) return;

    const closeBtn = document.getElementById('propModalClose');
    const modalImg = document.getElementById('propModalImg');
    const modalTitle = document.getElementById('propModalTitle');
    const modalLocation = document.getElementById('propModalLocation');
    const modalStatus = document.getElementById('propModalStatus');
    const modalSpecs = document.getElementById('propModalSpecs');
    const modalFeatures = document.getElementById('propModalFeatures');
    const modalCta = document.getElementById('propModalCta');

    // Configure fallback for light-dismiss clicks on backdrop
    setupLightDismissFallback(dialog);

    function openDialog(triggerEl) {
      const type = triggerEl.dataset.modal;
      const img = triggerEl.dataset.img || '';
      const title = triggerEl.dataset.title || '';
      const location = triggerEl.dataset.location || '';
      const status = triggerEl.dataset.status || '';
      const features = triggerEl.dataset.features || '';

      // Populate basic info
      if (modalImg) {
        modalImg.src = img;
        modalImg.alt = title;
      }
      if (modalTitle) modalTitle.textContent = title;
      if (modalLocation) modalLocation.textContent = location;
      if (modalStatus) modalStatus.textContent = status;

      // Populate specs grid
      let specsHTML = '';
      if (type === 'gallery') {
        specsHTML = `
          <div class="prop-spec-item">
            <span class="prop-spec-label">Unit Type</span>
            <span class="prop-spec-value">${triggerEl.dataset.type || '—'}</span>
          </div>
          <div class="prop-spec-item">
            <span class="prop-spec-label">Floor Area</span>
            <span class="prop-spec-value">${triggerEl.dataset.size || '—'}</span>
          </div>
          <div class="prop-spec-item">
            <span class="prop-spec-label">Price Range</span>
            <span class="prop-spec-value">${triggerEl.dataset.price || '—'}</span>
          </div>
          <div class="prop-spec-item">
            <span class="prop-spec-label">Availability</span>
            <span class="prop-spec-value">${status}</span>
          </div>
        `;
      } else if (type === 'residence') {
        specsHTML = `
          <div class="prop-spec-item">
            <span class="prop-spec-label">Unit Types</span>
            <span class="prop-spec-value">${triggerEl.dataset.types || '—'}</span>
          </div>
          <div class="prop-spec-item">
            <span class="prop-spec-label">Starting Price</span>
            <span class="prop-spec-value">${triggerEl.dataset.price || '—'}</span>
          </div>
          <div class="prop-spec-item">
            <span class="prop-spec-label">Status</span>
            <span class="prop-spec-value">${status}</span>
          </div>
          <div class="prop-spec-item">
            <span class="prop-spec-label">Location</span>
            <span class="prop-spec-value">${location}</span>
          </div>
        `;
      }
      if (modalSpecs) modalSpecs.innerHTML = specsHTML;

      // Populate features/highlights
      const featArr = type === 'gallery'
        ? (features ? features.split(',') : [])
        : (triggerEl.dataset.highlights ? triggerEl.dataset.highlights.split('|') : []);

      if (modalFeatures) {
        if (featArr.length > 0) {
          const desc = type === 'residence' ? `<p style="font-size:0.93rem;color:var(--text-secondary);font-weight:300;line-height:1.7;margin:0 0 20px;">${triggerEl.dataset.desc || ''}</p>` : '';
          const list = `<ul class="prop-feature-list">${featArr.map(f => `<li>${f.trim()}</li>`).join('')}</ul>`;
          modalFeatures.innerHTML = `${desc}<h4>${type === 'gallery' ? 'Key Features' : 'Township Highlights'}</h4>${list}`;
        } else {
          modalFeatures.innerHTML = '';
        }
      }

      // Show native modal dialog (manages focus trap and Esc key dismissal)
      dialog.showModal();
      document.body.style.overflow = 'hidden';

      // Attach anchor navigation close behavior
      if (modalCta) {
        modalCta.onclick = () => {
          dialog.close();
        };
      }
    }

    // Attach click events to triggers
    document.querySelectorAll('[data-modal="gallery"]').forEach(el => {
      el.addEventListener('click', () => openDialog(el));
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDialog(el);
        }
      });
    });

    document.querySelectorAll('[data-modal="residence"]').forEach(el => {
      el.addEventListener('click', () => openDialog(el));
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDialog(el);
        }
      });
    });

    // Close bindings
    closeBtn && closeBtn.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      document.body.style.overflow = '';
    });
  }

  /* ─────────────────────────────────────────────────────────────────────
     Offer Dialog Manager (Editorial prompt displayed on session start)
     ───────────────────────────────────────────────────────────────────── */
  function initOfferDialog() {
    const dialog = document.getElementById('offerModal');
    if (!dialog) return;

    const closeBtn = document.getElementById('modalClose');
    const dismissBtn = document.getElementById('modalDismiss');
    const cta = document.getElementById('modalCta');
    const STORAGE_KEY = 'ecb_offer_dialog_shown';

    setupLightDismissFallback(dialog);

    const show = () => {
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      dialog.close();
      try {
        sessionStorage.setItem(STORAGE_KEY, '1');
      } catch (e) {}
    };

    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) {}

    if (!alreadyShown) {
      // Show the offer 8 seconds after page load (less intrusive)
      window.setTimeout(show, 8000);
    }

    closeBtn && closeBtn.addEventListener('click', close);
    dismissBtn && dismissBtn.addEventListener('click', close);
    cta && cta.addEventListener('click', close);
    dialog.addEventListener('close', () => {
      document.body.style.overflow = '';
      try {
        sessionStorage.setItem(STORAGE_KEY, '1');
      } catch (e) {}
    });
  }

  /* ─────────────────────────────────────────────────────────────────────
     Contact Form Submission Status
     ───────────────────────────────────────────────────────────────────── */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    if (!form || !status) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const name = form.querySelector('[name="name"]').value.trim();
      const firstName = name ? name.split(' ')[0] : 'there';
      
      status.textContent = `Thank you, ${firstName}! Erica will follow up personally within one business day.`;
      form.reset();
      
      setTimeout(() => {
        status.textContent = '';
      }, 6000);
    });
  }

  /* ─────────────────────────────────────────────────────────────────────
     Footer Copyright Date Setter
     ───────────────────────────────────────────────────────────────────── */
  function setCopyrightYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ─────────────────────────────────────────────────────────────────────
     Initialization on DOM Ready
     ───────────────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initHeaderScroll();
    initNavToggle();
    initReveal();
    initPropertyDialog();
    initOfferDialog();
    initContactForm();
    setCopyrightYear();
  });

})();
