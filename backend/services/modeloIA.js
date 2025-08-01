const axios = require('axios');

async function consultarModeloIA(datos) {
try {
    const response = await axios.post('http://localhost:8001/ia/modelo/combinado', datos);
    return response.data;
} catch (error) {
    console.error('Error consultando microservicio IA:', error.message);
    throw error;
}
}

module.exports = { consultarModeloIA };
