'use strict';

const registroForm = document.querySelector('#registro-form');
const contrasena = document.querySelector('#contrasena');
const confirmacionContrasena = document.querySelector('#confirmacion-contrasena');
const registroMensaje = document.querySelector('#registro-mensaje');

//comprueba que las contraseñas coinciden
function contrasenyasIguales() {
    if (confirmacionContrasena.value !== contrasena.value) {
        confirmacionContrasena.setCustomValidity('Las contraseñas no coinciden.');
        return;
    }

    confirmacionContrasena.setCustomValidity('');
}

//ambos botones tienen que tener el mismo valor, se asignan eventListener
contrasena.addEventListener('input', contrasenyasIguales);
confirmacionContrasena.addEventListener('input', contrasenyasIguales);

//cuando se envía el formulario, se valida y se muestra un mensaje de éxito
registroForm.addEventListener('submit', (event) => {
    event.preventDefault();
    contrasenyasIguales();

    if (!registroForm.checkValidity()) {
        registroForm.classList.add('was-validated');
        registroForm.reportValidity();
        return;
    }

    registroMensaje.textContent = 'Formulario válido (se envía a la base de datos)';
    registroMensaje.className = 'mt-3 mb-0 text-success';
    registroForm.reset();
    registroForm.classList.remove('was-validated');
});
