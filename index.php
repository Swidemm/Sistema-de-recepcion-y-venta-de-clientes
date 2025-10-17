<?php /* PHP-ready */ ?>
<!doctype html>
<html lang="es-AR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Del Sur Construcciones — Obras llave en mano, refacciones y diseño</title>
  <meta name="description" content="Del Sur Construcciones: viviendas, locales y obras comerciales en el AMBA. Proyectos, dirección y ejecución. Pedí tu presupuesto sin cargo." />
  <meta name="theme-color" content="#0f4c5c" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Del Sur Construcciones" />
  <meta property="og:description" content="Obras llave en mano, refacciones y diseño. Pedí tu presupuesto sin cargo." />
  <meta property="og:image" content="./imagenes/og-cover.webp" />
  <meta property="og:url" content="https://delsurconstrucciones.example/" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Del Sur Construcciones" />
  <meta name="twitter:description" content="Obras llave en mano, refacciones y diseño." />
  <meta name="twitter:image" content="./imagenes/og-cover.webp" />

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

  <!-- Tailwind CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>tailwind.config = { theme: { extend: {
    colors: {
      brand: {
        50:'#e6f0f2',100:'#cfe2e6',200:'#9fc4cd',300:'#6ea6b3',400:'#3e889a',500:'#0f6a81',600:'#0d5a6d',700:'#0b4a59',800:'#083945',900:'#062f3a'
      }
    },
    fontFamily:{ sans:['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'] }
  }}};</script>

  <link rel="icon" href="./favicon/favicon.ico" />
  <link rel="manifest" href="./favicon/site.webmanifest" />
  <!-- External stylesheet for custom styles -->
  <link rel="stylesheet" href="./css/styles.css" />

</head>
<body class="font-sans text-slate-800">
  <!-- Barra superior -->
  <div class="bg-brand-900 text-white text-sm">
    <div class="max-w-7xl mx-auto px-3 py-2 flex items-center justify-between">
      <p>Atendemos AMBA · Lun–Vie 9–18 h</p>
      <a href="https://wa.me/5491123941812" class="underline hover:no-underline">WhatsApp: +54 9 11 2394-1812</a>
    </div>
  </div>

  <!-- Header sticky -->
  <header class="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-3 py-3 flex items-center gap-4">
      <a href="/" class="flex items-center gap-3 mr-auto">
        <img src="./imagenes/logo.webp" alt="Del Sur Construcciones" class="h-14 w-auto logo-slide" />
        <span class="sr-only">Del Sur Construcciones</span>
      </a>
      <nav class="hidden md:flex gap-6 text-slate-700 nav-drop">
        <a class="hover:text-brand-700 focus-ring" href="/#servicios">Servicios</a>
        <a class="hover:text-brand-700 focus-ring" href="/#proyectos">Proyectos</a>
        <a class="hover:text-brand-700 focus-ring" href="/#proceso">Proceso</a>
        <a class="hover:text-brand-700 focus-ring" href="/#faq">Preguntas</a>
        <!-- Enlaces a secciones adicionales -->
        <a class="hover:text-brand-700 focus-ring" href="/planner/planificador.php">Planificador</a>
        <a class="hover:text-brand-700 focus-ring" href="/pages/pagos.php">Pagos</a>
        <a class="hover:text-brand-700 focus-ring" href="/#contacto">Contacto</a>
      </nav>
      <a href="/#contacto" class="ml-4 inline-flex items-center rounded-xl bg-brand-700 px-4 py-2 text-white hover:bg-brand-600 focus-ring btn-anim nav-drop">Solicitar presupuesto</a>
    </div>
  </header>

  <!-- Hero -->
  <section id="inicio" class="relative isolate">
    <video autoplay muted loop playsinline class="absolute inset-0 -z-10 h-full w-full object-cover">
      <source src="./videos/hero.mp4" type="video/mp4" />
    </video>
    <!-- Blueprint overlay with subtle architectural lines -->
    <div class="absolute inset-0 arch-overlay"></div>
    <!-- Dark overlay for contrast -->
    <div class="absolute inset-0 -z-10 bg-slate-900/60"></div>
    <div class="max-w-7xl mx-auto px-3 py-24 md:py-36 text-white">
      <h1 class="text-4xl md:text-6xl font-bold leading-tight">Obras llave en mano, refacciones y diseño</h1>
      <p class="mt-4 max-w-2xl text-lg md:text-xl text-slate-100">Viviendas, locales y espacios comerciales. Dirección técnica, ejecución y entrega en tiempo y forma.</p>
      <div class="mt-8 flex gap-3">
        <a href="#proyectos" class="rounded-xl bg-white/10 px-5 py-3 hover:bg-white/20 focus-ring btn-anim">Ver proyectos</a>
        <a href="https://wa.me/5491123941812" class="rounded-xl bg-brand-500 px-5 py-3 hover:bg-brand-400 focus-ring btn-anim">Hablar por WhatsApp</a>
      </div>
    </div>
  </section>

  <!-- Servicios -->
  <section id="servicios" class="py-16 bg-slate-50">
    <div class="max-w-7xl mx-auto px-3">
      <h2 class="text-3xl font-semibold">Servicios</h2>
      <p class="text-slate-600 mt-2">Acompañamos todo el ciclo: anteproyecto, obra y posventa.</p>
      <div class="mt-8 grid md:grid-cols-3 gap-6">
        <div class="rounded-2xl bg-white p-6 shadow-sm">
          <h3 class="text-xl font-medium mb-2">Viviendas</h3>
          <ul class="list-disc list-inside text-slate-600 space-y-1">
            <li>Llave en mano</li>
            <li>Ampliaciones y refacciones</li>
            <li>Diseño interior</li>
          </ul>
        </div>
        <div class="rounded-2xl bg-white p-6 shadow-sm">
          <h3 class="text-xl font-medium mb-2">Locales y oficinas</h3>
          <ul class="list-disc list-inside text-slate-600 space-y-1">
            <li>Adecuación comercial</li>
            <li>Instalaciones técnicas</li>
            <li>Entrega rápida</li>
          </ul>
        </div>
        <div class="rounded-2xl bg-white p-6 shadow-sm">
          <h3 class="text-xl font-medium mb-2">Mantenimiento</h3>
          <ul class="list-disc list-inside text-slate-600 space-y-1">
            <li>Plan preventivo</li>
            <li>Correcciones y urgencias</li>
            <li>Garantía y posventa</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- Proyectos -->
  <section id="proyectos" class="py-16">
    <div class="max-w-7xl mx-auto px-3">
      <h2 class="text-3xl font-semibold">Proyectos recientes</h2>
      <p class="text-slate-600 mt-2">Algunas obras que reflejan la calidad y compromiso de nuestro equipo.</p>
      <div class="mt-8 grid md:grid-cols-3 gap-6">
        <div class="rounded-2xl overflow-hidden shadow-sm bg-white">
          <img src="./imagenes/proyectos/proyecto-1.webp" alt="Proyecto 1" class="w-full h-48 object-cover" />
          <div class="p-4">
            <h3 class="text-lg font-medium">Vivienda familiar</h3>
            <p class="text-slate-600 text-sm mt-1">Proyecto llave en mano de 200 m² con diseño contemporáneo.</p>
          </div>
        </div>
        <div class="rounded-2xl overflow-hidden shadow-sm bg-white">
          <img src="./imagenes/proyectos/proyecto-2.webp" alt="Proyecto 2" class="w-full h-48 object-cover" />
          <div class="p-4">
            <h3 class="text-lg font-medium">Oficinas corporativas</h3>
            <p class="text-slate-600 text-sm mt-1">Adecuación comercial con instalaciones de alta tecnología.</p>
          </div>
        </div>
        <div class="rounded-2xl overflow-hidden shadow-sm bg-white">
          <img src="./imagenes/proyectos/proyecto-3.webp" alt="Proyecto 3" class="w-full h-48 object-cover" />
          <div class="p-4">
            <h3 class="text-lg font-medium">Refacción integral</h3>
            <p class="text-slate-600 text-sm mt-1">Ampliación y modernización de vivienda en el barrio norte.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Proceso -->
  <section id="proceso" class="py-16 bg-slate-50">
    <div class="max-w-7xl mx-auto px-3">
      <h2 class="text-3xl font-semibold mb-8">Nuestro proceso</h2>
      <div class="grid md:grid-cols-3 gap-6">
        <div class="rounded-2xl bg-white p-6 shadow-sm">
          <h3 class="text-xl font-medium mb-2">1. Visita y presupuesto</h3>
          <p class="text-slate-600">Evaluamos el espacio y las necesidades. Te entregamos un presupuesto detallado sin cargo.</p>
        </div>
        <div class="rounded-2xl bg-white p-6 shadow-sm">
          <h3 class="text-xl font-medium mb-2">2. Diseño y gestión</h3>
          <p class="text-slate-600">Nuestros profesionales elaboran el proyecto y gestionan los permisos necesarios.</p>
        </div>
        <div class="rounded-2xl bg-white p-6 shadow-sm">
          <h3 class="text-xl font-medium mb-2">3. Obra y entrega</h3>
          <p class="text-slate-600">Nos ocupamos de la ejecución y supervisión hasta la entrega final en tiempo y forma.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Preguntas frecuentes -->
  <section id="faq" class="py-16">
    <div class="max-w-7xl mx-auto px-3">
      <h2 class="text-3xl font-semibold mb-6">Preguntas frecuentes</h2>
      <div id="faq-list" class="space-y-4">
        <details class="rounded-xl bg-slate-50 p-4">
          <summary class="cursor-pointer text-lg font-medium flex items-center justify-between">¿Cuánto demora un proyecto? <span>＋</span></summary>
          <div class="faq-answer text-slate-600 mt-2">El tiempo depende del tipo de obra. Una vivienda llave en mano puede demorar entre 6 y 12 meses, mientras que refacciones parciales toman menos tiempo.</div>
        </details>
        <details class="rounded-xl bg-slate-50 p-4">
          <summary class="cursor-pointer text-lg font-medium flex items-center justify-between">¿Trabajan en todo el país? <span>＋</span></summary>
          <div class="faq-answer text-slate-600 mt-2">Nos especializamos en proyectos dentro del AMBA. Para obras fuera de la región, evaluamos cada caso en particular.</div>
        </details>
        <details class="rounded-xl bg-slate-50 p-4">
          <summary class="cursor-pointer text-lg font-medium flex items-center justify-between">¿Ofrecen garantía de sus trabajos? <span>＋</span></summary>
          <div class="faq-answer text-slate-600 mt-2">Sí. Todas nuestras obras cuentan con garantía por escrito y servicio de posventa para asegurar tu tranquilidad.</div>
        </details>
      </div>
    </div>
  </section>

  <!-- Contacto -->
  <section id="contacto" class="py-16 bg-slate-50">
    <div class="max-w-7xl mx-auto px-3">
      <h2 class="text-3xl font-semibold mb-6">Contacto</h2>
      <div class="grid md:grid-cols-2 gap-8">
        <div>
          <h3 class="text-xl font-medium mb-2">Visítanos o contáctanos</h3>
          <p class="text-slate-600">Estamos en Buenos Aires (AMBA). Atendemos lunes a viernes de 9 a 18 h.</p>
          <p class="mt-2"><strong>Teléfono:</strong> +54 9 11 2394-1812</p>
          <p><strong>Email:</strong> lauti.seid@gmail.com</p>
          <p><strong>Dirección:</strong> Calle Falsa 123, Buenos Aires</p>
          <div class="mt-4">
            <a href="https://wa.me/5491123941812" class="inline-flex items-center rounded-xl bg-brand-600 px-5 py-3 text-white hover:bg-brand-500 focus-ring btn-anim">Hablar por WhatsApp</a>
          </div>
        </div>
        <form id="contactForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700" for="nombre">Nombre y apellido</label>
            <input type="text" id="nombre" name="nombre" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700" for="email">Email</label>
            <input type="email" id="email" name="email" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700" for="telefono">Teléfono</label>
            <input type="tel" id="telefono" name="telefono" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700" for="mensaje">Mensaje</label>
            <textarea id="mensaje" name="mensaje" rows="4" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"></textarea>
          </div>
          <button type="submit" class="rounded-xl bg-brand-700 px-5 py-3 text-white hover:bg-brand-600 focus-ring btn-anim">Enviar</button>
          <p id="formMessage" class="text-sm mt-2"></p>
        </form>
      </div>
      <!-- Google Map embed (placeholder coordinates, replace with actual) -->
      <div class="mt-12">
        <iframe class="w-full h-64 border-0" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13126.492675264348!2d-58.381592!3d-34.603684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccb2d72152cdb%3A0x0!2sBuenos+Aires!5e0!3m2!1ses-419!2sar!4v1670000000000!5m2!1ses-419!2sar" allowfullscreen="" loading="lazy"></iframe>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-slate-950 text-slate-400 text-sm">
    <div class="max-w-7xl mx-auto px-3 py-10 grid md:grid-cols-3 gap-8">
      <div>
        <img src="./imagenes/logo.webp" alt="Del Sur Construcciones" class="h-12 w-auto mb-3" />
        <p>© <?php echo date("Y"); ?> Del Sur Construcciones. Todos los derechos reservados.</p>
      </div>
      <div>
        <h3 class="font-semibold text-white mb-2">Secciones</h3>
        <ul class="space-y-1">
          <li><a href="#servicios" class="hover:text-white">Servicios</a></li>
          <li><a href="#proyectos" class="hover:text-white">Proyectos</a></li>
          <li><a href="#proceso" class="hover:text-white">Proceso</a></li>
          <li><a href="#faq" class="hover:text-white">Preguntas</a></li>
          <!-- Enlace a la nueva página del planificador en el pie -->
          <li><a href="planificador.php" class="hover:text-white">Planificador</a></li>
          <li><a href="pagos.php" class="hover:text-white">Pagos</a></li>
          <li><a href="#contacto" class="hover:text-white">Contacto</a></li>
        </ul>
      </div>
      <div>
        <h3 class="font-semibold text-white mb-2">Contacto</h3>
        <p>WhatsApp: +54 9 11 2394-1812</p>
        <p>Email: lauti.seid@gmail.com</p>
      </div>
    </div>
  </footer>

  <!-- JavaScript -->
  <script>
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();
    // FAQ toggle: change +/− when opened
    document.querySelectorAll('#faq-list details').forEach(d => {
      d.addEventListener('toggle', () => {
        const span = d.querySelector('summary span');
        if (span) span.textContent = d.open ? '－' : '＋';
      });
    });
    // Contact form submission handler
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      const formMessage = document.getElementById('formMessage');
      contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        formMessage.textContent = '';
        formMessage.classList.remove('text-brand-700', 'text-red-600');
        const data = new FormData(contactForm);
        const payload = {
          nombre: data.get('nombre'),
          email: data.get('email'),
          telefono: data.get('telefono'),
          mensaje: data.get('mensaje'),
        };
        try {
          const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            formMessage.textContent = '¡Gracias por contactarnos! Te responderemos pronto.';
            formMessage.classList.add('text-brand-700');
            contactForm.reset();
          } else {
            throw new Error('Error al enviar');
          }
        } catch (err) {
          formMessage.textContent = 'Hubo un error al enviar tu mensaje. Intenta de nuevo más tarde.';
          formMessage.classList.add('text-red-600');
        }
      });
    }
    // Mobile menu toggle (safe check)
    const menuBtn = document.getElementById('menuBtn');
    const mobileNav = document.getElementById('mobileNav');
    if (menuBtn && mobileNav) {
      menuBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('hidden');
      });
    }
  </script>
</body>
</html>