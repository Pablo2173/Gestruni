'use strict';

const pool = require('../config/db');

async function obtenerCursos() {
    const sql = `
        SELECT 
            c.id_curso,
            c.nombre,
            c.descripcion,
            c.fecha_inicio,
            c.fecha_fin,
            c.horario,
            c.plazas,
            (c.plazas - COUNT(m.id_matricula)) AS plazas_disponibles,
            c.imagen,
            c.estado,
            d.nombre AS nombre_docente,
            a.nombre AS nombre_aula
        FROM cursos c
        INNER JOIN docentes d ON c.id_docente = d.id_docente
        INNER JOIN aulas a ON c.id_aula = a.id_aula
        LEFT JOIN matriculas m ON c.id_curso = m.id_curso AND m.estado = 'activa'
        GROUP BY c.id_curso
        ORDER BY c.id_curso ASC
    `;

    const [filas] = await pool.query(sql);
    return filas;
}

module.exports = {
    obtenerCursos
};