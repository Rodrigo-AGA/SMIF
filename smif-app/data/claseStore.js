const MAX_ALUMNOS = 40;
const clases = [];
let nextId = 1;

module.exports = {
  MAX_ALUMNOS,
  add: ({ docenteId, nombre }) => {
    const c = { id: nextId++, docenteId, nombre, alumnoIds: [] };
    clases.push(c);
    return c;
  },
  findById: (id) => clases.find((c) => c.id === id),
  byDocente: (docenteId) => clases.filter((c) => c.docenteId === docenteId),
  byAlumno: (alumnoId) => clases.filter((c) => c.alumnoIds.includes(alumnoId)),
  remove: (id) => {
    const i = clases.findIndex((c) => c.id === id);
    if (i >= 0) clases.splice(i, 1);
  }
};
