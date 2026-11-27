// kolektiva. — scroll effects and small behaviours.
// The page still reads top to bottom without this file; it adds the
// pinned scenes, the letter reveals, the menu and the chapter bar.
// The menu and the chapter bar are built from the chapters in index.html,
// so a chapter is added or renamed in one place.
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var motion = !reduceMotion;
  if (motion) root.classList.add('motion');

  var clamp = function (v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };

  var make = function (tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  };

  // ───── 1. Menu and chapter bar, one link per chapter ─────
  var menuNav = document.querySelector('.menu-nav');
  var chapterbar = document.querySelector('.chapterbar');
  $$('[data-chapter]').forEach(function (chapter) {
    var href = '#' + chapter.id;

    var item = make('a');
    item.href = href;
    item.append(
      make('span', 'type', chapter.querySelector('.divider-label .type').textContent),
      make('span', 'menu-word', chapter.querySelector('.divider-title').textContent)
    );
    menuNav.appendChild(item);

    var label = make('span', 'cap');
    label.append(make('span', 'hide-s', 'Chapter '), chapter.querySelector('.divider-numeral').textContent);
    var bar = make('span', 'bar');
    bar.appendChild(make('i'));
    var link = make('a');
    link.href = href;
    link.append(label, bar);
    chapterbar.appendChild(link);
  });

  // ───── 2. Split headlines into letters, statements into words ─────
  var srCopy = function (el) {
    var sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = el.textContent.replace(/\s+/g, ' ').trim();
    return sr;
  };

  $$('[data-split]').forEach(function (el) {
    var sr = srCopy(el);
    var i = 0;
    $$('.ln', el).forEach(function (ln) {
      var words = ln.textContent.trim().split(/\s+/);
      ln.textContent = '';
      ln.setAttribute('aria-hidden', 'true');
      words.forEach(function (word, w) {
        var wd = document.createElement('span');
        wd.className = 'wd';
        word.split('').forEach(function (c) {
          var ch = document.createElement('span');
          ch.className = 'ch';
          ch.textContent = c;
          ch.style.setProperty('--i', i++);
          wd.appendChild(ch);
        });
        ln.appendChild(wd);
        if (w < words.length - 1) ln.appendChild(document.createTextNode(' '));
      });
    });
    el.style.setProperty('--n', i);
    el.insertBefore(sr, el.firstChild);
  });

  $$('[data-words]').forEach(function (el) {
    var sr = srCopy(el);
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (word, i) {
      var w = document.createElement('span');
      w.className = 'w';
      w.setAttribute('aria-hidden', 'true');
      w.textContent = word;
      w.style.setProperty('--i', i);
      el.appendChild(w);
      el.appendChild(document.createTextNode(' '));
    });
    el.style.setProperty('--n', words.length);
    el.insertBefore(sr, el.firstChild);
  });

  // ───── 3. Type the logo on arrival ─────
  var wordmark = document.querySelector('.intro-wordmark');
  var wordmarkText = document.querySelector('.wordmark-text');
  if (wordmark && wordmarkText && motion) {
    var full = wordmarkText.textContent;
    var typed = 0;
    wordmarkText.textContent = '';
    wordmark.classList.add('is-typing');
    var typeNext = function () {
      typed += 1;
      wordmarkText.textContent = full.slice(0, typed);
      if (typed < full.length) {
        setTimeout(typeNext, typed === full.length - 1 ? 420 : 70 + Math.random() * 90);
      } else {
        setTimeout(function () { wordmark.classList.remove('is-typing'); }, 1600);
      }
    };
    setTimeout(typeNext, 400);
  }

  // ───── 4. Scroll engine ─────
  var pins = [], views = [], chapters = [];
  var vh = window.innerHeight, vw = window.innerWidth;

  var pageTop = function (el) {
    var y = 0;
    while (el) { y += el.offsetTop; el = el.offsetParent; }
    return y;
  };

  var measure = function () {
    vh = window.innerHeight;
    vw = root.clientWidth;
    pins = $$('[data-pin]').map(function (el) {
      var track = el.hasAttribute('data-hscroll') ? el.querySelector('.track') : null;
      return {
        el: el, top: pageTop(el), height: el.offsetHeight, last: -1,
        track: track,
        trackWidth: track ? track.scrollWidth : 0,
        // data-hscroll="0.45": the track starts that share of the screen in from the right
        lead: parseFloat(el.getAttribute('data-hscroll')) || 0,
      };
    });
    views = $$('[data-view]').map(function (el) {
      return { el: el, top: pageTop(el), height: el.offsetHeight, last: -1 };
    });
    chapters = $$('[data-chapter]').map(function (el) {
      var link = chapterbar.querySelector('a[href="#' + el.id + '"]');
      return { el: el, top: pageTop(el), height: el.offsetHeight, link: link, fill: link && link.querySelector('i'), last: -1 };
    });
  };

  var smoothY = window.scrollY;
  var running = false;

  var render = function (y) {
    var i, s, p;
    for (i = 0; i < pins.length; i++) {
      s = pins[i];
      p = clamp((y - s.top) / Math.max(1, s.height - vh), 0, 1);
      if (Math.abs(p - s.last) < 0.0004) continue;
      s.last = p;
      s.el.style.setProperty('--p', p.toFixed(4));
      if (s.track) {
        var start = vw * s.lead, end = vw - s.trackWidth;
        s.track.style.setProperty('--x', (start + (end - start) * p).toFixed(1) + 'px');
      }
    }
    for (i = 0; i < views.length; i++) {
      s = views[i];
      p = clamp((y + vh - s.top) / (vh + s.height), 0, 1);
      if (Math.abs(p - s.last) < 0.0004) continue;
      s.last = p;
      s.el.style.setProperty('--p', p.toFixed(4));
    }
    var mid = y + vh * 0.5;
    for (i = 0; i < chapters.length; i++) {
      s = chapters[i];
      if (!s.link) continue;
      p = clamp((mid - s.top) / s.height, 0, 1);
      if (Math.abs(p - s.last) < 0.0004) continue;
      s.last = p;
      s.fill.style.setProperty('--bp', p.toFixed(4));
      s.link.classList.toggle('is-current', p > 0 && p < 1);
    }
    root.classList.toggle('at-start', y < vh * 0.4);
  };

  var tick = function () {
    var target = window.scrollY;
    smoothY += (target - smoothY) * 0.16;
    if (Math.abs(target - smoothY) < 0.2) smoothY = target;
    render(smoothY);
    if (smoothY !== target) requestAnimationFrame(tick);
    else running = false;
  };
  var kick = function () {
    if (!running) { running = true; requestAnimationFrame(tick); }
  };

  if (motion) {
    measure();
    render(smoothY);
    window.addEventListener('scroll', kick, { passive: true });
    var remeasure = function () {
      measure();
      pins.concat(views, chapters).forEach(function (s) { s.last = -1; });
      render(smoothY);
    };
    window.addEventListener('resize', remeasure);
    window.addEventListener('load', remeasure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
  }

  // ───── 5. Menu ─────
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  var setMenu = function (open) {
    root.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', String(!open));
  };
  burger.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // ───── 6. Links that jump within the page ─────
  // When the target opens on a pinned scene (a chapter's title card), land in
  // the middle of it, where it is fully shown, rather than on its first frame.
  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href^="#"]');
    if (!link) return;
    var target = document.getElementById(link.getAttribute('href').slice(1));
    if (!target) return;
    e.preventDefault();
    setMenu(false);
    var y = pageTop(target);
    var first = target.firstElementChild;
    if (motion && first && first.hasAttribute('data-pin')) y += (first.offsetHeight - window.innerHeight) * 0.5;
    window.scrollTo({ top: y, behavior: motion ? 'smooth' : 'auto' });
  });

  // ───── 7. Contact form → opens the visitor's email app ─────
  var form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var subject = 'Website enquiry from ' + (data.get('name') || '');
      var body = (data.get('message') || '') + '\n\n' + (data.get('name') || '') + '\n' + (data.get('email') || '');
      window.location.href = form.getAttribute('action') +
        '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      var note = form.querySelector('.form-note');
      if (!note) {
        note = make('p', 'form-note');
        note.setAttribute('role', 'status');
        form.appendChild(note);
      }
      note.textContent = 'Your email app should now open with the message ready to send.';
    });
  }

  // ───── 8. Keep the copyright year current ─────
  $$('.year').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
