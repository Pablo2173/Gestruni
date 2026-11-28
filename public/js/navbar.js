'use strict';

const CLAVE_ACCESIBILIDAD = 'gestruni_accesibilidad';

function obtenerPreferenciasAccesibilidad() {
    try {
        const guardado = localStorage.getItem(CLAVE_ACCESIBILIDAD);
        if (guardado) {
            return JSON.parse(guardado);
        }
    } catch {
        localStorage.removeItem(CLAVE_ACCESIBILIDAD);
    }
    return {
        tema: 'light',
        escala: '1',
        lecturaComoda: false
    };
}

function aplicarPreferenciasAccesibilidad(prefs) {
    const html = document.documentElement;
    const body = document.body;

    if (!prefs || prefs.tema === 'light') {
        html.removeAttribute('data-theme');
    } else {
        html.setAttribute('data-theme', prefs.tema);
    }

    if (body) {
        body.style.fontSize = `${prefs?.escala || '1'}em`;
        body.classList.toggle('reading-mode', Boolean(prefs?.lecturaComoda));
    }
}

aplicarPreferenciasAccesibilidad(obtenerPreferenciasAccesibilidad());

document.addEventListener('DOMContentLoaded', async () => {
    aplicarPreferenciasAccesibilidad(obtenerPreferenciasAccesibilidad());

    let usuario = null;
    try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
            const data = await res.json();
            usuario = data.usuario;
        }
    } catch (err) {
        console.error('Error comprobando sesión:', err);
    }

    window.usuarioActual = usuario;

    const botonAltaCurso = document.querySelector('#boton-alta-curso');
    if (botonAltaCurso) {
        botonAltaCurso.classList.toggle('d-none', !usuario || usuario.rol !== 'admin');
    }
});