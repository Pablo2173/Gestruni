'use strict';

const pool = require('../config/db');

async function obtenerMatriculasPorUsuario(idUsuario) {
    const [filas] = await pool.query(
        `SELECT 
            m.id_matricula,
            m.id_usuario,
            m.id_curso,
            m.fecha_matricula,
            m.estado,
            c.nombre AS nombre_curso,
            c.fecha_inicio,
            c.fecha_fin,
            c.horario,
            c.estado AS estado_curso,
            d.nombre AS nombre_docente,
            a.nombre AS nombre_aula
        FROM matriculas m
        INNER JOIN cursos c ON m.id_curso = c.id_curso
        INNER JOIN docentes d ON c.id_docente = d.id_docente
        INNER JOIN aulas a ON c.id_aula = a.id_aula
        WHERE m.id_usuario = ?
        ORDER BY m.fecha_matricula DESC`,
        [idUsuario]
    );
    return filas;
}

async function obtenerTodasLasMatriculas() {
    const [filas] = await pool.query(
        `SELECT 
            m.id_matricula,
            m.id_usuario,
            m.id_curso,
            m.fecha_matricula,
            m.estado,
            u.nombre AS nombre_alumno,
            u.email AS email_alumno,
            c.nombre AS nombre_curso,
            c.fecha_inicio,
            c.fecha_fin,
            d.nombre AS nombre_docente,
            a.nombre AS nombre_aula
        FROM matriculas m
        INNER JOIN usuarios u ON m.id_usuario = u.id_usuario
        INNER JOIN cursos c ON m.id_curso = c.id_curso
        INNER JOIN docentes d ON c.id_docente = d.id_docente
        INNER JOIN aulas a ON c.id_aula = a.id_aula
        ORDER BY m.fecha_matricula DESC`
    );
    return filas;
}

async function matricularAlumno(idUsuario, idCurso) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Verificar que el curso existe, está activo y calcular plazas disponibles bloqueando fila
        const [cursos] = await connection.query(
            `SELECT 
                c.id_curso,
                c.nombre,
                c.plazas,
                c.estado,
                (SELECT COUNT(*) FROM matriculas m WHERE m.id_curso = c.id_curso AND m.estado = 'activa') AS matriculados
             FROM cursos c
             WHERE c.id_curso = ?
             FOR UPDATE`,
            [idCurso]
        );

        if (cursos.length === 0) {
            const err = new Error('El curso seleccionado no existe.');
            err.status = 404;
            throw err;
        }

        const curso = cursos[0];
        if (curso.estado !== 'activo') {
            const err = new Error('No es posible matricularse en un curso inactivo.');
            err.status = 400;
            throw err;
        }

        if (Number(curso.plazas) - Number(curso.matriculados) <= 0) {
            const err = new Error('No quedan plazas disponibles en este curso.');
            err.status = 400;
            throw err;
        }

        // 2. Comprobar si el alumno ya tiene una matrícula en este curso
        const [existentes] = await connection.query(
            'SELECT id_matricula, estado FROM matriculas WHERE id_usuario = ? AND id_curso = ?',
            [idUsuario, idCurso]
        );

        let idMatricula;
        if (existentes.length > 0) {
            if (existentes[0].estado === 'activa') {
                const err = new Error('Ya estás matriculado en este curso.');
                err.status = 409;
                throw err;
            }

            // Si estuvo cancelada anteriormente, la reactivamos con la fecha actual
            idMatricula = existentes[0].id_matricula;
            await connection.query(
                `UPDATE matriculas 
                 SET estado = 'activa', fecha_matricula = NOW() 
                 WHERE id_matricula = ?`,
                [idMatricula]
            );
        } else {
            const [insertResult] = await connection.query(
                `INSERT INTO matriculas (id_usuario, id_curso, fecha_matricula, estado)
                 VALUES (?, ?, NOW(), 'activa')`,
                [idUsuario, idCurso]
            );
            idMatricula = insertResult.insertId;
        }

        await connection.commit();
        return { id_matricula: idMatricula, nombre_curso: curso.nombre };
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

async function cancelarMatricula(idMatricula, usuario) {
    const [filas] = await pool.query(
        'SELECT id_matricula, id_usuario, estado FROM matriculas WHERE id_matricula = ?',
        [idMatricula]
    );

    if (filas.length === 0) {
        const err = new Error('Matrícula no encontrada.');
        err.status = 404;
        throw err;
    }

    const matricula = filas[0];

    // Solo el propio alumno dueño de la matrícula o un admin puede cancelarla
    if (usuario.rol !== 'admin' && matricula.id_usuario !== usuario.id_usuario) {
        const err = new Error('No tienes permiso para cancelar esta matrícula.');
        err.status = 403;
        throw err;
    }

    if (matricula.estado !== 'activa') {
        const err = new Error('Esta matrícula ya se encuentra cancelada.');
        err.status = 400;
        throw err;
    }

    await pool.query(
        `UPDATE matriculas SET estado = 'cancelada' WHERE id_matricula = ?`,
        [idMatricula]
    );

    return true;
}

module.exports = {
    obtenerMatriculasPorUsuario,
    obtenerTodasLasMatriculas,
    matricularAlumno,
    cancelarMatricula
};