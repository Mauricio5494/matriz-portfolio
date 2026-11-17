/* ============================================================
   CONTACTO — Envío de formulario vía Formspree (sin recargar)
   ============================================================ */

(function() {
  var form = document.getElementById('form-contacto');
  var mensajeOk = document.getElementById('contacto-mensaje-ok');
  var mensajeError = document.getElementById('contacto-mensaje-error');
  var btn = form ? form.querySelector('button[type="submit"]') : null;
  var inputs = form ? form.querySelectorAll('input, textarea') : [];

  if (!form) return;

  var subtituloDirecto = document.querySelector('h3[data-i18n="contacto.directo"]');

  function bloquearFormulario() {
    btn.textContent = 'Formulario agotado';
    btn.disabled = true;
    inputs.forEach(function(input) {
      input.disabled = true;
    });
    mensajeOk.style.display = 'none';
    mensajeError.style.display = 'block';
    if (subtituloDirecto) {
      subtituloDirecto.classList.add('contacto--error-highlight');
    }
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    btn.textContent = 'Enviando…';
    btn.disabled = true;
    mensajeOk.style.display = 'none';
    mensajeError.style.display = 'none';

    fetch(form.action, {
      method: form.method,
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    }).then(function(response) {
      if (!response.ok) {
        // Formspree rechazó el envío (límite alcanzado, error del servidor, etc.)
        bloquearFormulario();
        return;
      }
      btn.textContent = '¡Enviado!';
      form.reset();
      mensajeOk.textContent = 'Mensaje enviado. Gracias por escribirme.';
      mensajeOk.style.display = 'block';
      setTimeout(function() {
        btn.textContent = 'Enviar mensaje';
        btn.disabled = false;
        mensajeOk.style.display = 'none';
      }, 4000);
    }).catch(function() {
      bloquearFormulario();
    });
  });
})();
