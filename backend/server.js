require('dotenv').config();
const express = require('express');
const cors = require('cors');

const formularioRoutes = require('./routes/formularioRoutes');
const Admin = require('./routes/usersRouters');
const login = require('./routes/loginRouters');
const recomendacionesRouter = require("./routes/recomendaciones");
const recomendacionesCriteriosRouter = require("./routes/recomendacionesCriterios");
const modalidadesRouter = require("./routes/modalidadRoutes");
const nivelRouter = require("./routes/nivelRoutes");
const gradoRouter = require("./routes/gradoRoutes");
const espacioRouter = require("./routes/espacioRoutes");
const materialesRouter = require("./routes/materialesRoutes");
const complejidadRouter = require("./routes/complejidadRoutes");
const objetivoRouter = require("./routes/objetivoRoutes");
const duracionRouter = require("./routes/duracionRoutes");


const app = express();

const corsOptions = {
origin: ['https://ramita.shop', 'http://localhost:5173'],
methods: ['GET', 'POST', 'PUT', 'DELETE'],
credentials: true,
};

app.use(cors(corsOptions));


// Parse JSON
app.use(express.json());

// Montar rutas
app.use('/formulario', formularioRoutes);
app.use('/login', login);
app.use('/users', Admin);
app.use("/api", recomendacionesRouter);
app.use("/api", recomendacionesCriteriosRouter);
app.use("/api/modalidades", modalidadesRouter);
app.use("/api/nivel", nivelRouter);
app.use("/api/grado", gradoRouter);
app.use("/api/espacio", espacioRouter);
app.use("/api/materiales", materialesRouter);
app.use("/api/complejidades", complejidadRouter);
app.use("/api/objetivos", objetivoRouter);
app.use("/api/duracion", duracionRouter);

// Ruta de prueba
app.get("/", (req, res) => {
    res.send("API funcionando correctamente");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
