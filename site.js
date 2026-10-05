// Ashtadeep: the scroll story, the panels' art rising into place, the promise gallery, and small header details.
// Without this file (or with reduced motion) the page is complete and static: the "motion" class that pins the
// story and hides content until it is revealed is only set here.
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var motion = !reduce.matches && 'IntersectionObserver' in window;
  if (motion) root.classList.add('motion');

  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var range = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };          // 0 before a, 1 after b
  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };                          // ease-out cubic

  // Chapter one: scroll position drives the name, the gloss, the lamps and the headline.
  var story = document.querySelector('.story');
  var stage = story && story.querySelector('.story-stage');
  var parts = story && {
    w1: story.querySelector('.w1'), w2: story.querySelector('.w2'), word: story.querySelector('.word'),
    glosses: story.querySelectorAll('.g'), latin: story.querySelector('.latin'), lamps: story.querySelector('.lamps'),
    lampEls: story.querySelectorAll('.lamp'), copy: story.querySelector('.copy'), hint: story.querySelector('.hint')
  };

  function drawStory() {
    if (!story) return;
    if (!motion) { parts.lampEls.forEach(function (l) { l.classList.add('on'); }); return; }
    var r = story.getBoundingClientRect();
    var run = story.offsetHeight - stage.offsetHeight;
    var p = clamp(-r.top / run, 0, 1);
    var vw = window.innerWidth;

    // 0.00-0.24: the word splits into its two halves; the meanings appear beneath.
    var split = ease(range(p, 0.04, 0.24));
    var gap = Math.min(vw * 0.07, 110) * split;
    // 0.40-0.58: the word rises and shrinks away, gone before the headline arrives.
    var away = ease(range(p, 0.40, 0.58));
    parts.w1.style.transform = 'translateX(' + (-gap) + 'px)';
    parts.w2.style.transform = 'translateX(' + gap + 'px)';
    parts.word.style.transform = 'translateX(-50%) translateY(' + (-away * 22) + 'vh) scale(' + (1 - away * 0.45) + ')';
    parts.word.style.opacity = String(1 - range(p, 0.48, 0.58));

    var glossIn = ease(range(p, 0.12, 0.26)), glossOut = range(p, 0.36, 0.44);
    parts.glosses.forEach(function (g) {
      g.style.opacity = String(glossIn * (1 - glossOut));
      g.style.transform = 'translate(-50%, ' + (6 + (1 - glossIn) * 16) + 'px)';
    });
    var latinOut = range(p, 0.03, 0.12);
    parts.latin.style.opacity = String(1 - latinOut);
    parts.latin.style.transform = 'translateX(-50%) translateY(' + (latinOut * 12) + 'px)';

    // 0.30-0.40: the shelf of lamps rises; 0.36-0.62: they light one by one.
    var lampsIn = ease(range(p, 0.28, 0.40));
    parts.lamps.style.opacity = String(lampsIn);
    parts.lamps.style.transform = 'translateX(-50%) translateY(' + ((1 - lampsIn) * 40) + 'px)';
    parts.lampEls.forEach(function (l, i) { l.classList.toggle('on', p > 0.36 + i * 0.032); });

    // 0.64-0.80: the headline arrives.
    var copyIn = ease(range(p, 0.62, 0.78));
    parts.copy.style.opacity = String(copyIn);
    parts.copy.style.transform = 'translateX(-50%) translateY(' + ((1 - copyIn) * 36) + 'px)';
    parts.copy.classList.toggle('live', copyIn > 0.6);

    parts.hint.style.opacity = String(1 - range(p, 0, 0.06));
    story.classList.toggle('is-paused', r.bottom < 0 || r.top > window.innerHeight);
  }

  // Chapter two: each panel's art rises and settles as the panel scrolls into view.
  var arts = document.querySelectorAll('.panel .art img');
  function drawArt() {
    if (!motion) return;
    var h = window.innerHeight;
    arts.forEach(function (img) {
      var r = img.parentNode.getBoundingClientRect();
      if (r.top > h || r.bottom < 0) return;
      var t = ease(clamp((h - r.top) / (h * 0.9), 0, 1));
      img.style.transform = 'translateY(' + ((1 - t) * 90) + 'px) scale(' + (1.1 - t * 0.1) + ')';
    });
  }

  var header = document.querySelector('.site-header');
  var ticking = false;
  function frame() {
    ticking = false;
    drawStory();
    drawArt();
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 4);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();

  // Reveals and the promise lamps.
  var reveal = document.querySelectorAll('.reveal');
  var cards = document.querySelectorAll('.card');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    reveal.forEach(function (el) { io.observe(el); });
    var lit = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('on', e.isIntersecting || e.target.classList.contains('kept')); if (e.isIntersecting) e.target.classList.add('kept'); });
    }, { threshold: 0.6 });
    cards.forEach(function (c) { lit.observe(c); });
  } else {
    reveal.forEach(function (el) { el.classList.add('in'); });
    cards.forEach(function (c) { c.classList.add('on'); });
  }

  // Chapter three: previous / next for the promise gallery.
  var gallery = document.querySelector('.gallery');
  if (gallery) {
    var prev = document.querySelector('.gallery-nav .prev'), next = document.querySelector('.gallery-nav .next');
    var step = function () { var c = gallery.querySelector('.card'); return c ? c.getBoundingClientRect().width + 20 : 300; };
    var sync = function () {
      prev.disabled = gallery.scrollLeft < 8;
      next.disabled = gallery.scrollLeft + gallery.clientWidth > gallery.scrollWidth - 8;
    };
    prev.addEventListener('click', function () { gallery.scrollBy({ left: -step(), behavior: motion ? 'smooth' : 'auto' }); });
    next.addEventListener('click', function () { gallery.scrollBy({ left: step(), behavior: motion ? 'smooth' : 'auto' }); });
    gallery.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }

  // Close the phone menu after choosing a link.
  document.querySelectorAll('.menu-panel a').forEach(function (a) {
    a.addEventListener('click', function () { var d = a.closest('details'); if (d) d.open = false; });
  });
})();
