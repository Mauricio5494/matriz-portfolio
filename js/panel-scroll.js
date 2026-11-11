/* ============================================================
   PANEL SCROLL — Mejora de navegación por paneles
   Detecta el wheel y teclado para saltar entre paneles de forma
   más precisa, complementando el scroll-snap nativo de CSS.
   ============================================================ */

(function() {
  var panels = document.querySelectorAll('.panel');
  var currentIndex = 0;
  var isScrolling = false;

  if (panels.length === 0) return;

  function goToPanel(index) {
    if (index < 0 || index >= panels.length) return;
    if (isScrolling) return;
    isScrolling = true;
    currentIndex = index;
    panels[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(function() { isScrolling = false; }, 800);
  }

  // Navegación con wheel (ratón / trackpad)
  window.addEventListener('wheel', function(event) {
    if (event.deltaY > 0) {
      goToPanel(currentIndex + 1);
    } else {
      goToPanel(currentIndex - 1);
    }
  }, { passive: false });

  // Navegación con teclado (flechas arriba/abajo, espacio, Página Arriba/Abajo)
  window.addEventListener('keydown', function(event) {
    var key = event.key;
    if (key === 'ArrowDown' || key === 'PageDown' || key === ' ') {
      event.preventDefault();
      goToPanel(currentIndex + 1);
    } else if (key === 'ArrowUp' || key === 'PageUp') {
      event.preventDefault();
      goToPanel(currentIndex - 1);
    }
  });

  // Detectar cuándo el usuario hace scroll manual dentro de un panel
  // para actualizar currentIndex
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
  }, { threshold: 0.6 });

  panels.forEach(function(panel) {
    observer.observe(panel);
  });
})();
