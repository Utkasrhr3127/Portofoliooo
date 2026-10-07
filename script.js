/* ═══════════════════════════════════════════════════════════
   UTKARSH SHRIVASTAVA — PORTFOLIO
   Motion · Interaction · Lightweight 3D · Inkdrop
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var doc  = document;
  var root = doc.documentElement;

  root.classList.remove('no-js');
  root.classList.add('js');

  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqCoarse = window.matchMedia('(pointer: coarse)');
  var mqFine   = window.matchMedia('(hover: hover) and (pointer: fine)');

  var reduceMotion = mqReduce.matches;
  var coarse       = mqCoarse.matches;
  var finePointer  = mqFine.matches;

  var $  = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp  = function (a, b, t) { return a + (b - a) * t; };

  var year = new Date().getFullYear();
  $$('#year, #yearTop').forEach(function (el) { el.textContent = year; });

  /* ─────────────────────────────────────────────────────────
     1 · CENTRAL SCHEDULER
     ───────────────────────────────────────────────────────── */
  var Scheduler = (function () {
    var tasks = [];
    var running = false;
    var rafId = null;

    function loop(now) {
      var active = false;
      for (var i = 0; i < tasks.length; i++) {
        var t = tasks[i];
        if (!t.active) continue;
        var keep = t.fn(now);
        if (keep === false) t.active = false;
        else active = true;
      }
      if (active) {
        rafId = requestAnimationFrame(loop);
      } else {
        running = false;
        rafId = null;
      }
    }

    return {
      register: function (fn) {
        var task = { fn: fn, active: false };
        tasks.push(task);
        return {
          wake: function () {
            task.active = true;
            if (!running) {
              running = true;
              rafId = requestAnimationFrame(loop);
            }
          }
        };
      },
      stop: function () {
        if (rafId) cancelAnimationFrame(rafId);
        running = false;
        rafId = null;
        for (var i = 0; i < tasks.length; i++) tasks[i].active = false;
      }
    };
  })();

  doc.addEventListener('visibilitychange', function () {
    if (doc.hidden) Scheduler.stop();
  });

  /* ─────────────────────────────────────────────────────────
     2 · POINTER STATE
     ───────────────────────────────────────────────────────── */
  var pointer = { x: 0, y: 0, nx: 0, ny: 0, inside: false };

  if (!coarse) {
    window.addEventListener('pointermove', function (e) {
      var w = window.innerWidth || 1;
      var h = window.innerHeight || 1;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.nx = (e.clientX / w) * 2 - 1;
      pointer.ny = (e.clientY / h) * 2 - 1;
      pointer.inside = true;
    }, { passive: true });

    window.addEventListener('pointerleave', function () {
      pointer.inside = false;
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────────────────
     3 · LOADER
     ───────────────────────────────────────────────────────── */
  (function loader() {
    var el     = $('#loader');
    var bar    = $('#loaderBar');
    var count  = $('#loaderCount');
    var stages = $$('#loaderStages li');
    if (!el) return;

    var stageEls = {
      type:  stages[0],
      image: stages[1],
      world: stages[2],
      ready: stages[3]
    };

    var done = { type: false, image: false, world: false, ready: false };
    var progress = 0;
    var progressTarget = 0;

    function setStage(name, state) {
      var s = stageEls[name];
      if (!s) return;
      if (state === 'active') s.classList.add('is-active');
      if (state === 'done') {
        s.classList.remove('is-active');
        s.classList.add('is-done');
      }
    }

    function computeTarget() {
      var t = 0;
      if (done.type)  t += 0.25;
      if (done.image) t += 0.30;
      if (done.world) t += 0.30;
      if (done.ready) t += 0.15;
      progressTarget = t;
    }

    function advance(name) {
      if (done[name]) return;
      done[name] = true;
      setStage(name, 'done');
      var order = ['type', 'image', 'world', 'ready'];
      var idx = order.indexOf(name);
      if (idx >= 0 && idx < order.length - 1) {
        var next = order[idx + 1];
        if (!done[next]) setStage(next, 'active');
      }
      computeTarget();
      if (name === 'ready') finish();
    }

    function finish() {
      setTimeout(function () {
        el.classList.add('is-done');
        doc.body.style.overflow = '';
        $$('.hero [data-reveal]').forEach(function (r, i) {
          setTimeout(function () { r.classList.add('is-revealed'); }, i * 90);
        });
      }, 200);
    }

    doc.body.style.overflow = 'hidden';

    setTimeout(function () { advance('ready'); }, 4200);
    setTimeout(function () {
      el.classList.add('is-done');
      doc.body.style.overflow = '';
    }, 5600);

    /* Stage 1 — fonts */
    setStage('type', 'active');
    if (doc.fonts && doc.fonts.ready) {
      doc.fonts.ready.then(function () {
        try {
          if (!doc.fonts.check('16px Handodle')) {
            console.info('[portfolio] Handodle font not detected. Confirm fonts/Handodle-rg38A.ttf exists and the path in style.css is correct.');
          }
        } catch (e) { /* ignore */ }
        advance('type');
      });
    } else {
      setTimeout(function () { advance('type'); }, 500);
    }

    /* Stage 2 — portrait */
    var portrait = $('#portraitImg');
    if (portrait) {
      var checkImage = function () {
        if (portrait.complete) advance('image');
        else setTimeout(checkImage, 100);
      };
      checkImage();
    } else {
      advance('image');
    }

    /* Stage 3 — Three.js */
    var worldTimer = setTimeout(function () { advance('world'); }, 1400);
    window.__threeReady = function () {
      clearTimeout(worldTimer);
      advance('world');
    };

    /* Stage 4 — ready */
    var readyInterval = setInterval(function () {
      if (done.type && done.image && done.world && !done.ready) {
        clearInterval(readyInterval);
        setStage('ready', 'active');
        setTimeout(function () { advance('ready'); }, 320);
      }
    }, 100);

    var progressTask = Scheduler.register(function () {
      progress = lerp(progress, progressTarget, 0.10);
      if (bar)   bar.style.transform = 'scaleX(' + progress.toFixed(4) + ')';
      if (count) count.textContent = Math.round(progress * 100);
      if (progress > 0.995 && progressTarget >= 0.995) {
        if (bar)   bar.style.transform = 'scaleX(1)';
        if (count) count.textContent = '100';
        return false;
      }
      return true;
    });
    progressTask.wake();
  })();

  /* ─────────────────────────────────────────────────────────
     4 · NAVIGATION
     ───────────────────────────────────────────────────────── */
  (function navigation() {
    var nav    = $('#nav');
    var toggle = $('#navToggle');
    var links  = $('#navLinks');
    if (!nav) return;

    var lastY = -1;
    window.addEventListener('scroll', function () {
      var y = window.scrollY || window.pageYOffset;
      if (y === lastY) return;
      lastY = y;
      nav.classList.toggle('is-scrolled', y > 24);
    }, { passive: true });

    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var open = links.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      });

      $$('a', links).forEach(function (a) {
        a.addEventListener('click', function () {
          links.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
          toggle.setAttribute('aria-label', 'Open navigation');
        });
      });

      doc.addEventListener('click', function (e) {
        if (!links.classList.contains('is-open')) return;
        if (toggle.contains(e.target) || links.contains(e.target)) return;
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    }

    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href');
        if (!href || href === '#' || href.length < 2) return;
        var target = doc.getElementById(href.slice(1));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        if (history.replaceState) history.replaceState(null, '', href);
      });
    });

    var sections = $$('main section[id]');
    if (sections.length && links) {
      var anchors = $$('a', links);
      var setActive = function (id) {
        anchors.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
        });
      };
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          var best = null;
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            if (!best || en.boundingClientRect.top < best.boundingClientRect.top) best = en;
          });
          if (best) setActive(best.target.id);
        }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
        sections.forEach(function (s) { io.observe(s); });
      }
    }
  })();

  /* ─────────────────────────────────────────────────────────
     5 · REVEALS
     ───────────────────────────────────────────────────────── */
  (function reveals() {
    var els = $$('[data-reveal]');
    if (!els.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-revealed'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-revealed');
        io.unobserve(en.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

    els.forEach(function (el) { io.observe(el); });
  })();

  /* ─────────────────────────────────────────────────────────
     6 · PORTRAIT IMAGE
     ───────────────────────────────────────────────────────── */
  (function portraitImage() {
    var img = $('#portraitImg');
    var fb  = $('#portraitFallback');
    if (!img) return;

    function ok()   { img.classList.add('is-loaded'); if (fb) fb.classList.remove('is-visible'); }
    function fail() { img.classList.add('is-failed'); if (fb) fb.classList.add('is-visible'); }

    if (img.complete && img.naturalWidth > 0) ok();
    else {
      img.addEventListener('load', ok, { once: true });
      img.addEventListener('error', fail, { once: true });
      setTimeout(function () {
        if (!img.naturalWidth && !img.classList.contains('is-loaded')) fail();
      }, 2500);
    }
  })();

  /* ─────────────────────────────────────────────────────────
     7 · CUSTOM CURSOR
     ───────────────────────────────────────────────────────── */
  (function cursor() {
    if (!finePointer || reduceMotion) return;
    var el    = $('#cursor');
    var label = $('#cursorLabel');
    if (!el) return;

    var state = { x: -200, y: -200, tx: -200, ty: -200 };
    var currentMode = '';
    var currentLabel = '';

    function setMode(mode, text) {
      if (currentMode !== mode) {
        currentMode = mode;
        if (mode) el.setAttribute('data-mode', mode);
        else el.removeAttribute('data-mode');
      }
      if (currentLabel !== text) {
        currentLabel = text || '';
        if (label) label.textContent = currentLabel;
      }
    }

    function modeFor(target) {
      if (!target) return null;
      var cur = target.closest && target.closest('[data-cursor]');
      if (cur) {
        var mode = cur.getAttribute('data-cursor');
        var lbl  = cur.getAttribute('data-cursor-label') || '';
        if (mode === '↗' || mode === 'external') return { mode: 'external', text: lbl || '↗' };
        if (mode === 'OPEN' || mode === 'INSPECT' || mode === 'VIEW' || mode === 'COPY')
          return { mode: 'project', text: lbl || mode };
        if (mode === 'WRITE') return { mode: 'annotate', text: lbl || 'WRITE' };
        return { mode: 'annotate', text: lbl || mode };
      }
      if (target.closest && target.closest('a[target="_blank"]')) return { mode: 'external', text: '↗' };
      if (target.closest && target.closest('a, button')) return { mode: 'link', text: '' };
      return null;
    }

    var posTask = Scheduler.register(function () {
      state.x = lerp(state.x, state.tx, 0.22);
      state.y = lerp(state.y, state.ty, 0.22);
      el.style.transform = 'translate3d(' + state.x.toFixed(2) + 'px,' + state.y.toFixed(2) + 'px,0)';
      if (Math.abs(state.x - state.tx) < 0.2 && Math.abs(state.y - state.ty) < 0.2) {
        state.x = state.tx; state.y = state.ty;
        return false;
      }
      return true;
    });

    window.addEventListener('pointermove', function (e) {
      state.tx = e.clientX;
      state.ty = e.clientY;
      if (!el.classList.contains('is-on')) el.classList.add('is-on');
      posTask.wake();

      var m = modeFor(e.target);
      if (m) setMode(m.mode, m.text);
      else if (currentMode) setMode('', '');
    }, { passive: true });

    window.addEventListener('pointerdown', function () { el.classList.add('is-pressed'); }, { passive: true });
    window.addEventListener('pointerup',   function () { el.classList.remove('is-pressed'); }, { passive: true });
    window.addEventListener('pointerleave', function () { el.classList.remove('is-on'); }, { passive: true });
  })();

  /* ─────────────────────────────────────────────────────────
     8 · MAGNETIC ELEMENTS
     ───────────────────────────────────────────────────────── */
  (function magnetic() {
    if (!finePointer || reduceMotion) return;
    var els = $$('[data-magnetic]');
    if (!els.length) return;

    var states = [];
    els.forEach(function (el) {
      var s = { el: el, x: 0, y: 0, tx: 0, ty: 0, active: false };
      states.push(s);

      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
        var dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
        s.tx = clamp(dx, -1, 1) * 6;
        s.ty = clamp(dy, -1, 1) * 6;
        s.active = true;
        magTask.wake();
      }, { passive: true });

      el.addEventListener('pointerleave', function () {
        s.tx = 0; s.ty = 0; s.active = false;
        magTask.wake();
      });
    });

    var magTask = Scheduler.register(function () {
      var any = false;
      for (var i = 0; i < states.length; i++) {
        var s = states[i];
        s.x = lerp(s.x, s.tx, 0.18);
        s.y = lerp(s.y, s.ty, 0.18);
        if (Math.abs(s.x - s.tx) < 0.02 && Math.abs(s.y - s.ty) < 0.02 && !s.active) {
          if (s.el.style.transform) s.el.style.transform = '';
          s.x = s.tx; s.y = s.ty;
        } else {
          s.el.style.transform = 'translate3d(' + s.x.toFixed(2) + 'px,' + s.y.toFixed(2) + 'px,0)';
          any = true;
        }
      }
      return any;
    });
  })();

  /* ─────────────────────────────────────────────────────────
     9 · PORTRAIT PARALLAX
     ───────────────────────────────────────────────────────── */
  (function portraitParallax() {
    var stage = $('#portraitStage');
    if (!stage || reduceMotion || !finePointer) return;

    var media = $('.portrait-media', stage);
    var layers = $$('[data-depth]', stage);
    if (!media || !layers.length) return;

    var layerData = layers.map(function (el) {
      return { el: el, depth: parseFloat(el.getAttribute('data-depth')) || 0.2 };
    });

    var currentX = 0, currentY = 0;
    var inside = false;

    stage.addEventListener('pointerenter', function () {
      inside = true;
      parallaxTask.wake();
    }, { passive: true });

    stage.addEventListener('pointerleave', function () {
      inside = false;
      parallaxTask.wake();
    }, { passive: true });

    var parallaxTask = Scheduler.register(function () {
      var tx = inside && pointer.inside ? pointer.nx : 0;
      var ty = inside && pointer.inside ? pointer.ny : 0;
      currentX = lerp(currentX, tx, 0.08);
      currentY = lerp(currentY, ty, 0.08);

      media.style.transform =
        'rotateY(' + (currentX * 8).toFixed(2) + 'deg) rotateX(' + (-currentY * 6).toFixed(2) + 'deg) translateZ(0)';

      for (var i = 0; i < layerData.length; i++) {
        var it = layerData[i];
        if (it.el === media) continue;
        var dx = -currentX * it.depth * 30;
        var dy = -currentY * it.depth * 26;
        it.el.style.transform = 'translate3d(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px,0)';
      }

      if (!inside && Math.abs(currentX) < 0.001 && Math.abs(currentY) < 0.001) {
        currentX = 0; currentY = 0;
        return false;
      }
      return true;
    });
  })();

  /* ─────────────────────────────────────────────────────────
     10 · PORTRAIT METADATA
     ───────────────────────────────────────────────────────── */
  (function portraitMeta() {
    var stateEl = $('#portraitState');
    if (stateEl && !reduceMotion) {
      var states = ['Portrait', 'Fig. 01', 'Drawn by hand', 'Subject: U.S.'];
      var idx = 0;
      setInterval(function () {
        idx = (idx + 1) % states.length;
        stateEl.textContent = states[idx];
      }, 5600);
    }

    var clock = $('#portraitClock');
    if (clock) {
      var tickClock = function () {
        var d = new Date();
        clock.textContent =
          String(d.getHours()).padStart(2, '0') + ':' +
          String(d.getMinutes()).padStart(2, '0');
      };
      tickClock();
      setInterval(tickClock, 30000);
    }
  })();

  /* ─────────────────────────────────────────────────────────
     11 · SCROLL VELOCITY → rule stretch
     ───────────────────────────────────────────────────────── */
  (function ruleStretch() {
    if (reduceMotion) return;
    var rules = $$('[data-rule]');
    if (!rules.length) return;

    var lastY = window.scrollY || 0;
    var target = 1;
    var current = 1;
    var idleTimer = null;

    var task = Scheduler.register(function () {
      current = lerp(current, target, 0.12);
      var s = 'scaleX(' + current.toFixed(4) + ')';
      for (var i = 0; i < rules.length; i++) rules[i].style.transform = s;

      if (Math.abs(current - 1) < 0.002 && target === 1) {
        for (var j = 0; j < rules.length; j++) rules[j].style.transform = '';
        current = 1;
        return false;
      }
      return true;
    });

    window.addEventListener('scroll', function () {
      var y = window.scrollY || 0;
      var velocity = Math.abs(y - lastY);
      lastY = y;
      target = 1 + Math.min(velocity / 60, 0.35);
      task.wake();

      clearTimeout(idleTimer);
      idleTimer = setTimeout(function () {
        target = 1;
        task.wake();
      }, 180);
    }, { passive: true });
  })();

  /* ─────────────────────────────────────────────────────────
     12 · SCENE FADE
     ───────────────────────────────────────────────────────── */
  (function sceneFade() {
    if (reduceMotion) return;
    var scene = $('#scene');
    if (!scene) return;

    var lastOpacity = -1;

    var task = Scheduler.register(function () {
      var y = window.scrollY || window.pageYOffset;
      var vh = Math.max(1, window.innerHeight);
      var p = clamp(y / (vh * 2.2), 0, 1);
      var o = 1 - Math.pow(p, 1.15) * 0.94;
      o = clamp(o, 0.06, 1);
      if (root.classList.contains('inkdrop')) o = 1;
      if (Math.abs(o - lastOpacity) > 0.006) {
        scene.style.opacity = o.toFixed(3);
        lastOpacity = o;
      }
      return true;
    });
    task.wake();
  })();

  /* ─────────────────────────────────────────────────────────
     13 · SKILLS MAP
     ───────────────────────────────────────────────────────── */
  (function skillsMap() {
    var note = $('#skillsNote');
    var noteLabel = note ? $('.skills-note-label', note) : null;
    var noteBody  = note ? $('.skills-note-body', note) : null;
    var techs = $$('.tech[data-used]');
    var projects = $$('.project');
    if (!techs.length) return;

    var defaultLabel = noteLabel ? noteLabel.textContent : '';
    var defaultBody  = noteBody ? noteBody.textContent : '';

    function highlight(el) {
      var used = el.getAttribute('data-used');
      if (!used) return;
      var usedSet = used.split(',');
      var related = (el.getAttribute('data-related') || '').split(',');

      projects.forEach(function (p) {
        var id = p.getAttribute('data-project');
        if (usedSet.indexOf(id) !== -1) {
          p.classList.add('is-lit');
          p.classList.remove('is-dim');
        } else {
          p.classList.add('is-dim');
          p.classList.remove('is-lit');
        }
      });

      $$('.tech').forEach(function (t) {
        var key = t.getAttribute('data-tech');
        if (t === el) t.classList.add('is-active');
        else if (key && related.indexOf(key) !== -1) t.classList.add('is-active');
        else t.classList.remove('is-active');
      });

      if (note && noteLabel && noteBody) {
        var name = el.textContent.trim();
        var role = el.getAttribute('data-role') || '';
        var projectNames = usedSet.map(function (id) {
          var p = doc.querySelector('.project[data-project="' + id + '"]');
          return p ? p.querySelector('.project-name').textContent.trim() : id;
        }).join(', ');
        noteLabel.textContent = name.toUpperCase();
        noteBody.textContent = '→ ' + projectNames + (role ? ' · ' + role : '');
        note.classList.add('is-active');
      }
    }

    function clear() {
      projects.forEach(function (p) { p.classList.remove('is-dim', 'is-lit'); });
      $$('.tech').forEach(function (t) { t.classList.remove('is-active'); });
      if (note && noteLabel && noteBody) {
        noteLabel.textContent = defaultLabel;
        noteBody.textContent  = defaultBody;
        note.classList.remove('is-active');
      }
    }

    techs.forEach(function (t) {
      t.addEventListener('pointerenter', function () { highlight(t); });
      t.addEventListener('pointerleave', clear);
      t.addEventListener('focus', function () { highlight(t); });
      t.addEventListener('blur', clear);
    });
  })();

  /* ─────────────────────────────────────────────────────────
     14 · TIMELINE
     ───────────────────────────────────────────────────────── */
  (function timeline() {
    var timeline = $('#timeline');
    if (!timeline) return;
    var items = $$('.tl-item', timeline);
    var marker = $('#timelineMarker');
    var progress = $('#timelineProgress');
    if (!items.length) return;

    function focusItem(item) {
      timeline.classList.add('is-focus');
      items.forEach(function (i) { i.classList.remove('is-active'); });
      item.classList.add('is-active');

      if (marker && finePointer && !reduceMotion) {
        var tlRect = timeline.getBoundingClientRect();
        var itRect = item.getBoundingClientRect();
        var y = itRect.top - tlRect.top + 12;
        marker.style.transform = 'translate3d(0,' + y + 'px,0)';
      }
    }

    function blurItem() {
      timeline.classList.remove('is-focus');
      items.forEach(function (i) { i.classList.remove('is-active'); });
    }

    items.forEach(function (item) {
      item.addEventListener('pointerenter', function () { focusItem(item); });
      item.addEventListener('focus', function () { focusItem(item); });
      item.addEventListener('blur', blurItem);
    });

    timeline.addEventListener('pointerleave', blurItem);

    if (progress && !reduceMotion) {
      var raf = null;
      function update() {
        var tlRect = timeline.getBoundingClientRect();
        var vh = window.innerHeight;
        var start = vh * 0.85;
        var end = -tlRect.height * 0.3;
        var p = clamp((start - tlRect.top) / (start - end), 0, 1);
        progress.style.transform = 'scaleX(' + p.toFixed(3) + ')';
        raf = null;
      }
      window.addEventListener('scroll', function () {
        if (!raf) raf = requestAnimationFrame(update);
      }, { passive: true });
      update();
    }
  })();

  /* ─────────────────────────────────────────────────────────
     15 · PROJECT PREVIEW IMAGES
     ───────────────────────────────────────────────────────── */
  (function projectPreviews() {
    $$('.project-preview-img').forEach(function (img) {
      var ok = function () { img.classList.add('is-loaded'); };
      var fail = function () { img.classList.add('is-failed'); };
      if (img.complete) {
        if (img.naturalWidth > 0) ok();
        else fail();
      } else {
        img.addEventListener('load', ok, { once: true });
        img.addEventListener('error', fail, { once: true });
      }
    });
  })();

  /* ─────────────────────────────────────────────────────────
     16 · PROJECT INSPECTOR
     ───────────────────────────────────────────────────────── */
  (function inspector() {
    var overlay = $('#inspector');
    if (!overlay) return;

    var numEl   = $('#inspectNum');
    var yearEl  = $('#inspectYear');
    var titleEl = $('#inspectTitle');
    var subEl   = $('#inspectSub');
    var bodyEl  = $('#inspectBody');
    var srcEl   = $('#inspectSource');
    var liveEl  = $('#inspectLive');
    var imgEl   = $('#inspectImage');
    var fbEl    = $('#inspectVisualFallback');
    var panel   = $('.inspector-panel', overlay);
    var xBtn    = $('#inspectClose');

    var PROJECT_DATA = {
      rankraft: {
        name: 'Rankraft',
        year: '2025',
        sub: 'AI Resume Analyser — College Minor Project',
        problem: "Job seekers can't tell whether their resume actually matches the role they're applying for.",
        approach: "An NLP analyser that scores a resume against a job description and surfaces missing keywords and skill gaps.",
        result: "TF-IDF keyword matching across a skill dictionary, wrapped in a simple guided flow with visual insight.",
        stack: 'Python · NLP · Streamlit · Flask',
        source: 'https://github.com/Utkasrhr3127/Rankraft',
        live: '',
        image: 'assets/rankraft-preview.png',
        fallback: 'Rankraft'
      },
      samewave: {
        name: 'SameWave',
        year: '2025',
        sub: 'Synced Listening Room',
        problem: "Long-distance friends can't listen to music together in real time.",
        approach: "A private-room web app with real-time playback sync built on Socket.IO, plus shared playback controls.",
        result: "Sub-second playback sync across rooms, in a minimal, warm interface — with reliable room management.",
        stack: 'Node.js · Express · Socket.IO · HTML / CSS / JS',
        source: 'https://github.com/Utkasrhr3127',
        live: 'https://dainty-frangipane-302644.netlify.app/',
        image: 'assets/samewave-preview.png',
        fallback: 'SameWave'
      }
    };

    var lastFocus = null;
    var focusables = [];
    var isOpen = false;

    function setFocusableList() {
      focusables = $$(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        panel
      ).filter(function (el) { return el.offsetParent !== null; });
    }

    function trapTab(e) {
      if (e.key !== 'Tab') return;
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && doc.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && doc.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }

    function scrollbarWidth() {
      return window.innerWidth - doc.documentElement.clientWidth;
    }

    function open(id) {
      var data = PROJECT_DATA[id];
      if (!data) return;
      if (isOpen) return;
      isOpen = true;

      if (numEl)   numEl.textContent  = (id === 'rankraft' ? '01' : '02');
      if (yearEl)  yearEl.textContent = data.year;
      if (titleEl) titleEl.textContent = data.name;
      if (subEl)   subEl.textContent  = data.sub;

      if (imgEl) {
        imgEl.classList.remove('is-loaded', 'is-failed');
        imgEl.src = data.image;
        imgEl.alt = data.name + ' screenshot';
        imgEl.onload  = function () { imgEl.classList.add('is-loaded'); };
        imgEl.onerror = function () { imgEl.classList.add('is-failed'); };
      }
      if (fbEl) fbEl.textContent = data.fallback;

      if (bodyEl) {
        bodyEl.innerHTML = '';
        var rows = [
          ['Problem',  data.problem],
          ['Approach', data.approach],
          ['Result',   data.result],
          ['Stack',    data.stack]
        ];
        rows.forEach(function (row) {
          if (!row[1]) return;
          var wrap = doc.createElement('div');
          wrap.className = 'inspector-row';
          var dt = doc.createElement('dt');
          dt.textContent = row[0];
          var dd = doc.createElement('dd');
          dd.textContent = row[1];
          wrap.appendChild(dt);
          wrap.appendChild(dd);
          bodyEl.appendChild(wrap);
        });
      }

      if (srcEl) {
        if (data.source) { srcEl.href = data.source; srcEl.hidden = false; }
        else srcEl.hidden = true;
      }
      if (liveEl) {
        if (data.live) { liveEl.href = data.live; liveEl.hidden = false; }
        else liveEl.hidden = true;
      }

      lastFocus = doc.activeElement;
      overlay.hidden = false;
      requestAnimationFrame(function () { overlay.classList.add('is-open'); });
      doc.body.style.overflow = 'hidden';
      doc.body.style.paddingRight = scrollbarWidth() + 'px';

      setTimeout(function () {
        setFocusableList();
        if (xBtn) xBtn.focus();
        doc.addEventListener('keydown', trapTab);
      }, 60);
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      overlay.classList.remove('is-open');
      doc.removeEventListener('keydown', trapTab);
      setTimeout(function () {
        overlay.hidden = true;
        doc.body.style.overflow = '';
        doc.body.style.paddingRight = '';
        if (lastFocus && lastFocus.focus) lastFocus.focus();
      }, 380);
    }

    /* Wire project-open buttons */
    $$('.project-open').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var id = btn.getAttribute('data-inspect-target');
        open(id);
      });
    });

    /* Wire every close surface */
    $$('[data-inspect-close]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        close();
      });
    });

    /* Belt-and-braces: bind the × directly if it exists */
    if (xBtn) {
      xBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        close();
      });
    }

    /* Escape key */
    doc.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!overlay.classList.contains('is-open')) return;
      e.preventDefault();
      close();
    });
  })();

  /* ─────────────────────────────────────────────────────────
     17 · CONTACT — copy email + letter repel
     ───────────────────────────────────────────────────────── */
  (function contact() {
    var copyBtn = $('.contact-link-copy');
    if (copyBtn) {
      var label = $('#emailLabel');
      var hint  = $('#emailHint');
      var live  = $('#a11yLive');
      var original = label ? label.textContent : 'Email';
      var resetTimer = null;

      copyBtn.addEventListener('click', function () {
        var text = copyBtn.getAttribute('data-copy') || '';

        function done() {
          copyBtn.classList.add('is-copied');
          if (label) label.textContent = 'Copied ✓';
          if (hint)  hint.textContent  = 'On your clipboard';
          if (live)  live.textContent  = 'Email address copied to clipboard.';
          clearTimeout(resetTimer);
          resetTimer = setTimeout(function () {
            copyBtn.classList.remove('is-copied');
            if (label) label.textContent = original;
            if (hint)  hint.textContent  = 'Click to copy';
            if (live)  live.textContent  = '';
          }, 2200);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(done);
        } else {
          var ta = doc.createElement('textarea');
          ta.value = text;
          ta.style.position = 'absolute';
          ta.style.left = '-9999px';
          doc.body.appendChild(ta);
          ta.select();
          try { doc.execCommand('copy'); } catch (e) {}
          doc.body.removeChild(ta);
          done();
        }
      });
    }

    var huge = $('#contactHuge');
    if (huge && !reduceMotion && finePointer) {
      var letters = $$('.contact-letter', huge);
      var local = letters.map(function (L) { return { el: L, x: 0, y: 0, tx: 0, ty: 0 }; });
      var inside = false;

      huge.addEventListener('pointerenter', function () { inside = true; repaint.wake(); }, { passive: true });
      huge.addEventListener('pointerleave', function () {
        inside = false;
        local.forEach(function (l) { l.tx = 0; l.ty = 0; });
        repaint.wake();
      }, { passive: true });
      huge.addEventListener('pointermove', function (e) {
        local.forEach(function (l) {
          var r = l.el.getBoundingClientRect();
          var cx = r.left + r.width / 2;
          var cy = r.top + r.height / 2;
          var dx = e.clientX - cx, dy = e.clientY - cy;
          var dist = Math.sqrt(dx * dx + dy * dy);
          var force = Math.max(0, 1 - dist / 260);
          l.tx = dx * force * 0.08;
          l.ty = dy * force * 0.12;
        });
        repaint.wake();
      }, { passive: true });

      var repaint = Scheduler.register(function () {
        var any = false;
        local.forEach(function (l) {
          l.x = lerp(l.x, l.tx, 0.14);
          l.y = lerp(l.y, l.ty, 0.14);
          if (Math.abs(l.x - l.tx) > 0.05 || Math.abs(l.y - l.ty) > 0.05 || inside) {
            l.el.style.transform = 'translate3d(' + l.x.toFixed(2) + 'px,' + l.y.toFixed(2) + 'px,0)';
            any = true;
          } else if (l.el.style.transform) {
            l.el.style.transform = '';
          }
        });
        return any;
      });
    }
  })();

  /* ─────────────────────────────────────────────────────────
     18 · COMMAND PALETTE
     ───────────────────────────────────────────────────────── */
  (function palette() {
    var overlay = $('#palette');
    var input   = $('#paletteInput');
    var list    = $('#paletteList');
    if (!overlay || !list) return;

    var COMMANDS = [
      { label: 'Go to Work',        hint: '02', action: function () { scrollToId('work'); } },
      { label: 'Go to About',       hint: '03', action: function () { scrollToId('about'); } },
      { label: 'Go to Skills',      hint: '04', action: function () { scrollToId('skills'); } },
      { label: 'Go to Experience',  hint: '05', action: function () { scrollToId('experience'); } },
      { label: 'Go to Experiments', hint: '06', action: function () { scrollToId('experiments'); } },
      { label: 'Go to Contact',     hint: '07', action: function () { scrollToId('contact'); } },
      { label: 'Download Résumé',   hint: 'PDF', action: function () { window.location.href = 'resume.pdf'; } },
      { label: 'Toggle negative',   hint: 'UUU', action: function () { doc.dispatchEvent(new CustomEvent('inkdrop:toggle')); } },
      { label: 'Copy email',        hint: '⧉',   action: function () {
          var m = doc.querySelector('[data-copy]');
          if (m && navigator.clipboard) navigator.clipboard.writeText(m.getAttribute('data-copy'));
        } },
      { label: 'GitHub',            hint: '↗',   action: function () { window.open('https://github.com/Utkasrhr3127', '_blank', 'noopener'); } }
    ];

    function scrollToId(id) {
      var el = doc.getElementById(id);
      if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }

    var active = 0;
    var filtered = COMMANDS.slice();
    var lastFocus = null;

    function render() {
      list.innerHTML = '';
      if (!filtered.length) {
        var empty = doc.createElement('li');
        empty.className = 'palette-item';
        empty.textContent = 'No matches';
        empty.setAttribute('aria-disabled', 'true');
        list.appendChild(empty);
        return;
      }
      filtered.forEach(function (cmd, i) {
        var li = doc.createElement('li');
        li.className = 'palette-item' + (i === active ? ' is-active' : '');
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', i === active ? 'true' : 'false');
        li.dataset.index = i;

        var num = doc.createElement('span');
        num.className = 'palette-item-num';
        num.textContent = String(i + 1).padStart(2, '0');

        var lbl = doc.createElement('span');
        lbl.textContent = cmd.label;

        var hint = doc.createElement('span');
        hint.className = 'palette-item-hint';
        hint.textContent = cmd.hint || '';

        li.appendChild(num);
        li.appendChild(lbl);
        li.appendChild(hint);
        list.appendChild(li);
      });
    }

    function filter(q) {
      var query = (q || '').toLowerCase().trim();
      filtered = !query ? COMMANDS.slice() : COMMANDS.filter(function (c) {
        return c.label.toLowerCase().indexOf(query) !== -1;
      });
      active = 0;
      render();
    }

    function openPalette() {
      lastFocus = doc.activeElement;
      overlay.hidden = false;
      requestAnimationFrame(function () { overlay.classList.add('is-open'); });
      filter('');
      doc.body.style.overflow = 'hidden';
      setTimeout(function () {
        if (input) { input.value = ''; input.focus(); }
      }, 40);
    }

    function closePalette() {
      overlay.classList.remove('is-open');
      setTimeout(function () {
        overlay.hidden = true;
        doc.body.style.overflow = '';
        if (lastFocus && lastFocus.focus) lastFocus.focus();
      }, 240);
    }

    list.addEventListener('click', function (e) {
      var li = e.target.closest('.palette-item');
      if (!li) return;
      var idx = parseInt(li.dataset.index, 10);
      if (isNaN(idx)) return;
      var cmd = filtered[idx];
      if (cmd) { cmd.action(); closePalette(); }
    });

    var trigger = $('#paletteTrigger');
    if (trigger) trigger.addEventListener('click', openPalette);

    doc.addEventListener('keydown', function (e) {
      var tag = (doc.activeElement && doc.activeElement.tagName) || '';
      var isTyping = tag === 'INPUT' || tag === 'TEXTAREA' ||
                     (doc.activeElement && doc.activeElement.isContentEditable);

      if (!isTyping) {
        if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
          e.preventDefault();
          if (overlay.classList.contains('is-open')) closePalette();
          else openPalette();
        }
      }

      if (!overlay.classList.contains('is-open')) return;

      if (e.key === 'Escape') { e.preventDefault(); closePalette(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        active = (active + 1) % Math.max(filtered.length, 1);
        render();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        active = (active - 1 + filtered.length) % Math.max(filtered.length, 1);
        render();
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[active]) { filtered[active].action(); closePalette(); }
      }
    });

    if (input) input.addEventListener('input', function () { filter(input.value); });

    $$('[data-palette-close]').forEach(function (el) {
      el.addEventListener('click', closePalette);
    });
  })();

  /* ─────────────────────────────────────────────────────────
     19 · EXPERIMENTS — four compact cards
     ───────────────────────────────────────────────────────── */
  (function experiments() {

    /* ── 06.1 · FIELD ── */
    (function field() {
      var cv = $('.exp-canvas[data-exp="field"]');
      if (!cv) return;
      var ctx = cv.getContext('2d');
      if (!ctx) return;

      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      var W = 0, H = 0, spacing = 22;
      var dots = [];
      var mouse = { x: -999, y: -999, active: false };
      var running = false, rafId = null;
      var mode = 'repel';
      var isVisible = false;

      var figure = cv.closest('.exp');
      var modeBtns = figure ? $$('.exp-mode', figure) : [];
      modeBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          modeBtns.forEach(function (b) {
            b.classList.remove('is-active');
            b.setAttribute('aria-pressed', 'false');
          });
          btn.classList.add('is-active');
          btn.setAttribute('aria-pressed', 'true');
          mode = btn.getAttribute('data-exp-mode') || 'repel';
        });
      });

      function resize() {
        var rect = cv.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        W = rect.width; H = rect.height;
        cv.width  = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        spacing = W < 260 ? 18 : 22;
        var cols = Math.max(4, Math.floor(W / spacing));
        var rows = Math.max(3, Math.floor(H / spacing));
        var ox = (W - (cols - 1) * spacing) / 2;
        var oy = (H - (rows - 1) * spacing) / 2;
        dots.length = 0;
        for (var r = 0; r < rows; r++) {
          for (var c = 0; c < cols; c++) {
            dots.push({
              hx: ox + c * spacing, hy: oy + r * spacing,
              x:  ox + c * spacing, y:  oy + r * spacing
            });
          }
        }
      }

      function render() {
        if (!running) return;
        ctx.clearRect(0, 0, W, H);
        var dir = mode === 'attract' ? -1 : 1;
        var R = spacing * 4;
        var R2 = R * R;
        var redR2 = (spacing * 2.4) * (spacing * 2.4);

        for (var i = 0; i < dots.length; i++) {
          var d = dots[i];
          var tx = d.hx, ty = d.hy;

          if (mouse.active) {
            var dx = d.hx - mouse.x, dy = d.hy - mouse.y;
            var dist2 = dx * dx + dy * dy;
            if (dist2 < R2 && dist2 > 0.001) {
              var dist = Math.sqrt(dist2);
              var f = (R - dist) / R;
              f *= f;
              tx = d.hx + (dx / dist) * f * spacing * 2.1 * dir;
              ty = d.hy + (dy / dist) * f * spacing * 2.1 * dir;
            }
          }

          d.x = lerp(d.x, tx, 0.14);
          d.y = lerp(d.y, ty, 0.14);

          var isRed = false;
          if (mouse.active) {
            var mdx = d.x - mouse.x, mdy = d.y - mouse.y;
            if (mdx * mdx + mdy * mdy < redR2) isRed = true;
          }

          ctx.beginPath();
          ctx.arc(d.x, d.y, 1.1, 0, Math.PI * 2);
          ctx.fillStyle = isRed ? '#e10600' : 'rgba(19,19,17,0.55)';
          ctx.fill();
        }
        rafId = requestAnimationFrame(render);
      }

      function start() { if (running) return; running = true; rafId = requestAnimationFrame(render); }
      function stop()  { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = null; }

      cv.addEventListener('pointermove', function (e) {
        var rect = cv.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
      }, { passive: true });
      cv.addEventListener('pointerleave', function () { mouse.active = false; }, { passive: true });

      var rtimer = null;
      window.addEventListener('resize', function () {
        clearTimeout(rtimer);
        rtimer = setTimeout(resize, 140);
      }, { passive: true });

      doc.addEventListener('visibilitychange', function () {
        if (doc.hidden) stop();
        else if (isVisible) start();
      });

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          isVisible = entries[0].isIntersecting;
          if (isVisible && !doc.hidden) start();
          else stop();
        }, { threshold: 0.05 }).observe(cv);
      } else { isVisible = true; start(); }

      resize();

      if (reduceMotion) {
        ctx.clearRect(0, 0, W, H);
        for (var ri = 0; ri < dots.length; ri++) {
          ctx.beginPath();
          ctx.arc(dots[ri].hx, dots[ri].hy, 1, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(19,19,17,0.4)';
          ctx.fill();
        }
      }
    })();

    /* ── 06.2 · SYNC ── */
    (function sync() {
      var cv = $('.exp-canvas[data-exp="sync"]');
      if (!cv) return;
      var ctx = cv.getContext('2d');
      if (!ctx) return;

      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      var W = 0, H = 0;
      var running = false, rafId = null;
      var t0 = performance.now();
      var isVisible = false;

      var figure = cv.closest('.exp');
      var readout = figure ? figure.querySelector('[data-exp-val="sync"]') : null;
      var lastSyncShown = -1;

      function resize() {
        var rect = cv.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        W = rect.width; H = rect.height;
        cv.width  = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      function autoOffset(seconds) {
        var cycle = 8;
        var p = (seconds % cycle) / cycle;
        if (p < 0.7) {
          var k = p / 0.7;
          var eased = 1 - Math.pow(1 - k, 2);
          return (1 - eased) * Math.PI;
        }
        return 0;
      }

      function drawWave(yBase, phaseVal, offset, color, alpha) {
        ctx.beginPath();
        var amp = H * 0.18;
        var steps = 80;
        for (var i = 0; i <= steps; i++) {
          var x = (i / steps) * W;
          var k = (i / steps) * Math.PI * 3;
          var y = yBase + Math.sin(k + phaseVal + offset) * amp;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      function render(now) {
        if (!running) return;
        var seconds = (now - t0) / 1000;
        var phaseVal = seconds * 0.9;
        var offset = autoOffset(seconds);

        ctx.clearRect(0, 0, W, H);

        ctx.strokeStyle = 'rgba(19,19,17,0.06)';
        ctx.beginPath();
        ctx.moveTo(0, H / 2);
        ctx.lineTo(W, H / 2);
        ctx.stroke();

        drawWave(H / 2, phaseVal, 0, '#131311', 0.75);
        drawWave(H / 2, phaseVal, offset, '#e10600', 0.9);

        var locked = offset < 0.04;
        ctx.beginPath();
        ctx.arc(W - 14, H / 2, locked ? 3.2 : 2, 0, Math.PI * 2);
        ctx.fillStyle = locked ? '#e10600' : 'rgba(19,19,17,0.35)';
        ctx.fill();

        if (readout) {
          var syncPct = Math.round((1 - Math.min(offset / Math.PI, 1)) * 100);
          if (syncPct !== lastSyncShown) {
            readout.textContent = syncPct + '%';
            lastSyncShown = syncPct;
          }
        }

        rafId = requestAnimationFrame(render);
      }

      function start() { if (running) return; running = true; rafId = requestAnimationFrame(render); }
      function stop()  { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = null; }

      var rtimer = null;
      window.addEventListener('resize', function () {
        clearTimeout(rtimer);
        rtimer = setTimeout(resize, 140);
      }, { passive: true });

      doc.addEventListener('visibilitychange', function () {
        if (doc.hidden) stop();
        else if (isVisible) start();
      });

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          isVisible = entries[0].isIntersecting;
          if (isVisible && !doc.hidden) start();
          else stop();
        }, { threshold: 0.05 }).observe(cv);
      } else { isVisible = true; start(); }

      resize();

      if (reduceMotion) {
        ctx.clearRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(19,19,17,0.4)';
        ctx.beginPath();
        ctx.moveTo(0, H / 2);
        ctx.lineTo(W, H / 2);
        ctx.stroke();
      }
    })();

    /* ── 06.3 · LIFE ── */
    (function life() {
      var cv = $('.exp-canvas[data-exp="life"]');
      if (!cv) return;
      var ctx = cv.getContext('2d');
      if (!ctx) return;

      var W = 60, H = 60;
      var A = new Uint8Array(W * H);
      var B = new Uint8Array(W * H);
      var running = false, rafId = null;
      var playState = !reduceMotion;
      var last = 0;
      var dirty = true;
      var isVisible = false;
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      var cellW = 1, cellH = 1;

      var figure = cv.closest('.exp');
      var seedBtn = figure ? figure.querySelector('[data-life="seed"]') : null;
      var runBtn  = figure ? figure.querySelector('[data-life="run"]') : null;

      function layout() {
        var rect = cv.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        cv.width  = Math.round(rect.width * dpr);
        cv.height = Math.round(rect.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cellW = rect.width / W;
        cellH = rect.height / H;
        dirty = true;
      }

      function seed() {
        for (var i = 0; i < A.length; i++) A[i] = Math.random() < 0.18 ? 1 : 0;
        dirty = true;
      }

      function paint(e) {
        var rect = cv.getBoundingClientRect();
        var x = Math.floor((e.clientX - rect.left) / rect.width * W);
        var y = Math.floor((e.clientY - rect.top) / rect.height * H);
        for (var j = -1; j <= 1; j++) {
          for (var i = -1; i <= 1; i++) {
            var yy = y + j, xx = x + i;
            if (yy < 0) yy = H - 1; if (yy >= H) yy = 0;
            if (xx < 0) xx = W - 1; if (xx >= W) xx = 0;
            A[yy * W + xx] = 1;
          }
        }
        dirty = true;
      }

      function step() {
        for (var y = 0; y < H; y++) {
          for (var x = 0; x < W; x++) {
            var n = 0;
            for (var j = -1; j <= 1; j++) {
              for (var i = -1; i <= 1; i++) {
                if (!i && !j) continue;
                var yy = y + j, xx = x + i;
                if (yy < 0) yy = H - 1; if (yy >= H) yy = 0;
                if (xx < 0) xx = W - 1; if (xx >= W) xx = 0;
                n += A[yy * W + xx];
              }
            }
            var alive = A[y * W + x];
            B[y * W + x] = (n === 3 || (alive && n === 2)) ? 1 : 0;
          }
        }
        var T = A; A = B; B = T;
        dirty = true;
      }

      function paintCanvas() {
        if (!dirty) return;
        dirty = false;
        ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.fillStyle = 'rgba(19,19,17,0.85)';
        var cw = cv.width / W, ch = cv.height / H;
        var pad = Math.max(1, cw * 0.12);
        for (var k = 0; k < A.length; k++) {
          if (!A[k]) continue;
          var x = (k % W) * cw;
          var y = ((k / W) | 0) * ch;
          ctx.fillRect(x + pad, y + pad, cw - pad * 2, ch - pad * 2);
        }
      }

      function render(now) {
        if (!running) return;
        if (playState && now - last > 120) {
          last = now;
          step();
        }
        paintCanvas();
        rafId = requestAnimationFrame(render);
      }

      function start() { if (running) return; running = true; last = performance.now(); rafId = requestAnimationFrame(render); }
      function stop()  { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = null; }

      cv.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'mouse' || e.buttons) { paint(e); }
      });
      cv.addEventListener('pointerdown', paint);

      if (seedBtn) seedBtn.addEventListener('click', function () { seed(); });
      if (runBtn) {
        runBtn.addEventListener('click', function () {
          playState = !playState;
          runBtn.textContent = playState ? 'Pause' : 'Play';
          runBtn.setAttribute('aria-pressed', playState ? 'true' : 'false');
          runBtn.classList.toggle('is-active', playState);
        });
      }

      var rtimer = null;
      window.addEventListener('resize', function () {
        clearTimeout(rtimer);
        rtimer = setTimeout(layout, 140);
      }, { passive: true });

      doc.addEventListener('visibilitychange', function () {
        if (doc.hidden) stop();
        else if (isVisible) start();
      });

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          isVisible = entries[0].isIntersecting;
          if (isVisible && !doc.hidden) start();
          else stop();
        }, { threshold: 0.05 }).observe(cv);
      } else { isVisible = true; start(); }

      layout();
      seed();
      paintCanvas();
    })();

    /* ── 06.4 · HASH ── */
    (function hash() {
      var cv = $('.exp-canvas[data-exp="hash"]');
      if (!cv) return;
      var ctx = cv.getContext('2d');
      if (!ctx) return;

      var figure = cv.closest('.exp');
      var input = figure ? figure.querySelector('.exp-input') : null;
      if (!input) return;

      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      var size = 0;

      function layout() {
        var rect = cv.getBoundingClientRect();
        if (!rect.width) return;
        size = rect.width;
        cv.width  = Math.round(size * dpr);
        cv.height = Math.round(size * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        draw();
      }

      function simpleHash(str) {
        var out = new Uint8Array(16);
        var h = 2166136261 >>> 0;
        for (var i = 0; i < str.length; i++) {
          h ^= str.charCodeAt(i);
          h = Math.imul(h, 16777619) >>> 0;
        }
        for (var k = 0; k < 16; k++) {
          out[k] = (h >>> (k % 4 * 8)) & 0xff;
          h = Math.imul(h ^ (h >>> 13), 16777619) >>> 0;
        }
        return out;
      }

      function renderGlyph(buf) {
        if (!size) return;
        var cell = size / 8;
        ctx.clearRect(0, 0, size, size);
        for (var y = 0; y < 8; y++) {
          for (var x = 0; x < 4; x++) {
            var bit = (buf[y] >> x) & 1;
            if (!bit) continue;
            var isRed = (buf[8 + y] >> x) & 1;
            ctx.fillStyle = isRed ? '#e10600' : 'rgba(19,19,17,0.85)';
            ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2);
            ctx.fillRect((7 - x) * cell + 1, y * cell + 1, cell - 2, cell - 2);
          }
        }
      }

      function draw() {
        var text = input.value || ' ';
        try {
          if (window.crypto && window.crypto.subtle && window.isSecureContext) {
            /* Render a synchronous placeholder immediately, then refine
               when the async digest resolves. */
            renderGlyph(simpleHash(text));
            window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
              .then(function (hashBuf) {
                renderGlyph(new Uint8Array(hashBuf));
              })
              .catch(function () {
                renderGlyph(simpleHash(text));
              });
            return;
          }
        } catch (e) { /* ignore */ }
        renderGlyph(simpleHash(text));
      }

      var timer = null;
      input.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(draw, 120);
      });

      var rtimer = null;
      window.addEventListener('resize', function () {
        clearTimeout(rtimer);
        rtimer = setTimeout(layout, 140);
      }, { passive: true });

      layout();
    })();

  })();

  /* ─────────────────────────────────────────────────────────
     20 · LIVE FOOTER METADATA
     ───────────────────────────────────────────────────────── */
  (function liveMeta() {
    var timeEl = $('#footTime');
    if (timeEl) {
      var tickTime = function () {
        var d = new Date();
        timeEl.textContent =
          String(d.getHours()).padStart(2, '0') + ':' +
          String(d.getMinutes()).padStart(2, '0');
      };
      tickTime();
      setInterval(tickTime, 30000);
    }

    var scrollEl = $('#footScroll');
    if (scrollEl) {
      var last = -1;
      var raf = null;
      var update = function () {
        var max = Math.max(1, doc.documentElement.scrollHeight - window.innerHeight);
        var pct = Math.round(clamp((window.scrollY || 0) / max, 0, 1) * 100);
        if (pct !== last) {
          scrollEl.textContent = pct + '%';
          last = pct;
        }
        raf = null;
      };
      window.addEventListener('scroll', function () {
        if (!raf) raf = requestAnimationFrame(update);
      }, { passive: true });
      update();
    }
  })();

  /* ─────────────────────────────────────────────────────────
     21 · INKDROP EASTER EGG
     Press U three times within 900ms.
     ───────────────────────────────────────────────────────── */
  (function inkdrop() {
    var buffer = '';
    var timer = null;
    var active = false;

    function toggle(force) {
      active = (typeof force === 'boolean') ? force : !active;
      root.classList.toggle('inkdrop', active);
      var live = doc.getElementById('a11yLive');
      if (live) live.textContent = active ? 'Negative on. Press U three times or Escape to return.' : 'Negative off.';
    }
    doc.addEventListener('inkdrop:toggle', function () { toggle(); });

    doc.addEventListener('keydown', function (e) {
      var tag = (doc.activeElement && doc.activeElement.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Escape' && active &&
          !doc.querySelector('.palette:not([hidden]), .inspector:not([hidden])')) {
        toggle(false); return;
      }
      if (e.key.toLowerCase() !== 'u') return;

      buffer += 'u';
      clearTimeout(timer);
      timer = setTimeout(function () { buffer = ''; }, 900);

      if (buffer.length >= 3) {
        buffer = '';
        toggle();
      }
    });
  })();

  /* ─────────────────────────────────────────────────────────
     22 · THREE.JS SCENE — capability-tiered
     ───────────────────────────────────────────────────────── */
  (function three() {
    function skipWorld() { if (window.__threeReady) window.__threeReady(); }
    if (reduceMotion) { skipWorld(); return; }
    if (coarse && (navigator.hardwareConcurrency || 4) <= 4) { skipWorld(); return; }

    var canvas = $('#scene-canvas');
    if (!canvas) { skipWorld(); return; }

    var tier = (function () {
      var cores = navigator.hardwareConcurrency || 4;
      var mem   = (typeof navigator.deviceMemory === 'number') ? navigator.deviceMemory : 8;
      var dpr   = window.devicePixelRatio || 1;

      if (coarse) return 'light';
      if (cores <= 4 || mem <= 4) return 'balanced';
      if (cores <= 6 || dpr > 2.5) return 'high';
      return 'ultra';
    })();

    var TIER = {
      ultra:    { pixelRatio: 1.75, seg: 160, nodes: 24, blocks: true,  pillar: true,  antialias: true  },
      high:     { pixelRatio: 1.5,  seg: 128, nodes: 20, blocks: true,  pillar: true,  antialias: true  },
      balanced: { pixelRatio: 1.25, seg: 96,  nodes: 16, blocks: true,  pillar: false, antialias: false },
      light:    { pixelRatio: 1,    seg: 72,  nodes: 12, blocks: false, pillar: false, antialias: false }
    }[tier];

    var LOW_POWER = tier === 'balanced' || tier === 'light';

    var loaded = false, initialised = false;

    function loadThree(cb) {
      if (window.THREE) { cb(); return; }
      if (loaded) return;
      loaded = true;
      var s = doc.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      s.async = true;
      s.onload = cb;
      s.onerror = function () { if (window.__threeReady) window.__threeReady(); };
      doc.head.appendChild(s);
    }

    function idle(cb) {
      if ('requestIdleCallback' in window) requestIdleCallback(cb, { timeout: 2400 });
      else setTimeout(cb, 900);
    }

    idle(function () {
      loadThree(function () {
        if (initialised) return;
        initialised = true;
        try {
          init(canvas);
          if (window.__threeReady) window.__threeReady();
        } catch (e) {
          if (window.__threeReady) window.__threeReady();
        }
      });
    });

    function init(canvas) {
      var W = window.innerWidth, H = window.innerHeight;

      var renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: TIER.antialias,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, TIER.pixelRatio));
      renderer.setSize(W, H, false);
      renderer.setClearColor(0x000000, 0);

      var scene  = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
      camera.position.set(0, 0, 7);

      var root = new THREE.Group();
      scene.add(root);

      var INK = new THREE.Color(0x131311);
      var RED = new THREE.Color(0xe10600);

      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      var keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
      keyLight.position.set(3, 5, 6);
      scene.add(keyLight);
      var rimLight = new THREE.DirectionalLight(0xffffff, 0.35);
      rimLight.position.set(-5, -3, -4);
      scene.add(rimLight);

      var interactive = [];

      var ring1 = new THREE.Mesh(
        new THREE.TorusGeometry(2.35, 0.006, 6, TIER.seg),
        new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.32 })
      );
      ring1.position.set(1.55, 0.1, -1.8);
      ring1.rotation.set(0.18, -0.35, 0.12);
      root.add(ring1);

      var ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(1.05, 0.008, 6, Math.round(TIER.seg * 0.8)),
        new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.85 })
      );
      ring2.position.set(1.2, -0.15, 1.4);
      ring2.rotation.set(0.4, 0.2, -0.28);
      root.add(ring2);

      var ico = new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(0.95, LOW_POWER ? 0 : 1)),
        new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.28 })
      );
      ico.position.set(-2.4, 0.9, -0.6);
      root.add(ico);
      interactive.push({ obj: ico, strength: 0.5 });

      var gridGeo = new THREE.BufferGeometry();
      var gridVerts = [];
      var gridSize = 14, gridDiv = 12, half = gridSize / 2, step = gridSize / gridDiv;
      for (var gi = 0; gi <= gridDiv; gi++) {
        var gp = -half + gi * step;
        gridVerts.push(-half, -3.2, gp, half, -3.2, gp);
        gridVerts.push(gp, -3.2, -half, gp, -3.2, half);
      }
      gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridVerts, 3));
      var grid = new THREE.LineSegments(
        gridGeo,
        new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.055 })
      );
      grid.position.z = -2;
      root.add(grid);

      if (TIER.blocks) {
        var boxGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
        var blockMat = new THREE.MeshStandardMaterial({
          color: 0x1e1c19, roughness: 0.7, metalness: 0.1
        });
        var blocks = [
          { p: [-4.2, -0.9, -3.4], r: [0.4, 0.5, 0.2], s: 0.8 },
          { p: [ 4.3,  1.3, -4.0], r: [0.2, 0.8, 0.1], s: 1.0 },
          { p: [-3.6, -1.6, -3.8], r: [0.7, 0.3, 0.5], s: 0.7 },
          { p: [ 4.0, -1.4, -3.6], r: [0.1, 0.6, 0.3], s: 0.9 }
        ];
        blocks.forEach(function (b) {
          var m = new THREE.Mesh(boxGeo, blockMat);
          m.position.set(b.p[0], b.p[1], b.p[2]);
          m.rotation.set(b.r[0], b.r[1], b.r[2]);
          m.scale.setScalar(b.s);
          root.add(m);
          interactive.push({ obj: m, strength: 0.35, base: b.p.slice() });
        });
      }

      if (TIER.pillar) {
        var pillarMat = new THREE.MeshStandardMaterial({
          color: 0xd4d0c8, roughness: 0.9, metalness: 0.02
        });
        var pillarGeo = new THREE.BoxGeometry(0.06, 3.4, 0.06);
        [{ p: [-3.6, -1.0, -3.0] }, { p: [3.8, 0.6, -3.6] }].forEach(function (pl) {
          var m = new THREE.Mesh(pillarGeo, pillarMat);
          m.position.set(pl.p[0], pl.p[1], pl.p[2]);
          m.rotation.z = (Math.random() - 0.5) * 0.08;
          root.add(m);
        });
      }

      var nodeCount = TIER.nodes;
      var nodePositions = new Float32Array(nodeCount * 3);
      var nodeVecs = [];
      for (var ni = 0; ni < nodeCount; ni++) {
        var nx = (Math.random() - 0.5) * 8;
        var ny = (Math.random() - 0.5) * 5;
        var nz = -4.5 - Math.random() * 2.5;
        nodePositions[ni * 3]     = nx;
        nodePositions[ni * 3 + 1] = ny;
        nodePositions[ni * 3 + 2] = nz;
        nodeVecs.push(new THREE.Vector3(nx, ny, nz));
      }
      var nodeGeo = new THREE.BufferGeometry();
      nodeGeo.setAttribute('position', new THREE.Float32BufferAttribute(nodePositions, 3));
      root.add(new THREE.Points(
        nodeGeo,
        new THREE.PointsMaterial({
          color: INK, size: 0.035, transparent: true, opacity: 0.5, sizeAttenuation: true
        })
      ));

      var linkVerts = [];
      for (var ai = 0; ai < nodeVecs.length; ai++) {
        for (var bi = ai + 1; bi < nodeVecs.length; bi++) {
          if (nodeVecs[ai].distanceTo(nodeVecs[bi]) < 2.0) {
            linkVerts.push(nodeVecs[ai].x, nodeVecs[ai].y, nodeVecs[ai].z);
            linkVerts.push(nodeVecs[bi].x, nodeVecs[bi].y, nodeVecs[bi].z);
          }
        }
      }
      if (linkVerts.length) {
        var linkGeo = new THREE.BufferGeometry();
        linkGeo.setAttribute('position', new THREE.Float32BufferAttribute(linkVerts, 3));
        root.add(new THREE.LineSegments(
          linkGeo,
          new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.09 })
        ));
      }

      var anchor = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 10, 10),
        new THREE.MeshBasicMaterial({ color: RED })
      );
      anchor.position.set(-1.2, 1.9, -6.5);
      root.add(anchor);

      var camX = 0, camY = 0, scrollY = 0;

      var resizeTimer = null;
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          W = window.innerWidth;
          H = window.innerHeight;
          camera.aspect = W / H;
          camera.updateProjectionMatrix();
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, TIER.pixelRatio));
          renderer.setSize(W, H, false);
        }, 140);
      }, { passive: true });

      window.addEventListener('scroll', function () {
        scrollY = window.scrollY || window.pageYOffset;
      }, { passive: true });

      var heroVisible = true, tabVisible = !doc.hidden;
      var running = false, rafId = null;
      var clock = new THREE.Clock();

      var heroEl = $('.hero');
      if (heroEl && 'IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          heroVisible = entries[0].isIntersecting;
          if (heroVisible && tabVisible) start();
          else stop();
        }, { threshold: 0, rootMargin: '20% 0px 20% 0px' }).observe(heroEl);
      }

      doc.addEventListener('visibilitychange', function () {
        tabVisible = !doc.hidden;
        if (tabVisible && heroVisible) start();
        else stop();
      });

      function loop() {
        if (!heroVisible || !tabVisible) { running = false; return; }
        var t = clock.getElapsedTime();

        var ptX = pointer.inside ? pointer.nx : 0;
        var ptY = pointer.inside ? pointer.ny : 0;
        camX = lerp(camX, ptX * 0.55, 0.045);
        camY = lerp(camY, -ptY * 0.38, 0.045);

        var scrollNorm = clamp(scrollY / Math.max(1, window.innerHeight * 1.6), 0, 1);
        camera.position.x = camX;
        camera.position.y = camY;
        camera.position.z = 7 - scrollNorm * 9;
        camera.lookAt(0, 0, 0);

        var inkBoost = root.classList.contains('inkdrop') ? 1.6 : 1;

        root.rotation.y = camX * 0.35 + t * 0.045 * inkBoost + scrollNorm * 0.35;
        root.rotation.x = -camY * 0.28 + Math.sin(t * 0.22) * 0.02;
        root.rotation.z = scrollNorm * 0.18;

        ring1.rotation.z = 0.12 + t * 0.06 * inkBoost;
        ring2.rotation.z = -0.28 - t * 0.09 * inkBoost;
        ico.rotation.y = t * 0.22 * inkBoost;
        ico.rotation.x = t * 0.14;
        ico.position.y = 0.9 + Math.sin(t * 0.55) * 0.12;
        anchor.scale.setScalar(1 + Math.sin(t * 1.6) * 0.14);

        for (var i = 0; i < interactive.length; i++) {
          var it = interactive[i];
          var base = it.base;
          var bx = base ? base[0] : it.obj.position.x;
          var by = base ? base[1] : it.obj.position.y;
          it.obj.position.x = lerp(it.obj.position.x, bx + camX * it.strength * 0.5, 0.06);
          it.obj.position.y = lerp(it.obj.position.y, by - camY * it.strength * 0.5, 0.06);
        }

        renderer.render(scene, camera);
        rafId = requestAnimationFrame(loop);
      }

      function start() {
        if (running) return;
        running = true;
        clock.start();
        rafId = requestAnimationFrame(loop);
      }
      function stop() {
        if (!running) return;
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      }

      start();
    }
  })();

})();
