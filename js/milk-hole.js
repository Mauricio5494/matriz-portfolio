/* ============================================================
   MILK-PARTICLES — Partículas sutiles de polvo/angustia (Canvas 2D)
   Complementa el arte CSS del tema Milk-chan.
   Solo se dibuja cuando <body> tiene la clase tema-milk-chan.
   ============================================================ */

(function() {
  var canvas = document.getElementById('milk-hole-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var width, height;
  var time = 0;
  var particles = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  function spawnParticle() {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.3 + 0.1,
      life: Math.random() * 100 + 50,
      color: Math.random() < 0.5 ? '#ff0040' : '#e8f0f4'
    });
  }

  for (var i = 0; i < 35; i++) spawnParticle();

  function draw() {
    time += 0.016;

    if (!document.body.classList.contains('tema-milk-chan')) {
      canvas.style.display = 'none';
      requestAnimationFrame(draw);
      return;
    }
    canvas.style.display = 'block';

    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);

    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;

      if (p.life <= 0 || p.x < -10 || p.x > width + 10 || p.y < -10 || p.y > height + 10) {
        particles.splice(i, 1);
        spawnParticle();
        continue;
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame(draw);
  }

  draw();
})();
