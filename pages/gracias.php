<?php // gracias.php ?>
<!doctype html>
<html lang="es">
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>¡Gracias!</title>
<body style="font-family: Inter, system-ui; display:grid; place-items:center; height:100vh;">
  <div style="text-align:center;">
    <h1>¡Gracias! 👷‍♂️</h1>
    <p>Si tu pago fue aprobado, en unos segundos te llevamos a WhatsApp para coordinar tu obra.</p>
    <p><a id="wa" href="#">Ir a WhatsApp ahora</a></p>
  </div>
  <script>
    // Construimos la URL a partir de env.php en server-side sería ideal.
    // Como placeholder, la armamos acá con el número del env (cambiar a tu dominio si preferís PHP puro).
    const wa = "https://wa.me/5491123941812?text=Hola!%20Acabo%20de%20realizar%20un%20pago%20y%20necesito%20coordinar%20mi%20obra.";
    document.getElementById('wa').href = wa;
    setTimeout(()=> location.href = wa, 1500);
  </script>
</body>
</html>
