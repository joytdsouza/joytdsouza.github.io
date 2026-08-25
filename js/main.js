// ==========================================================================
// Mobile nav toggle + active-link highlighting
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
    });

    links.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => links.classList.remove('open'));
    });
  }

  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ========================================================================
  // Fullscreen media viewer
  // Any element with class="media-frame" wrapping an <img>, <video>, or
  // <object> (PDF embed) gets a hover-reveal expand button automatically —
  // no extra markup needed per item. A "cad-viewer" element (interactive
  // three.js STL model) is treated as its own frame and reparented into the
  // lightbox live, so you can keep rotating/zooming/panning it fullscreen.
  // ========================================================================
  const expandIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';

  document.querySelectorAll('.media-frame').forEach((frame) => {
    if (frame.classList.contains('slideshow')) {
      setupSlideshow(frame);
      return;
    }

    const isCadViewer = frame.classList.contains('cad-viewer');
    const media = isCadViewer ? null : frame.querySelector('img, video, object, iframe');
    if (!media && !isCadViewer) return;

    const btn = document.createElement('button');
    btn.className = 'expand-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'View fullscreen');
    btn.innerHTML = expandIcon;
    frame.appendChild(btn);

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isCadViewer) {
        openCadLightbox(frame);
      } else {
        openLightbox(media);
      }
    });
  });

  // ========================================================================
  // Slideshow — a <div class="media-frame slideshow"> holding several
  // <div class="slide">...</div> children (any mix of img / video /
  // .cad-viewer / iframe / PDF .doc-embed-wrap). Only one slide is shown at
  // a time; prev/next buttons step through with wraparound, a counter badge
  // shows position, and the existing fullscreen button expands whichever
  // slide is currently active (reusing openLightbox/openCadLightbox exactly
  // as a single-media frame would). See README.md for the markup pattern.
  // ========================================================================
  const prevIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';
  const nextIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';

  function setupSlideshow(frame) {
    const slides = Array.from(frame.querySelectorAll(':scope > .slide'));
    if (slides.length === 0) return;

    let index = slides.findIndex((s) => s.classList.contains('active'));
    if (index === -1) index = 0;

    const counter = document.createElement('div');
    counter.className = 'slide-counter';
    frame.appendChild(counter);

    function activeMedia() {
      const slide = slides[index];
      const cad = slide.querySelector('.cad-viewer');
      if (cad) return { isCadViewer: true, el: cad };
      return { isCadViewer: false, el: slide.querySelector('img, video, object, iframe') };
    }

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, si) => s.classList.toggle('active', si === index));
      counter.textContent = (index + 1) + ' / ' + slides.length;
    }

    if (slides.length > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.className = 'slide-nav slide-prev';
      prevBtn.type = 'button';
      prevBtn.setAttribute('aria-label', 'Previous');
      prevBtn.innerHTML = prevIcon;

      const nextBtn = document.createElement('button');
      nextBtn.className = 'slide-nav slide-next';
      nextBtn.type = 'button';
      nextBtn.setAttribute('aria-label', 'Next');
      nextBtn.innerHTML = nextIcon;

      prevBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); show(index - 1); });
      nextBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); show(index + 1); });

      frame.appendChild(prevBtn);
      frame.appendChild(nextBtn);
      frame.setAttribute('tabindex', '0');
      frame.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') show(index - 1);
        if (e.key === 'ArrowRight') show(index + 1);
      });
    }

    const expandBtn = document.createElement('button');
    expandBtn.className = 'expand-btn';
    expandBtn.type = 'button';
    expandBtn.setAttribute('aria-label', 'View fullscreen');
    expandBtn.innerHTML = expandIcon;
    expandBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const current = activeMedia();
      if (current.isCadViewer) {
        openCadLightbox(current.el);
      } else if (current.el) {
        openLightbox(current.el);
      }
    });
    frame.appendChild(expandBtn);

    show(index);
  }

  function buildOverlayShell() {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close fullscreen view');
    closeBtn.innerHTML = '&times;';

    return { overlay, closeBtn };
  }

  function openLightbox(media) {
    const { overlay, closeBtn } = buildOverlayShell();

    let clone;
    if (media.tagName === 'VIDEO') {
      clone = document.createElement('video');
      const source = media.querySelector('source');
      clone.src = source ? source.src : media.currentSrc || media.src;
      clone.controls = true;
      clone.autoplay = true;
      clone.className = 'lightbox-media';
    } else if (media.tagName === 'OBJECT') {
      clone = media.cloneNode(true);
      clone.className = 'lightbox-media lightbox-pdf';
    } else if (media.tagName === 'IFRAME') {
      clone = document.createElement('iframe');
      clone.src = media.src;
      clone.setAttribute('allowfullscreen', '');
      clone.className = 'lightbox-media lightbox-iframe';
    } else {
      clone = document.createElement('img');
      clone.src = media.currentSrc || media.src;
      clone.alt = media.alt || '';
      clone.className = 'lightbox-media';
    }

    overlay.appendChild(clone);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    function close() {
      overlay.remove();
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeydown);
    }

    function onKeydown(e) {
      if (e.key === 'Escape') close();
    }

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', onKeydown);
  }

  // Reparents the live .cad-viewer element (canvas, renderer, controls and
  // all) into the lightbox so the model stays fully interactive fullscreen,
  // then moves it back to its original spot on close. Relies on the
  // ResizeObserver set up in cad-viewer.js to resize the renderer when the
  // container's size changes.
  function openCadLightbox(container) {
    const { overlay, closeBtn } = buildOverlayShell();

    const wrap = document.createElement('div');
    wrap.className = 'lightbox-cad-wrap';

    const originalParent = container.parentNode;
    const originalNext = container.nextSibling;

    wrap.appendChild(container);
    container.classList.add('lightbox-cad-active');

    overlay.appendChild(wrap);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    function close() {
      container.classList.remove('lightbox-cad-active');
      if (originalNext) {
        originalParent.insertBefore(container, originalNext);
      } else {
        originalParent.appendChild(container);
      }
      overlay.remove();
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeydown);
    }

    function onKeydown(e) {
      if (e.key === 'Escape') close();
    }

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', onKeydown);
  }

  // ========================================================================
  // Projects page filter — a single "Filter" button opens a dropdown menu
  // of options; picking one filters which .project-entry blocks are shown,
  // based on each entry's data-category attribute ("class", "club",
  // "personal", "research").
  // ========================================================================
  const filterDropdown = document.querySelector('.filter-dropdown');
  if (filterDropdown) {
    const toggle = filterDropdown.querySelector('.filter-toggle');
    const toggleLabel = filterDropdown.querySelector('.filter-toggle-label');
    const menu = filterDropdown.querySelector('.filter-menu');
    const options = filterDropdown.querySelectorAll('.filter-option');
    const entries = document.querySelectorAll('.project-entry');
    const emptyMsg = document.querySelector('.filter-empty');

    // Marks whichever entry is currently the first VISIBLE one with
    // .first-visible (see .project-entry.first-visible in style.css) so the
    // gap under the filter is identical no matter which filter is active —
    // instead of relying on DOM order via :first-of-type, which only ever
    // matched the literal first entry in the markup.
    function markFirstVisible() {
      let found = false;
      entries.forEach((entry) => {
        const isFirst = !found && !entry.classList.contains('filtered-out');
        entry.classList.toggle('first-visible', isFirst);
        if (isFirst) found = true;
      });
    }

    function closeMenu() {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    function openMenu() {
      menu.classList.add('open');
      toggle.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
    }

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (menu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    options.forEach((option) => {
      option.addEventListener('click', () => {
        options.forEach((o) => o.classList.remove('active'));
        option.classList.add('active');
        if (toggleLabel) toggleLabel.textContent = 'Filter: ' + option.textContent;

        const filter = option.getAttribute('data-filter');
        let visibleCount = 0;

        entries.forEach((entry) => {
          const category = entry.getAttribute('data-category');
          const show = filter === 'all' || category === filter;
          entry.classList.toggle('filtered-out', !show);
          if (show) visibleCount++;
        });

        markFirstVisible();
        if (emptyMsg) emptyMsg.classList.toggle('visible', visibleCount === 0);
        closeMenu();
      });
    });

    document.addEventListener('click', (e) => {
      if (!filterDropdown.contains(e.target)) closeMenu();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    markFirstVisible();
  }

  // ========================================================================
  // Skills sync — a project detail page's Skills come from projects.html,
  // not its own markup. Each project card on projects.html has a "Learn
  // More" link pointing at this exact detail page; we fetch projects.html,
  // find the card whose link matches the current filename, and copy that
  // card's .skill-tags into this page's .skill-tags. Edit skills in exactly
  // one place — projects.html — and every detail page stays in sync
  // automatically. If the fetch fails (e.g. opening the file directly
  // instead of through a server) the page's own existing skill tags stay as
  // a fallback, so nothing breaks.
  // ========================================================================
  const localSkillTags = document.querySelector('.skill-tags-wrap .skill-tags');
  const isDetailPage = document.querySelector('.detail-header') && localSkillTags;
  if (isDetailPage) {
    const currentFile = window.location.pathname.split('/').pop();
    fetch('projects.html')
      .then((res) => res.text())
      .then((html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const match = Array.from(doc.querySelectorAll('.project-entry')).find((entry) => {
          const link = entry.querySelector('a[href$=".html"]');
          return link && link.getAttribute('href') === currentFile;
        });
        const sourceTags = match && match.querySelector('.skill-tags');
        if (sourceTags) localSkillTags.innerHTML = sourceTags.innerHTML;
      })
      .catch(() => { /* keep existing tags as fallback */ });
  }
});
