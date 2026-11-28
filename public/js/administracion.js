'use strict';

let adminActual = null;
let listaUsuarios = [];

const alertaAdmin = document.querySelector('#alerta-admin');
const cuerpoTablaUsuarios = document.querySelector('#cuerpo-tabla-usuarios');
const busquedaUsuarios = document.querySelector('#busqueda-usuarios');

const statCursos = document.querySelector('#stat-cursos');
const statUsuarios = document.querySelector('#stat-usuarios');
const statMatriculas = document.querySelector('#stat-matriculas');
const statRecursos = document.querySelector('#stat-recursos');

function mostrarAlerta(mensaje, tipo = 'danger') {
    if (!alertaAdmin) return;
    alertaAdmin.textContent = mensaje;
    alertaAdmin.className = `alert alert-${tipo} mb-4`;
}

function formatearFecha(fechaISO) {
    if (!fechaISO) return '-';
    return new Date(fechaISO).toLocaleDateString('es-ES');
}

async function cargarResumen() {
    try {
        const res = await fetch('/api/admin/resumen');
        if (!res.ok) return;
        const data = await res.json();

        if (statCursos) statCursos.textContent = data.total_cursos;
        if (statUsuarios) statUsuarios.textContent = data.total_usuarios;
        if (statMatriculas) statMatriculas.textContent = data.total_matriculas;
        if (statRecursos) statRecursos.textContent = `${data.total_docentes} / ${data.total_aulas}`;
    } catch (err) {
        console.error('Error cargando resumen admin:', err);
    }
}

function renderizarTablaUsuarios(filtrados = listaUsuarios) {
    cuerpoTablaUsuarios.replaceChildren();

    if (filtrados.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 8;
        td.className = 'text-center py-3 text-muted';
        td.textContent = 'No se encontraron usuarios.';
        tr.append(td);
        cuerpoTablaUsuarios.append(tr);
        return;
    }

    filtrados.forEach((u) => {
        const esMismoAdmin = adminActual && u.id_usuario === adminActual.id_usuario;
        const tr = document.createElement('tr');

        const tdId = document.createElement('td');
        tdId.textContent = u.id_usuario;

        const tdNombre = document.createElement('td');
        tdNombre.className = 'fw-semibold';
        tdNombre.textContent = u.nombre;
        if (esMismoAdmin) {
            const badgeYo = document.createElement('span');
            badgeYo.className = 'badge bg-secondary ms-2';
            badgeYo.textContent = 'Tú';
            tdNombre.append(badgeYo);
        }

        const tdEmail = document.createElement('td');
        tdEmail.textContent = u.email;

        const tdFecha = document.createElement('td');
        tdFecha.textContent = formatearFecha(u.fecha_registro);

        const tdMatriculas = document.createElement('td');
        tdMatriculas.textContent = u.matriculas_activas;

        const tdRol = document.createElement('td');
        const selectRol = document.createElement('select');
        selectRol.className = 'form-select form-select-sm';
        selectRol.setAttribute('aria-label', `Rol de ${u.nombre}`);
        selectRol.disabled = esMismoAdmin;

        const optAlumno = document.createElement('option');
        optAlumno.value = 'alumno';
        optAlumno.textContent = 'Alumno';

        const optAdmin = document.createElement('option');
        optAdmin.value = 'admin';
        optAdmin.textContent = 'Admin';

        selectRol.append(optAlumno, optAdmin);
        selectRol.value = u.rol;
        tdRol.append(selectRol);

        const tdEstado = document.createElement('td');
        const selectEstado = document.createElement('select');
        selectEstado.className = 'form-select form-select-sm';
        selectEstado.setAttribute('aria-label', `Estado de ${u.nombre}`);
        selectEstado.disabled = esMismoAdmin;

        const optActivo = document.createElement('option');
        optActivo.value = '1';
        optActivo.textContent = 'Activo';

        const optInactivo = document.createElement('option');
        optInactivo.value = '0';
        optInactivo.textContent = 'Inactivo';

        selectEstado.append(optActivo, optInactivo);
        selectEstado.value = u.activo ? '1' : '0';
        tdEstado.append(selectEstado);

        const tdAcciones = document.createElement('td');
        if (esMismoAdmin) {
            tdAcciones.className = 'text-muted small';
            tdAcciones.textContent = 'Sesión actual';
        } else {
            const btnGuardar = document.createElement('button');
            btnGuardar.type = 'button';
            btnGuardar.className = 'btn btn-outline-success btn-sm';
            btnGuardar.textContent = 'Guardar';
            btnGuardar.addEventListener('click', async () => {
                try {
                    const res = await fetch(`/api/admin/usuarios/${u.id_usuario}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            rol: selectRol.value,
                            activo: selectEstado.value === '1'
                        })
                    });
                    const data = await res.json();

                    if (!res.ok) {
                        mostrarAlerta(data.error || 'No se pudo actualizar el usuario.', 'danger');
                        return;
                    }

                    mostrarAlerta(`Permisos de ${u.nombre} actualizados correctamente.`, 'success');
                    await Promise.all([cargarUsuarios(), cargarResumen()]);
                } catch (err) {
                    console.error('Error actualizando usuario:', err);
                    mostrarAlerta('Error de conexión con el servidor.', 'danger');
                }
            });
            tdAcciones.append(btnGuardar);
        }

        tr.append(tdId, tdNombre, tdEmail, tdFecha, tdMatriculas, tdRol, tdEstado, tdAcciones);
        cuerpoTablaUsuarios.append(tr);
    });
}

function filtrarUsuarios() {
    const q = busquedaUsuarios ? busquedaUsuarios.value.trim().toLowerCase() : '';
    const filtrados = listaUsuarios.filter((u) => {
        return u.nombre.toLowerCase().includes(q)
            || u.email.toLowerCase().includes(q)
            || u.rol.toLowerCase().includes(q);
    });
    renderizarTablaUsuarios(filtrados);
}

async function cargarUsuarios() {
    try {
        const res = await fetch('/api/admin/usuarios');
        const data = await res.json();

        if (!res.ok) {
            mostrarAlerta(data.error || 'No se pudo cargar la lista de usuarios.');
            return;
        }

        listaUsuarios = data;
        filtrarUsuarios();
    } catch (err) {
        console.error('Error cargando usuarios:', err);
        mostrarAlerta('Error de conexión con el servidor.');
    }
}

if (busquedaUsuarios) {
    busquedaUsuarios.addEventListener('input', filtrarUsuarios);
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const resAuth = await fetch('/api/auth/me');
        if (!resAuth.ok) {
            window.location.href = './login.html';
            return;
        }
        const dataAuth = await resAuth.json();
        adminActual = dataAuth.usuario;

        if (!adminActual || adminActual.rol !== 'admin') {
            window.location.href = './index.html';
            return;
        }
    } catch {
        window.location.href = './login.html';
        return;
    }

    await Promise.all([cargarResumen(), cargarUsuarios()]);
});