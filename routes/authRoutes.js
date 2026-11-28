'use strict';

const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { requireAuth } = require('../middlewares/authMiddleware');
const { validateRegister, validateLogin } = require('../middlewares/validationMiddleware');

router.post('/register', validateRegister, async (req, res) => {
    try {
        const nuevoUsuario = await authService.registrarAlumno(req.validatedData);
        req.session.user = nuevoUsuario;
        res.status(201).json({
            mensaje: 'Registro completado correctamente.',
            usuario: nuevoUsuario
        });
    } catch (err) {
        if (err.status === 409) {
            return res.status(409).json({ error: err.message });
        }
        console.error('Error en POST /api/auth/register:', err.message);
        res.status(500).json({ error: 'Error interno al registrar el usuario.' });
    }
});

router.post('/login', validateLogin, async (req, res) => {
    try {
        const usuario = await authService.autenticarUsuario(
            req.validatedData.email,
            req.validatedData.password
        );

        if (!usuario) {
            return res.status(401).json({ error: 'Correo electrónico o contraseña incorrectos.' });
        }

        req.session.user = usuario;
        res.status(200).json({
            mensaje: 'Sesión iniciada correctamente.',
            usuario
        });
    } catch (err) {
        console.error('Error en POST /api/auth/login:', err.message);
        res.status(500).json({ error: 'Error interno al iniciar sesión.' });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err.message);
            return res.status(500).json({ error: 'No se pudo cerrar la sesión.' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ mensaje: 'Sesión cerrada correctamente.' });
    });
});

router.get('/me', (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'No hay ninguna sesión activa.' });
    }
    res.status(200).json({ usuario: req.session.user });
});

router.get('/perfil', requireAuth, async (req, res) => {
    try {
        const perfil = await authService.obtenerPerfilUsuario(req.session.user.id_usuario);
        if (!perfil) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        res.status(200).json({ perfil });
    } catch (err) {
        console.error('Error en GET /api/auth/perfil:', err.message);
        res.status(500).json({ error: 'Error interno al obtener el perfil.' });
    }
});

router.put('/perfil', requireAuth, async (req, res) => {
    const nombre = typeof req.body.nombre === 'string' ? req.body.nombre.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password.trim() : '';

    if (nombre.length < 2 || nombre.length > 100) {
        return res.status(400).json({ error: 'El nombre debe tener entre 2 y 100 caracteres.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 100) {
        return res.status(400).json({ error: 'Introduce un correo electrónico válido.' });
    }

    if (password && (password.length < 6 || password.length > 100)) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    try {
        const perfilActualizado = await authService.actualizarPerfilUsuario(
            req.session.user.id_usuario,
            { nombre, email, password }
        );

        req.session.user = {
            id_usuario: perfilActualizado.id_usuario,
            nombre: perfilActualizado.nombre,
            email: perfilActualizado.email,
            rol: perfilActualizado.rol
        };

        res.status(200).json({
            mensaje: 'Perfil actualizado correctamente.',
            perfil: perfilActualizado,
            usuario: req.session.user
        });
    } catch (err) {
        if (err.status === 409) {
            return res.status(409).json({ error: err.message });
        }
        console.error('Error en PUT /api/auth/perfil:', err.message);
        res.status(500).json({ error: 'Error interno al actualizar el perfil.' });
    }
});

module.exports = router;