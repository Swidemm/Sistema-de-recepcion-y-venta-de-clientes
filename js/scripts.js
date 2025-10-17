// === bundled from inline scripts ===

tailwind.config = { theme: { extend: {
    colors: {
      brand: {
        50:'#e6f0f2',100:'#cfe2e6',200:'#9fc4cd',300:'#6ea6b3',400:'#3e889a',500:'#0f6a81',600:'#0d5a6d',700:'#0b4a59',800:'#083945',900:'#062f3a'
      }
    },
    fontFamily:{ sans:['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'] }
  }}};


    // Set current year in footer
    var _y=document.getElementById('year'); if(_y){_y.textContent=new Date().getFullYear();}
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

// Construimos la URL a partir de env.php en server-side sería ideal.
    // Como placeholder, la armamos acá con el número del env (cambiar a tu dominio si preferís PHP puro).
    const wa = "https://wa.me/5491123941812?text=Hola!%20Acabo%20de%20realizar%20un%20pago%20y%20necesito%20coordinar%20mi%20obra.";
    document.getElementById('wa').href = wa;
    setTimeout(()=> location.href = wa, 1500);

tailwind.config = { theme: { extend: {
    colors: {
      brand: {
        50:'#e6f0f2',100:'#cfe2e6',200:'#9fc4cd',300:'#6ea6b3',400:'#3e889a',500:'#0f6a81',600:'#0d5a6d',700:'#0b4a59',800:'#083945',900:'#062f3a'
      }
    },
    fontFamily:{ sans:['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'] }
  }}};


    var _y=document.getElementById('year'); if(_y){_y.textContent=new Date().getFullYear();}