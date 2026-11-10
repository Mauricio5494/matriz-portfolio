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
      'footer.copyright': '© <span id="year"></span> Mauricio · Construido con código abierto'
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
      'footer.copyright': '© <span id="year"></span> Mauricio · Built with open source code'
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
      'footer.copyright': '© <span id="year"></span> Mauricio · Сделано с открытым исходным кодом'
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
      'footer.copyright': '© <span id="year"></span> Mauricio · ओपन सोर्स कोड के साथ बनाया गया'
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

  toggle.addEventListener('click', () => {
    abierto = !abierto;
    panel.style.display = abierto ? 'flex' : 'none';
    if (abierto) input.focus();
  });

  // Cerrar al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (abierto && !panel.contains(e.target) && e.target !== toggle) {
      abierto = false;
      panel.style.display = 'none';
    }
  });

  function agregarMensaje(texto, quien) {
    const div = document.createElement('div');
    div.className = 'message ' + quien;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = texto;
    div.appendChild(bubble);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function escribir(texto, quien, delay = 0) {
    setTimeout(() => agregarMensaje(texto, quien), delay);
  }

  // URLs — ajustá RAILWAY_BACKEND_URL al dominio de tu backend en Railway
  const RAILWAY_BACKEND_URL = 'https://TU_BACKEND.railway.app';

  // Respuestas de IA: intenta Railway, si falla usa demo simulado
  async function respuestaIA(texto) {
    try {
      const resp = await fetch(`${RAILWAY_BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: texto }),
      });
      if (!resp.ok) throw new Error('Error del servidor');
      const data = await resp.json();
      if (data.respuesta) return data.respuesta;
      throw new Error('Respuesta vacía');
    } catch (e) {
      console.warn('Backend no disponible, usando demo:', e.message);
      return respuestaDemo(texto);
    }
  }

  // Respuestas simuladas (demo) como fallback
  function respuestaDemo(texto) {
    const t = texto.toLowerCase();

    if (/hola|buenas|buen dia|buenas tardes|buenas noches/.test(t)) {
      return '¡Hola! Soy el asistente de Mauricio. En qué puedo ayudarte.';
    }
    if (/proyecto|proyectos/.test(t)) {
      return 'Tiene tres proyectos principales: un validador de assets para motores de juegos en Python, un analizador de game.log para Proton/Wine y un panel de administración Full Stack con React y Node.js.';
    }
    if (/habilidad|skill|python|javascript|typescript|react|node|docker|git|blender/.test(t)) {
      return 'Sus habilidades incluyen Python, JavaScript, TypeScript, React, HTML/CSS, Tailwind, Node.js, Docker, Git, CI/CD básico y Blender (Python API).';
    }
    if (/contacto|email|contratar|escribir|mail/.test(t)) {
      return 'Podés escribirle a mauriciogorilluberas@gmail.com o visitar su GitHub en github.com/Mauricio5494.';
    }
    if (/sobre|qui[eé]n|quiere saber|quién es/.test(t)) {
      return 'Mauricio es desarrollador de software, enfocado en Python, JavaScript y automatización creativa, con experiencia en modding de juegos y pipelines automatizados.';
    }
    return 'Interesante pregunta. Soy un asistente demo; para respuestas reales conectá una API de IA. Podés preguntarme sobre sus proyectos, habilidades o cómo contactarlo.';
  }

  async function enviar() {
    const texto = input.value.trim();
    if (!texto) return;
    agregarMensaje(texto, 'user');
    input.value = '';
    setTimeout(async () => {
      const respuesta = await respuestaIA(texto);
      escribir(respuesta, 'bot');
    }, 400);
  }

  send.addEventListener('click', enviar);
  input.addEventListener('keypress', (e) => { if (e.key === 'Enter') enviar(); });
})();
