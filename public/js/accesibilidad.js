'use strict';

const formAccesibilidad = document.querySelector('#form-accesibilidad');
const selectEscalaFuente = document.querySelector('#select-escala-fuente');
const checkLecturaComoda = document.querySelector('#check-lectura-comoda');
const btnRestablecer = document.querySelector('#btn-restablecer-accesibilidad');
const alertaAccesibilidad = document.querySelector('#alerta-accesibilidad');

function mostrarAlerta(mensaje, tipo = 'success') {
    if (!alertaAccesibilidad) return;
    alertaAccesibilidad.textContent = mensaje;
    alertaAccesibilidad.className = `alert alert-${tipo} mb-4`;
}

function leerFormularioAccesibilidad() {
    const radioTema = document.querySelector('input[name="tema"]:checked');
    return {
        tema: radioTema ? radioTema.value : 'light',
        escala: selectEscalaFuente ? selectEscalaFuente.value : '1',
        lecturaComoda: checkLecturaComoda ? checkLecturaComoda.checked : false
    };
}

function rellenarFormularioAccesibilidad(prefs) {
    const radio = document.querySelector(`input[name="tema"][value="${prefs.tema || 'light'}"]`);
    if (radio) radio.checked = true;
    if (selectEscalaFuente) selectEscalaFuente.value = prefs.escala || '1';
    if (checkLecturaComoda) checkLecturaComoda.checked = Boolean(prefs.lecturaComoda);
}

function guardarYAplicar(prefs, notificar = false) {
    localStorage.setItem(CLAVE_ACCESIBILIDAD, JSON.stringify(prefs));
    aplicarPreferenciasAccesibilidad(prefs);
    if (notificar) {
        mostrarAlerta('Preferencias de accesibilidad guardadas y aplicadas a toda la aplicación.', 'success');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const prefsActuales = obtenerPreferenciasAccesibilidad();
    rellenarFormularioAccesibilidad(prefsActuales);
    aplicarPreferenciasAccesibilidad(prefsActuales);

    // Previsualización instantánea al cambiar cualquier control
    if (formAccesibilidad) {
        formAccesibilidad.addEventListener('change', () => {
            guardarYAplicar(leerFormularioAccesibilidad(), false);
        });

        formAccesibilidad.addEventListener('submit', (event) => {
            event.preventDefault();
            guardarYAplicar(leerFormularioAccesibilidad(), true);
        });
    }

    if (btnRestablecer) {
        btnRestablecer.addEventListener('click', () => {
            const porDefecto = {
                tema: 'light',
                escala: '1',
                lecturaComoda: false
            };
            rellenarFormularioAccesibilidad(porDefecto);
            guardarYAplicar(porDefecto, true);
        });
    }
});