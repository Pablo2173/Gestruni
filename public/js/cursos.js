'use strict';

let cursos = [];

const catalogoCursos = document.querySelector('#catalogo-cursos');
const altaCursoForm = document.querySelector('#alta-curso-form');

const nombreCurso = document.querySelector('#curso-nombre');
const docenteCurso = document.querySelector('#curso-docente');
const aulaCurso = document.querySelector('#curso-aula');
const descripcionCurso = document.querySelector('#curso-descripcion');
const fechaInicioCurso = document.querySelector('#curso-fecha-inicio');
const fechaFinCurso = document.querySelector('#curso-fecha-fin');
const horarioCurso = document.querySelector('#curso-horario');
const plazasCurso = document.querySelector('#curso-plazas');
const imagenCurso = document.querySelector('#curso-imagen');

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

function crearDatoCurso(etiqueta, valor) {
    const dato = document.createElement('p');
    dato.className = 'mb-2';

    const nombreDato = document.createElement('strong');
    nombreDato.textContent = `${etiqueta}: `;

    dato.append(nombreDato, document.createTextNode(valor ?? 'No disponible'));
    return dato;
}

function formatearFecha(fechaISO) {
    if (!fechaISO) return '';
    return new Date(fechaISO).toLocaleDateString('es-ES');
}

function construirRutaImagen(rutaRelativa) {
    if (!rutaRelativa) {
        return '/public/img/cursos/curso01.png';
    }
    if (rutaRelativa.startsWith('/public/') || rutaRelativa.startsWith('http')) {
        return rutaRelativa;
    }
    const rutaLimpia = rutaRelativa.replace(/^\/+/, '');
    return `/public/${rutaLimpia}`;
}

function crearTarjetaCurso(curso) {
    const columna = document.createElement('div');
    columna.className = 'col-12 col-md-6 col-xl-4';

    const tarjeta = document.createElement('article');
    tarjeta.className = 'card h-100 shadow-sm overflow-hidden';

    if (curso.imagen) {
        const img = document.createElement('img');
        img.className = 'card-img-top object-fit-cover';
        img.style.height = '180px';
        img.src = construirRutaImagen(curso.imagen);
        img.alt = `Imagen del curso ${curso.nombre}`;
        img.addEventListener('error', () => {
            img.remove();
        });
        tarjeta.append(img);
    }

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
    const fechas = crearDatoCurso(
        'Fechas',
        `${formatearFecha(curso.fecha_inicio)} - ${formatearFecha(curso.fecha_fin)}`
    );
    const horario = crearDatoCurso('Horario', curso.horario || 'Por determinar');
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
                `¿Estás seguro de desactivar el curso ${curso.nombre}?`;
        }
        if (modalEliminacion) {
            modalEliminacion.show();
        }
    });

    cuerpoTarjeta.append(titulo, descripcion, docente, aula, fechas, horario, plazas, botonEliminar);
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

function cargarCursos() {
    fetch('/api/cursos')
        .then((r) => {
            if (!r.ok) {
                throw new Error('Error HTTP');
            }
            return r.json();
        })
        .then((datos) => {
            cursos = datos.filter((curso) => curso.estado === 'activo');
            mostrarCursosFiltrados();
        })
        .catch(() => {
            mostrarError('No se pudo cargar el catálogo');
        });
}

function cargarOpcionesFormulario() {
    if (!docenteCurso || !aulaCurso) return;

    fetch('/api/cursos/opciones')
        .then((r) => {
            if (!r.ok) throw new Error('Error al cargar opciones');
            return r.json();
        })
        .then(({ docentes, aulas }) => {
            docentes.forEach((docente) => {
                const option = document.createElement('option');
                option.value = docente.id_docente;
                option.textContent = `${docente.nombre} (${docente.especialidad})`;
                docenteCurso.append(option);
            });

            aulas.forEach((aula) => {
                const option = document.createElement('option');
                option.value = aula.id_aula;
                option.textContent = `${aula.nombre} - ${aula.edificio} (Cap: ${aula.capacidad})`;
                aulaCurso.append(option);
            });
        })
        .catch((err) => {
            console.error(err);
        });
}

if (borrarCurso) {
    borrarCurso.addEventListener('click', () => {
        if (!cursoPendienteEliminarId) return;

        fetch(`/api/cursos/${cursoPendienteEliminarId}`, {
            method: 'DELETE'
        })
            .then(async (r) => {
                const data = await r.json();
                if (!r.ok) {
                    throw new Error(data.error || 'Error al desactivar el curso');
                }
                return data;
            })
            .then(() => {
                cursoPendienteEliminarId = null;
                if (modalEliminacion) {
                    modalEliminacion.hide();
                }
                cargarCursos();
            })
            .catch((err) => {
                if (modalEliminacion) {
                    modalEliminacion.hide();
                }
                alert(err.message);
            });
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
            nombre: nombreCurso.value.trim(),
            id_docente: Number(docenteCurso.value),
            id_aula: Number(aulaCurso.value),
            descripcion: descripcionCurso.value.trim(),
            fecha_inicio: fechaInicioCurso.value,
            fecha_fin: fechaFinCurso.value,
            horario: horarioCurso.value.trim(),
            plazas: Number(plazasCurso.value),
            imagen: imagenCurso.value.trim()
        };

        fetch('/api/cursos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoCurso)
        })
            .then(async (r) => {
                const data = await r.json();
                if (!r.ok) {
                    throw new Error(data.error || 'Error al crear el curso');
                }
                return data;
            })
            .then(() => {
                altaCursoForm.reset();
                cargarCursos();
            })
            .catch((err) => {
                alert(err.message);
            });
    });
}

cargarOpcionesFormulario();
cargarCursos();