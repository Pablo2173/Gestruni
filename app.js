'use strict';

const express = require('express');
const path = require('node:path');
const cursosRoutes = require('./routes/cursosRoutes');

const app = express();

app.use(express.json());

app.use('/api/cursos', cursosRoutes);

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(express.static(path.join(__dirname, 'views')));

module.exports = app;