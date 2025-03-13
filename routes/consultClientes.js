const express = require('express');
const router = express.Router();
const conn = require('../database/db'); // Asegúrate de que apunte a tu conexión con MySQL

const promise = conn.promise();

router.get('/consulta-clientes', async (req, res) => {
    try {
        const [rows] = await promise.query('SELECT * FROM clientes');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener los clientes:', error);
        res.status(500).json({ error: 'Error al obtener los clientes', detalle: error.message });
    }
});

module.exports = router;
