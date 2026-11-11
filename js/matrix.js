/* ============================================================
   EFECTO MATRIX (lluvia de código roja/ámbar)
   Generado enteramente por JavaScript con fondo NEGRO dentro del canvas.
   body es completamente transparente.
   ============================================================ */
(function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'matrix-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = '-4';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()*&^%+-/[~]{}|';
  const fontSize = 12;
  const columns = Math.floor(width / fontSize);
  const drops = [];

  for (let i = 0; i < columns; i++) {
    drops[i] = Math.random() * height;
  }

  function draw() {
    // Trail más sutil para dejar rastro difuminado sin apagar las partículas
    ctx.fillStyle = 'rgba(5, 5, 5, 0.15)';
    ctx.fillRect(0, 0, width, height);
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;

      // Letra principal en ámbar suave, letras traseras en rojo tenue
      ctx.fillStyle = 'rgba(255, 170, 0, 0.45)';
      ctx.fillText(char, x, drops[i] * fontSize);

      ctx.fillStyle = 'rgba(255, 26, 26, 0.3)';
      ctx.fillText(char, x, (drops[i] - 1) * fontSize);
      ctx.fillText(char, x, (drops[i] - 2) * fontSize);

      if (drops[i] * fontSize > height && Math.random() > 0.985) {
        drops[i] = 0;
      }

      drops[i] += 0.7;
    }
  }

  setInterval(draw, 50);
})();
