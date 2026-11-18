/* trexito.com · interaction layer
   Motion (motion.dev) for spring physics, Lenis for inertial scroll.
   Every effect is optional: without JS, or with reduced motion, the page is
   fully visible and static. */
(function () {
  'use strict';
  window.__appReady = true;
  var root = document.documentElement;
  var M = window.Motion;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var springy = { type: 'spring', visualDuration: 0.7, bounce: 0.18 };

  if (!M || reduce) { root.classList.remove('js-motion'); }

  /* ---------- inertial scroll ---------- */
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ autoRaf: true, lerp: 0.1, anchors: { offset: -16 } });
  }

  /* ---------- reveal on view ---------- */
  if (M && !reduce) {
    var groups = new Map();
    document.querySelectorAll('[data-rise]').forEach(function (el) {
      var g = el.closest('[data-stagger]') || el.parentElement;
      var n = groups.get(g) || 0; groups.set(g, n + 1);
      el.__d = Number(el.dataset.d || n) * 0.075;
      // glass must not be filtered (it would drop its backdrop), text may blur in
      var soft = el.dataset.rise === 'soft';
      M.inView(el, function () {
        var from = { opacity: [0, 1], y: [soft ? 14 : 26, 0], scale: [soft ? 1 : 0.965, 1] };
        if (soft) from.filter = ['blur(8px)', 'blur(0px)'];
        M.animate(el, from, Object.assign({ delay: el.__d }, springy, {
          opacity: { duration: 0.6, delay: el.__d, ease: [0.32, 0.72, 0, 1] },
          filter: { duration: 0.7, delay: el.__d, ease: [0.32, 0.72, 0, 1] }
        })).then(function () { if (soft) el.style.filter = ''; });
      }, { amount: 0.15 });
    });
  }

  /* ---------- counters ---------- */
  function fmt(v, dec) {
    return v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var to = parseFloat(el.dataset.count), dec = Number(el.dataset.dec || 0);
    var pre = el.dataset.pre || '', suf = el.dataset.suf || '';
    if (!M || reduce) return;
    el.textContent = pre + fmt(0, dec) + suf;
    M.inView(el, function () {
      M.animate(0, to, {
        duration: 1.8, delay: 0.15, ease: [0.16, 1, 0.3, 1],
        onUpdate: function (v) { el.textContent = pre + fmt(v, dec) + suf; }
      });
    }, { amount: 0.6 });
  });

  /* ---------- pointer light on glass ---------- */
  if (fine) {
    var lit = null, px = 0, py = 0, queued = false;
    document.addEventListener('pointermove', function (e) {
      lit = e.target.closest && e.target.closest('.lit'); px = e.clientX; py = e.clientY;
      if (lit && !queued) {
        queued = true;
        requestAnimationFrame(function () {
          queued = false; if (!lit) return;
          var r = lit.getBoundingClientRect();
          lit.style.setProperty('--mx', (px - r.left) + 'px');
          lit.style.setProperty('--my', (py - r.top) + 'px');
        });
      }
    }, { passive: true });
  }

  /* ---------- poster depth (desktop) ---------- */
  var poster = document.querySelector('.poster');
  if (poster && M && fine && !reduce) {
    var av = poster.querySelector('.avatar');
    var soft = { type: 'spring', stiffness: 160, damping: 22, mass: 0.6 };
    poster.addEventListener('pointermove', function (e) {
      var r = poster.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      M.animate(poster, { rotateY: nx * 6, rotateX: -ny * 6, transformPerspective: 1200 }, soft);
      if (av) M.animate(av, { x: nx * 10, y: ny * 10 }, soft);
    });
    poster.addEventListener('pointerleave', function () {
      M.animate(poster, { rotateY: 0, rotateX: 0 }, { type: 'spring', visualDuration: 0.8, bounce: 0.3 });
      if (av) M.animate(av, { x: 0, y: 0 }, { type: 'spring', visualDuration: 0.8, bounce: 0.3 });
    });
  }

  /* ---------- story cover parallax ---------- */
  if (M && !reduce) {
    document.querySelectorAll('[data-parallax]').forEach(function (box) {
      var img = box.querySelector('img'); if (!img) return;
      M.scroll(M.animate(img, { scale: [1.12, 1], y: ['-3%', '0%'] }, { ease: 'linear' }),
        { target: box, offset: ['start end', 'end end'] });
    });
  }

  /* ---------- tab bar ---------- */
  var dock = document.querySelector('.dock');
  if (dock) {
    var lens = dock.querySelector('.lens');
    var links = Array.prototype.slice.call(dock.querySelectorAll('a[data-sec]'));
    var targets = links.map(function (a) { return document.getElementById(a.dataset.sec); });
    var current = null;

    function place(a, instant) {
      if (!lens) return;
      var props = { x: a.offsetLeft, width: a.offsetWidth, opacity: 1 };
      if (!M || reduce || instant) {
        lens.style.transform = 'translateX(' + props.x + 'px)';
        lens.style.width = props.width + 'px'; lens.style.opacity = 1; return;
      }
      M.animate(lens, props, { type: 'spring', visualDuration: 0.5, bounce: 0.24 });
      // the lens squashes while it travels, then settles
      M.animate(lens, { scaleY: [1, 0.84, 1], scaleX: [1, 1.12, 1] }, { duration: 0.5, ease: [0.32, 0.72, 0, 1] });
    }
    function setActive(i, instant) {
      if (i === current) return;
      links.forEach(function (a, j) { a.setAttribute('aria-current', j === i ? 'true' : 'false'); });
      if (links[i]) place(links[i], instant || current === null);
      current = i;
    }
    function pick() {
      var line = innerHeight * 0.4, idx = 0;
      targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= line) idx = i; });
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) idx = targets.length - 1;
      setActive(idx);
    }

    var lastY = scrollY, ticking = false;
    function onScroll() {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        ticking = false; pick();
        var y = scrollY;
        if (y > lastY + 8 && y > 260) dock.classList.add('mini');
        else if (y < lastY - 8 || y < 120) dock.classList.remove('mini');
        lastY = y;
      });
    }
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', function () { if (links[current]) place(links[current], true); });
    if (links.length) { pick(); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (links[current]) place(links[current], true); });

    links.forEach(function (a, i) {
      a.addEventListener('click', function () { setActive(i); dock.classList.remove('mini'); });
    });
    dock.addEventListener('pointerenter', function () { dock.classList.remove('mini'); });

    /* real refraction at the rim: Chromium only (backdrop-filter:url()) */
    var brands = navigator.userAgentData && navigator.userAgentData.brands;
    var chromium = !!(brands && brands.some(function (b) { return /Chromium/.test(b.brand); }));
    if (chromium && !matchMedia('(prefers-reduced-transparency: reduce)').matches) {
      refract(dock, 'lg-dock', { bezel: 22, scale: 46, blur: 5 });
    }
  }

  function refract(el, id, o) {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.setAttribute('aria-hidden', 'true');
    svg.style.position = 'absolute';
    var f = document.createElementNS(NS, 'filter');
    f.setAttribute('id', id); f.setAttribute('filterUnits', 'userSpaceOnUse');
    f.setAttribute('color-interpolation-filters', 'sRGB');
    var img = document.createElementNS(NS, 'feImage');
    img.setAttribute('result', 'map'); img.setAttribute('preserveAspectRatio', 'none');
    var dm = document.createElementNS(NS, 'feDisplacementMap');
    dm.setAttribute('in', 'SourceGraphic'); dm.setAttribute('in2', 'map');
    dm.setAttribute('scale', String(o.scale));
    dm.setAttribute('xChannelSelector', 'R'); dm.setAttribute('yChannelSelector', 'G');
    f.appendChild(img); f.appendChild(dm); svg.appendChild(f); document.body.appendChild(svg);

    function build() {
      var w = el.offsetWidth, h = el.offsetHeight; if (!w || !h) return;
      var r = Math.min(h / 2, w / 2), bezel = Math.min(o.bezel, r);
      var c = document.createElement('canvas'); c.width = w; c.height = h;
      var ctx = c.getContext('2d'), im = ctx.createImageData(w, h), d = im.data;
      var cx = w / 2, cy = h / 2, hx = cx - r, hy = cy - r;
      for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
          var dx = x + 0.5 - cx, dy = y + 0.5 - cy;
          var qx = Math.abs(dx) - hx, qy = Math.abs(dy) - hy, dist, nx, ny;
          if (qx > 0 && qy > 0) { var l = Math.hypot(qx, qy) || 1; dist = r - l; nx = qx / l; ny = qy / l; }
          else if (qx > qy) { dist = r - qx; nx = 1; ny = 0; }
          else { dist = r - qy; nx = 0; ny = 1; }
          nx *= dx < 0 ? -1 : 1; ny *= dy < 0 ? -1 : 1;
          var s = 0;
          if (dist < bezel) { var t = 1 - Math.max(dist, 0) / bezel; s = 1 - Math.sqrt(Math.max(0, 1 - t * t)); }
          var k = (y * w + x) * 4;
          d[k] = 128 - nx * s * 127; d[k + 1] = 128 - ny * s * 127; d[k + 2] = 128; d[k + 3] = 255;
        }
      }
      ctx.putImageData(im, 0, 0);
      f.setAttribute('x', '0'); f.setAttribute('y', '0'); f.setAttribute('width', w); f.setAttribute('height', h);
      img.setAttribute('width', w); img.setAttribute('height', h);
      img.setAttribute('href', c.toDataURL());
      var bf = 'url(#' + id + ') blur(' + o.blur + 'px) saturate(190%) brightness(1.06)';
      el.style.backdropFilter = bf; el.style.webkitBackdropFilter = bf;
      el.classList.add('refracting');
    }
    build();
    if (window.ResizeObserver) new ResizeObserver(function () { build(); }).observe(el);
  }

  // safety net: never leave content hidden
  setTimeout(function () {
    if (!M) document.querySelectorAll('[data-rise]').forEach(function (el) { el.style.opacity = 1; });
  }, 0);
})();
