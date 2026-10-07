// Ashtadeep: the header settling on white, the menu sheet, the finder, the paged stories and promises, content rising
// into place, and each promise's lamp lighting. The page is complete without this file; the "motion" class that
// hides content until it is revealed is only set here.
(function () {
  var root = document.documentElement;
  var motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window;
  if (motion) root.classList.add('motion');

  // Header: transparent over the hero, white once the page moves.
  var header = document.querySelector('.site-header');
  var ticking = false;
  function mark() { ticking = false; if (header) header.classList.toggle('is-scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(mark); } }, { passive: true });
  mark();

  // Menu sheet: closes on its button, on Escape, and after choosing a link.
  var menu = document.querySelector('.menu');
  if (menu) {
    var close = function () { menu.open = false; };
    menu.querySelectorAll('.close, .menu-sheet a').forEach(function (el) { el.addEventListener('click', close); });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && menu.open) { close(); menu.querySelector('summary').focus(); } });
  }

  // Finder: matches what is typed against the site's own index; Enter goes to the first match.
  var input = document.getElementById('find');
  var data = document.getElementById('find-index');
  if (input && data) {
    var index = JSON.parse(data.textContent);
    var list = input.form.querySelector('.results');
    var norm = function (s) { return s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, ''); };
    var render = function () {
      var q = norm(input.value.trim());
      list.innerHTML = '';
      var old = input.form.querySelector('.none'); if (old) old.remove();
      if (!q) return;
      var words = q.split(/\s+/);
      var hits = index.filter(function (it) {
        var hay = norm(it.t + ' ' + it.d + ' ' + it.k);
        return words.every(function (w) { return hay.indexOf(w) >= 0; });
      }).slice(0, 5);
      if (!hits.length) {
        var none = document.createElement('p');
        none.className = 'none';
        none.textContent = 'Nothing here matches that yet. Try AshtaLok, Vawra or privacy.';
        list.after(none);
        return;
      }
      hits.forEach(function (it) {
        var li = document.createElement('li'), a = document.createElement('a'), b = document.createElement('b'), s = document.createElement('span');
        a.href = it.h; b.textContent = it.t; s.textContent = it.d;
        a.append(b, s); li.append(a); list.append(li);
        a.addEventListener('click', function () { input.value = ''; render(); });
      });
    };
    input.addEventListener('input', render);
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') { var first = list.querySelector('a'); if (first) { ev.preventDefault(); first.click(); location.hash = first.getAttribute('href'); } }
    });
  }

  // Pagers for the stories and the promises: count where you are, step a card at a time.
  document.querySelectorAll('.pager').forEach(function (pager) {
    var track = document.getElementById(pager.getAttribute('data-for'));
    if (!track) return;
    var items = track.querySelectorAll('li');
    var prev = pager.querySelector('.prev'), next = pager.querySelector('.next'), at = pager.querySelector('.at');
    var step = function () { var first = items[0]; return first ? first.getBoundingClientRect().width + 20 : track.clientWidth; };
    var sync = function () {
      var i = Math.round(track.scrollLeft / step());
      at.textContent = String(Math.min(items.length, i + 1));
      prev.disabled = track.scrollLeft < 8;
      next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 8;
    };
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: motion ? 'smooth' : 'auto' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: motion ? 'smooth' : 'auto' }); });
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  });

  // Content rises into place once; each promise's lamp lights when its card is in view, and stays lit.
  var reveal = document.querySelectorAll('.reveal');
  var lamps = document.querySelectorAll('.promise');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveal.forEach(function (el) { io.observe(el); });
    var lit = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); lit.unobserve(e.target); } });
    }, { threshold: 0.55 });
    lamps.forEach(function (l) { lit.observe(l); });
  } else {
    reveal.forEach(function (el) { el.classList.add('in'); });
    lamps.forEach(function (l) { l.classList.add('on'); });
  }
})();
