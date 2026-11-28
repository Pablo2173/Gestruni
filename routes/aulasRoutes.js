'use strict';

const express = require('express');
const router = express.Router();
const aulasService = require('../services/aulasService');

router.get('/', async (req, res) => {
    try {
        const aulas = await aulasService.obtenerAulasConCursos();
        res.status(200).json(aulas);
    } catch (err) {
        console.error('Error en GET /api/aulas:', err.message);
        res.status(500).json({ error: 'No se pudo obtener el listado de aulas.' });
    }
});

module.exports = router;