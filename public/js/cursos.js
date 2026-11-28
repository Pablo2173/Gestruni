'use strict';

let cursos = [];
let soloPlazasLibres = false;
let cursoPendienteEliminarId = null;

const catalogoCursos = document.querySelector('#catalogo-cursos');
const altaCursoForm = document.querySelector('#alta-curso-form');
const altaCursoMensaje = document.querySelector('#alta-curso-mensaje');

const nombreCurso = document.querySelector('#curso-nombre');
const docenteCurso = document.querySelector('#curso-docente');
const aulaCurso = document.querySelector('#curso-aula');
const descripcionCurso = document.querySelector('#curso-descripcion');
const fechaInicioCurso = document.querySelector('#curso-fecha-inicio');
const fechaFinCurso = document.querySelector('#curso-fecha-fin');
const horarioCurso = document.querySelector('#curso-horario');
const plazasCurso = document.querySelector('#curso-plazas');
const imagenCurso = document.querySelector('#curso-imagen');

const busquedaCursosForm = document.querySelector('#busqueda-cursos');
const campoBusqueda = document.querySelector('#campo-busqueda');
const botonFiltrarPlazas = document.querySelector('#boton-filtrar-plazas');
const botonRestablecerFiltros = document.querySelector('#boton-restablecer-filtros');

const botonAltaCurso = document.querySelector('#boton-alta-curso');
const panelAltaCurso = document.querySelector('#panel-alta-curso');

const modalConfirmacion = document.querySelector('#confirmar-eliminar-modal');
const mensajeConfirmacion = document.querySelector('#texto-modal-eliminar');
const borrarCurso = document.querySelector('#confirmar-eliminar-boton');
const modalEliminacion = modalConfirmacion ? new bootstrap.Modal(modalConfirmacion) : null;

function esAdmin() {
    return Boolean(window.usuarioActual && window.usuarioActual.rol === 'admin');
}

if (panelAltaCurso && botonAltaCurso) {
    panelAltaCurso.addEventListener('shown.bs.collapse', () => {
        botonAltaCurso.classList.replace('border-success', 'border-secondary');
    });

    panelAltaCurso.addEventListener('hidden.bs.collapse', () => {
        botonAltaCurso.classList.replace('border-secondary', 'border-success');
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
    tarjeta.className = 'card card-hover h-100 overflow-hidden';

    if (curso.imagen) {
        const img = document.createElement('img');
        img.className = 'card-img-top';
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

    const contenedorBotones = document.createElement('div');
    contenedorBotones.className = 'd-flex flex-wrap gap-2 mt-auto pt-2';

    const enlaceDetalle = document.createElement('a');
    enlaceDetalle.className = 'btn border-success';
    enlaceDetalle.href = `/detalles_cursos?id=${encodeURIComponent(curso.id_curso)}`;
    enlaceDetalle.textContent = 'Ver detalle';
    contenedorBotones.append(enlaceDetalle);

    if (esAdmin()) {
        const botonEliminar = document.createElement('button');
        botonEliminar.className = 'btn border-danger';
        botonEliminar.type = 'button';
        botonEliminar.textContent = 'Desactivar';
        botonEliminar.addEventListener('click', () => {
            cursoPendienteEliminarId = curso.id_curso;
            if (mensajeConfirmacion) {
                mensajeConfirmacion.textContent =
                    `¿Estás seguro de desactivar el curso "${curso.nombre}"?`;
            }
            if (modalEliminacion) {
                modalEliminacion.show();
            }
        });
        contenedorBotones.append(botonEliminar);
    }

    cuerpoTarjeta.append(titulo, descripcion, docente, aula, fechas, horario, plazas, contenedorBotones);
    tarjeta.append(cuerpoTarjeta);
    columna.append(tarjeta);

    return columna;
}

function mostrarCursos(cursosAMostrar = cursos) {
    if (!catalogoCursos) return;
    catalogoCursos.replaceChildren();

    if (cursosAMostrar.length === 0) {
        const mensaje = document.createElement('p');
        mensaje.className = 'col-12 text-muted';
        mensaje.textContent = 'No hay cursos disponibles con los filtros actuales.';
        catalogoCursos.append(mensaje);
        return;
    }

    cursosAMostrar.forEach((curso) => {
        catalogoCursos.append(crearTarjetaCurso(curso));
    });
}

function mostrarError(mensajeError) {
    if (!catalogoCursos) return;
    catalogoCursos.replaceChildren();

    const alerta = document.createElement('div');
    alerta.className = 'alert alert-danger col-12';
    alerta.setAttribute('role', 'alert');
    alerta.textContent = mensajeError;
    catalogoCursos.append(alerta);
}

function mostrarCursosFiltrados() {
    const textoBusqueda = campoBusqueda ? campoBusqueda.value.trim().toLowerCase() : '';
    const cursosFiltrados = cursos.filter((curso) => {
        const coincideTexto = (curso.nombre && curso.nombre.toLowerCase().includes(textoBusqueda))
            || (curso.nombre_docente && curso.nombre_docente.toLowerCase().includes(textoBusqueda))
            || (curso.nombre_aula && curso.nombre_aula.toLowerCase().includes(textoBusqueda))
            || String(curso.id_curso).includes(textoBusqueda);

        const coincidePlazas = !soloPlazasLibres || Number(curso.plazas_disponibles) > 0;

        return coincideTexto && coincidePlazas;
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
            mostrarError('No se pudo cargar el catálogo de cursos.');
        });
}

function cargarOpcionesFormulario() {
    if (!docenteCurso || !aulaCurso || !esAdmin()) return;

    fetch('/api/cursos/opciones')
        .then((r) => {
            if (!r.ok) throw new Error('Error al cargar opciones');
            return r.json();
        })
        .then(({ docentes, aulas }) => {
            docenteCurso.replaceChildren();
            const optDocDefault = document.createElement('option');
            optDocDefault.value = '';
            optDocDefault.textContent = 'Selecciona un docente...';
            docenteCurso.append(optDocDefault);

            docentes.forEach((docente) => {
                const option = document.createElement('option');
                option.value = docente.id_docente;
                option.textContent = `${docente.nombre} (${docente.especialidad})`;
                docenteCurso.append(option);
            });

            aulaCurso.replaceChildren();
            const optAulaDefault = document.createElement('option');
            optAulaDefault.value = '';
            optAulaDefault.textContent = 'Selecciona un aula...';
            aulaCurso.append(optAulaDefault);

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

if (busquedaCursosForm) {
    busquedaCursosForm.addEventListener('submit', (e) => e.preventDefault());
}

if (campoBusqueda) {
    campoBusqueda.addEventListener('input', mostrarCursosFiltrados);
}

if (botonFiltrarPlazas) {
    botonFiltrarPlazas.addEventListener('click', () => {
        soloPlazasLibres = !soloPlazasLibres;
        botonFiltrarPlazas.classList.toggle('active', soloPlazasLibres);
        botonFiltrarPlazas.textContent = soloPlazasLibres
            ? 'Mostrando con plazas libres'
            : 'Solo con plazas libres';
        mostrarCursosFiltrados();
    });
}

if (botonRestablecerFiltros) {
    botonRestablecerFiltros.addEventListener('click', () => {
        if (campoBusqueda) campoBusqueda.value = '';
        soloPlazasLibres = false;
        if (botonFiltrarPlazas) {
            botonFiltrarPlazas.classList.remove('active');
            botonFiltrarPlazas.textContent = 'Solo con plazas libres';
        }
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
                if (altaCursoMensaje) {
                    altaCursoMensaje.className = 'mt-3 mb-0 alert alert-success';
                    altaCursoMensaje.textContent = 'Curso creado correctamente.';
                }
                cargarCursos();
            })
            .catch((err) => {
                if (altaCursoMensaje) {
                    altaCursoMensaje.className = 'mt-3 mb-0 alert alert-danger';
                    altaCursoMensaje.textContent = err.message;
                }
            });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
            const data = await res.json();
            window.usuarioActual = data.usuario;
        } else {
            window.usuarioActual = null;
        }
    } catch {
        window.usuarioActual = null;
    }

    cargarOpcionesFormulario();
    cargarCursos();
});