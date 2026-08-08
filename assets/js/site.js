/* ============================================================================
   Naqla — page wiring.
     1. mounts the scroll-world camera flight from the baked-in JSON config
     2. reveals detail sections on scroll (IntersectionObserver)
   The FAQ is native <details>/<summary>, so it needs no JS at all.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 1. the film ------------------------------------------------------ */
  function mountFilm() {
    var host = document.getElementById('world');
    var node = document.getElementById('sw-config');
    if (!host || !node || typeof window.mountScrollWorld !== 'function') return;

    var cfg;
    try { cfg = JSON.parse(node.textContent); } catch (e) { return; }

    // The engine reads `brand`/`cta` to build its own topbar; we render a
    // persistent header instead, so those stay out of the config on purpose.
    window.mountScrollWorld(host, cfg);
  }

  /* ---- 2. reveal on scroll --------------------------------------------- */
  function reveals() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    // No IntersectionObserver (or reduced motion): show everything immediately.
    if (reduce || !('IntersectionObserver' in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add('in');
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* Only hide-before-reveal once we know JS is running, so a no-JS or
     failed-script visitor still gets the full page (see .js-reveal in CSS). */
  if (!reduce) document.documentElement.classList.add('js-reveal');

  /* ---- 3. header: light text over the film, frosted bar over the page ---- */
  function stickyHeader() {
    var head = document.querySelector('.site-head');
    var world = document.getElementById('world');
    if (!head || !world) return;

    var queued = false;
    function apply() {
      queued = false;
      // Read offsetHeight live so it stays correct after resize/rotation without
      // caching a stale film height.
      var past = window.scrollY > world.offsetHeight - head.offsetHeight - 8;
      head.classList.toggle('is-solid', past);
    }
    window.addEventListener('scroll', function () {
      if (!queued) { queued = true; requestAnimationFrame(apply); }
    }, { passive: true });
    window.addEventListener('resize', apply);
    apply();
  }

  function init() { mountFilm(); reveals(); stickyHeader(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
