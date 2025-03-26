const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Ruta PUT para actualizar cliente, ahora usando un parámetro en la URL
router.put("/actualizar-cliente/:id_cliente", async (req, res) => {
    let { nombre_clienteAct, direccion_clienteAct } = req.body;
    const id_clienteAct = req.params.id_cliente; // Obtener el ID desde la URL

    if (!id_clienteAct || !nombre_clienteAct || !direccion_clienteAct) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        const result = await db.execute(
            "UPDATE clientes SET nombre_cliente = ?, domicilio_cliente = ? WHERE id_cliente = ?",
            [nombre_clienteAct, direccion_clienteAct, id_clienteAct]
        );

        //console.log("Resultado de la consulta:", result);

        const affectedRows = result[0]?.affectedRows;
        if (affectedRows === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        //res.json({ message: "Cliente actualizado correctamente" });

    } catch (error) {
        console.error("Error al actualizar cliente:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});



module.exports = router;
