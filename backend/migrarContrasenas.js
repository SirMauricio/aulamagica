const connection = require('./models/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();


async function migrarContrasenas() {
  connection.query('SELECT id_usuario, contrasena FROM usuarios', async (error, results) => {
    if (error) {
      console.error('Error al obtener usuarios:', error);
      return;
    }

    for (const usuario of results) {
      
      const hash = await bcrypt.hash(usuario.contrasena, 10);


      connection.query(
        'UPDATE usuarios SET contrasena_hash = ? WHERE id_usuario = ?',
        [hash, usuario.id_usuario],
        (err) => {
          if (err) {
            console.error(`Error al actualizar usuario ${usuario.id_usuario}:`, err);
          } else {
            console.log(`Usuario ${usuario.id_usuario} migrado correctamente.`);
          }
        }
      );
    }
  });
}

migrarContrasenas();
