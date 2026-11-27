'use strict';

const express = require('express');
const path = require('node:path');

const app = express();


app.use('/public', express.static(path.join(__dirname, 'public')));


app.use(express.static(path.join(__dirname, 'views')));

module.exports = app;