// Motion for the portfolio: sticky header state, scroll reveals and the hero tilt.
// Every effect is optional. Without this file the page is complete and static.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header gets its background once the page has scrolled.
  var header = document.querySelector('.top');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Scroll reveals: each element animates in once, the first time it enters the viewport.
  var items = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    // A wipe starts fully clipped, and a clipped element never counts as visible,
    // so for those we watch the parent and reveal the child.
    var revealFor = new Map();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        revealFor.get(e.target).forEach(function (el) { el.classList.add('is-in'); });
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    items.forEach(function (el) {
      var watched = el.getAttribute('data-reveal') === 'wipe' ? el.parentElement : el;
      if (!revealFor.has(watched)) revealFor.set(watched, []);
      revealFor.get(watched).push(el);
      io.observe(watched);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  // Hero tilt: the screenshots lean toward the mouse, the phone a little further for depth.
  // Only for a real mouse, and never under reduced motion.
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var shots = document.querySelector('.hero__shots');
  var tilt = document.querySelector('.hero__tilt');
  var phone = document.querySelector('.hero__tilt .frame--phone');
  if (reduce || !fine || !shots || !tilt) return;

  var tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  function frame() {
    // Ease toward the target each frame, so the motion settles instead of snapping.
    x += (tx - x) * 0.08;
    y += (ty - y) * 0.08;
    tilt.style.transform = 'rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' + (x * 7).toFixed(2) + 'deg)';
    if (phone) phone.style.translate = (x * 14).toFixed(1) + 'px ' + (y * 10).toFixed(1) + 'px';
    if (Math.abs(tx - x) > 0.001 || Math.abs(ty - y) > 0.001) raf = requestAnimationFrame(frame);
    else raf = 0;
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }

  document.addEventListener('pointermove', function (e) {
    var r = shots.getBoundingClientRect();
    if (r.bottom < 0) return; // hero scrolled away
    tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 1.2)));
    ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 1.2)));
    kick();
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', function () { tx = 0; ty = 0; kick(); });
})();
