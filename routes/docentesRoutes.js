'use strict';

const express = require('express');
const router = express.Router();
const docentesService = require('../services/docentesService');

router.get('/', async (req, res) => {
    try {
        const docentes = await docentesService.obtenerDocentesConCursos();
        res.status(200).json(docentes);
    } catch (err) {
        console.error('Error en GET /api/docentes:', err.message);
        res.status(500).json({ error: 'No se pudo obtener el listado de docentes.' });
    }
});

module.exports = router;