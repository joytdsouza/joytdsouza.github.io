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
  // Any element with class="media-frame" wrapping an <img> or <video> gets a
  // hover-reveal expand button automatically — no extra markup needed per image.
  // ========================================================================
  const expandIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';

  document.querySelectorAll('.media-frame').forEach((frame) => {
    const media = frame.querySelector('img, video');
    if (!media) return;

    const btn = document.createElement('button');
    btn.className = 'expand-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'View fullscreen');
    btn.innerHTML = expandIcon;
    frame.appendChild(btn);

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openLightbox(media);
    });
  });

  function openLightbox(media) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close fullscreen view');
    closeBtn.innerHTML = '&times;';

    let clone;
    if (media.tagName === 'VIDEO') {
      clone = document.createElement('video');
      const source = media.querySelector('source');
      clone.src = source ? source.src : media.currentSrc || media.src;
      clone.controls = true;
      clone.autoplay = true;
    } else {
      clone = document.createElement('img');
      clone.src = media.currentSrc || media.src;
      clone.alt = media.alt || '';
    }
    clone.className = 'lightbox-media';

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
});
