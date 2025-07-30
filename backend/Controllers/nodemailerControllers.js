const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const connection = require("../database");

// Hasheo de contraseña
const encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Comparar contraseña
const comparePasswords = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mauricio.suv@gmail.com",
    pass: "xmfp zmcj hbhl duyp",
  },
});

// Enviar correo dinámico
const enviarCorreo = async (destinatario, asunto, contenido) => {
  const mensaje = {
    from: "mauricio.suv@gmail.com",
    to: destinatario,
    subject: asunto,
    text: contenido,
  };

  const info = await transporter.sendMail(mensaje);
  console.log("Correo enviado:", info.response);
  return info;
};

// Confirmar código
function confirmarCodigo(request, response) {
  const { id_usuario, codigo } = request.body;

  connection.query(
    `SELECT * FROM usuarios WHERE id_usuario = ? AND codigo = ?`,
    [id_usuario, codigo],
    (error, result) => {
      if (error) {
        console.error("Error al consultar:", error);
        return response.status(500).json({
          respuesta: "Error en el servidor",
          status: false,
        });
      }

      if (result.length === 0) {
        return response.status(200).json({
          respuesta: "El código es incorrecto",
          status: false,
        });
      }

      connection.query(
        `UPDATE usuarios SET verificado = true WHERE id_usuario = ?`,
        [id_usuario],
        (updateError, updateResult) => {
          if (updateError) {
            console.error("Error al actualizar verificación:", updateError);
            return response.status(500).json({
              respuesta: "No se pudo marcar como verificado",
              status: false,
            });
          }

          return response.status(200).json({
            respuesta: "Verificación exitosa",
            status: true,
          });
        }
      );
    }
  );
}

module.exports = {
  encryptPassword,
  comparePasswords,
  enviarCorreo,
  confirmarCodigo,
};
