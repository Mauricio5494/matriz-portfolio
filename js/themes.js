/* ============================================================
   CICLADOR DE TEMAS (Matrix / Claro / Sepia / Milk-chan)
   - Guarda la elección en localStorage
   - Aplica la clase al <body> para que las variables CSS se actualicen
   - Restaura el tema guardado al cargar la página
   ============================================================ */
(function () {
  const selector = document.getElementById('tema-selector');
  if (!selector) return;

  const temasValidos = ['matrix', 'claro', 'sepia', 'milk-chan'];
  let temaActual = localStorage.getItem('tema-portfolio') || 'matrix';

  function aplicarTema(tema) {
    if (!temasValidos.includes(tema)) tema = 'matrix';
    document.body.className = '';
    if (tema !== 'matrix') {
      document.body.classList.add('tema-' + tema);
    }
    selector.value = tema;
    localStorage.setItem('tema-portfolio', tema);
    temaActual = tema;

    // Ocultar/mostrar elementos de fondo según el tema
    const matrixCanvas = document.getElementById('matrix-canvas');
    const bgOverlay = document.querySelector('.bg-overlay');
    if (tema === 'matrix') {
      if (matrixCanvas) matrixCanvas.style.display = 'block';
      if (bgOverlay) bgOverlay.style.background = 'rgba(0, 0, 0, 0.15)';
    } else {
      if (matrixCanvas) matrixCanvas.style.display = 'none';
      if (bgOverlay) bgOverlay.style.background = 'transparent';
    }
  }

  selector.value = temaActual;
  aplicarTema(temaActual); // aplica clase al body (si es matrix no agrega clase)

  selector.addEventListener('change', function (e) {
    aplicarTema(e.target.value);
  });
})();
