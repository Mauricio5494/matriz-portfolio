/* ============================================================
   FEMBOY BG — Fondo animado "UwU / OwO" para el tema Femboy
   - Letras "UwU" y "OwO" en mosaico repetitivo
   - Caen en diagonal de derecha a izquierda
   - La "w" va en color rosa
   - Al pasar el mouse cerca, se sonrojan (rosa brillante)
   - Solo funciona si <body> tiene clase tema-femboy
   ============================================================ */

(function () {
  // Si no es el tema femboy, no hacer nada
  if (!document.body.classList.contains('tema-femboy')) return;

  // Crear el canvas de fondo
  var canvas = document.createElement('canvas');
  canvas.id = 'femboy-bg';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '-1';
  canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);

  var ctx = canvas.getContext('2d');
  var width, height;

  // Ratón para detección de proximidad (sonrojo)
  var mouse = { x: -1000, y: -1000 };

  var texts = ['UwU', 'OwO'];
  var particles = [];
  var particleCount = 45;

  // Partículas de texto al hacer clic (salen volando desde el puntero)
  var clickParticles = [];
  var clickParticleCount = 10;

  function ClickParticle(x, y) {
    this.x = x;
    this.y = y;
    var angle = Math.random() * Math.PI * 2;
    var speed = 1 + Math.random() * 3;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.text = texts[Math.floor(Math.random() * texts.length)];
    this.size = 4 + Math.random() * 5; // ~60% más pequeñas
    this.life = 1.0;
    this.decay = 0.008 + Math.random() * 0.015; // se desvanecen más lento
    this.rotation = (Math.random() - 0.5) * 0.4;
    this.gravity = 0.15 + Math.random() * 0.1; // gravedad hacia abajo
    this.bounciness = 0.5;
  }

  ClickParticle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity; // gravedad: caen hacia abajo

    // Rebote leve al tocar el suelo
    if (this.y > height - this.size) {
      this.y = height - this.size;
      this.vy *= -this.bounciness;
      this.vx *= 0.8;
    }

    this.life -= this.decay;
  };

  ClickParticle.prototype.draw = function () {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.font = this.size + 'px "Press Start 2P", cursive';

    var first = this.text.slice(0, 1);
    var w = this.text.slice(1, 2);
    var last = this.text.slice(2);

    ctx.fillStyle = COLOR_BASE;
    ctx.fillText(first, 0, 0);

    var firstWidth = ctx.measureText(first).width;
    var wWidth = ctx.measureText(w).width;

    ctx.fillStyle = COLOR_W;
    ctx.fillText(w, firstWidth, 0);

    ctx.fillStyle = COLOR_BASE;
    ctx.fillText(last, firstWidth + wWidth, 0);

    ctx.restore();
  };

  // Colores del tema femboy
  var COLOR_BASE = '#C084A8';     // rosa medio del tema (texto normal)
  var COLOR_W = '#C084A8';        // rosa para la w (normal)
  var COLOR_BLUSH_BASE = '#FFB6C1'; // rosa claro al sonrojar (texto base, fallback si no hay imagen)
  var COLOR_BLUSH_W = '#FF69B4';    // rosa fuerte al sonrojar (la w, fallback si no hay imagen)

  // Ruta de tu imagen PNG de sonrojo (contiene dos mejillas lado a lado)
  var BLUSH_IMAGE_SRC = 'img/sonrojo.png';
  var blushImage = new Image();
  var blushLoaded = false;
  var blushSourceWidth = 0;   // ancho de una sola mejilla (mitad de la imagen)
  var blushSourceHeight = 0;  // alto de una mejilla
  blushImage.src = BLUSH_IMAGE_SRC;
  blushImage.onload = function () {
    blushLoaded = true;
    blushSourceWidth = blushImage.width / 2;   // tomamos solo la mitad izquierda
    blushSourceHeight = blushImage.height;
  };
  blushImage.onerror = function () { blushLoaded = false; };

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  resize();

  function Particle() {
    this.init();
  }

  Particle.prototype.init = function () {
    this.text = texts[Math.floor(Math.random() * texts.length)];
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    // Velocidad base un poco más viva (diagonal derecha a izquierda)
    this.vx = -(1 + Math.random() * 1.5);
    this.vy = 0.5 + Math.random() * 1;
    // Ángulo para movimiento procedural (wander)
    this.angle = Math.random() * Math.PI * 2;
    this.turnSpeed = 0.02 + Math.random() * 0.05;
    this.size = 12 + Math.random() * 10;
    this.opacity = 0.25 + Math.random() * 0.35;
    this.blushLevel = 0;   // 0 a 100
  };

  Particle.prototype.update = function () {
    // Distancia al mouse (siempre se calcula para poder hacer decay del blush)
    var dx = this.x - mouse.x;
    var dy = this.y - mouse.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var mouseClose = dist < 120;

    // --- Sonrojo procedural ---
    if (mouseClose) {
      this.blushLevel += 2; // sube si el mouse está cerca
    } else {
      // Decay suave: si el mouse se aleja, el blush baja gradualmente
      this.blushLevel -= 0.4;
    }

    // Sonrojo aleatorio procedural (aparece solo de vez en cuando sin mouse)
    if (Math.random() < 0.02) {
      this.blushLevel += 5;
    }

    // Limitar a 100
    if (this.blushLevel > 100) this.blushLevel = 100;
    if (this.blushLevel < 0) this.blushLevel = 0;

    // --- Movimiento procedural (wander): cambios suaves de dirección ---
    // Pequeña rotación aleatoria del ángulo
    this.angle += (Math.random() - 0.5) * this.turnSpeed;
    // Velocidad base lenta hacia la izquierda + variación procedural
    var speed = 0.8 + Math.sin(this.angle) * 0.4;
    this.vx = -speed + Math.cos(this.angle) * 0.5;
    this.vy = 0.4 + Math.sin(this.angle) * 0.6;

    // Si el mouse está cerca, empujón inversamente proporcional a la distancia:
    // cuanto más cerca, más fuerte se alejan (nunca llegan a tocar el cursor)
    if (mouseClose && dist > 0) {
      var closeness = (120 - dist) / 120; // 1 = muy cerca, 0 = en el borde del radio
      var pushMagnitude = closeness * 6;  // intensidad máxima al estar pegados
      var pushX = ((this.x - mouse.x) / dist) * pushMagnitude;
      var pushY = ((this.y - mouse.y) / dist) * pushMagnitude;
      this.vx += pushX;
      this.vy += pushY;
    }

    this.x += this.vx;
    this.y += this.vy;

    // Mosaico: reaparecer por la derecha si sale por la izquierda
    if (this.x < -120) {
      this.x = width + 120;
      this.y = Math.random() * height;
      this.blushLevel = 0;
      this.angle = Math.random() * Math.PI * 2;
    }
    // Reaparecer por arriba si sale por abajo
    if (this.y > height + 60) {
      this.y = -60;
      this.x = Math.random() * width;
      this.blushLevel = 0;
      this.angle = Math.random() * Math.PI * 2;
    }
    // Reaparecer por abajo si sale por arriba
    if (this.y < -60) {
      this.y = height + 60;
      this.x = Math.random() * width;
      this.blushLevel = 0;
      this.angle = Math.random() * Math.PI * 2;
    }
  };

  Particle.prototype.draw = function () {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.font = this.size + 'px "Press Start 2P", cursive';

    // Dibujar las letras siempre con el color normal (sin sonrojo en el texto)
    var first = this.text.slice(0, 1);
    var w = this.text.slice(1, 2);
    var last = this.text.slice(2);

    ctx.fillStyle = COLOR_BASE;
    ctx.fillText(first, 0, 0);

    var firstWidth = ctx.measureText(first).width;
    var wWidth = ctx.measureText(w).width;

    ctx.fillStyle = COLOR_W;
    ctx.fillText(w, firstWidth, 0);

    ctx.fillStyle = COLOR_BASE;
    ctx.fillText(last, firstWidth + wWidth, 0);

    // Si tiene blushLevel > 0 y hay imagen cargada, dibujar el PNG de sonrojo encima
    if (this.blushLevel > 0 && blushLoaded) {
      var blushFactor = this.blushLevel / 100;
      // Tamaño más grande y menos dependiente del factor para que se note fuerte
      var blushSize = this.size * (1.4 + 0.6 * blushFactor);
      // Centro horizontal del texto completo
      var totalWidth = firstWidth + wWidth + ctx.measureText(last).width;
      var centerX = totalWidth / 2;
      // Posición vertical: más arriba aún para encajar con el inicio de los píxeles de las letras
      var dy = -blushSize / 1.5;

      ctx.save();
      // Opacidad más alta: base 0.5 + 0.5 * blushFactor (nunca se vuelve invisible)
      ctx.globalAlpha = this.opacity * (0.5 + 0.5 * blushFactor);

      // Mejilla izquierda (mitad izquierda del PNG doble)
      ctx.drawImage(
        blushImage,
        0, 0,                       // sx, sy: mitad izquierda del sprite
        blushSourceWidth, blushSourceHeight,
        centerX - totalWidth / 2 - blushSize / 2,   // dx: a la izquierda del texto
        dy,                         // dy
        blushSize, blushSize
      );

      // Mejilla derecha (mitad derecha del PNG doble)
      ctx.drawImage(
        blushImage,
        blushSourceWidth, 0,        // sx, sy: mitad derecha del sprite
        blushSourceWidth, blushSourceHeight,
        centerX + totalWidth / 2 - blushSize / 2,   // dx: a la derecha del texto
        dy,                         // dy
        blushSize, blushSize
      );

      ctx.restore();
    }

    ctx.restore();
  };

  // Inicializar partículas
  for (var i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  var animId;
  function animate() {
    // Si ya no es tema femboy, detener y limpiar
    if (!document.body.classList.contains('tema-femboy')) {
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      cancelAnimationFrame(animId);
      return;
    }

    ctx.clearRect(0, 0, width, height);

    for (var i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    // Partículas de texto al hacer clic
    for (var i = 0; i < clickParticles.length; i++) {
      clickParticles[i].update();
      clickParticles[i].draw();
      if (clickParticles[i].life <= 0) {
        clickParticles.splice(i, 1);
        i--;
      }
    }

    animId = requestAnimationFrame(animate);
  }

  // Crear partículas de texto al hacer clic (solo en tema femboy)
  window.addEventListener('mousedown', function (e) {
    if (!document.body.classList.contains('tema-femboy')) return;
    for (var i = 0; i < clickParticleCount; i++) {
      clickParticles.push(new ClickParticle(e.clientX, e.clientY));
    }
  });

  animate();

  // Si el usuario cambia de tema desde el selector, limpiar
  var selector = document.getElementById('tema-selector');
  if (selector) {
    selector.addEventListener('change', function () {
      if (selector.value !== 'femboy') {
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        cancelAnimationFrame(animId);
      } else {
        // Volver a activar si regresa a femboy
        if (!canvas.parentNode) document.body.appendChild(canvas);
        animate();
      }
    });
  }
})();
