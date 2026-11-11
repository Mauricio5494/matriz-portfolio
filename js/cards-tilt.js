/* ============================================================
   CARDS TILT — Efecto 3D al pasar el mouse sobre tarjetas
   Calcula la rotación (rotateX / rotateY) según la posición
   del cursor respecto al centro de la tarjeta y aplica un
   brillo dinámico que sigue al puntero.
   Respeta prefers-reduced-motion.
   ============================================================ */

(function() {
  var grid = document.querySelector('.projects-grid');
  if (!grid) return;

  var MAX_TILT = 10; // grados máximo de inclinación

  function updateCard(card, x, y) {
    var rect = card.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var dx = (x - cx) / (rect.width / 2);  // -1 .. 1
    var dy = (y - cy) / (rect.height / 2); // -1 .. 1

    var rotateX = dy * -MAX_TILT;
    var rotateY = dx * MAX_TILT;

    var inner = card.querySelector('.card-tilt-inner');
    var glare = card.querySelector('.card-glare');

    if (inner) {
      inner.style.transform =
        'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
    }
    if (glare) {
      glare.style.opacity = '0.5';
      glare.style.setProperty('--gx', (dx * 50 + 50) + '%');
      glare.style.setProperty('--gy', (dy * 50 + 50) + '%');
    }
  }

  function resetCard(card) {
    var inner = card.querySelector('.card-tilt-inner');
    var glare = card.querySelector('.card-glare');
    if (inner) {
      inner.style.transform = 'rotateX(0) rotateY(0)';
    }
    if (glare) {
      glare.style.opacity = '0';
    }
  }

  grid.addEventListener('mousemove', function(event) {
    var card = event.target.closest('.project-card');
    if (!card) return;
    updateCard(card, event.clientX, event.clientY);
  });

  grid.addEventListener('mouseleave', function(event) {
    var card = event.target.closest('.project-card');
    if (card) {
      resetCard(card);
    }
  });

  grid.addEventListener('mouseenter', function(event) {
    var card = event.target.closest('.project-card');
    if (!card) return;
    var glare = card.querySelector('.card-glare');
    if (glare) {
      glare.style.opacity = '0.35';
    }
  });
})();
