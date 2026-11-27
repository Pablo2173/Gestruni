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

module.exports = router;