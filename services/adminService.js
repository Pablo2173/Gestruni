'use strict';

const pool = require('../config/db');

async function obtenerResumenSistema() {
    const [[{ total_cursos }]] = await pool.query(
        "SELECT COUNT(*) AS total_cursos FROM cursos WHERE estado = 'activo'"
    );
    const [[{ total_usuarios }]] = await pool.query(
        'SELECT COUNT(*) AS total_usuarios FROM usuarios WHERE activo = 1'
    );
    const [[{ total_matriculas }]] = await pool.query(
        "SELECT COUNT(*) AS total_matriculas FROM matriculas WHERE estado = 'activa'"
    );
    const [[{ total_docentes }]] = await pool.query(
        'SELECT COUNT(*) AS total_docentes FROM docentes WHERE activo = 1'
    );
    const [[{ total_aulas }]] = await pool.query(
        "SELECT COUNT(*) AS total_aulas FROM aulas WHERE estado = 'activa'"
    );

    return {
        total_cursos,
        total_usuarios,
        total_matriculas,
        total_docentes,
        total_aulas
    };
}

async function obtenerTodosLosUsuarios() {
    const [filas] = await pool.query(
        `SELECT 
            u.id_usuario,
            u.nombre,
            u.email,
            u.rol,
            u.fecha_registro,
            u.activo,
            COUNT(m.id_matricula) AS matriculas_activas
         FROM usuarios u
         LEFT JOIN matriculas m 
            ON u.id_usuario = m.id_usuario AND m.estado = 'activa'
         GROUP BY u.id_usuario
         ORDER BY u.rol ASC, u.nombre ASC`
    );
    return filas;
}

async function actualizarUsuarioAdmin(idUsuarioObjetivo, { rol, activo }, idAdminActual) {
    if (idUsuarioObjetivo === idAdminActual) {
        const err = new Error('No puedes modificar tu propio rol ni desactivar tu propia cuenta.');
        err.status = 400;
        throw err;
    }

    if (!['admin', 'alumno'].includes(rol)) {
        const err = new Error('Rol no válido.');
        err.status = 400;
        throw err;
    }

    const activoValor = activo ? 1 : 0;

    const [resultado] = await pool.query(
        'UPDATE usuarios SET rol = ?, activo = ? WHERE id_usuario = ?',
        [rol, activoValor, idUsuarioObjetivo]
    );

    return resultado.affectedRows > 0;
}

module.exports = {
    obtenerResumenSistema,
    obtenerTodosLosUsuarios,
    actualizarUsuarioAdmin
};