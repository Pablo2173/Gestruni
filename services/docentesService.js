'use strict';

const pool = require('../config/db');

async function obtenerDocentesConCursos() {
    const [docentes] = await pool.query(
        `SELECT 
            id_docente,
            nombre,
            email,
            especialidad,
            telefono,
            foto,
            activo
         FROM docentes
         WHERE activo = 1
         ORDER BY nombre ASC`
    );

    const [cursos] = await pool.query(
        `SELECT 
            id_curso,
            id_docente,
            nombre,
            horario
         FROM cursos
         WHERE estado = 'activo'
         ORDER BY nombre ASC`
    );

    return docentes.map((docente) => ({
        ...docente,
        cursos: cursos.filter((c) => c.id_docente === docente.id_docente)
    }));
}

module.exports = {
    obtenerDocentesConCursos
};