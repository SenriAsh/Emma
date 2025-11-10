const BASE_URL = "https://Senri.pythonanywhere.com";

// Obtener elementos del DOM
const form = document.getElementById('registerForm');
const name = document.getElementById('name');
const email = document.getElementById('email');
const password = document.getElementById('password');
const confirm = document.getElementById('confirm');

// Manejar envío del formulario
form.addEventListener('submit', function (e) {
  e.preventDefault(); // Evita el envío automático

  // Reinicia los mensajes de error
  [name, email, password, confirm].forEach(input => input.classList.remove('is-invalid'));

  let valid = true;

  // Validar nombre
  if (name.value.trim() === '') {
    name.classList.add('is-invalid');
    valid = false;
  }

  // Validar email con expresión regular
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailRegex.test(email.value.trim())) {
    email.classList.add('is-invalid');
    valid = false;
  }

  // Validar contraseña
  if (password.value.length < 8) {
    password.classList.add('is-invalid');
    valid = false;
  }

  // Validar confirmación de contraseña
  if (confirm.value !== password.value || confirm.value === '') {
    confirm.classList.add('is-invalid');
    valid = false;
  }

  // Si todo está bien
  if (valid) {
  const userData = {
    name: name.value.trim(),
    email: email.value.trim(),
    password: password.value.trim()
  };

  fetch('${BASE_URL}/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert('⚠️ ' + data.error);
    } else {
      alert('✅ Registro exitoso. Ahora puedes iniciar sesión.');
      form.reset();
      window.location.href = 'login.html';
    }
  })
  .catch(err => alert('❌ Error en el servidor: ' + err));
}

});
