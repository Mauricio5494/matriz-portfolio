/* ============================================================
   PANEL SCROLL — Navegación por teclado (ligera)
   El scroll-snap nativo de CSS ya gestiona el salto entre paneles
   al hacer scroll con rueda o táctil. Este script solo añade:
   - Navegación por teclado (flechas, espacio, Página Arriba/Abajo)
   - Respeto a prefers-reduced-motion
   - No trabas en controles de formulario (inputs, selects, textarea)
   ============================================================ */

(function() {
  var panels = document.querySelectorAll('.panel');
  var container = document.querySelector('.panel-scroll');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!panels.length || !container) return;

  // currentIndex como única fuente de verdad: el panel ~60% visible
  var currentIndex = 0;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        panels.forEach(function(panel, idx) {
          if (panel === entry.target) {
            currentIndex = idx;
          }
        });
      }
    });
  }, { threshold: 0.6, root: container });

  panels.forEach(function(panel) {
    observer.observe(panel);
  });

  function goTo(index) {
    if (index < 0 || index >= panels.length) return;
    currentIndex = index;
    panels[index].scrollIntoView({
      behavior: reduced.matches ? 'auto' : 'smooth',
      block: 'start'
    });
  }

  // Navegación con teclado: solo teclas de navegación,
  // sin bloqueo de 800 ms, sin trabar controles de formulario.
  window.addEventListener('keydown', function(event) {
    var key = event.key;
    var isNavKey = key === 'ArrowDown' || key === 'ArrowUp' ||
                   key === 'PageDown' || key === 'PageUp' || key === ' ';
    if (!isNavKey) return;

    var target = event.target;
    var isEditable = target.matches &&
      (target.matches('input, select, textarea, [contenteditable="true"]') ||
       target.closest('input, select, textarea, [contenteditable="true"]'));
    if (isEditable) return;

    event.preventDefault();
    if (key === 'ArrowDown' || key === 'PageDown' || key === ' ') {
      goTo(currentIndex + 1);
    } else {
      goTo(currentIndex - 1);
    }
  }, { passive: false });
})();
