'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const dataFile = path.join(__dirname, 'data.json');

const initialData = {
    courses: [
        {
            id: 'ABD',
            nombre: 'Ampliación de bases de datos',
            categoria: 'Bases de datos',
            duracion: '40 horas',
            plazasDisponibles: 60
        },
        {
            id: 'AW',
            nombre: 'Aplicaciones web',
            categoria: 'Programación web',
            duracion: '30 horas',
            plazasDisponibles: 60
        },
        {
            id: 'IS-1',
            nombre: 'Ingeniería del software 1',
            categoria: 'Modelado de software',
            duracion: '45 horas',
            plazasDisponibles: 60
        }
    ]
};

async function loadDatabase() {
    await fs.writeFile(dataFile, `${JSON.stringify(initialData, null, 2)}\n`, 'utf8');
    console.log('Base de datos JSON inicializada con 3 cursos.');
}

loadDatabase().catch((error) => {
    console.error('No se pudo inicializar la base de datos:', error);
    process.exitCode = 1;
});