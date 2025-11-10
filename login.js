const BASE_URL = "https://Senri.pythonanywhere.com";

// Obtener elementos del formulario
const form = document.querySelector('form');
const email = document.getElementById('email');
const password = document.getElementById('password');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  // Limpiar estilos previos
  [email, password].forEach(input => input.classList.remove('is-invalid'));

  let valid = true;

  // Validar campos vacíos
  if (email.value.trim() === '') {
    email.classList.add('is-invalid');
    valid = false;
  }

  if (password.value.trim() === '') {
    password.classList.add('is-invalid');
    valid = false;
  }

  if (!valid) return;

  // Enviar datos al backend Flask
  const userData = {
    email: email.value.trim(),
    password: password.value.trim()
  };

  try {
    const response = await fetch('${BASE_URL}login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (response.ok) {
        // Redirige a index.html
        window.location.href = 'index.html';
    } else {
        alert('⚠️ ' + (data.error || 'Error desconocido al iniciar sesión.'));
        password.value = '';
    }


  } catch (error) {
    alert('❌ Error de conexión con el servidor: ' + error.message);
  }
});
