'use strict';

const pool = require('../config/db');

async function obtenerAulasConCursos() {
    const [aulas] = await pool.query(
        `SELECT 
            id_aula,
            nombre,
            edificio,
            planta,
            capacidad,
            equipamiento,
            estado
         FROM aulas
         WHERE estado = 'activa'
         ORDER BY edificio ASC, nombre ASC`
    );

    const [cursos] = await pool.query(
        `SELECT 
            id_curso,
            id_aula,
            nombre,
            horario
         FROM cursos
         WHERE estado = 'activo'
         ORDER BY nombre ASC`
    );

    return aulas.map((aula) => ({
        ...aula,
        cursos: cursos.filter((c) => c.id_aula === aula.id_aula)
    }));
}

module.exports = {
    obtenerAulasConCursos
};