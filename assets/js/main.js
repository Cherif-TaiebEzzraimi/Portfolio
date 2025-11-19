/* Main interactions: intersection reveals, scroll progress */
(function () {
  const html = document.documentElement;
  html.setAttribute('data-theme', 'dark');

  // Mobile Nav Toggle
  const navToggle = document.getElementById('nav-toggle');
  const navList = document.getElementById('nav-list');
  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const open = navList.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navList.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navList.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  // IntersectionObserver for reveal animations
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        // If this reveal is a skill card, animate its inner bar to the data-level value
        try {
          if (e.target.classList.contains('skill-card')) {
            const level = parseInt(e.target.dataset.level, 10) || 0;
            const bar = e.target.querySelector('.skill-bar span');
            if (bar) {
              // Use CSS transition defined in stylesheet for smooth animation
              // Ensure initial width is 0 then set to target percent
              bar.style.width = '0%';
              // small timeout to guarantee transition (avoid synchronous layout collapse)
              requestAnimationFrame(() => { bar.style.width = `${level}%`; });
            }
          }
        } catch (err) {
          // swallow any errors to avoid breaking reveal flow
          console.error('Skill bar animation error', err);
        }
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.2 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Scroll progress bar + Active nav link (optimized)
  const scrollProgress = document.querySelector('.scroll-progress span');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-list a');

  // Cache section offsets and update on resize
  const docEl = document.documentElement;
  let sectionOffsets = Array.from(sections).map(s => s.offsetTop);
  function recalcOffsets() {
    sectionOffsets = Array.from(sections).map(s => s.offsetTop);
  }
  // Recalculate on resize (passive)
  window.addEventListener('resize', recalcOffsets, { passive: true });
  // Initial calc
  recalcOffsets();

  // Update scroll progress in a rAF-friendly way
  function updateScrollProgress() {
    if (!scrollProgress) return;
    const scrollable = docEl.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const progress = scrollable > 0 ? (scrolled / scrollable) * 100 : 0;
    scrollProgress.style.width = `${progress}%`;
  }

  // Optimized changeNav using cached offsets
  function changeNav(offsets) {
    let index = sections.length;
    while (--index && window.scrollY + 100 < offsets[index]) {}
    navLinks.forEach((link) => link.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-list a[href="#${sections[index].id}"]`);
    if (activeLink) activeLink.classList.add('active');
  }

  // Single scroll handler that uses requestAnimationFrame and a passive listener
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateScrollProgress();
        changeNav(sectionOffsets);
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  // initial update
  updateScrollProgress();
  changeNav(sectionOffsets);

  // Footer year
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Project galleries: simple data-driven gallery per project
  const galleries = document.querySelectorAll('.project-gallery');
  galleries.forEach(g => {
    const project = g.dataset.project || '';
    const imagesAttr = g.dataset.images || '';
    const captionsAttr = g.dataset.captions || '';
    const imageList = imagesAttr.split(',').map(s => s.trim()).filter(Boolean);
    const captionList = captionsAttr.split('|').map(s => s.trim());
    const stageImg = g.querySelector('.gallery-stage img');
    const captionEl = g.querySelector('.gallery-caption');
    const prevBtn = g.querySelector('.gallery-btn.prev');
    const nextBtn = g.querySelector('.gallery-btn.next');
    let idx = 0;

    function updateGallery() {
      const src = imageList[idx] ? `assets/images/projects/${project}/${imageList[idx]}` : stageImg.getAttribute('src');
      stageImg.src = encodeURI(src);
      captionEl.textContent = captionList[idx] || captionEl.textContent || '';
      // Fix orientation for known rotated images (display-only)
      if (project === 'server-monitor' && idx === 0) {
        stageImg.classList.add('rotated');
      } else {
        stageImg.classList.remove('rotated');
      }
    }

    if (prevBtn) prevBtn.addEventListener('click', () => {
      idx = (idx - 1 + Math.max(imageList.length,1)) % Math.max(imageList.length,1);
      updateGallery();
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
      idx = (idx + 1) % Math.max(imageList.length,1);
      updateGallery();
    });

    // keyboard support when gallery is focused
    g.tabIndex = 0;
    g.addEventListener('keydown', (ev) => {
      if (ev.key === 'ArrowLeft') prevBtn.click();
      if (ev.key === 'ArrowRight') nextBtn.click();
    });

    // initial update
    updateGallery();
    // fullscreen modal preview
    function openModal() {
      let modal = document.querySelector('.gallery-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.className = 'gallery-modal';
        modal.innerHTML = `
          <div class="modal-stage">
            <img src="" alt="" />
            <div class="modal-caption"></div>
          </div>
          <button class="modal-close" aria-label="Close">✕</button>
          <div class="modal-nav">
            <button class="modal-prev" aria-label="Previous">‹</button>
            <button class="modal-next" aria-label="Next">›</button>
          </div>`;
        document.body.appendChild(modal);
      }
      const modalImg = modal.querySelector('img');
      const modalCaption = modal.querySelector('.modal-caption');
      const modalPrev = modal.querySelector('.modal-prev');
      const modalNext = modal.querySelector('.modal-next');
      const modalClose = modal.querySelector('.modal-close');

      function setModal() {
        modalImg.src = encodeURI(`assets/images/projects/${project}/${imageList[idx]}`);
        modalCaption.textContent = captionList[idx] || '';
        // Apply same rotated class inside modal for consistency
        if (project === 'server-monitor' && idx === 0) {
          modalImg.classList.add('rotated');
        } else {
          modalImg.classList.remove('rotated');
        }
      }
      setModal();
      modal.classList.add('open');

      modalPrev.onclick = () => { idx = (idx - 1 + imageList.length) % imageList.length; setModal(); };
      modalNext.onclick = () => { idx = (idx + 1) % imageList.length; setModal(); };
      modalClose.onclick = () => { modal.classList.remove('open'); };
      modal.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape') modal.classList.remove('open');
        if (ev.key === 'ArrowLeft') modalPrev.click();
        if (ev.key === 'ArrowRight') modalNext.click();
      });
      modal.tabIndex = 0;
      modal.focus();
    }

    const stage = g.querySelector('.gallery-stage');
    if (stage) stage.addEventListener('click', () => openModal());
  });
})();
