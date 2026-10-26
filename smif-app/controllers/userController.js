const store = require('../data/userStore');

exports.getProfile = (req, res) => {
  const user = store.findById(req.session.userId);
  if (!user) {
    return res.status(401).json({ status: 'fail', message: 'Acceso no autorizado' });
  }
  return res.status(200).json({ status: 'success', data: store.publicUser(user) });
};

exports.getAlumnos = (req, res) => {
  const alumnos = store.listByRol('alumno').map(store.publicUser);
  return res.status(200).json({ status: 'success', results: alumnos.length, data: alumnos });
};
