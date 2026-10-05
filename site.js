// Ashtadeep: lights the eight lamps once, links each principle to its lamp, and marks the header once scrolled.
// Everything works without this file: lamps show lit, the menu is a <details>.
(function () {
  var hero = document.querySelector('.hero');
  var lamps = document.querySelector('.hero .lamps');
  if (hero && lamps) {
    var light = function () {
      requestAnimationFrame(function () { lamps.classList.add('is-lit'); hero.classList.add('is-lit'); });
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(light); else light();
    setTimeout(light, 1200); // never leave them dark if fonts stall
    // Promise six: no flicker work while the lamps are off screen.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { lamps.classList.toggle('is-paused', !es[0].isIntersecting); }).observe(lamps);
    }
  }

  var row = document.querySelectorAll('.principle-lamps .lamp-mini');
  document.querySelectorAll('.principle').forEach(function (item, i) {
    var on = function () { row[i] && row[i].classList.add('on'); };
    var off = function () { row[i] && !row[i].classList.contains('kept') && row[i].classList.remove('on'); };
    item.addEventListener('pointerenter', on);
    item.addEventListener('pointerleave', off);
  });
  // As principles scroll through the middle of the screen, their lamps light and stay lit.
  if ('IntersectionObserver' in window && row.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var i = Array.prototype.indexOf.call(document.querySelectorAll('.principle'), e.target);
          row[i] && row[i].classList.add('on', 'kept');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '-35% 0px -45% 0px' });
    document.querySelectorAll('.principle').forEach(function (p) { io.observe(p); });
  } else {
    row.forEach(function (l) { l.classList.add('on', 'kept'); });
  }
  var header = document.querySelector('.site-header');
  if (header) {
    var mark = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', mark, { passive: true });
    mark();
  }

  // Close the phone menu after choosing a link.
  document.querySelectorAll('.menu-panel a').forEach(function (a) {
    a.addEventListener('click', function () { var d = a.closest('details'); if (d) d.open = false; });
  });
})();
