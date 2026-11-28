'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    const main = document.querySelector('main');
    const mensaje = document.createElement('p');
    mensaje.className = 'alert alert-info mt-3';
    mensaje.textContent = 'Cerrando sesión...';
    if (main) main.append(mensaje);

    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        mensaje.className = 'alert alert-success mt-3';
        mensaje.textContent = 'Sesión cerrada correctamente. Redirigiendo a Inicio...';
    } catch (err) {
        console.error('Error al cerrar sesión:', err);
        mensaje.className = 'alert alert-warning mt-3';
        mensaje.textContent = 'Sesión finalizada localmente. Redirigiendo...';
    }

    setTimeout(() => {
        window.location.href = './index.html';
    }, 900);
});