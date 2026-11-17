/* ============================================================
   CONTACTO — Envío de formulario vía Formspree (sin recargar)
   ============================================================ */

(function() {
  var form = document.getElementById('form-contacto');
  var mensajeOk = document.getElementById('contacto-mensaje-ok');
  var btn = form ? form.querySelector('button[type="submit"]') : null;

  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    btn.textContent = 'Enviando…';
    btn.disabled = true;
    mensajeOk.style.display = 'none';

    fetch(form.action, {
      method: form.method,
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    }).then(function() {
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
      btn.textContent = 'Error, inténtalo de nuevo';
      btn.disabled = false;
    });
  });
})();
