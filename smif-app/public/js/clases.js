(function () {
  const cont = document.getElementById('clases');

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };

  let aviso;
  const mostrarAviso = (texto, tipo = 'danger') => {
    if (!aviso) return;
    aviso.className = `alert alert-${tipo} py-2`;
    aviso.textContent = texto;
  };

  async function accion(promesa, okMsg) {
    const res = await promesa;
    if (res.status === 401) { window.location.href = 'login.html'; return; }
    await cargar();
    mostrarAviso(res.ok ? okMsg : (res.data.message || 'Error'), res.ok ? 'success' : 'danger');
  }

  // ---------- ALUMNO ----------
  function vistaAlumno(clases) {
    cont.replaceChildren(el('h2', 'h5 fw-bold mb-3', 'Mi clase y profesor'));
    if (!clases.length) {
      cont.appendChild(el('div', 'alert alert-secondary', 'Aún no te han asignado a ninguna clase.'));
      return;
    }
    const row = el('div', 'row g-3');
    clases.forEach((c) => {
      const col = el('div', 'col-md-6');
      const card = el('div', 'card shadow-sm h-100');
      const body = el('div', 'card-body');
      body.append(
        el('h3', 'h6 fw-bold mb-1', c.nombre),
        el('div', 'text-muted', `Profesor: ${c.docente}`)
      );
      if (c.especialidad) body.appendChild(el('small', 'text-muted', `Especialidad: ${c.especialidad}`));
      card.appendChild(body); col.appendChild(card); row.appendChild(col);
    });
    cont.appendChild(row);
  }

  // ---------- DOCENTE ----------
  function formCrear() {
    const form = el('form', 'd-flex gap-2 mb-3');
    const input = el('input', 'form-control');
    input.placeholder = 'Nombre de la nueva clase (ej. Matemática - Ciclo 1)';
    input.maxLength = 60;
    const btn = el('button', 'btn btn-smif-azul', 'Crear clase');
    btn.type = 'submit';
    form.append(input, btn);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = input.value.trim();
      if (!nombre) return mostrarAviso('Escribe un nombre para la clase');
      accion(api.crearClase({ nombre }), 'Clase creada');
    });
    return form;
  }

  function tarjetaClase(c, todosAlumnos) {
    const card = el('div', 'card shadow-sm mb-3');
    const body = el('div', 'card-body');

    const head = el('div', 'd-flex justify-content-between align-items-center mb-2 flex-wrap gap-2');
    head.append(el('h3', 'h6 fw-bold mb-0', c.nombre));
    const right = el('div', 'd-flex align-items-center gap-2');
    right.appendChild(el('span', `badge ${c.total >= c.cupo ? 'text-bg-danger' : 'text-bg-primary'}`, `${c.total}/${c.cupo} alumnos`));
    const delClase = el('button', 'btn btn-outline-danger btn-sm', 'Eliminar clase');
    delClase.addEventListener('click', () => {
      if (confirm(`¿Confirmas eliminar la clase "${c.nombre}"? Se quitará a todos sus alumnos.`)) {
        accion(api.eliminarClase(c.id), 'Clase eliminada');
      }
    });
    right.appendChild(delClase);
    head.appendChild(right);
    body.appendChild(head);

    // Lista de alumnos
    if (!c.alumnos.length) {
      body.appendChild(el('p', 'text-muted small', 'Esta clase aún no tiene alumnos.'));
    } else {
      const ul = el('ul', 'list-group mb-3');
      c.alumnos.forEach((a) => {
        const li = el('li', 'list-group-item d-flex justify-content-between align-items-center');
        li.appendChild(el('span', '', `${a.nombre} ${a.apellidos} · DNI ${a.dni}`));
        const btn = el('button', 'btn btn-outline-danger btn-sm', 'Eliminar');
        btn.addEventListener('click', () => {
          if (confirm(`¿Confirmas eliminar a ${a.nombre} ${a.apellidos} de la clase "${c.nombre}"?`)) {
            accion(api.quitarAlumno(c.id, a.id), 'Alumno eliminado de la clase');
          }
        });
        li.appendChild(btn);
        ul.appendChild(li);
      });
      body.appendChild(ul);
    }

    // Agregar alumno
    const enClase = new Set(c.alumnos.map((a) => a.id));
    const disponibles = todosAlumnos.filter((a) => !enClase.has(a.id));
    if (c.total >= c.cupo) {
      body.appendChild(el('small', 'text-danger', 'La clase está llena (máximo 40 alumnos).'));
    } else if (disponibles.length) {
      const row = el('div', 'd-flex gap-2');
      const sel = el('select', 'form-select');
      disponibles.forEach((a) => {
        const o = el('option', '', `${a.nombre} ${a.apellidos} (${a.dni})`);
        o.value = a.id;
        sel.appendChild(o);
      });
      const add = el('button', 'btn btn-smif', 'Agregar alumno');
      add.addEventListener('click', () => accion(api.agregarAlumno(c.id, Number(sel.value)), 'Alumno agregado'));
      row.append(sel, add);
      body.appendChild(row);
    } else {
      body.appendChild(el('small', 'text-muted', 'No hay más alumnos registrados para agregar.'));
    }

    card.appendChild(body);
    return card;
  }

  async function vistaDocente(clases) {
    const resAl = await api.alumnos();
    const todos = resAl.ok ? resAl.data.data : [];
    cont.replaceChildren(el('h2', 'h5 fw-bold mb-3', 'Mis clases'), formCrear());
    aviso = el('div', 'd-none');
    cont.appendChild(aviso);
    if (!clases.length) {
      cont.appendChild(el('p', 'text-muted', 'Todavía no creaste ninguna clase.'));
    }
    clases.forEach((c) => cont.appendChild(tarjetaClase(c, todos)));
  }

  async function cargar() {
    const res = await api.clasesMias();
    if (res.status === 401) { window.location.href = 'login.html'; return; }
    if (!res.ok) { cont.textContent = res.data.message || 'No se pudieron cargar las clases'; return; }
    if (res.data.rol === 'docente') await vistaDocente(res.data.data);
    else vistaAlumno(res.data.data);
  }

  cargar();
})();
