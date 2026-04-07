/* ═══════════════════════════════════════════
   EncodeIQ — Main JavaScript
   Canvas grid animation, scroll reveals,
   nav scroll awareness, dark mode toggle
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Dark Mode ──
  const root = document.documentElement;
  const toggleBtn = document.querySelector('[data-theme-toggle]');
  let theme = root.getAttribute('data-theme') || 'dark';

  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    theme = t;
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-label', 'Switch to ' + (t === 'dark' ? 'light' : 'dark') + ' mode');
      toggleBtn.innerHTML = t === 'dark'
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }
  }

  applyTheme(theme);
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => applyTheme(theme === 'dark' ? 'light' : 'dark'));
  }

  // ── Mobile menu ──
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      const isOpen = mobileMenu.classList.contains('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
      menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });
    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }

  // ── Scroll-aware nav ──
  const nav = document.getElementById('nav');
  let lastY = 0;
  function onScroll() {
    const y = window.scrollY;
    if (y > 60) nav.classList.add('nav--scrolled');
    else nav.classList.remove('nav--scrolled');
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Reveal on scroll ──
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger by index within parent
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = Math.min(idx * 80, 320) + 'ms';
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  // ── Hero Canvas — animated grid with "signal" effect ──
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, cols, rows, cells = [];
  const CELL = 40;       // grid cell size px
  const DOT = 1.5;       // dot radius
  const TRACE_SPEED = 3; // columns activated per frame
  let frame = 0;

  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;
    cols = Math.ceil(W / CELL) + 1;
    rows = Math.ceil(H / CELL) + 1;
    buildCells();
  }

  function buildCells() {
    cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push({
          x: c * CELL,
          y: r * CELL,
          base: Math.random(),       // base brightness
          active: 0,                 // 0–1 activation wave
          flash: 0,                  // short-lived flash
          row: r, col: c
        });
      }
    }
  }

  // Randomly fire a "signal trace" (column strip that lights up)
  let traces = [];
  function spawnTrace() {
    const col = Math.floor(Math.random() * cols);
    traces.push({ col, progress: 0, speed: 0.04 + Math.random() * 0.04 });
  }

  // Color based on theme
  function getColors() {
    const isDark = root.getAttribute('data-theme') !== 'light';
    return {
      dot:    isDark ? 'rgba(0, 207, 232, '   : 'rgba(0, 153, 187, ',
      grid:   isDark ? 'rgba(30, 42, 56, 0.5)' : 'rgba(180, 200, 220, 0.3)',
      glow:   isDark ? 'rgba(0, 207, 232, '    : 'rgba(0, 153, 187, ',
    };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const colors = getColors();
    const isDark = root.getAttribute('data-theme') !== 'light';

    // Grid lines (subtle)
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 0.5;
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL, 0);
      ctx.lineTo(c * CELL, H);
      ctx.stroke();
    }
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL);
      ctx.lineTo(W, r * CELL);
      ctx.stroke();
    }

    // Update traces
    traces = traces.filter(t => t.progress <= 1.1);
    traces.forEach(t => { t.progress += t.speed; });

    // Activate cells from traces
    cells.forEach(cell => {
      traces.forEach(t => {
        if (cell.col === t.col) {
          const rowFrac = cell.row / rows;
          const dist = Math.abs(rowFrac - t.progress);
          if (dist < 0.15) {
            cell.active = Math.max(cell.active, 1 - dist / 0.15);
          }
        }
      });
      cell.active *= 0.93; // decay
    });

    // Draw dots at intersections
    cells.forEach(cell => {
      const brightness = cell.base * 0.15 + cell.active * 0.85;
      if (brightness < 0.01) return;

      const alpha = brightness * (isDark ? 0.9 : 0.6);
      const radius = DOT + cell.active * 1.5;

      if (cell.active > 0.3) {
        // Glow halo
        const grad = ctx.createRadialGradient(cell.x, cell.y, 0, cell.x, cell.y, 12);
        grad.addColorStop(0, colors.glow + (alpha * 0.4) + ')');
        grad.addColorStop(1, colors.glow + '0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cell.x, cell.y, 12, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = colors.dot + alpha + ')';
      ctx.beginPath();
      ctx.arc(cell.x, cell.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    frame++;
    // Spawn new traces periodically
    if (frame % 35 === 0 && traces.length < 8) spawnTrace();
    if (frame % 90 === 0) spawnTrace(); // occasional extra pulse

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  // Kick off a few initial traces
  for (let i = 0; i < 3; i++) setTimeout(spawnTrace, i * 400);
  draw();

  // Redraw on theme change to pick up new colors
  const themeObs = new MutationObserver(() => {});
  themeObs.observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  // ── CTA form ──
  window.handleSubmit = function (e) {
    e.preventDefault();
    const form = document.getElementById('ctaForm');
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Thanks! We\'ll be in touch.';
    btn.disabled = true;
    form.querySelector('input').disabled = true;
  };

})();
