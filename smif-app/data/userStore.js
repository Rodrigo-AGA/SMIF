const users = [
];
let nextId = 1;

const publicUser = (u) => ({
  id: u.id,
  rol: u.rol,
  nombre: u.nombre,
  apellidos: u.apellidos,
  dni: u.dni,
  email: u.email,
  celular: u.celular,
  ciclo: u.ciclo,
  modalidad: u.modalidad,
  especialidad: u.especialidad
});

module.exports = {
  publicUser,
  add(data) {
    const user = { id: nextId++, ...data };
    users.push(user);
    return user;
  },
  findByDniRol: (dni, rol) => users.find((u) => u.dni === dni && u.rol === rol),
  findByDni: (dni) => users.find((u) => u.dni === dni),
  findByEmail: (email) => users.find((u) => u.email === email),
  findById: (id) => users.find((u) => u.id === id),
  listByRol: (rol) => users.filter((u) => u.rol === rol)
};
