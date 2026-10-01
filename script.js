/* ============================================================
   UTKARSH SHRIVASTAVA — PORTFOLIO
   v3 — 3D Enhanced
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. LOADER
     ---------------------------------------------------------- */
  const loader = document.getElementById('loader');
  const loaderText = document.querySelector('.loader-text');
  const messages = ['initializing portfolio', 'loading modules', 'compiling assets', 'ready.'];
  let msgIndex = 0;

  const msgInterval = setInterval(() => {
    msgIndex++;
    if (msgIndex < messages.length) loaderText.textContent = messages[msgIndex];
  }, 400);

  window.addEventListener('load', () => {
    setTimeout(() => {
      clearInterval(msgInterval);
      loader.classList.add('hidden');
      document.body.style.overflow = '';
    }, 1600);
  });

  document.body.style.overflow = 'hidden';

  /* ----------------------------------------------------------
     2. PARTICLE CANVAS (2D — background for all sections)
     ---------------------------------------------------------- */
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse2D = { x: null, y: null };

  const CONFIG = {
    particleCount: 55,
    maxDistance: 140,
    particleSize: 1.6,
    speed: 0.35,
    colors: ['0, 240, 255', '123, 97, 255', '0, 255, 157']
  };

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.min(CONFIG.particleCount, Math.floor((canvas.width * canvas.height) / 22000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * CONFIG.speed,
        vy: (Math.random() - 0.5) * CONFIG.speed,
        size: Math.random() * CONFIG.particleSize + 0.6,
        color: CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)]
      });
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy + (window.__sv || 0) * 0.04 * p.size;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      if (mouse2D.x !== null) {
        const dx = p.x - mouse2D.x;
        const dy = p.y - mouse2D.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0) {
          const force = (120 - dist) / 120;
          p.x += (dx / dist) * force * 1.2;
          p.y += (dy / dist) * force * 1.2;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, 0.6)`;
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.maxDistance) {
          const opacity = (1 - dist / CONFIG.maxDistance) * 0.16;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${opacity})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(drawParticles);
  }

  resizeCanvas();
  createParticles();
  drawParticles();

  window.addEventListener('resize', () => {
    resizeCanvas();
    createParticles();
  });
  window.addEventListener('mousemove', (e) => { mouse2D.x = e.clientX; mouse2D.y = e.clientY; });
  window.addEventListener('mouseout', () => { mouse2D.x = null; mouse2D.y = null; });

  /* ----------------------------------------------------------
     3. CUSTOM CURSOR (GPU transforms)
     ---------------------------------------------------------- */
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');
  let ringX = -100, ringY = -100, dotX = -100, dotY = -100;
  window.addEventListener('mousemove', (e) => { dotX = e.clientX; dotY = e.clientY; });
  window.addEventListener('mousedown', () => cursorRing.classList.add('pressed'));
  window.addEventListener('mouseup', () => cursorRing.classList.remove('pressed'));

  function animateRing() {
    ringX += (dotX - ringX) * 0.18;
    ringY += (dotY - ringY) * 0.18;
    cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  const interactiveSelectors = 'a, button, .btn, .skill-tag, .project-card, .achievement-card, .focus-card, .nav-link';
  document.querySelectorAll(interactiveSelectors).forEach((el) => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
  });

  /* ----------------------------------------------------------
     4. TYPEWRITER
     ---------------------------------------------------------- */
  const typewriterEl = document.getElementById('typewriter');
  const roles = ['CSE Student', 'Software Developer', 'Problem Solver', 'Builder of Things', 'DSA Enthusiast'];
  let roleIndex = 0, charIndex = 0, isDeleting = false;

  function typeLoop() {
    const currentRole = roles[roleIndex];
    if (!isDeleting) {
      typewriterEl.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === currentRole.length) {
        isDeleting = true;
        setTimeout(typeLoop, 2000);
        return;
      }
      setTimeout(typeLoop, 80);
    } else {
      typewriterEl.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(typeLoop, 400);
        return;
      }
      setTimeout(typeLoop, 40);
    }
  }

  setTimeout(typeLoop, 3600);

  /* ----------------------------------------------------------
     5. NAVIGATION
     ---------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const navToggle = document.getElementById('navToggle');
  const navLinksContainer = document.querySelector('.nav-links');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);

    let current = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) current = section.getAttribute('id');
    });

    navLinks.forEach((link) => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  });

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinksContainer.classList.toggle('open');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinksContainer.classList.remove('open');
    });
  });

  /* ----------------------------------------------------------
     6. SCROLL REVEAL
     ---------------------------------------------------------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  /* ----------------------------------------------------------
     7. COUNTER ANIMATION
     ---------------------------------------------------------- */
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target, 10);
          const duration = 1600;
          const startTime = performance.now();

          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target);
            if (progress < 1) requestAnimationFrame(updateCounter);
            else el.textContent = target;
          }
          requestAnimationFrame(updateCounter);
          counterObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll('.stat-number').forEach((el) => counterObserver.observe(el));

  /* 8-9. TILT + SCROLL: handled by the v4 motion layer below */

  /* ----------------------------------------------------------
     10. FOOTER YEAR
     ---------------------------------------------------------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ----------------------------------------------------------
     11. EASTER EGG
     ---------------------------------------------------------- */
  let keyBuffer = '';
  const secret = 'sudo';
  window.addEventListener('keydown', (e) => {
    keyBuffer += e.key.toLowerCase();
    if (keyBuffer.length > secret.length) keyBuffer = keyBuffer.slice(-secret.length);
    if (keyBuffer === secret) {
      document.body.style.filter = 'hue-rotate(180deg)';
      setTimeout(() => { document.body.style.filter = ''; }, 1500);
    }
  });

  /* ----------------------------------------------------------
     12. MEGA NAME
     ---------------------------------------------------------- */
  (function initMegaName() {
    const nameEl = document.getElementById('megaName');
    if (!nameEl) return;

    const text = nameEl.dataset.text || 'Utkarsh Shrivastava';
    nameEl.textContent = '';

    const words = text.split(' ');
    const allLetters = [];

    words.forEach((word, wordIdx) => {
      const wordEl = document.createElement('span');
      wordEl.className = 'word';

      for (let i = 0; i < word.length; i++) {
        const wrap = document.createElement('span');
        wrap.className = 'letter-wrap';
        const span = document.createElement('span');
        span.className = 'letter';
        span.textContent = word[i];
        wrap.appendChild(span);
        wordEl.appendChild(wrap);
        allLetters.push(span);
      }
      nameEl.appendChild(wordEl);

      if (wordIdx < words.length - 1) {
        nameEl.appendChild(document.createTextNode(' '));
      }
    });

    const total = allLetters.length;
    allLetters.forEach((letter, i) => {
      letter.style.setProperty('--i', i);
      letter.style.setProperty('--i-norm', (i / Math.max(total - 1, 1)).toFixed(4));
    });

    function scheduleGlitch() {
      const delay = 20000 + Math.random() * 10000;
      setTimeout(() => {
        nameEl.classList.add('glitching');
        setTimeout(() => nameEl.classList.remove('glitching'), 300);
        scheduleGlitch();
      }, delay);
    }
    scheduleGlitch();

    let nameRect = null;
    function refreshRect() { nameRect = nameEl.getBoundingClientRect(); }
    refreshRect();
    window.addEventListener('resize', refreshRect);
    window.addEventListener('scroll', refreshRect, { passive: true });

    const LENS_RADIUS = 180;
    let rafPending = false;
    let lastX = -9999, lastY = -9999;

    window.addEventListener('mousemove', (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(applyGlow);
      }
    });

    function applyGlow() {
      rafPending = false;
      if (!nameRect) return;

      const buffer = LENS_RADIUS;
      if (
        lastX < nameRect.left - buffer ||
        lastX > nameRect.right + buffer ||
        lastY < nameRect.top - buffer ||
        lastY > nameRect.bottom + buffer
      ) {
        if (allLetters[0].style.filter) {
          for (let i = 0; i < allLetters.length; i++) {
            allLetters[i].style.filter = '';
          }
        }
        return;
      }

      for (let i = 0; i < allLetters.length; i++) {
        const letter = allLetters[i];
        const r = letter.getBoundingClientRect();
        const lx = r.left + r.width / 2;
        const ly = r.top + r.height / 2;
        const dx = lastX - lx;
        const dy = lastY - ly;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < LENS_RADIUS) {
          const force = (LENS_RADIUS - dist) / LENS_RADIUS;
          const bright = 1 + force * 0.6;
          letter.style.filter = `brightness(${bright})`;
        } else if (letter.style.filter) {
          letter.style.filter = '';
        }
      }
    }
  })();

  /* ============================================================
     13. THREE.JS — 3D INTERACTIVE CORE
     ============================================================ */
  (function initThreeCore() {
    if (typeof THREE === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    /* ---------- Renderer ---------- */
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    /* ---------- Scene ---------- */
    const scene = new THREE.Scene();

    /* ---------- Camera ---------- */
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 9);

    /* ---------- Root group (for scroll rotation) ---------- */
    const root = new THREE.Group();
    scene.add(root);

    /* ---------- Inner glowing core (custom fresnel shader) ---------- */
    const coreGeometry = new THREE.IcosahedronGeometry(1.9, 4);

    const coreMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime:   { value: 0 },
        uColorA: { value: new THREE.Color('#00f0ff') },
        uColorB: { value: new THREE.Color('#7b61ff') },
        uPulse:  { value: 0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vPosition = mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uPulse;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 viewDir = normalize(-vPosition);
          float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 2.2);

          // Inner pattern based on position
          float pattern = sin(vPosition.y * 4.0 + uTime * 1.5) * 0.5 + 0.5;
          pattern *= sin(vPosition.x * 3.0 - uTime * 1.2) * 0.5 + 0.5;

          vec3 color = mix(uColorA, uColorB, fresnel);
          color += uColorB * pattern * 0.35;
          color += uColorA * uPulse * 0.8;

          float alpha = fresnel * 0.9 + pattern * 0.15 + 0.05;
          alpha = clamp(alpha, 0.0, 1.0);

          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.FrontSide
    });

    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    root.add(core);

    /* ---------- Outer wireframe icosahedron ---------- */
    const wireGeo = new THREE.IcosahedronGeometry(3.0, 1);
    const wireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry(wireGeo),
      new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending
      })
    );
    root.add(wireframe);

    /* ---------- Second wireframe (larger, slower, violet) ---------- */
    const wireGeo2 = new THREE.IcosahedronGeometry(4.0, 0);
    const wireframe2 = new THREE.LineSegments(
      new THREE.WireframeGeometry(wireGeo2),
      new THREE.LineBasicMaterial({
        color: 0x7b61ff,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending
      })
    );
    root.add(wireframe2);

    /* ---------- Particle shell around the core ---------- */
    const particleCount = isMobile ? 400 : 900;
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);

    const palette = [
      new THREE.Color('#00f0ff'),
      new THREE.Color('#7b61ff'),
      new THREE.Color('#00ff9d'),
      new THREE.Color('#ffffff')
    ];

    for (let i = 0; i < particleCount; i++) {
      const r = 3.2 + Math.random() * 2.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      sizes[i] = Math.random() * 0.06 + 0.02;
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false
    });

    const particleShell = new THREE.Points(pGeo, pMat);
    root.add(particleShell);

    /* ---------- Orbiting electrons ---------- */
    const electronGeo = new THREE.SphereGeometry(0.07, 12, 12);
    const electrons = [];
    const electronColors = [0x00ff9d, 0x00f0ff, 0x7b61ff];
    const orbitsData = [
      { radius: 3.6, speed:  0.65, incline: 0.5, phase: 0.0 },
      { radius: 4.1, speed: -0.48, incline: 0.9, phase: 2.1 },
      { radius: 3.3, speed:  0.82, incline: 0.3, phase: 4.2 }
    ];

    orbitsData.forEach((data, idx) => {
      const mat = new THREE.MeshBasicMaterial({
        color: electronColors[idx],
        transparent: true,
        opacity: 0.9
      });
      const mesh = new THREE.Mesh(electronGeo, mat);
      // glow halo around each electron
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 12, 12),
        new THREE.MeshBasicMaterial({
          color: electronColors[idx],
          transparent: true,
          opacity: 0.25,
          blending: THREE.AdditiveBlending
        })
      );
      mesh.add(halo);
      mesh.userData = data;
      root.add(mesh);
      electrons.push(mesh);
    });

    /* ---------- Ambient light (for any lit materials later) ---------- */
    scene.add(new THREE.AmbientLight(0x00f0ff, 0.6));

    /* ---------- Mouse interaction ---------- */
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    window.addEventListener('mousemove', (e) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    /* ---------- Click pulse ---------- */
    let pulse = 0;
    window.addEventListener('click', () => { pulse = 1; });

    /* ---------- Scroll interaction ---------- */
    let scrollProgress = 0; // 0 → 1 as we scroll past hero
    function updateScrollProgress() {
      const heroHeight = window.innerHeight;
      scrollProgress = Math.min(1, Math.max(0, window.scrollY / heroHeight));
      // Fade canvas out
      const opacity = Math.max(0.3, 1 - scrollProgress * 0.9);
      canvas.style.opacity = opacity.toFixed(3);
    }
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    /* ---------- Resize ---------- */
    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    /* ---------- Visibility (pause when tab hidden) ---------- */
    let visible = true;
    document.addEventListener('visibilitychange', () => {
      visible = !document.hidden;
    });

    /* ---------- Animation loop ---------- */
    const clock = new THREE.Clock();
    let rafId;

    function animate() {
      rafId = requestAnimationFrame(animate);

      if (!visible) return;

      const time = clock.getElapsedTime();

      // Smooth mouse lerp
      current.x += (target.x - current.x) * 0.05;
      current.y += (target.y - current.y) * 0.05;

      // Camera follows mouse slightly
      camera.position.x = current.x * 0.9;
      camera.position.y = current.y * 0.7;
      camera.lookAt(0, 0, 0);

      // Root rotation — driven by mouse + gentle idle
      root.rotation.y = current.x * 0.4 + time * 0.08;
      root.rotation.x = -current.y * 0.3;

      // Scroll reaction: rotate + tilt + slight dolly
      const pageP = window.__pageProgress || 0;
      root.rotation.z = scrollProgress * 0.6 + pageP * Math.PI * 2;
      root.position.y = -scrollProgress * 1.5;
      root.position.x += ((window.innerWidth > 900 ? scrollProgress * 3.2 : 0) - root.position.x) * 0.06;
      root.scale.setScalar(1 - scrollProgress * 0.25);

      // Core rotation + fresnel time
      core.rotation.y = time * 0.15;
      core.rotation.x = time * 0.1;
      coreMaterial.uniforms.uTime.value = time;

      // Click pulse decay
      if (pulse > 0) {
        pulse = Math.max(0, pulse - 0.02);
        coreMaterial.uniforms.uPulse.value = pulse * 0.9;
        const scale = 1 + Math.sin(pulse * Math.PI) * 0.15;
        core.scale.setScalar(scale);
        wireframe.scale.setScalar(scale);
      } else {
        coreMaterial.uniforms.uPulse.value = 0;
        core.scale.setScalar(1);
        wireframe.scale.setScalar(1);
      }

      // Wireframes rotate opposite directions
      wireframe.rotation.y = -time * 0.12;
      wireframe.rotation.x = time * 0.08;

      wireframe2.rotation.y = time * 0.05;
      wireframe2.rotation.z = time * 0.07;

      // Particle shell slowly rotates
      particleShell.rotation.y = time * 0.05;
      particleShell.rotation.x = Math.sin(time * 0.3) * 0.1;

      // Electrons orbit
      electrons.forEach((e, i) => {
        const d = e.userData;
        const t = time * d.speed + d.phase;
        const x = Math.cos(t) * d.radius;
        const z = Math.sin(t) * d.radius;
        const y = Math.sin(t * 1.3) * d.radius * 0.35;
        // Apply incline around Z axis
        e.position.x = x * Math.cos(d.incline) - y * Math.sin(d.incline);
        e.position.y = x * Math.sin(d.incline) + y * Math.cos(d.incline);
        e.position.z = z;
      });

      renderer.render(scene, camera);
    }

    animate();
  })();

})();

/* ============================================================
   v4 — MOTION LAYER
   Smooth inertial scroll, choreographed reveals, spring tilt,
   magnetic controls, spotlight cards, scroll-linked 3D.
   ============================================================ */
(function () {
  'use strict';
  const docEl = document.documentElement;
  docEl.classList.add('js');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---- Loader progress ---- */
  (function () {
    const loader = $('#loader');
    if (!loader) return;
    const bar = document.createElement('div');
    bar.className = 'loader-bar';
    bar.innerHTML = '<i></i><b>0%</b>';
    loader.appendChild(bar);
    const num = $('b', bar), t0 = performance.now(), D = 1900;
    (function step(t) {
      const p = clamp((t - t0) / D, 0, 1), e = 1 - Math.pow(1 - p, 3);
      bar.style.setProperty('--p', e.toFixed(3));
      num.textContent = Math.round(e * 100) + '%';
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  })();

  /* ---- Section headers: wipe + decode ---- */
  const GLYPHS = '01<>/_{}#$%';
  function scramble(el) {
    const final = el.textContent, n = final.length, t0 = performance.now(), D = 900;
    el.setAttribute('aria-label', final);
    (function f(t) {
      const p = clamp((t - t0) / D, 0, 1), k = Math.floor(p * n);
      el.textContent = final.slice(0, k) + [...final.slice(k)]
        .map((c) => (c === '_' ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join('');
      if (p < 1) requestAnimationFrame(f); else el.textContent = final;
    })(t0);
  }
  const headerIO = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    if (!reduce) scramble($('.section-title', e.target));
    headerIO.unobserve(e.target);
  }), { threshold: 0.6 });
  $$('.section-header').forEach((h) => headerIO.observe(h));

  /* ---- Stagger + settle (hands control to hover/tilt after entrance) ---- */
  $$('.about-grid,.focus-grid,.skills-grid,.projects-grid,.achievements-grid,.contact-grid,.timeline')
    .forEach((g) => $$(':scope > .reveal', g).forEach((el, i) => el.style.setProperty('--d', i * 90 + 'ms')));
  $$('.skill-category').forEach((c) => $$('.skill-tag', c).forEach((t, i) => t.style.setProperty('--ti', i)));
  const settleIO = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const d = parseInt(e.target.style.getPropertyValue('--d'), 10) || 0;
    setTimeout(() => e.target.classList.add('settled'), d + 1300);
    settleIO.unobserve(e.target);
  }), { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  $$('.reveal').forEach((el) => settleIO.observe(el));

  /* ---- Nav: gliding indicator ---- */
  (function () {
    const ul = $('.nav-links');
    if (!ul) return;
    const ind = document.createElement('span');
    ind.className = 'nav-indicator';
    ul.appendChild(ind);
    const place = () => {
      const a = $('.nav-link.active', ul);
      if (!a || getComputedStyle(ind).display === 'none') return ind.classList.remove('on');
      ind.style.setProperty('--x', a.offsetLeft + a.offsetWidth * 0.2 + 'px');
      ind.style.setProperty('--w', a.offsetWidth * 0.6 + 'px');
      ind.classList.add('on');
    };
    const mo = new MutationObserver(place);
    $$('.nav-link').forEach((l) => mo.observe(l, { attributes: true, attributeFilter: ['class'] }));
    addEventListener('resize', place);
    place();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  })();

  /* ---- Pointer effects (desktop only) ---- */
  const tilts = [];
  if (fine && !reduce) {
    $$('.focus-card,.skill-category,.achievement-card,.timeline-content,.about-terminal-card').forEach((c) => {
      c.setAttribute('data-spot', '');
      const s = document.createElement('span');
      s.className = 'spot';
      c.prepend(s);
    });
    document.addEventListener('pointermove', (e) => {
      const c = e.target.closest && e.target.closest('[data-spot]');
      if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', e.clientX - r.left + 'px');
      c.style.setProperty('--my', e.clientY - r.top + 'px');
    }, { passive: true });

    $$('.btn,.nav-brand,.social-links a').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.28}px ${(e.clientY - r.top - r.height / 2) * 0.35}px`;
      });
      el.addEventListener('pointerleave', () => { el.style.translate = ''; });
    });

    $$('.tilt-card,.focus-card').forEach((el) => {
      const big = el.classList.contains('tilt-card');
      const t = { el, max: big ? 7 : 3.5, lift: big ? -4 : -6, rx: 0, ry: 0, tx: 0, ty: 0, l: 0, tl: 0, s: 1, ts: 1, on: false };
      el.addEventListener('pointermove', (e) => {
        if (!el.classList.contains('settled')) return;
        const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        t.ty = (px - 0.5) * 2 * t.max; t.tx = -(py - 0.5) * 2 * t.max; t.tl = t.lift; t.ts = 1.012; t.on = true;
        el.style.setProperty('--mouse-x', px * 100 + '%');
        el.style.setProperty('--mouse-y', py * 100 + '%');
      });
      el.addEventListener('pointerleave', () => { t.tx = t.ty = t.tl = 0; t.ts = 1; });
      tilts.push(t);
    });
  }

  /* ---- Inertial scroll (desktop) / native smooth anchors (touch) ---- */
  const maxY = () => docEl.scrollHeight - innerHeight;
  let target = scrollY, cur = scrollY, gliding = false;
  const smooth = fine && !reduce;
  if (smooth) {
    addEventListener('wheel', (e) => {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY) || document.body.style.overflow === 'hidden') return;
      e.preventDefault();
      if (!gliding) cur = target = scrollY;
      target = clamp(target + e.deltaY * (e.deltaMode === 1 ? 32 : 1), 0, maxY());
      gliding = true;
    }, { passive: false });
    addEventListener('scroll', () => { if (!gliding) target = cur = scrollY; }, { passive: true });
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'), el = id.length > 1 && $(id);
    if (!el) return;
    e.preventDefault();
    if (smooth) {
      cur = scrollY;
      target = clamp(el.getBoundingClientRect().top + scrollY - 68, 0, maxY());
      gliding = true;
    } else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* ---- Master frame loop ---- */
  const prog = document.createElement('div');
  prog.className = 'scroll-progress';
  document.body.appendChild(prog);
  const hero = $('.hero-content'), hud = $('.hud-layer'), rain = $('.code-rain');
  let mx = 0, my = 0, smx = 0, smy = 0, ly = scrollY, sv = 0;
  addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });

  (function frame() {
    if (gliding) {
      cur += (target - cur) * 0.09;
      if (Math.abs(target - cur) < 0.5) { cur = target; gliding = false; }
      scrollTo(0, cur);
    }
    const y = scrollY, m = maxY();
    sv += ((y - ly) - sv) * 0.15; ly = y;
    window.__sv = sv;
    window.__pageProgress = m > 0 ? y / m : 0;
    prog.style.transform = `scaleX(${window.__pageProgress.toFixed(4)})`;

    if (!reduce) {
      const p = clamp(y / innerHeight, 0, 1);
      if (hero) {
        hero.style.transform = `translate3d(0,${(p * 70).toFixed(1)}px,0) scale(${(1 - p * 0.06).toFixed(4)})`;
        hero.style.opacity = clamp(1 - p * 1.2, 0, 1).toFixed(3);
      }
      smx += (mx - smx) * 0.06; smy += (my - smy) * 0.06;
      if (hud) hud.style.translate = `${(smx * -18).toFixed(2)}px ${(smy * -12).toFixed(2)}px`;
      if (rain) rain.style.translate = `${(smx * 26).toFixed(2)}px ${(smy * 18).toFixed(2)}px`;
    }

    for (const t of tilts) {
      if (!t.on) continue;
      t.rx += (t.tx - t.rx) * 0.12; t.ry += (t.ty - t.ry) * 0.12;
      t.l += (t.tl - t.l) * 0.12; t.s += (t.ts - t.s) * 0.12;
      t.el.style.transform = `perspective(1000px) translate3d(0,${t.l.toFixed(2)}px,0) rotateX(${t.rx.toFixed(2)}deg) rotateY(${t.ry.toFixed(2)}deg) scale(${t.s.toFixed(4)})`;
      if (!t.tx && !t.ty && Math.abs(t.rx) + Math.abs(t.ry) + Math.abs(t.l) < 0.02 && Math.abs(t.s - 1) < 0.0005) {
        t.el.style.transform = ''; t.on = false; t.rx = t.ry = t.l = 0; t.s = 1;
      }
    }
    requestAnimationFrame(frame);
  })();
})();