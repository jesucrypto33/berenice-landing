document.addEventListener('DOMContentLoaded', function () {
  const btn = document.querySelector('.cnt-form .btn-primary');
  const form = document.querySelector('.cnt-form');

  if (!btn || !form) return;

  btn.addEventListener('click', async () => {
    const nombre  = form.querySelector('input[placeholder="Tu nombre"]').value.trim();
    const empresa = form.querySelector('input[placeholder="Empresa S.A."]').value.trim();
    const email   = form.querySelector('input[type="email"]').value.trim();
    const area    = form.querySelector('select').value;
    const mensaje = form.querySelector('textarea').value.trim();

    if (!nombre || !email || !mensaje) {
      alert('Por favor completá nombre, email y mensaje.');
      return;
    }

    btn.textContent = 'ENVIANDO...';
    btn.disabled = true;

    try {
      const res = await fetch('https://berenice-backend-production.up.railway.app/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, empresa, email, area, mensaje }),
      });

      const data = await res.json();

      if (data.ok) {
        btn.textContent = '✓ MENSAJE ENVIADO';
        btn.style.background = '#00c87a';
        form.querySelectorAll('input, textarea, select').forEach(el => el.value = '');
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
      btn.textContent = 'ENVIAR MENSAJE →';
      btn.disabled = false;
    }
  });
});
