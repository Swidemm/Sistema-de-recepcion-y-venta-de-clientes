<?php
$page_title = "Contacto";
require __DIR__ . '/../includes/header.php';
?>
<section class="contacto">
  <div class="container">
    <h1>Contacto</h1>
    <p>Completá el formulario y te responderemos a la brevedad.</p>
    <form method="POST" action="/pages/contacto-enviar.php" class="form">
      <div class="grid">
        <label>Nombre
          <input type="text" name="name" required>
        </label>
        <label>Email
          <input type="email" name="email" required>
        </label>
      </div>
      <label>Mensaje
        <textarea name="message" rows="6" required></textarea>
      </label>
      <button type="submit">Enviar</button>
    </form>
  </div>
</section>
<?php require __DIR__ . '/../includes/footer.php'; ?>
