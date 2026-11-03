'use strict';

//array inicial de cursos
const cursos = [
    {
        identificador: 'ABD',
        nombre: 'Ampliación de bases de datos',
        categoria: 'Bases de datos',
        duracion: '40 horas',
        plazasDisponibles: 60
    },
    {
        identificador: 'AW',
        nombre: 'Aplicaciones web',
        categoria: 'Programación web',
        duracion: '30 horas',
        plazasDisponibles: 60
    },
    {
        identificador: 'IS-1',
        nombre: 'Ingeniería del software 1',
        categoria: 'Modelado de software',
        duracion: '45 horas',
        plazasDisponibles: 60
    }
];

//localiza el contenedor html donde se muestran los cursos
const catalogoCursos = document.querySelector('#catalogo-cursos');

//función reutilizable para crear una línea de información de un curso (Categoría, Programación web)
//crea un nuevo elemento en memoria (Categoría en negrita <strong> y Programación web en texto normal)
function crearDatoCurso(etiqueta, valor) {
    const dato = document.createElement('p');
    dato.className = 'mb-2';

    const nombreDato = document.createElement('strong');
    nombreDato.textContent = `${etiqueta}: `;

    dato.append(nombreDato, document.createTextNode(valor));
    return dato;
}

//establece las dimensiones de la tarjeta y añade la información del curso usando la función anterior
function crearTarjetaCurso(curso) {
    /*
        Diseño responsive de las tarjetas usando clases de Bootstrap:
        col-12 -> ocupa todo el ancho en móvil (1 tarjeta por fila)
        col-md-6 -> ocupa la mitad del ancho en pantallas medianas (2 tarjetas por fila)
        col-xl-4 -> ocupa un tercio del ancho en pantallas grandes (3 tarjetas por fila)
    */
    const columna = document.createElement('div');
    columna.className = 'col-12 col-md-6 col-xl-4';

    const tarjeta = document.createElement('article');
    tarjeta.className = 'card h-100 shadow-sm';

    const cuerpoTarjeta = document.createElement('div');
    cuerpoTarjeta.className = 'card-body';

    const titulo = document.createElement('h3');
    titulo.className = 'card-title h5';
    titulo.textContent = curso.nombre;

    const identificador = crearDatoCurso('Identificador', curso.identificador);
    const categoria = crearDatoCurso('Categoría', curso.categoria);
    const duracion = crearDatoCurso('Duración', curso.duracion);
    const plazas = crearDatoCurso('Plazas disponibles', curso.plazasDisponibles);

    cuerpoTarjeta.append(titulo, identificador, categoria, duracion, plazas);
    tarjeta.append(cuerpoTarjeta);
    columna.append(tarjeta);

    return columna;
}

function mostrarCursos() {
    //vacía el contenedor de cursos antes de mostrar los cursos actuales
    catalogoCursos.replaceChildren();

    //si no hay cursos, muestra un mensaje en lugar de las tarjetas
    if (cursos.length === 0) {
        const mensaje = document.createElement('p');
        mensaje.className = 'col-12';
        mensaje.textContent = 'No hay cursos disponibles en este momento.';
        catalogoCursos.append(mensaje);
        return;
    }

    //recorre el array de cursos y crea una tarjeta para cada curso, añadiéndola al contenedor
    cursos.forEach((curso) => {
        catalogoCursos.append(crearTarjetaCurso(curso));
    });
}

mostrarCursos();
