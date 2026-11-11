/* ============================================================
   SCROLL ANIMATIONS — Intersection Observer
   Activa .reveal.active cuando los elementos entran al viewport.
   Solo corre si hay elementos con clase .reveal en el DOM.
   ============================================================ */

(function() {
  var observerOptions = {
    threshold: 0.12,      // 12% del elemento visible para activar
    rootMargin: '0px 0px -60px 0px' // se activa un poco antes del borde inferior
  };

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // animar una sola vez
      }
    });
  }, observerOptions);

  // Asigna delay escalonado a hijos de .reveal-group para efecto stagger
  var groups = document.querySelectorAll('.reveal-group');
  groups.forEach(function(group) {
    var items = group.querySelectorAll('.reveal');
    items.forEach(function(item, index) {
      item.style.setProperty('--reveal-delay', (index * 0.12) + 's');
    });
  });

  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    reveals.forEach(function(el) {
      observer.observe(el);
    });
  }
})();
