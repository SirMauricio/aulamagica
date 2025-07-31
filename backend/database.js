require('dotenv').config();
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql-terravision.alwaysdata.net',
  user: process.env.DB_USER || '410495',
  password: process.env.DB_PASS || 'Jorger0:v',
  database: process.env.DB_NAME || 'terravision_aulamagica',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

pool.getConnection()
  .then(conn => {
    console.log("Conexión exitosa a la BD");
    conn.release(); 
  })
  .catch(err => {
    console.error("Error al conectar la BD:", err);
  });

module.exports = pool;




// require('dotenv').config();
// const express = require("express");
// const mysql = require("mysql2"); 
// const cors = require("cors");

// const app = express();
// app.use(express.json());
// app.use(cors());

// const connection = mysql.createConnection({
//     host: 'mysql-terravision.alwaysdata.net',
//     user: '410495',
//     password: 'Jorger0:v',
//     database: 'terravision_aulamagica',
// });


// connection.promise();  

// connection.connect(function (error) {
//   if (error) {
//     console.log("Error al conectar la bd");
//   } else {
//     console.log("Conexion realizada exitosamente a la BD");
//   }
// });

// module.exports = connection;
