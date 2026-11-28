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
        WHERE c.estado = 'activo'
        GROUP BY c.id_curso
        ORDER BY c.id_curso ASC
    `;

    const [filas] = await pool.query(sql);
    return filas;
}

async function obtenerOpcionesFormulario() {
    const [docentes] = await pool.query(
        'SELECT id_docente, nombre, especialidad FROM docentes WHERE activo = 1 ORDER BY nombre ASC'
    );
    const [aulas] = await pool.query(
        "SELECT id_aula, nombre, edificio, capacidad FROM aulas WHERE estado = 'activa' ORDER BY nombre ASC"
    );
    return { docentes, aulas };
}

async function crearCurso(datos) {
    const {
        id_docente,
        id_aula,
        nombre,
        descripcion,
        fecha_inicio,
        fecha_fin,
        horario,
        plazas,
        imagen
    } = datos;

    const [docentes] = await pool.query(
        'SELECT id_docente FROM docentes WHERE id_docente = ? AND activo = 1',
        [id_docente]
    );
    if (docentes.length === 0) {
        const error = new Error('El docente seleccionado no existe o no está activo.');
        error.status = 400;
        throw error;
    }

    const [aulas] = await pool.query(
        "SELECT id_aula, capacidad FROM aulas WHERE id_aula = ? AND estado = 'activa'",
        [id_aula]
    );
    if (aulas.length === 0) {
        const error = new Error('El aula seleccionada no existe o está inactiva.');
        error.status = 400;
        throw error;
    }
    if (Number(plazas) > aulas[0].capacidad) {
        const error = new Error(`Las plazas (${plazas}) superan la capacidad del aula (${aulas[0].capacidad}).`);
        error.status = 400;
        throw error;
    }

    const sql = `
        INSERT INTO cursos 
            (id_docente, id_aula, nombre, descripcion, fecha_inicio, fecha_fin, horario, plazas, imagen, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo')
    `;
    const params = [
        Number(id_docente),
        Number(id_aula),
        nombre,
        descripcion || null,
        fecha_inicio,
        fecha_fin,
        horario || null,
        Number(plazas),
        imagen || null
    ];

    const [resultado] = await pool.query(sql, params);
    return resultado.insertId;
}

async function desactivarCurso(idCurso) {
    const sql = `
        UPDATE cursos 
        SET estado = 'inactivo' 
        WHERE id_curso = ? AND estado = 'activo'
    `;
    const [resultado] = await pool.query(sql, [Number(idCurso)]);
    return resultado.affectedRows > 0;
}

module.exports = {
    obtenerCursos,
    obtenerOpcionesFormulario,
    crearCurso,
    desactivarCurso
};