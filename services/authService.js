'use strict';

const bcrypt = require('bcrypt');
const pool = require('../config/db');

const SALT_ROUNDS = 10;

async function registrarAlumno({ nombre, email, password }) {
    const [existentes] = await pool.query(
        'SELECT id_usuario FROM usuarios WHERE email = ?',
        [email]
    );

    if (existentes.length > 0) {
        const error = new Error('Ya existe una cuenta registrada con ese correo electrónico.');
        error.status = 409;
        throw error;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const [resultado] = await pool.query(
        `INSERT INTO usuarios (nombre, email, password, rol, fecha_registro, activo)
         VALUES (?, ?, ?, 'alumno', NOW(), 1)`,
        [nombre, email, passwordHash]
    );

    return {
        id_usuario: resultado.insertId,
        nombre,
        email,
        rol: 'alumno'
    };
}

async function autenticarUsuario(email, password) {
    const [filas] = await pool.query(
        'SELECT id_usuario, nombre, email, password, rol, activo FROM usuarios WHERE email = ?',
        [email]
    );

    if (filas.length === 0) {
        return null;
    }

    const usuario = filas[0];

    if (!usuario.activo) {
        return null;
    }

    const esHashBcrypt = usuario.password.startsWith('$2a$') || usuario.password.startsWith('$2b$');
    let coincide = false;

    if (esHashBcrypt) {
        coincide = await bcrypt.compare(password, usuario.password);
    } else if (usuario.password === password) {
        coincide = true;
        const nuevoHash = await bcrypt.hash(password, SALT_ROUNDS);
        await pool.query(
            'UPDATE usuarios SET password = ? WHERE id_usuario = ?',
            [nuevoHash, usuario.id_usuario]
        );
    }

    if (!coincide) {
        return null;
    }

    return {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
    };
}

async function obtenerPerfilUsuario(idUsuario) {
    const [filas] = await pool.query(
        `SELECT id_usuario, nombre, email, rol, fecha_registro, activo
         FROM usuarios
         WHERE id_usuario = ?`,
        [idUsuario]
    );

    if (filas.length === 0) {
        return null;
    }

    return filas[0];
}

async function actualizarPerfilUsuario(idUsuario, { nombre, email, password }) {
    const [duplicados] = await pool.query(
        'SELECT id_usuario FROM usuarios WHERE email = ? AND id_usuario <> ?',
        [email, idUsuario]
    );

    if (duplicados.length > 0) {
        const error = new Error('Ese correo electrónico ya está siendo utilizado por otra cuenta.');
        error.status = 409;
        throw error;
    }

    if (password && password.trim().length > 0) {
        const passwordHash = await bcrypt.hash(password.trim(), SALT_ROUNDS);
        await pool.query(
            'UPDATE usuarios SET nombre = ?, email = ?, password = ? WHERE id_usuario = ?',
            [nombre, email, passwordHash, idUsuario]
        );
    } else {
        await pool.query(
            'UPDATE usuarios SET nombre = ?, email = ? WHERE id_usuario = ?',
            [nombre, email, idUsuario]
        );
    }

    return obtenerPerfilUsuario(idUsuario);
}

module.exports = {
    registrarAlumno,
    autenticarUsuario,
    obtenerPerfilUsuario,
    actualizarPerfilUsuario
};