/* ============================================================
   CHAT IA — MODO DEMO (respuestas simuladas)
   Conectá una API real (Anthropic/OpenAI) reemplazando
   la función respuestaIA() por un fetch a tu endpoint.
   ============================================================ */
(function () {
  const toggle = document.getElementById('chat-toggle');
  const panel = document.getElementById('chat-panel');
  const input = document.getElementById('chat-input');
  const send = document.getElementById('chat-send');
  const messages = document.getElementById('chat-messages');
  if (!toggle || !panel || !input || !send || !messages) return;

  let abierto = false;
  let enviando = false; // evita envíos concurrentes y respuestas fuera de orden
let accionPostRespuesta = null; // { tipo: 'scroll', target: 'id-seccion' } | null

  toggle.addEventListener('click', () => {
    abierto = !abierto;
    if (abierto) {
      // Calcular transform-origin del panel relativo a su borde superior-izquierdo,
      // para que el morphing nazca del centro del botón 🤖
      const btnRect = toggle.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isMobile = vw < 641;

      // Posición del panel en el viewport (position: fixed)
      let panelLeft, panelTop;
      if (isMobile) {
        panelLeft = 15; // right: 15px + width calc(100vw - 30px) -> empieza en 15px
      } else {
        panelLeft = vw - 340; // right: 0, width: 340px
      }
      panelTop = vh - 70 - 460; // bottom: 70px, height: 460px

      const btnCenterX = btnRect.left + btnRect.width / 2;
      const btnCenterY = btnRect.top + btnRect.height / 2;

      panel.style.setProperty('--chat-origin-x', (btnCenterX - panelLeft) + 'px');
      panel.style.setProperty('--chat-origin-y', (btnCenterY - panelTop) + 'px');

      panel.classList.add('open');
      input.focus();
    } else {
      panel.classList.remove('open');
    }
  });

  // Cerrar al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (abierto && !panel.contains(e.target) && e.target !== toggle) {
      abierto = false;
      panel.classList.remove('open');
    }
  });

  // Escapa HTML para prevenir XSS antes de inyectar como innerHTML
  function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  }

  // Convierte URLs y emails en enlaces clickeables (texto ya escapado)
  function enlazarTexto(texto) {
    return escapeHtml(texto)
      // Enlaces http/https
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
      // Correos electrónicos
      .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1" target="_blank" rel="noopener noreferrer">$1</a>');
  }

  // ── Funciones uwu (duplicadas de i18n.js para uso local en chat.js) ──
  function uwuifyLocal(texto) {
    return texto
      .replace(/u/g, 'uwu')
      .replace(/U/g, 'Uwu')
      .replace(/\./g, ' OwO.');
  }

  function desUwuify(texto) {
    return texto
      .replace(/Uwu/g, 'U')
      .replace(/uwu/g, 'u')
      .replace(/ OwO\./g, '.');
  }

  // ── Base de datos local (IndexedDB) para enseñanzas privadas por usuario ──
  // Cada usuario tiene su propia BD en el navegador; nada se comparte con otros.
  const DB_NAME = 'portfolio-chat-db';
  const STORE_NAME = 'enseñanzas';
  let db = null;

  function abrirDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        return reject(new Error('IndexedDB no disponible'));
      }
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const dbLocal = req.result;
        if (!dbLocal.objectStoreNames.contains(STORE_NAME)) {
          dbLocal.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      };
      req.onsuccess = () => { db = req.result; resolve(db); };
      req.onerror = () => reject(req.error);
    });
  }

  function guardarEnseñanza(pregunta, respuesta) {
    return new Promise((resolve, reject) => {
      if (!db) return reject(new Error('DB no abierta'));
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.add({ pregunta, respuesta, fecha: Date.now() });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function buscarEnseñanza(pregunta) {
    return new Promise((resolve) => {
      if (!db) return resolve(null);
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.openCursor();
      const p = pregunta.toLowerCase();
      req.onsuccess = (e) => {
        const cursor = e.target.result;
        while (cursor) {
          if (cursor.value.pregunta.toLowerCase() === p) {
            return resolve(cursor.value);
          }
          cursor.continue();
        }
        resolve(null);
      };
      req.onerror = () => resolve(null);
    });
  }

  function borrarEnseñanza(id) {
    return new Promise((resolve, reject) => {
      if (!db) return reject(new Error('DB no abierta'));
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  function agregarMensaje(texto, quien, idEnseñanza = null) {
    const div = document.createElement('div');
    div.className = 'message ' + quien;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = enlazarTexto(texto);
    div.appendChild(bubble);

    // Botón de borrar solo para mensajes del bot que son enseñanzas del usuario
    if (quien === 'bot' && idEnseñanza !== null) {
      const btnBorrar = document.createElement('button');
      btnBorrar.className = 'chat-borrar-enseñanza';
      btnBorrar.title = 'Borrar esta respuesta';
      btnBorrar.textContent = '🗑️';
      btnBorrar.dataset.id = idEnseñanza;
      btnBorrar.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          await borrarEnseñanza(parseInt(btnBorrar.dataset.id, 10));
          div.remove();
        } catch (err) {
          console.error('Error al borrar enseñanza:', err);
        }
      });
      div.appendChild(btnBorrar);
    }

    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function escribir(texto, quien, delay = 0) {
    setTimeout(() => agregarMensaje(texto, quien), delay);
  }

  // Scroll suave garantizado (requestAnimationFrame) — funciona incluso cuando
  // el navegador ignora behavior: 'smooth' en scrollIntoView/scrollTo.
  function scrollSuaveA(elemento, duracion = 600, yForzada = null) {
    const startY = window.pageYOffset;
    const targetY = yForzada !== null ? yForzada : elemento.getBoundingClientRect().top + window.pageYOffset - 100;
    const diff = targetY - startY;
    const start = performance.now();

    // Easing procedural: acelera al inicio y frena al final (cubic, más pronunciado que quad)
    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duracion, 1);
      window.scrollTo(0, startY + diff * easeInOutCubic(progress));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  // Ejecuta acciones que deben ocurrir tras mostrar la respuesta del bot
  function ejecutarAccionPostRespuesta() {
    if (accionPostRespuesta && accionPostRespuesta.tipo === 'scroll') {
      const seccion = document.getElementById(accionPostRespuesta.target);
      if (seccion) {
        // Pequeño delay para que el mensaje del bot se renderice antes del scroll,
        // así la animación suave se aprecia correctamente
        setTimeout(() => {
          scrollSuaveA(seccion, 3000);
        }, 80);
      }
    }
    accionPostRespuesta = null;
  }

  function mostrarEscribiendo() {
    const div = document.createElement('div');
    div.className = 'typing-indicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function ocultarEscribiendo(div) {
    if (div && div.parentNode === messages) div.remove();
  }

  // URL del backend en Railway (memoria tipo Cleverbot + demo fallback)
  const RAILWAY_BACKEND_URL = 'https://railway-chat-backend-production.up.railway.app';

  // Consulta al backend: primero busca en memoria guardada, si no usa demo
  async function respuestaIA(texto) {
    // Comando para enseñarle al bot: "enséñame: ¿cómo estás? -> estoy bien"
    const match = texto.match(/^ens[eé]ñame:\s*(.+?)\s*->\s*(.+)$/i);
    if (match) {
      const pregunta = match[1].trim();
      const respuesta = match[2].trim();

      // ── Validaciones de seguridad para el comando "enséñame" ──
      if (!pregunta || !respuesta) {
        return 'La pregunta y la respuesta no pueden estar vacías.';
      }
      if (pregunta.length < 3 || pregunta.length > 100) {
        return 'La pregunta debe tener entre 3 y 100 caracteres.';
      }
      if (respuesta.length < 3 || respuesta.length > 300) {
        return 'La respuesta debe tener entre 3 y 300 caracteres.';
      }
      const palabrasProhibidas = [
        // insultos / ofensas básicas (español e inglés)
        'estúpido','estupido','idiota','imbécil','imbecil','tonto','tonto',
        'puta','mierda','joder','cabrón','cabron','gilipollas','boludo','pendejo',
        'stupid','idiot','moron','dumb','asshole','bitch','crap','damn','hell',
        // intentos de phishing / enlaces sospechosos
        'http://','https://','www.','bit.ly','tinyurl',
        // inyección de comandos
        'rm ','sudo ','chmod ','chown ','format ','del /',
      ];
      const textoCompleto = (pregunta + ' ' + respuesta).toLowerCase();
      for (const palabra of palabrasProhibidas) {
        if (textoCompleto.includes(palabra)) {
          return 'No puedo guardar esa respuesta: contiene lenguaje o contenido no permitido.';
        }
      }

      try {
        // Guardar en IndexedDB local (privado por usuario)
        await abrirDB();
        const id = await guardarEnseñanza(pregunta, respuesta);

        // También intentar enviar al backend si está disponible (no bloqueante)
        try {
          const resp = await fetch(`${RAILWAY_BACKEND_URL}/api/teach`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pregunta, respuesta }),
          });
          if (!resp.ok) {
            // Si el backend falla, no importa: ya está guardado localmente
          }
        } catch (e) {
          // Backend no disponible, la enseñanza queda guardada localmente
        }

        return `Aprendido (guardado localmente). Si preguntás "${pregunta}", responderé "${respuesta}".`;
      } catch (e) {
        return 'No pude guardar esa respuesta en el almacenamiento local.';
      }
    }

    // ── 2. Consultar enseñanzas locales (IndexedDB) antes del backend ──
    try {
      await abrirDB();
      const enseñanza = await buscarEnseñanza(texto);
      if (enseñanza) {
        return enseñanza.respuesta;
      }
    } catch (e) {
      // Si IndexedDB falla, continuamos con el backend
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 s timeout
      const resp = await fetch(`${RAILWAY_BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: texto }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!resp.ok) throw new Error('Error del servidor');
      const data = await resp.json();
      if (data.respuesta) {
        const fuente = data.fuente === 'memoria' ? ' (aprendido antes)' : '';
        // Si el backend solicita cambio de idioma de la página
        if (data.accion === 'cambiar_idioma' && data.idioma && typeof window.cambiarIdiomaPortfolio === 'function') {
          window.cambiarIdiomaPortfolio(data.idioma);
          return `Idioma cambiado a ${data.idioma}. ${data.respuesta}${fuente}`;
        }
        // Si el backend respondió con su demo local, usamos nuestro propio respuestaDemo() local
        if (data.fuente === 'demo') {
          return respuestaDemo(texto);
        }
        // Si el backend respondió con una respuesta genérica de fallback (no clasifica el intent),
        // usamos nuestro propio respuestaDemo() local que tiene mejor detección de intents
        const respuestaLower = data.respuesta.toLowerCase();
        const frasesGenericas = [
          'interesante pregunta',
          'aún no tengo esa información',
          'ese tema no lo cubro',
          'no sé', 'no cover', 'no tengo detalles',
          'lo siento, tuve un error',
          'respuesta vacía',
          'modo demo',
          'puedo responder sobre',
          'preguntarme sobre',
          'inténtalo con algo sobre',
          'intenta con algo sobre',
          'no cubro en el modo demo',
          'no lo cubro en el modo demo'
        ];
        const esGenerica = frasesGenericas.some(f => respuestaLower.includes(f));
        if (esGenerica) {
          return respuestaDemo(texto);
        }
        return data.respuesta + fuente;
      }
      throw new Error('Respuesta vacía');
    } catch (e) {
      console.warn('Backend no disponible, usando demo:', e.message);
      return respuestaDemo(texto);
    }
  }

  // Respuestas simuladas (demo) como fallback absoluto si el backend no responde.
  // Estructura escalable basada en intents: array de { patrones, respuesta, prioridad }.
  const INTENTOS_DEMO = [
    // --- Saludos y despedidas (alta prioridad, palabras sueltas al inicio) ---
    {
      patrones: [/^(hola|buenas|buen\s+d[ií]a|buenas\s+tardes|buenas\s+noches|hey|hello|hi)\b/i],
      respuesta: '¡Hola! Soy el asistente virtual de Mauricio Gori. Pregúntame sobre sus proyectos, habilidades, experiencia o cómo contactarlo.',
      prioridad: 100,
    },
    {
      patrones: [/^(adiós|chao|hasta+luego|nos+vemos|bye|goodbye|hasta+pronto)\b/i],
      respuesta: '¡Hasta luego! Si necesitás algo más, acá estaré.',
      prioridad: 100,
    },

    // --- Agradecimientos ---
    {
      patrones: [/^(gracias|muchas+gracias|te+lo+agradezco|se+lo+agradezco|thanks|thank+you|gracias+por+todo)\b/i],
      respuesta: '¡De nada! Si tenés otra duda, acá estoy.',
      prioridad: 90,
    },

    // --- ¿Quién es / Sobre mí ---
    {
      patrones: [/qui[eé]n\s+es|sobre\s+mí|sobre\s+mauricio|perfil|qui[eé]n\s+es\s+mauricio/i],
      respuesta: 'Mauricio Gori es desarrollador de software, enfocado en Python, JavaScript y automatización creativa. Tiene experiencia en modding de juegos (motor GEM2 / Call to Arms), pipelines automatizados, análisis de logs y herramientas para Blender.',
      prioridad: 85,
    },
    {
      patrones: [/experiencia|trayectoria|historia|background/i],
      respuesta: 'Su experiencia abarca scripting en Python, desarrollo web con JavaScript/TypeScript, automatización de pipelines, análisis de game.log para Proton/Wine y creación de herramientas de modding para motores de juegos.',
      prioridad: 85,
    },
    {
      patrones: [/educación|formaci[oó]n|estudios|carrera|universidad|t[ií]tulo/i],
      respuesta: 'No tengo detalles específicos de su formación académica en este modo demo, pero su perfil se centra en el desarrollo práctico de software y la automatización creativa.',
      prioridad: 85,
    },
    {
      patrones: [/ubicación|dónde\s+est[áa]|ciudad|país|direcci[oó]n|localidad|sede/i],
      respuesta: 'No dispongo de su ubicación específica en este modo demo. Para saber dónde está basado, escribí directamente a mauriciogorilluberas@gmail.com.',
      prioridad: 85,
    },
    {
      patrones: [/disponibilidad|disponible|horario|cu[aá]ndo/i],
      respuesta: 'Para consultas sobre su disponibilidad actual, escribí directamente a mauriciogorilluberas@gmail.com.',
      prioridad: 85,
    },

    // --- Proyectos (generales) ---
    {
      patrones: [/proyecto|proyectos/i],
      respuesta: 'Tiene tres proyectos principales: (1) Validador de assets para motor de juegos en Python — valida archivos .inc, .ext, .mdl antes de instalar mods. (2) Analizador de game.log para Proton/Wine — traduce errores del motor a pasos de solución. (3) Panel de administración Full Stack — con autenticación JWT, gestión de usuarios, subida de imágenes y exportación a CSV.',
      prioridad: 80,
    },
    {
      patrones: [/validador|assets|motor\s+de\s+juegos|modding|gem\s*2|iron\s*nest|\.inc|\.ext|\.mdl/i],
      respuesta: 'El validador de assets es una herramienta en Python para detectar errores comunes en archivos de motor (.inc, .ext, .mdl) antes de instalar mods en juegos basados en el motor GEM2 / Call to Arms.',
      prioridad: 78,
    },
    {
      patrones: [/game\.log|proton|wine|analizador|logs?/i],
      respuesta: 'El analizador de game.log lee registros de juegos ejecutados bajo Proton/Wine y traduce los errores del motor en pasos de solución para modders.',
      prioridad: 78,
    },
    {
      patrones: [/panel|administraci[oó]n|full.?stack|react|node|jwt|csv/i],
      respuesta: 'El panel de administración Full Stack incluye autenticación JWT, gestión de usuarios, subida de imágenes y exportación a CSV. Tiene demo en vivo disponible en su portfolio.',
      prioridad: 78,
    },

    // --- Habilidades (general y específicas) ---
    {
      patrones: [/habilidad|skill|tecnolog[ií]a|tecnolog[ií]as|stack|qu[eé]\s+sabe/i],
      respuesta: 'Sus habilidades incluyen: Python, JavaScript, TypeScript, React, HTML5/CSS3, Tailwind CSS, Node.js, Docker, Git, CI/CD básico, SQL, análisis de logs y Blender (Python API).',
      prioridad: 75,
    },
    {
      patrones: [/blender|3d|modelado|pipeline\s+creativo/i],
      respuesta: 'Trabaja con Blender mediante su Python API para automatizar pipelines creativos y herramientas de modelado 3D.',
      prioridad: 72,
    },
    {
      patrones: [/sql|base\s+de\s+datos|relacional/i],
      respuesta: 'Tiene conocimientos de SQL para trabajo con bases de datos relacionales.',
      prioridad: 72,
    },
    {
      patrones: [/docker|git|ci\/cd|github|control\s+de\s+versiones/i],
      respuesta: 'Usa Docker para contenedores, Git para control de versiones (repositorios en GitHub) y tiene conocimientos básicos de CI/CD.',
      prioridad: 72,
    },
    {
      patrones: [/python\b/i],
      respuesta: 'Python es uno de sus lenguajes principales. Lo usa para scripting, automatización, herramientas de modding y el validador de assets del motor de juegos.',
      prioridad: 70,
    },
    {
      patrones: [/javascript|\bjs\b|node\.?js|nodejs/i],
      respuesta: 'Trabaja con JavaScript y Node.js para desarrollo web, APIs y paneles de administración. También usa TypeScript para mayor tipado y mantenibilidad.',
      prioridad: 70,
    },
    {
      patrones: [/react|frontend|html|css|tailwind/i],
      respuesta: 'En frontend usa React, HTML5/CSS3 y Tailwind CSS. Este mismo portfolio está construido con HTML, CSS y JavaScript vanilla.',
      prioridad: 70,
    },

    // --- Contacto y contratación ---
    {
      patrones: [/contacto|email|correo|escribir|mail|escr[ií]beme|escr[ií]beme/i],
      respuesta: 'Podés escribirle a mauriciogorilluberas@gmail.com o visitar su GitHub en github.com/Mauricio5494.',
      prioridad: 75,
    },
    {
      patrones: [/contratar|freelance|disponible|precio|presupuesto|costo|tarifa|cu[aá]nto\s+cobra/i],
      respuesta: 'Para consultas sobre contratación, disponibilidad o precios, escribí directamente a mauriciogorilluberas@gmail.com.',
      prioridad: 75,
    },
    {
      patrones: [/github|repositorio|c[ií]digo\s+fuente|stack\s+overflow/i],
      respuesta: 'Su código está en GitHub: github.com/Mauricio5494. Podés explorar sus proyectos allí. No tengo información de su perfil de Stack Overflow en este modo demo.',
      prioridad: 75,
    },

    // --- Idiomas del sitio ---
    {
      patrones: [/idioma|idiomas|en\s+qué\s+idiomas|idiomas\s+disponibles|qué\s+lenguas|lenguas|traducci[oó]n|traducir|español|ingl[ée]s|ruso|hindi|multidioma/i],
      respuesta: 'El portfolio está disponible en cuatro idiomas: español, inglés, ruso e hindi. Podés cambiar el idioma desde el selector en el menú de navegación (arriba a la derecha).',
      prioridad: 70,
    },

    // --- Preguntas sobre el asistente ---
    {
      patrones: [/eres\s+tú|qui[eé]n\s+sos|qué\s+eres|asistente|chat|bot/i],
      respuesta: 'Soy el asistente virtual demo de Mauricio. Puedo aprender nuevas respuestas si me enseñás, o responder sobre sus proyectos, habilidades y contacto.',
      prioridad: 60,
    },

    // --- Precios ---
    {
      patrones: [/precio|precios|cu[aá]nto\s+costa|cu[aá]nto\s+cobra|tarifa|presupuesto|costo/i],
      respuesta: 'El precio depende de la complejidad y el tiempo del proyecto. Algo sencillo que no tome más de unas horas puede rondar los 2 a 5 USD. Para proyectos más grandes, se hace un presupuesto a medida.',
      prioridad: 70,
    },

    // --- Tiempos de entrega ---
    {
      patrones: [/tiempo\s+de\s+entrega|cu[aá]nto\s+tarda|plazo|entrega/i],
      respuesta: 'Los tiempos de entrega dependen del alcance. Algo sencillo puede listarse en días; proyectos complejos pueden tomar semanas o meses. Contáctame para estimar tu caso.',
      prioridad: 70,
    },

    // --- Horario y disponibilidad ---
    {
      patrones: [/horario|disponibilidad|cu[aá]ndo\s+trabajas|hora\s+de\s+atenci[oó]n|diferencia\s+horaria|qu[eé]\s+hora\s+es\s+en\s+uruguay/i],
      respuesta: 'Mi horario de atención es después de la 1 PM, hora de Uruguay (GMT-3), todos los días. Si no respondo en media hora, puede ser que tarde un poco más.',
      prioridad: 70,
    },

    // --- Derechos y código fuente ---
    {
      patrones: [/derechos|c[oó]digo\s+fuente|derechos\s+de\s+autor|propiedad\s+intelectual|comprar\s+derechos/i],
      respuesta: 'Para derechos completos del código, se requiere un depósito basado en el cálculo de estimación del proyecto (tipo COCOMO). Tras el pago, se entregan los derechos completos al comisionista. Si quieres derechos parciales, entrego el programa pero me quedo con el código fuente.',
      prioridad: 70,
    },

    // --- Fallback genérico (prioridad mínima, coincide con cualquier cosa) ---
    {
      patrones: [/.*/],
      respuesta: null,
      prioridad: 0,
    },
  ];

  // --- Detección de idioma del mensaje (modo demo) ---
  function detectarIdiomaTexto(texto) {
    const t = texto.trim();
    if (/[Ѐ-ӿ]/.test(t)) return 'ru';           // cirílico → ruso
    if (/[ऀ-ॿ]/.test(t)) return 'hi';           // devanagari → hindi
    const tl = t.toLowerCase();
    // Transliteración latina de ruso (teclado fonético) — solo palabras distintivas del cirílico
    const ruLatWords = ['privet','zdravstvuy','kak dela','spasibo','do svidaniya','poka','kto takoy','nachki','yazyk','yazyki','perevod','russkij','kak','ty','vy','rabotaet','rabotaesh','chto','delaesh','tsena','ceny','bюdžet'];
    for (const p of ruLatWords) if (tl.includes(p)) return 'ru';
    // Transliteración latina de hindi (Hinglish) — solo palabras distintivas del devanagari
    const hiLatWords = ['namaste','namaskar','kaise ho','dhanyavad','phir milenge','alvida','koun hai','likhein','bhasha','bhashayen','anuvad','kaise','kya','hai','ho','kaam','karta','karti','keemat'];
    for (const p of hiLatWords) if (tl.includes(p)) return 'hi';
    // Español primero (evita falsos positivos: 'contacto' contiene 'contact' como subcadena)
    const esWords = ['hola','buenas','gracias','proyecto','proyectos','habilidad','habilidades','contacto','¿quién','quien','sobre','python','javascript','idioma','idiomas','español','cambiar','puedes','cómo','cuál','¿qué'];
    for (const p of esWords) if (tl.includes(p)) return 'es';
    // Inglés después, con límites de palabra para palabras sueltas
    const enWords = ['hello','hi ',' hey','how are','what is','who is','can you','projects','skills','contact','thank','goodbye','bye','can i','how can','how do','how does','work','bot','assistant','virtual','price','prices','about','tell me'];
    for (const p of enWords) {
      if (p.includes(' ')) {
        if (tl.includes(p)) return 'en';
      } else if (new RegExp('\\b' + p + '\\b', 'i').test(tl)) return 'en';
    }
    // Fallback: usar el idioma de la página para evitar respuestas en idiomas inesperados
    const htmlLang = document.documentElement.lang || 'es';
    const mapaLang = { es: 'es', en: 'en', ru: 'ru', hi: 'hi' };
    return mapaLang[htmlLang] || 'es';
  }

  // Respuestas demo multidioma por intent
  const RESPUESTAS_DEMO_IDIOMAS = {
    es: {
      saludo: ['¡Hola! Soy el asistente virtual de Mauricio Gori. Pregúntame sobre sus proyectos, habilidades, experiencia o cómo contactarlo.'],
      despedida: ['¡Hasta luego! Si necesitás algo más, acá estaré.'],
      agradecimiento: ['¡De nada! Si tenés otra duda, acá estoy.'],
      sobre_mi: ['Mauricio Gori es un programador joven de 22 años que reside en Uruguay. Desarrollador de software enfocado en Python, JavaScript y automatización creativa. Le gusta construir herramientas que resuelven problemas reales y está en constante aprendizaje.'],
      precios: ['El precio depende de la complejidad y el tiempo del proyecto. Algo sencillo que no tome más de unas horas puede rondar los 2 a 5 USD. Para proyectos más grandes, se hace un presupuesto a medida.'],
      tiempos: ['Los tiempos de entrega dependen del alcance. Algo sencillo puede listarse en días; proyectos complejos pueden tomar semanas o meses. Contáctame para estimar tu caso.'],
      horario: ['Mi horario de atención es después de la 1 PM, hora de Uruguay (GMT-3), todos los días. Si no respondo en media hora, puede ser que tarde un poco más.'],
      derechos: ['Para derechos completos del código, se requiere un depósito basado en el cálculo de estimación del proyecto (tipo COCOMO). Tras el pago, se entregan los derechos completos al comisionista. Si quieres derechos parciales, entrego el programa pero me quedo con el código fuente.'],
      experiencia: ['Su experiencia abarca scripting en Python, desarrollo web con JavaScript/TypeScript, automatización de pipelines, análisis de game.log para Proton/Wine y herramientas de modding.'],
      proyectos: ['Tiene tres proyectos principales: (1) Validador de assets para motor de juegos en Python — valida archivos .inc, .ext, .mdl antes de instalar mods. (2) Analizador de game.log para Proton/Wine — traduce errores del motor a pasos de solución. (3) Panel de administración Full Stack — con autenticación JWT, gestión de usuarios, subida de imágenes y exportación a CSV.'],
      habilidades: ['Sus habilidades incluyen: Python, JavaScript, TypeScript, React, HTML5/CSS3, Tailwind CSS, Node.js, Docker, Git, CI/CD básico, SQL, análisis de logs y Blender (Python API).'],
      contacto: ['Podés escribirle a mauriciogorilluberas@gmail.com, visitar su GitHub en github.com/Mauricio5494, o escanear el QR de Telegram en la sección Contacto.'],
      servicios: ['Puedo ayudarte con herramientas de automatización, validadores de assets en general, análisis de logs y proyectos full-stack con HTML, JS y CSS3. Revisa la sección Servicios para ver qué ofrecemos.'],
      'mejor-proyecto': ['Su proyecto más destacado es el Validador de Assets para el motor de juegos GEM2 / Call to Arms — una herramienta en Python que valida archivos .inc, .ext y .mdl antes de instalar mods. Lo puedes ver en la sección Mejor Proyecto.'],
      idiomas: ['El portfolio está disponible en español, inglés, ruso e hindi. Podés cambiar el idioma desde el selector en el menú de navegación.'],
      como_funcionas: ['Soy un asistente virtual de demostración. Funciono así: (1) Detecto palabras clave en tu mensaje y las comparo contra una lista de intents (saludos, proyectos, habilidades, contacto, precios, idiomas, horario, derechos). (2) Si coincide un intent, respondo con una frase predefinida en el idioma que hayas elegido. (3) Si no coincide nada, uso una respuesta genérica. (4) Podés enseñarme nuevas respuestas con el comando "enséñame: pregunta -> respuesta" o desde el panel "Enseñarle al bot"; esas parejas quedan guardadas en IndexedDB, una base de datos local de tu navegador, así solo vos las ves y nadie más. No uso servidores externos para guardar lo que me enseñás.'],
      generico: [
        'Perdona, no entendí tu pregunta. ¿Puedes repetirla?',
        '¿Cómo has dicho? No te he captado bien.',
        'Estoy pensando… pero la verdad no sé qué responderte a eso.',
        'Esa pregunta se me escapa. Pregúntame sobre los proyectos, habilidades o contacto de Mauricio.',
        'Uy, esa no la tengo aprendida aún. Intenta con algo sobre sus proyectos o habilidades.',
        'No estoy seguro de haber entendido. ¿Podrías decirlo de otra forma?',
        'Lo siento, no tengo una respuesta para eso. ¿Sobre qué más te gustaría saber?',
        'Esa se me fue de las manos. Pregúntame sobre lo que hace Mauricio o cómo contactarlo.',
        'No tengo esa respuesta guardada. Enséñame con "enséñame: pregunta → respuesta" si quieres.',
        'Mmm… no sé qué responder a eso. Prueba con algo sobre proyectos, habilidades o precios.'
      ],
    },
    en: {
      saludo: ['Hello! I am Mauricio\'s chatbot. Ask me about his projects, skills, experience or how to contact him.'],
      despedida: ['See you later! If you need anything else, I\'ll be here.'],
      agradecimiento: ['You\'re welcome! If you have any other questions, let me know.'],
      sobre_mi: ['Mauricio Gori is a young 22-year-old programmer based in Uruguay. Software developer focused on Python, JavaScript and creative automation. He loves building tools that solve real problems and is constantly learning.'],
      precios: ['The price depends on the complexity and time of the project. Something simple that takes a few hours can range from 2 to 5 USD. For larger projects, a custom budget is made.'],
      tiempos: ['Delivery times depend on the scope. Something simple can be ready in days; complex projects can take weeks or months. Contact me to estimate your case.'],
      horario: ['My availability is after 1 PM, Uruguay time (GMT-3), every day. If I do not respond within half an hour, it may take a little longer.'],
      derechos: ['For full code rights, a deposit based on project estimation (such as COCOMO: lines of code, team members, and time needed) is required. After payment, full rights are delivered to the client.'],
      experiencia: ['His experience covers Python scripting, web development with JavaScript/TypeScript, automated pipelines, game.log analysis for Proton/Wine and game modding tools.'],
      proyectos: ['He has three main projects: (1) Game engine asset validator in Python — validates .inc, .ext, .mdl files before installing mods. (2) game.log analyzer for Proton/Wine — translates engine errors into troubleshooting steps. (3) Full Stack admin panel — with JWT authentication, user management, image upload and CSV export.'],
      habilidades: ['His skills include: Python, JavaScript, TypeScript, React, HTML5/CSS3, Tailwind CSS, Node.js, Docker, Git, basic CI/CD, SQL, log analysis and Blender (Python API).'],
      contacto: ['You can write to him at mauriciogorilluberas@gmail.com, visit his GitHub at github.com/Mauricio5494, or scan the Telegram QR code in the Contact section.'],
      servicios: ['I can help with automation tools, game engine asset validators, game.log analysis, full-stack admin panels and more. Check the Services section to see what we offer.'],
      'mejor-proyecto': ['His standout project is the Game Engine Asset Validator for GEM2 / Call to Arms — a Python tool that validates .inc, .ext and .mdl files before installing mods. See it in the Best Project section.'],
      idiomas: ['This portfolio is available in Spanish, English, Russian and Hindi. You can change the language from the selector in the navigation menu.'],
      como_funcionas: ['I am a virtual assistant demo. I work like this: (1) I detect keywords in your message and match them against a list of intents (greetings, projects, skills, contact, prices, languages, schedule, rights). (2) If an intent matches, I reply with a predefined sentence in your chosen language. (3) If nothing matches, I use a generic fallback. (4) You can teach me new answers using the command "teach me: question -> answer" or the "Teach the bot" panel; those pairs are stored in IndexedDB, a local database in your browser, so only you see them and no one else. I do not use external servers to save what you teach me.'],
      generico: [
        "Sorry, I didn't understand your question. Can you repeat it?",
        'What did you say? I didn\'t quite catch that.',
        "I'm thinking… but honestly I don't know what to answer to that.",
        "That question slips past me. Ask me about Mauricio's projects, skills, or contact.",
        "I haven't learned that one yet. Try something about his projects or skills.",
        "I'm not sure I understood. Could you say it another way?",
        "Sorry, I don't have an answer for that. What else would you like to know?",
        "That one got away from me. Ask me about what Mauricio does or how to contact him.",
        "I don't have that answer saved. Teach me with \"teach me: question → answer\" if you'd like.",
        "Hmm… I don't know what to answer to that. Try something about projects, skills, or prices."
      ],
    },
    ru: {
      saludo: ['Привет! Я чат-бот Маурисио. Спросите о его проектах, навыках, опыте или как с ним связаться.'],
      despedida: ['До свидания! Если нужно что-то еще, я здесь.'],
      agradecimiento: ['Пожалуйста! Если есть еще вопросы, обращайтесь.'],
      sobre_mi: ['Маурисио Гори — молодой 22-летний программист, проживающий в Уругвае. Разработчик ПО с акцентом на Python, JavaScript и креативную автоматизацию. Ему нравится создавать инструменты, которые решают реальные задачи, и он постоянно учится.'],
      precios: ['Цена зависит от сложности и времени проекта. Что-то простое, занимающее несколько часов, может стоить от 2 до 5 USD. Для крупных проектов составляется индивидуальный бюджет.'],
      tiempos: ['Сроки поставки зависят от объёма работы. Что-то простое можно сделать за дни; сложные проекты могут занять недели или месяцы. Свяжитесь со мной для оценки.'],
      horario: ['Моё время работы — после 13:00 по uruguaysкому времени (GMT-3), каждый день. Если не отвечаю в течение получаса, может потребоваться подождать чуть дольше.'],
      derechos: ['За полные права на код требуется депозит на основе оценки проекта (по типу COCOMO). После оплаты полные права передаются заказчику. Если нужны частичные права, я передаю программу, но оставляю исходный код у себя.'],
      experiencia: ['Его опыт включает скрипты на Python, веб-разработку на JavaScript/TypeScript, автоматизацию конвейеров, анализ game.log для Proton/Wine и инструменты моддинга.'],
      proyectos: ['У него три основных проекта: (1) Валидатор ассетов для игрового движка на Python. (2) Анализатор game.log для Proton/Wine. (3) Полноценная панель администрирования на React и Node.js.'],
      habilidades: ['Его навыки включают: Python, JavaScript, TypeScript, React, HTML5/CSS3, Tailwind CSS, Node.js, Docker, Git, базовый CI/CD, SQL, анализ логов и Blender (Python API).'],
      contacto: ['Свяжитесь с ним по mauriciogorilluberas@gmail.com, посетите его GitHub github.com/Mauricio5494 или отсканируйте QR-код Telegram в разделе Контакты.'],
      servicios: ['Я могу помочь с инструментами автоматизации, валидаторами ассетов для игровых движков, анализом game.log, полноценными панелями администрирования и многим другим. Ознакомьтесь с разделом Сервисы.'],
      'mejor-proyecto': ['Его лучший проект — Валидатор ассетов для игрового движка GEM2 / Call to Arms — инструмент на Python, который валидирует файлы .inc, .ext и .mdl перед установкой модов. Смотрите в разделе Лучший Проект.'],
      idiomas: ['Это портфолио доступно на четырех языках: испанский, английский, русский и хинди. Вы можете сменить язык через селектор в меню навигации.'],
      como_funcionas: ['Я виртуальный ассистент для демо. Я работаю так: (1) Я определяю ключевые слова в вашем сообщении и сравниваю их со списком интентов (приветствия, проекты, навыки, контакты, цены, языки, расписание, права). (2) Если совпадает интент, я отвечаю заранее определенной фразой на выбранном языке. (3) Если ничего не совпадает, я использую общий ответ по умолчанию. (4) Вы можете научить меня новым ответам через команду "научи меня: вопрос -> ответ" или панель "Научить бота"; эти пары сохраняются в IndexedDB — локальной базе данных вашего браузера, поэтому только вы их видите и никто другой. Я не использую внешние серверы для сохранения того, что вы мне научили.'],
      generico: [
        'Извините, я не понял ваш вопрос. Можете повторить?',
        'Как вы сказали? Я не совсем расслышал.',
        'Я думаю… но честно не знаю, что на это ответить.',
        'Этот вопрос ускользает от меня. Спросите о проектах, навыках или контактах Маурисио.',
        'Я еще не выучил этот ответ. Попробуйте спросить о его проектах или навыках.',
        'Не уверен, что понял. Можете сказать по-другому?',
        'Извините, у меня нет ответа на это. О чем еще вы хотите узнать?',
        'Этот вопрос меня застал врасплох. Спросите, чем занимается Маурисио или как с ним связаться.',
        'Я не сохранил этот ответ. Научите меня с помощью "научи меня: вопрос → ответ", если хотите.',
        'Хм… не знаю, что на это ответить. Попробуйте спросить о проектах, навыках или ценах.'
      ],
    },
    hi: {
      saludo: ['नमस्ते! मैं मॉरिसियो का चैटबॉट हूँ। उनके प्रोजेक्ट्स, स्किल्स, अनुभव या संपर्क के बारे में पूछें।'],
      despedida: ['फिर मिलेंगे! अगर कुछ और चाहिए तो यहाँ रहूँगा।'],
      agradecimiento: ['आपका स्वागत है! अगर कोई और सवाल हो तो बताएं।'],
      sobre_mi: ['मॉरिसियो गोरी 22 वर्ष के एक युवा प्रोग्रामर हैं जो उरुग्वे में रहते हैं। सॉफ्टवेयर डेवलपर जो पायथन, जावास्क्रिप्ट और क्रिएटिव ऑटोमेशन पर फोकस करते हैं। उन्हें वास्तविक समस्याओं को हल करने वाले टूल बनाना पसंद है और वे लगातार सीख रहे हैं।'],
      precios: ['कीमत प्रोजेक्ट की जटिलता और समय पर निर्भर करती है। कुछ सरल जो कुछ घंटों में हो जाए उसकी कीमत 2 से 5 डॉलर तक हो सकती है। बड़े प्रोजेक्ट्स के लिए कस्टम बजट बनता है।'],
      tiempos: ['डिलीवरी समय प्रोजेक्ट के स्कोप पर निर्भर करता है। सरल काम कुछ दिनों में तैयार हो सकता है; जटिल प्रोजेक्ट्स में हफ्तों या महीनों लग सकते हैं। अपने केस का अंदाजा लगाने के लिए मुझसे संपर्क करें।'],
      horario: ['मेरी उपलब्धता उरुग्वे समय (GMT-3) के बाद दोपहर 1 बजे से है, हर दिन। अगर मैं आधे घंटे में जवाब नहीं देता, तो थोड़ा अधिक समय लग सकता है।'],
      derechos: ['कोड के पूर्ण अधिकारों के लिए, प्रोजेक्ट अनुमान (जैसे COCOMO) के आधार पर डिपॉज़िट की आवश्यकता है। भुगतान के बाद, क्लाइंट को पूर्ण अधिकार हस्तांतरित किए जाते हैं। अगर आप आंशिक अधिकार चाहते हैं, तो मैं प्रोग्राम डिलीवर करता हूँ लेकिन सोर्स कोड अपने पास रखता हूँ।'],
      experiencia: ['उनका अनुभव पायथन स्क्रिप्टिंग, जावास्क्रिप्ट/टाइपस्क्रिप्ट के साथ वेब विकास, स्वचालित पाइपलाइन्स, प्रोटॉन/वाइन के लिए गेम.लॉग विश्लेषण और मोडिंग टूल्स को कवर करता है।'],
      proyectos: ['उनके तीन मुख्य प्रोजेक्ट्स हैं: (1) गेम इंजन के लिए एसेट वैलिडेटर पायथन में। (2) प्रोटॉन/वाइन के लिए गेम.लॉग विश्लेषक। (3) फुल स्टैक एडमिन पैनल रिएक्ट और नोड.जेएस में।'],
      habilidades: ['उनके स्किल्स में शामिल हैं: पायथन, जावास्क्रिप्ट, टाइपस्क्रिप्ट, रिएक्ट, HTML5/CSS3, टेलविंड CSS, नोड.जेएस, डॉकर, गिट, बेसिक CI/CD, SQL, लॉग विश्लेषण और ब्लेंडर (पायथन API)।'],
      contacto: ['उनसे mauriciogorilluberas@gmail.com पर संपर्क करें, उनका गिटहब github.com/Mauricio5494 पर जाएँ, या संपर्क अनुभाग में टेलीग्राम QR कोड स्कैन करें।'],
      servicios: ['मैं ऑटोमेशन टूल्स, गेम इंजन एसेट वैलिडेटर, गेम.लॉग विश्लेषण, फुल स्टैक एडमिन पैनल और बहुत कुछ में आपकी मदद कर सकता हूँ। सेवा सेक्शन देखें।'],
      'mejor-proyecto': ['उनका मुख्य प्रोजेक्ट गेम इंजन के लिए एसेट वैलिडेटर है GEM2 / Call to Arms — एक पायथन टूल जो मॉड इंस्टॉल करने से पहले .inc, .ext और .mdl फाइलों को वैलिडेट करता है। सर्वश्रेष्ठ परियोजना सेक्शन में देखें।'],
      idiomas: ['यह पोर्टफोलियो चार भाषाओं में उपलब्ध है: स्पेनिश, अंग्रेजी, रूसी और हिंदी। आप नेविगेशन मेनू में भाषा सेलेक्टर से भाषा बदल सकते हैं।'],
      como_funcionas: ['मैं एक डेमो वर्चुअल असिस्टेंट हूँ। मैं इस तरह काम करता हूँ: (1) मैं आपके संदेश में कीवर्ड्स का पता लगाता हूँ और उन्हें इंटेंट्स की सूची से मिलाता हूँ (अभिवादन, प्रोजेक्ट्स, स्किल्स, संपर्क, कीमत, भाषाएं, शेड्यूल, अधिकार)। (2) अगर कोई इंटेंट मेल खाता है, तो मैं आपकी चुनी हुई भाषा में पूर्वनिर्धारित वाक्य का जवाब देता हूँ। (3) अगर कुछ भी मेल नहीं खाता, तो मैं सामान्य जवाब का उपयोग करता हूँ। (4) आप मुझे "सिखाओ: प्रश्न -> उत्तर" कमांड या "बॉट को सिखाएं" पैनल से नए उत्तर सिखा सकते हैं; ये जोड़े IndexedDB में संग्रहीत होते हैं, जो आपके ब्राउज़र का स्थानीय डेटाबेस है, इसलिए केवल आप उन्हें देखते हैं और कोई और नहीं। मैं आपके द्वारा सिखाई गई बातों को सेव करने के लिए बाहरी सर्वर का उपयोग नहीं करता।'],
      generico: [
        'कृपया अपना प्रश्न दोहराएं, मैं समझ नहीं पाया।',
        'आपने क्या कहा? मैं ठीक से समझ नहीं सका।',
        'मैं सोच रहा हूँ… लेकिन सचमुच नहीं जानता कि इसका क्या जवाब दूँ।',
        'यह प्रश्न मुझसे छूट गया। मॉरिसियो के प्रोजेक्ट्स, स्किल्स या संपर्क के बारे में पूछें।',
        'मैंने अभी तक यह जवाब नहीं सीखा। उनके प्रोजेक्ट्स या स्किल्स के बारे में पूछने की कोशिश करें।',
        'मुझे यकीन नहीं है कि समझा। क्या आप इसे किसी दूसरे तरीके से कह सकते हैं?',
        'क्षमा करें, मेरे पास इसका जवाब नहीं है। आप और क्या जानना चाहते हैं?',
        'यह प्रश्न मुझे अचानक मिला। पूछें कि मॉरिसियो क्या करता है या उनसे कैसे संपर्क करें।',
        'मेरे पास यह जवाब सेव नहीं है। अगर चाहें तो "सिखाओ: प्रश्न → उत्तर" कमांड से मुझे सिखाएं।',
        'हम्म… मैं नहीं जानता इसका क्या जवाब दूँ। प्रोजेक्ट्स, स्किल्स या कीमत के बारे में पूछने की कोशिश करें।'
      ],
    },
  };

  // Respuestas simuladas (demo) como fallback absoluto si el backend no responde.
  // Ahora multidioma: detecta el idioma del mensaje y responde en ese idioma.
  function respuestaDemo(texto) {
    // Detectar si el usuario escribió en modo uwu (Espuwuñol / UwUnglish)
    const esUwuTexto = /uwu|OwO|Uwu/i.test(texto);
    // Revertir la transformación uwu para poder detectar idioma e intents correctamente
    const textoLimpio = esUwuTexto ? desUwuify(texto) : texto;
    const t = textoLimpio.trim().toLowerCase();
    const idioma = detectarIdiomaTexto(textoLimpio);
    const tabla = RESPUESTAS_DEMO_IDIOMAS[idioma] || RESPUESTAS_DEMO_IDIOMAS.es;

    // Cambio de idioma (modo demo)
    const cambioIdioma = textoLimpio.match(/cambiar.*(español|ingl[ée]s|ruso|hindi)|idioma.*(español|ingl[ée]s|ruso|hindi)|pon.*(español|ingl[ée]s|ruso|hindi)|idioma a (español|ingl[ée]s|ruso|hindi)|quiero (en |en )?(español|ingl[ée]s|ruso|hindi)|change.*(spanish|english|russian|hindi)|language.*(spanish|english|russian|hindi)|switch to (spanish|english|russian|hindi)/i);
    if (cambioIdioma && typeof window.cambiarIdiomaPortfolio === 'function') {
      const mapaIdiomas = { español: 'es', ingles: 'en', inglés: 'en', ruso: 'ru', hindi: 'hi', spanish: 'es', english: 'en', russian: 'ru', hindi: 'hi' };
      let clave = '';
      for (let i = 1; i < cambioIdioma.length; i++) {
        if (cambioIdioma[i]) { clave = cambioIdioma[i]; break; }
      }
      const codigo = mapaIdiomas[clave.toLowerCase()];
      if (codigo) {
        window.cambiarIdiomaPortfolio(codigo);
        const nombreIdioma = { es: 'español', en: 'inglés', ru: 'ruso', hi: 'hindi' }[codigo] || codigo;
        const respuestaCambio = `Idioma cambiado a ${nombreIdioma}. ${tabla.generico[Math.floor(Math.random() * tabla.generico.length)]}`;
        return esUwuTexto ? uwuifyLocal(respuestaCambio) : respuestaCambio;
      }
    }

    // Matching por intents en el idioma detectado
    const patronesPorIdioma = {
      es: [
        { patrones: [/^(hola|buenas|buen\s+d[ií]a|buenas\s+tardes|buenas\s+noches|hey|hello|hi)\b/i], intent: 'saludo' },
        { patrones: [/^(adiós|chao|hasta+luego|nos+vemos|bye|goodbye|hasta+pronto)\b/i], intent: 'despedida' },
        { patrones: [/^(gracias|muchas+gracias|te+lo+agradezco|se+lo+agradezco|thanks|thank+you|gracias+por+todo)\b/i], intent: 'agradecimiento' },
        { patrones: [/qui[eé]n\s+es|sobre\s+mí|sobre\s+mauricio|perfil|qui[eé]n\s+es\s+mauricio/i], intent: 'sobre_mi' },
        { patrones: [/experiencia|trayectoria|historia|background/i], intent: 'experiencia' },
        { patrones: [/mejor proyecto|proyecto principal|destacado|featured/i], intent: 'mejor-proyecto' },
        { patrones: [/proyecto|proyectos/i], intent: 'proyectos' },
        { patrones: [/habilidad|skill|tecnolog[ií]a|tecnolog[ií]as|stack|qu[eé]\s+sabe/i], intent: 'habilidades' },
        { patrones: [/contacto|email|correo|escribir|mail|escr[ií]beme/i], intent: 'contacto' },
        { patrones: [/servicio|servicios|en qué te puedo ayudar|qué ofrecen|ayudar|ayúdame|ayudame|cómo podría|qué puedes hacer/i], intent: 'servicios' },
        { patrones: [/idioma|idiomas|en\s+qué\s+idiomas|idiomas\s+disponibles|qué\s+lenguas|lenguas|traducci[oó]n|traducir|español|ingl[ée]s|ruso|hindi|multidioma/i], intent: 'idiomas' },
        { patrones: [/cómo funcionas|cómo funciona el bot|como funciona el bot|bot funciona|cómo\s+eres|cómo\s+trabajas/i], intent: 'como_funcionas' },
        { patrones: [/precio|precios|cu[aá]nto\s+costa|cu[aá]nto\s+cobra|tarifa|presupuesto|costo/i], intent: 'precios' },
        { patrones: [/tiempo\s+de\s+entrega|cu[aá]nto\s+tarda|plazo|entrega/i], intent: 'tiempos' },
        { patrones: [/horario|disponibilidad|cu[aá]ndo\s+trabajas|hora\s+de\s+atenci[oó]n|diferencia\s+horaria|qu[eé]\s+hora\s+es\s+en\s+uruguay/i], intent: 'horario' },
        { patrones: [/derechos|c[oó]digo\s+fuente|derechos\s+de\s+autor|propiedad\s+intelectual|comprar\s+derechos/i], intent: 'derechos' },
      ],
      en: [
        { patrones: [/^(hello|hi|hey|good morning|good afternoon|good evening)\b/i], intent: 'saludo' },
        { patrones: [/^(goodbye|bye|see you|take care)\b/i], intent: 'despedida' },
        { patrones: [/^(thank you|thanks|thank you very much)\b/i], intent: 'agradecimiento' },
        { patrones: [/who is|about mauricio|profile|tell me about/i], intent: 'sobre_mi' },
        { patrones: [/experience|background|career/i], intent: 'experiencia' },
        { patrones: [/best project|main project|featured|highlight/i], intent: 'mejor-proyecto' },
        { patrones: [/project|projects/i], intent: 'proyectos' },
        { patrones: [/skill|skills|technology|technologies|stack|what does he know/i], intent: 'habilidades' },
        { patrones: [/contact|email|write to|mail|reach/i], intent: 'contacto' },
        { patrones: [/service|services|what do you offer|help me|how can he|what can he do/i], intent: 'servicios' },
        { patrones: [/language|languages|what languages|translate/i], intent: 'idiomas' },
        { patrones: [/how do you work|how does the bot work|how does it work|what are you|how do you function/i], intent: 'como_funcionas' },
        { patrones: [/price|prices|how much|cost|tariff|budget/i], intent: 'precios' },
        { patrones: [/delivery time|how long|deadline|turnaround/i], intent: 'tiempos' },
        { patrones: [/schedule|availability|when do you work|time zone|time difference|what time is it in uruguay/i], intent: 'horario' },
        { patrones: [/rights|source code|copyright|intellectual property|buy rights/i], intent: 'derechos' },
      ],
      ru: [
        { patrones: [/^(привет|здравствуйте|добрый день|добрый вечер)\b/i], intent: 'saludo' },
        { patrones: [/^(до свидания|пока|до скорой встречи)\b/i], intent: 'despedida' },
        { patrones: [/^(спасибо|благодарю)\b/i], intent: 'agradecimiento' },
        { patrones: [/кто такой|о Маурисио|профиль|расскажи о/i], intent: 'sobre_mi' },
        { patrones: [/опыт|предыстория|карьера/i], intent: 'experiencia' },
        { patrones: [/лучший проект|главный проект|избранный/i], intent: 'mejor-proyecto' },
        { patrones: [/проект|проекты/i], intent: 'proyectos' },
        { patrones: [/навык|навыки|технология|технологии|стек/i], intent: 'habilidades' },
        { patrones: [/контакт|почте|написать|связаться/i], intent: 'contacto' },
        { patrones: [/сервис|сервисы|что предлагаешь|помощь|помоги|чем можешь/i], intent: 'servicios' },
        { patrones: [/язык|языки|какие языки|перевод/i], intent: 'idiomas' },
        { patrones: [/как ты работаешь|как работает бот|как это работает|кто ты|как ты функционируешь/i], intent: 'como_funcionas' },
        { patrones: [/цена|цены|сколько стоит|бюджет|тариф/i], intent: 'precios' },
        { patrones: [/срок|доставка|сколько времени/i], intent: 'tiempos' },
        { patrones: [/график|время работы|часовая зона|разница во времени|сколько время в уругвае/i], intent: 'horario' },
        { patrones: [/права|исходный код|авторское право|купить права/i], intent: 'derechos' },
      ],
      hi: [
        { patrones: [/^(नमस्ते|नमस्कार|हैलो|हाय)\b/i], intent: 'saludo' },
        { patrones: [/^(अलविदा|फिर मिलेंगे|बाय)\b/i], intent: 'despedida' },
        { patrones: [/^(धन्यवाद|शुक्रिया)\b/i], intent: 'agradecimiento' },
        { patrones: [/मॉरिसियो कौन है|मॉरिसियो के बारे में|प्रोफाइल/i], intent: 'sobre_mi' },
        { patrones: [/अनुभव|पृष्ठभूमि|करियर/i], intent: 'experiencia' },
        { patrones: [/सर्वश्रेष्ठ परियोजना|मुख्य परियोजना/i], intent: 'mejor-proyecto' },
        { patrones: [/प्रोजेक्ट|प्रोजेक्ट्स/i], intent: 'proyectos' },
        { patrones: [/स्किल|स्किल्स|तकनीक|तकनीकें/i], intent: 'habilidades' },
        { patrones: [/संपर्क|ईमेल|लिखें|मेल/i], intent: 'contacto' },
        { patrones: [/सेवा|सेवाएं|क्या ऑफर करते|मदद|मदद करो|क्या कर सकते/i], intent: 'servicios' },
        { patrones: [/भाषा|भाषाएं|कौन सी भाषा|अनुवाद/i], intent: 'idiomas' },
        { patrones: [/बॉट कैसे काम करता है|बॉट कैसे काम करता|तुम कैसे काम करते हो|तुम कौन हो/i], intent: 'como_funcionas' },
        { patrones: [/कीमत|कीमतें|कितना खर्च|बजट|शुल्क/i], intent: 'precios' },
        { patrones: [/डिलीवरी समय|कितना समय|डेडलाइन/i], intent: 'tiempos' },
        { patrones: [/समय|उपलब्धता|कब काम करते हैं|टाइम ज़ोन|समय अंतर|उरुग्वे में क्या समय है/i], intent: 'horario' },
        { patrones: [/अधिकार|सोर्स कोड|कॉपीराइट|बौद्धिक संपदा|अधिकार खरीदें/i], intent: 'derechos' },
      ],
    };

    const listaPatrones = patronesPorIdioma[idioma] || patronesPorIdioma.es;
    for (const grupo of listaPatrones) {
      for (const pat of grupo.patrones) {
        if (pat.test(t)) {
          const claveIntent = grupo.intent;
          const respuestas = tabla[claveIntent] || tabla.generico;
          const respuestaIntent = respuestas[Math.floor(Math.random() * respuestas.length)];
          const textoFinal = esUwuTexto ? uwuifyLocal(respuestaIntent) : respuestaIntent;

          // Mapear intents a secciones para scroll suave
          const SECCIONES_POR_INTENT = {
            sobre_mi: 'sobre-mi',
            habilidades: 'habilidades',
            proyectos: 'proyectos',
            servicios: 'servicios',
            contacto: 'contacto',
            'mejor-proyecto': 'mejor-proyecto',
          };
          const seccionId = SECCIONES_POR_INTENT[claveIntent];
          if (seccionId) {
            accionPostRespuesta = { tipo: 'scroll', target: seccionId };
          }

          return textoFinal;
        }
      }
    }

    // Fallback genérico en el idioma detectado
    const respuestaFallback = tabla.generico[Math.floor(Math.random() * tabla.generico.length)];
    return esUwuTexto ? uwuifyLocal(respuestaFallback) : respuestaFallback;
  }

  async function enviar() {
    const texto = input.value.trim();
    if (!texto) return;
    if (enviando) return; // bloquea envíos concurrentes
    enviando = true;
    colapsarQuickReplies();
    agregarMensaje(texto, 'user');
    input.value = '';
    setTimeout(async () => {
      const typingDiv = mostrarEscribiendo();
      try {
        const respuesta = await respuestaIA(texto);
        escribir(respuesta, 'bot');
        ejecutarAccionPostRespuesta();
      } finally {
        ocultarEscribiendo(typingDiv);
        enviando = false;
      }
    }, 400);
  }

  send.addEventListener('click', enviar);
  input.addEventListener('keypress', (e) => { if (e.key === 'Enter') enviar(); });

  // Colapsar quick replies al enviar cualquier mensaje
  function colapsarQuickReplies() {
    const qr = document.getElementById('chat-quick-replies');
    if (qr) qr.classList.add('collapsed');
  }

  // Quick replies: al hacer clic, inserta la pregunta, envía y colapsa sugerencias.
  // Usamos respuestaDemo directamente (sin backend) para evitar que el servidor
  // externo devuelva la respuesta en un idioma inesperado.
  document.querySelectorAll('.qr').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.textContent.trim();
      if (!q) return;
      input.value = q;
      colapsarQuickReplies();
      agregarMensaje(q, 'user');
      input.value = '';
      const typingDiv = mostrarEscribiendo();
      setTimeout(() => {
        try {
          const respuesta = respuestaDemo(q);
          escribir(respuesta, 'bot');
          ejecutarAccionPostRespuesta();
        } finally {
          ocultarEscribiendo(typingDiv);
        }
      }, 400);
    });
  });

  // Toggle mostrar/ocultar quick replies
  const qrToggle = document.getElementById('qr-toggle');
  if (qrToggle) {
    qrToggle.addEventListener('click', () => {
      const qr = document.getElementById('chat-quick-replies');
      if (qr) qr.classList.toggle('collapsed');
    });
  }

  // Borrar chat: deja solo el mensaje de bienvenida del bot
  const btnClear = document.querySelector('.chat-clear');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      while (messages.children.length > 1) {
        messages.removeChild(messages.children[1]);
      }
      // Al borrar chat, volver a mostrar quick replies
      const qr = document.getElementById('chat-quick-replies');
      if (qr) qr.classList.remove('collapsed');
    });
  }

  // ── Panel: Enseñarle al bot ──
  const btnEnseñarToggle = document.getElementById('chat-enseñar-toggle');
  const btnEnseñarCerrar = document.getElementById('chat-enseñar-cerrar');
  const panelEnseñar = document.getElementById('chat-enseñar');
  const inputPregunta = document.getElementById('enseñar-pregunta');
  const inputRespuesta = document.getElementById('enseñar-respuesta');
  const btnEnseñarGuardar = document.getElementById('enseñar-guardar');
  const mensajeEnseñar = document.getElementById('enseñar-mensaje');

  if (btnEnseñarToggle && panelEnseñar) {
    btnEnseñarToggle.addEventListener('click', () => {
      panelEnseñar.classList.toggle('open');
      // Cerrar quick replies para que no tapen la vista
      const qr = document.getElementById('chat-quick-replies');
      if (qr) qr.classList.add('collapsed');
      if (panelEnseñar.classList.contains('open')) {
        inputPregunta.focus();
      }
    });
  }

  if (btnEnseñarCerrar && panelEnseñar) {
    btnEnseñarCerrar.addEventListener('click', () => {
      panelEnseñar.classList.remove('open');
    });
  }

  function mostrarMensajeEnseñar(texto, esExito) {
    if (!mensajeEnseñar) return;
    mensajeEnseñar.textContent = texto;
    mensajeEnseñar.className = 'chat-enseñar-mensaje ' + (esExito ? 'exito' : 'error');
  }

  if (btnEnseñarGuardar && inputPregunta && inputRespuesta) {
    btnEnseñarGuardar.addEventListener('click', async () => {
      const pregunta = inputPregunta.value.trim();
      const respuesta = inputRespuesta.value.trim();

      if (!pregunta || !respuesta) {
        mostrarMensajeEnseñar('Completá ambos campos.', false);
        return;
      }

      // Validaciones rápidas (mismas que el comando "enséñame:")
      if (pregunta.length < 3 || pregunta.length > 100) {
        mostrarMensajeEnseñar('La pregunta debe tener entre 3 y 100 caracteres.', false);
        return;
      }
      if (respuesta.length < 3 || respuesta.length > 300) {
        mostrarMensajeEnseñar('La respuesta debe tener entre 3 y 300 caracteres.', false);
        return;
      }
      const palabrasProhibidas = [
        'estúpido','estupido','idiota','imbécil','imbecil','tonto','puta','mierda','joder',
        'cabrón','cabron','gilipollas','boludo','pendejo','stupid','idiot','moron','dumb',
        'asshole','bitch','crap','damn','hell','http://','https://','www.','bit.ly','tinyurl',
        'rm ','sudo ','chmod ','chown ','format ','del /',
      ];
      const textoCompleto = (pregunta + ' ' + respuesta).toLowerCase();
      for (const palabra of palabrasProhibidas) {
        if (textoCompleto.includes(palabra)) {
          mostrarMensajeEnseñar('No puedo guardar esa respuesta: contenido no permitido.', false);
          return;
        }
      }

      try {
        await abrirDB();
        const id = await guardarEnseñanza(pregunta, respuesta);

        // Mostrar en el chat: pregunta del usuario + respuesta del bot (con botón de borrar)
        agregarMensaje(pregunta, 'user');
        escribir(respuesta, 'bot', 400);

        // Agregar el mensaje del bot con id para poder borrarlo después
        // (se crea un mensaje temporal y se le añade el id después de renderizar)
        setTimeout(() => {
          const ultimoBot = messages.querySelector('.message.bot:last-child');
          if (ultimoBot && !ultimoBot.dataset.idEnseñanza) {
            ultimoBot.dataset.idEnseñanza = id;
            const btnBorrar = document.createElement('button');
            btnBorrar.className = 'chat-borrar-enseñanza';
            btnBorrar.title = 'Borrar esta respuesta';
            btnBorrar.textContent = '🗑️';
            btnBorrar.dataset.id = id;
            btnBorrar.addEventListener('click', async (e) => {
              e.stopPropagation();
              try {
                await borrarEnseñanza(parseInt(btnBorrar.dataset.id, 10));
                ultimoBot.remove();
              } catch (err) {
                console.error('Error al borrar enseñanza:', err);
              }
            });
            ultimoBot.appendChild(btnBorrar);
          }
        }, 450);

        mostrarMensajeEnseñar('¡Guardado localmente!', true);
        inputPregunta.value = '';
        inputRespuesta.value = '';
        setTimeout(() => mostrarMensajeEnseñar('', false), 4000);
      } catch (err) {
        console.error('Error al guardar enseñanza:', err);
        mostrarMensajeEnseñar('No se pudo guardar en el almacenamiento local.', false);
      }
    });
  }

  // Botón CTA del hero: scroll suave a #proyectos (igual que el chatbot)
  const btnCtaHero = document.querySelector('.cta-hero');
  if (btnCtaHero) {
    btnCtaHero.addEventListener('click', (e) => {
      e.preventDefault();
      const seccion = document.getElementById('proyectos');
      if (seccion) {
        setTimeout(() => {
          scrollSuaveA(seccion, 3000);
        }, 80);
      }
    });
  }

  // Enlaces del nav: scroll suave a cada sección (Sobre mí, Habilidades, Proyectos, Contacto)
  document.querySelectorAll('.nav__links .link').forEach((enlace) => {
    enlace.addEventListener('click', (e) => {
      e.preventDefault();
      const href = enlace.getAttribute('href');
      if (href && href.startsWith('#')) {
        const id = href.slice(1); // quita el '#'
        const seccion = document.getElementById(id);
        if (seccion) {
          setTimeout(() => {
            scrollSuaveA(seccion, 3000);
          }, 80);
        }
      }
    });
  });

  // Avatar del nav: scroll suave al inicio de la página
  const avatarNav = document.querySelector('.nav__avatar');
  if (avatarNav) {
    avatarNav.addEventListener('click', (e) => {
      e.preventDefault();
      setTimeout(() => {
        scrollSuaveA(document.documentElement, 3000, 0);
      }, 80);
    });
  }
})();
