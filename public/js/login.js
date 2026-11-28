'use strict';

const loginForm = document.querySelector('#login-form');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');
const loginError = document.querySelector('#login-error');

function mostrarErrorLogin(mensaje) {
    if (!loginError) return;
    loginError.textContent = mensaje;
    loginError.classList.remove('d-none');
}

function ocultarErrorLogin() {
    if (!loginError) return;
    loginError.textContent = '';
    loginError.classList.add('d-none');
}

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        ocultarErrorLogin();

        if (!loginForm.checkValidity()) {
            loginForm.reportValidity();
            return;
        }

        const payload = {
            email: emailInput.value.trim(),
            password: passwordInput.value
        };

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                mostrarErrorLogin(data.error || 'Correo electrónico o contraseña incorrectos.');
                return;
            }

            window.location.href = '/';
        } catch (err) {
            console.error('Error al iniciar sesión:', err);
            mostrarErrorLogin('No se pudo conectar con el servidor.');
        }
    });
}