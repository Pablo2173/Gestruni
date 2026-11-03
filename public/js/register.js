'use strict';

const registroForm = document.querySelector('#registro-form');
const nombre = document.querySelector('#nombre');
const correo = document.querySelector('#correo');
const contrasena = document.querySelector('#contrasena');
const confirmacionContrasena = document.querySelector('#confirmacion-contrasena');
const registroMensaje = document.querySelector('#registro-mensaje');

// Comprueba que las contraseñas coinciden.
function contrasenyasIguales() {
    if (confirmacionContrasena.value !== contrasena.value) {
        confirmacionContrasena.setCustomValidity('Las contraseñas no coinciden.');
        return;
    }

    confirmacionContrasena.setCustomValidity('');
}

// Ambos campos deben actualizar la validación cuando cambia su valor.
contrasena.addEventListener('input', contrasenyasIguales);
confirmacionContrasena.addEventListener('input', contrasenyasIguales);

function mostrarError(campo) {
    const mensaje = document.querySelector(`#${campo.id}-error`);
    campo.classList.add('is-invalid');
    campo.setAttribute('aria-invalid', 'true');

    if (campo.validity.valueMissing) {
        mensaje.textContent = 'Este campo es obligatorio.';
    } else if (campo.validity.typeMismatch) {
        mensaje.textContent = 'Introduce un correo electrónico válido.';
    } else if (campo.validity.tooShort) {
        mensaje.textContent = `Debe tener al menos ${campo.minLength} caracteres.`;
    } else if (campo === confirmacionContrasena && campo.validity.customError) {
        mensaje.textContent = 'Las contraseñas no coinciden.';
    }
}

function limpiarError(campo) {
    campo.classList.remove('is-invalid');
    campo.removeAttribute('aria-invalid');
}

// Recupera los valores, valida el formulario y actualiza la página mediante el DOM.
registroForm.addEventListener('submit', (event) => {
    event.preventDefault();
    contrasenyasIguales();

    const nombreIntroducido = nombre.value.trim();
    const correoIntroducido = correo.value.trim();

    limpiarError(nombre);
    limpiarError(correo);
    limpiarError(contrasena);
    limpiarError(confirmacionContrasena);

    if (!nombre.validity.valid) {
        mostrarError(nombre);
    }

    if (!correo.validity.valid) {
        mostrarError(correo);
    }

    if (!contrasena.validity.valid) {
        mostrarError(contrasena);
    }

    if (!confirmacionContrasena.validity.valid) {
        mostrarError(confirmacionContrasena);
    }

    if (!registroForm.checkValidity()) {
        registroForm.reportValidity();
        return;
    }

    registroMensaje.textContent =
        `Registro completado para ${nombreIntroducido} (${correoIntroducido}).`;
    registroMensaje.className = 'mt-3 mb-0 text-success';
    //después de mostrar el mensaje de éxito, se limpia el formulario
    registroForm.reset();
});
