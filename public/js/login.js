'use strict';

const loginForm = document.querySelector('#login-form');
const loginCorreo = document.querySelector('#login-correo');
const loginContrasena = document.querySelector('#login-contrasena');
const loginCorreoError = document.querySelector('#login-correo-error');
const loginContrasenaError = document.querySelector('#login-contrasena-error');

loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    loginCorreo.classList.remove('is-invalid');
    loginCorreo.removeAttribute('aria-invalid');
    loginContrasena.classList.remove('is-invalid');
    loginContrasena.removeAttribute('aria-invalid');

    if (!loginForm.checkValidity()) {
        if (loginCorreo.validity.typeMismatch) {
            loginCorreo.classList.add('is-invalid');
            loginCorreo.setAttribute('aria-invalid', 'true');
            loginCorreoError.textContent =
                'Introduce un correo electrónico válido.';
        }

        if (loginContrasena.validity.tooShort) {
            loginContrasena.classList.add('is-invalid');
            loginContrasena.setAttribute('aria-invalid', 'true');
            loginContrasenaError.textContent =
                'La contraseña debe tener al menos 8 caracteres.';
        }

        loginForm.reportValidity();
        return;
    }
});
