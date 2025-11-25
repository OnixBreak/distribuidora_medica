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
    let { folio, fecha, cliente, total, pdfname, detalles } = req.body;

    if (!fecha || !cliente || !total || !pdfname) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Convertir fecha a formato MySQL
    fecha = convertirFechaMySQL(fecha);

    if (!folio) {
        return res.status(400).json({ error: 'Falta el folio' });
    }

    try {
        // 1️⃣ Guardar REGISTRO principal
        const queryRegistro = `
            INSERT INTO registros (id_registros, fecha_registro, cliente_registro, total_registro, pdf_respaldo)
            VALUES (?, ?, ?, ?, ?)
        `;

        await promise.query(queryRegistro, [
            folio,
            fecha,
            cliente,
            total,
            pdfname
        ]);

        // Guardar DETALLES en caso de existir
        if (detalles && Array.isArray(detalles)) {

            const queryDetalles = `
                INSERT INTO detalles_registro
                (id_registro, cantidad, descripcion, precio_unitario, subtotal)
                VALUES ?
            `;

            // Convertir en arreglo de arreglos
            const values = detalles.map(det => [
                folio,
                det.cantidad,
                det.descripcion,
                det.precio,
                det.subtotal
            ]);

            await promise.query(queryDetalles, [values]);
        }

        res.json({ success: true, message: 'Registro y detalles guardados correctamente' });

    } catch (error) {
        console.error('Error al guardar el registro:', error);
        res.status(500).json({ error: 'Error interno del servidor', detalle: error.message });
    }
});

/* ============================================================
    CONSULTAR REGISTRO + DETALLES POR FOLIO
   ============================================================ */
router.get("/consultar-registro/:folio", async (req, res) => {
    const { folio } = req.params;

    try {
        // Obtener datos principales del registro
        const [registro] = await promise.query(
            "SELECT * FROM registros WHERE id_registros = ?",
            [folio]
        );

        if (registro.length === 0) {
            return res.status(404).json({ error: "No existe un registro con ese folio" });
        }

        // Obtener sus detalles
        const [detalles] = await promise.query(
            "SELECT * FROM detalles_registro WHERE id_registro = ?",
            [folio]
        );

        res.json({
            registro: registro[0],
            detalles: detalles
        });

    } catch (error) {
        console.error("Error al consultar registro:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


/* ============================================================
    OBTENER SOLO DETALLES DEL REGISTRO
   ============================================================ */
router.get("/detalles/:folio", async (req, res) => {
    const { folio } = req.params;

    try {
        const [detalles] = await promise.query(
            "SELECT * FROM detalles_registro WHERE id_registro = ?",
            [folio]
        );

        res.json(detalles);

    } catch (error) {
        console.error("Error al obtener detalles:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


/* ============================================================
    ACTUALIZAR DATOS PRINCIPALES DEL REGISTRO
   ============================================================ */
router.put("/editar-registro/:folio", async (req, res) => {
    const { folio } = req.params;
    const { fecha, cliente, total } = req.body;

    if (!fecha || !cliente || !total) {
        return res.status(400).json({ error: "Campos incompletos" });
    }

    try {
        const query = `
            UPDATE registros
            SET fecha_registro = ?, cliente_registro = ?, total_registro = ?
            WHERE id_registros = ?
        `;

        await promise.query(query, [fecha, cliente, total, folio]);

        res.json({ success: true, message: "Registro actualizado" });

    } catch (error) {
        console.error("Error al actualizar registro:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});




/* ============================================================
    BORRAR DETALLES DEL REGISTRO (ANTES DE REINSERTAR)
   ============================================================ */
router.delete("/borrar-detalles/:folio", async (req, res) => {
    const { folio } = req.params;

    try {
        await promise.query("DELETE FROM detalles_registro WHERE id_registro = ?", [folio]);
        res.json({ success: true, message: "Detalles eliminados" });

    } catch (error) {
        console.error("Error al borrar detalles:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

/* ============================================================
    GUARDAR NUEVOS DETALLES DEL REGISTRO
    (SE USA DESPUÉS DE BORRAR LOS ANTERIORES)
   ============================================================ */
router.post("/guardar-detalles", async (req, res) => {
    const { detalles } = req.body;

    if (!Array.isArray(detalles) || detalles.length === 0) {
        return res.status(400).json({ error: "No se recibió ningún detalle" });
    }

    try {
        const query = `
            INSERT INTO detalles_registro 
            (id_registro, descripcion, cantidad, precio_unitario, subtotal)
            VALUES ?
        `;

        const values = detalles.map(det => [
            det.id_registro,
            det.descripcion,
            det.cantidad,
            det.precio_unitario,
            det.subtotal
        ]);

        await promise.query(query, [values]);

        res.json({ success: true, message: "Detalles guardados" });

    } catch (error) {
        console.error("Error al guardar detalles:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

router.put("/registros/:folio", async (req, res) => {
    const { folio } = req.params;
    const { fecha, cliente, total, pdfname, detalles } = req.body;

    if (!fecha || !cliente || !total || !pdfname) {
        return res.status(400).json({ error: "Faltan datos" });
    }

    try {
        // 1. Actualizar tabla registros
        await promise.query(
            "UPDATE registros SET fecha_registro=?, cliente_registro=?, total_registro=?, pdf_respaldo=? WHERE id_registros=?",
            [fecha, cliente, total, pdfname, folio]
        );

        // 2. Eliminar detalles anteriores
        await promise.query("DELETE FROM detalles_registro WHERE id_registro=?", [folio]);

        // 3. Insertar los nuevos
        for (let det of detalles) {
            await promise.query(
                "INSERT INTO detalles_registro (id_registro, cantidad, descripcion, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)",
                [folio, det.cantidad, det.descripcion, det.precio, det.subtotal]
            );
        }

        res.json({ success: true, message: "Registro actualizado correctamente" });

    } catch (error) {
        console.error("Error al actualizar registro:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});





module.exports = router;