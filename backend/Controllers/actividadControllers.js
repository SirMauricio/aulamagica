const Actividad = require('../models/actividadModel');

exports.getAll = (req, res) => {
Actividad.getAll((err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
});
};

exports.create = (req, res) => {
Actividad.create(req.body, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ id: result.insertId, ...req.body });
});
};

exports.getById = (req, res) => {
Actividad.getById(req.params.id, (err, result) => {
    if (err) return res.status(500).send(err);
    if (!result.length) return res.status(404).send('No encontrado');
    res.json(result[0]);
});
};

exports.update = (req, res) => {
Actividad.update(req.params.id, req.body, (err) => {
    if (err) return res.status(500).send(err);
    res.send('Actualizado');
});
};

exports.delete = (req, res) => {
Actividad.delete(req.params.id, (err) => {
    if (err) return res.status(500).send(err);
    res.send('Eliminado');
});
};
