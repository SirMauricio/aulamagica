require('dotenv').config();
const express = require("express");
const mysql = require("mysql2"); 
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const connection = mysql.createConnection({
    host: 'mysql-terravision.alwaysdata.net',
    user: '410495',
    password: 'Jorger0:v',
    database: 'terravision_aulamagica',
});


connection.promise();  

connection.connect(function (error) {
  if (error) {
    console.log("Error al conectar la bd");
  } else {
    console.log("Conexion realizada exitosamente a la BD");
  }
});

module.exports = connection;
