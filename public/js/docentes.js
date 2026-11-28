'use strict';

let listaDocentes = [];

const contenedorDocentes = document.querySelector('#listado-docentes');
const busquedaDocentes = document.querySelector('#busqueda-docentes');

function construirRutaFoto(rutaRelativa) {
    if (!rutaRelativa) return null;
    if (rutaRelativa.startsWith('/public/') || rutaRelativa.startsWith('http')) {
        return rutaRelativa;
    }
    return `/public/${rutaRelativa.replace(/^\/+/, '')}`;
}

function crearTarjetaDocente(docente) {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-xl-4';

    const card = document.createElement('article');
    card.className = 'card card-hover h-100 overflow-hidden';

    const rutaFoto = construirRutaFoto(docente.foto);
    if (rutaFoto) {
        const img = document.createElement('img');
        img.className = 'card-img-top';
        img.src = rutaFoto;
        img.alt = `Fotografía de ${docente.nombre}`;
        img.addEventListener('error', () => {
            img.remove();
        });
        card.append(img);
    }

    const body = document.createElement('div');
    body.className = 'card-body d-flex flex-column';

    const titulo = document.createElement('h3');
    titulo.className = 'card-title h5 mb-1';
    titulo.textContent = docente.nombre;

    const especialidad = document.createElement('p');
    especialidad.className = 'text-success fw-semibold mb-3';
    especialidad.textContent = docente.especialidad;

    const pEmail = document.createElement('p');
    pEmail.className = 'mb-1';
    const strongEmail = document.createElement('strong');
    strongEmail.textContent = 'Correo: ';
    pEmail.append(strongEmail, document.createTextNode(docente.email));

    const pTel = document.createElement('p');
    pTel.className = 'mb-3';
    const strongTel = document.createElement('strong');
    strongTel.textContent = 'Teléfono: ';
    pTel.append(strongTel, document.createTextNode(docente.telefono || 'No disponible'));

    const bloqueCursos = document.createElement('div');
    bloqueCursos.className = 'mt-auto pt-2 border-top';

    const tituloCursos = document.createElement('p');
    tituloCursos.className = 'fw-semibold small text-uppercase text-muted mb-2';
    tituloCursos.textContent = `Cursos asignados (${docente.cursos.length})`;
    bloqueCursos.append(tituloCursos);

    if (docente.cursos.length === 0) {
        const sinCursos = document.createElement('p');
        sinCursos.className = 'small text-muted mb-0';
        sinCursos.textContent = 'Actualmente no imparte cursos activos.';
        bloqueCursos.append(sinCursos);
    } else {
        const lista = document.createElement('ul');
        lista.className = 'list-unstyled mb-0';
        docente.cursos.forEach((curso) => {
            const li = document.createElement('li');
            li.className = 'mb-1';
            const link = document.createElement('a');
            link.href = `./detalles_cursos.html?id=${encodeURIComponent(curso.id_curso)}`;
            link.textContent = `• ${curso.nombre}`;
            li.append(link);
            lista.append(li);
        });
        bloqueCursos.append(lista);
    }

    body.append(titulo, especialidad, pEmail, pTel, bloqueCursos);
    card.append(body);
    col.append(card);
    return col;
}

function renderizarDocentes(filtrados = listaDocentes) {
    contenedorDocentes.replaceChildren();

    if (filtrados.length === 0) {
        const msg = document.createElement('p');
        msg.className = 'col-12 text-muted';
        msg.textContent = 'No se encontraron docentes con ese criterio.';
        contenedorDocentes.append(msg);
        return;
    }

    filtrados.forEach((docente) => {
        contenedorDocentes.append(crearTarjetaDocente(docente));
    });
}

function filtrarDocentes() {
    const q = busquedaDocentes ? busquedaDocentes.value.trim().toLowerCase() : '';
    const filtrados = listaDocentes.filter((d) => {
        const coincideCurso = d.cursos.some((c) => c.nombre.toLowerCase().includes(q));
        return d.nombre.toLowerCase().includes(q)
            || d.especialidad.toLowerCase().includes(q)
            || d.email.toLowerCase().includes(q)
            || coincideCurso;
    });
    renderizarDocentes(filtrados);
}

if (busquedaDocentes) {
    busquedaDocentes.addEventListener('input', filtrarDocentes);
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/docentes');
        if (!res.ok) throw new Error('Error HTTP');
        listaDocentes = await res.json();
        filtrarDocentes();
    } catch (err) {
        console.error('Error cargando docentes:', err);
        contenedorDocentes.replaceChildren();
        const alerta = document.createElement('div');
        alerta.className = 'alert alert-danger col-12';
        alerta.textContent = 'No se pudo cargar el listado de docentes.';
        contenedorDocentes.append(alerta);
    }
});