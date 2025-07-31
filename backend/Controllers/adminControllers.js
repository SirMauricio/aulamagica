const { json } = require("express");
const connection = require("../database");
const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");

// Función para hashear una contraseña
async function hashContraseña(contraseña) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(contraseña, salt);
}

// Generador de código de verificación
function generarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mauricio.suv@gmail.com',
    pass: 'xmfp zmcj hbhl duyp', 
  }
});

// Enviar correo de verificación
async function enviarCodigoVerificacion(correo, codigo) {
  const mensaje = {
    from: 'mauricio.suv@gmail.com',
    to: correo,
    subject: 'Código de verificación - GameStation',
    text: `Tu código de verificación es: ${codigo}`,
  };
  return await transporter.sendMail(mensaje);
}

function verUsuarios(request, response) {
  connection.query(`SELECT * FROM usuarios`, (error, results) => {
    if (error) {
      return response.status(500).json({ error: "Error al obtener usuarios" });
    }
    response.status(200).json(results);
  });
}

async function crearUsuario(request, response) {
  const { usuario, contrasena, correo } = request.body;

  try {
    const hash = await hashContraseña(contrasena);
    const codigo = generarCodigo();

    connection.query(
      'INSERT INTO usuarios (usuario, contrasena, correo, codigo, verificado) VALUES (?, ?, ?, ?, ?)',
      [usuario, hash, correo, codigo, false],
      async (error, results) => {
        if (error) {
          console.error("Error al insertar en la base de datos:", error);
          return response.status(500).json({ error: "Error interno del servidor" });
        }

        try {
          await enviarCodigoVerificacion(correo, codigo);
          console.log('Correo enviado correctamente');
          response.json({ success: true, mensaje: "Usuario creado. Revisa tu correo para verificar tu cuenta." });
        } catch (emailError) {
          console.error("Error al enviar el correo:", emailError);
          response.status(500).json({ error: "Usuario creado pero no se pudo enviar el código de verificación." });
        }
      }
    );
  } catch (error) {
    console.error("Error al hashear la contraseña:", error);
    response.status(500).json({ error: "Error interno al procesar el usuario" });
  }
}

async function editarUsuario(request, response) {
  const { id_usuario } = request.params;
  const { usuario, contrasena, correo } = request.body;

  try {
    connection.query('SELECT * FROM usuarios WHERE id_usuario = ?', [id_usuario], async (error, results) => {
      if (error || results.length === 0) {
        return response.status(404).json({ error: "Usuario no encontrado" });
      }

      const hashedPassword = await hashContraseña(contrasena);

      connection.query(
        'UPDATE usuarios SET usuario=?, contrasena=?, correo=? WHERE id_usuario=?',
        [usuario, hashedPassword, correo, id_usuario],
        (error, results) => {
          if (error) {
            console.error("Error al actualizar usuario:", error);
            return response.status(500).json({ error: "Error interno del servidor" });
          }
          console.log('Usuario actualizado correctamente');
          response.json({ success: true });
        }
      );
    });
  } catch (error) {
    console.error("Error al hashear la contraseña:", error);
    response.status(500).json({ error: "Error interno al hashear la contraseña" });
  }
}


function eliminarUsuario(request, response) {
  const { id_usuario } = request.params;

  connection.query('SELECT * FROM usuarios WHERE id_usuario = ?', [id_usuario], (error, results) => {
    if (error || results.length === 0) {
      return response.status(404).json({ error: "Usuario no encontrado" });
    }

    connection.query('DELETE FROM usuarios WHERE id_usuario = ?', [id_usuario], (error, results) => {
      if (error) {
        console.error("Error al eliminar usuario:", error);
        return response.status(500).json({ error: "Error interno del servidor" });
      }
      console.log('Usuario eliminado correctamente');
      response.json({ success: true });
    });
  });
}

module.exports = {
  verUsuarios,
  crearUsuario,
  editarUsuario,
  eliminarUsuario,
};
