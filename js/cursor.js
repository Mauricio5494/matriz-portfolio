/* ============================================================
   CURSOR PERSONALIZADO — WITCH PUSHEEN
   - Gatito quieto (idle) y moviéndose (move) según el mouse
   - Rota según la dirección del movimiento
   - Trail mágico con Canvas y partículas brillantes
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
  let quietoTimeout = null;
  let twidth, theight;
  let particles = [];
  let impactParticles = [];

  // Colores mágicos de fantasía para el trail y los impactos
  const COLORES_MAGICOS = [
    '#00ff41', // verde matrix (destaca sobre blanco y negro)
    '#ff0055', // rosa neón intenso
    '#00ccff', // azul cian profundo
    '#ffaa00', // ámbar matrix
    '#cc00ff', // púrpura intenso
    '#00ffaa', // verde primavera
  ];

  // Color de partícula según el tema activo: rojo leche en Milk-chan,
  // colores mágicos aleatorios en los demás temas.
  function colorParticula() {
    if (document.body.classList.contains('tema-milk-chan')) {
      return '#ac3232'; // rojo amapola del tema Milk-chan
    }
    return COLORES_MAGICOS[Math.floor(Math.random() * COLORES_MAGICOS.length)];
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

  // Clase Partícula para el trail mágico en Canvas
  // modo "desdeBorde" (solo tema Milk-chan): nace en el perímetro del círculo
  // y se dispara radialmente hacia afuera, sin estela de historial.
  class TrailParticle {
    constructor(x, y, desdeBorde = false, angulo = 0, velocidad = 0) {
      this.x = x;
      this.y = y;
      this.desdeBorde = desdeBorde;
      this.color = colorParticula();

      if (desdeBorde) {
        // angulo y velocidad ya vienen calculados desde moverCursor:
        // dirección radial desde el centro hacia el borde (y más allá).
        this.vx = Math.cos(angulo) * velocidad;
        this.vy = Math.sin(angulo) * velocidad;
        this.size = Math.random() * 3 + 1.5;
        this.alpha = Math.random() * 0.5 + 0.4;
        this.life = 1.0;
        this.decay = Math.random() * 0.06 + 0.03; // se desvanece rápido
        this.history = [];
        this.historyLen = 0;
      } else {
        // Modo normal: partículas que flotan con estela de historial
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2 - 1; // tiende a subir un poco
        this.size = Math.random() * 6 + 3;
        this.alpha = Math.random() * 0.3 + 0.7;
        this.life = 1.0;
        this.decay = Math.random() * 0.02 + 0.015;
        this.history = [];          // estela sutil de posiciones pasadas
        this.historyLen = 6;
      }
    }

    update() {
      if (this.desdeBorde) {
        // Movimiento directo radial hacia afuera, sin historial
        this.x += this.vx;
        this.y += this.vy;
      } else {
        // Guardar posición actual para la estela
        this.history.push({ x: this.x, y: this.y, alpha: this.alpha });
        if (this.history.length > this.historyLen) this.history.shift();

        this.x += this.vx;
        this.y += this.vy;
      }
      this.life -= this.decay;
      this.alpha = this.life;
      this.size *= 0.96;
    }

    draw(ctx) {
      ctx.save();
      ctx.fillStyle = this.color;

      if (this.desdeBorde) {
        // Solo el punto actual, sin estela de historial
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Dibujar estela: posiciones pasadas más pequeñas y transparentes
        for (let i = 0; i < this.history.length; i++) {
          const p = this.history[i];
          const t = i / this.history.length; // 0 = más vieja, 1 = más reciente
          ctx.globalAlpha = p.alpha * (1 - t * 0.7);
          const s = this.size * (0.35 + t * 0.65);
          ctx.beginPath();
          ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
          ctx.fill();
        }

        // Punto actual: más sólido y grande
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
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

  // --- Movimiento del cursor y detección de movimiento/quietud ---
  function moverCursor(x, y) {
    const dx = x - lastX;
    const dy = y - lastY;

    // Si hay movimiento real: rotar y mostrar imagen de vuelo
    if (dx !== 0 || dy !== 0) {
      const angulo = Math.atan2(dy, dx) * (180 / Math.PI);
      cursor.style.transform = `translate(-50%, -50%) rotate(${angulo + 180}deg)`;
      cursor.classList.add('moviendose');
    }

    cursor.style.left = x + 'px';
    cursor.style.top = y + 'px';

    lastX = x;
    lastY = y;

    // Detectar que se está moviendo: resetear timeout de quietud
    if (quietoTimeout) clearTimeout(quietoTimeout);
    quietoTimeout = setTimeout(() => {
      // Al quedar quieto: imagen estática idle y rotación 0deg
      cursor.classList.remove('moviendose');
      cursor.style.transform = 'translate(-50%, -50%) rotate(0deg)';
    }, 150);

    // Emitir partículas de trail mágico
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
