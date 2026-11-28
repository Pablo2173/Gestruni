'use strict';

const express = require('express');
const router = express.Router();
const adminService = require('../services/adminService');
const { requireAdmin } = require('../middlewares/authMiddleware');

// Todas las rutas de /api/admin requieren rol admin
router.use(requireAdmin);

router.get('/resumen', async (req, res) => {
    try {
        const resumen = await adminService.obtenerResumenSistema();
        res.status(200).json(resumen);
    } catch (err) {
        console.error('Error en GET /api/admin/resumen:', err.message);
        res.status(500).json({ error: 'Error interno al obtener las estadísticas.' });
    }
});

router.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await adminService.obtenerTodosLosUsuarios();
        res.status(200).json(usuarios);
    } catch (err) {
        console.error('Error en GET /api/admin/usuarios:', err.message);
        res.status(500).json({ error: 'Error interno al obtener los usuarios.' });
    }
});

router.put('/usuarios/:id', async (req, res) => {
    const idUsuario = Number(req.params.id);

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
        return res.status(400).json({ error: 'Identificador de usuario no válido.' });
    }

    try {
        const actualizado = await adminService.actualizarUsuarioAdmin(
            idUsuario,
            req.body,
            req.session.user.id_usuario
        );

        if (!actualizado) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        res.status(200).json({ mensaje: 'Usuario actualizado correctamente.' });
    } catch (err) {
        if (err.status === 400) {
            return res.status(400).json({ error: err.message });
        }
        console.error('Error en PUT /api/admin/usuarios/:id:', err.message);
        res.status(500).json({ error: 'Error interno al actualizar el usuario.' });
    }
});

module.exports = router;