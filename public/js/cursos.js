'use strict';

let cursos = [];

// Localiza el contenedor HTML donde se muestran los cursos
const catalogoCursos = document.querySelector('#catalogo-cursos');

// Localiza los elementos del formulario de alta de cursos
const altaCursoForm = document.querySelector('#alta-curso-form');
const identificadorCurso = document.querySelector('#curso-identificador');
const nombreCurso = document.querySelector('#curso-nombre');
const categoriaCurso = document.querySelector('#curso-categoria');
const duracionCurso = document.querySelector('#curso-duracion');
const plazasCurso = document.querySelector('#curso-plazas');

// Localiza los elementos del buscador de cursos y modales
const busquedaCursos = document.querySelector('#busqueda-cursos');
const botonAltaCurso = document.querySelector('#boton-alta-curso');
const altaCurso = document.querySelector('#alta-curso');
const modalConfirmacion = document.querySelector('#confirmar-eliminacion');
const mensajeConfirmacion = document.querySelector('#mensaje-confirmar-eliminacion');
const borrarCurso = document.querySelector('#borrar-curso');
const modalEliminacion = modalConfirmacion ? new bootstrap.Modal(modalConfirmacion) : null;
let cursoPendienteEliminarId;

if (altaCurso && botonAltaCurso) {
    altaCurso.addEventListener('shown.bs.collapse', () => {
        botonAltaCurso.classList.replace('btn-success', 'btn-secondary');
    });

    altaCurso.addEventListener('hidden.bs.collapse', () => {
        botonAltaCurso.classList.replace('btn-secondary', 'btn-success');
    });
}

// Función reutilizable para crear una línea de información de un curso sin innerHTML
function crearDatoCurso(etiqueta, valor) {
    const dato = document.createElement('p');
    dato.className = 'mb-2';

    const nombreDato = document.createElement('strong');
    nombreDato.textContent = `${etiqueta}: `;

    dato.append(nombreDato, document.createTextNode(valor ?? 'No disponible'));
    return dato;
}

// Crea la tarjeta de cada curso con los campos procedentes de MariaDB
function crearTarjetaCurso(curso) {
    const columna = document.createElement('div');
    columna.className = 'col-12 col-md-6 col-xl-4';

    const tarjeta = document.createElement('article');
    tarjeta.className = 'card h-100 shadow-sm';

    const cuerpoTarjeta = document.createElement('div');
    cuerpoTarjeta.className = 'card-body d-flex flex-column';

    const titulo = document.createElement('h3');
    titulo.className = 'card-title h5';
    titulo.textContent = curso.nombre;

    const descripcion = document.createElement('p');
    descripcion.className = 'card-text text-muted';
    descripcion.textContent = curso.descripcion || '';

    const docente = crearDatoCurso('Docente', curso.nombre_docente);
    const aula = crearDatoCurso('Aula', curso.nombre_aula);
    const horario = crearDatoCurso('Horario', curso.horario);
    const plazas = crearDatoCurso(
        'Plazas disponibles',
        `${curso.plazas_disponibles} / ${curso.plazas}`
    );

    const botonEliminar = document.createElement('button');
    botonEliminar.className = 'btn btn-danger align-self-start mt-auto';
    botonEliminar.type = 'button';
    botonEliminar.textContent = 'Eliminar';
    botonEliminar.addEventListener('click', () => {
        cursoPendienteEliminarId = curso.id_curso;
        if (mensajeConfirmacion) {
            mensajeConfirmacion.textContent =
                `¿Estás seguro de eliminar el curso ${curso.nombre}?`;
        }
        if (modalEliminacion) {
            modalEliminacion.show();
        }
    });

    cuerpoTarjeta.append(titulo, descripcion, docente, aula, horario, plazas, botonEliminar);
    tarjeta.append(cuerpoTarjeta);
    columna.append(tarjeta);

    return columna;
}

function mostrarCursos(cursosAMostrar = cursos) {
    catalogoCursos.replaceChildren();

    if (cursosAMostrar.length === 0) {
        const mensaje = document.createElement('p');
        mensaje.className = 'col-12';
        mensaje.textContent = 'No hay cursos disponibles en este momento.';
        catalogoCursos.append(mensaje);
        return;
    }

    cursosAMostrar.forEach((curso) => {
        catalogoCursos.append(crearTarjetaCurso(curso));
    });
}

function mostrarError(mensajeError) {
    catalogoCursos.replaceChildren();

    const alerta = document.createElement('div');
    alerta.className = 'alert alert-danger col-12';
    alerta.setAttribute('role', 'alert');
    alerta.textContent = mensajeError;
    catalogoCursos.append(alerta);
}

function mostrarCursosFiltrados() {
    const textoBusqueda = busquedaCursos ? busquedaCursos.value.trim().toLowerCase() : '';
    const cursosFiltrados = cursos.filter((curso) => {
        return (curso.nombre && curso.nombre.toLowerCase().includes(textoBusqueda))
            || (curso.nombre_docente && curso.nombre_docente.toLowerCase().includes(textoBusqueda))
            || (curso.nombre_aula && curso.nombre_aula.toLowerCase().includes(textoBusqueda))
            || String(curso.id_curso).toLowerCase().includes(textoBusqueda);
    });

    mostrarCursos(cursosFiltrados);
}

// Carga los cursos desde el endpoint REST conectado a MariaDB
function cargarCursos() {
    fetch('/api/cursos')
        .then((r) => {
            if (!r.ok) {
                throw new Error('Error HTTP');
            }
            return r.json();
        })
        .then((datos) => {
            cursos = datos;
            mostrarCursos(cursos);
        })
        .catch(() => {
            mostrarError('No se pudo cargar el catálogo');
        });
}

if (borrarCurso) {
    borrarCurso.addEventListener('click', () => {
        const posicionCurso = cursos.findIndex((curso) => curso.id_curso === cursoPendienteEliminarId);

        if (posicionCurso === -1) {
            return;
        }

        cursos.splice(posicionCurso, 1);
        if (modalEliminacion) {
            modalEliminacion.hide();
        }
        mostrarCursosFiltrados();
    });
}

if (busquedaCursos) {
    busquedaCursos.addEventListener('input', () => {
        mostrarCursosFiltrados();
    });
}

if (altaCursoForm) {
    altaCursoForm.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!altaCursoForm.checkValidity()) {
            altaCursoForm.reportValidity();
            return;
        }

        const nuevoCurso = {
            id_curso: identificadorCurso.value.trim(),
            nombre: nombreCurso.value.trim(),
            descripcion: categoriaCurso.value.trim(),
            nombre_docente: 'Pendiente de asignar',
            nombre_aula: 'Pendiente de asignar',
            horario: `${duracionCurso.value} horas`,
            plazas: Number(plazasCurso.value),
            plazas_disponibles: Number(plazasCurso.value)
        };

        if (!nuevoCurso.id_curso || !nuevoCurso.nombre) {
            return;
        }

        cursos.push(nuevoCurso);
        mostrarCursos();
        altaCursoForm.reset();
    });
}

cargarCursos();