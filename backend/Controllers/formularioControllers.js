const db = require("../database");
const axios = require("axios");

exports.crearFormulario = async (req, res) => {
  const {
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    celContacto,
    correo,
    mensaje,
    captchaToken
  } = req.body;

  if (!captchaToken) {
    return res.status(400).json({ message: "Captcha no enviado" });
  }

  try {
    const secretKey = process.env.RECAPTCHA_SECRET;

    const captchaResponse = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: secretKey,
          response: captchaToken
        }
      }
    );

    if (!captchaResponse.data.success) {
      return res.status(403).json({ message: "Captcha inválido. Inténtalo de nuevo." });
    }

    const sql = `
      INSERT INTO formulario (
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        celContacto,
        correo,
        mensaje,
        captchaToken
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [nombre, apellidoPaterno, apellidoMaterno, celContacto, correo, mensaje, captchaToken],
      (err, result) => {
        if (err) {
          console.error("Error al insertar datos:", err);
          return res.status(500).send("Error al guardar el formulario");
        }
        res.status(200).send("Formulario guardado correctamente");
      }
    );

  } catch (error) {
    console.error("Error al validar captcha:", error.message || error);
    res.status(500).json({ message: "Error al verificar captcha" });
  }
};

exports.obtenerFormularios = (req, res) => {
  const sql = "SELECT * FROM formulario";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener formularios:", err);
      return res.status(500).send("Error al obtener datos");
    }
    res.json(results);
  });
};
