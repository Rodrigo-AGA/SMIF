const userStore = require('../data/userStore');
const claseStore = require('../data/claseStore');
const { MAX_ALUMNOS } = claseStore;

const nombreCompleto = (u) => `${u.nombre} ${u.apellidos}`;

// Vista para el docente: incluye la lista de alumnos
const vistaDocente = (c) => ({
  id: c.id,
  nombre: c.nombre,
  cupo: MAX_ALUMNOS,
  total: c.alumnoIds.length,
  alumnos: c.alumnoIds
    .map((id) => userStore.findById(id))
    .filter(Boolean)
    .map((a) => ({ id: a.id, nombre: a.nombre, apellidos: a.apellidos, dni: a.dni }))
});

// Vista para el alumno: solo clase y profesor (sin datos de compañeros)
const vistaAlumno = (c) => {
  const d = userStore.findById(c.docenteId);
  return {
    id: c.id,
    nombre: c.nombre,
    docente: d ? nombreCompleto(d) : 'Sin asignar',
    especialidad: d ? d.especialidad : undefined
  };
};

const fail = (res, status, message) => res.status(status).json({ status: 'fail', message });

// Devuelve la clase solo si pertenece al docente de la sesión
const claseDelDocente = (req, res) => {
  const clase = claseStore.findById(Number(req.params.id));
  if (!clase) { fail(res, 404, 'Clase no encontrada'); return null; }
  if (clase.docenteId !== req.session.userId) { fail(res, 403, 'Esta clase no es tuya'); return null; }
  return clase;
};

exports.mias = (req, res) => {
  const { userId, rol } = req.session;
  const data = rol === 'docente'
    ? claseStore.byDocente(userId).map(vistaDocente)
    : claseStore.byAlumno(userId).map(vistaAlumno);
  return res.status(200).json({ status: 'success', rol, data });
};

exports.crear = (req, res) => {
  const nombre = typeof req.body?.nombre === 'string' ? req.body.nombre.trim() : '';
  if (!nombre || nombre.length > 60) return fail(res, 400, 'El nombre de la clase es obligatorio (máx. 60 caracteres)');
  const clase = claseStore.add({ docenteId: req.session.userId, nombre });
  return res.status(201).json({ status: 'success', message: 'Clase creada', data: vistaDocente(clase) });
};

exports.eliminarClase = (req, res) => {
  const clase = claseDelDocente(req, res);
  if (!clase) return;
  claseStore.remove(clase.id);
  return res.status(200).json({ status: 'success', message: 'Clase eliminada' });
};

exports.agregarAlumno = (req, res) => {
  const clase = claseDelDocente(req, res);
  if (!clase) return;
  const alumnoId = Number(req.body?.alumnoId);
  const alumno = userStore.findById(alumnoId);
  if (!alumno || alumno.rol !== 'alumno') return fail(res, 404, 'Alumno no encontrado');
  if (clase.alumnoIds.includes(alumnoId)) return fail(res, 409, 'El alumno ya está en esta clase');
  if (clase.alumnoIds.length >= MAX_ALUMNOS) return fail(res, 409, `La clase está llena (máximo ${MAX_ALUMNOS} alumnos)`);
  clase.alumnoIds.push(alumnoId);
  return res.status(200).json({ status: 'success', message: 'Alumno agregado', data: vistaDocente(clase) });
};

exports.quitarAlumno = (req, res) => {
  const clase = claseDelDocente(req, res);
  if (!clase) return;
  const alumnoId = Number(req.params.alumnoId);
  if (!clase.alumnoIds.includes(alumnoId)) return fail(res, 404, 'El alumno no está en esta clase');
  clase.alumnoIds = clase.alumnoIds.filter((id) => id !== alumnoId);
  return res.status(200).json({ status: 'success', message: 'Alumno eliminado de la clase', data: vistaDocente(clase) });
};
