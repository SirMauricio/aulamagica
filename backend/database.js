require('dotenv').config();
const express = require("express");
const mysql = require("mysql2"); 
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
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
