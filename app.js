'use strict';

const express = require('express');
const path = require('node:path');
const session = require('express-session');

const authRoutes = require('./routes/authRoutes');
const cursosRoutes = require('./routes/cursosRoutes');
const matriculasRoutes = require('./routes/matriculasRoutes');
const docentesRoutes = require('./routes/docentesRoutes');
const aulasRoutes = require('./routes/aulasRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Motor de plantillas EJS para compartir header y footer
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'gestruni_aw_2026_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// Pasar usuario de sesión a todas las vistas EJS (sin parpadeo en la navbar)
app.use((req, res, next) => {
    res.locals.usuario = req.session?.user || null;
    next();
});

// Rutas de la API REST
app.use('/api/auth', authRoutes);
app.use('/api/cursos', cursosRoutes);
app.use('/api/matriculas', matriculasRoutes);
app.use('/api/docentes', docentesRoutes);
app.use('/api/aulas', aulasRoutes);
app.use('/api/admin', adminRoutes);

// Archivos estáticos (CSS, JS, imágenes y Bootstrap Icons)
app.use('/public', express.static(path.join(__dirname, 'public')));

// Compatibilidad: redirigir cualquier URL acabada en .html a su ruta limpia
app.get('/:pagina.html', (req, res) => {
    const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    res.redirect(301, `/${req.params.pagina}${query}`);
});

// Vistas públicas EJS
const paginasPublicas = [
    'index',
    'cursos',
    'detalles_cursos',
    'docentes',
    'aulas',
    'accesibilidad',
    'login',
    'register',
    'logout'
];

app.get('/', (req, res) => res.render('index'));

paginasPublicas.forEach((pagina) => {
    app.get(`/${pagina}`, (req, res) => {
        res.render(pagina);
    });
});

// Vistas protegidas por sesión / rol
app.get('/matriculas', (req, res) => {
    if (!req.session?.user) return res.redirect('/login');
    res.render('matriculas');
});

app.get('/perfil', (req, res) => {
    if (!req.session?.user) return res.redirect('/login');
    res.render('perfil');
});

app.get('/administracion', (req, res) => {
    if (!req.session?.user || req.session.user.rol !== 'admin') {
        return res.redirect('/');
    }
    res.render('administracion');
});

// Manejador 404 para rutas no encontradas
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'Endpoint no encontrado.' });
    }
    res.status(404).render('index');
});

// Manejador global de errores
app.use((err, req, res, next) => {
    console.error('Error no controlado:', err.message);
    res.status(err.status || 500).json({
        error: 'Se ha producido un error interno en el servidor.'
    });
});

module.exports = app;