'use strict';

let cursoActual = null;
let usuarioSesion = null;

const contenedorDetalle = document.querySelector('#contenedor-detalle-curso');
const selectorCurso = document.querySelector('#selector-curso');
const breadcrumbCurso = document.querySelector('#breadcrumb-curso');
const tituloPaginaCurso = document.querySelector('#titulo-pagina-curso');
const botonEditarCurso = document.querySelector('#boton-editar-curso');
const editarCursoForm = document.querySelector('#editar-curso-form');
const editarCursoMensaje = document.querySelector('#editar-curso-mensaje');

function formatearFechaLarga(fechaISO) {
    if (!fechaISO) return 'No definida';
    return new Date(fechaISO).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatearFechaInput(fechaISO) {
    if (!fechaISO) return '';
    return new Date(fechaISO).toISOString().split('T')[0];
}

function construirRutaImagen(rutaRelativa) {
    if (!rutaRelativa) return '/public/img/cursos/curso01.png';
    if (rutaRelativa.startsWith('/public/') || rutaRelativa.startsWith('http')) {
        return rutaRelativa;
    }
    return `/public/${rutaRelativa.replace(/^\/+/, '')}`;
}

function crearFilaDato(etiqueta, valor) {
    const li = document.createElement('li');
    li.className = 'mb-2';
    const strong = document.createElement('strong');
    strong.textContent = `${etiqueta}: `;
    li.append(strong, document.createTextNode(valor ?? 'No disponible'));
    return li;
}

function renderizarDetalleCurso(curso) {
    cursoActual = curso;
    contenedorDetalle.replaceChildren();

    if (breadcrumbCurso) breadcrumbCurso.textContent = curso.nombre;
    if (tituloPaginaCurso) tituloPaginaCurso.textContent = curso.nombre;

    const card = document.createElement('article');
    card.className = 'card shadow-sm overflow-hidden';

    const row = document.createElement('div');
    row.className = 'row g-0';

    // Columna izquierda: Imagen y estado
    const colImg = document.createElement('div');
    colImg.className = 'col-lg-5 d-flex flex-column justify-content-between bg-light';

    const img = document.createElement('img');
    img.src = construirRutaImagen(curso.imagen);
    img.alt = `Imagen del curso ${curso.nombre}`;
    img.className = 'w-100 h-100 object-fit-cover';
    img.addEventListener('error', () => {
        img.src = '/public/img/cursos/curso01.png';
    });
    colImg.append(img);

    // Columna derecha: Toda la información estructurada
    const colInfo = document.createElement('div');
    colInfo.className = 'col-lg-7';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body p-4';

    const cabecera = document.createElement('div');
    cabecera.className = 'd-flex flex-wrap align-items-center justify-content-between gap-2 mb-3';

    const titulo = document.createElement('h3');
    titulo.className = 'h3 mb-0';
    titulo.textContent = curso.nombre;

    const badgeEstado = document.createElement('span');
    badgeEstado.className = curso.estado === 'activo'
        ? 'badge bg-success fs-6'
        : 'badge bg-secondary fs-6';
    badgeEstado.textContent = curso.estado === 'activo' ? 'Curso activo' : 'Curso inactivo';

    cabecera.append(titulo, badgeEstado);

    const descripcion = document.createElement('p');
    descripcion.className = 'lead fs-6 mb-4';
    descripcion.textContent = curso.descripcion || 'Este curso no dispone de descripción detallada.';

    // Bloques de información en dos columnas
    const gridDatos = document.createElement('div');
    gridDatos.className = 'row g-3 mb-4';

    // Bloque 1: Planificación y Plazas
    const colPlan = document.createElement('div');
    colPlan.className = 'col-md-6';
    const tituloPlan = document.createElement('h4');
    tituloPlan.className = 'h6 text-uppercase text-muted border-bottom pb-1';
    tituloPlan.textContent = 'Planificación y plazas';

    const listaPlan = document.createElement('ul');
    listaPlan.className = 'list-unstyled mb-0';
    listaPlan.append(
        crearFilaDato('Inicio', formatearFechaLarga(curso.fecha_inicio)),
        crearFilaDato('Finalización', formatearFechaLarga(curso.fecha_fin)),
        crearFilaDato('Horario', curso.horario || 'Por determinar'),
        crearFilaDato('Plazas disponibles', `${curso.plazas_disponibles} de ${curso.plazas} (${curso.matriculados} matriculados)`)
    );
    colPlan.append(tituloPlan, listaPlan);

    // Bloque 2: Docente y Aula
    const colRecursos = document.createElement('div');
    colRecursos.className = 'col-md-6';
    const tituloRecursos = document.createElement('h4');
    tituloRecursos.className = 'h6 text-uppercase text-muted border-bottom pb-1';
    tituloRecursos.textContent = 'Docente y aula asignados';

    const listaRecursos = document.createElement('ul');
    listaRecursos.className = 'list-unstyled mb-0';
    listaRecursos.append(
        crearFilaDato('Docente', curso.nombre_docente),
        crearFilaDato('Especialidad', curso.especialidad_docente),
        crearFilaDato('Contacto docente', curso.email_docente),
        crearFilaDato('Aula', `${curso.nombre_aula} (${curso.edificio_aula}, cap. ${curso.capacidad_aula})`)
    );
    colRecursos.append(tituloRecursos, listaRecursos);

    gridDatos.append(colPlan, colRecursos);

    // Botones de acción al pie
    const acciones = document.createElement('div');
    acciones.className = 'd-flex flex-wrap gap-2 pt-3 border-top';

    const btnVolver = document.createElement('a');
    btnVolver.href = './cursos.html';
    btnVolver.className = 'btn btn-outline-secondary';
    btnVolver.textContent = 'Volver al catálogo';
    acciones.append(btnVolver);

    if (!usuarioSesion) {
        const btnLogin = document.createElement('a');
        btnLogin.href = './login.html';
        btnLogin.className = 'btn btn-success';
        btnLogin.textContent = 'Inicia sesión para matricularte';
        acciones.append(btnLogin);
    } else if (usuarioSesion.rol === 'alumno') {
        const btnMatricular = document.createElement('a');
        btnMatricular.href = `./matriculas.html?curso=${encodeURIComponent(curso.id_curso)}`;
        if (curso.estado !== 'activo' || Number(curso.plazas_disponibles) <= 0) {
            btnMatricular.className = 'btn btn-secondary disabled';
            btnMatricular.textContent = 'Sin plazas disponibles';
        } else {
            btnMatricular.className = 'btn btn-success';
            btnMatricular.textContent = 'Matricularme en este curso';
        }
        acciones.append(btnMatricular);
    }

    cardBody.append(cabecera, descripcion, gridDatos, acciones);
    colInfo.append(cardBody);
    row.append(colImg, colInfo);
    card.append(row);
    contenedorDetalle.append(card);

    rellenarFormularioEdicion(curso);
}

function rellenarFormularioEdicion(curso) {
    if (!editarCursoForm) return;
    document.querySelector('#edit-nombre').value = curso.nombre || '';
    document.querySelector('#edit-docente').value = curso.id_docente || '';
    document.querySelector('#edit-aula').value = curso.id_aula || '';
    document.querySelector('#edit-descripcion').value = curso.descripcion || '';
    document.querySelector('#edit-fecha-inicio').value = formatearFechaInput(curso.fecha_inicio);
    document.querySelector('#edit-fecha-fin').value = formatearFechaInput(curso.fecha_fin);
    document.querySelector('#edit-horario').value = curso.horario || '';
    document.querySelector('#edit-plazas').value = curso.plazas || 1;
    document.querySelector('#edit-imagen').value = curso.imagen || '';
    document.querySelector('#edit-estado').value = curso.estado || 'activo';
}

async function cargarOpcionesAdmin() {
    if (!usuarioSesion || usuarioSesion.rol !== 'admin') return;

    if (botonEditarCurso) {
        botonEditarCurso.classList.remove('d-none');
    }

    try {
        const res = await fetch('/api/cursos/opciones');
        if (!res.ok) return;
        const { docentes, aulas } = await res.json();

        const selectDocente = document.querySelector('#edit-docente');
        const selectAula = document.querySelector('#edit-aula');

        selectDocente.replaceChildren();
        docentes.forEach((d) => {
            const opt = document.createElement('option');
            opt.value = d.id_docente;
            opt.textContent = `${d.nombre} (${d.especialidad})`;
            selectDocente.append(opt);
        });

        selectAula.replaceChildren();
        aulas.forEach((a) => {
            const opt = document.createElement('option');
            opt.value = a.id_aula;
            opt.textContent = `${a.nombre} - ${a.edificio} (Cap: ${a.capacidad})`;
            selectAula.append(opt);
        });
    } catch (err) {
        console.error('Error cargando docentes/aulas para edición:', err);
    }
}

async function cargarDetalleCurso(idCurso) {
    try {
        const res = await fetch(`/api/cursos/${encodeURIComponent(idCurso)}`);
        const data = await res.json();

        if (!res.ok) {
            contenedorDetalle.replaceChildren();
            const alerta = document.createElement('div');
            alerta.className = 'alert alert-danger';
            alerta.textContent = data.error || 'No se pudo cargar el detalle del curso.';
            contenedorDetalle.append(alerta);
            return;
        }

        renderizarDetalleCurso(data);
    } catch (err) {
        console.error('Error al obtener detalle del curso:', err);
        contenedorDetalle.textContent = 'Error de conexión al cargar el curso.';
    }
}

if (editarCursoForm) {
    editarCursoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!cursoActual) return;

        if (!editarCursoForm.checkValidity()) {
            editarCursoForm.reportValidity();
            return;
        }

        const payload = {
            nombre: document.querySelector('#edit-nombre').value.trim(),
            id_docente: Number(document.querySelector('#edit-docente').value),
            id_aula: Number(document.querySelector('#edit-aula').value),
            descripcion: document.querySelector('#edit-descripcion').value.trim(),
            fecha_inicio: document.querySelector('#edit-fecha-inicio').value,
            fecha_fin: document.querySelector('#edit-fecha-fin').value,
            horario: document.querySelector('#edit-horario').value.trim(),
            plazas: Number(document.querySelector('#edit-plazas').value),
            imagen: document.querySelector('#edit-imagen').value.trim(),
            estado: document.querySelector('#edit-estado').value
        };

        try {
            const res = await fetch(`/api/cursos/${cursoActual.id_curso}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!res.ok) {
                editarCursoMensaje.className = 'mt-3 mb-0 alert alert-danger';
                editarCursoMensaje.textContent = data.error || 'No se pudo actualizar el curso.';
                return;
            }

            editarCursoMensaje.className = 'mt-3 mb-0 alert alert-success';
            editarCursoMensaje.textContent = 'Curso actualizado correctamente.';
            await cargarDetalleCurso(cursoActual.id_curso);
        } catch (err) {
            console.error('Error en PUT /api/cursos:', err);
            editarCursoMensaje.className = 'mt-3 mb-0 alert alert-danger';
            editarCursoMensaje.textContent = 'Error de conexión con el servidor.';
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const resAuth = await fetch('/api/auth/me');
        if (resAuth.ok) {
            const dataAuth = await resAuth.json();
            usuarioSesion = dataAuth.usuario;
        }
    } catch {
        usuarioSesion = null;
    }

    await cargarOpcionesAdmin();

    // Cargamos la lista de cursos para el selector superior y resolvemos el ID a mostrar
    try {
        const resLista = await fetch('/api/cursos');
        const listaCursos = resLista.ok ? await resLista.json() : [];

        const params = new URLSearchParams(window.location.search);
        let idSeleccionado = Number(params.get('id'));

        if (selectorCurso) {
            selectorCurso.replaceChildren();
            listaCursos.forEach((c) => {
                const opt = document.createElement('option');
                opt.value = c.id_curso;
                opt.textContent = c.nombre;
                selectorCurso.append(opt);
            });

            if (!idSeleccionado && listaCursos.length > 0) {
                idSeleccionado = listaCursos[0].id_curso;
            }

            if (idSeleccionado) {
                selectorCurso.value = String(idSeleccionado);
            }

            selectorCurso.addEventListener('change', () => {
                const nuevoId = selectorCurso.value;
                window.history.replaceState({}, '', `?id=${encodeURIComponent(nuevoId)}`);
                cargarDetalleCurso(nuevoId);
            });
        }

        if (idSeleccionado) {
            await cargarDetalleCurso(idSeleccionado);
        } else {
            contenedorDetalle.textContent = 'No hay cursos disponibles para mostrar.';
        }
    } catch (err) {
        console.error('Error inicializando detalle de curso:', err);
    }
});