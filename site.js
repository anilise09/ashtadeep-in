// Ashtadeep: lights the eight lamps once, reveals panels as they scroll in, lights each promise's lamp when it is
// read, and marks the header once the page has scrolled. Everything is readable without this file: the "js" class
// that hides content until it is revealed is only set when scripts run.
(function () {
  var lamps = document.querySelector('.hero .lamps');
  if (lamps) {
    var light = function () { requestAnimationFrame(function () { lamps.classList.add('is-lit'); }); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(light); else light();
    setTimeout(light, 1200); // never leave them dark if fonts stall
  }

  var reveal = function (el) { el.classList.add('in'); };
  var items = document.querySelectorAll('.reveal');
  var promises = document.querySelectorAll('.promise');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        reveal(e.target);
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    items.forEach(function (el) { io.observe(el); });

    // Promise lamps light as each promise reaches the middle of the screen, and stay lit.
    var lit = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('on');
        lit.unobserve(e.target);
      });
    }, { rootMargin: '-30% 0px -40% 0px' });
    promises.forEach(function (p) { lit.observe(p); });

    // Promise six: no flicker work while the hero lamps are off screen.
    if (lamps) new IntersectionObserver(function (es) { lamps.classList.toggle('is-paused', !es[0].isIntersecting); }).observe(lamps);
  } else {
    items.forEach(reveal);
    promises.forEach(function (p) { p.classList.add('on'); });
  }

  var header = document.querySelector('.site-header');
  if (header) {
    var mark = function () { header.classList.toggle('is-scrolled', window.scrollY > 4); };
    window.addEventListener('scroll', mark, { passive: true });
    mark();
  }

  // Close the phone menu after choosing a link.
  document.querySelectorAll('.menu-panel a').forEach(function (a) {
    a.addEventListener('click', function () { var d = a.closest('details'); if (d) d.open = false; });
  });
})();
