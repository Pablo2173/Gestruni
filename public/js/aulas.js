'use strict';

let listaAulas = [];

const contenedorAulas = document.querySelector('#listado-aulas');
const busquedaAulas = document.querySelector('#busqueda-aulas');

function crearTarjetaAula(aula) {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-xl-4';

    const card = document.createElement('article');
    card.className = 'card card-hover h-100';

    const body = document.createElement('div');
    body.className = 'card-body d-flex flex-column';

    const cabecera = document.createElement('div');
    cabecera.className = 'd-flex justify-content-between align-items-start gap-2 mb-2';

    const titulo = document.createElement('h3');
    titulo.className = 'card-title h5 mb-0';
    titulo.textContent = aula.nombre;

    const badgeCapacidad = document.createElement('span');
    badgeCapacidad.className = 'badge bg-success';
    badgeCapacidad.textContent = `Capacidad: ${aula.capacidad}`;

    cabecera.append(titulo, badgeCapacidad);

    const pUbicacion = document.createElement('p');
    pUbicacion.className = 'mb-2';
    const strongUbicacion = document.createElement('strong');
    strongUbicacion.textContent = 'Ubicación: ';
    const plantaTexto = aula.planta === 0 ? 'Planta baja' : `Planta ${aula.planta}`;
    pUbicacion.append(strongUbicacion, document.createTextNode(`${aula.edificio} · ${plantaTexto}`));

    const pEquip = document.createElement('p');
    pEquip.className = 'text-muted mb-3';
    const strongEquip = document.createElement('strong');
    strongEquip.textContent = 'Equipamiento: ';
    pEquip.append(strongEquip, document.createTextNode(aula.equipamiento || 'Equipamiento estándar'));

    const bloqueCursos = document.createElement('div');
    bloqueCursos.className = 'mt-auto pt-2 border-top';

    const tituloCursos = document.createElement('p');
    tituloCursos.className = 'fw-semibold small text-uppercase text-muted mb-2';
    tituloCursos.textContent = `Cursos asignados (${aula.cursos.length})`;
    bloqueCursos.append(tituloCursos);

    if (aula.cursos.length === 0) {
        const sinCursos = document.createElement('p');
        sinCursos.className = 'small text-muted mb-0';
        sinCursos.textContent = 'Sin cursos activos asignados.';
        bloqueCursos.append(sinCursos);
    } else {
        const lista = document.createElement('ul');
        lista.className = 'list-unstyled mb-0';
        aula.cursos.forEach((curso) => {
            const li = document.createElement('li');
            li.className = 'mb-1';
            const link = document.createElement('a');
            link.href = `./detalles_cursos.html?id=${encodeURIComponent(curso.id_curso)}`;
            link.textContent = `• ${curso.nombre}`;
            if (curso.horario) {
                link.append(document.createTextNode(` (${curso.horario})`));
            }
            li.append(link);
            lista.append(li);
        });
        bloqueCursos.append(lista);
    }

    body.append(cabecera, pUbicacion, pEquip, bloqueCursos);
    card.append(body);
    col.append(card);
    return col;
}

function renderizarAulas(filtradas = listaAulas) {
    contenedorAulas.replaceChildren();

    if (filtradas.length === 0) {
        const msg = document.createElement('p');
        msg.className = 'col-12 text-muted';
        msg.textContent = 'No se encontraron aulas con ese criterio.';
        contenedorAulas.append(msg);
        return;
    }

    filtradas.forEach((aula) => {
        contenedorAulas.append(crearTarjetaAula(aula));
    });
}

function filtrarAulas() {
    const q = busquedaAulas ? busquedaAulas.value.trim().toLowerCase() : '';
    const filtradas = listaAulas.filter((a) => {
        const coincideCurso = a.cursos.some((c) => c.nombre.toLowerCase().includes(q));
        return a.nombre.toLowerCase().includes(q)
            || a.edificio.toLowerCase().includes(q)
            || (a.equipamiento && a.equipamiento.toLowerCase().includes(q))
            || coincideCurso;
    });
    renderizarAulas(filtradas);
}

if (busquedaAulas) {
    busquedaAulas.addEventListener('input', filtrarAulas);
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/aulas');
        if (!res.ok) throw new Error('Error HTTP');
        listaAulas = await res.json();
        filtrarAulas();
    } catch (err) {
        console.error('Error cargando aulas:', err);
        contenedorAulas.replaceChildren();
        const alerta = document.createElement('div');
        alerta.className = 'alert alert-danger col-12';
        alerta.textContent = 'No se pudo cargar el listado de aulas.';
        contenedorAulas.append(alerta);
    }
});