require('dotenv').config();
const express = require('express');
const cors = require('cors');

const formularioRoutes = require('./routes/formularioRoutes');
const Admin = require('./routes/usersRouters');
const login = require('./routes/loginRouters');
const recomendacionesRouter = require("./routes/recomendaciones");
const recomendacionesCriteriosRouter = require("./routes/recomendacionesCriterios");

const app = express();

// Configurar CORS
const corsOptions = {
    origin: 'https://ramita.shop',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
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

// Ruta de prueba
app.get("/", (req, res) => {
    res.send("API funcionando correctamente");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
