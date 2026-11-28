'use strict';

const express = require('express');
const router = express.Router();
const cursosService = require('../services/cursosService');
const { requireAdmin } = require('../middlewares/authMiddleware');
const { validateCurso } = require('../middlewares/validationMiddleware');

router.get('/', async (req, res) => {
    try {
        const cursos = await cursosService.obtenerCursos();
        res.status(200).json(cursos);
    } catch (err) {
        console.error('Error en GET /api/cursos:', err.message);
        res.status(500).json({ error: 'No se pudieron obtener los cursos de la base de datos.' });
    }
});

router.get('/opciones', requireAdmin, async (req, res) => {
    try {
        const opciones = await cursosService.obtenerOpcionesFormulario();
        res.status(200).json(opciones);
    } catch (err) {
        console.error('Error en GET /api/cursos/opciones:', err.message);
        res.status(500).json({ error: 'No se pudieron cargar docentes y aulas.' });
    }
});

router.get('/:id', async (req, res) => {
    const idCurso = Number(req.params.id);

    if (!Number.isInteger(idCurso) || idCurso <= 0) {
        return res.status(400).json({ error: 'Identificador de curso no válido.' });
    }

    try {
        const curso = await cursosService.obtenerCursoPorId(idCurso);
        if (!curso) {
            return res.status(404).json({ error: 'Curso no encontrado.' });
        }
        res.status(200).json(curso);
    } catch (err) {
        console.error('Error en GET /api/cursos/:id:', err.message);
        res.status(500).json({ error: 'Error interno al obtener el detalle del curso.' });
    }
});

router.post('/', requireAdmin, validateCurso, async (req, res) => {
    try {
        const idCurso = await cursosService.crearCurso(req.validatedData);
        res.status(201).json({ mensaje: 'Curso creado correctamente', id_curso: idCurso });
    } catch (err) {
        if (err.status === 400) {
            return res.status(400).json({ error: err.message });
        }
        console.error('Error en POST /api/cursos:', err.message);
        res.status(500).json({ error: 'Error interno al guardar el curso.' });
    }
});

router.put('/:id', requireAdmin, validateCurso, async (req, res) => {
    const idCurso = Number(req.params.id);

    if (!Number.isInteger(idCurso) || idCurso <= 0) {
        return res.status(400).json({ error: 'Identificador de curso no válido.' });
    }

    try {
        const actualizado = await cursosService.actualizarCurso(idCurso, req.validatedData);
        if (!actualizado) {
            return res.status(404).json({ error: 'Curso no encontrado.' });
        }
        res.status(200).json({ mensaje: 'Curso actualizado correctamente.' });
    } catch (err) {
        if (err.status === 400) {
            return res.status(400).json({ error: err.message });
        }
        console.error('Error en PUT /api/cursos/:id:', err.message);
        res.status(500).json({ error: 'Error interno al actualizar el curso.' });
    }
});

router.delete('/:id', requireAdmin, async (req, res) => {
    const idCurso = Number(req.params.id);

    if (!Number.isInteger(idCurso) || idCurso <= 0) {
        return res.status(400).json({ error: 'Identificador de curso no válido.' });
    }

    try {
        const desactivado = await cursosService.desactivarCurso(idCurso);
        if (!desactivado) {
            return res.status(404).json({ error: 'Curso no encontrado o ya inactivo.' });
        }
        res.status(200).json({ mensaje: 'Curso desactivado correctamente.' });
    } catch (err) {
        console.error('Error en DELETE /api/cursos/:id:', err.message);
        res.status(500).json({ error: 'Error interno al desactivar el curso.' });
    }
});

module.exports = router;