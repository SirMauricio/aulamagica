const { spawn } = require('child_process');

function analizarTextoConIA(textoUsuario) {
    return new Promise((resolve, reject) => {
        const procesoPython = spawn('python', ['python/modelo_ia.py', textoUsuario]);

        let resultado = '';
        procesoPython.stdout.on('data', (data) => {
            resultado += data.toString();
        });

        procesoPython.stderr.on('data', (data) => {
            console.error(`Error en Python: ${data}`);
        });

        procesoPython.on('close', (code) => {
            if (code === 0) {
                resolve(resultado.trim());
            } else {
                reject('Error ejecutando modelo de IA');
            }
        });
    });
}

module.exports = { analizarTextoConIA };
