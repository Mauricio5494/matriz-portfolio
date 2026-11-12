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
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Aplica la rotación 3D al interior y al brillo juntos, para que se muevan al unísono
  function applyTilt(card, rotateX, rotateY, glareOpacity) {
    var inner = card.querySelector('.card-tilt-inner');
    var glare = card.querySelector('.card-glare');

    if (inner) {
      inner.style.transition = 'none';
      inner.style.transform = 'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
    }
    if (glare) {
      glare.style.transition = 'none';
      glare.style.transform = 'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
      glare.style.opacity = glareOpacity;
    }
  }

  // Resetea una tarjeta a su estado inicial (sin quedarse atrapada girada)
  function resetCard(card) {
    var inner = card.querySelector('.card-tilt-inner');
    var glare = card.querySelector('.card-glare');
    if (inner) {
      inner.style.transition = '';
      inner.style.transform = 'rotateX(0deg) rotateY(0deg)';
    }
    if (glare) {
      glare.style.transition = '';
      glare.style.transform = 'rotateX(0deg) rotateY(0deg)';
      glare.style.opacity = '0';
    }
  }

  // Calcula y aplica el tilt según la posición del cursor dentro de la tarjeta
  function updateCard(card, clientX, clientY) {
    if (reduced) {
      resetCard(card);
      return;
    }
    var rect = card.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var dx = (clientX - cx) / (rect.width / 2);  // -1 .. 1
    var dy = (clientY - cy) / (rect.height / 2); // -1 .. 1

    var rotateX = dy * -MAX_TILT;
    var rotateY = dx * MAX_TILT;

    applyTilt(card, rotateX, rotateY, 0.45);
  }

  // Eventos del grid: sigue el cursor sobre la tarjeta bajo el puntero
  grid.addEventListener('mousemove', function(event) {
    var card = event.target.closest('.project-card');
    if (!card) return;
    updateCard(card, event.clientX, event.clientY);
  });

  // Eventos individuales por tarjeta: reset inmediato al salir de cada una
  document.querySelectorAll('.project-card').forEach(function(card) {
    card.addEventListener('mouseleave', function() {
      resetCard(card);
    });
  });
})();
