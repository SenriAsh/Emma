const BASE_URL = "https://Senri.pythonanywhere.com";

// Función para comprobar si el usuario está logueado
async function checkUser() {
  try {
    const response = await fetch('${BASE_URL}/current_user', {
      credentials: 'include' // necesario para enviar cookies de sesión
    });

    const data = await response.json();
    const navbarUser = document.getElementById('navbarUser');

    if (!navbarUser) return;

    if (data.name) {
      // Si el usuario NO tiene avatar, mostrar un ícono por defecto
      const avatar = data.avatar_url && data.avatar_url.trim() !== ""
        ? data.avatar_url
        : "https://cdn-icons-png.flaticon.com/512/847/847969.png"; // ícono genérico

      // Construir el menú del usuario
      navbarUser.innerHTML = `
        <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
          <img src="${avatar}" alt="avatar" class="rounded-circle me-2" width="40" height="40">
          ${data.name}
        </a>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
          <li><a class="dropdown-item" href="perfil.html">Perfil</a></li>
          <li><a class="dropdown-item" href="#" id="logoutBtn">Cerrar sesión</a></li>
        </ul>
      `;

      // Evento de logout
      const logoutBtn = document.getElementById('logoutBtn');
      logoutBtn.addEventListener('click', async () => {
        try {
          await fetch('${BASE_URL}/logout', {
            method: 'POST',
            credentials: 'include'
          });
          window.location.reload();
        } catch (err) {
          console.error('Error al cerrar sesión:', err);
        }
      });

    } else {
      // Si no hay sesión activa → mostrar botón Ingresar
      navbarUser.innerHTML = `<a class="nav-link" href="login.html">Ingresar</a>`;
    }

  } catch (err) {
    console.error('Error al verificar usuario:', err);
  }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', checkUser);
