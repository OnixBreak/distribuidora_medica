const express = require("express");
const router = express.Router();
const conn = require('../database/db');

const promise = conn.promise();

router.get('/consulta-folio', async (req, res) => {
    try {
        const [rows] = await promise.query('SELECT id_registros FROM registros ORDER BY id_registros DESC LIMIT 1');
        res.send(rows.length > 0 ? String(rows[0].id_registros) : "0");
    } catch (error) {
        console.error('Error al obtener el folio:', error);
        res.status(500).send("Error al obtener el folio");
    }
});

module.exports = router;