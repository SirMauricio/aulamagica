const { PythonShell } = require('python-shell');

exports.ejecutarIA = (datos) => {
return new Promise((resolve, reject) => {
    const opciones = {
        mode: 'text',
        pythonOptions: ['-u'],
        scriptPath: './python',
        args: [
            JSON.stringify(datos) // envía el objeto completo al script
        ]
    };

    PythonShell.run('modelo_ia.py', opciones, (err, results) => {
        if (err) return reject(err);
        try {
            const respuesta = JSON.parse(results[0]);
            resolve(respuesta);
        } catch (parseError) {
            reject(parseError);
        }
        });
    });
};
