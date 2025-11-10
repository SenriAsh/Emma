const BASE_URL = "https://Senri.pythonanywhere.com";

document.addEventListener('DOMContentLoaded', async () => {
  const nameInput = document.getElementById('name');
  const profilePic = document.getElementById('profilePic');
  const form = document.getElementById('profileForm');
  const imageInput = document.getElementById('imageInput');
  const deleteBtn = document.getElementById('deleteImageBtn');

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  // Cargar datos del usuario
  try {
    const res = await fetch('${BASE_URL}/current_user', { credentials: 'include' });
    const user = await res.json();

    if (user.name) nameInput.value = user.name;
    profilePic.src = user.avatar_url || defaultAvatar;
  } catch (err) {
    console.error('Error al cargar usuario:', err);
  }

  // Vista previa al seleccionar nueva imagen
  imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => profilePic.src = e.target.result;
      reader.readAsDataURL(file);
    }
  });

  // Botón BORRAR imagen
  deleteBtn.addEventListener('click', async () => {
    if (!confirm("¿Seguro que quieres borrar tu foto de perfil?")) return;

    try {
      const res = await fetch('${BASE_URL}/delete_avatar', {
        method: 'POST',
        credentials: 'include'
      });
      const result = await res.json();

      alert(result.message || 'Imagen eliminada');
      profilePic.src = defaultAvatar;
    } catch (err) {
      console.error('Error al eliminar avatar:', err);
      alert('No se pudo borrar la imagen.');
    }
  });

  // Guardar cambios (nombre + imagen)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', nameInput.value);
    if (imageInput.files[0]) {
      formData.append('avatar', imageInput.files[0]);
    }

    try {
      const res = await fetch('${BASE_URL}/update_profile', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const result = await res.json();
      alert(result.message || 'Perfil actualizado correctamente');
      window.location.href = 'index.html';
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      alert('Ocurrió un error al guardar los cambios.');
    }
  });
});
