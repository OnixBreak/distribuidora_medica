const express = require("express");
const router = express.Router();
const conn = require("../database/db");

const promise = conn.promise();

/* CONSULTAR REGISTRO POR FOLIO */
router.get("/consultRegistEdit/:folio", async (req, res) => {
    try {
        const folio = req.params.folio;

        const [rows] = await promise.query(
            "SELECT * FROM registros WHERE id_registros = ?",
            [folio]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Registro no encontrado" });
        }

        res.json(rows[0]);

    } catch (error) {
        console.error("Error al consultar registro:", error);
        res.status(500).json({
            error: "Error al consultar registro",
            detalle: error.message
        });
    }
});

module.exports = router;
