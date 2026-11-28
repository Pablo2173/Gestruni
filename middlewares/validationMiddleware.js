'use strict';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validación para el registro de alumnos (RF-01.1)
function validateRegister(req, res, next) {
    const { nombre, email, password, confirmPassword } = req.body;

    if (!nombre || !email || !password || nombre.trim() === '' || email.trim() === '') {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const emailLimpio = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(emailLimpio)) {
        return res.status(400).json({ error: 'Formato de correo electrónico inválido.' });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
    }
    if (!/[A-Z]/.test(password)) {
        return res.status(400).json({ error: 'La contraseña debe contener al menos una letra mayúscula.' });
    }
    if (!/[a-z]/.test(password)) {
        return res.status(400).json({ error: 'La contraseña debe contener al menos una letra minúscula.' });
    }
    if (!/[0-9]/.test(password)) {
        return res.status(400).json({ error: 'La contraseña debe contener al menos un número.' });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
    }

    req.validatedData = {
        nombre: nombre.trim(),
        email: emailLimpio,
        password
    };

    next();
}

// Validación para el inicio de sesión (RF-01.2)
function validateLogin(req, res, next) {
    const { email, password } = req.body;

    if (!email || !password || email.trim() === '' || password === '') {
        return res.status(400).json({ error: 'El correo electrónico y la contraseña son obligatorios.' });
    }

    const emailLimpio = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(emailLimpio)) {
        return res.status(400).json({ error: 'Formato de correo electrónico inválido.' });
    }

    req.validatedData = {
        email: emailLimpio,
        password
    };

    next();
}

// Validación para creación y edición de cursos (RF-02)
function validateCurso(req, res, next) {
    const { nombre, id_docente, id_aula, descripcion, fecha_inicio, fecha_fin, horario, plazas, imagen, estado } = req.body;

    if (!nombre || nombre.trim() === '' || !id_docente || !id_aula || !fecha_inicio || !fecha_fin || plazas === undefined) {
        return res.status(400).json({ error: 'Faltan campos obligatorios del curso.' });
    }

    const docenteId = Number(id_docente);
    const aulaId = Number(id_aula);
    const numPlazas = Number(plazas);

    if (!Number.isInteger(docenteId) || docenteId <= 0) {
        return res.status(400).json({ error: 'El docente seleccionado no es válido.' });
    }
    if (!Number.isInteger(aulaId) || aulaId <= 0) {
        return res.status(400).json({ error: 'El aula seleccionada no es válida.' });
    }
    if (!Number.isInteger(numPlazas) || numPlazas <= 0) {
        return res.status(400).json({ error: 'El número de plazas debe ser un entero positivo.' });
    }

    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);
    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
        return res.status(400).json({ error: 'Formato de fechas inválido.' });
    }
    if (fecha_fin < fecha_inicio) {
        return res.status(400).json({ error: 'La fecha de finalización no puede ser anterior a la de inicio.' });
    }

    req.validatedData = {
        nombre: nombre.trim(),
        id_docente: docenteId,
        id_aula: aulaId,
        descripcion: descripcion ? descripcion.trim() : null,
        fecha_inicio,
        fecha_fin,
        horario: horario ? horario.trim() : null,
        plazas: numPlazas,
        imagen: imagen ? imagen.trim() : null,
        estado: estado === 'inactivo' ? 'inactivo' : 'activo'
    };

    next();
}

module.exports = {
    validateRegister,
    validateLogin,
    validateCurso
};