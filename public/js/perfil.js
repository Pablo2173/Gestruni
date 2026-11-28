'use strict';

const alertaPerfil = document.querySelector('#alerta-perfil');
const badgeRol = document.querySelector('#perfil-badge-rol');
const textoNombre = document.querySelector('#perfil-texto-nombre');
const textoEmail = document.querySelector('#perfil-texto-email');
const textoFecha = document.querySelector('#perfil-texto-fecha');
const textoEstado = document.querySelector('#perfil-texto-estado');
const textoActividad = document.querySelector('#texto-actividad-perfil');
const accesosRapidos = document.querySelector('#accesos-rapidos-perfil');

const formEditarPerfil = document.querySelector('#form-editar-perfil');
const inputNombre = document.querySelector('#input-perfil-nombre');
const inputEmail = document.querySelector('#input-perfil-email');
const inputPassword = document.querySelector('#input-perfil-password');

function mostrarAlerta(mensaje, tipo = 'danger') {
    if (!alertaPerfil) return;
    alertaPerfil.textContent = mensaje;
    alertaPerfil.className = `alert alert-${tipo} mb-4`;
}

function formatearFecha(fechaISO) {
    if (!fechaISO) return 'No disponible';
    return new Date(fechaISO).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function pintarDatosPerfil(perfil) {
    if (badgeRol) {
        badgeRol.textContent = perfil.rol === 'admin' ? 'Administrador' : 'Alumno';
    }
    if (textoNombre) textoNombre.textContent = perfil.nombre;
    if (textoEmail) textoEmail.textContent = perfil.email;
    if (textoFecha) textoFecha.textContent = formatearFecha(perfil.fecha_registro);
    if (textoEstado) textoEstado.textContent = perfil.activo ? 'Activa' : 'Inactiva';

    if (inputNombre) inputNombre.value = perfil.nombre;
    if (inputEmail) inputEmail.value = perfil.email;
    if (inputPassword) inputPassword.value = '';
}

async function cargarResumenActividad(rol) {
    if (!textoActividad || !accesosRapidos) return;
    accesosRapidos.replaceChildren();

    try {
        const resMat = await fetch('/api/matriculas');
        const matriculas = resMat.ok ? await resMat.json() : [];

        if (rol === 'alumno') {
            const activas = matriculas.filter((m) => m.estado === 'activa').length;
            const canceladas = matriculas.filter((m) => m.estado === 'cancelada').length;
            textoActividad.textContent =
                `Actualmente tienes ${activas} matrícula(s) activa(s) y ${canceladas} cancelada(s).`;

            const btnMat = document.createElement('a');
            btnMat.href = './matriculas.html';
            btnMat.className = 'btn btn-outline-success btn-sm';
            btnMat.textContent = 'Gestionar mis matrículas';
            accesosRapidos.append(btnMat);
        } else {
            const activas = matriculas.filter((m) => m.estado === 'activa').length;
            textoActividad.textContent =
                `En el sistema hay actualmente ${activas} matrícula(s) activa(s) gestionadas.`;

            const btnAdmin = document.createElement('a');
            btnAdmin.href = './administracion.html';
            btnAdmin.className = 'btn btn-outline-success btn-sm';
            btnAdmin.textContent = 'Ir al panel de administración';
            accesosRapidos.append(btnAdmin);
        }
    } catch {
        textoActividad.textContent = 'No se pudo cargar el resumen de actividad.';
    }
}

if (formEditarPerfil) {
    formEditarPerfil.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!formEditarPerfil.checkValidity()) {
            formEditarPerfil.reportValidity();
            return;
        }

        const payload = {
            nombre: inputNombre.value.trim(),
            email: inputEmail.value.trim(),
            password: inputPassword.value.trim()
        };

        try {
            const res = await fetch('/api/auth/perfil', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!res.ok) {
                mostrarAlerta(data.error || 'No se pudo actualizar el perfil.', 'danger');
                return;
            }

            pintarDatosPerfil(data.perfil);
            sessionStorage.setItem('gestruni_user', JSON.stringify(data.usuario));
            if (typeof aplicarPermisosNavbar === 'function') {
                aplicarPermisosNavbar(data.usuario);
            }
            mostrarAlerta(data.mensaje, 'success');
        } catch (err) {
            console.error('Error al actualizar perfil:', err);
            mostrarAlerta('Error de conexión con el servidor.', 'danger');
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/auth/perfil');
        if (res.status === 401) {
            window.location.href = './login.html';
            return;
        }
        const data = await res.json();
        if (!res.ok) {
            mostrarAlerta(data.error || 'No se pudo cargar tu perfil.');
            return;
        }

        pintarDatosPerfil(data.perfil);
        await cargarResumenActividad(data.perfil.rol);
    } catch (err) {
        console.error('Error cargando perfil:', err);
        mostrarAlerta('Error de conexión con el servidor.');
    }
});