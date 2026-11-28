'use strict';

let usuarioActual = null;
let listaMatriculas = [];
let cursosDisponibles = [];
let matriculaPendienteCancelar = null;

const alertaMatriculas = document.querySelector('#alerta-matriculas');
const tituloMatriculas = document.querySelector('#titulo-matriculas');
const seccionNuevaMatricula = document.querySelector('#seccion-nueva-matricula');
const formNuevaMatricula = document.querySelector('#form-nueva-matricula');
const selectCursoMatricula = document.querySelector('#select-curso-matricula');
const resumenCursoSeleccionado = document.querySelector('#resumen-curso-seleccionado');
const cabeceraTabla = document.querySelector('#cabecera-tabla-matriculas');
const cuerpoTabla = document.querySelector('#cuerpo-tabla-matriculas');
const busquedaMatriculas = document.querySelector('#busqueda-matriculas');

const modalCancelarEl = document.querySelector('#modal-cancelar-matricula');
const textoModalCancelar = document.querySelector('#texto-modal-cancelar');
const btnConfirmarCancelar = document.querySelector('#confirmar-cancelar-matricula');
const modalCancelar = modalCancelarEl ? new bootstrap.Modal(modalCancelarEl) : null;

function mostrarAlerta(mensaje, tipo = 'danger') {
    if (!alertaMatriculas) return;
    alertaMatriculas.textContent = mensaje;
    alertaMatriculas.className = `alert alert-${tipo} mb-3`;
}

function ocultarAlerta() {
    if (!alertaMatriculas) return;
    alertaMatriculas.className = 'd-none';
}

function formatearFecha(fechaISO) {
    if (!fechaISO) return '-';
    return new Date(fechaISO).toLocaleDateString('es-ES');
}

function actualizarResumenCurso() {
    if (!selectCursoMatricula || !resumenCursoSeleccionado) return;
    const idSeleccionado = Number(selectCursoMatricula.value);
    const curso = cursosDisponibles.find((c) => c.id_curso === idSeleccionado);

    if (!curso) {
        resumenCursoSeleccionado.textContent = '';
        return;
    }

    resumenCursoSeleccionado.textContent =
        `Docente: ${curso.nombre_docente} | Aula: ${curso.nombre_aula} | ` +
        `Fechas: ${formatearFecha(curso.fecha_inicio)} - ${formatearFecha(curso.fecha_fin)} | ` +
        `Plazas libres: ${curso.plazas_disponibles} de ${curso.plazas}`;
}

async function cargarCursosParaMatricular() {
    if (!usuarioActual || usuarioActual.rol !== 'alumno') return;

    try {
        const res = await fetch('/api/cursos');
        if (!res.ok) return;
        const todos = await res.json();

        cursosDisponibles = todos.filter(
            (c) => c.estado === 'activo' && Number(c.plazas_disponibles) > 0
        );

        selectCursoMatricula.replaceChildren();
        const optDefault = document.createElement('option');
        optDefault.value = '';
        optDefault.textContent = cursosDisponibles.length > 0
            ? 'Selecciona un curso...'
            : 'No hay cursos con plazas disponibles';
        selectCursoMatricula.append(optDefault);

        cursosDisponibles.forEach((c) => {
            const opt = document.createElement('option');
            opt.value = c.id_curso;
            opt.textContent = `${c.nombre} (${c.plazas_disponibles} plazas libres)`;
            selectCursoMatricula.append(opt);
        });

        // Preseleccionar si venimos desde detalles_cursos.html?id=X
        const params = new URLSearchParams(window.location.search);
        const cursoPreseleccionado = params.get('curso');
        if (cursoPreseleccionado) {
            selectCursoMatricula.value = cursoPreseleccionado;
        }
        actualizarResumenCurso();
    } catch (err) {
        console.error('Error cargando cursos disponibles:', err);
    }
}

function renderizarTablaMatriculas(filtradas = listaMatriculas) {
    const esAdmin = usuarioActual && usuarioActual.rol === 'admin';

    cabeceraTabla.replaceChildren();
    const columnas = esAdmin
        ? ['Alumno', 'Curso', 'Docente', 'Aula', 'Fechas', 'Fecha matrícula', 'Estado', 'Acciones']
        : ['Curso', 'Docente', 'Aula', 'Fechas', 'Fecha matrícula', 'Estado', 'Acciones'];

    columnas.forEach((col) => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.textContent = col;
        cabeceraTabla.append(th);
    });

    cuerpoTabla.replaceChildren();

    if (filtradas.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = columnas.length;
        td.className = 'text-center py-3 text-muted';
        td.textContent = 'No hay matrículas registradas.';
        tr.append(td);
        cuerpoTabla.append(tr);
        return;
    }

    filtradas.forEach((m) => {
        const tr = document.createElement('tr');

        if (esAdmin) {
            const tdAlumno = document.createElement('td');
            tdAlumno.textContent = `${m.nombre_alumno} (${m.email_alumno})`;
            tr.append(tdAlumno);
        }

        const tdCurso = document.createElement('td');
        const linkCurso = document.createElement('a');
        linkCurso.href = `./detalles_cursos.html?id=${encodeURIComponent(m.id_curso)}`;
        linkCurso.className = 'fw-semibold';
        linkCurso.textContent = m.nombre_curso;
        tdCurso.append(linkCurso);

        const tdDocente = document.createElement('td');
        tdDocente.textContent = m.nombre_docente;

        const tdAula = document.createElement('td');
        tdAula.textContent = m.nombre_aula;

        const tdFechas = document.createElement('td');
        tdFechas.textContent = `${formatearFecha(m.fecha_inicio)} - ${formatearFecha(m.fecha_fin)}`;

        const tdFechaMat = document.createElement('td');
        tdFechaMat.textContent = formatearFecha(m.fecha_matricula);

        const tdEstado = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = m.estado === 'activa' ? 'badge bg-success' : 'badge bg-secondary';
        badge.textContent = m.estado === 'activa' ? 'Activa' : 'Cancelada';
        tdEstado.append(badge);

        const tdAcciones = document.createElement('td');
        if (m.estado === 'activa') {
            const btnBaja = document.createElement('button');
            btnBaja.type = 'button';
            btnBaja.className = 'btn btn-outline-danger btn-sm';
            btnBaja.textContent = 'Cancelar matrícula';
            btnBaja.addEventListener('click', () => {
                matriculaPendienteCancelar = m.id_matricula;
                if (textoModalCancelar) {
                    textoModalCancelar.textContent =
                        `¿Confirmas la baja del curso "${m.nombre_curso}"?`;
                }
                if (modalCancelar) modalCancelar.show();
            });
            tdAcciones.append(btnBaja);
        } else {
            tdAcciones.textContent = '-';
        }

        tr.append(tdCurso, tdDocente, tdAula, tdFechas, tdFechaMat, tdEstado, tdAcciones);
        cuerpoTabla.append(tr);
    });
}

function filtrarMatriculas() {
    const texto = busquedaMatriculas ? busquedaMatriculas.value.trim().toLowerCase() : '';
    const filtradas = listaMatriculas.filter((m) => {
        return (m.nombre_curso && m.nombre_curso.toLowerCase().includes(texto))
            || (m.nombre_docente && m.nombre_docente.toLowerCase().includes(texto))
            || (m.nombre_alumno && m.nombre_alumno.toLowerCase().includes(texto))
            || (m.estado && m.estado.toLowerCase().includes(texto));
    });
    renderizarTablaMatriculas(filtradas);
}

async function cargarMatriculas() {
    try {
        const res = await fetch('/api/matriculas');
        const data = await res.json();

        if (!res.ok) {
            mostrarAlerta(data.error || 'No se pudieron cargar las matrículas.');
            return;
        }

        listaMatriculas = data;
        filtrarMatriculas();
    } catch (err) {
        console.error('Error al cargar matrículas:', err);
        mostrarAlerta('Error de conexión con el servidor.');
    }
}

if (selectCursoMatricula) {
    selectCursoMatricula.addEventListener('change', actualizarResumenCurso);
}

if (busquedaMatriculas) {
    busquedaMatriculas.addEventListener('input', filtrarMatriculas);
}

if (formNuevaMatricula) {
    formNuevaMatricula.addEventListener('submit', async (event) => {
        event.preventDefault();
        ocultarAlerta();

        const idCurso = Number(selectCursoMatricula.value);
        if (!idCurso) {
            mostrarAlerta('Debes seleccionar un curso disponible.', 'warning');
            return;
        }

        try {
            const res = await fetch('/api/matriculas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_curso: idCurso })
            });
            const data = await res.json();

            if (!res.ok) {
                mostrarAlerta(data.error || 'No se pudo completar la matrícula.', 'danger');
                return;
            }

            mostrarAlerta(data.mensaje, 'success');
            await Promise.all([cargarCursosParaMatricular(), cargarMatriculas()]);
        } catch (err) {
            console.error('Error al crear matrícula:', err);
            mostrarAlerta('Error de conexión con el servidor.', 'danger');
        }
    });
}

if (btnConfirmarCancelar) {
    btnConfirmarCancelar.addEventListener('click', async () => {
        if (!matriculaPendienteCancelar) return;

        try {
            const res = await fetch(`/api/matriculas/${matriculaPendienteCancelar}`, {
                method: 'DELETE'
            });
            const data = await res.json();

            if (modalCancelar) modalCancelar.hide();

            if (!res.ok) {
                mostrarAlerta(data.error || 'No se pudo cancelar la matrícula.', 'danger');
                return;
            }

            matriculaPendienteCancelar = null;
            mostrarAlerta(data.mensaje, 'success');
            await Promise.all([cargarCursosParaMatricular(), cargarMatriculas()]);
        } catch (err) {
            if (modalCancelar) modalCancelar.hide();
            console.error('Error al cancelar matrícula:', err);
            mostrarAlerta('Error de conexión con el servidor.', 'danger');
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const resAuth = await fetch('/api/auth/me');
        if (!resAuth.ok) {
            window.location.href = './login.html';
            return;
        }
        const dataAuth = await resAuth.json();
        usuarioActual = dataAuth.usuario;
    } catch {
        window.location.href = './login.html';
        return;
    }

    if (usuarioActual.rol === 'admin') {
        if (tituloMatriculas) tituloMatriculas.textContent = 'Gestión global de matrículas';
    } else {
        if (seccionNuevaMatricula) seccionNuevaMatricula.classList.remove('d-none');
        await cargarCursosParaMatricular();
    }

    await cargarMatriculas();
});