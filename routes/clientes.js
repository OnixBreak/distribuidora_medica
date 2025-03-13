const express = require('express');
const router = express.Router();
const db = require('../database/db'); // Asegúrate de importar tu conexión a la base de datos


const promise = db.promise();

router.post('/agregar-cliente', async (req, res) => {
    const { nombre_cliente, direccion_cliente } = req.body; // Obtener datos del formulario

    if (!nombre_cliente || !direccion_cliente) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        const [result] = await promise.query('INSERT INTO clientes (nombre_cliente, domicilio_cliente) VALUES (?, ?)', [nombre_cliente, direccion_cliente]);
        res.status(201).json({ message: 'Cliente agregado correctamente', id: result.insertId });
    } catch (error) {
        console.error('Error al insertar datos:', error);
        res.status(500).json({ error: 'Error al insertar cliente' });
    }
});





module.exports = router;