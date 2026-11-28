'use strict';

const express = require('express');
const router = express.Router();
const matriculasService = require('../services/matriculasService');
const { requireAuth, requireAlumno } = require('../middlewares/authMiddleware');

// GET /api/matriculas -> si es admin devuelve todas; si es alumno devuelve solo las suyas
router.get('/', requireAuth, async (req, res) => {
    try {
        const usuario = req.session.user;
        const matriculas = usuario.rol === 'admin'
            ? await matriculasService.obtenerTodasLasMatriculas()
            : await matriculasService.obtenerMatriculasPorUsuario(usuario.id_usuario);

        res.status(200).json(matriculas);
    } catch (err) {
        console.error('Error en GET /api/matriculas:', err.message);
        res.status(500).json({ error: 'Error interno al obtener las matrículas.' });
    }
});

// POST /api/matriculas -> matricular al alumno autenticado en un curso
router.post('/', requireAlumno, async (req, res) => {
    const idCurso = Number(req.body.id_curso);

    if (!Number.isInteger(idCurso) || idCurso <= 0) {
        return res.status(400).json({ error: 'Debes seleccionar un curso válido.' });
    }

    try {
        const resultado = await matriculasService.matricularAlumno(req.session.user.id_usuario, idCurso);
        res.status(201).json({
            mensaje: `Matrícula confirmada en "${resultado.nombre_curso}".`,
            id_matricula: resultado.id_matricula
        });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }
        console.error('Error en POST /api/matriculas:', err.message);
        res.status(500).json({ error: 'Error interno al procesar la matrícula.' });
    }
});

// DELETE /api/matriculas/:id -> dar de baja / cancelar una matrícula
router.delete('/:id', requireAuth, async (req, res) => {
    const idMatricula = Number(req.params.id);

    if (!Number.isInteger(idMatricula) || idMatricula <= 0) {
        return res.status(400).json({ error: 'Identificador de matrícula no válido.' });
    }

    try {
        await matriculasService.cancelarMatricula(idMatricula, req.session.user);
        res.status(200).json({ mensaje: 'Matrícula cancelada correctamente.' });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }
        console.error('Error en DELETE /api/matriculas/:id:', err.message);
        res.status(500).json({ error: 'Error interno al cancelar la matrícula.' });
    }
});

module.exports = router;