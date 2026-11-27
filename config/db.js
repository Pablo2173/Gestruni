'use strict';

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aw_practica',
    waitForConnections: true,
    connectionLimit: 10
});

// Comprobación inicial al arrancar el servidor
pool.getConnection()
    .then((connection) => {
        console.log('Conectado a la BD aw_practica en MariaDB');
        connection.release();
    })
    .catch((err) => {
        console.error('Error al conectar con MariaDB:', err.message);
    });

module.exports = pool;