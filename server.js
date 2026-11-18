'use strict';

const app = require('./app');

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, (err) => {
    if (err) {
        console.error('Error al iniciar el servidor:', err.message);
        process.exitCode = 1;
        return;
    } else {
        console.log(`Servidor escuchando en el puerto ${PORT}`);
    }
});