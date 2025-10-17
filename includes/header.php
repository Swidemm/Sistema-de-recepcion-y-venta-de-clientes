<?php
// includes/header.php
?><!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?php echo isset($page_title) ? $page_title . " | Proyecto Arquitecto" : "Proyecto Arquitecto"; ?></title><link rel="icon" href="/images/favicon.ico">
  <link rel="manifest" href="/site.webmanifest">

  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: { 500:'#e24d5c', 600:'#cf4050', 700:'#b83645', 900:'#7a1f29' }
          }
        }
      }
    }
  </script>

  <link rel="stylesheet" href="/css/styles.css">
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="manifest" href="/site.webmanifest" />
</head>
<body>
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
        <img src="/images/logo.webp" alt="Del Sur Construcciones" class="h-14 w-auto logo-slide" />
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
  <main class="site-main">