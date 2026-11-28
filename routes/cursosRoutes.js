'use strict';

const express = require('express');
const router = express.Router();
const cursosService = require('../services/cursosService');

router.get('/', async (req, res) => {
    try {
        const cursos = await cursosService.obtenerCursos();
        res.status(200).json(cursos);
    } catch (err) {
        console.error('Error en GET /api/cursos:', err.message);
        res.status(500).json({ error: 'No se pudieron obtener los cursos de la base de datos.' });
    }
});

router.get('/opciones', async (req, res) => {
    try {
        const opciones = await cursosService.obtenerOpcionesFormulario();
        res.status(200).json(opciones);
    } catch (err) {
        console.error('Error en GET /api/cursos/opciones:', err.message);
        res.status(500).json({ error: 'No se pudieron cargar docentes y aulas.' });
    }
});

router.post('/', async (req, res) => {
    const { nombre, id_docente, id_aula, fecha_inicio, fecha_fin, plazas } = req.body;

    if (!nombre || !nombre.trim() || !id_docente || !id_aula || !fecha_inicio || !fecha_fin || !plazas) {
        return res.status(400).json({ error: 'Faltan campos obligatorios para crear el curso.' });
    }

    if (Number(plazas) <= 0 || !Number.isInteger(Number(plazas))) {
        return res.status(400).json({ error: 'El número de plazas debe ser un entero positivo.' });
    }

    if (fecha_fin < fecha_inicio) {
        return res.status(400).json({ error: 'La fecha de fin no puede ser anterior a la fecha de inicio.' });
    }

    try {
        const idCurso = await cursosService.crearCurso({
            ...req.body,
            nombre: nombre.trim()
        });
        res.status(201).json({ mensaje: 'Curso creado correctamente', id_curso: idCurso });
    } catch (err) {
        if (err.status === 400) {
            return res.status(400).json({ error: err.message });
        }
        console.error('Error en POST /api/cursos:', err.message);
        res.status(500).json({ error: 'Error interno al guardar el curso.' });
    }
});

router.delete('/:id', async (req, res) => {
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