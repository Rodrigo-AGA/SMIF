// Contraseña de todos los usuarios de prueba: smif2026
const DEMO_PASSWORD = 'smif2026';
const MOCK_USUARIOS = [
  { id: 1, rol: 'alumno',  dni: '12345678', nombre: 'Ana',    apellidos: 'Torres Quispe',  email: 'ana.torres@correo.com',  celular: '987654321', ciclo: 'Ciclo 1', modalidad: 'presencial' },
  { id: 2, rol: 'alumno',  dni: '23456789', nombre: 'Luis',   apellidos: 'Quispe Mamani',  email: 'luis.quispe@correo.com', celular: '976543210', ciclo: 'Ciclo 2', modalidad: 'virtual' },
  { id: 3, rol: 'docente', dni: '34567890', nombre: 'María',  apellidos: 'Rojas Salas',    email: 'maria.rojas@smif.edu.pe', celular: '965432109', especialidad: 'Matemática' },
  { id: 4, rol: 'docente', dni: '45678901', nombre: 'Carlos', apellidos: 'Mendoza Ccori',  email: 'carlos.mendoza@smif.edu.pe', celular: '954321098', especialidad: 'Comunicación' }
];
const MOCK_SESSION_KEY = 'smif_mock_session';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const fail = (status, message) => ({ ok: false, status, data: { status: 'fail', message } });
const okRes = (status, data, message) => ({ ok: true, status, data: { status: 'success', message, data } });

async function mockRequest(method, path, body) {
  await wait(400);

  if (path === '/api/auth/login') {
    const u = MOCK_USUARIOS.find((x) => x.dni === body.dni && x.rol === body.rol);

    if (!u || body.password !== DEMO_PASSWORD) return fail(401, 'DNI o contraseña incorrectos');
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(u));
    return okRes(200, u, 'Login exitoso');
  }
  if (path === '/api/auth/logout') {
    localStorage.removeItem(MOCK_SESSION_KEY);
    return okRes(200, null, 'Sesión cerrada correctamente');
  }
  if (path === '/api/perfil') {
    const s = localStorage.getItem(MOCK_SESSION_KEY);
    return s ? okRes(200, JSON.parse(s)) : fail(401, 'Acceso no autorizado');
  }
  return fail(404, 'Ruta no encontrada');
}

async function apiRequest(method, path, body) {
  if (CONFIG.USE_MOCK) return mockRequest(method, path, body);
  try {
    const response = await fetch(CONFIG.API_URL + path, {
      method,
      credentials: 'include',          
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch (e) {
    return fail(0, 'No se pudo conectar con el servidor');
  }
}

const api = {
  login: (body) => apiRequest('POST', '/api/auth/login', body),
  logout: () => apiRequest('POST', '/api/auth/logout'),
  perfil: () => apiRequest('GET', '/api/perfil')
};

if (CONFIG.USE_MOCK) {
  document.addEventListener('DOMContentLoaded', () => {
    const b = document.createElement('div');
    b.className = 'demo-banner';
    b.textContent = 'Modo demo (sin servidor). Contraseña: smif2026 · Estudiante: 12345678 · Docente: 34567890';
    document.body.prepend(b);
  });
}
