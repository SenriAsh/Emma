import os
from werkzeug.utils import secure_filename
from flask import Flask, request, jsonify, session
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_session import Session
import sqlite3

app = Flask(__name__)
bcrypt = Bcrypt(app)
CORS(app, supports_credentials=True)


# Carpeta donde se guardarán los avatares
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'static', 'avatars')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Configuración de la sesión
app.secret_key = 'tu_clave_secreta_super_segura'
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

# ---------- CREAR LA TABLA SI NO EXISTE ----------
def init_db():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# Inicializar base de datos
init_db()

# ---------- REGISTRO ----------
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not all([name, email, password]):
        return jsonify({'error': 'Faltan datos'}), 400

    hashed = bcrypt.generate_password_hash(password).decode('utf-8')

    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    try:
        cursor.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                       (name, email, hashed))
        conn.commit()
        return jsonify({'message': 'Usuario registrado correctamente'})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'El correo ya está registrado'}), 409
    finally:
        conn.close()

# ---------- LOGIN ----------
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, password FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()
    conn.close()

    if user and bcrypt.check_password_hash(user[2], password):
        session['user_id'] = user[0]
        session['user_name'] = user[1]
        return jsonify({'message': 'Login exitoso'})
    else:
        return jsonify({'error': 'Correo o contraseña incorrectos'}), 401

# ---------- CERRAR SESIÓN ----------
@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Sesión cerrada'})

# ---------- OBTENER INFO DEL USUARIO ----------
@app.route('/current_user', methods=['GET'])
def current_user():
    if 'user_id' in session:
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        cursor.execute('SELECT id, name, avatar_url FROM users WHERE id = ?', (session['user_id'],))
        user = cursor.fetchone()
        conn.close()

        return jsonify({
            'id': user[0],
            'name': user[1],
            'avatar_url': user[2] or None
        })
    else:
        return jsonify({'user': None})


# ---------- ACTUALIZAR PERFIL ----------
@app.route('/update_profile', methods=['POST'])
def update_profile():
    if 'user_id' not in session:
        return jsonify({'error': 'No autorizado'}), 401

    user_id = session['user_id']
    name = request.form.get('name')

    # Manejar posible subida de imagen
    avatar_url = None
    if 'avatar' in request.files:
        file = request.files['avatar']
        if file.filename != '':
            filename = secure_filename(file.filename)
            path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(path)
            avatar_url = f'/static/avatars/{filename}'

    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    # Si hay imagen nueva
    if avatar_url:
        cursor.execute('UPDATE users SET name = ?, avatar_url = ? WHERE id = ?', 
                       (name, avatar_url, user_id))
    else:
        cursor.execute('UPDATE users SET name = ? WHERE id = ?', 
                       (name, user_id))

    conn.commit()
    conn.close()

    # Actualizar también la sesión para que el nuevo nombre se refleje
    session['user_name'] = name

    return jsonify({'message': 'Perfil actualizado con éxito'})

# ---------- ELIMINAR PFP ----------
@app.route('/delete_avatar', methods=['POST'])
def delete_avatar():
    if 'user_id' not in session:
        return jsonify({'error': 'No autorizado'}), 401

    user_id = session['user_id']

    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    # Obtener la ruta actual de la imagen
    cursor.execute('SELECT avatar_url FROM users WHERE id = ?', (user_id,))
    avatar = cursor.fetchone()

    if avatar and avatar[0]:
        # Ruta absoluta del archivo
        avatar_path = os.path.join(os.getcwd(), avatar[0].lstrip('/'))
        if os.path.exists(avatar_path):
            os.remove(avatar_path)

    # Borrar la referencia del avatar en la BD
    cursor.execute('UPDATE users SET avatar_url = NULL WHERE id = ?', (user_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Avatar eliminado correctamente'})


if __name__ == '__main__':
    app.run(debug=True)
