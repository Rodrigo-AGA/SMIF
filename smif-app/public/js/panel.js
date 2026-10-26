const message = document.getElementById('message');

const SECCIONES = {
  alumno: ['Mis tareas', 'Aulas virtuales', 'Resultados de pruebas', 'Pago de matrícula', 'Horarios', 'Ubicación'],
  docente: ['Mis aulas', 'Tareas asignadas', 'Registro de notas', 'Horarios', 'Ubicación']
};

async function cargarPanel() {
  const res = await api.perfil();
  if (res.status === 401) { window.location.href = 'login.html'; return; }
  if (!res.ok) { message.textContent = res.data.message; message.className = 'alert alert-danger'; return; }

  const u = res.data.data;
  document.getElementById('saludo').textContent = `Bienvenido, ${u.nombre}`;
  const badge = document.getElementById('rolBadge');
  badge.textContent = u.rol;
  badge.classList.replace('text-bg-secondary', u.rol === 'docente' ? 'text-bg-warning' : 'text-bg-primary');

  const set = (id, v) => { document.getElementById(id).textContent = v || '—'; };
  set('dDni', u.dni); set('dEmail', u.email); set('dCelular', u.celular);
  set('dNombre', [u.nombre, u.apellidos].filter(Boolean).join(' '));

  if (u.rol === 'alumno') {
    set('dCiclo', u.ciclo); set('dModalidad', u.modalidad);
    document.querySelectorAll('.only-alumno').forEach((el) => el.classList.remove('hidden'));
  } else {
    set('dEspecialidad', u.especialidad);
    document.querySelectorAll('.only-docente').forEach((el) => el.classList.remove('hidden'));
  }

  const grid = document.getElementById('secciones');
  (SECCIONES[u.rol] || []).forEach((nombre) => {
    const col = document.createElement('div');
    col.className = 'col-6 col-md-4';
    const card = document.createElement('div');
    card.className = 'card h-100 shadow-sm text-center';
    const body = document.createElement('div');
    body.className = 'card-body py-4';
    const h = document.createElement('h3'); h.className = 'h6 fw-bold mb-1'; h.textContent = nombre;
    const sm = document.createElement('small'); sm.className = 'text-muted'; sm.textContent = 'Próximamente';
    body.append(h, sm); card.appendChild(body); col.appendChild(card);
    grid.appendChild(col);
  });
}

document.getElementById('logoutButton').addEventListener('click', async () => {
  await api.logout();
  window.location.href = 'login.html';
});
cargarPanel();
