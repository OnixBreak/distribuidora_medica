const express = require('express');
const router = express.Router();
const conn = require('../database/db'); // Asegúrate de que apunte a tu conexión con MySQL
const promise = conn.promise();

function convertirFechaMySQL(fechaISO) {
    const fecha = new Date(fechaISO);
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    const hh = String(fecha.getHours()).padStart(2, '0');
    const min = String(fecha.getMinutes()).padStart(2, '0');
    const ss = String(fecha.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  }
  

  
  router.post('/registros', async (req, res) => {
    let {fecha, cliente, total, pdfname } = req.body;

    if (!fecha || !cliente || !total || !pdfname) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    fecha = convertirFechaMySQL(fecha);

    try {
        const query = 'INSERT INTO registros (fecha_registro, cliente_registro, total_registro, pdf_respaldo) VALUES (?, ?, ?,?)';
        await promise.query(query, [fecha, cliente, total, pdfname]);
        res.json({ success: true, message: 'Registro guardado correctamente' });
    } catch (error) {
        console.error('Error al guardar el registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;