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
});
