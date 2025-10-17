<?php /* PHP-ready */ ?>
<!doctype html>
<html lang="es-AR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Planificador de Espacios — Del Sur Construcciones</title>
  <meta name="description" content="Diseña y visualiza tus espacios en 2D y 3D con nuestro planificador." />
  <meta name="theme-color" content="#0f4c5c" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Planificador de Espacios — Del Sur Construcciones" />
  <meta property="og:description" content="Construí y visualizá tus planos en 3D con nuestro planificador integral." />
  <meta property="og:image" content="./imagenes/og-cover.webp" />
  <meta property="og:url" content="https://delsurconstrucciones.example/planificador.php" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Planificador de Espacios — Del Sur Construcciones" />
  <meta name="twitter:description" content="Construí y visualizá tus planos en 3D con nuestro planificador integral." />
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
      <p>Atendemos AMBA · Lun–Vie 9–18 h</p>
      <a href="https://wa.me/5491123941812" class="underline hover:no-underline">WhatsApp: +54 9 11 2394‑1812</a>
    </div>
  </div>

  <!-- Header sticky -->
  <header class="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-3 py-3 flex items-center gap-4">
      <a href="/" class="flex items-center gap-3 mr-auto">
        <img src="/images/logo.webp" alt="Del Sur Construcciones" class="h-14 w-auto logo-slide" />
        <span class="sr-only">Del Sur Construcciones</span>
      </a>
      <nav class="hidden md:flex gap-6 text-slate-700 nav-drop">
        <a class="hover:text-brand-700 focus-ring" href="/#servicios">Servicios</a>
        <a class="hover:text-brand-700 focus-ring" href="/#proyectos">Proyectos</a>
        <a class="hover:text-brand-700 focus-ring" href="/#proceso">Proceso</a>
        <a class="hover:text-brand-700 focus-ring" href="/#faq">Preguntas</a>
        <!-- enlace activo para planificador -->
        <a class="text-brand-700 font-semibold focus-ring" href="/planner/planificador.php">Planificador</a>
        <a class="hover:text-brand-700 focus-ring" href="/pages/pagos.php">Pagos</a>
        <a class="hover:text-brand-700 focus-ring" href="/#contacto">Contacto</a>
      </nav>
      <a href="/#contacto" class="ml-4 inline-flex items-center rounded-xl bg-brand-700 px-4 py-2 text-white hover:bg-brand-600 focus-ring btn-anim nav-drop">Solicitar presupuesto</a>
    </div>
  </header>

  <!-- Hero -->
  <section class="py-16 bg-slate-50">
    <div class="max-w-7xl mx-auto px-3">
      <h1 class="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Planificador de espacios 2D/3D</h1>
      <p class="text-lg md:text-xl text-slate-600 mb-8">Construí tus planos y visualizalos en 3D con nuestro planificador integral.</p>
    </div>
  </section>

  <!-- Iframe embedding the planificador lite tool -->
  <section class="py-16">
    <div class="max-w-7xl mx-auto px-3">
      <iframe src="planificador-lite.php" class="w-full rounded-xl border border-slate-200 shadow-sm" style="height: 900px;" allowfullscreen></iframe>
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
          <li><a href="/#servicios" class="hover:text-white">Servicios</a></li>
          <li><a href="/#proyectos" class="hover:text-white">Proyectos</a></li>
          <li><a href="/#proceso" class="hover:text-white">Proceso</a></li>
          <li><a href="/#faq" class="hover:text-white">Preguntas</a></li>
          <li><a href="/planner/planificador.php" class="hover:text-white">Planificador</a></li>
          <li><a href="/pages/pagos.php" class="hover:text-white">Pagos</a></li>
          <li><a href="/#contacto" class="hover:text-white">Contacto</a></li>
        </ul>
      </div>
      <div>
        <h3 class="font-semibold text-white mb-2">Contacto</h3>
        <p>WhatsApp: +54 9 11 2394‑1812</p>
        <p>Email: lauti.seid@gmail.com</p>
      </div>
    </div>
  </footer>

  <!-- JavaScript to update year in footer -->
  <script>
    document.getElementById('year').textContent = new Date().getFullYear();
  </script>
</body>
</html>