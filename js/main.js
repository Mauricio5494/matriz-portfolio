document.getElementById('year').textContent = new Date().getFullYear();

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

/* ============================================================
   FONDO INTERACTIVO DE PARTÍCULAS (constelación)
   Técnicas de creative coding (Codrops / web.dev):
   - requestAnimationFrame para animación fluida
   - Partículas con trail suave y fade-out
   - Líneas que cambian de grosor según distancia
   - Partículas atraídas suavemente hacia el cursor
   ============================================================ */
(function () {
  const pcanvas = document.getElementById('particle-canvas');
  const pctx = pcanvas.getContext('2d');

  let pwidth, pheight;
  let particles = [];
  let mouse = { x: null, y: null, active: false };

  // Configuración de partículas (estilo Codrops creative coding)
  const PARTICLE_COUNT = 150;
  const CONNECT_DIST = 160;
  const MOUSE_ATTRACT_DIST = 220;

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * pwidth;
      this.y = Math.random() * pheight;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.size = Math.random() * 3 + 1;
      this.alpha = Math.random() * 0.7 + 0.2;
      this.originalAlpha = this.alpha;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Rebote en bordes
      if (this.x < 0 || this.x > pwidth) this.vx *= -1;
      if (this.y < 0 || this.y > pheight) this.vy *= -1;

      // Atracción suave hacia el cursor
      if (mouse.active) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MOUSE_ATTRACT_DIST) {
          const force = (MOUSE_ATTRACT_DIST - dist) / MOUSE_ATTRACT_DIST;
          this.vx += (dx / dist) * force * 0.015;
          this.vy += (dy / dist) * force * 0.015;
          // Brillar más cuando el cursor está cerca
          this.alpha = Math.min(0.95, this.originalAlpha + force * 0.4);
        } else {
          this.alpha = Math.max(0.1, this.alpha - 0.01);
        }
      }

      // Limitar velocidad
      const speed = Math.hypot(this.vx, this.vy);
      if (speed > 1.2) {
        this.vx = (this.vx / speed) * 1.2;
        this.vy = (this.vy / speed) * 1.2;
      }

      // Desvanecer lentamente
      if (this.alpha > 0) this.alpha -= 0.0005;
      if (this.alpha <= 0) this.reset();
    }

    draw() {
      pctx.beginPath();
      pctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      pctx.fillStyle = `rgba(255, 26, 26, ${this.alpha})`;
      pctx.fill();
      pctx.closePath();
    }
  }

  function presize() {
    pwidth = pcanvas.width = window.innerWidth;
    pheight = pcanvas.height = window.innerHeight;
    initParticles();
  }
  window.addEventListener('resize', presize);
  presize();

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  function pdraw() {
    // Trail suave con fade-out (técnica de creative coding) — más sutil para dejar ver el Matrix detrás
    pctx.fillStyle = 'rgba(5, 5, 5, 0.12)';
    pctx.fillRect(0, 0, pwidth, pheight);

    // Dibujar líneas entre partículas cercanas — más visibles
    pctx.beginPath();
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < CONNECT_DIST) {
          const opacity = (1 - dist / CONNECT_DIST) * 0.7;
          pctx.moveTo(particles[i].x, particles[i].y);
          pctx.lineTo(particles[j].x, particles[j].y);
          pctx.strokeStyle = `rgba(255, 170, 0, ${opacity})`;
          pctx.lineWidth = opacity * 1.2;
        }
      }
    }
    pctx.stroke();

    // Actualizar y dibujar partículas
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Cursor interactivo (punto más grande que atrae partículas)
    if (mouse.active) {
      pctx.beginPath();
      pctx.arc(mouse.x, mouse.y, 6, 0, Math.PI * 2);
      pctx.fillStyle = 'rgba(255, 170, 0, 0.6)';
      pctx.fill();
      pctx.closePath();
    }

    requestAnimationFrame(pdraw);
  }

  pdraw();

  function setMouse(x, y, active) {
    mouse.x = x;
    mouse.y = y;
    mouse.active = active;
  }

  window.addEventListener('mousemove', (e) => setMouse(e.clientX, e.clientY, true));
  window.addEventListener('mouseleave', () => setMouse(null, null, false));

  window.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    setMouse(touch.clientX, touch.clientY, true);
  }, { passive: true });

  window.addEventListener('touchend', () => setMouse(null, null, false));

  // Inicializar partículas tras un pequeño delay
  setTimeout(initParticles, 100);
})();

/* ============================================================
   EFECTO NEÓN INTERACTIVO AL PASAR EL MOUSE SOBRE LETRAS
   JavaScript detecta el elemento bajo el cursor y le aplica
   un brillo neón rojo/ámbar que se desvanece al moverse.
   ============================================================ */
(function () {
  let lastEl = null;

  function aplicarNeon(el) {
    if (!el || el === document.body || el === document.documentElement) return;
    const txt = el.textContent || '';
    if (!txt.trim()) return;

    el.style.textShadow = '0 0 10px #ff1a1a, 0 0 20px #ffaa00, 0 0 35px #ff1a1a';
    el.style.transition = 'text-shadow 0.15s ease';
    el.style.color = '#ffaa00';
  }

  function quitarNeon(el) {
    if (!el) return;
    el.style.textShadow = '';
    el.style.transition = '';
    el.style.color = '';
  }

  document.addEventListener('mousemove', (e) => {
    const els = document.elementsFromPoint(e.clientX, e.clientY);
    // elementsFromPoint devuelve de más específico (topmost) a menos específico
    // Tomamos el primer elemento que no sea body/html y que tenga texto
    let el = null;
    for (let i = 0; i < els.length; i++) {
      const candidate = els[i];
      if (candidate.tagName !== 'BODY' && candidate.tagName !== 'HTML' && candidate.textContent && candidate.textContent.trim()) {
        el = candidate;
        break;
      }
    }
    if (el !== lastEl) {
      quitarNeon(lastEl);
      lastEl = el;
      aplicarNeon(el);
    }
  });

  document.addEventListener('mouseleave', () => {
    quitarNeon(lastEl);
    lastEl = null;
  });
})();

/* ============================================================
   EFECTO ELÉCTRICO EN BORDES (hero y tarjetas de proyecto)
   JS inyecta una animación de box-shadow que pulsa entre rojo
   y ámbar, dando sensación de electricidad/neón inestable.
   ============================================================ */
(function () {
  const style = document.createElement('style');
  style.textContent = `
    .electric-border {
      animation: electric-border 2s ease-in-out infinite;
    }
    @keyframes electric-border {
      0%, 100% {
        box-shadow: 0 0 10px var(--matrix-red), 0 0 20px rgba(255, 26, 26, 0.3);
        border-color: var(--matrix-red);
      }
      50% {
        box-shadow: 0 0 20px var(--matrix-amber), 0 0 40px rgba(255, 170, 0, 0.5), 0 0 60px rgba(255, 170, 0, 0.2);
        border-color: var(--matrix-amber);
      }
    }
  `;
  document.head.appendChild(style);

  const hero = document.querySelector('.hero');
  if (hero) hero.classList.add('electric-border');

  document.querySelectorAll('.project-card').forEach(function (card) {
    card.classList.add('electric-border');
  });
})();

/* ============================================================
   LOCALIZACIÓN (es / en / ru / hi)
   - Lee el idioma guardado en localStorage (o 'es' por defecto)
   - Renderiza todos los elementos con data-i18n
   - El selector de idioma en el nav guarda la elección
   ============================================================ */
(function () {
  const IDIOMAS = {
    es: { nombre: 'Español', nativo: 'Español' },
    en: { nombre: 'English', nativo: 'English' },
    ru: { nombre: 'Русский', nativo: 'Русский' },
    hi: { nombre: 'हिन्दी', nativo: 'हिन्दी' }
  };

  const TRADUCCIONES = {
    es: {
      'nav.sobre-mi': 'Sobre mí',
      'nav.habilidades': 'Habilidades',
      'nav.proyectos': 'Proyectos',
      'nav.contacto': 'Contacto',
      'hero.titulo': 'Desarrollador de Software',
      'hero.subtitulo': 'Desarrollador de Software',
      'hero.enfoque': 'Enfoque en Python, JavaScript y automatización creativa',
      'hero.descripcion': 'Construyendo herramientas que resuelven problemas reales. Enfocado en pilas tecnológicas demandadas por el mercado actual.',
      'hero.badge': 'Código abierto · En constante aprendizaje',
      'seccion.sobre-mi': 'Sobre mí',
      'seccion.habilidades': 'Habilidades',
      'seccion.proyectos': 'Proyectos',
      'seccion.contacto': 'Contacto',
      'sobre-mi.p1': 'Soy desarrollador de software con interés en crear soluciones prácticas para problemas concretos. Mi experiencia abarca scripting en Python, desarrollo web con JavaScript/TypeScript, y herramientas de automatización para entornos creativos como Blender.',
      'sobre-mi.p2': 'Me especializo en escribir código limpio, mantener repositorios organizados en Git y entregar prototipos funcionales que puedan evolucionar hacia productos reales.',
      'skills.lenguajes': 'Lenguajes',
      'skills.frontend': 'Frontend',
      'skills.backend': 'Backend & DevOps',
      'skills.creativas': 'Herramientas creativas',
      'skill.python': 'Python',
      'skill.javascript': 'JavaScript',
      'skill.typescript': 'TypeScript',
      'skill.sql': 'SQL',
      'skill.react': 'React',
      'skill.htmlcss': 'HTML5 / CSS3',
      'skill.tailwind': 'Tailwind CSS',
      'skill.githubpages': 'GitHub Pages',
      'skill.nodejs': 'Node.js',
      'skill.docker': 'Docker',
      'skill.git': 'Git',
      'skill.cicd': 'CI/CD básico',
      'skill.blender': 'Blender (Python API)',
      'skill.pipelines': 'Automatización de pipelines',
      'skill.logs': 'Análisis de logs',
      'proyecto1.titulo': 'Validador de assets para motor de juegos',
      'proyecto1.desc': 'Herramienta en Python para validar archivos de motor (.inc, .ext, .mdl) y detectar errores comunes antes de instalar mods en el juego.',
      'proyecto2.titulo': 'Analizador de game.log para Proton/Wine',
      'proyecto2.desc': 'Utilidad que lee logs de juegos ejecutados bajo Proton y traduce errores del motor a pasos de solución para modders.',
      'proyecto3.titulo': 'Panel de administración Full Stack',
      'proyecto3.desc': 'Panel web con autenticación JWT, gestión de usuarios, subida de imágenes y exportación a CSV.',
      'proyecto3.demo': 'Ver demo en vivo →',
      'tag.python': 'Python',
      'tag.cli': 'CLI',
      'tag.modding': 'Modding',
      'tag.linux': 'Linux',
      'tag.proton': 'Proton',
      'tag.react': 'React',
      'tag.nodejs': 'Node.js',
      'tag.typescript': 'TypeScript',
      'contacto.p1': '¿Tienes un proyecto en mente? Escríbeme:',
      'contacto.email': 'mauriciogorilluberas@gmail.com',
      'contacto.github': 'GitHub',
      'footer.copyright': '© <span id="year"></span> Mauricio · Construido con código abierto',
      'chat.qr.quien_es': '¿Quién es Mauricio?',
      'chat.qr.proyectos': '¿Qué proyectos tiene?',
      'chat.qr.habilidades': '¿Qué habilidades tiene?',
      'chat.qr.contacto': '¿Cómo contacto a Mauricio?',
      'chat.qr.contratar': '¿Está disponible para contratar?',
      'chat.qr.idiomas': '¿Qué idiomas tiene el sitio?'
    },
    en: {
      'nav.sobre-mi': 'About me',
      'nav.habilidades': 'Skills',
      'nav.proyectos': 'Projects',
      'nav.contacto': 'Contact',
      'hero.titulo': 'Software Developer',
      'hero.subtitulo': 'Software Developer',
      'hero.enfoque': 'Focus on Python, JavaScript and creative automation',
      'hero.descripcion': 'Building tools that solve real problems. Focused on technology stacks in demand by the current market.',
      'hero.badge': 'Open source · Constantly learning',
      'seccion.sobre-mi': 'About me',
      'seccion.habilidades': 'Skills',
      'seccion.proyectos': 'Projects',
      'seccion.contacto': 'Contact',
      'sobre-mi.p1': 'I am a software developer interested in creating practical solutions for concrete problems. My experience covers Python scripting, web development with JavaScript/TypeScript, and automation tools for creative environments like Blender.',
      'sobre-mi.p2': 'I specialize in writing clean code, keeping Git repositories organized, and delivering functional prototypes that can evolve into real products.',
      'skills.lenguajes': 'Languages',
      'skills.frontend': 'Frontend',
      'skills.backend': 'Backend & DevOps',
      'skills.creativas': 'Creative tools',
      'skill.python': 'Python',
      'skill.javascript': 'JavaScript',
      'skill.typescript': 'TypeScript',
      'skill.sql': 'SQL',
      'skill.react': 'React',
      'skill.htmlcss': 'HTML5 / CSS3',
      'skill.tailwind': 'Tailwind CSS',
      'skill.githubpages': 'GitHub Pages',
      'skill.nodejs': 'Node.js',
      'skill.docker': 'Docker',
      'skill.git': 'Git',
      'skill.cicd': 'Basic CI/CD',
      'skill.blender': 'Blender (Python API)',
      'skill.pipelines': 'Pipeline automation',
      'skill.logs': 'Log analysis',
      'proyecto1.titulo': 'Game engine asset validator',
      'proyecto1.desc': 'Python tool to validate engine files (.inc, .ext, .mdl) and detect common errors before installing mods in the game.',
      'proyecto2.titulo': 'game.log analyzer for Proton/Wine',
      'proyecto2.desc': 'Utility that reads logs from games running under Proton and translates engine errors into troubleshooting steps for modders.',
      'proyecto3.titulo': 'Full Stack administration panel',
      'proyecto3.desc': 'Web panel with JWT authentication, user management, image upload and CSV export.',
      'proyecto3.demo': 'View live demo →',
      'tag.python': 'Python',
      'tag.cli': 'CLI',
      'tag.modding': 'Modding',
      'tag.linux': 'Linux',
      'tag.proton': 'Proton',
      'tag.react': 'React',
      'tag.nodejs': 'Node.js',
      'tag.typescript': 'TypeScript',
      'contacto.p1': 'Do you have a project in mind? Write to me:',
      'contacto.email': 'mauriciogorilluberas@gmail.com',
      'contacto.github': 'GitHub',
      'footer.copyright': '© <span id="year"></span> Mauricio · Built with open source code',
      'chat.qr.quien_es': 'Who is Mauricio?',
      'chat.qr.proyectos': 'What projects does he have?',
      'chat.qr.habilidades': 'What skills does he have?',
      'chat.qr.contacto': 'How do I contact Mauricio?',
      'chat.qr.contratar': 'Is he available for hire?',
      'chat.qr.idiomas': 'What languages does the site have?'
    },
    ru: {
      'nav.sobre-mi': 'Обо мне',
      'nav.habilidades': 'Навыки',
      'nav.proyectos': 'Проекты',
      'nav.contacto': 'Контакты',
      'hero.titulo': 'Разработчик ПО',
      'hero.subtitulo': 'Разработчик ПО',
      'hero.enfoque': 'Фокус на Python, JavaScript и креативная автоматизация',
      'hero.descripcion': 'Создаю инструменты, которые решают реальные задачи. Сосредоточен на технологических стеках, востребованных на текущем рынке.',
      'hero.badge': 'Открытый код · Постоянное обучение',
      'seccion.sobre-mi': 'Обо мне',
      'seccion.habilidades': 'Навыки',
      'seccion.proyectos': 'Проекты',
      'seccion.contacto': 'Контакты',
      'sobre-mi.p1': 'Я разработчик ПО, интересующийся созданием практических решений для конкретных задач. Мой опыт включает скрипты на Python, веб-разработку на JavaScript/TypeScript и инструменты автоматизации для креативных сред, таких как Blender.',
      'sobre-mi.p2': 'Специализируюсь на написании чистого кода, организации репозиториев Git и создании рабочих прототипов, которые могут эволюционировать в реальные продукты.',
      'skills.lenguajes': 'Языки',
      'skills.frontend': 'Фронтенд',
      'skills.backend': 'Бэкенд & DevOps',
      'skills.creativas': 'Креативные инструменты',
      'skill.python': 'Python',
      'skill.javascript': 'JavaScript',
      'skill.typescript': 'TypeScript',
      'skill.sql': 'SQL',
      'skill.react': 'React',
      'skill.htmlcss': 'HTML5 / CSS3',
      'skill.tailwind': 'Tailwind CSS',
      'skill.githubpages': 'GitHub Pages',
      'skill.nodejs': 'Node.js',
      'skill.docker': 'Docker',
      'skill.git': 'Git',
      'skill.cicd': 'Базовый CI/CD',
      'skill.blender': 'Blender (Python API)',
      'skill.pipelines': 'Автоматизация конвейеров',
      'skill.logs': 'Анализ логов',
      'proyecto1.titulo': 'Валидатор ассетов игрового движка',
      'proyecto1.desc': 'Инструмент на Python для валидации файлов движка (.inc, .ext, .mdl) и обнаружения общих ошибок перед установкой модов в игру.',
      'proyecto2.titulo': 'Анализатор game.log для Proton/Wine',
      'proyecto2.desc': 'Утилита, которая читает логи игр, запущенных под Proton, и переводит ошибки движка в шаги по устранению неполадок для моддеров.',
      'proyecto3.titulo': 'Полноценная панель администрирования',
      'proyecto3.desc': 'Веб-панель с аутентификацией JWT, управлением пользователями, загрузкой изображений и экспортом в CSV.',
      'proyecto3.demo': 'Посмотреть живую демо-версию →',
      'tag.python': 'Python',
      'tag.cli': 'CLI',
      'tag.modding': 'Моддинг',
      'tag.linux': 'Linux',
      'tag.proton': 'Proton',
      'tag.react': 'React',
      'tag.nodejs': 'Node.js',
      'tag.typescript': 'TypeScript',
      'contacto.p1': 'Есть проект? Напишите мне:',
      'contacto.email': 'mauriciogorilluberas@gmail.com',
      'contacto.github': 'GitHub',
      'footer.copyright': '© <span id="year"></span> Mauricio · Сделано с открытым исходным кодом',
      'chat.qr.quien_es': 'Кто такой Маурисио?',
      'chat.qr.proyectos': 'Какие у него проекты?',
      'chat.qr.habilidades': 'Какие у него навыки?',
      'chat.qr.contacto': 'Как связаться с Маурисио?',
      'chat.qr.contratar': 'Доступен ли он для найма?',
      'chat.qr.idiomas': 'На каких языках сайт?'
    },
    hi: {
      'nav.sobre-mi': 'मेरे बारे में',
      'nav.habilidades': 'कौशल',
      'nav.proyectos': 'परियोजनाएं',
      'nav.contacto': 'संपर्क',
      'hero.titulo': 'सॉफ्टवेयर डेवलपर',
      'hero.subtitulo': 'सॉफ्टवेयर डेवलपर',
      'hero.enfoque': 'फोकस पायथन, जावास्क्रिप्ट और रचनात्मक ऑटोमेशन पर',
      'hero.descripcion': 'वास्तविक समस्याओं को हल करने वाले टूल बना रहे हैं। वर्तमान बाजार की मांग के अनुसार प्रौद्योगिकी स्टैक पर ध्यान केंद्रित किया गया है।',
      'hero.badge': 'ओपन सोर्स · लगातार सीख रहे हैं',
      'seccion.sobre-mi': 'मेरे बारे में',
      'seccion.habilidades': 'कौशल',
      'seccion.proyectos': 'परियोजनाएं',
      'seccion.contacto': 'संपर्क',
      'sobre-mi.p1': 'मैं एक सॉफ्टवेयर डेवलपर हूं जो ठोस समस्याओं के लिए व्यावहारिक समाधान बनाने में रुचि रखता हूं। मेरा अनुभव पायथन स्क्रिप्टिंग, जावास्क्रिप्ट/टाइपस्क्रिप्ट के साथ वेब विकास, और ब्लेंडर जैसे रचनात्मक वातावरण के लिए स्वचालन उपकरणों को कवर करता है।',
      'sobre-mi.p2': 'मैं स्वच्छ कोड लिखने, गिट रिपॉजिटरी को व्यवस्थित रखने और कार्यात्मक प्रोटोटाइप देने में विशेषज्ञता रखता हूं जो वास्तविक उत्पादों में विकसित हो सकते हैं।',
      'skills.lenguajes': 'भाषाएं',
      'skills.frontend': 'फ्रंटएंड',
      'skills.backend': 'बैकएंड और डेवऑप्स',
      'skills.creativas': 'रचनात्मक उपकरण',
      'skill.python': 'पायथन',
      'skill.javascript': 'जावास्क्रिप्ट',
      'skill.typescript': 'टाइपस्क्रिप्ट',
      'skill.sql': 'एसक्यूएल',
      'skill.react': 'रिएक्ट',
      'skill.htmlcss': 'एचटीएमएल5 / सीएसएस3',
      'skill.tailwind': 'टेलविंड सीएसएस',
      'skill.githubpages': 'गिटहब पेजेस',
      'skill.nodejs': 'नोड.जेएस',
      'skill.docker': 'डॉकर',
      'skill.git': 'गिट',
      'skill.cicd': 'बेसिक सीआई/सीडी',
      'skill.blender': 'ब्लेंडर (पायथन एपीआई)',
      'skill.pipelines': 'पाइपलाइन स्वचालन',
      'skill.logs': 'लॉग विश्लेषण',
      'proyecto1.titulo': 'गेम इंजन एसेट वैलिडेटर',
      'proyecto1.desc': 'पायथन टूल जो इंजन फाइलों (.inc, .ext, .mdl) को वैलिडेट करता है और गेम में मोड इंस्टॉल करने से पहले सामान्य त्रुटियों का पता लगाता है।',
      'proyecto2.titulo': 'प्रोटॉन/वाइन के लिए गेम.लॉग विश्लेषक',
      'proyecto2.desc': 'एक उपयोगिता जो प्रोटॉन के तहत चलने वाले गेम के लॉग को पढ़ती है और मॉडर्स के लिए समस्या निवारण चरणों में इंजन त्रुटियों का अनुवाद करती है।',
      'proyecto3.titulo': 'फुल स्टैक प्रशासन पैनल',
      'proyecto3.desc': 'वेब पैनल जेडब्ल्यूटी प्रमाणीकरण, उपयोगकर्ता प्रबंधन, छवि अपलोड और सीएसवी निर्यात के साथ।',
      'proyecto3.demo': 'लाइव डेमो देखें →',
      'tag.python': 'पायथन',
      'tag.cli': 'सीएलआई',
      'tag.modding': 'मॉडिंग',
      'tag.linux': 'लिनक्स',
      'tag.proton': 'प्रोटॉन',
      'tag.react': 'रिएक्ट',
      'tag.nodejs': 'नोड.जेएस',
      'tag.typescript': 'टाइपस्क्रिप्ट',
      'contacto.p1': 'क्या आपके मन में कोई परियोजना है? मुझे लिखें:',
      'contacto.email': 'mauriciogorilluberas@gmail.com',
      'contacto.github': 'गिटहब',
      'footer.copyright': '© <span id="year"></span> Mauricio · ओपन सोर्स कोड के साथ बनाया गया',
      'chat.qr.quien_es': 'मॉरिसियो कौन हैं?',
      'chat.qr.proyectos': 'उनके पास क्या प्रोजेक्ट्स हैं?',
      'chat.qr.habilidades': 'उनके पास क्या कौशल हैं?',
      'chat.qr.contacto': 'मैं मॉरिसियो से कैसे संपर्क करूँ?',
      'chat.qr.contratar': 'क्या वे काम के लिए उपलब्ध हैं?',
      'chat.qr.idiomas': 'साइट पर कौन सी भाषा है?'
    }
  };

  const selector = document.getElementById('idioma-selector');
  let idiomaActual = localStorage.getItem('idioma') || 'es';

  function render(idioma) {
    const t = TRADUCCIONES[idioma];
    if (!t) return;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const clave = el.getAttribute('data-i18n');
      const texto = t[clave];
      if (texto !== undefined) {
        el.innerHTML = texto;
      }
    });

    // Actualizar data-q de los quick replies del chat con el texto traducido
    document.querySelectorAll('.qr[data-q-key]').forEach(function (btn) {
      const key = btn.getAttribute('data-q-key');
      const texto = t[key];
      if (texto !== undefined) {
        btn.setAttribute('data-q', texto);
      }
    });

    if (selector) selector.value = idioma;
    localStorage.setItem('idioma', idioma);
    idiomaActual = idioma;
  }

  if (selector) {
    selector.value = idiomaActual;
    selector.addEventListener('change', function (e) {
      render(e.target.value);
    });
  }

  render(idiomaActual);
  window.cambiarIdiomaPortfolio = render;

  // Volver a poner el año tras cada render (el innerHTML recrea el span)
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
})();

/* ============================================================
   CURSOR PERSONALIZADO — WITCH PUSHEEN
   - Gatito quieto (idle) y moviéndose (move) según el mouse
   - Rota según la dirección del movimiento
   - Trail mágico con Canvas y partículas brillantes
   - Partículas de impacto mágico al hacer clic
   ============================================================ */
(function () {
  const cursor = document.getElementById('cursor-custom');
  const trailCanvas = document.getElementById('cursor-trail');
  const trailCtx = trailCanvas.getContext('2d');
  const impactoCanvas = document.getElementById('cursor-impact');
  const impactoCtx = impactoCanvas.getContext('2d');
  if (!cursor || !trailCanvas || !impactoCanvas) return;

  const interactivos = 'a, button, select, input, .badge, [data-i18n="proyecto3.demo"]';
  let lastX = 0;
  let lastY = 0;
  let quietoTimeout = null;
  let twidth, theight;
  let particles = [];
  let impactParticles = [];

  // Colores mágicos de fantasía para el trail y los impactos
  const COLORES_MAGICOS = [
    '#bf00ff', // morado brujo
    '#ff00ff', // rosa mágico
    '#00ffff', // cyan brillante
    '#ffd700', // dorado
    '#e0bbff', // lavanda
    '#ff69b4', // rosa fuerte
  ];

  // Ajustar tamaño del canvas del trail
  function resize() {
    twidth = trailCanvas.width = window.innerWidth;
    theight = trailCanvas.height = window.innerHeight;
    impactoCanvas.width = window.innerWidth;
    impactoCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Clase Partícula para el trail mágico en Canvas
  class TrailParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = (Math.random() - 0.5) * 2 - 1; // tiende a subir un poco
      this.size = Math.random() * 4 + 2;
      this.alpha = Math.random() * 0.4 + 0.6;
      this.color = COLORES_MAGICOS[Math.floor(Math.random() * COLORES_MAGICOS.length)];
      this.life = 1.0;
      this.decay = Math.random() * 0.02 + 0.015;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
      this.alpha = this.life;
      this.size *= 0.96;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Clase Partícula para el impacto mágico al hacer clic (estilo Canvas)
  class ImpactParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angulo = Math.random() * Math.PI * 2;
      const velocidad = Math.random() * 6 + 2;
      this.vx = Math.cos(angulo) * velocidad;
      this.vy = Math.sin(angulo) * velocidad;
      this.size = Math.random() * 5 + 2;
      this.alpha = Math.random() * 0.4 + 0.6;
      this.color = COLORES_MAGICOS[Math.floor(Math.random() * COLORES_MAGICOS.length)];
      this.life = 1.0;
      this.decay = Math.random() * 0.04 + 0.02;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.92;
      this.vy *= 0.92;
      this.life -= this.decay;
      this.alpha = this.life;
      this.size *= 0.94;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // --- Movimiento del cursor y detección de movimiento/quietud ---
  function moverCursor(x, y) {
    const dx = x - lastX;
    const dy = y - lastY;

    // Si hay movimiento real: rotar y mostrar imagen de vuelo
    if (dx !== 0 || dy !== 0) {
      const angulo = Math.atan2(dy, dx) * (180 / Math.PI);
      cursor.style.transform = `translate(-50%, -50%) rotate(${angulo}deg)`;
      cursor.classList.add('moviendose');
    }

    cursor.style.left = x + 'px';
    cursor.style.top = y + 'px';

    lastX = x;
    lastY = y;

    // Detectar que se está moviendo: resetear timeout de quietud
    if (quietoTimeout) clearTimeout(quietoTimeout);
    quietoTimeout = setTimeout(() => {
      // Al quedar quieto: imagen estática idle y rotación 0deg
      cursor.classList.remove('moviendose');
      cursor.style.transform = 'translate(-50%, -50%) rotate(0deg)';
    }, 150);

    // Emitir partículas de trail mágico en la posición del mouse
    const cantidad = Math.random() > 0.5 ? 2 : 1;
    for (let c = 0; c < cantidad; c++) {
      particles.push(new TrailParticle(x, y));
    }
  }

  window.addEventListener('mousemove', (e) => moverCursor(e.clientX, e.clientY));

  // Ocultar/mostrar al entrar/salir de la ventana
  window.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });
  window.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });

  // Bucle de animación del trail en Canvas
  function drawTrail() {
    // Limpiar con un trail suave (rgba baja opacidad para dejar rastro)
    trailCtx.fillStyle = 'rgba(5, 5, 5, 0.25)';
    trailCtx.fillRect(0, 0, twidth, theight);

    // Actualizar y dibujar partículas
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw(trailCtx);
      if (p.life <= 0 || p.size < 0.5) {
        particles.splice(i, 1);
      }
    }

    requestAnimationFrame(drawTrail);
  }
  drawTrail();

  // Bucle de animación de partículas de impacto en Canvas
  function drawImpact() {
    // Limpiar completamente cada frame (sin estela, son explosiones puntuales)
    impactoCtx.clearRect(0, 0, twidth, theight);

    // Actualizar y dibujar partículas de impacto
    for (let i = impactParticles.length - 1; i >= 0; i--) {
      const p = impactParticles[i];
      p.update();
      p.draw(impactoCtx);
      if (p.life <= 0 || p.size < 0.5) {
        impactParticles.splice(i, 1);
      }
    }

    requestAnimationFrame(drawImpact);
  }
  drawImpact();

  // --- Partículas de impacto mágico al hacer clic (Canvas) ---
  function crearImpactoMagico(x, y) {
    const cantidad = 14;
    for (let i = 0; i < cantidad; i++) {
      impactParticles.push(new ImpactParticle(x, y));
    }
  }

  window.addEventListener('mousedown', (e) => crearImpactoMagico(e.clientX, e.clientY));

  // Clase .activo al pasar sobre elementos interactivos
  document.querySelectorAll(interactivos).forEach(function (el) {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('activo');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('activo');
    });
  });
})();

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

  toggle.addEventListener('click', () => {
    abierto = !abierto;
    panel.classList.toggle('open', abierto);
    if (abierto) input.focus();
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

  function agregarMensaje(texto, quien) {
    const div = document.createElement('div');
    div.className = 'message ' + quien;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = enlazarTexto(texto);
    div.appendChild(bubble);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function escribir(texto, quien, delay = 0) {
    setTimeout(() => agregarMensaje(texto, quien), delay);
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
      try {
        const resp = await fetch(`${RAILWAY_BACKEND_URL}/api/teach`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pregunta, respuesta }),
        });
        if (resp.ok) {
          return `Aprendido. Si preguntás "${pregunta}", responderé "${respuesta}".`;
        }
        return 'No pude guardar esa respuesta. Probá de nuevo más tarde.';
      } catch (e) {
        return 'Error al conectar con el backend para guardar la respuesta.';
      }
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
        // que tiene mejor detección de intents y respuestas multidioma más completas
        if (data.fuente === 'demo') {
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
      patrones: [/qu[ié]n\s+es|sobre\s+mí|sobre\s+mauricio|perfil|qu[ié]n\s+es\s+mauricio/i],
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
      patrones: [/eres\s+tú|qu[ié]n\s+sos|qué\s+eres|asistente|chat|bot/i],
      respuesta: 'Soy el asistente virtual demo de Mauricio. Puedo aprender nuevas respuestas si me enseñás, o responder sobre sus proyectos, habilidades y contacto.',
      prioridad: 60,
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
    const ruLatWords = ['privet','zdravstvuy','kak dela','spasibo','do svidaniya','poka','kto takoy','proekty','nachki','kontakt','yazyk','yazyki','perevod','russkij','hindij'];
    for (const p of ruLatWords) if (tl.includes(p)) return 'ru';
    // Transliteración latina de hindi (Hinglish) — solo palabras distintivas del devanagari
    const hiLatWords = ['namaste','namaskar','kaise ho','dhanyavad','phir milenge','alvida','koun hai','likhein','bhasha','bhashayen','anuvad','hindij'];
    for (const p of hiLatWords) if (tl.includes(p)) return 'hi';
    const enWords = ['hello','hi ',' hi','hey','how are','what is','who is','can you','projects','skills','contact','thank','goodbye','bye','can i','how can'];
    for (const p of enWords) if (tl.includes(p)) return 'en';
    const esWords = ['hola','buenas','gracias','proyecto','proyectos','habilidad','habilidades','contacto','¿quién','quien','sobre','python','javascript','idioma','idiomas','español','cambiar','puedes','cómo','cuál','¿qué'];
    for (const p of esWords) if (tl.includes(p)) return 'es';
    return 'es'; // por defecto español
  }

  // Respuestas demo multidioma por intent
  const RESPUESTAS_DEMO_IDIOMAS = {
    es: {
      saludo: ['¡Hola! Soy el asistente virtual de Mauricio Gori. Pregúntame sobre sus proyectos, habilidades, experiencia o cómo contactarlo.'],
      despedida: ['¡Hasta luego! Si necesitás algo más, acá estaré.'],
      agradecimiento: ['¡De nada! Si tenés otra duda, acá estoy.'],
      sobre_mi: ['Mauricio Gori es un programador joven de 22 años que reside en Uruguay. Desarrollador de software enfocado en Python, JavaScript y automatización creativa. Le gusta construir herramientas que resuelven problemas reales y está en constante aprendizaje.'],
      experiencia: ['Su experiencia abarca scripting en Python, desarrollo web con JavaScript/TypeScript, automatización de pipelines, análisis de game.log para Proton/Wine y herramientas de modding.'],
      proyectos: ['Tiene tres proyectos principales: (1) Validador de assets para motor de juegos en Python — valida archivos .inc, .ext, .mdl antes de instalar mods. (2) Analizador de game.log para Proton/Wine — traduce errores del motor a pasos de solución. (3) Panel de administración Full Stack — con autenticación JWT, gestión de usuarios, subida de imágenes y exportación a CSV.'],
      habilidades: ['Sus habilidades incluyen: Python, JavaScript, TypeScript, React, HTML5/CSS3, Tailwind CSS, Node.js, Docker, Git, CI/CD básico, SQL, análisis de logs y Blender (Python API).'],
      contacto: ['Podés escribirle a mauriciogorilluberas@gmail.com o visitar su GitHub en github.com/Mauricio5494.'],
      idiomas: ['El portfolio está disponible en español, inglés, ruso e hindi. Podés cambiar el idioma desde el selector en el menú de navegación.'],
      generico: ['Interesante pregunta. En este modo demo puedo responder sobre sus proyectos, habilidades, experiencia, tecnologías y cómo contactarlo.'],
    },
    en: {
      saludo: ['Hello! I am Mauricio\'s chatbot. Ask me about his projects, skills, experience or how to contact him.'],
      despedida: ['See you later! If you need anything else, I\'ll be here.'],
      agradecimiento: ['You\'re welcome! If you have any other questions, let me know.'],
      sobre_mi: ['Mauricio Gori is a young 22-year-old programmer based in Uruguay. Software developer focused on Python, JavaScript and creative automation. He loves building tools that solve real problems and is constantly learning.'],
      experiencia: ['His experience covers Python scripting, web development with JavaScript/TypeScript, automated pipelines, game.log analysis for Proton/Wine and game modding tools.'],
      proyectos: ['He has three main projects: (1) Game engine asset validator in Python — validates .inc, .ext, .mdl files before installing mods. (2) game.log analyzer for Proton/Wine — translates engine errors into troubleshooting steps. (3) Full Stack admin panel — with JWT authentication, user management, image upload and CSV export.'],
      habilidades: ['His skills include: Python, JavaScript, TypeScript, React, HTML5/CSS3, Tailwind CSS, Node.js, Docker, Git, basic CI/CD, SQL, log analysis and Blender (Python API).'],
      contacto: ['You can write to him at mauriciogorilluberas@gmail.com or visit his GitHub at github.com/Mauricio5494.'],
      idiomas: ['This portfolio is available in Spanish, English, Russian and Hindi. You can change the language from the selector in the navigation menu.'],
      generico: ['Interesting question. In demo mode I can answer about his projects, skills, experience, technologies and how to contact him.'],
    },
    ru: {
      saludo: ['Привет! Я чат-бот Маурисио. Спросите о его проектах, навыках, опыте или как с ним связаться.'],
      despedida: ['До свидания! Если нужно что-то еще, я здесь.'],
      agradecimiento: ['Пожалуйста! Если есть еще вопросы, обращайтесь.'],
      sobre_mi: ['Маурисио Гори — молодой 22-летний программист, проживающий в Уругвае. Разработчик ПО с акцентом на Python, JavaScript и креативную автоматизацию. Ему нравится создавать инструменты, которые решают реальные задачи, и он постоянно учится.'],
      experiencia: ['Его опыт включает скрипты на Python, веб-разработку на JavaScript/TypeScript, автоматизацию конвейеров, анализ game.log для Proton/Wine и инструменты моддинга.'],
      proyectos: ['У него три основных проекта: (1) Валидатор ассетов для игрового движка на Python. (2) Анализатор game.log для Proton/Wine. (3) Полноценная панель администрирования на React и Node.js.'],
      habilidades: ['Его навыки включают: Python, JavaScript, TypeScript, React, HTML5/CSS3, Tailwind CSS, Node.js, Docker, Git, базовый CI/CD, SQL, анализ логов и Blender (Python API).'],
      contacto: ['Свяжитесь с ним по mauriciogorilluberas@gmail.com или посетите его GitHub github.com/Mauricio5494.'],
      idiomas: ['Это портфолио доступно на четырех языках: испанский, английский, русский и хинди. Вы можете сменить язык через селектор в меню навигации.'],
      generico: ['Интересный вопрос. В демо-режиме я могу ответить о его проектах, навыках, опыте, технологиях и как с ним связаться.'],
    },
    hi: {
      saludo: ['नमस्ते! मैं मॉरिसियो का चैटबॉट हूँ। उनके प्रोजेक्ट्स, स्किल्स, अनुभव या संपर्क के बारे में पूछें।'],
      despedida: ['फिर मिलेंगे! अगर कुछ और चाहिए तो यहाँ रहूँगा।'],
      agradecimiento: ['आपका स्वागत है! अगर कोई और सवाल हो तो बताएं।'],
      sobre_mi: ['मॉरिसियो गोरी 22 वर्ष के एक युवा प्रोग्रामर हैं जो उरुग्वे में रहते हैं। सॉफ्टवेयर डेवलपर जो पायथन, जावास्क्रिप्ट और क्रिएटिव ऑटोमेशन पर फोकस करते हैं। उन्हें वास्तविक समस्याओं को हल करने वाले टूल बनाना पसंद है और वे लगातार सीख रहे हैं।'],
      experiencia: ['उनका अनुभव पायथन स्क्रिप्टिंग, जावास्क्रिप्ट/टाइपस्क्रिप्ट के साथ वेब विकास, स्वचालित पाइपलाइन्स, प्रोटॉन/वाइन के लिए गेम.लॉग विश्लेषण और मोडिंग टूल्स को कवर करता है।'],
      proyectos: ['उनके तीन मुख्य प्रोजेक्ट्स हैं: (1) गेम इंजन के लिए एसेट वैलिडेटर पायथन में। (2) प्रोटॉन/वाइन के लिए गेम.लॉग विश्लेषक। (3) फुल स्टैक एडमिन पैनल रिएक्ट और नोड.जेएस में।'],
      habilidades: ['उनके स्किल्स में शामिल हैं: पायथन, जावास्क्रिप्ट, टाइपस्क्रिप्ट, रिएक्ट, HTML5/CSS3, टेलविंड CSS, नोड.जेएस, डॉकर, गिट, बेसिक CI/CD, SQL, लॉग विश्लेषण और ब्लेंडर (पायथन API)।'],
      contacto: ['उनसे mauriciogorilluberas@gmail.com पर संपर्क करें या उनका गिटहब github.com/Mauricio5494 पर जाएँ।'],
      idiomas: ['यह पोर्टफोलियो चार भाषाओं में उपलब्ध है: स्पेनिश, अंग्रेजी, रूसी और हिंदी। आप नेविगेशन मेनू में भाषा सेलेक्टर से भाषा बदल सकते हैं।'],
      generico: ['मैं उस विषय के बारे में निश्चित नहीं हूँ। कृपया मॉरिसियो के प्रोजेक्ट्स, कौशल या संपर्क के बारे में पूछें।'],
    },
  };

  // Respuestas simuladas (demo) como fallback absoluto si el backend no responde.
  // Ahora multidioma: detecta el idioma del mensaje y responde en ese idioma.
  function respuestaDemo(texto) {
    const t = texto.trim().toLowerCase();
    const idioma = detectarIdiomaTexto(texto);
    const tabla = RESPUESTAS_DEMO_IDIOMAS[idioma] || RESPUESTAS_DEMO_IDIOMAS.es;

    // Cambio de idioma (modo demo)
    const cambioIdioma = texto.match(/cambiar.*(español|ingl[ée]s|ruso|hindi)|idioma.*(español|ingl[ée]s|ruso|hindi)|pon.*(español|ingl[ée]s|ruso|hindi)|idioma a (español|ingl[ée]s|ruso|hindi)|quiero (en |en )?(español|ingl[ée]s|ruso|hindi)|change.*(spanish|english|russian|hindi)|language.*(spanish|english|russian|hindi)|switch to (spanish|english|russian|hindi)/i);
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
        return `Idioma cambiado a ${nombreIdioma}. ${tabla.generico[0]}`;
      }
    }

    // Matching por intents en el idioma detectado
    const patronesPorIdioma = {
      es: [
        { patrones: [/^(hola|buenas|buen\s+d[ií]a|buenas\s+tardes|buenas\s+noches|hey|hello|hi)\b/i], intent: 'saludo' },
        { patrones: [/^(adiós|chao|hasta+luego|nos+vemos|bye|goodbye|hasta+pronto)\b/i], intent: 'despedida' },
        { patrones: [/^(gracias|muchas+gracias|te+lo+agradezco|se+lo+agradezco|thanks|thank+you|gracias+por+todo)\b/i], intent: 'agradecimiento' },
        { patrones: [/qu[ié]n\s+es|sobre\s+mí|sobre\s+mauricio|perfil|qu[ié]n\s+es\s+mauricio/i], intent: 'sobre_mi' },
        { patrones: [/experiencia|trayectoria|historia|background/i], intent: 'experiencia' },
        { patrones: [/proyecto|proyectos/i], intent: 'proyectos' },
        { patrones: [/habilidad|skill|tecnolog[ií]a|tecnolog[ií]as|stack|qu[eé]\s+sabe/i], intent: 'habilidades' },
        { patrones: [/contacto|email|correo|escribir|mail|escr[ií]beme/i], intent: 'contacto' },
        { patrones: [/idioma|idiomas|en\s+qué\s+idiomas|idiomas\s+disponibles|qué\s+lenguas|lenguas|traducci[oó]n|traducir|español|ingl[ée]s|ruso|hindi|multidioma/i], intent: 'idiomas' },
      ],
      en: [
        { patrones: [/^(hello|hi|hey|good morning|good afternoon|good evening)\b/i], intent: 'saludo' },
        { patrones: [/^(goodbye|bye|see you|take care)\b/i], intent: 'despedida' },
        { patrones: [/^(thank you|thanks|thank you very much)\b/i], intent: 'agradecimiento' },
        { patrones: [/who is|about mauricio|profile|tell me about/i], intent: 'sobre_mi' },
        { patrones: [/experience|background|career/i], intent: 'experiencia' },
        { patrones: [/project|projects/i], intent: 'proyectos' },
        { patrones: [/skill|skills|technology|technologies|stack|what does he know/i], intent: 'habilidades' },
        { patrones: [/contact|email|write to|mail|reach/i], intent: 'contacto' },
        { patrones: [/language|languages|what languages|translate/i], intent: 'idiomas' },
      ],
      ru: [
        { patrones: [/^(привет|здравствуйте|добрый день|добрый вечер)\b/i], intent: 'saludo' },
        { patrones: [/^(до свидания|пока|до скорой встречи)\b/i], intent: 'despedida' },
        { patrones: [/^(спасибо|благодарю)\b/i], intent: 'agradecimiento' },
        { patrones: [/кто такой|о Маурисио|профиль|расскажи о/i], intent: 'sobre_mi' },
        { patrones: [/опыт|предыстория|карьера/i], intent: 'experiencia' },
        { patrones: [/проект|проекты/i], intent: 'proyectos' },
        { patrones: [/навык|навыки|технология|технологии|стек/i], intent: 'habilidades' },
        { patrones: [/контакт|почте|написать|связаться/i], intent: 'contacto' },
        { patrones: [/язык|языки|какие языки|перевод/i], intent: 'idiomas' },
      ],
      hi: [
        { patrones: [/^(नमस्ते|नमस्कार|हैलो|हाय)\b/i], intent: 'saludo' },
        { patrones: [/^(अलविदा|फिर मिलेंगे|बाय)\b/i], intent: 'despedida' },
        { patrones: [/^(धन्यवाद|शुक्रिया)\b/i], intent: 'agradecimiento' },
        { patrones: [/मॉरिसियो कौन है|मॉरिसियो के बारे में|प्रोफाइल/i], intent: 'sobre_mi' },
        { patrones: [/अनुभव|पृष्ठभूमि|करियर/i], intent: 'experiencia' },
        { patrones: [/प्रोजेक्ट|प्रोजेक्ट्स/i], intent: 'proyectos' },
        { patrones: [/स्किल|स्किल्स|तकनीक|तकनीकें/i], intent: 'habilidades' },
        { patrones: [/संपर्क|ईमेल|लिखें|मेल/i], intent: 'contacto' },
        { patrones: [/भाषा|भाषाएं|कौन सी भाषा|अनुवाद/i], intent: 'idiomas' },
      ],
    };

    const listaPatrones = patronesPorIdioma[idioma] || patronesPorIdioma.es;
    for (const grupo of listaPatrones) {
      for (const pat of grupo.patrones) {
        if (pat.test(t)) {
          const claveIntent = grupo.intent;
          const respuestas = tabla[claveIntent] || tabla.generico;
          return respuestas[Math.floor(Math.random() * respuestas.length)];
        }
      }
    }

    // Fallback genérico en el idioma detectado
    return tabla.generico[0];
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

  // Quick replies: al hacer clic, inserta la pregunta, envía y colapsa sugerencias
  document.querySelectorAll('.qr').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-q');
      if (!q) return;
      input.value = q;
      colapsarQuickReplies();
      enviar();
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
})();
