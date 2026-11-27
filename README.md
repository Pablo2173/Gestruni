# Gestruni - Aplicación Web para la gestión de un centro de formación

Aplicación web desarrollada con Node.js y Express para la gestión de un centro de formación.

## Estructura del proyecto

* `server.js`: Punto de entrada que arranca el servidor HTTP en el puerto configurado (por defecto, `3000`).
* `app.js`: Configuración base de la aplicación en Express y servicio de recursos estáticos y vistas HTML.
* `public/`: Recursos estáticos del frontend (`css/` con Bootstrap y estilos propios, y `js/` con la lógica de cliente como `cursos.js`).
* `views/`: Vistas HTML de la aplicación (`index.html`, `cursos.html`, `login.html`, `register.html`, etc.).
* `package.json` y `package-lock.json`: Configuración del proyecto Node.js, scripts de ejecución y gestión de dependencias (`express` y `nodemon`).


## Instalación

**Como requisito previo habría que tener instalado Node.js**
1. Clonar el repositorio y entrar en la carpeta del proyecto:
   https://github.com/Pablo2173/Gestruni


2. Instalar automáticamente todas las dependencias definidas en `package.json`:
  
   `npm install`


## Ejecución

Modo normal:
  `npm start`


Modo desarrollo (reinicio automático al guardar cambios):
  `npm run dev`

Una vez iniciado el servidor, abre el navegador en `http://localhost:3000` (o `http://localhost:3000/cursos.html`).