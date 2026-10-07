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
        none.textContent = 'Nothing here matches that yet. Try AshtaLok, AshtaSetu or privacy.';
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
  // Vyom, the guardian. His clips are whole frames of the same size, so one swaps for another without a jump: he
  // lands (the take-off played backwards) into the pose his cape loop starts from, and takes off from it. Each play
  // gets its own object URL so the animation starts from its first frame; the files load once. Reduced motion keeps
  // the still frame and plain jumps.
  var CLIP = { land: 2632, takeoff: 3149 };
  var clips = {};
  function clip(name) {
    return clips[name] || (clips[name] = fetch('/img/vyom-' + name + '.webp').then(function (r) { return r.blob(); }));
  }
  function show(img, name, cls) {
    return clip(name).then(function (b) {
      var old = img.getAttribute('data-url'), url = URL.createObjectURL(b);
      img.classList.remove('dropin', 'launch', 'away');
      void img.offsetWidth;
      img.src = url; img.setAttribute('data-url', url);
      if (cls) img.classList.add(cls);
      if (old) setTimeout(function () { URL.revokeObjectURL(old); }, 500);
    });
  }
  // Land, then stand guard with the cape loop; resolves once he is standing.
  function land(img) {
    img.vyomBusy = true;
    return Promise.all([clip('land'), clip('idle')]).then(function () { return show(img, 'land', 'dropin'); })
      .then(function () { return new Promise(function (ok) { setTimeout(ok, CLIP.land); }); })
      .then(function () { img.vyomBusy = false; return show(img, 'idle'); });
  }
  function takeoff(img) {
    img.vyomBusy = true;
    return show(img, 'takeoff', 'launch').then(function () {
      return new Promise(function (ok) { setTimeout(function () { img.classList.add('away'); img.vyomBusy = false; ok(); }, CLIP.takeoff); });
    });
  }
  var canFly = motion && 'fetch' in window && 'Promise' in window && window.URL && URL.createObjectURL;
  var mascot = document.querySelector('.mascot');
  var hero = mascot && mascot.querySelector('.vyom');
  var heroShown = function () { return mascot && getComputedStyle(mascot).display !== 'none'; };
  // Hero: he drops in from the sky, then says his first line.
  function heroLand() {
    if (!hero || !heroShown()) return Promise.resolve();
    mascot.classList.add('waiting'); hero.classList.add('away');
    return land(hero).then(function () { mascot.classList.remove('waiting'); });
  }
  if (canFly && hero) heroLand();
  // Header: a small Vyom lands in the bar as the page opens, just after the big one.
  var mini = document.querySelector('.mini-vyom .vyom');
  if (canFly && mini) { mini.classList.add('away'); setTimeout(function () { land(mini); }, 900); }
  // Footer: he lands on guard when you reach him.
  var guard = document.querySelector('.guard .vyom');
  if (canFly && guard && 'IntersectionObserver' in window) {
    guard.classList.add('away');
    var seen = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && guard.classList.contains('away') && !guard.vyomBusy) land(guard); });
    }, { threshold: 0.6 });
    seen.observe(guard.parentNode);
  }
  // "Fly to the top" and the small Vyom: he takes off, the page follows him up, and he lands back in the hero.
  function flyUp(img) {
    return function (ev) {
      if (!canFly) return;
      ev.preventDefault();
      if (img.vyomBusy) return;
      takeoff(img);
      setTimeout(function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        var arrive = function () {
          if (window.scrollY > 60) return;
          window.removeEventListener('scroll', arrive);
          heroLand();
          if (mini && mini.classList.contains('away') && !mini.vyomBusy) setTimeout(function () { land(mini); }, 900);
        };
        window.addEventListener('scroll', arrive, { passive: true });
        arrive();
      }, 1700);
    };
  }
  var fly = document.querySelector('.guard .fly');
  if (fly && guard) fly.addEventListener('click', flyUp(guard));
  var miniLink = document.querySelector('.mini-vyom');
  if (miniLink && mini) miniLink.addEventListener('click', flyUp(mini));
  // The region button: Vyom takes off from beside it, the globe spins, and the other site opens, where he lands.
  // Ctrl/Cmd-click and middle-click still open it the usual way.
  document.querySelectorAll('.site-header .region').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      if (!canFly || !mini || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return;
      ev.preventDefault();
      if (a.classList.contains('flying')) return;
      a.classList.add('flying');
      var go = function () { window.location.href = a.href; };
      if (mini.vyomBusy || mini.classList.contains('away')) { setTimeout(go, 700); return; }
      takeoff(mini);
      setTimeout(go, 2700);
    });
  });
  // Coming back with the browser's Back button: settle the button and bring Vyom down again.
  window.addEventListener('pageshow', function (ev) {
    if (!ev.persisted) return;
    document.querySelectorAll('.region.flying').forEach(function (a) { a.classList.remove('flying'); });
    if (canFly && mini && mini.classList.contains('away')) land(mini);
  });

  // The "Meet" picture becomes its looping scene once it comes near the screen; it loads only then, and stays a
  // still picture for reduced motion.
  function meetScene() {
    var art = document.querySelector('.meet-art[data-video]');
    if (!art || !('IntersectionObserver' in window)) return;
    var near = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      near.disconnect();
      var v = document.createElement('video');
      v.muted = true; v.loop = true; v.playsInline = true;
      v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('preload', 'auto');
      v.poster = art.currentSrc || art.src;
      v.width = art.width; v.height = art.height;
      v.setAttribute('role', 'img'); v.setAttribute('aria-label', art.alt);
      art.getAttribute('data-video').split(',').forEach(function (src) {
        var s = document.createElement('source');
        s.src = src; s.type = /\.webm$/.test(src) ? 'video/webm' : 'video/mp4';
        v.appendChild(s);
      });
      var shown = false;
      v.addEventListener('canplaythrough', function () {
        if (shown) return;
        shown = true;
        // Take the picture's place as it is now, already revealed: the scroll-in reveal watched the picture.
        v.className = art.className;
        v.classList.remove('pre');
        v.classList.add('in');
        art.replaceWith(v);
        var p = v.play(); if (p && p.catch) p.catch(function () {});
      });
      v.load();
    }, { threshold: 0.2 });
    near.observe(art);
  }
  if (motion) meetScene();

  // Vyom's speech bubble: one true line at a time, changing every few seconds (held still for reduced motion).
  if (mascot && motion) {
    var lines = JSON.parse(mascot.getAttribute('data-lines') || '[]');
    var bubble = mascot.querySelector('.bubble');
    var at = 0;
    if (lines.length > 1) setInterval(function () {
      bubble.classList.add('fade');
      setTimeout(function () { at = (at + 1) % lines.length; bubble.textContent = lines[at]; bubble.classList.remove('fade'); }, 280);
    }, 4800);
  }
})();
