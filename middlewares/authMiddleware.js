'use strict';

function requireAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Debes iniciar sesión para realizar esta acción.' });
    }
    next();
}

function requireAdmin(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Debes iniciar sesión para realizar esta acción.' });
    }
    if (req.session.user.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
    next();
}

function requireAlumno(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Debes iniciar sesión para realizar esta acción.' });
    }
    if (req.session.user.rol !== 'alumno') {
        return res.status(403).json({ error: 'Solo los alumnos pueden realizar esta operación.' });
    }
    next();
}

module.exports = {
    requireAuth,
    requireAdmin,
    requireAlumno
};