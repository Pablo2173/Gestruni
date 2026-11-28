'use strict';

const pool = require('../config/db');

async function obtenerCursos() {
    const [filas] = await pool.query(
        `SELECT 
            c.id_curso,
            c.nombre,
            c.id_docente,
            c.id_aula,
            c.descripcion,
            c.fecha_inicio,
            c.fecha_fin,
            c.horario,
            c.plazas,
            c.imagen,
            c.estado,
            d.nombre AS nombre_docente,
            a.nombre AS nombre_aula,
            a.capacidad AS capacidad_aula,
            COUNT(m.id_matricula) AS matriculados,
            (c.plazas - COUNT(m.id_matricula)) AS plazas_disponibles
        FROM cursos c
        INNER JOIN docentes d ON c.id_docente = d.id_docente
        INNER JOIN aulas a ON c.id_aula = a.id_aula
        LEFT JOIN matriculas m 
            ON c.id_curso = m.id_curso AND m.estado = 'activa'
        GROUP BY c.id_curso
        ORDER BY c.fecha_inicio ASC`
    );
    return filas;
}

async function obtenerCursoPorId(idCurso) {
    const [filas] = await pool.query(
        `SELECT 
            c.id_curso,
            c.nombre,
            c.id_docente,
            c.id_aula,
            c.descripcion,
            c.fecha_inicio,
            c.fecha_fin,
            c.horario,
            c.plazas,
            c.imagen,
            c.estado,
            d.nombre AS nombre_docente,
            d.especialidad AS especialidad_docente,
            d.email AS email_docente,
            a.nombre AS nombre_aula,
            a.edificio AS edificio_aula,
            a.capacidad AS capacidad_aula,
            COUNT(m.id_matricula) AS matriculados,
            (c.plazas - COUNT(m.id_matricula)) AS plazas_disponibles
        FROM cursos c
        INNER JOIN docentes d ON c.id_docente = d.id_docente
        INNER JOIN aulas a ON c.id_aula = a.id_aula
        LEFT JOIN matriculas m 
            ON c.id_curso = m.id_curso AND m.estado = 'activa'
        WHERE c.id_curso = ?
        GROUP BY c.id_curso`,
        [idCurso]
    );

    return filas.length > 0 ? filas[0] : null;
}

async function obtenerOpcionesFormulario() {
    const [docentes] = await pool.query(
        'SELECT id_docente, nombre, especialidad FROM docentes ORDER BY nombre ASC'
    );
    const [aulas] = await pool.query(
        'SELECT id_aula, nombre, edificio, capacidad FROM aulas ORDER BY nombre ASC'
    );
    return { docentes, aulas };
}

async function crearCurso(datos) {
    const {
        nombre,
        id_docente,
        id_aula,
        descripcion,
        fecha_inicio,
        fecha_fin,
        horario,
        plazas,
        imagen
    } = datos;

    // Regla de negocio 3.3: no puede haber dos cursos activos en el mismo aula con fechas solapadas
    const [solapamientos] = await pool.query(
        `SELECT id_curso FROM cursos
         WHERE id_aula = ?
           AND estado = 'activo'
           AND fecha_inicio <= ?
           AND fecha_fin >= ?`,
        [id_aula, fecha_fin, fecha_inicio]
    );

    if (solapamientos.length > 0) {
        const error = new Error('El aula seleccionada ya está ocupada por otro curso activo en esas fechas.');
        error.status = 400;
        throw error;
    }

    const [resultado] = await pool.query(
        `INSERT INTO cursos 
            (nombre, id_docente, id_aula, descripcion, fecha_inicio, fecha_fin, horario, plazas, imagen, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo')`,
        [
            nombre,
            id_docente,
            id_aula,
            descripcion || null,
            fecha_inicio,
            fecha_fin,
            horario || null,
            plazas,
            imagen || null
        ]
    );

    return resultado.insertId;
}

async function actualizarCurso(idCurso, datos) {
    const {
        nombre,
        id_docente,
        id_aula,
        descripcion,
        fecha_inicio,
        fecha_fin,
        horario,
        plazas,
        imagen,
        estado
    } = datos;

    // Comprobar solapamiento de aula en las mismas fechas (excluyendo este mismo curso)
    const [solapamientos] = await pool.query(
        `SELECT id_curso FROM cursos
         WHERE id_aula = ?
           AND id_curso <> ?
           AND estado = 'activo'
           AND fecha_inicio <= ?
           AND fecha_fin >= ?`,
        [id_aula, idCurso, fecha_fin, fecha_inicio]
    );

    if (solapamientos.length > 0) {
        const error = new Error('El aula seleccionada ya está ocupada por otro curso activo en esas fechas.');
        error.status = 400;
        throw error;
    }

    const [resultado] = await pool.query(
        `UPDATE cursos
         SET nombre = ?,
             id_docente = ?,
             id_aula = ?,
             descripcion = ?,
             fecha_inicio = ?,
             fecha_fin = ?,
             horario = ?,
             plazas = ?,
             imagen = ?,
             estado = ?
         WHERE id_curso = ?`,
        [
            nombre,
            id_docente,
            id_aula,
            descripcion || null,
            fecha_inicio,
            fecha_fin,
            horario || null,
            plazas,
            imagen || null,
            estado || 'activo',
            idCurso
        ]
    );

    return resultado.affectedRows > 0;
}

async function desactivarCurso(idCurso) {
    const [resultado] = await pool.query(
        `UPDATE cursos SET estado = 'inactivo' WHERE id_curso = ? AND estado = 'activo'`,
        [idCurso]
    );
    return resultado.affectedRows > 0;
}

module.exports = {
    obtenerCursos,
    obtenerCursoPorId,
    obtenerOpcionesFormulario,
    crearCurso,
    actualizarCurso,
    desactivarCurso
};