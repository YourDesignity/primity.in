/* =====================================================
   PRIMITY R&D LABS — Main JavaScript
   Converts all React/Framer Motion behaviour to vanilla JS
   ===================================================== */

// ── PRELOADER ──────────────────────────────────────────────────────────────
(function () {
  const pl = document.getElementById('preloader');
  if (!pl) return;
  setTimeout(() => {
    pl.classList.add('fade-out');
    setTimeout(() => { pl.style.display = 'none'; document.body.style.overflow = ''; }, 650);
  }, 1800);
})();

// ── CUSTOM CURSOR (RAF lerp) ───────────────────────────────────────────────
(function () {
  if (window.innerWidth < 768) return;
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;
  let cx = -100, cy = -100, rx = -100, ry = -100;
  const lerp = (a, b, t) => a + (b - a) * t;
  (function loop() {
    rx = lerp(rx, cx, 0.14); ry = lerp(ry, cy, 0.14);
    dot.style.left  = cx + 'px'; dot.style.top  = cy + 'px';
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  })();
  window.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; }, { passive: true });
  document.addEventListener('pointerover', e => {
    if (e.target.closest('a,button')) { dot.classList.add('hovering'); ring.classList.add('hovering'); }
  }, { passive: true });
  document.addEventListener('pointerout', e => {
    const t = e.relatedTarget;
    if (!t || !t.closest('a,button')) { dot.classList.remove('hovering'); ring.classList.remove('hovering'); }
  }, { passive: true });
})();

// ── NAVBAR ─────────────────────────────────────────────────────────────────
(function () {
  const ham     = document.querySelector('.ham-btn');
  const menu    = document.querySelector('.mobile-menu');
  const navLogo = document.querySelector('.nav-logo');
  if (!ham || !menu) return;

  ham.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    ham.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open'); ham.classList.remove('open');
    document.body.style.overflow = '';
  }));

  // Mark active link
  const path = location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-pill a, .mobile-menu nav a').forEach(a => {
    const href = (a.getAttribute('href') || '').replace(/\/$/, '') || '/';
    // Normalise: strip .html, /pages/ prefix for matching
    const clean = href.replace('/pages/', '/').replace('.html', '');
    if (clean === path) a.classList.add('active');
  });
})();

// ── SCROLL REVEAL ──────────────────────────────────────────────────────────
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '-40px 0px' });
  els.forEach(el => io.observe(el));
})();

// ── CONTACT FORM (Web3Forms) ────────────────────────────────────────────────
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const btn    = form.querySelector('.btn-submit');
  const status = document.getElementById('form-status');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    btn.classList.add('sending'); btn.disabled = true; status.textContent = '';
    const body = {
      name:       form.name.value,
      email:      form.email.value,
      message:    form.message.value,
      access_key: form.dataset.key,
    };
    try {
      const r = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (j.success) {
        status.textContent = "✅ Received. We'll be in touch!";
        status.className   = 'success'; form.reset();
      } else { throw new Error(); }
    } catch {
      status.textContent = '❌ Error sending. Try again.';
      status.className   = 'error';
    } finally {
      btn.classList.remove('sending'); btn.disabled = false;
      setTimeout(() => { status.textContent = ''; status.className = ''; }, 5000);
    }
  });
})();

// ── HERO BACKGROUND — Premium Ink-Drop Particle System ──────────────────────
// Design: Dozens of ultra-fine particles drift like ink dispersing in water.
// Each particle leaves a trailing ghost. Nearby particles form gossamer threads.
// A slow-breathing radial pulse originates from the hero center.
// Brand accent: deep crimson glow pools at edges. Monochrome + one red accent.
(function () {
  var container = document.getElementById('threads-container');
  if (!container) return;

  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
  container.appendChild(canvas);
  var ctx = canvas.getContext('2d');

  var W, H, dpr, cx, cy;

  // ── Palette ──────────────────────────────────────────────────
  var BG     = '#f5f5f3';
  var INK    = '30,28,26';       // warm near-black
  var RED    = '210,48,28';      // brand crimson
  var SILVER = '160,155,148';    // mid-grey

  // ── Particle pool ────────────────────────────────────────────
  var POOL = 90;
  var particles = [];

  function Particle() {
    this.reset(true);
  }
  Particle.prototype.reset = function(init) {
    // spawn anywhere across canvas on init, else from edges
    if (init) {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
    } else {
      // re-enter from a random edge
      var edge = Math.floor(Math.random()*4);
      if (edge===0){ this.x=Math.random()*W; this.y=-8; }
      else if(edge===1){ this.x=W+8; this.y=Math.random()*H; }
      else if(edge===2){ this.x=Math.random()*W; this.y=H+8; }
      else { this.x=-8; this.y=Math.random()*H; }
    }
    // Angle drifts toward center with a small random wobble
    var toCenterAngle = Math.atan2(cy - this.y, cx - this.x);
    this.angle  = toCenterAngle + (Math.random()-0.5)*Math.PI*1.4;
    this.speed  = 0.18 + Math.random()*0.28;
    this.r      = 0.8 + Math.random()*2.0;
    this.life   = 0;
    this.maxLife= 280 + Math.floor(Math.random()*220);
    this.wobble = (Math.random()-0.5)*0.012;   // slow angle drift
    // type: 0=normal ink dot, 1=slightly larger silver, 2=rare red
    var rnd = Math.random();
    this.type   = rnd < 0.06 ? 2 : (rnd < 0.28 ? 1 : 0);
    // trail history
    this.trail  = [];
    this.trailLen = this.type===2 ? 22 : (this.type===1 ? 14 : 8);
  };
  Particle.prototype.update = function() {
    this.trail.push({ x:this.x, y:this.y });
    if (this.trail.length > this.trailLen) this.trail.shift();
    this.angle += this.wobble;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.life++;
    if (this.life > this.maxLife ||
        this.x < -20 || this.x > W+20 ||
        this.y < -20 || this.y > H+20) {
      this.reset(false);
    }
  };
  Particle.prototype.draw = function() {
    var progress = this.life / this.maxLife;
    // fade in/out envelope
    var alpha = progress < 0.12
      ? progress / 0.12
      : (progress > 0.82 ? (1-progress)/0.18 : 1);

    var col = this.type===2 ? RED
            : this.type===1 ? SILVER
            : INK;
    var baseAlpha = this.type===2 ? 0.55
                  : this.type===1 ? 0.18
                  : 0.28;
    var a = alpha * baseAlpha;

    // trail
    if (this.trail.length > 1) {
      for (var i = 1; i < this.trail.length; i++) {
        var tf = i / this.trail.length;
        ctx.strokeStyle = 'rgba('+col+','+(a*tf*0.5)+')';
        ctx.lineWidth   = this.r * tf * 0.6;
        ctx.beginPath();
        ctx.moveTo(this.trail[i-1].x, this.trail[i-1].y);
        ctx.lineTo(this.trail[i].x,   this.trail[i].y);
        ctx.stroke();
      }
    }

    // glow halo (only red & silver)
    if (this.type > 0) {
      var haloR = this.r * (this.type===2 ? 14 : 8);
      var grd = ctx.createRadialGradient(
        this.x,this.y,0, this.x,this.y,haloR);
      grd.addColorStop(0, 'rgba('+col+','+(a*(this.type===2?0.22:0.10))+')');
      grd.addColorStop(1, 'rgba('+col+',0)');
      ctx.beginPath();
      ctx.arc(this.x,this.y,haloR,0,Math.PI*2);
      ctx.fillStyle = grd;
      ctx.fill();
    }

    // core dot
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
    ctx.fillStyle = 'rgba('+col+','+a+')';
    ctx.fill();
  };

  // ── Connection threads between close particles ──────────────
  function drawConnections() {
    var DIST = Math.min(W,H) * 0.16;
    for (var i = 0; i < particles.length; i++) {
      for (var j = i+1; j < particles.length; j++) {
        var pi = particles[i], pj = particles[j];
        var dx = pi.x-pj.x, dy = pi.y-pj.y;
        var d  = Math.sqrt(dx*dx+dy*dy);
        if (d < DIST) {
          var t = 1 - d/DIST;
          // use red thread if either particle is red
          var isRed = pi.type===2 || pj.type===2;
          var col = isRed ? RED : INK;
          var a   = t * t * (isRed ? 0.18 : 0.08);
          ctx.strokeStyle = 'rgba('+col+','+a+')';
          ctx.lineWidth   = t * (isRed ? 0.9 : 0.5);
          ctx.beginPath();
          ctx.moveTo(pi.x,pi.y);
          ctx.lineTo(pj.x,pj.y);
          ctx.stroke();
        }
      }
    }
  }

  // ── Breathing radial pulse from center ──────────────────────
  var pulseT = 0;
  function drawPulse() {
    pulseT += 0.008;
    // 3 concentric rings that expand and fade
    for (var k = 0; k < 3; k++) {
      var phase = (pulseT + k * 0.55) % 1;
      var r     = phase * Math.min(W,H) * 0.55;
      var a     = (1-phase) * (1-phase) * 0.045;
      if (a < 0.002) continue;
      var grd = ctx.createRadialGradient(cx,cy,r*0.85,cx,cy,r);
      grd.addColorStop(0, 'rgba('+INK+',0)');
      grd.addColorStop(0.6,'rgba('+INK+','+a+')');
      grd.addColorStop(1, 'rgba('+INK+',0)');
      ctx.beginPath();
      ctx.arc(cx,cy,r,0,Math.PI*2);
      ctx.strokeStyle = 'rgba('+INK+','+a+')';
      ctx.lineWidth   = 1.2;
      ctx.stroke();
    }
  }

  // ── Corner vignette — pools of crimson shadow ────────────────
  function drawVignette() {
    // bottom-left crimson glow
    var g1 = ctx.createRadialGradient(0,H,0,0,H,W*0.45);
    g1.addColorStop(0,'rgba('+RED+',0.06)');
    g1.addColorStop(1,'rgba('+RED+',0)');
    ctx.fillStyle=g1; ctx.fillRect(0,0,W,H);
    // top-right warm shadow
    var g2 = ctx.createRadialGradient(W,0,0,W,0,W*0.4);
    g2.addColorStop(0,'rgba('+INK+',0.04)');
    g2.addColorStop(1,'rgba('+INK+',0)');
    ctx.fillStyle=g2; ctx.fillRect(0,0,W,H);
  }

  // ── Geometric accent: slow-rotating fine hexagon at center ───
  var hexAngle = 0;
  function drawHex() {
    hexAngle += 0.0008;
    var sides  = 6;
    var radius = Math.min(W,H)*0.28;
    ctx.save();
    ctx.translate(cx,cy);
    ctx.rotate(hexAngle);
    ctx.beginPath();
    for (var i=0;i<=sides;i++) {
      var a = (i/sides)*Math.PI*2;
      i===0 ? ctx.moveTo(Math.cos(a)*radius, Math.sin(a)*radius)
            : ctx.lineTo(Math.cos(a)*radius, Math.sin(a)*radius);
    }
    ctx.strokeStyle = 'rgba('+INK+',0.04)';
    ctx.lineWidth   = 1;
    ctx.stroke();
    // inner hexagon
    ctx.beginPath();
    var r2 = radius*0.62;
    ctx.rotate(Math.PI/6);
    for (var i=0;i<=sides;i++) {
      var a = (i/sides)*Math.PI*2;
      i===0 ? ctx.moveTo(Math.cos(a)*r2, Math.sin(a)*r2)
            : ctx.lineTo(Math.cos(a)*r2, Math.sin(a)*r2);
    }
    ctx.strokeStyle = 'rgba('+RED+',0.04)';
    ctx.stroke();
    ctx.restore();
  }

  // ── Main render loop ─────────────────────────────────────────
  function draw() {
    // Soft smear — NOT full clear, creates ink-trail persistence
    ctx.fillStyle = 'rgba(245,245,243,0.18)';
    ctx.fillRect(0,0,W,H);

    drawVignette();
    drawHex();
    drawPulse();
    drawConnections();
    for (var i=0; i<particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    requestAnimationFrame(draw);
  }

  // ── Init ─────────────────────────────────────────────────────
  function init() {
    dpr = Math.min(window.devicePixelRatio||1,2);
    W   = container.offsetWidth  || window.innerWidth;
    H   = container.offsetHeight || window.innerHeight;
    if (W===0||H===0){ setTimeout(init,120); return; }
    cx  = W/2; cy = H/2;
    canvas.width  = W*dpr;
    canvas.height = H*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    // fill background first
    ctx.fillStyle = BG;
    ctx.fillRect(0,0,W,H);
    // spawn particles
    particles = [];
    for (var i=0; i<POOL; i++) {
      var p = new Particle();
      particles.push(p);
    }
    draw();
  }

  function onResize() {
    dpr = Math.min(window.devicePixelRatio||1,2);
    W   = container.offsetWidth  || window.innerWidth;
    H   = container.offsetHeight || window.innerHeight;
    cx  = W/2; cy = H/2;
    canvas.width  = W*dpr;
    canvas.height = H*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener('resize', onResize, {passive:true});

  if (document.readyState==='complete') {
    setTimeout(init,60);
  } else {
    window.addEventListener('load', function(){ setTimeout(init,60); });
  }
})();

// ── FAQ ACCORDION ──────────────────────────────────────────────────────────
(function () {
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.style.cursor = 'pointer';
    q.addEventListener('click', () => {
      const open = item.classList.toggle('open');
      const ans  = item.querySelector('.faq-ans-mobile');
      if (ans) ans.style.maxHeight = open ? ans.scrollHeight + 'px' : '0';
    });
  });
})();

// ── YEAR ────────────────────────────────────────────────────────────────────
document.querySelectorAll('.js-year').forEach(el => { el.textContent = new Date().getFullYear(); });
