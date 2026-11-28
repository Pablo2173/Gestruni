'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#registro-form');
    const nombreInput = document.querySelector('#nombre');
    const correoInput = document.querySelector('#correo');
    const contrasenaInput = document.querySelector('#contrasena');
    const confirmacionInput = document.querySelector('#confirmacion-contrasena');
    const mensajeStatus = document.querySelector('#registro-mensaje');

    if (!form) return;

    function mostrarMensaje(texto, esError = false) {
        if (!mensajeStatus) return;
        mensajeStatus.textContent = texto;
        mensajeStatus.className = esError
            ? 'mt-3 mb-0 alert alert-danger'
            : 'mt-3 mb-0 alert alert-success';
    }

    function validarFormularioCliente() {
        let valido = true;

        // Nombre
        if (nombreInput.value.trim().length < 2) {
            nombreInput.classList.add('is-invalid');
            valido = false;
        } else {
            nombreInput.classList.remove('is-invalid');
            nombreInput.classList.add('is-valid');
        }

        // Correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correoInput.value.trim())) {
            correoInput.classList.add('is-invalid');
            valido = false;
        } else {
            correoInput.classList.remove('is-invalid');
            correoInput.classList.add('is-valid');
        }

        // Contraseña (mínimo 8 caracteres, mayúscula, minúscula y número)
        const pass = contrasenaInput.value;
        const passFuerte = pass.length >= 8 && /[A-Z]/.test(pass) && /[a-z]/.test(pass) && /[0-9]/.test(pass);
        if (!passFuerte) {
            contrasenaInput.classList.add('is-invalid');
            const feedback = document.querySelector('#contrasena-error');
            if (feedback) {
                feedback.textContent = 'Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.';
            }
            valido = false;
        } else {
            contrasenaInput.classList.remove('is-invalid');
            contrasenaInput.classList.add('is-valid');
        }

        // Confirmación de contraseña
        if (!confirmacionInput.value || confirmacionInput.value !== pass) {
            confirmacionInput.classList.add('is-invalid');
            valido = false;
        } else {
            confirmacionInput.classList.remove('is-invalid');
            confirmacionInput.classList.add('is-valid');
        }

        return valido;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (mensajeStatus) {
            mensajeStatus.textContent = '';
            mensajeStatus.className = 'mt-3 mb-0';
        }

        if (!validarFormularioCliente()) {
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: nombreInput.value.trim(),
                    email: correoInput.value.trim(),
                    password: contrasenaInput.value,
                    confirmPassword: confirmacionInput.value
                })
            });

            const data = await response.json();

            if (!response.ok) {
                mostrarMensaje(data.error || 'No se pudo completar el registro.', true);
                return;
            }

            mostrarMensaje('Cuenta creada correctamente. Redirigiendo al inicio de sesión...', false);
            form.reset();
            setTimeout(() => {
                window.location.href = './login.html';
            }, 1200);
        } catch (err) {
            console.error('Error en registro:', err);
            mostrarMensaje('Error de conexión con el servidor.', true);
        }
    });
});