import sqlite3
conn = sqlite3.connect('users.db')
cursor = conn.cursor()
cursor.execute("ALTER TABLE users ADD COLUMN avatar_url TEXT")
conn.commit()
conn.close()
print("Columna avatar_url añadida con éxito.")
