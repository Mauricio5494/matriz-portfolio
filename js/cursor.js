/* ============================================================
   CURSOR PERSONALIZADO
   - Flecha estática (tema Matrix) / círculo rojo-negro (Milk-chan)
   - Trail tipo Matrix: caracteres que caen como lluvia de código
   - Partículas de impacto mágico al hacer clic
   ============================================================ */
(function () {
  const cursor = document.getElementById('cursor-custom');
  const trailCanvas = document.getElementById('cursor-trail');
  const trailCtx = trailCanvas.getContext('2d');
  const impactoCanvas = document.getElementById('cursor-impact');
  const impactoCtx = impactoCanvas.getContext('2d');
  if (!cursor || !trailCanvas || !impactoCanvas) return;

  const interactivos = 'a, button, select, input, .badge, [data-i18n="proyecto3.demo"]';
  let lastX = 0;
  let lastY = 0;
  let twidth, theight;
  let particles = [];
  let impactParticles = [];

  // Colores tipo Matrix para el trail (a juego con el fondo Matrix)
  const COLORES_MATRIX = [
    '#00ff41', // verde matrix brillante
    '#00cc00', // verde matrix oscuro
    '#ffaa00', // ámbar matrix (a juego con la flecha)
  ];

  // Caracteres tipo Matrix para el trail del cursor
  const CHARS_MATRIX = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()*&^%+-/[~]{}|';

  // Color de partícula según el tema activo:
  // - rojo leche en Milk-chan
  // - verde/ámbar matrix en el tema Matrix (y resto)
  function colorParticula() {
    if (document.body.classList.contains('tema-milk-chan')) {
      return '#ac3232'; // rojo amapola del tema Milk-chan
    }
    return COLORES_MATRIX[Math.floor(Math.random() * COLORES_MATRIX.length)];
  }

  // Carácter aleatorio tipo Matrix
  function charMatrix() {
    return CHARS_MATRIX[Math.floor(Math.random() * CHARS_MATRIX.length)];
  }

  // Ajustar tamaño del canvas del trail
  function resize() {
    twidth = trailCanvas.width = window.innerWidth;
    theight = trailCanvas.height = window.innerHeight;
    impactoCanvas.width = window.innerWidth;
    impactoCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Clase Partícula para el trail tipo Matrix en Canvas
  // modo "desdeBorde" (solo tema Milk-chan): punto que sale del borde del círculo
  // y se dispara radialmente hacia afuera.
  // modo normal (tema Matrix y resto): carácter tipo Matrix que cae suavemente
  // como la lluvia de código, desvaneciéndose.
  class TrailParticle {
    constructor(x, y, desdeBorde = false, angulo = 0, velocidad = 0) {
      this.x = x;
      this.y = y;
      this.desdeBorde = desdeBorde;
      this.color = colorParticula();
      this.char = desdeBorde ? '' : charMatrix();
      this.fontSize = Math.random() * 10 + 10;
      this.life = 1.0;
      this.alpha = Math.random() * 0.6 + 0.4;

      if (desdeBorde) {
        // Milk-chan: dirección radial desde el centro hacia el borde (y más allá).
        this.vx = Math.cos(angulo) * velocidad;
        this.vy = Math.sin(angulo) * velocidad;
        this.decay = Math.random() * 0.06 + 0.03; // se desvanece rápido
      } else {
        // Matrix: carácter que cae ligeramente hacia abajo y se desvanece
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = Math.random() * 2 + 1;
        this.decay = Math.random() * 0.02 + 0.015;
      }
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
      this.alpha = this.life;
      this.fontSize *= 0.97;
    }

    draw(ctx) {
      ctx.save();
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.font = this.fontSize + 'px monospace';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      if (this.desdeBorde) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(this.fontSize * 0.4, 1), 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillText(this.char, this.x, this.y);
      }

      ctx.restore();
    }
  }

  // Clase Partícula para el impacto mágico al hacer clic (estilo Canvas)
  class ImpactParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angulo = Math.random() * Math.PI * 2;
      const velocidad = Math.random() * 6 + 2;
      this.vx = Math.cos(angulo) * velocidad;
      this.vy = Math.sin(angulo) * velocidad;
      this.size = Math.random() * 7 + 3;
      this.alpha = Math.random() * 0.3 + 0.7;
      this.color = colorParticula();
      this.life = 1.0;
      this.decay = Math.random() * 0.04 + 0.02;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.92;
      this.vy *= 0.92;
      this.life -= this.decay;
      this.alpha = this.life;
      this.size *= 0.94;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // --- Movimiento del cursor ---
  function moverCursor(x, y) {
    cursor.style.left = x + 'px';
    cursor.style.top = y + 'px';

    lastX = x;
    lastY = y;

    // Emitir caracteres de trail tipo Matrix
    if (document.body.classList.contains('tema-milk-chan')) {
      // Milk-chan: el trail brota de los bordes del círculo y sale hacia afuera,
      // nunca hacia el medio del cursor.
      const radio = 10; // mitad del ancho del cursor (20px / 2)
      const cantidad = 2;
      for (let c = 0; c < cantidad; c++) {
        const angulo = Math.random() * Math.PI * 2;
        const px = x + Math.cos(angulo) * radio;
        const py = y + Math.sin(angulo) * radio;
        // Dirección radial: desde el centro hacia el borde (y más allá), nunca hacia adentro
        const velocidad = Math.random() * 2.5 + 1.5;
        particles.push(new TrailParticle(px, py, true, angulo, velocidad));
      }
    } else {
      // Otros temas: trail normal desde el centro del cursor
      const cantidad = Math.random() > 0.5 ? 2 : 1;
      for (let c = 0; c < cantidad; c++) {
        particles.push(new TrailParticle(x, y));
      }
    }
  }

  window.addEventListener('mousemove', (e) => moverCursor(e.clientX, e.clientY));

  // Ocultar/mostrar al entrar/salir de la ventana
  window.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });
  window.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });

  // Bucle de animación del trail en Canvas
  function drawTrail() {
    // Limpiar completamente cada frame: fondo transparente para que se
    // vea el fondo de la página (negro matrix, blanco claro, crema sepia)
    trailCtx.clearRect(0, 0, twidth, theight);

    // Las partículas se suman donde se superponen para que brillen
    trailCtx.globalCompositeOperation = 'lighter';

    // Actualizar y dibujar partículas
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw(trailCtx);
      if (p.life <= 0 || p.size < 0.5) {
        particles.splice(i, 1);
      }
    }

    trailCtx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(drawTrail);
  }
  drawTrail();

  // Bucle de animación de partículas de impacto en Canvas
  function drawImpact() {
    // Limpiar completamente cada frame (sin estela, son explosiones puntuales)
    impactoCtx.clearRect(0, 0, twidth, theight);

    // Actualizar y dibujar partículas de impacto
    for (let i = impactParticles.length - 1; i >= 0; i--) {
      const p = impactParticles[i];
      p.update();
      p.draw(impactoCtx);
      if (p.life <= 0 || p.size < 0.5) {
        impactParticles.splice(i, 1);
      }
    }

    requestAnimationFrame(drawImpact);
  }
  drawImpact();

  // --- Partículas de impacto mágico al hacer clic (Canvas) ---
  function crearImpactoMagico(x, y) {
    const cantidad = 14;
    for (let i = 0; i < cantidad; i++) {
      impactParticles.push(new ImpactParticle(x, y));
    }
  }

  window.addEventListener('mousedown', (e) => crearImpactoMagico(e.clientX, e.clientY));

  // Clase .activo al pasar sobre elementos interactivos
  document.querySelectorAll(interactivos).forEach(function (el) {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('activo');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('activo');
    });
  });
})();
