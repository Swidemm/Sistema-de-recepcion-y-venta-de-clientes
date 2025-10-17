<?php
// pages/contacto-enviar.php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit('Método no permitido'); }

$name = trim($_POST['name'] ?? '');
$email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
$message = trim($_POST['message'] ?? '');

if (!$name || !$email || !$message) {
  header('Location: /pages/contacto.php?e=1'); exit;
}

// CONFIG: cambiá este correo por el tuyo del dominio
$to = 'contacto@tu-dominio.com'; 
$subject = 'Nuevo mensaje desde la web - Proyecto Arquitecto';
$body = "Nombre: {$name}
Email: {$email}

{$message}";
$headers = "From: no-reply@tu-dominio.com
Reply-To: {$email}
";

// Enviar y redirigir
if (@mail($to, $subject, $body, $headers)) {
  header('Location: /pages/gracias.php'); exit;
} else {
  header('Location: /pages/contacto.php?e=2'); exit;
}
