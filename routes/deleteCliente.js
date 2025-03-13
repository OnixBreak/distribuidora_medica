const express = require('express');
const router = express.Router();
const db = require('../database/db'); // Asegúrate de que apunte a tu conexión con MySQL

const promise = db.promise();
// Ruta para eliminar un cliente por su ID
router.delete('/eliminar-cliente/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await promise.query('DELETE FROM clientes WHERE id_cliente = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        res.json({ mensaje: 'Cliente eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el cliente:', error);
        res.status(500).json({ error: 'Error al eliminar el cliente', detalle: error.message });
    }
});

module.exports = router;
